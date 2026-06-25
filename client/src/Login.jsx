import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import robotImg from "./assets/robot.png";

const API_URL = "https://placeai-sqjj.onrender.com/api";

const features = [
  { icon: "◈", title: "AI-Powered Tools", desc: "Resume Analyzer, Mock Interviews and more." },
  { icon: "◎", title: "Track & Improve", desc: "Smart progress tracking across all modules." },
  { icon: "✦", title: "Daily Challenges", desc: "Build consistency with daily DSA & Aptitude challenges." },
  { icon: "⊞", title: "Company Insights", desc: "Access company-wise questions and interview experiences." },
];

export default function Login({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // 1. Prevent empty form submissions from crashing the backend
    if (!form.email || !form.password || (isRegister && !form.name)) {
      return setError("Please fill in all required fields.");
    }

    setError("");
    setLoading(true);
    try {
      const url = isRegister
        ? `${API_URL}/auth/register`
        : `${API_URL}/auth/login`;
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
      
      // 2. Extract the actual user details to match what the backend expects
      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL
      };

      // 3. Send the userData instead of the idToken
      const res = await axios.post(`${API_URL}/auth/google`, userData);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Google login failed. Try again.");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="login-page">

      {/* LEFT PANEL — desktop only */}
      <div className="login-left">
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0
        }} />

        {/* Robot */}
        <div style={{
          position: "absolute", bottom: 0, right: "-20px",
          height: "100%", zIndex: 1, pointerEvents: "none",
          display: "flex", alignItems: "flex-end"
        }}>
          <div style={{
            position: "absolute", bottom: "10%", left: "50%",
            transform: "translateX(-50%)",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 65%)",
            borderRadius: "50%", pointerEvents: "none", zIndex: 0
          }} />
          <img src={robotImg} alt="AI Robot" style={{
            height: "92vh", maxHeight: "780px",
            objectFit: "contain", objectPosition: "bottom",
            filter: "drop-shadow(0 0 60px rgba(220,38,38,0.6))",
            animation: "float 4s ease-in-out infinite",
            position: "relative", zIndex: 2
          }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 3 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2.5rem" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "8px",
              background: "#dc2626", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px", color: "white", fontWeight: "700"
            }}>P</div>
            <span style={{ fontSize: "17px", fontWeight: "700" }}>
              PlacePrep <span style={{ color: "#dc2626" }}>AI</span>
            </span>
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
            padding: "5px 12px", borderRadius: "20px", fontSize: "12px",
            color: "#dc2626", fontWeight: "600", marginBottom: "1.2rem"
          }}>
            · Your AI Placement Partner
          </div>

          <h1 style={{
            fontSize: "64px", fontWeight: "800", lineHeight: "1.05",
            marginBottom: "1.2rem", maxWidth: "520px"
          }}>
            Prepare Smarter.<br />
            <span style={{ color: "#dc2626" }}>Get Placed Faster.</span>
          </h1>

          <p style={{
            color: "#666", fontSize: "15px", lineHeight: "1.7",
            maxWidth: "420px", marginBottom: "2rem"
          }}>
            All-in-one platform to track your progress, analyze your resume,
            practice interviews, and ace every placement challenge.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "340px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", color: "#dc2626", flexShrink: 0
                }}>{f.icon}</div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "13px", color: "#eee" }}>{f.title}</p>
                  <p style={{ margin: 0, color: "#555", fontSize: "12px" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — login form */}
      <div className="login-right">
        <div className="login-form-inner">

          {/* Mobile Logo */}
          <div className="mobile-logo">
            <div style={{
              width: "34px", height: "34px", borderRadius: "8px",
              background: "#dc2626", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px", color: "white", fontWeight: "700"
            }}>P</div>
            <span style={{ fontSize: "17px", fontWeight: "700" }}>
              PlacePrep <span style={{ color: "#dc2626" }}>AI</span>
            </span>
          </div>

          <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px", lineHeight: "1.2" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 4px" }}>
            <span style={{ color: "#dc2626", fontWeight: "700" }}>
              {isRegister ? "Sign Up" : "Login"}
            </span>{" "}to Continue
          </p>
          <p style={{ color: "#444", fontSize: "12px", margin: "0 0 20px", lineHeight: "1.6" }}>
            Access your personalized dashboard and continue your placement journey.
          </p>

          {/* Google Button */}
          <button onClick={handleGoogle} style={{
            width: "100%", padding: "12px", background: "transparent", color: "white",
            borderRadius: "10px", border: "1px solid #dc262644", cursor: "pointer",
            fontSize: "13px", fontWeight: "600", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "10px",
            marginBottom: "14px", transition: "all 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.07)"}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
            <span style={{ color: "#333", fontSize: "11px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#1f1f1f" }} />
          </div>

          {/* Name field */}
          {isRegister && (
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", color: "#555", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name" style={{ width: "100%" }} />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", color: "#555", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: "13px" }}>✉</span>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey} placeholder="Enter your email" type="email"
                style={{ width: "100%", paddingLeft: "34px" }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", color: "#555", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: "13px" }}>⊕</span>
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey} placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "40px" }} />
              <button onClick={() => setShowPassword(!showPassword)} style={{
                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer", color: "#333", fontSize: "14px"
              }}>
                {showPassword ? "◎" : "◉"}
              </button>
            </div>
          </div>

          {/* Remember me */}
          {!isRegister && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "#666" }}>
                <input type="checkbox" style={{ accentColor: "#dc2626" }} />
                Remember me
              </label>
              <span style={{ color: "#dc2626", fontSize: "12px", cursor: "pointer" }}>Forgot Password?</span>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef444422",
              borderRadius: "8px", padding: "8px 12px", marginBottom: "12px" }}>
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>! {error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "13px", background: "#dc2626", color: "white",
            borderRadius: "10px", border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px", fontWeight: "700", marginBottom: "14px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 4px 24px rgba(220,38,38,0.35)", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login →"}
          </button>

          {/* Toggle */}
          <p style={{ textAlign: "center", color: "#444", fontSize: "12px", margin: "0 0 14px" }}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}
              style={{ color: "#dc2626", cursor: "pointer", fontWeight: "600" }}>
              {isRegister ? "Login" : "Sign Up"}
            </span>
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span style={{ color: "#333", fontSize: "11px" }}>
              Your data is <span style={{ color: "#22c55e" }}>secure</span> with us
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .login-page {
          min-height: 100vh;
          background: #080808;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 3rem 4.5rem;
        }

        .login-right {
          width: 520px;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          margin: 40px 60px 40px 0;
          background: rgba(8,8,8,0.92);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(220,38,38,0.15);
          border-radius: 28px;
          box-shadow: 0 0 80px rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
        }

        .login-form-inner {
          width: 100%;
          max-width: 360px;
        }

        .mobile-logo {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .login-page {
            flex-direction: column;
            overflow-y: auto;
          }

          .login-left {
            display: none;
          }

          .login-right {
            width: 100%;
            min-height: 100vh;
            margin: 0;
            border-radius: 0;
            border: none;
            padding: 2rem 1.5rem;
            align-items: flex-start;
            padding-top: 3rem;
          }

          .login-form-inner {
            max-width: 100%;
          }

          .mobile-logo {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}