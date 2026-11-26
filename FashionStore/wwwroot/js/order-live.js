(() => {
    const root = document.querySelector("[data-order-live]");
    if (!root) return;
    let running = false;
    let stopped = false;
    let timer;

    function sync(selector, freshRoot) {
        const current = root.querySelector(selector);
        const fresh = freshRoot.querySelector(selector);
        if (!current || !fresh || current.innerHTML === fresh.innerHTML) return;
        // Keep the existing map and its GPS connection while updating the surrounding status.
        const map = current.querySelector("[data-order-tracking]");
        const target = fresh.querySelector("[data-order-tracking]");
        if (map && target) target.replaceWith(map);
        current.replaceWith(fresh);
    }

    async function refresh() {
        if (running || document.hidden || stopped) return;
        running = true;
        try {
            const response = await fetch(location.href, { cache: "no-store", headers: { "X-Requested-With": "XMLHttpRequest" } });
            if (response.redirected || [401, 403].includes(response.status)) {
                stopped = true;
                return;
            }
            if (!response.ok) return;
            const documentCopy = new DOMParser().parseFromString(await response.text(), "text/html");
            const fresh = documentCopy.querySelector("[data-order-live]");
            if (!fresh) return;
            if (root.classList.contains("hnmt-order-details-page")) {
                const returnCard = root.querySelector(".hnmt-return-card");
                const nextReturnCard = fresh.querySelector(".hnmt-return-card");
                if (!returnCard && nextReturnCard)
                    root.querySelector(".hnmt-invoice-panel")?.before(nextReturnCard);
                else if (returnCard && !nextReturnCard) returnCard.remove();
                for (const selector of [".hnmt-header-status-col", ".hnmt-stepper-section", ".hnmt-invoice-panel"])
                    sync(selector, fresh);
            } else {
                const cards = [...fresh.querySelectorAll(".hnmt-order-card")];
                for (const card of root.querySelectorAll(".hnmt-order-card")) {
                    const code = card.querySelector(".hnmt-order-code")?.textContent;
                    const next = cards.find(candidate => candidate.querySelector(".hnmt-order-code")?.textContent === code);
                    if (!next) continue;
                    card.dataset.group = next.dataset.group;
                    for (const selector of [".hnmt-status-badge", ".hnmt-order-method", ".hnmt-header-right"]) {
                        const old = card.querySelector(selector);
                        const updated = next.querySelector(selector);
                        if (old && updated && old.innerHTML !== updated.innerHTML) old.replaceWith(updated);
                    }
                }
                document.getElementById("hnmtOrderStatusSelect")?.dispatchEvent(new Event("change"));
            }
        } catch {
            // The next scheduled refresh retries when the connection returns.
        } finally {
            running = false;
        }
    }

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pagehide", () => { stopped = true; clearInterval(timer); });
    window.addEventListener("pageshow", event => {
        if (event.persisted) { stopped = false; timer = setInterval(refresh, 8000); refresh(); }
    });
    timer = setInterval(refresh, 8000);
})();
