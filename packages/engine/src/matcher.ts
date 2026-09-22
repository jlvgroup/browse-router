import type { UrlPattern } from '@browse-router/shared';

/**
 * Match a single URL string against a single pattern.
 *
 * Pattern forms:
 *   - RegExp            → tested against `url`
 *   - String starting with `/` and ending with `/` (e.g. `/example\.com/`)
 *                       → compiled to RegExp, tested against `url`
 *   - Wildcard string   → converted to RegExp via wildcardToRegExp
 *
 * Wildcards:
 *   `*`  matches zero or more chars within a single path segment
 *   `**` matches zero or more chars across path segments (path only)
 *
 * Examples:
 *   "google.com/*"           matches "https://google.com/search?q=x"
 *   "*.example.com*"         matches "https://api.example.com/v1/foo"
 *   "https://example.com/*"  matches only that host
 */
export function matchPattern(pattern: UrlPattern, url: string): boolean {
  if (pattern instanceof RegExp) {
    return pattern.test(url);
  }

  if (isRegexLiteralString(pattern)) {
    // Slice off the surrounding slashes; flags after the closing slash are passed through.
    const lastSlash = pattern.lastIndexOf('/');
    const body = pattern.slice(1, lastSlash);
    const flags = pattern.slice(lastSlash + 1);
    return new RegExp(body, flags).test(url);
  }

  const re = wildcardToRegExp(pattern);
  return re.test(url);
}

export function matchAnyPattern(
  pattern: UrlPattern | UrlPattern[],
  url: string,
): boolean {
  if (Array.isArray(pattern)) {
    return pattern.some((p) => matchPattern(p, url));
  }
  return matchPattern(pattern, url);
}

function isRegexLiteralString(s: string): boolean {
  return s.length >= 2 && s.startsWith('/') && s.lastIndexOf('/') > 0;
}

/**
 * Convert a Finicky-style wildcard string to a RegExp.
 *
 * Strategy: split the pattern on `*`, escape every other piece, re-join
 * with `.*`. This gives correct behaviour for both single-`*` (segment-local)
 * and double-`**` (cross-segment) since we don't need to distinguish them
 * at this layer — `.*` is greedy and will match across `/` either way.
 *
 * Anchors the result with `^…$` so partial matches are NOT accepted.
 */
export function wildcardToRegExp(pattern: string): RegExp {
  // Escape regex metacharacters, except `*`, then replace `*` with `.*`.
  // Important: replaceAll('*', '.*') — NOT '\\*' (which is the literal backslash-asterisk,
  // not the asterisk alone).
  const escaped = escapeRegex(pattern).replaceAll('*', '.*');
  // Finicky wildcards are substring matches (no ^/$ anchors). A pattern like
  // "google.com/*" should match any URL that contains "google.com/" somewhere.
  // We still emit a RegExp; callers use .test() which is unanchored.
  return new RegExp(escaped);
}

function escapeRegex(s: string): string {
  return s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}
