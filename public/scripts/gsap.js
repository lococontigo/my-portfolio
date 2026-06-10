/* ═══════════════════════════════════════════
   GSAP SCROLL ANIMATIONS
   GSAP 3 + ScrollTrigger are loaded globally in base-layout.astro
═══════════════════════════════════════════ */

// ── IMAGE REVEAL — mask shrinks to show the full image on scroll ──
function initImageReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.set(el, { clipPath: 'inset(0 0 30% 0)' });
    gsap.to(el, {
      clipPath: 'inset(0 0 0% 0)',
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 35%',
        scrub: true,
      },
    });
  });
}

document.addEventListener('DOMContentLoaded', initImageReveal);
