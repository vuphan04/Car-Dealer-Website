const nav = document.querySelector('.nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const teamContainer = document.querySelector('#team-container');
const teamMemberModal = document.querySelector('#team-member-modal');
const teamMemberModalContent = document.querySelector('#team-member-modal-content');
const teamMemberCloseButtons = document.querySelectorAll('[data-close-team-member]');
const promotionCarousel = document.querySelector('#promotion-carousel');
const homeBlogCarousel = document.querySelector('#home-blog-carousel');
const testDriveButton = document.querySelector('.test-drive__button');

const closeMobileMenu = () => {
    if (!nav || !menuToggle) {
        return;
    }

    nav.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<i class="bx bx-menu"></i>';
};

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');

        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.innerHTML = isOpen
            ? '<i class="bx bx-x"></i>'
            : '<i class="bx bx-menu"></i>';
    });
}

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 640) {
            closeMobileMenu();
        }
    });
});

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

const renderSpecChip = (value, fallback = 'Chưa cập nhật') => {
    const fullValue = String(value || fallback).trim();

    return `<span title="${escapeHtml(fullValue)}">${escapeHtml(fullValue)}</span>`;
};

const rentalContainer = document.querySelector('.rental-container');
const rentalViewAllButton = document.querySelector('#rental-view-all-button');
const rentalSliderPrevButton = document.querySelector('#rental-slider-prev');
const rentalSliderNextButton = document.querySelector('#rental-slider-next');
const homeSearchForm = document.querySelector('#home-search-form');
const homeSearchControls = {
    brand: document.querySelector('#home-search-brand'),
    category: document.querySelector('#home-search-category'),
    yearFrom: document.querySelector('#home-search-year-from'),
    yearTo: document.querySelector('#home-search-year-to'),
    priceRange: document.querySelector('#home-search-price-range'),
    condition: document.querySelector('#home-search-condition'),
    mileageRange: document.querySelector('#home-search-mileage'),
    fuel: document.querySelector('#home-search-fuel'),
    gearbox: document.querySelector('#home-search-gearbox'),
    origin: document.querySelector('#home-search-origin'),
    color: document.querySelector('#home-search-color'),
    seats: document.querySelector('#home-search-seats')
};
const allCarsModal = document.querySelector('#all-cars-modal');
const allCarsGrid = document.querySelector('#all-cars-grid');
const allCarsSearchInput = document.querySelector('#all-cars-search');
const allCarsCloseButtons = document.querySelectorAll('[data-close-all-cars]');
const searchResultsModal = document.querySelector('#search-results-modal');
const searchResultsGrid = document.querySelector('#search-results-grid');
const searchResultsSummary = document.querySelector('#search-results-summary');
const searchResultsCloseButtons = document.querySelectorAll('[data-close-search-results]');
const favoriteCarsModal = document.querySelector('#favorite-cars-modal');
const favoriteCarsGrid = document.querySelector('#favorite-cars-grid');
const favoriteCarsCloseButtons = document.querySelectorAll('[data-close-favorites]');
const notificationsModal = document.querySelector('#notifications-modal');
const notificationsList = document.querySelector('#notifications-list');
const notificationsCloseButtons = document.querySelectorAll('[data-close-notifications]');
const notificationBadges = document.querySelectorAll('[data-notification-badge]');
const promotionDetailModal = document.querySelector('#promotion-detail-modal');
const promotionDetailContent = document.querySelector('#promotion-detail-content');
const promotionDetailCloseButtons = document.querySelectorAll('[data-close-promotion-detail]');
const featuredRentalLimit = 10;
const homepageTeamMemberLimit = 6;
const homepagePromotionLimit = 8;
let rentalCars = [];
let favoriteCars = [];
let favoriteCarIds = new Set();
let teamMembersState = [];
let promotionsState = [];
let testDriveAppointmentsState = [];
let carBuyRequestsState = [];
let userNotificationsState = [];
let teamMemberCloseTimer = 0;
let dismissedNotificationIds = new Set();
const dismissedNotificationsStorageKey = 'okxe:dismissedPromotionNotifications';
const promotionDateFormatter = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

const isFavoriteCar = (carId) => favoriteCarIds.has(String(carId));
const getCarDetailUrl = (carId) => `/cars/${encodeURIComponent(carId)}`;
const getCarStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLocaleLowerCase('vi-VN');

    return ['xe đã bán', 'hết xe', 'hết hàng'].includes(normalizedStatus)
        ? 'is-sold'
        : 'is-available';
};

const updateRentalSliderControls = () => {
    if (!rentalContainer || !rentalSliderPrevButton || !rentalSliderNextButton) {
        return;
    }

    const maxScrollLeft = rentalContainer.scrollWidth - rentalContainer.clientWidth;
    const canScroll = maxScrollLeft > 1;

    rentalSliderPrevButton.disabled = !canScroll || rentalContainer.scrollLeft <= 1;
    rentalSliderNextButton.disabled = !canScroll || rentalContainer.scrollLeft >= maxScrollLeft - 1;
};

const scrollRentalSlider = (direction) => {
    if (!rentalContainer) {
        return;
    }

    const firstCard = rentalContainer.querySelector('.rental-card');
    const containerStyles = window.getComputedStyle(rentalContainer);
    const gap = parseFloat(containerStyles.columnGap || containerStyles.gap) || 24;
    const cardWidth = firstCard?.getBoundingClientRect().width || rentalContainer.clientWidth;

    rentalContainer.scrollBy({
        left: direction * (cardWidth + gap),
        behavior: 'smooth'
    });

    window.setTimeout(updateRentalSliderControls, 360);
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

const renderCarMedia = (car) => {
    const images = getCarImages(car);
    const primaryImage = images[0] || car.image;
    const thumbnails = images.slice(1, 5);
    const remainingImages = Math.max(0, images.length - 5);

    return `
        <div class="rental-card__media">
            <img src="${primaryImage}" alt="${car.name}" class="rental-card__image">
            <div class="rental-card__thumbs${images.length > 1 ? '' : ' rental-card__thumbs--empty'}" ${images.length > 1 ? `aria-label="Ảnh khác của ${car.name}"` : 'aria-hidden="true"'}>
                ${images.length > 1 ? thumbnails.map((image, index) => `
                    <img src="${image}" alt="Ảnh ${index + 2} của ${car.name}">
                `).join('') : ''}
                ${remainingImages ? `<span class="rental-card__thumb-count">+${remainingImages}</span>` : ''}
            </div>
        </div>
    `;
};

const renderCarCard = (car) => `
    <article class="rental-card" data-car-detail-url="${getCarDetailUrl(car.id)}" role="link" tabindex="0" aria-label="Xem chi tiết ${car.name}">
        <button type="button" class="favorite-car-btn${isFavoriteCar(car.id) ? ' is-active' : ''}" data-favorite-car="${car.id}" aria-pressed="${isFavoriteCar(car.id)}" aria-label="${isFavoriteCar(car.id) ? 'Bỏ yêu thích' : 'Yêu thích'} ${car.name}">
            <i class="bx ${isFavoriteCar(car.id) ? 'bxs-heart' : 'bx-heart'}" aria-hidden="true"></i>
        </button>
        ${renderCarMedia(car)}
        <div class="rental-card__summary">
            <span class="rental-category">${car.category}</span>
            <h3>${car.name}</h3>
            <p>${car.type}</p>
        </div>
        <div class="rental-specs">
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
        <div class="rental-meta">
            <span class="price">${car.price}</span>
            <a href="${getCarDetailUrl(car.id)}" class="rent-link ${getCarStatusClass(car.actionText)}">${car.actionText}</a>
        </div>
    </article>
`;

const renderFavoriteCarListItem = (car) => {
    const images = getCarImages(car);
    const primaryImage = images[0] || car.image;

    return `
        <article class="favorite-car-item" data-car-detail-url="${getCarDetailUrl(car.id)}" role="link" tabindex="0" aria-label="Xem chi tiết ${car.name}">
            <img src="${primaryImage}" alt="${car.name}" class="favorite-car-item__image">
            <div class="favorite-car-item__body">
                <div>
                    <span class="favorite-car-item__category">${car.category}</span>
                    <h3>${car.name}</h3>
                    <p>${car.type}</p>
                </div>
                <div class="favorite-car-item__chips">
                    ${renderSpecChip(car.year, 'Năm')}
                    ${renderSpecChip(car.fuel, 'Nhiên liệu')}
                    ${renderSpecChip(car.mileage, 'Số km')}
                    ${renderSpecChip(car.seats, 'Số chỗ')}
                    ${renderSpecChip(car.drivetrain, 'Dẫn động')}
                </div>
            </div>
            <div class="favorite-car-item__side">
                <strong>${car.price}</strong>
                <button type="button" class="favorite-car-item__remove" data-favorite-car="${car.id}" aria-pressed="true" aria-label="Bỏ yêu thích ${car.name}">
                    <i class="bx bxs-heart" aria-hidden="true"></i>
                    <span>Bỏ yêu thích</span>
                </button>
            </div>
        </article>
    `;
};

const normalizeSearchValue = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

const appendMissingSelectOptions = (select, values) => {
    if (!select) {
        return;
    }

    const existingOptions = new Set(
        Array.from(select.options).map((option) =>
            normalizeSearchValue(option.value || option.textContent)
        )
    );

    values.forEach((value) => {
        const optionValue = String(value || '').trim();
        const normalizedValue = normalizeSearchValue(optionValue);

        if (!optionValue || existingOptions.has(normalizedValue)) {
            return;
        }

        select.append(new Option(optionValue, optionValue));
        existingOptions.add(normalizedValue);
    });
};

const getUniqueCarValues = (fieldName) =>
    [...new Set(rentalCars.map((car) => String(car[fieldName] || '').trim()).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, 'vi'));

const populateHomeSearchOptions = () => {
    appendMissingSelectOptions(homeSearchControls.brand, getUniqueCarValues('brand'));
    appendMissingSelectOptions(homeSearchControls.category, getUniqueCarValues('category'));
    appendMissingSelectOptions(homeSearchControls.condition, getUniqueCarValues('condition'));
    appendMissingSelectOptions(homeSearchControls.fuel, getUniqueCarValues('fuel'));
    appendMissingSelectOptions(homeSearchControls.gearbox, getUniqueCarValues('gearbox'));
    appendMissingSelectOptions(homeSearchControls.origin, getUniqueCarValues('origin'));
    appendMissingSelectOptions(homeSearchControls.color, getUniqueCarValues('color'));
    appendMissingSelectOptions(homeSearchControls.seats, getUniqueCarValues('seats'));
};

const parseRangeValue = (rangeValue) => {
    const [minValue, maxValue] = String(rangeValue || '').split('-');

    return {
        min: minValue ? Number(minValue) : 0,
        max: maxValue ? Number(maxValue) : Infinity
    };
};

const isWithinSearchRange = (value, rangeValue) => {
    if (!rangeValue) {
        return true;
    }

    const { min, max } = parseRangeValue(rangeValue);

    return Number(value || 0) >= min && Number(value || 0) <= max;
};

const isWithinYearRange = (year, yearFrom, yearTo) => {
    const carYear = Number(year);
    const minYear = Number(yearFrom || 0);
    const maxYear = Number(yearTo || 0);

    if (!Number.isFinite(carYear)) {
        return false;
    }

    if (minYear && carYear < minYear) {
        return false;
    }

    if (maxYear && carYear > maxYear) {
        return false;
    }

    return true;
};

const parseDisplayPrice = (priceText) => {
    const normalizedPriceText = normalizeSearchValue(priceText).replace(/\./g, '').replace(',', '.');
    const numberMatch = normalizedPriceText.match(/\d+(?:\.\d+)?/);

    if (!numberMatch) {
        return 0;
    }

    const priceNumber = Number(numberMatch[0]);

    if (normalizedPriceText.includes('ty')) {
        return priceNumber * 1000000000;
    }

    if (normalizedPriceText.includes('trieu')) {
        return priceNumber * 1000000;
    }

    return priceNumber;
};

const getCarPriceValue = (car) => {
    const priceValue = Number(car?.priceValue);

    if (Number.isFinite(priceValue) && priceValue > 0) {
        return priceValue;
    }

    return parseDisplayPrice(car?.price);
};

const getCarMileageValue = (car) => {
    const mileageValue = Number(car?.mileageValue);

    if (Number.isFinite(mileageValue)) {
        return mileageValue;
    }

    return Number(String(car?.mileage || '').replace(/[^\d]/g, '') || 0);
};

const getHomeSearchFilters = () => {
    if (!homeSearchForm) {
        return {};
    }

    const formData = new FormData(homeSearchForm);

    return {
        brand: normalizeSearchValue(formData.get('brand')),
        category: normalizeSearchValue(formData.get('category')),
        yearFrom: String(formData.get('yearFrom') || '').trim(),
        yearTo: String(formData.get('yearTo') || '').trim(),
        priceRange: String(formData.get('priceRange') || ''),
        condition: normalizeSearchValue(formData.get('condition')),
        mileageRange: String(formData.get('mileageRange') || ''),
        fuel: normalizeSearchValue(formData.get('fuel')),
        gearbox: normalizeSearchValue(formData.get('gearbox')),
        origin: normalizeSearchValue(formData.get('origin')),
        color: normalizeSearchValue(formData.get('color')),
        seats: normalizeSearchValue(formData.get('seats'))
    };
};

const matchesSearchValue = (carValue, filterValue) =>
    !filterValue || normalizeSearchValue(carValue) === filterValue;

const commonHomeSearchColors = ['den', 'trang', 'do', 'xam'];

const matchesSearchColor = (carColor, colorFilter) => {
    if (!colorFilter) {
        return true;
    }

    const normalizedColor = normalizeSearchValue(carColor);

    if (colorFilter === 'other') {
        return normalizedColor && !commonHomeSearchColors.includes(normalizedColor);
    }

    return normalizedColor === colorFilter;
};

const getFilteredHomeSearchCars = () => {
    const filters = getHomeSearchFilters();

    return rentalCars.filter((car) =>
        matchesSearchValue(car.brand, filters.brand)
        && matchesSearchValue(car.category, filters.category)
        && isWithinYearRange(car.year, filters.yearFrom, filters.yearTo)
        && isWithinSearchRange(getCarPriceValue(car), filters.priceRange)
        && matchesSearchValue(car.condition, filters.condition)
        && isWithinSearchRange(getCarMileageValue(car), filters.mileageRange)
        && matchesSearchValue(car.fuel, filters.fuel)
        && matchesSearchValue(car.gearbox, filters.gearbox)
        && matchesSearchValue(car.origin, filters.origin)
        && matchesSearchColor(car.color, filters.color)
        && matchesSearchValue(car.seats, filters.seats)
    );
};

const getHomeSearchCriteriaText = () => {
    if (!homeSearchForm) {
        return 'Bạn chưa chọn tiêu chí, hệ thống đang hiển thị tất cả xe đang bán.';
    }

    const criteria = Array.from(homeSearchForm.elements)
        .filter((element) => ['SELECT', 'INPUT'].includes(element.tagName))
        .map((element) => {
            const value = String(element.value || '').trim();

            if (!value) {
                return '';
            }

            if (element.tagName === 'SELECT') {
                return element.selectedOptions?.[0]?.textContent.trim() || value;
            }

            if (element.name === 'yearFrom') {
                return `Từ năm ${value}`;
            }

            if (element.name === 'yearTo') {
                return `Đến năm ${value}`;
            }

            return value;
        })
        .filter(Boolean);

    if (!criteria.length) {
        return 'Bạn chưa chọn tiêu chí, hệ thống đang hiển thị tất cả xe đang bán.';
    }

    return `Tiêu chí: ${criteria.join(', ')}.`;
};

const getFilteredAllCars = () => {
    const keyword = normalizeSearchValue(allCarsSearchInput?.value);

    if (!keyword) {
        return rentalCars;
    }

    return rentalCars.filter((car) =>
        normalizeSearchValue([
            car.name,
            car.brand,
            car.category,
            car.drivetrain,
        ].join(' ')).includes(keyword)
    );
};

const renderAllCarsGrid = () => {
    if (!allCarsGrid) {
        return;
    }

    const filteredCars = getFilteredAllCars();

    if (!filteredCars.length) {
        allCarsGrid.innerHTML = `
            <article class="all-cars-empty">
                <p>Không tìm thấy xe phù hợp với tên bạn nhập.</p>
            </article>
        `;
        return;
    }

    allCarsGrid.innerHTML = filteredCars.map(renderCarCard).join('');
};

const renderSearchResultsGrid = (cars = []) => {
    if (!searchResultsGrid) {
        return;
    }

    const criteriaText = getHomeSearchCriteriaText();

    if (searchResultsSummary) {
        searchResultsSummary.textContent = cars.length
            ? `Tìm thấy ${cars.length} xe phù hợp. ${criteriaText} Nhấn vào xe để xem chi tiết.`
            : `Không tìm thấy xe phù hợp. ${criteriaText}`;
    }

    if (!cars.length) {
        searchResultsGrid.innerHTML = `
            <article class="search-results-empty">
                <i class="bx bx-search-alt" aria-hidden="true"></i>
                <strong>Không tìm thấy xe theo tiêu chí đã chọn</strong>
                <p>Hãy thử chọn ít tiêu chí hơn, nới khoảng giá hoặc thay đổi số km để xem thêm xe phù hợp.</p>
            </article>
        `;
        return;
    }

    searchResultsGrid.innerHTML = cars.map(renderCarCard).join('');
};

const renderFavoriteCarsGrid = () => {
    if (!favoriteCarsGrid) {
        return;
    }

    if (!currentUser) {
        favoriteCarsGrid.innerHTML = `
            <article class="all-cars-empty">
                <p>Vui lòng đăng nhập để xem danh sách xe yêu thích.</p>
            </article>
        `;
        return;
    }

    if (!favoriteCars.length) {
        favoriteCarsGrid.innerHTML = `
            <article class="all-cars-empty">
                <p>Bạn chưa có xe yêu thích nào.</p>
            </article>
        `;
        return;
    }

    favoriteCarsGrid.innerHTML = favoriteCars.map(renderFavoriteCarListItem).join('');
};

const renderCars = (cars = []) => {
    if (!rentalContainer) {
        return;
    }

    rentalCars = cars;
    populateHomeSearchOptions();
    renderVisibleCars();
};

const updateRentalViewAllButton = () => {
    if (!rentalViewAllButton) {
        return;
    }

    const hasMoreCars = rentalCars.length > 0;

    rentalViewAllButton.hidden = !hasMoreCars;
    rentalViewAllButton.textContent = 'XEM TẤT CẢ +';

    if (rentalViewAllButton.matches('a[href]')) {
        rentalViewAllButton.removeAttribute('aria-expanded');
        return;
    }

    rentalViewAllButton.setAttribute(
        'aria-expanded',
        String(allCarsModal?.classList.contains('is-open'))
    );
};

const renderVisibleCars = () => {
    if (!rentalContainer) {
        return;
    }

    if (!rentalCars.length) {
        rentalContainer.innerHTML = `
            <article class="rental-card">
                <h3>Chưa có dữ liệu xe</h3>
                <p>Danh sách xe sẽ hiển thị ở đây ngay khi có dữ liệu từ hệ thống.</p>
            </article>
        `;
        updateRentalViewAllButton();
        updateRentalSliderControls();
        return;
    }

    rentalContainer.innerHTML = rentalCars
        .slice(0, featuredRentalLimit)
        .map(renderCarCard)
        .join('');
    rentalContainer.scrollLeft = 0;

    updateRentalViewAllButton();
    window.requestAnimationFrame(updateRentalSliderControls);
};

const renderCarsError = (message) => {
    if (!rentalContainer) {
        return;
    }

    rentalCars = [];
    rentalContainer.innerHTML = `
        <article class="rental-card">
            <h3>Không thể tải dữ liệu xe</h3>
            <p>${message}</p>
        </article>
    `;
    updateRentalViewAllButton();
    updateRentalSliderControls();
};

const syncFavoriteButtons = (carId) => {
    const normalizedCarId = String(carId);
    const isActive = isFavoriteCar(normalizedCarId);

    document.querySelectorAll(`[data-favorite-car="${CSS.escape(normalizedCarId)}"]`).forEach((button) => {
        const icon = button.querySelector('i');
        const car = rentalCars.find((item) => String(item.id) === normalizedCarId);

        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
        button.setAttribute('aria-label', `${isActive ? 'Bỏ yêu thích' : 'Yêu thích'} ${car?.name || 'xe này'}`);

        if (icon) {
            icon.className = `bx ${isActive ? 'bxs-heart' : 'bx-heart'}`;
        }
    });
};

const setFavoriteCars = (cars = []) => {
    favoriteCars = Array.isArray(cars) ? cars : [];
    favoriteCarIds = new Set(favoriteCars.map((car) => String(car.id)));
};

const refreshFavoriteUi = () => {
    document.querySelectorAll('[data-favorite-car]').forEach((button) => {
        syncFavoriteButtons(button.dataset.favoriteCar);
    });
    renderFavoriteCarsGrid();
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
        setFormFeedback(loginFeedback, 'Vui lòng đăng nhập để lưu xe yêu thích.');
        openLoginModal();
        return;
    }

    const shouldRemoveFavorite = isFavoriteCar(carId);

    favoriteButton.disabled = true;

    try {
        const { response, data } = await requestJson(`/api/favorites/${carId}`, {
            method: shouldRemoveFavorite ? 'DELETE' : 'POST',
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể cập nhật xe yêu thích lúc này.');
        }

        setFavoriteCars(data.cars || []);
        refreshFavoriteUi();
    } catch (error) {
        window.alert(error.message || 'Không thể cập nhật xe yêu thích lúc này.');
    } finally {
        favoriteButton.disabled = false;
    }
};

const openCarDetailFromCard = (card) => {
    const detailUrl = card?.dataset.carDetailUrl;

    if (detailUrl) {
        window.location.href = detailUrl;
    }
};

const handleCarCardClick = (event) => {
    if (event.target.closest('a, button, input, select, textarea')) {
        return;
    }

    openCarDetailFromCard(event.target.closest('[data-car-detail-url]'));
};

const handleCarCardKeydown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
        return;
    }

    const card = event.target.closest('[data-car-detail-url]');

    if (!card || event.target !== card) {
        return;
    }

    event.preventDefault();
    openCarDetailFromCard(card);
};

const openAllCarsModal = () => {
    if (!allCarsModal || !allCarsGrid) {
        return;
    }

    if (allCarsSearchInput) {
        allCarsSearchInput.value = '';
    }

    renderAllCarsGrid();
    allCarsModal.classList.add('is-open');
    allCarsModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('all-cars-modal-open');
    window.setTimeout(() => {
        allCarsSearchInput?.focus();
    }, 80);
    updateRentalViewAllButton();
};

const closeAllCarsModal = () => {
    if (!allCarsModal) {
        return;
    }

    allCarsModal.classList.remove('is-open');
    allCarsModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('all-cars-modal-open');
    updateRentalViewAllButton();
};

const openSearchResultsModal = () => {
    if (!searchResultsModal) {
        return;
    }

    searchResultsModal.classList.add('is-open');
    searchResultsModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-results-modal-open');
    window.setTimeout(() => {
        searchResultsModal.querySelector('[data-close-search-results]')?.focus();
    }, 80);
};

const closeSearchResultsModal = () => {
    if (!searchResultsModal) {
        return;
    }

    searchResultsModal.classList.remove('is-open');
    searchResultsModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-results-modal-open');
};

const openFavoriteCarsModal = async () => {
    if (!favoriteCarsModal || !favoriteCarsGrid) {
        return;
    }

    if (!currentUser) {
        closeAccountMenu();
        setFormFeedback(loginFeedback, 'Vui lòng đăng nhập để xem xe yêu thích.');
        openLoginModal();
        return;
    }

    await syncFavoriteCars();
    renderFavoriteCarsGrid();
    favoriteCarsModal.classList.add('is-open');
    favoriteCarsModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('favorite-cars-modal-open');
};

const closeFavoriteCarsModal = () => {
    if (!favoriteCarsModal) {
        return;
    }

    favoriteCarsModal.classList.remove('is-open');
    favoriteCarsModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('favorite-cars-modal-open');
};

const loadDismissedNotificationIds = () => {
    try {
        const parsedIds = JSON.parse(localStorage.getItem(dismissedNotificationsStorageKey) || '[]');
        dismissedNotificationIds = new Set(
            Array.isArray(parsedIds) ? parsedIds.map((id) => String(id)) : []
        );
    } catch (error) {
        dismissedNotificationIds = new Set();
    }
};

const saveDismissedNotificationIds = () => {
    try {
        localStorage.setItem(
            dismissedNotificationsStorageKey,
            JSON.stringify([...dismissedNotificationIds])
        );
    } catch (error) {
        // Nếu trình duyệt chặn localStorage, vẫn xóa tạm trong phiên hiện tại.
    }
};

const getNotificationKey = (type, id) => `${type}:${id}`;

const testDriveNotificationLabels = {
    approved: {
        meta: 'Lái thử',
        title: 'Đồng ý cho phép lái thử',
        icon: 'bxs-check-circle',
        footer: 'OkXe đã đồng ý lịch lái thử của bạn.'
    },
    cancelled: {
        meta: 'Lịch hẹn',
        title: 'Hủy lịch hẹn',
        icon: 'bxs-x-circle',
        footer: 'Lịch hẹn lái thử đã được hủy.'
    },
    pending: {
        meta: 'Lịch hẹn',
        title: 'Cần đổi khung giờ lái thử',
        icon: 'bxs-time-five',
        footer: 'Khung giờ bạn chọn cần được sắp xếp lại. OkXe sẽ liên hệ để hỗ trợ đổi lịch.'
    },
    registered: {
        meta: 'Lái thử',
        title: 'Đã nhận đăng ký lái thử',
        icon: 'bxs-calendar-check',
        footer: 'Lịch hẹn đang chờ nhân viên xác nhận.'
    }
};

const carBuyRequestNotificationLabels = {
    pending: {
        meta: 'Tin mua xe',
        title: 'Đã nhận tin mua ô tô',
        icon: 'bx-message-square-edit',
        footer: 'Tin của bạn đang chờ cửa hàng duyệt trước khi hiển thị công khai.'
    },
    approved: {
        meta: 'Tin mua xe',
        title: 'Tin mua ô tô đã được duyệt',
        icon: 'bxs-check-circle',
        footer: 'Tin của bạn đã hiển thị trên mục Tin mua ô tô.'
    },
    rejected: {
        meta: 'Tin mua xe',
        title: 'Tin mua ô tô bị từ chối',
        icon: 'bxs-x-circle',
        footer: 'Tin chưa được hiển thị công khai. Bạn có thể đăng lại với nội dung phù hợp hơn.'
  }
};

const carBuyRequestOfferNotificationLabels = {
    new: {
        meta: 'Xe phù hợp mới',
        title: 'Có người vừa đề xuất xe cho tin mua của bạn',
        icon: 'bxs-car',
        footer: 'OkXe đang kiểm tra thông tin xe và sẽ hỗ trợ kết nối nếu phù hợp.'
    },
    contacted: {
        meta: 'Đang xác minh',
        title: 'OkXe đã liên hệ người có xe phù hợp',
        icon: 'bx-phone-call',
        footer: 'Đội ngũ OkXe đang xác minh thông tin xe trước khi kết nối với bạn.'
    },
    matched: {
        meta: 'Sẵn sàng kết nối',
        title: 'Xe phù hợp đã sẵn sàng kết nối',
        icon: 'bx-link-alt',
        footer: 'OkXe sẽ liên hệ bạn để xác nhận nhu cầu và sắp xếp trao đổi.'
    },
    rejected: {
        meta: 'Đã kiểm tra',
        title: 'Một đề xuất xe chưa phù hợp',
        icon: 'bxs-x-circle',
        footer: 'OkXe đã kiểm tra và xác định đề xuất này chưa phù hợp với nhu cầu của bạn.'
    }
};

const userNotificationLabels = {
    pending: {
        meta: 'Đăng bán xe',
        icon: 'bx-message-square-edit',
        actionText: 'Xem biểu mẫu',
        actionUrl: '/dang-tin-ban-xe'
    },
    approved: {
        meta: 'Đăng bán xe',
        icon: 'bxs-check-circle',
        actionText: 'Xem kho xe',
        actionUrl: '/mua-xe'
    },
    rejected: {
        meta: 'Đăng bán xe',
        icon: 'bxs-x-circle',
        actionText: 'Đăng lại xe',
        actionUrl: '/dang-tin-ban-xe'
    },
    default: {
        meta: 'Thông báo',
        icon: 'bxs-bell',
        actionText: 'Xem chi tiết',
        actionUrl: '/'
    }
};

const getTestDriveNotificationState = (appointment = {}) => {
    const status = String(appointment.status || '').trim().toLowerCase();
    const hasStatusNote = String(appointment.statusNote || '').trim().length > 0;

    if (status === 'approved') {
        return 'approved';
    }

    if (status === 'cancelled') {
        return 'cancelled';
    }

    if (status === 'pending' && hasStatusNote) {
        return 'pending';
    }

    return 'registered';
};

const getCustomerTestDriveStatusNote = (statusNote = '') => {
    const note = String(statusNote || '').trim();

    if (!note) {
        return '';
    }

    return note
        .replace(
            'Vui lòng liên hệ với khách hàng để đổi khung giờ.',
            'OkXe sẽ liên hệ để hỗ trợ bạn đổi sang khung giờ phù hợp.'
        )
        .replace(
            'Nhân viên sẽ liên hệ để hỗ trợ đổi sang khung giờ khác.',
            'OkXe sẽ liên hệ để hỗ trợ bạn đổi sang khung giờ phù hợp.'
        );
};

const getTestDriveNotificationKey = (appointment = {}) =>
    getNotificationKey(
        'test-drive',
        [
            appointment.id,
            getTestDriveNotificationState(appointment),
            appointment.updatedAt || appointment.createdAt || ''
        ].join(':')
    );

const getCarBuyRequestNotificationKey = (request = {}) =>
    getNotificationKey(
        'car-buy-request',
        [
            request.id,
            request.status || 'pending',
            request.updatedAt || request.createdAt || ''
        ].join(':')
    );

const getCarBuyRequestOfferNotificationKey = (request = {}, offer = {}) =>
    getNotificationKey(
        'car-buy-request-offer',
        [
            request.id,
            offer.id,
            offer.status || 'new',
            offer.updatedAt || offer.createdAt || ''
        ].join(':')
    );

const getUserNotificationKey = (notification = {}) =>
    getNotificationKey(
        'user-notification',
        [
            notification.id,
            notification.status || '',
            notification.createdAt || ''
        ].join(':')
    );

const isNotificationDismissed = (type, id) =>
    dismissedNotificationIds.has(getNotificationKey(type, id))
    || (type === 'promotion' && dismissedNotificationIds.has(String(id || '')));

const getNotificationPromotions = (promotions = promotionsState) =>
    [...promotions]
        .filter((promotion) => promotion?.showOnHome !== false)
        .filter((promotion) => !isNotificationDismissed('promotion', promotion.id))
        .sort((first, second) => {
            const firstTime = new Date(first.createdAt || first.startsAt || 0).getTime();
            const secondTime = new Date(second.createdAt || second.startsAt || 0).getTime();

            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
        });

const getNotificationTestDriveAppointments = () =>
    [...testDriveAppointmentsState]
        .filter((appointment) => !dismissedNotificationIds.has(getTestDriveNotificationKey(appointment)))
        .sort((first, second) => {
            const firstTime = new Date(first.createdAt || 0).getTime();
            const secondTime = new Date(second.createdAt || 0).getTime();

            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
        });

const getNotificationCarBuyRequests = () =>
    [...carBuyRequestsState]
        .filter((request) => !dismissedNotificationIds.has(getCarBuyRequestNotificationKey(request)))
        .sort((first, second) => {
            const firstTime = new Date(first.updatedAt || first.createdAt || 0).getTime();
            const secondTime = new Date(second.updatedAt || second.createdAt || 0).getTime();

            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
        });

const getNotificationCarBuyRequestOffers = () =>
    carBuyRequestsState
        .flatMap((request) => {
            const offers = Array.isArray(request.offerNotifications)
                ? request.offerNotifications
                : [];

            return offers.map((offer) => ({
                request,
                offer,
                updatedAt: offer.updatedAt || offer.createdAt || request.updatedAt || request.createdAt || ''
            }));
        })
        .filter(({ request, offer }) =>
            !dismissedNotificationIds.has(getCarBuyRequestOfferNotificationKey(request, offer))
        )
        .sort((first, second) => {
            const firstTime = new Date(first.updatedAt || 0).getTime();
            const secondTime = new Date(second.updatedAt || 0).getTime();

            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
        });

const getNotificationUserNotifications = () =>
    [...userNotificationsState]
        .filter((notification) => !dismissedNotificationIds.has(getUserNotificationKey(notification)))
        .sort((first, second) => {
            const firstTime = new Date(first.createdAt || 0).getTime();
            const secondTime = new Date(second.createdAt || 0).getTime();

            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
        });

const updateNotificationBadge = () => {
    const notificationCount =
        getNotificationPromotions().length
        + getNotificationTestDriveAppointments().length
        + getNotificationCarBuyRequests().length
        + getNotificationCarBuyRequestOffers().length
        + getNotificationUserNotifications().length;

    notificationBadges.forEach((badge) => {
        badge.textContent = notificationCount > 9 ? '9+' : String(notificationCount);
        badge.hidden = notificationCount <= 0;
    });
};

const renderPromotionNotifications = (promotions = promotionsState) => {
    if (!notificationsList) {
        updateNotificationBadge();
        return;
    }

    const notificationPromotions = getNotificationPromotions(promotions);
    const notificationAppointments = getNotificationTestDriveAppointments();
    const notificationCarBuyRequests = getNotificationCarBuyRequests();
    const notificationCarBuyRequestOffers = getNotificationCarBuyRequestOffers();
    const notificationUserNotifications = getNotificationUserNotifications();
    const notifications = [
        ...notificationUserNotifications.map((notification) => ({ type: 'user-notification', item: notification })),
        ...notificationAppointments.map((appointment) => ({ type: 'test-drive', item: appointment })),
        ...notificationCarBuyRequestOffers.map((offerNotification) => ({ type: 'car-buy-request-offer', item: offerNotification })),
        ...notificationCarBuyRequests.map((request) => ({ type: 'car-buy-request', item: request })),
        ...notificationPromotions.map((promotion) => ({ type: 'promotion', item: promotion }))
    ].sort((first, second) => {
        const firstTime = new Date(first.item.updatedAt || first.item.createdAt || first.item.startsAt || 0).getTime();
        const secondTime = new Date(second.item.updatedAt || second.item.createdAt || second.item.startsAt || 0).getTime();

        return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
    });
    updateNotificationBadge();

    if (!notifications.length) {
        notificationsList.innerHTML = `
            <article class="notification-empty">
                <i class="bx bx-bell-off" aria-hidden="true"></i>
                <strong>Chưa có thông báo mới</strong>
                <p>Các cập nhật về xe yêu thích, lịch hẹn hoặc ưu đãi sẽ hiển thị tại đây.</p>
            </article>
        `;
        return;
    }

    notificationsList.innerHTML = notifications.map(({ type, item }) => {
        if (type === 'test-drive') {
            const appointment = item;
            const notificationState = getTestDriveNotificationState(appointment);
            const notificationConfig = testDriveNotificationLabels[notificationState] || testDriveNotificationLabels.registered;
            const createdText = formatPromotionDate(
                String(appointment.updatedAt || appointment.createdAt || '').slice(0, 10),
                'Vừa đăng ký'
            );
            const preferredDateText = formatPromotionDate(appointment.preferredDate, 'Chưa rõ ngày');
            const preferredTimeText = String(appointment.preferredTimeSlot || '').trim();
            const notificationKey = getTestDriveNotificationKey(appointment);
            const carTitle = [appointment.carBrand, appointment.carName].filter(Boolean).join(' ') || 'Xe đã chọn';
            const reasonText = getCustomerTestDriveStatusNote(appointment.statusNote);
            const scheduleText = preferredTimeText
                ? `${preferredDateText}, khung giờ ${preferredTimeText}`
                : preferredDateText;
            const detailText = notificationState === 'registered'
                ? `${carTitle} - lịch dự kiến ${scheduleText}.`
                : `${carTitle} - lịch hẹn ${scheduleText}.`;
            const footerText = reasonText
                ? `${notificationState === 'approved' ? 'Ghi chú' : 'Lý do'}: ${reasonText}`
                : notificationConfig.footer;
            const appointmentAction = notificationState === 'pending'
                ? `
                            <a href="/dang-ky-lai-thu?carId=${encodeURIComponent(String(appointment.carId || ''))}" class="notification-item__action" data-close-notifications-link>
                                <span>Đổi lịch</span>
                                <i class="bx bx-calendar-edit" aria-hidden="true"></i>
                            </a>
                        `
                : `
                            <button type="button" class="notification-item__action notification-item__action--danger" data-delete-test-drive-appointment="${escapeHtml(String(appointment.id || ''))}">
                                <span>Xóa lịch</span>
                                <i class="bx bx-trash" aria-hidden="true"></i>
                            </button>
                        `;

            return `
                <article class="notification-item">
                    <button type="button" class="notification-item__delete" data-delete-notification="${escapeHtml(notificationKey)}" aria-label="Xóa thông báo đăng ký lái thử">
                        <i class="bx bx-x" aria-hidden="true"></i>
                    </button>
                    <span class="notification-item__icon">
                        <i class="bx ${escapeHtml(notificationConfig.icon)}" aria-hidden="true"></i>
                    </span>
                    <div class="notification-item__body">
                        <div class="notification-item__meta">
                            <span>${escapeHtml(notificationConfig.meta)}</span>
                            <small>${escapeHtml(createdText)}</small>
                        </div>
                        <h3>${escapeHtml(notificationConfig.title)}</h3>
                        <p>${escapeHtml(detailText)}</p>
                        <div class="notification-item__footer">
                            <small>${escapeHtml(footerText)}</small>
                            ${appointmentAction}
                        </div>
                    </div>
                </article>
            `;
        }

        if (type === 'car-buy-request-offer') {
            const { request, offer } = item;
            const status = String(offer.status || 'new').trim().toLowerCase();
            const notificationConfig = carBuyRequestOfferNotificationLabels[status]
                || carBuyRequestOfferNotificationLabels.new;
            const notificationKey = getCarBuyRequestOfferNotificationKey(request, offer);
            const createdText = formatPromotionDate(
                String(offer.updatedAt || offer.createdAt || '').slice(0, 10),
                'Vừa đề xuất'
            );
            const carTitle = [offer.carBrand, offer.carModel, offer.carYear]
                .filter(Boolean)
                .join(' ') || 'Xe phù hợp';
            const carDetails = [offer.carVersion, offer.expectedPrice, offer.mileage]
                .filter(Boolean)
                .join(' · ');
            const requestTitle = request.title || 'Tin mua ô tô của bạn';
            const requestCode = request.code || `MX-${String(request.id || '').padStart(6, '0')}`;
            const detailText = `${carTitle}${carDetails ? ` · ${carDetails}` : ''}. Đề xuất dành cho ${requestCode} - ${requestTitle}.`;

            return `
                <article class="notification-item">
                    <button type="button" class="notification-item__delete" data-delete-notification="${escapeHtml(notificationKey)}" aria-label="Xóa thông báo xe phù hợp">
                        <i class="bx bx-x" aria-hidden="true"></i>
                    </button>
                    <span class="notification-item__icon">
                        <i class="bx ${escapeHtml(notificationConfig.icon)}" aria-hidden="true"></i>
                    </span>
                    <div class="notification-item__body">
                        <div class="notification-item__meta">
                            <span>${escapeHtml(notificationConfig.meta)}</span>
                            <small>${escapeHtml(createdText)}</small>
                        </div>
                        <h3>${escapeHtml(notificationConfig.title)}</h3>
                        <p>${escapeHtml(detailText)}</p>
                        <div class="notification-item__footer">
                            <small>${escapeHtml(notificationConfig.footer)}</small>
                            <a href="/tin-mua-o-to" data-close-notifications-link>
                                <span>Xem tin mua xe</span>
                                <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }

        if (type === 'car-buy-request') {
            const request = item;
            const status = String(request.status || 'pending').trim().toLowerCase();
            const notificationConfig = carBuyRequestNotificationLabels[status] || carBuyRequestNotificationLabels.pending;
            const createdText = formatPromotionDate(
                String(request.updatedAt || request.createdAt || '').slice(0, 10),
                'Vừa gửi'
            );
            const notificationKey = getCarBuyRequestNotificationKey(request);
            const title = request.title || 'Tin mua ô tô của bạn';
            const budgetText = {
                'under-200': 'Dưới 200 Triệu',
                '200-400': '200-400 Triệu',
                '400-600': '400-600 Triệu',
                '600-800': '600-800 Triệu',
                '800-1000': '800-1 Tỉ',
                'over-1000': 'Trên 1 Tỉ'
            }[request.budgetRange] || 'Giá thỏa thuận';
            const detailText = `${title} - mức tiền ${budgetText}${request.province ? ` tại ${request.province}` : ''}.`;
            const footerText = request.statusNote
                ? `Ghi chú: ${request.statusNote}`
                : notificationConfig.footer;

            return `
                <article class="notification-item">
                    <button type="button" class="notification-item__delete" data-delete-notification="${escapeHtml(notificationKey)}" aria-label="Xóa thông báo tin mua xe">
                        <i class="bx bx-x" aria-hidden="true"></i>
                    </button>
                    <span class="notification-item__icon">
                        <i class="bx ${escapeHtml(notificationConfig.icon)}" aria-hidden="true"></i>
                    </span>
                    <div class="notification-item__body">
                        <div class="notification-item__meta">
                            <span>${escapeHtml(notificationConfig.meta)}</span>
                            <small>${escapeHtml(createdText)}</small>
                        </div>
                        <h3>${escapeHtml(notificationConfig.title)}</h3>
                        <p>${escapeHtml(detailText)}</p>
                        <div class="notification-item__footer">
                            <small>${escapeHtml(footerText)}</small>
                            <a href="/tin-mua-o-to" data-close-notifications-link>
                                <span>Xem tin mua xe</span>
                                <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }

        if (type === 'user-notification') {
            const notification = item;
            const status = String(notification.status || 'default').trim().toLowerCase();
            const notificationConfig = userNotificationLabels[status] || userNotificationLabels.default;
            const createdText = formatPromotionDate(
                String(notification.createdAt || '').slice(0, 10),
                'Vừa cập nhật'
            );
            const notificationKey = getUserNotificationKey(notification);
            const title = notification.title || 'Thông báo từ OkXe';
            const message = notification.message || 'OkXe vừa cập nhật trạng thái yêu cầu của bạn.';

            return `
                <article class="notification-item">
                    <button type="button" class="notification-item__delete" data-delete-notification="${escapeHtml(notificationKey)}" aria-label="Xóa thông báo ${escapeHtml(title)}">
                        <i class="bx bx-x" aria-hidden="true"></i>
                    </button>
                    <span class="notification-item__icon">
                        <i class="bx ${escapeHtml(notificationConfig.icon)}" aria-hidden="true"></i>
                    </span>
                    <div class="notification-item__body">
                        <div class="notification-item__meta">
                            <span>${escapeHtml(notificationConfig.meta)}</span>
                            <small>${escapeHtml(createdText)}</small>
                        </div>
                        <h3>${escapeHtml(title)}</h3>
                        <p>${escapeHtml(message)}</p>
                        <div class="notification-item__footer">
                            <small>${escapeHtml(status === 'rejected' ? 'Bạn cần đăng lại bài nếu muốn OkXe kiểm tra lại.' : 'OkXe sẽ tiếp tục cập nhật khi có thay đổi.')}</small>
                            <a href="${escapeHtml(notificationConfig.actionUrl)}" data-close-notifications-link>
                                <span>${escapeHtml(notificationConfig.actionText)}</span>
                                <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }

        const promotion = item;
        const imageUrl = String(promotion.imageUrl || '').trim();
        const periodText = getPromotionPeriod(promotion);
        const createdText = formatPromotionDate(
            String(promotion.createdAt || '').slice(0, 10),
            'Vừa cập nhật'
        );
        const ctaUrl = promotion.ctaUrl || '#promotions';
        const ctaText = promotion.ctaText || 'Xem ưu đãi';
        const notificationKey = getNotificationKey('promotion', promotion.id);

        return `
            <article class="notification-item" role="button" tabindex="0" data-promotion-notification-id="${escapeHtml(String(promotion.id || ''))}" aria-label="Xem chi tiết ${escapeHtml(promotion.title || 'khuyến mại OkXe')}">
                <button type="button" class="notification-item__delete" data-delete-notification="${escapeHtml(notificationKey)}" aria-label="Xóa thông báo ${escapeHtml(promotion.title || 'khuyến mại OkXe')}">
                    <i class="bx bx-x" aria-hidden="true"></i>
                </button>
                <span class="notification-item__icon">
                    ${imageUrl
                        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(promotion.title || 'Khuyến mại OkXe')}">`
                        : '<i class="bx bxs-purchase-tag" aria-hidden="true"></i>'}
                </span>
                <div class="notification-item__body">
                    <div class="notification-item__meta">
                        <span>Khuyến mại mới</span>
                        <small>${escapeHtml(createdText)}</small>
                    </div>
                    <h3>${escapeHtml(promotion.title || 'Ưu đãi mới từ OkXe')}</h3>
                    <p>${escapeHtml(promotion.summary || 'OkXe vừa cập nhật một chương trình ưu đãi mới dành cho khách hàng.')}</p>
                    <div class="notification-item__footer">
                        <small>${escapeHtml(periodText)}</small>
                        <a href="${escapeHtml(ctaUrl)}" data-close-notifications-link>
                            <span>${escapeHtml(ctaText)}</span>
                            <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
};

const deleteNotification = (notificationId) => {
    const normalizedNotificationId = String(notificationId || '');

    if (!normalizedNotificationId) {
        return;
    }

    dismissedNotificationIds.add(normalizedNotificationId);
    saveDismissedNotificationIds();
    renderPromotionNotifications();
};

const deleteTestDriveAppointment = async (appointmentId) => {
    const normalizedAppointmentId = String(appointmentId || '').trim();

    if (!normalizedAppointmentId) {
        return;
    }

    const isConfirmed = window.confirm('Bạn có chắc muốn xóa lịch lái thử này?');

    if (!isConfirmed) {
        return;
    }

    try {
        const { response, data } = await requestJson(`/api/test-drive/appointments/${encodeURIComponent(normalizedAppointmentId)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xóa lịch hẹn lái thử.');
        }

        testDriveAppointmentsState = testDriveAppointmentsState.filter((appointment) =>
            String(appointment.id || '') !== normalizedAppointmentId
        );
        renderPromotionNotifications();
    } catch (error) {
        window.alert(error.message || 'Không thể xóa lịch hẹn lái thử lúc này.');
    }
};

const openNotificationsModal = async () => {
    if (!notificationsModal) {
        return;
    }

    if (!currentUser) {
        closeAccountMenu();
        setFormFeedback(loginFeedback, 'Vui lòng đăng nhập để xem thông báo.');
        openLoginModal();
        return;
    }

    if (notificationsList) {
        notificationsList.innerHTML = `
            <article class="notification-empty">
                <i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i>
                <strong>Đang tải thông báo</strong>
                <p>OkXe đang kiểm tra các khuyến mại mới nhất dành cho bạn.</p>
            </article>
        `;
    }

    notificationsModal.classList.add('is-open');
    notificationsModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('notifications-modal-open');

    await syncPromotions();
    await syncTestDriveAppointments();
    await syncCarBuyRequests();
    await syncUserNotifications();
    renderPromotionNotifications();
};

const closeNotificationsModal = () => {
    if (!notificationsModal) {
        return;
    }

    notificationsModal.classList.remove('is-open');
    notificationsModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('notifications-modal-open');
};

const openPromotionDetailModal = (promotion) => {
    if (!promotionDetailModal || !promotionDetailContent || !promotion) {
        return;
    }

    const imageUrl = String(promotion.imageUrl || '').trim();
    const ctaUrl = promotion.ctaUrl || '#promotions';
    const ctaText = promotion.ctaText || 'Xem ưu đãi';

    promotionDetailContent.innerHTML = `
        <article class="promotion-detail">
            <div class="promotion-detail__media">
                ${imageUrl
                    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(promotion.title || 'Khuyến mại OkXe')}">`
                    : '<i class="bx bxs-purchase-tag" aria-hidden="true"></i>'}
            </div>
            <div class="promotion-detail__body">
                <div class="promotion-detail__meta">
                    <span>${escapeHtml(promotion.badgeText || 'Khuyến mại')}</span>
                    <small>${escapeHtml(getPromotionPeriod(promotion))}</small>
                </div>
                <h2 id="promotion-detail-title">${escapeHtml(promotion.title || 'Ưu đãi OkXe')}</h2>
                <p class="promotion-detail__summary">${escapeHtml(promotion.summary || 'OkXe vừa cập nhật một chương trình ưu đãi mới.')}</p>
                <p class="promotion-detail__content">${escapeHtml(promotion.content || promotion.summary || 'Liên hệ OkXe để nhận thông tin chi tiết về chương trình khuyến mại này.')}</p>
                <a class="promotion-detail__button" href="${escapeHtml(ctaUrl)}" data-close-promotion-detail-link>
                    <span>${escapeHtml(ctaText)}</span>
                    <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                </a>
            </div>
        </article>
    `;

    closeNotificationsModal();
    promotionDetailModal.classList.add('is-open');
    promotionDetailModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('promotion-detail-modal-open');
};

const closePromotionDetailModal = () => {
    if (!promotionDetailModal) {
        return;
    }

    promotionDetailModal.classList.remove('is-open');
    promotionDetailModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('promotion-detail-modal-open');
};

rentalViewAllButton?.addEventListener('click', (event) => {
    if (event.currentTarget.matches('a[href]')) {
        return;
    }

    openAllCarsModal();
});
rentalSliderPrevButton?.addEventListener('click', () => scrollRentalSlider(-1));
rentalSliderNextButton?.addEventListener('click', () => scrollRentalSlider(1));
rentalContainer?.addEventListener('scroll', updateRentalSliderControls, { passive: true });
rentalContainer?.addEventListener('click', handleFavoriteButtonClick);
rentalContainer?.addEventListener('click', handleCarCardClick);
rentalContainer?.addEventListener('keydown', handleCarCardKeydown);
allCarsGrid?.addEventListener('click', handleFavoriteButtonClick);
allCarsGrid?.addEventListener('click', handleCarCardClick);
allCarsGrid?.addEventListener('keydown', handleCarCardKeydown);
searchResultsGrid?.addEventListener('click', handleFavoriteButtonClick);
searchResultsGrid?.addEventListener('click', handleCarCardClick);
searchResultsGrid?.addEventListener('keydown', handleCarCardKeydown);
favoriteCarsGrid?.addEventListener('click', handleFavoriteButtonClick);
favoriteCarsGrid?.addEventListener('click', handleCarCardClick);
favoriteCarsGrid?.addEventListener('keydown', handleCarCardKeydown);
allCarsSearchInput?.addEventListener('input', renderAllCarsGrid);
allCarsCloseButtons.forEach((button) => {
    button.addEventListener('click', closeAllCarsModal);
});
searchResultsCloseButtons.forEach((button) => {
    button.addEventListener('click', closeSearchResultsModal);
});
favoriteCarsCloseButtons.forEach((button) => {
    button.addEventListener('click', closeFavoriteCarsModal);
});
notificationsCloseButtons.forEach((button) => {
    button.addEventListener('click', closeNotificationsModal);
});

homeSearchForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!rentalCars.length) {
        await syncCars();
    }

    renderSearchResultsGrid(getFilteredHomeSearchCars());
    openSearchResultsModal();
});

const getTeamMemberImage = (member) =>
    String(member?.avatarUrl || '').trim() || '/images/showroom-sales-consultant.png';

const getTeamContactLinks = (member) => {
    const phone = String(member?.phone || '').trim();
    const phoneHref = phone.replace(/[^\d+]/g, '');
    const email = String(member?.email || '').trim().toLowerCase();

    return { phone, phoneHref, email };
};

const closeTeamMemberModal = () => {
    if (!teamMemberModal) {
        return;
    }

    teamMemberModal.classList.remove('is-open');
    teamMemberModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('team-modal-open');
    window.clearTimeout(teamMemberCloseTimer);
    teamMemberCloseTimer = window.setTimeout(() => {
        teamMemberModal.hidden = true;
    }, 220);
};

const openTeamMemberModal = (member) => {
    if (!teamMemberModal || !teamMemberModalContent || !member) {
        return;
    }

    const { phone, phoneHref, email } = getTeamContactLinks(member);
    const fullName = member.fullName || 'Nhân viên OkXe';
    const salesTitle = member.salesTitle || 'Nhân viên kinh doanh';
    const experience = member.salesExperience || 'Chưa cập nhật kinh nghiệm';
    const bio = member.salesBio || 'Chưa cập nhật mô tả.';

    teamMemberModalContent.innerHTML = `
        <div class="team-member-profile">
            <div class="team-member-profile__media">
                <img src="${escapeHtml(getTeamMemberImage(member))}" alt="Ảnh đại diện ${escapeHtml(fullName)}">
                <span>${escapeHtml(salesTitle)}</span>
            </div>
            <div class="team-member-profile__body">
                <p class="team-member-profile__eyebrow">Thông tin nhân viên</p>
                <h2 id="team-member-modal-title">${escapeHtml(fullName)}</h2>
                <p class="team-member-profile__summary">${escapeHtml(bio)}</p>
                <div class="team-member-profile__actions">
                    ${phone ? `
                        <a href="tel:${escapeHtml(phoneHref)}" class="team-member-profile__action">
                            <i class="bx bx-phone-call" aria-hidden="true"></i>
                            <span>${escapeHtml(phone)}</span>
                        </a>
                    ` : ''}
                    ${email ? `
                        <a href="mailto:${escapeHtml(email)}" class="team-member-profile__action team-member-profile__action--mail">
                            <i class="bx bx-envelope" aria-hidden="true"></i>
                            <span>${escapeHtml(email)}</span>
                        </a>
                    ` : ''}
                </div>
                <dl class="team-member-profile__details">
                    <div>
                        <dt>Chức danh</dt>
                        <dd>${escapeHtml(salesTitle)}</dd>
                    </div>
                    <div>
                        <dt>Kinh nghiệm</dt>
                        <dd>${escapeHtml(experience)}</dd>
                    </div>
                    <div>
                        <dt>Email</dt>
                        <dd>${email ? escapeHtml(email) : 'Chưa cập nhật'}</dd>
                    </div>
                    <div>
                        <dt>Số điện thoại/Zalo</dt>
                        <dd>${phone ? escapeHtml(phone) : 'Chưa cập nhật'}</dd>
                    </div>
                </dl>
            </div>
        </div>
    `;

    window.clearTimeout(teamMemberCloseTimer);
    teamMemberModal.hidden = false;
    teamMemberModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('team-modal-open');
    window.requestAnimationFrame(() => {
        teamMemberModal.classList.add('is-open');
    });
};

const updateTeamCarouselControls = () => {
    if (!teamContainer) {
        return;
    }

    const viewport = teamContainer.querySelector('.team-carousel__viewport');
    const prevButton = teamContainer.querySelector('[data-team-slide-direction="-1"]');
    const nextButton = teamContainer.querySelector('[data-team-slide-direction="1"]');
    const dots = Array.from(teamContainer.querySelectorAll('[data-team-slide-index]'));

    if (!viewport || !prevButton || !nextButton) {
        return;
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    const canScroll = maxScrollLeft > 1;
    const activeIndex = Math.round(viewport.scrollLeft / Math.max(viewport.clientWidth, 1));

    prevButton.disabled = !canScroll || viewport.scrollLeft <= 1;
    nextButton.disabled = !canScroll || viewport.scrollLeft >= maxScrollLeft - 1;

    dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeIndex);
        dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
    });
};

const renderTeamCarouselDots = () => {
    const viewport = teamContainer?.querySelector('.team-carousel__viewport');
    const dotsContainer = teamContainer?.querySelector('.team-carousel__dots');

    if (!viewport || !dotsContainer) {
        return;
    }

    const pageCount = Math.max(1, Math.ceil((viewport.scrollWidth - viewport.clientWidth) / Math.max(viewport.clientWidth, 1)) + 1);

    dotsContainer.innerHTML = pageCount > 1
        ? Array.from({ length: pageCount }, (_, index) => `
            <button type="button" class="team-carousel__dot${index === 0 ? ' is-active' : ''}" data-team-slide-index="${index}" aria-label="Xem trang nhân viên ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"></button>
        `).join('')
        : '';
};

const scrollTeamCarousel = (direction) => {
    const viewport = teamContainer?.querySelector('.team-carousel__viewport');

    if (!viewport) {
        return;
    }

    viewport.scrollBy({
        left: direction * viewport.clientWidth,
        behavior: 'smooth'
    });
};

const goToTeamCarouselPage = (pageIndex) => {
    const viewport = teamContainer?.querySelector('.team-carousel__viewport');

    if (!viewport) {
        return;
    }

    viewport.scrollTo({
        left: pageIndex * viewport.clientWidth,
        behavior: 'smooth'
    });
};

const renderTeamMembers = (teamMembers = []) => {
    if (!teamContainer) {
        return;
    }

    const visibleTeamMembers = teamMembers.slice(0, homepageTeamMemberLimit);

    teamMembersState = visibleTeamMembers;

    if (!visibleTeamMembers.length) {
        teamContainer.innerHTML = `
            <article class="team-empty">
                <i class="bx bx-user-voice" aria-hidden="true"></i>
                <p>Admin chưa chọn tư vấn bán hàng nổi bật để hiển thị trên trang chủ.</p>
            </article>
        `;
        return;
    }

    const memberCards = visibleTeamMembers.map((member) => {
        const { phone, phoneHref, email } = getTeamContactLinks(member);
        const memberId = String(member.id || '');
        const fullName = member.fullName || 'Nhân viên kinh doanh OkXe';

        return `
            <article class="team-box">
                <button type="button" class="team-photo-button" data-team-member-id="${escapeHtml(memberId)}" aria-label="Xem thông tin ${escapeHtml(fullName)}">
                    <img src="${escapeHtml(getTeamMemberImage(member))}" alt="${escapeHtml(fullName)}" class="team-img">
                </button>
                <div class="team-data">
                    <span class="team-role">${escapeHtml(member.salesTitle || 'Nhân viên kinh doanh')}</span>
                    <h3>${escapeHtml(member.fullName || 'Nhân viên OkXe')}</h3>
                    <p>${escapeHtml(member.salesExperience || 'Tư vấn xe cũ chuyên nghiệp')}</p>
                    ${phone || email ? `
                        <div class="team-contact-list">
                            ${phone ? `
                                <a class="team-contact" href="tel:${escapeHtml(phoneHref)}" aria-label="Gọi ${escapeHtml(phone)}" title="${escapeHtml(phone)}">
                                    <i class="bx bx-phone-call" aria-hidden="true"></i>
                                </a>
                            ` : ''}
                            ${email ? `
                                <a class="team-contact" href="mailto:${escapeHtml(email)}" aria-label="Gửi email ${escapeHtml(email)}" title="${escapeHtml(email)}">
                                    <i class="bx bx-envelope" aria-hidden="true"></i>
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </article>
        `;
    }).join('');

    teamContainer.innerHTML = `
        <div class="team-carousel" aria-label="Danh sách tư vấn bán hàng nổi bật">
            <button type="button" class="team-carousel__button team-carousel__button--prev" data-team-slide-direction="-1" aria-label="Xem nhân viên trước">
                <i class="bx bx-chevron-left" aria-hidden="true"></i>
            </button>
            <div class="team-carousel__viewport">
                ${memberCards}
            </div>
            <button type="button" class="team-carousel__button team-carousel__button--next" data-team-slide-direction="1" aria-label="Xem nhân viên tiếp theo">
                <i class="bx bx-chevron-right" aria-hidden="true"></i>
            </button>
            <div class="team-carousel__dots" aria-label="Chọn trang nhân viên"></div>
        </div>
    `;

    const viewport = teamContainer.querySelector('.team-carousel__viewport');
    viewport?.addEventListener('scroll', updateTeamCarouselControls, { passive: true });
    window.requestAnimationFrame(() => {
        renderTeamCarouselDots();
        updateTeamCarouselControls();
    });
};

const syncTeamMembers = async () => {
    if (!teamContainer) {
        return;
    }

    try {
        const { response, data } = await requestJson('/api/team-members');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải đội ngũ tư vấn bán hàng.');
        }

        renderTeamMembers(data.teamMembers || []);
    } catch (error) {
        teamContainer.innerHTML = `
            <article class="team-empty">
                <i class="bx bx-error-circle" aria-hidden="true"></i>
                <p>Không thể tải đội ngũ tư vấn bán hàng lúc này.</p>
            </article>
        `;
    }
};

teamContainer?.addEventListener('click', (event) => {
    const slideButton = event.target.closest('[data-team-slide-direction]');
    const dotButton = event.target.closest('[data-team-slide-index]');
    const trigger = event.target.closest('[data-team-member-id]');

    if (slideButton) {
        scrollTeamCarousel(Number(slideButton.dataset.teamSlideDirection || 1));
        return;
    }

    if (dotButton) {
        goToTeamCarouselPage(Number(dotButton.dataset.teamSlideIndex || 0));
        return;
    }

    if (!trigger) {
        return;
    }

    const member = teamMembersState.find((item) =>
        String(item.id || '') === String(trigger.dataset.teamMemberId || '')
    );

    openTeamMemberModal(member);
});

window.addEventListener('resize', () => {
    renderTeamCarouselDots();
    updateTeamCarouselControls();
    renderPromotionCarouselDots();
    updatePromotionCarouselControls();
});

teamMemberCloseButtons.forEach((button) => {
    button.addEventListener('click', closeTeamMemberModal);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && teamMemberModal?.classList.contains('is-open')) {
        closeTeamMemberModal();
    }
});

const formatPromotionDate = (value, fallback = '') => {
    if (!value) {
        return fallback;
    }

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime()) ? fallback : promotionDateFormatter.format(date);
};

const getPromotionPeriod = (promotion) => {
    const startsAt = formatPromotionDate(promotion?.startsAt);
    const endsAt = formatPromotionDate(promotion?.endsAt);

    if (startsAt && endsAt) {
        return `${startsAt} - ${endsAt}`;
    }

    if (startsAt) {
        return `Từ ${startsAt}`;
    }

    if (endsAt) {
        return `Đến ${endsAt}`;
    }

    return 'Đang áp dụng';
};

const getPromotionPreview = (promotion) => {
    const content = String(promotion?.content || '').trim().replace(/\s+/g, ' ');

    if (!content) {
        return '';
    }

    return content.length > 150 ? `${content.slice(0, 150)}...` : content;
};

const updatePromotionCarouselControls = () => {
    if (!promotionCarousel) {
        return;
    }

    const viewport = promotionCarousel.querySelector('.promotion-carousel__viewport');
    const prevButton = promotionCarousel.querySelector('[data-promotion-slide-direction="-1"]');
    const nextButton = promotionCarousel.querySelector('[data-promotion-slide-direction="1"]');
    const dots = Array.from(promotionCarousel.querySelectorAll('[data-promotion-slide-index]'));

    if (!viewport || !prevButton || !nextButton) {
        return;
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    const canScroll = maxScrollLeft > 1;
    const activeIndex = Math.round(viewport.scrollLeft / Math.max(viewport.clientWidth, 1));

    prevButton.disabled = !canScroll || viewport.scrollLeft <= 1;
    nextButton.disabled = !canScroll || viewport.scrollLeft >= maxScrollLeft - 1;

    dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeIndex);
        dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
    });
};

const renderPromotionCarouselDots = () => {
    const viewport = promotionCarousel?.querySelector('.promotion-carousel__viewport');
    const dotsContainer = promotionCarousel?.querySelector('.promotion-carousel__dots');

    if (!viewport || !dotsContainer) {
        return;
    }

    const pageCount = Math.max(1, Math.ceil((viewport.scrollWidth - viewport.clientWidth) / Math.max(viewport.clientWidth, 1)) + 1);

    dotsContainer.innerHTML = pageCount > 1
        ? Array.from({ length: pageCount }, (_, index) => `
            <button type="button" class="promotion-carousel__dot${index === 0 ? ' is-active' : ''}" data-promotion-slide-index="${index}" aria-label="Xem trang khuyến mại ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"></button>
        `).join('')
        : '';
};

const scrollPromotionCarousel = (direction) => {
    const viewport = promotionCarousel?.querySelector('.promotion-carousel__viewport');

    if (!viewport) {
        return;
    }

    viewport.scrollBy({
        left: direction * viewport.clientWidth,
        behavior: 'smooth'
    });
};

const goToPromotionCarouselPage = (pageIndex) => {
    const viewport = promotionCarousel?.querySelector('.promotion-carousel__viewport');

    if (!viewport) {
        return;
    }

    viewport.scrollTo({
        left: pageIndex * viewport.clientWidth,
        behavior: 'smooth'
    });
};

const renderPromotions = (promotions = []) => {
    if (!promotionCarousel) {
        return;
    }

    const visiblePromotions = promotions.slice(0, homepagePromotionLimit);
    promotionsState = visiblePromotions;

    if (!visiblePromotions.length) {
        promotionCarousel.innerHTML = `
            <article class="promotion-empty">
                <i class="bx bxs-purchase-tag" aria-hidden="true"></i>
                <p>Hiện chưa có thông tin khuyến mại được hiển thị.</p>
            </article>
        `;
        renderPromotionNotifications();
        return;
    }

    const promotionCards = visiblePromotions.map((promotion) => {
        const imageUrl = String(promotion.imageUrl || '').trim();
        const preview = getPromotionPreview(promotion);
        const ctaUrl = promotion.ctaUrl || '#footer';
        const ctaText = promotion.ctaText || 'Xem ưu đãi';

        return `
            <article class="promotion-card" role="button" tabindex="0" data-promotion-card-id="${escapeHtml(String(promotion.id || ''))}" aria-label="Xem chi tiết ${escapeHtml(promotion.title || 'khuyến mại OkXe')}">
                <div class="promotion-card__media">
                    ${imageUrl
                        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(promotion.title || 'Khuyến mại OkXe')}">`
                        : '<i class="bx bxs-purchase-tag" aria-hidden="true"></i>'}
                </div>
                <div class="promotion-card__body">
                    <div class="promotion-card__meta">
                        <span>${escapeHtml(promotion.badgeText || 'Khuyến mại')}</span>
                        <small>${escapeHtml(getPromotionPeriod(promotion))}</small>
                    </div>
                    <h3>${escapeHtml(promotion.title || 'Ưu đãi OkXe')}</h3>
                    <p>${escapeHtml(promotion.summary || 'Liên hệ OkXe để nhận thông tin ưu đãi mới nhất.')}</p>
                    ${preview ? `<p class="promotion-card__detail">${escapeHtml(preview)}</p>` : ''}
                    <a class="promotion-card__button" href="${escapeHtml(ctaUrl)}">
                        <span>${escapeHtml(ctaText)}</span>
                        <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                    </a>
                </div>
            </article>
        `;
    }).join('');

    promotionCarousel.innerHTML = `
        <div class="promotion-carousel__shell" aria-label="Danh sách thông tin khuyến mại">
            <button type="button" class="promotion-carousel__button promotion-carousel__button--prev" data-promotion-slide-direction="-1" aria-label="Xem khuyến mại trước">
                <i class="bx bx-chevron-left" aria-hidden="true"></i>
            </button>
            <div class="promotion-carousel__viewport">
                ${promotionCards}
            </div>
            <button type="button" class="promotion-carousel__button promotion-carousel__button--next" data-promotion-slide-direction="1" aria-label="Xem khuyến mại tiếp theo">
                <i class="bx bx-chevron-right" aria-hidden="true"></i>
            </button>
            <div class="promotion-carousel__dots" aria-label="Chọn trang khuyến mại"></div>
        </div>
    `;

    const viewport = promotionCarousel.querySelector('.promotion-carousel__viewport');
    viewport?.addEventListener('scroll', updatePromotionCarouselControls, { passive: true });
    window.requestAnimationFrame(() => {
        renderPromotionCarouselDots();
        updatePromotionCarouselControls();
    });
    renderPromotionNotifications();
};

const syncPromotions = async () => {
    if (!promotionCarousel) {
        return;
    }

    try {
        const { response, data } = await requestJson('/api/promotions');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải thông tin khuyến mại.');
        }

        renderPromotions(data.promotions || []);
    } catch (error) {
        promotionCarousel.innerHTML = `
            <article class="promotion-empty">
                <i class="bx bx-error-circle" aria-hidden="true"></i>
                <p>Không thể tải thông tin khuyến mại lúc này.</p>
            </article>
        `;
    }
};

promotionCarousel?.addEventListener('click', (event) => {
    const slideButton = event.target.closest('[data-promotion-slide-direction]');
    const dotButton = event.target.closest('[data-promotion-slide-index]');
    const promotionCard = event.target.closest('[data-promotion-card-id]');

    if (slideButton) {
        scrollPromotionCarousel(Number(slideButton.dataset.promotionSlideDirection || 1));
        return;
    }

    if (dotButton) {
        goToPromotionCarouselPage(Number(dotButton.dataset.promotionSlideIndex || 0));
        return;
    }

    if (!promotionCard || event.target.closest('a, button')) {
        return;
    }

    const promotion = promotionsState.find((item) =>
        String(item.id || '') === String(promotionCard.dataset.promotionCardId || '')
    );

    openPromotionDetailModal(promotion);
});

promotionCarousel?.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) {
        return;
    }

    const promotionCard = event.target.closest('[data-promotion-card-id]');

    if (!promotionCard || event.target.closest('a, button')) {
        return;
    }

    event.preventDefault();
    const promotion = promotionsState.find((item) =>
        String(item.id || '') === String(promotionCard.dataset.promotionCardId || '')
    );

    openPromotionDetailModal(promotion);
});

const formatBlogDate = (value) => {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};

const renderHomeBlog = () => {
    if (!homeBlogCarousel) {
        return;
    }

    const posts = Array.isArray(window.OKXE_BLOG_POSTS)
        ? window.OKXE_BLOG_POSTS.slice(0, 6)
        : [];

    if (!posts.length) {
        homeBlogCarousel.innerHTML = '<p class="home-blog__empty">Chưa có bài viết nào được hiển thị.</p>';
        return;
    }

    const cards = posts.map((post) => `
        <article class="home-blog-card">
            <a href="/blog/${encodeURIComponent(post.slug)}" class="home-blog-card__media" aria-label="Đọc bài ${escapeHtml(post.title)}">
                <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}">
            </a>
            <div class="home-blog-card__body">
                <div class="home-blog-card__meta">
                    <span>${escapeHtml(post.category)}</span>
                    <small>${escapeHtml(formatBlogDate(post.publishedAt))}</small>
                </div>
                <h3><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h3>
                <p>${escapeHtml(post.excerpt)}</p>
                <a href="/blog/${encodeURIComponent(post.slug)}" class="home-blog-card__read">
                    <span>Đọc bài viết</span>
                    <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                </a>
            </div>
        </article>
    `).join('');

    homeBlogCarousel.innerHTML = `
        <div class="home-blog__shell">
            <button type="button" class="home-blog__button home-blog__button--prev" data-home-blog-direction="-1" aria-label="Xem bài viết trước">
                <i class="bx bx-chevron-left" aria-hidden="true"></i>
            </button>
            <div class="home-blog__viewport">${cards}</div>
            <button type="button" class="home-blog__button home-blog__button--next" data-home-blog-direction="1" aria-label="Xem bài viết tiếp theo">
                <i class="bx bx-chevron-right" aria-hidden="true"></i>
            </button>
        </div>
    `;

    const viewport = homeBlogCarousel.querySelector('.home-blog__viewport');
    const updateButtons = () => {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        const previous = homeBlogCarousel.querySelector('[data-home-blog-direction="-1"]');
        const next = homeBlogCarousel.querySelector('[data-home-blog-direction="1"]');
        previous.disabled = viewport.scrollLeft <= 1;
        next.disabled = viewport.scrollLeft >= maxScroll - 1 || maxScroll <= 1;
    };

    viewport.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    window.requestAnimationFrame(updateButtons);
};

homeBlogCarousel?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-home-blog-direction]');

    if (!button) {
        return;
    }

    const viewport = homeBlogCarousel.querySelector('.home-blog__viewport');
    viewport?.scrollBy({
        left: Number(button.dataset.homeBlogDirection || 1) * viewport.clientWidth,
        behavior: 'smooth'
    });
});

renderHomeBlog();

const syncCars = async () => {
    if (!rentalContainer) {
        return;
    }

    try {
        const { response, data } = await requestJson('/api/cars');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách xe.');
        }

        renderCars(data.cars || []);
    } catch (error) {
        renderCarsError(error.message || 'Không thể tải danh sách xe.');
    }
};

const accordionItems = document.querySelectorAll('.accordion-item');

const closeAccordionItem = (item) => {
    const content = item.querySelector('.accordion-content');
    const icon = item.querySelector('.accordion-icon');

    item.classList.remove('active');

    if (content) {
        content.style.maxHeight = '0px';
    }

    if (icon) {
        icon.classList.remove('bx-minus');
        icon.classList.add('bx-plus');
    }
};

const openAccordionItem = (item) => {
    const content = item.querySelector('.accordion-content');
    const icon = item.querySelector('.accordion-icon');

    item.classList.add('active');

    if (content) {
        content.style.maxHeight = `${content.scrollHeight}px`;
    }

    if (icon) {
        icon.classList.remove('bx-plus');
        icon.classList.add('bx-minus');
    }
};

accordionItems.forEach((item, index) => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    if (!header || !content) {
        return;
    }

    closeAccordionItem(item);

    if (index === 0) {
        openAccordionItem(item);
    }

    header.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        accordionItems.forEach((otherItem) => closeAccordionItem(otherItem));

        if (!isOpen) {
            openAccordionItem(item);
        }
    });
});

window.addEventListener('resize', () => {
    updateRentalSliderControls();

    if (window.innerWidth > 640) {
        closeMobileMenu();
    }

    const activeItem = document.querySelector('.accordion-item.active');

    if (activeItem) {
        const activeContent = activeItem.querySelector('.accordion-content');

        if (activeContent) {
            activeContent.style.maxHeight = `${activeContent.scrollHeight}px`;
        }
    }
});

const loginButton = document.querySelector('#open-login-modal') || document.querySelector('.login-btn');
const loginModal = document.querySelector('#login-modal');
const loginCloseButtons = document.querySelectorAll('[data-close-login]');
const loginForm = document.querySelector('.login-form');
const loginFeedback = document.querySelector('#login-feedback');

const signupButton = document.querySelector('#open-signup-modal') || document.querySelector('.sign-up-btn');
const signupModal = document.querySelector('#signup-modal');
const signupCloseButtons = document.querySelectorAll('[data-close-signup]');
const signupPasswordToggles = document.querySelectorAll('[data-toggle-password]');
const signupForm = document.querySelector('.signup-form');
const signupFeedback = document.querySelector('#signup-feedback');

const forgotPasswordLink = document.querySelector('#open-forgot-password-modal');
const forgotPasswordModal = document.querySelector('#forgot-password-modal');
const forgotPasswordCloseButtons = document.querySelectorAll('[data-close-forgot-password]');
const forgotPasswordForm = document.querySelector('.forgot-password-form');
const forgotPasswordFeedback = document.querySelector('#forgot-password-feedback');
const openResetPasswordButton = document.querySelector('#open-reset-password-modal');

const resetPasswordModal = document.querySelector('#reset-password-modal');
const resetPasswordCloseButtons = document.querySelectorAll('[data-close-reset-password]');
const resetPasswordForm = document.querySelector('.reset-password-form');
const resetPasswordFeedback = document.querySelector('#reset-password-feedback');
const resetPasswordSubtitle = document.querySelector('#reset-password-subtitle');
const resetPasswordToggles = document.querySelectorAll('[data-toggle-reset-password]');

const authState = document.querySelector('#auth-state');
const authUserName = document.querySelector('#auth-user-name');
const logoutButton = document.querySelector('#logout-button');
const accountMenu = document.querySelector('#account-menu');
const accountMenuTrigger = document.querySelector('#account-menu-trigger');
const accountMenuItems = document.querySelectorAll('.account-menu__item');
const accountMenuAvatar = document.querySelector('#account-menu-avatar');
const accountMenuName = document.querySelector('#account-menu-name');
const accountMenuEmail = document.querySelector('#account-menu-email');
const accountMenuPhone = document.querySelector('#account-menu-phone');
const profileOpenButtons = document.querySelectorAll('[data-open-profile]');
const favoriteOpenButtons = document.querySelectorAll('[data-open-favorites]');
const notificationOpenButtons = document.querySelectorAll('[data-open-notifications]');
const profileModal = document.querySelector('#profile-modal');
const profileCloseButtons = document.querySelectorAll('[data-close-profile]');
const profileForm = document.querySelector('.profile-form');
const profileFeedback = document.querySelector('#profile-feedback');
const profileEditToggle = document.querySelector('#profile-edit-toggle');
const profileEditPanel = document.querySelector('#profile-edit-panel');
const profileAvatarInput = document.querySelector('#profile-avatar-input');
const profileAvatarPreview = document.querySelector('#profile-avatar-preview');
const profileOverviewAvatar = document.querySelector('#profile-overview-avatar');
const profileOverviewName = document.querySelector('#profile-overview-name');
const profileOverviewEmail = document.querySelector('#profile-overview-email');
const profileOverviewPhone = document.querySelector('#profile-overview-phone');
const profileOverviewCitizen = document.querySelector('#profile-overview-citizen');
const profileOverviewBirthDate = document.querySelector('#profile-overview-birth-date');
const profileOverviewGender = document.querySelector('#profile-overview-gender');
const profileOverviewAddress = document.querySelector('#profile-overview-address');
const chooseAvatarButton = document.querySelector('#choose-avatar-button');
const switchToSignupLink = document.querySelector('#switch-to-signup');
const switchToLoginLink = document.querySelector('#switch-to-login');
const maxProfileAvatarSize = 5 * 1024 * 1024;

let currentUser = null;
let selectedProfileAvatarFile = null;
let selectedProfileAvatarDataUrl = '';

const setFormFeedback = (element, message, type = 'error') => {
    if (!element) {
        return;
    }

    element.textContent = message || '';
    element.className = 'form-feedback';

    if (message) {
        element.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setBodyModalClass = (className, isOpen) => {
    document.body.classList.toggle(className, isOpen);
};

const setResetPasswordEmail = (email) => {
    if (!resetPasswordForm) {
        return;
    }

    const emailInput = resetPasswordForm.querySelector('input[name="email"]');

    if (emailInput) {
        emailInput.value = email || '';
    }
};

const closeLoginModal = () => {
    if (!loginModal) {
        return;
    }

    loginModal.classList.remove('is-open');
    loginModal.setAttribute('aria-hidden', 'true');
    setBodyModalClass('login-modal-open', false);
    setFormFeedback(loginFeedback, '');
};

const openLoginModal = () => {
    if (!loginModal) {
        return;
    }

    loginModal.classList.add('is-open');
    loginModal.setAttribute('aria-hidden', 'false');
    setBodyModalClass('login-modal-open', true);
    const firstInput = loginModal.querySelector('input');

    if (firstInput) {
        firstInput.focus();
    }
};

const closeSignupModal = () => {
    if (!signupModal) {
        return;
    }

    signupModal.classList.remove('is-open');
    signupModal.setAttribute('aria-hidden', 'true');
    setBodyModalClass('signup-modal-open', false);
    setFormFeedback(signupFeedback, '');
};

const openSignupModal = () => {
    if (!signupModal) {
        return;
    }

    signupModal.classList.add('is-open');
    signupModal.setAttribute('aria-hidden', 'false');
    setBodyModalClass('signup-modal-open', true);
    const firstInput = signupModal.querySelector('input');

    if (firstInput) {
        firstInput.focus();
    }
};

const closeForgotPasswordModal = () => {
    if (!forgotPasswordModal) {
        return;
    }

    forgotPasswordModal.classList.remove('is-open');
    forgotPasswordModal.setAttribute('aria-hidden', 'true');
    setBodyModalClass('forgot-password-modal-open', false);
    setFormFeedback(forgotPasswordFeedback, '');
};

const openForgotPasswordModal = () => {
    if (!forgotPasswordModal) {
        return;
    }

    forgotPasswordModal.classList.add('is-open');
    forgotPasswordModal.setAttribute('aria-hidden', 'false');
    setBodyModalClass('forgot-password-modal-open', true);
    const firstInput = forgotPasswordModal.querySelector('input');

    if (firstInput) {
        firstInput.focus();
    }
};

const closeResetPasswordModal = () => {
    if (!resetPasswordModal) {
        return;
    }

    resetPasswordModal.classList.remove('is-open');
    resetPasswordModal.setAttribute('aria-hidden', 'true');
    setBodyModalClass('reset-password-modal-open', false);
    setFormFeedback(resetPasswordFeedback, '');
};

const openResetPasswordModal = () => {
    if (!resetPasswordModal) {
        return;
    }

    resetPasswordModal.classList.add('is-open');
    resetPasswordModal.setAttribute('aria-hidden', 'false');
    setBodyModalClass('reset-password-modal-open', true);
    const firstInput = resetPasswordModal.querySelector('input');

    if (firstInput) {
        firstInput.focus();
    }
};

const setProfileAvatarPreview = (imageUrl = '') => {
    if (!profileAvatarPreview) {
        return;
    }

    profileAvatarPreview.innerHTML = imageUrl
        ? `<img src="${imageUrl}" alt="Ảnh đại diện">`
        : '<i class="bx bx-user"></i>';
};

const profileGenderLabels = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác'
};

const profileDateFormatter = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

const getProfileDisplayValue = (value, fallback = 'Chưa cập nhật') => {
    const normalizedValue = String(value || '').trim();

    return normalizedValue || fallback;
};

const formatProfileDate = (value) => {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        return 'Chưa cập nhật';
    }

    const date = new Date(`${normalizedValue}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? normalizedValue
        : profileDateFormatter.format(date);
};

const getProfileAddress = (user = {}) => {
    const address = user.address || {};
    const parts = [
        address.detail,
        address.ward,
        address.district,
        address.province
    ].map((part) => String(part || '').trim()).filter(Boolean);

    return parts.length ? parts.join(', ') : 'Chưa cập nhật';
};

const setProfileAvatarElement = (element, imageUrl = '') => {
    if (!element) {
        return;
    }

    element.innerHTML = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="Ảnh đại diện khách hàng">`
        : '<i class="bx bx-user" aria-hidden="true"></i>';
};

const renderCustomerProfileSummary = (user) => {
    const fullName = getProfileDisplayValue(user?.fullName, 'Khách hàng OkXe');
    const email = getProfileDisplayValue(user?.email, 'Chưa có email');
    const phone = getProfileDisplayValue(user?.phone, 'Chưa cập nhật số điện thoại');
    const citizenId = getProfileDisplayValue(user?.citizenId);
    const normalizedGender = String(user?.gender || '').trim().toLowerCase();
    const gender = profileGenderLabels[normalizedGender] || getProfileDisplayValue(user?.gender);
    const address = getProfileAddress(user || {});
    const avatarUrl = user?.avatarUrl || '';

    setProfileAvatarElement(accountMenuAvatar, avatarUrl);
    setProfileAvatarElement(profileOverviewAvatar, avatarUrl);

    if (accountMenuName) {
        accountMenuName.textContent = fullName;
    }

    if (accountMenuEmail) {
        accountMenuEmail.textContent = email;
    }

    if (accountMenuPhone) {
        accountMenuPhone.textContent = phone;
    }

    if (profileOverviewName) {
        profileOverviewName.textContent = fullName;
    }

    if (profileOverviewEmail) {
        profileOverviewEmail.textContent = email;
    }

    if (profileOverviewPhone) {
        profileOverviewPhone.textContent = phone;
    }

    if (profileOverviewCitizen) {
        profileOverviewCitizen.textContent = citizenId;
    }

    if (profileOverviewBirthDate) {
        profileOverviewBirthDate.textContent = formatProfileDate(user?.birthDate);
    }

    if (profileOverviewGender) {
        profileOverviewGender.textContent = gender;
    }

    if (profileOverviewAddress) {
        profileOverviewAddress.textContent = address;
    }
};

const fillProfileForm = (user) => {
    if (!profileForm || !user) {
        return;
    }

    const address = user.address || {};

    renderCustomerProfileSummary(user);

    profileForm.elements.fullName.value = user.fullName || '';
    profileForm.elements.phone.value = user.phone || '';
    profileForm.elements.citizenId.value = user.citizenId || '';
    profileForm.elements.email.value = user.email || '';
    profileForm.elements.birthDate.value = user.birthDate || '';
    profileForm.elements.gender.value = user.gender || '';
    profileForm.elements.addressProvince.value = address.province || '';
    profileForm.elements.addressDistrict.value = address.district || '';
    profileForm.elements.addressWard.value = address.ward || '';
    profileForm.elements.addressDetail.value = address.detail || '';
    selectedProfileAvatarFile = null;
    selectedProfileAvatarDataUrl = '';
    if (profileAvatarInput) {
        profileAvatarInput.value = '';
    }
    setProfileAvatarPreview(user.avatarUrl || '');
};

const setProfileEditPanelOpen = (isOpen, shouldFocus = false) => {
    if (!profileEditToggle || !profileEditPanel) {
        return;
    }

    profileEditPanel.hidden = !isOpen;
    profileEditToggle.setAttribute('aria-expanded', String(isOpen));
    profileEditToggle.innerHTML = isOpen
        ? '<i class="bx bx-chevron-up" aria-hidden="true"></i><span>Ẩn phần chỉnh sửa</span>'
        : '<i class="bx bx-edit-alt" aria-hidden="true"></i><span>Thay đổi thông tin</span>';

    if (isOpen && shouldFocus) {
        const firstInput = profileEditPanel.querySelector('input:not([readonly]):not([type="hidden"]), select');

        if (firstInput) {
            firstInput.focus();
        }
    }
};

const closeProfileModal = () => {
    if (!profileModal) {
        return;
    }

    profileModal.classList.remove('is-open');
    profileModal.setAttribute('aria-hidden', 'true');
    setBodyModalClass('profile-modal-open', false);
    setProfileEditPanelOpen(false);
    setFormFeedback(profileFeedback, '');
};

const openProfileModal = () => {
    if (!profileModal) {
        return;
    }

    if (!currentUser) {
        openLoginModal();
        return;
    }

    fillProfileForm(currentUser);
    setProfileEditPanelOpen(false);
    profileModal.classList.add('is-open');
    profileModal.setAttribute('aria-hidden', 'false');
    setBodyModalClass('profile-modal-open', true);

    if (profileEditToggle) {
        profileEditToggle.focus();
    }
};

const setButtonLoading = (button, isLoading, defaultText) => {
    if (!button) {
        return;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? 'Đang xử lý...' : defaultText;
};

const setAccountMenuOpen = (isOpen) => {
    if (!accountMenu || !accountMenuTrigger) {
        return;
    }

    accountMenu.classList.toggle('is-open', isOpen);
    accountMenuTrigger.setAttribute('aria-expanded', String(isOpen));
};

const closeAccountMenu = () => {
    setAccountMenuOpen(false);
};

const updateAuthUi = (user) => {
    const isLoggedIn = Boolean(user);
    currentUser = user || null;

    if (authState) {
        authState.hidden = !isLoggedIn;
    }

    if (authUserName) {
        authUserName.textContent = user?.fullName || 'bạn';
    }

    renderCustomerProfileSummary(user);

    if (loginButton) {
        loginButton.classList.toggle('is-hidden', isLoggedIn);
    }

    if (signupButton) {
        signupButton.classList.toggle('is-hidden', isLoggedIn);
    }

    if (!isLoggedIn) {
        closeAccountMenu();
    }
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error(`Không thể đọc file ${file.name}.`)));
    reader.readAsDataURL(file);
});

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
            'Không thể kết nối tới server. Hãy mở trang qua http://localhost:3000 hoặc chạy backend trước.'
        );
    }

    const data = await response.json().catch(() => ({}));

    return { response, data };
};

const syncFavoriteCars = async () => {
    if (!currentUser) {
        setFavoriteCars([]);
        refreshFavoriteUi();
        return;
    }

    try {
        const { response, data } = await requestJson('/api/favorites');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải xe yêu thích.');
        }

        setFavoriteCars(data.cars || []);
    } catch (error) {
        setFavoriteCars([]);
    }

    refreshFavoriteUi();
};

const syncTestDriveAppointments = async () => {
    if (!currentUser) {
        testDriveAppointmentsState = [];
        renderPromotionNotifications();
        return;
    }

    try {
        const { response, data } = await requestJson('/api/test-drive/appointments');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải lịch lái thử.');
        }

        testDriveAppointmentsState = Array.isArray(data.appointments) ? data.appointments : [];
    } catch (error) {
        testDriveAppointmentsState = [];
    }

    renderPromotionNotifications();
};

const syncCarBuyRequests = async () => {
    if (!currentUser) {
        carBuyRequestsState = [];
        renderPromotionNotifications();
        return;
    }

    try {
        const { response, data } = await requestJson('/api/car-buy-requests/my');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải tin mua xe của bạn.');
        }

        carBuyRequestsState = Array.isArray(data.requests) ? data.requests : [];
    } catch (error) {
        carBuyRequestsState = [];
    }

    renderPromotionNotifications();
};

const syncUserNotifications = async () => {
    if (!currentUser) {
        userNotificationsState = [];
        renderPromotionNotifications();
        return;
    }

    try {
        const { response, data } = await requestJson('/api/notifications/my');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải thông báo của bạn.');
        }

        userNotificationsState = Array.isArray(data.notifications) ? data.notifications : [];
    } catch (error) {
        userNotificationsState = [];
    }

    renderPromotionNotifications();
};

const syncCurrentUser = async () => {
    try {
        const { response, data } = await requestJson('/api/auth/me');

        if (!response.ok || !data.user) {
            updateAuthUi(null);
            await syncFavoriteCars();
            await syncTestDriveAppointments();
            await syncCarBuyRequests();
            await syncUserNotifications();
            return;
        }

        updateAuthUi(data.user);
        await syncFavoriteCars();
        await syncTestDriveAppointments();
        await syncCarBuyRequests();
        await syncUserNotifications();
    } catch (error) {
        updateAuthUi(null);
        await syncFavoriteCars();
        await syncTestDriveAppointments();
        await syncCarBuyRequests();
        await syncUserNotifications();
    }
};

const handleEscapeKey = (event) => {
    if (event.key !== 'Escape') {
        return;
    }

    if (accountMenu?.classList.contains('is-open')) {
        closeAccountMenu();
    } else if (allCarsModal?.classList.contains('is-open')) {
        closeAllCarsModal();
    } else if (searchResultsModal?.classList.contains('is-open')) {
        closeSearchResultsModal();
    } else if (favoriteCarsModal?.classList.contains('is-open')) {
        closeFavoriteCarsModal();
    } else if (promotionDetailModal?.classList.contains('is-open')) {
        closePromotionDetailModal();
    } else if (notificationsModal?.classList.contains('is-open')) {
        closeNotificationsModal();
    } else if (profileModal?.classList.contains('is-open')) {
        closeProfileModal();
    } else if (resetPasswordModal?.classList.contains('is-open')) {
        closeResetPasswordModal();
    } else if (forgotPasswordModal?.classList.contains('is-open')) {
        closeForgotPasswordModal();
    } else if (signupModal?.classList.contains('is-open')) {
        closeSignupModal();
    } else if (loginModal?.classList.contains('is-open')) {
        closeLoginModal();
    }
};

document.addEventListener('keydown', handleEscapeKey);

if (accountMenu && accountMenuTrigger) {
    accountMenu.addEventListener('mouseenter', () => {
        setAccountMenuOpen(true);
    });

    accountMenu.addEventListener('mouseleave', closeAccountMenu);

    accountMenuTrigger.addEventListener('click', () => {
        if (window.matchMedia?.('(hover: hover)').matches) {
            setAccountMenuOpen(true);
            return;
        }

        setAccountMenuOpen(!accountMenu.classList.contains('is-open'));
    });

    accountMenuItems.forEach((item) => {
        item.addEventListener('click', closeAccountMenu);
    });

    document.addEventListener('click', (event) => {
        if (!accountMenu.contains(event.target)) {
            closeAccountMenu();
        }
    });
}

if (loginButton && loginModal) {
    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        openLoginModal();
    });

    loginCloseButtons.forEach((button) => {
        button.addEventListener('click', closeLoginModal);
    });

    loginModal.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            closeLoginModal();
        }
    });
}

if (signupButton && signupModal) {
    signupButton.addEventListener('click', (event) => {
        event.preventDefault();
        openSignupModal();
    });

    signupCloseButtons.forEach((button) => {
        button.addEventListener('click', closeSignupModal);
    });

    signupModal.addEventListener('click', (event) => {
        if (event.target === signupModal) {
            closeSignupModal();
        }
    });
}

profileOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        closeAccountMenu();
        openProfileModal();
    });
});

favoriteOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        closeAccountMenu();
        openFavoriteCarsModal();
    });
});

notificationOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        closeAccountMenu();
        openNotificationsModal();
    });
});

testDriveButton?.addEventListener('click', (event) => {
    if (currentUser) {
        return;
    }

    event.preventDefault();
    setFormFeedback(loginFeedback, 'Vui lòng đăng nhập để đăng ký lái thử.');
    openLoginModal();
});

if (profileModal) {
    profileCloseButtons.forEach((button) => {
        button.addEventListener('click', closeProfileModal);
    });

    profileModal.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            closeProfileModal();
        }
    });
}

profileEditToggle?.addEventListener('click', () => {
    const isOpen = profileEditToggle.getAttribute('aria-expanded') === 'true';

    setProfileEditPanelOpen(!isOpen, true);
});

if (notificationsModal) {
    notificationsModal.addEventListener('click', (event) => {
        if (event.target.closest('[data-close-notifications-link]')) {
            closeNotificationsModal();
            return;
        }

        const deleteAppointmentButton = event.target.closest('[data-delete-test-drive-appointment]');

        if (deleteAppointmentButton) {
            event.preventDefault();
            event.stopPropagation();
            deleteTestDriveAppointment(deleteAppointmentButton.dataset.deleteTestDriveAppointment);
            return;
        }

        const deleteButton = event.target.closest('[data-delete-notification]');

        if (deleteButton) {
            event.preventDefault();
            event.stopPropagation();
            deleteNotification(deleteButton.dataset.deleteNotification);
            return;
        }

        const notificationItem = event.target.closest('[data-promotion-notification-id]');

        if (notificationItem) {
            const promotion = promotionsState.find((item) =>
                String(item.id || '') === String(notificationItem.dataset.promotionNotificationId || '')
            );

            openPromotionDetailModal(promotion);
            return;
        }

        if (event.target === notificationsModal) {
            closeNotificationsModal();
        }
    });

    notificationsModal.addEventListener('keydown', (event) => {
        if (!['Enter', ' '].includes(event.key)) {
            return;
        }

        const notificationItem = event.target.closest('[data-promotion-notification-id]');

        if (!notificationItem || event.target.closest('a, button')) {
            return;
        }

        event.preventDefault();
        const promotion = promotionsState.find((item) =>
            String(item.id || '') === String(notificationItem.dataset.promotionNotificationId || '')
        );

        openPromotionDetailModal(promotion);
    });
}

promotionDetailCloseButtons.forEach((button) => {
    button.addEventListener('click', closePromotionDetailModal);
});

promotionDetailModal?.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-promotion-detail-link]')) {
        closePromotionDetailModal();
        return;
    }

    if (event.target === promotionDetailModal) {
        closePromotionDetailModal();
    }
});

chooseAvatarButton?.addEventListener('click', () => {
    profileAvatarInput?.click();
});

profileAvatarInput?.addEventListener('change', async () => {
    const file = profileAvatarInput.files?.[0];

    setFormFeedback(profileFeedback, '');

    if (!file) {
        selectedProfileAvatarFile = null;
        selectedProfileAvatarDataUrl = '';
        setProfileAvatarPreview(currentUser?.avatarUrl || '');
        return;
    }

    if (!file.type.startsWith('image/')) {
        profileAvatarInput.value = '';
        setFormFeedback(profileFeedback, 'Chỉ được chọn file ảnh.');
        return;
    }

    if (file.size > maxProfileAvatarSize) {
        profileAvatarInput.value = '';
        setFormFeedback(profileFeedback, 'Ảnh đại diện tối đa 5MB.');
        return;
    }

    try {
        selectedProfileAvatarFile = file;
        selectedProfileAvatarDataUrl = await readFileAsDataUrl(file);
        setProfileAvatarPreview(selectedProfileAvatarDataUrl);
    } catch (error) {
        selectedProfileAvatarFile = null;
        selectedProfileAvatarDataUrl = '';
        setFormFeedback(profileFeedback, error.message || 'Không thể đọc ảnh đại diện.');
    }
});

if (forgotPasswordLink && forgotPasswordModal) {
    forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault();
        closeLoginModal();
        openForgotPasswordModal();
    });

    forgotPasswordCloseButtons.forEach((button) => {
        button.addEventListener('click', closeForgotPasswordModal);
    });

    forgotPasswordModal.addEventListener('click', (event) => {
        if (event.target === forgotPasswordModal) {
            closeForgotPasswordModal();
        }
    });
}

if (openResetPasswordButton) {
    openResetPasswordButton.addEventListener('click', () => {
        const emailInput = forgotPasswordForm?.querySelector('input[name="email"]');

        setResetPasswordEmail(emailInput?.value || '');
        closeForgotPasswordModal();
        openResetPasswordModal();
    });
}

if (resetPasswordModal) {
    resetPasswordCloseButtons.forEach((button) => {
        button.addEventListener('click', closeResetPasswordModal);
    });

    resetPasswordModal.addEventListener('click', (event) => {
        if (event.target === resetPasswordModal) {
            closeResetPasswordModal();
        }
    });
}

signupPasswordToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
        const input = toggle.parentElement.querySelector('input');
        const icon = toggle.querySelector('i');

        if (!input || !icon) {
            return;
        }

        const isPassword = input.type === 'password';

        input.type = isPassword ? 'text' : 'password';
        icon.className = isPassword ? 'bx bx-show' : 'bx bx-hide';
    });
});

resetPasswordToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
        const input = toggle.parentElement.querySelector('input');
        const icon = toggle.querySelector('i');

        if (!input || !icon) {
            return;
        }

        const isPassword = input.type === 'password';

        input.type = isPassword ? 'text' : 'password';
        icon.className = isPassword ? 'bx bx-show' : 'bx bx-hide';
    });
});

if (switchToSignupLink) {
    switchToSignupLink.addEventListener('click', (event) => {
        event.preventDefault();
        closeLoginModal();
        openSignupModal();
    });
}

if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', (event) => {
        event.preventDefault();
        closeSignupModal();
        openLoginModal();
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFormFeedback(loginFeedback, '');

        const formData = new FormData(loginForm);
        const submitButton = loginForm.querySelector('.login-form__submit');

        setButtonLoading(submitButton, true, 'Đăng nhập');

        try {
            const { response, data } = await requestJson('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    remember: formData.get('remember') === 'on'
                })
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể đăng nhập lúc này.');
            }

            updateAuthUi(data.user);
            await syncFavoriteCars();
            await syncTestDriveAppointments();
            setFormFeedback(loginFeedback, data.message || 'Đăng nhập thành công.', 'success');
            loginForm.reset();

            window.setTimeout(() => {
                closeLoginModal();
            }, 900);
        } catch (error) {
            setFormFeedback(loginFeedback, error.message || 'Không thể đăng nhập lúc này.');
        } finally {
            setButtonLoading(submitButton, false, 'Đăng nhập');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFormFeedback(signupFeedback, '');

        const formData = new FormData(signupForm);
        const password = String(formData.get('password') || '');
        const confirmPassword = String(formData.get('confirmPassword') || '');
        const submitButton = signupForm.querySelector('.signup-form__submit');

        if (password !== confirmPassword) {
            setFormFeedback(signupFeedback, 'Mật khẩu xác nhận không khớp.');
            return;
        }

        setButtonLoading(submitButton, true, 'Tạo tài khoản');

        try {
            const { response, data } = await requestJson('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    fullName: formData.get('fullName'),
                    email: formData.get('email'),
                    password
                })
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tạo tài khoản lúc này.');
            }

            updateAuthUi(data.user);
            await syncFavoriteCars();
            await syncTestDriveAppointments();
            setFormFeedback(signupFeedback, data.message || 'Tạo tài khoản thành công.', 'success');
            signupForm.reset();

            window.setTimeout(() => {
                closeSignupModal();
            }, 900);
        } catch (error) {
            setFormFeedback(signupFeedback, error.message || 'Không thể tạo tài khoản lúc này.');
        } finally {
            setButtonLoading(submitButton, false, 'Tạo tài khoản');
        }
    });
}

if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFormFeedback(profileFeedback, '');

        const formData = new FormData(profileForm);
        const submitButton = profileForm.querySelector('.profile-form__submit');
        const payload = {
            phone: formData.get('phone'),
            citizenId: formData.get('citizenId'),
            birthDate: formData.get('birthDate'),
            gender: formData.get('gender'),
            addressProvince: formData.get('addressProvince'),
            addressDistrict: formData.get('addressDistrict'),
            addressWard: formData.get('addressWard'),
            addressDetail: formData.get('addressDetail')
        };

        if (selectedProfileAvatarFile && selectedProfileAvatarDataUrl) {
            payload.avatarFile = {
                name: selectedProfileAvatarFile.name,
                type: selectedProfileAvatarFile.type,
                dataUrl: selectedProfileAvatarDataUrl
            };
        }

        setButtonLoading(submitButton, true, 'Cập nhật thông tin');

        try {
            const { response, data } = await requestJson('/api/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể cập nhật thông tin lúc này.');
            }

            updateAuthUi(data.user);
            setFormFeedback(profileFeedback, data.message || 'Cập nhật thông tin thành công.', 'success');

            window.setTimeout(() => {
                closeProfileModal();
            }, 900);
        } catch (error) {
            setFormFeedback(profileFeedback, error.message || 'Không thể cập nhật thông tin lúc này.');
        } finally {
            setButtonLoading(submitButton, false, 'Cập nhật thông tin');
        }
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFormFeedback(forgotPasswordFeedback, '');

        const formData = new FormData(forgotPasswordForm);
        const email = String(formData.get('email') || '').trim();
        const submitButton = forgotPasswordForm.querySelector('.forgot-password-form__submit');

        setButtonLoading(submitButton, true, 'Gửi mã OTP');

        try {
            const { response, data } = await requestJson('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể gửi mã OTP lúc này.');
            }

            const hasPreviewFile = Boolean(data.previewFile);
            let successMessage = data.message || 'Mã OTP đã được gửi.';

            if (hasPreviewFile) {
                successMessage += ` Mở file này để lấy mã OTP: ${data.previewFile}`;
            }

            setFormFeedback(forgotPasswordFeedback, successMessage, 'success');
            setResetPasswordEmail(data.email || email);

            window.setTimeout(() => {
                closeForgotPasswordModal();
                if (resetPasswordSubtitle) {
                    resetPasswordSubtitle.textContent = hasPreviewFile
                        ? 'Mở file preview email để lấy mã OTP 6 số, rồi nhập mã và mật khẩu mới để hoàn tất khôi phục tài khoản.'
                        : 'Nhập email, mã OTP 6 số vừa nhận được và mật khẩu mới để hoàn tất khôi phục tài khoản.';
                }
                openResetPasswordModal();
            }, hasPreviewFile ? 2200 : 900);
        } catch (error) {
            setFormFeedback(forgotPasswordFeedback, error.message || 'Không thể gửi mã OTP lúc này.');
        } finally {
            setButtonLoading(submitButton, false, 'Gửi mã OTP');
        }
    });
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFormFeedback(resetPasswordFeedback, '');

        const formData = new FormData(resetPasswordForm);
        const email = String(formData.get('email') || '').trim();
        const otp = String(formData.get('otp') || '').trim();
        const password = String(formData.get('password') || '');
        const confirmPassword = String(formData.get('confirmPassword') || '');
        const submitButton = resetPasswordForm.querySelector('.reset-password-form__submit');

        if (password !== confirmPassword) {
            setFormFeedback(resetPasswordFeedback, 'Mật khẩu xác nhận không khớp.');
            return;
        }

        setButtonLoading(submitButton, true, 'Cập nhật mật khẩu');

        try {
            const { response, data } = await requestJson('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    otp,
                    password
                })
            });

            if (!response.ok) {
                throw new Error(data.message || 'Không thể đặt lại mật khẩu lúc này.');
            }

            setFormFeedback(resetPasswordFeedback, data.message || 'Đặt lại mật khẩu thành công.', 'success');
            resetPasswordForm.reset();

            window.setTimeout(() => {
                closeResetPasswordModal();
                openLoginModal();
            }, 1000);
        } catch (error) {
            setFormFeedback(resetPasswordFeedback, error.message || 'Không thể đặt lại mật khẩu lúc này.');
        } finally {
            setButtonLoading(submitButton, false, 'Cập nhật mật khẩu');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        setButtonLoading(logoutButton, true, 'Đăng xuất');

        try {
            await requestJson('/api/auth/logout', { method: 'POST' });
        } finally {
            updateAuthUi(null);
            await syncFavoriteCars();
            await syncTestDriveAppointments();
            setButtonLoading(logoutButton, false, 'Đăng xuất');
        }
    });
}

loadDismissedNotificationIds();
syncCars();
syncTeamMembers();
syncPromotions();

const openRequestedHomePanel = () => {
    const url = new URL(window.location.href);
    const authAction = url.searchParams.get('auth');
    const accountAction = url.searchParams.get('account');

    if (authAction === 'login') {
        openLoginModal();
    } else if (authAction === 'signup') {
        openSignupModal();
    } else if (accountAction === 'profile') {
        openProfileModal();
    } else if (accountAction === 'favorites') {
        openFavoriteCarsModal();
    } else if (accountAction === 'notifications') {
        openNotificationsModal();
    } else {
        return;
    }

    url.searchParams.delete('auth');
    url.searchParams.delete('account');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};

syncCurrentUser().then(openRequestedHomePanel);
