# Yêu cầu làm việc

Ghi các đặc tả, quy tắc và ưu tiên của bạn tại đây. Mỗi khi bạn yêu cầu tôi làm việc trong repo này, tôi sẽ đọc và tuân theo file này nếu có liên quan.

## Mục tiêu dự án

- Hiển thị danh sách ô tô cũ đang bán
- Slider xe ở trang chủ chỉ hiển thị tối đa 10 xe mới nhất từ cơ sở dữ liệu
- Khi nhấn "Xem tất cả" trong mục mua xe, hệ thống mở trang con danh sách xe có ô tìm kiếm theo tên xe và bộ lọc cơ bản
- Cho phép người dùng tìm kiếm, lọc và xem chi tiết xe
- Khi người dùng nhấn vào card xe, hệ thống mở trang chi tiết riêng tại `/cars/:id` để xem ảnh, mô tả và thông số đầy đủ của xe.
- Trang mua xe và trang chi tiết xe có nút so sánh; khi nhấn sẽ mở popup so sánh, cho phép tìm và thêm xe có sẵn trong danh sách để so sánh thông số và mô tả rút gọn có nút xem thêm, tối đa 3 xe mỗi lần.
- Cho phép người dùng đăng ký, đăng nhập, quản lý tài khoản
- Cho phép người dùng đã đăng nhập xem họ tên, email và cập nhật hồ sơ cá nhân: số điện thoại, số CCCD, ngày sinh, giới tính, ảnh đại diện và địa chỉ liên hệ.
- Cho phép người dùng đã đăng nhập lưu xe yêu thích và xem danh sách xe yêu thích của chính mình.
- Cho phép người dùng liên hệ mua xe hoặc đặt lịch xem xe
- Trang chi tiết xe có nút "Nhận tư vấn & báo giá" mở popup cho khách gửi yêu cầu tư vấn theo xe đang xem, gồm họ tên, số điện thoại, email, nhu cầu, thời gian muốn gọi lại và ghi chú; khách chưa đăng nhập vẫn gửi được yêu cầu. Nếu xe đã hết hàng/đã bán, nút chính đổi thành "Tư vấn xe tương tự", popup báo xe hiện đã hết hàng và yêu cầu gửi lên admin phải thể hiện khách cần tư vấn xe tương tự.
- Trang quản trị có mục "Yêu cầu tư vấn" để `staff` và `admin` xem, tìm kiếm, cập nhật trạng thái và xóa yêu cầu tư vấn của khách hàng.
- Cho phép khách hàng đã đăng nhập đăng ký lái thử tại trang con `/dang-ky-lai-thu`, nhập họ tên, số điện thoại, chọn xe đang còn xe trong database, ngày dự kiến và khung giờ lái thử.
- Popup chọn xe trong trang đăng ký lái thử cho phép lọc nhanh xe yêu thích của khách hàng, chỉ hiển thị các xe yêu thích vẫn còn hàng để lái thử.
- Sau khi khách hàng đăng ký lái thử thành công, lịch được lưu ở trạng thái chờ xác nhận và mục "Thông báo" của khách hàng hiển thị thông báo đã nhận đăng ký.
- Nếu khách hàng đăng ký trùng `car_id + preferred_date + preferred_time_slot` với một lịch chưa hủy, lịch vẫn được ghi nhận nhưng phải có ghi chú trạng thái để mục "Thông báo" báo rõ khung giờ đã có khách khác và nhân viên sẽ hỗ trợ đổi giờ.
- Có trang quản trị để quản lý xe, người dùng, đơn liên hệ và dữ liệu hệ thống
- Trang quản trị có mục "Quản lý lịch hẹn lái thử" dưới mục quản lý xe, cho phép tài khoản `staff` và `admin` xem lịch đăng ký lái thử của khách hàng.
- Trang quản trị lịch hẹn lái thử cho phép `staff` và `admin` cập nhật 3 trạng thái: `Đồng ý cho phép lái thử`, `Hủy lịch hẹn`, `Treo`; khi hủy hoặc treo phải nhập lý do để khách hàng xem trong mục "Thông báo".
- Khi `staff` hoặc `admin` đồng ý lịch lái thử, backend phải kiểm tra trùng `car_id + preferred_date + preferred_time_slot`; mỗi xe chỉ có tối đa 1 lịch được đồng ý trong cùng ngày và khung giờ.
- Với lịch lái thử đang treo do trùng lịch, khi khách hàng đồng ý đổi lịch thì `staff` hoặc `admin` có thể chọn ngày/khung giờ mới ngay trong popup cập nhật trạng thái; backend chỉ cho xác nhận nếu khung giờ mới không trùng với lịch chưa hủy khác và phải gửi thông báo lịch mới cho khách hàng.
- Khi lịch lái thử được đồng ý, hủy hoặc treo, mục "Thông báo" của khách hàng hiển thị nội dung theo trạng thái mới; khách hàng có thể xóa lịch lái thử nếu không còn nhu cầu.
- Trang quản trị lịch hẹn lái thử hiển thị thống kê lượt đăng ký, số lần đồng ý cho phép lái thử, số lần hủy lịch hẹn và số lịch đang treo.
- Trang quản trị lịch hẹn lái thử tách lịch cần xử lý và lịch đã xử lý; lịch đã đồng ý hoặc đã hủy hiển thị ở box riêng bên dưới để admin/staff dễ theo dõi.
- Trang quản trị có mục "Thông tin khuyến mại" nằm dưới mục "Khách hàng" để nhân viên/admin viết bài khuyến mại, tải ảnh minh họa bằng nút chọn ảnh, cắt ảnh banner theo tỷ lệ 2:1 trước khi lưu, sửa, xóa, bật/tắt hiển thị và sắp xếp thứ tự trên trang chủ.
- Trang chủ hiển thị thông tin khuyến mại ngay bên dưới mục đăng ký lái thử bằng carousel trượt, chỉ lấy các bài khuyến mại đang bật hiển thị và còn trong thời gian áp dụng; khi nhấn vào card khuyến mại sẽ mở popup chi tiết bài khuyến mại.
- Header website có mục "Khuyến mại"; khi nhấn vào sẽ mở trang con `/khuyen-mai` hiển thị tất cả khuyến mại công khai hiện có của cửa hàng bằng giao diện gọn, đẹp, đồng bộ website và có metadata SEO cơ bản.
- Khi có bài khuyến mại đang hiển thị trên trang chủ, mục "Thông báo" của khách hàng hiển thị badge số lượng thông báo, danh sách khuyến mại mới nhất, cho phép xóa từng thông báo; khi nhấn vào thông báo khuyến mại sẽ mở popup chi tiết bài khuyến mại.
- Trang quản trị hiển thị tài khoản admin/nhân viên đang đăng nhập ở vị trí dễ quan sát nhưng không che nội dung quản trị.
- Trang quản trị cho phép admin nhấn vào khách hàng trong danh sách khách hàng để xem popup chi tiết hồ sơ khách hàng.
- Trang quản trị cho phép admin nhấn vào dòng nhân viên trong danh sách nhân viên để xem popup chi tiết hồ sơ nhân viên.
- Trang quản trị cho phép admin chỉnh sửa hồ sơ khách hàng gồm số điện thoại, CCCD, ngày sinh, giới tính và địa chỉ liên hệ; không cho chỉnh sửa họ tên và email khách hàng từ form này.
- Form thêm/sửa nhân viên trong trang admin cho phép nhập số CCCD và địa chỉ liên hệ của nhân viên.
- Trang chủ hiển thị đội ngũ tư vấn bán hàng nổi bật bằng card gọn, không hiển thị mô tả dài trên ảnh; khi nhấn vào ảnh tư vấn bán hàng sẽ mở popup chi tiết thông tin.
- Card tư vấn bán hàng trên trang chủ hiển thị icon liên hệ nhanh bằng số điện thoại và email nếu có dữ liệu.
- Header và mục đội ngũ tư vấn bán hàng trỏ tới trang con `/tu-van-ban-hang` để người dùng xem toàn bộ danh sách tư vấn bán hàng của cửa hàng, có tìm kiếm, liên hệ nhanh và nút xem thêm để đọc toàn bộ tiểu sử tư vấn; trang này luôn ưu tiên hiển thị Trưởng phòng kinh doanh ở đầu và sắp xếp theo số năm kinh nghiệm giảm dần.
- Trang website có mục "Tin mua ô tô" tại `/tin-mua-o-to`, hiển thị các tin khách hàng cần mua xe đã được duyệt, có lọc theo mức tiền, tỉnh/thành phố và phân trang.
- Trang website có mục "Đăng tin mua ô tô" tại `/dang-tin-mua-o-to`, cho phép khách vãng lai hoặc khách đã đăng nhập gửi nhu cầu cần mua xe gồm mức tiền, tiêu đề, nội dung, thông tin liên hệ và tỉnh/thành phố; tin mới lưu ở trạng thái chờ duyệt.
- Trang website có mục "Đăng bán xe" tại `/dang-tin-ban-xe` ở mức giao diện tạm thời, cho phép khách chọn hãng xe, dòng xe, đời xe và phiên bản; carousel thương hiệu đối tác chạy tự động và giao diện dùng màu chủ đạo OkXe. Chức năng lưu tin bán xe vào database sẽ được phát triển sau.
- Khi khách hàng đã đăng nhập gửi tin mua ô tô, mục "Thông báo" của khách hàng hiển thị tin đã gửi thành công; khi nhân viên/admin duyệt hoặc từ chối tin, mục "Thông báo" cũng hiển thị trạng thái mới cho khách hàng.
- Trang quản trị có mục "Quản lý tin mua xe" cho `staff` và `admin` xem, tìm kiếm, lọc theo trạng thái, duyệt, từ chối và xóa tin mua xe của khách hàng; việc cập nhật trạng thái thực hiện qua popup có ghi chú xử lý, khi từ chối phải nhập lý do và khi đổi khỏi trạng thái từ chối không được giữ lại lý do từ chối cũ.
- Form thêm/sửa xe trong trang admin phải có trường nhập hãng xe là trường đầu tiên
- Form thêm/sửa xe trong trang admin cho phép nhập mô tả xe để lưu thông tin tình trạng, tiện nghi hoặc ghi chú bán xe.
- Form thêm/sửa xe trong trang admin dùng lựa chọn cố định cho phân khúc, kiểu vận hành, nhiên liệu, số chỗ, hộp số, dẫn động, xuất xứ, tình trạng và nút hành động để hạn chế nhập sai dữ liệu.
- Cho phép admin tải lên một hoặc nhiều ảnh cho mỗi xe bằng nút chọn ảnh
- Có chức năng thanh toán qua ngân hàng hoặc các ví điện tử
## Quy tắc chung

- Viết code rõ ràng, dễ hiểu, dễ bảo trì.
- Không viết code quá phức tạp nếu chưa cần thiết.
- Ưu tiên hoàn thành đúng chức năng trước, sau đó mới tối ưu giao diện hoặc hiệu năng.
- Không tự ý đổi cấu trúc thư mục nếu không cần.
- Không tự ý đổi tên file, tên bảng database, tên biến quan trọng nếu không được yêu cầu.
- Nếu cần tạo file mới, đặt tên rõ nghĩa theo chức năng.
- Code phải chạy được trên môi trường Node.js, Express.js và SQLite.
- Không hard-code thông tin nhạy cảm như mật khẩu database, secret key, token.
- Các cấu hình quan trọng nên đặt trong file `.env`.

## Tiêu chuẩn code
- Code phải rõ ràng, dễ đọc, dễ hiểu và dễ bảo trì.
- Đặt tên biến, tên hàm, tên file có ý nghĩa, đúng với chức năng.
- Không viết code quá dài trong một file nếu có thể tách nhỏ.
- Không lặp lại code nhiều lần, nên tách thành hàm dùng lại khi cần.
- Không tự ý thay đổi cấu trúc thư mục nếu không cần thiết.
- Không tự ý xóa file hoặc sửa logic quan trọng khi chưa được yêu cầu.
- Ưu tiên cách làm đơn giản, phù hợp với đồ án tốt nghiệp.

### Frontend

- Sử dụng HTML, CSS, JavaScript thuần.
- Không dùng React, Vue, Angular hoặc framework frontend khác nếu không được yêu cầu.
- HTML cần viết đúng cấu trúc, dễ đọc.
- CSS đặt class rõ nghĩa, tránh viết style inline quá nhiều.
- JavaScript nên tách ra file riêng, hạn chế viết trực tiếp trong HTML.
- Giao diện cần responsive cơ bản cho desktop, tablet và mobile.
- Form cần có kiểm tra dữ liệu cơ bản trước khi gửi lên server.

### Backend

- Sử dụng Node.js và Express.js.
- Tách code theo chức năng nếu dự án đủ lớn:
  - routes
  - controllers
  - models
  - middlewares
  - config
- API trả về JSON thống nhất.
- Luôn kiểm tra dữ liệu đầu vào từ client.
- Không để server bị crash khi người dùng nhập sai dữ liệu.
- Xử lý lỗi rõ ràng và trả về thông báo dễ hiểu.

### Database

- Sử dụng SQLite theo cấu trúc hiện tại của dự án.
- Tên bảng và tên cột viết rõ nghĩa, thống nhất.
- Dùng khóa chính `id` cho các bảng.
- Dùng khóa ngoại khi cần liên kết dữ liệu.
- Không lưu mật khẩu dạng plain text.
- Mật khẩu phải được hash trước khi lưu. Code hiện tại đang dùng `scryptSync` của Node.js.
- Dùng prepared statement hoặc API database an toàn để tránh SQL Injection.
- Bảng `users` có cột `role` để phân quyền tài khoản: `customer`, `staff`, `admin`.
- Bảng `users` lưu thêm hồ sơ khách hàng trong các cột `phone`, `citizen_id`, `birth_date`, `gender`, `avatar_url`, `address_province`, `address_district`, `address_ward`, `address_detail`, `updated_at`.
- Bảng `users` lưu thêm hồ sơ nhân viên kinh doanh hiển thị trang chủ trong các cột `sales_title`, `sales_experience`, `sales_bio`, `show_on_home`, `home_display_order`. Cột `sales_specialty` có thể còn tồn tại ở database cũ nhưng không hiển thị trên giao diện.
- Trường `sales_bio` là mô tả chi tiết nhân viên, nhập bằng textarea trong admin và hiển thị đầy đủ trong popup chi tiết nhân viên ở trang chủ.
- Bảng `cars` lưu hãng xe trong cột `brand`, mô tả xe trong cột `description`, thông số dẫn động trong cột `drivetrain`, ảnh chính trong cột `image` và danh sách nhiều ảnh trong cột `images_json`.
- Bảng `promotions` lưu bài khuyến mại trong các cột `title`, `summary`, `content`, `badge_text`, `image_url`, `cta_text`, `cta_url`, `starts_at`, `ends_at`, `show_on_home`, `display_order`, `created_at`, `updated_at`.
- Bảng `user_favorite_cars` lưu xe yêu thích của khách hàng bằng `user_id`, `car_id`, `created_at`, có khóa ngoại tới `users` và `cars`.
- Bảng `test_drive_appointments` lưu lịch đăng ký lái thử của khách hàng bằng `user_id`, `car_id`, thông tin xe tại thời điểm đăng ký, `full_name`, `phone`, `preferred_date`, `preferred_time_slot`, `status`, `status_note`, `created_at`, `updated_at`.
- Bảng `consultation_requests` lưu yêu cầu tư vấn theo xe bằng `user_id`, `car_id`, thông tin xe tại thời điểm gửi, `full_name`, `phone`, `email`, `request_type`, `preferred_contact_time`, `note`, `status`, `status_note`, `created_at`, `updated_at`.
- Bảng `car_buy_requests` lưu tin khách cần mua xe bằng `user_id`, `budget_range`, `title`, `content`, `full_name`, `phone`, `email`, `province`, `address`, `status`, `status_note`, `created_at`, `updated_at`. Trạng thái gồm `pending`, `approved`, `rejected`; chỉ tin `approved` hiển thị công khai.
- Ảnh xe được upload local vào thư mục `storage/uploads/cars` hoặc thư mục được cấu hình bằng `OKXE_UPLOAD_DIR`.
- Ảnh đại diện người dùng được upload local vào thư mục `storage/uploads/avatars` hoặc thư mục upload được cấu hình bằng `OKXE_UPLOAD_DIR`.
- Ảnh khuyến mại được upload local vào thư mục `storage/uploads/promotions` hoặc thư mục upload được cấu hình bằng `OKXE_UPLOAD_DIR`.

### Bảo mật

- Không hard-code mật khẩu database, token hoặc secret key trong code.
- Thông tin cấu hình nên để trong file `.env`.
- Phân quyền rõ ràng giữa người dùng thường, nhân viên và admin.
- Người dùng thường không được truy cập chức năng quản trị. Chỉ tài khoản có `role` là `staff` hoặc `admin` mới được vào trang admin và gọi API quản trị.
- Trang quản trị sử dụng trang đăng nhập nhân viên riêng tại `/admin-login`.
- Email nhân viên/admin có thể được cấu hình bằng `STAFF_EMAILS` và `ADMIN_EMAILS` trong `.env` để tự gán quyền khi tài khoản đăng ký hoặc khi server khởi động.
- Quyền `staff` được quản lý xe trong admin. Quyền `admin` được quản lý xe và quản lý tài khoản nhân viên, bao gồm tạo tài khoản nhân viên/admin, chỉnh sửa họ tên/email/mật khẩu/role, đổi role nhanh và xóa tài khoản.
- Quyền `staff` hoặc `admin` được quản lý bài khuyến mại trong trang admin.
- Trong form nhân viên/admin, trường vai trò chỉ cho chọn `staff` hoặc `admin`; không cho đổi nhân viên/admin thành khách hàng.
- Trong mục quản lý Admin, form tạo/sửa admin không hiển thị các trường nghiệp vụ kinh doanh như vai trò, chức danh kinh doanh, kinh nghiệm, mô tả, thứ tự hiển thị và hiển thị trên trang chủ; thông tin admin cũng không hiển thị các trường này.
- Hệ thống không cho xóa hoặc hạ quyền admin cuối cùng để tránh khóa mất quyền quản trị.
- Không hiển thị lỗi kỹ thuật chi tiết cho người dùng cuối.

### Quy ước khi sửa code

- Khi sửa lỗi, chỉ sửa đúng phần liên quan đến lỗi.
- Khi thêm chức năng mới, cần đảm bảo không làm hỏng chức năng cũ.
- Nếu thay đổi database, cần ghi rõ câu lệnh SQL cần chạy.
- Nếu tạo file mới, đặt tên file rõ nghĩa theo chức năng.
- Sau khi sửa xong, cần kiểm tra lại chức năng liên quan.

## UI/UX

- Giao diện hiện đại, dễ nhìn, phù hợp chủ đề ô tô.
- Màu sắc ưu tiên theo giao diện đã được làm trước đó. Khi thêm chức năng phải được sử dụng theo giao diện trước đó.
- Website cần responsive cơ bản cho desktop, tablet và mobile.

## Kiểm thử

- Trước khi báo hoàn thành task, cần tự kiểm tra các nội dung sau:

- Chạy website và đảm bảo không có lỗi nghiêm trọng.
- Kiểm tra console trình duyệt, không để lỗi JavaScript nghiêm trọng.
- Kiểm tra backend không bị crash khi thao tác sai dữ liệu.
- Kiểm tra API trả về đúng dữ liệu và đúng định dạng JSON.
- Kiểm tra form đăng ký, đăng nhập hoạt động đúng.
- Kiểm tra chức năng thêm, sửa, xóa xe hoạt động đúng.
- Kiểm tra chức năng upload một hoặc nhiều ảnh xe trong trang admin hoạt động đúng.
- Kiểm tra dữ liệu được lưu, sửa, xóa đúng trong SQLite.
- Kiểm tra phân quyền: người dùng thường không được vào trang admin.
- Kiểm tra giao diện responsive cơ bản trên desktop, tablet và mobile.
- Nếu có sửa chức năng cũ, cần đảm bảo chức năng cũ vẫn hoạt động bình thường.

Nếu có thay đổi database, bắt buộc ghi rõ:

- Tên bảng bị thay đổi.
- Tên cột được thêm, sửa hoặc xóa.
- Câu lệnh SQL cần chạy.
- Lý do cần thay đổi database.

## Ghi chú khác
- Đây là đồ án tốt nghiệp nên ưu tiên code dễ giải thích khi bảo vệ.
- Không dùng công nghệ quá phức tạp ngoài HTML, CSS, JavaScript, Node.js, Express.js và SQLite nếu không được yêu cầu.
- Không tự ý thêm framework frontend như React, Vue, Angular.
- Không tự ý thay đổi toàn bộ giao diện hoặc kiến trúc dự án nếu task chỉ yêu cầu sửa một phần nhỏ.
- Khi tạo chức năng mới, cần đảm bảo phù hợp với website bán ô tô cũ.
- Khi không chắc yêu cầu, hãy chọn cách đơn giản, dễ hiểu và dễ bảo trì nhất.
