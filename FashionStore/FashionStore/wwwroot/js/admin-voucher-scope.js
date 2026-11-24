(() => {
    const scope = document.getElementById("voucherScope");
    const category = document.getElementById("categoryId");
    const product = document.getElementById("productId");
    const search = document.getElementById("voucherProductSearch");
    const empty = document.getElementById("voucherProductEmpty");
    const placeholder = product.options[0];
    const options = [...product.options].slice(1);

    const normalize = value => value.toLowerCase().normalize("NFD")
        .replace(/\p{M}/gu, "").replace(/đ/g, "d").trim();

    function updateScope() {
        for (const [name, field] of [["category", category], ["product", product]]) {
            const enabled = scope.value === name;
            field.parentElement.hidden = !enabled;
            field.disabled = !enabled;
            field.required = enabled;
        }
    }

    function filterProducts() {
        const selected = product.value;
        const query = normalize(search.value);
        const matches = options.filter(option => normalize(option.textContent).includes(query));
        product.replaceChildren(placeholder, ...matches);
        product.value = matches.some(option => option.value === selected) ? selected : "";
        empty.hidden = matches.length > 0;
    }

    scope.addEventListener("change", updateScope);
    search.addEventListener("input", filterProducts);
    updateScope();
    filterProducts();
})();
