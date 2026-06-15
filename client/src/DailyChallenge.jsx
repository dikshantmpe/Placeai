import { useEffect, useState } from "react";
import axios from "axios";

const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
const diffBg = { Easy: "#22c55e18", Medium: "#f59e0b18", Hard: "#ef444418" };

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dsaDone, setDsaDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem("streak") || "0");
    const lastDate = localStorage.getItem("lastDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastDate && lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split("T")[0];
      if (lastDate !== yDate) { localStorage.setItem("streak", "0"); setStreak(0); }
      else setStreak(savedStreak);
    } else setStreak(savedStreak);

    const savedDsa = localStorage.getItem(`dsa_${today}`) === "true";
    const savedQuiz = localStorage.getItem(`quiz_${today}`) === "true";
    setDsaDone(savedDsa);
    setQuizDone(savedQuiz);

    axios.get("https://placeai-sqjj.onrender.com/api/daily")
      .then(res => { setChallenge(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const markDSADone = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`dsa_${today}`, "true");
    setDsaDone(true);
    updateStreak();
  };

  const markQuizDone = (index) => {
    setSelectedAnswer(index);
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`quiz_${today}`, "true");
    setQuizDone(true);
    updateStreak();
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split("T")[0];
    const savedDsa = localStorage.getItem(`dsa_${today}`) === "true";
    const savedQuiz = localStorage.getItem(`quiz_${today}`) === "true";
    const lastDate = localStorage.getItem("lastDate");
    if ((savedDsa || dsaDone) && (savedQuiz || quizDone) && lastDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", newStreak.toString());
      localStorage.setItem("lastDate", today);
    }
  };

  if (loading) return (
    <div style={{ padding: "2rem", color: "#555", display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
      Loading today's challenge...
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!challenge) return (
    <div style={{ padding: "2rem" }}>
      <div style={{ background: "#111", border: "1px solid #f59e0b33", borderRadius: "14px",
        padding: "2rem", textAlign: "center", maxWidth: "500px" }}>
        <p style={{ fontSize: "32px", margin: "0 0 12px" }}>⏳</p>
        <p style={{ color: "#f59e0b", fontWeight: "600", margin: "0 0 8px" }}>Waking up server...</p>
        <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Please wait 30 seconds and refresh the page.</p>
      </div>
    </div>
  );

  const bothDone = dsaDone && quizDone;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const progress = bothDone ? 100 : dsaDone || quizDone ? 50 : 0;

  return (
    <div className="daily-container">

      {/* Header */}
      <div className="daily-header">
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 4px" }}>Daily Challenge 🔥</h2>
          <p style={{ color: "#555", margin: 0, fontSize: "13px" }}>{today}</p>
        </div>

        {/* Streak */}
        <div style={{
          background: streak > 0 ? "rgba(249,115,22,0.1)" : "#111",
          border: `2px solid ${streak > 0 ? "#f9731655" : "#1f1f1f"}`,
          borderRadius: "14px", padding: "12px 18px", textAlign: "center", minWidth: "80px"
        }}>
          <p style={{ margin: 0, fontSize: "24px" }}>🔥</p>
          <p style={{ margin: "2px 0", fontWeight: "800", fontSize: "22px",
            color: streak > 0 ? "#f97316" : "#333" }}>{streak}</p>
          <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>day streak</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "12px",
        padding: "14px 16px", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "#aaa" }}>Today's Progress</span>
          <span style={{ fontSize: "12px", color: bothDone ? "#22c55e" : "#555" }}>
            {bothDone ? "2/2 Complete ✅" : dsaDone || quizDone ? "1/2 Done" : "0/2 Done"}
          </span>
        </div>
        <div style={{ background: "#1f1f1f", borderRadius: "8px", height: "6px" }}>
          <div style={{
            width: `${progress}%`,
            background: bothDone ? "#22c55e" : "#dc2626",
            height: "6px", borderRadius: "8px", transition: "width 0.5s"
          }} />
        </div>
      </div>

      {/* Completion Banner */}
      {bothDone && (
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid #22c55e33",
          borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.25rem", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#22c55e", fontWeight: "600" }}>
            🎉 You completed today's challenge! Come back tomorrow to keep your streak!
          </p>
        </div>
      )}

      {/* DSA Challenge */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f",
        borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px",
              background: "#dc262618", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px", border: "1px solid #dc262633" }}>💻</div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>DSA Problem</h3>
          </div>
          <span style={{
            background: dsaDone ? "#22c55e18" : "#1f1f1f",
            color: dsaDone ? "#22c55e" : "#555",
            padding: "3px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600",
            border: `1px solid ${dsaDone ? "#22c55e33" : "#2a2a2a"}`
          }}>
            {dsaDone ? "✅ Done" : "Pending"}
          </span>
        </div>

        <p style={{ fontSize: "15px", fontWeight: "600", margin: "0 0 10px", color: "#fff" }}>
          {challenge.dsa.title}
        </p>

        <div style={{ display: "flex", gap: "6px", marginBottom: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px",
            background: "#dc262618", color: "#dc2626", border: "1px solid #dc262633" }}>
            {challenge.dsa.topic}
          </span>
          <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px",
            background: diffBg[challenge.dsa.difficulty],
            color: diffColor[challenge.dsa.difficulty],
            border: `1px solid ${diffColor[challenge.dsa.difficulty]}33` }}>
            {challenge.dsa.difficulty}
          </span>
        </div>

        <div className="daily-buttons">
          <a href={challenge.dsa.link} target="_blank" rel="noreferrer" style={{
            background: "#dc2626", color: "white", padding: "9px 18px",
            borderRadius: "8px", textDecoration: "none", fontSize: "13px",
            fontWeight: "600", boxShadow: "0 4px 15px rgba(220,38,38,0.3)"
          }}>
            Solve on LeetCode →
          </a>
          {!dsaDone && (
            <button onClick={markDSADone} style={{
              background: "#22c55e18", color: "#22c55e", padding: "9px 18px",
              borderRadius: "8px", border: "1px solid #22c55e33",
              cursor: "pointer", fontSize: "13px", fontWeight: "600"
            }}>
              Mark as Done ✅
            </button>
          )}
        </div>
      </div>

      {/* Quiz Challenge */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px",
              background: "#05966918", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px", border: "1px solid #05966933" }}>🧠</div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Aptitude Question</h3>
          </div>
          <span style={{
            background: quizDone ? "#22c55e18" : "#1f1f1f",
            color: quizDone ? "#22c55e" : "#555",
            padding: "3px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600",
            border: `1px solid ${quizDone ? "#22c55e33" : "#2a2a2a"}`
          }}>
            {quizDone ? "✅ Done" : "Pending"}
          </span>
        </div>

        <p style={{ fontSize: "14px", fontWeight: "500", margin: "0 0 1rem", color: "#ddd", lineHeight: "1.6" }}>
          {challenge.quiz.question}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {challenge.quiz.options.map((opt, i) => {
            const isCorrect = (selectedAnswer !== null || quizDone) && i === challenge.quiz.answer;
            const isWrong = selectedAnswer === i && i !== challenge.quiz.answer;
            return (
              <div key={i} onClick={() => !quizDone && markQuizDone(i)} style={{
                padding: "11px 14px", borderRadius: "10px",
                cursor: quizDone ? "default" : "pointer",
                border: `2px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#1f1f1f"}`,
                background: isCorrect ? "rgba(34,197,94,0.08)" : isWrong ? "rgba(239,68,68,0.08)" : "#161616",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px"
              }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "6px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: "700",
                  background: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#1f1f1f",
                  color: isCorrect || isWrong ? "white" : "#555",
                  border: `1px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#2a2a2a"}`
                }}>
                  {["A", "B", "C", "D"][i]}
                </span>
                <span style={{ fontSize: "13px", color: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#ccc" }}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>

        {quizDone && (
          <div style={{ marginTop: "1rem", padding: "10px 14px", background: "rgba(34,197,94,0.08)",
            border: "1px solid #22c55e33", borderRadius: "8px" }}>
            <p style={{ color: "#22c55e", fontWeight: "600", margin: 0, fontSize: "13px" }}>
              ✅ Correct answer: {challenge.quiz.options[challenge.quiz.answer]}
            </p>
          </div>
        )}
      </div>

      <style>{`
        .daily-container {
          padding: 1.5rem;
          max-width: 750px;
        }

        .daily-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .daily-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .daily-container {
            padding: 1rem;
          }

          .daily-header {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}