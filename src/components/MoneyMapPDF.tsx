import dynamic from 'next/dynamic';
import type { MoneyMapResult, LoanInputs } from '@/lib/types';
import type { ReactNode } from 'react';

const PDFDownloadLinkClient = dynamic(
  () => import('./PDFDownloadLink'),
  { ssr: false, loading: () => <button disabled className="bg-zinc-700 text-zinc-500 font-semibold px-8 py-3.5 rounded-lg">Loading...</button> }
);

export function DownloadButton({ inputs, result, children }: {
  inputs: LoanInputs;
  result: MoneyMapResult;
  children: ReactNode;
}) {
  return (
    <PDFDownloadLinkClient inputs={inputs} result={result}>
      {children}
    </PDFDownloadLinkClient>
  );
}
