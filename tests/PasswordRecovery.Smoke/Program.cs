using System.ComponentModel.DataAnnotations;
using System.Text;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using FashionStore.Services.Implementations;

var services = new ServiceCollection();
services.AddLogging();
services.AddDataProtection().UseEphemeralDataProtectionProvider();
services.AddIdentityCore<ApplicationUser>(o => o.Password.RequiredLength = 8)
    .AddUserStore<MemoryStore>().AddDefaultTokenProviders();
services.Configure<DataProtectionTokenProviderOptions>(o => o.TokenLifespan = TimeSpan.FromMinutes(30));
using var provider = services.BuildServiceProvider();
var users = provider.GetRequiredService<UserManager<ApplicationUser>>();
var user = new ApplicationUser { UserName = "recovery-test", Email = "test@example.invalid", IsActive = true };
Check((await users.CreateAsync(user, "OldPassword1!")).Succeeded, "create fixture");
var token = await users.GeneratePasswordResetTokenAsync(user);
var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
Check(Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(encoded)) == token, "token URL round trip");
Check(!(await users.ResetPasswordAsync(user, token + "tampered", "NewPassword2!")).Succeeded, "reject tampered token");
var other = new ApplicationUser { UserName = "other", Email = "other@example.invalid" };
Check((await users.CreateAsync(other, "OtherPassword1!")).Succeeded, "create second fixture");
Check(!(await users.ResetPasswordAsync(other, token, "NewPassword2!")).Succeeded, "reject another user's token");
Check(!(await users.ResetPasswordAsync(user, token, "weak")).Succeeded, "reject weak password");
Check((await users.ResetPasswordAsync(user, token, "NewPassword2!")).Succeeded, "reset valid token");
Check(await users.CheckPasswordAsync(user, "NewPassword2!"), "new password works");
Check(!await users.CheckPasswordAsync(user, "OldPassword1!"), "old password rejected");
Check(!(await users.ResetPasswordAsync(user, token, "ReplayPassword3!")).Succeeded, "reject token replay");
var expires = await users.GeneratePasswordResetTokenAsync(user);
provider.GetRequiredService<IOptions<DataProtectionTokenProviderOptions>>().Value.TokenLifespan = TimeSpan.FromSeconds(-1);
Check(!(await users.ResetPasswordAsync(user, expires, "ExpiredPassword3!")).Succeeded, "reject expired token");
var model = new ResetPasswordViewModel { Password = "NewPassword2!", ConfirmPassword = "different" };
Check(!Validator.TryValidateObject(model, new ValidationContext(model), new List<ValidationResult>(), true), "reject mismatched confirmation");
var clock = new TestClock();
using var otp = new PasswordRecoveryOtp(clock);
var issued = otp.Issue("test@example.invalid", "user-1", "server-only-token")!;
Check(issued.Code.Length == 6 && issued.Code.All(char.IsAsciiDigit), "OTP has six digits");
Check(otp.TakeVerified(issued.Id) == null, "cannot reset without OTP verification");
Check(otp.Issue("TEST@example.invalid", "user-1", "token") == null, "per-account resend cooldown ignores casing");
Check(!otp.Verify(new string('A', 64), issued.Code), "another browser cannot use OTP without challenge");
Check(otp.Verify(issued.Id, issued.Code), "correct OTP verifies");
Check(!otp.Verify(issued.Id, issued.Code), "OTP verification is single use");
Check(otp.TakeVerified(issued.Id)?.ResetToken == "server-only-token", "verified challenge authorizes server-held token");
Check(otp.TakeVerified(issued.Id) == null, "verified challenge consumed once");
clock.Advance(TimeSpan.FromSeconds(61));
var locked = otp.Issue("test@example.invalid", "user-1", "token")!;
var wrong = locked.Code == "000000" ? "000001" : "000000";
for (var i = 0; i < 5; i++) Check(!otp.Verify(locked.Id, wrong), "wrong OTP rejected " + (i + 1));
Check(!otp.Verify(locked.Id, locked.Code), "five failures lock challenge even for correct OTP");
clock.Advance(TimeSpan.FromSeconds(61));
var newer = otp.Issue("test@example.invalid", "user-1", "new-token")!;
Check(!otp.Verify(locked.Id, locked.Code), "resend invalidates old challenge");
clock.Advance(TimeSpan.FromMinutes(10));
Check(!otp.Verify(newer.Id, newer.Code), "OTP expires after ten minutes");
var decoy = otp.Issue("unknown@example.invalid", null, null)!;
Check(!otp.Verify(decoy.Id, decoy.Code), "unknown account never gains reset authorization");
var concurrent = otp.Issue("concurrent@example.invalid", "user-2", "token")!;
otp.Verify(concurrent.Id, concurrent.Code);
var successes = 0;
Parallel.For(0, 30, _ => { if (otp.TakeVerified(concurrent.Id) != null) Interlocked.Increment(ref successes); });
Check(successes == 1, "concurrent reset submissions consume exactly once");
var fakeEmail = new DelayedEmail();
using var mailProvider = new ServiceCollection().AddLogging()
    .AddSingleton<IPasswordRecoveryEmail>(fakeEmail).BuildServiceProvider();
using var queue = new PasswordRecoveryEmailQueue(mailProvider.GetRequiredService<IServiceScopeFactory>(), otp,
    Microsoft.Extensions.Logging.Abstractions.NullLogger<PasswordRecoveryEmailQueue>.Instance);
await queue.StartAsync(CancellationToken.None);
var slow = otp.Issue("slow@example.invalid", "user-3", "token")!;
Check(queue.TryEnqueue(slow.Id, "slow@example.invalid", slow.Code), "enqueue returns without waiting for SMTP");
await fakeEmail.Started.Task.WaitAsync(TimeSpan.FromSeconds(3));
Check(otp.DeliveryStatus(slow.Id) == "pending", "OTP page remains available while SMTP is blocked");
var skipped = otp.Issue("decoy@example.invalid", null, null)!;
queue.TryEnqueue(skipped.Id, null, skipped.Code);
await WaitUntil(() => otp.DeliveryStatus(skipped.Id) == "processed");
Check(true, "second worker processes other requests while one SMTP send is blocked");
fakeEmail.Release.TrySetResult();
await WaitUntil(() => otp.DeliveryStatus(slow.Id) == "processed");
Check(true, "successful background delivery updates status");
fakeEmail.Fail = true;
var failed = otp.Issue("failure@example.invalid", "user-4", "token")!;
queue.TryEnqueue(failed.Id, "failure@example.invalid", failed.Code);
await WaitUntil(() => otp.DeliveryStatus(failed.Id) == "failed");
Check(true, "SMTP failure visible through status instead of waiting on request");
await queue.StopAsync(CancellationToken.None);
Check(!queue.TryEnqueue("unused", null, "000000"), "stopped queue rejects new jobs");
using var boundedQueue = new PasswordRecoveryEmailQueue(mailProvider.GetRequiredService<IServiceScopeFactory>(), otp,
    Microsoft.Extensions.Logging.Abstractions.NullLogger<PasswordRecoveryEmailQueue>.Instance);
Check(Enumerable.Range(0, 100).All(_ => boundedQueue.TryEnqueue("unused", null, "000000")), "bounded queue accepts its capacity");
Check(!boundedQueue.TryEnqueue("overflow", null, "000000"), "full queue rejects immediately without blocking HTTP request");
Console.WriteLine("All password recovery smoke checks passed. No database or email used.");

static async Task WaitUntil(Func<bool> predicate)
{
    using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(3));
    while (!predicate()) await Task.Delay(10, timeout.Token);
}

static void Check(bool condition, string name)
{
    if (!condition) throw new Exception("FAILED: " + name);
    Console.WriteLine("PASS: " + name);
}

sealed class TestClock : TimeProvider
{
    DateTimeOffset now = DateTimeOffset.UtcNow;
    public override DateTimeOffset GetUtcNow() => now;
    public void Advance(TimeSpan amount) => now += amount;
}

sealed class DelayedEmail : IPasswordRecoveryEmail
{
    public bool IsConfigured => true;
    public bool Fail { get; set; }
    public TaskCompletionSource Started { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
    public TaskCompletionSource Release { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
    public async Task SendAsync(string email, string code, CancellationToken cancellationToken = default)
    {
        Started.TrySetResult();
        await Release.Task.WaitAsync(cancellationToken);
        if (Fail) throw new System.Net.Mail.SmtpException("Simulated failure");
    }
}

sealed class MemoryStore : IUserPasswordStore<ApplicationUser>, IUserSecurityStampStore<ApplicationUser>
{
    readonly Dictionary<string, ApplicationUser> data = new();
    public void Dispose() { }
    public Task<IdentityResult> CreateAsync(ApplicationUser u, CancellationToken ct) { data[u.Id] = u; return Task.FromResult(IdentityResult.Success); }
    public Task<IdentityResult> UpdateAsync(ApplicationUser u, CancellationToken ct) { data[u.Id] = u; return Task.FromResult(IdentityResult.Success); }
    public Task<IdentityResult> DeleteAsync(ApplicationUser u, CancellationToken ct) { data.Remove(u.Id); return Task.FromResult(IdentityResult.Success); }
    public Task<ApplicationUser?> FindByIdAsync(string id, CancellationToken ct) => Task.FromResult(data.GetValueOrDefault(id));
    public Task<ApplicationUser?> FindByNameAsync(string name, CancellationToken ct) => Task.FromResult(data.Values.FirstOrDefault(u => u.NormalizedUserName == name));
    public Task<string> GetUserIdAsync(ApplicationUser u, CancellationToken ct) => Task.FromResult(u.Id);
    public Task<string?> GetUserNameAsync(ApplicationUser u, CancellationToken ct) => Task.FromResult(u.UserName);
    public Task SetUserNameAsync(ApplicationUser u, string? name, CancellationToken ct) { u.UserName = name; return Task.CompletedTask; }
    public Task<string?> GetNormalizedUserNameAsync(ApplicationUser u, CancellationToken ct) => Task.FromResult(u.NormalizedUserName);
    public Task SetNormalizedUserNameAsync(ApplicationUser u, string? name, CancellationToken ct) { u.NormalizedUserName = name; return Task.CompletedTask; }
    public Task SetPasswordHashAsync(ApplicationUser u, string? hash, CancellationToken ct) { u.PasswordHash = hash; return Task.CompletedTask; }
    public Task<string?> GetPasswordHashAsync(ApplicationUser u, CancellationToken ct) => Task.FromResult(u.PasswordHash);
    public Task<bool> HasPasswordAsync(ApplicationUser u, CancellationToken ct) => Task.FromResult(u.PasswordHash != null);
    public Task SetSecurityStampAsync(ApplicationUser u, string stamp, CancellationToken ct) { u.SecurityStamp = stamp; return Task.CompletedTask; }
    public Task<string?> GetSecurityStampAsync(ApplicationUser u, CancellationToken ct) => Task.FromResult(u.SecurityStamp);
}
