(function () {
  var main = document.querySelector('main');
  if (main && !main.id) main.id = 'site-main-content';
  if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');

  if (main && !document.querySelector('.skip-link')) {
    var skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#site-main-content';
    skipLink.textContent = '본문으로 바로가기';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Supply basic page context for hub pages that do not define their own JSON-LD.
  if (main && !document.querySelector('script[type="application/ld+json"]')) {
    var canonicalLink = document.querySelector('link[rel="canonical"]');
    var pageDescription = document.querySelector('meta[name="description"]');
    var pageHeading = main.querySelector('h1');
    var pageUrl = canonicalLink ? canonicalLink.href : window.location.href;

    if (pageHeading && pageUrl) {
      var pageSchema = document.createElement('script');
      pageSchema.type = 'application/ld+json';
      pageSchema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageHeading.textContent.trim(),
        description: pageDescription ? pageDescription.content : '',
        url: pageUrl,
        inLanguage: 'ko-KR',
        isPartOf: {
          '@type': 'WebSite',
          name: '파주운정라이프',
          url: 'https://analogblow.com/'
        }
      });
      document.head.appendChild(pageSchema);
    }
  }

  var refreshedArticlePaths = {
    '/posts/policy-government24-family-documents': '2026-08-15',
    '/posts/parking-gtx-check': '2026-08-15',
    '/posts/culture-rainy-day-course': '2026-08-15',
    '/posts/yadang-station-life-guide': '2026-08-15',
    '/posts/facility-library-welfare-routine': '2026-08-15',
    '/posts/culture-restaurant-parking-check': '2026-08-15',
    '/posts/culture-family-restaurant-check': '2026-08-15',
    '/posts/policy-childcare-after-school-check': '2026-08-15',
    '/posts/kids-kindergarten-first-week': '2026-08-15',
    '/posts/unjeong-cafe-parking-guide': '2026-08-15',
    '/posts/kids-library-after-school': '2026-08-15',
    '/posts/weekend-kids-play-parking-check': '2026-08-15',
    '/posts/health-child-dental-check': '2026-08-15',
    '/posts/health-child-ent-visit-guide': '2026-08-15',
    '/posts/culture-park-before-visit': '2026-08-15',
    '/posts/health-call-before-visit': '2026-08-15',
    '/posts/kids-after-school-route': '2026-08-15',
    '/posts/parking-rainy-day-dropoff': '2026-08-15',
    '/posts/policy-paju-local-currency-check': '2026-08-15',
    '/posts/mobility-bus-commute-check': '2026-08-15',
    '/posts/health-weekend-pharmacy': '2026-08-15',
    '/posts/kids-school-route-check': '2026-08-15',
    '/posts/mobility-unjeong-commute-transfer-guide': '2026-08-15',
    '/posts/unjeong-rent-check-guide': '2026-08-15',
    '/posts/unjeong-real-estate-transaction-guide': '2026-08-15',
    '/posts/culture-free-indoor-weekend': '2026-08-15',
    '/posts/facility-library-happycenter-guide': '2026-08-15',
    '/posts/unjeong-kids-cafe-check': '2026-08-15',
    '/posts/parking-restaurant-shopping-route': '2026-08-15',
    '/posts/gyoha-dongpae-life-guide': '2026-08-15',
    '/posts/weather-school-weekend-prep': '2026-08-15',
    '/posts/sannae-haesol-life-guide': '2026-08-15',
    '/posts/unjeong-station-life-guide': '2026-08-15',
    '/posts/weekly-unjeong-family-calendar-check': '2026-08-15',
    '/posts/unjeong-cafe-family-guide': '2026-08-15',
    '/posts/kids-library-routine': '2026-08-15',
    '/posts/mobility-ddokbus-unjeong-guide': '2026-08-15',
    '/posts/paju-event-source-check': '2026-08-15',
    '/posts/unjeong-lake-cafe-walk-course': '2026-08-15',
    '/posts/unjeong-apartment-living-zone-check': '2026-08-15'
  };
  var normalizedPath = window.location.pathname.replace(/\/$/, '');
  var refreshedDate = refreshedArticlePaths[normalizedPath];

  if (refreshedDate) {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (node) {
      try {
        var schema = JSON.parse(node.textContent);
        var entries = Array.isArray(schema) ? schema : [schema];
        var changed = false;

        entries.forEach(function (entry) {
          if (entry && entry['@type'] === 'Article') {
            entry.dateModified = refreshedDate;
            changed = true;
          }
        });

        if (changed) {
          node.textContent = JSON.stringify(Array.isArray(schema) ? entries : entries[0]);
        }
      } catch (error) {
        // Leave malformed third-party schema untouched.
      }
    });
  }

  // Keep the editorial owner and verification path visible on every article.
  document.querySelectorAll('.article-page').forEach(function (article) {
    if (article.querySelector('.article-attribution')) return;

    var attribution = document.createElement('section');
    attribution.className = 'article-attribution';
    attribution.setAttribute('aria-label', '콘텐츠 작성 및 검토 정보');
    attribution.innerHTML = [
      '<span><strong>작성·검토</strong> 파주운정라이프 운영팀</span>',
      '<span>공식 기관과 공공데이터를 우선 확인합니다.</span>',
      '<a href="/data">공식 출처</a>',
      '<a href="/editorial-policy">편집 기준</a>',
      '<a href="/contact">오류 제보</a>'
    ].join('');

    var standard = article.querySelector('.info-standard');
    if (standard) standard.insertAdjacentElement('afterend', attribution);
    else article.insertBefore(attribution, article.firstChild);
  });

  var path = window.location.pathname.replace(/\/$/, '') || '/';

  var repairGroups = [
    { href: '/local-services#service-door', label: '현관·문', description: '중문·방문·도어락·방화문' },
    { href: '/local-services#service-bath', label: '욕실·배관', description: '세면대·양변기·수전·배수' },
    { href: '/local-services#service-kitchen', label: '주방·수납', description: '싱크대·상판·수납장·후드' },
    { href: '/local-services#service-laundry', label: '세탁·가전', description: '세탁기·식기세척기·냉장고' },
    { href: '/local-services#service-appliance', label: '냉난방', description: '에어컨·보일러·온수' },
    { href: '/local-services#service-laundry', label: '전기·스마트홈', description: '콘센트·조명·센서·스마트기기' },
    { href: '/local-services#service-bath', label: '창호·베란다', description: '샷시·방충망·창틀·베란다' }
  ];

  if (path === '/') {
    var homeFlow = document.querySelector('#start-flow .start-flow-grid');
    var homeFlowTitle = document.querySelector('#startFlowTitle');
    if (homeFlowTitle) homeFlowTitle.textContent = '운정 생활은 일곱 개 허브에서 시작하세요.';

    if (homeFlow && !homeFlow.querySelector('[data-home-repair-hub]')) {
      var repairHub = document.createElement('a');
      repairHub.className = 'start-flow-card hub-card';
      repairHub.href = '/local-services';
      repairHub.setAttribute('data-home-repair-hub', 'true');
      repairHub.innerHTML = '<i class="flow-mark" aria-hidden="true">집</i><span>07 생활수리·가전</span><strong>고장 증상부터 수리 범위까지 확인</strong><p>중문, 욕실, 주방, 세탁기, 냉장고, 에어컨, 보일러, 창호 문제를 증상별로 찾습니다.</p><em>생활수리 가이드 열기</em>';
      homeFlow.appendChild(repairHub);
    }

    var startFlowSection = document.getElementById('start-flow');
    if (startFlowSection && !document.querySelector('.home-repair-latest')) {
      var latestRepair = document.createElement('section');
      latestRepair.className = 'section weekly-edit home-repair-latest';
      latestRepair.innerHTML = [
        '<div class="section-head compact">',
          '<p class="eyebrow">집에서 바로 필요한 정보</p>',
          '<h2>최근 생활수리·가전 점검 글</h2>',
          '<p>증상을 먼저 구분하고 직접 확인할 범위와 전문가에게 맡길 범위를 나눠 보세요.</p>',
        '</div>',
        '<div class="weekly-list">',
          '<a href="/posts/unjeong-washer-door-lock-stuck-guide"><time>세탁기</time><strong>세탁기 도어 잠금·문 안열림</strong><span>배수 완료 여부, 잠금표시, 도어 정렬과 잠금장치를 구분합니다.</span></a>',
          '<a href="/posts/unjeong-dishwasher-door-latch-not-closing-guide"><time>식기세척기</time><strong>식기세척기 도어 안닫힘·래치 잠금</strong><span>바스켓 간섭, 도어 정렬, 래치와 잠금 인식을 확인합니다.</span></a>',
          '<a href="/posts/unjeong-aircon-pipe-insulation-condensation-guide"><time>에어컨</time><strong>에어컨 배관 보온재 결로·물방울</strong><span>보온재 손상과 배수 문제, 벽면 누수를 나눠 확인합니다.</span></a>',
          '<a href="/posts/unjeong-refrigerator-shelf-drawer-jam-break-guide"><time>냉장고</time><strong>냉장고 선반·서랍 걸림·파손</strong><span>성에·적재 간섭·레일과 플라스틱 파손을 구분합니다.</span></a>',
          '<a href="/posts/unjeong-entrance-door-viewer-lens-wobble-guide"><time>현관문</time><strong>현관문 도어뷰어·렌즈 흔들림</strong><span>렌즈 고정과 문 두께를 확인하고 방화문 임의 가공은 피합니다.</span></a>',
        '</div>',
        '<p class="section-more"><a href="/local-services">생활수리·가전 글 전체 보기 <span aria-hidden="true">→</span></a></p>'
      ].join('');
      startFlowSection.insertAdjacentElement('afterend', latestRepair);
    }
  }

  if (path === '/local-services') {
    var serviceSections = document.querySelectorAll('.rich-section');
    serviceSections.forEach(function (section) {
      var heading = section.querySelector('h3');
      if (!heading) return;
      if (heading.textContent.trim() === '현관·문·거실') section.id = 'service-door';
      if (heading.textContent.trim() === '욕실·베란다·배관') section.id = 'service-bath';
      if (heading.textContent.trim() === '주방·수납·가전') section.id = 'service-kitchen';
      if (heading.textContent.trim() === '세탁·창호·전기·스마트홈') section.id = 'service-laundry';
      if (heading.textContent.trim() === '바닥·벽·입주·가전') section.id = 'service-appliance';
    });

    var serviceArticle = document.querySelector('main article');
    var serviceIntro = serviceArticle ? serviceArticle.querySelector('h1 + p') : null;
    if (serviceArticle && serviceIntro && !serviceArticle.querySelector('.service-category-index')) {
      var serviceIndex = document.createElement('section');
      serviceIndex.className = 'rich-section service-category-index';
      serviceIndex.setAttribute('aria-label', '생활수리 카테고리');
      serviceIndex.innerHTML = '<h3>생활수리 카테고리 바로가기</h3><div class="article-list">' + repairGroups.map(function (item) {
        return '<a class="article-card" href="' + item.href + '"><span>카테고리</span><strong>' + item.label + '</strong><p>' + item.description + '</p><em>관련 글 보기</em></a>';
      }).join('') + '</div>';
      serviceIntro.insertAdjacentElement('afterend', serviceIndex);
    }
  }

  if (document.querySelector('.mobile-bottom-nav')) return;

  var items = [
    { href: '/', label: '홈', key: 'home', icon: '⌂' },
    { href: '/health', label: '병원', key: 'health', icon: '＋' },
    { href: '/map-search', label: '지도', key: 'map-search', icon: '⌖' },
    { href: '/kids', label: '아이', key: 'kids', icon: '学' },
    { href: '/culture-leisure', label: '주말', key: 'culture-leisure', icon: '◌' }
  ];

  document.querySelectorAll('.site-header .nav a').forEach(function (link) {
    var linkPath = new URL(link.href).pathname.replace(/\/$/, '') || '/';
    if (linkPath === path) link.setAttribute('aria-current', 'page');
  });
  var categoryGroups = [
    {
      label: '오늘의 운정',
      items: [
        { href: '/', label: '홈으로' },
        { href: '/weather-life', label: '날씨 생활' },
        { href: '/calendar', label: '생활 캘린더' },
        { href: '/map-search', label: '운정 생활 지도' },
        { href: '/public-contacts', label: '공공 연락처' },
        { href: '/fortune', label: '운세·해몽' }
      ]
    },
    {
      label: '아이생활',
      items: [
        { href: '/kids', label: '아이생활 전체' },
        { href: '/school-roadmap', label: '학교·등원' },
        { href: '/kids-play', label: '키즈·실내놀이' },
        { href: '/posts/kids-after-school-route', label: '하교 후 루틴' },
        { href: '/health', label: '아이 병원 동선' }
      ]
    },
    {
      label: '병원·약국',
      items: [
        { href: '/health', label: '병원·약국 전체' },
        { href: '/map-search?filter=hospital', label: '병원 찾기' },
        { href: '/map-search?filter=pharmacy', label: '약국 찾기' },
        { href: '/posts/health-night-holiday-pharmacy-guide', label: '야간·휴일 약국' },
        { href: '/posts/health-call-before-visit', label: '방문 전 전화 확인' }
      ]
    },
    {
      label: '지도·이동',
      items: [
        { href: '/map-search', label: '운정 생활 지도' },
        { href: '/mobility', label: '교통·주차 전체' },
        { href: '/parking-data', label: '주차 데이터' },
        { href: '/posts/gtx-unjeong-station-transfer-parking-guide-2026', label: 'GTX-A 환승·주차' },
        { href: '/posts/mobility-ddokbus-unjeong-guide', label: '똑버스 이용' },
        { href: '/posts/mobility-paprika-school-bus-guide', label: '파프리카 통학버스' },
        { href: '/map-search', label: '지도에서 찾기' }
      ]
    },
    {
      label: '주말·외식',
      items: [
        { href: '/culture-leisure', label: '주말·외식 전체' },
        { href: '/weekend', label: '가족 나들이' },
        { href: '/kids-play', label: '키즈·실내놀이' },
        { href: '/cafes', label: '카페' },
        { href: '/restaurants', label: '운정 상권 가이드' }
      ]
    },
    {
      label: '생활수리·가전',
      items: [
        { href: '/local-services', label: '생활수리 전체' },
        { href: '/local-services#service-door', label: '현관·문' },
        { href: '/local-services#service-bath', label: '욕실·배관' },
        { href: '/local-services#service-kitchen', label: '주방·수납' },
        { href: '/local-services#service-laundry', label: '세탁·가전·전기' },
        { href: '/local-services#service-appliance', label: '냉난방·생활가전' }
      ]
    },
    {
      label: '생활권·미래',
      items: [
        { href: '/neighborhoods', label: '생활권 가이드' },
        { href: '/unjeong-intro', label: '운정 소개' },
        { href: '/future-plan', label: '미래계획' },
        { href: '/policy-news', label: '정책 뉴스' },
        { href: '/movein', label: '입주 첫 달' },
        { href: '/polling-place', label: '투표소 확인' }
      ]
    }
  ];

  function externalLinkAttributes(item) {
    return item.external ? ' target="_blank" rel="noopener noreferrer" aria-label="' + item.label + ' 새 창 열기"' : '';
  }

  function externalLinkMark(item) {
    return item.external ? '<span class="site-external-mark" aria-hidden="true">↗</span>' : '';
  }

  var categoryNav = document.querySelector('.site-header .nav');
  if (categoryNav && !categoryNav.classList.contains('site-category-nav')) {
    categoryNav.classList.add('site-category-nav');
    categoryNav.setAttribute('aria-label', '파주운정라이프 카테고리');
    categoryNav.innerHTML = categoryGroups.map(function (group, groupIndex) {
      var menuId = 'siteCategoryMenu' + groupIndex;
      return [
        '<div class="site-category">',
          '<button class="site-category-toggle" type="button" aria-expanded="false" aria-controls="', menuId, '">',
            '<span>', group.label, '</span><span class="site-category-chevron" aria-hidden="true"></span>',
          '</button>',
          '<div class="site-category-menu" id="', menuId, '" role="menu" hidden>',
            group.items.map(function (item, itemIndex) {
              var itemUrl = new URL(item.href, window.location.origin);
              var current = (itemUrl.pathname.replace(/\/$/, '') || '/') + itemUrl.search;
              var active = current === path + window.location.search;
              return '<a role="menuitem" href="' + item.href + '"' + externalLinkAttributes(item) + (active ? ' aria-current="page"' : '') + (itemIndex === 0 ? ' class="site-category-all"' : '') + '>' + item.label + externalLinkMark(item) + '</a>';
            }).join(''),
          '</div>',
        '</div>'
      ].join('');
    }).join('');

    function closeCategory(category) {
      var button = category.querySelector('.site-category-toggle');
      var menu = category.querySelector('.site-category-menu');
      button.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
      category.classList.remove('is-open');
    }

    function openCategory(category, focusFirst) {
      categoryNav.querySelectorAll('.site-category.is-open').forEach(function (other) {
        if (other !== category) closeCategory(other);
      });
      var button = category.querySelector('.site-category-toggle');
      var menu = category.querySelector('.site-category-menu');
      button.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
      category.classList.add('is-open');
      if (focusFirst) menu.querySelector('a').focus();
    }

    categoryNav.querySelectorAll('.site-category').forEach(function (category) {
      var button = category.querySelector('.site-category-toggle');
      var menu = category.querySelector('.site-category-menu');

      button.addEventListener('click', function () {
        openCategory(category, false);
      });

      button.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          openCategory(category, true);
        }
        if (event.key === 'Escape') closeCategory(category);
      });

      menu.addEventListener('keydown', function (event) {
        var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
        var currentIndex = links.indexOf(document.activeElement);
        if (event.key === 'Escape') {
          event.preventDefault();
          closeCategory(category);
          button.focus();
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          links[(currentIndex + (event.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length].focus();
        }
      });

      if (window.matchMedia('(hover: hover) and (min-width: 721px)').matches) {
        var hoverCloseTimer;

        function cancelHoverClose() {
          window.clearTimeout(hoverCloseTimer);
        }

        function scheduleHoverClose() {
          cancelHoverClose();
          // Keep the menu available while the pointer crosses the visual gap.
          hoverCloseTimer = window.setTimeout(function () {
            if (!category.matches(':hover')) closeCategory(category);
          }, 240);
        }

        category.addEventListener('pointerenter', function () {
          cancelHoverClose();
          openCategory(category, false);
        });
        category.addEventListener('pointerleave', scheduleHoverClose);
        menu.addEventListener('pointerenter', cancelHoverClose);
      }

    });

    document.addEventListener('click', function (event) {
      if (!categoryNav.contains(event.target)) {
        categoryNav.querySelectorAll('.site-category.is-open').forEach(closeCategory);
      }
    });
  }

  var nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', '모바일 빠른 메뉴');

  nav.innerHTML = items.map(function (item) {
    var active = path === item.href || (item.href !== '/' && path.indexOf(item.href) === 0);
    return [
      '<a class="mobile-bottom-nav__item', active ? ' is-active' : '', '" href="', item.href, '"', active ? ' aria-current="page"' : '', '>',
      '<span class="mobile-bottom-nav__icon" aria-hidden="true">', item.icon, '</span>',
      '<span>', item.label, '</span>',
      '</a>'
    ].join('');
  }).join('');

  document.body.appendChild(nav);

  var header = document.querySelector('.site-header');
  if (!header || document.querySelector('.site-menu-toggle')) return;

  var toggle = document.createElement('button');
  var drawer = document.createElement('aside');
  var closeButton;
  var firstFocusable;
  var lastFocusable;

  toggle.className = 'site-menu-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'siteMenuDrawer');
  toggle.innerHTML = '<span aria-hidden="true">☰</span><span>전체 메뉴</span>';

  drawer.className = 'site-menu-drawer';
  drawer.id = 'siteMenuDrawer';
  drawer.hidden = true;
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', '파주운정라이프 전체 메뉴');
  drawer.innerHTML = [
    '<button class="site-menu-backdrop" type="button" aria-label="전체 메뉴 닫기"></button>',
    '<div class="site-menu-panel">',
      '<div class="site-menu-heading">',
        '<div><strong>파주운정라이프</strong><span>필요한 생활 정보를 바로 찾으세요.</span></div>',
        '<button class="site-menu-close" type="button" aria-label="전체 메뉴 닫기">×</button>',
      '</div>',
      '<nav class="site-menu-groups" aria-label="전체 메뉴 목록">',
        '<section><h2>바로 찾기</h2><a href="/map-search">지도검색</a><a href="/health">병원·약국</a><a href="/kids">아이생활</a><a href="/culture-leisure">주말·외식</a></section>',
        '<section><h2>생활 가이드</h2><a href="/neighborhoods">생활권</a><a href="/mobility">교통·주차</a><a href="/calendar">생활캘린더</a><a href="/cafes">카페·외식</a><a href="/restaurants">맛집</a></section>',
        '<section><h2>운정 정보</h2><a href="/unjeong-intro">운정소개</a><a href="/future-plan">미래계획</a><a href="/policy-news">정책뉴스</a><a href="/data">공식 데이터</a><a href="/guides">생활글</a></section>',
        '<section><h2>운영 정보</h2><a href="/about">소개</a><a href="/contact">정보 제보</a><a href="/editorial-policy">편집 기준</a></section>',
      '</nav>',
    '</div>'
  ].join('');

  drawer.querySelector('.site-menu-groups').innerHTML = categoryGroups.map(function (group) {
    return '<section><h2>' + group.label + '</h2>' + group.items.map(function (item) {
      return '<a href="' + item.href + '"' + externalLinkAttributes(item) + '>' + item.label + externalLinkMark(item) + '</a>';
    }).join('') + '</section>';
  }).join('') + '<section><h2>운영 정보</h2><a href="/about">소개</a><a href="/contact">정보 제보</a><a href="/editorial-policy">편집 기준</a></section>';

  header.insertBefore(toggle, header.querySelector('.nav'));
  document.body.appendChild(drawer);

  closeButton = drawer.querySelector('.site-menu-close');
  firstFocusable = closeButton;
  lastFocusable = drawer.querySelector('.site-menu-groups section:last-child a:last-child');

  function closeMenu() {
    drawer.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('site-menu-open');
    toggle.focus();
  }

  function openMenu() {
    drawer.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('site-menu-open');
    firstFocusable.focus();
  }

  toggle.addEventListener('click', function () {
    if (drawer.hidden) openMenu(); else closeMenu();
  });
  closeButton.addEventListener('click', closeMenu);
  drawer.querySelector('.site-menu-backdrop').addEventListener('click', closeMenu);
  drawer.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  });
})();