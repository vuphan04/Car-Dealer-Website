const salesGrid = document.querySelector('#sales-grid');
const salesSearchInput = document.querySelector('#sales-search-input');
const salesStats = document.querySelector('#sales-stats');

let teamMembers = [];

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

const requestJson = async (url) => {
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    return { response, data };
};

const getMemberImage = (member) =>
    member.avatarUrl || '/images/team-1.jpg';

const getPhoneHref = (phone) =>
    String(phone || '').replace(/[^\d+]/g, '');

const getExperienceYears = (member) => {
    const experienceText = normalizeText(member?.salesExperience);
    const yearMatch = experienceText.match(/\d+(?:[.,]\d+)?/);

    return yearMatch ? Number(yearMatch[0].replace(',', '.')) : 0;
};

const getSalesTitleRank = (member) =>
    normalizeText(member?.salesTitle).includes('truong phong') ? 0 : 1;

const sortTeamMembers = (members = []) =>
    [...members].sort((first, second) => {
        const titleRankDifference = getSalesTitleRank(first) - getSalesTitleRank(second);

        if (titleRankDifference !== 0) {
            return titleRankDifference;
        }

        const experienceDifference = getExperienceYears(second) - getExperienceYears(first);

        if (experienceDifference !== 0) {
            return experienceDifference;
        }

        return String(first.fullName || '').localeCompare(String(second.fullName || ''), 'vi');
    });

const getBioPreview = (bio) => {
    const normalizedBio = String(bio || '').trim();
    const maxLength = 145;
    const hasMore = normalizedBio.length > maxLength;

    return {
        fullText: normalizedBio,
        previewText: hasMore ? `${normalizedBio.slice(0, maxLength).trim()}...` : normalizedBio,
        hasMore
    };
};

const renderEmptyState = (title, message, icon = 'bx-user-x') => {
    if (!salesGrid) {
        return;
    }

    salesGrid.innerHTML = `
        <article class="sales-empty">
            <i class="bx ${icon}" aria-hidden="true"></i>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(message)}</p>
        </article>
    `;
};

const getFilteredMembers = () => {
    const keyword = normalizeText(salesSearchInput?.value);

    if (!keyword) {
        return sortTeamMembers(teamMembers);
    }

    return sortTeamMembers(teamMembers.filter((member) => normalizeText([
        member.fullName,
        member.email,
        member.phone,
        member.salesTitle,
        member.salesExperience,
        member.salesBio
    ].join(' ')).includes(keyword)));
};

const renderStats = (visibleMembers) => {
    if (!salesStats) {
        return;
    }

    const managerCount = teamMembers.filter((member) =>
        normalizeText(member.salesTitle).includes('truong phong')
    ).length;

    salesStats.innerHTML = `
        <span>${visibleMembers.length}/${teamMembers.length} tư vấn</span>
        <span>${managerCount} trưởng nhóm</span>
    `;
};

const renderMemberCard = (member) => {
    const fullName = member.fullName || 'Tư vấn bán hàng OkXe';
    const salesTitle = member.salesTitle || 'Nhân viên kinh doanh';
    const experience = member.salesExperience || 'Tư vấn xe cũ chuyên nghiệp';
    const bio = member.salesBio || 'Sẵn sàng hỗ trợ khách hàng chọn xe phù hợp nhu cầu và ngân sách.';
    const phone = String(member.phone || '').trim();
    const email = String(member.email || '').trim();
    const phoneHref = getPhoneHref(phone);
    const bioPreview = getBioPreview(bio);

    return `
        <article class="sales-card">
            <div class="sales-card__media">
                <img src="${escapeHtml(getMemberImage(member))}" alt="${escapeHtml(fullName)}">
            </div>
            <div class="sales-card__body">
                <span class="sales-card__role">${escapeHtml(salesTitle)}</span>
                <h2>${escapeHtml(fullName)}</h2>
                <p class="sales-card__experience">${escapeHtml(experience)}</p>
                <div class="sales-card__bio-wrap">
                    <p class="sales-card__bio" data-preview-bio="${escapeHtml(bioPreview.previewText)}" data-full-bio="${escapeHtml(bioPreview.fullText)}">${escapeHtml(bioPreview.previewText)}</p>
                    ${bioPreview.hasMore ? `
                        <button type="button" class="sales-card__bio-toggle" data-toggle-sales-bio aria-expanded="false">
                            Xem thêm
                        </button>
                    ` : ''}
                </div>
                <dl class="sales-card__meta">
                    <div>
                        <dt>Điện thoại/Zalo</dt>
                        <dd>${phone ? escapeHtml(phone) : 'Chưa cập nhật'}</dd>
                    </div>
                    <div>
                        <dt>Email</dt>
                        <dd>${email ? escapeHtml(email) : 'Chưa cập nhật'}</dd>
                    </div>
                </dl>
                <div class="sales-card__actions">
                    ${phone ? `
                        <a href="tel:${escapeHtml(phoneHref)}" class="sales-card__action">
                            <i class="bx bx-phone-call" aria-hidden="true"></i>
                            <span>Gọi ngay</span>
                        </a>
                    ` : ''}
                    ${email ? `
                        <a href="mailto:${escapeHtml(email)}" class="sales-card__action sales-card__action--mail">
                            <i class="bx bx-envelope" aria-hidden="true"></i>
                            <span>Email</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
};

const renderTeamMembers = () => {
    const visibleMembers = getFilteredMembers();
    renderStats(visibleMembers);

    if (!visibleMembers.length) {
        renderEmptyState(
            teamMembers.length ? 'Không tìm thấy tư vấn phù hợp' : 'Chưa có tư vấn bán hàng',
            teamMembers.length ? 'Hãy thử tìm bằng tên, chức danh hoặc số điện thoại khác.' : 'Admin chưa thêm nhân viên kinh doanh công khai.'
        );
        return;
    }

    salesGrid.innerHTML = visibleMembers.map(renderMemberCard).join('');
};

const loadTeamMembers = async () => {
    try {
        const { response, data } = await requestJson('/api/team-members/all');

        if (!response.ok) {
            throw new Error(data.message || 'Không thể tải danh sách tư vấn.');
        }

        teamMembers = sortTeamMembers(Array.isArray(data.teamMembers) ? data.teamMembers : []);
        renderTeamMembers();
    } catch (error) {
        if (salesStats) {
            salesStats.innerHTML = '<span>Không thể tải dữ liệu</span>';
        }

        renderEmptyState('Không thể tải danh sách tư vấn', error.message || 'Vui lòng thử lại sau.', 'bx-error-circle');
    }
};

salesSearchInput?.addEventListener('input', renderTeamMembers);
salesGrid?.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('[data-toggle-sales-bio]');

    if (!toggleButton) {
        return;
    }

    const bioWrap = toggleButton.closest('.sales-card__bio-wrap');
    const bioText = bioWrap?.querySelector('.sales-card__bio');
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';

    if (!bioText) {
        return;
    }

    bioText.textContent = isExpanded
        ? bioText.dataset.previewBio || ''
        : bioText.dataset.fullBio || '';
    bioText.classList.toggle('is-expanded', !isExpanded);
    toggleButton.textContent = isExpanded ? 'Xem thêm' : 'Thu gọn';
    toggleButton.setAttribute('aria-expanded', String(!isExpanded));
});
loadTeamMembers();
