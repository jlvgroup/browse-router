/**
 * Node-only entry. Imports `node:vm` via sandbox.
 *
 * Importing this from a React Native bundle will fail because Metro cannot
 * resolve `node:vm`. Use `@browse-router/engine` (the default export) for
 * any code that runs on a device.
 */
export {
  matchPattern,
  matchAnyPattern,
  wildcardToRegExp,
  resolveUrl,
  UrlPatternSchema,
  RewriteRuleSchema,
  HandlerSchema,
  FinickyConfigSchema,
  validateConfig,
} from './index.js';
export { evaluateConfigForNode, ConfigEvalError } from './sandbox.js';
