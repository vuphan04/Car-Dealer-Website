const db = require('../db');

const demoPromotions = [
  {
    title: 'Ưu đãi mua xe cũ tháng 5: Hỗ trợ sang tên và kiểm định 160 điểm',
    summary: 'Khách mua xe trong tháng này được hỗ trợ thủ tục sang tên, kiểm định chất lượng và tư vấn hồ sơ trả góp minh bạch.',
    content: 'OkXe triển khai chương trình ưu đãi mua xe cũ trong tháng 5 dành cho khách hàng cần một chiếc xe đã qua sử dụng nhưng vẫn đảm bảo nguồn gốc, chất lượng và chi phí hợp lý. Mỗi xe trong chương trình đều được tư vấn rõ tình trạng, lịch sử sử dụng, số km, giấy tờ pháp lý và các hạng mục cần kiểm tra trước khi xuống tiền. Khách hàng được hỗ trợ quy trình sang tên, chuẩn bị hồ sơ mua bán, tư vấn chi phí lăn bánh và lựa chọn phương án tài chính phù hợp. Đây là chương trình phù hợp với người mua xe lần đầu, gia đình cần nâng cấp xe hoặc khách hàng muốn đổi xe trong ngân sách kiểm soát được.',
    badgeText: 'Ưu đãi tháng 5',
    imageUrl: '/images/showroom-sales-consultant.png',
    ctaText: 'Nhận tư vấn ưu đãi',
    ctaUrl: '#footer',
    startsAt: '2026-05-01',
    endsAt: '2026-05-31',
    showOnHome: true,
    displayOrder: 1,
  },
  {
    title: 'Gói trả góp xe cũ lãi suất linh hoạt cho khách hàng cá nhân',
    summary: 'Tư vấn phương án trả góp xe cũ theo ngân sách, hỗ trợ chuẩn bị hồ sơ và dự toán chi phí hàng tháng trước khi mua xe.',
    content: 'Chương trình trả góp xe cũ tại OkXe giúp khách hàng dễ dàng tiếp cận các mẫu sedan, SUV và xe gia đình đã qua sử dụng với kế hoạch tài chính rõ ràng. Đội ngũ tư vấn hỗ trợ ước tính khoản trả trước, khoản thanh toán hàng tháng, thời hạn vay và các chi phí liên quan để khách hàng chủ động quyết định. Nội dung tư vấn tập trung vào tính minh bạch, khả năng chi trả thực tế và lựa chọn xe phù hợp với mục đích sử dụng. Khách hàng có thể gửi nhu cầu, ngân sách dự kiến và dòng xe quan tâm để được đề xuất phương án phù hợp.',
    badgeText: 'Trả góp linh hoạt',
    imageUrl: '/images/blog-1.jpg',
    ctaText: 'Tính khoản trả góp',
    ctaUrl: '#footer',
    startsAt: '2026-05-01',
    endsAt: '2026-06-30',
    showOnHome: true,
    displayOrder: 2,
  },
  {
    title: 'Miễn phí đặt lịch lái thử cho các mẫu SUV và sedan nổi bật',
    summary: 'Đặt lịch lái thử xe cũ tại showroom để kiểm tra cảm giác lái, nội thất, động cơ và độ phù hợp trước khi quyết định mua.',
    content: 'Lái thử là bước quan trọng khi chọn mua xe cũ, đặc biệt với khách hàng đang phân vân giữa nhiều dòng xe hoặc nhiều mức ngân sách. OkXe hỗ trợ khách hàng đặt lịch lái thử các mẫu xe đang có sẵn tại showroom, giúp kiểm tra khả năng vận hành, độ êm, tầm nhìn, không gian nội thất và các tiện nghi quan trọng. Nhân viên tư vấn sẽ chuẩn bị xe, giải thích thông số, tình trạng thực tế và hỗ trợ so sánh các lựa chọn phù hợp. Chương trình phù hợp với khách hàng muốn trải nghiệm thực tế trước khi chốt xe.',
    badgeText: 'Lái thử miễn phí',
    imageUrl: '/images/test-drive-hero.png',
    ctaText: 'Đặt lịch lái thử',
    ctaUrl: '#test-drive',
    startsAt: '2026-05-01',
    endsAt: '2026-07-31',
    showOnHome: true,
    displayOrder: 3,
  },
  {
    title: 'Tặng gói chăm sóc nội thất khi mua xe đã qua sử dụng tại OkXe',
    summary: 'Khách hàng hoàn tất giao dịch xe cũ được tặng gói vệ sinh, chăm sóc nội thất cơ bản giúp xe sạch đẹp khi nhận bàn giao.',
    content: 'Để khách hàng yên tâm hơn khi nhận xe, OkXe áp dụng chương trình tặng gói chăm sóc nội thất cơ bản cho một số mẫu xe đã qua sử dụng. Gói quà tặng tập trung vào vệ sinh khoang lái, làm sạch ghế, khử mùi và kiểm tra các chi tiết nội thất thường dùng. Chương trình giúp chiếc xe có trạng thái chỉn chu hơn trước khi bàn giao, đồng thời nâng cao trải nghiệm sở hữu xe cũ. Khách hàng nên liên hệ tư vấn viên để kiểm tra xe đang quan tâm có thuộc danh sách áp dụng chương trình hay không.',
    badgeText: 'Quà tặng bàn giao',
    imageUrl: '/images/blog-2.jpg',
    ctaText: 'Xem xe áp dụng',
    ctaUrl: '#cars',
    startsAt: '2026-05-01',
    endsAt: '2026-06-15',
    showOnHome: true,
    displayOrder: 4,
  },
  {
    title: 'Thu cũ đổi mới: Hỗ trợ định giá xe hiện tại khi nâng cấp xe',
    summary: 'Khách hàng muốn đổi xe được hỗ trợ định giá xe đang sử dụng và tư vấn mẫu xe cũ phù hợp với ngân sách nâng cấp.',
    content: 'Chương trình thu cũ đổi mới dành cho khách hàng đang sở hữu xe và muốn nâng cấp lên mẫu xe phù hợp hơn với nhu cầu gia đình, công việc hoặc trải nghiệm cá nhân. OkXe hỗ trợ ghi nhận thông tin xe hiện tại, tình trạng sử dụng, đời xe, số km, giấy tờ và nhu cầu đổi xe để tư vấn phương án hợp lý. Khách hàng có thể dùng giá trị xe hiện tại làm một phần ngân sách mua xe tiếp theo, giúp quá trình đổi xe rõ ràng và tiết kiệm thời gian hơn. Nội dung tư vấn được thực hiện minh bạch, phù hợp với mục tiêu của website bán ô tô cũ.',
    badgeText: 'Thu cũ đổi mới',
    imageUrl: '/images/blog-3.jpg',
    ctaText: 'Định giá xe của tôi',
    ctaUrl: '#footer',
    startsAt: '2026-05-01',
    endsAt: '2026-08-31',
    showOnHome: true,
    displayOrder: 5,
  },
];

const demoImageUrls = new Set(demoPromotions.map((promotion) => promotion.imageUrl));
const demoTitles = new Set(demoPromotions.map((promotion) => promotion.title));

db.listPromotions()
  .filter((promotion) =>
    demoTitles.has(promotion.title) ||
    (demoImageUrls.has(promotion.imageUrl) && promotion.displayOrder >= 1 && promotion.displayOrder <= 5)
  )
  .forEach((promotion) => db.deletePromotion(promotion.id));

const createdPromotions = demoPromotions.map((promotion) => db.createPromotion(promotion));

console.log(JSON.stringify({
  created: createdPromotions.length,
  visibleOnHome: db.listHomepagePromotions().length,
  titles: createdPromotions.map((promotion) => promotion.title),
}, null, 2));
