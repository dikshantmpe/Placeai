import { useEffect, useState } from "react";
import axios from "axios";

export default function DSATracker() {
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState("All");

  const topics = ["All", "Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];

  useEffect(() => {
    axios.get("http://localhost:5000/api/problems")
      .then(res => setProblems(res.data))
      .catch(err => console.error(err));
  }, []);

  const toggleStatus = async (id) => {
    const res = await axios.put(`http://localhost:5000/api/problems/${id}`);
    setProblems(problems.map(p => p._id === id ? res.data : p));
  };

  const filtered = filter === "All" ? problems : problems.filter(p => p.topic === filter);
  const doneCount = filtered.filter(p => p.status).length;
  const percent = filtered.length ? Math.round((doneCount / filtered.length) * 100) : 0;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>DSA Sheet Tracker</h2>
      <p style={{ color: "#666" }}>Track your progress problem by problem.</p>

      {/* Topic Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
        {topics.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{
              background: filter === t ? "#4f46e5" : "#eee",
              color: filter === t ? "white" : "black",
              padding: "6px 14px", borderRadius: "8px",
              border: "none", cursor: "pointer"
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <p style={{ margin: "0 0 6px" }}>{doneCount} / {filtered.length} done ({percent}%)</p>
      <div style={{ background: "#eee", borderRadius: "8px", height: "10px", marginBottom: "1.5rem" }}>
        <div style={{
          width: `${percent}%`, background: "#4f46e5",
          height: "10px", borderRadius: "8px", transition: "width 0.4s"
        }} />
      </div>

      {/* Problem List */}
      {filtered.map(p => (
        <div key={p._id} style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 0", borderBottom: "1px solid #eee"
        }}>
          <input
            type="checkbox"
            checked={p.status}
            onChange={() => toggleStatus(p._id)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <a href={p.link} target="_blank" rel="noreferrer"
            style={{
              textDecoration: p.status ? "line-through" : "none",
              color: "#4f46e5", fontSize: "15px", flex: 1
            }}>
            {p.title}
          </a>
          <span style={{ fontSize: "12px", fontWeight: "500",
            color: p.difficulty === "Easy" ? "green" : p.difficulty === "Medium" ? "orange" : "red"
          }}>
            {p.difficulty}
          </span>
          <span style={{ fontSize: "12px", color: "#999", minWidth: "90px", textAlign: "right" }}>
            {p.topic}
          </span>
        </div>
      ))}
    </div>
  );
}