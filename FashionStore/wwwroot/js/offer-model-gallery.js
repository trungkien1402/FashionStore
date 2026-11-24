(() => {
    const gallery = document.querySelector('.offer-model-gallery');
    const track = gallery?.querySelector('.offer-model-track');
    if (!track) return;
    const slideCount = track.children.length;
    if (slideCount < 2) return;
    // Duplicate boundary slides so the last-to-first transition keeps moving forward.
    for (const [slide, prepend] of [[track.lastElementChild, true], [track.firstElementChild, false]]) {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
        if (prepend) track.prepend(clone);
        else track.append(clone);
    }
    let animating = false;
    function jumpTo(index) {
        track.style.scrollSnapType = 'none';
        track.scrollLeft = index * track.clientWidth;
        requestAnimationFrame(() => { track.style.scrollSnapType = ''; });
    }
    function normalize() {
        if (animating || drag || touching || !track.clientWidth) return;
        const index = Math.round(track.scrollLeft / track.clientWidth);
        if (index === 0) jumpTo(slideCount);
        else if (index === slideCount + 1) jumpTo(1);
    }
    jumpTo(1);
    gallery.addEventListener('pointerdown', () => gallery.classList.add('is-pointer-focused'));
    gallery.addEventListener('keydown', () => gallery.classList.remove('is-pointer-focused'));
    let drag;
    let animation;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let autoTimer;
    let visible = false;
    let hovered = false;
    let touching = false;
    function scheduleAuto() {
        clearTimeout(autoTimer);
        if (!visible || document.hidden || hovered || touching || drag || animating || reducedMotion.matches
            || gallery.contains(document.activeElement) || track.children.length < 2) return;
        autoTimer = setTimeout(() => {
            const index = Math.round(track.scrollLeft / track.clientWidth);
            glide(index + 1, 1400);
        }, 3000);
    }
    function glide(index, milliseconds = 480) {
        clearTimeout(autoTimer);
        cancelAnimationFrame(animation);
        animating = true;
        const start = track.scrollLeft;
        const target = Math.max(0, Math.min(track.children.length - 1, index)) * track.clientWidth;
        const duration = reducedMotion.matches ? 0 : milliseconds;
        const began = performance.now();
        gallery.classList.add('is-gliding');
        function frame(now) {
            const progress = duration ? Math.min(1, (now - began) / duration) : 1;
            const eased = milliseconds > 480
                ? progress * progress * (3 - 2 * progress)
                : 1 - Math.pow(1 - progress, 4);
            track.scrollLeft = start + (target - start) * eased;
            if (progress < 1) animation = requestAnimationFrame(frame);
            else {
                animating = false;
                normalize();
                gallery.classList.remove('is-gliding');
                scheduleAuto();
            }
        }
        animation = requestAnimationFrame(frame);
    }
    function settle() {
        if (!drag) return;
        const delta = drag.x - drag.lastX;
        const width = track.clientWidth;
        const start = Math.round(drag.scroll / width);
        const index = Math.abs(delta) > Math.min(70, width * .15)
            ? start + Math.sign(delta) : start;
        drag = null;
        gallery.classList.remove('is-dragging');
        glide(index);
    }
    track.addEventListener('dragstart', event => event.preventDefault());
    gallery.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') { hovered = true; clearTimeout(autoTimer); }
    });
    gallery.addEventListener('pointerleave', () => { hovered = false; scheduleAuto(); });
    gallery.addEventListener('pointerdown', () => { touching = true; clearTimeout(autoTimer); });
    window.addEventListener('pointerup', () => { touching = false; scheduleAuto(); });
    window.addEventListener('pointercancel', () => { touching = false; scheduleAuto(); });
    gallery.addEventListener('focusin', () => clearTimeout(autoTimer));
    gallery.addEventListener('focusout', () => setTimeout(scheduleAuto, 0));
    track.addEventListener('scrollend', () => { normalize(); scheduleAuto(); });
    document.addEventListener('visibilitychange', scheduleAuto);
    reducedMotion.addEventListener('change', scheduleAuto);
    new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        scheduleAuto();
    }, { threshold: 0.25 }).observe(gallery);
    track.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        cancelAnimationFrame(animation);
        animating = false;
        gallery.classList.remove('is-gliding');
        drag = { x: event.clientX, lastX: event.clientX, scroll: track.scrollLeft };
        track.setPointerCapture(event.pointerId);
        gallery.classList.add('is-dragging');
    });
    track.addEventListener('pointermove', event => {
        if (!drag) return;
        drag.lastX = event.clientX;
        track.scrollLeft = drag.scroll + drag.x - event.clientX;
    });
    track.addEventListener('pointerup', settle);
    track.addEventListener('pointercancel', settle);
    track.addEventListener('lostpointercapture', settle);
    gallery.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const index = Math.round(track.scrollLeft / track.clientWidth) + (event.key === 'ArrowRight' ? 1 : -1);
        glide(index);
    });
})();
