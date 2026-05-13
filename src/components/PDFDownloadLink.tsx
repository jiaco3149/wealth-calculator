'use client';

import { PDFDownloadLink as PDFDownloadLinkRaw } from '@react-pdf/renderer';
import { MoneyMapPDF } from './MoneyMapPDFClient';
import type { MoneyMapResult, LoanInputs } from '@/lib/types';

function PDFDownloadLink({ inputs, result, children }: {
  inputs: LoanInputs;
  result: MoneyMapResult;
  children: React.ReactNode;
}) {
  return (
    <PDFDownloadLinkRaw
      document={<MoneyMapPDF inputs={inputs} result={result} /> as any}
      fileName={`UnMortgage_Money_Map_${new Date().toISOString().split('T')[0]}.pdf`}
      style={{ display: 'inline-block', textDecoration: 'none' }}
    >
      {({ loading }) => loading ? 'Generating PDF...' : children}
    </PDFDownloadLinkRaw>
  );
}

export default PDFDownloadLink;
