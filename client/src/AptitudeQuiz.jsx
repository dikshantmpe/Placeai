import { useState, useEffect } from "react";
import axios from "axios";

const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
const categoryIcon = { Quant: "🔢", Logical: "🧩", Verbal: "📝" };

export default function AptitudeQuiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    if (!quizStarted || quizDone) return;
    if (timeLeft === 0) { finishQuiz(); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizDone]);

  const startQuiz = async () => {
    const res = await axios.get("https://placeai-sqjj.onrender.com/api/quiz");
    setQuestions(res.data);
    setQuizStarted(true);
    setQuizDone(false);
    setCurrent(0);
    setAnswers([]);
    setTimeLeft(600);
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

  // Start Screen
  if (!quizStarted && !quizDone) return (
    <div style={{ padding: "2rem", maxWidth: "700px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}>Aptitude Quiz</h2>
        <p style={{ color: "#555", margin: 0, fontSize: "14px" }}>20 random questions — Quant, Logical & Verbal. 10 minutes timer.</p>
      </div>

      {/* Category Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "2rem" }}>
        {[
          { cat: "Quant", desc: "Numbers, percentages, ratios", color: "#dc2626" },
          { cat: "Logical", desc: "Patterns, sequences, puzzles", color: "#7c3aed" },
          { cat: "Verbal", desc: "Grammar, comprehension", color: "#2563eb" },
        ].map(({ cat, desc, color }) => (
          <div key={cat} style={{
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "14px", padding: "20px", textAlign: "center"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>{categoryIcon[cat]}</div>
            <p style={{ fontWeight: "700", color, margin: "0 0 6px", fontSize: "15px" }}>{cat}</p>
            <p style={{ color: "#555", fontSize: "12px", margin: 0, lineHeight: "1.5" }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Info Row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "2rem" }}>
        {[
          { icon: "❓", label: "20 Questions" },
          { icon: "⏱", label: "10 Minutes" },
          { icon: "🎯", label: "Instant Results" },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "10px", padding: "12px", textAlign: "center"
          }}>
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#888" }}>{item.label}</p>
          </div>
        ))}
      </div>

      <button onClick={startQuiz} style={{
        background: "#dc2626", color: "white", padding: "14px 32px", width: "100%",
        borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "15px",
        fontWeight: "600", boxShadow: "0 4px 20px rgba(220,38,38,0.3)"
      }}>
        🚀 Start Quiz
      </button>
    </div>
  );

  // Results Screen
  if (quizDone) {
    const score = getScore();
    const percent = Math.round((score / answers.length) * 100);
    const grade = percent >= 80 ? { label: "Excellent! 🎉", color: "#22c55e" }
      : percent >= 60 ? { label: "Good Job! 👍", color: "#f59e0b" }
      : { label: "Keep Practicing! 💪", color: "#ef4444" };

    return (
      <div style={{ padding: "2rem", maxWidth: "700px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 1.5rem" }}>Quiz Results</h2>

        {/* Score Card */}
        <div style={{
          background: "#111", border: `1px solid ${grade.color}33`,
          borderRadius: "16px", padding: "2rem", textAlign: "center", marginBottom: "1.5rem"
        }}>
          <div style={{ fontSize: "56px", fontWeight: "800", color: grade.color, marginBottom: "8px" }}>
            {score}<span style={{ fontSize: "28px", color: "#333" }}>/{answers.length}</span>
          </div>
          <p style={{ color: grade.color, fontWeight: "600", fontSize: "16px", margin: "0 0 16px" }}>
            {grade.label}
          </p>
          <div style={{ background: "#1f1f1f", borderRadius: "8px", height: "8px", maxWidth: "300px", margin: "0 auto" }}>
            <div style={{ width: `${percent}%`, background: grade.color, height: "8px", borderRadius: "8px", transition: "width 0.6s" }} />
          </div>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "8px" }}>{percent}% correct</p>
        </div>

        {/* Answer Review */}
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "1rem", color: "#aaa" }}>Answer Review</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.5rem" }}>
          {answers.map((a, i) => {
            const correct = a.selected === a.question.answer;
            return (
              <div key={i} style={{
                background: "#111", border: `1px solid ${correct ? "#22c55e33" : "#ef444433"}`,
                borderRadius: "12px", padding: "16px"
              }}>
                <p style={{ fontWeight: "500", margin: "0 0 10px", fontSize: "14px", color: "#ddd" }}>
                  <span style={{ color: "#555", marginRight: "8px" }}>Q{i + 1}.</span>
                  {a.question.question}
                </p>
                <p style={{ margin: "4px 0", color: "#22c55e", fontSize: "13px" }}>
                  ✅ {a.question.options[a.question.answer]}
                </p>
                {!correct && (
                  <p style={{ margin: "4px 0", color: "#ef4444", fontSize: "13px" }}>
                    ❌ Your answer: {a.selected !== null ? a.question.options[a.selected] : "Not answered"}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => { setQuizDone(false); setAnswers([]); }} style={{
          background: "#dc2626", color: "white", padding: "12px 32px", width: "100%",
          borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600"
        }}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  // Quiz Screen
  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ padding: "2rem", maxWidth: "700px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ fontSize: "13px", color: "#555" }}>
          Question <span style={{ color: "white", fontWeight: "600" }}>{current + 1}</span> of {questions.length}
        </span>
        <span style={{
          background: timeLeft < 60 ? "rgba(239,68,68,0.15)" : "rgba(220,38,38,0.1)",
          color: timeLeft < 60 ? "#ef4444" : "#dc2626",
          padding: "6px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "15px",
          border: `1px solid ${timeLeft < 60 ? "#ef444433" : "#dc262633"}`
        }}>
          ⏱ {formatTime()}
        </span>
        <span style={{
          fontSize: "11px", background: "#1f1f1f", padding: "5px 12px",
          borderRadius: "6px", color: "#888", border: "1px solid #2a2a2a"
        }}>
          {categoryIcon[q.category]} {q.category} ·{" "}
          <span style={{ color: diffColor[q.difficulty] }}>{q.difficulty}</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#1f1f1f", borderRadius: "8px", height: "4px", marginBottom: "1.5rem" }}>
        <div style={{ width: `${progress}%`, background: "#dc2626", height: "4px", borderRadius: "8px", transition: "width 0.3s" }} />
      </div>

      {/* Question */}
      <div style={{
        background: "#111", border: "1px solid #1f1f1f",
        borderRadius: "14px", padding: "1.5rem", marginBottom: "1.5rem"
      }}>
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0, lineHeight: "1.7", color: "#fff" }}>{q.question}</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.5rem" }}>
        {q.options.map((opt, i) => {
          const isCorrect = selected !== null && i === q.answer;
          const isWrong = selected === i && i !== q.answer;
          const isNeutral = selected === null;
          return (
            <div key={i} onClick={() => handleSelect(i)} style={{
              padding: "14px 18px", borderRadius: "12px", cursor: selected !== null ? "default" : "pointer",
              border: `2px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isNeutral ? "#1f1f1f" : "#1f1f1f"}`,
              background: isCorrect ? "rgba(34,197,94,0.1)" : isWrong ? "rgba(239,68,68,0.1)" : "#111",
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: "12px"
            }}>
              <span style={{
                width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700",
                background: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#1f1f1f",
                color: isCorrect || isWrong ? "white" : "#555",
                border: `1px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#2a2a2a"}`
              }}>
                {["A", "B", "C", "D"][i]}
              </span>
              <span style={{ fontSize: "14px", color: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#ccc" }}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <button onClick={handleNext} style={{
          background: "#dc2626", color: "white", padding: "12px 32px", width: "100%",
          borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px",
          fontWeight: "600", boxShadow: "0 4px 20px rgba(220,38,38,0.3)"
        }}>
          {current + 1 === questions.length ? "🏁 Finish Quiz" : "Next Question →"}
        </button>
      )}
    </div>
  );
}