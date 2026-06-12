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

// ── MARQUEE — seamless auto-scroll + drag-to-scrub ──
// The track holds the card set rendered twice; sliding it -50% lands
// exactly one set over, so the loop is invisible. It auto-scrolls,
// pauses on hover, and can be dragged to fast-forward (drag left) or
// rewind (drag right); auto-scroll resumes from the new spot on release.
function initMarquee() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-marquee]').forEach((marquee) => {
    const track = marquee.querySelector('[data-marquee-track]');
    if (!track) return;

    const tween = gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      duration: 30,
      repeat: -1,
    });

    let dragging = false;
    let startX = 0;
    let startTime = 0;

    // px the track travels over one full loop = one card set's width
    const setWidth = () => track.offsetWidth / 2 || 1;

    marquee.addEventListener('mouseenter', () => { if (!dragging) tween.pause(); });
    marquee.addEventListener('mouseleave', () => { if (!dragging) tween.resume(); });

    marquee.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      startTime = tween.time();
      tween.pause();
      marquee.classList.add('is-dragging');
      marquee.setPointerCapture?.(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dur = tween.duration();
      // drag left (dx < 0) advances the playhead forward
      let t = startTime - (dx / setWidth()) * dur;
      t = ((t % dur) + dur) % dur;   // wrap into [0, dur)
      tween.time(t);
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      marquee.classList.remove('is-dragging');
      tween.resume();
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });
}

// ── PARALLAX — full-bleed image drifts within its frame on scroll ──
// The image is rendered 20% taller than its container, so it can slide
// from its top edge up to its bottom edge without ever revealing a gap.
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-parallax]').forEach((frame) => {
    const img = frame.querySelector('img');
    if (!img) return;

    gsap.fromTo(img,
      { yPercent: 0 },
      {
        yPercent: -16.67,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initImageReveal();
  initGalleryRows();
  initMarquee();
  initParallax();
});
