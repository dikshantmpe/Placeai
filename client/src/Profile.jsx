import { useNavigate } from "react-router-dom";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const streak = parseInt(localStorage.getItem("streak") || "0");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getInitials = (name) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";

  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}>My Profile</h2>
        <p style={{ color: "#555", margin: 0, fontSize: "14px" }}>Manage your account and view your progress.</p>
      </div>

      {/* Profile Card */}
      <div style={{
        background: "#111", border: "1px solid #1f1f1f",
        borderRadius: "20px", overflow: "hidden", marginBottom: "16px"
      }}>
        {/* Banner */}
        <div style={{
          height: "80px",
          background: "linear-gradient(135deg, #1a0505 0%, #2d0a0a 50%, #1a0a1a 100%)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)",
            width: "150px", height: "150px",
            background: "radial-gradient(circle, rgba(220,38,38,0.3) 0%, transparent 70%)",
            borderRadius: "50%"
          }} />
        </div>

        {/* Avatar + Info */}
        <div style={{ padding: "0 2rem 2rem", marginTop: "-30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  border: "3px solid #111", objectFit: "cover"
                }} />
              : <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "#dc2626", color: "white", fontSize: "22px", fontWeight: "700",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "3px solid #111"
                }}>
                  {getInitials(user?.name)}
                </div>
            }
            <button onClick={handleLogout} style={{
              background: "rgba(239,68,68,0.1)", color: "#ef4444",
              padding: "8px 20px", borderRadius: "8px",
              border: "1px solid rgba(239,68,68,0.3)",
              cursor: "pointer", fontSize: "13px", fontWeight: "600"
            }}>
              Logout
            </button>
          </div>

          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700" }}>{user?.name}</h2>
          <p style={{ color: "#555", margin: "0 0 4px", fontSize: "14px" }}>{user?.email}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)",
            padding: "3px 10px", borderRadius: "20px", fontSize: "11px", color: "#dc2626" }}>
            🎯 Placement Aspirant
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Day Streak", value: streak, icon: "🔥", color: "#f97316" },
          { label: "Quizzes Done", value: localStorage.getItem("quizzesTaken") || "0", icon: "🧠", color: "#7c3aed" },
          { label: "Interviews", value: localStorage.getItem("interviewsDone") || "0", icon: "🎤", color: "#2563eb" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "14px", padding: "20px", textAlign: "center",
            transition: "border-color 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = s.color + "55"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
          >
            <p style={{ margin: "0 0 8px", fontSize: "28px" }}>{s.icon}</p>
            <p style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: "800", color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Account Info */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.5rem" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 1rem", color: "#aaa",
          textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Details</h3>
        {[
          { label: "Full Name", value: user?.name, icon: "👤" },
          { label: "Email Address", value: user?.email, icon: "✉️" },
          { label: "Account Type", value: "Free Plan", icon: "⭐" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "12px 0",
            borderBottom: i < 2 ? "1px solid #1a1a1a" : "none"
          }}>
            <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{item.icon}</span>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#555" }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#ddd" }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}