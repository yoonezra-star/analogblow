const FALLBACK_ITEMS = [
  {
    title: '운정 가족 생활과 관련된 중앙정부 정책뉴스',
    department: '정책브리핑',
    date: '',
    link: 'https://www.korea.kr/news/policyNewsList.do',
    summary: '교육, 보육, 교통, 복지, 문화 분야의 최신 정책은 대한민국 정책브리핑 원문에서 확인합니다.'
  },
  {
    title: '부처별 보도자료와 시행일 확인',
    department: '정책브리핑 보도자료',
    date: '',
    link: 'https://www.korea.kr/briefing/pressReleaseList.do',
    summary: '지원 대상, 신청 기간, 시행일은 보도자료 원문과 담당 부처 안내를 함께 확인합니다.'
  },
  {
    title: '파주시 공지와 운정 생활권 행정 안내',
    department: '파주시청',
    date: '',
    link: 'https://www.paju.go.kr/index.do',
    summary: '운정 행정복지센터, 보건소, 도서관, 문화행사, 지역 시설 관련 공지는 파주시청 공지가 가장 직접적입니다.'
  },
  {
    title: '경기도 교통·복지·가족 정책 뉴스',
    department: '경기도 뉴스',
    date: '',
    link: 'https://gnews.gg.go.kr/',
    summary: '광역교통, 경기지역화폐, 청년·가족 지원처럼 운정 생활에 영향을 주는 경기도 정책을 확인합니다.'
  },
  {
    title: '교육청과 학교 공지 확인',
    department: '경기도교육청',
    date: '',
    link: 'https://www.goe.go.kr/',
    summary: '학사 일정, 통학 안전, 학교 신설, 방과후·돌봄 관련 정보는 교육청과 학교 공지를 우선 확인합니다.'
  },
  {
    title: '정부24·복지로 신청 가능 여부 확인',
    department: '정부24·복지로',
    date: '',
    link: 'https://www.gov.kr/portal/main',
    summary: '민원, 증명, 복지서비스, 가족 지원 신청은 정부24와 복지로에서 대상 조건과 신청 방법을 최종 확인합니다.'
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

export async function onRequestHead() {
  return new Response(null, {
    status: 200,
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
