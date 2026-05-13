'use client';

import { useState } from 'react';
import { openMoneyMapPDF } from '@/lib/generate-report';
import type { LoanInputs, MoneyMapResult } from '@/lib/types';

interface Props {
  inputs: LoanInputs;
  result: MoneyMapResult;
  onReset?: () => void;
}

export function MoneyMapDashboard({ inputs, result: precomputedResult, onReset }: Props) {
  const [result] = useState<MoneyMapResult | null>(precomputedResult);

  if (!result) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const freedomDate = new Date(result.freedomDate);
  const formattedDate = freedomDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const annualEscrow = inputs.propertyTaxAnnual + inputs.homeInsuranceAnnual;
  const currentTotalMonthly = inputs.currentMonthlyPayment + annualEscrow / 12;
  const origYears = Math.round(result.originalTotalInterest / (currentTotalMonthly * 12) * 10) / 10;
  const pctSaved = result.originalTotalInterest > 0 
    ? Math.round((result.interestSaved / result.originalTotalInterest) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Freedom Date */}
      <section className="text-center py-10 border-b border-zinc-800">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Your Debt Freedom Date</p>
        <p className="text-4xl md:text-5xl font-bold text-amber-500">{formattedDate}</p>
        <p className="text-base text-zinc-400 mt-3">
          {result.totalMonths} months — <span className="text-emerald-400 font-semibold">{result.yearsSaved.toFixed(1)} years sooner</span>
        </p>
      </section>

      {/* Comparison */}
      <section className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <h3 className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-4">Current Mortgage</h3>
          <div className="space-y-4">
            <StatRow label="Payoff Date" value={`~${origYears} years from now`} />
            <StatRow label="Total Interest" value={usd(result.originalTotalInterest)} />
            <StatRow label="Monthly P&I" value={usd(inputs.currentMonthlyPayment)} />
            {annualEscrow > 0 && <StatRow label="+ Taxes & Insurance" value={usd(annualEscrow / 12) + '/mo'} />}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-zinc-900/60 border border-amber-500/30">
          <h3 className="text-xs uppercase tracking-[0.15em] text-amber-500 mb-4">WealthBuilder Plan</h3>
          <div className="space-y-4">
            <StatRow label="Payoff Date" value={formattedDate} highlight />
            <StatRow label="Total Interest" value={usd(result.totalInterestPaid)} highlight />
            <StatRow label="Interest Saved" value={usd(result.interestSaved)} highlight accent="emerald" />
          </div>
        </div>
      </section>

      {/* Savings Box */}
      <section className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-emerald-500 mb-2">Total Interest Savings</p>
        <p className="text-3xl font-bold text-emerald-400">{usd(result.interestSaved)}</p>
        <p className="text-sm text-emerald-600 mt-1">{pctSaved}% less interest over the life of your loan</p>
      </section>

      {/* Interest Comparison Bar */}
      <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <h3 className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-5">Interest Cost Over Life of Loan</h3>
        <div className="space-y-5">
          <BarRow label="Current Mortgage" value={result.originalTotalInterest} max={result.originalTotalInterest} muted />
          <BarRow label="WealthBuilder" value={result.totalInterestPaid} max={result.originalTotalInterest} />
        </div>
      </section>

      {/* Amortization Mugging */}
      <section className="p-6 rounded-xl bg-red-950/30 border border-red-900/40">
        <h3 className="text-xs uppercase tracking-[0.15em] text-red-400 mb-3">The Amortization Mugging</h3>
        <p className="text-sm text-zinc-300 leading-relaxed">
          In the first year of your mortgage, most of every payment goes to <span className="text-white font-medium">interest, not principal</span>.
          You're not paying down your loan — you're renting money at the bank's price.
        </p>
        <p className="text-sm text-zinc-400 mt-3">
          Your current loan: <span className="text-white">{inputs.currentRate}%</span> rate means roughly{' '}
          <span className="text-white font-semibold">{Math.round(inputs.currentRate / 3 * 10) / 10}%</span> of each payment is pure bank profit in year one.
        </p>
      </section>

      {/* How It Works */}
      <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <h3 className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-5">Set It &amp; Forget It</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold">1</div>
            <p className="text-sm text-zinc-300 font-medium">Salary hits HELOC</p>
            <p className="text-xs text-zinc-500 mt-1">Balance drops instantly</p>
          </div>
          <div>
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold">2</div>
            <p className="text-sm text-zinc-300 font-medium">Interest drops</p>
            <p className="text-xs text-zinc-500 mt-1">Lower balance = less daily interest</p>
          </div>
          <div>
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold">3</div>
            <p className="text-sm text-zinc-300 font-medium">Bills drain slowly</p>
            <p className="text-xs text-zinc-500 mt-1">Cycle repeats every paycheck</p>
          </div>
        </div>
      </section>

      {/* CTA + Download */}
      <section className="text-center pt-6 border-t border-zinc-800 no-print">
        <button
          onClick={() => openMoneyMapPDF(inputs, result)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8 py-3.5 rounded-lg transition active:scale-[0.98] mr-4"
        >
          Download Money Map PDF
        </button>
        <button
          onClick={onReset}
          className="text-zinc-500 hover:text-zinc-300 text-sm underline underline-offset-4"
        >
          Try different numbers
        </button>
      </section>
    </div>
  );
}

function StatRow({ label, value, highlight, accent }: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: 'emerald';
}) {
  const color = highlight ? (accent === 'emerald' ? 'text-emerald-400' : 'text-amber-500') : 'text-zinc-300';
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className={`text-lg font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function BarRow({ label, value, max, muted }: {
  label: string;
  value: number;
  max: number;
  muted?: boolean;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-zinc-400">{label}</span>
        <span className={muted ? 'text-zinc-300' : 'text-amber-500 font-semibold'}>{usd(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${muted ? 'bg-zinc-600' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function usd(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}
