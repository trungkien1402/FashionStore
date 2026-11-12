/**
 * ==============================================================================
 * HNMTSHOP - BỘ LỌC DÀNH RIÊNG CHO TỦ GIÀY (SNEAKER VAULT RIGHT VERTICAL SIDEBAR)
 * Tách biệt rõ ràng: Bộ Sưu Tập & Dòng Giày
 * Gam màu sắc tinh tế (không emoji, không ngoặc dư thừa)
 * Nền trong suốt mờ đục chuẩn Sneaker Vault Capsule
 * ==============================================================================
 */
(function () {
    'use strict';

    // Helper: Bỏ dấu tiếng Việt để tìm kiếm không dấu
    function removeVietnameseTones(str) {
        if (!str) return '';
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
        str = str.replace(/\u02C6|\u0306|\u031B/g, '');
        return str.trim();
    }

    // Bảng từ khóa nhận diện các gam màu sneaker thời trang toàn diện (tiếng Việt & tiếng Anh)
    const COLOR_KEYWORDS = {
        black: ['den', 'black', 'carbon', 'stealth', 'midnight', 'obsidian', 'dark', 'charcoal'],
        white: ['trang', 'white', 'frost', 'pure', 'ice', 'titanium', 'sand', 'desert', 'kem', 'cream'],
        gray: ['xam', 'grey', 'gray', 'storm', 'chrome', 'silver', 'slate'],
        sand: ['cat', 'sand', 'khaki', 'camel', 'tan', 'beige', 'sa mac', 'desert'],
        brown: ['nau', 'brown', 'mocha', 'chocolate', 'espresso', 'cacao', 'coffee', 'terracotta', 'clay'],
        blue: ['xanh', 'blue', 'indigo', 'cham', 'cobalt', 'sonic', 'polar', 'glacier'],
        navy: ['navy', 'deep blue', 'deep carbon'],
        teal: ['ngoc', 'teal', 'mint', 'turquoise', 'cyan', 'tiffany'],
        green: ['reu', 'green', 'olive', 'emerald', 'matrix'],
        lime: ['volt', 'lime', 'neon', 'acid', 'matrix neon'],
        purple: ['tim', 'purple', 'violet', 'lunar', 'magenta', 'aura'],
        red: ['do', 'red', 'crimson', 'magma', 'infrared', 'infraray', 'fury'],
        burgundy: ['burgundy', 'maroon', 'ruou', 'man', 'bordeaux'],
        orange: ['cam', 'orange', 'amber', 'sunset', 'flare', 'solar'],
        yellow: ['vang', 'yellow', 'gold', 'solaris', 'imperial'],
        pink: ['hong', 'pink', 'rose', 'neon pink'],
        metallic: ['kim loai', 'metallic', 'metal', 'dong', 'bronze', 'copper', 'gold chrome', 'anh kim']
    };

    // Bảng 18 màu Swatches thời trang cao cấp (3 hàng × 6 cột hoàn hảo)
    const FASHION_SWATCHES = [
        // Hàng 1: Cơ bản & Trung tính
        { id: 'all', name: 'Tất cả màu', bg: 'conic-gradient(from 180deg at 50% 50%, #ff4d4d, #f9cb28, #79d70f, #00d2fc, #c56cf0, #ff4d4d)', border: 'rgba(255,255,255,0.4)' },
        { id: 'black', name: 'Đen', bg: '#121316', border: 'rgba(255,255,255,0.28)' },
        { id: 'white', name: 'Trắng / Kem', bg: 'linear-gradient(135deg, #ffffff 50%, #f1ebdf 50%)', border: 'rgba(255,255,255,0.35)' },
        { id: 'gray', name: 'Xám / Bạc', bg: 'linear-gradient(135deg, #94a3b8 50%, #cbd5e1 50%)' },
        { id: 'sand', name: 'Nâu cát / Khaki', bg: 'linear-gradient(135deg, #d4a373 50%, #faedcd 50%)' },
        { id: 'brown', name: 'Nâu đất / Mocha', bg: 'linear-gradient(135deg, #451a03 50%, #78350f 50%)' },

        // Hàng 2: Tông Lạnh & Phong Cách
        { id: 'blue', name: 'Xanh dương / Indigo', bg: 'linear-gradient(135deg, #2563eb 50%, #0284c7 50%)' },
        { id: 'navy', name: 'Xanh navy', bg: '#0f172a', border: 'rgba(255,255,255,0.25)' },
        { id: 'teal', name: 'Xanh ngọc / Mint', bg: 'linear-gradient(135deg, #0d9488 50%, #2dd4bf 50%)' },
        { id: 'green', name: 'Xanh lá / Rêu', bg: 'linear-gradient(135deg, #15803d 50%, #4d7c0f 50%)' },
        { id: 'lime', name: 'Xanh neon / Volt', bg: 'linear-gradient(135deg, #84cc16 50%, #a3e635 50%)' },
        { id: 'purple', name: 'Tím / Violet', bg: 'linear-gradient(135deg, #7c3aed 50%, #a855f7 50%)' },

        // Hàng 3: Tông Ấm & Thời Thượng
        { id: 'red', name: 'Đỏ / Crimson', bg: 'linear-gradient(135deg, #dc2626 50%, #ef4444 50%)' },
        { id: 'burgundy', name: 'Đỏ rượu / Burgundy', bg: 'linear-gradient(135deg, #881337 50%, #4c0519 50%)' },
        { id: 'orange', name: 'Cam / Hổ phách', bg: 'linear-gradient(135deg, #ea580c 50%, #f97316 50%)' },
        { id: 'yellow', name: 'Vàng / Gold', bg: 'linear-gradient(135deg, #eab308 50%, #fde047 50%)' },
        { id: 'pink', name: 'Hồng / Rose', bg: 'linear-gradient(135deg, #ec4899 50%, #f472b6 50%)' },
        { id: 'metallic', name: 'Ánh kim / Chrome', bg: 'linear-gradient(135deg, #b45309 30%, #e2e8f0 70%)', border: 'rgba(255,255,255,0.3)' }
    ];

    function formatPrice(num) {
        return num.toLocaleString('vi-VN') + ' ₫';
    }

    // State bộ lọc của riêng Tủ Giày
    let selectedVault = 'all';
    let selectedSilhouette = 'all';
    let selectedColor = 'all';
    let maxPriceValue = 7500000; // Giá tối đa mặc định (7.500.000 ₫)
    let searchKeyword = '';
    let filteredSneakers = [];

    // Lấy toàn bộ danh sách 18 sneaker từ SneakerVault
    function getSneakerCatalog() {
        if (window.SneakerVault && typeof window.SneakerVault.getAllSneakers === 'function') {
            return window.SneakerVault.getAllSneakers();
        }
        return [];
    }

    // HTML Template: Right Sidebar mờ đục trong suốt với Select-from-list & Range Slider
    const SIDEBAR_HTML = `
        <div class="fashion-filter-backdrop" id="sneakerFilterBackdrop"></div>
        <aside class="fashion-filter-sidebar" role="dialog" aria-modal="true" aria-label="Bộ lọc tìm kiếm tủ giày">
            <!-- Header Tinh Giản -->
            <div class="fashion-sidebar-header">
                <h2 class="fashion-filter-title">Bộ Lọc Tủ Giày</h2>
                <button type="button" class="fashion-filter-close" id="sneakerFilterCloseBtn" aria-label="Đóng bộ lọc" title="Đóng (ESC)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- Thanh tìm kiếm theo tên sneaker / model -->
            <div class="fashion-search-bar">
                <svg class="search-bar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="m20 20-4.35-4.35"/>
                </svg>
                <input type="text" id="sneakerSearchInput" class="fashion-search-input" placeholder="Tìm model, phối màu, mã giày..." autocomplete="off" spellcheck="false">
                <button type="button" id="sneakerClearSearchBtn" class="fashion-clear-btn" style="display:none;" title="Xóa từ khóa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Vùng nội dung các tiêu chí lọc -->
            <div class="fashion-sidebar-scroll">
                <!-- 1. Bộ Sưu Tập (Tách riêng biệt theo yêu cầu) -->
                <div class="fashion-select-card">
                    <label class="fashion-card-label" for="sneakerVaultSelect">Bộ Sưu Tập</label>
                    <div class="fashion-select-wrapper">
                        <select id="sneakerVaultSelect" class="fashion-select-input">
                            <option value="all">Tất cả bộ sưu tập</option>
                            <option value="futurist">Futurist Sneaker Vault</option>
                            <option value="cyber">Cyber Vault</option>
                            <option value="chile20">Chile 20 Vault</option>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 2. Dòng Giày / Kiểu Dáng (Tách riêng biệt theo yêu cầu) -->
                <div class="fashion-select-card">
                    <label class="fashion-card-label" for="sneakerSilhouetteSelect">Dòng Giày</label>
                    <div class="fashion-select-wrapper">
                        <select id="sneakerSilhouetteSelect" class="fashion-select-input">
                            <option value="all">Tất cả dòng giày</option>
                            <option value="air-future">Air Future Series</option>
                            <option value="cyber-series">Cyber Series</option>
                            <option value="chile-series">Chile 20 Series</option>
                            <option value="runners">Giày chạy bộ (Runners)</option>
                            <option value="chunky">Giày sneaker đế dày (Chunky)</option>
                            <option value="high-top">Giày sneaker cổ cao (High-Top)</option>
                            <option value="low-top">Giày sneaker cổ thấp (Low-Top)</option>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 3. Gam Màu Sắc (Color Swatches tương tác chuẩn Fashion Atelier) -->
                <div class="fashion-select-card fashion-swatches-card">
                    <div class="fashion-swatches-header">
                        <label class="fashion-card-label">Gam Màu Sắc</label>
                        <span class="fashion-swatches-badge" id="sneakerSelectedColorName">Tất cả màu</span>
                    </div>
                    <div class="fashion-swatches-grid" id="sneakerColorSwatchesGrid" role="radiogroup" aria-label="Chọn gam màu sắc sneaker">
                        <!-- Swatches render bằng JavaScript -->
                    </div>
                </div>

                <!-- 4. Khoảng Giá: Thanh Ngang Kéo Khoảng Giá (Interactive Range Slider) -->
                <div class="fashion-select-card price-range-card">
                    <div class="price-header-row">
                        <label class="fashion-card-label" for="sneakerPriceRange">Mức Giá Tối Đa</label>
                        <span class="price-badge-display" id="sneakerPriceDisplay">Tất cả mức giá</span>
                    </div>
                    <div class="range-slider-container">
                        <input type="range" id="sneakerPriceRange" min="4500000" max="7500000" step="100000" value="7500000" class="fashion-range-input">
                        <div class="range-milestones">
                            <span>4.5M</span>
                            <span>5.5M</span>
                            <span>6.5M</span>
                            <span>Tối đa</span>
                        </div>
                    </div>
                </div>

                <!-- Nút Đặt Lại Tinh Tế ở ngay dưới các tiêu chí chọn -->
                <div class="fashion-reset-action-row">
                    <button type="button" id="sneakerResetFilterBtn" class="fashion-reset-filter-btn" title="Đặt lại toàn bộ tiêu chí về mặc định">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                        </svg>
                        <span>Đặt lại bộ lọc</span>
                    </button>
                </div>
            </div>

            <!-- Footer Tinh Gọn: Nút Áp Dụng Căn Giữa Đẹp Mắt -->
            <div class="fashion-sidebar-footer">
                <button type="button" id="sneakerApplyBtn" class="sv-apply-capsule-btn" title="Áp dụng bộ lọc lên tủ giày (Enter)">
                    <span class="apply-text">Áp Dụng</span>
                    <span class="capsule-badge" id="sneakerApplyCount">18 đôi</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </aside>
    `;

    function ensureModalDOM() {
        let modal = document.getElementById('hnmtSneakerFilterModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtSneakerFilterModal';
            modal.className = 'hnmt-fashion-filter-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = SIDEBAR_HTML;
            document.body.appendChild(modal);
        } else {
            modal.innerHTML = SIDEBAR_HTML;
        }
        return modal;
    }

    function initSneakerFilter() {
        const modal = ensureModalDOM();
        const backdrop = document.getElementById('sneakerFilterBackdrop');
        const closeBtn = document.getElementById('sneakerFilterCloseBtn');
        const searchInput = document.getElementById('sneakerSearchInput');
        const clearSearchBtn = document.getElementById('sneakerClearSearchBtn');
        const vaultSelect = document.getElementById('sneakerVaultSelect');
        const silhouetteSelect = document.getElementById('sneakerSilhouetteSelect');
        const swatchesGrid = document.getElementById('sneakerColorSwatchesGrid');
        const selectedColorBadge = document.getElementById('sneakerSelectedColorName');
        const priceRange = document.getElementById('sneakerPriceRange');
        const priceDisplay = document.getElementById('sneakerPriceDisplay');
        const applyBtn = document.getElementById('sneakerApplyBtn');
        const resetBtn = document.getElementById('sneakerResetFilterBtn');

        // Render khay chấm màu tương tác (Direction 1 - Color Swatches Atelier)
        function renderColorSwatches() {
            if (!swatchesGrid) return;
            swatchesGrid.innerHTML = '';

            FASHION_SWATCHES.forEach(sw => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `fashion-swatch-item ${sw.id === selectedColor ? 'is-selected' : ''}`;
                btn.setAttribute('data-color', sw.id);
                btn.setAttribute('title', sw.name);
                btn.setAttribute('aria-label', sw.name);
                btn.setAttribute('aria-checked', sw.id === selectedColor ? 'true' : 'false');
                btn.setAttribute('role', 'radio');

                const dot = document.createElement('span');
                dot.className = 'swatch-dot';
                dot.style.background = sw.bg;
                if (sw.border) dot.style.border = `1px solid ${sw.border}`;

                btn.appendChild(dot);

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedColor = sw.id;
                    updateColorSwatchesUI();
                    performFilter();
                });

                swatchesGrid.appendChild(btn);
            });

            if (selectedColorBadge) {
                const currentSw = FASHION_SWATCHES.find(s => s.id === selectedColor) || FASHION_SWATCHES[0];
                selectedColorBadge.textContent = currentSw.name;
            }
        }

        function updateColorSwatchesUI() {
            if (swatchesGrid) {
                swatchesGrid.querySelectorAll('.fashion-swatch-item').forEach(btn => {
                    const c = btn.getAttribute('data-color');
                    const isSel = c === selectedColor;
                    btn.classList.toggle('is-selected', isSel);
                    btn.setAttribute('aria-checked', isSel ? 'true' : 'false');
                });
            }
            if (selectedColorBadge) {
                const currentSw = FASHION_SWATCHES.find(s => s.id === selectedColor) || FASHION_SWATCHES[0];
                selectedColorBadge.textContent = currentSw.name;
            }
        }

        renderColorSwatches();

        // Cập nhật nhãn hiển thị giá khi kéo thanh trượt
        function updatePriceDisplay() {
            if (!priceRange || !priceDisplay) return;
            const val = parseInt(priceRange.value, 10);
            maxPriceValue = val;
            if (val >= 7500000) {
                priceDisplay.textContent = 'Tất cả mức giá';
            } else {
                priceDisplay.textContent = `Dưới ${(val).toLocaleString('vi-VN')} ₫`;
            }
        }

        // Lọc danh sách sneaker theo các tiêu chí đã chọn
        function performFilter() {
            const allSneakers = getSneakerCatalog();
            const normalizedKeyword = removeVietnameseTones(searchKeyword);

            filteredSneakers = allSneakers.filter(item => {
                // 1. Lọc theo Bộ Sưu Tập (Vault)
                if (selectedVault !== 'all') {
                    const colId = (item.collectionId || '').toLowerCase();
                    if (colId !== selectedVault) return false;
                }

                // 2. Lọc theo Dòng Giày (Silhouette)
                if (selectedSilhouette !== 'all') {
                    const modelName = removeVietnameseTones(item.model || '');
                    let matchSil = false;
                    if (selectedSilhouette === 'air-future' && modelName.includes('air future')) matchSil = true;
                    else if (selectedSilhouette === 'cyber-series' && modelName.includes('cyber')) matchSil = true;
                    else if (selectedSilhouette === 'chile-series' && modelName.includes('chile')) matchSil = true;
                    else if (selectedSilhouette === 'runners' && (item.collectionId === 'futurist' || modelName.includes('air future'))) matchSil = true;
                    else if (selectedSilhouette === 'chunky' && (item.collectionId === 'cyber' || modelName.includes('cyber'))) matchSil = true;
                    else if (selectedSilhouette === 'high-top' && (modelName.includes('ix') || modelName.includes('viii') || modelName.includes('xi'))) matchSil = true;
                    else if (selectedSilhouette === 'low-top' && (modelName.includes('iv') || modelName.includes('iii') || modelName.includes('i'))) matchSil = true;

                    if (!matchSil) return false;
                }

                // 3. Lọc theo giá thanh trượt kéo (Range slider)
                if (maxPriceValue < 7500000 && item.price > maxPriceValue) {
                    return false;
                }

                // 4. Lọc theo màu sắc
                if (selectedColor !== 'all') {
                    const keywords = COLOR_KEYWORDS[selectedColor] || [selectedColor];
                    const textToSearch = removeVietnameseTones([
                        item.colorway || '',
                        item.colorName || '',
                        item.model || ''
                    ].join(' '));

                    let matchColor = false;
                    for (const kw of keywords) {
                        if (textToSearch.includes(kw)) {
                            matchColor = true;
                            break;
                        }
                    }

                    if (!matchColor) return false;
                }

                // 5. Lọc theo từ khóa tìm kiếm (model, colorway, designer, styleCode)
                if (normalizedKeyword) {
                    const matchModel = removeVietnameseTones(item.model || '').includes(normalizedKeyword);
                    const matchColorway = removeVietnameseTones(item.colorway || '').includes(normalizedKeyword);
                    const matchColorName = removeVietnameseTones(item.colorName || '').includes(normalizedKeyword);
                    const matchStyleCode = removeVietnameseTones(item.styleCode || '').includes(normalizedKeyword);
                    const matchDesigner = removeVietnameseTones(item.designer || '').includes(normalizedKeyword);

                    if (!matchModel && !matchColorway && !matchColorName && !matchStyleCode && !matchDesigner) {
                        return false;
                    }
                }

                return true;
            });

            // Cập nhật số lượng đếm trên nút áp dụng
            const applyCountEl = document.getElementById('sneakerApplyCount');
            if (applyCountEl) applyCountEl.textContent = `${filteredSneakers.length} đôi`;
        }

        // Tạo nhãn tóm tắt bộ lọc bằng tiếng Việt
        function buildSummaryLabel() {
            const parts = [];
            if (searchKeyword.trim()) {
                parts.push(`"${searchKeyword.trim()}"`);
            }
            if (selectedVault !== 'all' && vaultSelect) {
                const opt = vaultSelect.options[vaultSelect.selectedIndex];
                if (opt) parts.push(opt.text.split('(')[0].trim());
            }
            if (selectedSilhouette !== 'all' && silhouetteSelect) {
                const opt = silhouetteSelect.options[silhouetteSelect.selectedIndex];
                if (opt) parts.push(opt.text.split('(')[0].trim());
            }
            if (maxPriceValue < 7500000) {
                parts.push(`≤ ${maxPriceValue.toLocaleString('vi-VN')} ₫`);
            }
            if (selectedColor !== 'all') {
                const sw = FASHION_SWATCHES.find(s => s.id === selectedColor);
                if (sw) parts.push(sw.name);
            }
            return parts.join(' • ') || 'Tất cả giày';
        }

        // Đẩy danh sách sneaker đã lọc lên Sneaker Vault
        function applyFilterToVault() {
            closeModal();

            if (typeof window.openSneakerShowcase === 'function') {
                window.openSneakerShowcase();
            }

            const label = buildSummaryLabel();
            const isFullCatalog = (selectedVault === 'all' && selectedSilhouette === 'all' && maxPriceValue >= 7500000 && selectedColor === 'all' && !searchKeyword.trim());

            if (window.SneakerVault) {
                if (isFullCatalog) {
                    window.SneakerVault.resetFilter();
                } else {
                    window.SneakerVault.applyFilter(filteredSneakers, label);
                }
            }
        }

        function openModal() {
            // Đóng các modal khác nếu đang mở
            const oldSpotlight = document.getElementById('hnmtSpotlightSearchModal');
            if (oldSpotlight) oldSpotlight.classList.remove('is-open');

            const shirtModal = document.getElementById('hnmtShirtFilterModal');
            if (shirtModal) shirtModal.classList.remove('is-open');

            const pantsModal = document.getElementById('hnmtPantsFilterModal');
            if (pantsModal) pantsModal.classList.remove('is-open');

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');

            updatePriceDisplay();
            updateColorSwatchesUI();
            performFilter();
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 80);
        }

        function closeModal() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }

        function resetAllFilters() {
            selectedVault = 'all';
            selectedSilhouette = 'all';
            selectedColor = 'all';
            maxPriceValue = 7500000;
            searchKeyword = '';

            if (searchInput) {
                searchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            }
            if (vaultSelect) vaultSelect.value = 'all';
            if (silhouetteSelect) silhouetteSelect.value = 'all';
            updateColorSwatchesUI();
            if (priceRange) priceRange.value = '7500000';

            updatePriceDisplay();
            performFilter();

            if (window.SneakerVault && typeof window.SneakerVault.resetFilter === 'function') {
                window.SneakerVault.resetFilter();
            }
        }

        // Event: Đóng modal
        if (backdrop) backdrop.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Event: Tìm kiếm theo text
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchKeyword = e.target.value;
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = searchKeyword.trim() ? 'block' : 'none';
                }
                performFilter();
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    applyFilterToVault();
                }
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchKeyword = '';
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                clearSearchBtn.style.display = 'none';
                performFilter();
            });
        }

        // Event: Bộ sưu tập Select
        if (vaultSelect) {
            vaultSelect.addEventListener('change', (e) => {
                selectedVault = e.target.value;
                performFilter();
            });
        }

        // Event: Dòng giày Select
        if (silhouetteSelect) {
            silhouetteSelect.addEventListener('change', (e) => {
                selectedSilhouette = e.target.value;
                performFilter();
            });
        }

        // Event: Thanh trượt khoảng giá (Range Slider)
        if (priceRange) {
            priceRange.addEventListener('input', () => {
                updatePriceDisplay();
                performFilter();
            });
        }

        // Event: Nút Đặt Lại
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                resetAllFilters();
            });
        }

        // Event: Nút Áp Dụng
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                applyFilterToVault();
            });
        }

        // Phím tắt bàn phím
        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('is-open')) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
            } else if (e.key === 'Enter') {
                const targetTag = e.target?.tagName?.toLowerCase();
                if (targetTag !== 'button' && targetTag !== 'select') {
                    e.preventDefault();
                    applyFilterToVault();
                }
            }
        });

        // Khởi tạo ban đầu
        updatePriceDisplay();
        performFilter();

        // Public API
        window.HNMTSneakerFilter = {
            open: openModal,
            close: closeModal,
            reset: resetAllFilters,
            isModalOpen: () => modal.classList.contains('is-open')
        };
    }

    // Auto-init khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSneakerFilter);
    } else {
        initSneakerFilter();
    }
})();
