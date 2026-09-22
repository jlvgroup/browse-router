import { describe, expect, it } from 'vitest';
import { matchPattern, matchAnyPattern, wildcardToRegExp } from '../src/matcher.js';

describe('wildcardToRegExp', () => {
  it('escapes regex metacharacters', () => {
    const re = wildcardToRegExp('https://example.com/path?q=1');
    // Substring match — no ^ / $ anchors.
    expect(re.test('https://example.com/path?q=1')).toBe(true);
    expect(re.test('https://other.com/foo?url=https://example.com/path?q=1')).toBe(true);
    expect(re.test('https://example.org')).toBe(false);
  });

  it('converts single * to .*', () => {
    const re = wildcardToRegExp('google.com/*');
    expect(re.test('https://google.com/search')).toBe(true);
    expect(re.test('https://google.com/')).toBe(true);
    expect(re.test('https://other.com/search')).toBe(false);
  });

  it('converts ** to .* (cross-segment in path/host)', () => {
    const re = wildcardToRegExp('*.example.com*');
    // Leading * requires SOMETHING before ".example.com" — subdomain variants.
    expect(re.test('https://api.example.com/v1/foo')).toBe(true);
    expect(re.test('https://example.com')).toBe(false); // no subdomain
    expect(re.test('https://example.org')).toBe(false);
  });
});

describe('matchPattern', () => {
  it('matches wildcard strings against full URL', () => {
    expect(matchPattern('google.com/*', 'https://google.com/search?q=x')).toBe(true);
  });

  it('matches as substring (Finicky convention: user adds * for subdomains)', () => {
    // Without explicit wildcards, "google.com" matches URLs containing it,
    // INCLUDING mail.google.com. To restrict to the bare host, the user must
    // write a more specific pattern (e.g. anchored regex).
    expect(matchPattern('google.com', 'https://mail.google.com')).toBe(true);
    // To match subdomain variants explicitly, use leading/trailing wildcards.
    expect(matchPattern('*.google.com', 'https://mail.google.com')).toBe(true);
    expect(matchPattern('google.com', 'https://example.com')).toBe(false);
  });

  it('matches RegExp patterns', () => {
    expect(matchPattern(/github\.com/, 'https://github.com/user/repo')).toBe(true);
    expect(matchPattern(/github\.com/, 'https://example.com')).toBe(false);
  });

  it('parses regex literal strings (slash-delimited)', () => {
    expect(matchPattern('/example\\.com/', 'https://example.com')).toBe(true);
    expect(matchPattern('/example\\.com/', 'https://example.org')).toBe(false);
  });

  it('parses regex literal strings with flags', () => {
    expect(matchPattern('/EXAMPLE/i', 'https://example.com')).toBe(true);
  });
});

describe('matchAnyPattern', () => {
  it('returns true if any pattern in an array matches', () => {
    expect(
      matchAnyPattern(['google.com/*', '*.google.com*'], 'https://mail.google.com'),
    ).toBe(true);
    expect(
      matchAnyPattern(['google.com/*', '*.google.com*'], 'https://google.com/search'),
    ).toBe(true);
  });

  it('returns false when no pattern matches', () => {
    expect(matchAnyPattern(['google.com/*', '*.google.com*'], 'https://example.com')).toBe(
      false,
    );
  });

  it('handles a single pattern (non-array)', () => {
    expect(matchAnyPattern('google.com/*', 'https://google.com/search')).toBe(true);
  });
});
