const budgetOptionsContainer = document.querySelector('#buy-request-budget-options');
const provinceFilter = document.querySelector('#buy-request-province-filter');
const requestList = document.querySelector('#buy-request-list');
const pageStatus = document.querySelector('#buy-request-page-status');
const totalStatus = document.querySelector('#buy-request-total');
const paginationTop = document.querySelector('#buy-request-pagination-top');
const paginationBottom = document.querySelector('#buy-request-pagination-bottom');
const statTotal = document.querySelector('#buy-request-stat-total');
const statProvinces = document.querySelector('#buy-request-stat-provinces');
const statLatest = document.querySelector('#buy-request-stat-latest');
const offerPanel = document.querySelector('#buy-request-offer-panel');
const offerForm = document.querySelector('#buy-request-offer-form');
const offerRequestIdInput = document.querySelector('#buy-request-offer-request-id');
const offerSummary = document.querySelector('#buy-request-offer-summary');
const offerSubmitButton = document.querySelector('#buy-request-offer-submit');
const offerFeedback = document.querySelector('#buy-request-offer-feedback');
const offerCloseButtons = document.querySelectorAll('[data-close-buy-request-offer]');

const defaultBudgetLabels = {
    'under-200': 'Dưới 200 Triệu',
    '200-400': '200-400 Triệu',
    '400-600': '400-600 Triệu',
    '600-800': '600-800 Triệu',
    '800-1000': '800-1 Tỉ',
    'over-1000': 'Trên 1 Tỉ'
};

let buyRequests = [];
let budgetLabels = { ...defaultBudgetLabels };
let activeBudget = 'all';
let activeProvince = '';
let currentPage = 1;
let activeOfferRequestId = null;
let currentUser = null;
const pageSize = 8;

const requestDateFormatter = new Intl.DateTimeFormat('vi-VN', {
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

const normalizeSearchValue = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

const requestJson = async (url) => {
    const resolvedUrl = window.location.protocol === 'file:'
        ? `http://localhost:3000${url}`
        : url;
    const response = await fetch(resolvedUrl);
    const data = await response.json().catch(() => ({}));

    return { response, data };
};

const postJson = async (url, payload) => {
    const resolvedUrl = window.location.protocol === 'file:'
        ? `http://localhost:3000${url}`
        : url;
    const response = await fetch(resolvedUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));

    return { response, data };
};

const formatDate = (value) => {
    if (!value) {
        return 'Chưa rõ';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? 'Chưa rõ' : requestDateFormatter.format(date);
};

const getLatestRequestDate = (requests) => {
    const latestTimestamp = requests.reduce((latest, request) => {
        const timestamp = new Date(request.createdAt || '').getTime();
        return Number.isNaN(timestamp) ? latest : Math.max(latest, timestamp);
    }, 0);

    return latestTimestamp ? formatDate(latestTimestamp) : 'Đang cập nhật';
};

const renderRequestStats = (requests) => {
    const provinces = new Set(requests.map((request) => String(request.province || '').trim()).filter(Boolean));

    if (statTotal) {
        statTotal.textContent = requests.length;
    }

    if (statProvinces) {
        statProvinces.textContent = provinces.size;
    }

    if (statLatest) {
        statLatest.textContent = getLatestRequestDate(requests);
    }
};

const setOfferFeedback = (message, type = 'success') => {
    if (!offerFeedback) {
        return;
    }

    offerFeedback.textContent = message || '';
    offerFeedback.className = 'buy-request-offer-feedback';

    if (message) {
        offerFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setOfferLoading = (isLoading) => {
    if (!offerSubmitButton) {
        return;
    }

    offerSubmitButton.disabled = isLoading;
    offerSubmitButton.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang gửi...</span>'
        : '<i class="bx bx-send" aria-hidden="true"></i><span>Gửi xe phù hợp</span>';
};

const getBuyRequestById = (requestId) =>
    buyRequests.find((request) => String(request.id) === String(requestId));

const isCurrentUserRequestOwner = (request) =>
    Boolean(currentUser?.id && request?.userId && String(currentUser.id) === String(request.userId));

const prefillOfferContactFields = () => {
    if (!offerForm || !currentUser) {
        return;
    }

    offerForm.elements.sellerName.value = currentUser.fullName || '';
    offerForm.elements.sellerPhone.value = currentUser.phone || '';
    offerForm.elements.sellerEmail.value = currentUser.email || '';
};

const openOfferPanel = (request) => {
    if (!offerPanel || !offerForm || !request) {
        return;
    }

    if (isCurrentUserRequestOwner(request)) {
        setOfferFeedback('Bạn là người đăng tin mua xe này nên không thể tự gửi xe phù hợp cho chính tin của mình.', 'error');
        return;
    }

    activeOfferRequestId = request.id;
    offerForm.reset();
    prefillOfferContactFields();
    setOfferFeedback('');

    if (offerRequestIdInput) {
        offerRequestIdInput.value = request.id;
    }

    if (offerSummary) {
        offerSummary.textContent = `${request.code || `MX-${request.id}`} - ${request.title || 'Khách cần mua ô tô'} - ${getBudgetLabel(request.budgetRange)}`;
    }

    offerPanel.hidden = false;
    offerPanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => {
        offerPanel.classList.add('is-visible');
        offerForm.elements.sellerName?.focus();
    });
};

const closeOfferPanel = () => {
    if (!offerPanel) {
        return;
    }

    offerPanel.classList.remove('is-visible');
    offerPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeOfferRequestId = null;
    window.setTimeout(() => {
        offerPanel.hidden = true;
    }, 220);
};

const getBudgetLabel = (budgetRange) =>
    budgetLabels[budgetRange] || defaultBudgetLabels[budgetRange] || 'Giá thỏa thuận';

const getFilteredRequests = () => {
    const provinceKey = normalizeSearchValue(activeProvince);

    return buyRequests.filter((request) => {
        const matchesBudget = activeBudget === 'all' || request.budgetRange === activeBudget;
        const matchesProvince = !provinceKey || normalizeSearchValue(request.province) === provinceKey;

        return matchesBudget && matchesProvince;
    });
};

const renderBudgetFilters = () => {
    if (!budgetOptionsContainer) {
        return;
    }

    const options = [
        ['all', 'Tất cả'],
        ...Object.entries(budgetLabels)
    ];

    budgetOptionsContainer.innerHTML = options.map(([value, label]) => `
        <button type="button" class="${value === activeBudget ? 'is-active' : ''}" data-budget-filter="${escapeHtml(value)}">
            ${escapeHtml(label)}
        </button>
    `).join('');
};

const renderProvinceOptions = () => {
    if (!provinceFilter) {
        return;
    }

    const selectedValue = provinceFilter.value || activeProvince;
    const provinces = [...new Set(buyRequests.map((request) => String(request.province || '').trim()).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, 'vi'));

    provinceFilter.innerHTML = `
        <option value="">Chọn tỉnh thành khác</option>
        ${provinces.map((province) => `
            <option value="${escapeHtml(province)}">${escapeHtml(province)}</option>
        `).join('')}
    `;
    provinceFilter.value = provinces.includes(selectedValue) ? selectedValue : '';
    activeProvince = provinceFilter.value;
};

const renderPagination = (container, totalPages) => {
    if (!container) {
        return;
    }

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    container.innerHTML = `
        <button type="button" data-page="1" ${currentPage === 1 ? 'disabled' : ''} aria-label="Trang đầu">«</button>
        <button type="button" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Trang trước">‹</button>
        ${pages.map((page) => `
            <button type="button" class="${page === currentPage ? 'is-active' : ''}" data-page="${page}" aria-label="Trang ${page}">
                ${page}
            </button>
        `).join('')}
        <button type="button" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Trang sau">›</button>
        <button type="button" data-page="${totalPages}" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Trang cuối">»</button>
    `;
};

const renderRequests = () => {
    if (!requestList) {
        return;
    }

    const filteredRequests = getFilteredRequests();
    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    renderRequestStats(filteredRequests);

    const startIndex = (currentPage - 1) * pageSize;
    const visibleRequests = filteredRequests.slice(startIndex, startIndex + pageSize);

    if (pageStatus) {
        pageStatus.textContent = `Trang ${currentPage} / ${totalPages}`;
    }

    if (totalStatus) {
        totalStatus.textContent = `Tổng số: ${filteredRequests.length} tin`;
    }

    renderPagination(paginationTop, totalPages);
    renderPagination(paginationBottom, totalPages);

    if (!visibleRequests.length) {
        requestList.innerHTML = '<p class="buy-request-empty">Chưa có tin mua ô tô phù hợp.</p>';
        return;
    }

    requestList.innerHTML = visibleRequests.map((request) => {
        const budgetLabel = getBudgetLabel(request.budgetRange);
        const contactName = request.fullName || 'Khách hàng';
        const contactText = [contactName, request.phone ? `ĐT:${request.phone}` : 'Chưa có SĐT']
            .filter(Boolean)
            .join(' - ');
        const offerCount = Number(request.offerCount || 0);
        const isOwner = isCurrentUserRequestOwner(request);
        const contactActions = [
            `<button type="button" data-offer-request-id="${escapeHtml(request.id)}" ${isOwner ? 'disabled aria-disabled="true" title="Bạn là người đăng tin mua xe này"' : ''}><i class="bx bx-car" aria-hidden="true"></i><span>${isOwner ? 'Tin mua của bạn' : 'Tôi có xe này'}</span></button>`,
            '<a href="tel:0854955761"><i class="bx bx-support" aria-hidden="true"></i><span>Liên hệ OkXe</span></a>'
        ].filter(Boolean).join('');

        return `
            <article class="buy-request-item">
                <div class="buy-request-detail">
                    <div class="buy-request-card-head">
                        <div class="buy-request-code">
                            <span>Mã tin:</span>
                            <strong>${escapeHtml(request.code || `MX-${request.id}`)}</strong>
                        </div>
                        <span class="buy-request-budget-badge">${escapeHtml(budgetLabel)}</span>
                    </div>
                    <div class="buy-request-content">
                        <h2>${escapeHtml(request.title || 'Khách cần mua ô tô')}</h2>
                        <p>${escapeHtml(request.content || 'Khách hàng chưa nhập nội dung chi tiết.')}</p>
                    </div>
                    <div class="buy-request-meta">
                        <strong><i class="bx bx-map" aria-hidden="true"></i>${escapeHtml(request.province || 'Toàn quốc')}</strong>
                        <time datetime="${escapeHtml(request.createdAt || '')}">Ngày đăng: ${escapeHtml(formatDate(request.createdAt))}</time>
                        <span class="buy-request-offer-count"><i class="bx bx-transfer-alt" aria-hidden="true"></i>${escapeHtml(offerCount)} đề xuất xe</span>
                    </div>
                </div>
                <div class="buy-request-contact">
                    <strong class="buy-request-connect-title">Kết nối giao dịch</strong>
                    <p><span class="buy-request-contact-label">Liên hệ:</span><span class="buy-request-contact-value">${escapeHtml(contactText)}</span></p>
                    <p><span class="buy-request-contact-label">Địa chỉ:</span><span class="buy-request-contact-value">${escapeHtml(request.address || request.province || 'Chưa cập nhật')}</span></p>
                    ${request.email ? `<p><span class="buy-request-contact-label">Email:</span><span class="buy-request-contact-value">${escapeHtml(request.email)}</span></p>` : ''}
                    ${contactActions ? `<div class="buy-request-contact-actions">${contactActions}</div>` : ''}
                </div>
            </article>
        `;
    }).join('');
};

const loadBuyRequests = async () => {
    try {
        const { response, data } = await requestJson('/api/car-buy-requests');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải tin mua ô tô.');
        }

        buyRequests = data.requests || [];
        budgetLabels = data.budgetRanges || defaultBudgetLabels;
        renderBudgetFilters();
        renderProvinceOptions();
        renderRequests();
    } catch (error) {
        if (requestList) {
            requestList.innerHTML = `<p class="buy-request-empty">${escapeHtml(error.message || 'Không thể tải tin mua ô tô.')}</p>`;
        }
    }
};

const loadCurrentUser = async () => {
    try {
        const { response, data } = await requestJson('/api/auth/me');
        currentUser = response.ok ? data.user || null : null;
    } catch (error) {
        currentUser = null;
    }
};

budgetOptionsContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-budget-filter]');

    if (!button) {
        return;
    }

    activeBudget = button.dataset.budgetFilter || 'all';
    currentPage = 1;
    renderBudgetFilters();
    renderRequests();
});

provinceFilter?.addEventListener('change', () => {
    activeProvince = provinceFilter.value;
    currentPage = 1;
    renderRequests();
});

requestList?.addEventListener('click', (event) => {
    const offerButton = event.target.closest('[data-offer-request-id]');

    if (!offerButton) {
        return;
    }

    if (offerButton.disabled || offerButton.getAttribute('aria-disabled') === 'true') {
        return;
    }

    const request = getBuyRequestById(offerButton.dataset.offerRequestId);
    openOfferPanel(request);
});

offerCloseButtons.forEach((button) => {
    button.addEventListener('click', closeOfferPanel);
});

offerPanel?.addEventListener('click', (event) => {
    if (event.target === offerPanel) {
        closeOfferPanel();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !offerPanel?.hidden) {
        closeOfferPanel();
    }
});

offerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setOfferFeedback('');

    const requestId = activeOfferRequestId || offerRequestIdInput?.value;
    const request = getBuyRequestById(requestId);

    if (!request) {
        setOfferFeedback('Không tìm thấy tin mua xe cần gửi đề xuất.', 'error');
        return;
    }

    if (!offerForm.checkValidity()) {
        offerForm.reportValidity();
        return;
    }

    const formData = new FormData(offerForm);
    const payload = {
        sellerName: formData.get('sellerName'),
        sellerPhone: formData.get('sellerPhone'),
        sellerEmail: formData.get('sellerEmail'),
        carBrand: formData.get('carBrand'),
        carModel: formData.get('carModel'),
        carYear: formData.get('carYear'),
        carVersion: formData.get('carVersion'),
        expectedPrice: formData.get('expectedPrice'),
        mileage: formData.get('mileage'),
        conditionNote: formData.get('conditionNote'),
        contactPreference: formData.get('contactPreference')
    };

    setOfferLoading(true);

    try {
        const { response, data } = await postJson(`/api/car-buy-requests/${request.id}/offers`, payload);

        if (!response.ok) {
            throw new Error(data.message || 'Không thể gửi đề xuất xe lúc này.');
        }

        request.offerCount = Number(request.offerCount || 0) + 1;
        renderRequests();
        setOfferFeedback(data.message || 'OkXe đã nhận đề xuất xe phù hợp.');
        window.setTimeout(closeOfferPanel, 900);
    } catch (error) {
        setOfferFeedback(error.message || 'Không thể gửi đề xuất xe lúc này.', 'error');
    } finally {
        setOfferLoading(false);
    }
});

[paginationTop, paginationBottom].forEach((container) => {
    container?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-page]');

        if (!button) {
            return;
        }

        currentPage = Number(button.dataset.page || 1);
        renderRequests();
        requestList?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

const initBuyRequestPage = async () => {
    renderBudgetFilters();
    await loadCurrentUser();
    await loadBuyRequests();
};

initBuyRequestPage();
