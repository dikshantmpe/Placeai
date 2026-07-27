import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import axios from "axios";

const MockInterview = () => {
  // Setup State
  const [setupComplete, setSetupComplete] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [statusReady, setStatusReady] = useState({
    microphone: false,
    voice: false,
    interview: false
  });

  // Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "Tell me about yourself and what drew you to software engineering.",
      category: "Behavioral",
      timeLimit: 120
    },
    {
      id: 2,
      question: "Describe your experience with React and state management.",
      category: "Technical",
      timeLimit: 120
    },
    {
      id: 3,
      question: "How do you handle debugging complex issues?",
      category: "Problem-Solving",
      timeLimit: 120
    },
    {
      id: 4,
      question: "Tell me about your most challenging project.",
      category: "Behavioral",
      timeLimit: 120
    },
    {
      id: 5,
      question: "How do you stay updated with new technologies?",
      category: "Growth-Oriented",
      timeLimit: 120
    },
    {
      id: 6,
      question: "What's your approach to code review and feedback?",
      category: "Collaboration",
      timeLimit: 120
    },
    {
      id: 7,
      question: "Explain your understanding of component lifecycle.",
      category: "Technical",
      timeLimit: 120
    },
    {
      id: 8,
      question: "Why do you want to join our company?",
      category: "Behavioral",
      timeLimit: 120
    }
  ]);

  // Interview Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [userAnswer, setUserAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notes, setNotes] = useState("");
  const [conversation, setConversation] = useState([]);

  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const synthesisRef = useRef(null);
  const recognitionRef = useRef(null);
  const auth = getAuth();

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setUserAnswer(prev => prev + (prev ? " " : "") + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };
    }

    // Check microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setStatusReady(prev => ({ ...prev, microphone: true }));
      })
      .catch(() => {
        setStatusReady(prev => ({ ...prev, microphone: false }));
      });

    // Check voice synthesis
    if ("speechSynthesis" in window) {
      setStatusReady(prev => ({ ...prev, voice: true }));
    }

    // Load questions
    setStatusReady(prev => ({ ...prev, interview: true }));

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    if (sessionActive && !isPaused) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - parseInt(elapsedTime.split(":")[0]) * 60000 - parseInt(elapsedTime.split(":")[1]) * 1000;
      }

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setElapsedTime(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, isPaused, elapsedTime]);

  // Speak question
  const speakQuestion = () => {
    if (!statusReady.voice) {
      alert("Voice synthesis not available on your browser");
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex].question);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = isMuted ? 0 : 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not available on your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("Please provide an answer");
      return;
    }

    // Add to conversation
    setConversation(prev => [
      ...prev,
      { type: "question", text: questions[currentQuestionIndex].question },
      { type: "answer", text: userAnswer, category: questions[currentQuestionIndex].category }
    ]);

    setUserAnswer("");

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Interview complete
      handleEndInterview();
    }
  };

  // Start interview
  const startInterview = () => {
    setSetupComplete(true);
    setSessionActive(true);
    setIsRecording(true);
    startTimeRef.current = Date.now();

    // Add first AI message
    setConversation([
      {
        type: "ai",
        text: `Welcome to your ${selectedRole} interview at ${selectedDifficulty} difficulty level. Let's begin with the first question.`,
        speaker: "Aarav - AI Interviewer"
      }
    ]);

    // Speak first question after delay
    setTimeout(() => {
      speakQuestion();
    }, 1000);
  };

  // End interview
  const handleEndInterview = () => {
    setSessionActive(false);
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Setup Screen
  if (!setupComplete) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f3f2ef",
        padding: "40px 20px",
        fontFamily: "Inter, system-ui, sans-serif"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", alignItems: "start" }}>
          
          {/* Setup Panel */}
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #dedbd5",
            padding: "30px",
            boxShadow: "0 12px 34px rgba(27, 46, 76, 0.05)"
          }}>
            <span style={{ fontSize: "11px", fontWeight: "850", letterSpacing: "0.11em", color: "#1769e0", textTransform: "uppercase" }}>AI MOCK INTERVIEW</span>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#10264a", margin: "8px 0" }}>Practice the conversation before it counts.</h1>
            <p style={{ color: "#657287", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
              Run a realistic interview session with timed questions, private notes, simulated recording controls, and a feedback summary at the end.
            </p>

            {/* Status Checks */}
            <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
              {[
                { icon: "🎤", title: "Microphone ready", desc: "Input detected", status: statusReady.microphone },
                { icon: "🔊", title: "Voice ready", desc: "Audio conversation enabled", status: statusReady.voice },
                { icon: "📋", title: "Interview set", desc: "8 questions loaded", status: statusReady.interview }
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "16px",
                  border: "1px solid #dedbd5",
                  borderRadius: "10px",
                  background: status.interview ? "#f0f8f5" : "#fbfcfe",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <span style={{ fontSize: "20px" }}>✓</span>
                  <div>
                    <b style={{ display: "block", color: "#10264a" }}>{item.title}</b>
                    <small style={{ color: "#657287" }}>{item.desc}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* Dropdowns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
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
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
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
              </select>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              disabled={!statusReady.microphone || !statusReady.voice || !statusReady.interview}
              style={{
                width: "100%",
                padding: "12px",
                background: "#1769e0",
                color: "#fff",
                border: "0",
                borderRadius: "99px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer"
              }}
            >
              Start interview →
            </button>
          </div>

          {/* Voiceready Illustration */}
          <div style={{
            background: "#e8f0ff",
            borderRadius: "12px",
            padding: "60px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              background: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "50px",
              margin: "0 0 20px 0",
              boxShadow: "0 8px 24px rgba(23, 105, 224, 0.2)"
            }}>
              🎤
            </div>
            <h2 style={{ color: "#10264a", fontSize: "1.3rem", fontWeight: "700", margin: "0 0 8px 0" }}>Voice interview ready</h2>
            <p style={{ color: "#657287", fontSize: "14px" }}>Speak naturally or use the text chat during the session.</p>
          </div>
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
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
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
            <span style={{ fontSize: "11px", fontWeight: "850", letterSpacing: "0.11em", color: "#1769e0", textTransform: "uppercase" }}>LIVE PRACTICE SESSION</span>
            <h1 style={{ margin: "4px 0", color: "#10264a", fontSize: "1.5rem", fontWeight: "700" }}>{selectedRole} Mock Interview</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffe8e8", padding: "8px 14px", borderRadius: "8px" }}>
              <span style={{ width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%", animation: "pulse 2s infinite" }}></span>
              <span style={{ fontWeight: "700", color: "#ad3f3f", fontSize: "12px" }}>REC</span>
            </div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#10264a", minWidth: "70px", textAlign: "right" }}>
              {elapsedTime}
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "0",
                background: "#fff",
                border: "1px solid #dedbd5",
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              {isPaused ? "▶" : "⏸"}
            </button>
            <button
              onClick={handleEndInterview}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "0",
                background: "#fff",
                border: "1px solid #dedbd5",
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              ⊗
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
          
          {/* Main Chat Area */}
          <div>
            {/* Conversation */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #dedbd5",
              padding: "20px",
              marginBottom: "20px",
              minHeight: "300px",
              maxHeight: "500px",
              overflowY: "auto"
            }}>
              {conversation.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: "16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: msg.type === "ai" ? "flex-start" : msg.type === "answer" ? "flex-end" : "flex-start"
                }}>
                  {msg.type !== "answer" && (
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: msg.type === "ai" ? "#1769e0" : "#e8edf3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: msg.type === "ai" ? "#fff" : "#10264a",
                      fontWeight: "700",
                      flexShrink: 0
                    }}>
                      {msg.type === "ai" ? "AI" : "Q"}
                    </div>
                  )}
                  <div style={{
                    maxWidth: msg.type === "answer" ? "100%" : "80%",
                    background: msg.type === "answer" ? "#eaf3ff" : msg.type === "ai" ? "#f6f7f9" : "#fff",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: msg.type === "ai" ? "none" : "1px solid #dedbd5"
                  }}>
                    {msg.speaker && <b style={{ display: "block", color: "#1769e0", fontSize: "12px", marginBottom: "4px" }}>{msg.speaker}</b>}
                    <p style={{ margin: 0, color: "#172033", lineHeight: "1.5", fontSize: "14px" }}>{msg.text}</p>
                    {msg.category && <small style={{ display: "block", color: "#657287", marginTop: "4px" }}>{msg.category}</small>}
                  </div>
                </div>
              ))}

              {isSpeaking && (
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
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
                  <div style={{ background: "#f6f7f9", padding: "12px 16px", borderRadius: "10px", color: "#657287" }}>
                    AI is speaking...
                  </div>
                </div>
              )}
            </div>

            {/* Current Question */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #dedbd5",
              padding: "20px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#1769e0", textTransform: "uppercase", letterSpacing: "0.05em" }}>CURRENT QUESTION</span>
                <span style={{ fontSize: "12px", color: "#657287", fontWeight: "600" }}>Question {currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: "700", color: "#10264a", lineHeight: "1.5" }}>
                {questions[currentQuestionIndex].question}
              </h2>
              <span style={{ display: "inline-block", padding: "4px 10px", background: "#eaf3ff", color: "#0e54bd", borderRadius: "99px", fontSize: "12px", fontWeight: "600" }}>
                {questions[currentQuestionIndex].category}
              </span>
            </div>

            {/* Answer Input */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #dedbd5",
              padding: "16px",
              marginBottom: "20px"
            }}>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer or use the microphone..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  border: "1px solid #dedbd5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: "12px"
                }}
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={startListening}
                  style={{
                    padding: "10px 16px",
                    background: isListening ? "#1769e0" : "#fff",
                    color: isListening ? "#fff" : "#172033",
                    border: "1px solid #dedbd5",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    flex: 1
                  }}
                >
                  {isListening ? "🎤 Listening..." : "🎤 Use Microphone"}
                </button>
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
                    fontSize: "14px",
                    flex: 1
                  }}
                >
                  {isSpeaking ? "🔊 Speaking..." : "🔊 Hear Question"}
                </button>
                <button
                  onClick={submitAnswer}
                  style={{
                    padding: "10px 24px",
                    background: "#1769e0",
                    color: "#fff",
                    border: "0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px"
                  }}
                >
                  Send
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #dedbd5"
            }}>
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                style={{
                  padding: "10px 16px",
                  background: "#fff",
                  color: currentQuestionIndex === 0 ? "#aab7c8" : "#172033",
                  border: "1px solid #dedbd5",
                  borderRadius: "8px",
                  cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
                  fontWeight: "600"
                }}
              >
                ← Previous
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "1px solid #dedbd5",
                    background: isMuted ? "#1769e0" : "#fff",
                    color: isMuted ? "#fff" : "#172033",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "16px"
                  }}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "1px solid #dedbd5",
                    background: isPaused ? "#1769e0" : "#fff",
                    color: isPaused ? "#fff" : "#172033",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "16px"
                  }}
                >
                  {isPaused ? "▶" : "⏸"}
                </button>
                <button
                  onClick={handleEndInterview}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "1px solid #dedbd5",
                    background: "#ef4444",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "16px"
                  }}
                >
                  🔔
                </button>
              </div>
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                style={{
                  padding: "10px 16px",
                  background: "#1769e0",
                  color: "#fff",
                  border: "0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  opacity: currentQuestionIndex === questions.length - 1 ? 0.5 : 1
                }}
              >
                Next question →
              </button>
            </div>
          </div>

          {/* Sidebar - Private Notes */}
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #dedbd5",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            height: "fit-content",
            position: "sticky",
            top: "20px"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#10264a", fontSize: "1rem", fontWeight: "700" }}>Private interview notes</h3>
            <p style={{ margin: "0 0 16px 0", color: "#657287", fontSize: "12px" }}>Capture ideas, examples, or reflections. These notes are not shown to the interviewer.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write notes here..."
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #dedbd5",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "none",
                marginBottom: "12px"
              }}
            />
            <div style={{
              padding: "12px",
              background: "#f6f7f9",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#657287"
            }}>
              Auto-saved locally for this demo · {notes.length} words
            </div>
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