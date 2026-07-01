import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "./firebase.js"; // Standardized import path

const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };
const diffBg = { Easy: "rgba(16,185,129,0.15)", Medium: "rgba(245,158,11,0.15)", Hard: "rgba(244,63,94,0.15)" };

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dsaDone, setDsaDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem("streak") || "0");
    const lastDate = localStorage.getItem("lastDate");
    const today = new Date().toISOString().split("T")[0];

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

    const savedDsa = localStorage.getItem(`dsa_${today}`) === "true";
    const savedQuiz = localStorage.getItem(`quiz_${today}`) === "true";
    setDsaDone(savedDsa);
    setQuizDone(savedQuiz);

    const fetchDaily = async () => {
      try {
        let token = localStorage.getItem("token");
        if (auth.currentUser) token = await auth.currentUser.getIdToken();

        const res = await axios.get("https://placeai-sqjj.onrender.com/api/daily", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChallenge(res.data);
        setIsDemoMode(false);
      } catch (err) {
        console.error("Backend fetch failed. Loading Demo Daily Challenge...", err);
        setIsDemoMode(true);
        // FALLBACK DEMO DATA
        setChallenge({
          dsa: {
            title: "Merge Intervals",
            topic: "Arrays",
            difficulty: "Medium",
            link: "https://leetcode.com/problems/merge-intervals/"
          },
          quiz: {
            question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
            options: ["120 metres", "180 metres", "324 metres", "150 metres"],
            answer: 3
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDaily();
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
    
    // Check local state variables as well to avoid race conditions
    if ((savedDsa || dsaDone) && (savedQuiz || quizDone) && lastDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", newStreak.toString());
      localStorage.setItem("lastDate", today);
    }
  };

  if (loading) return (
    <div style={{ padding: "2rem", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
      <div className="glass-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "12px", color: "#f59e0b", fontWeight: "600" }}>
        <span style={{ animation: "pulse-glow 1.5s infinite" }}>⏳</span> Loading today's challenge...
      </div>
    </div>
  );

  const bothDone = dsaDone && quizDone;
  const todayDateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const progress = bothDone ? 100 : dsaDone || quizDone ? 50 : 0;

  return (
    <div className="daily-container">
      <style>{`
        .daily-container {
          padding: 1.5rem;
          width: 100%;
          min-width: 0; /* Prevents flexbox overlapping */
          box-sizing: border-box;
          color: white;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-x: hidden;
          max-width: 850px;
        }

        .glass-card {
          background: linear-gradient(145deg, rgba(20, 15, 25, 0.7), rgba(10, 8, 15, 0.9));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .daily-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .brand-btn {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(255,63,129,0.3);
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .brand-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.4), 0 6px 20px rgba(255,63,129,0.4);
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .daily-container { padding: 1rem; }
          .daily-header { gap: 12px; }
        }
      `}</style>

      {/* Warning Banner */}
      {isDemoMode && (
        <div style={{
          background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.4)",
          color: "#fcd34d", padding: "12px 16px", borderRadius: "12px",
          display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "600"
        }}>
          <span>⚠️</span> 
          <span>Backend offline. Loading offline Daily Challenge.</span>
        </div>
      )}

      {/* Header */}
      <div className="daily-header">
        <div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "24px", height: "3px", background: "linear-gradient(90deg, #f59e0b, transparent)", borderRadius: "2px" }}></span>
            Daily <span style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Challenge</span>
          </h2>
          <p style={{ color: "#9b9ba8", margin: 0, fontSize: "14px", fontWeight: "500" }}>{todayDateStr}</p>
        </div>

        {/* Streak Indicator */}
        <div style={{
          background: streak > 0 ? "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))" : "rgba(255,255,255,0.03)",
          border: `1px solid ${streak > 0 ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: streak > 0 ? "0 0 20px rgba(245,158,11,0.2)" : "none",
          borderRadius: "16px", padding: "12px 20px", textAlign: "center", minWidth: "90px"
        }}>
          <p style={{ margin: 0, fontSize: "28px", filter: streak > 0 ? "drop-shadow(0 0 10px rgba(245,158,11,0.6))" : "none" }}>🔥</p>
          <p style={{ margin: "4px 0 2px", fontWeight: "800", fontSize: "24px",
            color: streak > 0 ? "#f59e0b" : "#6b6b78" }}>{streak}</p>
          <p style={{ margin: 0, fontSize: "11px", color: streak > 0 ? "#fcd34d" : "#6b6b78", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Streak</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", color: "#9b9ba8", fontWeight: "600" }}>Today's Progress</span>
          <span style={{ fontSize: "13px", color: bothDone ? "#10b981" : "#e2e8f0", fontWeight: "700" }}>
            {bothDone ? "2/2 Complete ✅" : dsaDone || quizDone ? "1/2 Done" : "0/2 Done"}
          </span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
          <div style={{
            width: `${progress}%`,
            background: bothDone ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #f59e0b, #ff3f81)",
            height: "100%", borderRadius: "8px", transition: "width 0.8s ease-in-out",
            boxShadow: bothDone ? "0 0 10px rgba(16,185,129,0.5)" : "0 0 10px rgba(255,63,129,0.4)"
          }} />
        </div>
      </div>

      {/* Completion Banner */}
      {bothDone && (
        <div style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "16px", padding: "1.25rem", textAlign: "center", boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}>
          <p style={{ margin: 0, fontSize: "15px", color: "#34d399", fontWeight: "700" }}>
            🎉 Incredible work! You completed today's challenge. Come back tomorrow to keep the fire alive!
          </p>
        </div>
      )}

      {/* DSA Challenge */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(255,63,129,0.1)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", border: "1px solid rgba(255,63,129,0.2)" }}>💻</div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#e2e8f0" }}>DSA Problem</h3>
          </div>
          <span style={{
            background: dsaDone ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
            color: dsaDone ? "#10b981" : "#9b9ba8",
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
            border: `1px solid ${dsaDone ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`
          }}>
            {dsaDone ? "✅ Done" : "Pending"}
          </span>
        </div>

        <p style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 12px", color: "white" }}>
          {challenge.dsa.title}
        </p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "6px", fontWeight: "600",
            background: "rgba(255,255,255,0.05)", color: "#9b9ba8", border: "1px solid rgba(255,255,255,0.1)" }}>
            {challenge.dsa.topic}
          </span>
          <span style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "6px", fontWeight: "700",
            background: diffBg[challenge.dsa.difficulty],
            color: diffColor[challenge.dsa.difficulty],
            border: `1px solid ${diffColor[challenge.dsa.difficulty]}40` }}>
            {challenge.dsa.difficulty}
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href={challenge.dsa.link} target="_blank" rel="noreferrer" className="brand-btn">
            Solve on LeetCode
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
          {!dsaDone && (
            <button onClick={markDSADone} style={{
              background: "rgba(16,185,129,0.1)", color: "#34d399", padding: "12px 24px",
              borderRadius: "10px", border: "1px solid rgba(16,185,129,0.3)",
              cursor: "pointer", fontSize: "14px", fontWeight: "700", transition: "all 0.2s"
            }} onMouseEnter={e => e.target.style.background = "rgba(16,185,129,0.2)"}
               onMouseLeave={e => e.target.style.background = "rgba(16,185,129,0.1)"}>
              Mark as Done ✅
            </button>
          )}
        </div>
      </div>

      {/* Quiz Challenge */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px",
              background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", border: "1px solid rgba(124,58,237,0.3)" }}>🧠</div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#e2e8f0" }}>Aptitude Question</h3>
          </div>
          <span style={{
            background: quizDone ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
            color: quizDone ? "#10b981" : "#9b9ba8",
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
            border: `1px solid ${quizDone ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`
          }}>
            {quizDone ? "✅ Done" : "Pending"}
          </span>
        </div>

        <p style={{ fontSize: "15px", fontWeight: "500", margin: "0 0 1.25rem", color: "#e2e8f0", lineHeight: "1.6" }}>
          {challenge.quiz.question}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {challenge.quiz.options.map((opt, i) => {
            const isCorrect = (selectedAnswer !== null || quizDone) && i === challenge.quiz.answer;
            const isWrong = selectedAnswer === i && i !== challenge.quiz.answer;
            return (
              <div key={i} onClick={() => !quizDone && markQuizDone(i)} style={{
                padding: "14px 18px", borderRadius: "12px",
                cursor: quizDone ? "default" : "pointer",
                border: `1px solid ${isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.1)"}`,
                background: isCorrect ? "rgba(16,185,129,0.1)" : isWrong ? "rgba(244,63,94,0.1)" : "rgba(0,0,0,0.2)",
                transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "14px",
                boxShadow: isCorrect ? "0 0 15px rgba(16,185,129,0.2)" : "none"
              }}>
                <span style={{
                  width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "800",
                  background: isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.05)",
                  color: isCorrect || isWrong ? "white" : "#9b9ba8",
                  border: `1px solid ${isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.1)"}`
                }}>
                  {["A", "B", "C", "D"][i]}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: isCorrect ? "#34d399" : isWrong ? "#fb7185" : "#e2e8f0" }}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>

        {quizDone && (
          <div style={{ marginTop: "1.25rem", padding: "14px 18px", background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px" }}>
            <p style={{ color: "#34d399", fontWeight: "700", margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Correct Answer: {challenge.quiz.options[challenge.quiz.answer]}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}