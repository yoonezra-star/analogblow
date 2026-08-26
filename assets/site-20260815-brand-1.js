(function(){
  if(window.__tcV2FallbackBootstrapped)return;
  window.__tcV2FallbackBootstrapped=true;

  var path=window.location.pathname.replace(/\/$/,'')||'/';
  var hubs=[
    {key:'kids',href:'/kids',icon:'🧒',label:'아이생활'},
    {key:'health',href:'/health',icon:'🏥',label:'병원·약국'},
    {key:'mobility',href:'/mobility',icon:'🗺️',label:'지도·이동'},
    {key:'weekend',href:'/culture-leisure',icon:'🌿',label:'주말·외식'},
    {key:'neighborhoods',href:'/neighborhoods',icon:'🏘️',label:'생활권'},
    {key:'future',href:'/future-plan',icon:'🏗️',label:'미래·정책'},
    {key:'repair',href:'/local-services',icon:'🏠',label:'생활수리·가전'}
  ];
  var activeByPath={
    '/kids':'kids','/health':'health','/mobility':'mobility','/culture-leisure':'weekend','/weekend':'weekend',
    '/neighborhoods':'neighborhoods','/future-plan':'future','/policy-news':'future','/local-services':'repair','/local-repair-shops':'repair'
  };
  var activeKey=activeByPath[path]||null;
  var isArticle=path.indexOf('/posts/')===0;
  var legacyBlocks=['.page-priority-grid','.content-visual','.category-brief','.community-check','.callout-strip','.api-live-panel','.weather-live-card','.feature-article'];

  function addStyle(href){
    if(document.querySelector('link[href*="'+href.split('?')[0]+'"]'))return;
    var link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);
  }
  function addScript(src){
    if(document.querySelector('script[src*="'+src.split('/').pop().split('?')[0]+'"]'))return;
    var script=document.createElement('script');script.defer=true;script.src=src;document.body.appendChild(script);
  }
  function hubMarkup(){
    return '<p>다른 생활 주제</p><div>'+hubs.map(function(item){
      if(item.key===activeKey)return '<span class="hub-switcher__current" aria-current="page"><i aria-hidden="true">'+item.icon+'</i>'+item.label+'</span>';
      return '<a href="'+item.href+'"><i aria-hidden="true">'+item.icon+'</i>'+item.label+'</a>';
    }).join('')+'</div>';
  }
  function footerMarkup(){
    return '<div class="tc-footer__inner">'
      +'<section class="tc-footer__brand" aria-label="사이트 소개"><a href="/"><img src="/logo.svg" alt=""><span>파주운정라이프</span></a><p>운정에서 자주 필요한 생활정보를 짧고 찾기 쉽게 정리합니다.</p></section>'
      +'<nav class="tc-footer__group" aria-label="생활정보"><h2>생활정보</h2><a href="/kids">아이생활</a><a href="/health">병원·약국</a><a href="/local-services">생활수리·가전</a><a href="/local-repair-shops">업체·공식 A/S</a></nav>'
      +'<nav class="tc-footer__group" aria-label="검색과 지도"><h2>검색·지도</h2><a href="/search">통합검색</a><a href="/map-search">운정 생활지도</a><a href="/mobility">교통·주차</a><a href="/culture-leisure">주말·외식</a></nav>'
      +'<nav class="tc-footer__group" aria-label="운영정보"><h2>운영정보</h2><a href="/about">소개</a><a href="/editorial-policy">편집 기준</a><a href="/contact">문의·정보 제보</a><a href="/data">공식 출처</a></nav>'
      +'</div><div class="tc-footer__bottom"><span>© Since 2026 파주운정라이프</span><nav class="tc-footer__legal" aria-label="법적 안내"><a href="/privacy">개인정보처리방침</a><a href="/terms">이용안내</a></nav></div>';
  }

  addStyle('/design-system-v2.css?v=20260826-3');
  addStyle('/global-nav-v2.css?v=20260826-1');
  addStyle('/footer-v2.css?v=20260826-1');
  if(activeKey)addStyle('/category-v2.css?v=20260826-4');
  if(isArticle)addStyle('/article-v2.css?v=20260827-1');

  var body=document.body;
  if(body){
    body.classList.add('tc-v2');
    if(activeKey)body.classList.add('tc-category-page');
    if(isArticle)body.classList.add('tc-article-page');
  }

  var main=document.querySelector('main');
  if(main&&!main.id)main.id='site-main-content';
  if(main&&!main.hasAttribute('tabindex'))main.setAttribute('tabindex','-1');
  if(main&&!document.querySelector('.skip-link')){
    var skip=document.createElement('a');skip.className='skip-link';skip.href='#site-main-content';skip.textContent='본문으로 바로가기';document.body.insertBefore(skip,document.body.firstChild);
  }

  if(activeKey){
    legacyBlocks.forEach(function(selector){document.querySelectorAll(selector).forEach(function(node){node.remove();});});
    var switchers=document.querySelectorAll('nav.hub-switcher');
    if(switchers.length){switchers.forEach(function(nav){nav.innerHTML=hubMarkup();});}
    else if(activeKey==='repair'){
      var info=document.querySelector('.page-card .info-standard');
      if(info)info.insertAdjacentHTML('afterend','<nav class="hub-switcher" aria-label="운정 생활 허브">'+hubMarkup()+'</nav>');
    }
  }

  var footer=document.querySelector('.footer');
  if(footer){footer.className='footer tc-footer';footer.innerHTML=footerMarkup();}

  addScript('/assets/site-v2.js?v=20260826-3');
  if(activeKey&&activeKey!=='repair')addScript('/assets/category-v2.js?v=20260826-1');
  if(isArticle)addScript('/assets/article-density-v2.js?v=20260827-1');
})();
