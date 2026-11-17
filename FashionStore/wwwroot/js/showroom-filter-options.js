(function () {
    'use strict';

    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replaceAll('đ', 'd').replace(/[-_]+/g, ' ').trim();

    const groups = {
        ao: [
            ['Áo gile', /\b(gile|utility vest)\b/],
            ['Áo blazer & vest', /\b(blazer|vest)\b/],
            ['Áo polo & rugby', /\b(polo|rugby)\b/],
            ['Áo hai dây & ba lỗ', /\b(hai day|ba lo|cami|tank)\b/],
            ['Áo blouse', /\bblouse\b/],
            ['Áo hoodie', /\bhoodie\b/],
            ['Áo nỉ', /\b(ao ni|sweatshirt|crewneck)\b/],
            ['Áo len & cardigan', /\b(ao len|knit|cardigan|sweater)\b/],
            ['Áo khoác', /\b(jacket|ao khoac|bomber|overshirt|anorak)\b/],
            ['Áo sơ mi', /\b(shirt|so mi)\b/],
            ['Áo thun', /\b(tee|ao thun)\b/]
        ],
        quan: [
            ['Quần short', /\b(short|shorts|bermuda)\b/],
            ['Quần chino & kaki', /\b(chino|kaki|khaki)\b/],
            ['Quần dù & parachute', /\b(parachute|quan du)\b/],
            ['Quần cargo', /\b(cargo|tui hop)\b/],
            ['Quần jeans & denim', /\b(jeans?|denim)\b/],
            ['Quần jogger & track', /\b(jogger|track)\b/],
            ['Quần tây & âu', /\b(tay|quan au|tailored|trouser)\b/]
        ]
    };
    const shoeLabels = {
        'low-top': 'Sneaker cổ thấp', 'high-top': 'Sneaker cổ cao', chunky: 'Sneaker đế dày',
        runners: 'Giày chạy bộ', heels: 'Giày cao gót', flats: 'Giày bệt & Mary Jane',
        boots: 'Boots', loafers: 'Loafer', dress: 'Giày tây',
        'air-future': 'Air Future Series', 'cyber-series': 'Cyber Series', 'chile-series': 'Chile 20 Series'
    };
    const series = { futurist: 'air-future', cyber: 'cyber-series', chile20: 'chile-series' };

    function shoeTypes(item) {
        const types = new Set(item.silhouettes || []);
        const collectionSeries = series[item.collectionId];
        if (collectionSeries) types.add(collectionSeries);
        if (item.collectionId === 'futurist') types.add('runners');
        if (item.collectionId === 'cyber') types.add('chunky');
        const model = normalize(item.model || item.name);
        if (/\b(chelsea|boot|chukka)\b/.test(model)) types.add('boots');
        if (/\b(derby|oxford)\b/.test(model)) types.add('dress');
        if (/\b(loafer|penny|brass bit|cognac link)\b/.test(model)) types.add('loafers');
        if (/\b(trail|runner|running)\b/.test(model)) types.add('runners');
        return [...types];
    }

    function types(item, kind) {
        if (kind === 'giay') return shoeTypes(item);
        const text = normalize([item.type, item.style, item.name, item.slug].join(' '));
        return [groups[kind].find(([, pattern]) => pattern.test(text))?.[0] || 'Khác'];
    }

    function styles(item, kind) {
        if (kind === 'giay') return item.model ? [item.model] : [];
        const generic = /^(tee|shirt|jacket|hoodie|jeans|cargo|tay|jogger|parachute|ao len|ao hai day)$/;
        return [...new Set([item.style, item.type].filter(value => value && !generic.test(normalize(value))))];
    }

    const options = (items, getValues, labels = {}) => {
        const values = new Map();
        items.forEach(item => getValues(item).forEach(value => values.set(normalize(value), labels[value] || value)));
        return Array.from(values, ([value, label]) => ({ value, label }))
            .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
    };
    const matches = (values, key) => key === 'all' || values.some(value => normalize(value) === key);

    window.ShowroomFilterOptions = {
        categories: (items, kind) => options(items, item => types(item, kind), kind === 'giay' ? shoeLabels : {}),
        styles: (items, kind, key) => options(items.filter(item => matches(types(item, kind), key)), item => styles(item, kind)),
        matchesCategory: (item, kind, key) => matches(types(item, kind), key),
        matchesStyle: (item, kind, key) => matches(styles(item, kind), key)
    };
})();
