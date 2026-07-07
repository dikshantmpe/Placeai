import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// --- FIREBASE IMPORTS ---
import { auth } from "./firebase.js"; 
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isFormHovered, setIsFormHovered] = useState(false);
  const [hoveredCube, setHoveredCube] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Clear autofill on mount
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

  // Simplified Auth Listener (Routes to Home now)
  useEffect(() => {
    console.log("🔍 Auth listener mounted...");
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Persistent user session detected:", user.email);
        setUser(user);
        navigate("/", { replace: true }); // <--- CHANGED TO "/"
      } else {
        console.log("📝 No active session found. Ready for login.");
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  // Vanta initialization
  useEffect(() => {
    let cancelled = false;

    async function initVanta() {
      try {
        const originalWarn = console.warn;
        const originalError = console.error;
        
        console.warn = function(...args) {
          const msg = (args[0]?.toString?.() || args.join(" "));
          if (msg.includes("Cross-Origin") || msg.includes("window") || msg.includes("blocked")) return;
          originalWarn.apply(console, args);
        };
        
        console.error = function(...args) {
          const msg = (args[0]?.toString?.() || args.join(" "));
          if (msg.includes("Cross-Origin") || msg.includes("window") || msg.includes("blocked")) return;
          originalError.apply(console, args);
        };

        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js");

        if (cancelled || !vantaRef.current || vantaEffect.current) return;

        if (window.VANTA && window.VANTA.NET) {
          vantaEffect.current = window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xff3f81,
            backgroundColor: 0x14101f,
            points: 11.0,
            maxDistance: 22.0,
            spacing: 17.0,
            showDots: true,
          });
        }
      } catch (err) {
        console.error("Failed to load Vanta background:", err);
      }
    }

    initVanta();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Exchange Firebase identity for your backend's JWT so API calls
      // (e.g. DSATracker fetching /api/problems) can authenticate.
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "",
      });

      localStorage.setItem("token", res.data.token);

      setUser(firebaseUser);
      navigate("/", { replace: true }); // <--- CHANGED TO "/"
    } catch (err) {
      console.log(err.code);
      console.log(err.message);
      
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
    console.log("🔴 Launching Google Auth Popup...");
    
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

      // Exchange Firebase identity for your backend's JWT so API calls
      // (e.g. DSATracker fetching /api/problems) can authenticate.
      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "",
      });

      localStorage.setItem("token", res.data.token);
      
      console.log("✅ Google Auth Successful:", firebaseUser.email);
      setUser(firebaseUser);
      navigate("/", { replace: true }); // <--- CHANGED TO "/"
      
    } catch (err) {
      console.error("❌ Google Popup Error:", err);
      setError(`Sign-in failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking auth
  if (isCheckingAuth) {
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
        color: "#ffffff",
        background: "#0c0a14",
      }}>
        <div ref={vantaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(8,6,14,0.35) 75%)"
        }} />
        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "50%",
            border: "3px solid rgba(255,63,129,0.3)",
            borderTop: "3px solid #ff3f81",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <p style={{ color: "#9b9ba8", fontSize: "1rem" }}>Signing you in...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

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
      color: "#ffffff",
      background: "#0c0a14",
      padding: "2rem",
      perspective: "1500px" 
    }}>
      <style>{`
        .glass-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .glass-input.focused {
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(255,63,129,0.18), 0 0 24px rgba(255,63,129,0.3);
          border-color: rgba(255,63,129,0.4);
        }
        input::placeholder { color: #6b6b78; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .glass-cube-shine {
          position: relative;
          overflow: hidden;
        }
        .glass-cube-shine::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-25deg);
          animation: shine-sweep 6s infinite;
          pointer-events: none;
        }
        @keyframes shine-sweep {
          0% { left: -100%; }
          15% { left: 200%; }
          100% { left: 200%; }
        }

        @media (max-width: 1100px) {
          .middle-image-layer { display: none !important; }
        }
      `}</style>

      {/* === Vanta.js animated network background === */}
      <div ref={vantaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(8,6,14,0.35) 75%)"
      }} />

      {/* === 3D Layout Wrapper === */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "1350px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.8s ease-in"
      }}>

        {/* ========================================= */}
        {/* LEFT COLUMN: Text & Animated Cubes        */}
        {/* ========================================= */}
        <div style={{
          flex: "0 1 420px", 
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          zIndex: 10, 
          transform: "rotateY(12deg) rotateX(4deg) translateZ(10px)",
          transformStyle: "preserve-3d"
        }}>
          
          <div style={{ transform: "translateZ(30px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "1.5rem" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 0 20px rgba(255,63,129,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.2)"
              }}>
                <img 
                  src="/logo.png" 
                  alt="Crackin Ai Logo" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", letterSpacing: "0.5px" }}>
                Crackin <span style={{ color: "#ff7aab" }}>Ai</span>
              </h2>
            </div>

            <h1 style={{ fontSize: "3.5rem", fontWeight: "800", lineHeight: "1.1", margin: "0 0 0.5rem 0" }}>
              Prepare <span style={{ background: "linear-gradient(90deg, #a78bfa, #ff3f81)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smarter.</span>
            </h1>
            <div style={{ 
              display: "inline-block", padding: "6px 14px", borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#e2e8f0", fontSize: "0.9rem", marginTop: "8px"
            }}>
              ✦ Your AI Placement Partner
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: "1.25rem", 
            maxWidth: "420px",
            alignItems: "start",
            transformStyle: "preserve-3d"
          }}>
            {features.map((f, i) => (
              <div 
                key={i} 
                onMouseEnter={() => setHoveredCube(i)}
                onMouseLeave={() => setHoveredCube(null)}
                style={{
                  cursor: "pointer",
                  animation: `float 4s ease-in-out infinite`,
                  animationDelay: `${i * 0.25}s`,
                  perspective: "1000px",
                  marginTop: i % 2 !== 0 ? "3.5rem" : "0" 
              }}>
                <div 
                  className="glass-cube-shine"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "20px",
                    padding: "1.5rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: hoveredCube === i 
                      ? "0 20px 40px -10px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.4)"
                      : "0 10px 30px -10px rgba(0,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.2)",
                    transformStyle: "preserve-3d",
                    transform: hoveredCube === i 
                      ? "rotateY(-12deg) rotateX(-4deg) translateZ(40px) scale(1.05)" 
                      : "rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)",
                    transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)"
                  }}
                >
                  <div style={{
                    transform: hoveredCube === i ? "translateZ(30px)" : "translateZ(0px)",
                    transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: "rgba(255,63,129,0.1)", border: "1px solid rgba(255,63,129,0.25)",
                      color: "#ff7aab", display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "12px",
                      boxShadow: hoveredCube === i ? "0 0 20px rgba(255,63,129,0.5)" : "none",
                      transition: "box-shadow 0.3s ease"
                    }}>
                      {f.icon}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px" }}>{f.title}</div>
                    <div style={{ color: "#9b9ba8", fontSize: "0.75rem", lineHeight: "1.4" }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================= */}
        {/* MIDDLE COLUMN: The Physical Image Layer   */}
        {/* ========================================= */}
        <div className="middle-image-layer" style={{
          position: "absolute",
          left: "54%", 
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "440px",
          height: "640px",
          zIndex: 5, 
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.7)"
        }}>
          <img 
            src="/purple.jpeg" 
            alt="AI Robot Concept" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(12,10,20,0.1), rgba(12,10,20,0.5))"
          }} />
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: The Heavily Tilted Panel    */}
        {/* ========================================= */}
        <div 
          onMouseEnter={() => setIsFormHovered(true)}
          onMouseLeave={() => setIsFormHovered(false)}
          style={{ flex: "0 1 420px", perspective: "1500px", zIndex: 10 }}
        >
          <div 
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01))",
              backdropFilter: "blur(20px) saturate(120%)",
              WebkitBackdropFilter: "blur(20px) saturate(120%)",
              borderRadius: "28px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "-30px 40px 60px -20px rgba(0,0,0,0.8), inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.2)",
              padding: "3.5rem",
              transformStyle: "preserve-3d",
              transform: isFormHovered 
                ? "rotateY(-5deg) rotateX(2deg) translateZ(20px) scale(1.02)" 
                : "rotateY(-22deg) rotateX(4deg) translateZ(0px) scale(0.95)", 
              transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}>

            <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0 0 0.5rem 0", lineHeight: 1.15 }}>
              Welcome Back
            </h1>
            <p style={{ color: "#9b9ba8", fontSize: "0.95rem", margin: "0 0 2.5rem 0" }}>
              Sign in to continue your placement journey.
            </p>

            <form onSubmit={handleLogin} autoComplete="off">
              
              {/* ERROR MESSAGE DISPLAY */}
              {error && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  textAlign: "center"
                }}>
                  {error}
                </div>
              )}

              <div className={`glass-input ${focusedField === "email" ? "focused" : ""}`} style={{
                borderRadius: "14px", marginBottom: "1.25rem", display: "flex", alignItems: "center", padding: "0 16px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7aab" strokeWidth="2" style={{ flexShrink: 0, marginRight: "12px" }}>
                  <path d="M3 7l9 6 9-6" />
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  autoComplete="new-email"
                  spellCheck="false"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "white", fontSize: "1rem", padding: "16px 0"
                  }}
                  required
                />
              </div>

              <div className={`glass-input ${focusedField === "password" ? "focused" : ""}`} style={{
                borderRadius: "14px", marginBottom: "1rem", display: "flex", alignItems: "center", padding: "0 16px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff7aab" strokeWidth="2" style={{ flexShrink: 0, marginRight: "12px" }}>
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  autoComplete="new-password"
                  spellCheck="false"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "white", fontSize: "1rem", padding: "16px 0"
                  }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#8b8b9a"
                }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.7 18.7 0 0 1-2.16 3.19" /><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" /><path d="M1 1l22 22" /></svg>
                  )}
                </button>
              </div>

              <div style={{ textAlign: "right", marginBottom: "1.75rem" }}>
                <a href="#" style={{ color: "#ff7aab", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600 }}>Forgot Password?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
                style={{
                  width: "100%", padding: "16px", borderRadius: "14px", border: "none", 
                  cursor: isLoading ? "not-allowed" : "pointer",
                  background: isBtnHovered && !isLoading
                    ? "linear-gradient(90deg, #6d28d9, #c2185b)"
                    : "linear-gradient(90deg, #7c3aed, #ff3f81)",
                  color: "white", fontSize: "1.05rem", fontWeight: "700",
                  boxShadow: isBtnHovered && !isLoading
                    ? "0 0 34px rgba(124,58,237,0.6), 0 0 34px rgba(255,63,129,0.4)"
                    : "0 0 20px rgba(255,63,129,0.35)",
                  transition: "all 0.3s ease",
                  transform: isBtnHovered && !isLoading ? "translateY(-2px)" : "translateY(0)",
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? "Signing in..." : "Login →"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "2rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ color: "#6b6b78", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>or continue with</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="glass-input"
              style={{
                width: "100%", padding: "14px", borderRadius: "14px", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "12px", 
                cursor: isLoading ? "not-allowed" : "pointer", 
                fontSize: "0.95rem", fontWeight: "600", color: "white",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ textAlign: "center", marginTop: "2rem", color: "#9b9ba8", fontSize: "0.9rem" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "#ff7aab", textDecoration: "none", fontWeight: "700" }}>Sign Up</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
