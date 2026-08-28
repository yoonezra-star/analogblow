(function(){
  if(window.__tcSecondaryV2Loaded)return;
  var path=window.location.pathname.replace(/\/$/,'')||'/';
  var supported=['/policy-news','/movein','/weather-life','/real-estate','/unjeong-intro','/polling-place'];
  if(supported.indexOf(path)===-1)return;
  window.__tcSecondaryV2Loaded=true;

  var body=document.body;
  if(body)body.classList.add('tc-secondary-page');
  var article=document.querySelector('main .page-card');
  if(!article)return;

  ['.page-priority-grid','.content-visual','.category-brief'].forEach(function(selector){
    article.querySelectorAll(selector).forEach(function(node){node.remove();});
  });
  article.querySelectorAll(':scope > section.rich-section').forEach(function(section){
    if(section.querySelector('.command-grid'))section.remove();
  });

  var protectedIds=['realEstateLive'];
  var sections=Array.prototype.slice.call(article.querySelectorAll(':scope > section.rich-section')).filter(function(section){
    return protectedIds.indexOf(section.id)===-1;
  });
  var visibleLimit=path==='/unjeong-intro'?3:2;
  if(sections.length>visibleLimit){
    var extras=sections.slice(visibleLimit);
    var details=document.createElement('details');
    details.className='tc-secondary-more';
    var summary=document.createElement('summary');
    summary.textContent='추가 안내 보기 ('+extras.length+')';
    var content=document.createElement('div');
    content.className='tc-secondary-more__content';
    details.appendChild(summary);details.appendChild(content);
    extras.forEach(function(section){content.appendChild(section);});
    var source=article.querySelector(':scope > .source-list');
    var notice=article.querySelector(':scope > .notice-box:last-of-type');
    var anchor=source||notice;
    if(anchor)article.insertBefore(details,anchor);else article.appendChild(details);
  }

  var directTables=Array.prototype.slice.call(article.querySelectorAll(':scope > .data-table-wrap'));
  directTables.slice(1).forEach(function(table,index){
    var heading=table.previousElementSibling;
    if(!heading||!/^H[2-4]$/.test(heading.tagName))heading=null;
    var details=document.createElement('details');
    details.className='tc-secondary-table-more';
    var summary=document.createElement('summary');
    summary.textContent=(heading?heading.textContent.trim():'세부 표 '+(index+2))+' 보기';
    var content=document.createElement('div');
    content.className='tc-secondary-table-more__content';
    table.parentNode.insertBefore(details,heading||table);
    details.appendChild(summary);details.appendChild(content);
    if(heading)content.appendChild(heading);
    content.appendChild(table);
  });
})();