import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase.js"; 
import { onAuthStateChanged } from "firebase/auth";

const formatName = (name) => {
  if (!name) return "Guest";
  return name
    .split(/[^a-zA-Z0-9]+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
};

const topics = ["All", "Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];
const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" };
const diffBg = { Easy: "rgba(16, 185, 129, 0.08)", Medium: "rgba(245, 158, 11, 0.08)", Hard: "rgba(239, 68, 68, 0.08)" };
const diffBorder = { Easy: "rgba(16, 185, 129, 0.2)", Medium: "rgba(245, 158, 11, 0.2)", Hard: "rgba(239, 68, 68, 0.2)" };

const generateDummyData = () => {
  return Array.from({ length: 45 }).map((_, i) => ({
    _id: `demo-${i}`,
    title: `Standard Technical Interview Problem ${i + 1}`,
    topic: topics[(i % (topics.length - 1)) + 1],
    difficulty: i % 4 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy",
    status: i % 5 === 0 
  }));
};

export default function DSATracker() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

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
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://placeai-sqjj.onrender.com/api/problems", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProblems(res.data);
        setIsDemoMode(false);
      } catch (err) {
        console.error("Backend fetch failed. Loading Demo Data instead...", err);
        setProblems(generateDummyData());
        setIsDemoMode(true); 
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const toggleStatus = async (id) => {
    setProblems(problems.map(p => p._id === id ? { ...p, status: !p.status } : p));
    if (isDemoMode) return; 
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://placeai-sqjj.onrender.com/api/problems/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to update status on server.", err);
    }
  };

  const filtered = filter === "All" ? problems : problems.filter(p => p.topic === filter);
  const doneCount = filtered.filter(p => p.status).length;
  const percent = filtered.length ? Math.round((doneCount / filtered.length) * 100) : 0;
  const totalDone = problems.filter(p => p.status).length;

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

        @media (max-width: 768px) {
          .problems-desktop { display: none; }
          .problems-mobile { display: block; }
        }
      `}</style>

      {loading ? (
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "2rem 3rem", display: "flex", alignItems: "center", gap: "16px", color: "#111827", fontWeight: "700", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ width: "24px", height: "24px", border: "3px solid rgba(20,184,166,0.3)", borderTop: "3px solid #14b8a6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            Decrypting DSA Sheet...
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
              DSA <span style={{ color: "#14b8a6" }}>Tracker</span>
            </h2>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "1rem" }}>Master data structures problem by problem.</p>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Total Solved", value: totalDone, total: `/ ${problems.length}`, color: "#14b8a6", bg: "rgba(20,184,166,0.08)", border: "rgba(20,184,166,0.15)", icon: "⟨/⟩" },
              { label: `${filter} Solved`, value: doneCount, total: `/ ${filtered.length}`, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)", icon: "🎯" },
              { label: "Completion Rate", value: `${percent}%`, total: "Overall", color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", icon: "📊" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "20px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div>
                  <p style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>{s.label}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: "800", color: "#111827", lineHeight: "1" }}>{s.value}</span>
                    <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>{s.total}</span>
                  </div>
                </div>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: s.bg, 
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", 
                  border: `1px solid ${s.border}`, color: s.color
                }}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* Global Progress Bar */}
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "20px", padding: "1.5rem 2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.9rem", color: "#374151", fontWeight: "700" }}>Overall Sheet Progress</span>
              <span style={{ fontSize: "0.9rem", color: "#14b8a6", fontWeight: "800" }}>{percent}%</span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: "10px", height: "10px", overflow: "hidden" }}>
              <div style={{
                width: `${percent}%`, background: "linear-gradient(90deg, #0d9488, #14b8a6)",
                height: "100%", borderRadius: "10px"
              }} />
            </div>
          </div>

          {/* Topic Filters */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "0.5rem 0" }}>
            {topics.map(t => {
              const topicDone = t === "All" ? problems.filter(p => p.status).length : problems.filter(p => p.topic === t && p.status).length;
              const topicTotal = t === "All" ? problems.length : problems.filter(p => p.topic === t).length;
              return (
                <button 
                  key={t} 
                  onClick={() => setFilter(t)} 
                  style={{
                    background: filter === t ? "linear-gradient(135deg, #0d9488, #14b8a6)" : "#f9fafb",
                    color: filter === t ? "white" : "#6b7280",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    border: filter === t ? "none" : "1px solid #e5e7eb",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    whiteSpace: "nowrap"
                  }}
                >
                  {t} <span style={{ opacity: filter === t ? 0.8 : 0.5, fontSize: "0.75rem", marginLeft: "6px", fontWeight: filter === t ? "700" : "500" }}>{topicDone}/{topicTotal}</span>
                </button>
              );
            })}
          </div>

          {/* Problem List (Desktop) */}
          <div className="problems-desktop" style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            
            <div style={{
              display: "grid", gridTemplateColumns: "44px 1fr 120px 100px 80px",
              padding: "16px 24px", borderBottom: "1px solid #e5e7eb",
              background: "#f9fafb",
              fontSize: "0.75rem", color: "#6b7280", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px"
            }}>
              <span></span>
              <span>Problem Title</span>
              <span>Topic</span>
              <span>Difficulty</span>
              <span>Status</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "5rem", textAlign: "center", color: "#6b7280", fontWeight: "600", fontSize: "1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}>📭</div>
                No problems found for this topic.
              </div>
            ) : (
              <div>
                {filtered.map((p, i) => (
                  <div 
                    key={p._id} 
                    style={{
                      display: "grid", 
                      gridTemplateColumns: "44px 1fr 120px 100px 80px",
                      padding: "16px 24px", 
                      borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                      alignItems: "center",
                      background: p.status ? "rgba(16, 185, 129, 0.04)" : "transparent"
                    }}
                  >
                    
                    <div onClick={() => toggleStatus(p._id)} style={{
                      width: "24px", height: "24px", borderRadius: "8px", cursor: "pointer",
                      background: p.status ? "linear-gradient(135deg, #10b981, #059669)" : "#ffffff",
                      border: `1px solid ${p.status ? "#10b981" : "#d1d5db"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white"
                    }}>
                      {p.status && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>

                    <button onClick={() => navigate(`/problem/${p._id}`)} style={{
                      color: p.status ? "#6b7280" : "#111827", fontSize: "0.95rem", fontWeight: "600",
                      textDecoration: p.status ? "line-through" : "none",
                      background: "transparent", border: "none", cursor: "pointer",
                      textAlign: "left", padding: 0
                    }}>
                      <span style={{ color: p.status ? "#9ca3af" : "#6b7280", marginRight: "12px", fontSize: "0.85rem", fontWeight: "700" }}>
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      {p.title}
                    </button>

                    <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>{p.topic}</span>

                    <span style={{
                      fontSize: "0.7rem", fontWeight: "800", padding: "6px 12px",
                      borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      color: diffColor[p.difficulty], background: diffBg[p.difficulty],
                      border: `1px solid ${diffBorder[p.difficulty]}`, letterSpacing: "0.5px", textTransform: "uppercase"
                    }}>
                      {p.difficulty}
                    </span>

                    <span style={{
                      fontSize: "0.85rem", color: p.status ? "#10b981" : "#9ca3af",
                      fontWeight: "800", display: "flex", alignItems: "center", gap: "6px"
                    }}>
                      {p.status ? (
                        <>Done <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></>
                      ) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}