require('dotenv').config();

const express = require('express');
const fs = require('node:fs');
const path = require('path');
const { randomUUID } = require('node:crypto');
const {
  addFavoriteCarForUser,
  authenticateUser,
  approveCarSellRequest,
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
  deleteCarBuyRequest,
  deleteConsultationRequest,
  deletePromotion,
  deleteSession,
  deleteTestDriveAppointment,
  deleteUser,
  employeeRoles,
  getCarById,
  getCarBuyRequestById,
  getTestDriveAppointmentById,
  getCarSellRequestById,
  getUserById,
  getUserBySession,
  isFavoriteCarByUser,
  listAvailableTestDriveCars,
  listAdminCars,
  listCarBuyRequests,
  listCarBuyRequestsByUser,
  listCarSellRequests,
  listCarSellRequestsByUser,
  listConsultationRequests,
  listCars,
  listFavoriteCarsByUser,
  listHomepagePromotions,
  listHomepageTeamMembers,
  listPublicPromotions,
  listPublicTeamMembers,
  listPromotions,
  listPublicCarBuyRequests,
  listTestDriveAppointments,
  listTestDriveAppointmentsByUser,
  listUserNotificationsByUser,
  listUsers,
  removeFavoriteCarForUser,
  resetPasswordWithOtp,
  rejectCarSellRequest,
  updateCar,
  updateCarBuyRequestStatus,
  updateCarBuyRequestOfferStatus,
  updateConsultationRequestStatus,
  updatePromotion,
  updateTestDriveAppointmentStatus,
  updateUserProfile,
  updateUserSelfProfile,
  updateUserRole,
} = require('./db');
const { sendPasswordResetEmail } = require('./mailer');

const app = express();
const port = process.env.PORT || 3000;
const legacySessionCookieName = 'okxe_session';
const userSessionCookieName = 'okxe_user_session';
const adminSessionCookieName = 'okxe_admin_session';
const rateLimitBuckets = new Map();
const userRoles = new Set(['customer', 'staff', 'admin']);
const manageableCreateRoles = new Set(['staff', 'admin']);
const salesTitles = new Set(['Nhân viên kinh doanh', 'Trưởng phòng kinh doanh']);
const dealershipHotline = String(process.env.OKXE_HOTLINE || '0854955761')
  .trim()
  .replace(/[^\d+]/g, '')
  .slice(0, 30) || '0854955761';

const publicPath = path.join(__dirname, 'public');
const imagesPath = path.join(__dirname, 'images');
const getPublicPagePath = (pageName) => path.join(publicPath, pageName, 'index.html');
const sendPublicPage = (res, pageName) => {
  res.sendFile(getPublicPagePath(pageName));
};
const publicPages = {
  home: 'home',
  admin: 'admin',
  adminLogin: 'admin-login',
  inventory: 'inventory',
  carDetail: 'car-detail',
  testDrive: 'test-drive',
  promotions: 'promotions',
  buyRequests: 'buy-requests',
  buyRequestForm: 'buy-request-form',
  sellCarForm: 'sell-car',
  salesTeam: 'sales-team',
  blog: 'blog',
};
const legacyImageAliases = new Map([
  ['Gemini_Generated_Image_y6mz6my6mz6my6mz.png', 'homepage-carousel-car.png'],
  ['home-img.png', 'homepage-car.png'],
  ['lai thu.png', 'test-drive-hero.png'],
  ['untitled-design-11-.png', 'car-buy-requests-hero.png'],
  ['sale1.png', 'showroom-sales-consultant.png'],
  ['6-cac-yeu-to-trong-promotion.jpg', 'promotion-factors.jpg'],
  ['Group 2.png', 'group-2.png'],
  ['P21-0055-a3-rgb-jpeg.jpg', 'vehicle-showroom-a3.jpg'],
  ['tải xuống.png', 'download.png'],
]);
const uploadsPath = path.join(
  process.env.OKXE_UPLOAD_DIR || path.join(__dirname, 'storage', 'uploads')
);
const carUploadsPath = path.join(uploadsPath, 'cars');
const avatarUploadsPath = path.join(uploadsPath, 'avatars');
const promotionUploadsPath = path.join(uploadsPath, 'promotions');
const uploadJsonParser = express.json({ limit: '80mb' });
const profileJsonParser = express.json({ limit: '8mb' });
const maxCarImages = 10;
const maxUploadedImageSize = 5 * 1024 * 1024;
const allowedUploadTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((cookies, cookiePart) => {
    const [rawName, ...rawValue] = cookiePart.trim().split('=');

    if (!rawName) {
      return cookies;
    }

    try {
      cookies[rawName] = decodeURIComponent(rawValue.join('='));
    } catch (error) {
      return cookies;
    }

    return cookies;
  }, {});

const getSessionToken = (req, cookieName) =>
  parseCookies(req.headers.cookie)[cookieName] || null;

const appendSetCookieHeader = (res, cookieValue) => {
  const existingHeader = res.getHeader('Set-Cookie');

  if (!existingHeader) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }

  res.setHeader(
    'Set-Cookie',
    Array.isArray(existingHeader)
      ? [...existingHeader, cookieValue]
      : [existingHeader, cookieValue]
  );
};

const setSessionCookie = (res, session, cookieName) => {
  const maxAgeInSeconds = Math.max(
    0,
    Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
  );
  const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : '';

  appendSetCookieHeader(
    res,
    `${cookieName}=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeInSeconds}${secureCookie}`
  );
};

const clearSessionCookie = (res, cookieName) => {
  appendSetCookieHeader(
    res,
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));

const normalizeBoolean = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

const normalizeSalesTitle = (title) => {
  const normalizedTitle = String(title || '').trim();

  return salesTitles.has(normalizedTitle)
    ? normalizedTitle
    : 'Nhân viên kinh doanh';
};

const normalizeAdminUserProfilePayload = (payload = {}, role = 'customer', profile = {}) => {
  const normalizedRole = String(role || '').trim().toLowerCase();
  const homeDisplayOrder = Number(payload.homeDisplayOrder || 0);

  return {
    phone: String(profile.phone || '').trim(),
    citizenId: String(profile.citizenId || '').trim(),
    birthDate: String(profile.birthDate || '').trim(),
    gender: String(profile.gender || '').trim(),
    avatarUrl: String(payload.avatarUrl || '').trim(),
    salesTitle: normalizeSalesTitle(payload.salesTitle),
    salesSpecialty: String(payload.salesSpecialty || '').trim().slice(0, 120),
    salesExperience: String(payload.salesExperience || '').trim().slice(0, 80),
    salesBio: String(payload.salesBio || '').trim(),
    showOnHome: normalizedRole === 'staff'
      ? normalizeBoolean(payload.showOnHome)
      : false,
    homeDisplayOrder: Number.isFinite(homeDisplayOrder)
      ? Math.max(0, Math.trunc(homeDisplayOrder))
      : 0,
    addressProvince: String(profile.addressProvince || '').trim(),
    addressDistrict: String(profile.addressDistrict || '').trim(),
    addressWard: String(profile.addressWard || '').trim(),
    addressDetail: String(profile.addressDetail || '').trim(),
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

const getRequestUser = (req) =>
  getUserBySession(getSessionToken(req, userSessionCookieName));

const getRequestAdminUser = (req) =>
  getUserBySession(getSessionToken(req, adminSessionCookieName));

const canAccessAdmin = (user) =>
  employeeRoles.has(String(user?.role || '').trim().toLowerCase());

const canManageUsers = (user) =>
  String(user?.role || '').trim().toLowerCase() === 'admin';

const serializeUserForResponse = (user) =>
  user
    ? {
        ...user,
        isAdmin: canAccessAdmin(user),
      }
    : null;

const requireUser = (req, res, next) => {
  const user = getRequestUser(req);

  if (!user) {
    res.status(401).json({ message: 'Bạn cần đăng nhập để cập nhật thông tin.' });
    return;
  }

  req.user = user;
  next();
};

const requireAdmin = (req, res, next) => {
  const user = getRequestAdminUser(req);

  if (!user) {
    res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
    return;
  }

  if (!canAccessAdmin(user)) {
    res.status(403).json({ message: 'Tài khoản này không phải tài khoản nhân viên.' });
    return;
  }

  req.user = user;
  next();
};

const requireUserManager = (req, res, next) => {
  const user = getRequestAdminUser(req);

  if (!user) {
    res.status(401).json({ message: 'Bạn cần đăng nhập admin để thực hiện thao tác này.' });
    return;
  }

  if (!canManageUsers(user)) {
    res.status(403).json({ message: 'Chỉ tài khoản admin mới được quản lý tài khoản.' });
    return;
  }

  req.user = user;
  next();
};

const requireAdminPage = (req, res, next) => {
  const user = getRequestAdminUser(req);

  if (!user) {
    res.redirect('/admin-login?login=required');
    return;
  }

  if (!canAccessAdmin(user)) {
    res.redirect('/admin-login?role=required');
    return;
  }

  req.user = user;
  next();
};

const getClientIp = (req) =>
  req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';

const createRateLimiter = ({
  windowMs,
  max,
  keyPrefix,
  getKey = () => '',
  message = 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
}) => (req, res, next) => {
  const now = Date.now();
  const specificKey = String(getKey(req) || '').trim().toLowerCase();
  const bucketKey = [keyPrefix, getClientIp(req), specificKey].join(':');
  const currentBucket = rateLimitBuckets.get(bucketKey);

  if (!currentBucket || currentBucket.resetAt <= now) {
    rateLimitBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    next();
    return;
  }

  if (currentBucket.count >= max) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((currentBucket.resetAt - now) / 1000)
    );

    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ message });
    return;
  }

  currentBucket.count += 1;

  if (rateLimitBuckets.size > 1000) {
    for (const [key, bucket] of rateLimitBuckets.entries()) {
      if (bucket.resetAt <= now) {
        rateLimitBuckets.delete(key);
      }
    }
  }

  next();
};

const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  keyPrefix: 'auth',
  message: 'Bạn thao tác đăng nhập quá nhiều. Vui lòng thử lại sau.',
});

const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyPrefix: 'login',
  getKey: (req) => req.body?.email,
  message: 'Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau.',
});

const passwordResetRequestRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'forgot-password',
  getKey: (req) => req.body?.email,
  message: 'Bạn yêu cầu mã OTP quá nhiều lần. Vui lòng thử lại sau.',
});

const passwordResetAttemptRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyPrefix: 'reset-password',
  getKey: (req) => req.body?.email,
  message: 'Bạn thử mã OTP quá nhiều lần. Vui lòng yêu cầu mã mới sau ít phút.',
});

const consultationRequestRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: 'consultation-request',
  getKey: (req) => req.body?.phone,
  message: 'Bạn gửi yêu cầu tư vấn quá nhanh. Vui lòng thử lại sau ít phút.',
});

const carBuyRequestRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  keyPrefix: 'car-buy-request',
  getKey: (req) => req.body?.phone,
  message: 'Bạn gửi tin mua xe quá nhanh. Vui lòng thử lại sau ít phút.',
});

const carBuyRequestOfferRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyPrefix: 'car-buy-request-offer',
  getKey: (req) => req.body?.sellerPhone || req.body?.phone,
  message: 'Bạn gửi đề xuất xe quá nhanh. Vui lòng thử lại sau ít phút.',
});

const carSellRequestRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'car-sell-request',
  getKey: (req) => req.body?.phone,
  message: 'Bạn gửi thông tin bán xe quá nhanh. Vui lòng thử lại sau ít phút.',
});

const sanitizeUploadBaseName = (name, fallbackBaseName = 'car-image') => {
  const baseName = path
    .basename(String(name || fallbackBaseName))
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return baseName || fallbackBaseName;
};

const parseUploadedImage = (file, fallbackBaseName = 'car-image') => {
  const dataUrl = String(file?.dataUrl || '').trim();
  const declaredType = String(file?.type || '').trim().toLowerCase();
  const dataUrlMatch = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  const mimeType = dataUrlMatch
    ? dataUrlMatch[1].toLowerCase()
    : declaredType;
  const base64Payload = (dataUrlMatch ? dataUrlMatch[2] : dataUrl).replace(/\s/g, '');
  const extension = allowedUploadTypes.get(mimeType);

  if (!extension) {
    throw new Error('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.');
  }

  if (!base64Payload || !/^[a-z0-9+/]+={0,2}$/i.test(base64Payload)) {
    throw new Error('Dữ liệu ảnh không hợp lệ.');
  }

  const buffer = Buffer.from(base64Payload, 'base64');

  if (!buffer.length || buffer.length > maxUploadedImageSize) {
    throw new Error('Mỗi ảnh phải có dung lượng tối đa 5MB.');
  }

  return {
    buffer,
    extension,
    baseName: sanitizeUploadBaseName(file?.name, fallbackBaseName),
  };
};

const saveUploadedCarImages = (files) => {
  const parsedImages = files.map(parseUploadedImage);
  fs.mkdirSync(carUploadsPath, { recursive: true });

  return parsedImages.map((parsedImage) => {
    const fileName = `${Date.now()}-${randomUUID()}-${parsedImage.baseName}${parsedImage.extension}`;
    const filePath = path.join(carUploadsPath, fileName);

    fs.writeFileSync(filePath, parsedImage.buffer);

    return `/uploads/cars/${fileName}`;
  });
};

const saveUploadedAvatar = (file) => {
  const parsedImage = parseUploadedImage(file, 'avatar');
  fs.mkdirSync(avatarUploadsPath, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}-${parsedImage.baseName}${parsedImage.extension}`;
  const filePath = path.join(avatarUploadsPath, fileName);

  fs.writeFileSync(filePath, parsedImage.buffer);

  return `/uploads/avatars/${fileName}`;
};

const saveUploadedPromotionImage = (file, fallbackBaseName = 'promotion') => {
  const parsedImage = parseUploadedImage(file, fallbackBaseName);
  fs.mkdirSync(promotionUploadsPath, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}-${parsedImage.baseName}${parsedImage.extension}`;
  const filePath = path.join(promotionUploadsPath, fileName);

  fs.writeFileSync(filePath, parsedImage.buffer);

  return `/uploads/promotions/${fileName}`;
};

const carOptionFields = {
  category: ['Sedan', 'SUV', 'Thể thao'],
  type: ['Tự động', 'Số sàn'],
  fuel: ['Xăng', 'Diesel', 'Hybrid', 'Điện'],
  seats: ['4 chỗ', '5 chỗ', '7 chỗ', '9 chỗ'],
  gearbox: ['Số Sàn', 'Tự động'],
  drivetrain: ['FWD - Dẫn động cầu trước', 'RWD - Dẫn động cầu sau', 'Dẫn động 4 bánh'],
  origin: ['Nhập khẩu', 'Trong nước'],
  condition: ['Xe mới', 'Xe cũ'],
  actionText: ['Còn xe', 'Xe đã bán'],
};

const carOptionAliases = {
  type: {
    hybrid: 'Tự động',
    san: 'Số sàn',
    'sàn': 'Số sàn',
    'số tự động': 'Tự động',
  },
  fuel: {
    dau: 'Diesel',
    dầu: 'Diesel',
    dien: 'Điện',
  },
  gearbox: {
    san: 'Số Sàn',
    'sàn': 'Số Sàn',
    'số sàn': 'Số Sàn',
    'tự động / tay': 'Tự động',
    'số tự động': 'Tự động',
  },
  drivetrain: {
    fwd: 'FWD - Dẫn động cầu trước',
    'dẫn động cầu trước': 'FWD - Dẫn động cầu trước',
    'dan dong cau truoc': 'FWD - Dẫn động cầu trước',
    rwd: 'RWD - Dẫn động cầu sau',
    'dẫn động cầu sau': 'RWD - Dẫn động cầu sau',
    'dan dong cau sau': 'RWD - Dẫn động cầu sau',
    awd: 'Dẫn động 4 bánh',
    '4wd': 'Dẫn động 4 bánh',
    'dẫn động bốn bánh': 'Dẫn động 4 bánh',
    'dẫn động 4 bánh': 'Dẫn động 4 bánh',
    'dan dong 4 banh': 'Dẫn động 4 bánh',
  },
  actionText: {
    'mua ngay': 'Còn xe',
    'còn hàng': 'Còn xe',
    'het hang': 'Xe đã bán',
    'hết hàng': 'Xe đã bán',
    'het xe': 'Xe đã bán',
    'hết xe': 'Xe đã bán',
    'xe da ban': 'Xe đã bán',
  },
};

const carOptionLabels = {
  category: 'phân khúc',
  type: 'kiểu vận hành',
  fuel: 'nhiên liệu',
  seats: 'số chỗ',
  gearbox: 'hộp số',
  drivetrain: 'dẫn động',
  origin: 'xuất xứ',
  condition: 'tình trạng',
  actionText: 'nút hành động',
};

const normalizeOptionText = (value) =>
  String(value || '').trim().replace(/\s+/g, ' ');

const normalizeOptionKey = (value) => normalizeOptionText(value).toLocaleLowerCase('vi-VN');

const normalizeCarOptionField = (fieldName, value) => {
  const normalizedValue = normalizeOptionText(value);

  if (!normalizedValue) {
    return fieldName === 'actionText' ? 'Còn xe' : '';
  }

  const optionKey = normalizeOptionKey(normalizedValue);
  const matchedOption = carOptionFields[fieldName]?.find(
    (option) => normalizeOptionKey(option) === optionKey
  );

  return matchedOption || carOptionAliases[fieldName]?.[optionKey] || normalizedValue;
};

const validateCarPayload = (car = {}) => {
  const images = normalizeCarImages(car.images, car.image);
  const normalizedCar = {
    brand: String(car.brand || '').trim(),
    category: normalizeCarOptionField('category', car.category),
    name: String(car.name || '').trim(),
    description: String(car.description || '').trim(),
    type: normalizeCarOptionField('type', car.type),
    priceText: String(car.priceText || car.price || '').trim(),
    priceValue: Number(car.priceValue || 0),
    image: images[0] || '',
    images,
    year: Number(car.year || 0),
    fuel: normalizeCarOptionField('fuel', car.fuel),
    mileageText: String(car.mileageText || car.mileage || '').trim(),
    mileageValue: Number(car.mileageValue || 0),
    seats: normalizeCarOptionField('seats', car.seats),
    gearbox: normalizeCarOptionField('gearbox', car.gearbox),
    drivetrain: normalizeCarOptionField('drivetrain', car.drivetrain),
    origin: normalizeCarOptionField('origin', car.origin),
    condition: normalizeCarOptionField('condition', car.condition),
    color: String(car.color || '').trim(),
    actionText: normalizeCarOptionField('actionText', car.actionText),
  };

  const requiredFields = [
    ['brand', 'Vui lòng nhập hãng xe.'],
    ['category', 'Vui lòng nhập phân khúc xe.'],
    ['name', 'Vui lòng nhập tên xe.'],
    ['type', 'Vui lòng nhập kiểu vận hành.'],
    ['priceText', 'Vui lòng nhập giá hiển thị.'],
    ['fuel', 'Vui lòng nhập loại nhiên liệu.'],
    ['mileageText', 'Vui lòng nhập số km hiển thị.'],
    ['seats', 'Vui lòng nhập số chỗ.'],
    ['gearbox', 'Vui lòng nhập hộp số.'],
    ['drivetrain', 'Vui lòng chọn dẫn động của xe.'],
    ['origin', 'Vui lòng nhập xuất xứ.'],
    ['condition', 'Vui lòng nhập tình trạng xe.'],
    ['color', 'Vui lòng nhập màu sắc.'],
  ];

  for (const [field, message] of requiredFields) {
    if (!normalizedCar[field]) {
      return { error: message };
    }
  }

  for (const [field, options] of Object.entries(carOptionFields)) {
    if (!options.includes(normalizedCar[field])) {
      return {
        error: `Giá trị ${carOptionLabels[field]} không hợp lệ. Vui lòng chọn trong danh sách.`,
      };
    }
  }

  if (!normalizedCar.images.length) {
    return { error: 'Vui lòng chọn ít nhất một ảnh xe.' };
  }

  if (normalizedCar.images.length > maxCarImages) {
    return { error: `Mỗi xe chỉ được lưu tối đa ${maxCarImages} ảnh.` };
  }

  if (!Number.isFinite(normalizedCar.priceValue) || normalizedCar.priceValue <= 0) {
    return { error: 'Giá trị giá xe phải là số lớn hơn 0.' };
  }

  if (normalizedCar.description.length > 1500) {
    return { error: 'Mô tả xe không được vượt quá 1500 ký tự.' };
  }

  if (!Number.isFinite(normalizedCar.year) || normalizedCar.year < 1900) {
    return { error: 'Năm sản xuất không hợp lệ.' };
  }

  if (!Number.isFinite(normalizedCar.mileageValue) || normalizedCar.mileageValue < 0) {
    return { error: 'Số km phải là số không âm.' };
  }

  return { car: normalizedCar };
};

const normalizeShortText = (value, maxLength = 120) =>
  String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);

const normalizePhoneDigits = (value) =>
  String(value || '').replace(/\D/g, '');

const normalizePromotionDate = (value) => String(value || '').trim();

const isValidPromotionDate = (value) => {
  if (!value) {
    return true;
  }

  const [year, month, day] = value.split('-').map(Number);
  const promotionDate = new Date(year, month - 1, day);

  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    promotionDate.getFullYear() === year &&
    promotionDate.getMonth() === month - 1 &&
    promotionDate.getDate() === day &&
    !Number.isNaN(promotionDate.getTime());
};

const getLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const isValidConsultationContactHour = (value) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim());

  if (!match) {
    return false;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const totalMinutes = hour * 60 + minute;

  return totalMinutes >= 8 * 60 && totalMinutes <= 20 * 60 && minute % 15 === 0;
};

const formatContactDateForDisplay = (value) => {
  const [year, month, day] = String(value || '').split('-');

  return `${day}/${month}/${year}`;
};

const isSafePromotionUrl = (value) => {
  const normalizedValue = String(value || '').trim();

  return !normalizedValue || /^(#|\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(normalizedValue);
};

const validatePromotionPayload = (promotion = {}) => {
  const displayOrder = Number(promotion.displayOrder || 0);
  const normalizedPromotion = {
    title: normalizeShortText(promotion.title, 160),
    summary: normalizeShortText(promotion.summary, 240),
    content: String(promotion.content || '').trim().slice(0, 4000),
    badgeText: normalizeShortText(promotion.badgeText || promotion.badge, 40) || 'Khuyến mại',
    imageUrl: String(promotion.imageUrl || promotion.image || '').trim().slice(0, 500),
    ctaText: normalizeShortText(promotion.ctaText, 60) || 'Xem ưu đãi',
    ctaUrl: String(promotion.ctaUrl || '#footer').trim().slice(0, 500) || '#footer',
    startsAt: normalizePromotionDate(promotion.startsAt || promotion.startDate),
    endsAt: normalizePromotionDate(promotion.endsAt || promotion.endDate),
    showOnHome: normalizeBoolean(promotion.showOnHome),
    displayOrder: Number.isFinite(displayOrder) ? Math.max(0, Math.trunc(displayOrder)) : 0,
  };

  if (normalizedPromotion.title.length < 3) {
    return { error: 'Tiêu đề khuyến mại phải có ít nhất 3 ký tự.' };
  }

  if (!normalizedPromotion.summary) {
    return { error: 'Vui lòng nhập mô tả ngắn cho khuyến mại.' };
  }

  if (!normalizedPromotion.content) {
    return { error: 'Vui lòng nhập nội dung khuyến mại.' };
  }

  if (!isSafePromotionUrl(normalizedPromotion.imageUrl)) {
    return { error: 'Đường dẫn ảnh khuyến mại không hợp lệ.' };
  }

  if (!isSafePromotionUrl(normalizedPromotion.ctaUrl)) {
    return { error: 'Đường dẫn nút khuyến mại không hợp lệ.' };
  }

  if (!isValidPromotionDate(normalizedPromotion.startsAt)) {
    return { error: 'Ngày bắt đầu khuyến mại không hợp lệ.' };
  }

  if (!isValidPromotionDate(normalizedPromotion.endsAt)) {
    return { error: 'Ngày kết thúc khuyến mại không hợp lệ.' };
  }

  if (
    normalizedPromotion.startsAt &&
    normalizedPromotion.endsAt &&
    normalizedPromotion.startsAt > normalizedPromotion.endsAt
  ) {
    return { error: 'Ngày bắt đầu không được sau ngày kết thúc.' };
  }

  return { promotion: normalizedPromotion };
};

const testDriveTimeSlots = new Set([
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '13:30-14:30',
  '14:30-15:30',
  '15:30-16:30',
]);

const validateTestDriveAppointmentPayload = (appointment = {}) => {
  const normalizedAppointment = {
    fullName: normalizeShortText(appointment.fullName, 120),
    phone: normalizeShortText(appointment.phone, 30),
    carId: Number(appointment.carId || 0),
    preferredDate: String(appointment.preferredDate || '').trim(),
    preferredTimeSlot: normalizeShortText(appointment.preferredTimeSlot || appointment.timeSlot, 30),
  };

  if (normalizedAppointment.fullName.length < 2) {
    return { error: 'Vui lòng nhập họ và tên.' };
  }

  const phoneDigits = normalizedAppointment.phone.replace(/\D/g, '');
  const hasValidPhoneFormat = /^\+?[0-9\s.-]{8,20}$/.test(normalizedAppointment.phone);

  if (!normalizedAppointment.phone || !hasValidPhoneFormat || phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { error: 'Số điện thoại liên hệ không hợp lệ.' };
  }

  if (!Number.isInteger(normalizedAppointment.carId) || normalizedAppointment.carId <= 0) {
    return { error: 'Vui lòng chọn xe muốn lái thử.' };
  }

  if (!isValidPromotionDate(normalizedAppointment.preferredDate)) {
    return { error: 'Ngày dự kiến không hợp lệ.' };
  }

  if (!normalizedAppointment.preferredDate) {
    return { error: 'Vui lòng chọn ngày dự kiến lái thử.' };
  }

  if (normalizedAppointment.preferredDate < getLocalDateInputValue()) {
    return { error: 'Ngày dự kiến lái thử không được trước ngày hôm nay.' };
  }

  if (!testDriveTimeSlots.has(normalizedAppointment.preferredTimeSlot)) {
    return { error: 'Vui lòng chọn khung giờ lái thử.' };
  }

  return { appointment: normalizedAppointment };
};

const consultationRequestTypeLabels = {
  consultation: 'Tư vấn & báo giá',
  quote: 'Yêu cầu báo giá',
  financing: 'Tư vấn trả góp',
  rolling_cost: 'Chi phí lăn bánh',
  viewing: 'Đặt lịch xem xe',
  similar_car: 'Tư vấn xe tương tự',
};

const consultationRequestStatusLabels = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  appointment: 'Đã hẹn xem xe',
  closed: 'Đã chốt',
  failed: 'Không thành công',
};

const carBuyRequestBudgetRanges = new Set([
  'under-200',
  '200-400',
  '400-600',
  '600-800',
  '800-1000',
  'over-1000',
]);

const carBuyRequestBudgetLabels = {
  'under-200': 'Dưới 200 Triệu',
  '200-400': '200-400 Triệu',
  '400-600': '400-600 Triệu',
  '600-800': '600-800 Triệu',
  '800-1000': '800-1 Tỉ',
  'over-1000': 'Trên 1 Tỉ',
};

const carBuyRequestStatusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const carBuyRequestOfferStatusLabels = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  matched: 'Đã kết nối',
  rejected: 'Từ chối',
};

const carSellRequestStatusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const carBuyRequestOfferContactPreferences = {
  okxe_first: 'OkXe liên hệ trước',
  direct_allowed: 'Cho khách mua liên hệ trực tiếp',
};

const normalizeConsultationRequestType = (value) => {
  const normalizedType = String(value || '').trim().toLowerCase();

  return Object.prototype.hasOwnProperty.call(consultationRequestTypeLabels, normalizedType)
    ? normalizedType
    : 'consultation';
};

const validateConsultationRequestPayload = (request = {}) => {
  const preferredContactDate = normalizePromotionDate(request.preferredContactDate || request.contactDate);
  const preferredContactHour = normalizeShortText(request.preferredContactHour || request.contactHour, 5);
  const normalizedRequest = {
    fullName: normalizeShortText(request.fullName, 120),
    phone: normalizeShortText(request.phone, 30),
    email: normalizeShortText(request.email, 160).toLowerCase(),
    carId: Number(request.carId || 0),
    requestType: normalizeConsultationRequestType(request.requestType || request.type),
    preferredContactTime: normalizeShortText(request.preferredContactTime, 120),
    preferredContactDate,
    preferredContactHour,
    note: String(request.note || '').trim().slice(0, 700),
  };

  if (normalizedRequest.fullName.length < 2) {
    return { error: 'Vui lòng nhập họ và tên.' };
  }

  const phoneDigits = normalizedRequest.phone.replace(/\D/g, '');
  const hasValidPhoneFormat = /^\+?[0-9\s.-]{8,20}$/.test(normalizedRequest.phone);

  if (!normalizedRequest.phone || !hasValidPhoneFormat || phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { error: 'Số điện thoại liên hệ không hợp lệ.' };
  }

  if (normalizedRequest.email && !isValidEmail(normalizedRequest.email)) {
    return { error: 'Email liên hệ không hợp lệ.' };
  }

  if (!Number.isInteger(normalizedRequest.carId) || normalizedRequest.carId <= 0) {
    return { error: 'Xe cần tư vấn không hợp lệ.' };
  }

  if ((preferredContactDate && !preferredContactHour) || (!preferredContactDate && preferredContactHour)) {
    return { error: 'Vui lòng chọn đầy đủ ngày và giờ muốn được gọi lại.' };
  }

  if (preferredContactDate && !isValidPromotionDate(preferredContactDate)) {
    return { error: 'Ngày muốn gọi lại không hợp lệ.' };
  }

  if (preferredContactDate && preferredContactDate < getLocalDateInputValue()) {
    return { error: 'Ngày muốn gọi lại không được trước hôm nay.' };
  }

  if (preferredContactHour && !isValidConsultationContactHour(preferredContactHour)) {
    return { error: 'Giờ gọi lại chỉ nhận từ 08:00 đến 20:00, theo bước 15 phút.' };
  }

  if (preferredContactDate && preferredContactHour) {
    normalizedRequest.preferredContactTime =
      `${preferredContactHour} ngày ${formatContactDateForDisplay(preferredContactDate)}`;
  }

  return { request: normalizedRequest };
};

const validateConsultationRequestStatusPayload = (payload = {}) => {
  const status = String(payload.status || '').trim().toLowerCase();
  const statusNote = normalizeShortText(payload.statusNote || payload.note, 500);

  if (!Object.prototype.hasOwnProperty.call(consultationRequestStatusLabels, status)) {
    return { error: 'Trạng thái yêu cầu tư vấn không hợp lệ.' };
  }

  return { statusUpdate: { status, statusNote } };
};

const normalizeCarBuyRequestBudgetRange = (value) => {
  const normalizedValue = String(value || '').trim();

  if (carBuyRequestBudgetRanges.has(normalizedValue)) {
    return normalizedValue;
  }

  const matchedEntry = Object.entries(carBuyRequestBudgetLabels).find(([, label]) =>
    label.toLocaleLowerCase('vi-VN') === normalizedValue.toLocaleLowerCase('vi-VN')
  );

  return matchedEntry?.[0] || '';
};

const validateCarBuyRequestPayload = (request = {}) => {
  const normalizedRequest = {
    budgetRange: normalizeCarBuyRequestBudgetRange(request.budgetRange || request.priceRange),
    title: normalizeShortText(request.title, 180),
    content: String(request.content || '').trim().slice(0, 1600),
    fullName: normalizeShortText(request.fullName, 120),
    phone: normalizeShortText(request.phone, 30),
    email: normalizeShortText(request.email, 160).toLowerCase(),
    province: normalizeShortText(request.province || request.city, 120),
    address: normalizeShortText(request.address, 240),
  };

  if (!normalizedRequest.budgetRange) {
    return { error: 'Vui lòng chọn phân hạng mức tiền.' };
  }

  if (normalizedRequest.title.length < 8) {
    return { error: 'Tiêu đề tin mua xe phải có ít nhất 8 ký tự.' };
  }

  if (normalizedRequest.content.length < 20) {
    return { error: 'Nội dung nhu cầu mua xe phải có ít nhất 20 ký tự.' };
  }

  if (normalizedRequest.fullName.length < 2) {
    return { error: 'Vui lòng nhập họ và tên liên hệ.' };
  }

  const phoneDigits = normalizedRequest.phone.replace(/\D/g, '');
  const hasValidPhoneFormat = /^\+?[0-9\s.-]{8,20}$/.test(normalizedRequest.phone);

  if (!normalizedRequest.phone || !hasValidPhoneFormat || phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { error: 'Số điện thoại liên hệ không hợp lệ.' };
  }

  if (normalizedRequest.email && !isValidEmail(normalizedRequest.email)) {
    return { error: 'Email liên hệ không hợp lệ.' };
  }

  if (!normalizedRequest.province) {
    return { error: 'Vui lòng nhập tỉnh/thành phố.' };
  }

  return { request: normalizedRequest };
};

const validateCarBuyRequestStatusPayload = (payload = {}) => {
  const status = String(payload.status || '').trim().toLowerCase();
  const statusNote = normalizeShortText(payload.statusNote || payload.note, 500);

  if (!Object.prototype.hasOwnProperty.call(carBuyRequestStatusLabels, status)) {
    return { error: 'Trạng thái tin mua xe không hợp lệ.' };
  }

  if (status === 'rejected' && statusNote.length < 3) {
    return { error: 'Vui lòng nhập lý do khi từ chối tin mua xe.' };
  }

  return { statusUpdate: { status, statusNote } };
};

const validateCarBuyRequestOfferPayload = (offer = {}) => {
  const normalizedOffer = {
    sellerName: normalizeShortText(offer.sellerName || offer.fullName, 120),
    sellerPhone: normalizeShortText(offer.sellerPhone || offer.phone, 30),
    sellerEmail: normalizeShortText(offer.sellerEmail || offer.email, 160).toLowerCase(),
    carBrand: normalizeShortText(offer.carBrand || offer.brand, 80),
    carModel: normalizeShortText(offer.carModel || offer.model, 120),
    carYear: normalizeShortText(offer.carYear || offer.year, 12),
    carVersion: normalizeShortText(offer.carVersion || offer.version, 120),
    expectedPrice: normalizeShortText(offer.expectedPrice || offer.price, 80),
    mileage: normalizeShortText(offer.mileage, 80),
    conditionNote: String(offer.conditionNote || offer.note || '').trim().slice(0, 900),
    contactPreference: String(offer.contactPreference || '').trim(),
  };

  if (normalizedOffer.sellerName.length < 2) {
    return { error: 'Vui lòng nhập họ tên người có xe.' };
  }

  const phoneDigits = normalizePhoneDigits(normalizedOffer.sellerPhone);
  const hasValidPhoneFormat = /^\+?[0-9\s.-]{8,20}$/.test(normalizedOffer.sellerPhone);

  if (
    !normalizedOffer.sellerPhone
    || !hasValidPhoneFormat
    || phoneDigits.length < 8
    || phoneDigits.length > 15
  ) {
    return { error: 'Số điện thoại người có xe không hợp lệ.' };
  }

  if (normalizedOffer.sellerEmail && !isValidEmail(normalizedOffer.sellerEmail)) {
    return { error: 'Email người có xe không hợp lệ.' };
  }

  if (normalizedOffer.carBrand.length < 2) {
    return { error: 'Vui lòng nhập hãng xe đang có.' };
  }

  if (normalizedOffer.carModel.length < 1) {
    return { error: 'Vui lòng nhập dòng xe đang có.' };
  }

  const currentYear = new Date().getFullYear();
  const numericYear = Number(normalizedOffer.carYear);

  if (
    normalizedOffer.carYear
    && (
      !Number.isInteger(numericYear)
      || numericYear < 1980
      || numericYear > currentYear + 1
    )
  ) {
    return { error: 'Đời xe không hợp lệ.' };
  }

  if (normalizedOffer.conditionNote.length < 10) {
    return { error: 'Vui lòng mô tả ngắn tình trạng xe, tối thiểu 10 ký tự.' };
  }

  if (!Object.prototype.hasOwnProperty.call(
    carBuyRequestOfferContactPreferences,
    normalizedOffer.contactPreference
  )) {
    normalizedOffer.contactPreference = 'okxe_first';
  }

  return { offer: normalizedOffer };
};

const validateCarBuyRequestOfferStatusPayload = (payload = {}) => {
  const status = String(payload.status || '').trim().toLowerCase();
  const statusNote = normalizeShortText(payload.statusNote || payload.note, 500);

  if (!Object.prototype.hasOwnProperty.call(carBuyRequestOfferStatusLabels, status)) {
    return { error: 'Trạng thái đề xuất xe không hợp lệ.' };
  }

  if (status === 'rejected' && statusNote.length < 3) {
    return { error: 'Vui lòng nhập lý do khi từ chối đề xuất xe.' };
  }

  return { statusUpdate: { status, statusNote } };
};

const validateCarSellRequestPayload = (payload = {}) => {
  const normalizedContact = {
    fullName: normalizeShortText(payload.fullName, 120),
    phone: normalizeShortText(payload.phone, 30),
    email: normalizeShortText(payload.email, 160).toLowerCase(),
  };
  const phoneDigits = normalizePhoneDigits(normalizedContact.phone);
  const hasValidPhoneFormat = /^\+?[0-9\s.-]{8,20}$/.test(normalizedContact.phone);

  if (normalizedContact.fullName.length < 2) {
    return { error: 'Vui lòng nhập họ và tên người bán.' };
  }

  if (
    !normalizedContact.phone
    || !hasValidPhoneFormat
    || phoneDigits.length < 8
    || phoneDigits.length > 15
  ) {
    return { error: 'Số điện thoại người bán không hợp lệ.' };
  }

  if (normalizedContact.email && !isValidEmail(normalizedContact.email)) {
    return { error: 'Email người bán không hợp lệ.' };
  }

  const { car, error } = validateCarPayload({
    ...payload,
    actionText: 'Còn xe',
  });

  if (error) {
    return { error };
  }

  return {
    request: {
      ...normalizedContact,
      ...car,
      actionText: 'Còn xe',
    },
  };
};

const validateCarSellRequestRejectPayload = (payload = {}) => {
  const statusNote = normalizeShortText(payload.statusNote || payload.reason || payload.note, 500);

  if (statusNote.length < 3) {
    return { error: 'Vui lòng nhập lý do khi từ chối thông tin đăng bán xe.' };
  }

  return { statusUpdate: { statusNote } };
};

const testDriveStatusLabels = {
  approved: 'Đồng ý cho phép lái thử',
  cancelled: 'Hủy lịch hẹn',
  pending: 'Chờ xác nhận',
};

const validateTestDriveStatusPayload = (payload = {}) => {
  const status = String(payload.status || '').trim().toLowerCase();
  const statusNote = normalizeShortText(payload.statusNote || payload.reason || payload.note, 500);
  const preferredDate = String(payload.preferredDate || '').trim();
  const preferredTimeSlot = normalizeShortText(payload.preferredTimeSlot || payload.timeSlot, 30);

  if (!Object.prototype.hasOwnProperty.call(testDriveStatusLabels, status)) {
    return { error: 'Trạng thái lịch lái thử không hợp lệ.' };
  }

  if (preferredDate && !isValidPromotionDate(preferredDate)) {
    return { error: 'Ngày lái thử mới không hợp lệ.' };
  }

  if (preferredDate && preferredDate < getLocalDateInputValue()) {
    return { error: 'Ngày lái thử mới không được trước ngày hôm nay.' };
  }

  if (preferredTimeSlot && !testDriveTimeSlots.has(preferredTimeSlot)) {
    return { error: 'Khung giờ lái thử mới không hợp lệ.' };
  }

  if ((preferredDate && !preferredTimeSlot) || (!preferredDate && preferredTimeSlot)) {
    return { error: 'Vui lòng chọn đầy đủ ngày và khung giờ lái thử mới.' };
  }

  if ((status === 'cancelled' || status === 'pending') && statusNote.length < 3) {
    return { error: 'Vui lòng nhập lý do khi hủy hoặc treo lịch hẹn.' };
  }

  return { statusUpdate: { status, statusNote, preferredDate, preferredTimeSlot } };
};

const validateUserProfilePayload = (profile = {}) => {
  const normalizedProfile = {
    phone: normalizeShortText(profile.phone, 30),
    citizenId: String(profile.citizenId || profile.citizenID || profile.cccd || '').trim(),
    birthDate: String(profile.birthDate || '').trim(),
    gender: String(profile.gender || '').trim().toLowerCase(),
    addressProvince: normalizeShortText(profile.addressProvince || profile.province, 120),
    addressDistrict: normalizeShortText(profile.addressDistrict || profile.district, 120),
    addressWard: normalizeShortText(profile.addressWard || profile.ward, 120),
    addressDetail: normalizeShortText(profile.addressDetail, 240),
  };
  const allowedGenders = new Set(['', 'male', 'female', 'other']);

  if (normalizedProfile.phone) {
    const phoneDigits = normalizedProfile.phone.replace(/\D/g, '');
    const hasValidPhoneFormat = /^\+?[0-9\s.-]{8,20}$/.test(normalizedProfile.phone);

    if (!hasValidPhoneFormat || phoneDigits.length < 8 || phoneDigits.length > 15) {
      return { error: 'Số điện thoại không hợp lệ.' };
    }
  }

  if (normalizedProfile.citizenId && !/^\d{12}$/.test(normalizedProfile.citizenId)) {
    return { error: 'Số CCCD phải gồm đúng 12 chữ số.' };
  }

  if (normalizedProfile.birthDate) {
    const [year, month, day] = normalizedProfile.birthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const isInvalidDate =
      !/^\d{4}-\d{2}-\d{2}$/.test(normalizedProfile.birthDate) ||
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day ||
      Number.isNaN(birthDate.getTime()) ||
      birthDate > new Date();

    if (isInvalidDate) {
      return { error: 'Ngày sinh không hợp lệ.' };
    }
  }

  if (!allowedGenders.has(normalizedProfile.gender)) {
    return { error: 'Giới tính không hợp lệ.' };
  }

  return { profile: normalizedProfile };
};

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[character]));

const normalizeSeoText = (value, maxLength = 160) => {
  const normalizedText = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
};

const getAbsoluteUrl = (req, targetPath = '/') => {
  const origin = `${req.protocol}://${req.get('host')}`;

  try {
    return new URL(targetPath || '/', origin).href;
  } catch (error) {
    return origin;
  }
};

const buildCarStructuredData = (req, car, description, canonicalUrl, images) => {
  const imageUrls = images
    .filter(Boolean)
    .map((image) => getAbsoluteUrl(req, image));
  const availability = String(car.actionText || '').trim().toLocaleLowerCase('vi-VN') === 'còn xe'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.name,
    brand: {
      '@type': 'Brand',
      name: car.brand || 'OkXe',
    },
    image: imageUrls,
    description,
    sku: `OKXE-CAR-${car.id}`,
    category: car.category || 'Ô tô cũ',
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'VND',
      price: Number(car.priceValue || 0),
      availability,
      itemCondition: 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Organization',
        name: 'OkXe',
      },
    },
  };
};

const buildCarDetailSeoMeta = (req, car) => {
  const images = normalizeCarImages(car.images, car.image);
  const primaryImage = images[0] || '/images/rental-1.png';
  const canonicalUrl = getAbsoluteUrl(req, `/cars/${encodeURIComponent(car.id)}`);
  const title = normalizeSeoText(
    `${car.name} ${car.year || ''} giá ${car.price || 'liên hệ'} | OkXe`,
    68
  );
  const description = normalizeSeoText(
    `Xem chi tiết ${car.name}${car.year ? ` đời ${car.year}` : ''}, giá ${car.price || 'liên hệ'}, ${car.mileage || 'số km đang cập nhật'}, ${car.fuel || 'nhiên liệu đang cập nhật'}, ${car.gearbox || 'hộp số đang cập nhật'}. Liên hệ OkXe để được tư vấn mua xe cũ minh bạch.`,
    158
  );
  const structuredData = JSON.stringify(
    buildCarStructuredData(req, car, description, canonicalUrl, images.length ? images : [primaryImage])
  ).replace(/</g, '\\u003c');

  return `
    <!-- OKXE_SEO_META -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <meta name="robots" content="index, follow">
    <meta property="og:locale" content="vi_VN">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:image" content="${escapeHtml(getAbsoluteUrl(req, primaryImage))}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(getAbsoluteUrl(req, primaryImage))}">
    <script type="application/ld+json" id="car-seo-json">${structuredData}</script>
    <!-- /OKXE_SEO_META -->
  `;
};

const renderCarDetailHtml = (req, car) => {
  const template = fs.readFileSync(getPublicPagePath(publicPages.carDetail), 'utf8');
  const seoMeta = buildCarDetailSeoMeta(req, car);

  return template.replace(
    /<!-- OKXE_SEO_META -->[\s\S]*?<!-- \/OKXE_SEO_META -->/,
    seoMeta
  );
};

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

app.use('/images', express.static(imagesPath));
app.use('/uploads', express.static(uploadsPath));

app.get('/images/:imageName', (req, res, next) => {
  const aliasFileName = legacyImageAliases.get(req.params.imageName);

  if (!aliasFileName) {
    next();
    return;
  }

  res.sendFile(path.join(imagesPath, aliasFileName));
});

app.post('/api/uploads/car-images', requireAdmin, uploadJsonParser, (req, res) => {
  const files = Array.isArray(req.body?.files) ? req.body.files : [];

  if (!files.length) {
    res.status(400).json({ message: 'Vui lòng chọn ít nhất một ảnh xe.' });
    return;
  }

  if (files.length > maxCarImages) {
    res.status(400).json({ message: `Mỗi lần chỉ được tải lên tối đa ${maxCarImages} ảnh.` });
    return;
  }

  try {
    const images = saveUploadedCarImages(files);

    res.status(201).json({
      message: 'Tải ảnh xe thành công.',
      images,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Không thể tải ảnh xe.' });
  }
});

app.post('/api/uploads/customer-car-images', requireUser, uploadJsonParser, (req, res) => {
  const files = Array.isArray(req.body?.files) ? req.body.files : [];

  if (!files.length) {
    res.status(400).json({ message: 'Vui lòng chọn ít nhất một ảnh xe.' });
    return;
  }

  if (files.length > maxCarImages) {
    res.status(400).json({ message: `Mỗi lần chỉ được tải lên tối đa ${maxCarImages} ảnh.` });
    return;
  }

  try {
    const images = saveUploadedCarImages(files);

    res.status(201).json({
      message: 'Tải ảnh xe thành công.',
      images,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Không thể tải ảnh xe.' });
  }
});

app.post('/api/uploads/avatar', requireAdmin, profileJsonParser, (req, res) => {
  const file = req.body?.file;

  if (!file) {
    res.status(400).json({ message: 'Vui lòng chọn ảnh đại diện.' });
    return;
  }

  try {
    const avatarUrl = saveUploadedAvatar(file);

    res.status(201).json({
      message: 'Tải ảnh đại diện thành công.',
      avatarUrl,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Không thể tải ảnh đại diện.' });
  }
});

app.post('/api/uploads/promotion-image', requireAdmin, profileJsonParser, (req, res) => {
  const file = req.body?.file;

  if (!file) {
    res.status(400).json({ message: 'Vui lòng chọn ảnh khuyến mại.' });
    return;
  }

  try {
    const imageUrl = saveUploadedPromotionImage(file);

    res.status(201).json({
      message: 'Tải ảnh khuyến mại thành công.',
      imageUrl,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Không thể tải ảnh khuyến mại.' });
  }
});

app.post('/api/uploads/promotion-image/cropped', requireAdmin, profileJsonParser, (req, res) => {
  const file = req.body?.file;

  if (!file) {
    res.status(400).json({ message: 'Vui lòng cắt ảnh banner khuyến mại trước khi tải lên.' });
    return;
  }

  try {
    const imageUrl = saveUploadedPromotionImage(file, 'promotion-banner');

    res.status(201).json({
      message: 'Tải ảnh banner khuyến mại thành công.',
      imageUrl,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Không thể tải ảnh banner khuyến mại.' });
  }
});

app.patch('/api/auth/profile', requireUser, profileJsonParser, (req, res) => {
  const { profile, error } = validateUserProfilePayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const avatarUrl = req.body?.avatarFile
      ? saveUploadedAvatar(req.body.avatarFile)
      : req.user.avatarUrl;
    const user = updateUserSelfProfile(req.user.id, {
      ...profile,
      avatarUrl,
    });

    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy tài khoản để cập nhật.' });
      return;
    }

    res.json({
      message: 'Cập nhật thông tin cá nhân thành công.',
      user: serializeUserForResponse(user),
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed: users.email')) {
      res.status(409).json({ message: 'Email này đã được sử dụng.' });
      return;
    }

    if (String(error.message).includes('Chỉ hỗ trợ ảnh') || String(error.message).includes('ảnh')) {
      res.status(400).json({ message: error.message });
      return;
    }

    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Không thể cập nhật thông tin cá nhân lúc này.' });
  }
});

app.use(express.json({ limit: '100kb' }));

app.get('/api/site-config', (req, res) => {
  res.json({
    hotline: dealershipHotline,
  });
});

app.get(['/admin', '/admin/', '/admin.html', '/admin/index.html'], requireAdminPage, (req, res) => {
  sendPublicPage(res, publicPages.admin);
});

app.get(['/admin-login', '/admin-login/', '/admin-login.html'], (req, res) => {
  sendPublicPage(res, publicPages.adminLogin);
});

app.get(['/mua-xe', '/mua-xe/', '/mua-xe.html'], (req, res) => {
  sendPublicPage(res, publicPages.inventory);
});

app.get(['/khuyen-mai', '/khuyen-mai/', '/khuyen-mai.html'], (req, res) => {
  sendPublicPage(res, publicPages.promotions);
});

app.get(['/tin-mua-o-to', '/tin-mua-o-to/', '/tin-mua-o-to.html'], (req, res) => {
  sendPublicPage(res, publicPages.buyRequests);
});

app.get(['/dang-tin-mua-o-to', '/dang-tin-mua-o-to/', '/dang-tin-mua-o-to.html'], (req, res) => {
  sendPublicPage(res, publicPages.buyRequestForm);
});

app.get(['/dang-tin-ban-xe', '/dang-tin-ban-xe/', '/dang-tin-ban-xe.html'], (req, res) => {
  sendPublicPage(res, publicPages.sellCarForm);
});

app.get(['/tu-van-ban-hang', '/tu-van-ban-hang/', '/tu-van-ban-hang.html'], (req, res) => {
  sendPublicPage(res, publicPages.salesTeam);
});

app.get(['/blog', '/blog/', '/blog.html'], (req, res) => {
  sendPublicPage(res, publicPages.blog);
});

app.use('/blog', express.static(path.join(publicPath, 'blog'), { index: false }));

app.get('/blog/:slug', (req, res) => {
  res.sendFile(path.join(publicPath, 'blog', 'article.html'));
});

app.get(['/dang-ky-lai-thu', '/dang-ky-lai-thu/', '/dang-ky-lai-thu.html'], (req, res) => {
  sendPublicPage(res, publicPages.testDrive);
});

app.get('/car-detail.html', (req, res) => {
  sendPublicPage(res, publicPages.carDetail);
});

app.get('/cars/:id', (req, res) => {
  const carId = Number(req.params.id);
  const car = Number.isInteger(carId) ? getCarById(carId) : null;

  if (!car) {
    res.status(404).sendFile(getPublicPagePath(publicPages.carDetail));
    return;
  }

  try {
    res.send(renderCarDetailHtml(req, car));
  } catch (error) {
    console.error('Render car detail SEO page error:', error);
    sendPublicPage(res, publicPages.carDetail);
  }
});

app.use(express.static(publicPath, { index: false }));

app.get('/api/cars', (req, res) => {
  res.json({ cars: listCars() });
});

app.get('/api/admin/cars', requireAdmin, (req, res) => {
  res.json({ cars: listAdminCars() });
});

app.get('/api/team-members', (req, res) => {
  res.json({ teamMembers: listHomepageTeamMembers() });
});

app.get('/api/team-members/all', (req, res) => {
  res.json({ teamMembers: listPublicTeamMembers() });
});

app.get('/api/promotions', (req, res) => {
  res.json({ promotions: listHomepagePromotions() });
});

app.get('/api/promotions/all', (req, res) => {
  res.json({ promotions: listPublicPromotions() });
});

app.get('/api/car-buy-requests', (req, res) => {
  res.json({
    requests: listPublicCarBuyRequests(),
    budgetRanges: carBuyRequestBudgetLabels,
  });
});

app.get('/api/car-buy-requests/my', requireUser, (req, res) => {
  res.json({
    requests: listCarBuyRequestsByUser(req.user.id),
    budgetRanges: carBuyRequestBudgetLabels,
  });
});

app.get('/api/notifications/my', requireUser, (req, res) => {
  res.json({
    notifications: listUserNotificationsByUser(req.user.id),
  });
});

app.get('/api/car-sell-requests/my', requireUser, (req, res) => {
  res.json({
    requests: listCarSellRequestsByUser(req.user.id),
  });
});

app.post('/api/car-sell-requests', requireUser, carSellRequestRateLimit, (req, res) => {
  const { request, error } = validateCarSellRequestPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const createdRequest = createCarSellRequest({
      userId: req.user.id,
      ...request,
    });

    res.status(201).json({
      message: 'OkXe đã nhận thông tin xe cần bán. Bài đăng đang chờ nhân viên kiểm tra và duyệt nhập kho.',
      request: createdRequest,
    });
  } catch (dbError) {
    console.error('Create car sell request error:', dbError);
    res.status(500).json({ message: 'Không thể gửi thông tin bán xe lúc này.' });
  }
});

app.post('/api/car-buy-requests', carBuyRequestRateLimit, (req, res) => {
  const { request, error } = validateCarBuyRequestPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const requestUser = getRequestUser(req);
    const createdRequest = createCarBuyRequest({
      userId: requestUser?.id || null,
      ...request,
    });

    res.status(201).json({
      message: 'Đăng tin mua xe thành công. Tin của bạn đang chờ cửa hàng duyệt trước khi hiển thị.',
      request: createdRequest,
    });
  } catch (dbError) {
    console.error('Create car buy request error:', dbError);
    res.status(500).json({ message: 'Không thể đăng tin mua xe lúc này.' });
  }
});

app.post('/api/car-buy-requests/:id/offers', carBuyRequestOfferRateLimit, (req, res) => {
  const requestId = Number(req.params.id);
  const { offer, error } = validateCarBuyRequestOfferPayload(req.body || {});

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã tin mua xe không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const buyRequest = getCarBuyRequestById(requestId);

    if (!buyRequest || buyRequest.status !== 'approved') {
      res.status(404).json({ message: 'Tin mua xe này không còn nhận đề xuất.' });
      return;
    }

    const requestUser = getRequestUser(req);
    const isOwnerUser = Boolean(
      requestUser?.id
      && buyRequest.userId
      && String(requestUser.id) === String(buyRequest.userId)
    );
    const usesBuyerPhone = Boolean(
      normalizePhoneDigits(offer.sellerPhone)
      && normalizePhoneDigits(offer.sellerPhone) === normalizePhoneDigits(buyRequest.phone)
    );

    if (isOwnerUser || usesBuyerPhone) {
      res.status(400).json({ message: 'Bạn là người đăng tin mua xe này nên không thể tự gửi xe phù hợp cho chính tin của mình.' });
      return;
    }

    const createdOffer = createCarBuyRequestOffer(requestId, offer);

    if (!createdOffer) {
      res.status(404).json({ message: 'Tin mua xe này không còn nhận đề xuất.' });
      return;
    }

    res.status(201).json({
      message: 'OkXe đã nhận thông tin xe phù hợp. Nhân viên sẽ kiểm tra và kết nối nhu cầu mua bán.',
      offer: createdOffer,
    });
  } catch (dbError) {
    console.error('Create car buy request offer error:', dbError);
    res.status(500).json({ message: 'Không thể gửi đề xuất xe lúc này.' });
  }
});

app.post('/api/consultation-requests', consultationRequestRateLimit, (req, res) => {
  const { request, error } = validateConsultationRequestPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const requestUser = getRequestUser(req);
    const consultationRequest = createConsultationRequest({
      userId: requestUser?.id || null,
      ...request,
    });

    if (!consultationRequest) {
      res.status(404).json({ message: 'Không tìm thấy xe cần tư vấn.' });
      return;
    }

    res.status(201).json({
      message: 'OkXe đã nhận yêu cầu tư vấn. Nhân viên sẽ liên hệ lại trong thời gian sớm nhất.',
      request: consultationRequest,
    });
  } catch (dbError) {
    console.error('Create consultation request error:', dbError);
    res.status(500).json({ message: 'Không thể gửi yêu cầu tư vấn lúc này.' });
  }
});

app.get('/api/test-drive/cars', requireUser, (req, res) => {
  res.json({ cars: listAvailableTestDriveCars() });
});

app.get('/api/test-drive/appointments', requireUser, (req, res) => {
  res.json({ appointments: listTestDriveAppointmentsByUser(req.user.id) });
});

app.post('/api/test-drive/appointments', requireUser, (req, res) => {
  const { appointment, error } = validateTestDriveAppointmentPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const createdAppointment = createTestDriveAppointment({
      userId: req.user.id,
      ...appointment,
    });

    if (!createdAppointment) {
      res.status(400).json({ message: 'Xe đã chọn không còn trong trạng thái còn xe.' });
      return;
    }

    const createMessage = createdAppointment.statusNote
      ? 'Đăng ký lái thử thành công. Khung giờ này đang có lịch khác, nhân viên sẽ liên hệ để hỗ trợ đổi giờ.'
      : 'Đăng ký lái thử thành công. Lịch hẹn đang chờ nhân viên xác nhận.';

    res.status(201).json({
      message: createMessage,
      appointment: createdAppointment,
    });
  } catch (dbError) {
    console.error('Create test drive appointment error:', dbError);
    res.status(500).json({ message: 'Không thể đăng ký lái thử lúc này.' });
  }
});

app.delete('/api/test-drive/appointments/:id', requireUser, (req, res) => {
  const appointmentId = Number(req.params.id);

  if (!Number.isFinite(appointmentId)) {
    res.status(400).json({ message: 'Mã lịch hẹn lái thử không hợp lệ.' });
    return;
  }

  try {
    const appointment = getTestDriveAppointmentById(appointmentId);

    if (!appointment || Number(appointment.userId) !== Number(req.user.id)) {
      res.status(404).json({ message: 'Không tìm thấy lịch hẹn lái thử của bạn.' });
      return;
    }

    const deletedAppointment = deleteTestDriveAppointment(appointmentId);

    res.json({
      message: 'Xóa lịch hẹn lái thử thành công.',
      appointment: deletedAppointment,
    });
  } catch (dbError) {
    console.error('Delete user test drive appointment error:', dbError);
    res.status(500).json({ message: 'Không thể xóa lịch hẹn lái thử lúc này.' });
  }
});

app.get('/api/cars/:id', (req, res) => {
  const carId = Number(req.params.id);
  const car = getCarById(carId);

  if (!car) {
    res.status(404).json({ message: 'Không tìm thấy xe.' });
    return;
  }

  res.json({ car });
});

app.get('/api/favorites', requireUser, (req, res) => {
  res.json({ cars: listFavoriteCarsByUser(req.user.id) });
});

app.post('/api/favorites/:carId', requireUser, (req, res) => {
  const carId = Number(req.params.carId);

  if (!Number.isFinite(carId)) {
    res.status(400).json({ message: 'Mã xe không hợp lệ.' });
    return;
  }

  try {
    const wasFavorite = isFavoriteCarByUser(req.user.id, carId);
    const favoriteResult = addFavoriteCarForUser(req.user.id, carId);

    if (!favoriteResult) {
      res.status(404).json({ message: 'Không tìm thấy xe để thêm vào yêu thích.' });
      return;
    }

    res.status(wasFavorite ? 200 : 201).json({
      message: 'Đã thêm xe vào danh sách yêu thích.',
      car: favoriteResult.car,
      cars: favoriteResult.favorites,
    });
  } catch (error) {
    console.error('Add favorite car error:', error);
    res.status(500).json({ message: 'Không thể thêm xe yêu thích lúc này.' });
  }
});

app.delete('/api/favorites/:carId', requireUser, (req, res) => {
  const carId = Number(req.params.carId);

  if (!Number.isFinite(carId)) {
    res.status(400).json({ message: 'Mã xe không hợp lệ.' });
    return;
  }

  try {
    const favoriteResult = removeFavoriteCarForUser(req.user.id, carId);

    if (!favoriteResult) {
      res.status(404).json({ message: 'Không tìm thấy xe để bỏ yêu thích.' });
      return;
    }

    res.json({
      message: 'Đã bỏ xe khỏi danh sách yêu thích.',
      car: favoriteResult.car,
      cars: favoriteResult.favorites,
    });
  } catch (error) {
    console.error('Remove favorite car error:', error);
    res.status(500).json({ message: 'Không thể bỏ yêu thích lúc này.' });
  }
});

app.post('/api/cars', requireAdmin, (req, res) => {
  const { car, error } = validateCarPayload(req.body);

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const createdCar = createCar(car);
    res.status(201).json({
      message: 'Thêm xe thành công.',
      car: createdCar,
    });
  } catch (dbError) {
    console.error('Create car error:', dbError);
    res.status(500).json({ message: 'Không thể thêm xe lúc này.' });
  }
});

app.put('/api/cars/:id', requireAdmin, (req, res) => {
  const carId = Number(req.params.id);
  const { car, error } = validateCarPayload(req.body);

  if (!Number.isFinite(carId)) {
    res.status(400).json({ message: 'Mã xe không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const updatedCar = updateCar(carId, car);

    if (!updatedCar) {
      res.status(404).json({ message: 'Không tìm thấy xe để cập nhật.' });
      return;
    }

    res.json({
      message: 'Cập nhật xe thành công.',
      car: updatedCar,
    });
  } catch (dbError) {
    console.error('Update car error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật xe lúc này.' });
  }
});

app.delete('/api/cars/:id', requireAdmin, (req, res) => {
  const carId = Number(req.params.id);

  if (!Number.isFinite(carId)) {
    res.status(400).json({ message: 'Mã xe không hợp lệ.' });
    return;
  }

  try {
    const deletedCar = deleteCar(carId);

    if (!deletedCar) {
      res.status(404).json({ message: 'Không tìm thấy xe để xóa.' });
      return;
    }

    res.json({
      message: 'Xóa xe thành công.',
      car: deletedCar,
    });
  } catch (dbError) {
    console.error('Delete car error:', dbError);
    res.status(500).json({ message: 'Không thể xóa xe lúc này.' });
  }
});

app.get('/api/admin/promotions', requireAdmin, (req, res) => {
  res.json({ promotions: listPromotions() });
});

app.post('/api/admin/promotions', requireAdmin, (req, res) => {
  const { promotion, error } = validatePromotionPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const createdPromotion = createPromotion(promotion);

    res.status(201).json({
      message: 'Tạo bài khuyến mại thành công.',
      promotion: createdPromotion,
    });
  } catch (dbError) {
    console.error('Create promotion error:', dbError);
    res.status(500).json({ message: 'Không thể tạo bài khuyến mại lúc này.' });
  }
});

app.put('/api/admin/promotions/:id', requireAdmin, (req, res) => {
  const promotionId = Number(req.params.id);
  const { promotion, error } = validatePromotionPayload(req.body || {});

  if (!Number.isFinite(promotionId)) {
    res.status(400).json({ message: 'Mã bài khuyến mại không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const updatedPromotion = updatePromotion(promotionId, promotion);

    if (!updatedPromotion) {
      res.status(404).json({ message: 'Không tìm thấy bài khuyến mại để cập nhật.' });
      return;
    }

    res.json({
      message: 'Cập nhật bài khuyến mại thành công.',
      promotion: updatedPromotion,
    });
  } catch (dbError) {
    console.error('Update promotion error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật bài khuyến mại lúc này.' });
  }
});

app.delete('/api/admin/promotions/:id', requireAdmin, (req, res) => {
  const promotionId = Number(req.params.id);

  if (!Number.isFinite(promotionId)) {
    res.status(400).json({ message: 'Mã bài khuyến mại không hợp lệ.' });
    return;
  }

  try {
    const deletedPromotion = deletePromotion(promotionId);

    if (!deletedPromotion) {
      res.status(404).json({ message: 'Không tìm thấy bài khuyến mại để xóa.' });
      return;
    }

    res.json({
      message: 'Xóa bài khuyến mại thành công.',
      promotion: deletedPromotion,
    });
  } catch (dbError) {
    console.error('Delete promotion error:', dbError);
    res.status(500).json({ message: 'Không thể xóa bài khuyến mại lúc này.' });
  }
});

app.get('/api/admin/car-buy-requests', requireAdmin, (req, res) => {
  res.json({
    requests: listCarBuyRequests(),
    budgetRanges: carBuyRequestBudgetLabels,
  });
});

app.get('/api/admin/car-sell-requests', requireAdmin, (req, res) => {
  res.json({
    requests: listCarSellRequests(),
  });
});

app.patch('/api/admin/car-sell-requests/:id/approve', requireAdmin, (req, res) => {
  const requestId = Number(req.params.id);
  const statusNote = normalizeShortText(req.body?.statusNote || req.body?.note, 500);

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã thông tin đăng bán xe không hợp lệ.' });
    return;
  }

  try {
    const result = approveCarSellRequest(requestId, { statusNote });

    if (!result) {
      res.status(404).json({ message: 'Không tìm thấy thông tin đăng bán xe.' });
      return;
    }

    res.json({
      message: 'Đã duyệt thông tin đăng bán xe và nhập xe vào kho cửa hàng.',
      request: result.request,
      car: result.car,
    });
  } catch (dbError) {
    console.error('Approve car sell request error:', dbError);
    res.status(500).json({ message: 'Không thể duyệt thông tin đăng bán xe lúc này.' });
  }
});

app.patch('/api/admin/car-sell-requests/:id/reject', requireAdmin, (req, res) => {
  const requestId = Number(req.params.id);
  const { statusUpdate, error } = validateCarSellRequestRejectPayload(req.body || {});

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã thông tin đăng bán xe không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const request = rejectCarSellRequest(requestId, statusUpdate);

    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy thông tin đăng bán xe.' });
      return;
    }

    res.json({
      message: 'Đã từ chối và xóa bài đăng bán xe. Khách hàng sẽ nhận được lý do để đăng lại.',
      request,
    });
  } catch (dbError) {
    console.error('Reject car sell request error:', dbError);
    res.status(500).json({ message: 'Không thể từ chối thông tin đăng bán xe lúc này.' });
  }
});

app.patch('/api/admin/car-buy-requests/:id/status', requireAdmin, (req, res) => {
  const requestId = Number(req.params.id);
  const { statusUpdate, error } = validateCarBuyRequestStatusPayload(req.body || {});

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã tin mua xe không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const request = updateCarBuyRequestStatus(requestId, statusUpdate);

    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy tin mua xe.' });
      return;
    }

    res.json({
      message: `Cập nhật trạng thái tin mua xe: ${carBuyRequestStatusLabels[request.status]}.`,
      request,
    });
  } catch (dbError) {
    console.error('Update car buy request status error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái tin mua xe lúc này.' });
  }
});

app.patch('/api/admin/car-buy-request-offers/:id/status', requireAdmin, (req, res) => {
  const offerId = Number(req.params.id);
  const { statusUpdate, error } = validateCarBuyRequestOfferStatusPayload(req.body || {});

  if (!Number.isFinite(offerId)) {
    res.status(400).json({ message: 'Mã đề xuất xe không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const offer = updateCarBuyRequestOfferStatus(offerId, statusUpdate);

    if (!offer) {
      res.status(404).json({ message: 'Không tìm thấy đề xuất xe.' });
      return;
    }

    res.json({
      message: `Cập nhật đề xuất xe: ${carBuyRequestOfferStatusLabels[offer.status]}.`,
      offer,
    });
  } catch (dbError) {
    console.error('Update car buy request offer status error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật đề xuất xe lúc này.' });
  }
});

app.delete('/api/admin/car-buy-requests/:id', requireAdmin, (req, res) => {
  const requestId = Number(req.params.id);

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã tin mua xe không hợp lệ.' });
    return;
  }

  try {
    const request = deleteCarBuyRequest(requestId);

    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy tin mua xe để xóa.' });
      return;
    }

    res.json({
      message: 'Xóa tin mua xe thành công.',
      request,
    });
  } catch (dbError) {
    console.error('Delete car buy request error:', dbError);
    res.status(500).json({ message: 'Không thể xóa tin mua xe lúc này.' });
  }
});

app.get('/api/admin/consultation-requests', requireAdmin, (req, res) => {
  res.json({ requests: listConsultationRequests() });
});

app.patch('/api/admin/consultation-requests/:id/status', requireAdmin, (req, res) => {
  const requestId = Number(req.params.id);
  const { statusUpdate, error } = validateConsultationRequestStatusPayload(req.body || {});

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã yêu cầu tư vấn không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const request = updateConsultationRequestStatus(requestId, statusUpdate);

    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu tư vấn.' });
      return;
    }

    res.json({
      message: `Cập nhật trạng thái: ${consultationRequestStatusLabels[request.status]}.`,
      request,
    });
  } catch (dbError) {
    console.error('Update consultation request status error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái yêu cầu tư vấn lúc này.' });
  }
});

app.delete('/api/admin/consultation-requests/:id', requireAdmin, (req, res) => {
  const requestId = Number(req.params.id);

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã yêu cầu tư vấn không hợp lệ.' });
    return;
  }

  try {
    const request = deleteConsultationRequest(requestId);

    if (!request) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu tư vấn để xóa.' });
      return;
    }

    res.json({
      message: 'Xóa yêu cầu tư vấn thành công.',
      request,
    });
  } catch (dbError) {
    console.error('Delete consultation request error:', dbError);
    res.status(500).json({ message: 'Không thể xóa yêu cầu tư vấn lúc này.' });
  }
});

app.get('/api/admin/test-drive-appointments', requireAdmin, (req, res) => {
  res.json({ appointments: listTestDriveAppointments() });
});

app.patch('/api/admin/test-drive-appointments/:id/status', requireAdmin, (req, res) => {
  const appointmentId = Number(req.params.id);
  const { statusUpdate, error } = validateTestDriveStatusPayload(req.body || {});

  if (!Number.isFinite(appointmentId)) {
    res.status(400).json({ message: 'Mã lịch hẹn lái thử không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const appointment = updateTestDriveAppointmentStatus(appointmentId, statusUpdate);

    if (!appointment) {
      res.status(404).json({ message: 'Không tìm thấy lịch hẹn lái thử.' });
      return;
    }

    const statusLabel = appointment.status === 'pending' && appointment.statusNote
      ? 'Treo lịch hẹn'
      : testDriveStatusLabels[appointment.status];

    res.json({
      message: `Cập nhật trạng thái: ${statusLabel}.`,
      appointment,
    });
  } catch (dbError) {
    if (dbError?.code === 'TEST_DRIVE_SCHEDULE_CONFLICT') {
      const conflict = dbError.appointment || {};
      const conflictDate = conflict.preferredDate || statusUpdate.preferredDate || '';
      const conflictTime = conflict.preferredTimeSlot || '';

      res.status(409).json({
        message: `Xe này đã có lịch lái thử chưa hủy${conflictDate ? ` ngày ${conflictDate}` : ''}${conflictTime ? ` khung giờ ${conflictTime}` : ''}. Vui lòng chọn khung giờ khác trước khi xác nhận.`,
        conflict,
      });
      return;
    }

    console.error('Update test drive appointment status error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái lịch hẹn lúc này.' });
  }
});

app.delete('/api/admin/test-drive-appointments/:id', requireAdmin, (req, res) => {
  const appointmentId = Number(req.params.id);

  if (!Number.isFinite(appointmentId)) {
    res.status(400).json({ message: 'Mã lịch hẹn lái thử không hợp lệ.' });
    return;
  }

  try {
    const appointment = deleteTestDriveAppointment(appointmentId);

    if (!appointment) {
      res.status(404).json({ message: 'Không tìm thấy lịch hẹn lái thử để xóa.' });
      return;
    }

    res.json({
      message: 'Xóa lịch hẹn lái thử thành công.',
      appointment,
    });
  } catch (dbError) {
    console.error('Delete test drive appointment error:', dbError);
    res.status(500).json({ message: 'Không thể xóa lịch hẹn lái thử lúc này.' });
  }
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = listUsers();

  res.json({
    users: canManageUsers(req.user)
      ? users
      : users.filter((user) => user.role === 'customer'),
  });
});

app.post('/api/admin/users', requireUserManager, (req, res) => {
  const { fullName, email, password, role = 'staff' } = req.body || {};
  const normalizedFullName = String(fullName || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedRole = String(role || '').trim().toLowerCase();

  if (normalizedFullName.length < 2) {
    res.status(400).json({ message: 'Họ và tên phải có ít nhất 2 ký tự.' });
    return;
  }

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ message: 'Email tài khoản không hợp lệ.' });
    return;
  }

  if (String(password || '').length < 6) {
    res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    return;
  }

  if (!manageableCreateRoles.has(normalizedRole)) {
    res.status(400).json({ message: 'Chỉ được tạo tài khoản nhân viên hoặc admin.' });
    return;
  }

  const profileValidation = validateUserProfilePayload(req.body || {});

  if (profileValidation.error) {
    res.status(400).json({ message: profileValidation.error });
    return;
  }

  const publicProfile = normalizeAdminUserProfilePayload(
    req.body || {},
    normalizedRole,
    profileValidation.profile
  );

  try {
    const user = createUser({
      fullName: normalizedFullName,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      ...publicProfile,
    });

    res.status(201).json({
      message: 'Tạo tài khoản thành công.',
      user,
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed: users.email')) {
      res.status(409).json({ message: 'Email này đã được sử dụng.' });
      return;
    }

    console.error('Create user error:', error);
    res.status(500).json({ message: 'Không thể tạo tài khoản lúc này.' });
  }
});

app.patch('/api/admin/users/:id', requireUserManager, (req, res) => {
  const userId = Number(req.params.id);
  const { fullName, email, password, role } = req.body || {};
  const requestedFullName = String(fullName || '').trim();
  const requestedEmail = String(email || '').trim().toLowerCase();
  const requestedRole = String(role || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');

  if (!Number.isFinite(userId)) {
    res.status(400).json({ message: 'Mã tài khoản không hợp lệ.' });
    return;
  }

  const targetUser = getUserById(userId);

  if (!targetUser) {
    res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    return;
  }

  const isCustomerProfileUpdate = targetUser.role === 'customer';
  const normalizedFullName = isCustomerProfileUpdate ? targetUser.fullName : requestedFullName;
  const normalizedEmail = isCustomerProfileUpdate ? targetUser.email : requestedEmail;
  const normalizedRole = isCustomerProfileUpdate ? 'customer' : requestedRole;

  if (normalizedFullName.length < 2) {
    res.status(400).json({ message: 'Họ và tên phải có ít nhất 2 ký tự.' });
    return;
  }

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ message: 'Email tài khoản không hợp lệ.' });
    return;
  }

  if (!userRoles.has(normalizedRole)) {
    res.status(400).json({ message: 'Vai trò tài khoản không hợp lệ.' });
    return;
  }

  if (!isCustomerProfileUpdate && !manageableCreateRoles.has(normalizedRole)) {
    res.status(400).json({ message: 'Tài khoản nhân viên/admin chỉ được đổi giữa Nhân viên và Admin.' });
    return;
  }

  if (normalizedPassword && normalizedPassword.length < 6) {
    res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    return;
  }

  if (targetUser.id === req.user.id && normalizedRole !== 'admin') {
    res.status(400).json({ message: 'Bạn không thể tự hạ quyền admin của chính mình.' });
    return;
  }

  if (targetUser.role === 'admin' && normalizedRole !== 'admin' && countAdminUsers() <= 1) {
    res.status(400).json({ message: 'Hệ thống phải còn ít nhất một tài khoản admin.' });
    return;
  }

  const profileValidation = validateUserProfilePayload(req.body || {});

  if (profileValidation.error) {
    res.status(400).json({ message: profileValidation.error });
    return;
  }

  const publicProfile = normalizeAdminUserProfilePayload(
    req.body || {},
    normalizedRole,
    profileValidation.profile
  );
  const updateProfile = isCustomerProfileUpdate
    ? {
        ...publicProfile,
        avatarUrl: targetUser.avatarUrl || '',
        salesTitle: targetUser.salesTitle || 'Nhân viên kinh doanh',
        salesSpecialty: targetUser.salesSpecialty || '',
        salesExperience: targetUser.salesExperience || '',
        salesBio: targetUser.salesBio || '',
        showOnHome: false,
        homeDisplayOrder: 0,
      }
    : publicProfile;

  try {
    const user = updateUserProfile(userId, {
      fullName: normalizedFullName,
      email: normalizedEmail,
      password: normalizedPassword,
      role: normalizedRole,
      ...updateProfile,
    });

    res.json({
      message: 'Cập nhật thông tin tài khoản thành công.',
      user,
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed: users.email')) {
      res.status(409).json({ message: 'Email này đã được sử dụng.' });
      return;
    }

    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Không thể cập nhật tài khoản lúc này.' });
  }
});

app.patch('/api/admin/users/:id/role', requireUserManager, (req, res) => {
  const userId = Number(req.params.id);
  const normalizedRole = String(req.body?.role || '').trim().toLowerCase();

  if (!Number.isFinite(userId)) {
    res.status(400).json({ message: 'Mã tài khoản không hợp lệ.' });
    return;
  }

  if (!userRoles.has(normalizedRole)) {
    res.status(400).json({ message: 'Vai trò tài khoản không hợp lệ.' });
    return;
  }

  const targetUser = getUserById(userId);

  if (!targetUser) {
    res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    return;
  }

  if (targetUser.id === req.user.id && normalizedRole !== 'admin') {
    res.status(400).json({ message: 'Bạn không thể tự hạ quyền admin của chính mình.' });
    return;
  }

  if (targetUser.role === 'admin' && normalizedRole !== 'admin' && countAdminUsers() <= 1) {
    res.status(400).json({ message: 'Hệ thống phải còn ít nhất một tài khoản admin.' });
    return;
  }

  try {
    const user = updateUserRole(userId, normalizedRole);

    res.json({
      message: 'Cập nhật phân quyền thành công.',
      user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Không thể cập nhật phân quyền lúc này.' });
  }
});

app.delete('/api/admin/users/:id', requireUserManager, (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isFinite(userId)) {
    res.status(400).json({ message: 'Mã tài khoản không hợp lệ.' });
    return;
  }

  const targetUser = getUserById(userId);

  if (!targetUser) {
    res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    return;
  }

  if (targetUser.id === req.user.id) {
    res.status(400).json({ message: 'Bạn không thể xóa tài khoản đang đăng nhập.' });
    return;
  }

  if (targetUser.role === 'admin' && countAdminUsers() <= 1) {
    res.status(400).json({ message: 'Hệ thống phải còn ít nhất một tài khoản admin.' });
    return;
  }

  try {
    const deletedUser = deleteUser(userId);

    res.json({
      message: 'Xóa tài khoản thành công.',
      user: deletedUser,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Không thể xóa tài khoản lúc này.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = getRequestUser(req);

  if (!user) {
    res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
    return;
  }

  res.json({ user: serializeUserForResponse(user) });
});

app.get('/api/auth/admin-me', (req, res) => {
  const user = getRequestAdminUser(req);

  if (!user || !canAccessAdmin(user)) {
    res.status(401).json({ message: 'Bạn chưa đăng nhập nhân viên.' });
    return;
  }

  res.json({ user: serializeUserForResponse(user) });
});

app.post('/api/auth/signup', authRateLimit, (req, res) => {
  const { fullName, email, password, remember } = req.body || {};
  const normalizedFullName = String(fullName || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (normalizedFullName.length < 2) {
    res.status(400).json({ message: 'Họ và tên phải có ít nhất 2 ký tự.' });
    return;
  }

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ message: 'Email không hợp lệ.' });
    return;
  }

  if (String(password || '').length < 6) {
    res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    return;
  }

  try {
    const user = createUser({
      fullName: normalizedFullName,
      email: normalizedEmail,
      password,
    });
    const session = createSession(user.id, Boolean(remember));

    setSessionCookie(res, session, userSessionCookieName);
    clearSessionCookie(res, legacySessionCookieName);
    res.status(201).json({
      message: 'Tạo tài khoản thành công.',
      user: serializeUserForResponse(user),
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed: users.email')) {
      res.status(409).json({ message: 'Email này đã được sử dụng.' });
      return;
    }

    console.error('Signup error:', error);
    res.status(500).json({ message: 'Không thể tạo tài khoản lúc này.' });
  }
});

app.post('/api/auth/login', loginRateLimit, (req, res) => {
  const { email, password, remember } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ message: 'Email không hợp lệ.' });
    return;
  }

  if (!password) {
    res.status(400).json({ message: 'Vui lòng nhập mật khẩu.' });
    return;
  }

  const user = authenticateUser(normalizedEmail, password);

  if (!user) {
    res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    return;
  }

  const session = createSession(user.id, Boolean(remember));

  setSessionCookie(res, session, userSessionCookieName);
  clearSessionCookie(res, legacySessionCookieName);
  res.json({
    message: 'Đăng nhập thành công.',
    user: serializeUserForResponse(user),
  });
});

app.post('/api/auth/admin-login', loginRateLimit, (req, res) => {
  const { email, password, remember } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ message: 'Email nhân viên không hợp lệ.' });
    return;
  }

  if (!password) {
    res.status(400).json({ message: 'Vui lòng nhập mật khẩu.' });
    return;
  }

  const user = authenticateUser(normalizedEmail, password);

  if (!user) {
    res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    return;
  }

  if (!canAccessAdmin(user)) {
    res.status(403).json({ message: 'Tài khoản này không phải tài khoản nhân viên.' });
    return;
  }

  const session = createSession(user.id, Boolean(remember));

  setSessionCookie(res, session, adminSessionCookieName);
  clearSessionCookie(res, legacySessionCookieName);
  res.json({
    message: 'Đăng nhập nhân viên thành công.',
    user: serializeUserForResponse(user),
    redirectUrl: '/admin',
  });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionToken = getSessionToken(req, userSessionCookieName);
  const legacySessionToken = getSessionToken(req, legacySessionCookieName);

  if (sessionToken) {
    deleteSession(sessionToken);
  }
  if (legacySessionToken && legacySessionToken !== sessionToken) {
    deleteSession(legacySessionToken);
  }

  clearSessionCookie(res, userSessionCookieName);
  clearSessionCookie(res, legacySessionCookieName);
  res.json({ message: 'Đăng xuất thành công.' });
});

app.post('/api/auth/admin-logout', (req, res) => {
  const sessionToken = getSessionToken(req, adminSessionCookieName);
  const legacySessionToken = getSessionToken(req, legacySessionCookieName);

  if (sessionToken) {
    deleteSession(sessionToken);
  }
  if (legacySessionToken && legacySessionToken !== sessionToken) {
    deleteSession(legacySessionToken);
  }

  clearSessionCookie(res, adminSessionCookieName);
  clearSessionCookie(res, legacySessionCookieName);
  res.json({ message: 'Đăng xuất trang quản trị thành công.' });
});

app.post('/api/auth/forgot-password', passwordResetRequestRateLimit, async (req, res) => {
  const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ message: 'Email không hợp lệ.' });
    return;
  }

  try {
    const resetRequest = createPasswordResetOtp(normalizedEmail);

    if (resetRequest) {
      const emailResult = await sendPasswordResetEmail({
        to: resetRequest.user.email,
        fullName: resetRequest.user.fullName,
        otpCode: resetRequest.otp,
        expiresInMinutes: 10,
      });

      res.json({
        message: emailResult.smtpFallback
          ? 'SMTP chưa gửi được email. Hệ thống đã lưu email OTP vào file preview để bạn kiểm thử.'
          : 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã OTP khôi phục mật khẩu.',
        previewFile: emailResult.previewFilePath || null,
        smtpFallback: Boolean(emailResult.smtpFallback),
        email: normalizedEmail,
      });
      return;
    }

    res.json({
      message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã OTP khôi phục mật khẩu.',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Không thể gửi mã OTP lúc này.' });
  }
});

app.post('/api/auth/reset-password', passwordResetAttemptRateLimit, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const otp = String(req.body?.otp || '').trim();
  const password = String(req.body?.password || '');

  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Email không hợp lệ.' });
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    res.status(400).json({ message: 'Mã OTP phải gồm đúng 6 chữ số.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    return;
  }

  const user = resetPasswordWithOtp(email, otp, password);

  if (!user) {
    res.status(400).json({ message: 'Email hoặc mã OTP không đúng, hoặc mã đã hết hạn.' });
    return;
  }

  res.json({
    message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
    user: serializeUserForResponse(user),
  });
});

app.get('/', (req, res) => {
  sendPublicPage(res, publicPages.home);
});

app.get('/index.html', (req, res) => {
  sendPublicPage(res, publicPages.home);
});

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    res.status(413).json({ message: 'Dữ liệu gửi lên quá lớn.' });
    return;
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    res.status(400).json({ message: 'JSON gửi lên không hợp lệ.' });
    return;
  }

  next(error);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
