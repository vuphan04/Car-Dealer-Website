const sellCarForm = document.querySelector('#sell-car-form');
const brandSelect = document.querySelector('#sell-car-brand');
const modelSelect = document.querySelector('#sell-car-model');
const yearSelect = document.querySelector('#sell-car-year');
const versionSelect = document.querySelector('#sell-car-version');
const feedback = document.querySelector('#sell-car-feedback');
const submitButton = document.querySelector('#sell-car-submit');
const revealSections = document.querySelectorAll('.sell-guide-section, .sell-compare-section, .sell-faq-section');
const faqItems = document.querySelectorAll('.sell-faq-item');
const guideStepButtons = document.querySelectorAll('[data-guide-step]');
const guidePanel = document.querySelector('#sell-guide-panel');
const guidePanelStep = document.querySelector('#sell-guide-panel-step');
const guidePanelTitle = document.querySelector('#sell-guide-panel-title');
const guidePanelDesc = document.querySelector('#sell-guide-panel-desc');
const guidePanelList = document.querySelector('#sell-guide-panel-list');
const guideVisualTitle = document.querySelector('#sell-guide-visual-title');
const guideVisualText = document.querySelector('#sell-guide-visual-text');
const guideImage = document.querySelector('#sell-guide-image');

const brandModels = {
    Toyota: ['Vios', 'Corolla Cross', 'Camry', 'Fortuner', 'Innova', 'Raize'],
    Hyundai: ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Grand i10'],
    Kia: ['Morning', 'K3', 'Seltos', 'Sportage', 'Sorento', 'Carnival'],
    Mazda: ['Mazda2', 'Mazda3', 'CX-3', 'CX-5', 'CX-8', 'BT-50'],
    Ford: ['Ranger', 'Everest', 'Territory', 'Explorer', 'Transit', 'EcoSport'],
    Mitsubishi: ['Xpander', 'Attrage', 'Outlander', 'Triton', 'Pajero Sport', 'Xforce'],
    Honda: ['City', 'Civic', 'CR-V', 'HR-V', 'Accord', 'BR-V'],
    BMW: ['3 Series', '5 Series', 'X1', 'X3', 'X5', '7 Series'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLA'],
    VinFast: ['Fadil', 'Lux A2.0', 'Lux SA2.0', 'VF e34', 'VF 5', 'VF 8'],
    Lexus: ['ES', 'RX', 'NX', 'LX', 'LS', 'GX'],
    Nissan: ['Almera', 'Navara', 'Terra', 'Kicks', 'Sunny', 'X-Trail'],
    Suzuki: ['Swift', 'Ertiga', 'XL7', 'Ciaz', 'Carry Pro', 'Jimny']
};

const versions = ['Tiêu chuẩn', 'Cao cấp', 'Luxury', 'Premium', 'Sport', 'Hybrid'];

const guideStepContent = {
    price: {
        step: 'Bước 1',
        title: 'Định giá thu mua xe cũ theo tình trạng thực tế',
        desc: 'OkXe tham khảo giá thị trường, đời xe, số km, lịch sử sử dụng và tình trạng hiện tại để tư vấn khoảng giá thu mua ban đầu cho khách hàng.',
        bullets: [
            'Cung cấp hãng xe, dòng xe, đời xe và phiên bản để đội ngũ tư vấn nắm thông tin nhanh.',
            'Chia sẻ thêm số km, tình trạng bảo dưỡng và nhu cầu bán để OkXe tư vấn sát hơn.',
            'Giá cuối cùng sẽ được xác nhận sau khi kiểm định xe trực tiếp tại showroom hoặc điểm hẹn phù hợp.'
        ],
        visualTitle: 'Định giá rõ ràng trước khi giao dịch',
        visualText: 'Khách hàng biết trước các yếu tố ảnh hưởng tới giá thu mua, tránh kỳ vọng sai hoặc thương lượng thiếu cơ sở.',
        image: '/sell-car/process-step-price-transparent.png',
        alt: 'Minh họa OkXe định giá thu mua xe cũ'
    },
    demand: {
        step: 'Bước 2',
        title: 'Xác nhận nhu cầu bán và thời gian làm việc',
        desc: 'Sau khi nhận thông tin, OkXe liên hệ lại để hiểu nhu cầu bán, thời gian mong muốn và cách khách hàng muốn kiểm tra xe.',
        bullets: [
            'Khách có thể trao đổi trước qua điện thoại để được giải thích quy trình thu mua.',
            'OkXe thống nhất lịch kiểm tra xe tại showroom hoặc điểm hẹn thuận tiện nếu phù hợp.',
            'Nhân viên tư vấn ghi nhận mục tiêu bán nhanh, đổi xe hoặc cần hỗ trợ hồ sơ để chuẩn bị phương án xử lý.'
        ],
        visualTitle: 'Tư vấn đúng nhu cầu của chủ xe',
        visualText: 'Thông tin càng rõ, quá trình kiểm định và báo giá càng gọn, giảm thời gian chờ của khách hàng.',
        image: '/sell-car/process-step-info-transparent.png',
        alt: 'Minh họa OkXe tiếp nhận nhu cầu bán xe cũ'
    },
    inspect: {
        step: 'Bước 3',
        title: 'Kiểm định ngoại thất, nội thất và vận hành',
        desc: 'OkXe kiểm tra tổng thể để xác định tình trạng xe trước khi đưa ra mức giá thu mua chính thức.',
        bullets: [
            'Kiểm tra thân vỏ, sơn, kính, lốp, khoang máy, nội thất và các trang bị chính.',
            'Đánh giá vận hành cơ bản, tiếng máy, hộp số, hệ thống điện và các lỗi cần sửa nếu có.',
            'Kết quả kiểm định được giải thích rõ để khách hiểu vì sao giá thu mua tăng hoặc giảm.'
        ],
        visualTitle: 'Kiểm định minh bạch, dễ hiểu',
        visualText: 'Khách hàng không cần am hiểu kỹ thuật vẫn có thể nắm các điểm chính ảnh hưởng tới giá xe.',
        image: '/sell-car/process-step-inspect-transparent.png',
        alt: 'Nhân viên OkXe kiểm định tình trạng xe cũ'
    },
    papers: {
        step: 'Bước 4',
        title: 'Kiểm tra giấy tờ để giao dịch thuận lợi',
        desc: 'Giấy tờ rõ ràng giúp OkXe xử lý mua bán, sang tên và nhập kho nhanh hơn, hạn chế phát sinh sau khi chốt giá.',
        bullets: [
            'Chuẩn bị đăng ký xe, đăng kiểm, bảo hiểm nếu còn và giấy tờ tùy thân của chủ xe.',
            'Thông báo trước nếu xe đang vay ngân hàng, đồng sở hữu, ủy quyền hoặc thiếu giấy tờ liên quan.',
            'OkXe tư vấn các giấy tờ cần bổ sung trước khi ký mua bán để khách chủ động sắp xếp.'
        ],
        visualTitle: 'Hồ sơ rõ, giao dịch nhanh',
        visualText: 'Đội ngũ tư vấn kiểm tra trước để giảm rủi ro phải đi lại nhiều lần khi hoàn tất thủ tục.',
        image: '/sell-car/process-step-info-transparent.png',
        alt: 'Minh họa chuẩn bị giấy tờ bán xe cũ cho OkXe'
    },
    deal: {
        step: 'Bước 5',
        title: 'Chốt giá bán dựa trên kiểm định thực tế',
        desc: 'Sau khi kiểm tra xe và hồ sơ, OkXe báo mức giá thu mua chính thức, nêu rõ các yếu tố ảnh hưởng để khách cân nhắc.',
        bullets: [
            'Mức giá được đưa ra dựa trên tình trạng xe, chi phí cần xử lý và giá xe cùng phân khúc trên thị trường.',
            'Khách có thể trao đổi trực tiếp với tư vấn viên để làm rõ các khoản khấu trừ hoặc hỗ trợ thêm.',
            'Chỉ chuyển sang bước thủ tục khi hai bên đã thống nhất giá và phương thức thanh toán.'
        ],
        visualTitle: 'Thương lượng trên thông tin rõ ràng',
        visualText: 'OkXe ưu tiên giải thích dễ hiểu để khách biết xe được định giá như thế nào trước khi quyết định bán.',
        image: '/sell-car/process-step-price-transparent.png',
        alt: 'Minh họa chốt giá thu mua xe cũ tại OkXe'
    },
    payment: {
        step: 'Bước 6',
        title: 'Thanh toán sau khi thống nhất hồ sơ mua bán',
        desc: 'OkXe hỗ trợ thanh toán theo phương án đã thỏa thuận, đảm bảo khách nắm rõ thời điểm nhận tiền và chứng từ liên quan.',
        bullets: [
            'Ưu tiên chuyển khoản để giao dịch có chứng từ rõ ràng, dễ đối chiếu sau khi bàn giao.',
            'Nhân viên hướng dẫn khách kiểm tra thông tin thanh toán trước khi ký xác nhận.',
            'Nếu xe có ràng buộc tài chính, OkXe sẽ trao đổi phương án xử lý phù hợp trước khi thanh toán.'
        ],
        visualTitle: 'Thanh toán rõ thời điểm',
        visualText: 'Khách biết trước khi nào nhận tiền, cần ký gì và chứng từ nào được lưu trong giao dịch.',
        image: '/sell-car/process-step-stock-transparent.png',
        alt: 'Minh họa thanh toán khi bán xe cũ cho OkXe'
    },
    handover: {
        step: 'Bước 7',
        title: 'Bàn giao xe và nhập kho showroom OkXe',
        desc: 'Sau khi hoàn tất thanh toán và giấy tờ, xe được bàn giao cho OkXe để kiểm tra lại, vệ sinh, bảo dưỡng và trưng bày bán lại.',
        bullets: [
            'Hai bên xác nhận tình trạng bàn giao, chìa khóa, phụ kiện và các giấy tờ đi kèm.',
            'Xe được nhập kho showroom để OkXe kiểm tra lại trước khi đăng bán cho khách mua xe.',
            'Thông tin cá nhân của người bán được bảo mật trong quá trình xử lý hồ sơ và lưu trữ.'
        ],
        visualTitle: 'Hoàn tất gọn, xe vào kho OkXe',
        visualText: 'Sau khi bàn giao, OkXe tiếp tục kiểm tra và chuẩn bị xe cho quy trình bán lại tại showroom.',
        image: '/sell-car/process-step-stock-transparent.png',
        alt: 'Khách hàng bàn giao xe cũ để OkXe nhập kho showroom'
    }
};

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);

const setFeedback = (message, type = 'success') => {
    if (!feedback) {
        return;
    }

    feedback.textContent = message || '';
    feedback.className = 'sell-car-feedback';

    if (message) {
        feedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
};

const setOptions = (select, options, placeholder) => {
    if (!select) {
        return;
    }

    select.innerHTML = [
        `<option value="">${escapeHtml(placeholder)}</option>`,
        ...options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    ].join('');
};

const renderBrandOptions = () => {
    setOptions(brandSelect, Object.keys(brandModels), 'Chọn hãng xe');
};

const renderYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 }, (_, index) => String(currentYear - index));

    setOptions(yearSelect, years, 'Chọn đời xe');
};

const resetModelOptions = () => {
    setOptions(modelSelect, [], 'Chọn dòng xe');
    setOptions(versionSelect, [], 'Chọn phiên bản');

    if (modelSelect) {
        modelSelect.disabled = true;
    }

    if (versionSelect) {
        versionSelect.disabled = true;
    }
};

const updateModelOptions = () => {
    const selectedBrand = brandSelect?.value || '';
    const models = brandModels[selectedBrand] || [];

    setOptions(modelSelect, models, 'Chọn dòng xe');
    setOptions(versionSelect, [], 'Chọn phiên bản');

    if (modelSelect) {
        modelSelect.disabled = !models.length;
    }

    if (versionSelect) {
        versionSelect.disabled = true;
    }
};

const updateVersionOptions = () => {
    const selectedModel = modelSelect?.value || '';

    setOptions(versionSelect, versions, 'Chọn phiên bản');

    if (versionSelect) {
        versionSelect.disabled = !selectedModel;
    }
};

const initRevealSections = () => {
    if (!revealSections.length) {
        return;
    }

    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hashTarget = null;

    if (window.location.hash) {
        try {
            hashTarget = document.querySelector(window.location.hash);
        } catch (error) {
            hashTarget = null;
        }
    }

    revealSections.forEach((section) => {
        if (shouldReduceMotion) {
            section.classList.add('is-visible');
            return;
        }

        section.classList.add('is-ready');

        let sectionObserver;
        const revealSection = () => {
            section.classList.add('is-visible');
            sectionObserver?.disconnect();
        };

        if (hashTarget && section.contains(hashTarget)) {
            revealSection();
            return;
        }

        const sectionRect = section.getBoundingClientRect();

        if (sectionRect.top < window.innerHeight * 0.88 && sectionRect.bottom > 0) {
            window.requestAnimationFrame(revealSection);
            return;
        }

        if (!('IntersectionObserver' in window)) {
            revealSection();
            return;
        }

        sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revealSection();
                }
            });
        }, {
            rootMargin: '0px 0px -12% 0px',
            threshold: 0.2
        });

        sectionObserver.observe(section);
    });
};

const renderGuideBullets = (items) => {
    if (!guidePanelList) {
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
        const listItem = document.createElement('li');
        const icon = document.createElement('i');
        const text = document.createElement('span');

        icon.className = 'bx bx-check';
        icon.setAttribute('aria-hidden', 'true');
        text.textContent = item;

        listItem.append(icon, text);
        fragment.appendChild(listItem);
    });

    guidePanelList.replaceChildren(fragment);
};

const setActiveGuideStep = (stepKey) => {
    const activeStepKey = guideStepContent[stepKey] ? stepKey : 'price';
    const content = guideStepContent[activeStepKey];

    guideStepButtons.forEach((button) => {
        const isActive = button.dataset.guideStep === activeStepKey;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
        button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    guidePanel?.classList.add('is-changing');

    if (guidePanelStep) {
        guidePanelStep.textContent = content.step;
    }

    if (guidePanelTitle) {
        guidePanelTitle.textContent = content.title;
    }

    if (guidePanelDesc) {
        guidePanelDesc.textContent = content.desc;
    }

    renderGuideBullets(content.bullets);

    if (guideVisualTitle) {
        guideVisualTitle.textContent = content.visualTitle;
    }

    if (guideVisualText) {
        guideVisualText.textContent = content.visualText;
    }

    if (guideImage) {
        guideImage.src = content.image;
        guideImage.alt = content.alt;
    }

    window.setTimeout(() => {
        guidePanel?.classList.remove('is-changing');
    }, 180);
};

const initGuideTabs = () => {
    if (!guideStepButtons.length) {
        return;
    }

    const getNextIndex = (currentIndex, key) => {
        if (key === 'Home') {
            return 0;
        }

        if (key === 'End') {
            return guideStepButtons.length - 1;
        }

        if (key === 'ArrowLeft' || key === 'ArrowUp') {
            return currentIndex === 0 ? guideStepButtons.length - 1 : currentIndex - 1;
        }

        return currentIndex === guideStepButtons.length - 1 ? 0 : currentIndex + 1;
    };

    guideStepButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            setActiveGuideStep(button.dataset.guideStep);
        });

        button.addEventListener('keydown', (event) => {
            if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                return;
            }

            event.preventDefault();

            const nextButton = guideStepButtons[getNextIndex(index, event.key)];
            nextButton?.focus();
            setActiveGuideStep(nextButton?.dataset.guideStep);
        });
    });

    const initialStep = document.querySelector('.sell-guide-step.is-active')?.dataset.guideStep || 'price';
    setActiveGuideStep(initialStep);
};

const resetFaqAnimationState = (item, answer) => {
    item.classList.remove('is-animating', 'is-opening', 'is-closing');
    delete item.dataset.faqAnimating;
    answer.style.height = '';
};

const animateFaqOpen = (item, answer) => {
    item.open = true;
    item.dataset.faqAnimating = 'true';
    item.classList.add('is-animating', 'is-opening');
    answer.style.height = '0px';

    window.requestAnimationFrame(() => {
        answer.style.height = `${answer.scrollHeight}px`;
    });
};

const animateFaqClose = (item, answer) => {
    item.dataset.faqAnimating = 'true';
    item.classList.add('is-animating', 'is-closing');
    answer.style.height = `${answer.scrollHeight}px`;

    window.requestAnimationFrame(() => {
        answer.style.height = '0px';
    });
};

const initFaqAnimation = () => {
    if (!faqItems.length) {
        return;
    }

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    faqItems.forEach((item) => {
        const summary = item.querySelector('summary');
        const answer = item.querySelector('.sell-faq-answer');

        if (!summary || !answer) {
            return;
        }

        answer.addEventListener('transitionend', (event) => {
            if (event.propertyName !== 'height' || !item.classList.contains('is-animating')) {
                return;
            }

            if (item.classList.contains('is-closing')) {
                item.open = false;
            }

            resetFaqAnimationState(item, answer);
        });

        summary.addEventListener('click', (event) => {
            if (reduceMotionQuery.matches) {
                return;
            }

            event.preventDefault();

            if (item.dataset.faqAnimating === 'true') {
                return;
            }

            if (item.open) {
                animateFaqClose(item, answer);
                return;
            }

            animateFaqOpen(item, answer);
        });
    });
};

brandSelect?.addEventListener('change', () => {
    setFeedback('');
    updateModelOptions();
});

modelSelect?.addEventListener('change', () => {
    setFeedback('');
    updateVersionOptions();
});

[yearSelect, versionSelect].forEach((select) => {
    select?.addEventListener('change', () => setFeedback(''));
});

sellCarForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    setFeedback('');

    if (!sellCarForm.checkValidity()) {
        sellCarForm.reportValidity();
        setFeedback('Vui lòng điền đủ các trường bắt buộc trước khi gửi.', 'error');
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i><span>Đang kiểm tra...</span>';
    }

    window.setTimeout(() => {
        setFeedback('OkXe đã nhận thông tin xe tạm thời. Đội ngũ tư vấn sẽ liên hệ để kiểm định và báo giá thu mua.');

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="bx bx-car" aria-hidden="true"></i><span>Gửi thông tin xe cho OkXe</span>';
        }
    }, 500);
});

renderBrandOptions();
renderYearOptions();
resetModelOptions();
initGuideTabs();
initRevealSections();
initFaqAnimation();
