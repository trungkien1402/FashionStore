namespace FashionStore.Services;

/// <summary>
/// Singleton service theo dõi admin/staff đang hoạt động thực tế.
/// Hỗ trợ push realtime qua event khi trạng thái online/offline thay đổi.
/// Timeout không hoạt động là 20 giây.
/// </summary>
public sealed class AdminPresenceService : IDisposable
{
    private readonly Dictionary<string, DateTime> _sessions = new();
    private readonly Lock _lock = new();
    public static readonly TimeSpan InactivityTimeout = TimeSpan.FromSeconds(20);

    public event Action<bool>? OnPresenceChanged;
    private bool _lastReportedState = false;
    private readonly Timer _cleanupTimer;

    public AdminPresenceService()
    {
        // Quét timeout định kỳ mỗi 2 giây
        _cleanupTimer = new Timer(CheckTimeouts, null, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(2));
    }

    private void CheckTimeouts(object? state)
    {
        CheckAndNotify();
    }

    private bool IsAnyAdminOnlineUnsafe()
    {
        var cutoff = DateTime.UtcNow - InactivityTimeout;
        var stale = _sessions.Where(kv => kv.Value < cutoff).Select(kv => kv.Key).ToList();
        foreach (var key in stale) _sessions.Remove(key);
        return _sessions.Count > 0;
    }

    private void CheckAndNotify()
    {
        bool stateChanged = false;
        bool currentState;
        lock (_lock)
        {
            currentState = IsAnyAdminOnlineUnsafe();
            if (currentState != _lastReportedState)
            {
                _lastReportedState = currentState;
                stateChanged = true;
            }
        }
        if (stateChanged)
        {
            OnPresenceChanged?.Invoke(currentState);
        }
    }

    public void Heartbeat(string? userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return;
        lock (_lock)
        {
            _sessions[userId] = DateTime.UtcNow;
        }
        CheckAndNotify();
    }

    public void Remove(string? userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return;
        lock (_lock)
        {
            _sessions.Remove(userId);
        }
        CheckAndNotify();
    }

    public bool IsAnyAdminOnline()
    {
        lock (_lock)
        {
            return IsAnyAdminOnlineUnsafe();
        }
    }

    public void Dispose()
    {
        _cleanupTimer.Dispose();
    }
}
