/**
 * Admin/Staff Realtime Presence Tracker
 * - Theo dõi thao tác: lăn chuột (wheel, scroll), di chuột thực sự (mousemove > 5px), gõ phím (keydown), click, touch
 * - Nếu không có thao tác trong 20s HOẶC đang không bật tab (tab bị ẩn): chuyển ngay sang Vắng mặt
 * - Chỉ khi có thao tác thực tế trở lại: chuyển ngay về Đang hoạt động
 */
(function () {
    const root = document.querySelector('[data-admin-presence-tracker]') || document.body;
    const heartbeatUrl = root.dataset.heartbeatUrl || '/SupportChat/Heartbeat';
    const awayUrl = root.dataset.awayUrl || '/SupportChat/AdminAway';

    const INACTIVITY_LIMIT_MS = 20000; // 20 giây
    let lastInteractionTime = Date.now();
    let isCurrentlyActive = true;
    let lastMouseX = null;
    let lastMouseY = null;

    function sendHeartbeat() {
        if (document.hidden) return;
        fetch(heartbeatUrl, { method: 'POST', cache: 'no-store' }).catch(function () {});
    }

    function sendAway() {
        if (!isCurrentlyActive) return;
        isCurrentlyActive = false;
        if (navigator.sendBeacon) {
            navigator.sendBeacon(awayUrl);
        } else {
            fetch(awayUrl, { method: 'POST', cache: 'no-store' }).catch(function () {});
        }
    }

    function recordInteraction() {
        lastInteractionTime = Date.now();
        // Nếu trước đó đang vắng mặt và hiện tab đang hiển thị -> kích hoạt lại ngay
        if (!isCurrentlyActive && !document.hidden) {
            isCurrentlyActive = true;
            sendHeartbeat();
        }
    }

    // 1. Lắng nghe lăn chuột (wheel, scroll)
    window.addEventListener('wheel', recordInteraction, { passive: true });
    window.addEventListener('scroll', recordInteraction, { passive: true });

    // 2. Lắng nghe click, chạm, gõ phím
    window.addEventListener('click', recordInteraction, { passive: true });
    window.addEventListener('touchstart', recordInteraction, { passive: true });
    window.addEventListener('keydown', recordInteraction, { passive: true });

    // 3. Lắng nghe di chuột (chỉ ghi nhận khi chuột di chuyển thực sự > 5px để tránh rung cảm biến)
    window.addEventListener('mousemove', function (e) {
        if (lastMouseX !== null && lastMouseY !== null) {
            const dx = Math.abs(e.clientX - lastMouseX);
            const dy = Math.abs(e.clientY - lastMouseY);
            if (dx < 5 && dy < 5) return;
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        recordInteraction();
    }, { passive: true });

    // Kiểm tra định kỳ mỗi 1 giây:
    // Nếu quá 20s không thao tác hoặc tab bị ẩn -> chuyển sang Vắng mặt
    setInterval(function () {
        const now = Date.now();
        const idleTime = now - lastInteractionTime;
        const isTabHidden = document.hidden;

        if (idleTime >= INACTIVITY_LIMIT_MS || isTabHidden) {
            if (isCurrentlyActive) {
                sendAway();
            }
        }
    }, 1000);

    // Gửi heartbeat duy trì mỗi 8s KHI VÀ CHỈ KHI admin đang hoạt động tích cực
    setInterval(function () {
        if (isCurrentlyActive && !document.hidden && (Date.now() - lastInteractionTime < INACTIVITY_LIMIT_MS)) {
            sendHeartbeat();
        }
    }, 8000);

    // Khi ẩn tab (chuyển sang tab khác hoặc thu nhỏ trình duyệt) -> chuyển ngay sang Vắng mặt
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            sendAway();
        } else {
            // Khi quay lại tab, ghi nhận tương tác nếu người dùng kích hoạt tab
            recordInteraction();
        }
    });

    window.addEventListener('beforeunload', function () {
        sendAway();
    });

    // Kích hoạt ban đầu
    sendHeartbeat();
})();
