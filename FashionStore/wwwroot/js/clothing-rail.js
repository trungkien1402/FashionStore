/**
 * ==============================================================================
 * HNMTSHOP - CLOTHING RAIL CATALOG INTERACTIVE ENGINE
 * Multi-Rack Switcher (SÀO 01 // ESSENTIALS & SÀO 02 // WINTER DROP)
 * ==============================================================================
 */
(() => {
    'use strict';

    const racks = [
        {
            id: 'rack-01',
            badge: 'SÀO 01 // ESSENTIAL STREETWEAR',
            eyebrow: 'BỘ SƯU TẬP 01',
            heroTitle: 'Thời Trang Độc Bản · Nâng Tầm Phong Cách',
            products: [
                {
                    name: 'Reach Shirt',
                    slug: 'reach-shirt',
                    price: 68,
                    type: 'shirt',
                    art: 'hand',
                    desc: 'Thiết kế camp-collar phóng khoáng cùng họa tiết bàn tay vẽ tay nghệ thuật độc bản.',
                    colors: [['Trắng Ngà (White)', '#f8f7f3', '#16171b'], ['Đen Huyền Bí (Black)', '#202125', '#efebda']],
                    stock: [9, 8, 6, 5, 2]
                },
                {
                    name: 'Scrawl Tee',
                    slug: 'scrawl-tee',
                    price: 42,
                    type: 'tee',
                    art: 'scrawl',
                    desc: 'Cotton định lượng cao dáng oversized với những nét cọ ngẫu hứng trừu tượng sống động.',
                    colors: [['Đen & Cam (Black & Orange)', '#1a1b1e', '#ff671f'], ['Trắng Phấn & Xanh Cobalt', '#f2f0e9', '#2456ba']],
                    stock: [6, 6, 5, 2, 0]
                },
                {
                    name: 'Blend In Tee',
                    slug: 'blend-in-tee',
                    price: 38,
                    type: 'tee',
                    art: 'blend',
                    desc: 'Không sinh ra để hòa tan — Tuyên ngôn thời trang phá cách đậm chất cá tính.',
                    colors: [['Kem Tự Nhiên (Cream)', '#efeadb', '#c43236'], ['Đen Đỏ Rực (Black & Red)', '#18191c', '#da353b']],
                    stock: [8, 6, 4, 2, 0]
                },
                {
                    name: 'Two Faces Tee',
                    slug: 'two-faces-tee',
                    price: 42,
                    type: 'tee',
                    art: 'faces',
                    desc: 'Nghệ thuật vẽ nét liền continuous-line tinh tế trên nền cotton washed phong cách vintage.',
                    colors: [['Xám Tro Vintage (Washed Charcoal)', '#5c5b5c', '#edece5'], ['Nâu Cát Sang Trọng (Sand)', '#ccbba0', '#33353c']],
                    stock: [10, 8, 5, 3, 1]
                },
                {
                    name: 'Unbothered Tee',
                    slug: 'unbothered-tee',
                    price: 40,
                    type: 'tee',
                    art: 'unbothered',
                    desc: 'Một chút tự do, một chút phóng khoáng, nổi bật đầy tự tin giữa đám đông.',
                    colors: [['Rượu Vang Đỏ (Burgundy)', '#652f42', '#f4dfbe'], ['Xanh Rừng Sâu (Forest Green)', '#24483b', '#f0e4bf']],
                    stock: [7, 5, 4, 3, 2]
                },
                {
                    name: 'Ink Drip Shirt',
                    slug: 'ink-drip-shirt',
                    price: 72,
                    type: 'shirt',
                    art: 'ink',
                    desc: 'Nét cọ loang mực nghệ thuật lan tỏa trên phom dáng sơ mi relaxed thoải mái và hiện đại.',
                    colors: [['Xanh Rêu Ô-liu (Olive)', '#757a49', '#202125'], ['Trắng Ngà Nét Xanh Navy (Ecru)', '#e5dcc9', '#28345a']],
                    stock: [7, 6, 3, 2, 0]
                },
                {
                    name: 'Fern Tee',
                    slug: 'fern-tee',
                    price: 44,
                    type: 'tee',
                    art: 'fern',
                    desc: 'Kỹ thuật in cyanotype thực vật độc đáo kết hợp cùng chất liệu cotton cao cấp đường phố.',
                    colors: [['Xanh Đậm Hoàng Gia (Prussian Blue)', '#153e78', '#f1f0e7'], ['Đỏ Đất Nung (Rust Terracotta)', '#aa6244', '#eee3c8']],
                    stock: [10, 8, 6, 3, 1]
                },
                {
                    name: 'Holding On Crew',
                    slug: 'holding-on-crew',
                    price: 78,
                    type: 'crew',
                    art: 'hands',
                    desc: 'Áo nỉ fleece dệt dày dặn, đường nét thêu xích thủ công chain-stitch tinh xảo.',
                    colors: [['Đen Tối Giản (Black)', '#222326', '#e9e4d4'], ['Xám Tiêu Thêu Đen (Grey Marl)', '#b5b3b0', '#27282d']],
                    stock: [5, 4, 3, 2, 0]
                },
                {
                    name: 'Cloud Nine Tee',
                    slug: 'cloud-nine-tee',
                    price: 46,
                    type: 'tee',
                    art: 'cloud',
                    desc: 'Cảm hứng bồng bềnh tựa mây trời, chất vải mềm mượt thoáng khí tối đa.',
                    colors: [['Xanh Da Trời (Sky Blue)', '#88b8d8', '#fafafa'], ['Tím Hoa Cà Pastel (Lilac)', '#bdb3dd', '#ffffff']],
                    stock: [10, 9, 5, 4, 2]
                },
                {
                    name: 'One of One Tee',
                    slug: 'one-of-one-tee',
                    price: 40,
                    type: 'tee',
                    art: 'fingerprint',
                    desc: 'Dấu ấn độc bản của riêng bạn — Độc nhất, không trùng lặp.',
                    colors: [['Xám Đá Tự Nhiên (Stone)', '#c1b5a2', '#222326'], ['Đen Điểm Xanh Neon (Acid Lime)', '#222326', '#bbdc37']],
                    stock: [0, 0, 0, 0, 0],
                    upcoming: true
                }
            ]
        },
                {
            id: 'rack-02',
            badge: 'SÀO 02',
            eyebrow: 'BỘ SƯU TẬP 02',
            heroTitle: 'Phong Cách Đường Phố · Bản Lĩnh Đột Phá',
            products: [
                {
                    name: 'CYBERPUNK Heavyweight Boxy Tee (300GSM)',
                    slug: 'cyber-boxy-tee',
                    price: 48,
                    type: 'tee',
                    art: 'cyber',
                    desc: 'Áo thun phom Boxy vai trễ dày dặn 300GSM với đồ họa viễn tưởng Cyberpunk Neon phản quang sắc nét.',
                    colors: [['Washed Than Chì (Vintage Charcoal)', '#1f1f21', '#00f0ff'], ['Xám Bạc (Silver Smoke)', '#38393d', '#a3e635']],
                    stock: [12, 15, 10, 6, 2]
                },
                {
                    name: 'HNMT Luxury Wool & Leather Varsity Jacket',
                    slug: 'luxury-varsity',
                    price: 89,
                    type: 'jacket',
                    art: 'varsity',
                    desc: 'Áo khoác bóng chày thân dạ len cừu phối tay da thật cao cấp, thêu xù Chenille logo HNMT STUDIO.',
                    colors: [['Xanh Navy & Kem (Navy / Cream)', '#121d33', '#f2efe9'], ['Đen Huyền Bí & Trắng (Black / White)', '#111214', '#ffffff']],
                    stock: [5, 8, 6, 3, 0]
                },
                {
                    name: 'OVERDRIVE Vintage Motorsport Leather Jacket',
                    slug: 'racing-moto',
                    price: 95,
                    type: 'jacket',
                    art: 'racing',
                    desc: 'Áo khoác da đua xe thể thao cổ điển phối 3 mảng màu Tricolor Đen - Kem - Đỏ cùng huy hiệu HNMT GRAND PRIX.',
                    colors: [['Tricolor Race (Đen - Kem - Đỏ)', '#18181b', '#e61922'], ['Stealth Dark (All Black)', '#0a0a0c', '#888888']],
                    stock: [4, 6, 5, 2, 0]
                }
            ]
        }
    ];

    let currentRackIdx = 0;
    let products = racks[0].products;

    const photo = (p, variant = 0) => `/clothing-rail/assets/${p.slug}-${variant ? 'alt' : 'front'}.webp`;
    const sidePhoto = p => `/clothing-rail/assets/${p.slug}-side.webp`;

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    const $ = s => document.querySelector(s);
    let active = -1;
    let current = 0;
    let selectedSize = '';
    let bag = 0;
    let toastTimer;
    let detailOpen = false;
    let modalOpen = false;
    const sizeNames = ['XS', 'S', 'M', 'L', 'XL'];

    function makeRail() {
        const stage = $('#railStage');
        if (!stage) return;
        stage.querySelectorAll('.slot').forEach(e => e.remove());

        products.forEach((p, i) => {
            const b = document.createElement('button');
            b.className = 'slot';
            b.type = 'button';
            b.setAttribute('aria-label', `Xem ${p.name}, ${formatPrice(p.price)}`);
            b.dataset.idx = i;
            b.innerHTML = `
                <div class="garment-assembly" style="--delay:${i * 70}ms">
                    <div class="garment-turn">
                        <img class="face front" alt="${p.name}" draggable="false" loading="eager" decoding="async" src="${photo(p, 0)}">
                        <img class="face side" alt="" draggable="false" loading="eager" decoding="async" src="${sidePhoto(p)}">
                    </div>
                </div>`;

            b.addEventListener('mouseenter', () => !detailOpen && setActive(i));
            b.addEventListener('focus', () => !detailOpen && setActive(i));
            b.addEventListener('click', () => openDetail(i));
            stage.append(b);
        });

        setTimeout(() => {
            document.querySelectorAll('.garment-assembly').forEach(e => e.classList.add('settle'));
        }, 1800);
    }

    function setActive(i) {
        if (active === i) return;
        active = i;
        document.querySelectorAll('.slot').forEach((s, n) => s.classList.toggle('active', n === i));
        
        const p = products[i];
        if (!p) return;
        const titleEl = $('#captionTitle');
        const detailEl = $('#captionDetail');
        if (titleEl) titleEl.textContent = p.name;
        if (detailEl) detailEl.textContent = `${formatPrice(p.price)} — ${p.desc}`;
    }

    function openDetail(idx) {
        current = idx;
        const p = products[idx];
        if (!p) return;
        detailOpen = true;
        document.body.classList.add('show-detail');
        const overlay = $('#productOverlay');
        if (overlay) overlay.classList.add('open');
        selectedSize = '';
        renderDetail();
    }

    function closeDetail() {
        detailOpen = false;
        document.body.classList.remove('show-detail');
        const overlay = $('#productOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    function navigate(dir) {
        current = (current + dir + products.length) % products.length;
        selectedSize = '';
        renderDetail();
    }

    function switchRack(dir) {
        if (detailOpen) closeDetail();
        const stage = $('#railStage');
        if (stage) stage.classList.add('is-switching');
        
        setTimeout(() => {
            currentRackIdx = (currentRackIdx + dir + racks.length) % racks.length;
            const currentRack = racks[currentRackIdx];
            products = currentRack.products;
            
            // Cập nhật Badge Sào & Tiêu đề
            const eyebrowEl = $('.rail-eyebrow');
            if (eyebrowEl) eyebrowEl.textContent = currentRack.eyebrow;
            
            const heroTitleEl = $('.rail-hero-title');
            if (heroTitleEl) heroTitleEl.innerHTML = currentRack.heroTitle;
            
            // Render lại sào mới
            makeRail();
            
            const scroll = $('#railScroll');
            if (scroll) scroll.scrollLeft = 0;
            
            active = -1;
            setActive(0);
            
            setTimeout(() => {
                if (stage) stage.classList.remove('is-switching');
            }, 60);
        }, 220);
    }

    function renderDetail() {
        const p = products[current];
        if (!p) return;
        const v = p.variant || 0;

        const nameEl = $('#detailName');
        const priceEl = $('#detailPrice');
        const descEl = $('#detailDesc');
        const imgEl = $('#detailImage');
        const typeEl = $('#detailType');

        if (nameEl) nameEl.textContent = p.name;
        if (priceEl) priceEl.textContent = formatPrice(p.price);
        if (descEl) descEl.textContent = p.desc;
        if (typeEl) typeEl.textContent = p.type ? `// ${p.type.toUpperCase()}` : '// THIẾT KẾ GIỚI HẠN';
        if (imgEl) {
            imgEl.src = photo(p, v);
            imgEl.alt = p.name;
        }

        const totalStock = p.stock.reduce((a, b) => a + b, 0);
        const low = totalStock > 0 && totalStock <= 15;
        const st = $('#stockStatus');
        if (st) {
            st.textContent = p.upcoming ? 'Ra mắt Thứ Sáu' : low ? 'Sắp hết hàng' : 'Còn hàng';
            st.classList.toggle('low', low && !p.upcoming);
        }

        const colorsEl = $('#colors');
        if (colorsEl) {
            colorsEl.innerHTML = '';
            p.colors.forEach((c, idx) => {
                const btn = document.createElement('button');
                btn.className = 'rail-color-choice' + (idx === v ? ' selected' : '');
                btn.style.background = c[1];
                btn.title = c[0];
                btn.setAttribute('aria-label', c[0]);
                btn.onclick = () => {
                    p.variant = idx;
                    const slotFront = document.querySelector(`.slot[data-idx="${current}"] .face.front`);
                    if (slotFront) slotFront.src = photo(p, idx);
                    renderDetail();
                };
                colorsEl.append(btn);
            });
        }

        const sizesEl = $('#sizes');
        if (sizesEl) {
            sizesEl.innerHTML = '';
            sizeNames.forEach((size, idx) => {
                const b = document.createElement('button');
                b.className = 'rail-size-chip' + (selectedSize === size ? ' selected' : '');
                b.textContent = size;
                b.disabled = p.upcoming || p.stock[idx] === 0;
                b.title = b.disabled ? 'Hết hàng' : `Còn ${p.stock[idx]} sản phẩm`;
                b.onclick = () => {
                    selectedSize = size;
                    renderSizes();
                };
                sizesEl.append(b);
            });
        }

        renderSizes();
    }

    function renderSizes() {
        const p = products[current];
        document.querySelectorAll('.rail-size-chip').forEach(b => {
            b.classList.toggle('selected', b.textContent === selectedSize);
        });

        const count = p.stock[sizeNames.indexOf(selectedSize)] || 0;
        const hintEl = $('#sizeHint');
        if (hintEl) {
            hintEl.textContent = selectedSize && count <= 2 && count > 0 ? `Chỉ còn ${count} sản phẩm size ${selectedSize}` : '';
        }

        const cartCta = $('#cartCta');
        if (cartCta) {
            cartCta.textContent = p.upcoming 
                ? 'NHẬN THÔNG BÁO KHI RA MẮT' 
                : selectedSize 
                    ? `THÊM VÀO GIỎ · ${formatPrice(p.price)}` 
                    : 'CHỌN KÍCH CỠ';
            cartCta.disabled = p.upcoming || !selectedSize;
        }
    }

    function notify(text) {
        // Tắt hoàn toàn các khung popup nổi để giữ trọn vẹn vẻ đẹp tối giản của trang thời trang
    }

    function openModal(title, text) {
        modalOpen = true;
        const titleEl = $('#modalTitle');
        const textEl = $('#modalText');
        const modal = $('#modal');
        if (titleEl) titleEl.textContent = title;
        if (textEl) textEl.innerHTML = text;
        if (modal) modal.classList.add('open');
    }

    function closeModal() {
        modalOpen = false;
        const modal = $('#modal');
        if (modal) modal.classList.remove('open');
    }

    function closeClothingRail() {
        const rackOverlayEl = document.getElementById('hnmtRackOverlay');
        if (rackOverlayEl) {
            rackOverlayEl.classList.remove('is-active');
            rackOverlayEl.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('show-detail');
        if (typeof window.HNMTChilePortal?.syncOverlayState === 'function') {
            window.HNMTChilePortal.syncOverlayState(false);
        }
    }

    function openClothingRail() {
        const rackOverlayEl = document.getElementById('hnmtRackOverlay');
        if (rackOverlayEl) {
            rackOverlayEl.classList.add('is-active');
            rackOverlayEl.setAttribute('aria-hidden', 'false');
            
            const promptEl = document.querySelector('.hnmt-portal-footer');
            const portalHeaderEl = document.querySelector('.hnmt-portal-header');
            if (promptEl) promptEl.style.display = 'none';
            if (portalHeaderEl) portalHeaderEl.style.display = 'none';
            
            const scroll = $('#railScroll');
            if (scroll) scroll.scrollLeft = 0;
            setActive(0);
        }
    }

    window.open3DClothesRack = openClothingRail;
    window.close3DClothesRack = closeClothingRail;

    function init() {
        const prevBtn = $('#prevBtn');
        const nextBtn = $('#nextBtn');
        const closeBtn = $('#closeBtn');
        const availBtn = $('#availabilityBtn');
        const cartCta = $('#cartCta');
        const bagBtn = $('#bagBtn');
        const brandSig = $('#railBrandSignature');
        const backToLobbyBtn = $('#hnmtRackBackToLobbyBtn');
        const modalExit = $('#modalExit');

        // Nút qua lại chuyển đổi Sào đồ (Off the Rail)
        const prevRackBtn = $('#rackPrevBtn');
        const nextRackBtn = $('#rackNextBtn');
        if (prevRackBtn) prevRackBtn.onclick = () => switchRack(-1);
        if (nextRackBtn) nextRackBtn.onclick = () => switchRack(1);

        if (prevBtn) prevBtn.onclick = () => navigate(-1);
        if (nextBtn) nextBtn.onclick = () => navigate(1);
        if (closeBtn) closeBtn.onclick = closeDetail;
        if (availBtn) availBtn.onclick = () => openDetail(active >= 0 ? active : 0);

        if (backToLobbyBtn) {
            backToLobbyBtn.onclick = () => {
                closeClothingRail();
                const promptEl = document.querySelector('.hnmt-portal-footer');
                const portalHeaderEl = document.querySelector('.hnmt-portal-header');
                if (promptEl) promptEl.style.display = '';
                if (portalHeaderEl) portalHeaderEl.style.display = '';
            };
        }

        if (brandSig) {
            brandSig.onclick = () => {
                window.location.href = '/';
            };
        }

        if (cartCta) {
            cartCta.onclick = () => {
                const p = products[current];
                if (p.upcoming) return;
                if (!selectedSize) {
                    notify('Vui lòng chọn kích cỡ trước khi thêm vào giỏ.', 'warn');
                    return;
                }

                bag++;
                const bagCount = document.getElementById('bagCount');
                if (bagCount) {
                    bagCount.textContent = bag;
                    bagCount.classList.remove('bump');
                    void bagCount.offsetWidth;
                    bagCount.classList.add('bump');
                }

                // Cập nhật các badge giỏ hàng khác nếu có trên giao diện (như svBagBadge)
                const svBag = document.getElementById('svBagBadge');
                if (svBag) {
                    svBag.textContent = bag;
                    svBag.style.transform = 'scale(1.4)';
                    setTimeout(() => svBag.style.transform = 'scale(1)', 250);
                }

                // Biến hình trực tiếp trên nút CTA (Chuẩn Acne Studios / Apple tối giản)
                cartCta.innerHTML = `
                    <span class="rail-btn-feedback">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        ĐÃ THÊM VÀO GIỎ (${selectedSize})
                    </span>
                `;
                cartCta.classList.add('is-added');
                cartCta.disabled = true;

                setTimeout(() => {
                    cartCta.classList.remove('is-added');
                    cartCta.disabled = false;
                    renderSizes();
                }, 2400);
            };
        }

        if (bagBtn) {
            bagBtn.onclick = () => {
                notify(bag ? `Có ${bag} sản phẩm trong giỏ hàng` : 'Giỏ hàng của bạn đang trống');
            };
        }

        if (modalExit) modalExit.onclick = closeModal;

        // Keyboard listeners
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (modalOpen) closeModal();
                else if (detailOpen) closeDetail();
                else if ($('#hnmtRackOverlay')?.classList.contains('is-active')) closeClothingRail();
            } else if (e.key === 'ArrowLeft') {
                if (detailOpen) navigate(-1);
            } else if (e.key === 'ArrowRight') {
                if (detailOpen) navigate(1);
            }
        });

        const overlay = $('#productOverlay');
        if (overlay) {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) closeDetail();
            });
        }

        makeRail();
        setActive(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
