import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// --- FIREBASE IMPORTS ---
import { auth } from "./firebase.js"; 
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

// Custom hook for typing animation
function useTypingEffect(texts, speed = 80, pause = 2000) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const currentText = texts[textIndex];
    let timer;

    if (!isDeleting && currentIndex < currentText.length) {
      timer = setTimeout(() => {
        setDisplayedText(currentText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
    } else if (!isDeleting && currentIndex === currentText.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pause);
    } else if (isDeleting && currentIndex > 0) {
      timer = setTimeout(() => {
        setDisplayedText(currentText.slice(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      }, speed / 2);
    } else if (isDeleting && currentIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, textIndex, texts, speed, pause]);

  return { displayedText, isDeleting };
}

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const navigate = useNavigate();

  const taglines = [
    "Prepare Smarter. Get Placed Faster.",
    "Master DSA with AI.",
    "Crack Interviews. Land Offers.",
  ];
  const { displayedText } = useTypingEffect(taglines, 60, 2500);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setEmail("");
      setPassword("");
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      if (emailInput) emailInput.value = "";
      if (passwordInput) passwordInput.value = "";
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        navigate("/", { replace: true });
      } else {
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate, setUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "",
      });
      localStorage.setItem("token", res.data.token);
      setUser(firebaseUser);
      navigate("/", { replace: true });
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      if (!auth) {
        setError("Authentication service not initialized. Please refresh the page.");
        setIsLoading(false);
        return;
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "",
      });
      localStorage.setItem("token", res.data.token);
      setUser(firebaseUser);
      navigate("/", { replace: true });
    } catch (err) {
      setError(`Sign-in failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError("GitHub login not configured yet.");
  };

  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: "100vh", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#111827", background: "#ffffff",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            border: "3px solid rgba(20,184,166,0.3)",
            borderTop: "3px solid #14b8a6",
            animation: "spin 1s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>Signing you in...</p>
        </div>
        <style dangerouslySetInnerHTML={{ __html: "@keyframes spin { to { transform: rotate(360deg); } }" }} />
      </div>
    );
  }

  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      title: "DSA Tracker",
      desc: "Track your DSA progress, solve curated problems and master algorithms.",
      color: "#14b8a6",
      arrowColor: "#14b8a6"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Mock Interview",
      desc: "AI-powered mock interviews with real-time feedback to improve performance.",
      color: "#8b5cf6",
      arrowColor: "#8b5cf6"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      title: "Company Questions",
      desc: "Access real interview questions asked by top companies.",
      color: "#22c55e",
      arrowColor: "#22c55e"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      title: "Resume Analyser",
      desc: "AI reviews your resume and gives actionable suggestions.",
      color: "#f59e0b",
      arrowColor: "#f59e0b"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      title: "Aptitude Quiz",
      desc: "Practice aptitude, logical reasoning and verbal ability with AI quizzes.",
      color: "#ec4899",
      arrowColor: "#ec4899"
    },
  ];

  const navLinks = ["Features", "How It Works", "Roadmap", "Pricing", "About Us"];

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#111827", background: "#ffffff",
    }}>
      <style>{`
        input::placeholder { color: #9ca3af; }
        
        .typing-cursor {
          display: inline-block;
          width: 3px;
          height: 1em;
          background: #14b8a6;
          margin-left: 4px;
          animation: blink 0.8s infinite;
          vertical-align: text-bottom;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @media (max-width: 1024px) {
          .login-layout { flex-direction: column !important; padding: 1rem !important; }
          .left-section { max-width: 100% !important; }
          .right-section { width: 100% !important; max-width: 480px !important; margin: 0 auto !important; }
        }
        @media (max-width: 640px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2.5rem", maxWidth: "1400px", width: "100%", margin: "0 auto",
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #0d9488, #14b8a6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "800", fontSize: "1.1rem", color: "white"
          }}>
            C
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111827" }}>Crackin AI</div>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
          </div>
        </div>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {navLinks.map((link) => (
            <a key={link} href="#" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>{link}</a>
          ))}
        </div>

        <div>
          <button style={{
            padding: "8px 20px", borderRadius: "8px",
            background: "linear-gradient(135deg, #0d9488, #14b8a6)",
            border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem",
            cursor: "pointer"
          }}>
            Get Started
          </button>
        </div>
      </nav>

      <div className="login-layout" style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        gap: "4rem", padding: "2rem 3rem", maxWidth: "1400px", margin: "0 auto",
        width: "100%", boxSizing: "border-box",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.6s ease"
      }}>

        <div className="left-section" style={{ flex: "1", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 16px", borderRadius: "20px",
              background: "rgba(20, 184, 166, 0.08)", border: "1px solid rgba(20, 184, 166, 0.15)",
              color: "#0d9488", fontSize: "0.75rem", fontWeight: "600",
              letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem"
            }}>
              AI POWERED PLACEMENT PREPARATION ✨
            </div>
            
            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: "800",
              lineHeight: "1.15", margin: "0 0 1rem 0", letterSpacing: "-0.02em", minHeight: "1.2em",
              color: "#111827"
            }}>
              <span>{displayedText}</span>
              <span className="typing-cursor" />
            </h1>
            
            <p style={{
              color: "#6b7280", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "480px", margin: 0
            }}>
              Crackin AI is your all-in-one platform to master DSA, Aptitude, System Design, and Interviews with the power of AI.
            </p>
          </div>

          <div className="feature-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem"
          }}>
            {features.map((f, i) => (
              <div 
                key={i}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: `${f.color}14`, border: `1px solid ${f.color}26`,
                  color: f.color, display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "12px"
                }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "6px", color: "#111827" }}>{f.title}</div>
                <div style={{ color: "#6b7280", fontSize: "0.78rem", lineHeight: "1.5" }}>{f.desc}</div>
                <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "4px", color: f.arrowColor, fontSize: "0.8rem", fontWeight: "600" }}>
                  Learn more <span style={{ fontSize: "1rem" }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-section" style={{ width: "420px", flexShrink: 0 }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            padding: "2.5rem"
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0", color: "#111827" }}>
                Welcome Back! 👋
              </h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
                Sign in to continue your learning journey
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem" }}>
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  color: "#374151", fontSize: "0.85rem", fontWeight: "500",
                  background: "#ffffff", border: "1px solid #d1d5db", cursor: "pointer"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button 
                onClick={handleGitHubLogin}
                disabled={isLoading}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  color: "#374151", fontSize: "0.85rem", fontWeight: "500",
                  background: "#ffffff", border: "1px solid #d1d5db", cursor: "pointer"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ color: "#9ca3af", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>or continue with email</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            <form onSubmit={handleLogin} autoComplete="off">
              {error && (
                <div style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#ef4444", padding: "10px 14px", borderRadius: "10px",
                  fontSize: "0.85rem", marginBottom: "1rem", textAlign: "center"
                }}>
                  {error}
                </div>
              )}

              <div style={{
                background: "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", padding: "0 14px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" style={{ flexShrink: 0, marginRight: "10px" }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="new-email"
                  spellCheck="false"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "#111827", fontSize: "0.95rem", padding: "14px 0"
                  }}
                  required
                />
              </div>

              <div style={{
                background: "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", padding: "0 14px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" style={{ flexShrink: 0, marginRight: "10px" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  spellCheck="false"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "#111827", fontSize: "0.95rem", padding: "14px 0"
                  }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px"
                }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                  )}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#6b7280", fontSize: "0.85rem" }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ 
                      width: "16px", height: "16px", borderRadius: "4px",
                      accentColor: "#14b8a6", cursor: "pointer"
                    }}
                  />
                  Remember me
                </label>
                <a href="#" style={{ color: "#0d9488", fontSize: "0.85rem", textDecoration: "none", fontWeight: "500" }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" disabled={isLoading} style={{
                width: "100%", padding: "14px", borderRadius: "12px",
                color: "white", fontSize: "1rem", fontWeight: "600",
                background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                border: "none", cursor: "pointer"
              }}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "1.5rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Don't have an account?</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            <Link to="/signup" style={{
              display: "block", width: "100%", padding: "12px", borderRadius: "12px",
              background: "transparent", border: "1px solid #14b8a6",
              color: "#14b8a6", fontSize: "0.95rem", fontWeight: "600",
              textAlign: "center", textDecoration: "none"
            }}>
              Sign Up for Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}