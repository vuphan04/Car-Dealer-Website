const nav = document.querySelector('.promo-nav');
const menuToggle = document.querySelector('.promo-menu-toggle');
const promotionGrid = document.querySelector('#promotion-grid');
const promotionSearchInput = document.querySelector('#promotion-search-input');
const promotionTotalCount = document.querySelector('#promo-total-count');
const promotionDetailModal = document.querySelector('#promotion-detail-modal');
const promotionDetailContent = document.querySelector('#promotion-detail-content');
const promotionDetailCloseButtons = document.querySelectorAll('[data-close-promotion-detail]');

let promotions = [];

const promotionDateFormatter = new Intl.DateTimeFormat('vi-VN', {
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

const requestJson = async (url, options = {}) => {
    const resolvedUrl = window.location.protocol === 'file:'
        ? `http://localhost:3000${url}`
        : url;
    const response = await fetch(resolvedUrl, options);
    const data = await response.json().catch(() => ({}));

    return { response, data };
};

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
    const content = String(promotion?.content || promotion?.summary || '').trim().replace(/\s+/g, ' ');

    if (!content) {
        return '';
    }

    return content.length > 170 ? `${content.slice(0, 170)}...` : content;
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
            promotion.ctaText
        ].join(' ').toLowerCase().includes(keyword)
    );
};

const renderPromotions = () => {
    if (!promotionGrid) {
        return;
    }

    const filteredPromotions = getFilteredPromotions();

    if (promotionTotalCount) {
        promotionTotalCount.textContent = String(promotions.length);
    }

    if (!filteredPromotions.length) {
        promotionGrid.innerHTML = `
            <article class="promotion-page-empty">
                <i class="bx bx-search-alt" aria-hidden="true"></i>
                <strong>Không tìm thấy khuyến mại phù hợp</strong>
                <p>Thử tìm bằng từ khóa khác hoặc quay lại sau khi OkXe cập nhật thêm ưu đãi mới.</p>
            </article>
        `;
        return;
    }

    promotionGrid.innerHTML = filteredPromotions.map((promotion) => {
        const imageUrl = String(promotion.imageUrl || '').trim();
        const preview = getPromotionPreview(promotion);

        return `
            <article class="promotion-card" role="button" tabindex="0" data-promotion-id="${escapeHtml(String(promotion.id || ''))}" aria-label="Xem chi tiết ${escapeHtml(promotion.title || 'khuyến mại OkXe')}">
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
                    ${preview ? `<p>${escapeHtml(preview)}</p>` : ''}
                    <div class="promotion-card__footer">
                        <small>Nhấn để xem chi tiết</small>
                        <button type="button" data-view-promotion="${escapeHtml(String(promotion.id || ''))}">
                            <span>Chi tiết</span>
                            <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
};

const openPromotionDetailModal = (promotion) => {
    if (!promotionDetailModal || !promotionDetailContent || !promotion) {
        return;
    }

    const imageUrl = String(promotion.imageUrl || '').trim();
    const ctaUrl = promotion.ctaUrl || '/#footer';
    const ctaText = promotion.ctaText || 'Nhận tư vấn';

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
                <a class="promotion-detail__button" href="${escapeHtml(ctaUrl)}">
                    <span>${escapeHtml(ctaText)}</span>
                    <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                </a>
            </div>
        </article>
    `;

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

const loadPromotions = async () => {
    if (!promotionGrid) {
        return;
    }

    try {
        const { response, data } = await requestJson('/api/promotions/all');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách khuyến mại.');
        }

        promotions = data.promotions || [];
        renderPromotions();
    } catch (error) {
        promotionGrid.innerHTML = `
            <article class="promotion-page-empty">
                <i class="bx bx-error-circle" aria-hidden="true"></i>
                <strong>Không thể tải khuyến mại</strong>
                <p>${escapeHtml(error.message || 'Vui lòng thử lại sau ít phút.')}</p>
            </article>
        `;
    }
};

if (!menuToggle?.hasAttribute('data-responsive-nav-toggle')) {
    menuToggle?.addEventListener('click', () => {
        const isOpen = nav?.classList.toggle('is-open');

        menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
        menuToggle.innerHTML = isOpen
            ? '<i class="bx bx-x"></i>'
            : '<i class="bx bx-menu"></i>';
    });
}

promotionSearchInput?.addEventListener('input', renderPromotions);

promotionGrid?.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-promotion-id], [data-view-promotion]');

    if (!trigger) {
        return;
    }

    const promotionId = trigger.dataset.promotionId || trigger.dataset.viewPromotion;
    const promotion = promotions.find((item) => String(item.id || '') === String(promotionId || ''));

    openPromotionDetailModal(promotion);
});

promotionGrid?.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) {
        return;
    }

    const trigger = event.target.closest('[data-promotion-id]');

    if (!trigger) {
        return;
    }

    event.preventDefault();
    const promotion = promotions.find((item) =>
        String(item.id || '') === String(trigger.dataset.promotionId || '')
    );

    openPromotionDetailModal(promotion);
});

promotionDetailCloseButtons.forEach((button) => {
    button.addEventListener('click', closePromotionDetailModal);
});

promotionDetailModal?.addEventListener('click', (event) => {
    if (event.target === promotionDetailModal) {
        closePromotionDetailModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && promotionDetailModal?.classList.contains('is-open')) {
        closePromotionDetailModal();
    }
});

loadPromotions();
