'use client';

import { useState } from 'react';
import { CalculatorForm } from '@/components/CalculatorForm';
import { MoneyMapDashboard } from '@/components/MoneyMapDashboard';
import type { LoanInputs } from '@/lib/types';

export default function Home() {
  const [inputs, setInputs] = useState<LoanInputs | null>(null);

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

      {!inputs ? (
        <CalculatorForm onCalculate={setInputs} />
      ) : (
        <MoneyMapDashboard inputs={inputs} onReset={() => setInputs(null)} />
      )}
    </main>
  );
}
