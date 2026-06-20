(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderList(container, data, query) {
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      container.innerHTML = '<p class="cafe-status">표시할 공개 카페글을 찾지 못했습니다. 아래 원문 검색으로 직접 확인하세요.</p>';
      return;
    }

    container.innerHTML = items.map((item) => `
      <article class="cafe-item">
        <a href="${escapeHtml(item.link)}" target="_blank" rel="nofollow noopener">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.description || '네이버 카페 공개글 원문에서 자세한 내용을 확인하세요.')}</p>
          <span class="cafe-meta">카페 · ${escapeHtml(item.cafename || '네이버 카페')}</span>
        </a>
      </article>
    `).join('');

    const status = container.closest('.local-cafe-section')?.querySelector('[data-cafe-status]');
    if (status) {
      status.textContent = data.mode === 'live'
        ? '네이버 카페 공개 검색 결과입니다.'
        : '원문 검색 링크로 지역 커뮤니티 후기를 확인할 수 있습니다.';
    }
  }

  async function loadCafeSection(section) {
    const query = section.getAttribute('data-cafe-query');
    const target = section.querySelector('[data-cafe-list]');
    if (!query || !target) return;

    try {
      const response = await fetch(`/api/cafe-search?q=${encodeURIComponent(query)}&display=5&sort=sim`);
      const data = await response.json();
      renderList(target, data, query);
    } catch (error) {
      target.innerHTML = `<p class="cafe-status">카페글을 불러오지 못했습니다. <a href="https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}" target="_blank" rel="nofollow noopener">네이버 카페에서 직접 검색</a>하세요.</p>`;
    }
  }

  document.querySelectorAll('[data-cafe-query]').forEach(loadCafeSection);
})();
