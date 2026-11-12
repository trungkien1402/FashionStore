/**
 * HNMT ATELIER - LUXURY SHOPPING BAG & MINI-CART DRAWER
 * Thiết kế giao diện Giỏ Hàng kính mờ Dark Glassmorphism chuẩn Fashion Runway
 * Đồng bộ 100% ngôn ngữ thiết kế với Bộ Lọc Sào Đồ (Floating Card, Typography, Capsule CTA).
 */
(function (window, document) {
    'use strict';

    const CART_STORAGE_KEY = 'hnmt_atelier_cart_v1';

    // Lấy dữ liệu giỏ hàng từ localStorage
    function loadLocalCart() {
        try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('[HNMTCart] Không thể đọc localStorage:', e);
        }
        return [];
    }

    // Lưu dữ liệu giỏ hàng vào localStorage
    function saveLocalCart(items) {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.warn('[HNMTCart] Không thể lưu localStorage:', e);
        }
    }

    let cartItems = loadLocalCart();

    // Định dạng tiền tệ VNĐ
    function formatMoney(amount) {
        return (Number(amount) || 0).toLocaleString('vi-VN') + ' ₫';
    }

    // Tính tổng số lượng món
    function calculateTotalCount() {
        return cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }

    // Tính tổng tiền
    function calculateTotalPrice() {
        return cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
    }

    // Cập nhật tất cả các Badge số lượng trên toàn bộ giao diện web
    function syncAllBadges() {
        const count = calculateTotalCount();
        const countStr = String(count);

        // 1. Badge trên Sào Treo Đồ (#bagCount)
        const railCount = document.getElementById('bagCount');
        if (railCount) {
            railCount.textContent = countStr;
            railCount.classList.remove('bump');
            void railCount.offsetWidth;
            railCount.classList.add('bump');
        }

        // 2. Badge trên Sneaker Vault (#svBagBadge)
        const svBadge = document.getElementById('svBagBadge');
        if (svBadge) {
            svBadge.textContent = countStr;
            svBadge.style.transform = 'scale(1.35)';
            setTimeout(() => svBadge.style.transform = 'scale(1)', 240);
        }

        // 3. Badge trên _Layout Header (.fs-cart-count)
        document.querySelectorAll('.fs-cart-count').forEach(el => {
            el.textContent = countStr;
        });

        // 4. Badge trong Drawer Header
        const drawerCount = document.getElementById('hnmtCartDrawerCountBadge');
        if (drawerCount) {
            drawerCount.textContent = `${count} món`;
        }
    }

    // HTML Template của Giỏ Hàng Kính Mờ - Đồng bộ 100% với Bộ Lọc
    const DRAWER_HTML = `
        <div class="fashion-filter-backdrop" id="hnmtCartBackdrop"></div>
        <aside class="fashion-filter-sidebar hnmt-cart-sidebar-override" id="hnmtCartSidebar" role="dialog" aria-modal="true" aria-label="Túi đồ thời trang">
            <!-- 1. Header Tinh Giản Chuẩn Bộ Lọc -->
            <div class="fashion-sidebar-header">
                <div class="hnmt-cart-header-title-group">
                    <h2 class="fashion-filter-title">Giỏ Hàng</h2>
                    <span class="hnmt-cart-count-pill" id="hnmtCartDrawerCountBadge">0 món</span>
                </div>
                <button type="button" class="fashion-filter-close" id="hnmtCartCloseBtn" aria-label="Đóng giỏ hàng" title="Đóng (ESC)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- 2. Vùng danh sách sản phẩm (Scrollable) -->
            <div class="fashion-sidebar-scroll hnmt-cart-scroll-area">
                <div class="hnmt-cart-items-wrapper" id="hnmtCartItemsList">
                    <!-- Danh sách Cart Item Render bằng JavaScript -->
                </div>

                <!-- Trạng thái trống (Empty State) -->
                <div class="hnmt-cart-empty-view" id="hnmtCartEmptyView" style="display: none;">
                    <div class="hnmt-empty-icon-circle">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                    </div>
                    <h3 class="hnmt-empty-title">Túi đồ của bạn đang trống</h3>
                    <p class="hnmt-empty-desc">Chưa có sản phẩm nào được chọn. Hãy khám phá và chọn size từ các thiết kế độc bản của HNMT Atelier.</p>
                    <button type="button" class="hnmt-empty-btn" id="hnmtCartExploreBtn">
                        <span>Khám Phá Sào Đồ</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>

            <!-- 3. Footer Căn Giữa Đẹp Mắt Chuẩn Bộ Lọc -->
            <div class="fashion-sidebar-footer hnmt-cart-footer-box" id="hnmtCartFooter">
                <!-- Tóm tắt chi phí -->
                <div class="hnmt-cart-bill-card">
                    <div class="hnmt-bill-row">
                        <span>Tạm tính</span>
                        <strong id="hnmtCartSubtotal">0 ₫</strong>
                    </div>
                    <div class="hnmt-bill-row">
                        <span>Vận chuyển</span>
                        <strong id="hnmtCartShipFee">Miễn phí</strong>
                    </div>
                    <div class="hnmt-bill-separator"></div>
                    <div class="hnmt-bill-row hnmt-bill-total">
                        <span>Tổng thanh toán</span>
                        <strong class="hnmt-total-highlight" id="hnmtCartTotalAmount">0 ₫</strong>
                    </div>
                </div>

                <!-- Nút Thanh Toán Dạng Viên Thuốc Capsule Đen/Kính Đồng Bộ -->
                <button type="button" class="sv-apply-capsule-btn hnmt-checkout-capsule-btn" id="hnmtCartCheckoutBtn" title="Tiến hành đặt hàng">
                    <span class="apply-text">Thanh Toán</span>
                    <span class="capsule-badge" id="hnmtCartBtnBadge">0 ₫</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </aside>
    `;

    function ensureCartDOM() {
        let modal = document.getElementById('hnmtCartDrawerModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtCartDrawerModal';
            modal.className = 'hnmt-fashion-filter-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = DRAWER_HTML;
            document.body.appendChild(modal);
        }
        return modal;
    }

    // Render toàn bộ danh sách sản phẩm trong giỏ
    function renderCartItems() {
        const listEl = document.getElementById('hnmtCartItemsList');
        const emptyEl = document.getElementById('hnmtCartEmptyView');
        const footerEl = document.getElementById('hnmtCartFooter');
        if (!listEl) return;

        const count = calculateTotalCount();
        const total = calculateTotalPrice();

        if (count === 0) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'flex';
            if (footerEl) footerEl.style.display = 'none';
            syncAllBadges();
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';
        if (footerEl) footerEl.style.display = 'flex';

        // Render từng item
        listEl.innerHTML = '';
        cartItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'fashion-select-card hnmt-cart-card';
            card.setAttribute('data-id', item.id);

            const thumbImg = item.imageUrl || '/clothing-rail/assets/reach-shirt-front.webp';

            card.innerHTML = `
                <div class="hnmt-card-thumb-wrap">
                    <img src="${thumbImg}" alt="${item.name || 'Sản phẩm'}" class="hnmt-card-thumb-img" onerror="this.src='/clothing-rail/assets/reach-shirt-front.webp'">
                </div>
                <div class="hnmt-card-content">
                    <div class="hnmt-card-header-row">
                        <h4 class="hnmt-card-product-title" title="${item.name}">${item.name}</h4>
                        <button type="button" class="hnmt-card-del-btn" title="Xóa món này" aria-label="Xóa">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="hnmt-card-pill-row">
                        ${item.size ? `<span class="hnmt-pill-tag">Size ${item.size}</span>` : ''}
                        ${item.color ? `
                            <span class="hnmt-pill-tag hnmt-color-tag">
                                ${item.colorDot ? `<span class="hnmt-dot-indicator" style="background:${item.colorDot}"></span>` : ''}
                                <span>${item.color}</span>
                            </span>
                        ` : ''}
                    </div>

                    <div class="hnmt-card-bottom-row">
                        <span class="hnmt-card-price">${formatMoney(item.price)}</span>

                        <!-- Stepper Tăng Giảm Số Lượng -->
                        <div class="hnmt-item-stepper">
                            <button type="button" class="hnmt-step-btn hnmt-step-minus" aria-label="Giảm" title="Giảm">
                                ${item.quantity <= 1 ? `
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                ` : `
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                `}
                            </button>
                            <span class="hnmt-step-qty">${item.quantity}</span>
                            <button type="button" class="hnmt-step-btn hnmt-step-plus" aria-label="Tăng" title="Tăng">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Gán sự kiện nút xóa
            const removeBtn = card.querySelector('.hnmt-card-del-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                });
            }

            // Gán sự kiện nút giảm
            const minusBtn = card.querySelector('.hnmt-step-minus');
            if (minusBtn) {
                minusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateQuantity(item.id, -1);
                });
            }

            // Gán sự kiện nút tăng
            const plusBtn = card.querySelector('.hnmt-step-plus');
            if (plusBtn) {
                plusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateQuantity(item.id, 1);
                });
            }

            listEl.appendChild(card);
        });

        // Cập nhật Footer Bill
        const subtotalEl = document.getElementById('hnmtCartSubtotal');
        const shipFeeEl = document.getElementById('hnmtCartShipFee');
        const totalAmountEl = document.getElementById('hnmtCartTotalAmount');
        const btnBadgeEl = document.getElementById('hnmtCartBtnBadge');

        if (subtotalEl) subtotalEl.textContent = formatMoney(total);
        if (shipFeeEl) shipFeeEl.textContent = 'Miễn phí';
        if (totalAmountEl) totalAmountEl.textContent = formatMoney(total);
        if (btnBadgeEl) btnBadgeEl.textContent = formatMoney(total);

        syncAllBadges();
    }

    // Thêm sản phẩm vào giỏ
    function addItem(product) {
        if (!product || !product.name) return;

        const pSlug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const pSize = product.size || 'M';
        const pColor = product.color || '';
        const id = `${pSlug}__${pSize}__${pColor}`.replace(/\s+/g, '_');

        const existing = cartItems.find(x => x.id === id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (Number(product.quantity) || 1);
        } else {
            cartItems.unshift({
                id: id,
                slug: pSlug,
                name: product.name,
                category: product.category || 'ao',
                price: Number(product.price) || 0,
                size: pSize,
                color: pColor,
                colorDot: product.colorDot || '',
                imageUrl: product.imageUrl || '',
                quantity: Number(product.quantity) || 1
            });
        }

        saveLocalCart(cartItems);
        renderCartItems();
        syncAllBadges();
    }

    // Xóa một món khỏi giỏ
    function removeItem(id) {
        const card = document.querySelector(`.hnmt-cart-card[data-id="${id}"]`);
        if (card) {
            card.classList.add('is-fade-out');
            setTimeout(() => {
                cartItems = cartItems.filter(x => x.id !== id);
                saveLocalCart(cartItems);
                renderCartItems();
                syncAllBadges();
            }, 200);
        } else {
            cartItems = cartItems.filter(x => x.id !== id);
            saveLocalCart(cartItems);
            renderCartItems();
            syncAllBadges();
        }
    }

    // Cập nhật số lượng (+1 hoặc -1)
    function updateQuantity(id, delta) {
        const item = cartItems.find(x => x.id === id);
        if (!item) return;

        const nextVal = (Number(item.quantity) || 1) + delta;
        if (nextVal <= 0) {
            removeItem(id);
        } else {
            item.quantity = Math.min(20, nextVal);
            saveLocalCart(cartItems);
            renderCartItems();
            syncAllBadges();
        }
    }

    // Mở Drawer giỏ hàng
    function openDrawer() {
        const modal = ensureCartDOM();
        // Đóng các bộ lọc khác nếu đang mở
        const shirtFilter = document.getElementById('hnmtShirtFilterModal');
        if (shirtFilter) shirtFilter.classList.remove('is-open');

        const pantsFilter = document.getElementById('hnmtPantsFilterModal');
        if (pantsFilter) pantsFilter.classList.remove('is-open');

        const sneakerFilter = document.getElementById('hnmtSneakerFilterModal');
        if (sneakerFilter) sneakerFilter.classList.remove('is-open');

        const spotlight = document.getElementById('hnmtSpotlightSearchModal');
        if (spotlight) spotlight.classList.remove('is-open');

        renderCartItems();
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }

    // Đóng Drawer giỏ hàng
    function closeDrawer() {
        const modal = document.getElementById('hnmtCartDrawerModal');
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    // Chuyển đổi trạng thái mở/đóng
    function toggleDrawer() {
        const modal = ensureCartDOM();
        if (modal.classList.contains('is-open')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    // Tự động gắn sự kiện vào tất cả các nút giỏ hàng trên trang
    function bindAllCartTriggers() {
        const selectorList = [
            '#bagBtn',
            '.rail-bag-btn',
            '#svBagBtn',
            '.sv-bag-btn',
            '#fsCartDrawerTrigger'
        ];

        selectorList.forEach(selector => {
            document.querySelectorAll(selector).forEach(btn => {
                if (!btn._hnmtCartBound) {
                    btn._hnmtCartBound = true;
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openDrawer();
                    });
                }
            });
        });
    }

    // Khởi tạo Drawer và các sự kiện nội bộ
    function init() {
        const modal = ensureCartDOM();
        const backdrop = document.getElementById('hnmtCartBackdrop');
        const closeBtn = document.getElementById('hnmtCartCloseBtn');
        const exploreBtn = document.getElementById('hnmtCartExploreBtn');
        const checkoutBtn = document.getElementById('hnmtCartCheckoutBtn');

        if (backdrop) backdrop.addEventListener('click', closeDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                closeDrawer();
                if (typeof window.open3DClothesRack === 'function') {
                    window.open3DClothesRack('ao');
                }
            });
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = '/Orders/Checkout';
            });
        }

        // Đóng bằng phím ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeDrawer();
            }
        });

        // Định kỳ quét và gắn sự kiện cho các nút giỏ hàng mới render
        bindAllCartTriggers();
        setInterval(bindAllCartTriggers, 800);

        // Đồng bộ badge ban đầu
        syncAllBadges();
        renderCartItems();
    }

    // Public API
    window.HNMTCart = {
        open: openDrawer,
        close: closeDrawer,
        toggle: toggleDrawer,
        addItem: addItem,
        removeItem: removeItem,
        updateQuantity: updateQuantity,
        getItems: () => cartItems,
        getCount: calculateTotalCount,
        getTotal: calculateTotalPrice,
        syncBadges: syncAllBadges,
        clear: () => {
            cartItems = [];
            saveLocalCart(cartItems);
            renderCartItems();
            syncAllBadges();
        }
    };

    // Tự chạy khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document);
