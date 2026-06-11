import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import robotImg from "./assets/robot.png";

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
    <div className="login-page" style={{
       minHeight: "100vh",
      background: "#080808",
      display: "flex", overflow: "hidden", position: "relative"
    }}>

      {/* ── LEFT PANEL — full width behind robot ── */}
      <div className="left-panel" style={{
        flex: 1, position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "3rem 4.5rem"
      }}>

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0
        }} />

        {/* Robot image — positioned center-right of left panel */}
        <div style={{
          position: "absolute", bottom: 0, right: "-20px",
          height: "100%", zIndex: 1, pointerEvents: "none",
          display: "flex", alignItems: "flex-end"
        }}>
          {/* Red glow behind robot */}
          <div style={{
            position: "absolute", bottom: "10%", left: "50%",
            transform: "translateX(-50%)",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 65%)",
            borderRadius: "50%", pointerEvents: "none", zIndex: 0
          }} />
          <img 
          className="robot-image"
          src={robotImg} alt="AI Robot" style={{
            height: "92vh", maxHeight: "780px",
            objectFit: "contain", objectPosition: "bottom",
            filter: "drop-shadow(0 0 60px rgba(220,38,38,0.6))",
            animation: "float 4s ease-in-out infinite",
            position: "relative", zIndex: 2
          }} />
        </div>

        {/* Content — above robot */}
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

          <h1 className="hero-title" style={{
            fontSize: "64px",fontWeight: "800",lineHeight: "1.05",marginBottom: "1.2rem",maxWidth: "620px"
          }}>
            Prepare Smarter.<br />
            <span style={{ color: "#dc2626" }}>Get Placed Faster.</span>
          </h1>

          <p className="hero-description" style={{
            color: "#666", fontSize: "14px", lineHeight: "1.7",
            maxWidth: "520px", marginBottom: "2rem"
          }}>
            All-in-one platform to track your progress, analyze your resume, practice interviews, and ace every placement challenge.
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
                  <p style={{ margin: 0, color: "#777", fontSize: "12px" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hello-world">
  <span className="typing-text">HELLO WORLD</span>
  <span className="cursor">_</span>
</div>
      {/* ── RIGHT PANEL — floating dark card ── */}
      <div className="right-panel" style={{
        width: "520px",
flexShrink: 0,
position: "relative",
zIndex: 10,

marginRight: "60px",
marginTop: "40px",
marginBottom: "40px",

background: "rgba(8,8,8,0.92)",
backdropFilter: "blur(30px)",

border: "1px solid rgba(220,38,38,0.15)",
borderRadius: "28px",

boxShadow: "0 0 80px rgba(0,0,0,0.7)",

display: "flex",
alignItems: "center",
justifyContent: "center",

padding: "3rem"
      }}>
        {/* Subtle red corner glow */}
        <div style={{
          position: "absolute", top: "10%", right: "10%",
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />

        <div style={{ width: "100%", maxWidth: "360px", position: "relative", zIndex: 1 }}>

          <h2 style={{ fontSize: "48px", fontWeight: "800", margin: "0 0 6px", lineHeight: "1.2" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 6px" }}>
            <span style={{ color: "#dc2626", fontWeight: "700" }}>
              {isRegister ? "Sign Up" : "Login"}
            </span>{" "}to Continue
          </p>
          <p style={{ color: "#444", fontSize: "12px", margin: "0 0 24px", lineHeight: "1.6" }}>
            Access your personalized dashboard and continue your placement journey.
          </p>

          {/* Google Button */}
          <button onClick={handleGoogle} style={{
            width: "100%", padding: "12px", background: "transparent", color: "white",
            borderRadius: "10px", border: "1px solid #dc262644", cursor: "pointer",
            fontSize: "13px", fontWeight: "600", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "10px",
            marginBottom: "16px", transition: "all 0.2s"
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
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
            fontSize: "14px", fontWeight: "700", marginBottom: "16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 4px 24px rgba(220,38,38,0.35)", opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s, box-shadow 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 30px rgba(220,38,38,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(220,38,38,0.35)"}
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login  →"}
          </button>

          {/* Toggle */}
          <p style={{ textAlign: "center", color: "#444", fontSize: "12px", margin: "0 0 16px" }}>
            {isRegister ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}
              style={{ color: "#dc2626", cursor: "pointer", fontWeight: "600" }}>
              {isRegister ? "Login" : "Sign Up"}
            </span>
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span style={{ color: "#2a2a2a", fontSize: "14px" }}>◈</span>
            <span style={{ color: "#333", fontSize: "11px" }}>
              Your data is <span style={{ color: "#22c55e" }}>secure</span> with us
            </span>
          </div>
        </div>
      </div>

      <style>{`
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }

  @media (max-width: 768px) {

    .login-page {
      flex-direction: column !important;
    }

    .left-panel {
      width: 100% !important;
      padding: 1.5rem !important;
      min-height: auto !important;
    }

    .right-panel {
      width: calc(100% - 32px) !important;
      margin: 16px !important;
      padding: 1.5rem !important;
      border-radius: 20px !important;
    }

    .robot-image {
      display: none !important;
    }

    .hero-title {
      font-size: 42px !important;
      max-width: 100% !important;
    }

    .hero-description {
      max-width: 100% !important;
    }

    .testimonial {
      display: none !important;
    }
  }
    @keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-12px);
  }
}

/* HELLO WORLD */

.hello-world {
  position: absolute;
  bottom: 60px;
  left: 70px;
  z-index: 5;

  font-family: "Courier New", monospace;
  font-size: 32px;
  font-weight: 700;
  color: #dc2626;

  display: flex;
  align-items: center;
}

.typing-text {
  overflow: hidden;
  white-space: nowrap;
  width: 0;
  animation: typing 2.2s steps(11, end) forwards;
}

.cursor {
  margin-left: 4px;
  animation: blink 0.8s infinite;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 11ch;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }

  51%, 100% {
    opacity: 0;
  }
}
`}</style>
    </div>
  );
}