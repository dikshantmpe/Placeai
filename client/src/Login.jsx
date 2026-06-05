import { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const url = isRegister
        ? "https://placeai-sqjj.onrender.com/api/auth/register"
        : "https://placeai-sqjj.onrender.com/api/auth/login";

      const res = await axios.post(url, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { displayName, email, photoURL } = result.user;

      const res = await axios.post("https://placeai-sqjj.onrender.com/api/auth/google", {
        name: displayName, email, avatar: photoURL
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Google login failed. Try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5ff",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "2.5rem",
        width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(79,70,229,0.1)" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "#4f46e5", margin: "0 0 4px", fontSize: "26px" }}>PlacePrep AI</h1>
          <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>Your AI placement journey starts here 🚀</p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px",
          padding: "4px", marginBottom: "1.5rem" }}>
          <button onClick={() => setIsRegister(false)}
            style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none",
              cursor: "pointer", fontWeight: "500", fontSize: "14px",
              background: !isRegister ? "white" : "transparent",
              color: !isRegister ? "#4f46e5" : "#666",
              boxShadow: !isRegister ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
            Login
          </button>
          <button onClick={() => setIsRegister(true)}
            style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none",
              cursor: "pointer", fontWeight: "500", fontSize: "14px",
              background: isRegister ? "white" : "transparent",
              color: isRegister ? "#4f46e5" : "#666",
              boxShadow: isRegister ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
            Register
          </button>
        </div>

        {/* Form */}
        {isRegister && (
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Full Name"
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px",
              border: "1px solid #ddd", fontSize: "14px", marginBottom: "12px",
              boxSizing: "border-box" }} />
        )}

        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="Email Address" type="email"
          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px",
            border: "1px solid #ddd", fontSize: "14px", marginBottom: "12px",
            boxSizing: "border-box" }} />

        <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder="Password" type="password"
          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px",
            border: "1px solid #ddd", fontSize: "14px", marginBottom: "16px",
            boxSizing: "border-box" }} />

        {error && <p style={{ color: "red", fontSize: "13px", margin: "0 0 12px" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#4f46e5", color: "white",
            borderRadius: "8px", border: "none", cursor: "pointer",
            fontSize: "15px", fontWeight: "600", marginBottom: "12px" }}>
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#eee" }} />
          <span style={{ color: "#999", fontSize: "13px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#eee" }} />
        </div>

        {/* Google Button */}
        <button onClick={handleGoogle}
          style={{ width: "100%", padding: "11px", background: "white", color: "#333",
            borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer",
            fontSize: "14px", fontWeight: "500", display: "flex",
            alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}