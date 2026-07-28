import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "./firebase.js";
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
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

export default function Login({ setUser }) {
  const [isLoadingProvider, setIsLoadingProvider] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const taglines = ["Prepare Smarter. Get Placed Faster.", "Master DSA with AI.", "Crack Interviews. Land Offers."];
  const displayedText = useTypingEffect(taglines);

  // Automatically redirect if already logged in via Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard'); // Change this route if your protected route is different
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // UNIFIED OAUTH HANDLER (Google & GitHub) - Pure Firebase
  const handleOAuthSignIn = async (providerName) => {
    setError(""); 
    setIsLoadingProvider(providerName);
    try {
      // Force Firebase to remember the user across tab closes and refreshes
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = providerName === 'google' 
        ? new GoogleAuthProvider() 
        : new GithubAuthProvider();
        
      if (providerName === 'google') {
        provider.setCustomParameters({ prompt: "select_account" });
      }
      
      await signInWithPopup(auth, provider);
      // Success! onAuthStateChanged will detect the user and redirect automatically.
      // No backend axios calls needed anymore.
    } catch (err) {
      console.error(`🚨 ${providerName.toUpperCase()} LOGIN ERROR:`, err);
      setError(err.message || `${providerName} sign-in failed.`);
      setIsLoadingProvider(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter, ui-sans-serif, -apple-system, sans-serif", color: "#172033", background: "#fff" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }
        .nav-a:hover { color: #1769e0; }
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

              {/* GOOGLE BUTTON */}
              <button 
                type="button" 
                onClick={() => handleOAuthSignIn('google')} 
                disabled={isLoadingProvider !== null} 
                style={{ width: "100%", height: 49, marginBottom: 12, background: "#1769e0", color: "#fff", border: "none", borderRadius: 999, fontWeight: 750, fontSize: 15, cursor: isLoadingProvider ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "inherit", opacity: isLoadingProvider ? .7 : 1, transition: "0.2s" }}
              >
                <div style={{ background: "white", padding: "2px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                {isLoadingProvider === 'google' ? 'Signing in...' : 'Continue with Google'}
              </button>

              {/* GITHUB BUTTON */}
              <button 
                type="button" 
                onClick={() => handleOAuthSignIn('github')} 
                disabled={isLoadingProvider !== null} 
                style={{ width: "100%", height: 49, marginBottom: 12, background: "#24292e", color: "#fff", border: "none", borderRadius: 999, fontWeight: 750, fontSize: 15, cursor: isLoadingProvider ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "inherit", opacity: isLoadingProvider ? .7 : 1, transition: "0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
                {isLoadingProvider === 'github' ? 'Signing in...' : 'Continue with GitHub'}
              </button>

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