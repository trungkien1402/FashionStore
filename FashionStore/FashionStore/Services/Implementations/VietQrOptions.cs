using System.Text.RegularExpressions;

namespace FashionStore.Services.Implementations;

public class VietQrOptions
{
    public bool Enabled { get; set; }
    public string BankId { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AccountNo { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    // Configure a provider template for production; compact2 is suitable for preview.
    public string Template { get; set; } = "compact2";

    public bool IsReady => Enabled &&
        Regex.IsMatch(BankId, "^[A-Za-z0-9]{2,30}$") &&
        Regex.IsMatch(AccountNo, "^[A-Za-z0-9]{1,19}$") &&
        Regex.IsMatch(Template, "^[A-Za-z0-9_]{1,100}$") &&
        !string.IsNullOrWhiteSpace(BankName) && !string.IsNullOrWhiteSpace(AccountName);
}
