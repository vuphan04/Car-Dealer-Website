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
const depositOrderStatuses = new Set([
  'pending',
  'confirmed',
  'completed',
  'cancelled_after_deposit',
  'cancelled',
  'expired',
]);
const depositOrderStatusTransitions = new Map([
  ['pending', new Set(['confirmed', 'cancelled', 'expired'])],
  ['confirmed', new Set(['completed', 'cancelled_after_deposit'])],
  ['completed', new Set()],
  ['cancelled_after_deposit', new Set()],
  ['cancelled', new Set()],
  ['expired', new Set()],
]);
const depositPaymentMethods = new Set(['bank', 'vnpay', 'wallet', 'card']);
const salesKpiTypes = new Set(['acquisition', 'sale', 'direct_sale']);
const salesKpiRewardStatuses = new Set(['pending', 'approved', 'paid']);
const salesKpiRoles = new Set(['sales_only', 'acquisition_only', 'both']);
const carAvailableStatusText = 'Còn xe';
const carHeldStatusText = 'Đang giữ chỗ';
const carSoldStatusText = 'Xe đã bán';
const depositOrderDefaultHoldHours = Math.max(
  1,
  Math.min(168, Number(process.env.OKXE_DEPOSIT_HOLD_HOURS || 24) || 24)
);
const depositOrderReminderHoursBeforeExpiry = Math.max(
  1,
  Math.min(24, Number(process.env.OKXE_DEPOSIT_REMINDER_HOURS || 3) || 3)
);
const depositPaymentDefaultAmountOptions = [5000000, 10000000, 20000000];
const depositPaymentDefaultPolicyText = [
  'Khách chuyển khoản đúng số tiền và nội dung trong đơn đặt cọc để OkXe đối soát.',
  'Xe được giữ trong thời gian cấu hình kể từ khi tạo đơn; nếu quá hạn chưa xác nhận nhận tiền, đơn có thể bị hủy và xe được mở bán lại.',
  'Sau khi OkXe xác nhận đã nhận tiền, khách có thể xem hoặc in biên nhận đặt cọc trong tài khoản.',
  'Khi giao dịch mua xe hoàn tất, số tiền đặt cọc được khấu trừ vào giá trị thanh toán còn lại.',
  'Trường hợp hủy sau đặt cọc hoặc hoàn cọc sẽ được nhân viên OkXe ghi nhận lý do, số tiền hoàn và mã giao dịch hoàn tiền trong lịch sử đơn.',
].join('\n');
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

const normalizeDepositOrderStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  return depositOrderStatuses.has(normalizedStatus)
    ? normalizedStatus
    : 'pending';
};

const isAllowedDepositOrderStatusTransition = (currentStatus, nextStatus) => {
  const normalizedCurrentStatus = normalizeDepositOrderStatus(currentStatus);
  const normalizedNextStatus = normalizeDepositOrderStatus(nextStatus);

  if (normalizedCurrentStatus === normalizedNextStatus) {
    return true;
  }

  return Boolean(depositOrderStatusTransitions.get(normalizedCurrentStatus)?.has(normalizedNextStatus));
};

const normalizeDepositPaymentMethod = (paymentMethod) => {
  const normalizedPaymentMethod = String(paymentMethod || '').trim().toLowerCase();

  return depositPaymentMethods.has(normalizedPaymentMethod)
    ? normalizedPaymentMethod
    : 'bank';
};

const normalizeDepositSettingText = (value, maxLength = 120, fallback = '') =>
  String(value ?? fallback)
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);

const normalizeDepositPolicyText = (value, fallback = '') =>
  String(value ?? fallback)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join('\n')
    .slice(0, 4000);

const normalizeDepositAmountValue = (value, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? Math.trunc(numberValue)
    : fallback;
};

const normalizeDepositHoldHoursValue = (value, fallback = depositOrderDefaultHoldHours) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? Math.max(1, Math.min(168, Math.trunc(numberValue)))
    : fallback;
};

const parseDepositAmountOptionsValue = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  const textValue = String(value || '').trim();

  if (!textValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(textValue);

    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }
  } catch (error) {
    // Fall back to comma/newline parsing for values entered from admin forms.
  }

  return textValue.split(/[\s,;]+/);
};

const normalizeDepositAmountOptionsValue = (value, fallback = depositPaymentDefaultAmountOptions, limits = {}) => {
  const minAmount = normalizeDepositAmountValue(limits.minAmount, 0);
  const maxAmount = normalizeDepositAmountValue(limits.maxAmount, Number.MAX_SAFE_INTEGER);
  const seenAmounts = new Set();
  const normalizedOptions = parseDepositAmountOptionsValue(value)
    .map((amount) => normalizeDepositAmountValue(amount, 0))
    .filter((amount) => amount > 0)
    .filter((amount) => amount >= minAmount && amount <= maxAmount)
    .filter((amount) => {
      if (seenAmounts.has(amount)) {
        return false;
      }

      seenAmounts.add(amount);
      return true;
    })
    .slice(0, 8);

  return normalizedOptions.length ? normalizedOptions : [...fallback];
};

const normalizeDepositRequireProofValue = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (Number(value) === 1) {
    return true;
  }

  if (Number(value) === 0) {
    return false;
  }

  const normalizedValue = String(value || '').trim().toLowerCase();

  if (['true', 'yes', 'required', 'bat buoc', 'bắt buộc'].includes(normalizedValue)) {
    return true;
  }

  if (['false', 'no', 'optional', 'khong', 'không'].includes(normalizedValue)) {
    return false;
  }

  return fallback;
};

const depositPaymentSettingsDefaults = (() => {
  const minDepositAmount = normalizeDepositAmountValue(process.env.OKXE_DEPOSIT_MIN_AMOUNT, 1000000);
  const maxDepositAmount = Math.max(
    minDepositAmount,
    normalizeDepositAmountValue(process.env.OKXE_DEPOSIT_MAX_AMOUNT, 200000000)
  );
  const depositAmountOptions = normalizeDepositAmountOptionsValue(
    process.env.OKXE_DEPOSIT_AMOUNT_OPTIONS,
    depositPaymentDefaultAmountOptions,
    { minAmount: minDepositAmount, maxAmount: maxDepositAmount }
  );
  const configuredDefaultAmount = normalizeDepositAmountValue(
    process.env.OKXE_DEPOSIT_DEFAULT_AMOUNT,
    10000000
  );
  const defaultDepositAmount =
    configuredDefaultAmount >= minDepositAmount && configuredDefaultAmount <= maxDepositAmount
      ? configuredDefaultAmount
      : depositAmountOptions[0] || minDepositAmount;

  return {
    accountName: normalizeDepositSettingText(process.env.OKXE_DEPOSIT_BANK_ACCOUNT_NAME, 100, 'OKXE AUTO') || 'OKXE AUTO',
    bankName: normalizeDepositSettingText(process.env.OKXE_DEPOSIT_BANK_NAME, 100, 'Vietcombank') || 'Vietcombank',
    accountNumber: normalizeDepositSettingText(process.env.OKXE_DEPOSIT_BANK_ACCOUNT_NUMBER, 60, '0123 456 789') || '0123 456 789',
    branch: normalizeDepositSettingText(process.env.OKXE_DEPOSIT_BANK_BRANCH, 100),
    transferPrefix: normalizeDepositSettingText(process.env.OKXE_DEPOSIT_TRANSFER_PREFIX, 60, 'OKXE COC') || 'OKXE COC',
    depositAmountOptions,
    defaultDepositAmount,
    minDepositAmount,
    maxDepositAmount,
    holdHours: normalizeDepositHoldHoursValue(process.env.OKXE_DEPOSIT_HOLD_HOURS, depositOrderDefaultHoldHours),
    requireTransferProof: normalizeDepositRequireProofValue(process.env.OKXE_DEPOSIT_REQUIRE_TRANSFER_PROOF, false),
    policyText: normalizeDepositPolicyText(process.env.OKXE_DEPOSIT_POLICY_TEXT, depositPaymentDefaultPolicyText)
      || depositPaymentDefaultPolicyText,
  };
})();

const normalizeDepositPaymentSettingsData = (settings = {}) => {
  const minDepositAmount = normalizeDepositAmountValue(
    settings.minDepositAmount ?? settings.min_deposit_amount,
    depositPaymentSettingsDefaults.minDepositAmount
  );
  const maxDepositAmount = Math.max(
    minDepositAmount,
    normalizeDepositAmountValue(
      settings.maxDepositAmount ?? settings.max_deposit_amount,
      depositPaymentSettingsDefaults.maxDepositAmount
    )
  );
  const depositAmountOptions = normalizeDepositAmountOptionsValue(
    settings.depositAmountOptions ?? settings.deposit_amount_options_json,
    depositPaymentSettingsDefaults.depositAmountOptions,
    { minAmount: minDepositAmount, maxAmount: maxDepositAmount }
  );
  const requestedDefaultAmount = normalizeDepositAmountValue(
    settings.defaultDepositAmount ?? settings.default_deposit_amount,
    depositPaymentSettingsDefaults.defaultDepositAmount
  );
  const defaultDepositAmount =
    requestedDefaultAmount >= minDepositAmount && requestedDefaultAmount <= maxDepositAmount
      ? requestedDefaultAmount
      : depositAmountOptions[0] || minDepositAmount;

  return {
    id: 1,
    accountName: normalizeDepositSettingText(
      settings.accountName ?? settings.account_name,
      100,
      depositPaymentSettingsDefaults.accountName
    ) || depositPaymentSettingsDefaults.accountName,
    bankName: normalizeDepositSettingText(
      settings.bankName ?? settings.bank_name,
      100,
      depositPaymentSettingsDefaults.bankName
    ) || depositPaymentSettingsDefaults.bankName,
    accountNumber: normalizeDepositSettingText(
      settings.accountNumber ?? settings.account_number,
      60,
      depositPaymentSettingsDefaults.accountNumber
    ) || depositPaymentSettingsDefaults.accountNumber,
    branch: normalizeDepositSettingText(
      settings.branch,
      100,
      depositPaymentSettingsDefaults.branch
    ),
    transferPrefix: normalizeDepositSettingText(
      settings.transferPrefix ?? settings.transfer_prefix,
      60,
      depositPaymentSettingsDefaults.transferPrefix
    ) || depositPaymentSettingsDefaults.transferPrefix,
    depositAmountOptions,
    defaultDepositAmount,
    minDepositAmount,
    maxDepositAmount,
    holdHours: normalizeDepositHoldHoursValue(
      settings.holdHours ?? settings.hold_hours,
      depositPaymentSettingsDefaults.holdHours
    ),
    requireTransferProof: normalizeDepositRequireProofValue(
      settings.requireTransferProof ?? settings.require_transfer_proof,
      depositPaymentSettingsDefaults.requireTransferProof
    ),
    policyText: normalizeDepositPolicyText(
      settings.policyText ?? settings.policy_text,
      depositPaymentSettingsDefaults.policyText
    ) || depositPaymentSettingsDefaults.policyText,
    updatedByUserId: Number(settings.updatedByUserId ?? settings.updated_by_user_id) || null,
    updatedByName: normalizeDepositSettingText(settings.updatedByName ?? settings.updated_by_name, 160),
    createdAt: settings.createdAt || settings.created_at || '',
    updatedAt: settings.updatedAt || settings.updated_at || '',
  };
};

const getDepositOrderExpiresAt = (baseDate = new Date(), holdHours = depositOrderDefaultHoldHours) => {
  const createdAt = baseDate instanceof Date ? baseDate : new Date(baseDate);
  const timestamp = Number.isNaN(createdAt.getTime()) ? Date.now() : createdAt.getTime();
  const normalizedHoldHours = normalizeDepositHoldHoursValue(holdHours, depositOrderDefaultHoldHours);

  return new Date(timestamp + normalizedHoldHours * 60 * 60 * 1000).toISOString();
};

const isDepositOrderOverdue = (order = {}, now = new Date()) => {
  const status = normalizeDepositOrderStatus(order.status);
  const expiresAt = String(order.expires_at || order.expiresAt || '').trim();

  if (status !== 'pending' || !expiresAt) {
    return false;
  }

  const expiresDate = new Date(expiresAt.replace(' ', 'T'));
  const nowDate = now instanceof Date ? now : new Date(now);

  return !Number.isNaN(expiresDate.getTime())
    && !Number.isNaN(nowDate.getTime())
    && expiresDate.getTime() <= nowDate.getTime();
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

  CREATE TABLE IF NOT EXISTS deposit_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    car_id INTEGER,
    car_name TEXT NOT NULL DEFAULT '',
    car_brand TEXT NOT NULL DEFAULT '',
    car_price_text TEXT NOT NULL DEFAULT '',
    car_price_value INTEGER NOT NULL DEFAULT 0,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    province TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    deposit_amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'bank',
    bank_transfer_note TEXT NOT NULL DEFAULT '',
    vnpay_txn_ref TEXT NOT NULL DEFAULT '',
    vnpay_transaction_no TEXT NOT NULL DEFAULT '',
    vnpay_response_code TEXT NOT NULL DEFAULT '',
    vnpay_transaction_status TEXT NOT NULL DEFAULT '',
    vnpay_bank_code TEXT NOT NULL DEFAULT '',
    vnpay_card_type TEXT NOT NULL DEFAULT '',
    vnpay_pay_date TEXT NOT NULL DEFAULT '',
    vnpay_payment_url TEXT NOT NULL DEFAULT '',
    vnpay_confirmed_at TEXT NOT NULL DEFAULT '',
    transfer_proof_url TEXT NOT NULL DEFAULT '',
    transfer_proof_file_name TEXT NOT NULL DEFAULT '',
    transfer_proof_uploaded_at TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    status_note TEXT NOT NULL DEFAULT '',
    payment_reference TEXT NOT NULL DEFAULT '',
    payment_received_at TEXT NOT NULL DEFAULT '',
    payment_confirmation_note TEXT NOT NULL DEFAULT '',
    payment_confirmed_by_user_id INTEGER,
    payment_confirmed_by_name TEXT NOT NULL DEFAULT '',
    payment_confirmed_at TEXT NOT NULL DEFAULT '',
    refund_amount INTEGER NOT NULL DEFAULT 0,
    refund_reference TEXT NOT NULL DEFAULT '',
    refund_completed_at TEXT NOT NULL DEFAULT '',
    refund_note TEXT NOT NULL DEFAULT '',
    refund_confirmed_by_user_id INTEGER,
    refund_confirmed_by_name TEXT NOT NULL DEFAULT '',
    refund_confirmed_at TEXT NOT NULL DEFAULT '',
    expires_at TEXT NOT NULL DEFAULT '',
    expired_at TEXT NOT NULL DEFAULT '',
    payment_reminder_sent_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
  );

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
    customer_deal_price_text TEXT NOT NULL DEFAULT '',
    customer_deal_price_value INTEGER NOT NULL DEFAULT 0,
    final_price_text TEXT NOT NULL DEFAULT '',
    final_price_value INTEGER NOT NULL DEFAULT 0,
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
    business_date TEXT NOT NULL DEFAULT '',
    policy_period TEXT NOT NULL DEFAULT '',
    creation_mode TEXT NOT NULL DEFAULT 'manual',
    reward_approved_at TEXT NOT NULL DEFAULT '',
    reward_approved_by_user_id INTEGER,
    reward_approved_by_name TEXT NOT NULL DEFAULT '',
    reward_paid_at TEXT NOT NULL DEFAULT '',
    reward_paid_by_user_id INTEGER,
    reward_paid_by_name TEXT NOT NULL DEFAULT '',
    payout_reference TEXT NOT NULL DEFAULT '',
    UNIQUE (kpi_type, source_id),
    FOREIGN KEY (sale_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sales_kpi_records_sale
  ON sales_kpi_records (sale_user_id, record_status, recorded_at);

  CREATE INDEX IF NOT EXISTS idx_sales_kpi_records_status
  ON sales_kpi_records (record_status, kpi_type, recorded_at);

  CREATE TABLE IF NOT EXISTS sales_kpi_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    sale_user_id INTEGER NOT NULL,
    vehicle_target INTEGER NOT NULL DEFAULT 0,
    revenue_target INTEGER NOT NULL DEFAULT 0,
    gross_profit_target INTEGER NOT NULL DEFAULT 0,
    kpi_role TEXT NOT NULL DEFAULT 'both',
    commission_per_sale INTEGER NOT NULL DEFAULT 0,
    acquisition_reward_per_vehicle INTEGER NOT NULL DEFAULT 0,
    updated_by_user_id INTEGER,
    updated_by_name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (period, sale_user_id),
    FOREIGN KEY (sale_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sales_kpi_targets_period
  ON sales_kpi_targets (period, sale_user_id);

  CREATE TABLE IF NOT EXISTS sales_kpi_periods (
    period TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'open',
    locked_at TEXT NOT NULL DEFAULT '',
    locked_by_user_id INTEGER,
    locked_by_name TEXT NOT NULL DEFAULT '',
    lock_note TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locked_by_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS sales_kpi_policy_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    sale_user_id INTEGER NOT NULL,
    kpi_role TEXT NOT NULL,
    vehicle_target INTEGER NOT NULL DEFAULT 0,
    gross_profit_target INTEGER NOT NULL DEFAULT 0,
    commission_per_sale INTEGER NOT NULL DEFAULT 0,
    acquisition_reward_per_vehicle INTEGER NOT NULL DEFAULT 0,
    action_type TEXT NOT NULL DEFAULT 'updated',
    change_note TEXT NOT NULL DEFAULT '',
    changed_by_user_id INTEGER,
    changed_by_name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sales_kpi_policy_history_period
  ON sales_kpi_policy_history (period, created_at, id);

  CREATE TABLE IF NOT EXISTS sales_kpi_reward_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_kpi_record_id INTEGER NOT NULL,
    previous_status TEXT NOT NULL DEFAULT '',
    next_status TEXT NOT NULL,
    payout_reference TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    actor_user_id INTEGER,
    actor_name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_kpi_record_id) REFERENCES sales_kpi_records(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

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

  CREATE INDEX IF NOT EXISTS idx_direct_car_sales_sold_at
  ON direct_car_sales (sold_at);

  CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    entity_type TEXT NOT NULL DEFAULT '',
    entity_id INTEGER,
    status TEXT NOT NULL DEFAULT '',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Hỗ trợ khách hàng',
    context_type TEXT NOT NULL DEFAULT 'general',
    context_id INTEGER,
    assigned_user_id INTEGER,
    status TEXT NOT NULL DEFAULT 'open',
    last_message_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    customer_last_read_at TEXT,
    staff_last_read_at TEXT,
    customer_last_read_message_id INTEGER NOT NULL DEFAULT 0,
    staff_last_read_message_id INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS conversation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_user_id INTEGER NOT NULL,
    sender_role TEXT NOT NULL DEFAULT 'customer',
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_user
  ON conversations (user_id, last_message_at);

  CREATE INDEX IF NOT EXISTS idx_conversations_status
  ON conversations (status, last_message_at);

  CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation
  ON conversation_messages (conversation_id, created_at, id);

  CREATE TABLE IF NOT EXISTS admin_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    entity_type TEXT NOT NULL DEFAULT '',
    entity_id INTEGER,
    status TEXT NOT NULL DEFAULT '',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
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

  CREATE INDEX IF NOT EXISTS idx_deposit_orders_status
  ON deposit_orders (status, created_at);

  CREATE INDEX IF NOT EXISTS idx_deposit_orders_user_id
  ON deposit_orders (user_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_deposit_orders_car_id
  ON deposit_orders (car_id, created_at);

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

  CREATE INDEX IF NOT EXISTS idx_admin_notifications_visible
  ON admin_notifications (deleted_at, created_at);

`);

  const conversationColumns = database.prepare('PRAGMA table_info(conversations)').all();
  const conversationColumnNames = new Set(conversationColumns.map((column) => column.name));
  if (!conversationColumnNames.has('customer_last_read_message_id')) {
    database.exec('ALTER TABLE conversations ADD COLUMN customer_last_read_message_id INTEGER NOT NULL DEFAULT 0');
  }
  if (!conversationColumnNames.has('staff_last_read_message_id')) {
    database.exec('ALTER TABLE conversations ADD COLUMN staff_last_read_message_id INTEGER NOT NULL DEFAULT 0');
  }

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
    ['action_text', carAvailableStatusText, ['mua ngay', 'Mua ngay', 'Mua Ngay', 'còn hàng', 'Còn hàng', 'Còn Hàng']],
    ['action_text', carHeldStatusText, ['đang giữ', 'Đang giữ', 'dang giu', 'đang giữ chỗ', 'Dang giu cho', 'dang giu cho', 'giữ chỗ', 'giu cho']],
    ['action_text', carSoldStatusText, ['hết hàng', 'Hết hàng', 'Hết Hàng', 'het hang', 'het xe', 'Hết xe', 'hết xe', 'xe da ban']],
  ].forEach(([columnName, canonicalValue, legacyValues]) => {
    normalizeCarOptionValue(columnName, canonicalValue, legacyValues);
  });

  database.exec(`
    UPDATE cars
    SET action_text = '${carHeldStatusText}',
        updated_at = CURRENT_TIMESTAMP
    WHERE action_text = '${carAvailableStatusText}'
      AND id IN (
        SELECT car_id
        FROM deposit_orders
        WHERE status IN ('pending', 'confirmed')
      )
  `);

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

  const carSellRequestColumns = database.prepare('PRAGMA table_info(car_sell_requests)').all();
  const carSellRequestColumnNames = new Set(carSellRequestColumns.map((column) => column.name));
  const carSellRequestFinalPriceColumns = [
    ['customer_deal_price_text', "ALTER TABLE car_sell_requests ADD COLUMN customer_deal_price_text TEXT NOT NULL DEFAULT ''"],
    ['customer_deal_price_value', 'ALTER TABLE car_sell_requests ADD COLUMN customer_deal_price_value INTEGER NOT NULL DEFAULT 0'],
    ['final_price_text', "ALTER TABLE car_sell_requests ADD COLUMN final_price_text TEXT NOT NULL DEFAULT ''"],
    ['final_price_value', 'ALTER TABLE car_sell_requests ADD COLUMN final_price_value INTEGER NOT NULL DEFAULT 0'],
  ];

  carSellRequestFinalPriceColumns.forEach(([columnName, alterStatement]) => {
    if (!carSellRequestColumnNames.has(columnName)) {
      database.exec(alterStatement);
    }
  });

  const depositOrderColumns = database.prepare('PRAGMA table_info(deposit_orders)').all();
  const depositOrderColumnNames = new Set(depositOrderColumns.map((column) => column.name));
  const depositOrderConfirmationColumns = [
    ['payment_reference', "ALTER TABLE deposit_orders ADD COLUMN payment_reference TEXT NOT NULL DEFAULT ''"],
    ['payment_received_at', "ALTER TABLE deposit_orders ADD COLUMN payment_received_at TEXT NOT NULL DEFAULT ''"],
    ['payment_confirmation_note', "ALTER TABLE deposit_orders ADD COLUMN payment_confirmation_note TEXT NOT NULL DEFAULT ''"],
    ['payment_confirmed_by_user_id', 'ALTER TABLE deposit_orders ADD COLUMN payment_confirmed_by_user_id INTEGER'],
    ['payment_confirmed_by_name', "ALTER TABLE deposit_orders ADD COLUMN payment_confirmed_by_name TEXT NOT NULL DEFAULT ''"],
    ['payment_confirmed_at', "ALTER TABLE deposit_orders ADD COLUMN payment_confirmed_at TEXT NOT NULL DEFAULT ''"],
    ['expires_at', "ALTER TABLE deposit_orders ADD COLUMN expires_at TEXT NOT NULL DEFAULT ''"],
    ['expired_at', "ALTER TABLE deposit_orders ADD COLUMN expired_at TEXT NOT NULL DEFAULT ''"],
    ['transfer_proof_url', "ALTER TABLE deposit_orders ADD COLUMN transfer_proof_url TEXT NOT NULL DEFAULT ''"],
    ['transfer_proof_file_name', "ALTER TABLE deposit_orders ADD COLUMN transfer_proof_file_name TEXT NOT NULL DEFAULT ''"],
    ['transfer_proof_uploaded_at', "ALTER TABLE deposit_orders ADD COLUMN transfer_proof_uploaded_at TEXT NOT NULL DEFAULT ''"],
    ['vnpay_txn_ref', "ALTER TABLE deposit_orders ADD COLUMN vnpay_txn_ref TEXT NOT NULL DEFAULT ''"],
    ['vnpay_transaction_no', "ALTER TABLE deposit_orders ADD COLUMN vnpay_transaction_no TEXT NOT NULL DEFAULT ''"],
    ['vnpay_response_code', "ALTER TABLE deposit_orders ADD COLUMN vnpay_response_code TEXT NOT NULL DEFAULT ''"],
    ['vnpay_transaction_status', "ALTER TABLE deposit_orders ADD COLUMN vnpay_transaction_status TEXT NOT NULL DEFAULT ''"],
    ['vnpay_bank_code', "ALTER TABLE deposit_orders ADD COLUMN vnpay_bank_code TEXT NOT NULL DEFAULT ''"],
    ['vnpay_card_type', "ALTER TABLE deposit_orders ADD COLUMN vnpay_card_type TEXT NOT NULL DEFAULT ''"],
    ['vnpay_pay_date', "ALTER TABLE deposit_orders ADD COLUMN vnpay_pay_date TEXT NOT NULL DEFAULT ''"],
    ['vnpay_payment_url', "ALTER TABLE deposit_orders ADD COLUMN vnpay_payment_url TEXT NOT NULL DEFAULT ''"],
    ['vnpay_confirmed_at', "ALTER TABLE deposit_orders ADD COLUMN vnpay_confirmed_at TEXT NOT NULL DEFAULT ''"],
    ['refund_amount', 'ALTER TABLE deposit_orders ADD COLUMN refund_amount INTEGER NOT NULL DEFAULT 0'],
    ['refund_reference', "ALTER TABLE deposit_orders ADD COLUMN refund_reference TEXT NOT NULL DEFAULT ''"],
    ['refund_completed_at', "ALTER TABLE deposit_orders ADD COLUMN refund_completed_at TEXT NOT NULL DEFAULT ''"],
    ['refund_note', "ALTER TABLE deposit_orders ADD COLUMN refund_note TEXT NOT NULL DEFAULT ''"],
    ['refund_confirmed_by_user_id', 'ALTER TABLE deposit_orders ADD COLUMN refund_confirmed_by_user_id INTEGER'],
    ['refund_confirmed_by_name', "ALTER TABLE deposit_orders ADD COLUMN refund_confirmed_by_name TEXT NOT NULL DEFAULT ''"],
    ['refund_confirmed_at', "ALTER TABLE deposit_orders ADD COLUMN refund_confirmed_at TEXT NOT NULL DEFAULT ''"],
    ['payment_reminder_sent_at', "ALTER TABLE deposit_orders ADD COLUMN payment_reminder_sent_at TEXT NOT NULL DEFAULT ''"],
  ];

  depositOrderConfirmationColumns.forEach(([columnName, alterStatement]) => {
    if (!depositOrderColumnNames.has(columnName)) {
      database.exec(alterStatement);
    }
  });

  database.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_deposit_orders_expiry
    ON deposit_orders (status, expires_at);

    CREATE INDEX IF NOT EXISTS idx_deposit_order_status_history_order_id
    ON deposit_order_status_history (deposit_order_id, created_at);

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
  `);

  const depositPaymentSettingsColumns = database.prepare('PRAGMA table_info(deposit_payment_settings)').all();
  const depositPaymentSettingsColumnNames = new Set(depositPaymentSettingsColumns.map((column) => column.name));

  if (!depositPaymentSettingsColumnNames.has('policy_text')) {
    database.exec("ALTER TABLE deposit_payment_settings ADD COLUMN policy_text TEXT NOT NULL DEFAULT ''");
  }

  database.prepare(`
    UPDATE deposit_payment_settings
    SET policy_text = ?
    WHERE policy_text IS NULL
       OR trim(policy_text) = ''
  `).run(depositPaymentSettingsDefaults.policyText);

  database.prepare(`
    INSERT OR IGNORE INTO deposit_payment_settings (
      id, account_name, bank_name, account_number, branch, transfer_prefix,
      deposit_amount_options_json, default_deposit_amount, min_deposit_amount,
      max_deposit_amount, hold_hours, require_transfer_proof, policy_text
    )
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    depositPaymentSettingsDefaults.accountName,
    depositPaymentSettingsDefaults.bankName,
    depositPaymentSettingsDefaults.accountNumber,
    depositPaymentSettingsDefaults.branch,
    depositPaymentSettingsDefaults.transferPrefix,
    JSON.stringify(depositPaymentSettingsDefaults.depositAmountOptions),
    depositPaymentSettingsDefaults.defaultDepositAmount,
    depositPaymentSettingsDefaults.minDepositAmount,
    depositPaymentSettingsDefaults.maxDepositAmount,
    depositPaymentSettingsDefaults.holdHours,
    depositPaymentSettingsDefaults.requireTransferProof ? 1 : 0,
    depositPaymentSettingsDefaults.policyText
  );

  database.prepare(`
    UPDATE deposit_orders
    SET expires_at = datetime(COALESCE(NULLIF(created_at, ''), 'now'), ?)
    WHERE status = 'pending'
      AND (expires_at IS NULL OR expires_at = '')
  `).run(`+${depositOrderDefaultHoldHours} hours`);

  database.exec(`
    INSERT INTO deposit_order_status_history (
      deposit_order_id, previous_status, next_status, note, action_type, created_at
    )
    SELECT deposit_orders.id,
           '',
           deposit_orders.status,
           'Ghi nhận trạng thái hiện có khi nâng cấp lịch sử xử lý.',
           'migration',
           COALESCE(NULLIF(deposit_orders.created_at, ''), CURRENT_TIMESTAMP)
    FROM deposit_orders
    WHERE NOT EXISTS (
      SELECT 1
      FROM deposit_order_status_history
      WHERE deposit_order_status_history.deposit_order_id = deposit_orders.id
    )
  `);

  const notificationColumns = database.prepare('PRAGMA table_info(user_notifications)').all();
  const notificationColumnNames = new Set(notificationColumns.map((column) => column.name));

  if (!notificationColumnNames.has('is_read')) {
    database.exec('ALTER TABLE user_notifications ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0');
  }

  if (!notificationColumnNames.has('updated_at')) {
    database.exec('ALTER TABLE user_notifications ADD COLUMN updated_at TEXT');
    database.exec(`
      UPDATE user_notifications
      SET updated_at = COALESCE(NULLIF(updated_at, ''), created_at, CURRENT_TIMESTAMP)
      WHERE updated_at IS NULL
         OR updated_at = ''
    `);
  }

  if (!notificationColumnNames.has('deleted_at')) {
    database.exec('ALTER TABLE user_notifications ADD COLUMN deleted_at TEXT');
  }

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_notifications_visible
    ON user_notifications (user_id, deleted_at, created_at);
  `);

  const adminNotificationColumns = database.prepare('PRAGMA table_info(admin_notifications)').all();
  const adminNotificationColumnNames = new Set(adminNotificationColumns.map((column) => column.name));

  if (!adminNotificationColumnNames.has('is_read')) {
    database.exec('ALTER TABLE admin_notifications ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0');
  }

  if (!adminNotificationColumnNames.has('updated_at')) {
    database.exec('ALTER TABLE admin_notifications ADD COLUMN updated_at TEXT');
    database.exec(`
      UPDATE admin_notifications
      SET updated_at = COALESCE(NULLIF(updated_at, ''), created_at, CURRENT_TIMESTAMP)
      WHERE updated_at IS NULL
         OR updated_at = ''
    `);
  }

  if (!adminNotificationColumnNames.has('deleted_at')) {
    database.exec('ALTER TABLE admin_notifications ADD COLUMN deleted_at TEXT');
  }

  const salesKpiTargetColumns = database.prepare('PRAGMA table_info(sales_kpi_targets)').all();
  const salesKpiTargetColumnNames = new Set(salesKpiTargetColumns.map((column) => column.name));
  if (!salesKpiTargetColumnNames.has('kpi_role')) {
    database.exec("ALTER TABLE sales_kpi_targets ADD COLUMN kpi_role TEXT NOT NULL DEFAULT 'both'");
  }
  if (!salesKpiTargetColumnNames.has('commission_per_sale')) {
    database.exec('ALTER TABLE sales_kpi_targets ADD COLUMN commission_per_sale INTEGER NOT NULL DEFAULT 0');
  }
  if (!salesKpiTargetColumnNames.has('acquisition_reward_per_vehicle')) {
    database.exec('ALTER TABLE sales_kpi_targets ADD COLUMN acquisition_reward_per_vehicle INTEGER NOT NULL DEFAULT 0');
  }
  database.exec(`
    UPDATE sales_kpi_targets
    SET kpi_role = 'both'
    WHERE kpi_role IS NULL OR kpi_role NOT IN ('sales_only', 'acquisition_only', 'both')
  `);

  const salesKpiRecordColumns = database.prepare('PRAGMA table_info(sales_kpi_records)').all();
  const salesKpiRecordColumnNames = new Set(salesKpiRecordColumns.map((column) => column.name));
  const addSalesKpiRecordColumn = (name, definition) => {
    if (!salesKpiRecordColumnNames.has(name)) {
      database.exec(`ALTER TABLE sales_kpi_records ADD COLUMN ${name} ${definition}`);
    }
  };
  addSalesKpiRecordColumn('business_date', "TEXT NOT NULL DEFAULT ''");
  addSalesKpiRecordColumn('policy_period', "TEXT NOT NULL DEFAULT ''");
  addSalesKpiRecordColumn('creation_mode', "TEXT NOT NULL DEFAULT 'manual'");
  addSalesKpiRecordColumn('reward_approved_at', "TEXT NOT NULL DEFAULT ''");
  addSalesKpiRecordColumn('reward_approved_by_user_id', 'INTEGER');
  addSalesKpiRecordColumn('reward_approved_by_name', "TEXT NOT NULL DEFAULT ''");
  addSalesKpiRecordColumn('reward_paid_at', "TEXT NOT NULL DEFAULT ''");
  addSalesKpiRecordColumn('reward_paid_by_user_id', 'INTEGER');
  addSalesKpiRecordColumn('reward_paid_by_name', "TEXT NOT NULL DEFAULT ''");
  addSalesKpiRecordColumn('payout_reference', "TEXT NOT NULL DEFAULT ''");
  database.exec(`
    UPDATE sales_kpi_records
    SET business_date = COALESCE(NULLIF(business_date, ''), substr(recorded_at, 1, 10)),
        policy_period = COALESCE(NULLIF(policy_period, ''), substr(recorded_at, 1, 7)),
        creation_mode = COALESCE(NULLIF(creation_mode, ''), 'manual')
    WHERE business_date = '' OR policy_period = '' OR creation_mode = ''
  `);
  database.exec(`
    INSERT INTO sales_kpi_policy_history (
      period, sale_user_id, kpi_role, vehicle_target, gross_profit_target,
      commission_per_sale, acquisition_reward_per_vehicle, action_type,
      change_note, changed_by_user_id, changed_by_name, created_at
    )
    SELECT targets.period, targets.sale_user_id, targets.kpi_role,
           targets.vehicle_target, targets.gross_profit_target,
           targets.commission_per_sale, targets.acquisition_reward_per_vehicle,
           'baseline', 'Dữ liệu chính sách trước khi bật lịch sử phiên bản.',
           targets.updated_by_user_id, targets.updated_by_name,
           COALESCE(NULLIF(targets.updated_at, ''), CURRENT_TIMESTAMP)
    FROM sales_kpi_targets AS targets
    WHERE NOT EXISTS (
      SELECT 1 FROM sales_kpi_policy_history AS history
      WHERE history.period = targets.period
        AND history.sale_user_id = targets.sale_user_id
    )
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_admin_notifications_visible
    ON admin_notifications (deleted_at, created_at);
  `);
};

const db = openDatabase();

const closeDatabase = () => db.close();

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

const insertConversationStatement = db.prepare(`
  INSERT INTO conversations (user_id, subject, context_type, context_id, customer_last_read_at)
  VALUES (?, ?, ?, ?, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'))
`);
const findConversationByIdStatement = db.prepare(`
  SELECT conversations.*, customers.full_name AS customer_name, customers.email AS customer_email,
         customers.phone AS customer_phone, customers.avatar_url AS customer_avatar_url,
         assignees.full_name AS assigned_user_name,
         (SELECT content FROM conversation_messages WHERE conversation_id = conversations.id ORDER BY id DESC LIMIT 1) AS last_message,
         (SELECT sender_role FROM conversation_messages WHERE conversation_id = conversations.id ORDER BY id DESC LIMIT 1) AS last_sender_role
  FROM conversations
  INNER JOIN users customers ON customers.id = conversations.user_id
  LEFT JOIN users assignees ON assignees.id = conversations.assigned_user_id
  WHERE conversations.id = ?
`);
const listConversationsByUserStatement = db.prepare(`
  SELECT conversations.*, assignees.full_name AS assigned_user_name,
         (SELECT content FROM conversation_messages WHERE conversation_id = conversations.id ORDER BY id DESC LIMIT 1) AS last_message,
         (SELECT COUNT(*) FROM conversation_messages messages
          WHERE messages.conversation_id = conversations.id
            AND messages.sender_role IN ('staff', 'admin')
            AND messages.id > conversations.customer_last_read_message_id) AS unread_count
  FROM conversations
  LEFT JOIN users assignees ON assignees.id = conversations.assigned_user_id
  WHERE conversations.user_id = ?
  ORDER BY datetime(conversations.last_message_at) DESC, conversations.id DESC
`);
const listAdminConversationsStatement = db.prepare(`
  SELECT conversations.*, customers.full_name AS customer_name, customers.email AS customer_email,
         customers.phone AS customer_phone, customers.avatar_url AS customer_avatar_url,
         assignees.full_name AS assigned_user_name,
         (SELECT content FROM conversation_messages WHERE conversation_id = conversations.id ORDER BY id DESC LIMIT 1) AS last_message,
         (SELECT COUNT(*) FROM conversation_messages messages
          WHERE messages.conversation_id = conversations.id
            AND messages.sender_role = 'customer'
            AND messages.id > conversations.staff_last_read_message_id) AS unread_count
  FROM conversations
  INNER JOIN users customers ON customers.id = conversations.user_id
  LEFT JOIN users assignees ON assignees.id = conversations.assigned_user_id
  ORDER BY CASE conversations.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
           datetime(conversations.last_message_at) DESC, conversations.id DESC
`);
const insertConversationMessageStatement = db.prepare(`
  INSERT INTO conversation_messages (conversation_id, sender_user_id, sender_role, content, created_at)
  VALUES (?, ?, ?, ?, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'))
`);
const findConversationMessageByIdStatement = db.prepare(`
  SELECT conversation_messages.*, users.full_name AS sender_name, users.avatar_url AS sender_avatar_url
  FROM conversation_messages
  INNER JOIN users ON users.id = conversation_messages.sender_user_id
  WHERE conversation_messages.id = ?
`);
const listConversationMessagesStatement = db.prepare(`
  SELECT conversation_messages.*, users.full_name AS sender_name, users.avatar_url AS sender_avatar_url
  FROM conversation_messages
  INNER JOIN users ON users.id = conversation_messages.sender_user_id
  WHERE conversation_messages.conversation_id = ?
  ORDER BY conversation_messages.id ASC
  LIMIT 200
`);
const touchConversationAfterMessageStatement = db.prepare(`
  UPDATE conversations SET status = CASE WHEN ? = 'customer' AND status = 'closed' THEN 'open' ELSE status END,
      last_message_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), updated_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'now') WHERE id = ?
`);
const markConversationCustomerReadStatement = db.prepare(`
  UPDATE conversations SET customer_last_read_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'now'),
      customer_last_read_message_id = COALESCE((SELECT MAX(id) FROM conversation_messages WHERE conversation_id = ?), 0)
  WHERE id = ?
`);
const markConversationStaffReadStatement = db.prepare(`
  UPDATE conversations SET staff_last_read_at = STRFTIME('%Y-%m-%d %H:%M:%f', 'now'),
      staff_last_read_message_id = COALESCE((SELECT MAX(id) FROM conversation_messages WHERE conversation_id = ?), 0)
  WHERE id = ?
`);
const assignConversationStatement = db.prepare(`
  UPDATE conversations SET assigned_user_id = ?, status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);
const updateConversationStatusStatement = db.prepare(`
  UPDATE conversations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
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

const findDepositPaymentSettingsStatement = db.prepare(`
  SELECT *
  FROM deposit_payment_settings
  WHERE id = 1
`);

const upsertDepositPaymentSettingsStatement = db.prepare(`
  INSERT INTO deposit_payment_settings (
    id, account_name, bank_name, account_number, branch, transfer_prefix,
    deposit_amount_options_json, default_deposit_amount, min_deposit_amount,
    max_deposit_amount, hold_hours, require_transfer_proof, policy_text,
    updated_by_user_id, updated_by_name, updated_at
  )
  VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    account_name = excluded.account_name,
    bank_name = excluded.bank_name,
    account_number = excluded.account_number,
    branch = excluded.branch,
    transfer_prefix = excluded.transfer_prefix,
    deposit_amount_options_json = excluded.deposit_amount_options_json,
    default_deposit_amount = excluded.default_deposit_amount,
    min_deposit_amount = excluded.min_deposit_amount,
    max_deposit_amount = excluded.max_deposit_amount,
    hold_hours = excluded.hold_hours,
    require_transfer_proof = excluded.require_transfer_proof,
    policy_text = excluded.policy_text,
    updated_by_user_id = excluded.updated_by_user_id,
    updated_by_name = excluded.updated_by_name,
    updated_at = CURRENT_TIMESTAMP
`);

const insertDepositOrderStatement = db.prepare(`
  INSERT INTO deposit_orders (
    user_id, car_id, car_name, car_brand, car_price_text, car_price_value,
    full_name, phone, email, province, note, deposit_amount, payment_method, bank_transfer_note,
    expires_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const findDepositOrderByIdStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  WHERE deposit_orders.id = ?
`);

const listDepositOrdersStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  ORDER BY
    CASE deposit_orders.status
      WHEN 'pending' THEN 0
      WHEN 'confirmed' THEN 1
      ELSE 2
    END,
    datetime(deposit_orders.created_at) DESC,
    deposit_orders.id DESC
`);

const listDepositOrdersByUserStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  WHERE deposit_orders.user_id = ?
  ORDER BY datetime(deposit_orders.created_at) DESC,
           deposit_orders.id DESC
`);

const findActiveDepositOrderByCarIdStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  WHERE deposit_orders.car_id = ?
    AND deposit_orders.status IN ('pending', 'confirmed')
  ORDER BY
    CASE deposit_orders.status
      WHEN 'confirmed' THEN 0
      WHEN 'pending' THEN 1
      ELSE 2
    END,
    datetime(deposit_orders.created_at) ASC,
    deposit_orders.id ASC
  LIMIT 1
`);

const findOtherActiveDepositOrderByCarIdStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  WHERE deposit_orders.car_id = ?
    AND deposit_orders.id <> ?
    AND deposit_orders.status IN ('pending', 'confirmed')
  ORDER BY
    CASE deposit_orders.status
      WHEN 'confirmed' THEN 0
      WHEN 'pending' THEN 1
      ELSE 2
    END,
    datetime(deposit_orders.created_at) ASC,
    deposit_orders.id ASC
  LIMIT 1
`);

const findDepositOrderByPaymentReferenceStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  WHERE lower(trim(deposit_orders.payment_reference)) = lower(trim(?))
    AND deposit_orders.payment_reference <> ''
    AND deposit_orders.id <> ?
  ORDER BY datetime(deposit_orders.payment_confirmed_at) DESC,
           datetime(deposit_orders.updated_at) DESC,
           deposit_orders.id DESC
  LIMIT 1
`);

const updateDepositOrderStatusStatement = db.prepare(`
  UPDATE deposit_orders
  SET status = ?,
      status_note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateDepositOrderPaymentConfirmationStatement = db.prepare(`
  UPDATE deposit_orders
  SET payment_reference = ?,
      payment_received_at = ?,
      payment_confirmation_note = ?,
      payment_confirmed_by_user_id = ?,
      payment_confirmed_by_name = ?,
      payment_confirmed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateDepositOrderVnpayPaymentStatement = db.prepare(`
  UPDATE deposit_orders
  SET vnpay_txn_ref = ?,
      vnpay_transaction_no = ?,
      vnpay_response_code = ?,
      vnpay_transaction_status = ?,
      vnpay_bank_code = ?,
      vnpay_card_type = ?,
      vnpay_pay_date = ?,
      vnpay_payment_url = ?,
      vnpay_confirmed_at = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateDepositOrderRefundStatement = db.prepare(`
  UPDATE deposit_orders
  SET refund_amount = ?,
      refund_reference = ?,
      refund_completed_at = ?,
      refund_note = ?,
      refund_confirmed_by_user_id = ?,
      refund_confirmed_by_name = ?,
      refund_confirmed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateDepositOrderTransferProofStatement = db.prepare(`
  UPDATE deposit_orders
  SET transfer_proof_url = ?,
      transfer_proof_file_name = ?,
      transfer_proof_uploaded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const updateDepositOrderExpiredAtStatement = db.prepare(`
  UPDATE deposit_orders
  SET expired_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const markDepositOrderPaymentReminderSentStatement = db.prepare(`
  UPDATE deposit_orders
  SET payment_reminder_sent_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const listDepositOrderPaymentReminderCandidatesStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  WHERE deposit_orders.status = 'pending'
    AND deposit_orders.expires_at IS NOT NULL
    AND deposit_orders.expires_at <> ''
    AND deposit_orders.payment_reminder_sent_at = ''
    AND datetime(deposit_orders.expires_at) > datetime('now')
    AND datetime(deposit_orders.expires_at) <= datetime('now', ?)
    AND datetime(deposit_orders.created_at) <= datetime('now', '-15 minutes')
  ORDER BY datetime(deposit_orders.expires_at) ASC,
           deposit_orders.id ASC
`);

const listOverdueDepositOrdersStatement = db.prepare(`
  SELECT deposit_orders.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url
  FROM deposit_orders
  LEFT JOIN users ON users.id = deposit_orders.user_id
  WHERE deposit_orders.status = 'pending'
    AND deposit_orders.expires_at IS NOT NULL
    AND deposit_orders.expires_at <> ''
    AND datetime(deposit_orders.expires_at) <= datetime('now')
  ORDER BY datetime(deposit_orders.expires_at) ASC,
           deposit_orders.id ASC
`);

const insertDepositOrderStatusHistoryStatement = db.prepare(`
  INSERT INTO deposit_order_status_history (
    deposit_order_id, previous_status, next_status, note,
    actor_user_id, actor_name, action_type
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const listDepositOrderStatusHistoryStatement = db.prepare(`
  SELECT deposit_order_status_history.*
  FROM deposit_order_status_history
  WHERE deposit_order_status_history.deposit_order_id = ?
  ORDER BY datetime(deposit_order_status_history.created_at) ASC,
           deposit_order_status_history.id ASC
`);

const holdCarForDepositStatement = db.prepare(`
  UPDATE cars
  SET action_text = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND action_text <> ?
    AND action_text <> ?
`);

const releaseCarDepositHoldStatement = db.prepare(`
  UPDATE cars
  SET action_text = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND action_text = ?
`);

const markCarSoldAfterDepositStatement = db.prepare(`
  UPDATE cars
  SET action_text = ?,
      updated_at = CURRENT_TIMESTAMP
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
         users.avatar_url AS user_avatar_url,
         cars.action_text AS approved_car_action_text
  FROM car_sell_requests
  LEFT JOIN users ON users.id = car_sell_requests.user_id
  LEFT JOIN cars ON cars.id = car_sell_requests.approved_car_id
  WHERE car_sell_requests.id = ?
`);

const listCarSellRequestsStatement = db.prepare(`
  SELECT car_sell_requests.*,
         users.email AS user_email,
         users.avatar_url AS user_avatar_url,
         cars.action_text AS approved_car_action_text
  FROM car_sell_requests
  LEFT JOIN users ON users.id = car_sell_requests.user_id
  LEFT JOIN cars ON cars.id = car_sell_requests.approved_car_id
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
         users.avatar_url AS user_avatar_url,
         cars.action_text AS approved_car_action_text
  FROM car_sell_requests
  LEFT JOIN users ON users.id = car_sell_requests.user_id
  LEFT JOIN cars ON cars.id = car_sell_requests.approved_car_id
  WHERE car_sell_requests.user_id = ?
  ORDER BY datetime(car_sell_requests.created_at) DESC,
           car_sell_requests.id DESC
`);

const updateCarSellRequestApprovedStatement = db.prepare(`
  UPDATE car_sell_requests
  SET status = 'approved',
      status_note = ?,
      customer_deal_price_text = ?,
      customer_deal_price_value = ?,
      final_price_text = ?,
      final_price_value = ?,
      approved_car_id = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const deleteCarSellRequestStatement = db.prepare(`
  DELETE FROM car_sell_requests
  WHERE id = ?
`);

const findApprovedCarSellRequestByCarIdStatement = db.prepare(`
  SELECT *
  FROM car_sell_requests
  WHERE approved_car_id = ?
    AND status = 'approved'
  ORDER BY datetime(updated_at) DESC, id DESC
  LIMIT 1
`);

const listSalesKpiRecordsStatement = db.prepare(`
  SELECT sales_kpi_records.*,
         users.email AS sale_email,
         users.avatar_url AS sale_avatar_url
  FROM sales_kpi_records
  LEFT JOIN users ON users.id = sales_kpi_records.sale_user_id
  ORDER BY
    CASE sales_kpi_records.record_status WHEN 'active' THEN 0 ELSE 1 END,
    datetime(sales_kpi_records.recorded_at) DESC,
    sales_kpi_records.id DESC
`);

const findSalesKpiRecordByIdStatement = db.prepare(`
  SELECT sales_kpi_records.*,
         users.email AS sale_email,
         users.avatar_url AS sale_avatar_url
  FROM sales_kpi_records
  LEFT JOIN users ON users.id = sales_kpi_records.sale_user_id
  WHERE sales_kpi_records.id = ?
`);

const listAvailableAcquisitionKpiSourcesStatement = db.prepare(`
  SELECT car_sell_requests.*
  FROM car_sell_requests
  LEFT JOIN sales_kpi_records
    ON sales_kpi_records.kpi_type = 'acquisition'
   AND sales_kpi_records.source_id = car_sell_requests.id
  WHERE car_sell_requests.status = 'approved'
    AND car_sell_requests.approved_car_id IS NOT NULL
    AND car_sell_requests.customer_deal_price_value > 0
    AND sales_kpi_records.id IS NULL
  ORDER BY datetime(car_sell_requests.updated_at) DESC, car_sell_requests.id DESC
`);

const listAvailableSaleKpiSourcesStatement = db.prepare(`
  SELECT deposit_orders.*
  FROM deposit_orders
  LEFT JOIN sales_kpi_records
    ON sales_kpi_records.kpi_type = 'sale'
   AND sales_kpi_records.source_id = deposit_orders.id
  WHERE deposit_orders.status = 'completed'
    AND deposit_orders.car_id IS NOT NULL
    AND sales_kpi_records.id IS NULL
  ORDER BY datetime(deposit_orders.updated_at) DESC, deposit_orders.id DESC
`);

const listAvailableDirectSaleKpiSourcesStatement = db.prepare(`
  SELECT direct_car_sales.*
  FROM direct_car_sales
  LEFT JOIN sales_kpi_records
    ON sales_kpi_records.kpi_type = 'direct_sale'
   AND sales_kpi_records.source_id = direct_car_sales.id
  WHERE sales_kpi_records.id IS NULL
  ORDER BY datetime(direct_car_sales.sold_at) DESC, direct_car_sales.id DESC
`);

const findDirectCarSaleByIdStatement = db.prepare(`
  SELECT *
  FROM direct_car_sales
  WHERE id = ?
`);

const findDirectCarSaleByCarIdStatement = db.prepare(`
  SELECT *
  FROM direct_car_sales
  WHERE car_id = ?
`);

const insertDirectCarSaleStatement = db.prepare(`
  INSERT INTO direct_car_sales (
    car_id, car_name, car_brand, sale_price_value, sold_by_user_id, sold_by_name
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertSalesKpiRecordStatement = db.prepare(`
  INSERT INTO sales_kpi_records (
    kpi_type, source_id, sale_user_id, sale_name, car_id, car_name, car_brand,
    source_code, transaction_value, purchase_price_value, sale_price_value,
    reward_amount, reward_status, note, recorded_by_user_id, recorded_by_name,
    business_date, policy_period, creation_mode
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateSalesKpiRecordStatement = db.prepare(`
  UPDATE sales_kpi_records
  SET sale_user_id = ?,
      sale_name = ?,
      reward_amount = ?,
      note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND record_status = 'active'
`);

const findSalesKpiPeriodStatement = db.prepare('SELECT * FROM sales_kpi_periods WHERE period = ?');
const upsertSalesKpiPeriodStatement = db.prepare(`
  INSERT INTO sales_kpi_periods (
    period, status, locked_at, locked_by_user_id, locked_by_name, lock_note
  ) VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(period) DO UPDATE SET
    status = excluded.status,
    locked_at = excluded.locked_at,
    locked_by_user_id = excluded.locked_by_user_id,
    locked_by_name = excluded.locked_by_name,
    lock_note = excluded.lock_note,
    updated_at = CURRENT_TIMESTAMP
`);
const insertSalesKpiPolicyHistoryStatement = db.prepare(`
  INSERT INTO sales_kpi_policy_history (
    period, sale_user_id, kpi_role, vehicle_target, gross_profit_target,
    commission_per_sale, acquisition_reward_per_vehicle, action_type,
    change_note, changed_by_user_id, changed_by_name
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const listSalesKpiPolicyHistoryStatement = db.prepare(`
  SELECT sales_kpi_policy_history.*, users.full_name AS sale_name
  FROM sales_kpi_policy_history
  LEFT JOIN users ON users.id = sales_kpi_policy_history.sale_user_id
  WHERE sales_kpi_policy_history.period = ?
  ORDER BY datetime(sales_kpi_policy_history.created_at) DESC, sales_kpi_policy_history.id DESC
  LIMIT 100
`);
const updateSalesKpiRewardWorkflowStatement = db.prepare(`
  UPDATE sales_kpi_records
  SET reward_status = ?,
      reward_approved_at = ?,
      reward_approved_by_user_id = ?,
      reward_approved_by_name = ?,
      reward_paid_at = ?,
      reward_paid_by_user_id = ?,
      reward_paid_by_name = ?,
      payout_reference = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ? AND record_status = 'active'
`);
const insertSalesKpiRewardHistoryStatement = db.prepare(`
  INSERT INTO sales_kpi_reward_history (
    sales_kpi_record_id, previous_status, next_status, payout_reference,
    note, actor_user_id, actor_name
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const cancelSalesKpiRecordStatement = db.prepare(`
  UPDATE sales_kpi_records
  SET record_status = 'cancelled',
      cancelled_at = CURRENT_TIMESTAMP,
      cancelled_by_user_id = ?,
      cancelled_by_name = ?,
      cancellation_note = ?,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND record_status = 'active'
`);

const listSalesKpiTargetsByPeriodStatement = db.prepare(`
  SELECT sales_kpi_targets.*,
         users.full_name AS current_sale_name,
         users.email AS sale_email,
         users.avatar_url AS sale_avatar_url
  FROM sales_kpi_targets
  INNER JOIN users ON users.id = sales_kpi_targets.sale_user_id
  WHERE sales_kpi_targets.period = ?
    AND users.role = 'staff'
  ORDER BY users.full_name COLLATE NOCASE, users.id
`);

const findSalesKpiTargetStatement = db.prepare(`
  SELECT *
  FROM sales_kpi_targets
  WHERE period = ? AND sale_user_id = ?
`);

const upsertSalesKpiTargetStatement = db.prepare(`
  INSERT INTO sales_kpi_targets (
    period, sale_user_id, vehicle_target, revenue_target, gross_profit_target,
    kpi_role, commission_per_sale, acquisition_reward_per_vehicle,
    updated_by_user_id, updated_by_name
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(period, sale_user_id) DO UPDATE SET
    vehicle_target = excluded.vehicle_target,
    revenue_target = excluded.revenue_target,
    gross_profit_target = excluded.gross_profit_target,
    kpi_role = excluded.kpi_role,
    commission_per_sale = excluded.commission_per_sale,
    acquisition_reward_per_vehicle = excluded.acquisition_reward_per_vehicle,
    updated_by_user_id = excluded.updated_by_user_id,
    updated_by_name = excluded.updated_by_name,
    updated_at = CURRENT_TIMESTAMP
`);

const insertUserNotificationStatement = db.prepare(`
  INSERT INTO user_notifications (
    user_id, type, title, message, entity_type, entity_id, status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const findUserNotificationByIdForUserStatement = db.prepare(`
  SELECT *
  FROM user_notifications
  WHERE id = ?
    AND user_id = ?
    AND deleted_at IS NULL
`);

const findUserNotificationForEntityStatement = db.prepare(`
  SELECT *
  FROM user_notifications
  WHERE user_id = ?
    AND type = ?
    AND entity_type = ?
    AND entity_id IS ?
    AND status = ?
  ORDER BY datetime(created_at) DESC,
           id DESC
  LIMIT 1
`);

const listUserNotificationsStatement = db.prepare(`
  SELECT *
  FROM user_notifications
  WHERE user_id = ?
    AND deleted_at IS NULL
  ORDER BY datetime(created_at) DESC,
           id DESC
  LIMIT 80
`);

const markUserNotificationReadStatement = db.prepare(`
  UPDATE user_notifications
  SET is_read = 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND user_id = ?
    AND deleted_at IS NULL
`);

const markAllUserNotificationsReadStatement = db.prepare(`
  UPDATE user_notifications
  SET is_read = 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = ?
    AND deleted_at IS NULL
    AND is_read = 0
`);

const softDeleteUserNotificationStatement = db.prepare(`
  UPDATE user_notifications
  SET deleted_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND user_id = ?
    AND deleted_at IS NULL
`);

const insertAdminNotificationStatement = db.prepare(`
  INSERT INTO admin_notifications (
    type, title, message, entity_type, entity_id, status
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const findAdminNotificationByIdStatement = db.prepare(`
  SELECT *
  FROM admin_notifications
  WHERE id = ?
    AND deleted_at IS NULL
`);

const findAdminNotificationForEntityStatement = db.prepare(`
  SELECT *
  FROM admin_notifications
  WHERE type = ?
    AND entity_type = ?
    AND entity_id IS ?
    AND status = ?
  ORDER BY datetime(created_at) DESC,
           id DESC
  LIMIT 1
`);

const listAdminNotificationsStatement = db.prepare(`
  SELECT *
  FROM admin_notifications
  WHERE deleted_at IS NULL
  ORDER BY datetime(created_at) DESC,
           id DESC
  LIMIT 100
`);

const markAdminNotificationReadStatement = db.prepare(`
  UPDATE admin_notifications
  SET is_read = 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND deleted_at IS NULL
`);

const markAllAdminNotificationsReadStatement = db.prepare(`
  UPDATE admin_notifications
  SET is_read = 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE deleted_at IS NULL
    AND is_read = 0
`);

const softDeleteAdminNotificationStatement = db.prepare(`
  UPDATE admin_notifications
  SET deleted_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
    AND deleted_at IS NULL
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
    actionText: String(car.actionText || carAvailableStatusText).trim() || carAvailableStatusText
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

const sanitizeDepositOrderStatusHistory = (historyRow) => {
  if (!historyRow) {
    return null;
  }

  return {
    id: historyRow.id,
    depositOrderId: historyRow.deposit_order_id,
    previousStatus: historyRow.previous_status
      ? normalizeDepositOrderStatus(historyRow.previous_status)
      : '',
    nextStatus: normalizeDepositOrderStatus(historyRow.next_status),
    note: historyRow.note || '',
    actorUserId: historyRow.actor_user_id || null,
    actorName: historyRow.actor_name || '',
    actionType: historyRow.action_type || 'status_update',
    createdAt: historyRow.created_at || '',
  };
};

const listDepositOrderStatusHistoryByOrderId = (orderId) => {
  const normalizedOrderId = Number(orderId || 0);

  if (!Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) {
    return [];
  }

  return listDepositOrderStatusHistoryStatement
    .all(normalizedOrderId)
    .map(sanitizeDepositOrderStatusHistory)
    .filter(Boolean);
};

const sanitizeDepositPaymentSettings = (settingsRow) => {
  if (!settingsRow) {
    return {
      ...depositPaymentSettingsDefaults,
      id: 1,
      updatedByUserId: null,
      updatedByName: '',
      createdAt: '',
      updatedAt: '',
    };
  }

  return normalizeDepositPaymentSettingsData(settingsRow);
};

const getDepositPaymentSettings = () =>
  sanitizeDepositPaymentSettings(findDepositPaymentSettingsStatement.get());

const updateDepositPaymentSettings = (settings = {}, actorUser = null) => {
  const existingSettings = getDepositPaymentSettings();
  const normalizedSettings = normalizeDepositPaymentSettingsData({
    ...existingSettings,
    ...settings,
    updatedByUserId: Number(actorUser?.id || 0) || null,
    updatedByName: normalizeFullName(actorUser?.fullName || actorUser?.email || ''),
  });
  const actorUserId = Number(normalizedSettings.updatedByUserId || 0);

  upsertDepositPaymentSettingsStatement.run(
    normalizedSettings.accountName,
    normalizedSettings.bankName,
    normalizedSettings.accountNumber,
    normalizedSettings.branch,
    normalizedSettings.transferPrefix,
    JSON.stringify(normalizedSettings.depositAmountOptions),
    normalizedSettings.defaultDepositAmount,
    normalizedSettings.minDepositAmount,
    normalizedSettings.maxDepositAmount,
    normalizedSettings.holdHours,
    normalizedSettings.requireTransferProof ? 1 : 0,
    normalizedSettings.policyText,
    Number.isInteger(actorUserId) && actorUserId > 0 ? actorUserId : null,
    normalizedSettings.updatedByName
  );

  return getDepositPaymentSettings();
};

const sanitizeDepositOrder = (orderRow) => {
  if (!orderRow) {
    return null;
  }

  const normalizedStatus = normalizeDepositOrderStatus(orderRow.status);
  const expiresAt = orderRow.expires_at || '';

  return {
    id: orderRow.id,
    code: `DC-${String(orderRow.id).padStart(6, '0')}`,
    userId: orderRow.user_id,
    userEmail: orderRow.user_email || '',
    userAvatarUrl: orderRow.user_avatar_url || '',
    carId: orderRow.car_id,
    carName: orderRow.car_name || '',
    carBrand: orderRow.car_brand || '',
    carPrice: orderRow.car_price_text || '',
    carPriceValue: Number(orderRow.car_price_value || 0),
    fullName: orderRow.full_name || '',
    phone: orderRow.phone || '',
    email: orderRow.email || '',
    province: orderRow.province || '',
    note: orderRow.note || '',
    depositAmount: Number(orderRow.deposit_amount || 0),
    paymentMethod: normalizeDepositPaymentMethod(orderRow.payment_method),
    bankTransferNote: orderRow.bank_transfer_note || '',
    vnpayTxnRef: orderRow.vnpay_txn_ref || '',
    vnpayTransactionNo: orderRow.vnpay_transaction_no || '',
    vnpayResponseCode: orderRow.vnpay_response_code || '',
    vnpayTransactionStatus: orderRow.vnpay_transaction_status || '',
    vnpayBankCode: orderRow.vnpay_bank_code || '',
    vnpayCardType: orderRow.vnpay_card_type || '',
    vnpayPayDate: orderRow.vnpay_pay_date || '',
    vnpayPaymentUrl: orderRow.vnpay_payment_url || '',
    vnpayConfirmedAt: orderRow.vnpay_confirmed_at || '',
    transferProofUrl: orderRow.transfer_proof_url || '',
    transferProofFileName: orderRow.transfer_proof_file_name || '',
    transferProofUploadedAt: orderRow.transfer_proof_uploaded_at || '',
    status: normalizedStatus,
    statusNote: orderRow.status_note || '',
    paymentReference: orderRow.payment_reference || '',
    paymentReceivedAt: orderRow.payment_received_at || '',
    paymentConfirmationNote: orderRow.payment_confirmation_note || '',
    paymentConfirmedByUserId: orderRow.payment_confirmed_by_user_id || null,
    paymentConfirmedByName: orderRow.payment_confirmed_by_name || '',
    paymentConfirmedAt: orderRow.payment_confirmed_at || '',
    refundAmount: Number(orderRow.refund_amount || 0),
    refundReference: orderRow.refund_reference || '',
    refundCompletedAt: orderRow.refund_completed_at || '',
    refundNote: orderRow.refund_note || '',
    refundConfirmedByUserId: orderRow.refund_confirmed_by_user_id || null,
    refundConfirmedByName: orderRow.refund_confirmed_by_name || '',
    refundConfirmedAt: orderRow.refund_confirmed_at || '',
    expiresAt,
    expiredAt: orderRow.expired_at || '',
    paymentReminderSentAt: orderRow.payment_reminder_sent_at || '',
    isOverdue: isDepositOrderOverdue({
      status: normalizedStatus,
      expiresAt,
    }),
    history: listDepositOrderStatusHistoryByOrderId(orderRow.id),
    createdAt: orderRow.created_at || '',
    updatedAt: orderRow.updated_at || '',
  };
};

const normalizeDepositOrderPayload = (order = {}) => ({
  userId: order.userId ? Number(order.userId) : null,
  carId: Number(order.carId || order.car_id || 0),
  fullName: normalizeFullName(order.fullName || order.full_name),
  phone: String(order.phone || '').trim(),
  email: normalizeEmail(order.email),
  province: String(order.province || '').trim().replace(/\s+/g, ' '),
  note: String(order.note || '').trim(),
  depositAmount: Number(order.depositAmount || order.deposit_amount || 0),
  paymentMethod: normalizeDepositPaymentMethod(order.paymentMethod || order.payment_method),
  bankTransferNote: String(order.bankTransferNote || order.bank_transfer_note || '').trim().replace(/\s+/g, ' '),
});

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
    customerDealPrice: requestRow.customer_deal_price_text || '',
    customerDealPriceValue: Number(requestRow.customer_deal_price_value || 0),
    finalPrice: requestRow.final_price_text || '',
    finalPriceValue: Number(requestRow.final_price_value || 0),
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
    approvedCarActionText: requestRow.approved_car_action_text || '',
    status: normalizeCarSellRequestStatus(requestRow.status),
    statusNote: requestRow.status_note || '',
    approvedCarId: requestRow.approved_car_id,
    createdAt: requestRow.created_at || '',
    updatedAt: requestRow.updated_at || '',
  };
};

const sanitizeSalesKpiRecord = (recordRow) => {
  if (!recordRow) {
    return null;
  }

  return {
    id: recordRow.id,
    kpiType: recordRow.kpi_type || '',
    sourceId: Number(recordRow.source_id || 0),
    saleUserId: Number(recordRow.sale_user_id || 0),
    saleName: recordRow.sale_name || '',
    saleEmail: recordRow.sale_email || '',
    saleAvatarUrl: recordRow.sale_avatar_url || '',
    carId: Number(recordRow.car_id || 0) || null,
    carName: recordRow.car_name || '',
    carBrand: recordRow.car_brand || '',
    sourceCode: recordRow.source_code || '',
    transactionValue: Number(recordRow.transaction_value || 0),
    purchasePriceValue: Number(recordRow.purchase_price_value || 0),
    salePriceValue: Number(recordRow.sale_price_value || 0),
    rewardAmount: Number(recordRow.reward_amount || 0),
    rewardStatus: recordRow.reward_status || 'pending',
    businessDate: recordRow.business_date || String(recordRow.recorded_at || '').slice(0, 10),
    policyPeriod: recordRow.policy_period || String(recordRow.recorded_at || '').slice(0, 7),
    creationMode: recordRow.creation_mode || 'manual',
    rewardApprovedAt: recordRow.reward_approved_at || '',
    rewardApprovedByUserId: Number(recordRow.reward_approved_by_user_id || 0) || null,
    rewardApprovedByName: recordRow.reward_approved_by_name || '',
    rewardPaidAt: recordRow.reward_paid_at || '',
    rewardPaidByName: recordRow.reward_paid_by_name || '',
    payoutReference: recordRow.payout_reference || '',
    recordStatus: recordRow.record_status || 'active',
    note: recordRow.note || '',
    recordedByUserId: Number(recordRow.recorded_by_user_id || 0) || null,
    recordedByName: recordRow.recorded_by_name || '',
    recordedAt: recordRow.recorded_at || '',
    updatedAt: recordRow.updated_at || '',
    cancelledAt: recordRow.cancelled_at || '',
    cancelledByUserId: Number(recordRow.cancelled_by_user_id || 0) || null,
    cancelledByName: recordRow.cancelled_by_name || '',
    cancellationNote: recordRow.cancellation_note || '',
  };
};

const sanitizeSalesKpiTarget = (targetRow) => {
  if (!targetRow) return null;

  return {
    id: Number(targetRow.id || 0),
    period: targetRow.period || '',
    saleUserId: Number(targetRow.sale_user_id || 0),
    saleName: targetRow.current_sale_name || '',
    saleEmail: targetRow.sale_email || '',
    saleAvatarUrl: targetRow.sale_avatar_url || '',
    vehicleTarget: Number(targetRow.vehicle_target || 0),
    revenueTarget: Number(targetRow.revenue_target || 0),
    grossProfitTarget: Number(targetRow.gross_profit_target || 0),
    kpiRole: ['sales_only', 'acquisition_only', 'both'].includes(targetRow.kpi_role)
      ? targetRow.kpi_role
      : 'both',
    commissionPerSale: Number(targetRow.commission_per_sale || 0),
    acquisitionRewardPerVehicle: Number(targetRow.acquisition_reward_per_vehicle || 0),
    updatedByName: targetRow.updated_by_name || '',
    updatedAt: targetRow.updated_at || '',
  };
};

const sanitizeDirectCarSale = (saleRow) => {
  if (!saleRow) {
    return null;
  }

  return {
    id: saleRow.id,
    code: `BH-CH-${String(saleRow.id).padStart(6, '0')}`,
    carId: Number(saleRow.car_id || 0),
    carName: saleRow.car_name || '',
    carBrand: saleRow.car_brand || '',
    salePriceValue: Number(saleRow.sale_price_value || 0),
    soldByUserId: Number(saleRow.sold_by_user_id || 0) || null,
    soldByName: saleRow.sold_by_name || '',
    soldAt: saleRow.sold_at || '',
    createdAt: saleRow.created_at || '',
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
    isRead: Boolean(notificationRow.is_read),
    createdAt: notificationRow.created_at || '',
    updatedAt: notificationRow.updated_at || '',
    deletedAt: notificationRow.deleted_at || '',
  };
};

const sanitizeAdminNotification = (notificationRow) => {
  if (!notificationRow) {
    return null;
  }

  return {
    id: notificationRow.id,
    type: notificationRow.type || '',
    title: notificationRow.title || '',
    message: notificationRow.message || '',
    entityType: notificationRow.entity_type || '',
    entityId: notificationRow.entity_id,
    status: notificationRow.status || '',
    isRead: Boolean(notificationRow.is_read),
    createdAt: notificationRow.created_at || '',
    updatedAt: notificationRow.updated_at || '',
    deletedAt: notificationRow.deleted_at || '',
  };
};

const isCarAvailableForTestDrive = (car) =>
  String(car?.actionText || '').trim().toLocaleLowerCase('vi-VN') ===
    carAvailableStatusText.toLocaleLowerCase('vi-VN');

const isActiveDepositOrderStatus = (status) =>
  ['pending', 'confirmed'].includes(String(status || '').trim().toLowerCase());

const getActiveDepositOrderForCar = (carId, excludeOrderId = null) => {
  const normalizedCarId = Number(carId || 0);

  if (!Number.isInteger(normalizedCarId) || normalizedCarId <= 0) {
    return null;
  }

  const normalizedExcludeOrderId = Number(excludeOrderId || 0);
  const row = Number.isInteger(normalizedExcludeOrderId) && normalizedExcludeOrderId > 0
    ? findOtherActiveDepositOrderByCarIdStatement.get(normalizedCarId, normalizedExcludeOrderId)
    : findActiveDepositOrderByCarIdStatement.get(normalizedCarId);

  return sanitizeDepositOrder(row);
};

const getDepositOrderByPaymentReference = (paymentReference, excludeOrderId = null) => {
  const normalizedPaymentReference = String(paymentReference || '').trim();
  const normalizedExcludeOrderId = Number(excludeOrderId || 0);

  if (!normalizedPaymentReference) {
    return null;
  }

  return sanitizeDepositOrder(findDepositOrderByPaymentReferenceStatement.get(
    normalizedPaymentReference,
    Number.isInteger(normalizedExcludeOrderId) && normalizedExcludeOrderId > 0
      ? normalizedExcludeOrderId
      : 0
  ));
};

const createDepositCarHeldError = (activeOrder) => {
  const error = new Error('Xe này đang có đơn đặt cọc giữ chỗ.');
  error.code = 'DEPOSIT_CAR_ALREADY_HELD';
  error.order = activeOrder || null;

  return error;
};

const holdCarForDeposit = (carId) => {
  const normalizedCarId = Number(carId || 0);

  if (!Number.isInteger(normalizedCarId) || normalizedCarId <= 0) {
    return null;
  }

  holdCarForDepositStatement.run(
    carHeldStatusText,
    normalizedCarId,
    carHeldStatusText,
    carSoldStatusText
  );

  return getCarById(normalizedCarId);
};

const releaseCarDepositHoldIfClear = (carId, excludeOrderId = null) => {
  const normalizedCarId = Number(carId || 0);

  if (!Number.isInteger(normalizedCarId) || normalizedCarId <= 0) {
    return null;
  }

  if (!getActiveDepositOrderForCar(normalizedCarId, excludeOrderId)) {
    releaseCarDepositHoldStatement.run(
      carAvailableStatusText,
      normalizedCarId,
      carHeldStatusText
    );
  }

  return getCarById(normalizedCarId);
};

const markCarSoldAfterDeposit = (carId) => {
  const normalizedCarId = Number(carId || 0);

  if (!Number.isInteger(normalizedCarId) || normalizedCarId <= 0) {
    return null;
  }

  markCarSoldAfterDepositStatement.run(carSoldStatusText, normalizedCarId);

  return getCarById(normalizedCarId);
};

const createDepositOrderStatusHistory = (orderId, {
  previousStatus = '',
  nextStatus = 'pending',
  note = '',
  actorUserId = null,
  actorName = '',
  actionType = 'status_update',
} = {}) => {
  const normalizedOrderId = Number(orderId || 0);
  const normalizedActorUserId = Number(actorUserId || 0);

  if (!Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) {
    return null;
  }

  insertDepositOrderStatusHistoryStatement.run(
    normalizedOrderId,
    previousStatus ? normalizeDepositOrderStatus(previousStatus) : '',
    normalizeDepositOrderStatus(nextStatus),
    String(note || '').trim().slice(0, 700),
    Number.isInteger(normalizedActorUserId) && normalizedActorUserId > 0
      ? normalizedActorUserId
      : null,
    normalizeFullName(actorName || '').slice(0, 160),
    String(actionType || 'status_update').trim().slice(0, 60) || 'status_update'
  );

  return listDepositOrderStatusHistoryByOrderId(normalizedOrderId).at(-1) || null;
};

const getEffectiveCarActionText = (carId, requestedActionText) => {
  const normalizedActionText = String(requestedActionText || carAvailableStatusText).trim()
    || carAvailableStatusText;

  if (
    normalizedActionText !== carSoldStatusText
    && getActiveDepositOrderForCar(carId)
  ) {
    return carHeldStatusText;
  }

  return normalizedActionText;
};

const upsertCar = (car, existingId = null) => {
  const normalizedCar = normalizeCarPayload(car);
  const actionText = existingId
    ? getEffectiveCarActionText(existingId, normalizedCar.actionText)
    : normalizedCar.actionText;

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
      actionText,
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
    actionText
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

const sanitizeConversation = (row) => row ? ({
  id: Number(row.id),
  userId: Number(row.user_id),
  customerName: row.customer_name || '',
  customerEmail: row.customer_email || '',
  customerPhone: row.customer_phone || '',
  customerAvatarUrl: row.customer_avatar_url || '',
  subject: row.subject || 'Hỗ trợ khách hàng',
  contextType: row.context_type || 'general',
  contextId: row.context_id ? Number(row.context_id) : null,
  assignedUserId: row.assigned_user_id ? Number(row.assigned_user_id) : null,
  assignedUserName: row.assigned_user_name || '',
  status: ['open', 'in_progress', 'closed'].includes(row.status) ? row.status : 'open',
  lastMessage: row.last_message || '',
  lastSenderRole: row.last_sender_role || '',
  unreadCount: Number(row.unread_count || 0),
  lastMessageAt: row.last_message_at || '',
  createdAt: row.created_at || '',
  updatedAt: row.updated_at || '',
}) : null;

const sanitizeConversationMessage = (row) => row ? ({
  id: Number(row.id),
  conversationId: Number(row.conversation_id),
  senderUserId: Number(row.sender_user_id),
  senderRole: row.sender_role || 'customer',
  senderName: row.sender_name || '',
  senderAvatarUrl: row.sender_avatar_url || '',
  content: row.content || '',
  createdAt: row.created_at || '',
}) : null;

const getConversationById = (conversationId) =>
  sanitizeConversation(findConversationByIdStatement.get(conversationId));

const listConversationsByUser = (userId) =>
  listConversationsByUserStatement.all(userId).map(sanitizeConversation);

const listAdminConversations = () =>
  listAdminConversationsStatement.all().map(sanitizeConversation);

const listConversationMessages = (conversationId) =>
  listConversationMessagesStatement.all(conversationId).map(sanitizeConversationMessage);

const createConversationMessage = (conversationId, senderUser, content) => {
  const normalizedContent = String(content || '').trim().slice(0, 2000);
  const senderRole = String(senderUser?.role || 'customer').trim().toLowerCase();
  if (!normalizedContent || !senderUser?.id) return null;
  const result = insertConversationMessageStatement.run(
    conversationId,
    senderUser.id,
    senderRole,
    normalizedContent
  );
  touchConversationAfterMessageStatement.run(senderRole, conversationId);
  return sanitizeConversationMessage(findConversationMessageByIdStatement.get(result.lastInsertRowid));
};

const createConversation = ({ userId, subject = '', contextType = 'general', contextId = null, content = '' } = {}) => {
  const normalizedSubject = String(subject || 'Hỗ trợ khách hàng').trim().slice(0, 160) || 'Hỗ trợ khách hàng';
  const allowedContextTypes = new Set(['general', 'car', 'deposit_order', 'sell_request', 'buy_request']);
  const normalizedContextType = allowedContextTypes.has(String(contextType || '').trim())
    ? String(contextType).trim()
    : 'general';
  const normalizedContextId = Number(contextId || 0);
  const user = getUserById(userId);
  if (!user || user.role !== 'customer') return null;
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = insertConversationStatement.run(
      user.id,
      normalizedSubject,
      normalizedContextType,
      Number.isInteger(normalizedContextId) && normalizedContextId > 0 ? normalizedContextId : null
    );
    const message = createConversationMessage(result.lastInsertRowid, user, content);
    if (!message) throw new Error('Nội dung tin nhắn không hợp lệ.');
    db.exec('COMMIT');
    return { conversation: getConversationById(result.lastInsertRowid), message };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const markConversationRead = (conversationId, audience = 'customer') => {
  (audience === 'staff' ? markConversationStaffReadStatement : markConversationCustomerReadStatement)
    .run(conversationId, conversationId);
  return getConversationById(conversationId);
};

const assignConversation = (conversationId, assignedUserId) => {
  const user = getUserById(assignedUserId);
  if (!user || !employeeRoles.has(user.role)) return null;
  assignConversationStatement.run(user.id, conversationId);
  return getConversationById(conversationId);
};

const updateConversationStatus = (conversationId, status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();
  if (!['open', 'in_progress', 'closed'].includes(normalizedStatus)) return null;
  updateConversationStatusStatement.run(normalizedStatus, conversationId);
  return getConversationById(conversationId);
};

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

const listDepositOrders = () =>
  listDepositOrdersStatement.all().map(sanitizeDepositOrder);

const listDepositOrdersByUser = (userId) =>
  listDepositOrdersByUserStatement.all(userId).map(sanitizeDepositOrder);

const getDepositOrderById = (orderId) =>
  sanitizeDepositOrder(findDepositOrderByIdStatement.get(orderId));

const normalizeSalesKpiType = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return salesKpiTypes.has(normalizedValue) ? normalizedValue : '';
};

const normalizeSalesKpiRewardStatus = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return salesKpiRewardStatuses.has(normalizedValue) ? normalizedValue : 'pending';
};

const listSalesKpiRecords = () =>
  listSalesKpiRecordsStatement.all().map(sanitizeSalesKpiRecord);

const getSalesKpiRecordById = (recordId) =>
  sanitizeSalesKpiRecord(findSalesKpiRecordByIdStatement.get(recordId));

const listAvailableSalesKpiSources = () => ({
  acquisitions: listAvailableAcquisitionKpiSourcesStatement.all().map(sanitizeCarSellRequest),
  sales: listAvailableSaleKpiSourcesStatement.all().map(sanitizeDepositOrder),
  directSales: listAvailableDirectSaleKpiSourcesStatement.all().map(sanitizeDirectCarSale),
});

const createDirectCarSaleRecord = (car, actorUser = null) => {
  const existingSale = sanitizeDirectCarSale(findDirectCarSaleByCarIdStatement.get(car.id));

  if (existingSale) {
    return existingSale;
  }

  const actorUserId = Number(actorUser?.id || 0);
  const actorName = normalizeFullName(actorUser?.fullName || actorUser?.email || '');
  const result = insertDirectCarSaleStatement.run(
    car.id,
    String(car.name || '').trim(),
    String(car.brand || '').trim(),
    Math.max(0, Math.trunc(Number(car.priceValue || 0))),
    Number.isInteger(actorUserId) && actorUserId > 0 ? actorUserId : null,
    actorName.slice(0, 160)
  );

  return sanitizeDirectCarSale(findDirectCarSaleByIdStatement.get(result.lastInsertRowid));
};

const getSalesKpiStats = () => {
  const records = listSalesKpiRecords();
  const activeRecords = records.filter((record) => record.recordStatus === 'active');

  return {
    total: activeRecords.length,
    acquisitionCount: activeRecords.filter((record) => record.kpiType === 'acquisition').length,
    saleCount: activeRecords.filter((record) => ['sale', 'direct_sale'].includes(record.kpiType)).length,
    salesValue: activeRecords
      .filter((record) => ['sale', 'direct_sale'].includes(record.kpiType))
      .reduce((total, record) => total + Number(record.transactionValue || 0), 0),
    rewardAmount: activeRecords.reduce((total, record) => total + Number(record.rewardAmount || 0), 0),
    paidRewardAmount: activeRecords
      .filter((record) => record.rewardStatus === 'paid')
      .reduce((total, record) => total + Number(record.rewardAmount || 0), 0),
  };
};

const normalizeSalesKpiPeriod = (value) => {
  const normalizedValue = String(value || '').trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(normalizedValue) ? normalizedValue : '';
};

const getSalesKpiPeriodControl = (period) => {
  const normalizedPeriod = normalizeSalesKpiPeriod(period);
  if (!normalizedPeriod) return null;
  const row = findSalesKpiPeriodStatement.get(normalizedPeriod);
  return row ? {
    period: row.period,
    status: row.status === 'locked' ? 'locked' : 'open',
    lockedAt: row.locked_at || '',
    lockedByName: row.locked_by_name || '',
    lockNote: row.lock_note || '',
  } : { period: normalizedPeriod, status: 'open', lockedAt: '', lockedByName: '', lockNote: '' };
};

const assertSalesKpiPeriodOpen = (period) => {
  const control = getSalesKpiPeriodControl(period);
  if (control?.status === 'locked') {
    const error = new Error(`Kỳ KPI ${period} đã khóa. Hãy mở khóa kỳ trước khi điều chỉnh.`);
    error.code = 'SALES_KPI_PERIOD_LOCKED';
    throw error;
  }
};

const setSalesKpiPeriodStatus = (period, { status = 'open', note = '', actorUser = null } = {}) => {
  const normalizedPeriod = normalizeSalesKpiPeriod(period);
  const normalizedStatus = status === 'locked' ? 'locked' : 'open';
  if (!normalizedPeriod) {
    const error = new Error('Kỳ KPI phải có định dạng YYYY-MM.');
    error.code = 'SALES_KPI_TARGET_PERIOD_INVALID';
    throw error;
  }
  const actorId = Number(actorUser?.id || 0);
  const actorName = normalizeFullName(actorUser?.fullName || actorUser?.email || '').slice(0, 160);
  upsertSalesKpiPeriodStatement.run(
    normalizedPeriod,
    normalizedStatus,
    normalizedStatus === 'locked' ? new Date().toISOString() : '',
    normalizedStatus === 'locked' && actorId > 0 ? actorId : null,
    normalizedStatus === 'locked' ? actorName : '',
    String(note || '').trim().slice(0, 500)
  );
  return getSalesKpiPeriodControl(normalizedPeriod);
};

const listSalesKpiPolicyHistory = (period) => {
  const normalizedPeriod = normalizeSalesKpiPeriod(period);
  if (!normalizedPeriod) return [];
  return listSalesKpiPolicyHistoryStatement.all(normalizedPeriod).map((row) => ({
    id: Number(row.id || 0), period: row.period || '', saleUserId: Number(row.sale_user_id || 0),
    saleName: row.sale_name || '', kpiRole: row.kpi_role || 'both',
    vehicleTarget: Number(row.vehicle_target || 0), grossProfitTarget: Number(row.gross_profit_target || 0),
    commissionPerSale: Number(row.commission_per_sale || 0),
    acquisitionRewardPerVehicle: Number(row.acquisition_reward_per_vehicle || 0),
    actionType: row.action_type || 'updated', changeNote: row.change_note || '',
    changedByName: row.changed_by_name || '', createdAt: row.created_at || '',
  }));
};

const getSalesKpiVietnamDate = (value = new Date().toISOString()) => {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return '';
  const utcValue = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalizedValue)
    ? normalizedValue
    : `${normalizedValue.replace(' ', 'T')}Z`;
  const parsedDate = new Date(utcValue);
  if (Number.isNaN(parsedDate.getTime())) return normalizedValue.slice(0, 10);
  return new Date(parsedDate.getTime() + (7 * 60 * 60 * 1000)).toISOString().slice(0, 10);
};

const getSalesKpiTarget = (period, saleUserId) =>
  sanitizeSalesKpiTarget(findSalesKpiTargetStatement.get(period, saleUserId));

const listSalesKpiTargets = (period) => {
  const normalizedPeriod = normalizeSalesKpiPeriod(period);
  if (!normalizedPeriod) return [];
  return listSalesKpiTargetsByPeriodStatement.all(normalizedPeriod).map(sanitizeSalesKpiTarget);
};

const upsertSalesKpiTarget = ({
  period,
  saleUserId,
  vehicleTarget = 0,
  grossProfitTarget = 0,
  kpiRole = 'both',
  commissionPerSale = 0,
  acquisitionRewardPerVehicle = 0,
  updatedByUser = null,
} = {}) => {
  const normalizedPeriod = normalizeSalesKpiPeriod(period);
  const normalizedSaleUserId = Number(saleUserId || 0);
  const saleUser = getUserById(normalizedSaleUserId);

  if (!normalizedPeriod) {
    const error = new Error('Kỳ mục tiêu phải có định dạng YYYY-MM.');
    error.code = 'SALES_KPI_TARGET_PERIOD_INVALID';
    throw error;
  }
  if (!saleUser || saleUser.role !== 'staff') {
    const error = new Error('Nhân viên nhận mục tiêu không hợp lệ.');
    error.code = 'SALES_KPI_SALE_INVALID';
    throw error;
  }

  const normalizeTargetValue = (value) => {
    const numberValue = Number(value || 0);
    return Number.isFinite(numberValue) && numberValue > 0 ? Math.trunc(numberValue) : 0;
  };
  const actorId = Number(updatedByUser?.id || 0);
  const actorName = normalizeFullName(updatedByUser?.fullName || updatedByUser?.email || '').slice(0, 160);
  const normalizedKpiRole = String(kpiRole || '').trim().toLowerCase();
  if (!salesKpiRoles.has(normalizedKpiRole)) {
    const error = new Error('Vai trò KPI của nhân viên không hợp lệ.');
    error.code = 'SALES_KPI_TARGET_ROLE_INVALID';
    throw error;
  }
  const appliesToSales = ['sales_only', 'both'].includes(normalizedKpiRole);
  const appliesToAcquisition = ['acquisition_only', 'both'].includes(normalizedKpiRole);
  if (appliesToSales && normalizeTargetValue(commissionPerSale) <= 0) {
    const error = new Error('Vai trò bán xe phải có mức hoa hồng cố định trên mỗi xe lớn hơn 0.');
    error.code = 'SALES_KPI_COMMISSION_MISSING';
    throw error;
  }
  if (appliesToAcquisition && normalizeTargetValue(acquisitionRewardPerVehicle) <= 0) {
    const error = new Error('Vai trò nhập xe phải có mức thưởng cố định trên mỗi xe lớn hơn 0.');
    error.code = 'SALES_KPI_ACQUISITION_REWARD_MISSING';
    throw error;
  }

  assertSalesKpiPeriodOpen(normalizedPeriod);
  const existingTarget = getSalesKpiTarget(normalizedPeriod, normalizedSaleUserId);

  upsertSalesKpiTargetStatement.run(
    normalizedPeriod,
    normalizedSaleUserId,
    appliesToSales ? normalizeTargetValue(vehicleTarget) : 0,
    0,
    appliesToAcquisition ? normalizeTargetValue(grossProfitTarget) : 0,
    normalizedKpiRole,
    appliesToSales ? normalizeTargetValue(commissionPerSale) : 0,
    appliesToAcquisition ? normalizeTargetValue(acquisitionRewardPerVehicle) : 0,
    Number.isInteger(actorId) && actorId > 0 ? actorId : null,
    actorName
  );

  insertSalesKpiPolicyHistoryStatement.run(
    normalizedPeriod,
    normalizedSaleUserId,
    normalizedKpiRole,
    appliesToSales ? normalizeTargetValue(vehicleTarget) : 0,
    appliesToAcquisition ? normalizeTargetValue(grossProfitTarget) : 0,
    appliesToSales ? normalizeTargetValue(commissionPerSale) : 0,
    appliesToAcquisition ? normalizeTargetValue(acquisitionRewardPerVehicle) : 0,
    existingTarget ? 'updated' : 'created',
    existingTarget ? 'Cập nhật chính sách KPI theo tháng.' : 'Tạo chính sách KPI theo tháng.',
    Number.isInteger(actorId) && actorId > 0 ? actorId : null,
    actorName
  );

  return sanitizeSalesKpiTarget({
    ...findSalesKpiTargetStatement.get(normalizedPeriod, normalizedSaleUserId),
    current_sale_name: saleUser.fullName,
    sale_email: saleUser.email,
    sale_avatar_url: saleUser.avatarUrl,
  });
};

const getSalesKpiReport = ({
  from = '',
  to = '',
  saleUserId = 0,
  kpiType = '',
  rewardStatus = '',
  recordStatus = 'active',
  targetPeriod = '',
} = {}) => {
  const normalizedFrom = /^\d{4}-\d{2}-\d{2}$/.test(String(from || '')) ? String(from) : '';
  const normalizedTo = /^\d{4}-\d{2}-\d{2}$/.test(String(to || '')) ? String(to) : '';
  const normalizedSaleUserId = Number(saleUserId || 0);
  const normalizedType = normalizeSalesKpiType(kpiType);
  const normalizedRewardStatus = salesKpiRewardStatuses.has(String(rewardStatus || '')) ? String(rewardStatus) : '';
  const normalizedRecordStatus = ['active', 'cancelled'].includes(String(recordStatus || ''))
    ? String(recordStatus)
    : '';
  const period = normalizeSalesKpiPeriod(targetPeriod)
    || (normalizedFrom ? normalizedFrom.slice(0, 7) : new Date().toISOString().slice(0, 7));
  const allRecords = listSalesKpiRecords();
  const activeRecords = allRecords.filter((record) => record.recordStatus === 'active');
  const isSalesRecord = (record) => ['sale', 'direct_sale'].includes(record.kpiType);
  const isWithinRange = (record, rangeFrom, rangeTo) => {
    const recordDate = record.businessDate || getSalesKpiVietnamDate(record.recordedAt);
    return (!rangeFrom || recordDate >= rangeFrom) && (!rangeTo || recordDate <= rangeTo);
  };
  const matchesDimensionFilters = (record) => (
    (!normalizedSaleUserId || record.saleUserId === normalizedSaleUserId)
    && (!normalizedType || record.kpiType === normalizedType)
    && (!normalizedRewardStatus || record.rewardStatus === normalizedRewardStatus)
  );
  const records = allRecords.filter((record) => (
    matchesDimensionFilters(record)
    && (!normalizedRecordStatus || record.recordStatus === normalizedRecordStatus)
    && isWithinRange(record, normalizedFrom, normalizedTo)
  ));
  const reportRecords = records.map((record) => {
    if (record.kpiType !== 'acquisition' || !record.carId) return record;
    const saleRecord = activeRecords.find((item) => (
      isSalesRecord(item) && item.carId === record.carId
    ));
    const purchasePrice = Number(record.purchasePriceValue || record.transactionValue || 0);
    const salePrice = Number(saleRecord?.salePriceValue || saleRecord?.transactionValue || 0);
    return {
      ...record,
      acquisitionProfitStatus: saleRecord && purchasePrice > 0 && salePrice > 0 ? 'realized' : 'pending_sale',
      realizedAcquisitionProfit: saleRecord && purchasePrice > 0 && salePrice > 0
        ? salePrice - purchasePrice
        : 0,
    };
  });

  const getSalesRecordsForRange = (rangeFrom, rangeTo, employeeId = normalizedSaleUserId, ignoreType = false) =>
    activeRecords.filter((record) => (
      isSalesRecord(record)
      && (!employeeId || record.saleUserId === employeeId)
      && (ignoreType || !normalizedType || record.kpiType === normalizedType)
      && isWithinRange(record, rangeFrom, rangeTo)
    ));

  const summarize = (rangeFrom, rangeTo, employeeId = normalizedSaleUserId, { ignoreType = false } = {}) => {
    const sourceSales = getSalesRecordsForRange(rangeFrom, rangeTo, employeeId, ignoreType);
    const sourceAcquisitions = activeRecords.filter((record) => (
      record.kpiType === 'acquisition'
      && (!employeeId || record.saleUserId === employeeId)
      && (ignoreType || !normalizedType || normalizedType === 'acquisition')
      && isWithinRange(record, rangeFrom, rangeTo)
    ));
    const eligibleAcquisitions = activeRecords.filter((record) => (
      record.kpiType === 'acquisition'
      && (!employeeId || record.saleUserId === employeeId)
      && (ignoreType || !normalizedType || normalizedType === 'acquisition')
    ));
    const realizedAcquisitions = eligibleAcquisitions.flatMap((acquisition) => {
      const saleRecord = activeRecords.find((record) => (
        isSalesRecord(record)
        && record.carId
        && record.carId === acquisition.carId
        && isWithinRange(record, rangeFrom, rangeTo)
      ));
      if (!saleRecord) return [];
      const purchasePrice = Number(acquisition.purchasePriceValue || acquisition.transactionValue || 0);
      const salePrice = Number(saleRecord.salePriceValue || saleRecord.transactionValue || 0);
      return [{ acquisition, saleRecord, purchasePrice, salePrice }];
    });
    const completeProfitItems = realizedAcquisitions.filter((item) => item.purchasePrice > 0 && item.salePrice > 0);
    const acquisitionProfit = completeProfitItems.reduce(
      (sum, item) => sum + item.salePrice - item.purchasePrice,
      0
    );
    const acquisitionRevenue = completeProfitItems.reduce((sum, item) => sum + item.salePrice, 0);
    const acquisitionRewardAmount = sourceAcquisitions.reduce(
      (sum, record) => sum + Number(record.rewardAmount || 0),
      0
    );
    const pendingAcquisitionRewardAmount = sourceAcquisitions
      .filter((record) => record.rewardStatus === 'pending')
      .reduce((sum, record) => sum + Number(record.rewardAmount || 0), 0);
    const soldCarIdsWithAcquisition = new Set(
      activeRecords.filter((record) => record.kpiType === 'acquisition' && Number(record.purchasePriceValue || 0) > 0)
        .map((record) => record.carId)
        .filter(Boolean)
    );
    const missingPurchaseCostCount = sourceSales.filter((record) => (
      !record.carId || !soldCarIdsWithAcquisition.has(record.carId)
    )).length;
    const revenue = sourceSales.reduce(
      (sum, record) => sum + Number(record.salePriceValue || record.transactionValue || 0),
      0
    );
    return {
      total: sourceAcquisitions.length + sourceSales.length,
      acquisitionCount: sourceAcquisitions.length,
      pendingAcquisitionCount: sourceAcquisitions.filter((acquisition) => !activeRecords.some((record) => (
        isSalesRecord(record) && record.carId === acquisition.carId
      ))).length,
      backlogAcquisitionCount: eligibleAcquisitions.filter((acquisition) => !activeRecords.some((record) => (
        isSalesRecord(record) && record.carId === acquisition.carId
      ))).length,
      realizedAcquisitionCount: completeProfitItems.length,
      vehicleSales: sourceSales.length,
      revenue,
      purchaseCost: completeProfitItems.reduce((sum, item) => sum + item.purchasePrice, 0),
      acquisitionProfit,
      grossProfit: acquisitionProfit,
      grossMargin: acquisitionRevenue > 0 ? (acquisitionProfit / acquisitionRevenue) * 100 : 0,
      missingPurchaseCostCount,
      salesCommissionAmount: sourceSales.reduce((sum, record) => sum + Number(record.rewardAmount || 0), 0),
      pendingSalesCommissionAmount: sourceSales.filter((record) => record.rewardStatus === 'pending')
        .reduce((sum, record) => sum + Number(record.rewardAmount || 0), 0),
      acquisitionRewardAmount,
      pendingAcquisitionRewardAmount,
      rewardAmount: sourceSales.reduce((sum, record) => sum + Number(record.rewardAmount || 0), 0) + acquisitionRewardAmount,
      pendingRewardAmount: sourceSales.filter((record) => record.rewardStatus === 'pending')
        .reduce((sum, record) => sum + Number(record.rewardAmount || 0), 0) + pendingAcquisitionRewardAmount,
      approvedRewardAmount: [...sourceSales, ...sourceAcquisitions]
        .filter((record) => record.rewardStatus === 'approved')
        .reduce((sum, record) => sum + Number(record.rewardAmount || 0), 0),
      paidRewardAmount: [...sourceSales, ...sourceAcquisitions]
        .filter((record) => record.rewardStatus === 'paid')
        .reduce((sum, record) => sum + Number(record.rewardAmount || 0), 0),
    };
  };

  const summary = summarize(normalizedFrom, normalizedTo);
  let previousSummary = null;
  if (normalizedFrom && normalizedTo) {
    const fromDate = new Date(`${normalizedFrom}T00:00:00Z`);
    const toDate = new Date(`${normalizedTo}T00:00:00Z`);
    const rangeDays = Math.max(1, Math.round((toDate - fromDate) / 86400000) + 1);
    const previousToDate = new Date(fromDate.getTime() - 86400000);
    const previousFromDate = new Date(previousToDate.getTime() - ((rangeDays - 1) * 86400000));
    const previousFrom = previousFromDate.toISOString().slice(0, 10);
    const previousTo = previousToDate.toISOString().slice(0, 10);
    previousSummary = { ...summarize(previousFrom, previousTo), from: previousFrom, to: previousTo };
  }

  const targetMap = new Map(listSalesKpiTargets(period).map((target) => [target.saleUserId, target]));
  const salesEmployees = listUsers().filter((user) => user.role === 'staff');
  const rankings = salesEmployees
    .filter((user) => !normalizedSaleUserId || user.id === normalizedSaleUserId)
    .map((user) => {
      const employeeSummary = summarize(normalizedFrom, normalizedTo, user.id, { ignoreType: true });
      const target = targetMap.get(user.id) || {
        period,
        saleUserId: user.id,
        saleName: user.fullName,
        saleEmail: user.email,
        saleAvatarUrl: user.avatarUrl,
        vehicleTarget: 0,
        revenueTarget: 0,
        grossProfitTarget: 0,
        kpiRole: 'both',
        commissionPerSale: 0,
        acquisitionRewardPerVehicle: 0,
      };
      const appliesToSales = ['sales_only', 'both'].includes(target.kpiRole);
      const appliesToAcquisition = ['acquisition_only', 'both'].includes(target.kpiRole);
      const ratios = [
        appliesToSales && target.vehicleTarget > 0
          ? (employeeSummary.vehicleSales / target.vehicleTarget) * 100
          : null,
        appliesToAcquisition && target.grossProfitTarget > 0
          ? (employeeSummary.acquisitionProfit / target.grossProfitTarget) * 100
          : null,
      ].filter((value) => value !== null);
      return {
        saleUserId: user.id,
        saleName: user.fullName,
        saleEmail: user.email,
        saleAvatarUrl: user.avatarUrl,
        ...employeeSummary,
        target,
        salesAchievement: appliesToSales && target.vehicleTarget > 0
          ? (employeeSummary.vehicleSales / target.vehicleTarget) * 100
          : null,
        acquisitionProfitAchievement: appliesToAcquisition && target.grossProfitTarget > 0
          ? (employeeSummary.acquisitionProfit / target.grossProfitTarget) * 100
          : null,
        overallAchievement: ratios.length ? ratios.reduce((sum, value) => sum + value, 0) / ratios.length : null,
      };
    })
    .sort((left, right) => (
      Number(right.overallAchievement ?? -1) - Number(left.overallAchievement ?? -1)
      || right.revenue - left.revenue
      || left.saleName.localeCompare(right.saleName, 'vi')
    ));

  const salesRankings = rankings
    .filter((item) => ['sales_only', 'both'].includes(item.target.kpiRole))
    .sort((left, right) => (
      Number(right.salesAchievement ?? -1) - Number(left.salesAchievement ?? -1)
      || right.vehicleSales - left.vehicleSales
      || right.revenue - left.revenue
    ));
  const acquisitionRankings = rankings
    .filter((item) => ['acquisition_only', 'both'].includes(item.target.kpiRole))
    .sort((left, right) => (
      Number(right.acquisitionProfitAchievement ?? -1) - Number(left.acquisitionProfitAchievement ?? -1)
      || right.acquisitionProfit - left.acquisitionProfit
      || right.acquisitionCount - left.acquisitionCount
    ));
  const combinedRankings = rankings
    .filter((item) => item.target.kpiRole === 'both')
    .sort((left, right) => (
      Number(right.overallAchievement ?? -1) - Number(left.overallAchievement ?? -1)
      || right.revenue - left.revenue
    ));

  const classifyAchievement = (achievement) => {
    if (achievement === null || achievement === undefined) return { code: 'unrated', label: 'Chưa xếp loại' };
    if (achievement >= 120) return { code: 'excellent', label: 'Xuất sắc' };
    if (achievement >= 100) return { code: 'good', label: 'Tốt' };
    if (achievement >= 80) return { code: 'passed', label: 'Đạt' };
    if (achievement >= 60) return { code: 'improvement', label: 'Cần cải thiện' };
    return { code: 'failed', label: 'Không đạt' };
  };
  const [periodYear, periodMonth] = period.split('-').map(Number);
  const periodFrom = `${period}-01`;
  const periodTo = new Date(Date.UTC(periodYear, periodMonth, 0)).toISOString().slice(0, 10);
  const periodSummaryRows = salesEmployees
    .filter((user) => !normalizedSaleUserId || user.id === normalizedSaleUserId)
    .map((user) => {
      const target = targetMap.get(user.id) || {
        kpiRole: 'both', vehicleTarget: 0, grossProfitTarget: 0,
      };
      const employeeSummary = summarize(periodFrom, periodTo, user.id, { ignoreType: true });
      const appliesToSales = ['sales_only', 'both'].includes(target.kpiRole);
      const appliesToAcquisition = ['acquisition_only', 'both'].includes(target.kpiRole);
      const salesAchievement = appliesToSales && target.vehicleTarget > 0
        ? (employeeSummary.vehicleSales / target.vehicleTarget) * 100 : null;
      const acquisitionAchievement = appliesToAcquisition && target.grossProfitTarget > 0
        ? (employeeSummary.acquisitionProfit / target.grossProfitTarget) * 100 : null;
      const ratios = [salesAchievement, acquisitionAchievement].filter((value) => value !== null);
      const overallAchievement = ratios.length
        ? ratios.reduce((sum, value) => sum + value, 0) / ratios.length : null;
      return {
        saleUserId: user.id,
        saleName: user.fullName,
        saleEmail: user.email,
        kpiRole: target.kpiRole,
        vehicleTarget: target.vehicleTarget,
        vehicleSales: employeeSummary.vehicleSales,
        grossProfitTarget: target.grossProfitTarget,
        acquisitionProfit: employeeSummary.acquisitionProfit,
        salesAchievement,
        acquisitionAchievement,
        overallAchievement,
        classification: classifyAchievement(overallAchievement),
        rewardAmount: employeeSummary.rewardAmount,
        paidRewardAmount: employeeSummary.paidRewardAmount,
        outstandingRewardAmount: Math.max(0, employeeSummary.rewardAmount - employeeSummary.paidRewardAmount),
      };
    })
    .sort((left, right) => Number(right.overallAchievement ?? -1) - Number(left.overallAchievement ?? -1));
  const periodSummary = {
    period,
    from: periodFrom,
    to: periodTo,
    periodControl: getSalesKpiPeriodControl(period),
    rows: periodSummaryRows,
    totals: periodSummaryRows.reduce((totals, row) => ({
      employeeCount: totals.employeeCount + 1,
      vehicleSales: totals.vehicleSales + row.vehicleSales,
      acquisitionProfit: totals.acquisitionProfit + row.acquisitionProfit,
      rewardAmount: totals.rewardAmount + row.rewardAmount,
      paidRewardAmount: totals.paidRewardAmount + row.paidRewardAmount,
      outstandingRewardAmount: totals.outstandingRewardAmount + row.outstandingRewardAmount,
    }), { employeeCount: 0, vehicleSales: 0, acquisitionProfit: 0, rewardAmount: 0, paidRewardAmount: 0, outstandingRewardAmount: 0 }),
  };

  const sumTargets = (items, field) => items.reduce(
    (sum, item) => sum + Number(item.target?.[field] || 0),
    0
  );
  const salesVehicleTarget = sumTargets(salesRankings, 'vehicleTarget');
  const acquisitionSpreadTarget = sumTargets(acquisitionRankings, 'grossProfitTarget');
  const roleReports = {
    sales: {
      vehicleSales: summary.vehicleSales,
      vehicleTarget: salesVehicleTarget,
      achievement: salesVehicleTarget > 0 ? (summary.vehicleSales / salesVehicleTarget) * 100 : null,
      revenue: summary.revenue,
      commissionAmount: summary.salesCommissionAmount,
      pendingCommissionAmount: summary.pendingSalesCommissionAmount,
    },
    acquisition: {
      acquisitionCount: summary.acquisitionCount,
      pendingAcquisitionCount: summary.pendingAcquisitionCount,
      realizedAcquisitionCount: summary.realizedAcquisitionCount,
      purchaseSaleSpread: summary.acquisitionProfit,
      acquisitionRewardAmount: summary.acquisitionRewardAmount,
      pendingAcquisitionRewardAmount: summary.pendingAcquisitionRewardAmount,
      spreadTarget: acquisitionSpreadTarget,
      achievement: acquisitionSpreadTarget > 0
        ? (summary.acquisitionProfit / acquisitionSpreadTarget) * 100
        : null,
    },
  };

  const salesRecords = getSalesRecordsForRange(normalizedFrom, normalizedTo);
  const acquisitionCarIds = new Set(
    activeRecords.filter((record) => (
      record.kpiType === 'acquisition' && record.carId && Number(record.purchasePriceValue || 0) > 0
    )).map((record) => record.carId)
  );
  const selectedEmployees = salesEmployees.filter((user) => (
    !normalizedSaleUserId || user.id === normalizedSaleUserId
  ));
  const alerts = {
    missingAcquisitionLinks: salesRecords
      .filter((record) => !record.carId || !acquisitionCarIds.has(record.carId))
      .map((record) => ({
        recordId: record.id,
        carId: record.carId,
        carName: record.carName,
        carBrand: record.carBrand,
        sourceCode: record.sourceCode,
        saleName: record.saleName,
        salePriceValue: record.salePriceValue || record.transactionValue,
        recordedAt: record.recordedAt,
      })),
    pendingAcquisitions: reportRecords
      .filter((record) => record.kpiType === 'acquisition' && record.recordStatus === 'active' && record.acquisitionProfitStatus === 'pending_sale')
      .map((record) => ({
        recordId: record.id,
        carId: record.carId,
        carName: record.carName,
        carBrand: record.carBrand,
        sourceCode: record.sourceCode,
        acquisitionEmployeeName: record.saleName,
        purchasePriceValue: record.purchasePriceValue || record.transactionValue,
        recordedAt: record.recordedAt,
      })),
    unconfiguredEmployees: selectedEmployees
      .filter((user) => !targetMap.has(user.id))
      .map((user) => ({ saleUserId: user.id, saleName: user.fullName, saleEmail: user.email })),
    invalidCommissionPolicies: rankings
      .filter((item) => (
        targetMap.has(item.saleUserId)
        &&
        ['sales_only', 'both'].includes(item.target.kpiRole)
        && Number(item.target.commissionPerSale || 0) <= 0
      ))
      .map((item) => ({ saleUserId: item.saleUserId, saleName: item.saleName })),
    invalidAcquisitionRewardPolicies: rankings
      .filter((item) => (
        targetMap.has(item.saleUserId)
        && ['acquisition_only', 'both'].includes(item.target.kpiRole)
        && Number(item.target.acquisitionRewardPerVehicle || 0) <= 0
      ))
      .map((item) => ({ saleUserId: item.saleUserId, saleName: item.saleName })),
  };
  const trendMap = new Map();
  salesRecords.forEach((record) => {
    const key = record.businessDate || getSalesKpiVietnamDate(record.recordedAt) || 'Không rõ';
    const current = trendMap.get(key) || { label: key, vehicleSales: 0, revenue: 0 };
    current.vehicleSales += 1;
    current.revenue += Number(record.salePriceValue || record.transactionValue || 0);
    trendMap.set(key, current);
  });

  return {
    filters: {
      from: normalizedFrom,
      to: normalizedTo,
      saleUserId: normalizedSaleUserId || null,
      kpiType: normalizedType,
      rewardStatus: normalizedRewardStatus,
      recordStatus: normalizedRecordStatus,
      targetPeriod: period,
    },
    records: reportRecords,
    summary,
    previousSummary,
    rankings,
    salesRankings,
    acquisitionRankings,
    combinedRankings,
    periodSummary,
    roleReports,
    alerts,
    periodControl: getSalesKpiPeriodControl(period),
    policyHistory: listSalesKpiPolicyHistory(period),
    entryPeriod: getSalesKpiVietnamDate().slice(0, 7),
    entryPolicies: listSalesKpiTargets(getSalesKpiVietnamDate().slice(0, 7)),
    trend: [...trendMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
  };
};

const getSalesKpiSourceSnapshot = (kpiType, sourceId) => {
  if (kpiType === 'acquisition') {
    const request = getCarSellRequestById(sourceId);

    if (
      !request
      || request.status !== 'approved'
      || !request.approvedCarId
      || Number(request.customerDealPriceValue || 0) <= 0
    ) {
      return null;
    }

    return {
      sourceCode: request.code,
      carId: request.approvedCarId,
      carName: request.name || '',
      carBrand: request.brand || '',
      transactionValue: Number(request.customerDealPriceValue || 0),
      purchasePriceValue: Number(request.customerDealPriceValue || 0),
      salePriceValue: Number(request.finalPriceValue || 0),
      businessDate: getSalesKpiVietnamDate(request.updatedAt),
    };
  }

  if (kpiType === 'direct_sale') {
    const directSale = sanitizeDirectCarSale(findDirectCarSaleByIdStatement.get(sourceId));

    if (!directSale || !directSale.carId) {
      return null;
    }

    const acquisitionRequest = sanitizeCarSellRequest(
      findApprovedCarSellRequestByCarIdStatement.get(directSale.carId)
    );

    return {
      sourceCode: directSale.code,
      carId: directSale.carId,
      carName: directSale.carName,
      carBrand: directSale.carBrand,
      transactionValue: Number(directSale.salePriceValue || 0),
      purchasePriceValue: Number(acquisitionRequest?.customerDealPriceValue || 0),
      salePriceValue: Number(directSale.salePriceValue || 0),
      businessDate: getSalesKpiVietnamDate(directSale.soldAt),
    };
  }

  const order = getDepositOrderById(sourceId);

  if (!order || order.status !== 'completed' || !order.carId) {
    return null;
  }

  const acquisitionRequest = sanitizeCarSellRequest(
    findApprovedCarSellRequestByCarIdStatement.get(order.carId)
  );

  return {
    sourceCode: order.code,
    carId: order.carId,
    carName: order.carName || '',
    carBrand: order.carBrand || '',
    transactionValue: Number(order.carPriceValue || 0),
    purchasePriceValue: Number(acquisitionRequest?.customerDealPriceValue || 0),
    salePriceValue: Number(order.carPriceValue || 0),
    businessDate: getSalesKpiVietnamDate(order.updatedAt),
  };
};

const getSalesKpiPolicyForEmployee = (saleUserId, recordedAt = new Date().toISOString()) => {
  const period = getSalesKpiVietnamDate(recordedAt).slice(0, 7);
  return getSalesKpiTarget(period, saleUserId);
};

const validateSalesKpiRoleForType = (policy, kpiType) => {
  if (!policy) {
    const error = new Error('Nhân viên chưa được cấu hình vai trò và chính sách KPI trong kỳ này.');
    error.code = 'SALES_KPI_POLICY_MISSING';
    throw error;
  }
  const role = policy?.kpiRole || 'both';
  const isEligible = kpiType === 'acquisition'
    ? ['acquisition_only', 'both'].includes(role)
    : ['sales_only', 'both'].includes(role);
  if (!isEligible) {
    const error = new Error(
      kpiType === 'acquisition'
        ? 'Nhân viên này không được cấu hình vai trò nhập xe trong kỳ KPI.'
        : 'Nhân viên này không được cấu hình vai trò bán xe trong kỳ KPI.'
    );
    error.code = 'SALES_KPI_ROLE_INVALID';
    throw error;
  }
  if (kpiType !== 'acquisition' && Number(policy.commissionPerSale || 0) <= 0) {
    const error = new Error('Vui lòng cấu hình hoa hồng cố định trên mỗi xe trước khi ghi nhận KPI bán xe.');
    error.code = 'SALES_KPI_COMMISSION_MISSING';
    throw error;
  }
  if (kpiType === 'acquisition' && Number(policy.acquisitionRewardPerVehicle || 0) <= 0) {
    const error = new Error('Vui lòng cấu hình thưởng cố định trên mỗi xe nhập trước khi ghi nhận KPI nhập xe.');
    error.code = 'SALES_KPI_ACQUISITION_REWARD_MISSING';
    throw error;
  }
};

const createSalesKpiRecord = ({
  kpiType,
  sourceId,
  saleUserId,
  rewardAmount = 0,
  rewardStatus = 'pending',
  note = '',
  recordedByUser = null,
  businessDate = '',
  creationMode = 'manual',
} = {}) => {
  const normalizedType = normalizeSalesKpiType(kpiType);
  const normalizedSourceId = Number(sourceId || 0);
  const normalizedSaleUserId = Number(saleUserId || 0);

  if (!normalizedType || !Number.isInteger(normalizedSourceId) || normalizedSourceId <= 0) {
    const error = new Error('Nguồn giao dịch KPI không hợp lệ.');
    error.code = 'SALES_KPI_SOURCE_INVALID';
    throw error;
  }

  const saleUser = getUserById(normalizedSaleUserId);

  if (!saleUser || saleUser.role !== 'staff') {
    const error = new Error('Vui lòng chọn tài khoản nhân viên sale hợp lệ.');
    error.code = 'SALES_KPI_SALE_INVALID';
    throw error;
  }

  const source = getSalesKpiSourceSnapshot(normalizedType, normalizedSourceId);

  if (!source) {
    const error = new Error('Giao dịch này chưa đủ điều kiện ghi nhận KPI.');
    error.code = 'SALES_KPI_SOURCE_NOT_COMPLETED';
    throw error;
  }

  const normalizedBusinessDate = /^\d{4}-\d{2}-\d{2}$/.test(String(businessDate || ''))
    ? String(businessDate)
    : (source.businessDate || getSalesKpiVietnamDate());
  const policyPeriod = normalizedBusinessDate.slice(0, 7);
  assertSalesKpiPeriodOpen(policyPeriod);
  const policy = getSalesKpiPolicyForEmployee(saleUser.id, `${normalizedBusinessDate}T12:00:00Z`);
  validateSalesKpiRoleForType(policy, normalizedType);
  const safeRewardAmount = normalizedType === 'acquisition'
    ? Math.max(0, Math.trunc(Number(policy.acquisitionRewardPerVehicle || 0)))
    : Math.max(0, Math.trunc(Number(policy.commissionPerSale || 0)));
  const recorderId = Number(recordedByUser?.id || 0);
  const recorderName = normalizeFullName(recordedByUser?.fullName || recordedByUser?.email || '');

  try {
    const result = insertSalesKpiRecordStatement.run(
      normalizedType,
      normalizedSourceId,
      saleUser.id,
      saleUser.fullName,
      source.carId,
      source.carName,
      source.carBrand,
      source.sourceCode,
      Math.trunc(source.transactionValue || 0),
      Math.trunc(source.purchasePriceValue || 0),
      Math.trunc(source.salePriceValue || 0),
      safeRewardAmount,
      'pending',
      String(note || '').trim().slice(0, 500),
      Number.isInteger(recorderId) && recorderId > 0 ? recorderId : null,
      recorderName.slice(0, 160),
      normalizedBusinessDate,
      policyPeriod,
      creationMode === 'automatic' ? 'automatic' : 'manual'
    );
    return getSalesKpiRecordById(result.lastInsertRowid);
  } catch (error) {
    if (String(error.message || '').includes('UNIQUE constraint failed: sales_kpi_records.kpi_type, sales_kpi_records.source_id')) {
      error.code = 'SALES_KPI_DUPLICATED';
    }
    throw error;
  }
};

const updateSalesKpiRecord = (recordId, {
  saleUserId,
  rewardAmount = 0,
  rewardStatus = 'pending',
  note = '',
} = {}) => {
  const existingRecord = getSalesKpiRecordById(recordId);

  if (!existingRecord || existingRecord.recordStatus !== 'active') {
    return null;
  }

  assertSalesKpiPeriodOpen(existingRecord.policyPeriod || existingRecord.businessDate.slice(0, 7));

  const saleUser = getUserById(Number(saleUserId || 0));

  if (!saleUser || saleUser.role !== 'staff') {
    const error = new Error('Vui lòng chọn tài khoản nhân viên sale hợp lệ.');
    error.code = 'SALES_KPI_SALE_INVALID';
    throw error;
  }

  const policy = getSalesKpiPolicyForEmployee(saleUser.id, existingRecord.recordedAt);
  validateSalesKpiRoleForType(policy, existingRecord.kpiType);
  const safeRewardAmount = existingRecord.kpiType === 'acquisition'
    ? Math.max(0, Math.trunc(Number(policy.acquisitionRewardPerVehicle || 0)))
    : Math.max(0, Math.trunc(Number(policy.commissionPerSale || 0)));
  updateSalesKpiRecordStatement.run(
    saleUser.id,
    saleUser.fullName,
    safeRewardAmount,
    String(note || '').trim().slice(0, 500),
    recordId
  );
  return getSalesKpiRecordById(recordId);
};

const cancelSalesKpiRecord = (recordId, { cancellationNote = '', cancelledByUser = null } = {}) => {
  const existingRecord = getSalesKpiRecordById(recordId);

  if (!existingRecord || existingRecord.recordStatus !== 'active') {
    return null;
  }

  assertSalesKpiPeriodOpen(existingRecord.policyPeriod || existingRecord.businessDate.slice(0, 7));

  if (existingRecord.kpiType === 'acquisition' && existingRecord.rewardStatus === 'paid' && Number(existingRecord.rewardAmount || 0) > 0) {
    const error = new Error('Thưởng nhập xe đã được chi. Hãy chuyển trạng thái thưởng về chờ chi trước khi hủy KPI liên quan.');
    error.code = 'SALES_KPI_ACQUISITION_REWARD_PAID';
    throw error;
  }

  const cancellerId = Number(cancelledByUser?.id || 0);
  const cancellerName = normalizeFullName(cancelledByUser?.fullName || cancelledByUser?.email || '');
  const normalizedNote = String(cancellationNote || '').trim().slice(0, 500);

  if (normalizedNote.length < 3) {
    const error = new Error('Vui lòng nhập lý do hủy ghi nhận KPI.');
    error.code = 'SALES_KPI_CANCELLATION_NOTE_REQUIRED';
    throw error;
  }

  cancelSalesKpiRecordStatement.run(
    Number.isInteger(cancellerId) && cancellerId > 0 ? cancellerId : null,
    cancellerName.slice(0, 160),
    normalizedNote,
    recordId
  );
  return getSalesKpiRecordById(recordId);
};

const updateSalesKpiRewardWorkflow = (recordId, {
  status = '', payoutReference = '', note = '', actorUser = null,
} = {}) => {
  const record = getSalesKpiRecordById(recordId);
  if (!record || record.recordStatus !== 'active') return null;
  const nextStatus = String(status || '').trim().toLowerCase();
  const allowed = new Map([
    ['pending', new Set(['approved'])],
    ['approved', new Set(['paid', 'pending'])],
    ['paid', new Set()],
  ]);
  if (!allowed.get(record.rewardStatus || 'pending')?.has(nextStatus)) {
    const error = new Error('Không thể chuyển trạng thái chi thưởng theo luồng này.');
    error.code = 'SALES_KPI_REWARD_TRANSITION_INVALID';
    throw error;
  }
  const reference = String(payoutReference || '').trim().slice(0, 120);
  if (nextStatus === 'paid' && reference.length < 3) {
    const error = new Error('Vui lòng nhập mã phiếu chi hoặc mã giao dịch khi xác nhận đã chi.');
    error.code = 'SALES_KPI_PAYOUT_REFERENCE_REQUIRED';
    throw error;
  }
  const actorId = Number(actorUser?.id || 0);
  const actorName = normalizeFullName(actorUser?.fullName || actorUser?.email || '').slice(0, 160);
  const now = new Date().toISOString();
  updateSalesKpiRewardWorkflowStatement.run(
    nextStatus,
    nextStatus === 'approved' ? now : (nextStatus === 'pending' ? '' : record.rewardApprovedAt),
    nextStatus === 'approved' && actorId > 0 ? actorId : (nextStatus === 'pending' ? null : record.rewardApprovedByUserId),
    nextStatus === 'approved' ? actorName : (nextStatus === 'pending' ? '' : record.rewardApprovedByName),
    nextStatus === 'paid' ? now : '',
    nextStatus === 'paid' && actorId > 0 ? actorId : null,
    nextStatus === 'paid' ? actorName : '',
    nextStatus === 'paid' ? reference : '',
    recordId
  );
  insertSalesKpiRewardHistoryStatement.run(
    recordId, record.rewardStatus, nextStatus, reference,
    String(note || '').trim().slice(0, 500),
    actorId > 0 ? actorId : null, actorName
  );
  return getSalesKpiRecordById(recordId);
};

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

    const updatedAppointment = getTestDriveAppointmentById(appointmentId);
    createTestDriveUserNotification(updatedAppointment);

    return updatedAppointment;
  }

  updateTestDriveAppointmentStatusStatement.run(
    normalizedStatus,
    String(statusNote || '').trim(),
    appointmentId
  );

  const updatedAppointment = getTestDriveAppointmentById(appointmentId);
  createTestDriveUserNotification(updatedAppointment);

  return updatedAppointment;
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

  const createdRequest = getConsultationRequestById(result.lastInsertRowid);
  createAdminNotificationForConsultation(createdRequest);

  return createdRequest;
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

const createDepositOrder = (order) => {
  const normalizedOrder = normalizeDepositOrderPayload(order);

  expireOverdueDepositOrders();

  db.exec('BEGIN IMMEDIATE');

  try {
    const selectedCar = getCarById(normalizedOrder.carId);

    if (!selectedCar) {
      db.exec('COMMIT');
      return null;
    }

    const activeOrder = getActiveDepositOrderForCar(selectedCar.id);

    if (activeOrder) {
      holdCarForDeposit(selectedCar.id);
      throw createDepositCarHeldError(activeOrder);
    }

    if (!isCarAvailableForTestDrive(selectedCar)) {
      db.exec('COMMIT');
      return null;
    }

    const depositSettings = getDepositPaymentSettings();
    const normalizedUserId = Number(normalizedOrder.userId || 0);
    const bankTransferNote = normalizedOrder.bankTransferNote
      || `${depositSettings.transferPrefix || 'OKXE COC'} XE${selectedCar.id}`;
    const expiresAt = getDepositOrderExpiresAt(new Date(), depositSettings.holdHours);
    const result = insertDepositOrderStatement.run(
      Number.isInteger(normalizedUserId) && normalizedUserId > 0 ? normalizedUserId : null,
      selectedCar.id,
      selectedCar.name,
      selectedCar.brand,
      selectedCar.price,
      Number(selectedCar.priceValue || 0),
      normalizedOrder.fullName,
      normalizedOrder.phone,
      normalizedOrder.email,
      normalizedOrder.province,
      normalizedOrder.note.slice(0, 700),
      normalizedOrder.depositAmount,
      normalizedOrder.paymentMethod,
      bankTransferNote.slice(0, 120),
      expiresAt
    );

    holdCarForDeposit(selectedCar.id);

    const createdOrder = getDepositOrderById(result.lastInsertRowid);
    createDepositOrderStatusHistory(createdOrder.id, {
      nextStatus: 'pending',
      note: `Khách tạo đơn đặt cọc. Hạn giữ chỗ đến ${expiresAt}.`,
      actorUserId: normalizedUserId,
      actorName: normalizedOrder.fullName,
      actionType: 'created',
    });
    const createdOrderWithHistory = getDepositOrderById(result.lastInsertRowid);
    createAdminNotificationForDepositOrder(createdOrderWithHistory);
    createDepositOrderUserNotification(createdOrderWithHistory);

    db.exec('COMMIT');
    return createdOrderWithHistory;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const updateDepositOrderTransferProof = (orderId, {
  transferProofUrl = '',
  transferProofFileName = '',
  actorUserId = undefined,
  actorName = '',
  actorLabel = 'Khách hàng',
  note = '',
} = {}) => {
  const existingOrder = getDepositOrderById(orderId);

  if (!existingOrder) {
    return null;
  }

  const normalizedProofUrl = String(transferProofUrl || '').trim().slice(0, 500);
  const normalizedProofFileName = String(transferProofFileName || '').trim().slice(0, 180);
  const normalizedActorUserId = actorUserId === undefined
    ? existingOrder.userId
    : (Number.isInteger(Number(actorUserId)) && Number(actorUserId) > 0 ? Number(actorUserId) : null);
  const normalizedActorLabel = String(actorLabel || 'Khách hàng').trim().slice(0, 120);
  const normalizedNote = String(note || '').trim().slice(0, 500);

  if (!normalizedProofUrl) {
    const error = new Error('Đường dẫn chứng từ chuyển khoản không hợp lệ.');
    error.code = 'DEPOSIT_TRANSFER_PROOF_INVALID';
    throw error;
  }

  db.exec('BEGIN IMMEDIATE');

  try {
    updateDepositOrderTransferProofStatement.run(
      normalizedProofUrl,
      normalizedProofFileName,
      orderId
    );

    createDepositOrderStatusHistory(orderId, {
      previousStatus: existingOrder.status,
      nextStatus: existingOrder.status,
      note: normalizedNote || (normalizedProofFileName
        ? `${normalizedActorLabel} đã tải lên chứng từ chuyển khoản: ${normalizedProofFileName}.`
        : `${normalizedActorLabel} đã tải lên chứng từ chuyển khoản.`),
      actorUserId: normalizedActorUserId,
      actorName: actorName || existingOrder.fullName || 'Khách hàng',
      actionType: 'transfer_proof_uploaded',
    });

    const updatedOrder = getDepositOrderById(orderId);
    db.exec('COMMIT');
    return updatedOrder;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const updateDepositOrderVnpayPayment = (orderId, {
  txnRef = undefined,
  transactionNo = undefined,
  responseCode = undefined,
  transactionStatus = undefined,
  bankCode = undefined,
  cardType = undefined,
  payDate = undefined,
  paymentUrl = undefined,
  confirmedAt = undefined,
  historyNote = '',
  actionType = 'vnpay_payment_update',
} = {}) => {
  const existingOrder = getDepositOrderById(orderId);

  if (!existingOrder) {
    return null;
  }

  const nextValue = (value, fallback, maxLength = 500) => {
    if (value === undefined) {
      return fallback || '';
    }

    return String(value || '').trim().slice(0, maxLength);
  };

  updateDepositOrderVnpayPaymentStatement.run(
    nextValue(txnRef, existingOrder.vnpayTxnRef, 120),
    nextValue(transactionNo, existingOrder.vnpayTransactionNo, 120),
    nextValue(responseCode, existingOrder.vnpayResponseCode, 30),
    nextValue(transactionStatus, existingOrder.vnpayTransactionStatus, 30),
    nextValue(bankCode, existingOrder.vnpayBankCode, 60),
    nextValue(cardType, existingOrder.vnpayCardType, 60),
    nextValue(payDate, existingOrder.vnpayPayDate, 40),
    nextValue(paymentUrl, existingOrder.vnpayPaymentUrl, 1000),
    nextValue(confirmedAt, existingOrder.vnpayConfirmedAt, 40),
    orderId
  );

  const normalizedHistoryNote = String(historyNote || '').trim().slice(0, 500);

  if (normalizedHistoryNote) {
    createDepositOrderStatusHistory(orderId, {
      previousStatus: existingOrder.status,
      nextStatus: existingOrder.status,
      note: normalizedHistoryNote,
      actorUserId: null,
      actorName: 'VNPay sandbox',
      actionType,
    });
  }

  return getDepositOrderById(orderId);
};

const updateDepositOrderStatus = (orderId, {
  status,
  statusNote = '',
  paymentReference = '',
  paymentReceivedAt = '',
  paymentConfirmationNote = '',
  refundAmount = 0,
  refundReference = '',
  refundCompletedAt = '',
  refundNote = '',
  confirmedByUser = null,
  actorUser = null,
  actionType = 'status_update',
}) => {
  const existingOrder = getDepositOrderById(orderId);

  if (!existingOrder) {
    return null;
  }

  const nextStatus = normalizeDepositOrderStatus(status);
  const activeDepositSettings = getDepositPaymentSettings();
  const normalizedStatusNote = String(statusNote || '').trim().slice(0, 500)
    || (nextStatus === 'expired'
      ? `Đơn đặt cọc đã quá hạn giữ chỗ ${activeDepositSettings.holdHours} giờ.`
      : nextStatus === 'completed'
        ? 'Giao dịch mua xe đã hoàn tất. Xe đã được chuyển sang trạng thái đã bán.'
      : '');
  const actingUser = actorUser || confirmedByUser || null;
  const actorUserId = Number(actingUser?.id || 0);
  const actorName = normalizeFullName(actingUser?.fullName || actingUser?.email || '');
  let refundHistoryNote = '';

  if (!isAllowedDepositOrderStatusTransition(existingOrder.status, nextStatus)) {
    const error = new Error('Không thể chuyển trạng thái đơn đặt cọc theo luồng này.');
    error.code = 'DEPOSIT_ORDER_STATUS_TRANSITION_INVALID';
    error.currentStatus = existingOrder.status;
    error.nextStatus = nextStatus;
    throw error;
  }

  db.exec('BEGIN IMMEDIATE');

  try {
    if (
      ['completed', 'cancelled_after_deposit'].includes(nextStatus)
      && existingOrder.status !== 'confirmed'
      && existingOrder.status !== nextStatus
    ) {
      const error = new Error('Chỉ có thể chốt hoặc hủy sau đặt cọc khi đơn đã được xác nhận nhận tiền.');
      error.code = 'DEPOSIT_ORDER_PAYMENT_NOT_CONFIRMED';
      throw error;
    }

    if (isActiveDepositOrderStatus(nextStatus)) {
      const activeOrder = getActiveDepositOrderForCar(existingOrder.carId, existingOrder.id);

      if (activeOrder) {
        holdCarForDeposit(existingOrder.carId);
        throw createDepositCarHeldError(activeOrder);
      }
    }

    updateDepositOrderStatusStatement.run(
      nextStatus,
      normalizedStatusNote,
      orderId
    );

    if (nextStatus === 'confirmed') {
      const normalizedPaymentReference = String(paymentReference || '').trim().slice(0, 120);
      const duplicateReferenceOrder = getDepositOrderByPaymentReference(
        normalizedPaymentReference,
        existingOrder.id
      );

      if (duplicateReferenceOrder) {
        const error = new Error('Mã giao dịch này đã được dùng cho một đơn đặt cọc khác.');
        error.code = 'DEPOSIT_PAYMENT_REFERENCE_DUPLICATED';
        error.order = duplicateReferenceOrder;
        throw error;
      }

      const confirmedByUserId = Number(confirmedByUser?.id || 0);
      const confirmedByName = normalizeFullName(confirmedByUser?.fullName || confirmedByUser?.email || '');

      updateDepositOrderPaymentConfirmationStatement.run(
        normalizedPaymentReference,
        String(paymentReceivedAt || '').trim().slice(0, 40),
        String(paymentConfirmationNote || '').trim().slice(0, 500),
        Number.isInteger(confirmedByUserId) && confirmedByUserId > 0 ? confirmedByUserId : null,
        confirmedByName.slice(0, 160),
        orderId
      );
    }

    if (nextStatus === 'cancelled_after_deposit') {
      const normalizedRefundAmount = Number(refundAmount || 0);
      const safeRefundAmount = Number.isFinite(normalizedRefundAmount) && normalizedRefundAmount > 0
        ? Math.trunc(normalizedRefundAmount)
        : 0;

      if (safeRefundAmount > Number(existingOrder.depositAmount || 0)) {
        const error = new Error('Số tiền hoàn cọc không được lớn hơn số tiền đặt cọc đã nhận.');
        error.code = 'DEPOSIT_REFUND_AMOUNT_EXCEEDED';
        throw error;
      }

      const refundByUserId = Number(actingUser?.id || 0);
      const refundByName = normalizeFullName(actingUser?.fullName || actingUser?.email || '');

      updateDepositOrderRefundStatement.run(
        safeRefundAmount,
        String(refundReference || '').trim().slice(0, 120),
        String(refundCompletedAt || '').trim().slice(0, 40),
        String(refundNote || '').trim().slice(0, 500),
        Number.isInteger(refundByUserId) && refundByUserId > 0 ? refundByUserId : null,
        refundByName.slice(0, 160),
        orderId
      );

      const refundChanged =
        safeRefundAmount !== Number(existingOrder.refundAmount || 0)
        || String(refundReference || '').trim() !== String(existingOrder.refundReference || '').trim()
        || String(refundCompletedAt || '').trim() !== String(existingOrder.refundCompletedAt || '').trim()
        || String(refundNote || '').trim() !== String(existingOrder.refundNote || '').trim();

      if (refundChanged) {
        const refundAmountText = safeRefundAmount.toLocaleString('vi-VN');
        refundHistoryNote = safeRefundAmount > 0
          ? `Ghi nhận hoàn cọc ${refundAmountText} VNĐ${refundReference ? `, mã giao dịch ${String(refundReference).trim()}` : ''}${refundCompletedAt ? `, thời gian hoàn ${String(refundCompletedAt).trim()}` : ''}.`
          : 'Ghi nhận hủy sau đặt cọc không phát sinh số tiền hoàn cọc.';
      }
    }

    if (nextStatus === 'expired') {
      updateDepositOrderExpiredAtStatement.run(orderId);
    }

    if (nextStatus === 'completed') {
      markCarSoldAfterDeposit(existingOrder.carId);
    } else if (isActiveDepositOrderStatus(nextStatus)) {
      holdCarForDeposit(existingOrder.carId);
    } else {
      releaseCarDepositHoldIfClear(existingOrder.carId, existingOrder.id);
    }

    if (existingOrder.status !== nextStatus || existingOrder.statusNote !== normalizedStatusNote) {
      createDepositOrderStatusHistory(orderId, {
        previousStatus: existingOrder.status,
        nextStatus,
        note: normalizedStatusNote,
        actorUserId,
        actorName,
        actionType,
      });
    }

    if (refundHistoryNote) {
      createDepositOrderStatusHistory(orderId, {
        previousStatus: existingOrder.status,
        nextStatus,
        note: refundHistoryNote,
        actorUserId,
        actorName,
        actionType: 'refund_recorded',
      });
    }

    const updatedOrder = getDepositOrderById(orderId);
    createDepositOrderUserNotification(updatedOrder);

    db.exec('COMMIT');
    return updatedOrder;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const remindPendingDepositOrders = () => {
  const reminderWindow = `+${depositOrderReminderHoursBeforeExpiry} hours`;
  const reminderCandidates = listDepositOrderPaymentReminderCandidatesStatement
    .all(reminderWindow)
    .map(sanitizeDepositOrder)
    .filter(Boolean);
  const remindedOrders = [];

  reminderCandidates.forEach((order) => {
    db.exec('BEGIN IMMEDIATE');

    try {
      const freshOrder = getDepositOrderById(order.id);

      if (
        !freshOrder
        || freshOrder.status !== 'pending'
        || freshOrder.paymentReminderSentAt
        || !freshOrder.expiresAt
        || isDepositOrderOverdue(freshOrder)
      ) {
        db.exec('COMMIT');
        return;
      }

      markDepositOrderPaymentReminderSentStatement.run(freshOrder.id);
      createDepositOrderStatusHistory(freshOrder.id, {
        previousStatus: freshOrder.status,
        nextStatus: freshOrder.status,
        note: `Hệ thống đã nhắc khách chuyển khoản trước khi hết hạn giữ chỗ ${freshOrder.expiresAt}.`,
        actorUserId: null,
        actorName: 'Hệ thống OkXe',
        actionType: 'payment_reminder_sent',
      });

      const remindedOrder = getDepositOrderById(freshOrder.id);
      createDepositOrderPaymentReminderNotification(remindedOrder);
      db.exec('COMMIT');

      if (remindedOrder) {
        remindedOrders.push(remindedOrder);
      }
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  });

  return remindedOrders;
};

const expireOverdueDepositOrders = () => {
  const overdueOrders = listOverdueDepositOrdersStatement
    .all()
    .map(sanitizeDepositOrder)
    .filter(Boolean);
  const expiredOrders = [];

  overdueOrders.forEach((order) => {
    const updatedOrder = updateDepositOrderStatus(order.id, {
      status: 'expired',
      statusNote: `Đơn đặt cọc ${order.code} đã quá hạn giữ chỗ ${depositOrderDefaultHoldHours} giờ và được hệ thống tự động kết thúc.`,
      actorUser: {
        id: null,
        fullName: 'Hệ thống OkXe',
      },
      actionType: 'auto_expired',
    });

    if (updatedOrder) {
      expiredOrders.push(updatedOrder);
    }
  });

  return expiredOrders;
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

  const createdRequest = getCarBuyRequestById(result.lastInsertRowid);
  createAdminNotificationForCarBuyRequest(createdRequest);
  createCarBuyRequestUserNotification(createdRequest);

  return createdRequest;
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

  const createdOffer = getCarBuyRequestOfferById(result.lastInsertRowid);
  createAdminNotificationForCarBuyRequestOffer(existingRequest, createdOffer);
  createCarBuyRequestOfferUserNotification(existingRequest, createdOffer);

  return createdOffer;
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

  const updatedRequest = getCarBuyRequestById(requestId);
  createCarBuyRequestUserNotification(updatedRequest);

  return updatedRequest;
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

  const updatedOffer = getCarBuyRequestOfferById(offerId);
  const ownerRequest = getCarBuyRequestById(existingOffer.requestId);
  createCarBuyRequestOfferUserNotification(ownerRequest, updatedOffer);

  return updatedOffer;
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
  const normalizedType = String(type || '').trim();
  const normalizedTitle = String(title || '').trim().slice(0, 180);

  if (
    !Number.isInteger(normalizedUserId)
    || normalizedUserId <= 0
    || !normalizedType
    || !normalizedTitle
  ) {
    return null;
  }

  const normalizedMessage = String(message || '').trim().slice(0, 700);
  const normalizedEntityType = String(entityType || '').trim().slice(0, 80);
  const normalizedEntityId = Number.isInteger(Number(entityId)) && Number(entityId) > 0
    ? Number(entityId)
    : null;
  const normalizedStatus = String(status || '').trim().slice(0, 40);
  const result = insertUserNotificationStatement.run(
    normalizedUserId,
    normalizedType,
    normalizedTitle,
    normalizedMessage,
    normalizedEntityType,
    normalizedEntityId,
    normalizedStatus
  );

  return sanitizeUserNotification({
    id: result.lastInsertRowid,
    user_id: normalizedUserId,
    type: normalizedType,
    title: normalizedTitle,
    message: normalizedMessage,
    entity_type: normalizedEntityType,
    entity_id: normalizedEntityId,
    status: normalizedStatus,
    is_read: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  });
};

const createEntityUserNotification = (notification) => {
  const normalizedUserId = Number(notification?.userId || 0);
  const normalizedType = String(notification?.type || '').trim();
  const normalizedEntityType = String(notification?.entityType || '').trim();
  const normalizedEntityId = Number.isInteger(Number(notification?.entityId)) && Number(notification.entityId) > 0
    ? Number(notification.entityId)
    : null;
  const normalizedStatus = String(notification?.status || '').trim().slice(0, 40);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0 || !normalizedType) {
    return null;
  }

  const existingNotification = findUserNotificationForEntityStatement.get(
    normalizedUserId,
    normalizedType,
    normalizedEntityType,
    normalizedEntityId,
    normalizedStatus
  );

  if (existingNotification) {
    return sanitizeUserNotification(existingNotification);
  }

  return createUserNotification({
    ...notification,
    userId: normalizedUserId,
    type: normalizedType,
    entityType: normalizedEntityType,
    entityId: normalizedEntityId,
    status: normalizedStatus,
  });
};

const getDisplayDateTime = (dateValue = '', timeValue = '') =>
  [String(dateValue || '').trim(), String(timeValue || '').trim()]
    .filter(Boolean)
    .join(', khung giờ ');

const getTestDriveNotificationStatus = (appointment = {}) => {
  const normalizedStatus = normalizeTestDriveAppointmentStatus(appointment.status);

  if (normalizedStatus === 'approved' || normalizedStatus === 'cancelled') {
    return normalizedStatus;
  }

  return String(appointment.statusNote || '').trim()
    ? 'pending_conflict'
    : 'registered';
};

const createTestDriveUserNotification = (appointment) => {
  if (!appointment?.userId) {
    return null;
  }

  const notificationStatus = getTestDriveNotificationStatus(appointment);
  const carTitle = [appointment.carBrand, appointment.carName].filter(Boolean).join(' ') || 'xe đã chọn';
  const scheduleText = getDisplayDateTime(appointment.preferredDate, appointment.preferredTimeSlot) || 'lịch đã chọn';
  const statusNote = String(appointment.statusNote || '').trim();
  const notificationByStatus = {
    registered: {
      title: 'Đã nhận đăng ký lái thử',
      message: `OkXe đã nhận đăng ký lái thử ${carTitle} vào ${scheduleText}. Lịch hẹn đang chờ nhân viên xác nhận.`,
    },
    pending_conflict: {
      title: 'Cần đổi khung giờ lái thử',
      message: `${statusNote || `Khung giờ ${scheduleText} cần được sắp xếp lại.`} Nhân viên OkXe sẽ hỗ trợ đổi lịch phù hợp.`,
    },
    approved: {
      title: 'Đồng ý cho phép lái thử',
      message: statusNote || `OkXe đã xác nhận lịch lái thử ${carTitle} vào ${scheduleText}.`,
    },
    cancelled: {
      title: 'Hủy lịch hẹn lái thử',
      message: statusNote || `Lịch lái thử ${carTitle} vào ${scheduleText} đã được hủy.`,
    },
  };
  const notificationContent = notificationByStatus[notificationStatus] || notificationByStatus.registered;

  return createEntityUserNotification({
    userId: appointment.userId,
    type: 'test-drive',
    title: notificationContent.title,
    message: notificationContent.message,
    entityType: 'test_drive_appointment',
    entityId: appointment.id,
    status: notificationStatus,
  });
};

const createDepositOrderUserNotification = (order) => {
  if (!order?.userId) {
    return null;
  }

  const status = normalizeDepositOrderStatus(order.status);
  const carTitle = [order.carBrand, order.carName].filter(Boolean).join(' ') || 'xe đã chọn';
  const statusNote = String(order.statusNote || '').trim();
  const depositAmountText = Number(order.depositAmount || 0).toLocaleString('vi-VN');
  const paymentMethod = normalizeDepositPaymentMethod(order.paymentMethod);
  const isBankTransfer = paymentMethod === 'bank';
  const isVnpayPayment = paymentMethod === 'vnpay';
  const orderCode = order.code || `DC-${String(order.id || '').padStart(6, '0')}`;
  const expiresText = order.expiresAt
    ? ` Hạn giữ chỗ đến ${order.expiresAt}.`
    : '';
  const transferNoteText = order.bankTransferNote
    ? ` Nội dung chuyển khoản: ${order.bankTransferNote}.`
    : '';
  const paymentReferenceText = order.paymentReference
    ? ` Mã giao dịch: ${order.paymentReference}.`
    : '';
  const refundAmountText = Number(order.refundAmount || 0).toLocaleString('vi-VN');
  const refundReferenceText = order.refundReference
    ? ` Mã hoàn tiền: ${order.refundReference}.`
    : '';
  const refundCompletedText = order.refundCompletedAt
    ? ` Thời gian hoàn: ${order.refundCompletedAt}.`
    : '';
  const refundText = Number(order.refundAmount || 0) > 0
    ? ` OkXe đã ghi nhận hoàn cọc ${refundAmountText} VNĐ.${refundReferenceText}${refundCompletedText}`
    : '';
  const contentByStatus = {
    pending: {
      title: isBankTransfer
        ? 'Đang chờ xác nhận chuyển khoản'
        : isVnpayPayment
          ? 'Đang chờ thanh toán VNPay'
          : 'Đã nhận yêu cầu đặt cọc',
      message: isBankTransfer
        ? `OkXe đã tạo đơn đặt cọc ${orderCode} cho ${carTitle} với số tiền ${depositAmountText} VNĐ.${transferNoteText}${expiresText} Vui lòng chuyển khoản đúng nội dung và chờ nhân viên xác nhận.`
        : isVnpayPayment
          ? `OkXe đã tạo đơn đặt cọc ${orderCode} cho ${carTitle} với số tiền ${depositAmountText} VNĐ.${expiresText} Vui lòng hoàn tất thanh toán trên cổng VNPay sandbox để hệ thống tự xác nhận.`
          : `OkXe đã nhận yêu cầu đặt cọc ${orderCode} cho ${carTitle} với số tiền ${depositAmountText} VNĐ.${expiresText} Nhân viên sẽ kiểm tra và xác nhận sớm.`,
    },
    confirmed: {
      title: 'Đã nhận tiền đặt cọc',
      message: statusNote || `OkXe đã xác nhận nhận tiền đặt cọc ${orderCode} cho ${carTitle}.${paymentReferenceText} Bạn có thể xem/in biên nhận trong mục Quản lý đặt cọc.`,
    },
    completed: {
      title: 'Giao dịch mua xe đã hoàn tất',
      message: statusNote || `Đơn đặt cọc ${orderCode} cho ${carTitle} đã được chốt hoàn tất. Xe đã chuyển sang trạng thái đã bán.`,
    },
    cancelled_after_deposit: {
      title: 'Giao dịch sau đặt cọc đã hủy',
      message: statusNote
        ? `${statusNote}${refundText}`
        : `Đơn đặt cọc ${orderCode} cho ${carTitle} đã được hủy sau khi xác nhận tiền.${refundText || ' Vui lòng liên hệ OkXe để được hỗ trợ chính sách hoàn cọc hoặc xử lý tiếp.'}`,
    },
    cancelled: {
      title: 'Đơn đặt cọc đã bị hủy',
      message: statusNote || `Đơn đặt cọc ${orderCode} cho ${carTitle} đã bị hủy. Vui lòng liên hệ OkXe nếu bạn cần hỗ trợ thêm.`,
    },
    expired: {
      title: 'Đơn đặt cọc đã quá hạn',
      message: statusNote || `Đơn đặt cọc ${orderCode} cho ${carTitle} đã quá hạn giữ chỗ. Xe có thể được mở lại để khách khác đặt cọc.`,
    },
  };
  const notificationContent = contentByStatus[status] || contentByStatus.pending;

  return createEntityUserNotification({
    userId: order.userId,
    type: 'deposit-order',
    title: notificationContent.title,
    message: notificationContent.message,
    entityType: 'deposit_order',
    entityId: order.id,
    status,
  });
};

const createDepositOrderPaymentReminderNotification = (order) => {
  if (!order?.userId) {
    return null;
  }

  const carTitle = [order.carBrand, order.carName].filter(Boolean).join(' ') || 'xe đã chọn';
  const orderCode = order.code || `DC-${String(order.id || '').padStart(6, '0')}`;
  const depositAmountText = Number(order.depositAmount || 0).toLocaleString('vi-VN');
  const expiresText = order.expiresAt
    ? ` trước hạn giữ chỗ ${order.expiresAt}`
    : '';
  const transferNoteText = order.bankTransferNote
    ? ` Nội dung chuyển khoản: ${order.bankTransferNote}.`
    : '';

  return createEntityUserNotification({
    userId: order.userId,
    type: 'deposit-order',
    title: 'Nhắc chuyển khoản đặt cọc',
    message: `Đơn đặt cọc ${orderCode} cho ${carTitle} vẫn đang chờ xác nhận. Vui lòng chuyển khoản ${depositAmountText} VNĐ${expiresText} để OkXe tiếp tục giữ xe.${transferNoteText}`,
    entityType: 'deposit_order',
    entityId: order.id,
    status: 'payment_reminder',
  });
};

const createCarBuyRequestUserNotification = (request) => {
  if (!request?.userId) {
    return null;
  }

  const status = normalizeCarBuyRequestStatus(request.status);
  const titleText = request.title || 'Tin mua ô tô của bạn';
  const statusNote = String(request.statusNote || '').trim();
  const contentByStatus = {
    pending: {
      title: 'Đã nhận tin mua ô tô',
      message: `OkXe đã nhận tin "${titleText}". Tin đang chờ nhân viên duyệt trước khi hiển thị công khai.`,
    },
    approved: {
      title: 'Tin mua ô tô đã được duyệt',
      message: statusNote || `Tin "${titleText}" đã được duyệt và hiển thị trên mục Tin mua ô tô.`,
    },
    rejected: {
      title: 'Tin mua ô tô bị từ chối',
      message: statusNote || `Tin "${titleText}" chưa được duyệt. Bạn có thể đăng lại với nội dung phù hợp hơn.`,
    },
  };
  const notificationContent = contentByStatus[status] || contentByStatus.pending;

  return createEntityUserNotification({
    userId: request.userId,
    type: 'car-buy-request',
    title: notificationContent.title,
    message: notificationContent.message,
    entityType: 'car_buy_request',
    entityId: request.id,
    status,
  });
};

const createCarBuyRequestOfferUserNotification = (request, offer) => {
  if (!request?.userId || !offer?.id) {
    return null;
  }

  const status = normalizeCarBuyRequestOfferStatus(offer.status);
  const carTitle = [offer.carBrand, offer.carModel, offer.carYear].filter(Boolean).join(' ') || 'một xe phù hợp';
  const offerDetails = [offer.carVersion, offer.expectedPrice, offer.mileage].filter(Boolean).join(' - ');
  const titleText = request.title || 'tin mua ô tô của bạn';
  const contentByStatus = {
    new: {
      title: 'Có xe phù hợp mới',
      message: `Có người vừa đề xuất ${carTitle}${offerDetails ? ` (${offerDetails})` : ''} cho "${titleText}". OkXe sẽ kiểm tra trước khi kết nối hai bên.`,
    },
    contacted: {
      title: 'OkXe đang xác minh xe phù hợp',
      message: `OkXe đã liên hệ người có ${carTitle}${offerDetails ? ` (${offerDetails})` : ''} để xác minh thông tin.`,
    },
    matched: {
      title: 'Xe phù hợp đã sẵn sàng kết nối',
      message: `Đề xuất ${carTitle}${offerDetails ? ` (${offerDetails})` : ''} phù hợp với "${titleText}". OkXe sẽ hỗ trợ kết nối nhu cầu mua bán.`,
    },
    rejected: {
      title: 'Một đề xuất xe chưa phù hợp',
      message: String(offer.statusNote || '').trim() || `Đề xuất ${carTitle} chưa phù hợp với nhu cầu "${titleText}".`,
    },
  };
  const notificationContent = contentByStatus[status] || contentByStatus.new;

  return createEntityUserNotification({
    userId: request.userId,
    type: 'car-buy-request-offer',
    title: notificationContent.title,
    message: notificationContent.message,
    entityType: 'car_buy_request_offer',
    entityId: offer.id,
    status,
  });
};

const createPromotionUserNotification = (userId, promotion) => {
  if (!promotion?.id || promotion.showOnHome === false) {
    return null;
  }

  return createEntityUserNotification({
    userId,
    type: 'promotion',
    title: promotion.title || 'Ưu đãi mới từ OkXe',
    message: promotion.summary || 'OkXe vừa cập nhật một chương trình ưu đãi mới dành cho khách hàng.',
    entityType: 'promotion',
    entityId: promotion.id,
    status: 'active',
  });
};

const syncUserNotificationsForUser = (userId) => {
  const normalizedUserId = Number(userId || 0);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    return;
  }

  listHomepagePromotions().forEach((promotion) => {
    createPromotionUserNotification(normalizedUserId, promotion);
  });

  listTestDriveAppointmentsByUser(normalizedUserId).forEach(createTestDriveUserNotification);

  listDepositOrdersByUser(normalizedUserId).forEach(createDepositOrderUserNotification);

  listCarBuyRequestsByUser(normalizedUserId).forEach((request) => {
    createCarBuyRequestUserNotification(request);

    if (Array.isArray(request.offerNotifications)) {
      request.offerNotifications.forEach((offer) => {
        createCarBuyRequestOfferUserNotification(request, offer);
      });
    }
  });
};

const markUserNotificationRead = (userId, notificationId) => {
  const normalizedNotificationId = Number(notificationId || 0);
  const normalizedUserId = Number(userId || 0);

  if (!Number.isInteger(normalizedNotificationId) || normalizedNotificationId <= 0) {
    return null;
  }

  markUserNotificationReadStatement.run(normalizedNotificationId, normalizedUserId);

  return sanitizeUserNotification(
    findUserNotificationByIdForUserStatement.get(normalizedNotificationId, normalizedUserId)
  );
};

const markAllUserNotificationsRead = (userId) => {
  const normalizedUserId = Number(userId || 0);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    return 0;
  }

  const result = markAllUserNotificationsReadStatement.run(normalizedUserId);

  return Number(result.changes || 0);
};

const deleteUserNotificationForUser = (userId, notificationId) => {
  const normalizedNotificationId = Number(notificationId || 0);
  const normalizedUserId = Number(userId || 0);

  if (!Number.isInteger(normalizedNotificationId) || normalizedNotificationId <= 0) {
    return null;
  }

  const existingNotification = sanitizeUserNotification(
    findUserNotificationByIdForUserStatement.get(normalizedNotificationId, normalizedUserId)
  );

  if (!existingNotification) {
    return null;
  }

  softDeleteUserNotificationStatement.run(normalizedNotificationId, normalizedUserId);

  return existingNotification;
};

const createAdminNotification = ({
  type,
  title,
  message = '',
  entityType = '',
  entityId = null,
  status = '',
}) => {
  const normalizedType = String(type || '').trim();
  const normalizedTitle = String(title || '').trim().slice(0, 180);

  if (!normalizedType || !normalizedTitle) {
    return null;
  }

  const normalizedMessage = String(message || '').trim().slice(0, 700);
  const normalizedEntityType = String(entityType || '').trim().slice(0, 80);
  const normalizedEntityId = Number.isInteger(Number(entityId)) && Number(entityId) > 0
    ? Number(entityId)
    : null;
  const normalizedStatus = String(status || '').trim().slice(0, 40);
  const result = insertAdminNotificationStatement.run(
    normalizedType,
    normalizedTitle,
    normalizedMessage,
    normalizedEntityType,
    normalizedEntityId,
    normalizedStatus
  );

  return sanitizeAdminNotification({
    id: result.lastInsertRowid,
    type: normalizedType,
    title: normalizedTitle,
    message: normalizedMessage,
    entity_type: normalizedEntityType,
    entity_id: normalizedEntityId,
    status: normalizedStatus,
    is_read: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  });
};

const createEntityAdminNotification = (notification) => {
  const normalizedType = String(notification?.type || '').trim();
  const normalizedEntityType = String(notification?.entityType || '').trim();
  const normalizedEntityId = Number.isInteger(Number(notification?.entityId)) && Number(notification.entityId) > 0
    ? Number(notification.entityId)
    : null;
  const normalizedStatus = String(notification?.status || '').trim().slice(0, 40);

  if (!normalizedType) {
    return null;
  }

  const existingNotification = findAdminNotificationForEntityStatement.get(
    normalizedType,
    normalizedEntityType,
    normalizedEntityId,
    normalizedStatus
  );

  if (existingNotification) {
    return sanitizeAdminNotification(existingNotification);
  }

  return createAdminNotification({
    ...notification,
    type: normalizedType,
    entityType: normalizedEntityType,
    entityId: normalizedEntityId,
    status: normalizedStatus,
  });
};

const createAdminNotificationForTestDrive = (appointment) => {
  if (!appointment?.id) {
    return null;
  }

  const carTitle = [appointment.carBrand, appointment.carName].filter(Boolean).join(' ') || 'xe đã chọn';
  const scheduleText = getDisplayDateTime(appointment.preferredDate, appointment.preferredTimeSlot) || 'lịch đã chọn';
  const note = String(appointment.statusNote || '').trim();

  return createEntityAdminNotification({
    type: 'test-drive',
    title: 'Khách vừa đăng ký lái thử',
    message: `${appointment.fullName || 'Khách hàng'} đăng ký lái thử ${carTitle} vào ${scheduleText}.${note ? ` Ghi chú: ${note}` : ''}`,
    entityType: 'test_drive_appointment',
    entityId: appointment.id,
    status: 'new',
  });
};

const createAdminNotificationForConsultation = (request) => {
  if (!request?.id) {
    return null;
  }

  const carTitle = [request.carBrand, request.carName].filter(Boolean).join(' ') || 'xe đang quan tâm';
  const contactText = [request.phone, request.email].filter(Boolean).join(' - ');

  return createEntityAdminNotification({
    type: 'consultation',
    title: 'Khách vừa gửi yêu cầu tư vấn',
    message: `${request.fullName || 'Khách hàng'} cần tư vấn ${carTitle}${contactText ? `. Liên hệ: ${contactText}` : ''}.`,
    entityType: 'consultation_request',
    entityId: request.id,
    status: 'new',
  });
};

const createAdminNotificationForDepositOrder = (order) => {
  if (!order?.id) {
    return null;
  }

  const carTitle = [order.carBrand, order.carName].filter(Boolean).join(' ') || 'xe đang đặt cọc';
  const contactText = [order.phone, order.email].filter(Boolean).join(' - ');
  const depositAmountText = Number(order.depositAmount || 0).toLocaleString('vi-VN');

  return createEntityAdminNotification({
    type: 'deposit-order',
    title: 'Khách vừa gửi đơn đặt cọc',
    message: `${order.fullName || 'Khách hàng'} đặt cọc ${carTitle} với số tiền ${depositAmountText} VNĐ${contactText ? `. Liên hệ: ${contactText}` : ''}.`,
    entityType: 'deposit_order',
    entityId: order.id,
    status: 'new',
  });
};

const createAdminNotificationForCarBuyRequest = (request) => {
  if (!request?.id) {
    return null;
  }

  return createEntityAdminNotification({
    type: 'car-buy-request',
    title: 'Khách vừa đăng tin mua xe',
    message: `${request.fullName || 'Khách hàng'} gửi tin "${request.title || 'Nhu cầu mua ô tô'}"${request.province ? ` tại ${request.province}` : ''}.`,
    entityType: 'car_buy_request',
    entityId: request.id,
    status: 'new',
  });
};

const createAdminNotificationForCarBuyRequestOffer = (request, offer) => {
  if (!request?.id || !offer?.id) {
    return null;
  }

  const carTitle = [offer.carBrand, offer.carModel, offer.carYear].filter(Boolean).join(' ') || 'xe phù hợp';
  const requestTitle = request.title || 'tin mua xe';

  return createEntityAdminNotification({
    type: 'car-buy-request-offer',
    title: 'Có đề xuất xe phù hợp mới',
    message: `${offer.sellerName || 'Người bán'} gửi đề xuất ${carTitle} cho "${requestTitle}".`,
    entityType: 'car_buy_request_offer',
    entityId: offer.id,
    status: 'new',
  });
};

const createAdminNotificationForCarSellRequest = (request) => {
  if (!request?.id) {
    return null;
  }

  const carTitle = [request.brand, request.name, request.year].filter(Boolean).join(' ') || 'xe cần bán';

  return createEntityAdminNotification({
    type: 'car-sell-request',
    title: 'Khách vừa gửi xe cần bán',
    message: `${request.fullName || 'Khách hàng'} gửi thông tin ${carTitle}. Nhân viên cần kiểm tra trước khi duyệt nhập kho.`,
    entityType: 'car_sell_request',
    entityId: request.id,
    status: 'new',
  });
};

const syncAdminNotifications = () => {
  listTestDriveAppointments()
    .filter((appointment) => appointment.status === 'pending')
    .forEach(createAdminNotificationForTestDrive);

  listConsultationRequests()
    .filter((request) => request.status === 'new')
    .forEach(createAdminNotificationForConsultation);

  listDepositOrders()
    .filter((order) => order.status === 'pending')
    .forEach(createAdminNotificationForDepositOrder);

  listCarBuyRequests()
    .filter((request) => request.status === 'pending')
    .forEach(createAdminNotificationForCarBuyRequest);

  listCarBuyRequests().forEach((request) => {
    if (!Array.isArray(request.offers)) {
      return;
    }

    request.offers
      .filter((offer) => offer.status === 'new')
      .forEach((offer) => createAdminNotificationForCarBuyRequestOffer(request, offer));
  });

  listCarSellRequests()
    .filter((request) => request.status === 'pending')
    .forEach(createAdminNotificationForCarSellRequest);
};

const listAdminNotifications = () => {
  syncAdminNotifications();

  return listAdminNotificationsStatement.all().map(sanitizeAdminNotification);
};

const markAdminNotificationRead = (notificationId) => {
  const normalizedNotificationId = Number(notificationId || 0);

  if (!Number.isInteger(normalizedNotificationId) || normalizedNotificationId <= 0) {
    return null;
  }

  markAdminNotificationReadStatement.run(normalizedNotificationId);

  return sanitizeAdminNotification(findAdminNotificationByIdStatement.get(normalizedNotificationId));
};

const markAllAdminNotificationsRead = () => {
  const result = markAllAdminNotificationsReadStatement.run();

  return Number(result.changes || 0);
};

const deleteAdminNotification = (notificationId) => {
  const normalizedNotificationId = Number(notificationId || 0);

  if (!Number.isInteger(normalizedNotificationId) || normalizedNotificationId <= 0) {
    return null;
  }

  const existingNotification = sanitizeAdminNotification(
    findAdminNotificationByIdStatement.get(normalizedNotificationId)
  );

  if (!existingNotification) {
    return null;
  }

  softDeleteAdminNotificationStatement.run(normalizedNotificationId);

  return existingNotification;
};

const getCarSellRequestById = (requestId) =>
  sanitizeCarSellRequest(findCarSellRequestByIdStatement.get(requestId));

const listCarSellRequests = () =>
  listCarSellRequestsStatement.all().map(sanitizeCarSellRequest);

const listCarSellRequestsByUser = (userId) =>
  listCarSellRequestsByUserStatement.all(userId).map(sanitizeCarSellRequest);

const listUserNotificationsByUser = (userId) => {
  syncUserNotificationsForUser(userId);

  return listUserNotificationsStatement.all(userId).map(sanitizeUserNotification);
};

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

    createAdminNotificationForCarSellRequest(createdRequest);

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

const approveCarSellRequest = (
  requestId,
  {
    statusNote = '',
    customerDealPriceText = '',
    customerDealPriceValue = 0,
    finalPriceText = '',
    finalPriceValue = 0,
  } = {}
) => {
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

  const normalizedCustomerDealPriceText = String(customerDealPriceText || '').trim();
  const normalizedCustomerDealPriceValue = Number(customerDealPriceValue || 0);
  const normalizedFinalPriceText = String(finalPriceText || '').trim();
  const normalizedFinalPriceValue = Number(finalPriceValue || 0);

  if (normalizedCustomerDealPriceText.length < 2) {
    const error = new Error('Vui lòng nhập giá chốt với khách trước khi duyệt nhập kho.');
    error.code = 'CAR_SELL_CUSTOMER_DEAL_PRICE_TEXT_REQUIRED';
    throw error;
  }

  if (!Number.isFinite(normalizedCustomerDealPriceValue) || normalizedCustomerDealPriceValue <= 0) {
    const error = new Error('Vui lòng nhập giá chốt với khách dạng số lớn hơn 0.');
    error.code = 'CAR_SELL_CUSTOMER_DEAL_PRICE_VALUE_REQUIRED';
    throw error;
  }

  if (normalizedFinalPriceText.length < 2) {
    const error = new Error('Vui lòng nhập giá bán trên hệ thống trước khi duyệt nhập kho.');
    error.code = 'CAR_SELL_FINAL_PRICE_TEXT_REQUIRED';
    throw error;
  }

  if (!Number.isFinite(normalizedFinalPriceValue) || normalizedFinalPriceValue <= 0) {
    const error = new Error('Vui lòng nhập giá bán trên hệ thống dạng số lớn hơn 0.');
    error.code = 'CAR_SELL_FINAL_PRICE_VALUE_REQUIRED';
    throw error;
  }

  db.exec('BEGIN IMMEDIATE');

  try {
    const createdCar = upsertCar({
      brand: existingRequest.brand,
      category: existingRequest.category,
      name: existingRequest.name,
      description: existingRequest.description,
      type: existingRequest.type,
      priceText: normalizedFinalPriceText,
      priceValue: Math.trunc(normalizedFinalPriceValue),
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

    updateCarSellRequestApprovedStatement.run(
      finalNote,
      normalizedCustomerDealPriceText,
      Math.trunc(normalizedCustomerDealPriceValue),
      normalizedFinalPriceText,
      Math.trunc(normalizedFinalPriceValue),
      createdCar.id,
      requestId
    );

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

  const createdAppointment = getTestDriveAppointmentById(result.lastInsertRowid);
  createAdminNotificationForTestDrive(createdAppointment);
  createTestDriveUserNotification(createdAppointment);

  return createdAppointment;
};

const createCar = (car) => upsertCar(car);

const updateCar = (carId, car, { actorUser = null, kpiSaleUserId = 0 } = {}) => {
  const existingCar = sanitizeCar(findCarByIdStatement.get(carId));

  if (!existingCar) {
    return null;
  }

  db.exec('BEGIN IMMEDIATE');

  try {
    const updatedCar = upsertCar(car, carId);

    if (
      existingCar.actionText === carAvailableStatusText
      && updatedCar.actionText === carSoldStatusText
    ) {
      const directSale = createDirectCarSaleRecord(updatedCar, actorUser);
      createSalesKpiRecord({
        kpiType: 'direct_sale',
        sourceId: directSale.id,
        saleUserId: kpiSaleUserId,
        note: 'KPI tự động phát sinh khi xe được bán trực tiếp tại cửa hàng.',
        recordedByUser: actorUser,
        businessDate: getSalesKpiVietnamDate(directSale.soldAt),
        creationMode: 'automatic',
      });
    }

    db.exec('COMMIT');
    return updatedCar;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
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
  createConversation,
  createConversationMessage,
  createDepositOrder,
  createPasswordResetOtp,
  createPromotion,
  createSalesKpiRecord,
  createSession,
  createTestDriveAppointment,
  createUser,
  countAdminUsers,
  deleteAdminNotification,
  deleteCar,
  deleteBlogPost,
  deleteCarBuyRequest,
  deleteConsultationRequest,
  deletePromotion,
  deleteSession,
  deleteTestDriveAppointment,
  deleteUserNotificationForUser,
  deleteUser,
  getCarById,
  getBlogPostById,
  getBlogPostStats,
  getCarBuyRequestById,
  getCarBuyRequestOfferById,
  getCarSellRequestById,
  getConsultationRequestById,
  getConversationById,
  getDepositOrderById,
  getActiveDepositOrderForCar,
  getDepositPaymentSettings,
  getPromotionById,
  getSalesKpiRecordById,
  getSalesKpiReport,
  getSalesKpiStats,
  setSalesKpiPeriodStatus,
  getPublicBlogPostBySlug,
  getTestDriveAppointmentById,
  getUserById,
  getUserBySession,
  employeeRoles,
  isFavoriteCarByUser,
  listAdminNotifications,
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
  listDepositOrders,
  listDepositOrdersByUser,
  listUserNotificationsByUser,
  listUsers,
  expireOverdueDepositOrders,
  remindPendingDepositOrders,
  listHomepageTeamMembers,
  listPublicTeamMembers,
  listCars,
  listFavoriteCarsByUser,
  listPublicPromotions,
  listPublicBlogPosts,
  listPublicCarBuyRequests,
  listPromotions,
  listAvailableSalesKpiSources,
  listConsultationRequests,
  listAdminConversations,
  listConversationMessages,
  listConversationsByUser,
  listSalesKpiRecords,
  listSalesKpiTargets,
  listTestDriveAppointments,
  listTestDriveAppointmentsByUser,
  markAllUserNotificationsRead,
  markAllAdminNotificationsRead,
  markAdminNotificationRead,
  markConversationRead,
  markUserNotificationRead,
  removeFavoriteCarForUser,
  resetPasswordWithOtp,
  updateConsultationRequestStatus,
  assignConversation,
  updateConversationStatus,
  updateDepositPaymentSettings,
  updateDepositOrderTransferProof,
  updateDepositOrderVnpayPayment,
  updateDepositOrderStatus,
  updateBlogPost,
  updatePromotion,
  updateSalesKpiRecord,
  updateSalesKpiRewardWorkflow,
  upsertSalesKpiTarget,
  updateTestDriveAppointmentStatus,
  updateUserProfile,
  updateUserSelfProfile,
  updateUserRole,
  updateCar,
  approveCarSellRequest,
  rejectCarSellRequest,
  updateCarBuyRequestStatus,
  updateCarBuyRequestOfferStatus,
  cancelSalesKpiRecord,
  closeDatabase,
};
