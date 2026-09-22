import { parse } from '@babel/parser';
import type { FinickyConfig } from '@browse-router/shared';
import { validateConfig } from '@browse-router/engine';

export class HermesConfigError extends Error {
  override readonly name = 'HermesConfigError';
}

/**
 * Hermes-safe config evaluator.
 *
 * The Phase-1 MVP supports configs that use ONLY literal values for
 * `defaultBrowser`, `match`, and `browser`. Function bodies in `url` and
 * `browser` are NOT supported in Hermes mode — see the README for why.
 *
 * For function-bodied rules, run `pnpm --filter engine test` on the dev
 * machine to verify behavior; the function form is parsed on the Node side
 * via `evaluateConfigForNode` in @browse-router/engine.
 *
 * The shape we accept:
 *
 *   export default {
 *     defaultBrowser: "com.android.chrome",
 *     rewrite: [
 *       { match: "x.com/*", url: "https://example.com" },   // string replace
 *     ],
 *     handlers: [
 *       { match: "bsky.app/*", browser: "org.mozilla.firefox" },
 *       { match: /github\.com/, browser: "org.mozilla.firefox" },
 *       { match: ["a.com", "b.com"], browser: "com.brave.browser" },
 *     ],
 *   };
 *
 * Phase 2 will add Hermes function support via Monaco + AST pre-compile.
 */
export function evaluateConfigForHermes(source: string): FinickyConfig {
  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(source, {
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      plugins: [],
    });
  } catch (err) {
    throw new HermesConfigError(
      `Parse error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let defaultExport: unknown = undefined;
  for (const node of ast.program.body) {
    const decl = node as unknown as { type: string; declaration?: AstNode };
    if (decl.type === 'ExportDefaultDeclaration' && decl.declaration) {
      defaultExport = evalExpr(decl.declaration);
      break;
    }
  }

  if (defaultExport === undefined) {
    throw new HermesConfigError('Config must have `export default { ... }`.');
  }

  const result = validateConfig(defaultExport);
  if (!result.success) {
    throw new HermesConfigError(
      `Invalid config: ${result.error.issues
        .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('; ')}`,
    );
  }
  return result.data;
}

type AstNode = { type: string; [k: string]: unknown };

function evalExpr(node: AstNode): unknown {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'RegExpLiteral': {
      const pattern = String(node.pattern);
      const flags = String(node.flags ?? '');
      return new RegExp(pattern, flags);
    }
    case 'ArrayExpression': {
      const rawElements = node.elements as Array<AstNode | null>;
      const elements: AstNode[] = [];
      rawElements.forEach((e, i) => {
        if (e !== null) elements[i] = e;
      });
      return elements.map((e) => evalExpr(e));
    }
    case 'ObjectExpression': {
      const obj: Record<string, unknown> = {};
      const props = node.properties as Array<{
        type: string;
        key: AstNode;
        value: AstNode;
      }>;
      for (const prop of props) {
        if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') {
          throw new HermesConfigError(`Unsupported object member: ${prop.type}`);
        }
        const key = evalKey(prop.key);
        obj[key] = evalExpr(prop.value);
      }
      return obj;
    }
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      throw new HermesConfigError(
        'Function values in config are not supported on Hermes in Phase 1. ' +
          'Use string browser ids and string rewrite URLs only. ' +
          'Function-bodied rules can be tested via `pnpm --filter engine test`.',
      );
    default:
      throw new HermesConfigError(`Unsupported expression type: ${node.type}`);
  }
}

function evalKey(node: AstNode): string {
  if (node.type === 'StringLiteral') return String(node.value);
  if (node.type === 'Identifier') return String(node.name);
  throw new HermesConfigError(`Unsupported key type: ${node.type}`);
}
