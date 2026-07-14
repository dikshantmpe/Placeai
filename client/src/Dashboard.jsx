import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { auth } from "./firebase.js"; 
import { onAuthStateChanged } from "firebase/auth";

const COLORS = ["#14b8a6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#f43f5e"];

const formatName = (name) => {
  if (!name) return "Guest";
  return name
    .split(/[^a-zA-Z0-9]+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const streak = parseInt(localStorage.getItem("streak") || "0");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setFirebaseUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  let rawName = "Guest";
  if (firebaseUser?.displayName) {
    rawName = firebaseUser.displayName;
  } else if (firebaseUser?.email) {
    rawName = firebaseUser.email.split("@")[0];
  }
  const displayName = formatName(rawName);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let token = localStorage.getItem("token");
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken();
        }

        const res = await axios.get("https://placeai-sqjj.onrender.com/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setData(res.data);
        setIsDemoMode(false);
      } catch (err) {
        console.error("Backend fetch failed. Loading Demo Data instead...", err);

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
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalCompany = data ? data.companyStats.reduce((sum, c) => sum + c.count, 0) : 0;

  return (
    <div style={{
      flex: 1,
      minHeight: "100vh",
      position: "relative",
      padding: "2.5rem 3rem",
      color: "#111827",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      background: "#ffffff"
    }}>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        ::-webkit-scrollbar-corner {
          background: #f3f4f6;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }

        @media (max-width: 1200px) {
          .bento-hero { grid-column: span 12 !important; }
          .bento-progress { grid-column: span 12 !important; }
          .bento-stat { grid-column: span 6 !important; }
        }
        @media (max-width: 768px) {
          .bento-stat { grid-column: span 12 !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {loading ? (
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "2rem 3rem", display: "flex", alignItems: "center", gap: "16px", color: "#111827", fontWeight: "700", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ width: "24px", height: "24px", border: "3px solid rgba(20,184,166,0.3)", borderTop: "3px solid #14b8a6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            Crunching Analytics...
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {isDemoMode && (
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: "16px",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "8px", borderRadius: "8px", color: "#f59e0b" }}>⚠️</div> 
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "#92400e", fontSize: "1rem", fontWeight: "700" }}>Demo Mode Active</h4>
                <p style={{ margin: 0, color: "#a16207", fontSize: "0.85rem" }}>Your Render backend is asleep or rejected the auth token. Showing offline dummy data.</p>
              </div>
            </div>
          )}

          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #115e59, #14b8a6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "800", fontSize: "1.1rem", color: "white"
              }}>
                C
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111827" }}>Crackin AI</div>
                <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              padding: "8px 16px", borderRadius: "100px"
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
                {displayName} • Ready to work
              </span>
            </div>
          </header>

          <div style={{ marginBottom: "0.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em", color: "#111827" }}>
              Progress <span style={{ color: "#14b8a6" }}>Dashboard</span>
            </h2>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "1rem" }}>Your overall placement preparation at a glance.</p>
          </div>

          {/* Bento Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "1.5rem"
          }}>

            {/* Hero Panel */}
            <div className="bento-hero" style={{ gridColumn: "span 8" }}>
              <div style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "24px",
                padding: "2rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                overflow: "hidden"
              }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ 
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(20, 184, 166, 0.08)", 
                    border: "1px solid rgba(20, 184, 166, 0.15)",
                    padding: "6px 14px", borderRadius: "8px", 
                    color: "#0d9488", fontSize: "0.75rem", fontWeight: "700",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    marginBottom: "1.5rem" 
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Analytics Overview
                  </div>

                  <h2 style={{ fontSize: "2rem", fontWeight: "800", lineHeight: "1.1", margin: "0 0 1rem 0", color: "#111827" }}>
                    Track Your <span style={{ color: "#14b8a6" }}>Progress</span>
                  </h2>

                  <p style={{ color: "#6b7280", fontSize: "0.9rem", maxWidth: "400px", lineHeight: "1.5", margin: "0 0 1.5rem 0" }}>
                    Monitor your DSA mastery, quiz performance, and company-wise preparation stats in real-time.
                  </p>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(4, 1fr)", 
                    gap: "1rem",
                    width: "100%",
                    maxWidth: "500px"
                  }}>
                    <div style={{ 
                      textAlign: "center", 
                      padding: "0.75rem",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#14b8a6", lineHeight: "1.2" }}>{data.dsa.done}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "4px" }}>DSA Solved</div>
                    </div>
                    <div style={{ 
                      textAlign: "center", 
                      padding: "0.75rem",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8b5cf6", lineHeight: "1.2" }}>{data.quiz.total}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "4px" }}>Quizzes Done</div>
                    </div>
                    <div style={{ 
                      textAlign: "center", 
                      padding: "0.75rem",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#22c55e", lineHeight: "1.2" }}>{totalCompany}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "4px" }}>Company Qs</div>
                    </div>
                    <div style={{ 
                      textAlign: "center", 
                      padding: "0.75rem",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#f59e0b", lineHeight: "1.2" }}>{streak || 3}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "4px" }}>Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Readiness Score */}
            <div className="bento-progress" style={{ gridColumn: "span 4", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "2rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 2rem 0", color: "#111827" }}>Readiness Score</h3>

              <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" stroke="#e5e7eb" strokeWidth="3" 
                  />
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" stroke="url(#progressGradient)" strokeWidth="3" 
                    strokeDasharray="35, 100" 
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111827", lineHeight: "1" }}>
                    35<span style={{ fontSize: "1.2rem", color: "#6b7280" }}>%</span>
                  </span>
                </div>
              </div>

              <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "1.5rem 0 0 0", lineHeight: "1.5" }}>
                You are <strong style={{ color: "#14b8a6" }}>15% closer</strong> to your goal this week. Keep going!
              </p>
            </div>

            {/* Stat Cards */}
            {[
              { label: "DSA Progress", value: `${data.dsa.done}`, sub: `/ ${data.dsa.total} problems`, pct: data.dsa.percent, color: "#14b8a6", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.15)", icon: "💻" },
              { label: "Quiz Questions", value: data.quiz.total, sub: "completed", pct: 100, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)", icon: "🧠" },
              { label: "Company Q's", value: totalCompany, sub: "across companies", pct: 80, color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", icon: "🏢" },
              { label: "Daily Streak", value: streak || 3, sub: "days", pct: Math.min((streak || 3) * 10, 100), color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", icon: "🔥" },
            ].map((s, i) => (
              <div key={i} className="bento-stat" style={{ gridColumn: "span 3", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <p style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                    {s.label}
                  </p>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: s.bg, 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontSize: "1.1rem", border: `1px solid ${s.border}`, color: s.color
                  }}>{s.icon}</div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "2rem", fontWeight: "800", color: "#111827", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>{s.sub}</span>
                </div>

                <div style={{ background: "#e5e7eb", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, background: s.color, height: "100%", borderRadius: "6px" }} />
                </div>
                <p style={{ color: s.color, fontSize: "0.75rem", fontWeight: "700", margin: "10px 0 0" }}>{s.pct}% complete</p>
              </div>
            ))}

            {/* DSA Progress by Topic */}
            <div style={{ gridColumn: "span 6", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>DSA Progress by Topic</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {data.dsaByTopic.map((t, i) => (
                  <div key={t.topic}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>
                      <span style={{ color: "#374151" }}>{t.topic}</span>
                      <span style={{ color: "#6b7280" }}>{t.done}/{t.total} ({t.percent}%)</span>
                    </div>
                    <div style={{ background: "#e5e7eb", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
                      <div style={{
                        width: `${t.percent}%`,
                        background: COLORS[i % COLORS.length],
                        height: "100%", borderRadius: "6px"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart */}
            <div style={{ gridColumn: "span 6", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>Company-wise Distribution</h3>
              <div style={{ flex: 1, minHeight: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={data.companyStats} dataKey="count" nameKey="company"
                      cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                      stroke="#ffffff" strokeWidth={2}
                    >
                      {data.companyStats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: "#ffffff", border: "1px solid #e5e7eb", 
                        borderRadius: "12px", color: "#111827", fontSize: "0.85rem",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" 
                      }} 
                      itemStyle={{ color: "#111827", fontWeight: "600" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "1rem", justifyContent: "center" }}>
                {data.companyStats.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f9fafb", padding: "4px 10px", borderRadius: "20px", border: "1px solid #e5e7eb" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: "600" }}>{c.company}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div style={{ gridColumn: "span 12", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>DSA Solved by Topic</h3>
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dsaByTopic} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="topic" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: "600" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280", fontWeight: "600" }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: "rgba(0,0,0,0.03)" }}
                      contentStyle={{ 
                        background: "#ffffff", border: "1px solid #e5e7eb", 
                        borderRadius: "12px", color: "#111827", fontSize: "0.85rem",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                      }} 
                    />
                    <Bar dataKey="done" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Solved" />
                    <Bar dataKey="total" fill="#e5e7eb" radius={[6, 6, 0, 0]} name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}