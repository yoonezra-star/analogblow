(function () {
  const configs = {
    parking: {
      feed: 'officialParkingFeed',
      status: 'officialParkingStatus',
      label: '주차장',
      mapFilter: 'parking',
      sourceLabel: '파주시 주차장 원자료 보기'
    },
    library: {
      feed: 'officialLibraryFeed',
      status: 'officialLibraryStatus',
      label: '작은도서관',
      mapFilter: 'library',
      sourceLabel: '파주시 작은도서관 원자료 보기'
    }
  };

  function addText(parent, tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.appendChild(element);
    return element;
  }

  function renderFallback(container, config, data) {
    container.replaceChildren();
    const card = document.createElement('article');
    card.className = 'feed-card';
    addText(card, 'strong', `${config.label} 공식 데이터 연결을 확인할 수 없습니다.`);
    addText(card, 'p', data.guide || '공식 원문에서 최신 정보를 확인하세요.');
    if (data.source) {
      const link = document.createElement('a');
      link.href = data.source;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = config.sourceLabel;
      card.appendChild(link);
    }
    container.appendChild(card);
  }

  function renderItems(container, config, items) {
    container.replaceChildren();
    items.slice(0, 10).forEach((item) => {
      const card = document.createElement('article');
      card.className = 'feed-card';
      addText(card, 'span', `${config.label} · 데이터 기준일 ${item.dataDate || '확인 필요'}`);
      addText(card, 'strong', item.name);
      addText(card, 'p', item.address || '주소 정보 없음');
      if (config.mapFilter === 'library') {
        const hours = [item.openTime, item.closeTime].filter(Boolean).join('~');
        if (hours || item.closedDays) addText(card, 'p', `운영 참고: ${hours || '시간 미기재'}${item.closedDays ? ` · 휴관 ${item.closedDays}` : ''}`);
        if (item.note) addText(card, 'p', `비고: ${item.note}`);
      } else {
        addText(card, 'p', '요금·운영·만차 여부는 파주시 주차포털에서 방문 전에 다시 확인하세요.');
      }
      const mapLink = document.createElement('a');
      mapLink.href = `./map-search?filter=${config.mapFilter}&q=${encodeURIComponent(item.name)}`;
      mapLink.textContent = '지도에서 확인';
      card.appendChild(mapLink);
      if (item.source) {
        const sourceLink = document.createElement('a');
        sourceLink.href = item.source;
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener';
        sourceLink.textContent = config.sourceLabel;
        card.appendChild(sourceLink);
      }
      container.appendChild(card);
    });
  }

  function loadPanel(type) {
    const config = configs[type];
    const feed = document.getElementById(config.feed);
    const status = document.getElementById(config.status);
    if (!feed || !status) return;

    fetch(`./api/official-places?type=${type}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('official data unavailable')))
      .then((data) => {
        if (data.mode !== 'live' || !Array.isArray(data.items) || !data.items.length) {
          status.textContent = '공식 원문 확인 필요';
          renderFallback(feed, config, data);
          return;
        }
        status.textContent = `공식 데이터 ${data.items.length}건`;
        renderItems(feed, config, data.items);
      })
      .catch(() => {
        status.textContent = '연결 지연';
        renderFallback(feed, config, {
          guide: '공식 데이터 연결이 지연되었습니다. 원문에서 최신 정보를 확인하세요.',
          source: type === 'library' ? 'https://www.data.go.kr/data/3044643/fileData.do' : 'https://www.data.go.kr/data/15154067/fileData.do'
        });
      });
  }

  loadPanel('parking');
  loadPanel('library');
}());
