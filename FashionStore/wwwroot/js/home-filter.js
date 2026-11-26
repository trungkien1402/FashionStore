/**
 * ==============================================================================
 * HNMTSHOP - BỘ LỌC ĐA DANH MỤC TRANG CHỦ (MASTER HOMEPAGE ATELIER FILTER)
 * Kiến trúc Cascading Filter: Cấp 1 (Áo/Quần/Giày) -> Cấp 2 (Phân loại) -> Cấp 3 (Kiểu dáng/Form)
 * Tích hợp Bảng 18 Gam Màu Swatches & Thanh Trượt Khoảng Giá VND
 * Tích hợp Modal Xác Nhận Chuyển Tiếp Không Gian 3D (Spatial Transition Dialog) Canh Giữa Màn Hình
 * ==============================================================================
 */
(function () {
    'use strict';

    // Bảng 18 màu Swatches thời trang
    const FASHION_SWATCHES = [
        { id: 'all', name: 'Tất cả màu', bg: 'conic-gradient(from 180deg at 50% 50%, #ff4d4d, #f9cb28, #79d70f, #00d2fc, #c56cf0, #ff4d4d)', border: 'rgba(255,255,255,0.4)' },
        { id: 'black', name: 'Đen', bg: '#121316', border: 'rgba(255,255,255,0.28)' },
        { id: 'white', name: 'Trắng / Kem', bg: 'linear-gradient(135deg, #ffffff 50%, #f1ebdf 50%)', border: 'rgba(255,255,255,0.35)' },
        { id: 'gray', name: 'Xám / Bạc', bg: 'linear-gradient(135deg, #94a3b8 50%, #cbd5e1 50%)' },
        { id: 'sand', name: 'Nâu cát / Be', bg: 'linear-gradient(135deg, #d4a373 50%, #faedcd 50%)' },
        { id: 'brown', name: 'Nâu đậm / Mocha', bg: 'linear-gradient(135deg, #451a03 50%, #78350f 50%)' },
        { id: 'blue', name: 'Xanh dương / Indigo', bg: 'linear-gradient(135deg, #2563eb 50%, #0284c7 50%)' },
        { id: 'navy', name: 'Xanh navy', bg: '#0f172a', border: 'rgba(255,255,255,0.25)' },
        { id: 'teal', name: 'Xanh ngọc / Mint', bg: 'linear-gradient(135deg, #0d9488 50%, #2dd4bf 50%)' },
        { id: 'green', name: 'Xanh rêu / Olive', bg: 'linear-gradient(135deg, #15803d 50%, #4d7c0f 50%)' },
        { id: 'lime', name: 'Xanh neon / Volt', bg: 'linear-gradient(135deg, #84cc16 50%, #a3e635 50%)' },
        { id: 'purple', name: 'Tím / Violet', bg: 'linear-gradient(135deg, #7c3aed 50%, #a855f7 50%)' },
        { id: 'red', name: 'Đỏ tươi / Crimson', bg: 'linear-gradient(135deg, #dc2626 50%, #ef4444 50%)' },
        { id: 'burgundy', name: 'Đỏ rượu / Burgundy', bg: 'linear-gradient(135deg, #881337 50%, #4c0519 50%)' },
        { id: 'orange', name: 'Cam / Hổ phách', bg: 'linear-gradient(135deg, #ea580c 50%, #f97316 50%)' },
        { id: 'yellow', name: 'Vàng / Gold', bg: 'linear-gradient(135deg, #eab308 50%, #fde047 50%)' },
        { id: 'pink', name: 'Hồng / Rose', bg: 'linear-gradient(135deg, #ec4899 50%, #f472b6 50%)' },
        { id: 'metallic', name: 'Ánh kim / Chrome', bg: 'linear-gradient(135deg, #b45309 30%, #e2e8f0 70%)', border: 'rgba(255,255,255,0.3)' }
    ];

    // Cấp 2: Danh mục con (Sub-Category)
    const AUDIENCES = {
        men: 'Nam (Men)',
        women: 'Nữ (Women)',
        boy: 'Bé Trai (Boys)',
        girls: 'Bé Gái (Girls)'
    };

    // State hiện tại của bộ lọc trang chủ
    let currentAudience = 'all';
    let currentMasterCategory = 'all';
    let currentSubCategory = 'all';
    let currentDetailedStyle = 'all';
    let currentColor = 'all';
    let currentMaxPrice = 1500000;
    let currentKeyword = '';
    let filteredProductList = [];

    // Cấu hình thanh trượt giá theo danh mục
    const PRICE_CONFIGS = {
        all: { min: 200000, max: 6000000, step: 50000, defaultVal: 6000000, milestones: ['200k', '1.5M', '3M', '4.5M', 'Tối đa'] },
        ao: { min: 200000, max: 1500000, step: 50000, defaultVal: 1500000, milestones: ['200k', '500k', '800k', '1.1M', 'Tối đa'] },
        quan: { min: 250000, max: 1500000, step: 50000, defaultVal: 1500000, milestones: ['250k', '500k', '800k', '1.2M', 'Tối đa'] },
        giay: { min: 1000000, max: 6000000, step: 200000, defaultVal: 6000000, milestones: ['1M', '2M', '3.5M', '5M', 'Tối đa'] }
    };

    function formatVND(amount) {
        return Number(amount).toLocaleString('vi-VN') + ' ₫';
    }

    // HTML Giao diện Drawer Bộ Lọc Trang Chủ (Phải) & Modal Xác Nhận (Chính Giữa)
    const HOME_FILTER_DRAWER_HTML = `
        <div class="fashion-filter-backdrop" id="hnmtHomeFilterBackdrop"></div>
        <aside class="fashion-filter-sidebar" role="dialog" aria-modal="true" aria-label="Bộ lọc đa danh mục trang chủ">
            <!-- Header Tinh Giản Chuẩn Luxury Atelier -->
            <div class="fashion-sidebar-header">
                <h2 class="fashion-filter-title" id="homeFilterHeaderTitle">Bộ Lọc Thời Trang</h2>
                <button type="button" class="fashion-filter-close" id="hnmtHomeFilterCloseBtn" aria-label="Đóng bộ lọc" title="Đóng (ESC)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- Hàng tìm kiếm từ khóa & Nút Đặt Lại -->
            <div class="fashion-search-row">
                <div class="fashion-search-bar">
                    <svg class="search-bar-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-4.35-4.35"/>
                    </svg>
                    <input type="text" id="homeSearchInput" class="fashion-search-input" placeholder="Tìm theo tên sản phẩm, chất liệu..." autocomplete="off" spellcheck="false">
                    <button type="button" id="homeClearSearchBtn" class="fashion-clear-btn" style="display:none;" title="Xóa từ khóa">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <button type="button" id="homeResetFilterBtn" class="fashion-reset-filter-btn" title="Đặt lại toàn bộ tiêu chí về mặc định">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                    </svg>
                    <span>Đặt lại</span>
                </button>
            </div>
            <div id="homeSearchSuggestions" class="fashion-search-suggestions" role="listbox" hidden></div>

            <!-- Vùng cuộn chứa các tầng tiêu chí lọc -->
            <div class="fashion-sidebar-scroll">

                <!-- 0. CHỌN ĐỐI TƯỢNG (NAM / NỮ / BÉ TRAI / BÉ GÁI) -->
                <div class="fashion-select-card" id="homeAudienceCard">
                    <label class="fashion-card-label" for="homeAudienceSelect">ĐỐI TƯỢNG</label>
                    <div class="fashion-select-wrapper">
                        <select id="homeAudienceSelect" class="fashion-select-input">
                            <option value="all" selected>Tất cả đối tượng</option>
                            <option value="men">Nam (Men's Collection)</option>
                            <option value="women">Nữ (Women's Collection)</option>
                            <option value="boy">Bé Trai (Boys Collection)</option>
                            <option value="girls">Bé Gái (Girls Collection)</option>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 1. CẤP 1: CHỌN DANH MỤC (ÁO / QUẦN / GIÀY) -->
                <div class="fashion-select-card" id="homeMasterCatCard">
                    <label class="fashion-card-label" for="homeMasterCatSelect">CHỌN DANH MỤC</label>
                    <div class="fashion-select-wrapper">
                        <select id="homeMasterCatSelect" class="fashion-select-input">
                            <option value="all" selected>Tất cả danh mục</option>
                            <option value="ao">Áo (Tops Collection)</option>
                            <option value="quan">Quần (Pants Collection)</option>
                            <option value="giay">Giày (Sneaker Vault)</option>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 2. CẤP 2: PHÂN LOẠI CHI TIẾT (Thay đổi theo danh mục chính) -->
                <div class="fashion-select-card" id="homeSubCatCard">
                    <label class="fashion-card-label" for="homeSubCatSelect" id="homeSubCatLabel">PHÂN LOẠI ÁO</label>
                    <div class="fashion-select-wrapper">
                        <select id="homeSubCatSelect" class="fashion-select-input">
                            <!-- Render dynamically -->
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 3. CẤP 3: KIỂU DÁNG CHI TIẾT / FORM (Thay đổi theo phân loại) -->
                <div class="fashion-select-card" id="homeDetailedStyleCard">
                    <label class="fashion-card-label" for="homeDetailedStyleSelect" id="homeDetailedStyleLabel">KIỂU DÁNG CHI TIẾT</label>
                    <div class="fashion-select-wrapper">
                        <select id="homeDetailedStyleSelect" class="fashion-select-input">
                            <!-- Render dynamically -->
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 4. GAM MÀU SẮC (18 Swatches tương tác) -->
                <div class="fashion-select-card fashion-swatches-card">
                    <div class="fashion-swatches-header">
                        <label class="fashion-card-label">GAM MÀU SẮC</label>
                        <span class="fashion-swatches-badge" id="homeSelectedColorName">Tất cả màu</span>
                    </div>
                    <div class="fashion-swatches-grid" id="homeColorSwatchesGrid" role="radiogroup" aria-label="Chọn gam màu">
                        <!-- Swatches render bằng JavaScript -->
                    </div>
                </div>

                <!-- 5. MỨC GIÁ TỐI ĐA (Thanh trượt mượt mà) -->
                <div class="fashion-select-card price-range-card">
                    <div class="price-header-row">
                        <label class="fashion-card-label" for="homePriceRange">MỨC GIÁ TỐI ĐA</label>
                        <span class="price-badge-display" id="homePriceDisplay">Tất cả mức giá</span>
                    </div>
                    <div class="range-slider-container">
                        <input type="range" id="homePriceRange" min="200000" max="1500000" step="50000" value="1500000" class="fashion-range-input">
                        <div class="range-milestones" id="homePriceMilestones">
                            <span>200k</span>
                            <span>500k</span>
                            <span>800k</span>
                            <span>1.1M</span>
                            <span>Tối đa</span>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer Drawer: Nút Áp Dụng (Mở Modal Xác Nhận Chính Giữa) -->
            <div class="fashion-sidebar-footer">
                <button type="button" id="homeApplyBtn" class="sv-apply-capsule-btn" title="Áp dụng bộ lọc và mở không gian trưng bày 3D">
                    <span class="apply-text">Áp Dụng</span>
                    <span class="capsule-badge" id="homeApplyCount">Đang tính...</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </aside>
    `;

    // HTML Modal Xác Nhận Chuyển Tiếp Không Gian Canh Giữa Màn Hình (Thuần Chữ, Nền Trắng Rõ Ràng)
    const CENTER_CONFIRM_MODAL_HTML = `
        <div class="hnmt-center-confirm-backdrop" id="hnmtHomeConfirmModal" aria-hidden="true">
            <div class="hnmt-center-confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
                <button type="button" class="home-results-close" id="homeResultsClose" aria-label="Đóng kết quả tìm kiếm" hidden>&times;</button>
                <h3 class="confirm-title" id="confirmTitle">Chuyển tiếp đến không gian 3D</h3>
                <div id="homeMatchingProducts"></div>
                
                <p class="confirm-desc" id="confirmDesc">
                    Bạn sắp rời khỏi Không Gian Trang Chủ để bước vào <strong id="confirmTargetName">Sào Áo 3D</strong> với <strong id="confirmCount">40 sản phẩm</strong> phù hợp. Bạn có muốn tiếp tục trải nghiệm?
                </p>

                <!-- Thẻ tóm tắt các tiêu chí đã chọn -->
                <div class="confirm-tags-recap" id="confirmTagsRecap">
                    <!-- Rendered by JS -->
                </div>

                <!-- 2 Nút Hành Động -->
                <div class="confirm-action-row">
                    <button type="button" class="confirm-btn-secondary" id="confirmStayBtn">
                        Ở lại Trang Chủ
                    </button>
                    <button type="button" class="confirm-btn-primary" id="confirmProceedBtn">
                        <span id="confirmProceedText">Khám Phá Sào Áo Ngay</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Khởi tạo DOM
    function ensureDOM() {
        let drawer = document.getElementById('hnmtHomeFilterModal');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'hnmtHomeFilterModal';
            drawer.className = 'hnmt-fashion-filter-modal is-light-theme hnmt-home-filter-modal';
            drawer.setAttribute('aria-hidden', 'true');
            drawer.innerHTML = HOME_FILTER_DRAWER_HTML;
            document.body.appendChild(drawer);
        } else {
            drawer.innerHTML = HOME_FILTER_DRAWER_HTML;
        }

        let confirmModal = document.getElementById('hnmtHomeConfirmModal');
        if (!confirmModal) {
            const wrap = document.createElement('div');
            wrap.innerHTML = CENTER_CONFIRM_MODAL_HTML;
            confirmModal = wrap.firstElementChild;
            document.body.appendChild(confirmModal);
        } else {
            confirmModal.outerHTML = CENTER_CONFIRM_MODAL_HTML;
            confirmModal = document.getElementById('hnmtHomeConfirmModal');
        }

        return { drawer, confirmModal };
    }

    // Đọc cơ sở dữ liệu Showroom Catalog theo đối tượng được chọn
    let showroomCatalogCache;
    function getCatalogData(aud = currentAudience) {
        try {
            const el = document.getElementById('showroomCatalog');
            if (!el) return { shirts: [], pants: [], shoes: [] };
            showroomCatalogCache ??= JSON.parse(el.textContent);
            const data = showroomCatalogCache;
            const audiences = aud === 'all' ? Object.keys(AUDIENCES) : [aud];
            const extra = currentKeyword.trim() ? Object.values(data.lookbook || {}).filter(item => audiences.includes(item.audience)) : [];
            const shirts = audiences.flatMap(audience => data?.clothing?.[audience]?.ao || []);
            const pants = audiences.flatMap(audience => data?.clothing?.[audience]?.quan || []);
            const shoeCollections = audiences.flatMap(audience => data?.shoes?.[audience] || []);
            const shoes = shoeCollections.flatMap(c => (c.items || []).map(it => ({
                ...it, collectionId: c.id, collectionTitle: c.title
            })));
            shirts.push(...extra.filter(item => item.kind === 'ao'));
            pants.push(...extra.filter(item => item.kind === 'quan'));
            shoes.push(...extra.filter(item => item.kind === 'giay'));
            function unique(items) {
                const byId = new Map();
                for (const item of items) {
                    if (!byId.has(item.productId)) byId.set(item.productId, item);
                }
                return [...byId.values()];
            }
            return { shirts: unique(shirts), pants: unique(pants), shoes: unique(shoes) };
        } catch (e) {
            console.warn('Lỗi đọc catalog cho Home Filter:', e);
            return { shirts: [], pants: [], shoes: [] };
        }
    }

    function initHomeFilter() {
        const { drawer, confirmModal } = ensureDOM();

        // Các thành phần Drawer
        const backdrop = document.getElementById('hnmtHomeFilterBackdrop');
        const closeBtn = document.getElementById('hnmtHomeFilterCloseBtn');
        const resetBtn = document.getElementById('homeResetFilterBtn');
        const searchInput = document.getElementById('homeSearchInput');
        const clearSearchBtn = document.getElementById('homeClearSearchBtn');
        const audienceSelect = document.getElementById('homeAudienceSelect');
        const masterCatSelect = document.getElementById('homeMasterCatSelect');
        const catPills = document.querySelectorAll('.hnmt-cat-pill');
        const subCatCard = document.getElementById('homeSubCatCard');
        const subCatLabel = document.getElementById('homeSubCatLabel');
        const subCatSelect = document.getElementById('homeSubCatSelect');
        const detailedStyleCard = document.getElementById('homeDetailedStyleCard');
        const detailedStyleLabel = document.getElementById('homeDetailedStyleLabel');
        const detailedStyleSelect = document.getElementById('homeDetailedStyleSelect');
        const swatchesGrid = document.getElementById('homeColorSwatchesGrid');
        const selectedColorName = document.getElementById('homeSelectedColorName');
        const priceRange = document.getElementById('homePriceRange');
        const priceDisplay = document.getElementById('homePriceDisplay');
        const priceMilestones = document.getElementById('homePriceMilestones');
        const applyBtn = document.getElementById('homeApplyBtn');
        const applyCountBadge = document.getElementById('homeApplyCount');

        // Các thành phần Confirm Modal
        const confirmIconBadge = document.getElementById('confirmIconBadge');
        const confirmIconEmoji = document.getElementById('confirmIconEmoji');
        const confirmTargetName = document.getElementById('confirmTargetName');
        const confirmCount = document.getElementById('confirmCount');
        const confirmTagsRecap = document.getElementById('confirmTagsRecap');
        const confirmProceedText = document.getElementById('confirmProceedText');
        const resultsCloseBtn = document.getElementById('homeResultsClose');
        const confirmStayBtn = document.getElementById('confirmStayBtn');
        const confirmProceedBtn = document.getElementById('confirmProceedBtn');

        function productsFor(kind) {
            const catalog = getCatalogData();
            return catalog[{ ao: 'shirts', quan: 'pants', giay: 'shoes' }[kind]];
        }

        // Populate Sub-Category Select theo Master Category
        function populateSubCategories(cat, preserve = false) {
            const list = [{value: 'all', label: 'Tất cả phân loại'}, ...(cat === 'all' ? [] : window.ShowroomFilterOptions.categories(productsFor(cat), cat))];
            const prevVal = preserve ? subCatSelect.value : 'all';
            subCatSelect.innerHTML = '';

            list.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.value;
                opt.textContent = item.label;
                subCatSelect.appendChild(opt);
            });

            if (preserve && list.some(i => i.value === prevVal)) {
                subCatSelect.value = prevVal;
                currentSubCategory = prevVal;
            } else {
                subCatSelect.value = 'all';
                currentSubCategory = 'all';
            }

            subCatSelect.disabled = cat === 'all';
            detailedStyleSelect.disabled = cat === 'all';
            if (cat === 'all') subCatLabel.textContent = 'PHÂN LOẠI';
            else if (cat === 'ao') subCatLabel.textContent = 'PHÂN LOẠI ÁO';
            else if (cat === 'quan') subCatLabel.textContent = 'PHÂN LOẠI QUẦN';
            else subCatLabel.textContent = 'DÒNG GIÀY (SNEAKERS)';

            populateDetailedStyles(cat, currentSubCategory, preserve);
        }

        // Populate Detailed Styles theo Sub-Category
        function populateDetailedStyles(cat, subCat, preserve = false) {
            const list = [{value: 'all', label: 'Tất cả kiểu dáng'}, ...(cat === 'all' ? [] : window.ShowroomFilterOptions.styles(productsFor(cat), cat, subCat))];
            const prevVal = preserve ? detailedStyleSelect.value : 'all';
            detailedStyleSelect.innerHTML = '';

            list.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.value;
                opt.textContent = item.label;
                detailedStyleSelect.appendChild(opt);
            });

            if (preserve && list.some(i => i.value === prevVal)) {
                detailedStyleSelect.value = prevVal;
                currentDetailedStyle = prevVal;
            } else {
                detailedStyleSelect.value = 'all';
                currentDetailedStyle = 'all';
            }

            // Cập nhật nhãn
            if (cat === 'all') detailedStyleLabel.textContent = 'KIỂU DÁNG';
            else if (cat === 'ao') detailedStyleLabel.textContent = 'KIỂU DÁNG CHI TIẾT (ÁO)';
            else if (cat === 'quan') detailedStyleLabel.textContent = 'FORM DÁNG CHI TIẾT (QUẦN)';
            else detailedStyleLabel.textContent = 'PHIÊN BẢN CHI TIẾT (GIÀY)';
        }

        // Render bảng màu Swatches (sao chép chuẩn 100% từ shirt-filter.js)
        function renderColorSwatches() {
            if (!swatchesGrid) return;
            swatchesGrid.innerHTML = '';

            FASHION_SWATCHES.forEach(sw => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `fashion-swatch-item ${sw.id === currentColor ? 'is-selected' : ''}`;
                btn.setAttribute('data-color', sw.id);
                btn.setAttribute('title', sw.name);
                btn.setAttribute('aria-label', sw.name);
                btn.setAttribute('aria-checked', sw.id === currentColor ? 'true' : 'false');
                btn.setAttribute('role', 'radio');

                const dot = document.createElement('span');
                dot.className = 'swatch-dot';
                dot.style.background = sw.bg;
                if (sw.border) dot.style.border = `1px solid ${sw.border}`;

                btn.appendChild(dot);

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentColor = sw.id;
                    updateColorSwatchesUI();
                    computeLiveMatches();
                });

                swatchesGrid.appendChild(btn);
            });

            if (selectedColorName) {
                const currentSw = FASHION_SWATCHES.find(s => s.id === currentColor) || FASHION_SWATCHES[0];
                selectedColorName.textContent = currentSw.name;
            }
        }

        function updateColorSwatchesUI() {
            if (swatchesGrid) {
                swatchesGrid.querySelectorAll('.fashion-swatch-item').forEach(btn => {
                    const c = btn.getAttribute('data-color');
                    const isSel = (c === currentColor);
                    btn.classList.toggle('is-selected', isSel);
                    btn.setAttribute('aria-checked', isSel ? 'true' : 'false');
                });
            }
            if (selectedColorName) {
                const currentSw = FASHION_SWATCHES.find(s => s.id === currentColor) || FASHION_SWATCHES[0];
                selectedColorName.textContent = currentSw.name;
            }
        }

        // Cập nhật cấu hình giá theo Master Category
        function updatePriceSliderConfig(cat) {
            const conf = PRICE_CONFIGS[cat] || PRICE_CONFIGS.ao;
            priceRange.min = conf.min;
            priceRange.max = conf.max;
            priceRange.step = conf.step;
            priceRange.value = conf.defaultVal;
            currentMaxPrice = conf.defaultVal;
            priceDisplay.textContent = 'Tất cả mức giá';

            // Cập nhật mốc hiển thị
            if (priceMilestones) {
                priceMilestones.innerHTML = conf.milestones.map(m => `<span>${m}</span>`).join('');
            }
        }

        // Cập nhật nhãn giá khi kéo thanh trượt
        function updatePriceLabel(val) {
            const conf = PRICE_CONFIGS[currentMasterCategory] || PRICE_CONFIGS.ao;
            if (Number(val) >= conf.max) {
                priceDisplay.textContent = 'Tất cả mức giá';
            } else {
                priceDisplay.textContent = 'Dưới ' + formatVND(val);
            }
        }

        // Thuật toán Lọc Live Sản Phẩm
        function computeLiveMatches() {
            const catalog = getCatalogData();
            const kinds = { ao: catalog.shirts, quan: catalog.pants, giay: catalog.shoes };
            const selectedKinds = currentMasterCategory === 'all' ? Object.keys(kinds) : [currentMasterCategory];
            const sourceList = selectedKinds.flatMap(kind => kinds[kind].map(item => ({ item, kind })));
            const itemUnit = { ao: 'áo', quan: 'quần', giay: 'đôi giày' }[currentMasterCategory] || 'sản phẩm';

            const matchesKeyword = window.ShowroomFilterOptions.createKeywordMatcher(currentKeyword);
            const conf = PRICE_CONFIGS[currentMasterCategory] || PRICE_CONFIGS.ao;
            const maxPrice = Number(priceRange.value);

            filteredProductList = sourceList.filter(({ item, kind }) => {
                if (!window.ShowroomFilterOptions.matchesCategory(item, kind, currentSubCategory) ||
                    !window.ShowroomFilterOptions.matchesStyle(item, kind, currentDetailedStyle)) return false;

                // 3. Mức giá
                let itemPriceVND = 0;
                if (kind === 'giay') {
                    itemPriceVND = Number(item.price || 0);
                } else {
                    itemPriceVND = Number(item.price || 0) * 10000;
                }
                if (maxPrice < conf.max && itemPriceVND > maxPrice) {
                    return false;
                }

                if (window.ShowroomFilterOptions.colorVariant(item, currentColor) < 0) return false;

                return matchesKeyword({ item, kind });
            }).map(({ item }) => item);

            // Cập nhật số lượng trên nút Áp Dụng
            const count = filteredProductList.length;
            if (applyCountBadge) {
                const hasActiveFilter = currentKeyword.trim() || currentAudience !== 'all' ||
                    currentMasterCategory !== 'all' || currentSubCategory !== 'all' ||
                    currentDetailedStyle !== 'all' || currentColor !== 'all' || maxPrice < conf.max;
                applyCountBadge.textContent = hasActiveFilter ? `${count} ${itemUnit}` : 'Chọn bộ lọc';
            }

            return count;
        }

        // Chuyển đổi Đối Tượng (Nam / Nữ / Bé Trai / Bé Gái)
        function switchAudience(newAud, refresh = true) {
            if (newAud !== 'all' && !Object.hasOwn(AUDIENCES, newAud)) newAud = 'all';
            currentAudience = newAud;
            populateSubCategories(currentMasterCategory, true);
            if (audienceSelect && audienceSelect.value !== newAud) {
                audienceSelect.value = newAud;
            }
            if (refresh) computeLiveMatches();
        }

        // Chuyển đổi Master Category
        function switchMasterCategory(newCat, refresh = true) {
            currentMasterCategory = newCat;
            if (masterCatSelect) masterCatSelect.value = newCat;

            const titleEl = document.getElementById('homeFilterHeaderTitle');
            if (titleEl) {
                if (newCat === 'ao') titleEl.textContent = 'Bộ Lọc Sào Áo';
                else if (newCat === 'quan') titleEl.textContent = 'Bộ Lọc Sào Quần';
                else if (newCat === 'giay') titleEl.textContent = 'Bộ Lọc Tủ Giày';
                else titleEl.textContent = 'Bộ Lọc Thời Trang';
            }

            populateSubCategories(newCat, false);
            updatePriceSliderConfig(newCat);
            if (refresh) computeLiveMatches();
        }

        // Mở Drawer Bộ Lọc (hỗ trợ chuyển sẵn đối tượng nếu được truyền)
        function openDrawer(targetAud) {
            if (targetAud && ['men', 'women', 'boy', 'girls'].includes(targetAud)) {
                switchAudience(targetAud);
            }
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            document.body.classList.add('fashion-filter-open');
            computeLiveMatches();
        }

        // Đóng Drawer Bộ Lọc
        function closeDrawer() {
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('fashion-filter-open');
        }

        // Mở Center Confirm Modal (Thuần Chữ, Trắng Tinh Tế, Dễ Đọc)
        function matchingExperience() {
            const first = filteredProductList[0];
            if (!first || !Object.hasOwn(AUDIENCES, first.audience) ||
                !['ao', 'quan', 'giay'].includes(first.kind)) return null;

            const sameExperience = filteredProductList.every(product =>
                product.audience === first.audience && product.kind === first.kind &&
                !product.lookbookOnly && (product.kind !== 'giay' || product.collectionId));
            return sameExperience ? { audience: first.audience, category: first.kind } : null;
        }

        function openConfirmModal(results) {
            if (Array.isArray(results?.productIds)) {
                const { shirts, pants, shoes } = getCatalogData();
                const products = new Map([...shirts, ...pants, ...shoes].map(item => [item.productId, item]));
                filteredProductList = results.productIds.map(id => products.get(id)).filter(Boolean);
            } else {
                computeLiveMatches();
            }
            closeDrawer();

            const audLabel = AUDIENCES[currentAudience] || 'Tất cả';
            const experience = results?.page ? null : matchingExperience();
            const showProducts = !experience;
            const targetAudienceLabel = experience ? AUDIENCES[experience.audience] : audLabel;
            const list = document.getElementById('homeMatchingProducts');
            list.replaceChildren();
            document.getElementById('confirmTitle').textContent = showProducts ? 'Kết quả tìm kiếm' : 'Chuyển tiếp đến không gian 3D';
            document.getElementById('confirmDesc').style.display = showProducts ? 'none' : '';
            confirmProceedBtn.style.display = showProducts ? 'none' : '';
            confirmStayBtn.textContent = showProducts ? 'Đóng' : 'Ở lại Trang Chủ';
            resultsCloseBtn.hidden = !showProducts;
            if (showProducts) renderMatchingProducts(results?.page || 1);
            let targetTitle = `Sào Áo 3D (${targetAudienceLabel})`;
            let proceedBtnLabel = `Khám Phá Sào Áo Ngay`;

            if (experience?.category === 'quan') {
                targetTitle = `Sào Quần 3D (${targetAudienceLabel})`;
                proceedBtnLabel = `Khám Phá Sào Quần Ngay`;
            } else if (experience?.category === 'giay') {
                targetTitle = `Tủ Giày Sneaker Vault (${targetAudienceLabel})`;
                proceedBtnLabel = `Đến Sneaker Vault Ngay`;
            }

            if (confirmTargetName) confirmTargetName.textContent = targetTitle;
            if (confirmCount) confirmCount.textContent = `${filteredProductList.length} sản phẩm`;
            if (confirmProceedText) confirmProceedText.textContent = proceedBtnLabel;

            // Render các tags tóm tắt bộ lọc (thuần chữ tinh tế, không icon)
            if (confirmTagsRecap) {
                confirmTagsRecap.innerHTML = '';

                // Chip 0: Đối tượng
                const audTag = document.createElement('span');
                audTag.className = 'confirm-tag-chip';
                audTag.textContent = `Đối tượng: ${audLabel}`;
                confirmTagsRecap.appendChild(audTag);

                // Chip 1: Danh mục chính
                const catTag = document.createElement('span');
                catTag.className = 'confirm-tag-chip';
                catTag.textContent = ({ ao: 'Áo', quan: 'Quần', giay: 'Giày' })[currentMasterCategory] || 'Tất cả danh mục';
                confirmTagsRecap.appendChild(catTag);

                // Chip 2: Phân loại phụ (nếu có chọn)
                if (currentSubCategory !== 'all') {
                    const selectedSubOpt = subCatSelect.options[subCatSelect.selectedIndex];
                    const subTag = document.createElement('span');
                    subTag.className = 'confirm-tag-chip';
                    subTag.textContent = selectedSubOpt ? selectedSubOpt.textContent : currentSubCategory;
                    confirmTagsRecap.appendChild(subTag);
                }

                // Chip 3: Kiểu dáng chi tiết (nếu có chọn)
                if (currentDetailedStyle !== 'all') {
                    const selectedStyleOpt = detailedStyleSelect.options[detailedStyleSelect.selectedIndex];
                    const styleTag = document.createElement('span');
                    styleTag.className = 'confirm-tag-chip';
                    styleTag.textContent = selectedStyleOpt ? selectedStyleOpt.textContent : currentDetailedStyle;
                    confirmTagsRecap.appendChild(styleTag);
                }

                // Chip 4: Màu sắc (nếu khác 'all')
                if (currentColor !== 'all') {
                    const sw = FASHION_SWATCHES.find(s => s.id === currentColor);
                    const colorTag = document.createElement('span');
                    colorTag.className = 'confirm-tag-chip';
                    colorTag.textContent = sw ? sw.name : currentColor;
                    confirmTagsRecap.appendChild(colorTag);
                }

                // Chip 5: Mức giá
                const conf = PRICE_CONFIGS[currentMasterCategory] || PRICE_CONFIGS.ao;
                if (Number(priceRange.value) < conf.max) {
                    const priceTag = document.createElement('span');
                    priceTag.className = 'confirm-tag-chip';
                    priceTag.textContent = `Dưới ${formatVND(priceRange.value)}`;
                    confirmTagsRecap.appendChild(priceTag);
                }

                // Chip 6: Từ khóa (nếu có)
                if (currentKeyword.trim()) {
                    const kwTag = document.createElement('span');
                    kwTag.className = 'confirm-tag-chip';
                    kwTag.textContent = `"${currentKeyword.trim()}"`;
                    confirmTagsRecap.appendChild(kwTag);
                }
            }

            confirmModal.classList.add('is-open');
            confirmModal.setAttribute('aria-hidden', 'false');
        }

        function renderMatchingProducts(page) {
            const list = document.getElementById('homeMatchingProducts');
            const pageSize = 12;
            const pageCount = Math.ceil(filteredProductList.length / pageSize);
            page = Math.max(1, Math.min(page, pageCount));
            const start = (page - 1) * pageSize;
            const products = filteredProductList.slice(start, start + pageSize);
            list.replaceChildren();

            const count = document.createElement('p');
            count.className = 'search-results-count';
            count.textContent = `${filteredProductList.length} sản phẩm phù hợp`;
            list.appendChild(count);
            if (!filteredProductList.length) {
                const empty = document.createElement('p');
                empty.className = 'search-results-empty';
                empty.textContent = 'Thử từ khóa khác hoặc bỏ bớt điều kiện lọc.';
                list.appendChild(empty);
                return;
            }

            const grid = document.createElement('div');
            grid.className = 'search-results-grid';
            for (const product of products) {
                if (!Number.isSafeInteger(product.productId) || product.productId <= 0) continue;
                const card = document.createElement('a');
                card.className = 'search-result-card';
                card.href = '/Products/Details/' + product.productId + '?from=home';
                if (!product.lookbookOnly && Object.hasOwn(AUDIENCES, product.audience)) {
                    const query = new URLSearchParams({ audience: product.audience, searchProduct: product.productId });
                    if (product.kind === 'giay' && product.collectionId) {
                        card.href = '/Products/Sneakers?' + query;
                    } else if (product.kind === 'ao' || product.kind === 'quan') {
                        query.set('type', product.kind);
                        card.href = '/Products/Rail?' + query;
                    }
                }
                card.addEventListener('click', event => {
                    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                    history.replaceState({
                        ...history.state,
                        homeSearch: {
                            page, scrollTop: grid.scrollTop, audience: currentAudience,
                            category: currentMasterCategory, subCategory: currentSubCategory,
                            style: currentDetailedStyle, color: currentColor, price: priceRange.value,
                            keyword: currentKeyword,
                            productIds: filteredProductList.map(item => item.productId)
                        }
                    }, '');
                });
                const photo = document.createElement('img');
                photo.src = product.frontImg || product.image || '';
                photo.alt = product.name || 'Sản phẩm';
                photo.loading = 'lazy';
                const name = document.createElement('span');
                name.textContent = product.name || 'Sản phẩm';
                const price = document.createElement('strong');
                const amount = Number(product.price || 0) * (product.kind === 'giay' ? 1 : 10000);
                price.textContent = new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
                card.append(photo, name, price);
                grid.appendChild(card);
            }
            list.appendChild(grid);

            if (pageCount > 1) {
                const pagination = document.createElement('nav');
                pagination.className = 'search-results-pagination';
                pagination.setAttribute('aria-label', 'Trang kết quả tìm kiếm');
                const previous = document.createElement('button');
                previous.type = 'button';
                previous.textContent = '‹ Trước';
                previous.disabled = page === 1;
                previous.addEventListener('click', () => renderMatchingProducts(page - 1));
                const status = document.createElement('span');
                status.textContent = `Trang ${page} / ${pageCount}`;
                const next = document.createElement('button');
                next.type = 'button';
                next.textContent = 'Tiếp ›';
                next.disabled = page === pageCount;
                next.addEventListener('click', () => renderMatchingProducts(page + 1));
                pagination.append(previous, status, next);
                list.appendChild(pagination);
            }
        }

        // Đóng Center Confirm Modal
        function closeConfirmModal() {
            if (history.state?.homeSearch) {
                const { homeSearch, ...state } = history.state;
                history.replaceState(state, '');
            }
            confirmModal.classList.remove('is-open');
            confirmModal.setAttribute('aria-hidden', 'true');
        }

        // Chuyển tiếp không gian khi khách bấm xác nhận
        function proceedToExperience() {
            const experience = matchingExperience();
            if (!experience) return;
            closeConfirmModal();

            const { audience, category } = experience;
            const audLabel = AUDIENCES[audience];

            // Đóng gói payload bộ lọc để trang đích nhận diện
            const filterPayload = {
                audience,
                category,
                subCategory: currentSubCategory,
                detailedStyle: currentDetailedStyle,
                color: currentColor,
                maxPrice: Number(priceRange.value) < Number(priceRange.max) ? Number(priceRange.value) : null,
                keyword: currentKeyword,
                filteredProducts: filteredProductList,
                label: `LỌC TỪ TRANG CHỦ (${audLabel} - ${filteredProductList.length} MÓN)`
            };

            const audQuery = encodeURIComponent(audience);
            if (category === 'giay') {
                sessionStorage.setItem('hnmt_pending_sneaker_filter', JSON.stringify(filterPayload));
                window.location.href = `/Products/Sneakers?audience=${audQuery}`;
            } else {
                sessionStorage.setItem('hnmt_pending_rail_filter', JSON.stringify(filterPayload));
                window.location.href = `/Products/Rail?type=${category}&audience=${audQuery}`;
            }
        }

        // Đặt lại toàn bộ bộ lọc
        function resetAllFilters() {
            currentAudience = 'all';
            if (audienceSelect) audienceSelect.value = 'all';
            switchMasterCategory('all');
            currentSubCategory = 'all';
            currentDetailedStyle = 'all';
            currentColor = 'all';
            currentKeyword = '';
            if (searchInput) searchInput.value = '';
            renderSearchSuggestions('');
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            if (selectedColorName) selectedColorName.textContent = 'Tất cả màu';

            populateSubCategories(currentMasterCategory, false);
            updatePriceSliderConfig(currentMasterCategory);
            renderColorSwatches();
            computeLiveMatches();
        }

        // Event Listeners
        if (backdrop) backdrop.addEventListener('click', closeDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

        if (audienceSelect) {
            audienceSelect.addEventListener('change', (e) => {
                switchAudience(e.target.value);
            });
        }

        if (masterCatSelect) {
            masterCatSelect.addEventListener('change', (e) => {
                switchMasterCategory(e.target.value);
            });
        }

        catPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const targetCat = pill.getAttribute('data-cat');
                if (targetCat) switchMasterCategory(targetCat);
            });
        });

        if (subCatSelect) {
            subCatSelect.addEventListener('change', (e) => {
                currentSubCategory = e.target.value;
                populateDetailedStyles(currentMasterCategory, currentSubCategory, false);
                computeLiveMatches();
            });
        }

        if (detailedStyleSelect) {
            detailedStyleSelect.addEventListener('change', (e) => {
                currentDetailedStyle = e.target.value;
                computeLiveMatches();
            });
        }

        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                updatePriceLabel(e.target.value);
                computeLiveMatches();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keydown', event => {
                if (event.key === 'Enter' && !event.isComposing) openConfirmModal();
            });
            searchInput.addEventListener('input', (e) => {
                currentKeyword = e.target.value;
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = currentKeyword.length > 0 ? 'block' : 'none';
                }
                computeLiveMatches();
                renderSearchSuggestions(currentKeyword);
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                currentKeyword = '';
                searchInput.value = '';
                renderSearchSuggestions('');
                clearSearchBtn.style.display = 'none';
                computeLiveMatches();
                searchInput.focus();
            });
        }

        function renderSearchSuggestions(keyword) {
            const box = document.getElementById('homeSearchSuggestions');
            box.replaceChildren();
            const names = keyword.trim()
                ? [...new Set(filteredProductList.map(item => item.name).filter(Boolean))].slice(0, 5)
                : [];
            if (!names.length) {
                box.hidden = true;
                return;
            }
            for (const name of names) {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'fashion-search-suggestion';
                option.setAttribute('role', 'option');
                option.textContent = name;
                option.addEventListener('click', () => {
                    searchInput.value = name;
                    currentKeyword = name;
                    box.hidden = true;
                    computeLiveMatches();
                    searchInput.focus();
                });
                box.appendChild(option);
            }
            box.hidden = false;
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', openConfirmModal);
        }

        // Confirm Modal Buttons
        resultsCloseBtn.addEventListener('click', closeConfirmModal);
        if (confirmStayBtn) {
            confirmStayBtn.addEventListener('click', closeConfirmModal);
        }

        if (confirmProceedBtn) {
            confirmProceedBtn.addEventListener('click', proceedToExperience);
        }

        // Click bên ngoài card confirm để đóng
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) closeConfirmModal();
        });

        // Phím tắt bàn phím: ESC để đóng, F hoặc / để mở khi đang ở trang chủ
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (confirmModal.classList.contains('is-open')) {
                    closeConfirmModal();
                } else if (drawer.classList.contains('is-open')) {
                    closeDrawer();
                }
            } else if ((e.key === 'f' || e.key === 'F') && !drawer.classList.contains('is-open') && !confirmModal.classList.contains('is-open')) {
                const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
                if (activeTag !== 'input' && activeTag !== 'textarea') {
                    e.preventDefault();
                    openDrawer();
                }
            }
        });

        // Khởi tạo trạng thái ban đầu
        populateSubCategories(currentMasterCategory, false);
        renderColorSwatches();
        updatePriceSliderConfig(currentMasterCategory);
        // Gắn vào window để gọi từ các nút bấm bên ngoài
        const savedSearch = history.state?.homeSearch;
        if (savedSearch) {
            switchAudience(savedSearch.audience, false);
            switchMasterCategory(savedSearch.category, false);
            subCatSelect.value = savedSearch.subCategory;
            populateSubCategories(currentMasterCategory, true);
            detailedStyleSelect.value = savedSearch.style;
            populateDetailedStyles(currentMasterCategory, currentSubCategory, true);
            currentColor = savedSearch.color;
            updateColorSwatchesUI();
            priceRange.value = savedSearch.price;
            updatePriceLabel(priceRange.value);
            currentKeyword = savedSearch.keyword;
            searchInput.value = currentKeyword;
            if (clearSearchBtn) clearSearchBtn.style.display = currentKeyword ? 'block' : 'none';
            openConfirmModal(savedSearch);
            const grid = confirmModal.querySelector('.search-results-grid');
            if (grid) grid.scrollTop = savedSearch.scrollTop;
        } else {
            computeLiveMatches();
        }

        window.HNMTHomeFilter = {
            open: openDrawer,
            close: closeDrawer,
            reset: resetAllFilters,
            switchCategory: switchMasterCategory,
            switchAudience: switchAudience,
            getAudience: () => currentAudience
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomeFilter);
    } else {
        initHomeFilter();
    }
})();
