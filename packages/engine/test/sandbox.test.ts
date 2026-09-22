import { describe, expect, it } from 'vitest';
import { evaluateConfigForNode, ConfigEvalError } from '../src/sandbox.js';
import { STARTER_CONFIG } from '@browse-router/shared';

describe('evaluateConfigForNode', () => {
  it('parses a valid starter config', () => {
    const config = evaluateConfigForNode(STARTER_CONFIG);
    expect(config.defaultBrowser).toBe('com.android.chrome');
    expect(config.rewrite).toHaveLength(1);
    expect(config.handlers).toHaveLength(2);
  });

  it('evaluates a minimal valid config', () => {
    const config = evaluateConfigForNode(`
      export default {
        defaultBrowser: "com.android.chrome",
        handlers: [
          { match: "x.com/*", browser: "org.mozilla.firefox" }
        ]
      };
    `);
    expect(config.defaultBrowser).toBe('com.android.chrome');
    expect(config.handlers).toHaveLength(1);
  });

  it('throws ConfigEvalError on syntax errors', () => {
    expect(() => evaluateConfigForNode('this is not valid js {{{')).toThrow(ConfigEvalError);
  });

  it('throws ConfigEvalError when default export is missing', () => {
    expect(() =>
      evaluateConfigForNode(`
        const x = { defaultBrowser: "com.android.chrome" };
      `),
    ).toThrow(ConfigEvalError);
  });

  it('throws ConfigEvalError on schema violations', () => {
    expect(() =>
      evaluateConfigForNode(`
        export default {
          defaultBrowser: "",
          handlers: [],
        };
      `),
    ).toThrow(ConfigEvalError);
  });

  it('provides URL as a sandbox global', () => {
    const config = evaluateConfigForNode(`
      export default {
        defaultBrowser: "com.android.chrome",
        rewrite: [
          {
            match: "x.com/*",
            url: ({ url }) => {
              const u = new URL("https://xcancel.com" + url.pathname);
              return u;
            },
          },
        ],
      };
    `);
    expect(config.rewrite).toHaveLength(1);
  });
});
