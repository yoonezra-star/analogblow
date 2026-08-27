(function(){
  if(window.__tcSiteV2Loaded)return;
  window.__tcSiteV2Loaded=true;
  var path=window.location.pathname.replace(/\/$/,'')||'/';
  var pageVisuals={
    '/':{src:'/assets/photos/hero-main-v2.webp',alt:'아파트 단지 녹지에서 가족이 산책하는 생활 풍경'},
    '/kids':{src:'/assets/photos/hero-kids-v2.webp',alt:'보호자와 아이가 학교로 걸어가는 등교 생활 풍경'},
    '/health':{src:'/assets/photos/hero-health-v2.webp',alt:'보호자와 아이가 의료진과 상담하는 진료 안내 풍경'},
    '/mobility':{src:'/assets/photos/hero-mobility-v2.webp',alt:'버스와 자전거, 보행 동선이 함께 보이는 도시 이동 풍경'},
    '/culture-leisure':{src:'/assets/photos/hero-weekend-v2.webp',alt:'카페와 녹지가 이어진 보행 거리에서 가족이 걷는 주말 풍경'},
    '/neighborhoods':{src:'/assets/photos/hero-neighborhoods-v2.webp',alt:'아파트와 상가, 녹지가 이어진 보행 생활권 풍경'},
    '/future-plan':{src:'/assets/photos/hero-future-v2.webp',alt:'주거 단지와 공공 공간이 함께 보이는 계획도시 풍경'},
    '/local-services':{src:'/assets/photos/hero-repair-v2.webp',alt:'아파트에서 기술자가 세탁기를 점검하며 설명하는 생활수리 풍경'}
  };
  var groups=[
    {key:'kids',label:'아이생활',match:['/kids','/school-roadmap','/kids-play'],items:[['/kids','아이생활 전체'],['/school-roadmap','학교·등원'],['/kids-play','키즈·실내놀이'],['/posts/kids-after-school-route','하교 후 루틴'],['/health','아이 병원 동선']]},
    {key:'health',label:'병원·약국',match:['/health'],items:[['/health','병원·약국 전체'],['/map-search?filter=hospital','병원 찾기'],['/map-search?filter=pharmacy','약국 찾기'],['/posts/health-night-holiday-pharmacy-guide','야간·휴일 약국'],['/posts/health-call-before-visit','방문 전 전화 확인']]},
    {key:'mobility',label:'지도·이동',match:['/mobility','/map-search','/parking-data'],items:[['/map-search','운정 생활 지도'],['/mobility','교통·주차 전체'],['/parking-data','주차 데이터'],['/posts/gtx-unjeong-station-transfer-parking-guide-2026','GTX-A 환승·주차'],['/posts/mobility-ddokbus-unjeong-guide','똑버스 이용']]},
    {key:'weekend',label:'주말·외식',match:['/culture-leisure','/weekend','/cafes','/restaurants','/calendar'],items:[['/culture-leisure','주말·외식 전체'],['/weekend','가족 나들이'],['/kids-play','키즈·실내놀이'],['/cafes','카페'],['/restaurants','운정 상권 가이드'],['/calendar','생활 캘린더']]},
    {key:'neighborhoods',label:'생활권',match:['/neighborhoods','/unjeong-intro','/public-facilities'],items:[['/neighborhoods','생활권 전체'],['/unjeong-intro','운정 소개'],['/public-facilities','공공 생활시설'],['/posts/unjeong-station-life-guide','운정역 생활권'],['/posts/yadang-station-life-guide','야당역 생활권'],['/posts/gyoha-dongpae-life-guide','교하·동패 생활권']]},
    {key:'future',label:'미래·정책',match:['/future-plan','/policy-news','/movein','/polling-place'],items:[['/future-plan','미래·정책 전체'],['/policy-news','정책 뉴스'],['/movein','입주 첫 달'],['/posts/policy-paju-local-currency-check','파주 생활정책'],['/polling-place','투표소 확인']]},
    {key:'repair',label:'생활수리·가전',match:['/local-services','/local-repair-shops'],items:[['/local-services','생활수리 전체'],['/local-services#repair-door','현관·문'],['/local-services#repair-bath','욕실·배관'],['/local-services#repair-kitchen','주방·수납'],['/local-services#repair-laundry','세탁'],['/local-services#repair-fridge','냉장고·식기세척기'],['/local-services#repair-aircon','에어컨'],['/local-services#repair-boiler','보일러'],['/local-services#repair-electric','전기·스마트홈'],['/local-services#repair-window','창호·베란다'],['/local-repair-shops','업체·공식 A/S']]}
  ];

  var legacyTargets={
    '/posts/rainy-day-indoor-play-route':'/posts/culture-rainy-day-course',
    '/posts/weekend-low-cost-indoor-park-course':'/posts/culture-free-indoor-weekend',
    '/posts/unjeong-brunch-cafe-check':'/cafes',
    '/posts/yadang-station-cafe-guide':'/cafes',
    '/posts/yadang-dinner-parking-guide':'/posts/culture-restaurant-parking-check',
    '/posts/unjeong-kids-menu-restaurant-check':'/posts/culture-family-restaurant-check',
    '/posts/unjeong-family-restaurant-guide':'/restaurants'
  };
  var mergedHubAlternatives={
    '/posts/unjeong-brunch-cafe-check':'/posts/unjeong-kids-brunch-guide',
    '/posts/yadang-station-cafe-guide':'/posts/yadang-date-course-guide',
    '/posts/unjeong-family-restaurant-guide':'/posts/culture-family-restaurant-check'
  };
  function normalizeLegacyLinks(){
    document.querySelectorAll('a[href]').forEach(function(anchor){
      try{
        var url=new URL(anchor.getAttribute('href'),window.location.origin);
        if(url.origin!==window.location.origin)return;
        var key=url.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
        var target=legacyTargets[key];
        if(!target)return;
        if(target===path&&mergedHubAlternatives[key])target=mergedHubAlternatives[key];
        anchor.setAttribute('href',target+(url.search||'')+(url.hash||''));
      }catch(e){}
    });
  }
  normalizeLegacyLinks();

  function ensureGlobalStyle(){if(document.querySelector('link[href*="global-nav-v2.css"]'))return;var link=document.createElement('link');link.rel='stylesheet';link.href='/global-nav-v2.css?v=20260826-1';document.head.appendChild(link);}
  function ensurePhotoVisual(){var visual=pageVisuals[path];if(!visual||document.querySelector('.tc-page-visual'))return;if(!document.querySelector('link[href*="page-visual-v2.css"]')){var style=document.createElement('link');style.rel='stylesheet';style.href='/page-visual-v2.css?v=20260827-photo-2';document.head.appendChild(style);}var h1=document.querySelector('main h1');if(!h1)return;var figure=document.createElement('figure');figure.className='tc-page-visual';var image=document.createElement('img');image.src=visual.src;image.alt=visual.alt;image.decoding='async';image.loading=path==='/'?'eager':'lazy';if(path==='/')image.fetchPriority='high';figure.appendChild(image);h1.insertAdjacentElement('afterend',figure);}
  ensureGlobalStyle();
  function isCurrent(group){return group.match.some(function(p){return path===p||path.indexOf(p+'/')===0;});}
  function navMarkup(){return groups.map(function(group,index){var id='tcCategoryMenu'+index;return '<div class="site-category'+(isCurrent(group)?' is-current':'')+'"><button class="site-category-toggle" type="button" aria-expanded="false" aria-controls="'+id+'"><span>'+group.label+'</span><span class="site-category-chevron" aria-hidden="true"></span></button><div class="site-category-menu" id="'+id+'" role="menu" hidden>'+group.items.map(function(item,i){var itemPath=new URL(item[0],window.location.origin).pathname.replace(/\/$/,'')||'/';var active=path===itemPath;return '<a role="menuitem" href="'+item[0]+'"'+(i===0?' class="site-category-all"':'')+(active?' aria-current="page"':'')+'>'+item[1]+'</a>';}).join('')+'</div></div>';}).join('');}

  var main=document.querySelector('main');
  if(main&&!main.id)main.id='site-main-content';
  if(main&&!main.hasAttribute('tabindex'))main.setAttribute('tabindex','-1');
  if(main&&!document.querySelector('.skip-link')){var skip=document.createElement('a');skip.className='skip-link';skip.href='#site-main-content';skip.textContent='본문으로 바로가기';document.body.insertBefore(skip,document.body.firstChild);}
  ensurePhotoVisual();

  document.querySelectorAll('.article-page').forEach(function(article){if(article.querySelector('.article-attribution'))return;var info=document.createElement('section');info.className='article-attribution';info.setAttribute('aria-label','콘텐츠 작성 및 검토 정보');info.innerHTML='<span><strong>작성·검토</strong> 파주운정라이프 운영팀</span><span>공식 기관과 공개정보를 우선 확인합니다.</span><a href="/editorial-policy">편집 기준</a><a href="/contact">오류 제보</a>';var standard=article.querySelector('.info-standard');if(standard)standard.insertAdjacentElement('afterend',info);else article.insertBefore(info,article.firstChild);});

  var header=document.querySelector('.site-header');
  var nav=header&&header.querySelector('.nav');
  if(nav){nav.classList.add('site-category-nav');nav.setAttribute('aria-label','파주운정라이프 카테고리');nav.innerHTML=navMarkup();}
  if(!header||!nav)return;

  var globalActions=header.querySelector('.site-global-actions');
  if(!globalActions){globalActions=document.createElement('div');globalActions.className='site-global-actions';globalActions.innerHTML='<a class="site-global-search" href="/search" aria-label="사이트 통합검색"'+(path==='/search'?' aria-current="page"':'')+'><span class="site-global-search-icon" aria-hidden="true">⌕</span><span class="site-global-search-label">검색</span></a>';header.insertBefore(globalActions,nav);}

  function closeCategory(category){var b=category.querySelector('.site-category-toggle'),m=category.querySelector('.site-category-menu');b.setAttribute('aria-expanded','false');m.hidden=true;category.classList.remove('is-open');}
  function openCategory(category,focusFirst){nav.querySelectorAll('.site-category.is-open').forEach(function(other){if(other!==category)closeCategory(other);});var b=category.querySelector('.site-category-toggle'),m=category.querySelector('.site-category-menu');b.setAttribute('aria-expanded','true');m.hidden=false;category.classList.add('is-open');if(focusFirst){var first=m.querySelector('a');if(first)first.focus();}}
  nav.querySelectorAll('.site-category').forEach(function(category){var b=category.querySelector('.site-category-toggle'),m=category.querySelector('.site-category-menu');b.addEventListener('click',function(){category.classList.contains('is-open')?closeCategory(category):openCategory(category,false);});b.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();openCategory(category,true);}if(e.key==='Escape')closeCategory(category);});m.addEventListener('keydown',function(e){var links=Array.prototype.slice.call(m.querySelectorAll('a'));var i=links.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();closeCategory(category);b.focus();}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();var d=e.key==='ArrowDown'?1:-1;links[(i+d+links.length)%links.length].focus();}});if(window.matchMedia('(hover:hover) and (min-width:901px)').matches){category.addEventListener('pointerenter',function(){openCategory(category,false);});category.addEventListener('pointerleave',function(){window.setTimeout(function(){if(!category.matches(':hover'))closeCategory(category);},180);});}});
  document.addEventListener('click',function(e){if(!nav.contains(e.target))nav.querySelectorAll('.site-category.is-open').forEach(closeCategory);});

  var toggle=document.querySelector('.site-menu-toggle');
  if(!toggle){toggle=document.createElement('button');toggle.className='site-menu-toggle';toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','siteMenuDrawer');toggle.innerHTML='<span aria-hidden="true">☰</span><span>전체 메뉴</span>';header.insertBefore(toggle,nav);}
  var drawer=document.getElementById('siteMenuDrawer');
  if(!drawer){drawer=document.createElement('aside');drawer.className='site-menu-drawer';drawer.id='siteMenuDrawer';drawer.hidden=true;drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');drawer.setAttribute('aria-label','파주운정라이프 전체 메뉴');drawer.innerHTML='<button class="site-menu-backdrop" type="button" aria-label="전체 메뉴 닫기"></button><div class="site-menu-panel"><div class="site-menu-heading"><div><strong>파주운정라이프</strong><span>필요한 생활정보를 카테고리에서 찾으세요.</span></div><button class="site-menu-close" type="button" aria-label="전체 메뉴 닫기">×</button></div><nav class="site-menu-groups" aria-label="전체 메뉴 목록"><section class="site-menu-utility"><h2>바로 찾기</h2><a class="site-menu-search-primary" href="/search">통합검색</a><a href="/map-search">지도에서 장소 찾기</a></section>'+groups.map(function(group){return '<section><h2>'+group.label+'</h2>'+group.items.map(function(item){return '<a href="'+item[0]+'">'+item[1]+'</a>';}).join('')+'</section>';}).join('')+'<section><h2>운영 정보</h2><a href="/about">소개</a><a href="/contact">정보 제보</a><a href="/editorial-policy">편집 기준</a></section></nav></div>';document.body.appendChild(drawer);}
  var close=drawer.querySelector('.site-menu-close'),backdrop=drawer.querySelector('.site-menu-backdrop');
  function focusables(){return Array.prototype.slice.call(drawer.querySelectorAll('button,a[href]')).filter(function(el){return !el.disabled&&el.offsetParent!==null;});}
  function openMenu(){drawer.hidden=false;toggle.setAttribute('aria-expanded','true');document.documentElement.classList.add('site-menu-open');close.focus();}
  function closeMenu(){drawer.hidden=true;toggle.setAttribute('aria-expanded','false');document.documentElement.classList.remove('site-menu-open');toggle.focus();}
  toggle.addEventListener('click',function(){drawer.hidden?openMenu():closeMenu();});close.addEventListener('click',closeMenu);backdrop.addEventListener('click',closeMenu);drawer.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();closeMenu();return;}if(e.key==='Tab'){var f=focusables();if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
})();
