import React, { useEffect, useState } from "react";

import SkinProfile from "./SkinProfile";
import Lifestyle from "./Lifestyle";
import Recommendations from "./Recommendations";
import IngredientIntelligence from "./IngredientIntelligence";
import ProductRecommendations from "./ProductRecommendations";
import ProgressTracking from "./ProgressTracking";
import Notifications from "./Notifications";
import Reports from "./Reports";

const API = "http://127.0.0.1:8000";

const UserDashboard = () => {
  const [page, setPage] = useState("dashboard");

  const [latestScore, setLatestScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(null);

  const [routineAdherence, setRoutineAdherence] = useState(0);
  const [routineCount, setRoutineCount] = useState(0);

  const [mainConcern, setMainConcern] = useState("Not assessed");
  const [skinType, setSkinType] = useState("Not available");
  const [sensitivity, setSensitivity] = useState("Not available");

  const user = JSON.parse(
    localStorage.getItem("skinai_user") || "{}"
  );

  const email = user?.email || "";

  useEffect(() => {
    if (!email) return;

    loadProgress();
    loadRoutine();
    loadProfile();
  }, [email]);

  const loadProgress = async () => {
    try {
      const response = await fetch(
        `${API}/progress-tracking/${encodeURIComponent(email)}`
      );

      let backendData = [];

      if (response.ok) {
        backendData = await response.json();
      }

      const localData = JSON.parse(
        localStorage.getItem(`skinai_progress_${email}`) || "[]"
      );

      const combined = [...backendData, ...localData];

      const unique = combined.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (x) =>
              `${x.date}_${x.score}_${x.concern}` ===
              `${item.date}_${item.score}_${item.concern}`
          )
      );

      unique.sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );

      if (unique.length > 0) {
        const current = Number(
          unique[0].score ||
          unique[0].skin_score ||
          0
        );

        setLatestScore(current);

        setMainConcern(
          unique[0].concern ||
          unique[0].main_concern ||
          "Not assessed"
        );

        if (unique.length > 1) {
          setPreviousScore(
            Number(
              unique[1].score ||
              unique[1].skin_score ||
              0
            )
          );
        }
      }
    } catch (error) {
      console.log("Progress loading error:", error);
    }
  };

  const loadRoutine = async () => {
    try {
      const response = await fetch(
        `${API}/routine-tracking/${encodeURIComponent(email)}`
      );

      let backendData = [];

      if (response.ok) {
        backendData = await response.json();
      }

      const localData = JSON.parse(
        localStorage.getItem(`skinai_routine_${email}`) || "[]"
      );

      const combined = [...backendData, ...localData];

      const unique = combined.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (x) =>
              `${x.date}_${x.morning}_${x.evening}` ===
              `${item.date}_${item.morning}_${item.evening}`
          )
      );

      unique.sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );

      if (unique.length > 0) {
        let completed = 0;
        let total = 0;

        unique.forEach((item) => {
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

        const adherence =
          total > 0
            ? Math.round((completed / total) * 100)
            : 0;

        setRoutineAdherence(adherence);
        setRoutineCount(unique.length);
      }
    } catch (error) {
      console.log("Routine loading error:", error);
    }
  };

  const loadProfile = () => {
    try {
      const profile = JSON.parse(
        localStorage.getItem(`skinai_profile_${email}`) || "{}"
      );

      if (profile.skin_type) {
        setSkinType(profile.skin_type);
      }

      if (profile.skinType) {
        setSkinType(profile.skinType);
      }

      if (profile.sensitivity) {
        setSensitivity(profile.sensitivity);
      }

      if (profile.main_concern) {
        setMainConcern(profile.main_concern);
      }

      if (profile.concern) {
        setMainConcern(profile.concern);
      }
    } catch (error) {
      console.log("Profile loading error:", error);
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Needs Attention";
  };

  const getPersonalizedInsight = () => {
    if (latestScore >= 80) {
      return {
        title: "Your skin is doing great! ✨",
        text:
          "Keep following your personalized routine and continue tracking your progress regularly.",
      };
    }

    if (latestScore >= 60) {
      return {
        title: "Your skin is progressing well 🌿",
        text:
          "Stay consistent with your skincare routine, hydration and healthy lifestyle habits.",
      };
    }

    if (latestScore >= 40) {
      return {
        title: "Your skin needs consistent care 💚",
        text:
          "Follow your SkinAI recommendations regularly and monitor your skin progress.",
      };
    }

    return {
      title: "Let's improve your skin health 🌱",
      text:
        "Complete your profile and assessment to receive more personalized skincare recommendations.",
    };
  };

  const getMyReports = () => {
    try {
      const reports = JSON.parse(
        localStorage.getItem("skinai_shared_reports") || "[]"
      );

      return reports.filter(
        (report) =>
          report.email === email ||
          report.user_email === email
      );
    } catch {
      return [];
    }
  };

  const logout = () => {
    localStorage.removeItem("skinai_user");
    window.location.href = "/";
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

  if (page === "assessment") {
    return (
      <Recommendations
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "ingredients") {
    return (
      <IngredientIntelligence
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "products") {
    return (
      <ProductRecommendations
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "progress") {
    return (
      <ProgressTracking
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "notifications") {
    return (
      <Notifications
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "reports") {
    return (
      <Reports
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "doctor") {
    const reports = getMyReports();

    return (
      <div className="dashboard-page">

        <nav className="dashboard-navbar">

          <div className="logo">
            ✦ SkinAI
          </div>

          <div className="dashboard-actions">

            <span className="dashboard-welcome">
              Dermatologist Support
            </span>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="dashboard-content">

          <button
            className="back-button"
            onClick={() => setPage("dashboard")}
          >
            ← Back to Dashboard
          </button>

          <div className="dashboard-welcome-section">

            <div className="tagline">
              DERMATOLOGIST SUPPORT
            </div>

            <h1>
              Dermatologist Feedback
            </h1>

            <p className="dashboard-description">
              View reports shared with your dermatologist
              and monitor professional feedback.
            </p>

          </div>

          {reports.length === 0 ? (

            <div className="empty-state">

              <h3>
                No shared reports yet
              </h3>

              <p>
                Your dermatologist reports will appear here
                after a report is shared.
              </p>

            </div>

          ) : (

            reports.map((report, index) => (

              <div
                className="shared-report-card"
                key={index}
              >

                <h2>
                  Dermatologist Report
                </h2>

                <p>
                  <strong>Dermatologist:</strong>{" "}
                  {report.dermatologist_name ||
                    report.doctor_name ||
                    "Not available"}
                </p>

                <p>
                  <strong>Skin Health Score:</strong>{" "}
                  {report.score ||
                    report.skin_score ||
                    "Not available"}
                </p>

                <p>
                  <strong>Main Concern:</strong>{" "}
                  {report.concern ||
                    report.main_concern ||
                    "Not available"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {report.status || "Shared"}
                </p>

                <hr />

                <p>
                  <strong>Recommendation:</strong>
                </p>

                <p>
                  {report.recommendation ||
                    report.feedback ||
                    "No recommendation available yet."}
                </p>

              </div>

            ))

          )}

        </main>

        <footer className="footer">

          <p>
            ✦ SkinAI — AI-Powered Skincare Intelligence
          </p>

          <p>
            Personalized insights for healthier skin.
          </p>

        </footer>

      </div>
    );
  }

  const insight = getPersonalizedInsight();

  const scoreDifference =
    previousScore !== null
      ? latestScore - previousScore
      : 0;

  return (
    <div className="dashboard-page">

      {/* =====================================================
          DASHBOARD NAVBAR
      ===================================================== */}

      <nav className="dashboard-navbar">

        <div className="logo">
          ✦ SkinAI
        </div>

        <div className="dashboard-actions">

          <span className="dashboard-welcome">
            Welcome, {user?.name || "User"}
          </span>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <main className="dashboard-content">

        <section className="dashboard-welcome-section">

          <div className="tagline">
            AI-POWERED SKINCARE
          </div>

          <h1>
            Your Skin. Your Intelligence.
          </h1>

          <p className="dashboard-description">
            Welcome to your personalized SkinAI dashboard.
            Monitor your skin health, follow your skincare
            routine and get AI-powered recommendations.
          </p>

        </section>


        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                Quick Access
              </h2>

              <p>
                Access your most important skincare tools.
              </p>

            </div>

          </div>


          <div className="dashboard-grid">

            <div className="dashboard-card">

              <span>
                01
              </span>

              <h2>
                Skin Profile
              </h2>

              <p>
                Manage your skin type, concerns and
                sensitivity information.
              </p>

              <button
                onClick={() => setPage("profile")}
              >
                View Profile
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                02
              </span>

              <h2>
                Lifestyle Tracking
              </h2>

              <p>
                Track hydration, sleep and lifestyle
                habits related to your skin health.
              </p>

              <button
                onClick={() => setPage("lifestyle")}
              >
                Track Lifestyle
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                03
              </span>

              <h2>
                AI Skin Assessment
              </h2>

              <p>
                Analyze your skin concerns and receive
                personalized recommendations.
              </p>

              <button
                onClick={() => setPage("assessment")}
              >
                Start Assessment
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                04
              </span>

              <h2>
                Progress Tracking
              </h2>

              <p>
                Monitor changes in your skin health
                score and skincare progress.
              </p>

              <button
                onClick={() => setPage("progress")}
              >
                View Progress
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                05
              </span>

              <h2>
                Reports Center
              </h2>

              <p>
                View your skin health, assessment,
                routine, product and progress reports.
              </p>

              <button
                onClick={() => setPage("reports")}
              >
                View Reports
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            NOTIFICATION CENTER
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                🔔 Smart Notifications
              </h2>

              <p>
                Stay updated with your skincare reminders,
                hydration alerts and progress updates.
              </p>

            </div>

            <span className="status-badge status-success">
              Active
            </span>

          </div>


          <div className="dashboard-card">

            <span>
              ALERTS
            </span>

            <h2>
              Personalized Reminders
            </h2>

            <p>
              SkinAI can remind you about your morning
              and evening routine, sunscreen, hydration,
              sleep and skin progress.
            </p>

            <button
              onClick={() => setPage("notifications")}
            >
              🔔 View Notifications
            </button>

          </div>

        </section>


        {/* =================================================
            REPORTS CENTER
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                📊 Reports Center
              </h2>

              <p>
                Access your personalized skincare reports
                and export them for record keeping.
              </p>

            </div>

            <span className="status-badge status-success">
              5 Reports
            </span>

          </div>


          <div className="dashboard-card">

            <span>
              REPORTS
            </span>

            <h2>
              Personalized Skin Reports
            </h2>

            <p>
              View Skin Health, Assessment, Routine,
              Product Recommendation and Progress reports
              in one place.
            </p>

            <button
              onClick={() => setPage("reports")}
            >
              📄 Open Reports Center
            </button>

          </div>

        </section>


        {/* =================================================
            AI SKIN HEALTH OVERVIEW
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                AI Skin Health Overview
              </h2>

              <p>
                Your current personalized skin health
                information.
              </p>

            </div>

          </div>


          <div className="dashboard-grid">


            {/* SCORE */}

            <div className="dashboard-card">

              <span>
                01
              </span>

              <h2>
                Skin Health Score
              </h2>

              <h3 className="dashboard-score">
                {latestScore}%
              </h3>

              <p className="score-label">
                {getScoreLabel(latestScore)}
              </p>

              {previousScore !== null && (

                <p
                  className={
                    scoreDifference >= 0
                      ? "score-improvement"
                      : "score-decline"
                  }
                >
                  {scoreDifference >= 0
                    ? `↑ ${scoreDifference}% improvement`
                    : `↓ ${Math.abs(scoreDifference)}% change`}
                </p>

              )}

            </div>


            {/* ROUTINE */}

            <div className="dashboard-card">

              <span>
                02
              </span>

              <h2>
                Routine Adherence
              </h2>

              <h3>
                {routineAdherence}%
              </h3>

              <p>
                Based on your tracked morning and
                evening skincare routine.
              </p>

              <p>
                {routineCount} routine record
                {routineCount === 1 ? "" : "s"} tracked.
              </p>

            </div>


            {/* CONCERN */}

            <div className="dashboard-card">

              <span>
                03
              </span>

              <h2>
                Main Skin Concern
              </h2>

              <h3>
                {mainConcern}
              </h3>

              <p>
                SkinAI uses your main concern to
                personalize recommendations.
              </p>

            </div>


            {/* SKIN TYPE */}

            <div className="dashboard-card">

              <span>
                04
              </span>

              <h2>
                Skin Type
              </h2>

              <h3>
                {skinType}
              </h3>

              <p>
                Your recommendations are adjusted
                according to your skin type.
              </p>

            </div>


            {/* SENSITIVITY */}

            <div className="dashboard-card">

              <span>
                05
              </span>

              <h2>
                Skin Sensitivity
              </h2>

              <h3>
                {sensitivity}
              </h3>

              <p>
                Ingredient and product suggestions
                consider your sensitivity level.
              </p>

            </div>


            {/* PRODUCTS */}

            <div className="dashboard-card">

              <span>
                06
              </span>

              <h2>
                Recommended Products
              </h2>

              <h3>
                AI Matched
              </h3>

              <p>
                Explore products based on your
                skin profile, concern and budget.
              </p>

              <button
                onClick={() => setPage("products")}
              >
                View Products
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            PERSONALIZED ROUTINE
        ================================================= */}

        <section className="recommendation-box routine-section">

          <div className="section-heading">

            <div>

              <h2>
                🌿 Personalized Routine
              </h2>

              <p>
                Follow a simple morning and evening
                skincare routine.
              </p>

            </div>

          </div>


          <div className="dashboard-grid">


            {/* MORNING */}

            <div className="routine-card">

              <h2>
                ☀️ Morning Routine
              </h2>

              <p>
                <strong>Step 1:</strong>{" "}
                Gentle cleanser
              </p>

              <p>
                <strong>Step 2:</strong>{" "}
                Recommended treatment
              </p>

              <p>
                <strong>Step 3:</strong>{" "}
                Moisturizer
              </p>

              <p>
                <strong>Step 4:</strong>{" "}
                Sunscreen
              </p>

              <button
                onClick={() => setPage("assessment")}
              >
                View Full Routine
              </button>

            </div>


            {/* EVENING */}

            <div className="routine-card">

              <h2>
                🌙 Evening Routine
              </h2>

              <p>
                <strong>Step 1:</strong>{" "}
                Cleanser
              </p>

              <p>
                <strong>Step 2:</strong>{" "}
                Recommended treatment
              </p>

              <p>
                <strong>Step 3:</strong>{" "}
                Moisturizer
              </p>

              <p>
                <strong>Step 4:</strong>{" "}
                Skin recovery care
              </p>

              <button
                onClick={() => setPage("assessment")}
              >
                View Full Routine
              </button>

            </div>

          </div>

        </section>
        {/* =================================================
            SKIN PROFILE SUMMARY
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                👤 Your Skin Profile
              </h2>

              <p>
                Your current profile information used by
                SkinAI for personalization.
              </p>

            </div>

            <button
              onClick={() => setPage("profile")}
            >
              Update Profile
            </button>

          </div>


          <div className="profile-summary">

            <div className="profile-summary-card">

              <h3>
                Skin Type
              </h3>

              <p>
                {skinType}
              </p>

            </div>


            <div className="profile-summary-card">

              <h3>
                Main Concern
              </h3>

              <p>
                {mainConcern}
              </p>

            </div>


            <div className="profile-summary-card">

              <h3>
                Sensitivity
              </h3>

              <p>
                {sensitivity}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            SKINAI INTELLIGENCE TOOLS
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                🧠 SkinAI Intelligence
              </h2>

              <p>
                Explore AI-powered tools designed for
                personalized skincare decisions.
              </p>

            </div>

          </div>


          <div className="feature-tool-grid">


            {/* INGREDIENT */}

            <div className="feature-tool-card">

              <div className="icon-box">
                🧪
              </div>

              <h3>
                Ingredient Intelligence
              </h3>

              <p>
                Understand ingredient benefits,
                suitability, precautions and possible
                interactions.
              </p>

              <button
                onClick={() => setPage("ingredients")}
              >
                Explore Ingredients
              </button>

            </div>


            {/* PRODUCTS */}

            <div className="feature-tool-card">

              <div className="icon-box">
                🛍️
              </div>

              <h3>
                Product Recommendations
              </h3>

              <p>
                Get product suggestions based on your
                skin type, concern, sensitivity and budget.
              </p>

              <button
                onClick={() => setPage("products")}
              >
                Explore Products
              </button>

            </div>


            {/* PROGRESS */}

            <div className="feature-tool-card">

              <div className="icon-box">
                📈
              </div>

              <h3>
                Skin Progress
              </h3>

              <p>
                Track your skin health score and observe
                changes over time.
              </p>

              <button
                onClick={() => setPage("progress")}
              >
                View Progress
              </button>

            </div>


            {/* NOTIFICATIONS */}

            <div className="feature-tool-card">

              <div className="icon-box">
                🔔
              </div>

              <h3>
                Smart Notifications
              </h3>

              <p>
                Receive reminders for skincare routines,
                hydration, sunscreen, sleep and progress.
              </p>

              <button
                onClick={() => setPage("notifications")}
              >
                View Notifications
              </button>

            </div>


            {/* REPORTS */}

            <div className="feature-tool-card">

              <div className="icon-box">
                📊
              </div>

              <h3>
                Reports Center
              </h3>

              <p>
                View your skin health, assessment, routine,
                product and progress reports.
              </p>

              <button
                onClick={() => setPage("reports")}
              >
                View Reports
              </button>

            </div>


            {/* ASSESSMENT */}

            <div className="feature-tool-card">

              <div className="icon-box">
                ✨
              </div>

              <h3>
                AI Skin Assessment
              </h3>

              <p>
                Analyze your skin concerns and generate
                personalized skincare recommendations.
              </p>

              <button
                onClick={() => setPage("assessment")}
              >
                Start Assessment
              </button>

            </div>


            {/* DERMATOLOGIST */}

            <div className="feature-tool-card">

              <div className="icon-box">
                👨‍⚕️
              </div>

              <h3>
                Dermatologist Support
              </h3>

              <p>
                View reports shared with your dermatologist
                and monitor professional feedback.
              </p>

              <button
                onClick={() => setPage("doctor")}
              >
                View Feedback
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            AI PERSONALIZED INSIGHT
        ================================================= */}

        <section className="ai-insight">

          <div className="tagline">
            AI PERSONALIZED INSIGHT
          </div>

          <h2>
            {insight.title}
          </h2>

          <p>
            {insight.text}
          </p>

        </section>


        {/* =================================================
            DERMATOLOGIST SUPPORT
        ================================================= */}

        <section className="recommendation-box doctor-section">

          <div className="section-heading">

            <div>

              <h2>
                👨‍⚕️ Dermatologist Support
              </h2>

              <p>
                Keep track of reports and professional
                skincare feedback.
              </p>

            </div>

            <button
              onClick={() => setPage("doctor")}
            >
              Open Reports
            </button>

          </div>


          <div className="doctor-card">

            <h2>
              Professional Skin Review
            </h2>

            <p>
              Share your assessment with a dermatologist
              and review feedback from your professional
              skincare consultation.
            </p>

            <div className="concern-tag">
              Current Concern: {mainConcern}
            </div>

            <div className="concern-tag">
              Health Score: {latestScore}%
            </div>

          </div>

        </section>
        {/* =================================================
            SKINAI JOURNEY
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                ✦ Your SkinAI Journey
              </h2>

              <p>
                Follow these steps to build a healthier
                and more consistent skincare routine.
              </p>

            </div>

          </div>


          <div className="dashboard-grid">

            <div className="dashboard-card">

              <span>
                01
              </span>

              <h2>
                Build Your Profile
              </h2>

              <p>
                Keep your skin type, concerns and
                sensitivity information updated.
              </p>

              <button
                onClick={() => setPage("profile")}
              >
                Manage Profile
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                02
              </span>

              <h2>
                Understand Your Skin
              </h2>

              <p>
                Complete your AI assessment to identify
                important skin concerns and risk factors.
              </p>

              <button
                onClick={() => setPage("assessment")}
              >
                Assess Skin
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                03
              </span>

              <h2>
                Follow Your Routine
              </h2>

              <p>
                Maintain your morning and evening routine
                and track your consistency.
              </p>

              <button
                onClick={() => setPage("lifestyle")}
              >
                Track Habits
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                04
              </span>

              <h2>
                Track Your Progress
              </h2>

              <p>
                Monitor your skin health score and
                observe your progress over time.
              </p>

              <button
                onClick={() => setPage("progress")}
              >
                View Progress
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            FINAL DASHBOARD ACTIONS
        ================================================= */}

        <section className="recommendation-box">

          <div className="section-heading">

            <div>

              <h2>
                ⚡ Dashboard Actions
              </h2>

              <p>
                Quickly access the tools you use most.
              </p>

            </div>

          </div>


          <div className="dashboard-grid">


            <div className="dashboard-card">

              <span>
                🔔
              </span>

              <h2>
                Notifications
              </h2>

              <p>
                Check your latest skincare reminders,
                routine alerts and progress notifications.
              </p>

              <button
                onClick={() => setPage("notifications")}
              >
                Open Notifications
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                📊
              </span>

              <h2>
                Reports Center
              </h2>

              <p>
                View and export your personalized
                skincare reports.
              </p>

              <button
                onClick={() => setPage("reports")}
              >
                Open Reports
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                🧪
              </span>

              <h2>
                Ingredient Intelligence
              </h2>

              <p>
                Learn about skincare ingredients and
                their suitability for your skin.
              </p>

              <button
                onClick={() => setPage("ingredients")}
              >
                Explore Ingredients
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                🛍️
              </span>

              <h2>
                Product Recommendations
              </h2>

              <p>
                Discover AI-matched products according
                to your skincare needs and budget.
              </p>

              <button
                onClick={() => setPage("products")}
              >
                View Recommendations
              </button>

            </div>


            <div className="dashboard-card">

              <span>
                👨‍⚕️
              </span>

              <h2>
                Dermatologist Reports
              </h2>

              <p>
                View shared reports and professional
                feedback from your dermatologist.
              </p>

              <button
                onClick={() => setPage("doctor")}
              >
                View Reports
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            FINAL MESSAGE
        ================================================= */}

        <section className="ai-insight">

          <div className="tagline">
            YOUR SKIN. YOUR INTELLIGENCE.
          </div>

          <h2>
            Keep your skincare journey consistent. 🌿
          </h2>

          <p>
            SkinAI brings your skin profile, assessment,
            personalized recommendations, routine tracking,
            progress monitoring, smart reminders and reports
            together in one platform.
          </p>

        </section>


      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

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

export default UserDashboard;