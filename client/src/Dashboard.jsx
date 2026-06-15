import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#dc2626", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#f59e0b"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const streak = parseInt(localStorage.getItem("streak") || "0");

  useEffect(() => {
    axios.get("https://placeai-sqjj.onrender.com/api/dashboard")
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ padding: "2rem", color: "#555", display: "flex", alignItems: "center", gap: "10px" }}>
      <span>⏳</span> Loading dashboard...
    </div>
  );

  if (!data) return (
    <div style={{ padding: "2rem", color: "#555" }}>
      ⚠️ Failed to load dashboard. Please refresh.
    </div>
  );

  const totalCompany = data.companyStats.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 4px" }}>Progress Dashboard</h2>
        <p style={{ color: "#555", margin: 0, fontSize: "13px" }}>Your overall placement preparation at a glance.</p>
      </div>

      {/* Top Stats */}
      <div className="stats-grid">
        {[
          { label: "DSA Progress", value: `${data.dsa.done}`, sub: `/ ${data.dsa.total} problems`, pct: data.dsa.percent, color: "#dc2626", icon: "⟨/⟩" },
          { label: "Quiz Questions", value: data.quiz.total, sub: "available", pct: 100, color: "#7c3aed", icon: "🧠" },
          { label: "Company Questions", value: totalCompany, sub: "across companies", pct: 80, color: "#2563eb", icon: "🏢" },
          { label: "Daily Streak", value: streak, sub: "days", pct: Math.min(streak * 10, 100), color: "#d97706", icon: "🔥" },
        ].map((s, i) => (
          <div key={i} className="stat-card"
            onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "55"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>{s.label}</p>
              <div style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: `${s.color}18`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "14px", border: `1px solid ${s.color}33`
              }}>{s.icon}</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "24px", fontWeight: "700", color: "white" }}>{s.value}</span>
              <span style={{ fontSize: "11px", color: "#555" }}>{s.sub}</span>
            </div>
            <div style={{ background: "#1f1f1f", borderRadius: "4px", height: "4px", marginTop: "8px" }}>
              <div style={{ width: `${s.pct}%`, background: s.color, height: "4px", borderRadius: "4px" }} />
            </div>
            <p style={{ color: s.color, fontSize: "11px", margin: "4px 0 0" }}>{s.pct}% complete</p>
          </div>
        ))}
      </div>

      {/* DSA + Pie */}
      <div className="charts-grid">

        {/* DSA Progress by Topic */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "14px", fontWeight: "600" }}>DSA Progress by Topic</h3>
          {data.dsaByTopic.map((t, i) => (
            <div key={t.topic} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                <span style={{ color: "#ccc" }}>{t.topic}</span>
                <span style={{ color: "#555" }}>{t.done}/{t.total} ({t.percent}%)</span>
              </div>
              <div style={{ background: "#1f1f1f", borderRadius: "6px", height: "5px" }}>
                <div style={{
                  width: `${t.percent}%`,
                  background: COLORS[i % COLORS.length],
                  height: "5px", borderRadius: "6px", transition: "width 0.5s"
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "14px", fontWeight: "600" }}>Company-wise Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.companyStats} dataKey="count" nameKey="company"
                cx="50%" cy="50%" outerRadius={80} innerRadius={35}>
                {data.companyStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
            {data.companyStats.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: "#888" }}>{c.company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.25rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "14px", fontWeight: "600" }}>DSA Solved by Topic</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.dsaByTopic} barGap={4}>
            <XAxis dataKey="topic" tick={{ fontSize: 10, fill: "#555" }} axisLine={{ stroke: "#222" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "12px" }} />
            <Bar dataKey="done" fill="#dc2626" radius={[4, 4, 0, 0]} name="Solved" />
            <Bar dataKey="total" fill="#2a2a2a" radius={[4, 4, 0, 0]} name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .dashboard-container {
          padding: 1.5rem;
          max-width: 1200px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-card {
          background: #111;
          border: 1px solid #1f1f1f;
          border-radius: 12px;
          padding: 16px;
          transition: border-color 0.2s;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .stat-card {
            padding: 12px;
          }

          .charts-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}