/**
 * HNMTSHOP - SPOTLIGHT QUICK SEARCH CONTROLLER
 * Fast fuzzy search across Pants, Shirts, and Sneakers with Glassmorphism Command Palette UI.
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

    // Gợi ý nhanh theo từng phân loại
    const QUICK_TAGS_MAP = {
        all: [
            { label: 'Tất cả mới 2026', query: '' },
            { label: '#Cargo', query: 'cargo' },
            { label: '#Jeans', query: 'jeans' },
            { label: '#Hoodie', query: 'hoodie' },
            { label: '#Sneaker', query: 'sneaker' },
            { label: '#Quần Tây', query: 'tay' },
            { label: '#Varsity Jacket', query: 'varsity' }
        ],
        quan: [
            { label: 'Tất cả quần', query: '' },
            { label: '#Cargo Túi Hộp', query: 'cargo' },
            { label: '#Quần Tây Xếp Ly', query: 'xep ly' },
            { label: '#Jeans Ống Rộng', query: 'wide' },
            { label: '#Parachute Rêu', query: 'parachute' },
            { label: '#Raw Selvedge', query: 'selvedge' }
        ],
        ao: [
            { label: 'Tất cả áo', query: '' },
            { label: '#Áo Thun Boxy', query: 'tee' },
            { label: '#Hoodie Cyber', query: 'hoodie' },
            { label: '#Varsity Jacket', query: 'varsity' },
            { label: '#Moto Jacket', query: 'moto' },
            { label: '#Crewneck', query: 'crew' }
        ],
        giay: [
            { label: 'Tất cả sneaker', query: '' },
            { label: '#Infraray Storm (Đỏ)', query: 'storm' },
            { label: '#Hyper Flux (Xanh)', query: 'flux' },
            { label: '#Nexus Volt (Neon)', query: 'nexus' },
            { label: '#Lunar Chrome', query: 'chrome' },
            { label: '#Dune Phantom', query: 'dune' }
        ]
    };

    let activeCategory = 'all';
    let selectedIndex = 0;
    let filteredResults = [];

    // Thu thập toàn bộ sản phẩm
    function getAllProducts() {
        const items = [];

        // 1. Quần (Pants)
        const pantsRacks = window.ClothingRail?.PANTS_RACKS || [];
        pantsRacks.forEach((rack, rIdx) => {
            (rack.products || []).forEach((p, pIdx) => {
                items.push({
                    id: 'p-' + p.slug,
                    name: p.name,
                    slug: p.slug,
                    category: 'quan',
                    categoryName: 'Sào Quần',
                    categoryBadgeClass: 'cat-quan',
                    price: formatPrice(p.price),
                    priceNum: p.price * 10000,
                    desc: p.desc || p.type || 'Phom dáng thời thượng may đo cao cấp',
                    image: p.frontImg || `/clothing-rail/assets/${p.slug}-front.webp`,
                    rackIdx: rIdx,
                    prodIdx: pIdx,
                    tags: ['quan', 'pants', 'trousers', p.slug, p.type || '']
                });
            });
        });

        // 2. Áo (Shirts)
        const shirtRacks = window.ClothingRail?.SHIRT_RACKS || [];
        shirtRacks.forEach((rack, rIdx) => {
            (rack.products || []).forEach((p, pIdx) => {
                items.push({
                    id: 's-' + p.slug,
                    name: p.name,
                    slug: p.slug,
                    category: 'ao',
                    categoryName: 'Sào Áo',
                    categoryBadgeClass: 'cat-ao',
                    price: formatPrice(p.price),
                    priceNum: p.price * 10000,
                    desc: p.desc || p.type || 'Thời trang độc bản nâng tầm phong cách',
                    image: `/clothing-rail/assets/${p.slug}-front.webp`,
                    rackIdx: rIdx,
                    prodIdx: pIdx,
                    tags: ['ao', 'shirt', 'top', 'tee', p.slug, p.type || '']
                });
            });
        });

        // 3. Giày (Sneakers)
        const collections = window.SneakerVault?.getCollections() || [];
        collections.forEach((col, cIdx) => {
            (col.items || []).forEach((s, sIdx) => {
                items.push({
                    id: s.id || 'snk-' + sIdx,
                    name: `${s.model} — ${s.colorway}`,
                    slug: s.id,
                    category: 'giay',
                    categoryName: 'Tủ Giày',
                    categoryBadgeClass: 'cat-giay',
                    price: (s.price || 5200000).toLocaleString('vi-VN') + ' ₫',
                    priceNum: s.price || 5200000,
                    desc: `${s.designer || 'HNMTSHOP'} · ${s.colorName || s.colorway}`,
                    image: s.image,
                    collectionIndex: cIdx,
                    sneakerIndex: sIdx,
                    tags: ['giay', 'sneaker', 'shoes', s.model, s.colorway, s.colorName || '']
                });
            });
        });

        return items;
    }

        function ensureModalDOM() {
        let modal = document.getElementById('hnmtSpotlightSearchModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtSpotlightSearchModal';
            modal.className = 'hnmt-spotlight-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = `
                <div class="hnmt-spotlight-backdrop" id="spotlightBackdrop"></div>
                <div class="hnmt-spotlight-dialog" role="dialog" aria-modal="true" aria-label="Tìm kiếm sản phẩm nhanh">
                    <div class="hnmt-spotlight-search-header">
                        <div class="hnmt-spotlight-input-wrap">
                            <svg class="hnmt-spotlight-search-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7"/>
                                <path d="m20 20-4.35-4.35"/>
                            </svg>
                            <input type="text" id="hnmtSpotlightInput" class="hnmt-spotlight-input" placeholder="Tìm quần, áo, sneaker hoặc kiểu dáng... (ví dụ: cargo, jeans, hoodie, runner)" autocomplete="off" spellcheck="false">
                            <button type="button" id="hnmtSpotlightClearBtn" class="hnmt-spotlight-clear-btn" aria-label="Xóa tìm kiếm" style="display: none;">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div class="hnmt-spotlight-meta">
                            <span class="hnmt-spotlight-esc-pill">ESC để đóng</span>
                        </div>
                    </div>
                    <div class="hnmt-spotlight-tabs" id="spotlightTabs">
                        <button type="button" class="hnmt-spotlight-tab is-active" data-cat="all">Tất Cả <span class="tab-count" id="tabCountAll">0</span></button>
                        <button type="button" class="hnmt-spotlight-tab" data-cat="quan">Sào Quần <span class="tab-count" id="tabCountQuan">5</span></button>
                        <button type="button" class="hnmt-spotlight-tab" data-cat="ao">Sào Áo <span class="tab-count" id="tabCountAo">20</span></button>
                        <button type="button" class="hnmt-spotlight-tab" data-cat="giay">Tủ Giày <span class="tab-count" id="tabCountGiay">6</span></button>
                    </div>
                    <div class="hnmt-spotlight-quick-tags" id="spotlightQuickTags">
                        <span class="quick-tags-label">Gợi ý nhanh:</span>
                        <div class="quick-tags-scroll" id="quickTagsContainer"></div>
                    </div>
                    <div class="hnmt-spotlight-results" id="spotlightResults"></div>
                    <div class="hnmt-spotlight-empty" id="spotlightEmpty" style="display: none;">
                        <div class="empty-icon">🔍</div>
                        <p class="empty-title">Không tìm thấy sản phẩm phù hợp</p>
                        <p class="empty-desc">Thử tìm với từ khóa khác như "jeans", "cargo", "hoodie", "runner", hoặc bấm các gợi ý nhanh bên trên.</p>
                    </div>
                    <div class="hnmt-spotlight-footer">
                        <div class="spotlight-hint">
                            <span><kbd>↑</kbd><kbd>↓</kbd> Chọn</span>
                            <span><kbd>ENTER</kbd> Xem đồ</span>
                            <span><kbd>ESC</kbd> Đóng</span>
                        </div>
                        <div class="spotlight-brand">HNMTSHOP // FAST FIND</div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        return modal;
    }

    function initSpotlight() {
        const modal = ensureModalDOM();
        const input = document.getElementById('hnmtSpotlightInput');
        const clearBtn = document.getElementById('hnmtSpotlightClearBtn');
        const backdrop = document.getElementById('spotlightBackdrop');
        const tabs = document.querySelectorAll('.hnmt-spotlight-tab');
        const resultsEl = document.getElementById('spotlightResults');
        const emptyEl = document.getElementById('spotlightEmpty');
        const tagsContainer = document.getElementById('quickTagsContainer');

        if (!modal || !input) return;

        // Cập nhật số lượng đếm trên tabs
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

        // Render gợi ý nhanh
        function renderQuickTags(cat) {
            if (!tagsContainer) return;
            tagsContainer.innerHTML = '';
            const tags = QUICK_TAGS_MAP[cat] || QUICK_TAGS_MAP.all;
            tags.forEach(t => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'quick-tag-chip';
                chip.textContent = t.label;
                chip.addEventListener('click', () => {
                    input.value = t.query;
                    clearBtn.style.display = t.query ? 'inline-flex' : 'none';
                    performSearch(t.query);
                    input.focus();
                });
                tagsContainer.appendChild(chip);
            });
        }

        // Tìm kiếm và hiển thị kết quả
        function performSearch(query = '') {
            const allItems = getAllProducts();
            const normalizedQuery = removeVietnameseTones(query);

            filteredResults = allItems.filter(item => {
                // Lọc theo Category Tab
                if (activeCategory !== 'all' && item.category !== activeCategory) {
                    return false;
                }
                // Nếu không nhập từ khóa -> hiện toàn bộ thuộc tab
                if (!normalizedQuery) return true;

                // Tìm kiếm đa trường: Tên, Phân loại, Mô tả, Thẻ
                const matchName = removeVietnameseTones(item.name).includes(normalizedQuery);
                const matchDesc = removeVietnameseTones(item.desc).includes(normalizedQuery);
                const matchCat = removeVietnameseTones(item.categoryName).includes(normalizedQuery);
                const matchTags = item.tags.some(t => removeVietnameseTones(t).includes(normalizedQuery));

                return matchName || matchDesc || matchCat || matchTags;
            });

            selectedIndex = 0;
            renderResultsList();
        }

        // Render danh sách kết quả ra DOM
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
                        </div>
                        <div class="spotlight-item-name">${item.name}</div>
                        <div class="spotlight-item-desc">${item.desc}</div>
                    </div>
                    <div class="spotlight-item-price-col">
                        <span class="spotlight-item-price">${item.price}</span>
                        <span class="spotlight-action-hint">Xem đồ ↵</span>
                    </div>
                `;

                card.addEventListener('mouseenter', () => {
                    selectedIndex = idx;
                    updateSelectionHighlight();
                });

                card.addEventListener('click', () => {
                    selectItem(item);
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

        // Xử lý khi chọn 1 món đồ từ kết quả tìm kiếm
        function selectItem(item) {
            closeSpotlight();

            if (item.category === 'quan') {
                // Đóng Sneaker nếu đang mở
                if (typeof window.closeSneakerShowcase === 'function') {
                    window.closeSneakerShowcase();
                }
                if (window.ClothingRail && typeof window.ClothingRail.selectProduct === 'function') {
                    window.ClothingRail.selectProduct('quan', item.slug);
                } else if (typeof window.open3DPantsRack === 'function') {
                    window.open3DPantsRack();
                }
            } else if (item.category === 'ao') {
                if (typeof window.closeSneakerShowcase === 'function') {
                    window.closeSneakerShowcase();
                }
                if (window.ClothingRail && typeof window.ClothingRail.selectProduct === 'function') {
                    window.ClothingRail.selectProduct('ao', item.slug);
                } else if (typeof window.open3DClothesRack === 'function') {
                    window.open3DClothesRack('ao');
                }
            } else if (item.category === 'giay') {
                // Đóng Clothing Rail nếu đang mở
                if (window.ClothingRail && typeof window.ClothingRail.closeClothingRail === 'function') {
                    window.ClothingRail.closeClothingRail();
                }
                if (typeof window.openSneakerShowcase === 'function') {
                    window.openSneakerShowcase();
                }
                if (window.SneakerVault && typeof window.SneakerVault.openSliderView === 'function') {
                    setTimeout(() => {
                        window.SneakerVault.openSliderView(item.sneakerIndex, item.collectionIndex);
                    }, 120);
                }
            }
        }

        // Mở Spotlight
        function openSpotlight(catHint) {
            // Xác định danh mục phù hợp theo ngữ cảnh hiện tại
            let detectedCat = catHint || 'all';
            const sneakerOverlay = document.getElementById('hnmtSneakerOverlay');
            const rackOverlay = document.getElementById('hnmtRackOverlay');

            if (sneakerOverlay && sneakerOverlay.classList.contains('is-active')) {
                detectedCat = 'giay';
            } else if (rackOverlay && rackOverlay.classList.contains('is-active')) {
                const currentCat = window.ClothingRail?.getCategory?.();
                detectedCat = (currentCat === 'quan') ? 'quan' : 'ao';
            }

            activeCategory = detectedCat;
            tabs.forEach(t => t.classList.toggle('is-active', t.dataset.cat === activeCategory));

            updateTabCounts();
            renderQuickTags(activeCategory);
            input.value = '';
            clearBtn.style.display = 'none';
            performSearch('');

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => input.focus(), 80);
        }

        // Đóng Spotlight
        function closeSpotlight() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }

        // Gắn sự kiện Tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                activeCategory = tab.dataset.cat || 'all';
                tabs.forEach(t => t.classList.toggle('is-active', t === tab));
                renderQuickTags(activeCategory);
                performSearch(input.value);
            });
        });

        // Gắn sự kiện Input
        input.addEventListener('input', () => {
            const val = input.value;
            clearBtn.style.display = val ? 'inline-flex' : 'none';
            performSearch(val);
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            performSearch('');
            input.focus();
        });

        // Bấm ngoài backdrop để đóng
        if (backdrop) {
            backdrop.addEventListener('click', closeSpotlight);
        }

        // Điều khiển phím mũi tên & Enter
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
                if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
                    selectItem(filteredResults[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeSpotlight();
            }
        });

        // Phím tắt toàn cục: '/' hoặc 'Ctrl+K' để mở, 'ESC' để đóng
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

        // Gắn nút kính lúp ở Header Sào Đồ (Quần & Áo)
        const railSearchBtn = document.getElementById('railSearchBtn');
        if (railSearchBtn) {
            railSearchBtn.addEventListener('click', () => openSpotlight());
        }

        // Gắn nút kính lúp ở Header Tủ Giày
        const svSearchBtn = document.getElementById('svSearchBtn');
        if (svSearchBtn) {
            svSearchBtn.addEventListener('click', () => openSpotlight('giay'));
        }

        // Expose ra window để các module khác có thể gọi nếu cần
        window.HNMTSpotlightSearch = {
            open: openSpotlight,
            close: closeSpotlight
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpotlight);
    } else {
        initSpotlight();
    }
})();
