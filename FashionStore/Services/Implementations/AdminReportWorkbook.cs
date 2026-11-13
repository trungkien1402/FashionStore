using ClosedXML.Excel;
using FashionStore.Models.ViewModels;

namespace FashionStore.Services.Implementations;

public static class AdminReportWorkbook
{
    public static byte[] Create(AdminDashboardViewModel report, IReadOnlyList<AdminReportOrder> orders)
    {
        using var workbook = new XLWorkbook();
        var summary = workbook.AddWorksheet("TongQuan");
        summary.Cell(1, 1).Value = "FashionStore — Báo cáo bán hàng (VND)";
        summary.Cell(2, 1).Value = "Từ ngày";
        summary.Cell(2, 2).Value = report.StartDate;
        summary.Cell(3, 1).Value = "Đến ngày";
        summary.Cell(3, 2).Value = report.EndDate;
        summary.Cell(4, 1).Value = "Thời điểm xuất (giờ Việt Nam)";
        summary.Cell(4, 2).Value = AdminReportService.ToVietnamTime(DateTime.UtcNow);
        summary.Range("B2:B3").Style.DateFormat.Format = "dd/mm/yyyy";
        summary.Cell("B4").Style.DateFormat.Format = "dd/mm/yyyy hh:mm";
        summary.Cell(5, 1).Value = AdminDashboardViewModel.RevenueDefinition;
        summary.Range("A5:B5").Merge().Style.Alignment.WrapText = true;
        summary.Row(5).Height = 48;
        summary.Cell(7, 1).Value = "Tổng đơn";
        summary.Cell(7, 2).Value = report.TotalOrders;
        summary.Cell(8, 1).Value = "Chờ xác nhận";
        summary.Cell(8, 2).Value = report.PendingOrders;
        summary.Cell(9, 1).Value = "Đã giao";
        summary.Cell(9, 2).Value = report.DeliveredOrders;
        summary.Cell(10, 1).Value = "Đã hủy";
        summary.Cell(10, 2).Value = report.CancelledOrders;
        summary.Cell(11, 1).Value = "Giá trị đã thanh toán";
        summary.Cell(11, 2).Value = report.PaidAmount;
        summary.Cell(12, 1).Value = "Giá trị đơn đã giao";
        summary.Cell(12, 2).Value = report.RevenueInRange;
        summary.Cell(13, 1).Value = "Giá trị trung bình đơn đã thanh toán";
        summary.Cell(13, 2).Value = report.AveragePaidOrderValue;
        summary.Range("B11:B13").Style.NumberFormat.Format = "#,##0.##";
        summary.Row(1).Style.Font.Bold = true;
        summary.Column(1).Width = 40;
        summary.Column(2).Width = 26;

        var daily = AddTable(workbook, "DoanhThuTheoNgay", "Ngày đặt (VN)", "Giá trị đơn đã giao (VND)");
        for (var index = 0; index < report.RevenueChartData.Count; index++)
        {
            daily.Cell(index + 2, 1).Value = report.StartDate.AddDays(index);
            daily.Cell(index + 2, 2).Value = report.RevenueChartData[index];
        }
        daily.Range(1, 1, report.RevenueChartData.Count + 1, 2).SetAutoFilter();
        daily.Cell(report.RevenueChartData.Count + 2, 1).Value = "Tổng cộng";
        daily.Cell(report.RevenueChartData.Count + 2, 2).Value = report.RevenueInRange;
        daily.Column(1).Style.DateFormat.Format = "dd/mm/yyyy";
        daily.Column(2).Style.NumberFormat.Format = "#,##0.##";

        if (orders.Count > 0)
        {
            var sheet = AddTable(workbook, "DonHang", "Mã đơn", "Ngày đặt (VN)", "Trạng thái đơn",
                "Phương thức", "Trạng thái thanh toán", "Tổng tiền (VND)");
            var row = 2;
            foreach (var order in orders)
            {
                sheet.Cell(row, 1).Value = order.Code;
                sheet.Cell(row, 2).Value = AdminReportService.ToVietnamTime(order.CreatedAt);
                sheet.Cell(row, 3).Value = AdminReportService.GetStatusName(order.Status);
                sheet.Cell(row, 4).Value = AdminReportService.GetPaymentMethodName(order.PaymentMethod);
                sheet.Cell(row, 5).Value = order.PaymentStatus.ToString();
                sheet.Cell(row++, 6).Value = order.TotalAmount;
            }
            sheet.Range(1, 1, row - 1, 6).SetAutoFilter();
            sheet.Column(2).Style.DateFormat.Format = "dd/mm/yyyy hh:mm";
            sheet.Column(6).Style.NumberFormat.Format = "#,##0.##";
        }

        if (report.TopSellingProducts.Count > 0)
        {
            var sheet = AddTable(workbook, "SanPhamBanChay", "Sản phẩm", "Số lượng đã giao", "Giá trị dòng hàng (VND)");
            var row = 2;
            foreach (var product in report.TopSellingProducts)
            {
                sheet.Cell(row, 1).Value = product.ProductName;
                sheet.Cell(row, 2).Value = product.TotalQuantity;
                sheet.Cell(row++, 3).Value = product.TotalRevenue;
            }
            sheet.Range(1, 1, row - 1, 3).SetAutoFilter();
            sheet.Column(1).Width = 50;
            sheet.Column(3).Style.NumberFormat.Format = "#,##0.##";
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static IXLWorksheet AddTable(XLWorkbook workbook, string name, params string[] headers)
    {
        var sheet = workbook.AddWorksheet(name);
        for (var index = 0; index < headers.Length; index++)
        {
            sheet.Cell(1, index + 1).Value = headers[index];
            sheet.Column(index + 1).Width = Math.Max(22, headers[index].Length + 4);
        }
        var heading = sheet.Range(1, 1, 1, headers.Length);
        heading.Style.Font.Bold = true;
        heading.Style.Fill.BackgroundColor = XLColor.LightGray;
        sheet.SheetView.FreezeRows(1);
        return sheet;
    }
}
