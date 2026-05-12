export interface LoanInputs {
  currentBalance: number;
  currentRate: number;
  currentMonthlyPayment: number;
  monthsRemaining: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  payDayOffset: number;
  expenseDayOffset: number;
  helocRate: number;
  helocLimit: number;
  initialCashOnHand: number;
}

export interface MoneyMapResult {
  freedomDate: string;
  totalMonths: number;
  totalInterestPaid: number;
  originalTotalInterest: number;
  interestSaved: number;
  yearsSaved: number;
  monthlySummary: MonthlySummary[];
}

export interface MonthlySummary {
  month: string;
  startBalance: number;
  endBalance: number;
  interestCharged: number;
  principalPaid: number;
  totalIncome: number;
  totalExpenses: number;
  avgBalance: number;
}
