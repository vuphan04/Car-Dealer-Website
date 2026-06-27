(function () {
    const articlePage = document.querySelector('#article-page');
    const fallbackPosts = Array.isArray(window.OKXE_BLOG_POSTS) ? window.OKXE_BLOG_POSTS : [];
    const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

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

    const formatDate = (value) => {
        const dateValue = String(value || '').slice(0, 10);
        const date = new Date(`${dateValue}T00:00:00`);
        return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
    };

    const updateMeta = (selector, attribute, value) => {
        const element = document.querySelector(selector);

        if (element) {
            element.setAttribute(attribute, value);
        }
    };

    const normalizeSeoText = (value, maxLength = 160) => {
        const normalizedText = String(value || '').replace(/\s+/g, ' ').trim();

        if (normalizedText.length <= maxLength) {
            return normalizedText;
        }

        return `${normalizedText.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
    };

    const setOrCreateMeta = (selector, attributes = {}) => {
        let element = document.querySelector(selector);

        if (!element) {
            element = document.createElement('meta');
            document.head.append(element);
        }

        Object.entries(attributes).forEach(([attribute, value]) => {
            element.setAttribute(attribute, value);
        });
    };

    const setOrCreateCanonical = (href) => {
        let element = document.querySelector('link[rel="canonical"]');

        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', 'canonical');
            document.head.append(element);
        }

        element.setAttribute('href', href);
    };

    const setStructuredData = (structuredData) => {
        let schema = document.querySelector('#blog-article-seo-json');

        if (!schema) {
            schema = document.createElement('script');
            schema.type = 'application/ld+json';
            schema.id = 'blog-article-seo-json';
            document.head.append(schema);
        }

        schema.textContent = JSON.stringify(structuredData);
    };

    const getAbsoluteUrl = (path) => {
        try {
            return new URL(path || '/', window.location.origin).href;
        } catch (error) {
            return window.location.origin;
        }
    };

    const getPostSortTime = (post = {}) => {
        const preferredDate = String(post.publishedAt || '').slice(0, 10);
        const fallbackDateTime = String(post.createdAt || '').replace(' ', 'T');
        const preferredTime = preferredDate ? Date.parse(`${preferredDate}T00:00:00`) : 0;
        const fallbackTime = fallbackDateTime ? Date.parse(fallbackDateTime) : 0;

        return preferredTime || fallbackTime || 0;
    };

    const getLatestPosts = (posts = [], currentSlug = slug, limit = 4) =>
        [...posts]
            .filter((post) => post.slug !== currentSlug)
            .map(normalizePost)
            .sort((first, second) =>
                getPostSortTime(second) - getPostSortTime(first)
                || Number(second.id || 0) - Number(first.id || 0)
            )
            .slice(0, limit);

    const renderNotFound = () => {
        document.title = 'Không tìm thấy bài viết | OkXe Blog';
        updateMeta('meta[name="robots"]', 'content', 'noindex, follow');
        if (!articlePage) {
            return;
        }

        articlePage.innerHTML = `
            <section class="article-not-found">
                <i class="bx bx-news" aria-hidden="true"></i>
                <h1>Không tìm thấy bài viết</h1>
                <p>Bài viết có thể đã được thay đổi đường dẫn hoặc chưa được xuất bản.</p>
                <a href="/blog"><i class="bx bx-left-arrow-alt" aria-hidden="true"></i>Quay lại Blog</a>
            </section>
        `;
    };

    const loadArticleData = async () => {
        try {
            const response = await fetch(getApiUrl(`/api/blog/posts/${encodeURIComponent(slug)}`));
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.post) {
                throw new Error(data.message || 'Không tìm thấy bài viết.');
            }

            return {
                post: normalizePost(data.post),
                relatedPosts: Array.isArray(data.relatedPosts)
                    ? data.relatedPosts.map(normalizePost)
                    : [],
                latestPosts: Array.isArray(data.latestPosts)
                    ? data.latestPosts.map(normalizePost)
                    : []
            };
        } catch (error) {
            const fallbackPost = fallbackPosts.find((item) => item.slug === slug);

            return {
                post: fallbackPost ? normalizePost(fallbackPost) : null,
                relatedPosts: fallbackPosts
                    .filter((item) => item.slug !== slug)
                    .map(normalizePost)
                    .slice(0, 3),
                latestPosts: getLatestPosts(fallbackPosts, slug)
            };
        }
    };

    const renderArticleContentBlock = (block) => {
        const normalizedBlock = String(block || '').trim();
        const imageMatch = normalizedBlock.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

        if (imageMatch) {
            const imageAlt = imageMatch[1] || 'Ảnh minh họa bài viết';
            const imageUrl = imageMatch[2];

            return `
                <figure class="article-inline-image">
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}" loading="lazy">
                </figure>
            `;
        }

        return `<p>${escapeHtml(normalizedBlock).replace(/\n/g, '<br>')}</p>`;
    };

    const renderContentSections = (content) => {
        if (Array.isArray(content)) {
            return content.map((section) => `
                <section class="article-content__section">
                    <h2>${escapeHtml(section.heading)}</h2>
                    ${(section.paragraphs || []).map(renderArticleContentBlock).join('')}
                    ${section.list?.length
                        ? `<ul>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                        : ''}
                </section>
            `).join('');
        }

        const paragraphs = String(content || '')
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);

        return `
            <section class="article-content__section">
                <h2>Nội dung chính</h2>
                ${paragraphs.map(renderArticleContentBlock).join('')}
            </section>
        `;
    };

    const renderLatestPostItems = (posts = []) => posts.slice(0, 3).map((item) => `
        <a class="article-latest-item" href="/blog/${encodeURIComponent(item.slug)}">
            <span class="article-latest-item__media">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy">
            </span>
            <span class="article-latest-item__body">
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(formatDate(item.publishedAt))}</small>
            </span>
        </a>
    `).join('');

    const renderArticleSidebar = (latestPosts = []) => `
        <aside class="article-sidebar" aria-label="Thông tin bài viết bổ sung">
            <section class="article-sidebar-card article-latest" aria-labelledby="article-latest-title">
                <h2 id="article-latest-title"><span aria-hidden="true"></span>Tin mới nhất</h2>
                <div class="article-latest__list">
                    ${latestPosts.length
                        ? renderLatestPostItems(latestPosts)
                        : '<p class="article-sidebar-empty">Chưa có tin mới để hiển thị.</p>'}
                </div>
            </section>

            <section class="article-newsletter" aria-labelledby="article-newsletter-title">
                <i class="bx bxs-paper-plane" aria-hidden="true"></i>
                <h2 id="article-newsletter-title">Nhận tin tức mới</h2>
                <p>Đăng ký để nhận thông báo về các dòng xe mới nhất.</p>
                <form class="article-newsletter__form" id="article-newsletter-form" novalidate>
                    <label class="article-newsletter__label" for="article-newsletter-email">Email của bạn</label>
                    <input type="email" id="article-newsletter-email" name="email" placeholder="Email của bạn" autocomplete="email" required>
                    <button type="submit">Gửi</button>
                </form>
                <p class="article-newsletter__message" id="article-newsletter-message" aria-live="polite"></p>
            </section>
        </aside>
    `;

    const bindNewsletterForm = () => {
        const form = document.querySelector('#article-newsletter-form');
        const input = document.querySelector('#article-newsletter-email');
        const message = document.querySelector('#article-newsletter-message');

        if (!form || !input || !message) {
            return;
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = input.value.trim();
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            message.classList.remove('is-success', 'is-error');

            if (!isValidEmail) {
                message.textContent = 'Vui lòng nhập email hợp lệ.';
                message.classList.add('is-error');
                input.focus();
                return;
            }

            message.textContent = 'OkXe đã ghi nhận email của bạn.';
            message.classList.add('is-success');
            form.reset();
        });
    };

    const updateArticleSeo = (post) => {
        const authorName = post.authorName || post.author || 'Ban biên tập OkXe';
        const canonicalUrl = getAbsoluteUrl(`/blog/${encodeURIComponent(post.slug)}`);
        const seoTitle = normalizeSeoText(`${post.title} | OkXe Blog`, 68);
        const seoDescription = normalizeSeoText(post.excerpt || `Đọc bài viết ${post.title} trên OkXe Blog.`, 158);
        const absoluteImageUrl = getAbsoluteUrl(post.image);
        const publishedTime = post.publishedAt || post.createdAt || '';
        const modifiedTime = post.updatedAt || post.publishedAt || post.createdAt || '';

        document.title = seoTitle;
        updateMeta('meta[name="description"]', 'content', seoDescription);
        setOrCreateCanonical(canonicalUrl);
        updateMeta('meta[name="robots"]', 'content', 'index, follow');
        setOrCreateMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'vi_VN' });
        setOrCreateMeta('meta[property="og:type"]', { property: 'og:type', content: 'article' });
        setOrCreateMeta('meta[property="og:title"]', { property: 'og:title', content: seoTitle });
        setOrCreateMeta('meta[property="og:description"]', { property: 'og:description', content: seoDescription });
        setOrCreateMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
        setOrCreateMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteImageUrl });
        setOrCreateMeta('meta[property="article:published_time"]', { property: 'article:published_time', content: publishedTime });
        setOrCreateMeta('meta[property="article:modified_time"]', { property: 'article:modified_time', content: modifiedTime });
        setOrCreateMeta('meta[property="article:author"]', { property: 'article:author', content: authorName });
        setOrCreateMeta('meta[property="article:section"]', { property: 'article:section', content: post.category || 'Blog ô tô' });
        setOrCreateMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
        setOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seoTitle });
        setOrCreateMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: seoDescription });
        setOrCreateMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: absoluteImageUrl });
        setStructuredData({
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'Article',
                    mainEntityOfPage: {
                        '@type': 'WebPage',
                        '@id': canonicalUrl
                    },
                    headline: post.title,
                    description: seoDescription,
                    image: [absoluteImageUrl],
                    datePublished: publishedTime,
                    dateModified: modifiedTime,
                    author: {
                        '@type': 'Person',
                        name: authorName
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'OkXe'
                    },
                    articleSection: post.category || 'Blog ô tô',
                    inLanguage: 'vi-VN'
                },
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Trang chủ',
                            item: getAbsoluteUrl('/')
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: 'Blog',
                            item: getAbsoluteUrl('/blog')
                        },
                        {
                            '@type': 'ListItem',
                            position: 3,
                            name: post.title,
                            item: canonicalUrl
                        }
                    ]
                }
            ]
        });
    };

    const renderArticle = ({ post, relatedPosts = [], latestPosts = [] }) => {
        if (!post || !articlePage) {
            renderNotFound();
            return;
        }

        const authorName = post.authorName || post.author || 'Ban biên tập OkXe';
        updateArticleSeo(post);
        const sections = renderContentSections(post.content);
        const safeRelatedPosts = relatedPosts.length
            ? relatedPosts
            : fallbackPosts
                .filter((item) => item.slug !== post.slug)
                .sort((first, second) => Number(second.category === post.category) - Number(first.category === post.category))
                .slice(0, 3)
                .map(normalizePost);
        const safeLatestPosts = latestPosts.length
            ? latestPosts
            : getLatestPosts(fallbackPosts, post.slug);

        const relatedCards = safeRelatedPosts.map((item) => `
            <article class="article-related-card">
                <a href="/blog/${encodeURIComponent(item.slug)}" class="article-related-card__media">
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy">
                </a>
                <div>
                    <span>${escapeHtml(item.category)}</span>
                    <h3><a href="/blog/${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a></h3>
                    <small>${escapeHtml(formatDate(item.publishedAt))} · ${escapeHtml(item.readTime)} phút đọc · ${escapeHtml(item.authorName || item.author)}</small>
                </div>
            </article>
        `).join('');

        articlePage.innerHTML = `
            <div class="article-layout">
                <article class="article-main">
                    <header class="article-header">
                        <nav class="article-breadcrumb" aria-label="Đường dẫn bài viết">
                            <a href="/">Trang chủ</a>
                            <i class="bx bx-chevron-right" aria-hidden="true"></i>
                            <a href="/blog">Blog</a>
                            <i class="bx bx-chevron-right" aria-hidden="true"></i>
                            <span>${escapeHtml(post.category)}</span>
                        </nav>
                        <span class="article-category">${escapeHtml(post.category)}</span>
                        <h1>${escapeHtml(post.title)}</h1>
                        <p class="article-lead">${escapeHtml(post.excerpt)}</p>
                        <div class="article-meta">
                            <span><i class="bx bx-calendar" aria-hidden="true"></i>${escapeHtml(formatDate(post.publishedAt))}</span>
                            <span><i class="bx bx-time-five" aria-hidden="true"></i>${escapeHtml(post.readTime)} phút đọc</span>
                            <span><i class="bx bx-user" aria-hidden="true"></i>${escapeHtml(authorName)}</span>
                        </div>
                    </header>

                    <figure class="article-hero">
                        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" fetchpriority="high">
                    </figure>

                    <div class="article-content">
                        ${sections}
                        <aside class="article-note">
                            <i class="bx bx-info-circle" aria-hidden="true"></i>
                            <p>Nội dung mang tính tham khảo. Với hồ sơ xe hoặc thủ tục cụ thể, bạn nên kiểm tra thông tin thực tế và quy định đang áp dụng.</p>
                        </aside>
                        <a href="/blog" class="article-back"><i class="bx bx-left-arrow-alt" aria-hidden="true"></i>Quay lại danh sách bài viết</a>
                    </div>
                </article>

                ${renderArticleSidebar(safeLatestPosts)}
            </div>

            <section class="article-related" aria-labelledby="article-related-title">
                <div class="article-related__heading">
                    <span>Đọc tiếp</span>
                    <h2 id="article-related-title">Bài viết có thể bạn quan tâm</h2>
                </div>
                <div class="article-related__grid">${relatedCards}</div>
            </section>
        `;
        bindNewsletterForm();
    };

    const initializeArticlePage = async () => {
        const articleData = await loadArticleData();
        renderArticle(articleData);
    };

    initializeArticlePage();
})();
