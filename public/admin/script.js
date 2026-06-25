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
const carSellRequestStatusSaveButton = document.querySelector('#car-sell-request-status-save-button');
const carSellRequestStatusFeedback = document.querySelector('#car-sell-request-status-feedback');
const carSellRequestStatusCloseButtons = document.querySelectorAll('[data-close-car-sell-request-status]');

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
let testDriveAppointments = [];
let consultationRequests = [];
let carBuyRequests = [];
let carSellRequests = [];
let currentAdminUser = null;
let editingEmployeeId = null;
let editingPromotionId = null;
let activeAccountView = 'staff';
let selectedCarImages = [];
let toastId = 0;
let modalCloseTimer = null;
let customerDetailCloseTimer = null;
let testDriveStatusCloseTimer = null;
let consultationStatusCloseTimer = null;
let carBuyRequestStatusCloseTimer = null;
let carSellRequestStatusCloseTimer = null;
let promotionCropCloseTimer = null;
let activeTestDriveAppointmentId = null;
let activeTestDriveStatus = 'approved';
let activeConsultationRequestId = null;
let activeCarBuyRequestId = null;
let activeCarBuyRequestOriginalStatus = 'pending';
let activeCarBuyRequestOriginalRejectedNote = '';
let activeCarSellRequestId = null;
let promotionCropState = null;

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
    financing: 'Tư vấn trả góp',
    rolling_cost: 'Chi phí lăn bánh',
    viewing: 'Đặt lịch xem xe',
    similar_car: 'Tư vấn xe tương tự'
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
    actionText: ['Còn xe', 'Xe đã bán']
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

const hasCarValue = (value) => String(value ?? '').trim().length > 0;

const isAvailableCar = (car) => {
    const normalizedStatus = normalizeSearchValue(car?.actionText || 'Còn xe');

    return !normalizedStatus.includes('da ban')
        && !normalizedStatus.includes('het hang')
        && !normalizedStatus.includes('het xe');
};

const getCarStatusMeta = (car) => {
    if (isAvailableCar(car)) {
        return {
            label: car?.actionText || 'Còn xe',
            className: 'is-available'
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

    if (viewName === 'test-drives') {
        loadTestDriveAppointments();
    }

    if (viewName === 'consultations') {
        loadConsultationRequests();
    }

    if (viewName === 'car-buy-requests') {
        loadCarBuyRequests();
    }

    if (viewName === 'car-sell-requests') {
        loadCarSellRequests();
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
    const soldCars = totalCars - availableCars.length;
    const newCars = items.filter((car) => normalizeSearchValue(car.condition).includes('moi')).length;
    const inventoryValue = availableCars.reduce((sum, car) => sum + Number(car.priceValue || 0), 0);
    const averageAvailablePrice = availableCars.length ? Math.round(inventoryValue / availableCars.length) : 0;
    const incompleteCars = items.filter((car) => getCarDataIssues(car).length > 0).length;
    const customerSellCars = items.filter((car) =>
        String(car.inventorySource?.type || '').trim() === 'customer_sell_request'
    ).length;

    totalCarsElement.textContent = String(totalCars);
    totalCarsDetailElement.textContent = customerSellCars
        ? `${availableCars.length} còn hàng, ${soldCars} đã bán, ${customerSellCars} xe khách gửi bán`
        : `${availableCars.length} còn hàng, ${soldCars} đã bán`;
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

    carSellRequestStatusNote.required = needsRejectedReason;
    carSellRequestStatusNote.placeholder = needsRejectedReason
        ? 'Nhập lý do từ chối để gửi khách hàng...'
        : 'Nhập ghi chú khi duyệt nhập kho nếu cần...';
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
        carSellRequestStatusSummary.textContent = `${request.fullName || 'Khách hàng'} - ${carTitle || 'Xe cần bán'} - ${request.phone || 'Chưa có SĐT'}`;
    }

    if (carSellRequestStatusSelect) {
        carSellRequestStatusSelect.value = 'approved';
    }

    if (carSellRequestStatusNote) {
        carSellRequestStatusNote.value = '';
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
                        <span>${escapeHtml(request.price || 'Chưa có giá')}</span>
                        <small>${escapeHtml(request.code || `BX-${request.id}`)} · Tạo ${escapeHtml(createdDate)}</small>
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
                <p>${escapeHtml(request.price || 'Chưa có giá')} · ${escapeHtml(getCarSellRequestStatusLabel(request.status))} · Tạo ${escapeHtml(createdDate)}</p>
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
                <strong>${escapeHtml(request.price || 'Chưa cập nhật')}</strong>
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
testDriveRefreshButton?.addEventListener('click', loadTestDriveAppointments);
testDriveSearchInput?.addEventListener('input', renderTestDriveAppointments);
consultationRefreshButton?.addEventListener('click', loadConsultationRequests);
consultationSearchInput?.addEventListener('input', renderConsultationRequests);
consultationStatusFilter?.addEventListener('change', renderConsultationRequests);
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

    if (!request) {
        setCarSellRequestStatusFeedback('Không tìm thấy thông tin đăng bán xe cần xử lý.', 'error');
        return;
    }

    if (!['approved', 'rejected'].includes(status)) {
        setCarSellRequestStatusFeedback('Trạng thái xử lý đăng bán xe không hợp lệ.', 'error');
        carSellRequestStatusSelect?.focus();
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
                statusNote
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

[promotionCropZoomInput, promotionCropXInput, promotionCropYInput].forEach((input) => {
    input?.addEventListener('input', renderPromotionCropPreview);
});

promotionCropCloseButtons.forEach((button) => {
    button.addEventListener('click', closePromotionCropPanel);
});

promotionCropPanel?.addEventListener('click', (event) => {
    if (event.target === promotionCropPanel) {
        closePromotionCropPanel();
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

customerDetailCloseButtons.forEach((button) => {
    button.addEventListener('click', closeCustomerDetail);
});

testDriveStatusCloseButtons.forEach((button) => {
    button.addEventListener('click', closeTestDriveStatusPanel);
});

consultationStatusCloseButtons.forEach((button) => {
    button.addEventListener('click', closeConsultationStatusPanel);
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
    if (event.key === 'Escape' && !promotionCropPanel?.hidden) {
        closePromotionCropPanel();
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

    await loadCars();
};

initializeAdminPage();
