/**
 * ==============================================================================
 * HNMTSHOP - SPOTLIGHT MULTI-CRITERIA SEARCH & FILTER PALETTE
 * Tìm kiếm & Lọc đa tiêu chí: Giá, Kiểu dáng, Màu sắc, Tên
 * Tự động đẩy kết quả lên Sào Treo Đồ 3D & Phân trang sào (> 10 sản phẩm)
 * ==============================================================================
 */
(function () {
    'use strict';

    // Helper: Bỏ dấu tiếng Việt để tìm kiếm không dấu
    function removeVietnameseTones(str) {
        if (!str) return '';
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
        str = str.replace(/\u02C6|\u0306|\u031B/g, '');
        return str.trim();
    }

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    // Định nghĩa các tiêu chí lọc theo Danh mục
    const FILTER_DEFINITIONS = {
        prices: [
            { id: 'all', label: 'Tất cả giá' },
            { id: 'under500', label: '< 500k', min: 0, max: 50 },
            { id: '500to700', label: '500k - 700k', min: 50, max: 70 },
            { id: 'over700', label: '> 700k', min: 70, max: 9999 }
        ],
        styles: {
            all: [
                { id: 'all', label: 'Tất cả kiểu' },
                { id: 'jeans', label: 'Quần Jeans' },
                { id: 'tay', label: 'Quần Tây' },
                { id: 'cargo', label: 'Cargo Túi Hộp' },
                { id: 'tee', label: 'Áo Thun (Tee)' },
                { id: 'shirt', label: 'Sơ Mi (Shirt)' },
                { id: 'jacket', label: 'Áo Khoác (Jacket)' },
                { id: 'sneaker', label: 'Sneaker' }
            ],
            quan: [
                { id: 'all', label: 'Tất cả kiểu quần' },
                { id: 'jeans', label: 'Quần Jeans' },
                { id: 'tay', label: 'Quần Tây' },
                { id: 'cargo', label: 'Cargo Túi Hộp' },
                { id: 'parachute', label: 'Parachute Dù' }
            ],
            ao: [
                { id: 'all', label: 'Tất cả kiểu áo' },
                { id: 'tee', label: 'Áo Thun (Tee)' },
                { id: 'shirt', label: 'Sơ Mi (Shirt)' },
                { id: 'jacket', label: 'Áo Khoác (Jacket)' },
                { id: 'hoodie', label: 'Áo Nỉ / Hoodie' }
            ],
            giay: [
                { id: 'all', label: 'Tất cả sneaker' },
                { id: 'runner', label: 'Cyber Runner' },
                { id: 'hightop', label: 'High-Top Futuristic' },
                { id: 'retro', label: 'Chunky Retro' }
            ]
        },
        colors: [
            { id: 'all', label: 'Tất cả màu', dot: null },
            { id: 'black', label: 'Đen', dot: '#111215' },
            { id: 'white', label: 'Trắng / Be', dot: '#EAE6DF' },
            { id: 'blue', label: 'Xanh (Indigo/Navy)', dot: '#1F3A60' },
            { id: 'gray', label: 'Xám Wash', dot: '#52555E' },
            { id: 'green', label: 'Xanh Rêu', dot: '#444D34' }
        ]
    };

    // State quản lý bộ lọc
    let activeCategory = 'all'; // 'all', 'quan', 'ao', 'giay'
    let selectedPrice = 'all';
    let selectedStyle = 'all';
    let selectedColor = 'all';
    let searchKeyword = '';
    let selectedIndex = 0;
    let filteredResults = [];

    // Thu thập tất cả sản phẩm từ các Controller / Engine
    function getAllProducts() {
        const items = [];

        // 1. Quần (Pants)
        const pants = window.ClothingRail?.ALL_PANTS_PRODUCTS || [];
        pants.forEach((p, pIdx) => {
            const colorNames = (p.colors || []).map(c => c[0]).join(' ');
            items.push({
                id: 'p-' + p.slug,
                name: p.name,
                slug: p.slug,
                category: 'quan',
                categoryName: 'Sào Quần',
                categoryBadgeClass: 'cat-quan',
                priceNum: p.price,
                priceDisplay: formatPrice(p.price),
                style: p.style || 'jeans',
                colorGroup: p.colorGroup || 'gray',
                colorName: colorNames,
                desc: p.desc || 'Quần cao cấp thiết kế độc bản',
                image: p.frontImg || `/clothing-rail/assets/${p.slug}-front.webp`,
                rawItem: p,
                tags: ['quan', 'pants', 'trousers', p.slug, p.type || '', p.style || '', colorNames]
            });
        });

        // 2. Áo (Shirts & Tops)
        const shirts = window.ClothingRail?.ALL_SHIRT_PRODUCTS || [];
        shirts.forEach((p, pIdx) => {
            const colorNames = (p.colors || []).map(c => c[0]).join(' ');
            items.push({
                id: 's-' + p.slug,
                name: p.name,
                slug: p.slug,
                category: 'ao',
                categoryName: 'Sào Áo',
                categoryBadgeClass: 'cat-ao',
                priceNum: p.price,
                priceDisplay: formatPrice(p.price),
                style: p.style || 'tee',
                colorGroup: p.colorGroup || 'black',
                colorName: colorNames,
                desc: p.desc || 'Áo thiết kế độc bản nâng tầm phong cách',
                image: p.frontImg || `/clothing-rail/assets/${p.slug}-front.webp`,
                rawItem: p,
                tags: ['ao', 'shirt', 'top', 'tee', p.slug, p.type || '', p.style || '', colorNames]
            });
        });

        // 3. Giày Sneaker
        const collections = window.SneakerVault?.getCollections() || [];
        collections.forEach((col, cIdx) => {
            (col.items || []).forEach((s, sIdx) => {
                const sPriceNum = Math.round((s.price || 5200000) / 100000); // quy về scale
                let sStyle = 'runner';
                if (s.model && s.model.toLowerCase().includes('high')) sStyle = 'hightop';
                else if (s.model && s.model.toLowerCase().includes('storm')) sStyle = 'retro';

                let sColor = 'black';
                const colName = (s.colorName || s.colorway || '').toLowerCase();
                if (colName.includes('white') || colName.includes('bạc') || colName.includes('trắng')) sColor = 'white';
                else if (colName.includes('blue') || colName.includes('xanh')) sColor = 'blue';
                else if (colName.includes('green') || colName.includes('rêu')) sColor = 'green';
                else if (colName.includes('grey') || colName.includes('xám')) sColor = 'gray';

                items.push({
                    id: s.id || 'snk-' + sIdx,
                    name: `${s.model} — ${s.colorway}`,
                    slug: s.id,
                    category: 'giay',
                    categoryName: 'Tủ Giày',
                    categoryBadgeClass: 'cat-giay',
                    priceNum: sPriceNum,
                    priceDisplay: (s.price || 5200000).toLocaleString('vi-VN') + ' ₫',
                    style: sStyle,
                    colorGroup: sColor,
                    colorName: s.colorName || s.colorway,
                    desc: `${s.designer || 'HNMTSHOP'} · ${s.colorName || s.colorway}`,
                    image: s.image,
                    collectionIndex: cIdx,
                    sneakerIndex: sIdx,
                    rawItem: s,
                    tags: ['giay', 'sneaker', 'shoes', s.model, s.colorway, s.colorName || '', sStyle]
                });
            });
        });

        return items;
    }

    // Đảm bảo DOM Spotlight Modal có đầy đủ khung lọc đa tiêu chí
    function ensureModalDOM() {
        let modal = document.getElementById('hnmtSpotlightSearchModal');
        const modalTemplate = `
            <div class="hnmt-spotlight-backdrop" id="spotlightBackdrop"></div>
            <div class="hnmt-spotlight-dialog" role="dialog" aria-modal="true" aria-label="Tìm kiếm sản phẩm nhanh">
                <!-- Search Input Header -->
                <div class="hnmt-spotlight-search-header">
                    <div class="hnmt-spotlight-input-wrap">
                        <svg class="hnmt-spotlight-search-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-4.35-4.35"/>
                        </svg>
                        <input type="text" id="hnmtSpotlightInput" class="hnmt-spotlight-input" placeholder="Tìm kiếm theo tên đồ hoặc từ khóa... (Enter để đẩy lên sào)" autocomplete="off" spellcheck="false">
                        <button type="button" id="hnmtSpotlightClearBtn" class="hnmt-spotlight-clear-btn" aria-label="Xóa từ khóa" style="display: none;">
                            <i class="bi bi-x-lg"></i>
                        </button>
                        <button type="button" id="hnmtSpotlightSubmitBtn" class="hnmt-spotlight-submit-btn" title="Tìm kiếm và đưa ra sào (Enter)">
                            <i class="bi bi-search"></i>
                            <span>TÌM KIẾM</span>
                        </button>
                    </div>
                    <div class="hnmt-spotlight-meta">
                        <button type="button" class="hnmt-spotlight-esc-pill" id="spotlightClosePillBtn">ESC ĐÓNG</button>
                    </div>
                </div>

                <!-- Category Tabs -->
                <div class="hnmt-spotlight-tabs" id="spotlightTabs">
                    <button type="button" class="hnmt-spotlight-tab is-active" data-cat="all">Tất Cả <span class="tab-count" id="tabCountAll">0</span></button>
                    <button type="button" class="hnmt-spotlight-tab" data-cat="quan">Sào Quần <span class="tab-count" id="tabCountQuan">12</span></button>
                    <button type="button" class="hnmt-spotlight-tab" data-cat="ao">Sào Áo <span class="tab-count" id="tabCountAo">15</span></button>
                    <button type="button" class="hnmt-spotlight-tab" data-cat="giay">Tủ Giày <span class="tab-count" id="tabCountGiay">18</span></button>
                </div>

                <!-- Multi-criteria Filter Section -->
                <div class="hnmt-spotlight-filter-panel" id="spotlightFilterPanel">
                    <!-- Row 1: Khoảng Giá -->
                    <div class="spotlight-filter-row">
                        <span class="filter-row-label">Khoảng Giá:</span>
                        <div class="filter-pills-wrap" id="pricePillsContainer"></div>
                    </div>

                    <!-- Row 2: Kiểu Cách / Loại Đồ -->
                    <div class="spotlight-filter-row">
                        <span class="filter-row-label">Kiểu Dáng:</span>
                        <div class="filter-pills-wrap" id="stylePillsContainer"></div>
                    </div>

                    <!-- Row 3: Màu Sắc -->
                    <div class="spotlight-filter-row">
                        <span class="filter-row-label">Màu Sắc:</span>
                        <div class="filter-pills-wrap" id="colorPillsContainer"></div>
                    </div>

                    <!-- Action Bar: Đếm số lượng, Reset & Đẩy lên sào -->
                    <div class="spotlight-filter-action-bar">
                        <div class="filter-match-stat">
                            <span class="stat-dot"></span>
                            <span>Phù hợp: <strong id="spotlightMatchCount">0</strong> sản phẩm</span>
                        </div>
                        <div class="filter-action-btns">
                            <button type="button" id="spotlightResetFilterBtn" class="spotlight-reset-btn" title="Đặt lại bộ lọc về mặc định">
                                <i class="bi bi-arrow-counterclockwise"></i>
                                <span>Đặt lại</span>
                            </button>
                            <button type="button" id="spotlightApplyToRailBtn" class="spotlight-apply-rail-cta" title="Đẩy các sản phẩm phù hợp ra trên sào đồ (Enter)">
                                <i class="bi bi-funnel-fill"></i>
                                <span>ÁP DỤNG LÊN SÀO (<strong id="spotlightRailCount">0</strong>)</span>
                                <kbd>↵ ENTER</kbd>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Results Preview List -->
                <div class="hnmt-spotlight-results" id="spotlightResults"></div>

                <!-- Empty State Notice -->
                <div class="hnmt-spotlight-empty" id="spotlightEmpty" style="display: none;">
                    <div class="empty-icon">🔍</div>
                    <p class="empty-title">Không tìm thấy sản phẩm phù hợp</p>
                    <p class="empty-desc">Thử chọn "Tất cả giá", "Tất cả màu" hoặc bấm "Đặt lại" để xem toàn bộ bộ sưu tập trên sào.</p>
                </div>

                <!-- Footer Hint -->
                <div class="hnmt-spotlight-footer">
                    <div class="spotlight-hint">
                        <span><kbd>ENTER</kbd> Đẩy đồ lên sào</span>
                        <span><kbd>↑</kbd><kbd>↓</kbd> Chọn nhanh</span>
                        <span><kbd>ESC</kbd> Đóng</span>
                    </div>
                    <div class="spotlight-brand">HNMTSHOP // FAST FIND & RAIL FILTER</div>
                </div>
            </div>
        `;

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtSpotlightSearchModal';
            modal.className = 'hnmt-spotlight-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = modalTemplate;
            document.body.appendChild(modal);
        } else if (!modal.querySelector('#spotlightFilterPanel')) {
            // Thay thế nội dung nếu modal cũ chưa có filter panel
            modal.innerHTML = modalTemplate;
        }

        return modal;
    }

    function initSpotlight() {
        const modal = ensureModalDOM();
        const input = document.getElementById('hnmtSpotlightInput');
        const clearBtn = document.getElementById('hnmtSpotlightClearBtn');
        const submitBtn = document.getElementById('hnmtSpotlightSubmitBtn');
        const closePillBtn = document.getElementById('spotlightClosePillBtn');
        const backdrop = document.getElementById('spotlightBackdrop');
        const tabs = document.querySelectorAll('.hnmt-spotlight-tab');
        const resultsEl = document.getElementById('spotlightResults');
        const emptyEl = document.getElementById('spotlightEmpty');
        const priceContainer = document.getElementById('pricePillsContainer');
        const styleContainer = document.getElementById('stylePillsContainer');
        const colorContainer = document.getElementById('colorPillsContainer');
        const applyRailBtn = document.getElementById('spotlightApplyToRailBtn');
        const resetFilterBtn = document.getElementById('spotlightResetFilterBtn');

        if (!modal || !input) return;

        // Cập nhật số lượng đếm trên Tabs
        function updateTabCounts() {
            const allItems = getAllProducts();
            const qCount = allItems.filter(i => i.category === 'quan').length;
            const aCount = allItems.filter(i => i.category === 'ao').length;
            const gCount = allItems.filter(i => i.category === 'giay').length;

            const tcAll = document.getElementById('tabCountAll');
            const tcQ = document.getElementById('tabCountQuan');
            const tcA = document.getElementById('tabCountAo');
            const tcG = document.getElementById('tabCountGiay');

            if (tcAll) tcAll.textContent = allItems.length;
            if (tcQ) tcQ.textContent = qCount;
            if (tcA) tcA.textContent = aCount;
            if (tcG) tcG.textContent = gCount;
        }

        // Render các Pills Khoảng Giá
        function renderPricePills() {
            if (!priceContainer) return;
            priceContainer.innerHTML = '';
            FILTER_DEFINITIONS.prices.forEach(p => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'spotlight-filter-pill' + (selectedPrice === p.id ? ' is-active' : '');
                btn.textContent = p.label;
                btn.addEventListener('click', () => {
                    selectedPrice = p.id;
                    renderPricePills();
                    performSearch();
                });
                priceContainer.appendChild(btn);
            });
        }

        // Render các Pills Kiểu Dáng theo tab hiện tại
        function renderStylePills() {
            if (!styleContainer) return;
            styleContainer.innerHTML = '';
            const styles = FILTER_DEFINITIONS.styles[activeCategory] || FILTER_DEFINITIONS.styles.all;
            styles.forEach(s => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'spotlight-filter-pill' + (selectedStyle === s.id ? ' is-active' : '');
                btn.textContent = s.label;
                btn.addEventListener('click', () => {
                    selectedStyle = s.id;
                    renderStylePills();
                    performSearch();
                });
                styleContainer.appendChild(btn);
            });
        }

        // Render các Pills Màu Sắc
        function renderColorPills() {
            if (!colorContainer) return;
            colorContainer.innerHTML = '';
            FILTER_DEFINITIONS.colors.forEach(c => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'spotlight-filter-pill' + (selectedColor === c.id ? ' is-active' : '');
                if (c.dot) {
                    btn.innerHTML = `<span class="pill-color-dot" style="background:${c.dot};"></span>${c.label}`;
                } else {
                    btn.textContent = c.label;
                }
                btn.addEventListener('click', () => {
                    selectedColor = c.id;
                    renderColorPills();
                    performSearch();
                });
                colorContainer.appendChild(btn);
            });
        }

        // Kiểm tra khớp từ khóa
        function matchesKeyword(item, normalizedQuery) {
            if (!normalizedQuery) return true;
            const matchName = removeVietnameseTones(item.name).includes(normalizedQuery);
            const matchDesc = removeVietnameseTones(item.desc).includes(normalizedQuery);
            const matchCat = removeVietnameseTones(item.categoryName).includes(normalizedQuery);
            const matchTags = (item.tags || []).some(t => removeVietnameseTones(t).includes(normalizedQuery));
            return matchName || matchDesc || matchCat || matchTags;
        }

        // Kiểm tra khớp khoảng giá
        function matchesPrice(item, priceId) {
            if (priceId === 'all') return true;
            const def = FILTER_DEFINITIONS.prices.find(p => p.id === priceId);
            if (!def) return true;
            return item.priceNum >= def.min && item.priceNum <= def.max;
        }

        // Kiểm tra khớp kiểu dáng
        function matchesStyle(item, styleId) {
            if (styleId === 'all') return true;
            if (item.style === styleId) return true;
            const target = removeVietnameseTones(styleId);
            const itemStyle = removeVietnameseTones(item.style || '');
            const itemDesc = removeVietnameseTones(item.desc || '');
            const itemName = removeVietnameseTones(item.name || '');
            const itemTags = (item.tags || []).map(t => removeVietnameseTones(t)).join(' ');

            return itemStyle.includes(target) || itemDesc.includes(target) || itemName.includes(target) || itemTags.includes(target);
        }

        // Kiểm tra khớp màu sắc
        function matchesColor(item, colorId) {
            if (colorId === 'all') return true;
            if (item.colorGroup === colorId) return true;
            const colDef = FILTER_DEFINITIONS.colors.find(c => c.id === colorId);
            if (!colDef) return true;
            const target = removeVietnameseTones(colDef.label);
            const itemColor = removeVietnameseTones(item.colorName || '');
            const itemDesc = removeVietnameseTones(item.desc || '');
            return itemColor.includes(target) || itemDesc.includes(target);
        }

        // Thực hiện lọc theo toàn bộ tiêu chí kết hợp
        function performSearch() {
            const allItems = getAllProducts();
            const normalizedQuery = removeVietnameseTones(searchKeyword);

            filteredResults = allItems.filter(item => {
                // 1. Phân loại theo tab (nếu tab không phải 'all')
                if (activeCategory !== 'all' && item.category !== activeCategory) {
                    return false;
                }
                // 2. Lọc theo giá
                if (!matchesPrice(item, selectedPrice)) {
                    return false;
                }
                // 3. Lọc theo kiểu dáng
                if (!matchesStyle(item, selectedStyle)) {
                    return false;
                }
                // 4. Lọc theo màu sắc
                if (!matchesColor(item, selectedColor)) {
                    return false;
                }
                // 5. Lọc theo từ khóa tên / mô tả
                if (!matchesKeyword(item, normalizedQuery)) {
                    return false;
                }

                return true;
            });

            // Cập nhật số đếm
            const matchCountEl = document.getElementById('spotlightMatchCount');
            const railCountEl = document.getElementById('spotlightRailCount');
            if (matchCountEl) matchCountEl.textContent = filteredResults.length;
            if (railCountEl) railCountEl.textContent = filteredResults.length;

            selectedIndex = 0;
            renderResultsList();
        }

        // Render danh sách xem trước
        function renderResultsList() {
            if (!resultsEl) return;
            resultsEl.innerHTML = '';

            if (filteredResults.length === 0) {
                if (emptyEl) emptyEl.style.display = 'block';
                return;
            }

            if (emptyEl) emptyEl.style.display = 'none';

            filteredResults.forEach((item, idx) => {
                const card = document.createElement('div');
                card.className = 'spotlight-item-card' + (idx === selectedIndex ? ' is-selected' : '');
                card.dataset.index = idx;

                card.innerHTML = `
                    <div class="spotlight-thumb-box">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="spotlight-item-info">
                        <div class="spotlight-item-meta">
                            <span class="spotlight-cat-badge ${item.categoryBadgeClass}">${item.categoryName}</span>
                            <span class="spotlight-style-tag">${item.style ? item.style.toUpperCase() : ''}</span>
                        </div>
                        <div class="spotlight-item-name">${item.name}</div>
                        <div class="spotlight-item-desc">${item.desc}</div>
                    </div>
                    <div class="spotlight-item-price-col">
                        <span class="spotlight-item-price">${item.priceDisplay}</span>
                        <span class="spotlight-action-hint">Xem chi tiết ↵</span>
                    </div>
                `;

                card.addEventListener('mouseenter', () => {
                    selectedIndex = idx;
                    updateSelectionHighlight();
                });

                card.addEventListener('click', () => {
                    selectSingleItem(item);
                });

                resultsEl.appendChild(card);
            });
        }

        function updateSelectionHighlight() {
            const cards = resultsEl.querySelectorAll('.spotlight-item-card');
            cards.forEach((c, i) => {
                c.classList.toggle('is-selected', i === selectedIndex);
                if (i === selectedIndex) {
                    c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        }

        // Tạo nhãn tóm tắt bộ lọc bằng tiếng Việt trực quan
        function buildFilterSummaryLabel() {
            const parts = [];
            if (searchKeyword.trim()) {
                parts.push(`"${searchKeyword.trim()}"`);
            }
            if (selectedStyle !== 'all') {
                const styles = FILTER_DEFINITIONS.styles[activeCategory] || FILTER_DEFINITIONS.styles.all;
                const found = styles.find(s => s.id === selectedStyle);
                if (found) parts.push(found.label);
            }
            if (selectedPrice !== 'all') {
                const found = FILTER_DEFINITIONS.prices.find(p => p.id === selectedPrice);
                if (found) parts.push(found.label);
            }
            if (selectedColor !== 'all') {
                const found = FILTER_DEFINITIONS.colors.find(c => c.id === selectedColor);
                if (found) parts.push(found.label);
            }
            return parts.join(' • ') || 'Tất cả sản phẩm';
        }

        // ==========================================================================
        // HÀNH ĐỘNG CỐT LÕI: ĐẨY TOÀN BỘ KẾT QUẢ ĐÃ LỌC RA TRÊN SÀO ĐỒ
        // ==========================================================================
        function applyFilteredResultsToRail() {
            closeSpotlight();

            // Xác định mục tiêu sào: Quần hay Áo
            let targetCategory = activeCategory;
            if (targetCategory === 'all' || targetCategory === 'giay') {
                // Nếu đang ở tab tất cả, ưu tiên theo giao diện sào đang mở
                const currentCat = window.ClothingRail?.getCategory?.();
                targetCategory = (currentCat === 'quan') ? 'quan' : 'ao';
            }

            // Lấy danh sách sản phẩm khớp thuộc mục tiêu sào
            const railTargetItems = filteredResults
                .filter(item => item.category === targetCategory)
                .map(item => item.rawItem);

            const filterLabel = buildFilterSummaryLabel();

            // Đảm bảo mở sào đồ
            if (targetCategory === 'quan') {
                if (typeof window.open3DPantsRack === 'function') {
                    window.open3DPantsRack();
                }
            } else {
                if (typeof window.open3DClothesRack === 'function') {
                    window.open3DClothesRack('ao');
                }
            }

            // Gọi Engine lọc của ClothingRail đẩy đồ ra trên sào
            if (window.ClothingRail && typeof window.ClothingRail.applyFilter === 'function') {
                // Nếu không có bất kỳ tiêu chí nào và ô tìm kiếm rỗng -> Khôi phục sào mặc định
                if (selectedPrice === 'all' && selectedStyle === 'all' && selectedColor === 'all' && !searchKeyword.trim()) {
                    window.ClothingRail.resetFilter();
                } else {
                    window.ClothingRail.applyFilter(railTargetItems, filterLabel);
                }
            }
        }

        // Chọn 1 món đồ cụ thể để xem chi tiết
        function selectSingleItem(item) {
            closeSpotlight();

            if (item.category === 'quan') {
                if (typeof window.closeSneakerShowcase === 'function') window.closeSneakerShowcase();
                if (window.ClothingRail && typeof window.ClothingRail.selectProduct === 'function') {
                    window.ClothingRail.selectProduct('quan', item.slug);
                } else if (typeof window.open3DPantsRack === 'function') {
                    window.open3DPantsRack();
                }
            } else if (item.category === 'ao') {
                if (typeof window.closeSneakerShowcase === 'function') window.closeSneakerShowcase();
                if (window.ClothingRail && typeof window.ClothingRail.selectProduct === 'function') {
                    window.ClothingRail.selectProduct('ao', item.slug);
                } else if (typeof window.open3DClothesRack === 'function') {
                    window.open3DClothesRack('ao');
                }
            } else if (item.category === 'giay') {
                if (window.ClothingRail && typeof window.ClothingRail.closeClothingRail === 'function') {
                    window.ClothingRail.closeClothingRail();
                }
                if (typeof window.openSneakerShowcase === 'function') window.openSneakerShowcase();
                if (window.SneakerVault && typeof window.SneakerVault.openSliderView === 'function') {
                    setTimeout(() => {
                        window.SneakerVault.openSliderView(item.sneakerIndex, item.collectionIndex);
                    }, 120);
                }
            }
        }

        // Mở Spotlight Modal
        function openSpotlight(catHint) {
            let detectedCat = catHint || 'all';
            const sneakerOverlay = document.getElementById('hnmtSneakerOverlay');
            const rackOverlay = document.getElementById('hnmtRackOverlay');
            const isRailPage = window.location.pathname.toLowerCase().includes('/products/rail') || document.querySelector('.rail-app');

            if (sneakerOverlay && sneakerOverlay.classList.contains('is-active')) {
                detectedCat = 'giay';
            } else if (isRailPage || (rackOverlay && rackOverlay.classList.contains('is-active'))) {
                const currentCat = window.ClothingRail?.getCategory?.();
                detectedCat = (currentCat === 'quan') ? 'quan' : 'ao';
            }

            activeCategory = detectedCat;
            tabs.forEach(t => t.classList.toggle('is-active', t.dataset.cat === activeCategory));

            updateTabCounts();
            renderPricePills();
            renderStylePills();
            renderColorPills();

            performSearch();

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => input.focus(), 80);
        }

        // Đóng Spotlight Modal
        function closeSpotlight() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }

        // Đặt lại toàn bộ bộ lọc về trạng thái ban đầu
        function resetFilters() {
            selectedPrice = 'all';
            selectedStyle = 'all';
            selectedColor = 'all';
            searchKeyword = '';
            input.value = '';
            clearBtn.style.display = 'none';

            renderPricePills();
            renderStylePills();
            renderColorPills();
            performSearch();

            // Đồng thời nếu đang mở sào thì khôi phục lại sào mặc định
            if (window.ClothingRail && typeof window.ClothingRail.resetFilter === 'function') {
                window.ClothingRail.resetFilter();
            }
        }

        // ==========================================================================
        // GẮN EVENT LISTENERS
        // ==========================================================================
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                activeCategory = tab.dataset.cat || 'all';
                tabs.forEach(t => t.classList.toggle('is-active', t === tab));
                selectedStyle = 'all';
                renderStylePills();
                performSearch();
            });
        });

        input.addEventListener('input', () => {
            searchKeyword = input.value;
            clearBtn.style.display = searchKeyword ? 'inline-flex' : 'none';
            performSearch();
        });

        clearBtn.addEventListener('click', () => {
            searchKeyword = '';
            input.value = '';
            clearBtn.style.display = 'none';
            performSearch();
            input.focus();
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', applyFilteredResultsToRail);
        }

        if (applyRailBtn) {
            applyRailBtn.addEventListener('click', applyFilteredResultsToRail);
        }

        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', resetFilters);
        }

        if (closePillBtn) {
            closePillBtn.addEventListener('click', closeSpotlight);
        }

        if (backdrop) {
            backdrop.addEventListener('click', closeSpotlight);
        }

        // Xử lý phím Enter, Mũi tên và Escape
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filteredResults.length > 0) {
                    selectedIndex = (selectedIndex + 1) % filteredResults.length;
                    updateSelectionHighlight();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filteredResults.length > 0) {
                    selectedIndex = (selectedIndex - 1 + filteredResults.length) % filteredResults.length;
                    updateSelectionHighlight();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                // Khi nhấn Enter trong ô tìm kiếm: Đẩy toàn bộ đồ khớp ra trên sào!
                applyFilteredResultsToRail();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeSpotlight();
            }
        });

        // Phím tắt toàn cục mở / đóng
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeSpotlight();
            } else if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !modal.classList.contains('is-open')) {
                const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
                if (activeTag !== 'input' && activeTag !== 'textarea') {
                    e.preventDefault();
                    openSpotlight();
                }
            }
        });

        // Gắn nút kính lúp ở Header
        const railSearchBtn = document.getElementById('railSearchBtn');
        if (railSearchBtn) {
            railSearchBtn.addEventListener('click', () => openSpotlight());
        }

        const svSearchBtn = document.getElementById('svSearchBtn');
        if (svSearchBtn) {
            svSearchBtn.addEventListener('click', () => openSpotlight('giay'));
        }

        window.HNMTSpotlightSearch = {
            open: openSpotlight,
            close: closeSpotlight,
            applyToRail: applyFilteredResultsToRail,
            resetFilters
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpotlight);
    } else {
        initSpotlight();
    }
})();
