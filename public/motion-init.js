(function () {
  try {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) document.documentElement.classList.add('motion-ready');
  } catch (e) {}
})();
