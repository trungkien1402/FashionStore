(() => {
    const bubble = document.querySelector("[data-style-game-float]");
    const link = bubble.querySelector(".style-game-launcher");
    const close = bubble.querySelector(".style-game-close");
    const dismissKey = "style-game-hidden-until";
    let timer;
    let drag;
    let suppressClick = false;
    const showAfter = Date.now() + 20_000;
    let hiddenUntil = 0;

    function move(left, top) {
        const inset = 10;
        const maxLeft = Math.max(inset, window.innerWidth - bubble.offsetWidth - inset);
        const maxTop = Math.max(inset, window.innerHeight - bubble.offsetHeight - inset);
        bubble.style.left = `${Math.min(maxLeft, Math.max(inset, left))}px`;
        bubble.style.top = `${Math.min(maxTop, Math.max(inset, top))}px`;
        bubble.style.right = "auto";
        bubble.style.bottom = "auto";
    }

    function fitViewport() {
        if (bubble.hidden || !bubble.style.left) return;
        const rect = bubble.getBoundingClientRect();
        move(rect.left, rect.top);
    }

    function updateVisibility() {
        clearTimeout(timer);
        const remaining = Math.max(showAfter, hiddenUntil) - Date.now();
        bubble.hidden = remaining > 0;
        if (bubble.hidden) timer = setTimeout(updateVisibility, remaining);
        else fitViewport();
    }

    close.addEventListener("click", () => {
        hiddenUntil = Date.now() + 60_000;
        try { sessionStorage.setItem(dismissKey, String(hiddenUntil)); } catch { }
        updateVisibility();
    });

    link.addEventListener("pointerdown", event => {
        if (event.button !== 0 || drag) return;
        const rect = bubble.getBoundingClientRect();
        suppressClick = false;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
        link.setPointerCapture(event.pointerId);
    });
    link.addEventListener("pointermove", event => {
        if (drag?.id !== event.pointerId) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!suppressClick && Math.hypot(dx, dy) < 6) return;
        suppressClick = true;
        move(drag.left + dx, drag.top + dy);
    });
    link.addEventListener("lostpointercapture", () => { drag = null; });
    link.addEventListener("click", event => {
        if (suppressClick && event.detail !== 0) event.preventDefault();
        suppressClick = false;
    });

    window.addEventListener("resize", fitViewport);
    try { hiddenUntil = Number(sessionStorage.getItem(dismissKey)) || 0; } catch { }
    updateVisibility();
})();
