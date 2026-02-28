/** Returns true when the page is loaded inside a Showcase iframe (?_showcase=1). */
export function useShowcase(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("_showcase");
}
