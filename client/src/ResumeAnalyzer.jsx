import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "./firebase.js"; 
import { onAuthStateChanged } from "firebase/auth";

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
            border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '20px', 
            padding: '2rem', marginBottom: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#111827' }}>
                {line.split('/')[0]}
              </span>
              <span style={{ fontSize: '1.5rem', color: '#6b7280', fontWeight: '600' }}>/100</span>
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
              background: sectionColors[header]
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
            <p style={{ margin: 0, color: "#374151", fontSize: "0.95rem", lineHeight: "1.6", fontWeight: "500" }}>
              {line.slice(2)}
            </p>
          </div>
        );
      }

      if (line.trim()) {
        return <p key={i} style={{ color: "#374151", fontSize: "0.95rem", lineHeight: "1.6", margin: "8px 0" }}>{line}</p>;
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
      color: "#111827",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      background: "#ffffff"
    }}>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        ::-webkit-scrollbar-corner {
          background: #f3f4f6;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {isDemoMode && (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "16px",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "8px", borderRadius: "8px", color: "#f59e0b" }}>⚠️</div> 
            <div>
              <h4 style={{ margin: "0 0 4px 0", color: "#92400e", fontSize: "1rem", fontWeight: "700" }}>Demo Mode Active</h4>
              <p style={{ margin: 0, color: "#a16207", fontSize: "0.85rem" }}>Backend offline. Generating demo AI feedback instead.</p>
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
              <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111827" }}>Crackin AI</div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
            </div>
          </div>
          
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            padding: "8px 16px", borderRadius: "100px"
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>
              {displayName} • Ready to work
            </span>
          </div>
        </header>

        <div style={{ marginBottom: "0.5rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 8px 0", letterSpacing: "-0.02em", color: "#111827" }}>
            Resume <span style={{ color: "#14b8a6" }}>Analyzer</span>
          </h2>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "1rem" }}>Upload your resume and get instant AI-powered feedback.</p>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexDirection: window.innerWidth < 1024 ? "column" : "row" }}>
          
          <div style={{ flex: "1 1 50%", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "20px", padding: "2.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 1.5rem", fontSize: "1.2rem", fontWeight: "700", color: "#111827" }}>Upload Document</h3>
            
            <div
              style={{ 
                flex: 1, 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center",
                border: `2px dashed ${dragOver ? "#14b8a6" : file ? "#10b981" : "#d1d5db"}`,
                borderRadius: "20px",
                padding: "4rem 2rem",
                textAlign: "center",
                background: dragOver ? "rgba(20, 184, 166, 0.04)" : file ? "rgba(16, 185, 129, 0.04)" : "#f9fafb",
                cursor: "pointer"
              }}
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
                  <div style={{ fontSize: "64px", marginBottom: "16px" }}>📄</div>
                  <p style={{ color: "#10b981", fontWeight: "700", fontSize: "1.1rem", margin: "0 0 8px" }}>{file.name}</p>
                  <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0, fontWeight: "500" }}>
                    {(file.size / 1024).toFixed(1)} KB · Click to swap file
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.6 }}>📁</div>
                  <p style={{ color: "#374151", fontWeight: "700", fontSize: "1.1rem", margin: "0 0 8px" }}>
                    Drag & Drop your resume here
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.95rem", margin: "0 0 24px" }}>
                    or click to browse your files
                  </p>
                  <span style={{
                    background: "#f3f4f6", border: "1px solid #e5e7eb",
                    color: "#6b7280", padding: "8px 24px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "600"
                  }}>
                    PDF format only
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button 
                onClick={handleUpload} 
                disabled={loading || !file} 
                style={{
                  background: loading || !file ? "#f3f4f6" : "linear-gradient(135deg, #0d9488, #14b8a6)",
                  color: loading || !file ? "#9ca3af" : "white",
                  border: loading || !file ? "1px solid #e5e7eb" : "none",
                  padding: "16px 32px",
                  borderRadius: "14px",
                  cursor: loading || !file ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "700",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px"
                }}
              >
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

          <div style={{ flex: "1 1 50%", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "20px", padding: "2.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
             
             {!feedback && !loading && (
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                 
                 <div style={{ fontSize: "4rem", marginBottom: "2rem" }}>✨</div>

                 <h3 style={{ margin: "0 0 12px", color: "#111827", fontSize: "1.3rem", fontWeight: "800" }}>Ready for Analysis</h3>
                 <p style={{ margin: "0 0 2rem", color: "#6b7280", fontSize: "0.95rem", maxWidth: "300px", lineHeight: "1.5" }}>Upload your resume to unlock a deep AI evaluation of your profile.</p>

                 <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", maxWidth: "350px" }}>
                   {["ATS Compatibility", "Impact Metrics", "Skill Gaps", "Action Verbs"].map((tag, i) => (
                     <span key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: "20px", fontSize: "0.75rem", color: "#0d9488", fontWeight: "600" }}>
                       {tag}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {loading && (
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                 
                 <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>📄</div>

                 <h3 style={{ margin: "0 0 8px", color: "#111827", fontSize: "1.2rem", fontWeight: "700" }}>Extracting Data...</h3>
                 <p style={{ margin: 0, color: "#14b8a6", fontSize: "0.85rem", fontWeight: "600" }}>Running against ATS criteria</p>
               </div>
             )}

             {feedback && !loading && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "2rem",
                  paddingBottom: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px",
                    background: "rgba(20, 184, 166, 0.08)", 
                    border: "1px solid rgba(20, 184, 166, 0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                    🤖
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>Analysis Complete</h3>
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