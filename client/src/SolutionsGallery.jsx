import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

const SolutionsGallery = () => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("crackin-theme") || "light");

  const auth = getAuth();

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark" : "";
    localStorage.setItem("crackin-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("Please log in to view solutions");
      return null;
    }
    try {
      return await user.getIdToken();
    } catch (err) {
      console.error("Error getting auth token:", err);
      return null;
    }
  };

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        setError("Authentication failed. Please log in again.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (selectedTopic) params.append("topic", selectedTopic);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
      if (searchQuery) params.append("search", searchQuery);

      console.log("Fetching solutions with params:", params.toString());

      const response = await fetch(`/api/dsa/solutions?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Solutions response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Solutions fetched:", data);

      setSolutions(data.solutions || []);
      if (data.solutions?.length === 0) {
        setError("No solutions found. Solve some problems first!");
      }
    } catch (err) {
      console.error("Error fetching solutions:", err);
      setError(err.message || "Failed to fetch solutions");
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTopic("");
    setSelectedDifficulty("");
  };

  const filteredSolutions = solutions.filter((solution) => {
    const matchesSearch = solution.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = !selectedTopic || solution.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || solution.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const topics = [...new Set(solutions.map((s) => s.topic))];
  const difficulties = ["Easy", "Medium", "Hard"];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "#10b981";
      case "Medium":
        return "#f59e0b";
      case "Hard":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={styles.container} className={theme}>
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
        <div>
          <h1 style={styles.title}>🎨 Solutions Gallery</h1>
          <p style={styles.subtitle}>View all your saved code solutions</p>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <input
          type="text"
          placeholder="Search problems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          style={styles.select}
        >
          <option value="">All topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          style={styles.select}
        >
          <option value="">All difficulties</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </select>

        <button onClick={resetFilters} style={styles.resetBtn}>
          Reset
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.loading}>Loading solutions...</div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : filteredSolutions.length === 0 ? (
        <div style={styles.empty}>
          No solutions found. Start solving problems to see them here! 🚀
        </div>
      ) : (
        <div style={styles.solutionsGrid}>
          {filteredSolutions.map((solution) => (
            <div
              key={solution._id}
              style={styles.solutionCard}
              onClick={() => setExpandedId(expandedId === solution._id ? null : solution._id)}
            >
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.solutionName}>{solution.name}</h3>
                  <p style={styles.solutionTopic}>{solution.topic}</p>
                </div>
                <span
                  style={{
                    ...styles.difficultBadge,
                    backgroundColor: getDifficultyColor(solution.difficulty),
                  }}
                >
                  {solution.difficulty}
                </span>
              </div>

              <div style={styles.cardMeta}>
                <span>⏱️ {solution.timeSpent} min</span>
                <span>
                  📅 {solution.solvedAt
                    ? new Date(solution.solvedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              {expandedId === solution._id && (
                <div style={styles.expandedContent}>
                  {solution.code && (
                    <div style={styles.codeSection}>
                      <h4>Your Solution</h4>
                      <pre style={styles.codeBlock}>{solution.code}</pre>
                    </div>
                  )}

                  {solution.testResults && solution.testResults.length > 0 && (
                    <div style={styles.testsSection}>
                      <h4>Test Results</h4>
                      {solution.testResults.map((test, idx) => (
                        <div
                          key={idx}
                          style={{
                            ...styles.testResult,
                            borderLeftColor: test.passed ? "#10b981" : "#ef4444",
                          }}
                        >
                          <span>{test.passed ? "✓" : "✗"} {test.testName}</span>
                          {test.input && (
                            <small>Input: {test.input}</small>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {solution.notes && (
                    <div style={styles.notesSection}>
                      <h4>Notes</h4>
                      <p>{solution.notes}</p>
                    </div>
                  )}

                  {solution.link && (
                    <a
                      href={solution.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.problemLink}
                    >
                      View on LeetCode →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--bg)",
    color: "var(--t)",
    minHeight: "100vh",
    padding: "24px",
  },
  header: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid var(--l)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "900",
    margin: "0 0 8px 0",
    color: "var(--n)",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--m)",
    margin: "0",
  },
  filterSection: {
    display: "grid",
    gridTemplateColumns: "1fr 200px 200px 100px",
    gap: "12px",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "var(--c)",
    borderRadius: "12px",
    border: "1px solid var(--l)",
  },
  searchInput: {
    padding: "10px 14px",
    border: "1px solid var(--l)",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "var(--bg)",
    color: "var(--t)",
    outline: "none",
  },
  select: {
    padding: "10px 14px",
    border: "1px solid var(--l)",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "var(--bg)",
    color: "var(--t)",
    outline: "none",
  },
  resetBtn: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "var(--b)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },
  loading: {
    textAlign: "center",
    padding: "60px 24px",
    fontSize: "16px",
    color: "var(--m)",
  },
  error: {
    textAlign: "center",
    padding: "24px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  empty: {
    textAlign: "center",
    padding: "60px 24px",
    fontSize: "16px",
    color: "var(--m)",
  },
  solutionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
  },
  solutionCard: {
    backgroundColor: "var(--c)",
    border: "1px solid var(--l)",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "12px",
  },
  solutionName: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 4px 0",
    color: "var(--n)",
  },
  solutionTopic: {
    fontSize: "12px",
    color: "var(--m)",
    margin: "0",
  },
  difficultBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  cardMeta: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "var(--m)",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--l)",
  },
  expandedContent: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid var(--l)",
  },
  codeSection: {
    marginBottom: "16px",
  },
  codeBlock: {
    backgroundColor: "var(--bg)",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "12px",
    overflow: "auto",
    border: "1px solid var(--l)",
    lineHeight: "1.5",
    margin: "8px 0 0 0",
  },
  testsSection: {
    marginBottom: "16px",
  },
  testResult: {
    padding: "10px",
    backgroundColor: "var(--bg)",
    borderLeft: "3px solid #10b981",
    borderRadius: "4px",
    fontSize: "12px",
    marginBottom: "8px",
  },
  notesSection: {
    marginBottom: "16px",
  },
  problemLink: {
    display: "inline-block",
    color: "var(--b)",
    fontWeight: "700",
    textDecoration: "none",
    marginTop: "12px",
  },
};

export default SolutionsGallery;