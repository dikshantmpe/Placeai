import { useState, useEffect, useRef } from "react";
import axios from "axios";

const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Structures & Algorithms", "System Design"];
const difficulties = ["Easy", "Medium", "Hard"];
const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

export default function MockInterview() {
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startInterview = async () => {
    setStarted(true);
    setMessages([]);
    setLoading(true);
    const firstMessage = [{ role: "user", content: "Hello, I am ready for the interview." }];
    try {
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/interview/chat", {
        messages: firstMessage, role, difficulty
      });
      setMessages([...firstMessage, { role: "model", content: res.data.reply }]);
    } catch (err) {
      alert("Error starting interview. Make sure backend is running.");
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/interview/chat", {
        messages: newMessages, role, difficulty
      });
      setMessages([...newMessages, { role: "model", content: res.data.reply }]);
    } catch (err) {
      alert("Error sending message.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}>Mock Interview</h2>
        <p style={{ color: "#555", margin: 0, fontSize: "14px" }}>Practice with an AI interviewer and get real feedback.</p>
      </div>

      {!started ? (
        /* Setup Card */
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "2rem" }}>

          {/* Role icons preview */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", flexWrap: "wrap" }}>
            {["🌐", "⚙️", "🔗", "⟨/⟩", "🏗️"].map((icon, i) => (
              <div key={i} onClick={() => setRole(roles[i])} style={{
                flex: 1, minWidth: "120px", padding: "16px 12px", borderRadius: "12px",
                background: role === roles[i] ? "rgba(220,38,38,0.15)" : "#161616",
                border: `1px solid ${role === roles[i] ? "#dc2626" : "#2a2a2a"}`,
                cursor: "pointer", textAlign: "center", transition: "all 0.2s"
              }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
                <p style={{ margin: 0, fontSize: "11px", color: role === roles[i] ? "#dc2626" : "#666",
                  fontWeight: role === roles[i] ? "600" : "400" }}>{roles[i]}</p>
              </div>
            ))}
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ fontSize: "13px", color: "#555", display: "block", marginBottom: "10px",
              textTransform: "uppercase", letterSpacing: "0.05em" }}>Difficulty Level</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {difficulties.map(d => (
                <button key={d} onClick={() => setDifficulty(d)} style={{
                  flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: difficulty === d ? `${diffColor[d]}18` : "#161616",
                  color: difficulty === d ? diffColor[d] : "#555",
                  fontWeight: difficulty === d ? "700" : "400", fontSize: "14px",
                  border: `1px solid ${difficulty === d ? diffColor[d] + "55" : "#2a2a2a"}`,
                  transition: "all 0.2s"
                }}>
                  {d === "Easy" ? "😊" : d === "Medium" ? "😤" : "🔥"} {d}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: "#161616", borderRadius: "10px", padding: "14px 16px",
            marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "13px", color: "#888" }}>
              <span style={{ color: "#fff", fontWeight: "600" }}>{role}</span>
              <span style={{ margin: "0 8px", color: "#333" }}>·</span>
              <span style={{ color: diffColor[difficulty], fontWeight: "600" }}>{difficulty}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#444" }}>AI Interviewer Ready 🤖</span>
          </div>

          <button onClick={startInterview} style={{
            background: "#dc2626", color: "white", padding: "14px 32px", width: "100%",
            borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "15px",
            fontWeight: "600", boxShadow: "0 4px 20px rgba(220,38,38,0.3)", transition: "opacity 0.2s"
          }}>
            🎯 Start Interview
          </button>
        </div>
      ) : (
        /* Chat UI */
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", overflow: "hidden" }}>

          {/* Chat Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1f1f1f",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px",
                background: "#dc262618", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "18px", border: "1px solid #dc262633" }}>🤖</div>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>AI Interviewer</p>
                <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>{role} · {" "}
                  <span style={{ color: diffColor[difficulty] }}>{difficulty}</span>
                </p>
              </div>
            </div>
            <button onClick={() => { setStarted(false); setMessages([]); }} style={{
              background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "7px 16px",
              borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)",
              cursor: "pointer", fontSize: "13px", fontWeight: "600"
            }}>
              End Interview
            </button>
          </div>

          {/* Messages */}
          <div style={{ height: "450px", overflowY: "auto", padding: "1.5rem",
            display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.filter(m => m.role !== "system").map((m, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: "10px"
              }}>
                {m.role !== "user" && (
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px",
                    background: "#dc262618", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "14px", flexShrink: 0,
                    border: "1px solid #dc262633" }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "75%", padding: "12px 16px", borderRadius: "12px",
                  background: m.role === "user" ? "#dc2626" : "#1a1a1a",
                  color: "white", fontSize: "14px", lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                  border: m.role === "user" ? "none" : "1px solid #2a2a2a",
                  borderBottomRightRadius: m.role === "user" ? "4px" : "12px",
                  borderBottomLeftRadius: m.role !== "user" ? "4px" : "12px",
                }}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px",
                    background: "#dc262618", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>👤</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px",
                  background: "#dc262618", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "14px", border: "1px solid #dc262633" }}>🤖</div>
                <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a",
                  padding: "12px 16px", borderRadius: "12px", borderBottomLeftRadius: "4px" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%", background: "#dc2626",
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
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1f1f1f" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                rows={3} style={{
                  flex: 1, padding: "12px 16px", borderRadius: "10px",
                  border: "1px solid #2a2a2a", fontSize: "14px", resize: "none",
                  background: "#161616", color: "white", lineHeight: "1.6",
                  outline: "none"
                }} />
              <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                background: loading || !input.trim() ? "#1f1f1f" : "#dc2626",
                color: loading || !input.trim() ? "#444" : "white",
                padding: "12px 20px", borderRadius: "10px", border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "20px", transition: "all 0.2s", alignSelf: "flex-end"
              }}>
                ➤
              </button>
            </div>
            <p style={{ fontSize: "11px", color: "#333", marginTop: "8px" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}