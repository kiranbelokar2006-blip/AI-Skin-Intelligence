import { useState } from "react";

function DermatologistDashboard() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [recommendation, setRecommendation] = useState("");

  const user = JSON.parse(
    localStorage.getItem("skinai_user") || "{}"
  );

  const [reports, setReports] = useState(() =>
    JSON.parse(
      localStorage.getItem("skinai_shared_reports") || "[]"
    )
  );

  const logout = () => {
    localStorage.removeItem("skinai_user");
    window.location.href = "/";
  };

  const openReport = (report) => {
    setSelectedReport(report);

    setRecommendation(
      report.dermatologistRecommendation || ""
    );

    setTimeout(() => {
      document
        .getElementById("full-report-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  const viewReports = () => {
    if (reports.length === 0) {
      alert("No user reports available.");
      return;
    }

    document
      .getElementById("reports-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const reviewAssessment = () => {
    if (reports.length === 0) {
      alert("No assessment reports available.");
      return;
    }

    openReport(reports[0]);
  };

  const provideRecommendation = () => {
    if (reports.length === 0) {
      alert("No user reports available.");
      return;
    }

    if (!selectedReport) {
      openReport(reports[0]);

      setTimeout(() => {
        document
          .getElementById("recommendation-section")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 200);

      return;
    }

    document
      .getElementById("recommendation-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const saveRecommendation = () => {
    if (!selectedReport) {
      alert("Please select a user report first.");
      return;
    }

    if (!recommendation.trim()) {
      alert("Please enter a recommendation.");
      return;
    }

    const updatedReports = reports.map((report) =>
      report.id === selectedReport.id
        ? {
            ...report,
            dermatologistRecommendation:
              recommendation.trim(),
            status: "Reviewed",
          }
        : report
    );

    setReports(updatedReports);

    localStorage.setItem(
      "skinai_shared_reports",
      JSON.stringify(updatedReports)
    );

    setSelectedReport({
      ...selectedReport,
      dermatologistRecommendation:
        recommendation.trim(),
      status: "Reviewed",
    });

    alert(
      "Dermatologist recommendation saved successfully!"
    );
  };

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <nav className="dashboard-navbar">

        <div className="logo">
          ✦ SkinAI
        </div>

        <div className="dashboard-actions">

          <div className="dashboard-welcome">
            {user.name || "Dermatologist"}
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* MAIN */}

      <main className="dashboard-content">

        <p className="tagline">
          DERMATOLOGIST DASHBOARD
        </p>

        <h1>
          Dermatologist Portal
        </h1>

        <p className="dashboard-description">
          Review user skin assessment reports and provide
          professional skincare recommendations.
        </p>


        {/* SUMMARY CARDS */}

        <div className="dashboard-grid">

          {/* 01 USER REPORTS */}

          <div className="dashboard-card">

            <span>01</span>

            <h2>
              User Reports
            </h2>

            <p>
              View skin assessment reports shared by users.
            </p>

            <button
              type="button"
              onClick={viewReports}
            >
              View Reports
            </button>

          </div>


          {/* 02 AI ASSESSMENT */}

          <div className="dashboard-card">

            <span>02</span>

            <h2>
              AI Assessment
            </h2>

            <p>
              Review AI-generated skin concerns and
              contributing factors.
            </p>

            <button
              type="button"
              onClick={reviewAssessment}
            >
              Review Assessment
            </button>

          </div>


          {/* 03 TREATMENT RECOMMENDATION */}

          <div className="dashboard-card">

            <span>03</span>

            <h2>
              Treatment Recommendation
            </h2>

            <p>
              Provide professional recommendations for
              the selected user.
            </p>

            <button
              type="button"
              onClick={provideRecommendation}
            >
              Provide Recommendation
            </button>

          </div>

        </div>


        {/* SHARED REPORTS */}

        <div
          id="reports-section"
          className="recommendation-box"
        >

          <h2>
            Shared User Reports
          </h2>

          {reports.length === 0 ? (

            <p>
              No reports have been shared yet.
            </p>

          ) : (

            reports.map((report) => (

              <div
                key={report.id}
                className="dashboard-card"
                style={{
                  marginTop: "20px",
                }}
              >

                <span>
                  {report.status || "Shared"}
                </span>

                <h2>
                  {report.name}
                </h2>

                <p>
                  <strong>Email:</strong>{" "}
                  {report.email}
                </p>

                <p>
                  <strong>Skin Type:</strong>{" "}
                  {report.skinType}
                </p>

                <p>
                  <strong>Main Concern:</strong>{" "}
                  {report.concern}
                </p>

                <p>
                  <strong>Health Score:</strong>{" "}
                  {report.score}%
                </p>

                <button
                  type="button"
                  onClick={() => openReport(report)}
                >
                  Open Full Report
                </button>

              </div>

            ))

          )}

        </div>


        {/* FULL REPORT */}

        {selectedReport && (

          <div
            id="full-report-section"
            className="recommendation-box"
          >

            <h2>
              Full Skin Assessment Report
            </h2>

            <p>
              <strong>User:</strong>{" "}
              {selectedReport.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedReport.email}
            </p>

            <p>
              <strong>Age:</strong>{" "}
              {selectedReport.age}
            </p>

            <p>
              <strong>Skin Type:</strong>{" "}
              {selectedReport.skinType}
            </p>

            <p>
              <strong>Main Concern:</strong>{" "}
              {selectedReport.concern}
            </p>

            <p>
              <strong>Sensitivity:</strong>{" "}
              {selectedReport.sensitivity}
            </p>

            <p>
              <strong>Skin Health Score:</strong>{" "}
              {selectedReport.score}%
            </p>

            <p>
              <strong>Concern Priority:</strong>{" "}
              {selectedReport.priority}
            </p>


            {/* SCORE BREAKDOWN */}

            {(selectedReport.skinScore !== undefined ||
              selectedReport.lifestyleScore !== undefined ||
              selectedReport.routineScore !== undefined ||
              selectedReport.habitsScore !== undefined) && (

              <div>

                <h3>
                  Skin Health Score Breakdown
                </h3>

                <p>
                  <strong>
                    Skin Condition:
                  </strong>{" "}
                  {selectedReport.skinScore ?? "N/A"}%
                </p>

                <p>
                  <strong>
                    Lifestyle:
                  </strong>{" "}
                  {selectedReport.lifestyleScore ?? "N/A"}%
                </p>

                <p>
                  <strong>
                    Skincare Routine:
                  </strong>{" "}
                  {selectedReport.routineScore ?? "N/A"}%
                </p>

                <p>
                  <strong>
                    Healthy Habits:
                  </strong>{" "}
                  {selectedReport.habitsScore ?? "N/A"}%
                </p>

              </div>

            )}


            {/* CONCERNS */}

            <h3>
              Identified Skin Concerns
            </h3>

            {selectedReport.concerns?.length > 0 ? (

              <ul>
                {selectedReport.concerns.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            ) : (

              <p>
                No major concern identified.
              </p>

            )}


            {/* FACTORS */}

            <h3>
              Contributing Factors
            </h3>

            {selectedReport.factors?.length > 0 ? (

              <ul>
                {selectedReport.factors.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            ) : (

              <p>
                No major contributing factor identified.
              </p>

            )}


            {/* ROUTINE */}

            <h3>
              AI Personalized Routine
            </h3>

            {selectedReport.routine?.length > 0 ? (

              <ul>
                {selectedReport.routine.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            ) : (

              <p>
                No personalized routine available.
              </p>

            )}


            {/* WEEK PLAN */}

            <h3>
              Week-by-Week Plan
            </h3>

            {selectedReport.weeklyPlan?.length > 0 ? (

              <ul>
                {selectedReport.weeklyPlan.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            ) : (

              <p>
                No weekly plan available.
              </p>

            )}


            {/* RECOMMENDATION */}

            <div
              id="recommendation-section"
              className="share-report-section"
            >

              <h3>
                Dermatologist Recommendation
              </h3>

              <p>
                Enter professional guidance or treatment
                recommendations for this user.
              </p>

              <textarea
                value={recommendation}
                onChange={(e) =>
                  setRecommendation(e.target.value)
                }
                placeholder="Enter your recommendation..."
                rows="5"
              />

              <button
                type="button"
                onClick={saveRecommendation}
              >
                Save Recommendation
              </button>

            </div>


            {/* SAVED RECOMMENDATION */}

            {selectedReport.dermatologistRecommendation && (

              <div>

                <h3>
                  Saved Recommendation
                </h3>

                <p>
                  {selectedReport.dermatologistRecommendation}
                </p>

              </div>

            )}


            {/* CLOSE */}

            <button
              type="button"
              onClick={() => {
                setSelectedReport(null);
                setRecommendation("");
              }}
            >
              Close Report
            </button>

          </div>

        )}

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <p>
          © 2026 SkinAI | Dermatologist Portal
        </p>

      </footer>

    </div>
  );
}

export default DermatologistDashboard;