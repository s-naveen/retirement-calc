import { RetirementData, CalculationResults, MonthlyInvestment, MonthlyWithdrawal } from '../types';

export const formatCurrency = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  const absValue = Math.abs(amount);
  
  if (absValue >= 1e7) return `${sign}₹${(absValue / 1e7).toFixed(2)} Cr`;
  if (absValue >= 1e5) return `${sign}₹${(absValue / 1e5).toFixed(2)} L`;
  if (absValue >= 1e3) return `${sign}₹${(absValue / 1e3).toFixed(2)}k`;
  return `${sign}₹${absValue.toFixed(2)}`;
};

export const calculateFutureValue = (initialAmount: number, inflationRate: number, years: number): number => {
  return initialAmount * Math.pow(1 + inflationRate / 100, years);
};

export const countYearsToDepleteFV = (
  FV: number,
  yearsForMonthlyInvestment: number,
  inflationRate: number,
  interestRate: number,
  expectedMonthlyPension: number,
  maxYears: number = 100
): number => {
  let annualWithdrawal = expectedMonthlyPension * 12;
  annualWithdrawal *= Math.pow(1 + inflationRate / 100, yearsForMonthlyInvestment);

  let i = 1;
  while (i <= maxYears) {
    FV = (FV - annualWithdrawal) * (1 + interestRate / 100);

    if (FV < 0) {
      return i;
    }

    annualWithdrawal *= 1 + inflationRate / 100;
    i++;
  }
  return i;
};

export const calculateSIP = (
  targetFV: number,
  annualRate: number,
  years: number,
  incrementRate: number,
  savingsTillNow: number
): number => {
  let lowSIP = 0;
  let highSIP = targetFV;
  const epsilon = 1;
  let currentSIP = (highSIP + lowSIP) / 2;

  while (highSIP - lowSIP > epsilon) {
    let maturity = savingsTillNow;
    let accumulatedValue = currentSIP;

    for (let i = 1; i <= years; i++) {
      maturity = (maturity + accumulatedValue) * (1 + annualRate / 100);
      accumulatedValue = accumulatedValue * (1 + incrementRate / 100);
    }

    if (maturity > targetFV) {
      highSIP = currentSIP;
    } else {
      lowSIP = currentSIP;
    }

    currentSIP = (highSIP + lowSIP) / 2;
  }

  return currentSIP;
};

export const generateMonthlyInvestments = (
  sip: number,
  annualRate: number,
  years: number,
  incrementRate: number,
  startingAge: number,
  inflationRate: number,
  savingsTillNow: number
): MonthlyInvestment[] => {
  const investments: MonthlyInvestment[] = [];
  let age = startingAge;
  let maturity = savingsTillNow;
  let accumulatedValue = sip;

  for (let i = 1; i <= years; i++) {
    maturity = (maturity + accumulatedValue) * (1 + annualRate / 100);

    const inflationAdjustedWithdrawal = accumulatedValue / Math.pow(1 + inflationRate / 100, i - 1);

    investments.push({
      age: age + 1,
      monthlyAmount: accumulatedValue / 12,
      inflationAdjustedAmount: inflationAdjustedWithdrawal / 12,
      yearEndCorpus: maturity,
      year: i
    });

    accumulatedValue = accumulatedValue * (1 + incrementRate / 100);
    age++;
  }

  return investments;
};

export const generateMonthlyWithdrawals = (
  FV: number,
  yearsForMonthlyInvestment: number,
  inflationRate: number,
  interestRate: number,
  targetYears: number,
  expectedMonthlyPension: number,
  retirementAge: number
): MonthlyWithdrawal[] => {
  const withdrawals: MonthlyWithdrawal[] = [];
  let annualWithdrawal = expectedMonthlyPension * 12;
  annualWithdrawal *= Math.pow(1 + inflationRate / 100, yearsForMonthlyInvestment);

  let i = 1;
  while (FV >= 0 && i <= targetYears) {
    FV = (FV - annualWithdrawal) * (1 + interestRate / 100);
    if (FV < 0) break;

    withdrawals.push({
      age: i + retirementAge,
      monthlyWithdrawal: annualWithdrawal / 12,
      remainingCorpus: FV,
      year: i
    });

    annualWithdrawal = annualWithdrawal * (1 + inflationRate / 100);
    i++;
  }

  return withdrawals;
};

export const calculateRetirement = (data: RetirementData): CalculationResults => {
  const {
    currentAge,
    retirementAge,
    fundsNeededTillAge,
    savingsTillNow,
    expectedMonthlyPension,
    inflationRate,
    interestRate,
    afterRetirementInterestRate,
    incrementRate
    // Note: advancedInvestments feature to be implemented in future version
  } = data;

  const yearsForMonthlyInvestment = retirementAge - currentAge;
  const numberOfYearsAfterRetirement = fundsNeededTillAge - retirementAge;

  const initialWithdrawal = calculateFutureValue(
    expectedMonthlyPension,
    inflationRate,
    yearsForMonthlyInvestment
  );

  // Binary search for required corpus
  let low = initialWithdrawal * 120;
  let high = 1e10;
  let mid: number;
  let requiredCorpus: number = 0;

  while (high - low > 1) {
    mid = Math.floor((high + low) / 2);
    const years = countYearsToDepleteFV(
      mid,
      yearsForMonthlyInvestment,
      inflationRate,
      afterRetirementInterestRate,
      expectedMonthlyPension
    );

    if (years > numberOfYearsAfterRetirement + 1) {
      high = mid;
    } else if (years < numberOfYearsAfterRetirement + 1) {
      low = mid;
    } else {
      requiredCorpus = mid;
      break;
    }
  }

  if (requiredCorpus === 0) {
    requiredCorpus = mid!;
  }

  // Calculate required SIP
  const requiredSIP = calculateSIP(
    requiredCorpus,
    interestRate,
    yearsForMonthlyInvestment,
    incrementRate,
    savingsTillNow
  );

  // Generate investment and withdrawal schedules
  const monthlyInvestments = generateMonthlyInvestments(
    requiredSIP,
    interestRate,
    yearsForMonthlyInvestment,
    incrementRate,
    currentAge,
    inflationRate,
    savingsTillNow
  );

  const monthlyWithdrawals = generateMonthlyWithdrawals(
    requiredCorpus,
    yearsForMonthlyInvestment,
    inflationRate,
    afterRetirementInterestRate,
    numberOfYearsAfterRetirement,
    expectedMonthlyPension,
    retirementAge
  );

  // Calculate totals
  const totalInvestmentNeeded = monthlyInvestments.reduce((sum, inv) => sum + (inv.monthlyAmount * 12), 0);
  const totalReturns = requiredCorpus - totalInvestmentNeeded - savingsTillNow;

  return {
    requiredCorpus,
    monthlyInvestments,
    monthlyWithdrawals,
    totalInvestmentNeeded,
    totalReturns
  };
}; 