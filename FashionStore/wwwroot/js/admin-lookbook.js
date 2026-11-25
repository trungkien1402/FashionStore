(() => {
    const form = document.getElementById('lookEditor');
    const sale = form.dataset.sale === "true";
    const kind = document.getElementById("lookKind");
    const audience = document.getElementById("lookAudience");
    const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
    const search = document.getElementById('lookSearch');
    const matches = document.getElementById('lookMatches');
    const selected = document.getElementById('lookSelected');
    const points = document.getElementById('lookPoints');
    const preview = document.getElementById('lookPreview');
    const upload = document.getElementById('Image');
    const fileName = document.getElementById('lookFileName');
    const fileHint = fileName.textContent;
    const original = document.getElementById('Original');
    const cutout = document.getElementById('lookCutout');
    const restore = document.getElementById('lookRestore');
    const status = document.getElementById('lookImageStatus');
    const save = document.getElementById('lookSave');
    const items = JSON.parse(document.getElementById('lookInitialItems').textContent);
    const products = new Map();
    let activeItem;
    let objectUrl;
    let searchTimer;
    let searchVersion = 0;

    function make(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;
        element.className = className || '';
        return element;
    }

    function button(text, click, css = 'btn btn-sm btn-outline-secondary') {
        const element = make('button', text, css);
        element.type = 'button';
        element.onclick = click;
        return element;
    }

    async function findProducts(params) {
        const response = await fetch(form.dataset.search + '?' + new URLSearchParams(params));
        if (!response.ok) throw new Error('Không tải được sản phẩm.');
        return response.json();
    }

    function renderSelected() {
        selected.replaceChildren();
        points.replaceChildren();
        if (!items.length) {
            const empty = make('td', 'Chưa gắn sản phẩm nào.', 'text-center text-muted py-3');
            empty.colSpan = sale ? 4 : 3;
            const row = document.createElement('tr');
            row.append(empty);
            selected.append(row);
        }
        items.forEach((item, index) => {
            const product = products.get(item.productId);
            const row = document.createElement('tr');
            const name = make('td', product?.name || 'Sản phẩm #' + item.productId, 'fw-bold adm-heading');
            const colorCell = document.createElement('td');
            const actions = make('td', '', 'text-end text-nowrap');
            const color = make('select', '', 'form-select form-select-sm w-auto');
            color.name = 'Items[' + index + '].Color';
            color.setAttribute('aria-label', 'Phối màu');
            const colors = [...new Set([item.color, ...(product?.colors || [])])];
            colors.forEach(value => color.add(new Option(value, value, false, value === item.color)));
            color.onchange = () => { item.color = color.value; };
            colorCell.append(color);
            const point = button('Đặt điểm', () => { activeItem = item; renderSelected(); },
                activeItem === item ? 'btn btn-sm btn-dark' : 'adm-btn-table-action');
            point.setAttribute('aria-pressed', String(activeItem === item));
            actions.append(point,
                button('Bỏ', () => { items.splice(index, 1); if (activeItem === item) activeItem = null; renderSelected(); }, 'adm-btn-table-action ms-1'));
            for (const [name, value] of Object.entries({ ProductId: item.productId, X: item.x, Y: item.y })) {
                const hidden = document.createElement('input');
                hidden.type = 'hidden';
                hidden.name = 'Items[' + index + '].' + name;
                hidden.value = value;
                actions.append(hidden);
            }
            row.append(name, colorCell);
            let priceRow;
            if (sale) {
                row.classList.add('look-sale-control-row');
                const cell = document.createElement('td');
                const rate = make('input', '', 'form-control form-control-sm');
                rate.style.width = '5rem';
                rate.placeholder = '%';
                rate.type = 'number';
                rate.min = 1;
                rate.max = 100;
                rate.required = true;
                rate.name = 'Items[' + index + '].DiscountPercent';
                rate.value = item.discountPercent || '';
                rate.setAttribute('aria-label', 'Phần trăm giảm');
                const prices = make('small', '', 'd-block mt-1 text-nowrap');
                function updatePrice() {
                    const price = product?.prices?.[item.color];
                    const percent = Number(rate.value);
                    item.discountPercent = percent;
                    prices.textContent = price == null ? '' : money.format(price) + ' → ' +
                        money.format(Math.round(price * (100 - percent) / 100));
                }
                rate.addEventListener('input', updatePrice);
                color.addEventListener('change', updatePrice);
                updatePrice();
                cell.append(rate);
                row.append(cell);
                priceRow = make('tr', '', 'look-sale-price-row');
                const spacer = document.createElement('td');
                spacer.colSpan = 2;
                const priceCell = document.createElement('td');
                priceCell.colSpan = 2;
                priceCell.append(prices);
                priceRow.append(spacer, priceCell);
            }
            row.append(actions);
            selected.append(row);
            if (priceRow) selected.append(priceRow);
            const marker = make('span', index + 1, 'position-absolute translate-middle badge rounded-pill ' + (activeItem === item ? 'text-bg-primary' : 'text-bg-dark'));
            marker.style.left = item.x + '%';
            marker.style.top = item.y + '%';
            points.append(marker);
        });
    }

    kind?.addEventListener('change', updateMatches);
    audience?.addEventListener('change', updateMatches);
    preview.addEventListener('click', event => {
        if (!activeItem) return;
        const box = preview.getBoundingClientRect();
        activeItem.x = Math.round(100 * (event.clientX - box.left) / box.width);
        activeItem.y = Math.round(100 * (event.clientY - box.top) / box.height);
        renderSelected();
    });

    async function updateMatches() {
        const version = ++searchVersion;
        try {
            const results = await findProducts({ q: search.value.trim(), kind: kind?.value || "", audience: audience?.value || "" });
            if (version !== searchVersion) return;
            matches.replaceChildren();
            if (!results.length) matches.append(make('p', 'Không tìm thấy sản phẩm.', 'small mt-2'));
            for (const product of results.filter(p => p.colors.length)) {
                const row = button(product.name, () => {
                    products.set(product.id, product);
                    const existing = items.findIndex(item => item.productId === product.id || products.get(item.productId)?.kind === product.kind);
                    if (existing >= 0 && items[existing].productId === product.id) {
                        activeItem = items[existing];
                    } else {
                        const item = { productId: product.id, color: product.colors[0], x: 50, y: ({ ao: 35, quan: 65, giay: 88 })[product.kind] || 50 };
                        if (existing >= 0) items.splice(existing, 1, item);
                        else items.push(item);
                        activeItem = item;
                    }
                    renderSelected();
                }, 'list-group-item list-group-item-action d-flex align-items-center gap-2');
                const image = document.createElement('img');
                image.src = product.imageUrl;
                image.alt = '';
                image.width = 34;
                image.height = 34;
                image.className = 'object-fit-contain';
                row.prepend(image);
                matches.append(row);
            }
        } catch (error) {
            if (version === searchVersion) matches.replaceChildren(make('p', error.message, 'text-danger'));
        }
    }

    search.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchVersion++;
        searchTimer = setTimeout(updateMatches, 250);
    });
    search.addEventListener('keydown', event => { if (event.key === 'Enter') event.preventDefault(); });
    search.addEventListener('focus', updateMatches, { once: true });

    function assign(input, file) {
        const transfer = new DataTransfer();
        if (file) transfer.items.add(file);
        input.files = transfer.files;
    }

    function show(file) {
        fileName.textContent = file.name;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(file);
        preview.src = objectUrl;
        preview.hidden = false;
    }

    upload.addEventListener('change', () => {
        assign(original, upload.files[0]);
        if (upload.files[0]) show(upload.files[0]);
        else fileName.textContent = fileHint;
        restore.hidden = true;
    });
    restore.onclick = () => {
        if (!original.files[0]) return;
        assign(upload, original.files[0]);
        show(original.files[0]);
        restore.hidden = true;
    };

    cutout.onclick = async () => {
        cutout.disabled = true;
        upload.disabled = true;
        save.disabled = true;
        restore.disabled = true;
        status.textContent = 'Đang tách nền…';
        try {
            let source = original.files[0];
            if (!source && preview.dataset.original) {
                const response = await fetch(preview.dataset.original);
                if (!response.ok) throw new Error('Không tải được ảnh gốc.');
                const blob = await response.blob();
                source = new File([blob], preview.dataset.original.split('/').pop(), { type: blob.type });
            }
            if (!source || source.size > 5 * 1024 * 1024) throw new Error('Chọn ảnh người mẫu tối đa 5 MB.');
            const payload = new FormData();
            payload.append('file', source);
            payload.append('kind', 'lookbook');
            const response = await fetch(form.dataset.removeBackground, { method: 'POST', body: payload });
            if (!response.ok) throw new Error('Tách nền thất bại. Bạn có thể dùng ảnh đã tách sẵn.');
            const file = new File([await response.blob()], 'look.png', { type: 'image/png' });
            assign(original, source);
            assign(upload, file);
            show(file);
            restore.hidden = false;
            status.textContent = 'Đã tách nền. Kiểm tra lại vị trí các điểm trên ảnh.';
        } catch (error) {
            status.textContent = error.message;
        } finally {
            cutout.disabled = false;
            upload.disabled = false;
            save.disabled = false;
            restore.disabled = false;
        }
    };

    renderSelected();
    Promise.all(items.map(item => findProducts({ id: item.productId }))).then(results => {
        results.flat().forEach(product => products.set(product.id, product));
        renderSelected();
    }).catch(() => { status.textContent = 'Không tải được thông tin các sản phẩm đã gắn.'; });
})();
