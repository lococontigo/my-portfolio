/* ═══════════════════════════════════════════
   GSAP SCROLL ANIMATIONS
   GSAP 3 + ScrollTrigger are loaded globally in base-layout.astro
═══════════════════════════════════════════ */

// ── IMAGE REVEAL — mask shrinks to show the full image on scroll ──
function initImageReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

// ── GALLERY ROWS — alternating rows slide in/out from opposite sides ──
function initGalleryRows() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.case-design-gallery').forEach((gallery) => {
    gallery.querySelectorAll('.case-design-gallery-row').forEach((row, i) => {
      const fromX = i % 2 === 0 ? -100 : 100;
      gsap.fromTo(row,
        { xPercent: fromX },
        {
          xPercent: -fromX,
          ease: 'none',
          scrollTrigger: {
            trigger: gallery,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initImageReveal();
  initGalleryRows();
});
