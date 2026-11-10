/**
 * HNMTSHOP — FUTURIST SNEAKER VAULT (1:1 FIDELITY REPLICA OF FIGMA SNEAKER SLIDER)
 * Standardized 2D lateral profile view with smooth slide-in, giant typography, and color morphing.
 */

(function () {
    'use strict';

    // --- CÁC BỘ SƯU TẬP GIÀY (SNEAKER COLLECTIONS) CÓ THỂ ĐỔI QUA LẠI BẰNG NÚT BẤM ---
    const SNEAKER_COLLECTIONS = [
        {
            id: 'futurist',
            title: 'FUTURIST SNEAKER VAULT',
            items: [
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
            ]
        },
        {
            id: 'cyber',
            title: 'CYBER VAULT',
            items: [
                {
                    id: 'cp-01',
                    model: 'CYBER IV',
                    colorway: 'CYBER TEAL',
                    themeColor: '#00838F',
                    accentColor: '#00E5FF',
                    price: 5400000,
                    styleCode: 'CP-04-TEAL',
                    designer: 'HNMTSHOP × CYBER LAB',
                    release: 'JUNE 2027',
                    colorName: 'STEALTH WHITE / ELECTRIC TEAL',
                    swatches: ['#FFFFFF', '#00E5FF', '#1F2024'],
                    image: '/images/sneakers/cyber/cyber-air-future-iv.webp?v=c2_v1'
                },
                {
                    id: 'cp-02',
                    model: 'CYBER XI',
                    colorway: 'NEON MAGENTA',
                    themeColor: '#AD1457',
                    accentColor: '#FF007F',
                    price: 5700000,
                    styleCode: 'CP-11-MAGENTA',
                    designer: 'HNMTSHOP × CYBER LAB',
                    release: 'JULY 2027',
                    colorName: 'FROST WHITE / NEON PINK',
                    swatches: ['#FFFFFF', '#AD1457', '#FF007F'],
                    image: '/images/sneakers/cyber/cyber-air-future-xi.webp?v=c2_v1'
                },
                {
                    id: 'cp-03',
                    model: 'CYBER III',
                    colorway: 'SOLAR FLARE',
                    themeColor: '#E65100',
                    accentColor: '#FFB300',
                    price: 5100000,
                    styleCode: 'CP-03-SOLAR',
                    designer: 'HNMTSHOP × CYBER LAB',
                    release: 'AUGUST 2027',
                    colorName: 'TITANIUM / SOLAR AMBER',
                    swatches: ['#FFFFFF', '#E65100', '#FFB300'],
                    image: '/images/sneakers/cyber/cyber-air-future-iii.webp?v=c2_v1'
                },
                {
                    id: 'cp-04',
                    model: 'CYBER V',
                    colorway: 'TACTICAL OLIVE',
                    themeColor: '#33691E',
                    accentColor: '#C0CA33',
                    price: 5900000,
                    styleCode: 'CP-05-OLIVE',
                    designer: 'HNMTSHOP × CYBER LAB',
                    release: 'SEPTEMBER 2027',
                    colorName: 'MILITARY OLIVE / GOLD LIGHT',
                    swatches: ['#33691E', '#C0CA33', '#1B1C20'],
                    image: '/images/sneakers/cyber/cyber-air-future-v.webp?v=c2_v1'
                },
                {
                    id: 'cp-05',
                    model: 'CYBER I',
                    colorway: 'GLACIER FROST',
                    themeColor: '#1565C0',
                    accentColor: '#80D8FF',
                    price: 6400000,
                    styleCode: 'CP-01-GLACIER',
                    designer: 'HNMTSHOP × CYBER LAB',
                    release: 'OCTOBER 2027',
                    colorName: 'ICE BLUE / POLAR CHROME',
                    swatches: ['#E1F5FE', '#1565C0', '#80D8FF'],
                    image: '/images/sneakers/cyber/cyber-air-future-i.webp?v=c2_v1'
                },
                {
                    id: 'cp-06',
                    model: 'CYBER IX',
                    colorway: 'MATRIX EMERALD',
                    themeColor: '#004D40',
                    accentColor: '#00E676',
                    price: 6700000,
                    styleCode: 'CP-09-MATRIX',
                    designer: 'HNMTSHOP × CYBER LAB',
                    release: 'NOVEMBER 2027',
                    colorName: 'CARBON BLACK / MATRIX NEON',
                    swatches: ['#00E676', '#004D40', '#0D0E12'],
                    image: '/images/sneakers/cyber/cyber-air-future-ix.webp?v=c2_v1'
                }
            ]
        },
        {
            id: 'chile20',
            title: 'CHILE 20 VAULT',
            items: [
                {
                    id: 'ch-01',
                    model: 'CHILE 20 IV',
                    colorway: 'ROYAL VIOLET',
                    themeColor: '#4A148C',
                    accentColor: '#9C27B0',
                    price: 5600000,
                    styleCode: 'CH-04-VIOLET',
                    designer: 'HNMTSHOP × CHILE 20',
                    release: 'DECEMBER 2027',
                    colorName: 'METALLIC / ROYAL PURPLE',
                    swatches: ['#FFFFFF', '#4A148C', '#9C27B0'],
                    image: '/images/sneakers/chile20/chile-air-future-iv.webp?v=c3_v1'
                },
                {
                    id: 'ch-02',
                    model: 'CHILE 20 XI',
                    colorway: 'IMPERIAL GOLD',
                    themeColor: '#B78103',
                    accentColor: '#FFD700',
                    price: 5800000,
                    styleCode: 'CH-11-GOLD',
                    designer: 'HNMTSHOP × CHILE 20',
                    release: 'JANUARY 2028',
                    colorName: 'PURE WHITE / IMPERIAL GOLD',
                    swatches: ['#FFFFFF', '#B78103', '#FFD700'],
                    image: '/images/sneakers/chile20/chile-air-future-xi.webp?v=c3_v1'
                },
                {
                    id: 'ch-03',
                    model: 'CHILE 20 III',
                    colorway: 'CRIMSON FURY',
                    themeColor: '#B71C1C',
                    accentColor: '#FF1744',
                    price: 5300000,
                    styleCode: 'CH-03-FURY',
                    designer: 'HNMTSHOP × CHILE 20',
                    release: 'FEBRUARY 2028',
                    colorName: 'CHILE RED / AIR FURY',
                    swatches: ['#FFFFFF', '#B71C1C', '#FF1744'],
                    image: '/images/sneakers/chile20/chile-air-future-iii.webp?v=c3_v1'
                },
                {
                    id: 'ch-04',
                    model: 'CHILE 20 V',
                    colorway: 'DEEP TURQUOISE',
                    themeColor: '#00695C',
                    accentColor: '#1DE9B6',
                    price: 6100000,
                    styleCode: 'CH-05-TURQUOISE',
                    designer: 'HNMTSHOP × CHILE 20',
                    release: 'MARCH 2028',
                    colorName: 'ATLANTIS / TURQUOISE CHROME',
                    swatches: ['#00695C', '#1DE9B6', '#1A1C20'],
                    image: '/images/sneakers/chile20/chile-air-future-v.webp?v=c3_v1'
                },
                {
                    id: 'ch-05',
                    model: 'CHILE 20 I',
                    colorway: 'SUNSET CLAY',
                    themeColor: '#BF360C',
                    accentColor: '#FF6E40',
                    price: 6500000,
                    styleCode: 'CH-01-SUNSET',
                    designer: 'HNMTSHOP × CHILE 20',
                    release: 'APRIL 2028',
                    colorName: 'TERRACOTTA / SUNSET GOLD',
                    swatches: ['#FFCCBC', '#BF360C', '#FF6E40'],
                    image: '/images/sneakers/chile20/chile-air-future-i.webp?v=c3_v1'
                },
                {
                    id: 'ch-06',
                    model: 'CHILE 20 IX',
                    colorway: 'COBALT LASER',
                    themeColor: '#0D47A1',
                    accentColor: '#2979FF',
                    price: 6900000,
                    styleCode: 'CH-09-COBALT',
                    designer: 'HNMTSHOP × CHILE 20',
                    release: 'MAY 2028',
                    colorName: 'DEEP CARBON / COBALT LASER',
                    swatches: ['#2979FF', '#0D47A1', '#0A0A0D'],
                    image: '/images/sneakers/chile20/chile-air-future-ix.webp?v=c3_v1'
                }
            ]
        }
    ];

    let currentCollectionIndex = 0;
    const getSneakers = () => SNEAKER_COLLECTIONS[currentCollectionIndex].items;
    const getActiveCollection = () => SNEAKER_COLLECTIONS[currentCollectionIndex];

    let currentIndex = 0;
    let isSliderView = false;
    let bagCount = 0;
    let isAnimating = false;
    let isTransitioning = false;

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    function formatPrice(num) {
        return num.toLocaleString('vi-VN') + ' ₫';
    }

    // --- Đảm bảo thanh chuyển đổi bộ sưu tập (Vault Switcher) luôn hiện diện 100% trên DOM ---
    function ensureVaultSwitcherInDOM() {
        const headerLefts = document.querySelectorAll('.sv-header-left');
        headerLefts.forEach(headerLeft => {
            let switcher = headerLeft.querySelector('.sv-vault-switcher');
            const titleEl = headerLeft.querySelector('.sv-header-title');

            if (!switcher) {
                switcher = document.createElement('div');
                switcher.className = 'sv-vault-switcher';
                switcher.id = 'svVaultSwitcher';

                const prevBtn = document.createElement('button');
                prevBtn.type = 'button';
                prevBtn.className = 'sv-vault-arrow';
                prevBtn.id = 'svPrevCollectionBtn';
                prevBtn.setAttribute('aria-label', 'Bộ giày trước');
                prevBtn.setAttribute('title', 'Bộ sưu tập trước');
                prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

                const colTitle = document.createElement('span');
                colTitle.className = 'sv-header-title';
                colTitle.id = 'svCollectionTitle';
                colTitle.textContent = getActiveCollection().title;

                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.className = 'sv-vault-arrow';
                nextBtn.id = 'svNextCollectionBtn';
                nextBtn.setAttribute('aria-label', 'Bộ giày kế tiếp');
                nextBtn.setAttribute('title', 'Bộ sưu tập kế tiếp');
                nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

                switcher.appendChild(prevBtn);
                switcher.appendChild(colTitle);
                switcher.appendChild(nextBtn);

                if (titleEl) {
                    titleEl.replaceWith(switcher);
                } else {
                    headerLeft.appendChild(switcher);
                }

                prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    changeCollection(-1);
                };
                nextBtn.onclick = (e) => {
                    e.stopPropagation();
                    changeCollection(1);
                };
            } else {
                const prevBtn = switcher.querySelector('.sv-vault-arrow:first-child, #svPrevCollectionBtn');
                const nextBtn = switcher.querySelector('.sv-vault-arrow:last-child, #svNextCollectionBtn');
                const colTitle = switcher.querySelector('#svCollectionTitle, .sv-header-title');
                switcher.querySelectorAll('.sv-vault-badge, #svCollectionBadge').forEach(el => el.remove());

                if (colTitle) colTitle.textContent = getActiveCollection().title;

                if (prevBtn) {
                    prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
                    prevBtn.onclick = (e) => {
                        e.stopPropagation();
                        changeCollection(-1);
                    };
                }
                if (nextBtn) {
                    nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
                    nextBtn.onclick = (e) => {
                        e.stopPropagation();
                        changeCollection(1);
                    };
                }
            }
        });
    }

    // --- Đổi bộ sưu tập giày (Switch Sneaker Collection / Vault) ---
    function changeCollection(direction = 1) {
        if (isTransitioning) return;

        currentCollectionIndex = (currentCollectionIndex + direction + SNEAKER_COLLECTIONS.length) % SNEAKER_COLLECTIONS.length;
        const col = getActiveCollection();

        // Cập nhật tiêu đề bộ sưu tập với hiệu ứng chuyển động mượt mà
        const titleEls = document.querySelectorAll('#svCollectionTitle, .sv-header-title');
        titleEls.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = direction > 0 ? 'translateX(12px)' : 'translateX(-12px)';
            setTimeout(() => {
                el.textContent = col.title;
                el.style.opacity = '1';
                el.style.transform = 'translateX(0)';
            }, 180);
        });

        // Bỏ hiển thị số thứ tự bộ sưu tập theo yêu cầu của user
        document.querySelectorAll('#svCollectionBadge, .sv-vault-badge').forEach(b => b.remove());

        const activeSneakers = getSneakers();
        if (currentIndex >= activeSneakers.length) {
            currentIndex = 0;
        }

        if (!isSliderView) {
            // Chế độ Grid: Mờ nhẹ các đôi cũ, đổi dữ liệu và stagger xuất hiện các đôi mới
            const items = $$('.sv-grid-item');
            items.forEach(it => {
                it.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                it.style.opacity = '0';
                it.style.transform = 'scale(0.88)';
            });

            setTimeout(() => {
                renderGrid();
                const newItems = $$('.sv-grid-item');
                newItems.forEach((it, i) => {
                    it.style.opacity = '0';
                    it.style.transform = 'scale(0.88)';
                    setTimeout(() => {
                        it.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                        it.style.opacity = '1';
                        it.style.transform = 'scale(1)';
                    }, i * 45);
                });
            }, 260);
        } else {
            // Chế độ Slider 3D: Cập nhật sang đôi giày tương ứng trong bộ sưu tập mới VÀ đồng thời cập nhật Grid bên dưới
            renderGrid();
            updateSliderDisplay(direction);
        }
    }

    // --- Khởi tạo lưới 6 đôi ban đầu (Grid Overview) ---
    function renderGrid() {
        const grid = $('#svGrid');
        if (!grid) return;
        grid.innerHTML = '';
        grid.setAttribute('data-collection', String(currentCollectionIndex));

        getSneakers().forEach((snk, idx) => {
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

        const snk = getSneakers()[currentIndex];
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
            setGiantTitleText(snk.model);
            giantTitle.style.transition = 'none';
            giantTitle.style.opacity = '0';
            giantTitle.style.transform = 'scale(0.82)';
        }
        if (specsPanel) {
            specsPanel.style.transition = 'none';
            specsPanel.style.opacity = '0';
            specsPanel.style.transform = 'translateY(28px)';
        }
        if (controlsPanel) {
            controlsPanel.style.transition = 'none';
            controlsPanel.style.opacity = '0';
            controlsPanel.style.transform = 'translateY(28px)';
        }
        if (heroShadow) {
            heroShadow.style.transition = 'none';
            heroShadow.style.opacity = '0';
            heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.35)';
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-grid-3x3-gap"></i> <span>TẤT CẢ GIÀY</span>';
        }

        // 5. Tính toán FLIP cho Hero Image với chuyển động bay chậm rãi, điện ảnh
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

            // PLAY: Kích hoạt transition đưa giày từ vị trí Grid bay vào trung tâm chậm rãi (0.92s) cực mượt mà
            heroImg.style.transition = 'transform 0.92s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease';
            heroImg.style.transform = 'translate(0px, 0px) scale(1) rotate(-15deg)';

            // Cross-fade nền từ texture tối sang theme color của giày chậm rãi hòa quyện (0.92s)
            if (app) {
                app.classList.remove('is-grid-mode');
                app.style.backgroundColor = snk.themeColor;
            }

            // Stagger các thành phần chữ, specs và controls hiện dần ra sau 320ms
            setTimeout(() => {
                if (giantTitle) {
                    giantTitle.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease';
                    giantTitle.style.opacity = '0.94';
                    giantTitle.style.transform = 'scale(1)';
                }
                if (specsPanel) {
                    specsPanel.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
                    specsPanel.style.opacity = '1';
                    specsPanel.style.transform = 'translate(0, 0)';
                }
                if (controlsPanel) {
                    controlsPanel.style.transition = 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
                    controlsPanel.style.opacity = '1';
                    controlsPanel.style.transform = 'translate(0, 0)';
                }
                if (heroShadow) {
                    heroShadow.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease';
                    heroShadow.style.opacity = '1';
                    heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(1)';
                }
            }, 320);

            // Khi hoàn thành chuyến bay (930ms)
            setTimeout(() => {
                if (gridContainer) gridContainer.classList.add('is-hidden');
                gridItems.forEach(it => it.classList.remove('is-fading-out'));
                if (clickedImg) clickedImg.style.visibility = '';
                if (clickedShadow) clickedShadow.style.opacity = '';

                heroImg.classList.add('is-floating');
                isTransitioning = false;
            }, 930);
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

    // --- Chuyển cảnh Reverse FLIP: Thu nhỏ và bay chiếc giày trở về ô trong Grid (chậm rãi, êm ái) ---
    function closeSliderView(immediate = false) {
        if (isTransitioning) return;
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
        const gridItems = $$('.sv-grid-item');

        // 1. Dừng ambient floating
        if (heroImg) {
            heroImg.classList.remove('is-floating');
        }

        // Nếu chuyển đổi ngay lập tức (ví dụ khi mở lần đầu)
        if (immediate) {
            if (sliderContainer) sliderContainer.classList.remove('is-active');
            if (gridContainer) gridContainer.classList.remove('is-hidden');
            if (app) {
                app.classList.add('is-grid-mode');
                app.style.backgroundColor = '#0D0E12';
            }
            gridItems.forEach(it => {
                it.classList.remove('is-fading-out');
                const img = it.querySelector('.sv-item-img');
                const shadow = it.querySelector('.sv-item-shadow');
                if (img) img.style.visibility = '';
                if (shadow) shadow.style.opacity = '';
            });
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
            }
            isTransitioning = false;
            return;
        }

        isTransitioning = true;

        // 2. Mở lại grid container bên dưới và ĐỒNG BỘ lưới với bộ sưu tập hiện tại
        if (gridContainer) {
            gridContainer.classList.remove('is-hidden');
        }

        const grid = $('#svGrid');
        if (grid && grid.getAttribute('data-collection') !== String(currentCollectionIndex)) {
            renderGrid();
        }

        const activeGridItems = $$('.sv-grid-item');
        const targetItem = activeGridItems[currentIndex] || activeGridItems[0];
        const targetImg = targetItem ? targetItem.querySelector('.sv-item-img') : null;
        const targetShadow = targetItem ? targetItem.querySelector('.sv-item-shadow') : null;

        // Giữ 5 đôi giày khác mờ nhẹ trong lúc chiếc hero chuẩn bị đáp xuống
        activeGridItems.forEach((it, i) => {
            if (i !== currentIndex) {
                it.classList.add('is-fading-out');
            }
        });

        if (targetImg) targetImg.style.visibility = 'hidden';
        if (targetShadow) targetShadow.style.opacity = '0';

        // 3. Fade out typography, specs, controls
        if (giantTitle) {
            giantTitle.style.transition = 'transform 0.45s ease, opacity 0.38s ease';
            giantTitle.style.opacity = '0';
            giantTitle.style.transform = 'scale(0.86)';
        }
        if (specsPanel) {
            specsPanel.style.transition = 'transform 0.42s ease, opacity 0.35s ease';
            specsPanel.style.opacity = '0';
            specsPanel.style.transform = 'translateY(20px)';
        }
        if (controlsPanel) {
            controlsPanel.style.transition = 'transform 0.42s ease, opacity 0.35s ease';
            controlsPanel.style.opacity = '0';
            controlsPanel.style.transform = 'translateY(20px)';
        }
        if (heroShadow) {
            heroShadow.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            heroShadow.style.opacity = '0';
            heroShadow.style.transform = 'translateX(-50%) rotate(-10deg) scale(0.35)';
        }

        // 4. Crossfade background về hình nền vân bê tông tối cao cấp
        if (app) {
            app.classList.add('is-grid-mode');
            app.style.backgroundColor = '#0D0E12';
        }

        // 5. Tính toán FLIP từ heroImg về vị trí của targetImg trong grid (chậm rãi 0.85s)
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

            heroImg.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease';
            heroImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(-15deg)`;

            // Fade in lại 5 đôi giày còn lại sau 280ms
            setTimeout(() => {
                activeGridItems.forEach(it => it.classList.remove('is-fading-out'));
            }, 280);

            // Khi đôi giày đã đáp gọn vào ô grid (860ms)
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
            }, 860);
        } else {
            if (sliderContainer) sliderContainer.classList.remove('is-active');
            gridItems.forEach(it => it.classList.remove('is-fading-out'));
            if (targetImg) targetImg.style.visibility = '';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-view-stacked"></i> <span>SLIDER 3D</span>';
            isTransitioning = false;
        }
    }

    // --- Cập nhật tiêu đề khổng lồ phía sau (tự co giãn thông minh nếu tên dài) ---
    function setGiantTitleText(modelName) {
        const giantEl = $('#svGiantTitle');
        if (!giantEl) return;
        const text = modelName || '';
        giantEl.textContent = text;
        const len = text.length;
        if (len > 15) {
            giantEl.style.fontSize = 'clamp(44px, 7.2vw, 100px)';
            giantEl.style.letterSpacing = '-0.025em';
        } else if (len > 12) {
            giantEl.style.fontSize = 'clamp(58px, 9vw, 125px)';
            giantEl.style.letterSpacing = '-0.02em';
        } else {
            giantEl.style.fontSize = '';
            giantEl.style.letterSpacing = '';
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
            getSneakers().forEach((snkItem, i) => {
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
        const snk = getSneakers()[currentIndex];
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
                setGiantTitleText(snk.model);
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
                    setGiantTitleText(snk.model);
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

        getSneakers().forEach((_, idx) => {
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
        currentIndex = (currentIndex + 1) % getSneakers().length;
        updateSliderDisplay(1);
    }

    function prevSneaker() {
        currentIndex = (currentIndex - 1 + getSneakers().length) % getSneakers().length;
        updateSliderDisplay(-1);
    }

    const SIZES = ['39', '40', '41', '42', '43', '44'];
    let selectedSize = '42'; // Mặc định size 42

    // --- Đảm bảo Glassmorphism Size Drawer luôn tồn tại trên DOM ---
    function ensureSizeDrawerInDOM() {
        let backdrop = $('#svSizeBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'sv-size-backdrop';
            backdrop.id = 'svSizeBackdrop';
            document.body.appendChild(backdrop);
            backdrop.onclick = closeSizeDrawer;
        }

        const controlsPanels = document.querySelectorAll('.sv-controls-panel');
        controlsPanels.forEach(panel => {
            let drawer = panel.querySelector('.sv-size-drawer');
            if (!drawer) {
                drawer = document.createElement('div');
                drawer.className = 'sv-size-drawer';
                drawer.id = 'svSizeDrawer';
                drawer.innerHTML = `
                    <div class="sv-size-header">
                        <h4 class="sv-size-title">CHỌN SIZE GIÀY (EU)</h4>
                        <button type="button" class="sv-size-close-btn" id="svCloseSizeDrawerBtn" title="Đóng">✕</button>
                    </div>
                    <div class="sv-size-product-info">
                        <span class="sv-size-model-name" id="svSizeModelName">AIR FUTURE</span>
                        <span class="sv-size-price" id="svSizePrice">0 ₫</span>
                    </div>
                    <div class="sv-size-grid" id="svSizeGrid">
                        <!-- Render danh sách size -->
                    </div>
                    <div class="sv-size-hint">
                        <span>Chuẩn size EU • Hỗ trợ đổi size tận nơi trong 7 ngày</span>
                    </div>
                    <button type="button" class="sv-size-confirm-btn" id="svConfirmSizeBtn">
                        <span id="svConfirmSizeText">XÁC NHẬN</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                `;
                panel.appendChild(drawer);

                const closeBtn = drawer.querySelector('#svCloseSizeDrawerBtn');
                if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); closeSizeDrawer(); };

                const confirmBtn = drawer.querySelector('#svConfirmSizeBtn');
                if (confirmBtn) confirmBtn.onclick = (e) => { e.stopPropagation(); confirmAddToCart(); };
            }
        });
    }

    function openSizeDrawer() {
        ensureSizeDrawerInDOM();
        const snk = getSneakers()[currentIndex];
        if (!snk) return;

        const backdrop = $('#svSizeBackdrop');
        const drawer = $('#svSizeDrawer');
        if (backdrop) backdrop.classList.add('is-open');
        if (drawer) drawer.classList.add('is-open');

        // Cập nhật thông tin giày vào popup
        const nameEl = $('#svSizeModelName');
        const priceEl = $('#svSizePrice');
        if (nameEl) nameEl.textContent = `${snk.model} — ${snk.colorway}`;
        if (priceEl) priceEl.textContent = formatPrice(snk.price);

        // Render các ô size
        const grid = $('#svSizeGrid');
        if (grid) {
            grid.innerHTML = '';
            SIZES.forEach(sz => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `sv-size-item ${sz === selectedSize ? 'is-selected' : ''}`;
                btn.textContent = sz;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    selectedSize = sz;
                    grid.querySelectorAll('.sv-size-item').forEach(b => b.classList.remove('is-selected'));
                    btn.classList.add('is-selected');
                    const confirmText = $('#svConfirmSizeText');
                    if (confirmText) confirmText.textContent = 'XÁC NHẬN';
                };
                grid.appendChild(btn);
            });
        }

        const confirmText = $('#svConfirmSizeText');
        if (confirmText) confirmText.textContent = 'XÁC NHẬN';
    }

    function closeSizeDrawer() {
        const backdrop = $('#svSizeBackdrop');
        const drawer = $('#svSizeDrawer');
        if (backdrop) backdrop.classList.remove('is-open');
        if (drawer) drawer.classList.remove('is-open');
    }

    // Xác nhận thêm vào giỏ hàng kèm size đã chọn
    function confirmAddToCart() {
        closeSizeDrawer();

        bagCount++;
        const badge = $('#svBagBadge');
        if (badge) {
            badge.textContent = bagCount;
            badge.style.transform = 'scale(1.4)';
            setTimeout(() => badge.style.transform = 'scale(1)', 250);
        }

        // Đã tắt popup thông báo theo yêu cầu

        // Hiệu ứng phản hồi trên nút Thêm vào giỏ: ĐÃ THÊM VÀO GIỎ (SIZE ...)
        const addBagBtn = $('#svAddBagBtn');
        if (addBagBtn) {
            const originalHTML = addBagBtn.innerHTML;
            addBagBtn.innerHTML = `
                <span style="display:inline-flex;align-items:center;justify-content:center;gap:6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ĐÃ THÊM VÀO GIỎ (SIZE ${selectedSize})
                </span>
            `;
            addBagBtn.style.background = '#FFFFFF';
            addBagBtn.style.color = '#000000';
            setTimeout(() => {
                addBagBtn.innerHTML = originalHTML;
                addBagBtn.style.background = '';
                addBagBtn.style.color = '';
            }, 2400);
        }
    }


    // --- Thêm vào giỏ hàng: Mở Popup chọn Size kính mờ chuẩn Nike SNKRS ---
    function addToBag() {
        openSizeDrawer();
    }

    function showToast(msg) {
        // Tắt toàn bộ thông báo nổi theo yêu cầu
        const toast = $('#svToast');
        if (toast) toast.remove();
    }

    // --- Bind sự kiện nút bấm & Bàn phím ---
    function bindEvents() {
        const toggleBtn = $('#svToggleViewBtn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const drawer = $('#svSizeDrawer');
            if (drawer && drawer.classList.contains('is-open')) {
                closeSizeDrawer();
                return;
            }
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
                const drawer = $('#svSizeDrawer');
            if (drawer && drawer.classList.contains('is-open')) {
                closeSizeDrawer();
                return;
            }
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
            ensureVaultSwitcherInDOM();
            localizeAllLabels();
            closeSliderView(true); // Luôn luôn mở ở trang lưới TẤT CẢ GIÀY theo đúng yêu cầu!
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
        ensureVaultSwitcherInDOM();
        ensureSizeDrawerInDOM();
        localizeAllLabels();
        renderGrid();
        bindEvents();
        renderDashes();

        // Mặc định luôn là trang lưới TẤT CẢ GIÀY (Grid Overview)
        if (!isSliderView) {
            closeSliderView(true);
        } else {
            const heroImg = $('#svHeroImg');
            if (heroImg) {
                heroImg.classList.add('is-floating');
                updateSliderDataOnly(getSneakers()[currentIndex]);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
