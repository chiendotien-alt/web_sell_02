# Website bán hàng của bạn — Hướng dẫn đưa web lên mạng

Web này có: trang sản phẩm, giỏ hàng, khung chat AI tự tư vấn và tự chốt đơn, trang quản trị để thêm sản phẩm và xem đơn hàng.

Làm theo đúng 6 bước dưới đây, **không cần biết code**, chỉ cần copy-paste. Tổng thời gian khoảng 20-30 phút.

---

## Bước 1: Tạo tài khoản GitHub và tải code lên

GitHub là nơi lưu code của bạn (miễn phí), Vercel sẽ lấy code từ đây để chạy web.

1. Vào https://github.com → **Sign up** → tạo tài khoản miễn phí.
2. Sau khi đăng nhập, bấm nút **+** góc trên phải → **New repository**.
3. Đặt tên bất kỳ (ví dụ `shop-cua-toi`) → chọn **Private** hoặc **Public** đều được → bấm **Create repository**.
4. Ở trang repo vừa tạo, bấm **uploading an existing file** (hoặc **Add file → Upload files**).
5. Giải nén file zip mình đưa cho bạn ra máy tính, **kéo thả toàn bộ các file và thư mục bên trong** (không kéo cả thư mục zip) vào khung upload của GitHub.
6. Cuộn xuống, bấm **Commit changes**. Xong bước này.

## Bước 2: Tạo database miễn phí (Neon)

1. Vào https://neon.tech → **Sign up** (có thể đăng nhập bằng GitHub luôn cho nhanh).
2. Tạo project mới, đặt tên tùy ý.
3. Sau khi tạo xong, Neon sẽ hiện ra một dòng chữ dạng:
   `postgresql://user:password@host/dbname?sslmode=require`
   → Bấm **Copy** để sao chép dòng này. Đây chính là `DATABASE_URL` bạn sẽ dùng ở Bước 4.

## Bước 3: Lấy API key MIỄN PHÍ để bot AI hoạt động

1. Vào https://aistudio.google.com/apikey → đăng nhập bằng tài khoản Google (Gmail) bình thường.
2. Bấm **Create API key** → copy key (dạng `AIzaSy...`). Không cần thẻ ngân hàng, không mất phí.
3. Đây là key dùng ở biến `GEMINI_API_KEY` trong Bước 4.

Lưu ý: gói miễn phí có giới hạn số tin nhắn/phút — với shop mới bắt đầu, lượng khách chat thường không đụng tới giới hạn này.

## Bước 4: Đưa web lên mạng bằng Vercel

1. Vào https://vercel.com → **Sign up** → chọn **Continue with GitHub** để liên kết luôn với tài khoản GitHub ở Bước 1.
2. Bấm **Add New...** → **Project**.
3. Tìm repo `shop-cua-toi` (tên bạn đặt ở Bước 1) → bấm **Import**.
4. Ở màn hình cấu hình, mở phần **Environment Variables**, thêm lần lượt 4 dòng sau (Key ở cột trái, Value ở cột phải):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | dán chuỗi kết nối Neon từ Bước 2 |
   | `GEMINI_API_KEY` | dán API key từ Bước 3 |
   | `ADMIN_PASSWORD` | tự đặt một mật khẩu để đăng nhập trang quản trị |
   | `NEXT_PUBLIC_SHOP_NAME` | tên shop của bạn, ví dụ `Shop Của Tôi` |

5. Bấm **Deploy**. Đợi khoảng 2-3 phút.
6. Xong! Vercel sẽ đưa cho bạn một đường link dạng `https://shop-cua-toi.vercel.app` — đó chính là website của bạn.

## Bước 5: Thêm sản phẩm

1. Mở link web vừa deploy, thêm `/admin` vào cuối (ví dụ `https://shop-cua-toi.vercel.app/admin`).
2. Đăng nhập bằng mật khẩu bạn đặt ở `ADMIN_PASSWORD`.
3. Bấm **"Tạo 6 sản phẩm mẫu"** để xem thử giao diện, hoặc vào mục **Sản phẩm → + Thêm sản phẩm** để nhập sản phẩm thật của bạn (tên, giá, ảnh, mô tả...).
   - Ảnh sản phẩm: bạn cần link ảnh có sẵn trên mạng (upload ảnh lên đâu đó như Imgur/Facebook rồi copy link ảnh, hoặc dùng ảnh trên Unsplash).

## Bước 6: Test thử

1. Mở lại trang chủ web, thử bấm vào khung chat 💬 ở góc phải.
2. Hỏi bot vài câu về sản phẩm, thử đặt hàng luôn qua chat.
3. Vào `/admin/orders` để xem đơn hàng vừa đặt.

## Bước 7 (khuyến khích): Nhận thông báo đơn hàng mới qua Telegram

Mỗi khi có đơn hàng mới (dù khách chốt qua chat, qua form, hay bạn tự tạo thủ công), điện thoại bạn sẽ nhận được tin nhắn báo ngay.

1. Mở app Telegram, tìm và nhắn chuyện với tài khoản **@BotFather** (đây là bot chính thức của Telegram để tạo bot khác).
2. Gõ lệnh `/newbot`, làm theo hướng dẫn: đặt tên bot tùy ý, rồi đặt "username" cho bot (phải kết thúc bằng `bot`, ví dụ `shopcuaban_notify_bot`).
3. BotFather sẽ trả về một dòng dạng `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` — đây là **TELEGRAM_BOT_TOKEN**, copy lại.
4. Tìm và mở chuyện với chính bot bạn vừa tạo (bấm vào link BotFather đưa, hoặc tìm đúng username vừa đặt), nhắn bất kỳ tin gì (ví dụ "hi") để bot ghi nhận bạn.
5. Mở trình duyệt, dán vào địa chỉ này (thay `<TOKEN>` bằng token ở bước 3):
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
   Bạn sẽ thấy một đoạn chữ JSON, tìm số ở chỗ `"chat":{"id":XXXXXXXXX` — số đó chính là **TELEGRAM_CHAT_ID**.
6. Vào Vercel → project → Settings → Environment Variables, thêm 2 biến:

   | Key | Value |
   |---|---|
   | `TELEGRAM_BOT_TOKEN` | token ở bước 3 |
   | `TELEGRAM_CHAT_ID` | số ở bước 5 |

7. Vào tab Deployments, bấm vào bản mới nhất → nút "..." → **Redeploy** để áp dụng.

Từ giờ, có đơn mới là điện thoại bạn sẽ có tin nhắn Telegram báo ngay, kèm đầy đủ tên khách, SĐT, sản phẩm, tổng tiền.

---

## Những điều cần biết thêm

- **Thanh toán**: Mặc định bot chốt đơn theo hình thức **COD (thanh toán khi nhận hàng)**. Web chưa tích hợp cổng thanh toán online thật (VNPay/Momo...) — nếu cần, bạn nói mình làm thêm phần này (yêu cầu bạn đăng ký tài khoản merchant với VNPay/Momo trước).
- **Tên miền riêng**: Nếu muốn web có địa chỉ như `shopcuaban.vn` thay vì `...vercel.app`, mua domain ở Matbao/Tenten/Namecheap rồi vào Vercel → Project → Settings → Domains để gắn vào, Vercel sẽ hướng dẫn từng bước.
- **Đổi/thêm sản phẩm sau này**: cứ vào `/admin` bất cứ lúc nào để sửa.
- **Sửa code sau này**: nếu bạn (hoặc ai đó biết code) muốn chỉnh sửa, chỉ cần sửa trực tiếp file trên GitHub (giao diện web GitHub cho sửa trực tiếp) hoặc tải repo về sửa — Vercel sẽ tự động deploy lại mỗi khi có thay đổi trên GitHub.
- **Chi phí duy trì hàng tháng**: Vercel, Neon, GitHub, và Gemini API (gói miễn phí) — tất cả đều **0 đồng** với quy mô shop nhỏ. Nếu sau này khách chat rất đông và vượt giới hạn miễn phí của Gemini, bạn có thể bật billing để tiếp tục dùng với chi phí trả theo lượng dùng.

Nếu deploy bị lỗi ở bước nào, cứ chụp màn hình lỗi gửi lại, mình sẽ giúp bạn xử lý tiếp.
