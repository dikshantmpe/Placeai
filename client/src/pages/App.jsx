import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import DSATracker from "../DSATracker";
import ResumeAnalyzer from "../ResumeAnalyzer";
import MockInterview from "../MockInterview";
import AptitudeQuiz from "../AptitudeQuiz";
import CompanyQuestions from "../CompanyQuestions";
import Dashboard from "../Dashboard";
import DailyChallenge from "../DailyChallenge";
import Chatbot from "../Chatbot";
import Login from "../Login";
import Profile from "../Profile";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";

  return (
    <BrowserRouter>
      <nav style={{ padding: "0.75rem 2rem", background: "#4f46e5",
        display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>PlacePrep AI</Link>
        <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
        <Link to="/daily" style={{ color: "white", textDecoration: "none" }}>🔥 Daily</Link>
        <Link to="/dsa" style={{ color: "white", textDecoration: "none" }}>DSA Tracker</Link>
        <Link to="/resume" style={{ color: "white", textDecoration: "none" }}>Resume Analyzer</Link>
        <Link to="/interview" style={{ color: "white", textDecoration: "none" }}>Mock Interview</Link>
        <Link to="/quiz" style={{ color: "white", textDecoration: "none" }}>Aptitude Quiz</Link>
        <Link to="/company" style={{ color: "white", textDecoration: "none" }}>Company Questions</Link>

        {/* Right side - Profile or Login */}
        <div style={{ marginLeft: "auto" }}>
          {user ? (
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.15)", padding: "6px 14px",
                borderRadius: "20px", cursor: "pointer" }}>
                {user.avatar
                  ? <img src={user.avatar} alt="avatar"
                      style={{ width: "26px", height: "26px", borderRadius: "50%" }} />
                  : <div style={{ width: "26px", height: "26px", borderRadius: "50%",
                      background: "white", color: "#4f46e5", fontSize: "11px",
                      fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {getInitials(user.name)}
                    </div>
                }
                <span style={{ color: "white", fontSize: "14px" }}>{user.name.split(" ")[0]}</span>
              </div>
            </Link>
          ) : (
            <Link to="/login"
              style={{ color: "white", textDecoration: "none", background: "rgba(255,255,255,0.2)",
                padding: "6px 16px", borderRadius: "20px", fontSize: "14px" }}>
              Login
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<h2 style={{ padding: "2rem" }}>Welcome to PlacePrep AI 🚀</h2>} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/dsa" element={<DSATracker />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/interview" element={<MockInterview />} />
        <Route path="/quiz" element={<AptitudeQuiz />} />
        <Route path="/company" element={<CompanyQuestions />} />
      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}