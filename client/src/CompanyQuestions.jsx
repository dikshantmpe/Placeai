import { useState, useEffect } from "react";
import axios from "axios";

const companies = ["All", "Google", "Amazon", "Microsoft", "Flipkart", "Infosys", "TCS"];
const rounds = ["All", "DSA", "System Design", "Technical", "HR"];
const companyColors = { Google: "#4285f4", Amazon: "#f90", Microsoft: "#00a4ef", Flipkart: "#2874f0", Infosys: "#007cc3", TCS: "#dc2626" };
const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
const diffBg = { Easy: "rgba(34,197,94,0.1)", Medium: "rgba(245,158,11,0.1)", Hard: "rgba(239,68,68,0.1)" };
const roundColor = { DSA: "#dc2626", "System Design": "#8b5cf6", Technical: "#3b82f6", HR: "#10b981" };

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
    <div style={{ 
      padding: "2.5rem 3rem", 
      maxWidth: "1000px",
      minHeight: "100vh",
      color: "#1f2937",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#f8fafc"
    }}>

      <style>{`
        /* --- SCROLLBAR STYLES (Light Grey) --- */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        ::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        .glass-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }

        .question-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .filter-btn {
          padding: 7px 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          background: #ffffff;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
        }
        .filter-btn.active {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: white;
          border-color: transparent;
          box-shadow: 0 8px 30px -6px rgba(13, 148, 136, 0.3);
          font-weight: 600;
        }

        .round-btn {
          padding: 5px 14px;
          border-radius: 8px;
          cursor: pointer;
          background: #ffffff;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid #e2e8f0;
        }
        .round-btn.active {
          background: rgba(20, 184, 166, 0.1);
          color: #14b8a6;
          border-color: rgba(20, 184, 166, 0.3);
          font-weight: 600;
        }

        .add-btn {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 8px 30px -6px rgba(13, 148, 136, 0.3);
          transition: all 0.3s ease;
        }
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -6px rgba(13, 148, 136, 0.4);
        }
        .add-btn.cancel {
          background: #f1f5f9;
          color: #64748b;
          box-shadow: none;
          border: 1px solid #e2e8f0;
        }
        .add-btn.cancel:hover {
          background: #e2e8f0;
        }

        .submit-btn {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: white;
          padding: 8px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);
        }
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(13, 148, 136, 0.4);
        }

        input, select, textarea {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          color: #1f2937;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        input:focus, select:focus, textarea:focus {
          border-color: rgba(20, 184, 166, 0.5);
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
        }
        input::placeholder, textarea::placeholder {
          color: #94a3b8;
        }
        select option {
          background: #ffffff;
          color: #1f2937;
        }
      `}</style>

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
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
            <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#1f2937" }}>Crackin AI</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`add-btn ${showForm ? "cancel" : ""}`}>
          {showForm ? "✕ Cancel" : "+ Add Question"}
        </button>
      </header>

      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em", color: "#1f2937" }}>
          Company <span style={{ color: "#14b8a6" }}>Questions</span>
        </h2>
        <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>Real interview questions from top companies.</p>
      </div>

      {/* Add Question Form */}
      {showForm && (
        <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.25rem", fontSize: "15px", fontWeight: "700", color: "#1f2937" }}>
            📝 Submit a Question You Faced
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px",
                textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Company</label>
              <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                style={{ width: "100%" }}>
                {companies.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px",
                textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>Round</label>
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
            <span style={{ fontSize: "12px", color: "#64748b", marginRight: "4px", fontWeight: "600" }}>Difficulty:</span>
            {["Easy", "Medium", "Hard"].map(d => (
              <button key={d} onClick={() => setForm({ ...form, difficulty: d })} style={{
                padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: form.difficulty === d ? `${diffColor[d]}18` : "#f1f5f9",
                color: form.difficulty === d ? diffColor[d] : "#64748b",
                fontWeight: form.difficulty === d ? "700" : "500", fontSize: "13px",
                border: `1px solid ${form.difficulty === d ? diffColor[d] + "55" : "#e2e8f0"}`,
                transition: "all 0.2s ease"
              }}>{d}</button>
            ))}
            <button onClick={handleSubmit} className="submit-btn" style={{ marginLeft: "auto" }}>
              Submit ✓
            </button>
          </div>
        </div>
      )}

      {/* Company Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
        {companies.map(c => (
          <button key={c} onClick={() => setCompany(c)} 
            className={`filter-btn ${company === c ? "active" : ""}`}
            style={company === c && c !== "All" ? {
              background: `${companyColors[c]}15`,
              color: companyColors[c],
              borderColor: `${companyColors[c]}40`
            } : {}}>
            {c}
          </button>
        ))}
      </div>

      {/* Round Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {rounds.map(r => (
          <button key={r} onClick={() => setRound(r)}
            className={`round-btn ${round === r ? "active" : ""}`}
            style={round === r && r !== "All" ? {
              background: `${roundColor[r]}15`,
              color: roundColor[r],
              borderColor: `${roundColor[r]}40`
            } : {}}>
            {r}
          </button>
        ))}
      </div>

      {/* Count */}
      <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "1rem", fontWeight: "500" }}>
        Showing <span style={{ color: "#1f2937", fontWeight: "700" }}>{filtered.length}</span> questions
        {company !== "All" && <span style={{ color: companyColors[company] }}> · {company}</span>}
        {round !== "All" && <span style={{ color: roundColor[round] }}> · {round}</span>}
      </p>

      {/* Questions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            <div style={{ width: "24px", height: "24px", border: "3px solid rgba(20,184,166,0.3)", borderTop: "3px solid #14b8a6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            Loading questions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px" }}>👆</p>
            <p style={{ margin: 0, color: "#64748b", fontWeight: "600" }}>No questions found. Be the first to add one!</p>
          </div>
        ) : filtered.map((q, i) => (
          <div key={q._id} className="question-card">
            <div style={{ display: "flex", gap: "14px", flex: 1, alignItems: "flex-start" }}>
              <span style={{ color: "#94a3b8", fontSize: "13px", minWidth: "24px", paddingTop: "2px", fontWeight: "700" }}>
                {String(i + 1).padStart(2, "0")}.
              </span>
              <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: "1.6", flex: 1, fontWeight: "500" }}>
                {q.question}
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={{
                fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                background: `${roundColor[q.round] || "#14b8a6"}15`,
                color: roundColor[q.round] || "#14b8a6",
                border: `1px solid ${roundColor[q.round] || "#14b8a6"}30`,
                fontWeight: "600"
              }}>
                {q.round}
              </span>
              <span style={{
                fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                background: diffBg[q.difficulty], color: diffColor[q.difficulty],
                border: `1px solid ${diffColor[q.difficulty]}30`,
                fontWeight: "600"
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