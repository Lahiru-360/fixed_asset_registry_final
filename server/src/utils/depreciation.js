export function calculateDepreciation(asset, year, month) {
  const purchaseCost = Number(asset.purchase_cost);
  const residualValue = Number(asset.residual_value || 0);
  const usefulLifeYears = Number(asset.useful_life);

  if (!usefulLifeYears || usefulLifeYears === 0) {
    return {
      monthlyDepreciation: 0,
      accumulatedDepreciation: 0,
      nbv: purchaseCost,
      fullyDepreciated: false,
    };
  }

  const depreciableAmount = purchaseCost - residualValue;
  const monthlyRate = depreciableAmount / (usefulLifeYears * 12);

  const acquired = new Date(asset.acquisition_date);
  const startYear = acquired.getFullYear();
  const startMonth = acquired.getMonth() + 1;

  // If reporting period is before acquisition → no depreciation
  if (year < startYear || (year === startYear && month < startMonth)) {
    return {
      monthlyDepreciation: 0,
      accumulatedDepreciation: 0,
      nbv: purchaseCost,
      fullyDepreciated: false,
    };
  }

  // Inclusive month count
  let monthsElapsed = (year - startYear) * 12 + (month - startMonth) + 1;

  // Mid-month convention
  let effectiveMonths = monthsElapsed === 1 ? 0.5 : monthsElapsed - 0.5;

  const maxMonths = usefulLifeYears * 12;
  effectiveMonths = Math.min(effectiveMonths, maxMonths);

  const accumulatedDepreciation = monthlyRate * effectiveMonths;

  const nbv = Math.max(purchaseCost - accumulatedDepreciation, residualValue);

  const fullyDepreciated = accumulatedDepreciation >= depreciableAmount;

  // Monthly depreciation for the selected month
  let monthlyDepreciation = 0;

  // First, compute accumulated BEFORE this month accurately
  let effectiveBeforeThisMonth;
  if (monthsElapsed === 1) {
    effectiveBeforeThisMonth = 0;
  } else {
    effectiveBeforeThisMonth = monthsElapsed - 1 - 0.5; // monthsElapsed - 1.5
  }
  effectiveBeforeThisMonth = Math.max(
    0,
    Math.min(effectiveBeforeThisMonth, maxMonths)
  );

  const accumulatedBefore = monthlyRate * effectiveBeforeThisMonth;
  const remainingToDepreciate = depreciableAmount - accumulatedBefore;

  // Now determine the "normal" amount this month would add
  const thisMonthNormalAddition = monthsElapsed === 1 ? 0.5 : 1.0;

  if (remainingToDepreciate > 0 && effectiveBeforeThisMonth < maxMonths) {
    monthlyDepreciation =
      monthlyRate *
      Math.min(thisMonthNormalAddition, remainingToDepreciate / monthlyRate);
  }

  // Optional: round to avoid floating-point weirdness (e.g., to 2 decimals)
  monthlyDepreciation = Number(monthlyDepreciation.toFixed(2));

  return {
    monthlyDepreciation,
    accumulatedDepreciation,
    nbv,
    fullyDepreciated,
  };
}
