using System.Globalization;
using FashionStore.Models.ViewModels;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FashionStore.Services.Implementations;

public static class AdminReportPdf
{
    private const string Accent = "#805E32";
    private static readonly CultureInfo Vietnamese = CultureInfo.GetCultureInfo("vi-VN");

    public static byte[] Create(AdminDashboardViewModel report)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        return Document.Create(document => document.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(34);
            page.DefaultTextStyle(style => style.FontFamily("Lato").FontSize(10).FontColor("#262320"));
            page.Header().PaddingBottom(14).Column(header =>
            {
                header.Item().Text("HNMTSHOP").SemiBold().FontColor(Accent);
                header.Item().Text("Báo cáo bán hàng").Bold().FontSize(26);
                header.Item().Text($"{report.StartDate:dd/MM/yyyy} - {report.EndDate:dd/MM/yyyy} · Giờ Việt Nam");
            });
            page.Content().Column(content =>
            {
                content.Spacing(12);
                content.Item().Table(table =>
                {
                    table.ColumnsDefinition(cols => { cols.RelativeColumn(2); cols.RelativeColumn(); });
                    AddRow(table, "Tổng đơn đặt trong kỳ", report.TotalOrders.ToString(Vietnamese));
                    AddRow(table, "Tổng giá trị đơn đặt", Money(report.OrderedAmount));
                    AddRow(table, "Chờ xác nhận / Đã giao / Đã hủy",
                        $"{report.PendingOrders} / {report.DeliveredOrders} / {report.CancelledOrders}");
                    AddRow(table, "Giá trị đơn đã giao", Money(report.RevenueInRange));
                    AddRow(table, "Giá trị đã thanh toán", Money(report.PaidAmount));
                });
                content.Item().Text(AdminDashboardViewModel.RevenueDefinition).FontSize(9);
                content.Item().Text("Đơn đặt gần nhất trong kỳ").Bold().FontSize(13);
                if (report.RecentOrders.Count == 0)
                    content.Item().Text("Kỳ này chưa có đơn hàng.");
                else
                    content.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(); cols.RelativeColumn(); cols.RelativeColumn(); cols.RelativeColumn();
                        });
                        table.Header(header =>
                        {
                            foreach (var label in new[] { "Mã đơn", "Ngày đặt", "Trạng thái", "Tổng tiền" })
                                header.Cell().Background("#F2EDE6").Padding(6).Text(label).SemiBold();
                        });
                        foreach (var order in report.RecentOrders)
                        {
                            table.Cell().Element(Cell).Text(order.OrderCode);
                            table.Cell().Element(Cell).Text(AdminReportService.ToVietnamTime(order.CreatedAt).ToString("dd/MM/yyyy HH:mm"));
                            table.Cell().Element(Cell).Text(AdminReportService.GetStatusName(order.Status));
                            table.Cell().Element(Cell).AlignRight().Text(Money(order.TotalAmount));
                        }
                    });
                content.Item().Text("Giá trị đơn đã giao theo ngày đặt").Bold().FontSize(13);
                if (report.RevenueChartData.All(value => value == 0))
                    content.Item().Text("Kỳ này chưa ghi nhận giá trị đơn đã giao.");
                else
                    content.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols => { cols.RelativeColumn(2); cols.RelativeColumn(); });
                        table.Header(header =>
                        {
                            header.Cell().Background("#F2EDE6").Padding(6).Text("Ngày đặt").SemiBold();
                            header.Cell().Background("#F2EDE6").Padding(6).AlignRight().Text("Giá trị").SemiBold();
                        });
                        for (var i = 0; i < report.RevenueChartData.Count; i++)
                        {
                            if (report.RevenueChartData[i] == 0) continue;
                            AddRow(table, report.StartDate.AddDays(i).ToString("dd/MM/yyyy"), Money(report.RevenueChartData[i]));
                        }
                    });
            });
            page.Footer().PaddingTop(10).Row(footer =>
            {
                footer.RelativeItem().Text($"Xuất lúc {AdminReportService.ToVietnamTime(DateTime.UtcNow):dd/MM/yyyy HH:mm} (VN)").FontSize(9);
                footer.AutoItem().Text(text => { text.Span("Trang "); text.CurrentPageNumber(); });
            });
        })).GeneratePdf();
    }

    private static string Money(decimal value) => $"{value.ToString("N0", Vietnamese)} ₫";
    private static IContainer Cell(IContainer cell) => cell.BorderBottom(0.5f).BorderColor("#E8E1D8").Padding(6);
    private static void AddRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Element(Cell).Text(label);
        table.Cell().Element(Cell).AlignRight().Text(value).SemiBold();
    }
}
