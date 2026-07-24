import React, { useState, useEffect } from "react";
import api from "./api.js";

const ProblemDetail = ({ problemId, onClose }) => {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your solution here...\n");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // Fetch problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        // Mock problem data - replace with actual API call if needed
        const mockProblems = {
          "twosum": {
            id: "twosum",
            name: "Two Sum",
            difficulty: "Easy",
            description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
            testCases: [
              { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
              { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
              { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
            ]
          }
        };
        setProblem(mockProblems[problemId] || mockProblems["twosum"]);
      } catch (err) {
        console.error("Error fetching problem:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  // Update time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Run code against test cases
  const runCode = async () => {
    if (!problem) return;

    setOutput("Running tests...\n");
    const results = [];
    let allPassed = true;

    try {
      // Create a function from user code
      const userFunction = new Function("nums", "target", code);

      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        try {
          const result = userFunction(testCase.input.nums, testCase.input.target);
          const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);

          results.push({
            id: i,
            input: testCase.input,
            expected: testCase.expected,
            output: result,
            passed
          });

          if (!passed) allPassed = false;

          setOutput(prev => 
            prev + `Test ${i + 1}: ${passed ? "✓ PASSED" : "✗ FAILED"}\n` +
            `  Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}\n` +
            `  Expected: ${JSON.stringify(testCase.expected)}\n` +
            `  Got: ${JSON.stringify(result)}\n\n`
          );
        } catch (err) {
          allPassed = false;
          results.push({
            id: i,
            input: testCase.input,
            expected: testCase.expected,
            output: null,
            passed: false,
            error: err.message
          });

          setOutput(prev => 
            prev + `Test ${i + 1}: ✗ ERROR\n` +
            `  Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}\n` +
            `  Error: ${err.message}\n\n`
          );
        }
      }

      setTestResults(results);
      
      if (allPassed) {
        setStatus("solved");
        setOutput(prev => prev + "\n🎉 All tests passed! Solution is correct!");
      } else {
        setStatus("pending");
        setOutput(prev => prev + "\n❌ Some tests failed. Please fix your solution.");
      }
    } catch (err) {
      setStatus("pending");
      setOutput(`Error executing code: ${err.message}`);
    }
  };

  // Save solution
  const saveSolution = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? `https://placeai-sqjj.onrender.com/api/dsa/progress/${problemId}`
        : `http://localhost:5001/api/dsa/progress/${problemId}`;

      await api.put(apiUrl, {
        status,
        code,
        timeSpent,
        testResults
      });

      alert(`✓ Solution saved as ${status.toUpperCase()}`);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save solution");
    }
  };

  if (loading) {
    return <div style={styles.modal}>Loading...</div>;
  }

  if (!problem) {
    return <div style={styles.modal}>Problem not found</div>;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Left Panel - Problem Statement */}
        <div style={styles.leftPanel}>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
          
          <h1 style={styles.title}>{problem.name}</h1>
          <span style={{
            ...styles.badge,
            background: problem.difficulty === "Easy" ? "#e1f3ec" : problem.difficulty === "Medium" ? "#fff0cb" : "#fde3e3",
            color: problem.difficulty === "Easy" ? "#20705d" : problem.difficulty === "Medium" ? "#946315" : "#ad3f3f"
          }}>
            {problem.difficulty}
          </span>

          <h3 style={styles.sectionTitle}>Description</h3>
          <p style={styles.description}>{problem.description}</p>

          <h3 style={styles.sectionTitle}>Example Test Cases</h3>
          {problem.testCases.map((tc, idx) => (
            <div key={idx} style={styles.testCase}>
              <strong>Test {idx + 1}:</strong>
              <div style={styles.codeBlock}>
                Input: nums = {JSON.stringify(tc.input.nums)}, target = {tc.input.target}
              </div>
              <div style={styles.codeBlock}>
                Output: {JSON.stringify(tc.expected)}
              </div>
            </div>
          ))}

          <h3 style={styles.sectionTitle}>Update Progress</h3>
          <div style={styles.progressSection}>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={styles.select}
            >
              <option value="pending">Pending</option>
              <option value="solved">Solved</option>
              <option value="revision_needed">Revision Needed</option>
            </select>
            <p style={styles.timeSpent}>Time spent: {timeSpent} min</p>
            <button style={styles.saveBtn} onClick={saveSolution}>
              Save Progress
            </button>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div style={styles.rightPanel}>
          <div style={styles.editorHeader}>
            <span>JavaScript</span>
            <div style={styles.buttons}>
              <button style={styles.runBtn} onClick={runCode}>
                Run Code
              </button>
              <button style={styles.saveCodeBtn} onClick={saveSolution}>
                Save Code
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={styles.editor}
            spellCheck="false"
          />

          <div style={styles.outputSection}>
            <h4 style={styles.outputTitle}>
              Output:
              {status === "solved" && <span style={styles.solved}> ✓ SOLVED</span>}
              {status === "pending" && testResults.length > 0 && <span style={styles.error}> ✗ ERROR</span>}
            </h4>
            <pre style={styles.output}>{output || "Run code to see output..."}</pre>
          </div>

          {testResults.length > 0 && (
            <div style={styles.testResultsSection}>
              <h4>Test Results</h4>
              {testResults.map((result, idx) => (
                <div key={idx} style={{
                  ...styles.testResult,
                  borderLeft: `4px solid ${result.passed ? "#10b981" : "#ef4444"}`
                }}>
                  <span style={{
                    color: result.passed ? "#10b981" : "#ef4444",
                    fontWeight: "bold"
                  }}>
                    Test {result.id + 1}: {result.passed ? "✓ PASSED" : "✗ FAILED"}
                  </span>
                  {result.error && <p style={styles.errorMsg}>Error: {result.error}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px"
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    width: "100%",
    maxWidth: "1400px",
    height: "90vh",
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#68758a",
    zIndex: 10
  },
  leftPanel: {
    padding: "30px",
    overflow: "auto",
    borderRight: "1px solid #dedbd5",
    position: "relative"
  },
  title: {
    fontSize: "28px",
    margin: "0 0 10px 0",
    color: "#10264a"
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"
  },
  sectionTitle: {
    fontSize: "16px",
    marginTop: "20px",
    marginBottom: "10px",
    color: "#10264a",
    fontWeight: "700"
  },
  description: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#172033"
  },
  testCase: {
    background: "#f3f2ef",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "10px",
    fontSize: "13px"
  },
  codeBlock: {
    background: "#fff",
    padding: "8px",
    borderRadius: "4px",
    marginTop: "6px",
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#1769e0"
  },
  progressSection: {
    marginTop: "15px"
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #dedbd5",
    fontSize: "14px",
    marginBottom: "10px"
  },
  timeSpent: {
    fontSize: "12px",
    color: "#68758a",
    margin: "8px 0"
  },
  saveBtn: {
    width: "100%",
    padding: "10px",
    background: "#1769e0",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    background: "#1e1e1e",
    color: "#d4d4d4"
  },
  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #3e3e42",
    background: "#252526"
  },
  buttons: {
    display: "flex",
    gap: "8px"
  },
  runBtn: {
    padding: "6px 16px",
    background: "#1769e0",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px"
  },
  saveCodeBtn: {
    padding: "6px 16px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px"
  },
  editor: {
    flex: 1,
    padding: "16px",
    background: "#1e1e1e",
    color: "#d4d4d4",
    border: "none",
    fontFamily: "Consolas, 'Courier New', monospace",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "none",
    outline: "none"
  },
  outputSection: {
    padding: "12px 16px",
    borderTop: "1px solid #3e3e42",
    background: "#252526"
  },
  outputTitle: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    fontWeight: "600",
    color: "#d4d4d4"
  },
  solved: {
    color: "#10b981",
    fontWeight: "700"
  },
  error: {
    color: "#ef4444",
    fontWeight: "700"
  },
  output: {
    margin: "0",
    padding: "8px",
    background: "#1e1e1e",
    color: "#d4d4d4",
    borderRadius: "4px",
    fontSize: "12px",
    maxHeight: "100px",
    overflow: "auto",
    fontFamily: "monospace"
  },
  testResultsSection: {
    padding: "12px 16px",
    borderTop: "1px solid #3e3e42",
    maxHeight: "100px",
    overflow: "auto"
  },
  testResult: {
    padding: "8px",
    marginBottom: "4px",
    background: "#2d2d30",
    borderRadius: "4px",
    fontSize: "12px"
  },
  errorMsg: {
    color: "#ef4444",
    margin: "4px 0 0 0",
    fontSize: "11px"
  }
};

export default ProblemDetail;