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

    function removeVietnameseTones(str) {
        if (!str) return '';
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
        str = str.replace(/\u02C6|\u0306|\u031B/g, '');
        return str.trim();
    }

    const COLOR_KEYWORDS = {
        black: ['den', 'black', 'carbon', 'charcoal', 'pitch', 'than chi', 'onyx', 'stealth'],
        white: ['trang', 'white', 'be', 'kem', 'cream', 'sand', 'ivory', 'ecru', 'alabaster', 'sua', 'frost', 'pure', 'ice'],
        gray: ['xam', 'gray', 'grey', 'bac', 'silver', 'acid', 'smoke', 'marl', 'stone', 'da', 'storm', 'chrome', 'slate'],
        sand: ['cat', 'sand', 'khaki', 'camel', 'tan', 'beige', 'nau nhat', 'sa mac', 'desert'],
        brown: ['nau', 'brown', 'mocha', 'chocolate', 'espresso', 'cacao', 'coffee', 'go', 'wood', 'nau dam'],
        blue: ['xanh', 'blue', 'indigo', 'denim', 'cham', 'cobalt', 'azure', 'troi', 'sonic', 'polar', 'glacier'],
        navy: ['navy', 'hai quan', 'xanh tham', 'dam', 'dark blue', 'midnight', 'muc', 'deep blue', 'deep carbon'],
        teal: ['ngoc', 'teal', 'mint', 'turquoise', 'cyan', 'tiffany'],
        green: ['reu', 'green', 'olive', 'la cay', 'moss', 'army', 'khaki green', 'bo', 'forest', 'emerald', 'matrix'],
        lime: ['volt', 'lime', 'neon', 'acid', 'chuoi', 'da quang'],
        purple: ['tim', 'purple', 'violet', 'lunar', 'magenta', 'aura', 'lilac', 'lavender', 'hoa ca', 'plum'],
        red: ['do', 'red', 'crimson', 'scarlet', 'magma', 'infrared', 'infraray', 'fury', 'rubi'],
        burgundy: ['burgundy', 'maroon', 'ruou', 'man', 'bordeaux', 'do tham', 'wine'],
        orange: ['cam', 'orange', 'amber', 'sunset', 'flare', 'terracotta', 'clay', 'dat nung', 'rust'],
        yellow: ['vang', 'yellow', 'gold', 'solaris', 'imperial', 'mustard', 'lemon', 'canary'],
        pink: ['hong', 'pink', 'rose', 'phan', 'pastel', 'lotus', 'dao', 'blush', 'fuchsia'],
        metallic: ['kim loai', 'metallic', 'metal', 'dong', 'bronze', 'copper', 'gold chrome', 'anh kim']
    };

    function createKeywordMatcher(keyword) {
        const normalized = removeVietnameseTones(keyword).replace(/[-_]+/g, ' ');
        if (!normalized) return () => true;

        const categoryTerms = { ao: 'ao', quan: 'quan', giay: 'giay', shoe: 'giay', shoes: 'giay' };
        const audienceTerms = {
            nam: 'men', men: 'men', man: 'men', nu: 'women', women: 'women', woman: 'women',
            'be trai': 'boy', boy: 'boy', boys: 'boy', 'be gai': 'girls', girl: 'girls', girls: 'girls'
        };
        const tokens = normalized.match(/be\s+(?:trai|gai)\b|[a-z0-9]+/g) || [];
        const categories = new Set(tokens.map(token => categoryTerms[token]).filter(key => typeof key === 'string'));
        const audiences = new Set(tokens.map(token => audienceTerms[token.replace(/\s+/g, ' ')]).filter(key => typeof key === 'string'));
        const words = tokens.filter(token => !Object.hasOwn(categoryTerms, token) && !Object.hasOwn(audienceTerms, token.replace(/\s+/g, ' ')));
        const searchWords = categories.has('giay') ? words.join(' ').replace(/\bthe thao\b/g, 'sneaker').split(' ') : words;

        return ({ item, kind }) => {
            if (words.length && removeVietnameseTones(item.name).replace(/[-_]+/g, ' ') === normalized) return true;
            if (categories.size && !categories.has(kind)) return false;
            if (audiences.size && !audiences.has(item.audience)) return false;
            if (!words.length) return true;
            const labels = types(item, kind).map(value => shoeLabels[value] || value);
            const corpus = removeVietnameseTones([
                item.name, item.desc, item.type, item.style, item.sku, item.model,
                item.colorName, item.colorway, item.styleCode, item.designer, item.collectionTitle, ...labels
            ].join(' ')).replace(/[-_]+/g, ' ');
            return searchWords.every(word => corpus.includes(word));
        };
    }

    function colorVariant(item, color) {
        if (color === 'all') return 0;
        const keywords = COLOR_KEYWORDS[color] || [color];
        const matchesColor = value => keywords.some(word => removeVietnameseTones(value).includes(word));
        const index = Array.isArray(item.colors) ? item.colors.findIndex(value =>
            matchesColor(typeof value === 'string' ? value : Array.isArray(value) ? value[0] : value?.name)) : -1;
        if (index >= 0) return index;
        return item.colorGroup === color || matchesColor([
            item.name, item.desc, item.colorName, item.colorway, item.model
        ].join(' ')) ? 0 : -1;
    }

    const incomingFilters = new Map();
    window.ShowroomFilterOptions = {
        createKeywordMatcher,
        colorVariant,
        storeIncomingFilter: filter => incomingFilters.set(filter.category, filter),
        takeIncomingFilter(kind) {
            const filter = incomingFilters.get(kind);
            incomingFilters.delete(kind);
            return filter;
        },
        restorePrice(range, limit) {
            if (limit == null) return Number(range.max);
            range.min = Math.min(Number(range.min), limit);
            if (limit >= Number(range.max)) range.max = limit + Number(range.step);
            if ((limit - Number(range.min)) % Number(range.step)) range.step = 50000;
            range.value = limit;
            return Number(range.value);
        },
        categories: (items, kind) => options(items, item => types(item, kind), kind === 'giay' ? shoeLabels : {}),
        styles: (items, kind, key) => options(items.filter(item => matches(types(item, kind), key)), item => styles(item, kind)),
        matchesCategory: (item, kind, key) => matches(types(item, kind), key),
        matchesStyle: (item, kind, key) => matches(styles(item, kind), key)
    };
})();
