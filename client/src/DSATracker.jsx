import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import Editor from "@monaco-editor/react";

const DSATracker = () => {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalAttempted: 0,
    currentStreak: 0,
    thisWeekSolved: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [openTopic, setOpenTopic] = useState(-1);
  const [showModal, setShowModal] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("crackin-theme") || "light");
  const [loading, setLoading] = useState(true);

  // States for the IDE
  const [code, setCode] = useState("// Write your solution here...\n");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [solutionStatus, setSolutionStatus] = useState("pending");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    link: "",
    topic: "Arrays",
    difficulty: "Medium",
    status: "Pending",
    timeSpent: "",
    notes: "",
    description: "",
  });

  const auth = getAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  // All available topics
  const allTopicsForDropdown = [
    "Arrays",
    "Strings",
    "Linked Lists",
    "Stacks",
    "Queues",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Sorting",
    "Searching",
    "Hash Tables",
    "Heaps",
    "Greedy",
    "Recursion",
    "Backtracking",
  ];

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, []);

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark" : "";
    localStorage.setItem("crackin-theme", theme);
  }, [theme]);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (selectedTopic) params.append("topic", selectedTopic);
      if (difficulty) params.append("difficulty", difficulty);
      if (status) params.append("status", status);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`${API_BASE_URL}/api/dsa/problems?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch problems");
      const data = await response.json();
      
      // Handle both array and object responses
      const problemsData = Array.isArray(data) ? data : data.topics || [];
      setTopics(problemsData);
    } catch (error) {
      console.error("Error fetching problems:", error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/dsa/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.stats || data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdateProblem = async (problemId, problemData) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/dsa/problems/${problemId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(problemData),
      });

      if (!response.ok) throw new Error("Failed to update problem");
      
      // Update local state
      if (selectedProblem && selectedProblem._id === problemId) {
        setSelectedProblem({ ...selectedProblem, ...problemData });
      }
      
      fetchProblems();
      fetchStats();
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("Failed to update problem. Try again.");
    }
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/dsa/problems/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          timeSpent: parseInt(formData.timeSpent) || 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to add problem");

      setFormData({
        name: "",
        link: "",
        topic: "Arrays",
        difficulty: "Medium",
        status: "Pending",
        timeSpent: "",
        notes: "",
        description: "",
      });
      setShowModal("");
      fetchProblems();
      alert("Problem added successfully!");
    } catch (error) {
      console.error("Error adding problem:", error);
      alert("Failed to add problem. Try again.");
    }
  };

  // ✅ RUN CODE - Execute JavaScript locally or call backend
  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("❌ Error: Code is empty. Please write some code first.");
      return;
    }

    setIsRunning(true);
    setOutput("⏳ Running...\n");

    try {
      if (language === "javascript") {
        // Execute JavaScript directly in browser
        const capturedOutput = [];
        
        // Override console.log temporarily
        const originalLog = console.log;
        console.log = (...args) => {
          capturedOutput.push(args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg, null, 2);
            }
            return String(arg);
          }).join(' '));
        };

        try {
          // Create a function and execute it
          const func = new Function(code);
          const result = func();
          
          if (result !== undefined) {
            capturedOutput.push(String(result));
          }

          const finalOutput = capturedOutput.length > 0 
            ? capturedOutput.join('\n') 
            : "✓ Code executed successfully (no output)";

          setOutput(finalOutput);
          setSolutionStatus("solved");
          setTestResults([{ status: "passed", message: "Code executed successfully" }]);
        } catch (err) {
          setOutput(`❌ Error: ${err.message}\n\nStack: ${err.stack}`);
          setSolutionStatus("pending");
          setTestResults([{ status: "failed", message: err.message }]);
        } finally {
          console.log = originalLog;
        }
      } else {
        // For other languages, call backend
        const token = await getAuthToken();
        if (!token) {
          setOutput("❌ Authentication error. Please log in again.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/dsa/run-code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code,
            language,
            problemId: selectedProblem?._id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setOutput(`❌ Error: ${data.error || "Failed to execute code"}`);
          setSolutionStatus("pending");
          setTestResults([{ status: "failed", message: data.error }]);
        } else {
          setOutput(data.output || "✓ Code executed successfully");
          setSolutionStatus(data.status || "pending");
          setTestResults(data.testResults || []);
        }
      }
    } catch (error) {
      console.error("Error running code:", error);
      setOutput(`❌ Error: ${error.message}`);
      setSolutionStatus("pending");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = () => {
    if (!selectedProblem) {
      alert("❌ Error: No problem selected. Please select a problem first.");
      return;
    }

    if (!selectedProblem._id) {
      alert("❌ Error: Problem ID is missing. Please reload and try again.");
      return;
    }
    
    saveCodeToDatabase(code, output, solutionStatus, testResults);
  };

  const saveCodeToDatabase = async (codeContent, outputContent, status, results) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        alert("Authentication error. Please log in again.");
        return;
      }

      const requestUrl = `${API_BASE_URL}/api/dsa/problems/${selectedProblem._id}/save-code`;
      const requestBody = {
        code: codeContent,
        output: outputContent,
        status,
        testResults: results,
        solvedAt: status === "solved" ? new Date() : null
      };

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save code");
      }

      alert("✓ Code saved successfully!");
      fetchProblems();
      fetchStats();
    } catch (error) {
      console.error("Error saving code:", error);
      alert(`Failed to save code: ${error.message}`);
    }
  };

  const openProblemWorkspace = (problem) => {
    setSelectedProblem(problem);
    setCode("// Write your solution here...\n");
    setOutput("");
    setSolutionStatus(problem.status?.toLowerCase() === "solved" ? "solved" : "pending");
    setTestResults([]);
    setShowModal("workspace");
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading DSA Tracker...</div>;
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", padding: "20px" }}>
        <main>
          <section>
            <h2>DSA Problems</h2>
            
            {/* Filters */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", flex: 1, minWidth: "200px" }}
              />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="">All Topics</option>
                {allTopicsForDropdown.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Solved">Solved</option>
                <option value="Revision Needed">Revision Needed</option>
              </select>
              <button 
                onClick={fetchProblems}
                style={{ padding: "8px 16px", background: "#667eea", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Filter
              </button>
            </div>

            {/* Problems List */}
            {topics.length === 0 ? (
              <p>No problems found. Add one to get started!</p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {topics.map(problem => (
                  <div 
                    key={problem._id}
                    style={{
                      padding: "15px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      background: "#f9f9f9"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div>
                        <h3 style={{ margin: "0 0 5px 0" }}>{problem.name}</h3>
                        <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "#666" }}>
                          <span>📚 {problem.topic}</span>
                          <span>Level: {problem.difficulty}</span>
                          <span>Status: {problem.status}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => openProblemWorkspace(problem)}
                        style={{
                          padding: "8px 16px",
                          background: "#667eea",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Open IDE
                      </button>
                      {problem.link && (
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "8px 16px",
                            background: "#f0f0f0",
                            color: "#333",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            cursor: "pointer",
                            textDecoration: "none"
                          }}
                        >
                          View on LeetCode
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Sidebar */}
        <aside>
          <div style={{ padding: "15px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
            <h3>📊 Quick Stats</h3>
            <p><strong>Solved:</strong> {stats.totalSolved}</p>
            <p><strong>Attempted:</strong> {stats.totalAttempted}</p>
            <p><strong>This Week:</strong> {stats.thisWeekSolved}</p>
            <p><strong>Streak:</strong> {stats.currentStreak} 🔥</p>
            <button
              onClick={() => setShowModal("add")}
              style={{
                width: "100%",
                padding: "10px",
                background: "#667eea",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              + Add Problem
            </button>
          </div>
        </aside>
      </div>

      {/* Add Problem Modal */}
      {showModal === "add" && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowModal("")}
        >
          <div 
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 20px 0" }}>Add New Problem</h2>
            <form onSubmit={handleAddProblem} style={{ display: "grid", gap: "15px" }}>
              <div>
                <label>Problem Name *</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Two Sum"
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label>Problem Link</label>
                <input 
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})} 
                  placeholder="https://leetcode.com/..."
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label>Topic *</label>
                <select 
                  value={formData.topic} 
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
                >
                  {allTopicsForDropdown.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label>Difficulty *</label>
                <select 
                  value={formData.difficulty} 
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label>Description (Optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Paste problem description here..."
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", minHeight: "100px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal("")}
                  style={{ flex: 1, padding: "10px", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: "10px", background: "#667eea", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
                >
                  Add Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Workspace Modal */}
      {showModal === "workspace" && selectedProblem && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowModal("")}
        >
          <div 
            style={{
              background: "#1e1e1e",
              borderRadius: "8px",
              width: "95%",
              height: "95vh",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Problem Panel */}
            <div style={{ padding: "20px", overflowY: "auto", borderRight: "1px solid #333", background: "#fff", color: "#000" }}>
              <button 
                onClick={() => setShowModal("")}
                style={{ float: "right", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
              >
                ×
              </button>
              <h2 style={{ margin: "0 0 10px 0" }}>{selectedProblem.name}</h2>
              <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <span style={{ background: "#667eea", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                  {selectedProblem.difficulty}
                </span>
                <span style={{ background: "#f0f0f0", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                  {selectedProblem.topic}
                </span>
              </div>
              <h3>Description</h3>
              <p>{selectedProblem.description || "No description provided."}</p>

              <h3>Update Status</h3>
              <select
                value={selectedProblem.status}
                onChange={(e) => handleUpdateProblem(selectedProblem._id, { status: e.target.value })}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%", marginBottom: "10px" }}
              >
                <option>Pending</option>
                <option>Solved</option>
                <option>Revision Needed</option>
              </select>
            </div>

            {/* Code Panel */}
            <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", background: "#1e1e1e", color: "#fff" }}>
              {/* Toolbar */}
              <div style={{ display: "flex", gap: "10px", padding: "10px", borderBottom: "1px solid #333", background: "#2d2d2d", alignItems: "center" }}>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ background: "#333", color: "#fff", border: "1px solid #555", padding: "5px 10px", borderRadius: "4px" }}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <div style={{ flex: 1 }}></div>
                <button 
                  onClick={handleSaveCode}
                  style={{ background: "#555", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                >
                  💾 Save Code
                </button>
                <button 
                  onClick={handleRunCode}
                  disabled={isRunning}
                  style={{ background: "#667eea", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: isRunning ? "not-allowed" : "pointer", opacity: isRunning ? 0.6 : 1 }}
                >
                  {isRunning ? "⏳ Running..." : "▶ Run Code"}
                </button>
                <button 
                  onClick={() => setShowModal("")}
                  style={{ background: "none", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer" }}
                >
                  ×
                </button>
              </div>

              {/* Editor */}
              <div>
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 15 }
                  }}
                />
              </div>

              {/* Console Output */}
              <div style={{ padding: "10px", background: "#000", borderTop: "1px solid #333", maxHeight: "150px", overflowY: "auto", fontFamily: "monospace", fontSize: "12px" }}>
                <div style={{ color: "#888", marginBottom: "5px" }}>
                  📤 Output:
                  {solutionStatus === "solved" && <span style={{ color: "#10b981", marginLeft: "10px" }}>✓ SOLVED</span>}
                  {solutionStatus === "pending" && testResults.length > 0 && <span style={{ color: "#ef4444", marginLeft: "10px" }}>✗ ERROR</span>}
                </div>
                <pre style={{ margin: 0, color: "#0f0" }}>{output || "Click 'Run Code' to execute..."}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSATracker;