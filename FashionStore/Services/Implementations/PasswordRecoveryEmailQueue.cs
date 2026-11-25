using System.Threading.Channels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FashionStore.Services.Implementations;

public sealed class PasswordRecoveryEmailQueue(IServiceScopeFactory scopes, PasswordRecoveryOtp otp,
    ILogger<PasswordRecoveryEmailQueue> logger) : BackgroundService
{
    private sealed record Job(string ChallengeId, string? Email, string Code);
    private readonly Channel<Job> jobs = Channel.CreateBounded<Job>(new BoundedChannelOptions(100)
    {
        FullMode = BoundedChannelFullMode.Wait, SingleWriter = false, SingleReader = false
    });

    public bool TryEnqueue(string challengeId, string? email, string code) =>
        jobs.Writer.TryWrite(new Job(challengeId, email, code));

    protected override Task ExecuteAsync(CancellationToken stoppingToken) =>
        Task.WhenAll(WorkAsync(stoppingToken), WorkAsync(stoppingToken));

    private async Task WorkAsync(CancellationToken stoppingToken)
    {
        try
        {
            await foreach (var job in jobs.Reader.ReadAllAsync(stoppingToken))
            {
                if (!otp.IsPending(job.ChallengeId)) continue;
                try
                {
                    // Decoy jobs follow the same public status flow for unknown accounts.
                    if (job.Email != null)
                    {
                        using var scope = scopes.CreateScope();
                        var sender = scope.ServiceProvider.GetRequiredService<IPasswordRecoveryEmail>();
                        await sender.SendAsync(job.Email, job.Code, stoppingToken);
                    }
                    otp.SetDeliveryStatus(job.ChallengeId, true);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
                catch (Exception ex)
                {
                    otp.SetDeliveryStatus(job.ChallengeId, false);
                    // Never log the job, recipient, OTP, credentials or SMTP response text.
                    logger.LogError("OTP email delivery failed ({FailureType}).", ex.GetType().Name);
                }
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        jobs.Writer.TryComplete();
        return base.StopAsync(cancellationToken);
    }
}
