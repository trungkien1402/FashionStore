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

    // Từ khóa nhận diện màu sắc
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
    const SUBCATEGORIES = {
        ao: [
            { value: 'all', label: 'Tất cả loại áo' },
            { value: 'tee', label: 'Áo Thun (T-Shirt)' },
            { value: 'polo', label: 'Áo Polo Thể Thao' },
            { value: 'shirt', label: 'Áo Sơ Mi (Shirt)' },
            { value: 'hoodie', label: 'Áo Nỉ & Hoodie' },
            { value: 'jacket', label: 'Áo Khoác (Jackets / Bomber)' }
        ],
        quan: [
            { value: 'all', label: 'Tất cả loại quần' },
            { value: 'jean', label: 'Quần Jean / Denim' },
            { value: 'cargo', label: 'Quần Cargo Túi Hộp' },
            { value: 'kaki', label: 'Quần Kaki / Chino' },
            { value: 'tay', label: 'Quần Tây / Trousers' },
            { value: 'short', label: 'Quần Short Dạo Phố' },
            { value: 'sweatpants', label: 'Quần Nỉ / Sweatpants' }
        ],
        giay: [
            { value: 'all', label: 'Tất cả dòng giày' },
            { value: 'runner', label: 'Dòng Retro Runner' },
            { value: 'high-top', label: 'Dòng High-Top Cổ Cao' },
            { value: 'low-top', label: 'Dòng Low-Top Classic' },
            { value: 'chunky', label: 'Dòng Chunky / Skate' },
            { value: 'slip-on', label: 'Dòng Slip-On / Minimalist' }
        ]
    };

    // Cấp 3: Kiểu dáng chi tiết (Fit / Silhouette)
    const DETAILED_STYLES = {
        ao: {
            'all': [
                { value: 'all', label: 'Tất cả kiểu dáng áo' },
                { value: 'boxy', label: 'Boxy Fit (Cắt ngang thời thượng)' },
                { value: 'oversized', label: 'Oversized (Form rộng phóng khoáng)' },
                { value: 'drop-shoulder', label: 'Drop-Shoulder (Vai trễ Streetwear)' },
                { value: 'regular', label: 'Regular Fit (Vừa vặn tiêu chuẩn)' },
                { value: 'slim', label: 'Slim Fit (Ôm nhẹ tôn dáng)' }
            ],
            'tee': [
                { value: 'all', label: 'Tất cả form áo thun' },
                { value: 'boxy', label: 'Boxy Fit 280-320 GSM' },
                { value: 'oversized', label: 'Oversized Graphic Tee' },
                { value: 'drop-shoulder', label: 'Drop-Shoulder Basic' },
                { value: 'regular', label: 'Regular Fit Cổ Tròn' }
            ],
            'polo': [
                { value: 'all', label: 'Tất cả form polo' },
                { value: 'regular', label: 'Polo Cổ Bẻ Regular Fit' },
                { value: 'oversized', label: 'Polo Boxy Cổ V Retro' },
                { value: 'zip', label: 'Polo Khoá Zip Hiện Đại' }
            ],
            'shirt': [
                { value: 'all', label: 'Tất cả kiểu sơ mi' },
                { value: 'oversized', label: 'Sơ Mi Form Rộng Unisex' },
                { value: 'cuban', label: 'Sơ Mi Cổ V / Cuban Collar' },
                { value: 'denim', label: 'Sơ Mi Denim / Jean' }
            ],
            'hoodie': [
                { value: 'all', label: 'Tất cả kiểu nỉ & hoodie' },
                { value: 'boxy-hoodie', label: 'Hoodie Boxy Mũ Dày 2 Lớp' },
                { value: 'sweater', label: 'Sweater Cổ Tròn Nỉ Chân Cua' },
                { value: 'zip-hoodie', label: 'Zip Hoodie Khoá Kéo Tiện Dụng' }
            ],
            'jacket': [
                { value: 'all', label: 'Tất cả kiểu áo khoác' },
                { value: 'bomber', label: 'Bomber Jacket Lót Gió' },
                { value: 'varsity', label: 'Varsity Jacket Bóng Chày' },
                { value: 'windbreaker', label: 'Áo Gió Chống Nước (Windbreaker)' }
            ]
        },
        quan: {
            'all': [
                { value: 'all', label: 'Tất cả form dáng quần' },
                { value: 'baggy', label: 'Baggy Rộng Thoải Mái' },
                { value: 'wide-leg', label: 'Wide-Leg (Ống Rộng Thời Thượng)' },
                { value: 'straight', label: 'Straight (Ống Suông Thanh Lịch)' },
                { value: 'flare', label: 'Flare (Ống Loe Retro)' },
                { value: 'slim', label: 'Slim Fit (Ống Đứng Vừa Vặn)' }
            ],
            'jean': [
                { value: 'all', label: 'Tất cả form quần jean' },
                { value: 'baggy', label: 'Baggy Denim Cổ Điển' },
                { value: 'wide-leg', label: 'Wide-Leg Jean Ống Rộng' },
                { value: 'straight', label: 'Straight Jean Ống Suông' },
                { value: 'ripped', label: 'Ripped Jean Rách Gối Bụi Bặm' }
            ],
            'cargo': [
                { value: 'all', label: 'Tất cả form cargo' },
                { value: 'wide-leg', label: 'Cargo 6 Túi Ống Rộng' },
                { value: 'parachute', label: 'Parachute Pants Dây Rút Gấu' },
                { value: 'tactical', label: 'Tactical Cargo Khóa Chống Nước' }
            ],
            'kaki': [
                { value: 'all', label: 'Tất cả form kaki' },
                { value: 'straight', label: 'Kaki Ống Suông Basic' },
                { value: 'chino', label: 'Chino Slim Fit Đa Dụng' },
                { value: 'pleated', label: 'Kaki Xếp Ly Tinh Tế' }
            ],
            'tay': [
                { value: 'all', label: 'Tất cả kiểu quần tây' },
                { value: 'wide-leg', label: 'Quần Tây Ống Rộng Xếp Ly Đôi' },
                { value: 'straight', label: 'Quần Tây Ống Suông Công Sở' },
                { value: 'slim', label: 'Quần Tây Slim Tapered Co Giãn' }
            ],
            'short': [
                { value: 'all', label: 'Tất cả kiểu quần short' },
                { value: 'denim-short', label: 'Short Jean Rách Gấu' },
                { value: 'kaki-short', label: 'Short Kaki Trên Gối' },
                { value: 'cargo-short', label: 'Short Cargo Túi Hộp' }
            ],
            'sweatpants': [
                { value: 'all', label: 'Tất cả form quần nỉ' },
                { value: 'baggy-sweat', label: 'Sweatpants Ống Rộng Dây Rút' },
                { value: 'jogger', label: 'Jogger Bo Gấu Năng Động' }
            ]
        },
        giay: {
            'all': [
                { value: 'all', label: 'Tất cả phiên bản giày' },
                { value: 'collab', label: 'Phiên Bản Giới Hạn / Collab' },
                { value: 'leather', label: 'Chất Liệu Da Trơn (Full Leather)' },
                { value: 'suede', label: 'Chất Liệu Da Lộn (Premium Suede)' },
                { value: 'mesh', label: 'Vải Lưới Thoáng Khí (Air Mesh)' }
            ],
            'runner': [
                { value: 'all', label: 'Tất cả mẫu Retro Runner' },
                { value: 'vintage-70s', label: 'Vintage 70s Runner Đế Răng Cưa' },
                { value: 'tech-runner', label: 'Modern Tech Runner Đệm Khí' }
            ],
            'high-top': [
                { value: 'all', label: 'Tất cả mẫu cổ cao' },
                { value: 'basketball', label: 'Retro Basketball Cổ Cao' },
                { value: 'canvas-high', label: 'Canvas High-Top Bền Bỉ' }
            ],
            'low-top': [
                { value: 'all', label: 'Tất cả mẫu cổ thấp' },
                { value: 'court-classic', label: 'Court Classic Trắng Thanh Lịch' },
                { value: 'suede-low', label: 'Suede Low-Top Cá Tính' }
            ],
            'chunky': [
                { value: 'all', label: 'Tất cả mẫu Chunky & Skate' },
                { value: 'dad-shoe', label: 'Dad Shoe Đế Hầm Hố' },
                { value: 'fat-tongue', label: 'Skate Lưỡi Gà Dày Cổ Điển' }
            ],
            'slip-on': [
                { value: 'all', label: 'Tất cả mẫu Slip-on' },
                { value: 'minimal', label: 'Minimalist Da Trơn Không Dây' }
            ]
        }
    };

    // Bảng đối tượng / phân khúc khách hàng
    const AUDIENCES = {
        men: 'Nam (Men)',
        women: 'Nữ (Women)',
        boy: 'Bé Trai (Boys)',
        girls: 'Bé Gái (Girls)'
    };

    // State hiện tại của bộ lọc trang chủ
    let currentAudience = 'men'; // 'men' | 'women' | 'boy' | 'girls'
    let currentMasterCategory = 'ao'; // 'ao' | 'quan' | 'giay'
    let currentSubCategory = 'all';
    let currentDetailedStyle = 'all';
    let currentColor = 'all';
    let currentMaxPrice = 1500000;
    let currentKeyword = '';
    let filteredProductList = [];

    // Cấu hình thanh trượt giá theo danh mục
    const PRICE_CONFIGS = {
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
                    <input type="text" id="homeSearchInput" class="fashion-search-input" placeholder="Tìm tên đồ, chất liệu, họa tiết..." autocomplete="off" spellcheck="false">
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

            <!-- Vùng cuộn chứa các tầng tiêu chí lọc -->
            <div class="fashion-sidebar-scroll">

                <!-- 0. CHỌN ĐỐI TƯỢNG (NAM / NỮ / BÉ TRAI / BÉ GÁI) -->
                <div class="fashion-select-card" id="homeAudienceCard">
                    <label class="fashion-card-label" for="homeAudienceSelect">ĐỐI TƯỢNG</label>
                    <div class="fashion-select-wrapper">
                        <select id="homeAudienceSelect" class="fashion-select-input">
                            <option value="men" selected>Nam (Men's Collection)</option>
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
                            <option value="ao" selected>Áo (Tops Collection)</option>
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
                <h3 class="confirm-title" id="confirmTitle">Chuyển tiếp đến không gian 3D</h3>
                
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
    function getCatalogData(aud = currentAudience) {
        try {
            const el = document.getElementById('showroomCatalog');
            if (!el) return { shirts: [], pants: [], shoes: [] };
            const data = JSON.parse(el.textContent);
            const audience = aud || currentAudience || 'men';
            const shirts = data?.clothing?.[audience]?.ao || [];
            const pants = data?.clothing?.[audience]?.quan || [];
            
            // Giày nằm trong cấu trúc collections
            const shoeCollections = data?.shoes?.[audience] || [];
            const shoes = shoeCollections.flatMap(c => (c.items || []).map(it => ({
                ...it,
                collectionId: c.id,
                collectionTitle: c.title
            })));

            return { shirts, pants, shoes };
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
        const confirmStayBtn = document.getElementById('confirmStayBtn');
        const confirmProceedBtn = document.getElementById('confirmProceedBtn');

        // Populate Sub-Category Select theo Master Category
        function populateSubCategories(cat, preserve = false) {
            const list = SUBCATEGORIES[cat] || [];
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

            // Cập nhật nhãn
            if (cat === 'ao') subCatLabel.textContent = 'PHÂN LOẠI ÁO';
            else if (cat === 'quan') subCatLabel.textContent = 'PHÂN LOẠI QUẦN';
            else subCatLabel.textContent = 'DÒNG GIÀY (SNEAKERS)';

            populateDetailedStyles(cat, currentSubCategory, false);
        }

        // Populate Detailed Styles theo Sub-Category
        function populateDetailedStyles(cat, subCat, preserve = false) {
            const stylesByCat = DETAILED_STYLES[cat] || {};
            const list = stylesByCat[subCat] || stylesByCat['all'] || [];
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
            if (cat === 'ao') detailedStyleLabel.textContent = 'KIỂU DÁNG CHI TIẾT (ÁO)';
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
            let sourceList = [];
            let itemUnit = 'món';

            if (currentMasterCategory === 'ao') {
                sourceList = catalog.shirts;
                itemUnit = 'áo';
            } else if (currentMasterCategory === 'quan') {
                sourceList = catalog.pants;
                itemUnit = 'quần';
            } else {
                sourceList = catalog.shoes;
                itemUnit = 'đôi giày';
            }

            const normalizedKeyword = removeVietnameseTones(currentKeyword.trim());
            const conf = PRICE_CONFIGS[currentMasterCategory] || PRICE_CONFIGS.ao;
            const maxPrice = Number(priceRange.value);

            filteredProductList = sourceList.filter(item => {
                // 1. Phân loại Cấp 2 (Subcategory)
                if (currentSubCategory !== 'all') {
                    const itemType = removeVietnameseTones(item.type || '').toLowerCase();
                    const itemName = removeVietnameseTones(item.name || '').toLowerCase();
                    const itemSlug = (item.slug || '').toLowerCase();
                    const itemCat = (item.category || '').toLowerCase();
                    const itemCollection = (item.collectionTitle || '').toLowerCase();

                    const matchSub = itemType.includes(currentSubCategory) ||
                                     itemName.includes(currentSubCategory) ||
                                     itemSlug.includes(currentSubCategory) ||
                                     itemCat.includes(currentSubCategory) ||
                                     itemCollection.includes(currentSubCategory);

                    if (!matchSub) {
                        // Thử các alias riêng cho áo/quần/giày
                        if (currentMasterCategory === 'ao') {
                            if (currentSubCategory === 'tee' && !(itemType.includes('tee') || itemName.includes('thun') || itemName.includes('tee'))) return false;
                            if (currentSubCategory === 'polo' && !(itemType.includes('polo') || itemName.includes('polo'))) return false;
                            if (currentSubCategory === 'shirt' && !(itemType.includes('shirt') || itemName.includes('so mi'))) return false;
                            if (currentSubCategory === 'hoodie' && !(itemType.includes('hoodie') || itemType.includes('sweater') || itemName.includes('hoodie') || itemName.includes('ni'))) return false;
                            if (currentSubCategory === 'jacket' && !(itemType.includes('jacket') || itemType.includes('bomber') || itemName.includes('khoac'))) return false;
                        } else if (currentMasterCategory === 'quan') {
                            if (currentSubCategory === 'jean' && !(itemType.includes('jean') || itemType.includes('denim') || itemName.includes('jean'))) return false;
                            if (currentSubCategory === 'cargo' && !(itemType.includes('cargo') || itemName.includes('cargo') || itemName.includes('tui hop'))) return false;
                            if (currentSubCategory === 'kaki' && !(itemType.includes('kaki') || itemType.includes('chino') || itemName.includes('kaki'))) return false;
                            if (currentSubCategory === 'tay' && !(itemType.includes('tay') || itemType.includes('trouser') || itemName.includes('tay'))) return false;
                            if (currentSubCategory === 'short' && !(itemType.includes('short') || itemName.includes('short') || itemName.includes('dui'))) return false;
                        }
                    }
                }

                // 2. Kiểu dáng Cấp 3 (Detailed Style)
                if (currentDetailedStyle !== 'all') {
                    const itemText = removeVietnameseTones(`${item.name || ''} ${item.desc || ''} ${item.type || ''}`).toLowerCase();
                    const styleQuery = removeVietnameseTones(currentDetailedStyle).replace(/-/g, ' ');
                    if (!itemText.includes(styleQuery) && !itemText.includes(currentDetailedStyle)) {
                        // Nới lỏng kiểm tra: nếu không khớp tuyệt đối nhưng đúng form
                        const looseCheck = currentDetailedStyle.split('-').some(token => token.length > 2 && itemText.includes(token));
                        if (!looseCheck) return false;
                    }
                }

                // 3. Mức giá
                let itemPriceVND = 0;
                if (currentMasterCategory === 'giay') {
                    itemPriceVND = Number(item.price || 0);
                } else {
                    itemPriceVND = Number(item.price || 0) * 10000;
                }
                if (maxPrice < conf.max && itemPriceVND > maxPrice) {
                    return false;
                }

                // 4. Gam màu
                if (currentColor !== 'all') {
                    const colorKeywords = COLOR_KEYWORDS[currentColor] || [currentColor];
                    let hasColor = false;
                    const combinedInfo = removeVietnameseTones(`${item.name || ''} ${item.desc || ''}`).toLowerCase();

                    // Kiểm tra mảng variants/colors nếu có
                    if (Array.isArray(item.colors)) {
                        for (const col of item.colors) {
                            const cName = removeVietnameseTones(typeof col === 'string' ? col : (col.name || '')).toLowerCase();
                            if (colorKeywords.some(kw => cName.includes(kw))) {
                                hasColor = true;
                                break;
                            }
                        }
                    }

                    if (!hasColor && colorKeywords.some(kw => combinedInfo.includes(kw))) {
                        hasColor = true;
                    }

                    if (!hasColor) return false;
                }

                // 5. Từ khóa tìm kiếm
                if (normalizedKeyword) {
                    const searchCorpus = removeVietnameseTones(`${item.name || ''} ${item.desc || ''} ${item.type || ''} ${item.sku || ''}`).toLowerCase();
                    if (!searchCorpus.includes(normalizedKeyword)) {
                        return false;
                    }
                }

                return true;
            });

            // Cập nhật số lượng trên nút Áp Dụng
            const count = filteredProductList.length;
            if (applyCountBadge) {
                applyCountBadge.textContent = `${count} ${itemUnit}`;
            }

            return count;
        }

        // Chuyển đổi Đối Tượng (Nam / Nữ / Bé Trai / Bé Gái)
        function switchAudience(newAud) {
            if (!['men', 'women', 'boy', 'girls'].includes(newAud)) newAud = 'men';
            currentAudience = newAud;
            if (audienceSelect && audienceSelect.value !== newAud) {
                audienceSelect.value = newAud;
            }
            computeLiveMatches();
        }

        // Chuyển đổi Master Category
        function switchMasterCategory(newCat) {
            currentMasterCategory = newCat;
            if (masterCatSelect) masterCatSelect.value = newCat;

            const titleEl = document.getElementById('homeFilterHeaderTitle');
            if (titleEl) {
                if (newCat === 'ao') titleEl.textContent = 'Bộ Lọc Sào Áo';
                else if (newCat === 'quan') titleEl.textContent = 'Bộ Lọc Sào Quần';
                else titleEl.textContent = 'Bộ Lọc Tủ Giày';
            }

            populateSubCategories(newCat, false);
            updatePriceSliderConfig(newCat);
            computeLiveMatches();
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
        function openConfirmModal() {
            closeDrawer();

            const audLabel = AUDIENCES[currentAudience] || 'Nam';
            let targetTitle = `Sào Áo 3D (${audLabel})`;
            let proceedBtnLabel = `Khám Phá Sào Áo Ngay`;

            if (currentMasterCategory === 'quan') {
                targetTitle = `Sào Quần 3D (${audLabel})`;
                proceedBtnLabel = `Khám Phá Sào Quần Ngay`;
            } else if (currentMasterCategory === 'giay') {
                targetTitle = `Tủ Giày Sneaker Vault (${audLabel})`;
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
                catTag.textContent = currentMasterCategory === 'ao' ? 'Áo' : (currentMasterCategory === 'quan' ? 'Quần' : 'Giày Sneaker');
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

        // Đóng Center Confirm Modal
        function closeConfirmModal() {
            confirmModal.classList.remove('is-open');
            confirmModal.setAttribute('aria-hidden', 'true');
        }

        // Chuyển tiếp không gian khi khách bấm xác nhận
        function proceedToExperience() {
            closeConfirmModal();

            const audLabel = AUDIENCES[currentAudience] || 'Nam';

            // Đóng gói payload bộ lọc để trang đích nhận diện
            const filterPayload = {
                audience: currentAudience,
                category: currentMasterCategory,
                subCategory: currentSubCategory,
                detailedStyle: currentDetailedStyle,
                color: currentColor,
                maxPrice: Number(priceRange.value),
                keyword: currentKeyword,
                filteredProducts: filteredProductList,
                label: `LỌC TỪ TRANG CHỦ (${audLabel} - ${filteredProductList.length} MÓN)`
            };

            const audQuery = `&audience=${encodeURIComponent(currentAudience)}`;

            if (currentMasterCategory === 'ao') {
                sessionStorage.setItem('hnmt_pending_rail_filter', JSON.stringify(filterPayload));
                window.location.href = `/Products/Rail?type=ao${audQuery}`;
            } else if (currentMasterCategory === 'quan') {
                sessionStorage.setItem('hnmt_pending_rail_filter', JSON.stringify(filterPayload));
                window.location.href = `/Products/Rail?type=quan${audQuery}`;
            } else {
                sessionStorage.setItem('hnmt_pending_sneaker_filter', JSON.stringify(filterPayload));
                window.location.href = `/Products/Sneakers?audience=${encodeURIComponent(currentAudience)}`;
            }
        }

        // Đặt lại toàn bộ bộ lọc
        function resetAllFilters() {
            currentAudience = 'men';
            if (audienceSelect) audienceSelect.value = 'men';
            currentSubCategory = 'all';
            currentDetailedStyle = 'all';
            currentColor = 'all';
            currentKeyword = '';
            if (searchInput) searchInput.value = '';
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
            searchInput.addEventListener('input', (e) => {
                currentKeyword = e.target.value;
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = currentKeyword.length > 0 ? 'block' : 'none';
                }
                computeLiveMatches();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                currentKeyword = '';
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                computeLiveMatches();
                searchInput.focus();
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', openConfirmModal);
        }

        // Confirm Modal Buttons
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
        computeLiveMatches();

        // Gắn vào window để gọi từ các nút bấm bên ngoài
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
