(function(){
  var SOURCES=[
    {url:'/kids',label:'아이생활',description:'학교·통학·돌봄·도서관'},
    {url:'/health',label:'병원·약국',description:'진료·약국·야간·휴일'},
    {url:'/mobility',label:'지도·이동',description:'교통·주차·역세권 이동'},
    {url:'/culture-leisure',label:'주말·외식',description:'공원·카페·가족 외식'},
    {url:'/neighborhoods',label:'생활권',description:'운정·야당·교하·동패'},
    {url:'/future-plan',label:'미래·정책',description:'개발계획·정책·생활 영향'},
    {url:'/local-services',label:'생활수리·가전',description:'집수리·가전·증상별 점검'}
  ];
  var PROVIDER_SOURCE='/local-repair-shops';
  var CACHE_KEY='tc-search-index-v2';
  var CACHE_TTL=15*60*1000;
  var state={items:[],type:'all',query:'',failed:0};

  function qs(selector){return document.querySelector(selector);}
  function clean(value){return (value||'').replace(/\s+/g,' ').trim();}
  function normalize(value){return clean(value).toLowerCase().replace(/[.,/#!$%^&*;:{}=_`~()\[\]<>?"'’“”·]/g,' ');}
  function absoluteHref(href,base){try{var u=new URL(href,new URL(base,location.origin));return u.pathname+u.search+u.hash;}catch(e){return href||'#';}}
  function unique(items){var seen=new Set();return items.filter(function(item){var key=item.type+'|'+item.url+'|'+item.title;if(seen.has(key))return false;seen.add(key);return true;});}
  function categoryItems(){return SOURCES.map(function(source){return {type:'category',category:source.label,title:source.label,description:source.description,url:source.url};});}

  async function fetchSource(source){
    var response=await fetch(source.url,{headers:{'X-Town-Search':'1'}});
    if(!response.ok)throw new Error('source '+source.url);
    var html=await response.text();
    var doc=new DOMParser().parseFromString(html,'text/html');
    var items=[];
    doc.querySelectorAll('a.article-card[href]').forEach(function(card){
      var title=clean((card.querySelector('strong')||card).textContent);
      if(!title)return;
      items.push({type:'article',category:source.label,title:title,description:clean((card.querySelector('p')||{}).textContent),url:absoluteHref(card.getAttribute('href'),source.url)});
    });
    doc.querySelectorAll('.article-list a[href]').forEach(function(card){
      if(card.classList.contains('article-card'))return;
      var title=clean((card.querySelector('strong')||card).textContent);
      if(!title)return;
      items.push({type:'article',category:source.label,title:title,description:clean((card.querySelector('p')||{}).textContent),url:absoluteHref(card.getAttribute('href'),source.url)});
    });
    return items;
  }

  async function fetchProviders(){
    var response=await fetch(PROVIDER_SOURCE,{headers:{'X-Town-Search':'1'}});
    if(!response.ok)throw new Error('providers');
    var html=await response.text();
    var doc=new DOMParser().parseFromString(html,'text/html');
    var items=[];
    doc.querySelectorAll('.provider-card').forEach(function(card){
      var title=clean((card.querySelector('strong')||{}).textContent);
      if(!title)return;
      var section=card.closest('section[id]');
      var sectionTitle=section&&section.querySelector('h2')?clean(section.querySelector('h2').textContent):'업체·공식 A/S';
      items.push({type:'provider',category:sectionTitle,title:title,description:clean((card.querySelector('p')||{}).textContent),url:PROVIDER_SOURCE+(section&&section.id?'#'+section.id:'')});
    });
    return items;
  }

  async function buildIndex(){
    try{
      var cached=JSON.parse(sessionStorage.getItem(CACHE_KEY)||'null');
      if(cached&&Date.now()-cached.time<CACHE_TTL&&Array.isArray(cached.items))return cached.items;
    }catch(e){}
    var results=await Promise.allSettled(SOURCES.map(fetchSource).concat([fetchProviders()]));
    var items=categoryItems();
    state.failed=0;
    results.forEach(function(result){if(result.status==='fulfilled')items=items.concat(result.value);else state.failed+=1;});
    items=unique(items);
    try{sessionStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),items:items}));}catch(e){}
    return items;
  }

  function score(item,query){
    var q=normalize(query);if(!q)return item.type==='category'?2:1;
    var terms=q.split(/\s+/).filter(Boolean);
    var title=normalize(item.title),desc=normalize(item.description),cat=normalize(item.category),all=title+' '+desc+' '+cat;
    if(!terms.every(function(term){return all.indexOf(term)!==-1;}))return 0;
    var s=0;if(title===q)s+=40;if(title.indexOf(q)!==-1)s+=22;if(desc.indexOf(q)!==-1)s+=8;if(cat.indexOf(q)!==-1)s+=7;
    terms.forEach(function(term){if(title.indexOf(term)!==-1)s+=8;if(desc.indexOf(term)!==-1)s+=3;if(cat.indexOf(term)!==-1)s+=2;});
    if(item.type==='category')s+=2;return s;
  }

  function typeLabel(type){return type==='category'?'카테고리':type==='provider'?'업체·공식 A/S':'생활정보 글';}
  function createCard(item){
    var a=document.createElement('a');a.className='search-v2-card';a.href=item.url;
    var meta=document.createElement('span');meta.textContent=typeLabel(item.type)+' · '+item.category;
    var strong=document.createElement('strong');strong.textContent=item.title;
    var p=document.createElement('p');p.textContent=item.description||'관련 내용을 확인하세요.';
    var em=document.createElement('em');em.textContent='내용 보기 →';
    a.append(meta,strong,p,em);return a;
  }
  function createGroup(title,items){
    var section=document.createElement('section');section.className='search-v2-group';
    var h=document.createElement('h2');h.textContent=title+' '+items.length+'개';
    var list=document.createElement('div');list.className='search-v2-list';
    items.forEach(function(item){list.appendChild(createCard(item));});section.append(h,list);return section;
  }
  function setStatus(text){var el=qs('#searchStatus');if(el)el.textContent=text;}
  function updateMapLink(){var link=qs('#searchMapLink');if(link)link.href='/map-search?q='+encodeURIComponent(state.query||'운정');}
  function render(){
    var root=qs('#searchResults');if(!root)return;root.innerHTML='';updateMapLink();
    var q=state.query;var ranked;
    if(!q&&state.type==='all')ranked=state.items.filter(function(item){return item.type==='category';});
    else ranked=state.items.map(function(item){return {item:item,score:score(item,q)};}).filter(function(row){return row.score>0;}).sort(function(a,b){return b.score-a.score||a.item.title.localeCompare(b.item.title,'ko');}).map(function(row){return row.item;});
    if(state.type!=='all')ranked=ranked.filter(function(item){return item.type===state.type;});
    if(!ranked.length){
      var empty=document.createElement('div');empty.className='search-v2-empty';var h=document.createElement('h2');h.textContent=q?'검색 결과가 없습니다.':'찾을 내용을 입력하세요.';var p=document.createElement('p');p.textContent=q?'검색어를 조금 줄이거나, 장소라면 지도검색을 이용해보세요.':'예: 소아과, 세탁기 문, 야당역 주차, 에어컨';empty.append(h,p);root.appendChild(empty);setStatus(q?'“'+q+'” 검색 결과 0개':'검색어를 입력하면 카테고리, 글, 업체 정보를 함께 찾습니다.');return;
    }
    var groups=[['category','카테고리'],['article','생활정보 글'],['provider','업체·공식 A/S']];
    if(state.type==='all')groups.forEach(function(pair){var list=ranked.filter(function(item){return item.type===pair[0];});if(list.length)root.appendChild(createGroup(pair[1],list.slice(0,30)));});
    else root.appendChild(createGroup(typeLabel(state.type),ranked.slice(0,50)));
    if(!q&&state.type==='all')setStatus('생활 카테고리 7개 · 검색어를 입력하면 글과 업체까지 함께 찾습니다.');
    else setStatus((q?'“'+q+'” ':'')+'검색 결과 '+ranked.length+'개'+(state.failed?' · 일부 자료를 불러오지 못했습니다.':''));
  }

  function setLoading(on){var box=qs('#searchLoading');if(box)box.hidden=!on;var form=qs('#siteSearchForm');if(form)form.setAttribute('aria-busy',on?'true':'false');}
  function initFilters(){document.querySelectorAll('.search-v2-filter').forEach(function(btn){btn.addEventListener('click',function(){state.type=btn.dataset.type;document.querySelectorAll('.search-v2-filter').forEach(function(other){other.setAttribute('aria-pressed',other===btn?'true':'false');});render();});});}
  function submitQuery(value){state.query=clean(value);var url=new URL(location.href);if(state.query)url.searchParams.set('q',state.query);else url.searchParams.delete('q');history.replaceState(null,'',url.pathname+url.search);render();}

  document.addEventListener('DOMContentLoaded',async function(){
    var input=qs('#siteSearchInput'),form=qs('#siteSearchForm');var initial=new URLSearchParams(location.search).get('q')||'';if(input)input.value=initial;state.query=clean(initial);initFilters();updateMapLink();setLoading(true);setStatus('사이트 정보를 불러오는 중입니다.');
    try{state.items=await buildIndex();setLoading(false);render();}
    catch(e){setLoading(false);if(form)form.classList.add('is-error');setStatus('검색 정보를 불러오지 못했습니다. 카테고리나 지도검색을 이용해주세요.');}
    if(form)form.addEventListener('submit',function(e){e.preventDefault();submitQuery(input?input.value:'');});
  });
})();
