const detailRoot = document.querySelector('#car-detail-root');
const compareModal = document.querySelector('#compare-modal');
const compareSearchInput = document.querySelector('#compare-search-input');
const comparePicker = document.querySelector('#compare-picker');
const compareTableWrap = document.querySelector('#compare-table-wrap');
const compareCount = document.querySelector('#compare-count');
const compareCloseButtons = document.querySelectorAll('[data-close-compare]');
const consultationModal = document.querySelector('#consultation-modal');
const consultationForm = document.querySelector('#consultation-form');
const consultationModalTitle = document.querySelector('#consultation-modal-title');
const consultationModalSummary = document.querySelector('#consultation-modal-summary');
const consultationCarIdInput = document.querySelector('#consultation-car-id');
const consultationRequestTypeInput = document.querySelector('#consultation-request-type');
const consultationSubmitButton = document.querySelector('#consultation-submit-button');
const consultationFeedback = document.querySelector('#consultation-feedback');
const consultationTestDriveLink = document.querySelector('#consultation-test-drive-link');
const consultationCallLink = document.querySelector('#consultation-call-link');
const consultationContactDateInput = document.querySelector('#consultation-contact-date');
const consultationContactTimeInput = document.querySelector('#consultation-contact-time');
const consultationPreferredContactTimeInput = document.querySelector('#consultation-preferred-contact-time');
const consultationCloseButtons = document.querySelectorAll('[data-close-consultation]');
let currentUser = null;
let favoriteCarIds = new Set();
let currentCar = null;
let allCars = [];
let selectedCompareCarIds = [];
let galleryAutoplayTimer = null;
const GALLERY_AUTOPLAY_DELAY = 5000;
const MAX_COMPARE_CARS = 3;
const DEFAULT_DEALERSHIP_HOTLINE = '0854955761';
const SOLD_CAR_CONSULTATION_NOTE = 'Khách quan tâm xe đã hết hàng, cần tư vấn xe tương tự.';
let dealershipHotline = DEFAULT_DEALERSHIP_HOTLINE;
const consultationRequestTypeLabels = {
    consultation: 'Nhận tư vấn & báo giá',
    quote: 'Yêu cầu báo giá',
    financing: 'Tư vấn trả góp',
    rolling_cost: 'Chi phí lăn bánh',
    viewing: 'Đặt lịch xem xe',
    similar_car: 'Tư vấn xe tương tự'
};

const consultationDateFormatter = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
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
    const queryId = params.get('id');

    if (queryId) {
        return queryId;
    }

    const [, carsSegment, carId] = window.location.pathname.split('/');

    return carsSegment === 'cars' ? carId : '';
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

const getAbsoluteUrl = (value) => {
    try {
        return new URL(value || '/', window.location.origin).href;
    } catch (error) {
        return window.location.origin;
    }
};

const normalizeSeoText = (value, maxLength = 160) => {
    const normalizedText = String(value || '').replace(/\s+/g, ' ').trim();

    if (normalizedText.length <= maxLength) {
        return normalizedText;
    }

    return `${normalizedText.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
};

const setMetaContent = (selector, content) => {
    const element = document.querySelector(selector);

    if (element) {
        element.setAttribute('content', content);
    }
};

const updateCarSeo = (car, images, description) => {
    const primaryImage = images[0] || car.image || '/images/rental-1.png';
    const canonicalPath = `/cars/${encodeURIComponent(car.id)}`;
    const canonicalUrl = getAbsoluteUrl(canonicalPath);
    const title = normalizeSeoText(`${car.name} ${car.year || ''} giá ${car.price || 'liên hệ'} | OkXe`, 68);
    const seoDescription = normalizeSeoText(
        `Xem chi tiết ${car.name}${car.year ? ` đời ${car.year}` : ''}, giá ${car.price || 'liên hệ'}, ${car.mileage || 'số km đang cập nhật'}, ${car.fuel || 'nhiên liệu đang cập nhật'}, ${car.gearbox || 'hộp số đang cập nhật'}. Liên hệ OkXe để được tư vấn mua xe cũ minh bạch.`,
        158
    );
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: car.name,
        brand: {
            '@type': 'Brand',
            name: car.brand || 'OkXe'
        },
        image: (images.length ? images : [primaryImage]).map(getAbsoluteUrl),
        description: seoDescription || description,
        sku: `OKXE-CAR-${car.id}`,
        category: car.category || 'Ô tô cũ',
        offers: {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'VND',
            price: Number(car.priceValue || 0),
            availability: getCarStatusClass(car.actionText) === 'is-available'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/UsedCondition',
            seller: {
                '@type': 'Organization',
                name: 'OkXe'
            }
        }
    };

    document.title = title;

    if (canonicalLink) {
        canonicalLink.href = canonicalUrl;
    }

    setMetaContent('meta[name="description"]', seoDescription);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', seoDescription);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[property="og:image"]', getAbsoluteUrl(primaryImage));
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', seoDescription);
    setMetaContent('meta[name="twitter:image"]', getAbsoluteUrl(primaryImage));

    const structuredDataElement = document.querySelector('#car-seo-json');

    if (structuredDataElement) {
        structuredDataElement.textContent = JSON.stringify(structuredData);
    }
};

const requestJson = async (url, options = {}) => {
    const requestOptions = {
        method: options.method || 'GET',
        headers: { ...(options.headers || {}) }
    };

    if (options.body) {
        requestOptions.body = options.body;
        requestOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, requestOptions);
    const data = await response.json().catch(() => ({}));

    return { response, data };
};

const isFavoriteCar = (carId) => favoriteCarIds.has(String(carId));
const isCompareCar = (carId) => selectedCompareCarIds.includes(String(carId));

const setFavoriteCars = (cars = []) => {
    favoriteCarIds = new Set(
        (Array.isArray(cars) ? cars : []).map((car) => String(car.id))
    );
};

const getCarStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLocaleLowerCase('vi-VN');

    return ['xe đã bán', 'hết xe', 'hết hàng'].includes(normalizedStatus)
        ? 'is-sold'
        : 'is-available';
};

const normalizeTextForCompare = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

const getCarDisplayName = (car) => {
    const brand = String(car?.brand || '').trim();
    const name = String(car?.name || '').trim();

    if (!brand) {
        return name || 'xe này';
    }

    if (!name) {
        return brand;
    }

    return normalizeTextForCompare(name).startsWith(normalizeTextForCompare(brand))
        ? name
        : `${brand} ${name}`;
};

const isCarAvailableForTestDrive = (car) => getCarStatusClass(car?.actionText) === 'is-available';

const getPhoneHref = (phone) => String(phone || '').replace(/[^\d+]/g, '');

const syncConsultationCallLink = () => {
    if (!consultationCallLink) {
        return;
    }

    const phoneHref = getPhoneHref(dealershipHotline || DEFAULT_DEALERSHIP_HOTLINE);
    consultationCallLink.href = `tel:${phoneHref}`;
    consultationCallLink.setAttribute('aria-label', `Gọi ngay ${dealershipHotline || DEFAULT_DEALERSHIP_HOTLINE}`);
    consultationCallLink.title = dealershipHotline || DEFAULT_DEALERSHIP_HOTLINE;
};

const loadSiteConfig = async () => {
    try {
        const { response, data } = await requestJson('/api/site-config');

        if (response.ok && data.hotline) {
            dealershipHotline = String(data.hotline).trim() || DEFAULT_DEALERSHIP_HOTLINE;
        }
    } catch (error) {
        dealershipHotline = DEFAULT_DEALERSHIP_HOTLINE;
    }

    syncConsultationCallLink();
};

const syncFavoriteButton = (carId) => {
    const normalizedCarId = String(carId || '');
    const button = document.querySelector(`[data-favorite-car="${CSS.escape(normalizedCarId)}"]`);

    if (!button) {
        return;
    }

    const isActive = isFavoriteCar(normalizedCarId);
    const icon = button.querySelector('i');

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    button.setAttribute('aria-label', `${isActive ? 'Bỏ yêu thích' : 'Yêu thích'} ${currentCar?.name || 'xe này'}`);

    if (icon) {
        icon.className = `bx ${isActive ? 'bxs-heart' : 'bx-heart'}`;
    }
};

const renderError = (message) => {
    if (!detailRoot) {
        return;
    }

    detailRoot.innerHTML = `
        <article class="detail-error">
            <i class="bx bx-error-circle"></i>
            <div>
                <h1>Không thể mở chi tiết xe</h1>
                <p>${escapeHtml(message)}</p>
            </div>
            <a href="/#rentals">Quay lại danh sách xe</a>
        </article>
    `;
};

const renderSpecs = (car) => {
    const specs = [
        ['Hãng xe', car.brand],
        ['Phân khúc', car.category],
        ['Kiểu vận hành', car.type],
        ['Năm sản xuất', car.year],
        ['Nhiên liệu', car.fuel],
        ['Số km', car.mileage],
        ['Số chỗ', car.seats],
        ['Hộp số', car.gearbox],
        ['Dẫn động', car.drivetrain],
        ['Xuất xứ', car.origin],
        ['Tình trạng', car.condition],
        ['Màu sắc', car.color],
        ['Trạng thái', car.actionText]
    ];

    return specs.map(([label, value]) => `
        <div class="spec-item">
            <span>${escapeHtml(label)}</span>
            <strong${label === 'Trạng thái' ? ` class="detail-status ${getCarStatusClass(value)}"` : ''}>${escapeHtml(value || 'Chưa cập nhật')}</strong>
        </div>
    `).join('');
};

const renderRelatedCars = (currentCar, cars) => {
    const relatedCars = cars
        .filter((car) => car.id !== currentCar.id && car.category === currentCar.category)
        .slice(0, 3);

    if (!relatedCars.length) {
        return '';
    }

    return `
        <section class="detail-card">
            <h2><i class="bx bx-category"></i>Xe cùng phân khúc</h2>
            <div class="related-grid">
                ${relatedCars.map((car) => {
                    const image = getCarImages(car)[0] || car.image;

                    return `
                        <a class="related-card" href="/cars/${car.id}">
                            <img src="${escapeHtml(image)}" alt="${escapeHtml(car.name)}">
                            <span>${escapeHtml(car.category)}</span>
                            <strong>${escapeHtml(car.name)}</strong>
                            <small>${escapeHtml(car.price)}</small>
                        </a>
                    `;
                }).join('')}
            </div>
        </section>
    `;
};

const getCarDetailUrl = (carId) => `/cars/${encodeURIComponent(carId)}`;

const getCarById = (carId) => allCars.find((car) => String(car.id) === String(carId));

const getCompareCars = () => selectedCompareCarIds.map(getCarById).filter(Boolean);

const getCompareSearchResults = () => {
    const keyword = String(compareSearchInput?.value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
    const availableCars = allCars.filter((car) => !isCompareCar(car.id));

    if (!keyword) {
        return availableCars.slice(0, 8);
    }

    return availableCars.filter((car) => [
        car.name,
        car.brand,
        car.category,
        car.type,
        car.year,
        car.fuel,
        car.gearbox,
        car.drivetrain
    ].join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .includes(keyword)).slice(0, 10);
};

const renderComparePicker = () => {
    if (!comparePicker) {
        return;
    }

    if (selectedCompareCarIds.length >= MAX_COMPARE_CARS) {
        comparePicker.innerHTML = `
            <article class="compare-picker__empty">
                <strong>Đã chọn đủ 3 xe</strong>
                <p>Xóa bớt một xe khỏi bảng để thêm xe khác.</p>
            </article>
        `;
        return;
    }

    const searchResults = getCompareSearchResults();

    if (!searchResults.length) {
        comparePicker.innerHTML = `
            <article class="compare-picker__empty">
                <strong>Không tìm thấy xe</strong>
                <p>Thử nhập tên, hãng, năm sản xuất hoặc nhiên liệu khác.</p>
            </article>
        `;
        return;
    }

    comparePicker.innerHTML = searchResults.map((car) => {
        const image = getCarImages(car)[0] || car.image || '/images/rental-1.png';

        return `
            <button type="button" class="compare-picker__item" data-add-compare-car="${escapeHtml(car.id)}">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(car.name)}">
                <span>
                    <strong>${escapeHtml(car.name || 'Xe chưa có tên')}</strong>
                    <small>${escapeHtml([car.year, car.fuel, car.gearbox, car.drivetrain].filter(Boolean).join(' • ') || 'Chưa cập nhật')}</small>
                </span>
                <i class="bx bx-plus" aria-hidden="true"></i>
            </button>
        `;
    }).join('');
};

const getDescriptionPreview = (description) => {
    const fullText = String(description || '').trim() || 'Chưa cập nhật';
    const maxLength = 150;
    const hasMore = fullText.length > maxLength;

    return {
        fullText,
        previewText: hasMore ? `${fullText.slice(0, maxLength).trim()}...` : fullText,
        hasMore
    };
};

const renderCompareTable = () => {
    if (!compareTableWrap) {
        return;
    }

    const compareCars = getCompareCars();

    if (!compareCars.length) {
        compareTableWrap.innerHTML = `
            <article class="compare-empty">
                <i class="bx bx-git-compare" aria-hidden="true"></i>
                <strong>Chưa có xe để so sánh</strong>
                <p>Chọn xe từ danh sách bên trái hoặc nhấn nút so sánh trên xe hiện tại.</p>
            </article>
        `;
        return;
    }

    const specRows = [
        ['Giá bán', 'price', 'Liên hệ'],
        ['Trạng thái', 'actionText', 'Còn xe'],
        ['Phân khúc', 'category', 'Chưa cập nhật'],
        ['Kiểu vận hành', 'type', 'Chưa cập nhật'],
        ['Hãng xe', 'brand', 'Chưa cập nhật'],
        ['Năm sản xuất', 'year', 'Chưa cập nhật'],
        ['Nhiên liệu', 'fuel', 'Chưa cập nhật'],
        ['Số km', 'mileage', 'Chưa cập nhật'],
        ['Số chỗ', 'seats', 'Chưa cập nhật'],
        ['Hộp số', 'gearbox', 'Chưa cập nhật'],
        ['Dẫn động', 'drivetrain', 'Chưa cập nhật'],
        ['Xuất xứ', 'origin', 'Chưa cập nhật'],
        ['Tình trạng', 'condition', 'Chưa cập nhật'],
        ['Màu sắc', 'color', 'Chưa cập nhật']
    ];

    compareTableWrap.innerHTML = `
        <div class="compare-table" style="--compare-columns: ${compareCars.length}">
            <div class="compare-table__label">Xe</div>
            ${compareCars.map((car) => {
                const image = getCarImages(car)[0] || car.image || '/images/rental-1.png';

                return `
                    <article class="compare-car">
                        <img src="${escapeHtml(image)}" alt="${escapeHtml(car.name)}">
                        <strong>${escapeHtml(car.name || 'Xe chưa có tên')}</strong>
                        <a href="${getCarDetailUrl(car.id)}">Xem chi tiết</a>
                        <button type="button" data-remove-compare-car="${escapeHtml(car.id)}" aria-label="Xóa ${escapeHtml(car.name)} khỏi so sánh">
                            <i class="bx bx-x" aria-hidden="true"></i>
                        </button>
                    </article>
                `;
            }).join('')}
            ${specRows.map(([label, fieldName, fallback]) => `
                <div class="compare-table__label">${escapeHtml(label)}</div>
                ${compareCars.map((car) => `<div class="compare-table__value">${escapeHtml(car[fieldName] || fallback)}</div>`).join('')}
            `).join('')}
            <div class="compare-table__label">Mô tả</div>
            ${compareCars.map((car) => {
                const description = getDescriptionPreview(car.description);

                return `
                    <div class="compare-table__value compare-description">
                        <p data-preview-text="${escapeHtml(description.previewText)}" data-full-text="${escapeHtml(description.fullText)}">${escapeHtml(description.previewText)}</p>
                        ${description.hasMore ? '<button type="button" data-toggle-compare-description aria-expanded="false">Xem thêm</button>' : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

const renderCompareModal = () => {
    if (compareCount) {
        compareCount.textContent = `Đã chọn ${selectedCompareCarIds.length}/${MAX_COMPARE_CARS} xe`;
    }

    renderComparePicker();
    renderCompareTable();
};

const addCompareCar = (carId) => {
    const normalizedCarId = String(carId || '');

    if (!normalizedCarId || isCompareCar(normalizedCarId) || !getCarById(normalizedCarId)) {
        return;
    }

    if (selectedCompareCarIds.length >= MAX_COMPARE_CARS) {
        window.alert('Bạn chỉ có thể so sánh tối đa 3 xe.');
        return;
    }

    selectedCompareCarIds = [...selectedCompareCarIds, normalizedCarId];
    renderCompareModal();
};

const openCompareModal = (carId) => {
    if (!compareModal) {
        return;
    }

    if (carId && !isCompareCar(carId)) {
        addCompareCar(carId);
    } else {
        renderCompareModal();
    }

    compareModal.classList.add('is-open');
    compareModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('compare-modal-open');
    compareSearchInput?.focus();
};

const closeCompareModal = () => {
    if (!compareModal) {
        return;
    }

    compareModal.classList.remove('is-open');
    compareModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('compare-modal-open');
};

const getConsultationRequestType = (requestType) =>
    Object.prototype.hasOwnProperty.call(consultationRequestTypeLabels, requestType)
        ? requestType
        : 'consultation';

const setConsultationFeedback = (message, type = 'success') => {
    if (!consultationFeedback) {
        return;
    }

    consultationFeedback.textContent = message || '';
    consultationFeedback.className = 'consultation-feedback';

    if (message) {
        consultationFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setConsultationSubmitLoading = (isLoading) => {
    if (!consultationSubmitButton) {
        return;
    }

    const requestType = String(consultationRequestTypeInput?.value || '').trim();
    const label = requestType === 'similar_car'
        ? 'Gửi yêu cầu tư vấn xe tương tự'
        : 'Gửi yêu cầu tư vấn';

    consultationSubmitButton.disabled = isLoading;
    consultationSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang gửi...</span>'
        : `<i class="bx bx-send" aria-hidden="true"></i><span>${escapeHtml(label)}</span>`;
};

const getTodayInputDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatConsultationDate = (dateValue) => {
    if (!dateValue) {
        return '';
    }

    const date = new Date(`${dateValue}T00:00:00`);

    return Number.isNaN(date.getTime()) ? '' : consultationDateFormatter.format(date);
};

const setConsultationTimePickerMinDate = () => {
    if (!consultationContactDateInput) {
        return;
    }

    const todayValue = getTodayInputDate();
    consultationContactDateInput.min = todayValue;

    if (consultationContactDateInput.value && consultationContactDateInput.value < todayValue) {
        consultationContactDateInput.value = todayValue;
    }
};

const getPreferredContactTime = () => {
    const dateValue = consultationContactDateInput?.value || '';
    const timeValue = consultationContactTimeInput?.value || '';
    const formattedDate = formatConsultationDate(dateValue);

    if (formattedDate && timeValue) {
        return `${timeValue} ngày ${formattedDate}`;
    }

    if (formattedDate) {
        return `Ngày ${formattedDate}`;
    }

    return timeValue ? `${timeValue}` : '';
};

const isValidConsultationTimeValue = (value) => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim());

    if (!match) {
        return false;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const totalMinutes = hour * 60 + minute;

    return totalMinutes >= 8 * 60 && totalMinutes <= 20 * 60 && minute % 15 === 0;
};

const syncPreferredContactTimeInput = () => {
    if (consultationPreferredContactTimeInput) {
        consultationPreferredContactTimeInput.value = getPreferredContactTime();
    }
};

const fillConsultationUserProfile = () => {
    if (!consultationForm) {
        return;
    }

    if (currentUser?.fullName && !consultationForm.elements.fullName.value) {
        consultationForm.elements.fullName.value = currentUser.fullName;
    }

    if (currentUser?.phone && !consultationForm.elements.phone.value) {
        consultationForm.elements.phone.value = currentUser.phone;
    }

    if (currentUser?.email && !consultationForm.elements.email.value) {
        consultationForm.elements.email.value = currentUser.email;
    }
};

const openConsultationModal = (requestType = 'consultation') => {
    if (!consultationModal || !consultationForm || !currentCar) {
        return;
    }

    const normalizedType = getConsultationRequestType(requestType);
    const carTitle = getCarDisplayName(currentCar);
    const isAvailableCar = isCarAvailableForTestDrive(currentCar);
    const effectiveType = isAvailableCar ? normalizedType : 'similar_car';

    if (consultationModalTitle) {
        consultationModalTitle.textContent = isAvailableCar
            ? `${consultationRequestTypeLabels[effectiveType]} ${carTitle}`.trim()
            : 'Xe này hiện đã hết hàng';
    }

    if (consultationModalSummary) {
        consultationModalSummary.textContent = isAvailableCar
            ? `${carTitle} - ${currentCar.price || 'Giá liên hệ'}`
            : 'Để lại thông tin, OkXe sẽ tư vấn xe tương tự hoặc báo khi có xe phù hợp.';
    }

    if (consultationCarIdInput) {
        consultationCarIdInput.value = currentCar.id || '';
    }

    if (consultationRequestTypeInput) {
        consultationRequestTypeInput.value = effectiveType;
    }

    if (consultationTestDriveLink) {
        const canRegisterTestDrive = isCarAvailableForTestDrive(currentCar);

        consultationTestDriveLink.classList.toggle('is-disabled', !canRegisterTestDrive);
        consultationTestDriveLink.href = canRegisterTestDrive
            ? `/dang-ky-lai-thu?carId=${encodeURIComponent(currentCar.id || '')}`
            : '#';
        consultationTestDriveLink.setAttribute('aria-disabled', String(!canRegisterTestDrive));
        consultationTestDriveLink.tabIndex = canRegisterTestDrive ? 0 : -1;
        consultationTestDriveLink.title = canRegisterTestDrive
            ? 'Đăng ký lái thử xe này'
            : 'Xe hiện không còn hàng để đăng ký lái thử';
    }

    setConsultationTimePickerMinDate();
    fillConsultationUserProfile();
    syncPreferredContactTimeInput();
    setConsultationSubmitLoading(false);
    setConsultationFeedback('');
    consultationModal.classList.add('is-open');
    consultationModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('consultation-modal-open');
    consultationForm.elements.fullName?.focus();
};

const closeConsultationModal = () => {
    if (!consultationModal) {
        return;
    }

    consultationModal.classList.remove('is-open');
    consultationModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('consultation-modal-open');
};

const renderCarDetail = (car, cars) => {
    if (!detailRoot) {
        return;
    }

    const images = getCarImages(car);
    const primaryImage = images[0] || car.image || '';
    const galleryImages = images.length ? images : [primaryImage];
    const description = car.description || 'Xe đang được cập nhật mô tả chi tiết. Vui lòng liên hệ OkXe để nhận tư vấn tình trạng xe, hồ sơ và lịch xem xe.';
    const isFavorite = isFavoriteCar(car.id);
    const canRegisterTestDrive = isCarAvailableForTestDrive(car);
    const primaryConsultationType = canRegisterTestDrive ? 'consultation' : 'similar_car';
    const primaryConsultationLabel = canRegisterTestDrive ? 'Nhận tư vấn & báo giá' : 'Tư vấn xe tương tự';
    const testDriveButton = canRegisterTestDrive
        ? `
            <a class="detail-contact-button detail-contact-button--accent" href="/dang-ky-lai-thu?carId=${encodeURIComponent(car.id)}">
                <span class="detail-contact-button__icon">
                    <svg class="detail-contact-button__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="12" cy="12" r="8.5"></circle>
                        <path d="M4.2 10.5h15.6"></path>
                        <path d="M12 12v7.8"></path>
                        <path d="M8.6 14.8l-3.1 2.8"></path>
                        <path d="M15.4 14.8l3.1 2.8"></path>
                    </svg>
                </span>
                <span class="detail-contact-button__text">
                    <strong>Đăng ký lái thử</strong>
                </span>
            </a>
        `
        : `
            <button type="button" class="detail-contact-button detail-contact-button--disabled" disabled title="Xe hiện không còn hàng để đăng ký lái thử">
                <span class="detail-contact-button__icon">
                    <i class="bx bx-block" aria-hidden="true"></i>
                </span>
                <span class="detail-contact-button__text">
                    <strong>Không nhận lái thử</strong>
                </span>
            </button>
        `;

    updateCarSeo(car, galleryImages, description);
    detailRoot.innerHTML = `
        <section class="detail-hero">
            <div class="detail-gallery">
                <button type="button" class="favorite-car-btn detail-favorite-btn${isFavorite ? ' is-active' : ''}" data-favorite-car="${escapeHtml(car.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'} ${escapeHtml(car.name)}">
                    <i class="bx ${isFavorite ? 'bxs-heart' : 'bx-heart'}" aria-hidden="true"></i>
                </button>
                <div class="detail-carousel" id="detail-carousel" data-active-index="0">
                    <div class="detail-carousel-track" id="detail-carousel-track">
                        ${galleryImages.map((image, index) => `
                            <div class="detail-carousel-slide${index === 0 ? ' is-active' : ''}" data-carousel-slide="${index}">
                                <img src="${escapeHtml(image)}" alt="${escapeHtml(car.name)} - ảnh ${index + 1}" class="detail-main-image">
                            </div>
                        `).join('')}
                    </div>
                    <div class="detail-zoom-hint" aria-hidden="true">
                        <i class="bx bx-zoom-in"></i>
                        <span>Zoom ảnh</span>
                    </div>
                    ${galleryImages.length > 1 ? `
                        <button type="button" class="detail-carousel-btn detail-carousel-btn--prev" data-gallery-direction="-1" aria-label="Xem ảnh trước">
                            <i class="bx bx-chevron-left" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="detail-carousel-btn detail-carousel-btn--next" data-gallery-direction="1" aria-label="Xem ảnh tiếp theo">
                            <i class="bx bx-chevron-right" aria-hidden="true"></i>
                        </button>
                    ` : ''}
                </div>
                ${galleryImages.length > 1 ? `
                    <div class="detail-thumbs">
                        ${galleryImages.map((image, index) => `
                            <button class="detail-thumb${index === 0 ? ' is-active' : ''}" type="button" data-detail-image="${escapeHtml(image)}" data-detail-index="${index}" aria-label="Xem ảnh ${index + 1} của ${escapeHtml(car.name)}">
                                <img src="${escapeHtml(image)}" alt="Ảnh ${index + 1} của ${escapeHtml(car.name)}">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <aside class="detail-summary">
                <span class="detail-brand">${escapeHtml(car.brand || car.category)}</span>
                <h1>${escapeHtml(car.name)}</h1>
                <div class="detail-price">${escapeHtml(car.price)}</div>
                <p class="detail-description">${escapeHtml(description)}</p>
                <div class="detail-actions">
                    <button type="button" class="detail-action detail-action--primary" data-open-consultation="${escapeHtml(primaryConsultationType)}">
                        <i class="bx bx-phone-call"></i>
                        <span>${escapeHtml(primaryConsultationLabel)}</span>
                    </button>
                </div>
                <div class="detail-contact-panel" aria-label="Tùy chọn liên hệ nhanh">
                    ${testDriveButton}
                    <button type="button" class="detail-contact-button detail-contact-button--soft" data-open-compare="${escapeHtml(car.id)}">
                        <span class="detail-contact-button__icon">
                            <i class="bx bx-git-compare" aria-hidden="true"></i>
                        </span>
                        <span class="detail-contact-button__text">
                            <strong>So sánh</strong>
                        </span>
                    </button>
                    <button type="button" class="detail-contact-button detail-contact-button--accent" data-open-consultation="rolling_cost">
                        <span class="detail-contact-button__icon">
                            <i class="bx bx-calculator" aria-hidden="true"></i>
                        </span>
                        <span class="detail-contact-button__text">
                            <strong>Chi phí lăn bánh</strong>
                        </span>
                    </button>
                    <a class="detail-contact-button detail-contact-button--soft" href="/mua-xe">
                        <span class="detail-contact-button__icon">
                            <i class="bx bx-left-arrow-alt" aria-hidden="true"></i>
                        </span>
                        <span class="detail-contact-button__text">
                            <strong>Xem xe khác</strong>
                        </span>
                    </a>
                </div>
            </aside>
        </section>

        <section class="detail-card">
            <h2><i class="bx bx-list-check"></i>Thông số kỹ thuật</h2>
            <div class="spec-grid">
                ${renderSpecs(car)}
            </div>
        </section>

        ${renderRelatedCars(car, cars)}
    `;
};

const bindGalleryEvents = () => {
    if (galleryAutoplayTimer) {
        window.clearInterval(galleryAutoplayTimer);
        galleryAutoplayTimer = null;
    }

    const carousel = document.querySelector('#detail-carousel');
    const track = document.querySelector('#detail-carousel-track');
    const slides = Array.from(document.querySelectorAll('[data-carousel-slide]'));
    const thumbnails = Array.from(document.querySelectorAll('[data-detail-image]'));
    const imageCount = slides.length;

    const updateGalleryImage = (nextIndex) => {
        if (!carousel || !track || !imageCount) {
            return;
        }

        const normalizedIndex = (nextIndex + imageCount) % imageCount;

        carousel.dataset.activeIndex = String(normalizedIndex);
        track.style.transform = `translateX(-${normalizedIndex * 100}%)`;
        slides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === normalizedIndex);
        });
        thumbnails.forEach((item, index) => {
            item.classList.toggle('is-active', index === normalizedIndex);
        });
    };

    const getActiveIndex = () => Number(carousel?.dataset.activeIndex || 0);

    const showNextImage = (direction = 1) => {
        updateGalleryImage(getActiveIndex() + direction);
    };

    const startAutoplay = () => {
        if (imageCount <= 1 || galleryAutoplayTimer) {
            return;
        }

        galleryAutoplayTimer = window.setInterval(() => {
            showNextImage(1);
        }, GALLERY_AUTOPLAY_DELAY);
    };

    const stopAutoplay = () => {
        if (!galleryAutoplayTimer) {
            return;
        }

        window.clearInterval(galleryAutoplayTimer);
        galleryAutoplayTimer = null;
    };

    thumbnails.forEach((button) => {
        button.addEventListener('click', () => {
            updateGalleryImage(Number(button.dataset.detailIndex || 0));
            stopAutoplay();
            startAutoplay();
        });
    });

    document.querySelectorAll('[data-gallery-direction]').forEach((button) => {
        button.addEventListener('click', () => {
            showNextImage(Number(button.dataset.galleryDirection || 1));
            stopAutoplay();
            startAutoplay();
        });
    });

    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', () => {
            carousel.querySelectorAll('.detail-main-image').forEach((image) => {
                image.style.transformOrigin = '';
            });
            startAutoplay();
        });
        carousel.addEventListener('mousemove', (event) => {
            const bounds = carousel.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;
            const activeImage = carousel.querySelector('.detail-carousel-slide.is-active .detail-main-image');

            if (activeImage) {
                activeImage.style.transformOrigin = `${x}% ${y}%`;
            }
        });
    }

    startAutoplay();
};

const bindFavoriteEvents = () => {
    document.querySelectorAll('[data-favorite-car]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();

            const carId = String(button.dataset.favoriteCar || '');

            if (!carId) {
                return;
            }

            if (!currentUser) {
                window.alert('Vui lòng đăng nhập ở trang chủ để lưu xe yêu thích.');
                return;
            }

            const shouldRemoveFavorite = isFavoriteCar(carId);
            button.disabled = true;

            try {
                const { response, data } = await requestJson(`/api/favorites/${encodeURIComponent(carId)}`, {
                    method: shouldRemoveFavorite ? 'DELETE' : 'POST'
                });

                if (!response.ok) {
                    throw new Error(data.message || 'Không thể cập nhật xe yêu thích lúc này.');
                }

                setFavoriteCars(data.cars || []);
                syncFavoriteButton(carId);
            } catch (error) {
                window.alert(error.message || 'Không thể cập nhật xe yêu thích lúc này.');
            } finally {
                button.disabled = false;
            }
        });
    });
};

const bindCompareEvents = () => {
    document.querySelectorAll('[data-open-compare]').forEach((button) => {
        button.addEventListener('click', () => {
            openCompareModal(button.dataset.openCompare);
        });
    });
};

const bindConsultationEvents = () => {
    document.querySelectorAll('[data-open-consultation]').forEach((button) => {
        button.addEventListener('click', () => {
            openConsultationModal(button.dataset.openConsultation);
        });
    });
};

compareSearchInput?.addEventListener('input', renderComparePicker);
comparePicker?.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-compare-car]');

    if (!addButton) {
        return;
    }

    addCompareCar(addButton.dataset.addCompareCar);
});
compareTableWrap?.addEventListener('click', (event) => {
    const descriptionButton = event.target.closest('[data-toggle-compare-description]');

    if (descriptionButton) {
        const descriptionCell = descriptionButton.closest('.compare-description');
        const descriptionText = descriptionCell?.querySelector('p');
        const isExpanded = descriptionButton.getAttribute('aria-expanded') === 'true';

        if (!descriptionText) {
            return;
        }

        descriptionText.textContent = isExpanded
            ? descriptionText.dataset.previewText || ''
            : descriptionText.dataset.fullText || '';
        descriptionButton.textContent = isExpanded ? 'Xem thêm' : 'Thu gọn';
        descriptionButton.setAttribute('aria-expanded', String(!isExpanded));
        return;
    }

    const removeButton = event.target.closest('[data-remove-compare-car]');

    if (!removeButton) {
        return;
    }

    selectedCompareCarIds = selectedCompareCarIds.filter((carId) => carId !== String(removeButton.dataset.removeCompareCar));
    renderCompareModal();
});
compareCloseButtons.forEach((button) => {
    button.addEventListener('click', closeCompareModal);
});
consultationCloseButtons.forEach((button) => {
    button.addEventListener('click', closeConsultationModal);
});
consultationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentCar) {
        setConsultationFeedback('Không tìm thấy xe cần tư vấn.', 'error');
        return;
    }

    const formData = new FormData(consultationForm);
    syncPreferredContactTimeInput();
    const isAvailableCar = isCarAvailableForTestDrive(currentCar);
    const requestType = isAvailableCar
        ? formData.get('requestType')
        : 'similar_car';
    const noteText = String(formData.get('note') || '').trim();
    const note = isAvailableCar || noteText.includes(SOLD_CAR_CONSULTATION_NOTE)
        ? noteText
        : [SOLD_CAR_CONSULTATION_NOTE, noteText].filter(Boolean).join('\n');
    const payload = {
        carId: currentCar.id,
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        requestType,
        preferredContactDate: consultationContactDateInput?.value || '',
        preferredContactHour: consultationContactTimeInput?.value || '',
        preferredContactTime: getPreferredContactTime(),
        note
    };
    const phoneText = String(payload.phone || '').trim();
    const phoneDigits = phoneText.replace(/\D/g, '');
    const preferredDate = consultationContactDateInput?.value || '';
    const preferredHour = consultationContactTimeInput?.value || '';

    if (String(payload.fullName || '').trim().length < 2) {
        setConsultationFeedback('Vui lòng nhập họ và tên.', 'error');
        consultationForm.elements.fullName?.focus();
        return;
    }

    if (!/^\+?[0-9\s.-]{8,20}$/.test(phoneText) || phoneDigits.length < 8 || phoneDigits.length > 15) {
        setConsultationFeedback('Số điện thoại liên hệ không hợp lệ.', 'error');
        consultationForm.elements.phone?.focus();
        return;
    }

    if (preferredDate && preferredDate < getTodayInputDate()) {
        setConsultationFeedback('Ngày muốn gọi lại không được trước hôm nay.', 'error');
        consultationContactDateInput?.focus();
        return;
    }

    if ((preferredDate && !preferredHour) || (!preferredDate && preferredHour)) {
        setConsultationFeedback('Vui lòng chọn đầy đủ ngày và giờ muốn được gọi lại.', 'error');
        (preferredDate ? consultationContactTimeInput : consultationContactDateInput)?.focus();
        return;
    }

    if (preferredHour && !isValidConsultationTimeValue(preferredHour)) {
        setConsultationFeedback('Giờ gọi lại chỉ nhận từ 08:00 đến 20:00, theo bước 15 phút.', 'error');
        consultationContactTimeInput?.focus();
        return;
    }

    setConsultationSubmitLoading(true);
    setConsultationFeedback('');

    try {
        const { response, data } = await requestJson('/api/consultation-requests', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể gửi yêu cầu tư vấn lúc này.');
        }

        setConsultationFeedback(data.message || 'OkXe đã nhận yêu cầu tư vấn.', 'success');
        consultationForm.elements.note.value = '';
        if (consultationContactDateInput) {
            consultationContactDateInput.value = '';
        }
        if (consultationContactTimeInput) {
            consultationContactTimeInput.value = '';
        }
        syncPreferredContactTimeInput();
    } catch (error) {
        setConsultationFeedback(error.message || 'Không thể gửi yêu cầu tư vấn lúc này.', 'error');
    } finally {
        setConsultationSubmitLoading(false);
    }
});

[consultationContactDateInput, consultationContactTimeInput].forEach((input) => {
    input?.addEventListener('change', syncPreferredContactTimeInput);
    input?.addEventListener('input', syncPreferredContactTimeInput);
});

setConsultationTimePickerMinDate();
syncConsultationCallLink();
loadSiteConfig();

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
        return;
    }

    if (consultationModal?.classList.contains('is-open')) {
        closeConsultationModal();
        return;
    }

    if (compareModal?.classList.contains('is-open')) {
        closeCompareModal();
    }
});

const syncCurrentUserAndFavorites = async () => {
    try {
        const { response, data } = await requestJson('/api/auth/me');

        currentUser = response.ok && data.user ? data.user : null;
    } catch (error) {
        currentUser = null;
    }

    if (!currentUser) {
        setFavoriteCars([]);
        return;
    }

    try {
        const { response, data } = await requestJson('/api/favorites');

        if (response.ok) {
            setFavoriteCars(data.cars || []);
        }
    } catch (error) {
        setFavoriteCars([]);
    }
};

const loadCarDetail = async () => {
    const carId = getCarIdFromUrl();

    if (!carId) {
        renderError('Đường dẫn chi tiết xe không hợp lệ.');
        return;
    }

    try {
        const [carResponse, carsResponse] = await Promise.all([
            fetch(`/api/cars/${encodeURIComponent(carId)}`),
            fetch('/api/cars')
        ]);
        const carData = await carResponse.json().catch(() => ({}));
        const carsData = await carsResponse.json().catch(() => ({}));

        if (!carResponse.ok) {
            throw new Error(carData.message || 'Không tìm thấy xe.');
        }

        currentCar = carData.car;
        allCars = Array.isArray(carsData.cars) ? carsData.cars : [];
        await syncCurrentUserAndFavorites();
        renderCarDetail(carData.car, allCars);
        bindGalleryEvents();
        bindFavoriteEvents();
        bindCompareEvents();
        bindConsultationEvents();
    } catch (error) {
        renderError(error.message || 'Không thể tải thông tin xe lúc này.');
    }
};

loadCarDetail();
