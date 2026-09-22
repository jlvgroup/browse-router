/**
 * Shared types for BrowseRouter — ported shape from Finicky v4.
 *
 * Keep this package dependency-free. The engine and the app both consume it.
 */

export type BrowserId = string;

export interface Browser {
  /** Stable id (matches an Android package name on Android). */
  id: BrowserId;
  /** Display name shown in UI. */
  name: string;
  /** Android package name (e.g. "com.android.chrome"). Used as Intent target. */
  packageName?: string;
  /** Optional URL scheme for direct launch (e.g. "firefox://"). */
  urlScheme?: string;
  /** Optional logo / monogram hint. */
  monogram?: string;
}

/**
 * A pattern matches a URL. Either a wildcard string ("google.com/*") or a RegExp.
 * Strings starting with "/" are treated as RegExp literals.
 */
export type UrlPattern = string | RegExp;

/** A rewrite rule mutates a URL before handlers run. First match wins. */
export interface RewriteRule {
  match: UrlPattern | UrlPattern[];
  /** Mutates the URL in place (or returns a new one). */
  url: string | ((input: { url: URL; browsers: Browser[] }) => URL | string);
}

/** A handler picks a browser for a URL. First match wins. */
export interface Handler {
  match: UrlPattern | UrlPattern[];
  browser: BrowserId | ((input: { url: URL; browsers: Browser[] }) => BrowserId);
}

/** Top-level user config. Mirrors `~/.finicky.js` from desktop Finicky. */
export interface FinickyConfig {
  /** Browser used when no handler matches. */
  defaultBrowser: BrowserId;
  /** URL rewriting chain — runs before handlers, in order. */
  rewrite?: RewriteRule[];
  /** Handler chain — first match wins. */
  handlers?: Handler[];
}

/** Engine decision result — what should happen with this URL. */
export type EngineDecision =
  | { kind: 'open'; browser: BrowserId; rewritten: URL; matchedRule?: number }
  | { kind: 'no-match'; rewritten: URL };
