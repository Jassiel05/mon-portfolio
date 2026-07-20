 /* =========================================================
   Section COMPÉTENCES IA — interactions dédiées
   (chargé en defer, après script.js)
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = document.querySelectorAll('.comp-card');
  if (!cards.length) return;
  /* ===== Barres de maîtrise : animation au scroll + compteur ===== */
  function fillCard(card) {
    var fill = card.querySelector('.comp-level-fill');
    var pct = card.querySelector('.comp-level-pct');
    if (!fill) return;
    var target = parseInt(fill.getAttribute('data-level'), 10) || 0;
    fill.style.width = target + '%';
    if (!pct) return;
    if (reduce) { pct.textContent = target + '%'; return; }
    var start = null;
    function count(ts) {
          if (!start) start = ts;
      var progress = Math.min((ts - start) / 1400, 1);
      // même easing que la barre (easeOutQuint approx.)
      var eased = 1 - Math.pow(1 - progress, 4);
      pct.textContent = Math.round(eased * target) + '%';
      if (progress < 1) requestAnimationFrame(count);
    }
    requestAnimationFrame(count);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fillCard(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    cards.forEach(function (c) { obs.observe(c); });
  } else {
    cards.forEach(fillCard);
  }
  /* ===== Halo lumineux qui suit la souris sur chaque carte ===== */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }
})();
