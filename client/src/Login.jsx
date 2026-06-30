import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Simulating the staggered entrance animation on load
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here (axios call to backend)
    console.log("Logging in...", email, password);
    navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "#050505",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
      color: "#ffffff"
    }}>
      {/* --- CSS Animations & Keyframes --- */}
      <style>{`
        @keyframes blob-bounce {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        
        .glass-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #ef4444;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
          outline: none;
        }
      `}</style>

      {/* --- Dynamic Background Glows (The "Orbs") --- */}
      <div style={{
        position: "absolute", top: "10%", left: "15%", width: "40vw", height: "40vw",
        background: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(60px)", animation: "blob-bounce 10s infinite alternate ease-in-out", zIndex: 0
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "10%", width: "35vw", height: "35vw",
        background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(60px)", animation: "blob-bounce 12s infinite alternate-reverse ease-in-out", zIndex: 0
      }} />

      {/* --- Main Glass Container --- */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "90%",
        maxWidth: "1200px",
        minHeight: "75vh",
        background: "rgba(20, 20, 20, 0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        transform: mounted ? "scale(1)" : "scale(0.98)",
        opacity: mounted ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        
        {/* LEFT COLUMN: Branding & Image */}
        <div style={{
          flex: 1,
          padding: "4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.4) 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          {/* Subtle grid pattern overlay */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "30px 30px", opacity: 0.5, zIndex: 0
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "3rem" }}>
              <div style={{ width: "32px", height: "32px", background: "#ef4444", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>P</div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", letterSpacing: "1px" }}>PlacePrep <span style={{ color: "#ef4444" }}>AI</span></h2>
            </div>
            
            <h1 className="animate-fade-in delay-1" style={{ fontSize: "3.5rem", fontWeight: "800", lineHeight: "1.1", marginBottom: "1.5rem" }}>
              Prepare Smarter.<br/>
              <span style={{ color: "#ef4444", textShadow: "0 0 30px rgba(239,68,68,0.4)" }}>Get Placed Faster.</span>
            </h1>
            
            <p className="animate-fade-in delay-2" style={{ color: "#a1a1aa", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "400px" }}>
              Your elite AI-powered partner. Master Data Structures, crush mock interviews, and land your dream job.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Form */}
        <div style={{
          flex: 1,
          padding: "4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            
            <div className="animate-fade-in delay-1" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 8px 0" }}>Welcome Back</h2>
              <p style={{ color: "#a1a1aa", margin: 0, fontSize: "0.9rem" }}>Access your personalized dashboard.</p>
            </div>

            {/* Google Button */}
            <button className="animate-fade-in delay-2 glass-input" style={{
              width: "100%", padding: "14px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              cursor: "pointer", fontSize: "0.95rem", fontWeight: "600", marginBottom: "2rem"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="animate-fade-in delay-2" style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "2rem" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ color: "#71717a", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            <form onSubmit={handleLogin}>
              <div className="animate-fade-in delay-3" style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  placeholder="Enter your email"
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", fontSize: "0.95rem", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div className="animate-fade-in delay-3" style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "0.75rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1px" }}>Password</label>
                  <a href="#" style={{ color: "#ef4444", fontSize: "0.8rem", textDecoration: "none" }}>Forgot Password?</a>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  placeholder="Enter your password"
                  style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", fontSize: "0.95rem", boxSizing: "border-box" }}
                  required
                />
              </div>

              <button 
                type="submit"
                className="animate-fade-in delay-4"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  width: "100%", padding: "16px", borderRadius: "12px", border: "none", cursor: "pointer",
                  background: isHovered ? "#b91c1c" : "#ef4444",
                  color: "white", fontSize: "1rem", fontWeight: "700",
                  boxShadow: isHovered ? "0 0 25px rgba(239, 68, 68, 0.6)" : "0 0 15px rgba(239, 68, 68, 0.3)",
                  transition: "all 0.3s ease", transform: isHovered ? "translateY(-2px)" : "translateY(0)"
                }}
              >
                Login →
              </button>
            </form>

            <p className="animate-fade-in delay-4" style={{ textAlign: "center", marginTop: "2rem", color: "#a1a1aa", fontSize: "0.9rem" }}>
              Don't have an account? <Link to="/signup" style={{ color: "#ef4444", textDecoration: "none", fontWeight: "600" }}>Sign Up</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}