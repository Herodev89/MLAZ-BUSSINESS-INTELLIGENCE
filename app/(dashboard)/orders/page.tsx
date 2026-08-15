"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, X } from "lucide-react";
import { formatNaira, formatDate, getOrderStatusClass } from "@/lib/utils";
import { getOrdersAction, createOrderAction } from "@/lib/actions/orders";

export default function OrdersPage() {
  const [orderList, setOrderList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await getOrdersAction();
    if (res.success) setOrderList(res.orders);
  };

  const filtered = orderList.filter(o => {
    const matchSearch = (o.id?.toLowerCase() || "").includes(search.toLowerCase()) || (o.customer?.toLowerCase() || "").includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createOrderAction(formData);
    
    if (res.success) {
      setShowCreateModal(false);
      loadOrders();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Track and manage customer orders</p>
        </div>
        <button className="btn-accent" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search by Order ID or Customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Ready">Ready</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No orders found.</td></tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td><span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", fontFamily: "monospace" }}>{o.id}</span></td>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{o.customer}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{o.items.length} item(s)</td>
                  <td style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{formatNaira(o.totalAmount)}</td>
                  <td>
                    <span className={`badge ${o.paymentStatus === "Paid" ? "badge-success" : o.paymentStatus === "Partial" ? "badge-warning" : "badge-error"}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td><span className={getOrderStatusClass(o.orderStatus)}>{o.orderStatus}</span></td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(o.date)}</td>
                  <td>
                    <button className="btn-ghost btn-sm" onClick={() => setSelectedOrder(o)} title="View Details"><Eye size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 500, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Order Details</h3>
                <span style={{ fontSize: 13, color: "var(--color-accent)", fontFamily: "monospace" }}>{selectedOrder.id}</span>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><strong>Customer:</strong> {selectedOrder.customer} ({selectedOrder.phone})</div>
              <div><strong>Status:</strong> <span className={getOrderStatusClass(selectedOrder.orderStatus)}>{selectedOrder.orderStatus}</span></div>
              <div><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</div>
              <hr style={{ borderColor: "var(--color-border)", margin: "8px 0" }} />
              <div><strong>Items Purchased:</strong></div>
              <ul style={{ paddingLeft: 20 }}>
                {selectedOrder.items.map((it, idx) => (
                  <li key={idx}>{it.productName} ({it.variantName}) x {it.quantity} - {formatNaira(it.unitPrice * it.quantity)}</li>
                ))}
              </ul>
              <div style={{ fontSize: 16, fontWeight: 700, textAlign: "right", marginTop: 8 }}>Total: {formatNaira(selectedOrder.totalAmount)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn-accent" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Create New Order</h3>
              <button className="btn-ghost" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Customer Name</label>
                <input name="customer" className="input" placeholder="John Doe" required />
              </div>
              <div>
                <label className="label">Total Amount (₦)</label>
                <input name="amount" className="input" type="number" placeholder="12500" required />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Status</label>
                  <select name="status" className="select" defaultValue="Pending">
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Payment Method</label>
                  <select name="paymentMethod" className="select" defaultValue="Transfer">
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Order"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
