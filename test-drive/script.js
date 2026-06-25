const testDriveForm = document.querySelector('#test-drive-form');
const testDriveAuthMessage = document.querySelector('#test-drive-auth-message');
const testDriveFullNameInput = document.querySelector('#test-drive-full-name');
const testDrivePhoneInput = document.querySelector('#test-drive-phone');
const testDriveCarSelect = document.querySelector('#test-drive-car');
const selectedTestDriveCarLabel = document.querySelector('#selected-test-drive-car');
const openTestDriveCarPickerButton = document.querySelector('#open-test-drive-car-picker');
const testDriveCarModal = document.querySelector('#test-drive-car-modal');
const testDriveCarList = document.querySelector('#test-drive-car-list');
const testDriveCarSearchInput = document.querySelector('#test-drive-car-search');
const testDriveBrandFilter = document.querySelector('#test-drive-brand-filter');
const testDriveCategoryFilter = document.querySelector('#test-drive-category-filter');
const testDriveCarViewButtons = document.querySelectorAll('[data-test-drive-car-view]');
const testDriveCarPickerCloseButtons = document.querySelectorAll('[data-close-test-drive-car-picker]');
const testDriveDateInput = document.querySelector('#test-drive-date');
const testDriveTimeSlotInput = document.querySelector('#test-drive-time-slot');
const testDriveSubmitButton = document.querySelector('#test-drive-submit');
const testDriveFeedback = document.querySelector('#test-drive-feedback');
const testDriveConsentInputs = document.querySelectorAll('[data-test-drive-consent]');
const openTestDrivePolicyButton = document.querySelector('#open-test-drive-policy');
const testDrivePolicyModal = document.querySelector('#test-drive-policy-modal');
const testDrivePolicyCloseButtons = document.querySelectorAll('[data-close-test-drive-policy]');

let testDriveCars = [];
let favoriteTestDriveCarIds = new Set();
let activeTestDriveCarView = 'all';
let selectedTestDriveCar = null;

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

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

const setFeedback = (message, type = 'error') => {
    if (!testDriveFeedback) {
        return;
    }

    testDriveFeedback.textContent = message || '';
    testDriveFeedback.className = 'test-drive-feedback';

    if (message && type === 'success') {
        testDriveFeedback.classList.add('is-success');
    }
};

const setSubmitLoading = (isLoading) => {
    if (!testDriveSubmitButton) {
        return;
    }

    testDriveSubmitButton.dataset.loading = isLoading ? 'true' : 'false';
    testDriveSubmitButton.disabled = isLoading || !areAllConsentsChecked();
    testDriveSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang gửi...</span>'
        : '<i class="bx bx-calendar-check" aria-hidden="true"></i><span>Đăng ký lái thử</span>';
};

const areAllConsentsChecked = () =>
    Array.from(testDriveConsentInputs).every((input) => input.checked);

const syncSubmitAvailability = () => {
    if (!testDriveSubmitButton) {
        return;
    }

    const isLoading = testDriveSubmitButton.dataset.loading === 'true';
    testDriveSubmitButton.disabled = isLoading || !areAllConsentsChecked();
};

const getTodayInputValue = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const normalizeSearchValue = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

const getCarImages = (car) => {
    const images = Array.isArray(car?.images) ? car.images : [];
    const fallbackImage = car?.image ? [car.image] : [];

    return [...images, ...fallbackImage].filter(Boolean);
};

const getUniqueValues = (fieldName) =>
    [...new Set(testDriveCars.map((car) => String(car[fieldName] || '').trim()).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, 'vi'));

const populateCarFilters = () => {
    if (testDriveBrandFilter) {
        testDriveBrandFilter.innerHTML = `
            <option value="">Tất cả hãng</option>
            ${getUniqueValues('brand').map((brand) => `<option value="${escapeHtml(brand)}">${escapeHtml(brand)}</option>`).join('')}
        `;
    }

    if (testDriveCategoryFilter) {
        testDriveCategoryFilter.innerHTML = `
            <option value="">Tất cả phân khúc</option>
            ${getUniqueValues('category').map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}
        `;
    }
};

const setSelectedCar = (car, shouldClose = true) => {
    selectedTestDriveCar = car || null;

    if (testDriveCarSelect) {
        testDriveCarSelect.value = selectedTestDriveCar?.id || '';
    }

    if (selectedTestDriveCarLabel) {
        selectedTestDriveCarLabel.textContent = selectedTestDriveCar
            ? [selectedTestDriveCar.brand, selectedTestDriveCar.name, selectedTestDriveCar.year].filter(Boolean).join(' - ')
            : 'Chọn xe muốn lái thử';
    }

    renderCarList();

    if (shouldClose) {
        closeCarPicker();
    }
};

const getFilteredCars = () => {
    const keyword = normalizeSearchValue(testDriveCarSearchInput?.value);
    const brand = normalizeSearchValue(testDriveBrandFilter?.value);
    const category = normalizeSearchValue(testDriveCategoryFilter?.value);

    return testDriveCars.filter((car) => {
        const isFavoriteViewMatched = activeTestDriveCarView !== 'favorites'
            || favoriteTestDriveCarIds.has(String(car.id));
        const searchText = normalizeSearchValue([
            car.brand,
            car.name,
            car.category,
            car.year,
            car.fuel,
            car.gearbox,
            car.drivetrain,
            car.price
        ].join(' '));

        return isFavoriteViewMatched
            && (!keyword || searchText.includes(keyword))
            && (!brand || normalizeSearchValue(car.brand) === brand)
            && (!category || normalizeSearchValue(car.category) === category);
    });
};

const syncCarViewButtons = () => {
    testDriveCarViewButtons.forEach((button) => {
        const isActive = button.dataset.testDriveCarView === activeTestDriveCarView;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
};

const renderCarList = () => {
    if (!testDriveCarList) {
        return;
    }

    if (!testDriveCars.length) {
        testDriveCarList.innerHTML = '<article class="test-drive-car-empty">Hiện chưa có xe còn hàng để lái thử.</article>';
        return;
    }

    const filteredCars = getFilteredCars();

    if (!filteredCars.length) {
        const emptyMessage = activeTestDriveCarView === 'favorites'
            ? 'Bạn chưa có xe yêu thích còn hàng phù hợp để lái thử.'
            : 'Không tìm thấy xe phù hợp với bộ lọc.';
        testDriveCarList.innerHTML = `<article class="test-drive-car-empty">${escapeHtml(emptyMessage)}</article>`;
        return;
    }

    testDriveCarList.innerHTML = filteredCars.map((car) => {
        const image = getCarImages(car)[0] || '/Car-Dealer-Website/images/rental-1.png';
        const isSelected = String(car.id) === String(selectedTestDriveCar?.id || '');

        return `
            <button type="button" class="test-drive-car-option${isSelected ? ' is-selected' : ''}" data-select-test-drive-car="${escapeHtml(car.id)}">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(car.name || 'Xe OkXe')}">
                <span class="test-drive-car-option__body">
                    <strong>
                        ${escapeHtml([car.brand, car.name].filter(Boolean).join(' ') || 'Xe chưa có tên')}
                        ${favoriteTestDriveCarIds.has(String(car.id)) ? '<small class="test-drive-favorite-badge"><i class="bx bxs-heart" aria-hidden="true"></i> Yêu thích</small>' : ''}
                    </strong>
                    <span>${escapeHtml([car.category, car.year, car.fuel, car.gearbox, car.drivetrain].filter(Boolean).join(' • ') || 'Chưa cập nhật')}</span>
                    <small>Trạng thái: ${escapeHtml(car.actionText || 'Còn xe')}</small>
                </span>
                <span class="test-drive-car-option__price">${escapeHtml(car.price || 'Liên hệ')}</span>
            </button>
        `;
    }).join('');
};

const renderCarOptions = () => {
    const selectedCarId = new URLSearchParams(window.location.search).get('carId');
    const matchedCar = testDriveCars.find((car) => String(car.id) === String(selectedCarId || ''));

    populateCarFilters();
    syncCarViewButtons();
    setSelectedCar(matchedCar || null, false);
    renderCarList();
};

function openCarPicker() {
    if (!testDriveCarModal) {
        return;
    }

    testDriveCarModal.classList.add('is-open');
    testDriveCarModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('test-drive-car-modal-open');
    renderCarList();
    window.setTimeout(() => {
        testDriveCarSearchInput?.focus();
    }, 80);
}

function closeCarPicker() {
    if (!testDriveCarModal) {
        return;
    }

    testDriveCarModal.classList.remove('is-open');
    testDriveCarModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('test-drive-car-modal-open');
};

function openPolicyModal() {
    if (!testDrivePolicyModal) {
        return;
    }

    testDrivePolicyModal.classList.add('is-open');
    testDrivePolicyModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('test-drive-policy-modal-open');
    window.setTimeout(() => {
        testDrivePolicyModal.querySelector('[data-close-test-drive-policy]')?.focus();
    }, 80);
}

function closePolicyModal() {
    if (!testDrivePolicyModal) {
        return;
    }

    testDrivePolicyModal.classList.remove('is-open');
    testDrivePolicyModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('test-drive-policy-modal-open');
}

const showAuthRequired = () => {
    if (testDriveForm) {
        testDriveForm.hidden = true;
    }

    if (testDriveAuthMessage) {
        testDriveAuthMessage.hidden = false;
    }
};

const showForm = () => {
    if (testDriveAuthMessage) {
        testDriveAuthMessage.hidden = true;
    }

    if (testDriveForm) {
        testDriveForm.hidden = false;
    }
};

const loadCurrentUser = async () => {
    const { response, data } = await requestJson('/api/auth/me');

    if (!response.ok || !data.user) {
        return null;
    }

    return data.user;
};

const loadAvailableCars = async () => {
    const [
        { response, data },
        favoriteResult
    ] = await Promise.all([
        requestJson('/api/test-drive/cars'),
        requestJson('/api/favorites').catch(() => ({ response: { ok: false }, data: {} }))
    ]);

    if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách xe còn hàng.');
    }

    const favoriteCars = favoriteResult.response?.ok && Array.isArray(favoriteResult.data?.cars)
        ? favoriteResult.data.cars
        : [];
    favoriteTestDriveCarIds = new Set(favoriteCars.map((car) => String(car.id)));
    testDriveCars = Array.isArray(data.cars) ? data.cars : [];
    renderCarOptions();
};

const initializeTestDrivePage = async () => {
    if (testDriveDateInput) {
        const today = getTodayInputValue();
        testDriveDateInput.min = today;
        testDriveDateInput.value = today;
    }

    try {
        const user = await loadCurrentUser();

        if (!user) {
            showAuthRequired();
            return;
        }

        showForm();

        if (testDriveFullNameInput) {
            testDriveFullNameInput.value = user.fullName || '';
        }

        if (testDrivePhoneInput) {
            testDrivePhoneInput.value = user.phone || '';
        }

        await loadAvailableCars();
    } catch (error) {
        showAuthRequired();
    }
};

testDriveForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFeedback('');

    const formData = new FormData(testDriveForm);
    const payload = {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        carId: Number(formData.get('carId') || 0),
        preferredDate: formData.get('preferredDate'),
        preferredTimeSlot: formData.get('preferredTimeSlot')
    };

    if (!payload.carId) {
        setFeedback('Vui lòng chọn xe muốn lái thử.');
        return;
    }

    if (!payload.preferredTimeSlot) {
        setFeedback('Vui lòng chọn khung giờ lái thử.');
        testDriveTimeSlotInput?.focus();
        return;
    }

    if (!areAllConsentsChecked()) {
        setFeedback('Vui lòng xác nhận đủ 3 điều kiện trước khi đăng ký lái thử.');
        syncSubmitAvailability();
        return;
    }

    setSubmitLoading(true);

    try {
        const { response, data } = await requestJson('/api/test-drive/appointments', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if (response.status === 401) {
                showAuthRequired();
            }
            throw new Error(data.message || 'Không thể đăng ký lái thử lúc này.');
        }

        setFeedback(data.message || 'Đăng ký lái thử thành công. Lịch hẹn đang chờ nhân viên xác nhận.', 'success');
        testDriveForm.reset();
        setSelectedCar(null, false);
        if (testDriveDateInput) {
            testDriveDateInput.value = getTodayInputValue();
        }
        syncSubmitAvailability();
    } catch (error) {
        setFeedback(error.message || 'Không thể đăng ký lái thử lúc này.');
    } finally {
        setSubmitLoading(false);
    }
});

testDriveConsentInputs.forEach((input) => {
    input.addEventListener('change', () => {
        setFeedback('');
        syncSubmitAvailability();
    });
});

openTestDriveCarPickerButton?.addEventListener('click', openCarPicker);
openTestDrivePolicyButton?.addEventListener('click', openPolicyModal);

testDriveCarPickerCloseButtons.forEach((button) => {
    button.addEventListener('click', closeCarPicker);
});

testDrivePolicyCloseButtons.forEach((button) => {
    button.addEventListener('click', closePolicyModal);
});

testDriveCarSearchInput?.addEventListener('input', renderCarList);
testDriveBrandFilter?.addEventListener('change', renderCarList);
testDriveCategoryFilter?.addEventListener('change', renderCarList);
testDriveCarViewButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activeTestDriveCarView = button.dataset.testDriveCarView === 'favorites' ? 'favorites' : 'all';
        syncCarViewButtons();
        renderCarList();
    });
});

testDriveCarList?.addEventListener('click', (event) => {
    const selectButton = event.target.closest('[data-select-test-drive-car]');

    if (!selectButton) {
        return;
    }

    const car = testDriveCars.find((item) =>
        String(item.id) === String(selectButton.dataset.selectTestDriveCar)
    );

    if (car) {
        setSelectedCar(car);
        setFeedback('');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && testDrivePolicyModal?.classList.contains('is-open')) {
        closePolicyModal();
        return;
    }

    if (event.key === 'Escape' && testDriveCarModal?.classList.contains('is-open')) {
        closeCarPicker();
    }
});

initializeTestDrivePage();
