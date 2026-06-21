const FALLBACK_ITEMS = [
  {
    type: 'official',
    name: '중앙선거관리위원회 투표소 찾기',
    district: '파주시',
    town: '운정 생활권',
    place: '선거 기간 공식 투표소 조회에서 확인',
    address: '선거ID와 행정구역에 따라 투표소가 달라집니다.',
    floor: '',
    link: 'https://www.nec.go.kr/site/nec/main.do'
  },
  {
    type: 'local',
    name: '파주시 선거 공지 확인',
    district: '파주시',
    town: '운정1·2·3동',
    place: '파주시청 선거 관련 공지',
    address: '선거별 안내문과 선거인명부 기준 투표소를 확인하세요.',
    floor: '',
    link: 'https://www.paju.go.kr/index.do'
  }
];

const OPERATIONS = {
  early: 'getPrePolplcOtlnmapTrnsportInfoInqire',
  day: 'getPolplcOtlnmapTrnsportInfoInqire'
};

function normalizeItem(item, mode, fallbackLink) {
  return {
    type: mode,
    name: item.evPsName || item.psName || item.name || '투표소',
    district: item.wiwName || '',
    town: item.emdName || '',
    place: item.placeName || '',
    address: item.addr || '',
    floor: item.floor || '',
    order: item.evOrder || item.num || '',
    link: fallbackLink
  };
}

function parseXmlItems(xml, mode, fallbackLink) {
  const blocks = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  return blocks.map((block) => {
    const item = {};
    for (const tag of ['evPsName', 'psName', 'sdName', 'wiwName', 'emdName', 'evOrder', 'placeName', 'addr', 'floor', 'num']) {
      const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      item[tag] = match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    }
    return normalizeItem(item, mode, fallbackLink);
  }).filter((item) => item.name || item.place || item.address);
}

function parseItems(data, mode, fallbackLink) {
  if (typeof data === 'string') return parseXmlItems(data, mode, fallbackLink);
  const body = data?.response?.body || data?.body || data;
  const rawItems = body?.items?.item || body?.item || [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  return items.filter(Boolean).map((item) => normalizeItem(item, mode, fallbackLink));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=1800'
    }
  });
}

export async function onRequestHead() {
  return new Response(null, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=1800'
    }
  });
}

export async function onRequestGet({ request, env }) {
  const requestUrl = new URL(request.url);
  const mode = requestUrl.searchParams.get('mode') === 'day' ? 'day' : 'early';
  const sgId = requestUrl.searchParams.get('sgId') || '';
  const sdName = requestUrl.searchParams.get('sdName') || '경기도';
  const wiwName = requestUrl.searchParams.get('wiwName') || '파주시';
  const rows = Math.min(Number(requestUrl.searchParams.get('rows') || 30), 100);
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.SERVICE_KEY;
  const fallbackLink = 'https://www.nec.go.kr/site/nec/main.do';

  if (!key || !sgId) {
    return json({
      mode: 'fallback',
      reason: !key ? 'missing-service-key' : 'missing-election-id',
      source: fallbackLink,
      items: FALLBACK_ITEMS
    });
  }

  const apiUrl = new URL(`https://apis.data.go.kr/9760000/PolplcInfoInqireService2/${OPERATIONS[mode]}`);
  apiUrl.searchParams.set('ServiceKey', key);
  apiUrl.searchParams.set('pageNo', '1');
  apiUrl.searchParams.set('numOfRows', String(rows));
  apiUrl.searchParams.set('sgId', sgId);
  apiUrl.searchParams.set('sdName', sdName);
  apiUrl.searchParams.set('wiwName', wiwName);
  apiUrl.searchParams.set('resultType', 'json');

  try {
    const response = await fetch(apiUrl.toString(), { cf: { cacheTtl: 1800, cacheEverything: true } });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('json') ? await response.json() : await response.text();
    const items = parseItems(payload, mode, fallbackLink);
    if (response.ok && items.length) {
      return json({
        mode: 'live',
        query: { sgId, sdName, wiwName, type: mode },
        source: apiUrl.toString().replace(key, '***'),
        items
      });
    }
  } catch (error) {
    // Fall back to official links below.
  }

  return json({ mode: 'fallback', source: fallbackLink, items: FALLBACK_ITEMS });
}
