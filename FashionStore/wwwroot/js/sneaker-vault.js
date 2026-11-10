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
    let isTransitioning = false;

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
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Xem chi tiết ${snk.model} - ${snk.colorway}`);
            item.innerHTML = `
                <div class="sv-item-image-wrap">
                    <img src="${snk.image}" alt="${snk.model}" class="sv-item-img" />
                    <div class="sv-item-shadow"></div>
                </div>
            `;
            // Click trực tiếp vào đôi giày để kích hoạt hiệu ứng FLIP mở chi tiết
            item.onclick = function (e) {
                e.stopPropagation();
                openSliderView(idx);
            };
            grid.appendChild(item);
        });
    }

    // --- Chuyển cảnh Shared-Element FLIP: Mở chi tiết Slider từ một đôi giày bất kỳ ---
    function openSliderView(idx) {
        if (isTransitioning) return;

        // Nếu đã ở trong Slider View rồi thì chỉ trượt slide sang đôi giày tương ứng
        if (isSliderView && currentIndex === idx) return;
        if (isSliderView) {
            const dir = idx > currentIndex ? 1 : -1;
            currentIndex = idx;
            updateSliderDisplay(dir);
            return;
        }

        isTransitioning = true;
        currentIndex = idx;
        isSliderView = true;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const toggleBtn = $('#svToggleViewBtn');
        const app = $('#svApp');
        const heroImg = $('#svHeroImg');
        const heroShadow = $('#svHeroShadow');
        const giantTitle = $('#svGiantTitle');
        const specsPanel = $('.sv-specs-panel');
        const controlsPanel = $('.sv-controls-panel');

        const snk = SNEAKERS[currentIndex];
        if (!snk) {
            isTransitioning = false;
            return;
        }

        // 1. Tìm phần tử đôi giày vừa được bấm trong Grid
        const gridItems = $$('.sv-grid-item');
        const clickedItem = gridItems[idx];
        const clickedImg = clickedItem ? clickedItem.querySelector('.sv-item-img') : null;
        const clickedShadow = clickedItem ? clickedItem.querySelector('.sv-item-shadow') : null;

        // 2. Đo vị trí FIRST (Bounding Rect trong Grid)
        let startRect = null;
        if (clickedImg) {
            startRect = clickedImg.getBoundingClientRect();
        }

        // 3. Hiệu ứng các đôi giày còn lại: mờ dần và thu nhỏ nhẹ
        gridItems.forEach((item, i) => {
            if (i !== idx) {
                item.classList.add('is-fading-out');
            }
        });

        // 4. Mở Slider View (LAST state)
        if (sliderContainer) {
            sliderContainer.classList.add('is-active');
            sliderContainer.style.opacity = '1';
        }

        // Cập nhật thông số kỹ thuật, màu nền, các chấm màu
        updateSliderDataOnly(snk);

        // Ẩn tạm thời typography, specs, controls và hero shadow để chuẩn bị hiệu ứng bay vào
        if (giantTitle) {
            giantTitle.textContent = snk.model;
            giantTitle.style.transition = 'none';
            giantTitle.style.opacity = '0';
            giantTitle.style.transform = 'scale(0.84)';
        }
        if (specsPanel) {
            specsPanel.style.transition = 'none';
            specsPanel.style.opacity = '0';
            specsPanel.style.transform = 'translateY(24px)';
        }
        if (controlsPanel) {
            controlsPanel.style.transition = 'none';
            controlsPanel.style.opacity = '0';
            controlsPanel.style.transform = 'translateY(24px)';
        }
        if (heroShadow) {
            heroShadow.style.transition = 'none';
            heroShadow.style.opacity = '0';
            heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.4)';
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-grid-3x3-gap"></i> <span>TẤT CẢ GIÀY</span>';
        }

        // 5. Tính toán FLIP cho Hero Image
        if (heroImg && startRect) {
            heroImg.classList.remove('is-floating');
            heroImg.src = snk.image;
            heroImg.alt = snk.model;
            heroImg.style.transition = 'none';
            heroImg.style.opacity = '1';
            heroImg.style.transformOrigin = 'center center';
            heroImg.style.transform = 'translate(0px, 0px) scale(1) rotate(-15deg)';

            // Đo vị trí LAST của heroImg khi nằm ở trung tâm
            const destRect = heroImg.getBoundingClientRect();

            const startCenterX = startRect.left + startRect.width / 2;
            const startCenterY = startRect.top + startRect.height / 2;
            const destCenterX = destRect.left + destRect.width / 2;
            const destCenterY = destRect.top + destRect.height / 2;

            const deltaX = startCenterX - destCenterX;
            const deltaY = startCenterY - destCenterY;
            const scale = startRect.width / destRect.width;

            // INVERT: Đưa heroImg đến đúng tọa độ, kích thước và góc nghiêng của đôi giày trong Grid
            heroImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(-15deg)`;

            // Ẩn ảnh trong grid để không bị chồng bóng ma
            if (clickedImg) clickedImg.style.visibility = 'hidden';
            if (clickedShadow) clickedShadow.style.opacity = '0';

            // Ép browser reflow để ghi nhận trạng thái Invert
            void heroImg.offsetWidth;

            // PLAY: Kích hoạt transition đưa giày từ vị trí Grid bay vào trung tâm hoành tráng
            heroImg.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease';
            heroImg.style.transform = 'translate(0px, 0px) scale(1) rotate(-15deg)';

            // Cross-fade nền từ texture tối sang theme color của giày
            if (app) {
                app.classList.remove('is-grid-mode');
                app.style.backgroundColor = snk.themeColor;
            }

            // Stagger các thành phần chữ, specs và controls hiện dần ra
            setTimeout(() => {
                if (giantTitle) {
                    giantTitle.style.transition = 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.42s ease';
                    giantTitle.style.opacity = '0.94';
                    giantTitle.style.transform = 'scale(1)';
                }
                if (specsPanel) {
                    specsPanel.style.transition = 'transform 0.46s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.38s ease';
                    specsPanel.style.opacity = '1';
                    specsPanel.style.transform = 'translate(0, 0)';
                }
                if (controlsPanel) {
                    controlsPanel.style.transition = 'transform 0.46s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.38s ease';
                    controlsPanel.style.opacity = '1';
                    controlsPanel.style.transform = 'translate(0, 0)';
                }
                if (heroShadow) {
                    heroShadow.style.transition = 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.42s ease';
                    heroShadow.style.opacity = '1';
                    heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(1)';
                }
            }, 160);

            // Khi hoàn thành chuyến bay (560ms)
            setTimeout(() => {
                if (gridContainer) gridContainer.classList.add('is-hidden');
                gridItems.forEach(it => it.classList.remove('is-fading-out'));
                if (clickedImg) clickedImg.style.visibility = '';
                if (clickedShadow) clickedShadow.style.opacity = '';

                heroImg.classList.add('is-floating');
                isTransitioning = false;
            }, 560);
        } else {
            // Fallback an toàn nếu trình duyệt chưa kịp render startRect
            if (gridContainer) gridContainer.classList.add('is-hidden');
            if (app) {
                app.classList.remove('is-grid-mode');
                app.style.backgroundColor = snk.themeColor;
            }
            updateSliderDisplay(0, true);
            isTransitioning = false;
        }
    }

    // --- Chuyển cảnh Reverse FLIP: Thu nhỏ và bay chiếc giày trở về ô trong Grid ---
    function closeSliderView() {
        if (isTransitioning) return;
        isTransitioning = true;
        isSliderView = false;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const app = $('#svApp');
        const toggleBtn = $('#svToggleViewBtn');
        const heroImg = $('#svHeroImg');
        const heroShadow = $('#svHeroShadow');
        const giantTitle = $('#svGiantTitle');
        const specsPanel = $('.sv-specs-panel');
        const controlsPanel = $('.sv-controls-panel');

        // 1. Dừng ambient floating
        if (heroImg) {
            heroImg.classList.remove('is-floating');
        }

        // 2. Mở lại grid container bên dưới để đo vị trí chính xác
        if (gridContainer) {
            gridContainer.classList.remove('is-hidden');
        }

        const gridItems = $$('.sv-grid-item');
        const targetItem = gridItems[currentIndex] || gridItems[0];
        const targetImg = targetItem ? targetItem.querySelector('.sv-item-img') : null;
        const targetShadow = targetItem ? targetItem.querySelector('.sv-item-shadow') : null;

        // Giữ 5 đôi giày khác mờ nhẹ trong lúc chiếc hero chuẩn bị đáp xuống
        gridItems.forEach((it, i) => {
            if (i !== currentIndex) {
                it.classList.add('is-fading-out');
            }
        });

        if (targetImg) targetImg.style.visibility = 'hidden';
        if (targetShadow) targetShadow.style.opacity = '0';

        // 3. Fade out typography, specs, controls
        if (giantTitle) {
            giantTitle.style.transition = 'transform 0.3s ease, opacity 0.25s ease';
            giantTitle.style.opacity = '0';
            giantTitle.style.transform = 'scale(0.88)';
        }
        if (specsPanel) {
            specsPanel.style.transition = 'transform 0.28s ease, opacity 0.24s ease';
            specsPanel.style.opacity = '0';
            specsPanel.style.transform = 'translateY(18px)';
        }
        if (controlsPanel) {
            controlsPanel.style.transition = 'transform 0.28s ease, opacity 0.24s ease';
            controlsPanel.style.opacity = '0';
            controlsPanel.style.transform = 'translateY(18px)';
        }
        if (heroShadow) {
            heroShadow.style.transition = 'opacity 0.24s ease, transform 0.24s ease';
            heroShadow.style.opacity = '0';
            heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.4)';
        }

        // 4. Crossfade background về hình nền vân bê tông tối cao cấp
        if (app) {
            app.classList.add('is-grid-mode');
            app.style.backgroundColor = '#0D0E12';
        }

        // 5. Tính toán FLIP từ heroImg về vị trí của targetImg trong grid
        if (heroImg && targetImg) {
            const heroRect = heroImg.getBoundingClientRect();
            const targetRect = targetImg.getBoundingClientRect();

            const heroCenterX = heroRect.left + heroRect.width / 2;
            const heroCenterY = heroRect.top + heroRect.height / 2;
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;

            const deltaX = targetCenterX - heroCenterX;
            const deltaY = targetCenterY - heroCenterY;
            const scale = targetRect.width / heroRect.width;

            heroImg.style.transition = 'transform 0.48s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.38s ease';
            heroImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(-15deg)`;

            // Fade in lại 5 đôi giày còn lại
            setTimeout(() => {
                gridItems.forEach(it => it.classList.remove('is-fading-out'));
            }, 120);

            // Khi đôi giày đã đáp gọn vào ô grid (490ms)
            setTimeout(() => {
                if (targetImg) targetImg.style.visibility = '';
                if (targetShadow) targetShadow.style.opacity = '';

                if (sliderContainer) {
                    sliderContainer.classList.remove('is-active');
                }

                heroImg.style.transition = 'none';
                heroImg.style.transform = 'translate(0px, 0px) scale(1) rotate(-15deg)';

                if (toggleBtn) {
                    toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
                }

                isTransitioning = false;
            }, 490);
        } else {
            if (sliderContainer) sliderContainer.classList.remove('is-active');
            gridItems.forEach(it => it.classList.remove('is-fading-out'));
            if (targetImg) targetImg.style.visibility = '';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
            isTransitioning = false;
        }
    }

    // --- Cập nhật dữ liệu thông số Tech Specs & Swatches (không làm gián đoạn FLIP) ---
    function updateSliderDataOnly(snk) {
        const colorwayName = $('#svColorwayName');
        const styleCode = $('#svStyleCode');
        const price = $('#svPrice');
        const colorName = $('#svColorName');
        const designer = $('#svDesigner');
        const release = $('#svRelease');
        const swatchesContainer = $('#svSwatches');

        if (colorwayName) colorwayName.textContent = snk.colorway;
        if (styleCode) styleCode.textContent = snk.styleCode;
        if (price) price.textContent = formatPrice(snk.price);
        if (colorName) colorName.textContent = snk.colorName;
        if (designer) designer.textContent = snk.designer;
        if (release) release.textContent = snk.release;

        localizeAllLabels();

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

        // 1. Đổi màu nền mượt mà
        if (app) {
            app.style.backgroundColor = snk.themeColor;
        }

        if (immediate) {
            if (giantTitle) {
                giantTitle.textContent = snk.model;
                giantTitle.style.opacity = '0.94';
                giantTitle.style.transform = 'scale(1)';
            }
            if (heroImg) {
                heroImg.classList.remove('is-floating');
                heroImg.src = snk.image;
                heroImg.alt = snk.model;
                heroImg.style.opacity = '1';
                heroImg.style.transform = 'translate(0, 0) scale(1) rotate(-15deg)';
                setTimeout(() => heroImg.classList.add('is-floating'), 300);
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
            // Hiệu ứng Slide-In 2D mượt mà chuẩn Smart Animate
            const slideOffset = direction > 0 ? 80 : -80;

            if (giantTitle) {
                giantTitle.style.opacity = '0';
                giantTitle.style.transform = 'scale(0.9)';
            }
            if (heroImg) {
                heroImg.classList.remove('is-floating');
                heroImg.style.opacity = '0';
                heroImg.style.transform = `translateX(${slideOffset}px) scale(0.92) rotate(-15deg)`;
            }
            if (heroShadow) {
                heroShadow.style.opacity = '0';
                heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.8)';
            }
            if (specsPanel) {
                specsPanel.style.opacity = '0';
                specsPanel.style.transform = 'translateY(15px)';
            }

            setTimeout(() => {
                if (giantTitle) {
                    giantTitle.textContent = snk.model;
                    giantTitle.style.opacity = '0.94';
                    giantTitle.style.transform = 'scale(1)';
                }
                if (heroImg) {
                    heroImg.src = snk.image;
                    heroImg.alt = snk.model;
                    heroImg.style.opacity = '1';
                    heroImg.style.transform = 'translate(0, 0) scale(1) rotate(-15deg)';
                    setTimeout(() => heroImg.classList.add('is-floating'), 400);
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

        // Cập nhật thông số kỹ thuật Tech Specs & Swatches
        updateSliderDataOnly(snk);

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

        const heroImg = $('#svHeroImg');
        const sliderContainer = $('#svSliderContainer');
        if (sliderContainer && sliderContainer.classList.contains('is-active') && heroImg) {
            heroImg.classList.add('is-floating');
            updateSliderDataOnly(SNEAKERS[currentIndex]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
