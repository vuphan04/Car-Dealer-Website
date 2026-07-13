const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'okxe-kpi-test-'));
process.env.OKXE_DATA_DIR = testRoot;
const db = require(path.join(__dirname, '..', 'db.js'));

try {
  const report = db.getSalesKpiReport({ targetPeriod: '2026-07', from: '2026-07-01', to: '2026-07-31' });
  assert.equal(report.periodSummary.period, '2026-07');
  assert.equal(report.periodSummary.from, '2026-07-01');
  assert.equal(report.periodSummary.to, '2026-07-31');
  assert.ok(report.periodSummary.rows.length > 0, 'Báo cáo tổng kết phải có nhân viên');
  report.periodSummary.rows.forEach((row) => {
    assert.ok(['excellent', 'good', 'passed', 'improvement', 'failed', 'unrated'].includes(row.classification.code));
    assert.equal(row.outstandingRewardAmount, Math.max(0, row.rewardAmount - row.paidRewardAmount));
  });
  const record = report.records.find((item) => item.recordStatus === 'active' && item.rewardStatus === 'pending');
  assert.ok(record, 'Cần ít nhất một KPI demo chờ duyệt');
  assert.match(record.businessDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(record.policyPeriod, record.businessDate.slice(0, 7));

  assert.throws(() => db.createSalesKpiRecord({
    kpiType: record.kpiType, sourceId: record.sourceId, saleUserId: record.saleUserId,
    recordedByUser: { id: 1, fullName: 'KPI test' }
  }), (error) => error.code === 'SALES_KPI_DUPLICATED');

  const completedSaleSource = db.listAvailableSalesKpiSources().sales[0];
  assert.ok(completedSaleSource, 'Đơn hoàn tất chưa gắn sale phải xuất hiện trong nguồn chờ KPI');
  const completedSalePeriod = String(completedSaleSource.updatedAt || '').slice(0, 7);
  const assignee = db.listSalesKpiTargets(completedSalePeriod).find((target) =>
    ['sales_only', 'both'].includes(target.kpiRole) && target.commissionPerSale > 0
  );
  assert.ok(assignee, 'Cần chính sách bán xe hợp lệ trong kỳ demo');
  const manualSaleRecord = db.createSalesKpiRecord({
    kpiType: 'sale', sourceId: completedSaleSource.id, saleUserId: assignee.saleUserId,
    businessDate: String(completedSaleSource.updatedAt).slice(0, 10), creationMode: 'manual',
    recordedByUser: { id: 1, fullName: 'KPI test' }
  });
  assert.equal(manualSaleRecord.creationMode, 'manual');
  assert.equal(manualSaleRecord.rewardStatus, 'pending');
  assert.equal(manualSaleRecord.rewardAmount, assignee.commissionPerSale);

  const pendingAcquisitionRequest = db.createCarSellRequest({
    fullName: 'Khách kiểm thử KPI',
    phone: '0900000000',
    email: 'kpi-queue@example.com',
    brand: 'Toyota',
    category: 'SUV',
    name: 'Xe kiểm thử hàng chờ KPI',
    description: 'Dữ liệu kiểm thử luồng duyệt nhập kho trước, gắn nhân viên sau.',
    type: 'Xe cũ',
    priceText: '500 triệu VNĐ',
    priceValue: 500000000,
    year: 2024,
    fuel: 'Xăng',
    mileageText: '10.000 Km',
    mileageValue: 10000,
    seats: '5 chỗ',
    gearbox: 'Tự động',
    drivetrain: 'Dẫn động cầu trước',
    origin: 'Trong nước',
    condition: 'Xe cũ',
    color: 'Trắng',
    actionText: 'Còn xe'
  });
  const approvedAcquisition = db.approveCarSellRequest(pendingAcquisitionRequest.id, {
    statusNote: 'Đã duyệt kiểm thử hàng chờ KPI.',
    customerDealPriceText: '480 triệu VNĐ',
    customerDealPriceValue: 480000000,
    finalPriceText: '550 triệu VNĐ',
    finalPriceValue: 550000000
  });
  assert.equal(approvedAcquisition.request.status, 'approved');
  const completedAcquisitionSource = db.listAvailableSalesKpiSources().acquisitions.find(
    (source) => Number(source.id) === Number(pendingAcquisitionRequest.id)
  );
  assert.ok(completedAcquisitionSource, 'Xe đã duyệt nhập kho chưa gắn nhân viên phải xuất hiện trong nguồn chờ KPI');
  const completedAcquisitionPeriod = String(completedAcquisitionSource.updatedAt || '').slice(0, 7);
  const acquisitionAssignee = db.listSalesKpiTargets(completedAcquisitionPeriod).find((target) =>
    ['acquisition_only', 'both'].includes(target.kpiRole) && target.acquisitionRewardPerVehicle > 0
  );
  assert.ok(acquisitionAssignee, 'Cần chính sách nhập xe hợp lệ trong kỳ demo');
  const manualAcquisitionRecord = db.createSalesKpiRecord({
    kpiType: 'acquisition',
    sourceId: completedAcquisitionSource.id,
    saleUserId: acquisitionAssignee.saleUserId,
    businessDate: String(completedAcquisitionSource.updatedAt).slice(0, 10),
    creationMode: 'manual',
    recordedByUser: { id: 1, fullName: 'KPI test' }
  });
  assert.equal(manualAcquisitionRecord.creationMode, 'manual');
  assert.equal(manualAcquisitionRecord.rewardStatus, 'pending');
  assert.equal(manualAcquisitionRecord.rewardAmount, acquisitionAssignee.acquisitionRewardPerVehicle);

  assert.equal(db.updateSalesKpiRewardWorkflow(record.id, {
    status: 'approved', actorUser: { id: 1, fullName: 'KPI test' }
  }).rewardStatus, 'approved');
  assert.equal(db.updateSalesKpiRewardWorkflow(record.id, {
    status: 'pending', note: 'Hoàn nguyên test', actorUser: { id: 1, fullName: 'KPI test' }
  }).rewardStatus, 'pending');

  db.setSalesKpiPeriodStatus(record.policyPeriod, {
    status: 'locked', note: 'Kiểm thử khóa kỳ', actorUser: { id: 1, fullName: 'KPI test' }
  });
  const lockedTarget = db.listSalesKpiTargets(record.policyPeriod).find((target) => target.saleUserId === record.saleUserId);
  assert.throws(() => db.upsertSalesKpiTarget({
    period: record.policyPeriod, saleUserId: lockedTarget.saleUserId,
    kpiRole: lockedTarget.kpiRole, vehicleTarget: lockedTarget.vehicleTarget,
    grossProfitTarget: lockedTarget.grossProfitTarget,
    commissionPerSale: lockedTarget.commissionPerSale,
    acquisitionRewardPerVehicle: lockedTarget.acquisitionRewardPerVehicle,
    updatedByUser: { id: 1, fullName: 'KPI test' }
  }), (error) => error.code === 'SALES_KPI_PERIOD_LOCKED');
  process.stdout.write('KPI workflow tests passed.\n');
} finally {
  db.closeDatabase();
  fs.rmSync(testRoot, { recursive: true, force: true });
}
