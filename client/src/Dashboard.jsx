import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "./api.js"; // Updated: Import the configured api instance instead of raw axios
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase.js";
import { getIdToken } from "firebase/auth"; // Kept for WebSocket authentication
import io from "socket.io-client";

/* ═══════════════════════════════════════════════════════════════
   CRACKIN AI — DASHBOARD (Real Data + WebSocket)
   Use with <Topbar /> at App level
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
      zIndex: 9999, animation: "dashToastIn 0.35s cubic-bezier(0.16,1,0.3,1)",
      display: "flex", alignItems: "center", gap: 10, maxWidth: 360, lineHeight: 1.4,
    }}>
      <span style={{ fontSize: 16 }}>{type === "success" ? "✓" : type === "info" ? "ℹ" : "✕"}</span>
      {message}
    </div>
  );
}

function AnimatedCounter({ end, duration = 1600 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <span>{val}</span>;
}

function Ring({ score, size = 140, stroke = 10, delay = 0 }) {
  const [pct, setPct] = useState(0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  useEffect(() => {
    const t = setTimeout(() => setPct(score), delay);
    return () => clearTimeout(t);
  }, [score, delay]);
  const offset = c - (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--p)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, color: "var(--navy)" }}>
        {pct}%<span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>Ready</span>
      </div>
    </div>
  );
}

export default function Dashboard({ theme: externalTheme }) {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [showFocusMode, setShowFocusMode] = useState(false);

  /* ── Theme: use external if provided, else localStorage fallback ── */
  const [internalTheme, setInternalTheme] = useState(
    localStorage.getItem("crackin-theme") || "light"
  );
  const theme = externalTheme !== undefined ? externalTheme : internalTheme;

  /* ── Auth: use Firebase currentUser ── */
  const firebaseUser = auth.currentUser;

  // ═══════════════════════════════════════════════════════════════
  // INITIAL DATA FETCH
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!firebaseUser) {
          navigate("/login");
          return;
        }

        // Use localhost for development, production URL for production
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? "https://placeai-sqjj.onrender.com/api/dashboard"
          : "http://localhost:5001/api/dashboard";

        // Updated: Using the configured `api` instance. 
        // The Axios interceptor in api.js automatically fetches and attaches the fresh Firebase token.
        const res = await api.get(apiUrl, {
          timeout: 10000,
        });

        setData(res.data);
        setError(null);
        setLoading(false);

        // Fetch fresh token specifically for the WebSocket connection
        const token = await getIdToken(firebaseUser, true);

        // Setup WebSocket after initial fetch
        setupWebSocket(firebaseUser.uid, token);
      } catch (err) {
        console.error("Dashboard fetch error:", err.message);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    if (firebaseUser) {
      fetchData();
    }
  }, [firebaseUser, navigate]);

  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET SETUP FOR REAL-TIME UPDATES
  // ═══════════════════════════════════════════════════════════════
  const setupWebSocket = (userId, token) => {
    // Use localhost for development, production URL for production
    const wsUrl = process.env.NODE_ENV === 'production'
      ? "https://placeai-sqjj.onrender.com"
      : "http://localhost:5001";

    const socket = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      socket.emit("joinDashboard", userId);
    });

    // Real-time dashboard update
    socket.on("dashboardUpdate", (updateData) => {
      console.log("📤 Dashboard update received:", updateData);
      setData((prevData) => ({
        ...prevData,
        ...updateData.data,
      }));
      setToast({
        message: "Dashboard updated",
        type: "success",
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
    });

    socketRef.current = socket;
  };

  // ═══════════════════════════════════════════════════════════════
  // CLEANUP ON UNMOUNT
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // EXTRACT DATA WITH REAL VALUES (NO DEFAULTS)
  // ═══════════════════════════════════════════════════════════════
  const streak = data?.streak || 0;
  const readinessScore = data?.readiness || 0;
  const dsaPct = data?.dsa?.percent || 0;
  const aptPct = data?.aptitude?.percent || 0;
  const csPct = data?.coreCs?.percent || 0;
  const intPct = data?.interviews?.percent || 0;
  const dsaDone = data?.dsa?.done || 0;
  const dsaTotal = data?.dsa?.total || 0;
  const mockInterviews = data?.mockInterviewsCount || 0;
  const resumeScore = data?.resumeScore || 0;
  const thisWeekSolved = data?.thisWeekSolved || 0;

  let rawName = "Guest";
  if (firebaseUser?.displayName) rawName = firebaseUser.displayName;
  else if (firebaseUser?.email) rawName = firebaseUser.email.split("@")[0];
  const displayName = formatName(rawName);
  const initials = displayName.substring(0, 2).toUpperCase();
  const firstName = displayName.split(" ")[0];

  const handleQuickAction = useCallback((action) => {
    setToast({ message: `Opening ${action}…`, type: "info" });
    setTimeout(() => console.log("Navigate to:", action), 400);
  }, []);

  const handleChallengeClick = useCallback(() => {
    setToast({ message: "Loading daily challenge…", type: "info" });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // LOADING & ERROR STATES
  // ═══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f3f2ef", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #dfe5ec", borderTopColor: "#1769e0", animation: "dashSpin 0.9s linear infinite" }} />
        <p style={{ color: "#68758a", fontSize: 14, fontWeight: 500 }}>Loading your dashboard…</p>
        <style>{`@keyframes dashSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f3f2ef", gap: 16, textAlign: "center", padding: 20 }}>
        <p style={{ color: "#ef4444", fontSize: 18, fontWeight: 600 }}>❌ {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#1769e0",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`design-a ${theme}`}>
      <style>{`
        :root {
          --p: #1769e0; --p-light: #e8f1ff; --navy: #10264a; --muted: #68758a;
          --line: #dfe5ec; --bg: #f3f2ef; --card-bg: #ffffff; --card-border: #dedbd5;
          --text-main: #172033; --search-bg: #f8fafc; --nav-hover: #f6f5f2;
          --track: #e8edf3; --green: #24816c; --green-light: #e6f5f1;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.06);
          --shadow-lg: 0 12px 32px rgba(0,0,0,0.08);
          --radius: 12px; --radius-sm: 8px;
        }
        .design-a.dark {
          --bg: #171a1f; --navy: #eef4ff; --muted: #aab3c2; --line: #363b45;
          --card-bg: #22262d; --card-border: #393e47; --text-main: #edf2fa;
          --search-bg: #2a2f37; --nav-hover: #30353d; --track: #3a4049;
          --green: #3cd0b0; --green-light: #1a3d34;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.25);
          --shadow-lg: 0 12px 32px rgba(0,0,0,0.35);
        }
        .design-a {
          background: var(--bg);
          color: var(--text-main);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          margin: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .design-a * { box-sizing: border-box; }
        .design-a button { font: inherit; cursor: pointer; border: 0; background: transparent; color: inherit; }

        @keyframes dashToastIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes breathe {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.08); }
        }

        .a-layout {
          max-width: 1400px;
          margin: 22px auto;
          padding: 0 22px;
          display: grid;
          grid-template-columns: 220px minmax(0,1fr) 280px;
          gap: 18px;
          align-items: start;
        }
        .a-left, .a-right { position: sticky; top: 94px; }

        .a-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .a-card:hover { border-color: var(--line); }

        .profile-card {
          overflow: hidden;
          text-align: center;
          animation: fadeInUp 0.5s ease both;
        }
        .cover {
          height: 64px;
          background: linear-gradient(135deg, #c5dcff, #8ab8f5);
          position: relative;
          overflow: hidden;
        }
        .cover::after {
          content: "";
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .face {
          width: 68px; height: 68px;
          border-radius: 50%;
          background: var(--p-light);
          color: var(--p);
          border: 4px solid var(--card-bg);
          display: grid; place-items: center;
          font-weight: 900;
          font-size: 20px;
          margin: -34px auto 8px;
          position: relative;
          z-index: 2;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .profile-card:hover .face {
          transform: scale(1.08);
          box-shadow: 0 8px 20px rgba(23,105,224,0.2);
        }
        .profile-inner { padding: 0 16px 16px; }
        .profile-card h3 { margin: 4px 0; color: var(--navy); font-size: 16px; }
        .profile-card p { font-size: 12px; color: var(--muted); margin: 4px 0; line-height: 1.5; }
        .mini-row {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--line);
          padding: 10px 0 0;
          margin-top: 12px;
          font-size: 12px;
        }
        .mini-row b { color: var(--p); font-weight: 700; }
        .streak-flame { display: inline-flex; align-items: center; gap: 4px; }

        .welcome {
          padding: 26px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 180px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(105deg, var(--card-bg) 0 58%, var(--p-light) 58%);
          padding-right: 280px;
          animation: fadeInUp 0.5s 0.05s both;
        }
        .design-a.dark .welcome {
          background: linear-gradient(105deg, var(--card-bg) 0 58%, #1c2d42 58%);
        }
        .welcome-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .welcome h1 {
          font-size: 28px;
          color: var(--navy);
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }
        .welcome p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          max-width: 340px;
          line-height: 1.5;
        }
        .primary-btn {
          border: 0;
          background: var(--p);
          color: #fff;
          padding: 11px 20px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(23,105,224,0.3);
        }
        .primary-btn:active { transform: scale(0.97); }

        .hero-ill {
          position: absolute;
          right: 16px;
          bottom: 0;
          width: 250px;
          height: 170px;
          pointer-events: none;
        }
        .hero-ill .blob {
          position: absolute;
          width: 180px; height: 140px;
          right: 0; bottom: 5px;
          background: #b8d4f7;
          border-radius: 52% 48% 45% 55%;
          animation: float 3.5s ease-in-out infinite;
        }
        .design-a.dark .hero-ill .blob { background: #2a3a4d; }
        .hero-ill .desk {
          position: absolute;
          right: 14px; bottom: 20px;
          width: 195px; height: 7px;
          background: #1a3a5c;
          border-radius: 6px;
        }
        .hero-ill .desk::after {
          content: "";
          position: absolute;
          right: 20px; top: 6px;
          width: 6px; height: 55px;
          background: #1a3a5c;
          box-shadow: -152px 0 #1a3a5c;
        }
        .hero-ill .student-head {
          position: absolute;
          right: 108px; bottom: 96px;
          width: 40px; height: 46px;
          border-radius: 48%;
          background: #a07058;
          z-index: 3;
          animation: float 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .hero-ill .hair {
          position: absolute;
          right: 102px; bottom: 128px;
          width: 50px; height: 26px;
          background: #1a3038;
          border-radius: 55% 55% 30% 25%;
          z-index: 4;
        }
        .hero-ill .body {
          position: absolute;
          right: 84px; bottom: 32px;
          width: 78px; height: 74px;
          background: #3d7aa8;
          border-radius: 28px 28px 6px 6px;
          transform: rotate(5deg);
          z-index: 2;
        }
        .hero-ill .laptop {
          position: absolute;
          right: 18px; bottom: 28px;
          width: 86px; height: 56px;
          background: #1a3a5c;
          border-radius: 4px;
          transform: skew(-8deg);
          z-index: 5;
        }
        .hero-ill .spark {
          position: absolute;
          background: var(--card-bg);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 7px 10px;
          font-size: 10px;
          font-weight: 800;
          color: var(--navy);
          box-shadow: var(--shadow-sm);
          animation: float 2.8s ease-in-out infinite;
        }
        .hero-ill .s1 { right: 0; top: 6px; animation-delay: 0s; }
        .hero-ill .s2 { left: 0; top: 34px; animation-delay: 0.4s; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 14px 0;
        }
        .stat-card {
          padding: 18px;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.5s both;
          cursor: default;
        }
        .stat-card:nth-child(1) { animation-delay: 0.08s; }
        .stat-card:nth-child(2) { animation-delay: 0.14s; }
        .stat-card:nth-child(3) { animation-delay: 0.20s; }
        .stat-card:nth-child(4) { animation-delay: 0.26s; }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--p);
        }
        .stat-card small { color: var(--muted); font-size: 12px; font-weight: 600; }
        .stat-card strong {
          display: block;
          font-size: 26px;
          color: var(--navy);
          margin: 6px 0;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.5px;
        }
        .stat-delta {
          color: var(--green);
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .design-a.dark .stat-delta { color: #3cd0b0; }
        .stat-art {
          position: absolute;
          right: -6px; bottom: -6px;
          width: 54px; height: 54px;
          border-radius: 50%;
          background: var(--p-light);
          display: grid; place-items: center;
          font-size: 22px;
          transform: rotate(-8deg);
          color: var(--p);
          transition: all 0.3s ease;
        }
        .stat-card:hover .stat-art { transform: rotate(0deg) scale(1.12); }

        .a-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 14px;
        }
        .panel {
          padding: 22px;
          animation: fadeInUp 0.5s both;
        }
        .panel:nth-of-type(1) { animation-delay: 0.32s; }
        .panel:nth-of-type(2) { animation-delay: 0.38s; }
        .panel h2 {
          font-size: 17px;
          color: var(--navy);
          margin: 0 0 4px;
          font-weight: 800;
        }
        .panel-sub { font-size: 12px; color: var(--muted); margin: 0 0 18px; }

        .prog-row {
          display: grid;
          grid-template-columns: 100px 1fr 40px;
          gap: 12px;
          align-items: center;
          margin: 14px 0;
          font-size: 13px;
          color: var(--navy);
          font-weight: 700;
          transition: transform 0.15s ease;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .prog-row:hover { transform: translateX(3px); background: var(--nav-hover); }
        .prog-row:hover .prog-label { color: var(--p); }
        .track {
          height: 8px;
          background: var(--track);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        .fill {
          height: 100%;
          background: var(--p);
          border-radius: 8px;
          transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
          position: relative;
        }
        .fill::after {
          content: "";
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 20px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));
          border-radius: 0 8px 8px 0;
        }
        .prog-pct {
          text-align: right;
          font-variant-numeric: tabular-nums;
          font-weight: 700;
          color: var(--muted);
          font-size: 12px;
        }

        .readiness-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .readiness-panel h2 { margin-bottom: 2px; }
        .readiness-note { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
        .readiness-detail {
          display: flex;
          gap: 16px;
          margin-top: 14px;
          font-size: 12px;
        }
        .readiness-detail span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--muted);
          font-weight: 600;
        }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--p); }
        .dot-weak { background: #f59e0b; }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          animation: fadeInUp 0.5s 0.42s both;
        }
        .quick-card {
          border: 1px solid var(--line);
          background: var(--card-bg);
          border-radius: var(--radius-sm);
          padding: 16px;
          text-align: left;
          position: relative;
          overflow: hidden;
          min-height: 100px;
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .quick-card::after {
          content: "";
          position: absolute;
          width: 50px; height: 50px;
          border-radius: 50%;
          background: var(--p-light);
          right: -16px; bottom: -16px;
          transition: all 0.3s ease;
        }
        .quick-card:hover {
          border-color: var(--p);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .quick-card:hover::after { transform: scale(1.3); background: var(--p); }
        .quick-card:active { transform: scale(0.98); }
        .quick-card b { font-size: 13px; color: var(--navy); position: relative; z-index: 2; font-weight: 700; }
        .quick-card small { color: var(--muted); margin-top: 4px; font-size: 11px; position: relative; z-index: 2; }
        .quick-icon { font-size: 18px; margin-bottom: 6px; position: relative; z-index: 2; }

        .feature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
          animation: fadeInUp 0.5s 0.48s both;
        }
        .feature-card {
          padding: 32px;
          position: relative;
          overflow: hidden; 
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 360px;
          border: 1px solid var(--line);
          border-radius: var(--radius);
        }
        .feature-card > div { position: relative; z-index: 2; }
        .feature-card h3 {
          font-size: 28px;
          color: var(--navy);
          margin: 0 0 16px;
          font-weight: 800;
          line-height: 1.15;
          max-width: 240px;
          letter-spacing: -0.5px;
        }
        .feature-card p {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 24px;
          line-height: 1.5;
          max-width: 220px;
        }
        .card-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
          display: block;
        }
        
        .ai-card { background: var(--card-bg); }
        .ai-card::before {
          content: "";
          position: absolute;
          right: 0; bottom: 0; top: 0;
          width: 60%;
          background: #f4f7fc;
          clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
          z-index: 0;
        }
        .focus-card { background: #fdf8ee; border: 1px solid var(--line); }

        .design-a.dark .ai-card { background: var(--card-bg); }
        .design-a.dark .ai-card::before { background: #1a2230; }
        .design-a.dark .focus-card { background: #2d261b; }

        .feature-ill {
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }
        
        .ai-ill {
          width: 100%;       
          height: 180px;     
          left: 0;
          bottom: 0px;
        }
        
        .focus-ill {
          width: 250px;      
          height: 250px;     
          right: -30px;
          bottom: -35px;
        }
        
        .feature-ill img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .ai-ill img {
          object-position: bottom center;
        }
        
        .focus-ill img {
          object-position: bottom right;
        }

        .a-right .a-card {
          padding: 16px;
          margin-bottom: 12px;
          animation: fadeInUp 0.5s both;
        }
        .a-right .a-card:nth-child(1) { animation-delay: 0.50s; }
        .a-right .a-card:nth-child(2) { animation-delay: 0.56s; }

        .challenge-card {
          background: linear-gradient(155deg, #0f1f3d, #1a3a6b);
          color: #fff;
          border: 0;
          position: relative;
          overflow: hidden;
          padding: 20px;
          padding-bottom: 88px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 220px;
        }
        .challenge-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.18);
        }
        .challenge-card h3 {
          font-size: 17px;
          margin: 8px 0 6px;
          color: #fff;
          font-weight: 700;
          line-height: 1.3;
        }
        .challenge-card p { color: #9fb3d3; font-size: 12px; margin-bottom: 14px; }
        .challenge-tag {
          display: none;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7aaef8;
          margin-bottom: 4px;
        }
        .challenge-btn {
          background: var(--p);
          color: #fff;
          padding: 9px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .challenge-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(23,105,224,0.35);
        }

        .challenge-ill {
          display: none;
          position: absolute;
          right: 6px; bottom: 2px;
          width: 135px; height: 88px;
          pointer-events: none;
        }

        .recommend-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .recommend-icon {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--p-light);
          display: grid; place-items: center;
          color: var(--p);
          font-size: 16px;
          flex-shrink: 0;
        }
        .recommend-head h3 { margin: 0; font-size: 15px; color: var(--navy); font-weight: 800; }
        .rec-item {
          padding: 10px 0;
          border-bottom: 1px solid var(--line);
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .rec-item:last-child { border-bottom: 0; padding-bottom: 0; }
        .rec-item:hover { transform: translateX(3px); }
        .rec-item:hover b { color: var(--p); }
        .rec-item b { display: block; font-size: 13px; color: var(--navy); font-weight: 700; transition: color 0.15s ease; }
        .rec-item small { display: block; color: var(--muted); font-size: 11px; margin-top: 3px; font-weight: 500; }
        .rec-meta { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .rec-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--green-light);
          color: var(--green);
        }

        .focus-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.25s ease;
        }
        .focus-modal {
          background: var(--card-bg);
          border-radius: var(--radius);
          padding: 32px;
          max-width: 480px;
          width: 90%;
          text-align: center;
          box-shadow: var(--shadow-lg);
          animation: fadeInUp 0.3s ease;
        }
        .focus-modal h2 { margin: 0 0 8px; color: var(--navy); }
        .focus-modal p { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
        .focus-timer {
          font-size: 48px;
          font-weight: 900,
          color: var(--p);
          font-variant-numeric: tabular-nums;
          margin: 16px 0;
        }

        @media (max-width: 1100px) {
          .a-layout { grid-template-columns: 200px 1fr; }
          .a-right { display: none; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .feature-section { grid-template-columns: 1fr; }
        }
        @media (max-width: 860px) {
          .a-layout { grid-template-columns: 1fr; }
          .a-left { position: static; }
          .welcome { padding-right: 28px; min-height: auto; }
          .hero-ill { display: none; }
          .a-grid { grid-template-columns: 1fr; }
          .quick-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 520px) {
          .stats-grid { grid-template-columns: 1fr; }
          .quick-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="a-layout">
        <aside className="a-left">
          <div className="a-card profile-card">
            <div className="cover" />
            <div className="profile-inner">
              <div className="face">{initials}</div>
              <h3>{displayName}</h3>
              <p>B.Tech CSE (AI &amp; ML)<br/>Placement preparation in progress</p>
              <div className="mini-row">
                <span>Streak</span>
                <b className="streak-flame"><span>🔥</span>{streak} days</b>
              </div>
              <div className="mini-row">
                <span>Problems</span>
                <b>{dsaDone}</b>
              </div>
            </div>
          </div>
        </aside>

        <main>
          <section className="a-card welcome">
            <div>
              <div className="welcome-label">Your Preparation Overview</div>
              <h1>Good evening, {firstName}.</h1>
              <p>One focused session today keeps your {streak}-day streak alive.</p>
              <button className="primary-btn" onClick={() => handleQuickAction("DSA Practice")}>
                Continue preparing <span>→</span>
              </button>
            </div>
            <div className="hero-ill" aria-hidden="true">
              <div className="blob" />
              <div className="spark s1">✓ Interview ready</div>
              <div className="spark s2">⌘ Keep coding</div>
              <div className="hair" />
              <div className="student-head" />
              <div className="body" />
              <div className="laptop" />
              <div className="desk" />
            </div>
          </section>

          <div className="stats-grid">
            <div className="a-card stat-card" title="Overall placement readiness">
              <small>Placement readiness</small>
              <strong>{readinessScore}%</strong>
              <span className="stat-delta">↑ Real-time</span>
              <span className="stat-art">🎯</span>
            </div>
            <div className="a-card stat-card" title="DSA problems solved">
              <small>DSA completed</small>
              <strong><AnimatedCounter end={dsaDone} /></strong>
              <span className="stat-delta">{thisWeekSolved} this week</span>
              <span className="stat-art">⌘</span>
            </div>
            <div className="a-card stat-card" title="Mock interviews taken">
              <small>Mock interviews</small>
              <strong>{mockInterviews}</strong>
              <span className="stat-delta">Updated live</span>
              <span className="stat-art">◉</span>
            </div>
            <div className="a-card stat-card" title="Resume ATS score">
              <small>Resume score</small>
              <strong>{resumeScore}</strong>
              <span className="stat-delta">Strong foundation</span>
              <span className="stat-art">📄</span>
            </div>
          </div>

          <div className="a-grid">
            <section className="a-card panel">
              <h2>Your preparation progress</h2>
              <p className="panel-sub">Coverage across core placement areas</p>
              <div className="prog-row" title="Data Structures &amp; Algorithms">
                <span className="prog-label">DSA</span>
                <div className="track"><div className="fill" style={{ width: `${dsaPct}%` }} /></div>
                <span className="prog-pct">{dsaPct}%</span>
              </div>
              <div className="prog-row" title="Quantitative Aptitude">
                <span className="prog-label">Aptitude</span>
                <div className="track"><div className="fill" style={{ width: `${aptPct}%` }} /></div>
                <span className="prog-pct">{aptPct}%</span>
              </div>
              <div className="prog-row" title="Computer Science Fundamentals">
                <span className="prog-label">Core CS</span>
                <div className="track"><div className="fill" style={{ width: `${csPct}%` }} /></div>
                <span className="prog-pct">{csPct}%</span>
              </div>
              <div className="prog-row" title="Interview Preparation">
                <span className="prog-label">Interviews</span>
                <div className="track"><div className="fill" style={{ width: `${intPct}%` }} /></div>
                <span className="prog-pct">{intPct}%</span>
              </div>
            </section>

            <section className="a-card panel readiness-panel">
              <h2>Overall readiness</h2>
              <p className="readiness-note">Based on real-time data</p>
              <Ring score={readinessScore} delay={400} />
              <div className="readiness-detail">
                <span><span className="dot" />Strong: DSA</span>
                <span><span className="dot dot-weak" />Weak: Core CS</span>
              </div>
            </section>
          </div>

          <section className="a-card panel" style={{ marginTop: 14 }}>
            <h2>Jump back in</h2>
            <p className="panel-sub">Your most-used preparation tools</p>
            <div className="quick-grid">
              {[
                { icon: "⌘", label: "Solve DSA", desc: "Dynamic Programming", action: "DSA" },
                { icon: "◉", label: "Mock Interview", desc: "Technical practice", action: "Mock Interview" },
                { icon: "◆", label: "Aptitude Quiz", desc: "10 quick questions", action: "Aptitude Quiz" },
                { icon: "▧", label: "Check Resume", desc: `Latest score: ${resumeScore}`, action: "Resume" },
              ].map((q) => (
                <div key={q.action} className="quick-card" onClick={() => handleQuickAction(q.action)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleQuickAction(q.action)}>
                  <div className="quick-icon">{q.icon}</div>
                  <b>{q.label}</b>
                  <small>{q.desc}</small>
                </div>
              ))}
            </div>
          </section>

          <div className="feature-section">
            <div className="a-card feature-card ai-card">
              <div>
                <span className="card-label">AI-Powered Practice</span>
                <h3>Prepare like the interview is already scheduled.</h3>
                <p>Move from coding practice to realistic interview sessions with focused AI feedback on the areas that matter most.</p>
                <button className="primary-btn" onClick={() => handleQuickAction("Mock Interview")}>Start a mock interview →</button>
              </div>
              <div className="feature-ill ai-ill" aria-hidden="true">
                <img src="Freelancer with computer, sitting and using laptop, distance work_ modern vector flat illustration _ Premium Vector.jpeg" alt="" />
              </div>
            </div>

            <div className="a-card feature-card focus-card" style={{ cursor: "pointer" }} onClick={() => setShowFocusMode(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setShowFocusMode(true)}>
              <div>
                <span className="card-label">Focus Mode</span>
                <h3>Your coding desk, simplified.</h3>
                <p>Pick one topic and work without distractions.</p>
              </div>
              <div className="feature-ill focus-ill" aria-hidden="true">
                <img src="computer.png" alt="" />
              </div>
            </div>
          </div>
        </main>

        <aside className="a-right">
          <div className="a-card challenge-card" onClick={handleChallengeClick}>
            <span className="challenge-tag">Daily Challenge</span>
            <h3>Longest Substring Without Repeating Characters</h3>
            <p>Medium · ~25 min</p>
            <button className="challenge-btn" onClick={(e) => { e.stopPropagation(); handleChallengeClick(); }}>Solve challenge →</button>
            <div className="challenge-ill" aria-hidden="true">
              <div className="circle" /><div className="hair" />
              <div className="head" /><div className="shirt" /><div className="screen" />
            </div>
          </div>

          <div className="a-card recommend-card">
            <div className="recommend-head">
              <span className="recommend-icon">✦</span>
              <h3>Recommended next</h3>
            </div>
            {[
              { title: "Revise DBMS normalization", meta: "Core CS · 18 min", badge: "High yield", action: "DBMS Revision" },
              { title: "Quantitative aptitude set", meta: "20 questions", badge: null, action: "Aptitude" },
              { title: "Practice your introduction", meta: "AI interview feedback", badge: "New", action: "Interview Practice" },
            ].map((rec) => (
              <div key={rec.action} className="rec-item" onClick={() => handleQuickAction(rec.action)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleQuickAction(rec.action)}>
                <b>{rec.title}</b>
                <div className="rec-meta">
                  <small>{rec.meta}</small>
                  {rec.badge && <span className="rec-badge">{rec.badge}</span>}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {showFocusMode && (
        <div className="focus-overlay" onClick={() => setShowFocusMode(false)}>
          <div className="focus-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎯 Focus Mode</h2>
            <p>Distraction-free coding environment with Pomodoro timer.</p>
            <div className="focus-timer">25:00</div>
            <button className="primary-btn" onClick={() => setShowFocusMode(false)}>Start Session</button>
            <button onClick={() => setShowFocusMode(false)} style={{ marginTop: 10, background: "transparent", color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}