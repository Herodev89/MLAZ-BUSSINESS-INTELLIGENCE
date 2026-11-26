"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, X, Edit, Trash2, Banknote, Store, Boxes } from "lucide-react";
import { formatNaira, formatDate, getOrderStatusClass } from "@/lib/utils";
import {
  getOrdersAction,
  createOrderAction,
  updateOrderStatusAction,
  updateOrderPaymentAction,
  deleteOrderAction,
} from "@/lib/actions/orders";
import { getProductsAction } from "@/lib/actions/products";
import { getCustomersAction } from "@/lib/actions/customers";

export default function OrdersPage() {
  const [orderList, setOrderList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"All" | "Retail" | "Wholesale">("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositInput, setDepositInput] = useState(0);
  const [depositMethod, setDepositMethod] = useState("Transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const [orderForm, setOrderForm] = useState({
    orderType: "Wholesale" as "Retail" | "Wholesale",
    customer: "",
    productId: "",
    productName: "",
    variantId: "",
    size: "",
    color: "",
    qty: 6,
    unitPrice: 0,
    discount: 0,
    applyVat: false,
    paymentStatus: "Partial" as "Unpaid" | "Partial" | "Paid",
    amountPaid: 0,
    status: "Pending",
    paymentMethod: "Transfer",
    date: "",
    dueDate: "",
    notes: "",
  });

  const flatVariants = products
    .filter((p) => p.status !== "Inactive")
    .flatMap((p) =>
      (p.variants || []).map((v: any) => ({
        ...v,
        productName: p.name,
        wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
        displayName: `${p.name} - ${v.size} ${v.color}`.trim(),
      }))
    );

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    const res = await getCustomersAction();
    if (res.success && res.customers) setCustomers(res.customers);
  };

  const loadOrders = async () => {
    const res = await getOrdersAction();
    if (res.success) setOrderList(res.orders);
  };

  const loadProducts = async () => {
    const res = await getProductsAction();
    if (res.success && res.products) {
      const prods = res.products as any[];
      setProducts(prods);

      const flat = prods
        .filter((p) => p.status !== "Inactive")
        .flatMap((p) =>
          (p.variants || []).map((v: any) => ({
            ...v,
            productName: p.name,
            wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
          }))
        );

      if (flat.length > 0) {
        const first = flat[0];
        const wPrice = Number(first.wholesalePrice) > 0 ? Number(first.wholesalePrice) : Number(first.price) || 0;
        const moq = Math.max(1, Number(first.wholesaleMinQty ?? 6));
        setOrderForm((prev) => ({
          ...prev,
          productId: first.productId,
          productName: first.productName,
          variantId: first.id,
          size: first.size,
          color: first.color,
          qty: prev.orderType === "Wholesale" ? moq : 1,
          unitPrice: prev.orderType === "Wholesale" ? wPrice : Number(first.price) || 0,
        }));
      }
    }
  };

  const filtered = orderList.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      (o.id?.toLowerCase() || "").includes(q) ||
      (o.customer?.toLowerCase() || "").includes(q) ||
      (o.productName?.toLowerCase() || "").includes(q);
    const matchChannel = channelFilter === "All" || (o.orderType || "Retail") === channelFilter;
    const matchStatus = statusFilter === "All" || o.orderStatus === statusFilter;
    return matchSearch && matchChannel && matchStatus;
  });

  const selectedVariantObj = flatVariants.find((v) => v.id === orderForm.variantId);
  const grossAmount = Math.max(0, (Number(orderForm.qty) || 1) * (Number(orderForm.unitPrice) || 0));
  const netAmount = Math.max(0, grossAmount - (Number(orderForm.discount) || 0));
  const vatAmount = orderForm.applyVat ? Math.round(netAmount * 0.075 * 100) / 100 : 0;
  const totalInvoice = Math.round((netAmount + vatAmount) * 100) / 100;
  const effectivePaid =
    orderForm.paymentStatus === "Paid"
      ? totalInvoice
      : orderForm.paymentStatus === "Unpaid"
      ? 0
      : Math.min(totalInvoice, Math.max(0, Number(orderForm.amountPaid) || 0));

  const handleOrderTypeSwitch = (type: "Retail" | "Wholesale") => {
    const unitPrice = selectedVariantObj
      ? type === "Wholesale" && Number(selectedVariantObj.wholesalePrice) > 0
        ? Number(selectedVariantObj.wholesalePrice)
        : Number(selectedVariantObj.price) || 0
      : orderForm.unitPrice;
    const nextQty =
      type === "Wholesale" && selectedVariantObj
        ? Math.max(orderForm.qty, Number(selectedVariantObj.wholesaleMinQty ?? 6))
        : orderForm.qty;

    setOrderForm((prev) => ({
      ...prev,
      orderType: type,
      unitPrice,
      qty: nextQty,
    }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVariantId = e.target.value;
    const variant = flatVariants.find((v) => v.id === selectedVariantId);
    if (variant) {
      const unitPrice =
        orderForm.orderType === "Wholesale" && Number(variant.wholesalePrice) > 0
          ? Number(variant.wholesalePrice)
          : Number(variant.price) || 0;
      const nextQty =
        orderForm.orderType === "Wholesale" ? Math.max(1, Number(variant.wholesaleMinQty ?? 6)) : 1;
      setOrderForm((prev) => ({
        ...prev,
        productId: variant.productId,
        productName: variant.productName,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        unitPrice,
        qty: nextQty,
      }));
    }
  };

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("orderType", orderForm.orderType);
    formData.append("customer", orderForm.customer);
    formData.append("productName", orderForm.productName);
    formData.append("variantId", orderForm.variantId);
    formData.append("size", orderForm.size);
    formData.append("color", orderForm.color);
    formData.append("qty", String(orderForm.qty));
    formData.append("amount", String(grossAmount));
    formData.append("discount", String(Number(orderForm.discount) || 0));
    formData.append("vatAmount", String(vatAmount));
    formData.append("paymentStatus", orderForm.paymentStatus);
    formData.append("amountPaid", String(effectivePaid));
    formData.append("status", orderForm.status);
    formData.append("paymentMethod", orderForm.paymentMethod);
    if (orderForm.date) formData.append("date", orderForm.date);
    if (orderForm.dueDate) formData.append("dueDate", orderForm.dueDate);
    if (orderForm.notes) formData.append("notes", orderForm.notes);

    const res = await createOrderAction(formData);

    if (res.success) {
      setShowCreateModal(false);
      loadOrders();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
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
      setSelectedOrder(null);
      loadOrders();
    } else {
      alert(res.error || "Failed to update order");
    }
    setIsSubmitting(false);
  };

  const handleOpenDeposit = (order: any) => {
    setSelectedOrder(order);
    setDepositInput(Number(order.balanceDue) || 0);
    setDepositMethod(order.paymentMethod || "Transfer");
    setShowDepositModal(true);
  };

  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);
    const res = await updateOrderPaymentAction(selectedOrder.id, depositInput, depositMethod);
    setIsSubmitting(false);
    if (res.success) {
      setShowDepositModal(false);
      setSelectedOrder(null);
      loadOrders();
    } else {
      alert(res.error || "Failed to record order payment");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      const res = await deleteOrderAction(id);
      if (res.success) loadOrders();
      else alert(res.error || "Failed to delete order");
    }
  };

  const wholesaleOrdersTotal = orderList
    .filter((o) => o.orderType === "Wholesale" && o.orderStatus !== "Cancelled")
    .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
  const retailOrdersTotal = orderList
    .filter((o) => (o.orderType || "Retail") === "Retail" && o.orderStatus !== "Cancelled")
    .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
  const contractLiabilitiesDeposits = orderList
    .filter((o) => o.orderStatus !== "Cancelled" && o.orderStatus !== "Confirmed" && o.orderStatus !== "Delivered")
    .reduce((sum: number, o: any) => sum + (Number(o.amountPaid) || 0), 0);
  const fulfilledCount = orderList.filter((o) => o.orderStatus === "Confirmed" || o.orderStatus === "Delivered").length;

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Wholesale &amp; Retail Orders</h1>
          <p className="page-subtitle">Manage pre-orders, bulk wholesale bookings, advance deposits (IFRS 15.105), and fulfillment</p>
        </div>
        <button className="btn-accent" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Create Wholesale / Retail Order
        </button>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 18 }}>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Wholesale Orders Value</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-accent)", marginTop: 4 }}>{formatNaira(wholesaleOrdersTotal)}</div>
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Retail Orders Value</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-brand)", marginTop: 4 }}>{formatNaira(retailOrdersTotal)}</div>
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Contract Liabilities (IFRS 15.105)</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-warning)", marginTop: 4 }}>{formatNaira(contractLiabilitiesDeposits)}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Advance deposits on open orders</div>
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Fulfilled &amp; Converted to Sales</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-success)", marginTop: 4 }}>{fulfilledCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search by Order ID, Customer, or Product..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: "auto" }} value={channelFilter} onChange={(e) => setChannelFilter(e.target.value as any)}>
          <option value="All">All Channels</option>
          <option value="Wholesale">Wholesale Orders</option>
          <option value="Retail">Retail Orders</option>
        </select>
        <select className="select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              <th>Channel</th>
              <th>Customer</th>
              <th>Product &amp; Qty</th>
              <th>Total Invoice</th>
              <th>Deposit / Balance</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", fontFamily: "monospace" }}>{o.id}</span>
                  </td>
                  <td>
                    <span className={o.orderType === "Wholesale" ? "badge-accent" : "badge-muted"}>
                      {o.orderType || "Retail"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{o.customer}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>
                    <div style={{ fontWeight: 600 }}>{o.productName}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                      {o.quantity} pcs ({o.size} {o.color})
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                    <div>{formatNaira(o.totalInvoice ?? o.totalAmount)}</div>
                    {o.vatAmount > 0 && (
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Incl. VAT {formatNaira(o.vatAmount)}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-success)" }}>
                      Paid: {formatNaira(o.amountPaid)}
                    </div>
                    {o.balanceDue > 0 && (
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-warning)" }}>
                        Bal: {formatNaira(o.balanceDue)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        o.paymentStatus === "Paid"
                          ? "badge-success"
                          : o.paymentStatus === "Partial"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={getOrderStatusClass(o.orderStatus)}>{o.orderStatus}</span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(o.date)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {o.balanceDue > 0 && (
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => handleOpenDeposit(o)}
                          title="Record Advance Deposit / Payment"
                          style={{ color: "var(--color-success)" }}
                        >
                          <Banknote size={14} />
                        </button>
                      )}
                      <button className="btn-ghost btn-sm" onClick={() => setSelectedOrder(o)} title="View Details">
                        <Eye size={14} />
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(o)} title="Update Status / Fulfill">
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => handleDelete(o.id)}
                        title="Delete Order"
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

      {/* View Order Modal */}
      {selectedOrder && !showEditModal && !showDepositModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 500, maxWidth: "100%", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>{selectedOrder.orderType || "Retail"} Order Details</h3>
                <span style={{ fontSize: 13, color: "var(--color-accent)", fontFamily: "monospace" }}>{selectedOrder.id}</span>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
              <div><strong>Channel:</strong> <span className={selectedOrder.orderType === "Wholesale" ? "badge-accent" : "badge-muted"}>{selectedOrder.orderType || "Retail"}</span></div>
              <div><strong>Customer:</strong> {selectedOrder.customer} {selectedOrder.phone ? `(${selectedOrder.phone})` : ""}</div>
              <div><strong>Order Status:</strong> <span className={getOrderStatusClass(selectedOrder.orderStatus)}>{selectedOrder.orderStatus}</span></div>
              <div><strong>Payment Status:</strong> {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})</div>
              {selectedOrder.dueDate && <div><strong>Target Delivery / Due Date:</strong> {formatDate(selectedOrder.dueDate)}</div>}
              <hr style={{ borderColor: "var(--color-border)", margin: "6px 0" }} />
              <div><strong>Items Ordered:</strong></div>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>
                  {selectedOrder.productName} ({selectedOrder.size} {selectedOrder.color}) × {selectedOrder.quantity} pcs — Net: {formatNaira(selectedOrder.totalAmount)}
                </li>
              </ul>
              {selectedOrder.discount > 0 && <div><strong>Trade Discount:</strong> {formatNaira(selectedOrder.discount)}</div>}
              {selectedOrder.vatAmount > 0 && <div><strong>Output VAT (7.5%):</strong> {formatNaira(selectedOrder.vatAmount)}</div>}
              <div><strong>Total Invoice:</strong> <strong>{formatNaira(selectedOrder.totalInvoice ?? selectedOrder.totalAmount)}</strong></div>
              <div><strong>Advance Deposit / Paid:</strong> <span style={{ color: "var(--color-success)", fontWeight: 700 }}>{formatNaira(selectedOrder.amountPaid)}</span></div>
              {selectedOrder.balanceDue > 0 && (
                <div><strong>Remaining Balance:</strong> <span style={{ color: "var(--color-warning)", fontWeight: 700 }}>{formatNaira(selectedOrder.balanceDue)}</span></div>
              )}
              {selectedOrder.notes && <div><strong>Notes:</strong> {selectedOrder.notes}</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              {selectedOrder.balanceDue > 0 && (
                <button className="btn-outline" onClick={() => setShowDepositModal(true)}>
                  <Banknote size={15} /> Record Payment
                </button>
              )}
              <button className="btn-accent" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Advance Deposit / Payment Modal */}
      {showDepositModal && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 420, maxWidth: "100%", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Record Order Advance / Payment</h3>
              <button className="btn-ghost" onClick={() => setShowDepositModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 14 }}>
              {selectedOrder.orderStatus !== "Confirmed" && selectedOrder.orderStatus !== "Delivered"
                ? "IFRS 15.105: Cash received before order fulfillment is held under Contract Liabilities (Customer Advance Deposits) until Confirmed/Delivered."
                : "Reduces Trade Receivables on the converted Sale."}
            </p>
            <form onSubmit={handleSaveDeposit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Payment Received Now (₦) (Max: {formatNaira(selectedOrder.balanceDue)})</label>
                <input
                  type="number"
                  min="0.01"
                  max={selectedOrder.balanceDue}
                  step="0.01"
                  className="input"
                  value={depositInput}
                  onChange={(e) => setDepositInput(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select className="select" value={depositMethod} onChange={(e) => setDepositMethod(e.target.value)}>
                  <option value="Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="POS">POS</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn-outline" onClick={() => setShowDepositModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Record Deposit / Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Order Status Modal */}
      {showEditModal && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 420, maxWidth: "100%", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Update Order Status</h3>
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12 }}>
              Changing status to <strong>Confirmed</strong> or <strong>Delivered</strong> transfers control under{" "}
              <strong>IFRS 15.31</strong>, recognizes revenue &amp; COGS, deducts inventory, and moves any unpaid balance
              to Trade Receivables.
            </p>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Status</label>
                <select name="status" className="select" defaultValue={selectedOrder.orderStatus}>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing (In Production)</option>
                  <option value="Ready">Ready for Dispatch</option>
                  <option value="Confirmed">Confirmed (Recognize Sale)</option>
                  <option value="Delivered">Delivered (Recognize Sale)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Wholesale / Retail Order Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 560, maxWidth: "100%", maxHeight: "92vh", overflowY: "auto", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Create Wholesale / Retail Order</h3>
              <button className="btn-ghost" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleOrderTypeSwitch("Wholesale")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: orderForm.orderType === "Wholesale" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                    background: orderForm.orderType === "Wholesale" ? "var(--color-surface-warm)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <Boxes size={16} /> Wholesale Order
                </button>
                <button
                  type="button"
                  onClick={() => handleOrderTypeSwitch("Retail")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: orderForm.orderType === "Retail" ? "2px solid var(--color-brand)" : "1px solid var(--color-border)",
                    background: orderForm.orderType === "Retail" ? "var(--color-surface-warm)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <Store size={16} /> Retail Order
                </button>
              </div>

              <div>
                <label className="label">Customer / Wholesale Account Name</label>
                <input
                  name="customer"
                  list="order-customers-list"
                  className="input"
                  placeholder="Distributor / Boutique / Customer Name"
                  value={orderForm.customer}
                  onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
                  required
                />
                <datalist id="order-customers-list">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="label">Product &amp; Variant</label>
                <select name="product" className="select" value={orderForm.variantId} onChange={handleProductChange} required>
                  {flatVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.displayName} — Retail: {formatNaira(v.price)}
                      {Number(v.wholesalePrice) > 0 ? ` | Wholesale: ${formatNaira(v.wholesalePrice)}` : ""} ({v.stock} in stock)
                    </option>
                  ))}
                </select>
                {selectedVariantObj && orderForm.orderType === "Wholesale" && (
                  <div style={{ fontSize: 11.5, color: "var(--color-accent)", marginTop: 4 }}>
                    Wholesale MOQ: {selectedVariantObj.wholesaleMinQty ?? 6} pairs
                    {Number(selectedVariantObj.wholesalePrice) <= 0 ? " • Wholesale rate not set (using Retail price)" : ""}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    name="qty"
                    className="input"
                    type="number"
                    min="1"
                    value={orderForm.qty}
                    onChange={(e) => setOrderForm({ ...orderForm, qty: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    required
                  />
                </div>
                <div>
                  <label className="label">{orderForm.orderType} Unit Price (₦)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={orderForm.unitPrice}
                    onChange={(e) => setOrderForm({ ...orderForm, unitPrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Trade Discount (₦)</label>
                  <input
                    name="discount"
                    className="input"
                    type="number"
                    min="0"
                    value={orderForm.discount}
                    onChange={(e) => setOrderForm({ ...orderForm, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={orderForm.applyVat}
                  onChange={(e) => setOrderForm({ ...orderForm, applyVat: e.target.checked })}
                />
                Apply 7.5% FIRS Output VAT (deferred until order delivery/sale conversion)
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label className="label">Order Status</label>
                  <select
                    name="status"
                    className="select"
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready">Ready</option>
                    <option value="Confirmed">Confirmed (Immediate Sale)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Deposit / Payment</label>
                  <select
                    className="select"
                    value={orderForm.paymentStatus}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentStatus: e.target.value as any })}
                  >
                    <option value="Unpaid">Unpaid / Pay Later</option>
                    <option value="Partial">Advance Deposit</option>
                    <option value="Paid">Paid in Full</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    className="select"
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                  >
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>

              {orderForm.paymentStatus === "Partial" && (
                <div>
                  <label className="label">Advance Deposit Paid Now (₦) (IFRS 15.105 Contract Liability)</label>
                  <input
                    type="number"
                    min="0"
                    max={totalInvoice}
                    step="0.01"
                    className="input"
                    value={orderForm.amountPaid}
                    onChange={(e) => setOrderForm({ ...orderForm, amountPaid: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="label">Order Date</label>
                  <input
                    name="date"
                    className="input"
                    type="date"
                    value={orderForm.date}
                    onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Expected Delivery / Due Date</label>
                  <input
                    className="input"
                    type="date"
                    value={orderForm.dueDate}
                    onChange={(e) => setOrderForm({ ...orderForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Order Notes / Delivery Instructions</label>
                <input
                  className="input"
                  placeholder="Optional size breakdown, batch notes, or credit terms..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                />
              </div>

              <div style={{ background: "var(--color-surface-warm)", padding: "10px 14px", borderRadius: 8, fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Net Order Value:</span>
                  <strong>{formatNaira(netAmount)}</strong>
                </div>
                {vatAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Output VAT (7.5%):</span>
                    <strong>{formatNaira(vatAmount)}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 4 }}>
                  <span>Total Order Invoice:</span>
                  <strong style={{ color: "var(--color-accent)" }}>{formatNaira(totalInvoice)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 2 }}>
                  <span>Deposit Now: {formatNaira(effectivePaid)}</span>
                  <span>Balance: {formatNaira(Math.max(0, totalInvoice - effectivePaid))}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : `Save ${orderForm.orderType} Order`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
