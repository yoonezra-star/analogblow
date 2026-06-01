const PAJU_LAWD_CD = '41480';
const UNJEONG_DONGS = ['야당동', '동패동', '목동동', '와동동', '다율동', '상지석동'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=1800'
    }
  });
}

function dealMonthOffset(offset = 1) {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const target = new Date(Date.UTC(year, month - 1 - offset, 1));
  return `${target.getUTCFullYear()}${String(target.getUTCMonth() + 1).padStart(2, '0')}`;
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : '';
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseItems(xml, rows) {
  const blocks = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  return blocks
    .map((item) => {
      const dong = textBetween(item, 'umdNm') || textBetween(item, 'umdNm') || textBetween(item, '법정동');
      const aptName = textBetween(item, 'aptNm') || textBetween(item, '아파트');
      const dealYear = textBetween(item, 'dealYear') || textBetween(item, '년');
      const dealMonth = textBetween(item, 'dealMonth') || textBetween(item, '월');
      const dealDay = textBetween(item, 'dealDay') || textBetween(item, '일');
      return {
        aptName,
        dong,
        dealMonth: [dealYear, String(dealMonth).padStart(2, '0'), String(dealDay).padStart(2, '0')].filter(Boolean).join('.'),
        area: textBetween(item, 'excluUseAr') || textBetween(item, '전용면적'),
        floor: textBetween(item, 'floor') || textBetween(item, '층'),
        amount: textBetween(item, 'dealAmount') || textBetween(item, '거래금액'),
        buildYear: textBetween(item, 'buildYear') || textBetween(item, '건축년도')
      };
    })
    .filter((item) => item.aptName && (!item.dong || UNJEONG_DONGS.some((dong) => item.dong.includes(dong))))
    .slice(0, rows);
}

function fallback(reason = 'missing-env') {
  return {
    mode: 'fallback',
    reason,
    source: 'https://rt.molit.go.kr/',
    items: [],
    guide: [
      '국토교통부 실거래가 공개시스템에서 지역을 경기도 파주시로 선택합니다.',
      '아파트 매매 또는 전월세 유형을 선택합니다.',
      '운정 생활권은 야당동, 동패동, 목동동, 와동동, 다율동, 상지석동을 함께 확인합니다.'
    ]
  };
}

export async function onRequestGet({ request, env }) {
  const requestUrl = new URL(request.url);
  const rows = Math.min(Math.max(Number(requestUrl.searchParams.get('rows') || 10), 1), 30);
  const monthParam = requestUrl.searchParams.get('month') || 'latest';
  const dealMonths = monthParam === 'latest'
    ? Array.from({ length: 6 }, (_, index) => dealMonthOffset(index + 1))
    : [monthParam.replace(/[^0-9]/g, '').slice(0, 6)];
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.MOLIT_SERVICE_KEY || env.SERVICE_KEY;

  if (!key) {
    return json(fallback('missing-env'));
  }

  const endpoints = [
    'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev',
    'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade'
  ];

  const candidates = [];
  for (const dealYmd of dealMonths) {
    for (const endpoint of endpoints) {
      candidates.push({ dealYmd, endpoint });
    }
  }

  const attempts = candidates.map(async ({ dealYmd, endpoint }) => {
    const apiUrl = new URL(endpoint);
    apiUrl.searchParams.set('serviceKey', key);
    apiUrl.searchParams.set('LAWD_CD', PAJU_LAWD_CD);
    apiUrl.searchParams.set('DEAL_YMD', dealYmd);
    apiUrl.searchParams.set('pageNo', '1');
    apiUrl.searchParams.set('numOfRows', String(Math.max(rows * 3, 30)));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('timeout'), 3500);

    try {
      const response = await fetch(apiUrl.toString(), {
        signal: controller.signal,
        cf: { cacheTtl: 1800, cacheEverything: true }
      });
      const body = await response.text();
      const items = parseItems(body, rows);
      if (response.ok && items.length) {
        return {
          mode: 'live',
          dealYmd,
          lawdCd: PAJU_LAWD_CD,
          source: apiUrl.toString().replace(key, '***'),
          items
        };
      }
    } finally {
      clearTimeout(timeout);
    }

    return null;
  });

  const results = await Promise.allSettled(attempts);
  const live = results
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map((result) => result.value)
    .sort((a, b) => b.dealYmd.localeCompare(a.dealYmd))[0];

  if (live) return json(live);
  return json(fallback('empty-or-api-error'));
}
