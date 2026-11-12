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

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    // State bộ lọc của riêng Sào Áo
    let selectedStyle = 'all';
    let selectedColor = 'all';
    let maxPriceValue = 1500000; // Giá tối đa mặc định (1.500.000 ₫)
    let searchKeyword = '';
    let filteredShirts = [];

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
                <!-- 1. Kiểu Dáng Áo (Select-from-list đa dạng đầy đủ chủng loại) -->
                <div class="fashion-select-card">
                    <label class="fashion-card-label" for="shirtStyleSelect">Kiểu Dáng Áo</label>
                    <div class="fashion-select-wrapper">
                        <select id="shirtStyleSelect" class="fashion-select-input">
                            <option value="all">Tất cả kiểu dáng áo</option>
                            <optgroup label="Áo Thun & Polo">
                                <option value="tee">Áo Thun Cổ Tròn (Crewneck Tee)</option>
                                <option value="boxy">Áo Thun Oversized / Boxy Vai Trễ</option>
                                <option value="polo">Áo Polo Dệt Kim (Knit Polo)</option>
                                <option value="tank">Áo Ba Lỗ (Tank Top / Sleeveless)</option>
                            </optgroup>
                            <optgroup label="Áo Sơ Mi">
                                <option value="shirt">Áo Sơ Mi Camp-Collar (Cổ Danton)</option>
                                <option value="oxford">Áo Sơ Mi Oxford / Linen Cổ Điển</option>
                                <option value="utility">Áo Sơ Mi Utility Túi Hộp (Safari)</option>
                                <option value="flannel">Áo Sơ Mi Flannel Kẻ Caro</option>
                            </optgroup>
                            <optgroup label="Áo Khoác (Jackets)">
                                <option value="jacket">Áo Khoác Bóng Chày (Varsity Jacket)</option>
                                <option value="leather">Áo Khoác Da Moto Biker (Motorsport)</option>
                                <option value="bomber">Áo Khoác Bomber MA-1</option>
                                <option value="windbreaker">Áo Khoác Gió (Windbreaker)</option>
                                <option value="blazer">Áo Blazer May Đo Casual</option>
                            </optgroup>
                            <optgroup label="Áo Nỉ & Hoodie">
                                <option value="hoodie">Áo Hoodie Mũ Trùm Chân Cua</option>
                                <option value="crewneck">Áo Nỉ Chui Đầu (Sweatshirt / Fleece)</option>
                                <option value="zip-hoodie">Áo Zip Hoodie Khóa Kéo</option>
                                <option value="cardigan">Áo Cardigan Dệt Len Nổi</option>
                            </optgroup>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- 2. Gam Màu Sắc (Select-from-list phong phú bảng màu thời trang) -->
                <div class="fashion-select-card">
                    <label class="fashion-card-label" for="shirtColorSelect">Gam Màu Sắc</label>
                    <div class="fashion-select-wrapper">
                        <select id="shirtColorSelect" class="fashion-select-input">
                            <option value="all">Tất cả màu sắc</option>
                            <option value="black">⚫ Đen (Black / Charcoal / Onyx)</option>
                            <option value="white">⚪ Trắng / Be / Kem (White / Cream / Ivory)</option>
                            <option value="blue">🔵 Xanh Indigo / Denim / Cobalt</option>
                            <option value="navy">🔷 Xanh Navy / Chàm Sẫm</option>
                            <option value="gray">🔘 Xám Khói / Bạc (Washed Grey / Silver)</option>
                            <option value="green">🟢 Xanh Rêu / Olive / Forest Green</option>
                            <option value="sand">🟤 Nâu Cát / Be Khaki (Sand / Camel / Tan)</option>
                            <option value="red">🔴 Đỏ Rượu / Burgundy / Rust Terracotta</option>
                            <option value="yellow">🟡 Vàng Nhạt / Mustard (Acre)</option>
                            <option value="orange">🟠 Cam Đất / Vintage Orange</option>
                            <option value="purple">🟣 Tím Pastel / Lavender / Lilac</option>
                        </select>
                        <div class="select-chevron-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
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
        const styleSelect = document.getElementById('shirtStyleSelect');
        const colorSelect = document.getElementById('shirtColorSelect');
        const priceRange = document.getElementById('shirtPriceRange');
        const priceDisplay = document.getElementById('shirtPriceDisplay');
        const applyBtn = document.getElementById('shirtApplyBtn');
        const resetBtn = document.getElementById('shirtResetFilterBtn');

        if (!modal || !searchInput) return;

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
                // 1. Lọc theo kiểu dáng áo (Select dropdown)
                if (selectedStyle !== 'all') {
                    if (item.style !== selectedStyle) {
                        const itemType = removeVietnameseTones(item.type || '');
                        const itemDesc = removeVietnameseTones(item.desc || '');
                        const target = removeVietnameseTones(selectedStyle);
                        if (!itemType.includes(target) && !itemDesc.includes(target)) {
                            return false;
                        }
                    }
                }

                // 2. Lọc theo giá thanh trượt kéo (Range slider)
                const itemPriceVND = item.price * 10000;
                if (maxPriceValue < 1500000 && itemPriceVND > maxPriceValue) {
                    return false;
                }

                // 3. Lọc theo màu sắc (Select dropdown)
                if (selectedColor !== 'all') {
                    if (item.colorGroup !== selectedColor) {
                        const colorNames = removeVietnameseTones((item.colors || []).map(c => c[0]).join(' '));
                        const targetColor = removeVietnameseTones(selectedColor);
                        if (!colorNames.includes(targetColor)) {
                            return false;
                        }
                    }
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
            if (selectedStyle !== 'all' && styleSelect) {
                const opt = styleSelect.options[styleSelect.selectedIndex];
                if (opt) parts.push(opt.text.split('(')[0].trim());
            }
            if (maxPriceValue < 1500000) {
                parts.push(`≤ ${maxPriceValue.toLocaleString('vi-VN')} ₫`);
            }
            if (selectedColor !== 'all' && colorSelect) {
                const opt = colorSelect.options[colorSelect.selectedIndex];
                if (opt) parts.push(opt.text.replace(/^[^\s]+\s*/, '').split('(')[0].trim());
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
            const isFullCatalog = (selectedStyle === 'all' && maxPriceValue >= 1500000 && selectedColor === 'all' && !searchKeyword.trim());

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
            selectedStyle = 'all';
            selectedColor = 'all';
            maxPriceValue = 1500000;
            searchKeyword = '';

            if (searchInput) searchInput.value = '';
            if (clearBtn) clearBtn.style.display = 'none';
            if (styleSelect) styleSelect.value = 'all';
            if (colorSelect) colorSelect.value = 'all';
            if (priceRange) priceRange.value = 1500000;

            updatePriceDisplay();
            performFilter();

            if (window.ClothingRail && typeof window.ClothingRail.resetFilter === 'function') {
                window.ClothingRail.resetFilter();
            }
        }

        // Sự kiện thay đổi Kiểu Dáng
        if (styleSelect) {
            styleSelect.addEventListener('change', () => {
                selectedStyle = styleSelect.value;
                performFilter();
            });
        }

        // Sự kiện thay đổi Màu Sắc
        if (colorSelect) {
            colorSelect.addEventListener('change', () => {
                selectedColor = colorSelect.value;
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
