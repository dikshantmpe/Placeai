import { useNavigate } from "react-router-dom";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>My Profile</h2>

      <div style={{ background: "white", border: "1px solid #eee", borderRadius: "16px", padding: "2rem", textAlign: "center" }}>

        {/* Avatar */}
        {user?.avatar
          ? <img src={user.avatar} alt="avatar"
              style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "1rem" }} />
          : <div style={{ width: "80px", height: "80px", borderRadius: "50%",
              background: "#4f46e5", color: "white", fontSize: "28px", fontWeight: "700",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem" }}>
              {getInitials(user?.name)}
            </div>
        }

        <h2 style={{ margin: "0 0 4px" }}>{user?.name}</h2>
        <p style={{ color: "#666", margin: "0 0 1.5rem" }}>{user?.email}</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px", marginBottom: "1.5rem" }}>
          <div style={{ background: "#f0f0ff", borderRadius: "10px", padding: "1rem" }}>
            <p style={{ margin: 0, fontWeight: "700", color: "#4f46e5", fontSize: "20px" }}>
              {parseInt(localStorage.getItem("streak") || "0")}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>Day Streak</p>
          </div>
          <div style={{ background: "#f0fff4", borderRadius: "10px", padding: "1rem" }}>
            <p style={{ margin: 0, fontWeight: "700", color: "#22c55e", fontSize: "20px" }}>
              {localStorage.getItem("quizzesTaken") || "0"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>Quizzes Done</p>
          </div>
          <div style={{ background: "#fff7ed", borderRadius: "10px", padding: "1rem" }}>
            <p style={{ margin: 0, fontWeight: "700", color: "#f97316", fontSize: "20px" }}>
              {localStorage.getItem("interviewsDone") || "0"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>Interviews</p>
          </div>
        </div>

        <button onClick={handleLogout}
          style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 28px",
            borderRadius: "8px", border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: "600" }}>
          Logout
        </button>
      </div>
    </div>
  );
}