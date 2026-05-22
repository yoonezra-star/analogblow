const FALLBACK_ITEMS = [
  {
    title: '네이버 카페 공개글 검색으로 지역 후기를 확인하세요',
    description: '카페글 검색 API 키가 설정되면 이 영역에 운정·파주 생활 관련 공개 카페글이 자동으로 표시됩니다.',
    link: 'https://search.naver.com/search.naver?where=article&query=%EC%9A%B4%EC%A0%95%20%EC%83%9D%ED%99%9C%20%ED%9B%84%EA%B8%B0',
    cafename: '네이버 카페 검색',
    cafeurl: 'https://section.cafe.naver.com/'
  }
];

const BLOCKED_WORDS = [
  '카지노',
  '토토',
  '대출',
  '성인',
  '바카라',
  '도박',
  '광고문의',
  '체험단 모집'
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=900'
    }
  });
}

function clean(value = '') {
  return String(value)
    .replace(/<b>/gi, '')
    .replace(/<\/b>/gi, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .trim();
}

function isUsefulCafeItem(item, strictLocal) {
  const text = `${item.title} ${item.description} ${item.cafename}`;
  if (BLOCKED_WORDS.some((word) => text.includes(word))) return false;
  if (!strictLocal) return true;
  return /운정|파주|야당|동패|목동동|산내|해솔|한빛|가람|교하|일산/.test(text);
}

function fallback(query, reason = 'fallback') {
  const encoded = encodeURIComponent(query || '운정 생활 후기');
  return {
    mode: 'fallback',
    reason,
    source: 'naver-search-link',
    items: FALLBACK_ITEMS.map((item) => ({
      ...item,
      link: `https://search.naver.com/search.naver?where=article&query=${encoded}`
    }))
  };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim();
  const display = Math.min(Math.max(Number(url.searchParams.get('display') || 6), 1), 10);
  const sort = url.searchParams.get('sort') === 'date' ? 'date' : 'sim';
  const strictLocal = url.searchParams.get('local') !== 'false';
  const clientId = env.NAVER_SEARCH_CLIENT_ID || env.NAVER_CLIENT_ID || env.NAVER_CAFE_CLIENT_ID;
  const clientSecret = env.NAVER_SEARCH_CLIENT_SECRET || env.NAVER_CLIENT_SECRET || env.NAVER_CAFE_CLIENT_SECRET;

  if (!query) {
    return json({ mode: 'empty', items: [] }, 400);
  }

  if (!clientId || !clientSecret) {
    return json(fallback(query, 'missing-env'));
  }

  const apiUrl = new URL('https://openapi.naver.com/v1/search/cafearticle.json');
  apiUrl.searchParams.set('query', query);
  apiUrl.searchParams.set('display', String(Math.min(display * 2, 20)));
  apiUrl.searchParams.set('start', '1');
  apiUrl.searchParams.set('sort', sort);

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      cf: { cacheTtl: 900, cacheEverything: true }
    });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.items)) {
      return json(fallback(query, `naver-http-${response.status}`));
    }

    const items = data.items
      .map((item) => ({
        title: clean(item.title),
        description: clean(item.description),
        link: item.link,
        cafename: clean(item.cafename),
        cafeurl: item.cafeurl
      }))
      .filter((item) => item.title && item.link)
      .filter((item) => isUsefulCafeItem(item, strictLocal))
      .slice(0, display);

    if (!items.length) {
      return json(fallback(query, 'filtered-empty'));
    }

    return json({
      mode: 'live',
      total: data.total || 0,
      query,
      source: 'naver-cafearticle',
      items
    });
  } catch (error) {
    return json(fallback(query, 'request-error'));
  }
}
