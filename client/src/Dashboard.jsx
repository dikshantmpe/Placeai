import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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
    <div style={{ padding: "2rem", maxWidth: "1200px" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}>Progress Dashboard</h2>
        <p style={{ color: "#555", margin: 0, fontSize: "14px" }}>Your overall placement preparation at a glance.</p>
      </div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "2rem" }}>
        {[
          { label: "DSA Progress", value: `${data.dsa.done}`, sub: `/ ${data.dsa.total} problems`, pct: data.dsa.percent, color: "#dc2626", icon: "⟨/⟩" },
          { label: "Quiz Questions", value: data.quiz.total, sub: "available", pct: 100, color: "#7c3aed", icon: "🧠" },
          { label: "Company Questions", value: totalCompany, sub: "across all companies", pct: 80, color: "#2563eb", icon: "🏢" },
          { label: "Daily Streak", value: streak, sub: "days", pct: Math.min(streak * 10, 100), color: "#d97706", icon: "🔥" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "20px",
            transition: "border-color 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "55"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>{s.label}</p>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: `${s.color}18`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "16px", border: `1px solid ${s.color}33`
              }}>{s.icon}</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "28px", fontWeight: "700", color: "white" }}>{s.value}</span>
              <span style={{ fontSize: "12px", color: "#555" }}>{s.sub}</span>
            </div>
            <div style={{ background: "#1f1f1f", borderRadius: "4px", height: "4px", marginTop: "10px" }}>
              <div style={{ width: `${s.pct}%`, background: s.color, height: "4px", borderRadius: "4px", transition: "width 0.6s" }} />
            </div>
            <p style={{ color: s.color, fontSize: "11px", margin: "6px 0 0" }}>{s.pct}% complete</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

        {/* DSA Progress by Topic */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "15px", fontWeight: "600" }}>DSA Progress by Topic</h3>
          {data.dsaByTopic.map((t, i) => (
            <div key={t.topic} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                <span style={{ color: "#ccc" }}>{t.topic}</span>
                <span style={{ color: "#555" }}>{t.done}/{t.total} ({t.percent}%)</span>
              </div>
              <div style={{ background: "#1f1f1f", borderRadius: "6px", height: "6px" }}>
                <div style={{
                  width: `${t.percent}%`,
                  background: COLORS[i % COLORS.length],
                  height: "6px", borderRadius: "6px", transition: "width 0.5s"
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "15px", fontWeight: "600" }}>Company-wise Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.companyStats} dataKey="count" nameKey="company"
                cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                label={({ company, percent }) => `${company} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#333" }}>
                {data.companyStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.25rem", fontSize: "15px", fontWeight: "600" }}>DSA Solved by Topic</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.dsaByTopic} barGap={4}>
            <XAxis dataKey="topic" tick={{ fontSize: 11, fill: "#555" }} axisLine={{ stroke: "#222" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#555" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "white" }} />
            <Bar dataKey="done" fill="#dc2626" radius={[4, 4, 0, 0]} name="Solved" />
            <Bar dataKey="total" fill="#2a2a2a" radius={[4, 4, 0, 0]} name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}