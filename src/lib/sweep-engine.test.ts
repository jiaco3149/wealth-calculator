import { describe, it, expect } from 'vitest';
import { simulateSweep } from './sweep-engine';
import type { LoanInputs } from './types';

// TLS WealthBuilder test case: $425K balance, $10,937 biweekly income, $7,500 expenses
// TLS shows: paid off in ~29 months, $41,479 interest
const tlsInputs: LoanInputs = {
  currentBalance: 425000,
  currentRate: 6.5,
  currentMonthlyPayment: 2832.90,
  monthsRemaining: 310,
  monthlyIncome: 10937,      // per biweekly paycheck
  monthlyExpenses: 7500,
  incomeFrequency: 'biweekly',
  payDayOffset: 0,
  expenseDayOffset: 5,
  helocRate: 8.5,
  helocLimit: 440000,
  initialCashOnHand: 10000,
};

describe('simulateSweep', () => {
  it('matches TLS payoff timeline (~29 months)', () => {
    const result = simulateSweep(tlsInputs);
    expect(result.totalMonths).toBeGreaterThanOrEqual(25);
    expect(result.totalMonths).toBeLessThanOrEqual(35);
    // TLS says 29 months
    console.log(`Payoff: ${result.totalMonths} months (${result.yearsSaved.toFixed(1)} years sooner)`);
  });

  it('shows massive interest savings', () => {
    const result = simulateSweep(tlsInputs);
    expect(result.interestSaved).toBeGreaterThan(400000);
    // TLS shows $41,479 interest vs $453,201 comparison
    console.log(`Interest paid: $${result.totalInterestPaid.toLocaleString()} (TLS: $41,479)`);
    console.log(`Interest saved: $${result.interestSaved.toLocaleString()}`);
  });

  it('produces monthly summaries', () => {
    const result = simulateSweep(tlsInputs);
    expect(result.monthlySummary.length).toBe(result.totalMonths);
    // TLS month 1 interest: $2,760.97 (TLS uses slightly different day counting)
    const firstMonth = result.monthlySummary[0];
    expect(firstMonth.interestCharged).toBeGreaterThan(2500);
    expect(firstMonth.interestCharged).toBeLessThan(3500);
  });
});
