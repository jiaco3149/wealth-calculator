import { LoanInputs, MoneyMapResult, MonthlySummary } from './types';

/** Default HELOC rate for WealthBuilder calculations */
export const DEFAULT_HELOC_RATE = 8.5;

const DAYS_IN_YEAR = 365;

/**
 * TLS WealthBuilder / 1st Lien HELOC sweep account simulation.
 * Uses daily simple interest to match TLS's calculator.
 *
 * IMPORTANT: monthlyIncome is the PER-DEPOSIT amount (per paycheck).
 * E.g. $10,937 biweekly = $23,697/month total deposited.
 */
export function simulateSweep(inputs: LoanInputs): MoneyMapResult {
  const {
    currentBalance,
    currentMonthlyPayment,
    monthsRemaining,
    monthlyIncome,
    monthlyExpenses,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    incomeFrequency,
    expenseDayOffset,
  } = inputs;

  const helocRate = DEFAULT_HELOC_RATE;

  const annualEscrow = propertyTaxAnnual + homeInsuranceAnnual;
  const originalTotalInterest = (currentMonthlyPayment + annualEscrow / 12) * monthsRemaining - currentBalance;

  const startDate = new Date();
  let balance = currentBalance;
  let cumulativeInterest = 0;
  const monthlySummaries: MonthlySummary[] = [];
  const maxMonths = 600;

  for (let month = 0; month < maxMonths && balance > 0.1; month++) {
    const year = startDate.getFullYear() + Math.floor((startDate.getMonth() + month) / 12);
    const mm = (startDate.getMonth() + month) % 12;
    const daysInMon = new Date(year, mm + 1, 0).getDate();

    const monthStartBalance = balance;
    let monthIncomeReceived = 0;
    let monthExpensesPaid = 0;
    let monthInterest = 0;

    // Pre-calculate deposit days for this month
    const depositDays = getDepositDays(incomeFrequency, month, startDate);

    for (let day = 1; day <= daysInMon; day++) {
      // 1. Deposit(s) reduce balance (paycheck into HELOC)
      if (depositDays.has(day)) {
        balance -= monthlyIncome;
        monthIncomeReceived += monthlyIncome;
        if (balance < 0) balance = 0;
      }

      // 2. Daily interest accrues on current balance
      const dailyInterest = (balance * helocRate / 100) / DAYS_IN_YEAR;
      if (dailyInterest > 0) {
        balance += dailyInterest;
        cumulativeInterest += dailyInterest;
        monthInterest += dailyInterest;
      }

      // 3. Expenses increase balance (paid from HELOC)
      if (day === expenseDayOffset + 1) {
        balance += monthlyExpenses;
        monthExpensesPaid += monthlyExpenses;
      }
    }

    const principalPaid = monthStartBalance - balance;
    monthlySummaries.push({
      month: `${year}-${String(mm + 1).padStart(2, '0')}`,
      startBalance: round(monthStartBalance),
      endBalance: round(balance),
      interestCharged: round(monthInterest),
      principalPaid: round(principalPaid),
      totalIncome: round(monthIncomeReceived),
      totalExpenses: round(monthExpensesPaid),
      avgBalance: round((monthStartBalance + balance) / 2),
    });
  }

  const totalMonths = monthlySummaries.length;
  const freedomDate = new Date(
    startDate.getFullYear() + Math.floor((startDate.getMonth() + totalMonths) / 12),
    (startDate.getMonth() + totalMonths) % 12,
    1
  ).toISOString().split('T')[0];

  const interestSaved = originalTotalInterest - cumulativeInterest;
  const yearsSaved = (monthsRemaining - totalMonths) / 12;

  return {
    freedomDate,
    totalMonths,
    totalInterestPaid: round(cumulativeInterest),
    originalTotalInterest: round(originalTotalInterest),
    interestSaved: round(interestSaved),
    yearsSaved: round(yearsSaved),
    monthlySummary: monthlySummaries,
  };
}

function getDepositDays(frequency: string, monthNum: number, startDate: Date): Set<number> {
  const year = startDate.getFullYear() + Math.floor((startDate.getMonth() + monthNum) / 12);
  const mm = (startDate.getMonth() + monthNum) % 12;
  const dim = new Date(year, mm + 1, 0).getDate();

  const days = new Set<number>();

  switch (frequency) {
    case 'weekly':
      for (let d = 1; d <= dim; d += 7) days.add(d);
      break;
    case 'biweekly': {
      // Track from year start for consistency
      const dayOfYear = ((year - 2024) * 365 + Math.floor(monthNum)) % 14;
      const firstDeposit = ((14 - dayOfYear) % 14) + 1;
      for (let d = firstDeposit; d <= dim; d += 14) days.add(d);
      break;
    }
    case 'semimonthly':
      days.add(1);
      if (dim >= 15) days.add(15);
      break;
    case 'monthly':
      days.add(1);
      break;
  }

  return days;
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}
