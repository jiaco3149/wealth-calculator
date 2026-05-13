'use client';

import { useState, useCallback } from 'react';
import { CalculatorForm } from '@/components/CalculatorForm';
import { MoneyMapDashboard } from '@/components/MoneyMapDashboard';
import { simulateSweep } from '@/lib/sweep-engine';
import type { LoanInputs, MoneyMapResult } from '@/lib/types';

export default function Home() {
  const [inputs, setInputs] = useState<LoanInputs | null>(null);
  const [result, setResult] = useState<MoneyMapResult | null>(null);

  const handleCalculate = useCallback((nextInputs: LoanInputs) => {
    setInputs(nextInputs);
    setResult(simulateSweep(nextInputs));
  }, []);

  if (!inputs || !result) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
        <header className="max-w-xl mx-auto mb-10">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-amber-500">UnMortgage</span> Money Map
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            See your path to debt freedom with the sweep account strategy.
          </p>
        </header>
        <CalculatorForm onCalculate={handleCalculate} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <header className="max-w-4xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-amber-500">UnMortgage</span> Money Map
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            See your path to debt freedom with the sweep account strategy.
          </p>
        </div>
        <button
          onClick={() => { setInputs(null); setResult(null); }}
          className="text-zinc-500 hover:text-zinc-300 text-sm underline underline-offset-4"
        >
          Try new numbers
        </button>
      </header>
      <MoneyMapDashboard inputs={inputs} result={result} />
    </main>
  );
}
