import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase.js"; 
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Email validation
  const isValidEmail = (emailValue) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  };

  // Password validation
  const isValidPassword = (passwordValue) => {
    if (passwordValue.length < 8) return false;
    if (!/[A-Z]/.test(passwordValue)) return false;
    if (!/[a-z]/.test(passwordValue)) return false;
    if (!/[0-9]/.test(passwordValue)) return false;
    if (!/[^a-zA-Z0-9]/.test(passwordValue)) return false;
    return true;
  };

  // Get password strength
  const getPasswordStrength = (passwordValue) => {
    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (passwordValue.length >= 12) score++;
    if (/[a-z]/.test(passwordValue)) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^a-zA-Z0-9]/.test(passwordValue)) score++;

    const strengths = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    return strengths[Math.min(score - 1, 4)] || "Weak";
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    if (emailValue && !isValidEmail(emailValue)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    setPasswordStrength(getPasswordStrength(passwordValue));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate all fields
    if (!name.trim()) {
      setError("Full name is required");
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be 8+ chars with uppercase, lowercase, number, and special character");
      setIsLoading(false);
      return;
    }

    try {
      // Call backend API
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/register", {
        name: name.trim(),
        email: email.toLowerCase(),
        password: password
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "",
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      title: "AI-Powered",
      desc: "Resume & Interviews",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M17 7h4v4" />
        </svg>
      ),
      title: "Track Progress",
      desc: "Smart Analytics",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 2v4M16 2v4" />
        </svg>
      ),
      title: "Daily Challenges",
      desc: "DSA & Aptitude",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
          <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      ),
      title: "Insights",
      desc: "Company Questions",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      position: "relative",
      overflow: "hidden", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      color: "#1f2937",
      background: "#f8fafc",
      padding: "2rem"
    }}>
      <style>{`
        .glass-input {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        .glass-input.focused {
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
          border-color: #14b8a6;
        }
        .glass-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        input::placeholder { color: #94a3b8; }

        .feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .signup-panel {
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          padding: 2.5rem 3rem;
        }
      `}</style>

      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "1100px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "4rem",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.8s ease-in"
      }}>

        {/* LEFT COLUMN: Text & Feature Cards */}
        <div style={{
          flex: "1 1 380px", 
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          zIndex: 10
        }}>

          <div>
            <h1 style={{ fontSize: "3rem", fontWeight: "800", lineHeight: "1.1", margin: "0 0 0.5rem 0", color: "#1f2937" }}>
              Start Your <span style={{ color: "#14b8a6" }}>Journey.</span>
            </h1>
            <div style={{ 
              display: "inline-block", padding: "6px 14px", borderRadius: "20px",
              background: "#f0fdfa", border: "1px solid #ccfbf1",
              color: "#0f766e", fontSize: "0.9rem", marginTop: "8px", fontWeight: "600"
            }}>
              ✦ Master DSA & Crack Interviews
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: "1.25rem", 
            maxWidth: "420px",
            alignItems: "start"
          }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ marginTop: i % 2 !== 0 ? "3.5rem" : "0" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px", background: "#f0fdfa", border: "1px solid #ccfbf1",
                  color: "#14b8a6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px"
                }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px", color: "#1f2937" }}>{f.title}</div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", lineHeight: "1.4" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Signup Panel with Logo on top */}
        <div style={{ flex: "0 1 420px", zIndex: 10 }}>
          <div className="signup-panel">

            {/* Logo centered at top of signup panel */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "800", fontSize: "1.4rem", color: "white",
                marginBottom: "12px",
                boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)"
              }}>
                C
              </div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#1f2937" }}>
                Crackin <span style={{ color: "#14b8a6" }}>Ai</span>
              </h2>
            </div>

            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", margin: "0 0 0.5rem 0", lineHeight: 1.15, color: "#1f2937", textAlign: "center" }}>
              Create Account
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 2rem 0", textAlign: "center" }}>
              Join Crackin Ai to accelerate your placement journey.
            </p>

            <form onSubmit={handleSignup}>

              {error && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
                  padding: "10px 14px", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1.25rem", textAlign: "center", fontWeight: "600"
                }}>
                  {error}
                </div>
              )}

              {/* Full Name Input */}
              <div className={`glass-input`} style={{
                borderRadius: "14px", marginBottom: "1rem", display: "flex", alignItems: "center", padding: "0 16px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" style={{ flexShrink: 0, marginRight: "12px" }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Full Name"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#1f2937", fontSize: "1rem", padding: "14px 0" }}
                  required
                />
              </div>

              {/* Email Input */}
              <div className={`glass-input ${emailError ? "error" : focusedField === "email" ? "focused" : ""}`} style={{
                borderRadius: "14px", marginBottom: emailError ? "0.5rem" : "1rem", display: "flex", alignItems: "center", padding: "0 16px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" style={{ flexShrink: 0, marginRight: "12px" }}>
                  <path d="M3 7l9 6 9-6" />
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#1f2937", fontSize: "1rem", padding: "14px 0" }}
                  required
                />
              </div>
              {emailError && (
                <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem" }}>
                  {emailError}
                </div>
              )}

              {/* Password Input */}
              <div className={`glass-input ${focusedField === "password" ? "focused" : ""}`} style={{
                borderRadius: "14px", marginBottom: "1rem", display: "flex", alignItems: "center", padding: "0 16px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" style={{ flexShrink: 0, marginRight: "12px" }}>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create a Password"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#1f2937", fontSize: "1rem", padding: "14px 0" }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.7 18.7 0 0 1-2.16 3.19" /><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" /><path d="M1 1l22 22" /></svg>
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "#64748b" }}>
                  Password Strength: <span style={{ fontWeight: "600", color: passwordStrength === "Very Strong" ? "#22c55e" : passwordStrength === "Strong" ? "#3b82f6" : passwordStrength === "Good" ? "#eab308" : "#ef4444" }}>
                    {passwordStrength}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || emailError || (password && !isValidPassword(password))}
                style={{
                  width: "100%", padding: "14px", borderRadius: "14px", border: "none", 
                  cursor: (isLoading || emailError || (password && !isValidPassword(password))) ? "not-allowed" : "pointer",
                  background: "linear-gradient(90deg, #0d9488, #14b8a6)",
                  color: "white", fontSize: "1rem", fontWeight: "700",
                  boxShadow: "0 4px 15px rgba(13, 148, 136, 0.3)",
                  transition: "all 0.3s ease",
                  opacity: (isLoading || emailError || (password && !isValidPassword(password))) ? 0.7 : 1
                }}
              >
                {isLoading ? "Creating Account..." : "Sign Up →"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "1.5rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>or continue with</span>
              <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="glass-input"
              style={{
                width: "100%", padding: "12px", borderRadius: "14px", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "12px", cursor: isLoading ? "not-allowed" : "pointer", 
                fontSize: "0.95rem", fontWeight: "600", color: "#374151", opacity: isLoading ? 0.7 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.9rem" }}>
              Already have an account?{" "}
              <Link to="/" style={{ color: "#14b8a6", textDecoration: "none", fontWeight: "700" }}>Login</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}