/**
 * HNMTSHOP — PANTS STUDIO INTERACTIVE LOOKBOOK (1:1 FIDELITY THEO VIDEO MẪU)
 * Seamless drop-in animation, background color morphing, interactive size picker,
 * upcoming queue thumbnails, and morphing CTA button.
 */

(function () {
    'use strict';

    // DỮ LIỆU CÁC MẪU QUẦN THỜI TRANG HNMTSHOP
    const PANTS_DATA = [
        {
            id: 'pnt-01',
            name: 'Baggy Cargo Acid-Wash Dark Smoke',
            category: 'Cargo',
            headline1: 'Wear Confidence.',
            headline2: 'Define Your Style.',
            desc: 'Khám phá thiết kế quần Baggy Cargo xám khói Acid-Wash với túi hộp 3D khỏe khoắn. Chất liệu heavy-wash canvas thoáng khí, đứng phom và mang đậm bản sắc streetwear cao cấp.',
            price: 650000,
            originalPrice: 890000,
            themeColor: '#7E1B38', // Sắc đỏ Burgundy thẫm như mở màn video
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/cargo-acid-wash.png?v=studio_v1'
        },
        {
            id: 'pnt-02',
            name: 'Wide-Leg Vintage Indigo Denim',
            category: 'Denim',
            headline1: 'Timeless Denim.',
            headline2: 'Effortless Cool.',
            desc: 'Quần jeans ống rộng phom suông kinh điển với tông màu chàm wash cổ điển. Đường may kép gia cố cùng khuy đồng dập nổi, tôn dáng tự nhiên và phóng khoáng cho mọi chuyển động.',
            price: 590000,
            originalPrice: 850000,
            themeColor: '#4A3628', // Nâu Mocha ấm áp như slide 2
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/wide-leg-denim.png?v=studio_v1'
        },
        {
            id: 'pnt-03',
            name: 'Tactical Utility Olive Jogger',
            category: 'Cargo',
            headline1: 'Urban Utility.',
            headline2: 'Built To Move.',
            desc: 'Thiết kế quần quân đội Tactical xanh rêu với dây đai khóa bấm công nghệ và chất liệu ripstop chống sờn rách, đáp ứng hoàn hảo giữa tính năng động và thẩm mỹ thời thượng.',
            price: 620000,
            originalPrice: 820000,
            themeColor: '#2B3038', // Xám than chì Graphite như slide 3
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/tactical-olive.png?v=studio_v1'
        },
        {
            id: 'pnt-04',
            name: 'Pleated Relaxed Tailored Trousers',
            category: 'Trousers',
            headline1: 'Quiet Luxury.',
            headline2: 'Modern Tailoring.',
            desc: 'Quần tây xếp ly phom suông thư thái mang sắc be cát nhã nhặn. Vải pha wool nhẹ rũ thanh lịch, kết hợp hoàn hảo giữa vẻ đẹp lịch lãm công sở và phong cách thoải mái thường nhật.',
            price: 690000,
            originalPrice: 950000,
            themeColor: '#6B5847', // Be Cát Sand Beige như slide 4
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/pleated-sand-beige.png?v=studio_v1'
        },
        {
            id: 'pnt-05',
            name: 'Midnight Raw Selvedge Straight-Leg',
            category: 'Denim',
            headline1: 'Pure Darkness.',
            headline2: 'Sharp & Clean.',
            desc: 'Quần denim dệt biên Raw Selvedge nhuộm đen tuyền bóng nhẹ. Cấu trúc ống đứng thẳng tắp tôn chiều cao, tạo điểm nhấn bí ẩn, sắc lạnh và đẳng cấp cho mọi outfit.',
            price: 720000,
            originalPrice: 990000,
            themeColor: '#1A1C22', // Đen Midnight sang trọng
            sizes: ['29', '30', '31', '32', '34'],
            image: '/images/pants/raw-selvedge-black.png?v=studio_v1'
        }
    ];

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
        if (index < 0) index = PANTS_DATA.length - 1;
        if (index >= PANTS_DATA.length) index = 0;
        currentIndex = index;

        const pant = PANTS_DATA[currentIndex];
        if (!pant) return;

        isAnimating = true;

        // 1. Đổi màu nền mượt mà
        const app = $('#psApp');
        if (app) {
            app.style.backgroundColor = pant.themeColor;
        }

        // 2. Cập nhật Headline và mô tả (Left Column)
        const hl1 = $('#psHeadline1');
        const hl2 = $('#psHeadline2');
        const desc = $('#psDesc');
        if (hl1) hl1.textContent = pant.headline1;
        if (hl2) hl2.textContent = pant.headline2;
        if (desc) desc.textContent = pant.desc;

        // 3. Cập nhật Giá bán (Right Column)
        const salePrice = $('#psSalePrice');
        const origPrice = $('#psOrigPrice');
        if (salePrice) salePrice.textContent = formatPrice(pant.price);
        if (origPrice) origPrice.textContent = formatPrice(pant.originalPrice);

        // 4. Cập nhật Size Pills
        renderSizes(pant.sizes);

        // 5. Hiệu ứng Drop-In cho Hero Image ở giữa
        const heroImg = $('#psHeroImg');
        const heroShadow = $('#psHeroShadow');

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

        // Hiển thị 2 mẫu quần tiếp theo trong hàng đợi
        for (let offset = 1; offset <= 2; offset++) {
            const nextIdx = (currentIndex + offset) % PANTS_DATA.length;
            const item = PANTS_DATA[nextIdx];

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
                renderPants(nextIdx, 1);
            };

            queueList.appendChild(card);
        }
    }

    // --- MORPHING CTA BUTTON KHI THÊM VÀO GIỎ ---
    function setupAddToCart() {
        const btn = $('#psAddToCartBtn');
        if (!btn) return;

        btn.onclick = (e) => {
            e.preventDefault();
            if (btn.classList.contains('is-added')) return;

            const pant = PANTS_DATA[currentIndex];
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
                    <span>THÊM VÀO GIỎ</span>
                    <i class="bi bi-arrow-right"></i>
                `;
            }, 2400);
        };
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
        tabs.forEach((tab, idx) => {
            tab.onclick = (e) => {
                e.stopPropagation();
                tabs.forEach(t => t.classList.remove('is-active'));
                tab.classList.add('is-active');

                // Chuyển tới mẫu thuộc category nếu có
                const cat = tab.getAttribute('data-cat');
                if (cat && cat !== 'all') {
                    const foundIdx = PANTS_DATA.findIndex(p => p.category.toLowerCase() === cat.toLowerCase());
                    if (foundIdx !== -1) renderPants(foundIdx);
                } else {
                    renderPants(0);
                }
            };
        });

        // Phím mũi tên qua lại
        document.addEventListener('keydown', (e) => {
            const overlay = $('#hnmtPantsOverlay');
            if (!overlay || !overlay.classList.contains('is-active')) return;

            if (e.key === 'ArrowLeft') {
                if (prevBtn) prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                if (nextBtn) nextBtn.click();
            } else if (e.key === 'Escape') {
                window.closePantsStudio();
            }
        });

        setupAddToCart();
    }

    // --- MỞ VÀ ĐÓNG PANTS STUDIO TOÀN CỤC CHO 3D SHOWROOM ---
    window.openPantsStudio = function () {
        const overlay = $('#hnmtPantsOverlay');
        if (overlay) {
            overlay.classList.add('is-active');
            renderPants(currentIndex);
        }
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
        bindEvents();
        renderPants(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
