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

const getPhoneHref = (phone) => {
    const normalizedPhone = String(phone || '').replace(/[^\d+]/g, '');
    return normalizedPhone ? `tel:${normalizedPhone}` : '';
};

const getMailHref = (email) => {
    const normalizedEmail = String(email || '').trim();
    return normalizedEmail ? `mailto:${normalizedEmail}` : '';
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
        const phoneHref = getPhoneHref(request.phone);
        const mailHref = getMailHref(request.email);
        const contactActions = [
            phoneHref ? `<a href="${escapeHtml(phoneHref)}"><i class="bx bx-phone" aria-hidden="true"></i><span>Gọi khách</span></a>` : '',
            mailHref ? `<a href="${escapeHtml(mailHref)}"><i class="bx bx-envelope" aria-hidden="true"></i><span>Gửi email</span></a>` : ''
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
                    </div>
                </div>
                <div class="buy-request-contact">
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

renderBudgetFilters();
loadBuyRequests();
