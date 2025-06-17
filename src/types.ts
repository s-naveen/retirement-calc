export interface RetirementData {
  currentAge: number;
  retirementAge: number;
  fundsNeededTillAge: number;
  savingsTillNow: number;
  expectedMonthlyPension: number;
  inflationRate: number;
  interestRate: number;
  afterRetirementInterestRate: number;
  incrementRate: number;
  advancedInvestments: AdvancedInvestment[];
}

export interface AdvancedInvestment {
  id: string;
  amount: number;
  interestRate: number;
  timeYears: number;
}

export interface CalculationResults {
  requiredCorpus: number;
  monthlyInvestments: MonthlyInvestment[];
  monthlyWithdrawals: MonthlyWithdrawal[];
  totalInvestmentNeeded: number;
  totalReturns: number;
}

export interface MonthlyInvestment {
  age: number;
  monthlyAmount: number;
  inflationAdjustedAmount: number;
  yearEndCorpus: number;
  year: number;
}

export interface MonthlyWithdrawal {
  age: number;
  monthlyWithdrawal: number;
  remainingCorpus: number;
  year: number;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ChartDataPoint {
  age: number;
  corpus: number;
  investment: number;
  withdrawal?: number;
} 