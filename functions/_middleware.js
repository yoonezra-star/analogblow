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

const PAGE_VISUALS = {
  '/': { src:'/assets/visual-home.svg', alt:'운정의 집과 생활 동선을 표현한 파주운정라이프 생활정보 일러스트' },
  '/kids': { src:'/assets/visual-kids.svg', alt:'학교와 통학, 아이생활 동선을 표현한 운정 아이생활 일러스트' },
  '/health': { src:'/assets/visual-health.svg', alt:'병원과 약국 이용 흐름을 표현한 운정 의료생활 일러스트' },
  '/mobility': { src:'/assets/visual-mobility.svg', alt:'교통과 주차, 이동 동선을 표현한 운정 이동생활 일러스트' },
  '/map-search': { src:'/assets/visual-mobility.svg', alt:'운정의 장소와 이동 경로를 표현한 생활지도 일러스트' },
  '/culture-leisure': { src:'/assets/visual-culture.svg', alt:'공원과 가족 외출을 표현한 운정 주말생활 일러스트' },
  '/neighborhoods': { src:'/assets/visual-mobility.svg', alt:'운정 생활권과 주요 이동 축을 표현한 생활권 일러스트' },
  '/future-plan': { src:'/assets/visual-policy.svg', alt:'도시계획과 지역 변화를 표현한 운정 미래계획 일러스트' },
  '/local-services': { src:'/assets/visual-home.svg', alt:'집 안의 생활수리와 가전 점검을 표현한 생활서비스 일러스트' },
  '/local-repair-shops': { src:'/assets/visual-home.svg', alt:'운정 생활수리 업체와 공식 서비스 연결을 표현한 일러스트' },
  '/search': { src:'/assets/visual-data.svg', alt:'생활정보를 분류하고 찾는 과정을 표현한 통합검색 일러스트' }
};

const SOURCE_V2_PATHS = new Set(['/kids', '/health', '/mobility', '/culture-leisure', '/neighborhoods', '/future-plan']);
const REPAIR_TERMS = ['washer','dishwasher','refrigerator','aircon','boiler','bathroom','basin','toilet','shower','bidet','kitchen','sink','faucet','middle-door','interior-door','doorlock','fire-door','window','screen','sash','balcony','wardrobe','ceiling-fan','outlet','drying-rack','induction'];
const LEGACY_CATEGORY_BLOCKS = ['.page-priority-grid','.content-visual','.category-brief','.community-check','.callout-strip','.api-live-panel','.weather-live-card','.feature-article'];
const LEGACY_LINK_TARGETS = {
  '/posts/rainy-day-indoor-play-route':'/posts/culture-rainy-day-course',
  '/posts/weekend-low-cost-indoor-park-course':'/posts/culture-free-indoor-weekend',
  '/posts/unjeong-brunch-cafe-check':'/cafes',
  '/posts/yadang-station-cafe-guide':'/cafes',
  '/posts/yadang-dinner-parking-guide':'/posts/culture-restaurant-parking-check',
  '/posts/unjeong-kids-menu-restaurant-check':'/posts/culture-family-restaurant-check',
  '/posts/unjeong-family-restaurant-guide':'/restaurants'
};
const MERGED_HUB_ALTERNATIVES = {
  '/posts/unjeong-brunch-cafe-check':'/posts/unjeong-kids-brunch-guide',
  '/posts/yadang-station-cafe-guide':'/posts/yadang-date-course-guide',
  '/posts/unjeong-family-restaurant-guide':'/posts/culture-family-restaurant-check'
};

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
function footerMarkup() {
  return '<div class="tc-footer__inner">'
    + '<section class="tc-footer__brand" aria-label="사이트 소개"><a href="/"><img src="/logo.svg" alt=""><span>파주운정라이프</span></a><p>운정에서 자주 필요한 생활정보를 짧고 찾기 쉽게 정리합니다.</p></section>'
    + '<nav class="tc-footer__group" aria-label="생활정보"><h2>생활정보</h2><a href="/kids">아이생활</a><a href="/health">병원·약국</a><a href="/local-services">생활수리·가전</a><a href="/local-repair-shops">업체·공식 A/S</a></nav>'
    + '<nav class="tc-footer__group" aria-label="검색과 지도"><h2>검색·지도</h2><a href="/search">통합검색</a><a href="/map-search">운정 생활지도</a><a href="/mobility">교통·주차</a><a href="/culture-leisure">주말·외식</a></nav>'
    + '<nav class="tc-footer__group" aria-label="운영정보"><h2>운영정보</h2><a href="/about">소개</a><a href="/editorial-policy">편집 기준</a><a href="/contact">문의·정보 제보</a><a href="/data">공식 출처</a></nav>'
    + '</div>'
    + '<div class="tc-footer__bottom"><span>© Since 2026 파주운정라이프</span><nav class="tc-footer__legal" aria-label="법적 안내"><a href="/privacy">개인정보처리방침</a><a href="/terms">이용안내</a></nav></div>';
}
function pageVisualMarkup(visual, path) {
  if (!visual) return '';
  const priority = path === '/' ? ' fetchpriority="high"' : '';
  const loading = path === '/' ? 'eager' : 'lazy';
  return '<figure class="tc-page-visual"><img src="' + visual.src + '" alt="' + visual.alt + '" loading="' + loading + '" decoding="async"' + priority + '></figure>';
}

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const path = new URL(context.request.url).pathname.replace(/\/$/, '') || '/';
  const activeKey = ACTIVE_BY_PATH[path];
  const pageVisual = PAGE_VISUALS[path] || null;
  const sourceV2 = SOURCE_V2_PATHS.has(path);
  const isArticle = path.indexOf('/posts/') === 0;
  const meta = isArticle ? articleMeta(path) : null;
  const isRepairArticle = isArticle && meta && meta.href === '/local-services';
  const service = isRepairArticle ? repairService(path) : null;
  let repairSectionCount = 0;
  let serviceInserted = false;

  let rewriter = new HTMLRewriter()
    .on('head', {
      element(element) {
        if (path !== '/' && !sourceV2) element.append('<link rel="stylesheet" href="/design-system-v2.css?v=20260826-3">', { html: true });
        if (path === '/') element.append('<link rel="stylesheet" href="/home-v2.css?v=20260826-1">', { html: true });
        if (!sourceV2) element.append('<link rel="stylesheet" href="/footer-v2.css?v=20260826-1">', { html: true });
        if (activeKey && !sourceV2) element.append('<link rel="stylesheet" href="/category-v2.css?v=20260826-4">', { html: true });
        if (isArticle) element.append('<link rel="stylesheet" href="/article-v2.css?v=20260827-1">', { html: true });
        if (pageVisual) element.append('<link rel="stylesheet" href="/page-visual-v2.css?v=20260827-1">', { html: true });
      }
    })
    .on('style', {
      element(element) {
        if (path === '/') element.remove();
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
        if (path !== '/' && !sourceV2) element.append('<script defer src="/assets/site-v2.js?v=20260827-2"></script>', { html: true });
        if (activeKey && activeKey !== 'repair' && !sourceV2) element.append('<script defer src="/assets/category-v2.js?v=20260826-1"></script>', { html: true });
        if (isArticle) element.append('<script defer src="/assets/article-density-v2.js?v=20260827-1"></script>', { html: true });
      }
    })
    .on('main h1', {
      element(element) {
        if (pageVisual) element.after(pageVisualMarkup(pageVisual, path), { html: true });
      }
    })
    .on('.site-header .nav', {
      element(element) {
        element.setAttribute('aria-label', '주요 카테고리');
        element.setInnerContent(primaryNavMarkup(path), { html: true });
      }
    })
    .on('.footer', {
      element(element) {
        element.setAttribute('class', 'footer tc-footer');
        element.setInnerContent(footerMarkup(), { html: true });
      }
    })
    .on('a[href]', {
      element(element) {
        const raw = element.getAttribute('href');
        if (!raw) return;
        let url;
        try { url = new URL(raw, context.request.url); } catch (e) { return; }
        const origin = new URL(context.request.url).origin;
        if (url.origin !== origin) return;
        const key = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
        let target = LEGACY_LINK_TARGETS[key];
        if (!target) return;
        if (target === path && MERGED_HUB_ALTERNATIVES[key]) target = MERGED_HUB_ALTERNATIVES[key];
        element.setAttribute('href', target + url.search + url.hash);
      }
    })
    .on('script[src*="site-20260815-brand-1.js"]', {
      element(element) { element.remove(); }
    });

  if (activeKey) {
    LEGACY_CATEGORY_BLOCKS.forEach(function(selector) {
      rewriter = rewriter.on(selector, { element(element) { element.remove(); } });
    });
  }

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