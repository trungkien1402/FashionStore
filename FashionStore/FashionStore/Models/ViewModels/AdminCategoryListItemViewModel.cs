using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminCategoryListItemViewModel
{
    public Category Category { get; set; } = null!;
    public int ProductCount { get; set; }
}