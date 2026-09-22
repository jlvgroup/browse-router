import type { Browser, EngineDecision, FinickyConfig, RewriteRule } from '@browse-router/shared';
import { matchAnyPattern } from './matcher.js';

export interface ResolveOptions {
  config: FinickyConfig;
  browsers: Browser[];
  inputUrl: string;
}

/**
 * Resolve a URL against a config. Two phases:
 *   1. Apply rewrite rules in order — each rule that matches runs on the
 *      current URL and replaces it.
 *   2. Walk handlers in order — first match wins and decides the browser.
 *   3. If no handler matches, fall back to `config.defaultBrowser`.
 *
 * Returns an `EngineDecision` describing the outcome.
 */
export function resolveUrl({ config, browsers, inputUrl }: ResolveOptions): EngineDecision {
  const current = new URL(inputUrl);

  // Phase 1 — rewrites
  let lastRewriterIndex = -1;
  if (config.rewrite) {
    for (let i = 0; i < config.rewrite.length; i++) {
      const rule = config.rewrite[i];
      if (rule && matchAnyPattern(rule.match, current.toString())) {
        applyRewriteRule(rule, current, browsers);
        lastRewriterIndex = i;
        // Continue with the rewritten URL — chain rewrites.
      }
    }
  }

  // Phase 2 — handlers
  if (config.handlers) {
    for (let i = 0; i < config.handlers.length; i++) {
      const handler = config.handlers[i];
      if (handler && matchAnyPattern(handler.match, current.toString())) {
        const browser = resolveHandlerBrowser(handler.browser, { url: current, browsers });
        return {
          kind: 'open',
          browser,
          rewritten: current,
          matchedRule: i,
        };
      }
    }
  }

  // Phase 3 — default fallback
  return {
    kind: 'open',
    browser: config.defaultBrowser,
    rewritten: current,
    ...(lastRewriterIndex >= 0 ? { matchedRule: lastRewriterIndex } : {}),
  };
}

function applyRewriteRule(
  rule: RewriteRule,
  url: URL,
  browsers: Browser[],
): void {
  if (typeof rule.url === 'string') {
    // Treat as a full replacement.
    const next = new URL(rule.url, url);
    url.protocol = next.protocol;
    url.host = next.host;
    url.pathname = next.pathname;
    url.search = next.search;
    url.hash = next.hash;
    return;
  }

  const result = rule.url({ url, browsers });
  if (typeof result === 'string') {
    const next = new URL(result);
    url.protocol = next.protocol;
    url.host = next.host;
    url.pathname = next.pathname;
    url.search = next.search;
    url.hash = next.hash;
    return;
  }
  // result is a URL — caller mutated it in place (Finicky v4 convention).
  // No-op: mutations already applied.
}

function resolveHandlerBrowser(
  spec: string | ((input: { url: URL; browsers: Browser[] }) => string),
  ctx: { url: URL; browsers: Browser[] },
): string {
  if (typeof spec === 'string') {
    return spec;
  }
  return spec(ctx);
}
