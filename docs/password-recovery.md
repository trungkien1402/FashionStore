# Quên mật khẩu bằng OTP

Luồng: Đăng nhập → Quên mật khẩu → nhập email → nhận OTP 6 số → xác nhận OTP → đặt mật khẩu mới trên website → đăng nhập.
Email chỉ chứa mã OTP, không có liên kết hay mật khẩu mới.

## Cấu hình email

Lưu trong .NET User Secrets của project FashionStore (Visual Studio → Manage User Secrets), không lưu mật khẩu vào Git:

| Khóa | Giá trị |
| --- | --- |
| PasswordRecovery:SmtpHost | smtp.gmail.com |
| PasswordRecovery:SmtpPort | 587 (STARTTLS) |
| PasswordRecovery:FromEmail | Gmail người gửi |
| PasswordRecovery:SmtpUsername | Cùng Gmail người gửi |
| PasswordRecovery:SmtpPassword | Mật khẩu ứng dụng của chính Gmail đó, bỏ khoảng trắng |

Biến môi trường dùng hai dấu gạch dưới thay cho dấu hai chấm. Không cần PublicOrigin cho luồng OTP.
Khởi động lại website ở Development sau khi cấu hình User Secrets.

## Quy tắc

- OTP ngẫu nhiên mật mã gồm 6 số, hiệu lực 10 phút kể từ yêu cầu (bao gồm bước nhập mật khẩu).
- Chỉ lưu hash OTP trên server. Identity reset token ở server, không đưa vào HTML, URL hay log.
- Cookie HttpOnly/SameSite=Strict giữ mã phiên ngẫu nhiên, không chứa OTP, email hay reset token. Cookie Secure trên HTTPS.
- Cùng email chỉ yêu cầu mã mới sau 60 giây; mã mới vô hiệu mã/phiên cũ.
- Tối đa 5 lần thử OTP mỗi phiên; OTP xác nhận một lần. Quyền đặt mật khẩu được tiêu thụ nguyên tử trước khi đổi, ngăn gửi đồng thời/replay.
- Giới hạn yêu cầu gửi 3 lần/phút/IP, xác nhận/đổi 10 lần/phút/IP. POST có antiforgery.
- Email không tồn tại/không hoạt động đi qua trang OTP giống các tài khoản khác nhưng không nhận mã và không thể đặt mật khẩu.
- SMTP thất bại được ghi log bằng loại lỗi; không log thông tin mật.
- HTTP chỉ đưa yêu cầu vào hàng đợi rồi chuyển ngay sang trang nhập OTP, không chờ SMTP. Hai tác vụ nền gửi email; hàng đợi giới hạn 100 yêu cầu và từ chối nhanh khi đầy.
- Trang nhập OTP tự kiểm tra trạng thái gửi mỗi 1,5 giây trong tối đa khoảng một phút; báo gửi lỗi và hướng dẫn yêu cầu lại. Trạng thái xử lý không xác nhận email có tài khoản.
- Mật khẩu mới tuân theo Identity, mật khẩu cũ không còn đăng nhập được. Cookie cũ được kiểm tra security stamp mỗi phút.

Kho OTP hiện dùng bộ nhớ có giới hạn, phù hợp triển khai một instance như session hiện tại. Khởi động lại ứng dụng làm hết hiệu lực các OTP/phiên xác nhận đang chờ. Nếu chạy nhiều instance, cần chuyển kho OTP và session sang kho dùng chung với kiểm tra/tiêu thụ nguyên tử.
Hàng đợi email cũng nằm trong bộ nhớ; khởi động lại làm mất các email chưa gửi. Khi triển khai nhiều instance hoặc cần giữ hàng đợi qua lần khởi động lại, dùng hàng đợi bền vững cùng kho OTP dùng chung.

## Kiểm thử

```powershell
$env:DOTNET_CLI_TELEMETRY_OPTOUT='1'
dotnet run --project tests/PasswordRecovery.Smoke/PasswordRecovery.Smoke.csproj -c Release
```

Kiểm thử tự động dùng Identity thật và kho người dùng trong RAM, không gửi email hay sửa database. Bao gồm token hết hạn/bị sửa/đã dùng, mật khẩu mạnh/yếu, OTP đúng/sai/hết hạn, cooldown, khóa sau 5 lần, gửi lại vô hiệu mã cũ, không thể bỏ qua xác nhận, tiêu thụ đồng thời chỉ một lần.

Kiểm tra trực tiếp:

1. Từ trang hoặc hộp đăng nhập, bấm Quên mật khẩu và nhập email của tài khoản đã đăng ký.
2. Trang chuyển sang Nhập mã OTP. Kiểm tra email/Spam; chỉ nhận mã 6 số.
3. Nhập mã đúng, chuyển sang Mật khẩu mới trên website. Không có reset token trong URL/HTML.
4. Nhập và xác nhận mật khẩu mới; đăng nhập bằng mật khẩu mới thành công, mật khẩu cũ thất bại.
5. Đi trực tiếp /Account/ResetPassword khi chưa xác nhận OTP phải chuyển về bước xác nhận/yêu cầu mã.
6. Thử mã sai 5 lần, mã hết 10 phút, mã cũ sau khi gửi lại: đều không được đổi mật khẩu.
7. Yêu cầu lại trong 60 giây bị chặn; quá giới hạn IP nhận HTTP 429.
8. Sau khi đổi thành công, không thể dùng lại phiên hay OTP đó.
