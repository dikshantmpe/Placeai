import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import Editor from "@monaco-editor/react";

const DSATracker = () => {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalAttempted: 0,
    currentStreak: 12,
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
    const updatedNotes = selectedProblem.notes 
      ? `${selectedProblem.notes}\n\n=== Code Solution ===\n${code}`
      : `=== Code Solution ===\n${code}`;
      
    handleUpdateProblem(selectedProblem._id, { notes: updatedNotes });
    setOutput("Code saved to your notes successfully!");
  };

  const handleRunCode = async () => {
    setOutput("Executing code...");
    
    // Wandbox requires specific compiler names
    const languageMap = {
      javascript: "nodejs-head",
      python: "cpython-head",
      cpp: "gcc-head",
      java: "openjdk-head"
    };

    try {
      const response = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          compiler: languageMap[language],
          code: code,
          save: false // We don't need to permanently save the snippet on their servers
        })
      });

      const data = await response.json();

      // Check the specific key-value pairs returned by Wandbox
      if (data.compiler_error) {
        setOutput(`Compilation Error:\n${data.compiler_error}`);
      } else if (data.program_error) {
        setOutput(`Runtime Error:\n${data.program_error}`);
      } else {
        setOutput(data.program_output || "Executed successfully with no output.");
      }
    } catch (error) {
      console.error("Execution error:", error);
      setOutput("Error connecting to the free execution engine.");
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
        :root{--b:#1769e0;--n:#10264a;--bg:#f3f2ef;--c:#fff;--t:#172033;--m:#68758a;--l:#dedbd5}*{box-sizing:border-box}body{margin:0;font:14px Inter,system-ui;background:var(--bg);color:var(--t)}body.dark{--bg:#171a1f;--c:#22262d;--t:#eef4ff;--n:#eef4ff;--m:#aab3c2;--l:#3b414b}button,input,select,textarea{font:inherit}.shell{max-width:1400px;margin:24px auto;padding:0 20px 70px;display:grid;grid-template-columns:1fr 280px;gap:18px}.card{background:var(--c);border:1px solid var(--l);border-radius:12px}.hero{padding:25px;display:flex;justify-content:space-between;align-items:center}.hero h1{font-size:30px;margin:4px 0;color:var(--n)}.hero p,.muted{color:var(--m)}.blue{color:var(--b);font-size:11px;font-weight:800;letter-spacing:.1em}.primary{border:0;background:var(--b);color:#fff;padding:11px 17px;border-radius:99px;font-weight:750;cursor:pointer}.primary:hover{opacity:0.9}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:13px 0}.stat{padding:18px}.stat strong{display:block;font-size:27px;color:var(--n);margin:6px 0}.filters{padding:14px;display:grid;grid-template-columns:1.5fr repeat(3,1fr) auto;gap:8px;margin-bottom:13px}.control,.reset{border:1px solid var(--l);background:var(--c);color:var(--t);padding:10px;border-radius:8px}.head{padding:19px}.head h2{margin:0;color:var(--n)}.topics{padding:0 12px 12px}.topic{border-top:1px solid var(--l)}.th{display:grid;grid-template-columns:220px 1fr 65px 190px 25px;gap:12px;align-items:center;padding:15px 8px;cursor:pointer}.name{font-weight:750}.icon{display:inline-grid;place-items:center;width:34px;height:34px;background:#eaf3ff;color:var(--b);border-radius:9px;margin-right:9px}.track{height:9px;background:#e8edf3;border-radius:9px;overflow:hidden}.fill{height:100%;background:var(--b)}.badge{font-size:10px;padding:4px 7px;border-radius:99px}.e{background:#e1f3ec;color:#20705d}.m{background:#fff0cb;color:#946315}.h{background:#fde3e3;color:#ad3f3f}.problems{display:none;padding:0 8px 15px;overflow:auto}.topic.open .problems{display:block}.topic.open .arrow{transform:rotate(180deg)}table{width:100%;border-collapse:collapse;min-width:800px;font-size:12px}th,td{text-align:left;padding:11px;border-bottom:1px solid var(--l)}.problem-link{color:var(--b);font-weight:700;text-decoration:none;cursor:pointer}.problem-link:hover{text-decoration:underline}.fab{position:fixed;right:28px;bottom:25px;width:58px;height:58px;border:0;border-radius:50%;background:var(--b);color:#fff;font-size:28px;cursor:pointer}.back{display:none;position:fixed;inset:0;background:#0d1725aa;z-index:50;align-items:center;justify-content:center;padding:18px}.back.show{display:flex}.modal{width:min(560px,100%);background:var(--c);border-radius:14px;padding:22px;max-height:85vh;overflow-y:auto}.workspace-modal{width:95vw;height:90vh;max-height:90vh;display:flex;flex-direction:row;gap:20px;padding:20px;overflow:hidden;background:var(--bg)}.workspace-panel{background:var(--c);border-radius:12px;border:1px solid var(--l);display:flex;flex-direction:column;overflow:hidden;flex:1}.panel-header{padding:15px 20px;border-bottom:1px solid var(--l);display:flex;justify-content:space-between;align-items:center;background:var(--c)}.panel-content{padding:20px;overflow-y:auto;flex:1}.form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.full{grid-column:1/-1}.form label{display:block;font-size:11px;font-weight:700;margin-bottom:5px}.form .control{width:100%}textarea{min-height:90px}.actions{text-align:right;margin-top:15px}.loading{text-align:center;padding:40px;color:var(--m)}.side{position:sticky;top:96px;align-self:start}.side .card{padding:18px;margin-bottom:13px}.description{white-space:pre-wrap;font-size:14px;line-height:1.6;color:var(--t)}.close-btn{background:none;border:none;font-size:24px;cursor:pointer;color:var(--m);line-height:1}.ide-toolbar{display:flex;gap:10px;padding:10px 15px;background:#1e1e1e;border-bottom:1px solid #333}.console-window{height:150px;background:#1e1e1e;color:#fff;padding:15px;font-family:monospace;overflow-y:auto;border-top:1px solid #333;font-size:12px}
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
              <span>↑ {stats.thisWeekSolved} this week</span>
            </div>
            <div className="card stat">
              <span className="muted">Current streak</span>
              <strong>{stats.currentStreak} days</strong>
              <span>Best: 21 days</span>
            </div>
            <div className="card stat">
              <span className="muted">Solved this week</span>
              <strong>{stats.thisWeekSolved}</strong>
              <span>↑ 4 vs last week</span>
            </div>
            <div className="card stat">
              <span className="muted">Total attempted</span>
              <strong>{stats.totalAttempted}</strong>
              <span>{stats.totalSolved > 0 ? Math.round((stats.totalSolved / stats.totalAttempted) * 100) : 0}% completion</span>
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
                                <th>Status</th>
                                <th>Last attempted</th>
                                <th>Update</th>
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
                                        setCode("// Write your solution here...\n");
                                        setOutput("");
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
                                  <td>{problem.status}</td>
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
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                  style={{ background: "var(--b)", color: "#fff", border: "none", padding: "5px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                  onClick={handleRunCode}
                >
                  Run Code
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
                <div style={{ color: "#888", marginBottom: "5px" }}>Output:</div>
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