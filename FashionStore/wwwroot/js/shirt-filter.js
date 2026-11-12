/**
 * ==============================================================================
 * HNMTSHOP - BỘ LỌC DÀNH RIÊNG CHO SÀO ÁO (RIGHT VERTICAL TRANSLUCENT SIDEBAR)
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
        { id: 'white', name: 'Trắng / Kem', bg: 'linear-gradient(135deg, #ffffff 50%, #f1ebdf 50%)', border: 'rgba(255,255,255,0.35)' },
        { id: 'gray', name: 'Xám / Bạc', bg: 'linear-gradient(135deg, #94a3b8 50%, #cbd5e1 50%)' },
        { id: 'sand', name: 'Nâu cát / Be', bg: 'linear-gradient(135deg, #d4a373 50%, #faedcd 50%)' },
        { id: 'brown', name: 'Nâu đậm / Mocha', bg: 'linear-gradient(135deg, #451a03 50%, #78350f 50%)' },

        // Hàng 2: Tông Lạnh & Phong Cách
        { id: 'blue', name: 'Xanh dương / Indigo', bg: 'linear-gradient(135deg, #2563eb 50%, #0284c7 50%)' },
        { id: 'navy', name: 'Xanh navy', bg: '#0f172a', border: 'rgba(255,255,255,0.25)' },
        { id: 'teal', name: 'Xanh ngọc / Mint', bg: 'linear-gradient(135deg, #0d9488 50%, #2dd4bf 50%)' },
        { id: 'green', name: 'Xanh rêu / Olive', bg: 'linear-gradient(135deg, #15803d 50%, #4d7c0f 50%)' },
        { id: 'lime', name: 'Xanh neon / Volt', bg: 'linear-gradient(135deg, #84cc16 50%, #a3e635 50%)' },
        { id: 'purple', name: 'Tím / Violet', bg: 'linear-gradient(135deg, #7c3aed 50%, #a855f7 50%)' },

        // Hàng 3: Tông Ấm & Thời Thượng
        { id: 'red', name: 'Đỏ tươi / Crimson', bg: 'linear-gradient(135deg, #dc2626 50%, #ef4444 50%)' },
        { id: 'burgundy', name: 'Đỏ rượu / Burgundy', bg: 'linear-gradient(135deg, #881337 50%, #4c0519 50%)' },
        { id: 'orange', name: 'Cam / Hổ phách', bg: 'linear-gradient(135deg, #ea580c 50%, #f97316 50%)' },
        { id: 'yellow', name: 'Vàng / Gold', bg: 'linear-gradient(135deg, #eab308 50%, #fde047 50%)' },
        { id: 'pink', name: 'Hồng / Rose', bg: 'linear-gradient(135deg, #ec4899 50%, #f472b6 50%)' },
        { id: 'metallic', name: 'Ánh kim / Chrome', bg: 'linear-gradient(135deg, #b45309 30%, #e2e8f0 70%)', border: 'rgba(255,255,255,0.3)' }
    ];

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    // State bộ lọc của riêng Sào Áo
    let selectedCategory = 'all';
    let selectedStyle = 'all';
    let selectedColor = 'all';
    let maxPriceValue = 1500000; // Giá tối đa mặc định (1.500.000 ₫)
    let searchKeyword = '';
    let filteredShirts = [];

    // Từ điển kiểu dáng chi tiết phân cấp theo loại áo
    const SHIRT_SUBSTYLES = {
        'all': [
            { value: 'all', text: '— Vui lòng chọn loại áo trước —' }
        ],
        'tee-polo': [
            { value: 'all', text: 'Tất cả kiểu dáng Áo Thun & Polo' },
            { value: 'tee', text: 'Áo Thun Cổ Tròn (Crewneck Tee)' },
            { value: 'boxy', text: 'Áo Thun Oversized / Boxy Vai Trễ' },
            { value: 'polo', text: 'Áo Polo Dệt Kim (Knit Polo)' },
            { value: 'tank', text: 'Áo Ba Lỗ (Tank Top / Sleeveless)' }
        ],
        'shirt': [
            { value: 'all', text: 'Tất cả kiểu dáng Áo Sơ Mi' },
            { value: 'shirt', text: 'Áo Sơ Mi Camp-Collar (Cổ Danton)' },
            { value: 'oxford', text: 'Áo Sơ Mi Oxford / Linen Cổ Điển' },
            { value: 'utility', text: 'Áo Sơ Mi Utility Túi Hộp (Safari)' },
            { value: 'flannel', text: 'Áo Sơ Mi Flannel Kẻ Caro' }
        ],
        'jacket': [
            { value: 'all', text: 'Tất cả kiểu dáng Áo Khoác' },
            { value: 'jacket', text: 'Áo Khoác Bóng Chày (Varsity Jacket)' },
            { value: 'leather', text: 'Áo Khoác Da Moto Biker (Motorsport)' },
            { value: 'bomber', text: 'Áo Khoác Bomber MA-1' },
            { value: 'windbreaker', text: 'Áo Khoác Gió (Windbreaker)' },
            { value: 'blazer', text: 'Áo Blazer May Đo Casual' }
        ],
        'hoodie': [
            { value: 'all', text: 'Tất cả kiểu dáng Áo Nỉ & Hoodie' },
            { value: 'hoodie', text: 'Áo Hoodie Mũ Trùm Chân Cua' },
            { value: 'crewneck', text: 'Áo Nỉ Chui Đầu (Sweatshirt / Fleece)' },
            { value: 'zip-hoodie', text: 'Áo Zip Hoodie Khóa Kéo' },
            { value: 'cardigan', text: 'Áo Cardigan Dệt Len Nổi' }
        ]
    };

    // Lấy toàn bộ danh sách 15 áo từ ClothingRail
    function getShirtCatalog() {
        if (window.ClothingRail && Array.isArray(window.ClothingRail.ALL_SHIRT_PRODUCTS)) {
            return window.ClothingRail.ALL_SHIRT_PRODUCTS;
        }
        return [];
    }

    // HTML Template: Right Sidebar mờ đục trong suốt với Select-from-list & Range Slider
    const SIDEBAR_HTML = `
        <div class="fashion-filter-backdrop" id="shirtFilterBackdrop"></div>
        <aside class="fashion-filter-sidebar" role="dialog" aria-modal="true" aria-label="Bộ lọc tìm kiếm sào áo">
            <!-- Header Tinh Giản (Đã bỏ dòng HNMTSHOP // BỘ SƯU TẬP ÁO) -->
            <div class="fashion-sidebar-header">
                <h2 class="fashion-filter-title">Bộ Lọc Sào Áo</h2>
                <button type="button" class="fashion-filter-close" id="shirtFilterCloseBtn" aria-label="Đóng bộ lọc" title="Đóng (ESC)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- Thanh tìm kiếm theo tên áo -->
            <div class="fashion-search-bar">
                <svg class="search-bar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="m20 20-4.35-4.35"/>
                </svg>
                <input type="text" id="shirtSearchInput" class="fashion-search-input" placeholder="Tìm tên áo, chất liệu, họa tiết..." autocomplete="off" spellcheck="false">
                <button type="button" id="shirtClearSearchBtn" class="fashion-clear-btn" style="display:none;" title="Xóa từ khóa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Vùng nội dung các tiêu chí lọc -->
            <div class="fashion-sidebar-scroll">
                <!-- 1. Phân Loại Áo (Chọn loại áo trước) -->
                <div class="fashion-select-card">
                    <label class="fashion-card-label" for="shirtCategorySelect">Phân Loại Áo</label>
                    <div class="fashion-select-wrapper">
                        <select id="shirtCategorySelect" class="fashion-select-input">
                            <option value="all">Tất cả loại áo</option>
                            <option value="tee-polo">Áo Thun & Polo</option>
                            <option value="shirt">Áo Sơ Mi</option>
                            <option value="jacket">Áo Khoác (Jackets)</option>
                            <option value="hoodie">Áo Nỉ & Hoodie</option>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 2. Kiểu Dáng Chi Tiết (Chọn chi tiết hơn theo phân loại) -->
                <div class="fashion-select-card" id="shirtSubStyleCard">
                    <label class="fashion-card-label" for="shirtSubStyleSelect">Kiểu Dáng Chi Tiết</label>
                    <div class="fashion-select-wrapper">
                        <select id="shirtSubStyleSelect" class="fashion-select-input" disabled>
                            <option value="all">— Vui lòng chọn loại áo trước —</option>
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
                        <span class="fashion-swatches-badge" id="shirtSelectedColorName">Tất cả màu</span>
                    </div>
                    <div class="fashion-swatches-grid" id="shirtColorSwatchesGrid" role="radiogroup" aria-label="Chọn gam màu sắc áo">
                        <!-- Swatches render bằng JavaScript -->
                    </div>
                </div>

                <!-- 3. Khoảng Giá: Thanh Ngang Kéo Khoảng Giá (Interactive Range Slider) -->
                <div class="fashion-select-card price-range-card">
                    <div class="price-header-row">
                        <label class="fashion-card-label" for="shirtPriceRange">Mức Giá Tối Đa</label>
                        <span class="price-badge-display" id="shirtPriceDisplay">Tất cả mức giá</span>
                    </div>
                    <div class="range-slider-container">
                        <input type="range" id="shirtPriceRange" min="300000" max="1500000" step="50000" value="1500000" class="fashion-range-input">
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
                    <button type="button" id="shirtResetFilterBtn" class="fashion-reset-filter-btn" title="Đặt lại toàn bộ tiêu chí về mặc định">
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
                <button type="button" id="shirtApplyBtn" class="sv-apply-capsule-btn" title="Áp dụng bộ lọc lên sào đồ (Enter)">
                    <span class="apply-text">Áp Dụng</span>
                    <span class="capsule-badge" id="shirtApplyCount">15 áo</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </aside>
    `;

    function ensureModalDOM() {
        let modal = document.getElementById('hnmtShirtFilterModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtShirtFilterModal';
            modal.className = 'hnmt-fashion-filter-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = SIDEBAR_HTML;
            document.body.appendChild(modal);
        } else {
            modal.innerHTML = SIDEBAR_HTML;
        }
        return modal;
    }

    function initShirtFilter() {
        const modal = ensureModalDOM();
        const backdrop = document.getElementById('shirtFilterBackdrop');
        const closeBtn = document.getElementById('shirtFilterCloseBtn');
        const searchInput = document.getElementById('shirtSearchInput');
        const clearBtn = document.getElementById('shirtClearSearchBtn');
        const categorySelect = document.getElementById('shirtCategorySelect');
        const subStyleSelect = document.getElementById('shirtSubStyleSelect');
        const swatchesGrid = document.getElementById('shirtColorSwatchesGrid');
        const selectedColorBadge = document.getElementById('shirtSelectedColorName');
        const priceRange = document.getElementById('shirtPriceRange');
        const priceDisplay = document.getElementById('shirtPriceDisplay');
        const applyBtn = document.getElementById('shirtApplyBtn');
        const resetBtn = document.getElementById('shirtResetFilterBtn');

        if (!modal || !searchInput) return;

        // Điền danh sách kiểu dáng chi tiết phụ thuộc theo phân loại đã chọn
        function populateSubStyleSelect(cat, preserveValue = false) {
            if (!subStyleSelect) return;
            const subStyleCard = document.getElementById('shirtSubStyleCard') || subStyleSelect.closest('.fashion-select-card');
            const prevVal = preserveValue ? subStyleSelect.value : 'all';
            subStyleSelect.innerHTML = '';

            const isAllCat = (!cat || cat === 'all');
            if (isAllCat) {
                subStyleSelect.disabled = true;
                if (subStyleCard) subStyleCard.classList.add('is-disabled');
                const opt = document.createElement('option');
                opt.value = 'all';
                opt.textContent = '— Vui lòng chọn loại áo trước —';
                subStyleSelect.appendChild(opt);
                subStyleSelect.value = 'all';
                selectedStyle = 'all';
                return;
            }

            subStyleSelect.disabled = false;
            if (subStyleCard) subStyleCard.classList.remove('is-disabled');

            const list = SHIRT_SUBSTYLES[cat] || [];
            list.forEach(entry => {
                const opt = document.createElement('option');
                opt.value = entry.value;
                opt.textContent = entry.text;
                subStyleSelect.appendChild(opt);
            });

            let found = false;
            for (let i = 0; i < subStyleSelect.options.length; i++) {
                if (subStyleSelect.options[i].value === prevVal) {
                    subStyleSelect.selectedIndex = i;
                    selectedStyle = prevVal;
                    found = true;
                    break;
                }
            }
            if (!found) {
                subStyleSelect.value = 'all';
                selectedStyle = 'all';
            }
        }

        populateSubStyleSelect(selectedCategory, true);

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

        // Lọc danh sách áo theo các tiêu chí đã chọn
        function performFilter() {
            const allShirts = getShirtCatalog();
            const normalizedKeyword = removeVietnameseTones(searchKeyword);

            filteredShirts = allShirts.filter(item => {
                // 1. Lọc theo Phân Loại Áo (Category)
                if (selectedCategory !== 'all') {
                    if (selectedCategory === 'tee-polo') {
                        if (item.style !== 'tee') return false;
                    } else if (item.style !== selectedCategory) {
                        return false;
                    }
                }

                // 2. Lọc theo Kiểu Dáng Chi Tiết (Sub-Style)
                if (selectedStyle !== 'all') {
                    const itemName = removeVietnameseTones(item.name || '');
                    const itemType = removeVietnameseTones(item.type || '');
                    const itemDesc = removeVietnameseTones(item.desc || '');
                    const itemText = `${itemName} ${itemType} ${itemDesc}`;

                    if (selectedStyle === 'tee') {
                        if (item.style !== 'tee') return false;
                    } else if (selectedStyle === 'shirt') {
                        if (item.style !== 'shirt') return false;
                    } else if (selectedStyle === 'jacket') {
                        if (item.style !== 'jacket') return false;
                    } else if (selectedStyle === 'hoodie') {
                        if (item.style !== 'hoodie') return false;
                    } else if (selectedStyle === 'boxy') {
                        if (!itemText.includes('boxy') && !itemText.includes('oversized') && !itemText.includes('vai tre')) return false;
                    } else if (selectedStyle === 'polo') {
                        if (!itemText.includes('polo')) return false;
                    } else if (selectedStyle === 'tank') {
                        if (!itemText.includes('tank') && !itemText.includes('ba lo') && !itemText.includes('sleeveless')) return false;
                    } else if (selectedStyle === 'oxford') {
                        if (!itemText.includes('oxford') && !itemText.includes('linen')) return false;
                    } else if (selectedStyle === 'utility') {
                        if (!itemText.includes('utility') && !itemText.includes('tui hop') && !itemText.includes('safari')) return false;
                    } else if (selectedStyle === 'flannel') {
                        if (!itemText.includes('flannel') && !itemText.includes('caro')) return false;
                    } else if (selectedStyle === 'leather') {
                        if (!itemText.includes('da') && !itemText.includes('leather') && !itemText.includes('moto') && !itemText.includes('biker')) return false;
                    } else if (selectedStyle === 'bomber') {
                        if (!itemText.includes('bomber')) return false;
                    } else if (selectedStyle === 'windbreaker') {
                        if (!itemText.includes('gio') && !itemText.includes('windbreaker')) return false;
                    } else if (selectedStyle === 'blazer') {
                        if (!itemText.includes('blazer')) return false;
                    } else if (selectedStyle === 'crewneck') {
                        if (!itemText.includes('crewneck') && !itemText.includes('chui dau') && !itemText.includes('sweatshirt')) return false;
                    } else if (selectedStyle === 'zip-hoodie') {
                        if (!itemText.includes('zip') && !itemText.includes('khoa keo')) return false;
                    } else if (selectedStyle === 'cardigan') {
                        if (!itemText.includes('cardigan') && !itemText.includes('len')) return false;
                    } else {
                        const target = removeVietnameseTones(selectedStyle);
                        if (!itemText.includes(target) && item.style !== selectedStyle) return false;
                    }
                }

                // 3. Lọc theo giá thanh trượt kéo (Range slider)
                const itemPriceVND = item.price * 10000;
                if (maxPriceValue < 1500000 && itemPriceVND > maxPriceValue) {
                    return false;
                }

                // 4. Lọc theo màu sắc (Hỗ trợ toàn bộ áo có 2 màu đổi qua lại được)
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

                // 5. Lọc theo từ khóa tên hoặc mô tả
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

            // Cập nhật số lượng đếm trên footer
            const matchCountEl = document.getElementById('shirtMatchCount');
            const applyCountEl = document.getElementById('shirtApplyCount');

            if (matchCountEl) matchCountEl.textContent = filteredShirts.length;
            if (applyCountEl) applyCountEl.textContent = `${filteredShirts.length} áo`;
        }

        // Tạo nhãn tóm tắt bộ lọc bằng tiếng Việt
        function buildSummaryLabel() {
            const parts = [];
            if (searchKeyword.trim()) {
                parts.push(`"${searchKeyword.trim()}"`);
            }
            if (selectedStyle !== 'all' && subStyleSelect) {
                const opt = subStyleSelect.options[subStyleSelect.selectedIndex];
                if (opt) parts.push(opt.text.split('(')[0].trim());
            } else if (selectedCategory !== 'all' && categorySelect) {
                const opt = categorySelect.options[categorySelect.selectedIndex];
                if (opt) parts.push(opt.text.split('(')[0].trim());
            }
            if (maxPriceValue < 1500000) {
                parts.push(`≤ ${maxPriceValue.toLocaleString('vi-VN')} ₫`);
            }
            if (selectedColor !== 'all') {
                const sw = FASHION_SWATCHES.find(s => s.id === selectedColor);
                if (sw) parts.push(sw.name);
            }
            return parts.join(' • ') || 'Tất cả áo';
        }

        // Đẩy danh sách áo đã lọc ra trên Sào Treo Đồ
        function applyFilterToRail() {
            closeModal();

            if (typeof window.open3DClothesRack === 'function') {
                window.open3DClothesRack('ao');
            }

            const label = buildSummaryLabel();
            const isFullCatalog = (selectedCategory === 'all' && selectedStyle === 'all' && maxPriceValue >= 1500000 && selectedColor === 'all' && !searchKeyword.trim());

            if (window.ClothingRail) {
                if (isFullCatalog) {
                    window.ClothingRail.resetFilter();
                } else {
                    window.ClothingRail.applyFilter(filteredShirts, label);
                }
            }
        }

        function openModal() {
            const oldSpotlight = document.getElementById('hnmtSpotlightSearchModal');
            if (oldSpotlight) oldSpotlight.classList.remove('is-open');

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

        function resetAll() {
            selectedCategory = 'all';
            selectedStyle = 'all';
            selectedColor = 'all';
            maxPriceValue = 1500000;
            searchKeyword = '';

            const allShirts = getShirtCatalog();
            allShirts.forEach(s => { s.variant = 0; });

            if (searchInput) searchInput.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (categorySelect) categorySelect.value = 'all';
            populateSubStyleSelect('all', false);
            updateColorSwatchesUI();
            if (priceRange) priceRange.value = 1500000;

            updatePriceDisplay();
            performFilter();

            if (window.ClothingRail && typeof window.ClothingRail.resetFilter === 'function') {
                window.ClothingRail.resetFilter();
            }
        }

        // Sự kiện thay đổi Phân Loại Áo
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                selectedCategory = categorySelect.value;
                selectedStyle = 'all';
                populateSubStyleSelect(selectedCategory, false);
                performFilter();
            });
        }

        // Sự kiện thay đổi Kiểu Dáng Chi Tiết
        if (subStyleSelect) {
            subStyleSelect.addEventListener('change', () => {
                selectedStyle = subStyleSelect.value;
                performFilter();
            });
        }

        // Sự kiện kéo thanh trượt khoảng giá
        if (priceRange) {
            priceRange.addEventListener('input', () => {
                updatePriceDisplay();
                performFilter();
            });
        }

        // Sự kiện ô tìm kiếm
        searchInput.addEventListener('input', () => {
            searchKeyword = searchInput.value;
            if (clearBtn) clearBtn.style.display = searchKeyword ? 'inline-flex' : 'none';
            performFilter();
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilterToRail();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchKeyword = '';
                searchInput.value = '';
                clearBtn.style.display = 'none';
                performFilter();
                searchInput.focus();
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', applyFilterToRail);
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', resetAll);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (backdrop) {
            backdrop.addEventListener('click', closeModal);
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });

        window.HNMTShirtFilter = {
            open: openModal,
            close: closeModal,
            apply: applyFilterToRail,
            reset: resetAll
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShirtFilter);
    } else {
        initShirtFilter();
    }
})();
