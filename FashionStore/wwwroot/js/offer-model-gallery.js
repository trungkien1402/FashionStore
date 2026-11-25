(() => {
    const gallery = document.querySelector('.offer-model-gallery');
    const track = gallery?.querySelector('.offer-model-track');
    if (!track || !track.children.length) return;

    const saleData = JSON.parse(document.getElementById("offerSaleData")?.textContent || "null");
    const preview = gallery.closest('[data-sale-preview]')?.dataset.salePreview === 'true';
    const slides = [...track.children];
    const dialog = gallery.parentElement.querySelector('.offer-shop');
    document.body.append(dialog);
    const items = dialog.querySelector('.offer-shop-items');
    const total = dialog.querySelector('.offer-shop-total');
    const addAll = dialog.querySelector('.offer-shop-all');
    const feedback = dialog.querySelector('[role="status"]');
    let cards = [];
    let purchasing = false;
    const catalog = JSON.parse(document.getElementById('showroomCatalog')?.textContent || '{}');
    const shoes = Object.values(catalog.shoes || {}).flat().flatMap(group => group.items);
    const looks = [
        [['women-heels-edition-01', 74, 90]],
        [['lookbook-noir-woman-2-top', 50, 31], ['lookbook-noir-woman-2-pant', 52, 62], ['lookbook-noir-woman-2-shoe', 52, 94]],
        [['lookbook-sunwash-woman-1-top', 50, 31], ['lookbook-sunwash-woman-1-pant', 52, 62], ['lookbook-sunwash-woman-1-shoe', 52, 94]]
    ];
    const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    const displayPrice = product => product.variants?.[0]?.find(variant => variant?.stock > 0)?.price
        ?? product.variants?.[0]?.find(Boolean)?.price
        ?? (product.kind === 'giay' ? product.price : product.price * 10000);

    function renderPrice(element, variant, price) {
        const current = document.createElement('span');
        current.textContent = currency.format(price);
        element.replaceChildren(current);
        if (typeof variant?.originalPrice === 'number' && variant.originalPrice > price) {
            const original = document.createElement('del');
            original.className = 'offer-original-price';
            original.textContent = currency.format(variant.originalPrice);
            current.className = 'offer-discount-price';
            element.prepend(original);
        }
    }
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const count = slides.length;
    let position = 0;
    let target = 0;
    let animation;
    let drag;
    let autoTimer;
    let visible = false;

    function scheduleAuto() {
        clearTimeout(autoTimer);
        if (count < 2 || !visible || document.hidden || drag || animation || dialog.open || reducedMotion.matches ||
            gallery.querySelector('.offer-pin:hover, .offer-pin:focus-visible')) return;
        autoTimer = setTimeout(() => snap(target + 1), 3000);
    }

    function render() {
        const radius = track.clientWidth * .28;
        const active = ((Math.round(position) % count) + count) % count;
        slides.forEach((slide, index) => {
            const angle = (index - position) * 2 * Math.PI / count;
            const depth = (Math.cos(angle) + 1) / 2;
            const offset = ((index - position + count / 2) % count + count) % count - count / 2;
            const visibility = Math.max(0, 1 - Math.abs(offset));
            const x = Math.sin(angle) * radius;
            const scale = .63 + depth * .37;
            slide.style.transform = `translateX(calc(-50% + ${x}px)) scale(${scale})`;
            slide.style.opacity = String(visibility * visibility * (3 - 2 * visibility));
            slide.style.filter = `blur(${(1 - depth) * 3}px)`;
            slide.style.zIndex = String(Math.round(depth * 100));
            slide.setAttribute('aria-hidden', String(index !== active));
            const atRest = index === active && Math.abs(offset) < .001 && !drag;
            const image = slide.querySelector('img');
            slide.querySelectorAll('.offer-pin').forEach(pin => {
                pin.hidden = !atRest;
                if (!saleData || !image.naturalWidth || !atRest) return;
                const fit = Math.min(image.clientWidth / image.naturalWidth, image.clientHeight / image.naturalHeight);
                const width = image.naturalWidth * fit;
                const height = image.naturalHeight * fit;
                pin.style.setProperty('--offer-x', ((image.clientWidth - width) / 2 + width * Number(pin.dataset.x) / 100) + 'px');
                pin.style.setProperty('--offer-y', (image.clientHeight - height + height * Number(pin.dataset.y) / 100) + 'px');
            });
        });
    }

    function snap(next) {
        clearTimeout(autoTimer);
        cancelAnimationFrame(animation);
        target = next;
        const start = position;
        const began = performance.now();

        function frame(now) {
            const progress = reducedMotion.matches ? 1 : Math.min(1, (now - began) / 580);
            position = start + (target - start) * (1 - (1 - progress) ** 3);
            render();
            if (progress < 1) animation = requestAnimationFrame(frame);
            else {
                position = target = ((target % count) + count) % count;
                animation = undefined;
                scheduleAuto();
            }
        }

        animation = requestAnimationFrame(frame);
    }

    track.addEventListener('pointerdown', event => {
        if (count < 2 || drag || !event.isPrimary || event.button !== 0) return;
        clearTimeout(autoTimer);
        cancelAnimationFrame(animation);
        animation = undefined;
        drag = { id: event.pointerId, x: event.clientX, position };
        track.setPointerCapture(event.pointerId);
        gallery.classList.add('is-dragging');
    });

    track.addEventListener('pointermove', event => {
        if (drag?.id !== event.pointerId) return;
        const distance = (drag.x - event.clientX) / Math.max(120, track.clientWidth * .45);
        position = drag.position + Math.max(-1, Math.min(1, distance));
        render();
    });

    function settle(event) {
        if (drag?.id !== event.pointerId) return;
        const distance = position - drag.position;
        const next = event.type === 'pointerup' && Math.abs(distance) > .18
            ? Math.round(drag.position) + Math.sign(distance)
            : Math.round(position);
        drag = null;
        gallery.classList.remove('is-dragging');
        snap(next);
    }

    track.addEventListener('pointerup', settle);
    track.addEventListener('pointercancel', settle);
    track.addEventListener('lostpointercapture', settle);
    gallery.addEventListener('keydown', event => {
        if (count < 2 || drag || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        snap(target + (event.key === 'ArrowRight' ? 1 : -1));
    });

    dialog.querySelector('.offer-shop-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', scheduleAuto);
    gallery.addEventListener('focusout', () => setTimeout(scheduleAuto, 0));

    function updatePurchase() {
        total.textContent = currency.format(cards.reduce((sum, card) => sum + card.price, 0));
        addAll.disabled = preview || purchasing || !cards.length || cards.some(card => !card.line);
        cards.forEach(card => { card.button.disabled = preview || purchasing || !card.line; });
    }

    async function purchase(selection) {
        if (preview || purchasing || selection.some(card => !card.line)) return;
        const lines = selection.map(card => card.line);
        purchasing = true;
        feedback.textContent = '';
        updatePurchase();
        let added = 0;
        try {
            for (const line of lines) {
                if (!await window.HNMTCart?.addItem(line)) break;
                added++;
            }
        } catch {
            // Report the number actually added, including when a later request fails.
        } finally {
            purchasing = false;
            updatePurchase();
        }
        if (added > 0) dialog.close();
        if (added !== lines.length) {
            const notice = document.getElementById('hnmtCartError');
            const message = `Đã thêm ${added}/${lines.length} món. Kiểm tra giỏ trước khi thử lại.`;
            if (added > 0 && notice) {
                notice.textContent = message;
                notice.hidden = false;
            } else feedback.textContent = message;
        }
    }
    addAll.addEventListener('click', () => purchase(cards));

    function productCard(product) {
        const card = document.createElement('article');
        card.className = 'lb-item';
        card.innerHTML = '<div class="lb-thumb"><img alt=""></div><div class="lb-info"><div class="lb-cat"></div>'
            + '<h3 class="lb-name"></h3><div class="lb-sizes"></div><div class="lb-row"><strong class="lb-price"></strong>'
            + '<button type="button" class="lb-plus" aria-label="Thêm vào giỏ" disabled>+</button></div>'
            + '<p class="small mb-0 mt-2" role="status"></p></div>';
        const image = card.querySelector('img');
        image.src = product.pairImage || product.image || product.photos?.[0]?.front || '';
        image.hidden = !image.getAttribute('src');
        card.querySelector('h3').textContent = product.name;
        const price = card.querySelector('strong');
        card.querySelector('.lb-cat').textContent = { ao: 'Áo', quan: 'Quần', giay: 'Giày' }[product.kind] || 'Sản phẩm';
        const sizes = card.querySelector('.lb-sizes');
        const add = card.querySelector('.lb-plus');
        const status = card.querySelector('[role="status"]');
        const variants = product.variants?.[0] || [];
        const first = variants.find(variant => variant?.stock > 0);
        let selected = first;
        const entry = {
            element: card,
            button: add,
            get price() { return selected?.price ?? displayPrice(product); },
            get line() {
                return selected && { name: product.name, productId: product.productId, variantId: selected.id, quantity: 1 };
            }
        };
        renderPrice(price, first || variants.find(Boolean), displayPrice(product));
        if (!first) status.textContent = 'Hết hàng';
        product.sizes.forEach((size, index) => {
            const variant = variants[index];
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'lb-size';
            option.textContent = size;
            option.disabled = !(variant?.stock > 0);
            option.classList.toggle('active', variant === first && !!first);
            option.setAttribute('aria-pressed', String(variant === first && !!first));
            option.addEventListener('click', () => {
                selected = variant;
                for (const button of sizes.children) {
                    button.classList.toggle('active', button === option);
                    button.setAttribute('aria-pressed', String(button === option));
                }
                renderPrice(price, variant, variant.price);
                updatePurchase();
            });
            sizes.append(option);
        });
        add.addEventListener('click', () => purchase([entry]));
        return entry;
    }

    slides.forEach((slide, index) => {
        const matches = saleData?.[index]?.items || looks[index].map(([slug, x, y]) => ({
            product: catalog.lookbook?.[slug] || shoes.find(shoe => shoe.id === slug), x, y
        })).filter(({ product }) => product);
        matches.forEach(({ product, x, y }) => {
            const pin = document.createElement('button');
            pin.type = 'button';
            pin.className = 'offer-pin lb-hotspot';
            pin.dataset.x = x;
            pin.dataset.y = y;
            pin.style.setProperty('--offer-x', x + '%');
            pin.style.setProperty('--offer-y', y + '%');
            pin.setAttribute('aria-label', 'Xem ' + product.name);
            pin.innerHTML = '<span class="lb-hotspot-radar"></span><span class="lb-hotspot-circle"><span class="lb-hotspot-dot"></span></span>'
                + '<span class="lb-hotspot-pop"><b class="lb-pop-name"></b><span class="lb-pop-price"></span></span>';
            pin.querySelector('.lb-pop-name').textContent = product.name;
            renderPrice(pin.querySelector('.lb-pop-price'),
                product.variants?.[0]?.find(variant => variant?.stock > 0) || product.variants?.[0]?.find(Boolean),
                displayPrice(product));
            pin.addEventListener('pointerdown', event => event.stopPropagation());
            pin.addEventListener('pointerenter', () => clearTimeout(autoTimer));
            pin.addEventListener('pointerleave', scheduleAuto);
            pin.addEventListener('focus', () => clearTimeout(autoTimer));
            pin.addEventListener('click', () => {
                if (purchasing) return;
                clearTimeout(autoTimer);
                cards = matches.map(match => productCard(match.product));
                items.replaceChildren(...cards.map(card => card.element));
                const selectedCard = cards[matches.findIndex(match => match.product === product)].element;
                selectedCard.classList.add('is-highlighted');
                dialog.querySelector('.offer-shop-count').textContent = matches.length + ' món';
                dialog.querySelector('.offer-shop-look').textContent = saleData?.[index]?.name || 'Look ' + String(index + 1).padStart(2, '0');
                feedback.textContent = '';
                updatePurchase();
                dialog.showModal();
                selectedCard.scrollIntoView({ block: 'nearest' });
            });
            slide.append(pin);
        });
        slide.querySelector('img').addEventListener('load', render);
    });

    new ResizeObserver(render).observe(track);
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        scheduleAuto();
    }).observe(gallery);
    document.addEventListener('visibilitychange', scheduleAuto);
    reducedMotion.addEventListener('change', scheduleAuto);
    render();
})();
