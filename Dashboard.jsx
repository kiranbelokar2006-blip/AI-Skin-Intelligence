import { useState } from "react";
import SkinProfile from "./SkinProfile";
import Lifestyle from "./Lifestyle";
import Recommendations from "./Recommendations";

function Dashboard() {
  const [page, setPage] = useState("dashboard");

  const handleLogout = () => {
    setPage("logout");
  };

  if (page === "profile") {
    return (
      <SkinProfile
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "lifestyle") {
    return (
      <Lifestyle
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "recommendations") {
    return (
      <Recommendations
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "logout") {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="dashboard-page">

      <nav className="dashboard-navbar">

        <div className="logo">
          ✦ SkinAI
        </div>

        <div className="dashboard-actions">

          <div className="dashboard-welcome">
            Welcome to your SkinAI Dashboard
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="dashboard-content">

        <p className="tagline">
          YOUR PERSONAL SKIN SPACE
        </p>

        <h1>
          Welcome to SkinAI
        </h1>

        <p className="dashboard-description">
          Manage your skin profile, track your lifestyle and discover
          personalized skincare insights.
        </p>

        <div className="dashboard-grid">

          <div className="dashboard-card">

            <span>01</span>

            <h2>
              Skin Profile
            </h2>

            <p>
              Add your skin type, concerns and sensitivities.
            </p>

            <button
              onClick={() => setPage("profile")}
            >
              Open Profile
            </button>

          </div>

          <div className="dashboard-card">

            <span>02</span>

            <h2>
              Lifestyle Tracking
            </h2>

            <p>
              Track hydration, sleep and other lifestyle factors.
            </p>

            <button
              onClick={() => setPage("lifestyle")}
            >
              Track Lifestyle
            </button>

          </div>

          <div className="dashboard-card">

            <span>03</span>

            <h2>
              Recommendations
            </h2>

            <p>
              Get personalized skincare insights based on your profile.
            </p>

            <button
              onClick={() => setPage("recommendations")}
            >
              View Insights
            </button>

          </div>

        </div>

      </main>

      <footer className="footer">
        <p>
          © 2026 SkinAI | AI Skin Intelligence
        </p>
      </footer>

    </div>
  );
}

export default Dashboard;