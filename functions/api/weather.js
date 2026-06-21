const SAMPLE = {
  mode: 'fallback',
  location: '파주 운정',
  summary: {
    sky: '공식 예보 확인 필요',
    temperature: '',
    rain: '',
    wind: ''
  },
  items: [
    { label: '등원·등교', value: '우산, 미세먼지, 체감온도 확인' },
    { label: '주말 나들이', value: '강수확률과 바람을 먼저 확인' },
    { label: '차량 이동', value: '비·눈 예보 시 주차장과 실내 코스 우선' }
  ],
  source: 'https://www.weather.go.kr/'
};

function toGrid(lat, lon) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;
  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;
  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5)
  };
}

function koreaBaseTime() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const slots = [2300, 2000, 1700, 1400, 1100, 800, 500, 200];
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const hourMinute = now.getUTCHours() * 100 + now.getUTCMinutes();
  const available = slots.find((slot) => hourMinute >= slot + 45);
  if (available) return { base_date: `${y}${m}${d}`, base_time: String(available).padStart(4, '0') };
  const prev = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return {
    base_date: `${prev.getUTCFullYear()}${String(prev.getUTCMonth() + 1).padStart(2, '0')}${String(prev.getUTCDate()).padStart(2, '0')}`,
    base_time: '2300'
  };
}

function summarize(items) {
  const grouped = new Map();
  for (const item of items) {
    const key = `${item.fcstDate}${item.fcstTime}`;
    if (!grouped.has(key)) grouped.set(key, {});
    grouped.get(key)[item.category] = item.fcstValue;
  }
  const first = Array.from(grouped.values()).find((row) => row.TMP || row.SKY || row.PTY) || {};
  const skyMap = { '1': '맑음', '3': '구름많음', '4': '흐림' };
  const rainMap = { '0': '강수 없음', '1': '비', '2': '비/눈', '3': '눈', '4': '소나기' };
  return {
    sky: skyMap[first.SKY] || '예보 확인',
    temperature: first.TMP ? `${first.TMP}℃` : '',
    rain: rainMap[first.PTY] || (first.POP ? `강수확률 ${first.POP}%` : ''),
    wind: first.WSD ? `${first.WSD}m/s` : ''
  };
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
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.SERVICE_KEY;
  if (!key) return json(SAMPLE);

  const requestUrl = new URL(request.url);
  const lat = Number(requestUrl.searchParams.get('lat') || 37.7265);
  const lon = Number(requestUrl.searchParams.get('lon') || 126.7510);
  const { nx, ny } = toGrid(lat, lon);
  const { base_date, base_time } = koreaBaseTime();
  const apiUrl = new URL('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst');
  apiUrl.searchParams.set('serviceKey', key);
  apiUrl.searchParams.set('pageNo', '1');
  apiUrl.searchParams.set('numOfRows', '120');
  apiUrl.searchParams.set('dataType', 'JSON');
  apiUrl.searchParams.set('base_date', base_date);
  apiUrl.searchParams.set('base_time', base_time);
  apiUrl.searchParams.set('nx', String(nx));
  apiUrl.searchParams.set('ny', String(ny));

  try {
    const response = await fetch(apiUrl.toString(), { cf: { cacheTtl: 900, cacheEverything: true } });
    const data = await response.json();
    const items = data?.response?.body?.items?.item || [];
    if (!response.ok || !items.length) return json(SAMPLE);
    return json({
      mode: 'live',
      location: '파주 운정',
      grid: { nx, ny },
      base: { base_date, base_time },
      summary: summarize(items),
      items: [
        { label: '등원·등교', value: '기온과 강수 형태를 기준으로 우산·겉옷을 확인하세요.' },
        { label: '주말 나들이', value: '강수확률이 높으면 도서관·실내 문화시설을 먼저 보세요.' },
        { label: '차량 이동', value: '비·눈 예보 시 역세권 주차와 지하주차장 동선을 우선 확인하세요.' }
      ],
      source: apiUrl.toString().replace(key, '***')
    });
  } catch (error) {
    return json(SAMPLE);
  }
}
