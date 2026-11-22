// Refresh server-rendered operational screens using their existing authorization and filters.
(() => {
    let content = document.querySelector('[data-admin-live-content]');
    const status = document.querySelector('[data-admin-live-status]');
    if (!content || !status) return;
    let busy = false;
    let dirty = false;
    let submitting = false;
    let failures = 0;
    let timer;

    document.addEventListener('input', event => {
        if (content.contains(event.target)) dirty = true;
    });
    document.addEventListener('change', event => {
        if (content.contains(event.target)) dirty = true;
    });
    document.addEventListener('submit', event => {
        if (content.contains(event.target)) submitting = true;
    });
    document.addEventListener('reset', event => {
        if (content.contains(event.target)) dirty = false;
    });

    // Anti-forgery tokens are newly generated on GET; exclude them from change detection.
    function signature(element) {
        const clone = element.cloneNode(true);
        clone.querySelectorAll('input[name="__RequestVerificationToken"]').forEach(input => input.remove());
        clone.querySelectorAll('.alert-dismissible').forEach(alert => alert.remove());
        return clone.innerHTML;
    }

    async function refresh() {
        clearTimeout(timer);
        if (busy || submitting) return;
        try {
            if (document.hidden || !navigator.onLine) return;
            if (dirty || content.contains(document.activeElement)
                || document.querySelector('.modal.show, .dropdown-menu.show')
                || (window.getSelection()?.toString() ?? '').length) {
                status.textContent = 'Tạm dừng khi thao tác';
                return;
            }
            busy = true;
            const response = await fetch(location.href, {
                credentials: 'same-origin', cache: 'no-store',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                signal: AbortSignal.timeout(12000)
            });
            if (response.status === 401 || response.status === 403 || response.redirected) {
                submitting = true;
                status.textContent = 'Phiên làm việc đã hết hạn';
                return;
            }
            if (!response.ok) throw new Error('refresh');
            const page = new DOMParser().parseFromString(await response.text(), 'text/html');
            const next = page.querySelector('[data-admin-live-content]');
            if (!next) throw new Error('content');
            // Recheck after the request: the user may have started editing while it ran.
            if (dirty || submitting || content.contains(document.activeElement)) return;
            if (signature(content) !== signature(next)) {
                const scroll = { x: window.scrollX, y: window.scrollY };
                content.replaceWith(next);
                content = next;
                window.scrollTo(scroll.x, scroll.y);
            }
            failures = 0;
            status.textContent = 'Trực tiếp';
        } catch {
            failures++;
            status.textContent = 'Đang kết nối lại';
        } finally {
            busy = false;
            if (!submitting) timer = setTimeout(refresh, Math.min(30000, 4000 * (1 + failures)));
        }
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    window.addEventListener('online', refresh);
    timer = setTimeout(refresh, 5000);
})();
