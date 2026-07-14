import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth } from "./firebase.js"; 

const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Structures & Algorithms", "System Design"];
const difficulties = ["Easy", "Medium", "Hard"];
const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };
const diffBg = { Easy: "rgba(16,185,129,0.08)", Medium: "rgba(245,158,11,0.08)", Hard: "rgba(244,63,94,0.08)" };
const diffBorder = { Easy: "rgba(16,185,129,0.2)", Medium: "rgba(245,158,11,0.2)", Hard: "rgba(244,63,94,0.2)" };

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
    <div style={{
      padding: "1.5rem",
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      color: "#111827",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      overflowX: "hidden",
      background: "#ffffff",
      minHeight: "100vh"
    }}>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          borderRadius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        ::-webkit-scrollbar-corner {
          background: #f3f4f6;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        .chat-window::-webkit-scrollbar { width: 6px; }
        .chat-window::-webkit-scrollbar-track { background: transparent; }
        .chat-window::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>

      {isDemoMode && (
        <div style={{
          background: "#fffbeb", border: "1px solid #fcd34d",
          color: "#92400e", padding: "12px 16px", borderRadius: "12px",
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
            <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111827" }}>Crackin AI</div>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
          </div>
        </div>
      </header>

      <div style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em", color: "#111827" }}>
          Mock <span style={{ color: "#14b8a6" }}>Interview</span>
        </h2>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "1rem" }}>Practice with an AI interviewer and get real feedback.</p>
      </div>

      <div style={{ maxWidth: "900px", width: "100%" }}>
        {!started ? (
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "2.5rem 2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "2rem" }}>
              {["🌐", "⚙️", "🔗", "⟨/⟩", "🏗️"].map((icon, i) => (
                <div key={i} onClick={() => setRole(roles[i])} style={{
                  padding: "16px 12px", borderRadius: "14px",
                  background: role === roles[i] ? "rgba(20, 184, 166, 0.08)" : "#f9fafb",
                  border: `1px solid ${role === roles[i] ? "#14b8a6" : "#e5e7eb"}`,
                  cursor: "pointer", textAlign: "center"
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>{icon}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: role === roles[i] ? "#111827" : "#6b7280",
                    fontWeight: role === roles[i] ? "700" : "500" }}>{roles[i]}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "2.5rem" }}>
              <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "12px",
                textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>Select Difficulty</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px" }}>
                {difficulties.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer",
                    background: difficulty === d ? diffBg[d] : "#f9fafb",
                    color: difficulty === d ? diffColor[d] : "#6b7280",
                    fontWeight: difficulty === d ? "700" : "500", fontSize: "14px",
                    border: `1px solid ${difficulty === d ? diffBorder[d] : "#e5e7eb"}`
                  }}>
                    {d === "Easy" ? "😊" : d === "Medium" ? "😤" : "🔥"} {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px 20px",
              marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                <span style={{ color: "#111827", fontWeight: "700" }}>{role}</span>
                <span style={{ margin: "0 12px", color: "#d1d5db" }}>|</span>
                <span style={{ color: diffColor[difficulty], fontWeight: "700" }}>{difficulty}</span>
              </div>
              <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%" }}></span>
                AI Ready
              </span>
            </div>

            <button onClick={startInterview} style={{
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              color: "white", border: "none", padding: "16px 32px",
              borderRadius: "12px", cursor: "pointer", fontSize: "15px",
              fontWeight: "700", width: "100%", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "10px"
            }}>
              🎯 Start Interview
            </button>
          </div>
        ) : (
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "600px" }}>

            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb",
              background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px",
                  background: "rgba(20, 184, 166, 0.08)", 
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", 
                  border: "1px solid rgba(20, 184, 166, 0.15)" }}>🤖</div>
                <div>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#111827" }}>AI Interviewer</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", fontWeight: "500", marginTop: "2px" }}>
                    {role} · <span style={{ color: diffColor[difficulty], fontWeight: "700" }}>{difficulty}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => { setStarted(false); setMessages([]); }} style={{
                background: "#fef2f2", color: "#ef4444", padding: "8px 16px",
                borderRadius: "10px", border: "1px solid #fecaca",
                cursor: "pointer", fontSize: "13px", fontWeight: "700"
              }}>
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
                      background: "rgba(20, 184, 166, 0.08)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "16px", flexShrink: 0,
                      border: "1px solid rgba(20, 184, 166, 0.15)" }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "14px 18px", borderRadius: "16px",
                    background: m.role === "user" ? "linear-gradient(135deg, #0d9488, #14b8a6)" : "#f9fafb",
                    color: m.role === "user" ? "white" : "#374151", fontSize: "14px", lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                    border: m.role === "user" ? "none" : "1px solid #e5e7eb",
                    borderBottomRightRadius: m.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: m.role !== "user" ? "4px" : "16px",
                    fontWeight: "500"
                  }}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                      background: "rgba(13, 148, 136, 0.08)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "16px", flexShrink: 0,
                      border: "1px solid rgba(13, 148, 136, 0.15)" }}>👤</div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px",
                    background: "rgba(20, 184, 166, 0.08)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", border: "1px solid rgba(20, 184, 166, 0.15)" }}>🤖</div>
                  <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb",
                    padding: "16px", borderRadius: "16px", borderBottomLeftRadius: "4px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{ color: "#6b7280", fontSize: "14px", fontWeight: "500" }}>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                  rows={2} style={{
                    flex: 1, padding: "14px 18px", borderRadius: "12px",
                    border: "1px solid #d1d5db", fontSize: "14px", resize: "none",
                    background: "#ffffff", color: "#111827", lineHeight: "1.6",
                    outline: "none", fontWeight: "500"
                  }} 
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                  background: loading || !input.trim() ? "#f3f4f6" : "linear-gradient(135deg, #0d9488, #14b8a6)",
                  color: loading || !input.trim() ? "#9ca3af" : "white",
                  padding: "0 24px", borderRadius: "12px", border: loading || !input.trim() ? "1px solid #e5e7eb" : "none",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "20px", alignSelf: "stretch",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "10px", fontWeight: "600" }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}