import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

const formatName = (name) => {
  if (!name) return "Guest";
  return name
    .split(/[^a-zA-Z0-9]+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
};

export default function Home({ user: propUser }) {
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const [mounted, setMounted] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(propUser || null);

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
    setMounted(true);
  }, []);

  const stats = [
    { title: "DSA Problems", value: "0", sub: "/ 450", trend: "+0 this week", icon: "💻", color: "#14b8a6", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.15)" },
    { title: "Aptitude Quizzes", value: "0", sub: " Taken", trend: "+0 this week", icon: "🧠", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
    { title: "Mock Interviews", value: "0", sub: " Completed", trend: "+0 this week", icon: "🎤", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
    { title: "Daily Streak", value: streak, sub: " Days", trend: "Keep it up! 🔥", icon: "🔥", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" }
  ];

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

        @media (max-width: 1200px) {
          .bento-hero { grid-column: span 12 !important; }
          .bento-progress { grid-column: span 12 !important; display: flex; flex-direction: row !important; align-items: center; justify-content: space-around; }
          .bento-stat { grid-column: span 6 !important; }
        }
        @media (max-width: 768px) {
          .bento-stat { grid-column: span 12 !important; }
          .action-card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", position: "relative", zIndex: 10 }}>
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

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "1.5rem",
        position: "relative",
        zIndex: 10
      }}>

        <div className="bento-hero" style={{ gridColumn: "span 8" }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            padding: "2rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "flex-start" }}>
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
                AI Placement Strategy
              </div>

              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.1", margin: "0 0 1rem 0", color: "#111827" }}>
                Accelerate Your <br/>
                <span style={{ color: "#14b8a6" }}>Placement Journey</span>
              </h2>

              <p style={{ color: "#6b7280", fontSize: "1.05rem", maxWidth: "450px", lineHeight: "1.6", margin: "0 0 2.5rem 0" }}>
                Your personalized AI command center. Leverage smart tools, track real-time progress, and master technical skills to crack your dream company.
              </p>

              <div style={{ display: "flex", gap: "1rem" }}>
                <Link to="/dsa" style={{ textDecoration: "none" }}>
                  <button style={{
                    background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                    color: "white", border: "none",
                    padding: "14px 28px", borderRadius: "12px",
                    fontWeight: "700", fontSize: "1rem", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px"
                  }}>
                    Start Practicing
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </Link>
                <Link to="/dashboard" style={{ textDecoration: "none" }}>
                  <button style={{
                    background: "#f9fafb", color: "#374151",
                    border: "1px solid #d1d5db", padding: "14px 28px", borderRadius: "12px",
                    fontWeight: "600", fontSize: "1rem", cursor: "pointer"
                  }}>
                    View Analytics
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

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

        {stats.map((stat, i) => (
          <div key={i} className="bento-stat" style={{ gridColumn: "span 3", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: stat.bg, border: `1px solid ${stat.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", color: stat.color
              }}>
                {stat.icon}
              </div>
            </div>
            <h4 style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 0.5rem 0", fontWeight: "600" }}>{stat.title}</h4>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "2rem", fontWeight: "800", color: "#111827" }}>{stat.value}</span>
              <span style={{ color: "#6b7280", fontSize: "0.9rem", fontWeight: "600" }}>{stat.sub}</span>
            </div>
            <div style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: "600", marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
               {stat.trend}
            </div>
          </div>
        ))}

        <div style={{ gridColumn: "span 12", marginTop: "0.5rem" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "800", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "10px", color: "#111827" }}>
            <span style={{ width: "4px", height: "20px", background: "#14b8a6", borderRadius: "4px" }} />
            AI Recommended For You
          </h3>

          <div className="action-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>

            <Link to="/dsa" style={{ textDecoration: "none" }}>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "8px 12px", borderRadius: "8px", color: "#ef4444", fontSize: "0.75rem", fontWeight: "700" }}>HIGH PRIORITY</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                <h4 style={{ color: "#111827", fontSize: "1.05rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Mastering Arrays</h4>
                <p style={{ color: "#6b7280", fontSize: "0.88rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>You missed 2 questions on Two Pointers yesterday. Review this pattern to boost your DSA score.</p>
                <div style={{ marginTop: "auto", color: "#14b8a6", fontSize: "0.88rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  Start Module <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </Link>

            <Link to="/resume" style={{ textDecoration: "none" }}>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ background: "rgba(20, 184, 166, 0.08)", padding: "8px 12px", borderRadius: "8px", color: "#0d9488", fontSize: "0.75rem", fontWeight: "700" }}>QUICK WIN</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                <h4 style={{ color: "#111827", fontSize: "1.05rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Scan Your Resume</h4>
                <p style={{ color: "#6b7280", fontSize: "0.88rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>Upload your latest PDF to check ATS compatibility and get AI formatting feedback.</p>
                <div style={{ marginTop: "auto", color: "#14b8a6", fontSize: "0.88rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  Analyze Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </Link>

            <Link to="/interview" style={{ textDecoration: "none" }}>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ background: "rgba(139, 92, 246, 0.08)", padding: "8px 12px", borderRadius: "8px", color: "#8b5cf6", fontSize: "0.75rem", fontWeight: "700" }}>PRACTICE</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                <h4 style={{ color: "#111827", fontSize: "1.05rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>Behavioral Mock</h4>
                <p style={{ color: "#6b7280", fontSize: "0.88rem", margin: "0 0 1.5rem 0", lineHeight: "1.5" }}>Practice the "Tell me about yourself" pitch with our voice AI before real interviews.</p>
                <div style={{ marginTop: "auto", color: "#8b5cf6", fontSize: "0.88rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  Start Interview <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}