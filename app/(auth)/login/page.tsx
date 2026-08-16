"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Footprints, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await loginAction(formData);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.success) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row"
      style={{
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── Top/Left Panel — Branding ── */}
      <div
        className="flex flex-col justify-center items-center py-12 px-6 lg:p-12 relative overflow-hidden"
        style={{
          flex: 1,
          background: "linear-gradient(145deg, #1E0C04 0%, #3D1F0E 45%, #2A1208 100%)",
        }}
      >
        {/* Decorative gold ring */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: "1px solid rgba(184,134,11,0.15)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            border: "1px solid rgba(184,134,11,0.08)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Brand coin logo */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            overflow: "hidden",
            marginBottom: 24,
            boxShadow: "0 8px 32px rgba(184,134,11,0.5)",
          }}
        >
          <Image src="/logo.jpg" alt="MLAZ Logo" width={88} height={88} style={{ objectFit: "cover" }} />
        </div>

        <h2
          className="brand-font-serif text-2xl lg:text-[38px]"
          style={{
            fontWeight: 800,
            fontStyle: "italic",
            letterSpacing: "0.06em",
            color: "#F0D070",
            margin: 0,
            marginBottom: 4,
            textShadow: "0 2px 12px rgba(240,208,112,0.3)",
          }}
        >
          MLAZ LIMITED
        </h2>
        <p
          className="brand-font-serif text-[11px] lg:text-[13px]"
          style={{
            fontStyle: "italic",
            color: "rgba(196,168,130,0.85)",
            margin: 0,
            marginBottom: "10%",
            letterSpacing: "0.08em",
          }}
        >
          Guaranteed amble across the globe
        </p>

        <div className="hidden lg:block" style={{ maxWidth: 340, textAlign: "center", zIndex: 10 }}>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#E8D8C0",
              marginBottom: 12,
              lineHeight: 1.3,
            }}
          >
            Footwear Sales, Inventory & Business Management
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(196,168,130,0.7)", lineHeight: 1.7 }}>
            One central platform to manage your products, track sales, monitor inventory, and understand your business performance.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="hidden lg:flex" style={{ gap: 16, marginTop: 48, flexWrap: "wrap", justifyContent: "center", zIndex: 10 }}>
          {["Products & Variants", "Sales & Orders", "Profit Analytics", "Inventory Control"].map((f) => (
            <div
              key={f}
              style={{
                padding: "6px 14px",
                borderRadius: "99px",
                border: "1px solid rgba(184,134,11,0.3)",
                fontSize: "12px",
                color: "rgba(196,168,130,0.8)",
                background: "rgba(184,134,11,0.08)",
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom/Right Panel — Login Form ── */}
      <div
        className="w-full lg:max-w-[480px] flex flex-col justify-center p-6 sm:p-10 lg:p-12 mx-auto lg:mx-0 z-20 login-card"
        style={{ 
          background: "var(--color-surface)",
          flex: 1
        }}
      >
        <style>{`
          .login-card {
            border-top-left-radius: 32px;
            border-top-right-radius: 32px;
            margin-top: -40px;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
          }
          @media (min-width: 1024px) {
            .login-card {
              border-radius: 0;
              margin-top: 0;
              box-shadow: none;
            }
          }
        `}</style>

        {/* Form header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--color-text-primary)", margin: 0, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>
            Sign in to your MLAZ account to continue
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 14px",
              borderRadius: "10px",
              background: "var(--color-error-bg)",
              border: "1px solid rgba(155,35,53,0.2)",
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} style={{ color: "var(--color-error)", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: "13px", color: "var(--color-error)" }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="label">Email / Username</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword
                  ? <EyeOff size={16} style={{ color: "var(--color-text-muted)" }} />
                  : <Eye     size={16} style={{ color: "var(--color-text-muted)" }} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label
              htmlFor="remember-me"
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "var(--color-accent)", width: 15, height: 15 }}
              />
              <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              id="forgot-password-link"
              style={{ fontSize: "13px", color: "var(--color-accent)", fontWeight: 600 }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-btn"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px 24px",
              borderRadius: "10px",
              background: loading ? "var(--color-border-dark)" : "var(--color-brand)",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginTop: 4,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* First-time setup hint removed for new auth system */}

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--color-text-muted)", marginTop: 32 }}>
          © 2026 MLAZ Limited. All rights reserved.
        </p>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
