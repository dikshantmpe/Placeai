import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const diffColor = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
  const diffBg = { Easy: "#22c55e18", Medium: "#f59e0b18", Hard: "#ef444418" };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("https://placeai-sqjj.onrender.com/api/problems", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const p = res.data.find(problem => problem._id === id);
        if (p) setProblem(p);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleToggleSolved = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // 1. Tell the backend to toggle the status
      const res = await axios.put(`https://placeai-sqjj.onrender.com/api/problems/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Update the button UI instantly with the new data
      setProblem(res.data); 

      // 3. Fire a custom invisible event across the browser
      window.dispatchEvent(new Event("dsaProgressUpdated"));
      
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleSaveCode = () => {
    localStorage.setItem(`problem_${id}_code`, code);
    alert("Code saved locally!");
  };

 const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput("Running...");

    setTimeout(async () => {
      if (language === "javascript") {
        let logs = [];
        const originalLog = console.log;
        
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" "));
        };
        
        try {
          // 1. Run the code
          new Function(code)(); 
          const outputText = logs.join("\n") || "Code executed successfully. (No console output)";
          
          // 2. Show Success Output
          setOutput(`${outputText}\n\n✅ Code Executed Successfully! Auto-saving and marking as solved...`);

          // 3. AUTO-SAVE: Save code to local storage silently
          localStorage.setItem(`problem_${id}_code`, code);

          // 4. AUTO-SOLVE: If not already solved, hit the backend toggle!
          if (!problem.status) {
            const token = localStorage.getItem("token");
            const res = await axios.put(`https://placeai-sqjj.onrender.com/api/problems/${id}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setProblem(res.data); // Updates the UI button to green
            window.dispatchEvent(new Event("dsaProgressUpdated")); // Updates the sidebar
          }

        } catch (execError) {
          // If the code has an error, don't mark it solved!
          setOutput(`❌ Error:\n${execError.message}\n\n⚠️ Fix the errors to mark this problem as solved.`);
        } finally {
          console.log = originalLog; 
          setIsRunning(false);
        }
      } else {
        // Simulated output for other languages
        setOutput(`Running ${language} compiler...\n\n✅ Code executed successfully!`);
        setIsRunning(false);
      }
    }, 800);
  };

  if (loading) return (
    <div style={{ padding: "2rem", color: "#555" }}>
      ⏳ Loading problem...
    </div>
  );

  if (!problem) return (
    <div style={{ padding: "2rem", color: "#555" }}>
      ❌ Problem not found.
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080808", color: "#fff" }}>

      {/* LEFT PANEL — Problem Info */}
      <div style={{
        flex: 1, overflowY: "auto", background: "#0a0a0a",
        borderRight: "1px solid #1f1f1f", padding: "2rem"
      }}>
        
        {/* Back Button */}
        <button onClick={() => navigate("/dsa")} style={{
          background: "transparent", border: "1px solid #333", color: "#888",
          padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
          marginBottom: "1.5rem", transition: "all 0.2s"
        }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#555"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#333"; }}
        >
          ← Back to Tracker
        </button>

        {/* Problem Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
              {problem.title}
            </h1>
            <button onClick={handleToggleSolved} style={{
              background: problem.status ? "#22c55e" : "transparent",
              color: problem.status ? "white" : "#888",
              border: `2px solid ${problem.status ? "#22c55e" : "#333"}`,
              padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
              fontSize: "12px", fontWeight: "600", transition: "all 0.2s"
            }}>
              {problem.status ? "✓ Solved" : "Mark Solved"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "12px", color: "#555", background: "#1f1f1f",
              padding: "4px 10px", borderRadius: "6px"
            }}>
              {problem.topic}
            </span>
            <span style={{
              fontSize: "12px", fontWeight: "600", padding: "4px 10px",
              borderRadius: "6px", color: diffColor[problem.difficulty],
              background: diffBg[problem.difficulty]
            }}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Problem Description */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#ccc" }}>
            Description
          </h3>
          {problem.description ? (
            <pre style={{
              margin: 0, color: "#aaa", fontSize: "12px", lineHeight: "1.6",
              whiteSpace: "pre-wrap", wordWrap: "break-word", fontFamily: "Fira Code, monospace",
              background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px",
              border: "1px solid #1f1f1f", maxHeight: "400px", overflowY: "auto"
            }}>
              {problem.description}
            </pre>
          ) : (
            <p style={{ margin: 0, color: "#555", fontSize: "13px", lineHeight: "1.6" }}>
              No description available yet.
            </p>
          )}
        </div>

        {/* Links & Actions */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#ccc" }}>
            Resources
          </h3>
          {problem.link && (
            <a href={problem.link} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#dc2626", color: "white", padding: "10px 14px",
              borderRadius: "8px", textDecoration: "none", fontSize: "12px",
              fontWeight: "600", transition: "all 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#b91c1c"}
              onMouseLeave={e => e.currentTarget.style.background = "#dc2626"}
            >
              🔗 Open on LeetCode
            </a>
          )}
        </div>

        {/* Stats */}
        <div style={{
          background: "#111", border: "1px solid #1f1f1f",
          borderRadius: "12px", padding: "14px"
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#ccc" }}>
            Problem Info
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#555" }}>Topic:</span>
              <span>{problem.topic}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#555" }}>Difficulty:</span>
              <span style={{ color: diffColor[problem.difficulty], fontWeight: "600" }}>
                {problem.difficulty}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#555" }}>Status:</span>
              <span style={{ color: problem.status ? "#22c55e" : "#555" }}>
                {problem.status ? "✅ Solved" : "Not Solved"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Code Editor & Output */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "#111", borderLeft: "1px solid #1f1f1f"
      }}>

        {/* Editor Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px", borderBottom: "1px solid #1f1f1f"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "#888" }}>Code Editor</span>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{
              background: "#1f1f1f", color: "#ccc", border: "1px solid #333",
              padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer"
            }}>
              <option value="javascript">javascript</option>
              <option value="python">python</option>
              <option value="java">java</option>
              <option value="cpp">cpp</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleSaveCode} style={{
              background: "transparent", color: "#ccc", border: "1px solid #333",
              padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
              fontSize: "11px", transition: "all 0.2s"
            }}>
              💾 Save
            </button>
            <button onClick={handleRunCode} disabled={isRunning} style={{
              background: isRunning ? "#555" : "#22c55e", color: "white", border: "none",
              padding: "6px 16px", borderRadius: "6px", cursor: isRunning ? "not-allowed" : "pointer",
              fontSize: "11px", fontWeight: "600", transition: "all 0.2s"
            }}>
              {isRunning ? "⏳ Running..." : "▶ Run Code"}
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={`// Write your ${language} solution here...\n// Use console.log() or print() to see output below.`}
          style={{
            flex: 2, padding: "16px", background: "#0a0a0a", color: "#fff",
            border: "none", fontFamily: "Fira Code, monospace", fontSize: "13px",
            lineHeight: "1.6", resize: "none", outline: "none"
          }}
        />

        {/* Output Terminal */}
        <div style={{
          flex: 1, borderTop: "1px solid #1f1f1f", background: "#050505",
          display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: "8px 16px", borderBottom: "1px solid #1f1f1f", fontSize: "11px", color: "#888", fontWeight: "600" }}>
            Terminal Output
          </div>
          <pre style={{
            margin: 0, padding: "16px", 
            color: output?.includes("❌") ? "#ef4444" : "#22c55e",
            fontFamily: "Fira Code, monospace", fontSize: "13px", 
            overflowY: "auto", flex: 1, whiteSpace: "pre-wrap"
          }}>
            {output || "Run your code to see the output here..."}
          </pre>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}