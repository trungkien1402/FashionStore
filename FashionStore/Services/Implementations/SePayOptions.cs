namespace FashionStore.Services.Implementations;

public class SePayOptions
{
    public const string Section = "SePay";

    public string ApiKey { get; set; } = string.Empty;

    public string AccountNumber { get; set; } = string.Empty;

    public bool IsReady => !string.IsNullOrWhiteSpace(ApiKey);
}
