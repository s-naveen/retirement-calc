import { RetirementData, CalculationResults, MonthlyInvestment, MonthlyWithdrawal, AdvancedInvestment } from '../types';

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

export const calculateAdvancedInvestmentsValue = (
  advancedInvestments: AdvancedInvestment[],
  currentAge: number,
  retirementAge: number
): number => {
  if (!advancedInvestments || advancedInvestments.length === 0) {
    return 0;
  }

  const yearsToRetirement = retirementAge - currentAge;
  let totalValue = 0;

  for (const investment of advancedInvestments) {
    // Skip if investment starts after retirement (startYear is 0-based)
    if (investment.startYear >= yearsToRetirement) {
      continue;
    }

    // Calculate how many years the investment will grow
    // It grows for its duration OR until retirement, whichever comes first
    const yearsFromStartToRetirement = yearsToRetirement - investment.startYear;
    const actualGrowthYears = Math.min(investment.timeYears, yearsFromStartToRetirement);
    
    // Calculate the value at retirement
    if (actualGrowthYears > 0) {
      const futureValue = investment.amount * Math.pow(1 + investment.interestRate / 100, actualGrowthYears);
      totalValue += futureValue;
    } else {
      // Investment starts exactly at retirement, so only principal is available
      totalValue += investment.amount;
    }
  }

  return totalValue;
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
  savingsTillNow: number,
  advancedInvestments: AdvancedInvestment[] = []
): MonthlyInvestment[] => {
  const investments: MonthlyInvestment[] = [];
  let age = startingAge;
  let regularCorpus = savingsTillNow; // Track regular investments corpus separately
  let accumulatedValue = sip;

  // Track advanced investments by type
  const maturityInvestments: Array<{
    id: string;
    principalAmount: number;
    interestRate: number;
    startYear: number;
    duration: number;
    maturityYear: number;
    maturityValue: number;
  }> = [];

  const gradualInvestments: Array<{
    id: string;
    principalAmount: number;
    currentValue: number;
    interestRate: number;
    startYear: number;
    duration: number;
    isActive: boolean;
    yearsRemaining: number;
  }> = [];

  // Categorize investments
  advancedInvestments.forEach(inv => {
    if (inv.addAtMaturity) {
      // Calculate maturity value
      const maturityValue = inv.amount * Math.pow(1 + inv.interestRate / 100, inv.timeYears);
      maturityInvestments.push({
        id: inv.id,
        principalAmount: inv.amount,
        interestRate: inv.interestRate,
        startYear: inv.startYear,
        duration: inv.timeYears,
        maturityYear: inv.startYear + inv.timeYears,
        maturityValue: maturityValue
      });
    } else {
      // Will be added to gradualInvestments when it starts
    }
  });

  for (let yearIndex = 0; yearIndex < years; yearIndex++) {
    const currentYear = yearIndex + 1; // 1-based year for display
    
    // Check for new gradual investments starting this year
    const newGradualInvestments = advancedInvestments.filter(
      inv => inv.startYear === yearIndex && !inv.addAtMaturity
    );
    
    // Add new gradual investments
    newGradualInvestments.forEach(inv => {
      gradualInvestments.push({
        id: inv.id,
        principalAmount: inv.amount,
        currentValue: inv.amount,
        interestRate: inv.interestRate,
        startYear: inv.startYear,
        duration: inv.timeYears,
        isActive: true,
        yearsRemaining: inv.timeYears
      });
    });

    // Check for maturity investments that mature this year
    let maturityBonus = 0;
    maturityInvestments.forEach(inv => {
      if (inv.maturityYear === yearIndex) {
        maturityBonus += inv.maturityValue;
      }
    });

    // Grow the regular corpus with regular SIP and interest rate
    regularCorpus = (regularCorpus + accumulatedValue) * (1 + annualRate / 100);

    // Grow each active gradual investment with its own interest rate
    gradualInvestments.forEach(inv => {
      if (inv.isActive && inv.yearsRemaining > 0) {
        // Grow by its own interest rate
        inv.currentValue = inv.currentValue * (1 + inv.interestRate / 100);
        inv.yearsRemaining--;
        
        // If duration is complete, mark as inactive (but keep the value)
        if (inv.yearsRemaining <= 0) {
          inv.isActive = false;
        }
      }
    });

    // Calculate total gradual investments value
    const totalGradualValue = gradualInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);

    // Total corpus = regular corpus + gradual investments value + maturity bonus
    const totalCorpus = regularCorpus + totalGradualValue + maturityBonus;

    const inflationAdjustedWithdrawal = accumulatedValue / Math.pow(1 + inflationRate / 100, yearIndex);

    investments.push({
      age: age + 1,
      monthlyAmount: accumulatedValue / 12,
      inflationAdjustedAmount: inflationAdjustedWithdrawal / 12,
      yearEndCorpus: totalCorpus,
      year: currentYear
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
    incrementRate,
    advancedInvestments
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

  // Calculate advanced investments contribution
  const advancedInvestmentValue = calculateAdvancedInvestmentsValue(
    advancedInvestments,
    currentAge,
    retirementAge
  );

  // Adjust required corpus by subtracting advanced investments value
  const adjustedRequiredCorpus = Math.max(0, requiredCorpus - advancedInvestmentValue);

  // Calculate required SIP with adjusted corpus
  const requiredSIP = calculateSIP(
    adjustedRequiredCorpus,
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
    savingsTillNow,
    advancedInvestments
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

  // Calculate totals including advanced investments
  const totalInvestmentNeeded = monthlyInvestments.reduce((sum, inv) => sum + (inv.monthlyAmount * 12), 0);
  const totalAdvancedInvestments = advancedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturns = requiredCorpus - totalInvestmentNeeded - savingsTillNow - totalAdvancedInvestments;

  return {
    requiredCorpus,
    monthlyInvestments,
    monthlyWithdrawals,
    totalInvestmentNeeded,
    totalReturns
  };
};