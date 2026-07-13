import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [hoveredCube, setHoveredCube] = useState(null);
  
  const [tilt, setTilt] = useState({ rotateX: 2, rotateY: -8 });
  const [isPanelHovered, setIsPanelHovered] = useState(false);
  const loginPanelRef = useRef(null);
  
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

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
            color: 0x3b82f6,
            backgroundColor: 0x000000,
            points: 10.0,
            maxDistance: 25.0,
            spacing: 18.0,
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

  const handleMouseEnter = useCallback(() => {
    setIsPanelHovered(true);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!loginPanelRef.current || !isPanelHovered) return;
    const rect = loginPanelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;
    setTilt({ rotateX, rotateY });
  }, [isPanelHovered]);

  const handleMouseLeave = useCallback(() => {
    setIsPanelHovered(false);
    setTilt({ rotateX: 2, rotateY: -8 });
  }, []);

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
        minHeight: "100vh", width: "100%", position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#ffffff", background: "#000000",
      }}>
        <div ref={vantaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            border: "3px solid rgba(20,184,166,0.3)",
            borderTop: "3px solid #14b8a6",
            animation: "spin 1s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Signing you in...</p>
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
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.25)",
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
      bg: "rgba(139,92,246,0.12)",
      border: "rgba(139,92,246,0.25)",
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
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.25)",
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
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.25)",
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
      bg: "rgba(236,72,153,0.12)",
      border: "rgba(236,72,153,0.25)",
      arrowColor: "#ec4899"
    },
  ];

  const navLinks = ["Features", "How It Works", "Roadmap", "Pricing", "About Us"];

  return (
    <div style={{
      minHeight: "100vh", width: "100%", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#ffffff", background: "#000000",
    }}>
      <style>{`
        .glass-input-blue {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(20, 184, 166, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }
        .glass-input-blue:focus-within {
          background: rgba(0, 0, 0, 0.85);
          border-color: rgba(20, 184, 166, 0.5);
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15), 0 0 20px rgba(20, 184, 166, 0.1);
        }
        input::placeholder { color: #475569; }
        
        .feature-card {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-style: preserve-3d;
          perspective: 1000px;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          transform: skewX(-25deg);
          transition: left 0.6s ease;
          pointer-events: none;
        }
        .feature-card:hover::before {
          left: 150%;
          transition: left 0.8s ease;
        }
        .feature-card:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-8px) rotateX(-4deg) rotateY(4deg) scale(1.03);
          box-shadow: 0 25px 50px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(20, 184, 166, 0.1);
        }
        .feature-card:hover .cube-icon {
          transform: translateZ(30px) scale(1.1);
        }
        .feature-card:hover .cube-arrow {
          transform: translateX(6px);
        }
        .cube-icon {
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .cube-arrow {
          transition: transform 0.3s ease;
        }
        
        .nav-link {
          color: #94a3b8;
          transition: color 0.2s ease;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .nav-link:hover { color: #e2e8f0; }
        
        .social-btn {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .social-btn:hover {
          background: rgba(0, 0, 0, 0.85);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .signin-btn {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .signin-btn:hover {
          background: linear-gradient(135deg, #0f766e, #0d9488);
          box-shadow: 0 8px 30px -6px rgba(13, 148, 136, 0.5);
          transform: translateY(-1px);
        }
        .signin-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .login-panel-tilt {
          transform-style: preserve-3d;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .float-anim-d1 { animation: float 4s ease-in-out infinite; animation-delay: 0.5s; }
        .float-anim-d2 { animation: float 4s ease-in-out infinite; animation-delay: 1s; }
        .float-anim-d3 { animation: float 4s ease-in-out infinite; animation-delay: 1.5s; }
        .float-anim-d4 { animation: float 4s ease-in-out infinite; animation-delay: 2s; }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
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

      <div ref={vantaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 0%, rgba(13, 148, 136, 0.08) 0%, transparent 60%)"
      }} />

      <nav style={{
        position: "relative", zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2.5rem", maxWidth: "1400px", width: "100%", margin: "0 auto",
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #115e59, #14b8a6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "800", fontSize: "1.1rem", color: "white"
          }}>
            C
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Crackin AI</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "-2px" }}>An AI Powered Placement Preparation Platform</div>
          </div>
        </div>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {navLinks.map((link) => (
            <a key={link} href="#" className="nav-link">{link}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.7)", border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#94a3b8", cursor: "pointer", backdropFilter: "blur(8px)"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <button style={{
            padding: "8px 20px", borderRadius: "8px",
            background: "linear-gradient(135deg, #0d9488, #14b8a6)",
            border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem",
            cursor: "pointer", transition: "all 0.2s ease"
          }}>
            Get Started
          </button>
        </div>
      </nav>

      <div className="login-layout" style={{
        position: "relative", zIndex: 10,
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
              background: "rgba(20, 184, 166, 0.1)", border: "1px solid rgba(20, 184, 166, 0.2)",
              color: "#2dd4bf", fontSize: "0.75rem", fontWeight: "600",
              letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem"
            }}>
              AI POWERED PLACEMENT PREPARATION ✨
            </div>
            
            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: "800",
              lineHeight: "1.15", margin: "0 0 1rem 0", letterSpacing: "-0.02em", minHeight: "1.2em"
            }}>
              <span style={{ color: "#e2e8f0" }}>{displayedText}</span>
              <span className="typing-cursor" />
            </h1>
            
            <p style={{
              color: "#94a3b8", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "480px", margin: 0
            }}>
              Crackin AI is your all-in-one platform to master DSA, Aptitude, System Design, and Interviews with the power of AI.
            </p>
          </div>

          <div className="feature-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem"
          }}>
            {features.map((f, i) => {
              const floatClass = i === 0 ? "float-anim" : i === 1 ? "float-anim-d1" : i === 2 ? "float-anim-d2" : i === 3 ? "float-anim-d3" : "float-anim-d4";
              return (
                <div 
                  key={i} 
                  className={`feature-card ${floatClass}`}
                  onMouseEnter={() => setHoveredCube(i)}
                  onMouseLeave={() => setHoveredCube(null)}
                  style={{
                    borderRadius: "16px", padding: "1.25rem", cursor: "pointer",
                    transform: hoveredCube === i ? "translateY(-8px) rotateX(-4deg) rotateY(4deg) scale(1.03)" : undefined,
                  }}
                >
                  <div className="cube-icon" style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: f.bg, border: `1px solid ${f.border}`,
                    color: f.color, display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "12px",
                    boxShadow: hoveredCube === i ? `0 0 20px ${f.bg}` : "none"
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "0.9rem", marginBottom: "6px" }}>{f.title}</div>
                  <div style={{ color: "#64748b", fontSize: "0.78rem", lineHeight: "1.5" }}>{f.desc}</div>
                  <div className="cube-arrow" style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "4px", color: f.arrowColor, fontSize: "0.8rem", fontWeight: "600" }}>
                    Learn more <span style={{ fontSize: "1rem" }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="right-section" style={{ width: "420px", flexShrink: 0, perspective: "1200px" }}>
          <div 
            ref={loginPanelRef}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="login-panel-tilt"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(24px) saturate(140%)",
              WebkitBackdropFilter: "blur(24px) saturate(140%)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
              padding: "2.5rem",
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(0)`,
              willChange: "transform"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>
                Welcome Back! 👋
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                Sign in to continue your learning journey
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem" }}>
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="social-btn"
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  color: "#e2e8f0", fontSize: "0.85rem", fontWeight: "500"
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
                className="social-btn"
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  color: "#e2e8f0", fontSize: "0.85rem", fontWeight: "500"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>or continue with email</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <form onSubmit={handleLogin} autoComplete="off">
              {error && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#f87171", padding: "10px 14px", borderRadius: "10px",
                  fontSize: "0.85rem", marginBottom: "1rem", textAlign: "center"
                }}>
                  {error}
                </div>
              )}

              <div className="glass-input-blue" style={{
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
                    color: "white", fontSize: "0.95rem", padding: "14px 0"
                  }}
                  required
                />
              </div>

              <div className="glass-input-blue" style={{
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
                    color: "white", fontSize: "0.95rem", padding: "14px 0"
                  }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#475569", padding: "4px"
                }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                  )}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#94a3b8", fontSize: "0.85rem" }}>
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
                <a href="#" style={{ color: "#14b8a6", fontSize: "0.85rem", textDecoration: "none", fontWeight: "500" }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" disabled={isLoading} className="signin-btn" style={{
                width: "100%", padding: "14px", borderRadius: "12px",
                color: "white", fontSize: "1rem", fontWeight: "600"
              }}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "1.5rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ color: "#475569", fontSize: "0.8rem" }}>Don't have an account?</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <Link to="/signup" style={{
              display: "block", width: "100%", padding: "12px", borderRadius: "12px",
              background: "transparent", border: "1px solid rgba(20, 184, 166, 0.3)",
              color: "#14b8a6", fontSize: "0.95rem", fontWeight: "600",
              textAlign: "center", textDecoration: "none", transition: "all 0.2s ease"
            }}>
              Sign Up for Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}