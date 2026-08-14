(() => {
  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const mapLink = (name, filter) => `./map-search?q=${encodeURIComponent(name)}&filter=${filter}`;

  function setStatus(element, data, fallbackText) {
    if (!element) return;
    if (data.mode === 'live') {
      const date = data.updatedAt ? ` · 기준일 ${escapeHtml(data.updatedAt)}` : '';
      element.innerHTML = `공식 데이터 ${data.items.length}건을 생활권 기준으로 표시합니다${date}. <a href="${escapeHtml(data.source)}" target="_blank" rel="noopener">원문 보기</a>`;
      return;
    }
    element.innerHTML = `${fallbackText} <a href="${escapeHtml(data.source)}" target="_blank" rel="noopener">공식 원문 보기</a>`;
  }

  function renderLibraries(items) {
    const target = document.querySelector('#officialLibraryList');
    if (!target || !items.length) return;
    target.innerHTML = items.map((item) => {
      const meta = [item.type, item.holiday ? `휴관 ${item.holiday}` : '', item.hours ? item.hours : '운영시간 확인'].filter(Boolean);
      const details = [item.address, item.phone].filter(Boolean).join(' · ') || '주소와 이용 정보는 공식 페이지에서 확인하세요.';
      const official = item.website && /^https?:\/\//.test(item.website)
        ? `<a class="directory-link" href="${escapeHtml(item.website)}" target="_blank" rel="noopener">공식 안내</a>`
        : '';
      return `<article class="directory-card"><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(details)}</p><div class="directory-meta">${meta.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}</div><a class="directory-link" href="${mapLink(item.name, 'library')}">지도에서 보기</a>${official}</article>`;
    }).join('');
  }

  function renderParking(items) {
    const target = document.querySelector('#officialParkingList');
    if (!target || !items.length) return;
    target.innerHTML = items.map((item) => {
      const official = item.website && /^https?:\/\//.test(item.website)
        ? `<a href="${escapeHtml(item.website)}" target="_blank" rel="noopener">공식 안내</a>`
        : '공식 포털 확인';
      return `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.address || '주소 확인 필요')}</td><td>${escapeHtml(item.siteName || item.manager || '파주시 공공데이터')}</td><td><a href="${mapLink(item.name, 'parking')}">지도 보기</a> · ${official}</td></tr>`;
    }).join('');
  }

  async function load(type, statusSelector, render, fallbackText) {
    const status = document.querySelector(statusSelector);
    const target = document.querySelector(type === 'libraries' ? '#officialLibraryList' : '#officialParkingList');
    if (!status && !target) return;
    try {
      const response = await fetch(`/api/public-facilities?type=${type}&rows=8`, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      setStatus(status, data, fallbackText);
      if (data.mode === 'live') render(data.items || []);
    } catch (error) {
      if (status) status.textContent = fallbackText;
    }
  }

  load('libraries', '#officialLibraryStatus', renderLibraries, '공식 도서관 데이터 연결을 준비 중입니다.');
  load('parking', '#officialParkingStatus', renderParking, '공식 주차장 데이터 연결을 준비 중입니다.');
})();
