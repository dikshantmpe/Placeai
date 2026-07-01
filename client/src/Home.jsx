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
          /* FIX: Fluid boundaries prevent overlapping with sidebars */
          padding: 1.5rem;
          width: 100%;
          min-width: 0; /* Prevents flex blowouts */
          box-sizing: border-box;
          color: white;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          overflow-x: hidden;
        }

        /* High-Contrast Glass Cards */
        .glass-card {
          background: linear-gradient(145deg, rgba(20, 15, 25, 0.7), rgba(10, 8, 15, 0.9));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .glass-card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.1);
        }

        .hero-banner {
          background: linear-gradient(135deg, rgba(12, 10, 20, 0.8), rgba(20, 10, 25, 0.9));
          border-radius: 20px;
          padding: 3rem 2.5rem;
          position: relative;
          border: 1px solid rgba(255, 63, 129, 0.2);
          box-shadow: 0 20px 50px -15px rgba(0,0,0,0.6), inset 0 0 20px rgba(124,58,237,0.1);
          overflow: hidden;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
        }

        .hero-desc {
          color: #9b9ba8;
          font-size: 1rem;
          max-width: 500px;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .brand-btn {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(255,63,129,0.3);
          transition: all 0.3s ease;
        }
        .brand-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(124,58,237,0.5), 0 0 30px rgba(255,63,129,0.4);
        }

        .glass-btn {
          background: rgba(255,255,255,0.03);
          color: white;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .glass-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.3);
        }

        /* FIX: Auto-fit grids dynamically adjust to prevent clipping */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .module-link-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .module-link-btn:hover {
          opacity: 0.8;
          transform: translateX(4px);
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      {/* Hero Banner */}
      <div className="hero-banner">
        {/* Animated Tech Background */}
        <div style={{
          position: "absolute", right: "-10%", top: "-50%",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", right: "10%", bottom: "-20%",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(255,63,129,0.1) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none"
        }} />
        
        {/* Subtle Cyber Grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "30px 30px"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,63,129,0.1)", display: "inline-flex",
            alignItems: "center", gap: "8px",
            padding: "8px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
            marginBottom: "1.5rem", border: "1px solid rgba(255,63,129,0.3)",
            color: "#ff7aab", letterSpacing: "0.5px", textTransform: "uppercase"
          }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", background: "#ff3f81", borderRadius: "50%", boxShadow: "0 0 10px #ff3f81" }}></span>
            Welcome back, {user?.name?.split(" ")[0] || "Aditya"}
          </div>
          
          <h1 className="hero-title">
            Accelerate Your<br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Placement Journey
            </span>
          </h1>
          
          <p className="hero-desc">
            Your personalized command center. Leverage AI-powered tools, track real-time progress, and master your technical skills to crack your dream company.
          </p>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/dsa">
              <button className="brand-btn">
                Start Practicing →
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="glass-btn">
                View Analytics
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{
              width: "50px", height: "50px", borderRadius: "14px",
              background: `linear-gradient(135deg, ${stat.color}15, transparent)`, 
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", flexShrink: 0,
              border: `1px solid ${stat.color}40`,
              boxShadow: `0 0 20px ${stat.color}15`, color: stat.color
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: "#8b8b9a", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px" }}>
                {stat.label}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "26px", fontWeight: "800", color: "white", lineHeight: 1 }}>
                  {stat.label === "Daily Streak" ? streak : stat.value}
                </span>
                <span style={{ fontSize: "13px", color: "#6b6b78", fontWeight: "600" }}>{stat.total}</span>
              </div>
              <p style={{ color: "#10b981", fontSize: "12px", fontWeight: "600", margin: "6px 0 0" }}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Explore Learning Modules */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "24px", height: "3px", background: "linear-gradient(90deg, #ff3f81, transparent)", borderRadius: "2px" }}></span>
          Explore Modules
        </h2>
        
        <div className="modules-grid">
          {modules.map((mod, i) => (
            <div key={i} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
              {/* Dynamic Top Gradient Line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${mod.color}, transparent)` }} />
              
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: `${mod.color}10`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "20px", marginBottom: "1rem",
                border: `1px solid ${mod.color}30`, color: mod.color
              }}>
                {mod.icon}
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "#fff" }}>{mod.label}</h3>
              <p style={{ color: "#9b9ba8", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px", flex: 1 }}>{mod.desc}</p>
              
              <Link to={mod.path} style={{ textDecoration: "none" }}>
                <button className="module-link-btn" style={{ color: mod.color }}>
                  {mod.action} 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="glass-card" style={{
        padding: "1.5rem 2rem", display: "flex", alignItems: "center", gap: "1.5rem",
        borderLeft: "4px solid #7c3aed" 
      }}>
        <div style={{ 
          width: "48px", height: "48px", borderRadius: "50%", background: "rgba(124,58,237,0.1)", 
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#a78bfa" 
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </div>
        <div>
          <p style={{ color: "#e2e8f0", fontSize: "15px", fontStyle: "italic", lineHeight: "1.6", fontWeight: "500", margin: "0 0 6px 0" }}>
            "The only way to do great work is to love what you do. Keep coding, keep learning, keep growing."
          </p>
          <p style={{ color: "#7c3aed", fontSize: "13px", fontWeight: "700", margin: 0, letterSpacing: "0.5px" }}>
            – SYSTEM_NOTE // Your future self will thank you.
          </p>
        </div>
      </div>

    </div>
  );
}