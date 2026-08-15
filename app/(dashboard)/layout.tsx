"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import MobileDrawer from "@/components/layout/MobileDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ── Mobile Drawer ── */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ── Main Area ── */}
      <div className="main-content" style={{ flex: 1 }}>
        <TopNav onMenuClick={() => setDrawerOpen(true)} />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
