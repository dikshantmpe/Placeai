import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase.js"; 
import { onAuthStateChanged } from "firebase/auth";

// Helper function to load Vanta scripts safely
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Title Case Formatter
const formatName = (name) => {
  if (!name) return "Guest";
  return name
    .split(/[^a-zA-Z0-9]+/)
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
};

const topics = ["All", "Arrays", "Linked List", "Trees", "Binary Search", "DP", "Stack", "Graphs"];
const diffColor = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" };
const diffBg = { Easy: "rgba(16, 185, 129, 0.15)", Medium: "rgba(245, 158, 11, 0.15)", Hard: "rgba(239, 68, 68, 0.15)" };

const generateDummyData = () => {
  return Array.from({ length: 45 }).map((_, i) => ({
    _id: `demo-${i}`,
    title: `Standard Technical Interview Problem ${i + 1}`,
    topic: topics[(i % (topics.length - 1)) + 1],
    difficulty: i % 4 === 0 ? "Hard" : i % 2 === 0 ? "Medium" : "Easy",
    status: i % 5 === 0 
  }));
};

export default function DSATracker() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Authenticate User for Profile Pill
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setFirebaseUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  let rawName = "Guest";
  if (firebaseUser?.displayName) {
    rawName = firebaseUser.displayName;
  } else if (firebaseUser?.email) {
    rawName = firebaseUser.email.split("@")[0];
  }
  const displayName = formatName(rawName);

  // Initialize Vanta.js Background
  useEffect(() => {
    let cancelled = false;

    async function initVanta() {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js");
        
        // Ensure the ref exists before attaching Vanta
        if (cancelled || !vantaRef.current || vantaEffect.current) return;

        if (window.VANTA && window.VANTA.NET) {
          vantaEffect.current = window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xff3f81, 
            backgroundColor: 0x0a0812, 
            points: 11.0,
            maxDistance: 22.0,
            spacing: 17.0,
            showDots: true,
          });
        }
      } catch (err) {
        console.error("Failed to load Vanta background:", err);
      }
    }

    initVanta();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // Fetch Problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        // IMPORTANT: this backend only understands its own custom JWT
        // (issued by /api/auth/login, /api/auth/register, /api/auth/google),
        // NOT a raw Firebase ID token. Always use the JWT saved in localStorage.
        const token = localStorage.getItem("token");

        const res = await axios.get("https://placeai-sqjj.onrender.com/api/problems", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProblems(res.data);
        setIsDemoMode(false);
      } catch (err) {
        console.error("Backend fetch failed. Loading Demo Data instead...", err);
        setProblems(generateDummyData());
        setIsDemoMode(true); 
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const toggleStatus = async (id) => {
    setProblems(problems.map(p => p._id === id ? { ...p, status: !p.status } : p));
    
    if (isDemoMode) return; 

    try {
      const token = localStorage.getItem("token");
      
      await axios.put(`https://placeai-sqjj.onrender.com/api/problems/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to update status on server.", err);
    }
  };

  const filtered = filter === "All" ? problems : problems.filter(p => p.topic === filter);
  const doneCount = filtered.filter(p => p.status).length;
  const percent = filtered.length ? Math.round((doneCount / filtered.length) * 100) : 0;
  const totalDone = problems.filter(p => p.status).length;

  return (
    <div style={{
      flex: 1,
      minHeight: "100vh",
      position: "relative",
      padding: "2.5rem 3rem",
      color: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      
      {/* 1. BACKGROUND ALWAYS RENDERS FIRST */}
      <div 
        ref={vantaRef} 
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }} 
      />
      
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,8,18,0.75) 80%)"
      }} />

      <style>{`
        .glass-panel {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.05);
          position: relative;
          z-index: 10;
        }

        .dsa-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 10;
        }

        .topic-btn {
          background: rgba(255, 255, 255, 0.03);
          color: #9b9ba8;
          padding: 10px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          white-space: nowrap;
          backdrop-filter: blur(10px);
        }
        
        .topic-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-2px);
        }
        
        .topic-btn.active {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border-color: transparent;
          box-shadow: 0 8px 20px -5px rgba(255,63,129,0.5);
          transform: translateY(-2px);
        }

        .table-row {
          display: grid;
          grid-template-columns: 44px 1fr 120px 100px 80px;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          align-items: center;
          transition: all 0.2s ease;
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .table-row:hover {
          background: rgba(255,255,255,0.03);
        }
        
        .table-row.completed {
          background: rgba(16, 185, 129, 0.04);
        }
        
        .table-row.completed:hover {
          background: rgba(16, 185, 129, 0.07);
        }

        .problems-mobile { display: none; }
        .problems-desktop { display: block; }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }

        @media (max-width: 768px) {
          .problems-desktop { display: none; }
          .problems-mobile { display: block; }
        }
      `}</style>

      {/* 2. SHOW LOADING SCREEN OR DASHBOARD OVER THE BACKGROUND */}
      {loading ? (
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "2rem 3rem", display: "flex", alignItems: "center", gap: "16px", color: "#fff", fontWeight: "700", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ width: "24px", height: "24px", border: "3px solid rgba(255,63,129,0.3)", borderTop: "3px solid #ff3f81", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            Decrypting DSA Sheet...
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* WARNING BANNER FOR DEMO MODE */}
          {isDemoMode && (
            <div className="glass-panel" style={{
              background: "rgba(245, 158, 11, 0.05)",
              borderColor: "rgba(245, 158, 11, 0.2)",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <div style={{ background: "rgba(245, 158, 11, 0.2)", padding: "8px", borderRadius: "8px" }}>⚠️</div> 
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "#fcd34d", fontSize: "1rem", fontWeight: "700" }}>Demo Mode Active</h4>
                <p style={{ margin: 0, color: "#9b9ba8", fontSize: "0.85rem" }}>Your Render backend is asleep or rejected the auth token. Showing offline dummy data.</p>
              </div>
            </div>
          )}

          {/* Unified Header with Profile Pill */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
            <div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "14px", letterSpacing: "-0.5px" }}>
                <span style={{ width: "28px", height: "4px", background: "linear-gradient(90deg, #ff3f81, #7c3aed)", borderRadius: "2px" }}></span>
                DSA <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tracker</span>
              </h2>
              <p style={{ color: "#9b9ba8", margin: 0, fontSize: "1rem" }}>Master data structures problem by problem.</p>
            </div>
            
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", 
              padding: "8px 16px", borderRadius: "100px"
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#e2e8f0" }}>
                {displayName} • Ready to work
              </span>
            </div>
          </header>

          {/* Stats Row */}
          <div className="dsa-stats-grid">
            {[
              { label: "Total Solved", value: totalDone, total: `/ ${problems.length}`, color: "#ff3f81", icon: "⟨/⟩" },
              { label: `${filter} Solved`, value: doneCount, total: `/ ${filtered.length}`, color: "#a78bfa", icon: "🎯" },
              { label: "Completion Rate", value: `${percent}%`, total: "Overall", color: "#10b981", icon: "📊" },
            ].map((s, i) => (
              <div key={i} className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "20px" }}>
                <div>
                  <p style={{ color: "#9b9ba8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>{s.label}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: "800", color: "white", lineHeight: "1" }}>{s.value}</span>
                    <span style={{ fontSize: "0.9rem", color: "#6b6b78", fontWeight: "600" }}>{s.total}</span>
                  </div>
                </div>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: `linear-gradient(135deg, ${s.color}20, transparent)`, 
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", 
                  border: `1px solid ${s.color}40`, color: s.color, boxShadow: `0 0 20px ${s.color}20`
                }}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* Global Progress Bar */}
          <div className="glass-panel" style={{ padding: "1.5rem 2rem", borderRadius: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.9rem", color: "#e2e8f0", fontWeight: "700" }}>Overall Sheet Progress</span>
              <span style={{ fontSize: "0.9rem", color: "#ff3f81", fontWeight: "800" }}>{percent}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", height: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{
                width: `${percent}%`, background: "linear-gradient(90deg, #7c3aed, #ff3f81)",
                height: "100%", borderRadius: "10px", transition: "width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                boxShadow: "0 0 20px rgba(255,63,129,0.6)"
              }} />
            </div>
          </div>

          {/* Topic Filters */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "0.5rem 0" }}>
            {topics.map(t => {
              const topicDone = t === "All" ? problems.filter(p => p.status).length : problems.filter(p => p.topic === t && p.status).length;
              const topicTotal = t === "All" ? problems.length : problems.filter(p => p.topic === t).length;
              return (
                <button key={t} onClick={() => setFilter(t)} className={`topic-btn ${filter === t ? "active" : ""}`}>
                  {t} <span style={{ opacity: filter === t ? 1 : 0.5, fontSize: "0.75rem", marginLeft: "6px", fontWeight: filter === t ? "700" : "500" }}>{topicDone}/{topicTotal}</span>
                </button>
              );
            })}
          </div>

          {/* Problem List (Desktop) */}
          <div className="problems-desktop glass-panel" style={{ padding: "0", overflow: "hidden" }}>
            
            <div style={{
              display: "grid", gridTemplateColumns: "44px 1fr 120px 100px 80px",
              padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.3)",
              fontSize: "0.75rem", color: "#6b6b78", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px"
            }}>
              <span></span>
              <span>Problem Title</span>
              <span>Topic</span>
              <span>Difficulty</span>
              <span>Status</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "5rem", textAlign: "center", color: "#6b6b78", fontWeight: "600", fontSize: "1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}>📭</div>
                No problems found for this topic.
              </div>
            ) : (
              <div>
                {filtered.map((p, i) => (
                  <div key={p._id} className={`table-row ${p.status ? "completed" : ""}`}>
                    
                    <div onClick={() => toggleStatus(p._id)} style={{
                      width: "24px", height: "24px", borderRadius: "8px", cursor: "pointer",
                      background: p.status ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${p.status ? "#10b981" : "rgba(255,255,255,0.15)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)", color: "white", 
                      boxShadow: p.status ? "0 0 15px rgba(16,185,129,0.5)" : "inset 0 2px 4px rgba(0,0,0,0.2)"
                    }}>
                      {p.status && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>

                    <button onClick={() => navigate(`/problem/${p._id}`)} style={{
                      color: p.status ? "#6b6b78" : "#ffffff", fontSize: "0.95rem", fontWeight: "600",
                      textDecoration: p.status ? "line-through" : "none",
                      background: "transparent", border: "none", cursor: "pointer",
                      textAlign: "left", padding: 0, transition: "color 0.2s"
                    }}>
                      <span style={{ color: "#6b6b78", marginRight: "12px", fontSize: "0.85rem", fontWeight: "700" }}>
                        {String(i + 1).padStart(2, "0")}.
                      </span>
                      {p.title}
                    </button>

                    <span style={{ fontSize: "0.8rem", color: "#9b9ba8", fontWeight: "600" }}>{p.topic}</span>

                    <span style={{
                      fontSize: "0.7rem", fontWeight: "800", padding: "6px 12px",
                      borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      color: diffColor[p.difficulty], background: diffBg[p.difficulty],
                      border: `1px solid ${diffColor[p.difficulty]}40`, letterSpacing: "0.5px", textTransform: "uppercase"
                    }}>
                      {p.difficulty}
                    </span>

                    <span style={{
                      fontSize: "0.85rem", color: p.status ? "#10b981" : "#6b6b78",
                      fontWeight: "800", display: "flex", alignItems: "center", gap: "6px"
                    }}>
                      {p.status ? (
                        <>Done <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></>
                      ) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}