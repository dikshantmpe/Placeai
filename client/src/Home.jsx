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
    <div style={{ padding: "2rem", maxWidth: "1400px" }}>

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1a0505 0%, #2d0a0a 40%, #1a0a1a 100%)",
        borderRadius: "20px", padding: "3rem", marginBottom: "1.5rem",
        position: "relative", overflow: "hidden", minHeight: "260px",
        border: "1px solid #2d1a1a", display: "flex", alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Animated glow */}
        <div style={{
          position: "absolute", right: "15%", top: "50%", transform: "translateY(-50%)",
          width: "350px", height: "350px",
          background: "radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)",
          borderRadius: "50%", animation: "pulse 3s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", right: "25%", top: "30%",
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "550px" }}>
          <div style={{
            background: "rgba(255,255,255,0.08)", display: "inline-flex",
            alignItems: "center", gap: "6px",
            padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
            marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <span>👋</span>
            <span>Welcome back, {user?.name?.split(" ")[0] || "Student"}!</span>
          </div>
          <h1 style={{ fontSize: "46px", fontWeight: "800", lineHeight: "1.15", marginBottom: "16px" }}>
            Accelerate Your<br />
            <span style={{ color: "#dc2626" }}>Placement Journey</span>
          </h1>
          <p style={{ color: "#888", fontSize: "15px", maxWidth: "420px", marginBottom: "28px", lineHeight: "1.7" }}>
            AI-powered tools, real-time progress tracking and personalized practice to help you crack your dream company.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/dsa">
              <button style={{
                background: "#dc2626", color: "white", border: "none",
                padding: "12px 28px", borderRadius: "10px", cursor: "pointer",
                fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 4px 20px rgba(220,38,38,0.4)"
              }}>
                Continue Learning →
              </button>
            </Link>
            <Link to="/dashboard">
              <button style={{
                background: "rgba(255,255,255,0.05)", color: "white",
                border: "1px solid rgba(255,255,255,0.15)", padding: "12px 28px", borderRadius: "10px",
                cursor: "pointer", fontSize: "14px", fontWeight: "600",
                backdropFilter: "blur(10px)"
              }}>
                View Progress
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "2rem" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "14px", padding: "20px", display: "flex", gap: "16px", alignItems: "center",
            transition: "border-color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = stat.color + "55"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
          >
            <div style={{
              width: "50px", height: "50px", borderRadius: "12px",
              background: `${stat.color}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", flexShrink: 0,
              border: `1px solid ${stat.color}33`
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: "#555", fontSize: "12px", margin: "0 0 4px" }}>{stat.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "26px", fontWeight: "700", color: "white" }}>
                  {stat.label === "Daily Streak" ? streak : stat.value}
                </span>
                <span style={{ fontSize: "13px", color: "#555" }}>{stat.total}</span>
              </div>
              <p style={{ color: "#22c55e", fontSize: "11px", margin: "2px 0 0" }}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Explore Learning Modules */}
      <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "1rem", color: "#fff" }}>
        Explore Learning Modules
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "2rem" }}>
        {modules.map((mod, i) => (
          <div key={i} style={{
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "14px", padding: "20px", transition: "all 0.2s",
            cursor: "pointer"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = mod.color + "55"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1f1f1f"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{
              width: "42px", height: "42px", borderRadius: "10px",
              background: `${mod.color}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", marginBottom: "14px",
              border: `1px solid ${mod.color}33`
            }}>
              {mod.icon}
            </div>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#fff" }}>{mod.label}</h3>
            <p style={{ color: "#555", fontSize: "12px", lineHeight: "1.6", marginBottom: "16px" }}>{mod.desc}</p>
            <Link to={mod.path}>
              <button style={{
                background: "transparent", color: mod.color, border: "none",
                padding: 0, cursor: "pointer", fontSize: "13px", fontWeight: "600",
                display: "flex", alignItems: "center", gap: "4px"
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
        padding: "2rem 2.5rem", display: "flex", alignItems: "center", gap: "1.5rem",
        borderLeft: "4px solid #dc2626"
      }}>
        <span style={{ fontSize: "40px", opacity: 0.4 }}>"</span>
        <div>
          <p style={{ color: "#aaa", fontSize: "15px", fontStyle: "italic", lineHeight: "1.8" }}>
            The only way to do great work is to love what you do. Keep coding, keep learning, keep growing.
          </p>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "8px" }}>– Your future self will thank you.</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}