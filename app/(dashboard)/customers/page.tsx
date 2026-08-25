"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Users, TrendingUp, Package, Edit, Trash2, X } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { getCustomersAction, getCustomerHistoryAction, deleteCustomerAction, updateCustomerAction } from "@/lib/actions/customers";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [history, setHistory] = useState<{ sales: any[], orders: any[] }>({ sales: [], orders: [] });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const res = await getCustomersAction();
    if (res.success) setCustomers(res.customers || []);
  };

  const handleViewHistory = async (customer: any) => {
    setSelectedCustomer(customer);
    setIsLoadingHistory(true);
    const res = await getCustomerHistoryAction(customer.name, customer.id);
    if (res.success) {
      setHistory({ sales: res.sales || [], orders: res.orders || [] });
    }
    setIsLoadingHistory(false);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer? All their associated data will be removed!")) return;
    const res = await deleteCustomerAction(id);
    if (res.success) {
      loadCustomers();
    } else {
      alert(res.error || "Failed to delete customer");
    }
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateCustomerAction(selectedCustomer.id, formData);
    if (res.success) {
      setShowEditModal(false);
      setSelectedCustomer(null);
      loadCustomers();
    } else {
      alert(res.error || "Failed to update customer");
    }
    setIsSubmitting(false);
  };

  const totalRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage client relationships and track purchase history</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--color-text-muted)" }}>
            <Users size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Total Customers</span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text-primary)" }}>{customers.length}</div>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--color-text-muted)" }}>
            <TrendingUp size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Total Customer Value</span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-success)" }}>{formatNaira(totalRevenue)}</div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search customers by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Total Spent</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No customers found.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{c.name}</td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
                    <div>{c.phone || "-"}</div>
                    <div>{c.email || "-"}</div>
                  </td>
                  <td><span className="badge-muted">{c.type || "Retail"}</span></td>
                  <td style={{ fontWeight: 700, color: "var(--color-accent)" }}>{formatNaira(c.totalSpent)}</td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(c.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-ghost btn-sm" onClick={() => handleViewHistory(c)} title="View History">
                        <Eye size={14} />
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => handleEditCustomer(c)} title="Edit Customer">
                        <Edit size={14} />
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => handleDeleteCustomer(c.id)} title="Delete Customer" style={{ color: "var(--color-error)" }}>
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

      {selectedCustomer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 700, maxHeight: "90vh", overflowY: "auto", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 20 }}>{selectedCustomer.name}</h3>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
                  {selectedCustomer.phone} {selectedCustomer.email ? ` | ${selectedCustomer.email}` : ""}
                </div>
                <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: "var(--color-accent)" }}>
                  Lifetime Value: {formatNaira(selectedCustomer.totalSpent)}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
            
            <hr style={{ borderColor: "var(--color-border)", marginBottom: 16 }} />
            
            {isLoadingHistory ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading purchase history...</div>
            ) : (
              <>
                <h4 style={{ fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Package size={16} /> Purchase History (Direct Sales)
                </h4>
                <div className="table-container" style={{ marginBottom: 24 }}>
                  <table className="table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.sales.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>No direct sales recorded.</td></tr>
                      ) : (
                        history.sales.map(s => (
                          <tr key={s.id}>
                            <td style={{ fontFamily: "monospace", color: "var(--color-accent)" }}>{s.id}</td>
                            <td>{s.productName} {s.size ? `(${s.size} ${s.color})` : ""}</td>
                            <td>{s.quantity}</td>
                            <td style={{ fontWeight: 600 }}>{formatNaira(s.amount)}</td>
                            <td>{formatDate(s.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingUp size={16} /> Pre-Orders
                </h4>
                <div className="table-container">
                  <table className="table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.orders.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)" }}>No orders recorded.</td></tr>
                      ) : (
                        history.orders.map(o => (
                          <tr key={o.id}>
                            <td style={{ fontFamily: "monospace", color: "var(--color-accent)" }}>{o.id}</td>
                            <td>{o.productName} {o.size ? `(${o.size} ${o.color})` : ""}</td>
                            <td>{o.quantity}</td>
                            <td><span className="badge-muted">{o.status}</span></td>
                            <td>{formatDate(o.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showEditModal && selectedCustomer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Edit Customer</h3>
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Full Name</label>
                <input name="name" className="input" defaultValue={selectedCustomer.name} required />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input name="phone" className="input" defaultValue={selectedCustomer.phone} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input name="email" type="email" className="input" defaultValue={selectedCustomer.email} />
              </div>
              <div>
                <label className="label">Customer Type</label>
                <select name="type" className="select" defaultValue={selectedCustomer.type || "Retail"}>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
