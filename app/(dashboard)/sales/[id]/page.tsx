import Link from "next/link";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getSaleByIdAction } from "@/lib/actions/sales";

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const res = await getSaleByIdAction(params.id);
  if (!res.success || !res.sale) notFound();
  
  const sale = res.sale as any;

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/sales" className="btn-ghost btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">Sale Details</h1>
            <p className="page-subtitle">{sale.id} · {formatDate(sale.date)}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-outline btn-sm"><Printer size={15} /> Print Receipt</button>
          <button className="btn-outline btn-sm"><Download size={15} /> Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Main Details */}
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Transaction Breakdown</div></div>
          <div className="card-body">
            <div style={{ display: "flex", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "12px", background: "var(--color-surface-warm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "24px" }}>👞</span>
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)" }}>{sale.productName}</div>
                <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: 2 }}>Variant: {sale.color} · {sale.size}</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 4 }}>Quantity: <strong>{sale.quantity} pair(s)</strong></div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Unit Price</span>
                <span style={{ fontWeight: 600 }}>{formatNaira(sale.amount / sale.quantity)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatNaira(sale.amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Discount</span>
                <span style={{ fontWeight: 600 }}>₦0</span>
              </div>
              <div style={{ borderTop: "1px dashed var(--color-border)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>Total Paid</span>
                <span style={{ fontWeight: 800, fontSize: "20px", color: "var(--color-accent)" }}>{formatNaira(sale.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Payment Info</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>Method</div>
                <div style={{ fontWeight: 600 }}>{sale.paymentMethod}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>Status</div>
                <span className="badge-success">Paid in Full</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Customer Info</div></div>
            <div className="card-body">
              {sale.customerName ? (
                <div>
                  <div style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{sale.customerName}</div>
                  <Link href="/customers" style={{ fontSize: "13px", color: "var(--color-accent)", fontWeight: 600 }}>View Profile →</Link>
                </div>
              ) : (
                <div style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Walk-in Customer</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Business Insight</div></div>
            <div className="card-body">
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>Profit Generated</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-success)" }}>{formatNaira(sale.profit)}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: 4 }}>Margin: {Math.round((sale.profit / sale.amount) * 100)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
