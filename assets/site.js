(function () {
  if (document.querySelector('.mobile-bottom-nav')) return;

  var items = [
    { href: '/', label: '홈', key: 'home', icon: '⌂' },
    { href: '/health', label: '병원', key: 'health', icon: '＋' },
    { href: '/map-search', label: '지도', key: 'map-search', icon: '⌖' },
    { href: '/kids', label: '아이', key: 'kids', icon: '学' },
    { href: '/culture-leisure', label: '주말', key: 'culture-leisure', icon: '◌' }
  ];

  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', '모바일 빠른 메뉴');

  nav.innerHTML = items.map(function (item) {
    var active = path === item.href || (item.href !== '/' && path.indexOf(item.href) === 0);
    return [
      '<a class="mobile-bottom-nav__item', active ? ' is-active' : '', '" href="', item.href, '">',
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
  drawer.setAttribute('aria-label', '운정라이프 전체 메뉴');
  drawer.innerHTML = [
    '<button class="site-menu-backdrop" type="button" aria-label="전체 메뉴 닫기"></button>',
    '<div class="site-menu-panel">',
      '<div class="site-menu-heading">',
        '<div><strong>운정라이프</strong><span>필요한 생활 정보를 바로 찾으세요.</span></div>',
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

  header.insertBefore(toggle, header.querySelector('.nav'));
  document.body.appendChild(drawer);

  closeButton = drawer.querySelector('.site-menu-close');
  firstFocusable = closeButton;
  lastFocusable = drawer.querySelector('.site-menu-groups a:last-child');

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
