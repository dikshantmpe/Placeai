import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { auth } from "../firebase.js"; 
import { signOut } from "firebase/auth"; 

// --- SVG Icons matching Login page style ---
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const DsaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const ResumeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const InterviewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const QuizIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const CompanyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);
const ChallengeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const CrownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const iconMap = {
  Home: HomeIcon,
  Dashboard: DashboardIcon,
  DSA: DsaIcon,
  Resume: ResumeIcon,
  Interview: InterviewIcon,
  Quiz: QuizIcon,
  Company: CompanyIcon,
  Challenge: ChallengeIcon,
};

// --- Custom Component for Inverted 3D Glass Effects ---
const SidebarLink = ({ to, iconKey, label, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[iconKey] || HomeIcon;

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
        fontSize: "0.9rem",
        marginBottom: "6px",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
        transformStyle: "preserve-3d",

        // Colors - Teal accent matching Login page
        color: isActive ? "#14b8a6" : (isHovered ? "#e2e8f0" : "#94a3b8"),

        // Backgrounds - Dark glass matching Login
        background: isActive 
          ? "rgba(20, 184, 166, 0.08)" 
          : isHovered 
            ? "rgba(255, 255, 255, 0.06)" 
            : "rgba(255, 255, 255, 0.02)", 

        // Glass Borders
        border: isActive 
          ? "1px solid rgba(20, 184, 166, 0.35)" 
          : isHovered 
            ? "1px solid rgba(255, 255, 255, 0.15)" 
            : "1px solid rgba(255, 255, 255, 0.04)",

        // Shadows: Popped out by default, glowing when flat
        boxShadow: isActive 
          ? "0 0 20px rgba(20, 184, 166, 0.15), inset 0 0 10px rgba(20, 184, 166, 0.08)" 
          : isHovered 
            ? "0 0 15px rgba(255,255,255,0.08), inset 1px 1px 4px rgba(255,255,255,0.15)" 
            : "12px 18px 25px -5px rgba(0,0,0,0.5), inset 1px 1px 4px rgba(255,255,255,0.08)",

        // INVERTED 3D Transform
        transform: isActive
          ? "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)"
          : isHovered 
            ? "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1.02)"
            : "perspective(1000px) rotateY(22deg) rotateX(8deg) translateZ(20px) scale(0.92)"
      }}
    >
      <span style={{ 
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: (!isHovered && !isActive) ? "translateZ(18px)" : "none", 
        transition: "transform 0.4s" 
      }}>
        <Icon />
      </span>
      <span style={{ 
        transform: (!isHovered && !isActive) ? "translateZ(10px)" : "none", 
        transition: "transform 0.4s",
        letterSpacing: "0.2px"
      }}>
        {label}
      </span>

      {isActive && (
        <span style={{
          marginLeft: "auto",
          width: "6px", height: "6px", borderRadius: "50%",
          background: "#14b8a6",
          boxShadow: "0 0 8px rgba(20,184,166,0.6)"
        }} />
      )}
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

  const navItems = [
    { to: "/", icon: "Home", label: "Home" },
    { to: "/dashboard", icon: "Dashboard", label: "Dashboard" },
    { to: "/dsa", icon: "DSA", label: "DSA Tracker" },
    { to: "/resume", icon: "Resume", label: "Resume Analyzer" },
    { to: "/interview", icon: "Interview", label: "Mock Interview" },
    { to: "/quiz", icon: "Quiz", label: "Aptitude Quiz" },
    { to: "/company", icon: "Company", label: "Company Questions" },
    { to: "/challenge", icon: "Challenge", label: "Daily Challenge" },
  ];

  return (
    <aside style={{
      width: "260px",
      minWidth: "260px",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4))",
      backdropFilter: "blur(30px) saturate(160%)",
      WebkitBackdropFilter: "blur(30px) saturate(160%)",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "10px 0 30px rgba(0, 0, 0, 0.4), inset 1px 0 2px rgba(255,255,255,0.04)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      color: "white",
      overflowY: "auto",
      zIndex: 50,
      perspective: "1500px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>

      <style>{`
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* Brand Logo - Matching Login page style */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2.5rem", padding: "0 0.5rem" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "linear-gradient(135deg, #115e59, #14b8a6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "800", fontSize: "1.1rem", color: "white",
          boxShadow: "0 0 20px rgba(20,184,166,0.3)"
        }}>
          C
        </div>
        <div>
          <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#e2e8f0" }}>
            Crackin <span style={{ color: "#14b8a6" }}>AI</span>
          </div>
          <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "-2px", fontWeight: "500" }}>
            AI Powered Placement Prep
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
        {navItems.map((item) => (
          <SidebarLink 
            key={item.to}
            to={item.to} 
            iconKey={item.icon} 
            label={item.label} 
            isActive={checkActive(item.to)} 
          />
        ))}
      </nav>

      {/* Pro Upgrade Box - Teal accent */}
      <div 
        onMouseEnter={() => setIsProHovered(true)}
        onMouseLeave={() => setIsProHovered(false)}
        style={{
          background: "linear-gradient(135deg, rgba(20, 184, 166, 0.06), rgba(20, 184, 166, 0.02))", 
          backdropFilter: "blur(12px)",
          padding: "1.25rem", borderRadius: "16px",
          border: "1px solid rgba(20, 184, 166, 0.15)", marginBottom: "1.25rem",
          boxShadow: isProHovered
            ? "0 4px 15px rgba(0,0,0,0.3), inset 1px 1px 4px rgba(20, 184, 166, 0.15)"
            : "15px 20px 35px -10px rgba(0,0,0,0.6), inset 1px 1px 4px rgba(255, 255, 255, 0.1)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transformStyle: "preserve-3d",
          transform: isProHovered
            ? "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1.02)"
            : "perspective(1000px) rotateY(18deg) rotateX(6deg) translateZ(15px) scale(0.92)"
      }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "4px", color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px",
           transform: isProHovered ? "none" : "translateZ(12px)", transition: "transform 0.4s"
        }}>
          <CrownIcon /> Go Pro
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem", lineHeight: "1.5",
           transform: isProHovered ? "none" : "translateZ(8px)", transition: "transform 0.4s"
        }}>
          Unlock premium AI features and exclusive content.
        </div>
        <button 
          style={{
            width: "100%", padding: "10px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #0d9488, #14b8a6)", color: "white",
            fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
            boxShadow: isProHovered 
              ? "0 8px 25px rgba(13, 148, 136, 0.5)" 
              : "0 4px 15px rgba(13, 148, 136, 0.3)",
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

          background: isLogoutHovered ? "rgba(239, 68, 68, 0.1)" : "rgba(255,255,255,0.02)",
          color: isLogoutHovered ? "#f87171" : "#64748b",
          border: isLogoutHovered ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255,255,255,0.06)",
          boxShadow: isLogoutHovered 
            ? "0 0 15px rgba(239, 68, 68, 0.15), inset 1px 1px 4px rgba(239, 68, 68, 0.2)" 
            : "12px 18px 25px -5px rgba(0,0,0,0.4)",
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