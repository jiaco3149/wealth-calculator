'use client';

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { MoneyMapResult, LoanInputs } from '@/lib/types';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwY.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTcviYwY7.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTcviYwY7.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', fontSize: 10, color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingBottom: 15, borderBottom: 2, borderColor: '#d97706' },
  logo: { fontSize: 18, fontWeight: 700, color: '#d97706' },
  subtitle: { fontSize: 8, color: '#666', marginTop: 2 },
  tagline: { fontSize: 9, color: '#666', textAlign: 'right' },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, paddingBottom: 5, borderBottom: 1, borderColor: '#e5e5e5' },
  
  freedomDate: { textAlign: 'center', padding: 20, backgroundColor: '#fef3c7', borderRadius: 8, marginBottom: 20 },
  freedomLabel: { fontSize: 9, color: '#92400e', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  freedomValue: { fontSize: 24, fontWeight: 700, color: '#d97706' },
  freedomSub: { fontSize: 9, color: '#a16207', marginTop: 4 },
  
  grid: { flexDirection: 'row', gap: 16 },
  card: { flex: 1, padding: 15, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 8, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  cardHighlight: { borderWidth: 1, borderColor: '#d97706', backgroundColor: '#fffbeb' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 9, color: '#666' },
  value: { fontSize: 10, fontWeight: 600, color: '#1a1a1a' },
  highlight: { color: '#d97706', fontSize: 12, fontWeight: 700 },
  green: { color: '#059669' },
  
  savingsBox: { padding: 16, backgroundColor: '#ecfdf5', borderRadius: 6, border: 1, borderColor: '#6ee7b7', textAlign: 'center' },
  savingsLabel: { fontSize: 9, color: '#065f46', textTransform: 'uppercase', letterSpacing: 1 },
  savingsValue: { fontSize: 22, fontWeight: 700, color: '#059669', marginTop: 4 },
  
  barContainer: { marginBottom: 12 },
  barLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barTrack: { height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  
  warning: { padding: 12, backgroundColor: '#fef2f2', borderRadius: 6, border: 1, borderColor: '#fecaca' },
  warningTitle: { fontSize: 9, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  warningText: { fontSize: 9, color: '#7f1d1d', lineHeight: 1.5 },
  
  steps: { flexDirection: 'row', gap: 12 },
  step: { flex: 1, padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, alignItems: 'center' },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#d97706', color: 'white', fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 22, marginBottom: 6 },
  stepTitle: { fontSize: 8, fontWeight: 600, color: '#333', textAlign: 'center' },
  stepDesc: { fontSize: 7, color: '#666', textAlign: 'center', marginTop: 2 },
  
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', paddingVertical: 5, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderColor: '#d1d5db' },
  tableRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderColor: '#f3f4f6' },
  th: { flex: 1, fontSize: 7, fontWeight: 600, color: '#666', textTransform: 'uppercase' },
  td: { flex: 1, fontSize: 8, color: '#333' },
  tdNum: { textAlign: 'right' },
  
  footer: { marginTop: 30, paddingTop: 12, borderTopWidth: 1, borderColor: '#e5e7eb', textAlign: 'center', fontSize: 7, color: '#999' },
  cta: { padding: 15, backgroundColor: '#fef3c7', borderRadius: 6, textAlign: 'center', marginTop: 15 },
  ctaText: { fontSize: 10, fontWeight: 600, color: '#92400e' },
  ctaSub: { fontSize: 8, color: '#a16207', marginTop: 3 },
});

function usd(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

interface Props {
  inputs: LoanInputs;
  result: MoneyMapResult;
}

export function MoneyMapPDF({ inputs, result }: Props) {
  const freedomDate = new Date(result.freedomDate);
  const formattedDate = freedomDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const annualEscrow = inputs.propertyTaxAnnual + inputs.homeInsuranceAnnual;
  const currentTotalMonthly = inputs.currentMonthlyPayment + annualEscrow / 12;
  const origYears = (result.originalTotalInterest / (currentTotalMonthly * 12)).toFixed(1);
  const pctSaved = result.originalTotalInterest > 0 ? Math.round((result.interestSaved / result.originalTotalInterest) * 100) : 0;

  // Get first 12 months for table (or all if fewer)
  const firstYear = result.monthlySummary.slice(0, Math.min(12, result.monthlySummary.length));

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>UnMortgage</Text>
            <Text style={styles.subtitle}>MONEY MAP REPORT</Text>
          </View>
          <Text style={styles.tagline}>Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </View>

        {/* Freedom Date */}
        <View style={styles.freedomDate}>
          <Text style={styles.freedomLabel}>Your Debt Freedom Date</Text>
          <Text style={styles.freedomValue}>{formattedDate}</Text>
          <Text style={styles.freedomSub}>{result.totalMonths} months — {result.yearsSaved.toFixed(1)} years sooner than your current mortgage</Text>
        </View>

        {/* Comparison Cards */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Mortgage</Text>
            <View style={styles.row}><Text style={styles.label}>Payoff Date</Text><Text style={styles.value}>~{origYears} years</Text></View>
            <View style={styles.row}><Text style={styles.label}>Total Interest</Text><Text style={styles.value}>{usd(result.originalTotalInterest)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Monthly P&I</Text><Text style={styles.value}>{usd(inputs.currentMonthlyPayment)}</Text></View>
            {annualEscrow > 0 && <View style={styles.row}><Text style={styles.label}>+ Taxes & Insurance</Text><Text style={styles.value}>{usd(annualEscrow / 12)}/mo</Text></View>}
          </View>
          <View style={[styles.card, styles.cardHighlight]}>
            <Text style={{ ...styles.cardTitle, color: '#d97706' }}>WealthBuilder Plan</Text>
            <View style={styles.row}><Text style={styles.label}>Payoff Date</Text><Text style={{ ...styles.value, color: '#d97706' }}>{formattedDate}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Total Interest</Text><Text style={{ ...styles.value, color: '#d97706' }}>{usd(result.totalInterestPaid)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Interest Saved</Text><Text style={[styles.value, styles.green, { fontSize: 14 }]}>{usd(result.interestSaved)}</Text></View>
          </View>
        </View>

        {/* Savings Box */}
        <View style={{ ...styles.savingsBox, marginTop: 20 }}>
          <Text style={styles.savingsLabel}>Total Interest Savings</Text>
          <Text style={styles.savingsValue}>{usd(result.interestSaved)}</Text>
          <Text style={{ fontSize: 9, color: '#065f46', marginTop: 3 }}>{pctSaved}% less interest over the life of your loan</Text>
        </View>

        {/* Amortization Mugging */}
        <View style={{ ...styles.warning, marginTop: 20 }}>
          <Text style={styles.warningTitle}>The Amortization Mugging</Text>
          <Text style={styles.warningText}>
            In the first year of your current mortgage, most of every payment goes to interest — not principal.
            You're not paying down your loan; you're renting money at the bank's price.
            With a {inputs.currentRate}% rate, roughly {Math.round(inputs.currentRate / 3 * 10) / 10}% of each payment is bank profit in year one.
            The WealthBuilder strategy stops this by making every dollar work for you from day one.
          </Text>
        </View>

        {/* How It Works */}
        <View style={{ ...styles.section, marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Set It &amp; Forget It</Text>
          <View style={styles.steps}>
            <View style={styles.step}><View style={styles.stepNum}><Text style={{ color: 'white', fontSize: 11 }}>1</Text></View><Text style={styles.stepTitle}>Salary Hits HELOC</Text><Text style={styles.stepDesc}>Balance drops instantly</Text></View>
            <View style={styles.step}><View style={styles.stepNum}><Text style={{ color: 'white', fontSize: 11 }}>2</Text></View><Text style={styles.stepTitle}>Interest Drops</Text><Text style={styles.stepDesc}>Less daily interest accrues</Text></View>
            <View style={styles.step}><View style={styles.stepNum}><Text style={{ color: 'white', fontSize: 11 }}>3</Text></View><Text style={styles.stepTitle}>Bills Drain Slowly</Text><Text style={styles.stepDesc}>Cycle repeats each paycheck</Text></View>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interest Cost Comparison</Text>
          <View style={styles.barContainer}>
            <View style={styles.barLabel}><Text style={{ fontSize: 8, color: '#666' }}>Current Mortgage</Text><Text style={{ fontSize: 8 }}>{usd(result.originalTotalInterest)}</Text></View>
            <View style={styles.barTrack}><View style={{ ...styles.barFill, backgroundColor: '#9ca3af', width: '100%' }} /></View>
          </View>
          <View style={styles.barContainer}>
            <View style={styles.barLabel}><Text style={{ fontSize: 8, color: '#d97706', fontWeight: 600 }}>WealthBuilder</Text><Text style={{ fontSize: 8, color: '#d97706' }}>{usd(result.totalInterestPaid)}</Text></View>
            <View style={styles.barTrack}><View style={{ ...styles.barFill, backgroundColor: '#d97706', width: `${pctSaved}%` }} /></View>
          </View>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>Ready to make this your reality?</Text>
          <Text style={styles.ctaSub}>Book your free UnMortgage Money Map Strategy Session</Text>
        </View>

        <Text style={styles.footer}>
          UnMortgage by Patriot Pacific | This report is an estimate based on the numbers provided. Actual results may vary.
        </Text>
      </Page>

      {/* Page 2: First Year Breakdown Table */}
      {result.monthlySummary.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>UnMortgage</Text>
              <Text style={styles.subtitle}>FIRST YEAR BREAKDOWN</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Paydown Schedule — Year 1</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.6 }]}>Month</Text>
                <Text style={[styles.th, styles.tdNum]}>Balance</Text>
                <Text style={[styles.th, styles.tdNum]}>Interest</Text>
                <Text style={[styles.th, styles.tdNum]}>Principal</Text>
                <Text style={[styles.th, styles.tdNum]}>Income</Text>
                <Text style={[styles.th, styles.tdNum]}>Expenses</Text>
              </View>
              {firstYear.map((m, i) => (
                <View key={m.month} style={[styles.tableRow, ...(i % 2 === 1 ? [{ backgroundColor: '#f9fafb' }] : [])]}>
                  <Text style={[styles.td, { flex: 0.6 }]}>{i + 1}</Text>
                  <Text style={[styles.td, styles.tdNum]}>{usd(m.startBalance)}</Text>
                  <Text style={[styles.td, styles.tdNum]}>{usd(m.interestCharged)}</Text>
                  <Text style={[styles.td, styles.tdNum]}>{usd(m.principalPaid)}</Text>
                  <Text style={[styles.td, styles.tdNum]}>{usd(m.totalIncome)}</Text>
                  <Text style={[styles.td, styles.tdNum]}>{usd(m.totalExpenses)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Numbers at a Glance</Text>
            <View style={styles.grid}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Your Profile</Text>
                <View style={styles.row}><Text style={styles.label}>Loan Balance</Text><Text style={styles.value}>{usd(inputs.currentBalance)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Rate (P&I)</Text><Text style={styles.value}>{inputs.currentRate}%</Text></View>
                <View style={styles.row}><Text style={styles.label}>Monthly Payment</Text><Text style={styles.value}>{usd(inputs.currentMonthlyPayment)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>HELOC Rate</Text><Text style={styles.value}>{inputs.helocRate}%</Text></View>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Income &amp; Expenses</Text>
                <View style={styles.row}><Text style={styles.label}>Pay Frequency</Text><Text style={styles.value}>{inputs.incomeFrequency}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Paycheck</Text><Text style={styles.value}>{usd(inputs.monthlyIncome)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Monthly Expenses</Text><Text style={styles.value}>{usd(inputs.monthlyExpenses)}</Text></View>
                {annualEscrow > 0 && <View style={styles.row}><Text style={styles.label}>Taxes + Insurance</Text><Text style={styles.value}>{usd(annualEscrow)}/yr</Text></View>}
              </View>
            </View>
          </View>

          <Text style={styles.footer}>
            UnMortgage by Patriot Pacific | This report is an estimate based on the numbers provided. Actual results may vary based on rate changes, payment timing, and other factors.
          </Text>
        </Page>
      )}
    </Document>
  );
}

export function DownloadButton({ inputs, result, children }: Props & { children: React.ReactNode }) {
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
