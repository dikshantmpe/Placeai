import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { auth } from "./firebase.js";
import { signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import loginImg from "./assets/login-illustration.png";

function useTypingEffect(texts, speed = 60, pause = 2500) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  
  useEffect(() => {
    const currentText = texts[textIndex];
    let timer;
    if (!isDeleting && currentIndex < currentText.length) {
      timer = setTimeout(() => { setDisplayedText(currentText.slice(0, currentIndex + 1)); setCurrentIndex(i => i + 1); }, speed);
    } else if (!isDeleting && currentIndex === currentText.length) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && currentIndex > 0) {
      timer = setTimeout(() => { setDisplayedText(currentText.slice(0, currentIndex - 1)); setCurrentIndex(i => i - 1); }, speed / 2);
    } else {
      setIsDeleting(false);
      setTextIndex(i => (i + 1) % texts.length);
    }
    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, textIndex, texts, speed, pause]);
  
  return displayedText;
}

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const taglines = ["Prepare Smarter. Get Placed Faster.", "Master DSA with AI.", "Crack Interviews. Land Offers."];
  const displayedText = useTypingEffect(taglines);

  /* ── Note: App.jsx handles auth state globally via onAuthStateChanged.
      Login.jsx only handles the login ACTION, not auth state monitoring. ── */

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(e.target.value && !isValidEmail(e.target.value) ? "Enter a valid email address" : "");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) { setError("Enter a valid email address"); return; }
    if (!password) { setError("Password is required"); return; }
    setIsLoading(true);
    try {
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/login", {
        email: email.toLowerCase(), password
      });
      localStorage.setItem("token", res.data.token);
      // App.jsx detects the auth state change via onAuthStateChanged
      // and will render authenticated routes automatically.
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATED GOOGLE LOGIN WITH PERSISTENCE
  const handleGoogleLogin = async () => {
    setError(""); 
    setIsLoading(true);
    try {
      console.log("1. Google login clicked..."); 
      
      // Force Firebase to remember the user across tab closes and refreshes
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      console.log("2. Opening Firebase popup...");
      const result = await signInWithPopup(auth, provider);
      
      console.log("3. Firebase success! User:", result.user.email);
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: result.user.displayName || result.user.email.split("@")[0],
        email: result.user.email,
        avatar: result.user.photoURL || "",
      });
      
      console.log("4. Backend success! Token received.");
      localStorage.setItem("token", res.data.token);
      // App.jsx will detect the Firebase user via onAuthStateChanged
      // and automatically render authenticated routes.
    } catch (err) {
      console.error("🚨 GOOGLE LOGIN ERROR:", err);
      setError(err.response?.data?.message || err.message || "Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, -apple-system, sans-serif", color: "#172033", background: "#fff" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }
        input::placeholder { color: #7b8494; font-weight: 500; }
        .nav-a:hover { color: #1769e0; }
        .input-wrap { background: #f5f7fa; border: 1px solid #d9e5ef; border-radius: 999px; display: flex; align-items: center; padding: 0 20px; margin-bottom: 12px; transition: all .2s; }
        .input-wrap:focus-within { border-color: #1769e0; background: #fff; box-shadow: 0 0 0 2px rgba(23, 105, 224, 0.1); }
        .input-wrap.err { border-color: #ef4444; }
        .input-wrap input { flex: 1; background: transparent; border: none; outline: none; font-size: 15px; font-weight: 500; padding: 14px 0; color: #10264a; font-family: inherit; }
        .cursor { display: inline-block; width: 2px; height: 1em; background: #1769e0; margin-left: 3px; animation: blink .8s infinite; vertical-align: text-bottom; }
        
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        
        @media (max-width: 900px) { 
          .nav-links-wrap { display: none !important; } 
          .hero-grid { grid-template-columns: 1fr !important; } 
          .art-col { display: none !important; } 
        }
      `}</style>

      {/* NAV */}
      <header style={{ height: 76, display: "flex", alignItems: "center", position: "sticky", top: 0, background: "rgba(255,255,255,.96)", backdropFilter: "blur(12px)", zIndex: 30, borderBottom: "1px solid rgba(20,40,70,.06)" }}>
        <div style={{ width: "min(1180px, calc(100% - 48px))", margin: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 27, fontWeight: 850, letterSpacing: "-1.2px", color: "#10264a" }}>Crackin <b style={{ color: "#1769e0", fontWeight: 850 }}>AI</b></span>
          <div className="nav-links-wrap" style={{ display: "flex", gap: 30, color: "#46536a", fontSize: 14 }}>
            {["Features", "Mock Interview", "Who it's for"].map(l => <a key={l} href="#" className="nav-a" style={{ fontWeight: 500 }}>{l}</a>)}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ borderRadius: 999, padding: "11px 20px", fontWeight: 700, border: "none", background: "transparent", color: "#4b5870", cursor: "pointer", fontFamily: "inherit", fontSize: 14, transition: "0.2s" }}>Sign in</button>
            <Link to="/signup">
              <button style={{ borderRadius: 999, padding: "11px 20px", fontWeight: 700, border: "none", background: "#1769e0", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, transition: "0.2s" }}>Get started</button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ padding: "78px 0 86px", overflow: "hidden" }}>
        <div className="hero-grid" style={{ width: "min(1180px, calc(100% - 48px))", margin: "auto", display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 72, alignItems: "center" }}>

          {/* LEFT */}
          <div>
            <p style={{ color: "#1769e0", fontWeight: 750, fontSize: 14, marginBottom: 18, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 18px" }}>AI-POWERED PLACEMENT PREPARATION</p>
            <h1 style={{ fontSize: 62, lineHeight: 1.02, letterSpacing: "-3px", fontWeight: 420, color: "#10264a", margin: "0 0 24px" }}>
              {displayedText}<span className="cursor" />
            </h1>
            <p style={{ fontSize: 20, lineHeight: 1.55, color: "#536079", maxWidth: 600, margin: "0 0 31px" }}>
              Practice DSA, improve your resume, sharpen aptitude, rehearse interviews, and see where you stand — all in one focused preparation space.
            </p>

            {/* AUTH BLOCK */}
            <div style={{ maxWidth: 430 }}>
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 16px", borderRadius: 12, fontSize: 14, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* UPDATED GOOGLE BUTTON WITH TYPE="BUTTON" */}
              <button type="button" onClick={handleGoogleLogin} disabled={isLoading} style={{ width: "100%", height: 49, marginBottom: 12, background: "#1769e0", color: "#fff", border: "none", borderRadius: 999, fontWeight: 750, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "inherit", opacity: isLoading ? .7 : 1, transition: "0.2s" }}>
                <div style={{ background: "white", padding: "2px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                Continue with Google
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#dfe5ec" }} />
                <span style={{ color: "#a0aab8", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>or sign in with email</span>
                <div style={{ flex: 1, height: 1, background: "#dfe5ec" }} />
              </div>

              <form onSubmit={handleLogin}>
                <div className={`input-wrap${emailError ? " err" : ""}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7b8494" strokeWidth="1.5" style={{ marginRight: 12, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input type="email" value={email} onChange={handleEmailChange} placeholder="Email address" autoComplete="off" required />
                </div>
                {emailError && <p style={{ color: "#ef4444", fontSize: 12, margin: "-8px 0 10px 20px" }}>{emailError}</p>}

                <div className="input-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7b8494" strokeWidth="1.5" style={{ marginRight: 12, flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="off" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7b8494", padding: 4 }}>
                    {showPassword
                      ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    }
                  </button>
                </div>

                <div style={{ textAlign: "right", marginBottom: 16 }}>
                  <a href="#" style={{ color: "#1769e0", fontSize: 13, fontWeight: 700 }}>Forgot password?</a>
                </div>

                <button type="submit" disabled={isLoading || !!emailError} style={{ width: "100%", height: 49, borderRadius: 999, border: "none", background: "#1769e0", color: "#fff", fontWeight: 750, fontSize: 15, cursor: (isLoading || !!emailError) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (isLoading || !!emailError) ? .7 : 1, transition: "0.2s" }}>
                  {isLoading ? "Signing in…" : "Sign in →"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <p style={{ fontSize: 12, color: "#7b8494", margin: "4px 12px 18px", lineHeight: 1.5 }}>
                  By continuing, you agree to Crackin AI's <a href="#" style={{ color: "#1769e0", fontWeight: 700 }}>Terms</a> and <a href="#" style={{ color: "#1769e0", fontWeight: 700 }}>Privacy Policy</a>.
                </p>
                <p style={{ fontSize: 15, color: "#536079", margin: 0 }}>
                  New to Crackin AI? <Link to="/signup" style={{ color: "#1769e0", fontWeight: 700 }}>Create your account</Link>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT - Illustration Image */}
          <div className="art-col" style={{ height: 540, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img 
              src={loginImg} 
              alt="Student preparing with Crackin AI" 
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
            />
          </div>

        </div>
      </section>
    </div>
  );
}