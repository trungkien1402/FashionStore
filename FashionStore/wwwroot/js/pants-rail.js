/**
 * HNMTSHOP — SÀO TREO QUẦN 3D (PANTS RAIL)
 * Interactive 3D pants rack with side-profile hangers, smooth 3D garment flip, size selection, and morphing CTA.
 */

(function () {
    'use strict';

    const PANTS_PRODUCTS = [
        {
            name: 'Quần Baggy Cargo Jeans Acid-Wash Đen Xám',
            slug: 'acid-cargo',
            price: 56,
            desc: 'Quần jeans túi hộp phom thụng rộng, wash mài xám khói bụi bặm phong cách Y2K và streetwear đương đại.',
            colors: [['Washed Xám Đen (Vintage Charcoal)', '#25262B'], ['Xám Bạc (Silver Wash)', '#42454F']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [8, 12, 15, 10, 6, 3],
            frontImg: '/pants-rail/assets/acid-cargo-front.webp',
            sideImg: '/pants-rail/assets/acid-cargo-side.webp'
        },
        {
            name: 'Quần Tây Xếp Ly Ống Rộng May Đo Sand Beige',
            slug: 'sand-pleated',
            price: 62,
            desc: 'Phom dáng xếp 2 ly cạp cao may đo tinh xảo, chất vải twill rủ mềm mại tạo bước đi thanh thoát chuẩn quiet luxury.',
            colors: [['Be Cát Tự Nhiên (Sand Beige)', '#D9CDB8'], ['Đen Midnight (Pitch Black)', '#17181C']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [6, 9, 14, 11, 5, 2],
            frontImg: '/pants-rail/assets/sand-pleated-front.webp',
            sideImg: '/pants-rail/assets/sand-pleated-side.webp'
        },
        {
            name: 'Quần Dù Parachute Tactical Rêu Quân Đội',
            slug: 'tactical-parachute',
            price: 58,
            desc: 'Chất liệu vải dù công nghệ trượt nước nhẹ, nhiều ngăn túi khóa bấm kim loại cùng dây rút lai quần biến hóa linh hoạt.',
            colors: [['Xanh Rêu Quân Đội (Military Olive)', '#4B5320'], ['Đen Stealth (Shadow Black)', '#1B1C20']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [10, 14, 12, 8, 4, 1],
            frontImg: '/pants-rail/assets/tactical-parachute-front.webp',
            sideImg: '/pants-rail/assets/tactical-parachute-side.webp'
        },
        {
            name: 'Quần Jeans Ống Suông Raw Selvedge Denim',
            slug: 'raw-selvedge',
            price: 68,
            desc: 'Denim 14oz dệt thoi con thoi cổ điển Nhật Bản, giữ phom đứng cá tính cùng viền chỉ đỏ selvedge độc bản khi xắn gấu.',
            colors: [['Đen Selvedge Chỉ Đỏ (Raw Black)', '#1A1A1E'], ['Chàm Đậm (Deep Indigo)', '#141E30']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [5, 7, 10, 8, 4, 0],
            frontImg: '/pants-rail/assets/raw-selvedge-front.webp',
            sideImg: '/pants-rail/assets/raw-selvedge-side.webp'
        },
        {
            name: 'Quần Jeans Ống Rộng Vintage Washed Indigo',
            slug: 'wide-denim',
            price: 54,
            desc: 'Phom suông rộng phóng khoáng kinh điển thập niên 90, xử lý wash nhẹ tạo độ rủ mềm mại cực kỳ thoải mái vận động.',
            colors: [['Xanh Vintage Washed (90s Blue)', '#5B7C99'], ['Xanh Khói (Smoky Azure)', '#4A657D']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [9, 11, 16, 12, 7, 3],
            frontImg: '/pants-rail/assets/wide-denim-front.webp',
            sideImg: '/pants-rail/assets/wide-denim-side.webp'
        }
    ];

    let activeIdx = 0;
    let currentIdx = 0;
    let isDetailOpen = false;
    let selectedColorIdx = 0;
    let selectedSize = '';
    let bagCount = 0;

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    function renderRail() {
        const stage = $('#pantsStage');
        if (!stage) return;

        stage.querySelectorAll('.pants-slot').forEach(el => el.remove());

        PANTS_PRODUCTS.forEach((p, i) => {
            const btn = document.createElement('button');
            btn.className = 'pants-slot' + (i === activeIdx ? ' active' : '');
            btn.type = 'button';
            btn.setAttribute('aria-label', `Xem ${p.name}, ${formatPrice(p.price)}`);
            btn.dataset.idx = i;
            btn.innerHTML = `
                <div class="pants-assembly" style="--delay:${i * 75}ms">
                    <div class="pants-turn">
                        <img class="pants-face front" alt="${p.name}" draggable="false" loading="eager" decoding="async" src="${p.frontImg}">
                        <img class="pants-face side" alt="" draggable="false" loading="eager" decoding="async" src="${p.sideImg}">
                    </div>
                </div>
            `;

            btn.addEventListener('mouseenter', () => !isDetailOpen && setActive(i));
            btn.addEventListener('focus', () => !isDetailOpen && setActive(i));
            btn.addEventListener('click', () => openDetail(i));
            stage.appendChild(btn);
        });

        setTimeout(() => {
            $$('.pants-assembly').forEach(el => el.classList.add('settle'));
        }, 1600);
    }

    function setActive(idx) {
        if (activeIdx === idx && $$('.pants-slot.active').length > 0) return;
        activeIdx = idx;

        $$('.pants-slot').forEach((slot, i) => {
            slot.classList.toggle('active', i === idx);
        });

        const p = PANTS_PRODUCTS[idx];
        if (!p) return;

        const titleEl = $('#pantsCaptionTitle');
        const detailEl = $('#pantsCaptionDetail');
        if (titleEl) titleEl.textContent = p.name;
        if (detailEl) detailEl.textContent = `${formatPrice(p.price)} — ${p.desc}`;
    }

    function openDetail(idx) {
        currentIdx = idx;
        const p = PANTS_PRODUCTS[idx];
        if (!p) return;

        isDetailOpen = true;
        const overlay = $('#pantsProductOverlay');
        if (overlay) overlay.classList.add('open');

        selectedColorIdx = 0;
        selectedSize = '';
        renderDetail();
    }

    function closeDetail() {
        isDetailOpen = false;
        const overlay = $('#pantsProductOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    function navigate(delta) {
        const len = PANTS_PRODUCTS.length;
        currentIdx = (currentIdx + delta + len) % len;
        setActive(currentIdx);
        renderDetail();
    }

    function renderDetail() {
        const p = PANTS_PRODUCTS[currentIdx];
        if (!p) return;

        const imgEl = $('#pantsDetailImage');
        const counterEl = $('#pantsCounter');
        const nameEl = $('#pantsDetailName');
        const descEl = $('#pantsDescription');
        const priceEl = $('#pantsDetailPrice');
        const stockEl = $('#pantsStock');
        const colorsEl = $('#pantsColors');
        const sizesEl = $('#pantsSizes');
        const cartCta = $('#pantsCartCta');

        if (imgEl) {
            imgEl.src = p.frontImg;
            imgEl.alt = p.name;
        }
        if (counterEl) counterEl.textContent = `${currentIdx + 1} / ${PANTS_PRODUCTS.length} — BỘ SƯU TẬP QUẦN 3D`;
        if (nameEl) nameEl.textContent = p.name;
        if (descEl) descEl.textContent = p.desc;
        if (priceEl) priceEl.textContent = formatPrice(p.price);

        const totalStock = p.stock.reduce((a, b) => a + b, 0);
        if (stockEl) stockEl.textContent = totalStock > 0 ? `Còn hàng (${totalStock})` : 'Tạm hết hàng';

        // Render Color Chips
        if (colorsEl) {
            colorsEl.innerHTML = '';
            p.colors.forEach((col, i) => {
                const dot = document.createElement('div');
                dot.className = 'pants-color-chip' + (selectedColorIdx === i ? ' selected' : '');
                dot.style.backgroundColor = col[1];
                dot.title = col[0];
                dot.onclick = () => {
                    selectedColorIdx = i;
                    renderDetail();
                };
                colorsEl.appendChild(dot);
            });
        }

        // Render Size Chips (Quần chuẩn size số 28 - 34)
        if (sizesEl) {
            sizesEl.innerHTML = '';
            p.sizes.forEach((size, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'pants-size-chip' + (selectedSize === size ? ' selected' : '');
                btn.textContent = size;
                const stockForSize = p.stock[i] || 0;
                btn.disabled = stockForSize === 0;
                btn.title = btn.disabled ? 'Hết size' : `Còn ${stockForSize} sản phẩm`;
                btn.onclick = () => {
                    selectedSize = size;
                    renderDetail();
                };
                sizesEl.appendChild(btn);
            });
        }

        if (cartCta) {
            if (!cartCta.classList.contains('is-added')) {
                cartCta.textContent = selectedSize ? `THÊM VÀO GIỎ (SIZE ${selectedSize})` : 'CHỌN KÍCH CỠ ĐỂ MUA';
                cartCta.disabled = !selectedSize;
            }
        }
    }

    // --- MỞ VÀ ĐÓNG SÀO QUẦN TOÀN CỤC ---
    function openPantsRail() {
        const overlay = $('#hnmtPantsOverlay');
        if (overlay) {
            overlay.classList.add('is-active');
            renderRail();
            setActive(0);
        }
    }

    function closePantsRail() {
        const overlay = $('#hnmtPantsOverlay');
        if (overlay) {
            overlay.classList.remove('is-active');
            closeDetail();
        }
        const promptEl = document.querySelector('.hnmt-portal-footer');
        const portalHeaderEl = document.querySelector('.hnmt-portal-header');
        if (promptEl) promptEl.style.display = '';
        if (portalHeaderEl) portalHeaderEl.style.display = '';
    }

    window.open3DPantsRack = openPantsRail;
    window.close3DPantsRack = closePantsRail;

    function bindEvents() {
        const prevBtn = $('#pantsPrevBtn');
        const nextBtn = $('#pantsNextBtn');
        const closeBtn = $('#pantsCloseBtn');
        const availBtn = $('#pantsAvailabilityBtn');
        const backToLobbyBtn = $('#hnmtPantsBackToLobbyBtn');
        const cartCta = $('#pantsCartCta');
        const brandSig = $('#pantsBrandSignature');

        if (prevBtn) prevBtn.onclick = () => navigate(-1);
        if (nextBtn) nextBtn.onclick = () => navigate(1);
        if (closeBtn) closeBtn.onclick = closeDetail;
        if (availBtn) availBtn.onclick = () => openDetail(activeIdx >= 0 ? activeIdx : 0);

        if (backToLobbyBtn) {
            backToLobbyBtn.onclick = closePantsRail;
        }

        if (brandSig) {
            brandSig.onclick = () => {
                window.location.href = '/';
            };
        }

        if (cartCta) {
            cartCta.onclick = () => {
                const p = PANTS_PRODUCTS[currentIdx];
                if (!p || !selectedSize) return;

                bagCount++;
                const bagBadge = $('#pantsBagCount');
                if (bagBadge) {
                    bagBadge.textContent = bagCount;
                    bagBadge.classList.remove('bump');
                    void bagBadge.offsetWidth;
                    bagBadge.classList.add('bump');
                }

                // Cập nhật các badge khác
                const mainBag = $('#bagCount') || $('#svBagBadge');
                if (mainBag) mainBag.textContent = bagCount;

                // Hiệu ứng biến hình nút CTA (Chuẩn Acne Studios)
                cartCta.innerHTML = `
                    <span class="pants-btn-feedback">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        ĐÃ THÊM VÀO GIỎ (SIZE ${selectedSize})
                    </span>
                `;
                cartCta.classList.add('is-added');
                cartCta.disabled = true;

                setTimeout(() => {
                    cartCta.classList.remove('is-added');
                    cartCta.disabled = false;
                    renderDetail();
                }, 2400);
            };
        }

        // Keyboard listeners
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (isDetailOpen) closeDetail();
                else if ($('#hnmtPantsOverlay')?.classList.contains('is-active')) closePantsRail();
            } else if (e.key === 'ArrowLeft') {
                if (isDetailOpen) navigate(-1);
            } else if (e.key === 'ArrowRight') {
                if (isDetailOpen) navigate(1);
            }
        });

        const overlay = $('#pantsProductOverlay');
        if (overlay) {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) closeDetail();
            });
        }
    }

    function init() {
        bindEvents();
        renderRail();
        setActive(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
