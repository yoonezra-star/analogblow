(function(){
  var article=document.querySelector('.article-page');
  if(!article||article.dataset.tcDensityReady==='true')return;
  article.dataset.tcDensityReady='true';

  var directSections=Array.prototype.slice.call(article.querySelectorAll(':scope > section.rich-section'));
  var primary=directSections.filter(function(section){
    return !section.classList.contains('related-reading')&&!section.classList.contains('local-cafe-section');
  });
  var visibleLimit=3;

  if(primary.length>visibleLimit){
    var extras=primary.slice(visibleLimit);
    var details=document.createElement('details');
    details.className='tc-article-more';
    var summary=document.createElement('summary');
    summary.textContent='추가 내용 보기 ('+extras.length+')';
    var content=document.createElement('div');
    content.className='tc-article-more__content';
    details.appendChild(summary);
    details.appendChild(content);
    extras.forEach(function(section){content.appendChild(section);});

    var related=article.querySelector(':scope > section.related-reading');
    var cafe=article.querySelector(':scope > section.local-cafe-section');
    var anchor=cafe||related;
    if(anchor)article.insertBefore(details,anchor);else article.appendChild(details);
  }

  var cafeSection=article.querySelector(':scope > section.local-cafe-section');
  if(cafeSection){
    var cafeDetails=document.createElement('details');
    cafeDetails.className='tc-article-community';
    var cafeSummary=document.createElement('summary');
    cafeSummary.textContent='지역 후기 보기';
    cafeDetails.appendChild(cafeSummary);
    cafeSection.parentNode.insertBefore(cafeDetails,cafeSection);
    cafeDetails.appendChild(cafeSection);
  }

  var relatedSection=article.querySelector(':scope > section.related-reading');
  if(relatedSection){
    var relatedItems=Array.prototype.slice.call(relatedSection.querySelectorAll('.insight-grid > article, .article-list > a.article-card'));
    relatedItems.slice(3).forEach(function(item){item.hidden=true;item.setAttribute('data-tc-related-extra','true');});
  }
})();
