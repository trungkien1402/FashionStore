using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace FashionStore.Services.Implementations;

public interface IPasswordRecoveryEmail
{
    bool IsConfigured { get; }
    Task SendAsync(string email, string code, CancellationToken cancellationToken = default);
}

public sealed class PasswordRecoveryEmail(IConfiguration configuration) : IPasswordRecoveryEmail
{
    private IConfigurationSection Settings => configuration.GetSection("PasswordRecovery");

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Settings["SmtpHost"])
        && MailAddress.TryCreate(Settings["FromEmail"], out _)
        && !string.IsNullOrWhiteSpace(Settings["SmtpUsername"])
        && !string.IsNullOrWhiteSpace(Settings["SmtpPassword"]);

    public async Task SendAsync(string email, string code, CancellationToken cancellationToken = default)
    {
        using var message = new MailMessage();
        message.From = new MailAddress(Settings["FromEmail"]!, "HNMTSHOP");
        message.To.Add(new MailAddress(email));
        message.Subject = "HNMTSHOP · Mã OTP đặt lại mật khẩu";
        message.BodyEncoding = Encoding.UTF8;
        message.IsBodyHtml = true;
        message.Body = $"<div style='font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#172033'><h2>Xác nhận đặt lại mật khẩu</h2><p>Nhập mã sau trên website HNMTSHOP để xác nhận yêu cầu:</p><p style='font-size:36px;font-weight:bold;letter-spacing:8px;padding:20px;background:#f1f5f9;border-radius:16px;text-align:center'>{WebUtility.HtmlEncode(code)}</p><p>Mã có hiệu lực {PasswordRecoveryOtp.LifetimeMinutes} phút, chỉ dùng một lần. Không chia sẻ mã với người khác.</p><p>Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p></div>";
        using var client = new SmtpClient(Settings["SmtpHost"], Settings.GetValue("SmtpPort", 587))
        {
            EnableSsl = true,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(Settings["SmtpUsername"], Settings["SmtpPassword"]),
            Timeout = 15000
        };
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(20));
        await client.SendMailAsync(message, timeout.Token);
    }
}
