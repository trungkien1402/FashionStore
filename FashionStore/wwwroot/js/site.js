/**
 * URBNMIND – Vanilla JS Frontend Scripts
 * Clean, lightweight, zero jQuery/Bootstrap dependencies
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        syncHomeCategorySignatures();
        initializeCountdown();
        initializeCartDrawer();
        initializeAjaxAddToCart();
    });

    // 0. Đồng bộ nhãn chữ ký Danh Mục Nổi Bật (Title Case: Women, Girls, Men, Boy)
    function syncHomeCategorySignatures() {
        const catGrid = document.querySelector('.urbn-cat-grid');
        if (!catGrid) return;

        const pillMap = {
            'GIRLS': 'Girls',
            'MEN': 'Men',
            'WOMEN': 'Women',
            'BOY': 'Boy'
        };

        catGrid.querySelectorAll('.urbn-cat-card').forEach(card => {
            const pill = card.querySelector('.urbn-cat-pill');
            if (pill) {
                const raw = pill.textContent.trim().toUpperCase();
                if (pillMap[raw]) {
                    pill.textContent = pillMap[raw];
                }
            }
        });

        // Sắp xếp thứ tự chuẩn: Women, Girls, Men, Boy
        const cards = Array.from(catGrid.querySelectorAll('.urbn-cat-card'));
        const map = {};
        cards.forEach(c => {
            const title = (c.getAttribute('data-category-title') || c.getAttribute('asp-route-keyword') || c.querySelector('.urbn-cat-pill')?.textContent || '').toLowerCase();
            if (title.includes('women')) map['women'] = c;
            else if (title.includes('girls')) map['girls'] = c;
            else if (title.includes('men')) map['men'] = c;
            else if (title.includes('boy')) map['boy'] = c;
        });

        if (map['women'] && map['girls'] && map['men'] && map['boy']) {
            catGrid.appendChild(map['women']);
            catGrid.appendChild(map['girls']);
            catGrid.appendChild(map['men']);
            catGrid.appendChild(map['boy']);
        }
    }
    syncHomeCategorySignatures();

    // 1. Dynamic Countdown Timer (Act Fast! Offer Expires Soon)
    function initializeCountdown() {
        const daysEl = document.getElementById('cdDays');
        const hoursEl = document.getElementById('cdHours');
        const minsEl = document.getElementById('cdMins');
        const secsEl = document.getElementById('cdSecs');
        if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

        // Target: 190 days from now
        const targetDate = new Date(Date.now() + (190 * 24 * 3600 + 4 * 3600 + 38 * 60 + 13) * 1000);

        function update() {
            const now = new Date();
            const diff = targetDate - now;
            if (diff <= 0) return;

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            daysEl.textContent = String(d).padStart(2, '0');
            hoursEl.textContent = String(h).padStart(2, '0');
            minsEl.textContent = String(m).padStart(2, '0');
            secsEl.textContent = String(s).padStart(2, '0');
        }

        update();
        setInterval(update, 1000);
    }

    // 2. Slide-Over Mini-Cart Drawer (Đã chuyển sang HNMTCart Atelier đồng bộ)
    function initializeCartDrawer() {
        window.openFsCartDrawer = function() {
            if (window.HNMTCart && typeof window.HNMTCart.open === 'function') {
                window.HNMTCart.open();
            }
        };
        window.closeFsCartDrawer = function() {
            if (window.HNMTCart && typeof window.HNMTCart.close === 'function') {
                window.HNMTCart.close();
            }
        };
        window.refreshFsCart = function() {
            if (window.HNMTCart && typeof window.HNMTCart.syncBadges === 'function') {
                window.HNMTCart.syncBadges();
            }
        };
    }

    // Load Cart Data via AJAX
    async function loadMiniCartData() {
        const container = document.getElementById('fsCartItemsContainer');
        const freeshipBar = document.getElementById('fsFreeshipBar');
        const freeshipPercent = document.getElementById('fsFreeshipPercent');
        const freeshipText = document.getElementById('fsFreeshipText');
        const subtotalEl = document.getElementById('fsDrawerSubtotal');

        if (!container) return;

        try {
            const res = await fetch('/Cart/GetMiniCart');
            const data = await res.json();

            if (!data.success) throw new Error('Không thể tải giỏ hàng.');

            // Update badges
            document.querySelectorAll('.fs-cart-count').forEach(el => {
                el.textContent = data.totalQuantity;
                el.style.display = data.totalQuantity > 0 ? 'flex' : 'none';
            });

            // Update subtotal
            if (subtotalEl) subtotalEl.textContent = data.totalFormatted;

            // Update Freeship Meter
            if (freeshipBar && freeshipPercent && freeshipText) {
                freeshipBar.style.width = data.freeshipPercent + '%';
                freeshipPercent.textContent = data.freeshipPercent + '%';

                if (data.isFreeship) {
                    freeshipBar.style.background = '#10B981';
                    freeshipText.innerHTML = '<span style="color:#10B981;">&#10003; <strong>Chúc Mừng! Bạn Đã Được Miễn Phí Vận Chuyển!</strong></span>';
                } else {
                    freeshipBar.style.background = '#000000';
                    freeshipText.innerHTML = `<i class="bi bi-truck me-1"></i> Mua thêm <strong>${data.neededForFreeshipFormatted}</strong> để Free Ship`;
                }
            }

            // Render items
            if (!data.items || data.items.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 48px 0; color: #6B7280;">
                        <i class="bi bi-bag" style="font-size: 40px; display: block; margin-bottom: 12px; color: #9CA3AF;"></i>
                        <h4 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 6px;">Giỏ hàng của bạn đang trống</h4>
                        <p style="font-size: 13px; margin-bottom: 20px;">Khám phá ngay các mẫu streetwear mới nhất của HNMTSHOP.</p>
                        <a href="/Products" class="urbn-btn-drop" style="font-size: 13px; padding: 10px 24px; border-radius: 999px;" onclick="window.closeFsCartDrawer()">
                            Mua Sắm Ngay
                        </a>
                    </div>
                `;
                return;
            }

            let html = '';
            data.items.forEach(item => {
                const img = item.imageUrl || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400';
                html += `
                    <div class="fs-drawer-item">
                        <img src="${img}" alt="${item.name}" class="fs-drawer-item-img" />
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <h6 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #000;">${item.name}</h6>
                                <button type="button" style="background:none; border:none; color: #EF4444; cursor: pointer; padding: 0;" onclick="window.updateCartItemQuantity(${item.variantId}, -${item.quantity})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
                                Size: ${item.size} ${item.color ? ' | ' + item.color : ''}
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="fs-qty-control">
                                    <button type="button" class="fs-qty-btn" onclick="window.updateCartItemQuantity(${item.variantId}, -1)">&minus;</button>
                                    <span class="fs-qty-val">${item.quantity}</span>
                                    <button type="button" class="fs-qty-btn" onclick="window.updateCartItemQuantity(${item.variantId}, 1)">&plus;</button>
                                </div>
                                <span style="font-weight: 800; font-size: 14px; color: #000;">${item.lineTotalFormatted}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

        } catch (err) {
            container.innerHTML = '<div style="color: #EF4444; font-size: 13px; text-align: center; padding: 20px;">Could not load cart. Please try again.</div>';
        }
    }

    // Update Quantity via AJAX
    window.updateCartItemQuantity = async function (variantId, delta) {
        try {
            const res = await fetch('/Cart/UpdateAjax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantId: variantId, delta: delta })
            });
            const data = await res.json();
            if (data.success) {
                loadMiniCartData();
            } else {
                showFsToast(data.message || 'Cart update failed.', 'danger');
            }
        } catch (e) {
            showFsToast('Server connection failed.', 'danger');
        }
    };

    // 3. Instant Add-to-Cart
    function initializeAjaxAddToCart() {
        document.addEventListener('click', async function (e) {
            const btn = e.target.closest('.fs-add-cart');
            if (!btn) return;

            const productId = btn.getAttribute('data-product-id');
            if (!productId) return;

            const card = btn.closest('.fs-product-card');
            let selectedSize = 'M';
            if (card) {
                const activeSizeBtn = card.querySelector('.fs-size-pill.active');
                if (activeSizeBtn) {
                    selectedSize = activeSizeBtn.getAttribute('data-size');
                }
            }

            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = 'Đang thêm...';

            try {
                const response = await fetch('/Cart/AddAjax', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: parseInt(productId, 10),
                        size: selectedSize,
                        quantity: 1
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    btn.innerHTML = '&#10003; Đã Thêm!';
                    showFsToast(data.message || 'Đã thêm vào giỏ hàng!', 'success');

                    setTimeout(() => {
                        btn.innerHTML = originalContent;
                        btn.disabled = false;
                        if (window.openFsCartDrawer) {
                            window.openFsCartDrawer();
                        }
                    }, 400);
                } else {
                    throw new Error(data.message || 'Không thể thêm vào giỏ hàng.');
                }
            } catch (err) {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                showFsToast(err.message, 'danger');
            }
        });
    }

    // Toast Notification Helper (Pure Vanilla)
    window.showFsToast = function (message, type = 'info') {
        let toast = document.getElementById('urbnToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'urbnToast';
            toast.style.position = 'fixed';
            toast.style.bottom = '24px';
            toast.style.right = '24px';
            toast.style.background = '#000000';
            toast.style.color = '#FFFFFF';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '999px';
            toast.style.fontSize = '14px';
            toast.style.fontWeight = '600';
            toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            toast.style.zIndex = '9999';
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 3000);
    };


})();
