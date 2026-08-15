// Utility helper functions for MLAZ platform

/**
 * Format a number as Nigerian Naira currency
 * Example: 2450000 → "₦2,450,000"
 */
export function formatNaira(amount?: number | null): string {
  const val = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return `₦${val.toLocaleString("en-NG")}`;
}

/**
 * Format a compact number (for large KPI values)
 * Example: 2450000 → "₦2.45M"
 */
export function formatNairaCompact(amount?: number | null): string {
  const val = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  if (val >= 1_000_000) {
    return `₦${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `₦${(val / 1_000).toFixed(1)}K`;
  }
  return formatNaira(val);
}

/**
 * Format a date to a readable string
 * Example: "2026-08-12" → "Aug 12, 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get relative time from now
 * Example: "2026-08-10" → "2 days ago"
 */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}

/**
 * Calculate profit
 */
export function calculateProfit(sellingPrice: number, costPrice: number, qty: number): number {
  return (sellingPrice - costPrice) * qty;
}

/**
 * Get stock status label and badge class
 */
export function getStockStatus(stock: number, reorderLevel: number): {
  label: "In Stock" | "Low Stock" | "Out of Stock";
  badgeClass: string;
} {
  if (stock === 0) return { label: "Out of Stock", badgeClass: "badge-error" };
  if (stock <= reorderLevel) return { label: "Low Stock", badgeClass: "badge-warning" };
  return { label: "In Stock", badgeClass: "badge-success" };
}

/**
 * Get order status badge class
 */
export function getOrderStatusClass(status: string): string {
  const map: Record<string, string> = {
    Pending:    "badge-warning",
    Confirmed:  "badge-accent",
    Processing: "badge-muted",
    Ready:      "badge-brand",
    Delivered:  "badge-success",
    Cancelled:  "badge-error",
  };
  return map[status] ?? "badge-muted";
}

/**
 * Truncate text
 */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

/**
 * Merge class names (simple version)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
