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

  if (document.querySelector('.mobile-bottom-nav')) return;

  var items = [
    { href: '/', label: '홈', key: 'home', icon: '⌂' },
    { href: '/health', label: '병원', key: 'health', icon: '＋' },
    { href: '/map-search', label: '지도', key: 'map-search', icon: '⌖' },
    { href: '/kids', label: '아이', key: 'kids', icon: '学' },
    { href: '/culture-leisure', label: '주말', key: 'culture-leisure', icon: '◌' }
  ];

  var path = window.location.pathname.replace(/\/$/, '') || '/';
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
        category.addEventListener('mouseenter', function () { openCategory(category, false); });
        category.addEventListener('mouseleave', function () { closeCategory(category); });
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
