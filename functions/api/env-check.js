export async function onRequestGet({ env }) {
  const keys = Object.keys(env || {}).sort();
  return new Response(JSON.stringify({
    keys,
    hasNaverId: keys.includes('NAVER_SEARCH_CLIENT_ID'),
    hasNaverSecret: keys.includes('NAVER_SEARCH_CLIENT_SECRET') || keys.includes(' NAVER_SEARCH_CLIENT_SECRET'),
    hasDataGoKr: keys.includes('DATA_GO_KR_SERVICE_KEY')
  }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
