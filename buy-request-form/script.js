const buyRequestForm = document.querySelector('#buy-request-form');
const buyRequestSubmit = document.querySelector('#buy-request-submit');
const buyRequestFeedback = document.querySelector('#buy-request-form-feedback');

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

const requestJson = async (url, options = {}) => {
    const resolvedUrl = window.location.protocol === 'file:'
        ? `http://localhost:3000${url}`
        : url;
    const requestOptions = {
        method: options.method || 'GET',
        headers: { ...(options.headers || {}) }
    };

    if (options.body) {
        requestOptions.body = options.body;
        requestOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(resolvedUrl, requestOptions);
    const data = await response.json().catch(() => ({}));

    return { response, data };
};

const setFeedback = (message, type = 'success') => {
    if (!buyRequestFeedback) {
        return;
    }

    buyRequestFeedback.textContent = message || '';
    buyRequestFeedback.className = 'buy-request-form-feedback';

    if (message) {
        buyRequestFeedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setSubmitLoading = (isLoading) => {
    if (!buyRequestSubmit) {
        return;
    }

    buyRequestSubmit.disabled = isLoading;
    buyRequestSubmit.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang đăng...</span>'
        : '<i class="bx bx-send" aria-hidden="true"></i><span>Đăng tin</span>';
};

const fillUserInfo = async () => {
    if (!buyRequestForm) {
        return;
    }

    try {
        const { response, data } = await requestJson('/api/auth/me');

        if (!response.ok || !data.user) {
            return;
        }

        const user = data.user;
        buyRequestForm.elements.fullName.value = user.fullName || '';
        buyRequestForm.elements.phone.value = user.phone || '';
        buyRequestForm.elements.email.value = user.email || '';
        buyRequestForm.elements.province.value = user.address?.province || '';
        buyRequestForm.elements.address.value = [
            user.address?.detail,
            user.address?.ward,
            user.address?.district,
            user.address?.province
        ].filter(Boolean).join(', ');
    } catch (error) {
        // Khách vãng lai vẫn có thể đăng tin mua xe.
    }
};

buyRequestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFeedback('');

    const formData = new FormData(buyRequestForm);
    const payload = {
        budgetRange: formData.get('budgetRange'),
        title: formData.get('title'),
        content: formData.get('content'),
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        province: formData.get('province'),
        address: formData.get('address')
    };

    setSubmitLoading(true);

    try {
        const { response, data } = await requestJson('/api/car-buy-requests', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(data.message || 'Không thể đăng tin mua xe lúc này.');
        }

        buyRequestForm.reset();
        setFeedback(data.message || 'Đăng tin mua xe thành công. Tin đang chờ duyệt.');
        buyRequestFeedback.innerHTML = `${escapeHtml(data.message || 'Đăng tin mua xe thành công. Tin đang chờ duyệt.')} <a href="/Car-Dealer-Website/tin-mua-o-to">Xem danh sách tin mua xe</a>`;
        await fillUserInfo();
        buyRequestForm.elements.budgetRange.focus();
    } catch (error) {
        setFeedback(error.message || 'Không thể đăng tin mua xe lúc này.', 'error');
    } finally {
        setSubmitLoading(false);
    }
});

fillUserInfo();
