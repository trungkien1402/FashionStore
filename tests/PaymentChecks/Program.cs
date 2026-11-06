using FashionStore.Controllers;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Services.Implementations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

static void Check(bool condition, string name)
{
    if (!condition) throw new Exception("FAILED: " + name);
    Console.WriteLine("PASS: " + name);
}

var bank = new VietQrOptions { Enabled = true, BankId = "970000", BankName = "TEST",
    AccountNo = "TEST123", AccountName = "TEST RECEIVER" };
// Dedicated local test DB only. No real bank image requests or money transfers.
var connection = Environment.GetEnvironmentVariable("PAYMENT_TEST_CONNECTION") ??
    "Server=.;Database=FashionStorePaymentTests;Trusted_Connection=True;TrustServerCertificate=True";
var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connection);
if (!builder.InitialCatalog.EndsWith("PaymentTests", StringComparison.Ordinal))
    throw new Exception("Test database name must end in PaymentTests.");
var dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlServer(connection).Options;
await using var db = new ApplicationDbContext(dbOptions);
await db.Database.MigrateAsync();
await using var transaction = await db.Database.BeginTransactionAsync();
var user = new ApplicationUser { UserName = "payment-test-" + Guid.NewGuid() };
db.Users.Add(user);
var order = new Order { User = user, OrderCode = "TEST" + Guid.NewGuid().ToString("N"),
    TotalAmount = 229000, PaymentMethod = PaymentMethod.VietQR };
db.Orders.Add(order);
await db.SaveChangesAsync();
var service = new PaymentService(db, Options.Create(bank));
var controller = new OrdersController(db, service)
{
    ControllerContext = new ControllerContext
    {
        HttpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, "another-user")], "Test"))
        }
    }
};
Check(await controller.PaymentInfo(order.Id) is NotFoundResult &&
    await controller.CheckPaymentStatus(order.Id) is NotFoundResult &&
    await controller.ReportTransfer(order.Id) is NotFoundResult, "all customer endpoints enforce ownership");
await using var staleDb = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseSqlServer(db.Database.GetDbConnection()).Options);
await staleDb.Database.UseTransactionAsync(transaction.GetDbTransaction());
await staleDb.Orders.SingleAsync(o => o.Id == order.Id);
var info = service.GetPaymentInfo(order);
Check(info.QrImageUrl.Contains("amount=229000&") && info.TransferContent == order.OrderCode,
    "QR amount and content come from persisted order");
Check(!(await service.ReportTransferAsync(order.Id, "another-user")).Success, "other owner cannot report");
Check((await service.ReportTransferAsync(order.Id, user.Id)).Success && order.PaymentStatus == PaymentStatus.Pending,
    "report never marks payment Paid");
var staleService = new PaymentService(staleDb, Options.Create(bank));
Check((await staleService.ReportTransferAsync(order.Id, user.Id)).Duplicate,
    "stale concurrent report cannot write duplicate audit");
Check((await service.ReportTransferAsync(order.Id, user.Id)).Duplicate &&
    await db.PaymentHistories.CountAsync(h => h.OrderId == order.Id) == 1, "repeat report is idempotent");
Check((await service.UpdateStatusAsync(order.Id, PaymentStatus.Paid, user.Id)).Success, "staff confirmation");
Check((await service.UpdateStatusAsync(order.Id, PaymentStatus.Paid, user.Id)).Duplicate &&
    await db.PaymentHistories.CountAsync(h => h.OrderId == order.Id) == 2, "repeat confirmation has no duplicate audit");
Check(!service.GetPaymentInfo(order).CanPay && service.GetPaymentInfo(order).QrImageUrl == "", "no QR after payment");
Check(!(await service.UpdateStatusAsync(order.Id, PaymentStatus.Refunded, user.Id)).Success, "no refund for open order");
order.Status = OrderStatus.Cancelled;
await db.SaveChangesAsync();
Check((await service.UpdateStatusAsync(order.Id, PaymentStatus.Refunded, user.Id)).Success, "manual refund audit");
Check(!(await service.UpdateStatusAsync(order.Id, PaymentStatus.Paid, user.Id)).Success, "refund is terminal");
var closed = new Order { User = user, OrderCode = "CLOSED" + Guid.NewGuid().ToString("N"),
    TotalAmount = 100000, PaymentMethod = PaymentMethod.VietQR, Status = OrderStatus.Cancelled };
db.Orders.Add(closed);
await db.SaveChangesAsync();
Check(!(await service.ReportTransferAsync(closed.Id, user.Id)).Success &&
    !(await service.UpdateStatusAsync(closed.Id, PaymentStatus.Paid, user.Id)).Success,
    "cancelled orders reject transfer reports and paid confirmation");
bank.Enabled = false;
Check(!service.IsVietQrReady, "missing/disabled configuration blocks QR");
Check(typeof(OrdersController).GetMethod("ReportTransfer")!
    .IsDefined(typeof(ValidateAntiForgeryTokenAttribute), true), "transfer POST has CSRF protection");
Check(typeof(AdminOrdersController).GetCustomAttributes(typeof(AuthorizeAttribute), true)
    .Cast<AuthorizeAttribute>().Any(a => a.Roles == "Admin,Manager,Staff"), "admin endpoint role gate");
await transaction.RollbackAsync();
Console.WriteLine("All checks passed. Test data rolled back; test DB schema retained.");
