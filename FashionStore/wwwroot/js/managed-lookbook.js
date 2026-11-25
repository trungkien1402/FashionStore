(() => {
    const root = document.getElementById('managedLookbook');
    const preview = root.dataset.preview === 'true';
    for (const look of root.querySelectorAll('[data-look]')) {
        const products = [...look.querySelectorAll('[data-product]')];
        const all = look.querySelector('[data-add-all]');
        const status = look.querySelector('[role=status]');
        let busy = false;
        const read = row => row.querySelector('select').value;
        const update = () => {
            products.forEach(row => { row.querySelector('[data-add]').disabled = busy || preview || !read(row); });
            if (all) all.disabled = busy || preview || products.length !== Number(all.dataset.addAll) ||
                products.some(row => !read(row));
        };
        async function add(rows) {
            if (busy || preview) return;
            const cart = window.HNMTCart;
            if (!cart) { status.textContent = 'Giỏ hàng chưa sẵn sàng.'; return; }
            const lines = rows.map(row => ({ name: row.dataset.name, productId: Number(row.dataset.product), variantId: Number(read(row)), quantity: 1 }));
            busy = true;
            update();
            let added = 0;
            try {
                for (const line of lines) {
                    if (!await cart.addItem(line)) break;
                    added++;
                }
            } catch (error) {
                console.error(error);
            } finally {
                status.textContent = added ? 'Đã thêm ' + added + '/' + lines.length + ' món vào giỏ.' : 'Chưa thêm được món nào.';
                busy = false;
                update();
            }
        }
        products.forEach(row => {
            row.querySelector('select').addEventListener('change', update);
            row.querySelector('[data-add]').onclick = () => add([row]);
        });
        if (all) all.onclick = () => add(products);
        look.querySelectorAll('[data-point]').forEach(point => {
            point.onclick = () => {
                const detail = document.getElementById(point.dataset.point);
                detail.open = true;
                detail.querySelector('select').focus();
            };
        });
        update();
    }
})();
