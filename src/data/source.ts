// src/data/source.ts

const DEFAULT_SOURCE = 'ojjlab-website-home';

/**
 * Returns the lead source from the current URL query params.
 * Falls back to DEFAULT_SOURCE if not present or empty.
 */
export function getLeadSource(
  url: string = window.location.href,
): string {
  const params = new URL(url).searchParams;

  const source = params.get('source');

  if (!source || source.trim().length === 0) {
    return DEFAULT_SOURCE;
  }

  return source.trim();
}
