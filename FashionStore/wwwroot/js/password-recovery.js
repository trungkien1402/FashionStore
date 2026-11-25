(() => {
    const form = document.querySelector('[data-otp-request]');
    const button = form?.querySelector('button[type="submit"]');
    document.addEventListener('submit', event => {
        if (event.target !== form || event.defaultPrevented || !form.checkValidity()) return;
        button.disabled = true;
        button.textContent = 'Đang gửi…';
        form.setAttribute('aria-busy', 'true');
    });
    window.addEventListener('pageshow', () => {
        if (!button) return;
        button.disabled = false;
        button.textContent = 'Gửi mã OTP';
        form.removeAttribute('aria-busy');
    });

    const status = document.querySelector('[data-otp-delivery]');
    if (!status) return;
    let tries = 0;
    async function refresh() {
        if (!status.isConnected) return;
        try {
            if (!document.hidden) {
                const response = await fetch(status.dataset.otpDelivery, {
                    credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) throw new Error('status');
                const data = await response.json();
                if (data.status === 'processed') {
                    status.textContent = '';
                    return;
                }
                if (data.status === 'failed') {
                    status.textContent = 'Chưa gửi được mã. Hãy thử yêu cầu lại sau 60 giây.';
                    return;
                }
                if (data.status === 'expired') {
                    status.textContent = 'Phiên xác nhận đã hết hạn. Hãy yêu cầu mã mới.';
                    return;
                }
            }
        } catch { /* Keep the OTP form available during temporary network interruptions. */ }
        if (++tries < 40) setTimeout(refresh, 1500);
        else status.textContent = 'Nếu chưa nhận được mã, hãy yêu cầu mã mới.';
    }
    refresh();
})();
