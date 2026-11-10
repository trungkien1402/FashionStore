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

    // --- Preload tất cả hình ảnh để chuyển cảnh tức thì không giật lag ---
    function preloadSneakerImages() {
        SNEAKERS.forEach(snk => {
            const img = new Image();
            img.src = snk.image;
        });
    }

    // --- Khởi tạo 6 Slide và 6 Title typography độc lập trong Stage ---
    function renderSlider() {
        const stage = $('#svStage');
        const titleTrack = $('#svTitleTrack');
        if (!stage || !titleTrack) return;

        stage.innerHTML = '';
        titleTrack.innerHTML = '';

        SNEAKERS.forEach((snk, idx) => {
            // Title
            const titleEl = document.createElement('h2');
            titleEl.className = `sv-giant-title ${idx === currentIndex ? 'is-active' : ''}`;
            titleEl.setAttribute('data-idx', String(idx));
            titleEl.textContent = snk.model;
            titleTrack.appendChild(titleEl);

            // Slide
            const slideEl = document.createElement('div');
            slideEl.className = `sv-slide ${idx === currentIndex ? 'is-active' : ''}`;
            slideEl.setAttribute('data-idx', String(idx));
            slideEl.innerHTML = `
                <div class="sv-hero-wrap">
                    <img src="${snk.image}" alt="${snk.model}" class="sv-hero-img" />
                    <div class="sv-hero-shadow"></div>
                </div>
            `;
            stage.appendChild(slideEl);
        });
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
            // Click trực tiếp vào đôi giày để mở chi tiết với hiệu ứng phóng to
            item.onclick = function (e) {
                e.stopPropagation();
                openSliderView(idx);
            };
            grid.appendChild(item);
        });
    }

    // --- Cập nhật thông số kỹ thuật Tech Specs ---
    function updateSpecsContent(snk) {
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
                        switchToSneaker(i, dir);
                    }
                };
                swatchesContainer.appendChild(dot);
            });
        }

        renderDashes();
    }

    // --- Chuyển cảnh: Mở chi tiết Slider từ Lưới "TẤT CẢ GIÀY" ---
    // Hiệu ứng: Đôi giày từ từ phóng to vào giữa (scale: 0.25 -> 1.0),
    // chữ và nút từ 2 bên hoặc phía trên chạy vào chuẩn 1:1 theo video
    function openSliderView(idx) {
        currentIndex = idx;
        isSliderView = true;

        const gridContainer = $('#svGridContainer');
        const sliderContainer = $('#svSliderContainer');
        const toggleBtn = $('#svToggleViewBtn');
        const app = $('#svApp');
        const snk = SNEAKERS[idx];

        updateSpecsContent(snk);

        if (gridContainer) {
            gridContainer.classList.add('is-hidden');
        }
        if (sliderContainer) {
            sliderContainer.classList.add('is-active');
        }

        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="bi bi-grid-3x3-gap"></i> <span>TẤT CẢ GIÀY</span>';
        }

        // Đổi màu nền mượt mà sang màu của đôi giày được chọn
        if (app) {
            app.classList.remove('is-grid-mode');
            app.style.backgroundImage = 'none';
            app.style.backgroundColor = snk.themeColor;
        }

        // Kích hoạt slide tương ứng
        const slides = $$('.sv-slide');
        const titles = $$('.sv-giant-title');
        slides.forEach((sl, i) => {
            sl.className = `sv-slide ${i === idx ? 'is-active' : ''}`;
        });
        titles.forEach((ti, i) => {
            ti.className = `sv-giant-title ${i === idx ? 'is-active' : ''}`;
        });

        // KÍCH HOẠT HIỆU ỨNG PHÓNG TO VÀ CÁC THÀNH PHẦN CHẠY VÀO TỪ 2 BÊN VÀ TRÊN XUỐNG
        if (app) {
            app.classList.remove('sv-entry-settled');
            app.classList.add('sv-entry-animating');

            // Force reflow
            void app.offsetWidth;

            requestAnimationFrame(() => {
                app.classList.add('sv-entry-settled');
                setTimeout(() => {
                    app.classList.remove('sv-entry-animating');
                }, 800);
            });
        }
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

        if (app) {
            app.classList.remove('sv-entry-animating', 'sv-entry-settled');
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

    // --- Chuyển tiếp giữa các đôi giày: ĐỒNG BỘ 100% NỀN & GIÀY, KHÔNG LỖI "NỀN NÀY GIÀY KIA" ---
    function switchToSneaker(newIdx, direction = 1) {
        if (newIdx === currentIndex || isAnimating) return;
        isAnimating = true;

        const oldIdx = currentIndex;
        currentIndex = newIdx;
        const snk = SNEAKERS[newIdx];

        const slides = $$('.sv-slide');
        const titles = $$('.sv-giant-title');
        const oldSlide = slides[oldIdx];
        const newSlide = slides[newIdx];
        const oldTitle = titles[oldIdx];
        const newTitle = titles[newIdx];
        const app = $('#svApp');
        const specsPanel = $('.sv-specs-panel');

        // 1. Đổi màu nền ĐỒNG BỘ 100% cùng lúc đôi giày bắt đầu chuyển động
        if (app) {
            app.style.backgroundColor = snk.themeColor;
        }

        // 2. Chuyển đổi Tech Specs & Swatches (mờ nhẹ và trượt lên tự nhiên)
        if (specsPanel) {
            specsPanel.style.opacity = '0';
            specsPanel.style.transform = 'translateY(10px)';
        }

        setTimeout(() => {
            updateSpecsContent(snk);
            if (specsPanel) {
                specsPanel.style.opacity = '1';
                specsPanel.style.transform = 'translateY(0)';
            }
        }, 160);

        // 3. Chuẩn bị vị trí cho slide và title mới (transition: none)
        const enterClass = direction > 0 ? 'is-entering-right' : 'is-entering-left';
        const exitClass = direction > 0 ? 'is-exiting-left' : 'is-exiting-right';

        if (newSlide) newSlide.className = `sv-slide ${enterClass}`;
        if (newTitle) newTitle.className = `sv-giant-title ${enterClass}`;

        // Ép trình duyệt ghi nhận vị trí
        if (newSlide) void newSlide.offsetWidth;

        // 4. Bắt đầu chuyển động đồng thời: slide cũ lướt ra, slide mới lướt vào
        requestAnimationFrame(() => {
            if (oldSlide) oldSlide.className = `sv-slide ${exitClass}`;
            if (oldTitle) oldTitle.className = `sv-giant-title ${exitClass}`;

            if (newSlide) newSlide.className = 'sv-slide is-active';
            if (newTitle) newTitle.className = 'sv-giant-title is-active';
        });

        // 5. Kết thúc chuyển cảnh sau 650ms
        setTimeout(() => {
            if (oldSlide) oldSlide.className = 'sv-slide';
            if (oldTitle) oldTitle.className = 'sv-giant-title';
            isAnimating = false;
        }, 650);
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
                    switchToSneaker(idx, dir);
                }
            };
            container.appendChild(dash);
        });
    }

    // --- Chuyển chiếc giày kế tiếp / trước đó ---
    function nextSneaker() {
        const nextIdx = (currentIndex + 1) % SNEAKERS.length;
        switchToSneaker(nextIdx, 1);
    }

    function prevSneaker() {
        const prevIdx = (currentIndex - 1 + SNEAKERS.length) % SNEAKERS.length;
        switchToSneaker(prevIdx, -1);
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

    // --- Bind sự kiện nút bấm & Bàn phím & Cảm ứng ---
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

        // Thao tác vuốt màn hình cảm ứng / Trackpad (Touch Swipe)
        let touchStartX = 0;
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            if (!isSliderView) return;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (!isSliderView) return;
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) nextSneaker();
                else prevSneaker();
            }
        }, { passive: true });
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
        preloadSneakerImages();
        localizeAllLabels();
        renderSlider();
        renderGrid();
        bindEvents();
        updateSpecsContent(SNEAKERS[currentIndex]);
        
        // Thiết lập màu nền ban đầu
        const app = $('#svApp');
        if (app && isSliderView) {
            app.style.backgroundColor = SNEAKERS[currentIndex].themeColor;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
