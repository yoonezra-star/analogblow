import page from "../local-services.html";

const enhancement = String.raw`
<style>
.repair-finder{margin:28px 0 22px;padding:24px;border:1px solid rgba(15,23,42,.12);border-radius:22px;background:#fff}.repair-finder h2{margin:0 0 8px;font-size:1.35rem}.repair-finder-intro{margin:0 0 18px;color:#475569}.repair-search-row{display:flex;gap:10px;align-items:center;margin-bottom:16px}.repair-search-row input{flex:1;min-width:0;padding:13px 15px;border:1px solid #cbd5e1;border-radius:12px;font:inherit;background:#fff;color:#0f172a}.repair-search-row button,.repair-chip{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:999px;padding:10px 14px;font:inherit;font-weight:700;cursor:pointer}.repair-search-row button:hover,.repair-chip:hover{border-color:#64748b}.repair-chip[aria-pressed="true"]{background:#0f172a;color:#fff;border-color:#0f172a}.repair-chip-list{display:flex;flex-wrap:wrap;gap:9px}.repair-count{margin:14px 0 0;color:#475569;font-size:.95rem}.repair-category-results{display:grid;gap:24px;margin-top:22px}.repair-category-section{scroll-margin-top:110px}.repair-category-section h2{margin-bottom:6px}.repair-category-section>p{margin-top:0;color:#64748b}.repair-category-section[hidden]{display:none}.repair-empty{padding:28px;border:1px dashed #cbd5e1;border-radius:18px;text-align:center;color:#64748b}.repair-category-section .article-card[hidden]{display:none!important}@media(max-width:720px){.repair-finder{padding:18px}.repair-search-row{align-items:stretch;flex-direction:column}.repair-search-row button{align-self:flex-start}.repair-chip{padding:9px 12px;font-size:.92rem}}
</style>
<script>
(function(){
  var article=document.querySelector('main article');
  if(!article) return;
  var cards=Array.prototype.slice.call(article.querySelectorAll('a.article-card[href*="posts/"]'));
  if(!cards.length) return;

  var defs=[
    {key:'door',label:'현관·문',desc:'중문·방문·도어락·방화문·현관 부속',terms:['middle-door','interior-door','fire-door','doorlock','lock-doorlock','door-safety','entrance-door','entrance-interior-door','entrance-tile','shoe-cabinet']},
    {key:'bath',label:'욕실·배관',desc:'세면대·양변기·샤워·수전·배수·비데',terms:['bathroom','basin','toilet','shower','bidet','bathtub','plumbing']},
    {key:'kitchen',label:'주방·수납',desc:'싱크대·상판·수납장·후드·인덕션',terms:['kitchen','sink-','induction','food-waste']},
    {key:'laundry',label:'세탁',desc:'세탁기·세탁실·빨래건조대·급배수',terms:['washer','laundry','drying-rack','motorized-drying']},
    {key:'fridge',label:'냉장고·식기세척기',desc:'냉장고·제빙기·식기세척기 점검',terms:['refrigerator','dishwasher']},
    {key:'aircon',label:'에어컨',desc:'실내기·실외기·배수·배관·결로',terms:['aircon']},
    {key:'boiler',label:'보일러',desc:'난방·온수·분배기·온도조절기',terms:['boiler']},
    {key:'electric',label:'전기·스마트홈',desc:'조명·콘센트·센서·실링팬·스마트기기',terms:['outlet','lighting','homecam','motorized-curtain','wall-tv','ceiling-fan','smart-switch','sensor-light']},
    {key:'window',label:'창호·베란다',desc:'샷시·방충망·창틀·유리·베란다',terms:['window','balcony','screen','sash']},
    {key:'other',label:'기타 생활서비스',desc:'바닥·벽·수납·입주·차량·민원 등',terms:[]}
  ];

  function classify(card){
    var hay=((card.getAttribute('href')||'')+' '+(card.textContent||'')).toLowerCase();
    for(var i=0;i<defs.length-1;i++){
      for(var j=0;j<defs[i].terms.length;j++){
        if(hay.indexOf(defs[i].terms[j])!==-1) return defs[i].key;
      }
    }
    return 'other';
  }

  var oldSections=[];
  cards.forEach(function(card){var section=card.closest('.rich-section');if(section&&oldSections.indexOf(section)===-1)oldSections.push(section);});

  var finder=document.createElement('section');
  finder.className='rich-section service-category-index repair-finder';
  finder.setAttribute('aria-labelledby','repairFinderTitle');
  finder.innerHTML='<h2 id="repairFinderTitle">생활수리·가전 카테고리 찾기</h2><p class="repair-finder-intro">증상이나 공간으로 좁혀서 필요한 글을 바로 찾을 수 있습니다.</p><div class="repair-search-row"><label class="sr-only" for="repairSearch">생활수리 글 검색</label><input id="repairSearch" type="search" autocomplete="off" placeholder="예: 세탁기 문, 냉장고 물고임, 도어락"><button type="button" id="repairSearchClear">검색 초기화</button></div><div class="repair-chip-list" role="group" aria-label="생활수리 카테고리"></div><p class="repair-count" id="repairCount" aria-live="polite"></p>';

  var results=document.createElement('div');
  results.className='repair-category-results';
  var lists={};
  var counts={};
  defs.forEach(function(def){
    counts[def.key]=0;
    var section=document.createElement('section');
    section.className='rich-section repair-category-section';
    section.id='repair-'+def.key;
    section.setAttribute('data-repair-section',def.key);
    section.innerHTML='<h2>'+def.label+'</h2><p>'+def.desc+'</p><div class="article-list"></div>';
    lists[def.key]=section.querySelector('.article-list');
    results.appendChild(section);
  });

  cards.forEach(function(card){
    var key=classify(card);
    card.setAttribute('data-repair-category',key);
    counts[key]++;
    lists[key].appendChild(card);
  });

  var insertAfter=article.querySelector('.content-visual')||article.querySelector('.page-action-row')||article.querySelector('h1 + p');
  if(insertAfter){insertAfter.insertAdjacentElement('afterend',finder);finder.insertAdjacentElement('afterend',results);}else{article.insertBefore(finder,article.firstChild);finder.insertAdjacentElement('afterend',results);}

  oldSections.forEach(function(section){
    if(section!==finder && !section.querySelector('a.article-card[href*="posts/"]')) section.remove();
  });

  var chips=finder.querySelector('.repair-chip-list');
  var allButton=document.createElement('button');
  allButton.type='button';allButton.className='repair-chip';allButton.setAttribute('data-repair-filter','all');allButton.setAttribute('aria-pressed','true');allButton.textContent='전체 '+cards.length;
  chips.appendChild(allButton);
  defs.forEach(function(def){
    var button=document.createElement('button');
    button.type='button';button.className='repair-chip';button.setAttribute('data-repair-filter',def.key);button.setAttribute('aria-pressed','false');button.textContent=def.label+' '+counts[def.key];chips.appendChild(button);
  });

  var input=finder.querySelector('#repairSearch');
  var clear=finder.querySelector('#repairSearchClear');
  var countNode=finder.querySelector('#repairCount');
  var active='all';

  function apply(){
    var q=(input.value||'').trim().toLowerCase();
    var visible=0;
    defs.forEach(function(def){
      var section=results.querySelector('[data-repair-section="'+def.key+'"]');
      var sectionVisible=0;
      Array.prototype.slice.call(lists[def.key].querySelectorAll('a.article-card')).forEach(function(card){
        var matchesCategory=active==='all'||active===def.key;
        var matchesText=!q||(card.textContent||'').toLowerCase().indexOf(q)!==-1||(card.getAttribute('href')||'').toLowerCase().indexOf(q)!==-1;
        var show=matchesCategory&&matchesText;
        card.hidden=!show;
        if(show){visible++;sectionVisible++;}
      });
      section.hidden=sectionVisible===0;
    });
    var oldEmpty=results.querySelector('.repair-empty');if(oldEmpty)oldEmpty.remove();
    if(!visible){var empty=document.createElement('p');empty.className='repair-empty';empty.textContent='조건에 맞는 글이 없습니다. 다른 검색어나 전체 카테고리를 선택해 보세요.';results.appendChild(empty);}
    countNode.textContent='현재 '+visible+'개 글을 표시하고 있습니다.';
  }

  function setActive(key,updateHash){
    active=defs.some(function(def){return def.key===key;})?key:'all';
    Array.prototype.slice.call(chips.querySelectorAll('.repair-chip')).forEach(function(button){button.setAttribute('aria-pressed',button.getAttribute('data-repair-filter')===active?'true':'false');});
    apply();
    if(updateHash){var hash=active==='all'?'repair-all':'repair-'+active;history.replaceState(null,'','#'+hash);}
  }

  chips.addEventListener('click',function(event){var button=event.target.closest('[data-repair-filter]');if(!button)return;setActive(button.getAttribute('data-repair-filter'),true);});
  input.addEventListener('input',apply);
  clear.addEventListener('click',function(){input.value='';setActive('all',true);input.focus();});

  var hash=(location.hash||'').replace('#','');
  var hashMap={'service-door':'door','service-bath':'bath','service-kitchen':'kitchen','service-laundry':'laundry','service-appliance':'all','repair-all':'all','repair-door':'door','repair-bath':'bath','repair-kitchen':'kitchen','repair-laundry':'laundry','repair-fridge':'fridge','repair-aircon':'aircon','repair-boiler':'boiler','repair-electric':'electric','repair-window':'window','repair-other':'other'};
  setActive(hashMap[hash]||'all',false);
  window.addEventListener('hashchange',function(){var next=(location.hash||'').replace('#','');setActive(hashMap[next]||'all',false);});
})();
</script>`;

export function onRequest() {
  const html = page
    .replace('./assets/site-20260815-brand-1.js"', './assets/site-20260815-brand-1.js?v=20260826-repair-nav-3"')
    .replace('</head>', enhancement.split('<script>')[0] + '</head>')
    .replace('</body>', '<script>' + enhancement.split('<script>')[1].split('</script>')[0] + '</script></body>');

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
