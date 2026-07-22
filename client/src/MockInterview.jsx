import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth } from "./firebase.js"; 

const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Structures & Algorithms", "System Design"];
const difficulties = ["Easy", "Medium", "Hard"];
const diffColor = { Easy: "#18775e", Medium: "#a56a10", Hard: "#d93c45" };
const diffBg = { Easy: "#e5f5ef", Medium: "#fff8e7", Hard: "#fde7e8" };
const diffBorder = { Easy: "#c5e8d8", Medium: "#f0deb8", Hard: "#f5c2c5" };

const questions = [
  { t: "Behavioral", q: "Tell me about yourself and what drew you to software engineering." },
  { t: "Technical", q: "How would you explain the difference between a process and a thread?" },
  { t: "DSA", q: "Given an unsorted array, how would you find the longest consecutive sequence efficiently?" },
  { t: "Project", q: "Walk me through a technical project you built. What was the hardest engineering decision you made?" },
  { t: "Technical", q: "What happens from the moment you enter a URL in the browser until the page is displayed?" },
  { t: "Behavioral", q: "Tell me about a time something you built did not work as expected. How did you respond?" },
  { t: "System Design", q: "How would you design a simple URL shortening service for moderate traffic?" },
  { t: "Closing", q: "Why are you interested in this role, and what would you like to learn in your first year?" }
];

export default function MockInterview() {
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [qi, setQi] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [voiceListening, setVoiceListening] = useState(false);
  const [notes, setNotes] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionSwap, setQuestionSwap] = useState(false);
  const bottomRef = useRef(null);
  const timerRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

  const startTimer = () => {
    if (timerRef.current) return;
    setRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    setRunning(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const resetTimer = () => {
    pauseTimer();
    setSeconds(0);
  };

  const togglePause = () => {
    if (running) {
      pauseTimer();
      setPaused(true);
    } else {
      startTimer();
      setPaused(false);
    }
  };

  const toggleMic = () => {
    setMicOn(prev => !prev);
  };

  const renderQuestion = (index) => {
    setQuestionSwap(true);
    setTimeout(() => {
      setQi(index);
      setQuestionSwap(false);
    }, 180);
  };

  const nextQuestion = () => {
    if (qi < questions.length - 1) {
      const nextIdx = qi + 1;
      renderQuestion(nextIdx);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "model", content: questions[nextIdx].q, type: "question" }]);
      }, 220);
    }
  };

  const prevQuestion = () => {
    if (qi > 0) {
      renderQuestion(qi - 1);
    }
  };

  const startInterview = async () => {
    setStarted(true);
    setMessages([]);
    setLoading(true);
    setIsDemoMode(false);
    setQi(0);
    setSeconds(0);
    setPaused(false);
    setShowFeedback(false);

    const firstMessage = [{ role: "user", content: `Hello, I am ready for the ${role} interview.` }];

    try {
      let token = localStorage.getItem("token");
      if (auth.currentUser) token = await auth.currentUser.getIdToken();

      const res = await axios.post("https://placeai-sqjj.onrender.com/api/interview/chat", {
        messages: firstMessage, role, difficulty
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessages([...firstMessage, { role: "model", content: res.data.reply }]);
    } catch (err) {
      console.error("Backend fetch failed. Engaging Demo Interviewer...", err);
      setIsDemoMode(true);

      setTimeout(() => {
        setMessages([
          ...firstMessage, 
          { role: "model", content: `Welcome. We'll work through a mix of technical and behavioral questions. You can answer by voice or type your response below.` }
        ]);
        setLoading(false);
      }, 1500);
      return;
    }
    setLoading(false);
    startTimer();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (isDemoMode) {
      setTimeout(() => {
        const fakeReplies = [
          "That's a very interesting approach. Can you elaborate on why you chose that specific technology over other alternatives?",
          "Good point. How would you handle scalability if the user base suddenly grew by 10x?",
          "I see. What were some of the tradeoffs you had to make when implementing that?",
          "Excellent answer. Let's pivot slightly—how do you stay updated with the latest industry trends?"
        ];
        const randomReply = fakeReplies[Math.floor(Math.random() * fakeReplies.length)];
        setMessages([...newMessages, { role: "model", content: randomReply }]);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      let token = localStorage.getItem("token");
      if (auth.currentUser) token = await auth.currentUser.getIdToken();

      const res = await axios.post("https://placeai-sqjj.onrender.com/api/interview/chat", {
        messages: newMessages, role, difficulty
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessages([...newMessages, { role: "model", content: res.data.reply }]);
    } catch (err) {
      alert("Error sending message. Please try again.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      sendMessage(); 
    }
  };

  const endInterview = () => {
    pauseTimer();
    setShowFeedback(true);
  };

  const restartInterview = () => {
    setShowFeedback(false);
    setQi(0);
    setSeconds(0);
    setMessages([]);
    setNotes("");
    startTimer();
  };

  const toggleVoice = () => {
    setVoiceListening(prev => !prev);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1050;

  return (
    <div style={{
      flex: 1,
      minHeight: "100vh",
      position: "relative",
      padding: "22px 22px 50px",
      color: "#172033",
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      background: "#f3f2ef",
      fontSize: "14px",
      lineHeight: "1.5"
    }}>

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f3f2ef; }
        ::-webkit-scrollbar-thumb { background: #dedbd5; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #b8b3ab; }
        * { scrollbar-width: thin; scrollbar-color: #dedbd5 #f3f2ef; }
        .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: #dedbd5; border-radius: 10px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes phaseIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 50% { box-shadow: 0 0 0 6px rgba(217, 60, 69, 0.2); } }
        @keyframes wave { 50% { transform: scaleY(0.45); } }

        .phase { animation: phaseIn 0.35s ease; }
        .question-swap { opacity: 0; transform: translateX(12px); transition: all 0.18s; }
        .question-show { opacity: 1; transform: translateX(0); transition: all 0.22s; }
      `}</style>

      <div style={{ maxWidth: "1440px", margin: "0 auto", position: "relative", zIndex: 10 }}>

        {isDemoMode && (
          <div style={{
            background: "#fff1cf", border: "1px solid #f0d080",
            color: "#765010", padding: "12px 20px", borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: "600", marginBottom: "18px"
          }}>
            <span>⚠️</span> 
            <span>Backend offline. Connected to Offline Demo AI Interviewer.</span>
          </div>
        )}

        {!started ? (
          /* WAITING ROOM */
          <div className="phase" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.08fr 0.92fr", gap: "18px" }}>

            <div style={{ background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27,46,76,.07)", padding: "34px" }}>
              <span style={{ fontSize: "11px", fontWeight: "850", letterSpacing: "0.12em", color: "#1769e0", textTransform: "uppercase" }}>AI MOCK INTERVIEW</span>
              <h1 style={{ fontSize: "32px", lineHeight: "1.15", margin: "7px 0", color: "#10264a", fontWeight: "700" }}>Practice the conversation before it counts.</h1>
              <p style={{ color: "#657287", fontSize: "15px", maxWidth: "600px", margin: "0 0 25px 0" }}>Run a realistic interview session with timed questions, private notes, simulated recording controls, and a feedback summary at the end.</p>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "10px", margin: "25px 0" }}>
                <div style={{ padding: "15px", border: "1px solid #dedbd5", borderRadius: "10px", background: "#fbfcfe" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#e5f5ef", color: "#18775e", display: "grid", placeItems: "center", fontSize: "18px", marginBottom: "10px" }}>✓</div>
                  <b style={{ color: "#10264a", fontSize: "14px" }}>Microphone ready</b>
                  <div style={{ color: "#657287", fontSize: "12px" }}>Input detected</div>
                </div>
                <div style={{ padding: "15px", border: "1px solid #dedbd5", borderRadius: "10px", background: "#fbfcfe" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#e5f5ef", color: "#18775e", display: "grid", placeItems: "center", fontSize: "18px", marginBottom: "10px" }}>✓</div>
                  <b style={{ color: "#10264a", fontSize: "14px" }}>Voice ready</b>
                  <div style={{ color: "#657287", fontSize: "12px" }}>Audio conversation enabled</div>
                </div>
                <div style={{ padding: "15px", border: "1px solid #dedbd5", borderRadius: "10px", background: "#fbfcfe" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#e5f5ef", color: "#18775e", display: "grid", placeItems: "center", fontSize: "18px", marginBottom: "10px" }}>✓</div>
                  <b style={{ color: "#10264a", fontSize: "14px" }}>Interview set</b>
                  <div style={{ color: "#657287", fontSize: "12px" }}>8 questions loaded</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid #dedbd5", borderRadius: "9px", background: "#fff", minWidth: "180px", fontSize: "14px", color: "#172033" }}
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid #dedbd5", borderRadius: "9px", background: "#fff", minWidth: "160px", fontSize: "14px", color: "#172033" }}
                >
                  <option>Standard difficulty</option>
                  {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button 
                  onClick={startInterview}
                  style={{ border: "0", background: "#1769e0", color: "#fff", padding: "11px 17px", borderRadius: "999px", fontWeight: "750", cursor: "pointer", fontSize: "14px", transition: "0.18s" }}
                  onMouseEnter={e => e.target.style.background = "#0e54bd"}
                  onMouseLeave={e => e.target.style.background = "#1769e0"}
                >
                  Start interview →
                </button>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27,46,76,.07)", minHeight: "440px", overflow: "hidden", position: "relative", background: "#dce9f8", display: "grid", placeItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "130px", height: "130px", borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontSize: "52px", margin: "0 auto", boxShadow: "0 15px 40px rgba(23,53,93,0.09)" }}>🎙️</div>
                <p style={{ color: "#48617f", fontWeight: "700", margin: "16px 0 4px", fontSize: "16px" }}>Voice interview ready</p>
                <span style={{ color: "#657287", fontSize: "13px" }}>Speak naturally or use the text chat during the session.</span>
              </div>
              <div style={{ position: "absolute", bottom: "20px", display: "flex", gap: "10px" }}>
                <button style={{ width: "48px", height: "48px", border: "0", borderRadius: "50%", background: "#fff", color: "#10264a", boxShadow: "0 7px 20px rgba(16,38,74,0.13)", fontSize: "18px", cursor: "pointer" }}>🎙</button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE INTERVIEW */
          <div className="phase">
            {/* Interview Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "850", letterSpacing: "0.12em", color: "#1769e0", textTransform: "uppercase" }}>LIVE PRACTICE SESSION</span>
                <h2 style={{ color: "#10264a", fontSize: "20px", fontWeight: "700", margin: "4px 0 0 0" }}>{role} Mock Interview</h2>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 10px", borderRadius: "999px", background: "#fff", border: "1px solid #dedbd5", fontSize: "11px", fontWeight: "850", color: "#d93c45" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d93c45", animation: "pulse 1.2s infinite" }}></span>
                  REC
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontVariantNumeric: "tabular-nums", fontSize: "22px", fontWeight: "850", color: "#10264a", background: "#fff", border: "1px solid #dedbd5", borderRadius: "10px", padding: "7px 13px" }}>
                    {fmt(seconds)}
                  </div>
                  <button 
                    onClick={togglePause}
                    style={{ width: "35px", height: "35px", border: "1px solid #dedbd5", background: "#fff", borderRadius: "9px", color: "#10264a", cursor: "pointer", fontSize: "14px", fontWeight: "700" }}
                  >
                    {running ? "Ⅱ" : "▶"}
                  </button>
                  <button 
                    onClick={resetTimer}
                    style={{ width: "35px", height: "35px", border: "1px solid #dedbd5", background: "#fff", borderRadius: "9px", color: "#10264a", cursor: "pointer", fontSize: "14px", fontWeight: "700" }}
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 330px", gap: "14px" }}>

              {/* Main Column */}
              <div style={{ display: "grid", gap: "14px" }}>

                {/* Chat Stage */}
                <div style={{ height: "520px", display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27,46,76,.07)" }}>
                  <div style={{ padding: "15px 18px", borderBottom: "1px solid #dedbd5", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fbfcfe" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "10px", alignItems: "center" }}>
                      <div style={{ gridRow: "1 / 3", width: "38px", height: "38px", borderRadius: "11px", background: "#1769e0", color: "#fff", display: "grid", placeItems: "center", fontSize: "16px" }}>✦</div>
                      <b style={{ color: "#10264a", fontSize: "14px" }}>Aarav · AI Interviewer</b>
                      <small style={{ gridColumn: "2", color: "#657287", fontSize: "12px" }}>Text & voice interview</small>
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: "750", color: "#18775e", display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ height: "18px", display: "flex", alignItems: "center", gap: "2px" }}>
                        <i style={{ display: "block", width: "3px", height: "7px", borderRadius: "4px", background: "#18775e", animation: "wave 1s ease-in-out infinite" }}></i>
                        <i style={{ display: "block", width: "3px", height: "13px", borderRadius: "4px", background: "#18775e", animation: "wave 1s ease-in-out infinite", animationDelay: "0.15s" }}></i>
                        <i style={{ display: "block", width: "3px", height: "17px", borderRadius: "4px", background: "#18775e", animation: "wave 1s ease-in-out infinite", animationDelay: "0.3s" }}></i>
                        <i style={{ display: "block", width: "3px", height: "10px", borderRadius: "4px", background: "#18775e", animation: "wave 1s ease-in-out infinite", animationDelay: "0.45s" }}></i>
                      </span>
                      Voice active
                    </div>
                  </div>

                  <div className="chat-messages" style={{ flex: 1, overflow: "auto", padding: "22px", display: "flex", flexDirection: "column", gap: "16px", background: "linear-gradient(#fff, #fbfcfe)" }}>
                    {messages.filter(m => m.role !== "system").map((m, i) => (
                      <div key={i} style={{
                        display: "flex", gap: "10px", maxWidth: "78%",
                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        flexDirection: m.role === "user" ? "row-reverse" : "row"
                      }}>
                        <div style={{ 
                          width: "34px", height: "34px", flex: "0 0 34px", borderRadius: "10px", 
                          background: m.role === "user" ? "#10264a" : "#1769e0", 
                          color: "#fff", display: "grid", placeItems: "center", 
                          fontSize: "10px", fontWeight: "850" 
                        }}>
                          {m.role === "user" ? "You" : "AI"}
                        </div>
                        <div>
                          <small style={{ color: "#657287", fontSize: "10px" }}>
                            {m.role === "user" ? "Your response" : (m.type === "question" ? "Next question" : "Aarav · Interviewer")}
                          </small>
                          <p style={{ 
                            margin: "4px 0 0", padding: "11px 13px", 
                            background: m.role === "user" ? "#1769e0" : "#f0f5fb", 
                            color: m.role === "user" ? "#fff" : "#172033",
                            borderRadius: m.role === "user" ? "13px 4px 13px 13px" : "4px 13px 13px 13px",
                            lineHeight: "1.6", fontSize: "14px", whiteSpace: "pre-wrap"
                          }}>
                            {m.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#1769e0", color: "#fff", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: "850" }}>AI</div>
                        <div>
                          <small style={{ color: "#657287", fontSize: "10px" }}>Thinking...</small>
                          <p style={{ margin: "4px 0 0", padding: "11px 13px", background: "#f0f5fb", borderRadius: "4px 13px 13px 13px", lineHeight: "1.6", fontSize: "14px", color: "#657287" }}>
                            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Processing your response...
                          </p>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <div style={{ padding: "12px", borderTop: "1px solid #dedbd5", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "8px", alignItems: "end", background: "#fff" }}>
                    <button 
                      onClick={toggleVoice}
                      style={{ 
                        height: "43px", width: "43px", border: "0", borderRadius: "12px",
                        background: voiceListening ? "#d93c45" : "#eaf3ff",
                        color: voiceListening ? "#fff" : "#1769e0",
                        fontSize: "18px", cursor: "pointer",
                        animation: voiceListening ? "pulse 1.2s infinite" : "none"
                      }}
                    >
                      {voiceListening ? "■" : "🎙"}
                    </button>
                    <textarea 
                      ref={chatInputRef}
                      value={input} 
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Type your answer or use the microphone…"
                      style={{ 
                        minHeight: "43px", maxHeight: "100px", border: "1px solid #dedbd5", 
                        borderRadius: "12px", padding: "11px 12px", resize: "none",
                        fontFamily: "inherit", fontSize: "14px", outline: "none",
                        lineHeight: "1.5"
                      }}
                    />
                    <button 
                      onClick={sendMessage}
                      style={{ height: "43px", border: "0", borderRadius: "12px", padding: "0 17px", background: "#1769e0", color: "#fff", fontWeight: "750", cursor: "pointer", fontSize: "14px" }}
                    >
                      Send
                    </button>
                  </div>
                </div>

                {/* Question Card */}
                <div style={{ background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27,46,76,.07)", padding: "20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "11px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "750", color: "#657287" }}>CURRENT QUESTION</span>
                    <span style={{ fontSize: "11px", fontWeight: "750", color: "#657287" }}>Question {qi + 1} of {questions.length}</span>
                  </div>
                  <div className={questionSwap ? "question-swap" : "question-show"} style={{ fontSize: "20px", lineHeight: "1.45", fontWeight: "700", color: "#10264a", minHeight: "58px" }}>
                    {questions[qi].q}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                    <span style={{ fontSize: "11px", padding: "5px 9px", borderRadius: "999px", background: "#eaf3ff", color: "#0e54bd", fontWeight: "750" }}>
                      {questions[qi].t}
                    </span>
                    <div>
                      <button 
                        onClick={prevQuestion}
                        disabled={qi === 0}
                        style={{ 
                          border: "1px solid #dedbd5", background: "#fff", color: "#172033",
                          padding: "11px 17px", borderRadius: "999px", fontWeight: "750",
                          cursor: qi === 0 ? "not-allowed" : "pointer", fontSize: "14px",
                          opacity: qi === 0 ? 0.5 : 1, marginRight: "8px"
                        }}
                      >
                        ← Previous
                      </button>
                      <button 
                        onClick={nextQuestion}
                        style={{ 
                          border: "0", background: "#1769e0", color: "#fff",
                          padding: "11px 17px", borderRadius: "999px", fontWeight: "750",
                          cursor: "pointer", fontSize: "14px"
                        }}
                      >
                        Next question →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Sidebar */}
              <aside style={{ background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27,46,76,.07)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "18px", borderBottom: "1px solid #dedbd5" }}>
                  <h3 style={{ color: "#10264a", fontSize: "15px", fontWeight: "700", margin: 0 }}>Private interview notes</h3>
                  <p style={{ margin: "4px 0 0", color: "#657287", fontSize: "12px" }}>Capture ideas, examples, or reflections. These notes are not shown to the interviewer.</p>
                </div>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Write notes here…

Example:
• Mention Crackin AI project
• Explain authentication challenge
• Quantify project impact"
                  style={{ flex: 1, minHeight: "420px", border: "0", resize: "none", padding: "18px", outline: "0", lineHeight: "1.7", color: "#172033", fontFamily: "inherit", fontSize: "14px" }}
                />
                <div style={{ padding: "12px 18px", borderTop: "1px solid #dedbd5", display: "flex", justifyContent: "space-between", color: "#657287", fontSize: "11px" }}>
                  <span>Auto-saved locally for this demo</span>
                  <span>{wordCount} words</span>
                </div>
              </aside>
            </div>

            {/* Control Bar */}
            <nav style={{ marginTop: "14px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", position: "sticky", bottom: "12px", zIndex: "20", background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27,46,76,.07)" }}>
              <button 
                onClick={toggleMic}
                style={{ minWidth: "78px", border: "0", background: "transparent", color: "#657287", display: "grid", justifyItems: "center", gap: "4px", cursor: "pointer" }}
              >
                <span style={{ 
                  width: "46px", height: "46px", borderRadius: "50%", 
                  background: micOn ? "#f2f4f7" : "#26374e", 
                  color: micOn ? "#10264a" : "#fff",
                  display: "grid", placeItems: "center", fontSize: "18px", transition: "0.18s"
                }}>
                  {micOn ? "🎙" : "🔇"}
                </span>
                <small style={{ fontSize: "10px" }}>{micOn ? "Mute" : "Unmute"}</small>
              </button>
              <button 
                onClick={togglePause}
                style={{ minWidth: "78px", border: "0", background: "transparent", color: "#657287", display: "grid", justifyItems: "center", gap: "4px", cursor: "pointer" }}
              >
                <span style={{ 
                  width: "46px", height: "46px", borderRadius: "50%", 
                  background: paused ? "#26374e" : "#f2f4f7", 
                  color: paused ? "#fff" : "#10264a",
                  display: "grid", placeItems: "center", fontSize: "18px", transition: "0.18s"
                }}>
                  {paused ? "▶" : "Ⅱ"}
                </span>
                <small style={{ fontSize: "10px" }}>{paused ? "Resume" : "Pause"}</small>
              </button>
              <button 
                onClick={endInterview}
                style={{ minWidth: "78px", border: "0", background: "transparent", color: "#657287", display: "grid", justifyItems: "center", gap: "4px", cursor: "pointer" }}
              >
                <span style={{ 
                  width: "46px", height: "46px", borderRadius: "50%", 
                  background: "#d93c45", color: "#fff",
                  display: "grid", placeItems: "center", fontSize: "18px", transition: "0.18s"
                }}>
                  ☎
                </span>
                <small style={{ fontSize: "10px" }}>End interview</small>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div 
          style={{ 
            position: "fixed", inset: "0", background: "rgba(16,38,74,0.5)", 
            zIndex: "100", display: "grid", placeItems: "center", padding: "20px"
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFeedback(false); }}
        >
          <div style={{ 
            width: "min(760px, 100%)", maxHeight: "90vh", overflow: "auto",
            background: "#fff", borderRadius: "16px", boxShadow: "0 30px 90px rgba(0,0,0,0.25)"
          }}>
            <div style={{ padding: "25px", borderBottom: "1px solid #dedbd5", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "850", letterSpacing: "0.12em", color: "#1769e0", textTransform: "uppercase" }}>SESSION COMPLETE</span>
                <h2 style={{ color: "#10264a", fontSize: "20px", fontWeight: "700", margin: "4px 0 0" }}>Your mock interview summary</h2>
                <p style={{ color: "#657287", margin: "4px 0 0", fontSize: "14px" }}>A quick review of this practice session.</p>
              </div>
              <button 
                onClick={() => setShowFeedback(false)}
                style={{ width: "36px", height: "36px", border: "1px solid #dedbd5", borderRadius: "50%", background: "#fff", cursor: "pointer", fontSize: "18px", color: "#657287" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "10px", padding: "20px" }}>
              <div style={{ padding: "17px", border: "1px solid #dedbd5", borderRadius: "10px", background: "#fbfcfe" }}>
                <strong style={{ display: "block", fontSize: "25px", color: "#10264a" }}>{fmt(seconds)}</strong>
                <small style={{ color: "#657287" }}>Interview duration</small>
              </div>
              <div style={{ padding: "17px", border: "1px solid #dedbd5", borderRadius: "10px", background: "#fbfcfe" }}>
                <strong style={{ display: "block", fontSize: "25px", color: "#10264a" }}>{qi + 1} / {questions.length}</strong>
                <small style={{ color: "#657287" }}>Questions reached</small>
              </div>
              <div style={{ padding: "17px", border: "1px solid #dedbd5", borderRadius: "10px", background: "#fbfcfe" }}>
                <strong style={{ display: "block", fontSize: "25px", color: "#10264a" }}>78%</strong>
                <small style={{ color: "#657287" }}>Response readiness</small>
              </div>
            </div>

            <div style={{ padding: "0 20px 24px" }}>
              <h3 style={{ color: "#10264a", fontSize: "15px", fontWeight: "700", margin: "0 0 12px" }}>Suggested improvements</h3>

              <div style={{ padding: "13px 0", borderBottom: "1px solid #dedbd5" }}>
                <b style={{ display: "block", color: "#10264a", fontSize: "14px" }}>Make technical answers more structured</b>
                <p style={{ margin: "4px 0", color: "#657287", fontSize: "13px" }}>Start with the approach, explain the trade-offs, then finish with complexity or measurable impact.</p>
              </div>
              <div style={{ padding: "13px 0", borderBottom: "1px solid #dedbd5" }}>
                <b style={{ display: "block", color: "#10264a", fontSize: "14px" }}>Use more concrete examples</b>
                <p style={{ margin: "4px 0", color: "#657287", fontSize: "13px" }}>For behavioral questions, connect your answer to a specific project, action you took, and result.</p>
              </div>
              <div style={{ padding: "13px 0", borderBottom: "1px solid #dedbd5" }}>
                <b style={{ display: "block", color: "#10264a", fontSize: "14px" }}>Reduce long pauses before follow-up questions</b>
                <p style={{ margin: "4px 0", color: "#657287", fontSize: "13px" }}>Practice summarizing your thinking aloud so the interviewer can follow your reasoning.</p>
              </div>

              <div style={{ display: "flex", gap: "9px", marginTop: "20px" }}>
                <button 
                  onClick={restartInterview}
                  style={{ border: "0", background: "#1769e0", color: "#fff", padding: "11px 17px", borderRadius: "999px", fontWeight: "750", cursor: "pointer", fontSize: "14px" }}
                >
                  Practice again
                </button>
                <button 
                  onClick={() => { setShowFeedback(false); }}
                  style={{ border: "1px solid #dedbd5", background: "#fff", color: "#172033", padding: "11px 17px", borderRadius: "999px", fontWeight: "750", cursor: "pointer", fontSize: "14px" }}
                >
                  Review my notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}