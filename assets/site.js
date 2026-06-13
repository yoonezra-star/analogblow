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
})();
