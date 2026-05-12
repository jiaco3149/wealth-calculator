'use client';

import dynamic from 'next/dynamic';

// Import PDFDownloadLink client-only to avoid SSR canvas errors
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

export { PDFDownloadLink };
