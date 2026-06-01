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
|-- mailer.js                    # Password-reset OTP email and preview email handling
|-- package.json                 # npm scripts and dependencies
|-- data/
|   |-- rentals.db               # Default SQLite database
|   `-- mail-previews/           # OTP email previews when SMTP is unavailable
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
- `SMTP_*`: SMTP configuration for password-reset OTP emails.
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
- `car_buy_requests`: customer car-buying request posts.

User passwords are hashed with Node.js `scryptSync`; plain-text passwords are not stored.

## Uploads and OTP Email

- Car images are stored in `storage/uploads/cars` unless `OKXE_UPLOAD_DIR` is configured.
- Avatars are stored in `storage/uploads/avatars`.
- Promotion images are stored in `storage/uploads/promotions`.
- Each uploaded image can be up to 5MB.
- Supported image types: JPG, PNG, WEBP, and GIF.
- Password-reset OTP emails are sent through SMTP when configured.
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

## GitHub Notes

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
