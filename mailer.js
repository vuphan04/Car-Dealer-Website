const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');

const mailPreviewDirectory = path.join(__dirname, 'data', 'mail-previews');
const isProduction = process.env.NODE_ENV === 'production';

const shouldPreviewOnSmtpFailure = () =>
  !isProduction &&
  String(process.env.SMTP_PREVIEW_ON_FAILURE || 'true').trim().toLowerCase() !==
    'false';

const ensureMailPreviewDirectory = () => {
  fs.mkdirSync(mailPreviewDirectory, { recursive: true });
};

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return replacements[character];
  });

const createTransport = () => {
  if (process.env.SMTP_HOST) {
    return {
      mode: 'smtp',
      transport: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || '',
            }
          : undefined,
      }),
    };
  }

  return {
    mode: 'preview',
    transport: nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
      newline: 'windows',
    }),
  };
};

const writeMailPreview = (to, message) => {
  ensureMailPreviewDirectory();

  const previewFilePath = path.join(
    mailPreviewDirectory,
    `${Date.now()}-${String(to).replace(/[^a-z0-9@._-]/gi, '_')}.eml`
  );

  fs.writeFileSync(previewFilePath, message);

  return previewFilePath;
};

const createPreviewEmail = async (mailOptions) => {
  const previewTransport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'windows',
  });
  const info = await previewTransport.sendMail(mailOptions);

  return writeMailPreview(mailOptions.to, info.message);
};

const buildPasswordResetEmail = ({ to, fullName, otpCode, expiresInMinutes }) => {
  const sender = process.env.SMTP_FROM || 'OkXe <no-reply@okxe.local>';
  const escapedFullName = escapeHtml(fullName);
  const escapedOtpCode = escapeHtml(otpCode);
  const escapedExpiresInMinutes = escapeHtml(expiresInMinutes);

  return {
    from: sender,
    to,
    subject: 'Mã OTP khôi phục mật khẩu OkXe',
    text: [
      `Xin chào ${fullName},`,
      '',
      'Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản OkXe của bạn.',
      `Mã OTP của bạn là: ${otpCode}`,
      `Mã này sẽ hết hạn sau ${expiresInMinutes} phút.`,
      'Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #08154a; line-height: 1.7;">
        <h2 style="margin-bottom: 12px; color: #f15a29;">Mã OTP khôi phục mật khẩu OkXe</h2>
        <p>Xin chào <strong>${escapedFullName}</strong>,</p>
        <p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản OkXe của bạn.</p>
        <p>Mã OTP của bạn là:</p>
        <div style="display: inline-block; padding: 14px 18px; border-radius: 12px; background: #fff3eb; border: 1px solid rgba(241, 90, 41, 0.24); color: #f15a29; font-size: 28px; font-weight: 800; letter-spacing: 0.25em;">
          ${escapedOtpCode}
        </div>
        <p style="margin-top: 18px;">Mã này sẽ hết hạn sau <strong>${escapedExpiresInMinutes} phút</strong>.</p>
        <p>Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
      </div>
    `,
  };
};

const sendMailWithPreview = async (mailOptions, label = 'email') => {
  const transporterState = createTransport();
  let info;

  try {
    info = await transporterState.transport.sendMail(mailOptions);
  } catch (error) {
    if (transporterState.mode === 'smtp' && shouldPreviewOnSmtpFailure()) {
      const previewFilePath = await createPreviewEmail(mailOptions);

      console.warn(
        `SMTP email failed (${error.code || 'unknown'}). Saved ${label} preview to ${previewFilePath}.`
      );

      return {
        mode: 'preview',
        previewFilePath,
        smtpFallback: true,
      };
    }

    throw error;
  }

  if (transporterState.mode === 'smtp') {
    return { mode: 'smtp' };
  }

  return {
    mode: 'preview',
    previewFilePath: writeMailPreview(mailOptions.to, info.message),
  };
};

const formatDepositMoney = (value) => {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Chưa cập nhật';
  }

  return `${Math.trunc(amount).toLocaleString('vi-VN')} VNĐ`;
};

const formatDepositDateTime = (value) => {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return 'Chưa cập nhật';
  }

  const date = new Date(normalizedValue.replace(' ', 'T'));

  if (Number.isNaN(date.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const getDepositOrderCode = (order = {}) =>
  order.code || `DC-${String(order.id || '').padStart(6, '0')}`;

const getDepositCarTitle = (order = {}) =>
  [order.carBrand, order.carName].filter(Boolean).join(' ') || 'xe đã chọn';

const depositStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã nhận tiền',
  completed: 'Hoàn tất giao dịch',
  cancelled_after_deposit: 'Hủy sau đặt cọc',
  cancelled: 'Đã hủy',
  expired: 'Quá hạn giữ chỗ',
};

const depositPaymentMethodLabels = {
  bank: 'Chuyển khoản ngân hàng',
  vnpay: 'VNPay sandbox',
  wallet: 'Ví điện tử',
  card: 'Thẻ ngân hàng',
};

const getDepositEmailContent = (order = {}, eventType = '') => {
  const status = String(order.status || 'pending').trim().toLowerCase();
  const eventKey = String(eventType || status || 'pending').trim().toLowerCase();
  const code = getDepositOrderCode(order);
  const carTitle = getDepositCarTitle(order);
  const statusNote = String(order.statusNote || '').trim();
  const paymentReference = String(order.paymentReference || '').trim();
  const paymentMethod = String(order.paymentMethod || 'bank').trim().toLowerCase();
  const isVnpayPayment = paymentMethod === 'vnpay';
  const refundAmount = Number(order.refundAmount || 0);
  const refundText = refundAmount > 0
    ? `OkXe đã ghi nhận hoàn cọc ${formatDepositMoney(refundAmount)}${order.refundReference ? `, mã hoàn tiền ${order.refundReference}` : ''}.`
    : '';
  const contentByEvent = {
    created: {
      subject: `OkXe đã nhận đơn đặt cọc ${code}`,
      title: 'Đã tạo đơn đặt cọc xe',
      intro: isVnpayPayment
        ? `OkXe đã tạo đơn đặt cọc ${code} cho ${carTitle}. Vui lòng hoàn tất thanh toán trên VNPay sandbox để hệ thống tự xác nhận.`
        : `OkXe đã nhận đơn đặt cọc ${code} cho ${carTitle}. Vui lòng chuyển khoản đúng nội dung để nhân viên đối soát nhanh hơn.`,
    },
    pending: {
      subject: `OkXe đã nhận đơn đặt cọc ${code}`,
      title: 'Đơn đặt cọc đang chờ xác nhận',
      intro: statusNote || (isVnpayPayment
        ? `Đơn đặt cọc ${code} cho ${carTitle} đang chờ kết quả thanh toán VNPay sandbox.`
        : `Đơn đặt cọc ${code} cho ${carTitle} đang chờ nhân viên xác nhận tiền chuyển khoản.`),
    },
    payment_reminder: {
      subject: isVnpayPayment ? `Nhắc thanh toán đặt cọc ${code}` : `Nhắc chuyển khoản đặt cọc ${code}`,
      title: 'Đơn đặt cọc sắp hết hạn giữ chỗ',
      intro: isVnpayPayment
        ? `Đơn đặt cọc ${code} cho ${carTitle} vẫn đang chờ kết quả thanh toán VNPay. Vui lòng hoàn tất thanh toán ${formatDepositMoney(order.depositAmount)} trước hạn giữ chỗ để OkXe tiếp tục giữ xe cho bạn.`
        : `Đơn đặt cọc ${code} cho ${carTitle} vẫn đang chờ xác nhận chuyển khoản. Vui lòng chuyển khoản ${formatDepositMoney(order.depositAmount)} đúng nội dung trước hạn giữ chỗ để OkXe tiếp tục giữ xe cho bạn.`,
    },
    confirmed: {
      subject: `OkXe đã nhận tiền đặt cọc ${code}`,
      title: 'Đã xác nhận nhận tiền đặt cọc',
      intro: statusNote || `OkXe đã xác nhận nhận tiền đặt cọc cho đơn ${code}.${paymentReference ? ` Mã giao dịch: ${paymentReference}.` : ''} Bạn có thể xem/in biên nhận trong mục Quản lý đặt cọc.`,
    },
    completed: {
      subject: `OkXe đã hoàn tất giao dịch ${code}`,
      title: 'Giao dịch mua xe đã hoàn tất',
      intro: statusNote || `Đơn đặt cọc ${code} cho ${carTitle} đã được chốt hoàn tất. Cảm ơn bạn đã tin tưởng OkXe.`,
    },
    cancelled_after_deposit: {
      subject: `OkXe cập nhật hủy sau đặt cọc ${code}`,
      title: 'Giao dịch sau đặt cọc đã hủy',
      intro: [statusNote || `Đơn đặt cọc ${code} cho ${carTitle} đã được cập nhật hủy sau đặt cọc.`, refundText]
        .filter(Boolean)
        .join(' '),
    },
    cancelled: {
      subject: `OkXe đã hủy đơn đặt cọc ${code}`,
      title: 'Đơn đặt cọc đã bị hủy',
      intro: statusNote || `Đơn đặt cọc ${code} cho ${carTitle} đã bị hủy. Vui lòng liên hệ OkXe nếu bạn cần hỗ trợ thêm.`,
    },
    expired: {
      subject: `Đơn đặt cọc ${code} đã quá hạn giữ chỗ`,
      title: 'Đơn đặt cọc đã quá hạn',
      intro: statusNote || `Đơn đặt cọc ${code} cho ${carTitle} đã quá hạn giữ chỗ. Xe có thể được mở lại để khách khác đặt cọc.`,
    },
  };

  return contentByEvent[eventKey] || contentByEvent[status] || contentByEvent.pending;
};

const renderDepositEmailRows = (rows = []) => rows
  .filter(([, value]) => String(value || '').trim())
  .map(([label, value]) => `
    <tr>
      <td style="padding: 10px 12px; color: #667085; font-weight: 700; border-bottom: 1px solid #e7ebf4;">${escapeHtml(label)}</td>
      <td style="padding: 10px 12px; color: #08154a; font-weight: 800; border-bottom: 1px solid #e7ebf4;">${escapeHtml(value)}</td>
    </tr>
  `)
  .join('');

const buildDepositOrderEmail = ({ to, order = {}, eventType = '' }) => {
  const sender = process.env.SMTP_FROM || 'OkXe <no-reply@okxe.local>';
  const content = getDepositEmailContent(order, eventType);
  const code = getDepositOrderCode(order);
  const carTitle = getDepositCarTitle(order);
  const status = String(order.status || 'pending').trim().toLowerCase();
  const paymentMethod = String(order.paymentMethod || 'bank').trim().toLowerCase();
  const isVnpayPayment = paymentMethod === 'vnpay';
  const rows = [
    ['Mã đơn đặt cọc', code],
    ['Xe đặt cọc', carTitle],
    ['Trạng thái', depositStatusLabels[status] || status || 'Chờ xác nhận'],
    ['Số tiền đặt cọc', formatDepositMoney(order.depositAmount)],
    ['Phương thức thanh toán', depositPaymentMethodLabels[paymentMethod] || paymentMethod],
    [isVnpayPayment ? 'Mã thanh toán VNPay' : 'Nội dung chuyển khoản', isVnpayPayment ? order.vnpayTxnRef : order.bankTransferNote],
    ['Mã giao dịch', order.paymentReference],
    ['VNPay TransactionNo', order.vnpayTransactionNo],
    ['Thời gian nhận tiền', formatDepositDateTime(order.paymentReceivedAt)],
    ['Hạn giữ chỗ', formatDepositDateTime(order.expiresAt)],
  ];
  const textRows = rows
    .filter(([, value]) => String(value || '').trim())
    .map(([label, value]) => `- ${label}: ${value}`)
    .join('\n');

  return {
    from: sender,
    to,
    subject: content.subject,
    text: [
      `Xin chào ${order.fullName || 'quý khách'},`,
      '',
      content.intro,
      '',
      textRows,
      '',
      'Bạn có thể đăng nhập tài khoản OkXe, mở mục Quản lý đặt cọc để xem lịch sử xử lý, biên nhận và chứng từ chuyển khoản.',
      'Nếu cần hỗ trợ gấp, vui lòng liên hệ OkXe qua hotline trên website.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #08154a; line-height: 1.65;">
        <h2 style="margin: 0 0 12px; color: #f15a29;">${escapeHtml(content.title)}</h2>
        <p>Xin chào <strong>${escapeHtml(order.fullName || 'quý khách')}</strong>,</p>
        <p>${escapeHtml(content.intro)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 680px; border-collapse: collapse; margin: 18px 0; border: 1px solid #e7ebf4; border-radius: 12px; overflow: hidden;">
          ${renderDepositEmailRows(rows)}
        </table>
        <p>Bạn có thể đăng nhập tài khoản OkXe, mở mục <strong>Quản lý đặt cọc</strong> để xem lịch sử xử lý, biên nhận và chứng từ chuyển khoản.</p>
        <p>Nếu cần hỗ trợ gấp, vui lòng liên hệ OkXe qua hotline trên website.</p>
      </div>
    `,
  };
};

const sendPasswordResetEmail = async ({ to, fullName, otpCode, expiresInMinutes }) => {
  const mailOptions = buildPasswordResetEmail({
    to,
    fullName,
    otpCode,
    expiresInMinutes,
  });

  return sendMailWithPreview(mailOptions, 'password reset');
};

const sendDepositOrderEmail = async ({ to, order, eventType }) => {
  const normalizedTo = String(to || '').trim();

  if (!normalizedTo || !order) {
    return null;
  }

  return sendMailWithPreview(
    buildDepositOrderEmail({ to: normalizedTo, order, eventType }),
    'deposit order'
  );
};

module.exports = {
  sendDepositOrderEmail,
  sendPasswordResetEmail,
};
