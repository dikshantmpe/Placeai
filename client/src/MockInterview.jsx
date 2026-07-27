import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";

const MockInterview = () => {
  // --- States ---
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewType, setInterviewType] = useState("Technical"); // New state for interview type
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

  // --- Voice Synthesis Setup ---
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const filtered = voices.filter((v) => {
        const name = v.name.toLowerCase();
        return name.includes("female") || name.includes("woman") || name.includes("samantha") || 
               name.includes("victoria") || name.includes("zira") || name.includes("tessa") || name.includes("karen");
      });
      const preferredVoice = filtered.find(v => v.name.includes("Google") || v.name.includes("Microsoft")) || filtered[0] || voices[0];
      setFemaleVoice(preferredVoice);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // --- Voice Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        }
        if (finalTranscript) setUserAnswer((prev) => (prev ? prev + " " : "") + finalTranscript.trim());
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (e) => setIsListening(false);
    }
  }, []);

  // --- Auto Scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isSpeaking, isLoading]);

  // --- Timer ---
  useEffect(() => {
    if (!setupComplete || isEnded) return;
    if (!startTimeRef.current) startTimeRef.current = Date.now();
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
    if (!recognitionRef.current) return alert("Voice typing is not supported in this browser.");
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
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

    const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/#/g, "").replace(/_/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const endInterview = () => {
    if (window.confirm("Are you sure you want to end the interview?")) {
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
      // ✅ Included interviewType in the initial prompt instructions
      const initialMessages = [{
        role: "user",
        content: `Start the interview for a ${role} role at ${difficulty} difficulty. This is a ${interviewType} interview. Ask the first question.`
      }];

      const response = await fetch(`${API_URL}/api/interview/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ messages: initialMessages, role, difficulty })
      });

      const data = await response.json();
      setConversation([{ type: "ai", text: data.reply }]);
      setMessages([{ role: "assistant", content: data.reply }]);
      setIsLoading(false);
      setTimeout(() => speakQuestion(data.reply), 500);
    } catch (error) {
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
      setConversation(prev => [...prev, { type: "ai", text: data.reply }]);
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
      setIsLoading(false);
      setTimeout(() => speakQuestion(data.reply), 500);
    } catch (error) {
      setIsLoading(false);
      setUserAnswer(currentUserAnswer);
    }
  };

  // --- Custom SVGs for Setup Page ---
  const TargetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  const ChartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
  const BoltIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const BriefcaseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
  const BarChartIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  const RobotIconWhite = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>;
  
  const TypeTechIcon = ({ active }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#2563eb" : "#94a3b8"} strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
  const TypeBehavIcon = ({ active }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#2563eb" : "#94a3b8"} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  const TypeMixedIcon = ({ active }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#2563eb" : "#94a3b8"} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
  
  const InfoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
  const ShieldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  
  const BrainCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
  const MicCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
  const DocCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
  const TrophyCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;


  // --- Render Setup Screen ---
  if (!setupComplete) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "60px 20px", fontFamily: "Inter, system-ui, sans-serif" }}>
        
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "space-between" }}>
          
          {/* LEFT COLUMN */}
          <div style={{ flex: "1 1 300px", maxWidth: "340px", paddingTop: "20px" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px", lineHeight: "1.1", letterSpacing: "-1px" }}>
              Ace Every<br/><span style={{ color: "#475569" }}>Interview</span>
            </h1>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginBottom: "40px" }}>
              Get personal AI interviews tailored to the role you want. <strong>Practice, learn and grow</strong> with instant feedback.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TargetIcon />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Role Specific Questions</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>Questions curated for your target role</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ChartIcon />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Real-time Feedback</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>Instant insights to improve your answers</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BoltIcon />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Track & Improve</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>Monitor your progress over time</p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN (THE FORM) */}
          <div style={{ 
            flex: "1 1 500px", maxWidth: "600px", background: "#fff", borderRadius: "24px", 
            padding: "40px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RobotIconWhite />
              </div>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>AI Mock Interview</h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>Practice your technical and behavioral skills with our AI interviewer.</p>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.5px", marginBottom: "8px" }}>SELECT POSITION</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}><BriefcaseIcon /></div>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ 
                  width: "100%", padding: "14px 16px 14px 44px", border: "1px solid #e2e8f0", borderRadius: "10px", 
                  fontSize: "15px", color: "#0f172a", background: "#fff", appearance: "none", cursor: "pointer",
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto",
                }}>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>DevOps Engineer</option>
                  <option>Product Manager</option>
                  <option>Data Scientist</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.5px", marginBottom: "8px" }}>DIFFICULTY LEVEL</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}><BarChartIcon /></div>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ 
                  width: "100%", padding: "14px 16px 14px 44px", border: "1px solid #e2e8f0", borderRadius: "10px", 
                  fontSize: "15px", color: "#0f172a", background: "#fff", appearance: "none", cursor: "pointer",
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto",
                }}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", letterSpacing: "0.5px", marginBottom: "8px" }}>INTERVIEW TYPE</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                
                {/* Tech Card */}
                <div onClick={() => setInterviewType("Technical")} style={{ 
                  border: interviewType === "Technical" ? "2px solid #2563eb" : "1px solid #e2e8f0", 
                  background: interviewType === "Technical" ? "#eff6ff" : "#fff",
                  borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.2s"
                }}>
                  <div style={{ marginBottom: "12px" }}><TypeTechIcon active={interviewType === "Technical"}/></div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Technical</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>DSA, System Design, CS Fundamentals</p>
                </div>

                {/* Behav Card */}
                <div onClick={() => setInterviewType("Behavioral")} style={{ 
                  border: interviewType === "Behavioral" ? "2px solid #2563eb" : "1px solid #e2e8f0", 
                  background: interviewType === "Behavioral" ? "#eff6ff" : "#fff",
                  borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.2s"
                }}>
                  <div style={{ marginBottom: "12px" }}><TypeBehavIcon active={interviewType === "Behavioral"}/></div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Behavioral</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>HR, Situational, Career Questions</p>
                </div>

                {/* Mixed Card */}
                <div onClick={() => setInterviewType("Mixed")} style={{ 
                  border: interviewType === "Mixed" ? "2px solid #2563eb" : "1px solid #e2e8f0", 
                  background: interviewType === "Mixed" ? "#eff6ff" : "#fff",
                  borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "all 0.2s"
                }}>
                  <div style={{ marginBottom: "12px" }}><TypeMixedIcon active={interviewType === "Mixed"}/></div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Mixed</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>Technical + Behavioral</p>
                </div>

              </div>
            </div>

            <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <InfoIcon />
              <p style={{ margin: 0, fontSize: "13px", color: "#1d4ed8", fontWeight: "500" }}>Each interview has 5 questions and takes ~10-15 minutes.</p>
            </div>

            <button onClick={startInterview} disabled={isLoading} style={{
              width: "100%", padding: "16px", background: isLoading ? "#94a3b8" : "#2563eb",
              color: "#fff", border: "0", borderRadius: "10px", fontWeight: "700",
              fontSize: "16px", cursor: isLoading ? "not-allowed" : "pointer", marginBottom: "16px"
            }}>
              {isLoading ? "Starting..." : "Start Interview →"}
            </button>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <ShieldIcon />
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Your data is secure and private. We don't store your personal conversations.</p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: "1 1 250px", maxWidth: "280px", paddingTop: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "20px" }}>
              
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <BrainCircleIcon />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Smart AI Interviewer</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>AI adapts to your answers and asks follow-up questions.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <MicCircleIcon />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Voice & Text Support</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>Answer by typing or speaking your responses.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <DocCircleIcon />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Detailed Report</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>Get a performance report with strengths and improvements.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <TrophyCircleIcon />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Improve Every Day</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>Practice regularly and become interview ready.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Render Live Session (Remains Mostly the Same) ---
  return (
    <div style={{ minHeight: "100vh", background: "#f3f2ef", padding: "20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #dedbd5" }}>
          <div>
            <h1 style={{ margin: "0", color: "#10264a", fontSize: "1.3rem", fontWeight: "700" }}>{role} Interview {isEnded && "(Ended)"}</h1>
            <p style={{ margin: "4px 0 0", color: "#657287", fontSize: "12px" }}>{difficulty} • {interviewType}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#10264a" }}>{elapsedTime}</div>
            {!isEnded && (
              <button onClick={endInterview} style={{ padding: "8px 16px", background: "#ffebee", color: "#c62828", border: "1px solid #ffcdd2", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                End Interview
              </button>
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #dedbd5", padding: "20px", marginBottom: "20px", minHeight: "400px", maxHeight: "500px", overflowY: "auto" }}>
          {conversation.map((msg, i) => (
            <div key={i} style={{ marginBottom: "16px", display: "flex", gap: "12px", justifyContent: msg.type === "answer" ? "flex-end" : "flex-start" }}>
              {msg.type === "ai" && (
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", flexShrink: 0, fontSize: "14px" }}>AI</div>
              )}
              <div style={{ maxWidth: "70%", background: msg.type === "answer" ? "#eff6ff" : "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: msg.type === "ai" ? "1px solid #e2e8f0" : "none", whiteSpace: "pre-wrap" }}>
                <p style={{ margin: 0, color: "#0f172a", lineHeight: "1.5", fontSize: "14px" }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isSpeaking && !isEnded && <div style={{ color: "#64748b", fontSize: "14px", fontStyle: "italic", marginLeft: "48px" }}>AI is speaking...</div>}
          {isLoading && !isEnded && <div style={{ color: "#64748b", fontSize: "14px", fontStyle: "italic", marginLeft: "48px" }}>Processing your answer...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #dedbd5", padding: "16px", display: "flex", gap: "12px", opacity: isEnded ? 0.6 : 1 }}>
          <textarea
            value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
            placeholder={isListening ? "Listening..." : "Type your answer here... (Press Enter to send, Shift+Enter for new line)"}
            disabled={isLoading || isEnded}
            style={{ flex: 1, minHeight: "80px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "none", background: isListening ? "#f0f8ff" : "#fff" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "140px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => speakQuestion(conversation[conversation.length - 1]?.text || "")} disabled={isLoading || conversation.length === 0 || isEnded} style={{ flex: 1, padding: "8px", background: isSpeaking ? "#eff6ff" : "#fff", color: isSpeaking ? "#2563eb" : "#0f172a", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                {isSpeaking ? "Stop" : "Listen"}
              </button>
              <button onClick={toggleVoiceTyping} disabled={isLoading || isEnded} style={{ flex: 1, padding: "8px", background: isListening ? "#fee2e2" : "#fff", color: isListening ? "#dc2626" : "#0f172a", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                {isListening ? "Stop" : "Dictate"}
              </button>
            </div>
            <button onClick={submitAnswer} disabled={!userAnswer.trim() || isLoading || isEnded} style={{ padding: "12px", background: (userAnswer.trim() && !isLoading && !isEnded) ? "#2563eb" : "#cbd5e1", color: "#fff", border: "0", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MockInterview;