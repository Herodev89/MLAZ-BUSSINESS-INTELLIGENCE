import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-surface)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: "16px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 4px 24px rgba(61,31,14,0.08)",
          padding: "36px 32px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              background: "rgba(184,134,11,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <KeyRound size={24} style={{ color: "var(--color-accent)" }} />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-text-primary)", margin: 0, marginBottom: 6 }}>
            Reset Password
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="reset-email" className="label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                id="reset-email"
                type="email"
                className="input"
                placeholder="Enter your email"
                style={{ paddingLeft: "36px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            id="send-reset-btn"
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "var(--color-brand)",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send Reset Link
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link
            href="/login"
            id="back-to-login"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--color-accent)", fontWeight: 600 }}
          >
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
