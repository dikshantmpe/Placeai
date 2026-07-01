import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// FIXED: Locked in the correct path for your folder structure
import { auth } from "./firebase.js"; 

const topics = ["All", "Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];
const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" };
const diffBg = { Easy: "rgba(16, 185, 129, 0.15)", Medium: "rgba(245, 158, 11, 0.15)", Hard: "rgba(239, 68, 68, 0.15)" };

export default function DSATracker() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        let token = localStorage.getItem("token");
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken();
        }

        const res = await axios.get("https://placeai-sqjj.onrender.com/api/problems", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProblems(res.data);
      } catch (err) {
        console.error("Backend fetch failed. Loading Demo Data instead...", err);
        // FALLBACK DEMO DATA
        setProblems([
          { _id: "1", title: "Two Sum", topic: "Arrays", difficulty: "Easy", status: true },
          { _id: "2", title: "Longest Substring Without Repeating Characters", topic: "Strings", difficulty: "Medium", status: false },
          { _id: "3", title: "Reverse Linked List", topic: "Linked List", difficulty: "Easy", status: true },
          { _id: "4", title: "Binary Tree Maximum Path Sum", topic: "Trees", difficulty: "Hard", status: false },
          { _id: "5", title: "Climbing Stairs", topic: "DP", difficulty: "Easy", status: true },
          { _id: "6", title: "Course Schedule", topic: "Graphs", difficulty: "Medium", status: false },
          { _id: "7", title: "Valid Parentheses", topic: "Stack", difficulty: "Easy", status: true },
          { _id: "8", title: "Search in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", status: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const toggleStatus = async (id) => {
    // Optimistic UI update for snappy feel
    setProblems(problems.map(p => p._id === id ? { ...p, status: !p.status } : p));
    
    try {
      let token = localStorage.getItem("token");
      if (auth.currentUser) token = await auth.currentUser.getIdToken();
      
      await axios.put(`https://placeai-sqjj.onrender.com/api/problems/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to update status on server.", err);
      // Revert on failure (optional, but good practice)
      // setProblems(problems.map(p => p._id === id ? { ...p, status: !p.status } : p));
    }
  };

  const filtered = filter === "All" ? problems : problems.filter(p => p.topic === filter);
  const doneCount = filtered.filter(p => p.status).length;
  const percent = filtered.length ? Math.round((doneCount / filtered.length) * 100) : 0;
  const totalDone = problems.filter(p => p.status).length;

  if (loading) return (
    <div style={{ padding: "2rem", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
      <div className="glass-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "12px", color: "#a78bfa", fontWeight: "600" }}>
        <span style={{ animation: "pulse-glow 1.5s infinite" }}>⏳</span> Fetching your DSA sheet...
      </div>
    </div>
  );

  return (
    <div className="dsa-container">
      <style>{`
        .dsa-container {
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
          overflow: hidden;
        }

        .dsa-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .topic-btn {
          background: rgba(255,255,255,0.03);
          color: #9b9ba8;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .topic-btn:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }
        .topic-btn.active {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border-color: rgba(255,63,129,0.4);
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(255,63,129,0.25);
        }

        .table-row {
          display: grid;
          grid-template-columns: 44px 1fr 100px 90px 70px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          align-items: center;
          transition: background 0.2s;
        }
        .table-row:hover {
          background: rgba(255,255,255,0.03);
        }
        .table-row.completed {
          background: rgba(16, 185, 129, 0.05);
        }
        .table-row.completed:hover {
          background: rgba(16, 185, 129, 0.08);
        }

        .problems-mobile { display: none; }
        .problems-desktop { display: block; }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .dsa-container { padding: 1rem; }
          .problems-desktop { display: none; }
          .problems-mobile { display: block; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "24px", height: "3px", background: "linear-gradient(90deg, #ff3f81, transparent)", borderRadius: "2px" }}></span>
          DSA <span style={{ background: "linear-gradient(90deg, #ff3f81, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tracker</span>
        </h2>
        <p style={{ color: "#9b9ba8", margin: 0, fontSize: "14px", fontWeight: "500" }}>Track your progress problem by problem.</p>
      </div>

      {/* Stats Row */}
      <div className="dsa-stats-grid">
        {[
          { label: "Total Solved", value: totalDone, total: problems.length, color: "#ff3f81", icon: "⟨/⟩" },
          { label: `${filter} Solved`, value: doneCount, total: filtered.length, color: "#a78bfa", icon: "🎯" },
          { label: "Completion", value: `${percent}%`, total: "done", color: "#10b981", icon: "📊" },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#9b9ba8", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px" }}>{s.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: "26px", fontWeight: "800", color: s.color }}>{s.value}</span>
                <span style={{ fontSize: "13px", color: "#6b6b78", fontWeight: "600" }}>/ {s.total}</span>
              </div>
            </div>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: `linear-gradient(135deg, ${s.color}20, transparent)`, 
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", 
              border: `1px solid ${s.color}40`, color: s.color, boxShadow: `0 0 15px ${s.color}15`
            }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Global Progress Bar */}
      <div className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#9b9ba8", fontWeight: "600" }}>Overall Sheet Progress</span>
          <span style={{ fontSize: "13px", color: "#ff3f81", fontWeight: "800" }}>{percent}%</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
          <div style={{
            width: `${percent}%`, background: "linear-gradient(90deg, #7c3aed, #ff3f81)",
            height: "100%", borderRadius: "8px", transition: "width 0.8s ease-in-out",
            boxShadow: "0 0 15px rgba(255,63,129,0.5)"
          }} />
        </div>
      </div>

      {/* Topic Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "0.5rem 0" }}>
        {topics.map(t => {
          const topicDone = t === "All" ? problems.filter(p => p.status).length : problems.filter(p => p.topic === t && p.status).length;
          const topicTotal = t === "All" ? problems.length : problems.filter(p => p.topic === t).length;
          return (
            <button key={t} onClick={() => setFilter(t)} className={`topic-btn ${filter === t ? "active" : ""}`}>
              {t} <span style={{ opacity: filter === t ? 1 : 0.6, fontSize: "11px", marginLeft: "4px" }}>({topicDone}/{topicTotal})</span>
            </button>
          );
        })}
      </div>

      {/* Problem List — DESKTOP VIEW */}
      <div className="problems-desktop glass-card">
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "44px 1fr 100px 90px 70px",
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.2)",
          fontSize: "11px", color: "#6b6b78", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          <span></span>
          <span>Problem Title</span>
          <span>Topic</span>
          <span>Difficulty</span>
          <span>Status</span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "4rem", textAlign: "center", color: "#6b6b78", fontWeight: "500" }}>No problems found for this topic.</div>
        )}

        {filtered.map((p, i) => (
          <div key={p._id} className={`table-row ${p.status ? "completed" : ""}`}>
            
            {/* Custom Checkbox */}
            <div onClick={() => toggleStatus(p._id)} style={{
              width: "22px", height: "22px", borderRadius: "6px", cursor: "pointer",
              background: p.status ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${p.status ? "#10b981" : "rgba(255,255,255,0.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", color: "white", boxShadow: p.status ? "0 0 10px rgba(16,185,129,0.4)" : "none"
            }}>
              {p.status && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </div>

            <button onClick={() => navigate(`/problem/${p._id}`)} style={{
              color: p.status ? "#6b6b78" : "#e2e8f0", fontSize: "14px", fontWeight: "500",
              textDecoration: p.status ? "line-through" : "none",
              background: "transparent", border: "none", cursor: "pointer",
              textAlign: "left", padding: 0, transition: "color 0.2s"
            }}>
              <span style={{ color: "#6b6b78", marginRight: "12px", fontSize: "12px", fontWeight: "600" }}>
                {String(i + 1).padStart(2, "0")}.
              </span>
              {p.title}
            </button>

            <span style={{ fontSize: "12px", color: "#9b9ba8", fontWeight: "500" }}>{p.topic}</span>

            <span style={{
              fontSize: "11px", fontWeight: "700", padding: "4px 10px",
              borderRadius: "8px", display: "inline-block",
              color: diffColor[p.difficulty], background: diffBg[p.difficulty],
              border: `1px solid ${diffColor[p.difficulty]}40`
            }}>
              {p.difficulty}
            </span>

            <span style={{
              fontSize: "13px", color: p.status ? "#10b981" : "#6b6b78",
              fontWeight: p.status ? "700" : "500"
            }}>
              {p.status ? "Done" : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="problems-mobile">
        {filtered.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b6b78" }}>No problems found.</div>
        )}
        {filtered.map((p, i) => (
          <div key={p._id} className="glass-card" style={{
            border: `1px solid ${p.status ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`,
            padding: "16px", marginBottom: "12px",
            display: "flex", alignItems: "flex-start", gap: "14px",
            background: p.status ? "rgba(16, 185, 129, 0.05)" : undefined
          }}>
            {/* Checkbox */}
            <div onClick={() => toggleStatus(p._id)} style={{
              width: "24px", height: "24px", borderRadius: "8px", cursor: "pointer",
              background: p.status ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${p.status ? "#10b981" : "rgba(255,255,255,0.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", color: "white", flexShrink: 0, marginTop: "2px",
              boxShadow: p.status ? "0 0 10px rgba(16,185,129,0.4)" : "none"
            }}>
              {p.status && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <button onClick={() => navigate(`/problem/${p._id}`)} style={{
                color: p.status ? "#6b6b78" : "#e2e8f0", fontSize: "14px",
                textDecoration: p.status ? "line-through" : "none",
                display: "block", marginBottom: "10px", fontWeight: "600",
                background: "transparent", border: "none", cursor: "pointer",
                textAlign: "left", padding: 0
              }}>
                <span style={{ color: "#6b6b78", marginRight: "8px", fontSize: "12px" }}>
                  {String(i + 1).padStart(2, "0")}.
                </span>
                {p.title}
              </button>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "#9b9ba8", background: "rgba(255,255,255,0.05)",
                  padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "500" }}>{p.topic}</span>
                <span style={{
                  fontSize: "11px", fontWeight: "700", padding: "4px 10px",
                  borderRadius: "6px", color: diffColor[p.difficulty],
                  background: diffBg[p.difficulty], border: `1px solid ${diffColor[p.difficulty]}40`
                }}>{p.difficulty}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}