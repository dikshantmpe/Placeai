import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

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
      if (!token) {
        console.error("User not authenticated");
        return;
      }

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
        :root{--b:#1769e0;--n:#10264a;--bg:#f3f2ef;--c:#fff;--t:#172033;--m:#68758a;--l:#dedbd5}*{box-sizing:border-box}body{margin:0;font:14px Inter,system-ui;background:var(--bg);color:var(--t)}body.dark{--bg:#171a1f;--c:#22262d;--t:#eef4ff;--n:#eef4ff;--m:#aab3c2;--l:#3b414b}button,input,select,textarea{font:inherit}.shell{max-width:1400px;margin:24px auto;padding:0 20px 70px;display:grid;grid-template-columns:1fr 280px;gap:18px}.card{background:var(--c);border:1px solid var(--l);border-radius:12px}.hero{padding:25px;display:flex;justify-content:space-between;align-items:center}.hero h1{font-size:30px;margin:4px 0;color:var(--n)}.hero p,.muted{color:var(--m)}.blue{color:var(--b);font-size:11px;font-weight:800;letter-spacing:.1em}.primary{border:0;background:var(--b);color:#fff;padding:11px 17px;border-radius:99px;font-weight:750;cursor:pointer}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:13px 0}.stat{padding:18px}.stat strong{display:block;font-size:27px;color:var(--n);margin:6px 0}.filters{padding:14px;display:grid;grid-template-columns:1.5fr repeat(3,1fr) auto;gap:8px;margin-bottom:13px}.control,.reset{border:1px solid var(--l);background:var(--c);color:var(--t);padding:10px;border-radius:8px}.head{padding:19px}.head h2{margin:0;color:var(--n)}.topics{padding:0 12px 12px}.topic{border-top:1px solid var(--l)}.th{display:grid;grid-template-columns:220px 1fr 65px 190px 25px;gap:12px;align-items:center;padding:15px 8px;cursor:pointer}.name{font-weight:750}.icon{display:inline-grid;place-items:center;width:34px;height:34px;background:#eaf3ff;color:var(--b);border-radius:9px;margin-right:9px}.track{height:9px;background:#e8edf3;border-radius:9px;overflow:hidden}.fill{height:100%;background:var(--b)}.badge{font-size:10px;padding:4px 7px;border-radius:99px}.e{background:#e1f3ec;color:#20705d}.m{background:#fff0cb;color:#946315}.h{background:#fde3e3;color:#ad3f3f}.problems{display:none;padding:0 8px 15px;overflow:auto}.topic.open .problems{display:block}.topic.open .arrow{transform:rotate(180deg)}table{width:100%;border-collapse:collapse;min-width:800px;font-size:12px}th,td{text-align:left;padding:11px;border-bottom:1px solid var(--l)}.problem-link{color:var(--b);font-weight:700;text-decoration:none;cursor:pointer}.problem-link:hover{text-decoration:underline}.fab{position:fixed;right:28px;bottom:25px;width:58px;height:58px;border:0;border-radius:50%;background:var(--b);color:#fff;font-size:28px;cursor:pointer}.back{display:none;position:fixed;inset:0;background:#0d1725aa;z-index:50;align-items:center;justify-content:center;padding:18px}.back.show{display:flex}.modal{width:min(560px,100%);background:var(--c);border-radius:14px;padding:22px;max-height:85vh;overflow-y:auto}.detail-modal{width:min(720px,100%)}.form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.full{grid-column:1/-1}.form label{display:block;font-size:11px;font-weight:700;margin-bottom:5px}.form .control{width:100%}textarea{min-height:90px}.actions{text-align:right;margin-top:15px}.loading{text-align:center;padding:40px;color:var(--m)}.side{position:sticky;top:96px;align-self:start}.side .card{padding:18px;margin-bottom:13px}.description{white-space:pre-wrap;font-size:13px;line-height:1.6;color:var(--t);margin:15px 0}.close-btn{float:right;background:none;border:none;font-size:24px;cursor:pointer;color:var(--m)}
        @media(max-width:1000px){.shell{grid-template-columns:1fr}.side{position:static}.stats{grid-template-columns:1fr 1fr}.filters{grid-template-columns:1fr 1fr}}@media(max-width:700px){.shell{padding:0 10px 70px}.stats,.filters{grid-template-columns:1fr}.th{grid-template-columns:1fr 60px 25px}.th .track,.badges{display:none}.hero{display:block}.hero button{margin-top:15px}.form{grid-template-columns:1fr}.full{grid-column:auto}.modal{width:100%}}
      `}</style>

      <div className="shell">
        <main>
          {/* Hero Section */}
          <section className="card hero">
            <div>
              <span className="blue">STRUCTURED CODING PREPARATION</span>
              <h1>DSA Tracker</h1>
              <p>Track problems, revisit weak areas, and build consistency one topic at a time.</p>
            </div>
            <button className="primary" onClick={() => setShowModal("add")}>
              + Add new problem
            </button>
          </section>

          {/* Stats */}
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

          {/* Filters */}
          <section className="card filters">
            <input
              className="control"
              placeholder="Search problems…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="control"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All difficulties</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <select
              className="control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option>Solved</option>
              <option>Pending</option>
              <option>Revision Needed</option>
            </select>
            <select
              className="control"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">All topics</option>
              {allTopicsForDropdown.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            <button className="reset" onClick={resetFilters}>
              Reset
            </button>
          </section>

          {/* Topics Section */}
          <section className="card">
            <div className="head">
              <h2>Topic-wise progress</h2>
              <div className="muted">Expand a topic to review individual problems.</div>
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
                      <div
                        className="th"
                        onClick={() => setOpenTopic(isOpen ? -1 : idx)}
                      >
                        <div className="name">
                          <span className="icon">{topicData.icon}</span>
                          {topicData.topic}
                        </div>
                        <div className="track">
                          <div className="fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span>
                          {topicData.solved}/{topicData.total}
                        </span>
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
                                <th>Time</th>
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
                                        setShowModal("detail");
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
                                  <td>{problem.timeSpent} min</td>
                                  <td>
                                    <select
                                      style={styles.button}
                                      value={problem.status}
                                      onChange={(e) =>
                                        handleUpdateProblem(problem._id, {
                                          status: e.target.value,
                                        })
                                      }
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

        {/* Sidebar */}
        <aside className="side">
          <section className="card">
            <span className="blue">QUICK STAT</span>
            <h3>You've solved {stats.totalSolved} problems</h3>
            <p>Keep pushing! 🚀</p>
            <button className="primary" onClick={() => setShowModal("add")}>
              Add a problem
            </button>
          </section>
        </aside>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowModal("add")}>
        +
      </button>

      {/* Add Problem Modal */}
      {showModal === "add" && (
        <div className="back show" onClick={() => setShowModal("")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add a custom problem</h2>
            <form onSubmit={handleAddProblem}>
              <div className="form">
                <label className="full">
                  Problem name
                  <input
                    className="control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </label>
                <label className="full">
                  Problem link
                  <input
                    className="control"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  />
                </label>
                <label>
                  Topic
                  <select
                    className="control"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  >
                    {allTopicsForDropdown.map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Difficulty
                  <select
                    className="control"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </label>
                <label>
                  Status
                  <select
                    className="control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>Solved</option>
                    <option>Revision Needed</option>
                  </select>
                </label>
                <label>
                  Time spent (min)
                  <input
                    className="control"
                    type="number"
                    value={formData.timeSpent}
                    onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                  />
                </label>
                <label className="full">
                  Description
                  <textarea
                    className="control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Problem statement and examples"
                  ></textarea>
                </label>
                <label className="full">
                  Notes
                  <textarea
                    className="control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Your approach, insights, etc."
                  ></textarea>
                </label>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="reset"
                  onClick={() => setShowModal("")}
                >
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Save problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Problem Detail Modal */}
      {showModal === "detail" && selectedProblem && (
        <div className="back show" onClick={() => setShowModal("")}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal("")}>×</button>
            <h2>{selectedProblem.name}</h2>
            <div style={{ marginBottom: "15px" }}>
              <span className={`badge ${selectedProblem.difficulty[0].toLowerCase()}`}>
                {selectedProblem.difficulty}
              </span>
              <span style={{ marginLeft: "10px", color: "var(--m)" }}>
                {selectedProblem.topic}
              </span>
            </div>
            
            {selectedProblem.description && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginTop: 0 }}>Problem Description</h3>
                <div className="description">{selectedProblem.description}</div>
              </div>
            )}

            {selectedProblem.link && (
              <div style={{ marginBottom: "20px" }}>
                <a href={selectedProblem.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--b)" }}>
                  View on LeetCode →
                </a>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <h3>Your Progress</h3>
              <p><strong>Status:</strong> {selectedProblem.status}</p>
              <p><strong>Time Spent:</strong> {selectedProblem.timeSpent} minutes</p>
              <p><strong>Last Attempted:</strong> {selectedProblem.lastAttempted ? new Date(selectedProblem.lastAttempted).toLocaleDateString() : "Never"}</p>
            </div>

            {selectedProblem.notes && (
              <div style={{ marginBottom: "20px" }}>
                <h3>Your Notes</h3>
                <div className="description">{selectedProblem.notes}</div>
              </div>
            )}

            <div style={{ marginTop: "25px", paddingTop: "15px", borderTop: "1px solid var(--l)" }}>
              <label style={{ marginRight: "15px" }}>
                Mark as:
                <select
                  style={{ marginLeft: "10px", padding: "8px" }}
                  value={selectedProblem.status}
                  onChange={(e) => {
                    handleUpdateProblem(selectedProblem._id, { status: e.target.value });
                    setShowModal("");
                  }}
                >
                  <option>Pending</option>
                  <option>Solved</option>
                  <option>Revision Needed</option>
                </select>
              </label>
              <button className="reset" onClick={() => setShowModal("")}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  body: {
    margin: 0,
    background: "var(--bg)",
  },
  button: {
    border: "1px solid var(--l)",
    background: "var(--c)",
    color: "var(--t)",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    width: "100%",
  },
};

export default DSATracker;