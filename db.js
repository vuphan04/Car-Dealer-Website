const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const primaryDbPath = path.join(__dirname, 'data', 'rentals.db');
const configuredDataDir = String(process.env.OKXE_DATA_DIR || '').trim();
const activeDbDir = configuredDataDir
  ? path.join(configuredDataDir, 'okxe', 'data')
  : path.dirname(primaryDbPath);
const activeDbPath = configuredDataDir
  ? path.join(activeDbDir, 'rentals.db')
  : primaryDbPath;
const otpHashSecret =
  process.env.OTP_HASH_SECRET ||
  process.env.SESSION_SECRET ||
  'okxe-development-otp-secret';
const userRoles = new Set(['customer', 'staff', 'admin']);
const employeeRoles = new Set(['staff', 'admin']);
const salesTitles = new Set(['Nhân viên kinh doanh', 'Trưởng phòng kinh doanh']);
const testDriveAppointmentStatuses = new Set(['pending', 'approved', 'cancelled']);
const approvedTestDriveAppointmentStatus = 'approved';
const consultationRequestStatuses = new Set(['new', 'contacted', 'appointment', 'closed', 'failed']);
const carBuyRequestStatuses = new Set(['pending', 'approved', 'rejected']);
const carBuyRequestOfferStatuses = new Set(['new', 'contacted', 'matched', 'rejected']);
const carSellRequestStatuses = new Set(['pending', 'approved']);
const blogPostStatuses = new Set(['draft', 'published']);

const normalizeConfiguredEmail = (email) =>
  String(email || '').trim().toLowerCase();

const parseConfiguredEmails = (value) =>
  new Set(
    String(value || '')
      .split(',')
      .map(normalizeConfiguredEmail)
      .filter(Boolean)
  );

const configuredStaffEmails = parseConfiguredEmails(process.env.STAFF_EMAILS);
const configuredAdminEmails = parseConfiguredEmails(process.env.ADMIN_EMAILS);

const normalizeUserRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();

  return userRoles.has(normalizedRole) ? normalizedRole : 'customer';
};

const normalizeTestDriveAppointmentStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  if (normalizedStatus === 'new') {
    return 'pending';
  }

  return testDriveAppointmentStatuses.has(normalizedStatus)
    ? normalizedStatus
    : 'pending';
};

const normalizeConsultationRequestStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  return consultationRequestStatuses.has(normalizedStatus)
    ? normalizedStatus
    : 'new';
};

const normalizeCarBuyRequestStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  return carBuyRequestStatuses.has(normalizedStatus)
    ? normalizedStatus
    : 'pending';
};

const normalizeCarBuyRequestOfferStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  return carBuyRequestOfferStatuses.has(normalizedStatus)
    ? normalizedStatus
    : 'new';
};

const normalizeCarSellRequestStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  return carSellRequestStatuses.has(normalizedStatus)
    ? normalizedStatus
    : 'pending';
};

const normalizeBlogPostStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  return blogPostStatuses.has(normalizedStatus)
    ? normalizedStatus
    : 'draft';
};

const getConfiguredRoleForEmail = (email) => {
  const normalizedEmail = normalizeConfiguredEmail(email);

  if (configuredAdminEmails.has(normalizedEmail)) {
    return 'admin';
  }

  if (configuredStaffEmails.has(normalizedEmail)) {
    return 'staff';
  }

  return 'customer';
};

const syncConfiguredEmployeeRoles = (database) => {
  const configuredRolesByEmail = new Map();

  configuredStaffEmails.forEach((email) => {
    configuredRolesByEmail.set(email, 'staff');
  });
  configuredAdminEmails.forEach((email) => {
    configuredRolesByEmail.set(email, 'admin');
  });

  if (!configuredRolesByEmail.size) {
    return;
  }

  const updateUserRoleStatement = database.prepare(`
    UPDATE users
    SET role = ?
    WHERE lower(email) = ?
  `);

  configuredRolesByEmail.forEach((role, email) => {
    updateUserRoleStatement.run(role, email);
  });
};

const ensureDatabaseFile = () => {
  fs.mkdirSync(activeDbDir, { recursive: true });

  if (fs.existsSync(activeDbPath)) {
    return;
  }

  try {
    const primaryDbStat = fs.statSync(primaryDbPath, { throwIfNoEntry: false });
    const primaryJournalPath = `${primaryDbPath}-journal`;
    const hasJournal = fs.existsSync(primaryJournalPath);

    if (configuredDataDir && primaryDbStat?.isFile() && !hasJournal) {
      fs.copyFileSync(primaryDbPath, activeDbPath);
      return;
    }
  } catch (error) {
    console.warn(
      `Could not migrate SQLite database from ${primaryDbPath}: ${error.message}`
    );
  }

  if (!fs.existsSync(activeDbPath)) {
    fs.closeSync(fs.openSync(activeDbPath, 'a'));
  }
};

const openDatabase = () => {
  ensureDatabaseFile();
  return new DatabaseSync(activeDbPath);
};

const initializeSchema = (database) => {
  database.exec(`
  PRAGMA journal_mode = MEMORY;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    phone TEXT NOT NULL DEFAULT '',
    citizen_id TEXT NOT NULL DEFAULT '',
    birth_date TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    sales_title TEXT NOT NULL DEFAULT 'Nhân viên kinh doanh',
    sales_specialty TEXT NOT NULL DEFAULT '',
    sales_experience TEXT NOT NULL DEFAULT '',
    sales_bio TEXT NOT NULL DEFAULT '',
    show_on_home INTEGER NOT NULL DEFAULT 0,
    home_display_order INTEGER NOT NULL DEFAULT 0,
    address_province TEXT NOT NULL DEFAULT '',
    address_district TEXT NOT NULL DEFAULT '',
    address_ward TEXT NOT NULL DEFAULT '',
    address_detail TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS password_reset_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL DEFAULT 'Khác',
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL,
    price_text TEXT NOT NULL,
    price_value INTEGER NOT NULL,
    image TEXT NOT NULL,
    images_json TEXT NOT NULL DEFAULT '[]',
    year INTEGER NOT NULL,
    fuel TEXT NOT NULL,
    mileage_text TEXT NOT NULL,
    mileage_value INTEGER NOT NULL,
    seats TEXT NOT NULL,
    gearbox TEXT NOT NULL,
    drivetrain TEXT NOT NULL DEFAULT 'FWD - Dẫn động cầu trước',
    origin TEXT NOT NULL,
    condition TEXT NOT NULL,
    color TEXT NOT NULL,
    action_text TEXT NOT NULL DEFAULT 'Còn xe',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    badge_text TEXT NOT NULL DEFAULT 'Khuyến mại',
    image_url TEXT NOT NULL DEFAULT '',
    cta_text TEXT NOT NULL DEFAULT 'Xem ưu đãi',
    cta_url TEXT NOT NULL DEFAULT '#footer',
    starts_at TEXT NOT NULL DEFAULT '',
    ends_at TEXT NOT NULL DEFAULT '',
    show_on_home INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    image_alt TEXT NOT NULL DEFAULT '',
    author_id INTEGER,
    author_name TEXT NOT NULL DEFAULT '',
    published_at TEXT NOT NULL DEFAULT '',
    read_time INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'draft',
    featured INTEGER NOT NULL DEFAULT 0,
    show_on_home INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS user_favorite_cars (
    user_id INTEGER NOT NULL,
    car_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, car_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS test_drive_appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    car_id INTEGER,
    car_name TEXT NOT NULL DEFAULT '',
    car_brand TEXT NOT NULL DEFAULT '',
    car_price_text TEXT NOT NULL DEFAULT '',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time_slot TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    status_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS consultation_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    car_id INTEGER,
    car_name TEXT NOT NULL DEFAULT '',
    car_brand TEXT NOT NULL DEFAULT '',
    car_price_text TEXT NOT NULL DEFAULT '',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    request_type TEXT NOT NULL DEFAULT 'consultation',
    preferred_contact_time TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    status_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS car_buy_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    budget_range TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    province TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    status_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS car_buy_request_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_buy_request_id INTEGER NOT NULL,
    seller_name TEXT NOT NULL,
    seller_phone TEXT NOT NULL,
    seller_email TEXT NOT NULL DEFAULT '',
    car_brand TEXT NOT NULL DEFAULT '',
    car_model TEXT NOT NULL DEFAULT '',
    car_year TEXT NOT NULL DEFAULT '',
    car_version TEXT NOT NULL DEFAULT '',
    expected_price TEXT NOT NULL DEFAULT '',
    mileage TEXT NOT NULL DEFAULT '',
    condition_note TEXT NOT NULL DEFAULT '',
    contact_preference TEXT NOT NULL DEFAULT 'okxe_first',
    status TEXT NOT NULL DEFAULT 'new',
    status_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_buy_request_id) REFERENCES car_buy_requests(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS car_sell_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    brand TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT '',
    price_text TEXT NOT NULL DEFAULT '',
    price_value INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL DEFAULT '',
    images_json TEXT NOT NULL DEFAULT '[]',
    year INTEGER NOT NULL DEFAULT 0,
    fuel TEXT NOT NULL DEFAULT '',
    mileage_text TEXT NOT NULL DEFAULT '',
    mileage_value INTEGER NOT NULL DEFAULT 0,
    seats TEXT NOT NULL DEFAULT '',
    gearbox TEXT NOT NULL DEFAULT '',
    drivetrain TEXT NOT NULL DEFAULT '',
    origin TEXT NOT NULL DEFAULT '',
    condition TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    action_text TEXT NOT NULL DEFAULT 'Còn xe',
    status TEXT NOT NULL DEFAULT 'pending',
    status_note TEXT NOT NULL DEFAULT '',
    approved_car_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_car_id) REFERENCES cars(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    entity_type TEXT NOT NULL DEFAULT '',
    entity_id INTEGER,
    status TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
  ON user_sessions (user_id);

  CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
  ON user_sessions (expires_at);

  CREATE INDEX IF NOT EXISTS idx_password_reset_otps_user_id
  ON password_reset_otps (user_id);

  CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires_at
  ON password_reset_otps (expires_at);

  CREATE INDEX IF NOT EXISTS idx_cars_name
  ON cars (name);

  CREATE INDEX IF NOT EXISTS idx_cars_price_value
  ON cars (price_value);

  CREATE INDEX IF NOT EXISTS idx_blog_posts_public
  ON blog_posts (status, featured, display_order, published_at);

  CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts (slug);

  CREATE INDEX IF NOT EXISTS idx_user_favorite_cars_user_id
  ON user_favorite_cars (user_id);

  CREATE INDEX IF NOT EXISTS idx_user_favorite_cars_car_id
  ON user_favorite_cars (car_id);

  CREATE INDEX IF NOT EXISTS idx_test_drive_appointments_user_id
  ON test_drive_appointments (user_id);

  CREATE INDEX IF NOT EXISTS idx_test_drive_appointments_preferred_date
  ON test_drive_appointments (preferred_date, created_at);

  CREATE INDEX IF NOT EXISTS idx_consultation_requests_status
  ON consultation_requests (status, created_at);

  CREATE INDEX IF NOT EXISTS idx_consultation_requests_car_id
  ON consultation_requests (car_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_car_buy_requests_status
  ON car_buy_requests (status, created_at);

  CREATE INDEX IF NOT EXISTS idx_car_buy_requests_budget
  ON car_buy_requests (budget_range, created_at);

  CREATE INDEX IF NOT EXISTS idx_car_buy_requests_user_id
  ON car_buy_requests (user_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_car_buy_request_offers_request_id
  ON car_buy_request_offers (car_buy_request_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_car_buy_request_offers_status
  ON car_buy_request_offers (status, created_at);

  CREATE INDEX IF NOT EXISTS idx_car_sell_requests_status
  ON car_sell_requests (status, created_at);

  CREATE INDEX IF NOT EXISTS idx_car_sell_requests_user_id
  ON car_sell_requests (user_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id
  ON user_notifications (user_id, created_at);

`);

  const userColumns = database.prepare('PRAGMA table_info(users)').all();
  const userColumnNames = new Set(userColumns.map((column) => column.name));
  const hasUserRoleColumn = userColumnNames.has('role');

  if (!hasUserRoleColumn) {
    database.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'");
  }

  const userProfileColumns = [
    ['phone', "ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT ''"],
    ['citizen_id', "ALTER TABLE users ADD COLUMN citizen_id TEXT NOT NULL DEFAULT ''"],
    ['birth_date', "ALTER TABLE users ADD COLUMN birth_date TEXT NOT NULL DEFAULT ''"],
    ['gender', "ALTER TABLE users ADD COLUMN gender TEXT NOT NULL DEFAULT ''"],
    ['avatar_url', "ALTER TABLE users ADD COLUMN avatar_url TEXT NOT NULL DEFAULT ''"],
    ['sales_title', "ALTER TABLE users ADD COLUMN sales_title TEXT NOT NULL DEFAULT 'Nhân viên kinh doanh'"],
    ['sales_specialty', "ALTER TABLE users ADD COLUMN sales_specialty TEXT NOT NULL DEFAULT ''"],
    ['sales_experience', "ALTER TABLE users ADD COLUMN sales_experience TEXT NOT NULL DEFAULT ''"],
    ['sales_bio', "ALTER TABLE users ADD COLUMN sales_bio TEXT NOT NULL DEFAULT ''"],
    ['show_on_home', 'ALTER TABLE users ADD COLUMN show_on_home INTEGER NOT NULL DEFAULT 0'],
    ['home_display_order', 'ALTER TABLE users ADD COLUMN home_display_order INTEGER NOT NULL DEFAULT 0'],
    ['address_province', "ALTER TABLE users ADD COLUMN address_province TEXT NOT NULL DEFAULT ''"],
    ['address_district', "ALTER TABLE users ADD COLUMN address_district TEXT NOT NULL DEFAULT ''"],
    ['address_ward', "ALTER TABLE users ADD COLUMN address_ward TEXT NOT NULL DEFAULT ''"],
    ['address_detail', "ALTER TABLE users ADD COLUMN address_detail TEXT NOT NULL DEFAULT ''"],
    ['updated_at', 'ALTER TABLE users ADD COLUMN updated_at TEXT'],
  ];

  userProfileColumns.forEach(([columnName, alterStatement]) => {
    if (!userColumnNames.has(columnName)) {
      database.exec(alterStatement);
    }
  });

  database.exec(`
    UPDATE users
    SET role = 'customer'
    WHERE role IS NULL
       OR role = ''
  `);
  database.exec(`
    UPDATE users
    SET updated_at = COALESCE(NULLIF(updated_at, ''), created_at, CURRENT_TIMESTAMP)
    WHERE updated_at IS NULL
       OR updated_at = ''
  `);
  database.exec(`
    UPDATE users
    SET show_on_home = 0
    WHERE role NOT IN ('staff', 'admin')
      AND COALESCE(show_on_home, 0) != 0
  `);
  syncConfiguredEmployeeRoles(database);

  const promotionColumns = database.prepare('PRAGMA table_info(promotions)').all();
  const promotionColumnNames = new Set(promotionColumns.map((column) => column.name));
  const promotionHomeColumns = [
    ['show_on_home', 'ALTER TABLE promotions ADD COLUMN show_on_home INTEGER NOT NULL DEFAULT 0'],
    ['display_order', 'ALTER TABLE promotions ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0'],
  ];

  promotionHomeColumns.forEach(([columnName, alterStatement]) => {
    if (!promotionColumnNames.has(columnName)) {
      database.exec(alterStatement);
    }
  });

  const blogPostColumns = database.prepare('PRAGMA table_info(blog_posts)').all();
  const blogPostColumnNames = new Set(blogPostColumns.map((column) => column.name));

  if (!blogPostColumnNames.has('show_on_home')) {
    database.exec('ALTER TABLE blog_posts ADD COLUMN show_on_home INTEGER NOT NULL DEFAULT 0');
    database.exec(`
      UPDATE blog_posts
      SET show_on_home = 1
      WHERE status = 'published'
    `);
  }

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_promotions_home
    ON promotions (show_on_home, display_order, created_at);

    CREATE INDEX IF NOT EXISTS idx_blog_posts_home
    ON blog_posts (show_on_home, status, featured, display_order, published_at);
  `);

  const carColumns = database.prepare('PRAGMA table_info(cars)').all();
  const hasBrandColumn = carColumns.some(
    (column) => column.name === 'brand'
  );
  const hasImagesJsonColumn = carColumns.some(
    (column) => column.name === 'images_json'
  );
  const hasDescriptionColumn = carColumns.some(
    (column) => column.name === 'description'
  );
  const hasDrivetrainColumn = carColumns.some(
    (column) => column.name === 'drivetrain'
  );

  if (!hasBrandColumn) {
    database.exec("ALTER TABLE cars ADD COLUMN brand TEXT NOT NULL DEFAULT 'Khác'");
  }

  if (!hasDescriptionColumn) {
    database.exec("ALTER TABLE cars ADD COLUMN description TEXT NOT NULL DEFAULT ''");
  }

  if (!hasDrivetrainColumn) {
    database.exec("ALTER TABLE cars ADD COLUMN drivetrain TEXT NOT NULL DEFAULT 'FWD - Dẫn động cầu trước'");
  }

  const inferBrandFromName = (name) => {
    const normalizedName = String(name || '').toLowerCase();
    const brandRules = [
      ['mercedes', 'Mercedes-Benz'],
      ['rolls-royce', 'Rolls-Royce'],
      ['porsche', 'Porsche'],
      ['cayenne', 'Porsche'],
      ['macan', 'Porsche'],
      ['audi', 'Audi'],
      ['bmw', 'BMW'],
      ['vinfast', 'VinFast'],
      ['toyota', 'Toyota'],
      ['ford', 'Ford'],
      ['kia', 'Kia'],
      ['hyundai', 'Hyundai'],
      ['mitsubishi', 'Mitsubishi'],
      ['mazda', 'Mazda'],
      ['honda', 'Honda'],
      ['chevrolet', 'Chevrolet'],
    ];
    const matchedRule = brandRules.find(([keyword]) =>
      normalizedName.includes(keyword)
    );

    return matchedRule?.[1] || 'Khác';
  };

  const carsWithoutBrand = database
    .prepare(`
      SELECT id, name, brand
      FROM cars
      WHERE brand IS NULL
         OR brand = ''
         OR brand = 'Khác'
    `)
    .all();

  if (carsWithoutBrand.length) {
    const updateCarBrandStatement = database.prepare(`
      UPDATE cars
      SET brand = ?
      WHERE id = ?
    `);

    carsWithoutBrand.forEach((car) => {
      updateCarBrandStatement.run(inferBrandFromName(car.name), car.id);
    });
  }

  if (!hasImagesJsonColumn) {
    database.exec("ALTER TABLE cars ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'");
  }

  const carsWithoutImageList = database
    .prepare(`
      SELECT id, image
      FROM cars
      WHERE images_json IS NULL
         OR images_json = ''
         OR images_json = '[]'
    `)
    .all();

  if (carsWithoutImageList.length) {
    const updateCarImagesStatement = database.prepare(`
      UPDATE cars
      SET images_json = ?
      WHERE id = ?
    `);

    carsWithoutImageList.forEach((car) => {
      const image = String(car.image || '').trim();

      if (image) {
        updateCarImagesStatement.run(JSON.stringify([image]), car.id);
      }
    });
  }

  const normalizeCarOptionValue = (columnName, canonicalValue, legacyValues) => {
    if (!legacyValues.length) {
      return;
    }

    const placeholders = legacyValues.map(() => '?').join(', ');
    const updateStatement = database.prepare(`
      UPDATE cars
      SET ${columnName} = ?
      WHERE ${columnName} IN (${placeholders})
    `);

    updateStatement.run(canonicalValue, ...legacyValues);
  };

  [
    ['category', 'SUV', ['suv', 'Suv']],
    ['category', 'Thể thao', ['Thể Thao', 'thể thao', 'Sport', 'sport']],
    ['type', 'Tự động', ['Tự Động', 'Số tự động', 'Số Tự Động', 'Hybrid', 'hybrid']],
    ['type', 'Số sàn', ['Sàn', 'sàn', 'Số Sàn', 'so san']],
    ['fuel', 'Xăng', ['xăng', 'xang', 'XANG']],
    ['fuel', 'Diesel', ['diesel', 'DIESEL', 'Dầu', 'dầu', 'dau', 'Dau']],
    ['fuel', 'Hybrid', ['hybrid', 'HYBRID']],
    ['fuel', 'Điện', ['điện', 'dien', 'Dien']],
    ['seats', '4 chỗ', ['4 Chỗ', '4 cho']],
    ['seats', '5 chỗ', ['5 Chỗ', '5 cho']],
    ['seats', '7 chỗ', ['7 Chỗ', '7 cho']],
    ['seats', '9 chỗ', ['9 Chỗ', '9 cho']],
    ['gearbox', 'Số Sàn', ['Sàn', 'sàn', 'Số sàn', 'so san']],
    ['gearbox', 'Tự động', ['Tự Động', 'Số tự động', 'Số Tự Động', 'Tự động / Tay', 'Tự Động / Tay']],
    ['drivetrain', 'FWD - Dẫn động cầu trước', ['FWD', 'fwd', 'Dẫn động cầu trước', 'dẫn động cầu trước', 'Dan dong cau truoc', 'dan dong cau truoc']],
    ['drivetrain', 'RWD - Dẫn động cầu sau', ['RWD', 'rwd', 'Dẫn động cầu sau', 'dẫn động cầu sau', 'Dan dong cau sau', 'dan dong cau sau']],
    ['drivetrain', 'Dẫn động 4 bánh', ['AWD', 'awd', '4WD', '4wd', 'Dẫn động bốn bánh', 'dẫn động bốn bánh', 'Dẫn động 4 bánh', 'dẫn động 4 bánh', 'Dan dong 4 banh', 'dan dong 4 banh']],
    ['origin', 'Nhập khẩu', ['nhập khẩu', 'Nhập Khẩu']],
    ['origin', 'Trong nước', ['trong nước', 'Trong Nước']],
    ['condition', 'Xe mới', ['xe mới', 'Xe Mới']],
    ['condition', 'Xe cũ', ['xe cũ', 'Xe Cũ', 'Xe đã qua sử dụng']],
    ['action_text', 'Còn xe', ['mua ngay', 'Mua ngay', 'Mua Ngay', 'còn hàng', 'Còn hàng', 'Còn Hàng']],
    ['action_text', 'Xe đã bán', ['hết hàng', 'Hết hàng', 'Hết Hàng', 'het hang', 'het xe', 'Hết xe', 'hết xe', 'xe da ban']],
  ].forEach(([columnName, canonicalValue, legacyValues]) => {
    normalizeCarOptionValue(columnName, canonicalValue, legacyValues);
  });

  database.exec(`
    UPDATE cars
    SET drivetrain = 'Dẫn động 4 bánh'
    WHERE drivetrain = 'FWD - Dẫn động cầu trước'
      AND (
        lower(name) LIKE '%macan%'
        OR lower(name) LIKE '%cayenne%'
        OR lower(name) LIKE '%quattro%'
        OR lower(name) LIKE '%4matic%'
        OR lower(name) LIKE '%xdrive%'
        OR lower(brand) = 'audi'
      )
  `);
  database.exec(`
    UPDATE cars
    SET drivetrain = 'RWD - Dẫn động cầu sau'
    WHERE drivetrain = 'FWD - Dẫn động cầu trước'
      AND (
        lower(name) LIKE '%phantom%'
        OR lower(name) LIKE '%bmw m4%'
        OR lower(name) LIKE '%vf3%'
      )
  `);

  const testDriveColumns = database.prepare('PRAGMA table_info(test_drive_appointments)').all();
  const testDriveColumnNames = new Set(testDriveColumns.map((column) => column.name));

  if (!testDriveColumnNames.has('status_note')) {
    database.exec("ALTER TABLE test_drive_appointments ADD COLUMN status_note TEXT NOT NULL DEFAULT ''");
  }

  if (!testDriveColumnNames.has('preferred_time_slot')) {
    database.exec("ALTER TABLE test_drive_appointments ADD COLUMN preferred_time_slot TEXT NOT NULL DEFAULT ''");
  }

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_test_drive_appointments_schedule
    ON test_drive_appointments (car_id, preferred_date, preferred_time_slot, status);
  `);

  database.exec(`
    UPDATE test_drive_appointments
    SET status = 'pending'
    WHERE status IS NULL
       OR status = ''
       OR status = 'new'
  `);
};

const db = openDatabase();

initializeSchema(db);

const insertUserStatement = db.prepare(`
  INSERT INTO users (
    full_name, email, password_hash, role, phone, avatar_url,
    sales_title, sales_specialty, sales_experience, sales_bio, show_on_home, home_display_order,
    citizen_id, birth_date, gender, address_province, address_district, address_ward, address_detail,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

const findUserByIdStatement = db.prepare(`
  SELECT id, full_name, email, role, phone, citizen_id, birth_date, gender, avatar_url,
         sales_title, sales_specialty, sales_experience, sales_bio, show_on_home, home_display_order,
         address_province, address_district, address_ward, address_detail,
         updated_at, created_at
  FROM users
  WHERE id = ?
`);

const findUserWithPasswordByEmailStatement = db.prepare(`
  SELECT id, full_name, email, password_hash, role, phone, citizen_id, birth_date, gender, avatar_url,
         sales_title, sales_specialty, sales_experience, sales_bio, show_on_home, home_display_order,
         address_province, address_district, address_ward, address_detail,
         updated_at, created_at
  FROM users
  WHERE email = ?
`);

const insertSessionStatement = db.prepare(`
  INSERT INTO user_sessions (token, user_id, expires_at)
  VALUES (?, ?, ?)
`);

const findUserBySessionStatement = db.prepare(`
  SELECT users.id, users.full_name, users.email, users.role, users.phone,
         users.citizen_id, users.birth_date, users.gender, users.avatar_url,
         users.sales_title, users.sales_specialty, users.sales_experience, users.sales_bio,
         users.show_on_home, users.home_display_order, users.address_province,
         users.address_district, users.address_ward, users.address_detail,
         users.updated_at, users.created_at
  FROM user_sessions
  INNER JOIN users ON users.id = user_sessions.user_id
  WHERE user_sessions.token = ?
    AND user_sessions.expires_at > ?
`);

const deleteSessionStatement = db.prepare(`
  DELETE FROM user_sessions
  WHERE token = ?
`);

const deleteSessionsByUserStatement = db.prepare(`
  DELETE FROM user_sessions
  WHERE user_id = ?
`);

const deleteExpiredSessionsStatement = db.prepare(`
  DELETE FROM user_sessions
  WHERE expires_at <= ?
`);

const findUserByEmailStatement = db.prepare(`
  SELECT id, full_name, email, role, phone, citizen_id, birth_date, gender, avatar_url,
         sales_title, sales_specialty, sales_experience, sales_bio, show_on_home, home_display_order,
         address_province, address_district, address_ward, address_detail,
         updated_at, created_at
  FROM users
  WHERE email = ?
`);

const listUsersStatement = db.prepare(`
  SELECT id, full_name, email, role, phone, citizen_id, birth_date, gender, avatar_url,
         sales_title, sales_specialty, sales_experience, sales_bio, show_on_home, home_display_order,
         address_province, address_district, address_ward, address_detail,
         updated_at, created_at
  FROM users
  ORDER BY
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'staff' THEN 2
      ELSE 3
    END,
    lower(full_name),
    lower(email)
`);

const listHomepageTeamMembersStatement = db.prepare(`
  SELECT id, full_name, email, role, phone, avatar_url,
         sales_title, sales_specialty, sales_experience, sales_bio,
         home_display_order, updated_at, created_at
  FROM users
  WHERE show_on_home = 1
    AND role = 'staff'
  ORDER BY
    home_display_order ASC,
    CASE sales_title
      WHEN 'Trưởng phòng kinh doanh' THEN 1
      ELSE 2
    END,
    lower(full_name),
    id
  LIMIT 6
`);

const listPublicTeamMembersStatement = db.prepare(`
  SELECT id, full_name, email, role, phone, avatar_url,
         sales_title, sales_specialty, sales_experience, sales_bio,
         home_display_order, updated_at, created_at
  FROM users
  WHERE role = 'staff'
  ORDER BY
    CASE sales_title
      WHEN 'Trưởng phòng kinh doanh' THEN 1
      ELSE 2
    END,
    CAST(sales_experience AS REAL) DESC,
    lower(full_name),
    id
`);

const updateUserRoleStatement = db.prepare(`
  UPDATE users
  SET role = ?,
      show_on_home = CASE WHEN ? = 'staff' THEN show_on_home ELSE 0 END,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateUserProfileStatement = db.prepare(`
  UPDATE users
  SET full_name = ?,
      email = ?,
      role = ?,
      phone = ?,
      avatar_url = ?,
      sales_title = ?,
      sales_specialty = ?,
      sales_experience = ?,
      sales_bio = ?,
      show_on_home = ?,
      home_display_order = ?,
      citizen_id = ?,
      birth_date = ?,
      gender = ?,
      address_province = ?,
      address_district = ?,
      address_ward = ?,
      address_detail = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateUserProfileWithPasswordStatement = db.prepare(`
  UPDATE users
  SET full_name = ?,
      email = ?,
      role = ?,
      phone = ?,
      avatar_url = ?,
      sales_title = ?,
      sales_specialty = ?,
      sales_experience = ?,
      sales_bio = ?,
      show_on_home = ?,
      home_display_order = ?,
      citizen_id = ?,
      birth_date = ?,
      gender = ?,
      address_province = ?,
      address_district = ?,
      address_ward = ?,
      address_detail = ?,
      password_hash = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateUserSelfProfileStatement = db.prepare(`
  UPDATE users
  SET phone = ?,
      citizen_id = ?,
      birth_date = ?,
      gender = ?,
      avatar_url = ?,
      address_province = ?,
      address_district = ?,
      address_ward = ?,
      address_detail = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteUserStatement = db.prepare(`
  DELETE FROM users
  WHERE id = ?
`);

const countAdminsStatement = db.prepare(`
  SELECT COUNT(*) AS total
  FROM users
  WHERE role = 'admin'
`);

const invalidateResetOtpsByUserStatement = db.prepare(`
  UPDATE password_reset_otps
  SET used_at = ?
  WHERE user_id = ?
    AND used_at IS NULL
`);

const insertResetOtpStatement = db.prepare(`
  INSERT INTO password_reset_otps (user_id, otp_hash, expires_at)
  VALUES (?, ?, ?)
`);

const findResetOtpStatement = db.prepare(`
  SELECT password_reset_otps.id, password_reset_otps.user_id, password_reset_otps.expires_at, password_reset_otps.used_at,
         users.id AS account_id, users.full_name, users.email, users.role, users.created_at
  FROM password_reset_otps
  INNER JOIN users ON users.id = password_reset_otps.user_id
  WHERE users.email = ?
    AND password_reset_otps.otp_hash = ?
`);

const markResetOtpUsedStatement = db.prepare(`
  UPDATE password_reset_otps
  SET used_at = ?
  WHERE id = ?
`);

const updateUserPasswordStatement = db.prepare(`
  UPDATE users
  SET password_hash = ?
  WHERE id = ?
`);

const deleteExpiredResetOtpsStatement = db.prepare(`
  DELETE FROM password_reset_otps
  WHERE expires_at <= ?
     OR used_at IS NOT NULL
`);

const insertCarStatement = db.prepare(`
  INSERT INTO cars (
    brand, category, name, description, type, price_text, price_value, image, images_json, year, fuel,
    mileage_text, mileage_value, seats, gearbox, drivetrain, origin, condition, color, action_text
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateCarStatement = db.prepare(`
  UPDATE cars
  SET brand = ?,
      category = ?,
      name = ?,
      description = ?,
      type = ?,
      price_text = ?,
      price_value = ?,
      image = ?,
      images_json = ?,
      year = ?,
      fuel = ?,
      mileage_text = ?,
      mileage_value = ?,
      seats = ?,
      gearbox = ?,
      drivetrain = ?,
      origin = ?,
      condition = ?,
      color = ?,
      action_text = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteCarStatement = db.prepare(`
  DELETE FROM cars
  WHERE id = ?
`);

const findCarByIdStatement = db.prepare(`
  SELECT *
  FROM cars
  WHERE id = ?
`);

const countCarsStatement = db.prepare(`
  SELECT COUNT(*) AS total
  FROM cars
`);

const listCarsStatement = db.prepare(`
  SELECT *
  FROM cars
  ORDER BY datetime(created_at) DESC, id DESC
`);

const listAdminCarsStatement = db.prepare(`
  SELECT cars.*,
         car_sell_requests.id AS sell_request_id,
         car_sell_requests.full_name AS sell_request_full_name,
         car_sell_requests.phone AS sell_request_phone,
         car_sell_requests.email AS sell_request_email,
         car_sell_requests.status_note AS sell_request_status_note,
         car_sell_requests.created_at AS sell_request_created_at,
         car_sell_requests.updated_at AS sell_request_updated_at
  FROM cars
  LEFT JOIN car_sell_requests
    ON car_sell_requests.approved_car_id = cars.id
   AND car_sell_requests.status = 'approved'
  ORDER BY datetime(cars.created_at) DESC, cars.id DESC
`);

const listAvailableTestDriveCarsStatement = db.prepare(`
  SELECT *
  FROM cars
  WHERE action_text = 'Còn xe'
  ORDER BY datetime(created_at) DESC, id DESC
`);

const insertPromotionStatement = db.prepare(`
  INSERT INTO promotions (
    title, summary, content, badge_text, image_url, cta_text, cta_url,
    starts_at, ends_at, show_on_home, display_order
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updatePromotionStatement = db.prepare(`
  UPDATE promotions
  SET title = ?,
      summary = ?,
      content = ?,
      badge_text = ?,
      image_url = ?,
      cta_text = ?,
      cta_url = ?,
      starts_at = ?,
      ends_at = ?,
      show_on_home = ?,
      display_order = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deletePromotionStatement = db.prepare(`
  DELETE FROM promotions
  WHERE id = ?
`);

const findPromotionByIdStatement = db.prepare(`
  SELECT *
  FROM promotions
  WHERE id = ?
`);

const listPromotionsStatement = db.prepare(`
  SELECT *
  FROM promotions
  ORDER BY display_order ASC, datetime(created_at) DESC, id DESC
`);

const listHomepagePromotionsStatement = db.prepare(`
  SELECT *
  FROM promotions
  WHERE show_on_home = 1
    AND (starts_at = '' OR date(starts_at) <= date('now', 'localtime'))
    AND (ends_at = '' OR date(ends_at) >= date('now', 'localtime'))
  ORDER BY display_order ASC, datetime(created_at) DESC, id DESC
  LIMIT 8
`);

const listPublicPromotionsStatement = db.prepare(`
  SELECT *
  FROM promotions
  WHERE show_on_home = 1
    AND (starts_at = '' OR date(starts_at) <= date('now', 'localtime'))
    AND (ends_at = '' OR date(ends_at) >= date('now', 'localtime'))
  ORDER BY display_order ASC, datetime(created_at) DESC, id DESC
`);

const countBlogPostsStatement = db.prepare(`
  SELECT COUNT(*) AS total
  FROM blog_posts
`);

const blogPostStatsStatement = db.prepare(`
  SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
    SUM(CASE WHEN status != 'published' THEN 1 ELSE 0 END) AS draft,
    SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) AS featured,
    SUM(CASE WHEN show_on_home = 1 THEN 1 ELSE 0 END) AS home_visible
  FROM blog_posts
`);

const insertBlogPostStatement = db.prepare(`
  INSERT INTO blog_posts (
    slug, category, title, excerpt, content, image_url, image_alt,
    author_id, author_name, published_at, read_time, status, featured, show_on_home, display_order
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateBlogPostStatement = db.prepare(`
  UPDATE blog_posts
  SET slug = ?,
      category = ?,
      title = ?,
      excerpt = ?,
      content = ?,
      image_url = ?,
      image_alt = ?,
      published_at = ?,
      read_time = ?,
      status = ?,
      featured = ?,
      show_on_home = ?,
      display_order = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteBlogPostStatement = db.prepare(`
  DELETE FROM blog_posts
  WHERE id = ?
`);

const findBlogPostByIdStatement = db.prepare(`
  SELECT blog_posts.*,
         users.full_name AS user_full_name
  FROM blog_posts
  LEFT JOIN users ON users.id = blog_posts.author_id
  WHERE blog_posts.id = ?
`);

const findPublicBlogPostBySlugStatement = db.prepare(`
  SELECT blog_posts.*,
         users.full_name AS user_full_name
  FROM blog_posts
  LEFT JOIN users ON users.id = blog_posts.author_id
  WHERE blog_posts.slug = ?
    AND blog_posts.status = 'published'
    AND (blog_posts.published_at = '' OR date(blog_posts.published_at) <= date('now', 'localtime'))
`);

const listAdminBlogPostsStatement = db.prepare(`
  SELECT blog_posts.*,
         users.full_name AS user_full_name
  FROM blog_posts
  LEFT JOIN users ON users.id = blog_posts.author_id
  ORDER BY blog_posts.featured DESC,
           blog_posts.display_order ASC,
           date(blog_posts.published_at) DESC,
           datetime(blog_posts.created_at) DESC,
           blog_posts.id DESC
`);

const listPublicBlogPostsStatement = db.prepare(`
  SELECT blog_posts.*,
         users.full_name AS user_full_name
  FROM blog_posts
  LEFT JOIN users ON users.id = blog_posts.author_id
  WHERE blog_posts.status = 'published'
    AND (blog_posts.published_at = '' OR date(blog_posts.published_at) <= date('now', 'localtime'))
  ORDER BY blog_posts.featured DESC,
           blog_posts.display_order ASC,
           date(blog_posts.published_at) DESC,
           datetime(blog_posts.created_at) DESC,
           blog_posts.id DESC
`);

const listHomepageBlogPostsStatement = db.prepare(`
  SELECT blog_posts.*,
         users.full_name AS user_full_name
  FROM blog_posts
  LEFT JOIN users ON users.id = blog_posts.author_id
  WHERE blog_posts.status = 'published'
    AND blog_posts.show_on_home = 1
    AND (blog_posts.published_at = '' OR date(blog_posts.published_at) <= date('now', 'localtime'))
  ORDER BY blog_posts.featured DESC,
           blog_posts.display_order ASC,
           date(blog_posts.published_at) DESC,
           datetime(blog_posts.created_at) DESC,
           blog_posts.id DESC
`);

const listFavoriteCarsByUserStatement = db.prepare(`
  SELECT cars.*
  FROM user_favorite_cars
  INNER JOIN cars ON cars.id = user_favorite_cars.car_id
  WHERE user_favorite_cars.user_id = ?
  ORDER BY datetime(user_favorite_cars.created_at) DESC, cars.id DESC
`);

const findFavoriteCarStatement = db.prepare(`
  SELECT user_id, car_id
  FROM user_favorite_cars
  WHERE user_id = ?
    AND car_id = ?
`);

const insertFavoriteCarStatement = db.prepare(`
  INSERT OR IGNORE INTO user_favorite_cars (user_id, car_id)
  VALUES (?, ?)
`);

const deleteFavoriteCarStatement = db.prepare(`
  DELETE FROM user_favorite_cars
  WHERE user_id = ?
    AND car_id = ?
`);

const insertTestDriveAppointmentStatement = db.prepare(`
  INSERT INTO test_drive_appointments (
    user_id, car_id, car_name, car_brand, car_price_text,
    full_name, phone, preferred_date, preferred_time_slot, status_note
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findTestDriveAppointmentByIdStatement = db.prepare(`
  SELECT test_drive_appointments.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM test_drive_appointments
  INNER JOIN users ON users.id = test_drive_appointments.user_id
  WHERE test_drive_appointments.id = ?
`);

const listTestDriveAppointmentsStatement = db.prepare(`
  SELECT test_drive_appointments.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM test_drive_appointments
  INNER JOIN users ON users.id = test_drive_appointments.user_id
  ORDER BY date(test_drive_appointments.preferred_date) ASC,
           datetime(test_drive_appointments.created_at) DESC,
           test_drive_appointments.id DESC
`);

const listTestDriveAppointmentsByUserStatement = db.prepare(`
  SELECT test_drive_appointments.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM test_drive_appointments
  INNER JOIN users ON users.id = test_drive_appointments.user_id
  WHERE test_drive_appointments.user_id = ?
  ORDER BY datetime(test_drive_appointments.created_at) DESC,
           test_drive_appointments.id DESC
`);

const updateTestDriveAppointmentStatusStatement = db.prepare(`
  UPDATE test_drive_appointments
  SET status = ?,
      status_note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateTestDriveAppointmentStatusAndScheduleStatement = db.prepare(`
  UPDATE test_drive_appointments
  SET preferred_date = ?,
      preferred_time_slot = ?,
      status = ?,
      status_note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const findApprovedTestDriveScheduleConflictStatement = db.prepare(`
  SELECT test_drive_appointments.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM test_drive_appointments
  INNER JOIN users ON users.id = test_drive_appointments.user_id
  WHERE test_drive_appointments.car_id = ?
    AND test_drive_appointments.preferred_date = ?
    AND test_drive_appointments.preferred_time_slot = ?
    AND test_drive_appointments.status = ?
    AND test_drive_appointments.id <> ?
  ORDER BY datetime(test_drive_appointments.updated_at) ASC,
           test_drive_appointments.id ASC
  LIMIT 1
`);

const findActiveTestDriveScheduleConflictStatement = db.prepare(`
  SELECT test_drive_appointments.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM test_drive_appointments
  INNER JOIN users ON users.id = test_drive_appointments.user_id
  WHERE test_drive_appointments.car_id = ?
    AND test_drive_appointments.preferred_date = ?
    AND test_drive_appointments.preferred_time_slot = ?
    AND test_drive_appointments.status <> 'cancelled'
    AND test_drive_appointments.id <> ?
  ORDER BY
    CASE test_drive_appointments.status
      WHEN 'approved' THEN 0
      ELSE 1
    END,
    datetime(test_drive_appointments.created_at) ASC,
    test_drive_appointments.id ASC
  LIMIT 1
`);

const deleteTestDriveAppointmentStatement = db.prepare(`
  DELETE FROM test_drive_appointments
  WHERE id = ?
`);

const insertConsultationRequestStatement = db.prepare(`
  INSERT INTO consultation_requests (
    user_id, car_id, car_name, car_brand, car_price_text,
    full_name, phone, email, request_type, preferred_contact_time, note
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findConsultationRequestByIdStatement = db.prepare(`
  SELECT consultation_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM consultation_requests
  LEFT JOIN users ON users.id = consultation_requests.user_id
  WHERE consultation_requests.id = ?
`);

const listConsultationRequestsStatement = db.prepare(`
  SELECT consultation_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM consultation_requests
  LEFT JOIN users ON users.id = consultation_requests.user_id
  ORDER BY
    CASE consultation_requests.status
      WHEN 'new' THEN 0
      WHEN 'contacted' THEN 1
      WHEN 'appointment' THEN 2
      WHEN 'closed' THEN 3
      ELSE 4
    END,
    datetime(consultation_requests.created_at) DESC,
    consultation_requests.id DESC
`);

const updateConsultationRequestStatusStatement = db.prepare(`
  UPDATE consultation_requests
  SET status = ?,
      status_note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteConsultationRequestStatement = db.prepare(`
  DELETE FROM consultation_requests
  WHERE id = ?
`);

const insertCarBuyRequestStatement = db.prepare(`
  INSERT INTO car_buy_requests (
    user_id, budget_range, title, content, full_name, phone, email, province, address
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findCarBuyRequestByIdStatement = db.prepare(`
  SELECT car_buy_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM car_buy_requests
  LEFT JOIN users ON users.id = car_buy_requests.user_id
  WHERE car_buy_requests.id = ?
`);

const listPublicCarBuyRequestsStatement = db.prepare(`
  SELECT car_buy_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM car_buy_requests
  LEFT JOIN users ON users.id = car_buy_requests.user_id
  WHERE car_buy_requests.status = 'approved'
  ORDER BY datetime(car_buy_requests.created_at) DESC,
           car_buy_requests.id DESC
`);

const listCarBuyRequestsStatement = db.prepare(`
  SELECT car_buy_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM car_buy_requests
  LEFT JOIN users ON users.id = car_buy_requests.user_id
  ORDER BY
    CASE car_buy_requests.status
      WHEN 'pending' THEN 0
      WHEN 'approved' THEN 1
      ELSE 2
    END,
    datetime(car_buy_requests.created_at) DESC,
    car_buy_requests.id DESC
`);

const listCarBuyRequestsByUserStatement = db.prepare(`
  SELECT car_buy_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM car_buy_requests
  LEFT JOIN users ON users.id = car_buy_requests.user_id
  WHERE car_buy_requests.user_id = ?
  ORDER BY datetime(car_buy_requests.created_at) DESC,
           car_buy_requests.id DESC
`);

const updateCarBuyRequestStatusStatement = db.prepare(`
  UPDATE car_buy_requests
  SET status = ?,
      status_note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteCarBuyRequestStatement = db.prepare(`
  DELETE FROM car_buy_requests
  WHERE id = ?
`);

const insertCarBuyRequestOfferStatement = db.prepare(`
  INSERT INTO car_buy_request_offers (
    car_buy_request_id,
    seller_name,
    seller_phone,
    seller_email,
    car_brand,
    car_model,
    car_year,
    car_version,
    expected_price,
    mileage,
    condition_note,
    contact_preference
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findCarBuyRequestOfferByIdStatement = db.prepare(`
  SELECT *
  FROM car_buy_request_offers
  WHERE id = ?
`);

const listCarBuyRequestOffersByRequestIdStatement = db.prepare(`
  SELECT *
  FROM car_buy_request_offers
  WHERE car_buy_request_id = ?
  ORDER BY
    CASE status
      WHEN 'new' THEN 0
      WHEN 'contacted' THEN 1
      WHEN 'matched' THEN 2
      WHEN 'rejected' THEN 3
      ELSE 4
    END,
    datetime(created_at) DESC,
    id DESC
`);

const countCarBuyRequestOffersByRequestIdStatement = db.prepare(`
  SELECT COUNT(*) AS offer_count
  FROM car_buy_request_offers
  WHERE car_buy_request_id = ?
`);

const updateCarBuyRequestOfferStatusStatement = db.prepare(`
  UPDATE car_buy_request_offers
  SET status = ?,
      status_note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const insertCarSellRequestStatement = db.prepare(`
  INSERT INTO car_sell_requests (
    user_id, full_name, phone, email, brand, category, name, description, type,
    price_text, price_value, image, images_json, year, fuel, mileage_text,
    mileage_value, seats, gearbox, drivetrain, origin, condition, color, action_text
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findCarSellRequestByIdStatement = db.prepare(`
  SELECT car_sell_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM car_sell_requests
  LEFT JOIN users ON users.id = car_sell_requests.user_id
  WHERE car_sell_requests.id = ?
`);

const listCarSellRequestsStatement = db.prepare(`
  SELECT car_sell_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM car_sell_requests
  LEFT JOIN users ON users.id = car_sell_requests.user_id
  ORDER BY
    CASE car_sell_requests.status
      WHEN 'pending' THEN 0
      WHEN 'approved' THEN 1
      ELSE 2
    END,
    datetime(car_sell_requests.created_at) DESC,
    car_sell_requests.id DESC
`);

const listCarSellRequestsByUserStatement = db.prepare(`
  SELECT car_sell_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM car_sell_requests
  LEFT JOIN users ON users.id = car_sell_requests.user_id
  WHERE car_sell_requests.user_id = ?
  ORDER BY datetime(car_sell_requests.created_at) DESC,
           car_sell_requests.id DESC
`);

const updateCarSellRequestApprovedStatement = db.prepare(`
  UPDATE car_sell_requests
  SET status = 'approved',
      status_note = ?,
      approved_car_id = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteCarSellRequestStatement = db.prepare(`
  DELETE FROM car_sell_requests
  WHERE id = ?
`);

const insertUserNotificationStatement = db.prepare(`
  INSERT INTO user_notifications (
    user_id, type, title, message, entity_type, entity_id, status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const listUserNotificationsStatement = db.prepare(`
  SELECT *
  FROM user_notifications
  WHERE user_id = ?
  ORDER BY datetime(created_at) DESC,
           id DESC
  LIMIT 80
`);

const seedCars = [
  {
    brand: 'Rolls-Royce',
    category: 'Sedan',
    name: 'Rolls-Royce Phantom',
    type: 'Tự động',
    priceText: '29,9 tỷ VNĐ',
    priceValue: 29900000000,
    image: '/images/rental-1.png',
    year: 2024,
    fuel: 'Xăng',
    mileageText: '12.300 km',
    mileageValue: 12300,
    seats: '5 chỗ',
    gearbox: 'Tự động',
    drivetrain: 'RWD - Dẫn động cầu sau',
    origin: 'Nhập khẩu',
    condition: 'Xe mới',
    color: 'Đen',
    actionText: 'Còn xe'
  },
  {
    brand: 'Porsche',
    category: 'Sedan',
    name: 'Porsche Macan 4',
    type: 'Tự động',
    priceText: '4,1 tỷ VNĐ',
    priceValue: 4100000000,
    image: '/images/rental-2.png',
    year: 2023,
    fuel: 'Xăng',
    mileageText: '8.900 km',
    mileageValue: 8900,
    seats: '5 chỗ',
    gearbox: 'Tự động',
    drivetrain: 'Dẫn động 4 bánh',
    origin: 'Nhập khẩu',
    condition: 'Xe mới',
    color: 'Xanh lá',
    actionText: 'Còn xe'
  },
  {
    brand: 'Porsche',
    category: 'Sedan',
    name: 'Cayenne S E-Hybrid',
    type: 'Tự động',
    priceText: '5,3 tỷ VNĐ',
    priceValue: 5300000000,
    image: '/images/rental-3.png',
    year: 2024,
    fuel: 'Hybrid',
    mileageText: '5.200 km',
    mileageValue: 5200,
    seats: '5 chỗ',
    gearbox: 'Tự động',
    drivetrain: 'Dẫn động 4 bánh',
    origin: 'Nhập khẩu',
    condition: 'Xe mới',
    color: 'Trắng',
    actionText: 'Còn xe'
  },
  {
    brand: 'Audi',
    category: 'Sedan',
    name: 'Audi A7',
    type: 'Tự động',
    priceText: '3,2 tỷ VNĐ',
    priceValue: 3200000000,
    image: '/images/rental-4.png',
    year: 2022,
    fuel: 'Xăng',
    mileageText: '18.000 km',
    mileageValue: 18000,
    seats: '5 chỗ',
    gearbox: 'Tự động',
    drivetrain: 'Dẫn động 4 bánh',
    origin: 'Nhập khẩu',
    condition: 'Xe cũ',
    color: 'Xanh dương',
    actionText: 'Còn xe'
  },
  {
    brand: 'BMW',
    category: 'Sedan',
    name: 'BMW M4',
    type: 'Tự động',
    priceText: '4,8 tỷ VNĐ',
    priceValue: 4800000000,
    image: '/images/rental-5.png',
    year: 2023,
    fuel: 'Xăng',
    mileageText: '9.800 km',
    mileageValue: 9800,
    seats: '5 chỗ',
    gearbox: 'Tự động',
    drivetrain: 'RWD - Dẫn động cầu sau',
    origin: 'Nhập khẩu',
    condition: 'Xe mới',
    color: 'Cam',
    actionText: 'Còn xe'
  },
  {
    brand: 'Mercedes-Benz',
    category: 'Sedan',
    name: 'Mercedes-Benz CLA',
    type: 'Tự động',
    priceText: '1,9 tỷ VNĐ',
    priceValue: 1900000000,
    image: '/images/rental-6.png',
    year: 2022,
    fuel: 'Xăng',
    mileageText: '16.200 km',
    mileageValue: 16200,
    seats: '5 chỗ',
    gearbox: 'Tự động',
    drivetrain: 'FWD - Dẫn động cầu trước',
    origin: 'Nhập khẩu',
    condition: 'Xe cũ',
    color: 'Trắng',
    actionText: 'Còn xe'
  }
];

const seedBlogPosts = [
  {
    slug: '7-hang-muc-kiem-tra-khi-mua-xe-cu',
    category: 'Kinh nghiệm mua xe',
    title: '7 hạng mục cần kiểm tra trước khi xuống tiền mua xe cũ',
    excerpt: 'Một quy trình kiểm tra ngắn gọn giúp người mua nhận biết tình trạng thân vỏ, động cơ, giấy tờ và chi phí có thể phát sinh.',
    content: 'Bắt đầu từ hồ sơ pháp lý: đăng ký xe, đăng kiểm, số khung và số máy cần trùng khớp với chiếc xe thực tế. Người mua cũng nên xác minh chủ sở hữu, tình trạng thế chấp và lịch sử phạt nguội trước khi đặt cọc.\n\nQuan sát thân vỏ, khoang máy và gầm xe để nhận biết dấu hiệu sửa chữa lớn. Khi lái thử, hãy kiểm tra phanh, vô lăng, tiếng động lạ và độ ổn định ở nhiều dải tốc độ.\n\nNgoài giá mua, nên dành ngân sách cho bảo dưỡng ban đầu, bảo hiểm, lệ phí sang tên và các hạng mục hao mòn.',
    imageUrl: '/images/blog-1.jpg',
    imageAlt: 'Xe Porsche màu đen đang di chuyển trên đường',
    authorName: 'Ban biên tập OkXe',
    publishedAt: '2026-06-18',
    readTime: 7,
    status: 'published',
    featured: true,
    displayOrder: 1,
  },
  {
    slug: 'chi-phi-nuoi-xe-hang-thang',
    category: 'Chi phí sử dụng',
    title: 'Chi phí nuôi xe hàng tháng gồm những khoản nào?',
    excerpt: 'Nhiên liệu chỉ là một phần. Hãy tính thêm gửi xe, bảo dưỡng, bảo hiểm và khoản dự phòng để chọn xe vừa với ngân sách dài hạn.',
    content: 'Phí gửi xe, bảo hiểm bắt buộc, phí đường bộ và đăng kiểm là các khoản có thể ước tính theo năm rồi chia trung bình theo tháng.\n\nNhiên liệu, cầu đường và rửa xe tăng theo quãng đường sử dụng. Để dự toán sát hơn, hãy lấy số kilomet đi lại trung bình mỗi tháng nhân với mức tiêu hao thực tế của mẫu xe.\n\nMột chiếc xe có giá mua thấp chưa chắc tiết kiệm nếu tiêu hao nhiên liệu cao hoặc phụ tùng khó tìm. Tổng chi phí sở hữu trong ba đến năm năm là thước đo phù hợp hơn giá niêm yết ban đầu.',
    imageUrl: '/images/blog-2.jpg',
    imageAlt: 'Xe sedan màu trắng trong bãi đỗ xe',
    authorName: 'Minh Khôi',
    publishedAt: '2026-06-14',
    readTime: 6,
    status: 'published',
    featured: true,
    displayOrder: 2,
  },
  {
    slug: 'sedan-hay-suv-phu-hop-gia-dinh',
    category: 'Tư vấn chọn xe',
    title: 'Sedan hay SUV: đâu là lựa chọn phù hợp cho gia đình?',
    excerpt: 'So sánh không gian, khả năng vận hành, mức tiêu hao và thói quen sử dụng để tìm kiểu xe phù hợp thay vì chạy theo xu hướng.',
    content: 'Sedan thường có trọng tâm thấp, cảm giác lái ổn định và mức tiêu hao dễ chịu. Kiểu xe này phù hợp với người chủ yếu di chuyển trong đô thị.\n\nSUV có khoảng sáng gầm và khoang hành lý linh hoạt, thuận tiện khi đi xa, chở trẻ nhỏ hoặc di chuyển qua đoạn đường xấu.\n\nHãy lái thử với đúng nhu cầu: mang theo ghế trẻ em, vali hoặc vật dụng thường dùng để kiểm tra không gian thực tế.',
    imageUrl: '/images/blog-3.jpg',
    imageAlt: 'Xe thể thao màu đen nhìn từ phía trước',
    authorName: 'Hoàng Nam',
    publishedAt: '2026-06-10',
    readTime: 5,
    status: 'published',
    featured: false,
    displayOrder: 3,
  },
  {
    slug: 'xe-dien-cu-can-luu-y-dieu-gi',
    category: 'Công nghệ xe',
    title: 'Mua xe điện đã qua sử dụng cần lưu ý điều gì?',
    excerpt: 'Tình trạng pin, khả năng sạc và chính sách bảo hành là ba yếu tố cần được kiểm tra kỹ trước khi quyết định.',
    content: 'Dung lượng pin còn lại nên được kiểm tra bằng thiết bị chẩn đoán thay vì chỉ dựa trên quãng đường hiển thị. Nhiệt độ, thói quen sạc và lịch sử sử dụng đều ảnh hưởng tới độ suy giảm.\n\nNgười mua cần xác định chỗ đỗ có thể lắp sạc hay không, vị trí trạm sạc thường dùng và chuẩn đầu sạc của xe.\n\nHãy kiểm tra thời hạn bảo hành pin, lịch sử cập nhật phần mềm và khả năng chuyển quyền sử dụng ứng dụng của hãng sang chủ mới.',
    imageUrl: '/images/vehicle-showroom-a3.jpg',
    imageAlt: 'Xe điện Porsche Taycan trong studio',
    authorName: 'Ban biên tập OkXe',
    publishedAt: '2026-06-06',
    readTime: 8,
    status: 'published',
    featured: false,
    displayOrder: 4,
  },
  {
    slug: 'lich-bao-duong-xe-cu-sau-khi-mua',
    category: 'Chăm sóc xe',
    title: 'Lịch bảo dưỡng nên làm ngay sau khi mua xe cũ',
    excerpt: 'Thay dầu, kiểm tra phanh, lốp và các loại dung dịch giúp thiết lập lại mốc bảo dưỡng rõ ràng cho chủ xe mới.',
    content: 'Nếu hồ sơ bảo dưỡng không đầy đủ, nên thay dầu động cơ và các bộ lọc cơ bản để chủ động tạo mốc theo dõi mới.\n\nMá phanh, đĩa phanh, lốp, đèn và gạt mưa cần được kiểm tra trước các món nâng cấp tiện nghi.\n\nLưu lại hóa đơn, số kilomet và hạng mục đã làm để sử dụng xe ổn định hơn và tăng độ tin cậy khi bán lại.',
    imageUrl: '/images/rental-4.png',
    imageAlt: 'Ô tô màu trắng được trưng bày ngoài trời',
    authorName: 'Tuấn Anh',
    publishedAt: '2026-05-30',
    readTime: 6,
    status: 'published',
    featured: false,
    displayOrder: 5,
  },
  {
    slug: 'quy-trinh-sang-ten-xe-cu',
    category: 'Pháp lý ô tô',
    title: 'Quy trình sang tên xe cũ: giấy tờ nào cần chuẩn bị?',
    excerpt: 'Danh sách hồ sơ và các bước cơ bản giúp bên mua, bên bán chủ động thời gian khi thực hiện thủ tục chuyển quyền sở hữu.',
    content: 'Hai bên cần chuẩn bị giấy tờ cá nhân hợp lệ, đăng ký xe, chứng nhận kiểm định và chứng từ chuyển quyền sở hữu.\n\nSau khi có chứng từ mua bán hợp lệ, bên mua thực hiện kê khai lệ phí trước bạ theo quy định và lưu chứng từ để hoàn thiện hồ sơ đăng ký.\n\nTên chủ xe, số khung, số máy và thông tin phương tiện trên giấy hẹn phải chính xác trước khi nhận đăng ký mới.',
    imageUrl: '/images/car-buy-requests-hero.png',
    imageAlt: 'Nhiều mẫu ô tô trong khu trưng bày',
    authorName: 'Ban biên tập OkXe',
    publishedAt: '2026-05-24',
    readTime: 7,
    status: 'published',
    featured: false,
    displayOrder: 6,
  },
];

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeFullName = (fullName) =>
  String(fullName || '').trim().replace(/\s+/g, ' ');

const normalizeSalesTitle = (title) => {
  const normalizedTitle = String(title || '').trim();

  return salesTitles.has(normalizedTitle)
    ? normalizedTitle
    : 'Nhân viên kinh doanh';
};

const normalizeBooleanInteger = (value) =>
  value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;

const normalizeSalesProfilePayload = (profile = {}, role = 'customer') => {
  const normalizedRole = normalizeUserRole(role);
  const canShowOnHome = normalizedRole === 'staff';
  const displayOrder = Number(profile.homeDisplayOrder ?? profile.displayOrder ?? 0);

  return {
    phone: String(profile.phone || '').trim(),
    avatarUrl: String(profile.avatarUrl || '').trim(),
    salesTitle: normalizeSalesTitle(profile.salesTitle),
    salesSpecialty: String(profile.salesSpecialty || '').trim(),
    salesExperience: String(profile.salesExperience || '').trim(),
    salesBio: String(profile.salesBio || '').trim(),
    showOnHome: canShowOnHome ? normalizeBooleanInteger(profile.showOnHome) : 0,
    homeDisplayOrder: Number.isFinite(displayOrder) ? Math.max(0, Math.trunc(displayOrder)) : 0,
  };
};

const sanitizeUser = (userRow) => {
  if (!userRow) {
    return null;
  }

  return {
    id: userRow.id,
    fullName: userRow.full_name,
    email: userRow.email,
    role: normalizeUserRole(userRow.role),
    phone: userRow.phone || '',
    citizenId: userRow.citizen_id || '',
    birthDate: userRow.birth_date || '',
    gender: userRow.gender || '',
    avatarUrl: userRow.avatar_url || '',
    salesTitle: normalizeSalesTitle(userRow.sales_title),
    salesSpecialty: userRow.sales_specialty || '',
    salesExperience: userRow.sales_experience || '',
    salesBio: userRow.sales_bio || '',
    showOnHome: Boolean(userRow.show_on_home),
    homeDisplayOrder: Number(userRow.home_display_order || 0),
    address: {
      province: userRow.address_province || '',
      district: userRow.address_district || '',
      ward: userRow.address_ward || '',
      detail: userRow.address_detail || '',
    },
    updatedAt: userRow.updated_at || '',
    createdAt: userRow.created_at,
  };
};

const sanitizeTeamMember = (userRow) => {
  if (!userRow) {
    return null;
  }

  return {
    id: userRow.id,
    fullName: userRow.full_name,
    email: userRow.email || '',
    role: normalizeUserRole(userRow.role),
    phone: userRow.phone || '',
    avatarUrl: userRow.avatar_url || '',
    salesTitle: normalizeSalesTitle(userRow.sales_title),
    salesSpecialty: userRow.sales_specialty || '',
    salesExperience: userRow.sales_experience || '',
    salesBio: userRow.sales_bio || '',
    homeDisplayOrder: Number(userRow.home_display_order || 0),
    updatedAt: userRow.updated_at || '',
    createdAt: userRow.created_at || '',
  };
};

const normalizeCarImages = (images, fallbackImage = '') => {
  const imageCandidates = [
    ...(Array.isArray(images) ? images : []),
    fallbackImage,
  ];
  const seenImages = new Set();

  return imageCandidates.reduce((normalizedImages, image) => {
    const normalizedImage = String(image || '').trim();

    if (!normalizedImage || seenImages.has(normalizedImage)) {
      return normalizedImages;
    }

    seenImages.add(normalizedImage);
    normalizedImages.push(normalizedImage);
    return normalizedImages;
  }, []);
};

const parseCarImages = (imagesJson, fallbackImage) => {
  try {
    return normalizeCarImages(JSON.parse(imagesJson || '[]'), fallbackImage);
  } catch (error) {
    return normalizeCarImages([], fallbackImage);
  }
};

const sanitizeCar = (carRow) => {
  if (!carRow) {
    return null;
  }

  const images = parseCarImages(carRow.images_json, carRow.image);

  return {
    id: carRow.id,
    brand: carRow.brand,
    category: carRow.category,
    name: carRow.name,
    description: carRow.description || '',
    type: carRow.type,
    price: carRow.price_text,
    priceValue: carRow.price_value,
    image: images[0] || carRow.image,
    images,
    year: carRow.year,
    fuel: carRow.fuel,
    mileage: carRow.mileage_text,
    mileageValue: carRow.mileage_value,
    seats: carRow.seats,
    gearbox: carRow.gearbox,
    drivetrain: carRow.drivetrain,
    origin: carRow.origin,
    condition: carRow.condition,
    color: carRow.color,
    actionText: carRow.action_text,
    createdAt: carRow.created_at,
    updatedAt: carRow.updated_at
  };
};

const sanitizeAdminCar = (carRow) => {
  const car = sanitizeCar(carRow);

  if (!car) {
    return null;
  }

  if (carRow.sell_request_id) {
    car.inventorySource = {
      type: 'customer_sell_request',
      label: 'Khách gửi bán',
      requestId: carRow.sell_request_id,
      requestCode: `BX-${String(carRow.sell_request_id).padStart(6, '0')}`,
      sellerName: carRow.sell_request_full_name || '',
      sellerPhone: carRow.sell_request_phone || '',
      sellerEmail: carRow.sell_request_email || '',
      statusNote: carRow.sell_request_status_note || '',
      requestedAt: carRow.sell_request_created_at || '',
      approvedAt: carRow.sell_request_updated_at || '',
    };
  } else {
    car.inventorySource = {
      type: 'manual',
      label: 'Nhập kho thủ công',
    };
  }

  return car;
};

const normalizeCarPayload = (car = {}) => {
  const images = normalizeCarImages(car.images, car.image);

  return {
    brand: String(car.brand || '').trim(),
    category: String(car.category || '').trim(),
    name: String(car.name || '').trim(),
    description: String(car.description || '').trim(),
    type: String(car.type || '').trim(),
    priceText: String(car.priceText || car.price || '').trim(),
    priceValue: Number(car.priceValue || 0),
    image: images[0] || String(car.image || '').trim(),
    images,
    year: Number(car.year || 0),
    fuel: String(car.fuel || '').trim(),
    mileageText: String(car.mileageText || car.mileage || '').trim(),
    mileageValue: Number(car.mileageValue || 0),
    seats: String(car.seats || '').trim(),
    gearbox: String(car.gearbox || '').trim(),
    drivetrain: String(car.drivetrain || '').trim(),
    origin: String(car.origin || '').trim(),
    condition: String(car.condition || '').trim(),
    color: String(car.color || '').trim(),
    actionText: String(car.actionText || 'Còn xe').trim() || 'Còn xe'
  };
};

const normalizePromotionPayload = (promotion = {}) => {
  const displayOrder = Number(promotion.displayOrder ?? promotion.homeDisplayOrder ?? 0);

  return {
    title: String(promotion.title || '').trim().replace(/\s+/g, ' '),
    summary: String(promotion.summary || '').trim().replace(/\s+/g, ' '),
    content: String(promotion.content || '').trim(),
    badgeText: String(promotion.badgeText || promotion.badge || 'Khuyến mại').trim().replace(/\s+/g, ' ') || 'Khuyến mại',
    imageUrl: String(promotion.imageUrl || promotion.image || '').trim(),
    ctaText: String(promotion.ctaText || 'Xem ưu đãi').trim().replace(/\s+/g, ' ') || 'Xem ưu đãi',
    ctaUrl: String(promotion.ctaUrl || '#footer').trim() || '#footer',
    startsAt: String(promotion.startsAt || promotion.startDate || '').trim(),
    endsAt: String(promotion.endsAt || promotion.endDate || '').trim(),
    showOnHome: normalizeBooleanInteger(promotion.showOnHome),
    displayOrder: Number.isFinite(displayOrder) ? Math.max(0, Math.trunc(displayOrder)) : 0,
  };
};

const sanitizePromotion = (promotionRow) => {
  if (!promotionRow) {
    return null;
  }

  return {
    id: promotionRow.id,
    title: promotionRow.title,
    summary: promotionRow.summary || '',
    content: promotionRow.content || '',
    badgeText: promotionRow.badge_text || 'Khuyến mại',
    imageUrl: promotionRow.image_url || '',
    ctaText: promotionRow.cta_text || 'Xem ưu đãi',
    ctaUrl: promotionRow.cta_url || '#footer',
    startsAt: promotionRow.starts_at || '',
    endsAt: promotionRow.ends_at || '',
    showOnHome: Boolean(promotionRow.show_on_home),
    displayOrder: Number(promotionRow.display_order || 0),
    createdAt: promotionRow.created_at || '',
    updatedAt: promotionRow.updated_at || '',
  };
};

const normalizeBlogPostPayload = (blogPost = {}) => {
  const readTime = Number(blogPost.readTime || blogPost.read_time || 5);
  const displayOrder = Number(blogPost.displayOrder ?? blogPost.display_order ?? 0);
  const requestedStatus = blogPost.status
    || (blogPost.isPublished || blogPost.published ? 'published' : 'draft');

  return {
    slug: String(blogPost.slug || '').trim().toLowerCase(),
    category: String(blogPost.category || '').trim().replace(/\s+/g, ' '),
    title: String(blogPost.title || '').trim().replace(/\s+/g, ' '),
    excerpt: String(blogPost.excerpt || blogPost.summary || '').trim().replace(/\s+/g, ' '),
    content: String(blogPost.content || '').trim(),
    imageUrl: String(blogPost.imageUrl || blogPost.image || '').trim(),
    imageAlt: String(blogPost.imageAlt || '').trim().replace(/\s+/g, ' '),
    authorId: Number.isInteger(Number(blogPost.authorId)) && Number(blogPost.authorId) > 0
      ? Number(blogPost.authorId)
      : null,
    authorName: String(blogPost.authorName || blogPost.author || 'Ban biên tập OkXe').trim().replace(/\s+/g, ' ') || 'Ban biên tập OkXe',
    publishedAt: String(blogPost.publishedAt || blogPost.published_at || '').trim(),
    readTime: Number.isFinite(readTime) ? Math.max(1, Math.trunc(readTime)) : 5,
    status: normalizeBlogPostStatus(requestedStatus),
    featured: normalizeBooleanInteger(blogPost.featured),
    showOnHome: normalizeBooleanInteger(blogPost.showOnHome ?? blogPost.show_on_home),
    displayOrder: Number.isFinite(displayOrder) ? Math.max(0, Math.trunc(displayOrder)) : 0,
  };
};

const sanitizeBlogPost = (blogPostRow) => {
  if (!blogPostRow) {
    return null;
  }

  const authorName = blogPostRow.author_name || blogPostRow.user_full_name || 'Ban biên tập OkXe';
  const imageUrl = blogPostRow.image_url || '';
  const status = normalizeBlogPostStatus(blogPostRow.status);

  return {
    id: blogPostRow.id,
    slug: blogPostRow.slug,
    category: blogPostRow.category || '',
    title: blogPostRow.title,
    excerpt: blogPostRow.excerpt || '',
    content: blogPostRow.content || '',
    imageUrl,
    image: imageUrl,
    imageAlt: blogPostRow.image_alt || blogPostRow.title || '',
    authorId: blogPostRow.author_id || null,
    authorName,
    author: authorName,
    publishedAt: blogPostRow.published_at || '',
    readTime: Number(blogPostRow.read_time || 5),
    status,
    isPublished: status === 'published',
    featured: Boolean(blogPostRow.featured),
    showOnHome: Boolean(blogPostRow.show_on_home),
    displayOrder: Number(blogPostRow.display_order || 0),
    createdAt: blogPostRow.created_at || '',
    updatedAt: blogPostRow.updated_at || '',
  };
};

const sanitizeTestDriveAppointment = (appointmentRow) => {
  if (!appointmentRow) {
    return null;
  }

  return {
    id: appointmentRow.id,
    userId: appointmentRow.user_id,
    userEmail: appointmentRow.user_email || '',
    userAvatarUrl: appointmentRow.user_avatar_url || '',
    carId: appointmentRow.car_id,
    carName: appointmentRow.car_name || '',
    carBrand: appointmentRow.car_brand || '',
    carPrice: appointmentRow.car_price_text || '',
    fullName: appointmentRow.full_name || '',
    phone: appointmentRow.phone || '',
    preferredDate: appointmentRow.preferred_date || '',
    preferredTimeSlot: appointmentRow.preferred_time_slot || '',
    status: normalizeTestDriveAppointmentStatus(appointmentRow.status),
    statusNote: appointmentRow.status_note || '',
    createdAt: appointmentRow.created_at || '',
    updatedAt: appointmentRow.updated_at || '',
  };
};

const sanitizeConsultationRequest = (requestRow) => {
  if (!requestRow) {
    return null;
  }

  return {
    id: requestRow.id,
    userId: requestRow.user_id,
    userEmail: requestRow.user_email || '',
    userAvatarUrl: requestRow.user_avatar_url || '',
    carId: requestRow.car_id,
    carName: requestRow.car_name || '',
    carBrand: requestRow.car_brand || '',
    carPrice: requestRow.car_price_text || '',
    fullName: requestRow.full_name || '',
    phone: requestRow.phone || '',
    email: requestRow.email || '',
    requestType: requestRow.request_type || 'consultation',
    preferredContactTime: requestRow.preferred_contact_time || '',
    note: requestRow.note || '',
    status: normalizeConsultationRequestStatus(requestRow.status),
    statusNote: requestRow.status_note || '',
    createdAt: requestRow.created_at || '',
    updatedAt: requestRow.updated_at || '',
  };
};

const normalizeCarBuyRequestPayload = (request = {}) => ({
  userId: request.userId ? Number(request.userId) : null,
  budgetRange: String(request.budgetRange || request.budget_range || '').trim(),
  title: String(request.title || '').trim().replace(/\s+/g, ' '),
  content: String(request.content || '').trim(),
  fullName: normalizeFullName(request.fullName || request.full_name),
  phone: String(request.phone || '').trim(),
  email: normalizeEmail(request.email),
  province: String(request.province || '').trim().replace(/\s+/g, ' '),
  address: String(request.address || '').trim().replace(/\s+/g, ' '),
});

const normalizeCarBuyRequestOfferPayload = (offer = {}) => ({
  sellerName: normalizeFullName(offer.sellerName || offer.seller_name),
  sellerPhone: String(offer.sellerPhone || offer.seller_phone || '').trim(),
  sellerEmail: normalizeEmail(offer.sellerEmail || offer.seller_email),
  carBrand: String(offer.carBrand || offer.car_brand || '').trim().replace(/\s+/g, ' '),
  carModel: String(offer.carModel || offer.car_model || '').trim().replace(/\s+/g, ' '),
  carYear: String(offer.carYear || offer.car_year || '').trim().replace(/\s+/g, ' '),
  carVersion: String(offer.carVersion || offer.car_version || '').trim().replace(/\s+/g, ' '),
  expectedPrice: String(offer.expectedPrice || offer.expected_price || '').trim().replace(/\s+/g, ' '),
  mileage: String(offer.mileage || '').trim().replace(/\s+/g, ' '),
  conditionNote: String(offer.conditionNote || offer.condition_note || '').trim(),
  contactPreference: ['okxe_first', 'direct_allowed'].includes(
    String(offer.contactPreference || offer.contact_preference || '').trim()
  )
    ? String(offer.contactPreference || offer.contact_preference || '').trim()
    : 'okxe_first',
});

const sanitizeCarBuyRequest = (requestRow) => {
  if (!requestRow) {
    return null;
  }

  return {
    id: requestRow.id,
    code: `MX-${String(requestRow.id).padStart(6, '0')}`,
    userId: requestRow.user_id,
    userEmail: requestRow.user_email || '',
    userAvatarUrl: requestRow.user_avatar_url || '',
    budgetRange: requestRow.budget_range || '',
    title: requestRow.title || '',
    content: requestRow.content || '',
    fullName: requestRow.full_name || '',
    phone: requestRow.phone || '',
    email: requestRow.email || '',
    province: requestRow.province || '',
    address: requestRow.address || '',
    status: normalizeCarBuyRequestStatus(requestRow.status),
    statusNote: requestRow.status_note || '',
    offerCount: Number(requestRow.offer_count || 0),
    newOfferCount: Number(requestRow.new_offer_count || 0),
    createdAt: requestRow.created_at || '',
    updatedAt: requestRow.updated_at || '',
  };
};

const sanitizeCarBuyRequestOffer = (offerRow) => {
  if (!offerRow) {
    return null;
  }

  return {
    id: offerRow.id,
    code: `DX-${String(offerRow.id).padStart(6, '0')}`,
    requestId: offerRow.car_buy_request_id,
    sellerName: offerRow.seller_name || '',
    sellerPhone: offerRow.seller_phone || '',
    sellerEmail: offerRow.seller_email || '',
    carBrand: offerRow.car_brand || '',
    carModel: offerRow.car_model || '',
    carYear: offerRow.car_year || '',
    carVersion: offerRow.car_version || '',
    expectedPrice: offerRow.expected_price || '',
    mileage: offerRow.mileage || '',
    conditionNote: offerRow.condition_note || '',
    contactPreference: offerRow.contact_preference || 'okxe_first',
    status: normalizeCarBuyRequestOfferStatus(offerRow.status),
    statusNote: offerRow.status_note || '',
    createdAt: offerRow.created_at || '',
    updatedAt: offerRow.updated_at || '',
  };
};

const sanitizeCarBuyRequestOfferForOwner = (offer = {}) => ({
  id: offer.id,
  code: offer.code || '',
  requestId: offer.requestId,
  carBrand: offer.carBrand || '',
  carModel: offer.carModel || '',
  carYear: offer.carYear || '',
  carVersion: offer.carVersion || '',
  expectedPrice: offer.expectedPrice || '',
  mileage: offer.mileage || '',
  status: normalizeCarBuyRequestOfferStatus(offer.status),
  createdAt: offer.createdAt || '',
  updatedAt: offer.updatedAt || '',
});

const normalizeCarSellRequestPayload = (request = {}) => ({
  userId: request.userId ? Number(request.userId) : null,
  fullName: normalizeFullName(request.fullName || request.full_name),
  phone: String(request.phone || '').trim(),
  email: normalizeEmail(request.email),
  car: normalizeCarPayload({
    ...request,
    actionText: request.actionText || request.action_text || 'Còn xe',
  }),
});

const sanitizeCarSellRequest = (requestRow) => {
  if (!requestRow) {
    return null;
  }

  const images = parseCarImages(requestRow.images_json, requestRow.image);

  return {
    id: requestRow.id,
    code: `BX-${String(requestRow.id).padStart(6, '0')}`,
    userId: requestRow.user_id,
    userEmail: requestRow.user_email || '',
    userAvatarUrl: requestRow.user_avatar_url || '',
    fullName: requestRow.full_name || '',
    phone: requestRow.phone || '',
    email: requestRow.email || '',
    brand: requestRow.brand || '',
    category: requestRow.category || '',
    name: requestRow.name || '',
    description: requestRow.description || '',
    type: requestRow.type || '',
    price: requestRow.price_text || '',
    priceValue: Number(requestRow.price_value || 0),
    image: images[0] || requestRow.image || '',
    images,
    year: Number(requestRow.year || 0),
    fuel: requestRow.fuel || '',
    mileage: requestRow.mileage_text || '',
    mileageValue: Number(requestRow.mileage_value || 0),
    seats: requestRow.seats || '',
    gearbox: requestRow.gearbox || '',
    drivetrain: requestRow.drivetrain || '',
    origin: requestRow.origin || '',
    condition: requestRow.condition || '',
    color: requestRow.color || '',
    actionText: requestRow.action_text || 'Còn xe',
    status: normalizeCarSellRequestStatus(requestRow.status),
    statusNote: requestRow.status_note || '',
    approvedCarId: requestRow.approved_car_id,
    createdAt: requestRow.created_at || '',
    updatedAt: requestRow.updated_at || '',
  };
};

const sanitizeUserNotification = (notificationRow) => {
  if (!notificationRow) {
    return null;
  }

  return {
    id: notificationRow.id,
    userId: notificationRow.user_id,
    type: notificationRow.type || '',
    title: notificationRow.title || '',
    message: notificationRow.message || '',
    entityType: notificationRow.entity_type || '',
    entityId: notificationRow.entity_id,
    status: notificationRow.status || '',
    createdAt: notificationRow.created_at || '',
  };
};

const isCarAvailableForTestDrive = (car) =>
  String(car?.actionText || '').trim().toLocaleLowerCase('vi-VN') === 'còn xe';

const upsertCar = (car, existingId = null) => {
  const normalizedCar = normalizeCarPayload(car);

  if (existingId) {
    updateCarStatement.run(
      normalizedCar.brand,
      normalizedCar.category,
      normalizedCar.name,
      normalizedCar.description,
      normalizedCar.type,
      normalizedCar.priceText,
      normalizedCar.priceValue,
      normalizedCar.image,
      JSON.stringify(normalizedCar.images),
      normalizedCar.year,
      normalizedCar.fuel,
      normalizedCar.mileageText,
      normalizedCar.mileageValue,
      normalizedCar.seats,
      normalizedCar.gearbox,
      normalizedCar.drivetrain,
      normalizedCar.origin,
      normalizedCar.condition,
      normalizedCar.color,
      normalizedCar.actionText,
      existingId
    );

    return sanitizeCar(findCarByIdStatement.get(existingId));
  }

  const result = insertCarStatement.run(
    normalizedCar.brand,
    normalizedCar.category,
    normalizedCar.name,
    normalizedCar.description,
    normalizedCar.type,
    normalizedCar.priceText,
    normalizedCar.priceValue,
    normalizedCar.image,
    JSON.stringify(normalizedCar.images),
    normalizedCar.year,
    normalizedCar.fuel,
    normalizedCar.mileageText,
    normalizedCar.mileageValue,
    normalizedCar.seats,
    normalizedCar.gearbox,
    normalizedCar.drivetrain,
    normalizedCar.origin,
    normalizedCar.condition,
    normalizedCar.color,
    normalizedCar.actionText
  );

  return sanitizeCar(findCarByIdStatement.get(result.lastInsertRowid));
};

const seedCarsIfEmpty = () => {
  const carCount = countCarsStatement.get().total;

  if (carCount > 0) {
    return;
  }

  seedCars.forEach((car) => {
    upsertCar(car);
  });
};

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(String(password), salt, 64).toString('hex');

  return `${salt}:${hashedPassword}`;
};

const hashResetOtp = (otp) =>
  createHmac('sha256', otpHashSecret).update(String(otp)).digest('hex');

const verifyPassword = (password, storedHash) => {
  const [salt, storedKey] = String(storedHash || '').split(':');

  if (!salt || !storedKey) {
    return false;
  }

  const storedBuffer = Buffer.from(storedKey, 'hex');
  const derivedKey = scryptSync(String(password), salt, storedBuffer.length);

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
};

const cleanupExpiredSessions = () => {
  deleteExpiredSessionsStatement.run(new Date().toISOString());
};

const cleanupPasswordResetOtps = () => {
  deleteExpiredResetOtpsStatement.run(new Date().toISOString());
};

const createUser = ({
  fullName,
  email,
  password,
  role,
  phone,
  avatarUrl,
  salesTitle,
  salesSpecialty,
  salesExperience,
  salesBio,
  showOnHome,
  homeDisplayOrder,
  citizenId,
  birthDate,
  gender,
  addressProvince,
  addressDistrict,
  addressWard,
  addressDetail,
}) => {
  const normalizedFullName = normalizeFullName(fullName);
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = hashPassword(password);
  const userRole = normalizeUserRole(role || getConfiguredRoleForEmail(normalizedEmail));
  const salesProfile = normalizeSalesProfilePayload(
    {
      phone,
      avatarUrl,
      salesTitle,
      salesSpecialty,
      salesExperience,
      salesBio,
      showOnHome,
      homeDisplayOrder,
    },
    userRole
  );

  const result = insertUserStatement.run(
    normalizedFullName,
    normalizedEmail,
    passwordHash,
    userRole,
    salesProfile.phone,
    salesProfile.avatarUrl,
    salesProfile.salesTitle,
    salesProfile.salesSpecialty,
    salesProfile.salesExperience,
    salesProfile.salesBio,
    salesProfile.showOnHome,
    salesProfile.homeDisplayOrder,
    String(citizenId || '').trim(),
    String(birthDate || '').trim(),
    String(gender || '').trim(),
    String(addressProvince || '').trim(),
    String(addressDistrict || '').trim(),
    String(addressWard || '').trim(),
    String(addressDetail || '').trim()
  );

  return sanitizeUser(findUserByIdStatement.get(result.lastInsertRowid));
};

const listUsers = () => listUsersStatement.all().map(sanitizeUser);

const listHomepageTeamMembers = () =>
  listHomepageTeamMembersStatement.all().map(sanitizeTeamMember);

const listPublicTeamMembers = () =>
  listPublicTeamMembersStatement.all().map(sanitizeTeamMember);

const getUserById = (userId) => sanitizeUser(findUserByIdStatement.get(userId));

const countAdminUsers = () => countAdminsStatement.get().total;

const updateUserRole = (userId, role) => {
  const normalizedRole = normalizeUserRole(role);
  const existingUser = getUserById(userId);

  if (!existingUser) {
    return null;
  }

  updateUserRoleStatement.run(normalizedRole, normalizedRole, userId);
  return getUserById(userId);
};

const updateUserProfile = (
  userId,
  {
    fullName,
    email,
    role,
    password,
    phone,
    avatarUrl,
    salesTitle,
    salesSpecialty,
    salesExperience,
    salesBio,
    showOnHome,
    homeDisplayOrder,
    citizenId,
    birthDate,
    gender,
    addressProvince,
    addressDistrict,
    addressWard,
    addressDetail,
  }
) => {
  const existingUser = getUserById(userId);

  if (!existingUser) {
    return null;
  }

  const normalizedFullName = normalizeFullName(fullName);
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = normalizeUserRole(role);
  const normalizedPassword = String(password || '');
  const salesProfile = normalizeSalesProfilePayload(
    {
      phone,
      avatarUrl,
      salesTitle,
      salesSpecialty,
      salesExperience,
      salesBio,
      showOnHome,
      homeDisplayOrder,
    },
    normalizedRole
  );

  if (normalizedPassword) {
    updateUserProfileWithPasswordStatement.run(
      normalizedFullName,
      normalizedEmail,
      normalizedRole,
      salesProfile.phone,
      salesProfile.avatarUrl,
      salesProfile.salesTitle,
      salesProfile.salesSpecialty,
      salesProfile.salesExperience,
      salesProfile.salesBio,
      salesProfile.showOnHome,
      salesProfile.homeDisplayOrder,
      String(citizenId ?? existingUser.citizenId ?? '').trim(),
      String(birthDate ?? existingUser.birthDate ?? '').trim(),
      String(gender ?? existingUser.gender ?? '').trim(),
      String(addressProvince ?? existingUser.address?.province ?? '').trim(),
      String(addressDistrict ?? existingUser.address?.district ?? '').trim(),
      String(addressWard ?? existingUser.address?.ward ?? '').trim(),
      String(addressDetail ?? existingUser.address?.detail ?? '').trim(),
      hashPassword(normalizedPassword),
      userId
    );
  } else {
    updateUserProfileStatement.run(
      normalizedFullName,
      normalizedEmail,
      normalizedRole,
      salesProfile.phone,
      salesProfile.avatarUrl,
      salesProfile.salesTitle,
      salesProfile.salesSpecialty,
      salesProfile.salesExperience,
      salesProfile.salesBio,
      salesProfile.showOnHome,
      salesProfile.homeDisplayOrder,
      String(citizenId ?? existingUser.citizenId ?? '').trim(),
      String(birthDate ?? existingUser.birthDate ?? '').trim(),
      String(gender ?? existingUser.gender ?? '').trim(),
      String(addressProvince ?? existingUser.address?.province ?? '').trim(),
      String(addressDistrict ?? existingUser.address?.district ?? '').trim(),
      String(addressWard ?? existingUser.address?.ward ?? '').trim(),
      String(addressDetail ?? existingUser.address?.detail ?? '').trim(),
      userId
    );
  }

  return getUserById(userId);
};

const updateUserSelfProfile = (
  userId,
  {
    phone,
    citizenId,
    birthDate,
    gender,
    avatarUrl,
    addressProvince,
    addressDistrict,
    addressWard,
    addressDetail,
  }
) => {
  const existingUser = getUserById(userId);

  if (!existingUser) {
    return null;
  }

  updateUserSelfProfileStatement.run(
    String(phone || '').trim(),
    String(citizenId || '').trim(),
    String(birthDate || '').trim(),
    String(gender || '').trim(),
    String(avatarUrl ?? existingUser.avatarUrl ?? '').trim(),
    String(addressProvince || '').trim(),
    String(addressDistrict || '').trim(),
    String(addressWard || '').trim(),
    String(addressDetail || '').trim(),
    userId
  );

  return getUserById(userId);
};

const deleteUser = (userId) => {
  const existingUser = getUserById(userId);

  if (!existingUser) {
    return null;
  }

  deleteUserStatement.run(userId);
  return existingUser;
};

const authenticateUser = (email, password) => {
  const userRow = findUserWithPasswordByEmailStatement.get(normalizeEmail(email));

  if (!userRow || !verifyPassword(password, userRow.password_hash)) {
    return null;
  }

  return sanitizeUser(userRow);
};

const createSession = (userId, rememberUser = false) => {
  cleanupExpiredSessions();

  const token = randomUUID();
  const expiresAt = new Date(
    Date.now() + (rememberUser ? 30 : 1) * 24 * 60 * 60 * 1000
  ).toISOString();

  insertSessionStatement.run(token, userId, expiresAt);

  return { token, expiresAt };
};

const getUserBySession = (token) => {
  if (!token) {
    return null;
  }

  cleanupExpiredSessions();

  return sanitizeUser(
    findUserBySessionStatement.get(token, new Date().toISOString())
  );
};

const deleteSession = (token) => {
  if (!token) {
    return;
  }

  deleteSessionStatement.run(token);
};

const createPasswordResetOtp = (email) => {
  cleanupPasswordResetOtps();

  const normalizedEmail = normalizeEmail(email);
  const user = findUserByEmailStatement.get(normalizedEmail);

  if (!user) {
    return null;
  }

  const otp = String(randomInt(100000, 1000000));
  const otpHash = hashResetOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.exec('BEGIN IMMEDIATE');

  try {
    invalidateResetOtpsByUserStatement.run(new Date().toISOString(), user.id);
    insertResetOtpStatement.run(user.id, otpHash, expiresAt);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    otp,
    expiresAt,
    user: sanitizeUser(user),
  };
};

const resetPasswordWithOtp = (email, otp, newPassword) => {
  cleanupPasswordResetOtps();

  const otpRecord = findResetOtpStatement.get(
    normalizeEmail(email),
    hashResetOtp(otp)
  );

  if (!otpRecord) {
    return null;
  }

  const isExpired = new Date(otpRecord.expires_at).getTime() <= Date.now();
  const isUsed = Boolean(otpRecord.used_at);

  if (isExpired || isUsed) {
    return null;
  }

  const now = new Date().toISOString();
  const passwordHash = hashPassword(newPassword);

  db.exec('BEGIN IMMEDIATE');

  try {
    updateUserPasswordStatement.run(passwordHash, otpRecord.user_id);
    markResetOtpUsedStatement.run(now, otpRecord.id);
    deleteSessionsByUserStatement.run(otpRecord.user_id);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    id: otpRecord.account_id,
    fullName: otpRecord.full_name,
    email: otpRecord.email,
    role: normalizeUserRole(otpRecord.role),
    createdAt: otpRecord.created_at,
  };
};

const listCars = () => listCarsStatement.all().map(sanitizeCar);

const listAdminCars = () => listAdminCarsStatement.all().map(sanitizeAdminCar);

const getCarById = (carId) => sanitizeCar(findCarByIdStatement.get(carId));

const listAvailableTestDriveCars = () =>
  listAvailableTestDriveCarsStatement.all().map(sanitizeCar);

const listPromotions = () => listPromotionsStatement.all().map(sanitizePromotion);

const listHomepagePromotions = () =>
  listHomepagePromotionsStatement.all().map(sanitizePromotion);

const listPublicPromotions = () =>
  listPublicPromotionsStatement.all().map(sanitizePromotion);

const getPromotionById = (promotionId) =>
  sanitizePromotion(findPromotionByIdStatement.get(promotionId));

const listAdminBlogPosts = () =>
  listAdminBlogPostsStatement.all().map(sanitizeBlogPost);

const listPublicBlogPosts = () =>
  listPublicBlogPostsStatement.all().map(sanitizeBlogPost);

const listHomepageBlogPosts = () =>
  listHomepageBlogPostsStatement.all().map(sanitizeBlogPost);

const getBlogPostById = (blogPostId) =>
  sanitizeBlogPost(findBlogPostByIdStatement.get(blogPostId));

const getPublicBlogPostBySlug = (slug) =>
  sanitizeBlogPost(findPublicBlogPostBySlugStatement.get(String(slug || '').trim()));

const getBlogPostStats = () => {
  const stats = blogPostStatsStatement.get() || {};

  return {
    total: Number(stats.total || 0),
    published: Number(stats.published || 0),
    draft: Number(stats.draft || 0),
    featured: Number(stats.featured || 0),
    homeVisible: Number(stats.home_visible || 0),
  };
};

const getCarBuyRequestById = (requestId) =>
  sanitizeCarBuyRequest(findCarBuyRequestByIdStatement.get(requestId));

const countCarBuyRequestOffersByRequestId = (requestId) =>
  Number(countCarBuyRequestOffersByRequestIdStatement.get(requestId)?.offer_count || 0);

const listCarBuyRequestOffersByRequestId = (requestId) =>
  listCarBuyRequestOffersByRequestIdStatement.all(requestId).map(sanitizeCarBuyRequestOffer);

const attachCarBuyRequestOfferSummary = (request) => {
  if (!request) {
    return null;
  }

  return {
    ...request,
    offerCount: countCarBuyRequestOffersByRequestId(request.id),
  };
};

const attachCarBuyRequestOffers = (request) => {
  if (!request) {
    return null;
  }

  const offers = listCarBuyRequestOffersByRequestId(request.id);

  return {
    ...request,
    offers,
    offerCount: offers.length,
    newOfferCount: offers.filter((offer) => offer.status === 'new').length,
  };
};

const attachCarBuyRequestOfferNotifications = (request) => {
  if (!request) {
    return null;
  }

  const offers = listCarBuyRequestOffersByRequestId(request.id);

  return {
    ...request,
    offerCount: offers.length,
    newOfferCount: offers.filter((offer) => offer.status === 'new').length,
    offerNotifications: offers.map(sanitizeCarBuyRequestOfferForOwner),
  };
};

const getCarBuyRequestOfferById = (offerId) =>
  sanitizeCarBuyRequestOffer(findCarBuyRequestOfferByIdStatement.get(offerId));

const listPublicCarBuyRequests = () =>
  listPublicCarBuyRequestsStatement.all()
    .map(sanitizeCarBuyRequest)
    .map(attachCarBuyRequestOfferSummary);

const listCarBuyRequests = () =>
  listCarBuyRequestsStatement.all()
    .map(sanitizeCarBuyRequest)
    .map(attachCarBuyRequestOffers);

const listCarBuyRequestsByUser = (userId) =>
  listCarBuyRequestsByUserStatement.all(userId)
    .map(sanitizeCarBuyRequest)
    .map(attachCarBuyRequestOfferNotifications);

const listFavoriteCarsByUser = (userId) =>
  listFavoriteCarsByUserStatement.all(userId).map(sanitizeCar);

const isFavoriteCarByUser = (userId, carId) =>
  Boolean(findFavoriteCarStatement.get(userId, carId));

const addFavoriteCarForUser = (userId, carId) => {
  const existingCar = getCarById(carId);

  if (!existingCar) {
    return null;
  }

  insertFavoriteCarStatement.run(userId, carId);

  return {
    car: existingCar,
    favorites: listFavoriteCarsByUser(userId),
  };
};

const removeFavoriteCarForUser = (userId, carId) => {
  const existingCar = getCarById(carId);

  if (!existingCar) {
    return null;
  }

  deleteFavoriteCarStatement.run(userId, carId);

  return {
    car: existingCar,
    favorites: listFavoriteCarsByUser(userId),
  };
};

const listTestDriveAppointments = () =>
  listTestDriveAppointmentsStatement.all().map(sanitizeTestDriveAppointment);

const listTestDriveAppointmentsByUser = (userId) =>
  listTestDriveAppointmentsByUserStatement
    .all(userId)
    .map(sanitizeTestDriveAppointment);

const getTestDriveAppointmentById = (appointmentId) =>
  sanitizeTestDriveAppointment(findTestDriveAppointmentByIdStatement.get(appointmentId));

const listConsultationRequests = () =>
  listConsultationRequestsStatement.all().map(sanitizeConsultationRequest);

const getConsultationRequestById = (requestId) =>
  sanitizeConsultationRequest(findConsultationRequestByIdStatement.get(requestId));

const getApprovedTestDriveScheduleConflict = ({
  appointmentId = 0,
  carId,
  preferredDate,
  preferredTimeSlot,
}) =>
  sanitizeTestDriveAppointment(
    findApprovedTestDriveScheduleConflictStatement.get(
      Number(carId || 0),
      String(preferredDate || '').trim(),
      String(preferredTimeSlot || '').trim(),
      approvedTestDriveAppointmentStatus,
      Number(appointmentId || 0)
    )
  );

const getActiveTestDriveScheduleConflict = ({
  appointmentId = 0,
  carId,
  preferredDate,
  preferredTimeSlot,
}) =>
  sanitizeTestDriveAppointment(
    findActiveTestDriveScheduleConflictStatement.get(
      Number(carId || 0),
      String(preferredDate || '').trim(),
      String(preferredTimeSlot || '').trim(),
      Number(appointmentId || 0)
    )
  );

const updateTestDriveAppointmentStatus = (appointmentId, {
  status,
  statusNote = '',
  preferredDate = '',
  preferredTimeSlot = '',
}) => {
  const existingAppointment = getTestDriveAppointmentById(appointmentId);

  if (!existingAppointment) {
    return null;
  }

  const normalizedStatus = normalizeTestDriveAppointmentStatus(status);
  const nextPreferredDate = String(preferredDate || existingAppointment.preferredDate || '').trim();
  const nextPreferredTimeSlot = String(preferredTimeSlot || existingAppointment.preferredTimeSlot || '').trim();
  const hasScheduleChange =
    nextPreferredDate !== String(existingAppointment.preferredDate || '').trim()
    || nextPreferredTimeSlot !== String(existingAppointment.preferredTimeSlot || '').trim();

  if (normalizedStatus === approvedTestDriveAppointmentStatus) {
    const scheduleConflict = getActiveTestDriveScheduleConflict({
      appointmentId,
      carId: existingAppointment.carId,
      preferredDate: nextPreferredDate,
      preferredTimeSlot: nextPreferredTimeSlot,
    });

    if (scheduleConflict) {
      const conflictError = new Error('TEST_DRIVE_SCHEDULE_CONFLICT');
      conflictError.code = 'TEST_DRIVE_SCHEDULE_CONFLICT';
      conflictError.appointment = scheduleConflict;
      throw conflictError;
    }
  }

  if (hasScheduleChange) {
    const scheduleChangeNote = normalizedStatus === approvedTestDriveAppointmentStatus
      ? `Lịch lái thử của bạn đã được đổi sang ngày ${nextPreferredDate}, khung giờ ${nextPreferredTimeSlot} và đã được xác nhận.`
      : String(statusNote || '').trim();

    updateTestDriveAppointmentStatusAndScheduleStatement.run(
      nextPreferredDate,
      nextPreferredTimeSlot,
      normalizedStatus,
      scheduleChangeNote,
      appointmentId
    );

    return getTestDriveAppointmentById(appointmentId);
  }

  updateTestDriveAppointmentStatusStatement.run(
    normalizedStatus,
    String(statusNote || '').trim(),
    appointmentId
  );

  return getTestDriveAppointmentById(appointmentId);
};

const deleteTestDriveAppointment = (appointmentId) => {
  const existingAppointment = getTestDriveAppointmentById(appointmentId);

  if (!existingAppointment) {
    return null;
  }

  deleteTestDriveAppointmentStatement.run(appointmentId);
  return existingAppointment;
};

const createConsultationRequest = ({
  userId = null,
  carId,
  fullName,
  phone,
  email = '',
  requestType = 'consultation',
  preferredContactTime = '',
  note = '',
}) => {
  const selectedCar = getCarById(carId);

  if (!selectedCar) {
    return null;
  }

  const soldCarConsultationNote = 'Khách quan tâm xe đã hết hàng, cần tư vấn xe tương tự.';
  const canConsultExactCar = isCarAvailableForTestDrive(selectedCar);
  const normalizedNote = String(note || '').trim();
  const normalizedRequestType = String(requestType || 'consultation').trim();
  const finalRequestType = canConsultExactCar ? normalizedRequestType : 'similar_car';
  const finalNote = canConsultExactCar || normalizedNote.includes(soldCarConsultationNote)
    ? normalizedNote
    : [soldCarConsultationNote, normalizedNote].filter(Boolean).join('\n');
  const savedNote = finalNote.slice(0, 700);
  const normalizedUserId = Number(userId || 0);
  const result = insertConsultationRequestStatement.run(
    Number.isInteger(normalizedUserId) && normalizedUserId > 0 ? normalizedUserId : null,
    selectedCar.id,
    selectedCar.name,
    selectedCar.brand,
    selectedCar.price,
    normalizeFullName(fullName),
    String(phone || '').trim(),
    normalizeEmail(email),
    finalRequestType,
    String(preferredContactTime || '').trim(),
    savedNote
  );

  return getConsultationRequestById(result.lastInsertRowid);
};

const updateConsultationRequestStatus = (requestId, {
  status,
  statusNote = '',
}) => {
  const existingRequest = getConsultationRequestById(requestId);

  if (!existingRequest) {
    return null;
  }

  updateConsultationRequestStatusStatement.run(
    normalizeConsultationRequestStatus(status),
    String(statusNote || '').trim(),
    requestId
  );

  return getConsultationRequestById(requestId);
};

const deleteConsultationRequest = (requestId) => {
  const existingRequest = getConsultationRequestById(requestId);

  if (!existingRequest) {
    return null;
  }

  deleteConsultationRequestStatement.run(requestId);
  return existingRequest;
};

const createCarBuyRequest = (request) => {
  const normalizedRequest = normalizeCarBuyRequestPayload(request);
  const normalizedUserId = Number(normalizedRequest.userId || 0);
  const result = insertCarBuyRequestStatement.run(
    Number.isInteger(normalizedUserId) && normalizedUserId > 0 ? normalizedUserId : null,
    normalizedRequest.budgetRange,
    normalizedRequest.title,
    normalizedRequest.content,
    normalizedRequest.fullName,
    normalizedRequest.phone,
    normalizedRequest.email,
    normalizedRequest.province,
    normalizedRequest.address
  );

  return getCarBuyRequestById(result.lastInsertRowid);
};

const createCarBuyRequestOffer = (requestId, offer) => {
  const existingRequest = getCarBuyRequestById(requestId);

  if (!existingRequest || existingRequest.status !== 'approved') {
    return null;
  }

  const normalizedOffer = normalizeCarBuyRequestOfferPayload(offer);
  const result = insertCarBuyRequestOfferStatement.run(
    requestId,
    normalizedOffer.sellerName,
    normalizedOffer.sellerPhone,
    normalizedOffer.sellerEmail,
    normalizedOffer.carBrand,
    normalizedOffer.carModel,
    normalizedOffer.carYear,
    normalizedOffer.carVersion,
    normalizedOffer.expectedPrice,
    normalizedOffer.mileage,
    normalizedOffer.conditionNote,
    normalizedOffer.contactPreference
  );

  return getCarBuyRequestOfferById(result.lastInsertRowid);
};

const updateCarBuyRequestStatus = (requestId, {
  status,
  statusNote = '',
}) => {
  const existingRequest = getCarBuyRequestById(requestId);

  if (!existingRequest) {
    return null;
  }

  const normalizedStatus = normalizeCarBuyRequestStatus(status);
  let normalizedStatusNote = String(statusNote || '').trim();

  if (
    existingRequest.status === 'rejected'
    && normalizedStatus !== 'rejected'
    && normalizedStatusNote === String(existingRequest.statusNote || '').trim()
  ) {
    normalizedStatusNote = '';
  }

  updateCarBuyRequestStatusStatement.run(
    normalizedStatus,
    normalizedStatusNote,
    requestId
  );

  return getCarBuyRequestById(requestId);
};

const updateCarBuyRequestOfferStatus = (offerId, {
  status,
  statusNote = '',
}) => {
  const existingOffer = getCarBuyRequestOfferById(offerId);

  if (!existingOffer) {
    return null;
  }

  updateCarBuyRequestOfferStatusStatement.run(
    normalizeCarBuyRequestOfferStatus(status),
    String(statusNote || '').trim(),
    offerId
  );

  return getCarBuyRequestOfferById(offerId);
};

const createUserNotification = ({
  userId,
  type,
  title,
  message = '',
  entityType = '',
  entityId = null,
  status = '',
}) => {
  const normalizedUserId = Number(userId || 0);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    return null;
  }

  const result = insertUserNotificationStatement.run(
    normalizedUserId,
    String(type || '').trim(),
    String(title || '').trim().slice(0, 180),
    String(message || '').trim().slice(0, 700),
    String(entityType || '').trim().slice(0, 80),
    Number.isInteger(Number(entityId)) && Number(entityId) > 0 ? Number(entityId) : null,
    String(status || '').trim().slice(0, 40)
  );

  return sanitizeUserNotification({
    id: result.lastInsertRowid,
    user_id: normalizedUserId,
    type,
    title,
    message,
    entity_type: entityType,
    entity_id: entityId,
    status,
    created_at: new Date().toISOString(),
  });
};

const getCarSellRequestById = (requestId) =>
  sanitizeCarSellRequest(findCarSellRequestByIdStatement.get(requestId));

const listCarSellRequests = () =>
  listCarSellRequestsStatement.all().map(sanitizeCarSellRequest);

const listCarSellRequestsByUser = (userId) =>
  listCarSellRequestsByUserStatement.all(userId).map(sanitizeCarSellRequest);

const listUserNotificationsByUser = (userId) =>
  listUserNotificationsStatement.all(userId).map(sanitizeUserNotification);

const createCarSellRequest = (request) => {
  const normalizedRequest = normalizeCarSellRequestPayload(request);
  const normalizedUserId = Number(normalizedRequest.userId || 0);
  const { car } = normalizedRequest;

  db.exec('BEGIN IMMEDIATE');

  try {
    const result = insertCarSellRequestStatement.run(
      Number.isInteger(normalizedUserId) && normalizedUserId > 0 ? normalizedUserId : null,
      normalizedRequest.fullName,
      normalizedRequest.phone,
      normalizedRequest.email,
      car.brand,
      car.category,
      car.name,
      car.description,
      car.type,
      car.priceText,
      car.priceValue,
      car.image,
      JSON.stringify(car.images),
      car.year,
      car.fuel,
      car.mileageText,
      car.mileageValue,
      car.seats,
      car.gearbox,
      car.drivetrain,
      car.origin,
      car.condition,
      car.color,
      car.actionText
    );
    const createdRequest = getCarSellRequestById(result.lastInsertRowid);

    if (createdRequest?.userId) {
      createUserNotification({
        userId: createdRequest.userId,
        type: 'car-sell-request',
        title: 'Đã nhận thông tin xe cần bán',
        message: `OkXe đã nhận thông tin ${createdRequest.brand} ${createdRequest.name}. Nhân viên sẽ kiểm tra trước khi duyệt nhập kho.`,
        entityType: 'car_sell_request',
        entityId: createdRequest.id,
        status: 'pending',
      });
    }

    db.exec('COMMIT');
    return createdRequest;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const approveCarSellRequest = (requestId, { statusNote = '' } = {}) => {
  const existingRequest = getCarSellRequestById(requestId);

  if (!existingRequest) {
    return null;
  }

  if (existingRequest.status === 'approved' && existingRequest.approvedCarId) {
    return {
      request: existingRequest,
      car: sanitizeCar(findCarByIdStatement.get(existingRequest.approvedCarId)),
    };
  }

  db.exec('BEGIN IMMEDIATE');

  try {
    const createdCar = upsertCar({
      brand: existingRequest.brand,
      category: existingRequest.category,
      name: existingRequest.name,
      description: existingRequest.description,
      type: existingRequest.type,
      priceText: existingRequest.price,
      priceValue: existingRequest.priceValue,
      image: existingRequest.image,
      images: existingRequest.images,
      year: existingRequest.year,
      fuel: existingRequest.fuel,
      mileageText: existingRequest.mileage,
      mileageValue: existingRequest.mileageValue,
      seats: existingRequest.seats,
      gearbox: existingRequest.gearbox,
      drivetrain: existingRequest.drivetrain,
      origin: existingRequest.origin,
      condition: existingRequest.condition,
      color: existingRequest.color,
      actionText: 'Còn xe',
    });
    const finalNote = String(statusNote || '').trim()
      || `Tin đăng bán xe đã được duyệt và nhập vào kho xe OkXe với mã xe #${createdCar.id}.`;

    updateCarSellRequestApprovedStatement.run(finalNote, createdCar.id, requestId);

    if (existingRequest.userId) {
      createUserNotification({
        userId: existingRequest.userId,
        type: 'car-sell-request',
        title: 'Tin đăng bán xe đã được duyệt',
        message: finalNote,
        entityType: 'car_sell_request',
        entityId: requestId,
        status: 'approved',
      });
    }

    db.exec('COMMIT');
    return {
      request: getCarSellRequestById(requestId),
      car: createdCar,
    };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const rejectCarSellRequest = (requestId, { statusNote = '' } = {}) => {
  const existingRequest = getCarSellRequestById(requestId);

  if (!existingRequest) {
    return null;
  }

  const finalNote = String(statusNote || '').trim();

  db.exec('BEGIN IMMEDIATE');

  try {
    if (existingRequest.userId) {
      createUserNotification({
        userId: existingRequest.userId,
        type: 'car-sell-request',
        title: 'Tin đăng bán xe chưa được duyệt',
        message: `${finalNote || 'Thông tin xe chưa phù hợp để nhập kho.'} Bài đăng đã được xóa, vui lòng đăng lại khi đã bổ sung thông tin.`,
        entityType: 'car_sell_request',
        entityId: existingRequest.id,
        status: 'rejected',
      });
    }

    deleteCarSellRequestStatement.run(requestId);
    db.exec('COMMIT');
    return existingRequest;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const deleteCarBuyRequest = (requestId) => {
  const existingRequest = getCarBuyRequestById(requestId);

  if (!existingRequest) {
    return null;
  }

  deleteCarBuyRequestStatement.run(requestId);
  return existingRequest;
};

const createTestDriveAppointment = ({
  userId,
  carId,
  fullName,
  phone,
  preferredDate,
  preferredTimeSlot,
}) => {
  const selectedCar = getCarById(carId);

  if (!selectedCar || !isCarAvailableForTestDrive(selectedCar)) {
    return null;
  }

  const normalizedPreferredDate = String(preferredDate || '').trim();
  const normalizedPreferredTimeSlot = String(preferredTimeSlot || '').trim();
  const scheduleConflict = getActiveTestDriveScheduleConflict({
    carId: selectedCar.id,
    preferredDate: normalizedPreferredDate,
    preferredTimeSlot: normalizedPreferredTimeSlot,
  });
  const conflictStatusNote = scheduleConflict
    ? `Khung giờ ${normalizedPreferredTimeSlot} ngày ${normalizedPreferredDate} đã có khách hàng khác đăng ký. Vui lòng liên hệ với khách hàng để đổi khung giờ.`
    : '';

  const result = insertTestDriveAppointmentStatement.run(
    userId,
    selectedCar.id,
    selectedCar.name,
    selectedCar.brand,
    selectedCar.price,
    normalizeFullName(fullName),
    String(phone || '').trim(),
    normalizedPreferredDate,
    normalizedPreferredTimeSlot,
    conflictStatusNote
  );

  return getTestDriveAppointmentById(result.lastInsertRowid);
};

const createCar = (car) => upsertCar(car);

const updateCar = (carId, car) => {
  const existingCar = findCarByIdStatement.get(carId);

  if (!existingCar) {
    return null;
  }

  return upsertCar(car, carId);
};

const deleteCar = (carId) => {
  const existingCar = getCarById(carId);

  if (!existingCar) {
    return null;
  }

  deleteCarStatement.run(carId);
  return existingCar;
};

const createPromotion = (promotion) => {
  const normalizedPromotion = normalizePromotionPayload(promotion);
  const result = insertPromotionStatement.run(
    normalizedPromotion.title,
    normalizedPromotion.summary,
    normalizedPromotion.content,
    normalizedPromotion.badgeText,
    normalizedPromotion.imageUrl,
    normalizedPromotion.ctaText,
    normalizedPromotion.ctaUrl,
    normalizedPromotion.startsAt,
    normalizedPromotion.endsAt,
    normalizedPromotion.showOnHome,
    normalizedPromotion.displayOrder
  );

  return getPromotionById(result.lastInsertRowid);
};

const updatePromotion = (promotionId, promotion) => {
  const existingPromotion = getPromotionById(promotionId);

  if (!existingPromotion) {
    return null;
  }

  const normalizedPromotion = normalizePromotionPayload(promotion);

  updatePromotionStatement.run(
    normalizedPromotion.title,
    normalizedPromotion.summary,
    normalizedPromotion.content,
    normalizedPromotion.badgeText,
    normalizedPromotion.imageUrl,
    normalizedPromotion.ctaText,
    normalizedPromotion.ctaUrl,
    normalizedPromotion.startsAt,
    normalizedPromotion.endsAt,
    normalizedPromotion.showOnHome,
    normalizedPromotion.displayOrder,
    promotionId
  );

  return getPromotionById(promotionId);
};

const deletePromotion = (promotionId) => {
  const existingPromotion = getPromotionById(promotionId);

  if (!existingPromotion) {
    return null;
  }

  deletePromotionStatement.run(promotionId);
  return existingPromotion;
};

const createBlogPost = (blogPost, author = {}) => {
  const normalizedBlogPost = normalizeBlogPostPayload({
    ...blogPost,
    authorId: author.id || blogPost.authorId,
    authorName: author.fullName || author.email || blogPost.authorName || blogPost.author,
  });
  const result = insertBlogPostStatement.run(
    normalizedBlogPost.slug,
    normalizedBlogPost.category,
    normalizedBlogPost.title,
    normalizedBlogPost.excerpt,
    normalizedBlogPost.content,
    normalizedBlogPost.imageUrl,
    normalizedBlogPost.imageAlt,
    normalizedBlogPost.authorId,
    normalizedBlogPost.authorName,
    normalizedBlogPost.publishedAt,
    normalizedBlogPost.readTime,
    normalizedBlogPost.status,
    normalizedBlogPost.featured,
    normalizedBlogPost.showOnHome,
    normalizedBlogPost.displayOrder
  );

  return getBlogPostById(result.lastInsertRowid);
};

const updateBlogPost = (blogPostId, blogPost) => {
  const existingBlogPost = getBlogPostById(blogPostId);

  if (!existingBlogPost) {
    return null;
  }

  const normalizedBlogPost = normalizeBlogPostPayload({
    ...blogPost,
    authorId: existingBlogPost.authorId,
    authorName: existingBlogPost.authorName,
  });

  updateBlogPostStatement.run(
    normalizedBlogPost.slug,
    normalizedBlogPost.category,
    normalizedBlogPost.title,
    normalizedBlogPost.excerpt,
    normalizedBlogPost.content,
    normalizedBlogPost.imageUrl,
    normalizedBlogPost.imageAlt,
    normalizedBlogPost.publishedAt,
    normalizedBlogPost.readTime,
    normalizedBlogPost.status,
    normalizedBlogPost.featured,
    normalizedBlogPost.showOnHome,
    normalizedBlogPost.displayOrder,
    blogPostId
  );

  return getBlogPostById(blogPostId);
};

const deleteBlogPost = (blogPostId) => {
  const existingBlogPost = getBlogPostById(blogPostId);

  if (!existingBlogPost) {
    return null;
  }

  deleteBlogPostStatement.run(blogPostId);
  return existingBlogPost;
};

const serializeStaticBlogContent = (content) => {
  if (!Array.isArray(content)) {
    return String(content || '').trim();
  }

  return content
    .map((section) => {
      const blocks = [];
      const heading = String(section?.heading || '').trim();
      const paragraphs = Array.isArray(section?.paragraphs) ? section.paragraphs : [];
      const listItems = Array.isArray(section?.list) ? section.list : [];

      if (heading) {
        blocks.push(heading);
      }

      paragraphs
        .map((paragraph) => String(paragraph || '').trim())
        .filter(Boolean)
        .forEach((paragraph) => blocks.push(paragraph));

      listItems
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .forEach((item) => blocks.push(`- ${item}`));

      return blocks.join('\n\n');
    })
    .filter(Boolean)
    .join('\n\n');
};

const normalizeStaticBlogPostForDatabase = (blogPost, index = 0) => ({
  slug: blogPost.slug,
  category: blogPost.category,
  title: blogPost.title,
  excerpt: blogPost.excerpt,
  content: serializeStaticBlogContent(blogPost.content),
  imageUrl: blogPost.imageUrl || blogPost.image || '',
  imageAlt: blogPost.imageAlt || '',
  authorName: blogPost.authorName || blogPost.author || 'Ban biên tập OkXe',
  publishedAt: blogPost.publishedAt || '',
  readTime: Number(blogPost.readTime || 5),
  status: blogPost.status || 'published',
  featured: Boolean(blogPost.featured),
  showOnHome: blogPost.showOnHome ?? true,
  displayOrder: Number(blogPost.displayOrder ?? blogPost.id ?? index + 1),
});

const loadStaticBlogPostsForDatabase = () => {
  const staticBlogDataPath = path.join(__dirname, 'public', 'blog', 'data.js');

  if (!fs.existsSync(staticBlogDataPath)) {
    return [];
  }

  try {
    const sandbox = { window: {} };
    const source = fs.readFileSync(staticBlogDataPath, 'utf8');
    vm.runInNewContext(source, sandbox, {
      filename: 'public/blog/data.js',
      timeout: 1000,
    });

    return Array.isArray(sandbox.window.OKXE_BLOG_POSTS)
      ? sandbox.window.OKXE_BLOG_POSTS.map(normalizeStaticBlogPostForDatabase)
      : [];
  } catch (error) {
    console.warn(`Could not load static blog posts: ${error.message}`);
    return [];
  }
};

const getSeedBlogPosts = () => {
  const staticBlogPosts = loadStaticBlogPostsForDatabase();

  return staticBlogPosts.length
    ? staticBlogPosts
    : seedBlogPosts.map((blogPost, index) =>
      normalizeStaticBlogPostForDatabase(blogPost, index)
    );
};

const shouldRefreshSeededBlogPost = (existingBlogPost, seedBlogPost) =>
  existingBlogPost
  && existingBlogPost.title === seedBlogPost.title
  && existingBlogPost.excerpt === seedBlogPost.excerpt
  && String(existingBlogPost.content || '').trim().length < String(seedBlogPost.content || '').trim().length;

const seedBlogPostsIfMissing = () => {
  const existingPostsBySlug = new Map(
    listAdminBlogPosts().map((blogPost) => [blogPost.slug, blogPost])
  );

  getSeedBlogPosts().forEach((blogPost) => {
    const existingBlogPost = existingPostsBySlug.get(blogPost.slug);

    if (!existingBlogPost) {
      createBlogPost({
        ...blogPost,
        showOnHome: blogPost.showOnHome ?? true,
      }, {
        fullName: blogPost.authorName,
      });
      return;
    }

    if (shouldRefreshSeededBlogPost(existingBlogPost, blogPost)) {
      updateBlogPost(existingBlogPost.id, {
        ...blogPost,
        status: existingBlogPost.status,
        featured: existingBlogPost.featured,
        showOnHome: existingBlogPost.showOnHome,
        displayOrder: existingBlogPost.displayOrder || blogPost.displayOrder,
      });
    }
  });
};

seedCarsIfEmpty();
seedBlogPostsIfMissing();

module.exports = {
  addFavoriteCarForUser,
  authenticateUser,
  createBlogPost,
  createCar,
  createCarBuyRequest,
  createCarSellRequest,
  createCarBuyRequestOffer,
  createConsultationRequest,
  createPasswordResetOtp,
  createPromotion,
  createSession,
  createTestDriveAppointment,
  createUser,
  countAdminUsers,
  deleteCar,
  deleteBlogPost,
  deleteCarBuyRequest,
  deleteConsultationRequest,
  deletePromotion,
  deleteSession,
  deleteTestDriveAppointment,
  deleteUser,
  getCarById,
  getBlogPostById,
  getBlogPostStats,
  getCarBuyRequestById,
  getCarBuyRequestOfferById,
  getCarSellRequestById,
  getConsultationRequestById,
  getPromotionById,
  getPublicBlogPostBySlug,
  getTestDriveAppointmentById,
  getUserById,
  getUserBySession,
  employeeRoles,
  isFavoriteCarByUser,
  listHomepageBlogPosts,
  listHomepagePromotions,
  listAdminBlogPosts,
  listAvailableTestDriveCars,
  listAdminCars,
  listCarBuyRequestOffersByRequestId,
  listCarBuyRequests,
  listCarBuyRequestsByUser,
  listCarSellRequests,
  listCarSellRequestsByUser,
  listUserNotificationsByUser,
  listUsers,
  listHomepageTeamMembers,
  listPublicTeamMembers,
  listCars,
  listFavoriteCarsByUser,
  listPublicPromotions,
  listPublicBlogPosts,
  listPublicCarBuyRequests,
  listPromotions,
  listConsultationRequests,
  listTestDriveAppointments,
  listTestDriveAppointmentsByUser,
  removeFavoriteCarForUser,
  resetPasswordWithOtp,
  updateConsultationRequestStatus,
  updateBlogPost,
  updatePromotion,
  updateTestDriveAppointmentStatus,
  updateUserProfile,
  updateUserSelfProfile,
  updateUserRole,
  updateCar,
  approveCarSellRequest,
  rejectCarSellRequest,
  updateCarBuyRequestStatus,
  updateCarBuyRequestOfferStatus,
};
