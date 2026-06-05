import { Link, useLocation, useNavigate } from "react-router-dom";
import visionImg from "../assets/vision.jpg";

const menuItems = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "⟨/⟩", label: "DSA Tracker", path: "/dsa" },
  { icon: "📄", label: "Resume Analyzer", path: "/resume" },
  { icon: "🎤", label: "Mock Interview", path: "/interview" },
  { icon: "🧠", label: "Aptitude Quiz", path: "/quiz" },
  { icon: "🏢", label: "Company Questions", path: "/company" },
  { icon: "🔥", label: "Daily Challenge", path: "/daily" },
];

export default function Sidebar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?";

  return (
    <div style={{
      width: "220px", minHeight: "100vh", background: "#111111",
      borderRight: "1px solid #1f1f1f", display: "flex",
      flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px", borderBottom: "1px solid #1f1f1f",
        display: "flex", alignItems: "center", gap: "10px"
      }}>
        <img src={visionImg} alt="logo"
          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #dc2626" }} />
        <span style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>
          PlacePrep <span style={{ color: "#dc2626" }}>AI</span>
        </span>
      </div>

      {/* User profile */}
      {user && (
        <div onClick={() => navigate("/profile")} style={{
          padding: "12px 16px", borderBottom: "1px solid #1f1f1f",
          display: "flex", alignItems: "center", gap: "10px", cursor: "pointer"
        }}>
          {user.avatar
            ? <img src={user.avatar} alt="avatar"
                style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
            : <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "#dc2626", color: "white", fontSize: "12px",
                fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {getInitials(user.name)}
              </div>
          }
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "white" }}>{user.name}</div>
            <div style={{ fontSize: "11px", color: "#666" }}>View Profile</div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path && item.path !== "/dashboard"
            ? true
            : location.pathname === item.path && item.label === "Dashboard";
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path + item.label} to={item.path}>
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", borderRadius: "8px", marginBottom: "2px",
                background: isActive ? "#dc2626" : "transparent",
                color: isActive ? "white" : "#888",
                cursor: "pointer", fontSize: "14px", fontWeight: isActive ? "600" : "400",
                transition: "all 0.2s"
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}
              >
                <span style={{ fontSize: "15px", minWidth: "20px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Go Pro */}
      <div style={{
        margin: "8px", background: "#1a1a1a", borderRadius: "12px",
        padding: "14px", border: "1px solid #2a2a2a"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span>👑</span>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "white" }}>Go Pro</span>
        </div>
        <p style={{ color: "#666", fontSize: "12px", marginBottom: "10px", lineHeight: "1.4" }}>
          Unlock premium features & exclusive content.
        </p>
        <button style={{
          width: "100%", background: "#dc2626", color: "white",
          border: "none", borderRadius: "8px", padding: "8px",
          cursor: "pointer", fontWeight: "600", fontSize: "13px"
        }}>
          Upgrade Now
        </button>
      </div>

      {/* Login/Logout */}
      <div style={{
        padding: "12px 16px", borderTop: "1px solid #1f1f1f",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        {user ? (
          <button onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/";
          }} style={{
            background: "transparent", border: "1px solid #333",
            color: "#888", borderRadius: "8px", padding: "6px 14px",
            cursor: "pointer", fontSize: "13px", width: "100%"
          }}>
            Logout
          </button>
        ) : (
          <Link to="/login" style={{ width: "100%" }}>
            <button style={{
              width: "100%", background: "#dc2626", color: "white",
              border: "none", borderRadius: "8px", padding: "8px",
              cursor: "pointer", fontWeight: "600", fontSize: "13px"
            }}>
              Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}