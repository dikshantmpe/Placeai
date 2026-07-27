import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";

const MockInterview = () => {
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [setupComplete, setSetupComplete] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [messages, setMessages] = useState([]);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const auth = getAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // Timer
  useEffect(() => {
    if (!setupComplete) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [setupComplete]);

  // Speak question - FREE optimized Web Speech API
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Priority: Google > Microsoft > Apple > Default
    let selectedVoice = voices.find(v => 
      v.name.includes("Google") && v.lang.includes("en")
    ) || voices.find(v => 
      (v.name.includes("Microsoft") || v.name.includes("Zira")) && v.lang.includes("en")
    ) || voices.find(v => 
      v.name.includes("Samantha") && v.lang.includes("en")
    ) || voices.find(v => 
      v.lang.includes("en-US")
    );

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Optimize for natural sound
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error("Speech error:", error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start interview - get first question from Cohere
  const startInterview = async () => {
    setSetupComplete(true);
    setIsLoading(true);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      // Initialize conversation with empty message to get first question
      const initialMessages = [
        {
          role: "user",
          content: `Start the interview for a ${role} role at ${difficulty} difficulty. Ask the first question.`
        }
      ];

      const response = await fetch(`${API_URL}/api/interview/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          messages: initialMessages,
          role,
          difficulty
        })
      });

      const data = await response.json();
      const aiQuestion = data.reply;

      // Add to conversation and messages
      setConversation([{ type: "ai", text: aiQuestion }]);
      setMessages([{ role: "assistant", content: aiQuestion }]);

      // Speak the question
      setIsLoading(false);
      setTimeout(() => {
        speakQuestion(aiQuestion);
      }, 500);
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Failed to connect to AI. Please check your connection.");
      setSetupComplete(false);
      setIsLoading(false);
    }
  };

  // Submit answer and get next question
  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    if (isLoading) return;

    setIsLoading(true);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      // Build message history
      const updatedMessages = [
        ...messages,
        { role: "user", content: userAnswer }
      ];

      const response = await fetch(`${API_URL}/api/interview/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          messages: updatedMessages,
          role,
          difficulty
        })
      });

      const data = await response.json();
      const aiResponse = data.reply;

      // Add to conversation
      setConversation(prev => [
        ...prev,
        { type: "answer", text: userAnswer },
        { type: "ai", text: aiResponse }
      ]);

      // Update messages for next API call
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: aiResponse }
      ]);

      setUserAnswer("");
      setIsLoading(false);

      // Speak the response
      setTimeout(() => {
        speakQuestion(aiResponse);
      }, 500);

      setCurrentQuestionIndex(prev => prev + 1);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to process response. Please try again.");
      setIsLoading(false);
    }
  };

  // Setup Screen
  if (!setupComplete) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f3f2ef",
        padding: "40px 20px",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #dedbd5",
          padding: "40px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 12px 34px rgba(27, 46, 76, 0.05)"
        }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#10264a", margin: "0 0 12px 0" }}>
            AI Mock Interview
          </h1>
          <p style={{ color: "#657287", fontSize: "14px", marginBottom: "24px" }}>
            Practice with Cohere AI. Get real-time feedback and improve your interview skills.
          </p>

          <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#1769e0", textTransform: "uppercase", marginBottom: "8px" }}>
                Position
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #dedbd5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff"
                }}
              >
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
                <option>DevOps Engineer</option>
                <option>Product Manager</option>
                <option>Data Scientist</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#1769e0", textTransform: "uppercase", marginBottom: "8px" }}>
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #dedbd5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff"
                }}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Expert</option>
              </select>
            </div>
          </div>

          <button
            onClick={startInterview}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              background: isLoading ? "#ccc" : "#1769e0",
              color: "#fff",
              border: "0",
              borderRadius: "99px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Starting..." : "Start Interview →"}
          </button>
        </div>
      </div>
    );
  }

  // Live Session Screen
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f2ef",
      padding: "20px",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          background: "#fff",
          padding: "16px 20px",
          borderRadius: "12px",
          border: "1px solid #dedbd5"
        }}>
          <div>
            <h1 style={{ margin: "0", color: "#10264a", fontSize: "1.3rem", fontWeight: "700" }}>
              {role} Interview
            </h1>
            <p style={{ margin: "4px 0 0", color: "#657287", fontSize: "12px" }}>Difficulty: {difficulty}</p>
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#10264a" }}>
            {elapsedTime}
          </div>
        </div>

        {/* Chat Box */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #dedbd5",
          padding: "20px",
          marginBottom: "20px",
          minHeight: "400px",
          maxHeight: "500px",
          overflowY: "auto"
        }}>
          {conversation.map((msg, i) => (
            <div key={i} style={{
              marginBottom: "16px",
              display: "flex",
              gap: "12px",
              justifyContent: msg.type === "answer" ? "flex-end" : "flex-start"
            }}>
              {msg.type === "ai" && (
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#1769e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "700",
                  flexShrink: 0,
                  fontSize: "14px"
                }}>
                  AI
                </div>
              )}
              <div style={{
                maxWidth: "70%",
                background: msg.type === "answer" ? "#eaf3ff" : "#f6f7f9",
                padding: "12px 16px",
                borderRadius: "10px",
                border: msg.type === "ai" ? "none" : "1px solid #dedbd5"
              }}>
                <p style={{ margin: 0, color: "#172033", lineHeight: "1.5", fontSize: "14px" }}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {isSpeaking && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#1769e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "16px",
                animation: "pulse 1s infinite"
              }}>
                🔊
              </div>
              <div style={{ color: "#657287", fontSize: "14px" }}>AI is speaking...</div>
            </div>
          )}

          {isLoading && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#1769e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "16px",
                animation: "pulse 1s infinite"
              }}>
                ⟳
              </div>
              <div style={{ color: "#657287", fontSize: "14px" }}>Processing your answer...</div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #dedbd5",
          padding: "16px",
          display: "flex",
          gap: "12px"
        }}>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                submitAnswer();
              }
            }}
            placeholder="Type your answer here..."
            disabled={isLoading}
            style={{
              flex: 1,
              minHeight: "80px",
              padding: "12px",
              border: "1px solid #dedbd5",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "none",
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? "not-allowed" : "text"
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => speakQuestion(conversation[conversation.length - 1]?.text || "")}
              disabled={isLoading || conversation.length === 0}
              style={{
                padding: "10px 16px",
                background: isSpeaking ? "#1769e0" : "#fff",
                color: isSpeaking ? "#fff" : "#172033",
                border: "1px solid #dedbd5",
                borderRadius: "8px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "13px",
                whiteSpace: "nowrap",
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isSpeaking ? "🔊 Speaking..." : "🔊 Hear"}
            </button>
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || isLoading}
              style={{
                padding: "10px 24px",
                background: (userAnswer.trim() && !isLoading) ? "#1769e0" : "#ccc",
                color: "#fff",
                border: "0",
                borderRadius: "8px",
                cursor: (userAnswer.trim() && !isLoading) ? "pointer" : "not-allowed",
                fontWeight: "700",
                fontSize: "13px",
                whiteSpace: "nowrap"
              }}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default MockInterview;