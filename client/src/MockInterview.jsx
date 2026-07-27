import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";

const MockInterview = () => {
  // --- States ---
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [setupComplete, setSetupComplete] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  
  const [userAnswer, setUserAnswer] = useState("");
  const [conversation, setConversation] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [femaleVoice, setFemaleVoice] = useState(null);

  // --- Refs ---
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const auth = getAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // --- Voice Synthesis Setup (Text to Speech) ---
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const filtered = voices.filter((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes("female") ||
          name.includes("woman") ||
          name.includes("samantha") ||
          name.includes("victoria") ||
          name.includes("zira") ||
          name.includes("tessa") ||
          name.includes("karen")
        );
      });

      const preferredVoice = 
        filtered.find(v => v.name.includes("Google") || v.name.includes("Microsoft")) || 
        filtered[0] || 
        voices[0];

      setFemaleVoice(preferredVoice);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // --- Voice Recognition Setup (Speech to Text) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setUserAnswer((prev) => (prev ? prev + " " : "") + finalTranscript.trim());
        }
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (e) => {
        console.error("Microphone error:", e.error);
        setIsListening(false);
      };
    }
  }, []);

  // --- Auto Scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isSpeaking, isLoading]);

  // --- Timer ---
  useEffect(() => {
    if (!setupComplete || isEnded) return;

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
  }, [setupComplete, isEnded]);

  // --- Actions ---
  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) {
      alert("Voice typing is not supported in this browser. Please use Google Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakQuestion = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    // Clean markdown characters before passing to speech engine
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/#/g, "")
      .replace(/_/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const endInterview = () => {
    const confirmEnd = window.confirm("Are you sure you want to end the interview?");
    if (confirmEnd) {
      setIsEnded(true);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (isListening) recognitionRef.current?.stop();
      clearInterval(timerRef.current);
    }
  };

  const startInterview = async () => {
    setSetupComplete(true);
    setIsLoading(true);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
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
        body: JSON.stringify({ messages: initialMessages, role, difficulty })
      });

      const data = await response.json();
      const aiQuestion = data.reply;

      setConversation([{ type: "ai", text: aiQuestion }]);
      setMessages([{ role: "assistant", content: aiQuestion }]);
      
      setIsLoading(false);
      setTimeout(() => speakQuestion(aiQuestion), 500);
    } catch (error) {
      console.error("Failed to start:", error);
      alert("Failed to connect to AI. Please check your connection.");
      setSetupComplete(false);
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || isLoading || isEnded) return;

    if (isListening) recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(true);

    const currentUserAnswer = userAnswer;
    setUserAnswer(""); // Clear input immediately for better UX

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const updatedMessages = [...messages, { role: "user", content: currentUserAnswer }];

      setConversation(prev => [...prev, { type: "answer", text: currentUserAnswer }]);

      const response = await fetch(`${API_URL}/api/interview/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ messages: updatedMessages, role, difficulty })
      });

      const data = await response.json();
      const aiResponse = data.reply;

      setConversation(prev => [...prev, { type: "ai", text: aiResponse }]);
      setMessages([...updatedMessages, { role: "assistant", content: aiResponse }]);
      setIsLoading(false);
      
      setTimeout(() => speakQuestion(aiResponse), 500);
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to process response. Please try again.");
      setIsLoading(false);
      setUserAnswer(currentUserAnswer); // Restore answer on failure
    }
  };

  // --- Keyboard Handler ---
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents moving to the next line
      submitAnswer();
    }
  };

  // --- Render Setup Screen ---
  if (!setupComplete) {
    return (
      <div style={{
        minHeight: "100vh", background: "#f3f2ef", padding: "40px 20px",
        fontFamily: "Inter, system-ui, sans-serif", display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "#fff", borderRadius: "12px", border: "1px solid #dedbd5",
          padding: "40px", maxWidth: "500px", width: "100%",
          boxShadow: "0 12px 34px rgba(27, 46, 76, 0.05)"
        }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#10264a", margin: "0 0 12px 0" }}>
            AI Mock Interview
          </h1>
          <p style={{ color: "#657287", fontSize: "14px", marginBottom: "24px" }}>
            Practice with AI. Get real-time feedback and improve your skills.
          </p>

          <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#1769e0", textTransform: "uppercase", marginBottom: "8px" }}>
                Position
              </label>
              <select
                value={role} onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #dedbd5", borderRadius: "8px", fontSize: "14px", background: "#fff" }}
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
                value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #dedbd5", borderRadius: "8px", fontSize: "14px", background: "#fff" }}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Expert</option>
              </select>
            </div>
          </div>
          <button
            onClick={startInterview} disabled={isLoading}
            style={{
              width: "100%", padding: "12px", background: isLoading ? "#ccc" : "#1769e0",
              color: "#fff", border: "0", borderRadius: "99px", fontWeight: "700",
              fontSize: "15px", cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Starting..." : "Start Interview →"}
          </button>
        </div>
      </div>
    );
  }

  // --- Render Live Session ---
  return (
    <div style={{ minHeight: "100vh", background: "#f3f2ef", padding: "20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "20px", background: "#fff", padding: "16px 20px",
          borderRadius: "12px", border: "1px solid #dedbd5"
        }}>
          <div>
            <h1 style={{ margin: "0", color: "#10264a", fontSize: "1.3rem", fontWeight: "700" }}>
              {role} Interview {isEnded && "(Ended)"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#657287", fontSize: "12px" }}>Difficulty: {difficulty}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#10264a" }}>
              {elapsedTime}
            </div>
            {!isEnded && (
              <button 
                onClick={endInterview}
                style={{
                  padding: "8px 16px", background: "#ffebee", color: "#c62828",
                  border: "1px solid #ffcdd2", borderRadius: "8px", fontWeight: "600",
                  cursor: "pointer", fontSize: "13px"
                }}
              >
                End Interview
              </button>
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div style={{
          background: "#fff", borderRadius: "12px", border: "1px solid #dedbd5",
          padding: "20px", marginBottom: "20px", minHeight: "400px",
          maxHeight: "500px", overflowY: "auto"
        }}>
          {conversation.map((msg, i) => (
            <div key={i} style={{
              marginBottom: "16px", display: "flex", gap: "12px",
              justifyContent: msg.type === "answer" ? "flex-end" : "flex-start"
            }}>
              {msg.type === "ai" && (
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", background: "#1769e0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: "700", flexShrink: 0, fontSize: "14px"
                }}>AI</div>
              )}
              <div style={{
                maxWidth: "70%", background: msg.type === "answer" ? "#eaf3ff" : "#f6f7f9",
                padding: "12px 16px", borderRadius: "10px",
                border: msg.type === "ai" ? "none" : "1px solid #dedbd5",
                whiteSpace: "pre-wrap" // Allows displaying new lines properly if formatting exists
              }}>
                <p style={{ margin: 0, color: "#172033", lineHeight: "1.5", fontSize: "14px" }}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {isSpeaking && !isEnded && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1769e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px", animation: "pulse 1s infinite" }}>🔊</div>
              <div style={{ color: "#657287", fontSize: "14px" }}>AI is speaking...</div>
            </div>
          )}

          {isLoading && !isEnded && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1769e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px", animation: "pulse 1s infinite" }}>⟳</div>
              <div style={{ color: "#657287", fontSize: "14px" }}>Processing your answer...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          background: "#fff", borderRadius: "12px", border: "1px solid #dedbd5",
          padding: "16px", display: "flex", gap: "12px", opacity: isEnded ? 0.6 : 1
        }}>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type your answer here... (Press Enter to send, Shift+Enter for new line)"}
            disabled={isLoading || isEnded}
            style={{
              flex: 1, minHeight: "80px", padding: "12px", border: "1px solid #dedbd5",
              borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "none",
              cursor: (isLoading || isEnded) ? "not-allowed" : "text",
              background: isListening ? "#f0f8ff" : "#fff"
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => speakQuestion(conversation[conversation.length - 1]?.text || "")}
                disabled={isLoading || conversation.length === 0 || isEnded}
                style={{
                  flex: 1, padding: "8px 12px", background: isSpeaking ? "#1769e0" : "#fff",
                  color: isSpeaking ? "#fff" : "#172033", border: "1px solid #dedbd5",
                  borderRadius: "8px", cursor: (isLoading || isEnded) ? "not-allowed" : "pointer",
                  fontWeight: "600", fontSize: "13px"
                }}
              >
                {isSpeaking ? "🔊" : "🔊 Hear"}
              </button>

              <button
                onClick={toggleVoiceTyping}
                disabled={isLoading || isEnded}
                style={{
                  flex: 1, padding: "8px 12px", background: isListening ? "#d32f2f" : "#fff",
                  color: isListening ? "#fff" : "#172033", border: "1px solid #dedbd5",
                  borderRadius: "8px", cursor: (isLoading || isEnded) ? "not-allowed" : "pointer",
                  fontWeight: "600", fontSize: "13px", animation: isListening ? "pulse 1.5s infinite" : "none"
                }}
                title="Voice Typing"
              >
                {isListening ? "🎙️" : "🎤 Dictate"}
              </button>
            </div>

            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || isLoading || isEnded}
              style={{
                padding: "12px 24px", height: "100%",
                background: (userAnswer.trim() && !isLoading && !isEnded) ? "#1769e0" : "#ccc",
                color: "#fff", border: "0", borderRadius: "8px",
                cursor: (userAnswer.trim() && !isLoading && !isEnded) ? "pointer" : "not-allowed",
                fontWeight: "700", fontSize: "13px", whiteSpace: "nowrap"
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
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default MockInterview;