# OkXe - Used Car Dealer Website

OkXe is a used car dealership website built with Node.js, Express, SQLite, and plain HTML/CSS/JavaScript. The project supports customer-facing car browsing, detailed vehicle pages, favorites, test-drive appointments, consultation requests, promotions, and car-buying request posts. It also includes a staff/admin dashboard for managing cars, users, appointments, consultation requests, promotions, and customer car-buying requests.

## Table of Contents

- [Main Features](#main-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Accounts and Roles](#accounts-and-roles)
- [Main Pages](#main-pages)
- [Key API Routes](#key-api-routes)
- [Database](#database)
- [Uploads and OTP Email](#uploads-and-otp-email)
- [Useful Scripts](#useful-scripts)
- [GitHub Notes](#github-notes)

## Main Features

### Customer Website

- View featured cars on the homepage, limited to the 10 newest cars from the database.
- Search and filter cars by brand, category, year, price range, condition, mileage, fuel type, gearbox, origin, color, and seats.
- Browse all available cars at `/mua-xe`.
- View a separate car detail page at `/cars/:id`.
- Compare up to 3 cars in a comparison popup.
- Sign up, log in, log out, and reset passwords with email OTP.
- Update customer profile information, including phone number, citizen ID, birthday, gender, avatar, and contact address.
- Save favorite cars and view the personal favorites list.
- Submit consultation or quotation requests for a specific car. Guests can submit requests without logging in.
- Register for a test drive after logging in, including car selection, preferred date, and time slot.
- View notifications about test-drive appointments, car-buying requests, and promotions.
- View public promotions at `/khuyen-mai`.
- View the sales consultant team at `/tu-van-ban-hang`.
- View public car-buying requests at `/tin-mua-o-to`.
- Submit a car-buying request at `/dang-tin-mua-o-to`.

### Staff/Admin Dashboard

- Separate staff/admin login page at `/admin-login`.
- Protected admin dashboard at `/admin`, available only to `staff` and `admin` accounts.
- Car management: create, update, delete, enter specifications, write descriptions, set availability, and upload multiple images.
- Test-drive appointment management: view statistics, approve, cancel, hold appointments, and handle schedule conflicts by car/date/time slot.
- Consultation request management: search, update status, and delete requests.
- Promotion management: create promotion posts, upload/crop banner images, enable/disable public display, and sort homepage order.
- Car-buying request management: approve, reject, and delete customer posts.
- User management: admins can create/update/delete staff/admin accounts and update customer profile details.
- Sales consultant management for homepage and public team listing.

## Tech Stack

- Backend: Node.js, Express.js
- Database: SQLite through Node.js `node:sqlite`
- Frontend: plain HTML, CSS, and JavaScript
- Email: Nodemailer
- Environment config: dotenv
- Development server: nodemon
- External UI libraries: Bootstrap CDN and Boxicons CDN

## Project Structure

```text
.
|-- server.js                    # Express server, routes, middleware, uploads, auth
|-- db.js                        # SQLite setup, schema, seed data, and data-access helpers
|-- mailer.js                    # Password-reset OTP, deposit-order email, and preview handling
|-- package.json                 # npm scripts and dependencies
|-- data/
|   |-- rentals.db               # Default SQLite database
|   `-- mail-previews/           # Email previews when SMTP is unavailable
|-- public/
|   |-- global/                  # Shared frontend CSS/JS
|   |-- home/                    # Homepage HTML/CSS/JS
|   |-- admin/                   # Admin dashboard HTML/CSS/JS
|   |-- admin-login/             # Staff/admin login HTML/CSS/JS
|   |-- inventory/               # Car listing HTML/CSS/JS
|   |-- car-detail/              # Car detail template HTML/CSS/JS
|   |-- test-drive/              # Test-drive registration HTML/CSS/JS
|   |-- promotions/              # Public promotions HTML/CSS/JS
|   |-- buy-requests/            # Public car-buying requests HTML/CSS/JS
|   |-- buy-request-form/        # Car-buying request form HTML/JS
|   `-- sales-team/              # Sales consultant listing HTML/CSS/JS
|-- images/                      # Static UI and demo images
|-- storage/uploads/             # Runtime local uploads
|-- scripts/
|   |-- start-backend.ps1
|   |-- start-backend-background.ps1
|   |-- seed-demo-promotions.js
|   `-- generate-usecase-diagrams.js
|-- docs/usecase-diagrams/       # Use-case diagrams in SVG/PNG
`-- .md/                         # Requirements and project planning documents
```

## Requirements

- Node.js `22.5.0` or newer.
- npm.
- Windows PowerShell if you want to use the `.ps1` scripts.

This project uses `node:sqlite`, so an older Node.js version may fail to start the server.

## Installation and Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd Car-Dealer-Website
```

2. Install dependencies:

```bash
npm install
```

3. Create a local `.env` file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Start the server:

```bash
npm start
```

For development with nodemon:

```bash
npm run dev
```

5. Open the website:

```text
http://localhost:3000
```

Admin login:

```text
http://localhost:3000/admin-login
```

## Environment Variables

The repository includes `.env.example`:

```env
APP_BASE_URL=http://localhost:3000
OKXE_DATA_DIR=C:\Users\your-user\AppData\Local
ADMIN_EMAILS=admin@example.com
STAFF_EMAILS=nhanvien@example.com
OTP_HASH_SECRET=replace-with-a-long-random-secret
OKXE_DEPOSIT_BANK_ACCOUNT_NAME=OKXE AUTO
OKXE_DEPOSIT_BANK_NAME=Vietcombank
OKXE_DEPOSIT_BANK_ACCOUNT_NUMBER=0123 456 789
OKXE_DEPOSIT_BANK_BRANCH=
OKXE_DEPOSIT_TRANSFER_PREFIX=OKXE COC
OKXE_DEPOSIT_AMOUNT_OPTIONS=5000000,10000000,20000000
OKXE_DEPOSIT_DEFAULT_AMOUNT=10000000
OKXE_DEPOSIT_MIN_AMOUNT=1000000
OKXE_DEPOSIT_MAX_AMOUNT=200000000
OKXE_DEPOSIT_HOLD_HOURS=24
OKXE_DEPOSIT_REMINDER_HOURS=3
OKXE_DEPOSIT_REQUIRE_TRANSFER_PROOF=false
OKXE_DEPOSIT_POLICY_TEXT=Khach chuyen khoan dung so tien va noi dung don dat coc. Xe duoc giu trong thoi gian cau hinh; neu qua han chua xac nhan nhan tien, don co the bi huy va xe duoc mo ban lai.

OKXE_VNPAY_ENABLED=true
# false = redirect to official VNPAY sandbox gateway; true = use local simulator for demos without merchant keys
OKXE_VNPAY_SANDBOX_TEST_MODE=false
OKXE_VNPAY_TMN_CODE=your-vnpay-sandbox-tmn-code
OKXE_VNPAY_HASH_SECRET=your-vnpay-sandbox-hash-secret
OKXE_VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
OKXE_VNPAY_RETURN_URL=
OKXE_VNPAY_ORDER_TYPE=other
# Optional: VNPAYQR, VNBANK, INTCARD, or leave blank so VNPAY lets the customer choose
OKXE_VNPAY_BANK_CODE=
OKXE_VNPAY_LOCALE=vn
OKXE_VNPAY_EXPIRE_MINUTES=15

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=OkXe <your-gmail@gmail.com>
SMTP_PREVIEW_ON_FAILURE=true
```

Common variables:

- `PORT`: server port. Defaults to `3000`.
- `OKXE_DATA_DIR`: when set, the SQLite database is stored at `<OKXE_DATA_DIR>/okxe/data/rentals.db`.
- `OKXE_UPLOAD_DIR`: when set, uploaded files are stored in this directory.
- `ADMIN_EMAILS`: comma-separated list of admin emails.
- `STAFF_EMAILS`: comma-separated list of staff emails.
- `OTP_HASH_SECRET` or `SESSION_SECRET`: secret used for password-reset OTP hashing.
- `OKXE_DEPOSIT_*`: initial seed values for the deposit-payment admin config, including bank account, transfer note prefix, amount options/default/min/max, hold hours, reminder window, whether transfer proof is required, and customer-facing deposit policy text. After the first run, staff/admin can edit the active values in the admin deposit-payment config screen.
- `OKXE_VNPAY_*`: VNPay sandbox configuration for automatic deposit payment URLs. Standard VNPAY sandbox mode uses `OKXE_VNPAY_SANDBOX_TEST_MODE=false`, `OKXE_VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`, and merchant credentials (`OKXE_VNPAY_TMN_CODE`, `OKXE_VNPAY_HASH_SECRET`) from the VNPAY sandbox account. `APP_BASE_URL` should be public if VNPAY IPN needs to call back to your dev server.
- `OKXE_VNPAY_BANK_CODE`: optional VNPAY payment channel. Leave blank so the official VNPAY screen lets the customer choose, or use `VNPAYQR`, `VNBANK`, or `INTCARD`.
- Local VNPay simulator mode is only for demos without merchant keys: set `OKXE_VNPAY_SANDBOX_TEST_MODE=true` and use `/api/deposit-payment/vnpay/mock-pay` as the payment URL. The simulator shows order review, card entry, OTP, and a signed return callback. Successful test card: `9704198526191432198`, cardholder `NGUYEN VAN A`, issue date `07/15`, OTP `123456`; it also includes insufficient balance, inactive card, locked card, expired card, and customer cancellation scenarios.
- `SMTP_*`: SMTP configuration for password-reset OTP and deposit-order lifecycle emails.
- `SMTP_PREVIEW_ON_FAILURE=true`: in development, failed SMTP sends are written to `data/mail-previews`.

## Accounts and Roles

The system supports three roles:

- `customer`: regular customer account.
- `staff`: staff account with access to the admin dashboard and sales operations.
- `admin`: administrator account with additional staff/admin account management permissions.

How to create a staff/admin account:

1. Add the email to `ADMIN_EMAILS` or `STAFF_EMAILS` in `.env`.
2. Restart the server.
3. Register on the website using that email.
4. Log in to `/admin-login`.

The system prevents deleting or demoting the last admin account to avoid losing dashboard access.

## Main Pages

| Route | Purpose |
| --- | --- |
| `/` | OkXe homepage |
| `/mua-xe` | Car listing, search, filtering, and comparison |
| `/cars/:id` | Car detail page |
| `/dang-ky-lai-thu` | Test-drive registration |
| `/khuyen-mai` | Public promotions |
| `/tin-mua-o-to` | Public car-buying requests |
| `/dang-tin-mua-o-to` | Submit a car-buying request |
| `/tu-van-ban-hang` | Sales consultant listing |
| `/admin-login` | Staff/admin login |
| `/admin` | Admin dashboard |

## Key API Routes

### Public and Customer Routes

- `GET /api/cars` - list cars.
- `GET /api/cars/:id` - get car details.
- `GET /api/team-members` - get featured sales consultants.
- `GET /api/team-members/all` - get all public sales consultants.
- `GET /api/promotions` - get homepage promotions.
- `GET /api/promotions/all` - get public promotions.
- `GET /api/car-buy-requests` - get approved car-buying requests.
- `POST /api/car-buy-requests` - submit a car-buying request.
- `POST /api/consultation-requests` - submit a consultation or quotation request.

### Authentication and Profile

- `POST /api/auth/signup` - register.
- `POST /api/auth/login` - customer login.
- `POST /api/auth/logout` - customer logout.
- `GET /api/auth/me` - get the current customer session.
- `PATCH /api/auth/profile` - update customer profile.
- `POST /api/auth/forgot-password` - request password-reset OTP.
- `POST /api/auth/reset-password` - reset password with OTP.
- `POST /api/auth/admin-login` - staff/admin login.
- `POST /api/auth/admin-logout` - staff/admin logout.
- `GET /api/auth/admin-me` - get the current staff/admin session.

### Favorites and Test Drives

- `GET /api/favorites` - list favorite cars for the logged-in customer.
- `POST /api/favorites/:carId` - add a favorite car.
- `DELETE /api/favorites/:carId` - remove a favorite car.
- `GET /api/test-drive/cars` - list available cars for test drives.
- `GET /api/test-drive/appointments` - list the logged-in customer's test-drive appointments.
- `POST /api/test-drive/appointments` - create a test-drive appointment.
- `DELETE /api/test-drive/appointments/:id` - delete a customer test-drive appointment.

### Deposit Orders

- `GET /api/deposit-payment/config` - get the active bank-transfer, VNPay availability, and deposit-rule configuration for deposit payments.
- `GET /api/deposit-payment/vnpay/return` - browser return URL for VNPay sandbox payment results.
- `GET /api/deposit-payment/vnpay/ipn` - VNPay sandbox IPN endpoint that validates the checksum, checks order amount, and auto-confirms successful payments.
- `POST /api/deposit-orders` - create a deposit order and hold the selected car; bank transfer returns the waiting flow, VNPay returns a signed payment URL.
- `POST /api/deposit-orders/:id/transfer-proof` - upload a bank-transfer proof image for a confirmed order after checking the order phone number.
- `POST /api/deposit-orders/status-check` - check a deposit order by order code/id and phone number, including expiry and status history.
- `POST /api/deposit-orders/receipt` - get a printable receipt for a confirmed/completed deposit order by order code/id and phone number.
- `GET /api/deposit-orders/my` - list deposit orders for the logged-in customer.
- `GET /api/deposit-orders/:id/receipt` - get a printable receipt for a confirmed/completed deposit order owned by the logged-in customer.

The deposit-payment page stores pending bank-transfer/VNPay order id/code and phone in `localStorage` so it can restore the waiting screen after a reload or after returning from VNPay. Pending orders are reminded once before the configured hold deadline, then automatically expire after the hold window and release the held car.
The admin deposit screen includes a quick report for received deposits, refunded deposits, net deposit amount, completed orders, pending orders, orders missing transfer proof, soon-expiring orders, reminded orders, and orders needing reconciliation. The report and audit-history CSV exports use the currently filtered deposit-order list.

### Admin Routes

- `POST /api/uploads/car-images` - upload car images.
- `POST /api/uploads/avatar` - upload an avatar.
- `POST /api/uploads/promotion-image` - upload a promotion image.
- `POST /api/uploads/promotion-image/cropped` - upload a cropped promotion image.
- `POST /api/cars` - create or update a car.
- `DELETE /api/cars/:id` - delete a car.
- `GET /api/admin/promotions` - list promotions for admin.
- `POST /api/admin/promotions` - create or update a promotion.
- `DELETE /api/admin/promotions/:id` - delete a promotion.
- `GET /api/admin/car-buy-requests` - manage car-buying requests.
- `PATCH /api/admin/car-buy-requests/:id/status` - approve or reject a car-buying request.
- `DELETE /api/admin/car-buy-requests/:id` - delete a car-buying request.
- `GET /api/admin/consultation-requests` - manage consultation requests.
- `PATCH /api/admin/consultation-requests/:id/status` - update consultation request status.
- `DELETE /api/admin/consultation-requests/:id` - delete a consultation request.
- `GET /api/admin/deposit-payment/config` - get the active deposit-payment settings for the admin config form.
- `PATCH /api/admin/deposit-payment/config` - update bank account, transfer prefix, amount options/default/min/max, hold hours, and transfer-proof requirement.
- `GET /api/admin/deposit-orders` - manage customer deposit orders.
- `PATCH /api/admin/deposit-orders/:id/status` - update a deposit order status (`pending`, `confirmed`, `completed`, `cancelled_after_deposit`, `cancelled`, `expired`). When setting `status` to `confirmed`, the payload must include a unique `paymentReference` and `paymentReceivedAt`; it may include `paymentConfirmationNote` for internal reconciliation. `completed` can be set after `confirmed` and marks the car as sold. `cancelled_after_deposit` can be set after `confirmed`, releases the held car, and may include `refundAmount`, `refundReference`, `refundCompletedAt`, and `refundNote` to record the refund workflow.
- `GET /api/admin/test-drive-appointments` - manage test-drive appointments.
- `PATCH /api/admin/test-drive-appointments/:id/status` - update test-drive appointment status.
- `DELETE /api/admin/test-drive-appointments/:id` - delete a test-drive appointment.
- `GET /api/admin/users` - list users.
- `POST /api/admin/users` - create a staff/admin account.
- `PATCH /api/admin/users/:id` - update a user account.
- `PATCH /api/admin/users/:id/role` - update a user role.
- `DELETE /api/admin/users/:id` - delete a user account.

## Database

The default SQLite database is stored at:

```text
data/rentals.db
```

When the server starts, `db.js` creates the schema if needed and adds missing columns for older local databases. Main tables:

- `users`: accounts, roles, customer profiles, and sales staff profiles.
- `user_sessions`: login sessions.
- `password_reset_otps`: password-reset OTP records.
- `cars`: car data, specifications, main image, and multiple image list.
- `promotions`: promotion posts.
- `user_favorite_cars`: customer favorite cars.
- `test_drive_appointments`: test-drive appointments.
- `consultation_requests`: consultation and quotation requests.
- `deposit_payment_settings`: active deposit-payment settings editable in admin, including bank account, transfer prefix, amount options, min/max/default amount, hold hours, transfer-proof requirement, and customer-facing deposit policy text.
- `deposit_orders`: deposit orders used to hold cars until payment confirmation, completion, cancellation, or expiry. It stores bank-transfer proof data, manual payment references, VNPay sandbox transaction fields (`vnpay_txn_ref`, `vnpay_transaction_no`, response/status/bank/card/pay-date/payment-url/confirmed-at), hold deadline, expiry time, payment reminders, refund data, and audit metadata.
- `deposit_order_status_history`: timeline of deposit-order status changes, notes, actor, and action type.
- `car_buy_requests`: customer car-buying request posts.

User passwords are hashed with Node.js `scryptSync`; plain-text passwords are not stored.

## Uploads and OTP Email

- Car images are stored in `storage/uploads/cars` unless `OKXE_UPLOAD_DIR` is configured.
- Avatars are stored in `storage/uploads/avatars`.
- Promotion images are stored in `storage/uploads/promotions`.
- Deposit transfer proof images are stored in `storage/uploads/deposit-proofs`.
- Each uploaded image can be up to 5MB.
- Supported image types: JPG, PNG, WEBP, and GIF.
- Password-reset OTP emails are sent through SMTP when configured.
- Deposit-order lifecycle emails are sent when a customer creates an order, a pending order is reminded before expiry, staff/admin updates its status, or the system expires an overdue order.
- If SMTP is unavailable in development, preview emails are written to `data/mail-previews`.

## Useful Scripts

```bash
npm start
```

Starts the server with `node server.js`.

```bash
npm run dev
```

Starts the server with `nodemon server.js`.

```bash
npm run start:stable
```

Starts the backend through `scripts/start-backend.ps1`.

```bash
npm run start:stable:bg
```

Starts the backend in the background through `scripts/start-backend-background.ps1`.

```bash
node scripts/seed-demo-promotions.js
```

Recreates demo promotion data.

```bash
node scripts/generate-usecase-diagrams.js
```

Generates use-case diagrams in `docs/usecase-diagrams`.

```bash
npm run build:pages
```

Builds a static GitHub Pages demo in `dist/pages`. This demo serves the public HTML/CSS/JavaScript UI and uses an in-browser mock API, so it is suitable for front-end previews only. The full Express/SQLite backend still needs `npm start`.

## GitHub Notes

### GitHub Pages front-end demo

This repository includes `.github/workflows/static.yml` for GitHub Pages. To publish the demo:

1. Push the repository to GitHub on the `main` branch.
2. Open the repository on GitHub, then go to `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Open the `Actions` tab and run `Deploy static content to Pages`, or push a new commit to `main`.

The workflow builds `dist/pages` and deploys only that folder. Route aliases such as `/mua-xe`, `/khuyen-mai`, `/tin-mua-o-to`, `/dang-tin-ban-xe`, `/dang-ky-lai-thu`, `/tu-van-ban-hang`, `/blog`, and `/cars/:id` are prepared for a static demo. API calls are mocked in the browser; submitted forms and admin mutations show demo success messages but do not write to SQLite.

Recommended files to commit:

- Source code: `server.js`, `db.js`, `mailer.js`, `public/`, `scripts/`, `docs/`, `.md/`.
- Example environment file: `.env.example`.
- Required demo/static images in `images/`.
- `package.json` and `package-lock.json`.

Do not commit:

- `.env`
- `node_modules/`
- `logs/`
- `storage/`
- `data/mail-previews/`
- `*.log`
- `.tmp-runtime*/`

The current `.gitignore` already covers these runtime and private files.

## Author

This project was created as a graduation project for a used car dealership website.
