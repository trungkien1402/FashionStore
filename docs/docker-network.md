# Mạng riêng cho SQL Server trong Docker

Cấu hình chính: `FashionStore/docker-compose.yml`. Thư mục `FashionStore/FashionStore` là bản lưu cũ, không dùng khi triển khai.

- `web_public`: mặc định `172.30.10.0/24`, chỉ có web.
- `database_private`: mặc định `172.30.20.0/24`, có web và SQL Server, `internal: true`.
- Database không có `ports`, không công khai cổng 1433 ra host/LAN.
- Web kết nối tới SQL bằng tên dịch vụ `database,1433`, không dùng IP tĩnh.
- Web mặc định chỉ mở tại `http://127.0.0.1:8080`. `WEB_BIND_IP` có thể thay đổi khi chủ đích mở web cho LAN.
- SQL có volume `sql_data` giữ dữ liệu và healthcheck; web chờ SQL sẵn sàng trước khi chạy.

## Sử dụng

Trong thư mục `FashionStore` chứa file compose:

```powershell
Copy-Item .env.example .env
# Điền DB_PASSWORD trong .env bằng mật khẩu SQL riêng, mạnh.
docker compose config --quiet
docker compose up -d --build
```

Không đưa `.env` lên Git. Build context loại trừ `.env`, cấu hình Local riêng của máy và bản dự án lưu cũ. Không dùng `docker compose config` không có `--quiet` khi chia sẻ log vì nó có thể hiện mật khẩu đã nội suy.

Nếu subnet trùng mạng LAN/VPN/Docker khác, đổi `WEB_SUBNET` và `DB_SUBNET` thành hai dải không trùng nhau trước khi chạy.

## Kiểm tra

```powershell
docker compose ps
docker compose port database 1433
docker compose exec web printenv ASPNETCORE_ENVIRONMENT
```

Database không có published port; không thể kết nối vào container qua `localhost:1433` bằng cấu hình này. SQL Server cài trực tiếp trên Windows là dịch vụ khác và vẫn có thể lắng nghe cổng riêng của nó.

## Phạm vi

Thay đổi chỉ áp dụng cho Docker Compose, không chia subnet cho SQL Server Windows đang dùng bởi Visual Studio, không di chuyển/xóa database `FashionStore_Clone_20261127`. SQL trong Docker là database/volume riêng, không tự đọc dữ liệu SQL Windows.

Compose hiện vẫn là cấu hình phát triển (`Development`), web dùng tài khoản `sa` để chạy migration/seed. Trước khi đưa lên production, cần tách tài khoản migration khỏi tài khoản ứng dụng ít quyền, cấu hình TLS với chứng thư hợp lệ và reverse proxy HTTPS. Phân mạng không thay thế các kiểm soát đó.

Không chạy `docker compose down -v` nếu muốn giữ dữ liệu trong volume.
