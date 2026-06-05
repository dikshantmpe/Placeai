import { Link } from "react-router-dom";

const modules = [
  { icon: "⟨/⟩", label: "DSA Tracker", desc: "Track your progress on DSA sheets and improve problem-solving skills.", path: "/dsa", action: "Start Practicing", color: "#dc2626" },
  { icon: "📄", label: "Resume Analyzer", desc: "Get AI-powered feedback and suggestions to improve your resume.", path: "/resume", action: "Analyze Now", color: "#7c3aed" },
  { icon: "🎤", label: "Mock Interview", desc: "Practice real interviews with AI and get detailed feedback.", path: "/interview", action: "Start Interview", color: "#2563eb" },
  { icon: "🧠", label: "Aptitude Quiz", desc: "Improve your aptitude skills with quizzes and track your scores.", path: "/quiz", action: "Take Quiz", color: "#d97706" },
  { icon: "🏢", label: "Company Q&A", desc: "Explore company-wise interview questions and experiences.", path: "/company", action: "Explore Now", color: "#059669" },
];

export default function Home({ user }) {
  return (
    <div style={{ padding: "2rem" }}>

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 50%, #1a0a0a 100%)",
        borderRadius: "16px", padding: "3rem", marginBottom: "2rem",
        position: "relative", overflow: "hidden", minHeight: "220px",
        border: "1px solid #2d1a1a", display: "flex", alignItems: "center"
      }}>
        {/* Red glow effect */}
        <div style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)",
          width: "300px", height: "300px", background: "radial-gradient(circle, rgba(220,38,38,0.3) 0%, transparent 70%)",
          borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", display: "inline-block",
            padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
            marginBottom: "16px", backdropFilter: "blur(10px)" }}>
            Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
          </div>
          <h1 style={{ fontSize: "42px", fontWeight: "800", lineHeight: "1.2", marginBottom: "12px" }}>
            Accelerate Your<br />
            <span style={{ color: "#dc2626" }}>Placement Journey</span>
          </h1>
          <p style={{ color: "#999", fontSize: "15px", maxWidth: "450px", marginBottom: "24px", lineHeight: "1.6" }}>
            AI-powered tools, real-time progress tracking and personalized practice to help you crack your dream company.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/dsa">
              <button style={{ background: "#dc2626", color: "white", border: "none",
                padding: "12px 24px", borderRadius: "8px", cursor: "pointer",
                fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                Continue Learning →
              </button>
            </Link>
            <Link to="/dashboard">
              <button style={{ background: "transparent", color: "white",
                border: "1px solid #444", padding: "12px 24px", borderRadius: "8px",
                cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                View Progress
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "2rem" }}>
        {[
          { icon: "⟨/⟩", label: "DSA Problems Solved", value: "0", total: "/ 25", sub: "Start solving!", color: "#dc2626" },
          { icon: "🧠", label: "Aptitude Quizzes", value: "0", total: "Taken", sub: "Take your first quiz!", color: "#7c3aed" },
          { icon: "🎤", label: "Mock Interviews", value: "0", total: "Completed", sub: "Practice today!", color: "#2563eb" },
          { icon: "🔥", label: "Daily Streak", value: parseInt(localStorage.getItem("streak") || "0"), total: "Days", sub: "Keep it up! 🔥", color: "#d97706" },
        ].map((stat, i) => (
          <div key={i} style={{ background: "#111", border: "1px solid #222",
            borderRadius: "12px", padding: "20px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px",
              background: `${stat.color}22`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: "#666", fontSize: "12px", margin: "0 0 4px" }}>{stat.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "24px", fontWeight: "700", color: stat.color }}>{stat.value}</span>
                <span style={{ fontSize: "13px", color: "#666" }}>{stat.total}</span>
              </div>
              <p style={{ color: "#22c55e", fontSize: "11px", margin: "2px 0 0" }}>{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Explore Learning Modules */}
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "1rem" }}>
        Explore Learning Modules
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "2rem" }}>
        {modules.map((mod, i) => (
          <div key={i} style={{ background: "#111", border: "1px solid #222",
            borderRadius: "12px", padding: "20px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px",
              background: `${mod.color}22`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", marginBottom: "12px" }}>
              {mod.icon}
            </div>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>{mod.label}</h3>
            <p style={{ color: "#666", fontSize: "12px", lineHeight: "1.5", marginBottom: "16px" }}>{mod.desc}</p>
            <Link to={mod.path}>
              <button style={{ background: "transparent", color: mod.color, border: "none",
                padding: 0, cursor: "pointer", fontSize: "13px", fontWeight: "600",
                display: "flex", alignItems: "center", gap: "6px" }}>
                {mod.action} →
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px",
        padding: "2rem", textAlign: "center", borderLeft: "4px solid #dc2626" }}>
        <p style={{ color: "#ccc", fontSize: "16px", fontStyle: "italic", lineHeight: "1.8" }}>
          "The only way to do great work is to love what you do. Keep coding, keep learning, keep growing."
        </p>
        <p style={{ color: "#666", fontSize: "13px", marginTop: "8px" }}>– Your future self will thank you.</p>
      </div>
    </div>
  );
}