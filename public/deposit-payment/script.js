const depositForm = document.querySelector('#deposit-payment-form');
const carSummary = document.querySelector('#deposit-car-summary');
const carPriceElement = document.querySelector('#deposit-car-price');
const amountLabel = document.querySelector('#deposit-amount-label');
const totalAmountElement = document.querySelector('#deposit-total-amount');
const remainingAmountElement = document.querySelector('#deposit-remaining-amount');
const amountOptions = document.querySelector('#deposit-amount-options');
const paymentMethods = document.querySelectorAll('.payment-method');
const paymentPanels = document.querySelectorAll('[data-payment-panel]');
const bankTransferNote = document.querySelector('#bank-transfer-note');
const vnpayExpireElements = document.querySelectorAll('[data-vnpay-expire]');
const vnpayMethodTitle = document.querySelector('[data-vnpay-method-title]');
const vnpayMethodDescription = document.querySelector('[data-vnpay-method-description]');
const vnpayGatewayLabel = document.querySelector('[data-vnpay-gateway-label]');
const vnpayConfirmLabel = document.querySelector('[data-vnpay-confirm-label]');
const depositFeedback = document.querySelector('#deposit-feedback');
const fullNameInput = document.querySelector('#deposit-full-name');
const phoneInput = document.querySelector('#deposit-phone');
const emailInput = document.querySelector('#deposit-email');
const termsInput = document.querySelector('#deposit-terms');
const depositSubmitButton = document.querySelector('.deposit-submit');
const depositAuthNotice = document.querySelector('#deposit-auth-notice');
const depositAuthLoginLink = document.querySelector('#deposit-auth-login-link');
const depositAuthSignupLink = document.querySelector('#deposit-auth-signup-link');
const depositSuccessModal = document.querySelector('#deposit-success-modal');
const depositSuccessDialog = depositSuccessModal?.querySelector('.deposit-success-modal__dialog');
const depositSuccessCode = document.querySelector('#deposit-success-code');
const depositSuccessCar = document.querySelector('#deposit-success-car');
const depositSuccessAmount = document.querySelector('#deposit-success-amount');
const depositSuccessMessage = document.querySelector('#deposit-success-message');
const depositSuccessReceiptButton = document.querySelector('#deposit-success-receipt-button');
const depositSuccessCloseButtons = document.querySelectorAll('[data-close-deposit-success]');
const depositWaitingModal = document.querySelector('#deposit-waiting-modal');
const depositWaitingDialog = depositWaitingModal?.querySelector('.deposit-waiting-modal__dialog');
const depositWaitingStatusLabel = document.querySelector('#deposit-waiting-status-label');
const depositWaitingTitle = document.querySelector('#deposit-waiting-title');
const depositWaitingMessage = document.querySelector('#deposit-waiting-message');
const depositWaitingCode = document.querySelector('#deposit-waiting-code');
const depositWaitingCar = document.querySelector('#deposit-waiting-car');
const depositWaitingAmount = document.querySelector('#deposit-waiting-amount');
const depositWaitingTransferNote = document.querySelector('#deposit-waiting-transfer-note');
const depositWaitingHint = document.querySelector('#deposit-waiting-hint');
const depositWaitingCheckButton = document.querySelector('#deposit-waiting-check-button');
const depositWaitingCloseButtons = document.querySelectorAll('[data-close-deposit-waiting]');
const depositWaitingBank = document.querySelector('.deposit-waiting-modal__bank');
const depositProofInput = document.querySelector('#deposit-proof-input');
const depositProofCard = document.querySelector('#deposit-proof-card');
const depositProofChooseButton = document.querySelector('#deposit-proof-choose-button');
const depositProofUploadButton = document.querySelector('#deposit-proof-upload-button');
const depositProofFileName = document.querySelector('#deposit-proof-file-name');
const depositProofFeedback = document.querySelector('#deposit-proof-feedback');
const depositProofCurrentLink = document.querySelector('#deposit-proof-current-link');
const depositProofTitle = document.querySelector('#deposit-proof-title');
const depositProofDescription = document.querySelector('#deposit-proof-description');
const bankDisplayElements = document.querySelectorAll('[data-deposit-bank-display]');
const bankAccountNumberElements = document.querySelectorAll('[data-deposit-bank-account-number]');
const depositLookupForm = document.querySelector('#deposit-lookup-form');
const depositLookupCodeInput = document.querySelector('#deposit-lookup-code');
const depositLookupPhoneInput = document.querySelector('#deposit-lookup-phone');
const depositLookupSubmitButton = document.querySelector('#deposit-lookup-submit');
const depositLookupFeedback = document.querySelector('#deposit-lookup-feedback');
const depositLookupResult = document.querySelector('#deposit-lookup-result');
const depositPolicyContent = document.querySelector('#deposit-policy-content');
const depositStatusGuideList = document.querySelector('#deposit-status-guide-list');

let currentCar = null;
let currentDepositUser = null;
let depositAuthResolved = false;
let selectedDepositAmount = 10000000;
let lastFocusedElementBeforeSuccess = null;
let lastFocusedElementBeforeWaiting = null;
let activeBankDepositOrder = null;
let activeBankDepositPhone = '';
let activeReceiptOrder = null;
let activeReceiptPhone = '';
let depositStatusPollTimer = null;
let lastLookupOrder = null;
let lastLookupPhone = '';
let selectedDepositProofFile = null;
const pendingDepositStorageKey = 'okxe_pending_deposit_order';
const defaultDepositPolicyText = [
    'Khách chuyển khoản đúng số tiền và nội dung trong đơn đặt cọc để OkXe đối soát.',
    'Xe được giữ trong thời gian cấu hình kể từ khi tạo đơn; nếu quá hạn chưa xác nhận nhận tiền, đơn có thể bị hủy và xe được mở bán lại.',
    'Sau khi OkXe xác nhận đã nhận tiền, khách có thể xem hoặc in biên nhận đặt cọc trong tài khoản.',
    'Khi giao dịch mua xe hoàn tất, số tiền đặt cọc được khấu trừ vào giá trị thanh toán còn lại.',
    'Trường hợp hủy sau đặt cọc hoặc hoàn cọc sẽ được nhân viên OkXe ghi nhận lý do, số tiền hoàn và mã giao dịch hoàn tiền trong lịch sử đơn.'
].join('\n');
const defaultDepositPaymentConfig = {
    supportedPaymentMethods: ['bank'],
    bank: {
        accountName: '',
        bankName: '',
        accountNumber: 'Đang cập nhật',
        transferPrefix: 'OKXE COC',
        displayName: 'Đang cập nhật'
    },
    vnpay: {
        enabled: false,
        sandbox: true,
        localMock: false,
        officialSandbox: false,
        paymentUrl: '',
        expireMinutes: 15,
        setupMessage: 'Cần cấu hình VNPay sandbox để sử dụng phương thức này.'
    },
    deposit: {
        amountOptions: [5000000, 10000000, 20000000],
        defaultAmount: 10000000,
        minAmount: 1000000,
        maxAmount: 200000000,
        holdHours: 24,
        requireTransferProof: false,
        policyText: defaultDepositPolicyText
    }
};
let depositPaymentConfig = { ...defaultDepositPaymentConfig };

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
});
const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
});

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

const getCarIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);

    return String(params.get('carId') || params.get('id') || '').trim();
};

const getDepositReturnToPath = () =>
    `${window.location.pathname}${window.location.search}${window.location.hash}` || '/thanh-toan-dat-coc';

const getDepositAuthUrl = (action = 'login') =>
    `/?auth=${encodeURIComponent(action)}&returnTo=${encodeURIComponent(getDepositReturnToPath())}`;

const formatCurrency = (value) => {
    const numberValue = Number(value || 0);

    return Number.isFinite(numberValue) && numberValue > 0
        ? currencyFormatter.format(numberValue)
        : 'Liên hệ';
};

const normalizeMoneyAmount = (value, fallback = 0) => {
    const numberValue = Number(String(value ?? '').replace(/[^\d]/g, ''));

    return Number.isFinite(numberValue) && numberValue > 0
        ? Math.trunc(numberValue)
        : fallback;
};

const normalizeDepositAmountOptions = (value, fallback = defaultDepositPaymentConfig.deposit.amountOptions) => {
    const rawOptions = Array.isArray(value)
        ? value
        : String(value || '').split(/[\s,;]+/);
    const seenAmounts = new Set();
    const normalizedOptions = rawOptions
        .map((amount) => normalizeMoneyAmount(amount, 0))
        .filter((amount) => amount > 0)
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

const normalizeDepositPolicyText = (value, fallback = defaultDepositPolicyText) => {
    const normalizedText = String(value || fallback || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map((line) => line.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
        .join('\n')
        .slice(0, 4000);

    return normalizedText || fallback;
};

const getDepositAmountOptionLabel = (amount) => {
    const numberAmount = Number(amount || 0);

    if (numberAmount >= 1000000 && numberAmount % 1000000 === 0) {
        return `${numberAmount / 1000000} triệu`;
    }

    return formatCurrency(numberAmount);
};

const formatDateTime = (value) => {
    if (!value) {
        return 'Đang cập nhật';
    }

    const parsedDate = new Date(String(value).replace(' ', 'T'));

    return Number.isNaN(parsedDate.getTime())
        ? 'Đang cập nhật'
        : dateTimeFormatter.format(parsedDate);
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    if (!file) {
        reject(new Error('Vui lòng chọn ảnh chứng từ chuyển khoản.'));
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', () => reject(new Error('Không thể đọc file chứng từ.')));
    reader.readAsDataURL(file);
});

const setDepositProofFeedback = (message = '', type = 'success') => {
    if (!depositProofFeedback) {
        return;
    }

    depositProofFeedback.textContent = message;
    depositProofFeedback.className = 'deposit-proof__feedback';

    if (message) {
        depositProofFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setDepositProofUploadLoading = (isLoading) => {
    if (!depositProofUploadButton) {
        return;
    }

    depositProofUploadButton.disabled = isLoading || !selectedDepositProofFile || !canUploadDepositProof(activeBankDepositOrder);
    depositProofUploadButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang tải...</span>'
        : '<i class="bx bx-cloud-upload" aria-hidden="true"></i><span>Tải chứng từ</span>';
};

const getReceiptDisplayValue = (value, fallback = 'Chưa cập nhật') => {
    const normalizedValue = String(value ?? '').trim();

    return normalizedValue || fallback;
};

const renderReceiptRows = (rows = []) => rows
    .map(([label, value]) => `
        <div class="receipt-row">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(getReceiptDisplayValue(value))}</strong>
        </div>
    `)
    .join('');

const renderReceiptPolicy = (policyText = '') => {
    const policyItems = normalizeDepositPolicyText(policyText)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    return policyItems.length
        ? `<ul class="policy-list">${policyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
};

const getDepositReceiptDocument = (receipt = {}) => {
    const customer = receipt.customer || {};
    const car = receipt.car || {};
    const payment = receipt.payment || {};
    const bank = receipt.bank || {};
    const receiptRows = [
        ['Mã biên nhận', receipt.receiptCode],
        ['Mã đơn đặt cọc', receipt.orderCode],
        ['Ngày lập biên nhận', formatDateTime(receipt.issuedAt)]
    ];
    const customerRows = [
        ['Khách hàng', customer.fullName],
        ['Số điện thoại', customer.phone],
        ['Email', customer.email || 'Không có'],
        ['Tỉnh/thành phố', customer.province || 'Chưa cập nhật']
    ];
    const carRows = [
        ['Xe đặt cọc', car.title],
        ['Giá xe tại thời điểm đặt cọc', car.priceText || formatCurrency(car.priceValue)],
        ['Mã xe', car.id ? `XE-${String(car.id).padStart(6, '0')}` : 'Chưa cập nhật']
    ];
    const paymentRows = [
        ['Số tiền đặt cọc', formatCurrency(payment.depositAmount)],
        ['Số tiền còn lại', payment.remainingAmount !== null && payment.remainingAmount !== undefined ? formatCurrency(payment.remainingAmount) : 'Nhân viên sẽ xác nhận'],
        ['Phương thức thanh toán', payment.methodLabel],
        [payment.method === 'vnpay' ? 'Mã thanh toán VNPay' : 'Nội dung chuyển khoản', payment.method === 'vnpay' ? payment.vnpayTxnRef : payment.bankTransferNote],
        ['Mã giao dịch', payment.paymentReference],
        ...(payment.method === 'vnpay' ? [['VNPay TransactionNo', payment.vnpayTransactionNo]] : []),
        ['Thời gian nhận tiền', formatDateTime(payment.paymentReceivedAt)],
        ['Thời gian xác nhận', formatDateTime(payment.paymentConfirmedAt)],
        ['Chứng từ khách tải', payment.transferProofFileName || payment.transferProofUrl]
    ];
    const bankRows = [
        ['Tài khoản nhận cọc', bank.displayName || [bank.accountName, bank.bankName].filter(Boolean).join(' - ')],
        ['Số tài khoản', bank.accountNumber],
        ['Chi nhánh', bank.branch || 'Không ghi nhận']
    ];

    return `<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Biên nhận đặt cọc ${escapeHtml(receipt.orderCode || '')}</title>
    <style>
        * { box-sizing: border-box; letter-spacing: 0; }
        body { margin: 0; color: #102033; background: #eef2f7; font-family: "Segoe UI", "Noto Sans", Arial, sans-serif; line-height: 1.5; text-rendering: geometricPrecision; -webkit-font-smoothing: antialiased; }
        .toolbar { position: sticky; top: 0; display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; background: #102033; }
        .toolbar button { min-height: 40px; border: 0; border-radius: 999px; padding: 0 16px; color: #fff; background: #f15a29; font: inherit; line-height: 1.2; font-weight: 700; cursor: pointer; }
        .toolbar button:last-child { color: #102033; background: #fff; }
        .receipt { width: min(900px, calc(100% - 32px)); margin: 28px auto; padding: 36px; background: #fff; border: 1px solid #d8deea; border-radius: 12px; }
        .receipt-head { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #f15a29; padding-bottom: 20px; }
        .brand { font-size: 26px; line-height: 1.2; font-weight: 900; letter-spacing: 0; }
        .receipt-head h1 { margin: 8px 0 0; font-size: 30px; line-height: 1.2; }
        .status { align-self: flex-start; border-radius: 999px; padding: 9px 14px; color: #0f8f51; background: #eaf8f0; font-weight: 800; line-height: 1.2; white-space: nowrap; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 22px 0; }
        .receipt-row { min-width: 0; padding: 13px 14px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fbfcff; }
        .receipt-row span { display: block; color: #667085; font-size: 12px; line-height: 1.35; font-weight: 700; text-transform: none; }
        .receipt-row strong { display: block; margin-top: 6px; line-height: 1.5; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
        .section { margin-top: 18px; }
        .section h2 { margin: 0 0 10px; font-size: 18px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .note { margin-top: 18px; padding: 14px 16px; border-left: 4px solid #f15a29; background: #fff7ed; line-height: 1.6; }
        .policy-list { margin: 0; padding: 14px 18px 14px 34px; border: 1px solid #fde2d3; border-radius: 10px; background: #fff7ed; line-height: 1.6; }
        .policy-list li + li { margin-top: 6px; }
        .signatures { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; margin-top: 36px; text-align: center; }
        .signature-box { min-height: 110px; padding-top: 12px; border-top: 1px solid #d8deea; color: #667085; }
        @media (max-width: 720px) { .receipt { padding: 22px; } .receipt-head, .summary, .grid, .signatures { grid-template-columns: 1fr; display: grid; } .status { justify-self: start; } }
        @media print { body { background: #fff; } .toolbar { display: none; } .receipt { width: 100%; margin: 0; padding: 20px; border: 0; border-radius: 0; } }
    </style>
</head>
<body>
    <div class="toolbar">
        <button type="button" onclick="window.print()">In / Lưu PDF</button>
        <button type="button" onclick="window.close()">Đóng</button>
    </div>
    <main class="receipt">
        <header class="receipt-head">
            <div>
                <div class="brand">OKXE</div>
                <h1>Biên nhận đặt cọc xe</h1>
            </div>
            <strong class="status">${escapeHtml(receipt.statusLabel || 'Đã nhận tiền')}</strong>
        </header>
        <section class="summary">${renderReceiptRows(receiptRows)}</section>
        <section class="section">
            <h2>Thông tin khách hàng</h2>
            <div class="grid">${renderReceiptRows(customerRows)}</div>
        </section>
        <section class="section">
            <h2>Thông tin xe</h2>
            <div class="grid">${renderReceiptRows(carRows)}</div>
        </section>
        <section class="section">
            <h2>Thông tin thanh toán</h2>
            <div class="grid">${renderReceiptRows(paymentRows)}</div>
        </section>
        <section class="section">
            <h2>Tài khoản nhận cọc</h2>
            <div class="grid">${renderReceiptRows(bankRows)}</div>
        </section>
        <section class="section">
            <h2>Chính sách đặt cọc</h2>
            ${renderReceiptPolicy(receipt.policyText)}
        </section>
        <p class="note">${escapeHtml(receipt.note || 'Biên nhận xác nhận OkXe đã nhận tiền đặt cọc giữ xe. Các bước mua bán tiếp theo sẽ được nhân viên hỗ trợ theo quy trình của cửa hàng.')}</p>
        <section class="signatures">
            <div class="signature-box">Khách hàng</div>
            <div class="signature-box">Đại diện OkXe</div>
        </section>
    </main>
</body>
</html>`;
};

const writeReceiptWindowMessage = (receiptWindow, message = 'Đang tải biên nhận...') => {
    receiptWindow.document.open();
    receiptWindow.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Biên nhận đặt cọc</title></head><body style="font-family: 'Segoe UI', 'Noto Sans', Arial, sans-serif; line-height: 1.5; padding: 32px; color: #102033;"><strong>${escapeHtml(message)}</strong></body></html>`);
    receiptWindow.document.close();
};

const fetchDepositReceipt = async ({ orderId = '', orderCode = '', phone = '' } = {}) => {
    const response = await fetch('/api/deposit-orders/receipt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderId,
            orderCode,
            phone
        })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải biên nhận đặt cọc.');
    }

    return data.receipt || null;
};

const openDepositReceipt = async ({ order = {}, phone = '' } = {}) => {
    const receiptWindow = window.open('', '_blank', 'width=920,height=900');

    if (!receiptWindow) {
        throw new Error('Trình duyệt đang chặn cửa sổ biên nhận. Vui lòng cho phép popup rồi thử lại.');
    }

    writeReceiptWindowMessage(receiptWindow);

    try {
        const receipt = await fetchDepositReceipt({
            orderId: order.id,
            orderCode: order.code,
            phone
        });

        receiptWindow.document.open();
        receiptWindow.document.write(getDepositReceiptDocument(receipt));
        receiptWindow.document.close();
        receiptWindow.focus();
    } catch (error) {
        writeReceiptWindowMessage(receiptWindow, error.message || 'Không thể tải biên nhận đặt cọc.');
        throw error;
    }
};

const normalizePhoneDigits = (value) => String(value || '').replace(/\D/g, '');

const getDepositStatusMeta = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();
    const statusMap = {
        confirmed: {
            label: 'Đã nhận tiền',
            className: 'is-confirmed',
            message: 'OkXe đã xác nhận nhận tiền đặt cọc. Nhân viên sẽ tiếp tục hỗ trợ hồ sơ mua xe.'
        },
        completed: {
            label: 'Hoàn tất giao dịch',
            className: 'is-confirmed',
            message: 'Giao dịch mua xe đã hoàn tất. Xe đã được chuyển sang trạng thái đã bán.'
        },
        cancelled_after_deposit: {
            label: 'Hủy sau đặt cọc',
            className: 'is-cancelled',
            message: 'Giao dịch sau đặt cọc đã hủy. Vui lòng kiểm tra ghi chú xử lý hoặc liên hệ OkXe để được hỗ trợ.'
        },
        cancelled: {
            label: 'Đã hủy',
            className: 'is-cancelled',
            message: 'Đơn đặt cọc đã bị hủy. Nếu thanh toán VNPay thất bại hoặc bạn đã hủy giao dịch, vui lòng tạo đơn mới để thanh toán lại.'
        },
        expired: {
            label: 'Quá hạn giữ chỗ',
            className: 'is-expired',
            message: 'Đơn đặt cọc đã quá hạn giữ chỗ. Xe có thể được mở lại để khách khác đặt cọc.'
        },
        pending: {
            label: 'Chờ xác nhận',
            className: 'is-pending',
            message: 'Đơn đang chờ nhân viên xác nhận đã nhận tiền chuyển khoản.'
        }
    };

    return statusMap[normalizedStatus] || statusMap.pending;
};

const depositStatusGuideItems = {
    pending: {
        icon: 'bx-time-five',
        title: 'Chờ xác nhận',
        description: 'Đơn đã được tạo và đang chờ OkXe đối soát tiền chuyển khoản.',
        steps: [
            'Chuyển khoản đúng số tiền và nội dung hiển thị trong đơn.',
            'Giữ lại ảnh biên lai để bổ sung sau khi đơn được xác nhận nhận tiền.',
            'Theo dõi màn hình chờ hoặc mục Quản lý đặt cọc trong tài khoản.'
        ]
    },
    confirmed: {
        icon: 'bx-check-shield',
        title: 'Đã nhận tiền',
        description: 'OkXe đã xác nhận tiền đặt cọc và tiếp tục giữ xe cho bạn.',
        steps: [
            'Xem hoặc in biên nhận đặt cọc.',
            'Bổ sung ảnh biên lai nếu cần lưu chứng từ trong hồ sơ.',
            'Chờ nhân viên OkXe liên hệ hỗ trợ hồ sơ mua xe và lịch nhận xe.'
        ]
    },
    completed: {
        icon: 'bx-check-circle',
        title: 'Hoàn tất giao dịch',
        description: 'Giao dịch mua xe đã hoàn tất và xe được chuyển sang trạng thái đã bán.',
        steps: [
            'Lưu biên nhận đặt cọc và chứng từ thanh toán.',
            'Liên hệ nhân viên nếu cần đối chiếu hồ sơ sau bàn giao.'
        ]
    },
    cancelled_after_deposit: {
        icon: 'bx-transfer-alt',
        title: 'Hủy sau đặt cọc',
        description: 'Đơn đã hủy sau khi OkXe xác nhận nhận tiền đặt cọc.',
        steps: [
            'Kiểm tra lý do hủy và thông tin hoàn cọc trong chi tiết đơn.',
            'Đối chiếu mã hoàn cọc hoặc liên hệ OkXe nếu chưa nhận được tiền hoàn.'
        ]
    },
    cancelled: {
        icon: 'bx-x-circle',
        title: 'Đã hủy',
        description: 'Đơn không còn hiệu lực giữ chỗ.',
        steps: [
            'Nếu đơn bị hủy do VNPay thất bại hoặc bạn bấm quay về/hủy giao dịch, xe sẽ được mở lại nếu không còn đơn giữ chỗ khác.',
            'Tạo đơn đặt cọc mới và thanh toán lại nếu bạn vẫn muốn giữ xe.',
            'Liên hệ OkXe nếu cần kiểm tra lịch sử thanh toán hoặc trạng thái xe.'
        ]
    },
    expired: {
        icon: 'bx-timer',
        title: 'Quá hạn giữ chỗ',
        description: 'Đơn đã hết hạn giữ xe trước khi OkXe xác nhận nhận tiền.',
        steps: [
            'Kiểm tra lại thời hạn giữ chỗ và lịch sử xử lý.',
            'Tạo đơn mới nếu xe còn bán hoặc liên hệ OkXe để được kiểm tra lại.'
        ]
    }
};

const getDepositStatusGuide = (status = 'pending') => {
    const normalizedStatus = String(status || 'pending').trim().toLowerCase();

    return depositStatusGuideItems[normalizedStatus] || depositStatusGuideItems.pending;
};

const renderDepositStatusSteps = (steps = []) => `
    <ol>
        ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
    </ol>
`;

const renderDepositStatusNextSteps = (status = 'pending') => {
    const guide = getDepositStatusGuide(status);

    return `
        <div class="deposit-status-next">
            <div class="deposit-status-next__header">
                <i class="bx ${escapeHtml(guide.icon)}" aria-hidden="true"></i>
                <div>
                    <span>Bước tiếp theo</span>
                    <strong>${escapeHtml(guide.title)}</strong>
                </div>
            </div>
            <p>${escapeHtml(guide.description)}</p>
            ${renderDepositStatusSteps(guide.steps)}
        </div>
    `;
};

const renderDepositStatusGuideList = () => {
    if (!depositStatusGuideList) {
        return;
    }

    const orderedStatuses = ['pending', 'confirmed', 'completed', 'cancelled_after_deposit', 'cancelled', 'expired'];
    depositStatusGuideList.innerHTML = orderedStatuses.map((status) => {
        const guide = getDepositStatusGuide(status);

        return `
            <article class="deposit-status-guide__item">
                <i class="bx ${escapeHtml(guide.icon)}" aria-hidden="true"></i>
                <div>
                    <strong>${escapeHtml(guide.title)}</strong>
                    <p>${escapeHtml(guide.description)}</p>
                    ${renderDepositStatusSteps(guide.steps)}
                </div>
            </article>
        `;
    }).join('');
};

const getOrderDisplayName = (order = {}) =>
    [order.carBrand, order.carName].filter(Boolean).join(' ')
        || getCarDisplayName(currentCar);

const renderDepositHistory = (history = []) => {
    const entries = Array.isArray(history) ? history : [];

    if (!entries.length) {
        return '';
    }

    return `
        <div class="deposit-lookup__history">
            <span>Lịch sử xử lý</span>
            ${entries.map((entry) => {
                const statusMeta = getDepositStatusMeta(entry.nextStatus);
                const actorText = entry.actorName || (entry.actionType === 'auto_expired' ? 'Hệ thống OkXe' : 'OkXe');
                const noteText = String(entry.note || '').trim();
                const titleText = entry.actionType === 'transfer_proof_uploaded'
                    ? 'Tải chứng từ chuyển khoản'
                    : entry.actionType === 'refund_recorded'
                        ? 'Ghi nhận hoàn cọc'
                    : statusMeta.label;

                return `
                    <article>
                        <strong>${escapeHtml(titleText)} · ${escapeHtml(formatDateTime(entry.createdAt))}</strong>
                        <small>${escapeHtml(actorText)}${noteText ? ` - ${escapeHtml(noteText)}` : ''}</small>
                    </article>
                `;
            }).join('')}
        </div>
    `;
};

const getCarImages = (car) => {
    const images = Array.isArray(car?.images) ? car.images : [];
    const fallbackImage = car?.image ? [car.image] : [];

    return [...images, ...fallbackImage].reduce((normalizedImages, image) => {
        const normalizedImage = String(image || '').trim();

        if (normalizedImage && !normalizedImages.includes(normalizedImage)) {
            normalizedImages.push(normalizedImage);
        }

        return normalizedImages;
    }, []);
};

const getCarStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLocaleLowerCase('vi-VN');

    if (['xe đã bán', 'hết xe', 'hết hàng'].includes(normalizedStatus)) {
        return 'is-sold';
    }

    if (normalizedStatus.includes('đang giữ') || normalizedStatus.includes('giữ chỗ')) {
        return 'is-held';
    }

    return 'is-available';
};

const isCarAvailableForDeposit = (car) => getCarStatusClass(car?.actionText) === 'is-available';

const getDepositUnavailableMessage = (car) =>
    getCarStatusClass(car?.actionText) === 'is-held'
        ? 'Xe này đang được giữ chỗ bởi một đơn đặt cọc khác. Vui lòng chọn xe khác hoặc liên hệ OkXe để được hỗ trợ.'
        : 'Xe này hiện không còn nhận đặt cọc. Vui lòng chọn xe khác hoặc liên hệ OkXe để được tư vấn.';

const setFeedback = (message = '', type = 'success') => {
    if (!depositFeedback) {
        return;
    }

    depositFeedback.textContent = message;
    depositFeedback.className = 'deposit-feedback';

    if (message) {
        depositFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const canUseLocalStorage = () => {
    try {
        const testKey = `${pendingDepositStorageKey}_test`;
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
};

const clearPendingDepositOrder = () => {
    if (!canUseLocalStorage()) {
        return;
    }

    window.localStorage.removeItem(pendingDepositStorageKey);
};

const savePendingDepositOrder = (order = {}, phone = '') => {
    if (!canUseLocalStorage() || String(order.status || 'pending').toLowerCase() !== 'pending') {
        return;
    }

    const orderId = Number(order.id || 0);
    const orderCode = String(order.code || (orderId ? `DC-${String(orderId).padStart(6, '0')}` : '')).trim();
    const normalizedPhone = String(phone || activeBankDepositPhone || '').trim();

    if (!orderId || !orderCode || !normalizedPhone) {
        return;
    }

    window.localStorage.setItem(pendingDepositStorageKey, JSON.stringify({
        id: orderId,
        code: orderCode,
        phone: normalizedPhone,
        carId: order.carId || null,
        carName: order.carName || '',
        carBrand: order.carBrand || '',
        depositAmount: Number(order.depositAmount || selectedDepositAmount || 0),
        paymentMethod: order.paymentMethod || 'bank',
        bankTransferNote: order.bankTransferNote || bankTransferNote?.textContent || '',
        status: 'pending',
        statusNote: order.statusNote || '',
        expiresAt: order.expiresAt || '',
        isOverdue: Boolean(order.isOverdue),
        createdAt: order.createdAt || '',
        updatedAt: order.updatedAt || '',
        savedAt: Date.now()
    }));
};

const getPendingDepositOrder = () => {
    if (!canUseLocalStorage()) {
        return null;
    }

    try {
        const storedOrder = JSON.parse(window.localStorage.getItem(pendingDepositStorageKey) || 'null');
        const orderId = Number(storedOrder?.id || 0);
        const phone = String(storedOrder?.phone || '').trim();

        return orderId && phone ? storedOrder : null;
    } catch (error) {
        clearPendingDepositOrder();
        return null;
    }
};

const setLookupFeedback = (message = '', type = 'success') => {
    if (!depositLookupFeedback) {
        return;
    }

    depositLookupFeedback.textContent = message;
    depositLookupFeedback.className = 'deposit-lookup__feedback';

    if (message) {
        depositLookupFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setLookupLoading = (isLoading) => {
    if (!depositLookupSubmitButton) {
        return;
    }

    depositLookupSubmitButton.disabled = isLoading;
    depositLookupSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang tra cứu...</span>'
        : '<i class="bx bx-search" aria-hidden="true"></i><span>Tra cứu</span>';
};

const fetchDepositOrderStatus = async ({ orderId = '', orderCode = '', phone = '' } = {}) => {
    const response = await fetch('/api/deposit-orders/status-check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderId,
            orderCode,
            phone
        })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Không thể kiểm tra trạng thái đơn đặt cọc.');
    }

    return data.order || null;
};

const canUploadDepositProof = (order = {}) =>
    String(order.status || '').trim().toLowerCase() === 'confirmed';

const resetDepositProofSelection = () => {
    selectedDepositProofFile = null;

    if (depositProofInput) {
        depositProofInput.value = '';
    }

    setDepositProofUploadLoading(false);

    if (depositProofUploadButton) {
        depositProofUploadButton.disabled = true;
    }
};

const updateDepositProofState = (order = {}) => {
    const proofUrl = String(order.transferProofUrl || '').trim();
    const proofFileName = String(order.transferProofFileName || '').trim();
    const proofUploadedAt = String(order.transferProofUploadedAt || '').trim();
    const canUpload = canUploadDepositProof(order);

    if (depositProofCurrentLink) {
        depositProofCurrentLink.hidden = !proofUrl;
        depositProofCurrentLink.href = proofUrl || '#';
        depositProofCurrentLink.textContent = proofFileName ? 'Xem chứng từ' : 'Xem ảnh đã tải';
    }

    if (depositProofTitle) {
        depositProofTitle.textContent = proofUrl
            ? 'Đã nhận chứng từ chuyển khoản'
            : 'Tải ảnh biên lai sau khi chuyển khoản';
    }

    if (depositProofDescription) {
        depositProofDescription.textContent = proofUrl
            ? `Chứng từ ${proofFileName || 'đã tải'}${proofUploadedAt ? ` lúc ${formatDateTime(proofUploadedAt)}` : ''}. Bạn có thể tải lại ảnh khác nếu cần đối chiếu.`
            : canUpload
                ? 'Chọn ảnh biên lai sau khi OkXe đã xác nhận nhận tiền đặt cọc.'
                : 'Chỉ đơn đã được xác nhận nhận tiền mới được bổ sung biên lai chuyển khoản.';
    }

    if (depositProofChooseButton) {
        depositProofChooseButton.disabled = !canUpload;
    }

    if (depositProofFileName && !selectedDepositProofFile) {
        depositProofFileName.textContent = proofUrl
            ? `Đã tải: ${proofFileName || 'chứng từ chuyển khoản'}`
            : canUpload
                ? 'Chưa chọn ảnh chứng từ.'
                : 'Chỉ đơn đã nhận tiền mới được tải biên lai.';
    }

    setDepositProofUploadLoading(false);
};

const uploadDepositTransferProof = async ({ order = {}, phone = '', file } = {}) => {
    if (!order?.id) {
        throw new Error('Không tìm thấy đơn đặt cọc cần tải chứng từ.');
    }

    const dataUrl = await readFileAsDataUrl(file);
    const response = await fetch(`/api/deposit-orders/${encodeURIComponent(String(order.id))}/transfer-proof`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone,
            file: {
                name: file.name,
                type: file.type,
                dataUrl
            }
        })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải chứng từ chuyển khoản.');
    }

    return data.order || null;
};

const renderLookupResult = (order = {}, phone = '') => {
    if (!depositLookupResult || !order) {
        return;
    }

    const statusMeta = getDepositStatusMeta(order.status);
    const orderCode = order.code || (order.id ? `DC-${String(order.id).padStart(6, '0')}` : 'Đơn đặt cọc');
    const note = String(order.statusNote || '').trim() || statusMeta.message;
    const normalizedStatus = String(order.status || '').trim().toLowerCase();
    const isVnpayPayment = String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';
    const canOpenWaiting = normalizedStatus === 'pending';
    const canPrintReceipt = ['confirmed', 'completed'].includes(normalizedStatus);
    const historyHtml = renderDepositHistory(order.history);

    lastLookupOrder = order;
    lastLookupPhone = phone;
    if (depositLookupCodeInput && orderCode) {
        depositLookupCodeInput.value = orderCode;
    }
    if (depositLookupPhoneInput && phone) {
        depositLookupPhoneInput.value = phone;
    }
    depositLookupResult.hidden = false;
    depositLookupResult.innerHTML = `
        <article class="deposit-lookup__result-card">
            <div class="deposit-lookup__result-top">
                <div>
                    <span>${escapeHtml(orderCode)}</span>
                    <h3>${escapeHtml(getOrderDisplayName(order))}</h3>
                </div>
                <strong class="deposit-lookup__status ${escapeHtml(statusMeta.className)}">${escapeHtml(statusMeta.label)}</strong>
            </div>
            <div class="deposit-lookup__details">
                <div>
                    <span>Số tiền cọc</span>
                    <strong>${escapeHtml(formatCurrency(order.depositAmount))}</strong>
                </div>
                <div>
                    <span>Phương thức</span>
                    <strong>${escapeHtml(isVnpayPayment ? 'VNPay' : 'Chuyển khoản ngân hàng')}</strong>
                </div>
                <div>
                    <span>${isVnpayPayment ? 'Mã VNPay' : 'Nội dung CK'}</span>
                    <strong>${escapeHtml(isVnpayPayment ? (order.vnpayTxnRef || order.paymentReference || 'Đang cập nhật') : (order.bankTransferNote || 'Đang cập nhật'))}</strong>
                </div>
                <div>
                    <span>Cập nhật</span>
                    <strong>${escapeHtml(formatDateTime(order.updatedAt || order.createdAt))}</strong>
                </div>
                ${order.expiresAt ? `
                    <div>
                        <span>Hạn giữ chỗ</span>
                        <strong>${escapeHtml(formatDateTime(order.expiresAt))}</strong>
                    </div>
                ` : ''}
                ${order.expiredAt ? `
                    <div>
                        <span>Quá hạn lúc</span>
                        <strong>${escapeHtml(formatDateTime(order.expiredAt))}</strong>
                    </div>
                ` : ''}
                ${order.paymentReference ? `
                    <div>
                        <span>Mã giao dịch</span>
                        <strong>${escapeHtml(order.paymentReference)}</strong>
                    </div>
                ` : ''}
                ${Number(order.refundAmount || 0) > 0 ? `
                    <div>
                        <span>Số tiền hoàn</span>
                        <strong>${escapeHtml(formatCurrency(order.refundAmount))}</strong>
                    </div>
                ` : ''}
                ${order.refundReference ? `
                    <div>
                        <span>Mã hoàn cọc</span>
                        <strong>${escapeHtml(order.refundReference)}</strong>
                    </div>
                ` : ''}
                ${order.refundCompletedAt ? `
                    <div>
                        <span>Đã hoàn lúc</span>
                        <strong>${escapeHtml(formatDateTime(order.refundCompletedAt))}</strong>
                    </div>
                ` : ''}
                ${order.refundNote ? `
                    <div>
                        <span>Ghi chú hoàn cọc</span>
                        <strong>${escapeHtml(order.refundNote)}</strong>
                    </div>
                ` : ''}
                ${order.transferProofUrl ? `
                    <div>
                        <span>Chứng từ CK</span>
                        <strong><a href="${escapeHtml(order.transferProofUrl)}" target="_blank" rel="noopener">${escapeHtml(order.transferProofFileName || 'Xem chứng từ')}</a></strong>
                    </div>
                ` : ''}
            </div>
            <p class="deposit-lookup__note">${escapeHtml(note)}</p>
            ${renderDepositStatusNextSteps(normalizedStatus)}
            ${historyHtml}
            ${canOpenWaiting || canPrintReceipt ? `
                <div class="deposit-lookup__result-actions">
                    ${canOpenWaiting ? `
                        <button type="button" data-open-lookup-waiting>
                            <i class="bx bx-loader-circle" aria-hidden="true"></i>
                            <span>Mở màn hình chờ</span>
                        </button>
                    ` : ''}
                    ${canPrintReceipt ? `
                        <button type="button" data-open-deposit-receipt>
                            <i class="bx bx-printer" aria-hidden="true"></i>
                            <span>In biên nhận</span>
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </article>
    `;
};

const syncStoredDepositOrder = (order = {}, phone = '') => {
    const status = String(order.status || '').trim().toLowerCase();

    if (status === 'pending') {
        savePendingDepositOrder(order, phone);
        return;
    }

    clearPendingDepositOrder();
};

const normalizeDepositPaymentConfig = (config = {}) => {
    const bank = config.bank || {};
    const vnpay = config.vnpay || {};
    const deposit = config.deposit || {};
    const accountName = String(bank.accountName || defaultDepositPaymentConfig.bank.accountName).trim();
    const bankName = String(bank.bankName || defaultDepositPaymentConfig.bank.bankName).trim();
    const displayName = String(bank.displayName || [accountName, bankName].filter(Boolean).join(' - ')).trim()
        || defaultDepositPaymentConfig.bank.displayName;
    const minAmount = normalizeMoneyAmount(deposit.minAmount, defaultDepositPaymentConfig.deposit.minAmount);
    const maxAmount = Math.max(
        minAmount,
        normalizeMoneyAmount(deposit.maxAmount, defaultDepositPaymentConfig.deposit.maxAmount)
    );
    const amountOptions = normalizeDepositAmountOptions(deposit.amountOptions)
        .filter((amount) => amount >= minAmount && amount <= maxAmount);
    const defaultAmount = normalizeMoneyAmount(deposit.defaultAmount, defaultDepositPaymentConfig.deposit.defaultAmount);

    return {
        supportedPaymentMethods: Array.isArray(config.supportedPaymentMethods) && config.supportedPaymentMethods.length
            ? config.supportedPaymentMethods.map((method) => String(method || '').trim().toLowerCase()).filter(Boolean)
            : [...defaultDepositPaymentConfig.supportedPaymentMethods],
        bank: {
            accountName,
            bankName,
            accountNumber: String(bank.accountNumber || defaultDepositPaymentConfig.bank.accountNumber).trim(),
            transferPrefix: String(bank.transferPrefix || defaultDepositPaymentConfig.bank.transferPrefix).trim(),
            displayName
        },
        vnpay: {
            enabled: Boolean(vnpay.enabled),
            sandbox: vnpay.sandbox !== false,
            localMock: Boolean(vnpay.localMock),
            officialSandbox: Boolean(vnpay.officialSandbox),
            paymentUrl: String(vnpay.paymentUrl || '').trim(),
            expireMinutes: Math.max(5, Math.min(60, Number(vnpay.expireMinutes || defaultDepositPaymentConfig.vnpay.expireMinutes) || 15)),
            setupMessage: String(vnpay.setupMessage || defaultDepositPaymentConfig.vnpay.setupMessage).trim()
        },
        deposit: {
            amountOptions: amountOptions.length ? amountOptions : [...defaultDepositPaymentConfig.deposit.amountOptions],
            defaultAmount: defaultAmount >= minAmount && defaultAmount <= maxAmount
                ? defaultAmount
                : amountOptions[0] || minAmount,
            minAmount,
            maxAmount,
            holdHours: Math.max(1, Math.min(168, Number(deposit.holdHours || defaultDepositPaymentConfig.deposit.holdHours) || 24)),
            requireTransferProof: Boolean(deposit.requireTransferProof),
            policyText: normalizeDepositPolicyText(deposit.policyText)
        }
    };
};

const renderDepositPolicy = () => {
    if (!depositPolicyContent) {
        return;
    }

    const policyText = normalizeDepositPolicyText(depositPaymentConfig.deposit?.policyText);
    const policyItems = policyText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    depositPolicyContent.innerHTML = policyItems.length
        ? `<ul>${policyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : `<p>${escapeHtml(defaultDepositPolicyText)}</p>`;
};

const renderDepositAmountOptions = () => {
    if (!amountOptions) {
        return;
    }

    const depositConfig = depositPaymentConfig.deposit || defaultDepositPaymentConfig.deposit;
    const availableOptions = normalizeDepositAmountOptions(depositConfig.amountOptions)
        .filter((amount) => amount >= depositConfig.minAmount && amount <= depositConfig.maxAmount);
    const defaultAmount = Number(depositConfig.defaultAmount || availableOptions[0] || selectedDepositAmount);
    const shouldKeepSelected = availableOptions.includes(selectedDepositAmount);

    selectedDepositAmount = shouldKeepSelected
        ? selectedDepositAmount
        : availableOptions.includes(defaultAmount)
            ? defaultAmount
            : availableOptions[0] || selectedDepositAmount;

    amountOptions.innerHTML = availableOptions.map((amount) => `
        <label>
            <input type="radio" name="depositAmount" value="${amount}" ${amount === selectedDepositAmount ? 'checked' : ''}>
            <span>${escapeHtml(getDepositAmountOptionLabel(amount))}</span>
        </label>
    `).join('');
};

const renderDepositPaymentConfig = () => {
    const bank = depositPaymentConfig.bank || defaultDepositPaymentConfig.bank;
    const vnpay = depositPaymentConfig.vnpay || defaultDepositPaymentConfig.vnpay;
    const supportedPaymentMethods = Array.isArray(depositPaymentConfig.supportedPaymentMethods)
        ? depositPaymentConfig.supportedPaymentMethods
        : defaultDepositPaymentConfig.supportedPaymentMethods;

    bankDisplayElements.forEach((element) => {
        element.textContent = bank.displayName || defaultDepositPaymentConfig.bank.displayName;
    });

    bankAccountNumberElements.forEach((element) => {
        element.textContent = bank.accountNumber || defaultDepositPaymentConfig.bank.accountNumber;
    });

    vnpayExpireElements.forEach((element) => {
        element.textContent = `${vnpay.expireMinutes || 15} phút`;
    });

    const isLocalVnpayMock = Boolean(vnpay.localMock);
    const vnpayTitle = isLocalVnpayMock ? 'VNPay demo nội bộ' : 'VNPay sandbox';
    const vnpayDescription = isLocalVnpayMock
        ? 'Mô phỏng theo luồng VNPay khi chưa có merchant sandbox'
        : 'Chuyển sang cổng VNPay sandbox chính thức';

    if (vnpayMethodTitle) {
        vnpayMethodTitle.textContent = vnpayTitle;
    }

    if (vnpayMethodDescription) {
        vnpayMethodDescription.textContent = vnpayDescription;
    }

    if (vnpayGatewayLabel) {
        vnpayGatewayLabel.textContent = isLocalVnpayMock
            ? 'VNPay sandbox simulator'
            : 'sandbox.vnpayment.vn';
    }

    if (vnpayConfirmLabel) {
        vnpayConfirmLabel.textContent = isLocalVnpayMock
            ? 'Tự động sau khi simulator trả callback đã ký'
            : 'Tự động sau khi VNPay trả Return/IPN hợp lệ';
    }

    paymentMethods.forEach((method) => {
        const input = method.querySelector('input');
        const paymentMethod = String(input?.value || 'bank').trim().toLowerCase();
        const isSupported = supportedPaymentMethods.includes(paymentMethod);

        method.classList.toggle('payment-method--disabled', !isSupported);
        method.setAttribute('aria-disabled', isSupported ? 'false' : 'true');
        if (input) {
            input.disabled = !isSupported;
        }
    });

    renderDepositAmountOptions();
    renderDepositPolicy();
    updateDepositTotals();
    setActivePaymentMethod(document.querySelector('input[name="paymentMethod"]:checked')?.value || 'bank');
};

const loadDepositPaymentConfig = async () => {
    try {
        const response = await fetch('/api/deposit-payment/config');
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải cấu hình thanh toán đặt cọc.');
        }

        depositPaymentConfig = normalizeDepositPaymentConfig(data);
    } catch (error) {
        depositPaymentConfig = normalizeDepositPaymentConfig(defaultDepositPaymentConfig);
    }

    renderDepositPaymentConfig();
    updateBankTransferNote();
};

const getCarDisplayName = (car) => [car?.brand, car?.name]
    .filter(Boolean)
    .join(' ')
    .trim() || 'xe đã chọn';

const openDepositSuccessModal = ({
    orderCode = '',
    carName = '',
    depositAmount = 0,
    message = '',
    order = null,
    phone = ''
} = {}) => {
    if (!depositSuccessModal) {
        return;
    }

    const canPrintReceipt = order?.id
        && phone
        && ['confirmed', 'completed'].includes(String(order.status || '').trim().toLowerCase());
    activeReceiptOrder = canPrintReceipt ? order : null;
    activeReceiptPhone = canPrintReceipt ? phone : '';

    if (depositSuccessCode) {
        depositSuccessCode.textContent = orderCode || 'Đang cập nhật';
    }

    if (depositSuccessCar) {
        depositSuccessCar.textContent = carName || getCarDisplayName(currentCar);
    }

    if (depositSuccessAmount) {
        depositSuccessAmount.textContent = formatCurrency(depositAmount || selectedDepositAmount);
    }

    if (depositSuccessMessage) {
        depositSuccessMessage.textContent = message || (orderCode
            ? `Mã đơn ${orderCode} đã được tạo. Nhân viên OkXe sẽ kiểm tra và liên hệ xác nhận giữ chỗ trong thời gian sớm nhất.`
            : 'Nhân viên OkXe sẽ kiểm tra và liên hệ xác nhận giữ chỗ trong thời gian sớm nhất.');
    }

    if (depositSuccessReceiptButton) {
        depositSuccessReceiptButton.hidden = !canPrintReceipt;
    }

    lastFocusedElementBeforeSuccess = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    depositSuccessModal.classList.add('is-open');
    depositSuccessModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('deposit-success-modal-open');
    depositSuccessDialog?.focus();
};

const closeDepositSuccessModal = () => {
    if (!depositSuccessModal) {
        return;
    }

    depositSuccessModal.classList.remove('is-open');
    depositSuccessModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('deposit-success-modal-open');
    activeReceiptOrder = null;
    activeReceiptPhone = '';
    lastFocusedElementBeforeSuccess?.focus?.();
};

const stopDepositStatusPolling = () => {
    if (depositStatusPollTimer) {
        window.clearInterval(depositStatusPollTimer);
        depositStatusPollTimer = null;
    }
};

const setDepositWaitingState = (state = 'pending', message = '') => {
    if (!depositWaitingModal) {
        return;
    }

    depositWaitingModal.dataset.state = state;
    const activePaymentMethod = String(activeBankDepositOrder?.paymentMethod || '').trim().toLowerCase();
    const isVnpayPayment = activePaymentMethod === 'vnpay';

    if (state === 'completed') {
        if (depositWaitingStatusLabel) {
            depositWaitingStatusLabel.textContent = 'Hoàn tất giao dịch';
        }
        if (depositWaitingTitle) {
            depositWaitingTitle.textContent = 'Giao dịch mua xe đã hoàn tất';
        }
        if (depositWaitingMessage) {
            depositWaitingMessage.textContent = message || 'OkXe đã chốt hoàn tất giao dịch mua xe từ đơn đặt cọc này.';
        }
        if (depositWaitingHint) {
            depositWaitingHint.textContent = 'Bạn có thể xem lại đơn trong mục Quản lý đặt cọc.';
        }
        return;
    }

    if (state === 'confirmed') {
        if (depositWaitingStatusLabel) {
            depositWaitingStatusLabel.textContent = 'Đã nhận tiền';
        }
        if (depositWaitingTitle) {
            depositWaitingTitle.textContent = isVnpayPayment
                ? 'VNPay đã xác nhận thanh toán'
                : 'Nhân viên đã xác nhận chuyển khoản';
        }
        if (depositWaitingMessage) {
            depositWaitingMessage.textContent = message || (isVnpayPayment
                ? 'OkXe đã nhận kết quả thanh toán thành công từ VNPay.'
                : 'OkXe đã xác nhận nhận được tiền đặt cọc của bạn.');
        }
        if (depositWaitingHint) {
            depositWaitingHint.textContent = 'Màn hình sẽ chuyển sang thông báo đặt cọc thành công.';
        }
        return;
    }

    if (state === 'cancelled_after_deposit') {
        if (depositWaitingStatusLabel) {
            depositWaitingStatusLabel.textContent = 'Hủy sau đặt cọc';
        }
        if (depositWaitingTitle) {
            depositWaitingTitle.textContent = 'Giao dịch sau đặt cọc đã hủy';
        }
        if (depositWaitingMessage) {
            depositWaitingMessage.textContent = message || 'Giao dịch sau đặt cọc đã hủy. Vui lòng liên hệ OkXe để được hỗ trợ chính sách hoàn cọc hoặc xử lý tiếp.';
        }
        if (depositWaitingHint) {
            depositWaitingHint.textContent = 'Bạn có thể xem lại đơn trong mục Quản lý đặt cọc hoặc liên hệ nhân viên OkXe để được hỗ trợ.';
        }
        return;
    }

    if (state === 'cancelled') {
        if (depositWaitingStatusLabel) {
            depositWaitingStatusLabel.textContent = 'Đơn đã bị hủy';
        }
        if (depositWaitingTitle) {
            depositWaitingTitle.textContent = isVnpayPayment
                ? 'Thanh toán VNPay đã hủy'
                : 'Không thể tiếp tục giữ chỗ';
        }
        if (depositWaitingMessage) {
            depositWaitingMessage.textContent = message || (isVnpayPayment
                ? 'Thanh toán VNPay thất bại hoặc đã bị hủy. Đơn đặt cọc không còn hiệu lực, vui lòng tạo đơn mới để thanh toán lại.'
                : 'Đơn đặt cọc đã bị hủy. Vui lòng liên hệ OkXe nếu bạn cần hỗ trợ thêm.');
        }
        if (depositWaitingHint) {
            depositWaitingHint.textContent = isVnpayPayment
                ? 'Xe sẽ được mở lại nếu không còn đơn giữ chỗ khác. Hãy tạo đơn đặt cọc mới nếu bạn vẫn muốn giữ xe.'
                : 'Bạn có thể chọn xe khác hoặc liên hệ nhân viên để được hỗ trợ.';
        }
        return;
    }

    if (state === 'expired') {
        if (depositWaitingStatusLabel) {
            depositWaitingStatusLabel.textContent = 'Đơn đã quá hạn';
        }
        if (depositWaitingTitle) {
            depositWaitingTitle.textContent = 'Đã hết thời gian giữ chỗ';
        }
        if (depositWaitingMessage) {
            depositWaitingMessage.textContent = message || 'Đơn đặt cọc đã quá hạn giữ chỗ. Vui lòng tạo đơn mới hoặc liên hệ OkXe để được hỗ trợ.';
        }
        if (depositWaitingHint) {
            depositWaitingHint.textContent = 'Bạn có thể xem lại đơn trong mục Quản lý đặt cọc hoặc chọn xe khác nếu xe đã được mở bán.';
        }
        return;
    }

    if (depositWaitingStatusLabel) {
        depositWaitingStatusLabel.textContent = isVnpayPayment ? 'Đang chờ VNPay' : 'Đang chờ chuyển khoản';
    }
    if (depositWaitingTitle) {
        depositWaitingTitle.textContent = isVnpayPayment
            ? 'Chờ kết quả thanh toán tự động'
            : 'Chờ nhân viên xác nhận đã nhận tiền';
    }
    if (depositWaitingMessage) {
        depositWaitingMessage.textContent = message || (isVnpayPayment
            ? 'Đơn đặt cọc đã được tạo. Vui lòng hoàn tất thanh toán trên VNPay, hệ thống sẽ tự cập nhật khi nhận kết quả.'
            : 'Đơn đặt cọc đã được tạo. Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để OkXe xác nhận nhanh hơn.');
    }
    if (depositWaitingHint) {
        depositWaitingHint.textContent = isVnpayPayment
            ? 'Nếu bạn vừa quay lại từ VNPay, hãy bấm kiểm tra trạng thái sau vài giây.'
            : 'Sau khi bạn chuyển khoản, màn hình này sẽ tự cập nhật khi nhân viên xác nhận đã nhận tiền.';
    }
};

const updateDepositWaitingOrder = (order = {}) => {
    const isVnpayPayment = String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';

    if (depositWaitingCode) {
        depositWaitingCode.textContent = order.code || 'Đang cập nhật';
    }

    if (depositWaitingCar) {
        depositWaitingCar.textContent = [order.carBrand, order.carName].filter(Boolean).join(' ')
            || getCarDisplayName(currentCar);
    }

    if (depositWaitingAmount) {
        depositWaitingAmount.textContent = formatCurrency(order.depositAmount || selectedDepositAmount);
    }

    if (depositWaitingTransferNote) {
        depositWaitingTransferNote.textContent = order.bankTransferNote || bankTransferNote?.textContent || 'OKXE COC XE';
    }

    if (depositWaitingBank) {
        depositWaitingBank.hidden = isVnpayPayment;
    }

    if (depositProofCard) {
        depositProofCard.hidden = isVnpayPayment;
    }

    if (!isVnpayPayment) {
        updateDepositProofState(order);
    }
};

const closeDepositWaitingModal = () => {
    if (!depositWaitingModal) {
        return;
    }

    stopDepositStatusPolling();
    depositWaitingModal.classList.remove('is-open');
    depositWaitingModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('deposit-waiting-modal-open');
    lastFocusedElementBeforeWaiting?.focus?.();
};

const openDepositWaitingModal = ({ order = {}, phone = '' } = {}) => {
    if (!depositWaitingModal) {
        return;
    }

    activeBankDepositOrder = order;
    activeBankDepositPhone = phone;
    resetDepositProofSelection();
    updateDepositWaitingOrder(order);
    setDepositWaitingState('pending');
    syncStoredDepositOrder({
        status: 'pending',
        ...order
    }, phone);

    lastFocusedElementBeforeWaiting = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    depositWaitingModal.classList.add('is-open');
    depositWaitingModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('deposit-waiting-modal-open');
    depositWaitingDialog?.focus();
};

const checkActiveDepositOrderStatus = async ({ silent = false } = {}) => {
    if (!activeBankDepositOrder?.id || !activeBankDepositPhone) {
        return null;
    }

    if (depositWaitingCheckButton && !silent) {
        depositWaitingCheckButton.disabled = true;
        depositWaitingCheckButton.innerHTML = '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang kiểm tra...</span>';
    }

    try {
        const latestOrder = await fetchDepositOrderStatus({
            orderId: activeBankDepositOrder.id,
            orderCode: activeBankDepositOrder.code,
            phone: activeBankDepositPhone
        });

        activeBankDepositOrder = {
            ...activeBankDepositOrder,
            ...latestOrder
        };
        updateDepositWaitingOrder(activeBankDepositOrder);
        syncStoredDepositOrder(activeBankDepositOrder, activeBankDepositPhone);

        if (activeBankDepositOrder.status === 'confirmed' || activeBankDepositOrder.status === 'completed') {
            stopDepositStatusPolling();
            setDepositWaitingState(activeBankDepositOrder.status, activeBankDepositOrder.statusNote);
            window.setTimeout(() => {
                closeDepositWaitingModal();
                openDepositSuccessModal({
                    orderCode: activeBankDepositOrder.code,
                    carName: [activeBankDepositOrder.carBrand, activeBankDepositOrder.carName].filter(Boolean).join(' '),
                    depositAmount: activeBankDepositOrder.depositAmount,
                    message: activeBankDepositOrder.statusNote
                        || (activeBankDepositOrder.status === 'completed'
                            ? `OkXe đã hoàn tất giao dịch mua xe từ mã đơn ${activeBankDepositOrder.code}.`
                            : `OkXe đã xác nhận nhận tiền đặt cọc cho mã đơn ${activeBankDepositOrder.code}. Nhân viên sẽ tiếp tục hỗ trợ hồ sơ mua xe.`),
                    order: activeBankDepositOrder,
                    phone: activeBankDepositPhone
                });
            }, 900);
        } else if (['cancelled', 'cancelled_after_deposit', 'expired'].includes(activeBankDepositOrder.status)) {
            stopDepositStatusPolling();
            setDepositWaitingState(activeBankDepositOrder.status, activeBankDepositOrder.statusNote);
        } else if (!silent) {
            setDepositWaitingState('pending', 'Đơn vẫn đang chờ nhân viên xác nhận đã nhận tiền. Vui lòng kiểm tra lại sau ít phút.');
        }

        return activeBankDepositOrder;
    } catch (error) {
        if (!silent) {
            setDepositWaitingState('pending', error.message || 'Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại sau.');
        }
        return null;
    } finally {
        if (depositWaitingCheckButton) {
            depositWaitingCheckButton.disabled = false;
            depositWaitingCheckButton.innerHTML = '<i class="bx bx-refresh" aria-hidden="true"></i><span>Kiểm tra trạng thái</span>';
        }
    }
};

const startDepositStatusPolling = () => {
    stopDepositStatusPolling();
    depositStatusPollTimer = window.setInterval(() => {
        checkActiveDepositOrderStatus({ silent: true });
    }, 5000);
};

const setSubmitLoading = (isLoading) => {
    if (!depositSubmitButton) {
        return;
    }

    const isUnavailable = currentCar && !isCarAvailableForDeposit(currentCar);
    const needsLogin = depositAuthResolved && !currentDepositUser;

    depositSubmitButton.disabled = isLoading || isUnavailable || !depositAuthResolved || needsLogin;
    depositSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang gửi yêu cầu...</span>'
        : !depositAuthResolved
            ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang kiểm tra đăng nhập...</span>'
        : needsLogin
            ? '<i class="bx bx-user-check" aria-hidden="true"></i><span>Đăng nhập để đặt cọc</span>'
        : isUnavailable
            ? '<i class="bx bx-block" aria-hidden="true"></i><span>Không nhận đặt cọc</span>'
        : '<i class="bx bx-lock-alt" aria-hidden="true"></i><span>Xác nhận đặt cọc</span>';
};

const setDepositAuthState = (user = null) => {
    currentDepositUser = user || null;
    depositAuthResolved = true;

    const isLoggedIn = Boolean(currentDepositUser);

    if (depositAuthNotice) {
        depositAuthNotice.hidden = isLoggedIn;
    }

    if (depositAuthLoginLink) {
        depositAuthLoginLink.href = getDepositAuthUrl('login');
    }

    if (depositAuthSignupLink) {
        depositAuthSignupLink.href = getDepositAuthUrl('signup');
    }

    depositForm?.classList.toggle('is-auth-required', !isLoggedIn);
    document.querySelector('.deposit-summary')?.classList.toggle('is-auth-required', !isLoggedIn);

    if (!isLoggedIn) {
        setFeedback('Vui lòng đăng nhập để đặt cọc xe. Đơn đặt cọc sẽ được lưu theo tài khoản của bạn.', 'error');
    } else if (depositFeedback?.textContent?.includes('Vui lòng đăng nhập')) {
        setFeedback('');
    }

    setSubmitLoading(false);
};

const updateBankTransferNote = () => {
    if (!bankTransferNote) {
        return;
    }

    const carId = currentCar?.id ? `XE${currentCar.id}` : 'XE';
    const phoneDigits = String(phoneInput?.value || '').replace(/\D/g, '');
    const phoneSuffix = phoneDigits ? ` ${phoneDigits.slice(-4)}` : '';
    const transferPrefix = String(depositPaymentConfig.bank?.transferPrefix || 'OKXE COC').trim() || 'OKXE COC';

    bankTransferNote.textContent = `${transferPrefix} ${carId}${phoneSuffix}`;
};

const getUnsupportedPaymentMethodMessage = (paymentMethod = '') => {
    const normalizedMethod = String(paymentMethod || '').trim().toLowerCase();

    if (normalizedMethod === 'vnpay') {
        return depositPaymentConfig.vnpay?.setupMessage
            || 'VNPay chưa được cấu hình. Vui lòng chọn chuyển khoản ngân hàng.';
    }

    return 'Phương thức này chưa được hỗ trợ trong luồng đặt cọc hiện tại.';
};

const updateDepositTotals = () => {
    const priceValue = Number(currentCar?.priceValue || 0);
    const remainingValue = Math.max(0, priceValue - selectedDepositAmount);

    if (amountLabel) {
        amountLabel.textContent = formatCurrency(selectedDepositAmount);
    }

    if (totalAmountElement) {
        totalAmountElement.textContent = formatCurrency(selectedDepositAmount);
    }

    if (carPriceElement) {
        carPriceElement.textContent = priceValue > 0
            ? formatCurrency(priceValue)
            : currentCar?.price || 'Liên hệ';
    }

    if (remainingAmountElement) {
        remainingAmountElement.textContent = priceValue > 0
            ? formatCurrency(remainingValue)
            : 'Nhân viên sẽ xác nhận';
    }
};

const renderCarSummary = (car) => {
    if (!carSummary) {
        return;
    }

    if (!car) {
        carSummary.innerHTML = `
            <article class="deposit-car__empty">
                <i class="bx bx-car" aria-hidden="true"></i>
                <div>
                    <strong>Chưa chọn xe đặt cọc</strong>
                    <p>Quay lại danh sách xe và chọn mẫu xe bạn muốn giữ chỗ.</p>
                    <a href="/mua-xe">Chọn xe ngay</a>
                </div>
            </article>
        `;
        updateDepositTotals();
        updateBankTransferNote();
        return;
    }

    const image = getCarImages(car)[0] || '/images/rental-1.png';
    const statusText = car.actionText || 'Còn xe';
    const statusClass = getCarStatusClass(statusText);
    const specs = [car.year, car.fuel, car.mileage, car.gearbox, car.drivetrain]
        .filter(Boolean)
        .slice(0, 5);

    carSummary.innerHTML = `
        <div class="deposit-car__media">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(car.name || 'Xe đang đặt cọc')}">
        </div>
        <div class="deposit-car__body">
            <span class="deposit-car__category">${escapeHtml(car.brand || car.category || 'OkXe')}</span>
            <span class="deposit-car__status ${statusClass}">${escapeHtml(statusText)}</span>
            <h2>${escapeHtml(car.name || 'Xe đang đặt cọc')}</h2>
            <div class="deposit-car__specs">
                ${specs.length
                    ? specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join('')
                    : '<span>Thông tin xe đang cập nhật</span>'}
            </div>
        </div>
    `;

    updateDepositTotals();
    updateBankTransferNote();
};

const loadSelectedCar = async () => {
    const selectedCarId = getCarIdFromUrl();

    try {
        const response = await fetch('/api/cars');
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải thông tin xe.');
        }

        const cars = Array.isArray(data.cars) ? data.cars : [];
        currentCar = cars.find((car) => String(car.id) === selectedCarId) || null;
        renderCarSummary(currentCar);
        setSubmitLoading(false);

        if (currentCar && !isCarAvailableForDeposit(currentCar)) {
            setFeedback(getDepositUnavailableMessage(currentCar), 'error');
        }
    } catch (error) {
        currentCar = null;
        renderCarSummary(null);
        setSubmitLoading(false);
        setFeedback(error.message || 'Không thể tải thông tin xe.', 'error');
    }
};

const fillCurrentUserProfile = async () => {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json().catch(() => ({}));
        const user = response.ok ? data.user : null;

        if (!user) {
            setDepositAuthState(null);
            return;
        }

        setDepositAuthState(user);

        if (fullNameInput && !fullNameInput.value) {
            fullNameInput.value = user.fullName || '';
        }

        if (phoneInput && !phoneInput.value) {
            phoneInput.value = user.phone || '';
        }

        if (emailInput && !emailInput.value) {
            emailInput.value = user.email || '';
        }

        updateBankTransferNote();
    } catch (error) {
        setDepositAuthState(null);
        updateBankTransferNote();
    }
};

const setActivePaymentMethod = (paymentMethod) => {
    const supportedPaymentMethods = Array.isArray(depositPaymentConfig.supportedPaymentMethods)
        ? depositPaymentConfig.supportedPaymentMethods
        : ['bank'];
    const nextPaymentMethod = supportedPaymentMethods.includes(paymentMethod) ? paymentMethod : 'bank';

    paymentMethods.forEach((method) => {
        const input = method.querySelector('input');
        const isActive = input?.value === nextPaymentMethod;

        method.classList.toggle('is-active', isActive);
        if (input) {
            input.checked = isActive;
        }
    });

    paymentPanels.forEach((panel) => {
        const isActive = panel.dataset.paymentPanel === nextPaymentMethod;

        panel.hidden = !isActive;
        panel.classList.toggle('is-active', isActive);
    });
};

paymentMethods.forEach((method) => {
    method.addEventListener('click', () => {
        const input = method.querySelector('input');
        const paymentMethod = input?.value || 'bank';

        if (input?.disabled) {
            setActivePaymentMethod('bank');
            setFeedback(getUnsupportedPaymentMethodMessage(paymentMethod), 'error');
            return;
        }

        setActivePaymentMethod(paymentMethod);
        setFeedback('');
    });
});

amountOptions?.addEventListener('change', (event) => {
    const nextAmount = Number(event.target.value || 0);

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
        return;
    }

    selectedDepositAmount = nextAmount;
    updateDepositTotals();
    setFeedback('');
});

phoneInput?.addEventListener('input', updateBankTransferNote);

depositLookupForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const orderCode = String(depositLookupCodeInput?.value || '').trim().toUpperCase();
    const phone = String(depositLookupPhoneInput?.value || '').trim();
    const phoneDigits = normalizePhoneDigits(phone);

    if (!orderCode) {
        setLookupFeedback('Vui lòng nhập mã đơn đặt cọc.', 'error');
        depositLookupCodeInput?.focus();
        return;
    }

    if (!/^\+?[0-9\s.-]{8,20}$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15) {
        setLookupFeedback('Số điện thoại tra cứu không hợp lệ.', 'error');
        depositLookupPhoneInput?.focus();
        return;
    }

    setLookupLoading(true);
    setLookupFeedback('');

    try {
        const order = await fetchDepositOrderStatus({
            orderCode,
            phone
        });

        renderLookupResult(order, phone);
        syncStoredDepositOrder(order, phone);
        setLookupFeedback(`Đã tìm thấy đơn ${order.code || orderCode}.`, 'success');
    } catch (error) {
        lastLookupOrder = null;
        lastLookupPhone = '';
        if (depositLookupResult) {
            depositLookupResult.hidden = true;
            depositLookupResult.innerHTML = '';
        }
        setLookupFeedback(error.message || 'Không thể tra cứu đơn đặt cọc lúc này.', 'error');
    } finally {
        setLookupLoading(false);
    }
});

depositLookupResult?.addEventListener('click', (event) => {
    const receiptButton = event.target.closest('[data-open-deposit-receipt]');
    const openWaitingButton = event.target.closest('[data-open-lookup-waiting]');

    if (receiptButton) {
        if (!lastLookupOrder || !lastLookupPhone) {
            return;
        }

        openDepositReceipt({
            order: lastLookupOrder,
            phone: lastLookupPhone
        })
            .then(() => setLookupFeedback(`Đã mở biên nhận cho đơn ${lastLookupOrder.code || 'đặt cọc'}.`, 'success'))
            .catch((error) => setLookupFeedback(error.message || 'Không thể mở biên nhận đặt cọc.', 'error'));
        return;
    }

    if (!openWaitingButton || !lastLookupOrder || !lastLookupPhone) {
        return;
    }

    openDepositWaitingModal({
        order: lastLookupOrder,
        phone: lastLookupPhone
    });
    startDepositStatusPolling();
});

depositForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(depositForm);
    const fullName = String(fullNameInput?.value || '').trim();
    const phone = String(phoneInput?.value || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');
    const email = String(emailInput?.value || '').trim();

    if (!currentDepositUser) {
        setFeedback('Bạn cần đăng nhập để đặt cọc xe. Vui lòng đăng nhập rồi quay lại trang này.', 'error');
        depositAuthLoginLink?.focus?.();
        return;
    }

    if (!currentCar) {
        setFeedback('Vui lòng chọn xe trước khi thanh toán đặt cọc.', 'error');
        return;
    }

    if (!isCarAvailableForDeposit(currentCar)) {
        setFeedback(getDepositUnavailableMessage(currentCar), 'error');
        return;
    }

    if (fullName.length < 2) {
        setFeedback('Vui lòng nhập họ và tên khách hàng.', 'error');
        fullNameInput?.focus();
        return;
    }

    if (!/^\+?[0-9\s.-]{8,20}$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15) {
        setFeedback('Số điện thoại liên hệ không hợp lệ.', 'error');
        phoneInput?.focus();
        return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFeedback('Email liên hệ không hợp lệ.', 'error');
        emailInput?.focus();
        return;
    }

    if (!termsInput?.checked) {
        setFeedback('Vui lòng xác nhận điều khoản đặt cọc trước khi tiếp tục.', 'error');
        termsInput?.focus();
        return;
    }

    const paymentMethod = String(formData.get('paymentMethod') || 'bank').trim().toLowerCase();
    const supportedPaymentMethods = Array.isArray(depositPaymentConfig.supportedPaymentMethods)
        ? depositPaymentConfig.supportedPaymentMethods
        : ['bank'];

    if (!supportedPaymentMethods.includes(paymentMethod)) {
        setActivePaymentMethod('bank');
        setFeedback(getUnsupportedPaymentMethodMessage(paymentMethod), 'error');
        return;
    }

    const payload = {
        carId: currentCar.id,
        fullName,
        phone,
        email,
        province: formData.get('province'),
        note: formData.get('note'),
        depositAmount: selectedDepositAmount,
        paymentMethod,
        bankTransferNote: bankTransferNote?.textContent || '',
        acceptedDepositPolicy: true
    };

    setSubmitLoading(true);
    setFeedback('');

    try {
        const response = await fetch('/api/deposit-orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Không thể gửi yêu cầu đặt cọc lúc này.');
        }

        const orderCode = data.order?.code || (data.order?.id ? `DC-${String(data.order.id).padStart(6, '0')}` : '');

        setFeedback(
            `${data.message || 'OkXe đã nhận yêu cầu đặt cọc.'}${orderCode ? ` Mã đơn: ${orderCode}.` : ''}`,
            'success'
        );
        currentCar = {
            ...currentCar,
            actionText: 'Đang giữ chỗ'
        };
        renderCarSummary(currentCar);
        const createdOrder = {
            ...data.order,
            code: orderCode || data.order?.code,
            bankTransferNote: data.order?.bankTransferNote || bankTransferNote?.textContent || ''
        };

        if (data.payment?.provider === 'vnpay' && data.payment.paymentUrl) {
            syncStoredDepositOrder({
                status: 'pending',
                ...createdOrder
            }, phone);
            renderLookupResult(createdOrder, phone);
            setFeedback(
                depositPaymentConfig.vnpay?.localMock
                    ? 'Đang chuyển sang màn VNPay demo nội bộ để thanh toán đặt cọc...'
                    : 'Đang chuyển sang cổng VNPay sandbox chính thức để thanh toán đặt cọc...',
                'success'
            );
            window.location.assign(data.payment.paymentUrl);
            return;
        }

        openDepositWaitingModal({
            order: createdOrder,
            phone
        });
        renderLookupResult(createdOrder, phone);
        startDepositStatusPolling();
        if (termsInput) {
            termsInput.checked = false;
        }
    } catch (error) {
        setFeedback(error.message || 'Không thể gửi yêu cầu đặt cọc lúc này.', 'error');
    } finally {
        setSubmitLoading(false);
    }
});

depositSuccessCloseButtons.forEach((button) => {
    button.addEventListener('click', closeDepositSuccessModal);
});

depositSuccessReceiptButton?.addEventListener('click', () => {
    if (!activeReceiptOrder || !activeReceiptPhone) {
        setFeedback('Biên nhận chỉ khả dụng sau khi đơn được xác nhận đã nhận tiền.', 'error');
        return;
    }

    openDepositReceipt({
        order: activeReceiptOrder,
        phone: activeReceiptPhone
    }).catch((error) => {
        setFeedback(error.message || 'Không thể mở biên nhận đặt cọc.', 'error');
    });
});

depositWaitingCloseButtons.forEach((button) => {
    button.addEventListener('click', closeDepositWaitingModal);
});

depositWaitingCheckButton?.addEventListener('click', () => {
    checkActiveDepositOrderStatus();
});

depositProofChooseButton?.addEventListener('click', () => {
    depositProofInput?.click();
});

depositProofInput?.addEventListener('change', () => {
    const file = depositProofInput.files?.[0] || null;
    selectedDepositProofFile = file;
    setDepositProofFeedback('');

    if (depositProofFileName) {
        depositProofFileName.textContent = file
            ? `Đã chọn: ${file.name}`
            : 'Chưa chọn ảnh chứng từ.';
    }

    setDepositProofUploadLoading(false);
});

depositProofUploadButton?.addEventListener('click', async () => {
    if (!selectedDepositProofFile) {
        setDepositProofFeedback('Vui lòng chọn ảnh chứng từ chuyển khoản.', 'error');
        depositProofInput?.focus?.();
        return;
    }

    if (!activeBankDepositOrder?.id || !activeBankDepositPhone) {
        setDepositProofFeedback('Không tìm thấy đơn đặt cọc cần tải chứng từ.', 'error');
        return;
    }

    if (!canUploadDepositProof(activeBankDepositOrder)) {
        setDepositProofFeedback('Chỉ đơn đã được xác nhận nhận tiền mới được tải biên lai.', 'error');
        return;
    }

    setDepositProofUploadLoading(true);
    setDepositProofFeedback('');

    try {
        const updatedOrder = await uploadDepositTransferProof({
            order: activeBankDepositOrder,
            phone: activeBankDepositPhone,
            file: selectedDepositProofFile
        });

        activeBankDepositOrder = {
            ...activeBankDepositOrder,
            ...updatedOrder
        };
        resetDepositProofSelection();
        updateDepositWaitingOrder(activeBankDepositOrder);
        syncStoredDepositOrder(activeBankDepositOrder, activeBankDepositPhone);
        renderLookupResult(activeBankDepositOrder, activeBankDepositPhone);
        setDepositProofFeedback('Đã tải chứng từ. Nhân viên OkXe sẽ đối chiếu và xác nhận.', 'success');
    } catch (error) {
        setDepositProofFeedback(error.message || 'Không thể tải chứng từ chuyển khoản.', 'error');
    } finally {
        setDepositProofUploadLoading(false);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && depositSuccessModal?.classList.contains('is-open')) {
        closeDepositSuccessModal();
    }

    if (event.key === 'Escape' && depositWaitingModal?.classList.contains('is-open')) {
        closeDepositWaitingModal();
    }
});

const handleVnpayReturnFromUrl = async () => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('vnpayReturn') !== '1') {
        return false;
    }

    const orderId = Number(params.get('orderId') || 0);
    const orderCode = String(params.get('orderCode') || (orderId ? `DC-${String(orderId).padStart(6, '0')}` : '')).trim();
    const vnpayStatus = String(params.get('vnpayStatus') || '').trim().toLowerCase();
    const returnMessage = String(params.get('message') || '').trim();
    const storedOrder = getPendingDepositOrder();
    const phone = String(storedOrder?.phone || '').trim();

    if (depositLookupCodeInput && orderCode) {
        depositLookupCodeInput.value = orderCode;
    }

    if (depositLookupPhoneInput && phone) {
        depositLookupPhoneInput.value = phone;
    }

    if (!orderId || !phone) {
        setFeedback(
            returnMessage || 'VNPay đã trả kết quả. Vui lòng mở mục Quản lý đặt cọc trong tài khoản để xem trạng thái đơn.',
            vnpayStatus === 'success' ? 'success' : 'error'
        );
        return true;
    }

    try {
        const latestOrder = await fetchDepositOrderStatus({
            orderId,
            orderCode,
            phone
        });
        const latestStatus = String(latestOrder.status || '').trim().toLowerCase();

        renderLookupResult(latestOrder, phone);
        syncStoredDepositOrder(latestOrder, phone);

        if (latestStatus === 'confirmed' || latestStatus === 'completed') {
            openDepositSuccessModal({
                orderCode: latestOrder.code || orderCode,
                carName: getOrderDisplayName(latestOrder),
                depositAmount: latestOrder.depositAmount,
                message: latestOrder.statusNote || returnMessage || 'OkXe đã xác nhận nhận tiền đặt cọc qua VNPay.',
                order: latestOrder,
                phone
            });
            setFeedback(returnMessage || 'Thanh toán VNPay thành công. Đơn đặt cọc đã được xác nhận.', 'success');
            return true;
        }

        if (latestStatus === 'pending') {
            openDepositWaitingModal({
                order: latestOrder,
                phone
            });
            setDepositWaitingState('pending', returnMessage || 'Thanh toán VNPay chưa được xác nhận. Vui lòng kiểm tra lại sau ít phút hoặc liên hệ OkXe.');
            startDepositStatusPolling();
            setFeedback(returnMessage || 'Đơn vẫn đang chờ kết quả thanh toán VNPay.', vnpayStatus === 'failed' ? 'error' : 'success');
            return true;
        }

        if (latestStatus === 'cancelled') {
            setDepositWaitingState('cancelled', latestOrder.statusNote || returnMessage);
            setFeedback(
                returnMessage || 'Thanh toán VNPay không thành công. Đơn đặt cọc đã bị hủy, vui lòng tạo đơn mới để thanh toán lại.',
                'error'
            );
            setLookupFeedback('Đơn VNPay đã bị hủy sau khi thanh toán không thành công. Bạn cần tạo đơn đặt cọc mới nếu vẫn muốn giữ xe.', 'error');
            return true;
        }

        setFeedback(
            returnMessage || 'Đã cập nhật trạng thái đơn đặt cọc sau khi quay về từ VNPay.',
            ['failed', 'cancelled', 'invalid', 'invalid_amount', 'invalid_status'].includes(vnpayStatus) ? 'error' : 'success'
        );
        return true;
    } catch (error) {
        setFeedback(error.message || returnMessage || 'Không thể kiểm tra kết quả VNPay lúc này.', 'error');
        return true;
    }
};

const restorePendingDepositOrder = async () => {
    const storedOrder = getPendingDepositOrder();

    if (!storedOrder) {
        return;
    }

    try {
        const latestOrder = await fetchDepositOrderStatus({
            orderId: storedOrder.id,
            orderCode: storedOrder.code,
            phone: storedOrder.phone
        });
        const restoredOrder = {
            ...storedOrder,
            ...latestOrder
        };
        const restoredStatus = String(restoredOrder.status || '').trim().toLowerCase();

        renderLookupResult(restoredOrder, storedOrder.phone);
        syncStoredDepositOrder(restoredOrder, storedOrder.phone);

        if (restoredStatus === 'pending') {
            openDepositWaitingModal({
                order: restoredOrder,
                phone: storedOrder.phone
            });
            startDepositStatusPolling();
            setFeedback(`Đã khôi phục màn hình chờ cho mã đơn ${restoredOrder.code || storedOrder.code}.`, 'success');
        } else if (restoredStatus === 'confirmed' || restoredStatus === 'completed') {
            openDepositSuccessModal({
                orderCode: restoredOrder.code || storedOrder.code,
                carName: getOrderDisplayName(restoredOrder),
                depositAmount: restoredOrder.depositAmount,
                message: restoredOrder.statusNote
                    || (restoredStatus === 'completed'
                        ? `OkXe đã hoàn tất giao dịch mua xe từ mã đơn ${restoredOrder.code || storedOrder.code}.`
                        : `OkXe đã xác nhận nhận tiền đặt cọc cho mã đơn ${restoredOrder.code || storedOrder.code}.`),
                order: restoredOrder,
                phone: storedOrder.phone
            });
        } else if (restoredStatus === 'cancelled_after_deposit') {
            setLookupFeedback('Giao dịch sau đặt cọc lưu trước đó đã bị hủy.', 'error');
        } else if (restoredStatus === 'cancelled') {
            setLookupFeedback('Đơn đặt cọc lưu trước đó đã bị hủy.', 'error');
        } else if (restoredStatus === 'expired') {
            setLookupFeedback('Đơn đặt cọc lưu trước đó đã quá hạn giữ chỗ.', 'error');
        }
    } catch (error) {
        clearPendingDepositOrder();
    }
};

setActivePaymentMethod('bank');
renderDepositStatusGuideList();
renderDepositPaymentConfig();
setSubmitLoading(false);
updateDepositTotals();
updateBankTransferNote();
loadDepositPaymentConfig();
loadSelectedCar();
fillCurrentUserProfile();
handleVnpayReturnFromUrl().then((handled) => {
    if (!handled) {
        restorePendingDepositOrder();
    }
});
