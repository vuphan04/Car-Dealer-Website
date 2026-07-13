(function initRollingCostCalculator(root, factory) {
    const calculator = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = calculator;
    }

    if (root) {
        root.OKXERollingCost = calculator;
    }
}(typeof window !== 'undefined' ? window : globalThis, () => {
    const POLICY = Object.freeze({
        version: '2026-01',
        areas: Object.freeze({
            hanoi: Object.freeze({ registrationRate: 12, passengerPlateFee: 14000000, otherCarPlateFee: 350000 }),
            hochiminh: Object.freeze({ registrationRate: 10, passengerPlateFee: 14000000, otherCarPlateFee: 350000 }),
            other: Object.freeze({ registrationRate: 10, passengerPlateFee: 140000, otherCarPlateFee: 100000 })
        }),
        usedRegistrationRate: 2,
        usedRegistrationFee: 105000,
        annualRoadFee: Object.freeze({
            under6: 1560000,
            '6to9': 1560000,
            '10to11': 3240000
        }),
        inspectionAndCertificateFee: Object.freeze({
            new: Object.freeze({ under6: 90000, '6to9': 90000, '10to11': 330000 }),
            used: Object.freeze({ under6: 340000, '6to9': 340000, '10to11': 330000 })
        }),
        compulsoryInsuranceWithVat: Object.freeze({
            under6: 480700,
            '6to9': 873400,
            '10to11': 873400
        })
    });

    const toNonNegativeNumber = (value) => {
        const numberValue = Number(value);
        return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
    };

    const normalizeSeatGroup = (seatGroup) => (
        Object.hasOwn(POLICY.annualRoadFee, seatGroup) ? seatGroup : 'under6'
    );

    const getSeatGroup = (seatCount) => {
        const normalizedSeatCount = Math.max(0, Number(seatCount) || 0);

        if (normalizedSeatCount >= 10) return '10to11';
        if (normalizedSeatCount >= 6) return '6to9';
        return 'under6';
    };

    const isBatteryElectric = (fuel) => {
        const normalizedFuel = String(fuel || '').trim().toLocaleLowerCase('vi-VN');
        return ['điện', 'dien', 'electric', 'battery electric'].includes(normalizedFuel);
    };

    const getUsedCarRemainingRate = (firstUseYear, calculationYear = new Date().getFullYear()) => {
        const normalizedCalculationYear = Math.max(1980, Number(calculationYear) || new Date().getFullYear());
        const normalizedYear = Math.min(
            normalizedCalculationYear,
            Math.max(1980, Number(firstUseYear) || normalizedCalculationYear)
        );
        const yearsInUse = Math.max(0, normalizedCalculationYear - normalizedYear);

        if (yearsInUse <= 1) return 0.9;
        if (yearsInUse <= 3) return 0.7;
        if (yearsInUse <= 6) return 0.5;
        if (yearsInUse <= 10) return 0.3;
        return 0.2;
    };

    const getSuggestedUsedTaxBase = ({ purchasePrice, firstUseYear, calculationYear }) => {
        const normalizedPurchasePrice = toNonNegativeNumber(purchasePrice);
        const remainingRate = getUsedCarRemainingRate(firstUseYear, calculationYear);

        if (!normalizedPurchasePrice || !remainingRate) return normalizedPurchasePrice;
        return Math.round((normalizedPurchasePrice / remainingRate) / 1000000) * 1000000;
    };

    const getDefaultFees = ({ vehicleType, registrationArea, seatGroup, batteryElectric = false }) => {
        const isUsed = vehicleType === 'used';
        const normalizedSeatGroup = normalizeSeatGroup(seatGroup);
        const area = POLICY.areas[registrationArea] || POLICY.areas.hanoi;
        const passengerUpToNineSeats = normalizedSeatGroup !== '10to11';

        return {
            registrationRate: isUsed
                ? POLICY.usedRegistrationRate
                : batteryElectric ? 0 : area.registrationRate,
            plateFee: isUsed
                ? POLICY.usedRegistrationFee
                : passengerUpToNineSeats ? area.passengerPlateFee : area.otherCarPlateFee,
            inspectionFee: POLICY.inspectionAndCertificateFee[isUsed ? 'used' : 'new'][normalizedSeatGroup],
            roadFee: POLICY.annualRoadFee[normalizedSeatGroup],
            insuranceFee: POLICY.compulsoryInsuranceWithVat[normalizedSeatGroup]
        };
    };

    const calculate = ({
        vehicleType,
        purchasePrice,
        taxBasePrice,
        registrationRate,
        firstUseYear,
        plateFee,
        inspectionFee,
        roadFee,
        insuranceFee,
        otherFee,
        calculationYear
    }) => {
        const isUsed = vehicleType === 'used';
        const normalizedPurchasePrice = toNonNegativeNumber(purchasePrice);
        const normalizedTaxBasePrice = toNonNegativeNumber(taxBasePrice);
        const normalizedRegistrationRate = Math.min(30, toNonNegativeNumber(registrationRate));
        const remainingRate = isUsed
            ? getUsedCarRemainingRate(firstUseYear, calculationYear)
            : 1;
        const registrationFee = normalizedTaxBasePrice * remainingRate * normalizedRegistrationRate / 100;
        const normalizedFees = {
            plateFee: toNonNegativeNumber(plateFee),
            inspectionFee: toNonNegativeNumber(inspectionFee),
            roadFee: toNonNegativeNumber(roadFee),
            insuranceFee: toNonNegativeNumber(insuranceFee),
            otherFee: toNonNegativeNumber(otherFee)
        };
        const totalFees = registrationFee + Object.values(normalizedFees).reduce((sum, fee) => sum + fee, 0);

        return {
            isUsed,
            purchasePrice: normalizedPurchasePrice,
            taxBasePrice: normalizedTaxBasePrice,
            registrationRate: normalizedRegistrationRate,
            remainingRate,
            registrationFee,
            ...normalizedFees,
            totalFees,
            total: normalizedPurchasePrice + totalFees
        };
    };

    return Object.freeze({
        POLICY,
        calculate,
        getDefaultFees,
        getSeatGroup,
        getSuggestedUsedTaxBase,
        getUsedCarRemainingRate,
        isBatteryElectric
    });
}));
