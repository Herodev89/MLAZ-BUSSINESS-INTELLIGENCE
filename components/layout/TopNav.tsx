"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Menu, LogOut, User, Settings } from "lucide-react";
import { getNotificationsAction, markNotificationAsReadAction } from "@/lib/actions/notifications";

// Derive page title from current path
function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/dashboard":       "Dashboard",
    "/products":        "Products",
    "/inventory":       "Inventory",
    "/sales":           "Sales",
    "/orders":          "Orders",
    "/customers":       "Customers",
    "/production":      "Production",
    "/raw-materials":   "Raw Materials",
    "/expenses":        "Expenses",
    "/profit-analysis": "Profit Analysis",
    "/reports":         "Reports",
    "/users":           "User Management",
    "/notifications":   "Notifications",
    "/settings":        "Settings",
  };

  // Match longest prefix
  const match = Object.keys(map)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  return match ? map[match] : "MLAZ";
}

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success) setNotifications(res.notifications);
  };

  const handleReadNotification = async (id: string) => {
    await markNotificationAsReadAction(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: 1 } : n));
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const title = getPageTitle(pathname);
  const unreadNotifications = notifications.filter(n => n.isRead === 0);
  const unreadNotifCount = unreadNotifications.length;

  return (
    <header className="topnav">
      {/* ── Mobile menu toggle ── */}
      <button
        onClick={onMenuClick}
        className="btn-ghost lg:hidden"
        style={{ padding: "8px", borderRadius: "8px" }}
        aria-label="Open menu"
        id="mobile-menu-btn"
      >
        <Menu size={20} style={{ color: "var(--color-text-secondary)" }} />
      </button>

      {/* ── Page Title ── */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* ── Notifications ── */}
      <div style={{ position: "relative" }}>
        <button
          id="notif-btn"
          className="btn-ghost"
          style={{ padding: "8px", position: "relative" }}
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          aria-label="Notifications"
        >
          <Bell size={18} style={{ color: "var(--color-text-secondary)" }} />
          {unreadNotifCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "var(--color-error)",
                color: "white",
                fontSize: "9px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadNotifCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {notifOpen && (
          <div
            id="notif-dropdown"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 320,
              background: "white",
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
              boxShadow: "0 8px 24px rgba(61,31,14,0.12)",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "14px" }}>Notifications</span>
              <span className="badge-warning" style={{ borderRadius: "99px", padding: "2px 8px", fontSize: "11px" }}>
                {unreadNotifCount} new
              </span>
            </div>
            {unreadNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleReadNotification(notif.id)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  gap: "10px",
                  cursor: "pointer",
                }}
                className="hover:bg-gray-50 transition-colors"
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: notif.type === "warning" ? "var(--color-warning)" : "var(--color-brand)",
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: 2 }}>
                    {notif.message}
                  </div>
                </div>
              </div>
            ))}
            {unreadNotifications.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: "var(--color-text-muted)" }}>
                No new notifications
              </div>
            )}
            <div style={{ padding: "10px 16px", textAlign: "center" }}>
              <Link
                href="/notifications"
                style={{ fontSize: "13px", color: "var(--color-accent)", fontWeight: 600 }}
                onClick={() => setNotifOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Profile menu ── */}
      <div style={{ position: "relative" }}>
        <button
          id="profile-btn"
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 10px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            background: "white",
            cursor: "pointer",
          }}
          aria-label="Profile menu"
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--color-brand)",
              color: "var(--color-accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ display: "none", flexDirection: "column", alignItems: "flex-start" }} id="profile-name-block">
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              Admin
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              Administrator
            </span>
          </div>
          <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} />
        </button>

        {/* Profile dropdown */}
        {profileOpen && (
          <div
            id="profile-dropdown"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              width: 200,
              background: "white",
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
              boxShadow: "0 8px 24px rgba(61,31,14,0.12)",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)" }}>Admin User</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>admin@mlaz.com</div>
            </div>
            {[
              { href: "/settings", label: "Profile Settings", icon: User },
              { href: "/settings", label: "Preferences",      icon: Settings },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setProfileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  fontSize: "13px",
                  color: "var(--color-text-primary)",
                  textDecoration: "none",
                }}
                className="topnav-menu-item"
              >
                <Icon size={15} style={{ color: "var(--color-text-muted)" }} />
                {label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid var(--color-border)", padding: "4px 0" }}>
              <a
                href="/login"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  fontSize: "13px",
                  color: "var(--color-error)",
                  textDecoration: "none",
                  cursor: "pointer"
                }}
              >
                <LogOut size={15} />
                Sign Out
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
