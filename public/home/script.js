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

const escapeSelectorValue = (value) =>
    globalThis.CSS?.escape
        ? globalThis.CSS.escape(String(value ?? ''))
        : String(value ?? '').replace(/["\\]/g, '\\$&');

const getSafeAuthReturnTo = () => {
    const returnTo = new URL(window.location.href).searchParams.get('returnTo');

    if (!returnTo) {
        return '';
    }

    try {
        const nextUrl = new URL(returnTo, window.location.origin);

        return nextUrl.origin === window.location.origin
            ? `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
            : '';
    } catch (error) {
        return '';
    }
};

const redirectToAuthReturnTarget = () => {
    const returnTo = getSafeAuthReturnTo();

    if (!returnTo) {
        return false;
    }

    window.location.assign(returnTo);
    return true;
};

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
let homeBlogPostsState = [];
let testDriveAppointmentsState = [];
let carBuyRequestsState = [];
let carSellRequestsState = [];
let userNotificationsState = [];
let depositOrdersState = [];
let homeBlogResizeControlsBound = false;
let teamMemberCloseTimer = 0;
let carBuyRequestBudgetLabelsState = {};
let activeProfileListingsTab = 'sell';
let activeProfileListingsFilter = 'all';
let activeProfileDepositsFilter = 'all';
let activeProfileDepositDetailId = null;
const promotionDateFormatter = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

const isFavoriteCar = (carId) => favoriteCarIds.has(String(carId));
const getCarDetailUrl = (carId) => `/cars/${encodeURIComponent(carId)}`;
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

    document.querySelectorAll(`[data-favorite-car="${escapeSelectorValue(normalizedCarId)}"]`).forEach((button) => {
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

const notificationTypeConfig = {
    promotion: {
        meta: 'Khuyến mại mới',
        icon: 'bxs-purchase-tag',
        footer: 'Ưu đãi đang hiển thị tại OkXe.',
        actionText: 'Xem ưu đãi',
        actionUrl: '/khuyen-mai'
    },
    'test-drive': {
        meta: 'Lái thử',
        icon: 'bxs-calendar-check',
        footer: 'OkXe sẽ tiếp tục cập nhật khi lịch hẹn thay đổi.',
        actionText: 'Xem lịch',
        actionUrl: '/dang-ky-lai-thu'
    },
    'deposit-order': {
        meta: 'Đặt cọc xe',
        icon: 'bxs-credit-card',
        footer: 'OkXe sẽ tiếp tục cập nhật khi đơn đặt cọc thay đổi.',
        actionText: 'Xem đơn đặt cọc',
        actionUrl: '/?account=deposits'
    },
    'car-buy-request': {
        meta: 'Tin mua xe',
        icon: 'bx-message-square-edit',
        footer: 'Bạn có thể theo dõi tin mua xe trong mục quản lý tin đăng.',
        actionText: 'Xem tin mua xe',
        actionUrl: '/tin-mua-o-to'
    },
    'car-buy-request-offer': {
        meta: 'Xe phù hợp',
        icon: 'bxs-car',
        footer: 'OkXe không tiết lộ thông tin người đề xuất trước khi kiểm tra và kết nối.',
        actionText: 'Xem tin mua xe',
        actionUrl: '/tin-mua-o-to'
    },
    'car-sell-request': {
        meta: 'Đăng bán xe',
        icon: 'bx-message-square-edit',
        footer: 'OkXe sẽ tiếp tục cập nhật khi có thay đổi.',
        actionText: 'Xem biểu mẫu',
        actionUrl: '/dang-tin-ban-xe'
    },
    default: {
        meta: 'Thông báo',
        icon: 'bxs-bell',
        footer: 'OkXe sẽ tiếp tục cập nhật khi có thay đổi.',
        actionText: 'Xem chi tiết',
        actionUrl: '/'
    }
};

const notificationStatusConfig = {
    approved: { icon: 'bxs-check-circle' },
    matched: { icon: 'bx-link-alt' },
    contacted: { icon: 'bx-phone-call' },
    rejected: { icon: 'bxs-x-circle' },
    cancelled: { icon: 'bxs-x-circle' },
    confirmed: { icon: 'bxs-check-circle' },
    payment_reminder: { icon: 'bxs-time-five', actionText: 'Xem đơn đặt cọc', actionUrl: '/?account=deposits' },
    pending_conflict: { icon: 'bxs-time-five', actionText: 'Đổi lịch', actionUrl: '/dang-ky-lai-thu' },
    registered: { icon: 'bxs-calendar-check' },
    active: { icon: 'bxs-purchase-tag' }
};

const getNotificationTypeKey = (notification = {}) =>
    String(notification.type || notification.entityType || '').trim();

const getNotificationConfig = (notification = {}) => {
    const typeKey = getNotificationTypeKey(notification);
    const normalizedStatus = String(notification.status || '').trim().toLowerCase();
    const baseConfig = notificationTypeConfig[typeKey] || notificationTypeConfig.default;
    const statusConfig = notificationStatusConfig[normalizedStatus] || {};
    const entityType = String(notification.entityType || '').trim();

    if (typeKey === 'car-sell-request' || entityType === 'car_sell_request') {
        const sellStatusConfig = {
            approved: { actionText: 'Xem kho xe', actionUrl: '/mua-xe' },
            rejected: {
                icon: 'bxs-x-circle',
                footer: 'Bạn cần đăng lại bài nếu muốn OkXe kiểm tra lại.',
                actionText: 'Đăng lại xe',
                actionUrl: '/dang-tin-ban-xe'
            }
        }[normalizedStatus] || {};

        return { ...baseConfig, ...statusConfig, ...sellStatusConfig };
    }

    return { ...baseConfig, ...statusConfig };
};

const getPromotionByNotification = (notification = {}) =>
    promotionsState.find((promotion) =>
        String(promotion.id || '') === String(notification.entityId || '')
    );

const getNotificationAction = (notification = {}, config = {}) => {
    const typeKey = getNotificationTypeKey(notification);
    const status = String(notification.status || '').trim().toLowerCase();

    if (typeKey === 'test-drive' && status !== 'pending_conflict' && notification.entityId) {
        return `
            <button type="button" class="notification-item__action notification-item__action--danger" data-delete-test-drive-appointment="${escapeHtml(String(notification.entityId))}" data-related-notification-id="${escapeHtml(String(notification.id || ''))}">
                <span>Xóa lịch</span>
                <i class="bx bx-trash" aria-hidden="true"></i>
            </button>
        `;
    }

    if (typeKey === 'promotion') {
        const promotion = getPromotionByNotification(notification);
        const actionUrl = promotion?.ctaUrl || config.actionUrl;
        const actionText = promotion?.ctaText || config.actionText;

        return `
            <a href="${escapeHtml(actionUrl)}" data-close-notifications-link>
                <span>${escapeHtml(actionText)}</span>
                <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
            </a>
        `;
    }

    return `
        <a href="${escapeHtml(config.actionUrl || '/')}" data-close-notifications-link>
            <span>${escapeHtml(config.actionText || 'Xem chi tiết')}</span>
            <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
        </a>
    `;
};

const getNotificationIcon = (notification = {}, config = {}) => {
    if (getNotificationTypeKey(notification) === 'promotion') {
        const promotion = getPromotionByNotification(notification);
        const imageUrl = String(promotion?.imageUrl || '').trim();

        if (imageUrl) {
            return `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(promotion.title || notification.title || 'Khuyến mại OkXe')}">`;
        }
    }

    return `<i class="bx ${escapeHtml(config.icon || 'bxs-bell')}" aria-hidden="true"></i>`;
};

const getNotificationUserNotifications = () =>
    [...userNotificationsState]
        .filter((notification) => !notification.deletedAt)
        .sort((first, second) => {
            const firstTime = new Date(first.createdAt || 0).getTime();
            const secondTime = new Date(second.createdAt || 0).getTime();

            return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
        });

const updateNotificationBadge = () => {
    const notificationCount = getNotificationUserNotifications()
        .filter((notification) => !notification.isRead)
        .length;

    notificationBadges.forEach((badge) => {
        badge.textContent = notificationCount > 9 ? '9+' : String(notificationCount);
        badge.hidden = notificationCount <= 0;
    });
};

const renderPromotionNotifications = () => {
    if (!notificationsList) {
        updateNotificationBadge();
        return;
    }

    const notifications = getNotificationUserNotifications();
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

    notificationsList.innerHTML = notifications.map((notification) => {
        const config = getNotificationConfig(notification);
        const title = notification.title || 'Thông báo từ OkXe';
        const message = notification.message || 'OkXe vừa cập nhật thông tin mới cho bạn.';
        const createdText = formatPromotionDate(
            String(notification.createdAt || notification.updatedAt || '').slice(0, 10),
            'Vừa cập nhật'
        );
        const isPromotionNotification = getNotificationTypeKey(notification) === 'promotion';
        const promotionAttributes = isPromotionNotification
            ? ` role="button" tabindex="0" data-promotion-notification-id="${escapeHtml(String(notification.entityId || ''))}"`
            : '';

        return `
            <article class="notification-item${notification.isRead ? '' : ' is-unread'}"${promotionAttributes} aria-label="${escapeHtml(isPromotionNotification ? `Xem chi tiết ${title}` : title)}">
                <button type="button" class="notification-item__delete" data-delete-notification="${escapeHtml(String(notification.id || ''))}" aria-label="Xóa thông báo ${escapeHtml(title)}">
                    <i class="bx bx-x" aria-hidden="true"></i>
                </button>
                <span class="notification-item__icon">
                    ${getNotificationIcon(notification, config)}
                </span>
                <div class="notification-item__body">
                    <div class="notification-item__meta">
                        <span>${escapeHtml(config.meta)}</span>
                        <small>${escapeHtml(createdText)}</small>
                    </div>
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(message)}</p>
                    <div class="notification-item__footer">
                        <small>${escapeHtml(config.footer)}</small>
                        ${getNotificationAction(notification, config)}
                    </div>
                </div>
            </article>
        `;
    }).join('');
};

const markNotificationsRead = async () => {
    const hasUnreadNotifications = userNotificationsState.some((notification) => !notification.isRead);

    if (!hasUnreadNotifications) {
        return;
    }

    try {
        const { response } = await requestJson('/api/notifications/my/read', { method: 'PATCH' });

        if (!response.ok) {
            return;
        }

        userNotificationsState = userNotificationsState.map((notification) => ({
            ...notification,
            isRead: true
        }));
        updateNotificationBadge();
    } catch (error) {
        // Đọc thất bại không chặn người dùng xem danh sách thông báo.
    }
};

const deleteNotification = async (notificationId) => {
    const normalizedNotificationId = String(notificationId || '');

    if (!normalizedNotificationId) {
        return;
    }

    try {
        const { response, data } = await requestJson(`/api/notifications/my/${encodeURIComponent(normalizedNotificationId)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể xóa thông báo.');
        }

        userNotificationsState = userNotificationsState.filter((notification) =>
            String(notification.id || '') !== normalizedNotificationId
        );
        renderPromotionNotifications();
    } catch (error) {
        window.alert(error.message || 'Không thể xóa thông báo lúc này.');
    }
};

const deleteTestDriveAppointment = async (appointmentId, relatedNotificationId = '') => {
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
        userNotificationsState = userNotificationsState.filter((notification) =>
            !(
                getNotificationTypeKey(notification) === 'test-drive'
                && String(notification.entityId || '') === normalizedAppointmentId
            )
        );

        if (relatedNotificationId) {
            try {
                await requestJson(`/api/notifications/my/${encodeURIComponent(String(relatedNotificationId))}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                // Lịch đã xóa thành công; thông báo sẽ được đồng bộ lại ở lần tải sau nếu cần.
            }
        }

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
    await markNotificationsRead();
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
    const dateValue = String(value || '').slice(0, 10);
    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};

const normalizeHomeBlogPost = (post) => ({
    ...post,
    image: post.image || post.imageUrl || '/images/blog-1.jpg',
    author: post.author || post.authorName || 'Ban biên tập OkXe',
    authorName: post.authorName || post.author || 'Ban biên tập OkXe',
    readTime: Number(post.readTime || 5),
    publishedAt: String(post.publishedAt || '').slice(0, 10)
});

const updateHomeBlogCarouselControls = () => {
    if (!homeBlogCarousel) {
        return;
    }

    const viewport = homeBlogCarousel.querySelector('.home-blog__viewport');
    const previous = homeBlogCarousel.querySelector('[data-home-blog-direction="-1"]');
    const next = homeBlogCarousel.querySelector('[data-home-blog-direction="1"]');
    const dots = Array.from(homeBlogCarousel.querySelectorAll('[data-home-blog-slide-index]'));

    if (!viewport || !previous || !next) {
        return;
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    const canScroll = maxScrollLeft > 1;
    const activeIndex = Math.round(viewport.scrollLeft / Math.max(viewport.clientWidth, 1));

    previous.disabled = !canScroll || viewport.scrollLeft <= 1;
    next.disabled = !canScroll || viewport.scrollLeft >= maxScrollLeft - 1;

    dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeIndex);
        dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
    });
};

const renderHomeBlogCarouselDots = () => {
    const viewport = homeBlogCarousel?.querySelector('.home-blog__viewport');
    const dotsContainer = homeBlogCarousel?.querySelector('.home-blog__dots');

    if (!viewport || !dotsContainer) {
        return;
    }

    const pageCount = Math.max(1, Math.ceil((viewport.scrollWidth - viewport.clientWidth) / Math.max(viewport.clientWidth, 1)) + 1);

    dotsContainer.innerHTML = pageCount > 1
        ? Array.from({ length: pageCount }, (_, index) => `
            <button type="button" class="home-blog__dot${index === 0 ? ' is-active' : ''}" data-home-blog-slide-index="${index}" aria-label="Xem trang bài viết ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"></button>
        `).join('')
        : '';
};

const scrollHomeBlogCarousel = (direction) => {
    const viewport = homeBlogCarousel?.querySelector('.home-blog__viewport');

    if (!viewport) {
        return;
    }

    viewport.scrollBy({
        left: direction * viewport.clientWidth,
        behavior: 'smooth'
    });
};

const goToHomeBlogCarouselPage = (pageIndex) => {
    const viewport = homeBlogCarousel?.querySelector('.home-blog__viewport');

    if (!viewport) {
        return;
    }

    viewport.scrollTo({
        left: pageIndex * viewport.clientWidth,
        behavior: 'smooth'
    });
};

const renderHomeBlog = (posts = homeBlogPostsState) => {
    if (!homeBlogCarousel) {
        return;
    }

    const visiblePosts = posts.slice(0, 6);

    if (!visiblePosts.length) {
        homeBlogCarousel.innerHTML = '<p class="home-blog__empty">Chưa có bài viết nào được hiển thị.</p>';
        return;
    }

    const cards = visiblePosts.map((post) => `
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
                <div class="home-blog-card__author">
                    <i class="bx bx-user" aria-hidden="true"></i>
                    <span>${escapeHtml(post.authorName || post.author)}</span>
                </div>
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
            <div class="home-blog__dots" aria-label="Chọn trang bài viết"></div>
        </div>
    `;

    const viewport = homeBlogCarousel.querySelector('.home-blog__viewport');
    viewport?.addEventListener('scroll', updateHomeBlogCarouselControls, { passive: true });

    if (!homeBlogResizeControlsBound) {
        window.addEventListener('resize', () => {
            renderHomeBlogCarouselDots();
            updateHomeBlogCarouselControls();
        });
        homeBlogResizeControlsBound = true;
    }

    window.requestAnimationFrame(() => {
        renderHomeBlogCarouselDots();
        updateHomeBlogCarouselControls();
    });
};

const syncHomeBlog = async () => {
    if (!homeBlogCarousel) {
        return;
    }

    const fallbackPosts = Array.isArray(window.OKXE_BLOG_POSTS)
        ? window.OKXE_BLOG_POSTS.map(normalizeHomeBlogPost)
        : [];

    try {
        const { response, data } = await requestJson('/api/blog/posts/home');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải bài viết blog.');
        }

        const apiPosts = Array.isArray(data.posts) ? data.posts : [];
        homeBlogPostsState = apiPosts.map(normalizeHomeBlogPost);
    } catch (error) {
        homeBlogPostsState = fallbackPosts;
    }

    renderHomeBlog();
};

homeBlogCarousel?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-home-blog-direction]');
    const dotButton = event.target.closest('[data-home-blog-slide-index]');

    if (button) {
        scrollHomeBlogCarousel(Number(button.dataset.homeBlogDirection || 1));
        return;
    }

    if (dotButton) {
        goToHomeBlogCarouselPage(Number(dotButton.dataset.homeBlogSlideIndex || 0));
    }
});

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
const listingOpenButtons = document.querySelectorAll('[data-open-listings]');
const favoriteOpenButtons = document.querySelectorAll('[data-open-favorites]');
const notificationOpenButtons = document.querySelectorAll('[data-open-notifications]');
const depositOpenButtons = document.querySelectorAll('[data-open-deposits]');
const profileModal = document.querySelector('#profile-modal');
const profileCloseButtons = document.querySelectorAll('[data-close-profile]');
const profileForm = document.querySelector('.profile-form');
const profileFeedback = document.querySelector('#profile-feedback');
const profileModalEyebrow = document.querySelector('#profile-modal-eyebrow');
const profileModalTitle = document.querySelector('#profile-modal-title');
const profileModalDescription = document.querySelector('#profile-modal-description');
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
const profileListingsSection = document.querySelector('#profile-listings-section');
const profileListingsTabs = document.querySelectorAll('[data-profile-listings-tab]');
const profileListingsFilter = document.querySelector('#profile-listings-filter');
const profileListingsList = document.querySelector('#profile-listings-list');
const profileSellCount = document.querySelector('#profile-sell-count');
const profileBuyCount = document.querySelector('#profile-buy-count');
const profileListingsCreateLink = document.querySelector('#profile-listings-create-link');
const profileListingsSecondaryLink = document.querySelector('#profile-listings-secondary-link');
const profileDepositsSection = document.querySelector('#profile-deposits-section');
const profileDepositsList = document.querySelector('#profile-deposits-list');
const profileDepositCount = document.querySelector('#profile-deposit-count');
const profileDepositsFilter = document.querySelector('#profile-deposits-filter');
const profileDepositsRefreshButton = document.querySelector('#profile-deposits-refresh');
const profileDepositDetail = document.querySelector('#profile-deposit-detail');
const profileDepositDetailContent = document.querySelector('#profile-deposit-detail-content');
const profileDepositDetailBackButton = document.querySelector('#profile-deposit-detail-back');
const chooseAvatarButton = document.querySelector('#choose-avatar-button');
const switchToSignupLink = document.querySelector('#switch-to-signup');
const switchToLoginLink = document.querySelector('#switch-to-login');
const maxProfileAvatarSize = 5 * 1024 * 1024;

let currentUser = null;
let selectedProfileAvatarFile = null;
let selectedProfileAvatarDataUrl = '';
const maxProfileDepositProofSize = 5 * 1024 * 1024;
const allowedProfileDepositProofTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

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
const profileDateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
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

const profileListingStatusLabels = {
    sell: {
        all: 'Tất cả',
        selling: 'Đang bán',
        pending: 'Chờ duyệt',
        rejected: 'Không duyệt',
        sold: 'Xe đã bán',
        expired: 'Tin xe hết hạn'
    },
    buy: {
        all: 'Tất cả',
        approved: 'Đang mua',
        pending: 'Chờ duyệt',
        rejected: 'Không duyệt'
    }
};

const profileListingFilterOptions = {
    sell: [
        ['all', 'Tất cả'],
        ['selling', 'Đang bán'],
        ['pending', 'Chờ duyệt'],
        ['rejected', 'Không duyệt'],
        ['sold', 'Xe đã bán'],
        ['expired', 'Tin xe hết hạn']
    ],
    buy: [
        ['all', 'Tất cả'],
        ['approved', 'Đang mua'],
        ['pending', 'Chờ duyệt'],
        ['rejected', 'Không duyệt']
    ]
};

const formatProfileListingDate = (value) => {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        return 'Chưa cập nhật';
    }

    const datePart = normalizedValue.slice(0, 10);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(datePart)
        ? new Date(`${datePart}T00:00:00`)
        : new Date(normalizedValue.replace(' ', 'T'));

    return Number.isNaN(date.getTime())
        ? normalizedValue
        : profileDateFormatter.format(date);
};

const getProfileSellRejectedNotifications = () =>
    userNotificationsState
        .filter((notification) => {
            const type = String(notification.type || '').trim();
            const entityType = String(notification.entityType || '').trim();
            const status = String(notification.status || '').trim().toLowerCase();

            return status === 'rejected'
                && (type === 'car-sell-request' || entityType === 'car_sell_request');
        })
        .map((notification) => ({
            ...notification,
            isRejectedSellNotification: true,
            code: notification.entityId
                ? `BX-${String(notification.entityId).padStart(6, '0')}`
                : `TB-${String(notification.id || '').padStart(6, '0')}`,
            status: 'rejected',
            title: notification.title || 'Tin bán xe không được duyệt',
            message: notification.message || 'Tin bán xe chưa được duyệt. Bạn có thể đăng lại với thông tin phù hợp hơn.'
        }));

const getProfileSellListingStatus = (request = {}) => {
    if (request.isRejectedSellNotification) {
        return 'rejected';
    }

    const status = String(request.status || 'pending').trim().toLowerCase();

    if (status === 'pending') {
        return 'pending';
    }

    const actionText = String(request.actionText || '').trim().toLocaleLowerCase('vi-VN');

    if (actionText.includes('đã bán') || actionText.includes('hết xe') || actionText.includes('hết hàng')) {
        return 'sold';
    }

    return status === 'approved' ? 'selling' : status;
};

const getProfileBuyListingStatus = (request = {}) => {
    const status = String(request.status || 'pending').trim().toLowerCase();

    return ['approved', 'pending', 'rejected'].includes(status) ? status : 'pending';
};

const getProfileListingStatusClass = (status) => {
    if (['selling', 'approved'].includes(status)) {
        return 'is-approved';
    }

    if (status === 'rejected') {
        return 'is-rejected';
    }

    if (status === 'sold' || status === 'expired') {
        return 'is-muted';
    }

    return 'is-pending';
};

const getProfileSellListings = () => [
    ...carSellRequestsState,
    ...getProfileSellRejectedNotifications()
].sort((first, second) => {
    const firstTime = new Date(String(first.createdAt || '').replace(' ', 'T')).getTime() || 0;
    const secondTime = new Date(String(second.createdAt || '').replace(' ', 'T')).getTime() || 0;

    return secondTime - firstTime;
});

const updateProfileListingCounts = () => {
    if (profileSellCount) {
        profileSellCount.textContent = String(getProfileSellListings().length);
    }

    if (profileBuyCount) {
        profileBuyCount.textContent = String(carBuyRequestsState.length);
    }
};

const setProfileListingCreateLinks = () => {
    const isSellTab = activeProfileListingsTab === 'sell';
    const href = isSellTab ? '/dang-tin-ban-xe' : '/dang-tin-mua-o-to';
    const label = isSellTab ? 'Đăng tin bán xe' : 'Đăng tin mua xe';

    [profileListingsCreateLink, profileListingsSecondaryLink].forEach((link) => {
        if (!link) {
            return;
        }

        link.href = href;
        const labelElement = link.querySelector('span');

        if (labelElement) {
            labelElement.textContent = label;
        } else {
            link.textContent = label;
        }
    });
};

const populateProfileListingFilter = () => {
    if (!profileListingsFilter) {
        return;
    }

    const options = profileListingFilterOptions[activeProfileListingsTab] || profileListingFilterOptions.sell;
    const validValues = new Set(options.map(([value]) => value));

    if (!validValues.has(activeProfileListingsFilter)) {
        activeProfileListingsFilter = 'all';
    }

    profileListingsFilter.innerHTML = options
        .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
        .join('');
    profileListingsFilter.value = activeProfileListingsFilter;
};

const renderProfileListingEmpty = (message = '') => {
    const isSellTab = activeProfileListingsTab === 'sell';
    const title = message || (isSellTab ? 'Không có tin đăng bán xe nào' : 'Không có tin đăng mua xe nào');
    const hint = isSellTab
        ? 'Bạn có thể gửi thông tin xe cần bán để OkXe kiểm tra và hỗ trợ nhập kho.'
        : 'Bạn có thể đăng nhu cầu mua xe để OkXe hỗ trợ kết nối xe phù hợp.';

    return `
        <article class="profile-listings__empty">
            <i class="bx bx-folder-open" aria-hidden="true"></i>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(hint)}</p>
        </article>
    `;
};

const renderProfileSellListingCard = (request = {}) => {
    const status = getProfileSellListingStatus(request);
    const statusLabel = profileListingStatusLabels.sell[status] || profileListingStatusLabels.sell.pending;
    const title = request.isRejectedSellNotification
        ? request.title
        : [request.brand, request.name].filter(Boolean).join(' ') || 'Xe cần bán';
    const description = request.isRejectedSellNotification
        ? request.message
        : request.description || request.statusNote || 'OkXe đang lưu thông tin xe bạn gửi bán.';
    const detailChips = request.isRejectedSellNotification
        ? []
        : [
            request.price,
            request.year ? `Đời ${request.year}` : '',
            request.mileage,
            request.condition
        ].filter(Boolean);
    const actionHref = status === 'selling' && request.approvedCarId
        ? `/cars/${encodeURIComponent(String(request.approvedCarId))}`
        : '/dang-tin-ban-xe';
    const actionText = status === 'selling' && request.approvedCarId ? 'Xem xe đang bán' : 'Đăng tin bán xe';

    return `
        <article class="profile-listing-card">
            <div class="profile-listing-card__top">
                <div>
                    <span>${escapeHtml(request.code || 'Tin bán xe')}</span>
                    <h4>${escapeHtml(title)}</h4>
                </div>
                <strong class="profile-listing-status ${getProfileListingStatusClass(status)}">${escapeHtml(statusLabel)}</strong>
            </div>
            <div class="profile-listing-card__meta">
                <span>Ngày gửi: ${escapeHtml(formatProfileListingDate(request.createdAt))}</span>
                ${request.updatedAt ? `<span>Cập nhật: ${escapeHtml(formatProfileListingDate(request.updatedAt))}</span>` : ''}
            </div>
            <p>${escapeHtml(description)}</p>
            ${detailChips.length ? `
                <div class="profile-listing-card__chips">
                    ${detailChips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}
                </div>
            ` : ''}
            ${request.statusNote ? `<small class="profile-listing-card__note">Ghi chú: ${escapeHtml(request.statusNote)}</small>` : ''}
            <div class="profile-listing-card__actions">
                <a href="${escapeHtml(actionHref)}">${escapeHtml(actionText)}</a>
            </div>
        </article>
    `;
};

const renderProfileBuyListingCard = (request = {}) => {
    const status = getProfileBuyListingStatus(request);
    const statusLabel = profileListingStatusLabels.buy[status] || profileListingStatusLabels.buy.pending;
    const budgetLabel = carBuyRequestBudgetLabelsState[request.budgetRange] || request.budgetRange || 'Chưa chọn ngân sách';
    const offerCount = Number(request.offerCount || 0);
    const actionHref = status === 'rejected' ? '/dang-tin-mua-o-to' : '/tin-mua-o-to';
    const actionText = status === 'rejected' ? 'Đăng lại tin mua' : 'Xem tin mua ô tô';

    return `
        <article class="profile-listing-card">
            <div class="profile-listing-card__top">
                <div>
                    <span>${escapeHtml(request.code || 'Tin mua xe')}</span>
                    <h4>${escapeHtml(request.title || 'Nhu cầu mua ô tô')}</h4>
                </div>
                <strong class="profile-listing-status ${getProfileListingStatusClass(status)}">${escapeHtml(statusLabel)}</strong>
            </div>
            <div class="profile-listing-card__meta">
                <span>Ngày gửi: ${escapeHtml(formatProfileListingDate(request.createdAt))}</span>
                ${request.province ? `<span>Khu vực: ${escapeHtml(request.province)}</span>` : ''}
            </div>
            <p>${escapeHtml(request.content || 'Bạn đã gửi nhu cầu mua xe tới OkXe.')}</p>
            <div class="profile-listing-card__chips">
                <span>${escapeHtml(budgetLabel)}</span>
                <span>${offerCount} đề xuất xe</span>
            </div>
            ${request.statusNote ? `<small class="profile-listing-card__note">${status === 'rejected' ? 'Lý do' : 'Ghi chú'}: ${escapeHtml(request.statusNote)}</small>` : ''}
            <div class="profile-listing-card__actions">
                <a href="${escapeHtml(actionHref)}">${escapeHtml(actionText)}</a>
            </div>
        </article>
    `;
};

const renderProfileListings = ({ isLoading = false } = {}) => {
    if (!profileListingsList) {
        return;
    }

    updateProfileListingCounts();
    setProfileListingCreateLinks();
    populateProfileListingFilter();

    profileListingsTabs.forEach((tab) => {
        const isActive = tab.dataset.profileListingsTab === activeProfileListingsTab;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });

    if (isLoading) {
        profileListingsList.innerHTML = `
            <article class="profile-listings__empty">
                <i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i>
                <strong>Đang tải tin của bạn</strong>
                <p>OkXe đang kiểm tra các tin đăng gắn với tài khoản này.</p>
            </article>
        `;
        return;
    }

    const allListings = activeProfileListingsTab === 'sell'
        ? getProfileSellListings()
        : carBuyRequestsState;
    const filteredListings = activeProfileListingsFilter === 'all'
        ? allListings
        : allListings.filter((request) => {
            const status = activeProfileListingsTab === 'sell'
                ? getProfileSellListingStatus(request)
                : getProfileBuyListingStatus(request);

            return status === activeProfileListingsFilter;
        });

    if (!filteredListings.length) {
        profileListingsList.innerHTML = renderProfileListingEmpty(
            activeProfileListingsFilter === 'all'
                ? ''
                : `Không có tin ở trạng thái "${(profileListingStatusLabels[activeProfileListingsTab] || {})[activeProfileListingsFilter] || 'đã chọn'}"`
        );
        return;
    }

    profileListingsList.innerHTML = filteredListings
        .map((request) => activeProfileListingsTab === 'sell'
            ? renderProfileSellListingCard(request)
            : renderProfileBuyListingCard(request))
        .join('');
};

const profileDepositStatusLabels = {
    all: 'Tất cả',
    pending: 'Chờ xác nhận',
    confirmed: 'Đã nhận tiền',
    completed: 'Hoàn tất giao dịch',
    cancelled_after_deposit: 'Hủy sau đặt cọc',
    cancelled: 'Đã hủy',
    expired: 'Quá hạn giữ chỗ'
};

const profileDepositPaymentLabels = {
    bank: 'Chuyển khoản ngân hàng',
    vnpay: 'VNPay sandbox',
    wallet: 'Ví điện tử',
    card: 'Thẻ ngân hàng'
};

const formatProfileMoney = (value) => {
    const amount = Number(value || 0);

    return Number.isFinite(amount) && amount > 0
        ? `${amount.toLocaleString('vi-VN')} VNĐ`
        : 'Chưa cập nhật';
};

const getProfileDepositStatusClass = (status) => {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    if (normalizedStatus === 'confirmed' || normalizedStatus === 'completed') {
        return 'is-approved';
    }

    if (normalizedStatus === 'cancelled' || normalizedStatus === 'cancelled_after_deposit') {
        return 'is-rejected';
    }

    if (normalizedStatus === 'expired') {
        return 'is-expired';
    }

    return 'is-pending';
};

const getProfileDepositDescription = (order = {}) => {
    const status = String(order.status || 'pending').trim().toLowerCase();

    if (status === 'confirmed') {
        return order.statusNote || 'OkXe đã xác nhận nhận tiền đặt cọc. Nhân viên sẽ tiếp tục hỗ trợ hồ sơ mua xe.';
    }

    if (status === 'completed') {
        return order.statusNote || 'Giao dịch mua xe đã hoàn tất. Xe đã được chuyển sang trạng thái đã bán.';
    }

    if (status === 'cancelled_after_deposit') {
        return order.statusNote || 'Giao dịch sau đặt cọc đã hủy. Vui lòng liên hệ OkXe để được hỗ trợ chính sách hoàn cọc hoặc xử lý tiếp.';
    }

    if (status === 'cancelled') {
        return order.statusNote || 'Đơn đặt cọc đã bị hủy. Nếu thanh toán VNPay thất bại hoặc bạn đã hủy giao dịch, vui lòng tạo đơn mới để thanh toán lại.';
    }

    if (status === 'expired') {
        return order.statusNote || 'Đơn đặt cọc đã quá hạn giữ chỗ. Xe có thể được mở lại để khách khác đặt cọc.';
    }

    if (order.paymentMethod === 'bank') {
        return 'Đơn đang chờ nhân viên xác nhận đã nhận tiền chuyển khoản.';
    }

    if (order.paymentMethod === 'vnpay') {
        return 'Đơn đang chờ thanh toán VNPay. Chỉ bấm Tiếp tục thanh toán VNPay nếu giao dịch trước chưa trả kết quả thất bại/hủy.';
    }

    return 'Đơn đang chờ nhân viên OkXe kiểm tra và xác nhận.';
};

const getProfileDepositNextStepGuide = (order = {}) => {
    const status = String(order.status || 'pending').trim().toLowerCase();
    const isVnpayPayment = String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';
    const guides = {
        pending: {
            icon: 'bx-time-five',
            title: isVnpayPayment ? 'Hoàn tất thanh toán VNPay' : 'Chuyển khoản và theo dõi xác nhận',
            description: 'Đơn đang giữ xe tạm thời trong thời hạn cấu hình.',
            steps: isVnpayPayment
                ? [
                    'Bấm "Tiếp tục thanh toán VNPay" nếu giao dịch trước chưa trả kết quả thất bại/hủy.',
                    order.expiresAt ? `Hoàn tất thanh toán trước hạn giữ chỗ: ${formatProfileListingDate(order.expiresAt)}.` : 'Theo dõi hạn giữ chỗ trong chi tiết đơn.',
                    'Nếu VNPay trả kết quả thất bại hoặc bạn hủy giao dịch, đơn sẽ bị hủy và bạn cần tạo đơn mới.'
                ]
                : [
                    order.bankTransferNote ? `Chuyển khoản đúng nội dung: ${order.bankTransferNote}.` : 'Chuyển khoản đúng nội dung hiển thị trong đơn.',
                    order.expiresAt ? `Hoàn tất chuyển khoản trước hạn giữ chỗ: ${formatProfileListingDate(order.expiresAt)}.` : 'Theo dõi hạn giữ chỗ trong chi tiết đơn.',
                    'Sau khi OkXe xác nhận đã nhận tiền, bạn có thể xem biên nhận và bổ sung ảnh biên lai.'
                ]
        },
        confirmed: {
            icon: 'bx-check-shield',
            title: 'Lưu biên nhận và chuẩn bị hồ sơ',
            description: 'OkXe đã ghi nhận tiền đặt cọc và tiếp tục giữ xe cho bạn.',
            steps: [
                'In hoặc lưu PDF biên nhận đặt cọc.',
                'Tải ảnh biên lai nếu bạn muốn lưu chứng từ trong hồ sơ.',
                'Chờ nhân viên OkXe liên hệ về hồ sơ mua xe, thanh toán còn lại và lịch nhận xe.'
            ]
        },
        completed: {
            icon: 'bx-check-circle',
            title: 'Giao dịch đã hoàn tất',
            description: 'Xe đã được chốt bán từ đơn đặt cọc này.',
            steps: [
                'Lưu lại biên nhận và chứng từ thanh toán.',
                'Liên hệ nhân viên nếu cần đối chiếu giấy tờ sau bàn giao.'
            ]
        },
        cancelled_after_deposit: {
            icon: 'bx-transfer-alt',
            title: 'Kiểm tra thông tin hoàn cọc',
            description: 'Giao dịch đã hủy sau khi tiền đặt cọc được xác nhận.',
            steps: [
                'Xem lý do hủy, số tiền hoàn và mã giao dịch hoàn cọc.',
                'Liên hệ OkXe nếu đã quá thời gian hẹn mà chưa nhận được tiền hoàn.'
            ]
        },
        cancelled: {
            icon: 'bx-x-circle',
            title: 'Đơn không còn hiệu lực',
            description: 'Xe không còn được giữ bằng đơn này.',
            steps: [
                'Xem ghi chú xử lý để biết lý do hủy.',
                'Chọn xe khác hoặc liên hệ OkXe nếu bạn vẫn cần hỗ trợ.'
            ]
        },
        expired: {
            icon: 'bx-timer',
            title: 'Đơn đã quá hạn giữ chỗ',
            description: 'Thời gian giữ xe đã kết thúc trước khi OkXe xác nhận nhận tiền.',
            steps: [
                'Tra cứu lại tình trạng xe nếu bạn vẫn muốn mua.',
                'Tạo đơn mới hoặc liên hệ OkXe để nhân viên kiểm tra lại xe còn bán hay không.'
            ]
        }
    };

    return guides[status] || guides.pending;
};

const renderProfileDepositNextSteps = (order = {}) => {
    const guide = getProfileDepositNextStepGuide(order);

    return `
        <section class="profile-deposit-next-steps">
            <div class="profile-deposit-next-steps__head">
                <i class="bx ${escapeHtml(guide.icon)}" aria-hidden="true"></i>
                <div>
                    <span>Bước tiếp theo</span>
                    <h4>${escapeHtml(guide.title)}</h4>
                    <p>${escapeHtml(guide.description)}</p>
                </div>
            </div>
            <ol>
                ${guide.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
            </ol>
        </section>
    `;
};

const renderProfileDepositEmpty = (message = '') => `
    <article class="profile-listings__empty">
        <i class="bx bx-receipt" aria-hidden="true"></i>
        <strong>${escapeHtml(message || 'Bạn chưa có đơn đặt cọc nào')}</strong>
        <p>Bạn có thể đặt cọc xe từ trang chi tiết xe để giữ chỗ và theo dõi trạng thái tại đây.</p>
    </article>
`;

const getProfileDepositCarTitle = (order = {}) =>
    [order.carBrand, order.carName].filter(Boolean).join(' ') || 'Xe đặt cọc';

const getProfileDepositExpiryText = (order = {}) => {
    const status = String(order.status || 'pending').trim().toLowerCase();

    if (status === 'expired' && order.expiredAt) {
        return `Quá hạn lúc: ${formatProfileListingDate(order.expiredAt)}`;
    }

    if (status === 'pending' && order.expiresAt) {
        return `${order.isOverdue ? 'Đã quá hạn' : 'Hạn giữ chỗ'}: ${formatProfileListingDate(order.expiresAt)}`;
    }

    return '';
};

const getProfileDepositRemainingAmount = (order = {}) => {
    const carPriceValue = Number(order.carPriceValue || 0);
    const depositAmount = Number(order.depositAmount || 0);

    return Number.isFinite(carPriceValue) && carPriceValue > 0
        ? Math.max(carPriceValue - depositAmount, 0)
        : 0;
};

const formatProfileDepositReceiptDate = (value) => {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        return 'Chưa cập nhật';
    }

    const date = new Date(normalizedValue.replace(' ', 'T'));

    return Number.isNaN(date.getTime())
        ? normalizedValue
        : profileDateTimeFormatter.format(date);
};

const renderProfileDepositReceiptRows = (rows = []) => rows
    .map(([label, value]) => `
        <div class="receipt-row">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(getProfileDisplayValue(value))}</strong>
        </div>
    `)
    .join('');

const renderProfileDepositReceiptPolicy = (policyText = '') => {
    const policyItems = String(policyText || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map((line) => line.trim().replace(/\s+/g, ' '))
        .filter(Boolean);

    if (!policyItems.length) {
        return '';
    }

    return `<ul class="policy-list">${policyItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
};

const getProfileDepositReceiptDocument = (receipt = {}) => {
    const customer = receipt.customer || {};
    const car = receipt.car || {};
    const payment = receipt.payment || {};
    const bank = receipt.bank || {};
    const receiptRows = [
        ['Mã biên nhận', receipt.receiptCode],
        ['Mã đơn đặt cọc', receipt.orderCode],
        ['Ngày lập biên nhận', formatProfileDepositReceiptDate(receipt.issuedAt)]
    ];
    const customerRows = [
        ['Khách hàng', customer.fullName],
        ['Số điện thoại', customer.phone],
        ['Email', customer.email || 'Không có'],
        ['Tỉnh/thành phố', customer.province]
    ];
    const carRows = [
        ['Xe đặt cọc', car.title],
        ['Giá xe tại thời điểm đặt cọc', car.priceText || formatProfileMoney(car.priceValue)],
        ['Mã xe', car.id ? `XE-${String(car.id).padStart(6, '0')}` : 'Chưa cập nhật']
    ];
    const paymentRows = [
        ['Số tiền đặt cọc', formatProfileMoney(payment.depositAmount)],
        ['Số tiền còn lại', payment.remainingAmount !== null && payment.remainingAmount !== undefined ? formatProfileMoney(payment.remainingAmount) : 'Nhân viên sẽ xác nhận'],
        ['Phương thức thanh toán', payment.methodLabel],
        [payment.method === 'vnpay' ? 'Mã thanh toán VNPay' : 'Nội dung chuyển khoản', payment.method === 'vnpay' ? payment.vnpayTxnRef : payment.bankTransferNote],
        ['Mã giao dịch', payment.paymentReference],
        ...(payment.method === 'vnpay' ? [['VNPay TransactionNo', payment.vnpayTransactionNo]] : []),
        ['Thời gian nhận tiền', formatProfileDepositReceiptDate(payment.paymentReceivedAt)],
        ['Thời gian xác nhận', formatProfileDepositReceiptDate(payment.paymentConfirmedAt)],
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
        <section class="summary">${renderProfileDepositReceiptRows(receiptRows)}</section>
        <section class="section"><h2>Thông tin khách hàng</h2><div class="grid">${renderProfileDepositReceiptRows(customerRows)}</div></section>
        <section class="section"><h2>Thông tin xe</h2><div class="grid">${renderProfileDepositReceiptRows(carRows)}</div></section>
        <section class="section"><h2>Thông tin thanh toán</h2><div class="grid">${renderProfileDepositReceiptRows(paymentRows)}</div></section>
        <section class="section"><h2>Tài khoản nhận cọc</h2><div class="grid">${renderProfileDepositReceiptRows(bankRows)}</div></section>
        <section class="section"><h2>Chính sách đặt cọc</h2>${renderProfileDepositReceiptPolicy(receipt.policyText)}</section>
        <p class="note">${escapeHtml(receipt.note || 'Biên nhận xác nhận OkXe đã nhận tiền đặt cọc giữ xe. Các bước mua bán tiếp theo sẽ được nhân viên hỗ trợ theo quy trình của cửa hàng.')}</p>
        <section class="signatures">
            <div class="signature-box">Khách hàng</div>
            <div class="signature-box">Đại diện OkXe</div>
        </section>
    </main>
</body>
</html>`;
};

const writeProfileDepositReceiptWindowMessage = (receiptWindow, message = 'Đang tải biên nhận...') => {
    receiptWindow.document.open();
    receiptWindow.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Biên nhận đặt cọc</title></head><body style="font-family: 'Segoe UI', 'Noto Sans', Arial, sans-serif; line-height: 1.5; padding: 32px; color: #102033;"><strong>${escapeHtml(message)}</strong></body></html>`);
    receiptWindow.document.close();
};

const openProfileDepositReceipt = async (orderId) => {
    const receiptWindow = window.open('', '_blank', 'width=920,height=900');

    if (!receiptWindow) {
        showToast('Trình duyệt đang chặn cửa sổ biên nhận. Vui lòng cho phép popup rồi thử lại.', 'error', 'Không mở được biên nhận');
        return;
    }

    writeProfileDepositReceiptWindowMessage(receiptWindow);

    try {
        const { response, data } = await requestJson(`/api/deposit-orders/${encodeURIComponent(String(orderId))}/receipt`);

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải biên nhận đặt cọc.');
        }

        receiptWindow.document.open();
        receiptWindow.document.write(getProfileDepositReceiptDocument(data.receipt));
        receiptWindow.document.close();
        receiptWindow.focus();
    } catch (error) {
        writeProfileDepositReceiptWindowMessage(receiptWindow, error.message || 'Không thể tải biên nhận đặt cọc.');
        showToast(error.message || 'Không thể tải biên nhận đặt cọc.', 'error', 'Biên nhận đặt cọc');
    }
};

const setProfileDepositProofFeedback = (orderId, message = '', type = '') => {
    const selector = `[data-profile-deposit-proof-feedback="${escapeSelectorValue(orderId)}"]`;
    const feedback = profileDepositDetail?.querySelector(selector)
        || profileDepositsList?.querySelector(selector);

    if (!feedback) {
        return;
    }

    feedback.textContent = message || '';
    feedback.className = type ? `is-${type}` : '';
};

const getProfileDepositProofMimeType = (file = {}) => {
    const declaredType = String(file.type || '').trim().toLowerCase();

    if (allowedProfileDepositProofTypes.has(declaredType)) {
        return declaredType;
    }

    const fileName = String(file.name || '').trim().toLowerCase();

    if (/\.jpe?g$/.test(fileName)) {
        return 'image/jpeg';
    }

    if (/\.png$/.test(fileName)) {
        return 'image/png';
    }

    if (/\.webp$/.test(fileName)) {
        return 'image/webp';
    }

    if (/\.gif$/.test(fileName)) {
        return 'image/gif';
    }

    return declaredType;
};

const uploadProfileDepositProof = async (orderId, file) => {
    if (!file) {
        throw new Error('Vui lòng chọn ảnh biên lai chuyển khoản.');
    }

    const currentOrder = depositOrdersState.find((order) => String(order.id || '') === String(orderId || ''));

    if (currentOrder && String(currentOrder.status || '').trim().toLowerCase() !== 'confirmed') {
        throw new Error('Chỉ đơn đã được xác nhận nhận tiền mới được tải biên lai.');
    }

    const proofMimeType = getProfileDepositProofMimeType(file);

    if (!allowedProfileDepositProofTypes.has(proofMimeType)) {
        throw new Error('Chỉ hỗ trợ ảnh biên lai định dạng JPG, PNG, WEBP hoặc GIF.');
    }

    if (file.size > maxProfileDepositProofSize) {
        throw new Error('Ảnh biên lai tối đa 5MB.');
    }

    const { response, data } = await requestJson(`/api/deposit-orders/${encodeURIComponent(String(orderId))}/transfer-proof/account`, {
        method: 'POST',
        body: JSON.stringify({
            file: {
                name: file.name,
                type: proofMimeType,
                dataUrl: await readFileAsDataUrl(file)
            }
        })
    });

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải ảnh biên lai chuyển khoản.');
    }

    const updatedOrder = data.order;

    if (updatedOrder?.id) {
        depositOrdersState = depositOrdersState.map((order) =>
            String(order.id || '') === String(updatedOrder.id || '') ? updatedOrder : order);
        renderProfileDeposits();
        openProfileDepositDetail(updatedOrder.id);
    } else {
        await syncDepositOrders();
    }

    return data;
};

const setProfileDepositVnpayResumeLoading = (orderId, isLoading = false) => {
    const selector = `[data-profile-deposit-vnpay-resume="${escapeSelectorValue(orderId)}"]`;

    document.querySelectorAll(selector).forEach((button) => {
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        if (isLoading) {
            if (!button.dataset.profileDepositOriginalHtml) {
                button.dataset.profileDepositOriginalHtml = button.innerHTML;
            }

            button.disabled = true;
            button.innerHTML = `
                <i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i>
                <span>Đang mở VNPay...</span>
            `;
            return;
        }

        button.disabled = false;
        button.innerHTML = button.dataset.profileDepositOriginalHtml || `
            <i class="bx bx-credit-card-front" aria-hidden="true"></i>
            <span>Tiếp tục thanh toán VNPay</span>
        `;
        delete button.dataset.profileDepositOriginalHtml;
    });
};

const updateProfileDepositOrderInState = (updatedOrder = {}) => {
    if (!updatedOrder?.id) {
        return;
    }

    const updatedOrderId = String(updatedOrder.id);
    const hasOrder = depositOrdersState.some((order) => String(order.id || '') === updatedOrderId);

    depositOrdersState = hasOrder
        ? depositOrdersState.map((order) => String(order.id || '') === updatedOrderId ? updatedOrder : order)
        : [updatedOrder, ...depositOrdersState];

    renderProfileDeposits();

    if (activeProfileDepositDetailId && String(activeProfileDepositDetailId || '') === updatedOrderId) {
        openProfileDepositDetail(updatedOrder.id);
    }
};

const resumeProfileDepositVnpayPayment = async (orderId) => {
    if (!orderId) {
        return;
    }

    let shouldRestoreButton = true;

    setProfileDepositVnpayResumeLoading(orderId, true);

    try {
        const { response, data } = await requestJson(`/api/deposit-orders/${encodeURIComponent(String(orderId))}/vnpay/resume`, {
            method: 'POST'
        });

        if (data.order?.id) {
            updateProfileDepositOrderInState(data.order);
        }

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tiếp tục thanh toán VNPay.');
        }

        const paymentUrl = String(data.payment?.paymentUrl || '').trim();

        if (!paymentUrl) {
            throw new Error('VNPay chưa trả về đường dẫn thanh toán. Vui lòng thử lại sau.');
        }

        showToast(data.message || 'Đang chuyển sang cổng thanh toán VNPay.', 'success', 'Thanh toán đặt cọc');
        shouldRestoreButton = false;
        window.location.assign(paymentUrl);
    } catch (error) {
        showToast(error.message || 'Không thể tiếp tục thanh toán VNPay.', 'error', 'Thanh toán đặt cọc');
    } finally {
        if (shouldRestoreButton) {
            setProfileDepositVnpayResumeLoading(orderId, false);
        }
    }
};

const renderProfileDepositDetailRows = (rows = []) => rows
    .map(([label, value]) => `
        <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(getProfileDisplayValue(value))}</dd>
        </div>
    `)
    .join('');

const getProfileDepositBankInfo = (order = {}) => {
    const bank = order.bank || {};
    const accountName = String(bank.accountName || order.bankAccountName || '').trim();
    const bankName = String(bank.bankName || order.bankName || '').trim();
    const accountNumber = String(bank.accountNumber || order.bankAccountNumber || '').trim();
    const branch = String(bank.branch || order.bankBranch || '').trim();
    const displayName = String(bank.displayName || [accountName, bankName].filter(Boolean).join(' - ')).trim();

    return {
        accountName,
        bankName,
        accountNumber,
        branch,
        displayName
    };
};

const renderProfileDepositBankTransferPanel = (order = {}) => {
    const status = String(order.status || 'pending').trim().toLowerCase();
    const paymentMethod = String(order.paymentMethod || '').trim().toLowerCase();

    if (paymentMethod !== 'bank' || status !== 'pending') {
        return '';
    }

    const bankInfo = getProfileDepositBankInfo(order);
    const transferNote = String(order.bankTransferNote || '').trim();
    const items = [
        ['Ngân hàng', bankInfo.bankName || 'Chưa cấu hình'],
        ['Chủ tài khoản', bankInfo.accountName || 'Chưa cấu hình'],
        ['Số tài khoản', bankInfo.accountNumber || 'Chưa cấu hình'],
        ['Số tiền cần chuyển', formatProfileMoney(order.depositAmount)],
        ['Nội dung chuyển khoản', transferNote || 'Chưa có nội dung'],
        ...(bankInfo.branch ? [['Chi nhánh', bankInfo.branch]] : [])
    ];

    return `
        <section class="profile-deposit-bank-guide">
            <div class="profile-deposit-bank-guide__head">
                <i class="bx bx-bank" aria-hidden="true"></i>
                <div>
                    <span>Thông tin chuyển khoản</span>
                    <h4>${escapeHtml(bankInfo.displayName || bankInfo.bankName || 'Tài khoản nhận cọc OkXe')}</h4>
                    <p>Vui lòng chuyển đúng số tiền và nội dung để OkXe đối soát đơn nhanh hơn.</p>
                </div>
            </div>
            <div class="profile-deposit-bank-guide__grid">
                ${items.map(([label, value]) => `
                    <div>
                        <span>${escapeHtml(label)}</span>
                        <strong>${escapeHtml(getProfileDisplayValue(value))}</strong>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
};

const getProfileDepositHistoryMeta = (entry = {}) => {
    const actionType = String(entry.actionType || '').trim().toLowerCase();
    const nextStatus = String(entry.nextStatus || 'pending').trim().toLowerCase();
    const statusLabel = entry.nextStatusLabel
        || profileDepositStatusLabels[nextStatus]
        || profileDepositStatusLabels.pending;
    const statusConfig = {
        pending: {
            className: 'is-pending',
            icon: 'bxs-time-five',
            title: statusLabel
        },
        confirmed: {
            className: 'is-confirmed',
            icon: 'bxs-check-circle',
            title: statusLabel
        },
        completed: {
            className: 'is-completed',
            icon: 'bxs-check-circle',
            title: statusLabel
        },
        cancelled_after_deposit: {
            className: 'is-cancelled',
            icon: 'bxs-x-circle',
            title: statusLabel
        },
        cancelled: {
            className: 'is-cancelled',
            icon: 'bxs-x-circle',
            title: statusLabel
        },
        expired: {
            className: 'is-expired',
            icon: 'bxs-time-five',
            title: statusLabel
        }
    };
    const actionConfig = {
        created: {
            className: 'is-created',
            icon: 'bx-receipt',
            title: 'Tạo đơn đặt cọc'
        },
        vnpay_payment_url_created: {
            className: 'is-pending',
            icon: 'bx-credit-card',
            title: 'Tạo link thanh toán VNPay'
        },
        vnpay_payment_url_resumed: {
            className: 'is-pending',
            icon: 'bx-credit-card-front',
            title: 'Mở lại thanh toán VNPay'
        },
        transfer_proof_uploaded: {
            className: 'is-proof',
            icon: 'bx-image-add',
            title: 'Tải chứng từ chuyển khoản'
        },
        refund_recorded: {
            className: 'is-refund',
            icon: 'bx-transfer-alt',
            title: 'Ghi nhận hoàn cọc'
        },
        payment_reminder_sent: {
            className: 'is-pending',
            icon: 'bxs-time-five',
            title: 'Nhắc chuyển khoản'
        },
        auto_expired: {
            className: 'is-expired',
            icon: 'bxs-time-five',
            title: 'Tự động quá hạn'
        }
    };

    return actionConfig[actionType] || statusConfig[nextStatus] || statusConfig.pending;
};

const renderProfileDepositHistory = (history = []) => {
    const entries = Array.isArray(history) ? history : [];

    if (!entries.length) {
        return '<p>Chưa có lịch sử xử lý.</p>';
    }

    return `
        <div class="profile-deposit-history">
            ${entries.map((entry) => {
                const historyMeta = getProfileDepositHistoryMeta(entry);
                const actorText = entry.actorName || (entry.actionType === 'auto_expired' ? 'Hệ thống OkXe' : 'OkXe');
                const noteText = String(entry.note || '').trim();

                return `
                    <article class="profile-deposit-history__item ${escapeHtml(historyMeta.className)}">
                        <span class="profile-deposit-history__marker" aria-hidden="true">
                            <i class="bx ${escapeHtml(historyMeta.icon)}"></i>
                        </span>
                        <div class="profile-deposit-history__content">
                            <div class="profile-deposit-history__head">
                                <strong>${escapeHtml(historyMeta.title)}</strong>
                                <time>${escapeHtml(formatProfileListingDate(entry.createdAt))}</time>
                            </div>
                            ${noteText ? `<p>${escapeHtml(noteText)}</p>` : ''}
                            <small>
                                <i class="bx bx-user" aria-hidden="true"></i>
                                <span>${escapeHtml(actorText)}</span>
                            </small>
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
    `;
};

const canUploadProfileDepositProof = (order = {}) =>
    String(order.status || '').trim().toLowerCase() === 'confirmed';

const canResumeProfileDepositVnpayPayment = (order = {}) =>
    String(order.status || '').trim().toLowerCase() === 'pending'
    && String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';

const renderProfileDepositVnpayResumeButton = (order = {}) => {
    if (!canResumeProfileDepositVnpayPayment(order)) {
        return '';
    }

    return `
        <button type="button" class="profile-deposit-action--pay" data-profile-deposit-vnpay-resume="${escapeHtml(order.id)}">
            <i class="bx bx-credit-card-front" aria-hidden="true"></i>
            <span>Tiếp tục thanh toán VNPay</span>
        </button>
    `;
};

const renderProfileDepositProofPanel = (order = {}) => {
    const proofUrl = String(order.transferProofUrl || '').trim();
    const proofFileName = String(order.transferProofFileName || '').trim();
    const proofUploadedAt = String(order.transferProofUploadedAt || '').trim();
    const canUploadProof = canUploadProfileDepositProof(order);

    return `
        <div class="profile-deposit-proof-panel">
            ${proofUrl ? `
                <a class="profile-deposit-proof-panel__thumb" href="${escapeHtml(proofUrl)}" target="_blank" rel="noopener">
                    <img src="${escapeHtml(proofUrl)}" alt="Biên lai chuyển khoản ${escapeHtml(order.code || '')}">
                </a>
            ` : `
                <span class="profile-deposit-proof-panel__empty">
                    <i class="bx bx-image-add" aria-hidden="true"></i>
                </span>
            `}
            <div>
                <strong>${escapeHtml(proofUrl ? (proofFileName || 'Biên lai chuyển khoản') : 'Chưa có ảnh biên lai')}</strong>
                <span>${escapeHtml(proofUrl && proofUploadedAt
                    ? `Đã tải lúc ${formatProfileListingDate(proofUploadedAt)}`
                    : canUploadProof
                        ? 'Tải ảnh biên lai sau khi OkXe đã xác nhận nhận tiền đặt cọc.'
                        : 'Chỉ đơn đã được xác nhận nhận tiền mới được bổ sung biên lai trong tài khoản.')}</span>
                <div class="profile-deposit-proof-panel__actions">
                    ${proofUrl ? `
                        <a href="${escapeHtml(proofUrl)}" target="_blank" rel="noopener">
                            <i class="bx bx-show" aria-hidden="true"></i>
                            <span>Xem biên lai</span>
                        </a>
                    ` : ''}
                    ${canUploadProof ? `
                        <button type="button" data-profile-deposit-proof-choose="${escapeHtml(order.id)}">
                            <i class="bx bx-upload" aria-hidden="true"></i>
                            <span>${proofUrl ? 'Thay ảnh biên lai' : 'Tải ảnh biên lai'}</span>
                        </button>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-profile-deposit-proof-input="${escapeHtml(order.id)}">
                    ` : ''}
                </div>
                <small data-profile-deposit-proof-feedback="${escapeHtml(order.id)}" aria-live="polite"></small>
            </div>
        </div>
    `;
};

const renderProfileDepositDetail = (order = {}) => {
    const status = String(order.status || 'pending').trim().toLowerCase();
    const statusLabel = profileDepositStatusLabels[status] || profileDepositStatusLabels.pending;
    const paymentLabel = profileDepositPaymentLabels[order.paymentMethod] || order.paymentMethod || 'Chưa cập nhật';
    const carTitle = getProfileDepositCarTitle(order);
    const remainingAmount = getProfileDepositRemainingAmount(order);
    const transferNote = String(order.bankTransferNote || '').trim();
    const isVnpayPayment = String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';
    const canPrintReceipt = ['confirmed', 'completed'].includes(status);
    const customerRows = [
        ['Họ tên', order.fullName],
        ['Số điện thoại', order.phone],
        ['Email', order.email],
        ['Tỉnh/thành phố', order.province],
        ['Ghi chú của khách', order.note || 'Không có ghi chú']
    ];
    const carRows = [
        ['Xe đặt cọc', carTitle],
        ['Giá xe tại thời điểm đặt cọc', order.carPrice || formatProfileMoney(order.carPriceValue)],
        ['Mã xe', order.carId ? `XE-${String(order.carId).padStart(6, '0')}` : 'Chưa cập nhật']
    ];
    const paymentRows = [
        ['Số tiền đặt cọc', formatProfileMoney(order.depositAmount)],
        ['Số tiền còn lại', remainingAmount ? formatProfileMoney(remainingAmount) : 'Chưa cập nhật'],
        ['Phương thức thanh toán', paymentLabel],
        [isVnpayPayment ? 'Mã thanh toán VNPay' : 'Nội dung chuyển khoản', isVnpayPayment ? (order.vnpayTxnRef || 'Chưa ghi nhận') : (transferNote || 'Không có')],
        ['Mã giao dịch', order.paymentReference || 'Chưa ghi nhận'],
        ...(isVnpayPayment ? [
            ['VNPay TransactionNo', order.vnpayTransactionNo || 'Chưa ghi nhận'],
            ['VNPay Response', [order.vnpayResponseCode, order.vnpayTransactionStatus].filter(Boolean).join(' / ') || 'Chưa ghi nhận']
        ] : []),
        ['Thời gian nhận tiền', order.paymentReceivedAt ? formatProfileListingDate(order.paymentReceivedAt) : 'Chưa ghi nhận'],
        ['Chứng từ chuyển khoản', order.transferProofFileName
            ? `${order.transferProofFileName}${order.transferProofUploadedAt ? ` - ${formatProfileListingDate(order.transferProofUploadedAt)}` : ''}`
            : 'Chưa tải chứng từ']
    ];
    const refundRows = [
        ['Số tiền hoàn cọc', Number(order.refundAmount || 0) > 0 ? formatProfileMoney(order.refundAmount) : 'Chưa ghi nhận'],
        ['Mã giao dịch hoàn cọc', order.refundReference || 'Chưa ghi nhận'],
        ['Thời gian hoàn cọc', order.refundCompletedAt ? formatProfileListingDate(order.refundCompletedAt) : 'Chưa ghi nhận'],
        ['Người ghi nhận', order.refundConfirmedByName || 'Chưa ghi nhận'],
        ['Ghi chú hoàn cọc', order.refundNote || 'Chưa có ghi chú']
    ];
    const bankInfo = getProfileDepositBankInfo(order);
    const bankRows = order.paymentMethod === 'bank'
        ? [
            ['Ngân hàng', bankInfo.bankName || 'Chưa cấu hình'],
            ['Chủ tài khoản', bankInfo.accountName || 'Chưa cấu hình'],
            ['Số tài khoản', bankInfo.accountNumber || 'Chưa cấu hình'],
            ['Chi nhánh', bankInfo.branch || 'Không ghi nhận'],
            ['Nội dung cần ghi', transferNote || 'OKXE COC XE']
        ]
        : [];
    const statusRows = [
        ['Trạng thái hiện tại', statusLabel],
        ['Hạn giữ chỗ', order.expiresAt ? formatProfileListingDate(order.expiresAt) : 'Chưa cập nhật'],
        ['Quá hạn lúc', order.expiredAt ? formatProfileListingDate(order.expiredAt) : 'Chưa quá hạn'],
        ['Ngày tạo', formatProfileListingDate(order.createdAt)],
        ['Cập nhật gần nhất', formatProfileListingDate(order.updatedAt)],
        ['Hệ thống xác nhận', order.paymentConfirmedAt ? formatProfileListingDate(order.paymentConfirmedAt) : 'Chưa ghi nhận'],
        ['Ghi chú xử lý', order.statusNote || getProfileDepositDescription(order)]
    ];
    const actionHref = order.carId ? `/cars/${encodeURIComponent(String(order.carId))}` : '/mua-xe';

    return `
        <article class="profile-deposit-detail__card">
            <div class="profile-deposit-detail__hero">
                <div>
                    <span>${escapeHtml(order.code || 'Đơn đặt cọc')}</span>
                    <h4>${escapeHtml(carTitle)}</h4>
                    <p>${escapeHtml(getProfileDepositDescription(order))}</p>
                </div>
                <strong class="profile-listing-status ${getProfileDepositStatusClass(status)}">${escapeHtml(statusLabel)}</strong>
            </div>

            <div class="profile-deposit-detail__summary">
                <div>
                    <span>Số tiền cọc</span>
                    <strong>${escapeHtml(formatProfileMoney(order.depositAmount))}</strong>
                </div>
                <div>
                    <span>Phương thức</span>
                    <strong>${escapeHtml(paymentLabel)}</strong>
                </div>
                <div>
                    <span>Mã đơn</span>
                    <strong>${escapeHtml(order.code || `DC-${String(order.id || '').padStart(6, '0')}`)}</strong>
                </div>
            </div>

            ${renderProfileDepositBankTransferPanel(order)}

            ${renderProfileDepositNextSteps(order)}

            <section class="profile-deposit-detail__section">
                <h4>Thông tin xe</h4>
                <dl>${renderProfileDepositDetailRows(carRows)}</dl>
            </section>

            <section class="profile-deposit-detail__section">
                <h4>Thông tin khách hàng</h4>
                <dl>${renderProfileDepositDetailRows(customerRows)}</dl>
            </section>

            <section class="profile-deposit-detail__section">
                <h4>Thanh toán đặt cọc</h4>
                <dl>${renderProfileDepositDetailRows(paymentRows)}</dl>
                ${renderProfileDepositProofPanel(order)}
            </section>

            ${bankRows.length ? `
                <section class="profile-deposit-detail__section profile-deposit-detail__section--bank">
                    <h4>Thông tin ngân hàng</h4>
                    <dl>${renderProfileDepositDetailRows(bankRows)}</dl>
                </section>
            ` : ''}

            ${status === 'cancelled_after_deposit' ? `
                <section class="profile-deposit-detail__section">
                    <h4>Thông tin hoàn cọc</h4>
                    <dl>${renderProfileDepositDetailRows(refundRows)}</dl>
                </section>
            ` : ''}

            <section class="profile-deposit-detail__section">
                <h4>Trạng thái xử lý</h4>
                <dl>${renderProfileDepositDetailRows(statusRows)}</dl>
            </section>

            <section class="profile-deposit-detail__section profile-deposit-detail__section--history">
                <h4>Lịch sử xử lý</h4>
                ${renderProfileDepositHistory(order.history)}
            </section>

            <div class="profile-deposit-detail__actions">
                ${renderProfileDepositVnpayResumeButton(order)}
                ${canPrintReceipt ? `
                    <button type="button" data-profile-deposit-receipt="${escapeHtml(order.id)}">
                        <i class="bx bx-printer" aria-hidden="true"></i>
                        <span>In biên nhận</span>
                    </button>
                ` : ''}
                <a href="${escapeHtml(actionHref)}">
                    <i class="bx bx-car" aria-hidden="true"></i>
                    <span>Xem xe đặt cọc</span>
                </a>
                <button type="button" data-profile-deposit-detail-close>
                    <i class="bx bx-list-ul" aria-hidden="true"></i>
                    <span>Quay lại danh sách</span>
                </button>
            </div>
        </article>
    `;
};

const renderProfileDepositCard = (order = {}) => {
    const status = String(order.status || 'pending').trim().toLowerCase();
    const statusLabel = profileDepositStatusLabels[status] || profileDepositStatusLabels.pending;
    const paymentLabel = profileDepositPaymentLabels[order.paymentMethod] || order.paymentMethod || 'Chưa cập nhật';
    const carTitle = getProfileDepositCarTitle(order);
    const actionHref = order.carId ? `/cars/${encodeURIComponent(String(order.carId))}` : '/mua-xe';
    const transferNote = String(order.bankTransferNote || '').trim();
    const isVnpayPayment = String(order.paymentMethod || '').trim().toLowerCase() === 'vnpay';
    const expiryText = getProfileDepositExpiryText(order);
    const canPrintReceipt = ['confirmed', 'completed'].includes(status);
    const proofUrl = String(order.transferProofUrl || '').trim();
    const proofFileName = String(order.transferProofFileName || '').trim();
    const canUploadProof = canUploadProfileDepositProof(order);
    const refundCardText = status === 'cancelled_after_deposit' && Number(order.refundAmount || 0) > 0
        ? `Hoàn cọc: ${formatProfileMoney(order.refundAmount)}${order.refundReference ? ` - ${order.refundReference}` : ''}`
        : '';

    return `
        <article class="profile-listing-card profile-deposit-card" role="button" tabindex="0" data-profile-deposit-id="${escapeHtml(order.id)}" aria-label="Xem chi tiết đơn đặt cọc ${escapeHtml(order.code || '')}">
            <div class="profile-listing-card__top">
                <div>
                    <span>${escapeHtml(order.code || 'Đơn đặt cọc')}</span>
                    <h4>${escapeHtml(carTitle)}</h4>
                </div>
                <strong class="profile-listing-status ${getProfileDepositStatusClass(status)}">${escapeHtml(statusLabel)}</strong>
            </div>
            <div class="profile-listing-card__meta">
                <span>Ngày tạo: ${escapeHtml(formatProfileListingDate(order.createdAt))}</span>
                ${order.updatedAt ? `<span>Cập nhật: ${escapeHtml(formatProfileListingDate(order.updatedAt))}</span>` : ''}
            </div>
            <p>${escapeHtml(getProfileDepositDescription(order))}</p>
            <div class="profile-listing-card__chips">
                <span>${escapeHtml(formatProfileMoney(order.depositAmount))}</span>
                <span>${escapeHtml(paymentLabel)}</span>
                ${order.province ? `<span>${escapeHtml(order.province)}</span>` : ''}
                ${expiryText ? `<span>${escapeHtml(expiryText)}</span>` : ''}
            </div>
            ${isVnpayPayment
                ? `<small class="profile-listing-card__note">Thanh toán VNPay: ${escapeHtml(order.vnpayTxnRef || order.paymentReference || 'Đang chờ kết quả')}</small>`
                : transferNote ? `<small class="profile-listing-card__note">Nội dung chuyển khoản: ${escapeHtml(transferNote)}</small>` : ''}
            ${proofUrl || proofFileName ? `<small class="profile-listing-card__note">Biên lai: ${escapeHtml(proofFileName || 'Đã tải ảnh biên lai')}</small>` : ''}
            ${canUploadProof ? `<small class="profile-listing-card__note" data-profile-deposit-proof-feedback="${escapeHtml(order.id)}" aria-live="polite"></small>` : ''}
            ${refundCardText ? `<small class="profile-listing-card__note">${escapeHtml(refundCardText)}</small>` : ''}
            ${order.statusNote && !['confirmed', 'completed', 'cancelled', 'cancelled_after_deposit'].includes(status) ? `<small class="profile-listing-card__note">Ghi chú: ${escapeHtml(order.statusNote)}</small>` : ''}
            <div class="profile-listing-card__actions">
                ${renderProfileDepositVnpayResumeButton(order)}
                <button type="button" data-profile-deposit-detail="${escapeHtml(order.id)}">
                    <i class="bx bx-detail" aria-hidden="true"></i>
                    <span>Chi tiết đơn</span>
                </button>
                ${canUploadProof ? `
                    <button type="button" data-profile-deposit-proof-card-choose="${escapeHtml(order.id)}">
                        <i class="bx bx-upload" aria-hidden="true"></i>
                        <span>${proofUrl ? 'Thay biên lai' : 'Tải biên lai'}</span>
                    </button>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-profile-deposit-proof-card-input="${escapeHtml(order.id)}">
                ` : ''}
                ${canPrintReceipt ? `
                    <button type="button" data-profile-deposit-receipt="${escapeHtml(order.id)}">
                        <i class="bx bx-printer" aria-hidden="true"></i>
                        <span>In biên nhận</span>
                    </button>
                ` : ''}
                <a href="${escapeHtml(actionHref)}">
                    <i class="bx bx-car" aria-hidden="true"></i>
                    <span>Xem xe đặt cọc</span>
                </a>
            </div>
        </article>
    `;
};

const closeProfileDepositDetail = ({ shouldFocusList = true } = {}) => {
    activeProfileDepositDetailId = null;
    profileDepositsSection?.classList.remove('is-detail-open');

    if (profileDepositDetail) {
        profileDepositDetail.hidden = true;
    }

    if (shouldFocusList) {
        const firstCard = profileDepositsList?.querySelector('[data-profile-deposit-id]');
        firstCard?.focus?.();
    }
};

const openProfileDepositDetail = (orderId) => {
    const selectedOrder = depositOrdersState.find((order) =>
        String(order.id || '') === String(orderId || ''));

    if (!selectedOrder || !profileDepositDetail || !profileDepositDetailContent) {
        return;
    }

    activeProfileDepositDetailId = selectedOrder.id;
    profileDepositDetailContent.innerHTML = renderProfileDepositDetail(selectedOrder);
    profileDepositDetail.hidden = false;
    profileDepositsSection?.classList.add('is-detail-open');

    window.setTimeout(() => {
        profileDepositDetailBackButton?.focus?.();
    }, 40);
};

const renderProfileDeposits = ({ isLoading = false } = {}) => {
    if (!profileDepositsList) {
        return;
    }

    if (profileDepositCount) {
        profileDepositCount.textContent = String(depositOrdersState.length);
    }

    if (profileDepositsFilter) {
        profileDepositsFilter.value = activeProfileDepositsFilter;
    }

    if (isLoading) {
        closeProfileDepositDetail({ shouldFocusList: false });
        profileDepositsList.innerHTML = `
            <article class="profile-listings__empty">
                <i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i>
                <strong>Đang tải đơn đặt cọc</strong>
                <p>OkXe đang kiểm tra các đơn đặt cọc gắn với tài khoản này.</p>
            </article>
        `;
        return;
    }

    const filteredOrders = activeProfileDepositsFilter === 'all'
        ? depositOrdersState
        : depositOrdersState.filter((order) =>
            String(order.status || '').trim().toLowerCase() === activeProfileDepositsFilter);

    if (!filteredOrders.length) {
        closeProfileDepositDetail({ shouldFocusList: false });
        profileDepositsList.innerHTML = renderProfileDepositEmpty(
            activeProfileDepositsFilter === 'all'
                ? ''
                : `Không có đơn ở trạng thái "${profileDepositStatusLabels[activeProfileDepositsFilter] || 'đã chọn'}"`
        );
        return;
    }

    profileDepositsList.innerHTML = filteredOrders.map(renderProfileDepositCard).join('');

    if (activeProfileDepositDetailId) {
        const activeOrder = depositOrdersState.find((order) =>
            String(order.id || '') === String(activeProfileDepositDetailId || ''));

        if (activeOrder && profileDepositDetailContent) {
            profileDepositDetailContent.innerHTML = renderProfileDepositDetail(activeOrder);
        } else {
            closeProfileDepositDetail({ shouldFocusList: false });
        }
    }
};

const syncDepositOrders = async ({ isManualRefresh = false } = {}) => {
    if (!currentUser) {
        depositOrdersState = [];
        renderProfileDeposits();
        return;
    }

    if (isManualRefresh && profileDepositsRefreshButton) {
        profileDepositsRefreshButton.disabled = true;
        profileDepositsRefreshButton.innerHTML = '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang tải...</span>';
    }

    try {
        const { response, data } = await requestJson('/api/deposit-orders/my');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải đơn đặt cọc của bạn.');
        }

        depositOrdersState = Array.isArray(data.orders) ? data.orders : [];
    } catch (error) {
        depositOrdersState = [];
        if (profileDepositsList) {
            profileDepositsList.innerHTML = `
                <article class="profile-listings__empty">
                    <i class="bx bx-error-circle" aria-hidden="true"></i>
                    <strong>Không thể tải đơn đặt cọc</strong>
                    <p>${escapeHtml(error.message || 'Vui lòng thử lại sau ít phút.')}</p>
                </article>
            `;
            return;
        }
    } finally {
        if (isManualRefresh && profileDepositsRefreshButton) {
            profileDepositsRefreshButton.disabled = false;
            profileDepositsRefreshButton.innerHTML = '<i class="bx bx-refresh" aria-hidden="true"></i><span>Làm mới</span>';
        }
    }

    renderProfileDeposits();
};

const syncCarSellRequests = async () => {
    if (!currentUser) {
        carSellRequestsState = [];
        renderProfileListings();
        return;
    }

    try {
        const { response, data } = await requestJson('/api/car-sell-requests/my');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải tin bán xe của bạn.');
        }

        carSellRequestsState = Array.isArray(data.requests) ? data.requests : [];
    } catch (error) {
        carSellRequestsState = [];
    }

    renderProfileListings();
};

const syncProfileListings = async () => {
    if (!currentUser) {
        carSellRequestsState = [];
        carBuyRequestsState = [];
        carBuyRequestBudgetLabelsState = {};
        userNotificationsState = [];
        renderProfileListings();
        return;
    }

    renderProfileListings({ isLoading: true });

    await Promise.all([
        syncCarSellRequests(),
        syncCarBuyRequests(),
        syncUserNotifications()
    ]);

    renderProfileListings();
};

const closeProfileModal = () => {
    if (!profileModal) {
        return;
    }

    profileModal.classList.remove('is-open');
    profileModal.classList.remove('profile-modal--listings');
    profileModal.classList.remove('profile-modal--deposits');
    profileModal.setAttribute('aria-hidden', 'true');
    setBodyModalClass('profile-modal-open', false);
    setProfileEditPanelOpen(false);
    closeProfileDepositDetail({ shouldFocusList: false });
    setFormFeedback(profileFeedback, '');
};

const setProfileModalContentMode = (mode = 'profile') => {
    const normalizedMode = mode === true
        ? 'listings'
        : String(mode || 'profile').trim().toLowerCase();
    const isListingsMode = normalizedMode === 'listings';
    const isDepositsMode = normalizedMode === 'deposits';

    if (profileModalEyebrow) {
        profileModalEyebrow.textContent = isDepositsMode
            ? 'Đặt cọc xe'
            : isListingsMode
                ? 'Tin đăng khách hàng'
                : 'Tài khoản khách hàng';
    }

    if (profileModalTitle) {
        profileModalTitle.textContent = isDepositsMode
            ? 'Quản lý đơn đặt cọc của tôi'
            : isListingsMode
                ? 'Quản lý tin đăng của tôi'
                : 'Thông tin tài khoản của tôi';
    }

    if (profileModalDescription) {
        profileModalDescription.textContent = isDepositsMode
            ? 'Theo dõi các đơn đặt cọc giữ xe, trạng thái xác nhận tiền và ghi chú xử lý từ OkXe.'
            : isListingsMode
                ? 'Theo dõi tin bán xe, tin mua xe và trạng thái xử lý của từng tin trong tài khoản.'
                : 'Xem thông tin đang lưu trên hệ thống OkXe và cập nhật hồ sơ liên hệ khi cần.';
    }
};

const focusProfileListingsSection = ({ scrollToSection = true } = {}) => {
    const listingsSection = document.querySelector('.profile-listings');
    const dialog = profileModal?.querySelector('.profile-modal__dialog');

    if (!listingsSection || !dialog) {
        return;
    }

    window.setTimeout(() => {
        dialog.scrollTo({
            top: scrollToSection ? Math.max(listingsSection.offsetTop - 20, 0) : 0,
            behavior: scrollToSection ? 'smooth' : 'auto'
        });

        profileListingsTabs[0]?.focus({ preventScroll: true });
    }, 120);
};

const openProfileModal = ({ focusListings = false, listingsOnly = false, depositsOnly = false } = {}) => {
    if (!profileModal) {
        return;
    }

    if (!currentUser) {
        openLoginModal();
        return;
    }

    fillProfileForm(currentUser);
    closeProfileDepositDetail({ shouldFocusList: false });
    profileModal.classList.toggle('profile-modal--listings', listingsOnly && !depositsOnly);
    profileModal.classList.toggle('profile-modal--deposits', depositsOnly);
    if (profileListingsSection) {
        profileListingsSection.hidden = depositsOnly;
    }
    if (profileDepositsSection) {
        profileDepositsSection.hidden = !depositsOnly;
    }
    setProfileModalContentMode(depositsOnly ? 'deposits' : listingsOnly ? 'listings' : 'profile');
    setProfileEditPanelOpen(false);

    if (focusListings) {
        activeProfileListingsTab = 'sell';
        activeProfileListingsFilter = 'all';
    }

    if (depositsOnly) {
        activeProfileDepositsFilter = 'all';
    }

    renderProfileListings();
    renderProfileDeposits();
    profileModal.classList.add('is-open');
    profileModal.setAttribute('aria-hidden', 'false');
    setBodyModalClass('profile-modal-open', true);
    if (depositsOnly) {
        renderProfileDeposits({ isLoading: true });
        syncDepositOrders();
    } else {
        syncProfileListings();
    }

    if (depositsOnly) {
        profileDepositsFilter?.focus();
    } else if (focusListings) {
        focusProfileListingsSection({ scrollToSection: !listingsOnly });
    } else if (profileEditToggle) {
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
        depositOrdersState = [];
        renderProfileDeposits();
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
        carBuyRequestBudgetLabelsState = {};
        renderProfileListings();
        renderPromotionNotifications();
        return;
    }

    try {
        const { response, data } = await requestJson('/api/car-buy-requests/my');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải tin mua xe của bạn.');
        }

        carBuyRequestsState = Array.isArray(data.requests) ? data.requests : [];
        carBuyRequestBudgetLabelsState = data.budgetRanges && typeof data.budgetRanges === 'object'
            ? data.budgetRanges
            : {};
    } catch (error) {
        carBuyRequestsState = [];
        carBuyRequestBudgetLabelsState = {};
    }

    renderProfileListings();
    renderPromotionNotifications();
};

const syncUserNotifications = async () => {
    if (!currentUser) {
        userNotificationsState = [];
        renderProfileListings();
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

    renderProfileListings();
    renderPromotionNotifications();
};

const syncCurrentUser = async () => {
    try {
        const { response, data } = await requestJson('/api/auth/me');

        if (!response.ok || !data.user) {
            updateAuthUi(null);
            await syncFavoriteCars();
            await syncTestDriveAppointments();
            await syncCarSellRequests();
            await syncCarBuyRequests();
            await syncUserNotifications();
            return;
        }

        updateAuthUi(data.user);
        await syncFavoriteCars();
        await syncTestDriveAppointments();
        await syncCarSellRequests();
        await syncCarBuyRequests();
        await syncUserNotifications();
    } catch (error) {
        updateAuthUi(null);
        await syncFavoriteCars();
        await syncTestDriveAppointments();
        await syncCarSellRequests();
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

listingOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        closeAccountMenu();
        openProfileModal({ focusListings: true, listingsOnly: true });
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

depositOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        closeAccountMenu();
        openProfileModal({ depositsOnly: true });
    });
});

profileDepositsFilter?.addEventListener('change', () => {
    activeProfileDepositsFilter = profileDepositsFilter.value || 'all';
    closeProfileDepositDetail({ shouldFocusList: false });
    renderProfileDeposits();
});

profileDepositsRefreshButton?.addEventListener('click', () => {
    syncDepositOrders({ isManualRefresh: true });
});

profileDepositsList?.addEventListener('click', (event) => {
    const resumeVnpayButton = event.target.closest('[data-profile-deposit-vnpay-resume]');
    const receiptButton = event.target.closest('[data-profile-deposit-receipt]');
    const detailButton = event.target.closest('[data-profile-deposit-detail]');
    const proofChooseButton = event.target.closest('[data-profile-deposit-proof-card-choose]');

    if (resumeVnpayButton) {
        event.preventDefault();
        event.stopPropagation();
        resumeProfileDepositVnpayPayment(resumeVnpayButton.dataset.profileDepositVnpayResume);
        return;
    }

    if (receiptButton) {
        event.preventDefault();
        event.stopPropagation();
        openProfileDepositReceipt(receiptButton.dataset.profileDepositReceipt);
        return;
    }

    if (detailButton) {
        event.preventDefault();
        event.stopPropagation();
        openProfileDepositDetail(detailButton.dataset.profileDepositDetail);
        return;
    }

    if (proofChooseButton) {
        event.preventDefault();
        event.stopPropagation();
        const orderId = proofChooseButton.dataset.profileDepositProofCardChoose;
        const proofInput = profileDepositsList.querySelector(`[data-profile-deposit-proof-card-input="${escapeSelectorValue(orderId)}"]`);

        proofInput?.click?.();
        return;
    }

    if (event.target.closest('a, button')) {
        return;
    }

    const depositCard = event.target.closest('[data-profile-deposit-id]');

    if (depositCard) {
        openProfileDepositDetail(depositCard.dataset.profileDepositId);
    }
});

profileDepositsList?.addEventListener('change', async (event) => {
    const proofInput = event.target.closest('[data-profile-deposit-proof-card-input]');

    if (!proofInput) {
        return;
    }

    const orderId = proofInput.dataset.profileDepositProofCardInput;
    const file = proofInput.files?.[0] || null;
    const chooseButton = profileDepositsList.querySelector(`[data-profile-deposit-proof-card-choose="${escapeSelectorValue(orderId)}"]`);

    if (!file) {
        return;
    }

    chooseButton?.setAttribute('disabled', 'disabled');
    setProfileDepositProofFeedback(orderId, 'Đang tải ảnh biên lai...', 'loading');

    try {
        const data = await uploadProfileDepositProof(orderId, file);

        showToast(data.message || 'Đã tải ảnh biên lai chuyển khoản.', 'success', 'Biên lai đặt cọc');
    } catch (error) {
        setProfileDepositProofFeedback(orderId, error.message || 'Không thể tải ảnh biên lai.', 'error');
        showToast(error.message || 'Không thể tải ảnh biên lai.', 'error', 'Biên lai đặt cọc');
    } finally {
        if (proofInput) {
            proofInput.value = '';
        }
        chooseButton?.removeAttribute('disabled');
    }
});

profileDepositsList?.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) {
        return;
    }

    const depositCard = event.target.closest('[data-profile-deposit-id]');

    if (!depositCard || event.target.closest('a, button')) {
        return;
    }

    event.preventDefault();
    openProfileDepositDetail(depositCard.dataset.profileDepositId);
});

profileDepositDetailBackButton?.addEventListener('click', () => {
    closeProfileDepositDetail();
});

profileDepositDetail?.addEventListener('click', (event) => {
    const resumeVnpayButton = event.target.closest('[data-profile-deposit-vnpay-resume]');
    const receiptButton = event.target.closest('[data-profile-deposit-receipt]');
    const proofChooseButton = event.target.closest('[data-profile-deposit-proof-choose]');
    const closeButton = event.target.closest('[data-profile-deposit-detail-close]');

    if (resumeVnpayButton) {
        event.preventDefault();
        resumeProfileDepositVnpayPayment(resumeVnpayButton.dataset.profileDepositVnpayResume);
        return;
    }

    if (receiptButton) {
        event.preventDefault();
        openProfileDepositReceipt(receiptButton.dataset.profileDepositReceipt);
        return;
    }

    if (proofChooseButton) {
        event.preventDefault();
        const orderId = proofChooseButton.dataset.profileDepositProofChoose;
        const proofInput = profileDepositDetail.querySelector(`[data-profile-deposit-proof-input="${escapeSelectorValue(orderId)}"]`);

        proofInput?.click?.();
        return;
    }

    if (closeButton) {
        event.preventDefault();
        closeProfileDepositDetail();
    }
});

profileDepositDetail?.addEventListener('change', async (event) => {
    const proofInput = event.target.closest('[data-profile-deposit-proof-input]');

    if (!proofInput) {
        return;
    }

    const orderId = proofInput.dataset.profileDepositProofInput;
    const file = proofInput.files?.[0] || null;
    const chooseButton = profileDepositDetail.querySelector(`[data-profile-deposit-proof-choose="${escapeSelectorValue(orderId)}"]`);

    if (!file) {
        return;
    }

    chooseButton?.setAttribute('disabled', 'disabled');
    setProfileDepositProofFeedback(orderId, 'Đang tải ảnh biên lai...', 'loading');

    try {
        const data = await uploadProfileDepositProof(orderId, file);

        showToast(data.message || 'Đã tải ảnh biên lai chuyển khoản.', 'success', 'Biên lai đặt cọc');
        setProfileDepositProofFeedback(orderId, data.message || 'Đã tải ảnh biên lai chuyển khoản.', 'success');
    } catch (error) {
        setProfileDepositProofFeedback(orderId, error.message || 'Không thể tải ảnh biên lai.', 'error');
        showToast(error.message || 'Không thể tải ảnh biên lai.', 'error', 'Biên lai đặt cọc');
    } finally {
        if (proofInput) {
            proofInput.value = '';
        }
        chooseButton?.removeAttribute('disabled');
    }
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

profileListingsTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const nextTab = tab.dataset.profileListingsTab === 'buy' ? 'buy' : 'sell';

        if (nextTab === activeProfileListingsTab) {
            return;
        }

        activeProfileListingsTab = nextTab;
        activeProfileListingsFilter = 'all';
        renderProfileListings();
    });
});

profileListingsFilter?.addEventListener('change', () => {
    activeProfileListingsFilter = profileListingsFilter.value || 'all';
    renderProfileListings();
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
            deleteTestDriveAppointment(
                deleteAppointmentButton.dataset.deleteTestDriveAppointment,
                deleteAppointmentButton.dataset.relatedNotificationId
            );
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

            if (promotion) {
                openPromotionDetailModal(promotion);
            } else {
                window.location.href = '/khuyen-mai';
            }
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

        if (promotion) {
            openPromotionDetailModal(promotion);
        } else {
            window.location.href = '/khuyen-mai';
        }
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
                if (!redirectToAuthReturnTarget()) {
                    closeLoginModal();
                }
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
                if (!redirectToAuthReturnTarget()) {
                    closeSignupModal();
                }
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
            await syncCarSellRequests();
            await syncCarBuyRequests();
            await syncUserNotifications();
            await syncDepositOrders();
            setButtonLoading(logoutButton, false, 'Đăng xuất');
        }
    });
}

syncCars();
syncTeamMembers();
syncPromotions();
syncHomeBlog();

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
    } else if (accountAction === 'listings') {
        openProfileModal({ focusListings: true, listingsOnly: true });
    } else if (accountAction === 'deposits') {
        openProfileModal({ depositsOnly: true });
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
