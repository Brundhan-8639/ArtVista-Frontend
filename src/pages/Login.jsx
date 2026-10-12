
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://artvista-backend-echr.onrender.com";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("artvistaUser", JSON.stringify(data));

      setMessage("Login successful! Opening your gallery...");

      setTimeout(() => navigate("/gallery"), 800);
    } catch (error) {
      console.error("Login failed:", error);
      setMessage(
        error.message || "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-brand">ARTVISTA</p>
        <p className="auth-eyebrow">YOUR CREATIVE SPACE</p>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to continue your creative journey.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="alert">
            {message}
          </p>
        )}

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
