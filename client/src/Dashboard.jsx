import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// FIX: Changed from "../firebase.js" to "./firebase.js"
import { auth } from "./firebase.js"; 

const COLORS = ["#ff3f81", "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#a78bfa", "#f43f5e"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const streak = parseInt(localStorage.getItem("streak") || "0");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Try to get the Firebase token (or fallback to old localStorage token)
        let token = localStorage.getItem("token");
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken();
        }

        // 2. Try to fetch from your live backend
        const res = await axios.get("https://placeai-sqjj.onrender.com/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data);
      } catch (err) {
        console.error("Backend fetch failed. Loading Demo Data instead...", err);
        
        // 3. FALLBACK: If backend is asleep or token fails, load this Demo Data!
        setData({
          dsa: { done: 145, total: 450, percent: 32 },
          quiz: { total: 24 },
          companyStats: [
            { company: "Google", count: 45 },
            { company: "Microsoft", count: 60 },
            { company: "Amazon", count: 50 },
            { company: "Meta", count: 25 }
          ],
          dsaByTopic: [
            { topic: "Arrays", done: 45, total: 50, percent: 90 },
            { topic: "Strings", done: 30, total: 40, percent: 75 },
            { topic: "Linked Lists", done: 20, total: 45, percent: 44 },
            { topic: "Trees", done: 25, total: 60, percent: 41 },
            { topic: "Dynamic Prog", done: 15, total: 80, percent: 18 },
            { topic: "Graphs", done: 10, total: 55, percent: 18 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div style={{ padding: "2rem", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
      <div className="glass-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "12px", color: "#a78bfa", fontWeight: "600" }}>
        <span style={{ animation: "pulse-glow 1.5s infinite" }}>⏳</span> Fetching your analytics...
      </div>
    </div>
  );

  const totalCompany = data.companyStats.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          padding: 1.5rem;
          width: 100%;
          min-width: 0; 
          box-sizing: border-box;
          color: white;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-x: hidden;
        }

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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .recharts-tooltip-wrapper {
          outline: none !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "24px", height: "3px", background: "linear-gradient(90deg, #7c3aed, transparent)", borderRadius: "2px" }}></span>
          Progress <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dashboard</span>
        </h2>
        <p style={{ color: "#9b9ba8", margin: 0, fontSize: "14px", fontWeight: "500" }}>Your overall placement preparation at a glance.</p>
      </div>

      {/* Top Stats */}
      <div className="stats-grid">
        {[
          { label: "DSA Progress", value: `${data.dsa.done}`, sub: `/ ${data.dsa.total} problems`, pct: data.dsa.percent, color: "#ff3f81", icon: "⟨/⟩" },
          { label: "Quiz Questions", value: data.quiz.total, sub: "completed", pct: 100, color: "#7c3aed", icon: "🧠" },
          { label: "Company Q's", value: totalCompany, sub: "across companies", pct: 80, color: "#3b82f6", icon: "🏢" },
          { label: "Daily Streak", value: streak || 3, sub: "days", pct: Math.min((streak || 3) * 10, 100), color: "#f59e0b", icon: "🔥" },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <p style={{ color: "#9b9ba8", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                {s.label}
              </p>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: `linear-gradient(135deg, ${s.color}20, transparent)`, 
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: "16px", border: `1px solid ${s.color}40`, color: s.color,
                boxShadow: `0 0 15px ${s.color}15`
              }}>{s.icon}</div>
            </div>
            
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "white", lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: "12px", color: "#6b6b78", fontWeight: "600" }}>{s.sub}</span>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", height: "5px", marginTop: "12px", overflow: "hidden" }}>
              <div style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)`, height: "100%", borderRadius: "6px", boxShadow: `0 0 10px ${s.color}80` }} />
            </div>
            <p style={{ color: s.color, fontSize: "11px", fontWeight: "600", margin: "8px 0 0" }}>{s.pct}% complete</p>
          </div>
        ))}
      </div>

      {/* DSA + Pie Charts */}
      <div className="charts-grid">

        {/* DSA Progress by Topic */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>DSA Progress by Topic</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {data.dsaByTopic.map((t, i) => (
              <div key={t.topic}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px", fontWeight: "500" }}>
                  <span style={{ color: "#d1d5db" }}>{t.topic}</span>
                  <span style={{ color: "#9ca3af" }}>{t.done}/{t.total} ({t.percent}%)</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
                  <div style={{
                    width: `${t.percent}%`,
                    background: COLORS[i % COLORS.length],
                    height: "100%", borderRadius: "6px", transition: "width 0.8s ease-in-out",
                    boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}80`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>Company-wise Distribution</h3>
          <div style={{ flex: 1, minHeight: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.companyStats} dataKey="count" nameKey="company"
                  cx="50%" cy="50%" outerRadius={85} innerRadius={45}
                  stroke="rgba(255,255,255,0.05)" strokeWidth={2}
                >
                  {data.companyStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(10, 8, 15, 0.9)", border: "1px solid rgba(255,255,255,0.15)", 
                    borderRadius: "12px", backdropFilter: "blur(10px)", color: "white", fontSize: "13px" 
                  }} 
                  itemStyle={{ color: "#e2e8f0", fontWeight: "600" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px", justifyContent: "center" }}>
            {data.companyStats.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0, boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}` }} />
                <span style={{ fontSize: "12px", color: "#9b9ba8", fontWeight: "500" }}>{c.company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 1.25rem", fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>DSA Solved by Topic</h3>
        <div style={{ height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dsaByTopic} barGap={6} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="topic" tick={{ fontSize: 11, fill: "#9b9ba8", fontWeight: "500" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9b9ba8", fontWeight: "500" }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ 
                  background: "rgba(10, 8, 15, 0.9)", border: "1px solid rgba(255,255,255,0.15)", 
                  borderRadius: "12px", backdropFilter: "blur(10px)", color: "white", fontSize: "13px" 
                }} 
              />
              <Bar dataKey="done" fill="#ff3f81" radius={[6, 6, 0, 0]} name="Solved" />
              <Bar dataKey="total" fill="rgba(255,255,255,0.06)" radius={[6, 6, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}