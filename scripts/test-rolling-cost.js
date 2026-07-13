const assert = require('node:assert/strict');
const calculator = require('../public/car-detail/rolling-cost-calculator.js');

const hanoiNewCar = calculator.getDefaultFees({
  vehicleType: 'new',
  registrationArea: 'hanoi',
  seatGroup: 'under6',
});
assert.deepEqual(hanoiNewCar, {
  registrationRate: 12,
  plateFee: 14_000_000,
  inspectionFee: 90_000,
  roadFee: 1_560_000,
  insuranceFee: 480_700,
});

const otherProvinceCar = calculator.getDefaultFees({
  vehicleType: 'new',
  registrationArea: 'other',
  seatGroup: '6to9',
});
assert.equal(otherProvinceCar.plateFee, 140_000);
assert.equal(otherProvinceCar.registrationRate, 10);
assert.equal(otherProvinceCar.insuranceFee, 873_400);

const usedCar = calculator.getDefaultFees({
  vehicleType: 'used',
  registrationArea: 'hanoi',
  seatGroup: '6to9',
});
assert.equal(usedCar.registrationRate, 2);
assert.equal(usedCar.plateFee, 105_000);
assert.equal(usedCar.inspectionFee, 340_000);

const electricCar = calculator.getDefaultFees({
  vehicleType: 'new',
  registrationArea: 'hanoi',
  seatGroup: '6to9',
  batteryElectric: true,
});
assert.equal(electricCar.registrationRate, 0);

const tenSeatCar = calculator.getDefaultFees({
  vehicleType: 'new',
  registrationArea: 'hanoi',
  seatGroup: '10to11',
});
assert.equal(tenSeatCar.plateFee, 350_000);
assert.equal(tenSeatCar.inspectionFee, 330_000);
assert.equal(tenSeatCar.roadFee, 3_240_000);

assert.equal(calculator.getUsedCarRemainingRate(2025, 2026), 0.9);
assert.equal(calculator.getUsedCarRemainingRate(2023, 2026), 0.7);
assert.equal(calculator.getUsedCarRemainingRate(2020, 2026), 0.5);
assert.equal(calculator.getUsedCarRemainingRate(2016, 2026), 0.3);
assert.equal(calculator.getUsedCarRemainingRate(2015, 2026), 0.2);

const estimate = calculator.calculate({
  vehicleType: 'used',
  purchasePrice: 700_000_000,
  taxBasePrice: 1_000_000_000,
  registrationRate: 2,
  firstUseYear: 2023,
  plateFee: usedCar.plateFee,
  inspectionFee: usedCar.inspectionFee,
  roadFee: usedCar.roadFee,
  insuranceFee: usedCar.insuranceFee,
  otherFee: 0,
  calculationYear: 2026,
});
assert.equal(estimate.registrationFee, 14_000_000);
assert.equal(estimate.totalFees, 16_878_400);
assert.equal(estimate.total, 716_878_400);

assert.equal(calculator.isBatteryElectric('Điện'), true);
assert.equal(calculator.isBatteryElectric('Hybrid'), false);

console.log('Rolling cost calculator tests passed.');
