'use client';

import { useState } from 'react';
import type { LoanInputs } from '@/lib/types';

const DEFAULTS: LoanInputs = {
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

interface Props {
  onCalculate: (inputs: LoanInputs) => void;
}

export function CalculatorForm({ onCalculate }: Props) {
  const [inputs, setInputs] = useState(DEFAULTS);

  const num = (key: keyof LoanInputs) => (v: string) =>
    setInputs(prev => ({ ...prev, [key]: parseFloat(v) || 0 }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(inputs);
  };

  return (
    <form onSubmit={submit} className="space-y-8 max-w-md mx-auto pb-20">
      <h2 className="text-xl font-semibold text-center">Your Money Map</h2>

      {/* Current Mortgage */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">Current Mortgage</h3>
        <div className="space-y-3">
          <NumberInput label="Loan Balance" value={inputs.currentBalance} onChange={num('currentBalance')} prefix="$" />
          <NumberInput label="Interest Rate" value={inputs.currentRate} onChange={num('currentRate')} suffix="%" />
          <NumberInput label="Monthly Payment" value={inputs.currentMonthlyPayment} onChange={num('currentMonthlyPayment')} prefix="$" />
          <NumberInput label="Months Remaining" value={inputs.monthsRemaining} onChange={num('monthsRemaining')} />
        </div>
      </section>

      {/* Income */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">Household Income</h3>
        <div className="space-y-3">
          <NumberInput label="Monthly Net Income" value={inputs.monthlyIncome} onChange={num('monthlyIncome')} prefix="$" />
          <label className="block">
            <span className="text-xs mb-1 block text-zinc-400">Pay Frequency</span>
            <select
              value={inputs.incomeFrequency}
              onChange={e => setInputs(p => ({ ...p, incomeFrequency: e.target.value as LoanInputs['incomeFrequency'] }))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="semimonthly">Semi-monthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>
      </section>

      {/* Expenses */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">Monthly Expenses</h3>
        <div className="space-y-3">
          <NumberInput label="All Living Expenses" value={inputs.monthlyExpenses} onChange={num('monthlyExpenses')} prefix="$" />
          <NumberInput label="Bills Due Day (0-28)" value={inputs.expenseDayOffset} onChange={num('expenseDayOffset')} />
        </div>
      </section>

      {/* HELOC */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">HELOC Rate</h3>
        <NumberInput label="HELOC Interest Rate" value={inputs.helocRate} onChange={num('helocRate')} suffix="%" />
      </section>

      <button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3.5 rounded-lg transition active:scale-[0.98]"
      >
        Calculate My Money Map
      </button>
    </form>
  );
}

function NumberInput({ label, value, onChange, prefix, suffix }: {
  label: string;
  value: number;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs mb-1 block text-zinc-400">{label}</span>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-7' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{suffix}</span>}
      </div>
    </label>
  );
}
