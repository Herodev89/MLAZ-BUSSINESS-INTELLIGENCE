"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  ClipboardList,
  Users,
  Factory,
  Layers,
  Receipt,
  TrendingUp,
  FileBarChart,
  UserCog,
  Settings,
  Bell,
  ChevronRight,
  Footprints,
  LogOut,
} from "lucide-react";

// ── Sidebar navigation config ──
const navItems = [
  { label: "Main", type: "section", roles: ["ADMIN", "SALES_REP"] },
  { href: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard, roles: ["ADMIN", "SALES_REP"] },

  { label: "Store", type: "section", roles: ["ADMIN", "SALES_REP"] },
  { href: "/products",        label: "Products",        icon: Package, roles: ["ADMIN", "SALES_REP"] },
  { href: "/inventory",       label: "Inventory",       icon: Warehouse, roles: ["ADMIN"] },
  { href: "/sales",           label: "Sales",           icon: ShoppingCart, roles: ["ADMIN", "SALES_REP"] },
  { href: "/orders",          label: "Orders",          icon: ClipboardList, roles: ["ADMIN", "SALES_REP"] },
  { href: "/customers",       label: "Customers",       icon: Users, roles: ["ADMIN", "SALES_REP"] },

  { label: "Production", type: "section", roles: ["ADMIN"] },
  { href: "/production",      label: "Production",      icon: Factory, roles: ["ADMIN"] },
  { href: "/raw-materials",   label: "Raw Materials",   icon: Layers, roles: ["ADMIN"] },
  { href: "/expenses",        label: "Expenses",        icon: Receipt, roles: ["ADMIN"] },

  { label: "Analytics", type: "section", roles: ["ADMIN"] },
  { href: "/profit-analysis", label: "Profit Analysis", icon: TrendingUp, roles: ["ADMIN"] },
  { href: "/reports",         label: "Reports",         icon: FileBarChart, roles: ["ADMIN"] },

  { label: "System", type: "section", roles: ["ADMIN", "SALES_REP"] },
  { href: "/notifications",   label: "Notifications",   icon: Bell, roles: ["ADMIN", "SALES_REP"] },
  { href: "/settings",        label: "Settings",        icon: Settings, roles: ["ADMIN"] },
] as const;

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  // Check if a nav item is active
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="sidebar">
      {/* ── Brand Logo ── */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--sidebar-border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Coin logo placeholder — matches MLAZ brand */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(184,134,11,0.4)",
          }}
        >
          <Image src="/logo.jpg" alt="MLAZ Logo" width={38} height={38} style={{ objectFit: "cover" }} />
        </div>
        <div>
          <div
            className="brand-font-serif"
            style={{
              fontWeight: 800,
              fontSize: "16px",
              fontStyle: "italic",
              letterSpacing: "0.04em",
              color: "#F0D070",
              lineHeight: 1.1,
            }}
          >
            MLAZ LIMITED
          </div>
          <div
            className="brand-font-serif"
            style={{
              fontSize: "10px",
              fontStyle: "italic",
              color: "var(--sidebar-text)",
              lineHeight: 1.2,
              marginTop: 2,
            }}
          >
            Guaranteed amble across the globe
          </div>
        </div>
      </div>

      {/* ── Navigation Items ── */}
      <nav style={{ flex: 1, padding: "8px 0 16px" }}>
        {navItems.map((item, index) => {
          // Check role permission
          if (user && !item.roles.includes(user.role as any)) return null;

          // Section label
          if ("type" in item && item.type === "section") {
            return (
              <div key={`section-${index}`} className="sidebar-section-label">
                {item.label}
              </div>
            );
          }

          // Nav link
          const navItem = item as { href: string; label: string; icon: React.ElementType };
          const Icon = navItem.icon;
          const active = isActive(navItem.href);

          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              onClick={onClose}
              className={`sidebar-item ${active ? "active" : ""}`}
            >
              <Icon
                size={17}
                style={{ color: active ? "var(--color-accent-light)" : "var(--sidebar-icon)", flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{navItem.label}</span>
              {active && (
                <ChevronRight
                  size={14}
                  style={{ color: "var(--color-accent-light)", opacity: 0.7 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Footer ── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--sidebar-border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--sidebar-hover)",
            border: "2px solid var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--color-accent-light)",
            flexShrink: 0,
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#E8D8C0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.name ? user.name : "Loading..."}
          </div>
          <div style={{ fontSize: "11px", color: "var(--sidebar-text)" }}>
            {user ? (user.role === "ADMIN" ? "Administrator" : "Sales Representative") : ""}
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sidebar-icon)" }}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
