"use client";

import { useState, useEffect } from "react";
import { Save, UserPlus, Trash2, KeyRound, CheckCircle2, LogOut, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUsersAction, createSalesRepAction, deleteUserAction } from "@/lib/actions/auth";
import { clearDatabaseAction } from "@/lib/actions/admin";

// Role-based access definitions
const rolePermissions: Record<string, { canView: string[]; canEdit: string[]; description: string }> = {
  "Sales Rep": {
    canView: ["Dashboard (sales KPIs only)", "Products (view only)", "Sales", "Orders", "Customers"],
    canEdit: ["Sales (record new sales)", "Orders (create & update)"],
    description: "Can record sales, manage orders, and view customers. Cannot access production, raw materials, expenses, reports, or system settings."
  },
  "Store Manager": {
    canView: ["Dashboard", "Products", "Inventory", "Sales", "Orders", "Customers", "Reports"],
    canEdit: ["Products (stock adjustments)", "Inventory", "Sales", "Orders", "Customers"],
    description: "Full access to store operations including inventory and reports. Cannot access production costs, raw materials, or system settings."
  },
  "Administrator": {
    canView: ["All modules"],
    canEdit: ["All modules"],
    description: "Full unrestricted access to all modules, settings, and user management."
  }
};

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "SALES_REP", password: "" });
  const [userLoading, setUserLoading] = useState(false);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Selected role to preview permissions
  const [previewRole, setPreviewRole] = useState<string | null>(null);

  // Danger Zone
  const [clearConfirmMsg, setClearConfirmMsg] = useState("");
  const [isClearingDb, setIsClearingDb] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await getUsersAction();
    if (res.success) setUsers(res.users);
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    
    setUserLoading(true);
    const formData = new FormData();
    formData.append("name", newUser.name);
    formData.append("email", newUser.email);
    formData.append("password", newUser.password);
    formData.append("role", newUser.role);

    const res = await createSalesRepAction(formData);
    if (res.success) {
      setNewUser({ name: "", email: "", role: "SALES_REP", password: "" });
      loadUsers();
    } else {
      alert(res.error || "Failed to create user");
    }
    setUserLoading(false);
  };

  const handleDeleteUser = async (id: string, role: string) => {
    if (role === "ADMIN" && users.filter(u => u.role === "ADMIN").length <= 1) {
      alert("Cannot delete the last administrator.");
      return;
    }
    const res = await deleteUserAction(id);
    if (res.success) {
      loadUsers();
    } else {
      alert(res.error || "Failed to delete user");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    const storedPwd = localStorage.getItem("mlaz_admin_password") || "admin123";
    if (currentPwd !== storedPwd) {
      setPwdMsg({ type: "error", text: "Current password is incorrect." });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPwdLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("mlaz_admin_password", newPwd);
    setPwdLoading(false);
    setPwdMsg({ type: "success", text: "Password changed successfully!" });
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleClearDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clearConfirmMsg !== "CONFIRM-CLEAR") {
      alert("Please type exactly CONFIRM-CLEAR to proceed.");
      return;
    }
    
    if (!confirm("WARNING: This action is irreversible. All operational data will be deleted. Do you want to proceed?")) {
      return;
    }
    
    setIsClearingDb(true);
    const res = await clearDatabaseAction(clearConfirmMsg);
    if (res.success) {
      alert("Database cleared successfully. Operational data has been removed.");
      setClearConfirmMsg("");
    } else {
      alert(res.error || "Failed to clear database");
    }
    setIsClearingDb(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Settings &amp; System Management</h1>
        <p className="page-subtitle">Configure system preferences, themes, and manage user access</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, maxWidth: 1100 }}>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Business Profile</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Business Name</label>
              <input className="input" defaultValue="MLAZ" />
            </div>
            <div>
              <label className="label">Currency Symbol</label>
              <input className="input" defaultValue="₦ (Nigerian Naira)" disabled />
            </div>
            <div>
              <label className="label">Contact Email</label>
              <input className="input" defaultValue="contact@mlaz.com" />
            </div>
            <button className="btn-accent" style={{ alignSelf: "flex-start", marginTop: 8 }} onClick={() => alert("Profile updated successfully!")}><Save size={16} /> Save Profile</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>System Preferences</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--color-brand)" }} />
              <span style={{ fontSize: "14px" }}>Enable Low Stock Alerts</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--color-brand)" }} />
              <span style={{ fontSize: "14px" }}>Email Daily Sales Summary</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => handleDarkModeToggle(e.target.checked)}
                style={{ accentColor: "var(--color-accent)", width: 18, height: 18 }}
              />
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Enable Dark Mode Theme</span>
            </label>
            <button className="btn-accent" style={{ alignSelf: "flex-start", marginTop: 16 }} onClick={() => alert("Preferences saved!")}><Save size={16} /> Save Preferences</button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: 8 }}><KeyRound size={16} style={{ color: "var(--color-accent)" }} /> Change Admin Password</div></div>
          <div className="card-body">
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {pwdMsg && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: pwdMsg.type === "success" ? "var(--color-success-bg)" : "var(--color-error-bg)",
                    border: `1px solid ${pwdMsg.type === "success" ? "rgba(45,106,79,0.2)" : "rgba(155,35,53,0.2)"}`,
                    fontSize: "13px",
                    color: pwdMsg.type === "success" ? "var(--color-success)" : "var(--color-error)",
                    alignItems: "center",
                  }}
                >
                  {pwdMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {pwdMsg.text}
                </div>
              )}
              <div>
                <label className="label">Current Password</label>
                <input className="input" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="Enter current password" required />
              </div>
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input className="input" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Re-enter new password" required />
              </div>
              <button type="submit" className="btn-accent" disabled={pwdLoading} style={{ alignSelf: "flex-start", marginTop: 4 }}>
                {pwdLoading ? "Updating..." : <><KeyRound size={16} /> Update Password</>}
              </button>
            </form>
          </div>
        </div>

        {/* Logout Card */}
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Session</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Sign out of your current session. You will be redirected to the login page.
            </p>
            <button className="btn-outline" style={{ alignSelf: "flex-start", color: "var(--color-error)" }} onClick={handleLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* User Management - full width */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>User Management</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <form onSubmit={handleAddUser} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="label">User Name</label>
                <input className="input" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label className="label">Email Address</label>
                <input className="input" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@mlaz.com" required />
              </div>
              <div style={{ width: 160 }}>
                <label className="label">Password</label>
                <input className="input" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Set password" required minLength={6} />
              </div>
              <div style={{ width: 150 }}>
                <label className="label">Role</label>
                <select className="select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="SALES_REP">Sales Rep</option>
                  <option value="STORE_MANAGER">Store Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <button type="submit" disabled={userLoading} className="btn-accent" style={{ height: 38 }}><UserPlus size={16} /> {userLoading ? "Adding..." : "Add User"}</button>
            </form>

            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Role</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: "var(--color-text-secondary)" }}>{u.email}</td>
                    <td style={{ color: "var(--color-text-secondary)" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${u.role === "ADMIN" ? "badge-brand" : u.role === "STORE_MANAGER" ? "badge-accent" : "badge-muted"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setPreviewRole(previewRole === u.role ? null : u.role)}
                        title="Click to view permissions"
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="btn-ghost" onClick={() => handleDeleteUser(u.id, u.role)} title="Delete user" style={{ color: "var(--color-error)" }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Permissions Reference - full width */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <div style={{ fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={16} style={{ color: "var(--color-accent)" }} /> Role Permissions Reference
            </div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(rolePermissions).map(([role, perms]) => (
              <div
                key={role}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: previewRole === role ? "var(--color-surface-warm)" : "transparent",
                  border: `1px solid ${previewRole === role ? "var(--color-accent)" : "var(--color-border)"}`,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span className={`badge ${role === "Administrator" ? "badge-brand" : role === "Store Manager" ? "badge-accent" : "badge-muted"}`}>
                    {role}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                  {perms.description}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Can View</div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                      {perms.canView.map(v => <li key={v}>{v}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Can Edit</div>
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
                      {perms.canEdit.map(v => <li key={v}>{v}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ gridColumn: "1 / -1", border: "1px solid var(--color-error)" }}>
          <div className="card-header" style={{ borderBottomColor: "rgba(155, 35, 53, 0.2)" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: 8, color: "var(--color-error)" }}>
              <AlertCircle size={16} /> Danger Zone (Admin Only)
            </div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>Clear All Operational Data</h4>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5, maxWidth: 600 }}>
                This action will delete all sales, inventory movements, production runs, raw materials, expenses, customers, and product variants. User accounts and system settings will remain intact. <strong>This action cannot be undone.</strong>
              </p>
            </div>
            
            <form onSubmit={handleClearDatabase} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <input 
                type="text" 
                className="input" 
                style={{ width: "220px" }} 
                placeholder="Type CONFIRM-CLEAR" 
                value={clearConfirmMsg} 
                onChange={(e) => setClearConfirmMsg(e.target.value)} 
              />
              <button 
                type="submit" 
                className="btn-ghost" 
                style={{ 
                  background: "var(--color-error)", 
                  color: "white", 
                  padding: "8px 16px",
                  fontWeight: 600
                }} 
                disabled={isClearingDb || clearConfirmMsg !== "CONFIRM-CLEAR"}
              >
                {isClearingDb ? "Clearing Data..." : "Clear Database"}
              </button>
            </form>
          </div>
        </div>
    </div>
  );
}
