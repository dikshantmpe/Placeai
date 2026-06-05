import { useState, useEffect } from "react";
import axios from "axios";

export default function AptitudeQuiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  // Timer
  useEffect(() => {
    if (!quizStarted || quizDone) return;
    if (timeLeft === 0) { finishQuiz(); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizDone]);

  const startQuiz = async () => {
    const res = await axios.get("http://localhost:5000/api/quiz");
    setQuestions(res.data);
    setQuizStarted(true);
    setQuizDone(false);
    setCurrent(0);
    setAnswers([]);
    setTimeLeft(600);
  };

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
  };

  const handleNext = () => {
    const newAnswers = [...answers, { question: questions[current], selected }];
    setAnswers(newAnswers);
    setSelected(null);

    if (current + 1 >= questions.length) {
      finishQuiz(newAnswers);
    } else {
      setCurrent(current + 1);
    }
  };

  const finishQuiz = (finalAnswers = answers) => {
    setQuizDone(true);
    setQuizStarted(false);
  };

  const getScore = () => answers.filter(a => a.selected === a.question.answer).length;

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  // Start Screen
  if (!quizStarted && !quizDone) {
    return (
      <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <h2>Aptitude Quiz</h2>
        <p style={{ color: "#666" }}>20 random questions — Quant, Logical & Verbal. 10 minutes timer.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", margin: "2rem 0" }}>
          {["Quant", "Logical", "Verbal"].map(c => (
            <div key={c} style={{ background: "#f0f0ff", padding: "1rem 2rem", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontWeight: "600", color: "#4f46e5", margin: 0 }}>{c}</p>
              <p style={{ color: "#666", fontSize: "13px", margin: "4px 0 0" }}>included</p>
            </div>
          ))}
        </div>
        <button onClick={startQuiz}
          style={{ background: "#4f46e5", color: "white", padding: "12px 32px",
            borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "500" }}>
          Start Quiz 🚀
        </button>
      </div>
    );
  }

  // Results Screen
  if (quizDone) {
    const score = getScore();
    const percent = Math.round((score / answers.length) * 100);
    return (
      <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
        <h2>Quiz Results</h2>
        <div style={{ background: percent >= 60 ? "#e6ffed" : "#fff0f0", padding: "1.5rem",
          borderRadius: "12px", textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ color: percent >= 60 ? "green" : "red", margin: 0 }}>{score} / {answers.length}</h1>
          <p style={{ color: "#666", margin: "8px 0 0" }}>{percent}% — {percent >= 80 ? "Excellent! 🎉" : percent >= 60 ? "Good Job! 👍" : "Keep Practicing! 💪"}</p>
        </div>

        {/* Answer Review */}
        {answers.map((a, i) => (
          <div key={i} style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "10px",
            background: a.selected === a.question.answer ? "#f0fff4" : "#fff5f5",
            border: `1px solid ${a.selected === a.question.answer ? "#c6f6d5" : "#fed7d7"}` }}>
            <p style={{ fontWeight: "500", margin: "0 0 8px" }}>Q{i + 1}. {a.question.question}</p>
            <p style={{ margin: "4px 0", color: "green", fontSize: "14px" }}>
              ✅ Correct: {a.question.options[a.question.answer]}
            </p>
            {a.selected !== a.question.answer && (
              <p style={{ margin: "4px 0", color: "red", fontSize: "14px" }}>
                ❌ Your answer: {a.selected !== null ? a.question.options[a.selected] : "Not answered"}
              </p>
            )}
          </div>
        ))}

        <button onClick={() => { setQuizDone(false); setAnswers([]); }}
          style={{ background: "#4f46e5", color: "white", padding: "10px 24px",
            borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", marginTop: "1rem" }}>
          Try Again
        </button>
      </div>
    );
  }

  // Quiz Screen
  const q = questions[current];
  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>Question {current + 1} of {questions.length}</span>
        <span style={{ background: timeLeft < 60 ? "#fff0f0" : "#f0f0ff", color: timeLeft < 60 ? "red" : "#4f46e5",
          padding: "6px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "15px" }}>
          ⏱ {formatTime()}
        </span>
        <span style={{ fontSize: "13px", background: "#eee", padding: "4px 10px", borderRadius: "6px" }}>
          {q.category} — {q.difficulty}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#eee", borderRadius: "8px", height: "6px", marginBottom: "1.5rem" }}>
        <div style={{ width: `${((current + 1) / questions.length) * 100}%`,
          background: "#4f46e5", height: "6px", borderRadius: "8px", transition: "width 0.3s" }} />
      </div>

      {/* Question */}
      <div style={{ background: "#f9f9f9", padding: "1.5rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "17px", fontWeight: "500", margin: 0 }}>{q.question}</p>
      </div>

      {/* Options */}
      {q.options.map((opt, i) => (
        <div key={i} onClick={() => handleSelect(i)}
          style={{
            padding: "12px 16px", marginBottom: "10px", borderRadius: "10px", cursor: "pointer",
            border: `2px solid ${selected === null ? "#eee" : i === q.answer ? "#48bb78" : selected === i ? "#fc8181" : "#eee"}`,
            background: selected === null ? "white" : i === q.answer ? "#f0fff4" : selected === i ? "#fff5f5" : "white",
            transition: "all 0.2s", fontSize: "15px"
          }}>
          <span style={{ fontWeight: "500", marginRight: "10px", color: "#4f46e5" }}>
            {["A", "B", "C", "D"][i]}.
          </span>
          {opt}
        </div>
      ))}

      {/* Next Button */}
      {selected !== null && (
        <button onClick={handleNext}
          style={{ marginTop: "1rem", background: "#4f46e5", color: "white", padding: "10px 28px",
            borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: "500" }}>
          {current + 1 === questions.length ? "Finish Quiz" : "Next Question →"}
        </button>
      )}
    </div>
  );
}