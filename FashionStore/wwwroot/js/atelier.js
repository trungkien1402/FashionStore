/* ===================================================================
   HNMTSHOP ATELIER — Scroll-Driven Suit Sequence (1:1 Replica)
   Canvas Image-Sequence Scrubbing + Editorial Panel Choreography
   =================================================================== */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const FRAME_COUNT = 535;
  const framePath = (i) => `https://tailor-by-octaboot.vercel.app/assets/frames/frame_${String(i).padStart(5, "0")}.webp`;

  const canvas = document.getElementById("atFrames");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: false });

  const images = new Array(FRAME_COUNT);
  const state  = { frame: 0 };
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- Canvas sizing + cover-fit draw (HD Quality) ---------- */
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    render();
  }

  function render() {
    const img = images[state.frame | 0];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);   // cover
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) * 0.5;
    const dy = (ch - dh) * 0.5;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ---------- Preload Buffer ---------------------------------------- */
  const loaderEl  = document.getElementById("atLoader");
  const fillEl    = document.getElementById("atLoaderFill");
  const pctEl     = document.getElementById("atLoaderPct");

  function preload(onEnough) {
    let loaded = 0;
    let started = false;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        loaded++;
        const p = loaded / FRAME_COUNT;
        const pct = Math.round(p * 100);
        if (fillEl) fillEl.style.width = pct + "%";
        if (pctEl) pctEl.textContent = pct;

        // First frame ready -> paint immediately so no black flash
        if (i === 0) render();

        // Start experience once we have comfortable buffer (40 frames)
        if (!started && (loaded >= 40 || p === 1)) {
          started = true;
          onEnough();
        }
        if (p === 1 && loaderEl) {
          loaderEl.classList.add("is-done");
        }
      };
      img.src = framePath(i + 1);
      images[i] = img;
    }
  }

  /* ---------- Build the scroll experience --------------------------- */
  function build() {
    sizeCanvas();

    const progressFill = document.getElementById("atProgressFill");
    const movementNo   = document.getElementById("atMovementNo");
    const heroPanel    = document.querySelector('[data-panel="hero"]');
    const panels       = gsap.utils.toArray(".at-panel:not(.at-panel--hero)");

    /* Editorial milestones matching the 535-frame sequence */
    const cues = [
      [0.115, 0.205],
      [0.235, 0.355],
      [0.385, 0.535],
      [0.560, 0.635],
      [0.660, 0.765],
      [0.790, 0.905],
      [0.925, 0.995]
    ];
    const FADE = 0.035;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "#atScene",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        pin: "#atSticky",
        pinSpacing: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (progressFill) progressFill.style.width = (p * 100).toFixed(2) + "%";
          
          let no = 0;
          for (let i = 0; i < cues.length; i++) {
            if (p >= cues[i][0] - FADE) no = i + 1;
          }
          if (movementNo) movementNo.textContent = String(no).padStart(2, "0");
        }
      }
    });

    // 1 — the frame scrubber (drives the canvas across the whole scroll)
    tl.to(state, {
      frame: FRAME_COUNT - 1,
      duration: 1,
      ease: "none",
      onUpdate: render
    }, 0);

    // Hero title dissolves smoothly in center as scrolling begins (no upward shooting)
    if (heroPanel) {
      gsap.set(heroPanel, { autoAlpha: 1, xPercent: -50, yPercent: -50 });
      tl.to(heroPanel, { autoAlpha: 0, scale: 0.96, duration: 0.04, ease: "power1.out" }, 0.002);
    }

    // Editorial panels fade in / out across their milestone ranges
    panels.forEach((panel, i) => {
      const [inAt, outAt] = cues[i];
      const fromX = panel.classList.contains("at-panel--right") ? 44 : -44;

      gsap.set(panel, { autoAlpha: 0, x: fromX, yPercent: -45 });
      tl.to(panel, { autoAlpha: 1, x: 0, yPercent: -45, duration: FADE, ease: "power2.out" }, inAt);
      tl.to(panel, { autoAlpha: 0, x: -fromX * 0.5, yPercent: -45, duration: FADE, ease: "power2.in" }, outAt);
    });

    ScrollTrigger.refresh();
  }

  /* ---------- Resize ------------------------------------------------ */
  let resizeRAF;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(sizeCanvas);
  });

  /* ---------- Header Switch (3D Scene vs Main Store) ---------------- */
  const urbnHeader = document.querySelector('.urbn-header');
  const atHeader = document.getElementById("atHeader");

  if (urbnHeader) {
    urbnHeader.classList.add('urbn-header-hidden');

    ScrollTrigger.create({
      trigger: "#mainContent",
      start: "top 80px",
      onEnter: () => {
        urbnHeader.classList.remove('urbn-header-hidden');
        urbnHeader.classList.add('urbn-header-revealed');
        if (atHeader) {
          atHeader.style.opacity = '0';
          atHeader.style.pointerEvents = 'none';
        }
      },
      onLeaveBack: () => {
        urbnHeader.classList.remove('urbn-header-revealed');
        urbnHeader.classList.add('urbn-header-hidden');
        if (atHeader) {
          atHeader.style.opacity = '1';
          atHeader.style.pointerEvents = 'auto';
        }
      }
    });
  }

  /* ---------- Header hide on scroll-down inside 3D scene ------------ */
  if (atHeader) {
    let lastY = 0;
    ScrollTrigger.create({
      trigger: "#atScene",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const y = self.scroll();
        if (y > 120 && y > lastY) atHeader.style.transform = "translateY(-140%)";
        else atHeader.style.transform = "translateY(0)";
        lastY = y;
      }
    });
  }

  // Kickoff
  preload(build);

})();
