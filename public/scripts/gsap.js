/* ═══════════════════════════════════════════
   GSAP SCROLL ANIMATIONS
   GSAP 3 + ScrollTrigger are loaded globally in base-layout.astro
═══════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

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

// ── GALLERY ROWS — split-track horizontal parallax ──
// Vertical scroll drives a single progress value; the top track glides
// right while the bottom track glides left, in opposite directions.
function initGalleryRows() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.case-design-gallery').forEach((gallery) => {
    gallery.querySelectorAll('.case-design-gallery-track').forEach((track, i) => {
      const fromX = i === 0 ? -50 : 0;
      const toX   = i === 0 ? 0 : -50;
      gsap.fromTo(track,
        { xPercent: fromX },
        {
          xPercent: toX,
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
