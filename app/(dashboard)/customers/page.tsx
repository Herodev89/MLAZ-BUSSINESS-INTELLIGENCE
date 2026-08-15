"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, X } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { getCustomersAction, createCustomerAction, updateCustomerAction, deleteCustomerAction } from "@/lib/actions/customers";

export default function CustomersPage() {
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const res = await getCustomersAction();
    if (res.success) setCustomerList(res.customers);
  };

  const filtered = customerList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setModalType("add");
  };

  const handleOpenEdit = (c: any) => {
    setSelectedCustomer(c);
    setModalType("edit");
  };

  const handleOpenView = (c: any) => {
    setSelectedCustomer(c);
    setModalType("view");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const res = await deleteCustomerAction(id);
      if (res.success) loadCustomers();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    if (modalType === "add") {
      const res = await createCustomerAction(formData);
      if (res.success) {
        setModalType(null);
        loadCustomers();
      } else alert(res.error);
    } else if (modalType === "edit" && selectedCustomer) {
      const res = await updateCustomerAction(selectedCustomer.id, formData);
      if (res.success) {
        setModalType(null);
        loadCustomers();
      } else alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer relationships</p>
        </div>
        <button className="btn-accent" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Total Customers</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-brand)" }}>{customerList.length}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>New This Month</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-success)" }}>12</div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search by name, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Purchases</th>
              <th>Total Spent</th>
              <th>Last Purchase</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No customers found.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-surface-warm)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                        {c.name.charAt(0)}
                      </div>
                      {c.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>{c.phone}</div>
                    {c.email && <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{c.email}</div>}
                  </td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>{c.type || "Retail"}</td>
                  <td style={{ fontWeight: 600 }}>{c.totalSpent > 0 ? "Yes" : "0"}</td>
                  <td style={{ fontWeight: 700, color: "var(--color-accent)" }}>{formatNaira(c.totalSpent || 0)}</td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(c.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenView(c)} title="View Profile"><Eye size={14} /></button>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(c)} title="Edit"><Edit size={14} /></button>
                      <button className="btn-ghost btn-sm text-error" onClick={() => handleDelete(c.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalType && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>
                {modalType === "add" && "Add New Customer"}
                {modalType === "edit" && "Edit Customer"}
                {modalType === "view" && "Customer Profile"}
              </h3>
              <button className="btn-ghost" onClick={() => setModalType(null)}><X size={18} /></button>
            </div>

            {modalType === "view" && selectedCustomer ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Name: </span><strong style={{ display: "block", fontSize: 16 }}>{selectedCustomer.name}</strong></div>
                <div><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Phone: </span><div>{selectedCustomer.phone}</div></div>
                <div><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Email: </span><div>{selectedCustomer.email || "N/A"}</div></div>
                <div><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Type: </span><div>{selectedCustomer.type || "Retail"}</div></div>
                <div><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Total Spent: </span><div>{formatNaira(selectedCustomer.totalSpent || 0)}</div></div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <button className="btn-accent" onClick={() => setModalType(null)}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Customer Name</label>
                  <input name="name" className="input" defaultValue={modalType === "edit" ? selectedCustomer?.name : ""} placeholder="Full Name" required />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input name="phone" className="input" defaultValue={modalType === "edit" ? selectedCustomer?.phone : ""} placeholder="+234..." required />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input name="email" className="input" type="email" defaultValue={modalType === "edit" ? selectedCustomer?.email : ""} placeholder="customer@example.com" />
                </div>
                <div>
                  <label className="label">Customer Type</label>
                  <select name="type" className="select" defaultValue={modalType === "edit" ? selectedCustomer?.type : "Retail"}>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-outline" onClick={() => setModalType(null)}>Cancel</button>
                  <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Customer"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
