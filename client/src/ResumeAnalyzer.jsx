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
  const [showResultModal, setShowResultModal] = useState(false);

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

  const [loadingMessage, setLoadingMessage] = useState("Extracting text from file...");
  const [cancelRequest, setCancelRequest] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF or DOCX first!");
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    setCancelRequest(false);
    setFeedback("");
    setIsDemoMode(false);
    setLoadingMessage("Extracting text from file...");

    try {
      let token = localStorage.getItem("token");
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setLoadingMessage("Request timed out. Retrying with demo...");
      }, 60000);

      setTimeout(() => {
        if (!cancelRequest) setLoadingMessage("Processing file with AI...");
      }, 3000);

      setTimeout(() => {
        if (!cancelRequest) setLoadingMessage("Analyzing with Cohere API...");
      }, 6000);

      const res = await axios.post(
        "https://placeai-sqjj.onrender.com/api/resume/analyze",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 65000,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      setFeedback(res.data.feedback);
      setLoading(false);
      setShowResultModal(true);
    } catch (err) {
      console.error("❌ Error:", err.message || err);

      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        alert("⏱️ Request timed out. The AI server is taking too long. Please try again.");
        setLoading(false);
        return;
      }

      if (err.message.includes("Network Error") || !navigator.onLine) {
        alert("🌐 Network error. Please check your internet connection.");
        setLoading(false);
        return;
      }

      if (err.response?.status === 401) {
        alert("🔐 Authentication error. Please log in again.");
        setLoading(false);
        return;
      }

      console.warn("Backend unavailable. Switching to demo mode...");
      setIsDemoMode(true);
      setLoadingMessage("Backend offline, loading demo analysis...");

      setTimeout(() => {
        setFeedback(`OVERALL SCORE:
72/100

STRENGTHS:
- Professional presentation
- Good technical foundation

WEAKNESSES:
- Could improve quantification of achievements
- Limited project metrics shown

SUGGESTIONS:
- Add specific numbers/metrics to projects
- Include links to work samples
- Highlight leadership or team collaboration`);
        setLoading(false);
        setShowResultModal(true);
      }, 1500);
    }
  };

  const handleCancel = () => {
    setCancelRequest(true);
    setLoading(false);
    setFeedback("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.type.includes("word"))) {
      setFile(dropped);
    }
  };

  const renderFeedback = () => {
    const sectionColors = {
      "STRENGTHS:": "#18775e",
      "WEAKNESSES:": "#b53d45",
      "SUGGESTIONS:": "#9a6514",
    };

    return feedback.split("\n").map((line, i) => {
      if (line.match(/^\d+\/100$/)) {
        return (
          <div key={i} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: '#eaf3ff', 
            border: '1px solid #d1e0f5', borderRadius: '12px', 
            padding: '2rem', marginBottom: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#10264a', lineHeight: "1" }}>
                {line.split('/')[0]}
              </span>
              <span style={{ fontSize: '1.2rem', color: '#657287', fontWeight: '600' }}>/100</span>
              <p style={{ margin: '12px 0 0', color: '#1769e0', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '2px' }}>
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
            marginTop: "1.8rem", marginBottom: "12px"
          }}>
            <div style={{
              width: "4px", height: "20px", borderRadius: "2px",
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
            <span style={{ color: "#1769e0", marginTop: "2px", fontSize: "0.85rem" }}>▸</span>
            <p style={{ margin: 0, color: "#172033", fontSize: "0.95rem", lineHeight: "1.6", fontWeight: "500" }}>
              {line.slice(2)}
            </p>
          </div>
        );
      }

      if (line.trim()) {
        return <p key={i} style={{ color: "#172033", fontSize: "0.95rem", lineHeight: "1.6", margin: "8px 0" }}>{line}</p>;
      }
      return null;
    });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div style={{
      flex: 1,
      minHeight: "100vh",
      position: "relative",
      padding: "24px 22px",
      color: "#172033",
      fontFamily: "Inter, system-ui, sans-serif",
      overflowY: "auto",
      overflowX: "hidden",
      background: "#f3f2ef",
      fontSize: "14px",
      lineHeight: "1.5"
    }}>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f3f2ef;
        }
        ::-webkit-scrollbar-thumb {
          background: #dedbd5;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #b8b3ab;
        }
        ::-webkit-scrollbar-corner {
          background: #f3f2ef;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: #dedbd5 #f3f2ef;
        }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>

      <div style={{ maxWidth: "1440px", margin: "0 auto", position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "18px" }}>

        {isDemoMode && (
          <div style={{
            background: "#fff1cf",
            border: "1px solid #f0d080",
            borderRadius: "12px",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{ background: "rgba(154, 101, 20, 0.1)", padding: "8px", borderRadius: "8px", color: "#9a6514", fontWeight: "800" }}>⚠️</div> 
            <div>
              <h4 style={{ margin: "0 0 4px 0", color: "#765010", fontSize: "1rem", fontWeight: "700" }}>Demo Mode Active</h4>
              <p style={{ margin: 0, color: "#9a6514", fontSize: "0.85rem" }}>Backend offline. Generating demo AI feedback instead.</p>
            </div>
          </div>
        )}

        {/* Hero Section - Upload + Settings */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: "18px" }}>

          {/* Upload Panel */}
          <div style={{ background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27, 46, 76, 0.05)", padding: "27px" }}>
            <span style={{ fontSize: "11px", fontWeight: "850", letterSpacing: "0.11em", color: "#1769e0", textTransform: "uppercase" }}>AI-POWERED RESUME REVIEW</span>
            <h1 style={{ fontSize: "34px", lineHeight: "1.13", margin: "8px 0", color: "#10264a", fontWeight: "700" }}>Make your resume easier to notice—and harder to reject.</h1>
            <p style={{ color: "#657287", margin: "0 0 22px 0" }}>Check ATS compatibility, role-specific keywords, skills coverage, structure, and readability.</p>

            <div
              style={{ 
                minHeight: "270px",
                border: `2px dashed ${dragOver ? "#1769e0" : file ? "#18775e" : "#aab7c8"}`,
                borderRadius: "14px",
                background: dragOver ? "#f5f9ff" : file ? "rgba(24, 119, 94, 0.04)" : "#fbfcfe",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                padding: "25px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("resumeInput").click()}
            >
              <input id="resumeInput" type="file" accept=".pdf,.docx,.doc"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }} />

              {file ? (
                <div>
                  <div style={{ width: "68px", height: "68px", margin: "0 auto 16px", borderRadius: "20px", background: "#eaf3ff", color: "#1769e0", display: "grid", placeItems: "center", fontSize: "30px", fontWeight: "700" }}>✓</div>
                  <h2 style={{ color: "#18775e", fontWeight: "700", fontSize: "1.1rem", margin: "0 0 8px" }}>{file.name}</h2>
                  <p style={{ color: "#657287", fontSize: "0.9rem", margin: 0, fontWeight: "500" }}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB · Click to swap file
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ width: "68px", height: "68px", margin: "0 auto 16px", borderRadius: "20px", background: "#eaf3ff", color: "#1769e0", display: "grid", placeItems: "center", fontSize: "30px" }}>⇧</div>
                  <h2 style={{ color: "#172033", fontWeight: "700", fontSize: "1.3rem", margin: "0 0 8px" }}>
                    Drop your resume here
                  </h2>
                  <p style={{ color: "#657287", fontSize: "0.95rem", margin: "0 0 24px" }}>
                    or select a document from your device
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); document.getElementById("resumeInput").click(); }}
                    style={{
                      border: "0",
                      background: "#1769e0",
                      color: "#fff",
                      padding: "11px 17px",
                      borderRadius: "99px",
                      fontWeight: "750",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Browse files
                  </button>
                  <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "center", marginTop: "14px" }}>
                    {["PDF", "DOCX", "Maximum 100 MB"].map((tag, i) => (
                      <span key={i} style={{ fontSize: "11px", padding: "5px 8px", borderRadius: "99px", border: "1px solid #dedbd5", color: "#657287" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {file && (
              <div style={{ marginTop: "13px", padding: "12px", border: "1px solid #dedbd5", borderRadius: "9px" }}>
                <b>{file.name}</b>
                <span style={{ color: "#657287" }}> · {(file.size / (1024 * 1024)).toFixed(1)} MB · Ready to analyze</span>
                <div style={{ height: "7px", background: "#e8edf3", borderRadius: "99px", overflow: "hidden", marginTop: "7px" }}>
                  <span style={{ display: "block", height: "100%", width: "100%", background: "#1769e0", borderRadius: "99px" }}></span>
                </div>
              </div>
            )}

            <div style={{ marginTop: "9px", padding: "10px", background: "#fff1cf", color: "#765010", borderRadius: "8px", fontSize: "12px" }}>
              Unsupported formats and documents larger than 100 MB will be rejected before analysis.
            </div>
          </div>

          {/* Analysis Settings Panel */}
          <div style={{ background: "#fff", border: "1px solid #dedbd5", borderRadius: "12px", boxShadow: "0 12px 34px rgba(27, 46, 76, 0.05)", padding: "27px" }}>
            <span style={{ fontSize: "11px", fontWeight: "850", letterSpacing: "0.11em", color: "#1769e0", textTransform: "uppercase" }}>ANALYSIS SETTINGS</span>
            <h2 style={{ color: "#10264a", fontSize: "1.5rem", fontWeight: "700", margin: "8px 0" }}>Choose what to inspect</h2>
            <p style={{ color: "#657287", margin: "0 0 18px 0" }}>Adjust the scan before starting your analysis.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#f6f7f9", padding: "4px", border: "1px solid #dedbd5", borderRadius: "10px", margin: "18px 0" }}>
              <label style={{ textAlign: "center", padding: "10px", borderRadius: "7px", fontWeight: "700", cursor: "pointer", background: "transparent", color: "#657287" }}>
                <input type="radio" name="depth" style={{ position: "absolute", opacity: 0 }} />
                Quick Scan
              </label>
              <label style={{ textAlign: "center", padding: "10px", borderRadius: "7px", fontWeight: "700", cursor: "pointer", background: "#fff", color: "#1769e0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <input type="radio" name="depth" defaultChecked style={{ position: "absolute", opacity: 0 }} />
                Deep Analysis
              </label>
            </div>

            <div style={{ display: "grid", gap: "7px" }}>
              {[
                { title: "Keyword optimization", desc: "Compare terminology and role relevance." },
                { title: "Skills gap identification", desc: "Find missing technical and soft skills." },
                { title: "Formatting assessment", desc: "Review hierarchy and consistency." },
                { title: "ATS compatibility score", desc: "Flag parsing and screening risks." },
                { title: "Readability metrics", desc: "Measure clarity and information density." },
              ].map((item, i) => (
                <label key={i} style={{ display: "flex", gap: "9px", padding: "9px", border: "1px solid #dedbd5", borderRadius: "8px", cursor: "pointer", alignItems: "flex-start" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "#1769e0", marginTop: "2px" }} />
                  <span>
                    <b style={{ color: "#172033", fontSize: "14px" }}>{item.title}</b>
                    <small style={{ display: "block", color: "#657287", fontSize: "12px" }}>{item.desc}</small>
                  </span>
                </label>
              ))}
            </div>

            <p style={{ margin: "16px 0 8px 0" }}><b>Target job description</b> <span style={{ color: "#657287" }}>(optional)</span></p>
            <textarea 
              placeholder="Paste a job description here for role-specific comparison…"
              style={{ width: "100%", minHeight: "120px", border: "1px solid #dedbd5", borderRadius: "9px", padding: "11px", resize: "vertical", fontFamily: "inherit", fontSize: "14px" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "13px" }}>
              <small style={{ color: "#657287" }}>
                {loading ? loadingMessage : "Deep analysis: ~30 sec"}
              </small>
              <div style={{ display: "flex", gap: "8px" }}>
                {loading && (
                  <button 
                    onClick={handleCancel} 
                    style={{
                      border: "1px solid #dedbd5",
                      background: "#fff",
                      color: "#657287",
                      padding: "11px 17px",
                      borderRadius: "99px",
                      fontWeight: "750",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleUpload} 
                  disabled={loading || !file} 
                  style={{
                    border: loading || !file ? "1px solid #dedbd5" : "0",
                    background: loading || !file ? "#f6f7f9" : "#1769e0",
                    color: loading || !file ? "#657287" : "#fff",
                    padding: "11px 17px",
                    borderRadius: "99px",
                    fontWeight: "750",
                    cursor: loading || !file ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "1rem" }}>⟳</span>
                      {loadingMessage.split("...")[0]}...
                    </>
                  ) : (
                    <>
                      Analyze resume →
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- LOADING MODAL OVERLAY --- */}
        {loading && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(16, 38, 74, 0.7)",
            backdropFilter: "blur(5px)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999,
            padding: "20px"
          }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", maxWidth: "400px", width: "100%", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
              <div style={{ width: "68px", height: "68px", margin: "0 auto 16px", borderRadius: "20px", background: "#eaf3ff", color: "#1769e0", display: "grid", placeItems: "center", fontSize: "30px", animation: "spin 2s linear infinite" }}>⟳</div>
              <h3 style={{ margin: "0 0 8px", color: "#10264a", fontSize: "1.2rem", fontWeight: "700" }}>{loadingMessage}</h3>
              <p style={{ margin: 0, color: "#1769e0", fontSize: "0.85rem", fontWeight: "600" }}>Running against ATS criteria...</p>
            </div>
          </div>
        )}

        {/* --- COMPREHENSIVE RESULT MODAL OVERLAY --- */}
        {showResultModal && feedback && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(16, 38, 74, 0.7)",
            backdropFilter: "blur(5px)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999,
            padding: "20px"
          }}>
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden"
            }}>
              
              {/* Modal Header */}
              <div style={{ 
                padding: "24px 32px", 
                borderBottom: "1px solid #dedbd5", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                backgroundColor: "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eaf3ff", border: "1px solid #d1e0f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🤖</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#10264a", fontWeight: "800" }}>Analysis Complete</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setShowResultModal(false)}
                  style={{ background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#aab7c8", lineHeight: "1" }}
                  onMouseOver={(e) => e.target.style.color = '#172033'}
                  onMouseOut={(e) => e.target.style.color = '#aab7c8'}
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div style={{ padding: "32px", overflowY: "auto", backgroundColor: "#fff" }}>
                {renderFeedback()}
              </div>

              {/* Modal Footer */}
              <div style={{ 
                padding: "20px 32px", 
                borderTop: "1px solid #dedbd5", 
                backgroundColor: "#fbfcfe", 
                display: "flex", 
                justifyContent: "flex-end",
                gap: "12px"
              }}>
                <button 
                  onClick={() => setShowResultModal(false)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#fff",
                    color: "#172033",
                    border: "1px solid #dedbd5",
                    borderRadius: "99px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowResultModal(false)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#1769e0",
                    color: "white",
                    border: "none",
                    borderRadius: "99px",
                    fontSize: "14px",
                    fontWeight: "750",
                    cursor: "pointer"
                  }}
                >
                  Apply Suggested Fixes ✦
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}