import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initVanta() {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js");
        if (cancelled || !vantaRef.current || vantaEffect.current) return;

        vantaEffect.current = window.VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xff3f81,
          backgroundColor: 0x14101f,
          points: 11.0,
          maxDistance: 22.0,
          spacing: 17.0,
          showDots: true,
        });
      } catch (err) {
        console.error("Failed to load Vanta background:", err);
      }
    }

    initVanta();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in...", email, password);
    navigate("/dashboard");
  };

  const features = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      title: "AI-Powered Tools",
      desc: "Resume Analyzer, Mock Interviews and more.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M17 7h4v4" />
        </svg>
      ),
      title: "Track & Improve",
      desc: "Smart progress tracking across all modules.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 2v4M16 2v4" />
        </svg>
      ),
      title: "Daily Challenges",
      desc: "Build consistency with daily DSA & Aptitude challenges.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
          <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      ),
      title: "Company Insights",
      desc: "Access company-wise questions and interview experiences.",
    },
  ];

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
      background: "#0c0a14",
      padding: "2rem"
    }}>
      <style>{`
        @keyframes border-glow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-entrance {
          0%   { opacity: 0; transform: translateY(40px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }

        .animate-in { animation: fade-in-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; } .d4 { animation-delay: 0.4s; }
        .d5 { animation-delay: 0.5s; } .d6 { animation-delay: 0.6s; }
        .d7 { animation-delay: 0.7s; } .d8 { animation-delay: 0.8s; }

        .glass-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .glass-field.focused {
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(255,63,129,0.18), 0 0 24px rgba(255,63,129,0.3);
        }

        .eye-btn {
          background: none; border: none; cursor: pointer; color: #8b8b9a;
          display: flex; align-items: center; justify-content: center;
          padding: 4px; transition: color 0.2s ease;
        }
        .eye-btn:hover { color: #ff7aab; }

        .glow-btn { position: relative; overflow: hidden; }
        .glow-btn::after {
          content: "";
          position: absolute;
          top: 0; left: -40%;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shimmer 3.2s ease-in-out infinite;
        }

        .gradient-border-wrap {
          position: relative;
          border-radius: 28px;
        }
        .gradient-border-wrap::before {
          content: "";
          position: absolute;
          inset: -1.5px;
          border-radius: 29.5px;
          background: linear-gradient(120deg, #7c3aed, #ff3f81, #f59e0b, #22d3ee, #7c3aed);
          background-size: 300% 300%;
          animation: border-glow 8s ease infinite;
          z-index: -1;
          padding: 1.5px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .feature-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 11px 0;
        }
        .feature-icon {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: rgba(255,63,129,0.1);
          border: 1px solid rgba(255,63,129,0.25);
          color: #ff7aab;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float-y 4.5s ease-in-out infinite;
        }

        .badge-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,63,129,0.1); border: 1px solid rgba(255,63,129,0.3);
          color: #ff9ec4; font-size: 0.75rem; font-weight: 600;
          padding: 6px 14px; border-radius: 999px;
        }

        input::placeholder { color: #6b6b78; }

        @media (max-width: 900px) {
          .login-card-inner { flex-direction: column !important; }
          .login-left-panel { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        }
      `}</style>

      {/* === Vanta.js animated network background === */}
      <div ref={vantaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(8,6,14,0.35) 75%)"
      }} />

      {/* === Main wide card === */}
      <div
        className="gradient-border-wrap"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "1080px",
          opacity: mounted ? 1 : 0,
          animation: mounted ? "card-entrance 0.8s cubic-bezier(0.16,1,0.3,1) forwards" : "none"
        }}
      >
        <div className="login-card-inner" style={{
          display: "flex",
          /* CHANGED: Neutral dark frosted glass gradient */
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01))",
          backdropFilter: "blur(20px) saturate(120%)",
          WebkitBackdropFilter: "blur(20px) saturate(120%)",
          borderRadius: "26.5px",
          /* CHANGED: Added inset shadow for the subtle white inner edge */
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7), inset 1.5px 1.5px 2px rgba(255, 255, 255, 0.15)",
          overflow: "hidden",
          minHeight: "640px"
        }}>

          {/* LEFT: overview / branding panel */}
          <div className="login-left-panel" style={{
            flex: "1.1",
            padding: "3.25rem 3rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            /* CHANGED: Removed the purple tint, made it transparent to let the main glass handle it */
            background: "transparent",
            borderRight: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div className="animate-in" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #7c3aed, #ff3f81)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "800", fontSize: "1rem",
                boxShadow: "0 0 20px rgba(255,63,129,0.4)"
              }}>P</div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700" }}>
                PlacePrep <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff7aab)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
              </h2>
            </div>

            <div className="animate-in d1 badge-pill" style={{ width: "fit-content", marginBottom: "1.4rem" }}>
              ✦ Your AI Placement Partner
            </div>

            <h1 className="animate-in d1" style={{ fontSize: "2.6rem", fontWeight: "800", lineHeight: "1.12", margin: "0 0 1.25rem 0" }}>
              Prepare Smarter.<br/>
              <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Get Placed Faster.
              </span>
            </h1>

            <p className="animate-in d2" style={{ color: "#a9a9b8", fontSize: "1rem", lineHeight: "1.6", maxWidth: "420px", marginBottom: "1.5rem" }}>
              All-in-one platform to track your progress, analyze your resume, practice interviews, and ace every placement challenge.
            </p>

            <div>
              {features.map((f, i) => (
                <div className={`animate-in d${Math.min(i + 3, 8)} feature-row`} key={i}>
                  <div className="feature-icon" style={{ animationDelay: `${i * 0.3}s` }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{f.title}</div>
                    <div style={{ color: "#9b9ba8", fontSize: "0.8rem", marginTop: "2px" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: login form */}
          <div style={{
            flex: "1",
            padding: "3.25rem 3rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            background: "rgba(255,255,255,0.015)"
          }}>
            <div style={{
              position: "absolute", top: "-20%", right: "-15%", width: "55%", height: "55%",
              /* CHANGED: Neutralized the pink radial glow to a subtle white/grey */
              background: "radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%)",
              pointerEvents: "none"
            }} />

            <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "400px", margin: "0 auto" }}>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7aab" strokeWidth="2" style={{ flexShrink: 0, marginRight: "10px" }}>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7aab" strokeWidth="2" style={{ flexShrink: 0, marginRight: "10px" }}>
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
                  <a href="#" style={{ color: "#ff7aab", fontSize: "0.82rem", textDecoration: "none", fontWeight: 600 }}>Forgot Password?</a>
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
                      ? "linear-gradient(90deg, #6d28d9, #c2185b)"
                      : "linear-gradient(90deg, #7c3aed, #ff3f81)",
                    color: "white", fontSize: "1rem", fontWeight: "700",
                    boxShadow: isHovered
                      ? "0 0 34px rgba(124,58,237,0.6), 0 0 34px rgba(255,63,129,0.4)"
                      : "0 0 20px rgba(255,63,129,0.35)",
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
                <Link to="/signup" style={{ color: "#ff7aab", textDecoration: "none", fontWeight: "700" }}>Sign Up</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}