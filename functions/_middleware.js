const HUBS = [
  { key: 'kids', href: '/kids', icon: '🧒', label: '아이생활' },
  { key: 'health', href: '/health', icon: '🏥', label: '병원·약국' },
  { key: 'mobility', href: '/mobility', icon: '🗺️', label: '지도·이동' },
  { key: 'weekend', href: '/culture-leisure', icon: '🌿', label: '주말·외식' },
  { key: 'neighborhoods', href: '/neighborhoods', icon: '🏘️', label: '생활권' },
  { key: 'future', href: '/future-plan', icon: '🏗️', label: '미래·정책' },
  { key: 'repair', href: '/local-services', icon: '🏠', label: '생활수리·가전' }
];

const ACTIVE_BY_PATH = {
  '/kids': 'kids', '/health': 'health', '/mobility': 'mobility',
  '/culture-leisure': 'weekend', '/weekend': 'weekend',
  '/neighborhoods': 'neighborhoods', '/future-plan': 'future', '/policy-news': 'future',
  '/local-services': 'repair', '/local-repair-shops': 'repair'
};

function hubMarkup(activeKey) {
  return '<p>다른 생활 주제</p><div>' + HUBS.map(function (item) {
    if (item.key === activeKey) return '<span class="hub-switcher__current" aria-current="page"><i aria-hidden="true">' + item.icon + '</i>' + item.label + '</span>';
    return '<a href="' + item.href + '"><i aria-hidden="true">' + item.icon + '</i>' + item.label + '</a>';
  }).join('') + '</div>';
}

function hubNavMarkup(activeKey) {
  return '<nav class="hub-switcher" aria-label="운정 생활 허브">' + hubMarkup(activeKey) + '</nav>';
}

function primaryNavMarkup(path) {
  const activeKey = ACTIVE_BY_PATH[path];
  return HUBS.map(function (item) {
    return '<a href="' + item.href + '"' + (activeKey === item.key ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
  }).join('');
}

const repairMenuScript = `
window.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.site-category').forEach(function (group) {
    var label = group.querySelector('.site-category-toggle span');
    if (!label || label.textContent.trim() !== '생활수리·가전') return;
    var menu = group.querySelector('.site-category-menu');
    if (!menu) return;
    menu.innerHTML = [
      '<a role="menuitem" class="site-category-all" href="/local-services">생활수리 전체</a>',
      '<a role="menuitem" href="/local-services#repair-door">현관·문</a>',
      '<a role="menuitem" href="/local-services#repair-bath">욕실·배관</a>',
      '<a role="menuitem" href="/local-services#repair-kitchen">주방·수납</a>',
      '<a role="menuitem" href="/local-services#repair-laundry">세탁</a>',
      '<a role="menuitem" href="/local-services#repair-fridge">냉장고·식기세척기</a>',
      '<a role="menuitem" href="/local-services#repair-aircon">에어컨</a>',
      '<a role="menuitem" href="/local-services#repair-boiler">보일러</a>',
      '<a role="menuitem" href="/local-services#repair-electric">전기·스마트홈</a>',
      '<a role="menuitem" href="/local-services#repair-window">창호·베란다</a>',
      '<a role="menuitem" href="/local-repair-shops">업체·공식 A/S</a>'
    ].join('');
  });
});`;

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const path = new URL(context.request.url).pathname.replace(/\/$/, '') || '/';
  const activeKey = ACTIVE_BY_PATH[path];
  let rewriter = new HTMLRewriter()
    .on('head', {
      element(element) { element.append('<link rel="stylesheet" href="/design-system-v2.css?v=20260826-2">', { html: true }); }
    })
    .on('body', {
      element(element) {
        const classes = element.getAttribute('class') || '';
        const next = new Set(classes.split(/\s+/).filter(Boolean));
        next.add('tc-v2');
        if (activeKey) next.add('tc-category-page');
        element.setAttribute('class', Array.from(next).join(' '));
        element.append('<script>' + repairMenuScript + '</script>', { html: true });
      }
    })
    .on('.site-header .nav', {
      element(element) {
        element.setAttribute('aria-label', '주요 카테고리');
        element.setInnerContent(primaryNavMarkup(path), { html: true });
      }
    })
    .on('script[src*="site-20260815-brand-1.js"]', {
      element(element) { element.setAttribute('src', '/assets/site-20260815-brand-1.js?v=20260826-design-v2-2'); }
    });

  if (activeKey === 'repair') {
    rewriter = rewriter.on('.info-standard', {
      element(element) { element.after(hubNavMarkup(activeKey), { html: true }); }
    });
  } else if (activeKey) {
    rewriter = rewriter.on('nav.hub-switcher', {
      element(element) { element.setInnerContent(hubMarkup(activeKey), { html: true }); }
    });
  }

  return rewriter.transform(response);
}
