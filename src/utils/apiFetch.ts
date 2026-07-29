/**
 * Utility for making API requests with strict cache-busting headers
 * to prevent browsers and proxies from serving stale session data.
 */

export const CACHE_BUST_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function cacheBustingFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const existingHeaders = init?.headers ? new Headers(init.headers) : new Headers();
  
  Object.entries(CACHE_BUST_HEADERS).forEach(([key, value]) => {
    existingHeaders.set(key, value);
  });

  return fetch(input, {
    ...init,
    headers: existingHeaders
  });
}
