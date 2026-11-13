/**
 * ==============================================================================
 * HNMTSHOP - CLOTHING RAIL CATALOG INTERACTIVE ENGINE
 * Sào Treo Đồ Thời Trang Độc Bản: Quần (Pants) & Áo (Shirts)
 * Tích hợp bộ lọc đa tiêu chí trực tiếp lên sào & phân trang sào tự động (> 10 sản phẩm)
 * ==============================================================================
 */
(() => {
    'use strict';

    // ==========================================================================
    const audienceClothing = JSON.parse(document.getElementById("showroomCatalog").textContent).clothing;
    const ALL_SHIRT_PRODUCTS = audienceClothing.men.ao;
    const ALL_PANTS_PRODUCTS = audienceClothing.men.quan;

    function chunkProductsIntoRacks(productList, category, isFilterResult = false, filterLabel = '') {
        if (!productList || productList.length === 0) return [];
        const racks = [];
        const totalRacks = Math.ceil(productList.length / 10);
        const catName = (category === 'quan') ? 'BỘ SƯU TẬP QUẦN' : 'BỘ SƯU TẬP ÁO';
        const brandSig = '<span>Sào Đồ</span><span>Thời Trang</span>';
        
        for (let i = 0; i < productList.length; i += 10) {
            const rackIndex = Math.floor(i / 10) + 1;
            const slice = productList.slice(i, i + 10);
            
            let badge;
            if (isFilterResult) {
                badge = `SÀO ${rackIndex}/${totalRacks} // KẾT QUẢ TÌM KIẾM`;
            } else if (category === 'quan') {
                badge = (rackIndex === 1) ? 'SÀO 01 // ESSENTIAL PANTS' : 'SÀO 02 // TAILORED & CARGO DROP';
            } else {
                badge = (rackIndex === 1) ? 'SÀO 01 // ESSENTIAL STREETWEAR' : 'SÀO 02 // WINTER DROP';
            }

            let capHead;
            if (isFilterResult) {
                capHead = `Tìm thấy ${productList.length} sản phẩm phù hợp.`;
            } else if (category === 'quan') {
                capHead = 'Bộ sưu tập quần cao cấp HNMTSHOP.';
            } else {
                capHead = 'Bộ sưu tập áo HNMTSHOP.';
            }

            let capDetail;
            if (isFilterResult) {
                capDetail = filterLabel ? `Bộ lọc: ${filterLabel} — Lướt sào hoặc chọn đồ xem chi tiết.` : 'Lướt sào hoặc chọn đồ xem chi tiết.';
            } else if (totalRacks > 1) {
                capDetail = `Sào ${rackIndex}/${totalRacks} (${slice.length} mẫu) — Bấm mũi tên để xem sào tiếp theo.`;
            } else {
                capDetail = `${slice.length} thiết kế giới hạn — Lướt sào hoặc chọn đồ xem chi tiết.`;
            }

            racks.push({
                id: `rack-${category}-${isFilterResult ? 'filter-' : ''}${rackIndex}`,
                badge: badge,
                eyebrow: catName,
                heroTitle: 'Thời Trang Độc Bản · Nâng Tầm Phong Cách',
                brandSignature: brandSig,
                captionHeading: capHead,
                captionDetail: capDetail,
                products: slice
            });
        }
        return racks;
    }

    function getAllProducts(category, audience = window.HNMTChilePortal?.getAudience?.() || 'men') {
        const kind = category === 'quan' ? 'quan' : 'ao';
        if (Object.hasOwn(audienceClothing, audience)) return audienceClothing[audience][kind];
        return kind === 'quan' ? ALL_PANTS_PRODUCTS : ALL_SHIRT_PRODUCTS;
    }

    const DEFAULT_SHIRT_RACKS = chunkProductsIntoRacks(ALL_SHIRT_PRODUCTS, 'ao', false);
    const DEFAULT_PANTS_RACKS = chunkProductsIntoRacks(ALL_PANTS_PRODUCTS, 'quan', false);

    // Trạng thái hiện tại của sào
    let currentCategory = 'ao'; // 'ao' or 'quan'
    let currentAudience = 'men';
    let currentRacks = DEFAULT_SHIRT_RACKS;
    let currentRackIdx = 0;
    let products = currentRacks[0]?.products || [];
    let isFiltered = false;
    let activeFilterLabel = '';

    const photo = (p, variant = 0) => p.photos[variant]?.front || p.frontImg;
    const sidePhoto = (p, variant = 0) => p.photos[variant]?.side || photo(p, variant);
    const backPhoto = (p, variant = 0) => p.photos[variant]?.back;
    const variantForSize = (p, size) => p.variants[p.variant || 0]?.[p.sizes.indexOf(size)];

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    const $ = s => document.querySelector(s);
    let active = -1;
    let current = 0;
    let currentViewSide = 'front';
    let detailFlipTimer;
    let selectedSize = '';
    let detailOpen = false;
    let modalOpen = false;
    const sizeNames = ['XS', 'S', 'M', 'L', 'XL'];

    // Đảm bảo nút kính lúp tìm kiếm luôn hiện diện ở Header sào
    function ensureSearchButton() {
        document.querySelectorAll('.urbn-nav-actions .rail-search-btn, .urbn-header .rail-search-btn').forEach(b => b.remove());
        const bagBtns = document.querySelectorAll('.rail-head-right .rail-bag-btn, #railHeadRight .rail-bag-btn, .sv-head-right .rail-bag-btn');
        bagBtns.forEach(bagBtn => {
            if (bagBtn.closest('.urbn-header, .urbn-nav, .urbn-nav-actions')) return;
            if (bagBtn.parentNode && !bagBtn.parentNode.querySelector('.rail-search-btn')) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'rail-search-btn';
                btn.id = 'railSearchBtn';
                btn.setAttribute('aria-label', 'Tìm kiếm đồ');
                btn.title = 'Tìm đồ nhanh (Phím tắt / hoặc Ctrl+K)';
                btn.innerHTML = `
                    <svg fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-4.35-4.35"/>
                    </svg>
                `;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentCategory === 'ao' && window.HNMTShirtFilter) {
                        window.HNMTShirtFilter.open();
                    } else if (currentCategory === 'quan' && window.HNMTPantsFilter) {
                        window.HNMTPantsFilter.open();
                    } else if (window.HNMTSpotlightSearch) {
                        window.HNMTSpotlightSearch.open(currentCategory);
                    }
                });
                bagBtn.parentNode.insertBefore(btn, bagBtn);
            }
        });

        if (!window.HNMTShirtFilter && !document.querySelector('script[src*="shirt-filter.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/shirt-filter.js?v=inject_v2';
            document.head.appendChild(s);
        }

        if (!window.HNMTPantsFilter && !document.querySelector('script[src*="pants-filter.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/pants-filter.js?v=inject_v1';
            document.head.appendChild(s);
        }

        if (!window.HNMTSpotlightSearch && !document.querySelector('script[src*="spotlight-search.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/spotlight-search.js?v=inject_v3';
            document.head.appendChild(s);
        }

        if (!window.HNMTCart && !document.querySelector('script[src*="hnmt-cart-drawer.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/hnmt-cart-drawer.js?v=cart_v1';
            document.head.appendChild(s);
        }
    }

    // Không hiển thị banner lọc đẩy lệch chữ tiêu đề theo yêu cầu người dùng
    function renderActiveFilterBanner(filterInfo, count) {
        let banner = document.getElementById('railActiveFilterBanner');
        if (banner) banner.remove();
    }

    // Dựng các móc treo đồ trên sào
    function makeRail() {
        ensureSearchButton();
        const stage = $('#railStage');
        if (!stage) return;
        stage.querySelectorAll('.slot').forEach(e => e.remove());
        const emptyBox = stage.querySelector('.rail-empty-results-box');
        if (emptyBox) emptyBox.remove();

        products.forEach((p, i) => {
            const b = document.createElement('button');
            b.className = 'slot';
            b.type = 'button';
            b.setAttribute('aria-label', `Xem ${p.name}, ${formatPrice(p.price)}`);
            b.dataset.idx = i;
            b.innerHTML = `
                <div class="garment-assembly" style="--delay:${i * 70}ms">
                    <div class="garment-turn">
                        <img class="face front" draggable="false" loading="eager" decoding="async">
                        <img class="face side" alt="" draggable="false" loading="eager" decoding="async">
                    </div>
                </div>`;

            const front = b.querySelector('.face.front');
            front.alt = p.name;
            front.src = photo(p, p.variant || 0);
            b.querySelector('.face.side').src = sidePhoto(p, p.variant || 0);
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
        if (products.length === 0) return;
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
        if (!products || products.length === 0) return;
        current = idx;
        currentViewSide = 'front';
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
        if (products.length === 0) return;
        current = (current + dir + products.length) % products.length;
        currentViewSide = 'front';
        selectedSize = '';
        renderDetail();
    }

    // Áp dụng cấu hình của sào hiện tại lên giao diện
    function applyRack(currentRack) {
        if (!currentRack) {
            products = [];
            active = -1;
            makeRail();
            for (const id of ['rackPrevBtn', 'rackNextBtn']) {
                const button = document.getElementById(id);
                if (button) button.style.display = 'none';
            }
            return;
        }
        products = currentRack.products || [];

        const eyebrowEl = $('.rail-eyebrow');
        if (eyebrowEl) eyebrowEl.textContent = (currentCategory === 'quan') ? 'BỘ SƯU TẬP QUẦN' : 'BỘ SƯU TẬP ÁO';

        const heroTitleEl = $('.rail-hero-title');
        if (heroTitleEl) heroTitleEl.innerHTML = currentRack.heroTitle || 'Thời Trang Độc Bản · Nâng Tầm Phong Cách';

        const brandEl = $('.rail-brand');
        if (brandEl && currentRack.brandSignature) {
            brandEl.innerHTML = currentRack.brandSignature;
        }

        const capTitleEl = $('#captionTitle');
        const capDetailEl = $('#captionDetail');
        if (capTitleEl && currentRack.captionHeading) capTitleEl.textContent = currentRack.captionHeading;
        if (capDetailEl && currentRack.captionDetail) capDetailEl.textContent = currentRack.captionDetail;

        // Quản lý hiển thị nút chuyển sào: Hiện khi số sào > 1, ẩn khi chỉ có 1 sào
        const prevRackBtn = $('#rackPrevBtn');
        const nextRackBtn = $('#rackNextBtn');
        const showArrows = currentRacks.length > 1;
        if (prevRackBtn) {
            prevRackBtn.style.display = showArrows ? 'inline-flex' : 'none';
            prevRackBtn.title = `Sào trước (${currentRackIdx === 0 ? currentRacks.length : currentRackIdx}/${currentRacks.length})`;
        }
        if (nextRackBtn) {
            nextRackBtn.style.display = showArrows ? 'inline-flex' : 'none';
            nextRackBtn.title = `Sào tiếp theo (${(currentRackIdx + 1) % currentRacks.length + 1}/${currentRacks.length})`;
        }

        makeRail();
        const scroll = $('#railScroll');
        if (scroll) scroll.scrollLeft = 0;
        active = -1;
        if (products.length > 0) {
            setActive(0);
        }
    }

    // Chuyển sào đồ (Off the Rail Switcher)
    function switchRack(dir) {
        if (detailOpen) closeDetail();
        if (currentRacks.length <= 1) return;
        const stage = $('#railStage');
        if (stage) stage.classList.add('is-switching');

        setTimeout(() => {
            currentRackIdx = (currentRackIdx + dir + currentRacks.length) % currentRacks.length;
            applyRack(currentRacks[currentRackIdx]);
            setTimeout(() => {
                if (stage) stage.classList.remove('is-switching');
            }, 60);
        }, 220);
    }

    // Chi tiết sản phẩm Modal
    function renderDetail() {
        clearTimeout(detailFlipTimer);
        const p = products[current];
        if (!p) return;
        const v = p.variant || 0;

        const nameEl = $('#detailName');
        const priceEl = $('#detailPrice');
        const descEl = $('#description');
        const imgEl = $('#detailImage');
        const typeEl = $('#detailType');

        if (nameEl) nameEl.textContent = p.name;
        if (priceEl) priceEl.textContent = formatPrice(p.price);
        if (descEl) {
            const description = (p.desc || '').trim();
            const showDescription = Boolean(description) && description !== p.name.trim();
            descEl.hidden = !showDescription;
            descEl.textContent = showDescription ? description : '';
        }
        if (typeEl) typeEl.textContent = p.type ? `// ${p.type.toUpperCase()}` : '// THIẾT KẾ GIỚI HẠN';
        const hasBackPhoto = Boolean(backPhoto(p, v));
        if (!hasBackPhoto) currentViewSide = 'front';

        const updateDetailImage = () => {
            if (!imgEl) return;
            const showBack = currentViewSide === 'back';
            imgEl.src = showBack ? backPhoto(p, v) : photo(p, v);
            imgEl.alt = `${p.name} - ${showBack ? 'mặt sau' : 'mặt trước'}`;
            imgEl.classList.remove('is-flipping');
        };
        updateDetailImage();

        const viewSwitchEl = $('#viewSwitch');
        if (viewSwitchEl) viewSwitchEl.hidden = !hasBackPhoto;
        if (viewSwitchEl && hasBackPhoto) {
            const opts = viewSwitchEl.querySelectorAll('.rail-view-opt');
            opts.forEach(opt => {
                const side = opt.dataset.view;
                const isActive = (side === currentViewSide);
                opt.classList.toggle('is-active', isActive);
                opt.classList.toggle('is-dimmed', !isActive);
                opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
                opt.onclick = () => {
                    if (currentViewSide === side) return;
                    currentViewSide = side;

                    if (imgEl) {
                        clearTimeout(detailFlipTimer);
                        imgEl.classList.add('is-flipping');
                        detailFlipTimer = setTimeout(updateDetailImage, 180);
                    }

                    opts.forEach(o => {
                        const act = (o.dataset.view === currentViewSide);
                        o.classList.toggle('is-active', act);
                        o.classList.toggle('is-dimmed', !act);
                        o.setAttribute('aria-selected', act ? 'true' : 'false');
                    });
                };
            });
        }

        const totalStock = (p.variants[v] || []).reduce((total, variant) => total + (variant?.stock || 0), 0);
        const low = totalStock > 0 && totalStock <= 15;
        const st = $('#stockStatus');
        if (st) {
            st.textContent = p.upcoming ? 'Ra mắt Thứ Sáu' : !totalStock ? 'Hết hàng' : low ? 'Sắp hết hàng' : 'Còn hàng';
            st.classList.toggle('low', low && !p.upcoming);
        }

        const colorsEl = $('#colors');
        if (colorsEl) {
            colorsEl.innerHTML = '';
            (p.colors || []).forEach((c, idx) => {
                const btn = document.createElement('button');
                btn.className = 'rail-color-choice' + (idx === v ? ' selected' : '');
                btn.style.background = c[1];
                btn.title = c[0];
                btn.setAttribute('aria-label', c[0]);
                btn.onclick = () => {
                    p.variant = idx;
                    if (!variantForSize(p, selectedSize)?.stock) selectedSize = '';
                    const slot = document.querySelector(`.slot[data-idx="${current}"]`);
                    const slotFront = slot?.querySelector('.face.front');
                    if (slotFront) slotFront.src = photo(p, idx);
                    const slotSide = slot?.querySelector('.face.side');
                    if (slotSide) slotSide.src = sidePhoto(p, idx);
                    renderDetail();
                };
                colorsEl.append(btn);
            });
        }

        const sizesEl = $('#sizes');
        if (sizesEl) {
            sizesEl.innerHTML = '';
            const currentSizes = p.sizes || sizeNames;
            currentSizes.forEach((size, idx) => {
                const b = document.createElement('button');
                b.className = 'rail-size-chip' + (selectedSize === size ? ' selected' : '');
                b.textContent = size;
                const stock = p.variants[v]?.[idx]?.stock || 0;
                b.disabled = p.upcoming || !stock;
                b.title = b.disabled ? 'Hết hàng' : `Còn ${stock} sản phẩm`;
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
        if (!p) return;
        document.querySelectorAll('.rail-size-chip').forEach(b => {
            b.classList.toggle('selected', b.textContent === selectedSize);
        });

        const variant = variantForSize(p, selectedSize);
        const count = variant?.stock || 0;
        const hintEl = $('#sizeHint');
        if (hintEl) {
            hintEl.textContent = selectedSize && count <= 2 && count > 0 ? `Chỉ còn ${count} sản phẩm size ${selectedSize}` : '';
        }

        const cartCta = $('#cartCta');
        if (cartCta) {
            cartCta.textContent = p.upcoming 
                ? 'NHẬN THÔNG BÁO KHI RA MẮT' 
                : selectedSize 
                    ? `THÊM VÀO GIỎ · ${formatPrice((variant?.price ?? p.price * 10000) / 10000)}`
                    : 'CHỌN KÍCH CỠ';
            cartCta.disabled = p.upcoming || !selectedSize || !count;
        }
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

    function openClothingRail(category = 'ao', audience = window.HNMTChilePortal?.getAudience?.() || 'men') {
        currentCategory = (category === 'quan') ? 'quan' : 'ao';
        currentAudience = audience;
        isFiltered = false;
        activeFilterLabel = '';
        renderActiveFilterBanner(null, null);

        currentRacks = chunkProductsIntoRacks(getAllProducts(currentCategory, currentAudience), currentCategory);
        currentRackIdx = 0;

        const rackOverlayEl = document.getElementById('hnmtRackOverlay');
        if (rackOverlayEl) {
            rackOverlayEl.classList.add('is-active');
            rackOverlayEl.setAttribute('aria-hidden', 'false');

            const promptEl = document.querySelector('.hnmt-portal-footer');
            const portalHeaderEl = document.querySelector('.hnmt-portal-header');
            if (promptEl) promptEl.style.display = 'none';
            if (portalHeaderEl) portalHeaderEl.style.display = 'none';

            applyRack(currentRacks[0]);
        }
    }

    // Chọn và phóng to chi tiết một món đồ cụ thể
    function selectProduct(category, slugOrIdx) {
        const audience = window.HNMTChilePortal?.getAudience?.() || 'men';
        if (currentAudience !== audience || (category && currentCategory !== category)) {
            openClothingRail(category || currentCategory, audience);
        } else {
            const rackOverlayEl = document.getElementById('hnmtRackOverlay');
            if (rackOverlayEl && !rackOverlayEl.classList.contains('is-active')) {
                openClothingRail(category || currentCategory);
            }
        }

        let foundRackIdx = -1;
        let foundProdIdx = -1;

        currentRacks.forEach((rack, rIdx) => {
            rack.products.forEach((p, pIdx) => {
                if (p.slug === slugOrIdx || p.name === slugOrIdx || pIdx === slugOrIdx) {
                    foundRackIdx = rIdx;
                    foundProdIdx = pIdx;
                }
            });
        });

        if (foundRackIdx !== -1 && foundProdIdx !== -1) {
            if (currentRackIdx !== foundRackIdx) {
                applyRack(currentRacks[foundRackIdx]);
            }
            setTimeout(() => {
                setActive(foundProdIdx);
                openDetail(foundProdIdx);
            }, 120);
        }
    }

    // ==========================================================================
    // 4. BỘ LỌC ĐA TIÊU CHÍ TRỰC TIẾP LÊN SÀO (DYNAMIC RAIL FILTER ENGINE)
    // ==========================================================================
    function applyFilter(filteredList, filterLabel = '') {
        if (!filteredList) {
            resetFilter();
            return;
        }

        const catalog = getAllProducts(currentCategory, currentAudience);
        filteredList = filteredList.filter(product => catalog.some(item => item.slug === product.slug));
        isFiltered = true;
        activeFilterLabel = filterLabel;

        const catName = (currentCategory === 'quan') ? 'BỘ SƯU TẬP QUẦN' : 'BỘ SƯU TẬP ÁO';
        const brandSig = '<span>Sào Đồ</span><span>Thời Trang</span>';

        if (filteredList.length === 0) {
            // Không tìm thấy sản phẩm nào: Để sào đồ trống trơn, không hiện hộp thông báo rườm rà
            currentRacks = [{
                id: `rack-${currentCategory}-empty`,
                badge: `BỘ SƯU TẬP // 0 SẢN PHẨM`,
                eyebrow: catName,
                heroTitle: currentRacks && currentRacks[0] ? currentRacks[0].heroTitle : (currentCategory === 'quan' ? 'Quần' : 'Bộ Sưu Tập Áo'),
                brandSignature: brandSig,
                captionHeading: '',
                captionDetail: '',
                products: []
            }];
            currentRackIdx = 0;
            applyRack(currentRacks[0]);

            // Dọn sạch móc treo, sào đồ trống trơn thanh thoát
            const stage = $('#railStage');
            if (stage) {
                stage.querySelectorAll('.slot').forEach(e => e.remove());
                const emptyNotice = stage.querySelector('.rail-empty-results-box');
                if (emptyNotice) emptyNotice.remove();
            }
            return;
        }

        // Tự động chia thành các sào liên tiếp nếu > 10 sản phẩm
        currentRacks = chunkProductsIntoRacks(filteredList, currentCategory, true, filterLabel);
        currentRackIdx = 0;
        applyRack(currentRacks[0]);
        renderActiveFilterBanner(filterLabel, filteredList.length);
    }

    // Đặt lại bộ lọc -> Trở về mặc định hiển thị tất cả
    function resetFilter() {
        isFiltered = false;
        activeFilterLabel = '';
        renderActiveFilterBanner(null, null);

        const stage = $('#railStage');
        const emptyNotice = stage?.querySelector('.rail-empty-results-box');
        if (emptyNotice) emptyNotice.remove();

        currentRacks = chunkProductsIntoRacks(getAllProducts(currentCategory, currentAudience), currentCategory);
        currentRackIdx = 0;
        applyRack(currentRacks[0]);
    }

    // ==========================================================================
    // 5. EXPORT PUBLIC API
    // ==========================================================================
    window.open3DClothesRack = openClothingRail;
    window.open3DPantsRack = function () { openClothingRail('quan'); };
    window.close3DClothesRack = closeClothingRail;
    window.close3DPantsRack = closeClothingRail;

    window.ClothingRail = {
        openClothingRail,
        closeClothingRail,
        selectProduct,
        applyFilter,
        resetFilter,
        getCategory: () => currentCategory,
        setCategory: (cat) => { openClothingRail(cat); },
        getAllProducts,
        SHIRT_RACKS: DEFAULT_SHIRT_RACKS,
        PANTS_RACKS: DEFAULT_PANTS_RACKS,
        ALL_SHIRT_PRODUCTS,
        ALL_PANTS_PRODUCTS
    };

    // ==========================================================================
    // 6. KHỞI TẠO EVENT LISTENERS & DOM
    // ==========================================================================
    function init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const catParam = urlParams.get('category') || urlParams.get('cat');
            if (catParam === 'quan') {
                currentCategory = 'quan';
                currentRacks = DEFAULT_PANTS_RACKS;
                currentRackIdx = 0;
                products = currentRacks[0]?.products || [];
            }
        } catch (e) {}

        ensureSearchButton();
        setInterval(ensureSearchButton, 600);

        const prevBtn = $('#prevBtn');
        const nextBtn = $('#nextBtn');
        const closeBtn = $('#closeBtn');
        const availBtn = $('#availabilityBtn');
        const cartCta = $('#cartCta');
        const bagBtn = $('#bagBtn');
        const brandSig = $('#railBrandSignature');
        const backToLobbyBtn = $('#hnmtRackBackToLobbyBtn');
        const modalExit = $('#modalExit');

        if (bagBtn) {
            bagBtn.onclick = (e) => {
                e.stopPropagation();
                if (window.HNMTCart) {
                    window.HNMTCart.open();
                }
            };
        }

        // Nút chuyển sào tiếp theo / sào trước
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
            cartCta.onclick = async () => {
                const p = products[current];
                if (!p || p.upcoming || !selectedSize || !window.HNMTCart) return;
                const size = selectedSize;
                const variant = variantForSize(p, size);
                if (!variant?.stock) return;

                cartCta.disabled = true;
                const added = await window.HNMTCart.addItem({
                    name: p.name,
                    productId: p.productId,
                    variantId: variant.id,
                    quantity: 1
                });
                if (!added || products[current] !== p || selectedSize !== size) {
                    renderSizes();
                    return;
                }

                cartCta.textContent = `ĐÃ THÊM VÀO GIỎ (SIZE ${size})`;
                cartCta.classList.add('is-added');

                setTimeout(() => {
                    cartCta.classList.remove('is-added');
                    renderSizes();
                }, 2400);
            };
        }

        if (modalExit) modalExit.onclick = closeModal;

        // Phím tắt bàn phím
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (window.HNMTPantsFilter && document.getElementById('hnmtPantsFilterModal')?.classList.contains('is-open')) {
                    window.HNMTPantsFilter.close();
                } else if (window.HNMTShirtFilter && document.getElementById('hnmtShirtFilterModal')?.classList.contains('is-open')) {
                    window.HNMTShirtFilter.close();
                } else if (modalOpen) closeModal();
                else if (detailOpen) closeDetail();
                else if ($('#hnmtRackOverlay')?.classList.contains('is-active')) closeClothingRail();
            } else if (e.key === 'ArrowLeft') {
                if (detailOpen) navigate(-1);
            } else if (e.key === 'ArrowRight') {
                if (detailOpen) navigate(1);
            } else if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && 
                       !document.getElementById('hnmtShirtFilterModal')?.classList.contains('is-open') &&
                       !document.getElementById('hnmtPantsFilterModal')?.classList.contains('is-open')) {
                const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
                if (activeTag !== 'input' && activeTag !== 'textarea') {
                    if (currentCategory === 'quan' && window.HNMTPantsFilter) {
                        e.preventDefault();
                        window.HNMTPantsFilter.open();
                    } else if (currentCategory === 'ao' && window.HNMTShirtFilter) {
                        e.preventDefault();
                        window.HNMTShirtFilter.open();
                    }
                }
            }
        });

        const overlay = $('#productOverlay');
        if (overlay) {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) closeDetail();
            });
        }

        applyRack(currentRacks[0]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
