import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "./firebase.js";

const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };
const categoryIcon = { Quant: "🔢", Logical: "🧩", Verbal: "📝" };

export default function AptitudeQuiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (!quizStarted || quizDone) return;
    if (timeLeft === 0) { finishQuiz(); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizDone]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError("");
      setIsDemoMode(false);

      const timestamp = Date.now();
      let token = localStorage.getItem("token");
      if (auth.currentUser) token = await auth.currentUser.getIdToken();

      const res = await axios.get(
        `https://placeai-sqjj.onrender.com/api/quiz?t=${timestamp}`,
        {
          headers: { 
            "Cache-Control": "no-cache",
            Authorization: `Bearer ${token}` 
          },
          timeout: 10000
        }
      );

      let quizQuestions = [];
      if (Array.isArray(res.data)) quizQuestions = res.data;
      else if (Array.isArray(res.data?.questions)) quizQuestions = res.data.questions;
      else if (Array.isArray(res.data?.data)) quizQuestions = res.data.data;

      quizQuestions = quizQuestions.filter(q => q && q.question && Array.isArray(q.options) && q.options.length === 4);

      if (quizQuestions.length === 0) throw new Error("No valid questions received from server");

      setQuestions(quizQuestions);
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setTimeLeft(600);
      setQuizStarted(true);
      setQuizDone(false);

    } catch (err) {
      console.error("Quiz Error, engaging Demo Mode:", err);
      setIsDemoMode(true);

      setQuestions([
        { question: "If the price of an item is increased by 20% and then decreased by 20%, what is the net change?", options: ["No change", "4% decrease", "4% increase", "2% decrease"], answer: 1, category: "Quant", difficulty: "Medium" },
        { question: "Which word does NOT belong with the others?", options: ["Parsley", "Basil", "Dill", "Mayonnaise"], answer: 3, category: "Logical", difficulty: "Easy" },
        { question: "A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: ["120 metres", "180 metres", "324 metres", "150 metres"], answer: 3, category: "Quant", difficulty: "Medium" },
        { question: "Choose the word most similar in meaning to 'ABUNDANT':", options: ["Scarce", "Plentiful", "Minimal", "Rare"], answer: 1, category: "Verbal", difficulty: "Easy" },
        { question: "If A is the brother of B; B is the sister of C; and C is the father of D, how is D related to A?", options: ["Brother", "Sister", "Nephew", "Cannot be determined"], answer: 3, category: "Logical", difficulty: "Hard" }
      ]);
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setTimeLeft(300);
      setQuizStarted(true);
      setQuizDone(false);

    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index) => { if (selected !== null) return; setSelected(index); };

  const handleNext = () => {
    const newAnswers = [...answers, { question: questions[current], selected }];
    setAnswers(newAnswers);
    setSelected(null);
    if (current + 1 >= questions.length) finishQuiz(newAnswers);
    else setCurrent(current + 1);
  };

  const finishQuiz = (finalAnswers = answers) => { setQuizDone(true); setQuizStarted(false); };
  const getScore = () => answers.filter(a => a.selected === a.question.answer).length;
  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const styles = `
    .quiz-container {
      padding: 2rem;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      color: #1f2937;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      max-width: 900px;
      background: #f8fafc;
      min-height: 100vh;
      margin: 0 auto;
    }

    .dashboard-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    .quiz-cats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .quiz-info-row {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .quiz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      gap: 12px;
      flex-wrap: wrap;
    }

    .brand-btn {
      background: #14b8a6;
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      transition: background 0.2s ease;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .brand-btn:hover:not(:disabled) {
      background: #0d9488;
    }
    .brand-btn:disabled {
      background: #cbd5e1;
      color: #64748b;
      box-shadow: none;
      cursor: not-allowed;
    }

    .option-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .option-card:hover {
      border-color: #14b8a6;
    }

    .option-letter {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    @media (max-width: 768px) {
      .quiz-container { padding: 1rem; }
      .quiz-cats-grid { gap: 12px; }
      .quiz-info-row { gap: 12px; flex-direction: column; }
    }
  `;

  // --- START SCREEN ---
  if (!quizStarted && !quizDone) return (
    <div className="quiz-container">
      <style>{styles}</style>

      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "#14b8a6",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "800", fontSize: "1.1rem", color: "white"
        }}>
          C
        </div>
        <div>
          <div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#1f2937", letterSpacing: "-0.02em" }}>Crackin AI</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>An AI Powered Placement Preparation Platform</div>
        </div>
      </header>

      <div className="dashboard-card" style={{ padding: "2.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
          <span style={{ color: "#14b8a6", fontSize: "14px" }}>⚡</span>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#14b8a6", letterSpacing: "0.5px", textTransform: "uppercase" }}>AI Placement Strategy</span>
        </div>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 12px 0", letterSpacing: "-0.02em", color: "#1f2937", lineHeight: 1.2 }}>
          Accelerate Your <span style={{ color: "#14b8a6" }}>Placement Journey</span>
        </h2>
        <p style={{ color: "#64748b", margin: "0 0 2rem 0", fontSize: "1rem", lineHeight: 1.6, maxWidth: "500px" }}>
          Your personalized AI command center. Leverage smart tools, track real-time progress, and master technical skills to crack your dream company.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button onClick={startQuiz} disabled={loading} className="brand-btn" style={{ width: "auto", padding: "14px 28px" }}>
            {loading ? (
              <>
                <span style={{ animation: "pulse-glow 1.5s infinite" }}>⏳</span> Fetching database...
              </>
            ) : (
              <>🚀 Start Practicing →</>
            )}
          </button>
          <button disabled className="brand-btn" style={{ width: "auto", background: "#ffffff", color: "#374151", border: "1px solid #e2e8f0", boxShadow: "none" }}>
            📊 View Analytics
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="quiz-cats-grid">
        {[
          { cat: "Quant", desc: "Numbers, percentages, ratios", color: "#14b8a6", iconBg: "#f0fdfa" },
          { cat: "Logical", desc: "Patterns, sequences, puzzles", color: "#8b5cf6", iconBg: "#f5f3ff" },
          { cat: "Verbal", desc: "Grammar, comprehension", color: "#3b82f6", iconBg: "#eff6ff" },
        ].map(({ cat, desc, color, iconBg }) => (
          <div key={cat} className="dashboard-card" style={{ padding: "1.5rem", textAlign: "left" }}>
            <div style={{ 
              width: "44px", height: "44px", borderRadius: "10px", 
              background: iconBg, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", marginBottom: "12px"
            }}>
              {categoryIcon[cat]}
            </div>
            <p style={{ fontWeight: "700", color: "#1f2937", margin: "0 0 6px", fontSize: "15px" }}>{cat}</p>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Info Row */}
      <div className="quiz-info-row">
        {[
          { icon: "❓", label: "20 Questions", sub: "Mixed difficulty" },
          { icon: "⏱", label: "10 Minutes", sub: "Timed assessment" },
          { icon: "🎯", label: "Instant Results", sub: "Detailed review" },
        ].map((item, i) => (
          <div key={i} className="dashboard-card" style={{
            flex: 1, padding: "1.25rem", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px"
          }}>
            <span style={{ fontSize: "24px" }}>{item.icon}</span>
            <p style={{ margin: 0, fontSize: "14px", color: "#1f2937", fontWeight: "700" }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // --- RESULTS SCREEN ---
  if (quizDone) {
    const score = getScore();
    const percent = Math.round((score / answers.length) * 100);
    const grade = percent >= 80 ? { label: "Excellent! 🎉", color: "#10b981", bg: "#f0fdf4" }
      : percent >= 60 ? { label: "Good Job! 👍", color: "#f59e0b", bg: "#fffbeb" }
      : { label: "Keep Practicing! 💪", color: "#f43f5e", bg: "#fff1f2" };

    return (
      <div className="quiz-container">
        <style>{styles}</style>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 1.5rem", color: "#1f2937" }}>Quiz Results</h2>

        {/* Score Card */}
        <div className="dashboard-card" style={{
          border: `1px solid ${grade.color}30`, padding: "2.5rem 1.5rem", textAlign: "center", marginBottom: "2rem", background: grade.bg
        }}>
          <div style={{ fontSize: "56px", fontWeight: "800", color: grade.color, marginBottom: "8px", lineHeight: 1 }}>
            {score}<span style={{ fontSize: "24px", color: "#64748b" }}>/{answers.length}</span>
          </div>
          <p style={{ color: grade.color, fontWeight: "700", fontSize: "16px", margin: "0 0 20px" }}>
            {grade.label}
          </p>
          <div style={{ background: "#e2e8f0", borderRadius: "8px", height: "10px", maxWidth: "400px", margin: "0 auto", overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, background: grade.color, height: "100%", borderRadius: "8px", transition: "width 1s cubic-bezier(0.2, 0.8, 0.2, 1)" }} />
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "12px", fontWeight: "600" }}>{percent}% Accuracy</p>
        </div>

        {/* Answer Review */}
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "1.25rem", color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "4px", height: "18px", background: "#14b8a6", borderRadius: "2px" }}></span>
          Detailed Review
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "2rem" }}>
          {answers.map((a, i) => {
            const correct = a.selected === a.question.answer;
            return (
              <div key={i} className="dashboard-card" style={{
                border: `1px solid ${correct ? "#10b98130" : "#f43f5e30"}`,
                background: correct ? "#f0fdf4" : "#fff1f2",
                padding: "1.25rem"
              }}>
                <p style={{ fontWeight: "600", margin: "0 0 12px", fontSize: "15px", color: "#1f2937", lineHeight: "1.6" }}>
                  <span style={{ color: "#64748b", marginRight: "8px" }}>Q{i + 1}.</span>
                  {a.question.question}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p style={{ margin: 0, color: "#059669", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ background: "#10b98120", padding: "2px 6px", borderRadius: "4px", color: "#059669" }}>✓</span> 
                    {a.question.options[a.question.answer]}
                  </p>
                  {!correct && (
                    <p style={{ margin: 0, color: "#e11d48", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ background: "#f43f5e20", padding: "2px 6px", borderRadius: "4px", color: "#e11d48" }}>✗</span> 
                      Your answer: {a.selected !== null ? a.question.options[a.selected] : "Not answered"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => { setQuizDone(false); setAnswers([]); setError(""); }} className="brand-btn">
          🔄 Retake Quiz
        </button>
      </div>
    );
  }

  // --- QUIZ ACTIVE SCREEN ---
  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <style>{styles}</style>

      {isDemoMode && (
        <div className="dashboard-card" style={{
          background: "#fffbeb", border: "1px solid #fcd34d",
          color: "#92400e", padding: "12px 16px", borderRadius: "12px",
          display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "600",
          marginBottom: "1.5rem"
        }}>
          <span>⚠️</span> 
          <span>Connected to Offline Demo Quiz.</span>
        </div>
      )}

      <div className="dashboard-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div className="quiz-header" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
            Question <span style={{ color: "#1f2937", fontWeight: "700", fontSize: "16px" }}>{current + 1}</span> of {questions.length}
          </span>

          <span style={{
            background: timeLeft < 60 ? "#fef2f2" : "#f8fafc",
            color: timeLeft < 60 ? "#dc2626" : "#1f2937",
            padding: "6px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "14px",
            border: `1px solid ${timeLeft < 60 ? "#fecaca" : "#e2e8f0"}`,
            display: "flex", alignItems: "center", gap: "6px", letterSpacing: "1px"
          }}>
            ⏱ {formatTime()}
          </span>

          <span style={{
            fontSize: "12px", background: "#f8fafc", padding: "6px 12px",
            borderRadius: "8px", color: "#64748b", border: "1px solid #e2e8f0",
            fontWeight: "600", display: "flex", alignItems: "center", gap: "6px"
          }}>
            {categoryIcon[q.category]} {q.category} <span style={{ margin: "0 4px", color: "#cbd5e1" }}>|</span> <span style={{ color: diffColor[q.difficulty] }}>{q.difficulty}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ background: "#e2e8f0", borderRadius: "6px", height: "6px", marginTop: "1.25rem", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, background: "#14b8a6", height: "100%", borderRadius: "6px", transition: "width 0.4s ease-out" }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="dashboard-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "18px", fontWeight: "600", margin: 0, lineHeight: "1.6", color: "#1f2937" }}>{q.question}</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "2rem" }}>
        {q.options.map((opt, i) => {
          const isCorrect = selected !== null && i === q.answer;
          const isWrong = selected === i && i !== q.answer;

          return (
            <div key={i} onClick={() => handleSelect(i)} className="option-card" style={{
              cursor: selected !== null ? "default" : "pointer",
              border: `1px solid ${isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "#e2e8f0"}`,
              background: isCorrect ? "#f0fdf4" : isWrong ? "#fff1f2" : "#ffffff",
            }}>
              <span className="option-letter" style={{
                background: isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "#f1f5f9",
                color: isCorrect || isWrong ? "white" : "#64748b",
                border: `1px solid ${isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "#e2e8f0"}`
              }}>
                {["A", "B", "C", "D"][i]}
              </span>
              <span style={{ fontSize: "15px", fontWeight: "500", color: isCorrect ? "#059669" : isWrong ? "#e11d48" : "#374151", lineHeight: "1.5" }}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <button onClick={handleNext} className="brand-btn" style={{ padding: "16px" }}>
          {current + 1 === questions.length ? "🏁 Submit Final Answer" : "Next Question →"}
        </button>
      )}
    </div>
  );
}