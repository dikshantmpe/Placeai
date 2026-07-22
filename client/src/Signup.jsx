import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p);
const getStrength = (p) => {
  let s = 0;
  if (p.length >= 8) s++; if (p.length >= 12) s++;
  if (/[a-z]/.test(p)) s++; if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++; if (/[^a-zA-Z0-9]/.test(p)) s++;
  return ["Weak","Fair","Good","Strong","Very Strong"][Math.min(s-1,4)] || "Weak";
};

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setMounted(true), []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(e.target.value && !isValidEmail(e.target.value) ? "Enter a valid email address" : "");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Full name is required"); return; }
    if (!isValidEmail(email)) { setError("Enter a valid email address"); return; }
    if (!isValidPassword(password)) { setError("Password must be 8+ chars with uppercase, lowercase, number, and special character"); return; }
    setIsLoading(true);
    try {
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/register", {
        name: name.trim(), email: email.toLowerCase(), password
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(""); setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "",
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-up failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const strength = password ? getStrength(password) : "";
  const strengthColor = { "Very Strong": "#22c55e", Strong: "#3b82f6", Good: "#eab308", Fair: "#f97316", Weak: "#ef4444" }[strength] || "#ef4444";

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, -apple-system, sans-serif", color: "#172033", background: "#fff", opacity: mounted ? 1 : 0, transition: "opacity .6s ease" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }
        input::placeholder { color: #9ca3af; }
        .input-wrap { background: #f5f7fa; border: 1px solid #dfe5ec; border-radius: 999px; display: flex; align-items: center; padding: 0 18px; margin-bottom: 10px; transition: border .2s; }
        .input-wrap:focus-within { border-color: #1769e0; background: #fff; }
        .input-wrap.err { border-color: #ef4444; }
        .input-wrap input { flex: 1; background: transparent; border: none; outline: none; font-size: 15px; padding: 14px 0; color: #172033; font-family: inherit; }
        @media (max-width: 900px) { .signup-grid { grid-template-columns: 1fr !important; } .info-col { display: none !important; } }
      `}</style>

      {/* NAV */}
      <header style={{ height: 72, display: "flex", alignItems: "center", position: "sticky", top: 0, background: "rgba(255,255,255,.96)", backdropFilter: "blur(12px)", zIndex: 30, borderBottom: "1px solid rgba(20,40,70,.06)" }}>
        <div style={{ width: "min(1180px, calc(100% - 48px))", margin: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 24, fontWeight: 850, letterSpacing: "-1px", color: "#10264a" }}>Crackin <span style={{ color: "#1769e0" }}>AI</span></span>
          <p style={{ color: "#536079", fontSize: 15, margin: 0 }}>
            Already have an account? <Link to="/" style={{ color: "#1769e0", fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </header>

      <section style={{ padding: "72px 0 80px" }}>
        <div className="signup-grid" style={{ width: "min(1180px, calc(100% - 48px))", margin: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 90, alignItems: "center" }}>

          {/* LEFT - Info */}
          <div className="info-col">
            <p style={{ color: "#1769e0", fontWeight: 750, fontSize: 13, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: ".08em" }}>Start for free</p>
            <h1 style={{ fontSize: "clamp(36px, 4vw, 54px)", lineHeight: 1.08, letterSpacing: "-2px", fontWeight: 420, color: "#10264a", margin: "0 0 20px" }}>
              Your first job starts long before the interview.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "#536079", margin: "0 0 36px" }}>
              Join students who are preparing smarter with AI-powered tools built for placement season.
            </p>
            {[
              { icon: "◎", label: "DSA Tracker", desc: "Curated problems, topic-wise progress" },
              { icon: "▣", label: "Resume Analyser", desc: "AI feedback and readiness scoring" },
              { icon: "✦", label: "Mock Interviews", desc: "Practice with real-time AI feedback" },
              { icon: "↗", label: "Aptitude Quizzes", desc: "Quantitative, logical, verbal practice" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid #dfe5ec" }}>
                <span style={{ color: "#1769e0", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#10264a", marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 14, color: "#667085" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT - Form */}
          <div>
            <div style={{ background: "#fff", border: "1px solid #dfe5ec", borderRadius: 24, padding: "2.5rem", boxShadow: "0 4px 24px rgba(20,40,80,.07)" }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.8px", color: "#10264a", margin: "0 0 6px" }}>Create your account</h2>
              <p style={{ color: "#667085", fontSize: 15, margin: "0 0 24px" }}>Join Crackin AI to accelerate your placement journey.</p>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 16px", borderRadius: 12, fontSize: 14, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button onClick={handleGoogleSignup} disabled={isLoading} style={{ width: "100%", height: 49, marginBottom: 16, background: "#1769e0", color: "#fff", border: "none", borderRadius: 999, fontWeight: 750, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", opacity: isLoading ? .7 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
                Continue with Google
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 16px" }}>
                <div style={{ flex: 1, height: 1, background: "#dfe5ec" }} />
                <span style={{ color: "#9ca3af", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>or sign up with email</span>
                <div style={{ flex: 1, height: 1, background: "#dfe5ec" }} />
              </div>

              <form onSubmit={handleSignup}>
                <div className="input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1769e0" strokeWidth="2" style={{ marginRight: 10, flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
                </div>

                <div className={`input-wrap${emailError ? " err" : ""}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1769e0" strokeWidth="2" style={{ marginRight: 10, flexShrink: 0 }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" value={email} onChange={handleEmailChange} placeholder="Email address" required />
                </div>
                {emailError && <p style={{ color: "#ef4444", fontSize: 12, margin: "-6px 0 8px 16px" }}>{emailError}</p>}

                <div className="input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1769e0" strokeWidth="2" style={{ marginRight: 10, flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                    {showPassword
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    }
                  </button>
                </div>

                {password && (
                  <p style={{ fontSize: 13, color: "#667085", margin: "-4px 0 10px 16px" }}>
                    Password strength: <span style={{ fontWeight: 700, color: strengthColor }}>{strength}</span>
                  </p>
                )}

                <button type="submit" disabled={isLoading || !!emailError} style={{ width: "100%", height: 49, borderRadius: 999, border: "none", background: "#1769e0", color: "#fff", fontWeight: 750, fontSize: 15, cursor: (isLoading || !!emailError) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (isLoading || !!emailError) ? .7 : 1, marginTop: 4 }}>
                  {isLoading ? "Creating account…" : "Create account →"}
                </button>
              </form>

              <p style={{ fontSize: 12, color: "#7b8494", textAlign: "center", margin: "14px 12px 0", lineHeight: 1.5 }}>
                By continuing, you agree to Crackin AI's <a href="#" style={{ color: "#1769e0", fontWeight: 700 }}>Terms</a> and <a href="#" style={{ color: "#1769e0", fontWeight: 700 }}>Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}