(() => {
    "use strict";
    const page = document.getElementById("paymentPage");
    if (!page) return;
    const button = document.getElementById("btnReportTransfer");
    const statusText = document.getElementById("pollingStatusText");
    const spinner = document.getElementById("pollingSpinner");
    let stopped = page.dataset.canPay !== "true";
    let reported = page.dataset.reported === "true";
    let timer;
    let checking = false;
    let reporting = false;

    function announce(message) {
        if (statusText && statusText.textContent !== message) statusText.textContent = message;
    }

    function feedback(message, success = false) {
        const target = document.getElementById("reportFeedback");
        if (!target) return;
        target.className = `alert alert-${success ? "success" : "danger"} py-2 px-3 small mb-3`;
        target.textContent = message;
    }

    function syncReportButton() {
        if (!button) return;
        button.disabled = stopped || reported || reporting;
        button.textContent = reporting ? "Đang gửi thông báo…" :
            (reported ? "Đã gửi thông báo chuyển khoản" : "Tôi đã chuyển khoản");
        button.classList.toggle("btn-secondary", reported);
        button.classList.toggle("btn-dark", !reported);
    }

    function closePayment(message) {
        stopped = true;
        clearTimeout(timer);
        const controls = document.getElementById("paymentControlsContainer");
        if (controls) controls.classList.add("d-none");
        document.getElementById("paymentClosed")?.classList.remove("d-none");
        const text = document.getElementById("paymentClosedText");
        if (text) text.textContent = message;
        syncReportButton();
    }

    async function readJson(response) {
        if (response.redirected) {
            // Existing cookie authentication redirects expired sessions to Login.
            window.location.assign(response.url);
            throw new Error("Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.");
        }
        if (!response.ok || !(response.headers.get("content-type") || "").includes("application/json"))
            throw new Error("Không kết nối được với cửa hàng. Trạng thái thanh toán chưa được cập nhật.");
        return response.json();
    }

    async function checkStatus() {
        if (stopped || checking) return;
        checking = true;
        clearTimeout(timer);
        try {
            const response = await fetch(page.dataset.statusUrl, {
                credentials: "same-origin", cache: "no-store", signal: AbortSignal.timeout(12000)
            });
            if (response.status === 404 || response.status === 403) {
                closePayment("Không thể truy cập đơn hàng. Vui lòng quay lại chi tiết đơn hàng.");
                return;
            }
            const data = await readJson(response);
            // Order eligibility takes precedence, even when the payment is still Pending.
            if (["Cancelled", "Returned", "DeliveryFailed"].includes(data.orderStatus)) {
                closePayment("Đơn hàng không còn nhận thanh toán. Vui lòng không chuyển tiền. Nếu đã chuyển, hãy giữ biên lai và liên hệ cửa hàng để đối soát.");
                return;
            }
            if (data.isPaid || data.paymentStatus === "Paid") {
                closePayment("Cửa hàng đã xác nhận thanh toán. Đang mở kết quả đơn hàng…");
                window.location.assign(page.dataset.successUrl);
                return;
            }
            if (data.paymentStatus !== "Pending") {
                closePayment("Đơn hàng không còn trong trạng thái chờ thanh toán. Vui lòng xem chi tiết đơn hàng.");
                return;
            }
            reported = reported || data.transferReported === true;
            syncReportButton();
            announce(reported
                ? "Đã gửi thông báo chuyển khoản. Đang chờ cửa hàng xác nhận. Không chuyển tiền lần nữa."
                : "Cửa hàng sẽ xác nhận sau khi kiểm tra chuyển khoản.");
            spinner?.classList.remove("d-none");
        } catch (error) {
            announce("Mất kết nối cập nhật trạng thái. Đang thử lại; nếu đã chuyển khoản, không chuyển tiền lần nữa.");
            spinner?.classList.add("d-none");
        } finally {
            checking = false;
            if (!stopped) timer = setTimeout(checkStatus, 5000);
        }
    }

    const qr = document.getElementById("qrImageElement");
    const qrFailed = () => {
        qr?.classList.add("d-none");
        document.getElementById("qrLoadError")?.classList.remove("d-none");
    };
    qr?.addEventListener("error", qrFailed);
    qr?.addEventListener("load", () => {
        qr.classList.remove("d-none");
        document.getElementById("qrLoadError")?.classList.add("d-none");
    });
    document.getElementById("retryQr")?.addEventListener("click", () => {
        // Reload the same server-provided payment image, preserving its payload.
        if (qr) qr.src = qr.src;
    });
    if (qr?.complete && qr.naturalWidth === 0) qrFailed();

    page.querySelectorAll("[data-copy]").forEach(copyButton => {
        copyButton.addEventListener("click", async () => {
            const text = copyButton.dataset.copy;
            if (!text) return;
            const originalText = copyButton.textContent;
            copyButton.disabled = true;
            try {
                if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
                await navigator.clipboard.writeText(text);
                copyButton.textContent = "Đã chép!";
                // Preserve the original visual style for every copy button.
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.disabled = false;
                }, 1500);
            } catch {
                feedback("Không thể sao chép tự động. Vui lòng chọn và sao chép thông tin chuyển khoản bằng tay.");
                copyButton.disabled = false;
            }
        });
    });

    button?.addEventListener("click", async () => {
        if (stopped || reported || button.disabled) return;
        reporting = true;
        syncReportButton();
        const form = document.getElementById("reportTransferForm");
        try {
            const response = await fetch(form.action, {
                method: "POST", credentials: "same-origin",
                body: new URLSearchParams(new FormData(form)), signal: AbortSignal.timeout(12000)
            });
            if (response.status === 409) {
                feedback("Đơn hàng vừa thay đổi, đang kiểm tra lại trạng thái.");
                await checkStatus();
                return;
            }
            const data = await readJson(response);
            if (!data.success) throw new Error(data.message || "Chưa gửi được thông báo. Vui lòng thử lại.");
            reported = true;
            // Completing the customer's step is independent of staff confirming Paid.
            stopped = true;
            clearTimeout(timer);
            syncReportButton();
            window.location.assign(page.dataset.successUrl);
        } catch (error) {
            feedback(error.message || "Lỗi kết nối. Vui lòng thử lại; không cần chuyển tiền lần nữa.");
        } finally {
            reporting = false;
            syncReportButton();
        }
    });

    syncReportButton();
    if (!stopped) checkStatus();
    window.addEventListener("pagehide", () => { stopped = true; clearTimeout(timer); });
    window.addEventListener("pageshow", event => {
        if (event.persisted) window.location.reload();
    });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && !stopped) checkStatus();
    });
})();
