"use client";

import { useState, useEffect } from "react";
import { Plus, Search, X, Edit, Trash2 } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { getExpensesAction, createExpenseAction, deleteExpenseAction, updateExpenseAction } from "@/lib/actions/expenses";

const expenseCategories = ["Transport", "Electricity", "Labour", "Materials", "Rent", "Marketing", "Maintenance", "Other"];

export default function ExpensesPage() {
  const [expenseList, setExpenseList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
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

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedExpense(null);
    setShowModal(true);
  };

  const handleOpenEdit = (exp: any) => {
    setModalMode("edit");
    setSelectedExpense(exp);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      const res = await deleteExpenseAction(id);
      if (res.success) loadExpenses();
      else alert(res.error || "Failed to delete expense");
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (modalMode === "add") {
      res = await createExpenseAction(formData);
    } else {
      res = await updateExpenseAction(selectedExpense.id, formData);
    }
    
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
        <button className="btn-accent" onClick={handleOpenAdd}>
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
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
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
              <th></th>
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
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(exp)} title="Edit Expense"><Edit size={14} /></button>
                      <button className="btn-ghost btn-sm" onClick={() => handleDelete(exp.id)} title="Delete Expense" style={{ color: "var(--color-error)" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
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
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{modalMode === "add" ? "Record Expense" : "Edit Expense"}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitExpense} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Expense Title</label>
                <input name="name" className="input" defaultValue={selectedExpense?.name || ""} placeholder="Generator Fuel" required />
              </div>
              <div>
                <label className="label">Category</label>
                <select name="category" className="select" defaultValue={selectedExpense?.category || "Other"}>
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (₦)</label>
                <input name="amount" className="input" type="number" defaultValue={selectedExpense?.amount || ""} placeholder="15000" required />
              </div>
              <div>
                <label className="label">Description / Note</label>
                <input name="description" className="input" defaultValue={selectedExpense?.description || ""} placeholder="Purchased 20L diesel" />
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
