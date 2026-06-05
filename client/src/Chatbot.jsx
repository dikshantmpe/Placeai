import visionImg from "./assets/vision.jpg";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello. I am Vision 🔴 Your AI placement assistant. I am here to help you with DSA, HR interviews, resume tips, and anything related to placement preparation." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = [
    "How to prepare for DSA?",
    "Tell me about yourself answer",
    "What is time complexity?",
    "How to crack Google interview?"
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chatbot", {
        messages: newMessages.map(m => ({ role: m.role, content: m.content }))
      });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again!" }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Hello. I am Vision 🔴 Your AI placement assistant. I am here to help you with DSA, HR interviews, resume tips, and anything related to placement preparation." }]);
  };

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: "linear-gradient(135deg, #b91c1c, #7f1d1d)",
          color: "white", border: "2px solid #fca5a5",
          cursor: "pointer", zIndex: 1000,
          boxShadow: "0 4px 16px rgba(185,28,28,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
        {open ? <span style={{ fontSize: "20px", fontWeight: "bold" }}>✕</span> :
        <img src={visionImg} alt="Vision"
        style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", objectPosition: "top" }}
  />
}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px",
          width: "370px", height: "520px", background: "white",
          borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", zIndex: 999,
          border: "1px solid #eee"
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #b91c1c, #7f1d1d)",
            borderRadius: "16px 16px 0 0",
            padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={visionImg} alt="Vision"
              style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", objectPosition: "top" }}
              />
              <div>
                <p style={{ margin: 0, color: "white", fontWeight: "600", fontSize: "15px" }}>Vision</p>
                <p style={{ margin: 0, color: "#fca5a5", fontSize: "11px" }}>Your placement assistant</p>
              </div>
            </div>
            <button onClick={clearChat}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white",
                padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
              Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", padding: "10px 12px", borderRadius: "12px",
                  background: m.role === "user" ? "#b91c1c" : "#f3f4f6",
                  color: m.role === "user" ? "white" : "black",
                  fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap"
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#f3f4f6", padding: "10px 14px",
                  borderRadius: "12px", fontSize: "13px", color: "#999" }}>
                  Vision is thinking...
                </div>
              </div>
            )}

            {/* Suggestion Chips */}
            {messages.length === 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    style={{ background: "#fee2e2", color: "#b91c1c", border: "none",
                      padding: "6px 12px", borderRadius: "20px", cursor: "pointer",
                      fontSize: "12px", fontWeight: "500" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Vision anything..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: "8px",
                border: "1px solid #ddd", fontSize: "13px", outline: "none" }}
            />
            <button onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ background: "#b91c1c", color: "white", border: "none",
                padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}