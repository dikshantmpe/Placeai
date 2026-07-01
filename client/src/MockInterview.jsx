import { useState, useEffect, useRef } from "react";
import axios from "axios";
// FIXED: Locked in the correct path for your folder structure
import { auth } from "./firebase.js"; 

const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Structures & Algorithms", "System Design"];
const difficulties = ["Easy", "Medium", "Hard"];
const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };
const diffBg = { Easy: "rgba(16,185,129,0.15)", Medium: "rgba(245,158,11,0.15)", Hard: "rgba(244,63,94,0.15)" };

export default function MockInterview() {
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startInterview = async () => {
    setStarted(true);
    setMessages([]);
    setLoading(true);
    setIsDemoMode(false);
    
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
      
      // Fallback Demo Initial Response
      setTimeout(() => {
        setMessages([
          ...firstMessage, 
          { role: "model", content: `Hello! I am your AI Mock Interviewer. I see you are applying for the ${role} position. To get started, could you walk me through a challenging technical problem you solved recently and how you approached it?` }
        ]);
        setLoading(false);
      }, 1500);
      return;
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (isDemoMode) {
      // Fake AI response if backend is offline
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

  return (
    <div className="mock-container">
      <style>{`
        .mock-container {
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
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 2rem;
        }

        .diff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .brand-btn {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(255,63,129,0.3);
          transition: all 0.3s ease;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .brand-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124,58,237,0.4), 0 8px 30px rgba(255,63,129,0.4);
        }

        /* Custom scrollbar for chat */
        .chat-window::-webkit-scrollbar { width: 6px; }
        .chat-window::-webkit-scrollbar-track { background: transparent; }
        .chat-window::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
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
          <span>Backend offline. Connected to Offline Demo AI Interviewer.</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "24px", height: "3px", background: "linear-gradient(90deg, #3b82f6, transparent)", borderRadius: "2px" }}></span>
          Mock <span style={{ background: "linear-gradient(90deg, #3b82f6, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interview</span>
        </h2>
        <p style={{ color: "#9b9ba8", margin: 0, fontSize: "14px", fontWeight: "500" }}>Practice with an AI interviewer and get real feedback.</p>
      </div>

      <div style={{ maxWidth: "900px", width: "100%" }}>
        {!started ? (
          /* Setup Card */
          <div className="glass-card" style={{ padding: "2.5rem 2rem" }}>

            {/* Role icons preview */}
            <div className="roles-grid">
              {["🌐", "⚙️", "🔗", "⟨/⟩", "🏗️"].map((icon, i) => (
                <div key={i} onClick={() => setRole(roles[i])} style={{
                  padding: "16px 12px", borderRadius: "14px",
                  background: role === roles[i] ? "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(255,63,129,0.1))" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${role === roles[i] ? "#ff3f81" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: role === roles[i] ? "0 0 15px rgba(255,63,129,0.2)" : "none",
                  cursor: "pointer", textAlign: "center", transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  transform: role === roles[i] ? "translateY(-4px)" : "none"
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px", filter: role === roles[i] ? "drop-shadow(0 0 8px rgba(255,63,129,0.5))" : "none" }}>{icon}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: role === roles[i] ? "#fff" : "#9b9ba8",
                    fontWeight: role === roles[i] ? "700" : "500" }}>{roles[i]}</p>
                </div>
              ))}
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: "2.5rem" }}>
              <label style={{ fontSize: "12px", color: "#6b6b78", display: "block", marginBottom: "12px",
                textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>Select Difficulty</label>
              <div className="diff-grid">
                {difficulties.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer",
                    background: difficulty === d ? diffBg[d] : "rgba(255,255,255,0.03)",
                    color: difficulty === d ? diffColor[d] : "#9b9ba8",
                    fontWeight: difficulty === d ? "700" : "500", fontSize: "14px",
                    border: `1px solid ${difficulty === d ? diffColor[d] + "80" : "rgba(255,255,255,0.1)"}`,
                    boxShadow: difficulty === d ? `0 0 15px ${diffColor[d]}30` : "none",
                    transition: "all 0.2s"
                  }}>
                    {d === "Easy" ? "😊" : d === "Medium" ? "😤" : "🔥"} {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "16px 20px",
              marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "14px", color: "#9b9ba8" }}>
                <span style={{ color: "#fff", fontWeight: "700" }}>{role}</span>
                <span style={{ margin: "0 12px", color: "#444" }}>|</span>
                <span style={{ color: diffColor[difficulty], fontWeight: "700" }}>{difficulty}</span>
              </div>
              <span style={{ fontSize: "13px", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 10px #10b981" }}></span>
                AI Ready
              </span>
            </div>

            <button onClick={startInterview} className="brand-btn">
              🎯 Start Interview
            </button>
          </div>
        ) : (
          /* Chat UI */
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "600px" }}>

            {/* Chat Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(255,63,129,0.2))", 
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", 
                  border: "1px solid rgba(124,58,237,0.4)", boxShadow: "0 0 15px rgba(124,58,237,0.2)" }}>🤖</div>
                <div>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>AI Interviewer</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9b9ba8", fontWeight: "500", marginTop: "2px" }}>
                    {role} · <span style={{ color: diffColor[difficulty], fontWeight: "700" }}>{difficulty}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => { setStarted(false); setMessages([]); }} style={{
                background: "rgba(244,63,94,0.1)", color: "#f43f5e", padding: "8px 16px",
                borderRadius: "10px", border: "1px solid rgba(244,63,94,0.3)",
                cursor: "pointer", fontSize: "13px", fontWeight: "700", transition: "all 0.2s"
              }} onMouseEnter={e => e.target.style.background = "rgba(244,63,94,0.2)"}
                 onMouseLeave={e => e.target.style.background = "rgba(244,63,94,0.1)"}>
                End Interview
              </button>
            </div>

            {/* Messages */}
            <div className="chat-window" style={{ flex: 1, overflowY: "auto", padding: "1.5rem",
              display: "flex", flexDirection: "column", gap: "20px" }}>
              {messages.filter(m => m.role !== "system").map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: "12px"
                }}>
                  {m.role !== "user" && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                      background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "16px", flexShrink: 0,
                      border: "1px solid rgba(124,58,237,0.3)" }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "14px 18px", borderRadius: "16px",
                    background: m.role === "user" ? "linear-gradient(135deg, #7c3aed, #ff3f81)" : "rgba(255,255,255,0.03)",
                    color: m.role === "user" ? "white" : "#e2e8f0", fontSize: "14px", lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
                    borderBottomRightRadius: m.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: m.role !== "user" ? "4px" : "16px",
                    boxShadow: m.role === "user" ? "0 4px 15px rgba(255,63,129,0.2)" : "0 4px 15px rgba(0,0,0,0.2)",
                    fontWeight: "500"
                  }}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                      background: "rgba(255,63,129,0.15)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "16px", flexShrink: 0,
                      border: "1px solid rgba(255,63,129,0.3)" }}>👤</div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                    background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", border: "1px solid rgba(124,58,237,0.3)" }}>🤖</div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "16px", borderRadius: "16px", borderBottomLeftRadius: "4px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: "8px", height: "8px", borderRadius: "50%", background: "#a78bfa",
                          animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                  rows={2} style={{
                    flex: 1, padding: "14px 18px", borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)", fontSize: "14px", resize: "none",
                    background: "rgba(0,0,0,0.3)", color: "white", lineHeight: "1.6",
                    outline: "none", transition: "border 0.2s", fontWeight: "500"
                  }} 
                  onFocus={e => e.target.style.borderColor = "rgba(255,63,129,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                  background: loading || !input.trim() ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg, #7c3aed, #ff3f81)",
                  color: loading || !input.trim() ? "#6b6b78" : "white",
                  padding: "0 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "20px", transition: "all 0.2s", alignSelf: "stretch",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: !loading && input.trim() ? "0 4px 15px rgba(255,63,129,0.3)" : "none"
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "#6b6b78", marginTop: "10px", fontWeight: "600" }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}