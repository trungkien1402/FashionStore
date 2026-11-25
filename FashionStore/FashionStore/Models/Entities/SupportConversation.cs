using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.Entities;

public class SupportConversation
{
    public int Id { get; set; }
    [MaxLength(450)] public string CustomerId { get; set; } = "";
    public ApplicationUser Customer { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
    public bool IsClosed { get; set; }
    public bool NeedsReply { get; set; }
    public List<SupportChatMessage> Messages { get; set; } = [];
}

public class SupportChatMessage
{
    public long Id { get; set; }
    public int ConversationId { get; set; }
    public SupportConversation Conversation { get; set; } = null!;
    [MaxLength(450)] public string AuthorId { get; set; } = "";
    public bool FromStaff { get; set; }
    [MaxLength(1000)] public string Text { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
