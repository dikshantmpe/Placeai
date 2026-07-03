import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { auth } from "../firebase.js"; 
import { signOut } from "firebase/auth"; 

export default function Sidebar() {
  const navigate = useNavigate(); 
  const location = useLocation();

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

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside style={{
      width: "260px",
      minWidth: "260px",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "linear-gradient(145deg, rgba(25, 22, 36, 0.6), rgba(12, 10, 20, 0.8))",
      backdropFilter: "blur(24px) saturate(150%)",
      WebkitBackdropFilter: "blur(24px) saturate(150%)",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "5px 0 30px rgba(0, 0, 0, 0.4)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      color: "white",
      overflowY: "auto",
      zIndex: 50
    }}>
      
      <style>{`
        /* Glassmorphic Nav Links with 3D Tilt Setup */
        .sidebar-link {
          padding: 12px 16px;
          border-radius: 14px;
          color: #9b9ba8;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          border: 1px solid transparent;
          margin-bottom: 2px;
          transform-style: preserve-3d;
          transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1);
        }
        
        /* 3D Floating Glass Hover (Tilts towards the main content) */
        .sidebar-link:hover:not(.active) {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transform: perspective(1000px) rotateY(6deg) rotateX(2deg) translateZ(12px) scale(1.02);
          box-shadow: 10px 15px 25px -5px rgba(0,0,0,0.3), inset 1px 1px 3px rgba(255,255,255,0.1);
        }
        
        /* Active State */
        .sidebar-link.active {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 63, 129, 0.4);
          color: #ffffff;
          box-shadow: 0 0 20px rgba(255, 63, 129, 0.2), inset 0 0 10px rgba(255, 63, 129, 0.1);
        }

        /* Custom scrollbar */
        aside::-webkit-scrollbar {
          width: 4px;
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
      `}</style>

      {/* Brand Logo */}
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

      {/* Navigation Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
        <Link to="/" className={`sidebar-link ${isActive("/") ? "active" : ""}`}>
          <span style={{ fontSize: "1.1rem" }}>🏠</span> Home
        </Link>
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

      {/* Pro Upgrade Box */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))", 
        backdropFilter: "blur(12px)",
        padding: "1.25rem", borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.12)", marginBottom: "1.25rem",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255, 255, 255, 0.1)"
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
          transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          transformStyle: "preserve-3d",
          transform: "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)"
        }}
        onMouseEnter={e => e.target.style.transform = "perspective(1000px) rotateY(6deg) rotateX(2deg) translateZ(10px) scale(1.02)"}
        onMouseLeave={e => e.target.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)"}
        >
          Upgrade Now
        </button>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        style={{
          width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)", color: "#9b9ba8", fontWeight: 600, cursor: "pointer",
          display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", 
          transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          transformStyle: "preserve-3d",
          transform: "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(239, 68, 68, 0.1)";
          e.target.style.color = "#f87171";
          e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
          e.target.style.boxShadow = "10px 15px 25px -5px rgba(239, 68, 68, 0.15), inset 1px 1px 3px rgba(239, 68, 68, 0.2)";
          e.target.style.transform = "perspective(1000px) rotateY(6deg) rotateX(2deg) translateZ(10px) scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255,255,255,0.03)";
          e.target.style.color = "#9b9ba8";
          e.target.style.borderColor = "rgba(255,255,255,0.08)";
          e.target.style.boxShadow = "none";
          e.target.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)";
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