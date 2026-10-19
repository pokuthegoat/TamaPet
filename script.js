// Always start at the top on load / reload (the browser would otherwise restore the old scroll position).
// GSAP's ScrollTrigger resets history.scrollRestoration, so it's set again after ScrollTrigger is set up
// (initTextReveals); jumping to the top on unload makes the remembered position the top regardless.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('pagehide', () => window.scrollTo(0, 0));

// Mobile nav toggle
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('is-open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
});

// CA button in the navbar: hover shows the full contract address, click copies it.
(function initCa() {
  const btn = document.getElementById('caBtn');
  if (!btn) return;
  const hint = btn.querySelector('.nav__ca-hint');
  // the button shows the first characters; the hover panel shows it all (both from data-ca, so they can't differ)
  btn.querySelector('.nav__ca-short').textContent = `${btn.dataset.ca.slice(0, 5)}…`;
  btn.querySelector('.nav__ca-addr').textContent = btn.dataset.ca;
  let reset = 0;
  btn.addEventListener('click', async () => {
    const ca = btn.dataset.ca;
    try {
      await navigator.clipboard.writeText(ca);
    } catch { // no clipboard API (e.g. not https): copy through a hidden text field
      const ta = Object.assign(document.createElement('textarea'), { value: ca });
      ta.style.cssText = 'position:fixed; opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    hint.textContent = 'Copied!';
    btn.classList.add('is-copied');
    clearTimeout(reset);
    reset = setTimeout(() => { hint.textContent = 'Click to copy'; btn.classList.remove('is-copied'); }, 1600);
  });
})();

// FAQ accordion: animates the answer's real height (GSAP), so opening and closing are smooth and immediate.
// Opening one closes the others. Without GSAP it falls back to an instant toggle.
(function initFaq() {
  const items = [...document.querySelectorAll('.faq__item')];
  const setOpen = (item, open) => {
    const a = item.querySelector('.faq__a'), p = a.querySelector('p');
    item.classList.toggle('is-open', open);
    if (typeof gsap === 'undefined') { a.style.height = open ? 'auto' : '0px'; return; }
    gsap.killTweensOf([a, p]);
    if (open) {
      // Tween to the measured content height, then hand back to 'auto' so it stays right if the page resizes.
      gsap.to(a, { height: a.scrollHeight, duration: 0.55, ease: 'power3.inOut', onComplete: () => { a.style.height = 'auto'; } });
      gsap.fromTo(p, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.12, ease: 'power2.out' });
    } else {
      gsap.fromTo(a, { height: a.offsetHeight }, { height: 0, duration: 0.45, ease: 'power3.inOut' });
      gsap.to(p, { opacity: 0, duration: 0.2, ease: 'power1.out' });
    }
  };
  items.forEach((item) => {
    item.querySelector('.faq__q').addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((i) => { if (i !== item && i.classList.contains('is-open')) setOpen(i, false); });
      setOpen(item, open);
    });
  });
})();

// Grain texture: generate a small random-noise tile once, used by the fixed .grain layer in styles.css
(function initGrain() {
  const grain = document.querySelector('.grain');
  if (!grain) return;
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.random() * 255;
    imageData.data[i] = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  grain.style.backgroundImage = `url(${canvas.toDataURL()})`;
})();

// Lenis smooth scroll — settings mirror D:\gamestock\src\lib\smooth-scroll.ts (duration/easing/wheelMultiplier),
// simplified to a plain continuous rAF loop since this is a static site, not React.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lenis = (function initLenis() {
  if (reduceMotion) return null;
  if (typeof Lenis === 'undefined') return null;

  const expoOut = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  const lenis = new Lenis({
    duration: 1.2,
    easing: expoOut,
    wheelMultiplier: 1,
    syncTouch: false,
    stopInertiaOnNavigate: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Smooth-scroll in-page anchor links (nav, FAQ links, etc.)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
    });
  });
  return lenis;
})();

// Background orbs: slight scroll parallax — each moves down by `depth` × the scroll, so it lags behind the
// page a little and reads as further away.
(function initOrbs() {
  if (reduceMotion) return;
  const orbs = [...document.querySelectorAll('.orb')].map((el) => ({ el, depth: parseFloat(el.style.getPropertyValue('--depth')) || 0.1 }));
  if (!orbs.length) return;
  let last = -1;
  const tick = () => {
    const y = window.scrollY;
    if (y !== last) {
      last = y;
      for (const o of orbs) o.el.style.setProperty('--shift', `${(y * o.depth).toFixed(1)}px`);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// Scroll-driven text, like drone.riotters.com: headlines light up word by word as you scroll (tied to the
// scroll position), smaller text and cards fade + rise in as they enter.
(function initTextReveals() {
  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.clearScrollMemory('manual');
  if (lenis) lenis.on('scroll', ScrollTrigger.update);

  document.fonts.ready.then(() => {
    // Headlines: words go from faint to full as the heading moves up the screen.
    document.querySelectorAll('.h2, .banner__title').forEach((el) => {
      const split = new SplitText(el, { type: 'words' });
      gsap.fromTo(split.words, { opacity: 0.15 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: 0.6 },
      });
    });

    // Everything else: fade + rise in once, as it enters.
    const reveal = (targets, opts = {}) => {
      gsap.utils.toArray(targets).forEach((el) => {
        gsap.from(el, {
          // clearProps: a leftover transform would trap buttons inside below the 3D device's layer.
          opacity: 0, y: 28, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity', ...opts,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    };
    reveal('main .eyebrow, .body-lg, .panel__sub, .link-arrow, .how__text');
    reveal('.stat-tile, .who__card, .faq__item', { duration: 0.7 });

    // Hero headline: words rise in once the loading screen has cleared.
    const heroSplit = new SplitText('.hero__title', { type: 'words' });
    const heroIn = gsap.timeline({ paused: true })
      .from(heroSplit.words, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.08 })
      .from('.hero__sub, .hero__actions', { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity' }, '-=0.6');
    const loader = document.getElementById('loader');
    if (!loader || loader.classList.contains('is-done')) heroIn.play();
    else new MutationObserver((_, obs) => {
      if (loader.classList.contains('is-done')) { heroIn.play(); obs.disconnect(); }
    }).observe(loader, { attributes: true, attributeFilter: ['class'] });

    ScrollTrigger.refresh();
  });
})();

// Live counter: real animals saved by all players (api/stats.js). Counts up when it scrolls into view, then
// checks for new saves every 15 s. The local test server has no /api, so it reads the live site's number.
(function initSavedCounter() {
  const el = document.getElementById('savedCount');
  if (!el) return;
  const api = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'https://tamapet-alpha.vercel.app' : '';
  let shown = 0, target = 0, seen = false, raf = 0;
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const animate = () => {
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now(), dur = reduceMotion ? 0 : 1400;
    const step = (now) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      shown = from + (target - from) * (1 - Math.pow(1 - k, 3));
      el.textContent = fmt(shown);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const load = async () => {
    try {
      const r = await fetch(`${api}/api/stats`, { cache: 'no-store' });
      if (!r.ok) return;
      const { saved } = await r.json();
      if (typeof saved === 'number' && saved !== target) { target = saved; if (seen) animate(); }
    } catch { /* offline: keep the last number */ }
  };
  new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting) && !seen) { seen = true; animate(); }
  }, { threshold: 0.4 }).observe(el);
  load();
  setInterval(load, 15000);
})();

// Live fees counter: total creator fees the TamaPet coin has made, in USD (api/fees.js reads them from the chain).
// Counts up smoothly to each new value; before launch the endpoint simply returns 0.
(function initFeesCounter() {
  const el = document.getElementById('feesCount');
  if (!el) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const api = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'https://tamapet-alpha.vercel.app' : '';
  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let shown = 0, target = 0, seen = false, raf = 0;
  const animate = () => {
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now(), dur = reduceMotion ? 0 : 1400;
    const step = (now) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      shown = from + (target - from) * (1 - Math.pow(1 - k, 3));
      el.textContent = fmt(shown);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const load = async () => {
    try {
      const r = await fetch(`${api}/api/fees`, { cache: 'no-store' });
      if (!r.ok) return; // keep the last number
      const { usd } = await r.json();
      if (typeof usd === 'number' && usd !== target) { target = usd; if (seen) animate(); }
    } catch { /* offline: keep the last number */ }
  };
  new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting) && !seen) { seen = true; animate(); }
  }, { threshold: 0.4 }).observe(el);
  load();
  setInterval(load, 15000);
})();
