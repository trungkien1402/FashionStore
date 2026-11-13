document.querySelectorAll("[data-notification-url]").forEach(bell => {
    const trigger = bell.querySelector("summary");
    const count = bell.querySelector(".fs-notification-count");
    const status = bell.querySelector(".fs-notification-status");
    const list = bell.querySelector(".fs-notification-list");
    const icons = new Map([
        ["order", "bag-check"], ["delivered", "check-circle"], ["shipping", "truck"],
        ["warning", "exclamation-circle"], ["support", "headset"], ["stock", "box-seam"],
        ["return", "arrow-return-left"]
    ]);
    const dates = new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh"
    });

    function icon(name, className) {
        const element = document.createElement("i");
        element.className = `bi bi-${name} ${className}`;
        element.setAttribute("aria-hidden", "true");
        return element;
    }

    const storageKey = `fs-notifications-seen:${bell.dataset.notificationUser}`;
    let seen = [];
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (Array.isArray(saved)) seen = saved;
    } catch {
        // The bell can still mark items as seen for the current page.
    }
    let current = [];
    let loading = false;

    function updateCount() {
        const unread = current.filter(key => !seen.includes(key)).length;
        count.textContent = String(unread);
        count.hidden = unread === 0;
        trigger.setAttribute("aria-label", unread ? `Thông báo (${unread} mục mới)` : "Thông báo");
    }

    function markSeen() {
        seen = [...new Set([...current, ...seen])].slice(0, 100);
        try {
            localStorage.setItem(storageKey, JSON.stringify(seen));
        } catch {
            // Keep the in-memory state when storage is unavailable.
        }
        updateCount();
    }

    async function refresh() {
        if (loading) return;
        loading = true;
        try {
            const response = await fetch(bell.dataset.notificationUrl, {
                cache: "no-store", headers: { Accept: "application/json" }
            });
            if (!response.ok || response.redirected) throw new Error();
            const items = await response.json();
            const links = items.map(item => {
                const link = document.createElement("a");
                const kind = icons.has(item.kind) ? item.kind : "order";
                const copy = document.createElement("span");
                const title = document.createElement("strong");
                link.href = item.url;
                link.dataset.kind = kind;
                copy.className = "fs-notification-copy";
                title.textContent = item.title;
                copy.append(title);
                if (item.detail) {
                    const detail = document.createElement("small");
                    detail.textContent = item.detail;
                    copy.append(detail);
                }
                if (item.updatedAt) {
                    const time = document.createElement("time");
                    time.dateTime = item.updatedAt;
                    time.textContent = dates.format(new Date(item.updatedAt));
                    copy.append(time);
                }
                link.append(icon(icons.get(kind), "fs-notification-icon"), copy,
                    icon("chevron-right", "fs-notification-arrow"));
                return link;
            });
            list.replaceChildren(...links);
            current = items.map(item => JSON.stringify([item.url, item.title, item.detail, item.updatedAt]));
            if (bell.open) markSeen();
            else updateCount();
            status.textContent = items.length ? "" : "Chưa có thông báo.";
            status.hidden = items.length > 0;
        } catch {
            status.hidden = false;
            status.textContent = "Tạm thời không tải được thông báo.";
        } finally {
            loading = false;
        }
    }

    bell.addEventListener("toggle", () => {
        if (!bell.open) return;
        markSeen();
        bell.style.setProperty("--notification-top", `${trigger.getBoundingClientRect().bottom + 10}px`);
        refresh();
    });
    bell.addEventListener("keydown", event => {
        if (event.key === "Escape" && bell.open) {
            bell.open = false;
            trigger.focus();
        }
    });
    document.addEventListener("pointerdown", event => {
        if (bell.open && !bell.contains(event.target)) bell.open = false;
    });
    refresh();
});
