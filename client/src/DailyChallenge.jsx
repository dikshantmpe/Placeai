import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "./firebase.js";

const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };
const diffBg = { Easy: "rgba(16,185,129,0.12)", Medium: "rgba(245,158,11,0.12)", Hard: "rgba(244,63,94,0.12)" };
const diffBorder = { Easy: "rgba(16,185,129,0.3)", Medium: "rgba(245,158,11,0.3)", Hard: "rgba(244,63,94,0.3)" };

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dsaDone, setDsaDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

    if ((savedDsa || dsaDone) && (savedQuiz || quizDone) && lastDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", newStreak.toString());
      localStorage.setItem("lastDate", today);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#000000", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            border: "3px solid rgba(20,184,166,0.3)",
            borderTop: "3px solid #14b8a6",
            animation: "spin 1s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Loading today&apos;s challenge...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const bothDone = dsaDone && quizDone;
  const todayDateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const progress = bothDone ? 100 : dsaDone || quizDone ? 50 : 0;

  return (
    <div style={{
      minHeight: "100vh", width: "100%", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#ffffff", background: "#000000",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.6s ease"
    }}>
      <style>{`
        .dc-glass-card {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .dc-glass-card:hover {
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.6), 0 0 30px rgba(20, 184, 166, 0.08);
        }
        .dc-glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent);
          transform: skewX(-25deg);
          transition: left 0.7s ease;
          pointer-events: none;
        }
        .dc-glass-card:hover::before {
          left: 150%;
        }

        .dc-btn-primary {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          color: white;
          font-weight: 600;
        }
        .dc-btn-primary:hover {
          background: linear-gradient(135deg, #0f766e, #0d9488);
          box-shadow: 0 8px 30px -6px rgba(13, 148, 136, 0.5);
          transform: translateY(-1px);
        }

        .dc-btn-secondary {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
          cursor: pointer;
          color: #e2e8f0;
        }
        .dc-btn-secondary:hover {
          background: rgba(0, 0, 0, 0.85);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .dc-glass-input {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }
        .dc-glass-input:hover {
          border-color: rgba(20, 184, 166, 0.3);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .float-anim-d1 { animation: float 4s ease-in-out infinite; animation-delay: 0.5s; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .dc-layout { padding: 1rem !important; }
          .dc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient glow background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 20%, rgba(13, 148, 136, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(20, 184, 166, 0.04) 0%, transparent 50%)"
      }} />

      <div className="dc-layout" style={{
        position: "relative", zIndex: 10,
        flex: 1, display: "flex", flexDirection: "column",
        padding: "2rem", maxWidth: "900px", margin: "0 auto",
        width: "100%", boxSizing: "border-box", gap: "1.5rem"
      }}>

        {/* Demo Warning */}
        {isDemoMode && (
          <div style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            color: "#fcd34d", padding: "12px 16px", borderRadius: "14px",
            display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: "600"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Backend offline. Loading offline Daily Challenge.
          </div>
        )}

        {/* Header */}
        <div className="dc-glass-card" style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "5px 14px", borderRadius: "20px",
              background: "rgba(20, 184, 166, 0.1)", border: "1px solid rgba(20, 184, 166, 0.2)",
              color: "#2dd4bf", fontSize: "0.7rem", fontWeight: "700",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px"
            }}>
              DAILY CHALLENGE ✨
            </div>
            <h1 style={{
              fontSize: "1.6rem", fontWeight: "800", margin: "0 0 4px 0",
              letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <span style={{ width: "24px", height: "3px", background: "linear-gradient(90deg, #14b8a6, transparent)", borderRadius: "2px" }} />
              Today&apos;s <span style={{ background: "linear-gradient(90deg, #14b8a6, #2dd4bf)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Challenge</span>
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem", fontWeight: "500" }}>{todayDateStr}</p>
          </div>

          {/* Streak */}
          <div style={{
            background: streak > 0 ? "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))" : "rgba(255,255,255,0.03)",
            border: `1px solid ${streak > 0 ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.08)"}`,
            boxShadow: streak > 0 ? "0 0 20px rgba(245,158,11,0.15)" : "none",
            borderRadius: "16px", padding: "14px 24px", textAlign: "center", minWidth: "100px"
          }}>
            <p style={{ margin: 0, fontSize: "24px", filter: streak > 0 ? "drop-shadow(0 0 8px rgba(245,158,11,0.5))" : "none" }}>🔥</p>
            <p style={{ margin: "4px 0 0", fontWeight: "800", fontSize: "22px",
              color: streak > 0 ? "#f59e0b" : "#475569" }}>{streak}</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.65rem", color: streak > 0 ? "#fcd34d" : "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day Streak</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="dc-glass-card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Today&apos;s Progress
            </span>
            <span style={{ fontSize: "0.8rem", color: bothDone ? "#10b981" : "#e2e8f0", fontWeight: "700" }}>
              {bothDone ? "2/2 Complete ✅" : dsaDone || quizDone ? "1/2 Done" : "0/2 Done"}
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`,
              background: bothDone ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #14b8a6, #0d9488)",
              height: "100%", borderRadius: "10px", transition: "width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
              boxShadow: bothDone ? "0 0 12px rgba(16,185,129,0.4)" : "0 0 12px rgba(20,184,166,0.3)"
            }} />
          </div>
        </div>

        {/* Completion Banner */}
        {bothDone && (
          <div className="float-anim" style={{
            background: "linear-gradient(90deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: "16px", padding: "1.25rem", textAlign: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.1)"
          }}>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#34d399", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Incredible work! You completed today&apos;s challenge. Come back tomorrow to keep the fire alive!
            </p>
          </div>
        )}

        {/* DSA Challenge */}
        <div className="dc-glass-card float-anim-d1" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "rgba(20, 184, 166, 0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", border: "1px solid rgba(20, 184, 166, 0.2)",
                color: "#14b8a6"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#e2e8f0" }}>DSA Problem</h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>Algorithm & Data Structures</p>
              </div>
            </div>
            <span style={{
              background: dsaDone ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
              color: dsaDone ? "#10b981" : "#64748b",
              padding: "6px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700",
              border: `1px solid ${dsaDone ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", gap: "4px"
            }}>
              {dsaDone ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Done</>
              ) : "Pending"}
            </span>
          </div>

          <p style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 14px", color: "#f8fafc" }}>
            {challenge.dsa.title}
          </p>

          <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "0.75rem", padding: "5px 14px", borderRadius: "8px", fontWeight: "600",
              background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)"
            }}>
              {challenge.dsa.topic}
            </span>
            <span style={{
              fontSize: "0.75rem", padding: "5px 14px", borderRadius: "8px", fontWeight: "700",
              background: diffBg[challenge.dsa.difficulty],
              color: diffColor[challenge.dsa.difficulty],
              border: `1px solid ${diffBorder[challenge.dsa.difficulty]}`
            }}>
              {challenge.dsa.difficulty}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href={challenge.dsa.link} target="_blank" rel="noreferrer" className="dc-btn-primary" style={{
              padding: "12px 24px", borderRadius: "12px", fontSize: "0.85rem",
              display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none"
            }}>
              Solve on LeetCode
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            {!dsaDone && (
              <button onClick={markDSADone} className="dc-btn-secondary" style={{
                padding: "12px 24px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700",
                display: "flex", alignItems: "center", gap: "6px"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark as Done
              </button>
            )}
          </div>
        </div>

        {/* Quiz Challenge */}
        <div className="dc-glass-card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", border: "1px solid rgba(139, 92, 246, 0.2)",
                color: "#8b5cf6"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#e2e8f0" }}>Aptitude Question</h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>Logical Reasoning & Math</p>
              </div>
            </div>
            <span style={{
              background: quizDone ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
              color: quizDone ? "#10b981" : "#64748b",
              padding: "6px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700",
              border: `1px solid ${quizDone ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", gap: "4px"
            }}>
              {quizDone ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Done</>
              ) : "Pending"}
            </span>
          </div>

          <p style={{ fontSize: "0.95rem", fontWeight: "500", margin: "0 0 1.25rem", color: "#e2e8f0", lineHeight: "1.7" }}>
            {challenge.quiz.question}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {challenge.quiz.options.map((opt, i) => {
              const isCorrect = (selectedAnswer !== null || quizDone) && i === challenge.quiz.answer;
              const isWrong = selectedAnswer === i && i !== challenge.quiz.answer;
              return (
                <div
                  key={i}
                  onClick={() => !quizDone && markQuizDone(i)}
                  className="dc-glass-input"
                  style={{
                    padding: "14px 18px", borderRadius: "12px",
                    cursor: quizDone ? "default" : "pointer",
                    borderColor: isCorrect ? "rgba(16,185,129,0.4)" : isWrong ? "rgba(244,63,94,0.4)" : undefined,
                    background: isCorrect ? "rgba(16,185,129,0.08)" : isWrong ? "rgba(244,63,94,0.08)" : undefined,
                    display: "flex", alignItems: "center", gap: "14px"
                  }}
                >
                  <span style={{
                    width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.8rem", fontWeight: "800",
                    background: isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.05)",
                    color: isCorrect || isWrong ? "white" : "#94a3b8",
                    border: `1px solid ${isCorrect ? "#10b981" : isWrong ? "#f43f5e" : "rgba(255,255,255,0.1)"}`,
                    transition: "all 0.2s ease"
                  }}>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span style={{ fontSize: "0.9rem", fontWeight: "500", color: isCorrect ? "#34d399" : isWrong ? "#fb7185" : "#e2e8f0" }}>
                    {opt}
                  </span>
                  {isCorrect && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {isWrong && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {quizDone && (
            <div style={{
              marginTop: "1.25rem", padding: "14px 18px", background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px"
            }}>
              <p style={{ color: "#34d399", fontWeight: "700", margin: 0, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Correct Answer: {challenge.quiz.options[challenge.quiz.answer]}
              </p>
            </div>
          )}
        </div>

        {/* Footer spacer */}
        <div style={{ height: "2rem" }} />
      </div>
    </div>
  );
}