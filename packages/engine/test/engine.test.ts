import { describe, expect, it } from 'vitest';
import { resolveUrl } from '../src/engine.js';
import { DEFAULT_BROWSERS } from '@browse-router/shared';
import type { FinickyConfig } from '@browse-router/shared';

const chrome = 'com.android.chrome';
const firefox = 'org.mozilla.firefox';

const baseConfig: FinickyConfig = {
  defaultBrowser: chrome,
  handlers: [],
  rewrite: [],
};

describe('resolveUrl', () => {
  it('falls back to defaultBrowser when no handler matches', () => {
    const result = resolveUrl({
      config: baseConfig,
      browsers: DEFAULT_BROWSERS,
      inputUrl: 'https://example.com/foo',
    });
    expect(result.kind).toBe('open');
    if (result.kind === 'open') {
      expect(result.browser).toBe(chrome);
      expect(result.matchedRule).toBeUndefined();
    }
  });

  it('first matching handler wins', () => {
    const config: FinickyConfig = {
      defaultBrowser: chrome,
      handlers: [
        { match: 'bsky.app/*', browser: firefox },
        { match: 'bsky.app/*', browser: chrome }, // second should not run
      ],
    };
    const result = resolveUrl({
      config,
      browsers: DEFAULT_BROWSERS,
      inputUrl: 'https://bsky.app/profile/me',
    });
    expect(result.kind).toBe('open');
    if (result.kind === 'open') {
      expect(result.browser).toBe(firefox);
      expect(result.matchedRule).toBe(0);
    }
  });

  it('matches against the rewritten URL, not the input', () => {
    const config: FinickyConfig = {
      defaultBrowser: chrome,
      rewrite: [
        {
          match: 'x.com/*',
          url: ({ url }) => {
            url.host = 'xcancel.com';
            return url;
          },
        },
      ],
      handlers: [
        // xcancel (after rewrite) → Firefox, NOT x.com
        { match: 'xcancel.com/*', browser: firefox },
        { match: 'x.com/*', browser: chrome },
      ],
    };
    const result = resolveUrl({
      config,
      browsers: DEFAULT_BROWSERS,
      inputUrl: 'https://x.com/user/elon',
    });
    expect(result.kind).toBe('open');
    if (result.kind === 'open') {
      expect(result.browser).toBe(firefox);
      expect(result.rewritten.host).toBe('xcancel.com');
    }
  });

  it('chains multiple rewrites', () => {
    const config: FinickyConfig = {
      defaultBrowser: chrome,
      rewrite: [
        {
          match: 'twitter.com/*',
          url: ({ url }) => {
            url.host = 'x.com';
            return url;
          },
        },
        {
          match: 'x.com/*',
          url: ({ url }) => {
            url.host = 'xcancel.com';
            return url;
          },
        },
      ],
    };
    const result = resolveUrl({
      config,
      browsers: DEFAULT_BROWSERS,
      inputUrl: 'https://twitter.com/user/x',
    });
    expect(result.kind).toBe('open');
    if (result.kind === 'open') {
      expect(result.rewritten.host).toBe('xcancel.com');
      expect(result.rewritten.pathname).toBe('/user/x');
    }
  });

  it('supports dynamic browser selection via function', () => {
    const config: FinickyConfig = {
      defaultBrowser: chrome,
      handlers: [
        {
          match: '*.github.com',
          browser: ({ browsers }) => {
            const firefoxBrowser = browsers.find((b) => b.id === firefox);
            return firefoxBrowser?.id ?? chrome;
          },
        },
      ],
    };
    const result = resolveUrl({
      config,
      browsers: DEFAULT_BROWSERS,
      inputUrl: 'https://api.github.com/repos',
    });
    expect(result.kind).toBe('open');
    if (result.kind === 'open') {
      expect(result.browser).toBe(firefox);
    }
  });

  it('matches an array of patterns (any-of)', () => {
    const config: FinickyConfig = {
      defaultBrowser: chrome,
      handlers: [
        {
          match: ['google.com/*', '*.google.com*'],
          browser: firefox,
        },
      ],
    };
    expect(
      resolveUrl({
        config,
        browsers: DEFAULT_BROWSERS,
        inputUrl: 'https://google.com/search',
      }),
    ).toMatchObject({ kind: 'open', browser: firefox });
    expect(
      resolveUrl({
        config,
        browsers: DEFAULT_BROWSERS,
        inputUrl: 'https://mail.google.com/inbox',
      }),
    ).toMatchObject({ kind: 'open', browser: firefox });
  });

  it('rewrites path components via function result', () => {
    const config: FinickyConfig = {
      defaultBrowser: chrome,
      rewrite: [
        {
          match: 'old.example.com/*',
          url: ({ url }) => {
            url.host = 'new.example.com';
            url.pathname = '/v2' + url.pathname;
            return url;
          },
        },
      ],
    };
    const result = resolveUrl({
      config,
      browsers: DEFAULT_BROWSERS,
      inputUrl: 'https://old.example.com/items/42',
    });
    expect(result.kind).toBe('open');
    if (result.kind === 'open') {
      expect(result.rewritten.host).toBe('new.example.com');
      expect(result.rewritten.pathname).toBe('/v2/items/42');
    }
  });

  it('supports regex literal strings as patterns', () => {
    const config: FinickyConfig = {
      defaultBrowser: chrome,
      handlers: [
        { match: '/github\\.com/', browser: firefox },
      ],
    };
    const result = resolveUrl({
      config,
      browsers: DEFAULT_BROWSERS,
      inputUrl: 'https://github.com/user/repo',
    });
    expect(result.kind).toBe('open');
    if (result.kind === 'open') {
      expect(result.browser).toBe(firefox);
    }
  });
});
