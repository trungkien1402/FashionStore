/**
 * HNMTSHOP — PANTS VAULT (ĐỒNG BỘ 100% VỚI SNEAKER VAULT)
 * 2 viewing modes: Floating Grid Mode & Cinematic 3D Slider Mode.
 * Giant typography watermark, interactive 3D mouse parallax, tech specs,
 * circular size selectors, and collection vault switcher.
 */

(function () {
    'use strict';

    // DỮ LIỆU CÁC BỘ SƯU TẬP QUẦN THỜI TRANG HNMTSHOP
    const PANTS_COLLECTIONS = [
        {
            id: 'all',
            title: 'STREETWEAR PANTS VAULT',
            items: [
                {
                    id: 'pnt-01',
                    giantTitle: 'CARGO ACID IV',
                    modelName: 'ACID WASH DARK SMOKE',
                    styleCode: 'HNP-01-ACID',
                    fit: 'BAGGY RELAXED',
                    fabric: '100% HEAVY CANVAS 13.5OZ',
                    price: 650000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/cargo-acid-wash.png?v=vault_v1'
                },
                {
                    id: 'pnt-02',
                    giantTitle: 'VINTAGE INDIGO XI',
                    modelName: 'WIDE-LEG VINTAGE INDIGO',
                    styleCode: 'HNP-02-INDIGO',
                    fit: 'WIDE-LEG FIT',
                    fabric: '100% RIGID DENIM 12.8OZ',
                    price: 590000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/wide-leg-denim.png?v=vault_v1'
                },
                {
                    id: 'pnt-03',
                    giantTitle: 'TACTICAL UTILITY III',
                    modelName: 'TACTICAL OLIVE RIPSTOP',
                    styleCode: 'HNP-03-TACT',
                    fit: 'TAPERED JOGGER',
                    fabric: 'RIPSTOP COTTON-NYLON',
                    price: 620000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/tactical-olive.png?v=vault_v1'
                },
                {
                    id: 'pnt-04',
                    giantTitle: 'PLEATED SAND V',
                    modelName: 'PLEATED RELAXED BEIGE',
                    styleCode: 'HNP-04-SAND',
                    fit: 'RELAXED TAILORED',
                    fabric: 'WOOL-BLEND TWILL',
                    price: 690000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/pleated-sand-beige.png?v=vault_v1'
                },
                {
                    id: 'pnt-05',
                    giantTitle: 'RAW SELVEDGE I',
                    modelName: 'MIDNIGHT RAW SELVEDGE',
                    styleCode: 'HNP-05-SELVEDGE',
                    fit: 'STRAIGHT-LEG FIT',
                    fabric: 'JAPANESE SELVEDGE 14.5OZ',
                    price: 720000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/raw-selvedge-black.png?v=vault_v1'
                }
            ]
        },
        {
            id: 'cargo',
            title: 'CARGO STREETWEAR',
            items: [
                {
                    id: 'pnt-01',
                    giantTitle: 'CARGO ACID IV',
                    modelName: 'ACID WASH DARK SMOKE',
                    styleCode: 'HNP-01-ACID',
                    fit: 'BAGGY RELAXED',
                    fabric: '100% HEAVY CANVAS 13.5OZ',
                    price: 650000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/cargo-acid-wash.png?v=vault_v1'
                },
                {
                    id: 'pnt-03',
                    giantTitle: 'TACTICAL UTILITY III',
                    modelName: 'TACTICAL OLIVE RIPSTOP',
                    styleCode: 'HNP-03-TACT',
                    fit: 'TAPERED JOGGER',
                    fabric: 'RIPSTOP COTTON-NYLON',
                    price: 620000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/tactical-olive.png?v=vault_v1'
                }
            ]
        },
        {
            id: 'denim',
            title: 'HERITAGE DENIM',
            items: [
                {
                    id: 'pnt-02',
                    giantTitle: 'VINTAGE INDIGO XI',
                    modelName: 'WIDE-LEG VINTAGE INDIGO',
                    styleCode: 'HNP-02-INDIGO',
                    fit: 'WIDE-LEG FIT',
                    fabric: '100% RIGID DENIM 12.8OZ',
                    price: 590000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/wide-leg-denim.png?v=vault_v1'
                },
                {
                    id: 'pnt-05',
                    giantTitle: 'RAW SELVEDGE I',
                    modelName: 'MIDNIGHT RAW SELVEDGE',
                    styleCode: 'HNP-05-SELVEDGE',
                    fit: 'STRAIGHT-LEG FIT',
                    fabric: 'JAPANESE SELVEDGE 14.5OZ',
                    price: 720000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/raw-selvedge-black.png?v=vault_v1'
                }
            ]
        },
        {
            id: 'trousers',
            title: 'TAILORED TROUSERS',
            items: [
                {
                    id: 'pnt-04',
                    giantTitle: 'PLEATED SAND V',
                    modelName: 'PLEATED RELAXED BEIGE',
                    styleCode: 'HNP-04-SAND',
                    fit: 'RELAXED TAILORED',
                    fabric: 'WOOL-BLEND TWILL',
                    price: 690000,
                    sizes: ['29', '30', '31', '32', '34'],
                    image: '/images/pants/pleated-sand-beige.png?v=vault_v1'
                }
            ]
        }
    ];

    let currentCollectionIndex = 0;
    const getActiveCollection = () => PANTS_COLLECTIONS[currentCollectionIndex];
    const getPants = () => getActiveCollection().items;

    let currentIndex = 0;
    let isSliderView = false; // Mặc định mở dạng Grid 3x2 sang trọng như Sneaker Vault
    let selectedSize = '30';
    let bagCount = 0;
    let isAnimating = false;

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    function formatPrice(num) {
        return num.toLocaleString('vi-VN') + ' ₫';
    }

    // --- RENDER DANH SÁCH DẠNG LƯỚI (VIEW 1: FLOATING GRID) ---
    function renderGrid() {
        const grid = $('#pvGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const items = getPants();

        items.forEach((pant, idx) => {
            const card = document.createElement('div');
            card.className = 'pv-grid-item';
            card.setAttribute('role', 'button');
            card.setAttribute('title', `Xem chi tiết ${pant.giantTitle}`);
            card.innerHTML = `
                <div class="pv-item-image-wrap">
                    <img src="${pant.image}" alt="${pant.giantTitle}" class="pv-item-img" />
                    <div class="pv-item-shadow"></div>
                </div>
                <div class="pv-item-meta">
                    <h3 class="pv-item-title">${pant.giantTitle}</h3>
                    <div class="pv-item-price">${formatPrice(pant.price)}</div>
                </div>
            `;

            card.onclick = (e) => {
                e.stopPropagation();
                openSliderAt(idx);
            };

            grid.appendChild(card);
        });
    }

    // --- MỞ VIEW SLIDER TẠI VỊ TRÍ INDEX ---
    function openSliderAt(idx) {
        currentIndex = idx;
        isSliderView = true;
        updateViewMode();
        renderSliderPant(currentIndex);
    }

    // --- CẬP NHẬT GIAO DIỆN CHẾ ĐỘ XEM (GRID vs SLIDER 3D) ---
    function updateViewMode() {
        const app = $('#pvApp');
        const gridContainer = $('#pvGridContainer');
        const sliderContainer = $('#pvSliderContainer');
        const toggleBtnText = $('#pvToggleViewText');
        const toggleBtnIcon = $('#pvToggleViewIcon');

        if (isSliderView) {
            if (app) {
                app.classList.remove('is-grid-mode');
                app.classList.add('is-slider-mode');
            }
            if (gridContainer) gridContainer.classList.add('is-hidden');
            if (sliderContainer) sliderContainer.classList.add('is-active');
            if (toggleBtnText) toggleBtnText.textContent = 'LƯỚI TỔNG QUAN';
            if (toggleBtnIcon) toggleBtnIcon.className = 'bi bi-grid-3x3';
        } else {
            if (app) {
                app.classList.add('is-grid-mode');
                app.classList.remove('is-slider-mode');
            }
            if (gridContainer) gridContainer.classList.remove('is-hidden');
            if (sliderContainer) sliderContainer.classList.remove('is-active');
            if (toggleBtnText) toggleBtnText.textContent = 'SLIDER 3D';
            if (toggleBtnIcon) toggleBtnIcon.className = 'bi bi-view-stacked';
        }
    }

    // --- RENDER MẪU QUẦN TRONG SLIDER 3D ---
    function renderSliderPant(index) {
        const items = getPants();
        if (!items.length) return;

        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;
        currentIndex = index;

        const pant = items[currentIndex];
        if (!pant) return;

        isAnimating = true;

        // 1. Chữ Typography khổng lồ sau lưng quần
        const giantTitle = $('#pvGiantTitle');
        if (giantTitle) {
            giantTitle.style.transform = 'translateY(20px)';
            giantTitle.style.opacity = '0';
            setTimeout(() => {
                giantTitle.textContent = pant.giantTitle;
                giantTitle.style.transform = 'translateY(0)';
                giantTitle.style.opacity = '1';
            }, 180);
        }

        // 2. Thông số kỹ thuật góc dưới trái (Tech Specs)
        const modelName = $('#pvModelName');
        const styleCode = $('#pvStyleCode');
        const fit = $('#pvFit');
        const fabric = $('#pvFabric');
        const price = $('#pvPrice');

        if (modelName) modelName.textContent = pant.modelName;
        if (styleCode) styleCode.textContent = pant.styleCode;
        if (fit) fit.textContent = pant.fit;
        if (fabric) fabric.textContent = pant.fabric;
        if (price) price.textContent = formatPrice(pant.price);

        // 3. Ảnh quần ở giữa với hiệu ứng nổi khối
        const heroImg = $('#pvHeroImg');
        if (heroImg) {
            heroImg.classList.remove('is-floating');
            heroImg.style.transform = 'translateY(-30px) scale(0.92)';
            heroImg.style.opacity = '0';

            void heroImg.offsetWidth; // Force reflow

            heroImg.src = pant.image;
            heroImg.alt = pant.giantTitle;

            setTimeout(() => {
                heroImg.style.transform = 'translateY(0) scale(1)';
                heroImg.style.opacity = '1';
                setTimeout(() => {
                    heroImg.classList.add('is-floating');
                    isAnimating = false;
                }, 400);
            }, 100);
        } else {
            isAnimating = false;
        }

        // 4. Render danh sách size
        renderSizes(pant.sizes);
    }

    // --- RENDER CÁC NÚT SIZE TRÒN ĐỒNG BỘ ---
    function renderSizes(sizes) {
        const container = $('#pvSizePills');
        if (!container) return;

        container.innerHTML = '';
        if (!sizes.includes(selectedSize)) {
            selectedSize = sizes[0] || '30';
        }

        sizes.forEach(sz => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `pv-size-pill ${sz === selectedSize ? 'is-active' : ''}`;
            btn.textContent = sz;
            btn.setAttribute('data-size', sz);
            btn.onclick = (e) => {
                e.stopPropagation();
                selectedSize = sz;
                $$('.pv-size-pill').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            };
            container.appendChild(btn);
        });
    }

    // --- CHUYỂN ĐỔI BỘ SƯU TẬP (VAULT SWITCHER) ---
    function switchCollection(direction) {
        currentCollectionIndex += direction;
        if (currentCollectionIndex < 0) currentCollectionIndex = PANTS_COLLECTIONS.length - 1;
        if (currentCollectionIndex >= PANTS_COLLECTIONS.length) currentCollectionIndex = 0;

        const titleEl = $('#pvCollectionTitle');
        if (titleEl) {
            titleEl.textContent = getActiveCollection().title;
        }

        currentIndex = 0;
        renderGrid();
        if (isSliderView) {
            renderSliderPant(0);
        }
    }

    // --- SETUP TƯƠNG TÁC CHUỘT 3D PARALLAX CHO HERO IMAGE ---
    function setupParallax() {
        const stage = $('#pvStage');
        const heroWrap = $('#pvHeroWrap');
        if (!stage || !heroWrap) return;

        stage.addEventListener('mousemove', (e) => {
            if (!isSliderView) return;
            const rect = stage.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            heroWrap.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 10}deg) translateZ(20px)`;
        });

        stage.addEventListener('mouseleave', () => {
            heroWrap.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
        });
    }

    // --- THÊM VÀO GIỎ HÀNG VỚI NÚT MORPHING ---
    function setupAddToCart() {
        const btn = $('#pvAddBagBtn');
        if (!btn) return;

        btn.onclick = (e) => {
            e.preventDefault();
            if (btn.classList.contains('is-added')) return;

            bagCount++;
            const badge = $('#pvBagBadge');
            if (badge) badge.textContent = bagCount;

            const siteBagBadges = document.querySelectorAll('#cartCount, .cart-count, .sv-bag-badge');
            siteBagBadges.forEach(b => b.textContent = bagCount);

            const pant = getPants()[currentIndex];
            const size = selectedSize || '30';

            btn.classList.add('is-added');
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>ĐÃ THÊM (SIZE ${size})</span>
            `;

            setTimeout(() => {
                btn.classList.remove('is-added');
                btn.innerHTML = `
                    <span>THÊM VÀO GIỎ</span>
                    <i class="bi bi-arrow-right"></i>
                `;
            }, 2400);
        };
    }

    // --- GẮN SỰ KIỆN NÚT VÀ PHÍM TẮT ---
    function bindEvents() {
        // Toggle view Grid / Slider 3D
        const toggleBtn = $('#pvToggleViewBtn');
        if (toggleBtn) {
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                isSliderView = !isSliderView;
                updateViewMode();
                if (isSliderView) {
                    renderSliderPant(currentIndex);
                }
            };
        }

        // Vault Collection Switcher (< >)
        const prevColBtn = $('#pvPrevCollectionBtn');
        const nextColBtn = $('#pvNextCollectionBtn');
        if (prevColBtn) prevColBtn.onclick = (e) => { e.stopPropagation(); switchCollection(-1); };
        if (nextColBtn) nextColBtn.onclick = (e) => { e.stopPropagation(); switchCollection(1); };

        // Prev / Next Pants trong Slider Mode
        const prevBtn = $('#pvPrevBtn');
        const nextBtn = $('#pvNextBtn');
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                if (isAnimating) return;
                renderSliderPant(currentIndex - 1);
            };
        }
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                if (isAnimating) return;
                renderSliderPant(currentIndex + 1);
            };
        }

        // Phím tắt bàn phím
        document.addEventListener('keydown', (e) => {
            const overlay = $('#hnmtPantsOverlay');
            if (!overlay || !overlay.classList.contains('is-active')) return;

            if (e.key === 'ArrowLeft') {
                if (isSliderView && prevBtn) prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                if (isSliderView && nextBtn) nextBtn.click();
            } else if (e.key === 'Escape') {
                window.closePantsStudio();
            }
        });

        setupAddToCart();
        setupParallax();
    }

    // --- TỰ ĐỘNG ĐẢM BẢO HTML PANTS VAULT NẰM TRÊN DOM ---
    function ensurePantsStudioInDOM() {
        const existing = $('#hnmtPantsOverlay');
        if (existing) {
            existing.innerHTML = getPantsVaultMarkup();
            bindEvents();
            return;
        }

        const wrap = document.createElement('div');
        wrap.id = 'hnmtPantsOverlay';
        wrap.className = 'hnmt-pants-studio-wrap';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML = getPantsVaultMarkup();

        const portal = document.getElementById('hnmtChilePortal') || document.body;
        portal.appendChild(wrap);
        bindEvents();
    }

    function getPantsVaultMarkup() {
        return `
        <div class="pv-app is-grid-mode" id="pvApp">

            <!-- 1. HEADER (ĐỒNG BỘ 1:1 VỚI SNEAKER VAULT) -->
            <header class="pv-header">
                <div class="pv-header-left">
                    <button type="button" class="pv-icon-btn" id="pvToggleViewBtn" title="Chuyển chế độ xem">
                        <i class="bi bi-view-stacked" id="pvToggleViewIcon"></i>
                        <span id="pvToggleViewText">SLIDER 3D</span>
                    </button>
                    <div class="pv-vault-switcher" id="pvVaultSwitcher">
                        <button type="button" class="pv-vault-arrow" id="pvPrevCollectionBtn" aria-label="Bộ sưu tập trước" title="Bộ sưu tập trước">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <span class="pv-header-title" id="pvCollectionTitle">STREETWEAR PANTS VAULT</span>
                        <button type="button" class="pv-vault-arrow" id="pvNextCollectionBtn" aria-label="Bộ sưu tập tiếp theo" title="Bộ sưu tập kế tiếp">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <a href="/" class="pv-brand-signature" title="Về trang chủ HnmtShop">HnmtShop</a>

                <div class="pv-head-right">
                    <button type="button" class="pv-bag-btn" id="pvBagBtn" aria-label="Giỏ hàng">
                        <svg fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                            <path d="M4 8h16l-1 13H5L4 8Z" />
                            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                        </svg>
                        <span class="pv-bag-badge" id="pvBagBadge">0</span>
                    </button>
                    <button type="button" class="pv-exit-btn" id="pvExitBtn" onclick="window.closePantsStudio()" title="Quay lại Showroom">
                        <i class="bi bi-arrow-left"></i>
                        <span>Quay lại</span>
                    </button>
                </div>
            </header>

            <!-- 2. VIEW 1: FLOATING PANTS GRID -->
            <section class="pv-grid-container" id="pvGridContainer" aria-label="Bộ sưu tập quần dạng lưới">
                <div class="pv-grid" id="pvGrid">
                    <!-- Render tự động bởi pants-studio.js -->
                </div>
            </section>

            <!-- 3. VIEW 2: CINEMATIC SLIDER 3D -->
            <section class="pv-slider-container" id="pvSliderContainer" aria-label="Chi tiết Quần nổi khối 3D">

                <!-- CHỮ TYPOGRAPHY KHỔNG LỒ NẰM CHÌM SAU LƯNG QUẦN -->
                <div class="pv-giant-title-track" aria-hidden="true">
                    <h2 class="pv-giant-title" id="pvGiantTitle">CARGO ACID IV</h2>
                </div>

                <!-- SÂN KHẤU QUẦN 3D VỚI CHUỘT PARALLAX TILT -->
                <div class="pv-stage" id="pvStage">
                    <div class="pv-hero-wrap" id="pvHeroWrap">
                        <img src="/images/pants/cargo-acid-wash.png?v=vault_v1" alt="CARGO ACID IV" class="pv-hero-img is-floating" id="pvHeroImg" />
                        <div class="pv-hero-shadow" id="pvHeroShadow"></div>
                    </div>
                </div>

                <!-- THANH THÔNG SỐ VÀ ĐIỀU KHIỂN DƯỚI ĐÁY -->
                <footer class="pv-bottom-bar">

                    <!-- GÓC DƯỚI TRÁI: TECH SPECS -->
                    <div class="pv-specs-panel">
                        <h3 class="pv-model-name" id="pvModelName">ACID WASH DARK SMOKE</h3>
                        <dl class="pv-spec-grid">
                            <dt>MÃ QUẦN:</dt>
                            <dd id="pvStyleCode">HNP-01-ACID</dd>

                            <dt>PHOM DÁNG:</dt>
                            <dd id="pvFit">BAGGY RELAXED</dd>

                            <dt>CHẤT LIỆU:</dt>
                            <dd id="pvFabric">100% HEAVY CANVAS 13.5OZ</dd>

                            <dt>GIÁ BÁN:</dt>
                            <dd id="pvPrice">650.000 ₫</dd>
                        </dl>
                    </div>

                    <!-- GÓC DƯỚI PHẢI: ARROWS, SIZES, ADD TO BAG -->
                    <div class="pv-controls-panel">
                        <div class="pv-arrow-group">
                            <button type="button" class="pv-nav-btn prev" id="pvPrevBtn" aria-label="Mẫu trước">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <button type="button" class="pv-nav-btn next" id="pvNextBtn" aria-label="Mẫu tiếp theo">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>

                        <div class="pv-size-selector">
                            <span class="pv-size-label">CHỌN SIZE</span>
                            <div class="pv-size-pills" id="pvSizePills">
                                <!-- Render tự động bởi pants-studio.js -->
                            </div>
                        </div>

                        <button type="button" class="pv-add-bag-btn" id="pvAddBagBtn">
                            <span>THÊM VÀO GIỎ</span>
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>

                </footer>

            </section>

        </div>
        `;
    }

    // --- MỞ VÀ ĐÓNG PANTS STUDIO TOÀN CỤC CHO 3D SHOWROOM ---
    window.openPantsStudio = function () {
        ensurePantsStudioInDOM();
        const overlay = $('#hnmtPantsOverlay');
        if (overlay) {
            overlay.classList.add('is-active');
            renderGrid();
            if (isSliderView) {
                renderSliderPant(currentIndex);
            }
        }
        // Ẩn footer và header của Showroom 3D
        const promptEl = document.querySelector('.hnmt-portal-footer');
        const portalHeaderEl = document.querySelector('.hnmt-portal-header');
        if (promptEl) promptEl.style.display = 'none';
        if (portalHeaderEl) portalHeaderEl.style.display = 'none';
    };

    window.closePantsStudio = function () {
        const overlay = $('#hnmtPantsOverlay');
        if (overlay) {
            overlay.classList.remove('is-active');
        }
        // Hiện lại footer và header của Showroom 3D
        const promptEl = document.querySelector('.hnmt-portal-footer');
        const portalHeaderEl = document.querySelector('.hnmt-portal-header');
        if (promptEl) promptEl.style.display = '';
        if (portalHeaderEl) portalHeaderEl.style.display = '';
    };

    // Khởi tạo ban đầu
    function init() {
        ensurePantsStudioInDOM();
        renderGrid();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
