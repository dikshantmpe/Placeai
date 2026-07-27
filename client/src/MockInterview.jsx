import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";

const MockInterview = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const auth = getAuth();

  // Questions
  const questions = [
    "Tell me about yourself and what drew you to software engineering.",
    "Describe your experience with React and state management.",
    "How do you handle debugging complex issues?",
    "Tell me about your most challenging project.",
    "How do you stay updated with new technologies?",
    "What's your approach to code review and feedback?",
    "Explain your understanding of component lifecycle.",
    "Why do you want to join our company?"
  ];

  // Timer
  useEffect(() => {
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
  }, []);

  // Speak question - Completely FREE using optimized Web Speech API
  const speakQuestion = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex]);
    
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
    utterance.rate = 0.95;      // Slightly slower for clarity
    utterance.pitch = 1.0;      // Natural pitch
    utterance.volume = 1.0;     // Full volume

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error("Speech error:", error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak first question
  useEffect(() => {
    setTimeout(() => {
      speakQuestion();
      // Add first AI message
      setConversation([
        {
          type: "ai",
          text: questions[currentQuestionIndex]
        }
      ]);
    }, 500);
  }, []);

  // Submit answer
  const submitAnswer = () => {
    if (!userAnswer.trim()) return;

    // Add answer to conversation
    setConversation(prev => [
      ...prev,
      { type: "answer", text: userAnswer }
    ]);

    setUserAnswer("");

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => {
        speakQuestion();
        setConversation(prev => [
          ...prev,
          { type: "ai", text: questions[currentQuestionIndex + 1] }
        ]);
      }, 500);
    } else {
      // Interview complete
      setConversation(prev => [
        ...prev,
        { type: "ai", text: "Thank you for completing the interview! Your answers have been recorded." }
      ]);
    }
  };

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
            <h1 style={{ margin: "0", color: "#10264a", fontSize: "1.3rem", fontWeight: "700" }}>Mock Interview</h1>
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
                maxWidth: msg.type === "answer" ? "70%" : "70%",
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
            style={{
              flex: 1,
              minHeight: "80px",
              padding: "12px",
              border: "1px solid #dedbd5",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "none"
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={speakQuestion}
              style={{
                padding: "10px 16px",
                background: isSpeaking ? "#1769e0" : "#fff",
                color: isSpeaking ? "#fff" : "#172033",
                border: "1px solid #dedbd5",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                whiteSpace: "nowrap"
              }}
            >
              {isSpeaking ? "🔊 Speaking..." : "🔊 Hear"}
            </button>
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim()}
              style={{
                padding: "10px 24px",
                background: userAnswer.trim() ? "#1769e0" : "#ccc",
                color: "#fff",
                border: "0",
                borderRadius: "8px",
                cursor: userAnswer.trim() ? "pointer" : "not-allowed",
                fontWeight: "700",
                fontSize: "13px",
                whiteSpace: "nowrap"
              }}
            >
              Send
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