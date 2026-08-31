(() => {
  const root = document.querySelector('[data-cafe-directory]');
  if (!root) return;

  const groups = {
    yadang: { title: '야당역·야당동', description: '호수공원 뷰, 브런치, 디저트와 야당역 접근성을 기준으로 비교합니다.' },
    mokdong: { title: '산내·목동동', description: '대형카페, 동네 디저트, 브런치와 카공·아이 동반 조건을 비교합니다.' },
    dongpae: { title: '동패·교하 생활권', description: '로스터리, 신상 카페, 늦게까지 하는 디저트와 차량 접근성을 봅니다.' },
    starfield: { title: '스타필드빌리지 운정·와동동', description: '쇼핑 동선과 주차, 베이커리·북카페·LP 감성 카페를 한 번에 비교합니다.' }
  };

  const detailPages = {
    'pattio-unjeong': './posts/unjeong-pattio-cafe-review-guide',
    'jacob-yadang': './posts/yadang-cafe-jacob-view-parking-guide',
    'ink-coffee-starfield-unjeong': './posts/starfield-unjeong-ink-coffee-guide',
    'artisan-bakers-starfield-unjeong': './posts/starfield-unjeong-artisan-bakers-guide',
    'vivamus-dongpae': './posts/dongpae-vivamus-cafe-guide',
    'or-coffee-yadang': './posts/yadang-or-coffee-roastery-guide',
    'navajo-yadang': './posts/yadang-cafe-navajo-guide',
    'brunchbean-yadang': './posts/yadang-brunchbean-paju-guide',
    'cafedang-mokdong': './posts/mokdong-cafedang-dessert-guide',
    'main-place-dongpae': './posts/dongpae-main-place-large-cafe-guide'
  };

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  const renderCard = (cafe) => {
    const phone = cafe.phone ? `<br><b>전화</b> ${escapeHtml(cafe.phone)}` : '';
    const tags = Array.isArray(cafe.fit) ? cafe.fit.join(' · ') : '';
    const mapHref = `./map-search?q=${encodeURIComponent(cafe.name)}`;
    const detail = detailPages[cafe.slug] ? `<a href="${detailPages[cafe.slug]}">상세 가이드</a> · ` : '';
    return `<article class="article-card cafe-directory-card"><span>${escapeHtml(cafe.area)} · ${escapeHtml(tags)}</span><strong>${escapeHtml(cafe.name)}</strong><p><b>주소</b> ${escapeHtml(cafe.address)}<br><b>운영</b> ${escapeHtml(cafe.hours)}<br><b>주차</b> ${escapeHtml(cafe.parking)}${phone}</p><p>${escapeHtml(cafe.reviewSummary)}</p><p>${detail}<a href="${escapeHtml(cafe.naverReviewSearch)}" target="_blank" rel="noopener noreferrer">네이버 후기 검색</a> · <a href="${escapeHtml(cafe.reviewSource)}" target="_blank" rel="noopener noreferrer">후기 근거 보기</a> · <a href="${mapHref}">지도 찾기</a></p></article>`;
  };

  fetch('./data/cafes-verified.json?v=20260831-4')
    .then((response) => {
      if (!response.ok) throw new Error('cafe-data');
      return response.json();
    })
    .then((data) => {
      const cafes = Array.isArray(data.cafes) ? data.cafes : [];
      root.innerHTML = Object.entries(groups).map(([key, meta]) => {
        const cards = cafes.filter((cafe) => cafe.group === key).map(renderCard).join('');
        if (!cards) return '';
        return `<section class="rich-section" id="cafe-${key}" aria-labelledby="cafe-${key}-title"><h2 id="cafe-${key}-title">${meta.title}</h2><p>${meta.description}</p><div class="article-list">${cards}</div></section>`;
      }).join('');

      const count = document.querySelector('[data-cafe-count]');
      if (count) count.textContent = String(cafes.length);
    })
    .catch(() => {
      root.innerHTML = '<div class="notice-box"><strong>카페 목록을 불러오지 못했습니다.</strong><p>잠시 후 다시 확인하거나 위의 생활지도에서 운정 카페를 검색해 주세요.</p></div>';
    });
})();