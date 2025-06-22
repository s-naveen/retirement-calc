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
  name: string;
  amount: number;
  interestRate: number;
  startYear: number; // Years from now when investment starts
  timeYears: number; // Duration of the investment
  addAtMaturity: boolean; // true = add full amount at maturity, false = add gradually each year
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