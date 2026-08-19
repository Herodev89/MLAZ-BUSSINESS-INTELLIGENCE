"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, X, Edit, Trash2 } from "lucide-react";
import { formatNaira, formatDate, getOrderStatusClass } from "@/lib/utils";
import { getOrdersAction, createOrderAction, updateOrderStatusAction, deleteOrderAction } from "@/lib/actions/orders";
import { getProductsAction } from "@/lib/actions/products";

export default function OrdersPage() {
  const [orderList, setOrderList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  const [orderForm, setOrderForm] = useState({
    customer: "",
    productId: "",
    productName: "",
    variantId: "",
    size: "",
    color: "",
    qty: 1,
    amount: 0,
    status: "Pending",
    paymentMethod: "Transfer"
  });

  const flatVariants = products.flatMap(p => 
    (p.variants || []).map((v: any) => ({
      ...v,
      productName: p.name,
      displayName: `${p.name} - ${v.size} ${v.color}`.trim()
    }))
  );

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    const res = await getOrdersAction();
    if (res.success) setOrderList(res.orders);
  };

  const loadProducts = async () => {
    const res = await getProductsAction();
    if (res.success && res.products) {
      const prods = res.products as any[];
      setProducts(prods);
      
      const flat = prods.flatMap(p => 
        (p.variants || []).map((v: any) => ({
          ...v,
          productName: p.name
        }))
      );
      
      if (flat.length > 0) {
        setOrderForm(prev => ({
          ...prev,
          productId: flat[0].productId,
          productName: flat[0].productName,
          variantId: flat[0].id,
          size: flat[0].size,
          color: flat[0].color,
          amount: flat[0].price * prev.qty
        }));
      }
    }
  };

  const filtered = orderList.filter(o => {
    const matchSearch = (o.id?.toLowerCase() || "").includes(search.toLowerCase()) || (o.customer?.toLowerCase() || "").includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("customer", orderForm.customer);
    formData.append("productName", orderForm.productName);
    formData.append("variantId", orderForm.variantId);
    formData.append("size", orderForm.size);
    formData.append("color", orderForm.color);
    formData.append("qty", orderForm.qty.toString());
    formData.append("amount", orderForm.amount.toString());
    formData.append("status", orderForm.status);
    formData.append("paymentMethod", orderForm.paymentMethod);

    const res = await createOrderAction(formData);
    
    if (res.success) {
      setShowCreateModal(false);
      loadOrders();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVariantId = e.target.value;
    const variant = flatVariants.find(v => v.id === selectedVariantId);
    if (variant) {
      setOrderForm(prev => ({
        ...prev,
        productId: variant.productId,
        productName: variant.productName,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        amount: variant.price * prev.qty
      }));
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 1;
    const variant = flatVariants.find(v => v.id === orderForm.variantId);
    const price = variant ? variant.price : 0;
    setOrderForm(prev => ({
      ...prev,
      qty,
      amount: price * qty
    }));
  };

  const handleOpenEdit = (order: any) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateOrderStatusAction(selectedOrder.id, formData);
    if (res.success) {
      setShowEditModal(false);
      loadOrders();
    } else {
      alert(res.error || "Failed to update order");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      const res = await deleteOrderAction(id);
      if (res.success) loadOrders();
      else alert(res.error || "Failed to delete order");
    }
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
                  <td style={{ color: "var(--color-text-secondary)" }}>1 item(s)</td>
                  <td style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{formatNaira(o.totalAmount)}</td>
                  <td>
                    <span className={`badge ${o.paymentStatus === "Paid" ? "badge-success" : o.paymentStatus === "Partial" ? "badge-warning" : "badge-error"}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td><span className={getOrderStatusClass(o.orderStatus)}>{o.orderStatus}</span></td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(o.date)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-ghost btn-sm" onClick={() => setSelectedOrder(o)} title="View Details"><Eye size={14} /></button>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(o)} title="Edit Status"><Edit size={14} /></button>
                      <button className="btn-ghost btn-sm" onClick={() => handleDelete(o.id)} title="Delete Order" style={{ color: "var(--color-error)" }}><Trash2 size={14} /></button>
                    </div>
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
                <li>{selectedOrder.productName} ({selectedOrder.size} {selectedOrder.color}) x {selectedOrder.quantity} - {formatNaira(selectedOrder.totalAmount)}</li>
              </ul>
              <div style={{ fontSize: 16, fontWeight: 700, textAlign: "right", marginTop: 8 }}>Total: {formatNaira(selectedOrder.totalAmount)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn-accent" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Update Order Status</h3>
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Status</label>
                <select name="status" className="input" defaultValue={selectedOrder.orderStatus}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
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
                <input name="customer" className="input" placeholder="John Doe" value={orderForm.customer} onChange={(e) => setOrderForm({...orderForm, customer: e.target.value})} required />
              </div>
              <div>
                <label className="label">Product & Variant</label>
                <select name="product" className="select" value={orderForm.variantId} onChange={handleProductChange} required>
                  {flatVariants.map(v => (
                    <option key={v.id} value={v.id}>{v.displayName} - {formatNaira(v.price)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Quantity</label>
                  <input name="qty" className="input" type="number" min="1" value={orderForm.qty} onChange={handleQtyChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Total Amount (₦)</label>
                  <input name="amount" className="input" type="number" value={orderForm.amount} readOnly style={{ background: "var(--color-surface-muted)", cursor: "not-allowed" }} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Status</label>
                  <select name="status" className="select" value={orderForm.status} onChange={(e) => setOrderForm({...orderForm, status: e.target.value})}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Payment Method</label>
                  <select name="paymentMethod" className="select" value={orderForm.paymentMethod} onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}>
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
