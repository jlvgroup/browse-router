/**
 * Sandbox for evaluating user-authored JS config.
 *
 * The engine is pure TS and runs in Node, so we can use `vm.createContext`
 * for isolation. The RN runtime (Hermes) does NOT have `vm` — that path is
 * handled separately in the app via a pre-compiled AST evaluator.
 *
 * This module exposes:
 *   - evaluateConfigForNode(source: string): FinickyConfig
 *
 * Safety:
 *   - No access to `require`, `process`, `fetch`, `globalThis`
 *   - Only `URL` is exposed as a global
 *   - The config source must export a default object
 */

import vm from 'node:vm';
import type { FinickyConfig } from '@browse-router/shared';
import { validateConfig } from './schema.js';

export class ConfigEvalError extends Error {
  override readonly name = 'ConfigEvalError';
}

export function evaluateConfigForNode(source: string): FinickyConfig {
  // The user's config may use either ESM (`export default`) or CJS
  // (`module.exports`) style. We transform the ESM form into a CJS form
  // before evaluating in vm — vm.runInContext does not understand `export`.
  const cjsSource = source
    .replace(/export\s+default\s+/g, '__browseRouterDefault = ')
    .replace(/export\s+\{[^}]*\}\s*;?/g, '');

  const wrapped = `${cjsSource}\n;module.exports = (typeof __browseRouterDefault !== 'undefined') ? __browseRouterDefault : module.exports;`;

  const sandbox: Record<string, unknown> = {
    URL,
    console: {
      log: (...args: unknown[]) => console.log('[user-config]', ...args),
      warn: (...args: unknown[]) => console.warn('[user-config]', ...args),
      error: (...args: unknown[]) => console.error('[user-config]', ...args),
    },
    module: { exports: {} as Record<string, unknown> },
  };

  try {
    vm.createContext(sandbox);
    vm.runInContext(wrapped, sandbox, { filename: 'browse-router-config.js', timeout: 1000 });
  } catch (err) {
    throw new ConfigEvalError(
      `Failed to evaluate config: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const exported = (sandbox.module as { exports: unknown }).exports;
  const parsed = validateConfig(exported);
  if (!parsed.success) {
    throw new ConfigEvalError(
      `Config failed schema validation: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    );
  }
  return parsed.data;
}
