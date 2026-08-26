import page from "../local-services-v2.html";

export function onRequest() {
  return new Response(page, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }
  });
}
