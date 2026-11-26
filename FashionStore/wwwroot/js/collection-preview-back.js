(() => {
    const root = document.getElementById('lookbookRoot');
    const returnUrl = root?.dataset.previewReturnUrl;
    if (returnUrl) {
        const updateBackLink = () => {
            const link = root.querySelector('a#lbClose');
            if (!link) return false;
            link.href = returnUrl;
            return true;
        };
        if (!updateBackLink()) {
            const observer = new MutationObserver(() => {
                if (updateBackLink()) observer.disconnect();
            });
            observer.observe(root, { childList: true, subtree: true });
        }
    }
    document.addEventListener('click', event => {
        const link = event.target.closest(returnUrl ? '#lookbookRoot a#lbClose' : 'a[data-preview-back]');
        if (!link || !document.referrer || history.length < 2 || event.button !== 0 ||
            event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const previous = new URL(document.referrer);
        const destination = new URL(link.href);
        if (previous.origin !== destination.origin || previous.pathname !== destination.pathname ||
            previous.search !== destination.search) return;
        event.preventDefault();
        history.back();
    }, true);
})();
