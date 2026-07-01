/* =========================================================
   Portfolio — Jassiel Fidèle RAKOTOARINELINA
   Interactions & animations (Vanilla JS)
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== NEURAL NETWORK CANVAS — HERO (réactif souris) ===== */
  (function () {
    var canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var hero = document.getElementById('hero');
    var W, H, pts;
    var COUNT = 90, MAX_DIST = 180, MOUSE_RADIUS = 220, MOUSE_STRENGTH = 0.012;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width = hero.offsetWidth || window.innerWidth;
      H = canvas.height = hero.offsetHeight || window.innerHeight;
    }
    function init() {
      pts = Array.from({ length: COUNT }, function () {
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 2 + 1, pulse: Math.random() * Math.PI * 2, hue: Math.random()
        };
      });
    }
    hero.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)/1.2);
      bg.addColorStop(0, 'rgba(0,212,255,0.07)');
      bg.addColorStop(0.5, 'rgba(124,58,237,0.05)');
      bg.addColorStop(1, 'rgba(5,8,17,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      if (mouse.x > 0) {
        var halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS * 1.4);
        halo.addColorStop(0, 'rgba(0,212,255,0.12)');
        halo.addColorStop(0.5, 'rgba(124,58,237,0.06)');
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      }

      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var a = pts[i], b = pts[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < MAX_DIST) {
            var alpha = (1 - dist / MAX_DIST) * 0.45;
            var grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, 'rgba(0,212,255,' + alpha + ')');
            grad.addColorStop(1, 'rgba(124,58,237,' + alpha + ')');
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      }

      pts.forEach(function (p) {
        var mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        var mdist = Math.sqrt(mdx*mdx + mdy*mdy);
        if (mdist < MOUSE_RADIUS && mouse.x > 0) {
          var force = (1 - mdist / MOUSE_RADIUS) * MOUSE_STRENGTH;
          p.vx += mdx * force; p.vy += mdy * force;
          var speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
          if (speed > 2.5) { p.vx = (p.vx/speed)*2.5; p.vy = (p.vy/speed)*2.5; }
        } else { p.vx *= 0.995; p.vy *= 0.995; }

        p.pulse += 0.022;
        var glow = (Math.sin(p.pulse) + 1) / 2;
        var radius = p.r + glow * 1.8;
        var r = Math.round(p.hue * 124), g2 = Math.round((1 - p.hue) * 212), b2 = 255;

        var ng = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 5);
        ng.addColorStop(0, 'rgba(' + r + ',' + g2 + ',' + b2 + ',' + (0.7 * glow + 0.1) + ')');
        ng.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, radius * 5, 0, Math.PI*2); ctx.fillStyle = ng; ctx.fill();

        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(' + r + ',' + g2 + ',' + b2 + ',' + (0.8 + 0.2*glow) + ')'; ctx.fill();

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize', function () { resize(); init(); });
    resize(); init();
    if (!reduce) draw(); else { ctx.fillStyle = 'rgba(5,8,17,1)'; ctx.fillRect(0,0,W,H); }
  })();

  /* ===== MINI-CANVAS DES CARTES PROJET ===== */
  function initProjectCanvas(id, colorA, colorB) {
    var canvas = document.getElementById(id);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, pts;
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    function init() {
      pts = Array.from({ length: 30 }, function () {
        return { x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, r: Math.random()*1.5+0.5, pulse: Math.random()*Math.PI*2 };
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)/1.4);
      bg.addColorStop(0, colorA.replace('1)', '0.18)'));
      bg.addColorStop(1, colorB.replace('1)', '0.08)'));
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        for (var j = i+1; j < pts.length; j++) {
          var a = pts[i], b = pts[j];
          var dx = a.x-b.x, dy = a.y-b.y, d = Math.sqrt(dx*dx+dy*dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
            ctx.strokeStyle = colorA.replace('1)', (1-d/100)*0.4 + ')');
            ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }
      pts.forEach(function (p) {
        p.pulse += 0.03;
        var g2 = (Math.sin(p.pulse)+1)/2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r+g2, 0, Math.PI*2);
        ctx.fillStyle = colorA.replace('1)', (0.6+0.4*g2) + ')'); ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>W) p.vx *= -1;
        if (p.y<0||p.y>H) p.vy *= -1;
      });
      requestAnimationFrame(draw);
    }
    resize(); init(); if (!reduce) draw();
  }
  initProjectCanvas('canvas-email', 'rgba(0,212,255,1)', 'rgba(124,58,237,1)');
  initProjectCanvas('canvas-vocal', 'rgba(124,58,237,1)', 'rgba(0,212,255,1)');

  /* ===== EFFET MACHINE À ÉCRIRE ===== */
  (function () {
    var el = document.getElementById('typed');
    if (!el) return;
    var strings = [
      'des agents IA qui conversent : appel ou chatbot',
      'des emails qui semblent humains',
      'des workflows automatisés',
      'des systèmes qui travaillent 24/7',
      "l'intelligence au service de votre business"
    ];
    var si = 0, ci = 0, deleting = false;
    if (reduce) { el.textContent = strings[0]; return; }
    function type() {
      var str = strings[si];
      if (!deleting) {
        el.textContent = str.slice(0, ++ci);
        if (ci === str.length) { deleting = true; setTimeout(type, 2000); return; }
      } else {
        el.textContent = str.slice(0, --ci);
        if (ci === 0) { deleting = false; si = (si + 1) % strings.length; }
      }
      setTimeout(type, deleting ? 35 : 60);
    }
    setTimeout(type, 1200);
  })();

  /* ===== SCROLL REVEAL ===== */
  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
  })();

  /* ===== TILT 3D SUR LES CARTES PROJET ===== */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.projet-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        var rx = -(e.clientY - cy) / rect.height * 8;
        var ry = (e.clientX - cx) / rect.width * 8;
        card.style.transform = 'translateY(-10px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseenter', function () { card.style.transition = 'border-color 0.4s, box-shadow 0.4s'; });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'all 0.5s cubic-bezier(0.23,1,0.32,1)';
      });
    });
  }


  /* ===== NAV : réduction au scroll ===== */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.padding = window.scrollY > 50 ? '12px 60px' : '20px 60px';
    }, { passive: true });
  }

  /* ===== ANNÉE DYNAMIQUE FOOTER ===== */
  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
