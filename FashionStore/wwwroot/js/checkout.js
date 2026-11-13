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
    const province = document.getElementById("ProvinceCode");
    const ward = document.getElementById("WardCode");
    const addressStatus = document.getElementById("checkoutAddressStatus");
    const resetSelect = (select, label) => select.replaceChildren(new Option(label, ""));
    if (province && ward) {
        ward.disabled = true;
        fetch(province.dataset.addressUrl)
            .then(response => {
                if (!response.ok) throw new Error();
                return response.json();
            })
            .then(provinces => {
                function updateWards(selected = "") {
                    resetSelect(ward, "Chọn xã/phường");
                    const region = provinces.find(item => String(item.code) === province.value);
                    for (const item of region?.wards ?? []) ward.add(new Option(item.name, item.code));
                    ward.disabled = !region;
                    ward.value = selected;
                    if (ward.selectedIndex < 0) ward.selectedIndex = 0;
                }
                for (const item of provinces) province.add(new Option(item.name, item.code));
                province.value = province.dataset.selected;
                if (province.selectedIndex < 0) province.selectedIndex = 0;
                updateWards(ward.dataset.selected);
                province.addEventListener("change", () => updateWards());
            })
            .catch(() => {
                addressStatus.textContent = "Chưa tải được danh sách địa chỉ. Tải lại trang để thử lại.";
            });
    }

    const voucher = document.getElementById("VoucherCode");
    const apply = document.getElementById("applyCheckoutVoucher");
    if (voucher && apply) {
        const status = document.getElementById("checkoutVoucherStatus");
        const subtotal = document.getElementById("checkoutSubtotal");
        const total = document.getElementById("checkoutTotal");
        const discountRow = document.getElementById("checkoutDiscountRow");
        const discount = document.getElementById("checkoutDiscount");
        const initial = { subtotal: subtotal.textContent, total: total.textContent };
        const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
        let pending;
        function resetPreview() {
            pending?.abort();
            apply.disabled = false;
            discountRow.hidden = true;
            subtotal.textContent = initial.subtotal;
            total.textContent = initial.total;
            status.textContent = "";
        }

        async function preview() {
            resetPreview();
            const code = voucher.value.trim();
            if (!code) {
                status.textContent = "Nhập mã khuyến mãi.";
                return;
            }
            const request = new AbortController();
            pending = request;
            apply.disabled = true;
            status.textContent = "Đang kiểm tra mã…";
            const token = form.querySelector('input[name="__RequestVerificationToken"]').value;
            try {
                const response = await fetch(apply.dataset.url, {
                    method: "POST",
                    body: new URLSearchParams({ code, __RequestVerificationToken: token }),
                    signal: request.signal
                });
                if (response.redirected) throw new Error();
                if (!response.ok) {
                    const message = response.status === 400 ? await response.text() : "";
                    if (!request.signal.aborted)
                        status.textContent = message || "Chưa kiểm tra được mã. Vui lòng thử lại.";
                    return;
                }
                const quote = await response.json();
                if (request.signal.aborted) return;
                voucher.value = quote.code;
                subtotal.textContent = money.format(quote.subtotal);
                discount.textContent = `−${money.format(quote.discount)}`;
                total.textContent = money.format(quote.total);
                discountRow.hidden = false;
                status.textContent = `Đã áp dụng mã ${quote.code}.`;
            } catch {
                if (!request.signal.aborted) status.textContent = "Chưa kiểm tra được mã. Vui lòng thử lại.";
            } finally {
                if (pending === request) apply.disabled = false;
            }
        }

        voucher.addEventListener("input", resetPreview);
        apply.addEventListener("click", preview);
        const studio = document.getElementById("chooseStudioVoucher");
        studio?.addEventListener("click", () => {
            voucher.value = studio.dataset.code;
            preview();
        });
        if (voucher.value.trim()) preview();
    }
    updateLabel();
})();