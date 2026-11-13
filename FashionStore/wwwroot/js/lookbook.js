/**
 * HNMT ATELIER — "TRY THE LOOK" 3D TURNTABLE RUNWAY
 * Senior Fashion UX/UI: Ultra-Glassmorphism, Micro Hotspot Pins, Weighted Turntable
 */
(function () {
    'use strict';

    var SZ_TOP = ['S', 'M', 'L', 'XL'],
        SZ_PANT = ['29', '30', '31', '32'],
        SZ_SHOE = ['40', '41', '42', '43'];

    function it(id, cat, name, price, image, sizes, size, color, dot) {
        return { id: id, cat: cat, name: name, price: price, image: image, sizes: sizes, size: size, color: color, dot: dot };
    }

    var COLLECTIONS = {
        noir: {
            id: 'noir',
            themeClass: 'theme-noir',
            title: 'NOIR UNIT',
            collectionName: 'NOIR UNIT',
            looks: [
                {
                    id: 'noir-1',
                    name: 'Neo-Future Arc',
                    img: '/images/lookbook/cut/look-n1.png',
                    pins: [
                        { top: '35%', left: '49%', itemIndex: 0 },
                        { top: '65%', left: '52%', itemIndex: 1 },
                        { top: '93%', left: '49%', itemIndex: 2 }
                    ],
                    items: [
                        it('nf1-top', 'Áo thun', 'Neo-Future Arc Graphic Tee', 490000, '/images/lookbook/thumb/look-n1-top.webp', SZ_TOP, 'L', 'Đen Than Chì', '#111827'),
                        it('nf1-pant', 'Quần jeans', 'Quần Jeans Baggy Washed Black', 640000, '/images/lookbook/thumb/look-n1-pant.webp', SZ_PANT, '31', 'Đen Wash', '#374151'),
                        it('nf1-shoe', 'Sneaker', 'AIR FUTURE III – NEXUS X1', 4900000, '/images/lookbook/thumb/look-n1-shoe.webp', SZ_SHOE, '43', 'WHITE / ACID VOLT', '#84cc16')
                    ]
                },
                {
                    id: 'noir-2',
                    name: 'Shadow Drifter',
                    img: '/images/lookbook/cut/look-n2.png',
                    pins: [
                        { top: '34%', left: '50%', itemIndex: 0 },
                        { top: '65%', left: '46%', itemIndex: 1 },
                        { top: '93%', left: '50%', itemIndex: 2 }
                    ],
                    items: [
                        it('nf2-top', 'Hoodie', 'Technical Zip Hoodie Noir', 890000, '/images/lookbook/thumb/look-n2-top.webp', SZ_TOP, 'L', 'Đen Tối Giản', '#0f172a'),
                        it('nf2-pant', 'Quần cargo', 'Quần Parachute Tactical Noir', 680000, '/images/lookbook/thumb/look-n2-pant.webp', SZ_PANT, '31', 'Đen Nhám', '#1e293b'),
                        it('nf2-shoe', 'Sneaker', 'AIR FUTURE IX – SHADOW RUNNER', 4200000, '/images/lookbook/thumb/look-n2-shoe.webp', SZ_SHOE, '42', 'TRIPLE BLACK', '#000000')
                    ]
                },
                {
                    id: 'noir-3',
                    name: 'Cyber Matrix',
                    img: '/images/lookbook/cut/look-n3.png',
                    pins: [
                        { top: '35%', left: '50%', itemIndex: 0 },
                        { top: '66%', left: '52%', itemIndex: 1 },
                        { top: '93%', left: '50%', itemIndex: 2 }
                    ],
                    items: [
                        it('nf3-top', 'Áo thun', 'Acid Charcoal Boxy Tee', 520000, '/images/lookbook/thumb/look-n3-top.webp', SZ_TOP, 'L', 'Xám Loang Than', '#334155'),
                        it('nf3-pant', 'Quần jeans', 'Quần Jeans Distressed Grey', 590000, '/images/lookbook/thumb/look-n3-pant.webp', SZ_PANT, '30', 'Xám Chàm Loang', '#475569'),
                        it('nf3-shoe', 'Sneaker', 'AIR FUTURE V – CYBER OVERDRIVE', 4400000, '/images/lookbook/thumb/look-n3-shoe.webp', SZ_SHOE, '41', 'WHITE / BLACK', '#e2e8f0')
                    ]
                },
                {
                    id: 'noir-4',
                    name: 'Midnight Stride',
                    img: '/images/lookbook/cut/look-n4.png',
                    pins: [
                        { top: '33%', left: '50%', itemIndex: 0 },
                        { top: '64%', left: '50%', itemIndex: 1 },
                        { top: '93%', left: '50%', itemIndex: 2 }
                    ],
                    items: [
                        it('nf4-top', 'Áo nỉ', 'Graphic Crewneck Noir', 780000, '/images/lookbook/thumb/look-n4-top.webp', SZ_TOP, 'L', 'Đen Tuyền', '#111827'),
                        it('nf4-pant', 'Quần ống rộng', 'Quần Wide-Leg Navy Trousers', 640000, '/images/lookbook/thumb/look-n4-pant.webp', SZ_PANT, '31', 'Navy Đậm', '#1e3a5f'),
                        it('nf4-shoe', 'Sneaker', 'AIR FUTURE IV – NIGHT TRACK', 4500000, '/images/lookbook/thumb/look-n4-shoe.webp', SZ_SHOE, '42', 'BLACK / ANTHRACITE', '#111111')
                    ]
                }
            ]
        },
        sunwash: {
            id: 'sunwash',
            themeClass: 'theme-sunwash',
            title: 'SUN-WASHED',
            collectionName: 'SUN-WASHED',
            looks: [
                {
                    id: 'sun-1',
                    name: 'Cyanotype Artisan',
                    img: '/images/lookbook/cut/look-e1.png',
                    pins: [
                        { top: '35%', left: '49%', itemIndex: 0 },
                        { top: '65%', left: '49%', itemIndex: 1 },
                        { top: '94%', left: '50%', itemIndex: 2 }
                    ],
                    items: [
                        it('re1-top', 'Áo thun', 'Fern Tee – Dương Xỉ Xanh Chàm', 440000, '/images/lookbook/thumb/look-e1-top.webp', SZ_TOP, 'L', 'Trắng Ngà / Prussian', '#1d4ed8'),
                        it('re1-pant', 'Quần jeans', 'Quần Jeans Ống Rộng Vintage Washed', 540000, '/images/lookbook/thumb/look-e1-pant.webp', SZ_PANT, '31', 'Xanh Vintage (90s Blue)', '#3b82f6'),
                        it('re1-shoe', 'Sneaker', 'Retro Court Low – Gum Sole', 3600000, '/images/lookbook/thumb/look-e1-shoe.webp', SZ_SHOE, '42', 'WHITE / GUM', '#d97706')
                    ]
                },
                {
                    id: 'sun-2',
                    name: 'Heavyweight Selvedge',
                    img: '/images/lookbook/cut/look-e2.png',
                    pins: [
                        { top: '34%', left: '50%', itemIndex: 0 },
                        { top: '64%', left: '50%', itemIndex: 1 },
                        { top: '93%', left: '50%', itemIndex: 2 }
                    ],
                    items: [
                        it('re2-top', 'Áo thun', 'Heavy Cotton Crewneck Cát', 480000, '/images/lookbook/thumb/look-e2-top.webp', SZ_TOP, 'L', 'Be Cát Thô', '#d6c7b2'),
                        it('re2-pant', 'Quần jeans', 'Quần Jeans Raw Denim 14oz Chàm Đậm', 740000, '/images/lookbook/thumb/look-e2-pant.webp', SZ_PANT, '31', 'Chàm Đậm (Deep Indigo)', '#1e1b4b'),
                        it('re2-shoe', 'Sneaker', 'Suede Skate High – Earth', 2400000, '/images/lookbook/thumb/look-e2-shoe.webp', SZ_SHOE, '41', 'OATMEAL / GUM', '#b45309')
                    ]
                },
                {
                    id: 'sun-3',
                    name: 'Desert Workwear',
                    img: '/images/lookbook/cut/look-e3.png',
                    pins: [
                        { top: '35%', left: '49%', itemIndex: 0 },
                        { top: '65%', left: '51%', itemIndex: 1 },
                        { top: '93%', left: '50%', itemIndex: 2 }
                    ],
                    items: [
                        it('re3-top', 'Áo khoác', 'Boxy Khaki Workwear Overshirt', 690000, '/images/lookbook/thumb/look-e3-top.webp', SZ_TOP, 'L', 'Khaki Cát Nắng', '#d3b794'),
                        it('re3-pant', 'Quần xếp ly', 'Quần Pleated Sand Beige', 680000, '/images/lookbook/thumb/look-e3-pant.webp', SZ_PANT, '31', 'Be Cát Tự Nhiên', '#d5c9b6'),
                        it('re3-shoe', 'Sneaker', 'Retro Low-Top Chalk White Leather', 2900000, '/images/lookbook/thumb/look-e3-shoe.webp', SZ_SHOE, '42', 'CHALK WHITE', '#ffffff')
                    ]
                }
            ]
        }
    };

    var currentCollectionKey = 'noir';
    var activeLooks = [];
    var currentProgress = 0;
    var activeIndex = 0;

    var root, stage, runway, list, models = [];
    var isDragging = false, startX = 0, startProgress = 0, lastX = 0, velocity = 0, animId = null;

    function money(v) {
        return new Intl.NumberFormat('vi-VN').format(v) + ' ₫';
    }
    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }
    function pad(n) {
        return (n < 10 ? '0' : '') + n;
    }

    // ---------- Build Layout ----------
    function build(colKey) {
        currentCollectionKey = (colKey === 'sunwash' ? 'sunwash' : 'noir');
        var colData = COLLECTIONS[currentCollectionKey];
        activeLooks = colData.looks;
        bindCatalog();

        root = document.getElementById('lookbookRoot');
        if (!root) {
            root = document.createElement('div');
            root.id = 'lookbookRoot';
            document.body.appendChild(root);
        }

        root.className = 'lb-wrapper is-open ' + colData.themeClass;
        root.innerHTML =
            '<section class="lb-stage" id="lbStage">' +
              '<div class="lb-head">' +
                '<div class="lb-brand-signature">HnmtShop</div>' +
                '<div class="lb-brand-collection">BỘ SƯU TẬP • ' + esc(colData.title) + '</div>' +
              '</div>' +
              '<div class="lb-tools">' +
                '<button type="button" class="lb-bag-btn" id="lbCart" title="Túi đồ">' +
                  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
                    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>' +
                  '</svg>' +
                  '<span class="lb-bag-count" id="lbBadge">0</span>' +
                '</button>' +
                '<a href="/" class="lb-back-btn" id="lbClose" title="Quay lại trang chủ">' +
                  '<i class="bi bi-arrow-left"></i>' +
                  '<span>Quay lại</span>' +
                '</a>' +
              '</div>' +
              '<div class="lb-runway" id="lbRunway"></div>' +
            '</section>' +
            '<aside class="lb-side">' +
              '<div class="lb-side-head">' +
                '<h3>BỘ PHỐI HIỆN TẠI</h3>' +
                '<small id="lbCount">3 MÓN</small>' +
              '</div>' +
              '<div class="lb-side-look" id="lbLookName"></div>' +
              '<div class="lb-list" id="lbList"></div>' +
              '<div class="lb-foot">' +
                '<div class="lb-total"><span>Tổng cộng</span><b id="lbTotal">0 ₫</b></div>' +
                '<button type="button" class="lb-add" id="lbAddAll">' +
                  '<span>Thêm trọn bộ vào túi</span>' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
                '</button>' +
              '</div>' +
            '</aside>';

        stage = root.querySelector('#lbStage');
        runway = root.querySelector('#lbRunway');
        list = root.querySelector('#lbList');
        models = [];

        // Build 3D Models in Runway
        activeLooks.forEach(function (look, i) {
            var m = document.createElement('div');
            m.className = 'lb-model';
            m.dataset.index = i;

            // Micro-hotspot pins without numbers
            var pinsHtml = look.pins.map(function (pin, k) {
                var itm = look.items[pin.itemIndex || k];
                return '<div class="lb-hotspot" data-item="' + (pin.itemIndex || k) + '" style="top:' + pin.top + ';left:' + pin.left + '">' +
                    '<span class="lb-hotspot-radar"></span>' +
                    '<span class="lb-hotspot-circle"><span class="lb-hotspot-dot"></span></span>' +
                    '<div class="lb-hotspot-pop">' +
                      '<b class="lb-pop-name">' + esc(itm.name) + '</b>' +
                      '<span class="lb-pop-price">' + money(itm.price) + '</span>' +
                    '</div>' +
                  '</div>';
            }).join('');

            m.innerHTML =
                '<img src="' + look.img + '" alt="' + esc(look.name) + '" draggable="false">' +
                '<div class="lb-model-shadow"></div>' +
                pinsHtml;

            // Hotspot interaction
            m.querySelectorAll('.lb-hotspot').forEach(function (h) {
                var itemIdx = +h.dataset.item;
                h.addEventListener('mouseenter', function () { highlight(itemIdx, true); });
                h.addEventListener('mouseleave', function () { highlight(itemIdx, false); });
                h.addEventListener('click', function (e) {
                    e.stopPropagation();
                    highlight(itemIdx, true);
                    var card = list.children[itemIdx];
                    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            });

            // Clicking flanking model smoothly rotates to it
            m.addEventListener('click', function () {
                if (Math.abs(velocity) < 2 && Math.abs(currentProgress - i) > 0.3) {
                    smoothSnapTo(i);
                }
            });

            runway.appendChild(m);
            models.push(m);
        });

        // Event Listeners
        initGestures();
        root.querySelector('#lbCart').addEventListener('click', function (e) {
            e.preventDefault();
            if (window.HNMTCart) window.HNMTCart.open();
        });
        root.querySelector('#lbAddAll').addEventListener('click', addAll);
        window.addEventListener('resize', function () { updateLayout(currentProgress); });

        // Update Live Cart Badge
        updateBadge();

        // Initial Layout & Sidebar
        currentProgress = 0;
        activeIndex = 0;
        updateLayout(currentProgress);
        renderSidebar(0);
    }

    // ---------- 3D Turntable Layout Calculation ----------
    function updateLayout(prog) {
        if (!stage || models.length === 0) return;
        var N = activeLooks.length;
        var stageWidth = stage.clientWidth || 900;
        var Rx = Math.min(stageWidth * 0.40, 520);
        var Rz = 320;

        models.forEach(function (m, i) {
            var diff = i - prog;
            var offset = ((diff % N) + N) % N;
            if (offset > N / 2) offset -= N;

            // Angle around 3D cylinder
            var phi = offset * (2 * Math.PI / Math.max(N, 4));

            var X = Math.sin(phi) * Rx;
            var Z = (Math.cos(phi) - 1) * Rz;
            var scale = 0.65 + 0.35 * Math.pow((Math.cos(phi) + 1) / 2, 1.4);
            var opacity = Math.cos(phi) < -0.3 ? 0 : 0.4 + 0.6 * Math.pow((Math.cos(phi) + 1) / 2, 1.2);
            var blur = Math.max(0, (1 - Math.cos(phi)) * 3.5);
            var zIndex = Math.round((Math.cos(phi) + 1) * 50) + 1;
            var isCenter = Math.abs(offset) < 0.25;

            m.style.transform = 'translate3d(calc(-50% + ' + X.toFixed(1) + 'px), 0px, ' + Z.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
            m.style.opacity = opacity.toFixed(2);
            m.style.filter = blur > 0.4 ? 'blur(' + blur.toFixed(1) + 'px)' : 'none';
            m.style.zIndex = zIndex;
            m.style.pointerEvents = opacity < 0.25 ? 'none' : 'auto';
            m.classList.toggle('is-center', isCenter);

            var shadow = m.querySelector('.lb-model-shadow');
            if (shadow) {
                shadow.style.transform = 'scale(' + scale.toFixed(3) + ')';
                shadow.style.opacity = (0.32 * scale).toFixed(2);
            }
        });
    }

    // ---------- Gesture Drag / Swipe Engine (Smoothly Weighted) ----------
    function initGestures() {
        stage.addEventListener('pointerdown', function (e) {
            if (e.target.closest('.lb-tools, .lb-hotspot, a, button')) return;
            isDragging = true;
            startX = e.clientX;
            lastX = e.clientX;
            startProgress = currentProgress;
            velocity = 0;
            runway.classList.add('is-dragging');
            if (animId) cancelAnimationFrame(animId);
        });

        window.addEventListener('pointermove', function (e) {
            if (!isDragging) return;
            var dx = e.clientX - startX;
            velocity = e.clientX - lastX;
            lastX = e.clientX;

            // Damping: 680px drag moves 1 full look (smooth, weighted, luxury turntable)
            currentProgress = startProgress - (dx / 680);
            updateLayout(currentProgress);
        });

        function handlePointerUp() {
            if (!isDragging) return;
            isDragging = false;
            runway.classList.remove('is-dragging');

            // Refined kinetic momentum snap
            var target = Math.round(currentProgress - velocity * 0.035);
            smoothSnapTo(target);
        }

        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);

        // Trackpad / Wheel Swipe with debounce
        var wheelLock = 0;
        stage.addEventListener('wheel', function (e) {
            var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (Math.abs(d) < 25 || Date.now() - wheelLock < 650) return;
            wheelLock = Date.now();
            smoothSnapTo(Math.round(currentProgress) + (d > 0 ? 1 : -1));
        }, { passive: true });

        // Keyboard Navigation
        window.addEventListener('keydown', function (e) {
            if (!root.classList.contains('is-open')) return;
            if (e.key === 'ArrowLeft') { smoothSnapTo(Math.round(currentProgress) - 1); }
            else if (e.key === 'ArrowRight') { smoothSnapTo(Math.round(currentProgress) + 1); }
            else if (e.key === 'Escape') {
                window.location.href = '/';
            }
        });
    }

    // Smooth Spring Snap Animation
    function smoothSnapTo(targetIndex) {
        if (animId) cancelAnimationFrame(animId);
        var startP = currentProgress;
        var endP = targetIndex;
        var startTime = performance.now();
        var duration = 620; // ms

        // Smooth cubic-bezier ease out
        function easeOutCubic(t) {
            return (--t) * t * t + 1;
        }

        function frame(now) {
            var elapsed = now - startTime;
            var p = Math.min(1, elapsed / duration);
            currentProgress = startP + (endP - startP) * easeOutCubic(p);
            updateLayout(currentProgress);

            if (p < 1) {
                animId = requestAnimationFrame(frame);
            } else {
                currentProgress = endP;
                updateLayout(currentProgress);
                var N = activeLooks.length;
                var normalizedIdx = ((endP % N) + N) % N;
                if (normalizedIdx !== activeIndex) {
                    activeIndex = normalizedIdx;
                    renderSidebar(activeIndex);
                }
            }
        }
        animId = requestAnimationFrame(frame);
    }

    // ---------- Synchronized Highlight ----------
    function highlight(itemIdx, on) {
        var card = list.children[itemIdx];
        if (card) card.classList.toggle('is-highlighted', on);
        var activeModel = models[activeIndex];
        if (activeModel) {
            var pin = activeModel.querySelector('.lb-hotspot[data-item="' + itemIdx + '"]');
            if (pin) pin.classList.toggle('is-highlighted', on);
        }
    }

    // ---------- Sidebar: Clean Editorial Layout ----------
    function renderSidebar(idx) {
        var look = activeLooks[idx];
        if (!look) return;

        root.querySelector('#lbLookName').textContent = 'LOOK ' + pad(idx + 1) + ' · ' + look.name.toUpperCase();
        root.querySelector('#lbCount').textContent = look.items.length + ' MÓN';

        list.innerHTML = '';
        var total = 0;

        look.items.forEach(function (item, k) {
            var price = getVariant(item)?.price ?? item.price;
            total += price;
            var el = document.createElement('div');
            el.className = 'lb-item';
            el.innerHTML =
                '<div class="lb-thumb"><img src="' + item.image + '" alt="' + esc(item.name) + '"></div>' +
                '<div class="lb-info">' +
                  '<div class="lb-cat">' + esc(item.cat) + '</div>' +
                  '<div class="lb-name" title="' + esc(item.name) + '">' + esc(item.name) + '</div>' +
                  '<div class="lb-sizes">' +
                    item.sizes.map(function (s) {
                        return '<button type="button" class="lb-size' + (s === item.size ? ' active' : '') + '" data-s="' + esc(s) + '"' + (getVariant(item, s)?.stock > 0 ? '' : ' disabled') + '>' + esc(s) + '</button>';
                    }).join('') +
                  '</div>' +
                  '<div class="lb-row">' +
                    '<span class="lb-price">' + money(price) + '</span>' +
                    '<button type="button" class="lb-plus" title="Thêm vào túi"' + (getVariant(item)?.stock > 0 ? '' : ' disabled') + '>+</button>' +
                  '</div>' +
                '</div>';

            el.addEventListener('mouseenter', function () { highlight(k, true); });
            el.addEventListener('mouseleave', function () { highlight(k, false); });

            // Size selection
            el.querySelectorAll('.lb-size').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    item.size = btn.dataset.s;
                    renderSidebar(idx);
                });
            });

            // Single item Add to Cart
            var plusBtn = el.querySelector('.lb-plus');
            plusBtn.addEventListener('click', async function () {
                plusBtn.disabled = true;
                var added = await addToCart(item);
                plusBtn.disabled = false;
                if (!added) return;
                plusBtn.classList.add('is-added');
                plusBtn.textContent = '✓';
                updateBadge();
                setTimeout(function () {
                    plusBtn.classList.remove('is-added');
                    plusBtn.textContent = '+';
                }, 1000);
            });

            list.appendChild(el);
        });

        root.querySelector('#lbTotal').textContent = money(total);
        root.querySelector('#lbAddAll').disabled = look.items.some(function (item) { return !(getVariant(item)?.stock > 0); });
    }

    function bindCatalog() {
        var catalogEl = document.getElementById('showroomCatalog');
        if (!catalogEl) return;
        var catalog = JSON.parse(catalogEl.textContent);
        var linkedSlugs = { 'nf1-shoe': 'snk-03', 're1-top': 'fern-tee' };
        activeLooks.forEach(function (look) {
            look.items.forEach(function (item) {
                item.product = catalog.lookbook?.[linkedSlugs[item.id] || 'lookbook-' + item.id];
                var selected = getVariant(item);
                if (!selected?.stock) {
                    item.size = item.sizes.find(function (size) { return getVariant(item, size)?.stock > 0; }) || item.size;
                }
            });
        });
    }

    function getVariant(item, size) {
        var product = item.product;
        return product?.variants[0]?.[product.sizes.indexOf(size || item.size)];
    }

    // ---------- Cart Integration ----------
    function updateBadge() {
        var el = root && root.querySelector('#lbBadge');
        if (el && window.HNMTCart) {
            el.textContent = window.HNMTCart.getCount() || 0;
        }
    }

    function addToCart(item) {
        var variant = getVariant(item);
        if (!variant?.stock) return false;
        return window.HNMTCart?.addItem({
            name: item.name,
            productId: item.product.productId,
            variantId: variant.id,
            quantity: 1
        });
    }

    async function addAll() {
        var btn = root.querySelector('#lbAddAll');
        var look = activeLooks[activeIndex];
        var selected = look.items.map(function (item) { return { ...item }; });
        btn.disabled = true;
        try {
            for (var item of selected) {
                if (!await addToCart(item)) return;
            }
            updateBadge();
        } finally {
            btn.disabled = activeLooks[activeIndex].items.some(function (item) { return !(getVariant(item)?.stock > 0); });
        }
    }

    // ---------- Initialization ----------
    function init() {
        var isLookbookPage = /\/lookbook|\/collections/i.test(window.location.pathname);

        // NẾU KHÔNG PHẢI TRANG /lookbook THÌ XÓA NGAY LẬP TỨC ĐỂ KHÔNG CHẶN TRANG CHỦ!
        if (!isLookbookPage) {
            var stray = document.getElementById('lookbookRoot');
            if (stray) {
                stray.remove();
            }
            // Vẫn gắn sự kiện click cho thẻ để điều hướng sang trang Lookbook
            document.querySelectorAll('[data-open-lookbook], a[href*="#lookbook-"]').forEach(function (el) {
                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    var th = el.dataset.openLookbook || ((el.getAttribute('href') || '').indexOf('sunwash') !== -1 ? 'sunwash' : 'noir');
                    window.location.href = '/lookbook?theme=' + th;
                });
            });
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var requestedTheme = params.get('theme') || 'noir';
        var rootEl = document.getElementById('lookbookRoot');
        if (rootEl && rootEl.dataset.theme) {
            requestedTheme = rootEl.dataset.theme;
        }

        build(requestedTheme);

        window.HNMTLookbook = {
            open: function (theme) {
                build(theme || 'noir');
            },
            close: function () {
                window.location.href = '/';
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
