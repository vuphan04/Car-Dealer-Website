(function () {
    const navs = document.querySelectorAll('[data-responsive-nav]');

    if (!navs.length) {
        return;
    }

    const closeNav = (nav) => {
        const toggle = nav.querySelector('[data-responsive-nav-toggle]');

        nav.classList.remove('is-open');

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '<i class="bx bx-menu" aria-hidden="true"></i>';
        }
    };

    navs.forEach((nav) => {
        const toggle = nav.querySelector('[data-responsive-nav-toggle]');
        const panelId = toggle?.getAttribute('aria-controls');
        const panel = panelId
            ? document.getElementById(panelId)
            : nav.querySelector('[data-responsive-nav-panel]');

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');

            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.innerHTML = isOpen
                ? '<i class="bx bx-x" aria-hidden="true"></i>'
                : '<i class="bx bx-menu" aria-hidden="true"></i>';
        });

        panel.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                closeNav(nav);
            }
        });

        document.addEventListener('click', (event) => {
            if (!nav.contains(event.target)) {
                closeNav(nav);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNav(nav);
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 760) {
                closeNav(nav);
            }
        });
    });
})();
