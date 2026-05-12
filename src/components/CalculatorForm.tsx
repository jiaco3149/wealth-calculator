'use client';

import { useState } from 'react';
import type { LoanInputs } from '@/lib/types';
import { HelpCircle } from 'lucide-react';

const DEFAULTS: LoanInputs = {
  currentBalance: 350000,
  currentRate: 6.5,
  currentMonthlyPayment: 2212,
  monthsRemaining: 338,
  monthlyIncome: 10937,
  propertyTaxAnnual: 4200,
  homeInsuranceAnnual: 1800,
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
    <form onSubmit={submit} className="space-y-8 max-w-xl mx-auto pb-20">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Your Money Map</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Fill in your numbers below. Tooltips <TooltipIcon /> explain each field.
        </p>
      </div>

      {/* Current Mortgage */}
      <section className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Current Mortgage</h3>
        <div className="space-y-4">
          <Field
            label="Current Loan Balance"
            value={inputs.currentBalance}
            onChange={num('currentBalance')}
            prefix="$"
            tooltip="The remaining balance on your current mortgage. Find this on your most recent statement."
          />
          <Field
            label="Current Interest Rate"
            value={inputs.currentRate}
            onChange={num('currentRate')}
            suffix="%"
            tooltip="Your mortgage's annual interest rate (e.g., 6.5%). Not the APR."
          />
          <Field
            label="Monthly P&I Payment"
            value={inputs.currentMonthlyPayment}
            onChange={num('currentMonthlyPayment')}
            prefix="$"
            tooltip="Your principal + interest payment only. DO NOT include taxes or insurance here — those go in the Annual Expenses section below."
          />
          <Field
            label="Months Remaining"
            value={inputs.monthsRemaining}
            onChange={num('monthsRemaining')}
            tooltip="How many payments are left on your current mortgage. 30yr = 360, 15yr = 180, or check your amortization schedule."
          />
        </div>
      </section>

      {/* Income */}
      <section className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Household Income</h3>
        <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400/90">
            ⚠️ Enter your <strong>take-home pay</strong> (net), not gross. After taxes, 401k, health insurance, etc.
          </p>
        </div>
        <div className="space-y-4">
          <Field
            label="Take-Home Pay (Per Paycheck)"
            value={inputs.monthlyIncome}
            onChange={num('monthlyIncome')}
            prefix="$"
            tooltip="The actual amount that hits your bank account each payday. This is what funds your HELOC sweep."
          />
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <label className="text-xs text-zinc-400">Pay Frequency</label>
              <TooltipIcon />
            </div>
            <select
              value={inputs.incomeFrequency}
              onChange={e => setInputs(p => ({ ...p, incomeFrequency: e.target.value as LoanInputs['incomeFrequency'] }))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
            >
              <option value="weekly">Weekly (52/yr)</option>
              <option value="biweekly">Bi-weekly (26/yr)</option>
              <option value="semimonthly">Semi-monthly (24/yr)</option>
              <option value="monthly">Monthly (12/yr)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Expenses */}
      <section className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Monthly Living Expenses</h3>
        <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400/90">
            ⚠️ Include groceries, utilities, car payments, credit cards, gas, etc. EXCLUDE property taxes and homeowners insurance — those go below.
          </p>
        </div>
        <div className="space-y-4">
          <Field
            label="Monthly Living Expenses"
            value={inputs.monthlyExpenses}
            onChange={num('monthlyExpenses')}
            prefix="$"
            tooltip="All discretionary and required expenses paid from your checking account each month. Taxes and insurance are separate."
          />
        </div>
      </section>

      {/* Annual Expenses */}
      <section className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Annual Expenses</h3>
        <div className="mb-3 p-3 rounded-lg bg-zinc-500/10 border border-zinc-500/20">
          <p className="text-xs text-zinc-400/90">
            ℹ️ Property taxes and homeowners insurance are typically escrowed (paid separately from your HELOC). Enter annual amounts here so we show your true cost.
          </p>
        </div>
        <div className="space-y-4">
          <Field
            label="Property Tax (Annual)"
            value={inputs.propertyTaxAnnual}
            onChange={num('propertyTaxAnnual')}
            prefix="$"
            tooltip="Your total annual property tax bill. Find this on your county tax assessor website or most recent tax statement."
          />
          <Field
            label="Homeowners Insurance (Annual)"
            value={inputs.homeInsuranceAnnual}
            onChange={num('homeInsuranceAnnual')}
            prefix="$"
            tooltip="Annual homeowners insurance premium. Not flood or umbrella — just your base policy."
          />
        </div>
      </section>

      {/* HELOC */}
      <section className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">HELOC Rate</h3>
        <Field
          label="Proposed HELOC Interest Rate"
          value={inputs.helocRate}
          onChange={num('helocRate')}
          suffix="%"
          tooltip="The rate on the 1st lien HELOC. Your lender will quote this as index + margin (e.g., Prime + 1%). Current Prime is ~8.5%."
        />
      </section>

      <button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3.5 rounded-lg transition active:scale-[0.98] text-base"
      >
        Calculate My Money Map
      </button>
    </form>
  );
}

function Field({ label, value, onChange, prefix, suffix, tooltip }: {
  label: string;
  value: number;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  tooltip: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs text-zinc-400">{label}</label>
        <div className="relative">
          <button type="button" onClick={() => setShow(!show)} className="text-zinc-600 hover:text-zinc-400 transition">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          {show && (
            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 shadow-xl z-50">
              {tooltip}
              <div className="absolute top-full left-2 -mt-1 w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700 rotate-45" />
            </div>
          )}
        </div>
      </div>
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
    </div>
  );
}

function TooltipIcon() {
  return <HelpCircle className="w-3.5 h-3.5 text-amber-500/60 inline" />;
}
