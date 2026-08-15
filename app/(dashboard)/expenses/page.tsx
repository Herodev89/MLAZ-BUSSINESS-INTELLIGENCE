"use client";

import { useState, useEffect } from "react";
import { Plus, Search, X } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { getExpensesAction, createExpenseAction } from "@/lib/actions/expenses";

const expenseCategories = ["Transport", "Electricity", "Labour", "Materials", "Rent", "Marketing", "Maintenance", "Other"];

export default function ExpensesPage() {
  const [expenseList, setExpenseList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const res = await getExpensesAction();
    if (res.success) setExpenseList(res.expenses);
  };

  const filtered = expenseList.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === "All" || e.category === categoryFilter)
  );

  const totalFiltered = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createExpenseAction(formData);
    
    if (res.success) {
      setShowModal(false);
      loadExpenses();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track operational costs and expenditures</p>
        </div>
        <button className="btn-accent" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Record Expense
        </button>
      </div>

      <div className="card" style={{ padding: "16px 20px", marginBottom: 24, display: "inline-block" }}>
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Total Expenses (Filtered)</div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-error)" }}>{formatNaira(totalFiltered)}</div>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "All")}>
          <option value="All">All Categories</option>
          {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Expense Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No expenses found.</td></tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{exp.name}</td>
                  <td><span className="badge-muted">{exp.category}</span></td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>{exp.description || "—"}</td>
                  <td style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{formatNaira(exp.amount)}</td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(exp.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Record Expense</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Expense Title</label>
                <input name="name" className="input" placeholder="Generator Fuel" required />
              </div>
              <div>
                <label className="label">Category</label>
                <select name="category" className="select" defaultValue="Other">
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (₦)</label>
                <input name="amount" className="input" type="number" placeholder="15000" required />
              </div>
              <div>
                <label className="label">Description / Note</label>
                <input name="description" className="input" placeholder="Purchased 20L diesel" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Expense"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
