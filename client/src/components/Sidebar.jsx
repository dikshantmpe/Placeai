import React from "react";
import { Link, useNavigate } from "react-router-dom"; // <-- Added useNavigate
import { auth } from "../firebase.js"; // <-- Make sure path is correct
import { signOut } from "firebase/auth"; // <-- Added signOut

export default function Sidebar() {
  const navigate = useNavigate(); // <-- Initialize navigate

  // === THIS IS THE MISSING LOGOUT FUNCTION ===
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
      navigate("/"); // Redirect to the login screen
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  // ===========================================

  return (
    <aside style={{
      width: "260px",
      height: "100vh",
      background: "#120f1a",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      color: "white"
    }}>
      
      {/* Brand Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "3rem", padding: "0 0.5rem" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "linear-gradient(135deg, #7c3aed, #ff3f81)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "800", fontSize: "1.1rem",
          boxShadow: "0 0 20px rgba(255,63,129,0.4)"
        }}>C</div>
        <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>
          Crackin <span style={{ color: "#ff7aab" }}>Ai</span>
        </h2>
      </div>

      {/* Navigation Links (Your existing links) */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        <Link to="/dashboard" style={{
          padding: "12px 16px", borderRadius: "12px", background: "rgba(255,63,129,0.1)",
          color: "#ff7aab", textDecoration: "none", fontWeight: 600, display: "flex", gap: "12px"
        }}>
          🏠 Home
        </Link>
        <Link to="#" style={{ padding: "12px 16px", color: "#9b9ba8", textDecoration: "none", display: "flex", gap: "12px" }}>
          📊 Dashboard
        </Link>
        <Link to="#" style={{ padding: "12px 16px", color: "#9b9ba8", textDecoration: "none", display: "flex", gap: "12px" }}>
          💻 DSA Tracker
        </Link>
        <Link to="#" style={{ padding: "12px 16px", color: "#9b9ba8", textDecoration: "none", display: "flex", gap: "12px" }}>
          📄 Resume Analyzer
        </Link>
        <Link to="#" style={{ padding: "12px 16px", color: "#9b9ba8", textDecoration: "none", display: "flex", gap: "12px" }}>
          🎤 Mock Interview
        </Link>
        <Link to="#" style={{ padding: "12px 16px", color: "#9b9ba8", textDecoration: "none", display: "flex", gap: "12px" }}>
          🧠 Aptitude Quiz
        </Link>
        <Link to="#" style={{ padding: "12px 16px", color: "#9b9ba8", textDecoration: "none", display: "flex", gap: "12px" }}>
          🏢 Company Questions
        </Link>
        <Link to="#" style={{ padding: "12px 16px", color: "#9b9ba8", textDecoration: "none", display: "flex", gap: "12px" }}>
          🔥 Daily Challenge
        </Link>
      </nav>

      {/* Pro Upgrade Box */}
      <div style={{
        background: "rgba(255,255,255,0.03)", padding: "1.25rem", borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.05)", marginBottom: "1rem"
      }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "4px" }}>👑 Go Pro</div>
        <div style={{ fontSize: "0.8rem", color: "#9b9ba8", marginBottom: "1rem" }}>Unlock premium features.</div>
        <button style={{
          width: "100%", padding: "10px", borderRadius: "8px", border: "none",
          background: "linear-gradient(90deg, #ff3f81, #c2185b)", color: "white",
          fontWeight: 700, cursor: "pointer"
        }}>Upgrade Now</button>
      </div>

      {/* === LOGOUT BUTTON WIRED UP HERE === */}
      <button 
        onClick={handleLogout} 
        style={{
          width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent", color: "#9b9ba8", fontWeight: 600, cursor: "pointer",
          display: "flex", justifyContent: "center", gap: "8px", transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(239, 68, 68, 0.1)";
          e.target.style.color = "#f87171";
          e.target.style.borderColor = "rgba(239, 68, 68, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = "#9b9ba8";
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
        }}
      >
        Logout
      </button>

    </aside>
  );
}