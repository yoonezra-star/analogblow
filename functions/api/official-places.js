const DATASETS = {
  parking: {
    file: 'https://www.data.go.kr/cmm/cmm/fileDownload.do?atchFileId=FILE_000000003542139&fileDetailSn=1&insertDataPrcus=N',
    source: 'https://www.data.go.kr/data/15154067/fileData.do',
    provider: '경기도 파주시',
    label: '파주시 지능형교통체계 주차장정보'
  },
  library: {
    file: 'https://www.data.go.kr/cmm/cmm/fileDownload.do?atchFileId=FILE_000000003241109&fileDetailSn=1&insertDataPrcus=N',
    source: 'https://www.data.go.kr/data/3044643/fileData.do',
    provider: '경기도 파주시',
    label: '파주시 작은도서관현황'
  }
};

const UNJEONG_TERMS = ['운정', '야당', '동패', '목동', '와동', '다율', '상지석', '교하', '산내', '한빛', '해솔', '가람', '초롱', '한울', '별하람'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=21600'
    }
  });
}

export async function onRequestHead() {
  return new Response(null, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=21600'
    }
  });
}

function decodeCsv(bytes) {
  const utf8 = new TextDecoder('utf-8').decode(bytes);
  if (utf8.includes('주차장명') || utf8.includes('도서관명')) return utf8;
  return new TextDecoder('euc-kr').decode(bytes);
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
}

function inUnjeong(row) {
  const text = Object.values(row).join(' ');
  return UNJEONG_TERMS.some((term) => text.includes(term));
}

function fallback(dataset, reason) {
  return {
    mode: 'official-source',
    reason,
    provider: dataset.provider,
    dataset: dataset.label,
    items: [],
    source: dataset.source,
    guide: '데이터 연결이 지연되었습니다. 공식 원문에서 최신 주소·운영 상태를 확인하세요.'
  };
}

function normalizeParking(row, source) {
  const latitude = Number(row['위도']);
  const longitude = Number(row['경도']);
  if (!row['주차장명'] || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    name: row['주차장명'],
    address: row['도로명주소'] || row['지번주소'],
    latitude,
    longitude,
    dataDate: row['데이터기준일자'],
    source
  };
}

function normalizeLibrary(row, source) {
  const latitude = Number(row['위도']);
  const longitude = Number(row['경도']);
  if (!row['도서관명'] || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    name: row['도서관명'],
    address: row['소재지도로명주소'] || row['소재지지번주소'],
    phone: row['전화번호'],
    closedDays: row['휴관일'],
    openTime: row['운영시작시각'],
    closeTime: row['운영종료시각'],
    seats: row['열람좌석수'],
    homepage: row['홈페이지주소'],
    note: row['비고'],
    latitude,
    longitude,
    dataDate: row['데이터기준일자'],
    source
  };
}

export async function onRequestGet({ request }) {
  const type = new URL(request.url).searchParams.get('type') || 'parking';
  const dataset = DATASETS[type];
  if (!dataset) return json({ mode: 'official-source', items: [], guide: '지원하지 않는 데이터 유형입니다.' }, 400);

  try {
    const response = await fetch(dataset.file, { cf: { cacheTtl: 21600, cacheEverything: true } });
    if (!response.ok) return json(fallback(dataset, `upstream-${response.status}`));
    const rows = parseCsv(decodeCsv(await response.arrayBuffer()));
    const normalizer = type === 'library' ? normalizeLibrary : normalizeParking;
    const items = rows.filter(inUnjeong).map((row) => normalizer(row, dataset.source)).filter(Boolean);
    return json({
      mode: 'live',
      provider: dataset.provider,
      dataset: dataset.label,
      fetchedAt: new Date().toISOString(),
      source: dataset.source,
      items
    });
  } catch (error) {
    return json(fallback(dataset, 'request-failed'));
  }
}
