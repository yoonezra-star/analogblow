import page from "../../local-services.html";

export function onRequest() {
  return new Response(page, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}
