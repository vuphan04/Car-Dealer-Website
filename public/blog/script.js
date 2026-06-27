(function () {
    const fallbackPosts = Array.isArray(window.OKXE_BLOG_POSTS) ? window.OKXE_BLOG_POSTS : [];
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
    let posts = [];
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

    const getApiUrl = (path) =>
        window.location.protocol === 'file:' ? `http://localhost:3000${path}` : path;

    const normalizePost = (post) => ({
        ...post,
        image: post.image || post.imageUrl || '/images/blog-1.jpg',
        imageUrl: post.imageUrl || post.image || '/images/blog-1.jpg',
        author: post.author || post.authorName || 'Ban biên tập OkXe',
        authorName: post.authorName || post.author || 'Ban biên tập OkXe',
        readTime: Number(post.readTime || 5),
        publishedAt: String(post.publishedAt || '').slice(0, 10),
        featured: Boolean(post.featured)
    });

    const loadBlogPosts = async () => {
        try {
            const response = await fetch(getApiUrl('/api/blog/posts'));
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tải bài viết.');
            }

            const apiPosts = Array.isArray(data.posts) ? data.posts : [];
            posts = (apiPosts.length ? apiPosts : fallbackPosts).map(normalizePost);
        } catch (error) {
            posts = fallbackPosts.map(normalizePost);
        }
    };

    const formatDate = (value) => {
        const dateValue = String(value || '').slice(0, 10);
        const date = new Date(`${dateValue}T00:00:00`);
        return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
    };

    const renderMeta = (post) => `
        <span><i class="bx bx-calendar" aria-hidden="true"></i>${escapeHtml(formatDate(post.publishedAt))}</span>
        <span><i class="bx bx-time-five" aria-hidden="true"></i>${escapeHtml(post.readTime)} phút đọc</span>
        <span><i class="bx bx-user" aria-hidden="true"></i>${escapeHtml(post.authorName || post.author)}</span>
    `;

    const updateFeaturedControls = () => {
        if (!featuredRoot) {
            return;
        }

        const viewport = featuredRoot.querySelector('.blog-featured-carousel__viewport');
        const previous = featuredRoot.querySelector('[data-blog-featured-direction="-1"]');
        const next = featuredRoot.querySelector('[data-blog-featured-direction="1"]');
        const dots = Array.from(featuredRoot.querySelectorAll('[data-blog-featured-index]'));

        if (!viewport || !previous || !next) {
            return;
        }

        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        const activeIndex = Math.round(viewport.scrollLeft / Math.max(viewport.clientWidth, 1));

        previous.disabled = viewport.scrollLeft <= 1;
        next.disabled = viewport.scrollLeft >= maxScroll - 1 || maxScroll <= 1;
        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === activeIndex);
            dot.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
        });
    };

    const renderFeatured = () => {
        const featuredPosts = posts.filter((post) => post.featured);
        const carouselPosts = (featuredPosts.length ? featuredPosts : posts.slice(0, 3)).slice(0, 6);

        if (!featuredRoot || !carouselPosts.length) {
            return;
        }

        const cards = carouselPosts.map((post) => `
            <a class="blog-featured-card" href="/blog/${encodeURIComponent(post.slug)}" aria-label="Đọc bài nổi bật ${escapeHtml(post.title)}">
                <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}">
                <div class="blog-featured-card__content">
                    <span class="blog-featured-card__tag">Bài viết nổi bật</span>
                    <h2>${escapeHtml(post.title)}</h2>
                    <p>${escapeHtml(post.excerpt)}</p>
                    <div class="blog-featured-card__meta">${renderMeta(post)}</div>
                </div>
            </a>
        `).join('');
        const dots = carouselPosts.map((post, index) => `
            <button type="button" data-blog-featured-index="${index}" aria-label="Xem bài nổi bật ${escapeHtml(post.title)}"></button>
        `).join('');

        featuredRoot.innerHTML = `
            <div class="blog-featured-carousel">
                <button type="button" class="blog-featured-carousel__button blog-featured-carousel__button--prev" data-blog-featured-direction="-1" aria-label="Bài nổi bật trước">
                    <i class="bx bx-chevron-left" aria-hidden="true"></i>
                </button>
                <div class="blog-featured-carousel__viewport">${cards}</div>
                <button type="button" class="blog-featured-carousel__button blog-featured-carousel__button--next" data-blog-featured-direction="1" aria-label="Bài nổi bật tiếp theo">
                    <i class="bx bx-chevron-right" aria-hidden="true"></i>
                </button>
                <div class="blog-featured-carousel__dots">${dots}</div>
            </div>
        `;

        const viewport = featuredRoot.querySelector('.blog-featured-carousel__viewport');
        viewport?.addEventListener('scroll', updateFeaturedControls, { passive: true });
        window.requestAnimationFrame(updateFeaturedControls);
    };

    const renderCategories = () => {
        if (!categoryFilter) {
            return;
        }

        const categories = ['Tất cả', ...new Set(posts.map((post) => post.category).filter(Boolean))];
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
            const searchMatches = !keyword || normalizeText(`${post.title} ${post.excerpt} ${post.category} ${post.authorName}`).includes(keyword);
            return categoryMatches && searchMatches;
        });
    };

    const renderPosts = () => {
        if (!postGrid) {
            return;
        }

        const filteredPosts = getFilteredPosts();
        if (resultCount) {
            resultCount.textContent = `${filteredPosts.length} bài viết`;
        }

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
                <a class="blog-card__media" href="/blog/${encodeURIComponent(post.slug)}" aria-label="Đọc bài ${escapeHtml(post.title)}">
                    <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" loading="lazy">
                </a>
                <div class="blog-card__body">
                    <span class="blog-card__category">${escapeHtml(post.category)}</span>
                    <h3><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h3>
                    <p>${escapeHtml(post.excerpt)}</p>
                    <div class="blog-card__meta">
                        <span><i class="bx bx-calendar" aria-hidden="true"></i>${escapeHtml(formatDate(post.publishedAt))}</span>
                        <span><i class="bx bx-time-five" aria-hidden="true"></i>${escapeHtml(post.readTime)} phút</span>
                        <span><i class="bx bx-user" aria-hidden="true"></i>${escapeHtml(post.authorName || post.author)}</span>
                    </div>
                    <a class="blog-card__read" href="/blog/${encodeURIComponent(post.slug)}">
                        <span>Đọc bài viết</span>
                        <i class="bx bx-right-arrow-alt" aria-hidden="true"></i>
                    </a>
                </div>
            </article>
        `).join('');
    };

    featuredRoot?.addEventListener('click', (event) => {
        const directionButton = event.target.closest('[data-blog-featured-direction]');
        const dotButton = event.target.closest('[data-blog-featured-index]');
        const viewport = featuredRoot.querySelector('.blog-featured-carousel__viewport');

        if (directionButton && viewport) {
            viewport.scrollBy({
                left: Number(directionButton.dataset.blogFeaturedDirection || 1) * viewport.clientWidth,
                behavior: 'smooth'
            });
            return;
        }

        if (dotButton && viewport) {
            viewport.scrollTo({
                left: Number(dotButton.dataset.blogFeaturedIndex || 0) * viewport.clientWidth,
                behavior: 'smooth'
            });
        }
    });

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

    const initializeBlogPage = async () => {
        await loadBlogPosts();
        renderFeatured();
        renderCategories();
        renderPosts();
    };

    initializeBlogPage();
})();
