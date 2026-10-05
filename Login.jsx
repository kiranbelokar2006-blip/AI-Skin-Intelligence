import { useState } from "react";
import Dashboard from "./Dashboard";
import UserDashboard from "./UserDashboard";
import DermatologistDashboard from "./DermatologistDashboard";
import ConsultantDashboard from "./ConsultantDashboard";

function Login({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(
          "skinai_user",
          JSON.stringify(data.user)
        );

        setLoggedInUser(data.user);
      } else {
        alert(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);

      alert(
        "Backend is not connected. Please make sure the backend is running."
      );
    }
  };

  if (loggedInUser) {
    const role = String(loggedInUser.role || "").toLowerCase();

    if (role === "dermatologist") {
      return <DermatologistDashboard />;
    }

    if (role === "consultant") {
      return <ConsultantDashboard />;
    }

    if (role === "user") {
      return <UserDashboard />;
    }

    return <Dashboard />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>

        <p>
          Login to continue your SkinAI journey.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p className="register-text">
          Don't have an account?{" "}

          <button
            type="button"
            className="register-btn"
            onClick={onRegister}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;