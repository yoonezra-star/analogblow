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

const REPAIR_TERMS = ['washer','dishwasher','refrigerator','aircon','boiler','bathroom','basin','toilet','shower','bidet','kitchen','sink','faucet','middle-door','interior-door','doorlock','fire-door','window','screen','sash','balcony','wardrobe','ceiling-fan','outlet','drying-rack','induction'];

function articleMeta(path) {
  const slug = path.toLowerCase();
  if (REPAIR_TERMS.some(function(term){ return slug.indexOf(term) !== -1; })) return { href:'/local-services', label:'생활수리·가전' };
  if (slug.indexOf('/posts/health') === 0) return { href:'/health', label:'병원·약국' };
  if (slug.indexOf('/posts/kids') === 0 || slug.indexOf('school') !== -1 || slug.indexOf('childcare') !== -1) return { href:'/kids', label:'아이생활' };
  if (slug.indexOf('/posts/mobility') === 0 || slug.indexOf('/posts/parking') === 0 || slug.indexOf('gtx') !== -1) return { href:'/mobility', label:'지도·이동' };
  if (slug.indexOf('/posts/culture') === 0 || slug.indexOf('/posts/weekend') === 0 || slug.indexOf('cafe') !== -1 || slug.indexOf('park') !== -1) return { href:'/culture-leisure', label:'주말·외식' };
  if (slug.indexOf('apartment') !== -1 || slug.indexOf('yadang-station-life') !== -1 || slug.indexOf('unjeong-station-life') !== -1 || slug.indexOf('gyoha') !== -1 || slug.indexOf('sannae') !== -1) return { href:'/neighborhoods', label:'생활권' };
  if (slug.indexOf('/posts/policy') === 0 || slug.indexOf('real-estate') !== -1 || slug.indexOf('rent-check') !== -1) return { href:'/future-plan', label:'미래·정책' };
  return { href:'/guides', label:'생활글' };
}

function repairService(path) {
  const slug = path.toLowerCase();
  if (slug.indexOf('aircon') !== -1) return { anchor:'aircon', label:'에어컨 설치·수리·청소', copy:'냉매·배관·설치·분해청소는 작업 범위가 다릅니다. 업체별 출장범위와 추가비용을 먼저 확인하세요.' };
  if (slug.indexOf('boiler') !== -1) return { anchor:'boiler', label:'보일러·온수 서비스', copy:'보일러는 안전과 부품 호환 때문에 제조사 공식 A/S 또는 공식 대리점을 우선 확인하는 편이 좋습니다.' };
  if (slug.indexOf('washer') !== -1 || slug.indexOf('dishwasher') !== -1 || slug.indexOf('refrigerator') !== -1) return { anchor:'appliance', label:'가전 공식 A/S', copy:'세탁기·식기세척기·냉장고는 모델별 부품이 달라 제조사 공식 A/S를 먼저 확인하면 수리 범위를 판단하기 쉽습니다.' };
  if (['bathroom','basin','toilet','shower','bidet','sink','faucet'].some(function(term){ return slug.indexOf(term) !== -1; })) return { anchor:'plumbing', label:'누수·배관 서비스', copy:'물샘·배수·수전 문제는 원인 확인과 수리 범위를 나눠 문의하고 출장비·부품비·마감 복구 포함 여부를 확인하세요.' };
  return { anchor:'general', label:'종합 집수리', copy:'문·도어락·창호·수납·전기처럼 소규모 생활수리는 작업 범위와 부품비, 출장비를 먼저 확인하세요.' };
}

function hubMarkup(activeKey) {
  return '<p>다른 생활 주제</p><div>' + HUBS.map(function (item) {
    if (item.key === activeKey) return '<span class="hub-switcher__current" aria-current="page"><i aria-hidden="true">' + item.icon + '</i>' + item.label + '</span>';
    return '<a href="' + item.href + '"><i aria-hidden="true">' + item.icon + '</i>' + item.label + '</a>';
  }).join('') + '</div>';
}
function hubNavMarkup(activeKey) { return '<nav class="hub-switcher" aria-label="운정 생활 허브">' + hubMarkup(activeKey) + '</nav>'; }
function primaryNavMarkup(path) {
  const activeKey = ACTIVE_BY_PATH[path];
  return HUBS.map(function (item) { return '<a href="' + item.href + '"' + (activeKey === item.key ? ' aria-current="page"' : '') + '>' + item.label + '</a>'; }).join('');
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
  const isArticle = path.indexOf('/posts/') === 0;
  const meta = isArticle ? articleMeta(path) : null;
  const isRepairArticle = isArticle && meta && meta.href === '/local-services';
  const service = isRepairArticle ? repairService(path) : null;
  let repairSectionCount = 0;
  let serviceInserted = false;

  let rewriter = new HTMLRewriter()
    .on('head', {
      element(element) {
        element.append('<link rel="stylesheet" href="/design-system-v2.css?v=20260826-2">', { html: true });
        if (activeKey) element.append('<link rel="stylesheet" href="/category-v2.css?v=20260826-1">', { html: true });
        if (isArticle) element.append('<link rel="stylesheet" href="/article-v2.css?v=20260826-1">', { html: true });
      }
    })
    .on('body', {
      element(element) {
        const classes = element.getAttribute('class') || '';
        const next = new Set(classes.split(/\s+/).filter(Boolean));
        next.add('tc-v2');
        if (activeKey) next.add('tc-category-page');
        if (isArticle) next.add('tc-article-page');
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
      element(element) { element.setAttribute('src', '/assets/site-20260815-brand-1.js?v=20260826-design-v2-5'); }
    });

  if (isArticle) {
    rewriter = rewriter.on('.article-page h1', {
      element(element) {
        element.before('<nav class="tc-breadcrumb" aria-label="현재 위치"><a href="/">홈</a><span aria-hidden="true">›</span><a href="' + meta.href + '">' + meta.label + '</a></nav>', { html: true });
      }
    });
  }

  if (isRepairArticle) {
    rewriter = rewriter.on('.article-page .rich-section', {
      element(element) {
        repairSectionCount += 1;
        if (repairSectionCount === 2 && !serviceInserted) {
          serviceInserted = true;
          element.after('<aside class="tc-service-next" aria-label="수리 문의 정보"><span>어디에 문의할까?</span><strong>' + service.label + '</strong><p>' + service.copy + '</p><a href="/local-repair-shops#' + service.anchor + '">업체·공식 A/S 확인</a></aside>', { html: true });
        }
      }
    });
  }

  if (activeKey === 'repair') {
    rewriter = rewriter.on('.info-standard', { element(element) { element.after(hubNavMarkup(activeKey), { html: true }); } });
  } else if (activeKey) {
    rewriter = rewriter.on('nav.hub-switcher', { element(element) { element.setInnerContent(hubMarkup(activeKey), { html: true }); } });
  }

  return rewriter.transform(response);
}
