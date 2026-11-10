/**
 * HNMTSHOP — FUTURIST SNEAKER VAULT (1:1 FIDELITY REPLICA OF FIGMA SNEAKER SLIDER)
 * Standardized 2D lateral profile view with smooth slide-in, giant typography, and color morphing.
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
            image: '/images/sneakers/air-future-iv.webp?v=center_h_v27'
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
            image: '/images/sneakers/air-future-xi.webp?v=center_h_v27'
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
            image: '/images/sneakers/air-future-iii.webp?v=center_h_v27'
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
            image: '/images/sneakers/air-future-v.webp?v=center_h_v27'
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
            image: '/images/sneakers/air-future-i.webp?v=center_h_v27'
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
            image: '/images/sneakers/air-future-ix.webp?v=center_h_v27'
        }
    ];

    let currentIndex = 0;
    let isSliderView = true;
    let bagCount = 0;
    let isAnimating = false;

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
            item.setAttribute('data-idx', String(idx));
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
            // Click trực tiếp vào item để mở chi tiết
            item.onclick = function (e) {
                e.stopPropagation();
                openSliderView(idx);
            };
            grid.appendChild(item);
        });
    }

    // --- Chuyển cảnh: Mở chi tiết Slider ---
    function openSliderView(idx) {
        currentIndex = idx;
        isSliderView = true;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const toggleBtn = $('#svToggleViewBtn');
        const app = $('#svApp');

        if (gridContainer) {
            gridContainer.classList.add('is-hidden');
        }
        if (sliderContainer) {
            sliderContainer.classList.add('is-active');
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-grid-3x3-gap"></i> <span>TẤT CẢ GIÀY</span>';
        }

        if (app) {
            app.classList.remove('is-grid-mode');
            app.style.backgroundImage = 'none';
        }

        updateSliderDisplay(0, true);
    }

    // --- Quay lại xem dạng lưới 6 đôi ---
    function closeSliderView() {
        isSliderView = false;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const app = $('#svApp');
        const toggleBtn = $('#svToggleViewBtn');

        if (sliderContainer) {
            sliderContainer.classList.remove('is-active');
        }
        if (gridContainer) {
            gridContainer.classList.remove('is-hidden');
        }

        // Áp dụng hình nền vân tối cao cấp từ bản thiết kế của người dùng
        if (app) {
            app.classList.add('is-grid-mode');
            app.style.backgroundImage = "url('/images/sneakers/sneaker-grid-bg.webp?v=bg_v1')";
            app.style.backgroundRepeat = 'no-repeat';
            app.style.backgroundPosition = 'center center';
            app.style.backgroundSize = 'cover';
            app.style.backgroundColor = '#0D0E12';
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
        }
    }

    // --- Cập nhật giao diện Slider với hiệu ứng Slide-In mượt mà (direction: +1 next, -1 prev) ---
    function updateSliderDisplay(direction = 1, immediate = false) {
        const snk = SNEAKERS[currentIndex];
        if (!snk) return;

        const app = $('#svApp');
        const giantTitle = $('#svGiantTitle');
        const heroImg = $('#svHeroImg');
        const heroShadow = $('#svHeroShadow');
        const specsPanel = $('.sv-specs-panel');
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

        if (immediate) {
            // Không tạo độ trễ khi mở lần đầu
            if (giantTitle) {
                giantTitle.textContent = snk.model;
                giantTitle.style.opacity = '0.94';
                giantTitle.style.transform = 'translate(0, 0)';
            }
            if (heroImg) {
                heroImg.src = snk.image;
                heroImg.alt = snk.model;
                heroImg.style.opacity = '1';
                heroImg.style.transform = 'translate(0, 0) scale(1) rotate(-15deg)';
            }
            if (heroShadow) {
                heroShadow.style.opacity = '1';
                heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(1)';
            }
            if (specsPanel) {
                specsPanel.style.opacity = '1';
                specsPanel.style.transform = 'translate(0, 0)';
            }
        } else {
            // Hiệu ứng Slide-In 2D mượt mà chuẩn Smart Animate (Giữ góc nghiêng -15deg vừa vặn)
            const slideOffset = direction > 0 ? 80 : -80;

            if (giantTitle) {
                giantTitle.style.opacity = '0';
                giantTitle.style.transform = `translateY(30px)`;
            }
            if (heroImg) {
                heroImg.style.opacity = '0';
                heroImg.style.transform = `translateX(${slideOffset}px) scale(0.92) rotate(-15deg)`;
            }
            if (heroShadow) {
                heroShadow.style.opacity = '0';
                heroShadow.style.transform = `translateX(-50%) rotate(-10deg) scale(0.8)`;
            }
            if (specsPanel) {
                specsPanel.style.opacity = '0';
                specsPanel.style.transform = `translateY(15px)`;
            }

            setTimeout(() => {
                if (giantTitle) {
                    giantTitle.textContent = snk.model;
                    giantTitle.style.opacity = '0.94';
                    giantTitle.style.transform = 'translate(0, 0)';
                }
                if (heroImg) {
                    heroImg.src = snk.image;
                    heroImg.alt = snk.model;
                    heroImg.style.opacity = '1';
                    heroImg.style.transform = 'translate(0, 0) scale(1) rotate(-15deg)';
                }
                if (heroShadow) {
                    heroShadow.style.opacity = '1';
                    heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(1)';
                }
                if (specsPanel) {
                    specsPanel.style.opacity = '1';
                    specsPanel.style.transform = 'translate(0, 0)';
                }
            }, 180);
        }

        // Cập nhật thông số kỹ thuật Tech Specs
        if (colorwayName) colorwayName.textContent = snk.colorway;
        if (styleCode) styleCode.textContent = snk.styleCode;
        if (price) price.textContent = formatPrice(snk.price);
        if (colorName) colorName.textContent = snk.colorName;
        if (designer) designer.textContent = snk.designer;
        if (release) release.textContent = snk.release;

        // Đảm bảo nhãn luôn luôn hiển thị tiếng Việt chuẩn xác
        localizeAllLabels();

        // Chấm màu Swatches: Chọn màu trực tiếp chuyển ngay sang đôi giày và màu nền tương ứng
        if (swatchesContainer) {
            swatchesContainer.innerHTML = '';
            SNEAKERS.forEach((snkItem, i) => {
                const dot = document.createElement('span');
                dot.className = `sv-color-dot ${i === currentIndex ? 'is-active' : ''}`;
                dot.style.backgroundColor = snkItem.themeColor;
                dot.title = `${snkItem.model} — ${snkItem.colorway}`;
                dot.onclick = (e) => {
                    e.stopPropagation();
                    if (i !== currentIndex) {
                        const dir = i > currentIndex ? 1 : -1;
                        currentIndex = i;
                        updateSliderDisplay(dir);
                    }
                };
                swatchesContainer.appendChild(dot);
            });
        }

        // Cập nhật vạch Dash Indicators
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
            dash.onclick = () => {
                if (idx !== currentIndex) {
                    const dir = idx > currentIndex ? 1 : -1;
                    currentIndex = idx;
                    updateSliderDisplay(dir);
                }
            };
            container.appendChild(dash);
        });
    }

    // --- Chuyển chiếc giày kế tiếp / trước đó ---
    function nextSneaker() {
        currentIndex = (currentIndex + 1) % SNEAKERS.length;
        updateSliderDisplay(1);
    }

    function prevSneaker() {
        currentIndex = (currentIndex - 1 + SNEAKERS.length) % SNEAKERS.length;
        updateSliderDisplay(-1);
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
            toggleBtn.onclick = () => {
                if (isSliderView) closeSliderView();
                else openSliderView(currentIndex);
            };
        }

        const prevBtn = $('#svPrevBtn');
        const nextBtn = $('#svNextBtn');
        if (prevBtn) prevBtn.onclick = prevSneaker;
        if (nextBtn) nextBtn.onclick = nextSneaker;

        const addBagBtn = $('#svAddBagBtn');
        if (addBagBtn) addBagBtn.onclick = addToBag;

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
            localizeAllLabels();
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

    function localizeAllLabels() {
        const exitBtns = document.querySelectorAll('.sv-exit-btn');
        exitBtns.forEach(btn => {
            const span = btn.querySelector('span');
            if (span) span.textContent = 'Quay lại';
        });

        // Việt hóa nhãn thông số kỹ thuật
        const specGrids = document.querySelectorAll('.sv-spec-grid');
        specGrids.forEach(grid => {
            const dts = grid.querySelectorAll('dt');
            if (dts.length >= 4) {
                dts[0].textContent = 'MÃ GIÀY:';
                dts[1].textContent = 'PHỐI MÀU:';
                dts[2].textContent = 'THIẾT KẾ:';
                dts[3].textContent = 'GIÁ BÁN:';
            }
        });

        // Việt hóa nhãn chọn màu
        const swatchesLabels = document.querySelectorAll('.sv-swatches-label');
        swatchesLabels.forEach(lbl => {
            lbl.textContent = 'CHỌN MÀU';
        });

        // Việt hóa nút thêm giỏ
        const addBagBtns = document.querySelectorAll('.sv-add-bag-btn span');
        addBagBtns.forEach(span => {
            span.textContent = 'THÊM VÀO GIỎ';
        });
    }

    // Tự khởi chạy an toàn
    function init() {
        localizeAllLabels();
        renderGrid();
        bindEvents();
        renderDashes();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
