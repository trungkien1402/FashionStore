using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;

namespace FashionStore.Services.Implementations;

// Single-instance store, matching the application's current in-memory session deployment.
// Only opaque challenge IDs go into the browser; Identity reset tokens stay on the server.
public sealed class PasswordRecoveryOtp(TimeProvider clock) : IDisposable
{
    private readonly MemoryCache cache = new(new MemoryCacheOptions { SizeLimit = 10000 });
    private readonly object gate = new();
    public const int LifetimeMinutes = 10;
    private sealed class Challenge
    {
        public required string AccountKey { get; init; }
        public required string Email { get; init; }
        public string? UserId { get; init; }
        public string? ResetToken { get; init; }
        public required byte[] Hash { get; init; }
        public required DateTimeOffset Expires { get; init; }
        public int Attempts { get; set; }
        public bool Verified { get; set; }
        public string Delivery { get; set; } = "pending";
    }
    private sealed record AccountChallenge(string Id, DateTimeOffset SentAt);
    public sealed record Issued(string Id, string Code);
    public sealed record Authorized(string UserId, string Email, string ResetToken);

    public Issued? Issue(string email, string? userId, string? resetToken)
    {
        var key = "account:" + Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(email.Trim().ToUpperInvariant())));
        lock (gate)
        {
            var now = clock.GetUtcNow();
            if (cache.TryGetValue<AccountChallenge>(key, out var previous))
            {
                if (now - previous!.SentAt < TimeSpan.FromSeconds(60)) return null;
                cache.Remove(previous.Id);
            }
            var id = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            var code = RandomNumberGenerator.GetInt32(1000000).ToString("D6", CultureInfo.InvariantCulture);
            var entry = new Challenge { AccountKey = key, Email = email, UserId = userId, ResetToken = resetToken,
                Hash = Hash(id, code), Expires = now.AddMinutes(LifetimeMinutes) };
            cache.Set(id, entry, Options());
            cache.Set(key, new AccountChallenge(id, now), Options());
            return new Issued(id, code);
        }
    }

    public bool IsPending(string? id)
    {
        lock (gate) return Get(id) is { Verified: false, Attempts: < 5 };
    }
    public bool IsVerified(string? id)
    {
        lock (gate) return Get(id) is { Verified: true };
    }
    public bool Verify(string? id, string code)
    {
        lock (gate)
        {
            var entry = Get(id);
            if (entry == null || entry.Verified || entry.Attempts >= 5) return false;
            entry.Attempts++;
            if (code.Length != 6 || code.Any(c => c is < '0' or > '9')
                || !CryptographicOperations.FixedTimeEquals(entry.Hash, Hash(id!, code))
                || entry.UserId == null || entry.ResetToken == null) return false;
            entry.Verified = true;
            return true;
        }
    }
    public Authorized? TakeVerified(string? id)
    {
        lock (gate)
        {
            var entry = Get(id);
            if (entry is not { Verified: true, UserId: not null, ResetToken: not null }) return null;
            cache.Remove(id!);
            return new Authorized(entry.UserId, entry.Email, entry.ResetToken);
        }
    }
    public void Revoke(string id) { lock (gate) cache.Remove(id); }
    public string DeliveryStatus(string? id) { lock (gate) return Get(id)?.Delivery ?? "expired"; }
    public void SetDeliveryStatus(string id, bool succeeded)
    {
        lock (gate) { if (Get(id) is { } entry) entry.Delivery = succeeded ? "processed" : "failed"; }
    }
    private Challenge? Get(string? id) => id is { Length: 64 }
        && cache.TryGetValue<Challenge>(id, out var entry) && entry!.Expires > clock.GetUtcNow() ? entry : null;
    private static byte[] Hash(string id, string code) => SHA256.HashData(Encoding.UTF8.GetBytes(id + ":" + code));
    private static MemoryCacheEntryOptions Options() => new MemoryCacheEntryOptions()
        .SetSize(1).SetAbsoluteExpiration(TimeSpan.FromMinutes(LifetimeMinutes));
    public void Dispose() => cache.Dispose();
}
