import { Link } from "react-router-dom";

const modules = [
  { icon: "⟨/⟩", label: "DSA Tracker", desc: "Track your progress on DSA sheets and improve problem-solving skills.", path: "/dsa", action: "Start Practicing", color: "#dc2626" },
  { icon: "📄", label: "Resume Analyzer", desc: "Get AI-powered feedback and suggestions to improve your resume.", path: "/resume", action: "Analyze Now", color: "#7c3aed" },
  { icon: "🎤", label: "Mock Interview", desc: "Practice real interviews with AI and get detailed feedback.", path: "/interview", action: "Start Interview", color: "#2563eb" },
  { icon: "🧠", label: "Aptitude Quiz", desc: "Improve your aptitude skills with quizzes and track your scores.", path: "/quiz", action: "Take Quiz", color: "#d97706" },
  { icon: "🏢", label: "Company Q&A", desc: "Explore company-wise interview questions and experiences.", path: "/company", action: "Explore Now", color: "#059669" },
];

const stats = [
  { icon: "⟨/⟩", label: "DSA Problems Solved", value: "0", total: "/ 450", sub: "+0 this week", color: "#dc2626" },
  { icon: "🧠", label: "Aptitude Quizzes", value: "0", total: "Taken", sub: "+0 this week", color: "#7c3aed" },
  { icon: "🎤", label: "Mock Interviews", value: "0", total: "Completed", sub: "+0 this week", color: "#2563eb" },
  { icon: "🔥", label: "Daily Streak", value: 0, total: "Days", sub: "Keep it up! 🔥", color: "#d97706" },
];

export default function Home({ user }) {
  const streak = parseInt(localStorage.getItem("streak") || "0");

  return (
    <div className="home-container">

      {/* Hero Banner */}
      <div className="hero-banner">
        <div style={{
          position: "absolute", right: "15%", top: "50%", transform: "translateY(-50%)",
          width: "350px", height: "350px",
          background: "radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)",
          borderRadius: "50%", animation: "pulse 3s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            background: "rgba(255,255,255,0.08)", display: "inline-flex",
            alignItems: "center", gap: "6px",
            padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
            marginBottom: "16px", border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <span>👋</span>
            <span>Welcome back, {user?.name?.split(" ")[0] || "Student"}!</span>
          </div>
          <h1 className="hero-title">
            Accelerate Your<br />
            <span style={{ color: "#dc2626" }}>Placement Journey</span>
          </h1>
          <p className="hero-desc">
            AI-powered tools, real-time progress tracking and personalized practice to help you crack your dream company.
          </p>
          <div className="hero-buttons">
            <Link to="/dsa">
              <button style={{
                background: "#dc2626", color: "white", border: "none",
                padding: "12px 24px", borderRadius: "10px", cursor: "pointer",
                fontSize: "14px", fontWeight: "600",
                boxShadow: "0 4px 20px rgba(220,38,38,0.4)"
              }}>
                Continue Learning →
              </button>
            </Link>
            <Link to="/dashboard">
              <button style={{
                background: "rgba(255,255,255,0.05)", color: "white",
                border: "1px solid rgba(255,255,255,0.15)", padding: "12px 24px", borderRadius: "10px",
                cursor: "pointer", fontSize: "14px", fontWeight: "600"
              }}>
                View Progress
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card"
            onMouseEnter={e => e.currentTarget.style.borderColor = stat.color + "55"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: `${stat.color}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", flexShrink: 0,
              border: `1px solid ${stat.color}33`
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: "#555", fontSize: "11px", margin: "0 0 4px" }}>{stat.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>
                  {stat.label === "Daily Streak" ? streak : stat.value}
                </span>
                <span style={{ fontSize: "12px", color: "#555" }}>{stat.total}</span>
              </div>
              <p style={{ color: "#22c55e", fontSize: "11px", margin: "2px 0 0" }}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Explore Learning Modules */}
      <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#fff" }}>
        Explore Learning Modules
      </h2>
      <div className="modules-grid">
        {modules.map((mod, i) => (
          <div key={i} className="module-card"
            onMouseEnter={e => { e.currentTarget.style.borderColor = mod.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1f1f1f"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: `${mod.color}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", marginBottom: "10px",
              border: `1px solid ${mod.color}33`
            }}>
              {mod.icon}
            </div>
            <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#fff" }}>{mod.label}</h3>
            <p style={{ color: "#555", fontSize: "11px", lineHeight: "1.5", marginBottom: "12px" }}>{mod.desc}</p>
            <Link to={mod.path}>
              <button style={{
                background: "transparent", color: mod.color, border: "none",
                padding: 0, cursor: "pointer", fontSize: "12px", fontWeight: "600"
              }}>
                {mod.action} →
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div style={{
        background: "linear-gradient(135deg, #111 0%, #1a0a0a 100%)",
        border: "1px solid #1f1f1f", borderRadius: "14px",
        padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem",
        borderLeft: "4px solid #dc2626", marginBottom: "2rem"
      }}>
        <span style={{ fontSize: "32px", opacity: 0.4, flexShrink: 0 }}>"</span>
        <div>
          <p style={{ color: "#aaa", fontSize: "13px", fontStyle: "italic", lineHeight: "1.7" }}>
            The only way to do great work is to love what you do. Keep coding, keep learning, keep growing.
          </p>
          <p style={{ color: "#555", fontSize: "12px", marginTop: "6px" }}>– Your future self will thank you.</p>
        </div>
      </div>

      <style>{`
        .home-container {
          padding: 1.5rem;
          max-width: 1400px;
        }

        .hero-banner {
          background: linear-gradient(135deg, #1a0505 0%, #2d0a0a 40%, #1a0a1a 100%);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
          border: 1px solid #2d1a1a;
        }

        .hero-title {
          font-size: 36px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 12px;
        }

        .hero-desc {
          color: #888;
          font-size: 14px;
          max-width: 420px;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: #111;
          border: 1px solid #1f1f1f;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: center;
          transition: border-color 0.2s;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .module-card {
          background: #111;
          border: 1px solid #1f1f1f;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
          cursor: pointer;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.1); }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .home-container {
            padding: 1rem;
          }

          .hero-banner {
            padding: 1.5rem;
            border-radius: 14px;
          }

          .hero-title {
            font-size: 28px;
          }

          .hero-desc {
            font-size: 13px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .stat-card {
            padding: 12px;
            gap: 10px;
          }

          .modules-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .module-card {
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
}