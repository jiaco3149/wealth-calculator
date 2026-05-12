import { LoanInputs, MoneyMapResult, MonthlySummary } from './types';

const DAYS_IN_YEAR = 365;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function simulateSweep(inputs: LoanInputs): MoneyMapResult {
  const {
    currentBalance,
    currentMonthlyPayment,
    monthsRemaining,
    monthlyIncome,
    monthlyExpenses,
    incomeFrequency,
    payDayOffset,
    expenseDayOffset,
    helocRate,
  } = inputs;

  const originalTotalInterest = currentMonthlyPayment * monthsRemaining - currentBalance;

  const startDate = new Date();
  let balance = currentBalance;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  const monthlySummaries: MonthlySummary[] = [];

  const maxMonths = 600;
  let month = 0;

  while (balance > 1 && month < maxMonths) {
    const year = startDate.getFullYear() + Math.floor((startDate.getMonth() + month) / 12);
    const m = (startDate.getMonth() + month) % 12;
    const daysThisMonth = daysInMonth(year, m);

    let monthIncomeReceived = 0;
    let monthExpensesPaid = 0;
    let currentMonthInterest = 0;
    const monthStartBalance = balance;

    // Income periods per month
    const incomePerPeriod = monthlyIncome / getPaymentCount(incomeFrequency);
    const incomeDays = getIncomeDays(incomeFrequency, payDayOffset, daysThisMonth);
    const expenseDays = getExpenseDays(expenseDayOffset, daysThisMonth);

    for (let day = 0; day < daysThisMonth; day++) {
      // Income deposits (reduce balance)
      if (incomeDays.includes(day)) {
        balance -= incomePerPeriod;
        monthIncomeReceived += incomePerPeriod;
      }

      // Expense withdrawals (increase balance - drawing on HELOC)
      if (expenseDays.includes(day)) {
        balance += monthlyExpenses;
        monthExpensesPaid += monthlyExpenses;
      }

      // Don't let balance go below 0 (overpaying HELOC)
      if (balance < 0) balance = 0;

      // Daily simple interest
      const dailyInterest = (balance * helocRate / 100) / DAYS_IN_YEAR;
      balance += dailyInterest;
      cumulativeInterest += dailyInterest;
      currentMonthInterest += dailyInterest;
    }

    cumulativePrincipal = currentBalance - balance;

    monthlySummaries.push({
      month: `${year}-${String(m + 1).padStart(2, '0')}`,
      startBalance: round(monthStartBalance),
      endBalance: round(balance),
      interestCharged: round(currentMonthInterest),
      principalPaid: round(monthStartBalance - balance),
      totalIncome: round(monthIncomeReceived),
      totalExpenses: round(monthExpensesPaid),
      avgBalance: round((monthStartBalance + balance) / 2),
    });

    month++;
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

function getPaymentCount(frequency: string): number {
  switch (frequency) {
    case 'weekly': return 4;
    case 'biweekly': return 2;
    case 'semimonthly': return 2;
    case 'monthly': return 1;
    default: return 1;
  }
}

function getIncomeDays(frequency: string, offset: number, daysInMonth: number): number[] {
  switch (frequency) {
    case 'weekly':
      return [0, 7, 14, 21, 28].filter(d => d < daysInMonth);
    case 'biweekly':
      return ((offset % 14) < daysInMonth ? [offset % 14] : []).concat(
        (offset + 14) % daysInMonth < daysInMonth ? [(offset + 14) % daysInMonth] : []
      );
    case 'semimonthly':
      return [Math.min(offset, daysInMonth - 1), Math.min(offset + 15, daysInMonth - 1)].filter((v, i, a) => a.indexOf(v) === i);
    case 'monthly':
      return [Math.min(offset, daysInMonth - 1)];
    default:
      return [0];
  }
}

function getExpenseDays(offset: number, daysInMonth: number): number[] {
  return [Math.min(offset, daysInMonth - 1)];
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}
