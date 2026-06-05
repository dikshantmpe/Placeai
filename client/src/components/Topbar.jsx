import { Link } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "▦" },
  { label: "Daily Challenge", path: "/daily", icon: "🔥" },
  { label: "DSA Tracker", path: "/dsa", icon: "⟨/⟩" },
  { label: "Resume Analyzer", path: "/resume", icon: "📄" },
  { label: "Mock Interview", path: "/interview", icon: "🎤" },
  { label: "Aptitude Quiz", path: "/quiz", icon: "🧠" },
  { label: "Company Q&A", path: "/company", icon: "🏢" },
];

export default function Topbar({ user }) {
  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";

  return (
    <div style={{
      height: "56px", background: "#111111", borderBottom: "1px solid #222",
      display: "flex", alignItems: "center", paddingLeft: "240px",
      paddingRight: "24px", position: "fixed", top: 0, left: 0,
      right: 0, zIndex: 99, gap: "4px"
    }}>
      {/* Nav Items */}
      <div style={{ display: "flex", gap: "4px", flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.path} to={item.path}>
            <div style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
              color: "#888", display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer", whiteSpace: "nowrap" }}>
              <span>{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "20px", cursor: "pointer", color: "#888" }}>🔔</span>
        {user ? (
          <Link to="/profile">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar"
                    style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                : <div style={{ width: "32px", height: "32px", borderRadius: "50%",
                    background: "#dc2626", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>
                    {getInitials(user.name)}
                  </div>
              }
              <span style={{ fontSize: "14px", color: "#ccc" }}>
                Hi, {user?.name?.split(" ")[0]} ▾
              </span>
            </div>
          </Link>
        ) : (
          <Link to="/login">
            <button style={{ background: "#dc2626", color: "white", border: "none",
              padding: "7px 16px", borderRadius: "8px", cursor: "pointer",
              fontSize: "13px", fontWeight: "600" }}>
              Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}