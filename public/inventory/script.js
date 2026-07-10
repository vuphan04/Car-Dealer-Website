const inventoryGrid = document.querySelector('#inventory-grid');
const resultCount = document.querySelector('#inventory-result-count');
const sortSelect = document.querySelector('#inventory-sort');
const filterResetButton = document.querySelector('#inventory-filter-reset');
const filterPanel = document.querySelector('.inventory-filter-panel');
const filterAdvanced = document.querySelector('#inventory-filter-advanced');
const filterToggleButton = document.querySelector('#inventory-filter-toggle');
const priceMinInput = document.querySelector('#filter-price-min');
const priceMaxInput = document.querySelector('#filter-price-max');
const priceRange = document.querySelector('#filter-price-range');
const priceEnabledInput = document.querySelector('#filter-price-enabled');
const priceEnabledLabel = document.querySelector('#filter-price-enabled-label');
const priceControl = document.querySelector('#filter-price-control');
const priceMinOutput = document.querySelector('#filter-price-min-output');
const priceMaxOutput = document.querySelector('#filter-price-max-output');
const yearFromSelect = document.querySelector('#filter-year-from');
const yearToSelect = document.querySelector('#filter-year-to');
const clearYearsButton = document.querySelector('[data-filter-clear-years]');
const compareModal = document.querySelector('#compare-modal');
const compareSearchInput = document.querySelector('#compare-search-input');
const comparePicker = document.querySelector('#compare-picker');
const compareTableWrap = document.querySelector('#compare-table-wrap');
const compareCount = document.querySelector('#compare-count');
const compareCloseButtons = document.querySelectorAll('[data-close-compare]');
const filterGroups = {
    brand: document.querySelector('#filter-brand-options'),
    condition: document.querySelector('#filter-condition-options'),
    gearbox: document.querySelector('#filter-gearbox-options'),
    fuel: document.querySelector('#filter-fuel-options'),
    origin: document.querySelector('#filter-origin-options'),
    color: document.querySelector('#filter-color-options'),
    category: document.querySelector('#filter-category-options'),
    seats: document.querySelector('#filter-seats-options'),
    drivetrain: document.querySelector('#filter-drivetrain-options'),
    imageState: document.querySelector('#filter-image-options')
};

let cars = [];
let filteredCars = [];
let currentUser = null;
let favoriteCarIds = new Set();
let selectedCompareCarIds = [];
let selectedBrandModel = '';

const MAX_COMPARE_CARS = 3;
const PRICE_FILTER_MIN = 0;
const PRICE_FILTER_MAX = 3000000000;

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

const normalizeText = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

const renderSpecChip = (value, fallback = 'Chưa cập nhật') => {
    const fullValue = String(value || fallback).trim();

    return `<span title="${escapeHtml(fullValue)}">${escapeHtml(fullValue)}</span>`;
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

const getCarDetailUrl = (carId) => `/cars/${encodeURIComponent(carId)}`;

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

const getStatusClass = (status) => {
    const normalizedStatus = normalizeText(status);

    if (['xe da ban', 'het xe', 'het hang'].includes(normalizedStatus)) {
        return 'is-sold';
    }

    if (normalizedStatus.includes('dang giu') || normalizedStatus.includes('giu cho')) {
        return 'is-held';
    }

    return 'is-available';
};

const isSoldCar = (car) => getStatusClass(car.actionText) === 'is-sold';

const parsePriceValue = (car) => {
    if (Number.isFinite(Number(car.priceValue))) {
        return Number(car.priceValue);
    }

    const priceText = normalizeText(car.price || '');
    const normalizedPriceText = priceText.replace(/\./g, '').replace(',', '.');
    const numberMatch = normalizedPriceText.match(/\d+(?:\.\d+)?/);

    if (!numberMatch) {
        return 0;
    }

    const value = Number(numberMatch[0]);

    if (priceText.includes('ty')) {
        return value * 1000000000;
    }

    if (priceText.includes('trieu')) {
        return value * 1000000;
    }

    return value;
};

const getUniqueValues = (fieldName) =>
    [...new Set(cars.map((car) => String(car[fieldName] || '').trim()).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, 'vi'));

const setYearOptions = (select, placeholder, years) => {
    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">${escapeHtml(placeholder)}</option>
        ${years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join('')}
    `;
};

const getBrandModelNames = (brand) => {
    const normalizedBrand = normalizeText(brand);

    if (!normalizedBrand) {
        return [];
    }

    const brandPrefixPattern = new RegExp(`^${String(brand).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');

    return [...new Set(cars
        .filter((car) => normalizeText(car.brand) === normalizedBrand)
        .map((car) => String(car.name || car.type || '').trim())
        .filter(Boolean)
        .map((modelName) => modelName.replace(brandPrefixPattern, '').trim() || modelName))]
        .sort((first, second) => first.localeCompare(second, 'vi'))
        .slice(0, 12);
};

const getComparableModelName = (car) => {
    const brand = String(car?.brand || '').trim();
    const modelName = String(car?.name || car?.type || '').trim();

    if (!brand || !modelName) {
        return modelName;
    }

    const brandPrefixPattern = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');

    return modelName.replace(brandPrefixPattern, '').trim() || modelName;
};

const renderBrandModelsPopup = (brand) => {
    const models = getBrandModelNames(brand);

    return `
        <span class="brand-models-popover" role="tooltip">
            <strong>Dòng xe ${escapeHtml(brand)}</strong>
            ${models.length ? `
                <span class="brand-models-popover__list">
                    ${models.map((model) => `
                        <span class="brand-models-popover__option${normalizeText(selectedBrandModel) === normalizeText(model) ? ' is-selected' : ''}" role="button" tabindex="0" data-brand-model="${escapeHtml(model)}" data-brand-value="${escapeHtml(brand)}">
                            ${escapeHtml(model)}
                        </span>
                    `).join('')}
                </span>
            ` : '<span>Chưa có dòng xe</span>'}
        </span>
    `;
};

const renderFilterGroup = (groupName, values, allLabel = 'Tất cả') => {
    const group = filterGroups[groupName];

    if (!group) {
        return;
    }

    const options = [
        { value: '', label: allLabel },
        ...values.map((value) => typeof value === 'string' ? { value, label: value } : value)
    ];

    group.innerHTML = options.map((option, index) => `
        <button type="button" class="inventory-filter-chip${groupName === 'brand' && index > 0 ? ' inventory-filter-chip--brand' : ''}${index === 0 ? ' is-active' : ''}" data-filter-name="${escapeHtml(groupName)}" data-filter-value="${escapeHtml(option.value)}">
            <span>${escapeHtml(option.label)}</span>
            ${groupName === 'brand' && index > 0 ? renderBrandModelsPopup(option.value) : ''}
        </button>
    `).join('');
};

const formatPriceValue = (value) => {
    const priceValue = Number(value || 0);

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
        return '0';
    }

    if (priceValue >= PRICE_FILTER_MAX) {
        return '>3 tỷ';
    }

    if (priceValue >= 1000000000) {
        return `${(priceValue / 1000000000).toLocaleString('vi-VN', {
            maximumFractionDigits: 1
        })} tỷ`;
    }

    return `${Math.round(priceValue / 1000000).toLocaleString('vi-VN')} triệu`;
};

const getPriceRangeValues = () => {
    const minPrice = Number(priceMinInput?.value || PRICE_FILTER_MIN);
    const maxPrice = Number(priceMaxInput?.value || PRICE_FILTER_MAX);

    return {
        min: Math.min(minPrice, maxPrice),
        max: Math.max(minPrice, maxPrice)
    };
};

const isPriceFilterEnabled = () => priceEnabledInput?.checked !== false;

const syncPriceFilterState = () => {
    const isEnabled = isPriceFilterEnabled();

    priceControl?.classList.toggle('is-disabled', !isEnabled);
    if (priceEnabledLabel) {
        priceEnabledLabel.textContent = isEnabled ? 'Bật' : 'Tắt';
    }

    [priceMinInput, priceMaxInput].forEach((input) => {
        if (!input) {
            return;
        }

        input.disabled = !isEnabled;
    });
};

const updatePriceOutput = () => {
    const { min, max } = getPriceRangeValues();

    if (priceMinOutput) {
        priceMinOutput.textContent = `Từ ${formatPriceValue(min)}`;
    }

    if (priceMaxOutput) {
        priceMaxOutput.textContent = `Đến ${formatPriceValue(max)}`;
    }

    if (priceRange) {
        const range = PRICE_FILTER_MAX - PRICE_FILTER_MIN;
        const minPercent = range ? ((min - PRICE_FILTER_MIN) / range) * 100 : 0;
        const maxPercent = range ? ((max - PRICE_FILTER_MIN) / range) * 100 : 100;

        priceRange.style.setProperty('--price-min-percent', `${minPercent}%`);
        priceRange.style.setProperty('--price-max-percent', `${maxPercent}%`);
    }

    if (priceMinInput && priceMaxInput) {
        const isMinNearMax = Number(priceMinInput.value) > PRICE_FILTER_MAX * 0.82;

        priceMinInput.style.zIndex = isMinNearMax ? '4' : '2';
        priceMaxInput.style.zIndex = isMinNearMax ? '3' : '4';
    }
};

const syncPriceInputs = (changedInput) => {
    if (!priceMinInput || !priceMaxInput) {
        updatePriceOutput();
        return;
    }

    const minPrice = Number(priceMinInput.value || PRICE_FILTER_MIN);
    const maxPrice = Number(priceMaxInput.value || PRICE_FILTER_MAX);

    if (changedInput === 'min' && minPrice > maxPrice) {
        priceMinInput.value = String(maxPrice);
    }

    if (changedInput === 'max' && maxPrice < minPrice) {
        priceMaxInput.value = String(minPrice);
    }

    updatePriceOutput();
};

const syncYearClearState = () => {
    const hasYearFilter = Boolean(yearFromSelect?.value || yearToSelect?.value);

    clearYearsButton?.classList.toggle('is-active', !hasYearFilter);
};

const renderFilterOptions = () => {
    renderFilterGroup('brand', getUniqueValues('brand'));
    renderFilterGroup('condition', getUniqueValues('condition'));
    renderFilterGroup('gearbox', getUniqueValues('gearbox'));
    renderFilterGroup('fuel', getUniqueValues('fuel'));
    renderFilterGroup('origin', getUniqueValues('origin'));
    renderFilterGroup('color', getUniqueValues('color'));
    renderFilterGroup('category', getUniqueValues('category'));
    renderFilterGroup('seats', getUniqueValues('seats'));
    renderFilterGroup('drivetrain', getUniqueValues('drivetrain'));
    renderFilterGroup('imageState', [
        { value: 'with', label: 'Xe có ảnh' },
        { value: 'without', label: 'Xe không có ảnh' }
    ]);

    const years = getUniqueValues('year').sort((first, second) => Number(second) - Number(first));
    setYearOptions(yearFromSelect, 'Từ năm', years);
    setYearOptions(yearToSelect, 'Đến năm', years);
    syncYearClearState();
    syncPriceFilterState();
    updatePriceOutput();
};

const isFavoriteCar = (carId) => favoriteCarIds.has(String(carId));
const isCompareCar = (carId) => selectedCompareCarIds.includes(String(carId));

const renderInventoryCard = (car) => {
    const image = getCarImages(car)[0] || '/images/rental-1.png';
    const statusText = car.actionText || 'Còn xe';
    const statusClass = getStatusClass(statusText);

    return `
        <article class="inventory-card" data-car-url="${getCarDetailUrl(car.id)}" role="link" tabindex="0" aria-label="Xem chi tiết ${escapeHtml(car.name)}">
            <button type="button" class="inventory-card__favorite${isFavoriteCar(car.id) ? ' is-active' : ''}" data-favorite-car="${escapeHtml(car.id)}" aria-pressed="${isFavoriteCar(car.id)}" aria-label="${isFavoriteCar(car.id) ? 'Bỏ yêu thích' : 'Yêu thích'} ${escapeHtml(car.name)}">
                <i class="bx ${isFavoriteCar(car.id) ? 'bxs-heart' : 'bx-heart'}" aria-hidden="true"></i>
            </button>
            <div class="inventory-card__media">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(car.name)}">
            </div>
            <div class="inventory-card__body">
                <span class="inventory-card__category">${escapeHtml(car.category || 'Chưa cập nhật')}</span>
                <h3>${escapeHtml(car.name || 'Xe chưa có tên')}</h3>
                <p class="inventory-card__type">${escapeHtml(car.type || 'Chưa cập nhật')}</p>
                <div class="inventory-card__specs">
                    ${renderSpecChip(car.year, 'Năm')}
                    ${renderSpecChip(car.fuel, 'Nhiên liệu')}
                    ${renderSpecChip(car.mileage, 'Số km')}
                    ${renderSpecChip(car.seats, 'Số chỗ')}
                    ${renderSpecChip(car.gearbox, 'Hộp số')}
                    ${renderSpecChip(car.drivetrain, 'Dẫn động')}
                    ${renderSpecChip(car.origin, 'Xuất xứ')}
                    ${renderSpecChip(car.condition, 'Tình trạng')}
                    ${renderSpecChip(car.color, 'Màu sắc')}
                </div>
                <div class="inventory-card__footer">
                    <strong class="inventory-card__price">${escapeHtml(car.price || 'Liên hệ')}</strong>
                    <span class="inventory-card__status ${statusClass}">${escapeHtml(statusText)}</span>
                </div>
                <div class="inventory-card__actions">
                    <a class="inventory-card__detail" href="${getCarDetailUrl(car.id)}">
                        <span>Xem chi tiết</span>
                        <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                    </a>
                    <button type="button" class="inventory-card__compare${isCompareCar(car.id) ? ' is-active' : ''}" data-compare-car="${escapeHtml(car.id)}" aria-pressed="${isCompareCar(car.id)}" aria-label="So sánh ${escapeHtml(car.name)}">
                        <i class="bx bx-git-compare" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
};

const renderEmptyState = (title, message) => {
    if (!inventoryGrid) {
        return;
    }

    inventoryGrid.innerHTML = `
        <article class="inventory-empty">
            <div>
                <strong>${escapeHtml(title)}</strong>
                <p>${escapeHtml(message)}</p>
            </div>
        </article>
    `;
};

const getFilterGroupValue = (groupName) => {
    const activeButton = filterGroups[groupName]?.querySelector('.inventory-filter-chip.is-active');

    return activeButton?.dataset.filterValue || '';
};

const getYearRange = () => {
    const fromYear = Number(yearFromSelect?.value || 0);
    const toYear = Number(yearToSelect?.value || 0);

    if (fromYear && toYear) {
        return {
            min: Math.min(fromYear, toYear),
            max: Math.max(fromYear, toYear)
        };
    }

    return {
        min: fromYear || 0,
        max: toYear || Infinity
    };
};

const getSelectedFilters = () => ({
    brand: normalizeText(getFilterGroupValue('brand')),
    brandModel: normalizeText(selectedBrandModel),
    category: normalizeText(getFilterGroupValue('category')),
    condition: normalizeText(getFilterGroupValue('condition')),
    fuel: normalizeText(getFilterGroupValue('fuel')),
    gearbox: normalizeText(getFilterGroupValue('gearbox')),
    origin: normalizeText(getFilterGroupValue('origin')),
    color: normalizeText(getFilterGroupValue('color')),
    seats: normalizeText(getFilterGroupValue('seats')),
    drivetrain: normalizeText(getFilterGroupValue('drivetrain')),
    imageState: getFilterGroupValue('imageState'),
    priceRange: getPriceRangeValues(),
    priceLimitEnabled: isPriceFilterEnabled(),
    yearRange: getYearRange()
});

const sortCars = (carList) => {
    const sortValue = sortSelect?.value || 'newest';
    const sortedCars = [...carList];

    if (sortValue === 'price-asc') {
        return sortedCars.sort((first, second) => parsePriceValue(first) - parsePriceValue(second));
    }

    if (sortValue === 'price-desc') {
        return sortedCars.sort((first, second) => parsePriceValue(second) - parsePriceValue(first));
    }

    if (sortValue === 'name') {
        return sortedCars.sort((first, second) => String(first.name || '').localeCompare(String(second.name || ''), 'vi'));
    }

    return sortedCars.sort((first, second) => Number(second.id || 0) - Number(first.id || 0));
};

const applyFilters = () => {
    const filters = getSelectedFilters();

    filteredCars = cars.filter((car) => {
        const matchesBrand = !filters.brand || normalizeText(car.brand) === filters.brand;
        const matchesBrandModel = !filters.brandModel || normalizeText(getComparableModelName(car)) === filters.brandModel;
        const matchesCategory = !filters.category || normalizeText(car.category) === filters.category;
        const matchesCondition = !filters.condition || normalizeText(car.condition) === filters.condition;
        const matchesFuel = !filters.fuel || normalizeText(car.fuel) === filters.fuel;
        const matchesGearbox = !filters.gearbox || normalizeText(car.gearbox) === filters.gearbox;
        const matchesOrigin = !filters.origin || normalizeText(car.origin) === filters.origin;
        const matchesColor = !filters.color || normalizeText(car.color) === filters.color;
        const matchesSeats = !filters.seats || normalizeText(car.seats) === filters.seats;
        const matchesDrivetrain = !filters.drivetrain || normalizeText(car.drivetrain) === filters.drivetrain;
        const carYear = Number(car.year || 0);
        const hasYearFilter = Boolean(filters.yearRange.min || Number.isFinite(filters.yearRange.max));
        const matchesYear = !hasYearFilter
            || (carYear && carYear >= filters.yearRange.min && carYear <= filters.yearRange.max);
        const carPrice = parsePriceValue(car);
        const priceMax = filters.priceRange.max >= PRICE_FILTER_MAX ? Infinity : filters.priceRange.max;
        const matchesPrice = !filters.priceLimitEnabled
            || (carPrice >= filters.priceRange.min && carPrice <= priceMax);
        const hasImages = getCarImages(car).length > 0;
        const matchesImageState = !filters.imageState
            || (filters.imageState === 'with' ? hasImages : !hasImages);

        return matchesBrand
            && matchesBrandModel
            && matchesCategory
            && matchesCondition
            && matchesFuel
            && matchesGearbox
            && matchesOrigin
            && matchesColor
            && matchesSeats
            && matchesDrivetrain
            && matchesYear
            && matchesPrice
            && matchesImageState;
    });

    renderInventoryGrid();
};

const renderInventoryGrid = () => {
    if (!inventoryGrid) {
        return;
    }

    const visibleCars = sortCars(filteredCars);

    if (resultCount) {
        resultCount.textContent = `${visibleCars.length} xe phù hợp`;
    }

    if (!visibleCars.length) {
        renderEmptyState('Không tìm thấy xe phù hợp', 'Hãy thử giảm bớt điều kiện lọc hoặc chọn lại khoảng giá, năm sản xuất.');
        return;
    }

    inventoryGrid.innerHTML = visibleCars.map(renderInventoryCard).join('');
};

const getCarById = (carId) => cars.find((car) => String(car.id) === String(carId));

const getCompareCars = () =>
    selectedCompareCarIds.map(getCarById).filter(Boolean);

const getCompareSearchResults = () => {
    const keyword = normalizeText(compareSearchInput?.value);
    const availableCars = cars.filter((car) => !isCompareCar(car.id));

    if (!keyword) {
        return availableCars.slice(0, 8);
    }

    return availableCars
        .filter((car) => normalizeText([
            car.name,
            car.brand,
            car.category,
            car.type,
            car.year,
            car.fuel,
            car.gearbox,
            car.drivetrain
        ].join(' ')).includes(keyword))
        .slice(0, 10);
};

const renderComparePicker = () => {
    if (!comparePicker) {
        return;
    }

    const searchResults = getCompareSearchResults();
    const isLimitReached = selectedCompareCarIds.length >= MAX_COMPARE_CARS;

    if (isLimitReached) {
        comparePicker.innerHTML = `
            <article class="compare-picker__empty">
                <strong>Đã chọn đủ 3 xe</strong>
                <p>Xóa bớt một xe khỏi bảng để thêm xe khác.</p>
            </article>
        `;
        return;
    }

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
        const image = getCarImages(car)[0] || '/images/rental-1.png';

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
                <p>Chọn xe từ danh sách bên trái hoặc nhấn nút so sánh trên card xe.</p>
            </article>
        `;
        return;
    }

    const getDescriptionPreview = (description) => {
        const normalizedDescription = String(description || '').trim();

        if (!normalizedDescription) {
            return {
                fullText: 'Chưa cập nhật',
                previewText: 'Chưa cập nhật',
                hasMore: false
            };
        }

        const maxLength = 150;
        const hasMore = normalizedDescription.length > maxLength;

        return {
            fullText: normalizedDescription,
            previewText: hasMore ? `${normalizedDescription.slice(0, maxLength).trim()}...` : normalizedDescription,
            hasMore
        };
    };

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
                const image = getCarImages(car)[0] || '/images/rental-1.png';

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
                        ${description.hasMore ? `
                            <button type="button" data-toggle-compare-description aria-expanded="false">
                                Xem thêm
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

const syncCompareButtons = () => {
    document.querySelectorAll('[data-compare-car]').forEach((button) => {
        const isActive = isCompareCar(button.dataset.compareCar);

        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
};

const renderCompareModal = () => {
    if (compareCount) {
        compareCount.textContent = `Đã chọn ${selectedCompareCarIds.length}/${MAX_COMPARE_CARS} xe`;
    }

    renderComparePicker();
    renderCompareTable();
    syncCompareButtons();
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

const removeCompareCar = (carId) => {
    selectedCompareCarIds = selectedCompareCarIds.filter((selectedId) => selectedId !== String(carId));
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

const syncFavoriteButtons = (carId) => {
    const normalizedCarId = String(carId || '');
    const isActive = isFavoriteCar(normalizedCarId);
    const car = cars.find((item) => String(item.id) === normalizedCarId);

    document.querySelectorAll(`[data-favorite-car="${CSS.escape(normalizedCarId)}"]`).forEach((button) => {
        const icon = button.querySelector('i');

        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
        button.setAttribute('aria-label', `${isActive ? 'Bỏ yêu thích' : 'Yêu thích'} ${car?.name || 'xe này'}`);

        if (icon) {
            icon.className = `bx ${isActive ? 'bxs-heart' : 'bx-heart'}`;
        }
    });
};

const setFavoriteCars = (favoriteCars = []) => {
    favoriteCarIds = new Set(
        (Array.isArray(favoriteCars) ? favoriteCars : []).map((car) => String(car.id))
    );
};

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

const handleFavoriteButtonClick = async (event) => {
    const favoriteButton = event.target.closest('[data-favorite-car]');

    if (!favoriteButton) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const carId = String(favoriteButton.dataset.favoriteCar || '');

    if (!carId) {
        return;
    }

    if (!currentUser) {
        window.alert('Vui lòng đăng nhập ở trang chủ để lưu xe yêu thích.');
        return;
    }

    const shouldRemoveFavorite = isFavoriteCar(carId);
    favoriteButton.disabled = true;

    try {
        const { response, data } = await requestJson(`/api/favorites/${encodeURIComponent(carId)}`, {
            method: shouldRemoveFavorite ? 'DELETE' : 'POST'
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật xe yêu thích lúc này.');
        }

        setFavoriteCars(data.cars || []);
        syncFavoriteButtons(carId);
    } catch (error) {
        window.alert(error.message || 'Không thể cập nhật xe yêu thích lúc này.');
    } finally {
        favoriteButton.disabled = false;
    }
};

const openCarDetailFromCard = (card) => {
    const carUrl = card?.dataset.carUrl;

    if (carUrl) {
        window.location.href = carUrl;
    }
};

const setFilterGroupValue = (button) => {
    const group = button?.parentElement;

    if (!group) {
        return;
    }

    group.querySelectorAll('.inventory-filter-chip').forEach((chip) => {
        chip.classList.toggle('is-active', chip === button);
    });

    if (button.dataset.filterName === 'brand') {
        selectedBrandModel = '';
        renderFilterGroup('brand', getUniqueValues('brand'));

        const selectedBrand = button.dataset.filterValue || '';
        const replacementButton = Array.from(filterGroups.brand?.querySelectorAll('[data-filter-name="brand"]') || [])
            .find((chip) => chip.dataset.filterValue === selectedBrand);

        if (replacementButton) {
            filterGroups.brand.querySelectorAll('.inventory-filter-chip').forEach((chip) => {
                chip.classList.toggle('is-active', chip === replacementButton);
            });
        }
    }
};

const selectBrandModel = (modelOption) => {
    const brand = modelOption?.dataset.brandValue || '';
    const model = modelOption?.dataset.brandModel || '';
    const brandButton = Array.from(filterGroups.brand?.querySelectorAll('[data-filter-name="brand"]') || [])
        .find((chip) => chip.dataset.filterValue === brand);

    if (!brand || !model || !brandButton) {
        return;
    }

    selectedBrandModel = model;
    filterGroups.brand.querySelectorAll('.inventory-filter-chip').forEach((chip) => {
        chip.classList.toggle('is-active', chip === brandButton);
    });
    filterGroups.brand.querySelectorAll('[data-brand-model]').forEach((option) => {
        option.classList.toggle('is-selected', normalizeText(option.dataset.brandModel) === normalizeText(model));
    });
    applyFilters();
};

const setAdvancedFiltersExpanded = (isExpanded) => {
    if (!filterAdvanced || !filterToggleButton) {
        return;
    }

    filterToggleButton.setAttribute('aria-expanded', String(isExpanded));

    const label = filterToggleButton.querySelector('span');
    const marker = filterToggleButton.querySelector('strong');

    if (isExpanded) {
        filterAdvanced.hidden = false;
        window.requestAnimationFrame(() => {
            filterAdvanced.classList.add('is-expanded');
        });
    } else {
        filterAdvanced.classList.remove('is-expanded');
        window.setTimeout(() => {
            if (filterToggleButton.getAttribute('aria-expanded') !== 'true') {
                filterAdvanced.hidden = true;
            }
        }, 320);
    }

    if (label) {
        label.textContent = isExpanded ? 'Thu nhỏ điều kiện tìm kiếm' : 'Mở rộng điều kiện tìm kiếm';
    }

    if (marker) {
        marker.textContent = isExpanded ? '[ - ]' : '[ + ]';
    }
};

const resetFilters = () => {
    selectedBrandModel = '';

    Object.values(filterGroups).forEach((group) => {
        const chips = Array.from(group?.querySelectorAll('.inventory-filter-chip') || []);

        chips.forEach((chip, index) => {
            chip.classList.toggle('is-active', index === 0);
        });

        group?.querySelectorAll('[data-brand-model]').forEach((option) => {
            option.classList.remove('is-selected');
        });
    });

    if (yearFromSelect) {
        yearFromSelect.value = '';
    }

    if (yearToSelect) {
        yearToSelect.value = '';
    }

    if (priceMinInput) {
        priceMinInput.value = String(PRICE_FILTER_MIN);
    }

    if (priceMaxInput) {
        priceMaxInput.value = String(PRICE_FILTER_MAX);
    }

    if (priceEnabledInput) {
        priceEnabledInput.checked = true;
    }

    if (sortSelect) {
        sortSelect.value = 'newest';
    }

    syncYearClearState();
    syncPriceFilterState();
    syncPriceInputs();
    applyFilters();
};

const bindEvents = () => {
    sortSelect?.addEventListener('change', renderInventoryGrid);
    filterResetButton?.addEventListener('click', resetFilters);

    filterPanel?.addEventListener('click', (event) => {
        const modelOption = event.target.closest('[data-brand-model]');

        if (modelOption) {
            event.preventDefault();
            selectBrandModel(modelOption);
            return;
        }

        const filterButton = event.target.closest('[data-filter-name]');

        if (!filterButton) {
            return;
        }

        setFilterGroupValue(filterButton);
        applyFilters();
    });

    filterPanel?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        const modelOption = event.target.closest('[data-brand-model]');

        if (!modelOption) {
            return;
        }

        event.preventDefault();
        selectBrandModel(modelOption);
    });

    clearYearsButton?.addEventListener('click', () => {
        if (yearFromSelect) {
            yearFromSelect.value = '';
        }

        if (yearToSelect) {
            yearToSelect.value = '';
        }

        syncYearClearState();
        applyFilters();
    });

    [yearFromSelect, yearToSelect].forEach((select) => {
        select?.addEventListener('change', () => {
            syncYearClearState();
            applyFilters();
        });
    });

    priceMinInput?.addEventListener('input', () => {
        syncPriceInputs('min');
        applyFilters();
    });

    priceMaxInput?.addEventListener('input', () => {
        syncPriceInputs('max');
        applyFilters();
    });

    priceEnabledInput?.addEventListener('change', () => {
        syncPriceFilterState();
        applyFilters();
    });

    filterToggleButton?.addEventListener('click', () => {
        const isExpanded = filterToggleButton.getAttribute('aria-expanded') === 'true';

        setAdvancedFiltersExpanded(!isExpanded);
    });

    inventoryGrid?.addEventListener('click', handleFavoriteButtonClick);
    inventoryGrid?.addEventListener('click', (event) => {
        const compareButton = event.target.closest('[data-compare-car]');

        if (compareButton) {
            event.preventDefault();
            event.stopPropagation();
            openCompareModal(compareButton.dataset.compareCar);
            return;
        }

        if (event.target.closest('a, button, input, select, textarea')) {
            return;
        }

        openCarDetailFromCard(event.target.closest('[data-car-url]'));
    });
    inventoryGrid?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        const card = event.target.closest('[data-car-url]');

        if (!card || event.target !== card) {
            return;
        }

        event.preventDefault();
        openCarDetailFromCard(card);
    });

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

        removeCompareCar(removeButton.dataset.removeCompareCar);
    });
    compareCloseButtons.forEach((button) => {
        button.addEventListener('click', closeCompareModal);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && compareModal?.classList.contains('is-open')) {
            closeCompareModal();
        }
    });
};

const loadInventory = async () => {
    renderEmptyState('Đang tải danh sách xe', 'Vui lòng chờ trong giây lát.');

    try {
        const { response, data } = await requestJson('/api/cars');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách xe.');
        }

        cars = Array.isArray(data.cars) ? data.cars : [];
        await syncCurrentUserAndFavorites();
        renderFilterOptions();
        applyFilters();
    } catch (error) {
        if (resultCount) {
            resultCount.textContent = 'Không thể tải dữ liệu';
        }

        renderEmptyState('Không thể tải danh sách xe', error.message || 'Vui lòng thử lại sau.');
    }
};

bindEvents();
loadInventory();
