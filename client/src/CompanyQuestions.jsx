import { useState, useEffect } from "react";
import axios from "axios";

const companies = ["All", "Google", "Amazon", "Microsoft", "Flipkart", "Infosys", "TCS"];
const rounds = ["All", "DSA", "System Design", "Technical", "HR"];

export default function CompanyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [company, setCompany] = useState("All");
  const [round, setRound] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: "Google", round: "DSA", question: "", difficulty: "Medium" });

  useEffect(() => {
    fetchQuestions();
  }, [company]);

  const fetchQuestions = async () => {
    const url = company === "All"
      ? "http://localhost:5000/api/company"
      : `http://localhost:5000/api/company?company=${company}`;
    const res = await axios.get(url);
    setQuestions(res.data);
  };

  const filtered = round === "All" ? questions : questions.filter(q => q.round === round);

  const handleSubmit = async () => {
    if (!form.question.trim()) return alert("Please enter a question!");
    await axios.post("http://localhost:5000/api/company", form);
    setShowForm(false);
    setForm({ company: "Google", round: "DSA", question: "", difficulty: "Medium" });
    fetchQuestions();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Company-wise Questions</h2>
          <p style={{ color: "#666", margin: "4px 0 0" }}>Real interview questions from top companies.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: "#4f46e5", color: "white", padding: "10px 20px",
            borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px" }}>
          + Add Question
        </button>
      </div>

      {/* Add Question Form */}
      {showForm && (
        <div style={{ background: "#f9f9ff", padding: "1.5rem", borderRadius: "12px",
          border: "1px solid #e0e0ff", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem" }}>Submit a Question You Faced</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd" }}>
              {companies.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.round} onChange={e => setForm({ ...form, round: e.target.value })}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd" }}>
              {rounds.filter(r => r !== "All").map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
            placeholder="Enter the interview question..."
            rows={3} style={{ width: "100%", padding: "10px", borderRadius: "8px",
              border: "1px solid #ddd", fontSize: "14px", marginBottom: "1rem", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            {["Easy", "Medium", "Hard"].map(d => (
              <button key={d} onClick={() => setForm({ ...form, difficulty: d })}
                style={{ padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
                  background: form.difficulty === d ? "#4f46e5" : "#eee",
                  color: form.difficulty === d ? "white" : "black" }}>
                {d}
              </button>
            ))}
            <button onClick={handleSubmit}
              style={{ marginLeft: "auto", background: "#22c55e", color: "white",
                padding: "6px 20px", borderRadius: "6px", border: "none", cursor: "pointer" }}>
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Company Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
        {companies.map(c => (
          <button key={c} onClick={() => setCompany(c)}
            style={{ padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: company === c ? "#4f46e5" : "#eee",
              color: company === c ? "white" : "black", fontSize: "13px" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Round Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {rounds.map(r => (
          <button key={r} onClick={() => setRound(r)}
            style={{ padding: "5px 14px", borderRadius: "6px", border: `1px solid ${round === r ? "#4f46e5" : "#ddd"}`,
              cursor: "pointer", background: "white",
              color: round === r ? "#4f46e5" : "#666", fontSize: "13px" }}>
            {r}
          </button>
        ))}
      </div>

      {/* Questions count */}
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "1rem" }}>
        Showing {filtered.length} questions
      </p>

      {/* Questions List */}
      {filtered.map((q, i) => (
        <div key={q._id} style={{ padding: "1rem 1.25rem", marginBottom: "10px",
          background: "white", borderRadius: "10px", border: "1px solid #eee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ margin: 0, fontSize: "15px", flex: 1, paddingRight: "1rem" }}>
              {i + 1}. {q.question}
            </p>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px", background: "#e0e7ff", color: "#4f46e5" }}>
                {q.round}
              </span>
              <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px",
                background: q.difficulty === "Easy" ? "#dcfce7" : q.difficulty === "Medium" ? "#fef9c3" : "#fee2e2",
                color: q.difficulty === "Easy" ? "green" : q.difficulty === "Medium" ? "#b45309" : "red" }}>
                {q.difficulty}
              </span>
            </div>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
          No questions found. Be the first to add one! 👆
        </div>
      )}
    </div>
  );
}