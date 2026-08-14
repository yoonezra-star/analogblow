const BUS_STATION_ENDPOINT = 'https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationListv2';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  });
}

export async function onRequestHead() {
  return new Response(null, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  });
}

function fallback(reason, query = '') {
  return {
    mode: 'official-source',
    reason,
    query,
    items: [],
    sources: [
      { label: '경기버스정보', url: 'https://www.gbis.go.kr/' },
      { label: '국가대중교통정보센터 TAGO', url: 'https://www.tago.go.kr/' }
    ],
    guide: '실시간 도착과 운행 변동은 경기버스정보 또는 이용 중인 지도 앱에서 다시 확인하세요.'
  };
}

function normalizeItems(data) {
  const value = data?.msgBody?.busStationList;
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return items
    .map((item) => ({
      id: String(item.stationId || ''),
      name: String(item.stationName || '').trim(),
      number: item.mobileNo ? String(item.mobileNo) : '',
      region: String(item.regionName || '').trim(),
      centerLane: String(item.centerYn || '').toUpperCase() === 'Y',
      longitude: Number(item.x),
      latitude: Number(item.y)
    }))
    .filter((item) => item.id && item.name)
    .slice(0, 15);
}

export async function onRequestGet({ request, env }) {
  const requestUrl = new URL(request.url);
  const query = (requestUrl.searchParams.get('query') || '운정').trim().slice(0, 40);
  const key = env.DATA_GO_KR_SERVICE_KEY || env.PUBLIC_DATA_SERVICE_KEY || env.SERVICE_KEY;
  if (!key) return json(fallback('missing-service-key', query));
  if (!query) return json(fallback('missing-query', query), 400);

  const apiUrl = new URL(BUS_STATION_ENDPOINT);
  apiUrl.searchParams.set('serviceKey', key);
  apiUrl.searchParams.set('keyword', query);
  apiUrl.searchParams.set('format', 'json');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('timeout'), 7000);

  try {
    const response = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    const data = await response.json();
    const items = response.ok && Number(data?.msgHeader?.resultCode) === 0 ? normalizeItems(data) : [];
    if (!items.length) return json(fallback(response.ok ? 'empty-or-not-authorized' : 'upstream-error', query));

    return json({
      mode: 'live',
      provider: '경기도',
      query,
      fetchedAt: new Date().toISOString(),
      source: 'https://www.data.go.kr/data/15080666/openapi.do',
      items,
      guide: '정류소 위치와 경유 노선의 기본 정보입니다. 실시간 도착은 경기버스정보에서 확인하세요.'
    });
  } catch {
    return json(fallback('request-failed', query));
  } finally {
    clearTimeout(timeout);
  }
}
