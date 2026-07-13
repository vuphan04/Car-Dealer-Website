const getSharedHeaderActivePath = () => {
    const path = window.location.pathname;

    if (path === '/mua-xe' || path.startsWith('/cars/') || path === '/thanh-toan-dat-coc') {
        return '/mua-xe';
    }

    if (path === '/dang-tin-mua-o-to') {
        return '/tin-mua-o-to';
    }

    if (path.startsWith('/blog/')) {
        return '/blog';
    }

    return path;
};

const getSharedAuthHref = (authAction = 'login') => {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const returnTo = currentPath && currentPath !== '/'
        ? `&returnTo=${encodeURIComponent(currentPath)}`
        : '';

    return `/?auth=${encodeURIComponent(authAction)}${returnTo}`;
};

const renderSharedSiteHeader = () => {
    const headerMounts = document.querySelectorAll('[data-site-header]');

    if (!headerMounts.length) {
        return;
    }

    const activePath = getSharedHeaderActivePath();
    const navItems = [
        { href: '/', label: 'Trang Chủ', activePath: '/' },
        { href: '/mua-xe', label: 'Tìm mua ô tô', activePath: '/mua-xe' },
        { href: '/dang-tin-ban-xe', label: 'Đăng bán xe', activePath: '/dang-tin-ban-xe' },
        { href: '/tin-mua-o-to', label: 'Tin mua ô tô', activePath: '/tin-mua-o-to' },
        { href: '/khuyen-mai', label: 'Khuyến mại', activePath: '/khuyen-mai' },
        { href: '/tu-van-ban-hang', label: 'Đội ngũ tư vấn bán hàng', activePath: '/tu-van-ban-hang' },
        { href: '/#faq', label: 'Faq' },
        { href: '/blog', label: 'Tin tức về xe', activePath: '/blog' },
        { href: '/#footer', label: 'Liên Hệ' }
    ];

    headerMounts.forEach((mount, index) => {
        const panelId = `okxe-site-navigation-${index + 1}`;
        const navLinks = navItems.map((item) => {
            const currentAttribute = item.activePath === activePath ? ' aria-current="page"' : '';
            return `<a href="${item.href}"${currentAttribute}>${item.label}</a>`;
        }).join('');

        mount.innerHTML = `
            <header class="okxe-site-header">
                <nav class="okxe-site-header__nav" aria-label="Điều hướng chính" data-responsive-nav>
                    <a href="/" class="okxe-site-header__logo" aria-label="Về trang chủ OkXe">Ok<span>Xe</span></a>
                    <button class="okxe-site-header__toggle" type="button" aria-label="Mở menu điều hướng" aria-expanded="false" aria-controls="${panelId}" data-responsive-nav-toggle>
                        <i class="bx bx-menu" aria-hidden="true"></i>
                    </button>
                    <div class="okxe-site-header__panel" id="${panelId}" data-responsive-nav-panel>
                        <div class="okxe-site-header__links nav-links">${navLinks}</div>
                        <div class="okxe-site-header__auth">
                            <div class="okxe-site-header__guest" data-site-header-guest hidden>
                                <a href="${getSharedAuthHref('login')}" class="okxe-site-header__action okxe-site-header__action--login">Đăng nhập</a>
                                <a href="${getSharedAuthHref('signup')}" class="okxe-site-header__action okxe-site-header__action--signup">Đăng ký tài khoản</a>
                            </div>
                            <div class="okxe-site-header__logged-in" data-site-header-user hidden>
                                <div class="okxe-site-header__account" data-site-account-menu>
                                    <button type="button" class="okxe-site-header__account-trigger" aria-haspopup="true" aria-expanded="false" data-site-account-trigger>
                                        <i class="bx bx-user-circle" aria-hidden="true"></i>
                                        <span>Xin chào, <strong data-site-user-name>bạn</strong></span>
                                        <i class="bx bx-chevron-down okxe-site-header__chevron" aria-hidden="true"></i>
                                    </button>
                                    <div class="okxe-site-header__dropdown">
                                        <div class="okxe-site-header__summary">
                                            <span class="okxe-site-header__avatar" data-site-user-avatar><i class="bx bx-user" aria-hidden="true"></i></span>
                                            <div>
                                                <strong data-site-user-full-name>Khách hàng OkXe</strong>
                                                <span data-site-user-email>Chưa có email</span>
                                                <small data-site-user-phone>Chưa cập nhật số điện thoại</small>
                                            </div>
                                        </div>
                                        <a href="/?account=profile" class="okxe-site-header__dropdown-link"><i class="bx bx-id-card" aria-hidden="true"></i><span>Thông tin của tôi</span></a>
                                        <a href="/?account=listings" class="okxe-site-header__dropdown-link"><i class="bx bx-list-ul" aria-hidden="true"></i><span>Quản lý tin đăng</span></a>
                                        <a href="/?account=favorites" class="okxe-site-header__dropdown-link"><i class="bx bx-heart" aria-hidden="true"></i><span>Xe yêu thích</span></a>
                                        <a href="/?account=notifications" class="okxe-site-header__dropdown-link"><i class="bx bx-bell" aria-hidden="true"></i><span>Thông báo</span></a>
                                        <a href="/?account=deposits" class="okxe-site-header__dropdown-link"><i class="bx bx-receipt" aria-hidden="true"></i><span>Quản lý đặt cọc</span></a>
                                        <a href="/dang-tin-mua-o-to" class="okxe-site-header__dropdown-link"><i class="bx bx-message-square-edit" aria-hidden="true"></i><span>Đăng tin mua ô tô</span></a>
                                        <a href="/dang-tin-ban-xe" class="okxe-site-header__dropdown-link"><i class="bx bx-car" aria-hidden="true"></i><span>Đăng bán xe cũ</span></a>
                                    </div>
                                </div>
                                <button type="button" class="okxe-site-header__action" data-site-logout>Đăng xuất</button>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        `;

        const guestState = mount.querySelector('[data-site-header-guest]');
        const userState = mount.querySelector('[data-site-header-user]');
        const accountMenu = mount.querySelector('[data-site-account-menu]');
        const accountTrigger = mount.querySelector('[data-site-account-trigger]');
        const logoutButton = mount.querySelector('[data-site-logout]');

        const setUserState = (user) => {
            const isLoggedIn = Boolean(user);
            guestState.hidden = isLoggedIn;
            userState.hidden = !isLoggedIn;

            if (!isLoggedIn) {
                accountMenu.classList.remove('is-open');
                accountTrigger.setAttribute('aria-expanded', 'false');
                return;
            }

            const displayName = user.fullName || user.email || 'bạn';
            mount.querySelector('[data-site-user-name]').textContent = displayName;
            mount.querySelector('[data-site-user-full-name]').textContent = user.fullName || 'Khách hàng OkXe';
            mount.querySelector('[data-site-user-email]').textContent = user.email || 'Chưa có email';
            mount.querySelector('[data-site-user-phone]').textContent = user.phone || 'Chưa cập nhật số điện thoại';

            const avatar = mount.querySelector('[data-site-user-avatar]');
            avatar.replaceChildren();

            if (user.avatarUrl) {
                const image = document.createElement('img');
                image.src = user.avatarUrl;
                image.alt = '';
                avatar.append(image);
            } else {
                const icon = document.createElement('i');
                icon.className = 'bx bx-user';
                icon.setAttribute('aria-hidden', 'true');
                avatar.append(icon);
            }
        };

        accountTrigger.addEventListener('click', () => {
            const isOpen = accountMenu.classList.toggle('is-open');
            accountTrigger.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', (event) => {
            if (!accountMenu.contains(event.target)) {
                accountMenu.classList.remove('is-open');
                accountTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        logoutButton.addEventListener('click', async () => {
            logoutButton.disabled = true;
            logoutButton.textContent = 'Đang thoát...';

            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                setUserState(null);
            } finally {
                logoutButton.disabled = false;
                logoutButton.textContent = 'Đăng xuất';
            }
        });

        fetch('/api/auth/me')
            .then((response) => response.ok ? response.json() : null)
            .then((data) => setUserState(data?.user || null))
            .catch(() => setUserState(null));
    });
};

const renderSharedSiteFooter = () => {
    const footerMounts = document.querySelectorAll('[data-site-footer]');

    if (!footerMounts.length) {
        return;
    }

    const currentYear = new Date().getFullYear();

    footerMounts.forEach((mount) => {
        mount.classList.add('okxe-site-footer-mount');
        mount.innerHTML = `
            <footer class="okxe-site-footer" id="footer">
                <div class="okxe-site-footer__accent" aria-hidden="true"></div>
                <div class="okxe-site-footer__container okxe-site-footer__grid">
                    <section class="okxe-site-footer__brand" aria-label="Giới thiệu OkXe">
                        <a href="/#home" class="okxe-site-footer__logo">Ok<span>Xe</span></a>
                        <p>OkXe giúp khách hàng tìm mua ô tô cũ theo nhu cầu, ngân sách và khu vực với thông tin rõ ràng, hỗ trợ nhanh chóng.</p>
                        <a href="tel:0854955761" class="okxe-site-footer__hotline">
                            <i class="bx bx-phone-call" aria-hidden="true"></i>
                            <span>Tư vấn nhanh: <strong>0854955761</strong></span>
                        </a>
                    </section>

                    <nav class="okxe-site-footer__links" aria-label="Liên kết nhanh">
                        <h2>Liên kết nhanh</h2>
                        <a href="/#home">Trang chủ</a>
                        <a href="/mua-xe">Tìm mua ô tô</a>
                        <a href="/tin-mua-o-to">Tin mua ô tô</a>
                        <a href="/khuyen-mai">Khuyến mại</a>
                        <a href="/blog">Blog ô tô</a>
                        <a href="/#faq">Hỏi đáp</a>
                    </nav>

                    <nav class="okxe-site-footer__links" aria-label="Dịch vụ hỗ trợ">
                        <h2>Dịch vụ hỗ trợ</h2>
                        <a href="/dang-ky-lai-thu">Đăng ký lái thử</a>
                        <a href="/dang-tin-ban-xe">Đăng bán xe cũ</a>
                        <a href="/dang-tin-mua-o-to">Đăng tin mua ô tô</a>
                        <a href="/tu-van-ban-hang">Tư vấn bán hàng</a>
                        <a href="/#rentals">Xe đang bán</a>
                    </nav>

                    <section class="okxe-site-footer__contact" aria-label="Thông tin liên hệ">
                        <h2>Liên hệ với chúng tôi</h2>
                        <a href="https://maps.app.goo.gl/KbjbFtippoXSj28N8lank" target="_blank" rel="noopener noreferrer">
                            <i class="bx bx-map" aria-hidden="true"></i>
                            <span>123 Hai Bà Trưng, TP. Hà Nội</span>
                        </a>
                        <a href="tel:0854955761">
                            <i class="bx bx-phone-call" aria-hidden="true"></i>
                            <span>0854955761</span>
                        </a>
                        <a href="mailto:contact@okxe.vn">
                            <i class="bx bx-envelope" aria-hidden="true"></i>
                            <span>contact@okxe.vn</span>
                        </a>
                        <p>
                            <i class="bx bx-time-five" aria-hidden="true"></i>
                            <span>Thứ 2 - Chủ nhật: 8:00 - 20:00</span>
                        </p>
                        <div class="okxe-site-footer__socials" aria-label="Mạng xã hội">
                            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="bx bxl-facebook" aria-hidden="true"></i></a>
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="bx bxl-instagram" aria-hidden="true"></i></a>
                            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="bx bxl-tiktok" aria-hidden="true"></i></a>
                            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="bx bxl-youtube" aria-hidden="true"></i></a>
                        </div>
                    </section>
                </div>

                <div class="okxe-site-footer__container okxe-site-footer__bottom">
                    <p>&copy; OkXe ${currentYear}. Website hỗ trợ tìm mua ô tô cũ.</p>
                    <p>Thông tin xe và lịch tư vấn được cập nhật bởi đội ngũ OkXe.</p>
                </div>
            </footer>
        `;
    });
};

const renderSharedLayout = () => {
    renderSharedSiteHeader();
    renderSharedSiteFooter();
};

const loadSharedChat = () => {
    if (document.querySelector('[data-okxe-chat-assets]')) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/global/chat.css?v=chat-motion-polish-20260712';
    style.dataset.okxeChatAssets = 'true';
    document.head.append(style);

    const loadChatClient = () => {
        const chatScript = document.createElement('script');
        chatScript.src = '/global/chat.js?v=chat-motion-polish-20260712';
        chatScript.defer = true;
        document.body.append(chatScript);
    };
    if (window.io) {
        loadChatClient();
        return;
    }
    const socketScript = document.createElement('script');
    socketScript.src = '/socket.io/socket.io.js';
    socketScript.onload = loadChatClient;
    document.body.append(socketScript);
};

renderSharedLayout();
loadSharedChat();
