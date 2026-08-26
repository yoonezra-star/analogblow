import page from "../local-services-v2.html";
import searchIndex from "../local-services.html";

export function onRequest(context) {
  const forSearch = context.request.headers.get("X-Town-Search") === "1";
  return new Response(forSearch ? searchIndex : page, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": forSearch ? "public, max-age=300" : "no-cache, no-store, must-revalidate",
      ...(forSearch ? { "X-Robots-Tag": "noindex, nofollow" } : {})
    }
  });
}
