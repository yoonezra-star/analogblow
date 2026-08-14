const SOURCES = {
  libraries: {
    endpoint: 'https://api.odcloud.kr/api/3044643/v1/uddi:bf1f93a2-0fdb-4723-ba1e-f7717e1aa1e9',
    source: 'https://www.data.go.kr/data/3044643/fileData.do',
    label: '파주시 작은도서관 정보',
    cacheSeconds: 21600
  },
  parking: {
    endpoint: 'https://api.odcloud.kr/api/15154067/v1/uddi:52acbc31-6f4f-4e30-b868-d6cc832e0eed',
    source: 'https://www.data.go.kr/data/15154067/fileData.do',
    label: '파주시 지능형교통체계 주차장 정보',
    cacheSeconds: 21600
  }
};

const UNJEONG_TERMS = ['운정', '야당', '와동', '목동', '동패', '다율', '상지석', '교하', '가람', '한빛', '해솔', '산내'];

function json(data, status = 200, cacheSeconds = 900) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${cacheSeconds}`
    }
  });
}

function text(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return '';
}

function inUnjeong(item) {
  const searchable = Object.values(item || {}).join(' ');
  return UNJEONG_TERMS.some((term) => searchable.includes(term));
}

function normalizeLibrary(item) {
  const open = text(item, ['운영시작시각', '운영 시작 시각']);
  const close = text(item, ['운영종료시각', '운영 종료 시각']);
  return {
    name: text(item, ['도서관명', '도서관 명']),
    type: text(item, ['도서관유형', '도서관 유형']),
    holiday: text(item, ['휴관일']),
    hours: open && close ? `${open}~${close}` : open || close,
    address: text(item, ['소재지도로명주소', '소재지 도로명주소', '소재지지번주소']),
    phone: text(item, ['전화번호']),
    website: text(item, ['홈페이지주소', '홈페이지 주소']),
    latitude: text(item, ['위도']),
    longitude: text(item, ['경도']),
    updatedAt: text(item, ['데이터기준일자', '데이터 기준 일자'])
  };
}

function normalizeParking(item) {
  return {
    name: text(item, ['주차장명', '주차장 명']),
    address: text(item, ['도로명주소', '도로명 주소', '지번주소']),
    website: text(item, ['홈페이지주소', '홈페이지 주소']),
    siteName: text(item, ['사이트명', '사이트 명']),
    manager: text(item, ['관리기관명', '관리 기관명']),
    latitude: text(item, ['위도']),
    longitude: text(item, ['경도']),
    updatedAt: text(item, ['데이터기준일자', '데이터 기준 일자'])
  };
}

function fallback(source, reason) {
  return {
    mode: 'fallback',
    reason,
    source: source.source,
    label: source.label,
    items: []
  };
}

export async function onRequestHead() {
  return new Response(null, {
    status: 200,
    headers: { 'cache-control': 'public, max-age=21600' }
  });
}

export async function onRequestGet({ request, env }) {
  const requestUrl = new URL(request.url);
  const type = requestUrl.searchParams.get('type') === 'parking' ? 'parking' : 'libraries';
  const source = SOURCES[type];
  const rows = Math.min(Math.max(Number(requestUrl.searchParams.get('rows') || 8), 1), 30);
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.SERVICE_KEY;

  if (!key) return json(fallback(source, 'missing-service-key'), 200, source.cacheSeconds);

  const apiUrl = new URL(source.endpoint);
  apiUrl.searchParams.set('page', '1');
  apiUrl.searchParams.set('perPage', '100');
  apiUrl.searchParams.set('returnType', 'JSON');

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: { Authorization: key, Accept: 'application/json' },
      cf: { cacheTtl: source.cacheSeconds, cacheEverything: true }
    });
    const payload = await response.json();
    const records = Array.isArray(payload?.data) ? payload.data : [];
    const normalize = type === 'parking' ? normalizeParking : normalizeLibrary;
    const items = records
      .filter(inUnjeong)
      .map(normalize)
      .filter((item) => item.name)
      .slice(0, rows);

    if (!response.ok || !items.length) return json(fallback(source, 'empty-or-api-error'), 200, source.cacheSeconds);

    return json({
      mode: 'live',
      label: source.label,
      source: source.source,
      updatedAt: items.find((item) => item.updatedAt)?.updatedAt || '',
      items
    }, 200, source.cacheSeconds);
  } catch (error) {
    return json(fallback(source, 'request-failed'), 200, source.cacheSeconds);
  }
}
