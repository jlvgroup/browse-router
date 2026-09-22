import type { Browser } from './types.js';

/**
 * Hardcoded browser catalog for the MVP. Detection of installed browsers on
 * Android happens at runtime via PackageManager — this list is the *fallback*
 * used to populate the editor picker and resolve a browser by id even when
 * the device hasn't been scanned yet.
 */
export const DEFAULT_BROWSERS: Browser[] = [
  {
    id: 'com.android.chrome',
    name: 'Chrome',
    packageName: 'com.android.chrome',
    monogram: 'C',
  },
  {
    id: 'org.mozilla.firefox',
    name: 'Firefox',
    packageName: 'org.mozilla.firefox',
    urlScheme: 'firefox://',
    monogram: 'F',
  },
  {
    id: 'com.brave.browser',
    name: 'Brave',
    packageName: 'com.brave.browser',
    monogram: 'B',
  },
  {
    id: 'com.duckduckgo.mobile.android',
    name: 'DuckDuckGo',
    packageName: 'com.duckduckgo.mobile.android',
    monogram: 'D',
  },
  {
    id: 'com.sec.android.app.sbrowser',
    name: 'Samsung Internet',
    packageName: 'com.sec.android.app.sbrowser',
    monogram: 'S',
  },
  {
    id: 'com.vivo.browser',
    name: 'Vivo Browser',
    packageName: 'com.vivo.browser',
    monogram: 'V',
  },
];

/**
 * A minimal starter config — matches the desktop Finicky README shape.
 * The app shows this in the editor on first run.
 */
export const STARTER_CONFIG = `// BrowseRouter config — same shape as desktop Finicky v4.
// Edit and save. Changes apply on the next incoming URL.

export default {
  defaultBrowser: "com.android.chrome",

  rewrite: [
    {
      // Example: redirect x.com → xcancel
      match: "x.com/*",
      url: ({ url }) => {
        url.host = "xcancel.com";
        return url;
      },
    },
  ],

  handlers: [
    {
      match: "bsky.app/*",
      browser: "org.mozilla.firefox",
    },
    {
      match: ["google.com/*", "*.google.com*"],
      browser: "com.android.chrome",
    },
  ],
};
`;
