"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, X, Edit, Trash2, ArrowRightLeft, Landmark } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import {
  getExpensesAction,
  createExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
  reclassifyExpenseAsLoanRepaymentAction,
} from "@/lib/actions/expenses";

const expenseCategories = [
  "Transport",
  "Electricity",
  "Labour",
  "Materials",
  "Rent",
  "Marketing",
  "Maintenance",
  "Interest / Bank Charges",
  "Other",
];

function looksLikeLoanPayment(exp: any): boolean {
  const haystack = `${exp?.name || ""} ${exp?.description || ""} ${exp?.category || ""}`.toLowerCase();
  return (
    haystack.includes("loan") ||
    haystack.includes("repay") ||
    haystack.includes("boi") ||
    haystack.includes("borrowing")
  );
}

export default function ExpensesPage() {
  const [expenseList, setExpenseList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<string>("Operating");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const res = await getExpensesAction();
    if (res.success) setExpenseList(res.expenses);
  };

  const filtered = expenseList.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "All" || e.category === categoryFilter)
  );

  const totalFiltered = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedExpense(null);
    setSelectedType("Operating");
    setShowModal(true);
  };

  const handleOpenEdit = (exp: any) => {
    setModalMode("edit");
    setSelectedExpense(exp);
    setSelectedType(exp?.type || "Operating");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      const res = await deleteExpenseAction(id);
      if (res.success) loadExpenses();
      else alert(res.error || "Failed to delete expense");
    }
  };

  const handleMoveToLoanLedger = async (exp: any) => {
    if (
      !confirm(
        `Move "${exp.name}" (${formatNaira(exp.amount)}) from Expenses to Loan Principal Repayment (IAS 7 Financing & Balance Sheet Borrowings)?`
      )
    ) {
      return;
    }
    const res = await reclassifyExpenseAsLoanRepaymentAction(exp.id, "LONG_TERM_LOAN_REPAYMENT");
    if (res.success) {
      setStatusBanner(
        `Moved "${exp.name}" to Investments, Grants & Capital -> Loan Principal Repayment. It now reduces Borrowings on the Balance Sheet & shows in Cash Flows + Note 9.`
      );
      await loadExpenses();
    } else {
      alert(res.error || "Failed to reclassify expense");
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    let res: any;
    if (modalMode === "add") {
      res = await createExpenseAction(formData);
    } else {
      res = await updateExpenseAction(selectedExpense.id, formData);
    }

    if (res.success) {
      setShowModal(false);
      if (res.routedToLoanLedger) {
        setStatusBanner(
          "Loan Principal Repayment posted to Financial Statements (reduces Borrowings on Balance Sheet, Financing Cash Outflow & Note 9)."
        );
      } else {
        setStatusBanner(null);
      }
      loadExpenses();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            Track operational costs, factory overheads &amp; loan interest (Finance Cost)
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/capital-funding" className="btn-outline">
            <Landmark size={15} /> Loan Repayments &amp; Capital
          </Link>
          <button className="btn-accent" onClick={handleOpenAdd}>
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            borderLeft: "4px solid var(--color-success)",
            background: "var(--color-surface-warm)",
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>{statusBanner}</span>
          <Link href="/financial-statements" className="btn-outline btn-sm">
            View Statements
          </Link>
        </div>
      )}

      <div className="card" style={{ padding: "16px 20px", marginBottom: 24, display: "inline-block" }}>
        <div
          style={{
            fontSize: "12px",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Total Expenses (Filtered)
        </div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-error)" }}>
          {formatNaira(totalFiltered)}
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: "14px 16px",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input
            className="input"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {expenseCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Expense Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No expenses found.
                </td>
              </tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{exp.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        exp.type === "Factory Overhead"
                          ? "badge-warning"
                          : exp.type === "Finance Cost"
                          ? "badge-error"
                          : "badge-neutral"
                      }`}
                    >
                      {exp.type || "Operating"}
                    </span>
                  </td>
                  <td>
                    <span className="badge-muted">{exp.category}</span>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>
                    {exp.description || "—"}
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{formatNaira(exp.amount)}</td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(exp.date)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                      {looksLikeLoanPayment(exp) && exp.type !== "Finance Cost" && (
                        <button
                          className="btn-outline btn-sm"
                          style={{ fontSize: 11, padding: "4px 8px" }}
                          onClick={() => handleMoveToLoanLedger(exp)}
                          title="Move principal payment out of Operating Expenses into IAS 7 Loan Repayment ledger"
                        >
                          <ArrowRightLeft size={12} /> Move to Loan Repayment
                        </button>
                      )}
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(exp)} title="Edit Expense">
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => handleDelete(exp.id)}
                        title="Delete Expense"
                        style={{ color: "var(--color-error)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: 470, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>
                {modalMode === "add" ? "Record Expense" : "Edit Expense"}
              </h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitExpense} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Expense Title</label>
                <input
                  name="name"
                  className="input"
                  defaultValue={selectedExpense?.name || ""}
                  placeholder="Generator Fuel / BOI Loan Repayment"
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Type</label>
                  <select
                    name="type"
                    className="select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="Operating">Operating Expense</option>
                    <option value="Factory Overhead">Factory Overhead</option>
                    <option value="Finance Cost">Finance Cost (Loan Interest &mdash; P&amp;L)</option>
                    <option value="LONG_TERM_LOAN_REPAYMENT">
                      Loan Principal Repayment (Long-Term &mdash; Balance Sheet/Cash Flow)
                    </option>
                    <option value="SHORT_TERM_LOAN_REPAYMENT">
                      Loan Principal Repayment (Short-Term &mdash; Balance Sheet/Cash Flow)
                    </option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Category</label>
                  <select
                    name="category"
                    className="select"
                    defaultValue={selectedExpense?.category || "Other"}
                  >
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(selectedType === "LONG_TERM_LOAN_REPAYMENT" ||
                selectedType === "SHORT_TERM_LOAN_REPAYMENT") && (
                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: "var(--color-surface-warm)",
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <strong>IAS 7 Loan Principal Treatment:</strong> This will reduce your{" "}
                  {selectedType === "SHORT_TERM_LOAN_REPAYMENT" ? "Short-Term Borrowings" : "Long-Term Borrowings"} on
                  the Balance Sheet and appear under Financing Cash Outflows &amp; Note 9 (not as an operating expense).
                </div>
              )}
              <div>
                <label className="label">Amount (₦)</label>
                <input
                  name="amount"
                  className="input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={selectedExpense?.amount || ""}
                  placeholder="15000"
                  required
                />
              </div>
              <div>
                <label className="label">Description / Note</label>
                <input
                  name="description"
                  className="input"
                  defaultValue={selectedExpense?.description || ""}
                  placeholder="Purchased 20L diesel / Monthly installment"
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  name="date"
                  className="input"
                  type="date"
                  defaultValue={
                    selectedExpense?.date
                      ? new Date(selectedExpense.date).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
