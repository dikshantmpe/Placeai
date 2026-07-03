import { Link } from "react-router-dom";

const modules = [
  { icon: "⟨/⟩", label: "DSA Tracker", desc: "Track progress on DSA sheets and conquer problem-solving.", path: "/dsa", action: "Start Practicing", color: "#ff3f81" },
  { icon: "📄", label: "Resume Analyzer", desc: "Get AI-powered feedback to forge a top-tier resume.", path: "/resume", action: "Analyze Now", color: "#7c3aed" },
  { icon: "🎤", label: "Mock Interview", desc: "Practice real interviews with AI and get detailed metrics.", path: "/interview", action: "Start Interview", color: "#3b82f6" },
  { icon: "🧠", label: "Aptitude Quiz", desc: "Sharpen your logical reasoning and track your scores.", path: "/quiz", action: "Take Quiz", color: "#f59e0b" },
  { icon: "🏢", label: "Company Q&A", desc: "Unlock company-specific interview questions and archives.", path: "/company", action: "Explore Now", color: "#10b981" },
];

const stats = [
  { icon: "⟨/⟩", label: "DSA Problems Solved", value: "0", total: "/ 450", sub: "+0 this week", color: "#ff3f81" },
  { icon: "🧠", label: "Aptitude Quizzes", value: "0", total: "Taken", sub: "+0 this week", color: "#7c3aed" },
  { icon: "🎤", label: "Mock Interviews", value: "0", total: "Completed", sub: "+0 this week", color: "#3b82f6" },
  { icon: "🔥", label: "Daily Streak", value: 0, total: "Days", sub: "Keep it up! 🔥", color: "#f59e0b" },
];

export default function Home({ user }) {
  const streak = parseInt(localStorage.getItem("streak") || "0");

  return (
    <div className="home-container">
      <style>{`
        .home-container {
          padding: 1.5rem;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          color: white;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          overflow-x: hidden;
          position: relative;
        }

        /* Ambient Background Glowing Orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          pointer-events: none;
          z-index: 0;
          animation: float-orb 12s infinite ease-in-out alternate;
        }
        .orb-1 { top: -5%; left: -5%; width: 400px; height: 400px; background: rgba(124,58,237,0.3); }
        .orb-2 { bottom: 10%; right: -10%; width: 500px; height: 500px; background: rgba(255,63,129,0.25); animation-delay: -5s; }

        @keyframes float-orb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 40px) scale(1.1); }
        }

        /* Pure Glassmorphism Base */
        .glass-panel {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 15px 35px -10px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.15);
          position: relative;
          z-index: 1;
        }

        /* 3D Floating Hover Effects */
        .hover-3d {
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease, border-color 0.5s ease;
          overflow: hidden;
        }
        
        .hover-3d:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8), inset 1px 1px 3px rgba(255,255,255,0.3);
        }

        /* The signature diagonal shine sweep */
        .shine-effect::before {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-25deg);
          animation: shine-sweep 6s infinite;
          pointer-events: none;
        }

        @keyframes shine-sweep {
          0% { left: -150%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }

        /* Fluid Grids to prevent overlapping */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .brand-btn {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border: none;
          padding: 14px 30px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(255,63,129,0.3);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .brand-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124,58,237,0.5), 0 8px 30px rgba(255,63,129,0.5);
        }

        .glass-btn {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 30px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .glass-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .module-link-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        .module-card:hover .module-link-btn {
          gap: 12px; /* Arrow slides out on hover */
        }

        @media (max-width: 768px) {
          .home-container { padding: 1rem; gap: 1.5rem; }
          .ambient-orb { display: none; } /* Better performance on mobile */
        }
      `}</style>

      {/* Ambient Deep Space Orbs */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>

      {/* Hero Banner (Glass + Shine) */}
      <div className="glass-panel shine-effect" style={{ padding: "3rem 2.5rem", border: "1px solid rgba(255, 63, 129, 0.25)" }}>
        {/* Subtle Cyber Grid inside Hero */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none",
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,255,255,0.08)", display: "inline-flex",
            alignItems: "center", gap: "10px",
            padding: "8px 20px", borderRadius: "20px", fontSize: "13px", fontWeight: "700",
            marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)", letterSpacing: "0.5px", textTransform: "uppercase"
          }}>
            <span style={{ display: "inline-block", width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 10px #10b981" }}></span>
            Welcome back, {user?.name?.split(" ")[0] || "Aditya"}
          </div>
          
          <h1 style={{ fontSize: "3.2rem", fontWeight: "800", lineHeight: "1.1", marginBottom: "1rem", letterSpacing: "-1px" }}>
            Accelerate Your<br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto", animation: "gradient-shift 5s linear infinite" }}>
              Placement Journey
            </span>
          </h1>
          
          <p style={{ color: "#e2e8f0", fontSize: "1.05rem", maxWidth: "550px", marginBottom: "2.5rem", lineHeight: "1.6", fontWeight: "400" }}>
            Your personalized AI command center. Leverage smart tools, track real-time progress, and master your technical skills to crack your dream company.
          </p>
          
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Link to="/dsa">
              <button className="brand-btn shine-effect">
                Start Practicing 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="glass-btn">View Analytics</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating 3D Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel hover-3d" style={{ padding: "1.5rem", display: "flex", gap: "16px", alignItems: "center", borderRadius: "20px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: `linear-gradient(135deg, ${stat.color}25, rgba(0,0,0,0.2))`, 
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0,
              border: `1px solid ${stat.color}40`, boxShadow: `0 0 20px ${stat.color}20`, color: stat.color
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: "#9b9ba8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px" }}>
                {stat.label}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "28px", fontWeight: "800", color: "white", lineHeight: 1, filter: `drop-shadow(0 0 8px ${stat.color}40)` }}>
                  {stat.label === "Daily Streak" ? streak : stat.value}
                </span>
                <span style={{ fontSize: "13px", color: "#6b6b78", fontWeight: "600" }}>{stat.total}</span>
              </div>
              <p style={{ color: "#10b981", fontSize: "12px", fontWeight: "700", margin: "8px 0 0" }}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3D Module Cards */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "1.5rem", color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ width: "6px", height: "24px", background: "linear-gradient(180deg, #ff3f81, #7c3aed)", borderRadius: "4px" }}></span>
          Explore Modules
        </h2>
        
        <div className="modules-grid">
          {modules.map((mod, i) => (
            <div key={i} className="glass-panel hover-3d module-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", borderRadius: "20px" }}>
              {/* Top Accent Line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${mod.color}, transparent)` }} />
              
              <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                background: `${mod.color}15`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "22px", marginBottom: "1.25rem",
                border: `1px solid ${mod.color}30`, color: mod.color,
                boxShadow: `0 0 20px ${mod.color}20`
              }}>
                {mod.icon}
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "10px", color: "#fff" }}>{mod.label}</h3>
              <p style={{ color: "#9b9ba8", fontSize: "13px", lineHeight: "1.6", marginBottom: "24px", flex: 1, fontWeight: "500" }}>{mod.desc}</p>
              
              <Link to={mod.path} style={{ textDecoration: "none", marginTop: "auto" }}>
                <button className="module-link-btn" style={{ color: mod.color }}>
                  {mod.action} 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Banner */}
      <div className="glass-panel hover-3d shine-effect" style={{
        padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem",
        borderLeft: "6px solid #7c3aed", borderRadius: "20px"
      }}>
        <div style={{ 
          width: "56px", height: "56px", borderRadius: "50%", background: "rgba(124,58,237,0.15)", 
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#a78bfa",
          boxShadow: "0 0 20px rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.3)"
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </div>
        <div>
          <p style={{ color: "#fff", fontSize: "16px", fontStyle: "italic", lineHeight: "1.6", fontWeight: "600", margin: "0 0 8px 0" }}>
            "The only way to do great work is to love what you do. Keep coding, keep learning, keep growing."
          </p>
          <p style={{ color: "#a78bfa", fontSize: "13px", fontWeight: "800", margin: 0, letterSpacing: "1px", textTransform: "uppercase" }}>
            – SYSTEM_NOTE // Your future self will thank you.
          </p>
        </div>
      </div>

    </div>
  );
}