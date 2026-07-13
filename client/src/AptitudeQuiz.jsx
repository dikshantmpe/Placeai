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
      padding: 1.5rem;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      color: white;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
      max-width: 800px;
      background: #000000;
      min-height: 100vh;
    }

    /* --- SCROLLBAR STYLES (Grey) --- */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0a0a0a;
    }
    ::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
    ::-webkit-scrollbar-corner {
      background: #0a0a0a;
    }
    * {
      scrollbar-width: thin;
      scrollbar-color: #4b5563 #0a0a0a;
    }

    .glass-card {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(24px) saturate(140%);
      -webkit-backdrop-filter: blur(24px) saturate(140%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .glass-card:hover {
      background: rgba(0, 0, 0, 0.8);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.06);
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
      background: linear-gradient(135deg, #0d9488, #14b8a6);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 700;
      box-shadow: 0 8px 30px -6px rgba(13, 148, 136, 0.5);
      transition: all 0.3s ease;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .brand-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px -6px rgba(13, 148, 136, 0.6);
    }
    .brand-btn:disabled {
      background: rgba(255,255,255,0.05);
      color: #64748b;
      box-shadow: none;
      cursor: not-allowed;
      border: 1px solid rgba(255,255,255,0.1);
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

      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "linear-gradient(135deg, #115e59, #14b8a6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "800", fontSize: "1.1rem", color: "white"
        }}>
          C
        </div>
        <div>
          <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Crackin AI</div>
          <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
        </div>
      </header>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
          Aptitude <span style={{ color: "#14b8a6" }}>Quiz</span>
        </h2>
        <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>20 random questions — Quant, Logical & Verbal. 10 minutes timer.</p>
      </div>

      {/* Category Cards */}
      <div className="quiz-cats-grid">
        {[
          { cat: "Quant", desc: "Numbers, percentages, ratios", color: "#14b8a6" },
          { cat: "Logical", desc: "Patterns, sequences, puzzles", color: "#8b5cf6" },
          { cat: "Verbal", desc: "Grammar, comprehension", color: "#60a5fa" },
        ].map(({ cat, desc, color }) => (
          <div key={cat} className="glass-card" style={{
            padding: "1.5rem", textAlign: "center", transition: "transform 0.2s"
          }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
             onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontSize: "36px", marginBottom: "12px", filter: `drop-shadow(0 0 10px ${color}80)` }}>{categoryIcon[cat]}</div>
            <p style={{ fontWeight: "800", color, margin: "0 0 6px", fontSize: "15px", letterSpacing: "0.5px" }}>{cat}</p>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0, lineHeight: "1.5", fontWeight: "500" }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Info Row */}
      <div className="quiz-info-row">
        {[
          { icon: "❓", label: "20 Questions" },
          { icon: "⏱", label: "10 Minutes" },
          { icon: "🎯", label: "Instant Results" },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px", padding: "16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <span style={{ fontSize: "24px", marginBottom: "8px" }}>{item.icon}</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0", fontWeight: "600" }}>{item.label}</p>
          </div>
        ))}
      </div>

      <button onClick={startQuiz} disabled={loading} className="brand-btn">
        {loading ? (
          <>
            <span style={{ animation: "pulse-glow 1.5s infinite" }}>⏳</span> Fetching database...
          </>
        ) : "🚀 Start Quiz"}
      </button>
    </div>
  );

  // --- RESULTS SCREEN ---
  if (quizDone) {
    const score = getScore();
    const percent = Math.round((score / answers.length) * 100);
    const grade = percent >= 80 ? { label: "Excellent! 🎉", color: "#10b981", gradient: "linear-gradient(90deg, #10b981, #059669)" }
      : percent >= 60 ? { label: "Good Job! 👍", color: "#f59e0b", gradient: "linear-gradient(90deg, #f59e0b, #d97706)" }
      : { label: "Keep Practicing! 💪", color: "#f43f5e", gradient: "linear-gradient(90deg, #f43f5e, #e11d48)" };

    return (
      <div className="quiz-container">
        <style>{styles}</style>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 1.5rem" }}>Quiz Results</h2>

        {/* Score Card */}
        <div className="glass-card" style={{
          border: `1px solid ${grade.color}50`, padding: "2.5rem 1.5rem", textAlign: "center", marginBottom: "2rem",
          boxShadow: `0 0 30px ${grade.color}20`
        }}>
          <div style={{ fontSize: "64px", fontWeight: "800", color: grade.color, marginBottom: "12px", lineHeight: 1 }}>
            {score}<span style={{ fontSize: "28px", color: "#64748b" }}>/{answers.length}</span>
          </div>
          <p style={{ color: grade.color, fontWeight: "700", fontSize: "18px", margin: "0 0 20px" }}>
            {grade.label}
          </p>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", height: "10px", maxWidth: "400px", margin: "0 auto", overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, background: grade.gradient, height: "100%", borderRadius: "8px", transition: "width 1s cubic-bezier(0.2, 0.8, 0.2, 1)" }} />
          </div>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "12px", fontWeight: "600" }}>{percent}% Accuracy</p>
        </div>

        {/* Answer Review */}
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "1.25rem", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "4px", height: "18px", background: "#14b8a6", borderRadius: "2px" }}></span>
          Detailed Review
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "2rem" }}>
          {answers.map((a, i) => {
            const correct = a.selected === a.question.answer;
            return (
              <div key={i} className="glass-card" style={{
                border: `1px solid ${correct ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
                background: correct ? "rgba(16, 185, 129, 0.05)" : "rgba(244, 63, 94, 0.05)",
                padding: "1.25rem"
              }}>
                <p style={{ fontWeight: "600", margin: "0 0 12px", fontSize: "15px", color: "#e2e8f0", lineHeight: "1.6" }}>
                  <span style={{ color: "#64748b", marginRight: "8px" }}>Q{i + 1}.</span>
                  {a.question.question}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p style={{ margin: 0, color: "#34d399", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ background: "rgba(16,185,129,0.2)", padding: "2px 6px", borderRadius: "4px" }}>✓</span> 
                    {a.question.options[a.question.answer]}
                  </p>
                  {!correct && (
                    <p style={{ margin: 0, color: "#fb7185", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ background: "rgba(244,63,94,0.2)", padding: "2px 6px", borderRadius: "4px" }}>✗</span> 
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
        <div style={{
          background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)",
          color: "#fcd34d", padding: "12px 16px", borderRadius: "12px",
          display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "600",
          marginBottom: "1.5rem"
        }}>
          <span>⚠️</span> 
          <span>Connected to Offline Demo Quiz.</span>
        </div>
      )}

      <div className="quiz-header">
        <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>
          Question <span style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>{current + 1}</span> of {questions.length}
        </span>
        
        <span style={{
          background: timeLeft < 60 ? "rgba(244,63,94,0.1)" : "rgba(0, 0, 0, 0.3)",
          color: timeLeft < 60 ? "#f43f5e" : "#e2e8f0",
          padding: "6px 14px", borderRadius: "10px", fontWeight: "700", fontSize: "14px",
          border: `1px solid ${timeLeft < 60 ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.06)"}`,
          boxShadow: timeLeft < 60 ? "0 0 15px rgba(244,63,94,0.2)" : "none",
          display: "flex", alignItems: "center", gap: "6px", letterSpacing: "1px"
        }}>
          ⏱ {formatTime()}
        </span>
        
        <span style={{
          fontSize: "12px", background: "rgba(0, 0, 0, 0.3)", padding: "6px 12px",
          borderRadius: "8px", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.06)",
          fontWeight: "600", display: "flex", alignItems: "center", gap: "6px"
        }}>
          {categoryIcon[q.category]} {q.category} <span style={{ margin: "0 4px", color: "#444" }}>|</span> <span style={{ color: diffColor[q.difficulty] }}>{q.difficulty}</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", height: "6px", marginBottom: "2rem", overflow: "hidden" }}>
        <div style={{ width: `${progress}%`, background: "linear-gradient(90deg, #0d9488, #14b8a6)", height: "100%", borderRadius: "8px", transition: "width 0.4s ease-out", boxShadow: "0 0 10px rgba(20,184,166,0.5)" }} />
      </div>

      {/* Question Card */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "18px", fontWeight: "600", margin: 0, lineHeight: "1.6", color: "#fff" }}>{q.question}</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "2rem" }}>
        {q.options.map((opt, i) => {
          const isCorrect = selected !== null && i === q.answer;
          const isWrong = selected === i && i !== q.answer;
          
          return (
            <div key={i} onClick={() => handleSelect(i)} className="glass-card" style={{
              padding: "16px 20px", borderRadius: "14px", cursor: selected !== null ? "default" : "pointer",
              border: `1px solid ${isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.08)"}`,
              background: isCorrect ? "rgba(16,185,129,0.1)" : isWrong ? "rgba(244,63,94,0.1)" : "rgba(0, 0, 0, 0.5)",
              display: "flex", alignItems: "center", gap: "16px",
              boxShadow: isCorrect ? "0 0 15px rgba(16,185,129,0.2)" : isWrong ? "0 0 15px rgba(244,63,94,0.2)" : "none"
            }}>
              <span style={{
                width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "800",
                background: isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.05)",
                color: isCorrect || isWrong ? "white" : "#94a3b8",
                border: `1px solid ${isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.1)"}`
              }}>
                {["A", "B", "C", "D"][i]}
              </span>
              <span style={{ fontSize: "15px", fontWeight: "500", color: isCorrect ? "#34d399" : isWrong ? "#fb7185" : "#e2e8f0", lineHeight: "1.5" }}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <button onClick={handleNext} className="brand-btn" style={{ padding: "18px" }}>
          {current + 1 === questions.length ? "🏁 Submit Final Answer" : "Next Question →"}
        </button>
      )}
    </div>
  );
}