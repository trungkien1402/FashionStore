/**
 * HNMT ATELIER — "TRY THE LOOK" INTERACTIVE OUTFIT SHOWROOM (2026 EDITION)
 * 1:1 Parity with Interactive Runway Video & Unified HNMTCart Integration
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. DATA CATALOG: 2 COLLECTIONS & 6 CURATED HEAD-TO-TOE LOOKS
    // =========================================================================
    const LOOKBOOK_DATA = {
        nightfall: {
            title: "NIGHTFALL METROPOLIS",
            subtitle: "Đêm Đô Thị & Cyber-Streetwear",
            looks: [
                {
                    id: "nf-01",
                    name: "NEO-FUTURE ARC",
                    lookNumber: "01",
                    modelImage: "/images/lookbook/look-nightfall-1.jpg",
                    hotspots: [
                        { id: "top", pin: 1, top: "28%", left: "50%", cat: "ÁO TEE OVERSIZED" },
                        { id: "pants", pin: 2, top: "60%", left: "48%", cat: "QUẦN JEANS WASH" },
                        { id: "shoes", pin: 3, top: "91%", left: "50%", cat: "SNEAKER CYBERPUNK" }
                    ],
                    items: [
                        {
                            id: "nf-item-top-1",
                            category: "Áo Thun Streetwear",
                            name: "Neo-Future Arc Heavy Graphic Tee",
                            price: 490000,
                            image: "/images/products/clothes/distressed-graphic-tee.png",
                            sizes: ["M", "L", "XL"],
                            selectedSize: "L",
                            color: "Đen Than Chì (Carbon Noir)",
                            colorDot: "#111827"
                        },
                        {
                            id: "nf-item-pants-1",
                            category: "Quần Jeans Đường Phố",
                            name: "Quần Jeans Ống Rộng Washed Grey",
                            price: 640000,
                            image: "/images/pants/cargo-acid-wash.png",
                            sizes: ["29", "30", "31", "32"],
                            selectedSize: "31",
                            color: "Xám Khói Acid Washed",
                            colorDot: "#475569"
                        },
                        {
                            id: "nf-item-shoes-1",
                            category: "Giày Sneaker High-Tech",
                            name: "AIR FUTURE III – NEXUS X1 (Acid Volt)",
                            price: 4900000,
                            image: "/images/sneakers/air-future-iii.webp",
                            sizes: ["40", "41", "42", "43"],
                            selectedSize: "43",
                            color: "WHITE / ACID VOLT / BLACK",
                            colorDot: "#84cc16"
                        }
                    ]
                },
                {
                    id: "nf-02",
                    name: "SHADOW DRIFTER",
                    lookNumber: "02",
                    modelImage: "/images/lookbook/look-nightfall-2.jpg",
                    hotspots: [
                        { id: "top", pin: 1, top: "27%", left: "49%", cat: "ÁO TECHWEAR HOODIE" },
                        { id: "pants", pin: 2, top: "62%", left: "50%", cat: "QUẦN PARACHUTE ĐEN" },
                        { id: "shoes", pin: 3, top: "90%", left: "50%", cat: "SNEAKER STEALTH BLACK" }
                    ],
                    items: [
                        {
                            id: "nf-item-top-2",
                            category: "Áo Khoác & Hoodie",
                            name: "Technical Utility Hooded Jacket Noir",
                            price: 890000,
                            image: "/images/products/clothes/techwear-bomber-jacket.png",
                            sizes: ["M", "L", "XL"],
                            selectedSize: "L",
                            color: "Đen Tối Giản (Deep Noir)",
                            colorDot: "#0f172a"
                        },
                        {
                            id: "nf-item-pants-2",
                            category: "Quần Parachute / Cargo",
                            name: "Quần Parachute Túi Hộp Tactical Noir",
                            price: 680000,
                            image: "/images/pants/raw-selvedge-black.png",
                            sizes: ["29", "30", "31", "32"],
                            selectedSize: "31",
                            color: "Đen Nhám (Matte Black)",
                            colorDot: "#1e293b"
                        },
                        {
                            id: "nf-item-shoes-2",
                            category: "Giày Sneaker High-Tech",
                            name: "AIR FUTURE IX – SHADOW RUNNER",
                            price: 4200000,
                            image: "/images/sneakers/air-future-ix.webp",
                            sizes: ["40", "41", "42", "43"],
                            selectedSize: "42",
                            color: "STEALTH TRIPLE BLACK",
                            colorDot: "#000000"
                        }
                    ]
                },
                {
                    id: "nf-03",
                    name: "CYBER MATRIX",
                    lookNumber: "03",
                    modelImage: "/images/lookbook/look-nightfall-3.jpg",
                    hotspots: [
                        { id: "top", pin: 1, top: "28%", left: "50%", cat: "ÁO TEE ACID LOANG" },
                        { id: "pants", pin: 2, top: "61%", left: "49%", cat: "QUẦN DENIM DISTRESSED" },
                        { id: "shoes", pin: 3, top: "90%", left: "50%", cat: "SNEAKER RETRO OVERDRIVE" }
                    ],
                    items: [
                        {
                            id: "nf-item-top-3",
                            category: "Áo Thun Streetwear",
                            name: "Holding On Crewneck Acid Charcoal",
                            price: 780000,
                            image: "/images/products/clothes/vintage-washed-boxy-tee.png",
                            sizes: ["M", "L", "XL"],
                            selectedSize: "L",
                            color: "Xám Loang Than (Acid Smoke)",
                            colorDot: "#334155"
                        },
                        {
                            id: "nf-item-pants-3",
                            category: "Quần Jeans Đường Phố",
                            name: "Quần Jeans Rách Distressed Dark Indigo",
                            price: 590000,
                            image: "/images/pants/cargo-acid-wash.png",
                            sizes: ["29", "30", "31", "32"],
                            selectedSize: "30",
                            color: "Xám Chàm Loang (Distressed Wash)",
                            colorDot: "#1e293b"
                        },
                        {
                            id: "nf-item-shoes-3",
                            category: "Giày Sneaker High-Tech",
                            name: "AIR FUTURE IV – CYBER OVERDRIVE",
                            price: 4500000,
                            image: "/images/sneakers/air-future-iv.webp",
                            sizes: ["40", "41", "42", "43"],
                            selectedSize: "41",
                            color: "METALLIC SILVER / BLACK",
                            colorDot: "#e2e8f0"
                        }
                    ]
                }
            ]
        },

        rawearth: {
            title: "RAW EARTH & DUST",
            subtitle: "Denim Thô Di Sản & Vintage Gorpcore",
            looks: [
                {
                    id: "re-01",
                    name: "CYANOTYPE ARTISAN",
                    lookNumber: "01",
                    modelImage: "/images/lookbook/look-rawearth-1.jpg",
                    hotspots: [
                        { id: "top", pin: 1, top: "29%", left: "50%", cat: "ÁO FERN TEE DƯƠNG XỈ" },
                        { id: "pants", pin: 2, top: "61%", left: "49%", cat: "QUẦN JEANS ỐNG RỘNG 90S" },
                        { id: "shoes", pin: 3, top: "90%", left: "50%", cat: "SNEAKER RETRO GUM SOLE" }
                    ],
                    items: [
                        {
                            id: "re-item-top-1",
                            category: "Áo Thun Streetwear",
                            name: "Fern Tee (Họa Tiết Dương Xỉ Xanh Chàm)",
                            price: 440000,
                            image: "/images/products/clothes/oversize-streetwear-tee-white.png",
                            sizes: ["M", "L", "XL"],
                            selectedSize: "L",
                            color: "Trắng Ngà / Xanh Dương Xỉ (Prussian)",
                            colorDot: "#1d4ed8"
                        },
                        {
                            id: "re-item-pants-1",
                            category: "Quần Jeans Đường Phố",
                            name: "Quần Jeans Ống Rộng Vintage Washed Indigo",
                            price: 540000,
                            image: "/images/pants/wide-leg-denim.png",
                            sizes: ["29", "30", "31", "32"],
                            selectedSize: "31",
                            color: "Xanh Vintage Washed (90s Blue)",
                            colorDot: "#3b82f6"
                        },
                        {
                            id: "re-item-shoes-1",
                            category: "Giày Sneaker Retro",
                            name: "AIR FUTURE I – RETRO GUM SOLE",
                            price: 3800000,
                            image: "/images/sneakers/air-future-i.webp",
                            sizes: ["40", "41", "42", "43"],
                            selectedSize: "42",
                            color: "WHITE CHALK / GUM SOLE",
                            colorDot: "#d97706"
                        }
                    ]
                },
                {
                    id: "re-02",
                    name: "HEAVYWEIGHT SELVEDGE",
                    lookNumber: "02",
                    modelImage: "/images/lookbook/look-rawearth-2.jpg",
                    hotspots: [
                        { id: "top", pin: 1, top: "28%", left: "49%", cat: "ÁO HEAVY COTTON BEIGE" },
                        { id: "pants", pin: 2, top: "62%", left: "49%", cat: "QUẦN RAW DENIM 14OZ" },
                        { id: "shoes", pin: 3, top: "90%", left: "50%", cat: "SNEAKER DA LỘN VINTAGE" }
                    ],
                    items: [
                        {
                            id: "re-item-top-2",
                            category: "Áo Thun Streetwear",
                            name: "Heavy Cotton Crewneck Cát Cháy",
                            price: 480000,
                            image: "/images/products/clothes/oversize-streetwear-tee-white.png",
                            sizes: ["M", "L", "XL"],
                            selectedSize: "L",
                            color: "Be Cát Thô (Earthy Sand)",
                            colorDot: "#d6c7b2"
                        },
                        {
                            id: "re-item-pants-2",
                            category: "Quần Jeans Cao Cấp",
                            name: "Quần Jeans Raw Denim 14oz Chàm Đậm (Biên Đỏ)",
                            price: 740000,
                            image: "/images/pants/raw-selvedge-black.png",
                            sizes: ["29", "30", "31", "32"],
                            selectedSize: "31",
                            color: "Chàm Đậm (Deep Indigo)",
                            colorDot: "#1e1b4b"
                        },
                        {
                            id: "re-item-shoes-2",
                            category: "Giày Sneaker Retro",
                            name: "RETRO RUNNER SUEDE GUM (EARTH)",
                            price: 3200000,
                            image: "/images/sneakers/air-future-i.webp",
                            sizes: ["40", "41", "42", "43"],
                            selectedSize: "41",
                            color: "RAW OATMEAL / GUM",
                            colorDot: "#b45309"
                        }
                    ]
                },
                {
                    id: "re-03",
                    name: "DESERT WORKWEAR",
                    lookNumber: "03",
                    modelImage: "/images/lookbook/look-rawearth-3.jpg",
                    hotspots: [
                        { id: "top", pin: 1, top: "28%", left: "49%", cat: "SƠ MI KHAKI OVERSHIRT" },
                        { id: "pants", pin: 2, top: "61%", left: "50%", cat: "QUẦN PLEATED BEIGE" },
                        { id: "shoes", pin: 3, top: "90%", left: "50%", cat: "SNEAKER LOW-TOP LEATHER" }
                    ],
                    items: [
                        {
                            id: "re-item-top-3",
                            category: "Áo Khoác / Sơ Mi",
                            name: "Boxy Khaki Workwear Overshirt Combo",
                            price: 690000,
                            image: "/images/products/clothes/fleece-vintage-crewneck.png",
                            sizes: ["M", "L", "XL"],
                            selectedSize: "L",
                            color: "Khaki Đất (Desert Tan)",
                            colorDot: "#a3825a"
                        },
                        {
                            id: "re-item-pants-3",
                            category: "Quần Trousers / Xếp Ly",
                            name: "Quần Pleated Sand Beige Trousers",
                            price: 680000,
                            image: "/images/pants/pleated-sand-beige.png",
                            sizes: ["29", "30", "31", "32"],
                            selectedSize: "31",
                            color: "Be Cát Tự Nhiên (Sand Beige)",
                            colorDot: "#d5c9b6"
                        },
                        {
                            id: "re-item-shoes-3",
                            category: "Giày Sneaker Retro",
                            name: "AIR FUTURE I – RETRO CHALK WHITE",
                            price: 3600000,
                            image: "/images/sneakers/air-future-i.webp",
                            sizes: ["40", "41", "42", "43"],
                            selectedSize: "42",
                            color: "CHALK WHITE / VINTAGE SOLE",
                            colorDot: "#f8fafc"
                        }
                    ]
                }
            ]
        }
    };

    // =========================================================================
    // 2. STATE & CONTROLLER
    // =========================================================================
    let currentTheme = window.__INITIAL_THEME || 'nightfall';
    let currentLookIndex = 0;

    // Currency Formatter
    function formatMoney(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }

    // DOM Elements
    const root = document.getElementById('lookbookRoot');
    if (!root) return;

    const runwayTrack = document.getElementById('lbRunwayTrack');
    const lookPillsContainer = document.getElementById('lbLookPills');
    const prevBtn = document.getElementById('lbPrevBtn');
    const nextBtn = document.getElementById('lbNextBtn');
    const sidebarTitle = document.getElementById('lbSidebarTitle');
    const itemsList = document.getElementById('lbItemsList');
    const totalPriceEl = document.getElementById('lbTotalPrice');
    const addFullLookBtn = document.getElementById('lbAddFullLookBtn');
    const themeTabs = document.querySelectorAll('.lb-theme-tab');
    const headerCartBtn = document.getElementById('lbCartBtn');
    const headerCartCount = document.getElementById('lbCartCount');
    const backBtn = root.querySelector('.lb-back-btn');

    // =========================================================================
    // 3. OPEN / CLOSE MODAL BEHAVIOR (HOMEPAGE COMPATIBLE)
    // =========================================================================
    function openLookbook(theme) {
        if (theme) switchTheme(theme);
        root.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        updateCartBadge();
        updateTrackTransform();
    }

    function closeLookbook() {
        if (window.location.pathname.toLowerCase().includes('/lookbook')) {
            window.location.href = '/';
            return;
        }
        root.classList.remove('is-open');
        document.body.style.overflow = '';
        if (history.replaceState) {
            history.replaceState(null, '', window.location.pathname);
        }
    }

    // Expose Global Controller
    window.HNMTLookbook = {
        open: openLookbook,
        close: closeLookbook,
        switchTheme: switchTheme,
        goToLook: goToLook
    };

    // Attach trigger listeners across the page (for cards in Index.cshtml)
    document.querySelectorAll('[data-open-lookbook]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const theme = el.dataset.openLookbook;
            openLookbook(theme);
        });
    });

    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeLookbook();
        });
    }

    // Check hash on page load
    if (window.location.hash === '#lookbook-nightfall') {
        openLookbook('nightfall');
    } else if (window.location.hash === '#lookbook-rawearth') {
        openLookbook('rawearth');
    } else if (window.location.pathname.toLowerCase().includes('/lookbook')) {
        // If on standalone /lookbook page, show open immediately
        root.classList.add('is-open');
    }

    // =========================================================================
    // 4. RENDER RUNWAY STAGE
    // =========================================================================
    function renderStage() {
        const collection = LOOKBOOK_DATA[currentTheme];
        const looks = collection.looks;

        // Render runway models
        runwayTrack.innerHTML = '';
        looks.forEach((look, idx) => {
            const card = document.createElement('div');
            card.className = `lb-model-card ${idx === currentLookIndex ? 'active' : ''}`;
            card.dataset.index = idx;

            // Model Image
            const img = document.createElement('img');
            img.src = look.modelImage;
            img.alt = look.name;
            card.appendChild(img);

            // Hotspots (for the active model)
            look.hotspots.forEach(hs => {
                const hsEl = document.createElement('div');
                hsEl.className = 'lb-hotspot';
                hsEl.style.top = hs.top;
                hsEl.style.left = hs.left;
                hsEl.dataset.pinId = hs.id;

                const targetItem = look.items.find((_, i) => i === (hs.pin - 1)) || look.items[0];

                hsEl.innerHTML = `
                    <div class="lb-hotspot-radar"></div>
                    <div class="lb-hotspot-pin">${hs.pin}</div>
                    <div class="lb-hotspot-tooltip">
                        <div class="lb-hotspot-tooltip-cat">${hs.cat}</div>
                        <div class="lb-hotspot-tooltip-name">${targetItem.name}</div>
                        <div class="lb-hotspot-tooltip-price">${formatMoney(targetItem.price)}</div>
                    </div>
                `;

                // Hover / Click hotspot highlights sidebar card
                hsEl.addEventListener('mouseenter', () => highlightSidebarCard(hs.pin - 1));
                hsEl.addEventListener('mouseleave', () => unhighlightSidebarCard(hs.pin - 1));
                hsEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    highlightSidebarCard(hs.pin - 1);
                    scrollToSidebarCard(hs.pin - 1);
                });

                card.appendChild(hsEl);
            });

            // Clicking model card focuses it
            card.addEventListener('click', () => {
                if (currentLookIndex !== idx) {
                    goToLook(idx);
                }
            });

            runwayTrack.appendChild(card);
        });

        // Render bottom look indicator pills
        lookPillsContainer.innerHTML = '';
        looks.forEach((look, idx) => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `lb-look-pill ${idx === currentLookIndex ? 'active' : ''}`;
            pill.textContent = `${look.lookNumber} • ${look.name}`;
            pill.addEventListener('click', () => goToLook(idx));
            lookPillsContainer.appendChild(pill);
        });

        // Update track translation to center active model
        updateTrackTransform();
    }

    // =========================================================================
    // 5. RENDER SIDEBAR ("IN THIS LOOK")
    // =========================================================================
    function renderSidebar() {
        const collection = LOOKBOOK_DATA[currentTheme];
        const look = collection.looks[currentLookIndex];

        // Update Title
        sidebarTitle.textContent = `LOOK ${look.lookNumber} — ${look.name}`;

        // Render Item Cards
        itemsList.innerHTML = '';
        let fullTotal = 0;

        look.items.forEach((item, itemIdx) => {
            fullTotal += item.price;

            const card = document.createElement('div');
            card.className = 'lb-item-card';
            card.dataset.itemIndex = itemIdx;

            // Generate Size buttons
            const sizeButtonsHtml = item.sizes.map(s => `
                <button type="button" class="lb-size-btn ${s === item.selectedSize ? 'active' : ''}" data-size="${s}">${s}</button>
            `).join('');

            card.innerHTML = `
                <div class="lb-item-pin-num">${itemIdx + 1}</div>
                <div class="lb-item-thumb">
                    <img src="${item.image}" alt="${item.name}" />
                </div>
                <div class="lb-item-info">
                    <div class="lb-item-cat">${item.category}</div>
                    <h4 class="lb-item-name" title="${item.name}">${item.name}</h4>
                    <div class="lb-item-size-row">
                        <span style="font-size: 11px; color: #94a3b8; margin-right: 4px;">Size:</span>
                        ${sizeButtonsHtml}
                    </div>
                    <div class="lb-item-bottom-row">
                        <div class="lb-item-price">${formatMoney(item.price)}</div>
                        <button type="button" class="lb-add-single-btn" data-add-single="${itemIdx}">
                            <i class="bi bi-plus-lg"></i> Thêm lẻ
                        </button>
                    </div>
                </div>
            `;

            // Hover on card highlights the corresponding hotspot pin
            card.addEventListener('mouseenter', () => highlightHotspot(itemIdx));
            card.addEventListener('mouseleave', () => unhighlightHotspot(itemIdx));

            // Size selection clicks
            card.querySelectorAll('.lb-size-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.querySelectorAll('.lb-size-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    item.selectedSize = btn.dataset.size;
                });
            });

            // Add single item click
            const singleBtn = card.querySelector('[data-add-single]');
            singleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addSingleItemToCart(item);
            });

            itemsList.appendChild(card);
        });

        // Update Total Price
        totalPriceEl.textContent = formatMoney(fullTotal);
    }

    // =========================================================================
    // 6. INTERACTION & NAVIGATION
    // =========================================================================
    function updateTrackTransform() {
        const cards = runwayTrack.querySelectorAll('.lb-model-card');
        cards.forEach((c, idx) => {
            if (idx === currentLookIndex) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });

        // Center the active model in the viewport
        const step = 440; // Approximate card width + gap
        const offset = -(currentLookIndex - 1) * step;
        runwayTrack.style.transform = `translateX(${offset}px)`;
    }

    function goToLook(idx) {
        const total = LOOKBOOK_DATA[currentTheme].looks.length;
        currentLookIndex = (idx + total) % total;

        updateTrackTransform();

        // Update pills
        const pills = lookPillsContainer.querySelectorAll('.lb-look-pill');
        pills.forEach((p, i) => {
            if (i === currentLookIndex) p.classList.add('active');
            else p.classList.remove('active');
        });

        renderSidebar();
    }

    function switchTheme(theme) {
        if (!LOOKBOOK_DATA[theme]) return;
        currentTheme = theme;
        currentLookIndex = 0;

        // Update wrapper class
        root.className = `lb-wrapper theme-${theme} is-open`;

        // Update theme tabs
        themeTabs.forEach(tab => {
            if (tab.dataset.theme === theme) tab.classList.add('active');
            else tab.classList.remove('active');
        });

        renderStage();
        renderSidebar();
    }

    // Highlight helpers
    function highlightSidebarCard(idx) {
        const card = itemsList.querySelector(`.lb-item-card[data-item-index="${idx}"]`);
        if (card) card.classList.add('highlighted');
    }

    function unhighlightSidebarCard(idx) {
        const card = itemsList.querySelector(`.lb-item-card[data-item-index="${idx}"]`);
        if (card) card.classList.remove('highlighted');
    }

    function scrollToSidebarCard(idx) {
        const card = itemsList.querySelector(`.lb-item-card[data-item-index="${idx}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function highlightHotspot(idx) {
        const activeCard = runwayTrack.querySelector('.lb-model-card.active');
        if (!activeCard) return;
        const hs = activeCard.querySelectorAll('.lb-hotspot')[idx];
        if (hs) hs.classList.add('highlighted');
    }

    function unhighlightHotspot(idx) {
        const activeCard = runwayTrack.querySelector('.lb-model-card.active');
        if (!activeCard) return;
        const hs = activeCard.querySelectorAll('.lb-hotspot')[idx];
        if (hs) hs.classList.remove('highlighted');
    }

    // =========================================================================
    // 7. CART INTEGRATION (UNIFIED HNMTCart GLASS DRAWER)
    // =========================================================================
    function updateCartBadge() {
        if (window.HNMTCart && headerCartCount) {
            headerCartCount.textContent = window.HNMTCart.getCount() || 0;
        }
    }

    function addSingleItemToCart(item) {
        if (!window.HNMTCart) {
            alert('Hệ thống giỏ hàng đang khởi động...');
            return;
        }

        const product = {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            size: item.selectedSize || 'L',
            color: item.color || '',
            colorDot: item.colorDot || '#fff',
            quantity: 1
        };

        window.HNMTCart.addItem(product);
        updateCartBadge();
        window.HNMTCart.open();
    }

    function addFullLookToCart() {
        if (!window.HNMTCart) {
            alert('Hệ thống giỏ hàng đang khởi động...');
            return;
        }

        const collection = LOOKBOOK_DATA[currentTheme];
        const look = collection.looks[currentLookIndex];

        // Animate button feedback
        const origText = addFullLookBtn.innerHTML;
        addFullLookBtn.innerHTML = `<i class="bi bi-check2-circle"></i> ĐÃ THÊM TRỌN BỘ OUTFIT!`;
        addFullLookBtn.style.background = 'var(--lb-active-accent)';
        addFullLookBtn.style.color = '#000000';

        // Add all 3 pieces sequentially
        look.items.forEach(item => {
            const product = {
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                size: item.selectedSize || 'L',
                color: item.color || '',
                colorDot: item.colorDot || '#fff',
                quantity: 1
            };
            window.HNMTCart.addItem(product);
        });

        updateCartBadge();

        setTimeout(() => {
            addFullLookBtn.innerHTML = origText;
            addFullLookBtn.style.background = '';
            addFullLookBtn.style.color = '';
            // Open our luxury HNMTCart drawer
            window.HNMTCart.open();
        }, 350);
    }

    // =========================================================================
    // 8. EVENT LISTENERS
    // =========================================================================
    prevBtn.addEventListener('click', () => goToLook(currentLookIndex - 1));
    nextBtn.addEventListener('click', () => goToLook(currentLookIndex + 1));

    themeTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTheme(tab.dataset.theme));
    });

    addFullLookBtn.addEventListener('click', addFullLookToCart);

    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => {
            if (window.HNMTCart) window.HNMTCart.open();
        });
    }

    // Keyboard Arrow Keys & ESC
    window.addEventListener('keydown', (e) => {
        if (!root.classList.contains('is-open')) return;
        if (e.key === 'ArrowLeft') goToLook(currentLookIndex - 1);
        if (e.key === 'ArrowRight') goToLook(currentLookIndex + 1);
        if (e.key === 'Escape') closeLookbook();
    });

    // Listen to custom cart updates
    window.addEventListener('hnmt:cart:updated', updateCartBadge);

    // Initial Init
    switchTheme(currentTheme);
    setTimeout(updateCartBadge, 300);

})();
