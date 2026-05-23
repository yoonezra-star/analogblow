export async function onRequestGet({ env }) {
  const clientId =
    env.NAVER_SEARCH_CLIENT_ID ||
    env.NAVER_CLIENT_ID ||
    env.NAVER_CAFE_CLIENT_ID;
  const secretCandidates = [
    ['NAVER_SEARCH_CLIENT_SECRET', env.NAVER_SEARCH_CLIENT_SECRET],
    [' NAVER_SEARCH_CLIENT_SECRET', env[' NAVER_SEARCH_CLIENT_SECRET']],
    ['NAVER_CLIENT_SECRET', env.NAVER_CLIENT_SECRET],
    ['NAVER_CAFE_CLIENT_SECRET', env.NAVER_CAFE_CLIENT_SECRET]
  ];
  const used = secretCandidates.find(([, value]) => value);
  const clientSecret = used ? used[1] : '';

  let naverStatus = null;
  let naverOk = false;
  if (clientId && clientSecret) {
    const apiUrl = new URL('https://openapi.naver.com/v1/search/cafearticle.json');
    apiUrl.searchParams.set('query', '운정 소아과');
    apiUrl.searchParams.set('display', '1');
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });
    naverStatus = response.status;
    naverOk = response.ok;
  }

  return new Response(JSON.stringify({
    hasClientId: Boolean(clientId),
    clientIdLength: clientId ? clientId.length : 0,
    usedSecretKey: used ? used[0] : null,
    secretLength: clientSecret ? clientSecret.length : 0,
    naverStatus,
    naverOk
  }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
