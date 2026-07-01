import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { auth } from "../firebase.js"; 
import { signOut } from "firebase/auth"; 

export default function Sidebar() {
  const navigate = useNavigate(); 
  const location = useLocation(); // Allows us to see which page is active

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      console.log("Logged out successfully");
      window.location.replace("/"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Helper function to check if a link is the current active page
  const isActive = (path) => location.pathname === path;

  return (
    <aside style={{
      width: "260px",
      minWidth: "260px", /* Safeguard: prevents overlapping */
      flexShrink: 0,     /* Safeguard: prevents squishing */
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "linear-gradient(180deg, rgba(18, 15, 26, 0.95), rgba(12, 10, 20, 0.95))",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      color: "white",
      overflowY: "auto",
      zIndex: 50
    }}>
      
      <style>{`
        /* Glassmorphic hover effects for the navigation links */
        .sidebar-link {
          padding: 12px 16px;
          border-radius: 12px;
          color: #9b9ba8;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          border: 1px solid transparent;
        }
        
        .sidebar-link:hover {
          background: rgba(255,255,255,0.03);
          color: #ffffff;
          transform: translateX(4px);
        }
        
        /* The vibrant style for the currently selected page */
        .sidebar-link.active {
          background: linear-gradient(90deg, rgba(124,58,237,0.1), rgba(255,63,129,0.05));
          border: 1px solid rgba(255,63,129,0.2);
          color: #ff7aab;
          box-shadow: inset 3px 0 0 #ff3f81;
        }

        /* Custom scrollbar for the sidebar */
        aside::-webkit-scrollbar {
          width: 4px;
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
      `}</style>

      {/* Brand Logo - Updated to use your glowing image */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "3rem", padding: "0 0.5rem" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 0 15px rgba(255,63,129,0.3)",
          background: "rgba(0,0,0,0.3)"
        }}>
          <img src="/logo.png" alt="Crackin Ai Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", letterSpacing: "0.5px" }}>
          Crackin <span style={{ color: "#ff7aab" }}>Ai</span>
        </h2>
      </div>

      {/* Navigation Links - FIXED WITH ACTUAL ROUTES */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        <Link to="/dashboard" className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>📊</span> Dashboard
        </Link>
        <Link to="/dsa" className={`sidebar-link ${isActive("/dsa") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>💻</span> DSA Tracker
        </Link>
        <Link to="/resume" className={`sidebar-link ${isActive("/resume") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>📄</span> Resume Analyzer
        </Link>
        <Link to="/interview" className={`sidebar-link ${isActive("/interview") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>🎤</span> Mock Interview
        </Link>
        <Link to="/quiz" className={`sidebar-link ${isActive("/quiz") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>🧠</span> Aptitude Quiz
        </Link>
        <Link to="/company" className={`sidebar-link ${isActive("/company") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>🏢</span> Company Questions
        </Link>
        <Link to="/challenge" className={`sidebar-link ${isActive("/challenge") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>🔥</span> Daily Challenge
        </Link>
      </nav>

      {/* Pro Upgrade Box - Glassmorphic Update */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", 
        padding: "1.25rem", borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.25rem",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
      }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "4px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "6px" }}>
          👑 Go Pro
        </div>
        <div style={{ fontSize: "0.8rem", color: "#9b9ba8", marginBottom: "1rem", lineHeight: "1.4" }}>
          Unlock premium AI features and exclusive content.
        </div>
        <button style={{
          width: "100%", padding: "10px", borderRadius: "10px", border: "none",
          background: "linear-gradient(90deg, #7c3aed, #ff3f81)", color: "white",
          fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(255,63,129,0.3)",
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >
          Upgrade Now
        </button>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        style={{
          width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.02)", color: "#9b9ba8", fontWeight: 600, cursor: "pointer",
          display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(239, 68, 68, 0.1)";
          e.target.style.color = "#f87171";
          e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
          e.target.style.boxShadow = "0 0 15px rgba(239, 68, 68, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255,255,255,0.02)";
          e.target.style.color = "#9b9ba8";
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
          e.target.style.boxShadow = "none";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Logout
      </button>

    </aside>
  );
}