import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RightSidebar({ user }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [dsaProgress, setDsaProgress] = useState({ done: 0, total: 0, percent: 0 });
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const today = new Date().toISOString().split("T")[0];
  const dsaDone = localStorage.getItem(`dsa_${today}`) === "true";
  const quizDone = localStorage.getItem(`quiz_${today}`) === "true";

  // Countdown to midnight
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch DSA progress
  useEffect(() => {
    axios.get("https://placeai-sqjj.onrender.com/api/dashboard")
      .then(res => setDsaProgress(res.data.dsa))
      .catch(() => {});
  }, []);

  const achievements = [
    { icon: "🏆", label: "DSA Master", desc: "Solved 200 problems", color: "#f59e0b", unlocked: dsaProgress.done >= 200 },
    { icon: "🧠", label: "Quiz Whiz", desc: "Scored 90% in 5 quizzes", color: "#7c3aed", unlocked: false },
    { icon: "🎤", label: "Interview Pro", desc: "Completed 5 mock interviews", color: "#2563eb", unlocked: false },
    { icon: "🔥", label: "Consistent", desc: "10 day streak achieved", color: "#f97316", unlocked: streak >= 10 },
  ];

  return (
    <div style={{
      width: "280px", minHeight: "100vh", background: "#0d0d0d",
      borderLeft: "1px solid #1a1a1a", position: "fixed",
      right: 0, top: 0, zIndex: 100, overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "0"
    }}>{/* Top Bar */}
<div style={{
  padding: "16px", borderBottom: "1px solid #1a1a1a",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  position: "sticky", top: 0, background: "#0d0d0d", zIndex: 10
}}>
  {/* Notification Bell */}
  <div style={{ position: "relative", cursor: "pointer" }}>
    <div style={{
      width: "36px", height: "36px", borderRadius: "10px",
      background: "#111", border: "1px solid #1f1f1f",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
    }}>🔔</div>
    <div style={{
      position: "absolute", top: "-4px", right: "-4px",
      width: "16px", height: "16px", borderRadius: "50%",
      background: "#dc2626", fontSize: "9px", color: "white",
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700"
    }}>3</div>
  </div>

  {/* Profile */}
  <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
    <div style={{ textAlign: "right" }}>
      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "white" }}>
        {user?.name?.split(" ")[0] || "User"}
      </p>
      <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>View Profile</p>
    </div>
    {user?.avatar
      ? <img src={user.avatar} alt="avatar"
          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover",
            border: "2px solid #dc2626" }} />
      : <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "#dc2626", color: "white", fontSize: "13px", fontWeight: "700",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #dc262655"
        }}>
          {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
        </div>
    }
  </Link>
</div>
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Your Progress */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Your Progress</h3>
            <Link to="/dashboard" style={{ fontSize: "11px", color: "#dc2626" }}>View All</Link>
          </div>

          {/* Circle Progress */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ position: "relative", width: "90px", height: "90px" }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="#1f1f1f" strokeWidth="8" />
                <circle cx="45" cy="45" r="38" fill="none" stroke="#dc2626" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - dsaProgress.percent / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 45 45)"
                  style={{ transition: "stroke-dashoffset 0.6s" }} />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>{dsaProgress.percent}%</span>
                <span style={{ fontSize: "9px", color: "#555" }}>Overall</span>
              </div>
            </div>
          </div>

          {/* Progress bars */}
          {[
            { label: "DSA Progress", value: dsaProgress.percent, color: "#dc2626" },
            { label: "Aptitude Score", value: 76, color: "#7c3aed" },
            { label: "Mock Interviews", value: 82, color: "#2563eb" },
            { label: "Daily Streak", value: Math.min(streak * 10, 100), color: "#f97316" },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "#888" }}>{item.label}</span>
                <span style={{ fontSize: "11px", color: item.color, fontWeight: "600" }}>
                  {item.label === "Daily Streak" ? `${streak} Days` : `${item.value}%`}
                </span>
              </div>
              <div style={{ background: "#1f1f1f", borderRadius: "4px", height: "4px" }}>
                <div style={{
                  width: `${item.value}%`, background: item.color,
                  height: "4px", borderRadius: "4px", transition: "width 0.5s"
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Daily Challenge Timer */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>🔥 Daily Challenge</h3>
            <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "600",
              background: "rgba(220,38,38,0.1)", padding: "3px 8px", borderRadius: "6px",
              border: "1px solid rgba(220,38,38,0.2)" }}>
              ⏱ {timeLeft}
            </span>
          </div>

          {[
            { label: "DSA Challenge", tag: "Medium", desc: "Binary Tree Maximum Path Sum", done: dsaDone },
            { label: "Aptitude Challenge", tag: "Easy", desc: "Profit and Loss Problems", done: quizDone },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#161616", border: "1px solid #2a2a2a",
              borderRadius: "10px", padding: "12px", marginBottom: "8px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#ddd" }}>{item.label}</span>
                  <span style={{
                    fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
                    background: item.tag === "Easy" ? "#22c55e18" : "#f59e0b18",
                    color: item.tag === "Easy" ? "#22c55e" : "#f59e0b",
                    border: `1px solid ${item.tag === "Easy" ? "#22c55e33" : "#f59e0b33"}`
                  }}>{item.tag}</span>
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>{item.desc}</p>
              </div>
              <Link to="/daily">
                <button style={{
                  background: item.done ? "#22c55e18" : "#dc2626",
                  color: item.done ? "#22c55e" : "white",
                  border: item.done ? "1px solid #22c55e33" : "none",
                  padding: "6px 12px", borderRadius: "6px",
                  cursor: "pointer", fontSize: "11px", fontWeight: "600", marginLeft: "8px", flexShrink: 0
                }}>
                  {item.done ? "Done ✅" : "Solve"}
                </button>
              </Link>
            </div>
          ))}

          <Link to="/daily" style={{ display: "block", textAlign: "center",
            color: "#555", fontSize: "12px", marginTop: "8px" }}>
            View All Challenges →
          </Link>
        </div>

        {/* Recent Achievements */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Recent Achievements</h3>
            <span style={{ fontSize: "11px", color: "#dc2626" }}>View All</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {achievements.map((a, i) => (
              <div key={i} style={{
                background: a.unlocked ? `${a.color}10` : "#161616",
                border: `1px solid ${a.unlocked ? a.color + "33" : "#2a2a2a"}`,
                borderRadius: "10px", padding: "12px", textAlign: "center",
                opacity: a.unlocked ? 1 : 0.5, transition: "all 0.2s"
              }}>
                <p style={{ margin: "0 0 6px", fontSize: "24px",
                  filter: a.unlocked ? "none" : "grayscale(1)" }}>{a.icon}</p>
                <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "600",
                  color: a.unlocked ? a.color : "#555" }}>{a.label}</p>
                <p style={{ margin: 0, fontSize: "10px", color: "#444", lineHeight: "1.4" }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}