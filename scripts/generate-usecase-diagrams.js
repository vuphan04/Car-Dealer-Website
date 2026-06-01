const fs = require('node:fs');
const path = require('node:path');

const outputDirArgIndex = process.argv.indexOf('--out');
const outputDir = outputDirArgIndex >= 0
  ? path.resolve(process.argv[outputDirArgIndex + 1])
  : path.join(__dirname, '..', 'docs', 'usecase-diagrams');

const systemBox = { x: 150, y: 35, width: 920, height: 680 };
const colors = {
  line: '#303030',
  fill: '#fff4cf',
  stroke: '#303030',
  text: '#202020',
  muted: '#5a5a5a',
  background: '#ffffff',
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const splitLabel = (label) => String(label).split('\n');

const useCase = (id, label, x, y, rx = 118, ry = 38) => ({
  id,
  label,
  x,
  y,
  rx,
  ry: Math.max(ry, 26 + splitLabel(label).length * 10),
});

const actor = (id, label, side, x, y) => ({
  id,
  label,
  side,
  x,
  y,
});

const drawText = (label, x, y, {
  size = 17,
  weight = 500,
  anchor = 'middle',
  lineHeight = 20,
  color = colors.text,
} = {}) => {
  const lines = splitLabel(label);
  const firstY = y - ((lines.length - 1) * lineHeight) / 2;

  return [
    `<text x="${x}" y="${firstY}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">`,
    ...lines.map((line, index) =>
      `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    ),
    '</text>',
  ].join('');
};

const drawActor = (item) => {
  const { x, y } = item;
  const labelX = item.side === 'left' ? x - 4 : x + 4;
  const labelAnchor = item.side === 'left' ? 'end' : 'start';

  return `
    <g id="actor-${item.id}" stroke="${colors.stroke}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="${x}" cy="${y - 48}" r="13" fill="${colors.background}"/>
      <line x1="${x}" y1="${y - 35}" x2="${x}" y2="${y + 10}"/>
      <line x1="${x - 28}" y1="${y - 15}" x2="${x + 28}" y2="${y - 15}"/>
      <line x1="${x}" y1="${y + 10}" x2="${x - 24}" y2="${y + 48}"/>
      <line x1="${x}" y1="${y + 10}" x2="${x + 24}" y2="${y + 48}"/>
    </g>
    ${drawText(item.label, labelX, y + 76, { size: 17, weight: 600, anchor: labelAnchor })}
  `;
};

const drawUseCase = (item) => `
  <g id="uc-${item.id}">
    <ellipse cx="${item.x}" cy="${item.y}" rx="${item.rx}" ry="${item.ry}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1.8"/>
    ${drawText(item.label, item.x, item.y + 5, { size: 16, weight: 600 })}
  </g>
`;

const drawAssociation = (from, to) => `
  <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${colors.line}" stroke-width="1.8"/>
`;

const drawDependency = (from, to, label = '<<include>>') => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - 8;

  return `
    <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${colors.muted}" stroke-width="1.4" stroke-dasharray="7 6" marker-end="url(#arrow)"/>
    ${drawText(label, midX, midY, { size: 13, weight: 500, color: colors.muted })}
  `;
};

const findById = (items, id) => {
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    throw new Error(`Missing diagram item: ${id}`);
  }

  return item;
};

const renderDiagram = ({
  title,
  actors,
  useCases,
  links,
  dependencies = [],
  width = 1220,
  height = 770,
  note = '',
}) => {
  const titleTabWidth = Math.min(300, Math.max(210, title.length * 8));
  const byId = [...actors, ...useCases].reduce((map, item) => {
    map.set(item.id, item);
    return map;
  }, new Map());

  const resolve = (id) => {
    const item = byId.get(id);

    if (!item) {
      throw new Error(`Unknown link id: ${id}`);
    }

    return item;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L8,3 z" fill="${colors.muted}"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="${colors.background}"/>
  <rect x="${systemBox.x}" y="${systemBox.y}" width="${systemBox.width}" height="${systemBox.height}" fill="none" stroke="${colors.stroke}" stroke-width="2"/>
  <path d="M${systemBox.x},${systemBox.y} H${systemBox.x + titleTabWidth} L${systemBox.x + titleTabWidth - 22},${systemBox.y + 36} H${systemBox.x} Z" fill="${colors.background}" stroke="${colors.stroke}" stroke-width="1.8"/>
  ${drawText(title, systemBox.x + 10, systemBox.y + 22, { size: 15, weight: 600, anchor: 'start', lineHeight: 17 })}
  ${links.map(([fromId, toId]) => drawAssociation(resolve(fromId), resolve(toId))).join('\n')}
  ${dependencies.map(([fromId, toId, label]) => drawDependency(resolve(fromId), resolve(toId), label)).join('\n')}
  ${useCases.map(drawUseCase).join('\n')}
  ${actors.map(drawActor).join('\n')}
  ${note ? drawText(note, width / 2, height - 22, { size: 13, weight: 500, color: colors.muted }) : ''}
</svg>
`;
};

const diagrams = [
  {
    fileName: '01-usecase-overview-okxe.svg',
    title: 'UC tổng quát\nWebsite bán ô tô cũ OkXe',
    actors: [
      actor('guest', 'Khách vãng lai', 'left', 70, 195),
      actor('customer', 'Khách hàng', 'left', 70, 535),
      actor('staff', 'Nhân viên bán hàng', 'right', 1148, 245),
      actor('admin', 'Quản trị viên', 'right', 1148, 555),
    ],
    useCases: [
      useCase('browseCars', 'Tra cứu danh mục xe', 355, 105),
      useCase('carDetail', 'Xem chi tiết xe', 570, 145),
      useCase('compare', 'So sánh xe', 815, 115),
      useCase('publicContent', 'Xem khuyến mại,\ntin mua xe, tư vấn bán hàng', 610, 250, 145, 48),
      useCase('auth', 'Đăng ký / Đăng nhập /\nKhôi phục mật khẩu', 365, 320, 140, 50),
      useCase('profile', 'Quản lý hồ sơ,\nyêu thích và thông báo', 650, 380, 145, 50),
      useCase('consult', 'Gửi yêu cầu tư vấn\nvà báo giá', 365, 465, 132, 48),
      useCase('testDrive', 'Đăng ký lái thử', 640, 500),
      useCase('buyRequest', 'Đăng tin cần mua xe', 880, 415, 130, 42),
      useCase('adminCars', 'Quản lý kho xe', 875, 250),
      useCase('adminOps', 'Xử lý tư vấn,\nlái thử, tin mua xe', 880, 535, 145, 50),
      useCase('adminUsers', 'Quản lý khách hàng,\nnhân viên, admin', 610, 620, 145, 50),
      useCase('adminPromo', 'Quản lý khuyến mại', 355, 620, 130, 40),
    ],
    links: [
      ['guest', 'browseCars'], ['guest', 'carDetail'], ['guest', 'compare'], ['guest', 'publicContent'],
      ['guest', 'auth'], ['guest', 'consult'], ['guest', 'buyRequest'],
      ['customer', 'browseCars'], ['customer', 'profile'], ['customer', 'consult'], ['customer', 'testDrive'], ['customer', 'buyRequest'],
      ['staff', 'adminCars'], ['staff', 'adminOps'], ['staff', 'adminPromo'],
      ['admin', 'adminCars'], ['admin', 'adminOps'], ['admin', 'adminUsers'], ['admin', 'adminPromo'],
    ],
    dependencies: [
      ['testDrive', 'auth', '<<include>>'],
      ['profile', 'auth', '<<include>>'],
      ['adminOps', 'adminCars', 'dùng dữ liệu xe'],
    ],
  },
  {
    fileName: '02-usecase-customer-car-search.svg',
    title: 'UC khách tìm mua xe',
    actors: [
      actor('guest', 'Khách vãng lai', 'left', 70, 380),
      actor('customer', 'Khách hàng', 'right', 1148, 380),
    ],
    useCases: [
      useCase('home', 'Xem trang chủ\nvà slider xe mới', 330, 95, 130, 48),
      useCase('quickSearch', 'Tìm kiếm nhanh\ntrên trang chủ', 610, 100, 130, 48),
      useCase('inventory', 'Mở danh sách xe\n/mua-xe', 875, 100, 125, 48),
      useCase('filter', 'Lọc xe theo hãng,\ngiá, năm, hộp số...', 335, 235, 145, 52),
      useCase('advancedFilter', 'Mở rộng bộ lọc:\nnhiên liệu, màu,\ndẫn động, số chỗ', 610, 245, 145, 58),
      useCase('sort', 'Sắp xếp kết quả', 875, 235, 118, 38),
      useCase('detail', 'Xem chi tiết xe\n/cars/:id', 335, 385, 130, 48),
      useCase('gallery', 'Xem ảnh, mô tả\nvà thông số đầy đủ', 610, 385, 145, 50),
      useCase('compare', 'So sánh tối đa\n3 xe', 875, 385, 118, 48),
      useCase('consult', 'Gửi yêu cầu tư vấn\nvà báo giá', 335, 535, 135, 48),
      useCase('favorite', 'Lưu / bỏ xe yêu thích', 610, 535, 138, 38),
      useCase('favoriteList', 'Xem danh sách\nxe yêu thích', 875, 535, 130, 48),
      useCase('contactTeam', 'Xem đội ngũ tư vấn\nvà liên hệ nhanh', 610, 650, 145, 50),
    ],
    links: [
      ['guest', 'home'], ['guest', 'quickSearch'], ['guest', 'inventory'], ['guest', 'filter'], ['guest', 'detail'], ['guest', 'compare'], ['guest', 'consult'], ['guest', 'contactTeam'],
      ['customer', 'home'], ['customer', 'inventory'], ['customer', 'detail'], ['customer', 'compare'], ['customer', 'consult'], ['customer', 'favorite'], ['customer', 'favoriteList'], ['customer', 'contactTeam'],
    ],
    dependencies: [
      ['quickSearch', 'inventory', 'mở kết quả'],
      ['filter', 'advancedFilter', '<<extend>>'],
      ['detail', 'gallery', '<<include>>'],
      ['favoriteList', 'favorite', '<<include>>'],
    ],
  },
  {
    fileName: '03-usecase-account-notifications.svg',
    title: 'UC tài khoản và thông báo',
    actors: [
      actor('guest', 'Khách vãng lai', 'left', 70, 305),
      actor('customer', 'Khách hàng', 'right', 1148, 385),
      actor('mail', 'Dịch vụ Email', 'left', 70, 615),
    ],
    useCases: [
      useCase('signup', 'Đăng ký tài khoản', 345, 100),
      useCase('login', 'Đăng nhập', 610, 95, 105, 36),
      useCase('logout', 'Đăng xuất', 855, 95, 105, 36),
      useCase('forgot', 'Yêu cầu OTP\nquên mật khẩu', 345, 245, 130, 48),
      useCase('sendOtp', 'Gửi email OTP\nhoặc file preview', 610, 245, 145, 48),
      useCase('reset', 'Đặt lại mật khẩu', 855, 245, 125, 40),
      useCase('profile', 'Xem thông tin tài khoản', 345, 395, 140, 40),
      useCase('updateProfile', 'Cập nhật hồ sơ:\nSĐT, CCCD, ngày sinh,\ngiới tính, địa chỉ', 610, 395, 155, 62),
      useCase('avatar', 'Cập nhật ảnh đại diện', 855, 395, 140, 40),
      useCase('favorites', 'Xem xe yêu thích', 345, 540, 125, 40),
      useCase('notifications', 'Xem thông báo cá nhân', 610, 540, 145, 40),
      useCase('removeNotice', 'Xóa thông báo / lịch\nkhông còn nhu cầu', 855, 540, 150, 48),
      useCase('noticeTypes', 'Nhận trạng thái lái thử,\ntin mua xe, khuyến mại', 610, 655, 155, 50),
    ],
    links: [
      ['guest', 'signup'], ['guest', 'login'], ['guest', 'forgot'], ['guest', 'reset'],
      ['customer', 'logout'], ['customer', 'profile'], ['customer', 'updateProfile'], ['customer', 'avatar'], ['customer', 'favorites'], ['customer', 'notifications'], ['customer', 'removeNotice'],
      ['mail', 'sendOtp'],
    ],
    dependencies: [
      ['forgot', 'sendOtp', '<<include>>'],
      ['reset', 'sendOtp', 'dùng OTP'],
      ['updateProfile', 'profile', '<<extend>>'],
      ['notifications', 'noticeTypes', '<<include>>'],
    ],
  },
  {
    fileName: '04-usecase-test-drive-consultation.svg',
    title: 'UC lái thử và tư vấn',
    actors: [
      actor('guest', 'Khách vãng lai', 'left', 70, 210),
      actor('customer', 'Khách hàng', 'left', 70, 540),
      actor('staff', 'Nhân viên / Admin', 'right', 1148, 380),
    ],
    useCases: [
      useCase('consultForm', 'Gửi yêu cầu tư vấn\ntheo xe đang xem', 345, 100, 145, 48),
      useCase('consultType', 'Chọn nhu cầu:\nbáo giá, trả góp,\nlăn bánh, xem xe', 610, 100, 145, 58),
      useCase('consultManage', 'Xem / tìm yêu cầu\ntư vấn', 875, 100, 135, 48),
      useCase('consultStatus', 'Cập nhật trạng thái:\nmới, đã liên hệ,\nđã hẹn, chốt, fail', 875, 235, 155, 62),
      useCase('consultDelete', 'Xóa yêu cầu tư vấn', 610, 235, 130, 38),
      useCase('loginRequired', 'Đăng nhập khách hàng', 345, 355, 135, 40),
      useCase('testForm', 'Đăng ký lái thử', 610, 355, 120, 38),
      useCase('pickCar', 'Chọn xe còn hàng\nhoặc xe yêu thích', 345, 500, 145, 50),
      useCase('pickSlot', 'Chọn ngày và\nkhung giờ lái thử', 610, 500, 135, 48),
      useCase('policy', 'Xác nhận bằng lái,\nnhận thông tin,\nđồng ý chính sách', 875, 500, 148, 58),
      useCase('testManage', 'Xem / tìm lịch hẹn\nvà thống kê', 345, 650, 145, 48),
      useCase('testStatus', 'Đồng ý / hủy / treo\nlịch hẹn', 610, 650, 145, 48),
      useCase('reschedule', 'Đổi lịch khi trùng\nxe + ngày + giờ', 875, 650, 145, 48),
    ],
    links: [
      ['guest', 'consultForm'], ['guest', 'consultType'],
      ['customer', 'consultForm'], ['customer', 'loginRequired'], ['customer', 'testForm'], ['customer', 'pickCar'], ['customer', 'pickSlot'], ['customer', 'policy'],
      ['staff', 'consultManage'], ['staff', 'consultStatus'], ['staff', 'consultDelete'], ['staff', 'testManage'], ['staff', 'testStatus'], ['staff', 'reschedule'],
    ],
    dependencies: [
      ['consultForm', 'consultType', '<<include>>'],
      ['testForm', 'loginRequired', '<<include>>'],
      ['testForm', 'pickCar', '<<include>>'],
      ['testForm', 'pickSlot', '<<include>>'],
      ['testForm', 'policy', '<<include>>'],
      ['testStatus', 'reschedule', '<<extend>>'],
    ],
  },
  {
    fileName: '05-usecase-buy-requests-promotions-team.svg',
    title: 'UC tin mua xe, khuyến mại,\nđội ngũ tư vấn',
    actors: [
      actor('guest', 'Khách vãng lai', 'left', 70, 320),
      actor('customer', 'Khách hàng', 'left', 70, 575),
      actor('staff', 'Nhân viên / Admin', 'right', 1148, 380),
    ],
    useCases: [
      useCase('viewBuyPosts', 'Xem tin mua ô tô\nđã duyệt', 340, 95, 135, 48),
      useCase('filterBuyPosts', 'Lọc theo mức tiền,\ntỉnh thành, phân trang', 610, 95, 150, 50),
      useCase('createBuyPost', 'Đăng tin cần mua xe', 875, 95, 135, 40),
      useCase('vietnameseInput', 'Nhập nội dung với\nbộ gõ Telex/VNI/VIQR', 610, 225, 155, 50),
      useCase('myBuyPosts', 'Xem trạng thái tin\nđã gửi', 875, 225, 135, 48),
      useCase('promoPublic', 'Xem danh sách\nkhuyến mại công khai', 340, 365, 150, 50),
      useCase('promoSearch', 'Tìm kiếm và mở\nchi tiết khuyến mại', 610, 365, 145, 50),
      useCase('teamPublic', 'Xem đội ngũ tư vấn\nbán hàng', 875, 365, 145, 48),
      useCase('teamSearch', 'Tìm nhân viên,\nxem tiểu sử,\nliên hệ nhanh', 610, 505, 145, 58),
      useCase('manageBuyPosts', 'Quản lý tin mua xe:\ntìm, duyệt, từ chối, xóa', 340, 635, 160, 52),
      useCase('managePromos', 'Quản lý khuyến mại:\nthêm, sửa, xóa,\nbật/tắt, sắp xếp', 610, 635, 160, 62),
      useCase('promoImage', 'Tải ảnh và cắt banner\nkhuyến mại 2:1', 875, 635, 155, 48),
    ],
    links: [
      ['guest', 'viewBuyPosts'], ['guest', 'filterBuyPosts'], ['guest', 'createBuyPost'], ['guest', 'promoPublic'], ['guest', 'promoSearch'], ['guest', 'teamPublic'], ['guest', 'teamSearch'],
      ['customer', 'createBuyPost'], ['customer', 'myBuyPosts'], ['customer', 'promoPublic'], ['customer', 'teamPublic'],
      ['staff', 'manageBuyPosts'], ['staff', 'managePromos'], ['staff', 'promoImage'],
    ],
    dependencies: [
      ['viewBuyPosts', 'filterBuyPosts', '<<include>>'],
      ['createBuyPost', 'vietnameseInput', '<<include>>'],
      ['promoPublic', 'promoSearch', '<<include>>'],
      ['teamPublic', 'teamSearch', '<<include>>'],
      ['managePromos', 'promoImage', '<<include>>'],
    ],
  },
  {
    fileName: '06-usecase-system-admin.svg',
    title: 'UC quản trị hệ thống',
    actors: [
      actor('staff', 'Nhân viên bán hàng', 'left', 70, 380),
      actor('admin', 'Quản trị viên', 'right', 1148, 380),
    ],
    useCases: [
      useCase('adminLogin', 'Đăng nhập / đăng xuất\ntrang quản trị', 350, 85, 145, 48),
      useCase('viewAccount', 'Xem tài khoản\nđang đăng nhập', 610, 85, 130, 48),
      useCase('carStats', 'Xem thống kê kho xe', 875, 85, 135, 40),
      useCase('carCrud', 'Quản lý xe:\nthêm, sửa, xóa,\ntìm kiếm, tải lại', 350, 235, 145, 58),
      useCase('carImages', 'Upload nhiều ảnh xe', 610, 235, 135, 40),
      useCase('carValidate', 'Kiểm tra dữ liệu xe:\nhãng, giá, mô tả,\nthông số cố định', 875, 235, 160, 62),
      useCase('customerManage', 'Quản lý khách hàng:\nxem chi tiết, sửa hồ sơ', 350, 395, 155, 50),
      useCase('staffManage', 'Quản lý nhân viên:\ntạo, sửa, xóa,\nhồ sơ bán hàng', 610, 395, 150, 58),
      useCase('adminManage', 'Quản lý admin:\ntạo/sửa/xóa,\nbảo vệ admin cuối', 875, 395, 155, 58),
      useCase('opsManage', 'Xử lý lịch lái thử,\nyêu cầu tư vấn,\ntin mua xe', 350, 575, 150, 58),
      useCase('promoManage', 'Quản lý khuyến mại\nvà ảnh banner', 610, 575, 145, 48),
      useCase('roleGuard', 'Phân quyền:\nstaff thao tác nghiệp vụ,\nadmin quản lý tài khoản', 875, 575, 160, 62),
    ],
    links: [
      ['staff', 'adminLogin'], ['staff', 'viewAccount'], ['staff', 'carStats'], ['staff', 'carCrud'], ['staff', 'carImages'], ['staff', 'carValidate'], ['staff', 'customerManage'], ['staff', 'opsManage'], ['staff', 'promoManage'],
      ['admin', 'adminLogin'], ['admin', 'viewAccount'], ['admin', 'carStats'], ['admin', 'carCrud'], ['admin', 'carImages'], ['admin', 'carValidate'], ['admin', 'customerManage'], ['admin', 'staffManage'], ['admin', 'adminManage'], ['admin', 'opsManage'], ['admin', 'promoManage'], ['admin', 'roleGuard'],
    ],
    dependencies: [
      ['carCrud', 'carImages', '<<include>>'],
      ['carCrud', 'carValidate', '<<include>>'],
      ['staffManage', 'roleGuard', '<<include>>'],
      ['adminManage', 'roleGuard', '<<include>>'],
    ],
  },
];

fs.mkdirSync(outputDir, { recursive: true });

for (const diagram of diagrams) {
  const svg = renderDiagram(diagram);
  const targetPath = path.join(outputDir, diagram.fileName);
  fs.writeFileSync(targetPath, svg, 'utf8');
  console.log(targetPath);
}
