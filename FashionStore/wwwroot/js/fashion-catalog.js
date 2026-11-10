/**
 * HNMTSHOP — BỘ DỮ LIỆU ĐA CHIỀU 4 LUỒNG THỜI TRANG (FASHION STREAMS CATALOG)
 * Phân luồng: WOMEN // GIRLS // MEN // BOY
 * Mỗi luồng gồm 3 danh mục tương tác 3D: Áo (Tops) · Quần (Bottoms) · Giày (Footwear)
 * Tên gọi ngắn gọn, tinh tế, sang trọng theo đúng chuẩn gu thiết kế.
 */

(function () {
    'use strict';

    window.HNMT_CURRENT_STREAM = window.HNMT_CURRENT_STREAM || 'Men';

    window.HNMT_FASHION_CATALOG = {
        // =========================================================================
        // LUỒNG 1: WOMEN (THỜI TRANG NỮ)
        // =========================================================================
        Women: {
            title: 'WOMEN COLLECTION',
            subtitle: 'Thời Trang Nữ Thanh Lịch & Tối Giản',
            ao: [
                {
                    id: 'w-top-01',
                    name: 'Linen Blazer',
                    slug: 'women-linen-blazer',
                    price: 680000,
                    type: 'blazer',
                    sizes: ['XS', 'S', 'M', 'L'],
                    defaultSize: 'S',
                    colors: [
                        { name: 'Kem Sữa', hex: '#EBE5D8', image: '/images/products/women/women_linen_blazer.jpg' },
                        { name: 'Đen Mực', hex: '#1C1D21', image: '/images/products/women/women_linen_blazer.jpg' }
                    ],
                    image: '/images/products/women/women_linen_blazer.jpg',
                    description: 'Blazer vải linen pha cotton phom suông nhẹ nhàng, thoáng mát và sang trọng.'
                },
                {
                    id: 'w-top-02',
                    name: 'Silk Cami',
                    slug: 'women-silk-cami',
                    price: 360000,
                    type: 'cami',
                    sizes: ['XS', 'S', 'M'],
                    defaultSize: 'S',
                    colors: [
                        { name: 'Vàng Champagne', hex: '#E8D8B8', image: '/images/products/women/women_silk_cami.jpg' },
                        { name: 'Trắng Ngà', hex: '#FAF7F0', image: '/images/products/women/women_silk_cami.jpg' }
                    ],
                    image: '/images/products/women/women_silk_cami.jpg',
                    description: 'Áo hai dây lụa satin mềm mịn, độ rủ tự nhiên phối hoàn hảo cùng blazer và quần suông.'
                },
                {
                    id: 'w-top-03',
                    name: 'Ribbed Knit',
                    slug: 'women-ribbed-knit',
                    price: 420000,
                    type: 'knit',
                    sizes: ['S', 'M', 'L'],
                    defaultSize: 'M',
                    colors: [
                        { name: 'Hồng Phấn', hex: '#E2B6B9', image: '/images/categories/cat-women.jpg' },
                        { name: 'Trắng Kem', hex: '#F5F5F0', image: '/images/categories/cat-women.jpg' }
                    ],
                    image: '/images/categories/cat-women.jpg',
                    description: 'Áo dệt kim gân cổ thuyền mềm mại, ôm dáng nhẹ nhàng tôn đường nét nữ tính.'
                },
                {
                    id: 'w-top-04',
                    name: 'Minimal Tee',
                    slug: 'women-minimal-tee',
                    price: 290000,
                    type: 'tee',
                    sizes: ['XS', 'S', 'M', 'L'],
                    defaultSize: 'S',
                    colors: [
                        { name: 'Trắng Tinh Khôi', hex: '#FFFFFF', image: '/images/clothing-rail/clothes-3.png' },
                        { name: 'Nâu Cà Phê', hex: '#4A3728', image: '/images/clothing-rail/clothes-3.png' }
                    ],
                    image: '/images/clothing-rail/clothes-3.png',
                    description: 'Tee cotton chải kỹ 100% mềm mịn, thoáng mát thấm hút mồ hôi cho cả ngày.'
                }
            ],
            quan: [
                {
                    id: 'w-bot-01',
                    name: 'Wide Trouser',
                    slug: 'women-wide-trouser',
                    price: 580000,
                    type: 'trouser',
                    sizes: ['XS', 'S', 'M', 'L'],
                    defaultSize: 'M',
                    colors: [
                        { name: 'Cát Sa Mạc', hex: '#D2C2A8', image: '/images/products/women/women_wide_trouser.jpg' },
                        { name: 'Đen Tuyển', hex: '#1B1C20', image: '/images/pants/pleated-sand-beige.png' }
                    ],
                    image: '/images/products/women/women_wide_trouser.jpg',
                    fallbackImage: '/images/pants/pleated-sand-beige.png',
                    description: 'Quần tây ống rộng xếp ly eo cao, tạo hiệu ứng kéo dài chân thanh lịch.'
                },
                {
                    id: 'w-bot-02',
                    name: 'Flared Denim',
                    slug: 'women-flared-denim',
                    price: 520000,
                    type: 'denim',
                    sizes: ['26', '27', '28', '29'],
                    defaultSize: '27',
                    colors: [
                        { name: 'Xanh Vintage', hex: '#4D6B88', image: '/images/pants/wide-leg-denim.png' },
                        { name: 'Xanh Đậm', hex: '#203248', image: '/images/pants/wide-leg-denim.png' }
                    ],
                    image: '/images/pants/wide-leg-denim.png',
                    description: 'Quần jeans loe nhẹ cổ điển chất denim co giãn vừa phải, hack dáng đỉnh cao.'
                },
                {
                    id: 'w-bot-03',
                    name: 'Pleated Pant',
                    slug: 'women-pleated-pant',
                    price: 490000,
                    type: 'pant',
                    sizes: ['S', 'M', 'L'],
                    defaultSize: 'S',
                    colors: [
                        { name: 'Ghi Khói', hex: '#8C8E94', image: '/images/pants/raw-selvedge-black.png' }
                    ],
                    image: '/images/pants/raw-selvedge-black.png',
                    description: 'Quần suông dập ly gấu nhẹ, chất vải tuyết mưa đứng form không nhăn.'
                }
            ],
            giay: [
                {
                    id: 'w-snk-01',
                    model: 'NOVA RUNNER',
                    colorway: 'BLUSH WHITE',
                    themeColor: '#D88A8A',
                    accentColor: '#FFC0CB',
                    price: 4800000,
                    styleCode: 'W-NOV-01',
                    designer: 'HNMTSHOP × NOVA',
                    release: 'SPRING 2027',
                    colorName: 'PURE WHITE / SOFT BLUSH',
                    swatches: ['#FFFFFF', '#D88A8A', '#F5E6CC'],
                    image: '/images/products/women/women_platform_sneaker.jpg',
                    fallbackImage: '/images/sneakers/air-future-iv.webp'
                },
                {
                    id: 'w-snk-02',
                    model: 'SILK TENNIS',
                    colorway: 'IVORY PEARL',
                    themeColor: '#8C7A6B',
                    accentColor: '#C4B5A5',
                    price: 4200000,
                    styleCode: 'W-SLK-02',
                    designer: 'HNMTSHOP × ATELIER',
                    release: 'SUMMER 2027',
                    colorName: 'IVORY / WARM TAUPE',
                    swatches: ['#F7F4EE', '#8C7A6B', '#1E1E24'],
                    image: '/images/products/shoes/nike-air-force-1.png'
                },
                {
                    id: 'w-snk-03',
                    model: 'PLATFORM LOW',
                    colorway: 'CHUNKY BEIGE',
                    themeColor: '#A89278',
                    accentColor: '#E6D3B8',
                    price: 4600000,
                    styleCode: 'W-PLT-03',
                    designer: 'HNMTSHOP × NOVA',
                    release: 'AUTUMN 2027',
                    colorName: 'SAND BEIGE / OFF WHITE',
                    swatches: ['#FFFFFF', '#A89278', '#D7C4B0'],
                    image: '/images/products/shoes/new-balance-550.png'
                }
            ]
        },

        // =========================================================================
        // LUỒNG 2: GIRLS (THỜI TRANG BÉ GÁI)
        // =========================================================================
        Girls: {
            title: 'GIRLS COLLECTION',
            subtitle: 'Thời Trang Bé Gái Ngọt Ngào & Dễ Thương',
            ao: [
                {
                    id: 'g-top-01',
                    name: 'Pastel Knit',
                    slug: 'girls-pastel-knit',
                    price: 320000,
                    type: 'cardigan',
                    sizes: ['4-5T', '6-7T', '8-9T', '10-12T'],
                    defaultSize: '6-7T',
                    colors: [
                        { name: 'Tím Lavender', hex: '#C8A2C8', image: '/images/products/girls/girls_pastel_knit.jpg' },
                        { name: 'Hồng Baby', hex: '#FFB6C1', image: '/images/products/girls/girls_pastel_knit.jpg' }
                    ],
                    image: '/images/products/girls/girls_pastel_knit.jpg',
                    description: 'Cardigan len mịn màu pastel ngọt ngào, chất len mềm không châm chích da bé.'
                },
                {
                    id: 'g-top-02',
                    name: 'Floral Tee',
                    slug: 'girls-floral-tee',
                    price: 220000,
                    type: 'tee',
                    sizes: ['4-5T', '6-7T', '8-9T', '10-12T'],
                    defaultSize: '6-7T',
                    colors: [
                        { name: 'Trắng Hoa Cúc', hex: '#FAF0E6', image: '/images/products/girls/girls_floral_tee.jpg' },
                        { name: 'Vàng Bơ', hex: '#FFF8DC', image: '/images/products/girls/girls_floral_tee.jpg' }
                    ],
                    image: '/images/products/girls/girls_floral_tee.jpg',
                    description: 'Áo thun organic cotton in họa tiết hoa nhí tinh tế, co giãn 4 chiều cho bé tự do vận động.'
                },
                {
                    id: 'g-top-03',
                    name: 'Denim Vest',
                    slug: 'girls-denim-vest',
                    price: 350000,
                    type: 'vest',
                    sizes: ['6-7T', '8-9T', '10-12T'],
                    defaultSize: '8-9T',
                    colors: [
                        { name: 'Xanh Nhạt', hex: '#7BA4C7', image: '/images/categories/cat-girls.jpg' }
                    ],
                    image: '/images/categories/cat-girls.jpg',
                    description: 'Áo gile jeans phong cách phối cùng đầm hoặc áo thun cực kỳ năng động và sành điệu.'
                }
            ],
            quan: [
                {
                    id: 'g-bot-01',
                    name: 'Cargo Jogger',
                    slug: 'girls-cargo-jogger',
                    price: 340000,
                    type: 'jogger',
                    sizes: ['4-5T', '6-7T', '8-9T', '10-12T'],
                    defaultSize: '6-7T',
                    colors: [
                        { name: 'Xanh Xô Thơm', hex: '#9CAF88', image: '/images/products/girls/girls_cargo_jogger.jpg' },
                        { name: 'Be Cát', hex: '#E1D4C0', image: '/images/products/girls/girls_cargo_jogger.jpg' }
                    ],
                    image: '/images/products/girls/girls_cargo_jogger.jpg',
                    fallbackImage: '/images/pants/tactical-olive.png',
                    description: 'Quần túi hộp bo gấu năng động, chất thun cotton dày dặn co giãn thoải mái.'
                },
                {
                    id: 'g-bot-02',
                    name: 'Soft Denim',
                    slug: 'girls-soft-denim',
                    price: 360000,
                    type: 'denim',
                    sizes: ['6-7T', '8-9T', '10-12T'],
                    defaultSize: '8-9T',
                    colors: [
                        { name: 'Xanh Biển Nhạt', hex: '#688EAF', image: '/images/pants/wide-leg-denim.png' }
                    ],
                    image: '/images/pants/wide-leg-denim.png',
                    description: 'Quần jeans mềm lưng thun co giãn, wash nhẹ nhàng êm ái cho bé vận động cả ngày.'
                }
            ],
            giay: [
                {
                    id: 'g-snk-01',
                    model: 'STAR SNEAKER',
                    colorway: 'MINT CANDY',
                    themeColor: '#4CA6A4',
                    accentColor: '#98FF98',
                    price: 1800000,
                    styleCode: 'G-STR-01',
                    designer: 'HNMTSHOP JUNIOR',
                    release: 'SPRING 2027',
                    colorName: 'MINT GREEN / WHITE',
                    swatches: ['#FFFFFF', '#4CA6A4', '#FFB6C1'],
                    image: '/images/products/girls/girls_star_sneaker.jpg',
                    fallbackImage: '/images/sneakers/air-future-iii.webp'
                },
                {
                    id: 'g-snk-02',
                    model: 'PASTEL COURT',
                    colorway: 'LILAC CLOUD',
                    themeColor: '#957DAD',
                    accentColor: '#E0BBE4',
                    price: 1650000,
                    styleCode: 'G-CRT-02',
                    designer: 'HNMTSHOP JUNIOR',
                    release: 'SUMMER 2027',
                    colorName: 'LILAC / SNOW WHITE',
                    swatches: ['#FFFFFF', '#957DAD', '#D291BC'],
                    image: '/images/products/shoes/adidas-forum-low.png'
                },
                {
                    id: 'g-snk-03',
                    model: 'CANDY RUNNER',
                    colorway: 'CORAL PINK',
                    themeColor: '#E06D75',
                    accentColor: '#FF9EAA',
                    price: 1750000,
                    styleCode: 'G-CND-03',
                    designer: 'HNMTSHOP JUNIOR',
                    release: 'AUTUMN 2027',
                    colorName: 'CORAL PINK / ICE BLUE',
                    swatches: ['#FFFFFF', '#E06D75', '#B5E2FA'],
                    image: '/images/products/shoes/converse-chuck-70.png'
                }
            ]
        },

        // =========================================================================
        // LUỒNG 3: MEN (THỜI TRANG NAM)
        // =========================================================================
        Men: {
            title: 'MEN COLLECTION',
            subtitle: 'Thời Trang Nam Streetwear & Độc Bản',
            ao: [
                {
                    id: 'm-top-01',
                    name: 'Reach Shirt',
                    slug: 'reach-shirt',
                    price: 520000,
                    type: 'shirt',
                    sizes: ['XS', 'S', 'M', 'L', 'XL'],
                    defaultSize: 'M',
                    colors: [
                        { name: 'Xanh Rêu Sâu', hex: '#2F4F3E', image: '/images/clothing-rail/clothes-1.png' },
                        { name: 'Nâu Đất Nung', hex: '#8B4A28', image: '/images/clothing-rail/clothes-1.png' }
                    ],
                    image: '/images/clothing-rail/clothes-1.png',
                    description: 'Sơ mi tay ngắn họa tiết Reach độc quyền, vải lụa tơ tằm dệt cao cấp thoáng mát.'
                },
                {
                    id: 'm-top-02',
                    name: 'Boxy Hoodie',
                    slug: 'heavyweight-boxy-hoodie',
                    price: 550000,
                    type: 'hoodie',
                    sizes: ['S', 'M', 'L', 'XL'],
                    defaultSize: 'L',
                    colors: [
                        { name: 'Xám Tro', hex: '#636569', image: '/images/products/clothes/heavyweight-boxy-hoodie.png' },
                        { name: 'Đen Carbon', hex: '#1C1D21', image: '/images/products/clothes/heavyweight-boxy-hoodie.png' }
                    ],
                    image: '/images/products/clothes/heavyweight-boxy-hoodie.png',
                    description: 'Áo hoodie nỉ bông 400gsm form boxy rộng rãi, mũ trùm 2 lớp đứng phom chuẩn streetwear.'
                },
                {
                    id: 'm-top-03',
                    name: 'Fern Tee',
                    slug: 'fern-tee',
                    price: 440000,
                    type: 'tee',
                    sizes: ['XS', 'S', 'M', 'L', 'XL'],
                    defaultSize: 'M',
                    colors: [
                        { name: 'Xanh Chàm Indigo', hex: '#23375B', image: '/images/clothing-rail/clothes-7.png' },
                        { name: 'Nâu Terracotta', hex: '#A85A3C', image: '/images/clothing-rail/clothes-7.png' }
                    ],
                    image: '/images/clothing-rail/clothes-7.png',
                    description: 'Tee in loang Cyanotype dương xỉ hoang dã, cotton 260gsm xử lý enzyme mềm mịn.'
                },
                {
                    id: 'm-top-04',
                    name: 'Varsity Jacket',
                    slug: 'luxury-varsity',
                    price: 890000,
                    type: 'jacket',
                    sizes: ['M', 'L', 'XL'],
                    defaultSize: 'L',
                    colors: [
                        { name: 'Xanh Lá Rừng', hex: '#1C3B2B', image: '/images/products/clothes/varsity-bomber-jacket.png' }
                    ],
                    image: '/images/products/clothes/varsity-bomber-jacket.png',
                    description: 'Áo khoác bóng chày dạ len phối tay da thật cao cấp, thêu nổi tỉ mỉ từng chi tiết.'
                }
            ],
            quan: [
                {
                    id: 'm-bot-01',
                    name: 'Acid Cargo',
                    slug: 'cargo-acid-wash',
                    price: 560000,
                    type: 'cargo',
                    sizes: ['S', 'M', 'L', 'XL'],
                    defaultSize: 'L',
                    colors: [
                        { name: 'Đen Acid Wash', hex: '#2A2C31', image: '/images/pants/cargo-acid-wash.png' }
                    ],
                    image: '/images/pants/cargo-acid-wash.png',
                    description: 'Quần túi hộp hiệu ứng mài loang acid-wash cực bụi bặm, form rộng rãi thoải mái.'
                },
                {
                    id: 'm-bot-02',
                    name: 'Raw Denim',
                    slug: 'raw-selvedge-black',
                    price: 620000,
                    type: 'denim',
                    sizes: ['29', '30', '31', '32', '34'],
                    defaultSize: '31',
                    colors: [
                        { name: 'Đen Mực Thô', hex: '#16171B', image: '/images/pants/raw-selvedge-black.png' }
                    ],
                    image: '/images/pants/raw-selvedge-black.png',
                    description: 'Denim dệt biên Selvedge thô 14oz, giữ dáng đứng phom và phai màu cá nhân hóa theo thời gian.'
                },
                {
                    id: 'm-bot-03',
                    name: 'Pleated Beige',
                    slug: 'pleated-sand-beige',
                    price: 490000,
                    type: 'trousers',
                    sizes: ['S', 'M', 'L', 'XL'],
                    defaultSize: 'M',
                    colors: [
                        { name: 'Be Cát Cổ Điển', hex: '#B8A58D', image: '/images/pants/pleated-sand-beige.png' }
                    ],
                    image: '/images/pants/pleated-sand-beige.png',
                    description: 'Quần âu xếp ly kép ống suông rộng sang trọng, phong cách Parisian Streetwear.'
                },
                {
                    id: 'm-bot-04',
                    name: 'Tactical Olive',
                    slug: 'tactical-olive',
                    price: 540000,
                    type: 'cargo',
                    sizes: ['S', 'M', 'L', 'XL'],
                    defaultSize: 'M',
                    colors: [
                        { name: 'Xanh Rêu Lính', hex: '#3B4834', image: '/images/pants/tactical-olive.png' }
                    ],
                    image: '/images/pants/tactical-olive.png',
                    description: 'Quần túi hộp phong cách Techwear kháng nước nhẹ, dây rút tùy chỉnh gấu quần.'
                }
            ],
            giay: [
                {
                    id: 'm-snk-01',
                    model: 'AIR FUTURE IV',
                    colorway: 'INFRARAY STORM',
                    themeColor: '#CE1234',
                    accentColor: '#FF2A55',
                    price: 5200000,
                    styleCode: 'HFS-04-STORM',
                    designer: 'HNMTSHOP × FUTURE LAB',
                    release: 'DECEMBER 2026',
                    colorName: 'STORM GREY / INFRARED',
                    swatches: ['#FFFFFF', '#CE1234', '#1F2024'],
                    image: '/images/sneakers/air-future-iv.webp'
                },
                {
                    id: 'm-snk-02',
                    model: 'AIR FUTURE XI',
                    colorway: 'HYPER FLUX',
                    themeColor: '#0077D8',
                    accentColor: '#00E5FF',
                    price: 5500000,
                    styleCode: 'HFS-11-FLUX',
                    designer: 'HNMTSHOP × FUTURE LAB',
                    release: 'JANUARY 2027',
                    colorName: 'DEEP BLUE / SONIC BLUE',
                    swatches: ['#FFFFFF', '#0077D8', '#00E5FF'],
                    image: '/images/sneakers/air-future-xi.webp'
                },
                {
                    id: 'm-snk-03',
                    model: 'AIR FUTURE III',
                    colorway: 'NEXUS X1',
                    themeColor: '#4EA819',
                    accentColor: '#8CFF00',
                    price: 4900000,
                    styleCode: 'HFS-03-NEXUS',
                    designer: 'HNMTSHOP × FUTURE LAB',
                    release: 'FEBRUARY 2027',
                    colorName: 'WHITE / ACID VOLT / BLACK',
                    swatches: ['#FFFFFF', '#4EA819', '#15161A'],
                    image: '/images/sneakers/air-future-iii.webp'
                },
                {
                    id: 'm-snk-04',
                    model: 'AIR FUTURE V',
                    colorway: 'LUNAR CHROME',
                    themeColor: '#6D3AA6',
                    accentColor: '#B666FF',
                    price: 5800000,
                    styleCode: 'HFS-05-LUNAR',
                    designer: 'HNMTSHOP × FUTURE LAB',
                    release: 'MARCH 2027',
                    colorName: 'VIOLET CHROME / MIDNIGHT',
                    swatches: ['#6D3AA6', '#B666FF', '#0D0E12'],
                    image: '/images/sneakers/air-future-v.webp'
                },
                {
                    id: 'm-snk-05',
                    model: 'AIR FUTURE I',
                    colorway: 'DUNE PHANTOM',
                    themeColor: '#B9935A',
                    accentColor: '#FFD700',
                    price: 6200000,
                    styleCode: 'HFS-01-DUNE',
                    designer: 'HNMTSHOP × FUTURE LAB',
                    release: 'APRIL 2027',
                    colorName: 'DESERT SAND / GOLD CHROME',
                    swatches: ['#F5E6CC', '#B9935A', '#FFD700'],
                    image: '/images/sneakers/air-future-i.webp'
                },
                {
                    id: 'm-snk-06',
                    model: 'AIR FUTURE IX',
                    colorway: 'VOLT MAGMA',
                    themeColor: '#1A1B20',
                    accentColor: '#FF2A2A',
                    price: 6500000,
                    styleCode: 'HFS-09-MAGMA',
                    designer: 'HNMTSHOP × FUTURE LAB',
                    release: 'MAY 2027',
                    colorName: 'MAGMA RED / CARBON BLACK',
                    swatches: ['#FF2A2A', '#2E3038', '#111215'],
                    image: '/images/sneakers/air-future-ix.webp'
                }
            ]
        },

        // =========================================================================
        // LUỒNG 4: BOY (THỜI TRANG BÉ TRAI)
        // =========================================================================
        Boy: {
            title: 'BOY COLLECTION',
            subtitle: 'Thời Trang Bé Trai Khỏe Khoắn & Năng Động',
            ao: [
                {
                    id: 'b-top-01',
                    name: 'Denim Shirt',
                    slug: 'boy-denim-shirt',
                    price: 360000,
                    type: 'overshirt',
                    sizes: ['4-5T', '6-7T', '8-9T', '10-12T'],
                    defaultSize: '8-9T',
                    colors: [
                        { name: 'Xanh Bò Cổ Điển', hex: '#4A6B8A', image: '/images/products/boy/boy_denim_overshirt.jpg' }
                    ],
                    image: '/images/products/boy/boy_denim_overshirt.jpg',
                    description: 'Sơ mi khoác ngoài denim năng động, phối 2 túi nắp ngực chuẩn phom nhí sành điệu.'
                },
                {
                    id: 'b-top-02',
                    name: 'Varsity Hoodie',
                    slug: 'boy-varsity-hoodie',
                    price: 380000,
                    type: 'hoodie',
                    sizes: ['6-7T', '8-9T', '10-12T'],
                    defaultSize: '8-9T',
                    colors: [
                        { name: 'Xám Tiêu', hex: '#8B8D91', image: '/images/products/boy/boy_college_hoodie.jpg' },
                        { name: 'Xanh Navy', hex: '#1B2A4A', image: '/images/products/boy/boy_college_hoodie.jpg' }
                    ],
                    image: '/images/products/boy/boy_college_hoodie.jpg',
                    description: 'Hoodie nỉ bông ấm áp phối thêu chữ thể thao phong cách học đường.'
                },
                {
                    id: 'b-top-03',
                    name: 'Skater Tee',
                    slug: 'boy-skater-tee',
                    price: 240000,
                    type: 'tee',
                    sizes: ['4-5T', '6-7T', '8-9T', '10-12T'],
                    defaultSize: '6-7T',
                    colors: [
                        { name: 'Trắng Sạch', hex: '#FFFFFF', image: '/images/categories/cat-boy.jpg' }
                    ],
                    image: '/images/categories/cat-boy.jpg',
                    description: 'Tee cotton thoáng khí, thấm hút mồ hôi tối đa cho bé chạy nhảy suốt ngày dài.'
                }
            ],
            quan: [
                {
                    id: 'b-bot-01',
                    name: 'Relaxed Jeans',
                    slug: 'boy-relaxed-jeans',
                    price: 380000,
                    type: 'denim',
                    sizes: ['4-5T', '6-7T', '8-9T', '10-12T'],
                    defaultSize: '8-9T',
                    colors: [
                        { name: 'Xanh Rửa Sáng', hex: '#5B7E9F', image: '/images/products/boy/boy_relaxed_jeans.jpg' }
                    ],
                    image: '/images/products/boy/boy_relaxed_jeans.jpg',
                    fallbackImage: '/images/pants/wide-leg-denim.png',
                    description: 'Quần jeans phom suông rộng thoải mái có chun tăng đơ chỉnh eo linh hoạt.'
                },
                {
                    id: 'b-bot-02',
                    name: 'Double Knee',
                    slug: 'boy-double-knee',
                    price: 360000,
                    type: 'cargo',
                    sizes: ['6-7T', '8-9T', '10-12T'],
                    defaultSize: '8-9T',
                    colors: [
                        { name: 'Nâu Kaki Thợ Máy', hex: '#8C6F4B', image: '/images/pants/tactical-olive.png' }
                    ],
                    image: '/images/pants/tactical-olive.png',
                    description: 'Quần túi hộp may táp gối đôi chống mài mòn, cực bền bỉ cho bé trai năng động.'
                }
            ],
            giay: [
                {
                    id: 'b-snk-01',
                    model: 'SKATER HIGH',
                    colorway: 'VULCAN BLACK',
                    themeColor: '#2B2C30',
                    accentColor: '#FF6B6B',
                    price: 1900000,
                    styleCode: 'B-SKT-01',
                    designer: 'HNMTSHOP JUNIOR',
                    release: 'SPRING 2027',
                    colorName: 'CORE BLACK / WHITE',
                    swatches: ['#1C1D21', '#FFFFFF', '#FF3B30'],
                    image: '/images/products/boy/boy_skater_sneaker.jpg',
                    fallbackImage: '/images/products/shoes/rick-owens-geobasket.png'
                },
                {
                    id: 'b-snk-02',
                    model: 'RETRO DUNKS',
                    colorway: 'ROYAL BLUE',
                    themeColor: '#1A4C8C',
                    accentColor: '#3B82F6',
                    price: 2100000,
                    styleCode: 'B-DNK-02',
                    designer: 'HNMTSHOP JUNIOR',
                    release: 'SUMMER 2027',
                    colorName: 'ROYAL BLUE / PURE WHITE',
                    swatches: ['#FFFFFF', '#1A4C8C', '#22252A'],
                    image: '/images/products/shoes/nike-dunk-low-retro.png'
                },
                {
                    id: 'b-snk-03',
                    model: 'SPEED RUNNER',
                    colorway: 'NEON BLAST',
                    themeColor: '#2C3E50',
                    accentColor: '#00E676',
                    price: 1850000,
                    styleCode: 'B-SPD-03',
                    designer: 'HNMTSHOP JUNIOR',
                    release: 'AUTUMN 2027',
                    colorName: 'STEALTH GREY / NEON GREEN',
                    swatches: ['#34495E', '#00E676', '#ECF0F1'],
                    image: '/images/products/shoes/air-jordan-1-retro.png'
                }
            ]
        }
    };

    // Hàm lấy danh sách theo Luồng & Danh mục
    window.getFashionStreamItems = function (stream, category) {
        const streamData = window.HNMT_FASHION_CATALOG[stream] || window.HNMT_FASHION_CATALOG['Men'];
        if (!category) return streamData;
        return streamData[category] || [];
    };

})();
