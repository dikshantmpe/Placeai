import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DSATracker from "../DSATracker";
import ProblemDetail from "./ProblemDetail.jsx";
import ResumeAnalyzer from "../ResumeAnalyzer";
import MockInterview from "../MockInterview";
import AptitudeQuiz from "../AptitudeQuiz";
import CompanyQuestions from "../CompanyQuestions";
import Dashboard from "../Dashboard";
import DailyChallenge from "../DailyChallenge";
import Chatbot from "../Chatbot";
import Login from "../Login";
import Profile from "../Profile";
import Home from "../Home";
import Signup from "../Signup";

export default function App() {
  useEffect(() => {
    fetch('https://placeai-sqjj.onrender.com/api/ping').catch(() => {});
  }, []);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0c0a14" }}>

          {/* Mobile top bar — Upgraded to premium branding */}
          {isMobile && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, height: "60px",
              background: "rgba(12, 10, 20, 0.9)", borderBottom: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px", zIndex: 500
            }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: "5px", padding: "4px"
              }}>
                <div style={{ width: "22px", height: "2px", background: sidebarOpen ? "#ff3f81" : "#fff", borderRadius: "2px", transition: "all 0.3s" }} />
                <div style={{ width: "22px", height: "2px", background: sidebarOpen ? "#ff3f81" : "#fff", borderRadius: "2px", transition: "all 0.3s" }} />
                <div style={{ width: "22px", height: "2px", background: sidebarOpen ? "#ff3f81" : "#fff", borderRadius: "2px", transition: "all 0.3s" }} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "8px", overflow: "hidden",
                  background: "rgba(0,0,0,0.3)", boxShadow: "0 0 10px rgba(255,63,129,0.3)"
                }}>
                  <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "0.5px" }}>
                  Crackin <span style={{ color: "#ff7aab" }}>Ai</span>
                </span>
              </div>

              {user?.avatar
                ? <img src={user.avatar} alt="avatar" style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    border: "2px solid #7c3aed", objectFit: "cover"
                  }} />
                : <div style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #ff3f81)", color: "white", fontSize: "13px",
                    fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 10px rgba(124,58,237,0.4)"
                  }}>
                    {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "A"}
                  </div>
              }
            </div>
          )}

          {/* Dark overlay when sidebar open on mobile */}
          {isMobile && sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)} style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 300, backdropFilter: "blur(4px)"
            }} />
          )}

          {/* Sidebar */}
          <div style={{
            position: "fixed",
            left: isMobile ? (sidebarOpen ? "0" : "-260px") : "0",
            top: isMobile ? "60px" : "0",
            bottom: 0,
            zIndex: 400,
            transition: "left 0.3s ease",
            overflowY: "auto",
            width: "260px"
          }}>
            <Sidebar user={user} onNavigate={() => setSidebarOpen(false)} isMobile={isMobile} />
          </div>

          {/* Main content - ALL MARGINS FIXED */}
          <div style={{
            marginLeft: isMobile ? "0" : "260px", // Matches exactly with the new sidebar width
            marginRight: "0",                     // Removed the ghost spacing!
            marginTop: isMobile ? "60px" : "0",
            flex: 1, 
            minHeight: "100vh", 
            overflowY: "auto",
            position: "relative"                  // Crucial constraint for the Vanta.js background
          }}>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/daily" element={<DailyChallenge />} />
              <Route path="/dsa" element={<DSATracker />} />
              <Route path="/problem/:id" element={<ProblemDetail />} />
              <Route path="/resume" element={<ResumeAnalyzer />} />
              <Route path="/interview" element={<MockInterview />} />
              <Route path="/quiz" element={<AptitudeQuiz />} />
              <Route path="/company" element={<CompanyQuestions />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Chatbot />
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}