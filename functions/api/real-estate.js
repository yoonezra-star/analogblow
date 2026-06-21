const PAJU_LAWD_CD = '41480';
const UNJEONG_DONGS = ['야당동', '동패동', '목동동', '와동동', '다율동', '상지석동'];

const DATASETS = {
  'apt-trade': {
    label: '아파트 매매',
    endpoints: [
      'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev'
    ],
    dealKind: 'trade'
  },
  'apt-rent': {
    label: '아파트 전월세',
    endpoints: [
      'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent'
    ],
    dealKind: 'rent'
  },
  'rh-trade': {
    label: '연립다세대 매매',
    endpoints: [
      'https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade'
    ],
    dealKind: 'trade'
  },
  'offi-trade': {
    label: '오피스텔 매매',
    endpoints: [
      'https://apis.data.go.kr/1613000/RTMSDataSvcOffiTrade/getRTMSDataSvcOffiTrade'
    ],
    dealKind: 'trade'
  }
};

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

function dealMonthOffset(offset = 1) {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1 - offset, 1));
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

function firstText(item, tags) {
  for (const tag of tags) {
    const value = textBetween(item, tag);
    if (value) return value;
  }
  return '';
}

function normalizeAmount(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function lifeZone(dong = '') {
  if (dong.includes('야당')) return 'yadang';
  if (dong.includes('동패') || dong.includes('상지석')) return 'unjeong';
  if (dong.includes('목동') || dong.includes('와동')) return 'sannae';
  if (dong.includes('다율')) return 'chorong';
  return 'etc';
}

function areaGroup(areaValue = '') {
  const area = Number(String(areaValue).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(area) || area <= 0) return 'unknown';
  if (area < 60) return 'under60';
  if (area < 85) return '60to84';
  if (area < 101) return '85to100';
  return 'over100';
}

function parseItems(xml, rows, datasetKey, dataset) {
  const blocks = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  return blocks
    .map((item) => {
      const dong = firstText(item, ['umdNm', 'umdName', '법정동']);
      const name = firstText(item, ['aptNm', 'mhouseNm', 'offiNm', '단지명', '아파트', '연립다세대', '오피스텔']);
      const dealYear = firstText(item, ['dealYear', '년']);
      const dealMonth = firstText(item, ['dealMonth', '월']);
      const dealDay = firstText(item, ['dealDay', '일']);
      const deposit = firstText(item, ['deposit', 'depositAmount', '보증금액']);
      const monthly = firstText(item, ['monthlyRent', '월세금액']);
      const tradeAmount = firstText(item, ['dealAmount', '거래금액']);

      const area = firstText(item, ['excluUseAr', '전용면적']);
      return {
        type: dataset.label,
        dataset: datasetKey,
        name,
        dong,
        lifeZone: lifeZone(dong),
        dealDate: [dealYear, String(dealMonth).padStart(2, '0'), String(dealDay).padStart(2, '0')]
          .filter(Boolean)
          .join('.'),
        area,
        areaGroup: areaGroup(area),
        floor: firstText(item, ['floor', '층']),
        amount: dataset.dealKind === 'rent'
          ? `보증금 ${normalizeAmount(deposit) || '-'} / 월세 ${normalizeAmount(monthly) || '0'}`
          : normalizeAmount(tradeAmount),
        buildYear: firstText(item, ['buildYear', '건축년도']),
        roadName: firstText(item, ['roadNm', '도로명'])
      };
    })
    .filter((item) => item.name)
    .filter((item) => !item.dong || UNJEONG_DONGS.some((dong) => item.dong.includes(dong)))
    .slice(0, rows);
}

function fallback(datasetKey, reason = 'missing-env') {
  const dataset = DATASETS[datasetKey] || DATASETS['apt-trade'];
  return {
    mode: 'fallback',
    reason,
    dataset: datasetKey,
    label: dataset.label,
    source: 'https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=',
    items: [],
    guide: [
      '국토교통부 실거래가 공개시스템 자료제공에서 거래 유형을 선택합니다.',
      '지역을 경기도 파주시로 선택한 뒤 운정 생활권 법정동을 확인합니다.',
      '운정 생활권은 야당동, 동패동, 목동동, 와동동, 다율동, 상지석동을 함께 확인합니다.'
    ]
  };
}

export async function onRequestGet({ request, env }) {
  const requestUrl = new URL(request.url);
  const datasetKey = requestUrl.searchParams.get('type') || 'apt-trade';
  const dataset = DATASETS[datasetKey] || DATASETS['apt-trade'];
  const rows = Math.min(Math.max(Number(requestUrl.searchParams.get('rows') || 10), 1), 30);
  const monthParam = requestUrl.searchParams.get('month') || 'latest';
  const dealMonths = monthParam === 'latest'
    ? Array.from({ length: 6 }, (_, index) => dealMonthOffset(index + 1))
    : [monthParam.replace(/[^0-9]/g, '').slice(0, 6)];
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.MOLIT_SERVICE_KEY || env.SERVICE_KEY;

  if (!key) return json(fallback(datasetKey, 'missing-env'));

  const candidates = [];
  for (const dealYmd of dealMonths) {
    for (const endpoint of dataset.endpoints) {
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
      const items = parseItems(body, rows, datasetKey, dataset);
      if (response.ok && items.length) {
        return {
          mode: 'live',
          dataset: datasetKey,
          label: dataset.label,
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
  return json(fallback(datasetKey, 'empty-or-api-error'));
}
