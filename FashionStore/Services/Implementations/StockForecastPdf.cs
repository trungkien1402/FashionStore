using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FashionStore.Services.Implementations;

public static class StockForecastPdf
{
    public static byte[] Create(StockForecastReport report)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        return Document.Create(document => document.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(34);
            page.DefaultTextStyle(s => s.FontFamily("Lato").FontSize(10).FontColor("#262320"));
            page.Header().PaddingBottom(14).Column(header =>
            {
                header.Item().Text("HNMTSHOP").SemiBold().FontColor("#805E32");
                header.Item().Text("Doanh thu và dự báo nhập hàng").Bold().FontSize(25);
                header.Item().Text($"Kế hoạch tháng {report.TargetMonth:MM/yyyy}");
            });
            page.Content().Column(column =>
            {
                column.Spacing(10);
                column.Item().Text("Biến động doanh thu").Bold().FontSize(13);
                column.Item().Text($"Đã thanh toán: {report.PaidChange}. Giá trị đặt: {report.OrderedChange}.");
                column.Item().Text(StockForecastReport.RevenueBasis).FontSize(9);
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.RelativeColumn(2); c.RelativeColumn();
                        for (var i = 0; i < 4; i++) c.RelativeColumn(1.3f);
                    });
                    table.Header(h =>
                    {
                        foreach (var label in new[] { "Kỳ theo ngày đặt", "Tổng đơn", "Giá trị đặt", "Đã thanh toán", "Đã giao", "Đã hoàn" })
                            h.Cell().Element(Heading).Text(label);
                    });
                    Period(table, report.PreviousStart, report.RecentStart, report.Previous);
                    Period(table, report.RecentStart, report.EndExclusive, report.Recent);
                });
                column.Item().Text("Màu và size khách mua nhiều trong 30 ngày gần nhất").Bold().FontSize(13);
                if (report.Preferences.Count == 0)
                    column.Item().Text("Kỳ này chưa có đơn đã giao để xếp hạng màu và size.");
                foreach (var group in report.Preferences)
                {
                    var colors = group.Colors.Count == 0 ? "Chưa ghi màu" : string.Join(", ", group.Colors.Select(v => $"{v.Value} ({v.Units})"));
                    var sizes = group.Sizes.Count == 0 ? "Chưa ghi size" : string.Join(", ", group.Sizes.Select(v => $"{v.Value} ({v.Units})"));
                    column.Item().Text($"{group.Category} · {group.Units} món | Màu: {colors} | Size: {sizes}");
                }
                column.Item().Text($"Gợi ý mùa vụ · {report.SeasonalIdea.Theme}").Bold().FontSize(13);
                column.Item().Text($"{report.SeasonalIdea.Items}. Màu nên thử: {report.SeasonalIdea.Colors}.");
                column.Item().Text(StockForecastReport.SeasonNote).FontSize(9);
                column.Item().Text(report.Insight);
                column.Item().Text($"Gợi ý nhập hàng · {report.SkusToOrder} SKU cần xem xét").Bold().FontSize(13);
                if (report.Rows.Count == 0)
                    column.Item().Text("Chưa có SKU đang bán với dữ liệu đơn đã giao trong hai kỳ.");
                else
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(4);
                            for (var i = 0; i < 5; i++) c.RelativeColumn();
                        });
                        table.Header(h =>
                        {
                            foreach (var label in new[] { "Sản phẩm / SKU", "Kỳ trước", "Kỳ gần", "Tồn", "Dự báo", "Nhập" })
                                h.Cell().Element(Heading).Text(label);
                        });
                        foreach (var row in report.Rows)
                        {
                            var label = $"{row.ProductName}\n{row.Sku} · {row.Size} · {row.Color}";
                            if (row.SparseData) label += " · Ít dữ liệu";
                            table.Cell().Element(Cell).Text(label);
                            foreach (var value in new long[] { row.PreviousUnits, row.RecentUnits, row.Stock, row.Expected, row.Suggested })
                                table.Cell().Element(Cell).AlignRight().Text(value.ToString("N0"));
                        }
                    });
                column.Item().Text(StockForecastReport.Method).FontSize(9);
                column.Item().Text(StockForecastReport.Assumptions).FontSize(9);
            });
            page.Footer().AlignRight().Text(t => { t.Span("Trang "); t.CurrentPageNumber(); });
        })).GeneratePdf();
    }

    private static void Period(TableDescriptor table, DateTime start, DateTime end, ForecastPeriod period)
    {
        table.Cell().Element(Cell).Text($"{start:dd/MM/yyyy} - {end.AddDays(-1):dd/MM/yyyy}");
        table.Cell().Element(Cell).AlignRight().Text(period.Orders.ToString("N0"));
        table.Cell().Element(Cell).AlignRight().Text($"{period.Ordered:N0} ₫");
        table.Cell().Element(Cell).AlignRight().Text($"{period.Paid:N0} ₫");
        table.Cell().Element(Cell).AlignRight().Text($"{period.DeliveredAmount:N0} ₫");
        table.Cell().Element(Cell).AlignRight().Text($"{period.Refunded:N0} ₫");
    }

    private static IContainer Cell(IContainer c) => c.BorderBottom(.5f).BorderColor("#E8E1D8").Padding(5);
    private static IContainer Heading(IContainer c) => c.Background("#F2EDE6").Padding(5);
}
