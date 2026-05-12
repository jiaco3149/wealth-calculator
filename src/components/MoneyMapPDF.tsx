'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';
import type { MoneyMapResult, LoanInputs } from '@/lib/types';

// Load the PDF document renderer only on the client
const MoneyMapPDF = dynamic(
  () => import('./MoneyMapPDFClient').then(m => m.MoneyMapPDF),
  { ssr: false, loading: () => null }
);

export function DownloadButton({ inputs, result, children }: {
  inputs: LoanInputs;
  result: MoneyMapResult;
  children: React.ReactNode;
}) {
  return (
    <PDFDownloadLink
      document={<MoneyMapPDF inputs={inputs} result={result} />}
      fileName={`UnMortgage_Money_Map_${new Date().toISOString().split('T')[0]}.pdf`}
      style={{ display: 'inline-block', textDecoration: 'none' }}
    >
      {({ loading }) => loading ? 'Generating PDF...' : children}
    </PDFDownloadLink>
  );
}
