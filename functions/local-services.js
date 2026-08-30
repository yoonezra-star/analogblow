import page from "../local-services-v2.html";
import searchIndex from "../local-services.html";

const latestGuides = `<section class="rich-section" aria-label="상황별 생활수리 가이드"><div class="article-list"><a class="article-card" href="./posts/unjeong-breaker-tripping-circuit-check-guide"><strong>운정 누전차단기 반복 트립·회로 점검</strong><p>가전·과부하·습기·회로 문제를 구분합니다.</p></a><a class="article-card" href="./posts/unjeong-wall-switch-heat-buzzing-guide"><strong>운정 벽 스위치 발열·지지직</strong><p>스위치 접점·조명 부하·배선 점검 범위를 확인합니다.</p></a><a class="article-card" href="./posts/unjeong-ceiling-light-flicker-led-driver-guide"><strong>운정 천장등 깜빡임·LED 드라이버</strong><p>등기구·스위치·회로 문제를 구분합니다.</p></a><a class="article-card" href="./posts/unjeong-toilet-seat-soft-close-wobble-guide"><strong>운정 변기 시트·소프트클로징 흔들림</strong><p>경첩·고정부·규격과 비데 간섭을 확인합니다.</p></a><a class="article-card" href="./posts/unjeong-bathtub-drain-stopper-slow-drain-guide"><strong>운정 욕조 배수마개·느린 배수</strong><p>마개·막힘·배관·누수 가능성을 나눠 봅니다.</p></a><a class="article-card" href="./posts/unjeong-kitchen-sink-strainer-basket-leak-guide"><strong>운정 싱크 배수구 거름망·배수통 누수</strong><p>테두리·패킹·배수통·트랩의 누수 위치를 구분합니다.</p></a><a class="article-card" href="./posts/unjeong-toilet-weak-flush-clog-slow-drain-guide"><strong>운정 변기 물내림 약함·막힘·느린 배수</strong><p>탱크 수위·트랩·세대 배관 문제를 나눠 봅니다.</p></a><a class="article-card" href="./posts/unjeong-refrigerator-weak-cooling-frost-guide"><strong>운정 냉장고 냉기 약함·성에 반복</strong><p>설정·통풍·제상·냉각계통 범위를 확인합니다.</p></a><a class="article-card" href="./posts/unjeong-dishwasher-detergent-dispenser-wash-residue-guide"><strong>운정 식기세척기 세제함·세척불량</strong><p>세제함·분사·필터·급수 상태를 구분합니다.</p></a><a class="article-card" href="./posts/unjeong-dryer-long-drying-time-lint-filter-airflow-guide"><strong>운정 건조기 건조시간 증가·먼지필터</strong><p>적재·탈수·필터·통풍과 기기 이상을 나눠 봅니다.</p></a></div></section>`;

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
