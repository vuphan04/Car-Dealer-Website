const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(process.env.PAGES_OUTPUT_DIR || path.join(rootDir, 'dist', 'pages'));

const routePages = new Map([
  ['mua-xe', 'inventory'],
  ['khuyen-mai', 'promotions'],
  ['tin-mua-o-to', 'buy-requests'],
  ['dang-tin-mua-o-to', 'buy-request-form'],
  ['dang-tin-ban-xe', 'sell-car'],
  ['tu-van-ban-hang', 'sales-team'],
  ['dang-ky-lai-thu', 'test-drive'],
  ['admin-login', 'admin-login'],
  ['admin', 'admin'],
]);

const carBuyRequestBudgetLabels = {
  'under-200': 'Duoi 200 Trieu',
  '200-400': '200-400 Trieu',
  '400-600': '400-600 Trieu',
  '600-800': '600-800 Trieu',
  '800-1000': '800-1 Ti',
  'over-1000': 'Tren 1 Ti',
};

const fallbackCars = [
  {
    id: 1,
    brand: 'Rolls-Royce',
    category: 'Sedan',
    name: 'Rolls-Royce Phantom',
    description: 'Xe demo cao cap cho ban GitHub Pages.',
    type: 'Tu dong',
    price: '29,9 ty VND',
    priceValue: 29900000000,
    image: '/images/rental-1.png',
    images: ['/images/rental-1.png'],
    year: 2024,
    fuel: 'Xang',
    mileage: '12.300 km',
    mileageValue: 12300,
    seats: '5 cho',
    gearbox: 'Tu dong',
    drivetrain: 'RWD - Dan dong cau sau',
    origin: 'Nhap khau',
    condition: 'Xe moi',
    color: 'Den',
    actionText: 'Con xe',
  },
  {
    id: 2,
    brand: 'Porsche',
    category: 'SUV',
    name: 'Porsche Macan 4',
    description: 'Xe demo the thao, phu hop di pho va du lich.',
    type: 'Tu dong',
    price: '4,1 ty VND',
    priceValue: 4100000000,
    image: '/images/rental-2.png',
    images: ['/images/rental-2.png'],
    year: 2023,
    fuel: 'Xang',
    mileage: '8.900 km',
    mileageValue: 8900,
    seats: '5 cho',
    gearbox: 'Tu dong',
    drivetrain: 'Dan dong 4 banh',
    origin: 'Nhap khau',
    condition: 'Xe moi',
    color: 'Xanh la',
    actionText: 'Con xe',
  },
];

const fallbackTeamMembers = [
  {
    id: 1,
    fullName: 'Tu van OkXe',
    email: 'sales@okxe.example',
    role: 'staff',
    phone: '0854955761',
    avatarUrl: '/images/team-1.jpg',
    salesTitle: 'Truong phong kinh doanh',
    salesExperience: '8 nam kinh nghiem',
    salesBio: 'Tu van chon xe cu theo nhu cau, ngan sach va lich su su dung.',
    homeDisplayOrder: 1,
  },
];

const fallbackPromotions = [
  {
    id: 1,
    title: 'Uu dai kiem tra xe cu mien phi',
    summary: 'Tang goi kiem tra tong quat khi khach dat lich xem xe trong thang nay.',
    content: 'Ban demo GitHub Pages su dung du lieu mau de trinh bay giao dien khuyen mai.',
    badgeText: 'Khuyen mai',
    imageUrl: '/images/promotion-factors.jpg',
    ctaText: 'Nhan tu van',
    ctaUrl: '/#footer',
    startsAt: '2026-06-01',
    endsAt: '2026-12-31',
    showOnHome: true,
    displayOrder: 1,
  },
];

const fallbackBuyRequests = [
  {
    id: 1,
    budgetRange: '400-600',
    budgetLabel: '400-600 Trieu',
    title: 'Can mua SUV gia dinh',
    content: 'Uu tien xe 5-7 cho, may xang, ho so ro rang.',
    fullName: 'Khach hang demo',
    phone: '0854955761',
    email: 'demo@okxe.example',
    province: 'TP. Ho Chi Minh',
    address: 'Quan 1',
    status: 'approved',
    offerCount: 2,
    createdAt: '2026-06-20',
    updatedAt: '2026-06-20',
  },
];

const normalizeBasePath = (value) => {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue || normalizedValue === '/') {
    return '/';
  }

  return `/${normalizedValue.replace(/^\/+|\/+$/g, '')}/`;
};

const deriveBasePath = () => {
  if (process.env.PUBLIC_BASE_PATH) {
    return normalizeBasePath(process.env.PUBLIC_BASE_PATH);
  }

  const repositoryName = String(process.env.GITHUB_REPOSITORY || '').split('/')[1] || '';

  if (!repositoryName || repositoryName.toLowerCase().endsWith('.github.io')) {
    return '/';
  }

  return normalizeBasePath(repositoryName);
};

const basePath = deriveBasePath();
const basePrefix = basePath === '/' ? '' : basePath.replace(/\/$/, '');

const appPathPattern =
  /(^|["'`(=:\s])\/(global|images|uploads|home|inventory|promotions|buy-requests|buy-request-form|sell-car|sales-team|test-drive|car-detail|mua-xe|dang-tin-ban-xe|tin-mua-o-to|khuyen-mai|tu-van-ban-hang|blog|dang-ky-lai-thu|dang-tin-mua-o-to|cars|admin-login|admin)(?=[/#?'"`)\s]|$)/g;

const prefixAppPath = (value) => {
  const normalizedValue = String(value || '');

  if (!normalizedValue.startsWith('/') || normalizedValue.startsWith('//')) {
    return normalizedValue;
  }

  if (basePath === '/' || normalizedValue.startsWith(basePath)) {
    return normalizedValue;
  }

  return `${basePrefix}${normalizedValue}`;
};

const normalizeAppAssetReference = (value) => {
  const normalizedValue = String(value || '').trim();

  if (normalizedValue.startsWith('../images/')) {
    return `/images/${normalizedValue.slice('../images/'.length)}`;
  }

  if (normalizedValue.startsWith('images/')) {
    return `/${normalizedValue}`;
  }

  if (normalizedValue.startsWith('../uploads/')) {
    return `/uploads/${normalizedValue.slice('../uploads/'.length)}`;
  }

  if (normalizedValue.startsWith('uploads/')) {
    return `/${normalizedValue}`;
  }

  return normalizedValue;
};

const rewriteTextForPages = (text) => {
  let rewrittenText = text.replace(appPathPattern, (_, leading, segment) => `${leading}${basePrefix}/${segment}`);

  rewrittenText = rewrittenText
    .replace(/href=(["'])\/\1/g, `href=$1${basePath}$1`)
    .replace(/href=(["'])\/#([^"']*)\1/g, `href=$1${basePath}#$2$1`);

  return rewrittenText;
};

const chmodForRemoval = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const stat = fs.lstatSync(targetPath);

  if (stat.isDirectory()) {
    fs.readdirSync(targetPath).forEach((entryName) => {
      chmodForRemoval(path.join(targetPath, entryName));
    });
    fs.chmodSync(targetPath, 0o777);
    return;
  }

  fs.chmodSync(targetPath, 0o666);
};

const removeBuildEntry = (entryPath) => {
  chmodForRemoval(entryPath);
  fs.rmSync(entryPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
  });
};

const ensureCleanDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });

  fs.readdirSync(dirPath, { withFileTypes: true }).forEach((entry) => {
    removeBuildEntry(path.join(dirPath, entry.name));
  });
};

const copyDir = (sourceDir, targetDir) => {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  fs.readdirSync(sourceDir, { withFileTypes: true }).forEach((entry) => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
      return;
    }

    fs.copyFileSync(sourcePath, targetPath);
  });
};

const copyFile = (sourcePath, targetPath) => {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
};

const loadDemoData = () => {
  try {
    const db = require(path.join(rootDir, 'db'));

    return {
      cars: db.listCars(),
      teamMembers: db.listPublicTeamMembers(),
      homepageTeamMembers: db.listHomepageTeamMembers(),
      promotions: db.listPublicPromotions(),
      homepagePromotions: db.listHomepagePromotions(),
      buyRequests: db.listPublicCarBuyRequests(),
    };
  } catch (error) {
    console.warn(`Could not read SQLite demo data, using fallback data: ${error.message}`);
    return {
      cars: fallbackCars,
      teamMembers: fallbackTeamMembers,
      homepageTeamMembers: fallbackTeamMembers,
      promotions: fallbackPromotions,
      homepagePromotions: fallbackPromotions,
      buyRequests: fallbackBuyRequests,
    };
  }
};

const rewriteDataPaths = (value) => {
  if (Array.isArray(value)) {
    return value.map(rewriteDataPaths);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, rewriteDataPaths(entryValue)])
    );
  }

  if (typeof value === 'string' && normalizeAppAssetReference(value).startsWith('/uploads/')) {
    return '';
  }

  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('/api/')) {
    return prefixAppPath(value);
  }

  return value;
};

const appAssetExists = (assetPath) => {
  const normalizedAssetPath = normalizeAppAssetReference(assetPath);

  if (!normalizedAssetPath.startsWith('/') || normalizedAssetPath.startsWith('//')) {
    return true;
  }

  const [pathname] = normalizedAssetPath.split(/[?#]/);
  const pathParts = pathname.replace(/^\/+/, '').split('/');
  const topLevelDir = pathParts.shift();

  if (topLevelDir === 'images') {
    return fs.existsSync(path.join(rootDir, 'images', ...pathParts));
  }

  if (topLevelDir === 'uploads') {
    return false;
  }

  return fs.existsSync(path.join(rootDir, 'public', topLevelDir || '', ...pathParts));
};

const normalizeDemoDataAssets = (demoData) => {
  const fallbackCarImages = [
    '/images/rental-1.png',
    '/images/rental-2.png',
    '/images/rental-3.png',
    '/images/rental-4.png',
    '/images/rental-5.png',
    '/images/rental-6.png',
    '/images/rental-7.png',
  ];

  const cars = (demoData.cars || fallbackCars).map((car, index) => {
    const fallbackImage = fallbackCarImages[index % fallbackCarImages.length];
    const imageCandidates = Array.isArray(car.images)
      ? [...car.images, car.image]
      : [car.image];
    const images = imageCandidates
      .map(normalizeAppAssetReference)
      .filter(Boolean)
      .filter((image, imageIndex, imageList) => imageList.indexOf(image) === imageIndex)
      .filter(appAssetExists);
    const normalizedImages = images.length ? images : [fallbackImage];

    return {
      ...car,
      image: normalizedImages[0],
      images: normalizedImages,
    };
  });

  const normalizeMember = (member, index) => ({
    ...member,
    avatarUrl: appAssetExists(normalizeAppAssetReference(member.avatarUrl))
      ? normalizeAppAssetReference(member.avatarUrl)
      : `/images/team-${(index % 4) + 1}.jpg`,
  });

  const normalizePromotion = (promotion) => ({
    ...promotion,
    imageUrl: appAssetExists(normalizeAppAssetReference(promotion.imageUrl))
      ? normalizeAppAssetReference(promotion.imageUrl)
      : '/images/promotion-factors.jpg',
  });

  return {
    ...demoData,
    cars,
    teamMembers: (demoData.teamMembers || fallbackTeamMembers).map(normalizeMember),
    homepageTeamMembers: (demoData.homepageTeamMembers || fallbackTeamMembers).map(normalizeMember),
    promotions: (demoData.promotions || fallbackPromotions).map(normalizePromotion),
    homepagePromotions: (demoData.homepagePromotions || fallbackPromotions).map(normalizePromotion),
    buyRequests: demoData.buyRequests?.length ? demoData.buyRequests : fallbackBuyRequests,
  };
};

const createDemoApiScript = (demoData) => {
  const normalizedDemoData = normalizeDemoDataAssets(demoData);
  const payload = rewriteDataPaths({
    ...normalizedDemoData,
    budgetRanges: carBuyRequestBudgetLabels,
    siteConfig: {
      hotline: process.env.OKXE_HOTLINE || '0854955761',
    },
    demoUser: {
      id: 999,
      fullName: 'Khach Demo OkXe',
      email: 'demo@okxe.example',
      role: 'customer',
      phone: '0854955761',
      citizenId: '',
      birthDate: '',
      gender: '',
      avatarUrl: prefixAppPath('/images/team-1.jpg'),
      address: {
        province: 'TP. Ho Chi Minh',
        district: 'Quan 1',
        ward: '',
        detail: 'Showroom demo OkXe',
      },
    },
    demoAdmin: {
      id: 1000,
      fullName: 'Quan tri Demo',
      email: 'admin@okxe.example',
      role: 'admin',
      phone: '0854955761',
      avatarUrl: prefixAppPath('/images/team-2.jpg'),
    },
  });

  return `(() => {
  const basePath = ${JSON.stringify(basePath)};
  const data = ${JSON.stringify(payload, null, 2)};
  const originalFetch = window.fetch.bind(window);
  const favoriteIds = new Set(data.cars.slice(0, 2).map((car) => String(car.id)));

  const jsonResponse = (body, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    }));

  const getApiPath = (input) => {
    const rawUrl = typeof input === 'string' ? input : input?.url;
    const url = new URL(rawUrl || '', window.location.href);
    let pathname = url.pathname;

    if (basePath !== '/' && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length - 1) || '/';
    }

    return pathname;
  };

  const getMethod = (input, init = {}) =>
    String(init.method || input?.method || 'GET').toUpperCase();

  const getCarByPath = (apiPath) => {
    const id = decodeURIComponent(apiPath.replace('/api/cars/', ''));
    return data.cars.find((car) => String(car.id) === id);
  };

  const getFavoriteCars = () =>
    data.cars.filter((car) => favoriteIds.has(String(car.id)));

  const createAppointment = async (init = {}) => {
    const body = JSON.parse(init.body || '{}');
    const car = data.cars.find((item) => String(item.id) === String(body.carId)) || data.cars[0] || {};

    return jsonResponse({
      message: 'Demo Pages: da ghi nhan lich lai thu mau. Backend that se luu vao SQLite.',
      appointment: {
        id: Date.now(),
        userId: data.demoUser.id,
        carId: car.id,
        carName: car.name || '',
        carBrand: car.brand || '',
        carPrice: car.price || '',
        fullName: body.fullName || data.demoUser.fullName,
        phone: body.phone || data.demoUser.phone,
        preferredDate: body.preferredDate || '',
        preferredTimeSlot: body.preferredTimeSlot || '',
        status: 'pending',
        statusNote: '',
        createdAt: new Date().toISOString()
      }
    }, 201);
  };

  const handleApiRequest = async (apiPath, method, init = {}) => {
    if (method === 'GET' && apiPath === '/api/site-config') {
      return jsonResponse(data.siteConfig);
    }

    if (method === 'GET' && apiPath === '/api/cars') {
      return jsonResponse({ cars: data.cars });
    }

    if (method === 'GET' && apiPath.startsWith('/api/cars/')) {
      const car = getCarByPath(apiPath);
      return car ? jsonResponse({ car }) : jsonResponse({ message: 'Khong tim thay xe demo.' }, 404);
    }

    if (method === 'GET' && apiPath === '/api/team-members') {
      return jsonResponse({ teamMembers: data.homepageTeamMembers });
    }

    if (method === 'GET' && apiPath === '/api/team-members/all') {
      return jsonResponse({ teamMembers: data.teamMembers });
    }

    if (method === 'GET' && apiPath === '/api/promotions') {
      return jsonResponse({ promotions: data.homepagePromotions });
    }

    if (method === 'GET' && apiPath === '/api/promotions/all') {
      return jsonResponse({ promotions: data.promotions });
    }

    if (method === 'GET' && apiPath === '/api/car-buy-requests') {
      return jsonResponse({ requests: data.buyRequests, budgetRanges: data.budgetRanges });
    }

    if (method === 'GET' && apiPath === '/api/auth/me') {
      return jsonResponse({ user: data.demoUser });
    }

    if (method === 'GET' && apiPath === '/api/auth/admin-me') {
      return jsonResponse({ user: data.demoAdmin });
    }

    if (method === 'GET' && apiPath === '/api/favorites') {
      return jsonResponse({ cars: getFavoriteCars() });
    }

    if (apiPath.startsWith('/api/favorites/')) {
      const carId = decodeURIComponent(apiPath.replace('/api/favorites/', ''));
      const car = data.cars.find((item) => String(item.id) === carId);

      if (method === 'POST') {
        favoriteIds.add(carId);
      }

      if (method === 'DELETE') {
        favoriteIds.delete(carId);
      }

      return jsonResponse({ message: 'Demo Pages: da cap nhat xe yeu thich mau.', car });
    }

    if (method === 'GET' && apiPath === '/api/test-drive/cars') {
      return jsonResponse({ cars: data.cars.filter((car) => !String(car.actionText || '').toLowerCase().includes('ban')) });
    }

    if (method === 'GET' && apiPath === '/api/test-drive/appointments') {
      return jsonResponse({ appointments: [] });
    }

    if (method === 'POST' && apiPath === '/api/test-drive/appointments') {
      return createAppointment(init);
    }

    if (method === 'DELETE' && apiPath.startsWith('/api/test-drive/appointments/')) {
      return jsonResponse({ message: 'Demo Pages: da xoa lich hen mau.' });
    }

    if (method === 'GET' && apiPath === '/api/car-buy-requests/my') {
      return jsonResponse({ requests: [], budgetRanges: data.budgetRanges });
    }

    if (method === 'GET' && apiPath === '/api/notifications/my') {
      return jsonResponse({ notifications: [] });
    }

    if (method === 'GET' && apiPath === '/api/car-sell-requests/my') {
      return jsonResponse({ requests: [] });
    }

    if (method === 'GET' && apiPath === '/api/admin/cars') {
      return jsonResponse({ cars: data.cars });
    }

    if (method === 'GET' && apiPath === '/api/admin/promotions') {
      return jsonResponse({ promotions: data.promotions });
    }

    if (method === 'GET' && apiPath === '/api/admin/users') {
      return jsonResponse({ users: [data.demoAdmin, data.demoUser, ...data.teamMembers] });
    }

    if (method === 'GET' && apiPath === '/api/admin/test-drive-appointments') {
      return jsonResponse({ appointments: [] });
    }

    if (method === 'GET' && apiPath === '/api/admin/consultation-requests') {
      return jsonResponse({ requests: [] });
    }

    if (method === 'GET' && apiPath === '/api/admin/car-buy-requests') {
      return jsonResponse({ requests: data.buyRequests, budgetRanges: data.budgetRanges });
    }

    if (method === 'GET' && apiPath === '/api/admin/car-sell-requests') {
      return jsonResponse({ requests: [] });
    }

    if (method === 'POST' && apiPath === '/api/uploads/customer-car-images') {
      return jsonResponse({ images: [data.cars[0]?.image].filter(Boolean) }, 201);
    }

    if (method !== 'GET') {
      return jsonResponse({
        message: 'Demo Pages: thao tac giao dien da thanh cong. Ban backend Express se xu ly va luu du lieu that.'
      }, method === 'POST' ? 201 : 200);
    }

    return jsonResponse({ message: 'Endpoint demo chua duoc mock tren GitHub Pages.' }, 404);
  };

  window.fetch = (input, init = {}) => {
    const apiPath = getApiPath(input);

    if (apiPath.startsWith('/api/')) {
      return handleApiRequest(apiPath, getMethod(input, init), init);
    }

    return originalFetch(input, init);
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="/"]');

    if (!link || basePath === '/') {
      return;
    }

    const url = new URL(link.getAttribute('href'), window.location.origin);

    if (!url.pathname.startsWith(basePath) && !url.pathname.startsWith('/api/')) {
      event.preventDefault();
      window.location.href = basePath.replace(/\\/$/, '') + url.pathname + url.search + url.hash;
    }
  });
})();`;
};

const processTextFiles = (dirPath) => {
  fs.readdirSync(dirPath, { withFileTypes: true }).forEach((entry) => {
    const filePath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processTextFiles(filePath);
      return;
    }

    if (!/\.(html|css|js)$/i.test(entry.name) || entry.name === 'github-pages-demo.js') {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    if (entry.name.endsWith('.html') && !content.includes('github-pages-demo.js')) {
      const scriptTag = `    <script src="${prefixAppPath('/github-pages-demo.js')}"></script>\n`;
      content = content.replace(/<\/head>/i, `${scriptTag}</head>`);
    }

    fs.writeFileSync(filePath, rewriteTextForPages(content));
  });
};

const createRouteAliases = (demoData) => {
  copyFile(path.join(outputDir, 'home', 'index.html'), path.join(outputDir, 'index.html'));

  routePages.forEach((pageName, routeName) => {
    copyFile(
      path.join(outputDir, pageName, 'index.html'),
      path.join(outputDir, routeName, 'index.html')
    );
  });

  copyFile(path.join(outputDir, 'car-detail', 'index.html'), path.join(outputDir, 'cars', 'index.html'));
  copyFile(path.join(outputDir, 'car-detail', 'index.html'), path.join(outputDir, '404.html'));

  demoData.cars.forEach((car) => {
    copyFile(
      path.join(outputDir, 'car-detail', 'index.html'),
      path.join(outputDir, 'cars', String(car.id), 'index.html')
    );
  });
};

const build = () => {
  const demoData = loadDemoData();

  ensureCleanDir(outputDir);
  copyDir(path.join(rootDir, 'public'), outputDir);
  copyDir(path.join(rootDir, 'images'), path.join(outputDir, 'images'));
  createRouteAliases(demoData);
  processTextFiles(outputDir);
  fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');
  fs.writeFileSync(path.join(outputDir, 'github-pages-demo.js'), createDemoApiScript(demoData));

  console.log(`GitHub Pages demo built at ${path.relative(rootDir, outputDir)}`);
  console.log(`Base path: ${basePath}`);
};

build();
