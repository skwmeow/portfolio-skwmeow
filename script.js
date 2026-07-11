/*!
 * SkwMeow — портфолио. script.js
 * Загружается через <script defer>, поэтому не блокирует парсинг HTML.
 * Модуль 1: рендер галереи, фильтры, лайтбокс, защита от копирования, reveal-анимации, nav, прелоадер.
 * Модуль 2: фоновая анимация частиц на canvas (#bgfx).
 */

(function(){
  "use strict";

  /* ---------- data ---------- */
  var works = [
    { src:'images/work-01.webp', w:1500, h:1500, title:'SM Season 1', cats:['avatar'] },
    { src:'images/work-02.webp', w:1500, h:1500, title:'Chating Outlaws', cats:['avatar'] },
    { src:'images/work-03.webp', w:1500, h:1500, title:'Vape Classic', cats:['avatar'] },
    { src:'images/work-04.webp', w:1500, h:1500, title:'Fuckindustry', cats:['avatar'] },
    { src:'images/work-05.webp', w:1500, h:1500, title:'Fuckeduwu', cats:['avatar'] },
    { src:'images/work-06.webp', w:1500, h:844, title:'F3TRETII', cats:['banner'] },
    { src:'images/work-07.webp', w:1500, h:844, title:'PRRJK', cats:['banner'] },
    { src:'images/work-08.webp', w:1500, h:844, title:'Subscribe', cats:['banner'] },
    { src:'images/work-09.webp', w:1500, h:844, title:'Fundik', cats:['banner'] },
    { src:'images/work-10.webp', w:1500, h:901, title:'Eterspire — лучшая MMORPG', cats:['preview'] },
    { src:'images/work-11.webp', w:1500, h:901, title:'Фора 5 смертей', cats:['preview'] },
    { src:'images/work-12.webp', w:1500, h:901, title:'Пуш 70K', cats:['preview'] },
    { src:'images/work-13.webp', w:1280, h:720, title:'Не детская игра', cats:['preview'] },
    { src:'images/work-14.webp', w:1500, h:901, title:'Забытые персонажи', cats:['preview'] },
    { src:'images/work-15.webp', w:1280, h:720, title:'Развитие с шара бога', cats:['preview'] },
    { src:'images/work-16.webp', w:1280, h:720, title:'Копии серверов', cats:['preview'] },
    { src:'images/work-17.webp', w:1500, h:841, title:'Бесплатный кейс', cats:['other'] },
    { src:'images/work-18.webp', w:1500, h:838, title:'Fretta VPN — личный кабинет', cats:['other'] },
    { src:'images/work-19.webp', w:1179, h:918, title:'Анимированные эмодзи', cats:['other'] }
  ];
  var catLabels = { avatar:'Аватарка', banner:'Баннер', preview:'Превью', other:'Другое' };

  function pluralWork(n){
    var m10=n%10, m100=n%100;
    if(m10===1 && m100!==11) return 'работа';
    if(m10>=2 && m10<=4 && (m100<12||m100>14)) return 'работы';
    return 'работ';
  }

  /* ---------- gallery render ---------- */
  var gallery = document.getElementById('gallery');
  var zoomIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

  works.forEach(function(w, i){
    var card = document.createElement('div');
    card.className = 'card';
    card.dataset.cats = w.cats.join(',');
    card.dataset.index = i;
    card.tabIndex = 0;
    card.setAttribute('role','button');
    card.setAttribute('aria-label', 'Открыть работу: ' + w.title);
    card.style.animationDelay = Math.min(i * 0.05, 0.6) + 's';
    card.innerHTML =
      '<img src="' + w.src + '" width="' + w.w + '" height="' + w.h + '" alt="' + w.title + '" loading="lazy" decoding="async" draggable="false">' +
      '<div class="card-overlay">' +
        '<span class="card-tag">' + w.cats.map(function(c){return catLabels[c];}).join(' · ') + '</span>' +
        '<span class="card-title">' + w.title + '</span>' +
      '</div>' +
      '<span class="card-zoom">' + zoomIcon + '</span>' +
      '<span class="hud-corner tl"></span><span class="hud-corner tr"></span><span class="hud-corner bl"></span><span class="hud-corner br"></span>';
    card.addEventListener('click', function(){ openLightbox(i); });
    card.addEventListener('keydown', function(e){
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openLightbox(i); }
    });
    gallery.appendChild(card);
  });

  var cardEls = Array.prototype.slice.call(document.querySelectorAll('.card'));

  /* ---------- filters ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var worksCount = document.getElementById('worksCount');

  function applyFilter(f){
    var visible = 0;
    cardEls.forEach(function(card){
      var cats = card.dataset.cats.split(',');
      var show = f==='all' || cats.indexOf(f) !== -1;
      card.classList.toggle('hide', !show);
      if(show) visible++;
    });
    worksCount.textContent = 'Показано ' + visible + ' ' + pluralWork(visible) + ' из ' + works.length;
  }

  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });
  applyFilter('all');

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var currentIndex = 0;

  function activeFilter(){
    var active = document.querySelector('.filter-btn.active');
    return active ? active.dataset.filter : 'all';
  }
  function visibleIndices(){
    var f = activeFilter();
    var arr = [];
    works.forEach(function(w,i){ if(f==='all' || w.cats.indexOf(f)!==-1) arr.push(i); });
    return arr;
  }
  function updateLightbox(){
    var w = works[currentIndex];
    lightboxImg.src = w.src;
    lightboxImg.alt = w.title;
    lightboxCaption.textContent = w.title + ' — ' + w.cats.map(function(c){return catLabels[c];}).join(' / ');
    var vis = visibleIndices();
    var pos = vis.indexOf(currentIndex);
    lightboxCounter.textContent = (pos+1) + ' / ' + vis.length;
  }
  function openLightbox(i){
    currentIndex = i;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lightboxClose').focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function navLightbox(dir){
    var vis = visibleIndices();
    if(!vis.length) return;
    var pos = vis.indexOf(currentIndex);
    if(pos===-1) pos = 0;
    var next = (pos + dir + vis.length) % vis.length;
    currentIndex = vis[next];
    updateLightbox();
  }
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', function(){ navLightbox(-1); });
  document.getElementById('lightboxNext').addEventListener('click', function(){ navLightbox(1); });
  lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('open')) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowLeft') navLightbox(-1);
    if(e.key==='ArrowRight') navLightbox(1);
  });

  /* ---------- protection ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2200);
  }
  document.addEventListener('contextmenu', function(e){
    if(e.target.tagName === 'IMG'){
      e.preventDefault();
      showToast('Копирование изображений отключено');
    }
  });
  document.addEventListener('dragstart', function(e){
    if(e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('keydown', function(e){
    var key = e.key ? e.key.toLowerCase() : '';
    var blockSave = (e.ctrlKey || e.metaKey) && key === 's';
    var blockSource = (e.ctrlKey || e.metaKey) && key === 'u';
    var blockDevtools = e.key === 'F12' ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'));
    if(blockSave || blockSource || blockDevtools){
      e.preventDefault();
      showToast('Действие отключено на этой странице');
    }
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold:0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('visible'); });
  }

  /* ---------- nav ---------- */
  var navEl = document.getElementById('nav');
  window.addEventListener('scroll', function(){
    navEl.classList.toggle('scrolled', window.scrollY > 40);
  });
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-links a').forEach(function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded','false');
    });
  });

  /* ---------- preloader ---------- */
  /* Hides ~950ms after full load (matches original timing).
     A hard 5s failsafe (defined inline in <head>) guarantees the
     preloader disappears even if this script or an asset never loads. */
  window.addEventListener('load', function(){
    setTimeout(function(){
      if(window.__hidePreloader){ window.__hidePreloader(); }
    }, 950);
  });
})();

(function(){
  "use strict";
  var canvas = document.getElementById('bgfx');
  if(!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, particles = [];
  var colors = ['201,182,238', '138,104,201', '232,201,221'];

  function resize(){
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    var count = Math.min(70, Math.round((innerWidth * innerHeight) / 26000));
    particles = [];
    for(var i = 0; i < count; i++){
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.6 + .6) * dpr,
        vx: (Math.random() - .5) * 0.12 * dpr,
        vy: (Math.random() - .5) * 0.12 * dpr,
        a: Math.random() * .5 + .15,
        c: colors[i % colors.length]
      });
    }
  }

  function draw(){
    ctx.clearRect(0, 0, w, h);
    for(var i = 0; i < particles.length; i++){
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = w + 10; if(p.x > w + 10) p.x = -10;
      if(p.y < -10) p.y = h + 10; if(p.y > h + 10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + p.c + ',' + p.a.toFixed(2) + ')';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var raf;
  function loop(){
    draw();
    raf = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);

  if(reduceMotion){
    draw();
  } else {
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){ cancelAnimationFrame(raf); }
      else { loop(); }
    });
    loop();
  }
})();
