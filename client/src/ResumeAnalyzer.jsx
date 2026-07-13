import React, { useState, useEffect, useRef } from "react";
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

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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
            color: 0x14b8a6, 
            backgroundColor: 0x000000, 
            points: 10.0,
            maxDistance: 25.0,
            spacing: 18.0,
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

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF first!");
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    setFeedback("");
    setIsDemoMode(false);

    try {
      let token = localStorage.getItem("token");
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const res = await axios.post("https://placeai-sqjj.onrender.com/api/resume/analyze", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data.feedback);
    } catch (err) {
      console.error("Backend fetch failed. Loading Demo Feedback instead...", err);
      setIsDemoMode(true);
      
      setTimeout(() => {
        setFeedback(`OVERALL SCORE:
82/100

STRENGTHS:
- Solid academic foundation explicitly stating your first-year standing in B.Tech (Artificial Intelligence and Machine Learning).
- Excellent display of practical application through the deployment of the 'SIET Campus Care' full-stack platform.
- Broad technical stack highlighted, specifically proficiency in HTML, CSS, PHP, and SQL.
- Good inclusion of diverse technical interests, such as hardware administration (BIOS, dual-booting) and clean Windows installations.

WEAKNESSES:
- The SIET Campus Care project description lacks quantifiable metrics (e.g., "Reduced reporting time by X%").
- Missing links to a live GitHub repository for your code.
- Some artistic aliases (e.g., 'Artistic Sense') are listed without clear connection to technical frontend/design roles.

SUGGESTIONS:
- Add a direct hyperlink to collegecomplaints.infinityfree.me so recruiters can interact with your deployed project.
- Reframe your interest in linguistics and communication studies as a soft skill demonstrating strong analytical and comprehensive listening abilities.
- Consistently use the name Aditya Singh across all headers and project pages to avoid confusion with past aliases.`);
        setLoading(false);
      }, 2000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const renderFeedback = () => {
    const sectionColors = {
      "STRENGTHS:": "#10b981",    
      "WEAKNESSES:": "#f43f5e",   
      "SUGGESTIONS:": "#f59e0b",  
    };

    return feedback.split("\n").map((line, i) => {
      if (line.match(/^\d+\/100$/)) {
        return (
          <div key={i} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: 'rgba(20, 184, 166, 0.08)', 
            border: '1px solid rgba(20, 184, 166, 0.25)', borderRadius: '20px', 
            padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(20, 184, 166, 0.1)' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: '800', color: 'white', textShadow: '0 0 25px rgba(20, 184, 166, 0.6)' }}>
                {line.split('/')[0]}
              </span>
              <span style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: '600' }}>/100</span>
              <p style={{ margin: '8px 0 0', color: '#14b8a6', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '2px' }}>
                ATS MATCH SCORE
              </p>
            </div>
          </div>
        );
      }

      if (line === "OVERALL SCORE:") return null;

      const header = Object.keys(sectionColors).find(h => line.startsWith(h));
      if (header) {
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginTop: "1.75rem", marginBottom: "12px"
          }}>
            <div style={{
              width: "4px", height: "22px", borderRadius: "2px",
              background: sectionColors[header],
              boxShadow: `0 0 10px ${sectionColors[header]}80`
            }} />
            <h3 style={{ color: sectionColors[header], margin: 0, fontSize: "0.9rem",
              fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {line}
            </h3>
          </div>
        );
      }

      if (line.startsWith("- ")) {
        return (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            margin: "10px 0", paddingLeft: "14px"
          }}>
            <span style={{ color: "#14b8a6", marginTop: "2px", fontSize: "0.9rem" }}>▸</span>
            <p style={{ margin: 0, color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.6", fontWeight: "500" }}>
              {line.slice(2)}
            </p>
          </div>
        );
      }

      if (line.trim()) {
        return <p key={i} style={{ color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.6", margin: "8px 0" }}>{line}</p>;
      }
      return null;
    });
  };

  return (
    <div style={{
      flex: 1,
      minHeight: "100vh",
      position: "relative",
      padding: "2.5rem 3rem",
      color: "#ffffff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      background: "#000000"
    }}>
      
      <div 
        ref={vantaRef} 
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }} 
      />
      
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 0%, rgba(13, 148, 136, 0.08) 0%, transparent 60%)"
      }} />

      <style>{`
        /* --- SCROLLBAR STYLES (Grey) --- */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        ::-webkit-scrollbar-corner {
          background: #0a0a0a;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #0a0a0a;
        }

        .glass-panel {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
          position: relative;
          z-index: 10;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .glass-panel:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.06);
        }

        .upload-zone {
          border: 2px dashed rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
        }
        
        .upload-zone:hover {
          border-color: rgba(20, 184, 166, 0.5);
          background: rgba(20, 184, 166, 0.05);
        }

        .upload-zone.drag-over {
          border-color: #14b8a6;
          background: rgba(20, 184, 166, 0.1);
          transform: scale(1.02);
        }

        .upload-zone.has-file {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          border-style: solid;
        }

        .brand-btn {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 700;
          box-shadow: 0 8px 30px -6px rgba(13, 148, 136, 0.5);
          transition: all 0.3s ease;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .brand-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -6px rgba(13, 148, 136, 0.6);
        }

        .brand-btn:disabled {
          background: rgba(255,255,255,0.05);
          color: #64748b;
          box-shadow: none;
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.1);
        }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        @keyframes reverse-spin { 
          to { transform: rotate(-360deg); } 
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
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
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>Backend offline. Generating demo AI feedback instead.</p>
            </div>
          </div>
        )}

        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "linear-gradient(135deg, #115e59, #14b8a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "800", fontSize: "1.1rem", color: "white"
            }}>
              C
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Crackin AI</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
            </div>
          </div>
          
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)", 
            padding: "8px 16px", borderRadius: "100px"
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#e2e8f0" }}>
              {displayName} • Ready to work
            </span>
          </div>
        </header>

        <div style={{ marginBottom: "0.5rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
            Resume <span style={{ color: "#14b8a6" }}>Analyzer</span>
          </h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>Upload your resume and get instant AI-powered feedback.</p>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexDirection: window.innerWidth < 1024 ? "column" : "row" }}>
          
          <div className="glass-panel" style={{ flex: "1 1 50%", padding: "2.5rem", borderRadius: "20px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.2rem", fontWeight: "700", color: "#e2e8f0" }}>Upload Document</h3>
            
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
              style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("resumeInput").click()}
            >
              <input id="resumeInput" type="file" accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }} />

              {file ? (
                <div>
                  <div style={{ fontSize: "64px", marginBottom: "16px", filter: "drop-shadow(0 0 15px rgba(16,185,129,0.4))" }}>📄</div>
                  <p style={{ color: "#10b981", fontWeight: "700", fontSize: "1.1rem", margin: "0 0 8px" }}>{file.name}</p>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, fontWeight: "500" }}>
                    {(file.size / 1024).toFixed(1)} KB · Click to swap file
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.8 }}>📁</div>
                  <p style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "1.1rem", margin: "0 0 8px" }}>
                    Drag & Drop your resume here
                  </p>
                  <p style={{ color: "#64748b", fontSize: "0.95rem", margin: "0 0 24px" }}>
                    or click to browse your files
                  </p>
                  <span style={{
                    background: "rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8", padding: "8px 24px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "600"
                  }}>
                    PDF format only
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button onClick={handleUpload} disabled={loading || !file} className="brand-btn">
                {loading ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "1.2rem" }}>⟳</span>
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ flex: "1 1 50%", padding: "2.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
             
             {!feedback && !loading && (
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                 
                 <div style={{ position: "relative", width: "110px", height: "110px", marginBottom: "2.5rem" }}>
                   <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)", animation: "pulse-glow 3s infinite" }} />
                   <div style={{ position: "absolute", inset: "15px", borderRadius: "50%", border: "2px dashed rgba(20,184,166,0.2)", animation: "spin 10s linear infinite" }} />
                   <div style={{ position: "absolute", inset: "25px", borderRadius: "50%", border: "2px dashed rgba(13,148,136,0.3)", animation: "reverse-spin 15s linear infinite" }} />
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: "2.5rem", zIndex: 2 }}>✨</div>
                 </div>

                 <h3 style={{ margin: "0 0 12px", color: "#e2e8f0", fontSize: "1.3rem", fontWeight: "800" }}>Ready for Analysis</h3>
                 <p style={{ margin: "0 0 2rem", color: "#94a3b8", fontSize: "0.95rem", maxWidth: "300px", lineHeight: "1.5" }}>Upload your resume to unlock a deep AI evaluation of your profile.</p>

                 <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", maxWidth: "350px" }}>
                   {["ATS Compatibility", "Impact Metrics", "Skill Gaps", "Action Verbs"].map((tag, i) => (
                     <span key={i} style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px", borderRadius: "20px", fontSize: "0.75rem", color: "#5eead4", fontWeight: "600", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                       {tag}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {loading && (
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                 
                 <div style={{ position: "relative", width: "80px", height: "100px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", marginBottom: "2rem", overflow: "hidden" }}>
                   <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "#14b8a6", boxShadow: "0 0 15px 3px rgba(20,184,166,0.6)", animation: "scan 2s ease-in-out infinite alternate" }} />
                   <div style={{ position: "absolute", top: "20px", left: "15px", right: "30px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }} />
                   <div style={{ position: "absolute", top: "35px", left: "15px", right: "15px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }} />
                   <div style={{ position: "absolute", top: "50px", left: "15px", right: "40px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }} />
                 </div>

                 <h3 style={{ margin: "0 0 8px", color: "#e2e8f0", fontSize: "1.2rem", fontWeight: "700" }}>Extracting Data...</h3>
                 <p style={{ margin: 0, color: "#5eead4", fontSize: "0.85rem", fontWeight: "600", animation: "pulse-glow 1.5s infinite" }}>Running against ATS criteria</p>
               </div>
             )}

             {feedback && !loading && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "2rem",
                  paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px",
                    background: "rgba(20, 184, 166, 0.1)", 
                    border: "1px solid rgba(20, 184, 166, 0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                    boxShadow: "0 0 20px rgba(20, 184, 166, 0.15)" }}>
                    🤖
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: "800", color: "#e2e8f0" }}>Analysis Complete</h3>
                    <p style={{ margin: 0, color: "#14b8a6", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase" }}>Powered by Gemini</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {renderFeedback()}
                </div>
              </div>
             )}
          </div>
          
        </div>
      </div>
    </div>
  );
}