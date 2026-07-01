import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Signup({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      setUser(userCredential.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Sign Up</h1>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Create Account</button>
      </form>

      <p style={{ color: "red" }}>{error}</p>

      <Link to="/login">Back to Login</Link>
    </div>
  );
}