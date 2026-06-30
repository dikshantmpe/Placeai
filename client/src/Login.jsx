import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in...", email, password);
    navigate("/dashboard");
  };

  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      title: "AI-Powered",
      sub: "Tools",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <path d="M12 18v4M8 22h8" />
        </svg>
      ),
      title: "Augmented",
      sub: "Insights",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M17 7h4v4" />
        </svg>
      ),
      title: "Track &",
      sub: "Improve",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "#030305",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
      color: "#ffffff",
      padding: "2rem"
    }}>
      <style>{`
        @keyframes wave-drift {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-3%) translateY(2%); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-y-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 6px rgba(239,68,68,0.6)); }
          50% { opacity: 1; filter: drop-shadow(0 0 16px rgba(239,68,68,0.9)); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }

        .glass-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          background: rgba(34, 211, 238, 0.05);
          border-color: #22d3ee;
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.35);
          outline: none;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer; color: #71717a;
          display: flex; align-items: center; justify-content: center;
          padding: 4px; transition: color 0.2s ease;
        }
        .eye-btn:hover { color: #22d3ee; }

        .feature-badge {
          background: rgba(15, 15, 20, 0.55);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          width: 130px;
          animation: float-y 5s ease-in-out infinite;
        }
        .feature-badge svg { color: #ef4444; }

        .floating-shape {
          position: absolute;
          animation: float-y-slow 7s ease-in-out infinite;
          opacity: 0.5;
        }
      `}</style>

      {/* Background wave glows */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(circle at 20% 30%, rgba(239,68,68,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.15) 0%, transparent 45%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, opacity: 0.5,
        background: "repeating-linear-gradient(115deg, rgba(239,68,68,0.05) 0px, rgba(239,68,68,0.05) 2px, transparent 2px, transparent 60px), repeating-linear-gradient(245deg, rgba(34,211,238,0.05) 0px, rgba(34,211,238,0.05) 2px, transparent 2px, transparent 60px)",
        animation: "wave-drift 14s ease-in-out infinite"
      }} />

      {/* Floating geometric shapes */}
      <div className="floating-shape" style={{ top: "8%", left: "4%", width: "28px", height: "28px", border: "1px solid rgba(239,68,68,0.4)", transform: "rotate(20deg)", animationDelay: "0s" }} />
      <div className="floating-shape" style={{ top: "60%", left: "2%", width: "20px", height: "20px", border: "1px solid rgba(34,211,238,0.4)", borderRadius: "4px", animationDelay: "1.5s" }} />
      <div className="floating-shape" style={{ top: "85%", left: "20%", width: "16px", height: "16px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", animationDelay: "2.5s" }} />
      <div className="floating-shape" style={{ top: "10%", right: "6%", width: "60px", height: "80px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", animationDelay: "1s" }} />

      {/* --- Main Glass Container (single unified card) --- */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "1180px",
        minHeight: "70vh",
        borderRadius: "28px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 30px 80px -20px rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "stretch",
        transform: mounted ? "scale(1)" : "scale(0.98)",
        opacity: mounted ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        background: "radial-gradient(circle at 30% 50%, rgba(60,10,10,0.5) 0%, rgba(5,5,8,0.95) 60%)"
      }}>

        {/* LEFT: stylized AI head illustration + floating feature badges */}
        <div style={{
          flex: "0 0 46%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem"
        }}>
          <div className="animate-fade-in delay-1 feature-badge" style={{ position: "absolute", top: "12%", left: "6%", animationDelay: "0s" }}>
            <div>{features[0].icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.2 }}>{features[0].title}<br/>{features[0].sub}</div>
          </div>
          <div className="animate-fade-in delay-2 feature-badge" style={{ position: "absolute", top: "44%", left: "0%", animationDelay: "1.2s" }}>
            <div>{features[1].icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.2 }}>{features[1].title}<br/>{features[1].sub}</div>
          </div>
          <div className="animate-fade-in delay-3 feature-badge" style={{ position: "absolute", bottom: "10%", left: "8%", animationDelay: "2.1s" }}>
            <div>{features[2].icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.2 }}>{features[2].title}<br/>{features[2].sub}</div>
          </div>

          <svg viewBox="0 0 320 420" width="78%" style={{ maxWidth: "340px", filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.6))" }}>
            <defs>
              <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1c1c22" />
                <stop offset="100%" stopColor="#050507" />
              </linearGradient>
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff8a65" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
            <ellipse cx="160" cy="160" rx="120" ry="130" fill="url(#headGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <path d="M50 150 Q160 60 270 150 Q270 230 160 270 Q50 230 50 150 Z" fill="url(#headGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <rect x="60" y="150" width="200" height="22" rx="11" fill="url(#visorGrad)" style={{ animation: "pulse-glow 2.4s ease-in-out infinite" }} />
            <circle cx="160" cy="200" r="46" fill="#0a0a0c" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <circle cx="160" cy="200" r="22" fill="#161618" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
            <g stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none">
              <path d="M70 120 L40 90" />
              <path d="M250 120 L280 90" />
              <path d="M100 280 L90 340" />
              <path d="M220 280 L230 340" />
            </g>
            <rect x="120" y="300" width="80" height="100" rx="16" fill="url(#headGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          </svg>
        </div>

        {/* RIGHT: translucent glass login card */}
        <div style={{
          flex: "1",
          background: "rgba(20, 22, 26, 0.55)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          padding: "3.5rem 3.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>

            <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2.5rem" }}>
              <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #ef4444, #b91c1c)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>P</div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700", letterSpacing: "0.5px" }}>PlacePrep <span style={{ color: "#ef4444" }}>AI</span></h2>
            </div>

            <h1 className="animate-fade-in delay-1" style={{ fontSize: "2.1rem", fontWeight: "800", margin: "0 0 1.75rem 0" }}>Welcome Back</h1>

            <form onSubmit={handleLogin}>
              <div className="animate-fade-in delay-2" style={{ marginBottom: "1.25rem", position: "relative" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  placeholder="Email your email"
                  style={{ width: "100%", padding: "16px 44px 16px 18px", borderRadius: "14px", fontSize: "0.95rem", boxSizing: "border-box" }}
                  required
                />
                <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#22d3ee" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </div>

              <div className="animate-fade-in delay-2" style={{ marginBottom: "1.75rem", position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  placeholder="Password"
                  style={{ width: "100%", padding: "16px 44px 16px 18px", borderRadius: "14px", fontSize: "0.95rem", boxSizing: "border-box" }}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.7 18.7 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
                      <path d="M1 1l22 22" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                className="animate-fade-in delay-3 glass-input"
                type="button"
                style={{
                  width: "100%", padding: "15px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  cursor: "pointer", fontSize: "0.95rem", fontWeight: "600", marginBottom: "1.75rem"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="submit"
                className="animate-fade-in delay-4"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  width: "100%", padding: "17px", borderRadius: "14px", border: "none", cursor: "pointer",
                  background: isHovered ? "linear-gradient(90deg, #b91c1c, #991b1b)" : "linear-gradient(90deg, #ff8a65, #ef4444)",
                  color: "white", fontSize: "1.05rem", fontWeight: "700",
                  boxShadow: isHovered ? "0 0 30px rgba(239, 68, 68, 0.6)" : "0 0 18px rgba(239, 68, 68, 0.35)",
                  transition: "all 0.3s ease", transform: isHovered ? "translateY(-2px)" : "translateY(0)"
                }}
              >
                Login
              </button>
            </form>

            <p className="animate-fade-in delay-5" style={{ textAlign: "center", marginTop: "1.75rem", color: "#a1a1aa", fontSize: "0.9rem" }}>
              Don't have an account? <Link to="/signup" style={{ color: "#ef4444", textDecoration: "none", fontWeight: "600" }}>Sign Up</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}