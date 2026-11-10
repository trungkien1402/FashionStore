/**
 * HNMTSHOP — PANTS STUDIO (ANIMATION CAROUSEL 1:1 THEO VIDEO REFERENCE)
 * Focal hero item + secondary perspective item, dynamic glowing neon waves,
 * responsive thumbnail carousel, smooth morphing transitions and size picker.
 */

(function () {
    'use strict';

    // DỮ LIỆU CÁC MẪU QUẦN THỜI TRANG HNMTSHOP
    const PANTS_DATA = [
        {
            id: 'pnt-01',
            badge: 'Cargo Series',
            headline: 'Defy Norms.<br>Own The Streets.',
            desc: 'Quần Baggy Cargo xám khói Acid-Wash với túi hộp 3D khỏe khoắn. Chất liệu heavy-wash canvas thoáng khí, đứng phom và mang đậm bản sắc streetwear cao cấp.',
            price: 650000,
            originalPrice: 890000,
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/cargo-acid-wash.png?v=carousel_v1',
            themeBg: '#0b0e14',
            accentColor: '#ff6a00',
            glowColor: 'radial-gradient(circle at 68% 45%, rgba(0, 160, 255, 0.28) 0%, rgba(255, 106, 0, 0.22) 40%, transparent 72%)',
            wave1: ['#00d4ff', '#0055ff'],
            wave2: ['#ff8800', '#ff2200'],
            btnGradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)'
        },
        {
            id: 'pnt-02',
            badge: 'Vintage Archive',
            headline: 'Timeless Denim.<br>Pure Attitude.',
            desc: 'Quần jeans ống rộng phom suông kinh điển với tông màu chàm wash sờn cổ điển. Đường may kép gia cố cùng khuy đồng dập nổi, tôn dáng tự nhiên và phóng khoáng.',
            price: 590000,
            originalPrice: 850000,
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/wide-leg-denim.png?v=carousel_v1',
            themeBg: '#0a101f',
            accentColor: '#00a2ff',
            glowColor: 'radial-gradient(circle at 68% 45%, rgba(0, 220, 255, 0.3) 0%, rgba(30, 90, 255, 0.22) 40%, transparent 72%)',
            wave1: ['#00f0ff', '#0072ff'],
            wave2: ['#00c6ff', '#0033aa'],
            btnGradient: 'linear-gradient(135deg, #00a2ff 0%, #0051ff 100%)'
        },
        {
            id: 'pnt-03',
            badge: 'Techwear Utility',
            headline: 'Built To Move.<br>Ready For Action.',
            desc: 'Thiết kế quần quân đội Tactical xanh rêu với dây đai khóa bấm công nghệ và chất liệu ripstop chống sờn rách, đáp ứng hoàn hảo giữa tính năng động và thẩm mỹ thời thượng.',
            price: 620000,
            originalPrice: 820000,
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/tactical-olive.png?v=carousel_v1',
            themeBg: '#0c1410',
            accentColor: '#00e676',
            glowColor: 'radial-gradient(circle at 68% 45%, rgba(0, 230, 118, 0.28) 0%, rgba(100, 221, 23, 0.18) 40%, transparent 72%)',
            wave1: ['#00e676', '#1de9b6'],
            wave2: ['#76ff03', '#00b0ff'],
            btnGradient: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)'
        },
        {
            id: 'pnt-04',
            badge: 'Quiet Luxury',
            headline: 'Crafted for Those<br>Who Lead.',
            desc: 'Quần tây xếp ly phom suông thư thái mang sắc be cát nhã nhặn. Vải pha wool nhẹ rũ thanh lịch, kết hợp hoàn hảo giữa vẻ đẹp lịch lãm công sở và phong cách thoải mái thường nhật.',
            price: 690000,
            originalPrice: 950000,
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/pleated-sand-beige.png?v=carousel_v1',
            themeBg: '#14100c',
            accentColor: '#d4af37',
            glowColor: 'radial-gradient(circle at 68% 45%, rgba(212, 175, 55, 0.3) 0%, rgba(255, 140, 0, 0.18) 40%, transparent 72%)',
            wave1: ['#ffd700', '#ff8c00'],
            wave2: ['#ffbb33', '#cc6600'],
            btnGradient: 'linear-gradient(135deg, #d4af37 0%, #e65100 100%)'
        },
        {
            id: 'pnt-05',
            badge: 'Raw Selvedge',
            headline: 'Pure Darkness.<br>Sharp & Clean.',
            desc: 'Quần denim dệt biên Raw Selvedge nhuộm đen tuyền bóng nhẹ. Cấu trúc ống đứng thẳng tắp tôn chiều cao, tạo điểm nhấn bí ẩn, sắc lạnh và đẳng cấp cho mọi outfit.',
            price: 720000,
            originalPrice: 990000,
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/raw-selvedge-black.png?v=carousel_v1',
            themeBg: '#120f18',
            accentColor: '#b388ff',
            glowColor: 'radial-gradient(circle at 68% 45%, rgba(179, 136, 255, 0.32) 0%, rgba(255, 64, 129, 0.2) 40%, transparent 72%)',
            wave1: ['#e040fb', '#7c4dff'],
            wave2: ['#b388ff', '#536dfe'],
            btnGradient: 'linear-gradient(135deg, #b388ff 0%, #651fff 100%)'
        }
    ];

    let currentIndex = 0;
    let selectedSize = '30';
    let isAnimating = false;
    let bagCount = 0;

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    function formatPrice(num) {
        return num.toLocaleString('vi-VN') + ' ₫';
    }

    // --- CẬP NHẬT CAROUSEL SẢN PHẨM ---
    function renderCarousel(index, direction = 1) {
        if (index < 0) index = PANTS_DATA.length - 1;
        if (index >= PANTS_DATA.length) index = 0;
        currentIndex = index;

        const currentPant = PANTS_DATA[currentIndex];
        const nextIndex = (currentIndex + 1) % PANTS_DATA.length;
        const nextPant = PANTS_DATA[nextIndex];

        if (!currentPant) return;
        isAnimating = true;

        // 1. Cập nhật nền & quầng sáng ambient sáng rõ tôn sản phẩm
        const app = $('#swApp');
        const glow = $('#swBgGlow');
        if (app) app.style.backgroundColor = currentPant.themeBg;
        if (glow) glow.style.background = currentPant.glowColor;

        // Cập nhật màu sóng SVG
        updateWaveGradients(currentPant.wave1, currentPant.wave2);

        // 2. Cột trái: Badge, Headline, Description, Price, CTA
        const badge = $('#swBadgePill');
        const headline = $('#swHeadline');
        const desc = $('#swDescription');
        const salePrice = $('#swSalePrice');
        const origPrice = $('#swOrigPrice');
        const ctaBtn = $('#swCtaBtn');

        if (badge) {
            badge.textContent = currentPant.badge;
            badge.style.borderColor = `${currentPant.accentColor}55`;
        }

        if (headline) {
            headline.style.opacity = '0';
            headline.style.transform = `translateY(${direction * 12}px)`;
            setTimeout(() => {
                headline.innerHTML = currentPant.headline;
                headline.style.opacity = '1';
                headline.style.transform = 'translateY(0)';
            }, 180);
        }

        if (desc) {
            desc.style.opacity = '0';
            desc.style.transform = `translateY(${direction * 8}px)`;
            setTimeout(() => {
                desc.textContent = currentPant.desc;
                desc.style.opacity = '1';
                desc.style.transform = 'translateY(0)';
            }, 220);
        }

        if (salePrice) salePrice.textContent = formatPrice(currentPant.price);
        if (origPrice) origPrice.textContent = formatPrice(currentPant.originalPrice);

        if (ctaBtn) {
            ctaBtn.style.background = currentPant.btnGradient;
            ctaBtn.style.boxShadow = `0 10px 24px ${currentPant.accentColor}55`;
        }

        // Render Size selector
        renderSizes(currentPant.sizes);

        // 3. Sân khấu 3D: Main Hero Item & Secondary Perspective Item
        const heroWrap = $('#swHeroWrap');
        const heroImg = $('#swHeroImg');
        const secWrap = $('#swSecondaryWrap');
        const secImg = $('#swSecondaryImg');

        if (heroWrap && heroImg) {
            heroWrap.style.opacity = '0';
            heroWrap.style.transform = direction > 0 ? 'translateX(50px) scale(0.92)' : 'translateX(-50px) scale(0.92)';

            setTimeout(() => {
                heroImg.src = currentPant.image;
                heroImg.alt = currentPant.badge;
                heroWrap.style.opacity = '1';
                heroWrap.style.transform = 'translateX(0) scale(1)';
            }, 180);
        }

        if (secWrap && secImg) {
            secWrap.style.opacity = '0';
            secWrap.style.transform = 'translateY(-20px) scale(0.9)';

            setTimeout(() => {
                secImg.src = nextPant.image;
                secImg.alt = nextPant.badge;
                secWrap.style.opacity = '0.85';
                secWrap.style.transform = 'translateY(0) scale(1)';
                isAnimating = false;
            }, 220);
        } else {
            isAnimating = false;
        }

        // 4. Cập nhật trạng thái active cho thanh thumbnail dưới đáy
        updateThumbnails();
    }

    // --- CẬP NHẬT GRADIENT CHO SVG WAVES ---
    function updateWaveGradients(wave1Colors, wave2Colors) {
        const grad1Stop0 = $('#swGrad1Stop0');
        const grad1Stop1 = $('#swGrad1Stop1');
        const grad2Stop0 = $('#swGrad2Stop0');
        const grad2Stop1 = $('#swGrad2Stop1');

        if (grad1Stop0 && wave1Colors[0]) grad1Stop0.setAttribute('stop-color', wave1Colors[0]);
        if (grad1Stop1 && wave1Colors[1]) grad1Stop1.setAttribute('stop-color', wave1Colors[1]);
        if (grad2Stop0 && wave2Colors[0]) grad2Stop0.setAttribute('stop-color', wave2Colors[0]);
        if (grad2Stop1 && wave2Colors[1]) grad2Stop1.setAttribute('stop-color', wave2Colors[1]);
    }

    // --- RENDER DANH SÁCH SIZE QUẦN TRÒN ---
    function renderSizes(sizes) {
        const container = $('#swSizePills');
        if (!container) return;

        container.innerHTML = '';
        if (!sizes.includes(selectedSize)) {
            selectedSize = sizes[0] || '30';
        }

        sizes.forEach(sz => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `sw-size-pill ${sz === selectedSize ? 'is-active' : ''}`;
            btn.textContent = sz;
            btn.setAttribute('data-size', sz);
            btn.onclick = (e) => {
                e.stopPropagation();
                selectedSize = sz;
                $$('.sw-size-pill').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            };
            container.appendChild(btn);
        });
    }

    // --- RENDER DÃY THUMBNAIL DƯỚI ĐÁY (EXPLORE MORE) ---
    function renderThumbnails() {
        const row = $('#swThumbnailRow');
        if (!row) return;

        row.innerHTML = '';
        PANTS_DATA.forEach((pant, idx) => {
            const card = document.createElement('div');
            card.className = `sw-thumb-card ${idx === currentIndex ? 'is-active' : ''}`;
            card.setAttribute('role', 'button');
            card.setAttribute('title', pant.badge);
            card.setAttribute('data-index', idx);
            card.innerHTML = `
                <img src="${pant.image}" alt="${pant.badge}" class="sw-thumb-img" />
            `;

            card.onclick = (e) => {
                e.stopPropagation();
                if (isAnimating || idx === currentIndex) return;
                const dir = idx > currentIndex ? 1 : -1;
                renderCarousel(idx, dir);
            };

            row.appendChild(card);
        });
    }

    function updateThumbnails() {
        const cards = $$('.sw-thumb-card');
        const activePant = PANTS_DATA[currentIndex];
        cards.forEach((card, idx) => {
            if (idx === currentIndex) {
                card.classList.add('is-active');
                if (activePant) {
                    card.style.borderColor = activePant.accentColor;
                    card.style.boxShadow = `0 0 18px ${activePant.accentColor}66`;
                }
            } else {
                card.classList.remove('is-active');
                card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                card.style.boxShadow = 'none';
            }
        });
    }

    // --- NÚT THÊM VÀO GIỎ HÀNG VỚI HIỆU ỨNG MORPHING ---
    function setupAddToCart() {
        const btn = $('#swCtaBtn');
        if (!btn) return;

        btn.onclick = (e) => {
            e.preventDefault();
            if (btn.classList.contains('is-added')) return;

            bagCount++;
            const badge = $('#swBagBadge');
            if (badge) badge.textContent = bagCount;

            const siteBagBadges = document.querySelectorAll('#cartCount, .cart-count, .sv-bag-badge');
            siteBagBadges.forEach(b => b.textContent = bagCount);

            const size = selectedSize || '30';
            btn.classList.add('is-added');
            btn.innerHTML = `
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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

    // --- GẮN SỰ KIỆN TƯƠNG TÁC ---
    function bindEvents() {
        // Nút Giỏ Hàng: Mở Drawer Giỏ Hàng trượt từ cạnh phải giống các trang khác
        const bagBtn = $('#swBagBtn');
        if (bagBtn) {
            bagBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.openFsCartDrawer === 'function') {
                    window.openFsCartDrawer();
                } else {
                    const trigger = document.getElementById('fsCartDrawerTrigger');
                    if (trigger) trigger.click();
                }
            };
        }

        // Bấm vào mẫu phụ ở góc trên phải để trượt đến nó
        const secWrap = $('#swSecondaryWrap');
        if (secWrap) {
            secWrap.onclick = (e) => {
                e.stopPropagation();
                if (isAnimating) return;
                renderCarousel(currentIndex + 1, 1);
            };
        }

        // Phím mũi tên qua lại
        document.addEventListener('keydown', (e) => {
            const overlay = $('#hnmtPantsOverlay');
            if (!overlay || !overlay.classList.contains('is-active')) return;

            if (e.key === 'ArrowLeft') {
                if (!isAnimating) renderCarousel(currentIndex - 1, -1);
            } else if (e.key === 'ArrowRight') {
                if (!isAnimating) renderCarousel(currentIndex + 1, 1);
            } else if (e.key === 'Escape') {
                window.closePantsStudio();
            }
        });

        setupAddToCart();
        syncCartCount();
    }

    function syncCartCount() {
        const existingBadge = document.querySelector('.fs-cart-count, #cartCount, #svBagBadge, #bagCount');
        if (existingBadge) {
            const val = parseInt(existingBadge.textContent.trim(), 10);
            if (!isNaN(val)) bagCount = val;
        }
        const myBadge = $('#swBagBadge');
        if (myBadge) myBadge.textContent = bagCount;
    }

    // --- TỰ ĐỘNG ĐẢM BẢO HTML CAROUSEL NẰM TRONG DOM ---
    function ensurePantsStudioInDOM() {
        const existing = $('#hnmtPantsOverlay');
        if (existing) {
            existing.innerHTML = getPantsCarouselMarkup();
            bindEvents();
            renderThumbnails();
            return;
        }

        const wrap = document.createElement('div');
        wrap.id = 'hnmtPantsOverlay';
        wrap.className = 'hnmt-pants-studio-wrap';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML = getPantsCarouselMarkup();

        const portal = document.getElementById('hnmtChilePortal') || document.body;
        portal.appendChild(wrap);
        bindEvents();
        renderThumbnails();
    }

    function getPantsCarouselMarkup() {
        return `
        <div class="sw-app" id="swApp">
            <!-- NỀN QUẦNG SÁNG AMBIENT SPOTLIGHT -->
            <div class="sw-bg-glow" id="swBgGlow"></div>

            <!-- DẢI SÓNG ÁNH SÁNG NEON (WAVE RIBBONS) NHƯ VIDEO REFERENCE -->
            <svg class="sw-wave-svg" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="swGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop id="swGrad1Stop0" offset="0%" stop-color="#00d4ff" />
                        <stop id="swGrad1Stop1" offset="100%" stop-color="#0055ff" />
                    </linearGradient>
                    <linearGradient id="swGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop id="swGrad2Stop0" offset="0%" stop-color="#ff8800" />
                        <stop id="swGrad2Stop1" offset="100%" stop-color="#ff2200" />
                    </linearGradient>
                </defs>
                <path id="swWave1" class="sw-wave-path sw-wave-1" d="M -100 420 Q 300 200, 750 480 T 1540 280" />
                <path id="swWave2" class="sw-wave-path sw-wave-2" d="M -80 620 Q 450 680, 880 340 T 1550 560" />
            </svg>

            <!-- 1. HEADER -->
            <header class="sw-header">
                <a href="/" class="sw-brand-logo" title="HnmtShop">
                    <span class="sw-brand-sig">HnmtShop</span>
                    <span class="sw-brand-sub">PANTS ARCHIVE</span>
                </a>

                <nav class="sw-nav-menu">
                    <span class="sw-nav-link active">Bộ sưu tập Quần</span>
                    <span class="sw-nav-link">Chất liệu cao cấp</span>
                    <span class="sw-nav-link">Bảng chọn size</span>
                </nav>

                <div class="sw-head-right">
                    <button type="button" class="sw-bag-btn" id="swBagBtn" aria-label="Giỏ hàng">
                        <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                            <path d="M4 8h16l-1 13H5L4 8Z" />
                            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                        </svg>
                        <span class="sw-bag-badge" id="swBagBadge">0</span>
                    </button>
                    <button type="button" class="sw-exit-btn" id="swExitBtn" onclick="window.closePantsStudio()" title="Quay lại Showroom">
                        <i class="bi bi-arrow-left"></i>
                        <span>Quay lại</span>
                    </button>
                </div>
            </header>

            <!-- 2. MAIN HERO STAGE (1:1 THEO VIDEO MẪU) -->
            <main class="sw-main-hero">
                <!-- CỘT TRÁI: EDITORIAL & CHỌN MUA -->
                <div class="sw-left-copy">
                    <div class="sw-badge-pill" id="swBadgePill">Cargo Series</div>

                    <h1 class="sw-headline" id="swHeadline">
                        Defy Norms.<br>Own The Streets.
                    </h1>

                    <p class="sw-description" id="swDescription">
                        Quần Baggy Cargo xám khói Acid-Wash với túi hộp 3D khỏe khoắn. Chất liệu heavy-wash canvas thoáng khí, đứng phom và mang đậm bản sắc streetwear cao cấp.
                    </p>

                    <!-- GIÁ & BỘ CHỌN SIZE -->
                    <div class="sw-product-meta">
                        <div class="sw-price-box">
                            <span class="sw-sale-price" id="swSalePrice">650.000 ₫</span>
                            <span class="sw-orig-price" id="swOrigPrice">890.000 ₫</span>
                        </div>
                        <div class="sw-size-group">
                            <span class="sw-size-label">SIZE:</span>
                            <div class="sw-size-pills" id="swSizePills">
                                <!-- Render tự động bởi pants-studio.js -->
                            </div>
                        </div>
                    </div>

                    <!-- NÚT CTA CHỮ NHẬT BO GÓC NHƯ TRONG VIDEO -->
                    <div class="sw-cta-row">
                        <button type="button" class="sw-cta-btn" id="swCtaBtn">
                            <span>THÊM VÀO GIỎ</span>
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                </div>

                <!-- CỘT PHẢI: 3D ANIMATION CAROUSEL (FOCAL MAIN + UPCOMING SECONDARY) -->
                <div class="sw-right-stage" id="swRightStage">
                    <!-- MẪU PHỤ GÓC TRÊN PHẢI (UPCOMING NEXT ITEM) -->
                    <div class="sw-secondary-wrap" id="swSecondaryWrap" title="Mẫu kế tiếp (Bấm để xem)">
                        <img src="/images/pants/wide-leg-denim.png?v=carousel_v1" alt="Next Item" class="sw-secondary-img" id="swSecondaryImg" />
                        <div class="sw-item-shadow-sec"></div>
                    </div>

                    <!-- MẪU CHÍNH FOCAL HERO NỔI BẬT Ở TRUNG TÂM -->
                    <div class="sw-hero-wrap" id="swHeroWrap">
                        <img src="/images/pants/cargo-acid-wash.png?v=carousel_v1" alt="Hero Item" class="sw-hero-img" id="swHeroImg" />
                        <div class="sw-item-shadow-main"></div>
                    </div>
                </div>
            </main>

            <!-- 3. BOTTOM: EXPLORE MORE & THUMBNAILS CAROUSEL -->
            <footer class="sw-bottom-bar">
                <div class="sw-explore-line">
                    <span class="sw-explore-label">EXPLORE MORE</span>
                    <div class="sw-divider"></div>
                </div>

                <div class="sw-thumbnail-row" id="swThumbnailRow">
                    <!-- Render tự động bởi pants-studio.js -->
                </div>
            </footer>
        </div>
        `;
    }

    // --- MỞ VÀ ĐÓNG PANTS STUDIO TOÀN CỤC CHO 3D SHOWROOM ---
    window.openPantsStudio = function () {
        ensurePantsStudioInDOM();
        const overlay = $('#hnmtPantsOverlay');
        if (overlay) {
            overlay.classList.add('is-active');
            renderCarousel(currentIndex);
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
        renderCarousel(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
