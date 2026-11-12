/**
 * HNMT ATELIER — "TRY THE LOOK"
 * Light studio · cut-out models · circular (infinite) runway · hotspot pins · HNMTCart
 */
(function () {
    'use strict';
    if (window.HNMTLookbook) return;

    var COL = {
        noir: { label: 'NOIR UNIT', sub: 'Đen tuyền đô thị · Mono streetwear' },
        sunwash:  { label: 'SUN-WASHED', sub: 'Denim bạc màu · Sắc cát nắng' }
    };
    var PINS = [{ top: '30%', left: '50%' }, { top: '62%', left: '50%' }, { top: '93%', left: '50%' }];
    var TOPS = '/images/products/clothes/', PANTS = '/images/pants/', SNK = '/images/sneakers/', SHOES = '/images/products/shoes/';
    var SZ_TOP = ['S', 'M', 'L', 'XL'], SZ_PANT = ['29', '30', '31', '32'], SZ_SHOE = ['40', '41', '42', '43'];

    function it(id, cat, name, price, image, sizes, size, color, dot) {
        return { id: id, cat: cat, name: name, price: price, image: image, sizes: sizes, size: size, color: color, dot: dot };
    }

    // One continuous circular runway: 4 Nightfall looks → 3 Raw Earth looks
    var LOOKS = [
        { col: 'noir', name: 'Neo-Future Arc', img: '/images/lookbook/cut/look-n1.png', items: [
            it('nf1-top', 'Áo thun', 'Neo-Future Arc Graphic Tee', 490000, TOPS + 'distressed-graphic-tee.png', SZ_TOP, 'L', 'Đen Than Chì', '#111827'),
            it('nf1-pant', 'Quần jeans', 'Quần Jeans Baggy Washed Black', 640000, PANTS + 'cargo-acid-wash.png', SZ_PANT, '31', 'Đen Wash', '#374151'),
            it('nf1-shoe', 'Sneaker', 'AIR FUTURE III – NEXUS X1', 4900000, SNK + 'air-future-iii.webp', SZ_SHOE, '43', 'WHITE / ACID VOLT / BLACK', '#84cc16')] },
        { col: 'noir', name: 'Shadow Drifter', img: '/images/lookbook/cut/look-n2.png', items: [
            it('nf2-top', 'Hoodie', 'Technical Zip Hoodie Noir', 890000, TOPS + 'heavyweight-boxy-hoodie.png', SZ_TOP, 'L', 'Đen Tối Giản', '#0f172a'),
            it('nf2-pant', 'Quần cargo', 'Quần Parachute Tactical Noir', 680000, PANTS + 'raw-selvedge-black.png', SZ_PANT, '31', 'Đen Nhám', '#1e293b'),
            it('nf2-shoe', 'Sneaker', 'AIR FUTURE IX – SHADOW RUNNER', 4200000, SNK + 'air-future-ix.webp', SZ_SHOE, '42', 'STEALTH TRIPLE BLACK', '#000000')] },
        { col: 'noir', name: 'Cyber Matrix', img: '/images/lookbook/cut/look-n3.png', items: [
            it('nf3-top', 'Áo thun', 'Acid Charcoal Boxy Tee', 520000, TOPS + 'vintage-washed-boxy-tee.png', SZ_TOP, 'L', 'Xám Loang Than', '#334155'),
            it('nf3-pant', 'Quần jeans', 'Quần Jeans Distressed Grey', 590000, PANTS + 'cargo-acid-wash.png', SZ_PANT, '30', 'Xám Chàm Loang', '#475569'),
            it('nf3-shoe', 'Sneaker', 'AIR FUTURE V – CYBER OVERDRIVE', 4400000, SNK + 'air-future-v.webp', SZ_SHOE, '41', 'WHITE / BLACK', '#e2e8f0')] },
        { col: 'noir', name: 'Midnight Stride', img: '/images/lookbook/cut/look-n4.png', items: [
            it('nf4-top', 'Áo nỉ', 'Graphic Crewneck Noir', 780000, TOPS + 'fleece-vintage-crewneck.png', SZ_TOP, 'L', 'Đen Tuyền', '#111827'),
            it('nf4-pant', 'Quần ống rộng', 'Quần Wide-Leg Navy Trousers', 640000, PANTS + 'wide-leg-denim.png', SZ_PANT, '31', 'Navy Đậm', '#1e3a5f'),
            it('nf4-shoe', 'Sneaker', 'AIR FUTURE IV – NIGHT TRACK', 4500000, SNK + 'air-future-iv.webp', SZ_SHOE, '42', 'BLACK / ANTHRACITE', '#111111')] },
        { col: 'sunwash', name: 'Cyanotype Artisan', img: '/images/lookbook/cut/look-e1.png', items: [
            it('re1-top', 'Áo thun', 'Fern Tee – Dương Xỉ Xanh Chàm', 440000, TOPS + 'oversize-streetwear-tee-white.png', SZ_TOP, 'L', 'Trắng Ngà / Prussian', '#1d4ed8'),
            it('re1-pant', 'Quần jeans', 'Quần Jeans Ống Rộng Vintage Washed', 540000, PANTS + 'wide-leg-denim.png', SZ_PANT, '31', 'Xanh Vintage (90s Blue)', '#3b82f6'),
            it('re1-shoe', 'Sneaker', 'Retro Court Low – Gum Sole', 3600000, SHOES + 'nike-dunk-low-retro.png', SZ_SHOE, '42', 'WHITE / GUM', '#d97706')] },
        { col: 'sunwash', name: 'Heavyweight Selvedge', img: '/images/lookbook/cut/look-e2.png', items: [
            it('re2-top', 'Áo thun', 'Heavy Cotton Crewneck Cát', 480000, TOPS + 'vintage-washed-boxy-tee.png', SZ_TOP, 'L', 'Be Cát Thô', '#d6c7b2'),
            it('re2-pant', 'Quần jeans', 'Quần Jeans Raw Denim 14oz Chàm Đậm', 740000, PANTS + 'raw-selvedge-black.png', SZ_PANT, '31', 'Chàm Đậm (Deep Indigo)', '#1e1b4b'),
            it('re2-shoe', 'Sneaker', 'Suede Skate High – Earth', 2400000, SHOES + 'converse-chuck-70-high.png', SZ_SHOE, '41', 'OATMEAL / GUM', '#b45309')] },
        { col: 'sunwash', name: 'Desert Workwear', img: '/images/lookbook/cut/look-e3.png', items: [
            it('re3-top', 'Áo khoác', 'Boxy Khaki Workwear Overshirt', 690000, TOPS + 'varsity-bomber-jacket.png', SZ_TOP, 'L', 'Khaki Đất', '#a3825a'),
            it('re3-pant', 'Quần xếp ly', 'Quần Pleated Sand Beige', 680000, PANTS + 'pleated-sand-beige.png', SZ_PANT, '31', 'Be Cát Tự Nhiên', '#d5c9b6'),
            it('re3-shoe', 'Sneaker', 'Retro Low-Top Leather', 2900000, SHOES + 'nike-air-force-1-low.png', SZ_SHOE, '42', 'CHALK WHITE', '#f8fafc')] }
    ];
    // Product thumbnails = crops of the exact garments worn in each look
    LOOKS.forEach(function (look) {
        var key = look.img.split('/').pop().replace('.png', '');
        look.items.forEach(function (item, k) {
            item.image = '/images/lookbook/thumb/' + key + '-' + ['top', 'pant', 'shoe'][k] + '.png';
        });
    });
    var N = LOOKS.length, HALF = Math.floor(N / 2);
    var CFG = [ // by |offset|: x (fraction of stage width), scale, blur(px), opacity
        { x: 0,    s: 1,    b: 0, o: 1 },
        { x: .215, s: .8,   b: 1.2, o: .92 },
        { x: .39,  s: .64,  b: 2.6, o: .55 },
        { x: .52,  s: .5,   b: 4, o: 0 }
    ];

    var active = 0, root, stage, runway, list, models = [], prevOff = [];

    function money(v) { return new Intl.NumberFormat('vi-VN').format(v) + ' ₫'; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function offsetOf(i) { var o = ((i - active) % N + N) % N; return o > HALF ? o - N : o; }

    // ---------- build DOM ----------
    function build() {
        root = document.getElementById('lookbookRoot');
        if (!root) { root = document.createElement('div'); root.id = 'lookbookRoot'; document.body.appendChild(root); }
        root.className = 'lb-wrapper';
        root.innerHTML =
            '<section class="lb-stage" id="lbStage">' +
              '<div class="lb-head"><h2 class="lb-title">Try the Look.</h2><p class="lb-sub" id="lbSub"></p></div>' +
              '<div class="lb-tools">' +
                '<div class="lb-switch" id="lbSwitch">' +
                  '<button type="button" data-col="noir">NOIR UNIT</button>' +
                  '<button type="button" data-col="sunwash">SUN-WASHED</button>' +
                '</div>' +
                '<button type="button" class="rail-bag-btn lb-cart-btn" id="lbCart" title="Giỏ hàng">' +
                  '<svg fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24" width="19" height="20" style="display:block;">' +
                    '<path d="M4 8h16l-1 13H5L4 8Z" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '<path d="M9 9V6a3 3 0 0 1 6 0v3" stroke-linecap="round" stroke-linejoin="round"/>' +
                  '</svg>' +
                  '<span class="rail-bag-count" id="lbBadge">0</span></button>' +
                '<button type="button" class="lb-icon-btn" id="lbClose" title="Đóng (Esc)">' +
                  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
              '</div>' +
              '<div class="lb-runway" id="lbRunway"></div>' +
              '<div class="lb-hint">Chạm vào chấm để xem món đồ</div>' +
              '<div class="lb-nav">' +
                '<button type="button" class="lb-arrow" id="lbPrev" aria-label="Trước">←</button>' +
                '<div class="lb-steps" id="lbSteps"></div>' +
                '<button type="button" class="lb-arrow" id="lbNext" aria-label="Sau">→</button>' +
              '</div>' +
            '</section>' +
            '<aside class="lb-side">' +
              '<div class="lb-side-head"><h3>Phối đồ này gồm</h3><small id="lbCount">3 món</small></div>' +
              '<div class="lb-side-look" id="lbLookName"></div>' +
              '<div class="lb-list" id="lbList"></div>' +
              '<div class="lb-foot">' +
                '<div class="lb-total"><span>Trọn bộ outfit</span><b id="lbTotal">0 ₫</b></div>' +
                '<button type="button" class="lb-add" id="lbAddAll"><span>Thêm trọn bộ vào túi</span><span>→</span></button>' +
              '</div>' +
            '</aside>';

        stage = root.querySelector('#lbStage');
        runway = root.querySelector('#lbRunway');
        list = root.querySelector('#lbList');

        // models
        LOOKS.forEach(function (look, i) {
            var m = document.createElement('div');
            m.className = 'lb-model';
            var pins = look.items.map(function (item, k) {
                return '<div class="lb-pin" data-pin="' + k + '" style="top:' + PINS[k].top + ';left:' + PINS[k].left + '">' + (k + 1) +
                    '<div class="lb-tip"><b>' + esc(item.name) + '</b><span>' + money(item.price) + '</span></div></div>';
            }).join('');
            m.innerHTML = '<img src="' + look.img + '" alt="' + esc(look.name) + '" draggable="false">' + pins;
            m.addEventListener('click', function () { if (offsetOf(i) !== 0) goTo(i); });
            m.querySelectorAll('.lb-pin').forEach(function (p) {
                var k = +p.dataset.pin;
                p.addEventListener('mouseenter', function () { hl(k, true); });
                p.addEventListener('mouseleave', function () { hl(k, false); });
                p.addEventListener('click', function (e) {
                    e.stopPropagation(); hl(k, true);
                    var c = list.children[k]; if (c) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            });
            runway.appendChild(m); models.push(m); prevOff.push(offsetOf(i));
        });

        // steps
        var steps = root.querySelector('#lbSteps');
        LOOKS.forEach(function (look, i) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'lb-step';
            b.innerHTML = '<i></i><span>' + pad(i + 1) + '</span>';
            b.addEventListener('click', function () { goTo(i); });
            steps.appendChild(b);
        });

        // events
        root.querySelector('#lbPrev').addEventListener('click', function () { goTo(active - 1); });
        root.querySelector('#lbNext').addEventListener('click', function () { goTo(active + 1); });
        root.querySelector('#lbClose').addEventListener('click', close);
        root.querySelector('#lbCart').addEventListener('click', function () { if (window.HNMTCart) window.HNMTCart.open(); });
        root.querySelector('#lbAddAll').addEventListener('click', addAll);
        root.querySelectorAll('#lbSwitch button').forEach(function (b) {
            b.addEventListener('click', function () {
                var i = LOOKS.findIndex(function (l) { return l.col === b.dataset.col; });
                if (i >= 0) goTo(i);
            });
        });

        // drag / swipe + wheel
        var sx = null;
        stage.addEventListener('pointerdown', function (e) { if (e.target.closest('.lb-tools,.lb-nav,.lb-pin')) return; sx = e.clientX; });
        window.addEventListener('pointerup', function (e) {
            if (sx === null) return;
            var dx = e.clientX - sx; sx = null;
            if (Math.abs(dx) > 60) goTo(active + (dx < 0 ? 1 : -1));
        });
        var wl = 0;
        stage.addEventListener('wheel', function (e) {
            var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (Math.abs(d) < 25 || Date.now() - wl < 650) return;
            wl = Date.now(); goTo(active + (d > 0 ? 1 : -1));
        }, { passive: true });
        window.addEventListener('keydown', function (e) {
            if (!root.classList.contains('is-open')) return;
            if (e.key === 'ArrowLeft') goTo(active - 1);
            else if (e.key === 'ArrowRight') goTo(active + 1);
            else if (e.key === 'Escape') close();
        });
        window.addEventListener('resize', layout);
    }

    // ---------- layout (circular) ----------
    function layout() {
        if (!stage) return;
        var W = stage.clientWidth;
        models.forEach(function (m, i) {
            var o = offsetOf(i), a = Math.min(Math.abs(o), 3), c = CFG[a], sign = o < 0 ? -1 : 1;
            var jump = Math.abs(o - prevOff[i]) > 3;
            if (jump) m.classList.add('is-jump');
            m.style.transform = 'translateX(calc(-50% + ' + Math.round(sign * c.x * W) + 'px)) translateY(' + (-a * 6) + 'px) scale(' + c.s + ')';
            m.style.filter = c.b ? 'blur(' + c.b + 'px)' : 'none';
            m.style.opacity = c.o;
            m.style.zIndex = 10 - a;
            m.style.pointerEvents = a >= 3 ? 'none' : 'auto';
            m.classList.toggle('is-active', o === 0);
            if (jump) { void m.offsetWidth; m.classList.remove('is-jump'); }
            prevOff[i] = o;
        });
    }

    function hl(k, on) {
        var c = list.children[k]; if (c) c.classList.toggle('hl', on);
        var p = models[active].querySelectorAll('.lb-pin')[k]; if (p) p.classList.toggle('hl', on);
    }

    // ---------- sidebar ----------
    function renderSide() {
        var look = LOOKS[active], total = 0;
        root.querySelector('#lbLookName').textContent = 'LOOK ' + pad(active + 1) + ' · ' + look.name.toUpperCase() + ' · ' + COL[look.col].label;
        root.querySelector('#lbCount').textContent = look.items.length + ' món';
        list.innerHTML = '';
        look.items.forEach(function (item, k) {
            total += item.price;
            var el = document.createElement('div');
            el.className = 'lb-item';
            el.innerHTML =
                '<div class="lb-thumb"><img src="' + item.image + '" alt=""></div>' +
                '<div class="lb-info"><div class="lb-cat">' + esc(item.cat) + '</div>' +
                '<div class="lb-name" title="' + esc(item.name) + '">' + esc(item.name) + '</div>' +
                '<div class="lb-sizes">' + item.sizes.map(function (s) { return '<button type="button" class="lb-size' + (s === item.size ? ' active' : '') + '" data-s="' + s + '">' + s + '</button>'; }).join('') + '</div>' +
                '<div class="lb-row"><span class="lb-price">' + money(item.price) + '</span><button type="button" class="lb-plus" title="Thêm vào túi">+</button></div></div>';
            el.addEventListener('mouseenter', function () { hl(k, true); });
            el.addEventListener('mouseleave', function () { hl(k, false); });
            el.querySelectorAll('.lb-size').forEach(function (b) {
                b.addEventListener('click', function () {
                    item.size = b.dataset.s;
                    el.querySelectorAll('.lb-size').forEach(function (x) { x.classList.toggle('active', x === b); });
                });
            });
            el.querySelector('.lb-plus').addEventListener('click', function () { addToCart(item); badge(); if (window.HNMTCart) window.HNMTCart.open(); });
            list.appendChild(el);
        });
        root.querySelector('#lbTotal').textContent = money(total);
    }

    function renderChrome() {
        var look = LOOKS[active];
        root.classList.remove('theme-noir', 'theme-sunwash');
        root.classList.add('theme-' + look.col);
        root.querySelector('#lbSub').textContent = LOOKS.length + ' looks, styled head to toe — ' + COL[look.col].sub;
        root.querySelectorAll('#lbSwitch button').forEach(function (b) { b.classList.toggle('active', b.dataset.col === look.col); });
        root.querySelectorAll('.lb-step').forEach(function (b, i) {
            b.classList.toggle('active', i === active);
            b.querySelector('span').textContent = pad(i + 1) + (i === active ? '  ' + LOOKS[i].name : '');
        });
    }

    function goTo(i) { active = ((i % N) + N) % N; layout(); renderChrome(); renderSide(); }

    // ---------- cart ----------
    function badge() {
        var el = root && root.querySelector('#lbBadge');
        if (el && window.HNMTCart) el.textContent = window.HNMTCart.getCount() || 0;
    }
    function addToCart(item) {
        if (!window.HNMTCart) return;
        window.HNMTCart.addItem({ slug: item.id, id: item.id, name: item.name, price: item.price, image: item.image, size: item.size, color: item.color, colorDot: item.dot, quantity: 1 });
    }
    function addAll() {
        if (!window.HNMTCart) return;
        var btn = root.querySelector('#lbAddAll');
        LOOKS[active].items.forEach(addToCart);
        badge();
        btn.classList.add('done'); btn.firstChild.textContent = 'Đã thêm trọn bộ';
        setTimeout(function () {
            btn.classList.remove('done'); btn.firstChild.textContent = 'Thêm trọn bộ vào túi';
            window.HNMTCart.open();
        }, 450);
    }

    // ---------- open / close ----------
    function open(col) {
        var i = col ? LOOKS.findIndex(function (l) { return l.col === col; }) : active;
        root.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        prevOff = models.map(function (_, k) { return offsetOf(k); });
        goTo(i < 0 ? 0 : i);
        badge();
    }
    function close() {
        if (/\/lookbook/i.test(location.pathname)) { location.href = '/'; return; }
        root.classList.remove('is-open');
        document.body.style.overflow = '';
        if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    }

    function init() {
        build();
        window.HNMTLookbook = { open: open, close: close, goTo: goTo };
        document.querySelectorAll('[data-open-lookbook]').forEach(function (el) {
            el.addEventListener('click', function (e) { e.preventDefault(); open(el.dataset.openLookbook); });
        });
        var p = new URLSearchParams(location.search).get('theme');
        if (/\/lookbook|\/collections/i.test(location.pathname)) open(p === 'sunwash' ? 'sunwash' : 'noir');
        else if (location.hash === '#lookbook-noir') open('noir');
        else if (location.hash === '#lookbook-sunwash') open('sunwash');
        goTo(active);
        badge();
        window.addEventListener('hnmt:cart:updated', badge);
        LOOKS.forEach(function (l) { var im = new Image(); im.src = l.img; });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
