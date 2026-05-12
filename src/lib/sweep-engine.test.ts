import { describe, it, expect } from 'vitest';
import { simulateSweep } from './sweep-engine';
import type { LoanInputs } from './types';

const sampleInputs: LoanInputs = {
  currentBalance: 350000,
  currentRate: 6.5,
  currentMonthlyPayment: 2212,
  monthsRemaining: 338,
  monthlyIncome: 10937,
  monthlyExpenses: 7500,
  incomeFrequency: 'biweekly',
  payDayOffset: 0,
  expenseDayOffset: 15,
  helocRate: 8.5,
  helocLimit: 500000,
  initialCashOnHand: 10000,
};

describe('simulateSweep', () => {
  it('runs without errors', () => {
    const result = simulateSweep(sampleInputs);
    expect(result.freedomDate).toBeDefined();
    expect(result.totalMonths).toBeGreaterThan(0);
    expect(result.totalMonths).toBeLessThan(200); // ~8-10 years for $350K with $175K income profile
  });

  it('shows savings vs original loan', () => {
    const result = simulateSweep(sampleInputs);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.totalInterestPaid).toBeLessThan(result.originalTotalInterest);
  });

  it('produces monthly summaries', () => {
    const result = simulateSweep(sampleInputs);
    expect(result.monthlySummary.length).toBe(result.totalMonths);
  });
});
