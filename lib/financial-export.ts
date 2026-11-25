// Formal IFRS / FRCN / CAMA 2020 Print-PDF and CSV Exporter for Financial Statements

export function formatAccountingNaira(amount?: number | null): string {
  const val = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const abs = Math.abs(val);
  const formatted = `₦${abs.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return val < -0.004 ? `(${formatted})` : formatted;
}

export type ExportStatementScope =
  | "SOFP"
  | "SOPL"
  | "SOCE"
  | "SOCF"
  | "FULL_PACKAGE";

export function exportFinancialStatementsCSV(statements: any, scope: ExportStatementScope = "FULL_PACKAGE") {
  if (!statements) return;
  const rows: string[][] = [];
  const meta = statements.meta;
  const sofp = statements.statementOfFinancialPosition.current;
  const sopl = statements.incomeStatement;
  const soce = statements.statementOfChangesInEquity;
  const socf = statements.statementOfCashFlows;

  rows.push([meta.companyLegalName, `RC: ${meta.rcNumber}`, `TIN: ${meta.tinNumber}`, `Currency: ${meta.currency}`]);
  rows.push([
    `Reporting Period: ${meta.periodStart ? `${meta.periodStart} to ${meta.periodEnd}` : `Up to ${meta.periodEnd}`}`,
    "Prepared in accordance with IFRS (FRCN) & CAMA 2020",
  ]);
  rows.push([]);

  if (scope === "SOFP" || scope === "FULL_PACKAGE") {
    rows.push(["STATEMENT OF FINANCIAL POSITION (IAS 1 / CAMA 2020)", "Note", "Amount (NGN)"]);
    rows.push(["ASSETS", "", ""]);
    rows.push(["Non-Current Assets", "", ""]);
    rows.push(["Property, Plant and Equipment (Net)", "4", sofp.nonCurrentAssets.ppeCarryingAmount.toFixed(2)]);
    rows.push(["Right-of-Use Assets (IFRS 16)", "4", sofp.nonCurrentAssets.rightOfUseAssets.toFixed(2)]);
    rows.push(["Intangible Assets (IAS 38)", "4", sofp.nonCurrentAssets.intangibleAssets.toFixed(2)]);
    rows.push(["Total Non-Current Assets", "", sofp.nonCurrentAssets.totalNonCurrentAssets.toFixed(2)]);
    rows.push(["Current Assets", "", ""]);
    rows.push(["Inventories - Raw Materials", "5", sofp.currentAssets.inventoriesRawMaterials.toFixed(2)]);
    rows.push(["Inventories - Work-in-Progress (WIP)", "5", sofp.currentAssets.inventoriesWIP.toFixed(2)]);
    rows.push(["Inventories - Finished Goods", "5", sofp.currentAssets.inventoriesFinishedGoods.toFixed(2)]);
    rows.push(["Total Inventories", "5", sofp.currentAssets.totalInventories.toFixed(2)]);
    rows.push(["Trade and Other Receivables", "6", sofp.currentAssets.tradeAndOtherReceivables.toFixed(2)]);
    rows.push(["Prepayments", "6", sofp.currentAssets.prepayments.toFixed(2)]);
    if (sofp.currentAssets.prepaidTaxAsset > 0) {
      rows.push(["Current Tax Asset (Prepaid CIT/TET)", "10", sofp.currentAssets.prepaidTaxAsset.toFixed(2)]);
    }
    rows.push(["Cash and Cash Equivalents", "7", sofp.currentAssets.cashAndCashEquivalents.toFixed(2)]);
    rows.push(["Total Current Assets", "", sofp.currentAssets.totalCurrentAssets.toFixed(2)]);
    rows.push(["TOTAL ASSETS", "", sofp.totalAssets.toFixed(2)]);
    rows.push([]);
    rows.push(["EQUITY AND LIABILITIES", "", ""]);
    rows.push(["Equity Attributable to Owners", "", ""]);
    rows.push(["Issued Ordinary Share Capital", "8", sofp.equity.shareCapital.toFixed(2)]);
    rows.push(["Share Premium", "8", sofp.equity.sharePremium.toFixed(2)]);
    rows.push(["Revaluation Reserve", "8", sofp.equity.revaluationReserve.toFixed(2)]);
    rows.push(["General / Owner Capital Reserve", "8", sofp.equity.generalReserve.toFixed(2)]);
    rows.push(["Retained Earnings", "8", sofp.equity.retainedEarnings.toFixed(2)]);
    rows.push(["Total Equity", "", sofp.equity.totalEquity.toFixed(2)]);
    rows.push(["Non-Current Liabilities", "", ""]);
    rows.push(["Long-Term Borrowings & Asset Financing", "9", sofp.nonCurrentLiabilities.longTermBorrowings.toFixed(2)]);
    rows.push(["Deferred Tax Liabilities", "10", sofp.nonCurrentLiabilities.deferredTaxLiability.toFixed(2)]);
    rows.push(["Total Non-Current Liabilities", "", sofp.nonCurrentLiabilities.totalNonCurrentLiabilities.toFixed(2)]);
    rows.push(["Current Liabilities", "", ""]);
    rows.push(["Trade Payables", "9", sofp.currentLiabilities.tradePayables.toFixed(2)]);
    rows.push(["Accrued Expenses & Other Payables", "9", sofp.currentLiabilities.accruedExpenses.toFixed(2)]);
    rows.push(["Contract Liabilities (Customer Deposits)", "9", sofp.currentLiabilities.contractLiabilities.toFixed(2)]);
    rows.push(["Statutory Payables (VAT, PAYE, Pension)", "9", sofp.currentLiabilities.statutoryPayables.toFixed(2)]);
    rows.push(["Short-Term Borrowings", "9", sofp.currentLiabilities.shortTermBorrowings.toFixed(2)]);
    if (sofp.currentLiabilities.bankOverdraft > 0) {
      rows.push(["Bank Overdraft / Working Capital Deficit", "7", sofp.currentLiabilities.bankOverdraft.toFixed(2)]);
    }
    rows.push(["Current Income Tax Payable (CIT & TET)", "10", sofp.currentLiabilities.currentTaxPayable.toFixed(2)]);
    rows.push(["Total Current Liabilities", "", sofp.currentLiabilities.totalCurrentLiabilities.toFixed(2)]);
    rows.push(["TOTAL LIABILITIES", "", sofp.totalLiabilities.toFixed(2)]);
    rows.push(["TOTAL EQUITY AND LIABILITIES", "", sofp.totalEquityAndLiabilities.toFixed(2)]);
    rows.push([]);
  }

  if (scope === "SOPL" || scope === "FULL_PACKAGE") {
    rows.push(["STATEMENT OF PROFIT OR LOSS AND OTHER COMPREHENSIVE INCOME", "Note", "Amount (NGN)"]);
    rows.push(["Gross Revenue", "3", sopl.grossRevenue.toFixed(2)]);
    rows.push(["Less: Sales Discounts", "3", (-sopl.salesDiscounts).toFixed(2)]);
    rows.push(["Net Revenue", "3", sopl.revenue.toFixed(2)]);
    rows.push(["Cost of Sales", "3", (-sopl.costOfSales).toFixed(2)]);
    rows.push(["Gross Profit", "", sopl.grossProfit.toFixed(2)]);
    rows.push(["Administrative, Selling & Operating Expenses", "", (-sopl.operatingExpenses).toFixed(2)]);
    rows.push(["Depreciation & Amortisation (IAS 16 / IAS 38)", "4", (-sopl.depreciationAndAmortisation).toFixed(2)]);
    if (sopl.otherOperatingGainLoss !== 0) {
      rows.push(["Gain / (Loss) on Disposal of PPE", "4", sopl.otherOperatingGainLoss.toFixed(2)]);
    }
    rows.push(["Operating Profit (EBIT)", "", sopl.operatingProfitEBIT.toFixed(2)]);
    rows.push(["Finance Costs", "", (-sopl.financeCosts).toFixed(2)]);
    rows.push(["Profit Before Tax (PBT)", "", sopl.profitBeforeTax.toFixed(2)]);
    rows.push([`Company Income Tax (CIT @ ${sopl.taxBreakdown.citRate}%)`, "10", (-sopl.taxBreakdown.citAmount).toFixed(2)]);
    rows.push([`Tertiary Education Tax (TET @ ${sopl.taxBreakdown.tetRate}%)`, "10", (-sopl.taxBreakdown.tetAmount).toFixed(2)]);
    if (sopl.taxBreakdown.deferredTaxExpense !== 0) {
      rows.push(["Deferred Tax Charge", "10", (-sopl.taxBreakdown.deferredTaxExpense).toFixed(2)]);
    }
    rows.push(["Profit for the Period (PAT)", "", sopl.profitForThePeriod.toFixed(2)]);
    rows.push(["Other Comprehensive Income (PPE Revaluation Surplus)", "4", sopl.otherComprehensiveIncomeReval.toFixed(2)]);
    rows.push(["TOTAL COMPREHENSIVE INCOME FOR THE PERIOD", "", sopl.totalComprehensiveIncome.toFixed(2)]);
    rows.push([]);
  }

  if (scope === "SOCE" || scope === "FULL_PACKAGE") {
    rows.push([
      "STATEMENT OF CHANGES IN EQUITY (IAS 1)",
      "Share Capital",
      "Share Premium",
      "Revaluation Reserve",
      "General Reserve",
      "Retained Earnings",
      "Total Equity",
    ]);
    rows.push([
      "Opening Balance",
      soce.opening.shareCapital.toFixed(2),
      soce.opening.sharePremium.toFixed(2),
      soce.opening.revaluationReserve.toFixed(2),
      soce.opening.generalReserve.toFixed(2),
      soce.opening.retainedEarnings.toFixed(2),
      soce.opening.total.toFixed(2),
    ]);
    rows.push(["Profit for the Period", "0.00", "0.00", "0.00", "0.00", soce.profitForPeriod.toFixed(2), soce.profitForPeriod.toFixed(2)]);
    rows.push([
      "Other Comprehensive Income (Revaluation)",
      "0.00",
      "0.00",
      soce.otherComprehensiveIncome.toFixed(2),
      "0.00",
      "0.00",
      soce.otherComprehensiveIncome.toFixed(2),
    ]);
    rows.push([
      "Issue of Shares / Capital Introduced",
      soce.issueOfShares.toFixed(2),
      soce.sharePremiumMovement.toFixed(2),
      "0.00",
      soce.capitalAndReservesMovement.toFixed(2),
      soce.openingRetainedEarningsAdjustment.toFixed(2),
      (
        soce.issueOfShares +
        soce.sharePremiumMovement +
        soce.capitalAndReservesMovement +
        soce.openingRetainedEarningsAdjustment
      ).toFixed(2),
    ]);
    rows.push([
      "Dividends Paid / Drawings",
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      soce.dividendsAndDrawings.toFixed(2),
      soce.dividendsAndDrawings.toFixed(2),
    ]);
    rows.push([
      "Closing Balance",
      soce.closing.shareCapital.toFixed(2),
      soce.closing.sharePremium.toFixed(2),
      soce.closing.revaluationReserve.toFixed(2),
      soce.closing.generalReserve.toFixed(2),
      soce.closing.retainedEarnings.toFixed(2),
      soce.closing.total.toFixed(2),
    ]);
    rows.push([]);
  }

  if (scope === "SOCF" || scope === "FULL_PACKAGE") {
    rows.push(["STATEMENT OF CASH FLOWS (IAS 7 - INDIRECT METHOD)", "", "Amount (NGN)"]);
    rows.push(["Operating Activities", "", ""]);
    rows.push(["Profit Before Tax", "", socf.indirect.profitBeforeTax.toFixed(2)]);
    rows.push(["Depreciation and Amortisation", "4", socf.indirect.depreciationAndAmortisation.toFixed(2)]);
    if (socf.indirect.otherNonCashAdjustments !== 0) {
      rows.push(["(Gain)/Loss on Disposal of PPE", "4", socf.indirect.otherNonCashAdjustments.toFixed(2)]);
    }
    rows.push(["(Increase)/Decrease in Inventories", "5", socf.indirect.changeInInventories.toFixed(2)]);
    rows.push(["(Increase)/Decrease in Trade & Other Receivables", "6", socf.indirect.changeInReceivables.toFixed(2)]);
    rows.push(["(Increase)/Decrease in Prepayments", "6", socf.indirect.changeInPrepayments.toFixed(2)]);
    rows.push(["Increase/(Decrease) in Trade Payables & Accruals", "9", socf.indirect.changeInPayablesAndAccruals.toFixed(2)]);
    rows.push(["Cash Generated from Operations", "", socf.indirect.cashGeneratedFromOperations.toFixed(2)]);
    rows.push(["Income Taxes Paid (CIT & TET)", "10", socf.indirect.incomeTaxesPaid.toFixed(2)]);
    rows.push(["Net Cash from Operating Activities", "", socf.indirect.netCashFromOperatingActivities.toFixed(2)]);
    rows.push(["Investing Activities", "", ""]);
    rows.push(["Purchase of Property, Plant and Equipment", "4", socf.investing.purchaseOfPPE.toFixed(2)]);
    rows.push(["Purchase of Intangible Assets", "4", socf.investing.purchaseOfIntangibles.toFixed(2)]);
    rows.push(["Proceeds from Disposal of PPE", "4", socf.investing.proceedsFromDisposalOfPPE.toFixed(2)]);
    rows.push(["Net Cash used in Investing Activities", "", socf.investing.netCashFromInvestingActivities.toFixed(2)]);
    rows.push(["Financing Activities", "", ""]);
    rows.push(["Proceeds from Share Issue / Owner Capital", "8", socf.financing.proceedsFromShareIssue.toFixed(2)]);
    rows.push(["Proceeds from Borrowings", "9", socf.financing.borrowingsReceived.toFixed(2)]);
    rows.push(["Repayment of Borrowings", "9", socf.financing.borrowingsRepaid.toFixed(2)]);
    rows.push(["Dividends / Drawings Paid", "8", socf.financing.dividendsPaid.toFixed(2)]);
    rows.push(["Net Cash from Financing Activities", "", socf.financing.netCashFromFinancingActivities.toFixed(2)]);
    rows.push(["Net Increase/(Decrease) in Cash & Cash Equivalents", "", socf.netIncreaseInCash.toFixed(2)]);
    rows.push(["Opening Cash & Cash Equivalents", "7", socf.openingCashEquivalents.toFixed(2)]);
    rows.push(["CLOSING CASH & CASH EQUIVALENTS", "7", socf.closingCashEquivalents.toFixed(2)]);
  }

  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `mlaz_${scope.toLowerCase()}_${meta.periodEnd}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFinancialStatementsPDF(
  statements: any,
  scope: ExportStatementScope = "FULL_PACKAGE",
  cashFlowMethod: "INDIRECT" | "DIRECT" = "INDIRECT"
) {
  if (!statements) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const meta = statements.meta;
  const sofp = statements.statementOfFinancialPosition.current;
  const comp = statements.statementOfFinancialPosition.comparative;
  const sopl = statements.incomeStatement;
  const soce = statements.statementOfChangesInEquity;
  const socf = statements.statementOfCashFlows;
  const fmt = formatAccountingNaira;

  const periodLabel = meta.periodStart
    ? `For the Period ${meta.periodStart} to ${meta.periodEnd}`
    : `For the Period Ended ${meta.periodEnd}`;

  const renderSOFP = () => `
    <div class="stmt-section">
      <div class="stmt-header">
        <h3>STATEMENT OF FINANCIAL POSITION</h3>
        <div class="stmt-sub">As at ${meta.periodEnd} (Prepared in accordance with IAS 1 &amp; CAMA 2020)</div>
      </div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Particulars</th>
            <th style="width: 60px; text-align: center;">Note</th>
            <th style="width: 170px; text-align: right;">${meta.periodEnd}<br/>(₦)</th>
            ${comp ? `<th style="width: 170px; text-align: right;">Opening (${meta.periodStart})<br/>(₦)</th>` : ""}
          </tr>
        </thead>
        <tbody>
          <tr class="group-row"><td colspan="${comp ? 4 : 3}">ASSETS</td></tr>
          <tr class="sub-group"><td colspan="${comp ? 4 : 3}">Non-Current Assets</td></tr>
          <tr>
            <td class="indent">Property, plant and equipment</td>
            <td class="note-col">4</td>
            <td class="num">${fmt(sofp.nonCurrentAssets.ppeCarryingAmount)}</td>
            ${comp ? `<td class="num">${fmt(comp.nonCurrentAssets.ppeCarryingAmount)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Right-of-use assets</td>
            <td class="note-col">4</td>
            <td class="num">${fmt(sofp.nonCurrentAssets.rightOfUseAssets)}</td>
            ${comp ? `<td class="num">${fmt(comp.nonCurrentAssets.rightOfUseAssets)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Intangible assets</td>
            <td class="note-col">4</td>
            <td class="num">${fmt(sofp.nonCurrentAssets.intangibleAssets)}</td>
            ${comp ? `<td class="num">${fmt(comp.nonCurrentAssets.intangibleAssets)}</td>` : ""}
          </tr>
          <tr class="subtotal-row">
            <td>Total Non-Current Assets</td>
            <td></td>
            <td class="num">${fmt(sofp.nonCurrentAssets.totalNonCurrentAssets)}</td>
            ${comp ? `<td class="num">${fmt(comp.nonCurrentAssets.totalNonCurrentAssets)}</td>` : ""}
          </tr>

          <tr class="sub-group"><td colspan="${comp ? 4 : 3}">Current Assets</td></tr>
          <tr>
            <td class="indent">Inventories (Raw materials, WIP &amp; Finished goods)</td>
            <td class="note-col">5</td>
            <td class="num">${fmt(sofp.currentAssets.totalInventories)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentAssets.totalInventories)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Trade and other receivables</td>
            <td class="note-col">6</td>
            <td class="num">${fmt(sofp.currentAssets.tradeAndOtherReceivables)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentAssets.tradeAndOtherReceivables)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Prepayments &amp; advances</td>
            <td class="note-col">6</td>
            <td class="num">${fmt(sofp.currentAssets.prepayments + sofp.currentAssets.prepaidTaxAsset)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentAssets.prepayments + comp.currentAssets.prepaidTaxAsset)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Cash and cash equivalents</td>
            <td class="note-col">7</td>
            <td class="num">${fmt(sofp.currentAssets.cashAndCashEquivalents)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentAssets.cashAndCashEquivalents)}</td>` : ""}
          </tr>
          <tr class="subtotal-row">
            <td>Total Current Assets</td>
            <td></td>
            <td class="num">${fmt(sofp.currentAssets.totalCurrentAssets)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentAssets.totalCurrentAssets)}</td>` : ""}
          </tr>
          <tr class="grand-total-row">
            <td>TOTAL ASSETS</td>
            <td></td>
            <td class="num">${fmt(sofp.totalAssets)}</td>
            ${comp ? `<td class="num">${fmt(comp.totalAssets)}</td>` : ""}
          </tr>

          <tr class="group-row"><td colspan="${comp ? 4 : 3}">EQUITY AND LIABILITIES</td></tr>
          <tr class="sub-group"><td colspan="${comp ? 4 : 3}">Equity Attributable to Owners of the Company</td></tr>
          <tr>
            <td class="indent">Issued ordinary share capital</td>
            <td class="note-col">8</td>
            <td class="num">${fmt(sofp.equity.shareCapital)}</td>
            ${comp ? `<td class="num">${fmt(comp.equity.shareCapital)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Share premium</td>
            <td class="note-col">8</td>
            <td class="num">${fmt(sofp.equity.sharePremium)}</td>
            ${comp ? `<td class="num">${fmt(comp.equity.sharePremium)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Revaluation &amp; capital reserves</td>
            <td class="note-col">8</td>
            <td class="num">${fmt(sofp.equity.revaluationReserve + sofp.equity.generalReserve)}</td>
            ${comp ? `<td class="num">${fmt(comp.equity.revaluationReserve + comp.equity.generalReserve)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Retained earnings</td>
            <td class="note-col">8</td>
            <td class="num">${fmt(sofp.equity.retainedEarnings)}</td>
            ${comp ? `<td class="num">${fmt(comp.equity.retainedEarnings)}</td>` : ""}
          </tr>
          <tr class="subtotal-row">
            <td>Total Equity</td>
            <td></td>
            <td class="num">${fmt(sofp.equity.totalEquity)}</td>
            ${comp ? `<td class="num">${fmt(comp.equity.totalEquity)}</td>` : ""}
          </tr>

          <tr class="sub-group"><td colspan="${comp ? 4 : 3}">Non-Current Liabilities</td></tr>
          <tr>
            <td class="indent">Long-term borrowings &amp; asset financing</td>
            <td class="note-col">9</td>
            <td class="num">${fmt(sofp.nonCurrentLiabilities.longTermBorrowings)}</td>
            ${comp ? `<td class="num">${fmt(comp.nonCurrentLiabilities.longTermBorrowings)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Deferred tax liabilities</td>
            <td class="note-col">10</td>
            <td class="num">${fmt(sofp.nonCurrentLiabilities.deferredTaxLiability)}</td>
            ${comp ? `<td class="num">${fmt(comp.nonCurrentLiabilities.deferredTaxLiability)}</td>` : ""}
          </tr>
          <tr class="subtotal-row">
            <td>Total Non-Current Liabilities</td>
            <td></td>
            <td class="num">${fmt(sofp.nonCurrentLiabilities.totalNonCurrentLiabilities)}</td>
            ${comp ? `<td class="num">${fmt(comp.nonCurrentLiabilities.totalNonCurrentLiabilities)}</td>` : ""}
          </tr>

          <tr class="sub-group"><td colspan="${comp ? 4 : 3}">Current Liabilities</td></tr>
          <tr>
            <td class="indent">Trade and other payables</td>
            <td class="note-col">9</td>
            <td class="num">${fmt(sofp.currentLiabilities.tradePayables + sofp.currentLiabilities.accruedExpenses)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentLiabilities.tradePayables + comp.currentLiabilities.accruedExpenses)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Contract liabilities (Customer deposits)</td>
            <td class="note-col">9</td>
            <td class="num">${fmt(sofp.currentLiabilities.contractLiabilities)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentLiabilities.contractLiabilities)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Statutory payables (VAT, PAYE, Pension)</td>
            <td class="note-col">9</td>
            <td class="num">${fmt(sofp.currentLiabilities.statutoryPayables)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentLiabilities.statutoryPayables)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Short-term borrowings &amp; bank overdraft</td>
            <td class="note-col">7, 9</td>
            <td class="num">${fmt(sofp.currentLiabilities.shortTermBorrowings + sofp.currentLiabilities.bankOverdraft)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentLiabilities.shortTermBorrowings + comp.currentLiabilities.bankOverdraft)}</td>` : ""}
          </tr>
          <tr>
            <td class="indent">Current income tax payable (FIRS CIT &amp; TET)</td>
            <td class="note-col">10</td>
            <td class="num">${fmt(sofp.currentLiabilities.currentTaxPayable)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentLiabilities.currentTaxPayable)}</td>` : ""}
          </tr>
          <tr class="subtotal-row">
            <td>Total Current Liabilities</td>
            <td></td>
            <td class="num">${fmt(sofp.currentLiabilities.totalCurrentLiabilities)}</td>
            ${comp ? `<td class="num">${fmt(comp.currentLiabilities.totalCurrentLiabilities)}</td>` : ""}
          </tr>
          <tr class="subtotal-row">
            <td>Total Liabilities</td>
            <td></td>
            <td class="num">${fmt(sofp.totalLiabilities)}</td>
            ${comp ? `<td class="num">${fmt(comp.totalLiabilities)}</td>` : ""}
          </tr>
          <tr class="grand-total-row">
            <td>TOTAL EQUITY AND LIABILITIES</td>
            <td></td>
            <td class="num">${fmt(sofp.totalEquityAndLiabilities)}</td>
            ${comp ? `<td class="num">${fmt(comp.totalEquityAndLiabilities)}</td>` : ""}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const renderSOPL = () => `
    <div class="stmt-section">
      <div class="stmt-header">
        <h3>STATEMENT OF PROFIT OR LOSS AND OTHER COMPREHENSIVE INCOME</h3>
        <div class="stmt-sub">${periodLabel} (IAS 1 &amp; Nigerian Finance Act Compliant)</div>
      </div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Particulars</th>
            <th style="width: 60px; text-align: center;">Note</th>
            <th style="width: 190px; text-align: right;">Amount (₦)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Revenue from contracts with customers</td>
            <td class="note-col">3</td>
            <td class="num">${fmt(sopl.revenue)}</td>
          </tr>
          <tr>
            <td>Cost of sales (Direct manufacturing &amp; factory overheads)</td>
            <td class="note-col">3</td>
            <td class="num">${fmt(-sopl.costOfSales)}</td>
          </tr>
          <tr class="subtotal-row">
            <td>Gross Profit</td>
            <td></td>
            <td class="num">${fmt(sopl.grossProfit)}</td>
          </tr>
          <tr>
            <td>Administrative, selling &amp; distribution expenses</td>
            <td class="note-col">3</td>
            <td class="num">${fmt(-sopl.operatingExpenses)}</td>
          </tr>
          <tr>
            <td>Depreciation and amortisation of non-current assets</td>
            <td class="note-col">4</td>
            <td class="num">${fmt(-sopl.depreciationAndAmortisation)}</td>
          </tr>
          ${
            sopl.otherOperatingGainLoss !== 0
              ? `<tr><td>Other operating gain/(loss) on asset disposal</td><td class="note-col">4</td><td class="num">${fmt(sopl.otherOperatingGainLoss)}</td></tr>`
              : ""
          }
          <tr class="subtotal-row">
            <td>Operating Profit (EBIT)</td>
            <td></td>
            <td class="num">${fmt(sopl.operatingProfitEBIT)}</td>
          </tr>
          <tr>
            <td>Finance costs</td>
            <td></td>
            <td class="num">${fmt(-sopl.financeCosts)}</td>
          </tr>
          <tr class="subtotal-row">
            <td>Profit Before Taxation</td>
            <td></td>
            <td class="num">${fmt(sopl.profitBeforeTax)}</td>
          </tr>
          <tr>
            <td class="indent">Company Income Tax (${sopl.taxBreakdown.companySizeTier} @ ${sopl.taxBreakdown.citRate}%)</td>
            <td class="note-col">10</td>
            <td class="num">${fmt(-sopl.taxBreakdown.citAmount)}</td>
          </tr>
          <tr>
            <td class="indent">Tertiary Education Tax (TET @ ${sopl.taxBreakdown.tetRate}%)</td>
            <td class="note-col">10</td>
            <td class="num">${fmt(-sopl.taxBreakdown.tetAmount)}</td>
          </tr>
          ${
            sopl.taxBreakdown.deferredTaxExpense !== 0
              ? `<tr><td class="indent">Deferred taxation</td><td class="note-col">10</td><td class="num">${fmt(-sopl.taxBreakdown.deferredTaxExpense)}</td></tr>`
              : ""
          }
          <tr class="subtotal-row">
            <td>Profit for the Period (PAT)</td>
            <td></td>
            <td class="num">${fmt(sopl.profitForThePeriod)}</td>
          </tr>
          <tr>
            <td>Other Comprehensive Income: Revaluation surplus on PPE</td>
            <td class="note-col">4</td>
            <td class="num">${fmt(sopl.otherComprehensiveIncomeReval)}</td>
          </tr>
          <tr class="grand-total-row">
            <td>TOTAL COMPREHENSIVE INCOME FOR THE PERIOD</td>
            <td></td>
            <td class="num">${fmt(sopl.totalComprehensiveIncome)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const renderSOCE = () => `
    <div class="stmt-section">
      <div class="stmt-header">
        <h3>STATEMENT OF CHANGES IN EQUITY</h3>
        <div class="stmt-sub">${periodLabel} (IAS 1.106 &amp; CAMA 2020)</div>
      </div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Movements in Equity</th>
            <th style="text-align: right;">Share Capital (₦)</th>
            <th style="text-align: right;">Share Premium (₦)</th>
            <th style="text-align: right;">Revaluation &amp; Reserves (₦)</th>
            <th style="text-align: right;">Retained Earnings (₦)</th>
            <th style="text-align: right;">Total Equity (₦)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subtotal-row">
            <td>Opening Balance</td>
            <td class="num">${fmt(soce.opening.shareCapital)}</td>
            <td class="num">${fmt(soce.opening.sharePremium)}</td>
            <td class="num">${fmt(soce.opening.revaluationReserve + soce.opening.generalReserve)}</td>
            <td class="num">${fmt(soce.opening.retainedEarnings)}</td>
            <td class="num">${fmt(soce.opening.total)}</td>
          </tr>
          <tr>
            <td>Profit for the period</td>
            <td class="num">—</td>
            <td class="num">—</td>
            <td class="num">—</td>
            <td class="num">${fmt(soce.profitForPeriod)}</td>
            <td class="num">${fmt(soce.profitForPeriod)}</td>
          </tr>
          <tr>
            <td>Other comprehensive income (Revaluation surplus)</td>
            <td class="num">—</td>
            <td class="num">—</td>
            <td class="num">${fmt(soce.otherComprehensiveIncome)}</td>
            <td class="num">—</td>
            <td class="num">${fmt(soce.otherComprehensiveIncome)}</td>
          </tr>
          <tr>
            <td>Issue of shares &amp; owner capital contributions</td>
            <td class="num">${fmt(soce.issueOfShares)}</td>
            <td class="num">${fmt(soce.sharePremiumMovement)}</td>
            <td class="num">${fmt(soce.capitalAndReservesMovement)}</td>
            <td class="num">${fmt(soce.openingRetainedEarningsAdjustment)}</td>
            <td class="num">${fmt(
              soce.issueOfShares +
                soce.sharePremiumMovement +
                soce.capitalAndReservesMovement +
                soce.openingRetainedEarningsAdjustment
            )}</td>
          </tr>
          <tr>
            <td>Dividends declared &amp; paid / Drawings</td>
            <td class="num">—</td>
            <td class="num">—</td>
            <td class="num">—</td>
            <td class="num">${fmt(soce.dividendsAndDrawings)}</td>
            <td class="num">${fmt(soce.dividendsAndDrawings)}</td>
          </tr>
          <tr class="grand-total-row">
            <td>Closing Balance as at ${meta.periodEnd}</td>
            <td class="num">${fmt(soce.closing.shareCapital)}</td>
            <td class="num">${fmt(soce.closing.sharePremium)}</td>
            <td class="num">${fmt(soce.closing.revaluationReserve + soce.closing.generalReserve)}</td>
            <td class="num">${fmt(soce.closing.retainedEarnings)}</td>
            <td class="num">${fmt(soce.closing.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const renderSOCF = () => `
    <div class="stmt-section">
      <div class="stmt-header">
        <h3>STATEMENT OF CASH FLOWS (${cashFlowMethod === "DIRECT" ? "DIRECT METHOD" : "INDIRECT METHOD"})</h3>
        <div class="stmt-sub">${periodLabel} (Prepared in accordance with IAS 7)</div>
      </div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Cash Flow Activities</th>
            <th style="width: 60px; text-align: center;">Note</th>
            <th style="width: 190px; text-align: right;">Amount (₦)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="group-row"><td colspan="3">Cash Flows from Operating Activities</td></tr>
          ${
            cashFlowMethod === "INDIRECT"
              ? `
                <tr><td>Profit before taxation</td><td></td><td class="num">${fmt(socf.indirect.profitBeforeTax)}</td></tr>
                <tr><td class="indent">Adjustment for depreciation &amp; amortisation</td><td class="note-col">4</td><td class="num">${fmt(socf.indirect.depreciationAndAmortisation)}</td></tr>
                ${
                  socf.indirect.otherNonCashAdjustments !== 0
                    ? `<tr><td class="indent">Adjustment for (gain)/loss on PPE disposal</td><td class="note-col">4</td><td class="num">${fmt(socf.indirect.otherNonCashAdjustments)}</td></tr>`
                    : ""
                }
                <tr class="subtotal-row"><td>Operating cash flows before working capital changes</td><td></td><td class="num">${fmt(socf.indirect.operatingCashBeforeWorkingCapital)}</td></tr>
                <tr><td class="indent">(Increase) / Decrease in inventories</td><td class="note-col">5</td><td class="num">${fmt(socf.indirect.changeInInventories)}</td></tr>
                <tr><td class="indent">(Increase) / Decrease in trade &amp; other receivables</td><td class="note-col">6</td><td class="num">${fmt(socf.indirect.changeInReceivables)}</td></tr>
                <tr><td class="indent">(Increase) / Decrease in prepayments</td><td class="note-col">6</td><td class="num">${fmt(socf.indirect.changeInPrepayments)}</td></tr>
                <tr><td class="indent">Increase / (Decrease) in trade payables, deposits &amp; accruals</td><td class="note-col">9</td><td class="num">${fmt(socf.indirect.changeInPayablesAndAccruals)}</td></tr>
                <tr class="subtotal-row"><td>Cash generated from operations</td><td></td><td class="num">${fmt(socf.indirect.cashGeneratedFromOperations)}</td></tr>
                <tr><td class="indent">Income taxes paid to FIRS (CIT &amp; TET)</td><td class="note-col">10</td><td class="num">${fmt(socf.indirect.incomeTaxesPaid)}</td></tr>
              `
              : `
                <tr><td class="indent">Cash receipts from customers</td><td class="note-col">3, 6</td><td class="num">${fmt(socf.direct.cashReceiptsFromCustomers)}</td></tr>
                <tr><td class="indent">Cash paid to suppliers and production</td><td class="note-col">5, 9</td><td class="num">${fmt(socf.direct.cashPaidToSuppliersAndProduction)}</td></tr>
                <tr><td class="indent">Cash paid for operating expenses &amp; finance charges</td><td></td><td class="num">${fmt(socf.direct.cashPaidForOperatingAndFinance)}</td></tr>
                <tr><td class="indent">Income taxes paid to FIRS (CIT &amp; TET)</td><td class="note-col">10</td><td class="num">${fmt(socf.direct.incomeTaxesPaid)}</td></tr>
              `
          }
          <tr class="subtotal-row">
            <td>Net Cash Generated from / (Used in) Operating Activities</td>
            <td></td>
            <td class="num">${fmt(socf.indirect.netCashFromOperatingActivities)}</td>
          </tr>

          <tr class="group-row"><td colspan="3">Cash Flows from Investing Activities</td></tr>
          <tr><td class="indent">Acquisition of property, plant and equipment</td><td class="note-col">4</td><td class="num">${fmt(socf.investing.purchaseOfPPE)}</td></tr>
          <tr><td class="indent">Acquisition of intangible assets</td><td class="note-col">4</td><td class="num">${fmt(socf.investing.purchaseOfIntangibles)}</td></tr>
          <tr><td class="indent">Proceeds from disposal of property, plant and equipment</td><td class="note-col">4</td><td class="num">${fmt(socf.investing.proceedsFromDisposalOfPPE)}</td></tr>
          <tr class="subtotal-row">
            <td>Net Cash Used in Investing Activities</td>
            <td></td>
            <td class="num">${fmt(socf.investing.netCashFromInvestingActivities)}</td>
          </tr>

          <tr class="group-row"><td colspan="3">Cash Flows from Financing Activities</td></tr>
          <tr><td class="indent">Proceeds from issue of share capital &amp; owner equity</td><td class="note-col">8</td><td class="num">${fmt(socf.financing.proceedsFromShareIssue)}</td></tr>
          <tr><td class="indent">Proceeds from bank &amp; director borrowings</td><td class="note-col">9</td><td class="num">${fmt(socf.financing.borrowingsReceived)}</td></tr>
          <tr><td class="indent">Repayment of borrowings</td><td class="note-col">9</td><td class="num">${fmt(socf.financing.borrowingsRepaid)}</td></tr>
          <tr><td class="indent">Dividends &amp; drawings paid</td><td class="note-col">8</td><td class="num">${fmt(socf.financing.dividendsPaid)}</td></tr>
          <tr class="subtotal-row">
            <td>Net Cash Generated from / (Used in) Financing Activities</td>
            <td></td>
            <td class="num">${fmt(socf.financing.netCashFromFinancingActivities)}</td>
          </tr>

          <tr class="subtotal-row">
            <td>Net Increase / (Decrease) in Cash and Cash Equivalents</td>
            <td></td>
            <td class="num">${fmt(socf.netIncreaseInCash)}</td>
          </tr>
          <tr>
            <td>Cash and cash equivalents at beginning of period</td>
            <td class="note-col">7</td>
            <td class="num">${fmt(socf.openingCashEquivalents)}</td>
          </tr>
          <tr class="grand-total-row">
            <td>CASH AND CASH EQUIVALENTS AT END OF PERIOD</td>
            <td class="note-col">7</td>
            <td class="num">${fmt(socf.closingCashEquivalents)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  let bodyHtml = "";
  if (scope === "SOFP") bodyHtml = renderSOFP();
  else if (scope === "SOPL") bodyHtml = renderSOPL();
  else if (scope === "SOCE") bodyHtml = renderSOCE();
  else if (scope === "SOCF") bodyHtml = renderSOCF();
  else {
    bodyHtml = renderSOFP() + renderSOPL() + renderSOCE() + renderSOCF();
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${meta.companyLegalName} - Financial Statements (${meta.periodEnd})</title>
        <style>
          body { font-family: "Georgia", "Times New Roman", serif; padding: 36px 48px; color: #1C0D05; line-height: 1.45; }
          .corp-banner { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #3D1F0E; padding-bottom: 16px; margin-bottom: 24px; }
          .corp-left { display: flex; align-items: center; gap: 14px; }
          .corp-logo { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; border: 2px solid #B8860B; }
          .corp-logo img { width: 100%; height: 100%; object-fit: cover; }
          .corp-title { font-size: 22px; font-weight: 800; color: #3D1F0E; margin: 0; letter-spacing: 0.03em; }
          .corp-tagline { font-size: 12px; font-style: italic; color: #B8860B; margin-top: 2px; }
          .corp-reg { text-align: right; font-family: sans-serif; font-size: 11px; color: #555; line-height: 1.6; }
          .stmt-section { margin-bottom: 38px; page-break-inside: avoid; }
          .stmt-header { margin-bottom: 12px; }
          .stmt-header h3 { margin: 0; font-size: 16px; color: #3D1F0E; text-transform: uppercase; letter-spacing: 0.04em; }
          .stmt-sub { font-family: sans-serif; font-size: 12px; color: #6B5744; margin-top: 2px; }
          .fin-table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12.5px; }
          .fin-table th { background: #F5EFE6; color: #3D1F0E; padding: 8px 10px; border-top: 1.5px solid #3D1F0E; border-bottom: 1.5px solid #3D1F0E; text-align: left; font-weight: 700; }
          .fin-table td { padding: 6px 10px; border-bottom: 1px solid #EFEAE2; }
          .indent { padding-left: 24px !important; }
          .note-col { text-align: center; color: #6B5744; font-weight: 600; }
          .num { text-align: right; font-variant-numeric: tabular-nums; }
          .group-row td { font-weight: 800; background: #FAF7F2; color: #3D1F0E; padding-top: 10px; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.05em; }
          .sub-group td { font-weight: 700; color: #6B3A1F; padding-top: 8px; }
          .subtotal-row td { font-weight: 700; border-top: 1px solid #3D1F0E; border-bottom: 1px solid #3D1F0E; background: #FDFBF8; }
          .grand-total-row td { font-weight: 800; font-size: 13px; border-top: 1.5px solid #1C0D05; border-bottom: 4px double #1C0D05; background: #F5EFE6; color: #1C0D05; }
          .signoff-grid { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 24px; font-family: sans-serif; font-size: 12px; page-break-inside: avoid; }
          .sign-box { width: 42%; border-top: 1px solid #1C0D05; padding-top: 8px; }
          .compliance-foot { margin-top: 24px; font-family: sans-serif; font-size: 10.5px; color: #6B5744; border-top: 1px solid #E8DDD0; padding-top: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="corp-banner">
          <div class="corp-left">
            <div class="corp-logo">
              <img src="${window.location.origin}/logo.jpg" alt="Logo" />
            </div>
            <div>
              <h1 class="corp-title">${meta.companyLegalName}</h1>
              <div class="corp-tagline">Guaranteed amble across the globe</div>
            </div>
          </div>
          <div class="corp-reg">
            <div><strong>CAC Reg No:</strong> ${meta.rcNumber}</div>
            <div><strong>FIRS TIN:</strong> ${meta.tinNumber}</div>
            <div><strong>Reporting Currency:</strong> Nigerian Naira (₦ / NGN)</div>
            <div><strong>Standards:</strong> IFRS (FRCN) &amp; CAMA 2020</div>
          </div>
        </div>

        ${bodyHtml}

        <div class="signoff-grid">
          <div class="sign-box">
            <strong>${meta.preparedBy}</strong><br/>
            <span style="color:#6B5744;">Prepared By (Chief Financial Officer / Accountant)</span><br/>
            <span style="color:#888; font-size:11px;">Date: ${new Date().toLocaleDateString("en-NG")}</span>
          </div>
          <div class="sign-box">
            <strong>${meta.approvedBy}</strong><br/>
            <span style="color:#6B5744;">Approved By Board of Directors (CAMA 2020 s.386)</span><br/>
            <span style="color:#888; font-size:11px;">Date: ${new Date().toLocaleDateString("en-NG")}</span>
          </div>
        </div>

        <div class="compliance-foot">
          These financial statements have been prepared in compliance with International Financial Reporting Standards (IFRS) as issued by the IASB and adopted by the Financial Reporting Council of Nigeria (FRCN), the Companies and Allied Matters Act (CAMA) 2020, and the Nigeria Finance Act.
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}
