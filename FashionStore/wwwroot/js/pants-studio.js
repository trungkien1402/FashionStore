/**
 * HNMTSHOP — PANTS STUDIO INTERACTIVE LOOKBOOK (LUXURY & E-COMMERCE LOGIC)
 * Seamless drop-in animation, background color morphing, spotlight backlight glow,
 * unified purchasing column, technical garment specs card, and dynamic category filtering.
 */

(function () {
    'use strict';

    // DỮ LIỆU CÁC MẪU QUẦN THỜI TRANG HNMTSHOP
    const PANTS_DATA = [
        {
            id: 'pnt-01',
            name: 'Quần Baggy Cargo Acid-Wash Xám Khói',
            badge: 'Cargo Streetwear',
            category: 'cargo',
            headline1: 'Wear Confidence.',
            headline2: 'Define Your Style.',
            desc: 'Thiết kế Baggy Cargo xám khói ứng dụng công nghệ Acid-Wash tạo vân loang độc bản. Cấu trúc túi hộp 3D vát góc sắc sảo mang đậm hơi thở thời trang đường phố tân thời.',
            fit: 'Baggy Relaxed (Ống suông rộng)',
            fabric: '100% Canvas Heavy-Wash (13.5oz)',
            hardware: 'Khóa zip YKK đồng đúc, chốt gấu co rút',
            feature: 'Đứng form tự nhiên, chống sờn rách',
            price: 650000,
            originalPrice: 890000,
            discount: '-27%',
            themeColor: '#7E1B38', // Sắc đỏ Burgundy thẫm như mở màn video
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/cargo-acid-wash.png?v=studio_v2'
        },
        {
            id: 'pnt-02',
            name: 'Quần Jeans Wide-Leg Vintage Wash Indigo',
            badge: 'Vintage Denim',
            category: 'denim',
            headline1: 'Timeless Denim.',
            headline2: 'Effortless Cool.',
            desc: 'Quần jeans ống rộng phom suông kinh điển với tông màu chàm wash sờn cổ điển. Kỹ thuật giặt đá tự nhiên tạo độ mềm mại hoàn hảo trên nền vải denim đanh chắc.',
            fit: 'Wide-Leg (Ống rộng suông dài)',
            fabric: '100% Rigid Denim Cotton (12.8oz)',
            hardware: 'Đinh tán & khuy đồng dập chìm Hnmt',
            feature: 'Tôn dáng chân dài, không bai gião',
            price: 590000,
            originalPrice: 850000,
            discount: '-31%',
            themeColor: '#4A3628', // Nâu Mocha ấm áp
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/wide-leg-denim.png?v=studio_v2'
        },
        {
            id: 'pnt-03',
            name: 'Quần Tactical Utility Olive Ripstop',
            badge: 'Utility Techwear',
            category: 'cargo',
            headline1: 'Urban Utility.',
            headline2: 'Built To Move.',
            desc: 'Phong cách Techwear dã chiến với sắc xanh rêu lính. Cấu trúc túi hộp vát góc tối ưu không gian chứa đồ, đai thắt quick-release phản quang hỗ trợ mọi chuyển động.',
            fit: 'Tapered Cargo (Ống côn bo gấu)',
            fabric: 'Ripstop Cotton-Nylon dệt tổ ong',
            hardware: 'Khóa bấm Quick-Release, zip trượt nước',
            feature: 'Chống sờn rách, co giãn nhẹ 2 chiều',
            price: 620000,
            originalPrice: 820000,
            discount: '-24%',
            themeColor: '#2B3038', // Xám than chì Graphite
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/tactical-olive.png?v=studio_v2'
        },
        {
            id: 'pnt-04',
            name: 'Quần Tây Pleated Relaxed Sand Beige',
            badge: 'Tailored Trousers',
            category: 'trousers',
            headline1: 'Quiet Luxury.',
            headline2: 'Modern Tailoring.',
            desc: 'Quần âu xếp ly kép với phom dáng suông phóng khoáng mang tinh thần Quiet Luxury. Tông be cát trang nhã dễ dàng kết hợp cùng áo thun, polo hoặc blazer sang trọng.',
            fit: 'Relaxed Tailored (Ống suông xếp ly)',
            fabric: 'Wool-Blend cao cấp (Sợi dệt mịn)',
            hardware: 'Cạp tăng đơ ẩn thông minh tinh chỉnh eo',
            feature: 'Độ rũ thanh thoát, chống nhăn tuyệt đối',
            price: 690000,
            originalPrice: 950000,
            discount: '-27%',
            themeColor: '#6B5847', // Be Cát Sand Beige
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/pleated-sand-beige.png?v=studio_v2'
        },
        {
            id: 'pnt-05',
            name: 'Quần Midnight Raw Selvedge Straight-Leg',
            badge: 'Premium Selvedge',
            category: 'denim',
            headline1: 'Pure Darkness.',
            headline2: 'Sharp & Clean.',
            desc: 'Tuyệt phẩm denim dệt biên Selvedge nhuộm đen tuyền bóng nhẹ. Cấu trúc ống đứng thẳng tắp tôn chiều cao, tạo điểm nhấn bí ẩn, sắc lạnh và đẳng cấp cho mọi outfit.',
            fit: 'Straight-Leg (Ống đứng tôn chiều cao)',
            fabric: 'Japanese Raw Selvedge Denim 14.5oz',
            hardware: 'Khuy Button Fly truyền thống mạ titan',
            feature: 'Vải mộc sống, fade vân theo cơ thể người mặc',
            price: 720000,
            originalPrice: 990000,
            discount: '-27%',
            themeColor: '#1A1C22', // Đen Midnight sang trọng
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/raw-selvedge-black.png?v=studio_v2'
        }
    ];

    let currentFilter = 'all';
    let filteredList = [...PANTS_DATA];
    let currentIndex = 0;
    let selectedSize = '30';
    let isAnimating = false;
    let cartCount = 0;

    // Helper DOM selectors
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function formatPrice(num) {
        return num.toLocaleString('vi-VN') + ' ₫';
    }

    // --- CẬP NHẬT GIAO DIỆN QUẦN ---
    function renderPants(index, direction = 1) {
        if (!filteredList.length) return;

        if (index < 0) index = filteredList.length - 1;
        if (index >= filteredList.length) index = 0;
        currentIndex = index;

        const pant = filteredList[currentIndex];
        if (!pant) return;

        isAnimating = true;

        // 1. Đổi màu nền mượt mà
        const app = $('#psApp');
        if (app) {
            app.style.backgroundColor = pant.themeColor;
        }

        // 2. Cột trái: Headline, Mô tả & Thẻ thông số kỹ thuật (Garment Specs)
        const hl1 = $('#psHeadline1');
        const hl2 = $('#psHeadline2');
        const desc = $('#psDesc');
        if (hl1) hl1.textContent = pant.headline1;
        if (hl2) hl2.textContent = pant.headline2;
        if (desc) desc.textContent = pant.desc;

        const specFit = $('#psSpecFit');
        const specFabric = $('#psSpecFabric');
        const specHdw = $('#psSpecHdw');
        const specFeat = $('#psSpecFeat');
        if (specFit) specFit.textContent = pant.fit;
        if (specFabric) specFabric.textContent = pant.fabric;
        if (specHdw) specHdw.textContent = pant.hardware;
        if (specFeat) specFeat.textContent = pant.feature;

        // 3. Cột phải (Khối mua hàng đồng bộ): Tên, Badge, Giá, Giảm giá
        const badge = $('#psCatBadge');
        const title = $('#psProductTitle');
        const salePrice = $('#psSalePrice');
        const origPrice = $('#psOrigPrice');
        const discountTag = $('#psDiscountTag');

        if (badge) badge.textContent = pant.badge;
        if (title) title.textContent = pant.name;
        if (salePrice) salePrice.textContent = formatPrice(pant.price);
        if (origPrice) origPrice.textContent = formatPrice(pant.originalPrice);
        if (discountTag) discountTag.textContent = pant.discount;

        // 4. Cập nhật Size Pills
        renderSizes(pant.sizes);

        // 5. Hiệu ứng Drop-In cho Hero Image ở giữa
        const heroImg = $('#psHeroImg');
        if (heroImg) {
            heroImg.classList.remove('is-floating');
            heroImg.classList.remove('is-animating-in');

            // Force reflow
            void heroImg.offsetWidth;

            heroImg.src = pant.image;
            heroImg.alt = pant.name;
            heroImg.classList.add('is-animating-in');

            setTimeout(() => {
                heroImg.classList.remove('is-animating-in');
                heroImg.classList.add('is-floating');
                isAnimating = false;
            }, 850);
        } else {
            isAnimating = false;
        }

        // 6. Cập nhật Hàng đợi Mini Thumbnail góc dưới phải
        renderQueue();
    }

    // --- RENDER DANH SÁCH SIZE QUẦN TRÒN ---
    function renderSizes(sizes) {
        const container = $('#psSizePills');
        if (!container) return;

        container.innerHTML = '';
        if (!sizes.includes(selectedSize)) {
            selectedSize = sizes[0] || '30';
        }

        sizes.forEach(sz => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `ps-size-btn ${sz === selectedSize ? 'is-active' : ''}`;
            btn.textContent = sz;
            btn.setAttribute('data-size', sz);
            btn.onclick = (e) => {
                e.stopPropagation();
                selectedSize = sz;
                $$('.ps-size-btn').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            };
            container.appendChild(btn);
        });
    }

    // --- RENDER HÀNG ĐỢI MINI THUMBNAILS GÓC PHẢI DƯỚI ---
    function renderQueue() {
        const queueList = $('#psQueueList');
        if (!queueList) return;

        queueList.innerHTML = '';

        // Hiển thị 2 mẫu quần tiếp theo trong danh sách đang lọc (hoặc toàn bộ)
        const sourceList = filteredList.length > 1 ? filteredList : PANTS_DATA;
        const total = sourceList.length;

        for (let offset = 1; offset <= Math.min(2, total - 1); offset++) {
            const nextIdx = (currentIndex + offset) % total;
            const item = sourceList[nextIdx];

            const card = document.createElement('div');
            card.className = 'ps-queue-card';
            card.setAttribute('role', 'button');
            card.setAttribute('title', `Xem ${item.name}`);
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="ps-queue-img" />
                <div class="ps-queue-shadow"></div>
            `;

            card.onclick = (e) => {
                e.stopPropagation();
                if (isAnimating) return;
                // Nếu đang dùng sourceList khác filteredList, reset lọc về all
                if (sourceList !== filteredList) {
                    setCategoryFilter('all');
                }
                const targetIdx = filteredList.findIndex(p => p.id === item.id);
                renderPants(targetIdx !== -1 ? targetIdx : 0, 1);
            };

            queueList.appendChild(card);
        }
    }

    // --- BỘ LỌC DANH MỤC THỜI TRANG ---
    function setCategoryFilter(cat) {
        currentFilter = cat.toLowerCase();

        $$('.ps-tab-btn').forEach(t => {
            const tCat = (t.getAttribute('data-cat') || '').toLowerCase();
            if (tCat === currentFilter) {
                t.classList.add('is-active');
            } else {
                t.classList.remove('is-active');
            }
        });

        if (currentFilter === 'all') {
            filteredList = [...PANTS_DATA];
        } else {
            filteredList = PANTS_DATA.filter(p => p.category === currentFilter);
            if (!filteredList.length) {
                filteredList = [...PANTS_DATA];
            }
        }

        renderPants(0, 1);
    }

    // --- MORPHING CTA BUTTON KHI THÊM VÀO GIỎ ---
    function setupAddToCart() {
        const btn = $('#psAddToCartBtn');
        if (!btn) return;

        btn.onclick = (e) => {
            e.preventDefault();
            if (btn.classList.contains('is-added')) return;

            const pant = filteredList[currentIndex] || PANTS_DATA[0];
            const size = selectedSize || '30';

            // 1. Tăng giỏ hàng
            cartCount++;
            const badge = $('#psCartBadge');
            if (badge) badge.textContent = cartCount;

            // Cập nhật giỏ hàng chung của trang nếu có
            const siteBagBadges = document.querySelectorAll('#cartCount, .cart-count, .sv-bag-badge');
            siteBagBadges.forEach(b => b.textContent = cartCount);

            // 2. Chuyển nút sang trạng thái đã thêm vào giỏ
            btn.classList.add('is-added');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>ĐÃ THÊM VÀO GIỎ (SIZE ${size})</span>
            `;

            // 3. Tự động phục hồi nút sau 2.4s
            setTimeout(() => {
                btn.classList.remove('is-added');
                btn.innerHTML = `
                    <span>THÊM VÀO GIỎ HÀNG</span>
                    <i class="bi bi-arrow-right"></i>
                `;
            }, 2400);
        };
    }

    // --- MODAL BẢNG SIZE QUẦN ---
    function setupSizeModal() {
        const guideBtn = $('#psSizeGuideBtn');
        const modalBackdrop = $('#psSizeModalBackdrop');
        const closeBtn = $('#psSizeModalClose');

        if (guideBtn && modalBackdrop) {
            guideBtn.onclick = (e) => {
                e.stopPropagation();
                modalBackdrop.classList.add('is-open');
            };
        }

        if (closeBtn && modalBackdrop) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                modalBackdrop.classList.remove('is-open');
            };
        }

        if (modalBackdrop) {
            modalBackdrop.onclick = (e) => {
                if (e.target === modalBackdrop) {
                    modalBackdrop.classList.remove('is-open');
                }
            };
        }
    }

    // --- GẮN SỰ KIỆN NÚT BẤM VÀ PHÍM TẮT ---
    function bindEvents() {
        const prevBtn = $('#psPrevBtn');
        const nextBtn = $('#psNextBtn');

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                if (isAnimating) return;
                renderPants(currentIndex - 1, -1);
            };
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                if (isAnimating) return;
                renderPants(currentIndex + 1, 1);
            };
        }

        // Filter tabs ở Header
        const tabs = $$('.ps-tab-btn');
        tabs.forEach(tab => {
            tab.onclick = (e) => {
                e.stopPropagation();
                const cat = tab.getAttribute('data-cat') || 'all';
                setCategoryFilter(cat);
            };
        });

        // Phím mũi tên qua lại
        document.addEventListener('keydown', (e) => {
            const overlay = $('#hnmtPantsOverlay');
            if (!overlay || !overlay.classList.contains('is-active')) return;

            const modalBackdrop = $('#psSizeModalBackdrop');
            if (modalBackdrop && modalBackdrop.classList.contains('is-open')) {
                if (e.key === 'Escape') {
                    modalBackdrop.classList.remove('is-open');
                }
                return;
            }

            if (e.key === 'ArrowLeft') {
                if (prevBtn) prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                if (nextBtn) nextBtn.click();
            } else if (e.key === 'Escape') {
                window.closePantsStudio();
            }
        });

        setupAddToCart();
        setupSizeModal();
    }

    // --- TỰ ĐỘNG ĐẢM BẢO HTML PANTS STUDIO NẰM TRONG DOM (CHỐNG LỖI CACHE SERVER) ---
    function ensurePantsStudioInDOM() {
        const existing = $('#hnmtPantsOverlay');
        if (existing) {
            // Thay thế nội dung bằng markup hoàn chỉnh mới
            existing.innerHTML = getPantsStudioMarkup();
            bindEvents();
            return;
        }

        const wrap = document.createElement('div');
        wrap.id = 'hnmtPantsOverlay';
        wrap.className = 'hnmt-pants-studio-wrap';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML = getPantsStudioMarkup();

        const portal = document.getElementById('hnmtChilePortal') || document.body;
        portal.appendChild(wrap);
        bindEvents();
    }

    function getPantsStudioMarkup() {
        return `
        <div class="ps-app" id="psApp">
            <!-- 1. HEADER -->
            <header class="ps-header">
                <nav class="ps-nav-tabs" aria-label="Bộ lọc danh mục quần">
                    <button type="button" class="ps-tab-btn is-active" data-cat="all">Tất cả</button>
                    <button type="button" class="ps-tab-btn" data-cat="cargo">Cargo</button>
                    <button type="button" class="ps-tab-btn" data-cat="denim">Denim Jeans</button>
                    <button type="button" class="ps-tab-btn" data-cat="trousers">Trousers</button>
                </nav>

                <a href="/" class="ps-brand-logo" title="HnmtShop">
                    <span class="ps-brand-sig">HnmtShop</span>
                </a>

                <div class="ps-header-right">
                    <button type="button" class="ps-header-btn" id="psCartBtn" aria-label="Giỏ hàng">
                        <i class="bi bi-bag"></i>
                        <span class="ps-cart-badge" id="psCartBadge">0</span>
                    </button>
                    <button type="button" class="ps-exit-btn" id="psExitBtn" onclick="window.closePantsStudio()" title="Quay lại Showroom">
                        <i class="bi bi-arrow-left"></i>
                        <span>Quay lại</span>
                    </button>
                </div>
            </header>

            <!-- 2. MAIN STAGE (3 CỘT LOOKBOOK THỜI TRANG THỰC TẾ) -->
            <main class="ps-main-stage">
                <!-- CỘT TRÁI: EDITORIAL & GARMENT SPECS -->
                <section class="ps-left-col">
                    <h1 class="ps-headline">
                        <span id="psHeadline1">Wear Confidence.</span>
                        <span id="psHeadline2">Define Your Style.</span>
                    </h1>
                    <p class="ps-desc" id="psDesc">
                        Khám phá thiết kế quần Baggy Cargo xám khói ứng dụng công nghệ Acid-Wash tạo vân loang độc bản. Cấu trúc túi hộp 3D vát góc sắc sảo mang đậm hơi thở streetwear quân đội tân thời.
                    </p>

                    <!-- BẢNG THÔNG SỐ VẢI KỸ THUẬT (SPECS) -->
                    <div class="ps-specs-card">
                        <div class="ps-spec-item">
                            <i class="bi bi-aspect-ratio ps-spec-icon"></i>
                            <div class="ps-spec-content">
                                <span class="ps-spec-label">Phom Dáng</span>
                                <span class="ps-spec-val" id="psSpecFit">Baggy Relaxed (Ống suông rộng)</span>
                            </div>
                        </div>
                        <div class="ps-spec-item">
                            <i class="bi bi-layers ps-spec-icon"></i>
                            <div class="ps-spec-content">
                                <span class="ps-spec-label">Chất Liệu</span>
                                <span class="ps-spec-val" id="psSpecFabric">100% Canvas Heavy-Wash (13.5oz)</span>
                            </div>
                        </div>
                        <div class="ps-spec-item">
                            <i class="bi bi-nut ps-spec-icon"></i>
                            <div class="ps-spec-content">
                                <span class="ps-spec-label">Khóa & Phụ Liệu</span>
                                <span class="ps-spec-val" id="psSpecHdw">Khóa zip YKK đồng đúc, chốt gấu</span>
                            </div>
                        </div>
                        <div class="ps-spec-item">
                            <i class="bi bi-shield-check ps-spec-icon"></i>
                            <div class="ps-spec-content">
                                <span class="ps-spec-label">Đặc Tính</span>
                                <span class="ps-spec-val" id="psSpecFeat">Đứng form tự nhiên, chống sờn rách</span>
                            </div>
                        </div>
                    </div>

                    <div class="ps-social-row">
                        <a href="https://instagram.com" target="_blank" rel="noopener" class="ps-social-link" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener" class="ps-social-link" aria-label="X / Twitter"><i class="bi bi-twitter-x"></i></a>
                        <a href="https://facebook.com" target="_blank" rel="noopener" class="ps-social-link" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener" class="ps-social-link" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
                    </div>
                </section>

                <!-- CỘT GIỮA: SÂN KHẤU QUẦN 3D VỚI SPOTLIGHT GLOW LƯNG QUẦN -->
                <section class="ps-center-col">
                    <button type="button" class="ps-nav-arrow prev" id="psPrevBtn" aria-label="Mẫu quần trước" title="Mẫu trước">
                        <i class="bi bi-chevron-left"></i>
                    </button>

                    <!-- QUẦNG SÁNG STUDIO TÔN SẢN PHẨM -->
                    <div class="ps-spotlight-glow" aria-hidden="true"></div>

                    <div class="ps-hero-stage">
                        <div class="ps-hero-img-wrap">
                            <img src="/images/pants/cargo-acid-wash.png?v=studio_v2" alt="Quần thời trang" class="ps-hero-img is-floating" id="psHeroImg" />
                            <div class="ps-hero-shadow" id="psHeroShadow"></div>
                        </div>
                    </div>

                    <button type="button" class="ps-nav-arrow next" id="psNextBtn" aria-label="Mẫu quần tiếp theo" title="Mẫu kế tiếp">
                        <i class="bi bi-chevron-right"></i>
                    </button>

                    <div class="ps-bottom-slogan">
                        Dress Better. Feel Better.
                    </div>
                </section>

                <!-- CỘT PHẢI: KHỐI MUA HÀNG ĐỒNG BỘ 1 CHẠM -->
                <section class="ps-right-col">
                    <div class="ps-purchase-card">
                        <span class="ps-cat-badge" id="psCatBadge">Cargo Streetwear</span>
                        <h2 class="ps-product-title" id="psProductTitle">Quần Baggy Cargo Acid-Wash Xám Khói</h2>

                        <div class="ps-price-box">
                            <span class="ps-sale-price" id="psSalePrice">650.000 ₫</span>
                            <span class="ps-orig-price" id="psOrigPrice">890.000 ₫</span>
                            <span class="ps-discount-tag" id="psDiscountTag">-27%</span>
                        </div>

                        <!-- CHỌN SIZE QUẦN -->
                        <div class="ps-size-box">
                            <div class="ps-size-header">
                                <span class="ps-size-label">CHỌN KÍCH CỠ</span>
                                <button type="button" class="ps-size-guide-btn" id="psSizeGuideBtn">Bảng size</button>
                            </div>
                            <div class="ps-size-pills" id="psSizePills">
                                <!-- Render tự động bởi pants-studio.js -->
                            </div>
                        </div>

                        <!-- NÚT THÊM VÀO GIỎ NGAY DƯỚI BẢNG SIZE -->
                        <div class="ps-cta-wrap">
                            <button type="button" class="ps-cta-btn" id="psAddToCartBtn">
                                <span>THÊM VÀO GIỎ HÀNG</span>
                                <i class="bi bi-arrow-right"></i>
                            </button>
                        </div>

                        <!-- CHÍNH SÁCH MUA HÀNG -->
                        <div class="ps-perks-row">
                            <span><i class="bi bi-shield-check"></i> Chính hãng 100%</span>
                            <span><i class="bi bi-truck"></i> Giao 2-3 ngày</span>
                            <span><i class="bi bi-arrow-repeat"></i> Đổi trả 30 ngày</span>
                        </div>

                        <!-- HÀNG ĐỢI XEM TRƯỚC -->
                        <div class="ps-queue-box">
                            <span class="ps-queue-label">SẮP CHIẾU TIẾP THEO</span>
                            <div class="ps-queue-list" id="psQueueList">
                                <!-- Render thumbnail hàng đợi mini bởi pants-studio.js -->
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <!-- 3. POPUP MODAL BẢNG SIZE -->
            <div class="ps-size-modal-backdrop" id="psSizeModalBackdrop" role="dialog" aria-modal="true" aria-label="Bảng quy đổi kích cỡ quần">
                <div class="ps-size-modal">
                    <div class="ps-size-modal-header">
                        <h3 class="ps-size-modal-title">BẢNG QUY ĐỔI KÍCH CỠ QUẦN HNMTSHOP</h3>
                        <button type="button" class="ps-size-modal-close" id="psSizeModalClose" aria-label="Đóng">&times;</button>
                    </div>
                    <table class="ps-size-table">
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Chiều Cao (cm)</th>
                                <th>Cân Nặng (kg)</th>
                                <th>Vòng Eo (cm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td><strong>29</strong></td><td>160 - 168</td><td>50 - 58</td><td>73 - 76</td></tr>
                            <tr><td><strong>30</strong></td><td>165 - 172</td><td>59 - 65</td><td>77 - 80</td></tr>
                            <tr><td><strong>31</strong></td><td>168 - 176</td><td>66 - 72</td><td>81 - 84</td></tr>
                            <tr><td><strong>32</strong></td><td>172 - 180</td><td>73 - 78</td><td>85 - 88</td></tr>
                            <tr><td><strong>34</strong></td><td>175 - 185</td><td>79 - 86</td><td>89 - 94</td></tr>
                        </tbody>
                    </table>
                    <p class="ps-size-hint-text">
                        * Khuyên dùng: Nếu bạn phân vân giữa 2 size hoặc thích mặc phom rộng phóng khoáng (Baggy/Wide-Leg), hãy chọn tăng 1 size.
                    </p>
                </div>
            </div>
        </div>
        `;
    }

    // --- MỞ VÀ ĐÓNG PANTS STUDIO TOÀN CỤC CHO 3D SHOWROOM ---
    window.openPantsStudio = function () {
        ensurePantsStudioInDOM();
        const overlay = $('#hnmtPantsOverlay');
        if (overlay) {
            overlay.classList.add('is-active');
            renderPants(currentIndex);
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
        renderPants(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
