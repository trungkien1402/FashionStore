using System.Globalization;
using System.IO.Compression;
using ClosedXML.Excel;
using FashionStore.Models.Entities;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

public partial class AdminOperationsController
{
    private static readonly string[] ImportHeaders =
        ["Tên sản phẩm", "Slug", "Danh mục ID", "Giá", "SKU", "Size", "Màu", "Tồn kho"];

    [HttpGet]
    public IActionResult Import() => View(new ImportPreview([], [], false));

    [HttpGet]
    public IActionResult ImportTemplate()
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.AddWorksheet("SanPham");
        for (var column = 0; column < ImportHeaders.Length; column++)
        {
            sheet.Cell(1, column + 1).Value = ImportHeaders[column];
            sheet.Column(column + 1).Width = 22;
        }
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "FashionStore_NhapSanPham.xlsx");
    }

    [HttpPost, RequestSizeLimit(2_200_000)]
    public async Task<IActionResult> Import(IFormFile? file, bool apply, [FromServices] FashionStore.Data.ApplicationDbContext context)
    {
        if (file == null || file.Length is < 1 or > 2_000_000 ||
            !string.Equals(Path.GetExtension(file.FileName), ".xlsx", StringComparison.OrdinalIgnoreCase))
            return View(new ImportPreview([], ["Chọn tệp .xlsx tối đa 2 MB."], false));

        var rows = new List<ImportRow>();
        var errors = new List<string>();
        try
        {
            using var input = new MemoryStream();
            await file.CopyToAsync(input);
            input.Position = 0;
            using (var archive = new ZipArchive(input, ZipArchiveMode.Read, leaveOpen: true))
            {
                if (archive.Entries.Count > 500 || archive.Entries.Sum(entry => entry.Length) > 15_000_000)
                    return View(new ImportPreview([], ["Tệp vượt giới hạn dữ liệu giải nén."], false));
            }
            input.Position = 0;
            using var workbook = new XLWorkbook(input);
            var sheet = workbook.Worksheets.First();
            if (!ImportHeaders.Select((header, i) => sheet.Cell(1, i + 1).GetString() == header).All(match => match))
                return View(new ImportPreview([], ["Tiêu đề cột khác tệp mẫu."], false));
            var end = sheet.LastRowUsed()?.RowNumber() ?? 1;
            if (end is < 2 or > 501)
                return View(new ImportPreview([], ["Tệp phải có từ 1 đến 500 dòng dữ liệu."], false));

            for (var row = 2; row <= end; row++)
            {
                var cells = Enumerable.Range(1, 8).Select(column => sheet.Cell(row, column)).ToArray();
                if (cells.All(c => c.IsEmpty())) continue;
                if (cells.Any(c => c.HasFormula))
                {
                    errors.Add($"Dòng {row}: chỉ nhận giá trị trực tiếp.");
                    continue;
                }
                var values = cells.Select(c => c.GetString().Trim()).ToArray();
                if (values[0].Length is < 1 or > 150 || values[1].Length is < 1 or > 150 ||
                    values[1].Any(c => !char.IsAsciiLetterOrDigit(c) && c != '-') ||
                    !int.TryParse(values[2], out var category) || category <= 0 ||
                    !cells[3].TryGetValue<decimal>(out var price) || price is < 0 or > 999999999999m ||
                    decimal.Truncate(price) != price || values[4].Length is < 1 or > 100 ||
                    values[5].Length is < 1 or > 100 || values[6].Length is < 1 or > 100 ||
                    !int.TryParse(values[7], NumberStyles.None, CultureInfo.InvariantCulture, out var stock))
                {
                    errors.Add($"Dòng {row}: kiểm tra tên, slug, ID danh mục, giá VND, SKU, size, màu và tồn.");
                    continue;
                }
                rows.Add(new ImportRow(row, values[0], values[1].ToLowerInvariant(), category,
                    price, values[4], values[5], values[6], stock));
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException and not OutOfMemoryException)
        {
            return View(new ImportPreview([], ["Không đọc được tệp Excel."], false));
        }

        if (rows.Count == 0)
            errors.Add("Chưa có dòng hợp lệ để nhập.");
        var groups = rows.GroupBy(r => r.Slug).ToList();
        foreach (var duplicate in rows.GroupBy(r => r.Sku, StringComparer.OrdinalIgnoreCase).Where(g => g.Count() > 1))
            errors.Add($"Dòng {string.Join(", ", duplicate.Select(r => r.Line))}: SKU bị trùng.");
        foreach (var group in groups.Where(g => g.Select(r => (r.Name, r.CategoryId)).Distinct().Count() > 1))
            errors.Add($"Slug {group.Key}: tên và danh mục phải giống nhau giữa các biến thể.");

        await using var transaction = await context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        var slugs = groups.Select(g => g.Key).ToList();
        var skus = rows.Select(r => r.Sku).ToList();
        var categories = rows.Select(r => r.CategoryId).Distinct().ToList();
        var existingSlugs = await context.Products.Where(p => slugs.Contains(p.Slug)).Select(p => p.Slug).ToListAsync();
        var existingSkus = await context.ProductVariants.Where(v => skus.Contains(v.SKU)).Select(v => v.SKU).ToListAsync();
        var activeCategories = await context.Categories.Where(c => categories.Contains(c.Id) && c.IsActive)
            .Select(c => c.Id).ToListAsync();
        foreach (var row in rows)
        {
            if (existingSlugs.Contains(row.Slug, StringComparer.OrdinalIgnoreCase))
                errors.Add($"Dòng {row.Line}: slug đã có trong cửa hàng.");
            if (existingSkus.Contains(row.Sku, StringComparer.OrdinalIgnoreCase))
                errors.Add($"Dòng {row.Line}: SKU đã có trong cửa hàng.");
            if (!activeCategories.Contains(row.CategoryId))
                errors.Add($"Dòng {row.Line}: danh mục không tồn tại hoặc đang tắt.");
        }
        if (!apply || errors.Count > 0)
            return View(new ImportPreview(rows, errors, false));

        foreach (var group in groups)
        {
            var first = group.First();
            context.Products.Add(new Product
            {
                Name = first.Name, Slug = first.Slug, CategoryId = first.CategoryId,
                Price = group.Min(row => row.Price), IsActive = false,
                Variants = group.Select(row => new ProductVariant
                {
                    SKU = row.Sku, Size = row.Size, Color = row.Color, Price = row.Price, StockQuantity = row.Stock
                }).ToList()
            });
        }
        context.StockActorId = Actor;
        context.StockReason = "Nhập sản phẩm bằng Excel";
        SalesRules.Audit(context, Actor, "CatalogImported", "Products", $"{groups.Count} sản phẩm, {rows.Count} biến thể");
        try
        {
            await context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateException)
        {
            return View(new ImportPreview(rows, ["Không lưu được lô nhập. Kiểm tra các thay đổi vừa phát sinh."], false));
        }
        return View(new ImportPreview(rows, [], true));
    }
}

public record ImportRow(int Line, string Name, string Slug, int CategoryId, decimal Price,
    string Sku, string Size, string Color, int Stock);
public record ImportPreview(List<ImportRow> Rows, List<string> Errors, bool Applied);
