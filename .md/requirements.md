# Yêu cầu làm việc

Ghi các đặc tả, quy tắc và ưu tiên của bạn tại đây. Mỗi khi bạn yêu cầu tôi làm việc trong repo này, tôi sẽ đọc và tuân theo file này nếu có liên quan.

## Mục tiêu dự án

- Hiển thị danh sách ô tô cũ đang bán
- Slider xe ở trang chủ chỉ hiển thị tối đa 10 xe mới nhất từ cơ sở dữ liệu
- Khi nhấn "Xem tất cả" trong mục mua xe, hệ thống mở trang con danh sách xe có ô tìm kiếm theo tên xe và bộ lọc cơ bản
- Cho phép người dùng tìm kiếm, lọc và xem chi tiết xe
- Khi người dùng nhấn vào card xe, hệ thống mở trang chi tiết riêng tại `/cars/:id` để xem ảnh, mô tả và thông số đầy đủ của xe.
- Trang mua xe và trang chi tiết xe có nút so sánh; khi nhấn sẽ mở popup so sánh, cho phép tìm và thêm xe có sẵn trong danh sách để so sánh thông số và mô tả rút gọn có nút xem thêm, tối đa 3 xe mỗi lần.
- Trang chi tiết xe có nút "Chi phí lăn bánh" mở popup tính tạm tính cho cả xe mới và xe đã qua sử dụng. Công cụ tự lấy giá, năm và số chỗ của xe đang xem; cho phép điều chỉnh khu vực đăng ký, giá tính trước bạ và từng khoản phí. Xe mới tính trước bạ theo tỷ lệ địa phương; xe cũ tính 2% trên giá xe mới trong bảng giá trước bạ sau khi áp dụng tỷ lệ giá trị còn lại 90%, 70%, 50%, 30% hoặc 20% theo thời gian sử dụng. Kết quả phải tách từng khoản, tổng phí và tổng giá lăn bánh, đồng thời ghi rõ đây là số tham khảo.
- Cho phép người dùng đăng ký, đăng nhập, quản lý tài khoản
- Cho phép người dùng đã đăng nhập xem họ tên, email và cập nhật hồ sơ cá nhân: số điện thoại, số CCCD, ngày sinh, giới tính, ảnh đại diện và địa chỉ liên hệ.
- Cho phép người dùng đã đăng nhập lưu xe yêu thích và xem danh sách xe yêu thích của chính mình.
- Popup thông tin tài khoản của người dùng đã đăng nhập có mục quản lý tin đăng, gồm tab tin bán xe và tin mua xe, hiển thị số lượng tin, lọc theo trạng thái và liên kết đăng tin mới tương ứng; menu tài khoản có nút mở nhanh thẳng tới mục này bằng chế độ chỉ hiển thị quản lý tin, không kèm khối thông tin cá nhân.
- Popup thông tin tài khoản của người dùng đã đăng nhập có mục quản lý đặt cọc để xem lại các đơn đặt cọc của chính mình, lọc theo trạng thái `pending`, `confirmed`, `completed`, `cancelled_after_deposit`, `cancelled`, `expired`, và nhấn vào từng đơn để xem chi tiết thông tin xe, khách hàng, thanh toán, chứng từ chuyển khoản, ngân hàng, hạn giữ chỗ, ghi chú và lịch sử xử lý; với đơn `pending` dùng VNPay sandbox chưa có kết quả thất bại/hủy, khách có thể bấm "Tiếp tục thanh toán VNPay" để hệ thống tạo lại URL thanh toán và chuyển sang cổng VNPay; nếu VNPay đã trả kết quả thất bại hoặc khách hủy/quay về từ cổng thanh toán thì đơn chuyển sang `cancelled` và khách phải tạo đơn mới để thanh toán lại; menu tài khoản thay nút giỏ hàng bằng nút "Quản lý đặt cọc".
- Cho phép người dùng liên hệ mua xe hoặc đặt lịch xem xe
- Trang chi tiết xe có nút "Nhận tư vấn & báo giá" mở popup cho khách gửi yêu cầu tư vấn theo xe đang xem, gồm họ tên, số điện thoại, email, nhu cầu, thời gian muốn gọi lại và ghi chú; khách chưa đăng nhập vẫn gửi được yêu cầu. Nếu xe đã hết hàng/đã bán, nút chính đổi thành "Tư vấn xe tương tự", popup báo xe hiện đã hết hàng và yêu cầu gửi lên admin phải thể hiện khách cần tư vấn xe tương tự.
- Trang chi tiết xe có nút "Đặt cọc xe" nổi bật; khi nhấn chuyển đến trang `/thanh-toan-dat-coc?carId=...` để khách đã đăng nhập nhập thông tin đặt cọc giữ xe, gồm thông tin xe, thông tin khách hàng, số tiền đặt cọc và phương thức chuyển khoản ngân hàng hoặc VNPay sandbox nếu đã cấu hình. Khách chưa đăng nhập phải đăng nhập/tạo tài khoản trước khi gửi đơn để đơn đặt cọc luôn gắn với tài khoản khách hàng. Trước khi gửi đơn, khách phải đọc và tick đồng ý chính sách đặt cọc/hủy cọc/hoàn cọc đang cấu hình trong admin; backend cũng kiểm tra cờ đồng ý để tránh gọi API trực tiếp bỏ qua điều khoản. Khi khách xác nhận, backend lưu đơn đặt cọc vào SQLite, chuyển xe sang trạng thái `Đang giữ chỗ` và chặn đơn đặt cọc trùng xe nếu xe đang có đơn `pending` hoặc `confirmed`.
- Với phương thức chuyển khoản ngân hàng, sau khi khách bấm xác nhận đặt cọc, frontend hiển thị màn hình chờ gồm mã đơn, xe, số tiền cọc, thông tin ngân hàng và nội dung chuyển khoản. Màn hình chờ tự kiểm tra trạng thái đơn bằng mã đơn + số điện thoại; chỉ khi nhân viên/admin cập nhật đơn sang `confirmed` thì frontend mới chuyển sang thông báo "Đặt cọc xe thành công".
- Với phương thức VNPay sandbox, sau khi backend tạo đơn đặt cọc, hệ thống ký URL thanh toán theo cấu hình `OKXE_VNPAY_*` trong `.env` và frontend chuyển khách sang cổng VNPay. Khi VNPay redirect về return URL hoặc gọi IPN, backend kiểm tra chữ ký, kiểm tra đơn và số tiền, lưu thông tin giao dịch VNPay, rồi tự chuyển đơn sang `confirmed` nếu `vnp_ResponseCode` và `vnp_TransactionStatus` thành công; nếu VNPay trả thất bại hoặc khách bấm hủy/quay về khiến giao dịch không thành công, backend chuyển đơn `pending` sang `cancelled`, ghi lịch sử, gửi thông báo và mở lại xe nếu không còn đơn active khác.
- Trang `/thanh-toan-dat-coc` có form tra cứu đơn đặt cọc bằng mã đơn và số điện thoại để khách xem trạng thái `pending`, `confirmed`, `completed`, `cancelled_after_deposit`, `cancelled`, `expired`, hạn giữ chỗ, lịch sử xử lý và hướng dẫn bước tiếp theo theo từng trạng thái. Trang này cũng có khối giải thích trạng thái đơn đặt cọc để khách biết cần chuyển khoản/thanh toán VNPay, chờ xác nhận, in biên nhận, kiểm tra hoàn cọc hoặc tạo đơn mới khi quá hạn hoặc khi VNPay thất bại/hủy. Sau khi tạo đơn đang `pending`, frontend lưu tạm mã đơn và số điện thoại trong `localStorage`; nếu khách reload trang hoặc quay về từ VNPay, màn hình chờ/kết quả được khôi phục và tự kiểm tra lại trạng thái, còn khi đơn `confirmed`, `cancelled` hoặc `expired` thì dữ liệu tạm được xóa.
- Khách và admin chỉ có thể tải/bổ sung ảnh biên lai chuyển khoản khi đơn đặt cọc đã được xác nhận nhận tiền (`confirmed`); backend lưu ảnh local trong thư mục upload chứng từ, gắn đường dẫn vào đơn và ghi lịch sử xử lý để admin đối chiếu. Đơn `pending` chỉ hiển thị thông tin chuyển khoản và chờ nhân viên xác nhận, chưa cho tải biên lai.
- Khi đơn đặt cọc đã được xác nhận `confirmed` hoặc đã `completed`, khách có thể xem/in biên nhận đặt cọc từ trang tra cứu hoặc mục "Quản lý đặt cọc" trong tài khoản. Biên nhận hiển thị mã biên nhận, mã đơn, thông tin khách hàng, xe, số tiền đặt cọc, số tiền còn lại nếu có, nội dung chuyển khoản, mã giao dịch, thời gian nhận tiền, thời gian xác nhận, chứng từ khách tải nếu có, thông tin tài khoản nhận cọc và chính sách đặt cọc đang áp dụng; biên nhận dùng hộp thoại in của trình duyệt để in hoặc lưu PDF.
- Khi khách tạo đơn đặt cọc, khi đơn pending sắp hết hạn giữ chỗ, khi admin/nhân viên đổi trạng thái đơn, hoặc khi đơn tự quá hạn, backend phải tạo thông báo trong tài khoản khách hàng; nếu đơn có email hợp lệ và SMTP được cấu hình thì gửi thêm email xác nhận/cập nhật vòng đời đơn, còn môi trường dev có thể lưu email preview để kiểm thử. Mỗi đơn chỉ gửi nhắc chuyển khoản một lần trước hạn và phải ghi lịch sử xử lý.
- Trang quản trị có mục "Quản lý đặt cọc" cho `staff` và `admin` xem danh sách đơn đặt cọc, tìm kiếm/lọc theo trạng thái, cấu hình tài khoản ngân hàng nhận cọc, các mức tiền đặt cọc hiển thị, mức cọc mặc định, giới hạn tối thiểu/tối đa, thời gian giữ xe, tùy chọn yêu cầu chứng từ chuyển khoản và nội dung chính sách đặt cọc/hủy cọc/hoàn cọc hiển thị cho khách.
- Trang quản trị cho phép cập nhật trạng thái `pending`, `confirmed`, `completed`, `cancelled_after_deposit`, `cancelled`, `expired`; khi chuyển sang `confirmed`, nhân viên phải nhập mã giao dịch/tham chiếu duy nhất, thời gian nhận tiền, có thể nhập ghi chú nội bộ đối soát, hệ thống lưu người xác nhận và thời điểm xác nhận. Sau khi đơn ở trạng thái `confirmed`, admin/nhân viên có thể xem chứng từ khách tải hoặc tải biên lai thay khách nếu khách gửi qua tin nhắn/kênh ngoài hệ thống; sau đó có thể chốt `completed` để chuyển xe sang `Xe đã bán` hoặc hủy sau đặt cọc bằng `cancelled_after_deposit` để mở lại xe nếu cần. Khi hủy sau đặt cọc, admin/nhân viên nhập lý do gửi khách, số tiền hoàn cọc, mã giao dịch hoàn tiền, thời gian hoàn tiền và ghi chú hoàn cọc; hệ thống lưu người ghi nhận hoàn cọc và thời điểm ghi nhận. Admin có thể xem timeline lịch sử xử lý, đánh dấu đơn quá hạn, lọc đơn sắp quá hạn/đã nhắc khách/chờ chứng từ/cần đối soát, xem báo cáo tổng tiền cọc đã nhận/đã hoàn/cọc ròng và xuất danh sách đặt cọc hoặc lịch sử xử lý CSV theo bộ lọc hiện tại.
- Luồng trạng thái đơn đặt cọc phải đi theo thứ tự hợp lệ: `pending` chỉ được chuyển sang `confirmed`, `cancelled` hoặc `expired`; `confirmed` chỉ được chuyển sang `completed` hoặc `cancelled_after_deposit`; các trạng thái cuối `completed`, `cancelled_after_deposit`, `cancelled`, `expired` không được mở lại sang trạng thái khác. Hệ thống vẫn cho phép cập nhật lại cùng một trạng thái để bổ sung ghi chú hoặc thông tin đối soát khi cần.
- Khi xe đang có đơn đặt cọc active (`pending` hoặc `confirmed`), admin không được đổi trực tiếp trạng thái xe trong kho từ `Đang giữ chỗ` sang `Xe đã bán` hoặc `Còn xe`, đồng thời không được xóa xe khỏi kho; nếu đơn `pending` phải hủy/để quá hạn trước, còn nếu đơn `confirmed` phải chốt đơn sang `completed` để hệ thống tự đổi thành `Xe đã bán` hoặc hủy sau đặt cọc bằng `cancelled_after_deposit` để mở lại xe.
- Đơn đặt cọc `pending` có thời hạn giữ chỗ theo cấu hình trong admin, mặc định lấy seed từ `OKXE_DEPOSIT_HOLD_HOURS` nếu chưa có cấu hình (mặc định 24 giờ). Khi quá hạn, backend tự chuyển đơn sang `expired`, ghi lịch sử xử lý, gửi thông báo cho khách và mở lại xe nếu không còn đơn `pending` hoặc `confirmed` khác.
- Khi đơn đặt cọc bị hủy hoặc quá hạn và xe không còn đơn đặt cọc `pending` hoặc `confirmed` khác, backend tự đưa trạng thái xe từ `Đang giữ chỗ` về `Còn xe`.
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
- Trang chủ có section blog ngay dưới khuyến mại, hiển thị carousel bài viết ô tô mới đã bật hiển thị Home từ API blog và fallback dữ liệu tĩnh `public/blog/data.js` khi chưa chạy backend. Header và section này liên kết tới `/blog`; trang blog có carousel bài nổi bật, tìm kiếm, lọc chủ đề và danh sách bài responsive. Mỗi bài mở thành trang đọc riêng tại `/blog/:slug`, có metadata SEO server-side, breadcrumb, người đăng, nội dung đầy đủ, sidebar tin mới nhất/nhận tin tức mới và bài liên quan.
- Trang quản trị có mục "Quản lý blog" cho `staff` và `admin` tạo, sửa, xóa bài viết, tải/cắt ảnh đại diện theo tỷ lệ 16:9, chèn ảnh đã cắt vào giữa nội dung bài viết, bật/tắt xuất bản, bật/tắt hiển thị ở Home, đánh dấu bài đăng nổi bật và xem thống kê nhỏ gồm tổng bài, đã xuất bản, nổi bật, hiển thị Home và bản nháp.
- Tất cả trang con công khai phải dùng header đồng nhất với trang chủ về logo, nội dung menu, font chữ, chiều rộng, chiều cao và trạng thái đăng nhập/đăng xuất; menu phải responsive trên desktop, tablet và mobile.
- Tất cả trang công khai dành cho khách hàng phải dùng chung một footer OkXe, đồng nhất nội dung, font chữ, chiều rộng, khoảng cách và cách hiển thị responsive trên desktop, tablet và mobile.
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
- Trang "Tin mua ô tô" cho phép người truy cập có xe phù hợp gửi đề xuất xe theo từng tin mua, gồm thông tin người bán, xe đang có, giá mong muốn, số km, tình trạng xe và lựa chọn cách liên hệ; nếu người dùng đã đăng nhập thì form đề xuất tự điền họ tên, số điện thoại và email từ tài khoản. Chủ tin mua xe không được tự gửi đề xuất xe cho chính tin của mình; đề xuất hợp lệ được lưu để OkXe kiểm tra và kết nối nhu cầu mua bán.
- Khi tin mua xe gắn với tài khoản nhận được đề xuất xe phù hợp, mục "Thông báo" của chủ tin hiển thị riêng từng xe được đề xuất với hãng, dòng, đời xe, giá, số km và trạng thái xử lý. Thông báo phải xuất hiện lại khi trạng thái đề xuất đổi sang `contacted`, `matched` hoặc `rejected`, đồng thời không tiết lộ tên, số điện thoại hay email của người đề xuất trước khi OkXe kết nối hai bên.
- Trang website có mục "Đăng tin mua ô tô" tại `/dang-tin-mua-o-to`, cho phép khách vãng lai hoặc khách đã đăng nhập gửi nhu cầu cần mua xe gồm mức tiền, tiêu đề, nội dung, thông tin liên hệ và tỉnh/thành phố; tin mới lưu ở trạng thái chờ duyệt.
- Trang website có mục "Đăng bán xe" tại `/dang-tin-ban-xe`, cho phép khách hàng đã đăng nhập nhấn nút "Điền thông tin xe cần bán" để mở popup nhập thông tin người bán, thông tin xe đầy đủ, mô tả tình trạng và tải nhiều ảnh xe thực tế.
- Khi khách hàng gửi thông tin xe cần bán, backend lưu vào trạng thái `pending`, tạo thông báo đã nhận thông tin cho khách hàng và hiển thị trong mục "Thông báo".
- Trang quản trị có mục "Quản lý đăng bán xe" cho `staff` và `admin` xem thông tin xe khách gửi, ảnh xe, số điện thoại/email để sale gọi lại, tìm kiếm/lọc theo trạng thái và xử lý duyệt hoặc từ chối.
- Khi `staff` hoặc `admin` duyệt thông tin đăng bán xe, bắt buộc nhập giá chốt với khách và giá bán trên hệ thống, mỗi giá gồm bản hiển thị và dạng số. Backend dùng giá bán trên hệ thống để tạo xe mới trong bảng kho xe `cars` với trạng thái còn xe, cập nhật bài đăng bán sang `approved` và gửi thông báo duyệt cho khách hàng. Giá khách mong muốn chỉ giữ lại để tham khảo, giá chốt với khách dùng làm giá vốn/quản trị nội bộ, không dùng làm giá bán công khai.
- Trong kho xe admin, xe được nhập từ luồng khách hàng đăng bán phải hiển thị rõ nguồn "Khách gửi bán", mã bài đăng bán và thông tin người bán để nhân viên dễ kiểm soát, nhưng API public không được lộ thông tin người bán.
- Khi `staff` hoặc `admin` từ chối thông tin đăng bán xe, bắt buộc nhập lý do; backend gửi thông báo lý do từ chối cho khách hàng, xóa bài đăng bán xe bị từ chối và khách hàng cần đăng lại bài nếu muốn OkXe kiểm tra lại.
- Khi khách hàng đã đăng nhập gửi tin mua ô tô, mục "Thông báo" của khách hàng hiển thị tin đã gửi thành công; khi nhân viên/admin duyệt hoặc từ chối tin, mục "Thông báo" cũng hiển thị trạng thái mới cho khách hàng.
- Trang quản trị có mục "Quản lý tin mua xe" cho `staff` và `admin` xem, tìm kiếm, lọc theo trạng thái, duyệt, từ chối và xóa tin mua xe của khách hàng; việc cập nhật trạng thái thực hiện qua popup có ghi chú xử lý, khi từ chối phải nhập lý do và khi đổi khỏi trạng thái từ chối không được giữ lại lý do từ chối cũ.
- Trong mục "Quản lý tin mua xe", `staff` và `admin` xem được các đề xuất xe phù hợp do người bán gửi vào từng tin mua và cập nhật trạng thái xử lý gồm `new`, `contacted`, `matched`, `rejected`; khi từ chối đề xuất phải nhập lý do.
- Form thêm/sửa xe trong trang admin phải có trường nhập hãng xe là trường đầu tiên
- Form thêm/sửa xe trong trang admin cho phép nhập mô tả xe để lưu thông tin tình trạng, tiện nghi hoặc ghi chú bán xe.
- Form thêm/sửa xe trong trang admin dùng lựa chọn cố định cho phân khúc, kiểu vận hành, nhiên liệu, số chỗ, hộp số, dẫn động, xuất xứ, tình trạng và nút hành động để hạn chế nhập sai dữ liệu.
- Cho phép admin tải lên một hoặc nhiều ảnh cho mỗi xe bằng nút chọn ảnh
- MVP đặt cọc hỗ trợ chuyển khoản ngân hàng xác nhận thủ công và VNPay sandbox để tạo luồng thanh toán tự động; ví điện tử/thẻ/cổng thanh toán production vẫn là hướng mở rộng sau.
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
- Bảng `cars` lưu hãng xe trong cột `brand`, mô tả xe trong cột `description`, thông số dẫn động trong cột `drivetrain`, ảnh chính trong cột `image` và danh sách nhiều ảnh trong cột `images_json`. Cột `action_text` dùng trạng thái kho xe gồm `Còn xe`, `Đang giữ chỗ`, `Xe đã bán`.
- Bảng `promotions` lưu bài khuyến mại trong các cột `title`, `summary`, `content`, `badge_text`, `image_url`, `cta_text`, `cta_url`, `starts_at`, `ends_at`, `show_on_home`, `display_order`, `created_at`, `updated_at`.
- Bảng `blog_posts` lưu bài viết blog trong các cột `slug`, `category`, `title`, `excerpt`, `content`, `image_url`, `image_alt`, `author_id`, `author_name`, `published_at`, `read_time`, `status`, `featured`, `show_on_home`, `display_order`, `created_at`, `updated_at`. Trạng thái gồm `draft`, `published`; chỉ bài `published` và đến ngày đăng mới hiển thị công khai. Cột `show_on_home` quyết định bài có xuất hiện trong carousel blog ở trang chủ hay không. Trường `content` hỗ trợ ảnh xen giữa nội dung bằng cú pháp `![mô tả ảnh](đường-dẫn-ảnh)`.
- Khi backend khởi động, các bài blog tĩnh cũ trong `public/blog/data.js` được đồng bộ vào bảng `blog_posts` theo `slug`; bài còn thiếu sẽ được thêm mới, còn bài seed cũ có nội dung ngắn hơn sẽ được cập nhật nội dung mà vẫn giữ trạng thái, nổi bật, hiển thị Home và thứ tự hiện có trong admin.
- Bảng `user_favorite_cars` lưu xe yêu thích của khách hàng bằng `user_id`, `car_id`, `created_at`, có khóa ngoại tới `users` và `cars`.
- Bảng `test_drive_appointments` lưu lịch đăng ký lái thử của khách hàng bằng `user_id`, `car_id`, thông tin xe tại thời điểm đăng ký, `full_name`, `phone`, `preferred_date`, `preferred_time_slot`, `status`, `status_note`, `created_at`, `updated_at`.
- Bảng `consultation_requests` lưu yêu cầu tư vấn theo xe bằng `user_id`, `car_id`, thông tin xe tại thời điểm gửi, `full_name`, `phone`, `email`, `request_type`, `preferred_contact_time`, `note`, `status`, `status_note`, `created_at`, `updated_at`.
- Bảng `deposit_payment_settings` lưu cấu hình active cho thanh toán đặt cọc gồm tài khoản nhận cọc (`account_name`, `bank_name`, `account_number`, `branch`), tiền tố nội dung chuyển khoản (`transfer_prefix`), danh sách mức cọc hiển thị (`deposit_amount_options_json`), mức cọc mặc định (`default_deposit_amount`), giới hạn tối thiểu/tối đa (`min_deposit_amount`, `max_deposit_amount`), thời gian giữ xe (`hold_hours`), tùy chọn yêu cầu chứng từ (`require_transfer_proof`), nội dung chính sách đặt cọc/hủy cọc/hoàn cọc (`policy_text`) và thông tin người cập nhật.
- Bảng `deposit_orders` lưu đơn đặt cọc giữ xe bằng `user_id`, `car_id`, thông tin xe tại thời điểm gửi (`car_name`, `car_brand`, `car_price_text`, `car_price_value`), `full_name`, `phone`, `email`, `province`, `note`, `deposit_amount`, `payment_method`, `bank_transfer_note`, thông tin VNPay sandbox (`vnpay_txn_ref`, `vnpay_transaction_no`, `vnpay_response_code`, `vnpay_transaction_status`, `vnpay_bank_code`, `vnpay_card_type`, `vnpay_pay_date`, `vnpay_payment_url`, `vnpay_confirmed_at`), chứng từ chuyển khoản (`transfer_proof_url`, `transfer_proof_file_name`, `transfer_proof_uploaded_at`), `status`, `status_note`, hạn giữ chỗ (`expires_at`, `expired_at`), thời điểm đã nhắc thanh toán (`payment_reminder_sent_at`), thông tin xác nhận tiền (`payment_reference`, `payment_received_at`, `payment_confirmation_note`, `payment_confirmed_by_user_id`, `payment_confirmed_by_name`, `payment_confirmed_at`), thông tin hoàn cọc (`refund_amount`, `refund_reference`, `refund_completed_at`, `refund_note`, `refund_confirmed_by_user_id`, `refund_confirmed_by_name`, `refund_confirmed_at`), `created_at`, `updated_at`. Trạng thái gồm `pending`, `confirmed`, `completed`, `cancelled_after_deposit`, `cancelled`, `expired`; `pending` là đơn đang chờ chuyển khoản/VNPay hoặc nhân viên xác nhận, `confirmed` là đã nhận tiền đặt cọc, `completed` là đã hoàn tất giao dịch mua xe và chuyển xe sang `Xe đã bán`, `cancelled_after_deposit` là giao dịch hủy sau khi đã nhận cọc, `expired` là quá hạn giữ chỗ, và `pending`/`confirmed` được xem là đơn active để giữ xe và chặn đặt cọc trùng.
- Bảng `deposit_order_status_history` lưu lịch sử xử lý đơn đặt cọc bằng `deposit_order_id`, `previous_status`, `next_status`, `note`, `actor_user_id`, `actor_name`, `action_type`, `created_at`.
- Bảng `car_buy_requests` lưu tin khách cần mua xe bằng `user_id`, `budget_range`, `title`, `content`, `full_name`, `phone`, `email`, `province`, `address`, `status`, `status_note`, `created_at`, `updated_at`. Trạng thái gồm `pending`, `approved`, `rejected`; chỉ tin `approved` hiển thị công khai.
- Bảng `car_buy_request_offers` lưu đề xuất xe phù hợp cho tin mua bằng `car_buy_request_id`, `seller_name`, `seller_phone`, `seller_email`, `car_brand`, `car_model`, `car_year`, `car_version`, `expected_price`, `mileage`, `condition_note`, `contact_preference`, `status`, `status_note`, `created_at`, `updated_at`. Trạng thái gồm `new`, `contacted`, `matched`, `rejected`.
- Bảng `car_sell_requests` lưu thông tin xe khách hàng gửi bán bằng `user_id`, thông tin liên hệ người bán, đầy đủ trường xe tương ứng kho xe (`brand`, `category`, `name`, `description`, `type`, `price_text`, `price_value`, `customer_deal_price_text`, `customer_deal_price_value`, `final_price_text`, `final_price_value`, `image`, `images_json`, `year`, `fuel`, `mileage_text`, `mileage_value`, `seats`, `gearbox`, `drivetrain`, `origin`, `condition`, `color`, `action_text`), `status`, `status_note`, `approved_car_id`, `created_at`, `updated_at`. `price_text`/`price_value` là giá khách mong muốn, `customer_deal_price_text`/`customer_deal_price_value` là giá chốt với khách khi đồng ý nhận xe, còn `final_price_text`/`final_price_value` là giá bán trên hệ thống và là giá dùng để tạo xe trong bảng `cars`. Trạng thái lưu trong bảng gồm `pending`, `approved`; bài bị từ chối được xóa sau khi tạo thông báo lý do cho khách hàng.
- Bảng `user_notifications` lưu thông báo riêng của khách hàng bằng `user_id`, `type`, `title`, `message`, `entity_type`, `entity_id`, `status`, `is_read`, `created_at`, `updated_at`, `deleted_at`; dùng cho luồng đặt cọc xe, đăng bán xe, đăng ký lái thử, tin mua xe, đề xuất xe phù hợp và khuyến mại công khai. Thông báo được xóa mềm bằng `deleted_at`, đánh dấu đã đọc bằng `is_read` và API chỉ trả các thông báo chưa bị xóa.
- Bảng `admin_notifications` lưu thông báo chung cho `staff` và `admin` bằng `type`, `title`, `message`, `entity_type`, `entity_id`, `status`, `is_read`, `created_at`, `updated_at`, `deleted_at`; dùng để báo phát sinh mới từ khách hàng như đơn đặt cọc, yêu cầu tư vấn, đăng ký lái thử, tin mua xe, đề xuất xe phù hợp và đăng bán xe. Thông báo admin được tạo ở backend, xóa mềm bằng `deleted_at`, đánh dấu đã đọc bằng `is_read` và API admin chỉ trả các thông báo chưa bị xóa.
- Ảnh xe được upload local vào thư mục `storage/uploads/cars` hoặc thư mục được cấu hình bằng `OKXE_UPLOAD_DIR`.
- Ảnh đại diện người dùng được upload local vào thư mục `storage/uploads/avatars` hoặc thư mục upload được cấu hình bằng `OKXE_UPLOAD_DIR`.
- Ảnh khuyến mại được upload local vào thư mục `storage/uploads/promotions` hoặc thư mục upload được cấu hình bằng `OKXE_UPLOAD_DIR`.
- Ảnh đại diện bài viết blog được upload local vào thư mục `storage/uploads/blog` hoặc thư mục upload được cấu hình bằng `OKXE_UPLOAD_DIR`.

### Bảo mật

- Không hard-code mật khẩu database, token hoặc secret key trong code.
- Thông tin cấu hình nên để trong file `.env`.
- Phân quyền rõ ràng giữa người dùng thường, nhân viên và admin.
- Người dùng thường không được truy cập chức năng quản trị. Chỉ tài khoản có `role` là `staff` hoặc `admin` mới được vào trang admin và gọi API quản trị.
- Trang quản trị sử dụng trang đăng nhập nhân viên riêng tại `/admin-login`.
- Email nhân viên/admin có thể được cấu hình bằng `STAFF_EMAILS` và `ADMIN_EMAILS` trong `.env` để tự gán quyền khi tài khoản đăng ký hoặc khi server khởi động.
- Quyền `staff` được quản lý xe trong admin. Quyền `admin` được quản lý xe và quản lý tài khoản nhân viên, bao gồm tạo tài khoản nhân viên/admin, chỉnh sửa họ tên/email/mật khẩu/role, đổi role nhanh và xóa tài khoản.
- Quyền `staff` hoặc `admin` được quản lý bài khuyến mại và bài viết blog trong trang admin.
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

### Thay đổi database gần nhất

- Bảng thay đổi: `car_sell_requests`.
- Cột thêm: `customer_deal_price_text`, `customer_deal_price_value`, `final_price_text`, `final_price_value`.
- SQL migration tham khảo:

```sql
ALTER TABLE car_sell_requests ADD COLUMN customer_deal_price_text TEXT NOT NULL DEFAULT '';
ALTER TABLE car_sell_requests ADD COLUMN customer_deal_price_value INTEGER NOT NULL DEFAULT 0;
ALTER TABLE car_sell_requests ADD COLUMN final_price_text TEXT NOT NULL DEFAULT '';
ALTER TABLE car_sell_requests ADD COLUMN final_price_value INTEGER NOT NULL DEFAULT 0;
```

- Lý do: tách giá khách mong muốn, giá chốt với khách và giá bán trên hệ thống; giá bán trên hệ thống được dùng làm giá chính thức của xe trong bảng `cars`, còn giá chốt với khách là nền dữ liệu quản trị giá vốn/lợi nhuận và tính thưởng sale sau này.

- Bảng thay đổi: `deposit_orders`, `deposit_payment_settings`.
- Cột thêm ở `deposit_orders`: `expires_at`, `expired_at`, `payment_reminder_sent_at`, `payment_reference`, `payment_received_at`, `payment_confirmation_note`, `payment_confirmed_by_user_id`, `payment_confirmed_by_name`, `payment_confirmed_at`, `transfer_proof_url`, `transfer_proof_file_name`, `transfer_proof_uploaded_at`, `vnpay_txn_ref`, `vnpay_transaction_no`, `vnpay_response_code`, `vnpay_transaction_status`, `vnpay_bank_code`, `vnpay_card_type`, `vnpay_pay_date`, `vnpay_payment_url`, `vnpay_confirmed_at`, `refund_amount`, `refund_reference`, `refund_completed_at`, `refund_note`, `refund_confirmed_by_user_id`, `refund_confirmed_by_name`, `refund_confirmed_at`.
- Cột thêm ở `deposit_payment_settings`: `policy_text`.
- Bảng thêm: `deposit_order_status_history`, `deposit_payment_settings`.
- SQL migration tham khảo:

```sql
ALTER TABLE deposit_orders ADD COLUMN expires_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN expired_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN payment_reminder_sent_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN payment_reference TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN payment_received_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN payment_confirmation_note TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN payment_confirmed_by_user_id INTEGER;
ALTER TABLE deposit_orders ADD COLUMN payment_confirmed_by_name TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN payment_confirmed_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN transfer_proof_url TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN transfer_proof_file_name TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN transfer_proof_uploaded_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_txn_ref TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_transaction_no TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_response_code TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_transaction_status TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_bank_code TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_card_type TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_pay_date TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_payment_url TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN vnpay_confirmed_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN refund_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE deposit_orders ADD COLUMN refund_reference TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN refund_completed_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN refund_note TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN refund_confirmed_by_user_id INTEGER;
ALTER TABLE deposit_orders ADD COLUMN refund_confirmed_by_name TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_orders ADD COLUMN refund_confirmed_at TEXT NOT NULL DEFAULT '';
ALTER TABLE deposit_payment_settings ADD COLUMN policy_text TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS deposit_order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deposit_order_id INTEGER NOT NULL,
  previous_status TEXT NOT NULL DEFAULT '',
  next_status TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  actor_user_id INTEGER,
  actor_name TEXT NOT NULL DEFAULT '',
  action_type TEXT NOT NULL DEFAULT 'status_update',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deposit_order_id) REFERENCES deposit_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS deposit_payment_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  account_name TEXT NOT NULL DEFAULT '',
  bank_name TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  branch TEXT NOT NULL DEFAULT '',
  transfer_prefix TEXT NOT NULL DEFAULT 'OKXE COC',
  deposit_amount_options_json TEXT NOT NULL DEFAULT '',
  default_deposit_amount INTEGER NOT NULL DEFAULT 10000000,
  min_deposit_amount INTEGER NOT NULL DEFAULT 1000000,
  max_deposit_amount INTEGER NOT NULL DEFAULT 200000000,
  hold_hours INTEGER NOT NULL DEFAULT 24,
  require_transfer_proof INTEGER NOT NULL DEFAULT 0,
  policy_text TEXT NOT NULL DEFAULT '',
  updated_by_user_id INTEGER,
  updated_by_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_deposit_orders_payment_reference
ON deposit_orders (payment_reference);

CREATE INDEX IF NOT EXISTS idx_deposit_orders_vnpay_txn_ref
ON deposit_orders (vnpay_txn_ref);
```

- Lý do: lưu thời hạn giữ chỗ, trạng thái quá hạn, thông tin đối soát khi admin/nhân viên hoặc VNPay sandbox xác nhận đã nhận tiền đặt cọc, chứng từ chuyển khoản khách tải, thông tin hoàn cọc khi hủy sau đặt cọc, timeline lịch sử xử lý, chính sách đặt cọc/hủy cọc/hoàn cọc hiển thị cho khách và cấu hình thanh toán đặt cọc chỉnh được trong admin; đồng thời hỗ trợ chốt giao dịch sau khi đã nhận cọc, chặn dùng trùng mã giao dịch, tra cứu giao dịch VNPay và báo cáo tiền cọc/hoàn cọc.

### KPI / Hiệu quả kinh doanh sale

- Trang quản trị có mục **KPI / Hiệu quả kinh doanh** chỉ hiển thị và thao tác được với tài khoản `admin`; tài khoản `staff` không được tạo, sửa hoặc hủy KPI.
- KPI chỉ được ghi nhận thủ công bởi admin sau khi giao dịch thành công: tin đăng bán xe đã được duyệt và nhập kho (`approved`, có giá chốt với khách), đơn đặt cọc đã hoàn tất (`completed`), hoặc xe được admin đổi trực tiếp từ `Còn xe` sang `Xe đã bán` tại quản lý kho. Đơn mới xác nhận cọc (`confirmed`) không được tính KPI/doanh số.
- Khi ghi nhận, admin chọn sale chịu trách nhiệm, tiền thưởng, trạng thái thưởng `pending`/`paid` và ghi chú. Hệ thống lưu ảnh chụp dữ liệu giao dịch tại thời điểm ghi nhận để báo cáo lịch sử không đổi theo dữ liệu xe/đơn về sau.
- Mỗi nguồn giao dịch chỉ được tạo một bản ghi KPI theo loại tương ứng: một tin đăng bán tạo tối đa một KPI `acquisition`, một đơn đặt cọc hoàn tất tạo tối đa một KPI `sale`, một xe bán trực tiếp tạo tối đa một KPI `direct_sale`.
- Admin có thể điều chỉnh sale, tiền thưởng, trạng thái chi và ghi chú của KPI còn hiệu lực; khi hủy phải nhập lý do. KPI hủy không bị xóa mà giữ lịch sử và không còn tính vào thống kê.

### Thay đổi database mới nhất

- Bảng thêm: `sales_kpi_records`.
- Cột chính: `kpi_type`, `source_id`, `sale_user_id`, `sale_name`, `car_id`, giá trị giao dịch/giá nhập/giá bán, `reward_amount`, `reward_status`, `record_status`, thông tin admin ghi nhận và lịch sử hủy.
- Ràng buộc: `UNIQUE (kpi_type, source_id)` để một giao dịch thành công không được ghi KPI trùng.
- SQL migration tham khảo:

```sql
CREATE TABLE IF NOT EXISTS sales_kpi_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kpi_type TEXT NOT NULL,
  source_id INTEGER NOT NULL,
  sale_user_id INTEGER NOT NULL,
  sale_name TEXT NOT NULL DEFAULT '',
  car_id INTEGER,
  car_name TEXT NOT NULL DEFAULT '',
  car_brand TEXT NOT NULL DEFAULT '',
  source_code TEXT NOT NULL DEFAULT '',
  transaction_value INTEGER NOT NULL DEFAULT 0,
  purchase_price_value INTEGER NOT NULL DEFAULT 0,
  sale_price_value INTEGER NOT NULL DEFAULT 0,
  reward_amount INTEGER NOT NULL DEFAULT 0,
  reward_status TEXT NOT NULL DEFAULT 'pending',
  record_status TEXT NOT NULL DEFAULT 'active',
  note TEXT NOT NULL DEFAULT '',
  recorded_by_user_id INTEGER,
  recorded_by_name TEXT NOT NULL DEFAULT '',
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TEXT NOT NULL DEFAULT '',
  cancelled_by_user_id INTEGER,
  cancelled_by_name TEXT NOT NULL DEFAULT '',
  cancellation_note TEXT NOT NULL DEFAULT '',
  UNIQUE (kpi_type, source_id)
);
```

- Lý do: ghi nhận KPI/doanh số và thưởng sale do admin chốt sau giao dịch thành công, chặn tính trùng và giữ lịch sử điều chỉnh/hủy minh bạch.

- Bảng thêm: `direct_car_sales`.
- Cột chính: `car_id` (duy nhất), ảnh chụp tên/hãng xe, `sale_price_value`, người đổi xe sang đã bán và thời điểm bán trực tiếp.
- SQL migration tham khảo:

```sql
CREATE TABLE IF NOT EXISTS direct_car_sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id INTEGER NOT NULL UNIQUE,
  car_name TEXT NOT NULL DEFAULT '',
  car_brand TEXT NOT NULL DEFAULT '',
  sale_price_value INTEGER NOT NULL DEFAULT 0,
  sold_by_user_id INTEGER,
  sold_by_name TEXT NOT NULL DEFAULT '',
  sold_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE RESTRICT,
  FOREIGN KEY (sold_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

- Lý do: lưu nguồn giao dịch bán trực tiếp tại cửa hàng khi admin chuyển xe từ `Còn xe` sang `Xe đã bán`, để admin gán sale và thưởng trong KPI mà không cần tạo đơn đặt cọc.

## Ghi chú khác
- Đây là đồ án tốt nghiệp nên ưu tiên code dễ giải thích khi bảo vệ.
- Không dùng công nghệ quá phức tạp ngoài HTML, CSS, JavaScript, Node.js, Express.js và SQLite nếu không được yêu cầu.
- Không tự ý thêm framework frontend như React, Vue, Angular.
- Không tự ý thay đổi toàn bộ giao diện hoặc kiến trúc dự án nếu task chỉ yêu cầu sửa một phần nhỏ.
- Khi tạo chức năng mới, cần đảm bảo phù hợp với website bán ô tô cũ.
- Khi không chắc yêu cầu, hãy chọn cách đơn giản, dễ hiểu và dễ bảo trì nhất.
