(() => {
    const root = document.querySelector('[data-profile-address]');
    if (!root) return;
    const province = root.querySelector('#ProvinceCode');
    const ward = root.querySelector('#WardCode');
    const status = root.querySelector('[data-address-status]');
    ward.disabled = true;
    fetch(province.dataset.addressUrl).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(regions => {
        function wards(selected = '') {
            ward.replaceChildren(new Option('Chọn xã/phường', ''));
            const region = regions.find(x => String(x.code) === province.value);
            for (const item of region?.wards ?? []) ward.add(new Option(item.name, item.code));
            ward.disabled = !region;
            ward.value = selected;
            if (ward.selectedIndex < 0) ward.selectedIndex = 0;
        }
        for (const region of regions) province.add(new Option(region.name, region.code));
        province.value = province.dataset.selected;
        if (province.selectedIndex < 0) province.selectedIndex = 0;
        wards(ward.dataset.selected);
        province.addEventListener('change', () => wards());
    }).catch(() => { status.textContent = 'Chưa tải được danh sách địa chỉ. Vui lòng tải lại trang.'; });
})();
