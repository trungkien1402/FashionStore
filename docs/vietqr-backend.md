# VietQR — manual confirmation

Backend only. No payOS, bank webhook, bank reconciliation or automatic expiry.
Order totals are calculated server-side. A customer's report never marks an order Paid.

## Configuration

Set these environment variables before starting the app (or use .NET User Secrets).
VietQR stays unavailable until all receiver fields are valid and Enabled is true.
Do not use bank details hardcoded in a View as a fallback.

```text
VietQR__Enabled=true
VietQR__BankId=<bank BIN or code>
VietQR__BankName=<display name>
VietQR__AccountNo=<receiver account>
VietQR__AccountName=<receiver name>
VietQR__Template=compact2
```

QR URLs use the documented SVG Quick Link format:
https://www.vietqr.io/qr-dong
For production configure your provider template as described there.
The browser loads the QR image from img.vietqr.io, disclosing receiver details,
amount and transfer content to that image provider. No server HTTP call is made.

Apply migrations before running the updated app:
`dotnet ef database update --project FashionStore`

## Frontend contract (Antigravity)

All endpoints require the existing Identity cookie. POSTs require the standard
MVC antiforgery form field `__RequestVerificationToken` (render with
`@Html.AntiForgeryToken()`). Send form-urlencoded data, not JSON.
Anonymous requests follow the existing MVC login redirect; handle redirected/HTML
responses rather than assuming every response is JSON.

| Endpoint | Input | Result |
|---|---|---|
| POST /Orders/Checkout | Existing checkout form; PaymentMethod=COD or VietQR | COD redirects to Success; VietQR redirects to /Orders/PaymentQR/{id}. Invalid form returns checkout with ModelState errors. |
| GET /Orders/PaymentQR/{id} | Owned VietQR order | Razor view, Order model; bank fields and PaymentInfo in ViewBag. Non-pending/closed order redirects to Details. Already-reported Pending order redirects to Success (step 3). |
| GET /Orders/PaymentInfo?orderId=123 | Owned VietQR order | JSON below. 404 for missing/other user's order, 400 for COD, 503 for invalid/missing bank configuration or invalid VND amount. |
| GET /Orders/CheckPaymentStatus?orderId=123 | Owned order | `{orderId,paymentStatus,isPaid,transferReported,orderStatus,confirmationMode:"Manual"}` |
| POST /Orders/ReportTransfer | orderId + antiforgery token | `{success,message,duplicate}`; repeat is successful without a second audit record. 409 for an ineligible order. |
| POST /AdminOrders/UpdatePaymentStatus | id,newStatus + token | Existing admin form; redirects to Details, result in TempData. Admin/Manager/Staff only. Pending=0, Paid=1, Failed=2, Refunded=3. |
| GET /AdminOrders/PaymentHistory?id=123 | Admin/Manager/Staff only | Chronological audit JSON: id,event,oldStatus,newStatus,amount,actorUserId,createdAt (UTC). |

PaymentInfo response (example with fictional details):

```json
{
  "orderId":123,"orderCode":"FS20261106123456ABCD","amount":229000,"currency":"VND",
  "bankId":"970000","bankName":"Configured bank","accountNo":"TEST123",
  "accountName":"TEST RECEIVER","transferContent":"FS20261106123456ABCD",
  "qrImageUrl":"https://img.vietqr.io/image/...svg?amount=229000&addInfo=...",
  "paymentStatus":"Pending","isPaid":false,"transferReported":false,"canPay":true
}
```

Use qrImageUrl from the backend instead of constructing another URL in Razor.
When canPay=false, qrImageUrl is empty: hide payment controls. No QR for failed,
paid, refunded, cancelled, returned or delivery-failed orders.

Replace the existing frontend's automatic-bank-confirmation messages and timer.
The transfer button must POST ReportTransfer; polling CheckPaymentStatus only
reads the staff-confirmed status. Show "Đang chờ cửa hàng xác nhận thanh toán".
Do not claim success when a request fails. No timer/expiry is implemented.
Payment UI is implemented in Razor Views with the dedicated _PaymentLayout,
payment.css, payment.js and checkout.js. It uses these existing backend contracts.

The integrated frontend now redirects to Success (step 3) after ReportTransfer
succeeds. This completes the customer's notification step, not bank confirmation.
Success displays "Chờ cửa hàng xác nhận" while payment remains Pending. Failed
reports stay on the QR page for retry. Opening an already-reported QR order also
redirects to step 3. No bank-status API is required for this flow.

## Audit and concurrency

PaymentHistories records Created, TransferReported and StatusChanged events.
Existing orders start with no historical entries; no fabricated backfill.
Report timestamp and history save atomically; rowversion rejects concurrent writes.
Repeated same-status admin requests are no-ops. Changed-status writes and history
save in one EF transaction. Refunded is terminal; Paid requires Pending/Failed
and an eligible order. Refund recording requires Paid and cancelled/returned/
delivery-failed. This records a manual refund; it does not transfer bank funds.
Late transfers to cancelled orders require manual reconciliation outside this flow.

Checkout uses a serializable transaction for stock validation/decrement; on a
deadlock it returns the existing retry message rather than accepting stale stock.
No automatic payment timeout or stock release is introduced.

## Verification

Run `dotnet run --project tests/PaymentChecks --configuration PaymentCheck`.
It migrates the dedicated FashionStorePaymentTests local database and rolls back
all test records. It checks controller ownership, QR data, manual reporting,
idempotency (including a stale concurrent write), status transitions and audit.
CSRF/role attributes are inspected; browser/cookie middleware is not exercised.
No bank request or real transfer is performed. The local test schema is retained.

The migration also reconciles the previously missing OrderItems-to-ProductVariants
index and foreign key, using existence checks for the repaired local database.
