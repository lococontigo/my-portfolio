/* ═══════════════════════════════════════════
   GSAP ANIMATION SYSTEM
   Runs once on every page load.
   All timings use --ease: cubic-bezier(0.16,1,0.3,1)
═══════════════════════════════════════════ */

const EASE = 'power4.out'; // closest GSAP match to your cubic-bezier

// ── 1. PAGE ENTER — curtain sweeps out ──────────
function pageEnter() {
  const curtain = document.getElementById('curtain');
  if (!curtain) return;

  gsap.fromTo(curtain,
    { scaleX: 1, transformOrigin: 'right' },
    { scaleX: 0, duration: 0.6, ease: EASE,
      onComplete: () => curtain.style.display = 'none'
    }
  );
}

// ── 2. PAGE EXIT — curtain sweeps in ────────────
function pageExit(href) {
  const curtain = document.getElementById('curtain');
  if (!curtain) { location.href = href; return; }

  curtain.style.display = 'block';
  gsap.fromTo(curtain,
    { scaleX: 0, transformOrigin: 'left' },
    { scaleX: 1, duration: 0.4, ease: EASE,
      onComplete: () => location.href = href
    }
  );
}

// ── 3. SCROLL REVEALS ───────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

// ── 4. PARALLAX (hero rings / images) ───────────
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return; // skip on mobile

  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.4;
    gsap.to(el, {
      yPercent: -30 * speed,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
}

// ── 5. INTERCEPT LINKS for transition ───────────
function initLinks() {
  document.querySelectorAll('a[href]:not([target="_blank"])').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.startsWith('#') || href.startsWith('mailto')) return;
      e.preventDefault();
      pageExit(href);
    });
  });
}

// ── RUN ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  pageEnter();
  initReveal();
  initParallax();
  initLinks();
});

// Usage in HTML:
// <div class="reveal reveal-d1">Fades in on scroll</div>
// <img data-parallax="0.4">   ← drifts at 40% scroll speed</img>
// <a href="/work/yocale">     ← auto gets curtain transition</a>