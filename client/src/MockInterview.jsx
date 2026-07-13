import { useState, useEffect, useRef } from "react";
import axios from "axios";
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
          min-width: 0;
          box-sizing: border-box;
          color: white;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-x: hidden;
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
        
        .brand-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -6px rgba(13, 148, 136, 0.6);
        }

        .chat-window::-webkit-scrollbar { width: 6px; }
        .chat-window::-webkit-scrollbar-track { background: transparent; }
        .chat-window::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {isDemoMode && (
        <div style={{
          background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)",
          color: "#fcd34d", padding: "12px 16px", borderRadius: "12px",
          display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "600"
        }}>
          <span>⚠️</span> 
          <span>Backend offline. Connected to Offline Demo AI Interviewer.</span>
        </div>
      )}

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
        </div>
      </header>

      <div style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
          Mock <span style={{ color: "#14b8a6" }}>Interview</span>
        </h2>
        <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>Practice with an AI interviewer and get real feedback.</p>
      </div>

      <div style={{ maxWidth: "900px", width: "100%" }}>
        {!started ? (
          <div className="glass-card" style={{ padding: "2.5rem 2rem" }}>

            <div className="roles-grid">
              {["🌐", "⚙️", "🔗", "⟨/⟩", "🏗️"].map((icon, i) => (
                <div key={i} onClick={() => setRole(roles[i])} style={{
                  padding: "16px 12px", borderRadius: "14px",
                  background: role === roles[i] ? "rgba(20, 184, 166, 0.1)" : "rgba(0, 0, 0, 0.3)",
                  border: `1px solid ${role === roles[i] ? "#14b8a6" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: role === roles[i] ? "0 0 15px rgba(20,184,166,0.2)" : "none",
                  cursor: "pointer", textAlign: "center", transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  transform: role === roles[i] ? "translateY(-4px)" : "none"
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px", filter: role === roles[i] ? "drop-shadow(0 0 8px rgba(20,184,166,0.5))" : "none" }}>{icon}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: role === roles[i] ? "#fff" : "#94a3b8",
                    fontWeight: role === roles[i] ? "700" : "500" }}>{roles[i]}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "2.5rem" }}>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "12px",
                textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>Select Difficulty</label>
              <div className="diff-grid">
                {difficulties.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer",
                    background: difficulty === d ? diffBg[d] : "rgba(0, 0, 0, 0.3)",
                    color: difficulty === d ? diffColor[d] : "#94a3b8",
                    fontWeight: difficulty === d ? "700" : "500", fontSize: "14px",
                    border: `1px solid ${difficulty === d ? diffColor[d] + "80" : "rgba(255,255,255,0.06)"}`,
                    boxShadow: difficulty === d ? `0 0 15px ${diffColor[d]}30` : "none",
                    transition: "all 0.2s"
                  }}>
                    {d === "Easy" ? "😊" : d === "Medium" ? "😤" : "🔥"} {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "16px 20px",
              marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                <span style={{ color: "#fff", fontWeight: "700" }}>{role}</span>
                <span style={{ margin: "0 12px", color: "#444" }}>|</span>
                <span style={{ color: diffColor[difficulty], fontWeight: "700" }}>{difficulty}</span>
              </div>
              <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 10px #22c55e" }}></span>
                AI Ready
              </span>
            </div>

            <button onClick={startInterview} className="brand-btn">
              🎯 Start Interview
            </button>
          </div>
        ) : (
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "600px" }}>

            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px",
                  background: "rgba(20, 184, 166, 0.1)", 
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", 
                  border: "1px solid rgba(20, 184, 166, 0.25)", boxShadow: "0 0 15px rgba(20,184,166,0.1)" }}>🤖</div>
                <div>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>AI Interviewer</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: "500", marginTop: "2px" }}>
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

            <div className="chat-window" style={{ flex: 1, overflowY: "auto", padding: "1.5rem",
              display: "flex", flexDirection: "column", gap: "20px" }}>
              {messages.filter(m => m.role !== "system").map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: "12px"
                }}>
                  {m.role !== "user" && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                      background: "rgba(20, 184, 166, 0.1)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "16px", flexShrink: 0,
                      border: "1px solid rgba(20, 184, 166, 0.25)" }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "14px 18px", borderRadius: "16px",
                    background: m.role === "user" ? "linear-gradient(135deg, #0d9488, #14b8a6)" : "rgba(0, 0, 0, 0.4)",
                    color: m.role === "user" ? "white" : "#e2e8f0", fontSize: "14px", lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                    borderBottomRightRadius: m.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: m.role !== "user" ? "4px" : "16px",
                    boxShadow: m.role === "user" ? "0 4px 15px rgba(20,184,166,0.3)" : "0 4px 15px rgba(0,0,0,0.2)",
                    fontWeight: "500"
                  }}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                      background: "rgba(13, 148, 136, 0.15)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "16px", flexShrink: 0,
                      border: "1px solid rgba(13, 148, 136, 0.3)" }}>👤</div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                    background: "rgba(20, 184, 166, 0.1)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", border: "1px solid rgba(20, 184, 166, 0.25)" }}>🤖</div>
                  <div style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255,255,255,0.08)",
                    padding: "16px", borderRadius: "16px", borderBottomLeftRadius: "4px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: "8px", height: "8px", borderRadius: "50%", background: "#14b8a6",
                          animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                  rows={2} style={{
                    flex: 1, padding: "14px 18px", borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)", fontSize: "14px", resize: "none",
                    background: "rgba(0, 0, 0, 0.4)", color: "white", lineHeight: "1.6",
                    outline: "none", transition: "border 0.2s", fontWeight: "500"
                  }} 
                  onFocus={e => e.target.style.borderColor = "rgba(20,184,166,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                  background: loading || !input.trim() ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #0d9488, #14b8a6)",
                  color: loading || !input.trim() ? "#64748b" : "white",
                  padding: "0 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "20px", transition: "all 0.2s", alignSelf: "stretch",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: !loading && input.trim() ? "0 4px 15px rgba(20,184,166,0.3)" : "none"
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "10px", fontWeight: "600" }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}