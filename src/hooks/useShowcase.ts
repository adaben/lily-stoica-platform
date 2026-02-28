/**
 * Cached at module-load time so the value survives even if useAuth
 * later cleans query params from the URL.
 */
const IS_SHOWCASE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("_showcase");

/** Returns true when the page is loaded inside a Showcase iframe (?_showcase=1). */
export function useShowcase(): boolean {
  return IS_SHOWCASE;
}
