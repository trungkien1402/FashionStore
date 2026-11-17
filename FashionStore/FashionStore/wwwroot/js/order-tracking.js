(() => {
    const panel = document.querySelector("[data-order-tracking]");
    if (!panel) return;

    const statusEl = panel.querySelector("[data-tracking-status]");
    const mapBtn = panel.querySelector("[data-tracking-map]");
    const timeEl = panel.querySelector("[data-tracking-time]");
    const mapContainer = document.getElementById("hnmt-order-map");
    const waitingOverlay = document.getElementById("hnmt-map-waiting");

    const dateFormat = new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh"
    });
    const completedStatuses = new Set(["Delivered", "Returned", "Cancelled", "DeliveryFailed"]);
    let stopped = false;
    let timer = null;
    let request = null;
    let leafletMap = null;
    let shipperMarker = null;

    function renderMap(lat, lng) {
        if (!mapContainer) return;

        // Nếu Leaflet đã load
        if (typeof L !== "undefined") {
            if (!leafletMap) {
                leafletMap = L.map(mapContainer, {
                    zoomControl: true,
                    scrollWheelZoom: false
                }).setView([lat, lng], 15);

                L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
                }).addTo(leafletMap);

                setTimeout(() => {
                    leafletMap.invalidateSize();
                }, 300);
            } else {
                leafletMap.setView([lat, lng], leafletMap.getZoom() || 15);
            }

            const shipperIcon = L.divIcon({
                className: "hnmt-leaflet-custom-marker",
                html: '<div class="hnmt-shipper-pin"><div class="hnmt-pulse-effect"></div><span class="hnmt-pin-emoji">🛵</span></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            });

            if (!shipperMarker) {
                shipperMarker = L.marker([lat, lng], { icon: shipperIcon }).addTo(leafletMap);
                shipperMarker.bindPopup("<b>Shipper đang ở đây</b><br><small>Đang di chuyển giao kiện hàng</small>").openPopup();
            } else {
                shipperMarker.setLatLng([lat, lng]);
            }

            if (waitingOverlay) waitingOverlay.style.display = "none";
        }
    }

    function clearLocation() {
        if (mapBtn) {
            mapBtn.hidden = true;
            mapBtn.removeAttribute("href");
        }
        if (timeEl) timeEl.textContent = "";
        if (waitingOverlay) waitingOverlay.style.display = "flex";
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
                if (statusEl) statusEl.textContent = "Không thể tải vị trí giao hàng.";
                stopped = response.status === 404 || response.status === 401 || response.status === 403 || response.redirected;
                return;
            }

            const tracking = await response.json();
            if (!tracking.isTracking || !tracking.location) {
                clearLocation();
                if (statusEl) {
                    statusEl.textContent = tracking.isTracking
                        ? "Đang chờ Shipper gửi tín hiệu GPS trực tiếp."
                        : "Vị trí GPS hiển thị khi đơn hàng đang giao.";
                }
                stopped = completedStatuses.has(tracking.status);
                return;
            }

            const { latitude, longitude, recordedAt } = tracking.location;
            const url = new URL("https://www.google.com/maps/search/");
            url.searchParams.set("api", "1");
            url.searchParams.set("query", `${latitude},${longitude}`);

            if (mapBtn) {
                mapBtn.href = url.href;
                mapBtn.hidden = false;
            }

            if (statusEl) statusEl.textContent = "Vị trí Shipper cập nhật trực tiếp";
            if (timeEl) {
                const dateObj = new Date(recordedAt);
                timeEl.textContent = `Cập nhật: ${dateFormat.format(dateObj)}`;
            }

            renderMap(latitude, longitude);

        } catch (error) {
            if (error.name === "AbortError") return;
            clearLocation();
            if (statusEl) statusEl.textContent = "Tạm thời không kết nối được vị trí. Đang thử lại...";
        } finally {
            if (!stopped) {
                timer = setTimeout(refresh, 10000);
            }
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
