# Biểu đồ quan hệ dữ liệu

Nguồn đối chiếu: schema SQLite được khởi tạo trong `db.js`.

```mermaid
erDiagram
  USERS ||--o{ USER_SESSIONS : "dang nhap bang"
  USERS ||--o{ PASSWORD_RESET_OTPS : "yeu cau dat lai mat khau"
  USERS ||--o{ USER_FAVORITE_CARS : "luu yeu thich"
  CARS ||--o{ USER_FAVORITE_CARS : "duoc yeu thich"

  USERS {
    INTEGER id PK
    TEXT full_name
    TEXT email UK
    TEXT password_hash
    TEXT role
    TEXT phone
    TEXT citizen_id
    TEXT birth_date
    TEXT gender
    TEXT avatar_url
    TEXT sales_title
    TEXT sales_specialty
    TEXT sales_experience
    TEXT sales_bio
    INTEGER show_on_home
    INTEGER home_display_order
    TEXT address_province
    TEXT address_district
    TEXT address_ward
    TEXT address_detail
    TEXT updated_at
    TEXT created_at
  }

  USER_SESSIONS {
    TEXT token PK
    INTEGER user_id FK
    TEXT expires_at
    TEXT created_at
  }

  PASSWORD_RESET_OTPS {
    INTEGER id PK
    INTEGER user_id FK
    TEXT otp_hash
    TEXT expires_at
    TEXT used_at
    TEXT created_at
  }

  CARS {
    INTEGER id PK
    TEXT brand
    TEXT category
    TEXT name
    TEXT description
    TEXT type
    TEXT price_text
    INTEGER price_value
    TEXT image
    TEXT images_json
    INTEGER year
    TEXT fuel
    TEXT mileage_text
    INTEGER mileage_value
    TEXT seats
    TEXT gearbox
    TEXT origin
    TEXT condition
    TEXT color
    TEXT action_text
    TEXT created_at
    TEXT updated_at
  }

  PROMOTIONS {
    INTEGER id PK
    TEXT title
    TEXT summary
    TEXT content
    TEXT badge_text
    TEXT image_url
    TEXT cta_text
    TEXT cta_url
    TEXT starts_at
    TEXT ends_at
    INTEGER show_on_home
    INTEGER display_order
    TEXT created_at
    TEXT updated_at
  }

  USER_FAVORITE_CARS {
    INTEGER user_id PK, FK
    INTEGER car_id PK, FK
    TEXT created_at
  }
```

## Ghi chú quan hệ

- `users` là bảng tài khoản dùng chung cho khách hàng, nhân viên và admin qua cột `role`.
- `user_sessions.user_id` tham chiếu `users.id`, xóa user thì session bị xóa theo `ON DELETE CASCADE`.
- `password_reset_otps.user_id` tham chiếu `users.id`, xóa user thì OTP đặt lại mật khẩu bị xóa theo.
- `user_favorite_cars` là bảng trung gian quan hệ nhiều-nhiều giữa `users` và `cars`.
- Khóa chính của `user_favorite_cars` là cặp `(user_id, car_id)`, giúp một user không lưu trùng cùng một xe.
- `promotions` lưu bài khuyến mại độc lập, không cần khóa ngoại trong MVP; trang chủ chỉ lấy bài có `show_on_home = 1` và còn trong khoảng `starts_at`/`ends_at` nếu có nhập.
