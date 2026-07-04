import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { auth } from "./firebase.js"; 
import { onAuthStateChanged } from "firebase/auth";

const COLORS = ["#ff3f81", "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#a78bfa", "#f43f5e"];

// Helper function to load Vanta scripts safely
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Title Case Formatter
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

  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Authenticate User for Profile Pill
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

  // Initialize Vanta.js Background
  useEffect(() => {
    let cancelled = false;

    async function initVanta() {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js");
        
        if (cancelled || !vantaRef.current || vantaEffect.current) return;

        if (window.VANTA && window.VANTA.NET) {
          vantaEffect.current = window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xff3f81, 
            backgroundColor: 0x0a0812, 
            points: 11.0,
            maxDistance: 22.0,
            spacing: 17.0,
            showDots: true,
          });
        }
      } catch (err) {
        console.error("Failed to load Vanta background:", err);
      }
    }

    initVanta();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // Fetch Dashboard Data
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
      color: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      
      {/* Background Layer (Vanta) */}
      <div 
        ref={vantaRef} 
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }} 
      />
      
      {/* Gradient Overlay for Text Readability */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,8,18,0.75) 80%)"
      }} />

      <style>{`
        .glass-panel {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.05);
          position: relative;
          z-index: 10;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .glass-panel:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          position: relative;
          z-index: 10;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          position: relative;
          z-index: 10;
          margin-top: 1.5rem;
        }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }

        .recharts-tooltip-wrapper {
          outline: none !important;
        }
      `}</style>

      {/* SHOW LOADING SCREEN OR DASHBOARD OVER THE BACKGROUND */}
      {loading ? (
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "2rem 3rem", display: "flex", alignItems: "center", gap: "16px", color: "#fff", fontWeight: "700", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ width: "24px", height: "24px", border: "3px solid rgba(255,63,129,0.3)", borderTop: "3px solid #ff3f81", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            Crunching Analytics...
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* WARNING BANNER FOR DEMO MODE */}
          {isDemoMode && (
            <div className="glass-panel" style={{
              background: "rgba(245, 158, 11, 0.05)",
              borderColor: "rgba(245, 158, 11, 0.2)",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <div style={{ background: "rgba(245, 158, 11, 0.2)", padding: "8px", borderRadius: "8px" }}>⚠️</div> 
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "#fcd34d", fontSize: "1rem", fontWeight: "700" }}>Demo Mode Active</h4>
                <p style={{ margin: 0, color: "#9b9ba8", fontSize: "0.85rem" }}>Your Render backend is asleep or rejected the auth token. Showing offline dummy data.</p>
              </div>
            </div>
          )}

          {/* Unified Header with Profile Pill */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
            <div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "14px", letterSpacing: "-0.5px" }}>
                <span style={{ width: "28px", height: "4px", background: "linear-gradient(90deg, #7c3aed, transparent)", borderRadius: "2px" }}></span>
                Progress <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dashboard</span>
              </h2>
              <p style={{ color: "#9b9ba8", margin: 0, fontSize: "1rem" }}>Your overall placement preparation at a glance.</p>
            </div>
            
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", 
              padding: "8px 16px", borderRadius: "100px"
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#e2e8f0" }}>
                {displayName} • Ready to work
              </span>
            </div>
          </header>

          {/* Top Stats */}
          <div className="stats-grid">
            {[
              { label: "DSA Progress", value: `${data.dsa.done}`, sub: `/ ${data.dsa.total} problems`, pct: data.dsa.percent, color: "#ff3f81", icon: "⟨/⟩" },
              { label: "Quiz Questions", value: data.quiz.total, sub: "completed", pct: 100, color: "#7c3aed", icon: "🧠" },
              { label: "Company Q's", value: totalCompany, sub: "across companies", pct: 80, color: "#3b82f6", icon: "🏢" },
              { label: "Daily Streak", value: streak || 3, sub: "days", pct: Math.min((streak || 3) * 10, 100), color: "#f59e0b", icon: "🔥" },
            ].map((s, i) => (
              <div key={i} className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <p style={{ color: "#9b9ba8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                    {s.label}
                  </p>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `linear-gradient(135deg, ${s.color}20, transparent)`, 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontSize: "1.1rem", border: `1px solid ${s.color}40`, color: s.color,
                    boxShadow: `0 0 15px ${s.color}15`
                  }}>{s.icon}</div>
                </div>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: "800", color: "white", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: "0.85rem", color: "#6b6b78", fontWeight: "600" }}>{s.sub}</span>
                </div>
                
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)`, height: "100%", borderRadius: "6px", boxShadow: `0 0 10px ${s.color}80`, transition: "width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} />
                </div>
                <p style={{ color: s.color, fontSize: "0.75rem", fontWeight: "700", margin: "10px 0 0" }}>{s.pct}% complete</p>
              </div>
            ))}
          </div>

          {/* DSA + Pie Charts */}
          <div className="charts-grid">

            {/* DSA Progress by Topic */}
            <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px" }}>
              <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.1rem", fontWeight: "700", color: "#e2e8f0" }}>DSA Progress by Topic</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {data.dsaByTopic.map((t, i) => (
                  <div key={t.topic}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600" }}>
                      <span style={{ color: "#d1d5db" }}>{t.topic}</span>
                      <span style={{ color: "#9ca3af" }}>{t.done}/{t.total} ({t.percent}%)</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", height: "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{
                        width: `${t.percent}%`,
                        background: COLORS[i % COLORS.length],
                        height: "100%", borderRadius: "6px", transition: "width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        boxShadow: `0 0 12px ${COLORS[i % COLORS.length]}80`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "700", color: "#e2e8f0" }}>Company-wise Distribution</h3>
              <div style={{ flex: 1, minHeight: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={data.companyStats} dataKey="count" nameKey="company"
                      cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                      stroke="rgba(255,255,255,0.05)" strokeWidth={2}
                    >
                      {data.companyStats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: "rgba(20, 15, 25, 0.8)", border: "1px solid rgba(255,255,255,0.15)", 
                        borderRadius: "12px", backdropFilter: "blur(16px)", color: "white", fontSize: "0.85rem",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)" 
                      }} 
                      itemStyle={{ color: "#e2e8f0", fontWeight: "600" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "1rem", justifyContent: "center" }}>
                {data.companyStats.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0, boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}` }} />
                    <span style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: "600" }}>{c.company}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px", marginTop: "1.5rem", marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.1rem", fontWeight: "700", color: "#e2e8f0" }}>DSA Solved by Topic</h3>
            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dsaByTopic} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="topic" tick={{ fontSize: 11, fill: "#9b9ba8", fontWeight: "600" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9b9ba8", fontWeight: "600" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{ 
                      background: "rgba(20, 15, 25, 0.8)", border: "1px solid rgba(255,255,255,0.15)", 
                      borderRadius: "12px", backdropFilter: "blur(16px)", color: "white", fontSize: "0.85rem",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                    }} 
                  />
                  <Bar dataKey="done" fill="#ff3f81" radius={[6, 6, 0, 0]} name="Solved" />
                  <Bar dataKey="total" fill="rgba(255,255,255,0.06)" radius={[6, 6, 0, 0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}