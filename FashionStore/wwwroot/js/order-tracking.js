(() => {
    const panel = document.querySelector("[data-order-tracking]");
    if (!panel) return;

    const status = panel.querySelector("[data-tracking-status]");
    const map = panel.querySelector("[data-tracking-map]");
    const time = panel.querySelector("[data-tracking-time]");
    const dateFormat = new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh"
    });
    const completed = new Set(["Delivered", "Returned"]);
    let stopped = false;
    let timer;
    let request;

    function clearLocation() {
        map.hidden = true;
        map.removeAttribute("href");
        time.textContent = "";
    }

    async function refresh() {
        request = new AbortController();
        try {
            const response = await fetch(panel.dataset.url, {
                cache: "no-store",
                headers: { Accept: "application/json" },
                signal: request.signal
            });
            if (!response.ok || response.redirected) {
                clearLocation();
                status.textContent = "Không thể tải vị trí giao hàng.";
                stopped = response.status === 404 || response.status === 401 || response.status === 403 || response.redirected;
                return;
            }
            const tracking = await response.json();
            if (!tracking.isTracking || !tracking.location) {
                clearLocation();
                status.textContent = tracking.isTracking
                    ? "Đang chờ Shipper gửi vị trí GPS."
                    : "Vị trí GPS được hiển thị khi vận đơn đang giao.";
                stopped = completed.has(tracking.status);
                return;
            }
            const { latitude, longitude, recordedAt } = tracking.location;
            const url = new URL("https://www.google.com/maps/search/");
            url.searchParams.set("api", "1");
            url.searchParams.set("query", `${latitude},${longitude}`);
            map.href = url.href;
            map.hidden = false;
            status.textContent = "Vị trí gần nhất do Shipper gửi";
            time.textContent = `Cập nhật lúc ${dateFormat.format(new Date(recordedAt))} (giờ Việt Nam)`;
        } catch (error) {
            if (error.name === "AbortError") return;
            clearLocation();
            status.textContent = "Tạm thời không tải được vị trí. Hệ thống sẽ thử lại.";
        } finally {
            if (!stopped) timer = setTimeout(refresh, 15000);
        }
    }

    window.addEventListener("pagehide", () => {
        stopped = true;
        clearTimeout(timer);
        request?.abort();
    });
    window.addEventListener("pageshow", event => {
        if (event.persisted) {
            stopped = false;
            refresh();
        }
    });
    refresh();
})();
