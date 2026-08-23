"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMonth = searchParams.get("month") || "";
  const [month, setMonth] = useState(initialMonth);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (newMonth) {
      current.set("month", newMonth);
    } else {
      current.delete("month");
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/dashboard${query}`);
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label className="label" style={{ marginBottom: 4, display: "block", fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Filter Dashboard</label>
      <input 
        type="month" 
        className="input" 
        value={month} 
        onChange={handleMonthChange} 
        style={{ height: 34, padding: "0 10px" }}
      />
    </div>
  );
}
