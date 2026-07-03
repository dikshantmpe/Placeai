import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { auth } from "../firebase.js"; 
import { signOut } from "firebase/auth"; 

// --- Custom Component for Inverted 3D Glass Effects ---
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
        marginBottom: "6px",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
        transformStyle: "preserve-3d",
        
        // Colors
        color: isActive ? "#ffffff" : (isHovered ? "#ffffff" : "#9b9ba8"),
        
        // Backgrounds
        background: isActive 
          ? "rgba(255, 63, 129, 0.1)" 
          : isHovered 
            ? "rgba(255, 255, 255, 0.08)" 
            : "rgba(255, 255, 255, 0.02)", 
            
        // Glass Borders
        border: isActive 
          ? "1px solid rgba(255, 63, 129, 0.5)" 
          : isHovered 
            ? "1px solid rgba(255, 255, 255, 0.2)" 
            : "1px solid rgba(255, 255, 255, 0.03)",
            
        // Shadows: Popped out by default, glowing when flat
        boxShadow: isActive 
          ? "0 0 20px rgba(255, 63, 129, 0.3), inset 0 0 10px rgba(255, 63, 129, 0.15)" 
          : isHovered 
            ? "0 0 15px rgba(255,255,255,0.1), inset 1px 1px 4px rgba(255,255,255,0.2)" 
            : "12px 18px 25px -5px rgba(0,0,0,0.6), inset 1px 1px 4px rgba(255,255,255,0.1)",
            
        // --- NEW: INVERTED & AMPLIFIED 3D Transform ---
        transform: isActive
          ? "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)" // Flat when active
          : isHovered 
            ? "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1.02)" // Flattens out on hover
            : "perspective(1000px) rotateY(22deg) rotateX(8deg) translateZ(20px) scale(0.92)" // Highly tilted by default
      }}
    >
      <span style={{ 
        fontSize: "1.15rem", 
        // Elements pop out ONLY when tilted (not hovered, not active)
        transform: (!isHovered && !isActive) ? "translateZ(18px)" : "none", 
        transition: "transform 0.4s" 
      }}>
        {icon}
      </span>
      <span style={{ 
        transform: (!isHovered && !isActive) ? "translateZ(10px)" : "none", 
        transition: "transform 0.4s",
        letterSpacing: "0.3px"
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
      background: "linear-gradient(to right, rgba(15, 12, 25, 0.4), rgba(15, 12, 25, 0.1))",
      backdropFilter: "blur(30px) saturate(200%)",
      WebkitBackdropFilter: "blur(30px) saturate(200%)",
      borderRight: "1px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "10px 0 30px rgba(0, 0, 0, 0.5), inset 1px 0 5px rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      color: "white",
      overflowY: "auto",
      zIndex: 50,
      perspective: "1500px" 
    }}>
      
      <style>{`
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      {/* Brand Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "3rem", padding: "0 0.5rem" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(255,63,129,0.5)",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,63,129,0.3)"
        }}>
          <img src="/logo.png" alt="Crackin Ai Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", letterSpacing: "0.5px" }}>
          Crackin <span style={{ color: "#ff7aab", textShadow: "0 0 10px rgba(255,122,171,0.5)" }}>Ai</span>
        </h2>
      </div>

      {/* Navigation Links */}
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
      <div 
        onMouseEnter={() => setIsProHovered(true)}
        onMouseLeave={() => setIsProHovered(false)}
        style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))", 
        backdropFilter: "blur(12px)",
        padding: "1.25rem", borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.15)", marginBottom: "1.25rem",
        boxShadow: isProHovered
          ? "0 4px 15px rgba(0,0,0,0.3), inset 1px 1px 4px rgba(255, 255, 255, 0.2)"
          : "15px 20px 35px -10px rgba(0,0,0,0.8), inset 1px 1px 4px rgba(255, 255, 255, 0.2)",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        transformStyle: "preserve-3d",
        transform: isProHovered
          ? "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1.02)"
          : "perspective(1000px) rotateY(18deg) rotateX(6deg) translateZ(15px) scale(0.92)"
      }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "4px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "6px",
           transform: isProHovered ? "none" : "translateZ(12px)", transition: "transform 0.4s"
        }}>
          👑 Go Pro
        </div>
        <div style={{ fontSize: "0.8rem", color: "#9b9ba8", marginBottom: "1rem", lineHeight: "1.4",
           transform: isProHovered ? "none" : "translateZ(8px)", transition: "transform 0.4s"
        }}>
          Unlock premium AI features and exclusive content.
        </div>
        <button 
          style={{
            width: "100%", padding: "10px", borderRadius: "10px", border: "none",
            background: "linear-gradient(90deg, #7c3aed, #ff3f81)", color: "white",
            fontWeight: 700, cursor: "pointer", 
            boxShadow: isProHovered 
              ? "0 8px 25px rgba(255,63,129,0.6)" 
              : "0 4px 15px rgba(255,63,129,0.3)",
            transform: isProHovered ? "none" : "translateZ(16px)",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
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
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transformStyle: "preserve-3d",
          
          background: isLogoutHovered ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)",
          color: isLogoutHovered ? "#f87171" : "#9b9ba8",
          border: isLogoutHovered ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isLogoutHovered 
            ? "0 0 15px rgba(239, 68, 68, 0.2), inset 1px 1px 4px rgba(239, 68, 68, 0.3)" 
            : "12px 18px 25px -5px rgba(0,0,0,0.5)",
          transform: isLogoutHovered
            ? "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1.02)"
            : "perspective(1000px) rotateY(20deg) rotateX(6deg) translateZ(15px) scale(0.92)"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ transform: !isLogoutHovered ? "translateZ(12px)" : "none", transition: "transform 0.4s" }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span style={{ transform: !isLogoutHovered ? "translateZ(8px)" : "none", transition: "transform 0.4s" }}>
          Logout
        </span>
      </button>

    </aside>
  );
}