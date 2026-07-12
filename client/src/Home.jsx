import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

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

const formatName = (name) => {
  if (!name) return "Guest";
  return name
    .split(/[^a-zA-Z0-9]+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
};

export default function Home({ user: propUser }) {
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const [mounted, setMounted] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const [firebaseUser, setFirebaseUser] = useState(propUser || null);

  // Tilt state for hero panel
  const [heroTilt, setHeroTilt] = useState({ rotateX: 0, rotateY: -6 });
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const heroPanelRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setFirebaseUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  let rawName = "Guest";
  if (firebaseUser?.displayName) {
    rawName = firebaseUser.displayName;
  } else if (firebaseUser?.email) {
    rawName = firebaseUser.email.split("@")[0];
  }
  const displayName = formatName(rawName);

  useEffect(() => {
    setMounted(true);
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
          color: 0x3b82f6,
          backgroundColor: 0x070b14,
          points: 10.0,
          maxDistance: 25.0,
          spacing: 18.0,
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

  // Hero tilt handlers
  const handleHeroEnter = useCallback(() => {
    setIsHeroHovered(true);
    setHeroTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const handleHeroMove = useCallback((e) => {
    if (!heroPanelRef.current || !isHeroHovered) return;
    const rect = heroPanelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;
    setHeroTilt({ rotateX, rotateY });
  }, [isHeroHovered]);

  const handleHeroLeave = useCallback(() => {
    setIsHeroHovered(false);
    setHeroTilt({ rotateX: 0, rotateY: -6 });
  }, []);

  const stats = [
    { title: "DSA Problems", value: "0", sub: "/ 450", trend: "+0 this week", icon: "💻", color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6", textIcon: "↑" },
    { title: "Aptitude Quizzes", value: "0", sub: " Taken", trend: "+0 this week", icon: "🧠", color: "rgba(139, 92, 246, 0.15)", stroke: "#8b5cf6", textIcon: "↑" },
    { title: "Mock Interviews", value: "0", sub: " Completed", trend: "+0 this week", icon: "🎤", color: "rgba(34, 197, 94, 0.15)", stroke: "#22c55e", textIcon: "↑" },
    { title: "Daily Streak", value: streak, sub: " Days", trend: "Keep it up! 🔥", icon: "🔥", color: "rgba(245, 158, 11, 0.15)", stroke: "#f59e0b", textIcon: "" }
  ];

  return (
    <div style={{
      flex: 1,
      minHeight: "100vh",
      position: "relative",
      padding: "2.5rem 3rem",
      color: "#ffffff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      background: "#070b14"
    }}>
      <style>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.03);
        }
        .glass-panel:hover {
          background: rgba(15, 23, 42, 0.7);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .stat-card {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          transform-style: preserve-3d;
        }
        .stat-card:hover {
          background: rgba(15, 23, 42, 0.65);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-6px) rotateX(-3deg) rotateY(3deg) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
        }
        .stat-card:hover .stat-icon {
          transform: translateZ(20px) scale(1.1);
        }
        .stat-icon {
          transition: transform 0.3s ease;
        }
        .brand-btn {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px -5px rgba(37, 99, 235, 0.4);
        }
        .brand-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -5px rgba(37, 99, 235, 0.6);
        }
        .hero-tilt {
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .action-card {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .action-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent);
          transform: skewX(-25deg);
          transition: left 0.6s ease;
          pointer-events: none;
        }
        .action-card:hover::before {
          left: 150%;
          transition: left 0.8s ease;
        }
        .action-card:hover {
          background: rgba(15, 23, 42, 0.65);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
        }
        .action-card:hover .action-arrow {
          transform: translateX(4px);
        }
        .action-arrow {
          transition: transform 0.3s ease;
        }
        @keyframes progress {
          0% { stroke-dasharray: 0 100; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .float-anim-d1 { animation: float 4s ease-in-out infinite; animation-delay: 0.5s; }
        .float-anim-d2 { animation: float 4s ease-in-out infinite; animation-delay: 1s; }
        .float-anim-d3 { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
        @media (max-width: 1200px) {
          .bento-hero { grid-column: span 12 !important; }
          .bento-progress { grid-column: span 12 !important; display: flex; flex-direction: row !important; align-items: center; justify-content: space-around; }
          .bento-stat { grid-column: span 6 !important; }
        }
        @media (max-width: 768px) {
          .bento-stat { grid-column: span 12 !important; }
          .action-card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div 
        ref={vantaRef} 
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }} 
      />
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 0%, rgba(30, 58, 138, 0.15) 0%, transparent 60%)"
      }} />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", position: "relative", zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
            Command Center
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>Your AI-driven placement roadmap.</p>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.08)", 
          padding: "8px 16px", borderRadius: "100px"
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#e2e8f0" }}>
            {displayName} • Ready to work
          </span>
        </div>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "1.5rem",
        position: "relative",
        zIndex: 10
      }}>

        <div style={{ gridColumn: "span 8", perspective: "1200px" }}>
          <div
            ref={heroPanelRef}
            onMouseEnter={handleHeroEnter}
            onMouseMove={handleHeroMove}
            onMouseLeave={handleHeroLeave}
            className="hero-tilt glass-panel"
            style={{
              position: "relative",
              overflow: "hidden",
              transform: `rotateX(${heroTilt.rotateX}deg) rotateY(${heroTilt.rotateY}deg) translateZ(0)`,
              willChange: "transform"
            }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "100%", background: "radial-gradient(ellipse at right, rgba(59,130,246,0.12), transparent 70%)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "flex-start" }}>
              <div style={{ 
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(59, 130, 246, 0.1)", 
                border: "1px solid rgba(59, 130, 246, 0.2)",
                padding: "6px 14px", borderRadius: "8px", 
                color: "#60a5fa", fontSize: "0.75rem", fontWeight: "700",
                textTransform: "uppercase", letterSpacing: "0.05em",
                marginBottom: "1.5rem" 
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                AI Placement Strategy
              </div>

              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.1", margin: "0 0 1rem 0" }}>
                Accelerate Your <br/>
                <span style={{ color: "#3b82f6" }}>Placement Journey</span>
              </h2>

              <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "450px", lineHeight: "1.6", margin: "0 0 2.5rem 0" }}>
                Your personalized AI command center. Leverage smart tools, track real-time progress, and master technical skills to crack your dream company.
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <Link to="/dsa" style={{ textDecoration: "none" }}>
                  <button className="brand-btn">
                    Start Practicing
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </Link>
                <Link to="/dashboard" style={{ textDecoration: "none" }}>
                  <button style={{
                    background: "rgba(15, 23, 42, 0.6)", color: "#e2e8f0",
                    border: "1px solid rgba(255, 255, 255, 0.1)", padding: "14px 28px", borderRadius: "12px",
                    fontWeight: "600", fontSize: "1rem", cursor: "pointer",
                    backdropFilter: "blur(8px)", transition: "all 0.2s ease"
                  }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                    View Analytics
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel bento-progress" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 2rem 0", color: "#e2e8f0" }}>Readiness Score</h3>

          <div style={{ position: "relative", width: "160px", height: "160px" }}>
            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" 
              />
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" stroke="url(#progressGradient)" strokeWidth="3" 
                strokeDasharray="35, 100" 
                style={{ animation: "progress 2s ease-out forwards" }} 
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "white", lineHeight: "1" }}>
                35<span style={{ fontSize: "1.2rem", color: "#64748b" }}>%</span>
              </span>
            </div>
          </div>

          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "1.5rem 0 0 0", lineHeight: "1.5" }}>
            You are <strong style={{ color: "#3b82f6" }}>15% closer</strong> to your goal this week. Keep going!
          </p>
        </div>

        {stats.map((stat, i) => {
          const floatClass = i === 0 ? "float-anim" : i === 1 ? "float-anim-d1" : i === 2 ? "float-anim-d2" : "float-anim-d3";
          return (
            <div key={i} className={`stat-card ${floatClass}`} style={{ gridColumn: "span 3" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div className="stat-icon" style={{
                  width: "42px", height: "42px", borderRadius: "12px",
                  background: stat.color, border: `1px solid ${stat.stroke}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", boxShadow: `0 0 15px ${stat.color}`
                }}>
                  {stat.icon}
                </div>
              </div>
              <h4 style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 0.5rem 0", fontWeight: "600" }}>{stat.title}</h4>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "2rem", fontWeight: "800", color: "white" }}>{stat.value}</span>
                <span style={{ color: "#475569", fontSize: "0.9rem", fontWeight: "600" }}>{stat.sub}</span>
              </div>
              <div style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: "600", marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                 <span style={{ fontSize: "1rem" }}>{stat.textIcon}</span>
                 {stat.trend}
              </div>
            </div>
          );
        })}

        <div style={{ gridColumn: "span 12", marginTop: "0.5rem" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "800", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "4px", height: "20px", background: "#3b82f6", borderRadius: "4px" }} />
            AI Recommended For You
          </h3>

          <div className="action-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>

            <Link to="/dsa" className="action-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "8px 12px", borderRadius: "8px", color: "#fca5a5", fontSize: "0.75rem", fontWeight: "700" }}>HIGH PRIORITY</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <h4 style={{ color: "white", fontSize: "1.05rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Mastering Arrays</h4>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>You missed 2 questions on Two Pointers yesterday. Review this pattern to boost your DSA score.</p>
              <div className="action-arrow" style={{ marginTop: "auto", color: "#3b82f6", fontSize: "0.88rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                Start Module <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>

            <Link to="/resume" className="action-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "8px 12px", borderRadius: "8px", color: "#93c5fd", fontSize: "0.75rem", fontWeight: "700" }}>QUICK WIN</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <h4 style={{ color: "white", fontSize: "1.05rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Scan Your Resume</h4>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>Upload your latest PDF to check ATS compatibility and get AI formatting feedback.</p>
              <div className="action-arrow" style={{ marginTop: "auto", color: "#3b82f6", fontSize: "0.88rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                Analyze Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>

            <Link to="/interview" className="action-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "8px 12px", borderRadius: "8px", color: "#d8b4fe", fontSize: "0.75rem", fontWeight: "700" }}>PRACTICE</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <h4 style={{ color: "white", fontSize: "1.05rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Behavioral Mock</h4>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>Practice the "Tell me about yourself" pitch with our voice AI before real interviews.</p>
              <div className="action-arrow" style={{ marginTop: "auto", color: "#8b5cf6", fontSize: "0.88rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                Start Interview <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
