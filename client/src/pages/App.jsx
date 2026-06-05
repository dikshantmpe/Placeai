import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
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
import Home from "../Home";

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login setUser={setUser} />} />
        </Routes>
      ) : (
        <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>
          <Sidebar user={user} />
          <div style={{ marginLeft: "220px", flex: 1, minHeight: "100vh", overflowY: "auto" }}>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/daily" element={<DailyChallenge />} />
              <Route path="/dsa" element={<DSATracker />} />
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