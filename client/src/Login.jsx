import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithRedirect } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "⚡", title: "AI-Powered Tools", desc: "Resume Analyzer, Mock Interviews and more." },
  { icon: "📊", title: "Track & Improve", desc: "Smart progress tracking across all modules." },
  { icon: "🔥", title: "Daily Challenges", desc: "Build consistency with daily DSA & Aptitude challenges." },
  { icon: "🏢", title: "Company Insights", desc: "Access company-wise questions and interview experiences." },
];

export default function Login({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const url = isRegister
        ? "https://placeai-sqjj.onrender.com/api/auth/register"
        : "https://placeai-sqjj.onrender.com/api/auth/login";
      const res = await axios.post(url, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
    setLoading(false);
  };
const handleGoogle = async () => {
  setError("");
  try {
    await signInWithRedirect(auth, googleProvider);
    const { displayName, email, photoURL } = result.user;
    const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
      name: displayName, email, avatar: photoURL
    });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    setError("Google login failed. Try again.");
  }
};
  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", overflow: "hidden"
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, padding: "3rem", display: "flex", flexDirection: "column",
        justifyContent: "space-between", position: "relative", overflow: "hidden"
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "20%", left: "30%",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "10%",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px",
              background: "#dc2626", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px" }}>🎯</div>
            <span style={{ fontSize: "18px", fontWeight: "700" }}>
              PlacePrep <span style={{ color: "#dc2626" }}>AI</span>
            </span>
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
            padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
            color: "#dc2626", fontWeight: "600", marginBottom: "1.5rem"
          }}>
            🎯 Your AI Placement Partner
          </div>

          <h1 style={{ fontSize: "42px", fontWeight: "800", lineHeight: "1.2", marginBottom: "1rem" }}>
            Prepare Smarter.<br />
            <span style={{ color: "#dc2626" }}>Get Placed Faster.</span>
          </h1>
          <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.7", maxWidth: "400px", marginBottom: "2.5rem" }}>
            All-in-one platform to track your progress, analyze your resume, practice interviews, and ace every placement challenge.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px",
                  background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "14px" }}>{f.title}</p>
                  <p style={{ margin: 0, color: "#555", fontSize: "13px" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{
          position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.03)", border: "1px solid #1f1f1f",
          borderRadius: "14px", padding: "16px 20px",
          display: "flex", alignItems: "center", gap: "14px"
        }}>
          <span style={{ fontSize: "28px", color: "#dc2626", opacity: 0.5, lineHeight: 1 }}>"</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 6px", color: "#aaa", fontSize: "13px", lineHeight: "1.6" }}>
              PlacePrep AI helped me crack my dream company with confidence!
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#f59e0b", fontSize: "12px" }}>★★★★★</span>
              <span style={{ color: "#555", fontSize: "12px" }}>— Ananya, SDE Intern</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        width: "480px", background: "#0d0d0d", border: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "3rem", flexShrink: 0
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px" }}>
            Welcome Back 👋
          </h2>
          <p style={{ color: "#555", fontSize: "14px", margin: "0 0 28px", lineHeight: "1.6" }}>
            <span style={{ color: "#dc2626", fontWeight: "600" }}>
              {isRegister ? "Sign Up" : "Login"}
            </span> to Continue<br />
            Access your personalized dashboard and continue your placement journey.
          </p>  

          {/* Name field for register */}
          {isRegister && (
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#555", display: "block", marginBottom: "6px" }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name" style={{ width: "100%" }} />
            </div>
          )}
          
          {/* Google Button */}
  <button onClick={handleGoogle} style={{
  width: "100%", padding: "13px", background: "transparent", color: "white",
  borderRadius: "10px", border: "1px solid #dc262655", cursor: "pointer",
  fontSize: "14px", fontWeight: "600", display: "flex",
  alignItems: "center", justifyContent: "center", gap: "10px",
  marginBottom: "20px", transition: "all 0.2s"
}}
  onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.08)"}
  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
>
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
  Continue with Google
</button>

{/* Divider */}
<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
  <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
  <span style={{ color: "#444", fontSize: "12px" }}>or</span>
  <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
</div>
          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: "#555", display: "block", marginBottom: "6px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#444" }}>✉</span>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey} placeholder="Enter your email" type="email"
                style={{ width: "100%", paddingLeft: "38px" }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "12px", color: "#555", display: "block", marginBottom: "6px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#444" }}>🔒</span>
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey} placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                style={{ width: "100%", paddingLeft: "38px", paddingRight: "44px" }} />
              <button onClick={() => setShowPassword(!showPassword)} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer",
                color: "#444", fontSize: "14px", padding: "4px"
              }}>
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Remember me */}
          {!isRegister && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#888" }}>
                <input type="checkbox" style={{ width: "14px", height: "14px", accentColor: "#dc2626" }} />
                Remember me
              </label>
              <span style={{ color: "#dc2626", fontSize: "13px", cursor: "pointer" }}>Forgot Password?</span>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef444433",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
              <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "13px", background: "#dc2626", color: "white",
            borderRadius: "10px", border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "15px", fontWeight: "700", marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 4px 20px rgba(220,38,38,0.4)", opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s"
          }}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login →"}
          </button>

          {/* Toggle */}
          <p style={{ textAlign: "center", color: "#555", fontSize: "13px", margin: "0 0 20px" }}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}
              style={{ color: "#dc2626", cursor: "pointer", fontWeight: "600" }}>
              {isRegister ? "Login" : "Sign Up"}
            </span>
          </p>

          {/* Security note */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span style={{ color: "#333", fontSize: "12px" }}>🛡</span>
            <span style={{ color: "#444", fontSize: "12px" }}>
              Your data is <span style={{ color: "#22c55e" }}>secure</span> with us
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}