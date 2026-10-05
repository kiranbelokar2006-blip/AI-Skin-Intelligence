import { useState } from "react";

function ConsultantDashboard() {
  const [reports] = useState(() =>
    JSON.parse(localStorage.getItem("skinai_shared_reports") || "[]")
  );

  const user = JSON.parse(localStorage.getItem("skinai_user") || "{}");

  const logout = () => {
    localStorage.removeItem("skinai_user");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-navbar">
        <div className="logo">✦ SkinAI</div>

        <div className="dashboard-actions">
          <div className="dashboard-welcome">
            Welcome, {user.name || "Consultant"}
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <p className="tagline">CONSULTANT DASHBOARD</p>

        <h1>Consultant Portal</h1>

        <p className="dashboard-description">
          Support users with skincare guidance and review shared skin
          information.
        </p>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>01</span>

            <h2>Shared Reports</h2>

            <p>
              View reports shared by SkinAI users.
            </p>

            <button
              onClick={() => {
                if (reports.length === 0) {
                  alert("No reports available.");
                } else {
                  alert(`${reports.length} report(s) available.`);
                }
              }}
            >
              View Reports
            </button>
          </div>

          <div className="dashboard-card">
            <span>02</span>

            <h2>Skin Guidance</h2>

            <p>
              Provide general skincare guidance based on user information.
            </p>

            <button
              onClick={() =>
                alert("Skin guidance module is ready.")
              }
            >
              Provide Guidance
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 SkinAI | Consultant Portal</p>
      </footer>
    </div>
  );
}

export default ConsultantDashboard;