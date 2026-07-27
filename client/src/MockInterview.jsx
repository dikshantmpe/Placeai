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
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

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
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (isListening) recognitionRef.current?.stop();
      clearInterval(timerRef.current);
      
      setIsEnded(false);
      setSetupComplete(false);
      setConversation([]);
      setMessages([]);
      setUserAnswer("");
      setElapsedTime("00:00");
      startTimeRef.current = null;
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
    setUserAnswer("");

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
      setUserAnswer(currentUserAnswer);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  // --- SVG Icons ---
  const SpeakerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>
  );

  const SpeakerOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M10.54 10.54L11 11v8l-5-4H2V9h4.46"></path>
      <path d="M11 5L8.53 7.02"></path>
      <path d="M15.54 8.46a5 5 0 0 1 2.58 4.41"></path>
    </svg>
  );

  const MicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );

  const MicOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );

  const SpinnerIcon = () => (
    <svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  );
  
  const BrainIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1769e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  );


  // --- Render Setup Screen (MODERNIZED) ---
  if (!setupComplete) {
    return (
      <div style={{
        minHeight: "100vh", 
        background: "radial-gradient(circle at top, #f8faff 0%, #eef2f6 100%)", // Beautiful modern subtle gradient
        padding: "40px 20px",
        fontFamily: "Inter, system-ui, sans-serif", display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "#fff", 
          borderRadius: "20px", 
          border: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "48px", 
          maxWidth: "520px", 
          width: "100%",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)" // Floated depth shadow
        }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
            <div style={{ background: "#eaf3ff", padding: "12px", borderRadius: "14px", display: "flex" }}>
              <BrainIcon />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
              AI Mock Interview
            </h1>
          </div>
          
          <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", marginBottom: "36px" }}>
            Practice your technical skills with our AI interviewer. Get real-time feedback and improve your performance in a stress-free environment.
          </p>

          <div style={{ display: "grid", gap: "20px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Select Position
              </label>
              <select
                value={role} onChange={(e) => setRole(e.target.value)}
                style={{ 
                  width: "100%", padding: "14px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", 
                  fontSize: "15px", color: "#1e293b", background: "#fff", outline: "none", cursor: "pointer",
                  appearance: "none", // Removes default arrow
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "12px auto",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
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
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                Difficulty Level
              </label>
              <select
                value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                style={{ 
                  width: "100%", padding: "14px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", 
                  fontSize: "15px", color: "#1e293b", background: "#fff", outline: "none", cursor: "pointer",
                  appearance: "none", // Removes default arrow
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "12px auto",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
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
            className="start-btn"
            onClick={startInterview} disabled={isLoading}
            style={{
              width: "100%", padding: "14px", 
              background: isLoading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff", border: "0", borderRadius: "10px", fontWeight: "700",
              fontSize: "16px", cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: isLoading ? "none" : "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
          >
            {isLoading ? "Starting Interview..." : "Start Interview →"}
          </button>
        </div>
        
        {/* CSS for button hover effect */}
        <style>{`
          .start-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45) !important;
          }
        `}</style>
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
                whiteSpace: "pre-wrap"
              }}>
                <p style={{ margin: 0, color: "#172033", lineHeight: "1.5", fontSize: "14px" }}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {isSpeaking && !isEnded && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center", paddingLeft: "48px" }}>
              <div style={{ color: "#1769e0", display: "flex", alignItems: "center" }}>
                <SpeakerIcon />
              </div>
              <div style={{ color: "#657287", fontSize: "14px", fontStyle: "italic" }}>AI is speaking...</div>
            </div>
          )}

          {isLoading && !isEnded && (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center", paddingLeft: "48px" }}>
              <div style={{ color: "#1769e0", display: "flex", alignItems: "center" }}>
                <SpinnerIcon />
              </div>
              <div style={{ color: "#657287", fontSize: "14px", fontStyle: "italic" }}>Processing your answer...</div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "140px" }}>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => speakQuestion(conversation[conversation.length - 1]?.text || "")}
                disabled={isLoading || conversation.length === 0 || isEnded}
                style={{
                  flex: 1, padding: "8px", background: isSpeaking ? "#eaf3ff" : "#fff",
                  color: isSpeaking ? "#1769e0" : "#172033", border: "1px solid #dedbd5",
                  borderRadius: "8px", cursor: (isLoading || isEnded) ? "not-allowed" : "pointer",
                  fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                }}
              >
                {isSpeaking ? <SpeakerOffIcon /> : <SpeakerIcon />}
                {isSpeaking ? "Stop" : "Listen"}
              </button>

              <button
                onClick={toggleVoiceTyping}
                disabled={isLoading || isEnded}
                style={{
                  flex: 1, padding: "8px", background: isListening ? "#ffebee" : "#fff",
                  color: isListening ? "#c62828" : "#172033", border: "1px solid #dedbd5",
                  borderRadius: "8px", cursor: (isLoading || isEnded) ? "not-allowed" : "pointer",
                  fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                }}
                title="Voice Typing"
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
                {isListening ? "Stop" : "Dictate"}
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
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MockInterview;