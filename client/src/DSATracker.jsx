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
      setTopics(data.topics || []);
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
      setStats(data.stats);
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
        solvedAt: status === "Solved" ? new Date() : null
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
      console.error("❌ Error saving code:", error);
      alert(`Failed to save code: ${error.message}`);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("❌ Error: Code is empty. Please write some code first.");
      return;
    }

    setOutput("Running tests...\n");
    setSolutionStatus("pending");
    setTestResults([]);
    setIsRunning(true);

    if (language === "javascript") {
      try {
        // Fetch test cases directly from the database problem object
        const testCases = selectedProblem?.testCases;

        if (!testCases || testCases.length === 0) {
          setOutput("⚠️ No test cases found for this problem. Please ensure test cases exist in your database.");
          setSolutionStatus("pending");
          setIsRunning(false);
          return;
        }

        let allTestsPassed = true;
        let results = [];
        let outputText = "";

        // Extract function name dynamically
        const functionMatch = code.match(/(?:function|const)\s+(\w+)\s*(?:\(|=)/);
        const functionName = functionMatch ? functionMatch[1] : null;

        if (!functionName) {
          setOutput("❌ ERROR: Could not find function definition.\nMake sure your code has a standard function wrapper (e.g., function mySolution() { ... })");
          setSolutionStatus("pending");
          setIsRunning(false);
          return;
        }

        const contextCode = `${code}\nreturn ${functionName};`;
        const userFunction = new Function(contextCode)();

        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i];
          try {
            // Dynamically grab all arguments from the input object 
            const args = Object.values(testCase.input);
            
            // Execute the function dynamically with spread syntax
            const result = userFunction(...args);
            const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);

            results.push({
              testNum: i + 1,
              passed,
              input: testCase.input,
              expected: testCase.expected,
              output: result
            });

            // Dynamically print the inputs without hardcoding names
            const inputString = Object.entries(testCase.input)
              .map(([key, val]) => `${key} = ${JSON.stringify(val)}`)
              .join(", ");

            outputText += `Test ${i + 1}: ${passed ? "✓ PASSED" : "✗ FAILED"}\n`;
            outputText += `  Input: ${inputString}\n`;
            outputText += `  Expected: ${JSON.stringify(testCase.expected)}\n`;
            outputText += `  Got: ${JSON.stringify(result)}\n\n`;

            if (!passed) allTestsPassed = false;
          } catch (err) {
            allTestsPassed = false;
            
            const inputString = Object.entries(testCase.input)
              .map(([key, val]) => `${key} = ${JSON.stringify(val)}`)
              .join(", ");

            results.push({
              testNum: i + 1,
              passed: false,
              input: testCase.input,
              error: err.message
            });

            outputText += `Test ${i + 1}: ✗ ERROR\n`;
            outputText += `  Input: ${inputString}\n`;
            outputText += `  Error: ${err.message}\n\n`;
          }
        }

        if (allTestsPassed) {
          outputText += "\n🎉 All tests passed! Your solution is CORRECT!";
          setSolutionStatus("solved");
          setOutput(outputText);
          setTestResults(results);
          
          // AUTO-SAVE when all tests pass
          setTimeout(() => {
            saveCodeToDatabase(code, outputText, "Solved", results);
          }, 500);
        } else {
          outputText += "\n❌ Some tests failed. Please fix your solution.";
          setSolutionStatus("pending");
          setOutput(outputText);
          setTestResults(results);
        }
      } catch (error) {
        setOutput(`❌ Runtime Error:\n${error.message}`);
        setSolutionStatus("pending");
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // For other languages, call backend
    try {
      const token = await getAuthToken();
      if (!token) {
        setOutput("❌ Authentication error. Please log in again.");
        setIsRunning(false);
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

        // AUTO-SAVE for other languages if all tests passed
        if (data.status === "Solved") {
          setTimeout(() => {
            saveCodeToDatabase(code, data.output, "Solved", data.testResults || []);
          }, 500);
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

  const resetFilters = () => {
    setSearchQuery("");
    setDifficulty("");
    setStatus("");
    setSelectedTopic("");
    setOpenTopic(-1);
  };

  const filteredTopics = topics.filter(
    (t) => !selectedTopic || t.topic === selectedTopic
  );

  const allTopicsForDropdown = [
    "Arrays", "Linked List", "Stack", "Queue", "Trees", "Graphs",
    "DP", "Greedy", "Backtracking", "Bit Manipulation",
    "Math", "String", "Hash Table", "Heap", "Trie", "Binary Search", "Two Pointers", "Sliding Window"
  ];

  return (
    <div style={styles.body}>
      <style>{`
        :root{--b:#1769e0;--n:#10264a;--bg:#f3f2ef;--c:#fff;--t:#172033;--m:#68758a;--l:#dedbd5}*{box-sizing:border-box}body{margin:0;font:14px Inter,system-ui;background:var(--bg);color:var(--t)}body.dark{--bg:#171a1f;--c:#22262d;--t:#eef4ff;--n:#eef4ff;--m:#aab3c2;--l:#3b414b}button,input,select,textarea{font:inherit}.shell{max-width:1400px;margin:24px auto;padding:0 20px 70px;display:grid;grid-template-columns:1fr 280px;gap:18px}.card{background:var(--c);border:1px solid var(--l);border-radius:12px}.hero{padding:25px;display:flex;justify-content:space-between;align-items:center}.hero h1{font-size:30px;margin:4px 0;color:var(--n)}.hero p,.muted{color:var(--m)}.blue{color:var(--b);font-size:11px;font-weight:800;letter-spacing:.1em}.primary{border:0;background:var(--b);color:#fff;padding:11px 17px;border-radius:99px;font-weight:750;cursor:pointer}.primary:hover{opacity:0.9}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:13px 0}.stat{padding:18px}.stat strong{display:block;font-size:27px;color:var(--n);margin:6px 0}.filters{padding:14px;display:grid;grid-template-columns:1.5fr repeat(3,1fr) auto;gap:8px;margin-bottom:13px}.control,.reset{border:1px solid var(--l);background:var(--c);color:var(--t);padding:10px;border-radius:8px}.head{padding:19px}.head h2{margin:0;color:var(--n)}.topics{padding:0 12px 12px}.topic{border-top:1px solid var(--l)}.th{display:grid;grid-template-columns:220px 1fr 65px 190px 25px;gap:12px;align-items:center;padding:15px 8px;cursor:pointer}.name{font-weight:750}.icon{display:inline-grid;place-items:center;width:34px;height:34px;background:#eaf3ff;color:var(--b);border-radius:9px;margin-right:9px}.track{height:9px;background:#e8edf3;border-radius:9px;overflow:hidden}.fill{height:100%;background:var(--b)}.badge{font-size:10px;padding:4px 7px;border-radius:99px}.e{background:#e1f3ec;color:#20705d}.m{background:#fff0cb;color:#946315}.h{background:#fde3e3;color:#ad3f3f}.problems{display:none;padding:0 8px 15px;overflow:auto}.topic.open .problems{display:block}.topic.open .arrow{transform:rotate(180deg)}table{width:100%;border-collapse:collapse;min-width:800px;font-size:12px}th,td{text-align:left;padding:11px;border-bottom:1px solid var(--l)}.problem-link{color:var(--b);font-weight:700;text-decoration:none;cursor:pointer}.problem-link:hover{text-decoration:underline}.fab{position:fixed;right:28px;bottom:25px;width:58px;height:58px;border:0;border-radius:50%;background:var(--b);color:#fff;font-size:28px;cursor:pointer}.back{display:none;position:fixed;inset:0;background:#0d1725aa;z-index:50;align-items:center;justify-content:center;padding:18px}.back.show{display:flex}.modal{width:min(560px,100%);background:var(--c);border-radius:14px;padding:22px;max-height:85vh;overflow-y:auto}.workspace-modal{width:95vw;height:90vh;max-height:90vh;display:flex;flex-direction:row;gap:20px;padding:20px;overflow:hidden;background:var(--bg)}.workspace-panel{background:var(--c);border-radius:12px;border:1px solid var(--l);display:flex;flex-direction:column;overflow:hidden;flex:1}.panel-header{padding:15px 20px;border-bottom:1px solid var(--l);display:flex;justify-content:space-between;align-items:center;background:var(--c)}.panel-content{padding:20px;overflow-y:auto;flex:1}.form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.full{grid-column:1/-1}.form label{display:block;font-size:11px;font-weight:700;margin-bottom:5px}.form .control{width:100%}textarea{min-height:90px}.actions{text-align:right;margin-top:15px}.loading{text-align:center;padding:40px;color:var(--m)}.side{position:sticky;top:96px;align-self:start}.side .card{padding:18px;margin-bottom:13px}.description{white-space:pre-wrap;font-size:14px;line-height:1.6;color:var(--t)}.close-btn{background:none;border:none;font-size:24px;cursor:pointer;color:var(--m);line-height:1}.ide-toolbar{display:flex;gap:10px;padding:10px 15px;background:#1e1e1e;border-bottom:1px solid #333}.console-window{height:150px;background:#1e1e1e;color:#fff;padding:15px;font-family:monospace;overflow-y:auto;border-top:1px solid #333;font-size:12px}.status-badge{display:inline-block;padding:4px 10px;border-radius:20px;font-weight:600;font-size:12px;margin-right:10px}.status-solved{background:#e1f3ec;color:#10b981}.status-pending{background:#fde3e3;color:#ef4444}
        @media(max-width:1000px){.shell{grid-template-columns:1fr}.side{position:static}.stats{grid-template-columns:1fr 1fr}.filters{grid-template-columns:1fr 1fr}.workspace-modal{flex-direction:column;height:95vh;overflow-y:auto}.workspace-panel{flex:none;height:500px}}@media(max-width:700px){.shell{padding:0 10px 70px}.stats,.filters{grid-template-columns:1fr}.th{grid-template-columns:1fr 60px 25px}.th .track,.badges{display:none}.hero{display:block}.hero button{margin-top:15px}.form{grid-template-columns:1fr}.full{grid-column:auto}}
      `}</style>

      <div className="shell">
        <main>
          {/* Hero Section */}
          <section className="card hero">
            <div>
              <span className="blue">STRUCTURED CODING PREPARATION</span>
              <h1>DSA Tracker</h1>
              <p>Track problems, write code, and build consistency one topic at a time.</p>
            </div>
            <button className="primary" onClick={() => setShowModal("add")}>
              + Add new problem
            </button>
          </section>

          {/* Stats Section */}
          <section className="stats">
            <div className="card stat">
              <span className="muted">Total solved</span>
              <strong>{stats.totalSolved}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Current streak</span>
              <strong>{stats.currentStreak} days</strong>
            </div>
            <div className="card stat">
              <span className="muted">Solved this week</span>
              <strong>{stats.thisWeekSolved}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Total attempted</span>
              <strong>{stats.totalAttempted}</strong>
              <span>{stats.totalAttempted > 0 ? Math.round((stats.totalSolved / stats.totalAttempted) * 100) : 0}% completion</span>
            </div>
          </section>

          {/* Filters Section */}
          <section className="card filters">
            <input
              className="control"
              placeholder="Search problems…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className="control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">All difficulties</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <select className="control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option>Solved</option>
              <option>Pending</option>
              <option>Revision Needed</option>
            </select>
            <select className="control" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              <option value="">All topics</option>
              {allTopicsForDropdown.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <button className="reset" onClick={resetFilters}>Reset</button>
          </section>

          {/* Topics Section */}
          <section className="card">
            <div className="head">
              <h2>Topic-wise progress</h2>
              <div className="muted">Expand a topic to solve or review individual problems.</div>
            </div>
            {loading ? (
              <div className="loading">Loading problems...</div>
            ) : filteredTopics.length === 0 ? (
              <div className="loading">No problems found. Add one to get started!</div>
            ) : (
              <div className="topics">
                {filteredTopics.map((topicData, idx) => {
                  const isOpen = openTopic === idx;
                  const percentage = topicData.total > 0 ? Math.round((topicData.solved / topicData.total) * 100) : 0;

                  return (
                    <article key={topicData.topic} className={`topic ${isOpen ? "open" : ""}`}>
                      <div className="th" onClick={() => setOpenTopic(isOpen ? -1 : idx)}>
                        <div className="name">
                          <span className="icon">{topicData.icon}</span>
                          {topicData.topic}
                        </div>
                        <div className="track">
                          <div className="fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span>{topicData.solved}/{topicData.total}</span>
                        <div className="badges">
                          <span className="badge e">Easy</span>
                          <span className="badge m">Medium</span>
                          <span className="badge h">Hard</span>
                        </div>
                        <span className="arrow">⌄</span>
                      </div>
                      {isOpen && (
                        <div className="problems">
                          <table>
                            <thead>
                              <tr>
                                <th>Problem</th>
                                <th>Difficulty</th>
                                <th>Last attempted</th>
                                <th>Update Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topicData.problems.map((problem) => (
                                <tr key={problem._id}>
                                  <td>
                                    <a
                                      className="problem-link"
                                      onClick={() => {
                                        setSelectedProblem(problem);
                                        setCode(problem.code || "// Write your solution here...\n");
                                        setOutput(problem.output || "");
                                        setSolutionStatus(problem.status === "Solved" ? "solved" : "pending");
                                        setTestResults(problem.testResults || []);
                                        setShowModal("workspace");
                                      }}
                                    >
                                      {problem.name} ↗
                                    </a>
                                  </td>
                                  <td>
                                    <span className={`badge ${problem.difficulty[0].toLowerCase()}`}>
                                      {problem.difficulty}
                                    </span>
                                  </td>
                                  <td>{problem.lastAttempted ? new Date(problem.lastAttempted).toLocaleDateString() : "Never"}</td>
                                  <td>
                                    <select
                                      style={styles.button}
                                      value={problem.status}
                                      onChange={(e) => handleUpdateProblem(problem._id, { status: e.target.value })}
                                    >
                                      <option>Pending</option>
                                      <option>Solved</option>
                                      <option>Revision Needed</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="side">
          <section className="card">
            <span className="blue">QUICK STAT</span>
            <h3>You've solved {stats.totalSolved} problems</h3>
            <p>Keep pushing! 🚀</p>
            <button className="primary" onClick={() => setShowModal("add")}>Add a problem</button>
          </section>
        </aside>
      </div>

      <button className="fab" onClick={() => setShowModal("add")}>+</button>

      {/* Add New Problem Modal */}
      {showModal === "add" && (
        <div className="back show" onClick={() => setShowModal("")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>Add New Problem</h2>
              <button className="close-btn" onClick={() => setShowModal("")}>×</button>
            </div>
            <form className="form" onSubmit={handleAddProblem}>
              <div>
                <label>Problem Name *</label>
                <input 
                  required 
                  className="control" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Two Sum" 
                />
              </div>
              <div>
                <label>Problem Link</label>
                <input 
                  className="control" 
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})} 
                  placeholder="https://leetcode.com/..." 
                />
              </div>
              <div>
                <label>Topic *</label>
                <select 
                  className="control" 
                  value={formData.topic} 
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                >
                  {allTopicsForDropdown.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label>Difficulty *</label>
                <select 
                  className="control" 
                  value={formData.difficulty} 
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div className="full">
                <label>Description (Optional)</label>
                <textarea 
                  className="control" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Paste problem description here..." 
                />
              </div>
              <div className="full actions">
                <button type="button" className="control" style={{ width: "auto", marginRight: "10px", display: "inline-block" }} onClick={() => setShowModal("")}>Cancel</button>
                <button type="submit" className="primary">Add Problem</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace / IDE Modal */}
      {showModal === "workspace" && selectedProblem && (
        <div className="back show" onClick={() => setShowModal("")}>
          <div className="modal workspace-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Left Panel: Problem Description */}
            <div className="workspace-panel">
              <div className="panel-header">
                <div>
                  <h2 style={{ margin: "0 0 5px 0" }}>{selectedProblem.name}</h2>
                  <span className={`badge ${selectedProblem.difficulty[0].toLowerCase()}`}>{selectedProblem.difficulty}</span>
                  <span style={{ marginLeft: "10px", fontSize: "12px", color: "var(--m)" }}>{selectedProblem.topic}</span>
                </div>
              </div>
              <div className="panel-content">
                <div className="description">{selectedProblem.description || "No description provided."}</div>
                
                <hr style={{ border: "0", borderTop: "1px solid var(--l)", margin: "20px 0" }} />
                
                <h3>Update Progress</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    className="control"
                    style={{ width: "auto" }}
                    value={selectedProblem.status}
                    onChange={(e) => handleUpdateProblem(selectedProblem._id, { status: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>Solved</option>
                    <option>Revision Needed</option>
                  </select>
                  <span style={{ fontSize: "12px", color: "var(--m)" }}>Time spent: {selectedProblem.timeSpent} min</span>
                  {solutionStatus === "solved" && (
                    <span className="status-badge status-solved">✓ SOLVED</span>
                  )}
                  {solutionStatus === "pending" && testResults.length > 0 && (
                    <span className="status-badge status-pending">✗ ERROR</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="workspace-panel" style={{ border: "1px solid #333", background: "#1e1e1e" }}>
              <div className="ide-toolbar">
                <select 
                  style={{ background: "#333", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px" }}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <div style={{ flex: 1 }}></div>
                <button 
                  style={{ background: "transparent", color: "#fff", border: "1px solid #555", padding: "5px 15px", borderRadius: "4px", cursor: "pointer" }}
                  onClick={handleSaveCode}
                >
                  Save Code
                </button>
                <button 
                  style={{ background: "var(--b)", color: "#fff", border: "none", padding: "5px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", opacity: isRunning ? 0.6 : 1 }}
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  {isRunning ? "Running..." : "Run Code"}
                </button>
                <button className="close-btn" onClick={() => setShowModal("")}>×</button>
              </div>
              
              <div style={{ flex: 1 }}>
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 15 }
                  }}
                />
              </div>

              {/* Console Output */}
              <div className="console-window">
                <div style={{ color: "#888", marginBottom: "5px" }}>
                  Output:
                  {solutionStatus === "solved" && <span style={{ color: "#10b981", marginLeft: "10px", fontWeight: "bold" }}>✓ SOLVED</span>}
                  {solutionStatus === "pending" && testResults.length > 0 && <span style={{ color: "#ef4444", marginLeft: "10px", fontWeight: "bold" }}>✗ ERROR</span>}
                </div>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{output}</pre>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  body: { margin: 0, background: "var(--bg)" },
  button: { border: "1px solid var(--l)", background: "var(--c)", color: "var(--t)", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", width: "100%" },
};

export default DSATracker;