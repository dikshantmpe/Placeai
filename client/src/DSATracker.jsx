import { useEffect, useState } from "react";
import axios from "axios";

const topics = ["All", "Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];

const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
const diffBg = { Easy: "#22c55e18", Medium: "#f59e0b18", Hard: "#ef444418" };

export default function DSATracker() {
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://placeai-sqjj.onrender.com/api/problems")
      .then(res => { setProblems(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const toggleStatus = async (id) => {
    const res = await axios.put(`https://placeai-sqjj.onrender.com/api/problems/${id}`);
    setProblems(problems.map(p => p._id === id ? res.data : p));
  };

  const filtered = filter === "All" ? problems : problems.filter(p => p.topic === filter);
  const doneCount = filtered.filter(p => p.status).length;
  const percent = filtered.length ? Math.round((doneCount / filtered.length) * 100) : 0;
  const totalDone = problems.filter(p => p.status).length;

  if (loading) return <div style={{ padding: "2rem", color: "#555" }}>⏳ Loading problems...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}>DSA Sheet Tracker</h2>
        <p style={{ color: "#555", margin: 0, fontSize: "14px" }}>Track your progress problem by problem.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Solved", value: totalDone, total: problems.length, color: "#dc2626" },
          { label: "Current Filter", value: doneCount, total: filtered.length, color: "#7c3aed" },
          { label: "Completion", value: `${percent}%`, total: "done", color: "#22c55e" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "12px", padding: "16px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <p style={{ color: "#555", fontSize: "12px", margin: "0 0 4px" }}>{s.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "24px", fontWeight: "700", color: s.color }}>{s.value}</span>
                <span style={{ fontSize: "12px", color: "#555" }}>/ {s.total}</span>
              </div>
            </div>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: `${s.color}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", border: `1px solid ${s.color}33`
            }}>
              {i === 0 ? "⟨/⟩" : i === 1 ? "🎯" : "📊"}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        background: "#111", border: "1px solid #1f1f1f",
        borderRadius: "12px", padding: "16px 20px", marginBottom: "1.5rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#aaa" }}>Overall Progress</span>
          <span style={{ fontSize: "13px", color: "#dc2626", fontWeight: "600" }}>{percent}%</span>
        </div>
        <div style={{ background: "#1f1f1f", borderRadius: "8px", height: "8px" }}>
          <div style={{
            width: `${percent}%`, background: "linear-gradient(90deg, #dc2626, #ef4444)",
            height: "8px", borderRadius: "8px", transition: "width 0.5s"
          }} />
        </div>
      </div>

      {/* Topic Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {topics.map(t => {
          const topicDone = t === "All"
            ? problems.filter(p => p.status).length
            : problems.filter(p => p.topic === t && p.status).length;
          const topicTotal = t === "All"
            ? problems.length
            : problems.filter(p => p.topic === t).length;
          return (
            <button key={t} onClick={() => setFilter(t)} style={{
              background: filter === t ? "#dc2626" : "#111",
              color: filter === t ? "white" : "#888",
              padding: "6px 14px", borderRadius: "8px",
              border: `1px solid ${filter === t ? "#dc2626" : "#2a2a2a"}`,
              cursor: "pointer", fontSize: "13px", fontWeight: filter === t ? "600" : "400",
              transition: "all 0.2s"
            }}>
              {t} <span style={{ opacity: 0.7, fontSize: "11px" }}>({topicDone}/{topicTotal})</span>
            </button>
          );
        })}
      </div>

      {/* Problem List */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "40px 1fr 100px 100px 80px",
          padding: "12px 20px", borderBottom: "1px solid #1f1f1f",
          fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          <span></span>
          <span>Problem</span>
          <span>Topic</span>
          <span>Difficulty</span>
          <span>Status</span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "#444" }}>
            No problems found.
          </div>
        )}

        {filtered.map((p, i) => (
          <div key={p._id} style={{
            display: "grid", gridTemplateColumns: "40px 1fr 100px 100px 80px",
            padding: "14px 20px", borderBottom: "1px solid #161616",
            alignItems: "center", transition: "background 0.15s",
            background: p.status ? "rgba(34,197,94,0.03)" : "transparent"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#161616"}
            onMouseLeave={e => e.currentTarget.style.background = p.status ? "rgba(34,197,94,0.03)" : "transparent"}
          >
            {/* Checkbox */}
            <div onClick={() => toggleStatus(p._id)} style={{
              width: "20px", height: "20px", borderRadius: "6px", cursor: "pointer",
              background: p.status ? "#22c55e" : "transparent",
              border: `2px solid ${p.status ? "#22c55e" : "#333"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", fontSize: "12px"
            }}>
              {p.status && "✓"}
            </div>

            {/* Title */}
            <a href={p.link} target="_blank" rel="noreferrer" style={{
              color: p.status ? "#555" : "#fff",
              fontSize: "14px", textDecoration: p.status ? "line-through" : "none",
              transition: "color 0.2s"
            }}>
              <span style={{ color: "#333", marginRight: "10px", fontSize: "12px" }}>
                {String(i + 1).padStart(2, "0")}.
              </span>
              {p.title}
            </a>

            {/* Topic */}
            <span style={{ fontSize: "12px", color: "#555" }}>{p.topic}</span>

            {/* Difficulty */}
            <span style={{
              fontSize: "11px", fontWeight: "600", padding: "3px 10px",
              borderRadius: "6px", display: "inline-block",
              color: diffColor[p.difficulty],
              background: diffBg[p.difficulty]
            }}>
              {p.difficulty}
            </span>

            {/* Status */}
            <span style={{
              fontSize: "11px", color: p.status ? "#22c55e" : "#444",
              fontWeight: p.status ? "600" : "400"
            }}>
              {p.status ? "✅ Done" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}