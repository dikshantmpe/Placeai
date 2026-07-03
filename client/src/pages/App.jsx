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
   // Change it to this:
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
        <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>

          {/* Mobile top bar — always on top */}
          {isMobile && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, height: "56px",
              background: "#0d0d0d", borderBottom: "1px solid #1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px", zIndex: 500
            }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: "5px", padding: "4px"
              }}>
                <div style={{ width: "22px", height: "2px", background: sidebarOpen ? "#dc2626" : "#fff", borderRadius: "2px", transition: "all 0.3s" }} />
                <div style={{ width: "22px", height: "2px", background: sidebarOpen ? "#dc2626" : "#fff", borderRadius: "2px", transition: "all 0.3s" }} />
                <div style={{ width: "22px", height: "2px", background: sidebarOpen ? "#dc2626" : "#fff", borderRadius: "2px", transition: "all 0.3s" }} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "#dc2626", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "14px"
                }}>🎯</div>
                <span style={{ fontSize: "15px", fontWeight: "700" }}>
                  PlacePrep <span style={{ color: "#dc2626" }}>AI</span>
                </span>
              </div>

              {user?.avatar
                ? <img src={user.avatar} alt="avatar" style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    border: "2px solid #dc2626", objectFit: "cover"
                  }} />
                : <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "#dc2626", color: "white", fontSize: "12px",
                    fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
                  </div>
              }
            </div>
          )}

          {/* Dark overlay when sidebar open on mobile */}
          {isMobile && sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)} style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 300, backdropFilter: "blur(2px)"
            }} />
          )}

          {/* Sidebar */}
          <div style={{
            position: "fixed",
            left: isMobile ? (sidebarOpen ? "0" : "-240px") : "0",
            top: isMobile ? "56px" : "0",
            bottom: 0,
            zIndex: 400,
            transition: "left 0.3s ease",
            overflowY: "auto"
          }}>
            <Sidebar user={user} onNavigate={() => setSidebarOpen(false)} isMobile={isMobile} />
          </div>

          {/* Main content */}
          <div style={{
            marginLeft: isMobile ? "0" : "220px",
            marginRight: isMobile ? "0" : "280px",
            marginTop: isMobile ? "56px" : "0",
            flex: 1, minHeight: "100vh", overflowY: "auto"
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