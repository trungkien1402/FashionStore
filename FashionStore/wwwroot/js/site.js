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

    // =========================================================================
    // HNMT ATELIER — "TRY THE LOOK" LOOKBOOK INITIALIZER & CARD REPLACER
    // =========================================================================
    function initSeasonalLookbook() {
        // Ensure CSS is loaded
        if (!document.querySelector('link[href*="lookbook.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/lookbook.css?v=atelier_v1';
            document.head.appendChild(link);
        }

        // Hydrate seasonal section cards on Home page
        const seasonHeading = document.querySelector('.urbn-seasonal-section .urbn-center-heading');
        if (seasonHeading) {
            const p = seasonHeading.querySelector('p');
            if (p) p.textContent = 'Trải nghiệm phối đồ Head-to-Toe trong không gian Studio độc bản — Đậm chất avant-garde và tinh thần đường phố';
        }

        const cards = document.querySelectorAll('.urbn-seasonal-section .urbn-rack-card');
        if (cards && cards.length >= 2) {
            // Card 1: Nightfall Metropolis
            const card1 = cards[0];
            card1.setAttribute('href', '#lookbook-nightfall');
            card1.setAttribute('data-open-lookbook', 'nightfall');
            const img1 = card1.querySelector('img');
            if (img1) {
                img1.src = '/images/lookbook/look-nightfall-1.jpg';
                img1.alt = 'NIGHTFALL METROPOLIS';
                img1.style.objectFit = 'cover';
                img1.style.objectPosition = 'center top';
            }
            const pill1 = card1.querySelector('.urbn-cat-pill');
            if (pill1) pill1.innerHTML = 'NIGHTFALL METROPOLIS &bull; ĐÊM ĐÔ THỊ';

            // Card 2: Raw Earth & Dust
            const card2 = cards[1];
            card2.setAttribute('href', '#lookbook-rawearth');
            card2.setAttribute('data-open-lookbook', 'rawearth');
            const img2 = card2.querySelector('img');
            if (img2) {
                img2.src = '/images/lookbook/look-rawearth-1.jpg';
                img2.alt = 'RAW EARTH & DUST';
                img2.style.objectFit = 'cover';
                img2.style.objectPosition = 'center top';
            }
            const pill2 = card2.querySelector('.urbn-cat-pill');
            if (pill2) pill2.innerHTML = 'RAW EARTH & DUST &bull; DENIM THÔ & VINTAGE';

            // Click listener
            card1.onclick = function (e) {
                e.preventDefault();
                if (window.HNMTLookbook) window.HNMTLookbook.open('nightfall');
            };
            card2.onclick = function (e) {
                e.preventDefault();
                if (window.HNMTLookbook) window.HNMTLookbook.open('rawearth');
            };
        }

        // Ensure lookbook DOM markup exists
        if (!document.getElementById('lookbookRoot')) {
            const root = document.createElement('div');
            root.id = 'lookbookRoot';
            root.className = 'lb-wrapper theme-nightfall';
            root.innerHTML = `
                <header class="lb-topbar">
                    <div class="lb-top-left">
                        <a href="/" class="lb-back-btn">
                            <i class="bi bi-arrow-left"></i>
                            <span>Quay lại</span>
                        </a>
                        <div class="lb-brand-title">
                            <span>HNMT ATELIER</span>
                            <span class="lb-brand-badge">TRY THE LOOK</span>
                        </div>
                    </div>
                    <div class="lb-theme-switcher">
                        <button type="button" class="lb-theme-tab active" data-theme="nightfall">
                            <span>🌌 NIGHTFALL METROPOLIS</span>
                        </button>
                        <button type="button" class="lb-theme-tab" data-theme="rawearth">
                            <span>🏜️ RAW EARTH & DUST</span>
                        </button>
                    </div>
                    <div class="lb-top-right">
                        <button type="button" class="lb-cart-btn" id="lbCartBtn" title="Xem túi đồ">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <span class="lb-cart-count" id="lbCartCount">0</span>
                        </button>
                    </div>
                </header>
                <main class="lb-main">
                    <div class="lb-stage-viewport">
                        <div class="lb-stage-floor"></div>
                        <div class="lb-runway-track" id="lbRunwayTrack"></div>
                        <div class="lb-bottom-bar">
                            <button type="button" class="lb-nav-btn" id="lbPrevBtn" title="Outfit trước">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <div class="lb-look-pills" id="lbLookPills"></div>
                            <button type="button" class="lb-nav-btn" id="lbNextBtn" title="Outfit tiếp theo">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <aside class="lb-sidebar">
                        <div class="lb-sidebar-header">
                            <div class="lb-sidebar-sub">In This Look &bull; Phối Đồ Head-to-Toe</div>
                            <div class="lb-sidebar-title-row">
                                <h3 class="lb-sidebar-title" id="lbSidebarTitle">LOOK 01</h3>
                                <span class="lb-items-count-badge">3 sản phẩm</span>
                            </div>
                        </div>
                        <div class="lb-items-list" id="lbItemsList"></div>
                        <div class="lb-sidebar-footer">
                            <div class="lb-total-row">
                                <span class="lb-total-label">Tổng cả bộ outfit:</span>
                                <span class="lb-total-price" id="lbTotalPrice">0 ₫</span>
                            </div>
                            <button type="button" class="lb-add-full-btn" id="lbAddFullLookBtn">
                                <span>Thêm Trọn Bộ Vào Túi Đồ</span>
                                <i class="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </aside>
                </main>
            `;
            document.body.appendChild(root);
        }

        // Ensure lookbook.js is loaded
        if (!window.HNMTLookbook && !document.querySelector('script[src*="lookbook.js"]')) {
            const script = document.createElement('script');
            script.src = '/js/lookbook.js?v=atelier_v1';
            document.body.appendChild(script);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSeasonalLookbook);
    } else {
        initSeasonalLookbook();
    }

})();
