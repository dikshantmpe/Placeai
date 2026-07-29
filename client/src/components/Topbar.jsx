import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

/* ═══════════════════════════════════════════════════════════════
   CRACKIN AI — TOPBAR (with Solutions Gallery + persistent login support)
   ═══════════════════════════════════════════════════════════════ */

const formatName = (name) => {
  if (!name) return "Guest";
  return name
    .split(/[^a-zA-Z0-9]+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
};

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "success" ? "#10b981" : type === "info" ? "#1769e0" : "#ef4444";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, padding: "14px 20px",
      borderRadius: 10, background: bg, color: "#fff", fontSize: 14,
      fontWeight: 600, boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
      zIndex: 9999, animation: "toastIn 0.35s cubic-bezier(0.16,1,0.3,1)",
      display: "flex", alignItems: "center", gap: 10, maxWidth: 360, lineHeight: 1.4,
    }}>
      <span style={{ fontSize: 16 }}>{type === "success" ? "✓" : type === "info" ? "ℹ" : "✕"}</span>
      {message}
    </div>
  );
}

/* ── SVG Icon Components ── */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const DsaIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const ResumeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const InterviewIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const AptitudeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);
const CompanyIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
    <path d="M12 10h.01" /><path d="M12 14h.01" />
    <path d="M16 10h.01" /><path d="M16 14h.01" />
    <path d="M8 10h.01" /><path d="M8 14h.01" />
  </svg>
);
const ChallengeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const SolutionsIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9" cy="10" r="1" />
    <circle cx="12" cy="10" r="1" />
    <circle cx="15" cy="10" r="1" />
  </svg>
);

export default function Topbar({ user: propUser, setUser, theme: externalTheme, onLogout }) {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState(propUser || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  const internalTheme = localStorage.getItem("crackin-theme") || "light";
  const theme = externalTheme !== undefined ? externalTheme : internalTheme;

  useEffect(() => {
    setFirebaseUser(propUser || null);
  }, [propUser]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  let rawName = "Guest";
  if (firebaseUser?.displayName) rawName = firebaseUser.displayName;
  else if (firebaseUser?.email) rawName = firebaseUser.email.split("@")[0];
  else if (propUser?.name) rawName = propUser.name;
  const displayName = formatName(rawName);
  const initials = displayName.substring(0, 2).toUpperCase();
  
  const photoURL = firebaseUser?.photoURL || null;

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        await signOut(auth);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToast({ message: "Logged out successfully", type: "success" });
        if (setUser) setUser(null);
        setTimeout(() => navigate("/login"), 600);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setToast({ message: "Logout failed. Try again.", type: "error" });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setToast({ message: `Searching "${searchQuery}"…`, type: "info" });
    setSearchQuery("");
  };

  const navItems = [
    { id: "home", label: "Dashboard", path: "/dashboard", icon: <HomeIcon />, badge: null, comingSoon: false },
    { id: "dsa", label: "DSA", path: "/dsa", icon: <DsaIcon />, badge: null, comingSoon: false },
    { id: "resume", label: "Resume", path: "/resume", icon: <ResumeIcon />, badge: null, comingSoon: false },
    { id: "interview", label: "Interview", path: "/interview", icon: <InterviewIcon />, badge: null, comingSoon: false }, 
    { id: "aptitude", label: "Aptitude", path: "/quiz", icon: <AptitudeIcon />, badge: null, comingSoon: true },
    { id: "companies", label: "Companies", path: "/company", icon: <CompanyIcon />, badge: null, comingSoon: true },
    { id: "challenge", label: "Challenge", path: "/daily", icon: <ChallengeIcon />, badge: null, comingSoon: true },
    { id: "solutions", label: "Solutions", path: "/solutions", icon: <SolutionsIcon />, badge: null, comingSoon: false },
  ];

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes toastIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-soft {
          0%,100% { transform: scale(1); opacity: 1; }
          50%     { transform: scale(1.06); opacity: 0.85; }
        }

        .topbar-root {
          --p: #1769e0; --p-light: #e8f1ff; --navy: #10264a; --muted: #68758a;
          --line: #dfe5ec; --bg: #f3f2ef; --card-bg: #ffffff; --card-border: #dedbd5;
          --text-main: #172033; --search-bg: #f8fafc; --nav-hover: #f6f5f2;
          --shadow-md: 0 4px 16px rgba(0,0,0,0.06);
        }
        .topbar-root.dark {
          --bg: #171a1f; --navy: #eef4ff; --muted: #aab3c2; --line: #363b45;
          --card-bg: #22262d; --card-border: #393e47; --text-main: #edf2fa;
          --search-bg: #2a2f37; --nav-hover: #30353d;
          --shadow-md: 0 4px 16px rgba(0,0,0,0.25);
        }

        .a-top {
          height: 72px;
          background: var(--card-bg);
          display: flex;
          align-items: center;
          padding: 0 max(22px, calc((100vw - 1400px)/2));
          gap: 20px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 50;
          transition: box-shadow 0.25s, background 0.25s;
        }
        .a-top.scrolled { box-shadow: var(--shadow-md); }
        .topbar-spacer { height: 72px; flex-shrink: 0; }

        .logo {
          font-size: 24px;
          font-weight: 900;
          color: var(--navy);
          letter-spacing: -0.5px;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .logo-mark {
          width: 28px; height: 28px;
          background: var(--p);
          border-radius: 7px;
          display: grid; place-items: center;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
        }

        .search-wrap {
          position: relative;
          flex: 0 0 340px;
        }
        .a-search {
          width: 100%;
          padding: 10px 16px 10px 38px;
          border: 1px solid var(--line);
          border-radius: 999px;
          background: var(--search-bg);
          color: var(--text-main);
          outline: none;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .a-search::placeholder { color: var(--muted); }
        .a-search:focus {
          border-color: var(--p);
          box-shadow: 0 0 0 3px rgba(23,105,224,0.12);
          background: var(--card-bg);
        }
        .search-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          font-size: 13px;
          pointer-events: none;
        }
        .search-kbd {
          position: absolute;
          right: 10px; top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: var(--muted);
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 1px 5px;
          pointer-events: none;
        }

        .a-nav {
          margin-left: auto;
          display: flex;
          align-self: stretch;
          gap: 1px;
        }
        .a-nav a.nav-btn {
          position: relative;
          border-bottom: 3px solid transparent;
          padding: 8px 10px 5px;
          color: var(--muted);
          min-width: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          font-size: 20px;
          border-radius: 6px 6px 0 0;
          transition: all 0.18s ease;
          text-decoration: none;
          background: transparent;
          border-top: none; border-left: none; border-right: none;
          cursor: pointer;
        }
        .a-nav a.nav-btn small {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .a-nav a.nav-btn:hover {
          background: var(--nav-hover);
          color: var(--text-main);
        }
        .a-nav a.nav-btn.active {
          color: var(--text-main);
          border-bottom-color: var(--text-main);
        }
        .topbar-root.dark .a-nav a.nav-btn.active {
          border-bottom-color: #78aef8;
          color: #fff;
        }
        .a-nav a.nav-btn:active { transform: scale(0.96); }

        .nav-icon {
          height: 24px;
          display: grid; place-items: center;
          transition: transform 0.18s ease;
        }
        .a-nav a.nav-btn:hover .nav-icon { transform: translateY(-2px); }

        /* =========================================
           ANIMATED "COMING SOON" TOOLTIPS 
           ========================================= */
        .coming-soon-btn {
          opacity: 0.4 !important;
          cursor: not-allowed !important;
          position: relative;
        }
        .coming-soon-btn:hover {
          background: transparent !important;
          color: var(--muted) !important;
        }
        .coming-soon-btn .nav-icon {
          transform: none !important;
        }
        .coming-soon-btn:active {
          transform: none !important;
        }
        
        .nav-btn.coming-soon-btn::after {
          content: "Coming Soon";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-10px) scale(0.95);
          background: var(--text-main);
          color: var(--card-bg);
          font-size: 11px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 100;
        }
        .nav-btn.coming-soon-btn:hover::after {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(4px) scale(1);
        }

        .nav-profile {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(145deg, #d5e7fb, #8db7e5);
          border: 2px solid var(--card-bg);
          box-shadow: 0 0 0 1px var(--line);
          color: #173d70;
          font-size: 10px;
          font-weight: 900;
          display: grid; place-items: center;
          transition: all 0.25s ease;
        }
        .nav-profile:hover { transform: scale(1.12); box-shadow: 0 4px 12px rgba(23,105,224,0.25); }
        .nav-badge {
          position: absolute;
          top: 4px; right: 14px;
          min-width: 16px; height: 16px;
          padding: 0 4px;
          border-radius: 999px;
          background: #d92d43;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          display: grid; place-items: center;
          border: 2px solid var(--card-bg);
          animation: pulse-soft 2.2s ease-in-out infinite;
        }

        .profile-nav { position: relative; }
        .profile-menu {
          position: absolute;
          right: -6px; top: 68px;
          width: 260px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          text-align: left;
          color: var(--text-main);
          z-index: 80;
          animation: slideDown 0.2s ease;
        }
        .menu-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 6px 12px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 6px;
        }
        .menu-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--p-light);
          color: var(--p);
          display: grid; place-items: center;
          font-weight: 900;
          font-size: 14px;
          flex-shrink: 0;
        }
        .menu-user-info b { display: block; font-size: 14px; }
        .menu-user-info small { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
        .menu-link {
          padding: 10px 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          color: var(--text-main);
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .menu-link:hover { background: var(--nav-hover); color: var(--p); }
        .menu-link svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; }

        @media (max-width: 860px) {
          .search-wrap { display: none; }
        }
        @media (max-width: 520px) {
          .a-nav a.nav-btn small { display: none; }
          .a-nav a.nav-btn { min-width: 48px; padding: 8px 6px 5px; }
        }
      `}</style>

      <div className={`topbar-root ${theme}`}>
        <header className={`a-top ${scrollY > 10 ? "scrolled" : ""}`}>
          <Link to="/" className="logo">
            <span className="logo-mark">C</span>
            Crackin <i style={{ fontStyle: "normal", color: "var(--p)" }}>AI</i>
          </Link>

          <form className="search-wrap" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              ref={searchRef}
              className="a-search"
              placeholder="Search topics, questions, companies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-kbd">⌘K</span>
          </form>

          <nav className="a-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => 
                  `nav-btn ${isActive && !item.comingSoon ? "active" : ""} ${item.comingSoon ? "coming-soon-btn" : ""}`
                }
                end={item.id === "home"}
                onClick={(e) => {
                  if (item.comingSoon) {
                    e.preventDefault();
                  }
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <small>{item.label}</small>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}

            <button
              className="profile-nav"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              style={{ background: "transparent", border: "none", padding: "8px 10px 5px" }}
            >
              <span className="nav-profile" title={displayName} style={photoURL ? { overflow: "hidden", padding: 0 } : {}}>
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={displayName} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials
                )}
              </span>
              
              <small style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", color: "var(--muted)" }}>Me ▾</small>
              {menuOpen && (
                <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="menu-user">
                    <span className="menu-avatar" style={photoURL ? { overflow: "hidden" } : {}}>
                      {photoURL ? (
                        <img 
                          src={photoURL} 
                          alt={displayName} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        initials
                      )}
                    </span>
                    <span className="menu-user-info">
                      <b>{displayName}</b>
                      <small>B.Tech CSE · AI & ML</small>
                    </span>
                  </div>
                  
                  {/* UPDATE: Activated profile button linking to /profile */}
                  <div 
                    className="menu-link" 
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20v-2a4 4 0 014-4h8a4 4 0 014 4v2"/></svg>
                    View profile
                  </div>
                  
                  <div 
                    className="menu-link coming-soon-btn" 
                    title="Coming Soon"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                    Account settings
                  </div>

                  <div className="menu-link" onClick={handleLogout} style={{ color: "#d92d43", marginTop: 4 }}>
                    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </div>
                </div>
              )}
            </button>
          </nav>
        </header>
        <div className="topbar-spacer" aria-hidden="true" />
      </div>
    </>
  );
}