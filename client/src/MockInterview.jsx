import { useState } from "react";
import axios from "axios";

export default function MockInterview() {
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Structures & Algorithms", "System Design"];
  const difficulties = ["Easy", "Medium", "Hard"];

  const startInterview = async () => {
    setStarted(true);
    setMessages([]);
    setLoading(true);

    const firstMessage = [{ role: "user", content: "Hello, I am ready for the interview." }];

    try {
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/interview/chat", {
        messages: firstMessage,
        role,
        difficulty
      });

      setMessages([
        ...firstMessage,
        { role: "model", content: res.data.reply }
      ]);
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
        messages: newMessages,
        role,
        difficulty
      });

      setMessages([...newMessages, { role: "model", content: res.data.reply }]);
    } catch (err) {
      alert("Error sending message.");
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
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Mock Interview</h2>
      <p style={{ color: "#666" }}>Practice with an AI interviewer and get real feedback.</p>

      {/* Setup Section */}
      {!started && (
        <div style={{ background: "#f9f9f9", padding: "1.5rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "500", display: "block", marginBottom: "6px" }}>Select Role:</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", width: "100%", fontSize: "15px" }}>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: "500", display: "block", marginBottom: "6px" }}>Difficulty:</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {difficulties.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{
                    padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
                    background: difficulty === d ? "#4f46e5" : "#eee",
                    color: difficulty === d ? "white" : "black",
                    fontWeight: difficulty === d ? "600" : "400"
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startInterview}
            style={{ background: "#4f46e5", color: "white", padding: "12px 28px",
              borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "500" }}>
            Start Interview 🎯
          </button>
        </div>
      )}

      {/* Chat Section */}
      {started && (
        <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ background: "#eee", padding: "6px 14px", borderRadius: "8px", fontSize: "14px" }}>
              {role} — {difficulty}
            </span>
            <button onClick={() => setStarted(false)}
              style={{ background: "#ff4444", color: "white", padding: "6px 14px",
                borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px" }}>
              End Interview
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{ border: "1px solid #eee", borderRadius: "12px", height: "420px",
            overflowY: "auto", padding: "1rem", marginBottom: "1rem", background: "#fafafa" }}>
            {messages.filter(m => m.role !== "system").map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "12px"
              }}>
                <div style={{
                  maxWidth: "75%", padding: "10px 14px", borderRadius: "12px",
                  background: m.role === "user" ? "#4f46e5" : "white",
                  color: m.role === "user" ? "white" : "black",
                  border: m.role === "user" ? "none" : "1px solid #eee",
                  fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap"
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
                <div style={{ background: "white", border: "1px solid #eee", padding: "10px 14px",
                  borderRadius: "12px", fontSize: "14px", color: "#999" }}>
                  Interviewer is typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "10px" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Enter to send)"
              rows={3}
              style={{ flex: 1, padding: "10px 14px", borderRadius: "8px",
                border: "1px solid #ddd", fontSize: "14px", resize: "none" }}
            />
            <button onClick={sendMessage} disabled={loading}
              style={{ background: "#4f46e5", color: "white", padding: "10px 20px",
                borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: "500" }}>
              Send
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "6px" }}>Press Enter to send • Shift+Enter for new line</p>
        </>
      )}
    </div>
  );
}