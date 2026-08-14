const HIRA_ENDPOINT = 'https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList';
const PAJU_SIDO_CD = '41';
const PAJU_SGGU_CD = '41480';
const UNJEONG_AREAS = ['운정', '야당', '동패', '목동', '와동', '다율', '상지석', '교하', '산내', '한빛', '해솔'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}

export async function onRequestHead() {
  return new Response(null, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function readTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function visibleInUnjeong(item) {
  const text = `${item.address} ${item.area}`;
  return UNJEONG_AREAS.some((area) => text.includes(area));
}

function parseItems(xml, rows) {
  const blocks = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  return blocks
    .map((item) => ({
      name: readTag(item, 'yadmNm'),
      category: readTag(item, 'clCdNm'),
      address: readTag(item, 'addr'),
      area: readTag(item, 'emdongNm'),
      phone: readTag(item, 'telno'),
      latitude: readTag(item, 'YPos'),
      longitude: readTag(item, 'XPos'),
      establishedAt: readTag(item, 'estbDd')
    }))
    .filter((item) => item.name && visibleInUnjeong(item))
    .slice(0, rows);
}

function fallback(reason) {
  return {
    mode: 'official-source',
    reason,
    items: [],
    sources: [
      { label: '응급의료포털 E-Gen', url: 'https://www.e-gen.or.kr/' },
      { label: '파주시 보건소', url: 'https://clinic.paju.go.kr/clinic/index.do' },
      { label: '건강보험심사평가원 병원정보서비스', url: 'https://www.data.go.kr/data/15001698/openapi.do' }
    ],
    guide: '당일 진료, 접수 마감, 휴일 운영은 E-Gen 또는 의료기관 전화로 다시 확인해야 합니다.'
  };
}

export async function onRequestGet({ request, env }) {
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.SERVICE_KEY;
  if (!key) return json(fallback('missing-service-key'));

  const requestUrl = new URL(request.url);
  const rows = Math.min(Math.max(Number(requestUrl.searchParams.get('rows') || 20), 1), 30);
  const query = requestUrl.searchParams.get('query') || '';
  const apiUrl = new URL(HIRA_ENDPOINT);
  apiUrl.searchParams.set('ServiceKey', key);
  apiUrl.searchParams.set('pageNo', '1');
  apiUrl.searchParams.set('numOfRows', '100');
  apiUrl.searchParams.set('sidoCd', PAJU_SIDO_CD);
  apiUrl.searchParams.set('sgguCd', PAJU_SGGU_CD);
  if (query) apiUrl.searchParams.set('yadmNm', query);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('timeout'), 4500);

  try {
    const response = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      cf: { cacheTtl: 3600, cacheEverything: true }
    });
    const body = await response.text();
    const items = response.ok ? parseItems(body, rows) : [];

    if (!items.length) return json(fallback(response.ok ? 'empty-or-not-authorized' : 'upstream-error'));

    return json({
      mode: 'live',
      provider: '건강보험심사평가원',
      fetchedAt: new Date().toISOString(),
      source: 'https://www.data.go.kr/data/15001698/openapi.do',
      items,
      guide: '기관 기본정보입니다. 당일 진료와 접수 가능 여부는 E-Gen 또는 의료기관 전화로 확인하세요.'
    });
  } catch {
    return json(fallback('request-failed'));
  } finally {
    clearTimeout(timeout);
  }
}
