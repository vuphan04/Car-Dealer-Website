(function () {
    const posts = Array.isArray(window.OKXE_BLOG_POSTS) ? window.OKXE_BLOG_POSTS : [];
    const featuredRoot = document.querySelector('#blog-featured');
    const postGrid = document.querySelector('#blog-post-grid');
    const categoryFilter = document.querySelector('#blog-category-filter');
    const searchInput = document.querySelector('#blog-search-input');
    const resultCount = document.querySelector('#blog-result-count');
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    let activeCategory = 'Tất cả';

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

    const normalizeText = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('vi-VN');

    const formatDate = (value) => {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
    };

    const renderMeta = (post) => `
        <span><i class="bx bx-calendar" aria-hidden="true"></i>${escapeHtml(formatDate(post.publishedAt))}</span>
        <span><i class="bx bx-time-five" aria-hidden="true"></i>${escapeHtml(post.readTime)} phút đọc</span>
        <span><i class="bx bx-user" aria-hidden="true"></i>${escapeHtml(post.author)}</span>
    `;

    const renderFeatured = () => {
        const featured = posts.find((post) => post.featured) || posts[0];

        if (!featuredRoot || !featured) {
            return;
        }

        featuredRoot.innerHTML = `
            <a class="blog-featured-card" href="/Car-Dealer-Website/blog/${encodeURIComponent(featured.slug)}" aria-label="Đọc bài nổi bật ${escapeHtml(featured.title)}">
                <img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.imageAlt || featured.title)}">
                <div class="blog-featured-card__content">
                    <span class="blog-featured-card__tag">Bài viết nổi bật</span>
                    <h2>${escapeHtml(featured.title)}</h2>
                    <p>${escapeHtml(featured.excerpt)}</p>
                    <div class="blog-featured-card__meta">${renderMeta(featured)}</div>
                </div>
            </a>
        `;
    };

    const renderCategories = () => {
        if (!categoryFilter) {
            return;
        }

        const categories = ['Tất cả', ...new Set(posts.map((post) => post.category))];
        categoryFilter.innerHTML = categories.map((category) => `
            <button type="button" class="${category === activeCategory ? 'is-active' : ''}" data-blog-category="${escapeHtml(category)}" aria-pressed="${category === activeCategory}">
                ${escapeHtml(category)}
            </button>
        `).join('');
    };

    const getFilteredPosts = () => {
        const keyword = normalizeText(searchInput?.value);

        return posts.filter((post) => {
            const categoryMatches = activeCategory === 'Tất cả' || post.category === activeCategory;
            const searchMatches = !keyword || normalizeText(`${post.title} ${post.excerpt} ${post.category}`).includes(keyword);
            return categoryMatches && searchMatches;
        });
    };

    const renderPosts = () => {
        if (!postGrid) {
            return;
        }

        const filteredPosts = getFilteredPosts();
        resultCount.textContent = `${filteredPosts.length} bài viết`;

        if (!filteredPosts.length) {
            postGrid.innerHTML = `
                <div class="blog-empty">
                    <i class="bx bx-search-alt" aria-hidden="true"></i>
                    <strong>Không tìm thấy bài viết phù hợp</strong>
                    <span>Thử từ khóa hoặc chủ đề khác.</span>
                </div>
            `;
            return;
        }

        postGrid.innerHTML = filteredPosts.map((post) => `
            <article class="blog-card">
                <a class="blog-card__media" href="/Car-Dealer-Website/blog/${encodeURIComponent(post.slug)}" aria-label="Đọc bài ${escapeHtml(post.title)}">
                    <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" loading="lazy">
                </a>
                <div class="blog-card__body">
                    <span class="blog-card__category">${escapeHtml(post.category)}</span>
                    <h3><a href="/Car-Dealer-Website/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h3>
                    <p>${escapeHtml(post.excerpt)}</p>
                    <div class="blog-card__meta">
                        <span><i class="bx bx-calendar" aria-hidden="true"></i>${escapeHtml(formatDate(post.publishedAt))}</span>
                        <span><i class="bx bx-time-five" aria-hidden="true"></i>${escapeHtml(post.readTime)} phút</span>
                    </div>
                    <a class="blog-card__read" href="/Car-Dealer-Website/blog/${encodeURIComponent(post.slug)}">
                        <span>Đọc bài viết</span>
                        <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                    </a>
                </div>
            </article>
        `).join('');
    };

    categoryFilter?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-blog-category]');

        if (!button) {
            return;
        }

        activeCategory = button.dataset.blogCategory;
        renderCategories();
        renderPosts();
    });

    searchInput?.addEventListener('input', renderPosts);
    renderFeatured();
    renderCategories();
    renderPosts();
})();
