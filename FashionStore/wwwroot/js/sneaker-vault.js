/**
 * HNMTSHOP — FUTURIST SNEAKER VAULT (SLIDER & 3D PARALLAX SHOWCASE)
 * Inspired by Nike Futurist Jordan Collection & Awwwards interactive footwear sliders.
 */

(function () {
    'use strict';

    // 6 Siêu Phẩm Sneaker Tương Ứng Với 6 Tông Màu Điện Ảnh Chuẩn Video
    const SNEAKERS = [
        {
            id: 'snk-01',
            model: 'AIR FUTURE IV',
            colorway: 'INFRARAY STORM',
            themeColor: '#CE1234', // Đỏ Crimson Rực Rỡ
            accentColor: '#FF2A55',
            price: 5200000,
            styleCode: 'HFS-04-STORM',
            designer: 'HNMTSHOP × FUTURE LAB',
            release: 'DECEMBER 2026',
            colorName: 'STORM GREY / INFRARED',
            swatches: ['#FFFFFF', '#CE1234', '#1F2024'],
            image: '/images/sneakers/air-future-iv.webp'
        },
        {
            id: 'snk-02',
            model: 'AIR FUTURE XI',
            colorway: 'HYPER FLUX',
            themeColor: '#0077D8', // Xanh Biển Điện Tử
            accentColor: '#00E5FF',
            price: 5500000,
            styleCode: 'HFS-11-FLUX',
            designer: 'HNMTSHOP × FUTURE LAB',
            release: 'JANUARY 2027',
            colorName: 'DEEP BLUE / SONIC BLUE',
            swatches: ['#FFFFFF', '#0077D8', '#00E5FF'],
            image: '/images/sneakers/air-future-xi.webp'
        },
        {
            id: 'snk-03',
            model: 'AIR FUTURE III',
            colorway: 'NEXUS X1',
            themeColor: '#4EA819', // Xanh Acid Volt Neon
            accentColor: '#8CFF00',
            price: 4900000,
            styleCode: 'HFS-03-NEXUS',
            designer: 'HNMTSHOP × FUTURE LAB',
            release: 'FEBRUARY 2027',
            colorName: 'WHITE / ACID VOLT / BLACK',
            swatches: ['#FFFFFF', '#4EA819', '#15161A'],
            image: '/images/sneakers/air-future-iii.webp'
        },
        {
            id: 'snk-04',
            model: 'AIR FUTURE V',
            colorway: 'LUNAR CHROME',
            themeColor: '#6D3AA6', // Tím Cyberpunk Iridescent
            accentColor: '#B666FF',
            price: 5800000,
            styleCode: 'HFS-05-LUNAR',
            designer: 'HNMTSHOP × FUTURE LAB',
            release: 'MARCH 2027',
            colorName: 'VIOLET CHROME / MIDNIGHT',
            swatches: ['#6D3AA6', '#B666FF', '#0D0E12'],
            image: '/images/sneakers/air-future-v.webp'
        },
        {
            id: 'snk-05',
            model: 'AIR FUTURE I',
            colorway: 'DUNE PHANTOM',
            themeColor: '#B9935A', // Vàng Cát Sa Mạc Sang Trọng
            accentColor: '#FFD700',
            price: 6200000,
            styleCode: 'HFS-01-DUNE',
            designer: 'HNMTSHOP × FUTURE LAB',
            release: 'APRIL 2027',
            colorName: 'DESERT SAND / GOLD CHROME',
            swatches: ['#F5E6CC', '#B9935A', '#FFD700'],
            image: '/images/sneakers/air-future-i.webp'
        },
        {
            id: 'snk-06',
            model: 'AIR FUTURE IX',
            colorway: 'VOLT MAGMA',
            themeColor: '#1A1B20', // Đen Titan Than Chì Viền Magma
            accentColor: '#FF2A2A',
            price: 6500000,
            styleCode: 'HFS-09-MAGMA',
            designer: 'HNMTSHOP × FUTURE LAB',
            release: 'MAY 2027',
            colorName: 'MAGMA RED / CARBON BLACK',
            swatches: ['#FF2A2A', '#2E3038', '#111215'],
            image: '/images/sneakers/air-future-ix.webp'
        }
    ];

    let currentIndex = 0;
    let isSliderView = false;
    let bagCount = 0;

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    function formatPrice(num) {
        return num.toLocaleString('vi-VN') + ' ₫';
    }

    // --- Khởi tạo lưới 6 đôi ban đầu (Grid Overview) ---
    function renderGrid() {
        const grid = $('#svGrid');
        if (!grid) return;
        grid.innerHTML = '';

        SNEAKERS.forEach((snk, idx) => {
            const item = document.createElement('div');
            item.className = 'sv-grid-item';
            item.setAttribute('data-idx', idx);
            item.innerHTML = `
                <div class="sv-item-image-wrap">
                    <img src="${snk.image}" alt="${snk.model}" class="sv-item-img" />
                    <div class="sv-item-shadow"></div>
                </div>
                <div class="sv-item-meta">
                    <h3 class="sv-item-title">${snk.model}</h3>
                    <span class="sv-item-price">${formatPrice(snk.price)}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                openSliderView(idx);
            });
            grid.appendChild(item);
        });
    }

    // --- Chuyển cảnh Smart Animate: Mở chi tiết Slider ---
    function openSliderView(idx) {
        currentIndex = idx;
        isSliderView = true;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const app = $('#svApp');
        const toggleBtn = $('#svToggleViewBtn');

        if (gridContainer) gridContainer.classList.add('is-hidden');
        if (sliderContainer) sliderContainer.classList.add('is-active');

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-grid-3x3-gap"></i> <span>TẤT CẢ GIÀY</span>';
        }

        updateSliderDisplay(true);
    }

    // --- Quay lại xem dạng lưới 6 đôi ---
    function closeSliderView() {
        isSliderView = false;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const app = $('#svApp');
        const toggleBtn = $('#svToggleViewBtn');

        if (sliderContainer) sliderContainer.classList.remove('is-active');
        if (gridContainer) gridContainer.classList.remove('is-hidden');

        // Trả nền về màu đen tối giản của showroom
        if (app) app.style.backgroundColor = 'var(--sv-dark-bg)';

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
        }
    }

    // --- Cập nhật giao diện Slider theo chiếc giày hiện tại ---
    function updateSliderDisplay(immediate = false) {
        const snk = SNEAKERS[currentIndex];
        if (!snk) return;

        const app = $('#svApp');
        const giantTitle = $('#svGiantTitle');
        const heroImg = $('#svHeroImg');
        const colorwayName = $('#svColorwayName');
        const styleCode = $('#svStyleCode');
        const price = $('#svPrice');
        const colorName = $('#svColorName');
        const designer = $('#svDesigner');
        const release = $('#svRelease');
        const swatchesContainer = $('#svSwatches');

        // 1. Đổi màu nền mượt mà theo đúng video
        if (app) {
            app.style.backgroundColor = snk.themeColor;
        }

        // 2. Chữ Typography khổng lồ phía sau
        if (giantTitle) {
            giantTitle.style.opacity = '0';
            giantTitle.style.transform = 'translateY(25px) scale(0.96)';
            setTimeout(() => {
                giantTitle.textContent = snk.model;
                giantTitle.style.opacity = '0.94';
                giantTitle.style.transform = 'translateY(0) scale(1)';
            }, 180);
        }

        // 3. Ảnh Giày Nổi Khối 3D
        if (heroImg) {
            heroImg.style.opacity = '0';
            heroImg.style.transform = 'scale(0.85) rotate(-6deg)';
            setTimeout(() => {
                heroImg.src = snk.image;
                heroImg.alt = snk.model;
                heroImg.style.opacity = '1';
                heroImg.style.transform = 'scale(1) rotate(0deg)';
            }, 180);
        }

        // 4. Bảng Specs góc dưới trái
        if (colorwayName) colorwayName.textContent = snk.colorway;
        if (styleCode) styleCode.textContent = snk.styleCode;
        if (price) price.textContent = formatPrice(snk.price);
        if (colorName) colorName.textContent = snk.colorName;
        if (designer) designer.textContent = snk.designer;
        if (release) release.textContent = snk.release;

        // 5. Chấm Swatches
        if (swatchesContainer) {
            swatchesContainer.innerHTML = '';
            snk.swatches.forEach((color, i) => {
                const dot = document.createElement('span');
                dot.className = `sv-color-dot ${i === 0 ? 'is-active' : ''}`;
                dot.style.backgroundColor = color;
                dot.addEventListener('click', () => {
                    $$('.sv-color-dot').forEach(d => d.classList.remove('is-active'));
                    dot.classList.add('is-active');
                });
                swatchesContainer.appendChild(dot);
            });
        }

        // 6. Dash Indicators
        renderDashes();
    }

    // --- Render các vạch Dash chuyển trang ở đáy ---
    function renderDashes() {
        const container = $('#svDashes');
        if (!container) return;
        container.innerHTML = '';

        SNEAKERS.forEach((_, idx) => {
            const dash = document.createElement('div');
            dash.className = `sv-dash ${idx === currentIndex ? 'is-active' : ''}`;
            dash.addEventListener('click', () => {
                if (idx !== currentIndex) {
                    currentIndex = idx;
                    updateSliderDisplay();
                }
            });
            container.appendChild(dash);
        });
    }

    // --- Chuyển chiếc giày kế tiếp / trước đó ---
    function nextSneaker() {
        currentIndex = (currentIndex + 1) % SNEAKERS.length;
        updateSliderDisplay();
    }

    function prevSneaker() {
        currentIndex = (currentIndex - 1 + SNEAKERS.length) % SNEAKERS.length;
        updateSliderDisplay();
    }

    // --- Hiệu ứng 3D Parallax khi di chuyển chuột qua lại ---
    function init3DParallax() {
        const stage = $('#svStage');
        const heroWrap = $('#svHeroWrap');
        if (!stage || !heroWrap) return;

        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        window.addEventListener('mousemove', (e) => {
            if (!isSliderView) return;
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            targetX = (e.clientX - cx) / cx;
            targetY = (e.clientY - cy) / cy;
        });

        function animateParallax() {
            mouseX += (targetX - mouseX) * 0.08;
            mouseY += (targetY - mouseY) * 0.08;

            if (isSliderView && heroWrap) {
                const rotX = -mouseY * 12;
                const rotY = mouseX * 18;
                const transX = mouseX * 15;
                const transY = mouseY * 10;
                heroWrap.style.transform = `translate3d(${transX}px, ${transY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            }

            requestAnimationFrame(animateParallax);
        }
        animateParallax();
    }

    // --- Thêm vào giỏ hàng ---
    function addToBag() {
        bagCount++;
        const badge = $('#svBagBadge');
        if (badge) {
            badge.textContent = bagCount;
            badge.style.transform = 'scale(1.4)';
            setTimeout(() => badge.style.transform = 'scale(1)', 250);
        }
        const snk = SNEAKERS[currentIndex];
        showToast(`Đã thêm ${snk.model} (${snk.colorway}) vào giỏ hàng!`);
    }

    function showToast(msg) {
        let toast = $('#svToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'svToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(30px);
                background: #FFFFFF;
                color: #000000;
                padding: 12px 26px;
                border-radius: 999px;
                font-weight: 800;
                font-size: 13px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                z-index: 999999;
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(30px)';
        }, 2200);
    }

    // --- Bind sự kiện nút bấm & Bàn phím ---
    function bindEvents() {
        const toggleBtn = $('#svToggleViewBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (isSliderView) closeSliderView();
                else openSliderView(currentIndex);
            });
        }

        const prevBtn = $('#svPrevBtn');
        const nextBtn = $('#svNextBtn');
        if (prevBtn) prevBtn.addEventListener('click', prevSneaker);
        if (nextBtn) nextBtn.addEventListener('click', nextSneaker);

        const addBagBtn = $('#svAddBagBtn');
        if (addBagBtn) addBagBtn.addEventListener('click', addToBag);

        // Bàn phím: Mũi tên trái / phải để lướt slider, Esc để về grid/showroom
        window.addEventListener('keydown', (e) => {
            const overlay = $('#hnmtSneakerOverlay');
            const isStandalone = document.body.classList.contains('is-sneaker-standalone');
            const isActive = isStandalone || (overlay && overlay.classList.contains('is-active'));
            if (!isActive) return;

            if (e.key === 'ArrowRight') nextSneaker();
            else if (e.key === 'ArrowLeft') prevSneaker();
            else if (e.key === 'Escape') {
                if (isSliderView) closeSliderView();
                else if (typeof window.closeSneakerShowcase === 'function') window.closeSneakerShowcase();
            }
        });
    }

    // --- Xuất các hàm điều khiển toàn cục cho Showroom 3D ---
    window.openSneakerShowcase = function () {
        const overlay = $('#hnmtSneakerOverlay');
        if (overlay) {
            overlay.classList.add('is-active');
            openSliderView(0); // Mở thẳng vào đôi đầu tiên cực kỳ hoành tráng
        }
    };

    window.closeSneakerShowcase = function () {
        const overlay = $('#hnmtSneakerOverlay');
        if (overlay) {
            overlay.classList.remove('is-active');
            closeSliderView();
        }
        const promptEl = document.querySelector('.hnmt-portal-footer');
        const portalHeaderEl = document.querySelector('.hnmt-portal-header');
        if (promptEl) promptEl.style.display = '';
        if (portalHeaderEl) portalHeaderEl.style.display = '';
    };

    // Tự khởi chạy an toàn
    function init() {
        renderGrid();
        bindEvents();
        init3DParallax();
        renderDashes();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
