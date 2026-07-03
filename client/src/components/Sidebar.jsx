import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { auth } from "../firebase.js"; 
import { signOut } from "firebase/auth"; 

// --- 1. Custom Component to Force 3D Animations ---
const SidebarLink = ({ to, icon, label, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "12px 16px",
        borderRadius: "14px",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontWeight: "600",
        fontSize: "0.95rem",
        marginBottom: "4px",
        transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transformStyle: "preserve-3d",
        
        // Colors
        color: isActive ? "#ffffff" : (isHovered ? "#ffffff" : "#9b9ba8"),
        
        // Glass Backgrounds
        background: isActive 
          ? "rgba(255, 255, 255, 0.08)" 
          : isHovered 
            ? "rgba(255, 255, 255, 0.04)" 
            : "transparent",
            
        // Glass Borders
        border: isActive 
          ? "1px solid rgba(255, 63, 129, 0.4)" 
          : isHovered 
            ? "1px solid rgba(255, 255, 255, 0.08)" 
            : "1px solid transparent",
            
        // Glows and Shadows
        boxShadow: isActive 
          ? "0 0 20px rgba(255, 63, 129, 0.2), inset 0 0 10px rgba(255, 63, 129, 0.1)" 
          : isHovered 
            ? "10px 15px 25px -5px rgba(0,0,0,0.3), inset 1px 1px 3px rgba(255,255,255,0.1)" 
            : "none",
            
        // 3D Tilt Transform
        transform: isHovered && !isActive
          ? "perspective(1000px) rotateY(6deg) rotateX(2deg) translateZ(12px) scale(1.02)"
          : "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)"
      }}
    >
      <span style={{ 
        fontSize: "1.1rem", 
        transform: isHovered && !isActive ? "translateZ(10px)" : "none", 
        transition: "transform 0.4s" 
      }}>
        {icon}
      </span>
      <span style={{ 
        transform: isHovered && !isActive ? "translateZ(5px)" : "none", 
        transition: "transform 0.4s" 
      }}>
        {label}
      </span>
    </Link>
  );
};

export default function Sidebar() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const [isProHovered, setIsProHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const checkActive = (path) => {
    if (path === "/") return location.pathname === "/";
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
      zIndex: 50,
      perspective: "1500px" // Enforces 3D space for children
    }}>
      
      {/* Scrollbar Style */}
      <style>{`
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
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

      {/* Navigation Links using the new robust component */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
        <SidebarLink to="/" icon="🏠" label="Home" isActive={checkActive("/")} />
        <SidebarLink to="/dashboard" icon="📊" label="Dashboard" isActive={checkActive("/dashboard")} />
        <SidebarLink to="/dsa" icon="💻" label="DSA Tracker" isActive={checkActive("/dsa")} />
        <SidebarLink to="/resume" icon="📄" label="Resume Analyzer" isActive={checkActive("/resume")} />
        <SidebarLink to="/interview" icon="🎤" label="Mock Interview" isActive={checkActive("/interview")} />
        <SidebarLink to="/quiz" icon="🧠" label="Aptitude Quiz" isActive={checkActive("/quiz")} />
        <SidebarLink to="/company" icon="🏢" label="Company Questions" isActive={checkActive("/company")} />
        <SidebarLink to="/challenge" icon="🔥" label="Daily Challenge" isActive={checkActive("/challenge")} />
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
        <button 
          onMouseEnter={() => setIsProHovered(true)}
          onMouseLeave={() => setIsProHovered(false)}
          style={{
            width: "100%", padding: "10px", borderRadius: "10px", border: "none",
            background: "linear-gradient(90deg, #7c3aed, #ff3f81)", color: "white",
            fontWeight: 700, cursor: "pointer", 
            boxShadow: isProHovered 
              ? "0 8px 25px rgba(255,63,129,0.5)" 
              : "0 4px 15px rgba(255,63,129,0.3)",
            transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
            transformStyle: "preserve-3d",
            transform: isProHovered
              ? "perspective(1000px) rotateY(6deg) rotateX(2deg) translateZ(10px) scale(1.02)"
              : "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)"
        }}>
          Upgrade Now
        </button>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        onMouseEnter={() => setIsLogoutHovered(true)}
        onMouseLeave={() => setIsLogoutHovered(false)}
        style={{
          width: "100%", padding: "14px", borderRadius: "14px", 
          fontWeight: 600, cursor: "pointer", display: "flex", 
          justifyContent: "center", alignItems: "center", gap: "8px", 
          transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          transformStyle: "preserve-3d",
          
          background: isLogoutHovered ? "rgba(239, 68, 68, 0.1)" : "rgba(255,255,255,0.03)",
          color: isLogoutHovered ? "#f87171" : "#9b9ba8",
          border: isLogoutHovered ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isLogoutHovered 
            ? "10px 15px 25px -5px rgba(239, 68, 68, 0.15), inset 1px 1px 3px rgba(239, 68, 68, 0.2)" 
            : "none",
          transform: isLogoutHovered
            ? "perspective(1000px) rotateY(6deg) rotateX(2deg) translateZ(10px) scale(1.02)"
            : "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ transform: isLogoutHovered ? "translateZ(8px)" : "none", transition: "transform 0.4s" }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span style={{ transform: isLogoutHovered ? "translateZ(4px)" : "none", transition: "transform 0.4s" }}>
          Logout
        </span>
      </button>

    </aside>
  );
}