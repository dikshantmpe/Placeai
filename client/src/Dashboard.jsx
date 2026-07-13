import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { auth } from "./firebase.js"; 
import { onAuthStateChanged } from "firebase/auth";

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#f43f5e"];

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

  // Tilt state for hero panel
  const [heroTilt, setHeroTilt] = useState({ rotateX: 0, rotateY: -6 });
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const heroPanelRef = useRef(null);

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
            color: 0x3b82f6,
            backgroundColor: 0x070b14,
            points: 10.0,
            maxDistance: 25.0,
            spacing: 18.0,
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

  // Hero tilt handlers
  const handleHeroEnter = useCallback(() => {
    setIsHeroHovered(true);
    setHeroTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const handleHeroMove = useCallback((e) => {
    if (!heroPanelRef.current || !isHeroHovered) return;
    const rect = heroPanelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;
    setHeroTilt({ rotateX, rotateY });
  }, [isHeroHovered]);

  const handleHeroLeave = useCallback(() => {
    setIsHeroHovered(false);
    setHeroTilt({ rotateX: 0, rotateY: -6 });
  }, []);

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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      background: "#070b14"
    }}>

      <div 
        ref={vantaRef} 
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }} 
      />

      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 0%, rgba(30, 58, 138, 0.15) 0%, transparent 60%)"
      }} />

      <style>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.03);
          position: relative;
          z-index: 10;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .glass-panel:hover {
          background: rgba(15, 23, 42, 0.7);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .stat-card {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          transform-style: preserve-3d;
        }
        .stat-card:hover {
          background: rgba(15, 23, 42, 0.65);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-6px) rotateX(-3deg) rotateY(3deg) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
        }
        .stat-card:hover .stat-icon {
          transform: translateZ(20px) scale(1.1);
        }
        .stat-icon {
          transition: transform 0.3s ease;
        }
        .hero-tilt {
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .float-anim-d1 { animation: float 4s ease-in-out infinite; animation-delay: 0.5s; }
        .float-anim-d2 { animation: float 4s ease-in-out infinite; animation-delay: 1s; }
        .float-anim-d3 { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
        .recharts-tooltip-wrapper {
          outline: none !important;
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
          <div style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem 3rem", display: "flex", alignItems: "center", gap: "16px", color: "#fff", fontWeight: "700", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ width: "24px", height: "24px", border: "3px solid rgba(59,130,246,0.3)", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            Crunching Analytics...
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

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
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Your Render backend is asleep or rejected the auth token. Showing offline dummy data.</p>
              </div>
            </div>
          )}

          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                Progress <span style={{ color: "#3b82f6" }}>Dashboard</span>
              </h2>
              <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>Your overall placement preparation at a glance.</p>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.08)", 
              padding: "8px 16px", borderRadius: "100px"
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#e2e8f0" }}>
                {displayName} • Ready to work
              </span>
            </div>
          </header>

          {/* Bento Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "1.5rem"
          }}>

            {/* Hero Panel with Tilt */}
            <div style={{ gridColumn: "span 8", perspective: "1200px" }}>
              <div
                ref={heroPanelRef}
                onMouseEnter={handleHeroEnter}
                onMouseMove={handleHeroMove}
                onMouseLeave={handleHeroLeave}
                className="hero-tilt glass-panel"
                style={{
                  overflow: "hidden",
                  transform: `rotateX(${heroTilt.rotateX}deg) rotateY(${heroTilt.rotateY}deg) translateZ(0)`,
                  willChange: "transform"
                }}
              >
                <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "100%", background: "radial-gradient(ellipse at right, rgba(59,130,246,0.12), transparent 70%)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ 
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(59, 130, 246, 0.1)", 
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    padding: "6px 14px", borderRadius: "8px", 
                    color: "#60a5fa", fontSize: "0.75rem", fontWeight: "700",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    marginBottom: "1.5rem" 
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Analytics Overview
                  </div>

                  <h2 style={{ fontSize: "2rem", fontWeight: "800", lineHeight: "1.1", margin: "0 0 1rem 0" }}>
                    Track Your <span style={{ color: "#3b82f6" }}>Progress</span>
                  </h2>

                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: "400px", lineHeight: "1.5", margin: "0 0 1.5rem 0" }}>
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
                      background: "rgba(15, 23, 42, 0.4)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#3b82f6", lineHeight: "1.2" }}>{data.dsa.done}</div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px" }}>DSA Solved</div>
                    </div>
                    <div style={{ 
                      textAlign: "center", 
                      padding: "0.75rem",
                      background: "rgba(15, 23, 42, 0.4)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8b5cf6", lineHeight: "1.2" }}>{data.quiz.total}</div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px" }}>Quizzes Done</div>
                    </div>
                    <div style={{ 
                      textAlign: "center", 
                      padding: "0.75rem",
                      background: "rgba(15, 23, 42, 0.4)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#22c55e", lineHeight: "1.2" }}>{totalCompany}</div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px" }}>Company Qs</div>
                    </div>
                    <div style={{ 
                      textAlign: "center", 
                      padding: "0.75rem",
                      background: "rgba(15, 23, 42, 0.4)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#f59e0b", lineHeight: "1.2" }}>{streak || 3}</div>
                      <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "4px" }}>Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Readiness Score */}
            <div className="glass-panel bento-progress" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 2rem 0", color: "#e2e8f0" }}>Readiness Score</h3>

              <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" 
                  />
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" stroke="url(#progressGradient)" strokeWidth="3" 
                    strokeDasharray="35, 100" 
                    style={{ animation: "progress 2s ease-out forwards" }} 
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "white", lineHeight: "1" }}>
                    35<span style={{ fontSize: "1.2rem", color: "#64748b" }}>%</span>
                  </span>
                </div>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "1.5rem 0 0 0", lineHeight: "1.5" }}>
                You are <strong style={{ color: "#3b82f6" }}>15% closer</strong> to your goal this week. Keep going!
              </p>
            </div>

            {/* Stat Cards */}
            {[
              { label: "DSA Progress", value: `${data.dsa.done}`, sub: `/ ${data.dsa.total} problems`, pct: data.dsa.percent, color: "#3b82f6", icon: "💻", floatClass: "float-anim" },
              { label: "Quiz Questions", value: data.quiz.total, sub: "completed", pct: 100, color: "#8b5cf6", icon: "🧠", floatClass: "float-anim-d1" },
              { label: "Company Q's", value: totalCompany, sub: "across companies", pct: 80, color: "#22c55e", icon: "🏢", floatClass: "float-anim-d2" },
              { label: "Daily Streak", value: streak || 3, sub: "days", pct: Math.min((streak || 3) * 10, 100), color: "#f59e0b", icon: "🔥", floatClass: "float-anim-d3" },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.floatClass}`} style={{ gridColumn: "span 3" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
                    {s.label}
                  </p>
                  <div className="stat-icon" style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `linear-gradient(135deg, ${s.color}20, transparent)`, 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontSize: "1.1rem", border: `1px solid ${s.color}40`, color: s.color,
                    boxShadow: `0 0 15px ${s.color}15`
                  }}>{s.icon}</div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "2rem", fontWeight: "800", color: "white", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "600" }}>{s.sub}</span>
                </div>

                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)`, height: "100%", borderRadius: "6px", boxShadow: `0 0 10px ${s.color}80`, transition: "width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} />
                </div>
                <p style={{ color: s.color, fontSize: "0.75rem", fontWeight: "700", margin: "10px 0 0" }}>{s.pct}% complete</p>
              </div>
            ))}

            {/* DSA Progress by Topic */}
            <div className="glass-panel" style={{ gridColumn: "span 6", padding: "1.5rem" }}>
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
            <div className="glass-panel" style={{ gridColumn: "span 6", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
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
                        background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", 
                        borderRadius: "12px", backdropFilter: "blur(16px)", color: "white", fontSize: "0.85rem",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)" 
                      }} 
                      itemStyle={{ color: "#e2e8f0", fontWeight: "600" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "1rem", justifyContent: "center" }}>
                {data.companyStats.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0, boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}` }} />
                    <span style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: "600" }}>{c.company}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="glass-panel" style={{ gridColumn: "span 12", padding: "1.5rem", marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.1rem", fontWeight: "700", color: "#e2e8f0" }}>DSA Solved by Topic</h3>
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dsaByTopic} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="topic" tick={{ fontSize: 11, fill: "#64748b", fontWeight: "600" }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b", fontWeight: "600" }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{ 
                        background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", 
                        borderRadius: "12px", backdropFilter: "blur(16px)", color: "white", fontSize: "0.85rem",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                      }} 
                    />
                    <Bar dataKey="done" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Solved" />
                    <Bar dataKey="total" fill="rgba(255,255,255,0.06)" radius={[6, 6, 0, 0]} name="Total" />
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
