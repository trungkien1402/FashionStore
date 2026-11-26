(() => {
    const portal = document.getElementById('hnmtChilePortal');
    const stage = document.getElementById('showroomStage');
    if (!portal || !stage) return;
    const items = stage.querySelectorAll('[data-showroom-kind]');
    let audience = 'men';
    let overflow;
    let trigger;
    const active = () => portal.classList.contains('is-active');
    function setAudience(value) {
        if (['men', 'women', 'boy', 'girls'].includes(value)) audience = value;
        for (const item of items) {
            item.querySelector('img').src = '/images/showroom/' + audience + '-' + item.dataset.showroomKind + '.webp';
        }
    }
    function open(value = 'men', focusExit = true) {
        if (!active()) {
            overflow = document.body.style.overflow;
            trigger = document.activeElement;
        }
        setAudience(value);
        portal.classList.add('is-active');
        portal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (focusExit) exit.focus({ preventScroll: true });
    }
    function close() {
        if (!active()) return;
        portal.classList.remove('is-active');
        portal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = overflow;
        trigger?.focus();
    }
    const exit = document.getElementById('hnmtPortalExitBtn');
    exit.addEventListener('click', close);
    window.HNMTChilePortal = {
        open, close, setAudience,
        getAudience: () => active() ? audience : null,
        syncOverlayState() {
            for (const element of portal.querySelectorAll(':scope > .hnmt-portal-header, :scope > .hnmt-portal-footer')) {
                element.style.display = '';
            }
        }
    };
    document.addEventListener('click', event => {
        const entry = event.target.closest('[data-open-chile-portal], .hnmt-cat-block');
        if (!entry || portal.contains(entry)) return;
        event.preventDefault();
        event.stopPropagation();
        open((entry.dataset.category || entry.dataset.categoryTitle || 'men').toLowerCase(), event.detail === 0);
    }, true);
    for (const item of items) {
        item.addEventListener('click', () => {
            const kind = item.dataset.showroomKind;
            if (kind === 'giay') window.openSneakerShowcase(audience);
            else window.open3DClothesRack(kind, audience);
        });
    }
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !portal.querySelector('#hnmtSneakerOverlay.is-active, #hnmtRackOverlay.is-active')) close();
    }, true);
})();
