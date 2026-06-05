import { useState, useEffect } from "react";
import axios from "axios";

const companies = ["All", "Google", "Amazon", "Microsoft", "Flipkart", "Infosys", "TCS"];
const rounds = ["All", "DSA", "System Design", "Technical", "HR"];
const companyColors = { Google: "#4285f4", Amazon: "#f90", Microsoft: "#00a4ef", Flipkart: "#2874f0", Infosys: "#007cc3", TCS: "#dc2626" };
const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
const diffBg = { Easy: "#22c55e18", Medium: "#f59e0b18", Hard: "#ef444418" };
const roundColor = { DSA: "#dc2626", "System Design": "#7c3aed", Technical: "#2563eb", HR: "#059669" };

export default function CompanyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [company, setCompany] = useState("All");
  const [round, setRound] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: "Google", round: "DSA", question: "", difficulty: "Medium" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQuestions(); }, [company]);

  const fetchQuestions = async () => {
    setLoading(true);
    const url = company === "All"
      ? "https://placeai-sqjj.onrender.com/api/company"
      : `https://placeai-sqjj.onrender.com/api/company?company=${company}`;
    const res = await axios.get(url);
    setQuestions(res.data);
    setLoading(false);
  };

  const filtered = round === "All" ? questions : questions.filter(q => q.round === round);

  const handleSubmit = async () => {
    if (!form.question.trim()) return alert("Please enter a question!");
    await axios.post("https://placeai-sqjj.onrender.com/api/company", form);
    setShowForm(false);
    setForm({ company: "Google", round: "DSA", question: "", difficulty: "Medium" });
    fetchQuestions();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}>Company-wise Questions</h2>
          <p style={{ color: "#555", margin: 0, fontSize: "14px" }}>Real interview questions from top companies.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: showForm ? "#1f1f1f" : "#dc2626", color: "white",
          padding: "10px 20px", borderRadius: "10px", border: "none",
          cursor: "pointer", fontSize: "13px", fontWeight: "600",
          boxShadow: showForm ? "none" : "0 4px 15px rgba(220,38,38,0.3)"
        }}>
          {showForm ? "✕ Cancel" : "+ Add Question"}
        </button>
      </div>

      {/* Add Question Form */}
      {showForm && (
        <div style={{
          background: "#111", border: "1px solid #dc262633",
          borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem"
        }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "15px", fontWeight: "600" }}>
            📝 Submit a Question You Faced
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#555", display: "block", marginBottom: "6px",
                textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</label>
              <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                style={{ width: "100%" }}>
                {companies.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#555", display: "block", marginBottom: "6px",
                textTransform: "uppercase", letterSpacing: "0.05em" }}>Round</label>
              <select value={form.round} onChange={e => setForm({ ...form, round: e.target.value })}
                style={{ width: "100%" }}>
                {rounds.filter(r => r !== "All").map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
            placeholder="Enter the interview question you faced..."
            rows={3} style={{ width: "100%", marginBottom: "12px", resize: "none" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#555", marginRight: "4px" }}>Difficulty:</span>
            {["Easy", "Medium", "Hard"].map(d => (
              <button key={d} onClick={() => setForm({ ...form, difficulty: d })} style={{
                padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: form.difficulty === d ? `${diffColor[d]}18` : "#1f1f1f",
                color: form.difficulty === d ? diffColor[d] : "#555",
                fontWeight: form.difficulty === d ? "700" : "400", fontSize: "13px",
                border: `1px solid ${form.difficulty === d ? diffColor[d] + "55" : "#2a2a2a"}`
              }}>{d}</button>
            ))}
            <button onClick={handleSubmit} style={{
              marginLeft: "auto", background: "#22c55e", color: "white",
              padding: "8px 24px", borderRadius: "8px", border: "none",
              cursor: "pointer", fontWeight: "600", fontSize: "13px"
            }}>
              Submit ✓
            </button>
          </div>
        </div>
      )}

      {/* Company Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        {companies.map(c => (
          <button key={c} onClick={() => setCompany(c)} style={{
            padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
            background: company === c ? (c === "All" ? "#dc2626" : `${companyColors[c]}22`) : "#111",
            color: company === c ? (c === "All" ? "white" : companyColors[c]) : "#666",
            fontSize: "13px", fontWeight: company === c ? "600" : "400",
            border: `1px solid ${company === c ? (c === "All" ? "#dc2626" : companyColors[c] + "55") : "#1f1f1f"}`,
            transition: "all 0.2s"
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* Round Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {rounds.map(r => (
          <button key={r} onClick={() => setRound(r)} style={{
            padding: "5px 14px", borderRadius: "6px", cursor: "pointer",
            background: round === r ? `${roundColor[r] || "#dc2626"}18` : "transparent",
            color: round === r ? (roundColor[r] || "#dc2626") : "#555",
            fontSize: "12px", fontWeight: round === r ? "600" : "400",
            border: `1px solid ${round === r ? (roundColor[r] || "#dc2626") + "55" : "#1f1f1f"}`,
            transition: "all 0.2s"
          }}>
            {r}
          </button>
        ))}
      </div>

      {/* Count */}
      <p style={{ color: "#555", fontSize: "13px", marginBottom: "1rem" }}>
        Showing <span style={{ color: "white", fontWeight: "600" }}>{filtered.length}</span> questions
        {company !== "All" && <span style={{ color: companyColors[company] }}> · {company}</span>}
        {round !== "All" && <span style={{ color: roundColor[round] }}> · {round}</span>}
      </p>

      {/* Questions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#555" }}>⏳ Loading questions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#444",
            background: "#111", borderRadius: "14px", border: "1px solid #1f1f1f" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px" }}>👆</p>
            <p style={{ margin: 0 }}>No questions found. Be the first to add one!</p>
          </div>
        ) : filtered.map((q, i) => (
          <div key={q._id} style={{
            padding: "16px 20px", background: "#111", borderRadius: "12px",
            border: "1px solid #1f1f1f", transition: "border-color 0.2s", display: "flex",
            justifyContent: "space-between", alignItems: "flex-start", gap: "16px"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#2a2a2a"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
          >
            <div style={{ display: "flex", gap: "14px", flex: 1, alignItems: "flex-start" }}>
              <span style={{ color: "#333", fontSize: "13px", minWidth: "24px", paddingTop: "2px" }}>
                {String(i + 1).padStart(2, "0")}.
              </span>
              <p style={{ margin: 0, fontSize: "14px", color: "#ddd", lineHeight: "1.6", flex: 1 }}>
                {q.question}
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={{
                fontSize: "11px", padding: "3px 10px", borderRadius: "6px",
                background: `${roundColor[q.round] || "#dc2626"}18`,
                color: roundColor[q.round] || "#dc2626",
                border: `1px solid ${roundColor[q.round] || "#dc2626"}33`
              }}>
                {q.round}
              </span>
              <span style={{
                fontSize: "11px", padding: "3px 10px", borderRadius: "6px",
                background: diffBg[q.difficulty], color: diffColor[q.difficulty],
                border: `1px solid ${diffColor[q.difficulty]}33`
              }}>
                {q.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}