import { describe, expect, it } from 'vitest';

// Pure-Node smoke test of the Hermes evaluator. The module itself imports
// @babel/parser and @babel/traverse; both work fine in Node.
import { evaluateConfigForHermes, HermesConfigError } from '../src/bridge/hermes-config';

const STARTER = `export default {
  defaultBrowser: "com.android.chrome",
  rewrite: [
    { match: "x.com/*", url: "https://xcancel.com/" }
  ],
  handlers: [
    { match: "bsky.app/*", browser: "org.mozilla.firefox" },
    { match: ["google.com/*", "*.google.com*"], browser: "com.brave.browser" },
    { match: /github\\.com/, browser: "org.mozilla.firefox" }
  ]
};`;

describe('evaluateConfigForHermes', () => {
  it('parses a literal config', () => {
    const cfg = evaluateConfigForHermes(STARTER);
    expect(cfg.defaultBrowser).toBe('com.android.chrome');
    expect(cfg.rewrite).toHaveLength(1);
    expect(cfg.handlers).toHaveLength(3);
  });

  it('preserves RegExp patterns', () => {
    const cfg = evaluateConfigForHermes(STARTER);
    const re = cfg.handlers?.[2]?.match;
    expect(re).toBeInstanceOf(RegExp);
  });

  it('rejects function-bodied rules', () => {
    expect(() =>
      evaluateConfigForHermes(`
        export default {
          defaultBrowser: "x",
          rewrite: [{ match: "a.com/*", url: ({ url }) => { url.host = "b.com"; return url; } }]
        };
      `),
    ).toThrow(HermesConfigError);
  });

  it('reports parse errors with context', () => {
    expect(() => evaluateConfigForHermes('not { valid')).toThrow(HermesConfigError);
  });

  it('reports missing default export', () => {
    expect(() => evaluateConfigForHermes('const x = 1;')).toThrow(HermesConfigError);
  });
});
