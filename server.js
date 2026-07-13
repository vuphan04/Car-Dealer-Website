require('dotenv').config();
process.env.TZ = process.env.TZ || 'Asia/Ho_Chi_Minh';

const express = require('express');
const fs = require('node:fs');
const http = require('node:http');
const path = require('path');
const { createHmac, randomUUID } = require('node:crypto');
const { Server } = require('socket.io');
const {
  addFavoriteCarForUser,
  authenticateUser,
  approveCarSellRequest,
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
  employeeRoles,
  expireOverdueDepositOrders,
  getCarById,
  getBlogPostStats,
  getCarBuyRequestById,
  getTestDriveAppointmentById,
  getCarSellRequestById,
  getConversationById,
  getActiveDepositOrderForCar,
  getDepositOrderById,
  getDepositPaymentSettings,
  getSalesKpiRecordById,
  getSalesKpiReport,
  getSalesKpiStats,
  setSalesKpiPeriodStatus,
  getUserById,
  getPublicBlogPostBySlug,
  getUserBySession,
  isFavoriteCarByUser,
  listAvailableTestDriveCars,
  listAvailableSalesKpiSources,
  listAdminCars,
  listAdminNotifications,
  listAdminBlogPosts,
  listCarBuyRequests,
  listCarBuyRequestsByUser,
  listCarSellRequests,
  listCarSellRequestsByUser,
  listDepositOrders,
  listDepositOrdersByUser,
  listConsultationRequests,
  listAdminConversations,
  listConversationMessages,
  listConversationsByUser,
  listCars,
  listFavoriteCarsByUser,
  listHomepageBlogPosts,
  listHomepagePromotions,
  listHomepageTeamMembers,
  listPublicPromotions,
  listPublicBlogPosts,
  listPublicTeamMembers,
  listPromotions,
  listSalesKpiRecords,
  listPublicCarBuyRequests,
  listTestDriveAppointments,
  listTestDriveAppointmentsByUser,
  listUserNotificationsByUser,
  listUsers,
  markAllAdminNotificationsRead,
  markAllUserNotificationsRead,
  markConversationRead,
  markAdminNotificationRead,
  markUserNotificationRead,
  removeFavoriteCarForUser,
  remindPendingDepositOrders,
  resetPasswordWithOtp,
  cancelSalesKpiRecord,
  rejectCarSellRequest,
  updateBlogPost,
  updateCar,
  updateCarBuyRequestStatus,
  updateCarBuyRequestOfferStatus,
  updateConsultationRequestStatus,
  assignConversation,
  updateConversationStatus,
  updateDepositPaymentSettings,
  updateDepositOrderTransferProof,
  updateDepositOrderVnpayPayment,
  updateDepositOrderStatus,
  updatePromotion,
  updateSalesKpiRecord,
  updateSalesKpiRewardWorkflow,
  upsertSalesKpiTarget,
  updateTestDriveAppointmentStatus,
  updateUserProfile,
  updateUserSelfProfile,
  updateUserRole,
} = require('./db');
const {
  sendDepositOrderEmail,
  sendPasswordResetEmail,
} = require('./mailer');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  transports: ['websocket', 'polling'],
});
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
const carHeldStatusText = 'Đang giữ chỗ';
const carSoldStatusText = 'Xe đã bán';
const carAvailableStatusText = 'Còn xe';

const publicPath = path.join(__dirname, 'public');
const imagesPath = path.join(__dirname, 'images');
const getPublicPagePath = (pageName) => path.join(publicPath, pageName, 'index.html');
const sendPublicPage = (res, pageName) => {
  res.set('Cache-Control', 'no-store');
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
  depositPayment: 'deposit-payment',
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
const blogUploadsPath = path.join(uploadsPath, 'blog');
const depositProofUploadsPath = path.join(uploadsPath, 'deposit-proofs');
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
        canAccessAdmin: canAccessAdmin(user),
        isAdmin: canManageUsers(user),
      }
    : null;

const requireUser = (req, res, next) => {
  const user = getRequestUser(req);

  if (!user) {
    res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
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

const depositOrderRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  keyPrefix: 'deposit-order',
  getKey: (req) => req.body?.phone,
  message: 'Bạn gửi yêu cầu đặt cọc quá nhanh. Vui lòng thử lại sau ít phút.',
});

const depositOrderStatusCheckRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 80,
  keyPrefix: 'deposit-order-status',
  getKey: (req) => req.body?.phone || req.body?.orderCode || req.body?.code,
  message: 'Bạn kiểm tra trạng thái đơn đặt cọc quá nhanh. Vui lòng thử lại sau ít phút.',
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

const chatMessageRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: 'chat-message',
  message: 'Bạn gửi tin nhắn quá nhanh. Vui lòng chờ một chút.',
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

const saveUploadedBlogImage = (file, fallbackBaseName = 'blog-cover') => {
  const parsedImage = parseUploadedImage(file, fallbackBaseName);
  fs.mkdirSync(blogUploadsPath, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}-${parsedImage.baseName}${parsedImage.extension}`;
  const filePath = path.join(blogUploadsPath, fileName);

  fs.writeFileSync(filePath, parsedImage.buffer);

  return `/uploads/blog/${fileName}`;
};

const saveUploadedDepositProof = (file, fallbackBaseName = 'deposit-proof') => {
  const parsedImage = parseUploadedImage(file, fallbackBaseName);
  fs.mkdirSync(depositProofUploadsPath, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}-${parsedImage.baseName}${parsedImage.extension}`;
  const filePath = path.join(depositProofUploadsPath, fileName);

  fs.writeFileSync(filePath, parsedImage.buffer);

  return `/uploads/deposit-proofs/${fileName}`;
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
  actionText: ['Còn xe', 'Đang giữ chỗ', 'Xe đã bán'],
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
    'dang giu': 'Đang giữ chỗ',
    'dang giu cho': 'Đang giữ chỗ',
    'đang giữ': 'Đang giữ chỗ',
    'đang giữ chỗ': 'Đang giữ chỗ',
    'giu cho': 'Đang giữ chỗ',
    'giữ chỗ': 'Đang giữ chỗ',
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

const buildDepositLockedCarStatusMessage = (activeOrder, nextActionText) => {
  const orderStatus = String(activeOrder?.status || '').trim().toLowerCase();
  const orderIdText = activeOrder?.id ? ` #${activeOrder.id}` : '';

  if (orderStatus === 'confirmed') {
    if (nextActionText === carSoldStatusText) {
      return `Xe đang có đơn đặt cọc${orderIdText} đã nhận tiền. Vui lòng vào Quản lý đặt cọc và chuyển đơn sang "Hoàn tất giao dịch" để hệ thống tự đổi xe thành "Xe đã bán".`;
    }

    return `Xe đang có đơn đặt cọc${orderIdText} đã nhận tiền. Muốn mở bán lại xe, hãy hủy sau đặt cọc trong Quản lý đặt cọc và ghi nhận thông tin hoàn cọc trước.`;
  }

  if (nextActionText === carSoldStatusText) {
    return `Xe đang có đơn đặt cọc${orderIdText} chờ thanh toán/xác nhận. Vui lòng hủy hoặc để đơn quá hạn trước khi đổi xe thành "Xe đã bán".`;
  }

  return `Xe đang có đơn đặt cọc${orderIdText} chờ thanh toán/xác nhận. Vui lòng hủy hoặc để đơn quá hạn trước khi mở bán lại xe.`;
};

const buildDepositLockedCarDeleteMessage = (activeOrder) => {
  const orderStatus = String(activeOrder?.status || '').trim().toLowerCase();
  const orderIdText = activeOrder?.id ? ` #${activeOrder.id}` : '';

  if (orderStatus === 'confirmed') {
    return `Không thể xóa xe vì đang có đơn đặt cọc${orderIdText} đã nhận tiền. Vui lòng chốt "Hoàn tất giao dịch" hoặc hủy sau đặt cọc trong Quản lý đặt cọc trước.`;
  }

  return `Không thể xóa xe vì đang có đơn đặt cọc${orderIdText} chờ thanh toán/xác nhận. Vui lòng hủy hoặc để đơn quá hạn trước khi xóa xe.`;
};

const serializeActiveDepositLockOrder = (activeOrder) => ({
  id: activeOrder.id,
  status: activeOrder.status,
  statusLabel: depositOrderStatusLabels[activeOrder.status] || activeOrder.status,
  carId: activeOrder.carId,
  carName: activeOrder.carName,
  fullName: activeOrder.fullName,
  phone: activeOrder.phone,
  expiresAt: activeOrder.expiresAt,
});

const validateManualCarStatusChange = (carId, nextActionText) => {
  const activeOrder = getActiveDepositOrderForCar(carId);

  if (!activeOrder || nextActionText === carHeldStatusText) {
    return null;
  }

  return {
    statusCode: 409,
    code: 'CAR_HAS_ACTIVE_DEPOSIT_ORDER',
    message: buildDepositLockedCarStatusMessage(activeOrder, nextActionText),
    order: serializeActiveDepositLockOrder(activeOrder),
  };
};

const validateManualCarDelete = (carId) => {
  const activeOrder = getActiveDepositOrderForCar(carId);

  if (!activeOrder) {
    return null;
  }

  return {
    statusCode: 409,
    code: 'CAR_HAS_ACTIVE_DEPOSIT_ORDER',
    message: buildDepositLockedCarDeleteMessage(activeOrder),
    order: serializeActiveDepositLockOrder(activeOrder),
  };
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

const createSlugFromText = (value) =>
  String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

const validateBlogPostPayload = (blogPost = {}) => {
  const displayOrder = Number(blogPost.displayOrder || 0);
  const readTime = Number(blogPost.readTime || 5);
  const normalizedStatus = String(blogPost.status || '').trim().toLowerCase();
  const status = ['draft', 'published'].includes(normalizedStatus)
    ? normalizedStatus
    : normalizeBoolean(blogPost.isPublished)
      ? 'published'
      : 'draft';
  const title = normalizeShortText(blogPost.title, 180);
  const slug = createSlugFromText(blogPost.slug || title);
  const normalizedBlogPost = {
    slug,
    category: normalizeShortText(blogPost.category, 80),
    title,
    excerpt: normalizeShortText(blogPost.excerpt || blogPost.summary, 260),
    content: String(blogPost.content || '').trim().slice(0, 8000),
    imageUrl: String(blogPost.imageUrl || blogPost.image || '').trim().slice(0, 500),
    imageAlt: normalizeShortText(blogPost.imageAlt, 180),
    publishedAt: normalizePromotionDate(blogPost.publishedAt || blogPost.published_at),
    readTime: Number.isFinite(readTime) ? Math.min(60, Math.max(1, Math.trunc(readTime))) : 5,
    status,
    featured: normalizeBoolean(blogPost.featured),
    showOnHome: normalizeBoolean(blogPost.showOnHome ?? blogPost.show_on_home),
    displayOrder: Number.isFinite(displayOrder) ? Math.max(0, Math.trunc(displayOrder)) : 0,
  };

  if (normalizedBlogPost.title.length < 5) {
    return { error: 'Tiêu đề bài viết phải có ít nhất 5 ký tự.' };
  }

  if (!normalizedBlogPost.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedBlogPost.slug)) {
    return { error: 'Đường dẫn bài viết không hợp lệ.' };
  }

  if (!normalizedBlogPost.category) {
    return { error: 'Vui lòng nhập chủ đề bài viết.' };
  }

  if (!normalizedBlogPost.excerpt) {
    return { error: 'Vui lòng nhập mô tả ngắn cho bài viết.' };
  }

  if (!normalizedBlogPost.content) {
    return { error: 'Vui lòng nhập nội dung bài viết.' };
  }

  if (!isSafePromotionUrl(normalizedBlogPost.imageUrl)) {
    return { error: 'Đường dẫn ảnh bài viết không hợp lệ.' };
  }

  if (!isValidPromotionDate(normalizedBlogPost.publishedAt)) {
    return { error: 'Ngày đăng bài viết không hợp lệ.' };
  }

  return { blogPost: normalizedBlogPost };
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
  deposit: 'Đặt cọc xe',
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

const depositOrderPaymentMethodLabels = {
  bank: 'Chuyển khoản ngân hàng',
  vnpay: 'VNPay sandbox',
  wallet: 'Ví điện tử (sắp hỗ trợ)',
  card: 'Thẻ nội địa/quốc tế (sắp hỗ trợ)',
};
const depositOrderSupportedPaymentMethods = new Set(['bank', 'vnpay']);
const getActiveDepositPaymentSettings = () => getDepositPaymentSettings();
const getDepositBankDisplayName = (settings = getActiveDepositPaymentSettings()) =>
  [settings.accountName, settings.bankName]
    .filter(Boolean)
    .join(' - ');
const createDepositTransferNote = ({ carId, phone } = {}, settings = getActiveDepositPaymentSettings()) => {
  const normalizedCarId = Number(carId || 0);
  const carText = Number.isInteger(normalizedCarId) && normalizedCarId > 0
    ? `XE${normalizedCarId}`
    : 'XE';
  const phoneDigits = normalizePhoneDigits(phone);
  const phoneSuffix = phoneDigits ? ` ${phoneDigits.slice(-4)}` : '';
  const transferPrefix = normalizeShortText(settings.transferPrefix, 60) || 'OKXE COC';

  return normalizeShortText(`${transferPrefix} ${carText}${phoneSuffix}`, 120);
};

const getBooleanEnv = (name, fallback = false) => {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') {
    return fallback;
  }

  return !['0', 'false', 'no', 'off'].includes(String(rawValue).trim().toLowerCase());
};

const vnpaySandboxPaymentUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnpayLocalMockPaymentPath = '/api/deposit-payment/vnpay/mock-pay';
const vnpayPlaceholderCredentials = new Set([
  'your-vnpay-sandbox-tmn-code',
  'your-vnpay-sandbox-hash-secret',
  'okxedev1',
  'okxe-vnpay-dev-secret-change-me',
]);

const isLocalVnpayMockPaymentUrl = (paymentUrl = '') => {
  const normalizedUrl = String(paymentUrl || '').trim().toLowerCase();

  return normalizedUrl === vnpayLocalMockPaymentPath
    || normalizedUrl.endsWith(vnpayLocalMockPaymentPath);
};

const isVnpayPlaceholderCredential = (value = '') =>
  vnpayPlaceholderCredentials.has(String(value || '').trim().toLowerCase())
  || String(value || '').trim().toLowerCase().startsWith('your-');

const appendQueryToPaymentUrl = (paymentUrl = '', query = '') => {
  const normalizedPaymentUrl = String(paymentUrl || '').trim();
  const separator = normalizedPaymentUrl.includes('?') ? '&' : '?';

  return `${normalizedPaymentUrl}${separator}${query}`;
};

const getDepositVnpayConfig = () => {
  const testMode = getBooleanEnv('OKXE_VNPAY_SANDBOX_TEST_MODE', false)
    && process.env.NODE_ENV !== 'production';
  const tmnCode = String(process.env.OKXE_VNPAY_TMN_CODE || '').trim();
  const hashSecret = String(process.env.OKXE_VNPAY_HASH_SECRET || '').trim();
  const enabled = getBooleanEnv('OKXE_VNPAY_ENABLED', true);
  const paymentUrl = String(
    process.env.OKXE_VNPAY_PAYMENT_URL
    || (testMode ? vnpayLocalMockPaymentPath : vnpaySandboxPaymentUrl)
  ).trim();
  const localMock = testMode && isLocalVnpayMockPaymentUrl(paymentUrl);
  const hasCredentials = Boolean(tmnCode && hashSecret);
  const hasOfficialCredentials =
    hasCredentials
    && !isVnpayPlaceholderCredential(tmnCode)
    && !isVnpayPlaceholderCredential(hashSecret);
  const configured = enabled && (localMock ? hasCredentials : hasOfficialCredentials);
  const sandbox = paymentUrl.includes('sandbox.vnpayment.vn') || localMock;

  return {
    enabled,
    configured,
    testMode,
    localMock,
    officialSandbox: sandbox && !localMock,
    missingOfficialCredentials: enabled && !localMock && !hasOfficialCredentials,
    tmnCode,
    hashSecret,
    paymentUrl,
    returnUrl: String(process.env.OKXE_VNPAY_RETURN_URL || '').trim(),
    orderType: normalizeShortText(process.env.OKXE_VNPAY_ORDER_TYPE || 'other', 30) || 'other',
    bankCode: normalizeShortText(process.env.OKXE_VNPAY_BANK_CODE || '', 20),
    locale: normalizeShortText(process.env.OKXE_VNPAY_LOCALE || 'vn', 5) || 'vn',
    expireMinutes: Math.max(5, Math.min(60, Number(process.env.OKXE_VNPAY_EXPIRE_MINUTES || 15) || 15)),
    sandbox,
  };
};

const isDepositVnpayReady = () => getDepositVnpayConfig().configured;

const getSupportedDepositPaymentMethods = () => {
  const supportedMethods = ['bank'];

  if (isDepositVnpayReady()) {
    supportedMethods.push('vnpay');
  }

  return supportedMethods;
};

const getPublicBaseUrl = (req) => {
  const configuredBaseUrl = String(process.env.APP_BASE_URL || '').trim().replace(/\/+$/, '');

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const protocol = String(req.headers['x-forwarded-proto'] || req.protocol || 'http')
    .split(',')[0]
    .trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || `localhost:${port}`)
    .split(',')[0]
    .trim();

  return `${protocol}://${host}`.replace(/\/+$/, '');
};

const formatVnpayDate = (date = new Date()) => {
  const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (value) => String(value).padStart(2, '0');

  return [
    vietnamTime.getUTCFullYear(),
    pad(vietnamTime.getUTCMonth() + 1),
    pad(vietnamTime.getUTCDate()),
    pad(vietnamTime.getUTCHours()),
    pad(vietnamTime.getUTCMinutes()),
    pad(vietnamTime.getUTCSeconds()),
  ].join('');
};

const parseVnpayDate = (value) => {
  const normalizedValue = String(value || '').trim();
  const match = normalizedValue.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);

  if (!match) {
    return '';
  }

  const [, year, month, day, hour, minute, second] = match;

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const normalizeVnpayOrderInfo = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-zA-Z0-9 ._:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 255);

const buildVnpaySearchParams = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key];

      if (value !== undefined && value !== null && String(value) !== '') {
        searchParams.append(key, String(value));
      }
    });

  return searchParams;
};

const stringifyVnpayParams = (params = {}) =>
  buildVnpaySearchParams(params).toString();

const signVnpayParams = (params = {}, hashSecret = '') =>
  createHmac('sha512', String(hashSecret || '').trim())
    .update(Buffer.from(stringifyVnpayParams(params), 'utf-8'))
    .digest('hex');

const buildSignedVnpayUrl = (paymentUrl = '', params = {}, secureHash = '') => {
  const signedQuery = stringifyVnpayParams(params);

  if (/^https?:\/\//i.test(paymentUrl)) {
    const redirectUrl = new URL(paymentUrl);
    redirectUrl.search = signedQuery;
    redirectUrl.searchParams.append('vnp_SecureHash', secureHash);
    return redirectUrl.toString();
  }

  return appendQueryToPaymentUrl(paymentUrl, `${signedQuery}&vnp_SecureHash=${secureHash}`);
};

const getClientIpAddress = (req) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const rawIp = forwardedFor || req.socket?.remoteAddress || req.ip || '127.0.0.1';
  const normalizedIp = String(rawIp).replace('::ffff:', '').trim();

  return normalizedIp === '::1' ? '127.0.0.1' : normalizedIp.slice(0, 45);
};

const getDepositOrderIdFromVnpayTxnRef = (txnRef = '') => {
  const normalizedTxnRef = String(txnRef || '').trim();
  const match = normalizedTxnRef.match(/^(\d+)(?:[-_].+)?$/);
  const orderId = Number(match?.[1] || 0);

  return Number.isInteger(orderId) && orderId > 0 ? orderId : 0;
};

const createDepositVnpayPaymentUrl = (order, req, { uniqueTxnRef = false } = {}) => {
  const vnpayConfig = getDepositVnpayConfig();

  if (!vnpayConfig.configured) {
    const error = new Error('VNPay sandbox chưa được cấu hình đầy đủ.');
    error.code = 'VNPAY_NOT_CONFIGURED';
    throw error;
  }

  const now = new Date();
  const expireAt = new Date(now.getTime() + vnpayConfig.expireMinutes * 60 * 1000);
  const returnUrl = vnpayConfig.returnUrl || `${getPublicBaseUrl(req)}/api/deposit-payment/vnpay/return`;
  const txnRef = uniqueTxnRef ? `${String(order.id)}-${formatVnpayDate(now)}` : String(order.id);
  const orderCode = order.code || `DC-${String(order.id).padStart(6, '0')}`;
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Amount: Math.trunc(Number(order.depositAmount || 0) * 100),
    vnp_CreateDate: formatVnpayDate(now),
    vnp_CurrCode: 'VND',
    vnp_IpAddr: getClientIpAddress(req),
    vnp_Locale: vnpayConfig.locale,
    vnp_OrderInfo: normalizeVnpayOrderInfo(`Thanh toan dat coc OkXe ${orderCode}`),
    vnp_OrderType: vnpayConfig.orderType,
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: txnRef,
    vnp_ExpireDate: formatVnpayDate(expireAt),
  };

  if (vnpayConfig.bankCode) {
    params.vnp_BankCode = vnpayConfig.bankCode;
  }

  const secureHash = signVnpayParams(params, vnpayConfig.hashSecret);

  return {
    provider: 'vnpay',
    txnRef,
    paymentUrl: buildSignedVnpayUrl(vnpayConfig.paymentUrl, params, secureHash),
    expiresAt: expireAt.toISOString(),
  };
};

const verifyVnpayCallbackSignature = (query = {}) => {
  const vnpayConfig = getDepositVnpayConfig();
  const callbackParams = Object.entries(query || {}).reduce((params, [key, value]) => {
    if (String(key || '').startsWith('vnp_')) {
      params[key] = value;
    }

    return params;
  }, {});
  const secureHash = String(callbackParams.vnp_SecureHash || '').trim().toLowerCase();

  delete callbackParams.vnp_SecureHash;
  delete callbackParams.vnp_SecureHashType;

  if (!vnpayConfig.configured || !secureHash) {
    return false;
  }

  return signVnpayParams(callbackParams, vnpayConfig.hashSecret).toLowerCase() === secureHash;
};

const serializeDepositPaymentConfig = (settings = getActiveDepositPaymentSettings()) => {
  const amountOptions = Array.isArray(settings.depositAmountOptions)
    ? settings.depositAmountOptions
    : [];
  const vnpayConfig = getDepositVnpayConfig();
  const supportedPaymentMethods = getSupportedDepositPaymentMethods();
  const paymentMethods = supportedPaymentMethods.reduce((labels, paymentMethod) => {
    labels[paymentMethod] = depositOrderPaymentMethodLabels[paymentMethod] || paymentMethod;
    return labels;
  }, {});

  return {
    supportedPaymentMethods,
    paymentMethods,
    bank: {
      accountName: settings.accountName,
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      branch: settings.branch,
      transferPrefix: settings.transferPrefix,
      displayName: getDepositBankDisplayName(settings),
    },
    deposit: {
      amountOptions,
      defaultAmount: settings.defaultDepositAmount,
      minAmount: settings.minDepositAmount,
      maxAmount: settings.maxDepositAmount,
      holdHours: settings.holdHours,
      requireTransferProof: Boolean(settings.requireTransferProof),
      policyText: settings.policyText || '',
    },
    vnpay: {
      enabled: vnpayConfig.configured,
      sandbox: vnpayConfig.sandbox,
      testMode: vnpayConfig.testMode,
      localMock: vnpayConfig.localMock,
      officialSandbox: vnpayConfig.officialSandbox,
      paymentUrl: vnpayConfig.configured ? vnpayConfig.paymentUrl : '',
      expireMinutes: vnpayConfig.expireMinutes,
      setupMessage: vnpayConfig.configured
        ? (vnpayConfig.localMock
          ? 'VNPay sandbox mô phỏng nội bộ đã sẵn sàng.'
          : 'VNPay sandbox chính thức đã sẵn sàng.')
        : (vnpayConfig.missingOfficialCredentials
          ? 'Cần thay OKXE_VNPAY_TMN_CODE và OKXE_VNPAY_HASH_SECRET bằng thông tin merchant sandbox do VNPay cấp.'
          : 'Cần cấu hình OKXE_VNPAY_TMN_CODE và OKXE_VNPAY_HASH_SECRET trong .env để bật VNPay sandbox.'),
    },
    updatedAt: settings.updatedAt || '',
    updatedByName: settings.updatedByName || '',
  };
};

const normalizeMoneyAmountInput = (value, fallback = 0) => {
  const normalizedNumber = Number(String(value ?? '').replace(/[^\d]/g, ''));

  return Number.isFinite(normalizedNumber) && normalizedNumber > 0
    ? Math.trunc(normalizedNumber)
    : fallback;
};

const normalizeDepositAmountOptionsInput = (value) => {
  const rawOptions = Array.isArray(value)
    ? value
    : String(value || '').split(/[\s,;]+/);
  const seenAmounts = new Set();

  return rawOptions
    .map((amount) => normalizeMoneyAmountInput(amount, 0))
    .filter((amount) => amount > 0)
    .filter((amount) => {
      if (seenAmounts.has(amount)) {
        return false;
      }

      seenAmounts.add(amount);
      return true;
    })
    .slice(0, 8);
};

const validateDepositPaymentSettingsPayload = (payload = {}) => {
  const accountName = normalizeShortText(payload.accountName || payload.account_name, 100);
  const bankName = normalizeShortText(payload.bankName || payload.bank_name, 100);
  const accountNumber = normalizeShortText(payload.accountNumber || payload.account_number, 60);
  const branch = normalizeShortText(payload.branch, 100);
  const transferPrefix = normalizeShortText(payload.transferPrefix || payload.transfer_prefix, 60);
  const minDepositAmount = normalizeMoneyAmountInput(payload.minDepositAmount || payload.min_deposit_amount, 0);
  const maxDepositAmount = normalizeMoneyAmountInput(payload.maxDepositAmount || payload.max_deposit_amount, 0);
  const defaultDepositAmount = normalizeMoneyAmountInput(
    payload.defaultDepositAmount || payload.default_deposit_amount,
    0
  );
  const depositAmountOptions = normalizeDepositAmountOptionsInput(
    payload.depositAmountOptions ?? payload.deposit_amount_options_json
  );
  const policyText = String(payload.policyText ?? payload.policy_text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => normalizeShortText(line, 700))
    .filter(Boolean)
    .join('\n')
    .slice(0, 4000);
  const holdHours = Number(payload.holdHours || payload.hold_hours || 0);
  const requireTransferProof =
    payload.requireTransferProof === true
    || payload.require_transfer_proof === true
    || Number(payload.requireTransferProof || payload.require_transfer_proof || 0) === 1;

  if (accountName.length < 2) {
    return { error: 'Vui lòng nhập tên chủ tài khoản nhận cọc.' };
  }

  if (bankName.length < 2) {
    return { error: 'Vui lòng nhập tên ngân hàng nhận cọc.' };
  }

  if (accountNumber.length < 3) {
    return { error: 'Vui lòng nhập số tài khoản nhận cọc hợp lệ.' };
  }

  if (transferPrefix.length < 2) {
    return { error: 'Vui lòng nhập tiền tố nội dung chuyển khoản.' };
  }

  if (depositAmountOptions.length < 1) {
    return { error: 'Vui lòng nhập ít nhất một mức đặt cọc hiển thị.' };
  }

  if (minDepositAmount < 100000) {
    return { error: 'Số tiền đặt cọc tối thiểu phải từ 100.000 VNĐ trở lên.' };
  }

  if (maxDepositAmount < minDepositAmount) {
    return { error: 'Số tiền đặt cọc tối đa phải lớn hơn hoặc bằng mức tối thiểu.' };
  }

  if (defaultDepositAmount < minDepositAmount || defaultDepositAmount > maxDepositAmount) {
    return { error: 'Số tiền đặt cọc mặc định phải nằm trong khoảng tối thiểu và tối đa.' };
  }

  if (depositAmountOptions.some((amount) => amount < minDepositAmount || amount > maxDepositAmount)) {
    return { error: 'Các mức đặt cọc hiển thị phải nằm trong khoảng tối thiểu và tối đa.' };
  }

  if (!Number.isFinite(holdHours) || holdHours < 1 || holdHours > 168) {
    return { error: 'Thời gian giữ chỗ phải từ 1 đến 168 giờ.' };
  }

  if (policyText.length < 20) {
    return { error: 'Vui lòng nhập chính sách đặt cọc tối thiểu 20 ký tự.' };
  }

  return {
    settings: {
      accountName,
      bankName,
      accountNumber,
      branch,
      transferPrefix,
      depositAmountOptions,
      defaultDepositAmount,
      minDepositAmount,
      maxDepositAmount,
      holdHours: Math.trunc(holdHours),
      requireTransferProof,
      policyText,
    },
  };
};

const depositOrderStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã nhận tiền',
  completed: 'Hoàn tất giao dịch',
  cancelled_after_deposit: 'Hủy sau đặt cọc',
  cancelled: 'Đã hủy',
  expired: 'Quá hạn giữ chỗ',
};

const sendDepositOrderEmailNotification = (order, eventType = '') => {
  const recipientEmail = String(order?.email || '').trim();

  if (!order || !isValidEmail(recipientEmail)) {
    return;
  }

  sendDepositOrderEmail({
    to: recipientEmail,
    order,
    eventType,
  }).catch((error) => {
    console.error('Send deposit order email error:', error);
  });
};

const refreshOverdueDepositOrders = () => {
  try {
    const remindedOrders = remindPendingDepositOrders();
    const expiredOrders = expireOverdueDepositOrders();

    remindedOrders.forEach((order) => {
      sendDepositOrderEmailNotification(order, 'payment_reminder');
    });

    expiredOrders.forEach((order) => {
      sendDepositOrderEmailNotification(order, 'expired');
    });

    return expiredOrders;
  } catch (error) {
    console.error('Expire overdue deposit orders error:', error);
    return [];
  }
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

const validateDepositOrderPayload = (payload = {}) => {
  const depositSettings = getActiveDepositPaymentSettings();
  const normalizedOrder = {
    carId: Number(payload.carId || 0),
    fullName: normalizeShortText(payload.fullName, 120),
    phone: normalizeShortText(payload.phone, 30),
    email: normalizeShortText(payload.email, 160).toLowerCase(),
    province: normalizeShortText(payload.province || payload.city, 120),
    note: String(payload.note || '').trim().slice(0, 700),
    depositAmount: Number(payload.depositAmount || payload.amount || 0),
    paymentMethod: String(payload.paymentMethod || 'bank').trim().toLowerCase(),
    bankTransferNote: normalizeShortText(payload.bankTransferNote || payload.transferNote, 120),
  };
  const acceptedDepositPolicy =
    payload.acceptedDepositPolicy === true
    || payload.accepted_deposit_policy === true
    || Number(payload.acceptedDepositPolicy || payload.accepted_deposit_policy || 0) === 1;
  const phoneDigits = normalizePhoneDigits(normalizedOrder.phone);
  const hasValidPhoneFormat = /^\+?[0-9\s.-]{8,20}$/.test(normalizedOrder.phone);

  if (!Number.isInteger(normalizedOrder.carId) || normalizedOrder.carId <= 0) {
    return { error: 'Xe đặt cọc không hợp lệ.' };
  }

  if (normalizedOrder.fullName.length < 2) {
    return { error: 'Vui lòng nhập họ và tên khách hàng.' };
  }

  if (
    !normalizedOrder.phone
    || !hasValidPhoneFormat
    || phoneDigits.length < 8
    || phoneDigits.length > 15
  ) {
    return { error: 'Số điện thoại liên hệ không hợp lệ.' };
  }

  if (normalizedOrder.email && !isValidEmail(normalizedOrder.email)) {
    return { error: 'Email liên hệ không hợp lệ.' };
  }

  if (!acceptedDepositPolicy) {
    return { error: 'Vui lòng đọc và đồng ý chính sách đặt cọc trước khi gửi đơn.' };
  }

  if (!depositOrderSupportedPaymentMethods.has(normalizedOrder.paymentMethod)) {
    return { error: 'Phương thức thanh toán đặt cọc không hợp lệ.' };
  }

  if (normalizedOrder.paymentMethod === 'vnpay' && !isDepositVnpayReady()) {
    return { error: 'VNPay sandbox chưa được cấu hình. Vui lòng chọn chuyển khoản ngân hàng hoặc liên hệ OkXe để được hỗ trợ.' };
  }

  if (
    !Number.isFinite(normalizedOrder.depositAmount)
    || normalizedOrder.depositAmount < depositSettings.minDepositAmount
    || normalizedOrder.depositAmount > depositSettings.maxDepositAmount
  ) {
    return {
      error: `Số tiền đặt cọc phải từ ${depositSettings.minDepositAmount.toLocaleString('vi-VN')} đến ${depositSettings.maxDepositAmount.toLocaleString('vi-VN')} VNĐ.`,
    };
  }

  normalizedOrder.depositAmount = Math.trunc(normalizedOrder.depositAmount);
  normalizedOrder.bankTransferNote = normalizedOrder.bankTransferNote
    || createDepositTransferNote({
      carId: normalizedOrder.carId,
      phone: normalizedOrder.phone,
    }, depositSettings);

  return { order: normalizedOrder };
};

const normalizeDepositPaymentReceivedAt = (value) => {
  const normalizedValue = String(value || '').trim().replace(' ', 'T');
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(normalizedValue);

  if (!match) {
    return '';
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = '00'] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const parsedDate = new Date(year, month - 1, day, hour, minute, second);
  const isValidDate =
    parsedDate.getFullYear() === year
    && parsedDate.getMonth() === month - 1
    && parsedDate.getDate() === day
    && parsedDate.getHours() === hour
    && parsedDate.getMinutes() === minute
    && parsedDate.getSeconds() === second;

  if (!isValidDate) {
    return '';
  }

  return `${yearText}-${monthText}-${dayText} ${hourText}:${minuteText}:${secondText}`;
};

const validateDepositOrderStatusPayload = (payload = {}) => {
  const status = String(payload.status || '').trim().toLowerCase();
  const statusNote = normalizeShortText(payload.statusNote || payload.reason || payload.note, 500);
  const refundAmount = Math.max(
    0,
    Math.trunc(Number(String(payload.refundAmount ?? payload.refund_amount ?? 0).replace(/[^\d]/g, '')) || 0)
  );
  const refundReference = normalizeShortText(
    payload.refundReference || payload.refund_reference || payload.refundTransactionCode,
    120
  );
  const refundCompletedAt = normalizeDepositPaymentReceivedAt(
    payload.refundCompletedAt || payload.refund_completed_at || payload.refundPaidAt
  );
  const refundNote = normalizeShortText(payload.refundNote || payload.refund_note, 500);
  const paymentReference = normalizeShortText(
    payload.paymentReference || payload.transactionReference || payload.bankTransactionCode,
    120
  );
  const paymentReceivedAt = normalizeDepositPaymentReceivedAt(
    payload.paymentReceivedAt || payload.receivedAt || payload.confirmedReceivedAt
  );
  const paymentConfirmationNote = normalizeShortText(
    payload.paymentConfirmationNote || payload.confirmationNote || payload.internalNote,
    500
  );
  if (!Object.prototype.hasOwnProperty.call(depositOrderStatusLabels, status)) {
    return { error: 'Trạng thái đơn đặt cọc không hợp lệ.' };
  }

  if (status === 'confirmed' && paymentReference.length < 3) {
    return { error: 'Vui lòng nhập mã giao dịch hoặc mã tham chiếu khi xác nhận đã nhận tiền.' };
  }

  if (status === 'confirmed' && !paymentReceivedAt) {
    return { error: 'Vui lòng chọn thời gian nhận tiền hợp lệ.' };
  }

  if (status === 'cancelled' && statusNote.length < 3) {
    return { error: 'Vui lòng nhập lý do khi hủy đơn đặt cọc.' };
  }

  if (status === 'cancelled_after_deposit' && statusNote.length < 3) {
    return { error: 'Vui lòng nhập lý do khi hủy giao dịch sau đặt cọc.' };
  }

  if (status === 'cancelled_after_deposit' && refundAmount > 0 && refundReference.length < 3) {
    return { error: 'Vui lòng nhập mã giao dịch hoàn cọc khi có số tiền hoàn.' };
  }

  if (status === 'cancelled_after_deposit' && refundAmount > 0 && !refundCompletedAt) {
    return { error: 'Vui lòng chọn thời gian hoàn cọc hợp lệ.' };
  }
  return {
    statusUpdate: {
      status,
      statusNote,
      paymentReference,
      paymentReceivedAt,
      paymentConfirmationNote,
      refundAmount,
      refundReference,
      refundCompletedAt,
      refundNote,
    },
  };
};

const getDepositOrderIdFromPublicPayload = (payload = {}) => {
  const rawOrderId = Number(payload.orderId || payload.id || 0);

  if (Number.isInteger(rawOrderId) && rawOrderId > 0) {
    return rawOrderId;
  }

  const rawCode = String(payload.orderCode || payload.code || '').trim();
  const codeMatch = /^DC-(\d+)$/i.exec(rawCode);

  return codeMatch ? Number(codeMatch[1]) : 0;
};

const validateDepositOrderStatusCheckPayload = (payload = {}) => {
  const orderId = getDepositOrderIdFromPublicPayload(payload);
  const phone = normalizeShortText(payload.phone, 30);
  const phoneDigits = normalizePhoneDigits(phone);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { error: 'Mã đơn đặt cọc không hợp lệ.' };
  }

  if (!phoneDigits || phoneDigits.length < 8 || phoneDigits.length > 15) {
    return { error: 'Số điện thoại kiểm tra đơn không hợp lệ.' };
  }

  return { statusCheck: { orderId, phoneDigits } };
};

const serializeDepositOrderHistoryForCustomer = (historyItems = []) =>
  (Array.isArray(historyItems) ? historyItems : []).map((item) => ({
    id: item.id,
    previousStatus: item.previousStatus || '',
    previousStatusLabel: item.previousStatus ? depositOrderStatusLabels[item.previousStatus] || item.previousStatus : '',
    nextStatus: item.nextStatus,
    nextStatusLabel: depositOrderStatusLabels[item.nextStatus] || item.nextStatus,
    note: item.note,
    actorName: item.actorName,
    actionType: item.actionType,
    createdAt: item.createdAt,
  }));

const serializeDepositBankInfoForCustomer = (settings = getActiveDepositPaymentSettings()) => ({
  accountName: settings.accountName,
  bankName: settings.bankName,
  accountNumber: settings.accountNumber,
  branch: settings.branch,
  displayName: getDepositBankDisplayName(settings),
});

const serializeDepositOrderStatusForCustomer = (order) => ({
  id: order.id,
  code: order.code,
  carId: order.carId,
  carName: order.carName,
  carBrand: order.carBrand,
  depositAmount: order.depositAmount,
  paymentMethod: order.paymentMethod,
  bankTransferNote: order.bankTransferNote,
  bank: serializeDepositBankInfoForCustomer(),
  vnpayTxnRef: order.vnpayTxnRef,
  vnpayTransactionNo: order.vnpayTransactionNo,
  vnpayResponseCode: order.vnpayResponseCode,
  vnpayTransactionStatus: order.vnpayTransactionStatus,
  vnpayBankCode: order.vnpayBankCode,
  vnpayCardType: order.vnpayCardType,
  vnpayPayDate: order.vnpayPayDate,
  vnpayConfirmedAt: order.vnpayConfirmedAt,
  transferProofUrl: order.transferProofUrl,
  transferProofFileName: order.transferProofFileName,
  transferProofUploadedAt: order.transferProofUploadedAt,
  status: order.status,
  statusNote: order.statusNote,
  paymentReference: order.paymentReference,
  paymentReceivedAt: order.paymentReceivedAt,
  paymentConfirmedAt: order.paymentConfirmedAt,
  refundAmount: order.refundAmount,
  refundReference: order.refundReference,
  refundCompletedAt: order.refundCompletedAt,
  refundNote: order.refundNote,
  refundConfirmedByName: order.refundConfirmedByName,
  refundConfirmedAt: order.refundConfirmedAt,
  expiresAt: order.expiresAt,
  expiredAt: order.expiredAt,
  isOverdue: Boolean(order.isOverdue),
  history: serializeDepositOrderHistoryForCustomer(order.history),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const serializeDepositOrderForCustomerAccount = (order) => ({
  id: order.id,
  code: order.code,
  userId: order.userId,
  carId: order.carId,
  carName: order.carName,
  carBrand: order.carBrand,
  carPrice: order.carPrice,
  carPriceValue: order.carPriceValue,
  fullName: order.fullName,
  phone: order.phone,
  email: order.email,
  province: order.province,
  note: order.note,
  depositAmount: order.depositAmount,
  paymentMethod: order.paymentMethod,
  bankTransferNote: order.bankTransferNote,
  bank: serializeDepositBankInfoForCustomer(),
  vnpayTxnRef: order.vnpayTxnRef,
  vnpayTransactionNo: order.vnpayTransactionNo,
  vnpayResponseCode: order.vnpayResponseCode,
  vnpayTransactionStatus: order.vnpayTransactionStatus,
  vnpayBankCode: order.vnpayBankCode,
  vnpayCardType: order.vnpayCardType,
  vnpayPayDate: order.vnpayPayDate,
  vnpayPaymentUrl: order.vnpayPaymentUrl,
  vnpayConfirmedAt: order.vnpayConfirmedAt,
  transferProofUrl: order.transferProofUrl,
  transferProofFileName: order.transferProofFileName,
  transferProofUploadedAt: order.transferProofUploadedAt,
  status: order.status,
  statusNote: order.statusNote,
  paymentReference: order.paymentReference,
  paymentReceivedAt: order.paymentReceivedAt,
  paymentConfirmedAt: order.paymentConfirmedAt,
  refundAmount: order.refundAmount,
  refundReference: order.refundReference,
  refundCompletedAt: order.refundCompletedAt,
  refundNote: order.refundNote,
  refundConfirmedByName: order.refundConfirmedByName,
  refundConfirmedAt: order.refundConfirmedAt,
  expiresAt: order.expiresAt,
  expiredAt: order.expiredAt,
  isOverdue: Boolean(order.isOverdue),
  history: serializeDepositOrderHistoryForCustomer(order.history),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const serializeDepositReceipt = (order) => {
  const depositSettings = getActiveDepositPaymentSettings();
  const carTitle = [order.carBrand, order.carName].filter(Boolean).join(' ') || 'Xe đặt cọc';
  const depositAmount = Number(order.depositAmount || 0);
  const carPriceValue = Number(order.carPriceValue || 0);

  return {
    receiptCode: `BN-${String(order.id).padStart(6, '0')}`,
    orderCode: order.code,
    issuedAt: order.paymentConfirmedAt || order.updatedAt || '',
    status: order.status,
    statusLabel: depositOrderStatusLabels[order.status] || depositOrderStatusLabels.pending,
    customer: {
      fullName: order.fullName,
      phone: order.phone,
      email: order.email,
      province: order.province,
    },
    car: {
      id: order.carId,
      title: carTitle,
      brand: order.carBrand,
      name: order.carName,
      priceText: order.carPrice,
      priceValue: order.carPriceValue,
    },
    payment: {
      depositAmount,
      remainingAmount: carPriceValue > 0 ? Math.max(carPriceValue - depositAmount, 0) : null,
      method: order.paymentMethod,
      methodLabel: depositOrderPaymentMethodLabels[order.paymentMethod] || order.paymentMethod,
      bankTransferNote: order.bankTransferNote,
      paymentReference: order.paymentReference,
      paymentReceivedAt: order.paymentReceivedAt,
      paymentConfirmedAt: order.paymentConfirmedAt,
      confirmedByName: order.paymentConfirmedByName || 'OkXe',
      vnpayTxnRef: order.vnpayTxnRef,
      vnpayTransactionNo: order.vnpayTransactionNo,
      vnpayBankCode: order.vnpayBankCode,
      vnpayCardType: order.vnpayCardType,
      vnpayPayDate: order.vnpayPayDate,
      transferProofUrl: order.transferProofUrl,
      transferProofFileName: order.transferProofFileName,
      transferProofUploadedAt: order.transferProofUploadedAt,
    },
    bank: {
      accountName: depositSettings.accountName,
      bankName: depositSettings.bankName,
      accountNumber: depositSettings.accountNumber,
      branch: depositSettings.branch,
      displayName: getDepositBankDisplayName(depositSettings),
    },
    policyText: depositSettings.policyText || '',
    note: order.statusNote || '',
  };
};

const getConfirmedDepositReceiptOrError = (order) => {
  if (!order) {
    return { statusCode: 404, message: 'Không tìm thấy đơn đặt cọc.' };
  }

  if (!['confirmed', 'completed'].includes(String(order.status || '').trim().toLowerCase())) {
    return {
      statusCode: 409,
      message: 'Biên nhận chỉ khả dụng sau khi OkXe xác nhận đã nhận tiền đặt cọc.',
    };
  }

  return { receipt: serializeDepositReceipt(order) };
};

const normalizeVnpayCallbackQuery = (query = {}) =>
  Object.entries(query).reduce((normalizedQuery, [key, value]) => {
    normalizedQuery[key] = Array.isArray(value)
      ? String(value[0] || '').trim()
      : String(value || '').trim();
    return normalizedQuery;
  }, {});

const buildVnpayPaymentReference = (params = {}) => {
  const transactionNo = normalizeShortText(params.vnp_TransactionNo, 80);
  const txnRef = normalizeShortText(params.vnp_TxnRef, 80);

  return normalizeShortText(`VNPAY-${transactionNo || txnRef || Date.now()}`, 120);
};

const getVnpayCallbackPaymentNote = (params = {}) => {
  const noteParts = [
    `TxnRef: ${params.vnp_TxnRef || 'N/A'}`,
    `TransactionNo: ${params.vnp_TransactionNo || 'N/A'}`,
    `ResponseCode: ${params.vnp_ResponseCode || 'N/A'}`,
    `TransactionStatus: ${params.vnp_TransactionStatus || 'N/A'}`,
  ];

  if (params.vnp_BankCode) {
    noteParts.push(`Bank: ${params.vnp_BankCode}`);
  }

  if (params.vnp_CardType) {
    noteParts.push(`CardType: ${params.vnp_CardType}`);
  }

  return normalizeShortText(`VNPay - ${noteParts.join(', ')}`, 500);
};

const updateDepositOrderFromVnpayCallback = (order, params = {}, source = 'return') => {
  const callbackChanged =
    String(order.vnpayResponseCode || '') !== String(params.vnp_ResponseCode || '')
    || String(order.vnpayTransactionStatus || '') !== String(params.vnp_TransactionStatus || '')
    || String(order.vnpayTransactionNo || '') !== String(params.vnp_TransactionNo || '')
    || String(order.vnpayPayDate || '') !== String(params.vnp_PayDate || '');
  const sourceLabel = source === 'ipn' ? 'IPN' : 'return';

  return updateDepositOrderVnpayPayment(order.id, {
    txnRef: params.vnp_TxnRef,
    transactionNo: params.vnp_TransactionNo,
    responseCode: params.vnp_ResponseCode,
    transactionStatus: params.vnp_TransactionStatus,
    bankCode: params.vnp_BankCode,
    cardType: params.vnp_CardType,
    payDate: params.vnp_PayDate,
    historyNote: callbackChanged
      ? `VNPay ${sourceLabel} trả kết quả ${params.vnp_ResponseCode || 'N/A'} / ${params.vnp_TransactionStatus || 'N/A'}.`
      : '',
    actionType: source === 'ipn' ? 'vnpay_ipn_received' : 'vnpay_return_received',
  }) || order;
};

const processDepositVnpayCallback = (query = {}, source = 'return') => {
  const params = normalizeVnpayCallbackQuery(query);

  if (!verifyVnpayCallbackSignature(params)) {
    return {
      rspCode: '97',
      status: 'invalid',
      message: 'Invalid signature',
      customerMessage: 'Kết quả VNPay không hợp lệ chữ ký. Vui lòng liên hệ OkXe để kiểm tra đơn.',
    };
  }

  const orderId = getDepositOrderIdFromVnpayTxnRef(params.vnp_TxnRef);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return {
      rspCode: '99',
      status: 'invalid',
      message: 'Invalid order reference',
      customerMessage: 'Mã đơn VNPay không hợp lệ. Vui lòng tra cứu lại đơn đặt cọc.',
    };
  }

  const order = getDepositOrderById(orderId);

  if (!order) {
    return {
      rspCode: '01',
      status: 'not_found',
      message: 'Order not found',
      orderId,
      customerMessage: 'Không tìm thấy đơn đặt cọc tương ứng với giao dịch VNPay.',
    };
  }

  if (['confirmed', 'completed'].includes(String(order.status || '').trim().toLowerCase())) {
    return {
      rspCode: source === 'ipn' ? '02' : '00',
      status: 'success',
      message: source === 'ipn' ? 'Order already confirmed' : 'Confirm Success',
      order,
      alreadyConfirmed: true,
      customerMessage: 'OkXe đã xác nhận nhận tiền đặt cọc qua VNPay.',
    };
  }

  const callbackOrder = updateDepositOrderFromVnpayCallback(order, params, source);
  const expectedAmount = Math.trunc(Number(order.depositAmount || 0) * 100);
  const callbackAmount = Math.trunc(Number(params.vnp_Amount || 0));

  if (callbackAmount !== expectedAmount) {
    return {
      rspCode: '04',
      status: 'invalid_amount',
      message: 'Invalid amount',
      order: callbackOrder,
      customerMessage: 'Số tiền VNPay trả về không khớp đơn đặt cọc. Vui lòng liên hệ OkXe để đối soát.',
    };
  }

  if (String(order.paymentMethod || '').trim().toLowerCase() !== 'vnpay') {
    return {
      rspCode: '99',
      status: 'invalid_method',
      message: 'Order payment method is not VNPay',
      order: callbackOrder,
      customerMessage: 'Đơn đặt cọc này không dùng phương thức VNPay.',
    };
  }

  const isPaymentSuccess =
    params.vnp_ResponseCode === '00'
    && (!params.vnp_TransactionStatus || params.vnp_TransactionStatus === '00');

  if (!isPaymentSuccess) {
    const cancelledNote = params.vnp_ResponseCode === '24'
      ? 'Khách hàng đã hủy giao dịch trên cổng VNPay. Đơn đặt cọc được hủy, xe được mở lại nếu không còn đơn giữ chỗ khác.'
      : `Thanh toán VNPay không thành công (${params.vnp_ResponseCode || 'N/A'} / ${params.vnp_TransactionStatus || 'N/A'}). Đơn đặt cọc được hủy, khách cần tạo đơn và thanh toán lại nếu vẫn muốn giữ xe.`;
    const shouldCancelPendingOrder = String(callbackOrder.status || '').trim().toLowerCase() === 'pending';
    const cancelledOrder = shouldCancelPendingOrder
      ? updateDepositOrderStatus(order.id, {
        status: 'cancelled',
        statusNote: cancelledNote,
        actorUser: {
          id: 0,
          fullName: 'VNPay',
          email: '',
        },
        actionType: params.vnp_ResponseCode === '24'
          ? 'vnpay_payment_cancelled'
          : 'vnpay_payment_failed',
      }) || callbackOrder
      : callbackOrder;

    if (shouldCancelPendingOrder) {
      sendDepositOrderEmailNotification(cancelledOrder, 'cancelled');
    }

    return {
      rspCode: '00',
      status: params.vnp_ResponseCode === '24' ? 'cancelled' : 'failed',
      message: 'Payment failed or cancelled',
      order: cancelledOrder,
      customerMessage: params.vnp_ResponseCode === '24'
        ? 'Bạn đã hủy thanh toán VNPay. Đơn đặt cọc đã bị hủy, vui lòng tạo đơn mới nếu muốn giữ xe.'
        : 'Thanh toán VNPay chưa thành công. Đơn đặt cọc đã bị hủy, vui lòng tạo đơn mới và thanh toán lại nếu vẫn muốn giữ xe.',
    };
  }

  if (String(order.status || '').trim().toLowerCase() !== 'pending') {
    return {
      rspCode: '99',
      status: 'invalid_status',
      message: 'Order status cannot be confirmed',
      order: callbackOrder,
      customerMessage: 'Đơn đặt cọc không còn ở trạng thái chờ thanh toán.',
    };
  }

  const paymentReceivedAt = parseVnpayDate(params.vnp_PayDate) || new Date().toISOString();
  const paymentReference = buildVnpayPaymentReference(params);
  const updatedOrder = updateDepositOrderStatus(order.id, {
    status: 'confirmed',
    statusNote: 'OkXe đã nhận tiền đặt cọc qua VNPay.',
    paymentReference,
    paymentReceivedAt,
    paymentConfirmationNote: getVnpayCallbackPaymentNote(params),
    confirmedByUser: {
      id: 0,
      fullName: 'VNPay',
      email: '',
    },
    actorUser: {
      id: 0,
      fullName: 'VNPay',
      email: '',
    },
    actionType: 'vnpay_payment_confirmed',
  });

  const confirmedOrder = updateDepositOrderVnpayPayment(order.id, {
    confirmedAt: paymentReceivedAt,
  }) || updatedOrder;

  sendDepositOrderEmailNotification(confirmedOrder, 'confirmed');

  return {
    rspCode: '00',
    status: 'success',
    message: 'Confirm Success',
    order: confirmedOrder,
    customerMessage: 'OkXe đã xác nhận nhận tiền đặt cọc qua VNPay.',
  };
};

const getDepositVnpayReturnRedirect = (result = {}) => {
  const order = result.order || null;
  const params = new URLSearchParams({
    vnpayReturn: '1',
    vnpayStatus: result.status || 'unknown',
  });

  if (order?.id || result.orderId) {
    params.set('orderId', String(order?.id || result.orderId));
  }

  if (order?.code) {
    params.set('orderCode', order.code);
  }

  if (result.customerMessage) {
    params.set('message', result.customerMessage);
  }

  return `/thanh-toan-dat-coc?${params.toString()}`;
};

const depositVnpayMockScenarios = {
  success: {
    responseCode: '00',
    transactionStatus: '00',
    label: 'Giao dịch thành công',
  },
  insufficient: {
    responseCode: '51',
    transactionStatus: '02',
    label: 'Thẻ không đủ số dư',
  },
  inactive: {
    responseCode: '09',
    transactionStatus: '02',
    label: 'Thẻ chưa kích hoạt thanh toán trực tuyến',
  },
  locked: {
    responseCode: '12',
    transactionStatus: '02',
    label: 'Thẻ/tài khoản bị khóa',
  },
  expired: {
    responseCode: '54',
    transactionStatus: '02',
    label: 'Thẻ đã hết hạn',
  },
  cancelled: {
    responseCode: '24',
    transactionStatus: '02',
    label: 'Khách hàng hủy giao dịch',
  },
  failed: {
    responseCode: '99',
    transactionStatus: '02',
    label: 'Giao dịch không thành công',
  },
};

const depositVnpayMockCardScenarios = {
  9704198526191432198: 'success',
  9704195798459170488: 'insufficient',
  9704192181368742: 'inactive',
  9704193370791314: 'locked',
  9704194841945513: 'expired',
};

const getDepositVnpayMockScenario = (mockResult = 'success', cardNumber = '') => {
  const normalizedCardNumber = String(cardNumber || '').replace(/\D/g, '');
  const scenarioFromCard = depositVnpayMockCardScenarios[normalizedCardNumber] || '';
  const normalizedResult = String(mockResult || '').trim().toLowerCase();
  const scenarioKey = depositVnpayMockScenarios[normalizedResult]
    ? normalizedResult
    : scenarioFromCard || 'failed';

  return depositVnpayMockScenarios[scenarioKey] || depositVnpayMockScenarios.failed;
};

const buildDepositVnpayMockCallbackUrl = (paymentParams = {}, mockResult = 'success', cardNumber = '') => {
  const vnpayConfig = getDepositVnpayConfig();
  const transactionNo = String(Date.now()).slice(-10);
  const mockScenario = getDepositVnpayMockScenario(mockResult, cardNumber);
  const isSuccess =
    mockScenario.responseCode === '00'
    && mockScenario.transactionStatus === '00';
  const callbackParams = {
    vnp_Amount: paymentParams.vnp_Amount,
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: isSuccess ? `OKXEMOCK${transactionNo}` : '',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: paymentParams.vnp_OrderInfo,
    vnp_PayDate: formatVnpayDate(new Date()),
    vnp_ResponseCode: mockScenario.responseCode,
    vnp_TmnCode: paymentParams.vnp_TmnCode,
    vnp_TransactionNo: isSuccess ? transactionNo : '',
    vnp_TransactionStatus: mockScenario.transactionStatus,
    vnp_TxnRef: paymentParams.vnp_TxnRef,
  };
  callbackParams.vnp_SecureHash = signVnpayParams(callbackParams, vnpayConfig.hashSecret);

  return `${paymentParams.vnp_ReturnUrl || '/api/deposit-payment/vnpay/return'}?${stringifyVnpayParams(callbackParams)}`;
};

const createDepositTransferProofError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const saveDepositTransferProofForOrder = (order, {
  file = null,
  actorUser = null,
  actorName = '',
  actorLabel = 'Khách hàng',
  allowedStatuses = ['confirmed'],
  note = '',
} = {}) => {
  if (!order) {
    throw createDepositTransferProofError('Không tìm thấy đơn đặt cọc.', 404);
  }

  if (!file) {
    throw createDepositTransferProofError('Vui lòng chọn ảnh biên lai/chứng từ chuyển khoản.');
  }

  const status = String(order.status || '').trim().toLowerCase();

  if (!allowedStatuses.includes(status)) {
    throw createDepositTransferProofError('Chỉ đơn đặt cọc đã được xác nhận nhận tiền mới được bổ sung biên lai chuyển khoản.', 409);
  }

  const transferProofUrl = saveUploadedDepositProof(file, `deposit-${order.code || order.id}`);

  return updateDepositOrderTransferProof(order.id, {
    transferProofUrl,
    transferProofFileName: normalizeShortText(file.name || 'Biên lai chuyển khoản', 180),
    actorUserId: actorUser?.id,
    actorName: actorName || actorUser?.fullName || actorUser?.email || order.fullName,
    actorLabel,
    note,
  });
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

const validateCarSellRequestApprovePayload = (payload = {}) => {
  const statusNote = normalizeShortText(payload.statusNote || payload.note, 500);
  const customerDealPriceText = normalizeShortText(
    payload.customerDealPriceText || payload.customerPriceText || payload.purchasePriceText,
    80
  );
  const customerDealPriceValue = normalizeMoneyAmountInput(
    payload.customerDealPriceValue || payload.customerPriceValue || payload.purchasePriceValue,
    0
  );
  const finalPriceText = normalizeShortText(
    payload.finalPriceText || payload.salePriceText || payload.priceText,
    80
  );
  const finalPriceValue = normalizeMoneyAmountInput(
    payload.finalPriceValue || payload.salePriceValue || payload.priceValue,
    0
  );
  if (customerDealPriceText.length < 2) {
    return { error: 'Vui lòng nhập giá chốt với khách trước khi duyệt nhập kho.' };
  }

  if (!Number.isFinite(customerDealPriceValue) || customerDealPriceValue <= 0) {
    return { error: 'Vui lòng nhập giá chốt với khách dạng số lớn hơn 0.' };
  }

  if (finalPriceText.length < 2) {
    return { error: 'Vui lòng nhập giá bán trên hệ thống trước khi duyệt nhập kho.' };
  }

  if (!Number.isFinite(finalPriceValue) || finalPriceValue <= 0) {
    return { error: 'Vui lòng nhập giá bán trên hệ thống dạng số lớn hơn 0.' };
  }
  return {
    statusUpdate: {
      statusNote,
      customerDealPriceText,
      customerDealPriceValue,
      finalPriceText,
      finalPriceValue,
    },
  };
};

const validateSalesKpiRecordPayload = (payload = {}) => {
  const kpiType = String(payload.kpiType || payload.kpi_type || '').trim().toLowerCase();
  const sourceId = Number(payload.sourceId || payload.source_id || 0);
  const saleUserId = Number(payload.saleUserId || payload.sale_user_id || 0);
  const rewardAmount = normalizeMoneyAmountInput(payload.rewardAmount || payload.reward_amount, 0);
  const rewardStatus = String(payload.rewardStatus || payload.reward_status || 'pending').trim().toLowerCase();
  const note = normalizeShortText(payload.note, 500);

  if (!['acquisition', 'sale', 'direct_sale'].includes(kpiType)) {
    return { error: 'Loại thành tích KPI không hợp lệ.' };
  }

  if (!Number.isInteger(sourceId) || sourceId <= 0) {
    return { error: 'Vui lòng chọn giao dịch thành công để ghi nhận KPI.' };
  }

  if (!Number.isInteger(saleUserId) || saleUserId <= 0) {
    return { error: 'Vui lòng chọn sale chịu trách nhiệm.' };
  }

  if (!Number.isFinite(rewardAmount) || rewardAmount < 0) {
    return { error: 'Tiền thưởng KPI không hợp lệ.' };
  }

  if (!['pending', 'paid'].includes(rewardStatus)) {
    return { error: 'Trạng thái thưởng KPI không hợp lệ.' };
  }

  return {
    kpiRecord: {
      kpiType,
      sourceId,
      saleUserId,
      rewardAmount,
      rewardStatus,
      note,
    },
  };
};

const validateSalesKpiCancellationPayload = (payload = {}) => {
  const cancellationNote = normalizeShortText(payload.cancellationNote || payload.cancellation_note || payload.note, 500);

  if (cancellationNote.length < 3) {
    return { error: 'Vui lòng nhập lý do hủy ghi nhận KPI.' };
  }

  return { cancellationNote };
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

const buildBlogArticleStructuredData = (req, blogPost, description, canonicalUrl, imageUrl) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      headline: blogPost.title,
      description,
      image: [imageUrl],
      datePublished: blogPost.publishedAt || blogPost.createdAt || '',
      dateModified: blogPost.updatedAt || blogPost.publishedAt || blogPost.createdAt || '',
      author: {
        '@type': 'Person',
        name: blogPost.authorName || blogPost.author || 'Ban biên tập OkXe',
      },
      publisher: {
        '@type': 'Organization',
        name: 'OkXe',
      },
      articleSection: blogPost.category || 'Blog ô tô',
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Trang chủ',
          item: getAbsoluteUrl(req, '/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: getAbsoluteUrl(req, '/blog'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: blogPost.title,
          item: canonicalUrl,
        },
      ],
    },
  ],
});

const buildBlogArticleSeoMeta = (req, blogPost) => {
  const canonicalUrl = getAbsoluteUrl(req, `/blog/${encodeURIComponent(blogPost.slug)}`);
  const title = normalizeSeoText(`${blogPost.title} | OkXe Blog`, 68);
  const description = normalizeSeoText(
    blogPost.excerpt || `Đọc bài viết ${blogPost.title} trên OkXe Blog.`,
    158
  );
  const primaryImage = blogPost.imageUrl || blogPost.image || '/images/blog-1.jpg';
  const absoluteImageUrl = getAbsoluteUrl(req, primaryImage);
  const authorName = blogPost.authorName || blogPost.author || 'Ban biên tập OkXe';
  const structuredData = JSON.stringify(
    buildBlogArticleStructuredData(req, blogPost, description, canonicalUrl, absoluteImageUrl)
  ).replace(/</g, '\\u003c');

  return `
    <!-- OKXE_BLOG_SEO_META -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <meta name="robots" content="index, follow">
    <meta property="og:locale" content="vi_VN">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:image" content="${escapeHtml(absoluteImageUrl)}">
    <meta property="article:published_time" content="${escapeHtml(blogPost.publishedAt || blogPost.createdAt || '')}">
    <meta property="article:modified_time" content="${escapeHtml(blogPost.updatedAt || blogPost.publishedAt || blogPost.createdAt || '')}">
    <meta property="article:author" content="${escapeHtml(authorName)}">
    <meta property="article:section" content="${escapeHtml(blogPost.category || 'Blog ô tô')}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(absoluteImageUrl)}">
    <script type="application/ld+json" id="blog-article-seo-json">${structuredData}</script>
    <!-- /OKXE_BLOG_SEO_META -->
  `;
};

const getBlogPostSortTime = (blogPost = {}) => {
  const preferredDate = String(blogPost.publishedAt || '').slice(0, 10);
  const fallbackDateTime = String(blogPost.createdAt || '').replace(' ', 'T');
  const preferredTime = preferredDate ? Date.parse(`${preferredDate}T00:00:00`) : 0;
  const fallbackTime = fallbackDateTime ? Date.parse(fallbackDateTime) : 0;

  return preferredTime || fallbackTime || 0;
};

const renderBlogArticleHtml = (req, blogPost) => {
  const template = fs.readFileSync(path.join(publicPath, 'blog', 'article.html'), 'utf8');
  const seoMeta = buildBlogArticleSeoMeta(req, blogPost);

  return template.replace(
    /<!-- OKXE_BLOG_SEO_META -->[\s\S]*?<!-- \/OKXE_BLOG_SEO_META -->/,
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

app.post('/api/uploads/promotion-image', requireUserManager, profileJsonParser, (req, res) => {
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

app.post('/api/uploads/promotion-image/cropped', requireUserManager, profileJsonParser, (req, res) => {
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

app.post('/api/uploads/blog-image', requireUserManager, profileJsonParser, (req, res) => {
  const file = req.body?.file;

  if (!file) {
    res.status(400).json({ message: 'Vui lòng chọn ảnh bài viết blog.' });
    return;
  }

  try {
    const imageUrl = saveUploadedBlogImage(file);

    res.status(201).json({
      message: 'Tải ảnh bài viết blog thành công.',
      imageUrl,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Không thể tải ảnh bài viết blog.' });
  }
});

app.post('/api/uploads/blog-image/cropped', requireUserManager, profileJsonParser, (req, res) => {
  const file = req.body?.file;

  if (!file) {
    res.status(400).json({ message: 'Vui lòng cắt ảnh bài viết blog trước khi tải lên.' });
    return;
  }

  try {
    const imageUrl = saveUploadedBlogImage(file, 'blog-cover');

    res.status(201).json({
      message: 'Tải ảnh bài viết blog thành công.',
      imageUrl,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Không thể tải ảnh bài viết blog.' });
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

app.post('/api/deposit-orders/:id/transfer-proof', depositOrderStatusCheckRateLimit, profileJsonParser, (req, res) => {
  const orderId = Number(req.params.id);
  const phoneDigits = normalizePhoneDigits(req.body?.phone || '');
  const file = req.body?.file;

  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ message: 'Mã đơn đặt cọc không hợp lệ.' });
    return;
  }

  if (!phoneDigits || phoneDigits.length < 8 || phoneDigits.length > 15) {
    res.status(400).json({ message: 'Vui lòng nhập số điện thoại đã dùng khi đặt cọc.' });
    return;
  }

  if (!file) {
    res.status(400).json({ message: 'Vui lòng chọn ảnh chứng từ chuyển khoản.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = getDepositOrderById(orderId);

    if (!order || normalizePhoneDigits(order.phone) !== phoneDigits) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc khớp với số điện thoại này.' });
      return;
    }

    if (String(order.status || '').trim().toLowerCase() !== 'confirmed') {
      res.status(409).json({ message: 'Chỉ có thể tải biên lai cho đơn đã được xác nhận nhận tiền.' });
      return;
    }

    const updatedOrder = saveDepositTransferProofForOrder(order, {
      file,
      actorName: order.fullName,
      actorLabel: 'Khách hàng',
    });

    res.status(201).json({
      message: 'Đã tải chứng từ chuyển khoản. Nhân viên OkXe sẽ đối chiếu và xác nhận.',
      order: serializeDepositOrderStatusForCustomer(updatedOrder),
    });
  } catch (error) {
    console.error('Upload deposit transfer proof error:', error);
    res.status(400).json({ message: error.message || 'Không thể tải chứng từ chuyển khoản.' });
  }
});

app.post('/api/deposit-orders/:id/transfer-proof/account', requireUser, profileJsonParser, (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ message: 'Mã đơn đặt cọc không hợp lệ.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = getDepositOrderById(orderId);

    if (!order || Number(order.userId || 0) !== Number(req.user.id)) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc của bạn.' });
      return;
    }

    const updatedOrder = saveDepositTransferProofForOrder(order, {
      file: req.body?.file,
      actorUser: req.user,
      actorName: req.user.fullName || req.user.email || order.fullName,
      actorLabel: 'Khách hàng',
      allowedStatuses: ['confirmed'],
    });

    res.status(201).json({
      message: 'Đã tải ảnh biên lai chuyển khoản cho đơn đặt cọc.',
      order: serializeDepositOrderForCustomerAccount(updatedOrder),
    });
  } catch (error) {
    console.error('Upload customer account deposit transfer proof error:', error);
    res.status(error.statusCode || 400).json({ message: error.message || 'Không thể tải ảnh biên lai chuyển khoản.' });
  }
});

app.post('/api/admin/deposit-orders/:id/transfer-proof', requireAdmin, profileJsonParser, (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ message: 'Mã đơn đặt cọc không hợp lệ.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = getDepositOrderById(orderId);

    if (!order) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc.' });
      return;
    }

    const updatedOrder = saveDepositTransferProofForOrder(order, {
      file: req.body?.file,
      actorUser: req.user,
      actorName: req.user.fullName || req.user.email || 'Nhân viên OkXe',
      actorLabel: 'Nhân viên OkXe',
      allowedStatuses: ['confirmed'],
      note: `Nhân viên OkXe tải biên lai chuyển khoản thay khách từ kênh nhắn tin/gửi ngoài hệ thống.`,
    });

    res.status(201).json({
      message: 'Đã tải biên lai chuyển khoản cho đơn đặt cọc.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Upload admin deposit transfer proof error:', error);
    res.status(error.statusCode || 400).json({ message: error.message || 'Không thể tải biên lai chuyển khoản.' });
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
  const blogPost = getPublicBlogPostBySlug(req.params.slug);

  if (!blogPost) {
    res.status(404).sendFile(path.join(publicPath, 'blog', 'article.html'));
    return;
  }

  try {
    res.send(renderBlogArticleHtml(req, blogPost));
  } catch (error) {
    console.error('Render blog article SEO page error:', error);
    res.sendFile(path.join(publicPath, 'blog', 'article.html'));
  }
});

app.get(['/dang-ky-lai-thu', '/dang-ky-lai-thu/', '/dang-ky-lai-thu.html'], (req, res) => {
  sendPublicPage(res, publicPages.testDrive);
});

app.get(['/thanh-toan-dat-coc', '/thanh-toan-dat-coc/', '/thanh-toan-dat-coc.html'], (req, res) => {
  sendPublicPage(res, publicPages.depositPayment);
});

app.get('/car-detail.html', (req, res) => {
  sendPublicPage(res, publicPages.carDetail);
});

app.get('/cars/:id', (req, res) => {
  const carId = Number(req.params.id);
  refreshOverdueDepositOrders();
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
  refreshOverdueDepositOrders();
  res.json({ cars: listCars() });
});

app.get('/api/admin/cars', requireAdmin, (req, res) => {
  refreshOverdueDepositOrders();
  res.json({ cars: listAdminCars() });
});

app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  res.json({ notifications: listAdminNotifications() });
});

app.patch('/api/admin/notifications/read', requireAdmin, (req, res) => {
  try {
    const changedCount = markAllAdminNotificationsRead();

    res.json({
      message: 'Đã đánh dấu tất cả thông báo admin là đã đọc.',
      changedCount,
    });
  } catch (dbError) {
    console.error('Mark all admin notifications read error:', dbError);
    res.status(500).json({ message: 'Không thể đánh dấu thông báo admin đã đọc lúc này.' });
  }
});

app.patch('/api/admin/notifications/:id/read', requireAdmin, (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isFinite(notificationId)) {
    res.status(400).json({ message: 'Mã thông báo admin không hợp lệ.' });
    return;
  }

  try {
    const notification = markAdminNotificationRead(notificationId);

    if (!notification) {
      res.status(404).json({ message: 'Không tìm thấy thông báo admin.' });
      return;
    }

    res.json({
      message: 'Đã đánh dấu thông báo admin là đã đọc.',
      notification,
    });
  } catch (dbError) {
    console.error('Mark admin notification read error:', dbError);
    res.status(500).json({ message: 'Không thể đánh dấu thông báo admin đã đọc lúc này.' });
  }
});

app.delete('/api/admin/notifications/:id', requireAdmin, (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isFinite(notificationId)) {
    res.status(400).json({ message: 'Mã thông báo admin không hợp lệ.' });
    return;
  }

  try {
    const notification = deleteAdminNotification(notificationId);

    if (!notification) {
      res.status(404).json({ message: 'Không tìm thấy thông báo admin.' });
      return;
    }

    res.json({
      message: 'Đã xóa thông báo admin.',
      notification,
    });
  } catch (dbError) {
    console.error('Delete admin notification error:', dbError);
    res.status(500).json({ message: 'Không thể xóa thông báo admin lúc này.' });
  }
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

app.get('/api/blog/posts', (req, res) => {
  res.json({ posts: listPublicBlogPosts() });
});

app.get('/api/blog/posts/home', (req, res) => {
  res.json({ posts: listHomepageBlogPosts() });
});

app.get('/api/blog/posts/:slug', (req, res) => {
  const blogPost = getPublicBlogPostBySlug(req.params.slug);

  if (!blogPost) {
    res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    return;
  }

  const publicBlogPosts = listPublicBlogPosts();
  const latestPosts = [...publicBlogPosts]
    .filter((post) => post.slug !== blogPost.slug)
    .sort((first, second) =>
      getBlogPostSortTime(second) - getBlogPostSortTime(first)
      || Number(second.id || 0) - Number(first.id || 0)
    )
    .slice(0, 4);
  const relatedPosts = publicBlogPosts
    .filter((post) => post.slug !== blogPost.slug)
    .sort((first, second) => Number(second.category === blogPost.category) - Number(first.category === blogPost.category))
    .slice(0, 3);

  res.json({ post: blogPost, relatedPosts, latestPosts });
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

app.patch('/api/notifications/my/read', requireUser, (req, res) => {
  try {
    const changedCount = markAllUserNotificationsRead(req.user.id);

    res.json({
      message: 'Đã đánh dấu tất cả thông báo là đã đọc.',
      changedCount,
    });
  } catch (dbError) {
    console.error('Mark all user notifications read error:', dbError);
    res.status(500).json({ message: 'Không thể đánh dấu thông báo đã đọc lúc này.' });
  }
});

app.patch('/api/notifications/my/:id/read', requireUser, (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isFinite(notificationId)) {
    res.status(400).json({ message: 'Mã thông báo không hợp lệ.' });
    return;
  }

  try {
    const notification = markUserNotificationRead(req.user.id, notificationId);

    if (!notification) {
      res.status(404).json({ message: 'Không tìm thấy thông báo của bạn.' });
      return;
    }

    res.json({
      message: 'Đã đánh dấu thông báo là đã đọc.',
      notification,
    });
  } catch (dbError) {
    console.error('Mark user notification read error:', dbError);
    res.status(500).json({ message: 'Không thể đánh dấu thông báo đã đọc lúc này.' });
  }
});

app.delete('/api/notifications/my/:id', requireUser, (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isFinite(notificationId)) {
    res.status(400).json({ message: 'Mã thông báo không hợp lệ.' });
    return;
  }

  try {
    const notification = deleteUserNotificationForUser(req.user.id, notificationId);

    if (!notification) {
      res.status(404).json({ message: 'Không tìm thấy thông báo của bạn.' });
      return;
    }

    res.json({
      message: 'Đã xóa thông báo.',
      notification,
    });
  } catch (dbError) {
    console.error('Delete user notification error:', dbError);
    res.status(500).json({ message: 'Không thể xóa thông báo lúc này.' });
  }
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

app.get('/api/deposit-orders/my', requireUser, (req, res) => {
  refreshOverdueDepositOrders();
  res.json({
    orders: listDepositOrdersByUser(req.user.id)
      .map(serializeDepositOrderForCustomerAccount),
  });
});

app.post('/api/deposit-orders/:id/vnpay/resume', depositOrderStatusCheckRateLimit, requireUser, (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ message: 'Mã đơn đặt cọc không hợp lệ.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = getDepositOrderById(orderId);

    if (!order || Number(order.userId || 0) !== Number(req.user.id)) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc của bạn.' });
      return;
    }

    if (String(order.paymentMethod || '').trim().toLowerCase() !== 'vnpay') {
      res.status(409).json({ message: 'Đơn đặt cọc này không dùng phương thức thanh toán VNPay.' });
      return;
    }

    if (String(order.status || '').trim().toLowerCase() !== 'pending') {
      res.status(409).json({
        message: 'Đơn đặt cọc này không còn ở trạng thái chờ thanh toán nên không thể tiếp tục thanh toán VNPay.',
        order: serializeDepositOrderForCustomerAccount(order),
      });
      return;
    }

    const payment = createDepositVnpayPaymentUrl(order, req, { uniqueTxnRef: true });
    const updatedOrder = updateDepositOrderVnpayPayment(order.id, {
      txnRef: payment.txnRef,
      paymentUrl: payment.paymentUrl,
      historyNote: 'Khách hàng mở lại luồng thanh toán VNPay từ mục Quản lý đặt cọc.',
      actionType: 'vnpay_payment_url_resumed',
    }) || order;

    res.json({
      message: 'Đã tạo lại luồng thanh toán VNPay. Hệ thống sẽ chuyển bạn sang cổng thanh toán.',
      order: serializeDepositOrderForCustomerAccount(updatedOrder),
      payment,
    });
  } catch (error) {
    if (error?.code === 'VNPAY_NOT_CONFIGURED') {
      res.status(503).json({ message: error.message });
      return;
    }

    console.error('Resume VNPay deposit payment error:', error);
    res.status(500).json({ message: 'Không thể tiếp tục thanh toán VNPay lúc này.' });
  }
});

app.get('/api/deposit-orders/:id/receipt', requireUser, (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ message: 'Mã đơn đặt cọc không hợp lệ.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = getDepositOrderById(orderId);

    if (!order || Number(order.userId || 0) !== Number(req.user.id)) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc của bạn.' });
      return;
    }

    const { receipt, statusCode, message } = getConfirmedDepositReceiptOrError(order);

    if (!receipt) {
      res.status(statusCode || 400).json({ message });
      return;
    }

    res.json({ receipt });
  } catch (dbError) {
    console.error('Get customer deposit receipt error:', dbError);
    res.status(500).json({ message: 'Không thể tải biên nhận đặt cọc lúc này.' });
  }
});

app.get('/api/deposit-payment/config', (req, res) => {
  res.json(serializeDepositPaymentConfig());
});

app.get('/api/deposit-payment/vnpay/mock-pay', (req, res) => {
  const vnpayConfig = getDepositVnpayConfig();

  if (!vnpayConfig.localMock) {
    res.status(404).send('VNPay mock payment is disabled.');
    return;
  }

  const paymentParams = normalizeVnpayCallbackQuery(req.query || {});
  const mockResult = String(paymentParams.mockResult || '').trim().toLowerCase();
  const mockCard = String(paymentParams.mockCard || '').trim();

  delete paymentParams.mockResult;
  delete paymentParams.mockCard;
  delete paymentParams.mockMethod;

  if (!verifyVnpayCallbackSignature(paymentParams)) {
    res.status(400).send('Yêu cầu thanh toán test không hợp lệ chữ ký.');
    return;
  }

  if (mockResult) {
    res.redirect(buildDepositVnpayMockCallbackUrl(paymentParams, mockResult, mockCard));
    return;
  }

  const currentUrl = new URL(req.originalUrl, getPublicBaseUrl(req));
  currentUrl.searchParams.delete('mockResult');
  currentUrl.searchParams.delete('mockCard');
  currentUrl.searchParams.delete('mockMethod');
  const successUrl = new URL(currentUrl.toString());
  const failedUrl = new URL(currentUrl.toString());
  const cancelledUrl = new URL(currentUrl.toString());
  successUrl.searchParams.set('mockResult', 'success');
  failedUrl.searchParams.set('mockResult', 'failed');
  cancelledUrl.searchParams.set('mockResult', 'cancelled');
  const displayAmount = (Number(paymentParams.vnp_Amount || 0) / 100).toLocaleString('vi-VN');
  const expireDisplay = parseVnpayDate(paymentParams.vnp_ExpireDate) || paymentParams.vnp_ExpireDate || 'Theo cấu hình đơn hàng';

  res.set('Cache-Control', 'no-store');
  res.send(`<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VNPay sandbox demo - OkXe</title>
  <style>
    * { box-sizing: border-box; }
    :root {
      color-scheme: light;
      --ink: #07134d;
      --muted: #667085;
      --line: #dfe6f3;
      --soft: #f6f8fc;
      --blue: #123c9c;
      --red: #ef2f2f;
      --orange: #f15a29;
      --green: #0a8f56;
    }
    body {
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(180deg, #eef3ff 0%, #f8fafc 45%, #fff 100%);
      color: var(--ink);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }
    main {
      width: min(1120px, calc(100% - 32px));
      margin: 28px auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 22px 70px rgba(8, 21, 74, 0.14);
      overflow: hidden;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 22px 26px;
      border-bottom: 1px solid var(--line);
      background: #fff;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .mark {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      color: #fff;
      background: linear-gradient(135deg, var(--blue), var(--red));
      font-weight: 900;
      letter-spacing: 0;
    }
    h1 {
      margin: 0;
      font-size: clamp(22px, 3vw, 32px);
      line-height: 1.15;
      letter-spacing: 0;
    }
    .subtitle {
      margin: 4px 0 0;
      color: var(--muted);
      font-weight: 700;
      line-height: 1.45;
    }
    .mode {
      flex: 0 0 auto;
      padding: 8px 12px;
      border-radius: 999px;
      color: var(--green);
      background: #eafaf2;
      font-size: 13px;
      font-weight: 900;
      white-space: nowrap;
    }
    .content {
      display: grid;
      grid-template-columns: 360px 1fr;
      min-height: 620px;
    }
    aside {
      padding: 26px;
      background: #f9fbff;
      border-right: 1px solid var(--line);
    }
    .eyebrow {
      margin: 0 0 8px;
      color: var(--orange);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    h2 {
      margin: 0;
      font-size: 22px;
      line-height: 1.25;
      letter-spacing: 0;
    }
    .summary-list {
      display: grid;
      gap: 12px;
      margin: 22px 0;
    }
    .summary-item {
      padding: 14px;
      border: 1px solid #e8edf7;
      border-radius: 8px;
      background: #fff;
    }
    dt {
      color: var(--muted);
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    dd {
      margin: 6px 0 0;
      color: var(--ink);
      font-size: 16px;
      font-weight: 900;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }
    .test-card {
      margin-top: 18px;
      padding: 14px;
      border: 1px dashed #b9c6df;
      border-radius: 8px;
      background: #fff;
      color: #3f4d75;
      font-weight: 750;
      line-height: 1.5;
    }
    .test-card strong {
      color: var(--ink);
      display: block;
      margin-bottom: 6px;
    }
    .checkout {
      padding: 26px;
    }
    .steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 24px;
    }
    .step {
      min-height: 74px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--muted);
      font-weight: 850;
    }
    .step-number {
      display: inline-grid;
      place-items: center;
      width: 24px;
      height: 24px;
      margin-bottom: 7px;
      border-radius: 999px;
      background: #eaf0fb;
      color: var(--blue);
      font-size: 13px;
      font-weight: 950;
    }
    .step.is-active {
      border-color: #9ab2ee;
      background: #f2f6ff;
      color: var(--ink);
    }
    .step.is-done {
      border-color: #b9ebd2;
      background: #eefbf5;
      color: var(--green);
    }
    .step.is-done .step-number {
      background: var(--green);
      color: #fff;
    }
    .panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      overflow: hidden;
    }
    .panel[hidden] {
      display: none;
    }
    .panel-head {
      padding: 18px 20px;
      border-bottom: 1px solid var(--line);
      background: #fbfcff;
    }
    .panel-title {
      margin: 0;
      font-size: 20px;
      font-weight: 950;
      line-height: 1.3;
    }
    .panel-copy {
      margin: 6px 0 0;
      color: var(--muted);
      font-weight: 700;
      line-height: 1.45;
    }
    .panel-body {
      padding: 20px;
    }
    .method-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .method {
      display: grid;
      gap: 7px;
      min-height: 120px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--ink);
      text-align: left;
      cursor: pointer;
      font: inherit;
    }
    .method strong {
      font-size: 16px;
      line-height: 1.25;
    }
    .method span {
      color: var(--muted);
      font-size: 13px;
      font-weight: 750;
      line-height: 1.4;
    }
    .method.is-active {
      border-color: #8da8e9;
      background: #f3f7ff;
      box-shadow: inset 0 0 0 1px #8da8e9;
    }
    .method[disabled] {
      cursor: not-allowed;
      opacity: 0.56;
    }
    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    label {
      display: grid;
      gap: 7px;
      color: #4b587c;
      font-size: 13px;
      font-weight: 900;
      line-height: 1.35;
    }
    input,
    select {
      width: 100%;
      min-height: 46px;
      padding: 0 12px;
      border: 1px solid #ccd6ea;
      border-radius: 8px;
      color: var(--ink);
      background: #fff;
      font: 800 15px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      letter-spacing: 0;
      outline: none;
    }
    input:focus,
    select:focus {
      border-color: #5179dc;
      box-shadow: 0 0 0 3px rgba(81, 121, 220, 0.14);
    }
    .full {
      grid-column: 1 / -1;
    }
    .hint {
      margin: 10px 0 0;
      color: #5d6d95;
      font-size: 13px;
      font-weight: 750;
      line-height: 1.45;
    }
    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 22px;
    }
    button,
    .link-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0 18px;
      border: 0;
      border-radius: 999px;
      font: 900 15px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      text-decoration: none;
      cursor: pointer;
    }
    .primary {
      color: #fff;
      background: var(--orange);
      box-shadow: 0 12px 28px rgba(241, 90, 41, 0.25);
    }
    .secondary {
      color: var(--ink);
      background: #eef3ff;
    }
    .danger {
      color: #aa1e1e;
      background: #fff1f1;
    }
    .error {
      min-height: 20px;
      margin: 12px 0 0;
      color: #b42318;
      font-weight: 850;
      line-height: 1.4;
    }
    .otp-box {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 190px;
      gap: 16px;
      align-items: end;
    }
    .result-box {
      padding: 22px;
      border-radius: 8px;
      background: #f3f7ff;
      color: var(--ink);
      font-weight: 800;
      line-height: 1.55;
    }
    noscript nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 18px;
    }
    @media (max-width: 900px) {
      .content { grid-template-columns: 1fr; }
      aside { border-right: 0; border-bottom: 1px solid var(--line); }
      .steps,
      .method-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      main { width: 100%; margin: 0; border-radius: 0; border-left: 0; border-right: 0; }
      header { align-items: flex-start; flex-direction: column; padding: 18px; }
      aside,
      .checkout { padding: 18px; }
      .steps,
      .method-grid,
      .field-grid,
      .otp-box { grid-template-columns: 1fr; }
      .actions { justify-content: stretch; }
      button,
      .link-button { width: 100%; }
      noscript nav { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="brand">
        <span class="mark">VN</span>
        <div>
          <h1>VNPay sandbox demo</h1>
          <p class="subtitle">Luồng thanh toán đặt cọc OkXe qua cổng test nội bộ</p>
        </div>
      </div>
      <div class="mode">TEST MODE</div>
    </header>

    <div class="content">
      <aside>
        <p class="eyebrow">Thông tin đơn hàng</p>
        <h2>Đặt cọc giữ xe OkXe</h2>
        <dl class="summary-list">
          <div class="summary-item"><dt>Mã đơn</dt><dd>${escapeHtml(paymentParams.vnp_TxnRef || '')}</dd></div>
          <div class="summary-item"><dt>Số tiền</dt><dd>${escapeHtml(displayAmount)} VNĐ</dd></div>
          <div class="summary-item"><dt>Nội dung</dt><dd>${escapeHtml(paymentParams.vnp_OrderInfo || '')}</dd></div>
          <div class="summary-item"><dt>Hết hạn</dt><dd>${escapeHtml(expireDisplay)}</dd></div>
        </dl>
        <div class="test-card">
          <strong>Thẻ test thành công</strong>
          Số thẻ: 9704198526191432198<br>
          Tên chủ thẻ: NGUYEN VAN A<br>
          Ngày phát hành: 07/15<br>
          OTP: 123456
        </div>
      </aside>

      <section class="checkout" aria-label="Thanh toán VNPay sandbox">
        <div class="steps" aria-label="Các bước thanh toán">
          <div class="step is-active" data-step="1"><span class="step-number">1</span><div>Kiểm tra đơn</div></div>
          <div class="step" data-step="2"><span class="step-number">2</span><div>Nhập thông tin thẻ</div></div>
          <div class="step" data-step="3"><span class="step-number">3</span><div>Xác thực OTP</div></div>
          <div class="step" data-step="4"><span class="step-number">4</span><div>Trả kết quả</div></div>
        </div>

        <section class="panel" data-panel="1">
          <div class="panel-head">
            <p class="panel-title">Chọn phương thức thanh toán</p>
            <p class="panel-copy">Màn này mô phỏng cổng VNPay sandbox để kiểm thử luồng tự động của website.</p>
          </div>
          <div class="panel-body">
            <div class="method-grid">
              <button class="method is-active" type="button" data-method="ncb">
                <strong>Thẻ ATM NCB</strong>
                <span>Hỗ trợ đầy đủ bước nhập thẻ và OTP trong bản demo.</span>
              </button>
              <button class="method" type="button" data-method="qr" disabled>
                <strong>VNPay QR</strong>
                <span>Sẽ dùng khi kết nối sandbox chính thức.</span>
              </button>
              <button class="method" type="button" data-method="card" disabled>
                <strong>Thẻ quốc tế</strong>
                <span>Sẽ dùng khi merchant được bật thêm kênh thẻ.</span>
              </button>
            </div>
            <div class="actions">
              <a class="link-button danger" href="${escapeHtml(cancelledUrl.toString())}">Hủy giao dịch</a>
              <button class="primary" type="button" data-next-from-intro>Tiếp tục thanh toán</button>
            </div>
            <noscript>
              <nav>
                <a class="link-button primary" href="${escapeHtml(successUrl.toString())}">Thanh toán test thành công</a>
                <a class="link-button danger" href="${escapeHtml(cancelledUrl.toString())}">Hủy giao dịch</a>
              </nav>
            </noscript>
          </div>
        </section>

        <section class="panel" data-panel="2" hidden>
          <div class="panel-head">
            <p class="panel-title">Thông tin thẻ thanh toán</p>
            <p class="panel-copy">Dùng thẻ test để mô phỏng phản hồi của ngân hàng trong sandbox.</p>
          </div>
          <div class="panel-body">
            <div class="field-grid">
              <label class="full">
                Kịch bản test
                <select id="demo-scenario">
                  <option value="success">Thành công - NCB</option>
                  <option value="insufficient">Thất bại - Không đủ số dư</option>
                  <option value="inactive">Thất bại - Thẻ chưa kích hoạt</option>
                  <option value="locked">Thất bại - Thẻ bị khóa</option>
                  <option value="expired">Thất bại - Thẻ hết hạn</option>
                </select>
              </label>
              <label>
                Số thẻ
                <input id="card-number" inputmode="numeric" autocomplete="off" value="9704198526191432198">
              </label>
              <label>
                Tên chủ thẻ
                <input id="card-name" autocomplete="cc-name" value="NGUYEN VAN A">
              </label>
              <label>
                Ngày phát hành
                <input id="issue-date" autocomplete="off" value="07/15">
              </label>
              <label>
                Ngân hàng
                <input value="NCB" readonly>
              </label>
            </div>
            <p class="hint" id="scenario-hint">Giao dịch sẽ trả về mã 00 và đơn đặt cọc được tự xác nhận đã nhận tiền.</p>
            <p class="error" id="card-error" role="alert"></p>
            <div class="actions">
              <button class="secondary" type="button" data-back="1">Quay lại</button>
              <button class="primary" type="button" id="continue-otp">Tiếp tục xác thực</button>
            </div>
          </div>
        </section>

        <section class="panel" data-panel="3" hidden>
          <div class="panel-head">
            <p class="panel-title">Xác thực giao dịch</p>
            <p class="panel-copy">Nhập OTP test để hoàn tất bước xác thực ngân hàng.</p>
          </div>
          <div class="panel-body">
            <div class="otp-box">
              <label>
                Mã OTP
                <input id="otp-code" inputmode="numeric" autocomplete="one-time-code" value="123456">
              </label>
              <button class="primary" type="button" id="confirm-payment">Xác nhận OTP</button>
            </div>
            <p class="hint">OTP thành công trong demo là 123456. Với kịch bản thất bại, cổng test sẽ trả mã lỗi tương ứng về website.</p>
            <p class="error" id="otp-error" role="alert"></p>
            <div class="actions">
              <button class="secondary" type="button" data-back="2">Quay lại</button>
              <a class="link-button danger" href="${escapeHtml(cancelledUrl.toString())}">Hủy giao dịch</a>
            </div>
          </div>
        </section>

        <section class="panel" data-panel="4" hidden>
          <div class="panel-head">
            <p class="panel-title">Đang trả kết quả về OkXe</p>
            <p class="panel-copy">Website sẽ nhận callback, kiểm tra chữ ký và cập nhật trạng thái đơn đặt cọc.</p>
          </div>
          <div class="panel-body">
            <div class="result-box">Vui lòng chờ trong giây lát, hệ thống đang chuyển kết quả thanh toán về trang đặt cọc.</div>
          </div>
        </section>
      </section>
    </div>
  </main>
  <script>
    const successUrl = ${JSON.stringify(successUrl.toString())};
    const failedUrl = ${JSON.stringify(failedUrl.toString())};
    const scenarioData = {
      success: {
        card: '9704198526191432198',
        issue: '07/15',
        hint: 'Giao dịch sẽ trả về mã 00 và đơn đặt cọc được tự xác nhận đã nhận tiền.'
      },
      insufficient: {
        card: '9704195798459170488',
        issue: '07/15',
        hint: 'Giao dịch sẽ trả về mã 51 để mô phỏng thẻ không đủ số dư.'
      },
      inactive: {
        card: '9704192181368742',
        issue: '07/15',
        hint: 'Giao dịch sẽ trả về trạng thái thất bại do thẻ chưa kích hoạt thanh toán trực tuyến.'
      },
      locked: {
        card: '9704193370791314',
        issue: '07/15',
        hint: 'Giao dịch sẽ trả về trạng thái thất bại do thẻ hoặc tài khoản bị khóa.'
      },
      expired: {
        card: '9704194841945513',
        issue: '07/15',
        hint: 'Giao dịch sẽ trả về trạng thái thất bại do thẻ đã hết hạn.'
      }
    };
    const panels = Array.from(document.querySelectorAll('[data-panel]'));
    const steps = Array.from(document.querySelectorAll('[data-step]'));
    const scenarioSelect = document.getElementById('demo-scenario');
    const cardNumberInput = document.getElementById('card-number');
    const cardNameInput = document.getElementById('card-name');
    const issueDateInput = document.getElementById('issue-date');
    const otpInput = document.getElementById('otp-code');
    const scenarioHint = document.getElementById('scenario-hint');
    const cardError = document.getElementById('card-error');
    const otpError = document.getElementById('otp-error');

    const setStep = (step) => {
      panels.forEach((panel) => {
        panel.hidden = Number(panel.dataset.panel) !== step;
      });
      steps.forEach((stepElement) => {
        const stepNumber = Number(stepElement.dataset.step);
        stepElement.classList.toggle('is-active', stepNumber === step);
        stepElement.classList.toggle('is-done', stepNumber < step);
      });
    };

    const syncScenario = () => {
      const scenario = scenarioData[scenarioSelect.value] || scenarioData.success;
      cardNumberInput.value = scenario.card;
      cardNameInput.value = 'NGUYEN VAN A';
      issueDateInput.value = scenario.issue;
      scenarioHint.textContent = scenario.hint;
      cardError.textContent = '';
      otpError.textContent = '';
    };

    document.querySelector('[data-next-from-intro]').addEventListener('click', () => setStep(2));
    document.querySelectorAll('[data-back]').forEach((button) => {
      button.addEventListener('click', () => setStep(Number(button.dataset.back)));
    });
    scenarioSelect.addEventListener('change', syncScenario);

    document.getElementById('continue-otp').addEventListener('click', () => {
      const cardNumber = cardNumberInput.value.replace(/\\D/g, '');
      const cardName = cardNameInput.value.trim();
      const issueDate = issueDateInput.value.trim();
      cardError.textContent = '';

      if (cardNumber.length < 12 || cardNumber.length > 24) {
        cardError.textContent = 'Vui lòng nhập số thẻ test hợp lệ.';
        return;
      }

      if (!cardName) {
        cardError.textContent = 'Vui lòng nhập tên chủ thẻ.';
        return;
      }

      if (!/^\\d{2}\\/\\d{2}$/.test(issueDate)) {
        cardError.textContent = 'Ngày phát hành cần có dạng MM/YY, ví dụ 07/15.';
        return;
      }

      setStep(3);
      otpInput.focus();
    });

    document.getElementById('confirm-payment').addEventListener('click', () => {
      const selectedScenario = scenarioSelect.value || 'success';
      const otpCode = otpInput.value.trim();
      otpError.textContent = '';

      if (selectedScenario === 'success' && otpCode !== '123456') {
        otpError.textContent = 'OTP test chưa đúng. Vui lòng nhập 123456 để thanh toán thành công.';
        return;
      }

      const target = new URL(selectedScenario === 'success' ? successUrl : failedUrl);
      target.searchParams.set('mockResult', selectedScenario);
      target.searchParams.set('mockCard', cardNumberInput.value.replace(/\\D/g, ''));
      setStep(4);
      window.location.href = target.toString();
    });

    syncScenario();
  </script>
</body>
</html>`);
});

app.get('/api/deposit-payment/vnpay/return', (req, res) => {
  try {
    const result = processDepositVnpayCallback(req.query || {}, 'return');
    res.redirect(getDepositVnpayReturnRedirect(result));
  } catch (error) {
    console.error('VNPay deposit return error:', error);
    res.redirect(getDepositVnpayReturnRedirect({
      status: 'error',
      customerMessage: 'Không thể xử lý kết quả VNPay lúc này. Vui lòng tra cứu lại đơn hoặc liên hệ OkXe.',
    }));
  }
});

app.get('/api/deposit-payment/vnpay/ipn', (req, res) => {
  try {
    const result = processDepositVnpayCallback(req.query || {}, 'ipn');

    res.json({
      RspCode: result.rspCode || '99',
      Message: result.message || 'Unknown',
    });
  } catch (error) {
    console.error('VNPay deposit IPN error:', error);
    res.json({
      RspCode: '99',
      Message: 'Unknown error',
    });
  }
});

app.post('/api/deposit-orders', depositOrderRateLimit, requireUser, (req, res) => {
  const { order, error } = validateDepositOrderPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const createdOrder = createDepositOrder({
      userId: req.user.id,
      ...order,
    });

    if (!createdOrder) {
      res.status(400).json({ message: 'Xe đã chọn không còn trong trạng thái còn xe hoặc không tồn tại.' });
      return;
    }

    let orderForResponse = createdOrder;
    let payment = null;
    let message = 'OkXe đã nhận yêu cầu đặt cọc. Nhân viên sẽ kiểm tra và xác nhận trong thời gian sớm nhất.';

    if (createdOrder.paymentMethod === 'vnpay') {
      payment = createDepositVnpayPaymentUrl(createdOrder, req);
      orderForResponse = updateDepositOrderVnpayPayment(createdOrder.id, {
        txnRef: payment.txnRef,
        paymentUrl: payment.paymentUrl,
        historyNote: 'Đã tạo URL thanh toán VNPay sandbox cho khách.',
        actionType: 'vnpay_payment_url_created',
      }) || createdOrder;
      message = 'OkXe đã tạo đơn đặt cọc. Hệ thống sẽ chuyển bạn sang VNPay sandbox để thanh toán tự động.';
    }

    sendDepositOrderEmailNotification(orderForResponse, 'created');

    res.status(201).json({
      message,
      order: orderForResponse,
      payment,
    });
  } catch (dbError) {
    if (dbError?.code === 'DEPOSIT_CAR_ALREADY_HELD') {
      res.status(409).json({
        message: 'Xe này đang được giữ chỗ bởi một đơn đặt cọc khác. Vui lòng chọn xe khác hoặc liên hệ OkXe để được hỗ trợ.',
      });
      return;
    }

    console.error('Create deposit order error:', dbError);
    res.status(500).json({ message: 'Không thể gửi yêu cầu đặt cọc lúc này.' });
  }
});

app.post('/api/deposit-orders/status-check', depositOrderStatusCheckRateLimit, (req, res) => {
  const { statusCheck, error } = validateDepositOrderStatusCheckPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = getDepositOrderById(statusCheck.orderId);

    if (!order || normalizePhoneDigits(order.phone) !== statusCheck.phoneDigits) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc khớp với số điện thoại này.' });
      return;
    }

    res.json({
      order: serializeDepositOrderStatusForCustomer(order),
      statuses: depositOrderStatusLabels,
    });
  } catch (dbError) {
    console.error('Check deposit order status error:', dbError);
    res.status(500).json({ message: 'Không thể kiểm tra trạng thái đơn đặt cọc lúc này.' });
  }
});

app.post('/api/deposit-orders/receipt', depositOrderStatusCheckRateLimit, (req, res) => {
  const { statusCheck, error } = validateDepositOrderStatusCheckPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = getDepositOrderById(statusCheck.orderId);

    if (!order || normalizePhoneDigits(order.phone) !== statusCheck.phoneDigits) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc khớp với số điện thoại này.' });
      return;
    }

    const { receipt, statusCode, message } = getConfirmedDepositReceiptOrError(order);

    if (!receipt) {
      res.status(statusCode || 400).json({ message });
      return;
    }

    res.json({ receipt });
  } catch (dbError) {
    console.error('Get public deposit receipt error:', dbError);
    res.status(500).json({ message: 'Không thể tải biên nhận đặt cọc lúc này.' });
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
  refreshOverdueDepositOrders();
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

  if (!canManageUsers(req.user) && car.actionText !== carAvailableStatusText) {
    res.status(403).json({ message: 'Nhân viên chỉ được thêm xe mới ở trạng thái Còn xe.' });
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

  const existingCar = getCarById(carId);
  if (!existingCar) {
    res.status(404).json({ message: 'Không tìm thấy xe để cập nhật.' });
    return;
  }

  if (!canManageUsers(req.user) && car.actionText !== existingCar.actionText) {
    res.status(403).json({ message: 'Chỉ tài khoản admin mới được thay đổi trạng thái xe.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const lockedStatus = validateManualCarStatusChange(carId, car.actionText);

    if (lockedStatus) {
      res.status(lockedStatus.statusCode).json({
        code: lockedStatus.code,
        message: lockedStatus.message,
        order: lockedStatus.order,
      });
      return;
    }

    const updatedCar = updateCar(carId, car, {
      actorUser: req.user,
      kpiSaleUserId: Number(req.body?.kpiSaleUserId || 0),
    });

    if (!updatedCar) {
      res.status(404).json({ message: 'Không tìm thấy xe để cập nhật.' });
      return;
    }

    res.json({
      message: updatedCar.actionText === 'Xe đã bán'
        ? 'Cập nhật xe thành công và đã tự động ghi nhận KPI bán xe.'
        : 'Cập nhật xe thành công.',
      car: updatedCar,
    });
  } catch (dbError) {
    if (['SALES_KPI_SALE_INVALID', 'SALES_KPI_ROLE_INVALID', 'SALES_KPI_POLICY_MISSING', 'SALES_KPI_COMMISSION_MISSING', 'SALES_KPI_PERIOD_LOCKED'].includes(dbError?.code)) {
      res.status(400).json({ message: dbError.message });
      return;
    }
    console.error('Update car error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật xe lúc này.' });
  }
});

app.delete('/api/cars/:id', requireUserManager, (req, res) => {
  const carId = Number(req.params.id);

  if (!Number.isFinite(carId)) {
    res.status(400).json({ message: 'Mã xe không hợp lệ.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const lockedDelete = validateManualCarDelete(carId);

    if (lockedDelete) {
      res.status(lockedDelete.statusCode).json({
        code: lockedDelete.code,
        message: lockedDelete.message,
        order: lockedDelete.order,
      });
      return;
    }

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

app.post('/api/admin/promotions', requireUserManager, (req, res) => {
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

app.put('/api/admin/promotions/:id', requireUserManager, (req, res) => {
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

app.delete('/api/admin/promotions/:id', requireUserManager, (req, res) => {
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

app.get('/api/admin/blog-posts', requireAdmin, (req, res) => {
  res.json({
    posts: listAdminBlogPosts(),
    stats: getBlogPostStats(),
  });
});

app.post('/api/admin/blog-posts', requireUserManager, (req, res) => {
  const { blogPost, error } = validateBlogPostPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const createdBlogPost = createBlogPost(blogPost, req.user);

    res.status(201).json({
      message: 'Tạo bài viết blog thành công.',
      post: createdBlogPost,
      stats: getBlogPostStats(),
    });
  } catch (dbError) {
    if (String(dbError.message || '').includes('UNIQUE constraint failed: blog_posts.slug')) {
      res.status(409).json({ message: 'Đường dẫn bài viết này đã tồn tại. Vui lòng đổi slug khác.' });
      return;
    }

    console.error('Create blog post error:', dbError);
    res.status(500).json({ message: 'Không thể tạo bài viết blog lúc này.' });
  }
});

app.put('/api/admin/blog-posts/:id', requireUserManager, (req, res) => {
  const blogPostId = Number(req.params.id);
  const { blogPost, error } = validateBlogPostPayload(req.body || {});

  if (!Number.isFinite(blogPostId)) {
    res.status(400).json({ message: 'Mã bài viết blog không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const updatedBlogPost = updateBlogPost(blogPostId, blogPost);

    if (!updatedBlogPost) {
      res.status(404).json({ message: 'Không tìm thấy bài viết blog để cập nhật.' });
      return;
    }

    res.json({
      message: 'Cập nhật bài viết blog thành công.',
      post: updatedBlogPost,
      stats: getBlogPostStats(),
    });
  } catch (dbError) {
    if (String(dbError.message || '').includes('UNIQUE constraint failed: blog_posts.slug')) {
      res.status(409).json({ message: 'Đường dẫn bài viết này đã tồn tại. Vui lòng đổi slug khác.' });
      return;
    }

    console.error('Update blog post error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật bài viết blog lúc này.' });
  }
});

app.delete('/api/admin/blog-posts/:id', requireUserManager, (req, res) => {
  const blogPostId = Number(req.params.id);

  if (!Number.isFinite(blogPostId)) {
    res.status(400).json({ message: 'Mã bài viết blog không hợp lệ.' });
    return;
  }

  try {
    const deletedBlogPost = deleteBlogPost(blogPostId);

    if (!deletedBlogPost) {
      res.status(404).json({ message: 'Không tìm thấy bài viết blog để xóa.' });
      return;
    }

    res.json({
      message: 'Xóa bài viết blog thành công.',
      post: deletedBlogPost,
      stats: getBlogPostStats(),
    });
  } catch (dbError) {
    console.error('Delete blog post error:', dbError);
    res.status(500).json({ message: 'Không thể xóa bài viết blog lúc này.' });
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

app.patch('/api/admin/car-sell-requests/:id/approve', requireUserManager, (req, res) => {
  const requestId = Number(req.params.id);
  const { statusUpdate, error } = validateCarSellRequestApprovePayload(req.body || {});

  if (!Number.isFinite(requestId)) {
    res.status(400).json({ message: 'Mã thông tin đăng bán xe không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const result = approveCarSellRequest(requestId, statusUpdate);

    if (!result) {
      res.status(404).json({ message: 'Không tìm thấy thông tin đăng bán xe.' });
      return;
    }

    res.json({
      message: 'Đã duyệt, nhập xe vào kho và chuyển giao dịch vào mục KPI để admin gắn nhân viên nhập xe.',
      request: result.request,
      car: result.car,
    });
  } catch (dbError) {
    console.error('Approve car sell request error:', dbError);
    if (
      dbError?.code === 'CAR_SELL_CUSTOMER_DEAL_PRICE_TEXT_REQUIRED'
      || dbError?.code === 'CAR_SELL_CUSTOMER_DEAL_PRICE_VALUE_REQUIRED'
      ||
      dbError?.code === 'CAR_SELL_FINAL_PRICE_TEXT_REQUIRED'
      || dbError?.code === 'CAR_SELL_FINAL_PRICE_VALUE_REQUIRED'
    ) {
      res.status(400).json({ message: dbError.message });
      return;
    }
    res.status(500).json({ message: 'Không thể duyệt thông tin đăng bán xe lúc này.' });
  }
});

app.patch('/api/admin/car-sell-requests/:id/reject', requireUserManager, (req, res) => {
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

app.get('/api/admin/sales-kpi-records', requireAdmin, (req, res) => {
  const isAdminUser = canManageUsers(req.user);
  const enforcedSaleUserId = isAdminUser ? req.query.saleUserId : req.user.id;
  const salesEmployees = listUsers()
    .filter((user) => user.role === 'staff')
    .filter((user) => isAdminUser || user.id === req.user.id)
    .map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      salesTitle: user.salesTitle || 'Nhân viên kinh doanh',
    }));

  const report = getSalesKpiReport({
    from: req.query.from,
    to: req.query.to,
    saleUserId: enforcedSaleUserId,
    kpiType: req.query.kpiType,
    rewardStatus: req.query.rewardStatus,
    recordStatus: req.query.recordStatus,
    targetPeriod: req.query.targetPeriod,
  });

  const visibleReport = isAdminUser
    ? report
    : {
        ...report,
        alerts: {
          missingAcquisitionLinks: [],
          pendingAcquisitions: [],
          unconfiguredEmployees: [],
          invalidCommissionPolicies: [],
          invalidAcquisitionRewardPolicies: [],
        },
        policyHistory: [],
        entryPolicies: (report.entryPolicies || []).filter(
          (policy) => Number(policy.saleUserId) === Number(req.user.id)
        ),
      };

  res.json({
    records: report.records,
    stats: report.summary,
    report: visibleReport,
    availableSources: isAdminUser ? listAvailableSalesKpiSources() : {},
    salesEmployees,
    readOnly: !isAdminUser,
  });
});

app.get('/api/admin/sales-kpi-assignees', requireAdmin, (req, res) => {
  const type = String(req.query.type || '').trim().toLowerCase();
  const businessDate = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.businessDate || ''))
    ? String(req.query.businessDate)
    : new Date().toISOString().slice(0, 10);
  const period = businessDate.slice(0, 7);
  const report = getSalesKpiReport({ targetPeriod: period });
  const policyMap = new Map((report.entryPolicies || []).map((policy) => [Number(policy.saleUserId), policy]));
  const employees = listUsers().filter((user) => user.role === 'staff').flatMap((user) => {
    const policy = policyMap.get(Number(user.id));
    const eligible = policy && (type === 'acquisition'
      ? ['acquisition_only', 'both'].includes(policy.kpiRole)
      : ['sales_only', 'both'].includes(policy.kpiRole));
    return eligible ? [{ id: user.id, fullName: user.fullName, email: user.email, policy }] : [];
  });
  res.json({
    period,
    employees: canManageUsers(req.user)
      ? employees
      : employees.map((employee) => ({
          id: employee.id,
          fullName: employee.fullName,
          policy: { kpiRole: employee.policy.kpiRole },
        })),
    periodControl: report.periodControl,
  });
});

app.patch('/api/admin/sales-kpi-periods/:period', requireUserManager, (req, res) => {
  try {
    const periodControl = setSalesKpiPeriodStatus(req.params.period, {
      status: req.body?.status,
      note: req.body?.note,
      actorUser: req.user,
    });
    res.json({
      message: periodControl.status === 'locked' ? 'Đã khóa kỳ KPI.' : 'Đã mở khóa kỳ KPI.',
      periodControl,
    });
  } catch (dbError) {
    res.status(400).json({ message: dbError.message || 'Không thể cập nhật trạng thái kỳ KPI.' });
  }
});

app.patch('/api/admin/sales-kpi-records/:id/reward', requireUserManager, (req, res) => {
  const recordId = Number(req.params.id || 0);
  if (!Number.isInteger(recordId) || recordId <= 0) {
    res.status(400).json({ message: 'Mã KPI không hợp lệ.' });
    return;
  }
  try {
    const record = updateSalesKpiRewardWorkflow(recordId, {
      status: req.body?.status,
      payoutReference: req.body?.payoutReference,
      note: req.body?.note,
      actorUser: req.user,
    });
    if (!record) {
      res.status(404).json({ message: 'Không tìm thấy KPI đang hoạt động.' });
      return;
    }
    res.json({ message: record.rewardStatus === 'paid' ? 'Đã xác nhận chi thưởng.' : record.rewardStatus === 'approved' ? 'Đã duyệt khoản thưởng.' : 'Đã chuyển khoản thưởng về chờ duyệt.', record });
  } catch (dbError) {
    if (['SALES_KPI_PERIOD_LOCKED', 'SALES_KPI_REWARD_TRANSITION_INVALID', 'SALES_KPI_PAYOUT_REFERENCE_REQUIRED'].includes(dbError?.code)) {
      res.status(400).json({ message: dbError.message });
      return;
    }
    console.error('Update KPI reward workflow error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật quy trình chi thưởng.' });
  }
});

app.put('/api/admin/sales-kpi-targets/:saleUserId', requireUserManager, (req, res) => {
  const saleUserId = Number(req.params.saleUserId || 0);
  if (!Number.isInteger(saleUserId) || saleUserId <= 0) {
    res.status(400).json({ message: 'Nhân viên nhận mục tiêu không hợp lệ.' });
    return;
  }

  try {
    const target = upsertSalesKpiTarget({
      period: req.body?.period,
      saleUserId,
      vehicleTarget: req.body?.vehicleTarget,
      grossProfitTarget: req.body?.grossProfitTarget,
      kpiRole: req.body?.kpiRole,
      commissionPerSale: req.body?.commissionPerSale,
      acquisitionRewardPerVehicle: req.body?.acquisitionRewardPerVehicle,
      updatedByUser: req.user,
    });
    res.json({ message: 'Đã cập nhật mục tiêu KPI.', target });
  } catch (dbError) {
    if (['SALES_KPI_TARGET_PERIOD_INVALID', 'SALES_KPI_TARGET_ROLE_INVALID', 'SALES_KPI_COMMISSION_MISSING', 'SALES_KPI_ACQUISITION_REWARD_MISSING', 'SALES_KPI_SALE_INVALID', 'SALES_KPI_PERIOD_LOCKED'].includes(dbError?.code)) {
      res.status(400).json({ message: dbError.message });
      return;
    }
    console.error('Update sales KPI target error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật mục tiêu KPI lúc này.' });
  }
});

app.post('/api/admin/sales-kpi-records', requireUserManager, (req, res) => {
  const { kpiRecord, error } = validateSalesKpiRecordPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const record = createSalesKpiRecord({ ...kpiRecord, recordedByUser: req.user });

    res.status(201).json({
      message: 'Đã ghi nhận KPI cho sale.',
      record,
      stats: getSalesKpiStats(),
    });
  } catch (dbError) {
    if (dbError?.code === 'SALES_KPI_DUPLICATED') {
      res.status(409).json({ message: 'Giao dịch này đã được ghi nhận KPI trước đó.' });
      return;
    }

    if (['SALES_KPI_SOURCE_INVALID', 'SALES_KPI_SOURCE_NOT_COMPLETED', 'SALES_KPI_SALE_INVALID', 'SALES_KPI_ROLE_INVALID', 'SALES_KPI_POLICY_MISSING', 'SALES_KPI_COMMISSION_MISSING', 'SALES_KPI_ACQUISITION_REWARD_MISSING', 'SALES_KPI_PERIOD_LOCKED'].includes(dbError?.code)) {
      res.status(400).json({ message: dbError.message });
      return;
    }

    console.error('Create sales KPI record error:', dbError);
    res.status(500).json({ message: 'Không thể ghi nhận KPI lúc này.' });
  }
});

app.patch('/api/admin/sales-kpi-records/:id', requireUserManager, (req, res) => {
  const recordId = Number(req.params.id);
  const { kpiRecord, error } = validateSalesKpiRecordPayload(req.body || {});

  if (!Number.isInteger(recordId) || recordId <= 0) {
    res.status(400).json({ message: 'Mã KPI không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const record = updateSalesKpiRecord(recordId, kpiRecord);

    if (!record) {
      res.status(404).json({ message: 'Không tìm thấy KPI đang hoạt động để cập nhật.' });
      return;
    }

    res.json({ message: 'Đã cập nhật KPI.', record, stats: getSalesKpiStats() });
  } catch (dbError) {
    if (['SALES_KPI_SALE_INVALID', 'SALES_KPI_ROLE_INVALID', 'SALES_KPI_POLICY_MISSING', 'SALES_KPI_COMMISSION_MISSING', 'SALES_KPI_ACQUISITION_REWARD_MISSING', 'SALES_KPI_PERIOD_LOCKED'].includes(dbError?.code)) {
      res.status(400).json({ message: dbError.message });
      return;
    }

    console.error('Update sales KPI record error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật KPI lúc này.' });
  }
});

app.patch('/api/admin/sales-kpi-records/:id/cancel', requireUserManager, (req, res) => {
  const recordId = Number(req.params.id);
  const { cancellationNote, error } = validateSalesKpiCancellationPayload(req.body || {});

  if (!Number.isInteger(recordId) || recordId <= 0) {
    res.status(400).json({ message: 'Mã KPI không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const record = cancelSalesKpiRecord(recordId, {
      cancellationNote,
      cancelledByUser: req.user,
    });

    if (!record) {
      res.status(404).json({ message: 'Không tìm thấy KPI đang hoạt động để hủy.' });
      return;
    }

    res.json({
      message: 'Đã hủy ghi nhận KPI và giữ lại lịch sử điều chỉnh.',
      record,
      stats: getSalesKpiStats(),
    });
  } catch (dbError) {
    if (['SALES_KPI_CANCELLATION_NOTE_REQUIRED', 'SALES_KPI_ACQUISITION_REWARD_PAID', 'SALES_KPI_PERIOD_LOCKED'].includes(dbError?.code)) {
      res.status(400).json({ message: dbError.message });
      return;
    }

    console.error('Cancel sales KPI record error:', dbError);
    res.status(500).json({ message: 'Không thể hủy KPI lúc này.' });
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

  if (!canManageUsers(req.user) && ['approved', 'rejected'].includes(statusUpdate.status)) {
    res.status(403).json({ message: 'Chỉ tài khoản admin mới được duyệt hoặc từ chối tin mua xe.' });
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

app.delete('/api/admin/car-buy-requests/:id', requireUserManager, (req, res) => {
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

app.delete('/api/admin/consultation-requests/:id', requireUserManager, (req, res) => {
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

app.get('/api/admin/deposit-orders', requireAdmin, (req, res) => {
  refreshOverdueDepositOrders();
  res.json({
    orders: listDepositOrders(),
    paymentMethods: depositOrderPaymentMethodLabels,
    statuses: depositOrderStatusLabels,
  });
});

app.get('/api/admin/deposit-payment/config', requireAdmin, (req, res) => {
  try {
    res.json({
      config: serializeDepositPaymentConfig(getActiveDepositPaymentSettings()),
    });
  } catch (dbError) {
    console.error('Get admin deposit payment config error:', dbError);
    res.status(500).json({ message: 'Không thể tải cấu hình đặt cọc lúc này.' });
  }
});

app.patch('/api/admin/deposit-payment/config', requireUserManager, (req, res) => {
  const { settings, error } = validateDepositPaymentSettingsPayload(req.body || {});

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const updatedSettings = updateDepositPaymentSettings(settings, req.user);

    res.json({
      message: 'Đã lưu cấu hình thanh toán đặt cọc.',
      config: serializeDepositPaymentConfig(updatedSettings),
    });
  } catch (dbError) {
    console.error('Update admin deposit payment config error:', dbError);
    res.status(500).json({ message: 'Không thể lưu cấu hình đặt cọc lúc này.' });
  }
});

app.patch('/api/admin/deposit-orders/:id/status', requireAdmin, (req, res) => {
  const orderId = Number(req.params.id);
  const { statusUpdate, error } = validateDepositOrderStatusPayload(req.body || {});

  if (!Number.isFinite(orderId)) {
    res.status(400).json({ message: 'Mã đơn đặt cọc không hợp lệ.' });
    return;
  }

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  if (!canManageUsers(req.user) && statusUpdate.status === 'cancelled_after_deposit') {
    res.status(403).json({ message: 'Chỉ tài khoản admin mới được xử lý hủy và hoàn cọc sau khi đã nhận tiền.' });
    return;
  }

  try {
    refreshOverdueDepositOrders();
    const order = updateDepositOrderStatus(orderId, {
      ...statusUpdate,
      confirmedByUser: req.user,
      actorUser: req.user,
      actionType: statusUpdate.status === 'expired' ? 'manual_expired' : 'admin_status_update',
    });

    if (!order) {
      res.status(404).json({ message: 'Không tìm thấy đơn đặt cọc.' });
      return;
    }

    sendDepositOrderEmailNotification(order, order.status);

    res.json({
      message: order.status === 'completed'
        ? 'Giao dịch đã hoàn tất và được chuyển vào mục KPI để admin gắn nhân viên bán xe.'
        : `Cập nhật đơn đặt cọc: ${depositOrderStatusLabels[order.status]}.`,
      order,
    });
  } catch (dbError) {
    if (dbError?.code === 'DEPOSIT_CAR_ALREADY_HELD') {
      const conflictCode = dbError.order?.code ? ` (${dbError.order.code})` : '';

      res.status(409).json({
        message: `Xe này đã có đơn đặt cọc khác đang giữ chỗ${conflictCode}. Vui lòng xử lý đơn đó trước.`,
      });
      return;
    }

    if (dbError?.code === 'DEPOSIT_ORDER_PAYMENT_NOT_CONFIRMED') {
      res.status(409).json({
        message: 'Chỉ có thể chốt giao dịch hoặc hủy sau đặt cọc khi đơn đã được xác nhận nhận tiền.',
      });
      return;
    }

    if (dbError?.code === 'DEPOSIT_ORDER_STATUS_TRANSITION_INVALID') {
      const currentStatusLabel = depositOrderStatusLabels[dbError.currentStatus] || dbError.currentStatus || 'không xác định';
      const nextStatusLabel = depositOrderStatusLabels[dbError.nextStatus] || dbError.nextStatus || 'không xác định';

      res.status(409).json({
        message: `Không thể chuyển đơn đặt cọc từ "${currentStatusLabel}" sang "${nextStatusLabel}". Vui lòng xử lý theo luồng: pending -> confirmed/cancelled/expired, confirmed -> completed/cancelled_after_deposit.`,
      });
      return;
    }

    if (dbError?.code === 'DEPOSIT_PAYMENT_REFERENCE_DUPLICATED') {
      const conflictCode = dbError.order?.code ? ` (${dbError.order.code})` : '';

      res.status(409).json({
        message: `Mã giao dịch này đã được dùng cho đơn đặt cọc khác${conflictCode}. Vui lòng kiểm tra lại sao kê trước khi xác nhận.`,
      });
      return;
    }

    if (dbError?.code === 'DEPOSIT_REFUND_AMOUNT_EXCEEDED') {
      res.status(400).json({
        message: 'Số tiền hoàn cọc không được lớn hơn số tiền đặt cọc đã nhận.',
      });
      return;
    }

    if (['SALES_KPI_SALE_INVALID', 'SALES_KPI_ROLE_INVALID', 'SALES_KPI_POLICY_MISSING', 'SALES_KPI_COMMISSION_MISSING', 'SALES_KPI_PERIOD_LOCKED'].includes(dbError?.code)) {
      res.status(400).json({ message: dbError.message });
      return;
    }

    console.error('Update deposit order status error:', dbError);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn đặt cọc lúc này.' });
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

app.delete('/api/admin/test-drive-appointments/:id', requireUserManager, (req, res) => {
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
      : users
          .filter((user) => user.role === 'customer')
          .map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            avatarUrl: user.avatarUrl || '',
            address: {
              province: user.address?.province || '',
              district: '',
              ward: '',
              detail: '',
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
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

const normalizeChatContent = (value) => String(value || '').trim().slice(0, 2000);
const canAccessConversation = (conversation, user, isStaff = false) =>
  Boolean(conversation && user && (isStaff || Number(conversation.userId) === Number(user.id)));
const emitConversationRefresh = (conversationId, message = null) => {
  const conversation = getConversationById(conversationId);
  if (!conversation) return;
  io.to(`conversation:${conversation.id}`).emit('message:new', { conversation, message });
  io.to(`user:${conversation.userId}`).emit('conversations:refresh', { conversationId: conversation.id });
  io.to('staff').emit('conversations:refresh', { conversationId: conversation.id });
};

app.get('/api/conversations/my', requireUser, (req, res) => {
  res.json({ conversations: listConversationsByUser(req.user.id) });
});

app.post('/api/conversations', requireUser, chatMessageRateLimit, (req, res) => {
  const content = normalizeChatContent(req.body?.content);
  if (!content) return res.status(400).json({ message: 'Vui lòng nhập nội dung tin nhắn.' });
  try {
    const result = createConversation({
      userId: req.user.id,
      subject: String(req.body?.subject || '').trim(),
      contextType: req.body?.contextType,
      contextId: req.body?.contextId,
      content,
    });
    if (!result) return res.status(400).json({ message: 'Không thể tạo cuộc hội thoại.' });
    emitConversationRefresh(result.conversation.id, result.message);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Không thể tạo cuộc hội thoại.' });
  }
});

app.get('/api/conversations/:id/messages', requireUser, (req, res) => {
  const conversation = getConversationById(Number(req.params.id));
  if (!canAccessConversation(conversation, req.user)) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
  markConversationRead(conversation.id, 'customer');
  return res.json({ conversation: getConversationById(conversation.id), messages: listConversationMessages(conversation.id) });
});

app.post('/api/conversations/:id/messages', requireUser, chatMessageRateLimit, (req, res) => {
  const conversation = getConversationById(Number(req.params.id));
  if (!canAccessConversation(conversation, req.user)) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
  const content = normalizeChatContent(req.body?.content);
  if (!content) return res.status(400).json({ message: 'Vui lòng nhập nội dung tin nhắn.' });
  const message = createConversationMessage(conversation.id, req.user, content);
  emitConversationRefresh(conversation.id, message);
  return res.status(201).json({ conversation: getConversationById(conversation.id), message });
});

app.patch('/api/conversations/:id/read', requireUser, (req, res) => {
  const conversation = getConversationById(Number(req.params.id));
  if (!canAccessConversation(conversation, req.user)) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
  return res.json({ conversation: markConversationRead(conversation.id, 'customer') });
});

app.get('/api/admin/conversations', requireAdmin, (req, res) => {
  res.json({ conversations: listAdminConversations() });
});

app.get('/api/admin/conversations/:id/messages', requireAdmin, (req, res) => {
  const conversation = getConversationById(Number(req.params.id));
  if (!conversation) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
  markConversationRead(conversation.id, 'staff');
  return res.json({ conversation: getConversationById(conversation.id), messages: listConversationMessages(conversation.id) });
});

app.post('/api/admin/conversations/:id/messages', requireAdmin, chatMessageRateLimit, (req, res) => {
  const conversation = getConversationById(Number(req.params.id));
  if (!conversation) return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại.' });
  const content = normalizeChatContent(req.body?.content);
  if (!content) return res.status(400).json({ message: 'Vui lòng nhập nội dung tin nhắn.' });
  const message = createConversationMessage(conversation.id, req.user, content);
  emitConversationRefresh(conversation.id, message);
  return res.status(201).json({ conversation: getConversationById(conversation.id), message });
});

app.patch('/api/admin/conversations/:id/assign', requireAdmin, (req, res) => {
  const assignedUserId = Number(req.body?.assignedUserId || req.user.id);
  const conversation = assignConversation(Number(req.params.id), assignedUserId);
  if (!conversation) return res.status(400).json({ message: 'Nhân viên phụ trách không hợp lệ.' });
  emitConversationRefresh(conversation.id);
  return res.json({ message: 'Đã nhận xử lý cuộc hội thoại.', conversation });
});

app.patch('/api/admin/conversations/:id/status', requireAdmin, (req, res) => {
  const conversation = updateConversationStatus(Number(req.params.id), req.body?.status);
  if (!conversation) return res.status(400).json({ message: 'Trạng thái cuộc hội thoại không hợp lệ.' });
  emitConversationRefresh(conversation.id);
  return res.json({ message: 'Đã cập nhật trạng thái hội thoại.', conversation });
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

io.use((socket, next) => {
  const cookies = parseCookies(socket.handshake.headers.cookie || '');
  const adminUser = getUserBySession(cookies[adminSessionCookieName]);
  const customerUser = getUserBySession(cookies[userSessionCookieName]);
  const requestedAudience = String(socket.handshake.auth?.audience || '').trim().toLowerCase();
  const isStaffAudience = requestedAudience === 'staff';
  const user = isStaffAudience
    ? (adminUser && canAccessAdmin(adminUser) ? adminUser : null)
    : customerUser;
  if (!user) return next(new Error('Bạn cần đăng nhập để sử dụng tin nhắn realtime.'));
  socket.data.user = user;
  socket.data.isStaff = isStaffAudience;
  socket.data.messageTimes = [];
  return next();
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  socket.join(`user:${user.id}`);
  if (socket.data.isStaff) socket.join('staff');

  socket.on('conversation:join', ({ conversationId } = {}, acknowledge = () => {}) => {
    const conversation = getConversationById(Number(conversationId));
    if (!canAccessConversation(conversation, user, socket.data.isStaff)) {
      acknowledge({ ok: false, message: 'Bạn không có quyền xem cuộc hội thoại này.' });
      return;
    }
    socket.join(`conversation:${conversation.id}`);
    markConversationRead(conversation.id, socket.data.isStaff ? 'staff' : 'customer');
    acknowledge({ ok: true, conversationId: conversation.id });
  });

  socket.on('message:send', ({ conversationId, content } = {}, acknowledge = () => {}) => {
    const now = Date.now();
    socket.data.messageTimes = socket.data.messageTimes.filter((time) => now - time < 60000);
    if (socket.data.messageTimes.length >= 30) {
      acknowledge({ ok: false, message: 'Bạn gửi tin nhắn quá nhanh. Vui lòng chờ một chút.' });
      return;
    }
    const conversation = getConversationById(Number(conversationId));
    if (!canAccessConversation(conversation, user, socket.data.isStaff)) {
      acknowledge({ ok: false, message: 'Bạn không có quyền gửi tin nhắn vào cuộc hội thoại này.' });
      return;
    }
    const normalizedContent = normalizeChatContent(content);
    if (!normalizedContent) {
      acknowledge({ ok: false, message: 'Vui lòng nhập nội dung tin nhắn.' });
      return;
    }
    const message = createConversationMessage(conversation.id, user, normalizedContent);
    socket.data.messageTimes.push(now);
    emitConversationRefresh(conversation.id, message);
    acknowledge({ ok: true, message });
  });

  socket.on('message:read', ({ conversationId } = {}) => {
    const conversation = getConversationById(Number(conversationId));
    if (!canAccessConversation(conversation, user, socket.data.isStaff)) return;
    markConversationRead(conversation.id, socket.data.isStaff ? 'staff' : 'customer');
    io.to(`user:${conversation.userId}`).to('staff').emit('conversations:refresh', { conversationId: conversation.id });
  });
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

httpServer.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
