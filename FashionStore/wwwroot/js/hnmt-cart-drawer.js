/**
 * HNMT ATELIER - LUXURY SHOPPING BAG & MINI-CART DRAWER
 * Thiết kế giao diện Giỏ Hàng kính mờ Dark Glassmorphism đồng bộ 100% với Bộ Lọc Tìm Kiếm.
 * Tích hợp toàn diện trên Sào Áo, Sào Quần, Sneaker Vault và Main Store.
 */
(function (window, document) {
    'use strict';

    const CART_STORAGE_KEY = 'hnmt_atelier_cart_v1';
    const FREESHIP_THRESHOLD = 1000000; // 1.000.000 ₫ miễn phí giao hàng

    // Lấy dữ liệu giỏ hàng từ localStorage (tự động dọn dẹp item lỗi)
    function loadLocalCart() {
        try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    // Dọn dẹp các item bị lỗi tên hoặc undefined
                    const validItems = parsed.filter(x => x && x.name && !x.name.includes('undefined'));
                    if (validItems.length !== parsed.length) {
                        saveLocalCart(validItems);
                    }
                    return validItems;
                }
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
    let serverItems = [];
    let serverQueue = Promise.resolve();
    const allCartItems = () => [...serverItems, ...cartItems];
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g,
        char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

    function serverCart(path, body, open = false) {
        const action = async () => {
            try {
                const response = await fetch(path, body ? {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                } : { cache: 'no-store' });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.message || 'Không thể cập nhật giỏ hàng.');
                serverItems = data.items.map(item => ({ ...item, id: `sql-${item.variantId}`, price: item.unitPrice }));
                const notice = document.getElementById('hnmtCartError');
                if (notice) notice.hidden = true;
                if (open) openDrawer(false);
                else renderCartItems();
                return true;
            } catch (error) {
                if (body) {
                    openDrawer(false);
                    const notice = document.getElementById('hnmtCartError');
                    if (notice) {
                        notice.textContent = error.message || 'Không thể cập nhật giỏ hàng.';
                        notice.hidden = false;
                    }
                }
                return false;
            }
        };
        serverQueue = serverQueue.then(action);
        return serverQueue;
    }

    // Định dạng tiền tệ VNĐ
    function formatMoney(amount) {
        return (Number(amount) || 0).toLocaleString('vi-VN') + ' ₫';
    }

    // Tính tổng số lượng món
    function calculateTotalCount() {
        return allCartItems().reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }

    // Tính tổng tiền sản phẩm
    function calculateTotalPrice() {
        return allCartItems().reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
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
            drawerCount.textContent = `(${count})`;
        }
    }

    // HTML Template của Giỏ Hàng Slide-over Kính Mờ (Đồng bộ thiết kế với Bộ Lọc Tìm Kiếm)
    const DRAWER_HTML = `
        <div class="fashion-filter-backdrop hnmt-cart-backdrop" id="hnmtCartBackdrop"></div>
        <aside class="fashion-filter-sidebar hnmt-cart-sidebar" id="hnmtCartSidebar" role="dialog" aria-modal="true" aria-label="Túi đồ thời trang">
            <!-- 1. Header Tinh Giản theo phong cách Bộ Lọc -->
            <div class="fashion-sidebar-header hnmt-cart-header">
                <h2 class="fashion-filter-title">Giỏ Hàng <span class="hnmt-cart-header-count" id="hnmtCartDrawerCountBadge">(0)</span></h2>
                <button type="button" class="fashion-filter-close" id="hnmtCartCloseBtn" aria-label="Đóng giỏ hàng" title="Đóng (ESC)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- 2. Danh sách sản phẩm trong giỏ (Scrollable Area) -->
            <div class="fashion-sidebar-scroll hnmt-cart-body" id="hnmtCartBody">
                <p id="hnmtCartError" role="status" hidden></p>
                <div class="hnmt-cart-items-list" id="hnmtCartItemsList">
                    <!-- Danh sách Cart Item Render bằng JavaScript -->
                </div>

                <!-- Trạng thái trống (Empty State) -->
                <div class="hnmt-cart-empty-view" id="hnmtCartEmptyView" style="display: none;">
                    <div class="hnmt-empty-glow-ring">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                    </div>
                    <h3 class="hnmt-empty-title">Túi đồ của bạn đang trống</h3>
                    <p class="hnmt-empty-desc">Hãy khám phá và chọn những thiết kế độc bản trong các sào đồ của HNMT Atelier.</p>
                    <button type="button" class="sv-apply-capsule-btn hnmt-empty-explore-btn" id="hnmtCartExploreBtn">
                        Khám Phá Sào Đồ
                    </button>
                </div>
            </div>

            <!-- 3. Sticky Footer: Card Tính Tổng & Nút Thanh Toán Viên Thuốc Đồng Bộ Bộ Lọc -->
            <div class="fashion-sidebar-footer hnmt-cart-footer" id="hnmtCartFooter">
                <!-- Hộp Tính Tổng chuẩn thiết kế đã duyệt -->
                <div class="hnmt-cart-bill-card">
                    <div class="hnmt-bill-row">
                        <span class="hnmt-bill-label">Tạm tính</span>
                        <strong class="hnmt-bill-val" id="hnmtCartSubtotal">0 ₫</strong>
                    </div>
                    <div class="hnmt-bill-row">
                        <span class="hnmt-bill-label">Vận chuyển</span>
                        <strong class="hnmt-bill-val hnmt-ship-val" id="hnmtCartShipFee">30.000 ₫</strong>
                    </div>
                    <div class="hnmt-bill-divider"></div>
                    <div class="hnmt-bill-row hnmt-bill-total">
                        <span class="hnmt-total-label">Tổng thanh toán</span>
                        <strong class="hnmt-total-val" id="hnmtCartTotalAmount">0 ₫</strong>
                    </div>
                </div>

                <!-- Nút Thanh Toán: Chỉ có chữ Thanh Toán, không có mũi tên, không có số tiền -->
                <button type="button" class="hnmt-checkout-capsule-btn" id="hnmtCartCheckoutBtn" title="Tiến hành thanh toán">
                    Thanh Toán
                </button>
            </div>
        </aside>
    `;

    function ensureCartDOM() {
        let modal = document.getElementById('hnmtCartDrawerModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtCartDrawerModal';
            modal.className = 'hnmt-fashion-filter-modal hnmt-cart-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = DRAWER_HTML;
            document.body.appendChild(modal);
        }
        const isSneakerMode = document.body.classList.contains('is-sneaker-standalone') || 
                              Boolean(document.getElementById('hnmtSneakerOverlay')?.classList.contains('is-active'));
        if (isSneakerMode) {
            modal.classList.add('is-sneaker-cart');
            modal.classList.remove('is-light-cart');
        } else {
            modal.classList.remove('is-sneaker-cart');
            modal.classList.add('is-light-cart');
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

        // Render từng item thành card đồng bộ phong cách .fashion-select-card
        listEl.innerHTML = '';
        allCartItems().forEach(item => {
            const card = document.createElement('div');
            card.className = 'hnmt-cart-item-card';
            card.setAttribute('data-id', item.id);

            let defaultFallback = '/clothing-rail/assets/reach-shirt-front.webp';
            if (item.category === 'giay') defaultFallback = '/images/sneakers/air-future-iv.webp';
            else if (item.category === 'quan') defaultFallback = '/clothing-rail/assets/reach-pants-front.webp';

            const thumbImg = item.imageUrl || defaultFallback;

            card.innerHTML = `
                <div class="hnmt-item-thumb-box">
                    <img src="${escapeHtml(thumbImg)}" alt="${escapeHtml(item.name || 'Sản phẩm')}" class="hnmt-item-thumb" onerror="this.onerror=null;this.src='${defaultFallback}'">
                </div>
                <div class="hnmt-item-details">
                    <div class="hnmt-item-top">
                        <h4 class="hnmt-item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h4>
                        <button type="button" class="hnmt-item-remove-btn" title="Xóa món này khỏi giỏ" aria-label="Xóa">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="hnmt-item-meta">
                        ${item.size ? `<span class="hnmt-meta-pill">Size ${escapeHtml(item.size)}</span>` : ''}
                        ${item.color ? `
                            <span class="hnmt-meta-pill" title="${escapeHtml(item.color)}">
                                ${item.colorDot ? `<span class="hnmt-color-swatch-dot" style="background:${escapeHtml(item.colorDot)}"></span>` : ''}
                                <span>${escapeHtml(item.color)}</span>
                            </span>
                        ` : ''}
                    </div>

                    <div class="hnmt-item-bottom">
                        <span class="hnmt-item-unit-price">${formatMoney(item.price)}</span>

                        <!-- Stepper Tăng Giảm Số Lượng Dạng Capsule -->
                        <div class="hnmt-stepper-capsule">
                            <button type="button" class="hnmt-step-btn hnmt-step-minus" aria-label="Giảm số lượng" title="Giảm">
                                ${item.quantity <= 1 ? `
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                ` : `
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                `}
                            </button>
                            <span class="hnmt-step-value">${Number(item.quantity) || 1}</span>
                            <button type="button" class="hnmt-step-btn hnmt-step-plus" aria-label="Tăng số lượng" title="Tăng">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Gán sự kiện nút xóa
            const removeBtn = card.querySelector('.hnmt-item-remove-btn');
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

        // Cập nhật Hộp Tính Tổng chuẩn
        const subtotalEl = document.getElementById('hnmtCartSubtotal');
        const shipFeeEl = document.getElementById('hnmtCartShipFee');
        const totalAmountEl = document.getElementById('hnmtCartTotalAmount');

        const shipFee = total >= FREESHIP_THRESHOLD || total === 0 ? 0 : 30000;
        const grandTotal = total + shipFee;

        if (subtotalEl) subtotalEl.textContent = formatMoney(total);
        if (shipFeeEl) shipFeeEl.textContent = shipFee === 0 ? 'Miễn phí' : formatMoney(shipFee);
        if (totalAmountEl) totalAmountEl.textContent = formatMoney(grandTotal);

        syncAllBadges();
    }

    // Thêm sản phẩm vào giỏ
    function addItem(product) {
        if (!product || !product.name) return;
        if (product.productId && (product.variantId || product.size)) {
            return serverCart('/Cart/AddAjax', {
                productId: product.productId,
                variantId: product.variantId,
                size: product.size,
                quantity: product.quantity || 1
            }, true);
        }

        const pSlug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const pSize = product.size || 'M';
        const pColor = product.color || '';
        const id = `${pSlug}__${pSize}__${pColor}`.replace(/\s+/g, '_');

        const existing = cartItems.find(x => x.id === id);
        if (existing) {
            existing.quantity = (Number(existing.quantity) || 1) + (Number(product.quantity) || 1);
        } else {
            cartItems.unshift({
                id: id,
                name: product.name,
                price: Number(product.price) || 0,
                quantity: Number(product.quantity) || 1,
                size: pSize,
                color: pColor,
                colorDot: product.colorDot || '',
                imageUrl: product.imageUrl || ''
            });
        }

        saveLocalCart(cartItems);
        syncAllBadges();
        openDrawer();
        return true;
    }

    // Xóa sản phẩm khỏi giỏ
    function removeItem(id) {
        const serverItem = serverItems.find(item => item.id === id);
        if (serverItem) return serverCart('/Cart/UpdateAjax', { variantId: serverItem.variantId, delta: -serverItem.quantity });
        const card = document.querySelector(`.hnmt-cart-item-card[data-id="${id}"]`);
        if (card) {
            card.classList.add('is-removing');
            setTimeout(() => {
                cartItems = cartItems.filter(x => x.id !== id);
                saveLocalCart(cartItems);
                renderCartItems();
                syncAllBadges();
            }, 240);
        } else {
            cartItems = cartItems.filter(x => x.id !== id);
            saveLocalCart(cartItems);
            renderCartItems();
            syncAllBadges();
        }
    }

    // Cập nhật số lượng (+1 hoặc -1)
    function updateQuantity(id, delta) {
        const serverItem = serverItems.find(item => item.id === id);
        if (serverItem) return serverCart('/Cart/UpdateAjax', { variantId: serverItem.variantId, delta });
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
    function openDrawer(refresh = true) {
        const modal = ensureCartDOM();
        const isSneakerMode = document.body.classList.contains('is-sneaker-standalone') || 
                              Boolean(document.getElementById('hnmtSneakerOverlay')?.classList.contains('is-active'));
        if (isSneakerMode) {
            modal.classList.add('is-sneaker-cart');
            modal.classList.remove('is-light-cart');
        } else {
            modal.classList.remove('is-sneaker-cart');
            modal.classList.add('is-light-cart');
        }

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
        if (refresh) serverCart('/Cart/GetMiniCart');
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
            checkoutBtn.addEventListener('click', async () => {
                await serverQueue;
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
        serverCart('/Cart/GetMiniCart');
    }

    // Public API
    window.HNMTCart = {
        open: openDrawer,
        close: closeDrawer,
        toggle: toggleDrawer,
        addItem: addItem,
        removeItem: removeItem,
        updateQuantity: updateQuantity,
        getItems: allCartItems,
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
