// Temporary bridge to the original public site while its D1 database remains active.
// This URL can be replaced with SHARK_DATA_ORIGIN after moving the data service.
const DEFAULT_ORIGIN = "https://shark-portfolio-victor.jg749nmqt5.chatgpt.site";

export function backendUrl(path: "/api/products" | "/api/refresh"): string {
  const origin = process.env.SHARK_DATA_ORIGIN || DEFAULT_ORIGIN;
  return new URL(path, origin).href;
}
