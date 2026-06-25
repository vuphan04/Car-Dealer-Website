(function () {
    const articlePage = document.querySelector('#article-page');
    const posts = Array.isArray(window.OKXE_BLOG_POSTS) ? window.OKXE_BLOG_POSTS : [];
    const slug = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
    const post = posts.find((item) => item.slug === slug);
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

    const formatDate = (value) => {
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
    };

    const updateMeta = (selector, attribute, value) => {
        const element = document.querySelector(selector);

        if (element) {
            element.setAttribute(attribute, value);
        }
    };

    const renderNotFound = () => {
        document.title = 'Không tìm thấy bài viết | OkXe Blog';
        articlePage.innerHTML = `
            <section class="article-not-found">
                <i class="bx bx-news" aria-hidden="true"></i>
                <h1>Không tìm thấy bài viết</h1>
                <p>Bài viết có thể đã được thay đổi đường dẫn hoặc chưa được xuất bản.</p>
                <a href="/blog"><i class="bx bx-left-arrow-alt" aria-hidden="true"></i>Quay lại Blog</a>
            </section>
        `;
    };

    if (!post) {
        renderNotFound();
        return;
    }

    document.title = `${post.title} | OkXe Blog`;
    updateMeta('meta[name="description"]', 'content', post.excerpt);
    updateMeta('meta[property="og:title"]', 'content', post.title);
    updateMeta('meta[property="og:description"]', 'content', post.excerpt);
    updateMeta('meta[property="og:image"]', 'content', post.image);

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        datePublished: post.publishedAt,
        author: {
            '@type': 'Organization',
            name: post.author
        },
        publisher: {
            '@type': 'Organization',
            name: 'OkXe'
        },
        inLanguage: 'vi-VN'
    });
    document.head.append(schema);

    const sections = (post.content || []).map((section) => `
        <section class="article-content__section">
            <h2>${escapeHtml(section.heading)}</h2>
            ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
            ${section.list?.length
                ? `<ul>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                : ''}
        </section>
    `).join('');

    const relatedPosts = posts
        .filter((item) => item.slug !== post.slug)
        .sort((first, second) => Number(second.category === post.category) - Number(first.category === post.category))
        .slice(0, 3);

    const relatedCards = relatedPosts.map((item) => `
        <article class="article-related-card">
            <a href="/blog/${encodeURIComponent(item.slug)}" class="article-related-card__media">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy">
            </a>
            <div>
                <span>${escapeHtml(item.category)}</span>
                <h3><a href="/blog/${encodeURIComponent(item.slug)}">${escapeHtml(item.title)}</a></h3>
                <small>${escapeHtml(formatDate(item.publishedAt))} · ${escapeHtml(item.readTime)} phút đọc</small>
            </div>
        </article>
    `).join('');

    articlePage.innerHTML = `
        <article class="article-layout">
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
                    <span><i class="bx bx-user" aria-hidden="true"></i>${escapeHtml(post.author)}</span>
                </div>
            </header>

            <figure class="article-hero">
                <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}">
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

        <section class="article-related" aria-labelledby="article-related-title">
            <div class="article-related__heading">
                <span>Đọc tiếp</span>
                <h2 id="article-related-title">Bài viết có thể bạn quan tâm</h2>
            </div>
            <div class="article-related__grid">${relatedCards}</div>
        </section>
    `;
})();
