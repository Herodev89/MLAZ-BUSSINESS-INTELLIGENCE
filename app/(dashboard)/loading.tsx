"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      color: "var(--color-text-muted)"
    }}>
      <Loader2 size={40} className="spinner" style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
      <div style={{ fontSize: "14px", fontWeight: 500 }}>Loading data...</div>
    </div>
  );
}
