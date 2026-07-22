import React, { useState, useEffect } from "react";

const DSATracker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [openTopic, setOpenTopic] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("crackin-theme") || "light");

  const data = [
    ["Arrays", "▦", 24, 45],
    ["Linked List", "⛓", 14, 24],
    ["Stack", "▤", 12, 18],
    ["Queue", "⇥", 8, 14],
    ["Tree", "♧", 18, 32],
    ["Graph", "⌘", 13, 28],
    ["Dynamic Programming", "◇", 11, 30],
    ["Greedy", "↗", 9, 16],
    ["Backtracking", "↶", 7, 18],
    ["Bit Manipulation", "01", 8, 12],
    ["Math", "∑", 10, 15],
    ["String", "Aa", 16, 25],
    ["Hash Table", "#", 14, 20],
    ["Heap", "△", 7, 14],
    ["Trie", "T", 4, 10],
    ["Segment Tree", "▥", 2, 8],
    ["Binary Search", "⌕", 12, 18],
    ["Two Pointers", "⇆", 11, 16],
    ["Sliding Window", "▭", 9, 15],
    ["Union Find", "∪", 5, 10],
    ["Topological Sort", "⇣", 4, 9],
  ];

  const names = ["Two Sum", "Maximum Subarray", "Reverse Linked List"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const statuses = ["Solved", "Revision Needed", "Pending"];

  const heatmapData = Array.from({ length: 371 }, (_, i) => {
    const r = (i * 17 + Math.floor(i / 8)) % 13;
    if (r > 10) return "l4";
    if (r > 7) return "l3";
    if (r > 4) return "l2";
    if (r > 2) return "l1";
    return "";
  });

  const activityData = [
    { text: "Solved Maximum Subarray", time: "1 hour ago" },
    { text: "Marked Linked List Cycle for revision", time: "2 hours ago" },
    { text: "Completed 4 Array problems", time: "3 hours ago" },
    { text: "Started DP roadmap", time: "4 hours ago" },
  ];

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark" : "";
    localStorage.setItem("crackin-theme", theme);
  }, [theme]);

  const toggleTheme = (e) => {
    e.stopPropagation();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const filteredData = data.filter(
    (topic) => !selectedTopic || topic[0] === selectedTopic
  );

  const resetFilters = () => {
    setSearchQuery("");
    setDifficulty("");
    setStatus("");
    setSelectedTopic("");
  };

  return (
    <div style={styles.body}>
      <style>{`
        :root{--b:#1769e0;--n:#10264a;--bg:#f3f2ef;--c:#fff;--t:#172033;--m:#68758a;--l:#dedbd5}*{box-sizing:border-box}body{margin:0;font:14px Inter,system-ui;background:var(--bg);color:var(--t)}body.dark{--bg:#171a1f;--c:#22262d;--t:#eef4ff;--n:#eef4ff;--m:#aab3c2;--l:#3b414b}button,input,select,textarea{font:inherit}.shell{max-width:1400px;margin:24px auto;padding:0 20px 70px;display:grid;grid-template-columns:1fr 280px;gap:18px}.card{background:var(--c);border:1px solid var(--l);border-radius:12px}.hero{padding:25px;display:flex;justify-content:space-between;align-items:center}.hero h1{font-size:30px;margin:4px 0;color:var(--n)}.hero p,.muted{color:var(--m)}.blue{color:var(--b);font-size:11px;font-weight:800;letter-spacing:.1em}.primary{border:0;background:var(--b);color:#fff;padding:11px 17px;border-radius:99px;font-weight:750;cursor:pointer}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:13px 0}.stat{padding:18px}.stat strong{display:block;font-size:27px;color:var(--n);margin:6px 0}.filters{padding:14px;display:grid;grid-template-columns:1.5fr repeat(3,1fr) auto;gap:8px;margin-bottom:13px}.control,.reset{border:1px solid var(--l);background:var(--c);color:var(--t);padding:10px;border-radius:8px}.head{padding:19px}.head h2{margin:0;color:var(--n)}.topics{padding:0 12px 12px}.topic{border-top:1px solid var(--l)}.th{display:grid;grid-template-columns:220px 1fr 65px 190px 25px;gap:12px;align-items:center;padding:15px 8px;cursor:pointer}.name{font-weight:750}.icon{display:inline-grid;place-items:center;width:34px;height:34px;background:#eaf3ff;color:var(--b);border-radius:9px;margin-right:9px}.track{height:9px;background:#e8edf3;border-radius:9px;overflow:hidden}.fill{height:100%;background:var(--b)}.badge{font-size:10px;padding:4px 7px;border-radius:99px}.e{background:#e1f3ec;color:#20705d}.m{background:#fff0cb;color:#946315}.h{background:#fde3e3;color:#ad3f3f}.problems{display:none;padding:0 8px 15px;overflow:auto}.topic.open .problems{display:block}.topic.open .arrow{transform:rotate(180deg)}table{width:100%;border-collapse:collapse;min-width:800px;font-size:12px}th,td{text-align:left;padding:11px;border-bottom:1px solid var(--l)}a{color:var(--b);font-weight:700;text-decoration:none}.heat{padding:20px;margin-top:13px;overflow:auto}.grid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,11px);grid-auto-columns:11px;gap:3px;min-width:750px}.day{background:#e3e2de;width:11px;height:11px;border-radius:2px}.l1{background:#cce2ff}.l2{background:#86b9f5}.l3{background:#3f8bea}.l4{background:#1769e0}.side{position:sticky;top:96px;align-self:start}.side .card{padding:18px;margin-bottom:13px}.activity{padding:11px 0;border-bottom:1px solid var(--l)}.activity small{display:block;color:var(--m)}.challenge{background:#10264a!important;color:#fff}.challenge h3{color:#fff}.fab{position:fixed;right:28px;bottom:25px;width:58px;height:58px;border:0;border-radius:50%;background:var(--b);color:#fff;font-size:28px;cursor:pointer}.back{display:none;position:fixed;inset:0;background:#0d1725aa;z-index:50;align-items:center;justify-content:center;padding:18px}.back.show{display:flex}.modal{width:min(560px,100%);background:var(--c);border-radius:14px;padding:22px}.form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.full{grid-column:1/-1}.form label{display:block;font-size:11px;font-weight:700;margin-bottom:5px}.form .control{width:100%}textarea{min-height:90px}.actions{text-align:right;margin-top:15px}
        @media(max-width:1000px){.shell{grid-template-columns:1fr}.side{position:static}.stats{grid-template-columns:1fr 1fr}.filters{grid-template-columns:1fr 1fr}}@media(max-width:700px){.shell{padding:0 10px 70px}.stats,.filters{grid-template-columns:1fr}.th{grid-template-columns:1fr 60px 25px}.th .track,.badges{display:none}.hero{display:block}.hero button{margin-top:15px}.form{grid-template-columns:1fr}.full{grid-column:auto}}
      `}</style>

      {/* Main Content */}
      <div className="shell">
        <main>
          {/* Hero Section */}
          <section className="card hero">
            <div>
              <span className="blue">STRUCTURED CODING PREPARATION</span>
              <h1>DSA Tracker</h1>
              <p>Track problems, revisit weak areas, and build consistency one topic at a time.</p>
            </div>
            <button className="primary" onClick={() => setShowModal(true)}>
              + Add new problem
            </button>
          </section>

          {/* Stats */}
          <section className="stats">
            <div className="card stat">
              <span className="muted">Total solved</span>
              <strong>184</strong>
              <span>↑ 12 this week</span>
            </div>
            <div className="card stat">
              <span className="muted">Current streak</span>
              <strong>12 days</strong>
              <span>Best: 21 days</span>
            </div>
            <div className="card stat">
              <span className="muted">Solved this week</span>
              <strong>12</strong>
              <span>↑ 4 vs last week</span>
            </div>
            <div className="card stat">
              <span className="muted">Overall completion</span>
              <strong>61%</strong>
              <span>184 / 302 curated</span>
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
              {data.map((topic) => (
                <option key={topic[0]} value={topic[0]}>
                  {topic[0]}
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
            <div className="topics">
              {filteredData.map((topic, idx) => {
                const problems = names.map((name, i) => ({
                  name: `${topic[0]} · ${name}`,
                  difficulty: difficulties[i],
                  status: statuses[i],
                }));
                const isOpen = openTopic === idx;

                return (
                  <article
                    key={topic[0]}
                    className={`topic ${isOpen ? "open" : ""}`}
                  >
                    <div
                      className="th"
                      onClick={() => setOpenTopic(isOpen ? -1 : idx)}
                    >
                      <div className="name">
                        <span className="icon">{topic[1]}</span>
                        {topic[0]}
                      </div>
                      <div className="track">
                        <div
                          className="fill"
                          style={{ width: `${Math.round((topic[2] / topic[3]) * 100)}%` }}
                        ></div>
                      </div>
                      <span>
                        {topic[2]}/{topic[3]}
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
                              <th>Notes</th>
                              <th>Update</th>
                            </tr>
                          </thead>
                          <tbody>
                            {problems.map((problem, pIdx) => (
                              <tr key={pIdx}>
                                <td>
                                  <a href="#">{problem.name} ↗</a>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${problem.difficulty[0].toLowerCase()}`}
                                  >
                                    {problem.difficulty}
                                  </span>
                                </td>
                                <td>{problem.status}</td>
                                <td>{pIdx ? "Yesterday" : "Today"}</td>
                                <td>{18 + pIdx * 9} min</td>
                                <td>
                                  <button style={{ ...styles.button }}>Notes</button>
                                </td>
                                <td>
                                  <button style={{ ...styles.button }}>Toggle</button>
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
          </section>

          {/* Heatmap */}
          <section className="card heat">
            <h2>Problem-solving activity</h2>
            <p className="muted">Your consistency over the past year.</p>
            <div className="grid">
              {heatmapData.map((level, i) => (
                <i key={i} className={`day ${level}`}></i>
              ))}
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="side">
          <section className="card challenge">
            <span className="blue">TODAY'S CHALLENGE</span>
            <h3>Longest Substring Without Repeating Characters</h3>
            <p>Sliding Window · Medium · ~25 min</p>
            <button className="primary">Solve challenge</button>
          </section>
          <section className="card">
            <h3>Recent activity</h3>
            {activityData.map((activity, i) => (
              <div key={i} className="activity">
                <b>{activity.text}</b>
                <small>{activity.time}</small>
              </div>
            ))}
          </section>
        </aside>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowModal(true)}>
        +
      </button>

      {/* Modal */}
      {showModal && (
        <div className="back show">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add a custom problem</h2>
            <form>
              <div className="form">
                <label className="full">
                  Problem name
                  <input className="control" />
                </label>
                <label className="full">
                  Problem link
                  <input className="control" type="url" />
                </label>
                <label>
                  Topic
                  <select className="control">
                    {data.map((topic) => (
                      <option key={topic[0]} value={topic[0]}>
                        {topic[0]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Difficulty
                  <select className="control">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </label>
                <label>
                  Status
                  <select className="control">
                    <option>Pending</option>
                    <option>Solved</option>
                    <option>Revision Needed</option>
                  </select>
                </label>
                <label>
                  Time spent
                  <input className="control" placeholder="25 min" />
                </label>
                <label className="full">
                  Notes
                  <textarea className="control"></textarea>
                </label>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="reset"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    alert("Problem added!");
                    setShowModal(false);
                  }}
                >
                  Save problem
                </button>
              </div>
            </form>
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
    border: 0,
    background: "var(--c)",
    color: "var(--t)",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default DSATracker;