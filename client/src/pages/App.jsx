import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import Topbar from "../components/Topbar";
import DSATracker from "../DSATracker";
import ProblemDetail from "./ProblemDetail.jsx";
import ResumeAnalyzer from "../ResumeAnalyzer";
import MockInterview from "../MockInterview";
import Dashboard from "../Dashboard";
import Chatbot from "../Chatbot";
import Login from "../Login";
import Profile from "../Profile";
import Home from "../Home";
import Signup from "../Signup";
import ComingSoon from "../ComingSoon";
import SolutionsGallery from "../SolutionsGallery";

/* ── TopbarWrapper: Hides Topbar on landing page ("/") ── */
function TopbarWrapper(props) {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  if (isLandingPage) return null; // No topbar on landing page

  return <Topbar {...props} />;
}

export default function App() {
  /* ── Wake up backend ── */
  useEffect(() => {
    fetch("https://placeai-sqjj.onrender.com/api/ping").catch(() => {});
  }, []);

  /* ── Auth state: Firebase + JWT Token ── */
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Check if JWT token exists in localStorage (from Google Sign-In)
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      console.log("✅ JWT token found in localStorage - user stays signed in");
    }

    // Firebase persists auth via IndexedDB (not localStorage).
    // This listener fires on every page load with the current user (or null).
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — keep the full Firebase user object
        setUser(firebaseUser);
        // Also store a minimal serializable copy for components that need it
        localStorage.setItem("user", JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }));
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setToken(null);
      }
      setAuthResolved(true);
    });

    return () => unsubscribe();
  }, []);

  /* ── Logout Function ── */
  const handleLogout = async () => {
    try {
      // Clear JWT token
      localStorage.removeItem("token");
      setToken(null);

      // Sign out from Firebase
      await signOut(auth);
      setUser(null);

      console.log("✅ User logged out successfully");
      window.location.href = "/"; // Redirect to home
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /* ── Shared theme state (lifted up so Topbar + Dashboard stay in sync) ── */
  const [theme, setTheme] = useState(
    localStorage.getItem("crackin-theme") || "light"
  );

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("crackin-theme", newTheme);
  };

  /* ── Show loading spinner while Firebase checks auth state ── */
  if (!authResolved) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: theme === "dark" ? "#171a1f" : "#f3f2ef",
        gap: 16,
      }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: "50%",
          border: "3px solid #dfe5ec",
          borderTopColor: "#1769e0",
          animation: "spin 0.9s linear infinite",
        }} />
        <p style={{ color: "#68758a", fontSize: 14, fontWeight: 500 }}>
          Checking authentication…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <>
          {/* ═══════ GLOBAL TOPBAR ═══════
              Hidden on landing page ("/") — only show on authenticated feature pages 
              Now includes handleLogout for logout functionality */}
          <TopbarWrapper
            user={user}
            setUser={setUser}
            theme={theme}
            onThemeChange={handleThemeChange}
            onLogout={handleLogout}
          />

          {/* ═══════ PAGE CONTENT ═══════ */}
          <main style={{ minHeight: "100vh", position: "relative" }}>
            <Routes>
              {/* Authenticated user redirects to Dashboard instead of seeing Home/Login */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/profile" element={<Profile user={user} setUser={setUser} theme={theme} />} />
              <Route path="/dashboard" element={<Dashboard theme={theme} />} />
              
              <Route path="/daily" element={<ComingSoon theme={theme} />} />
              <Route path="/dsa" element={<DSATracker theme={theme} />} />
              <Route path="/problem/:id" element={<ProblemDetail theme={theme} />} />
              <Route path="/resume" element={<ResumeAnalyzer theme={theme} />} />
              <Route path="/interview" element={<MockInterview theme={theme} />} />
              <Route path="/quiz" element={<ComingSoon theme={theme} />} />
              <Route path="/company" element={<ComingSoon theme={theme} />} />
              <Route path="/solutions" element={<SolutionsGallery />} />
              {/* "Coming Soon" component implemented as a fallback for incomplete routes */}
              <Route path="*" element={<ComingSoon theme={theme} />} />
            </Routes>
            <Chatbot theme={theme} />
          </main>
        </>
      )}
    </BrowserRouter>
  );
}