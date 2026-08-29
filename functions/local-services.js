import page from "../local-services-v2.html";
import searchIndex from "../local-services.html";

const latestGuides = `<section class="rich-section" aria-label="상황별 생활수리 가이드"><div class="article-list"><a class="article-card" href="./posts/unjeong-breaker-tripping-circuit-check-guide"><strong>운정 누전차단기 반복 트립·회로 점검</strong><p>가전·과부하·습기·회로 문제를 구분합니다.</p></a><a class="article-card" href="./posts/unjeong-wall-switch-heat-buzzing-guide"><strong>운정 벽 스위치 발열·지지직</strong><p>스위치 접점·조명 부하·배선 점검 범위를 확인합니다.</p></a><a class="article-card" href="./posts/unjeong-ceiling-light-flicker-led-driver-guide"><strong>운정 천장등 깜빡임·LED 드라이버</strong><p>등기구·스위치·회로 문제를 구분합니다.</p></a><a class="article-card" href="./posts/unjeong-toilet-seat-soft-close-wobble-guide"><strong>운정 변기 시트·소프트클로징 흔들림</strong><p>경첩·고정부·규격과 비데 간섭을 확인합니다.</p></a><a class="article-card" href="./posts/unjeong-bathtub-drain-stopper-slow-drain-guide"><strong>운정 욕조 배수마개·느린 배수</strong><p>마개·막힘·배관·누수 가능성을 나눠 봅니다.</p></a></div></section>`;

export function onRequest(context) {
  const forSearch = context.request.headers.get("X-Town-Search") === "1";
  const indexedPage = searchIndex.includes("</body>")
    ? searchIndex.replace("</body>", `${latestGuides}</body>`)
    : `${searchIndex}${latestGuides}`;
  return new Response(forSearch ? indexedPage : page, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": forSearch ? "public, max-age=300" : "no-cache, no-store, must-revalidate",
      ...(forSearch ? { "X-Robots-Tag": "noindex, nofollow" } : {})
    }
  });
}
