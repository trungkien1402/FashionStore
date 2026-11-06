// Isolated browser-logic checks; never connects to the app or bank provider.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('FashionStore/wwwroot/js/payment.js', 'utf8');

function element() {
    const classes = new Set();
    return {
        dataset: {}, textContent: '', disabled: false, listeners: {},
        classList: { add: x => classes.add(x), remove: x => classes.delete(x),
            contains: x => classes.has(x), toggle: (x, on) => on ? classes.add(x) : classes.delete(x) },
        addEventListener(name, fn) { this.listeners[name] = fn; }
    };
}
async function harness(response, options = {}) {
    const ids = Object.fromEntries(['paymentPage', 'btnReportTransfer', 'pollingStatusText',
        'pollingSpinner', 'paymentControlsContainer', 'paymentClosed', 'paymentClosedText',
        'qrImageElement', 'qrLoadError', 'reportFeedback', 'reportTransferForm'].map(id => [id, element()]));
    ids.paymentPage.dataset = { canPay: 'true', reported: 'false', statusUrl: '/status',
        successUrl: '/success', detailsUrl: '/details' };
    ids.reportTransferForm.action = '/report';
    ids.qrImageElement.complete = options.brokenQr || false;
    ids.qrImageElement.naturalWidth = options.brokenQr ? 0 : 250;
    ids.paymentClosed.classList.add('d-none');
    ids.qrLoadError.classList.add('d-none');
    const copy = element();
    copy.dataset.copy = '123456'; copy.textContent = 'Sao chép';
    ids.paymentPage.querySelectorAll = () => [copy];
    const requests = [], redirects = [], timers = [];
    const context = {
        document: { getElementById: id => ids[id], addEventListener() {} },
        window: { location: { assign: url => redirects.push(url), reload() {} }, addEventListener() {} },
        navigator: {}, AbortSignal, URLSearchParams,
        FormData: class { *[Symbol.iterator]() { yield ['orderId', '123']; yield ['__RequestVerificationToken', 'test-token']; } },
        setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {},
        fetch: async (url, init) => {
            requests.push({ url, init });
            if (url === '/report') return { ok: !options.reportFails, status: options.reportFails ? 500 : 200, headers: new Headers({'content-type':'application/json'}),
                json: async () => ({ success: !options.reportFails, message: 'Reported' }) };
            if (response instanceof Error) throw response;
            return { ok: true, status: 200, headers: new Headers({'content-type':'application/json'}), json: async () => response };
        }
    };
    vm.runInNewContext(source, context);
    await new Promise(resolve => setImmediate(resolve));
    return { ids, requests, redirects, timers, copy };
}
test('cancelled Pending order hides QR and report controls', async () => {
    const h = await harness({ paymentStatus: 'Pending', orderStatus: 'Cancelled' });
    assert.ok(h.ids.paymentControlsContainer.classList.contains('d-none'));
    assert.ok(!h.ids.paymentClosed.classList.contains('d-none'));
    assert.ok(h.ids.btnReportTransfer.disabled);
    assert.equal(h.timers.length, 0);
});
test('closed order takes precedence over Paid', async () => {
    const h = await harness({ paymentStatus: 'Paid', isPaid: true, orderStatus: 'Returned' });
    assert.equal(h.redirects.length, 0);
    assert.ok(h.ids.paymentControlsContainer.classList.contains('d-none'));
});
test('Paid order opens success; Failed order removes payment controls', async () => {
    const paid = await harness({ paymentStatus: 'Paid', isPaid: true, orderStatus: 'Confirmed' });
    assert.deepEqual(paid.redirects, ['/success']);
    const failed = await harness({ paymentStatus: 'Failed', orderStatus: 'Confirmed' });
    assert.ok(failed.ids.paymentControlsContainer.classList.contains('d-none'));
});
test('connection failure explains stale status and schedules a retry', async () => {
    const h = await harness(new Error('offline'));
    assert.match(h.ids.pollingStatusText.textContent, /Mất kết nối/);
    assert.equal(h.timers.length, 1);
});
test('broken QR and unavailable clipboard offer manual fallback', async () => {
    const h = await harness({ paymentStatus: 'Pending', orderStatus: 'Confirmed' }, { brokenQr: true });
    assert.ok(!h.ids.qrLoadError.classList.contains('d-none'));
    await h.copy.listeners.click();
    assert.match(h.ids.reportFeedback.textContent, /bằng tay/);
    assert.equal(h.copy.disabled, false);
});
test('report uses POST and antiforgery token, then disables repeat reports', async () => {
    const h = await harness({ paymentStatus: 'Pending', orderStatus: 'Confirmed' });
    await h.ids.btnReportTransfer.listeners.click();
    const report = h.requests.find(r => r.url === '/report');
    assert.equal(report.init.method, 'POST');
    assert.equal(report.init.body.get('__RequestVerificationToken'), 'test-token');
    assert.ok(h.ids.btnReportTransfer.disabled);
    assert.match(h.ids.btnReportTransfer.textContent, /Đã gửi/);
    assert.deepEqual(h.redirects, ['/success']);
});
test('failed report stays on QR and allows retry instead of opening step 3', async () => {
    const h = await harness({ paymentStatus: 'Pending', orderStatus: 'Confirmed' }, { reportFails: true });
    await h.ids.btnReportTransfer.listeners.click();
    assert.deepEqual(h.redirects, []);
    assert.equal(h.ids.btnReportTransfer.disabled, false);
    assert.match(h.ids.reportFeedback.textContent, /Không kết nối/);
});
