using System.Text.Json;

namespace FashionStore.Data;

public class VietnamAddresses(IWebHostEnvironment environment)
{
    private readonly Lazy<List<Province>> provinces = new(() =>
        JsonSerializer.Deserialize<List<Province>>(
            File.ReadAllText(Path.Combine(environment.WebRootPath, "js", "vietnam-addresses.json")),
            new JsonSerializerOptions(JsonSerializerDefaults.Web))!);

    public (string Province, string Ward)? Resolve(int? provinceCode, int? wardCode)
    {
        var province = provinces.Value.FirstOrDefault(p => p.Code == provinceCode);
        var ward = province?.Wards.FirstOrDefault(w => w.Code == wardCode);
        return province != null && ward != null ? (province.Name, ward.Name) : null;
    }

    private record Province(int Code, string Name, List<Ward> Wards);
    private record Ward(int Code, string Name);
}
