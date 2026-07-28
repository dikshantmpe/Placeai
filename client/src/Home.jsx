import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "./firebase.js";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";

import loginImg from "./assets/login-illustration.png";
import audienceImg from "./assets/audience-illustration.png";

export default function Home({ setUser }) {
  const navigate = useNavigate();
  const [activePill, setActivePill] = useState("DSA");

  // Automatically redirect to dashboard if the user is already logged in via Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User detected via Firebase, redirecting to dashboard");
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // UNIFIED OAUTH HANDLER - Pure Firebase (No backend token calls)
  const handleGoogleLogin = async () => {
    try {
      console.log("🔵 Starting Google Sign-In...");
      
      // Force Firebase to remember the user across tab closes and refreshes
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      console.log("🔵 Opening popup...");
      await signInWithPopup(auth, provider);
      
      // Success! The onAuthStateChanged listener above will automatically detect 
      // the new user and redirect them to the dashboard.
      
    } catch (err) {
      console.error("❌ GOOGLE LOGIN ERROR:", err.message);
      alert(`Google sign-in failed: ${err.message}`);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const pills = [
    "DSA", "Aptitude", "Resume Building", "Mock Interviews", "DBMS", 
    "Operating Systems", "Computer Networks", "SQL", "System Design", "Communication Skills"
  ];

  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          --blue: #1769e0; --blue2: #0d4fb8; --navy: #10264a; --ink: #172033;
          --muted: #667085; --line: #dfe5ec; --soft: #f5f7fa; --ice: #eaf3ff;
          --cream: #f8f5ef; --peach: #f2b38f; --green: #77b8a1; --max: 1180px;
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: var(--ink);
          background: white;
          overflow-x: hidden;
        }
        .landing-page * { box-sizing: border-box; }
        .landing-page a { text-decoration: none; color: inherit; }
        .landing-page button { font: inherit; cursor: pointer; }
        .wrap { width: min(var(--max), calc(100% - 48px)); margin: auto; }
        
        .home-header { height: 76px; display: flex; align-items: center; position: sticky; top: 0; background: rgba(255,255,255,.96); backdrop-filter: blur(12px); z-index: 50; border-bottom: 1px solid rgba(20,40,70,.06); }
        .home-nav { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .brand { font-size: 27px; font-weight: 850; letter-spacing: -1.2px; color: var(--navy); }
        .brand b { color: var(--blue); }
        .navlinks { display: flex; align-items: center; gap: 30px; color: #46536a; font-size: 14px; font-weight: 500; }
        .navlinks a:hover { color: var(--blue); }
        .actions { display: flex; gap: 10px; }
        .btn { border-radius: 999px; padding: 11px 20px; font-weight: 700; border: 1px solid transparent; transition: .2s; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }
        .btn:hover { transform: translateY(-2px); }
        .btn-primary { background: var(--blue); color: white; }
        .btn-primary:hover { background: var(--blue2); }
        .btn-outline { border-color: var(--blue); color: var(--blue); background: white; }
        .btn-ghost { background: transparent; color: #4b5870; }
        
        .hero { padding: 78px 0 86px; overflow: hidden; }
        .hero-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 72px; align-items: center; }
        .eyebrow { color: var(--blue); font-weight: 750; font-size: 14px; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.05em; }
        .hero h1 { font-size: 62px; line-height: 1.02; letter-spacing: -3px; font-weight: 420; color: var(--navy); margin: 0 0 24px; }
        .hero h1 em { font-style: normal; color: var(--blue); }
        .lead { font-size: 20px; line-height: 1.55; color: #536079; max-width: 600px; margin: 0 0 31px; }
        .auth { max-width: 430px; }
        .auth button { width: 100%; height: 49px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 15px; }
        .google { background: var(--blue); color: #fff; border: 0; border-radius: 999px; font-weight: 750; transition: .2s; }
        .google:hover { background: var(--blue2); }
        .email-btn { background: #fff; color: var(--navy); border: 1px solid #c9d3e0; border-radius: 999px; font-weight: 750; transition: .2s; }
        .email-btn:hover { border-color: var(--navy); }
        .legal { font-size: 12px; line-height: 1.5; color: #7b8494; text-align: center; margin: 4px 12px 18px; }
        .legal a, .signup a { color: var(--blue); font-weight: 700; }
        .signup { text-align: center; font-size: 15px; color: #536079; }
        
        .section-pad { padding: 94px 0; }
        .bg-soft { background: var(--soft); }
        .bg-ice { background: var(--ice); }
        .split { display: grid; grid-template-columns: .75fr 1.25fr; gap: 90px; align-items: start; }
        .kicker { font-size: 13px; font-weight: 800; color: var(--blue); text-transform: uppercase; letter-spacing: .1em; display: block; margin-bottom: 12px; }
        .title { font-size: 46px; line-height: 1.12; letter-spacing: -1.8px; font-weight: 420; color: var(--navy); margin: 0 0 18px; }
        .copy { font-size: 19px; line-height: 1.6; color: #59657a; margin: 0; }
        .pills { display: flex; gap: 11px; flex-wrap: wrap; }
        .pill { padding: 14px 21px; border: 1px solid #c9d3e0; border-radius: 999px; background: white; font-weight: 700; color: var(--navy); transition: .2s; font-size: 15px; }
        .pill:hover { border-color: var(--navy); }
        .pill.active { background: var(--navy); color: white; border-color: var(--navy); }
        
        .feature-story { display: grid; grid-template-columns: 1fr 1fr; gap: 90px; align-items: center; }
        .feature-story.reverse .visual { order: -1; }
        .visual { min-height: 420px; display: grid; place-items: center; position: relative; }
        .visual-shape { width: 390px; height: 390px; border-radius: 50%; background: #dcecff; display: grid; place-items: center; position: relative; }
        .screen { width: 245px; background: #fff; border: 1px solid #dce4ec; border-radius: 14px; padding: 18px; box-shadow: 0 15px 35px rgba(20,50,90,.09); transform: rotate(-3deg); }
        .screen-row { height: 14px; background: #e8edf3; border-radius: 7px; margin: 11px 0; }
        .screen-row.blue { width: 78%; background: #8db7f3; }
        .screen-row.short { width: 55%; }
        .score { width: 85px; height: 85px; border-radius: 50%; border: 12px solid var(--blue); display: grid; place-items: center; font-weight: 850; color: var(--blue); font-size: 24px; margin: 0 auto 15px; }
        .feature-list { margin: 28px 0; }
        .feature-list div { padding: 13px 0; border-bottom: 1px solid var(--line); font-weight: 650; color: var(--ink); display: flex; align-items: center; gap: 10px; font-size: 16px; }
        
        .interview { background: #f8f4ec; }
        .interview-grid { display: grid; grid-template-columns: .85fr 1.15fr; gap: 80px; align-items: center; }
        .chat-scene { height: 480px; position: relative; }
        .person-card, .ai-card { position: absolute; background: white; border: 1px solid var(--line); box-shadow: 0 15px 40px rgba(25,50,80,.08); padding: 22px; font-size: 15px; line-height: 1.5; color: var(--ink); }
        .person-card { left: 0; top: 70px; width: 60%; border-radius: 8px 32px 32px 32px; font-weight: 600; }
        .ai-card { right: 0; bottom: 65px; width: 65%; border-radius: 32px 32px 8px 32px; font-weight: 600; }
        .face { width: 60px; height: 60px; border-radius: 50%; background: var(--peach); display: grid; place-items: center; font-size: 26px; margin-bottom: 15px; }
        .bot { background: #dbeaff; font-size: 20px; color: var(--blue); font-weight: 800; }
        .wave { height: 42px; display: flex; align-items: center; gap: 4px; margin-top: 15px; }
        .wave i { width: 5px; background: var(--blue); border-radius: 4px; display: block; }
        .wave i:nth-child(1) { height: 12px; }
        .wave i:nth-child(2) { height: 31px; }
        .wave i:nth-child(3) { height: 20px; }
        .wave i:nth-child(4) { height: 38px; }
        .wave i:nth-child(5) { height: 17px; }
        
        .audience { display: grid; grid-template-columns: 1fr 1fr; min-height: 650px; }
        .audience-copy { padding: 105px max(45px, calc((100vw - var(--max)) / 2)); padding-right: 70px; background: #f3f1ed; }
        .choice { padding: 20px 24px; margin: 12px 0; background: #e8e4dd; display: flex; justify-content: space-between; font-size: 17px; font-weight: 500; border-radius: 4px; transition: .2s; cursor: default; }
        .choice:hover { padding-left: 30px; background: #ded9d0; }
        .audience-art { display: grid; place-items: center; background: #fff; padding: 40px; }
        
        .band { padding: 70px 0; background: #f4f8ff; }
        .band .wrap { display: flex; justify-content: space-between; gap: 40px; align-items: center; }
        .band h2 { font-size: 38px; font-weight: 430; color: var(--navy); max-width: 760px; margin: 0; line-height: 1.2; letter-spacing: -1px; }
        
        .final { padding: 85px 0 0; background: #eaf4ff; overflow: hidden; }
        .final h2 { font-size: 53px; line-height: 1.1; letter-spacing: -2px; font-weight: 420; max-width: 900px; color: var(--navy); margin: 0 0 25px; }
        .campus { height: 320px; margin-top: 45px; position: relative; background: linear-gradient(#d8ebfb 0 47%, #a9c6ad 47%); }
        .campus:before { content: "CODE LAB     AI INTERVIEW     RESUME STUDIO     APTITUDE HUB     CAREER DESK"; position: absolute; bottom: 80px; left: 0; right: 0; text-align: center; font-weight: 800; color: #34576e; font-size: 22px; word-spacing: 22px; }
        
        footer { padding: 55px 0 24px; background: #f4f2ef; font-size: 14px; }
        .footer-grid { display: grid; grid-template-columns: 1.3fr repeat(4, 1fr); gap: 45px; }
        .footer-grid h4 { margin: 0 0 18px; font-size: 15px; color: var(--navy); }
        .footer-grid a { display: block; color: #5d6673; margin: 12px 0; text-decoration: none; }
        .footer-grid a:hover { color: var(--blue); }
        .bottom { border-top: 1px solid #d9d7d3; margin-top: 40px; padding-top: 24px; color: #737a84; font-size: 13px; }
        
        .reveal { opacity: 0; transform: translateY(24px); transition: .7s ease-out; }
        .reveal.show { opacity: 1; transform: none; }
        
        @media (max-width: 900px) {
          .navlinks { display: none; }
          .hero-grid, .split, .feature-story, .interview-grid, .audience { grid-template-columns: 1fr; }
          .hero h1 { font-size: 50px; }
          .feature-story.reverse .visual { order: 0; }
          .audience-copy { padding: 75px 35px; }
          .audience-art { min-height: 500px; }
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
          .band .wrap { flex-direction: column; text-align: center; align-items: stretch; }
        }
        @media (max-width: 600px) {
          .wrap { width: calc(100% - 28px); }
          .home-header { height: 66px; }
          .actions .btn-ghost { display: none; }
          .hero { padding: 48px 0; }
          .hero h1 { font-size: 40px; letter-spacing: -1.8px; }
          .lead { font-size: 17px; }
          .section-pad { padding: 65px 0; }
          .title { font-size: 36px; }
          .split { gap: 35px; }
          .visual-shape { width: 290px; height: 290px; }
          .screen { width: 210px; }
          .interview-grid { gap: 20px; }
          .chat-scene { height: 430px; }
          .person-card, .ai-card { width: 85%; }
          .final h2 { font-size: 39px; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 25px; }
          .campus { height: 220px; }
          .campus:before { font-size: 13px; word-spacing: 5px; }
        }
      `}</style>

      {/* Header */}
      <header className="home-header">
        <div className="wrap">
          <nav className="home-nav" aria-label="Main navigation">
            <Link to="/" className="brand">Crackin <b>AI</b></Link>
            <div className="navlinks">
              <a href="#features">Features</a>
              <a href="#explore">Explore</a>
              <a href="#interview">Mock Interview</a>
              <a href="#audience">Who it's for</a>
            </div>
            <div className="actions">
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/signup" className="btn btn-primary">Get started</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">AI-powered placement preparation</div>
            <h1>Prepare smarter.<br />Walk into placements <em>ready.</em></h1>
            <p className="lead">Practice DSA, improve your resume, sharpen aptitude, rehearse interviews, study company questions, and see where you stand—all in one focused preparation space.</p>
            
            <div className="auth">
              <button className="google" onClick={handleGoogleLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
                Continue with Google
              </button>
              <button className="email-btn" onClick={() => navigate('/login')}>
                Sign in with email
              </button>
              <p className="legal">
                By continuing, you agree to Crackin AI's <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
              </p>
              <p className="signup">
                New to Crackin AI? <Link to="/signup">Create your account</Link>
              </p>
            </div>
          </div>
          
          {/* Imported Image replacing CSS Art */}
          <div className="art" aria-label="Student preparing for placements with AI" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img 
              src={loginImg} 
              alt="Student studying at desk" 
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
            />
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="section-pad bg-soft reveal" id="explore">
        <div className="wrap split">
          <div>
            <span className="kicker">Explore preparation</span>
            <h2 className="title">Start with what you need today.</h2>
            <p className="copy">No rigid path. Pick a skill, work through it, and come back tomorrow a little more prepared.</p>
          </div>
          <div className="pills">
            {pills.map(pill => (
              <button 
                key={pill}
                className={`pill ${activePill === pill ? 'active' : ''}`}
                onClick={() => setActivePill(pill)}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DSA Tracker */}
      <section className="section-pad reveal" id="features">
        <div className="wrap feature-story">
          <div>
            <span className="kicker">DSA Tracker</span>
            <h2 className="title">Turn a long problem list into visible progress.</h2>
            <p className="copy">Organize topics, filter by difficulty, solve at your own pace, and see exactly what you've covered without losing your place.</p>
            <div className="feature-list">
              <div>✓ Topic-wise problem tracking</div>
              <div>✓ Difficulty and status filters</div>
              <div>✓ Progress that updates as you practice</div>
            </div>
            <Link to="/signup" className="btn btn-outline">Open DSA Tracker</Link>
          </div>
          <div className="visual">
            <div className="visual-shape">
              <div className="screen">
                <b style={{color: '#10264a', display: 'block', marginBottom: '8px'}}>Dynamic Programming</b>
                <div className="screen-row blue"></div>
                <div className="screen-row"></div>
                <div className="screen-row short"></div>
                <div className="screen-row blue"></div>
                <small style={{color: '#667085', marginTop: '12px', display: 'block'}}>18 of 27 completed</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Analyzer */}
      <section className="section-pad bg-ice reveal">
        <div className="wrap feature-story reverse">
          <div>
            <span className="kicker">Resume Analyzer</span>
            <h2 className="title">Know what your resume is saying before a recruiter reads it.</h2>
            <p className="copy">Get AI-assisted feedback on clarity, structure, skills, and role alignment, then turn vague improvements into concrete edits.</p>
            <div className="feature-list">
              <div>Role-focused feedback</div>
              <div>Clear improvement suggestions</div>
              <div>Readable readiness scoring</div>
            </div>
            <Link to="/signup" className="btn btn-primary">Analyze my resume</Link>
          </div>
          <div className="visual">
            <div className="visual-shape" style={{ background: '#e6f2ed' }}>
              <div className="screen">
                <div className="score">86</div>
                <div className="screen-row blue"></div>
                <div className="screen-row"></div>
                <div className="screen-row short"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mock Interview */}
      <section className="section-pad interview reveal" id="interview">
        <div className="wrap interview-grid">
          <div className="chat-scene">
            <div className="person-card">
              <div className="face">👩‍💻</div>
              <b>Tell me about a project where you solved a difficult technical problem.</b>
            </div>
            <div className="ai-card">
              <div className="face bot">AI</div>
              <b>Good start. Try making the impact more specific.</b>
              <div className="wave"><i></i><i></i><i></i><i></i><i></i></div>
            </div>
          </div>
          <div>
            <span className="kicker">AI Mock Interviews</span>
            <h2 className="title">Practice the conversation, not just the answer.</h2>
            <p className="copy">Rehearse realistic interview questions, explain your thinking out loud, and get feedback that helps you make the next answer clearer.</p>
            <br />
            <Link to="/signup" className="btn btn-primary">Start a mock interview</Link>
          </div>
        </div>
      </section>

      {/* More Ways */}
      <section className="section-pad reveal">
        <div className="wrap split">
          <div>
            <span className="kicker">More ways to prepare</span>
            <h2 className="title">One placement journey. Different kinds of practice.</h2>
          </div>
          <div className="feature-list" style={{ margin: 0 }}>
            <div><span style={{color: '#667085'}}>⊚</span> Aptitude Quizzes — quantitative, logical, and verbal practice</div>
            <div><span style={{color: '#667085'}}>▣</span> Company Questions — prepare around real interview patterns</div>
            <div><span style={{color: '#667085'}}>✦</span> Daily Challenges — keep your preparation moving consistently</div>
            <div><span style={{color: '#667085'}}>↗</span> Progress Dashboard — understand your overall readiness</div>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="audience reveal" id="audience">
        <div className="audience-copy">
          <span className="kicker">Built for the beginning of your career</span>
          <h2 className="title">Who is Crackin AI for?</h2>
          <p className="copy" style={{marginBottom: '30px'}}>Students and early-career candidates who want a clearer way to prepare.</p>
          <div className="choice">College students <span>→</span></div>
          <div className="choice">Internship seekers <span>→</span></div>
          <div className="choice">Fresh graduates <span>→</span></div>
          <div className="choice">Early-career developers <span>→</span></div>
        </div>
        
        {/* Correct Audience Image */}
        <div className="audience-art">
          <img 
            src={audienceImg} 
            alt="Who Crackin AI is for" 
            style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }} 
          />
        </div>
      </section>

      {/* CTA Band */}
      <section className="band reveal">
        <div className="wrap">
          <h2>Check your progress, find the weak spots, and decide what deserves your next hour.</h2>
          <Link to="/signup" className="btn btn-outline">View progress dashboard</Link>
        </div>
      </section>

      {/* Final & Footer */}
      <section className="final reveal">
        <div className="wrap">
          <h2>Your first job starts long before the interview.<br />Start preparing for it properly.</h2>
          <p className="copy">Learn. Practice. Get feedback. Improve. Crackin AI keeps the pieces together while you do the work.</p>
          <br />
          <Link to="/signup" className="btn btn-primary">Start preparing free</Link>
        </div>
        <div className="campus"></div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <Link to="/" className="brand">Crackin <b style={{color: '#1769e0'}}>AI</b></Link>
              <p className="copy" style={{ fontSize: '14px', margin: '18px 0' }}>
                A focused place to prepare for placements with better practice and useful AI feedback.
              </p>
            </div>
            <div>
              <h4>Features</h4>
              <Link to="/dsa">DSA Tracker</Link>
              <Link to="/resume">Resume Analyzer</Link>
              <Link to="/interview">Mock Interviews</Link>
              <Link to="/quiz">Aptitude Quiz</Link>
            </div>
            <div>
              <h4>Prepare</h4>
              <Link to="/company">Company Questions</Link>
              <Link to="/daily">Daily Challenge</Link>
              <Link to="/dashboard">Progress</Link>
              <Link to="/signup">Learning Paths</Link>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Accessibility</a>
            </div>
          </div>
          <div className="bottom">
            © 2026 Crackin AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}