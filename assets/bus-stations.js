(function () {
  const form = document.getElementById('stationSearchForm');
  const input = document.getElementById('stationQuery');
  const feed = document.getElementById('stationFeed');
  const status = document.getElementById('stationStatus');
  if (!form || !input || !feed || !status) return;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function mapUrl(item) {
    const keyword = [item.name, item.number, item.region, '파주시'].filter(Boolean).join(' ');
    return `https://map.naver.com/p/search/${encodeURIComponent(keyword)}`;
  }

  function renderFallback(data) {
    status.textContent = '공식 링크로 확인';
    feed.innerHTML = `
      <article class="feed-card station-empty">
        <span>실시간 정류소 확인</span>
        <strong>${escapeHtml(data.guide || '정류소 정보를 불러오지 못했습니다.')}</strong>
        <p>정류소명, 번호, 도착 예정은 공식 교통 서비스에서 직접 확인할 수 있습니다.</p>
        <a href="https://www.gbis.go.kr/" target="_blank" rel="noopener">경기버스정보 열기</a>
      </article>`;
  }

  function render(data) {
    const items = Array.isArray(data.items) ? data.items : [];
    if (data.mode !== 'live' || !items.length) {
      renderFallback(data);
      return;
    }

    status.textContent = `${items.length}개 공식 정류소`;
    feed.innerHTML = items.map((item) => `
      <article class="feed-card station-card">
        <span>${escapeHtml(item.region || '경기도')} ${item.centerLane ? '· 중앙차로' : ''}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <p>정류소 번호 ${escapeHtml(item.number || '공식 서비스에서 확인')} · ID ${escapeHtml(item.id)}</p>
        <a href="${mapUrl(item)}" target="_blank" rel="noopener">지도에서 위치 보기</a>
      </article>`).join('');
  }

  async function search(query) {
    const normalized = query.trim();
    if (!normalized) return;
    status.textContent = '정류소 확인 중';
    feed.innerHTML = '<article class="feed-card"><strong>공식 정류소 정보를 불러오는 중입니다.</strong><p>결과는 정류소명과 번호 기준으로 표시됩니다.</p></article>';

    try {
      const response = await fetch(`/api/bus-stations?query=${encodeURIComponent(normalized)}`);
      const data = await response.json();
      render(data);
    } catch {
      renderFallback({ guide: '정류소 정보를 불러오지 못했습니다.' });
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search(input.value);
  });

  search(input.value);
})();
