import { Link } from "react-router-dom";

const modules = [
  { icon: "⟨/⟩", label: "DSA Tracker", desc: "Track your progress on DSA sheets and improve problem-solving skills.", path: "/dsa", action: "Start Practicing", color: "#ff3f81" }, // Updated to brand pink
  { icon: "📄", label: "Resume Analyzer", desc: "Get AI-powered feedback and suggestions to improve your resume.", path: "/resume", action: "Analyze Now", color: "#7c3aed" }, // Brand purple
  { icon: "🎤", label: "Mock Interview", desc: "Practice real interviews with AI and get detailed feedback.", path: "/interview", action: "Start Interview", color: "#3b82f6" },
  { icon: "🧠", label: "Aptitude Quiz", desc: "Improve your aptitude skills with quizzes and track your scores.", path: "/quiz", action: "Take Quiz", color: "#f59e0b" },
  { icon: "🏢", label: "Company Q&A", desc: "Explore company-wise interview questions and experiences.", path: "/company", action: "Explore Now", color: "#10b981" },
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
          max-width: 1400px;
          color: white;
          font-family: 'Inter', sans-serif;
        }

        /* Reusable Glass Card Class to match Login screen */
        .glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.1);
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .glass-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.2);
        }

        .hero-banner {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 50px -15px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.1);
        }

        .hero-title {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .hero-desc {
          color: #9b9ba8;
          font-size: 15px;
          max-width: 480px;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
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
          background: rgba(255,255,255,0.05);
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
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .module-link-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: opacity 0.2s;
        }
        .module-link-btn:hover {
          opacity: 0.8;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateY(-50%) scale(1.1); }
        }

        /* MOBILE */
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .modules-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .home-container { padding: 1rem; }
          .hero-banner { padding: 1.5rem; border-radius: 18px; }
          .hero-title { font-size: 32px; }
          .modules-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .modules-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero Banner */}
      <div className="hero-banner">
        {/* Glowing Ambient Background Orbs */}
        <div style={{
          position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)",
          borderRadius: "50%", animation: "pulse-glow 4s ease-in-out infinite", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", right: "25%", top: "30%",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(255,63,129,0.15) 0%, transparent 60%)",
          borderRadius: "50%", animation: "pulse-glow 5s ease-in-out infinite reverse", pointerEvents: "none"
        }} />
        
        {/* Subtle Grid Overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.02, pointerEvents: "none",
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,255,255,0.05)", display: "inline-flex",
            alignItems: "center", gap: "8px",
            padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
            marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.1)"
          }}>
            <span>👋</span>
            <span style={{ color: "#e2e8f0" }}>Welcome back, {user?.name?.split(" ")[0] || "Student"}!</span>
          </div>
          
          <h1 className="hero-title">
            Accelerate Your<br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Placement Journey
            </span>
          </h1>
          
          <p className="hero-desc">
            AI-powered tools, real-time progress tracking and personalized practice to help you crack your dream company.
          </p>
          
          <div className="hero-buttons">
            <Link to="/dsa">
              <button className="brand-btn">
                Continue Learning →
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="glass-btn">
                View Progress
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem", display: "flex", gap: "14px", alignItems: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: `${stat.color}15`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", flexShrink: 0,
              border: `1px solid ${stat.color}30`,
              boxShadow: `0 0 15px ${stat.color}20`
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: "#9b9ba8", fontSize: "12px", fontWeight: "600", margin: "0 0 4px" }}>{stat.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "24px", fontWeight: "800", color: "white" }}>
                  {stat.label === "Daily Streak" ? streak : stat.value}
                </span>
                <span style={{ fontSize: "12px", color: "#6b6b78", fontWeight: "500" }}>{stat.total}</span>
              </div>
              <p style={{ color: "#10b981", fontSize: "11px", fontWeight: "600", margin: "4px 0 0" }}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Explore Learning Modules */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#fff", letterSpacing: "0.5px" }}>
        Explore Learning Modules
      </h2>
      <div className="modules-grid">
        {modules.map((mod, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: `${mod.color}15`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", marginBottom: "14px",
              border: `1px solid ${mod.color}30`,
              boxShadow: `0 0 15px ${mod.color}20`
            }}>
              {mod.icon}
            </div>
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "#fff" }}>{mod.label}</h3>
            <p style={{ color: "#9b9ba8", fontSize: "12px", lineHeight: "1.5", marginBottom: "16px", flex: 1 }}>{mod.desc}</p>
            <Link to={mod.path}>
              <button className="module-link-btn" style={{ color: mod.color }}>
                {mod.action} →
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="glass-card" style={{
        padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem",
        borderLeft: "4px solid #ff3f81" // Brand highlight on the left
      }}>
        <span style={{ fontSize: "36px", opacity: 0.3, flexShrink: 0, color: "#ff3f81", fontFamily: "serif", lineHeight: 1 }}>"</span>
        <div>
          <p style={{ color: "#e2e8f0", fontSize: "14px", fontStyle: "italic", lineHeight: "1.6", fontWeight: "500" }}>
            The only way to do great work is to love what you do. Keep coding, keep learning, keep growing.
          </p>
          <p style={{ color: "#9b9ba8", fontSize: "12px", marginTop: "8px", fontWeight: "600" }}>– Your future self will thank you.</p>
        </div>
      </div>

    </div>
  );
}