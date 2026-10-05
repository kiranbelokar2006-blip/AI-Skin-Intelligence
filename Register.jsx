import { useState } from "react";

function Register({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Registration successful! You can now login.");
        onLogin();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Backend is not connected. Please make sure the backend is running.");
      console.error(error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✦ SkinAI</div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Create your account and start your personalized skincare journey.
        </p>

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="User">User</option>
            <option value="Consultant">Consultant</option>
            <option value="Dermatologist">Dermatologist</option>
          </select>

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <p className="register-text">
          Already have an account?{" "}
          <button
            type="button"
            className="text-button"
            onClick={onLogin}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;