const FALLBACK_ITEMS = [
  {
    title: '운정 가족 생활과 관련된 정책 소식을 공식 출처 기준으로 확인합니다.',
    department: '정책브리핑',
    date: '',
    link: 'https://www.korea.kr/news/policyNewsList.do',
    summary: '교육, 보육, 교통, 복지, 문화 분야의 최신 정책은 대한민국 정책브리핑 공식 페이지에서 함께 확인할 수 있습니다.'
  },
  {
    title: '보도자료는 부처별 공식 발표 기준으로 확인합니다.',
    department: '정책브리핑 보도자료',
    date: '',
    link: 'https://www.korea.kr/briefing/pressReleaseList.do',
    summary: '생활에 영향이 큰 정책 발표는 원문 출처와 발표 부처를 우선 확인하는 방식으로 정리합니다.'
  }
];

const ENDPOINTS = {
  policy: {
    base: 'https://apis.data.go.kr/1371000/policyNewsService',
    fallback: 'https://www.korea.kr/news/policyNewsList.do',
    operations: ['getPolicyNewsList', 'policyNewsList', 'getPolicyNews']
  },
  press: {
    base: 'https://apis.data.go.kr/1371000/pressReleaseService',
    fallback: 'https://www.korea.kr/briefing/pressReleaseList.do',
    operations: ['getPressReleaseList', 'pressReleaseList', 'getPressRelease']
  },
  photo: {
    base: 'https://apis.data.go.kr/1371000/photoNewsService',
    fallback: 'https://www.korea.kr/news/visualNewsList.do',
    operations: ['getPhotoNewsList', 'photoNewsList', 'getPhotoNews']
  }
};

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeHtml(match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : '';
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseItems(xml, fallbackLink) {
  const itemBlocks = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  return itemBlocks.slice(0, 12).map((item) => ({
    title: textBetween(item, 'title') || textBetween(item, 'newsTitle') || textBetween(item, 'subject'),
    department: textBetween(item, 'deptName') || textBetween(item, 'department') || textBetween(item, 'origin'),
    date: textBetween(item, 'regDate') || textBetween(item, 'date') || textBetween(item, 'publishDate'),
    link: textBetween(item, 'link') || textBetween(item, 'url') || fallbackLink,
    summary: textBetween(item, 'contents') || textBetween(item, 'summary') || textBetween(item, 'description')
  })).filter((item) => item.title);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=900'
    }
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'policy';
  const rows = Math.min(Number(url.searchParams.get('rows') || 8), 12);
  const keyword = url.searchParams.get('keyword') || '';
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.SERVICE_KEY;
  const config = ENDPOINTS[type] || ENDPOINTS.policy;

  if (!key) {
    return json({ mode: 'fallback', source: config.fallback, items: FALLBACK_ITEMS.slice(0, rows) });
  }

  for (const operation of config.operations) {
    const apiUrl = new URL(`${config.base}/${operation}`);
    apiUrl.searchParams.set('serviceKey', key);
    apiUrl.searchParams.set('pageNo', '1');
    apiUrl.searchParams.set('numOfRows', String(rows));
    if (keyword) apiUrl.searchParams.set('keyword', keyword);

    try {
      const response = await fetch(apiUrl.toString(), { cf: { cacheTtl: 900, cacheEverything: true } });
      const body = await response.text();
      const items = parseItems(body, config.fallback);
      if (response.ok && items.length) {
        return json({ mode: 'live', source: apiUrl.toString().replace(key, '***'), items });
      }
    } catch (error) {
      // Try the next documented/candidate operation name.
    }
  }

  return json({ mode: 'fallback', source: config.fallback, items: FALLBACK_ITEMS.slice(0, rows) });
}
