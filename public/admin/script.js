const carForm = document.querySelector('#car-form');
const carIdInput = document.querySelector('#car-id');
const formTitle = document.querySelector('#form-title');
const submitButton = document.querySelector('#submit-button');
const resetFormButton = document.querySelector('#reset-form-button');
const feedbackElement = document.querySelector('#admin-feedback');
const searchInput = document.querySelector('#car-search');
const refreshListButton = document.querySelector('#refresh-list-button');
const carTableBody = document.querySelector('#car-table-body');
const carResultSummary = document.querySelector('#car-result-summary');
const editorPanel = document.querySelector('#editor-panel');
const openFormButton = document.querySelector('#open-form-button');
const closeFormButton = document.querySelector('#close-form-button');
const toastStack = document.querySelector('#toast-stack');
const chooseImagesButton = document.querySelector('#choose-images-button');
const carImagesInput = document.querySelector('#car-images-input');
const imagePreviewList = document.querySelector('#image-preview-list');
const adminNavLinks = document.querySelectorAll('[data-admin-nav]');
const adminViews = document.querySelectorAll('[data-admin-view]');
const adminOnlyElements = document.querySelectorAll('[data-requires-admin]');
const adminLogoutButton = document.querySelector('#admin-logout-button');
const adminCurrentAccount = document.querySelector('#admin-current-account');
const adminCurrentAccountAvatar = document.querySelector('#admin-current-account-avatar');
const adminCurrentAccountName = document.querySelector('#admin-current-account-name');
const adminCurrentAccountEmail = document.querySelector('#admin-current-account-email');
const adminCurrentAccountRole = document.querySelector('#admin-current-account-role');
const adminNotificationButton = document.querySelector('#admin-notification-button');
const adminNotificationBadge = document.querySelector('#admin-notification-badge');
const adminNotificationNewLabel = document.querySelector('#admin-notification-new-label');
const adminNotificationStatus = document.querySelector('#admin-notification-status');
const adminNotificationPanel = document.querySelector('#admin-notification-panel');
const adminNotificationList = document.querySelector('#admin-notification-list');
const adminNotificationCloseButtons = document.querySelectorAll('[data-close-admin-notifications]');

const employeeForm = document.querySelector('#employee-form');
const employeeFormCard = document.querySelector('#employee-form-card');
const employeeIdInput = document.querySelector('#employee-id');
const employeeViewEyebrow = document.querySelector('#employee-view-eyebrow');
const employeeViewTitle = document.querySelector('#employee-view-title');
const employeeViewDescription = document.querySelector('#employee-view-description');
const employeeFormEyebrow = document.querySelector('#employee-form-eyebrow');
const employeeFormTitle = document.querySelector('#employee-form-title');
const employeeListEyebrow = document.querySelector('#employee-list-eyebrow');
const employeeListTitle = document.querySelector('#employee-list-title');
const employeeSubmitButton = document.querySelector('#employee-submit-button');
const employeeRefreshButton = document.querySelector('#employee-refresh-button');
const employeeResetButton = document.querySelector('#employee-reset-button');
const employeeFeedback = document.querySelector('#employee-feedback');
const employeeSearchInput = document.querySelector('#employee-search');
const employeeTableBody = document.querySelector('#employee-table-body');
const chooseEmployeeAvatarButton = document.querySelector('#choose-employee-avatar-button');
const employeeAvatarInput = document.querySelector('#employee-avatar-input');
const employeeAvatarPreview = document.querySelector('#employee-avatar-preview');
const employeeAvatarFileName = document.querySelector('#employee-avatar-file-name');
const accountFieldElements = document.querySelectorAll('[data-account-field]');
const customerDetailPanel = document.querySelector('#customer-detail-panel');
const customerDetailEyebrow = document.querySelector('#customer-detail-eyebrow');
const customerDetailTitle = document.querySelector('#customer-detail-title');
const customerDetailBody = document.querySelector('#customer-detail-body');
const customerDetailCloseButtons = document.querySelectorAll('[data-close-customer-detail]');
const promotionForm = document.querySelector('#promotion-form');
const promotionIdInput = document.querySelector('#promotion-id');
const promotionFormTitle = document.querySelector('#promotion-form-title');
const promotionSubmitButton = document.querySelector('#promotion-submit-button');
const promotionResetButton = document.querySelector('#promotion-reset-button');
const promotionRefreshButton = document.querySelector('#promotion-refresh-button');
const promotionFeedback = document.querySelector('#promotion-feedback');
const promotionSearchInput = document.querySelector('#promotion-search');
const promotionTableBody = document.querySelector('#promotion-table-body');
const choosePromotionImageButton = document.querySelector('#choose-promotion-image-button');
const promotionImageInput = document.querySelector('#promotion-image-input');
const promotionImagePreview = document.querySelector('#promotion-image-preview');
const promotionImageFileName = document.querySelector('#promotion-image-file-name');
const promotionCropPanel = document.querySelector('#promotion-crop-panel');
const promotionCropCanvas = document.querySelector('#promotion-crop-canvas');
const promotionCropZoomInput = document.querySelector('#promotion-crop-zoom');
const promotionCropXInput = document.querySelector('#promotion-crop-x');
const promotionCropYInput = document.querySelector('#promotion-crop-y');
const promotionCropFileName = document.querySelector('#promotion-crop-file-name');
const promotionCropApplyButton = document.querySelector('#promotion-crop-apply-button');
const promotionCropFeedback = document.querySelector('#promotion-crop-feedback');
const promotionCropCloseButtons = document.querySelectorAll('[data-close-promotion-crop]');
const blogPostForm = document.querySelector('#blog-post-form');
const blogPostIdInput = document.querySelector('#blog-post-id');
const blogPostFormTitle = document.querySelector('#blog-post-form-title');
const blogPostSubmitButton = document.querySelector('#blog-post-submit-button');
const blogPostResetButton = document.querySelector('#blog-post-reset-button');
const blogPostRefreshButton = document.querySelector('#blog-post-refresh-button');
const blogPostFeedback = document.querySelector('#blog-post-feedback');
const blogPostSearchInput = document.querySelector('#blog-post-search');
const blogPostTableBody = document.querySelector('#blog-post-table-body');
const blogPostStatTotal = document.querySelector('#blog-stat-total');
const blogPostStatPublished = document.querySelector('#blog-stat-published');
const blogPostStatFeatured = document.querySelector('#blog-stat-featured');
const blogPostStatHome = document.querySelector('#blog-stat-home');
const blogPostStatDraft = document.querySelector('#blog-stat-draft');
const chooseBlogPostImageButton = document.querySelector('#choose-blog-post-image-button');
const blogPostImageInput = document.querySelector('#blog-post-image-input');
const blogPostImagePreview = document.querySelector('#blog-post-image-preview');
const blogPostImageFileName = document.querySelector('#blog-post-image-file-name');
const blogPostCropPanel = document.querySelector('#blog-post-crop-panel');
const blogPostCropCanvas = document.querySelector('#blog-post-crop-canvas');
const blogPostCropZoomInput = document.querySelector('#blog-post-crop-zoom');
const blogPostCropXInput = document.querySelector('#blog-post-crop-x');
const blogPostCropYInput = document.querySelector('#blog-post-crop-y');
const blogPostCropFileName = document.querySelector('#blog-post-crop-file-name');
const blogPostCropApplyButton = document.querySelector('#blog-post-crop-apply-button');
const blogPostCropFeedback = document.querySelector('#blog-post-crop-feedback');
const blogPostCropCloseButtons = document.querySelectorAll('[data-close-blog-post-crop]');
const insertBlogContentImageButton = document.querySelector('#insert-blog-content-image-button');
const blogContentImageInput = document.querySelector('#blog-content-image-input');
const testDriveSearchInput = document.querySelector('#test-drive-search');
const testDriveRefreshButton = document.querySelector('#test-drive-refresh-button');
const testDriveTableBody = document.querySelector('#test-drive-table-body');
const testDriveProcessedTableBody = document.querySelector('#test-drive-processed-table-body');
const testDriveFeedback = document.querySelector('#test-drive-feedback');
const testDriveStatsChart = document.querySelector('#test-drive-stats-chart');
const testDriveStatTotal = document.querySelector('#test-drive-stat-total');
const testDriveStatApproved = document.querySelector('#test-drive-stat-approved');
const testDriveStatCancelled = document.querySelector('#test-drive-stat-cancelled');
const testDriveStatPending = document.querySelector('#test-drive-stat-pending');
const testDriveStatusPanel = document.querySelector('#test-drive-status-panel');
const testDriveStatusTitle = document.querySelector('#test-drive-status-title');
const testDriveStatusSummary = document.querySelector('#test-drive-status-summary');
const testDriveStatusNote = document.querySelector('#test-drive-status-note');
const testDriveRescheduleFields = document.querySelector('#test-drive-reschedule-fields');
const testDriveNewDateInput = document.querySelector('#test-drive-new-date');
const testDriveNewTimeSlotInput = document.querySelector('#test-drive-new-time-slot');
const testDriveStatusSaveButton = document.querySelector('#test-drive-status-save-button');
const testDriveStatusFeedback = document.querySelector('#test-drive-status-feedback');
const testDriveStatusCloseButtons = document.querySelectorAll('[data-close-test-drive-status]');
const testDriveStatusOptionButtons = document.querySelectorAll('[data-status-option]');
const consultationSearchInput = document.querySelector('#consultation-search');
const consultationStatusFilter = document.querySelector('#consultation-status-filter');
const consultationRefreshButton = document.querySelector('#consultation-refresh-button');
const consultationTableBody = document.querySelector('#consultation-table-body');
const consultationFeedback = document.querySelector('#consultation-feedback');
const consultationStatNew = document.querySelector('#consultation-stat-new');
const consultationStatContacted = document.querySelector('#consultation-stat-contacted');
const consultationStatAppointment = document.querySelector('#consultation-stat-appointment');
const consultationStatClosed = document.querySelector('#consultation-stat-closed');
const consultationStatFailed = document.querySelector('#consultation-stat-failed');
const consultationStatusPanel = document.querySelector('#consultation-status-panel');
const consultationStatusTitle = document.querySelector('#consultation-status-title');
const consultationStatusSummary = document.querySelector('#consultation-status-summary');
const consultationStatusSelect = document.querySelector('#consultation-status-select');
const consultationStatusNote = document.querySelector('#consultation-status-note');
const consultationStatusSaveButton = document.querySelector('#consultation-status-save-button');
const consultationStatusFeedback = document.querySelector('#consultation-status-feedback');
const consultationStatusCloseButtons = document.querySelectorAll('[data-close-consultation-status]');
const depositOrderSearchInput = document.querySelector('#deposit-order-search');
const depositOrderStatusFilter = document.querySelector('#deposit-order-status-filter');
const depositOrderRefreshButton = document.querySelector('#deposit-order-refresh-button');
const depositOrderTableBody = document.querySelector('#deposit-order-table-body');
const depositOrderFeedback = document.querySelector('#deposit-order-feedback');
const depositOrderStatPending = document.querySelector('#deposit-order-stat-pending');
const depositOrderStatConfirmed = document.querySelector('#deposit-order-stat-confirmed');
const depositOrderStatCancelled = document.querySelector('#deposit-order-stat-cancelled');
const depositOrderStatExpired = document.querySelector('#deposit-order-stat-expired');
const depositOrderStatTotal = document.querySelector('#deposit-order-stat-total');
const depositReportExportButton = document.querySelector('#deposit-report-export-button');
const depositAuditExportButton = document.querySelector('#deposit-audit-export-button');
const depositReportReceivedAmount = document.querySelector('#deposit-report-received-amount');
const depositReportRefundAmount = document.querySelector('#deposit-report-refund-amount');
const depositReportNetAmount = document.querySelector('#deposit-report-net-amount');
const depositReportCompletedCount = document.querySelector('#deposit-report-completed-count');
const depositReportPendingCount = document.querySelector('#deposit-report-pending-count');
const depositReportMissingProofCount = document.querySelector('#deposit-report-missing-proof-count');
const depositReportDueSoonCount = document.querySelector('#deposit-report-due-soon-count');
const depositReportRemindedCount = document.querySelector('#deposit-report-reminded-count');
const depositReportReconciliationCount = document.querySelector('#deposit-report-reconciliation-count');
const depositConfigForm = document.querySelector('#deposit-config-form');
const depositConfigReloadButton = document.querySelector('#deposit-config-reload-button');
const depositConfigResetButton = document.querySelector('#deposit-config-reset-button');
const depositConfigSaveButton = document.querySelector('#deposit-config-save-button');
const depositConfigFeedback = document.querySelector('#deposit-config-feedback');
const depositConfigSummary = document.querySelector('#deposit-config-summary');
const depositOrderStatusPanel = document.querySelector('#deposit-order-status-panel');
const depositOrderStatusTitle = document.querySelector('#deposit-order-status-title');
const depositOrderStatusSummary = document.querySelector('#deposit-order-status-summary');
const depositOrderStatusSelect = document.querySelector('#deposit-order-status-select');
const depositOrderStatusNote = document.querySelector('#deposit-order-status-note');
const depositOrderProofPreview = document.querySelector('#deposit-order-proof-preview');
const depositOrderConfirmationFields = document.querySelector('#deposit-order-confirmation-fields');
const depositOrderPaymentReferenceInput = document.querySelector('#deposit-order-payment-reference');
const depositOrderPaymentReceivedAtInput = document.querySelector('#deposit-order-payment-received-at');
const depositOrderPaymentConfirmationNoteInput = document.querySelector('#deposit-order-payment-confirmation-note');
const depositOrderRefundFields = document.querySelector('#deposit-order-refund-fields');
const depositOrderRefundAmountInput = document.querySelector('#deposit-order-refund-amount');
const depositOrderRefundReferenceInput = document.querySelector('#deposit-order-refund-reference');
const depositOrderRefundCompletedAtInput = document.querySelector('#deposit-order-refund-completed-at');
const depositOrderRefundNoteInput = document.querySelector('#deposit-order-refund-note');
const depositOrderStatusSaveButton = document.querySelector('#deposit-order-status-save-button');
const depositOrderStatusFeedback = document.querySelector('#deposit-order-status-feedback');
const depositOrderStatusCloseButtons = document.querySelectorAll('[data-close-deposit-order-status]');
const carBuyRequestSearchInput = document.querySelector('#car-buy-request-search');
const carBuyRequestStatusFilter = document.querySelector('#car-buy-request-status-filter');
const carBuyRequestRefreshButton = document.querySelector('#car-buy-request-refresh-button');
const carBuyRequestTableBody = document.querySelector('#car-buy-request-table-body');
const carBuyRequestFeedback = document.querySelector('#car-buy-request-feedback');
const carBuyRequestStatPending = document.querySelector('#car-buy-request-stat-pending');
const carBuyRequestStatApproved = document.querySelector('#car-buy-request-stat-approved');
const carBuyRequestStatRejected = document.querySelector('#car-buy-request-stat-rejected');
const carBuyRequestStatTotal = document.querySelector('#car-buy-request-stat-total');
const carBuyRequestStatOffers = document.querySelector('#car-buy-request-stat-offers');
const carBuyRequestStatusPanel = document.querySelector('#car-buy-request-status-panel');
const carBuyRequestStatusTitle = document.querySelector('#car-buy-request-status-title');
const carBuyRequestStatusSummary = document.querySelector('#car-buy-request-status-summary');
const carBuyRequestStatusSelect = document.querySelector('#car-buy-request-status-select');
const carBuyRequestStatusNote = document.querySelector('#car-buy-request-status-note');
const carBuyRequestStatusSaveButton = document.querySelector('#car-buy-request-status-save-button');
const carBuyRequestStatusFeedback = document.querySelector('#car-buy-request-status-feedback');
const carBuyRequestStatusCloseButtons = document.querySelectorAll('[data-close-car-buy-request-status]');
const carSellRequestSearchInput = document.querySelector('#car-sell-request-search');
const carSellRequestStatusFilter = document.querySelector('#car-sell-request-status-filter');
const carSellRequestRefreshButton = document.querySelector('#car-sell-request-refresh-button');
const carSellRequestTableBody = document.querySelector('#car-sell-request-table-body');
const carSellRequestFeedback = document.querySelector('#car-sell-request-feedback');
const carSellRequestStatPending = document.querySelector('#car-sell-request-stat-pending');
const carSellRequestStatApproved = document.querySelector('#car-sell-request-stat-approved');
const carSellRequestStatTotal = document.querySelector('#car-sell-request-stat-total');
const carSellRequestStatusPanel = document.querySelector('#car-sell-request-status-panel');
const carSellRequestStatusTitle = document.querySelector('#car-sell-request-status-title');
const carSellRequestStatusSummary = document.querySelector('#car-sell-request-status-summary');
const carSellRequestStatusSelect = document.querySelector('#car-sell-request-status-select');
const carSellRequestStatusNote = document.querySelector('#car-sell-request-status-note');
const carSellRequestFinalPriceFields = document.querySelector('#car-sell-final-price-fields');
const carSellRequestCustomerDealPriceTextInput = document.querySelector('#car-sell-request-customer-deal-price-text');
const carSellRequestCustomerDealPriceValueInput = document.querySelector('#car-sell-request-customer-deal-price-value');
const carSellRequestFinalPriceTextInput = document.querySelector('#car-sell-request-final-price-text');
const carSellRequestFinalPriceValueInput = document.querySelector('#car-sell-request-final-price-value');
const carSellRequestStatusSaveButton = document.querySelector('#car-sell-request-status-save-button');
const carSellRequestStatusFeedback = document.querySelector('#car-sell-request-status-feedback');
const carSellRequestStatusCloseButtons = document.querySelectorAll('[data-close-car-sell-request-status]');
const salesKpiForm = document.querySelector('#sales-kpi-form');
const salesKpiTypeInput = document.querySelector('#sales-kpi-type');
const salesKpiSourceInput = document.querySelector('#sales-kpi-source');
const salesKpiSelectionPreview = document.querySelector('#sales-kpi-selection-preview');
const salesKpiSaleInput = document.querySelector('#sales-kpi-sale');
const salesKpiRewardInput = document.querySelector('#sales-kpi-reward');
const salesKpiRewardStatusInput = document.querySelector('#sales-kpi-reward-status');
const salesKpiNoteInput = document.querySelector('#sales-kpi-note');
const salesKpiSaveButton = document.querySelector('#sales-kpi-save-button');
const salesKpiRefreshButton = document.querySelector('#sales-kpi-refresh-button');
const salesKpiFeedback = document.querySelector('#sales-kpi-feedback');
const salesKpiTableBody = document.querySelector('#sales-kpi-table-body');
const salesKpiStatTotal = document.querySelector('#sales-kpi-stat-total');
const salesKpiStatAcquisition = document.querySelector('#sales-kpi-stat-acquisition');
const salesKpiStatSales = document.querySelector('#sales-kpi-stat-sales');
const salesKpiStatSalesValue = document.querySelector('#sales-kpi-stat-sales-value');
const salesKpiStatReward = document.querySelector('#sales-kpi-stat-reward');

const totalCarsElement = document.querySelector('#stat-total-cars');
const totalCarsDetailElement = document.querySelector('#stat-total-cars-detail');
const availableCarsElement = document.querySelector('#stat-available-cars');
const availableCarsDetailElement = document.querySelector('#stat-available-cars-detail');
const inventoryValueElement = document.querySelector('#stat-inventory-value');
const inventoryValueDetailElement = document.querySelector('#stat-inventory-value-detail');
const incompleteCarsElement = document.querySelector('#stat-incomplete-cars');
const incompleteCarsDetailElement = document.querySelector('#stat-incomplete-cars-detail');

let cars = [];
let employees = [];
let promotions = [];
let blogPosts = [];
let blogPostStats = {
    total: 0,
    published: 0,
    featured: 0,
    homeVisible: 0,
    draft: 0
};
let testDriveAppointments = [];
let consultationRequests = [];
let depositOrders = [];
let depositPaymentConfig = null;
let carBuyRequests = [];
let carSellRequests = [];
let salesKpiRecords = [];
let salesKpiSources = { acquisitions: [], sales: [] };
let salesKpiEmployees = [];
let salesKpiStats = {};
let editingSalesKpiRecordId = null;
let adminNotifications = [];
let currentAdminUser = null;
let editingEmployeeId = null;
let editingPromotionId = null;
let editingBlogPostId = null;
let activeAccountView = 'staff';
let selectedCarImages = [];
let toastId = 0;
let adminNotificationRefreshTimer = null;
let modalCloseTimer = null;
let customerDetailCloseTimer = null;
let testDriveStatusCloseTimer = null;
let consultationStatusCloseTimer = null;
let depositOrderStatusCloseTimer = null;
let carBuyRequestStatusCloseTimer = null;
let carSellRequestStatusCloseTimer = null;
let promotionCropCloseTimer = null;
let blogPostCropCloseTimer = null;
let activeTestDriveAppointmentId = null;
let activeTestDriveStatus = 'approved';
let activeConsultationRequestId = null;
let activeDepositOrderId = null;
let activeCarBuyRequestId = null;
let activeCarBuyRequestOriginalStatus = 'pending';
let activeCarBuyRequestOriginalRejectedNote = '';
let activeCarSellRequestId = null;
let promotionCropState = null;
let blogPostCropState = null;

const currencyFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});
const maxCarImages = 10;
const maxUploadedImageSize = 5 * 1024 * 1024;
const roleLabels = {
    admin: 'Admin',
    staff: 'Nhân viên',
    customer: 'Khách hàng'
};
const genderLabels = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác'
};
const accountViews = {
    customers: {
        role: 'customer',
        eyebrow: 'Khách hàng',
        title: 'Quản lý khách hàng',
        description: 'Theo dõi tài khoản khách hàng đã đăng ký, thông tin liên hệ, ảnh đại diện và địa chỉ khách đã cập nhật.',
        formEyebrow: 'Thông tin khách hàng',
        createTitle: 'Khách hàng',
        createLabel: 'khách hàng',
        listEyebrow: 'Danh sách khách hàng',
        listTitle: 'Khách hàng',
        emptyMessage: 'Chưa có tài khoản khách hàng phù hợp.',
        searchPlaceholder: 'Tìm khách hàng theo tên hoặc email',
        canCreate: false
    },
    staff: {
        role: 'staff',
        eyebrow: 'Nhân viên',
        title: 'Quản lý nhân viên',
        description: 'Tạo tài khoản nhân viên, chỉnh sửa thông tin, đổi quyền và xóa tài khoản không còn sử dụng.',
        formEyebrow: 'Tài khoản nhân viên',
        createTitle: 'Nhân viên mới',
        createLabel: 'nhân viên',
        listEyebrow: 'Danh sách nhân viên',
        listTitle: 'Nhân viên',
        emptyMessage: 'Chưa có tài khoản nhân viên phù hợp.',
        searchPlaceholder: 'Tìm nhân viên theo tên hoặc email',
        canCreate: true
    },
    admins: {
        role: 'admin',
        eyebrow: 'Admin',
        title: 'Quản lý admin',
        description: 'Tạo tài khoản admin, chỉnh sửa thông tin, đổi quyền và bảo vệ hệ thống luôn còn ít nhất một admin.',
        formEyebrow: 'Tài khoản admin',
        createTitle: 'Admin mới',
        createLabel: 'admin',
        listEyebrow: 'Danh sách admin',
        listTitle: 'Admin',
        emptyMessage: 'Chưa có tài khoản admin phù hợp.',
        searchPlaceholder: 'Tìm admin theo tên hoặc email',
        canCreate: true
    }
};
const testDriveStatusConfig = {
    approved: {
        label: 'Đồng ý cho phép lái thử',
        className: 'is-approved'
    },
    cancelled: {
        label: 'Hủy lịch hẹn',
        className: 'is-cancelled'
    },
    pending: {
        label: 'Chờ xác nhận',
        className: 'is-pending'
    }
};
const consultationStatusConfig = {
    new: {
        label: 'Mới',
        className: 'is-new'
    },
    contacted: {
        label: 'Đã liên hệ',
        className: 'is-contacted'
    },
    appointment: {
        label: 'Đã hẹn xem xe',
        className: 'is-appointment'
    },
    closed: {
        label: 'Đã chốt',
        className: 'is-closed'
    },
    failed: {
        label: 'Không thành công',
        className: 'is-failed'
    }
};
const consultationTypeLabels = {
    consultation: 'Tư vấn & báo giá',
    quote: 'Yêu cầu báo giá',
    deposit: 'Đặt cọc xe',
    financing: 'Tư vấn trả góp',
    rolling_cost: 'Chi phí lăn bánh',
    viewing: 'Đặt lịch xem xe',
    similar_car: 'Tư vấn xe tương tự'
};
const depositOrderStatusConfig = {
    pending: {
        label: 'Chờ xác nhận',
        className: 'is-pending'
    },
    confirmed: {
        label: 'Đã nhận tiền',
        className: 'is-approved'
    },
    completed: {
        label: 'Hoàn tất giao dịch',
        className: 'is-approved'
    },
    cancelled_after_deposit: {
        label: 'Hủy sau đặt cọc',
        className: 'is-rejected'
    },
    cancelled: {
        label: 'Đã hủy',
        className: 'is-rejected'
    },
    expired: {
        label: 'Quá hạn giữ chỗ',
        className: 'is-expired'
    }
};
const depositOrderStatusTransitions = {
    pending: ['confirmed', 'cancelled', 'expired'],
    confirmed: ['completed', 'cancelled_after_deposit'],
    completed: [],
    cancelled_after_deposit: [],
    cancelled: [],
    expired: []
};
const getAllowedDepositOrderStatusOptions = (status) => {
    const normalizedStatus = String(status || 'pending').trim().toLowerCase();
    const allowedNextStatuses = depositOrderStatusTransitions[normalizedStatus] || [];

    return new Set([normalizedStatus, ...allowedNextStatuses]);
};
let depositOrderPaymentMethodLabels = {
    bank: 'Chuyển khoản ngân hàng',
    vnpay: 'VNPay sandbox',
    wallet: 'Ví điện tử',
    card: 'Thẻ nội địa/quốc tế'
};
const carBuyRequestStatusConfig = {
    pending: {
        label: 'Chờ duyệt',
        className: 'is-pending'
    },
    approved: {
        label: 'Đã duyệt',
        className: 'is-approved'
    },
    rejected: {
        label: 'Từ chối',
        className: 'is-rejected'
    }
};
const carBuyRequestOfferStatusConfig = {
    new: {
        label: 'Mới',
        className: 'is-new'
    },
    contacted: {
        label: 'Đã liên hệ',
        className: 'is-contacted'
    },
    matched: {
        label: 'Đã kết nối',
        className: 'is-matched'
    },
    rejected: {
        label: 'Từ chối',
        className: 'is-rejected'
    }
};
const carBuyRequestOfferContactPreferenceLabels = {
    okxe_first: 'OkXe liên hệ trước',
    direct_allowed: 'Cho khách mua liên hệ trực tiếp'
};
const carSellRequestStatusConfig = {
    pending: {
        label: 'Chờ duyệt',
        className: 'is-pending'
    },
    approved: {
        label: 'Đã nhập kho',
        className: 'is-approved'
    },
    rejected: {
        label: 'Từ chối',
        className: 'is-rejected'
    }
};
let carBuyRequestBudgetLabels = {
    'under-200': 'Dưới 200 Triệu',
    '200-400': '200-400 Triệu',
    '400-600': '400-600 Triệu',
    '600-800': '600-800 Triệu',
    '800-1000': '800-1 Tỉ',
    'over-1000': 'Trên 1 Tỉ'
};

const carSelectOptions = {
    category: ['Sedan', 'SUV', 'Thể thao'],
    type: ['Tự động', 'Số sàn'],
    fuel: ['Xăng', 'Diesel', 'Hybrid', 'Điện'],
    seats: ['4 chỗ', '5 chỗ', '7 chỗ', '9 chỗ'],
    gearbox: ['Số Sàn', 'Tự động'],
    drivetrain: ['FWD - Dẫn động cầu trước', 'RWD - Dẫn động cầu sau', 'Dẫn động 4 bánh'],
    origin: ['Nhập khẩu', 'Trong nước'],
    condition: ['Xe mới', 'Xe cũ'],
    actionText: ['Còn xe', 'Đang giữ chỗ', 'Xe đã bán']
};
const carSelectAliases = {
    type: {
        hybrid: 'Tự động',
        'số tự động': 'Tự động',
        san: 'Số sàn',
        'sàn': 'Số sàn'
    },
    fuel: {
        dau: 'Diesel',
        dầu: 'Diesel',
        dien: 'Điện'
    },
    gearbox: {
        'số sàn': 'Số Sàn',
        san: 'Số Sàn',
        'sàn': 'Số Sàn',
        'tự động / tay': 'Tự động',
        'số tự động': 'Tự động'
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
        'dan dong 4 banh': 'Dẫn động 4 bánh'
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
        'xe da ban': 'Xe đã bán'
    }
};
const carSelectDefaults = {
    actionText: 'Còn xe'
};

const normalizeOptionKey = (value) =>
    String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN');

const getCanonicalCarSelectValue = (fieldName, value) => {
    const normalizedValue = String(value || '').trim().replace(/\s+/g, ' ');

    if (!normalizedValue) {
        return carSelectDefaults[fieldName] || '';
    }

    const optionKey = normalizeOptionKey(normalizedValue);
    const matchedOption = carSelectOptions[fieldName]?.find(
        (option) => normalizeOptionKey(option) === optionKey
    );

    return matchedOption || carSelectAliases[fieldName]?.[optionKey] || normalizedValue;
};

const setCarFormValue = (fieldName, value) => {
    const formField = carForm?.elements[fieldName];

    if (!formField) {
        return;
    }

    const fieldValue = carSelectOptions[fieldName]
        ? getCanonicalCarSelectValue(fieldName, value)
        : value ?? '';

    formField.value = fieldValue;

    if (formField.tagName === 'SELECT' && formField.value !== fieldValue) {
        formField.value = carSelectDefaults[fieldName] || '';
    }
};

const isAccountView = (viewName) => Object.prototype.hasOwnProperty.call(accountViews, viewName);
const getActiveAccountConfig = () => accountViews[activeAccountView] || accountViews.staff;
const canViewAccountView = (viewName) =>
    viewName === 'customers' ? Boolean(currentAdminUser?.isAdmin) : isCurrentUserAdmin();
const getCreateAccountButtonHtml = () => {
    const config = getActiveAccountConfig();
    return `<i class="bx bx-user-plus"></i><span>Tạo ${config.createLabel}</span>`;
};

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[character]));

const escapeSelectorValue = (value) =>
    globalThis.CSS?.escape
        ? globalThis.CSS.escape(String(value ?? ''))
        : String(value ?? '').replace(/["\\]/g, '\\$&');

const normalizeSearchValue = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

const getDisplayCarTitle = (brand, name, fallback = 'Xe không còn trong kho') => {
    const normalizedBrand = String(brand || '').trim();
    const normalizedName = String(name || '').trim();

    if (!normalizedBrand) {
        return normalizedName || fallback;
    }

    if (!normalizedName) {
        return normalizedBrand;
    }

    return normalizeSearchValue(normalizedName).startsWith(normalizeSearchValue(normalizedBrand))
        ? normalizedName
        : `${normalizedBrand} ${normalizedName}`;
};

const getPhoneHref = (phone) => String(phone || '').replace(/[^\d+]/g, '');

const getMailHref = (email) => String(email || '').trim();

const getShortNotePreview = (note, maxLength = 64) => {
    const normalizedNote = String(note || '').replace(/\s+/g, ' ').trim();

    if (!normalizedNote) {
        return '';
    }

    return normalizedNote.length > maxLength
        ? `${normalizedNote.slice(0, Math.max(0, maxLength - 3)).trim()}...`
        : normalizedNote;
};

const formatCompactPrice = (value) => {
    const numericValue = Number(value || 0);

    if (numericValue >= 1000000000) {
        return `${(numericValue / 1000000000).toLocaleString('vi-VN', {
            maximumFractionDigits: 1
        })} tỷ VNĐ`;
    }

    if (numericValue >= 1000000) {
        return `${Math.round(numericValue / 1000000).toLocaleString('vi-VN')} triệu VNĐ`;
    }

    return `${currencyFormatter.format(numericValue)} VNĐ`;
};

const normalizeMoneyAmountInput = (value, fallback = 0) => {
    const numberValue = Number(String(value ?? '').replace(/[^\d]/g, ''));

    return Number.isFinite(numberValue) && numberValue > 0
        ? Math.trunc(numberValue)
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

const getDepositAmountOptionsText = (options = []) =>
    normalizeDepositAmountOptionsInput(options).join(', ');

const findDepositOrderByPaymentReference = (paymentReference = '', excludeOrderId = null) => {
    const normalizedReference = normalizeSearchValue(paymentReference);
    const normalizedExcludeId = String(excludeOrderId || '');

    if (!normalizedReference) {
        return null;
    }

    return depositOrders.find((order) =>
        String(order.id || '') !== normalizedExcludeId
        && normalizeSearchValue(order.paymentReference || '') === normalizedReference
    ) || null;
};

const escapeCsvValue = (value) => {
    const normalizedValue = String(value ?? '').replace(/\r?\n/g, ' ').trim();

    return /[",\n;]/.test(normalizedValue)
        ? `"${normalizedValue.replace(/"/g, '""')}"`
        : normalizedValue;
};

const downloadCsvFile = (fileName, rows = []) => {
    const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${csvContent}`], {
        type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const hasCarValue = (value) => String(value ?? '').trim().length > 0;

const getInventoryStatusType = (car) => {
    const normalizedStatus = normalizeSearchValue(car?.actionText || 'Còn xe');

    if (
        normalizedStatus.includes('dang giu')
        || normalizedStatus.includes('giu cho')
    ) {
        return 'held';
    }

    if (
        normalizedStatus.includes('da ban')
        || normalizedStatus.includes('het hang')
        || normalizedStatus.includes('het xe')
    ) {
        return 'sold';
    }

    return 'available';
};

const isAvailableCar = (car) => getInventoryStatusType(car) === 'available';
const isHeldCar = (car) => getInventoryStatusType(car) === 'held';

const getCarStatusMeta = (car) => {
    const statusType = getInventoryStatusType(car);

    if (statusType === 'available') {
        return {
            label: car?.actionText || 'Còn xe',
            className: 'is-available'
        };
    }

    if (statusType === 'held') {
        return {
            label: car?.actionText || 'Đang giữ chỗ',
            className: 'is-held'
        };
    }

    return {
        label: car?.actionText || 'Xe đã bán',
        className: 'is-sold'
    };
};

const formatInventoryDate = (value) => {
    if (!value) {
        return 'Chưa cập nhật';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : dateFormatter.format(date);
};

const getCarDataIssues = (car) => {
    const images = getCarImages(car);
    const issues = [];

    if (!images.length && !hasCarValue(car?.image)) {
        issues.push('Thiếu ảnh');
    }

    if (!hasCarValue(car?.description)) {
        issues.push('Thiếu mô tả');
    }

    if (!Number(car?.priceValue || 0) && !hasCarValue(car?.price)) {
        issues.push('Thiếu giá');
    }

    if (!Number(car?.year || 0)) {
        issues.push('Thiếu đời xe');
    }

    [
        ['brand', 'Thiếu hãng'],
        ['category', 'Thiếu phân khúc'],
        ['fuel', 'Thiếu nhiên liệu'],
        ['mileage', 'Thiếu số km'],
        ['seats', 'Thiếu số chỗ'],
        ['gearbox', 'Thiếu hộp số'],
        ['drivetrain', 'Thiếu dẫn động'],
        ['origin', 'Thiếu xuất xứ'],
        ['condition', 'Thiếu tình trạng'],
        ['color', 'Thiếu màu sắc'],
        ['actionText', 'Thiếu trạng thái']
    ].forEach(([fieldName, label]) => {
        if (!hasCarValue(car?.[fieldName])) {
            issues.push(label);
        }
    });

    return issues;
};

const requestJson = async (url, options = {}) => {
    const resolvedUrl = (() => {
        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        if (window.location.protocol === 'file:') {
            return `http://localhost:3000${url}`;
        }

        return url;
    })();

    const requestOptions = {
        method: options.method || 'GET',
        headers: { ...(options.headers || {}) }
    };

    if (options.body) {
        requestOptions.body = options.body;
        requestOptions.headers['Content-Type'] = 'application/json';
    }

    let response;

    try {
        response = await fetch(resolvedUrl, requestOptions);
    } catch (error) {
        throw new Error(
            'Không thể kết nối tới server. Hãy mở trang qua http://localhost:3000/admin hoặc chạy backend trước.'
        );
    }

    const data = await response.json().catch(() => ({}));

    return { response, data };
};

const adminNotificationViewMap = {
    'test-drive': 'test-drives',
    consultation: 'consultations',
    'deposit-order': 'deposit-orders',
    'car-buy-request': 'car-buy-requests',
    'car-buy-request-offer': 'car-buy-requests',
    'car-sell-request': 'car-sell-requests'
};

const adminNotificationConfig = {
    'test-drive': {
        meta: 'Lái thử',
        icon: 'bxs-calendar-check',
        footer: 'Cần kiểm tra và cập nhật trạng thái lịch hẹn.',
        actionText: 'Xem lịch hẹn'
    },
    consultation: {
        meta: 'Tư vấn',
        icon: 'bxs-phone-call',
        footer: 'Cần nhân viên liên hệ và cập nhật trạng thái.',
        actionText: 'Xem yêu cầu'
    },
    'deposit-order': {
        meta: 'Đặt cọc',
        icon: 'bxs-credit-card',
        footer: 'Cần kiểm tra giao dịch và xác nhận giữ xe cho khách.',
        actionText: 'Xem đơn cọc'
    },
    'car-buy-request': {
        meta: 'Tin mua xe',
        icon: 'bxs-message-square-edit',
        footer: 'Cần duyệt hoặc từ chối trước khi hiển thị công khai.',
        actionText: 'Xem tin mua'
    },
    'car-buy-request-offer': {
        meta: 'Xe phù hợp',
        icon: 'bxs-car',
        footer: 'Cần kiểm tra đề xuất trước khi kết nối hai bên.',
        actionText: 'Xem đề xuất'
    },
    'car-sell-request': {
        meta: 'Đăng bán xe',
        icon: 'bxs-car-garage',
        footer: 'Cần kiểm tra thông tin xe trước khi duyệt nhập kho.',
        actionText: 'Xem bài đăng'
    },
    default: {
        meta: 'Thông báo',
        icon: 'bxs-bell',
        footer: 'Cần kiểm tra trong trang quản trị.',
        actionText: 'Xem xử lý'
    }
};

const getAdminNotificationType = (notification = {}) =>
    String(notification.type || notification.entityType || '').trim();

const getAdminNotificationConfig = (notification = {}) => {
    const type = getAdminNotificationType(notification);

    return adminNotificationConfig[type] || adminNotificationConfig.default;
};

const formatAdminNotificationDate = (value, fallback = 'Vừa cập nhật') => {
    const date = new Date(value || '');

    return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};

const getAdminNotificationItems = () =>
    [...adminNotifications]
        .filter((notification) => !notification.deletedAt)
        .sort((first, second) => {
            const firstTime = new Date(first.createdAt || 0).getTime();
            const secondTime = new Date(second.createdAt || 0).getTime();

            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
        });

const updateAdminNotificationBadge = () => {
    if (!adminNotificationBadge || !adminNotificationButton) {
        return;
    }

    const unreadCount = getAdminNotificationItems()
        .filter((notification) => !notification.isRead)
        .length;
    const hasUnreadNotifications = unreadCount > 0;

    adminNotificationBadge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
    adminNotificationBadge.hidden = !hasUnreadNotifications;
    adminNotificationButton.classList.toggle('has-unread', hasUnreadNotifications);
    adminNotificationButton.setAttribute(
        'aria-label',
        hasUnreadNotifications
            ? `Thông báo Admin: có ${unreadCount} phát sinh mới từ khách hàng`
            : 'Thông báo Admin: chưa có phát sinh mới từ khách hàng'
    );

    if (adminNotificationNewLabel) {
        adminNotificationNewLabel.hidden = !hasUnreadNotifications;
    }

    if (adminNotificationStatus) {
        adminNotificationStatus.textContent = hasUnreadNotifications
            ? `Có ${unreadCount > 9 ? '9+' : unreadCount} phát sinh mới từ khách hàng`
            : 'Phát sinh từ khách hàng';
    }
};

const renderAdminNotifications = () => {
    if (!adminNotificationList) {
        updateAdminNotificationBadge();
        return;
    }

    const notifications = getAdminNotificationItems();
    updateAdminNotificationBadge();

    if (!notifications.length) {
        adminNotificationList.innerHTML = `
            <article class="admin-notification-empty">
                <i class="bx bx-bell-off" aria-hidden="true"></i>
                <strong>Chưa có thông báo mới</strong>
                <p>Các yêu cầu mới từ khách hàng sẽ hiển thị tại đây.</p>
            </article>
        `;
        return;
    }

    adminNotificationList.innerHTML = notifications.map((notification) => {
        const config = getAdminNotificationConfig(notification);
        const type = getAdminNotificationType(notification);
        const viewName = adminNotificationViewMap[type] || 'cars';
        const title = notification.title || 'Thông báo mới từ khách hàng';
        const message = notification.message || 'Có phát sinh mới cần kiểm tra trong trang quản trị.';
        const createdText = formatAdminNotificationDate(notification.createdAt || notification.updatedAt);

        return `
            <article class="admin-notification-item${notification.isRead ? '' : ' is-unread'}">
                <button type="button" class="admin-notification-item__delete" data-delete-admin-notification="${escapeHtml(String(notification.id || ''))}" aria-label="Xóa thông báo ${escapeHtml(title)}">
                    <i class="bx bx-x" aria-hidden="true"></i>
                </button>
                <span class="admin-notification-item__icon">
                    <i class="bx ${escapeHtml(config.icon)}" aria-hidden="true"></i>
                </span>
                <div class="admin-notification-item__body">
                    <div class="admin-notification-item__meta">
                        <span>${escapeHtml(config.meta)}</span>
                        <small>${escapeHtml(createdText)}</small>
                    </div>
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(message)}</p>
                    <div class="admin-notification-item__footer">
                        <small>${escapeHtml(config.footer)}</small>
                        <button type="button" class="admin-notification-item__action" data-open-admin-notification-view="${escapeHtml(viewName)}" data-open-admin-notification-type="${escapeHtml(type)}" data-open-admin-notification-entity-id="${escapeHtml(String(notification.entityId || ''))}">
                            <span>${escapeHtml(config.actionText)}</span>
                            <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
};

const loadAdminNotifications = async () => {
    try {
        const { response, data } = await requestJson('/api/admin/notifications');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải thông báo admin.');
        }

        adminNotifications = Array.isArray(data.notifications) ? data.notifications : [];
    } catch (error) {
        adminNotifications = [];
    }

    renderAdminNotifications();
};

const markAdminNotificationsRead = async () => {
    const hasUnreadNotifications = adminNotifications.some((notification) => !notification.isRead);

    if (!hasUnreadNotifications) {
        return;
    }

    try {
        const { response } = await requestJson('/api/admin/notifications/read', { method: 'PATCH' });

        if (!response.ok) {
            return;
        }

        adminNotifications = adminNotifications.map((notification) => ({
            ...notification,
            isRead: true
        }));
        updateAdminNotificationBadge();
    } catch (error) {
        // Không chặn admin xem danh sách nếu thao tác đánh dấu đọc thất bại.
    }
};

const openAdminNotifications = async () => {
    if (!adminNotificationPanel) {
        return;
    }

    await loadAdminNotifications();
    adminNotificationPanel.classList.add('is-open');
    adminNotificationPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    await markAdminNotificationsRead();
};

const closeAdminNotifications = () => {
    if (!adminNotificationPanel) {
        return;
    }

    adminNotificationPanel.classList.remove('is-open');
    adminNotificationPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
};

const deleteAdminNotificationItem = async (notificationId) => {
    const normalizedNotificationId = String(notificationId || '').trim();

    if (!normalizedNotificationId) {
        return;
    }

    try {
        const { response, data } = await requestJson(`/api/admin/notifications/${encodeURIComponent(normalizedNotificationId)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xóa thông báo admin.');
        }

        adminNotifications = adminNotifications.filter((notification) =>
            String(notification.id || '') !== normalizedNotificationId
        );
        renderAdminNotifications();
    } catch (error) {
        showToast(error.message || 'Không thể xóa thông báo admin lúc này.', 'error');
    }
};

const isCurrentUserAdmin = () => currentAdminUser?.role === 'admin';

const renderCurrentAdminAccount = () => {
    if (!adminCurrentAccount || !currentAdminUser) {
        return;
    }

    const displayName = currentAdminUser.fullName || currentAdminUser.email || 'Tài khoản admin';
    const email = currentAdminUser.email || 'Chưa cập nhật email';
    const roleText = roleLabels[currentAdminUser.role] || currentAdminUser.role || 'Admin';
    const initial = String(displayName).trim().charAt(0) || 'A';

    if (adminCurrentAccountAvatar) {
        adminCurrentAccountAvatar.textContent = initial.toLocaleUpperCase('vi-VN');
    }

    if (adminCurrentAccountName) {
        adminCurrentAccountName.textContent = displayName;
        adminCurrentAccountName.title = displayName;
    }

    if (adminCurrentAccountEmail) {
        adminCurrentAccountEmail.textContent = email;
        adminCurrentAccountEmail.title = email;
    }

    if (adminCurrentAccountRole) {
        adminCurrentAccountRole.textContent = roleText;
    }

    adminCurrentAccount.hidden = false;
};

const getEmployeeFormMode = (user = null) => {
    const role = String(user?.role || getActiveAccountConfig().role || '').trim().toLowerCase();

    if (role === 'customer') {
        return 'customer';
    }

    if (role === 'admin') {
        return 'admin';
    }

    return 'staff';
};

const syncEmployeeFormMode = (user = null) => {
    if (!employeeForm) {
        return;
    }

    const formMode = getEmployeeFormMode(user);
    const isCustomerMode = formMode === 'customer';
    const isStaffMode = formMode === 'staff';

    accountFieldElements.forEach((field) => {
        const fieldGroups = String(field.dataset.accountField || '').split(/\s+/);
        const shouldShow = fieldGroups.some((group) => {
            if (group === 'customer-profile') {
                return isCustomerMode;
            }

            if (group === 'staff-profile' || group === 'role') {
                return isStaffMode;
            }

            if (group === 'account') {
                return !isCustomerMode;
            }

            return ['identity', 'profile', 'address'].includes(group);
        });

        field.hidden = !shouldShow;
    });

    if (employeeForm.elements.fullName) {
        employeeForm.elements.fullName.readOnly = isCustomerMode && Boolean(editingEmployeeId);
    }

    if (employeeForm.elements.email) {
        employeeForm.elements.email.readOnly = isCustomerMode && Boolean(editingEmployeeId);
    }

    if (employeeForm.elements.role && isCustomerMode) {
        employeeForm.elements.role.value = 'customer';
    }
};

const syncAccountViewContent = () => {
    const config = getActiveAccountConfig();

    if (employeeViewEyebrow) {
        employeeViewEyebrow.textContent = config.eyebrow;
    }
    if (employeeViewTitle) {
        employeeViewTitle.textContent = config.title;
    }
    if (employeeViewDescription) {
        employeeViewDescription.textContent = config.description;
    }
    if (employeeFormEyebrow) {
        employeeFormEyebrow.textContent = config.formEyebrow;
    }
    if (employeeListEyebrow) {
        employeeListEyebrow.textContent = config.listEyebrow;
    }
    if (employeeListTitle) {
        employeeListTitle.textContent = config.listTitle;
    }
    if (employeeSearchInput) {
        employeeSearchInput.placeholder = config.searchPlaceholder;
    }
    if (!editingEmployeeId && employeeFormTitle) {
        employeeFormTitle.textContent = config.createTitle;
    }
    if (!editingEmployeeId && employeeSubmitButton) {
        employeeSubmitButton.innerHTML = getCreateAccountButtonHtml();
    }
    if (!editingEmployeeId && employeeForm?.elements.role && config.canCreate) {
        employeeForm.elements.role.value = config.role;
    }
    if (employeeFormCard) {
        employeeFormCard.hidden = !isCurrentUserAdmin() || (!editingEmployeeId && !config.canCreate);
    }
    syncEmployeeFormMode();
};

const switchAdminView = (viewName) => {
    const selectedViewName = isAccountView(viewName) ? 'employees' : viewName;

    if (isAccountView(viewName)) {
        activeAccountView = viewName;
        if (employeeSearchInput) {
            employeeSearchInput.value = '';
        }
        resetEmployeeForm();
        syncAccountViewContent();
    }

    adminViews.forEach((view) => {
        const isActive = view.dataset.adminView === selectedViewName;

        view.hidden = !isActive;
        view.classList.toggle('is-active', isActive);
    });

    adminNavLinks.forEach((link) => {
        const isActive = link.dataset.adminNav === viewName;

        link.classList.toggle('is-active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    if (isAccountView(viewName) && canViewAccountView(viewName)) {
        loadEmployees();
    }

    if (viewName === 'promotions') {
        loadPromotions();
    }

    if (viewName === 'blog-posts') {
        loadBlogPosts();
    }

    if (viewName === 'test-drives') {
        loadTestDriveAppointments();
    }

    if (viewName === 'consultations') {
        loadConsultationRequests();
    }

    if (viewName === 'deposit-orders') {
        loadAdminDepositPaymentConfig();
        loadDepositOrders();
    }

    if (viewName === 'car-buy-requests') {
        loadCarBuyRequests();
    }

    if (viewName === 'car-sell-requests') {
        loadCarSellRequests();
    }

    if (viewName === 'sales-kpi' && isCurrentUserAdmin()) {
        loadSalesKpiRecords();
    }
};

const syncCurrentAdminUser = async () => {
    try {
        const { response, data } = await requestJson('/api/auth/admin-me');

        if (!response.ok || !data.user?.isAdmin) {
            window.location.replace('/admin-login?login=required');
            return false;
        }

        currentAdminUser = data.user;
        renderCurrentAdminAccount();

        if (isCurrentUserAdmin()) {
            adminOnlyElements.forEach((element) => {
                element.hidden = false;
            });
        }

        return true;
    } catch (error) {
        window.location.replace('/admin-login?login=required');
        return false;
    }
};

const setFeedback = (message, type = 'success') => {
    if (!feedbackElement) {
        return;
    }

    feedbackElement.textContent = message || '';
    feedbackElement.className = 'admin-feedback';

    if (message) {
        feedbackElement.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setEmployeeFeedback = (message, type = 'success') => {
    if (!employeeFeedback) {
        return;
    }

    employeeFeedback.textContent = message || '';
    employeeFeedback.className = 'admin-feedback';

    if (message) {
        employeeFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setPromotionFeedback = (message, type = 'success') => {
    if (!promotionFeedback) {
        return;
    }

    promotionFeedback.textContent = message || '';
    promotionFeedback.className = 'admin-feedback';

    if (message) {
        promotionFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setBlogPostFeedback = (message, type = 'success') => {
    if (!blogPostFeedback) {
        return;
    }

    blogPostFeedback.textContent = message || '';
    blogPostFeedback.className = 'admin-feedback';

    if (message) {
        blogPostFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setTestDriveFeedback = (message, type = 'success') => {
    if (!testDriveFeedback) {
        return;
    }

    testDriveFeedback.textContent = message || '';
    testDriveFeedback.className = 'admin-feedback';

    if (message) {
        testDriveFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setConsultationFeedback = (message, type = 'success') => {
    if (!consultationFeedback) {
        return;
    }

    consultationFeedback.textContent = message || '';
    consultationFeedback.className = 'admin-feedback';

    if (message) {
        consultationFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setConsultationStatusFeedback = (message, type = 'success') => {
    if (!consultationStatusFeedback) {
        return;
    }

    consultationStatusFeedback.textContent = message || '';
    consultationStatusFeedback.className = 'admin-feedback';

    if (message) {
        consultationStatusFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setConsultationStatusLoading = (isLoading) => {
    if (!consultationStatusSaveButton) {
        return;
    }

    consultationStatusSaveButton.disabled = isLoading;
    consultationStatusSaveButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang cập nhật...</span>'
        : '<i class="bx bx-save"></i><span>Cập nhật trạng thái</span>';
};

const setDepositOrderFeedback = (message, type = 'success') => {
    if (!depositOrderFeedback) {
        return;
    }

    depositOrderFeedback.textContent = message || '';
    depositOrderFeedback.className = 'admin-feedback';

    if (message) {
        depositOrderFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setDepositConfigFeedback = (message, type = 'success') => {
    if (!depositConfigFeedback) {
        return;
    }

    depositConfigFeedback.textContent = message || '';
    depositConfigFeedback.className = 'admin-feedback';

    if (message) {
        depositConfigFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setDepositConfigLoading = (isLoading) => {
    if (depositConfigSaveButton) {
        depositConfigSaveButton.disabled = isLoading;
        depositConfigSaveButton.innerHTML = isLoading
            ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang lưu...</span>'
            : '<i class="bx bx-save"></i><span>Lưu cấu hình</span>';
    }

    if (depositConfigReloadButton) {
        depositConfigReloadButton.disabled = isLoading;
    }

    if (depositConfigResetButton) {
        depositConfigResetButton.disabled = isLoading;
    }
};

const setDepositOrderStatusFeedback = (message, type = 'success') => {
    if (!depositOrderStatusFeedback) {
        return;
    }

    depositOrderStatusFeedback.textContent = message || '';
    depositOrderStatusFeedback.className = 'admin-feedback';

    if (message) {
        depositOrderStatusFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setDepositOrderStatusLoading = (isLoading) => {
    if (!depositOrderStatusSaveButton) {
        return;
    }

    depositOrderStatusSaveButton.disabled = isLoading;
    depositOrderStatusSaveButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang cập nhật...</span>'
        : '<i class="bx bx-save"></i><span>Cập nhật trạng thái</span>';
};

const setCarBuyRequestFeedback = (message, type = 'success') => {
    if (!carBuyRequestFeedback) {
        return;
    }

    carBuyRequestFeedback.textContent = message || '';
    carBuyRequestFeedback.className = 'admin-feedback';

    if (message) {
        carBuyRequestFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setCarBuyRequestStatusFeedback = (message, type = 'success') => {
    if (!carBuyRequestStatusFeedback) {
        return;
    }

    carBuyRequestStatusFeedback.textContent = message || '';
    carBuyRequestStatusFeedback.className = 'admin-feedback';

    if (message) {
        carBuyRequestStatusFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setCarBuyRequestStatusLoading = (isLoading) => {
    if (!carBuyRequestStatusSaveButton) {
        return;
    }

    carBuyRequestStatusSaveButton.disabled = isLoading;
    carBuyRequestStatusSaveButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang cập nhật...</span>'
        : '<i class="bx bx-save"></i><span>Cập nhật trạng thái</span>';
};

const setCarSellRequestFeedback = (message, type = 'success') => {
    if (!carSellRequestFeedback) {
        return;
    }

    carSellRequestFeedback.textContent = message || '';
    carSellRequestFeedback.className = 'admin-feedback';

    if (message) {
        carSellRequestFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setCarSellRequestStatusFeedback = (message, type = 'success') => {
    if (!carSellRequestStatusFeedback) {
        return;
    }

    carSellRequestStatusFeedback.textContent = message || '';
    carSellRequestStatusFeedback.className = 'admin-feedback';

    if (message) {
        carSellRequestStatusFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setCarSellRequestStatusLoading = (isLoading) => {
    if (!carSellRequestStatusSaveButton) {
        return;
    }

    carSellRequestStatusSaveButton.disabled = isLoading;
    carSellRequestStatusSaveButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang xử lý...</span>'
        : '<i class="bx bx-save"></i><span>Cập nhật xử lý</span>';
};

const showToast = (message, type = 'success', title) => {
    if (!toastStack || !message) {
        return;
    }

    const toast = document.createElement('article');
    const currentToastId = `toast-${Date.now()}-${toastId += 1}`;
    const toastTitle = title || (type === 'success' ? 'Thành công' : 'Có lỗi xảy ra');

    toast.className = `toast toast--${type}`;
    toast.dataset.toastId = currentToastId;
    toast.innerHTML = `
        <span class="toast__icon">
            <i class="bx ${type === 'success' ? 'bx-check' : 'bx-x'}"></i>
        </span>
        <div class="toast__content">
            <strong class="toast__title">${toastTitle}</strong>
            <p class="toast__message">${message}</p>
        </div>
        <button type="button" class="toast__close" aria-label="Đóng thông báo">
            <i class="bx bx-x"></i>
        </button>
    `;

    const removeToast = () => {
        toast.classList.remove('is-visible');
        toast.classList.add('is-closing');
        window.setTimeout(() => {
            toast.remove();
        }, 220);
    };

    toast.querySelector('.toast__close')?.addEventListener('click', removeToast);
    toastStack.appendChild(toast);
    window.requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });
    window.setTimeout(removeToast, 3200);
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

const syncImageInput = () => {
    if (carForm?.elements.image) {
        carForm.elements.image.value = selectedCarImages[0] || '';
    }
};

const renderImagePreviews = () => {
    if (!imagePreviewList) {
        return;
    }

    if (!selectedCarImages.length) {
        imagePreviewList.innerHTML = '<p class="image-preview-empty">Chưa có ảnh xe nào được chọn.</p>';
        syncImageInput();
        return;
    }

    imagePreviewList.innerHTML = selectedCarImages.map((image, index) => `
        <article class="image-preview-item">
            <img src="${image}" alt="Ảnh xe ${index + 1}">
            ${index === 0 ? '<span class="image-preview-item__badge">Ảnh chính</span>' : ''}
            <button type="button" class="image-preview-item__remove" data-remove-image="${index}" aria-label="Xóa ảnh ${index + 1}">
                <i class="bx bx-x"></i>
            </button>
        </article>
    `).join('');

    syncImageInput();
};

const setCarImages = (images = []) => {
    selectedCarImages = images
        .map((image) => String(image || '').trim())
        .filter(Boolean)
        .filter((image, index, imageList) => imageList.indexOf(image) === index)
        .slice(0, maxCarImages);

    renderImagePreviews();
};

const setEmployeeAvatarPreview = (avatarUrl = '', fileName = '') => {
    if (employeeAvatarPreview) {
        const normalizedAvatarUrl = String(avatarUrl || '').trim();

        employeeAvatarPreview.innerHTML = normalizedAvatarUrl
            ? `<img src="${escapeHtml(normalizedAvatarUrl)}" alt="Ảnh đại diện nhân viên">`
            : '<i class="bx bx-user"></i>';
    }

    if (employeeAvatarFileName) {
        employeeAvatarFileName.textContent = fileName || (avatarUrl ? 'Đã chọn ảnh đại diện' : 'Chưa chọn ảnh');
    }
};

const setPromotionImagePreview = (imageUrl = '', fileName = '') => {
    const normalizedImageUrl = String(imageUrl || '').trim();

    if (promotionImagePreview) {
        promotionImagePreview.innerHTML = normalizedImageUrl
            ? `<img src="${escapeHtml(normalizedImageUrl)}" alt="Ảnh minh họa khuyến mại">`
            : '<i class="bx bxs-image"></i>';
    }

    if (promotionImageFileName) {
        promotionImageFileName.textContent = fileName || (normalizedImageUrl ? 'Đã chọn ảnh khuyến mại' : 'Chưa chọn ảnh');
    }
};

const setBlogPostImagePreview = (imageUrl = '', fileName = '') => {
    const normalizedImageUrl = String(imageUrl || '').trim();

    if (blogPostImagePreview) {
        blogPostImagePreview.innerHTML = normalizedImageUrl
            ? `<img src="${escapeHtml(normalizedImageUrl)}" alt="Ảnh đại diện bài viết blog">`
            : '<i class="bx bxs-image"></i>';
    }

    if (blogPostImageFileName) {
        blogPostImageFileName.textContent = fileName || (normalizedImageUrl ? 'Đã chọn ảnh blog' : 'Chưa chọn ảnh');
    }
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error(`Không thể đọc file ${file.name}.`)));
    reader.readAsDataURL(file);
});

const uploadEmployeeAvatar = async (file) => {
    if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ được chọn file ảnh.');
    }

    if (file.size > maxUploadedImageSize) {
        throw new Error(`Ảnh "${file.name}" vượt quá 5MB.`);
    }

    const { response, data } = await requestJson('/api/uploads/avatar', {
        method: 'POST',
        body: JSON.stringify({
            file: {
                name: file.name,
                type: file.type,
                dataUrl: await readFileAsDataUrl(file)
            }
        })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải ảnh đại diện lúc này.');
    }

    return data.avatarUrl || '';
};

const uploadAdminDepositTransferProof = async (orderId, file) => {
    if (!file) {
        throw new Error('Vui lòng chọn ảnh biên lai chuyển khoản.');
    }

    const order = getDepositOrder(orderId);

    if (order && !canUploadDepositOrderProof(order)) {
        throw new Error('Chỉ đơn đã được xác nhận nhận tiền mới được tải biên lai.');
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ được chọn file ảnh biên lai.');
    }

    if (file.size > maxUploadedImageSize) {
        throw new Error(`Ảnh "${file.name}" vượt quá 5MB.`);
    }

    const { response, data } = await requestJson(`/api/admin/deposit-orders/${encodeURIComponent(String(orderId))}/transfer-proof`, {
        method: 'POST',
        body: JSON.stringify({
            file: {
                name: file.name,
                type: file.type,
                dataUrl: await readFileAsDataUrl(file)
            }
        })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải biên lai chuyển khoản.');
    }

    return data;
};

const uploadPromotionImage = async (file) => {
    if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ được chọn file ảnh.');
    }

    if (file.size > maxUploadedImageSize) {
        throw new Error(`Ảnh "${file.name}" vượt quá 5MB.`);
    }

    const { response, data } = await requestJson('/api/uploads/promotion-image', {
        method: 'POST',
        body: JSON.stringify({
            file: {
                name: file.name,
                type: file.type,
                dataUrl: await readFileAsDataUrl(file)
            }
        })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải ảnh khuyến mại lúc này.');
    }

    return data.imageUrl || '';
};

const uploadCroppedPromotionImage = async ({ dataUrl, fileName }) => {
    const { response, data } = await requestJson('/api/uploads/promotion-image/cropped', {
        method: 'POST',
        body: JSON.stringify({
            file: {
                name: fileName || 'promotion-banner.jpg',
                type: 'image/jpeg',
                dataUrl
            }
        })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải ảnh banner khuyến mại lúc này.');
    }

    return data.imageUrl || '';
};

const uploadBlogPostImage = async (file) => {
    if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ được chọn file ảnh.');
    }

    if (file.size > maxUploadedImageSize) {
        throw new Error(`Ảnh "${file.name}" vượt quá 5MB.`);
    }

    const { response, data } = await requestJson('/api/uploads/blog-image', {
        method: 'POST',
        body: JSON.stringify({
            file: {
                name: file.name,
                type: file.type,
                dataUrl: await readFileAsDataUrl(file)
            }
        })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải ảnh bài viết blog lúc này.');
    }

    return data.imageUrl || '';
};

const uploadCroppedBlogPostImage = async ({ dataUrl, fileName }) => {
    const { response, data } = await requestJson('/api/uploads/blog-image/cropped', {
        method: 'POST',
        body: JSON.stringify({
            file: {
                name: fileName || 'blog-cover.jpg',
                type: 'image/jpeg',
                dataUrl
            }
        })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải ảnh bài viết blog lúc này.');
    }

    return data.imageUrl || '';
};

const validatePromotionImageFile = (file) => {
    if (!file?.type?.startsWith('image/')) {
        throw new Error('Chỉ được chọn file ảnh.');
    }

    if (file.size > maxUploadedImageSize) {
        throw new Error(`Ảnh "${file.name}" vượt quá 5MB.`);
    }
};

const setPromotionCropFeedback = (message = '', type = 'error') => {
    if (!promotionCropFeedback) {
        return;
    }

    promotionCropFeedback.textContent = message;
    promotionCropFeedback.classList.toggle('is-error', Boolean(message) && type === 'error');
    promotionCropFeedback.classList.toggle('is-success', Boolean(message) && type === 'success');
};

const getPromotionCropValues = () => ({
    zoom: Math.max(1, Number(promotionCropZoomInput?.value || 1)),
    focusX: Math.min(100, Math.max(0, Number(promotionCropXInput?.value || 50))),
    focusY: Math.min(100, Math.max(0, Number(promotionCropYInput?.value || 50)))
});

const getPromotionCropRect = () => {
    if (!promotionCropState?.image) {
        return null;
    }

    const { zoom, focusX, focusY } = getPromotionCropValues();
    const image = promotionCropState.image;
    const sourceAspectRatio = image.naturalWidth / image.naturalHeight;
    const targetAspectRatio = 2;
    let cropWidth;
    let cropHeight;

    if (sourceAspectRatio > targetAspectRatio) {
        cropHeight = image.naturalHeight / zoom;
        cropWidth = cropHeight * targetAspectRatio;
    } else {
        cropWidth = image.naturalWidth / zoom;
        cropHeight = cropWidth / targetAspectRatio;
    }

    cropWidth = Math.min(cropWidth, image.naturalWidth);
    cropHeight = Math.min(cropHeight, image.naturalHeight);

    return {
        x: (image.naturalWidth - cropWidth) * (focusX / 100),
        y: (image.naturalHeight - cropHeight) * (focusY / 100),
        width: cropWidth,
        height: cropHeight
    };
};

const renderPromotionCropPreview = () => {
    if (!promotionCropCanvas || !promotionCropState?.image) {
        return;
    }

    const cropRect = getPromotionCropRect();
    const context = promotionCropCanvas.getContext('2d');

    if (!cropRect || !context) {
        return;
    }

    context.clearRect(0, 0, promotionCropCanvas.width, promotionCropCanvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
        promotionCropState.image,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        promotionCropCanvas.width,
        promotionCropCanvas.height
    );
};

const closePromotionCropPanel = () => {
    if (!promotionCropPanel || promotionCropPanel.hidden) {
        return;
    }

    promotionCropPanel.classList.add('is-closing');
    promotionCropPanel.classList.remove('is-visible');
    window.clearTimeout(promotionCropCloseTimer);
    promotionCropCloseTimer = window.setTimeout(() => {
        promotionCropPanel.hidden = true;
        promotionCropPanel.setAttribute('aria-hidden', 'true');
        promotionCropPanel.classList.remove('is-closing');
    }, 280);

    if (promotionCropState?.objectUrl) {
        URL.revokeObjectURL(promotionCropState.objectUrl);
    }

    promotionCropState = null;
    if (promotionImageInput) {
        promotionImageInput.value = '';
    }
    setPromotionCropFeedback('');
};

const openPromotionCropPanel = () => {
    if (!promotionCropPanel) {
        return;
    }

    window.clearTimeout(promotionCropCloseTimer);
    promotionCropPanel.hidden = false;
    promotionCropPanel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        promotionCropPanel.classList.add('is-visible');
        promotionCropPanel.classList.remove('is-closing');
    });
};

const openPromotionImageCropper = async (file) => {
    validatePromotionImageFile(file);

    if (!promotionCropCanvas || !window.URL) {
        const imageUrl = await uploadPromotionImage(file);

        promotionForm.elements.imageUrl.value = imageUrl;
        setPromotionImagePreview(imageUrl, file.name);
        showToast('Tải ảnh khuyến mại thành công.', 'success', 'Đã tải ảnh');
        return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    await new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', () => reject(new Error('Không thể mở ảnh để cắt.')), { once: true });
        image.src = objectUrl;
    });

    promotionCropState = { file, image, objectUrl };
    if (promotionCropZoomInput) {
        promotionCropZoomInput.value = '1';
    }
    if (promotionCropXInput) {
        promotionCropXInput.value = '50';
    }
    if (promotionCropYInput) {
        promotionCropYInput.value = '50';
    }
    if (promotionCropFileName) {
        promotionCropFileName.textContent = `${file.name} - ảnh sẽ được cắt theo tỷ lệ 2:1 cho banner trang chủ.`;
    }

    setPromotionCropFeedback('');
    renderPromotionCropPreview();
    openPromotionCropPanel();
};

const getCroppedPromotionImageDataUrl = () => {
    if (!promotionCropState?.image) {
        throw new Error('Chưa có ảnh để cắt.');
    }

    const cropRect = getPromotionCropRect();
    const outputCanvas = document.createElement('canvas');
    const context = outputCanvas.getContext('2d');

    if (!cropRect || !context) {
        throw new Error('Không thể cắt ảnh trên trình duyệt này.');
    }

    outputCanvas.width = 1200;
    outputCanvas.height = 600;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
        promotionCropState.image,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
    );

    return outputCanvas.toDataURL('image/jpeg', 0.9);
};

const setBlogPostCropFeedback = (message = '', type = 'error') => {
    if (!blogPostCropFeedback) {
        return;
    }

    blogPostCropFeedback.textContent = message;
    blogPostCropFeedback.classList.toggle('is-error', Boolean(message) && type === 'error');
    blogPostCropFeedback.classList.toggle('is-success', Boolean(message) && type === 'success');
};

const getBlogPostCropValues = () => ({
    zoom: Math.max(1, Number(blogPostCropZoomInput?.value || 1)),
    focusX: Math.min(100, Math.max(0, Number(blogPostCropXInput?.value || 50))),
    focusY: Math.min(100, Math.max(0, Number(blogPostCropYInput?.value || 50)))
});

const getBlogPostCropRect = () => {
    if (!blogPostCropState?.image) {
        return null;
    }

    const { zoom, focusX, focusY } = getBlogPostCropValues();
    const image = blogPostCropState.image;
    const sourceAspectRatio = image.naturalWidth / image.naturalHeight;
    const targetAspectRatio = 16 / 9;
    let cropWidth;
    let cropHeight;

    if (sourceAspectRatio > targetAspectRatio) {
        cropHeight = image.naturalHeight / zoom;
        cropWidth = cropHeight * targetAspectRatio;
    } else {
        cropWidth = image.naturalWidth / zoom;
        cropHeight = cropWidth / targetAspectRatio;
    }

    cropWidth = Math.min(cropWidth, image.naturalWidth);
    cropHeight = Math.min(cropHeight, image.naturalHeight);

    return {
        x: (image.naturalWidth - cropWidth) * (focusX / 100),
        y: (image.naturalHeight - cropHeight) * (focusY / 100),
        width: cropWidth,
        height: cropHeight
    };
};

const renderBlogPostCropPreview = () => {
    if (!blogPostCropCanvas || !blogPostCropState?.image) {
        return;
    }

    const cropRect = getBlogPostCropRect();
    const context = blogPostCropCanvas.getContext('2d');

    if (!cropRect || !context) {
        return;
    }

    context.clearRect(0, 0, blogPostCropCanvas.width, blogPostCropCanvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
        blogPostCropState.image,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        blogPostCropCanvas.width,
        blogPostCropCanvas.height
    );
};

const closeBlogPostCropPanel = () => {
    if (!blogPostCropPanel || blogPostCropPanel.hidden) {
        return;
    }

    blogPostCropPanel.classList.add('is-closing');
    blogPostCropPanel.classList.remove('is-visible');
    window.clearTimeout(blogPostCropCloseTimer);
    blogPostCropCloseTimer = window.setTimeout(() => {
        blogPostCropPanel.hidden = true;
        blogPostCropPanel.setAttribute('aria-hidden', 'true');
        blogPostCropPanel.classList.remove('is-closing');
    }, 280);

    if (blogPostCropState?.objectUrl) {
        URL.revokeObjectURL(blogPostCropState.objectUrl);
    }

    blogPostCropState = null;
    if (blogPostImageInput) {
        blogPostImageInput.value = '';
    }
    if (blogContentImageInput) {
        blogContentImageInput.value = '';
    }
    setBlogPostCropFeedback('');
};

const openBlogPostCropPanel = () => {
    if (!blogPostCropPanel) {
        return;
    }

    window.clearTimeout(blogPostCropCloseTimer);
    blogPostCropPanel.hidden = false;
    blogPostCropPanel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        blogPostCropPanel.classList.add('is-visible');
        blogPostCropPanel.classList.remove('is-closing');
    });
};

const insertBlogContentImageMarkup = (imageUrl, fileName = '') => {
    const contentField = blogPostForm?.elements.content;

    if (!contentField || !imageUrl) {
        return;
    }

    const altText = String(fileName || 'Ảnh minh họa bài viết')
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || 'Ảnh minh họa bài viết';
    const imageMarkup = `![${altText}](${imageUrl})`;
    const start = Number(contentField.selectionStart ?? contentField.value.length);
    const end = Number(contentField.selectionEnd ?? contentField.value.length);
    const before = contentField.value.slice(0, start).replace(/\s*$/, '');
    const after = contentField.value.slice(end).replace(/^\s*/, '');
    const prefix = before ? `${before}\n\n` : '';
    const suffix = after ? `\n\n${after}` : '\n\n';

    contentField.value = `${prefix}${imageMarkup}${suffix}`;
    const nextCursorPosition = `${prefix}${imageMarkup}`.length;
    contentField.focus();
    contentField.setSelectionRange(nextCursorPosition, nextCursorPosition);
};

const openBlogPostImageCropper = async (file, target = 'cover') => {
    validatePromotionImageFile(file);

    if (!blogPostCropCanvas || !window.URL) {
        const imageUrl = await uploadBlogPostImage(file);

        if (target === 'content') {
            insertBlogContentImageMarkup(imageUrl, file.name);
        } else {
            blogPostForm.elements.imageUrl.value = imageUrl;
            setBlogPostImagePreview(imageUrl, file.name);
        }
        showToast('Tải ảnh bài viết blog thành công.', 'success', 'Đã tải ảnh');
        return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    await new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', () => reject(new Error('Không thể mở ảnh để cắt.')), { once: true });
        image.src = objectUrl;
    });

    blogPostCropState = { file, image, objectUrl, target };
    if (blogPostCropZoomInput) {
        blogPostCropZoomInput.value = '1';
    }
    if (blogPostCropXInput) {
        blogPostCropXInput.value = '50';
    }
    if (blogPostCropYInput) {
        blogPostCropYInput.value = '50';
    }
    if (blogPostCropFileName) {
        blogPostCropFileName.textContent = target === 'content'
            ? `${file.name} - ảnh sẽ được cắt và chèn vào nội dung bài viết.`
            : `${file.name} - ảnh sẽ được cắt theo tỷ lệ 16:9 cho trang blog.`;
    }

    setBlogPostCropFeedback('');
    renderBlogPostCropPreview();
    openBlogPostCropPanel();
};

const getCroppedBlogPostImageDataUrl = () => {
    if (!blogPostCropState?.image) {
        throw new Error('Chưa có ảnh để cắt.');
    }

    const cropRect = getBlogPostCropRect();
    const outputCanvas = document.createElement('canvas');
    const context = outputCanvas.getContext('2d');

    if (!cropRect || !context) {
        throw new Error('Không thể cắt ảnh trên trình duyệt này.');
    }

    outputCanvas.width = 1200;
    outputCanvas.height = 675;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
        blogPostCropState.image,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
    );

    return outputCanvas.toDataURL('image/jpeg', 0.9);
};

const uploadCarImages = async (files) => {
    const invalidTypeFile = files.find((file) => !file.type.startsWith('image/'));

    if (invalidTypeFile) {
        throw new Error('Chỉ được chọn file ảnh.');
    }

    const oversizedFile = files.find((file) => file.size > maxUploadedImageSize);

    if (oversizedFile) {
        throw new Error(`Ảnh "${oversizedFile.name}" vượt quá 5MB.`);
    }

    const payloadFiles = await Promise.all(files.map(async (file) => ({
        name: file.name,
        type: file.type,
        dataUrl: await readFileAsDataUrl(file)
    })));
    const { response, data } = await requestJson('/api/uploads/car-images', {
        method: 'POST',
        body: JSON.stringify({ files: payloadFiles })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải ảnh xe lúc này.');
    }

    return data.images || [];
};

const openEditor = () => {
    if (editorPanel) {
        window.clearTimeout(modalCloseTimer);
        editorPanel.hidden = false;
        editorPanel.classList.remove('is-closing');
        editorPanel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        window.requestAnimationFrame(() => {
            editorPanel.classList.add('is-visible');
        });
    }
};

const closeEditor = () => {
    if (editorPanel) {
        editorPanel.classList.remove('is-visible');
        editorPanel.classList.add('is-closing');
        editorPanel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        window.clearTimeout(modalCloseTimer);
        modalCloseTimer = window.setTimeout(() => {
            editorPanel.hidden = true;
            editorPanel.classList.remove('is-closing');
        }, 280);
    }
};

const resetFormState = (shouldClose = true) => {
    if (!carForm) {
        return;
    }

    carForm.reset();
    carIdInput.value = '';
    setCarImages([]);
    if (carImagesInput) {
        carImagesInput.value = '';
    }
    submitButton.textContent = 'Thêm xe';
    formTitle.textContent = 'Thêm xe mới';
    setFeedback('');

    if (shouldClose) {
        closeEditor();
    }
};

const fillForm = (car) => {
    if (!carForm) {
        return;
    }

    carIdInput.value = car.id;
    carForm.elements.brand.value = car.brand || '';
    setCarFormValue('category', car.category);
    carForm.elements.name.value = car.name;
    carForm.elements.description.value = car.description || '';
    setCarFormValue('type', car.type);
    carForm.elements.priceText.value = car.price;
    carForm.elements.priceValue.value = car.priceValue;
    setCarImages(getCarImages(car));
    carForm.elements.year.value = car.year;
    setCarFormValue('fuel', car.fuel);
    carForm.elements.mileageText.value = car.mileage;
    carForm.elements.mileageValue.value = car.mileageValue;
    setCarFormValue('seats', car.seats);
    setCarFormValue('gearbox', car.gearbox);
    setCarFormValue('drivetrain', car.drivetrain);
    setCarFormValue('origin', car.origin);
    setCarFormValue('condition', car.condition);
    carForm.elements.color.value = car.color;
    setCarFormValue('actionText', car.actionText);

    submitButton.textContent = 'Cập nhật xe';
    formTitle.textContent = `Chỉnh sửa: ${car.name}`;
    openEditor();
    carForm.elements.name.focus();
};

const updateStats = (items) => {
    const totalCars = items.length;
    const availableCars = items.filter(isAvailableCar);
    const heldCars = items.filter(isHeldCar);
    const soldCars = items.filter((car) => getInventoryStatusType(car) === 'sold');
    const newCars = items.filter((car) => normalizeSearchValue(car.condition).includes('moi')).length;
    const inventoryValue = availableCars.reduce((sum, car) => sum + Number(car.priceValue || 0), 0);
    const averageAvailablePrice = availableCars.length ? Math.round(inventoryValue / availableCars.length) : 0;
    const incompleteCars = items.filter((car) => getCarDataIssues(car).length > 0).length;
    const customerSellCars = items.filter((car) =>
        String(car.inventorySource?.type || '').trim() === 'customer_sell_request'
    ).length;

    totalCarsElement.textContent = String(totalCars);
    totalCarsDetailElement.textContent = customerSellCars
        ? `${availableCars.length} còn hàng, ${heldCars.length} đang giữ, ${soldCars.length} đã bán, ${customerSellCars} xe khách gửi bán`
        : `${availableCars.length} còn hàng, ${heldCars.length} đang giữ, ${soldCars.length} đã bán`;
    availableCarsElement.textContent = String(availableCars.length);
    availableCarsDetailElement.textContent = `${newCars} xe mới, ${Math.max(0, totalCars - newCars)} xe cũ`;
    inventoryValueElement.textContent = formatCompactPrice(inventoryValue);
    inventoryValueDetailElement.textContent = availableCars.length
        ? `Giá TB xe còn hàng: ${formatCompactPrice(averageAvailablePrice)}`
        : 'Chưa có xe còn hàng';
    incompleteCarsElement.textContent = String(incompleteCars);
    incompleteCarsDetailElement.textContent = incompleteCars
        ? `${totalCars - incompleteCars} xe đã đủ dữ liệu`
        : 'Tất cả xe đã đủ dữ liệu';
};

const getFilteredCars = () => {
    const keyword = normalizeSearchValue(searchInput?.value);

    if (!keyword) {
        return cars;
    }

    return cars.filter((car) => {
        const haystack = [
            car.name,
            car.brand,
            car.category,
            car.type,
            car.drivetrain,
            car.condition,
            car.origin,
            car.actionText,
            car.gearbox,
            car.fuel,
            car.seats,
            car.mileage,
            car.color,
            car.price,
            car.description,
            car.inventorySource?.label,
            car.inventorySource?.requestCode,
            car.inventorySource?.sellerName,
            car.inventorySource?.sellerPhone,
            car.inventorySource?.sellerEmail
        ]
            .join(' ');

        return normalizeSearchValue(haystack).includes(keyword);
    });
};

const renderCars = () => {
    if (!carTableBody) {
        return;
    }

    const filteredCars = getFilteredCars();
    updateStats(cars);

    if (carResultSummary) {
        const keyword = String(searchInput?.value || '').trim();
        carResultSummary.textContent = keyword
            ? `Đang hiển thị ${filteredCars.length} / ${cars.length} xe phù hợp với "${keyword}".`
            : `Đang hiển thị ${filteredCars.length} / ${cars.length} xe trong kho.`;
    }

    if (!filteredCars.length) {
        carTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty">Không tìm thấy xe phù hợp với bộ lọc hiện tại.</td>
            </tr>
        `;
        return;
    }

    carTableBody.innerHTML = filteredCars.map((car) => {
        const images = getCarImages(car);
        const imageCount = images.length;
        const imageSource = images[0] || car.image || '';
        const statusMeta = getCarStatusMeta(car);
        const dataIssues = getCarDataIssues(car);
        const issuePreview = dataIssues.length
            ? `${dataIssues.slice(0, 2).join(', ')}${dataIssues.length > 2 ? ` +${dataIssues.length - 2}` : ''}`
            : 'Đủ dữ liệu';
        const carTitle = getDisplayCarTitle(car.brand, car.name, 'Chưa có tên xe');
        const descriptionPreview = getShortNotePreview(car.description, 118);
        const priceValue = Number(car.priceValue || 0);
        const source = car.inventorySource || {};
        const isCustomerSellSource = source.type === 'customer_sell_request';
        const sellerName = source.sellerName || 'Khách hàng';
        const sellerPhone = source.sellerPhone || '';
        const sellerPhoneHref = getPhoneHref(sellerPhone);
        const sourceBadgeMarkup = isCustomerSellSource
            ? `
                <span class="inventory-source-badge" title="Xe được nhập kho từ thông tin khách hàng đăng bán">
                    <i class="bx bx-user-check" aria-hidden="true"></i>
                    <span>Khách gửi bán</span>
                    <small>${escapeHtml(source.requestCode || '')}</small>
                </span>
            `
            : '';
        const sourcePreviewMarkup = isCustomerSellSource
            ? `
                <small class="car-source-preview">
                    Nguồn: ${escapeHtml(sellerName)}
                    ${sellerPhoneHref ? ` · <a class="admin-inline-link" href="tel:${escapeHtml(sellerPhoneHref)}">${escapeHtml(sellerPhone)}</a>` : ''}
                </small>
            `
            : '';
        const sourceChipMarkup = isCustomerSellSource
            ? `
                <span class="data-chip data-chip--source">
                    <i class="bx bx-user-check"></i>
                    Khách gửi bán
                </span>
                <span class="data-chip data-chip--source-code">
                    <i class="bx bx-purchase-tag-alt"></i>
                    ${escapeHtml(source.requestCode || `BX-${String(source.requestId || '').padStart(6, '0')}`)}
                </span>
            `
            : '';
        const specItems = [
            ['Phân khúc', car.category],
            ['Kiểu', car.type],
            ['Hộp số', car.gearbox],
            ['Nhiên liệu', car.fuel],
            ['Số chỗ', car.seats],
            ['ODO', car.mileage],
            ['Dẫn động', car.drivetrain],
            ['Xuất xứ', car.origin],
            ['Màu', car.color]
        ].filter(([, value]) => hasCarValue(value));
        const imageMarkup = imageSource
            ? `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(carTitle)}" class="car-image">`
            : `<div class="car-image car-image--placeholder" aria-label="Chưa có ảnh xe"><i class="bx bx-image"></i></div>`;
        const specMarkup = specItems.length
            ? specItems.map(([label, value]) => `
                <span class="spec-chip">
                    <small>${escapeHtml(label)}</small>
                    <strong>${escapeHtml(value)}</strong>
                </span>
            `).join('')
            : '<span class="spec-chip spec-chip--empty">Chưa có thông số</span>';

        return `
            <tr class="${isAvailableCar(car) ? '' : 'inventory-row--muted'}">
                <td>
                    <div class="car-image-stack">
                        ${imageMarkup}
                        ${imageCount > 1 ? `<span class="car-image-count">+${imageCount - 1}</span>` : ''}
                    </div>
                </td>
                <td>
                    <div class="car-name car-name--detailed">
                        <div class="car-name__title">
                            <strong>${escapeHtml(carTitle)}</strong>
                            <span class="car-id-badge">#${escapeHtml(car.id)}</span>
                        </div>
                        <span class="car-name__meta">${escapeHtml(car.brand || 'Chưa có hãng')} • ${escapeHtml(car.year || 'Chưa có đời')} • ${escapeHtml(car.condition || 'Chưa có tình trạng')}</span>
                        ${sourceBadgeMarkup}
                        <small class="car-description-preview">${escapeHtml(descriptionPreview || 'Chưa có mô tả xe.')}</small>
                        ${sourcePreviewMarkup}
                    </div>
                </td>
                <td>
                    <div class="price-stack price-stack--detailed">
                        <strong>${escapeHtml(car.price || 'Giá liên hệ')}</strong>
                        ${priceValue ? `<span class="price-note">${escapeHtml(currencyFormatter.format(priceValue))} VNĐ</span>` : '<span class="price-note">Chưa nhập giá số</span>'}
                        <span class="inventory-status-badge ${statusMeta.className}">${escapeHtml(statusMeta.label)}</span>
                    </div>
                </td>
                <td>
                    <div class="car-spec-grid">${specMarkup}</div>
                </td>
                <td>
                    <div class="car-data-stack">
                        <span class="data-chip">
                            <i class="bx bx-images"></i>
                            ${imageCount || 0} ảnh
                        </span>
                        ${sourceChipMarkup}
                        <span class="data-chip ${dataIssues.length ? 'is-incomplete' : 'is-complete'}">
                            <i class="bx ${dataIssues.length ? 'bx-error-circle' : 'bx-check-circle'}"></i>
                            ${escapeHtml(issuePreview)}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="car-date-stack">
                        <strong>Tạo ${escapeHtml(formatInventoryDate(car.createdAt))}</strong>
                        <span>Cập nhật ${escapeHtml(formatInventoryDate(car.updatedAt))}</span>
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-car="${escapeHtml(car.id)}" aria-label="Sửa ${escapeHtml(carTitle)}" title="Sửa xe">
                            <i class="bx bx-pencil"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--delete" data-delete-car="${escapeHtml(car.id)}" aria-label="Xóa ${escapeHtml(carTitle)}" title="Xóa xe">
                            <i class="bx bx-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const loadCars = async () => {
    setFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/cars');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách xe.');
        }

        cars = data.cars || [];
        renderCars();
    } catch (error) {
        setFeedback(error.message || 'Không thể tải danh sách xe.', 'error');
        carTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty">Không thể tải dữ liệu xe từ hệ thống.</td>
            </tr>
        `;
    }
};

const formatPromotionDate = (value, fallback = 'Không giới hạn') => {
    if (!value) {
        return fallback;
    }

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};

const getPromotionPeriodText = (promotion) => {
    const startText = formatPromotionDate(promotion?.startsAt);
    const endText = formatPromotionDate(promotion?.endsAt);

    if (!promotion?.startsAt && !promotion?.endsAt) {
        return 'Không giới hạn thời gian';
    }

    return `${startText} - ${endText}`;
};

const getFilteredPromotions = () => {
    const keyword = String(promotionSearchInput?.value || '').trim().toLowerCase();

    if (!keyword) {
        return promotions;
    }

    return promotions.filter((promotion) =>
        [
            promotion.title,
            promotion.summary,
            promotion.content,
            promotion.badgeText,
            promotion.ctaText,
            promotion.ctaUrl
        ].join(' ').toLowerCase().includes(keyword)
    );
};

const renderPromotions = () => {
    if (!promotionTableBody) {
        return;
    }

    const filteredPromotions = getFilteredPromotions();

    if (!filteredPromotions.length) {
        promotionTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Chưa có bài khuyến mại phù hợp.</td>
            </tr>
        `;
        return;
    }

    promotionTableBody.innerHTML = filteredPromotions.map((promotion) => {
        const imageHtml = promotion.imageUrl
            ? `<img src="${escapeHtml(promotion.imageUrl)}" alt="${escapeHtml(promotion.title)}">`
            : '<i class="bx bxs-purchase-tag" aria-hidden="true"></i>';
        const periodText = getPromotionPeriodText(promotion);
        const createdText = promotion.createdAt
            ? dateFormatter.format(new Date(promotion.createdAt))
            : 'Chưa rõ';

        return `
            <tr>
                <td>
                    <div class="promotion-title-cell">
                        <span class="promotion-thumb">${imageHtml}</span>
                        <div class="promotion-copy">
                            <span>${escapeHtml(promotion.badgeText || 'Khuyến mại')}</span>
                            <strong>${escapeHtml(promotion.title)}</strong>
                            <small>${escapeHtml(promotion.summary || 'Chưa có mô tả ngắn')}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="promotion-date-stack">
                        <strong>${escapeHtml(periodText)}</strong>
                        <span>Tạo ${escapeHtml(createdText)}</span>
                    </div>
                </td>
                <td>
                    <div class="promotion-cta-stack">
                        <strong>${escapeHtml(promotion.ctaText || 'Xem ưu đãi')}</strong>
                        <a href="${escapeHtml(promotion.ctaUrl || '#footer')}" target="_blank" rel="noopener">${escapeHtml(promotion.ctaUrl || '#footer')}</a>
                    </div>
                </td>
                <td>
                    <button type="button" class="homepage-toggle${promotion.showOnHome ? ' is-active' : ''}" data-toggle-promotion="${promotion.id}" aria-pressed="${promotion.showOnHome ? 'true' : 'false'}">
                        <i class="bx ${promotion.showOnHome ? 'bxs-star' : 'bx-star'}" aria-hidden="true"></i>
                        <span>${promotion.showOnHome ? 'Đang hiển thị' : 'Ẩn'}</span>
                    </button>
                    <span class="homepage-order">Thứ tự ${Number(promotion.displayOrder || 0)}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-promotion="${promotion.id}" aria-label="Sửa ${escapeHtml(promotion.title)}">
                            <i class="bx bx-pencil"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--delete" data-delete-promotion="${promotion.id}" aria-label="Xóa ${escapeHtml(promotion.title)}">
                            <i class="bx bx-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const loadPromotions = async () => {
    if (!promotionTableBody) {
        return;
    }

    setPromotionFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/promotions');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách khuyến mại.');
        }

        promotions = data.promotions || [];
        renderPromotions();
    } catch (error) {
        setPromotionFeedback(error.message || 'Không thể tải danh sách khuyến mại.', 'error');
        promotionTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Không thể tải danh sách khuyến mại.</td>
            </tr>
        `;
    }
};

const formatBlogPostDate = (value, fallback = 'Chưa đặt ngày') => {
    if (!value) {
        return fallback;
    }

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};

const getBlogPostStatusMeta = (post) => {
    const isPublished = post?.status === 'published' || post?.isPublished;

    return isPublished
        ? { label: 'Đã xuất bản', className: 'is-approved' }
        : { label: 'Bản nháp', className: 'is-pending' };
};

const updateBlogPostStats = () => {
    const stats = blogPostStats || {};
    const fallbackTotal = blogPosts.length;
    const fallbackPublished = blogPosts.filter((post) => post.status === 'published' || post.isPublished).length;
    const fallbackFeatured = blogPosts.filter((post) => post.featured).length;
    const fallbackHomeVisible = blogPosts.filter((post) => post.showOnHome).length;
    const total = Number(stats.total ?? fallbackTotal);
    const published = Number(stats.published ?? fallbackPublished);
    const featured = Number(stats.featured ?? fallbackFeatured);
    const homeVisible = Number(stats.homeVisible ?? fallbackHomeVisible);
    const draft = Number(stats.draft ?? Math.max(0, total - published));

    if (blogPostStatTotal) {
        blogPostStatTotal.textContent = String(total);
    }
    if (blogPostStatPublished) {
        blogPostStatPublished.textContent = String(published);
    }
    if (blogPostStatFeatured) {
        blogPostStatFeatured.textContent = String(featured);
    }
    if (blogPostStatHome) {
        blogPostStatHome.textContent = String(homeVisible);
    }
    if (blogPostStatDraft) {
        blogPostStatDraft.textContent = String(draft);
    }
};

const getFilteredBlogPosts = () => {
    const keyword = normalizeSearchValue(blogPostSearchInput?.value || '');

    if (!keyword) {
        return blogPosts;
    }

    return blogPosts.filter((post) =>
        normalizeSearchValue([
            post.title,
            post.slug,
            post.category,
            post.excerpt,
            post.content,
            post.authorName,
            post.author
        ].join(' ')).includes(keyword)
    );
};

const renderBlogPosts = () => {
    updateBlogPostStats();

    if (!blogPostTableBody) {
        return;
    }

    const filteredPosts = getFilteredBlogPosts();

    if (!filteredPosts.length) {
        blogPostTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">Chưa có bài viết blog phù hợp.</td>
            </tr>
        `;
        return;
    }

    blogPostTableBody.innerHTML = filteredPosts.map((post) => {
        const imageHtml = post.imageUrl || post.image
            ? `<img src="${escapeHtml(post.imageUrl || post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}">`
            : '<i class="bx bxs-news" aria-hidden="true"></i>';
        const statusMeta = getBlogPostStatusMeta(post);
        const publishedText = formatBlogPostDate(post.publishedAt);
        const createdText = post.createdAt
            ? dateFormatter.format(new Date(post.createdAt))
            : 'Chưa rõ';
        const authorName = post.authorName || post.author || 'Ban biên tập OkXe';
        const homeChipHtml = post.showOnHome
            ? '<span class="blog-post-home-chip"><i class="bx bxs-home" aria-hidden="true"></i>Hiển thị Home</span>'
            : '';

        return `
            <tr>
                <td>
                    <div class="promotion-title-cell blog-post-title-cell">
                        <span class="promotion-thumb blog-post-thumb">${imageHtml}</span>
                        <div class="promotion-copy blog-post-copy">
                            <span>${escapeHtml(post.category || 'Chưa có chủ đề')} · /blog/${escapeHtml(post.slug || '')}</span>
                            <strong>${escapeHtml(post.title || 'Bài viết chưa có tiêu đề')}</strong>
                            ${homeChipHtml}
                            <small>${escapeHtml(post.excerpt || 'Chưa có mô tả ngắn')}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="blog-post-author-stack">
                        <strong>${escapeHtml(authorName)}</strong>
                        <span>Tạo ${escapeHtml(createdText)}</span>
                    </div>
                </td>
                <td>
                    <div class="test-drive-status-cell">
                        <span class="test-drive-status-badge ${statusMeta.className}">${escapeHtml(statusMeta.label)}</span>
                        <small>${escapeHtml(publishedText)} · ${Number(post.readTime || 5)} phút đọc</small>
                    </div>
                </td>
                <td>
                    <button type="button" class="homepage-toggle${post.showOnHome ? ' is-active' : ''}" data-toggle-blog-home="${post.id}" aria-pressed="${post.showOnHome ? 'true' : 'false'}">
                        <i class="bx ${post.showOnHome ? 'bxs-home' : 'bx-home-alt'}" aria-hidden="true"></i>
                        <span>${post.showOnHome ? 'Đang ở Home' : 'Đưa lên Home'}</span>
                    </button>
                </td>
                <td>
                    <button type="button" class="homepage-toggle${post.featured ? ' is-active' : ''}" data-toggle-blog-featured="${post.id}" aria-pressed="${post.featured ? 'true' : 'false'}">
                        <i class="bx ${post.featured ? 'bxs-star' : 'bx-star'}" aria-hidden="true"></i>
                        <span>${post.featured ? 'Đang nổi bật' : 'Đưa nổi bật'}</span>
                    </button>
                    <span class="homepage-order">Thứ tự ${Number(post.displayOrder || 0)}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-blog-post="${post.id}" aria-label="Sửa ${escapeHtml(post.title)}" title="Sửa bài">
                            <i class="bx bx-pencil"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--delete" data-delete-blog-post="${post.id}" aria-label="Xóa ${escapeHtml(post.title)}" title="Xóa bài">
                            <i class="bx bx-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const loadBlogPosts = async () => {
    if (!blogPostTableBody) {
        return;
    }

    setBlogPostFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/blog-posts');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách bài viết blog.');
        }

        blogPosts = data.posts || [];
        blogPostStats = data.stats || blogPostStats;
        renderBlogPosts();
    } catch (error) {
        setBlogPostFeedback(error.message || 'Không thể tải danh sách bài viết blog.', 'error');
        blogPostTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">Không thể tải danh sách bài viết blog.</td>
            </tr>
        `;
    }
};

const getTestDriveStatusLabel = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    if (normalizedStatus === 'confirmed') {
        return testDriveStatusConfig.approved.label;
    }

    if (normalizedStatus === 'done') {
        return testDriveStatusConfig.approved.label;
    }

    return testDriveStatusConfig[normalizedStatus]?.label || testDriveStatusConfig.pending.label;
};

const getTestDriveStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    if (normalizedStatus === 'confirmed' || normalizedStatus === 'done') {
        return testDriveStatusConfig.approved.className;
    }

    return testDriveStatusConfig[normalizedStatus]?.className || testDriveStatusConfig.pending.className;
};

const updateTestDriveStats = () => {
    const total = testDriveAppointments.length;
    const approved = testDriveAppointments.filter((appointment) =>
        ['approved', 'confirmed', 'done'].includes(String(appointment.status || '').trim().toLowerCase())
    ).length;
    const cancelled = testDriveAppointments.filter((appointment) =>
        String(appointment.status || '').trim().toLowerCase() === 'cancelled'
    ).length;
    const pending = Math.max(0, total - approved - cancelled);

    if (testDriveStatTotal) {
        testDriveStatTotal.textContent = String(total);
    }
    if (testDriveStatApproved) {
        testDriveStatApproved.textContent = String(approved);
    }
    if (testDriveStatCancelled) {
        testDriveStatCancelled.textContent = String(cancelled);
    }
    if (testDriveStatPending) {
        testDriveStatPending.textContent = String(pending);
    }

    if (testDriveStatsChart) {
        const approvedDeg = total ? (approved / total) * 360 : 0;
        const cancelledDeg = total ? (cancelled / total) * 360 : 0;
        const pendingDeg = total ? (pending / total) * 360 : 0;
        const approvedEnd = approvedDeg;
        const cancelledEnd = approvedDeg + cancelledDeg;
        const pendingEnd = approvedDeg + cancelledDeg + pendingDeg;

        testDriveStatsChart.style.background = total
            ? `conic-gradient(
                var(--test-drive-approved) 0deg ${approvedEnd}deg,
                var(--test-drive-cancelled) ${approvedEnd}deg ${cancelledEnd}deg,
                var(--test-drive-pending) ${cancelledEnd}deg ${pendingEnd}deg,
                var(--test-drive-empty) ${pendingEnd}deg 360deg
            )`
            : 'conic-gradient(var(--test-drive-empty) 0deg 360deg)';
        testDriveStatsChart.setAttribute(
            'aria-label',
            total
                ? `Biểu đồ lịch hẹn lái thử: ${approved} đồng ý, ${cancelled} hủy, ${pending} chờ xử lý trong tổng ${total} lượt đăng ký.`
                : 'Biểu đồ lịch hẹn lái thử chưa có dữ liệu.'
        );
    }
};

const setTestDriveStatusFeedback = (message, type = 'success') => {
    if (!testDriveStatusFeedback) {
        return;
    }

    testDriveStatusFeedback.textContent = message || '';
    testDriveStatusFeedback.className = 'admin-feedback';

    if (message) {
        testDriveStatusFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const formatTestDriveDate = (value, fallback = 'Chưa rõ') => {
    if (!value) {
        return fallback;
    }

    const date = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};

const getTodayInputValue = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatTestDriveSchedule = (appointment = {}) => {
    const dateText = formatTestDriveDate(appointment.preferredDate);
    const timeText = String(appointment.preferredTimeSlot || '').trim();

    return timeText ? `${dateText} - ${timeText}` : dateText;
};

const isTestDriveScheduleConflictNote = (statusNote = '') => {
    const normalizedNote = normalizeSearchValue(statusNote);

    return normalizedNote.includes('khach hang khac dang ky')
        || normalizedNote.includes('trung lich')
        || normalizedNote.includes('da co lich');
};

const shouldRequireTestDriveReschedule = (appointment = {}) =>
    activeTestDriveStatus === 'approved'
    && String(appointment.status || '').trim().toLowerCase() === 'pending'
    && isTestDriveScheduleConflictNote(appointment.statusNote);

const syncTestDriveRescheduleFields = () => {
    if (!testDriveRescheduleFields) {
        return;
    }

    const appointment = getTestDriveAppointment(activeTestDriveAppointmentId);
    const needsReschedule = shouldRequireTestDriveReschedule(appointment);

    testDriveRescheduleFields.hidden = !needsReschedule;

    if (testDriveNewDateInput) {
        testDriveNewDateInput.required = needsReschedule;
        testDriveNewDateInput.min = getTodayInputValue();
    }

    if (testDriveNewTimeSlotInput) {
        testDriveNewTimeSlotInput.required = needsReschedule;
    }
};

const getTestDriveAppointment = (appointmentId) =>
    testDriveAppointments.find((appointment) => String(appointment.id) === String(appointmentId));

const setActiveTestDriveStatus = (status) => {
    activeTestDriveStatus = testDriveStatusConfig[status] ? status : 'pending';

    testDriveStatusOptionButtons.forEach((button) => {
        const isActive = button.dataset.statusOption === activeTestDriveStatus;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    if (testDriveStatusNote) {
        const needsReason = ['cancelled', 'pending'].includes(activeTestDriveStatus);
        testDriveStatusNote.required = needsReason;
        testDriveStatusNote.placeholder = needsReason
            ? 'Nhập lý do để gửi cho khách hàng...'
            : 'Ghi chú thêm cho khách hàng nếu cần...';
    }

    syncTestDriveRescheduleFields();
};

const openTestDriveStatusPanel = (appointment) => {
    if (!testDriveStatusPanel || !appointment) {
        return;
    }

    const carTitle = [appointment.carBrand, appointment.carName].filter(Boolean).join(' ') || 'Xe đã chọn';

    activeTestDriveAppointmentId = appointment.id;
    if (testDriveStatusTitle) {
        testDriveStatusTitle.textContent = `Cập nhật trạng thái #${appointment.id}`;
    }
    if (testDriveStatusSummary) {
        testDriveStatusSummary.textContent = `${appointment.fullName || 'Khách hàng'} - ${carTitle} - ${formatTestDriveSchedule(appointment)}`;
    }
    if (testDriveStatusNote) {
        testDriveStatusNote.value = appointment.statusNote || '';
    }
    if (testDriveNewDateInput) {
        testDriveNewDateInput.value = '';
        testDriveNewDateInput.min = getTodayInputValue();
    }
    if (testDriveNewTimeSlotInput) {
        testDriveNewTimeSlotInput.value = '';
    }

    setActiveTestDriveStatus(
        testDriveStatusConfig[String(appointment.status || '').trim().toLowerCase()]
            ? String(appointment.status || '').trim().toLowerCase()
            : 'pending'
    );
    setTestDriveStatusFeedback('');
    testDriveStatusPanel.hidden = false;
    testDriveStatusPanel.setAttribute('aria-hidden', 'false');
    testDriveStatusPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(testDriveStatusCloseTimer);
    window.requestAnimationFrame(() => {
        testDriveStatusPanel.classList.add('is-visible');
    });
};

const closeTestDriveStatusPanel = () => {
    if (!testDriveStatusPanel) {
        return;
    }

    testDriveStatusPanel.classList.remove('is-visible');
    testDriveStatusPanel.classList.add('is-closing');
    testDriveStatusPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeTestDriveAppointmentId = null;
    window.clearTimeout(testDriveStatusCloseTimer);
    testDriveStatusCloseTimer = window.setTimeout(() => {
        testDriveStatusPanel.hidden = true;
        testDriveStatusPanel.classList.remove('is-closing');
    }, 280);
};

const setTestDriveStatusLoading = (isLoading) => {
    if (!testDriveStatusSaveButton) {
        return;
    }

    testDriveStatusSaveButton.disabled = isLoading;
    testDriveStatusSaveButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang cập nhật...</span>'
        : '<i class="bx bx-save"></i><span>Cập nhật trạng thái</span>';
};

const openConsultationStatusPanel = (request) => {
    if (!consultationStatusPanel || !request) {
        return;
    }

    const carTitle = getDisplayCarTitle(request.carBrand, request.carName, 'Xe đã chọn');
    const status = consultationStatusConfig[String(request.status || '').trim().toLowerCase()]
        ? String(request.status || '').trim().toLowerCase()
        : 'new';

    activeConsultationRequestId = request.id;

    if (consultationStatusTitle) {
        consultationStatusTitle.textContent = `Cập nhật yêu cầu #${request.id}`;
    }

    if (consultationStatusSummary) {
        consultationStatusSummary.textContent = `${request.fullName || 'Khách hàng'} - ${carTitle} - ${getConsultationTypeLabel(request.requestType)}`;
    }

    if (consultationStatusSelect) {
        consultationStatusSelect.value = status;
    }

    if (consultationStatusNote) {
        consultationStatusNote.value = request.statusNote || '';
    }

    setConsultationStatusFeedback('');
    consultationStatusPanel.hidden = false;
    consultationStatusPanel.setAttribute('aria-hidden', 'false');
    consultationStatusPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(consultationStatusCloseTimer);
    window.requestAnimationFrame(() => {
        consultationStatusPanel.classList.add('is-visible');
        consultationStatusSelect?.focus();
    });
};

const closeConsultationStatusPanel = () => {
    if (!consultationStatusPanel) {
        return;
    }

    consultationStatusPanel.classList.remove('is-visible');
    consultationStatusPanel.classList.add('is-closing');
    consultationStatusPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeConsultationRequestId = null;
    window.clearTimeout(consultationStatusCloseTimer);
    consultationStatusCloseTimer = window.setTimeout(() => {
        consultationStatusPanel.hidden = true;
        consultationStatusPanel.classList.remove('is-closing');
    }, 280);
};

const syncDepositOrderStatusNoteField = () => {
    if (!depositOrderStatusNote) {
        return;
    }

    const status = String(depositOrderStatusSelect?.value || '').trim().toLowerCase();
    const needsCancelledReason = status === 'cancelled' || status === 'cancelled_after_deposit';
    const needsPaymentConfirmation = status === 'confirmed';
    const needsRefundFields = status === 'cancelled_after_deposit';
    const isExpiredStatus = status === 'expired';
    const isCompletedStatus = status === 'completed';

    depositOrderStatusNote.required = needsCancelledReason;
    depositOrderStatusNote.placeholder = needsCancelledReason
        ? status === 'cancelled_after_deposit'
            ? 'Nhập lý do hủy giao dịch sau đặt cọc để gửi khách hàng...'
            : 'Nhập lý do hủy đơn đặt cọc để gửi khách hàng...'
        : isExpiredStatus
            ? 'Nhập ghi chú quá hạn giữ chỗ, ví dụ khách chưa chuyển khoản đúng hạn...'
            : isCompletedStatus
                ? 'Nhập ghi chú chốt giao dịch, ví dụ đã hoàn tất hồ sơ mua xe...'
                : 'Nhập ghi chú xác nhận đã nhận tiền hoặc hướng dẫn thanh toán nếu cần...';

    if (depositOrderConfirmationFields) {
        depositOrderConfirmationFields.hidden = !needsPaymentConfirmation;
    }

    if (depositOrderRefundFields) {
        depositOrderRefundFields.hidden = !needsRefundFields;
    }

    if (depositOrderPaymentReferenceInput) {
        depositOrderPaymentReferenceInput.required = needsPaymentConfirmation;
    }

    if (depositOrderPaymentReceivedAtInput) {
        depositOrderPaymentReceivedAtInput.required = needsPaymentConfirmation;

        if (needsPaymentConfirmation && !depositOrderPaymentReceivedAtInput.value) {
            depositOrderPaymentReceivedAtInput.value = formatDepositDateTimeInputValue();
        }

        if (!needsPaymentConfirmation) {
            depositOrderPaymentReceivedAtInput.value = '';
        }
    }

    if (depositOrderPaymentReferenceInput && !needsPaymentConfirmation) {
        depositOrderPaymentReferenceInput.value = '';
    }

    if (depositOrderPaymentConfirmationNoteInput && !needsPaymentConfirmation) {
        depositOrderPaymentConfirmationNoteInput.value = '';
    }

    if (depositOrderRefundAmountInput) {
        depositOrderRefundAmountInput.required = needsRefundFields;
        if (needsRefundFields && !depositOrderRefundAmountInput.value) {
            const order = getDepositOrder(activeDepositOrderId);
            depositOrderRefundAmountInput.value = order?.refundAmount || order?.depositAmount || 0;
        }
        if (!needsRefundFields) {
            depositOrderRefundAmountInput.value = '';
        }
    }

    if (depositOrderRefundReferenceInput) {
        depositOrderRefundReferenceInput.required =
            needsRefundFields && Number(depositOrderRefundAmountInput?.value || 0) > 0;
        if (!needsRefundFields) {
            depositOrderRefundReferenceInput.value = '';
        }
    }

    if (depositOrderRefundCompletedAtInput) {
        depositOrderRefundCompletedAtInput.required =
            needsRefundFields && Number(depositOrderRefundAmountInput?.value || 0) > 0;
        if (needsRefundFields && !depositOrderRefundCompletedAtInput.value && Number(depositOrderRefundAmountInput?.value || 0) > 0) {
            depositOrderRefundCompletedAtInput.value = formatDepositDateTimeInputValue();
        }
        if (!needsRefundFields) {
            depositOrderRefundCompletedAtInput.value = '';
        }
    }

    if (depositOrderRefundNoteInput && !needsRefundFields) {
        depositOrderRefundNoteInput.value = '';
    }
};

const syncDepositOrderStatusOptions = (status) => {
    if (!depositOrderStatusSelect) {
        return;
    }

    const normalizedStatus = String(status || 'pending').trim().toLowerCase();
    const allowedStatuses = getAllowedDepositOrderStatusOptions(normalizedStatus);

    Array.from(depositOrderStatusSelect.options).forEach((option) => {
        option.disabled = !allowedStatuses.has(option.value);
    });

    if (!allowedStatuses.has(depositOrderStatusSelect.value)) {
        depositOrderStatusSelect.value = normalizedStatus;
    }
};

const canUploadDepositOrderProof = (order = {}) =>
    String(order.status || '').trim().toLowerCase() === 'confirmed';

const renderDepositOrderProofPreview = (order = {}) => {
    if (!depositOrderProofPreview) {
        return;
    }

    const proofUrl = String(order.transferProofUrl || '').trim();
    const canUploadProof = canUploadDepositOrderProof(order);
    const uploadControlHtml = canUploadProof
        ? `
            <button type="button" class="deposit-order-proof-upload-button" data-admin-deposit-proof-choose="${escapeHtml(order.id)}">
                <i class="bx bx-upload" aria-hidden="true"></i>
                <span>${proofUrl ? 'Thay biên lai' : 'Tải biên lai thay khách'}</span>
            </button>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-admin-deposit-proof-input="${escapeHtml(order.id)}">
            <small data-admin-deposit-proof-feedback="${escapeHtml(order.id)}" aria-live="polite"></small>
        `
        : '<small>Chỉ đơn đã nhận tiền mới được tải biên lai.</small>';

    if (!proofUrl) {
        depositOrderProofPreview.hidden = false;
        depositOrderProofPreview.innerHTML = `
            <div>
                <strong>Chưa có chứng từ chuyển khoản</strong>
                <span>${canUploadProof ? 'Có thể tải biên lai sau khi đã xác nhận nhận tiền.' : 'Đơn chưa ở trạng thái đã nhận tiền.'}</span>
                ${uploadControlHtml}
            </div>
        `;
        return;
    }

    depositOrderProofPreview.hidden = false;
    depositOrderProofPreview.innerHTML = `
        <a href="${escapeHtml(proofUrl)}" target="_blank" rel="noopener" class="deposit-order-proof-preview__thumb">
            <img src="${escapeHtml(proofUrl)}" alt="Chứng từ chuyển khoản ${escapeHtml(order.code || '')}">
        </a>
        <div>
            <strong>${escapeHtml(order.transferProofFileName || 'Chứng từ chuyển khoản')}</strong>
            <span>Khách tải lên ${escapeHtml(formatDepositAuditDate(order.transferProofUploadedAt, 'chưa rõ thời gian'))}</span>
            <a href="${escapeHtml(proofUrl)}" target="_blank" rel="noopener">Mở ảnh chứng từ</a>
            ${uploadControlHtml}
        </div>
    `;
};

const setAdminDepositProofFeedback = (orderId, message = '', type = '') => {
    document.querySelectorAll(`[data-admin-deposit-proof-feedback="${escapeSelectorValue(orderId)}"]`).forEach((feedback) => {
        feedback.textContent = message || '';
        feedback.className = type ? `is-${type}` : '';
    });
};

const syncAdminDepositOrderProofUi = async (orderId) => {
    await loadDepositOrders();
    const updatedOrder = getDepositOrder(orderId);

    if (!updatedOrder) {
        return;
    }

    if (!depositOrderStatusPanel?.hidden && String(activeDepositOrderId || '') === String(orderId || '')) {
        renderDepositOrderProofPreview(updatedOrder);
    }

    if (!customerDetailPanel?.hidden && customerDetailEyebrow?.textContent === 'Đơn đặt cọc') {
        openDepositOrderDetail(updatedOrder);
    }
};

const openDepositOrderStatusPanel = (order) => {
    if (!depositOrderStatusPanel || !order) {
        return;
    }

    const status = depositOrderStatusConfig[String(order.status || '').trim().toLowerCase()]
        ? String(order.status || '').trim().toLowerCase()
        : 'pending';
    const carTitle = getDisplayCarTitle(order.carBrand, order.carName, 'Xe đặt cọc');

    activeDepositOrderId = order.id;

    if (depositOrderStatusTitle) {
        depositOrderStatusTitle.textContent = `Cập nhật ${order.code || `#${order.id}`}`;
    }

    if (depositOrderStatusSummary) {
        depositOrderStatusSummary.textContent = `${order.fullName || 'Khách hàng'} - ${carTitle} - ${formatCompactPrice(order.depositAmount || 0)}`;
    }

    if (depositOrderStatusSelect) {
        depositOrderStatusSelect.value = status;
        syncDepositOrderStatusOptions(status);
    }

    if (depositOrderStatusNote) {
        depositOrderStatusNote.value = order.statusNote || '';
    }

    if (depositOrderPaymentReferenceInput) {
        depositOrderPaymentReferenceInput.value = order.paymentReference || '';
    }

    if (depositOrderPaymentReceivedAtInput) {
        depositOrderPaymentReceivedAtInput.value = order.paymentReceivedAt
            ? formatDepositDateTimeInputValue(order.paymentReceivedAt)
            : '';
    }

    if (depositOrderPaymentConfirmationNoteInput) {
        depositOrderPaymentConfirmationNoteInput.value = order.paymentConfirmationNote || '';
    }

    if (depositOrderRefundAmountInput) {
        depositOrderRefundAmountInput.value = order.refundAmount || '';
    }

    if (depositOrderRefundReferenceInput) {
        depositOrderRefundReferenceInput.value = order.refundReference || '';
    }

    if (depositOrderRefundCompletedAtInput) {
        depositOrderRefundCompletedAtInput.value = order.refundCompletedAt
            ? formatDepositDateTimeInputValue(order.refundCompletedAt)
            : '';
    }

    if (depositOrderRefundNoteInput) {
        depositOrderRefundNoteInput.value = order.refundNote || '';
    }

    renderDepositOrderProofPreview(order);
    syncDepositOrderStatusNoteField();
    setDepositOrderStatusFeedback('');
    depositOrderStatusPanel.hidden = false;
    depositOrderStatusPanel.setAttribute('aria-hidden', 'false');
    depositOrderStatusPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(depositOrderStatusCloseTimer);
    window.requestAnimationFrame(() => {
        depositOrderStatusPanel.classList.add('is-visible');
        depositOrderStatusSelect?.focus();
    });
};

const closeDepositOrderStatusPanel = () => {
    if (!depositOrderStatusPanel) {
        return;
    }

    depositOrderStatusPanel.classList.remove('is-visible');
    depositOrderStatusPanel.classList.add('is-closing');
    depositOrderStatusPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeDepositOrderId = null;
    window.clearTimeout(depositOrderStatusCloseTimer);
    depositOrderStatusCloseTimer = window.setTimeout(() => {
        depositOrderStatusPanel.hidden = true;
        depositOrderStatusPanel.classList.remove('is-closing');
    }, 280);
};

const syncCarBuyRequestStatusNoteField = () => {
    if (!carBuyRequestStatusNote) {
        return;
    }

    const status = String(carBuyRequestStatusSelect?.value || '').trim().toLowerCase();
    const needsRejectedReason = status === 'rejected';

    carBuyRequestStatusNote.required = needsRejectedReason;
    carBuyRequestStatusNote.placeholder = needsRejectedReason
        ? 'Nhập lý do từ chối tin mua xe...'
        : 'Nhập ghi chú xử lý nội bộ nếu cần...';
};

const openCarBuyRequestStatusPanel = (request) => {
    if (!carBuyRequestStatusPanel || !request) {
        return;
    }

    const status = carBuyRequestStatusConfig[String(request.status || '').trim().toLowerCase()]
        ? String(request.status || '').trim().toLowerCase()
        : 'pending';

    activeCarBuyRequestId = request.id;
    activeCarBuyRequestOriginalStatus = status;
    activeCarBuyRequestOriginalRejectedNote = status === 'rejected'
        ? String(request.statusNote || '').trim()
        : '';

    if (carBuyRequestStatusTitle) {
        carBuyRequestStatusTitle.textContent = `Cập nhật ${request.code || `#${request.id}`}`;
    }

    if (carBuyRequestStatusSummary) {
        carBuyRequestStatusSummary.textContent = `${request.fullName || 'Khách hàng'} - ${request.title || 'Tin mua xe'} - ${getCarBuyRequestBudgetLabel(request.budgetRange)}`;
    }

    if (carBuyRequestStatusSelect) {
        carBuyRequestStatusSelect.value = status;
    }

    if (carBuyRequestStatusNote) {
        carBuyRequestStatusNote.value = request.statusNote || '';
    }

    syncCarBuyRequestStatusNoteField();
    setCarBuyRequestStatusFeedback('');
    carBuyRequestStatusPanel.hidden = false;
    carBuyRequestStatusPanel.setAttribute('aria-hidden', 'false');
    carBuyRequestStatusPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(carBuyRequestStatusCloseTimer);
    window.requestAnimationFrame(() => {
        carBuyRequestStatusPanel.classList.add('is-visible');
        carBuyRequestStatusSelect?.focus();
    });
};

const closeCarBuyRequestStatusPanel = () => {
    if (!carBuyRequestStatusPanel) {
        return;
    }

    carBuyRequestStatusPanel.classList.remove('is-visible');
    carBuyRequestStatusPanel.classList.add('is-closing');
    carBuyRequestStatusPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeCarBuyRequestId = null;
    activeCarBuyRequestOriginalStatus = 'pending';
    activeCarBuyRequestOriginalRejectedNote = '';
    window.clearTimeout(carBuyRequestStatusCloseTimer);
    carBuyRequestStatusCloseTimer = window.setTimeout(() => {
        carBuyRequestStatusPanel.hidden = true;
        carBuyRequestStatusPanel.classList.remove('is-closing');
    }, 280);
};

const syncCarSellRequestStatusNoteField = () => {
    if (!carSellRequestStatusNote) {
        return;
    }

    const status = String(carSellRequestStatusSelect?.value || '').trim().toLowerCase();
    const needsRejectedReason = status === 'rejected';
    const needsFinalPrice = status === 'approved';

    carSellRequestStatusNote.required = needsRejectedReason;
    carSellRequestStatusNote.placeholder = needsRejectedReason
        ? 'Nhập lý do từ chối để gửi khách hàng...'
        : 'Nhập ghi chú khi duyệt nhập kho nếu cần...';

    if (carSellRequestFinalPriceFields) {
        carSellRequestFinalPriceFields.hidden = !needsFinalPrice;
    }

    if (carSellRequestFinalPriceTextInput) {
        carSellRequestFinalPriceTextInput.required = needsFinalPrice;
    }

    if (carSellRequestFinalPriceValueInput) {
        carSellRequestFinalPriceValueInput.required = needsFinalPrice;
    }

    if (carSellRequestCustomerDealPriceTextInput) {
        carSellRequestCustomerDealPriceTextInput.required = needsFinalPrice;
    }

    if (carSellRequestCustomerDealPriceValueInput) {
        carSellRequestCustomerDealPriceValueInput.required = needsFinalPrice;
    }
};

const openCarSellRequestStatusPanel = (request) => {
    if (!carSellRequestStatusPanel || !request) {
        return;
    }

    activeCarSellRequestId = request.id;

    if (carSellRequestStatusTitle) {
        carSellRequestStatusTitle.textContent = `Xử lý ${request.code || `#${request.id}`}`;
    }

    if (carSellRequestStatusSummary) {
        const carTitle = [request.brand, request.name, request.year].filter(Boolean).join(' ');
        const desiredPriceText = request.price || (request.priceValue ? formatCompactPrice(request.priceValue) : 'Chưa có giá khách mong muốn');
        carSellRequestStatusSummary.textContent = `${request.fullName || 'Khách hàng'} - ${carTitle || 'Xe cần bán'} - Khách mong muốn: ${desiredPriceText} - ${request.phone || 'Chưa có SĐT'}`;
    }

    if (carSellRequestStatusSelect) {
        carSellRequestStatusSelect.value = 'approved';
    }

    if (carSellRequestStatusNote) {
        carSellRequestStatusNote.value = '';
    }

    if (carSellRequestCustomerDealPriceTextInput) {
        carSellRequestCustomerDealPriceTextInput.value = request.customerDealPrice || '';
    }

    if (carSellRequestCustomerDealPriceValueInput) {
        carSellRequestCustomerDealPriceValueInput.value = request.customerDealPriceValue || '';
    }

    if (carSellRequestFinalPriceTextInput) {
        carSellRequestFinalPriceTextInput.value = request.finalPrice || '';
    }

    if (carSellRequestFinalPriceValueInput) {
        carSellRequestFinalPriceValueInput.value = request.finalPriceValue || '';
    }

    syncCarSellRequestStatusNoteField();
    setCarSellRequestStatusFeedback('');
    carSellRequestStatusPanel.hidden = false;
    carSellRequestStatusPanel.setAttribute('aria-hidden', 'false');
    carSellRequestStatusPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(carSellRequestStatusCloseTimer);
    window.requestAnimationFrame(() => {
        carSellRequestStatusPanel.classList.add('is-visible');
        carSellRequestStatusSelect?.focus();
    });
};

const closeCarSellRequestStatusPanel = () => {
    if (!carSellRequestStatusPanel) {
        return;
    }

    carSellRequestStatusPanel.classList.remove('is-visible');
    carSellRequestStatusPanel.classList.add('is-closing');
    carSellRequestStatusPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeCarSellRequestId = null;
    window.clearTimeout(carSellRequestStatusCloseTimer);
    carSellRequestStatusCloseTimer = window.setTimeout(() => {
        carSellRequestStatusPanel.hidden = true;
        carSellRequestStatusPanel.classList.remove('is-closing');
    }, 280);
};

const getFilteredTestDriveAppointments = () => {
    const keyword = String(testDriveSearchInput?.value || '').trim().toLowerCase();

    if (!keyword) {
        return testDriveAppointments;
    }

    return testDriveAppointments.filter((appointment) =>
        [
            appointment.fullName,
            appointment.phone,
            appointment.userEmail,
            appointment.carBrand,
            appointment.carName,
            appointment.carPrice,
            appointment.preferredDate,
            appointment.preferredTimeSlot,
            getTestDriveStatusLabel(appointment.status)
        ].join(' ').toLowerCase().includes(keyword)
    );
};

const isProcessedTestDriveAppointment = (appointment = {}) =>
    ['approved', 'confirmed', 'done', 'cancelled'].includes(
        String(appointment.status || '').trim().toLowerCase()
    );

const renderTestDriveAppointmentRows = (appointments = [], emptyMessage = 'Chưa có lịch hẹn lái thử phù hợp.') => {
    if (!appointments.length) {
        return `
            <tr>
                <td colspan="5" class="table-empty">${escapeHtml(emptyMessage)}</td>
            </tr>
        `;
    }

    return appointments.map((appointment) => {
        const carTitle = [appointment.carBrand, appointment.carName].filter(Boolean).join(' ');
        const customerInitial = String(appointment.fullName || appointment.userEmail || 'K')
            .trim()
            .charAt(0)
            .toLocaleUpperCase('vi-VN');
        const customerAvatar = appointment.userAvatarUrl
            ? `<img src="${escapeHtml(appointment.userAvatarUrl)}" alt="Ảnh khách hàng ${escapeHtml(appointment.fullName || appointment.userEmail || '')}">`
            : `<span>${escapeHtml(customerInitial || 'K')}</span>`;
        const statusLabel = getTestDriveStatusLabel(appointment.status);
        const displayStatusLabel = String(appointment.status || '').trim().toLowerCase() === 'pending' && appointment.statusNote
            ? 'Treo'
            : statusLabel;
        const statusClass = getTestDriveStatusClass(appointment.status);

        return `
            <tr>
                <td>
                    <div class="test-drive-customer-cell">
                        <span class="test-drive-customer-avatar">${customerAvatar}</span>
                        <span class="employee-meta">
                            <strong>${escapeHtml(appointment.fullName || 'Chưa có tên')}</strong>
                            <span>${escapeHtml(appointment.phone || 'Chưa có SĐT')}</span>
                            <small>${escapeHtml(appointment.userEmail || 'Chưa có email')}</small>
                        </span>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(carTitle || 'Xe không còn trong kho')}</strong>
                        <small>ID xe: ${appointment.carId ? escapeHtml(appointment.carId) : 'Không còn liên kết'}</small>
                    </div>
                </td>
                <td>
                    <strong>${escapeHtml(formatTestDriveDate(appointment.preferredDate))}</strong>
                    <small>${escapeHtml(appointment.preferredTimeSlot || 'Chưa chọn giờ')}</small>
                </td>
                <td>
                    <div class="test-drive-status-cell">
                        <span class="readonly-badge test-drive-status-badge ${statusClass}">${escapeHtml(displayStatusLabel)}</span>
                        ${appointment.statusNote ? `<small>${escapeHtml(appointment.statusNote)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-test-drive-status="${appointment.id}" aria-label="Cập nhật trạng thái lịch hẹn #${appointment.id}" title="Cập nhật trạng thái">
                            <i class="bx bx-edit-alt"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--delete" data-delete-test-drive="${appointment.id}" aria-label="Xóa lịch hẹn #${appointment.id}" title="Xóa lịch hẹn">
                            <i class="bx bx-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const renderTestDriveAppointments = () => {
    if (!testDriveTableBody || !testDriveProcessedTableBody) {
        return;
    }

    const filteredAppointments = getFilteredTestDriveAppointments();
    const pendingAppointments = filteredAppointments.filter((appointment) =>
        !isProcessedTestDriveAppointment(appointment)
    );
    const processedAppointments = filteredAppointments.filter(isProcessedTestDriveAppointment);

    testDriveTableBody.innerHTML = renderTestDriveAppointmentRows(
        pendingAppointments,
        'Không có lịch chờ xử lý phù hợp.'
    );
    testDriveProcessedTableBody.innerHTML = renderTestDriveAppointmentRows(
        processedAppointments,
        'Chưa có lịch đã xác nhận hoặc đã hủy phù hợp.'
    );
};

const loadTestDriveAppointments = async () => {
    if (!testDriveTableBody) {
        return;
    }

    setTestDriveFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/test-drive-appointments');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải lịch hẹn lái thử.');
        }

        testDriveAppointments = data.appointments || [];
        updateTestDriveStats();
        renderTestDriveAppointments();
    } catch (error) {
        setTestDriveFeedback(error.message || 'Không thể tải lịch hẹn lái thử.', 'error');
        testDriveTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Không thể tải lịch hẹn lái thử.</td>
            </tr>
        `;
        if (testDriveProcessedTableBody) {
            testDriveProcessedTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="table-empty">Không thể tải lịch đã xử lý.</td>
                </tr>
            `;
        }
    }
};

const getConsultationStatusLabel = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return consultationStatusConfig[normalizedStatus]?.label || consultationStatusConfig.new.label;
};

const getConsultationStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return consultationStatusConfig[normalizedStatus]?.className || consultationStatusConfig.new.className;
};

const getConsultationTypeLabel = (requestType) => {
    const normalizedType = String(requestType || '').trim().toLowerCase();

    return consultationTypeLabels[normalizedType] || consultationTypeLabels.consultation;
};

const formatConsultationDate = (value, fallback = 'Chưa rõ') => {
    if (!value) {
        return fallback;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};

const formatDepositDateTimeInputValue = (value = new Date()) => {
    const date = value instanceof Date ? value : new Date(String(value || '').replace(' ', 'T'));

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDepositAuditDate = (value, fallback = 'Chưa ghi nhận') =>
    formatConsultationDate(String(value || '').replace(' ', 'T'), fallback);

const updateConsultationStats = () => {
    const totalNew = consultationRequests.filter((request) =>
        String(request.status || '').trim().toLowerCase() === 'new'
    ).length;
    const totalContacted = consultationRequests.filter((request) =>
        String(request.status || '').trim().toLowerCase() === 'contacted'
    ).length;
    const totalAppointment = consultationRequests.filter((request) =>
        String(request.status || '').trim().toLowerCase() === 'appointment'
    ).length;
    const totalClosed = consultationRequests.filter((request) =>
        String(request.status || '').trim().toLowerCase() === 'closed'
    ).length;
    const totalFailed = consultationRequests.filter((request) =>
        String(request.status || '').trim().toLowerCase() === 'failed'
    ).length;

    if (consultationStatNew) {
        consultationStatNew.textContent = String(totalNew);
    }
    if (consultationStatContacted) {
        consultationStatContacted.textContent = String(totalContacted);
    }
    if (consultationStatAppointment) {
        consultationStatAppointment.textContent = String(totalAppointment);
    }
    if (consultationStatClosed) {
        consultationStatClosed.textContent = String(totalClosed);
    }
    if (consultationStatFailed) {
        consultationStatFailed.textContent = String(totalFailed);
    }
};

const getConsultationRequest = (requestId) =>
    consultationRequests.find((request) => String(request.id) === String(requestId));

const getFilteredConsultationRequests = () => {
    const keyword = normalizeSearchValue(consultationSearchInput?.value || '');
    const statusFilter = String(consultationStatusFilter?.value || '').trim().toLowerCase();

    return consultationRequests.filter((request) => {
        const status = String(request.status || '').trim().toLowerCase();

        if (statusFilter && status !== statusFilter) {
            return false;
        }

        if (!keyword) {
            return true;
        }

        return normalizeSearchValue([
            request.fullName,
            request.phone,
            request.email,
            request.userEmail,
            request.carBrand,
            request.carName,
            request.carPrice,
            getConsultationTypeLabel(request.requestType),
            getConsultationStatusLabel(request.status),
            request.preferredContactTime,
            request.note,
            request.statusNote
        ].join(' ')).includes(keyword);
    });
};

const renderConsultationRequests = () => {
    if (!consultationTableBody) {
        return;
    }

    const filteredRequests = getFilteredConsultationRequests();

    if (!filteredRequests.length) {
        consultationTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Chưa có yêu cầu tư vấn phù hợp.</td>
            </tr>
        `;
        return;
    }

    consultationTableBody.innerHTML = filteredRequests.map((request) => {
        const carTitle = getDisplayCarTitle(request.carBrand, request.carName);
        const customerInitial = String(request.fullName || request.email || request.userEmail || 'K')
            .trim()
            .charAt(0)
            .toLocaleUpperCase('vi-VN');
        const customerAvatar = request.userAvatarUrl
            ? `<img src="${escapeHtml(request.userAvatarUrl)}" alt="Ảnh khách hàng ${escapeHtml(request.fullName || request.email || '')}">`
            : `<span>${escapeHtml(customerInitial || 'K')}</span>`;
        const phoneHref = getPhoneHref(request.phone);
        const emailText = request.email || request.userEmail || '';
        const emailHref = getMailHref(emailText);
        const status = String(request.status || 'new').trim().toLowerCase();
        const statusClass = getConsultationStatusClass(status);
        const statusNotePreview = getShortNotePreview(request.statusNote);

        return `
            <tr data-view-consultation="${escapeHtml(request.id)}">
                <td>
                    <div class="test-drive-customer-cell">
                        <span class="test-drive-customer-avatar">${customerAvatar}</span>
                        <span class="employee-meta">
                            <strong>${escapeHtml(request.fullName || 'Chưa có tên')}</strong>
                            <span>${phoneHref ? `<a class="admin-inline-link" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(request.phone || 'Chưa có SĐT')}</a>` : escapeHtml(request.phone || 'Chưa có SĐT')}</span>
                            <small>${emailHref ? `<a class="admin-inline-link" href="mailto:${escapeHtml(emailHref)}">${escapeHtml(emailText)}</a>` : escapeHtml(emailText || 'Chưa có email')}</small>
                        </span>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(carTitle)}</strong>
                        <span>${escapeHtml(request.carPrice || 'Giá liên hệ')}</span>
                        <small>ID xe: ${request.carId ? escapeHtml(request.carId) : 'Không còn liên kết'}</small>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(getConsultationTypeLabel(request.requestType))}</strong>
                        <span>${escapeHtml(request.preferredContactTime || 'Chưa chọn thời gian')}</span>
                        <small>Tạo ${escapeHtml(formatConsultationDate(request.createdAt))}</small>
                    </div>
                </td>
                <td>
                    <div class="consultation-status-cell">
                        <span class="readonly-badge consultation-status-badge ${statusClass}">${escapeHtml(getConsultationStatusLabel(status))}</span>
                        ${statusNotePreview ? `<small class="consultation-status-note-preview">${escapeHtml(statusNotePreview)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-consultation-status="${escapeHtml(request.id)}" aria-label="Cập nhật trạng thái yêu cầu tư vấn #${escapeHtml(request.id)}" title="Cập nhật trạng thái">
                            <i class="bx bx-edit-alt"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--neutral" data-view-consultation="${escapeHtml(request.id)}" aria-label="Xem yêu cầu tư vấn #${escapeHtml(request.id)}" title="Xem chi tiết">
                            <i class="bx bx-show"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--delete" data-delete-consultation="${escapeHtml(request.id)}" aria-label="Xóa yêu cầu tư vấn #${escapeHtml(request.id)}" title="Xóa yêu cầu">
                            <i class="bx bx-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const loadConsultationRequests = async () => {
    if (!consultationTableBody) {
        return;
    }

    setConsultationFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/consultation-requests');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải yêu cầu tư vấn.');
        }

        consultationRequests = data.requests || [];
        updateConsultationStats();
        renderConsultationRequests();
    } catch (error) {
        setConsultationFeedback(error.message || 'Không thể tải yêu cầu tư vấn.', 'error');
        consultationTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Không thể tải yêu cầu tư vấn.</td>
            </tr>
        `;
    }
};

const openConsultationDetail = (request) => {
    if (!customerDetailPanel || !customerDetailBody || !request) {
        return;
    }

    const carTitle = getDisplayCarTitle(request.carBrand, request.carName);
    const createdDate = formatConsultationDate(request.createdAt);
    const updatedDate = formatConsultationDate(request.updatedAt);
    const phoneHref = getPhoneHref(request.phone);
    const emailText = request.email || request.userEmail || '';
    const emailHref = getMailHref(emailText);

    if (customerDetailEyebrow) {
        customerDetailEyebrow.textContent = 'Yêu cầu tư vấn';
    }

    if (customerDetailTitle) {
        customerDetailTitle.textContent = `Thông tin liên hệ #${request.id}`;
    }

    customerDetailBody.innerHTML = `
        <div class="customer-detail__profile">
            <span class="customer-detail__avatar"><i class="bx bx-phone-call"></i></span>
            <div>
                <h4>${escapeHtml(request.fullName || 'Chưa có tên')}</h4>
                <p>${escapeHtml(getConsultationTypeLabel(request.requestType))} · ${escapeHtml(getConsultationStatusLabel(request.status))} · Tạo ${escapeHtml(createdDate)}</p>
            </div>
        </div>
        <div class="customer-detail__grid">
            <div class="customer-detail__item">
                <span>Số điện thoại</span>
                <strong>${escapeHtml(request.phone || 'Chưa có SĐT')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Email</span>
                <strong>${escapeHtml(request.email || request.userEmail || 'Chưa có email')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Xe quan tâm</span>
                <strong>${escapeHtml(carTitle)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Giá xe</span>
                <strong>${escapeHtml(request.carPrice || 'Giá liên hệ')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Nhu cầu</span>
                <strong>${escapeHtml(getConsultationTypeLabel(request.requestType))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Muốn gọi lại</span>
                <strong>${escapeHtml(request.preferredContactTime || 'Chưa chọn thời gian')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Trạng thái</span>
                <strong>${escapeHtml(getConsultationStatusLabel(request.status))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Cập nhật</span>
                <strong>${escapeHtml(updatedDate)}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú khách hàng</span>
                <strong>${escapeHtml(request.note || 'Khách hàng chưa nhập ghi chú.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú xử lý</span>
                <strong>${escapeHtml(request.statusNote || 'Chưa có ghi chú xử lý.')}</strong>
            </div>
        </div>
    `;

    customerDetailPanel.hidden = false;
    customerDetailPanel.setAttribute('aria-hidden', 'false');
    customerDetailPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(customerDetailCloseTimer);
    window.requestAnimationFrame(() => {
        customerDetailPanel.classList.add('is-visible');
    });
};

const getDepositOrderStatusLabel = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return depositOrderStatusConfig[normalizedStatus]?.label || depositOrderStatusConfig.pending.label;
};

const getDepositOrderStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return depositOrderStatusConfig[normalizedStatus]?.className || depositOrderStatusConfig.pending.className;
};

const getDepositOrderDeadline = (order = {}) => {
    const expiresAt = String(order.expiresAt || '').trim();

    if (!expiresAt) {
        return null;
    }

    const date = new Date(expiresAt.replace(' ', 'T'));

    return Number.isNaN(date.getTime()) ? null : date;
};

const getDepositOrderHoursToExpire = (order = {}) => {
    const deadline = getDepositOrderDeadline(order);

    return deadline ? (deadline.getTime() - Date.now()) / 3600000 : Infinity;
};

const isDepositOrderDueSoon = (order = {}) => {
    const status = String(order.status || '').trim().toLowerCase();
    const hoursToExpire = getDepositOrderHoursToExpire(order);

    return status === 'pending'
        && !order.isOverdue
        && Number.isFinite(hoursToExpire)
        && hoursToExpire > 0
        && hoursToExpire <= 3;
};

const isDepositOrderMissingProof = (order = {}) =>
    String(order.status || '').trim().toLowerCase() === 'confirmed'
    && !String(order.transferProofUrl || '').trim();

const isDepositOrderReminded = (order = {}) =>
    Boolean(String(order.paymentReminderSentAt || '').trim());

const needsDepositOrderReconciliation = (order = {}) => {
    const status = String(order.status || '').trim().toLowerCase();
    const hasPaymentReference = Boolean(String(order.paymentReference || '').trim());
    const hasPaymentReceivedAt = Boolean(String(order.paymentReceivedAt || '').trim());
    const refundAmount = Number(order.refundAmount || 0);
    const hasRefundReference = Boolean(String(order.refundReference || '').trim());
    const hasRefundCompletedAt = Boolean(String(order.refundCompletedAt || '').trim());

    return status === 'pending'
        || (status === 'confirmed' && (!hasPaymentReference || !hasPaymentReceivedAt || isDepositOrderMissingProof(order)))
        || (status === 'cancelled_after_deposit' && refundAmount > 0 && (!hasRefundReference || !hasRefundCompletedAt));
};

const getDepositOrderPaymentMethodLabel = (paymentMethod) =>
    depositOrderPaymentMethodLabels[String(paymentMethod || '').trim()]
    || depositOrderPaymentMethodLabels.bank;

const getDepositOrder = (orderId) =>
    depositOrders.find((order) => String(order.id) === String(orderId));

const getDepositOrderExpiryPreview = (order = {}) => {
    const status = String(order.status || '').trim().toLowerCase();

    if (status === 'expired' && order.expiredAt) {
        return `Quá hạn: ${formatDepositAuditDate(order.expiredAt, 'Chưa rõ')}`;
    }

    if (status === 'pending' && order.expiresAt) {
        if (order.isOverdue) {
            return `Đã quá hạn: ${formatDepositAuditDate(order.expiresAt, 'Chưa rõ')}`;
        }

        return `${isDepositOrderDueSoon(order) ? 'Sắp quá hạn' : 'Hạn giữ chỗ'}: ${formatDepositAuditDate(order.expiresAt, 'Chưa rõ')}`;
    }

    return '';
};

const renderDepositOrderHistory = (history = []) => {
    const entries = Array.isArray(history) ? history : [];

    if (!entries.length) {
        return '<strong>Chưa có lịch sử xử lý.</strong>';
    }

    return `
        <div class="deposit-order-history-list">
            ${entries.map((entry) => {
                const previousLabel = entry.previousStatus
                    ? getDepositOrderStatusLabel(entry.previousStatus)
                    : '';
                const nextLabel = getDepositOrderStatusLabel(entry.nextStatus);
                const transitionText = entry.actionType === 'transfer_proof_uploaded'
                    ? 'Tải chứng từ chuyển khoản'
                    : entry.actionType === 'refund_recorded'
                        ? 'Ghi nhận hoàn cọc'
                    : entry.actionType === 'payment_reminder_sent'
                        ? 'Nhắc khách chuyển khoản'
                    : previousLabel
                        ? `${previousLabel} sang ${nextLabel}`
                        : `Tạo trạng thái ${nextLabel}`;
                const actorText = entry.actorName || (entry.actionType === 'auto_expired' ? 'Hệ thống OkXe' : 'OkXe');
                const noteText = String(entry.note || '').trim();

                return `
                    <article class="deposit-order-history-item">
                        <span>${escapeHtml(formatDepositAuditDate(entry.createdAt, 'Chưa rõ'))}</span>
                        <strong>${escapeHtml(transitionText)}</strong>
                        <small>${escapeHtml(actorText)}${noteText ? ` - ${escapeHtml(noteText)}` : ''}</small>
                    </article>
                `;
            }).join('')}
        </div>
    `;
};

const updateDepositOrderStats = () => {
    const pending = depositOrders.filter((order) => order.status === 'pending').length;
    const confirmed = depositOrders.filter((order) => ['confirmed', 'completed'].includes(order.status)).length;
    const cancelled = depositOrders.filter((order) =>
        ['cancelled', 'cancelled_after_deposit'].includes(order.status)).length;
    const expired = depositOrders.filter((order) => order.status === 'expired').length;

    if (depositOrderStatPending) {
        depositOrderStatPending.textContent = String(pending);
    }
    if (depositOrderStatConfirmed) {
        depositOrderStatConfirmed.textContent = String(confirmed);
    }
    if (depositOrderStatCancelled) {
        depositOrderStatCancelled.textContent = String(cancelled);
    }
    if (depositOrderStatExpired) {
        depositOrderStatExpired.textContent = String(expired);
    }
    if (depositOrderStatTotal) {
        depositOrderStatTotal.textContent = String(depositOrders.length);
    }

    updateDepositReport();
};

const updateDepositReport = () => {
    const receivedStatuses = new Set(['confirmed', 'completed', 'cancelled_after_deposit']);
    const receivedAmount = depositOrders
        .filter((order) => receivedStatuses.has(String(order.status || '').trim().toLowerCase()))
        .reduce((sum, order) => sum + Number(order.depositAmount || 0), 0);
    const refundAmount = depositOrders
        .reduce((sum, order) => sum + Number(order.refundAmount || 0), 0);
    const completedCount = depositOrders
        .filter((order) => order.status === 'completed').length;
    const pendingCount = depositOrders
        .filter((order) => order.status === 'pending').length;
    const missingProofCount = depositOrders
        .filter(isDepositOrderMissingProof).length;
    const dueSoonCount = depositOrders
        .filter(isDepositOrderDueSoon).length;
    const remindedCount = depositOrders
        .filter(isDepositOrderReminded).length;
    const reconciliationCount = depositOrders
        .filter(needsDepositOrderReconciliation).length;

    if (depositReportReceivedAmount) {
        depositReportReceivedAmount.textContent = formatCompactPrice(receivedAmount);
    }
    if (depositReportRefundAmount) {
        depositReportRefundAmount.textContent = formatCompactPrice(refundAmount);
    }
    if (depositReportNetAmount) {
        depositReportNetAmount.textContent = formatCompactPrice(Math.max(receivedAmount - refundAmount, 0));
    }
    if (depositReportCompletedCount) {
        depositReportCompletedCount.textContent = String(completedCount);
    }
    if (depositReportPendingCount) {
        depositReportPendingCount.textContent = String(pendingCount);
    }
    if (depositReportMissingProofCount) {
        depositReportMissingProofCount.textContent = String(missingProofCount);
    }
    if (depositReportDueSoonCount) {
        depositReportDueSoonCount.textContent = String(dueSoonCount);
    }
    if (depositReportRemindedCount) {
        depositReportRemindedCount.textContent = String(remindedCount);
    }
    if (depositReportReconciliationCount) {
        depositReportReconciliationCount.textContent = String(reconciliationCount);
    }
};

const renderDepositConfigSummary = (config = depositPaymentConfig) => {
    if (!depositConfigSummary || !config) {
        return;
    }

    const bank = config.bank || {};
    const deposit = config.deposit || {};
    const displayName = bank.displayName || [bank.accountName, bank.bankName].filter(Boolean).join(' - ') || 'Chưa cấu hình';
    const amountOptionsText = normalizeDepositAmountOptionsInput(deposit.amountOptions)
        .map(formatCompactPrice)
        .join(' · ');

    depositConfigSummary.innerHTML = `
        <div>
            <span>Tài khoản nhận cọc</span>
            <strong>${escapeHtml(displayName)}</strong>
            <small>${escapeHtml(bank.accountNumber || 'Chưa có số tài khoản')}</small>
        </div>
        <div>
            <span>Mức cọc</span>
            <strong>${escapeHtml(formatCompactPrice(deposit.defaultAmount || 0))}</strong>
            <small>${escapeHtml(amountOptionsText || 'Chưa cấu hình mức hiển thị')}</small>
        </div>
        <div>
            <span>Giữ xe</span>
            <strong>${escapeHtml(String(deposit.holdHours || 24))} giờ</strong>
            <small>${deposit.requireTransferProof ? 'Yêu cầu tải chứng từ' : 'Chứng từ là tùy chọn'}</small>
        </div>
        <div>
            <span>Chính sách</span>
            <strong>${escapeHtml(deposit.policyText ? 'Đang hiển thị cho khách' : 'Chưa nhập')}</strong>
            <small>${escapeHtml(deposit.policyText ? getShortNotePreview(deposit.policyText, 90) : 'Khách sẽ phải đồng ý trước khi gửi đơn')}</small>
        </div>
    `;
};

const fillDepositConfigForm = (config = depositPaymentConfig) => {
    if (!depositConfigForm || !config) {
        return;
    }

    const bank = config.bank || {};
    const deposit = config.deposit || {};
    const elements = depositConfigForm.elements;

    elements.accountName.value = bank.accountName || '';
    elements.bankName.value = bank.bankName || '';
    elements.accountNumber.value = bank.accountNumber || '';
    elements.branch.value = bank.branch || '';
    elements.transferPrefix.value = bank.transferPrefix || 'OKXE COC';
    elements.depositAmountOptions.value = getDepositAmountOptionsText(deposit.amountOptions);
    elements.defaultDepositAmount.value = deposit.defaultAmount || '';
    elements.minDepositAmount.value = deposit.minAmount || '';
    elements.maxDepositAmount.value = deposit.maxAmount || '';
    elements.holdHours.value = deposit.holdHours || 24;
    elements.requireTransferProof.checked = Boolean(deposit.requireTransferProof);
    if (elements.policyText) {
        elements.policyText.value = deposit.policyText || '';
    }
    renderDepositConfigSummary(config);
};

const getDepositConfigPayloadFromForm = () => {
    const elements = depositConfigForm?.elements;

    if (!elements) {
        return null;
    }

    return {
        accountName: String(elements.accountName.value || '').trim(),
        bankName: String(elements.bankName.value || '').trim(),
        accountNumber: String(elements.accountNumber.value || '').trim(),
        branch: String(elements.branch.value || '').trim(),
        transferPrefix: String(elements.transferPrefix.value || '').trim(),
        depositAmountOptions: normalizeDepositAmountOptionsInput(elements.depositAmountOptions.value),
        defaultDepositAmount: normalizeMoneyAmountInput(elements.defaultDepositAmount.value, 0),
        minDepositAmount: normalizeMoneyAmountInput(elements.minDepositAmount.value, 0),
        maxDepositAmount: normalizeMoneyAmountInput(elements.maxDepositAmount.value, 0),
        holdHours: Number(elements.holdHours.value || 0),
        requireTransferProof: Boolean(elements.requireTransferProof.checked),
        policyText: String(elements.policyText?.value || '')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')
            .map((line) => line.trim().replace(/\s+/g, ' '))
            .filter(Boolean)
            .join('\n')
            .slice(0, 4000)
    };
};

const loadAdminDepositPaymentConfig = async () => {
    if (!depositConfigForm) {
        return;
    }

    setDepositConfigFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/deposit-payment/config');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải cấu hình đặt cọc.');
        }

        depositPaymentConfig = data.config || null;
        fillDepositConfigForm(depositPaymentConfig);
    } catch (error) {
        setDepositConfigFeedback(error.message || 'Không thể tải cấu hình đặt cọc.', 'error');
    }
};

const getFilteredDepositOrders = () => {
    const keyword = normalizeSearchValue(depositOrderSearchInput?.value || '');
    const statusFilter = String(depositOrderStatusFilter?.value || '').trim().toLowerCase();

    return depositOrders.filter((order) => {
        const status = String(order.status || '').trim().toLowerCase();

        if (statusFilter) {
            const matchesStatusFilter = {
                due_soon: isDepositOrderDueSoon(order),
                reminded: isDepositOrderReminded(order),
                missing_proof: isDepositOrderMissingProof(order),
                needs_reconciliation: needsDepositOrderReconciliation(order)
            }[statusFilter] ?? status === statusFilter;

            if (!matchesStatusFilter) {
                return false;
            }
        }

        if (!keyword) {
            return true;
        }

        return normalizeSearchValue([
            order.code,
            order.fullName,
            order.phone,
            order.email,
            order.userEmail,
            order.province,
            order.carBrand,
            order.carName,
            order.carPrice,
            getDepositOrderPaymentMethodLabel(order.paymentMethod),
            getDepositOrderStatusLabel(order.status),
            order.bankTransferNote,
            order.vnpayTxnRef,
            order.vnpayTransactionNo,
            order.vnpayResponseCode,
            order.vnpayTransactionStatus,
            order.vnpayBankCode,
            order.vnpayCardType,
            order.vnpayPayDate,
            order.paymentReference,
            order.paymentReceivedAt,
            order.paymentConfirmationNote,
            order.paymentConfirmedByName,
            order.refundAmount,
            order.refundReference,
            order.refundCompletedAt,
            order.refundNote,
            order.refundConfirmedByName,
            order.transferProofFileName,
            order.transferProofUploadedAt,
            order.expiresAt,
            order.expiredAt,
            order.paymentReminderSentAt,
            isDepositOrderDueSoon(order) ? 'sắp quá hạn sap qua han due soon' : '',
            isDepositOrderReminded(order) ? 'đã nhắc khách da nhac khach reminded' : '',
            isDepositOrderMissingProof(order) ? 'chờ chứng từ cho chung tu missing proof' : '',
            needsDepositOrderReconciliation(order) ? 'cần đối soát can doi soat reconciliation' : '',
            order.note,
            order.statusNote,
            ...(Array.isArray(order.history)
                ? order.history.flatMap((historyItem) => [
                    historyItem.previousStatusLabel,
                    historyItem.nextStatusLabel,
                    historyItem.note,
                    historyItem.actorName,
                    historyItem.actionType,
                    historyItem.createdAt
                ])
                : [])
        ].join(' ')).includes(keyword);
    });
};

const renderDepositOrders = () => {
    if (!depositOrderTableBody) {
        return;
    }

    const filteredOrders = getFilteredDepositOrders();

    if (!filteredOrders.length) {
        depositOrderTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Chưa có đơn đặt cọc phù hợp.</td>
            </tr>
        `;
        return;
    }

    depositOrderTableBody.innerHTML = filteredOrders.map((order) => {
        const customerInitial = String(order.fullName || order.phone || 'K')
            .trim()
            .charAt(0)
            .toLocaleUpperCase('vi-VN');
        const customerAvatar = order.userAvatarUrl
            ? `<img src="${escapeHtml(order.userAvatarUrl)}" alt="Ảnh khách hàng ${escapeHtml(order.fullName || '')}">`
            : `<span>${escapeHtml(customerInitial || 'K')}</span>`;
        const phoneHref = getPhoneHref(order.phone);
        const emailText = order.email || order.userEmail || '';
        const emailHref = getMailHref(emailText);
        const status = String(order.status || 'pending').trim().toLowerCase();
        const statusClass = getDepositOrderStatusClass(status);
        const statusNotePreview = getShortNotePreview(order.statusNote);
        const paymentReferencePreview = ['confirmed', 'completed'].includes(status) && order.paymentReference
            ? `GD: ${getShortNotePreview(order.paymentReference, 48)}`
            : '';
        const refundPreview = status === 'cancelled_after_deposit' && Number(order.refundAmount || 0) > 0
            ? `Hoàn: ${formatCompactPrice(order.refundAmount)}${order.refundReference ? ` · ${getShortNotePreview(order.refundReference, 36)}` : ''}`
            : '';
        const transferProofPreview = order.transferProofUrl
            ? `Có chứng từ${order.transferProofUploadedAt ? `: ${formatDepositAuditDate(order.transferProofUploadedAt, '')}` : ''}`
            : '';
        const isVnpayPayment = String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';
        const paymentNotePreview = isVnpayPayment
            ? (order.vnpayTxnRef || order.paymentReference || 'Đang chờ kết quả VNPay')
            : (order.bankTransferNote || 'Chưa có nội dung chuyển khoản');
        const expiryPreview = getDepositOrderExpiryPreview(order);
        const reminderPreview = order.paymentReminderSentAt
            ? `Đã nhắc khách: ${formatDepositAuditDate(order.paymentReminderSentAt, 'Chưa rõ')}`
            : '';
        const needsReconciliation = needsDepositOrderReconciliation(order);
        const carTitle = getDisplayCarTitle(order.carBrand, order.carName, 'Xe đặt cọc');
        const createdDate = formatConsultationDate(order.createdAt);

        return `
            <tr class="deposit-order-row${isDepositOrderDueSoon(order) ? ' is-due-soon' : ''}${needsReconciliation ? ' is-reconciliation-needed' : ''}" data-view-deposit-order="${escapeHtml(order.id)}" tabindex="0" role="button" aria-label="Xem chi tiết đơn đặt cọc ${escapeHtml(order.code || `#${order.id}`)}">
                <td>
                    <div class="test-drive-customer-cell">
                        <span class="test-drive-customer-avatar">${customerAvatar}</span>
                        <span class="employee-meta">
                            <strong>${escapeHtml(order.fullName || 'Chưa có tên')}</strong>
                            <span>${phoneHref ? `<a class="admin-inline-link" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(order.phone || 'Chưa có SĐT')}</a>` : escapeHtml(order.phone || 'Chưa có SĐT')}</span>
                            <small>${emailHref ? `<a class="admin-inline-link" href="mailto:${escapeHtml(emailHref)}">${escapeHtml(emailText)}</a>` : escapeHtml(emailText || 'Chưa có email')}</small>
                        </span>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(carTitle)}</strong>
                        <span>${escapeHtml(order.carPrice || 'Giá liên hệ')}</span>
                        <small>${escapeHtml(order.code || `DC-${order.id}`)} · Tạo ${escapeHtml(createdDate)}</small>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(formatCompactPrice(order.depositAmount || 0))}</strong>
                        <span>${escapeHtml(getDepositOrderPaymentMethodLabel(order.paymentMethod))}</span>
                        <small>${escapeHtml(paymentNotePreview)}</small>
                        ${transferProofPreview ? `<small>${escapeHtml(transferProofPreview)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="consultation-status-cell car-buy-request-status-cell">
                        <span class="readonly-badge car-buy-request-status-badge ${statusClass}">${escapeHtml(getDepositOrderStatusLabel(status))}</span>
                        ${paymentReferencePreview ? `<small class="consultation-status-note-preview">${escapeHtml(paymentReferencePreview)}</small>` : ''}
                        ${refundPreview ? `<small class="consultation-status-note-preview">${escapeHtml(refundPreview)}</small>` : ''}
                        ${expiryPreview ? `<small class="consultation-status-note-preview">${escapeHtml(expiryPreview)}</small>` : ''}
                        ${reminderPreview ? `<small class="consultation-status-note-preview">${escapeHtml(reminderPreview)}</small>` : ''}
                        ${needsReconciliation ? '<small class="consultation-status-note-preview deposit-order-alert-chip">Cần đối soát</small>' : ''}
                        ${statusNotePreview ? `<small class="consultation-status-note-preview">${escapeHtml(statusNotePreview)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        ${phoneHref ? `
                            <a class="icon-btn icon-btn--neutral" href="tel:${escapeHtml(phoneHref)}" aria-label="Gọi khách đặt cọc ${escapeHtml(order.fullName || order.phone || '')}" title="Gọi khách">
                                <i class="bx bx-phone-call"></i>
                            </a>
                        ` : ''}
                        ${status === 'pending' && order.isOverdue ? `
                            <button type="button" class="icon-btn icon-btn--warning" data-expire-deposit-order="${escapeHtml(order.id)}" aria-label="Đánh dấu đơn đặt cọc #${escapeHtml(order.id)} quá hạn" title="Đánh dấu quá hạn">
                                <i class="bx bx-time-five"></i>
                            </button>
                        ` : ''}
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-deposit-order-status="${escapeHtml(order.id)}" aria-label="Cập nhật đơn đặt cọc #${escapeHtml(order.id)}" title="Cập nhật trạng thái">
                            <i class="bx bx-edit-alt"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--neutral" data-view-deposit-order="${escapeHtml(order.id)}" aria-label="Xem đơn đặt cọc #${escapeHtml(order.id)}" title="Xem chi tiết">
                            <i class="bx bx-show"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const exportFilteredDepositOrdersCsv = () => {
    const filteredOrders = getFilteredDepositOrders();

    if (!filteredOrders.length) {
        showToast('Không có đơn đặt cọc phù hợp để xuất file.', 'error', 'Xuất báo cáo');
        return;
    }

    const rows = [
        [
            'Mã đơn',
            'Khách hàng',
            'Số điện thoại',
            'Email',
            'Xe',
            'Số tiền cọc',
            'Trạng thái',
            'Nội dung chuyển khoản',
            'Mã giao dịch nhận tiền',
            'Thời gian nhận tiền',
            'Số tiền hoàn',
            'Mã giao dịch hoàn',
            'Thời gian hoàn',
            'Ghi chú hoàn cọc',
            'Đã nhắc khách lúc',
            'Sắp quá hạn',
            'Cần đối soát',
            'Ghi chú trạng thái',
            'Ngày tạo'
        ],
        ...filteredOrders.map((order) => [
            order.code || `DC-${order.id}`,
            order.fullName || '',
            order.phone || '',
            order.email || order.userEmail || '',
            getDisplayCarTitle(order.carBrand, order.carName, 'Xe đặt cọc'),
            Number(order.depositAmount || 0),
            getDepositOrderStatusLabel(order.status),
            order.bankTransferNote || '',
            order.paymentReference || '',
            order.paymentReceivedAt || '',
            Number(order.refundAmount || 0),
            order.refundReference || '',
            order.refundCompletedAt || '',
            order.refundNote || '',
            order.paymentReminderSentAt || '',
            isDepositOrderDueSoon(order) ? 'Có' : 'Không',
            needsDepositOrderReconciliation(order) ? 'Có' : 'Không',
            order.statusNote || '',
            order.createdAt || ''
        ])
    ];
    const fileName = `bao-cao-dat-coc-${new Date().toISOString().slice(0, 10)}.csv`;

    downloadCsvFile(fileName, rows);
    showToast('Đã xuất báo cáo đặt cọc CSV.', 'success', 'Xuất báo cáo');
};

const getDepositOrderHistoryActionLabel = (entry = {}) => {
    const actionType = String(entry.actionType || '').trim().toLowerCase();

    if (actionType === 'transfer_proof_uploaded') {
        return 'Tải chứng từ chuyển khoản';
    }

    if (actionType === 'refund_recorded') {
        return 'Ghi nhận hoàn cọc';
    }

    if (actionType === 'payment_reminder_sent') {
        return 'Nhắc khách chuyển khoản';
    }

    if (actionType === 'auto_expired') {
        return 'Tự động quá hạn';
    }

    if (actionType === 'manual_expired') {
        return 'Đánh dấu quá hạn thủ công';
    }

    if (actionType === 'created') {
        return 'Tạo đơn';
    }

    return 'Cập nhật trạng thái';
};

const exportFilteredDepositAuditCsv = () => {
    const filteredOrders = getFilteredDepositOrders();

    if (!filteredOrders.length) {
        showToast('Không có đơn đặt cọc phù hợp để xuất lịch sử.', 'error', 'Xuất lịch sử');
        return;
    }

    const rows = [
        [
            'Mã đơn',
            'Khách hàng',
            'Số điện thoại',
            'Xe',
            'Trạng thái hiện tại',
            'Thời gian sự kiện',
            'Hành động',
            'Trạng thái trước',
            'Trạng thái sau',
            'Người thực hiện',
            'Ghi chú'
        ],
        ...filteredOrders.flatMap((order) => {
            const historyEntries = Array.isArray(order.history) && order.history.length
                ? order.history
                : [{
                    createdAt: order.createdAt || '',
                    actionType: 'unknown',
                    previousStatus: '',
                    nextStatus: order.status,
                    actorName: '',
                    note: 'Chưa có lịch sử xử lý chi tiết.'
                }];

            return historyEntries.map((entry) => [
                order.code || `DC-${order.id}`,
                order.fullName || '',
                order.phone || '',
                getDisplayCarTitle(order.carBrand, order.carName, 'Xe đặt cọc'),
                getDepositOrderStatusLabel(order.status),
                entry.createdAt || '',
                getDepositOrderHistoryActionLabel(entry),
                entry.previousStatus ? getDepositOrderStatusLabel(entry.previousStatus) : '',
                entry.nextStatus ? getDepositOrderStatusLabel(entry.nextStatus) : '',
                entry.actorName || '',
                entry.note || ''
            ]);
        })
    ];
    const fileName = `lich-su-dat-coc-${new Date().toISOString().slice(0, 10)}.csv`;

    downloadCsvFile(fileName, rows);
    showToast('Đã xuất lịch sử xử lý đặt cọc CSV.', 'success', 'Xuất lịch sử');
};

const loadDepositOrders = async () => {
    if (!depositOrderTableBody) {
        return;
    }

    setDepositOrderFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/deposit-orders');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải đơn đặt cọc.');
        }

        depositOrders = data.orders || [];
        depositOrderPaymentMethodLabels = data.paymentMethods || depositOrderPaymentMethodLabels;
        updateDepositOrderStats();
        renderDepositOrders();
    } catch (error) {
        setDepositOrderFeedback(error.message || 'Không thể tải đơn đặt cọc.', 'error');
        depositOrderTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Không thể tải đơn đặt cọc.</td>
            </tr>
        `;
    }
};

const openDepositOrderDetail = (order) => {
    if (!customerDetailPanel || !customerDetailBody || !order) {
        return;
    }

    const createdDate = formatConsultationDate(order.createdAt);
    const updatedDate = formatConsultationDate(order.updatedAt);
    const expiresDate = formatDepositAuditDate(order.expiresAt, 'Chưa đặt hạn');
    const expiredDate = formatDepositAuditDate(order.expiredAt, 'Chưa quá hạn');
    const reminderSentDate = formatDepositAuditDate(order.paymentReminderSentAt, 'Chưa nhắc');
    const phoneHref = getPhoneHref(order.phone);
    const emailText = order.email || order.userEmail || '';
    const emailHref = getMailHref(emailText);
    const carTitle = getDisplayCarTitle(order.carBrand, order.carName, 'Xe đặt cọc');
    const paymentReceivedDate = formatDepositAuditDate(order.paymentReceivedAt);
    const paymentConfirmedDate = formatDepositAuditDate(order.paymentConfirmedAt);
    const refundCompletedDate = formatDepositAuditDate(order.refundCompletedAt, 'Chưa ghi nhận');
    const refundConfirmedDate = formatDepositAuditDate(order.refundConfirmedAt, 'Chưa ghi nhận');
    const transferProofUrl = String(order.transferProofUrl || '').trim();
    const transferProofUploadedDate = formatDepositAuditDate(order.transferProofUploadedAt, 'Chưa tải chứng từ');
    const canUploadProof = canUploadDepositOrderProof(order);
    const proofUploadControlHtml = canUploadProof
        ? `
            <button type="button" class="deposit-order-proof-upload-button" data-admin-deposit-proof-choose="${escapeHtml(order.id)}">
                <i class="bx bx-upload" aria-hidden="true"></i>
                <span>${transferProofUrl ? 'Thay biên lai' : 'Tải biên lai thay khách'}</span>
            </button>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-admin-deposit-proof-input="${escapeHtml(order.id)}">
            <small data-admin-deposit-proof-feedback="${escapeHtml(order.id)}" aria-live="polite"></small>
        `
        : '<small>Chỉ đơn đã nhận tiền mới được tải biên lai.</small>';
    const isVnpayPayment = String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';
    const vnpayDetailsHtml = isVnpayPayment ? `
            <div class="customer-detail__item">
                <span>VNPay TxnRef</span>
                <strong>${escapeHtml(order.vnpayTxnRef || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>VNPay TransactionNo</span>
                <strong>${escapeHtml(order.vnpayTransactionNo || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>VNPay Response</span>
                <strong>${escapeHtml([order.vnpayResponseCode, order.vnpayTransactionStatus].filter(Boolean).join(' / ') || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Ngân hàng/thẻ VNPay</span>
                <strong>${escapeHtml([order.vnpayBankCode, order.vnpayCardType].filter(Boolean).join(' · ') || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>PayDate VNPay</span>
                <strong>${escapeHtml(order.vnpayPayDate || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>VNPay xác nhận</span>
                <strong>${escapeHtml(formatDepositAuditDate(order.vnpayConfirmedAt, 'Chưa xác nhận'))}</strong>
            </div>
    ` : '';

    if (customerDetailEyebrow) {
        customerDetailEyebrow.textContent = 'Đơn đặt cọc';
    }

    if (customerDetailTitle) {
        customerDetailTitle.textContent = `Chi tiết ${order.code || `#${order.id}`}`;
    }

    customerDetailBody.innerHTML = `
        <div class="customer-detail__profile">
            <span class="customer-detail__avatar"><i class="bx bx-credit-card"></i></span>
            <div>
                <h4>${escapeHtml(carTitle)}</h4>
                <p>${escapeHtml(formatCompactPrice(order.depositAmount || 0))} · ${escapeHtml(getDepositOrderStatusLabel(order.status))} · Tạo ${escapeHtml(createdDate)}</p>
            </div>
        </div>
        <div class="customer-detail__grid">
            <div class="customer-detail__item">
                <span>Khách hàng</span>
                <strong>${escapeHtml(order.fullName || 'Chưa có tên')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số điện thoại</span>
                <strong>${phoneHref ? `<a class="admin-inline-link" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(order.phone || 'Chưa có SĐT')}</a>` : escapeHtml(order.phone || 'Chưa có SĐT')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Email</span>
                <strong>${emailHref ? `<a class="admin-inline-link" href="mailto:${escapeHtml(emailHref)}">${escapeHtml(emailText)}</a>` : escapeHtml(emailText || 'Chưa có email')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Tỉnh/thành</span>
                <strong>${escapeHtml(order.province || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Mã đơn</span>
                <strong>${escapeHtml(order.code || `DC-${order.id}`)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Xe đặt cọc</span>
                <strong>${escapeHtml(carTitle)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Giá xe</span>
                <strong>${escapeHtml(order.carPrice || 'Giá liên hệ')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>ID xe</span>
                <strong>${order.carId ? `#${escapeHtml(order.carId)}` : 'Không còn liên kết'}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số tiền cọc</span>
                <strong>${escapeHtml(formatCompactPrice(order.depositAmount || 0))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Phương thức</span>
                <strong>${escapeHtml(getDepositOrderPaymentMethodLabel(order.paymentMethod))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>${isVnpayPayment ? 'Mã thanh toán' : 'Nội dung chuyển khoản'}</span>
                <strong>${escapeHtml(isVnpayPayment ? (order.vnpayTxnRef || order.paymentReference || 'Thanh toán qua VNPay') : (order.bankTransferNote || 'Chưa có nội dung'))}</strong>
            </div>
            ${vnpayDetailsHtml}
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Chứng từ chuyển khoản</span>
                ${transferProofUrl ? `
                    <div class="deposit-order-proof-detail">
                        <a href="${escapeHtml(transferProofUrl)}" target="_blank" rel="noopener">
                            <img src="${escapeHtml(transferProofUrl)}" alt="Chứng từ chuyển khoản ${escapeHtml(order.code || '')}">
                        </a>
                        <strong>
                            <a class="admin-inline-link" href="${escapeHtml(transferProofUrl)}" target="_blank" rel="noopener">${escapeHtml(order.transferProofFileName || 'Mở chứng từ')}</a>
                            <small>${escapeHtml(transferProofUploadedDate)}</small>
                            ${proofUploadControlHtml}
                        </strong>
                    </div>
                ` : `
                    <strong>Khách chưa tải chứng từ chuyển khoản.</strong>
                    ${proofUploadControlHtml}
                `}
            </div>
            <div class="customer-detail__item">
                <span>Hạn giữ chỗ</span>
                <strong>${escapeHtml(expiresDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Quá hạn lúc</span>
                <strong>${escapeHtml(expiredDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Đã nhắc khách</span>
                <strong>${escapeHtml(reminderSentDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Mã giao dịch</span>
                <strong>${escapeHtml(order.paymentReference || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Thời gian nhận tiền</span>
                <strong>${escapeHtml(paymentReceivedDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Người xác nhận</span>
                <strong>${escapeHtml(order.paymentConfirmedByName || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Hệ thống ghi nhận</span>
                <strong>${escapeHtml(paymentConfirmedDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Cập nhật</span>
                <strong>${escapeHtml(updatedDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số tiền hoàn cọc</span>
                <strong>${Number(order.refundAmount || 0) > 0 ? escapeHtml(formatCompactPrice(order.refundAmount)) : 'Chưa ghi nhận'}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Mã giao dịch hoàn cọc</span>
                <strong>${escapeHtml(order.refundReference || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Thời gian hoàn cọc</span>
                <strong>${escapeHtml(refundCompletedDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Người ghi nhận hoàn cọc</span>
                <strong>${escapeHtml(order.refundConfirmedByName || 'Chưa ghi nhận')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Hệ thống ghi nhận hoàn cọc</span>
                <strong>${escapeHtml(refundConfirmedDate)}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú khách hàng</span>
                <strong>${escapeHtml(order.note || 'Khách hàng chưa nhập ghi chú.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú xử lý</span>
                <strong>${escapeHtml(order.statusNote || 'Chưa có ghi chú xử lý.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú nội bộ xác nhận tiền</span>
                <strong>${escapeHtml(order.paymentConfirmationNote || 'Chưa có ghi chú nội bộ.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú hoàn cọc</span>
                <strong>${escapeHtml(order.refundNote || 'Chưa có ghi chú hoàn cọc.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Lịch sử xử lý</span>
                ${renderDepositOrderHistory(order.history)}
            </div>
        </div>
    `;

    customerDetailPanel.hidden = false;
    customerDetailPanel.setAttribute('aria-hidden', 'false');
    customerDetailPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(customerDetailCloseTimer);
    window.requestAnimationFrame(() => {
        customerDetailPanel.classList.add('is-visible');
    });
};

const openDepositOrderDetailById = (orderId) => {
    const order = getDepositOrder(orderId);

    if (!order) {
        setDepositOrderFeedback('Không tìm thấy đơn đặt cọc cần xem chi tiết.', 'error');
        return;
    }

    openDepositOrderDetail(order);
};

const openDepositOrderDetailAfterRefresh = async (orderId) => {
    if (!orderId) {
        return;
    }

    await loadDepositOrders();
    openDepositOrderDetailById(orderId);
};

const getCarBuyRequestStatusLabel = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return carBuyRequestStatusConfig[normalizedStatus]?.label || carBuyRequestStatusConfig.pending.label;
};

const getCarBuyRequestStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return carBuyRequestStatusConfig[normalizedStatus]?.className || carBuyRequestStatusConfig.pending.className;
};

const getCarBuyRequestOfferStatusLabel = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return carBuyRequestOfferStatusConfig[normalizedStatus]?.label || carBuyRequestOfferStatusConfig.new.label;
};

const getCarBuyRequestOfferStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return carBuyRequestOfferStatusConfig[normalizedStatus]?.className || carBuyRequestOfferStatusConfig.new.className;
};

const getCarBuyRequestOfferContactPreferenceLabel = (preference) =>
    carBuyRequestOfferContactPreferenceLabels[String(preference || '').trim()]
    || carBuyRequestOfferContactPreferenceLabels.okxe_first;

const getCarBuyRequestBudgetLabel = (budgetRange) =>
    carBuyRequestBudgetLabels[budgetRange] || 'Giá thỏa thuận';

const getCarBuyRequest = (requestId) =>
    carBuyRequests.find((request) => String(request.id) === String(requestId));

const getCarBuyRequestOffer = (offerId) => {
    for (const request of carBuyRequests) {
        const offer = (request.offers || []).find((item) => String(item.id) === String(offerId));

        if (offer) {
            return { request, offer };
        }
    }

    return { request: null, offer: null };
};

const updateCarBuyRequestStats = () => {
    const pending = carBuyRequests.filter((request) => request.status === 'pending').length;
    const approved = carBuyRequests.filter((request) => request.status === 'approved').length;
    const rejected = carBuyRequests.filter((request) => request.status === 'rejected').length;
    const offerCount = carBuyRequests.reduce((total, request) => total + Number(request.offerCount || (request.offers || []).length || 0), 0);

    if (carBuyRequestStatPending) {
        carBuyRequestStatPending.textContent = String(pending);
    }
    if (carBuyRequestStatApproved) {
        carBuyRequestStatApproved.textContent = String(approved);
    }
    if (carBuyRequestStatRejected) {
        carBuyRequestStatRejected.textContent = String(rejected);
    }
    if (carBuyRequestStatTotal) {
        carBuyRequestStatTotal.textContent = String(carBuyRequests.length);
    }
    if (carBuyRequestStatOffers) {
        carBuyRequestStatOffers.textContent = String(offerCount);
    }
};

const getFilteredCarBuyRequests = () => {
    const keyword = normalizeSearchValue(carBuyRequestSearchInput?.value || '');
    const statusFilter = String(carBuyRequestStatusFilter?.value || '').trim().toLowerCase();

    return carBuyRequests.filter((request) => {
        const status = String(request.status || '').trim().toLowerCase();

        if (statusFilter && status !== statusFilter) {
            return false;
        }

        if (!keyword) {
            return true;
        }

        const offerSearchText = (request.offers || []).map((offer) => [
            offer.code,
            offer.sellerName,
            offer.sellerPhone,
            offer.sellerEmail,
            offer.carBrand,
            offer.carModel,
            offer.carYear,
            offer.expectedPrice,
            offer.mileage,
            offer.conditionNote,
            getCarBuyRequestOfferStatusLabel(offer.status),
            offer.statusNote
        ].join(' ')).join(' ');

        return normalizeSearchValue([
            request.code,
            request.fullName,
            request.phone,
            request.email,
            request.province,
            request.address,
            request.title,
            request.content,
            getCarBuyRequestBudgetLabel(request.budgetRange),
            getCarBuyRequestStatusLabel(request.status),
            request.statusNote,
            offerSearchText
        ].join(' ')).includes(keyword)
    });
};

const renderCarBuyRequests = () => {
    if (!carBuyRequestTableBody) {
        return;
    }

    const filteredRequests = getFilteredCarBuyRequests();

    if (!filteredRequests.length) {
        carBuyRequestTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Chưa có tin mua xe phù hợp.</td>
            </tr>
        `;
        return;
    }

    carBuyRequestTableBody.innerHTML = filteredRequests.map((request) => {
        const customerInitial = String(request.fullName || request.phone || 'K')
            .trim()
            .charAt(0)
            .toLocaleUpperCase('vi-VN');
        const customerAvatar = request.userAvatarUrl
            ? `<img src="${escapeHtml(request.userAvatarUrl)}" alt="Ảnh khách hàng ${escapeHtml(request.fullName || '')}">`
            : `<span>${escapeHtml(customerInitial || 'K')}</span>`;
        const status = String(request.status || 'pending').trim().toLowerCase();
        const statusClass = getCarBuyRequestStatusClass(status);
        const createdDate = formatConsultationDate(request.createdAt);
        const statusNotePreview = getShortNotePreview(request.statusNote);
        const offers = request.offers || [];
        const offerCount = Number(request.offerCount || offers.length || 0);
        const newOfferCount = Number(request.newOfferCount || offers.filter((offer) => offer.status === 'new').length || 0);
        const latestOffer = offers[0] || null;
        const latestOfferCar = latestOffer
            ? [latestOffer.carBrand, latestOffer.carModel, latestOffer.carYear]
                .filter(Boolean)
                .join(' ') || 'Xe phù hợp'
            : '';
        const latestOfferMeta = latestOffer
            ? [latestOffer.expectedPrice, latestOffer.mileage, getCarBuyRequestOfferStatusLabel(latestOffer.status)]
                .filter(Boolean)
                .join(' · ')
            : '';

        return `
            <tr data-view-car-buy-request="${escapeHtml(request.id)}">
                <td>
                    <div class="test-drive-customer-cell">
                        <span class="test-drive-customer-avatar">${customerAvatar}</span>
                        <span class="employee-meta">
                            <strong>${escapeHtml(request.fullName || 'Chưa có tên')}</strong>
                            <span>${escapeHtml(request.phone || 'Chưa có SĐT')}</span>
                            <small>${escapeHtml(request.code || `MX-${request.id}`)}</small>
                        </span>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(request.title || 'Khách cần mua ô tô')}</strong>
                        <span>${escapeHtml(getCarBuyRequestBudgetLabel(request.budgetRange))}</span>
                        <small>Tạo ${escapeHtml(createdDate)}</small>
                        <small class="car-buy-request-offer-summary">${escapeHtml(offerCount)} đề xuất xe${newOfferCount ? ` · ${escapeHtml(newOfferCount)} mới` : ''}</small>
                        ${latestOffer ? `
                            <div class="car-buy-request-offer-preview">
                                <span>Người đề xuất mới nhất</span>
                                <strong>${escapeHtml(latestOffer.sellerName || 'Chưa có tên')} · ${escapeHtml(latestOffer.sellerPhone || 'Chưa có SĐT')}</strong>
                                <small>${escapeHtml(latestOfferCar)}${latestOfferMeta ? ` · ${escapeHtml(latestOfferMeta)}` : ''}</small>
                            </div>
                        ` : ''}
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(request.province || 'Chưa có tỉnh')}</strong>
                        <span>${escapeHtml(request.address || 'Chưa có địa chỉ')}</span>
                        <small>${escapeHtml(request.email || request.userEmail || 'Chưa có email')}</small>
                    </div>
                </td>
                <td>
                    <div class="consultation-status-cell car-buy-request-status-cell">
                        <span class="readonly-badge car-buy-request-status-badge ${statusClass}">${escapeHtml(getCarBuyRequestStatusLabel(status))}</span>
                        ${statusNotePreview ? `<small class="consultation-status-note-preview">${escapeHtml(statusNotePreview)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-car-buy-request-status="${escapeHtml(request.id)}" aria-label="Cập nhật trạng thái tin mua xe #${escapeHtml(request.id)}" title="Cập nhật trạng thái">
                            <i class="bx bx-edit-alt"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--neutral" data-view-car-buy-request="${escapeHtml(request.id)}" aria-label="Xem tin mua xe #${escapeHtml(request.id)}" title="Xem chi tiết">
                            <i class="bx bx-show"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--delete" data-delete-car-buy-request="${escapeHtml(request.id)}" aria-label="Xóa tin mua xe #${escapeHtml(request.id)}" title="Xóa tin">
                            <i class="bx bx-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const loadCarBuyRequests = async () => {
    if (!carBuyRequestTableBody) {
        return;
    }

    setCarBuyRequestFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/car-buy-requests');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải tin mua xe.');
        }

        carBuyRequests = data.requests || [];
        carBuyRequestBudgetLabels = data.budgetRanges || carBuyRequestBudgetLabels;
        updateCarBuyRequestStats();
        renderCarBuyRequests();
    } catch (error) {
        setCarBuyRequestFeedback(error.message || 'Không thể tải tin mua xe.', 'error');
        carBuyRequestTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Không thể tải tin mua xe.</td>
            </tr>
        `;
    }
};

const openCarBuyRequestDetail = (request) => {
    if (!customerDetailPanel || !customerDetailBody || !request) {
        return;
    }

    const createdDate = formatConsultationDate(request.createdAt);
    const updatedDate = formatConsultationDate(request.updatedAt);
    const phoneHref = getPhoneHref(request.phone);
    const emailText = request.email || request.userEmail || '';
    const emailHref = getMailHref(emailText);
    const offers = request.offers || [];
    const offerItemsHtml = offers.length
        ? offers.map((offer) => {
            const sellerPhoneHref = getPhoneHref(offer.sellerPhone);
            const sellerEmailHref = getMailHref(offer.sellerEmail);
            const offerStatus = String(offer.status || 'new').trim().toLowerCase();
            const offerStatusOptions = Object.entries(carBuyRequestOfferStatusConfig).map(([value, config]) => `
                <option value="${escapeHtml(value)}" ${value === offerStatus ? 'selected' : ''}>${escapeHtml(config.label)}</option>
            `).join('');

            return `
                <article class="car-buy-request-offer-card">
                    <div class="car-buy-request-offer-card__head">
                        <div>
                            <span>${escapeHtml(offer.code || `DX-${offer.id}`)}</span>
                            <h4>${escapeHtml([offer.carBrand, offer.carModel, offer.carYear].filter(Boolean).join(' ') || 'Xe phù hợp')}</h4>
                            <p>${escapeHtml([offer.carVersion, offer.expectedPrice, offer.mileage].filter(Boolean).join(' · ') || 'Chưa cập nhật giá/số km')}</p>
                        </div>
                        <span class="readonly-badge car-buy-request-offer-status-badge ${getCarBuyRequestOfferStatusClass(offerStatus)}">${escapeHtml(getCarBuyRequestOfferStatusLabel(offerStatus))}</span>
                    </div>
                    <div class="car-buy-request-offer-card__grid">
                        <p><span>Người có xe</span><strong>${escapeHtml(offer.sellerName || 'Chưa có tên')}</strong></p>
                        <p><span>Số điện thoại</span><strong>${sellerPhoneHref ? `<a class="admin-inline-link" href="tel:${escapeHtml(sellerPhoneHref)}">${escapeHtml(offer.sellerPhone)}</a>` : escapeHtml(offer.sellerPhone || 'Chưa có SĐT')}</strong></p>
                        <p><span>Email</span><strong>${sellerEmailHref ? `<a class="admin-inline-link" href="mailto:${escapeHtml(sellerEmailHref)}">${escapeHtml(offer.sellerEmail)}</a>` : escapeHtml(offer.sellerEmail || 'Chưa có email')}</strong></p>
                        <p><span>Cách liên hệ</span><strong>${escapeHtml(getCarBuyRequestOfferContactPreferenceLabel(offer.contactPreference))}</strong></p>
                        <p class="car-buy-request-offer-card__wide"><span>Tình trạng xe</span><strong>${escapeHtml(offer.conditionNote || 'Chưa có mô tả tình trạng.')}</strong></p>
                    </div>
                    <div class="car-buy-request-offer-card__process">
                        <label>
                            <span>Trạng thái đề xuất</span>
                            <select data-car-buy-request-offer-status="${escapeHtml(offer.id)}">
                                ${offerStatusOptions}
                            </select>
                        </label>
                        <label>
                            <span>Ghi chú xử lý</span>
                            <textarea data-car-buy-request-offer-note="${escapeHtml(offer.id)}" rows="2" maxlength="500" placeholder="Ghi chú nội bộ khi xử lý đề xuất...">${escapeHtml(offer.statusNote || '')}</textarea>
                        </label>
                        <button type="button" class="toolbar-btn toolbar-btn--primary" data-update-car-buy-request-offer="${escapeHtml(offer.id)}">
                            <i class="bx bx-save"></i>
                            <span>Cập nhật đề xuất</span>
                        </button>
                    </div>
                </article>
            `;
        }).join('')
        : '<p class="car-buy-request-offer-empty">Chưa có người bán nào gửi xe phù hợp cho tin mua này.</p>';

    if (customerDetailEyebrow) {
        customerDetailEyebrow.textContent = 'Tin mua xe';
    }

    if (customerDetailTitle) {
        customerDetailTitle.textContent = `Chi tiết ${request.code || `#${request.id}`}`;
    }

    customerDetailBody.innerHTML = `
        <div class="customer-detail__profile">
            <span class="customer-detail__avatar"><i class="bx bx-message-square-edit"></i></span>
            <div>
                <h4>${escapeHtml(request.title || 'Khách cần mua ô tô')}</h4>
                <p>${escapeHtml(getCarBuyRequestBudgetLabel(request.budgetRange))} · ${escapeHtml(getCarBuyRequestStatusLabel(request.status))} · Tạo ${escapeHtml(createdDate)}</p>
            </div>
        </div>
        <div class="customer-detail__grid">
            <div class="customer-detail__item">
                <span>Khách hàng</span>
                <strong>${escapeHtml(request.fullName || 'Chưa có tên')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số điện thoại</span>
                <strong>${phoneHref ? `<a class="admin-inline-link" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(request.phone || 'Chưa có SĐT')}</a>` : escapeHtml(request.phone || 'Chưa có SĐT')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Email</span>
                <strong>${emailHref ? `<a class="admin-inline-link" href="mailto:${escapeHtml(emailHref)}">${escapeHtml(emailText)}</a>` : escapeHtml(emailText || 'Chưa có email')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Tỉnh/thành</span>
                <strong>${escapeHtml(request.province || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Mức tiền</span>
                <strong>${escapeHtml(getCarBuyRequestBudgetLabel(request.budgetRange))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Trạng thái</span>
                <strong>${escapeHtml(getCarBuyRequestStatusLabel(request.status))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Cập nhật</span>
                <strong>${escapeHtml(updatedDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Mã tin</span>
                <strong>${escapeHtml(request.code || `MX-${request.id}`)}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Địa chỉ</span>
                <strong>${escapeHtml(request.address || 'Chưa có địa chỉ.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Nội dung nhu cầu</span>
                <strong>${escapeHtml(request.content || 'Khách hàng chưa nhập nội dung chi tiết.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú xử lý</span>
                <strong>${escapeHtml(request.statusNote || 'Chưa có ghi chú xử lý.')}</strong>
            </div>
        </div>
        <section class="car-buy-request-offers-panel">
            <div class="car-buy-request-offers-panel__header">
                <span>Xử lý nhu cầu ghép xe</span>
                <h4>Đề xuất xe phù hợp từ người bán</h4>
                <p>Nhân viên kiểm tra thông tin xe, liên hệ người bán và cập nhật trạng thái để theo dõi quá trình kết nối.</p>
            </div>
            <div class="car-buy-request-offer-list">
                ${offerItemsHtml}
            </div>
        </section>
    `;

    customerDetailPanel.hidden = false;
    customerDetailPanel.setAttribute('aria-hidden', 'false');
    customerDetailPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(customerDetailCloseTimer);
    window.requestAnimationFrame(() => {
        customerDetailPanel.classList.add('is-visible');
    });
};

const getCarSellRequestStatusLabel = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return carSellRequestStatusConfig[normalizedStatus]?.label || carSellRequestStatusConfig.pending.label;
};

const getCarSellRequestStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    return carSellRequestStatusConfig[normalizedStatus]?.className || carSellRequestStatusConfig.pending.className;
};

const getCarSellRequest = (requestId) =>
    carSellRequests.find((request) => String(request.id) === String(requestId));

const updateCarSellRequestStats = () => {
    const pending = carSellRequests.filter((request) => request.status === 'pending').length;
    const approved = carSellRequests.filter((request) => request.status === 'approved').length;

    if (carSellRequestStatPending) {
        carSellRequestStatPending.textContent = String(pending);
    }
    if (carSellRequestStatApproved) {
        carSellRequestStatApproved.textContent = String(approved);
    }
    if (carSellRequestStatTotal) {
        carSellRequestStatTotal.textContent = String(carSellRequests.length);
    }
};

const getFilteredCarSellRequests = () => {
    const keyword = normalizeSearchValue(carSellRequestSearchInput?.value || '');
    const statusFilter = String(carSellRequestStatusFilter?.value || '').trim().toLowerCase();

    return carSellRequests.filter((request) => {
        const status = String(request.status || '').trim().toLowerCase();

        if (statusFilter && status !== statusFilter) {
            return false;
        }

        if (!keyword) {
            return true;
        }

        return normalizeSearchValue([
            request.code,
            request.fullName,
            request.phone,
            request.email,
            request.userEmail,
            request.brand,
            request.name,
            request.category,
            request.price,
            request.customerDealPrice,
            request.finalPrice,
            request.year,
            request.fuel,
            request.mileage,
            request.description,
            getCarSellRequestStatusLabel(request.status),
            request.statusNote
        ].join(' ')).includes(keyword);
    });
};

const renderCarSellRequests = () => {
    if (!carSellRequestTableBody) {
        return;
    }

    const filteredRequests = getFilteredCarSellRequests();

    if (!filteredRequests.length) {
        carSellRequestTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Chưa có thông tin đăng bán xe phù hợp.</td>
            </tr>
        `;
        return;
    }

    carSellRequestTableBody.innerHTML = filteredRequests.map((request) => {
        const customerInitial = String(request.fullName || request.phone || 'K')
            .trim()
            .charAt(0)
            .toLocaleUpperCase('vi-VN');
        const customerAvatar = request.userAvatarUrl
            ? `<img src="${escapeHtml(request.userAvatarUrl)}" alt="Ảnh khách hàng ${escapeHtml(request.fullName || '')}">`
            : `<span>${escapeHtml(customerInitial || 'K')}</span>`;
        const status = String(request.status || 'pending').trim().toLowerCase();
        const statusClass = getCarSellRequestStatusClass(status);
        const createdDate = formatConsultationDate(request.createdAt);
        const statusNotePreview = getShortNotePreview(request.statusNote);
        const carTitle = [request.brand, request.name].filter(Boolean).join(' ') || 'Xe khách gửi bán';
        const desiredPriceText = request.price || (request.priceValue ? formatCompactPrice(request.priceValue) : 'Chưa có giá');
        const customerDealPriceText = request.customerDealPrice || (request.customerDealPriceValue ? formatCompactPrice(request.customerDealPriceValue) : '');
        const finalPriceText = request.finalPrice || (request.finalPriceValue ? formatCompactPrice(request.finalPriceValue) : '');
        const phoneHref = getPhoneHref(request.phone);
        const specs = [
            request.year ? `${request.year}` : '',
            request.fuel,
            request.gearbox,
            request.seats
        ].filter(Boolean).join(' · ');

        return `
            <tr data-view-car-sell-request="${escapeHtml(request.id)}">
                <td>
                    <div class="test-drive-customer-cell">
                        <span class="test-drive-customer-avatar">${customerAvatar}</span>
                        <span class="employee-meta">
                            <strong>${escapeHtml(request.fullName || 'Chưa có tên')}</strong>
                            <span>${phoneHref ? `<a class="admin-inline-link" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(request.phone || 'Chưa có SĐT')}</a>` : escapeHtml(request.phone || 'Chưa có SĐT')}</span>
                            <small>${escapeHtml(request.email || request.userEmail || 'Chưa có email')}</small>
                        </span>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(carTitle)}</strong>
                        <span>Khách mong muốn: ${escapeHtml(desiredPriceText)}</span>
                        <small>${customerDealPriceText ? `Chốt với khách: ${escapeHtml(customerDealPriceText)} · ` : ''}${finalPriceText ? `Bán hệ thống: ${escapeHtml(finalPriceText)} · ` : ''}${escapeHtml(request.code || `BX-${request.id}`)} · Tạo ${escapeHtml(createdDate)}</small>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(specs || 'Chưa đủ thông số')}</strong>
                        <span>${escapeHtml(request.mileage || 'Chưa có số km')}</span>
                        <small>${escapeHtml([request.origin, request.condition, request.color].filter(Boolean).join(' · ') || 'Chưa cập nhật')}</small>
                    </div>
                </td>
                <td>
                    <div class="consultation-status-cell car-buy-request-status-cell">
                        <span class="readonly-badge car-buy-request-status-badge ${statusClass}">${escapeHtml(getCarSellRequestStatusLabel(status))}</span>
                        ${request.approvedCarId ? `<small class="consultation-status-note-preview">Đã nhập kho: #${escapeHtml(request.approvedCarId)}</small>` : ''}
                        ${statusNotePreview ? `<small class="consultation-status-note-preview">${escapeHtml(statusNotePreview)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        ${phoneHref ? `
                            <a class="icon-btn icon-btn--neutral" href="tel:${escapeHtml(phoneHref)}" aria-label="Gọi khách đăng bán xe ${escapeHtml(request.fullName || request.phone || '')}" title="Gọi khách">
                                <i class="bx bx-phone-call"></i>
                            </a>
                        ` : ''}
                        ${status === 'pending' ? `
                            <button type="button" class="icon-btn icon-btn--edit" data-edit-car-sell-request-status="${escapeHtml(request.id)}" aria-label="Xử lý đăng bán xe #${escapeHtml(request.id)}" title="Duyệt hoặc từ chối">
                                <i class="bx bx-check-shield"></i>
                            </button>
                        ` : ''}
                        <button type="button" class="icon-btn icon-btn--neutral" data-view-car-sell-request="${escapeHtml(request.id)}" aria-label="Xem đăng bán xe #${escapeHtml(request.id)}" title="Xem chi tiết">
                            <i class="bx bx-show"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

const loadCarSellRequests = async () => {
    if (!carSellRequestTableBody) {
        return;
    }

    setCarSellRequestFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/car-sell-requests');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải thông tin đăng bán xe.');
        }

        carSellRequests = data.requests || [];
        updateCarSellRequestStats();
        renderCarSellRequests();
    } catch (error) {
        setCarSellRequestFeedback(error.message || 'Không thể tải thông tin đăng bán xe.', 'error');
        carSellRequestTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">Không thể tải thông tin đăng bán xe.</td>
            </tr>
        `;
    }
};

const setSalesKpiFeedback = (message = '', type = '') => {
    if (!salesKpiFeedback) return;
    salesKpiFeedback.textContent = message;
    salesKpiFeedback.className = 'admin-feedback';
    if (type) salesKpiFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
};

const getSalesKpiTypeLabel = (type) =>
    ({
        acquisition: 'Nhập xe thành công',
        sale: 'Bán xe qua đặt cọc',
        direct_sale: 'Bán trực tiếp tại cửa hàng'
    }[String(type || '').trim().toLowerCase()] || 'Bán xe thành công');

const getSalesKpiSourcesForType = () => {
    const type = String(salesKpiTypeInput?.value || 'acquisition').trim().toLowerCase();
    const sourceGroups = {
        acquisition: salesKpiSources.acquisitions || [],
        sale: salesKpiSources.sales || [],
        direct_sale: salesKpiSources.directSales || []
    };
    const sources = [...(sourceGroups[type] || [])];
    const record = salesKpiRecords.find((item) => String(item.id) === String(editingSalesKpiRecordId));

    if (record && !sources.some((source) => String(source.id) === String(record.sourceId))) {
        sources.unshift({
            id: record.sourceId, code: record.sourceCode, name: record.carName, brand: record.carBrand,
            customerDealPriceValue: record.purchasePriceValue, carPriceValue: record.salePriceValue,
            salePriceValue: record.salePriceValue,
        });
    }

    return sources;
};

const renderSalesKpiSourceOptions = () => {
    if (!salesKpiSourceInput) return;
    const type = String(salesKpiTypeInput?.value || 'acquisition').trim().toLowerCase();
    const sources = getSalesKpiSourcesForType();
    const currentValue = String(salesKpiSourceInput.value || '');

    if (!sources.length) {
        salesKpiSourceInput.innerHTML = '<option value="">Không có giao dịch đủ điều kiện</option>';
        salesKpiSourceInput.disabled = true;
        renderSalesKpiSelectionPreview();
        return;
    }

    salesKpiSourceInput.disabled = false;
    salesKpiSourceInput.innerHTML = [
        '<option value="">Chọn giao dịch thành công</option>',
        ...sources.map((source) => {
            const carTitle = [source.carBrand || source.brand, source.carName || source.name].filter(Boolean).join(' ') || 'Xe chưa rõ tên';
            const value = type === 'acquisition'
                ? Number(source.customerDealPriceValue || 0)
                : Number(source.salePriceValue || source.carPriceValue || 0);
            return `<option value="` + escapeHtml(source.id) + `">` + escapeHtml(source.code || ('#' + source.id)) + ` · ` + escapeHtml(carTitle) + ` · ` + escapeHtml(formatCompactPrice(value)) + `</option>`;
        })
    ].join('');

    if (currentValue && sources.some((source) => String(source.id) === currentValue)) salesKpiSourceInput.value = currentValue;
    renderSalesKpiSelectionPreview();
};

const renderSalesKpiSaleOptions = () => {
    if (!salesKpiSaleInput) return;
    const currentValue = String(salesKpiSaleInput.value || '');
    salesKpiSaleInput.innerHTML = [
        '<option value="">Chọn sale</option>',
        ...salesKpiEmployees.map((employee) =>
            `<option value="` + escapeHtml(employee.id) + `">` + escapeHtml(employee.fullName || employee.email || ('Sale #' + employee.id)) + (employee.salesTitle ? ' · ' + escapeHtml(employee.salesTitle) : '') + `</option>`
        )
    ].join('');
    if (currentValue && salesKpiEmployees.some((employee) => String(employee.id) === currentValue)) salesKpiSaleInput.value = currentValue;
};

const renderSalesKpiSelectionPreview = () => {
    if (!salesKpiSelectionPreview) return;

    const sourceId = String(salesKpiSourceInput?.value || '');
    const type = String(salesKpiTypeInput?.value || 'acquisition').trim().toLowerCase();
    const source = getSalesKpiSourcesForType().find((item) => String(item.id) === sourceId);

    if (!source) {
        salesKpiSelectionPreview.innerHTML = '<i class="bx bx-info-circle"></i><p>Chọn giao dịch để xem nhanh xe và giá trị ghi nhận.</p>';
        return;
    }

    const carTitle = [source.carBrand || source.brand, source.carName || source.name]
        .filter(Boolean)
        .join(' ') || 'Xe chưa rõ tên';
    const value = type === 'acquisition'
        ? Number(source.customerDealPriceValue || 0)
        : Number(source.salePriceValue || source.carPriceValue || 0);
    const valueLabel = type === 'acquisition'
        ? 'Giá nhập ghi nhận'
        : type === 'direct_sale'
            ? 'Doanh số bán trực tiếp'
            : 'Doanh số ghi nhận';

    salesKpiSelectionPreview.innerHTML = `
        <i class="bx bx-check-circle"></i>
        <div>
            <span>Đã chọn ` + escapeHtml(source.code || ('#' + source.id)) + ` · ` + escapeHtml(carTitle) + `</span>
            <strong>` + escapeHtml(valueLabel) + `: ` + escapeHtml(formatCompactPrice(value)) + `</strong>
        </div>`;
};

const renderSalesKpiStats = () => {
    const stats = salesKpiStats || {};
    if (salesKpiStatTotal) salesKpiStatTotal.textContent = String(stats.total || 0);
    if (salesKpiStatAcquisition) salesKpiStatAcquisition.textContent = String(stats.acquisitionCount || 0);
    if (salesKpiStatSales) salesKpiStatSales.textContent = String(stats.saleCount || 0);
    if (salesKpiStatSalesValue) salesKpiStatSalesValue.textContent = formatCompactPrice(stats.salesValue || 0);
    if (salesKpiStatReward) salesKpiStatReward.textContent = formatCompactPrice(stats.rewardAmount || 0);
};

const renderSalesKpiRecords = () => {
    if (!salesKpiTableBody) return;
    if (!salesKpiRecords.length) {
        salesKpiTableBody.innerHTML = '<tr><td colspan="6" class="table-empty">Chưa có KPI nào được ghi nhận.</td></tr>';
        return;
    }

    salesKpiTableBody.innerHTML = salesKpiRecords.map((record) => {
        const isActive = record.recordStatus === 'active';
        const carTitle = [record.carBrand, record.carName].filter(Boolean).join(' ') || 'Xe chưa rõ tên';
        const statusClass = isActive ? 'consultation-status-badge--closed' : 'consultation-status-badge--failed';
        const statusLabel = isActive ? (record.rewardStatus === 'paid' ? 'Đã chi' : 'Chờ chi') : 'Đã hủy';
        const valueLabel = record.kpiType === 'acquisition' ? 'Giá nhập' : 'Giá bán';
        return `
            <tr>
                <td><div class="employee-meta"><strong>` + escapeHtml(isActive ? getSalesKpiTypeLabel(record.kpiType) : 'KPI đã hủy') + `</strong><span>` + escapeHtml(carTitle) + `</span><small>` + escapeHtml(record.sourceCode || ('Giao dịch #' + record.sourceId)) + (record.cancellationNote ? ' · Hủy: ' + escapeHtml(record.cancellationNote) : '') + `</small></div></td>
                <td><div class="employee-meta"><strong>` + escapeHtml(record.saleName || 'Chưa rõ sale') + `</strong><small>` + escapeHtml(record.saleEmail || '') + `</small></div></td>
                <td><div class="employee-meta"><strong>` + escapeHtml(formatCompactPrice(record.transactionValue || 0)) + `</strong><small>` + escapeHtml(valueLabel) + `</small></div></td>
                <td><div class="consultation-status-cell"><strong>` + escapeHtml(formatCompactPrice(record.rewardAmount || 0)) + `</strong><span class="readonly-badge ` + statusClass + `">` + escapeHtml(statusLabel) + `</span></div></td>
                <td><div class="employee-meta"><strong>` + escapeHtml(formatConsultationDate(record.recordedAt)) + `</strong><small>` + escapeHtml(record.recordedByName || '') + `</small></div></td>
                <td><div class="table-actions">` + (isActive
                    ? `<button type="button" class="icon-btn icon-btn--edit" data-edit-sales-kpi="` + escapeHtml(record.id) + `" title="Cập nhật KPI"><i class="bx bx-edit-alt"></i></button><button type="button" class="icon-btn icon-btn--delete" data-cancel-sales-kpi="` + escapeHtml(record.id) + `" title="Hủy KPI"><i class="bx bx-x-circle"></i></button>`
                    : '<span class="readonly-badge consultation-status-badge--failed">Đã hủy</span>') + `</div></td>
            </tr>`;
    }).join('');
};

const resetSalesKpiForm = () => {
    editingSalesKpiRecordId = null;
    salesKpiForm?.reset();
    if (salesKpiTypeInput) salesKpiTypeInput.value = 'acquisition';
    if (salesKpiRewardInput) salesKpiRewardInput.value = '0';
    if (salesKpiRewardStatusInput) salesKpiRewardStatusInput.value = 'pending';
    if (salesKpiSaveButton) salesKpiSaveButton.innerHTML = '<i class="bx bx-plus-circle"></i><span>Ghi nhận KPI</span>';
    renderSalesKpiSourceOptions();
    renderSalesKpiSaleOptions();
};

const loadSalesKpiRecords = async () => {
    if (!salesKpiTableBody || !isCurrentUserAdmin()) return;
    setSalesKpiFeedback('');
    try {
        const { response, data } = await requestJson('/api/admin/sales-kpi-records');
        if (!response.ok) throw new Error(data.message || 'Không thể tải dữ liệu KPI.');
        salesKpiRecords = data.records || [];
        salesKpiSources = data.availableSources || { acquisitions: [], sales: [] };
        salesKpiEmployees = data.salesEmployees || [];
        salesKpiStats = data.stats || {};
        resetSalesKpiForm();
        renderSalesKpiStats();
        renderSalesKpiRecords();
    } catch (error) {
        setSalesKpiFeedback(error.message || 'Không thể tải dữ liệu KPI.', 'error');
        salesKpiTableBody.innerHTML = '<tr><td colspan="6" class="table-empty">Không thể tải dữ liệu KPI.</td></tr>';
    }
};

const editSalesKpiRecord = (record) => {
    if (!record || record.recordStatus !== 'active') return;
    editingSalesKpiRecordId = record.id;
    if (salesKpiTypeInput) salesKpiTypeInput.value = record.kpiType;
    renderSalesKpiSourceOptions();
    renderSalesKpiSaleOptions();
    if (salesKpiSourceInput) salesKpiSourceInput.value = String(record.sourceId);
    if (salesKpiSaleInput) salesKpiSaleInput.value = String(record.saleUserId);
    if (salesKpiRewardInput) salesKpiRewardInput.value = String(record.rewardAmount || 0);
    if (salesKpiRewardStatusInput) salesKpiRewardStatusInput.value = record.rewardStatus || 'pending';
    if (salesKpiNoteInput) salesKpiNoteInput.value = record.note || '';
    renderSalesKpiSelectionPreview();
    if (salesKpiSaveButton) salesKpiSaveButton.innerHTML = '<i class="bx bx-save"></i><span>Cập nhật KPI</span>';
    setSalesKpiFeedback(`Đang chỉnh KPI #` + record.id + '. Có thể đổi sale, tiền thưởng, trạng thái chi và ghi chú.', 'success');
    salesKpiForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const openCarSellRequestDetail = (request) => {
    if (!customerDetailPanel || !customerDetailBody || !request) {
        return;
    }

    const createdDate = formatConsultationDate(request.createdAt);
    const updatedDate = formatConsultationDate(request.updatedAt);
    const phoneHref = getPhoneHref(request.phone);
    const emailText = request.email || request.userEmail || '';
    const emailHref = getMailHref(emailText);
    const images = Array.isArray(request.images) ? request.images : [];
    const desiredPriceText = request.price || (request.priceValue ? formatCompactPrice(request.priceValue) : 'Chưa cập nhật');
    const customerDealPriceText = request.customerDealPrice || (request.customerDealPriceValue ? formatCompactPrice(request.customerDealPriceValue) : '');
    const finalPriceText = request.finalPrice || (request.finalPriceValue ? formatCompactPrice(request.finalPriceValue) : '');
    const imageList = images.length
        ? images.map((image, index) => `
            <a class="car-sell-request-image" href="${escapeHtml(image)}" target="_blank" rel="noopener noreferrer">
                <img src="${escapeHtml(image)}" alt="Ảnh xe ${escapeHtml(request.name || '')} ${index + 1}">
            </a>
        `).join('')
        : '<p class="table-empty">Khách hàng chưa tải ảnh xe.</p>';

    if (customerDetailEyebrow) {
        customerDetailEyebrow.textContent = 'Thông tin đăng bán xe';
    }

    if (customerDetailTitle) {
        customerDetailTitle.textContent = `Chi tiết ${request.code || `#${request.id}`}`;
    }

    customerDetailBody.innerHTML = `
        <div class="customer-detail__profile">
            <span class="customer-detail__avatar"><i class="bx bx-car"></i></span>
            <div>
                <h4>${escapeHtml([request.brand, request.name].filter(Boolean).join(' ') || 'Xe khách gửi bán')}</h4>
                <p>Khách mong muốn: ${escapeHtml(desiredPriceText)}${customerDealPriceText ? ` · Chốt với khách: ${escapeHtml(customerDealPriceText)}` : ''}${finalPriceText ? ` · Bán hệ thống: ${escapeHtml(finalPriceText)}` : ''} · ${escapeHtml(getCarSellRequestStatusLabel(request.status))} · Tạo ${escapeHtml(createdDate)}</p>
            </div>
        </div>
        <div class="customer-detail__grid">
            <div class="customer-detail__item">
                <span>Khách hàng</span>
                <strong>${escapeHtml(request.fullName || 'Chưa có tên')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số điện thoại sale gọi lại</span>
                <strong>${phoneHref ? `<a class="admin-inline-link" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(request.phone || 'Chưa có SĐT')}</a>` : escapeHtml(request.phone || 'Chưa có SĐT')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Email</span>
                <strong>${emailHref ? `<a class="admin-inline-link" href="mailto:${escapeHtml(emailHref)}">${escapeHtml(emailText)}</a>` : escapeHtml(emailText || 'Chưa có email')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Mã đăng bán</span>
                <strong>${escapeHtml(request.code || `BX-${request.id}`)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Hãng xe</span>
                <strong>${escapeHtml(request.brand || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Tên xe</span>
                <strong>${escapeHtml(request.name || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Phân khúc</span>
                <strong>${escapeHtml(request.category || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Giá khách mong muốn</span>
                <strong>${escapeHtml(desiredPriceText)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Giá chốt với khách</span>
                <strong>${escapeHtml(customerDealPriceText || 'Chưa chốt')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Giá bán trên hệ thống</span>
                <strong>${escapeHtml(finalPriceText || 'Chưa chốt')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Năm sản xuất</span>
                <strong>${escapeHtml(request.year || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số km</span>
                <strong>${escapeHtml(request.mileage || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Nhiên liệu</span>
                <strong>${escapeHtml(request.fuel || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Hộp số / dẫn động</span>
                <strong>${escapeHtml([request.gearbox, request.drivetrain].filter(Boolean).join(' · ') || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số chỗ</span>
                <strong>${escapeHtml(request.seats || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Xuất xứ</span>
                <strong>${escapeHtml(request.origin || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Tình trạng</span>
                <strong>${escapeHtml(request.condition || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Màu sắc</span>
                <strong>${escapeHtml(request.color || 'Chưa cập nhật')}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Cập nhật</span>
                <strong>${escapeHtml(updatedDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Xe trong kho</span>
                <strong>${request.approvedCarId ? `#${escapeHtml(request.approvedCarId)}` : 'Chưa nhập kho'}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Mô tả tình trạng xe</span>
                <strong>${escapeHtml(request.description || 'Khách hàng chưa nhập mô tả chi tiết.')}</strong>
            </div>
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Ghi chú xử lý</span>
                <strong>${escapeHtml(request.statusNote || 'Chưa có ghi chú xử lý.')}</strong>
            </div>
        </div>
        <section class="car-buy-request-offers-panel">
            <div class="car-buy-request-offers-panel__header">
                <span>Ảnh xe khách gửi</span>
                <h4>Hình ảnh để sale kiểm tra trước khi gọi lại</h4>
                <p>Nhấn vào ảnh để mở kích thước đầy đủ trong tab mới.</p>
            </div>
            <div class="car-sell-request-image-grid">
                ${imageList}
            </div>
        </section>
    `;

    customerDetailPanel.hidden = false;
    customerDetailPanel.setAttribute('aria-hidden', 'false');
    customerDetailPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(customerDetailCloseTimer);
    window.requestAnimationFrame(() => {
        customerDetailPanel.classList.add('is-visible');
    });
};

const resetPromotionForm = () => {
    promotionForm?.reset();
    editingPromotionId = null;
    if (promotionIdInput) {
        promotionIdInput.value = '';
    }
    if (promotionImageInput) {
        promotionImageInput.value = '';
    }
    setPromotionImagePreview('');
    if (promotionFormTitle) {
        promotionFormTitle.textContent = 'Bài khuyến mại mới';
    }
    if (promotionSubmitButton) {
        promotionSubmitButton.innerHTML = '<i class="bx bx-save"></i><span>Lưu bài khuyến mại</span>';
    }
    setPromotionFeedback('');
};

const setPromotionSubmitLoading = (isLoading) => {
    if (!promotionSubmitButton) {
        return;
    }

    promotionSubmitButton.disabled = isLoading;
    promotionSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang lưu...</span>'
        : editingPromotionId
            ? '<i class="bx bx-save"></i><span>Cập nhật bài</span>'
            : '<i class="bx bx-save"></i><span>Lưu bài khuyến mại</span>';
};

const fillPromotionForm = (promotion) => {
    if (!promotionForm || !promotion) {
        return;
    }

    editingPromotionId = promotion.id;
    promotionIdInput.value = promotion.id;
    promotionForm.elements.title.value = promotion.title || '';
    promotionForm.elements.badgeText.value = promotion.badgeText || '';
    promotionForm.elements.imageUrl.value = promotion.imageUrl || '';
    setPromotionImagePreview(promotion.imageUrl || '');
    promotionForm.elements.ctaText.value = promotion.ctaText || '';
    promotionForm.elements.ctaUrl.value = promotion.ctaUrl || '';
    promotionForm.elements.summary.value = promotion.summary || '';
    promotionForm.elements.content.value = promotion.content || '';
    promotionForm.elements.startsAt.value = promotion.startsAt || '';
    promotionForm.elements.endsAt.value = promotion.endsAt || '';
    promotionForm.elements.displayOrder.value = Number(promotion.displayOrder || 0);
    promotionForm.elements.showOnHome.checked = Boolean(promotion.showOnHome);

    if (promotionFormTitle) {
        promotionFormTitle.textContent = `Chỉnh sửa: ${promotion.title}`;
    }
    if (promotionSubmitButton) {
        promotionSubmitButton.innerHTML = '<i class="bx bx-save"></i><span>Cập nhật bài</span>';
    }

    promotionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    promotionForm.elements.title?.focus();
};

const buildPromotionUpdatePayload = (promotion, overrides = {}) => ({
    title: promotion.title || '',
    summary: promotion.summary || '',
    content: promotion.content || '',
    badgeText: promotion.badgeText || 'Khuyến mại',
    imageUrl: promotion.imageUrl || '',
    ctaText: promotion.ctaText || 'Xem ưu đãi',
    ctaUrl: promotion.ctaUrl || '#footer',
    startsAt: promotion.startsAt || '',
    endsAt: promotion.endsAt || '',
    showOnHome: Boolean(promotion.showOnHome),
    displayOrder: Number(promotion.displayOrder || 0),
    ...overrides
});

const resetBlogPostForm = () => {
    blogPostForm?.reset();
    editingBlogPostId = null;
    if (blogPostIdInput) {
        blogPostIdInput.value = '';
    }
    if (blogPostImageInput) {
        blogPostImageInput.value = '';
    }
    setBlogPostImagePreview('');
    if (blogPostFormTitle) {
        blogPostFormTitle.textContent = 'Bài blog mới';
    }
    if (blogPostSubmitButton) {
        blogPostSubmitButton.innerHTML = '<i class="bx bx-save"></i><span>Lưu bài blog</span>';
    }
    setBlogPostFeedback('');
};

const setBlogPostSubmitLoading = (isLoading) => {
    if (!blogPostSubmitButton) {
        return;
    }

    blogPostSubmitButton.disabled = isLoading;
    blogPostSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang lưu...</span>'
        : editingBlogPostId
            ? '<i class="bx bx-save"></i><span>Cập nhật bài</span>'
            : '<i class="bx bx-save"></i><span>Lưu bài blog</span>';
};

const fillBlogPostForm = (post) => {
    if (!blogPostForm || !post) {
        return;
    }

    editingBlogPostId = post.id;
    blogPostIdInput.value = post.id;
    blogPostForm.elements.title.value = post.title || '';
    blogPostForm.elements.slug.value = post.slug || '';
    blogPostForm.elements.category.value = post.category || '';
    blogPostForm.elements.imageUrl.value = post.imageUrl || post.image || '';
    setBlogPostImagePreview(post.imageUrl || post.image || '');
    blogPostForm.elements.imageAlt.value = post.imageAlt || '';
    blogPostForm.elements.excerpt.value = post.excerpt || '';
    blogPostForm.elements.content.value = typeof post.content === 'string' ? post.content : '';
    blogPostForm.elements.publishedAt.value = post.publishedAt || '';
    blogPostForm.elements.readTime.value = Number(post.readTime || 5);
    blogPostForm.elements.displayOrder.value = Number(post.displayOrder || 0);
    blogPostForm.elements.isPublished.checked = post.status === 'published' || Boolean(post.isPublished);
    blogPostForm.elements.featured.checked = Boolean(post.featured);
    blogPostForm.elements.showOnHome.checked = Boolean(post.showOnHome);

    if (blogPostFormTitle) {
        blogPostFormTitle.textContent = `Chỉnh sửa: ${post.title}`;
    }
    if (blogPostSubmitButton) {
        blogPostSubmitButton.innerHTML = '<i class="bx bx-save"></i><span>Cập nhật bài</span>';
    }

    blogPostForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    blogPostForm.elements.title?.focus();
};

const buildBlogPostUpdatePayload = (post, overrides = {}) => ({
    title: post.title || '',
    slug: post.slug || '',
    category: post.category || '',
    excerpt: post.excerpt || '',
    content: typeof post.content === 'string' ? post.content : '',
    imageUrl: post.imageUrl || post.image || '',
    imageAlt: post.imageAlt || '',
    publishedAt: post.publishedAt || '',
    readTime: Number(post.readTime || 5),
    status: post.status || (post.isPublished ? 'published' : 'draft'),
    featured: Boolean(post.featured),
    showOnHome: Boolean(post.showOnHome),
    displayOrder: Number(post.displayOrder || 0),
    ...overrides
});

const getUserAddressText = (user) => {
    const address = user?.address || {};

    return [
        address.detail,
        address.ward,
        address.district,
        address.province
    ].map((part) => String(part || '').trim()).filter(Boolean).join(', ');
};

const getUserProfileDate = (value) => {
    if (!value) {
        return 'Chưa cập nhật';
    }

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : dateFormatter.format(date);
};

const getCustomerDetailValue = (value, fallback = 'Chưa cập nhật') => {
    const normalizedValue = String(value || '').trim();

    return normalizedValue || fallback;
};

const closeCustomerDetail = () => {
    if (!customerDetailPanel) {
        return;
    }

    customerDetailPanel.classList.remove('is-visible');
    customerDetailPanel.classList.add('is-closing');
    customerDetailPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    window.clearTimeout(customerDetailCloseTimer);
    customerDetailCloseTimer = window.setTimeout(() => {
        customerDetailPanel.hidden = true;
        customerDetailPanel.classList.remove('is-closing');
    }, 280);
};

const openUserDetail = (user) => {
    if (!customerDetailPanel || !customerDetailBody || !user) {
        return;
    }

    const isSalesEmployee = user.role === 'staff';
    const createdDate = user.createdAt
        ? dateFormatter.format(new Date(user.createdAt))
        : 'Chưa rõ';
    const updatedDate = user.updatedAt
        ? dateFormatter.format(new Date(user.updatedAt))
        : 'Chưa rõ';
    const avatarHtml = user.avatarUrl
        ? `<img src="${escapeHtml(user.avatarUrl)}" alt="Ảnh đại diện ${escapeHtml(user.fullName || user.email)}">`
        : '<i class="bx bx-user"></i>';
    const addressText = getUserAddressText(user) || 'Chưa cập nhật';
    const genderText = genderLabels[user.gender] || 'Chưa cập nhật';
    const birthDateText = getUserProfileDate(user.birthDate);
    const salesTitle = user.salesTitle || 'Nhân viên kinh doanh';
    const salesExperience = user.salesExperience || 'Chưa cập nhật kinh nghiệm';
    const salesBio = getCustomerDetailValue(user.salesBio, 'Chưa cập nhật mô tả.');
    const homepageText = isSalesEmployee
        ? `${user.showOnHome ? 'Đang hiển thị' : 'Đang ẩn'} · Thứ tự ${Number(user.homeDisplayOrder || 0)}`
        : 'Không áp dụng';

    if (customerDetailEyebrow) {
        customerDetailEyebrow.textContent = isSalesEmployee
            ? 'Hồ sơ nhân viên'
            : user.role === 'admin'
                ? 'Hồ sơ admin'
                : 'Hồ sơ khách hàng';
    }

    if (customerDetailTitle) {
        customerDetailTitle.textContent = isSalesEmployee
            ? 'Thông tin nhân viên'
            : user.role === 'admin'
                ? 'Thông tin admin'
                : 'Thông tin khách hàng';
    }

    customerDetailBody.innerHTML = `
        <div class="customer-detail__profile">
            <span class="customer-detail__avatar">${avatarHtml}</span>
            <div>
                <h4>${escapeHtml(user.fullName || 'Chưa có tên')}</h4>
                <p>ID: ${user.id} · ${escapeHtml(roleLabels[user.role] || user.role || 'Khách hàng')} · Tạo ${escapeHtml(createdDate)}</p>
            </div>
        </div>
        <div class="customer-detail__grid">
            <div class="customer-detail__item">
                <span>Email</span>
                <strong>${escapeHtml(getCustomerDetailValue(user.email))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Số điện thoại</span>
                <strong>${escapeHtml(getCustomerDetailValue(user.phone))}</strong>
            </div>
            ${isSalesEmployee ? `
                <div class="customer-detail__item">
                    <span>Chức danh kinh doanh</span>
                    <strong>${escapeHtml(salesTitle)}</strong>
                </div>
                <div class="customer-detail__item">
                    <span>Kinh nghiệm</span>
                    <strong>${escapeHtml(salesExperience)}</strong>
                </div>
            ` : ''}
            <div class="customer-detail__item">
                <span>Số CCCD</span>
                <strong>${escapeHtml(getCustomerDetailValue(user.citizenId, 'Chưa cập nhật CCCD'))}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Ngày sinh</span>
                <strong>${escapeHtml(birthDateText)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Giới tính</span>
                <strong>${escapeHtml(genderText)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Ngày tạo</span>
                <strong>${escapeHtml(createdDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Cập nhật</span>
                <strong>${escapeHtml(updatedDate)}</strong>
            </div>
            <div class="customer-detail__item">
                <span>Vai trò</span>
                <strong>${escapeHtml(roleLabels[user.role] || user.role || 'Khách hàng')}</strong>
            </div>
            ${isSalesEmployee ? `
                <div class="customer-detail__item">
                    <span>Trang chủ</span>
                    <strong>${escapeHtml(homepageText)}</strong>
                </div>
                <div class="customer-detail__item customer-detail__item--wide">
                    <span>Mô tả nhân viên</span>
                    <strong>${escapeHtml(salesBio)}</strong>
                </div>
            ` : ''}
            <div class="customer-detail__item customer-detail__item--wide">
                <span>Địa chỉ liên hệ</span>
                <strong>${escapeHtml(addressText)}</strong>
            </div>
        </div>
    `;

    customerDetailPanel.hidden = false;
    customerDetailPanel.setAttribute('aria-hidden', 'false');
    customerDetailPanel.classList.remove('is-closing');
    document.body.classList.add('modal-open');
    window.clearTimeout(customerDetailCloseTimer);
    window.requestAnimationFrame(() => {
        customerDetailPanel.classList.add('is-visible');
    });
};

const openCustomerDetail = openUserDetail;

const getFilteredEmployees = () => {
    const keyword = String(employeeSearchInput?.value || '').trim().toLowerCase();
    const config = getActiveAccountConfig();
    const usersInActiveRole = employees.filter((user) => user.role === config.role);

    if (!keyword) {
        return usersInActiveRole;
    }

    return usersInActiveRole.filter((user) =>
        [
            user.fullName,
            user.email,
            user.phone,
            user.citizenId,
            user.birthDate,
            genderLabels[user.gender] || user.gender,
            user.salesTitle,
            user.salesExperience,
            user.salesBio,
            getUserAddressText(user),
            roleLabels[user.role] || user.role
        ]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
    );
};

const renderEmployees = () => {
    if (!employeeTableBody) {
        return;
    }

    const filteredEmployees = getFilteredEmployees();
    const config = getActiveAccountConfig();

    if (!filteredEmployees.length) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="table-empty">${config.emptyMessage}</td>
            </tr>
        `;
        return;
    }

    employeeTableBody.innerHTML = filteredEmployees.map((user) => {
        const isSelf = currentAdminUser?.id === user.id;
        const createdDate = user.createdAt
            ? dateFormatter.format(new Date(user.createdAt))
            : 'Chưa rõ';
        const updatedDate = user.updatedAt
            ? dateFormatter.format(new Date(user.updatedAt))
            : 'Chưa rõ';
        const phoneText = user.phone || 'Chưa cập nhật';
        const citizenIdText = user.citizenId || 'Chưa cập nhật CCCD';
        const birthDateText = getUserProfileDate(user.birthDate);
        const genderText = genderLabels[user.gender] || 'Chưa cập nhật';
        const addressText = getUserAddressText(user) || 'Chưa cập nhật';
        const salesTitle = user.salesTitle || 'Nhân viên kinh doanh';
        const salesExperience = user.salesExperience || 'Chưa cập nhật kinh nghiệm';
        const canShowOnHome = user.role === 'staff';
        const avatarHtml = user.avatarUrl
            ? `<img src="${escapeHtml(user.avatarUrl)}" alt="Ảnh đại diện ${escapeHtml(user.fullName || user.email)}">`
            : '<i class="bx bx-user"></i>';

        const roleControl = user.role === 'customer'
            ? '<span class="role-label role-label--customer">Khách hàng</span>'
            : activeAccountView === 'admins'
                ? '<span class="role-label role-label--admin">Admin</span>'
                : `
                    <select class="role-select" data-user-role="${user.id}" ${isSelf ? 'disabled' : ''}>
                        <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Nhân viên</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                `;
        const homepageControl = canShowOnHome
            ? `
                    <button type="button" class="homepage-toggle${user.showOnHome ? ' is-active' : ''}" data-toggle-home-user="${user.id}" aria-pressed="${user.showOnHome ? 'true' : 'false'}">
                        <i class="bx ${user.showOnHome ? 'bxs-star' : 'bx-star'}" aria-hidden="true"></i>
                        <span>${user.showOnHome ? 'Đang hiển thị' : 'Ẩn'}</span>
                    </button>
                    <small class="homepage-order">Thứ tự: ${Number(user.homeDisplayOrder || 0)}</small>
                `
            : '<span class="readonly-badge">Không áp dụng</span>';
        const profileHtml = canShowOnHome
            ? `
                    <strong>${escapeHtml(salesTitle)}</strong>
                    <span>${escapeHtml(salesExperience)}</span>
                `
            : `
                    <strong>${escapeHtml(birthDateText)}</strong>
                    <span>${escapeHtml(genderText)}</span>
                    <small>Cập nhật ${escapeHtml(updatedDate)}</small>
                `;
        const actionControl = isCurrentUserAdmin()
            ? `
                    <div class="table-actions">
                        ${user.role === 'customer' ? `
                            <button type="button" class="icon-btn icon-btn--neutral" data-view-user="${user.id}" aria-label="Xem thông tin ${escapeHtml(user.fullName || user.email)}" title="Xem thông tin khách hàng">
                                <i class="bx bx-show"></i>
                            </button>
                        ` : ''}
                        <button type="button" class="icon-btn icon-btn--edit" data-edit-user="${user.id}" aria-label="Sửa ${escapeHtml(user.fullName || user.email)}" title="Chỉnh sửa thông tin">
                            <i class="bx bx-pencil"></i>
                        </button>
                        <button type="button" class="icon-btn icon-btn--delete" data-delete-user="${user.id}" aria-label="Xóa ${escapeHtml(user.fullName || user.email)}" ${isSelf ? 'disabled' : ''}>
                            <i class="bx bx-trash"></i>
                        </button>
                    </div>
                `
            : '<span class="readonly-badge">Chỉ xem</span>';

        return `
            <tr data-view-user="${user.id}">
                <td>
                    <div class="employee-name">
                        <span class="employee-avatar">${avatarHtml}</span>
                        <span>
                            <strong>${escapeHtml(user.fullName || 'Chưa có tên')}</strong>
                            <small>ID: ${user.id} · Tạo ${createdDate}</small>
                        </span>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        <strong>${escapeHtml(user.email)}</strong>
                        <span>${escapeHtml(phoneText)}</span>
                        <small>CCCD: ${escapeHtml(citizenIdText)}</small>
                    </div>
                </td>
                <td>
                    <div class="employee-meta">
                        ${profileHtml}
                    </div>
                </td>
                <td>
                    <div class="employee-address">${escapeHtml(addressText)}</div>
                </td>
                <td>${roleControl}</td>
                <td>${homepageControl}</td>
                <td>${actionControl}</td>
            </tr>
        `;
    }).join('');
};

const loadEmployees = async () => {
    if (!canViewAccountView(activeAccountView) || !employeeTableBody) {
        return;
    }

    setEmployeeFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/users');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách tài khoản.');
        }

        employees = data.users || [];
        renderEmployees();
    } catch (error) {
        setEmployeeFeedback(error.message || 'Không thể tải danh sách tài khoản.', 'error');
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">Không thể tải danh sách tài khoản.</td>
            </tr>
        `;
    }
};

const resetEmployeeForm = () => {
    const config = getActiveAccountConfig();

    employeeForm?.reset();
    editingEmployeeId = null;
    if (employeeIdInput) {
        employeeIdInput.value = '';
    }
    if (employeeForm?.elements.role) {
        employeeForm.elements.role.value = config.role;
    }
    if (employeeFormTitle) {
        employeeFormTitle.textContent = config.createTitle;
    }
    if (employeeSubmitButton) {
        employeeSubmitButton.innerHTML = getCreateAccountButtonHtml();
    }
    if (employeeAvatarInput) {
        employeeAvatarInput.value = '';
    }
    setEmployeeAvatarPreview('');
    syncAccountViewContent();
    syncEmployeeFormMode();
    setEmployeeFeedback('');
};

const setEmployeeSubmitLoading = (isLoading) => {
    if (!employeeSubmitButton) {
        return;
    }

    employeeSubmitButton.disabled = isLoading;
    employeeSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i><span>Đang lưu...</span>'
        : editingEmployeeId
            ? '<i class="bx bx-save"></i><span>Cập nhật tài khoản</span>'
            : getCreateAccountButtonHtml();
};

const setAdminLogoutLoading = (isLoading) => {
    if (!adminLogoutButton) {
        return;
    }

    adminLogoutButton.disabled = isLoading;
    adminLogoutButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang đăng xuất...</span>'
        : '<i class="bx bx-log-out" aria-hidden="true"></i><span>Đăng xuất</span>';
};

const fillEmployeeForm = (user) => {
    if (!employeeForm || !user) {
        return;
    }

    const config = getActiveAccountConfig();

    editingEmployeeId = user.id;
    if (employeeIdInput) {
        employeeIdInput.value = user.id;
    }
    if (employeeFormCard) {
        employeeFormCard.hidden = false;
    }
    if (employeeFormEyebrow) {
        employeeFormEyebrow.textContent = config.formEyebrow;
    }

    employeeForm.elements.fullName.value = user.fullName || '';
    employeeForm.elements.email.value = user.email || '';
    employeeForm.elements.password.value = '';
    employeeForm.elements.role.value = user.role || 'staff';
    employeeForm.elements.phone.value = user.phone || '';
    employeeForm.elements.citizenId.value = user.citizenId || '';
    employeeForm.elements.birthDate.value = user.birthDate || '';
    employeeForm.elements.gender.value = user.gender || '';
    employeeForm.elements.addressProvince.value = user.address?.province || '';
    employeeForm.elements.addressDistrict.value = user.address?.district || '';
    employeeForm.elements.addressWard.value = user.address?.ward || '';
    employeeForm.elements.addressDetail.value = user.address?.detail || '';
    employeeForm.elements.avatarUrl.value = user.avatarUrl || '';
    employeeForm.elements.salesTitle.value = user.salesTitle || 'Nhân viên kinh doanh';
    employeeForm.elements.salesExperience.value = user.salesExperience || '';
    employeeForm.elements.salesBio.value = user.salesBio || '';
    employeeForm.elements.homeDisplayOrder.value = Number(user.homeDisplayOrder || 0);
    employeeForm.elements.showOnHome.checked = Boolean(user.showOnHome);
    syncEmployeeFormMode(user);
    if (employeeAvatarInput) {
        employeeAvatarInput.value = '';
    }
    setEmployeeAvatarPreview(user.avatarUrl || '');

    if (employeeFormTitle) {
        employeeFormTitle.textContent = `Chỉnh sửa: ${user.fullName || user.email}`;
    }
    if (employeeSubmitButton) {
        employeeSubmitButton.innerHTML = '<i class="bx bx-save"></i><span>Cập nhật tài khoản</span>';
    }

    employeeForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    (user.role === 'customer' ? employeeForm.elements.phone : employeeForm.elements.fullName)?.focus();
};

const buildUserUpdatePayload = (user, overrides = {}) => ({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    citizenId: user.citizenId || '',
    birthDate: user.birthDate || '',
    gender: user.gender || '',
    avatarUrl: user.avatarUrl || '',
    salesTitle: user.salesTitle || 'Nhân viên kinh doanh',
    salesExperience: user.salesExperience || '',
    salesBio: user.salesBio || '',
    showOnHome: Boolean(user.showOnHome),
    homeDisplayOrder: Number(user.homeDisplayOrder || 0),
    addressProvince: user.address?.province || '',
    addressDistrict: user.address?.district || '',
    addressWard: user.address?.ward || '',
    addressDetail: user.address?.detail || '',
    password: '',
    ...overrides
});

adminNavLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        const viewName = link.dataset.adminNav;

        if (isAccountView(viewName) && !canViewAccountView(viewName)) {
            showToast('Bạn không có quyền mở mục tài khoản này.', 'error');
            return;
        }

        switchAdminView(viewName);
    });
});

adminNotificationButton?.addEventListener('click', openAdminNotifications);

adminNotificationCloseButtons.forEach((button) => {
    button.addEventListener('click', closeAdminNotifications);
});

adminNotificationPanel?.addEventListener('click', (event) => {
    if (event.target === adminNotificationPanel || event.target.closest('[data-close-admin-notifications]')) {
        closeAdminNotifications();
        return;
    }

    const deleteButton = event.target.closest('[data-delete-admin-notification]');

    if (deleteButton) {
        event.preventDefault();
        event.stopPropagation();
        deleteAdminNotificationItem(deleteButton.dataset.deleteAdminNotification);
        return;
    }

    const viewButton = event.target.closest('[data-open-admin-notification-view]');

    if (viewButton) {
        event.preventDefault();
        const viewName = viewButton.dataset.openAdminNotificationView || 'cars';
        const notificationType = viewButton.dataset.openAdminNotificationType || '';
        const entityId = viewButton.dataset.openAdminNotificationEntityId || '';

        closeAdminNotifications();
        switchAdminView(viewName);

        if (notificationType === 'deposit-order' && entityId) {
            window.setTimeout(() => {
                openDepositOrderDetailAfterRefresh(entityId);
            }, 0);
        }
    }
});

employeeRefreshButton?.addEventListener('click', loadEmployees);
employeeResetButton?.addEventListener('click', resetEmployeeForm);
employeeSearchInput?.addEventListener('input', renderEmployees);
chooseEmployeeAvatarButton?.addEventListener('click', () => {
    employeeAvatarInput?.click();
});

employeeAvatarInput?.addEventListener('change', async () => {
    const file = employeeAvatarInput.files?.[0];

    if (!file || !employeeForm) {
        return;
    }

    setEmployeeFeedback('');
    chooseEmployeeAvatarButton.disabled = true;
    if (employeeAvatarFileName) {
        employeeAvatarFileName.textContent = 'Đang tải ảnh...';
    }

    try {
        const avatarUrl = await uploadEmployeeAvatar(file);

        employeeForm.elements.avatarUrl.value = avatarUrl;
        setEmployeeAvatarPreview(avatarUrl, file.name);
        showToast('Tải ảnh đại diện thành công.', 'success', 'Đã tải ảnh');
    } catch (error) {
        employeeAvatarInput.value = '';
        setEmployeeAvatarPreview(employeeForm.elements.avatarUrl.value || '');
        setEmployeeFeedback(error.message || 'Không thể tải ảnh đại diện.', 'error');
        showToast(error.message || 'Không thể tải ảnh đại diện.', 'error');
    } finally {
        chooseEmployeeAvatarButton.disabled = false;
    }
});

adminLogoutButton?.addEventListener('click', async () => {
    setAdminLogoutLoading(true);

    try {
        await requestJson('/api/auth/admin-logout', { method: 'POST' });
    } finally {
        window.location.replace('/admin-login?logout=success');
    }
});

employeeForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setEmployeeFeedback('');

    if (!isCurrentUserAdmin()) {
        setEmployeeFeedback('Chỉ tài khoản admin mới được quản lý tài khoản.', 'error');
        return;
    }

    const formData = new FormData(employeeForm);
    const password = String(formData.get('password') || '');
    const selectedRole = String(formData.get('role') || '');
    const isEditingEmployee = Boolean(editingEmployeeId);
    const config = getActiveAccountConfig();
    const editingUser = isEditingEmployee
        ? employees.find((user) => Number(user.id) === Number(editingEmployeeId))
        : null;
    const isEditingCustomer = Boolean(editingUser && editingUser.role === 'customer');

    if (!isEditingEmployee && password.length < 6) {
        setEmployeeFeedback('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
        return;
    }

    if (!isEditingEmployee && !config.canCreate) {
        setEmployeeFeedback('Mục khách hàng chỉ dùng để xem và chỉnh sửa tài khoản đã đăng ký.', 'error');
        return;
    }

    if (!isEditingEmployee && !['staff', 'admin'].includes(selectedRole)) {
        setEmployeeFeedback('Chỉ được tạo tài khoản nhân viên hoặc admin từ dashboard này.', 'error');
        return;
    }

    if (!isEditingEmployee && selectedRole !== config.role) {
        setEmployeeFeedback(`Hãy tạo tài khoản ${config.createLabel} trong đúng mục ${config.listTitle}.`, 'error');
        return;
    }

    setEmployeeSubmitLoading(true);

    try {
        const payload = {
            fullName: isEditingCustomer ? editingUser.fullName : formData.get('fullName'),
            email: isEditingCustomer ? editingUser.email : formData.get('email'),
            role: isEditingCustomer ? 'customer' : formData.get('role'),
            phone: formData.get('phone'),
            citizenId: formData.get('citizenId'),
            birthDate: isEditingCustomer ? formData.get('birthDate') : editingUser?.birthDate || '',
            gender: isEditingCustomer ? formData.get('gender') : editingUser?.gender || '',
            avatarUrl: isEditingCustomer ? editingUser.avatarUrl || '' : formData.get('avatarUrl'),
            salesTitle: isEditingCustomer ? editingUser.salesTitle || 'Nhân viên kinh doanh' : formData.get('salesTitle'),
            salesExperience: isEditingCustomer ? editingUser.salesExperience || '' : formData.get('salesExperience'),
            salesBio: isEditingCustomer ? editingUser.salesBio || '' : formData.get('salesBio'),
            showOnHome: isEditingCustomer ? false : formData.get('showOnHome') === '1',
            homeDisplayOrder: isEditingCustomer ? 0 : Number(formData.get('homeDisplayOrder') || 0),
            addressProvince: formData.get('addressProvince'),
            addressDistrict: formData.get('addressDistrict'),
            addressWard: formData.get('addressWard'),
            addressDetail: formData.get('addressDetail')
        };

        if (password) {
            payload.password = password;
        }

        const { response, data } = await requestJson(isEditingEmployee ? `/api/admin/users/${editingEmployeeId}` : '/api/admin/users', {
            method: isEditingEmployee ? 'PATCH' : 'POST',
            body: JSON.stringify({
                ...payload,
                password: isEditingEmployee ? payload.password || '' : password
            })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể lưu tài khoản lúc này.');
        }

        resetEmployeeForm();
        await loadEmployees();
        showToast(data.message || 'Lưu tài khoản thành công.', 'success', isEditingEmployee ? 'Đã cập nhật' : 'Đã tạo tài khoản');
    } catch (error) {
        setEmployeeFeedback(error.message || 'Không thể lưu tài khoản lúc này.', 'error');
        showToast(error.message || 'Không thể lưu tài khoản lúc này.', 'error');
    } finally {
        setEmployeeSubmitLoading(false);
    }
});

employeeTableBody?.addEventListener('change', async (event) => {
    const roleSelect = event.target.closest('[data-user-role]');

    if (!roleSelect) {
        return;
    }

    const userId = Number(roleSelect.dataset.userRole);
    const nextRole = roleSelect.value;
    const previousUser = employees.find((user) => user.id === userId);
    const previousRole = previousUser?.role;

    roleSelect.disabled = true;

    try {
        const { response, data } = await requestJson(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role: nextRole })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật phân quyền.');
        }

        await loadEmployees();
        showToast(data.message || 'Cập nhật phân quyền thành công.', 'success', 'Đã cập nhật');
    } catch (error) {
        roleSelect.value = previousRole || 'staff';
        roleSelect.disabled = false;
        showToast(error.message || 'Không thể cập nhật phân quyền.', 'error');
    }
});

employeeTableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-user]');
    const deleteButton = event.target.closest('[data-delete-user]');
    const homeToggleButton = event.target.closest('[data-toggle-home-user]');
    const explicitViewButton = event.target.closest('button[data-view-user]');
    const viewUserTarget = explicitViewButton || event.target.closest('tr[data-view-user]');

    if (editButton) {
        const userId = Number(editButton.dataset.editUser);
        const user = employees.find((item) => item.id === userId);

        fillEmployeeForm(user);
        return;
    }

    if (deleteButton) {
        const userId = Number(deleteButton.dataset.deleteUser);
        const user = employees.find((item) => item.id === userId);

        if (!user) {
            return;
        }

        const isConfirmed = window.confirm(`Bạn có chắc muốn xóa tài khoản "${user.fullName || user.email}"?`);

        if (!isConfirmed) {
            return;
        }

        deleteButton.disabled = true;

        try {
            const { response, data } = await requestJson(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể xóa tài khoản.');
            }

            await loadEmployees();
            showToast(data.message || 'Xóa tài khoản thành công.', 'success', 'Đã xóa tài khoản');
        } catch (error) {
            deleteButton.disabled = false;
            showToast(error.message || 'Không thể xóa tài khoản.', 'error');
        }
        return;
    }

    if (homeToggleButton) {
        const userId = Number(homeToggleButton.dataset.toggleHomeUser);
        const user = employees.find((item) => item.id === userId);

        if (!user || !['staff', 'admin'].includes(user.role)) {
            return;
        }

        homeToggleButton.disabled = true;

        try {
            const { response, data } = await requestJson(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify(buildUserUpdatePayload(user, {
                    showOnHome: !user.showOnHome
                }))
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật hiển thị trang chủ.');
            }

            await loadEmployees();
            showToast(
                data.message || 'Cập nhật hiển thị trang chủ thành công.',
                'success',
                user.showOnHome ? 'Đã ẩn khỏi trang chủ' : 'Đã hiển thị trang chủ'
            );
        } catch (error) {
            homeToggleButton.disabled = false;
            showToast(error.message || 'Không thể cập nhật hiển thị trang chủ.', 'error');
        }
        return;
    }

    if (!viewUserTarget) {
        return;
    }

    if (event.target.closest('button, select, a, input, textarea') && !explicitViewButton) {
        return;
    }

    const userId = Number(viewUserTarget.dataset.viewUser);
    const user = employees.find((item) => item.id === userId);

    if (user) {
        openUserDetail(user);
    }
});

promotionRefreshButton?.addEventListener('click', loadPromotions);
promotionResetButton?.addEventListener('click', resetPromotionForm);
promotionSearchInput?.addEventListener('input', renderPromotions);
blogPostRefreshButton?.addEventListener('click', loadBlogPosts);
blogPostResetButton?.addEventListener('click', resetBlogPostForm);
blogPostSearchInput?.addEventListener('input', renderBlogPosts);
testDriveRefreshButton?.addEventListener('click', loadTestDriveAppointments);
testDriveSearchInput?.addEventListener('input', renderTestDriveAppointments);
consultationRefreshButton?.addEventListener('click', loadConsultationRequests);
consultationSearchInput?.addEventListener('input', renderConsultationRequests);
consultationStatusFilter?.addEventListener('change', renderConsultationRequests);
depositConfigReloadButton?.addEventListener('click', loadAdminDepositPaymentConfig);
depositConfigResetButton?.addEventListener('click', () => {
    fillDepositConfigForm(depositPaymentConfig);
    setDepositConfigFeedback('');
});
depositConfigForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = getDepositConfigPayloadFromForm();

    if (!payload) {
        return;
    }

    if (!payload.accountName || payload.accountName.length < 2) {
        setDepositConfigFeedback('Vui lòng nhập chủ tài khoản nhận cọc.', 'error');
        depositConfigForm.elements.accountName?.focus();
        return;
    }

    if (!payload.bankName || payload.bankName.length < 2) {
        setDepositConfigFeedback('Vui lòng nhập ngân hàng nhận cọc.', 'error');
        depositConfigForm.elements.bankName?.focus();
        return;
    }

    if (!payload.accountNumber || payload.accountNumber.length < 3) {
        setDepositConfigFeedback('Vui lòng nhập số tài khoản nhận cọc.', 'error');
        depositConfigForm.elements.accountNumber?.focus();
        return;
    }

    if (payload.depositAmountOptions.length < 1) {
        setDepositConfigFeedback('Vui lòng nhập ít nhất một mức cọc hiển thị.', 'error');
        depositConfigForm.elements.depositAmountOptions?.focus();
        return;
    }

    if (payload.defaultDepositAmount < payload.minDepositAmount || payload.defaultDepositAmount > payload.maxDepositAmount) {
        setDepositConfigFeedback('Mức cọc mặc định phải nằm trong khoảng tối thiểu và tối đa.', 'error');
        depositConfigForm.elements.defaultDepositAmount?.focus();
        return;
    }

    if (payload.depositAmountOptions.some((amount) => amount < payload.minDepositAmount || amount > payload.maxDepositAmount)) {
        setDepositConfigFeedback('Các mức cọc hiển thị phải nằm trong khoảng tối thiểu và tối đa.', 'error');
        depositConfigForm.elements.depositAmountOptions?.focus();
        return;
    }

    if (!Number.isFinite(payload.holdHours) || payload.holdHours < 1 || payload.holdHours > 168) {
        setDepositConfigFeedback('Thời gian giữ xe phải từ 1 đến 168 giờ.', 'error');
        depositConfigForm.elements.holdHours?.focus();
        return;
    }

    if (payload.policyText.length < 20) {
        setDepositConfigFeedback('Vui lòng nhập chính sách đặt cọc tối thiểu 20 ký tự.', 'error');
        depositConfigForm.elements.policyText?.focus();
        return;
    }

    setDepositConfigLoading(true);
    setDepositConfigFeedback('');

    try {
        const { response, data } = await requestJson('/api/admin/deposit-payment/config', {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể lưu cấu hình đặt cọc.');
        }

        depositPaymentConfig = data.config || null;
        fillDepositConfigForm(depositPaymentConfig);
        setDepositConfigFeedback(data.message || 'Đã lưu cấu hình đặt cọc.', 'success');
        showToast(data.message || 'Đã lưu cấu hình đặt cọc.', 'success', 'Cấu hình đặt cọc');
    } catch (error) {
        setDepositConfigFeedback(error.message || 'Không thể lưu cấu hình đặt cọc.', 'error');
    } finally {
        setDepositConfigLoading(false);
    }
});
depositReportExportButton?.addEventListener('click', exportFilteredDepositOrdersCsv);
depositAuditExportButton?.addEventListener('click', exportFilteredDepositAuditCsv);
depositOrderRefreshButton?.addEventListener('click', loadDepositOrders);
depositOrderSearchInput?.addEventListener('input', renderDepositOrders);
depositOrderStatusFilter?.addEventListener('change', renderDepositOrders);
carBuyRequestRefreshButton?.addEventListener('click', loadCarBuyRequests);
carBuyRequestSearchInput?.addEventListener('input', renderCarBuyRequests);
carBuyRequestStatusFilter?.addEventListener('change', renderCarBuyRequests);
carSellRequestRefreshButton?.addEventListener('click', loadCarSellRequests);
carSellRequestSearchInput?.addEventListener('input', renderCarSellRequests);
carSellRequestStatusFilter?.addEventListener('change', renderCarSellRequests);

testDriveStatusSaveButton?.addEventListener('click', async () => {
    const appointment = getTestDriveAppointment(activeTestDriveAppointmentId);
    const statusNote = String(testDriveStatusNote?.value || '').trim();

    if (!appointment) {
        setTestDriveStatusFeedback('Không tìm thấy lịch hẹn cần cập nhật.', 'error');
        return;
    }

    if (['cancelled', 'pending'].includes(activeTestDriveStatus) && statusNote.length < 3) {
        setTestDriveStatusFeedback('Vui lòng nhập lý do khi hủy hoặc treo lịch hẹn.', 'error');
        testDriveStatusNote?.focus();
        return;
    }

    const needsReschedule = shouldRequireTestDriveReschedule(appointment);
    const preferredDate = String(testDriveNewDateInput?.value || '').trim();
    const preferredTimeSlot = String(testDriveNewTimeSlotInput?.value || '').trim();

    if (needsReschedule && (!preferredDate || !preferredTimeSlot)) {
        setTestDriveStatusFeedback('Vui lòng chọn ngày và khung giờ mới trước khi đồng ý lịch bị trùng.', 'error');
        (preferredDate ? testDriveNewTimeSlotInput : testDriveNewDateInput)?.focus();
        return;
    }

    if (
        needsReschedule
        && preferredDate === String(appointment.preferredDate || '').trim()
        && preferredTimeSlot === String(appointment.preferredTimeSlot || '').trim()
    ) {
        setTestDriveStatusFeedback('Vui lòng chọn khung giờ khác với lịch đang bị trùng.', 'error');
        testDriveNewTimeSlotInput?.focus();
        return;
    }

    setTestDriveStatusLoading(true);
    setTestDriveStatusFeedback('');

    try {
        const { response, data } = await requestJson(`/api/admin/test-drive-appointments/${appointment.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: activeTestDriveStatus,
                statusNote,
                preferredDate: needsReschedule ? preferredDate : '',
                preferredTimeSlot: needsReschedule ? preferredTimeSlot : ''
            })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật trạng thái lịch hẹn.');
        }

        await loadTestDriveAppointments();
        closeTestDriveStatusPanel();
        showToast(data.message || 'Cập nhật trạng thái lịch hẹn thành công.', 'success', 'Đã gửi thông báo khách hàng');
    } catch (error) {
        setTestDriveStatusFeedback(error.message || 'Không thể cập nhật trạng thái lịch hẹn.', 'error');
    } finally {
        setTestDriveStatusLoading(false);
    }
});

consultationStatusSaveButton?.addEventListener('click', async () => {
    const request = getConsultationRequest(activeConsultationRequestId);
    const status = String(consultationStatusSelect?.value || '').trim().toLowerCase();
    const statusNote = String(consultationStatusNote?.value || '').trim();

    if (!request) {
        setConsultationStatusFeedback('Không tìm thấy yêu cầu tư vấn cần cập nhật.', 'error');
        return;
    }

    if (!consultationStatusConfig[status]) {
        setConsultationStatusFeedback('Trạng thái yêu cầu tư vấn không hợp lệ.', 'error');
        consultationStatusSelect?.focus();
        return;
    }

    setConsultationStatusLoading(true);
    setConsultationStatusFeedback('');

    try {
        const { response, data } = await requestJson(`/api/admin/consultation-requests/${request.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                statusNote
            })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật trạng thái yêu cầu tư vấn.');
        }

        await loadConsultationRequests();
        closeConsultationStatusPanel();
        showToast(data.message || 'Cập nhật trạng thái yêu cầu tư vấn thành công.', 'success', 'Đã cập nhật');
    } catch (error) {
        setConsultationStatusFeedback(error.message || 'Không thể cập nhật trạng thái yêu cầu tư vấn.', 'error');
    } finally {
        setConsultationStatusLoading(false);
    }
});

depositOrderStatusSelect?.addEventListener('change', () => {
    syncDepositOrderStatusNoteField();
    setDepositOrderStatusFeedback('');
});

depositOrderRefundAmountInput?.addEventListener('input', () => {
    syncDepositOrderStatusNoteField();
    setDepositOrderStatusFeedback('');
});

depositOrderStatusSaveButton?.addEventListener('click', async () => {
    const order = getDepositOrder(activeDepositOrderId);
    const status = String(depositOrderStatusSelect?.value || '').trim().toLowerCase();
    const statusNote = String(depositOrderStatusNote?.value || '').trim();
    const paymentReference = String(depositOrderPaymentReferenceInput?.value || '').trim();
    const paymentReceivedAt = String(depositOrderPaymentReceivedAtInput?.value || '').trim();
    const paymentConfirmationNote = String(depositOrderPaymentConfirmationNoteInput?.value || '').trim();
    const refundAmount = normalizeMoneyAmountInput(depositOrderRefundAmountInput?.value, 0);
    const refundReference = String(depositOrderRefundReferenceInput?.value || '').trim();
    const refundCompletedAt = String(depositOrderRefundCompletedAtInput?.value || '').trim();
    const refundNote = String(depositOrderRefundNoteInput?.value || '').trim();

    if (!order) {
        setDepositOrderStatusFeedback('Không tìm thấy đơn đặt cọc cần cập nhật.', 'error');
        return;
    }

    if (!depositOrderStatusConfig[status]) {
        setDepositOrderStatusFeedback('Trạng thái đơn đặt cọc không hợp lệ.', 'error');
        depositOrderStatusSelect?.focus();
        return;
    }

    if (status === 'confirmed' && paymentReference.length < 3) {
        setDepositOrderStatusFeedback('Vui lòng nhập mã giao dịch hoặc mã tham chiếu khi xác nhận đã nhận tiền.', 'error');
        depositOrderPaymentReferenceInput?.focus();
        return;
    }

    if (status === 'confirmed') {
        const duplicateReferenceOrder = findDepositOrderByPaymentReference(paymentReference, order.id);

        if (duplicateReferenceOrder) {
            setDepositOrderStatusFeedback(`Mã giao dịch này đã dùng cho ${duplicateReferenceOrder.code || `#${duplicateReferenceOrder.id}`}. Vui lòng kiểm tra lại sao kê.`, 'error');
            depositOrderPaymentReferenceInput?.focus();
            return;
        }
    }

    if (status === 'confirmed' && !paymentReceivedAt) {
        setDepositOrderStatusFeedback('Vui lòng chọn thời gian nhận tiền.', 'error');
        depositOrderPaymentReceivedAtInput?.focus();
        return;
    }

    if (status === 'cancelled' && statusNote.length < 3) {
        setDepositOrderStatusFeedback('Vui lòng nhập lý do khi hủy đơn đặt cọc.', 'error');
        depositOrderStatusNote?.focus();
        return;
    }

    if (status === 'cancelled_after_deposit' && statusNote.length < 3) {
        setDepositOrderStatusFeedback('Vui lòng nhập lý do khi hủy giao dịch sau đặt cọc.', 'error');
        depositOrderStatusNote?.focus();
        return;
    }

    if (status === 'cancelled_after_deposit' && refundAmount > Number(order.depositAmount || 0)) {
        setDepositOrderStatusFeedback('Số tiền hoàn cọc không được lớn hơn số tiền đặt cọc đã nhận.', 'error');
        depositOrderRefundAmountInput?.focus();
        return;
    }

    if (status === 'cancelled_after_deposit' && refundAmount > 0 && refundReference.length < 3) {
        setDepositOrderStatusFeedback('Vui lòng nhập mã giao dịch hoàn cọc khi có số tiền hoàn.', 'error');
        depositOrderRefundReferenceInput?.focus();
        return;
    }

    if (status === 'cancelled_after_deposit' && refundAmount > 0 && !refundCompletedAt) {
        setDepositOrderStatusFeedback('Vui lòng chọn thời gian hoàn cọc.', 'error');
        depositOrderRefundCompletedAtInput?.focus();
        return;
    }

    if (['completed', 'cancelled_after_deposit'].includes(status)
        && order.status !== 'confirmed'
        && status !== order.status) {
        setDepositOrderStatusFeedback('Chỉ có thể chốt hoặc hủy sau đặt cọc khi đơn đang ở trạng thái đã nhận tiền.', 'error');
        depositOrderStatusSelect?.focus();
        return;
    }

    const submittedStatusNote = status === 'expired' && statusNote.length < 3
        ? `Đơn đặt cọc ${order.code || `#${order.id}`} đã quá hạn giữ chỗ.`
        : statusNote;

    setDepositOrderStatusLoading(true);
    setDepositOrderStatusFeedback('');

    try {
        const { response, data } = await requestJson(`/api/admin/deposit-orders/${order.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                statusNote: submittedStatusNote,
                paymentReference,
                paymentReceivedAt,
                paymentConfirmationNote,
                refundAmount,
                refundReference,
                refundCompletedAt,
                refundNote
            })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật trạng thái đơn đặt cọc.');
        }

        await loadDepositOrders();
        closeDepositOrderStatusPanel();
        showToast(data.message || 'Cập nhật trạng thái đơn đặt cọc thành công.', 'success', 'Đã cập nhật đơn cọc');
    } catch (error) {
        setDepositOrderStatusFeedback(error.message || 'Không thể cập nhật trạng thái đơn đặt cọc.', 'error');
    } finally {
        setDepositOrderStatusLoading(false);
    }
});

carBuyRequestStatusSelect?.addEventListener('change', () => {
    const status = String(carBuyRequestStatusSelect.value || '').trim().toLowerCase();
    const currentNote = String(carBuyRequestStatusNote?.value || '').trim();

    if (
        activeCarBuyRequestOriginalStatus === 'rejected'
        && status !== 'rejected'
        && currentNote === activeCarBuyRequestOriginalRejectedNote
    ) {
        carBuyRequestStatusNote.value = '';
    }

    syncCarBuyRequestStatusNoteField();
    setCarBuyRequestStatusFeedback('');
});

carBuyRequestStatusSaveButton?.addEventListener('click', async () => {
    const request = getCarBuyRequest(activeCarBuyRequestId);
    const status = String(carBuyRequestStatusSelect?.value || '').trim().toLowerCase();
    let statusNote = String(carBuyRequestStatusNote?.value || '').trim();

    if (!request) {
        setCarBuyRequestStatusFeedback('Không tìm thấy tin mua xe cần cập nhật.', 'error');
        return;
    }

    if (!carBuyRequestStatusConfig[status]) {
        setCarBuyRequestStatusFeedback('Trạng thái tin mua xe không hợp lệ.', 'error');
        carBuyRequestStatusSelect?.focus();
        return;
    }

    if (status === 'rejected' && statusNote.length < 3) {
        setCarBuyRequestStatusFeedback('Vui lòng nhập lý do khi từ chối tin mua xe.', 'error');
        carBuyRequestStatusNote?.focus();
        return;
    }

    if (
        activeCarBuyRequestOriginalStatus === 'rejected'
        && status !== 'rejected'
        && statusNote === activeCarBuyRequestOriginalRejectedNote
    ) {
        statusNote = '';
    }

    setCarBuyRequestStatusLoading(true);
    setCarBuyRequestStatusFeedback('');

    try {
        const { response, data } = await requestJson(`/api/admin/car-buy-requests/${request.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                statusNote
            })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật trạng thái tin mua xe.');
        }

        await loadCarBuyRequests();
        closeCarBuyRequestStatusPanel();
        showToast(data.message || 'Cập nhật trạng thái tin mua xe thành công.', 'success', 'Đã cập nhật');
    } catch (error) {
        setCarBuyRequestStatusFeedback(error.message || 'Không thể cập nhật trạng thái tin mua xe.', 'error');
    } finally {
        setCarBuyRequestStatusLoading(false);
    }
});

const handleTestDriveTableAction = async (event) => {
    const editButton = event.target.closest('[data-edit-test-drive-status]');
    const deleteButton = event.target.closest('[data-delete-test-drive]');

    if (editButton) {
        const appointment = getTestDriveAppointment(editButton.dataset.editTestDriveStatus);
        openTestDriveStatusPanel(appointment);
        return;
    }

    if (!deleteButton) {
        return;
    }

    const appointment = getTestDriveAppointment(deleteButton.dataset.deleteTestDrive);

    if (!appointment) {
        return;
    }

    const isConfirmed = window.confirm(`Bạn có chắc muốn xóa lịch lái thử #${appointment.id} của ${appointment.fullName || 'khách hàng'}?`);

    if (!isConfirmed) {
        return;
    }

    deleteButton.disabled = true;

    try {
        const { response, data } = await requestJson(`/api/admin/test-drive-appointments/${appointment.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xóa lịch hẹn lái thử.');
        }

        await loadTestDriveAppointments();
        showToast(data.message || 'Xóa lịch hẹn lái thử thành công.', 'success', 'Đã xóa lịch hẹn');
    } catch (error) {
        deleteButton.disabled = false;
        showToast(error.message || 'Không thể xóa lịch hẹn lái thử.', 'error');
    }
};

testDriveTableBody?.addEventListener('click', handleTestDriveTableAction);
testDriveProcessedTableBody?.addEventListener('click', handleTestDriveTableAction);

consultationTableBody?.addEventListener('click', async (event) => {
    const editStatusButton = event.target.closest('[data-edit-consultation-status]');
    const explicitViewButton = event.target.closest('button[data-view-consultation]');
    const deleteButton = event.target.closest('[data-delete-consultation]');
    const rowTarget = event.target.closest('tr[data-view-consultation]');

    if (editStatusButton) {
        const request = getConsultationRequest(editStatusButton.dataset.editConsultationStatus);
        openConsultationStatusPanel(request);
        return;
    }

    if (deleteButton) {
        const request = getConsultationRequest(deleteButton.dataset.deleteConsultation);

        if (!request) {
            return;
        }

        const isConfirmed = window.confirm(`Bạn có chắc muốn xóa yêu cầu tư vấn #${request.id} của ${request.fullName || 'khách hàng'}?`);

        if (!isConfirmed) {
            return;
        }

        deleteButton.disabled = true;

        try {
            const { response, data } = await requestJson(`/api/admin/consultation-requests/${request.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể xóa yêu cầu tư vấn.');
            }

            await loadConsultationRequests();
            showToast(data.message || 'Xóa yêu cầu tư vấn thành công.', 'success', 'Đã xóa yêu cầu');
        } catch (error) {
            deleteButton.disabled = false;
            setConsultationFeedback(error.message || 'Không thể xóa yêu cầu tư vấn.', 'error');
            showToast(error.message || 'Không thể xóa yêu cầu tư vấn.', 'error');
        }
        return;
    }

    const target = explicitViewButton || rowTarget;

    if (!target) {
        return;
    }

    if (event.target.closest('button, select, a, input, textarea') && !explicitViewButton) {
        return;
    }

    const request = getConsultationRequest(target.dataset.viewConsultation);

    if (request) {
        openConsultationDetail(request);
    }
});

depositOrderTableBody?.addEventListener('click', async (event) => {
    const expireButton = event.target.closest('[data-expire-deposit-order]');
    const editStatusButton = event.target.closest('[data-edit-deposit-order-status]');
    const explicitViewButton = event.target.closest('button[data-view-deposit-order]');
    const rowTarget = event.target.closest('tr[data-view-deposit-order]');

    if (expireButton) {
        const order = getDepositOrder(expireButton.dataset.expireDepositOrder);

        if (!order) {
            setDepositOrderFeedback('Không tìm thấy đơn đặt cọc cần xử lý.', 'error');
            return;
        }

        expireButton.disabled = true;
        setDepositOrderFeedback('');

        try {
            const { response, data } = await requestJson(`/api/admin/deposit-orders/${order.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: 'expired',
                    statusNote: `Đơn đặt cọc ${order.code || `#${order.id}`} đã quá hạn giữ chỗ và được mở lại để xử lý tiếp.`
                })
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể đánh dấu đơn đặt cọc quá hạn.');
            }

            await loadDepositOrders();
            showToast(data.message || 'Đã đánh dấu đơn đặt cọc quá hạn.', 'success', 'Đã cập nhật đơn cọc');
        } catch (error) {
            setDepositOrderFeedback(error.message || 'Không thể đánh dấu đơn đặt cọc quá hạn.', 'error');
        } finally {
            expireButton.disabled = false;
        }

        return;
    }

    if (editStatusButton) {
        const order = getDepositOrder(editStatusButton.dataset.editDepositOrderStatus);
        openDepositOrderStatusPanel(order);
        return;
    }

    const target = explicitViewButton || rowTarget;

    if (!target) {
        return;
    }

    if (event.target.closest('button, select, a, input, textarea') && !explicitViewButton) {
        return;
    }

    openDepositOrderDetailById(target.dataset.viewDepositOrder);
});

depositOrderTableBody?.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) {
        return;
    }

    const rowTarget = event.target.closest('tr[data-view-deposit-order]');

    if (!rowTarget || event.target.closest('button, select, a, input, textarea')) {
        return;
    }

    event.preventDefault();
    openDepositOrderDetailById(rowTarget.dataset.viewDepositOrder);
});

carBuyRequestTableBody?.addEventListener('click', async (event) => {
    const editStatusButton = event.target.closest('[data-edit-car-buy-request-status]');
    const explicitViewButton = event.target.closest('button[data-view-car-buy-request]');
    const deleteButton = event.target.closest('[data-delete-car-buy-request]');
    const rowTarget = event.target.closest('tr[data-view-car-buy-request]');

    if (editStatusButton) {
        const request = getCarBuyRequest(editStatusButton.dataset.editCarBuyRequestStatus);
        openCarBuyRequestStatusPanel(request);
        return;
    }

    if (deleteButton) {
        const request = getCarBuyRequest(deleteButton.dataset.deleteCarBuyRequest);

        if (!request) {
            return;
        }

        const isConfirmed = window.confirm(`Bạn có chắc muốn xóa tin mua xe ${request.code || `#${request.id}`} của ${request.fullName || 'khách hàng'}?`);

        if (!isConfirmed) {
            return;
        }

        deleteButton.disabled = true;

        try {
            const { response, data } = await requestJson(`/api/admin/car-buy-requests/${request.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể xóa tin mua xe.');
            }

            await loadCarBuyRequests();
            showToast(data.message || 'Xóa tin mua xe thành công.', 'success', 'Đã xóa tin');
        } catch (error) {
            deleteButton.disabled = false;
            setCarBuyRequestFeedback(error.message || 'Không thể xóa tin mua xe.', 'error');
            showToast(error.message || 'Không thể xóa tin mua xe.', 'error');
        }
        return;
    }

    const target = explicitViewButton || rowTarget;

    if (!target) {
        return;
    }

    if (event.target.closest('button, select, a, input, textarea') && !explicitViewButton) {
        return;
    }

    const request = getCarBuyRequest(target.dataset.viewCarBuyRequest);

    if (request) {
        openCarBuyRequestDetail(request);
    }
});

salesKpiTypeInput?.addEventListener('change', () => {
    if (editingSalesKpiRecordId) {
        salesKpiTypeInput.value = salesKpiRecords.find((record) => String(record.id) === String(editingSalesKpiRecordId))?.kpiType || 'acquisition';
        return;
    }
    renderSalesKpiSourceOptions();
    setSalesKpiFeedback('');
});

salesKpiSourceInput?.addEventListener('change', () => {
    renderSalesKpiSelectionPreview();
    setSalesKpiFeedback('');
});

salesKpiRefreshButton?.addEventListener('click', () => {
    loadSalesKpiRecords();
});

salesKpiForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const kpiType = String(salesKpiTypeInput?.value || '').trim().toLowerCase();
    const sourceId = Number(salesKpiSourceInput?.value || 0);
    const saleUserId = Number(salesKpiSaleInput?.value || 0);
    const rewardAmount = normalizeMoneyAmountInput(salesKpiRewardInput?.value, 0);
    const rewardStatus = String(salesKpiRewardStatusInput?.value || 'pending').trim().toLowerCase();
    const note = String(salesKpiNoteInput?.value || '').trim();

    if (!sourceId || !saleUserId) {
        setSalesKpiFeedback('Vui lòng chọn giao dịch thành công và sale chịu trách nhiệm.', 'error');
        return;
    }

    salesKpiSaveButton.disabled = true;
    setSalesKpiFeedback('');
    const isEditing = Boolean(editingSalesKpiRecordId);

    try {
        const { response, data } = await requestJson(
            isEditing ? `/api/admin/sales-kpi-records/${editingSalesKpiRecordId}` : '/api/admin/sales-kpi-records',
            {
                method: isEditing ? 'PATCH' : 'POST',
                body: JSON.stringify({ kpiType, sourceId, saleUserId, rewardAmount, rewardStatus, note })
            }
        );

        if (!response.ok) throw new Error(data.message || 'Không thể lưu KPI.');
        await loadSalesKpiRecords();
        showToast(data.message || 'Đã ghi nhận KPI.', 'success', 'KPI sale');
    } catch (error) {
        setSalesKpiFeedback(error.message || 'Không thể lưu KPI.', 'error');
    } finally {
        salesKpiSaveButton.disabled = false;
    }
});

salesKpiTableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-sales-kpi]');
    const cancelButton = event.target.closest('[data-cancel-sales-kpi]');

    if (editButton) {
        const record = salesKpiRecords.find((item) => String(item.id) === String(editButton.dataset.editSalesKpi));
        editSalesKpiRecord(record);
        return;
    }

    if (!cancelButton) return;
    const record = salesKpiRecords.find((item) => String(item.id) === String(cancelButton.dataset.cancelSalesKpi));
    if (!record) return;

    const cancellationNote = window.prompt('Nhập lý do hủy ghi nhận KPI (bắt buộc):', '');
    if (cancellationNote === null) return;
    if (String(cancellationNote).trim().length < 3) {
        setSalesKpiFeedback('Vui lòng nhập lý do hủy KPI ít nhất 3 ký tự.', 'error');
        return;
    }

    cancelButton.disabled = true;
    try {
        const { response, data } = await requestJson(`/api/admin/sales-kpi-records/${record.id}/cancel`, {
            method: 'PATCH',
            body: JSON.stringify({ cancellationNote })
        });
        if (!response.ok) throw new Error(data.message || 'Không thể hủy KPI.');
        await loadSalesKpiRecords();
        showToast(data.message || 'Đã hủy KPI.', 'success', 'KPI sale');
    } catch (error) {
        setSalesKpiFeedback(error.message || 'Không thể hủy KPI.', 'error');
        cancelButton.disabled = false;
    }
});

carSellRequestTableBody?.addEventListener('click', async (event) => {
    const editStatusButton = event.target.closest('[data-edit-car-sell-request-status]');
    const explicitViewButton = event.target.closest('button[data-view-car-sell-request]');
    const rowTarget = event.target.closest('tr[data-view-car-sell-request]');

    if (editStatusButton) {
        const request = getCarSellRequest(editStatusButton.dataset.editCarSellRequestStatus);
        openCarSellRequestStatusPanel(request);
        return;
    }

    const target = explicitViewButton || rowTarget;

    if (!target) {
        return;
    }

    if (event.target.closest('button, select, a, input, textarea') && !explicitViewButton) {
        return;
    }

    const request = getCarSellRequest(target.dataset.viewCarSellRequest);

    if (request) {
        openCarSellRequestDetail(request);
    }
});

carSellRequestStatusSelect?.addEventListener('change', () => {
    syncCarSellRequestStatusNoteField();
    setCarSellRequestStatusFeedback('');
});

carSellRequestStatusSaveButton?.addEventListener('click', async () => {
    const request = getCarSellRequest(activeCarSellRequestId);
    const status = String(carSellRequestStatusSelect?.value || '').trim().toLowerCase();
    const statusNote = String(carSellRequestStatusNote?.value || '').trim();
    const customerDealPriceText = String(carSellRequestCustomerDealPriceTextInput?.value || '').trim();
    const customerDealPriceValue = normalizeMoneyAmountInput(carSellRequestCustomerDealPriceValueInput?.value, 0);
    const finalPriceText = String(carSellRequestFinalPriceTextInput?.value || '').trim();
    const finalPriceValue = normalizeMoneyAmountInput(carSellRequestFinalPriceValueInput?.value, 0);

    if (!request) {
        setCarSellRequestStatusFeedback('Không tìm thấy thông tin đăng bán xe cần xử lý.', 'error');
        return;
    }

    if (!['approved', 'rejected'].includes(status)) {
        setCarSellRequestStatusFeedback('Trạng thái xử lý đăng bán xe không hợp lệ.', 'error');
        carSellRequestStatusSelect?.focus();
        return;
    }

    if (status === 'approved' && customerDealPriceText.length < 2) {
        setCarSellRequestStatusFeedback('Vui lòng nhập giá chốt với khách trước khi duyệt nhập kho.', 'error');
        carSellRequestCustomerDealPriceTextInput?.focus();
        return;
    }

    if (status === 'approved' && customerDealPriceValue <= 0) {
        setCarSellRequestStatusFeedback('Vui lòng nhập giá chốt với khách dạng số lớn hơn 0.', 'error');
        carSellRequestCustomerDealPriceValueInput?.focus();
        return;
    }

    if (status === 'approved' && finalPriceText.length < 2) {
        setCarSellRequestStatusFeedback('Vui lòng nhập giá bán trên hệ thống trước khi duyệt nhập kho.', 'error');
        carSellRequestFinalPriceTextInput?.focus();
        return;
    }

    if (status === 'approved' && finalPriceValue <= 0) {
        setCarSellRequestStatusFeedback('Vui lòng nhập giá bán trên hệ thống dạng số lớn hơn 0.', 'error');
        carSellRequestFinalPriceValueInput?.focus();
        return;
    }

    if (status === 'rejected' && statusNote.length < 3) {
        setCarSellRequestStatusFeedback('Vui lòng nhập lý do khi từ chối để khách hàng đăng lại.', 'error');
        carSellRequestStatusNote?.focus();
        return;
    }

    setCarSellRequestStatusLoading(true);
    setCarSellRequestStatusFeedback('');

    try {
        const { response, data } = await requestJson(`/api/admin/car-sell-requests/${request.id}/${status === 'approved' ? 'approve' : 'reject'}`, {
            method: 'PATCH',
            body: JSON.stringify({
                statusNote,
                customerDealPriceText: status === 'approved' ? customerDealPriceText : '',
                customerDealPriceValue: status === 'approved' ? customerDealPriceValue : 0,
                finalPriceText: status === 'approved' ? finalPriceText : '',
                finalPriceValue: status === 'approved' ? finalPriceValue : 0
            })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xử lý thông tin đăng bán xe.');
        }

        await Promise.all([loadCarSellRequests(), loadCars()]);
        closeCarSellRequestStatusPanel();
        showToast(
            data.message || 'Cập nhật xử lý đăng bán xe thành công.',
            'success',
            status === 'approved' ? 'Đã nhập kho' : 'Đã từ chối'
        );
    } catch (error) {
        setCarSellRequestStatusFeedback(error.message || 'Không thể xử lý thông tin đăng bán xe.', 'error');
    } finally {
        setCarSellRequestStatusLoading(false);
    }
});

customerDetailBody?.addEventListener('click', async (event) => {
    const proofChooseButton = event.target.closest('[data-admin-deposit-proof-choose]');

    if (proofChooseButton) {
        event.preventDefault();
        const orderId = proofChooseButton.dataset.adminDepositProofChoose;
        const proofInput = customerDetailBody.querySelector(`[data-admin-deposit-proof-input="${escapeSelectorValue(orderId)}"]`);

        proofInput?.click?.();
        return;
    }

    const updateOfferButton = event.target.closest('[data-update-car-buy-request-offer]');

    if (!updateOfferButton) {
        return;
    }

    const offerId = updateOfferButton.dataset.updateCarBuyRequestOffer;
    const { request, offer } = getCarBuyRequestOffer(offerId);

    if (!request || !offer) {
        showToast('Không tìm thấy đề xuất xe cần xử lý.', 'error');
        return;
    }

    const statusInput = [...customerDetailBody.querySelectorAll('[data-car-buy-request-offer-status]')]
        .find((input) => String(input.dataset.carBuyRequestOfferStatus) === String(offerId));
    const noteInput = [...customerDetailBody.querySelectorAll('[data-car-buy-request-offer-note]')]
        .find((input) => String(input.dataset.carBuyRequestOfferNote) === String(offerId));
    const status = String(statusInput?.value || '').trim().toLowerCase();
    const statusNote = String(noteInput?.value || '').trim();

    if (!carBuyRequestOfferStatusConfig[status]) {
        showToast('Trạng thái đề xuất xe không hợp lệ.', 'error');
        statusInput?.focus();
        return;
    }

    if (status === 'rejected' && statusNote.length < 3) {
        showToast('Vui lòng nhập lý do khi từ chối đề xuất xe.', 'error');
        noteInput?.focus();
        return;
    }

    updateOfferButton.disabled = true;
    updateOfferButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Đang lưu...</span>';

    try {
        const { response, data } = await requestJson(`/api/admin/car-buy-request-offers/${offer.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                statusNote
            })
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật đề xuất xe.');
        }

        await loadCarBuyRequests();
        const refreshedRequest = getCarBuyRequest(request.id);
        openCarBuyRequestDetail(refreshedRequest);
        showToast(data.message || 'Cập nhật đề xuất xe thành công.', 'success', 'Đã cập nhật');
    } catch (error) {
        updateOfferButton.disabled = false;
        updateOfferButton.innerHTML = '<i class="bx bx-save"></i><span>Cập nhật đề xuất</span>';
        showToast(error.message || 'Không thể cập nhật đề xuất xe.', 'error');
    }
});

choosePromotionImageButton?.addEventListener('click', () => {
    promotionImageInput?.click();
});

chooseBlogPostImageButton?.addEventListener('click', () => {
    blogPostImageInput?.click();
});

insertBlogContentImageButton?.addEventListener('click', () => {
    blogContentImageInput?.click();
});

promotionImageInput?.addEventListener('change', async () => {
    const file = promotionImageInput.files?.[0];

    if (!file || !promotionForm) {
        return;
    }

    setPromotionFeedback('');

    try {
        await openPromotionImageCropper(file);
    } catch (error) {
        promotionImageInput.value = '';
        setPromotionImagePreview(promotionForm.elements.imageUrl.value || '');
        setPromotionFeedback(error.message || 'Không thể tải ảnh khuyến mại.', 'error');
        showToast(error.message || 'Không thể tải ảnh khuyến mại.', 'error');
    }
});

blogPostImageInput?.addEventListener('change', async () => {
    const file = blogPostImageInput.files?.[0];

    if (!file || !blogPostForm) {
        return;
    }

    setBlogPostFeedback('');

    try {
        await openBlogPostImageCropper(file);
    } catch (error) {
        blogPostImageInput.value = '';
        setBlogPostImagePreview(blogPostForm.elements.imageUrl.value || '');
        setBlogPostFeedback(error.message || 'Không thể tải ảnh bài viết blog.', 'error');
        showToast(error.message || 'Không thể tải ảnh bài viết blog.', 'error');
    }
});

blogContentImageInput?.addEventListener('change', async () => {
    const file = blogContentImageInput.files?.[0];

    if (!file || !blogPostForm) {
        return;
    }

    setBlogPostFeedback('');

    try {
        await openBlogPostImageCropper(file, 'content');
    } catch (error) {
        blogContentImageInput.value = '';
        setBlogPostFeedback(error.message || 'Không thể chèn ảnh vào nội dung blog.', 'error');
        showToast(error.message || 'Không thể chèn ảnh vào nội dung blog.', 'error');
    }
});

[promotionCropZoomInput, promotionCropXInput, promotionCropYInput].forEach((input) => {
    input?.addEventListener('input', renderPromotionCropPreview);
});

[blogPostCropZoomInput, blogPostCropXInput, blogPostCropYInput].forEach((input) => {
    input?.addEventListener('input', renderBlogPostCropPreview);
});

promotionCropCloseButtons.forEach((button) => {
    button.addEventListener('click', closePromotionCropPanel);
});

blogPostCropCloseButtons.forEach((button) => {
    button.addEventListener('click', closeBlogPostCropPanel);
});

promotionCropPanel?.addEventListener('click', (event) => {
    if (event.target === promotionCropPanel) {
        closePromotionCropPanel();
    }
});

blogPostCropPanel?.addEventListener('click', (event) => {
    if (event.target === blogPostCropPanel) {
        closeBlogPostCropPanel();
    }
});

promotionCropApplyButton?.addEventListener('click', async () => {
    if (!promotionForm || !promotionCropState?.file) {
        setPromotionCropFeedback('Chưa có ảnh khuyến mại để cắt.');
        return;
    }

    const originalButtonHtml = promotionCropApplyButton.innerHTML;

    promotionCropApplyButton.disabled = true;
    promotionCropApplyButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Đang tải...</span>';
    setPromotionCropFeedback('');

    try {
        const originalFileName = String(promotionCropState.file.name || 'promotion').replace(/\.[^.]+$/, '');
        const dataUrl = getCroppedPromotionImageDataUrl();
        const imageUrl = await uploadCroppedPromotionImage({
            dataUrl,
            fileName: `${originalFileName}-banner.jpg`
        });

        promotionForm.elements.imageUrl.value = imageUrl;
        setPromotionImagePreview(imageUrl, `${originalFileName}-banner.jpg`);
        closePromotionCropPanel();
        showToast('Cắt và tải ảnh banner khuyến mại thành công.', 'success', 'Đã lưu ảnh banner');
    } catch (error) {
        setPromotionCropFeedback(error.message || 'Không thể cắt ảnh khuyến mại.');
    } finally {
        promotionCropApplyButton.disabled = false;
        promotionCropApplyButton.innerHTML = originalButtonHtml;
    }
});

blogPostCropApplyButton?.addEventListener('click', async () => {
    if (!blogPostForm || !blogPostCropState?.file) {
        setBlogPostCropFeedback('Chưa có ảnh bài viết blog để cắt.');
        return;
    }

    const originalButtonHtml = blogPostCropApplyButton.innerHTML;

    blogPostCropApplyButton.disabled = true;
    blogPostCropApplyButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Đang tải...</span>';
    setBlogPostCropFeedback('');

    try {
        const isContentImage = blogPostCropState.target === 'content';
        const originalFileName = String(blogPostCropState.file.name || 'blog-cover').replace(/\.[^.]+$/, '');
        const dataUrl = getCroppedBlogPostImageDataUrl();
        const imageUrl = await uploadCroppedBlogPostImage({
            dataUrl,
            fileName: `${originalFileName}-cover.jpg`
        });

        if (isContentImage) {
            insertBlogContentImageMarkup(imageUrl, `${originalFileName}-cover.jpg`);
        } else {
            blogPostForm.elements.imageUrl.value = imageUrl;
            setBlogPostImagePreview(imageUrl, `${originalFileName}-cover.jpg`);
        }
        closeBlogPostCropPanel();
        showToast(
            isContentImage
                ? 'Cắt và chèn ảnh vào nội dung thành công.'
                : 'Cắt và tải ảnh bài viết blog thành công.',
            'success',
            isContentImage ? 'Đã chèn ảnh' : 'Đã lưu ảnh blog'
        );
    } catch (error) {
        setBlogPostCropFeedback(error.message || 'Không thể cắt ảnh bài viết blog.');
    } finally {
        blogPostCropApplyButton.disabled = false;
        blogPostCropApplyButton.innerHTML = originalButtonHtml;
    }
});

promotionForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setPromotionFeedback('');

    const formData = new FormData(promotionForm);
    const payload = {
        title: formData.get('title'),
        summary: formData.get('summary'),
        content: formData.get('content'),
        badgeText: formData.get('badgeText'),
        imageUrl: formData.get('imageUrl'),
        ctaText: formData.get('ctaText'),
        ctaUrl: formData.get('ctaUrl'),
        startsAt: formData.get('startsAt'),
        endsAt: formData.get('endsAt'),
        showOnHome: formData.get('showOnHome') === '1',
        displayOrder: Number(formData.get('displayOrder') || 0)
    };
    const isEditing = Boolean(editingPromotionId);

    setPromotionSubmitLoading(true);

    try {
        const { response, data } = await requestJson(
            isEditing ? `/api/admin/promotions/${editingPromotionId}` : '/api/admin/promotions',
            {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(data.message || 'Không thể lưu bài khuyến mại lúc này.');
        }

        resetPromotionForm();
        await loadPromotions();
        showToast(
            data.message || 'Lưu bài khuyến mại thành công.',
            'success',
            isEditing ? 'Đã cập nhật bài' : 'Đã tạo bài'
        );
    } catch (error) {
        setPromotionFeedback(error.message || 'Không thể lưu bài khuyến mại lúc này.', 'error');
        showToast(error.message || 'Không thể lưu bài khuyến mại lúc này.', 'error');
    } finally {
        setPromotionSubmitLoading(false);
    }
});

promotionTableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-promotion]');
    const deleteButton = event.target.closest('[data-delete-promotion]');
    const toggleButton = event.target.closest('[data-toggle-promotion]');

    if (editButton) {
        const promotionId = Number(editButton.dataset.editPromotion);
        const promotion = promotions.find((item) => item.id === promotionId);

        if (promotion) {
            fillPromotionForm(promotion);
        }

        return;
    }

    if (toggleButton) {
        const promotionId = Number(toggleButton.dataset.togglePromotion);
        const promotion = promotions.find((item) => item.id === promotionId);

        if (!promotion) {
            return;
        }

        toggleButton.disabled = true;

        try {
            const { response, data } = await requestJson(`/api/admin/promotions/${promotionId}`, {
                method: 'PUT',
                body: JSON.stringify(buildPromotionUpdatePayload(promotion, {
                    showOnHome: !promotion.showOnHome
                }))
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật hiển thị khuyến mại.');
            }

            await loadPromotions();
            showToast(
                data.message || 'Cập nhật hiển thị khuyến mại thành công.',
                'success',
                promotion.showOnHome ? 'Đã ẩn khỏi trang chủ' : 'Đã hiển thị trang chủ'
            );
        } catch (error) {
            toggleButton.disabled = false;
            showToast(error.message || 'Không thể cập nhật hiển thị khuyến mại.', 'error');
        }

        return;
    }

    if (!deleteButton) {
        return;
    }

    const promotionId = Number(deleteButton.dataset.deletePromotion);
    const promotion = promotions.find((item) => item.id === promotionId);

    if (!promotion) {
        return;
    }

    const isConfirmed = window.confirm(`Bạn có chắc muốn xóa bài khuyến mại "${promotion.title}"?`);

    if (!isConfirmed) {
        return;
    }

    deleteButton.disabled = true;

    try {
        const { response, data } = await requestJson(`/api/admin/promotions/${promotionId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xóa bài khuyến mại.');
        }

        if (String(editingPromotionId) === String(promotionId)) {
            resetPromotionForm();
        }

        await loadPromotions();
        showToast(data.message || 'Xóa bài khuyến mại thành công.', 'success', 'Đã xóa bài');
    } catch (error) {
        deleteButton.disabled = false;
        showToast(error.message || 'Không thể xóa bài khuyến mại.', 'error');
    }
});

blogPostForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setBlogPostFeedback('');

    const formData = new FormData(blogPostForm);
    const payload = {
        title: formData.get('title'),
        slug: formData.get('slug'),
        category: formData.get('category'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        imageUrl: formData.get('imageUrl'),
        imageAlt: formData.get('imageAlt'),
        publishedAt: formData.get('publishedAt'),
        readTime: Number(formData.get('readTime') || 5),
        displayOrder: Number(formData.get('displayOrder') || 0),
        status: formData.get('isPublished') === '1' ? 'published' : 'draft',
        featured: formData.get('featured') === '1',
        showOnHome: formData.get('showOnHome') === '1'
    };
    const isEditing = Boolean(editingBlogPostId);

    setBlogPostSubmitLoading(true);

    try {
        const { response, data } = await requestJson(
            isEditing ? `/api/admin/blog-posts/${editingBlogPostId}` : '/api/admin/blog-posts',
            {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(data.message || 'Không thể lưu bài viết blog lúc này.');
        }

        resetBlogPostForm();
        await loadBlogPosts();
        showToast(
            data.message || 'Lưu bài viết blog thành công.',
            'success',
            isEditing ? 'Đã cập nhật bài' : 'Đã tạo bài'
        );
    } catch (error) {
        setBlogPostFeedback(error.message || 'Không thể lưu bài viết blog lúc này.', 'error');
        showToast(error.message || 'Không thể lưu bài viết blog lúc này.', 'error');
    } finally {
        setBlogPostSubmitLoading(false);
    }
});

blogPostTableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-blog-post]');
    const deleteButton = event.target.closest('[data-delete-blog-post]');
    const toggleHomeButton = event.target.closest('[data-toggle-blog-home]');
    const toggleFeaturedButton = event.target.closest('[data-toggle-blog-featured]');

    if (editButton) {
        const postId = Number(editButton.dataset.editBlogPost);
        const post = blogPosts.find((item) => item.id === postId);

        if (post) {
            fillBlogPostForm(post);
        }

        return;
    }

    if (toggleHomeButton) {
        const postId = Number(toggleHomeButton.dataset.toggleBlogHome);
        const post = blogPosts.find((item) => item.id === postId);

        if (!post) {
            return;
        }

        toggleHomeButton.disabled = true;

        try {
            const { response, data } = await requestJson(`/api/admin/blog-posts/${postId}`, {
                method: 'PUT',
                body: JSON.stringify(buildBlogPostUpdatePayload(post, {
                    showOnHome: !post.showOnHome
                }))
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật hiển thị Home.');
            }

            await loadBlogPosts();
            showToast(
                data.message || 'Cập nhật hiển thị Home thành công.',
                'success',
                post.showOnHome ? 'Đã ẩn khỏi Home' : 'Đã đưa lên Home'
            );
        } catch (error) {
            toggleHomeButton.disabled = false;
            showToast(error.message || 'Không thể cập nhật hiển thị Home.', 'error');
        }

        return;
    }

    if (toggleFeaturedButton) {
        const postId = Number(toggleFeaturedButton.dataset.toggleBlogFeatured);
        const post = blogPosts.find((item) => item.id === postId);

        if (!post) {
            return;
        }

        toggleFeaturedButton.disabled = true;

        try {
            const { response, data } = await requestJson(`/api/admin/blog-posts/${postId}`, {
                method: 'PUT',
                body: JSON.stringify(buildBlogPostUpdatePayload(post, {
                    featured: !post.featured
                }))
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật bài nổi bật.');
            }

            await loadBlogPosts();
            showToast(
                data.message || 'Cập nhật bài nổi bật thành công.',
                'success',
                post.featured ? 'Đã bỏ nổi bật' : 'Đã đưa vào nổi bật'
            );
        } catch (error) {
            toggleFeaturedButton.disabled = false;
            showToast(error.message || 'Không thể cập nhật bài nổi bật.', 'error');
        }

        return;
    }

    if (!deleteButton) {
        return;
    }

    const postId = Number(deleteButton.dataset.deleteBlogPost);
    const post = blogPosts.find((item) => item.id === postId);

    if (!post) {
        return;
    }

    const isConfirmed = window.confirm(`Bạn có chắc muốn xóa bài viết "${post.title}"?`);

    if (!isConfirmed) {
        return;
    }

    deleteButton.disabled = true;

    try {
        const { response, data } = await requestJson(`/api/admin/blog-posts/${postId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xóa bài viết blog.');
        }

        if (String(editingBlogPostId) === String(postId)) {
            resetBlogPostForm();
        }

        await loadBlogPosts();
        showToast(data.message || 'Xóa bài viết blog thành công.', 'success', 'Đã xóa bài');
    } catch (error) {
        deleteButton.disabled = false;
        showToast(error.message || 'Không thể xóa bài viết blog.', 'error');
    }
});

if (carForm) {
    carForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFeedback('');

        if (!selectedCarImages.length) {
            setFeedback('Vui lòng chọn ít nhất một ảnh xe.', 'error');
            return;
        }

        const formData = new FormData(carForm);
        const payload = {
            brand: formData.get('brand'),
            category: formData.get('category'),
            name: formData.get('name'),
            description: formData.get('description'),
            type: formData.get('type'),
            priceText: formData.get('priceText'),
            priceValue: Number(formData.get('priceValue') || 0),
            image: selectedCarImages[0],
            images: selectedCarImages,
            year: Number(formData.get('year') || 0),
            fuel: formData.get('fuel'),
            mileageText: formData.get('mileageText'),
            mileageValue: Number(formData.get('mileageValue') || 0),
            seats: formData.get('seats'),
            gearbox: formData.get('gearbox'),
            drivetrain: formData.get('drivetrain'),
            origin: formData.get('origin'),
            condition: formData.get('condition'),
            color: formData.get('color'),
            actionText: formData.get('actionText')
        };

        const editingCarId = carIdInput.value;
        const isEditing = Boolean(editingCarId);

        submitButton.disabled = true;
        submitButton.textContent = isEditing ? 'Đang cập nhật...' : 'Đang thêm...';

        try {
            const { response, data } = await requestJson(
                isEditing ? `/api/cars/${editingCarId}` : '/api/cars',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(data.message || 'Không thể lưu xe lúc này.');
            }

            setFeedback(data.message || 'Lưu xe thành công.');
            resetFormState();
            await loadCars();
            showToast(
                data.message || (isEditing ? 'Cập nhật xe thành công.' : 'Thêm xe thành công.'),
                'success',
                isEditing ? 'Đã cập nhật xe' : 'Đã thêm xe'
            );
        } catch (error) {
            setFeedback(error.message || 'Không thể lưu xe lúc này.', 'error');
            showToast(error.message || 'Không thể lưu xe lúc này.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = carIdInput.value ? 'Cập nhật xe' : 'Thêm xe';
        }
    });
}

chooseImagesButton?.addEventListener('click', () => {
    carImagesInput?.click();
});

carImagesInput?.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
        return;
    }

    const availableSlots = maxCarImages - selectedCarImages.length;

    if (availableSlots <= 0) {
        showToast(`Mỗi xe chỉ được lưu tối đa ${maxCarImages} ảnh.`, 'error');
        carImagesInput.value = '';
        return;
    }

    const uploadFiles = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
        showToast(`Chỉ tải thêm ${availableSlots} ảnh để không vượt quá ${maxCarImages} ảnh mỗi xe.`, 'error');
    }

    const defaultButtonHtml = chooseImagesButton?.innerHTML || '';

    if (chooseImagesButton) {
        chooseImagesButton.disabled = true;
        chooseImagesButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Đang tải...</span>';
    }

    try {
        const uploadedImages = await uploadCarImages(uploadFiles);

        setCarImages([...selectedCarImages, ...uploadedImages]);
        showToast('Ảnh xe đã được tải lên.', 'success', 'Đã thêm ảnh');
    } catch (error) {
        showToast(error.message || 'Không thể tải ảnh xe lúc này.', 'error');
    } finally {
        if (chooseImagesButton) {
            chooseImagesButton.disabled = false;
            chooseImagesButton.innerHTML = defaultButtonHtml;
        }
        carImagesInput.value = '';
    }
});

imagePreviewList?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-image]');

    if (!removeButton) {
        return;
    }

    const imageIndex = Number(removeButton.dataset.removeImage);

    if (!Number.isInteger(imageIndex)) {
        return;
    }

    setCarImages(selectedCarImages.filter((image, index) => index !== imageIndex));
});

openFormButton?.addEventListener('click', () => {
    resetFormState(false);
    openEditor();
    carForm?.elements.name?.focus();
});

closeFormButton?.addEventListener('click', resetFormState);
resetFormButton?.addEventListener('click', () => resetFormState(false));
refreshListButton?.addEventListener('click', loadCars);
searchInput?.addEventListener('input', renderCars);

editorPanel?.addEventListener('click', (event) => {
    if (event.target === editorPanel) {
        resetFormState();
    }
});

customerDetailBody?.addEventListener('change', async (event) => {
    const proofInput = event.target.closest('[data-admin-deposit-proof-input]');

    if (!proofInput) {
        return;
    }

    const orderId = proofInput.dataset.adminDepositProofInput;
    const file = proofInput.files?.[0] || null;
    const chooseButton = customerDetailBody.querySelector(`[data-admin-deposit-proof-choose="${escapeSelectorValue(orderId)}"]`);

    if (!file) {
        return;
    }

    chooseButton?.setAttribute('disabled', 'disabled');
    setAdminDepositProofFeedback(orderId, 'Đang tải biên lai...', 'loading');

    try {
        const data = await uploadAdminDepositTransferProof(orderId, file);

        await syncAdminDepositOrderProofUi(orderId);
        showToast(data.message || 'Đã tải biên lai chuyển khoản.', 'success', 'Biên lai đặt cọc');
        setAdminDepositProofFeedback(orderId, data.message || 'Đã tải biên lai chuyển khoản.', 'success');
    } catch (error) {
        setAdminDepositProofFeedback(orderId, error.message || 'Không thể tải biên lai.', 'error');
        showToast(error.message || 'Không thể tải biên lai.', 'error', 'Biên lai đặt cọc');
    } finally {
        proofInput.value = '';
        chooseButton?.removeAttribute('disabled');
    }
});

depositOrderStatusPanel?.addEventListener('click', (event) => {
    const proofChooseButton = event.target.closest('[data-admin-deposit-proof-choose]');

    if (!proofChooseButton) {
        return;
    }

    event.preventDefault();
    const orderId = proofChooseButton.dataset.adminDepositProofChoose;
    const proofInput = depositOrderStatusPanel.querySelector(`[data-admin-deposit-proof-input="${escapeSelectorValue(orderId)}"]`);

    proofInput?.click?.();
});

depositOrderStatusPanel?.addEventListener('change', async (event) => {
    const proofInput = event.target.closest('[data-admin-deposit-proof-input]');

    if (!proofInput) {
        return;
    }

    const orderId = proofInput.dataset.adminDepositProofInput;
    const file = proofInput.files?.[0] || null;
    const chooseButton = depositOrderStatusPanel.querySelector(`[data-admin-deposit-proof-choose="${escapeSelectorValue(orderId)}"]`);

    if (!file) {
        return;
    }

    chooseButton?.setAttribute('disabled', 'disabled');
    setAdminDepositProofFeedback(orderId, 'Đang tải biên lai...', 'loading');

    try {
        const data = await uploadAdminDepositTransferProof(orderId, file);

        await syncAdminDepositOrderProofUi(orderId);
        setDepositOrderStatusFeedback(data.message || 'Đã tải biên lai chuyển khoản.', 'success');
        showToast(data.message || 'Đã tải biên lai chuyển khoản.', 'success', 'Biên lai đặt cọc');
    } catch (error) {
        setAdminDepositProofFeedback(orderId, error.message || 'Không thể tải biên lai.', 'error');
        setDepositOrderStatusFeedback(error.message || 'Không thể tải biên lai.', 'error');
    } finally {
        proofInput.value = '';
        chooseButton?.removeAttribute('disabled');
    }
});

customerDetailCloseButtons.forEach((button) => {
    button.addEventListener('click', closeCustomerDetail);
});

testDriveStatusCloseButtons.forEach((button) => {
    button.addEventListener('click', closeTestDriveStatusPanel);
});

consultationStatusCloseButtons.forEach((button) => {
    button.addEventListener('click', closeConsultationStatusPanel);
});

depositOrderStatusCloseButtons.forEach((button) => {
    button.addEventListener('click', closeDepositOrderStatusPanel);
});

carBuyRequestStatusCloseButtons.forEach((button) => {
    button.addEventListener('click', closeCarBuyRequestStatusPanel);
});

carSellRequestStatusCloseButtons.forEach((button) => {
    button.addEventListener('click', closeCarSellRequestStatusPanel);
});

testDriveStatusOptionButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setActiveTestDriveStatus(button.dataset.statusOption);
        setTestDriveStatusFeedback('');
    });
});

customerDetailPanel?.addEventListener('click', (event) => {
    if (event.target === customerDetailPanel) {
        closeCustomerDetail();
    }
});

testDriveStatusPanel?.addEventListener('click', (event) => {
    if (event.target === testDriveStatusPanel) {
        closeTestDriveStatusPanel();
    }
});

consultationStatusPanel?.addEventListener('click', (event) => {
    if (event.target === consultationStatusPanel) {
        closeConsultationStatusPanel();
    }
});

depositOrderStatusPanel?.addEventListener('click', (event) => {
    if (event.target === depositOrderStatusPanel) {
        closeDepositOrderStatusPanel();
    }
});

carBuyRequestStatusPanel?.addEventListener('click', (event) => {
    if (event.target === carBuyRequestStatusPanel) {
        closeCarBuyRequestStatusPanel();
    }
});

carSellRequestStatusPanel?.addEventListener('click', (event) => {
    if (event.target === carSellRequestStatusPanel) {
        closeCarSellRequestStatusPanel();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && adminNotificationPanel?.classList.contains('is-open')) {
        closeAdminNotifications();
        return;
    }

    if (event.key === 'Escape' && !promotionCropPanel?.hidden) {
        closePromotionCropPanel();
        return;
    }

    if (event.key === 'Escape' && !blogPostCropPanel?.hidden) {
        closeBlogPostCropPanel();
        return;
    }

    if (event.key === 'Escape' && !editorPanel?.hidden) {
        resetFormState();
        return;
    }

    if (event.key === 'Escape' && !testDriveStatusPanel?.hidden) {
        closeTestDriveStatusPanel();
        return;
    }

    if (event.key === 'Escape' && !consultationStatusPanel?.hidden) {
        closeConsultationStatusPanel();
        return;
    }

    if (event.key === 'Escape' && !depositOrderStatusPanel?.hidden) {
        closeDepositOrderStatusPanel();
        return;
    }

    if (event.key === 'Escape' && !carBuyRequestStatusPanel?.hidden) {
        closeCarBuyRequestStatusPanel();
        return;
    }

    if (event.key === 'Escape' && !carSellRequestStatusPanel?.hidden) {
        closeCarSellRequestStatusPanel();
        return;
    }

    if (event.key === 'Escape' && !customerDetailPanel?.hidden) {
        closeCustomerDetail();
    }
});

carTableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-car]');
    const deleteButton = event.target.closest('[data-delete-car]');

    if (editButton) {
        const carId = Number(editButton.dataset.editCar);
        const car = cars.find((item) => item.id === carId);

        if (car) {
            fillForm(car);
        }

        return;
    }

    if (deleteButton) {
        const carId = Number(deleteButton.dataset.deleteCar);
        const car = cars.find((item) => item.id === carId);

        if (!car) {
            return;
        }

        const isConfirmed = window.confirm(`Bạn có chắc muốn xóa xe "${car.name}"?`);

        if (!isConfirmed) {
            return;
        }

        try {
            const { response, data } = await requestJson(`/api/cars/${carId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể xóa xe lúc này.');
            }

            setFeedback(data.message || 'Xóa xe thành công.');
            if (String(carIdInput.value) === String(carId)) {
                resetFormState();
            }
            await loadCars();
            showToast(data.message || 'Xóa xe thành công.', 'success', 'Đã xóa xe');
        } catch (error) {
            setFeedback(error.message || 'Không thể xóa xe lúc này.', 'error');
            showToast(error.message || 'Không thể xóa xe lúc này.', 'error');
        }
    }
});

const initializeAdminPage = async () => {
    const canUseAdmin = await syncCurrentAdminUser();

    if (!canUseAdmin) {
        return;
    }

    await loadAdminNotifications();
    if (!adminNotificationRefreshTimer) {
        adminNotificationRefreshTimer = window.setInterval(loadAdminNotifications, 60000);
    }
    await loadCars();
};

initializeAdminPage();
