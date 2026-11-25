using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class ShipmentLocationRequest
{
    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }

    [Range(0, 10000)]
    public double? Accuracy { get; set; }
}