import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("crackin-theme") || "light");
  
  // Stats from localStorage
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const quizzesTaken = parseInt(localStorage.getItem("quizzesTaken") || "0");
  const interviewsDone = parseInt(localStorage.getItem("interviewsDone") || "0");

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark" : "";
  }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (setUser) setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "Me";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Extract display details
  const displayName = user?.displayName || user?.name || "Guest User";
  const displayEmail = user?.email || "No email provided";
  const photoURL = user?.photoURL || user?.avatar || null;

  return (
    <div style={styles.body}>
      <style>{`
        :root {
          --b: #1769e0; --n: #10264a; --bg: #f3f2ef; --c: #fff;
          --t: #172033; --m: #68758a; --l: #dedbd5;
          --danger-bg: #fee2e2; --danger-text: #dc2626; --danger-border: #fca5a5;
        }
        body.dark {
          --bg: #171a1f; --c: #22262d; --t: #eef4ff; --n: #eef4ff;
          --m: #aab3c2; --l: #3b414b;
          --danger-bg: rgba(220, 38, 38, 0.1); --danger-text: #ef4444; --danger-border: rgba(220, 38, 38, 0.3);
        }
        * { box-sizing: border-box; }
        .profile-shell {
          max-width: 1000px;
          margin: 40px auto;
          padding: 0 20px 70px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }
        .card {
          background: var(--c);
          border: 1px solid var(--l);
          border-radius: 12px;
          color: var(--t);
          overflow: hidden;
          position: relative;
          transform: translateZ(0); 
          -webkit-mask-image: -webkit-radial-gradient(white, black);
        }
        
        /* Restored your dark/red theme for the banner */
        .hero-banner {
          height: 100px;
          background: linear-gradient(135deg, #1a0505 0%, #2d0a0a 50%, #1a0a1a 100%);
          position: relative;
          border-radius: 11px 11px 0 0;
          overflow: hidden;
        }
        .hero-banner::after {
          content: '';
          position: absolute;
          right: 10%;
          top: 50%;
          transform: translateY(-50%);
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(220,38,38,0.3) 0%, transparent 70%);
          border-radius: 50%;
        }

        .avatar-container {
          width: 84px; height: 84px;
          border-radius: 50%;
          border: 4px solid var(--c);
          background: #111; /* Changed to match dark theme */
          color: #dc2626;   /* Changed to match red theme */
          font-size: 28px;
          font-weight: 800;
          display: grid;
          place-items: center;
          margin: -42px auto 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          overflow: hidden;
          position: relative;
          z-index: 2;
        }
        .avatar-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .user-info {
          text-align: center;
          padding: 0 20px 24px;
        }
        .user-name { font-size: 20px; font-weight: 750; color: var(--n); margin: 0 0 4px; }
        .user-email { font-size: 14px; color: var(--m); margin: 0 0 12px; }
        
        /* Restored your Placement Aspirant red pill badge */
        .badge-role {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(220,38,38,0.1); 
          border: 1px solid rgba(220,38,38,0.2);
          padding: 4px 12px; border-radius: 99px;
          font-size: 11px; font-weight: 700; color: #dc2626;
        }
        
        .section-title {
          font-size: 18px; font-weight: 700; color: var(--n);
          margin: 0 0 16px 0;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .stat-card {
          padding: 20px; text-align: center;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .stat-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: grid; place-items: center;
          font-size: 20px; margin-bottom: 12px;
        }
        .stat-val { font-size: 28px; font-weight: 800; color: var(--n); margin: 0 0 4px; }
        .stat-label { font-size: 13px; color: var(--m); margin: 0; font-weight: 500; }
        
        .details-list { padding: 20px; }
        .detail-row {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 0; border-bottom: 1px solid var(--l);
        }
        .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
        .detail-icon {
          width: 36px; height: 36px;
          background: #f3f4f6; color: var(--m);
          border-radius: 8px; display: grid; place-items: center;
        }
        body.dark .detail-icon { background: var(--bg); }
        .detail-text h4 { margin: 0 0 4px; font-size: 12px; color: var(--m); text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-text p { margin: 0; font-size: 15px; font-weight: 600; color: var(--t); }

        .btn-logout {
          width: 100%; margin-top: 16px;
          background: var(--danger-bg); color: var(--danger-text);
          border: 1px solid var(--danger-border);
          padding: 12px; border-radius: 8px;
          font-weight: 700; font-size: 14px;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-logout:hover { opacity: 0.8; }

        @media (max-width: 800px) {
          .profile-shell { grid-template-columns: 1fr; padding: 20px 15px 70px; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="profile-shell">
        
        {/* Left Column: Profile Card */}
        <aside>
          <div className="card">
            <div className="hero-banner"></div>
            <div className="avatar-container">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="avatar-img" referrerPolicy="no-referrer" />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="user-info">
              <h1 className="user-name">{displayName}</h1>
              <p className="user-email">{displayEmail}</p>
              <div className="badge-role">🎯 Placement Aspirant</div>
              
              <button className="btn-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Right Column: Stats & Details */}
        <main style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Stats Section */}
          <section>
            <h2 className="section-title">Your Progress</h2>
            <div className="stats-grid">
              <div className="card stat-card">
                <div className="stat-icon" style={{ background: "#fff0eb", color: "#f97316" }}>🔥</div>
                <h3 className="stat-val">{streak}</h3>
                <p className="stat-label">Day Streak</p>
              </div>
              <div className="card stat-card">
                <div className="stat-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>🧠</div>
                <h3 className="stat-val">{quizzesTaken}</h3>
                <p className="stat-label">Quizzes Completed</p>
              </div>
              <div className="card stat-card">
                <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>🎤</div>
                <h3 className="stat-val">{interviewsDone}</h3>
                <p className="stat-label">Mock Interviews</p>
              </div>
            </div>
          </section>

          {/* Account Details Section */}
          <section>
            <h2 className="section-title">Account Information</h2>
            <div className="card details-list">
              <div className="detail-row">
                <div className="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div className="detail-text">
                  <h4>Full Name</h4>
                  <p>{displayName}</p>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="detail-text">
                  <h4>Email Address</h4>
                  <p>{displayEmail}</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <div className="detail-text">
                  <h4>Current Plan</h4>
                  <p>Free Tier</p>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

const styles = {
  body: { margin: 0, minHeight: "100vh", background: "var(--bg)" }
};