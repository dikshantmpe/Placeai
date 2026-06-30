import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
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

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      color: "#ffffff",
      background: "#06060a",
      padding: "2rem"
    }}>
      <style>{`
        @keyframes mesh-move {
          0%   { transform: translate(0%, 0%) scale(1); }
          33%  { transform: translate(5%, -8%) scale(1.1); }
          66%  { transform: translate(-6%, 6%) scale(0.95); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes mesh-move-rev {
          0%   { transform: translate(0%, 0%) scale(1); }
          33%  { transform: translate(-7%, 5%) scale(0.9); }
          66%  { transform: translate(6%, -6%) scale(1.08); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes grain-shift {
          0% { background-position: 0 0; }
          100% { background-position: 200px 200px; }
        }
        @keyframes border-glow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-particle {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110vh) translateX(20px); opacity: 0; }
        }
        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-entrance {
          0%   { opacity: 0; transform: translateY(40px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .animate-in { animation: fade-in-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; } .d4 { animation-delay: 0.4s; }
        .d5 { animation-delay: 0.5s; } .d6 { animation-delay: 0.6s; }

        .glass-field {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .glass-field.focused {
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.18), 0 0 24px rgba(124,58,237,0.35);
        }

        .eye-btn {
          background: none; border: none; cursor: pointer; color: #8b8b9a;
          display: flex; align-items: center; justify-content: center;
          padding: 4px; transition: color 0.2s ease;
        }
        .eye-btn:hover { color: #a78bfa; }

        .glow-btn {
          position: relative;
          overflow: hidden;
        }
        .glow-btn::after {
          content: "";
          position: absolute;
          top: 0; left: -40%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shimmer 3.2s ease-in-out infinite;
        }

        .particle {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          animation: float-particle linear infinite;
          pointer-events: none;
        }

        .gradient-border-wrap {
          position: relative;
          border-radius: 28px;
          padding: 1.5px;
          background: linear-gradient(120deg, #7c3aed, #ec4899, #f59e0b, #22d3ee, #7c3aed);
          background-size: 300% 300%;
          animation: border-glow 8s ease infinite;
        }

        input::placeholder { color: #6b6b78; }
      `}</style>

      {/* === Animated mesh gradient background === */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-5%", width: "55vw", height: "55vw",
          background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
          filter: "blur(80px)", animation: "mesh-move 16s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", bottom: "-15%", right: "-10%", width: "50vw", height: "50vw",
          background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
          filter: "blur(90px)", animation: "mesh-move-rev 18s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "15%", width: "35vw", height: "35vw",
          background: "radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)",
          filter: "blur(70px)", animation: "mesh-move 13s ease-in-out infinite reverse"
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "15%", width: "30vw", height: "30vw",
          background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
          filter: "blur(70px)", animation: "mesh-move-rev 20s ease-in-out infinite"
        }} />
        {/* subtle grain/grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.4,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }} />
      </div>

      {/* === Floating particles === */}
      {Array.from({ length: 18 }).map((_, i) => {
        const size = 2 + Math.random() * 4;
        const left = Math.random() * 100;
        const duration = 10 + Math.random() * 14;
        const delay = Math.random() * 10;
        const colors = ["#a78bfa", "#f472b6", "#22d3ee", "#fbbf24"];
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="particle"
            style={{
              left: `${left}%`,
              width: size, height: size,
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              zIndex: 1
            }}
          />
        );
      })}

      {/* === Main card with animated gradient border === */}
      <div
        className="gradient-border-wrap"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "460px",
          opacity: mounted ? 1 : 0,
          animation: mounted ? "card-entrance 0.8s cubic-bezier(0.16,1,0.3,1) forwards" : "none"
        }}
      >
        <div style={{
          background: "rgba(16, 16, 22, 0.65)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRadius: "26.5px",
          padding: "3rem 2.75rem",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* inner soft glow accents */}
          <div style={{
            position: "absolute", top: "-30%", right: "-20%", width: "60%", height: "60%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)",
            pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Logo */}
            <div className="animate-in" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "11px",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "800", fontSize: "1.1rem",
                boxShadow: "0 0 22px rgba(124,58,237,0.5)"
              }}>P</div>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", letterSpacing: "0.3px" }}>
                PlacePrep <span style={{ background: "linear-gradient(90deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
              </h2>
            </div>

            <h1 className="animate-in d1" style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 0.4rem 0", lineHeight: 1.15 }}>
              Welcome Back
            </h1>
            <p className="animate-in d1" style={{ color: "#9b9ba8", fontSize: "0.92rem", margin: "0 0 2rem 0" }}>
              Sign in to continue your placement journey.
            </p>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className={`animate-in d2 glass-field ${focusedField === "email" ? "focused" : ""}`} style={{
                borderRadius: "14px", marginBottom: "1.1rem", display: "flex", alignItems: "center", padding: "0 16px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" style={{ flexShrink: 0, marginRight: "10px" }}>
                  <path d="M4 4h16v16H4z" opacity="0" />
                  <path d="M3 7l9 6 9-6" />
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "white", fontSize: "0.95rem", padding: "15px 0"
                  }}
                  required
                />
              </div>

              {/* Password */}
              <div className={`animate-in d2 glass-field ${focusedField === "password" ? "focused" : ""}`} style={{
                borderRadius: "14px", marginBottom: "0.9rem", display: "flex", alignItems: "center", padding: "0 16px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" style={{ flexShrink: 0, marginRight: "10px" }}>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "white", fontSize: "0.95rem", padding: "15px 0"
                  }}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.7 18.7 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
                      <path d="M1 1l22 22" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="animate-in d3" style={{ textAlign: "right", marginBottom: "1.5rem" }}>
                <a href="#" style={{ color: "#a78bfa", fontSize: "0.82rem", textDecoration: "none", fontWeight: 600 }}>Forgot Password?</a>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="animate-in d4 glow-btn"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  width: "100%", padding: "16px", borderRadius: "14px", border: "none", cursor: "pointer",
                  background: isHovered
                    ? "linear-gradient(90deg, #6d28d9, #be185d)"
                    : "linear-gradient(90deg, #7c3aed, #ec4899)",
                  color: "white", fontSize: "1rem", fontWeight: "700",
                  boxShadow: isHovered
                    ? "0 0 34px rgba(124,58,237,0.65), 0 0 34px rgba(236,72,153,0.4)"
                    : "0 0 20px rgba(124,58,237,0.4)",
                  transition: "all 0.3s ease",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)"
                }}
              >
                Login →
              </button>
            </form>

            {/* Divider */}
            <div className="animate-in d5" style={{ display: "flex", alignItems: "center", gap: "14px", margin: "1.75rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ color: "#6b6b78", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>or continue with</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="animate-in d5 glass-field"
              style={{
                width: "100%", padding: "14px", borderRadius: "14px", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "10px", cursor: "pointer", fontSize: "0.92rem",
                fontWeight: "600", color: "white"
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="animate-in d6" style={{ textAlign: "center", marginTop: "1.75rem", color: "#9b9ba8", fontSize: "0.88rem" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: "700" }}>Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}