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

    const reverse = marquee.hasAttribute('data-marquee-reverse');
    const tween = reverse
      ? gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: 30, repeat: -1 })
      : gsap.to(track, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 });

    let dragging = false;
    let startX = 0;
    let startTime = 0;
    const dir = reverse ? -1 : 1;

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
      // drag left (dx < 0) advances the playhead forward; reversed for data-marquee-reverse
      let t = startTime - dir * (dx / setWidth()) * dur;
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

// ── CLOSING PARALLAX — img[data-parallax] drifts up slower than the page ──
// The image is taller than its frame; the overflow (img height − frame height)
// is the slack it can pan through without ever revealing a gap. The image
// pans the full slack over the scroll traversal, so it tracks at < 1× the
// scroll speed — slower than the page, creating depth.
function initClosingParallax() {
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const img = document.querySelector('img[data-parallax]');
  if (!img) return;

  const frame = img.parentElement;

  gsap.fromTo(img,
    { y: 0 },
    {
      // recompute the slack on every refresh so it survives the lazy image
      // loading in and any responsive resize
      y: () => -(img.offsetHeight - frame.offsetHeight),
      ease: 'none',
      scrollTrigger: {
        trigger: frame,
        start:   'top bottom',
        end:     'bottom top',
        scrub:   true,
        invalidateOnRefresh: true,
      },
    }
  );
}

// ── QUOTE PANEL HORIZONTAL SCROLL ────────────────────────────
// Pins the quotes section and converts vertical scroll into
// horizontal movement across the interview panels.
function initQuotePanelScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const quotes = document.querySelector('.case-research-quotes');
  const track  = document.querySelector('.case-research-quotes-track');
  if (!quotes || !track) return;

  const panels = track.querySelectorAll('.case-research-quote-panel');
  if (panels.length < 2) return;

  const totalMove = window.innerWidth * (panels.length - 1);

  gsap.to(track, {
    x:    -totalMove,
    ease: 'none',
    scrollTrigger: {
      trigger:             quotes,
      pin:                 true,
      start:               'top top',
      end:                 () => `+=${totalMove}`,
      scrub:               1,
      invalidateOnRefresh: true,
    },
  });
}

// ── STAT COUNTER — counts from 0 to final value on scroll ──
function initStatCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.case-highlight-stats').forEach((group) => {
    group.querySelectorAll('.case-highlight-stat-value').forEach((el, i) => {
      const original = el.textContent.trim();
      // Matches a single number (int or decimal) with optional prefix/suffix.
      // Fails on multi-number strings like "2-3 clicks" — those are skipped.
      const match = original.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)([^0-9]*)$/);
      if (!match) return;

      const prefix  = match[1];
      const end     = parseFloat(match[2]);
      const suffix  = match[3];
      const counter = { val: 0 };

      el.textContent = prefix + '0' + suffix;

      gsap.to(counter, {
        val:          end,
        duration:     1.4,
        ease:         'power4.out',
        delay:        i * 0.15,
        onUpdate:     () => { el.textContent = prefix + Math.round(counter.val) + suffix; },
        onComplete:   () => { el.textContent = original; },
        scrollTrigger: {
          trigger:       group,
          start:         'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });
  });
}

// ── STAGGER REVEAL — children fade up in sequence when parent enters view ──
function initStaggerReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-stagger-reveal]').forEach((group) => {
    group.querySelectorAll('[data-stagger-child]').forEach((child, i) => {
      gsap.fromTo(child,
        { opacity: 0, y: 20 },
        {
          opacity:  1,
          y:        0,
          duration: 0.7,
          ease:     'power4.out',
          delay:    i * 0.15,
          scrollTrigger: {
            trigger:       group,
            start:         'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initImageReveal();
  initGalleryRows();
  initMarquee();
  initParallax();
  initClosingParallax();
  initQuotePanelScroll();
  initStatCounters();
  initStaggerReveal();
});

// Lazy-loaded / late-decoding images can change layout after DOMContentLoaded,
// which throws off ScrollTrigger's cached measurements — recompute once
// everything has loaded.
window.addEventListener('load', () => ScrollTrigger.refresh());
