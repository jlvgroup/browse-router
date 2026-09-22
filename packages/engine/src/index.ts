/**
 * Main entry — pure TypeScript, safe for React Native / Metro bundling.
 *
 * The Node-only `evaluateConfigForNode` (which uses `vm`) lives behind the
 * `@browse-router/engine/node` subpath export. Importing it from the main
 * entry would pull `node:vm` into a mobile bundle, which Metro can't resolve.
 */
export { matchPattern, matchAnyPattern, wildcardToRegExp } from './matcher.js';
export { resolveUrl } from './engine.js';
export type { ResolveOptions } from './engine.js';
export {
  UrlPatternSchema,
  RewriteRuleSchema,
  HandlerSchema,
  FinickyConfigSchema,
  validateConfig,
} from './schema.js';
