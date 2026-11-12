/**
 * ==============================================================================
 * HNMTSHOP - BỘ LỌC DÀNH RIÊNG CHO SÀO QUẦN (RIGHT VERTICAL TRANSLUCENT SIDEBAR)
 * Select-from-list phong cách cao cấp, thanh kéo khoảng giá Range Slider
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

    // Bảng từ khóa nhận diện các gam màu thời trang toàn diện (tiếng Việt & tiếng Anh)
    const COLOR_KEYWORDS = {
        black: ['den', 'black', 'carbon', 'charcoal', 'pitch', 'than chi', 'onyx', 'stealth'],
        white: ['trang', 'white', 'be', 'kem', 'cream', 'sand', 'ivory', 'ecru', 'alabaster', 'sua', 'frost', 'pure', 'ice'],
        gray: ['xam', 'gray', 'grey', 'bac', 'silver', 'acid', 'smoke', 'marl', 'stone', 'da', 'storm', 'chrome', 'slate'],
        sand: ['cat', 'sand', 'khaki', 'camel', 'tan', 'beige', 'nau nhat', 'sa mac', 'desert'],
        brown: ['nau', 'brown', 'mocha', 'chocolate', 'espresso', 'cacao', 'coffee', 'go', 'wood', 'nau dam'],
        blue: ['xanh', 'blue', 'indigo', 'denim', 'cham', 'cobalt', 'azure', 'troi', 'sonic', 'polar', 'glacier'],
        navy: ['navy', 'hai quan', 'xanh tham', 'dam', 'dark blue', 'midnight', 'muc', 'deep blue', 'deep carbon'],
        teal: ['ngoc', 'teal', 'mint', 'turquoise', 'cyan', 'tiffany'],
        green: ['reu', 'green', 'olive', 'la cay', 'moss', 'army', 'khaki green', 'bo', 'forest', 'emerald', 'matrix'],
        lime: ['volt', 'lime', 'neon', 'acid', 'chuoi', 'da quang'],
        purple: ['tim', 'purple', 'violet', 'lunar', 'magenta', 'aura', 'lilac', 'lavender', 'hoa ca', 'plum'],
        red: ['do', 'red', 'crimson', 'scarlet', 'magma', 'infrared', 'infraray', 'fury', 'rubi'],
        burgundy: ['burgundy', 'maroon', 'ruou', 'man', 'bordeaux', 'do tham', 'wine'],
        orange: ['cam', 'orange', 'amber', 'sunset', 'flare', 'terracotta', 'clay', 'dat nung', 'rust'],
        yellow: ['vang', 'yellow', 'gold', 'solaris', 'imperial', 'mustard', 'lemon', 'canary'],
        pink: ['hong', 'pink', 'rose', 'phan', 'pastel', 'lotus', 'dao', 'blush', 'fuchsia'],
        metallic: ['kim loai', 'metallic', 'metal', 'dong', 'bronze', 'copper', 'gold chrome', 'anh kim']
    };

    // Bảng 18 màu Swatches thời trang cao cấp (3 hàng × 6 cột hoàn hảo)
    const FASHION_SWATCHES = [
        // Hàng 1: Cơ bản & Trung tính
        { id: 'all', name: 'Tất cả màu', bg: 'conic-gradient(from 180deg at 50% 50%, #ff4d4d, #f9cb28, #79d70f, #00d2fc, #c56cf0, #ff4d4d)', border: 'rgba(255,255,255,0.4)' },
        { id: 'black', name: 'Đen', bg: '#121316', border: 'rgba(255,255,255,0.28)' },
        { id: 'white', name: 'Trắng / Be / Kem', bg: 'linear-gradient(135deg, #ffffff 50%, #f1ebdf 50%)', border: 'rgba(255,255,255,0.35)' },
        { id: 'gray', name: 'Xám / Bạc', bg: 'linear-gradient(135deg, #94a3b8 50%, #cbd5e1 50%)' },
        { id: 'sand', name: 'Nâu cát / Khaki', bg: 'linear-gradient(135deg, #d4a373 50%, #faedcd 50%)' },
        { id: 'brown', name: 'Nâu đậm / Mocha', bg: 'linear-gradient(135deg, #451a03 50%, #78350f 50%)' },

        // Hàng 2: Tông Lạnh & Phong Cách
        { id: 'blue', name: 'Xanh denim / Indigo', bg: 'linear-gradient(135deg, #2563eb 50%, #0284c7 50%)' },
        { id: 'navy', name: 'Xanh navy', bg: '#0f172a', border: 'rgba(255,255,255,0.25)' },
        { id: 'teal', name: 'Xanh ngọc / Mint', bg: 'linear-gradient(135deg, #0d9488 50%, #2dd4bf 50%)' },
        { id: 'green', name: 'Xanh rêu / Olive', bg: 'linear-gradient(135deg, #15803d 50%, #4d7c0f 50%)' },
        { id: 'lime', name: 'Xanh neon / Volt', bg: 'linear-gradient(135deg, #84cc16 50%, #a3e635 50%)' },
        { id: 'purple', name: 'Tím khói', bg: 'linear-gradient(135deg, #7c3aed 50%, #a855f7 50%)' },

        // Hàng 3: Tông Ấm & Thời Thượng
        { id: 'red', name: 'Đỏ rượu / Nâu đất', bg: 'linear-gradient(135deg, #dc2626 50%, #ef4444 50%)' },
        { id: 'burgundy', name: 'Đỏ mận / Burgundy', bg: 'linear-gradient(135deg, #881337 50%, #4c0519 50%)' },
        { id: 'orange', name: 'Cam đất', bg: 'linear-gradient(135deg, #ea580c 50%, #f97316 50%)' },
        { id: 'yellow', name: 'Vàng be', bg: 'linear-gradient(135deg, #eab308 50%, #fde047 50%)' },
        { id: 'pink', name: 'Hồng pastel', bg: 'linear-gradient(135deg, #ec4899 50%, #f472b6 50%)' },
        { id: 'metallic', name: 'Ánh kim / Chrome', bg: 'linear-gradient(135deg, #b45309 30%, #e2e8f0 70%)', border: 'rgba(255,255,255,0.3)' }
    ];

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    // State bộ lọc của riêng Sào Quần
    let selectedStyle = 'all';
    let selectedColor = 'all';
    let maxPriceValue = 1500000; // Giá tối đa mặc định (1.500.000 ₫)
    let searchKeyword = '';
    let filteredPants = [];

    // Lấy toàn bộ danh sách 12 quần từ ClothingRail
    function getPantsCatalog() {
        if (window.ClothingRail && Array.isArray(window.ClothingRail.ALL_PANTS_PRODUCTS)) {
            return window.ClothingRail.ALL_PANTS_PRODUCTS;
        }
        return [];
    }

    // HTML Template: Right Sidebar mờ đục trong suốt với Select-from-list & Range Slider
    const SIDEBAR_HTML = `
        <div class="fashion-filter-backdrop" id="pantsFilterBackdrop"></div>
        <aside class="fashion-filter-sidebar" role="dialog" aria-modal="true" aria-label="Bộ lọc tìm kiếm sào quần">
            <!-- Header Tinh Giản -->
            <div class="fashion-sidebar-header">
                <h2 class="fashion-filter-title">Bộ Lọc Sào Quần</h2>
                <button type="button" class="fashion-filter-close" id="pantsFilterCloseBtn" aria-label="Đóng bộ lọc" title="Đóng (ESC)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- Thanh tìm kiếm theo tên quần -->
            <div class="fashion-search-bar">
                <svg class="search-bar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="m20 20-4.35-4.35"/>
                </svg>
                <input type="text" id="pantsSearchInput" class="fashion-search-input" placeholder="Tìm tên quần, chất liệu, form dáng..." autocomplete="off" spellcheck="false">
                <button type="button" id="pantsClearSearchBtn" class="fashion-clear-btn" style="display:none;" title="Xóa từ khóa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Vùng nội dung các tiêu chí lọc -->
            <div class="fashion-sidebar-scroll">
                <!-- 1. Kiểu Dáng Quần (Select-from-list đa dạng đầy đủ chủng loại) -->
                <div class="fashion-select-card">
                    <label class="fashion-card-label" for="pantsStyleSelect">Kiểu Dáng Quần</label>
                    <div class="fashion-select-wrapper">
                        <select id="pantsStyleSelect" class="fashion-select-input">
                            <option value="all">Tất cả kiểu dáng quần</option>
                            <optgroup label="Quần Jeans & Denim">
                                <option value="jeans">Tất Cả Quần Jeans & Denim</option>
                                <option value="acid-cargo">Quần Baggy Jeans Acid-Wash (Y2K / Skater)</option>
                                <option value="wide-denim">Quần Jeans Ống Rộng (Wide-Leg Denim)</option>
                                <option value="raw-selvedge">Quần Raw Selvedge Denim 14oz Cổ Điển</option>
                                <option value="distressed-denim">Quần Jeans Rách / Mài Vintage</option>
                            </optgroup>
                            <optgroup label="Quần Tây May Đo (Tailored)">
                                <option value="tay">Tất Cả Quần Tây May Đo</option>
                                <option value="sand-pleated">Quần Tây Xếp 2 Ly Cạp Cao (Quiet Luxury)</option>
                                <option value="tailored-black">Quần Tây Cạp Cao Sartorial Side-Adjuster</option>
                                <option value="pleated-grey">Quần Tây Ống Suông Xếp Ly Minimalist</option>
                                <option value="chino-cream">Quần Chino May Đo Co Giãn Smart-Casual</option>
                                <option value="flannel-trousers">Quần Tây Flannel Thu Đông</option>
                            </optgroup>
                            <optgroup label="Quần Dù Parachute & Tactical">
                                <option value="parachute">Tất Cả Quần Dù Parachute</option>
                                <option value="tactical-parachute">Quần Dù Parachute Tactical Rêu Quân Đội</option>
                                <option value="parachute-black">Quần Dù Parachute Dây Rút Gấu City</option>
                                <option value="windpants">Quần Gió Thể Thao / Trackpants</option>
                            </optgroup>
                            <optgroup label="Quần Cargo Túi Hộp">
                                <option value="cargo">Tất Cả Quần Cargo Túi Hộp</option>
                                <option value="cargo-olive">Quần Cargo 8 Túi Streetwear Rêu Khói</option>
                                <option value="cargo-baggy">Quần Baggy Cargo Jeans Túi Hộp</option>
                                <option value="techwear-cargo">Quần Techwear Cargo Đa Năng</option>
                            </optgroup>
                            <optgroup label="Quần Shorts & Bo Gấu">
                                <option value="jogger">Quần Sweatpants Nỉ Bo Gấu (Jogger)</option>
                                <option value="shorts">Quần Short Dù Thể Thao (Nylon Shorts)</option>
                                <option value="bermuda">Quần Bermuda Denim Shorts</option>
                            </optgroup>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 2. Gam Màu Sắc (Color Swatches tương tác chuẩn Fashion Atelier) -->
                <div class="fashion-select-card fashion-swatches-card">
                    <div class="fashion-swatches-header">
                        <label class="fashion-card-label">Gam Màu Sắc</label>
                        <span class="fashion-swatches-badge" id="pantsSelectedColorName">Tất cả màu</span>
                    </div>
                    <div class="fashion-swatches-grid" id="pantsColorSwatchesGrid" role="radiogroup" aria-label="Chọn gam màu sắc quần">
                        <!-- Swatches render bằng JavaScript -->
                    </div>
                </div>

                <!-- 3. Khoảng Giá: Thanh Ngang Kéo Khoảng Giá (Interactive Range Slider) -->
                <div class="fashion-select-card price-range-card">
                    <div class="price-header-row">
                        <label class="fashion-card-label" for="pantsPriceRange">Mức Giá Tối Đa</label>
                        <span class="price-badge-display" id="pantsPriceDisplay">Tất cả mức giá</span>
                    </div>
                    <div class="range-slider-container">
                        <input type="range" id="pantsPriceRange" min="300000" max="1500000" step="50000" value="1500000" class="fashion-range-input">
                        <div class="range-milestones">
                            <span>300k</span>
                            <span>600k</span>
                            <span>900k</span>
                            <span>1.2M</span>
                            <span>Tối đa</span>
                        </div>
                    </div>
                </div>

                <!-- Nút Đặt Lại Tinh Tế ở ngay dưới các tiêu chí chọn -->
                <div class="fashion-reset-action-row">
                    <button type="button" id="pantsResetFilterBtn" class="fashion-reset-filter-btn" title="Đặt lại toàn bộ tiêu chí về mặc định">
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
                <button type="button" id="pantsApplyBtn" class="sv-apply-capsule-btn" title="Áp dụng bộ lọc lên sào đồ (Enter)">
                    <span class="apply-text">Áp Dụng</span>
                    <span class="capsule-badge" id="pantsApplyCount">12 quần</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </aside>
    `;

    function ensureModalDOM() {
        let modal = document.getElementById('hnmtPantsFilterModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtPantsFilterModal';
            modal.className = 'hnmt-fashion-filter-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = SIDEBAR_HTML;
            document.body.appendChild(modal);
        } else {
            modal.innerHTML = SIDEBAR_HTML;
        }
        return modal;
    }

    function initPantsFilter() {
        const modal = ensureModalDOM();
        const backdrop = document.getElementById('pantsFilterBackdrop');
        const closeBtn = document.getElementById('pantsFilterCloseBtn');
        const searchInput = document.getElementById('pantsSearchInput');
        const clearSearchBtn = document.getElementById('pantsClearSearchBtn');
        const styleSelect = document.getElementById('pantsStyleSelect');
        const swatchesGrid = document.getElementById('pantsColorSwatchesGrid');
        const selectedColorBadge = document.getElementById('pantsSelectedColorName');
        const priceRange = document.getElementById('pantsPriceRange');
        const priceDisplay = document.getElementById('pantsPriceDisplay');
        const applyBtn = document.getElementById('pantsApplyBtn');
        const resetBtn = document.getElementById('pantsResetFilterBtn');

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
            if (val >= 1500000) {
                priceDisplay.textContent = 'Tất cả mức giá';
            } else {
                priceDisplay.textContent = `Dưới ${(val).toLocaleString('vi-VN')} ₫`;
            }
        }

        // Lọc danh sách quần theo các tiêu chí đã chọn
        function performFilter() {
            const allPants = getPantsCatalog();
            const normalizedKeyword = removeVietnameseTones(searchKeyword);

            filteredPants = allPants.filter(item => {
                // 1. Lọc theo kiểu dáng quần (Select dropdown)
                if (selectedStyle !== 'all') {
                    const itemStyle = (item.style || '').toLowerCase();
                    const itemSlug = (item.slug || '').toLowerCase();
                    const itemType = removeVietnameseTones(item.type || '');
                    const itemDesc = removeVietnameseTones(item.desc || '');
                    const target = removeVietnameseTones(selectedStyle);

                    let matchStyle = false;
                    if (selectedStyle === 'jeans' && (itemStyle === 'jeans' || itemType.includes('jeans') || itemType.includes('denim'))) matchStyle = true;
                    else if (selectedStyle === 'tay' && (itemStyle === 'tay' || itemType.includes('tay') || itemType.includes('chino') || itemDesc.includes('xep ly'))) matchStyle = true;
                    else if (selectedStyle === 'parachute' && (itemStyle === 'parachute' || itemType.includes('du') || itemType.includes('parachute'))) matchStyle = true;
                    else if (selectedStyle === 'cargo' && (itemStyle === 'cargo' || itemType.includes('cargo') || itemDesc.includes('tui hop'))) matchStyle = true;
                    else if (itemSlug === selectedStyle || itemStyle === selectedStyle || itemType.includes(target) || itemDesc.includes(target)) matchStyle = true;

                    if (!matchStyle) return false;
                }

                // 2. Lọc theo giá thanh trượt kéo (Range slider)
                const itemPriceVND = item.price * 10000;
                if (maxPriceValue < 1500000 && itemPriceVND > maxPriceValue) {
                    return false;
                }

                // 3. Lọc theo màu sắc (Hỗ trợ toàn bộ quần có 2 màu đổi qua lại được)
                if (selectedColor !== 'all') {
                    const keywords = COLOR_KEYWORDS[selectedColor] || [selectedColor];
                    const colors = item.colors || [];
                    let matchedVariant = -1;

                    for (let idx = 0; idx < colors.length; idx++) {
                        const cName = removeVietnameseTones(colors[idx][0] || '');
                        for (const kw of keywords) {
                            if (cName.includes(kw)) {
                                matchedVariant = idx;
                                break;
                            }
                        }
                        if (matchedVariant !== -1) break;
                    }

                    if (matchedVariant !== -1) {
                        item.variant = matchedVariant;
                    } else if (item.colorGroup === selectedColor) {
                        item.variant = 0;
                    } else {
                        return false;
                    }
                } else {
                    item.variant = 0;
                }

                // 4. Lọc theo từ khóa tên hoặc mô tả
                if (normalizedKeyword) {
                    const matchName = removeVietnameseTones(item.name).includes(normalizedKeyword);
                    const matchDesc = removeVietnameseTones(item.desc).includes(normalizedKeyword);
                    const matchType = removeVietnameseTones(item.type || '').includes(normalizedKeyword);
                    if (!matchName && !matchDesc && !matchType) {
                        return false;
                    }
                }

                return true;
            });

            // Cập nhật số lượng đếm trên nút áp dụng
            const applyCountEl = document.getElementById('pantsApplyCount');
            if (applyCountEl) applyCountEl.textContent = `${filteredPants.length} quần`;
        }

        // Tạo nhãn tóm tắt bộ lọc bằng tiếng Việt
        function buildSummaryLabel() {
            const parts = [];
            if (searchKeyword.trim()) {
                parts.push(`"${searchKeyword.trim()}"`);
            }
            if (selectedStyle !== 'all' && styleSelect) {
                const opt = styleSelect.options[styleSelect.selectedIndex];
                if (opt) parts.push(opt.text.split('(')[0].trim());
            }
            if (maxPriceValue < 1500000) {
                parts.push(`≤ ${maxPriceValue.toLocaleString('vi-VN')} ₫`);
            }
            if (selectedColor !== 'all') {
                const sw = FASHION_SWATCHES.find(s => s.id === selectedColor);
                if (sw) parts.push(sw.name);
            }
            return parts.join(' • ') || 'Tất cả quần';
        }

        // Đẩy danh sách quần đã lọc ra trên Sào Treo Đồ
        function applyFilterToRail() {
            closeModal();

            if (typeof window.open3DClothesRack === 'function') {
                window.open3DClothesRack('quan');
            }

            const label = buildSummaryLabel();
            const isFullCatalog = (selectedStyle === 'all' && maxPriceValue >= 1500000 && selectedColor === 'all' && !searchKeyword.trim());

            if (window.ClothingRail) {
                if (isFullCatalog) {
                    window.ClothingRail.resetFilter();
                } else {
                    window.ClothingRail.applyFilter(filteredPants, label);
                }
            }
        }

        function openModal() {
            // Đóng các modal khác nếu đang mở
            const oldSpotlight = document.getElementById('hnmtSpotlightSearchModal');
            if (oldSpotlight) oldSpotlight.classList.remove('is-open');

            const shirtModal = document.getElementById('hnmtShirtFilterModal');
            if (shirtModal) shirtModal.classList.remove('is-open');

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
            selectedStyle = 'all';
            selectedColor = 'all';
            maxPriceValue = 1500000;
            searchKeyword = '';

            const allPants = getPantsCatalog();
            allPants.forEach(p => { p.variant = 0; });

            if (searchInput) {
                searchInput.value = '';
                if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            }
            if (styleSelect) styleSelect.value = 'all';
            updateColorSwatchesUI();
            if (priceRange) priceRange.value = '1500000';

            updatePriceDisplay();
            performFilter();
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
                    applyFilterToRail();
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

        // Event: Kiểu dáng Select dropdown
        if (styleSelect) {
            styleSelect.addEventListener('change', (e) => {
                selectedStyle = e.target.value;
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
                applyFilterToRail();
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
                    applyFilterToRail();
                }
            }
        });

        // Khởi tạo ban đầu
        updatePriceDisplay();
        performFilter();

        // Public API
        window.HNMTPantsFilter = {
            open: openModal,
            close: closeModal,
            reset: resetAllFilters,
            isModalOpen: () => modal.classList.contains('is-open')
        };
    }

    // Auto-init khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPantsFilter);
    } else {
        initPantsFilter();
    }
})();
