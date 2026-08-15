"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, CheckCheck, Bell } from "lucide-react";
import Link from "next/link";
import { getNotificationsAction, markNotificationAsReadAction } from "@/lib/actions/notifications";

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success) setAlerts(res.notifications || []);
  };

  const unreadCount = alerts.filter(a => a.isRead === 0).length;

  const handleDismiss = async (id: string) => {
    // Optionally delete from DB if implemented
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationAsReadAction(id);
    setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: 1 } : a));
  };

  const handleMarkAllRead = async () => {
    for (const a of alerts) {
      if (a.isRead === 0) await markNotificationAsReadAction(a.id);
    }
    setAlerts(alerts.map(a => ({ ...a, isRead: 1 })));
  };

  const handleClearAll = () => {
    setAlerts([]);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Alerts and system updates</p>
        </div>
        {alerts.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            {unreadCount > 0 && (
              <button className="btn-outline btn-sm" onClick={handleMarkAllRead}>
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
            <button className="btn-outline btn-sm" onClick={handleClearAll} style={{ color: "var(--color-error)" }}>
              <X size={14} /> Clear All
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>Recent Alerts</div>
          {unreadCount > 0 ? (
            <span className="badge-warning">{unreadCount} Unread</span>
          ) : (
            <span className="badge-success">All read</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {alerts.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--color-text-muted)" }}>
              <Bell size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: "14px", fontWeight: 600 }}>All caught up!</div>
              <div style={{ fontSize: "13px", marginTop: 4 }}>No notifications to show.</div>
            </div>
          ) : (
            alerts.map((alert, i) => (
              <div
                key={alert.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: i < alerts.length - 1 ? "1px solid var(--color-border)" : "none",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  background: alert.isRead ? "transparent" : "var(--color-surface-warm)",
                  transition: "background 0.2s ease, opacity 0.2s ease",
                  opacity: alert.isRead ? 0.7 : 1,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "10px",
                  background: alert.isRead ? "var(--color-surface-muted)" : (alert.type === "warning" ? "var(--color-warning-bg)" : "var(--color-brand-light)"),
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <AlertTriangle size={20} style={{ color: alert.isRead ? "var(--color-text-muted)" : (alert.type === "warning" ? "var(--color-warning)" : "var(--color-brand)") }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontWeight: alert.isRead ? 500 : 600, color: "var(--color-text-primary)" }}>
                      {alert.title}
                      {!alert.isRead && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", marginLeft: 8, verticalAlign: "middle" }} />}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{new Date(alert.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                    {alert.message}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Link href="/inventory/stock" className="btn-outline btn-sm" style={{ display: "inline-flex" }}>
                      View Stock
                    </Link>
                    {!alert.isRead && (
                      <button className="btn-ghost btn-sm" onClick={() => handleMarkRead(alert.id)} style={{ fontSize: "12px", color: "var(--color-accent)" }}>
                        <CheckCheck size={13} /> Mark Read
                      </button>
                    )}
                    <button className="btn-ghost btn-sm" onClick={() => handleDismiss(alert.id)} style={{ fontSize: "12px", color: "var(--color-text-muted)" }} title="Dismiss">
                      <X size={13} /> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
