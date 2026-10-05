import React, { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

const Reports = ({ onBack }) => {
  const [user, setUser] = useState({});
  const [profile, setProfile] = useState({});
  const [progress, setProgress] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("skinai_user") || "{}"
      );

      setUser(storedUser);

      const email = storedUser?.email || "";

      const storedProfile = JSON.parse(
        localStorage.getItem(`skinai_profile_${email}`) || "{}"
      );

      setProfile(storedProfile);

      const localProgress = JSON.parse(
        localStorage.getItem(`skinai_progress_${email}`) || "[]"
      );

      const localRoutine = JSON.parse(
        localStorage.getItem(`skinai_routine_${email}`) || "[]"
      );

      setProgress(localProgress);
      setRoutine(localRoutine);

      let assessmentData = [];

      try {
        const response = await fetch(
          `${API}/assessments/${encodeURIComponent(email)}`
        );

        if (response.ok) {
          assessmentData = await response.json();
        }
      } catch (error) {
        console.log("Assessment report loading error:", error);
      }

      let sharedReports = [];

      try {
        sharedReports = JSON.parse(
          localStorage.getItem("skinai_shared_reports") || "[]"
        );

        sharedReports = sharedReports.filter(
          (report) =>
            report.email === email ||
            report.user_email === email
        );
      } catch (error) {
        console.log("Shared report loading error:", error);
      }

      const generatedReports = [

        {
          id: "skin-health",
          icon: "❤️",
          title: "Skin Health Report",
          description:
            "Overview of your current skin health score, skin type, sensitivity and main concern.",
          type: "Skin Health",
        },

        {
          id: "assessment",
          icon: "🧠",
          title: "Skin Assessment Report",
          description:
            "Summary of your AI skin assessment and identified skincare concerns.",
          type: "Assessment",
          data: assessmentData,
        },

        {
          id: "routine",
          icon: "🌿",
          title: "Skincare Routine Report",
          description:
            "Summary of your skincare routine tracking and adherence.",
          type: "Routine",
        },

        {
          id: "products",
          icon: "🛍️",
          title: "Product Recommendation Report",
          description:
            "Overview of your personalized skincare product recommendations.",
          type: "Products",
        },

        {
          id: "progress",
          icon: "📈",
          title: "Skin Progress Report",
          description:
            "Track changes in your skin health score and progress records.",
          type: "Progress",
        },

      ];

      setReports(generatedReports);

      console.log("Assessment data:", assessmentData);
      console.log("Shared reports:", sharedReports);

    } catch (error) {
      console.log("Report data loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestScore = () => {
    if (!progress || progress.length === 0) {
      return 0;
    }

    const sorted = [...progress].sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    );

    return Number(
      sorted[0]?.score ||
      sorted[0]?.skin_score ||
      0
    );
  };

  const getLatestProgress = () => {
    if (!progress || progress.length === 0) {
      return null;
    }

    const sorted = [...progress].sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    );

    return sorted[0];
  };

  const getRoutineAdherence = () => {
    if (!routine || routine.length === 0) {
      return 0;
    }

    let completed = 0;
    let total = 0;

    routine.forEach((item) => {

      if (
        item.morning !== undefined &&
        item.morning !== null
      ) {
        total++;

        if (
          item.morning === true ||
          item.morning === 1 ||
          item.morning === "true"
        ) {
          completed++;
        }
      }

      if (
        item.evening !== undefined &&
        item.evening !== null
      ) {
        total++;

        if (
          item.evening === true ||
          item.evening === 1 ||
          item.evening === "true"
        ) {
          completed++;
        }
      }

    });

    return total > 0
      ? Math.round((completed / total) * 100)
      : 0;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Needs Attention";
  };
  const getReportDetails = (reportType) => {

    const latestScore = getLatestScore();
    const latestProgress = getLatestProgress();
    const adherence = getRoutineAdherence();

    if (reportType === "Skin Health") {
      return [
        ["User", user?.name || "Not available"],
        ["Skin Type", profile?.skin_type || profile?.skinType || "Not available"],
        [
          "Main Concern",
          profile?.main_concern ||
            profile?.concern ||
            latestProgress?.concern ||
            "Not assessed",
        ],
        [
          "Sensitivity",
          profile?.sensitivity || "Not available",
        ],
        ["Skin Health Score", `${latestScore}%`],
        ["Overall Status", getScoreLabel(latestScore)],
      ];
    }

    if (reportType === "Assessment") {
      return [
        ["Assessment Status", "Completed"],
        [
          "Primary Concern",
          profile?.main_concern ||
            profile?.concern ||
            latestProgress?.concern ||
            "Not assessed",
        ],
        [
          "Skin Type",
          profile?.skin_type ||
            profile?.skinType ||
            "Not available",
        ],
        [
          "Sensitivity",
          profile?.sensitivity ||
            "Not available",
        ],
        [
          "Latest Score",
          `${latestScore}%`,
        ],
      ];
    }

    if (reportType === "Routine") {
      return [
        ["Tracking Records", routine.length],
        ["Routine Adherence", `${adherence}%`],
        ["Morning Routine", "Tracked"],
        ["Evening Routine", "Tracked"],
        [
          "Consistency",
          adherence >= 80
            ? "Excellent"
            : adherence >= 60
            ? "Good"
            : "Needs Improvement",
        ],
      ];
    }

    if (reportType === "Products") {
      return [
        [
          "Skin Type",
          profile?.skin_type ||
            profile?.skinType ||
            "Not available",
        ],
        [
          "Main Concern",
          profile?.main_concern ||
            profile?.concern ||
            "Not assessed",
        ],
        [
          "Sensitivity",
          profile?.sensitivity ||
            "Not available",
        ],
        ["Recommendation Method", "AI Skin Matching"],
        ["Budget Consideration", "User Selected"],
      ];
    }

    if (reportType === "Progress") {
      return [
        ["Progress Records", progress.length],
        ["Latest Score", `${latestScore}%`],
        [
          "Current Status",
          getScoreLabel(latestScore),
        ],
        [
          "Latest Concern",
          latestProgress?.concern ||
            profile?.main_concern ||
            profile?.concern ||
            "Not assessed",
        ],
        [
          "Latest Update",
          latestProgress?.date ||
            "No recent update",
        ],
      ];
    }

    return [];
  };


  const downloadReport = (report) => {

    const details = getReportDetails(report.type);

    const rows = details
      .map(
        ([label, value]) =>
          `"${label}","${String(value).replace(/"/g, '""')}"`
      )
      .join("\n");

    const csvContent =
      `"SkinAI - ${report.title}"\n\n` +
      `"User Name","${user?.name || "Not available"}"\n` +
      `"Email","${user?.email || "Not available"}"\n\n` +
      `"Parameter","Value"\n` +
      rows;

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `${report.type.replace(/\s+/g, "_")}_Report.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  if (loading) {
    return (
      <div className="dashboard-page">

        <main className="dashboard-content">

          <div className="loading-state">

            <div className="loading-spinner"></div>

            <h2>
              Preparing Your Reports...
            </h2>

            <p>
              SkinAI is collecting your latest
              skincare information.
            </p>

          </div>

        </main>

      </div>
    );
  }


  return (
    <div className="dashboard-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="dashboard-navbar">

        <div className="logo">
          ✦ SkinAI
        </div>

        <div className="dashboard-actions">

          <span className="dashboard-welcome">
            Reports Center
          </span>

          <button
            className="logout-btn"
            onClick={onBack}
          >
            Back
          </button>

        </div>

      </nav>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-content">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>


        <section className="dashboard-welcome-section">

          <div className="tagline">
            SKINAI REPORT CENTER
          </div>

          <h1>
            Your Skincare Reports
          </h1>

          <p className="dashboard-description">
            View, review and export your personalized
            skincare information from one place.
          </p>

        </section>


        {/* =================================================
            REPORT SUMMARY
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                📊 Report Overview
              </h2>

              <p>
                Your latest skincare information at a glance.
              </p>

            </div>

            <span className="status-badge status-success">
              {reports.length} Reports
            </span>

          </div>


          <div className="dashboard-grid">

            <div className="dashboard-card">

              <span>
                SCORE
              </span>

              <h2>
                Skin Health
              </h2>

              <h3 className="dashboard-score">
                {getLatestScore()}%
              </h3>

              <p>
                {getScoreLabel(getLatestScore())}
              </p>

            </div>


            <div className="dashboard-card">

              <span>
                ROUTINE
              </span>

              <h2>
                Adherence
              </h2>

              <h3>
                {getRoutineAdherence()}%
              </h3>

              <p>
                Based on your tracked routine records.
              </p>

            </div>


            <div className="dashboard-card">

              <span>
                PROFILE
              </span>

              <h2>
                Skin Type
              </h2>

              <h3>
                {profile?.skin_type ||
                  profile?.skinType ||
                  "Not available"}
              </h3>

              <p>
                Used for personalized recommendations.
              </p>

            </div>


            <div className="dashboard-card">

              <span>
                PROGRESS
              </span>

              <h2>
                Records
              </h2>

              <h3>
                {progress.length}
              </h3>

              <p>
                Skin progress records available.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            REPORT CARDS
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                📁 Available Reports
              </h2>

              <p>
                Select a report to review your personalized
                skincare information.
              </p>

            </div>

          </div>


          <div className="report-grid">

            {reports.map((report) => (

              <div
                className="report-card"
                key={report.id}
              >

                <div className="report-icon">
                  {report.icon}
                </div>

                <span className="report-type">
                  {report.type}
                </span>

                <h2>
                  {report.title}
                </h2>

                <p>
                  {report.description}
                </p>

                <div className="report-card-actions">

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(
                          `report-${report.id}`
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                        })
                    }
                  >
                    View Report
                  </button>

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      downloadReport(report)
                    }
                  >
                    ⬇ Export
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>
        {/* =================================================
            DETAILED REPORTS
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                📋 Detailed Reports
              </h2>

              <p>
                Review the information included in each
                SkinAI report.
              </p>

            </div>

          </div>


          {reports.map((report) => {

            const details = getReportDetails(report.type);

            return (
              <div
                className="report-detail-card"
                id={`report-${report.id}`}
                key={report.id}
              >

                <div className="report-detail-header">

                  <div>

                    <div className="report-icon">
                      {report.icon}
                    </div>

                    <span className="report-type">
                      {report.type}
                    </span>

                    <h2>
                      {report.title}
                    </h2>

                    <p>
                      {report.description}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      downloadReport(report)
                    }
                  >
                    ⬇ Export Report
                  </button>

                </div>


                <div className="report-detail-table">

                  {details.map(
                    ([label, value], index) => (

                      <div
                        className="report-detail-row"
                        key={index}
                      >

                        <span>
                          {label}
                        </span>

                        <strong>
                          {value}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              </div>
            );

          })}

        </section>


        {/* =================================================
            EXPORT INFORMATION
        ================================================= */}

        <section className="ai-insight">

          <div className="tagline">
            REPORT EXPORT
          </div>

          <h2>
            Keep your skincare information organized. 📄
          </h2>

          <p>
            Each SkinAI report can be exported as a
            spreadsheet-compatible CSV file for record
            keeping, academic demonstration and further
            analysis.
          </p>

          <p>
            Reports are generated from the latest available
            profile, assessment, routine and progress data.
          </p>

        </section>


        {/* =================================================
            REPORT ACTIONS
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                ⚡ Report Actions
              </h2>

              <p>
                Quickly manage your SkinAI reports.
              </p>

            </div>

          </div>


          <div className="dashboard-grid">

            <div className="dashboard-card">

              <span>
                📊
              </span>

              <h2>
                Skin Health
              </h2>

              <p>
                Review your latest skin health score
                and overall status.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("report-skin-health")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Open Report
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                🌿
              </span>

              <h2>
                Routine
              </h2>

              <p>
                Review your routine tracking and
                adherence information.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("report-routine")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Open Report
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                📈
              </span>

              <h2>
                Progress
              </h2>

              <p>
                Review your skin progress records
                and latest score.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("report-progress")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Open Report
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                🧠
              </span>

              <h2>
                Assessment
              </h2>

              <p>
                Review your AI assessment information
                and identified concerns.
              </p>

              <button
                onClick={() =>
                  document
                    .getElementById("report-assessment")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Open Report
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

      </main>


      <footer className="footer">

        <p>
          ✦ SkinAI — AI-Powered Skincare Intelligence
        </p>

        <p>
          Personalized insights for healthier skin.
        </p>

        <p>
          © 2026 SkinAI Project
        </p>

      </footer>

    </div>
  );
};

export default Reports;