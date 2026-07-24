import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const SolutionsGallery = ({ theme = "light" }) => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [filterTopic, setFilterTopic] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/dsa/solutions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch solutions");
      const data = await response.json();
      setSolutions(data.solutions || []);
    } catch (error) {
      console.error("Error fetching solutions:", error);
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSolutions = solutions.filter((sol) => {
    const matchTopic = !filterTopic || sol.topic === filterTopic;
    const matchDifficulty = !filterDifficulty || sol.difficulty === filterDifficulty;
    const matchSearch =
      !searchQuery ||
      sol.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTopic && matchDifficulty && matchSearch;
  });

  const uniqueTopics = [...new Set(solutions.map((s) => s.topic))];
  const uniqueDifficulties = [...new Set(solutions.map((s) => s.difficulty))];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading solutions...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        :root {
          --b: #1769e0;
          --n: #10264a;
          --bg: #f3f2ef;
          --c: #fff;
          --t: #172033;
          --m: #68758a;
          --l: #dedbd5;
        }
        body.dark {
          --bg: #171a1f;
          --c: #22262d;
          --t: #eef4ff;
          --n: #eef4ff;
          --m: #aab3c2;
          --l: #3b414b;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Solutions Gallery</h1>
        <p style={styles.subtitle}>View all your saved code solutions</p>
      </div>

      {/* Filters */}
      <div style={styles.filtersSection}>
        <input
          type="text"
          placeholder="Search problems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All topics</option>
          {uniqueTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All difficulties</option>
          {uniqueDifficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setFilterTopic("");
            setFilterDifficulty("");
            setSearchQuery("");
          }}
          style={styles.resetBtn}
        >
          Reset
        </button>
      </div>

      {filteredSolutions.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No solutions found. Start solving problems to see them here! 🚀</p>
        </div>
      ) : (
        <div style={styles.mainContent}>
          {/* Solutions List */}
          <div style={styles.solutionsList}>
            <h3 style={styles.listTitle}>Solutions ({filteredSolutions.length})</h3>
            <div style={styles.solutionsGrid}>
              {filteredSolutions.map((solution) => (
                <div
                  key={solution._id}
                  style={{
                    ...styles.solutionCard,
                    ...(selectedSolution?._id === solution._id && styles.solutionCardActive),
                  }}
                  onClick={() => setSelectedSolution(solution)}
                >
                  <div style={styles.cardHeader}>
                    <h4 style={styles.cardTitle}>{solution.name}</h4>
                  </div>
                  <div style={styles.cardMeta}>
                    <span style={{
                      ...styles.badge,
                      background: solution.difficulty === "Easy" ? "#e1f3ec" : 
                                 solution.difficulty === "Medium" ? "#fff0cb" : "#fde3e3",
                      color: solution.difficulty === "Easy" ? "#20705d" : 
                             solution.difficulty === "Medium" ? "#946315" : "#ad3f3f"
                    }}>
                      {solution.difficulty}
                    </span>
                    <span style={styles.topic}>{solution.topic}</span>
                  </div>
                  <div style={styles.cardFooter}>
                    <span style={styles.status}>✓ Solved</span>
                    <span style={styles.date}>
                      {new Date(solution.solvedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Detail */}
          {selectedSolution && (
            <div style={styles.detailPanel}>
              <div style={styles.detailHeader}>
                <div>
                  <h2 style={styles.detailTitle}>{selectedSolution.name}</h2>
                  <p style={styles.detailTopic}>{selectedSolution.topic}</p>
                </div>
                <button
                  onClick={() => setSelectedSolution(null)}
                  style={styles.closeBtn}
                >
                  ✕
                </button>
              </div>

              {/* Code Editor */}
              <div style={styles.editorSection}>
                <h3 style={styles.sectionTitle}>Solution Code</h3>
                <div style={styles.editorWrapper}>
                  <Editor
                    height="300px"
                    language="javascript"
                    theme={theme === "dark" ? "vs-dark" : "vs"}
                    value={selectedSolution.code || ""}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Output */}
              {selectedSolution.output && (
                <div style={styles.outputSection}>
                  <h3 style={styles.sectionTitle}>Test Output</h3>
                  <pre style={styles.outputBox}>{selectedSolution.output}</pre>
                </div>
              )}

              {/* Test Results */}
              {selectedSolution.testResults && selectedSolution.testResults.length > 0 && (
                <div style={styles.testSection}>
                  <h3 style={styles.sectionTitle}>Test Results</h3>
                  <div style={styles.testResults}>
                    {selectedSolution.testResults.map((result, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.testResult,
                          borderLeft: `4px solid ${result.passed ? "#10b981" : "#ef4444"}`,
                        }}
                      >
                        <span
                          style={{
                            color: result.passed ? "#10b981" : "#ef4444",
                            fontWeight: "bold",
                          }}
                        >
                          Test {result.testNum}: {result.passed ? "✓ PASSED" : "✗ FAILED"}
                        </span>
                        {result.input && (
                          <small style={styles.testDetail}>
                            Input: {JSON.stringify(result.input)}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div style={styles.metadata}>
                <div style={styles.metadataItem}>
                  <span>Solved on:</span>
                  <strong>{new Date(selectedSolution.solvedAt).toLocaleString()}</strong>
                </div>
                <div style={styles.metadataItem}>
                  <span>Time spent:</span>
                  <strong>{selectedSolution.timeSpent || 0} min</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    background: "var(--bg)",
    minHeight: "100vh",
    color: "var(--t)",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    margin: "0 0 8px 0",
    color: "var(--n)",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--m)",
    margin: 0,
  },
  loader: {
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--m)",
  },
  filtersSection: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 150px 80px",
    gap: "12px",
    marginBottom: "24px",
  },
  searchInput: {
    padding: "10px 14px",
    border: "1px solid var(--l)",
    borderRadius: "8px",
    background: "var(--c)",
    color: "var(--t)",
    fontSize: "14px",
  },
  filterSelect: {
    padding: "10px 12px",
    border: "1px solid var(--l)",
    borderRadius: "8px",
    background: "var(--c)",
    color: "var(--t)",
    fontSize: "13px",
  },
  resetBtn: {
    padding: "10px 14px",
    background: "var(--b)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    color: "var(--m)",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "24px",
    maxWidth: "1400px",
  },
  solutionsList: {
    background: "var(--c)",
    border: "1px solid var(--l)",
    borderRadius: "12px",
    padding: "20px",
    maxHeight: "800px",
    overflowY: "auto",
  },
  listTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--n)",
  },
  solutionsGrid: {
    display: "grid",
    gap: "10px",
  },
  solutionCard: {
    padding: "14px",
    background: "var(--bg)",
    border: "1px solid var(--l)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  solutionCardActive: {
    background: "var(--b)",
    color: "#fff",
    borderColor: "var(--b)",
  },
  cardHeader: {
    marginBottom: "8px",
  },
  cardTitle: {
    margin: "0",
    fontSize: "13px",
    fontWeight: "700",
  },
  cardMeta: {
    display: "flex",
    gap: "6px",
    marginBottom: "8px",
    fontSize: "11px",
  },
  badge: {
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "600",
  },
  topic: {
    fontSize: "11px",
    opacity: 0.8,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    opacity: 0.7,
  },
  status: {
    color: "#10b981",
    fontWeight: "600",
  },
  date: {
    fontSize: "10px",
  },
  detailPanel: {
    background: "var(--c)",
    border: "1px solid var(--l)",
    borderRadius: "12px",
    padding: "24px",
    maxHeight: "800px",
    overflowY: "auto",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid var(--l)",
  },
  detailTitle: {
    margin: "0 0 4px 0",
    fontSize: "22px",
    fontWeight: "800",
  },
  detailTopic: {
    margin: 0,
    fontSize: "12px",
    color: "var(--m)",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "var(--m)",
  },
  editorSection: {
    marginBottom: "24px",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--n)",
  },
  editorWrapper: {
    border: "1px solid var(--l)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  outputSection: {
    marginBottom: "24px",
  },
  outputBox: {
    margin: "0",
    padding: "12px",
    background: "#1e1e1e",
    color: "#d4d4d4",
    borderRadius: "8px",
    fontSize: "12px",
    fontFamily: "monospace",
    maxHeight: "200px",
    overflowY: "auto",
  },
  testSection: {
    marginBottom: "24px",
  },
  testResults: {
    display: "grid",
    gap: "8px",
  },
  testResult: {
    padding: "12px",
    background: "var(--bg)",
    borderRadius: "6px",
    fontSize: "12px",
  },
  testDetail: {
    display: "block",
    marginTop: "4px",
    color: "var(--m)",
    fontSize: "11px",
  },
  metadata: {
    paddingTop: "16px",
    borderTop: "1px solid var(--l)",
    display: "grid",
    gap: "12px",
  },
  metadataItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
  },
};

export default SolutionsGallery;