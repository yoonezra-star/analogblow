(function(){
  if(window.__tcCategoryV2Loaded)return;
  window.__tcCategoryV2Loaded=true;
  var body=document.body;
  if(!body||!body.classList.contains('tc-category-page'))return;
  var path=window.location.pathname.replace(/\/$/,'')||'/';
  if(path==='/local-services'||path==='/local-repair-shops')return;

  var LIMIT=6;
  document.querySelectorAll('.article-list').forEach(function(list,index){
    var cards=Array.prototype.slice.call(list.querySelectorAll(':scope > a.article-card'));
    if(cards.length<=LIMIT)return;

    cards.slice(LIMIT).forEach(function(card){card.hidden=true;card.setAttribute('data-tc-collapsed','true');});

    var control=document.createElement('div');
    control.className='tc-list-control';
    var button=document.createElement('button');
    button.type='button';
    button.className='tc-list-more';
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','tcArticleList'+index);
    list.id=list.id||'tcArticleList'+index;
    button.textContent='전체 글 '+cards.length+'개 보기';
    control.appendChild(button);
    list.insertAdjacentElement('afterend',control);

    button.addEventListener('click',function(){
      var expanded=button.getAttribute('aria-expanded')==='true';
      cards.slice(LIMIT).forEach(function(card){card.hidden=expanded;});
      button.setAttribute('aria-expanded',expanded?'false':'true');
      button.textContent=expanded?'전체 글 '+cards.length+'개 보기':'간단히 보기';
      if(expanded){list.scrollIntoView({block:'start'});}
    });
  });
})();
