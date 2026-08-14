(function () {
  var main = document.querySelector('main');

  if (!main) return;

  if (!main.id) main.id = 'site-main-content';
  main.setAttribute('tabindex', '-1');
})();
