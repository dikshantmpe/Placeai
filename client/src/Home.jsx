import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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

export default function Home({ user }) {
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const [mounted, setMounted] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // --- BULLETPROOF NAME EXTRACTION ---
  // 1. Try Firebase Display Name
  // 2. Fallback to Email prefix (replacing dots/underscores with spaces)
  // 3. Fallback to default
  let rawName = "Aditya";
  if (user?.displayName) {
    rawName = user.displayName;
  } else if (user?.email) {
    rawName = user.email.split("@")[0].replace(/[._-]/g, " ");
  }

  // Optional: Clean up known aliases
  if (rawName.toLowerCase().includes("dikshant")) {
    rawName = "Aditya Singh";
  }

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
          color: 0xff3f81, 
          backgroundColor: 0x0a0812, 
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

  const stats = [
    { title: "DSA Problems", value: "0", sub: "/ 450", trend: "+0 this week", icon: "💻", color: "rgba(239, 68, 68, 0.15)", stroke: "#ef4444", textIcon: "↑" },
    { title: "Aptitude Quizzes", value: "0", sub: " Taken", trend: "+0 this week", icon: "🧠", color: "rgba(168, 85, 247, 0.15)", stroke: "#a855f7", textIcon: "↑" },
    { title: "Mock Interviews", value: "0", sub: " Completed", trend: "+0 this week", icon: "🎤", color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6", textIcon: "↑" },
    { title: "Daily Streak", value: streak, sub: " Days", trend: "Keep it up! 🔥", icon: "🔥", color: "rgba(245, 158, 11, 0.15)", stroke: "#f59e0b", textIcon: "" }
  ];

  return (
    <div style={{
      flex: 1,
      minHeight: "100vh",
      position: "relative",
      padding: "2.5rem 3rem",
      color: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      
      {/* Background Layer (Vanta) */}
      <div 
        ref={vantaRef} 
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }} 
      />
      
      {/* Gradient Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,8,18,0.75) 80%)"
      }} />

      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
          position: relative;
          z-index: 10;
        }

        .glass-panel {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.05);
        }

        .glass-panel:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .brand-btn {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(255,63,129,0.5);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .brand-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 30px -5px rgba(255,63,129,0.7);
        }

        @keyframes progress {
          0% { stroke-dasharray: 0 100; }
        }

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

      {/* Top Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", position: "relative", zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0 0 0.5rem 0", letterSpacing: "-0.5px" }}>
            Command Center
          </h1>
          <p style={{ color: "#9b9ba8", margin: 0, fontSize: "1rem" }}>Your AI-driven placement roadmap.</p>
        </div>
        
        {/* Profile Pill - CSS Capitalization Applied Here */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", 
          padding: "8px 16px", borderRadius: "100px"
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
          <span style={{ 
            fontSize: "0.85rem", 
            fontWeight: "600", 
            color: "#e2e8f0",
            textTransform: "capitalize" /* Forces Title Case via CSS */
          }}>
            {rawName} • Ready to work
          </span>
        </div>
      </header>

      {/* Bento Grid Container */}
      <div className="bento-grid">
        
        {/* 1. Main Hero Panel */}
        <div className="glass-panel bento-hero" style={{ gridColumn: "span 8", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "100%", background: "radial-gradient(ellipse at right, rgba(255,63,129,0.15), transparent 70%)", pointerEvents: "none" }} />
          
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "flex-start" }}>
            <div style={{ 
              display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(124,58,237,0.15)", 
              border: "1px solid rgba(124,58,237,0.3)", padding: "6px 12px", borderRadius: "8px", 
              color: "#a78bfa", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", 
              letterSpacing: "1px", marginBottom: "1.5rem" 
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              AI Placement Strategy
            </div>
            
            <h2 style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.1", margin: "0 0 1rem 0" }}>
              Accelerate Your <br/>
              <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Placement Journey
              </span>
            </h2>
            
            <p style={{ color: "#9b9ba8", fontSize: "1.05rem", maxWidth: "450px", lineHeight: "1.6", margin: "0 0 2.5rem 0" }}>
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
                  background: "rgba(255,255,255,0.05)", color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.1)", padding: "14px 28px", borderRadius: "12px",
                  fontWeight: "600", fontSize: "1rem", cursor: "pointer", transition: "background 0.2s"
                }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                  View Analytics
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Overall Progress Panel */}
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
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#ff3f81" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "white", lineHeight: "1" }}>
                35<span style={{ fontSize: "1.2rem", color: "#9b9ba8" }}>%</span>
              </span>
            </div>
          </div>
          
          <p style={{ color: "#9b9ba8", fontSize: "0.85rem", margin: "1.5rem 0 0 0", lineHeight: "1.5" }}>
            You are <strong style={{ color: "#ff7aab" }}>15% closer</strong> to your goal this week. Keep going!
          </p>
        </div>

        {/* 3. Small Stat Cards */}
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel bento-stat" style={{ gridColumn: "span 3", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px", background: stat.color, border: `1px solid ${stat.stroke}40`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: `0 0 15px ${stat.color}`
              }}>
                {stat.icon}
              </div>
            </div>
            <h4 style={{ color: "#9b9ba8", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 0.5rem 0", fontWeight: "600" }}>{stat.title}</h4>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "2rem", fontWeight: "800", color: "white" }}>{stat.value}</span>
              <span style={{ color: "#6b6b78", fontSize: "0.9rem", fontWeight: "600" }}>{stat.sub}</span>
            </div>
            <div style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: "600", marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
               <span style={{ fontSize: "1rem" }}>{stat.textIcon}</span>
               {stat.trend}
            </div>
          </div>
        ))}

        {/* 4. Actionable Next Steps */}
        <div style={{ gridColumn: "span 12", marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: "800", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "4px", height: "20px", background: "#ff3f81", borderRadius: "4px" }} />
            AI Recommended For You
          </h3>
          
          <div className="action-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            
            <Link to="/dsa" className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "8px 12px", borderRadius: "8px", color: "#fca5a5", fontSize: "0.8rem", fontWeight: "700" }}>HIGH PRIORITY</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6b78" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <h4 style={{ color: "white", fontSize: "1.1rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Mastering Arrays</h4>
              <p style={{ color: "#9b9ba8", fontSize: "0.9rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>You missed 2 questions on Two Pointers yesterday. Review this pattern to boost your DSA score.</p>
              <div style={{ marginTop: "auto", color: "#ff7aab", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                Start Module <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>

            <Link to="/resume" className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "8px 12px", borderRadius: "8px", color: "#93c5fd", fontSize: "0.8rem", fontWeight: "700" }}>QUICK WIN</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6b78" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <h4 style={{ color: "white", fontSize: "1.1rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Scan Your Resume</h4>
              <p style={{ color: "#9b9ba8", fontSize: "0.9rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>Upload your latest PDF to check ATS compatibility and get AI formatting feedback.</p>
              <div style={{ marginTop: "auto", color: "#93c5fd", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                Analyze Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>

            <Link to="/interview" className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(168, 85, 247, 0.1)", padding: "8px 12px", borderRadius: "8px", color: "#d8b4fe", fontSize: "0.8rem", fontWeight: "700" }}>PRACTICE</div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6b78" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <h4 style={{ color: "white", fontSize: "1.1rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Behavioral Mock</h4>
              <p style={{ color: "#9b9ba8", fontSize: "0.9rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>Practice the "Tell me about yourself" pitch with our voice AI before real interviews.</p>
              <div style={{ marginTop: "auto", color: "#d8b4fe", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                Start Interview <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}