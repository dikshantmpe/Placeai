import React from "react";
import { useNavigate } from "react-router-dom";

export default function ComingSoon({ theme = "light" }) {
  const navigate = useNavigate();

  return (
    <div className={`design-a ${theme}`}>
      <style>{`
        .cs-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg, #f3f2ef);
          padding: 20px;
          text-align: center;
        }
        .cs-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--card-border, #dedbd5);
          border-radius: var(--radius, 12px);
          padding: 48px 32px;
          max-width: 440px;
          box-shadow: var(--shadow-md, 0 4px 16px rgba(0,0,0,0.06));
          animation: fadeInUp 0.5s ease both;
        }
        .cs-icon {
          font-size: 56px;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }
        .cs-title {
          color: var(--navy, #10264a);
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 12px;
          letter-spacing: -0.3px;
        }
        .cs-text {
          color: var(--muted, #68758a);
          font-size: 15px;
          line-height: 1.5;
          margin: 0 0 28px;
        }
        .cs-btn {
          background: var(--p, #1769e0);
          color: #fff;
          border: none;
          padding: 11px 24px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cs-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(23,105,224,0.3);
        }
      `}</style>

      <div className="cs-container">
        <div className="cs-card">
          <div className="cs-icon">🚧</div>
          <h1 className="cs-title">Under Construction</h1>
          <p className="cs-text">
            We are currently building this feature in the lab to make your preparation even better. It will be rolling out soon!
          </p>
          <button className="cs-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}