import { useState } from "react";
import axios from "axios";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF first!");
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    setFeedback("");
    try {
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/resume/analyze", formData);
      setFeedback(res.data.feedback);
    } catch (err) {
      alert("Error analyzing resume. Try again.");
    }
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const renderFeedback = () => {
    const sectionColors = {
      "STRENGTHS:": "#22c55e",
      "WEAKNESSES:": "#ef4444",
      "SUGGESTIONS:": "#f59e0b",
      "OVERALL SCORE:": "#dc2626",
    };

    return feedback.split("\n").map((line, i) => {
      const header = Object.keys(sectionColors).find(h => line.startsWith(h));
      if (header) {
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginTop: "1.5rem", marginBottom: "8px"
          }}>
            <div style={{
              width: "4px", height: "20px", borderRadius: "2px",
              background: sectionColors[header]
            }} />
            <h3 style={{ color: sectionColors[header], margin: 0, fontSize: "14px",
              fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {line}
            </h3>
          </div>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            margin: "6px 0", paddingLeft: "12px"
          }}>
            <span style={{ color: "#dc2626", marginTop: "2px", fontSize: "12px" }}>▸</span>
            <p style={{ margin: 0, color: "#bbb", fontSize: "14px", lineHeight: "1.6" }}>
              {line.slice(2)}
            </p>
          </div>
        );
      }
      if (line.trim()) {
        return <p key={i} style={{ color: "#888", fontSize: "14px", margin: "4px 0" }}>{line}</p>;
      }
      return null;
    });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}>Resume Analyzer</h2>
        <p style={{ color: "#555", margin: 0, fontSize: "14px" }}>Upload your resume and get instant AI-powered feedback.</p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? "#dc2626" : file ? "#22c55e" : "#2a2a2a"}`,
          borderRadius: "16px", padding: "3rem 2rem", textAlign: "center",
          marginBottom: "1.5rem", background: dragOver ? "rgba(220,38,38,0.05)" : file ? "rgba(34,197,94,0.05)" : "#111",
          transition: "all 0.2s", cursor: "pointer"
        }}
        onClick={() => document.getElementById("resumeInput").click()}
      >
        <input id="resumeInput" type="file" accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }} />

        {file ? (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📄</div>
            <p style={{ color: "#22c55e", fontWeight: "600", fontSize: "15px", margin: "0 0 4px" }}>{file.name}</p>
            <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
              {(file.size / 1024).toFixed(1)} KB · Click to change
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
            <p style={{ color: "#aaa", fontWeight: "600", fontSize: "15px", margin: "0 0 8px" }}>
              Drop your resume here
            </p>
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 16px" }}>
              or click to browse files
            </p>
            <span style={{
              background: "#1f1f1f", border: "1px solid #2a2a2a",
              color: "#888", padding: "6px 16px", borderRadius: "8px", fontSize: "12px"
            }}>
              PDF files only
            </span>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button onClick={handleUpload} disabled={loading || !file} style={{
        background: loading ? "#1f1f1f" : "#dc2626",
        color: loading ? "#555" : "white",
        padding: "12px 32px", borderRadius: "10px", border: "none",
        cursor: loading || !file ? "not-allowed" : "pointer",
        fontSize: "14px", fontWeight: "600", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        transition: "all 0.2s", boxShadow: !loading && file ? "0 4px 20px rgba(220,38,38,0.3)" : "none"
      }}>
        {loading ? (
          <>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Analyzing your resume...
          </>
        ) : (
          <> 🔍 Analyze Resume </>
        )}
      </button>

      {/* Feedback */}
      {feedback && (
        <div style={{
          marginTop: "2rem", background: "#111", border: "1px solid #1f1f1f",
          borderRadius: "16px", padding: "1.5rem 2rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem",
            paddingBottom: "1rem", borderBottom: "1px solid #1f1f1f" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px",
              background: "#dc262618", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px" }}>🤖</div>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>AI Feedback</h3>
              <p style={{ margin: 0, color: "#555", fontSize: "12px" }}>Powered by Gemini AI</p>
            </div>
          </div>
          {renderFeedback()}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}