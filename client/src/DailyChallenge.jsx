import { useEffect, useState } from "react";
import axios from "axios";

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dsaDone, setDsaDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load streak and today's completion from localStorage
    const savedStreak = parseInt(localStorage.getItem("streak") || "0");
    const lastDate = localStorage.getItem("lastDate");
    const today = new Date().toISOString().split("T")[0];

    // Reset if missed a day
    if (lastDate && lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split("T")[0];
      if (lastDate !== yDate) {
        localStorage.setItem("streak", "0");
        setStreak(0);
      } else {
        setStreak(savedStreak);
      }
    } else {
      setStreak(savedStreak);
    }

    // Load today's completion status
    const savedDsa = localStorage.getItem(`dsa_${today}`) === "true";
    const savedQuiz = localStorage.getItem(`quiz_${today}`) === "true";
    setDsaDone(savedDsa);
    setQuizDone(savedQuiz);

    // Fetch today's challenge
    axios.get("https://placeai-sqjj.onrender.com/api/daily")
      .then(res => { setChallenge(res.data); setLoading(false); })
      .catch(err => console.error(err));
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

    // Only increment streak when BOTH are done for the first time today
    const lastDate = localStorage.getItem("lastDate");
    if ((savedDsa || dsaDone) && (savedQuiz || quizDone) && lastDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", newStreak.toString());
      localStorage.setItem("lastDate", today);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading today's challenge...</div>;
  if (!challenge) return <div style={{ padding: "2rem" }}>⏳ Waking up server, please wait 30 seconds and refresh...</div>;

  const bothDone = dsaDone && quizDone;

  return (
    <div style={{ padding: "2rem", maxWidth: "750px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>Daily Challenge 🔥</h2>
          <p style={{ color: "#666", margin: 0 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Streak Counter */}
        <div style={{ background: streak > 0 ? "#fff7ed" : "#f9f9f9", border: `2px solid ${streak > 0 ? "#f97316" : "#eee"}`,
          borderRadius: "12px", padding: "0.75rem 1.25rem", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "28px" }}>🔥</p>
          <p style={{ margin: 0, fontWeight: "700", fontSize: "22px", color: streak > 0 ? "#f97316" : "#999" }}>{streak}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#999" }}>day streak</p>
        </div>
      </div>

      {/* Completion Banner */}
      {bothDone && (
        <div style={{ background: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "12px",
          padding: "1rem 1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "18px", color: "#22c55e", fontWeight: "600" }}>
            🎉 You completed today's challenge! Come back tomorrow to keep your streak!
          </p>
        </div>
      )}

      {/* DSA Challenge */}
      <div style={{ background: "white", border: "1px solid #eee", borderRadius: "14px",
        padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#4f46e5" }}>💻 DSA Problem</h3>
          {dsaDone
            ? <span style={{ background: "#dcfce7", color: "green", padding: "4px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "500" }}>✅ Done</span>
            : <span style={{ background: "#e0e7ff", color: "#4f46e5", padding: "4px 14px", borderRadius: "8px", fontSize: "13px" }}>Pending</span>
          }
        </div>

        <p style={{ fontSize: "17px", fontWeight: "500", margin: "0 0 8px" }}>{challenge.dsa.title}</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
          <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "6px", background: "#e0e7ff", color: "#4f46e5" }}>
            {challenge.dsa.topic}
          </span>
          <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "6px",
            background: challenge.dsa.difficulty === "Easy" ? "#dcfce7" : challenge.dsa.difficulty === "Medium" ? "#fef9c3" : "#fee2e2",
            color: challenge.dsa.difficulty === "Easy" ? "green" : challenge.dsa.difficulty === "Medium" ? "#b45309" : "red" }}>
            {challenge.dsa.difficulty}
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <a href={challenge.dsa.link} target="_blank" rel="noreferrer"
            style={{ background: "#4f46e5", color: "white", padding: "8px 20px",
              borderRadius: "8px", textDecoration: "none", fontSize: "14px" }}>
            Solve on LeetCode →
          </a>
          {!dsaDone && (
            <button onClick={markDSADone}
              style={{ background: "#22c55e", color: "white", padding: "8px 20px",
                borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px" }}>
              Mark as Done ✅
            </button>
          )}
        </div>
      </div>

      {/* Quiz Challenge */}
      <div style={{ background: "white", border: "1px solid #eee", borderRadius: "14px", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#059669" }}>🧠 Aptitude Question</h3>
          {quizDone
            ? <span style={{ background: "#dcfce7", color: "green", padding: "4px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "500" }}>✅ Done</span>
            : <span style={{ background: "#d1fae5", color: "#059669", padding: "4px 14px", borderRadius: "8px", fontSize: "13px" }}>Pending</span>
          }
        </div>

        <p style={{ fontSize: "17px", fontWeight: "500", margin: "0 0 1rem" }}>{challenge.quiz.question}</p>

        {challenge.quiz.options.map((opt, i) => (
          <div key={i} onClick={() => !quizDone && markQuizDone(i)}
            style={{
              padding: "10px 16px", marginBottom: "8px", borderRadius: "10px",
              cursor: quizDone ? "default" : "pointer",
              border: `2px solid ${
                selectedAnswer === null && !quizDone ? "#eee"
                : i === challenge.quiz.answer ? "#22c55e"
                : selectedAnswer === i ? "#fc8181"
                : "#eee"
              }`,
              background: selectedAnswer === null && !quizDone ? "white"
                : i === challenge.quiz.answer ? "#f0fff4"
                : selectedAnswer === i ? "#fff5f5"
                : "white",
              fontSize: "14px"
            }}>
            <span style={{ fontWeight: "500", marginRight: "8px", color: "#059669" }}>
              {["A", "B", "C", "D"][i]}.
            </span>
            {opt}
          </div>
        ))}

        {quizDone && (
          <p style={{ color: "#22c55e", fontWeight: "500", marginTop: "0.5rem" }}>
            ✅ Correct answer: {challenge.quiz.options[challenge.quiz.answer]}
          </p>
        )}
      </div>
    </div>
  );
}