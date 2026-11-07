(() => {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    const button = document.getElementById('placeOrderButton');
    let sending = false;
    const updateLabel = () => {
        button.textContent = form.querySelector('input[name="PaymentMethod"]:checked')?.value === 'VietQR'
            ? 'Đặt hàng và xem mã QR' : 'Xác nhận đặt hàng';
    };
    form.querySelectorAll('input[name="PaymentMethod"]').forEach(input => input.addEventListener('change', updateLabel));
    form.addEventListener('submit', event => {
        const jqueryValid = !window.jQuery?.validator || window.jQuery(form).valid();
        if (!form.checkValidity() || !jqueryValid) { event.preventDefault(); return; }
        if (event.defaultPrevented) return;
        if (sending) { event.preventDefault(); return; }
        sending = true;
        button.disabled = true;
        button.textContent = 'Đang ghi nhận đơn hàng…';
    });
    window.addEventListener('pageshow', () => { sending = false; button.disabled = false; updateLabel(); });
    form.querySelectorAll('.pay-product img').forEach(img => {
        const fallback = () => { img.hidden = true; img.parentElement.textContent = 'F.'; };
        img.addEventListener('error', fallback);
        if (img.complete && img.naturalWidth === 0) fallback();
    });
    updateLabel();
})();