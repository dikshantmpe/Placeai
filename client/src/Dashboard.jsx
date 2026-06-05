import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://placeai-sqjj.onrender.com/api/dashboard")
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 4px" }}>Progress Dashboard</h2>
      <p style={{ color: "#666", margin: "0 0 2rem" }}>Your overall placement preparation at a glance.</p>

      {/* Top Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "2rem" }}>
        <div style={{ background: "#f0f0ff", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
          <p style={{ color: "#4f46e5", fontSize: "13px", margin: "0 0 6px", fontWeight: "500" }}>DSA Progress</p>
          <h2 style={{ margin: 0, color: "#4f46e5" }}>{data.dsa.done}/{data.dsa.total}</h2>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13px" }}>{data.dsa.percent}% complete</p>
        </div>
        <div style={{ background: "#f0fff4", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
          <p style={{ color: "#059669", fontSize: "13px", margin: "0 0 6px", fontWeight: "500" }}>Quiz Questions</p>
          <h2 style={{ margin: 0, color: "#059669" }}>{data.quiz.total}</h2>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13px" }}>available to practice</p>
        </div>
        <div style={{ background: "#fff7ed", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
          <p style={{ color: "#d97706", fontSize: "13px", margin: "0 0 6px", fontWeight: "500" }}>Company Questions</p>
          <h2 style={{ margin: 0, color: "#d97706" }}>
            {data.companyStats.reduce((sum, c) => sum + c.count, 0)}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: "13px" }}>across all companies</p>
        </div>
      </div>

      {/* DSA Progress Bar */}
      <div style={{ background: "white", border: "1px solid #eee", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.25rem" }}>DSA Progress by Topic</h3>
        {data.dsaByTopic.map(t => (
          <div key={t.topic} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "4px" }}>
              <span>{t.topic}</span>
              <span style={{ color: "#666" }}>{t.done}/{t.total} ({t.percent}%)</span>
            </div>
            <div style={{ background: "#eee", borderRadius: "6px", height: "8px" }}>
              <div style={{
                width: `${t.percent}%`, background: "#4f46e5",
                height: "8px", borderRadius: "6px", transition: "width 0.4s"
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart - DSA by Topic */}
      <div style={{ background: "white", border: "1px solid #eee", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.25rem" }}>DSA Solved by Topic</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.dsaByTopic}>
            <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="done" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Solved" />
            <Bar dataKey="total" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Company Questions */}
      <div style={{ background: "white", border: "1px solid #eee", borderRadius: "12px", padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1.25rem" }}>Company-wise Questions Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data.companyStats} dataKey="count" nameKey="company"
              cx="50%" cy="50%" outerRadius={100} label={({ company, percent }) =>
                `${company} ${(percent * 100).toFixed(0)}%`}>
              {data.companyStats.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}