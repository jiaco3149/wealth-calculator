import type { MoneyMapResult, LoanInputs } from '@/lib/types';

function usd(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

export function openMoneyMapPDF(inputs: LoanInputs, result: MoneyMapResult) {
  const freedomDate = new Date(result.freedomDate);
  const formattedDate = freedomDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const annualEscrow = inputs.propertyTaxAnnual + inputs.homeInsuranceAnnual;
  const currentTotalMonthly = inputs.currentMonthlyPayment + annualEscrow / 12;
  const origYears = (result.originalTotalInterest / (currentTotalMonthly * 12)).toFixed(1);
  const pctSaved = result.originalTotalInterest > 0 ? Math.round((result.interestSaved / result.originalTotalInterest) * 100) : 0;
  const firstYear = result.monthlySummary.slice(0, Math.min(12, result.monthlySummary.length));

  const html = `<!DOCTYPE html>
<html>
<head>
<title>UnMortgage Money Map</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #d97706; padding-bottom: 15px; margin-bottom: 30px; }
.logo { font-size: 22px; font-weight: 700; color: #d97706; }
.subtitle { font-size: 10px; color: #666; letter-spacing: 1px; text-transform: uppercase; }
.tagline { font-size: 11px; color: #888; }
.freedom { text-align: center; padding: 24px; background: #fef3c7; border-radius: 8px; margin-bottom: 24px; }
.freedom-label { font-size: 11px; color: #92400e; text-transform: uppercase; letter-spacing: 2px; }
.freedom-value { font-size: 28px; font-weight: 700; color: #d97706; margin: 6px 0; }
.freedom-sub { font-size: 12px; color: #a16207; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.card { padding: 16px; background: #f8fafc; border-radius: 6px; border: 1px solid #e5e7eb; }
.card.highlight { border-color: #d97706; background: #fffbeb; }
.card-title { font-size: 10px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
.row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
.label { color: #666; }
.value { font-weight: 600; }
.value.amber { color: #d97706; }
.value.green { color: #059669; font-size: 14px; }
.savings { text-align: center; padding: 18px; background: #ecfdf5; border-radius: 6px; border: 1px solid #6ee7b7; margin-bottom: 24px; }
.savings-label { font-size: 11px; color: #065f46; text-transform: uppercase; letter-spacing: 1px; }
.savings-value { font-size: 26px; font-weight: 700; color: #059669; margin: 4px 0; }
.warning { padding: 14px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca; margin-bottom: 24px; }
.warning-title { font-size: 12px; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
.warning-text { font-size: 11px; color: #7f1d1d; }
.steps { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.step { text-align: center; padding: 14px; background: #f8fafc; border-radius: 6px; }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: #d97706; color: white; font-weight: 700; font-size: 13px; line-height: 28px; margin: 0 auto 8px; }
.step-title { font-size: 11px; font-weight: 600; }
.step-desc { font-size: 10px; color: #666; }
.section-title { font-size: 13px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
.bar-row { margin-bottom: 12px; }
.bar-label { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
.bar-track { height: 10px; background: #f3f4f6; border-radius: 5px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 5px; }
.cta { padding: 16px; background: #fef3c7; border-radius: 6px; text-align: center; margin-top: 24px; }
.cta-text { font-size: 14px; font-weight: 600; color: #92400e; }
.cta-sub { font-size: 11px; color: #a16207; margin-top: 4px; }
.footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #999; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; }
th { text-align: right; padding: 6px 4px; font-size: 9px; font-weight: 600; color: #666; text-transform: uppercase; border-bottom: 1px solid #d1d5db; background: #f8fafc; }
th:first-child { text-align: left; }
td { text-align: right; padding: 5px 4px; font-size: 10px; color: #333; border-bottom: 0.5px solid #f3f4f6; }
td:first-child { text-align: left; }
tr:nth-child(even) { background: #f9fafb; }
.page-break { page-break-before: always; }
</style>
</head>
<body>
  <div class="header">
    <div><div class="logo">UnMortgage</div><div class="subtitle">Money Map Report</div></div>
    <div class="tagline">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
  </div>

  <div class="freedom">
    <div class="freedom-label">Your Debt Freedom Date</div>
    <div class="freedom-value">${formattedDate}</div>
    <div class="freedom-sub">${result.totalMonths} months — ${result.yearsSaved.toFixed(1)} years sooner</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Current Mortgage</div>
      <div class="row"><span class="label">Payoff Date</span><span class="value">~${origYears} years</span></div>
      <div class="row"><span class="label">Total Interest</span><span class="value">${usd(result.originalTotalInterest)}</span></div>
      <div class="row"><span class="label">Monthly P&amp;I</span><span class="value">${usd(inputs.currentMonthlyPayment)}</span></div>
      ${annualEscrow > 0 ? `<div class="row"><span class="label">+ Taxes & Insurance</span><span class="value">${usd(annualEscrow / 12)}/mo</span></div>` : ''}
    </div>
    <div class="card highlight">
      <div class="card-title" style="color:#d97706">WealthBuilder Plan</div>
      <div class="row"><span class="label">Payoff Date</span><span class="value amber">${formattedDate}</span></div>
      <div class="row"><span class="label">Total Interest</span><span class="value amber">${usd(result.totalInterestPaid)}</span></div>
      <div class="row"><span class="label">Interest Saved</span><span class="value green">${usd(result.interestSaved)}</span></div>
    </div>
  </div>

  <div class="savings">
    <div class="savings-label">Total Interest Savings</div>
    <div class="savings-value">${usd(result.interestSaved)}</div>
    <div style="font-size:11px;color:#065f46;margin-top:3px">${pctSaved}% less interest over the life of your loan</div>
  </div>

  <div class="warning">
    <div class="warning-title">The Amortization Mugging</div>
    <div class="warning-text">
      In the first year of your current mortgage, most of every payment goes to interest — not principal.
      You're not paying down your loan; you're renting money at the bank's price.
      With a ${inputs.currentRate}% rate, roughly ${Math.round(inputs.currentRate / 3 * 10) / 10}% of each payment is bank profit in year one.
      The WealthBuilder strategy stops this by making every dollar work for you from day one.
    </div>
  </div>

  <div class="section-title" style="margin-top:20px">Set It &amp; Forget It</div>
  <div class="steps">
    <div class="step"><div class="step-num">1</div><div class="step-title">Salary Hits HELOC</div><div class="step-desc">Balance drops instantly</div></div>
    <div class="step"><div class="step-num">2</div><div class="step-title">Interest Drops</div><div class="step-desc">Less daily interest</div></div>
    <div class="step"><div class="step-num">3</div><div class="step-title">Bills Drain Slowly</div><div class="step-desc">Repeats each paycheck</div></div>
  </div>

  <div class="section-title">Interest Cost Comparison</div>
  <div class="bar-row">
    <div class="bar-label"><span style="color:#666">Current Mortgage</span><span>${usd(result.originalTotalInterest)}</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:100%;background:#9ca3af"></div></div>
  </div>
  <div class="bar-row">
    <div class="bar-label"><span style="color:#d97706;font-weight:600">WealthBuilder</span><span style="color:#d97706">${usd(result.totalInterestPaid)}</span></div>
    <div class="bar-track"><div class="bar-fill" style="width:${pctSaved}%;background:#d97706"></div></div>
  </div>

  <div class="cta">
    <div class="cta-text">Ready to make this your reality?</div>
    <div class="cta-sub">Book your free UnMortgage Money Map Strategy Session</div>
  </div>

  <div class="footer">UnMortgage by Patriot Pacific | This report is an estimate based on the numbers provided. Actual results may vary.</div>

  <div class="page-break"></div>

  <div class="header">
    <div><div class="logo">UnMortgage</div><div class="subtitle">First Year Breakdown</div></div>
  </div>

  <div class="section-title">Monthly Paydown Schedule — Year 1</div>
  <table>
    <thead><tr><th>Month</th><th>Balance</th><th>Interest</th><th>Principal</th><th>Income</th><th>Expenses</th></tr></thead>
    <tbody>
      ${firstYear.map((m, i) => `<tr><td>${i + 1}</td><td>${usd(m.startBalance)}</td><td>${usd(m.interestCharged)}</td><td>${usd(m.principalPaid)}</td><td>${usd(m.totalIncome)}</td><td>${usd(m.totalExpenses)}</td></tr>`).join('')}
    </tbody>
  </table>

  <div style="margin-top:24px" class="section-title">Key Numbers at a Glance</div>
  <div class="grid">
    <div class="card">
      <div class="card-title">Your Profile</div>
      <div class="row"><span class="label">Loan Balance</span><span class="value">${usd(inputs.currentBalance)}</span></div>
      <div class="row"><span class="label">Rate (P&I)</span><span class="value">${inputs.currentRate}%</span></div>
      <div class="row"><span class="label">Monthly Payment</span><span class="value">${usd(inputs.currentMonthlyPayment)}</span></div>
    </div>
    <div class="card">
      <div class="card-title">Income &amp; Expenses</div>
      <div class="row"><span class="label">Pay Frequency</span><span class="value">${inputs.incomeFrequency}</span></div>
      <div class="row"><span class="label">Paycheck</span><span class="value">${usd(inputs.monthlyIncome)}</span></div>
      <div class="row"><span class="label">Monthly Expenses</span><span class="value">${usd(inputs.monthlyExpenses)}</span></div>
    </div>
  </div>

  <div class="footer">UnMortgage by Patriot Pacific | This report is an estimate. Actual results may vary based on rate changes and payment timing.</div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=800,height=1000');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
