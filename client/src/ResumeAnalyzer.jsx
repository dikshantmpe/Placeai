import { useState } from "react";
import axios from "axios";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF first!");
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    setFeedback("");
    try {
      const res = await axios.post("http://localhost:5000/api/resume/analyze", formData);
      setFeedback(res.data.feedback);
    } catch (err) {
      alert("Error analyzing resume. Try again.");
    }
    setLoading(false);
  };

  const renderFeedback = () => {
    return feedback.split("\n").map((line, i) => {
      if (["STRENGTHS:", "WEAKNESSES:", "SUGGESTIONS:", "OVERALL SCORE:"].some(h => line.startsWith(h))) {
        return <h3 key={i} style={{ color: "#4f46e5", marginTop: "1.2rem" }}>{line}</h3>;
      }
      if (line.startsWith("- ")) {
        return <p key={i} style={{ margin: "4px 0", paddingLeft: "1rem" }}>• {line.slice(2)}</p>;
      }
      return null;
    });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Resume Analyzer</h2>
      <p style={{ color: "#666" }}>Upload your resume and get instant AI feedback.</p>

      <div style={{ border: "2px dashed #4f46e5", borderRadius: "12px", padding: "2rem", textAlign: "center", marginBottom: "1rem" }}>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        {file && <p style={{ marginTop: "8px", color: "#4f46e5" }}>📄 {file.name}</p>}
      </div>

      <button onClick={handleUpload} disabled={loading}
        style={{ background: "#4f46e5", color: "white", padding: "10px 24px",
          borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "16px" }}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {feedback && (
        <div style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1.5rem", borderRadius: "12px" }}>
          <h3 style={{ marginTop: 0 }}>AI Feedback</h3>
          {renderFeedback()}
        </div>
      )}
    </div>
  );
}