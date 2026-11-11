/**
 * ==============================================================================
 * HNMTSHOP - CLOTHING RAIL CATALOG INTERACTIVE ENGINE
 * Sào Treo Đồ Thời Trang Độc Bản: Quần (Pants) & Áo (Shirts)
 * Tích hợp bộ lọc đa tiêu chí trực tiếp lên sào & phân trang sào tự động (> 10 sản phẩm)
 * ==============================================================================
 */
(() => {
    'use strict';

    // ==========================================================================
    // 1. MASTER CATALOG: ÁO (SHIRTS & TOPS) - 15 MẪU ĐỘC BẢN
    // ==========================================================================
    const ALL_SHIRT_PRODUCTS = [
        {
            name: 'Reach Shirt',
            slug: 'reach-shirt',
            price: 68,
            type: 'sơ mi camp-collar',
            style: 'shirt',
            colorGroup: 'white',
            art: 'hand',
            desc: 'Thiết kế camp-collar phóng khoáng cùng họa tiết bàn tay vẽ tay nghệ thuật độc bản.',
            colors: [['Trắng Ngà (White)', '#f8f7f3', '#16171b'], ['Đen Huyền Bí (Black)', '#202125', '#efebda']],
            stock: [9, 8, 6, 5, 2]
        },
        {
            name: 'Scrawl Tee',
            slug: 'scrawl-tee',
            price: 42,
            type: 'áo thun oversized',
            style: 'tee',
            colorGroup: 'black',
            art: 'scrawl',
            desc: 'Cotton định lượng cao dáng oversized với những nét cọ ngẫu hứng trừu tượng sống động.',
            colors: [['Đen & Cam (Black & Orange)', '#1a1b1e', '#ff671f'], ['Trắng Phấn & Xanh Cobalt', '#f2f0e9', '#2456ba']],
            stock: [6, 6, 5, 2, 0]
        },
        {
            name: 'Blend In Tee',
            slug: 'blend-in-tee',
            price: 38,
            type: 'áo thun graphic',
            style: 'tee',
            colorGroup: 'white',
            art: 'blend',
            desc: 'Không sinh ra để hòa tan — Tuyên ngôn thời trang phá cách đậm chất cá tính.',
            colors: [['Kem Tự Nhiên (Cream)', '#efeadb', '#c43236'], ['Đen Đỏ Rực (Black & Red)', '#18191c', '#da353b']],
            stock: [8, 6, 4, 2, 0]
        },
        {
            name: 'Two Faces Tee',
            slug: 'two-faces-tee',
            price: 42,
            type: 'áo thun vintage',
            style: 'tee',
            colorGroup: 'gray',
            art: 'faces',
            desc: 'Nghệ thuật vẽ nét liền continuous-line tinh tế trên nền cotton washed phong cách vintage.',
            colors: [['Xám Tro Vintage (Washed Charcoal)', '#5c5b5c', '#edece5'], ['Nâu Cát Sang Trọng (Sand)', '#ccbba0', '#33353c']],
            stock: [10, 8, 5, 3, 1]
        },
        {
            name: 'Unbothered Tee',
            slug: 'unbothered-tee',
            price: 40,
            type: 'áo thun dạo phố',
            style: 'tee',
            colorGroup: 'green',
            art: 'unbothered',
            desc: 'Một chút tự do, một chút phóng khoáng, nổi bật đầy tự tin giữa đám đông.',
            colors: [['Xanh Rừng Sâu (Forest Green)', '#24483b', '#f0e4bf'], ['Rượu Vang Đỏ (Burgundy)', '#652f42', '#f4dfbe']],
            stock: [7, 5, 4, 3, 2]
        },
        {
            name: 'Ink Drip Shirt',
            slug: 'ink-drip-shirt',
            price: 72,
            type: 'sơ mi họa tiết',
            style: 'shirt',
            colorGroup: 'green',
            art: 'ink',
            desc: 'Nét cọ loang mực nghệ thuật lan tỏa trên phom dáng sơ mi relaxed thoải mái và hiện đại.',
            colors: [['Xanh Rêu Ô-liu (Olive)', '#757a49', '#202125'], ['Trắng Ngà Nét Xanh Navy (Ecru)', '#e5dcc9', '#28345a']],
            stock: [7, 6, 3, 2, 0]
        },
        {
            name: 'Fern Tee',
            slug: 'fern-tee',
            price: 44,
            type: 'áo thun in thực vật',
            style: 'tee',
            colorGroup: 'blue',
            art: 'fern',
            desc: 'Kỹ thuật in cyanotype thực vật độc đáo kết hợp cùng chất liệu cotton cao cấp đường phố.',
            colors: [['Xanh Đậm Hoàng Gia (Prussian Blue)', '#153e78', '#f1f0e7'], ['Đỏ Đất Nung (Rust Terracotta)', '#aa6244', '#eee3c8']],
            stock: [10, 8, 6, 3, 1]
        },
        {
            name: 'Holding On Crew',
            slug: 'holding-on-crew',
            price: 78,
            type: 'áo nỉ crewneck',
            style: 'hoodie',
            colorGroup: 'black',
            art: 'hands',
            desc: 'Áo nỉ fleece dệt dày dặn, đường nét thêu xích thủ công chain-stitch tinh xảo.',
            colors: [['Đen Tối Giản (Black)', '#222326', '#e9e4d4'], ['Xám Tiêu Thêu Đen (Grey Marl)', '#b5b3b0', '#27282d']],
            stock: [5, 4, 3, 2, 0]
        },
        {
            name: 'Cloud Nine Tee',
            slug: 'cloud-nine-tee',
            price: 46,
            type: 'áo thun cotton lụa',
            style: 'tee',
            colorGroup: 'blue',
            art: 'cloud',
            desc: 'Cảm hứng bồng bềnh tựa mây trời, chất vải mềm mượt thoáng khí tối đa.',
            colors: [['Xanh Da Trời (Sky Blue)', '#88b8d8', '#fafafa'], ['Tím Hoa Cà Pastel (Lilac)', '#bdb3dd', '#ffffff']],
            stock: [10, 9, 5, 4, 2]
        },
        {
            name: 'One of One Tee',
            slug: 'one-of-one-tee',
            price: 40,
            type: 'áo thun độc bản',
            style: 'tee',
            colorGroup: 'gray',
            art: 'fingerprint',
            desc: 'Dấu ấn độc bản của riêng bạn — Độc nhất, không trùng lặp.',
            colors: [['Xám Đá Tự Nhiên (Stone)', '#c1b5a2', '#222326'], ['Đen Điểm Xanh Neon (Acid Lime)', '#222326', '#bbdc37']],
            stock: [8, 7, 5, 4, 2]
        },
        {
            name: 'CYBERPUNK Heavyweight Boxy Tee (300GSM)',
            slug: 'cyber-boxy-tee',
            price: 48,
            type: 'áo thun boxy vai trễ',
            style: 'tee',
            colorGroup: 'black',
            art: 'cyber',
            desc: 'Áo thun phom Boxy vai trễ dày dặn 300GSM với đồ họa viễn tưởng Cyberpunk Neon phản quang sắc nét.',
            colors: [['Washed Than Chì (Vintage Charcoal)', '#1f1f21', '#00f0ff'], ['Xám Bạc (Silver Smoke)', '#38393d', '#a3e635']],
            stock: [12, 15, 10, 6, 2]
        },
        {
            name: 'HNMT Luxury Wool & Leather Varsity Jacket',
            slug: 'luxury-varsity',
            price: 89,
            type: 'áo khoác varsity bóng chày',
            style: 'jacket',
            colorGroup: 'blue',
            art: 'varsity',
            desc: 'Áo khoác bóng chày thân dạ len cừu phối tay da thật cao cấp, thêu xù Chenille logo HNMT STUDIO.',
            colors: [['Xanh Navy & Kem (Navy / Cream)', '#121d33', '#f2efe9'], ['Đen Huyền Bí & Trắng (Black / White)', '#111214', '#ffffff']],
            stock: [5, 8, 6, 3, 0]
        },
        {
            name: 'OVERDRIVE Vintage Motorsport Leather Jacket',
            slug: 'racing-moto',
            price: 95,
            type: 'áo khoác da moto',
            style: 'jacket',
            colorGroup: 'black',
            art: 'racing',
            desc: 'Áo khoác da đua xe thể thao cổ điển phối 3 mảng màu Tricolor Đen - Kem - Đỏ cùng huy hiệu HNMT GRAND PRIX.',
            colors: [['Tricolor Race (Đen - Kem - Đỏ)', '#18181b', '#e61922'], ['Stealth Dark (All Black)', '#0a0a0c', '#888888']],
            stock: [4, 6, 5, 2, 0]
        },
        {
            name: 'CYBER-VOID Heavy Fleece Street Hoodie',
            slug: 'cyber-hoodie',
            price: 76,
            type: 'áo nỉ hoodie mũ trùm',
            style: 'hoodie',
            colorGroup: 'black',
            art: 'cyber',
            desc: 'Hoodie phom rộng nỉ chân cua định lượng 450GSM cản gió ấm áp cùng nón 2 lớp đứng phom chuẩn streetwear.',
            colors: [['Đen Tím Cyber (Void Purple)', '#15131e', '#a855f7'], ['Đen Tuyền (Stealth Onyx)', '#0e0e11', '#ffffff']],
            stock: [8, 10, 7, 4, 1],
            frontImg: '/clothing-rail/assets/cyber-hoodie-front.webp',
            sideImg: '/clothing-rail/assets/cyber-hoodie-side.webp'
        },
        {
            name: 'Tactical Safari Utility Cargo Shirt',
            slug: 'cargo-shirt',
            price: 65,
            type: 'sơ mi túi hộp utility',
            style: 'shirt',
            colorGroup: 'green',
            art: 'utility',
            desc: 'Sơ mi khoác ngoài vải kaki chéo bền bỉ với 4 ngăn túi hộp đa năng, khóa bấm dập logo kim loại chống rỉ.',
            colors: [['Xanh Rêu Safari (Olive Drab)', '#485338', '#1a1f16'], ['Xám Đá Bụi (Slate Grey)', '#3c4046', '#e0e0e0']],
            stock: [9, 7, 5, 3, 0],
            frontImg: '/clothing-rail/assets/cargo-shirt-front.webp',
            sideImg: '/clothing-rail/assets/cargo-shirt-side.webp'
        }
    ];

    // ==========================================================================
    // 2. MASTER CATALOG: QUẦN (PANTS) - 12 MẪU ĐỘC BẢN
    // ==========================================================================
    const ALL_PANTS_PRODUCTS = [
        {
            name: 'Quần Baggy Cargo Jeans Acid-Wash Đen Xám',
            slug: 'acid-cargo',
            price: 56,
            type: 'quần cargo jeans',
            style: 'cargo',
            colorGroup: 'gray',
            art: 'cargo',
            desc: 'Quần jeans túi hộp phom thụng rộng, wash mài xám khói bụi bặm phong cách Y2K và streetwear đương đại.',
            colors: [['Washed Xám Đen (Vintage Charcoal)', '#25262B'], ['Xám Bạc (Silver Wash)', '#42454F']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [8, 12, 15, 10, 6, 3],
            frontImg: '/clothing-rail/assets/acid-cargo-front.webp',
            sideImg: '/clothing-rail/assets/acid-cargo-side.webp'
        },
        {
            name: 'Quần Tây Xếp Ly Ống Rộng May Đo Sand Beige',
            slug: 'sand-pleated',
            price: 62,
            type: 'quần tây may đo',
            style: 'tay',
            colorGroup: 'white',
            art: 'tailored',
            desc: 'Phom dáng xếp 2 ly cạp cao may đo tinh xảo, chất vải twill rủ mềm mại tạo bước đi thanh thoát chuẩn quiet luxury.',
            colors: [['Be Cát Tự Nhiên (Sand Beige)', '#D9CDB8'], ['Đen Midnight (Pitch Black)', '#17181C']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [6, 9, 14, 11, 5, 2],
            frontImg: '/clothing-rail/assets/sand-pleated-front.webp',
            sideImg: '/clothing-rail/assets/sand-pleated-side.webp'
        },
        {
            name: 'Quần Dù Parachute Tactical Rêu Quân Đội',
            slug: 'tactical-parachute',
            price: 58,
            type: 'quần dù parachute',
            style: 'parachute',
            colorGroup: 'green',
            art: 'parachute',
            desc: 'Chất liệu vải dù công nghệ trượt nước nhẹ, nhiều ngăn túi khóa bấm kim loại cùng dây rút lai quần biến hóa linh hoạt.',
            colors: [['Xanh Rêu Quân Đội (Military Olive)', '#4B5320'], ['Đen Stealth (Shadow Black)', '#1B1C20']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [10, 14, 12, 8, 4, 1],
            frontImg: '/clothing-rail/assets/tactical-parachute-front.webp',
            sideImg: '/clothing-rail/assets/tactical-parachute-side.webp'
        },
        {
            name: 'Quần Jeans Ống Suông Raw Selvedge Denim',
            slug: 'raw-selvedge',
            price: 68,
            type: 'quần raw denim',
            style: 'jeans',
            colorGroup: 'black',
            art: 'denim',
            desc: 'Denim 14oz dệt thoi con thoi cổ điển Nhật Bản, giữ phom đứng cá tính cùng viền chỉ đỏ selvedge độc bản khi xắn gấu.',
            colors: [['Đen Selvedge Chỉ Đỏ (Raw Black)', '#1A1A1E'], ['Chàm Đậm (Deep Indigo)', '#141E30']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [5, 7, 10, 8, 4, 0],
            frontImg: '/clothing-rail/assets/raw-selvedge-front.webp',
            sideImg: '/clothing-rail/assets/raw-selvedge-side.webp'
        },
        {
            name: 'Quần Jeans Ống Rộng Vintage Washed Indigo',
            slug: 'wide-denim',
            price: 54,
            type: 'quần jeans ống rộng',
            style: 'jeans',
            colorGroup: 'blue',
            art: 'denim',
            desc: 'Phom suông rộng phóng khoáng kinh điển thập niên 90, xử lý wash nhẹ tạo độ rủ mềm mại cực kỳ thoải mái vận động.',
            colors: [['Xanh Vintage Washed (90s Blue)', '#5B7C99'], ['Xanh Khói (Smoky Azure)', '#4A657D']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [9, 11, 16, 12, 7, 3],
            frontImg: '/clothing-rail/assets/wide-denim-front.webp',
            sideImg: '/clothing-rail/assets/wide-denim-side.webp'
        },
        {
            name: 'Quần Tây May Đo Cạp Cao Đen Midnight Sartorial',
            slug: 'tailored-black',
            price: 65,
            type: 'quần tây may đo',
            style: 'tay',
            colorGroup: 'black',
            art: 'tailored',
            desc: 'Thiết kế cạp cao side-adjuster không đỉa lưng lịch lãm phong cách Sartorial, phom đứng chuẩn chỉnh tôn dáng tối đa.',
            colors: [['Đen Midnight (Pitch Black)', '#17181C'], ['Than Chì (Charcoal)', '#28292E']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [7, 10, 12, 9, 4, 2],
            frontImg: '/clothing-rail/assets/sand-pleated-front.webp',
            sideImg: '/clothing-rail/assets/sand-pleated-side.webp'
        },
        {
            name: 'Quần Cargo 8 Túi Streetwear Rêu Khói Urban',
            slug: 'cargo-olive',
            price: 59,
            type: 'quần cargo túi hộp',
            style: 'cargo',
            colorGroup: 'green',
            art: 'cargo',
            desc: 'Thiết kế túi hộp bất đối xứng cá tính, chất kaki washed chống sờn cùng dây kéo phụ trợ đậm chất Techwear thành thị.',
            colors: [['Xanh Rêu Khói (Faded Olive)', '#4A523A'], ['Đen Bụi (Dusty Onyx)', '#1E1F22']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [8, 12, 14, 9, 5, 1],
            frontImg: '/clothing-rail/assets/tactical-parachute-front.webp',
            sideImg: '/clothing-rail/assets/tactical-parachute-side.webp'
        },
        {
            name: 'Quần Dù Parachute Dây Rút Gấu Đen Stealth City',
            slug: 'parachute-black',
            price: 49,
            type: 'quần dù parachute',
            style: 'parachute',
            colorGroup: 'black',
            art: 'parachute',
            desc: 'Trọng lượng siêu nhẹ thoáng khí, dây rút bóp gấu biến đổi linh hoạt từ ống suông sang phom jogger năng động.',
            colors: [['Đen Stealth (Shadow Black)', '#16171A'], ['Trắng Băng (Ice White)', '#E5E7EB']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [11, 15, 18, 13, 6, 2],
            frontImg: '/clothing-rail/assets/tactical-parachute-front.webp',
            sideImg: '/clothing-rail/assets/tactical-parachute-side.webp'
        },
        {
            name: 'Quần Jeans Raw Denim 14oz Chàm Cổ Điển Tokyo',
            slug: 'selvedge-indigo',
            price: 74,
            type: 'quần raw denim',
            style: 'jeans',
            colorGroup: 'blue',
            art: 'denim',
            desc: 'Dòng vải raw mộc nguyên bản giữ nếp tạo fade tự nhiên theo từng bước chuyển động của chủ nhân sau thời gian sử dụng.',
            colors: [['Chàm Đậm (Deep Indigo)', '#141E30'], ['Xanh Mực Sẫm (Dark Navy)', '#101726']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [5, 8, 10, 7, 3, 0],
            frontImg: '/clothing-rail/assets/raw-selvedge-front.webp',
            sideImg: '/clothing-rail/assets/raw-selvedge-side.webp'
        },
        {
            name: 'Quần Tây Ống Suông Xếp Ly Xám Khói Minimalist',
            slug: 'pleated-grey',
            price: 64,
            type: 'quần tây may đo',
            style: 'tay',
            colorGroup: 'gray',
            art: 'tailored',
            desc: 'Gam xám khói trung tính dễ phối đồ, ly xếp sâu tạo độ phồng tự nhiên thanh lịch khi kết hợp cùng áo thun hoặc sơ mi.',
            colors: [['Xám Khói (Smoky Grey)', '#4A4C54'], ['Be Sữa (Alabaster)', '#DDD7CD']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [6, 9, 13, 10, 4, 1],
            frontImg: '/clothing-rail/assets/sand-pleated-front.webp',
            sideImg: '/clothing-rail/assets/sand-pleated-side.webp'
        },
        {
            name: 'Quần Jeans Baggy Acid-Wash Xám Bạc Skater Y2K',
            slug: 'acid-skater',
            price: 58,
            type: 'quần jeans ống rộng',
            style: 'jeans',
            colorGroup: 'gray',
            art: 'denim',
            desc: 'Phom baggy thụng skater thập niên 2000, hiệu ứng tẩy acid bạc khói phủ bụi phong trần đầy cuốn hút.',
            colors: [['Xám Bạc (Silver Wash)', '#474A55'], ['Đen Rửa (Washed Black)', '#232427']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [8, 11, 15, 9, 5, 2],
            frontImg: '/clothing-rail/assets/acid-cargo-front.webp',
            sideImg: '/clothing-rail/assets/acid-cargo-side.webp'
        },
        {
            name: 'Quần Chino May Đo Co Giãn Màu Kem Trắng Ivory',
            slug: 'chino-cream',
            price: 47,
            type: 'quần tây may đo',
            style: 'tay',
            colorGroup: 'white',
            art: 'tailored',
            desc: 'Chất cotton dệt chéo co giãn 4 chiều nhẹ nhàng, thoải mái suốt ngày dài cho phong cách smart-casual hiện đại.',
            colors: [['Kem Trắng (Ivory Cream)', '#F4EFE6'], ['Xanh Navy Cổ Điển', '#1A2436']],
            sizes: ['28', '29', '30', '31', '32', '34'],
            stock: [10, 14, 16, 12, 6, 2],
            frontImg: '/clothing-rail/assets/sand-pleated-front.webp',
            sideImg: '/clothing-rail/assets/sand-pleated-side.webp'
        }
    ];

    // ==========================================================================
    // 3. THUẬT TOÁN CHIA SÀO TỰ ĐỘNG (RACK SHARDING // TỐI ĐA 10 MẪU / SÀO)
    // ==========================================================================
    function chunkProductsIntoRacks(productList, category, isFilterResult = false, filterLabel = '') {
        if (!productList || productList.length === 0) return [];
        const racks = [];
        const totalRacks = Math.ceil(productList.length / 10);
        const catName = (category === 'quan') ? 'BỘ SƯU TẬP QUẦN' : 'BỘ SƯU TẬP ÁO';
        const brandSig = '<span>Sào Đồ</span><span>Thời Trang</span>';
        
        for (let i = 0; i < productList.length; i += 10) {
            const rackIndex = Math.floor(i / 10) + 1;
            const slice = productList.slice(i, i + 10);
            
            let badge;
            if (isFilterResult) {
                badge = `SÀO ${rackIndex}/${totalRacks} // KẾT QUẢ TÌM KIẾM`;
            } else if (category === 'quan') {
                badge = (rackIndex === 1) ? 'SÀO 01 // ESSENTIAL PANTS' : 'SÀO 02 // TAILORED & CARGO DROP';
            } else {
                badge = (rackIndex === 1) ? 'SÀO 01 // ESSENTIAL STREETWEAR' : 'SÀO 02 // WINTER DROP';
            }

            let capHead;
            if (isFilterResult) {
                capHead = `Tìm thấy ${productList.length} sản phẩm phù hợp.`;
            } else if (category === 'quan') {
                capHead = 'Bộ sưu tập quần cao cấp HNMTSHOP.';
            } else {
                capHead = 'Bộ sưu tập áo HNMTSHOP.';
            }

            let capDetail;
            if (isFilterResult) {
                capDetail = filterLabel ? `Bộ lọc: ${filterLabel} — Lướt sào hoặc chọn đồ xem chi tiết.` : 'Lướt sào hoặc chọn đồ xem chi tiết.';
            } else if (totalRacks > 1) {
                capDetail = `Sào ${rackIndex}/${totalRacks} (${slice.length} mẫu) — Bấm mũi tên để xem sào tiếp theo.`;
            } else {
                capDetail = `${slice.length} thiết kế giới hạn — Lướt sào hoặc chọn đồ xem chi tiết.`;
            }

            racks.push({
                id: `rack-${category}-${isFilterResult ? 'filter-' : ''}${rackIndex}`,
                badge: badge,
                eyebrow: catName,
                heroTitle: 'Thời Trang Độc Bản · Nâng Tầm Phong Cách',
                brandSignature: brandSig,
                captionHeading: capHead,
                captionDetail: capDetail,
                products: slice
            });
        }
        return racks;
    }

    const DEFAULT_SHIRT_RACKS = chunkProductsIntoRacks(ALL_SHIRT_PRODUCTS, 'ao', false);
    const DEFAULT_PANTS_RACKS = chunkProductsIntoRacks(ALL_PANTS_PRODUCTS, 'quan', false);

    // Trạng thái hiện tại của sào
    let currentCategory = 'ao'; // 'ao' or 'quan'
    let currentRacks = DEFAULT_SHIRT_RACKS;
    let currentRackIdx = 0;
    let products = currentRacks[0].products;
    let isFiltered = false;
    let activeFilterLabel = '';

    const photo = (p, variant = 0) => (p.frontImg ? `${p.frontImg}?v=pants_v4` : `/clothing-rail/assets/${p.slug}-${variant ? 'alt' : 'front'}.webp?v=pants_v4`);
    const sidePhoto = p => (p.sideImg ? `${p.sideImg}?v=pants_v4` : `/clothing-rail/assets/${p.slug}-side.webp?v=pants_v4`);

    function formatPrice(num) {
        return (num * 10000).toLocaleString('vi-VN') + ' ₫';
    }

    const $ = s => document.querySelector(s);
    let active = -1;
    let current = 0;
    let selectedSize = '';
    let bag = 0;
    let detailOpen = false;
    let modalOpen = false;
    const sizeNames = ['XS', 'S', 'M', 'L', 'XL'];

    // Đảm bảo nút kính lúp tìm kiếm luôn hiện diện ở Header sào
    function ensureSearchButton() {
        const bagBtns = document.querySelectorAll('.rail-bag-btn');
        bagBtns.forEach(bagBtn => {
            if (bagBtn.parentNode && !bagBtn.parentNode.querySelector('.rail-search-btn')) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'rail-search-btn';
                btn.id = 'railSearchBtn';
                btn.setAttribute('aria-label', 'Tìm kiếm đồ');
                btn.title = 'Tìm đồ nhanh (Phím tắt / hoặc Ctrl+K)';
                btn.innerHTML = `
                    <svg fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7"/>
                        <path d="m20 20-4.35-4.35"/>
                    </svg>
                `;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.HNMTSpotlightSearch) {
                        window.HNMTSpotlightSearch.open(currentCategory);
                    }
                });
                bagBtn.parentNode.insertBefore(btn, bagBtn);
            }
        });

        if (!window.HNMTSpotlightSearch && !document.querySelector('script[src*="spotlight-search.js"]')) {
            const s = document.createElement('script');
            s.src = '/js/spotlight-search.js?v=inject_v3';
            document.head.appendChild(s);
        }
    }

    // Hiển thị thanh thông báo bộ lọc đang áp dụng trên Sào
    function renderActiveFilterBanner(filterInfo, count) {
        let banner = document.getElementById('railActiveFilterBanner');
        if (!filterInfo || count === null) {
            if (banner) banner.remove();
            return;
        }

        const introEl = document.querySelector('.rail-intro');
        if (!introEl) return;

        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'railActiveFilterBanner';
            banner.className = 'rail-active-filter-banner';
            introEl.appendChild(banner);
        }

        banner.innerHTML = `
            <div class="rail-filter-pill-info">
                <span class="rail-filter-pulse"></span>
                <span class="rail-filter-text">Đang lọc: <strong>${filterInfo}</strong> (${count} sản phẩm)</span>
            </div>
            <button type="button" class="rail-filter-reset-btn" id="railBannerResetBtn" title="Bỏ lọc và xem tất cả đồ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>Bỏ lọc / Hiện tất cả</span>
            </button>
        `;

        const resetBtn = banner.querySelector('#railBannerResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetFilter();
            });
        }
    }

    // Dựng các móc treo đồ trên sào
    function makeRail() {
        ensureSearchButton();
        const stage = $('#railStage');
        if (!stage) return;
        stage.querySelectorAll('.slot').forEach(e => e.remove());
        const emptyBox = stage.querySelector('.rail-empty-results-box');
        if (emptyBox) emptyBox.remove();

        products.forEach((p, i) => {
            const b = document.createElement('button');
            b.className = 'slot';
            b.type = 'button';
            b.setAttribute('aria-label', `Xem ${p.name}, ${formatPrice(p.price)}`);
            b.dataset.idx = i;
            b.innerHTML = `
                <div class="garment-assembly" style="--delay:${i * 70}ms">
                    <div class="garment-turn">
                        <img class="face front" alt="${p.name}" draggable="false" loading="eager" decoding="async" src="${photo(p, 0)}">
                        <img class="face side" alt="" draggable="false" loading="eager" decoding="async" src="${sidePhoto(p)}">
                    </div>
                </div>`;

            b.addEventListener('mouseenter', () => !detailOpen && setActive(i));
            b.addEventListener('focus', () => !detailOpen && setActive(i));
            b.addEventListener('click', () => openDetail(i));
            stage.append(b);
        });

        setTimeout(() => {
            document.querySelectorAll('.garment-assembly').forEach(e => e.classList.add('settle'));
        }, 1800);
    }

    function setActive(i) {
        if (products.length === 0) return;
        if (active === i) return;
        active = i;
        document.querySelectorAll('.slot').forEach((s, n) => s.classList.toggle('active', n === i));

        const p = products[i];
        if (!p) return;
        const titleEl = $('#captionTitle');
        const detailEl = $('#captionDetail');
        if (titleEl) titleEl.textContent = p.name;
        if (detailEl) detailEl.textContent = `${formatPrice(p.price)} — ${p.desc}`;
    }

    function openDetail(idx) {
        if (!products || products.length === 0) return;
        current = idx;
        const p = products[idx];
        if (!p) return;
        detailOpen = true;
        document.body.classList.add('show-detail');
        const overlay = $('#productOverlay');
        if (overlay) overlay.classList.add('open');
        selectedSize = '';
        renderDetail();
    }

    function closeDetail() {
        detailOpen = false;
        document.body.classList.remove('show-detail');
        const overlay = $('#productOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    function navigate(dir) {
        if (products.length === 0) return;
        current = (current + dir + products.length) % products.length;
        selectedSize = '';
        renderDetail();
    }

    // Áp dụng cấu hình của sào hiện tại lên giao diện
    function applyRack(currentRack) {
        if (!currentRack) return;
        products = currentRack.products || [];

        const eyebrowEl = $('.rail-eyebrow');
        if (eyebrowEl) eyebrowEl.textContent = (currentCategory === 'quan') ? 'BỘ SƯU TẬP QUẦN' : 'BỘ SƯU TẬP ÁO';

        const heroTitleEl = $('.rail-hero-title');
        if (heroTitleEl) heroTitleEl.innerHTML = currentRack.heroTitle || 'Thời Trang Độc Bản · Nâng Tầm Phong Cách';

        const brandEl = $('.rail-brand');
        if (brandEl && currentRack.brandSignature) {
            brandEl.innerHTML = currentRack.brandSignature;
        }

        const capTitleEl = $('#captionTitle');
        const capDetailEl = $('#captionDetail');
        if (capTitleEl && currentRack.captionHeading) capTitleEl.textContent = currentRack.captionHeading;
        if (capDetailEl && currentRack.captionDetail) capDetailEl.textContent = currentRack.captionDetail;

        // Quản lý hiển thị nút chuyển sào: Hiện khi số sào > 1, ẩn khi chỉ có 1 sào
        const prevRackBtn = $('#rackPrevBtn');
        const nextRackBtn = $('#rackNextBtn');
        const showArrows = currentRacks.length > 1;
        if (prevRackBtn) {
            prevRackBtn.style.display = showArrows ? 'inline-flex' : 'none';
            prevRackBtn.title = `Sào trước (${currentRackIdx === 0 ? currentRacks.length : currentRackIdx}/${currentRacks.length})`;
        }
        if (nextRackBtn) {
            nextRackBtn.style.display = showArrows ? 'inline-flex' : 'none';
            nextRackBtn.title = `Sào tiếp theo (${(currentRackIdx + 1) % currentRacks.length + 1}/${currentRacks.length})`;
        }

        makeRail();
        const scroll = $('#railScroll');
        if (scroll) scroll.scrollLeft = 0;
        active = -1;
        if (products.length > 0) {
            setActive(0);
        }
    }

    // Chuyển sào đồ (Off the Rail Switcher)
    function switchRack(dir) {
        if (detailOpen) closeDetail();
        if (currentRacks.length <= 1) return;
        const stage = $('#railStage');
        if (stage) stage.classList.add('is-switching');

        setTimeout(() => {
            currentRackIdx = (currentRackIdx + dir + currentRacks.length) % currentRacks.length;
            applyRack(currentRacks[currentRackIdx]);
            setTimeout(() => {
                if (stage) stage.classList.remove('is-switching');
            }, 60);
        }, 220);
    }

    // Chi tiết sản phẩm Modal
    function renderDetail() {
        const p = products[current];
        if (!p) return;
        const v = p.variant || 0;

        const nameEl = $('#detailName');
        const priceEl = $('#detailPrice');
        const descEl = $('#detailDesc');
        const imgEl = $('#detailImage');
        const typeEl = $('#detailType');

        if (nameEl) nameEl.textContent = p.name;
        if (priceEl) priceEl.textContent = formatPrice(p.price);
        if (descEl) descEl.textContent = p.desc;
        if (typeEl) typeEl.textContent = p.type ? `// ${p.type.toUpperCase()}` : '// THIẾT KẾ GIỚI HẠN';
        if (imgEl) {
            imgEl.src = photo(p, v);
            imgEl.alt = p.name;
        }

        const totalStock = (p.stock || []).reduce((a, b) => a + b, 0);
        const low = totalStock > 0 && totalStock <= 15;
        const st = $('#stockStatus');
        if (st) {
            st.textContent = p.upcoming ? 'Ra mắt Thứ Sáu' : low ? 'Sắp hết hàng' : 'Còn hàng';
            st.classList.toggle('low', low && !p.upcoming);
        }

        const colorsEl = $('#colors');
        if (colorsEl) {
            colorsEl.innerHTML = '';
            (p.colors || []).forEach((c, idx) => {
                const btn = document.createElement('button');
                btn.className = 'rail-color-choice' + (idx === v ? ' selected' : '');
                btn.style.background = c[1];
                btn.title = c[0];
                btn.setAttribute('aria-label', c[0]);
                btn.onclick = () => {
                    p.variant = idx;
                    const slotFront = document.querySelector(`.slot[data-idx="${current}"] .face.front`);
                    if (slotFront) slotFront.src = photo(p, idx);
                    renderDetail();
                };
                colorsEl.append(btn);
            });
        }

        const sizesEl = $('#sizes');
        if (sizesEl) {
            sizesEl.innerHTML = '';
            const currentSizes = p.sizes || sizeNames;
            currentSizes.forEach((size, idx) => {
                const b = document.createElement('button');
                b.className = 'rail-size-chip' + (selectedSize === size ? ' selected' : '');
                b.textContent = size;
                b.disabled = p.upcoming || (p.stock && p.stock[idx] === 0);
                b.title = b.disabled ? 'Hết hàng' : `Còn ${p.stock ? p.stock[idx] : 10} sản phẩm`;
                b.onclick = () => {
                    selectedSize = size;
                    renderSizes();
                };
                sizesEl.append(b);
            });
        }

        renderSizes();
    }

    function renderSizes() {
        const p = products[current];
        if (!p) return;
        const currentSizes = p.sizes || sizeNames;
        document.querySelectorAll('.rail-size-chip').forEach(b => {
            b.classList.toggle('selected', b.textContent === selectedSize);
        });

        const sizeIdx = currentSizes.indexOf(selectedSize);
        const count = (p.stock && sizeIdx >= 0) ? p.stock[sizeIdx] : 0;
        const hintEl = $('#sizeHint');
        if (hintEl) {
            hintEl.textContent = selectedSize && count <= 2 && count > 0 ? `Chỉ còn ${count} sản phẩm size ${selectedSize}` : '';
        }

        const cartCta = $('#cartCta');
        if (cartCta) {
            cartCta.textContent = p.upcoming 
                ? 'NHẬN THÔNG BÁO KHI RA MẮT' 
                : selectedSize 
                    ? `THÊM VÀO GIỎ · ${formatPrice(p.price)}` 
                    : 'CHỌN KÍCH CỠ';
            cartCta.disabled = p.upcoming || !selectedSize;
        }
    }

    function openModal(title, text) {
        modalOpen = true;
        const titleEl = $('#modalTitle');
        const textEl = $('#modalText');
        const modal = $('#modal');
        if (titleEl) titleEl.textContent = title;
        if (textEl) textEl.innerHTML = text;
        if (modal) modal.classList.add('open');
    }

    function closeModal() {
        modalOpen = false;
        const modal = $('#modal');
        if (modal) modal.classList.remove('open');
    }

    function closeClothingRail() {
        const rackOverlayEl = document.getElementById('hnmtRackOverlay');
        if (rackOverlayEl) {
            rackOverlayEl.classList.remove('is-active');
            rackOverlayEl.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('show-detail');
        if (typeof window.HNMTChilePortal?.syncOverlayState === 'function') {
            window.HNMTChilePortal.syncOverlayState(false);
        }
    }

    function openClothingRail(category = 'ao') {
        currentCategory = (category === 'quan') ? 'quan' : 'ao';
        isFiltered = false;
        activeFilterLabel = '';
        renderActiveFilterBanner(null, null);

        currentRacks = (currentCategory === 'quan') ? DEFAULT_PANTS_RACKS : DEFAULT_SHIRT_RACKS;
        currentRackIdx = 0;

        const rackOverlayEl = document.getElementById('hnmtRackOverlay');
        if (rackOverlayEl) {
            rackOverlayEl.classList.add('is-active');
            rackOverlayEl.setAttribute('aria-hidden', 'false');

            const promptEl = document.querySelector('.hnmt-portal-footer');
            const portalHeaderEl = document.querySelector('.hnmt-portal-header');
            if (promptEl) promptEl.style.display = 'none';
            if (portalHeaderEl) portalHeaderEl.style.display = 'none';

            applyRack(currentRacks[0]);
        }
    }

    // Chọn và phóng to chi tiết một món đồ cụ thể
    function selectProduct(category, slugOrIdx) {
        if (category && currentCategory !== category) {
            openClothingRail(category);
        } else {
            const rackOverlayEl = document.getElementById('hnmtRackOverlay');
            if (rackOverlayEl && !rackOverlayEl.classList.contains('is-active')) {
                openClothingRail(category || currentCategory);
            }
        }

        let foundRackIdx = -1;
        let foundProdIdx = -1;

        currentRacks.forEach((rack, rIdx) => {
            rack.products.forEach((p, pIdx) => {
                if (p.slug === slugOrIdx || p.name === slugOrIdx || pIdx === slugOrIdx) {
                    foundRackIdx = rIdx;
                    foundProdIdx = pIdx;
                }
            });
        });

        if (foundRackIdx !== -1 && foundProdIdx !== -1) {
            if (currentRackIdx !== foundRackIdx) {
                applyRack(currentRacks[foundRackIdx]);
            }
            setTimeout(() => {
                setActive(foundProdIdx);
                openDetail(foundProdIdx);
            }, 120);
        }
    }

    // ==========================================================================
    // 4. BỘ LỌC ĐA TIÊU CHÍ TRỰC TIẾP LÊN SÀO (DYNAMIC RAIL FILTER ENGINE)
    // ==========================================================================
    function applyFilter(filteredList, filterLabel = '') {
        if (!filteredList) {
            resetFilter();
            return;
        }

        isFiltered = true;
        activeFilterLabel = filterLabel;

        const catName = (currentCategory === 'quan') ? 'BỘ SƯU TẬP QUẦN' : 'BỘ SƯU TẬP ÁO';
        const brandSig = '<span>Sào Đồ</span><span>Thời Trang</span>';

        if (filteredList.length === 0) {
            // Không tìm thấy sản phẩm nào
            currentRacks = [{
                id: `rack-${currentCategory}-empty`,
                badge: 'KẾT QUẢ TÌM KIẾM // KHÔNG CÓ SẢN PHẨM',
                eyebrow: catName,
                heroTitle: 'Không Tìm Thấy Sản Phẩm Phù Hợp',
                brandSignature: brandSig,
                captionHeading: 'Không có sản phẩm nào khớp với bộ lọc.',
                captionDetail: 'Vui lòng thử tìm với từ khóa hoặc tiêu chí lọc khác.',
                products: []
            }];
            currentRackIdx = 0;
            applyRack(currentRacks[0]);
            renderActiveFilterBanner(filterLabel || 'Không có kết quả', 0);

            // Hiển thị thông báo trống lịch thiệp trên sào
            const stage = $('#railStage');
            if (stage) {
                stage.querySelectorAll('.slot').forEach(e => e.remove());
                const emptyNotice = document.createElement('div');
                emptyNotice.className = 'rail-empty-results-box';
                emptyNotice.innerHTML = `
                    <div class="empty-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-4.35-4.35"/>
                        </svg>
                    </div>
                    <h3>Không tìm thấy sản phẩm phù hợp</h3>
                    <p>Bộ lọc: <em>"${filterLabel || 'Tất cả tiêu chí'}"</em> không khớp với mẫu đồ nào trên sào.</p>
                    <button type="button" class="rail-reset-action-cta" id="railEmptyResetBtn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                        </svg>
                        <span>Xem tất cả ${currentCategory === 'quan' ? 'quần' : 'áo'}</span>
                    </button>
                `;
                stage.appendChild(emptyNotice);
                const emptyResetBtn = emptyNotice.querySelector('#railEmptyResetBtn');
                if (emptyResetBtn) {
                    emptyResetBtn.addEventListener('click', resetFilter);
                }
            }
            return;
        }

        // Tự động chia thành các sào liên tiếp nếu > 10 sản phẩm
        currentRacks = chunkProductsIntoRacks(filteredList, currentCategory, true, filterLabel);
        currentRackIdx = 0;
        applyRack(currentRacks[0]);
        renderActiveFilterBanner(filterLabel, filteredList.length);
    }

    // Đặt lại bộ lọc -> Trở về mặc định hiển thị tất cả
    function resetFilter() {
        isFiltered = false;
        activeFilterLabel = '';
        renderActiveFilterBanner(null, null);

        const stage = $('#railStage');
        const emptyNotice = stage?.querySelector('.rail-empty-results-box');
        if (emptyNotice) emptyNotice.remove();

        currentRacks = (currentCategory === 'quan') ? DEFAULT_PANTS_RACKS : DEFAULT_SHIRT_RACKS;
        currentRackIdx = 0;
        applyRack(currentRacks[0]);
    }

    // ==========================================================================
    // 5. EXPORT PUBLIC API
    // ==========================================================================
    window.open3DClothesRack = openClothingRail;
    window.open3DPantsRack = function () { openClothingRail('quan'); };
    window.close3DClothesRack = closeClothingRail;
    window.close3DPantsRack = closeClothingRail;

    window.ClothingRail = {
        openClothingRail,
        closeClothingRail,
        selectProduct,
        applyFilter,
        resetFilter,
        getCategory: () => currentCategory,
        setCategory: (cat) => { openClothingRail(cat); },
        getAllProducts: (cat) => (cat === 'quan' ? ALL_PANTS_PRODUCTS : ALL_SHIRT_PRODUCTS),
        SHIRT_RACKS: DEFAULT_SHIRT_RACKS,
        PANTS_RACKS: DEFAULT_PANTS_RACKS,
        ALL_SHIRT_PRODUCTS,
        ALL_PANTS_PRODUCTS
    };

    // ==========================================================================
    // 6. KHỞI TẠO EVENT LISTENERS & DOM
    // ==========================================================================
    function init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const catParam = urlParams.get('category') || urlParams.get('cat');
            if (catParam === 'quan') {
                currentCategory = 'quan';
                currentRacks = DEFAULT_PANTS_RACKS;
                currentRackIdx = 0;
                products = currentRacks[0].products;
            }
        } catch (e) {}

        ensureSearchButton();
        setInterval(ensureSearchButton, 600);

        const prevBtn = $('#prevBtn');
        const nextBtn = $('#nextBtn');
        const closeBtn = $('#closeBtn');
        const availBtn = $('#availabilityBtn');
        const cartCta = $('#cartCta');
        const bagBtn = $('#bagBtn');
        const brandSig = $('#railBrandSignature');
        const backToLobbyBtn = $('#hnmtRackBackToLobbyBtn');
        const modalExit = $('#modalExit');

        // Nút chuyển sào tiếp theo / sào trước
        const prevRackBtn = $('#rackPrevBtn');
        const nextRackBtn = $('#rackNextBtn');
        if (prevRackBtn) prevRackBtn.onclick = () => switchRack(-1);
        if (nextRackBtn) nextRackBtn.onclick = () => switchRack(1);

        if (prevBtn) prevBtn.onclick = () => navigate(-1);
        if (nextBtn) nextBtn.onclick = () => navigate(1);
        if (closeBtn) closeBtn.onclick = closeDetail;
        if (availBtn) availBtn.onclick = () => openDetail(active >= 0 ? active : 0);

        if (backToLobbyBtn) {
            backToLobbyBtn.onclick = () => {
                closeClothingRail();
                const promptEl = document.querySelector('.hnmt-portal-footer');
                const portalHeaderEl = document.querySelector('.hnmt-portal-header');
                if (promptEl) promptEl.style.display = '';
                if (portalHeaderEl) portalHeaderEl.style.display = '';
            };
        }

        if (brandSig) {
            brandSig.onclick = () => {
                window.location.href = '/';
            };
        }

        if (cartCta) {
            cartCta.onclick = () => {
                const p = products[current];
                if (!p || p.upcoming) return;
                if (!selectedSize) {
                    return;
                }

                bag++;
                const bagCount = document.getElementById('bagCount');
                if (bagCount) {
                    bagCount.textContent = bag;
                    bagCount.classList.remove('bump');
                    void bagCount.offsetWidth;
                    bagCount.classList.add('bump');
                }

                const svBag = document.getElementById('svBagBadge');
                if (svBag) {
                    svBag.textContent = bag;
                    svBag.style.transform = 'scale(1.4)';
                    setTimeout(() => svBag.style.transform = 'scale(1)', 250);
                }

                cartCta.innerHTML = `
                    <span class="rail-btn-feedback">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        ĐÃ THÊM VÀO GIỎ (SIZE ${selectedSize})
                    </span>
                `;
                cartCta.classList.add('is-added');
                cartCta.disabled = true;

                setTimeout(() => {
                    cartCta.classList.remove('is-added');
                    cartCta.disabled = false;
                    renderSizes();
                }, 2400);
            };
        }

        if (modalExit) modalExit.onclick = closeModal;

        // Phím tắt bàn phím
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (modalOpen) closeModal();
                else if (detailOpen) closeDetail();
                else if ($('#hnmtRackOverlay')?.classList.contains('is-active')) closeClothingRail();
            } else if (e.key === 'ArrowLeft') {
                if (detailOpen) navigate(-1);
            } else if (e.key === 'ArrowRight') {
                if (detailOpen) navigate(1);
            }
        });

        const overlay = $('#productOverlay');
        if (overlay) {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) closeDetail();
            });
        }

        applyRack(currentRacks[0]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
