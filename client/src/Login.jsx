import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import robotImg from "./assets/robot.png";

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
      const result = await signInWithPopup(auth, googleProvider);
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
      display: "flex", overflow: "hidden", position: "relative"
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1, padding: "3rem", display: "flex", flexDirection: "column",
        justifyContent: "space-between", position: "relative", overflow: "hidden"
      }}>
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none"
        }} />
        {/* Red glow behind robot */}
        <div style={{
          position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 65%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2.5rem" }}>
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
            color: "#dc2626", fontWeight: "600", marginBottom: "1.2rem"
          }}>
            🎯 Your AI Placement Partner
          </div>

          <h1 style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1.2", marginBottom: "1rem" }}>
            Prepare Smarter.<br />
            <span style={{ color: "#dc2626" }}>Get Placed Faster.</span>
          </h1>
          <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.7", maxWidth: "360px", marginBottom: "2rem" }}>
            All-in-one platform to track your progress, analyze your resume, practice interviews, and ace every placement challenge.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "13px" }}>{f.title}</p>
                  <p style={{ margin: 0, color: "#555", fontSize: "12px" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{
          position: "relative", zIndex: 2,
          background: "rgba(255,255,255,0.03)", border: "1px solid #1f1f1f",
          borderRadius: "14px", padding: "14px 18px",
          display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "24px", color: "#dc2626", opacity: 0.5 }}>"</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 6px", color: "#aaa", fontSize: "12px", lineHeight: "1.6" }}>
              PlacePrep AI helped me crack my dream company with confidence!
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#f59e0b", fontSize: "11px" }}>★★★★★</span>
              <span style={{ color: "#555", fontSize: "11px" }}>— Ananya, SDE Intern</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROBOT IMAGE — between left and right ── */}
<div style={{
  width: "380px", flexShrink: 0,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  position: "relative", overflow: "hidden"
}}>
  <div style={{
    position: "absolute", bottom: "0", left: "50%", transform: "translateX(-50%)",
    width: "400px", height: "400px",
    background: "radial-gradient(circle, rgba(220,38,38,0.3) 0%, transparent 65%)",
    borderRadius: "50%", pointerEvents: "none"
  }} />
  <img src={robotImg} alt="AI Robot"
    style={{
      height: "90vh", maxHeight: "750px",
      objectFit: "contain", objectPosition: "bottom",
      filter: "drop-shadow(0 0 50px rgba(220,38,38,0.6)) drop-shadow(0 0 100px rgba(220,38,38,0.3))",
      animation: "float 4s ease-in-out infinite",
      position: "relative", zIndex: 2
    }}
  />
</div>

      {/* ── RIGHT PANEL — FLOATING CARD ── */}
      <div style={{
        width: "420px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem", position: "relative", zIndex: 10
      }}>
        <div style={{
          width: "100%", maxWidth: "380px",
          background: "rgba(13,13,13,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: "20px", padding: "2rem",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(220,38,38,0.1)",
        }}>
          <h2 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 6px" }}>
            Welcome Back 👋
          </h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 24px", lineHeight: "1.6" }}>
            <span style={{ color: "#dc2626", fontWeight: "600" }}>
              {isRegister ? "Sign Up" : "Login"}
            </span> to Continue — Access your personalized dashboard.
          </p>

          {/* Google Button */}
          <button onClick={handleGoogle} style={{
            width: "100%", padding: "12px", background: "transparent", color: "white",
            borderRadius: "10px", border: "1px solid #dc262655", cursor: "pointer",
            fontSize: "13px", fontWeight: "600", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "10px",
            marginBottom: "16px", transition: "all 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
            <span style={{ color: "#444", fontSize: "11px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
          </div>

          {/* Name field */}
          {isRegister && (
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", color: "#555", display: "block", marginBottom: "5px" }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name" style={{ width: "100%" }} />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", color: "#555", display: "block", marginBottom: "5px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: "13px" }}>✉</span>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey} placeholder="Enter your email" type="email"
                style={{ width: "100%", paddingLeft: "34px" }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", color: "#555", display: "block", marginBottom: "5px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#444", fontSize: "13px" }}>🔒</span>
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey} placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "40px" }} />
              <button onClick={() => setShowPassword(!showPassword)} style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer", color: "#444", fontSize: "13px"
              }}>
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Remember me */}
          {!isRegister && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "#888" }}>
                <input type="checkbox" style={{ accentColor: "#dc2626" }} />
                Remember me
              </label>
              <span style={{ color: "#dc2626", fontSize: "12px", cursor: "pointer" }}>Forgot Password?</span>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef444433",
              borderRadius: "8px", padding: "8px 12px", marginBottom: "12px" }}>
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "12px", background: "#dc2626", color: "white",
            borderRadius: "10px", border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px", fontWeight: "700", marginBottom: "16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 4px 20px rgba(220,38,38,0.4)", opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login →"}
          </button>

          {/* Toggle */}
          <p style={{ textAlign: "center", color: "#555", fontSize: "12px", margin: "0 0 14px" }}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}
              style={{ color: "#dc2626", cursor: "pointer", fontWeight: "600" }}>
              {isRegister ? "Login" : "Sign Up"}
            </span>
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span style={{ color: "#333", fontSize: "11px" }}>🛡</span>
            <span style={{ color: "#444", fontSize: "11px" }}>
              Your data is <span style={{ color: "#22c55e" }}>secure</span> with us
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-15px); }
        }
      `}</style>
    </div>
  );
}