/**
 * ==============================================================================
 * HNMTSHOP - BỘ LỌC & TÌM KIẾM DÀNH RIÊNG CHO SÀO ÁO (SHIRTS FILTER ENGINE)
 * Thiết kế sang trọng chuẩn High-Fashion Boutique (Acne Studios / Apple minimalism)
 * Phù hợp 100% với không gian Showroom nghệ thuật HNMTSHOP
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
    let selectedPrice = 'all';
    let selectedColor = 'all';
    let searchKeyword = '';
    let filteredShirts = [];

    // Lấy toàn bộ danh sách 15 áo từ ClothingRail
    function getShirtCatalog() {
        if (window.ClothingRail && Array.isArray(window.ClothingRail.ALL_SHIRT_PRODUCTS)) {
            return window.ClothingRail.ALL_SHIRT_PRODUCTS;
        }
        return [];
    }

    // HTML Template của Bộ Lọc Sào Áo (Chỉ dùng riêng cho Sào Áo, thiết kế phong cách lookbook sang trọng)
    const MODAL_HTML = `
        <div class="fashion-filter-backdrop" id="shirtFilterBackdrop"></div>
        <div class="fashion-filter-dialog" role="dialog" aria-modal="true" aria-label="Bộ lọc tìm kiếm sào áo">
            <!-- Nút đóng góc phải -->
            <button type="button" class="fashion-filter-close" id="shirtFilterCloseBtn" aria-label="Đóng bộ lọc">
                <span>ĐÓNG</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <!-- Header sang trọng chuẩn Luxury Boutique -->
            <div class="fashion-filter-header">
                <span class="fashion-filter-eyebrow">HNMTSHOP // BỘ SƯU TẬP ÁO</span>
                <h2 class="fashion-filter-title">Bộ Lọc & Tìm Kiếm Áo</h2>
                <p class="fashion-filter-desc">Khám phá các thiết kế sơ mi camp-collar, áo thun boxy, áo khoác độc bản.</p>
            </div>

            <!-- Thanh tìm kiếm theo tên áo thanh lịch -->
            <div class="fashion-search-bar">
                <svg class="search-bar-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="m20 20-4.35-4.35"/>
                </svg>
                <input type="text" id="shirtSearchInput" class="fashion-search-input" placeholder="Tìm theo tên áo, họa tiết, kiểu dáng... (Nhấn Enter để đẩy ra sào)" autocomplete="off" spellcheck="false">
                <button type="button" id="shirtClearSearchBtn" class="fashion-clear-btn" style="display:none;" title="Xóa từ khóa">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Khung các nhóm tiêu chí lọc của Sào Áo -->
            <div class="fashion-filter-body">
                <!-- 1. Kiểu Dáng Áo -->
                <div class="fashion-filter-section">
                    <div class="section-label">
                        <span class="label-title">Kiểu Dáng Áo</span>
                        <span class="label-hint">Phom dáng thiết kế</span>
                    </div>
                    <div class="fashion-pills-row" id="shirtStylePills">
                        <button type="button" class="fashion-pill is-active" data-val="all">Tất cả kiểu áo</button>
                        <button type="button" class="fashion-pill" data-val="tee">Áo Thun (Tee)</button>
                        <button type="button" class="fashion-pill" data-val="shirt">Sơ Mi (Shirt)</button>
                        <button type="button" class="fashion-pill" data-val="jacket">Áo Khoác (Jacket)</button>
                        <button type="button" class="fashion-pill" data-val="hoodie">Áo Nỉ / Hoodie</button>
                    </div>
                </div>

                <!-- 2. Khoảng Giá -->
                <div class="fashion-filter-section">
                    <div class="section-label">
                        <span class="label-title">Khoảng Giá</span>
                        <span class="label-hint">Ngân sách mong muốn</span>
                    </div>
                    <div class="fashion-pills-row" id="shirtPricePills">
                        <button type="button" class="fashion-pill is-active" data-val="all">Tất cả mức giá</button>
                        <button type="button" class="fashion-pill" data-val="under500">Dưới 500.000 ₫</button>
                        <button type="button" class="fashion-pill" data-val="500to700">500.000 ₫ – 700.000 ₫</button>
                        <button type="button" class="fashion-pill" data-val="over700">Trên 700.000 ₫</button>
                    </div>
                </div>

                <!-- 3. Màu Sắc -->
                <div class="fashion-filter-section">
                    <div class="section-label">
                        <span class="label-title">Gam Màu Sắc</span>
                        <span class="label-hint">Tông màu chủ đạo</span>
                    </div>
                    <div class="fashion-pills-row" id="shirtColorPills">
                        <button type="button" class="fashion-pill is-active" data-val="all">
                            <span>Tất cả màu</span>
                        </button>
                        <button type="button" class="fashion-pill" data-val="black">
                            <span class="color-swatch" style="background: #18191c;"></span>
                            <span>Đen Huyền Bí</span>
                        </button>
                        <button type="button" class="fashion-pill" data-val="white">
                            <span class="color-swatch" style="background: #f4efe6; border: 1px solid #d5d5ce;"></span>
                            <span>Trắng / Be / Kem</span>
                        </button>
                        <button type="button" class="fashion-pill" data-val="blue">
                            <span class="color-swatch" style="background: #1d3557;"></span>
                            <span>Xanh Navy / Cobalt</span>
                        </button>
                        <button type="button" class="fashion-pill" data-val="gray">
                            <span class="color-swatch" style="background: #6c757d;"></span>
                            <span>Xám Washed</span>
                        </button>
                        <button type="button" class="fashion-pill" data-val="green">
                            <span class="color-swatch" style="background: #385038;"></span>
                            <span>Xanh Rêu / Forest</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Dải xem trước các mẫu áo phù hợp (Lookbook Strip) -->
            <div class="fashion-preview-block">
                <div class="preview-header">
                    <span>Xem trước các mẫu áo phù hợp (<strong id="shirtPreviewCount">0</strong>):</span>
                </div>
                <div class="fashion-preview-strip" id="shirtPreviewStrip"></div>
            </div>

            <!-- Footer Action Bar -->
            <div class="fashion-filter-footer">
                <div class="footer-summary">
                    <span class="summary-count">Tìm thấy <strong id="shirtMatchCount">15</strong> mẫu áo</span>
                    <span class="summary-sub" id="shirtSummarySub">Nhấn Enter hoặc nút bên cạnh để xem trên sào</span>
                </div>
                <div class="footer-buttons">
                    <button type="button" id="shirtResetFilterBtn" class="fashion-reset-btn" title="Đặt lại bộ lọc về mặc định">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                        </svg>
                        <span>Đặt lại</span>
                    </button>
                    <button type="button" id="shirtApplyBtn" class="fashion-apply-cta" title="Đẩy các mẫu áo phù hợp ra trên sào đồ (Enter)">
                        <span>HIỂN THỊ LÊN SÀO</span>
                        <span class="badge" id="shirtApplyCount">15 ÁO</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    function ensureModalDOM() {
        let modal = document.getElementById('hnmtShirtFilterModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hnmtShirtFilterModal';
            modal.className = 'hnmt-fashion-filter-modal';
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = MODAL_HTML;
            document.body.appendChild(modal);
        }
        return modal;
    }

    function initShirtFilter() {
        const modal = ensureModalDOM();
        const backdrop = document.getElementById('shirtFilterBackdrop');
        const closeBtn = document.getElementById('shirtFilterCloseBtn');
        const searchInput = document.getElementById('shirtSearchInput');
        const clearBtn = document.getElementById('shirtClearSearchBtn');
        const applyBtn = document.getElementById('shirtApplyBtn');
        const resetBtn = document.getElementById('shirtResetFilterBtn');
        const previewStrip = document.getElementById('shirtPreviewStrip');

        if (!modal || !searchInput) return;

        // Lọc danh sách áo theo các tiêu chí đã chọn
        function performFilter() {
            const allShirts = getShirtCatalog();
            const normalizedKeyword = removeVietnameseTones(searchKeyword);

            filteredShirts = allShirts.filter(item => {
                // 1. Lọc theo kiểu dáng áo
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

                // 2. Lọc theo khoảng giá
                if (selectedPrice === 'under500' && item.price >= 50) return false;
                if (selectedPrice === '500to700' && (item.price < 50 || item.price > 70)) return false;
                if (selectedPrice === 'over700' && item.price <= 70) return false;

                // 3. Lọc theo màu sắc
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

            // Cập nhật số lượng đếm
            const matchCountEl = document.getElementById('shirtMatchCount');
            const applyCountEl = document.getElementById('shirtApplyCount');
            const previewCountEl = document.getElementById('shirtPreviewCount');

            if (matchCountEl) matchCountEl.textContent = filteredShirts.length;
            if (applyCountEl) applyCountEl.textContent = `${filteredShirts.length} ÁO`;
            if (previewCountEl) previewCountEl.textContent = filteredShirts.length;

            renderPreviewStrip();
        }

        // Render dải lookbook xem trước các mẫu áo
        function renderPreviewStrip() {
            if (!previewStrip) return;
            previewStrip.innerHTML = '';

            if (filteredShirts.length === 0) {
                previewStrip.innerHTML = `
                    <div class="preview-empty-state">
                        <span>Không có mẫu áo nào khớp với tiêu chí bạn chọn. Thử chọn "Tất cả" hoặc bấm Đặt lại.</span>
                    </div>
                `;
                return;
            }

            filteredShirts.forEach((p, idx) => {
                const card = document.createElement('div');
                card.className = 'shirt-mini-card';
                card.title = `${p.name} - ${formatPrice(p.price)}`;
                const imgSrc = p.frontImg || `/clothing-rail/assets/${p.slug}-front.webp`;

                card.innerHTML = `
                    <div class="mini-thumb">
                        <img src="${imgSrc}" alt="${p.name}" loading="lazy">
                    </div>
                    <div class="mini-info">
                        <span class="mini-name">${p.name}</span>
                        <span class="mini-price">${formatPrice(p.price)}</span>
                    </div>
                `;

                // Bấm vào 1 áo trong xem trước: Đóng bộ lọc và mở chi tiết áo đó trên sào ngay
                card.addEventListener('click', () => {
                    closeModal();
                    if (window.ClothingRail && typeof window.ClothingRail.selectProduct === 'function') {
                        window.ClothingRail.selectProduct('ao', p.slug);
                    }
                });

                previewStrip.appendChild(card);
            });
        }

        // Tạo nhãn tóm tắt bộ lọc bằng tiếng Việt
        function buildSummaryLabel() {
            const parts = [];
            if (searchKeyword.trim()) {
                parts.push(`"${searchKeyword.trim()}"`);
            }
            if (selectedStyle !== 'all') {
                const styleBtn = document.querySelector(`#shirtStylePills .fashion-pill[data-val="${selectedStyle}"]`);
                if (styleBtn) parts.push(styleBtn.textContent.trim());
            }
            if (selectedPrice !== 'all') {
                const priceBtn = document.querySelector(`#shirtPricePills .fashion-pill[data-val="${selectedPrice}"]`);
                if (priceBtn) parts.push(priceBtn.textContent.trim());
            }
            if (selectedColor !== 'all') {
                const colorBtn = document.querySelector(`#shirtColorPills .fashion-pill[data-val="${selectedColor}"]`);
                if (colorBtn) parts.push(colorBtn.textContent.trim());
            }
            return parts.join(' • ') || 'Tất cả áo';
        }

        // Đẩy danh sách áo đã lọc ra trên Sào Treo Đồ
        function applyFilterToRail() {
            closeModal();

            // Đảm bảo sào áo đang được mở
            if (typeof window.open3DClothesRack === 'function') {
                window.open3DClothesRack('ao');
            }

            const label = buildSummaryLabel();
            const isFullCatalog = (selectedStyle === 'all' && selectedPrice === 'all' && selectedColor === 'all' && !searchKeyword.trim());

            if (window.ClothingRail) {
                if (isFullCatalog) {
                    window.ClothingRail.resetFilter();
                } else {
                    window.ClothingRail.applyFilter(filteredShirts, label);
                }
            }
        }

        function openModal() {
            // Đảm bảo đóng các spotlight cũ nếu có
            const oldSpotlight = document.getElementById('hnmtSpotlightSearchModal');
            if (oldSpotlight) oldSpotlight.classList.remove('is-open');

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');

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
            selectedPrice = 'all';
            selectedColor = 'all';
            searchKeyword = '';
            if (searchInput) searchInput.value = '';
            if (clearBtn) clearBtn.style.display = 'none';

            // Cập nhật trạng thái active của các nút pills
            document.querySelectorAll('#shirtStylePills .fashion-pill').forEach(b => {
                b.classList.toggle('is-active', b.dataset.val === 'all');
            });
            document.querySelectorAll('#shirtPricePills .fashion-pill').forEach(b => {
                b.classList.toggle('is-active', b.dataset.val === 'all');
            });
            document.querySelectorAll('#shirtColorPills .fashion-pill').forEach(b => {
                b.classList.toggle('is-active', b.dataset.val === 'all');
            });

            performFilter();

            // Nếu sào đồ đang áp dụng bộ lọc thì hoàn nguyên về tất cả áo
            if (window.ClothingRail && typeof window.ClothingRail.resetFilter === 'function') {
                window.ClothingRail.resetFilter();
            }
        }

        // Sự kiện click cho các Pills Kiểu Dáng
        document.querySelectorAll('#shirtStylePills .fashion-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedStyle = btn.dataset.val || 'all';
                document.querySelectorAll('#shirtStylePills .fashion-pill').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                performFilter();
            });
        });

        // Sự kiện click cho các Pills Khoảng Giá
        document.querySelectorAll('#shirtPricePills .fashion-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedPrice = btn.dataset.val || 'all';
                document.querySelectorAll('#shirtPricePills .fashion-pill').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                performFilter();
            });
        });

        // Sự kiện click cho các Pills Màu Sắc
        document.querySelectorAll('#shirtColorPills .fashion-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedColor = btn.dataset.val || 'all';
                document.querySelectorAll('#shirtColorPills .fashion-pill').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                performFilter();
            });
        });

        // Sự kiện nhập ô tìm kiếm
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

        // Phím tắt bàn phím
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });

        // Public API cho Sào Áo
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
