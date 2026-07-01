import { useState } from "react";
import axios from "axios";
import { auth } from "./firebase.js"; // Ensure path is correct

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

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
      
      // Fallback AI Feedback if backend is asleep
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
      }, 1500); // Simulate network delay
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
      "STRENGTHS:": "#10b981",    // Brand Emerald
      "WEAKNESSES:": "#f43f5e",   // Brand Rose
      "SUGGESTIONS:": "#f59e0b",  // Brand Amber
      "OVERALL SCORE:": "#7c3aed",// Brand Purple
    };

    return feedback.split("\n").map((line, i) => {
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
            <h3 style={{ color: sectionColors[header], margin: 0, fontSize: "14px",
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
            margin: "8px 0", paddingLeft: "14px"
          }}>
            <span style={{ color: "#ff3f81", marginTop: "2px", fontSize: "14px" }}>▸</span>
            <p style={{ margin: 0, color: "#e2e8f0", fontSize: "14px", lineHeight: "1.7", fontWeight: "400" }}>
              {line.slice(2)}
            </p>
          </div>
        );
      }
      if (line.trim()) {
        return <p key={i} style={{ color: "#e2e8f0", fontSize: "28px", fontWeight: "800", margin: "8px 0", paddingLeft: "14px" }}>{line}</p>;
      }
      return null;
    });
  };

  return (
    <div className="resume-container">
      <style>{`
        .resume-container {
          padding: 1.5rem;
          width: 100%;
          min-width: 0; /* Prevents flexbox overlapping */
          box-sizing: border-box;
          color: white;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-x: hidden;
        }

        .glass-card {
          background: linear-gradient(145deg, rgba(20, 15, 25, 0.7), rgba(10, 8, 15, 0.9));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
        }

        .upload-zone {
          border: 2px dashed rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 4rem 2rem;
          text-align: center;
          background: rgba(255,255,255,0.02);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
        }
        
        .upload-zone:hover {
          border-color: rgba(124,58,237,0.5);
          background: rgba(124,58,237,0.05);
        }

        .upload-zone.drag-over {
          border-color: #ff3f81;
          background: rgba(255,63,129,0.1);
          transform: scale(1.02);
        }

        .upload-zone.has-file {
          border-color: #10b981;
          background: rgba(16,185,129,0.05);
          border-style: solid;
        }

        .brand-btn {
          background: linear-gradient(90deg, #7c3aed, #ff3f81);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(255,63,129,0.3);
          transition: all 0.3s ease;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .brand-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124,58,237,0.4), 0 8px 30px rgba(255,63,129,0.4);
        }

        .brand-btn:disabled {
          background: rgba(255,255,255,0.05);
          color: #6b6b78;
          box-shadow: none;
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.1);
        }

        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Warning Banner */}
      {isDemoMode && (
        <div style={{
          background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.4)",
          color: "#fcd34d", padding: "12px 16px", borderRadius: "12px",
          display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "600"
        }}>
          <span>⚠️</span> 
          <span>Backend offline. Generating demo AI feedback instead.</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "24px", height: "3px", background: "linear-gradient(90deg, #7c3aed, transparent)", borderRadius: "2px" }}></span>
          Resume <span style={{ background: "linear-gradient(90deg, #7c3aed, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Analyzer</span>
        </h2>
        <p style={{ color: "#9b9ba8", margin: 0, fontSize: "14px", fontWeight: "500" }}>Upload your resume and get instant AI-powered feedback.</p>
      </div>

      <div style={{ maxWidth: "800px", width: "100%" }}>
        {/* Upload Area */}
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
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
              <div style={{ fontSize: "56px", marginBottom: "16px", filter: "drop-shadow(0 0 15px rgba(16,185,129,0.4))" }}>📄</div>
              <p style={{ color: "#10b981", fontWeight: "700", fontSize: "16px", margin: "0 0 6px" }}>{file.name}</p>
              <p style={{ color: "#9b9ba8", fontSize: "13px", margin: 0, fontWeight: "500" }}>
                {(file.size / 1024).toFixed(1)} KB · Click to swap file
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "56px", marginBottom: "16px", opacity: 0.8 }}>📁</div>
              <p style={{ color: "#e2e8f0", fontWeight: "700", fontSize: "16px", margin: "0 0 8px" }}>
                Drag & Drop your resume here
              </p>
              <p style={{ color: "#6b6b78", fontSize: "14px", margin: "0 0 20px" }}>
                or click to browse your files
              </p>
              <span style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#9b9ba8", padding: "8px 20px", borderRadius: "10px", fontSize: "12px", fontWeight: "600"
              }}>
                PDF format only
              </span>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <div style={{ marginTop: "1.5rem" }}>
          <button onClick={handleUpload} disabled={loading || !file} className="brand-btn">
            {loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: "18px" }}>⟳</span>
                Processing with AI...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Results */}
      {feedback && (
        <div className="glass-card" style={{ marginTop: "1rem", padding: "2rem", maxWidth: "800px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem",
            paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(255,63,129,0.2))", 
              border: "1px solid rgba(124,58,237,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
              boxShadow: "0 0 20px rgba(124,58,237,0.2)" }}>
              🤖
            </div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "#e2e8f0" }}>AI Feedback Report</h3>
              <p style={{ margin: 0, color: "#a78bfa", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>Powered by Gemini</p>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {renderFeedback()}
          </div>
        </div>
      )}
    </div>
  );
}