import React, { useState } from "react";

const API = "http://127.0.0.1:8000";

function Recommendations({ onBack }) {

  /* =========================================
     GET LOGGED-IN USER
  ========================================= */

  const user =
    JSON.parse(
      localStorage.getItem("skinai_user") ||
      localStorage.getItem("user") ||
      "{}"
    );

  /* =========================================
     FORM STATES
  ========================================= */

  const [age, setAge] = useState(
    user.age || ""
  );

  const [skinType, setSkinType] = useState(
    user.skin_type || ""
  );

  const [concerns, setConcerns] = useState(
    Array.isArray(user.concerns)
      ? user.concerns
      : []
  );

  const [sensitivity, setSensitivity] = useState(
    user.sensitivity || ""
  );

  const [water, setWater] = useState(
    user.water || ""
  );

  const [sleep, setSleep] = useState(
    user.sleep || ""
  );

  const [exercise, setExercise] = useState(
    user.exercise || ""
  );

  const [season, setSeason] = useState(
    user.season || ""
  );

  const [result, setResult] = useState(null);

  const [selectedDermatologist, setSelectedDermatologist] =
    useState("");

  const [shareMessage, setShareMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =========================================
     SKIN CONCERN HANDLER
  ========================================= */

  const handleConcernChange = (concern) => {

    setConcerns((previous) => {

      if (previous.includes(concern)) {

        return previous.filter(
          (item) => item !== concern
        );

      }

      return [...previous, concern];

    });

  };

  /* =========================================
     SCORE CALCULATION
  ========================================= */

  const calculateSkinScore = () => {

    let score = 50;

    if (skinType) {
      score += 10;
    }

    if (concerns.length > 0) {
      score += 10;
    }

    if (sensitivity === "Low") {
      score += 10;
    }

    if (
      Number(water) >= 6
    ) {
      score += 5;
    }

    if (
      Number(sleep) >= 7
    ) {
      score += 5;
    }

    return Math.min(
      100,
      Math.max(0, score)
    );
  };

  /* =========================================
     GENERATE ASSESSMENT
  ========================================= */

  const generateAssessment = async () => {

    if (!skinType) {
      alert("Please select your skin type.");
      return;
    }

    if (concerns.length === 0) {
      alert(
        "Please select at least one skin concern."
      );
      return;
    }

    setLoading(true);
    setShareMessage("");

    const skinScore =
      calculateSkinScore();

    const mainConcern =
      concerns[0] || "General Skin Health";

    const assessment = {

      id: null,

      email:
        user.email || "",

      name:
        user.name ||
        user.full_name ||
        "User",

      age:
        Number(age) || 0,

      skin_type:
        skinType,

      concerns:
        concerns,

      sensitivity:
        sensitivity,

      lifestyle: {

        water:
          Number(water) || 0,

        sleep:
          Number(sleep) || 0,

        exercise:
          exercise

      },

      season:
        season,

      score:
        skinScore,

      skin_assessment: {

        summary:
          `Your skin profile indicates ${skinType.toLowerCase()} skin with ${mainConcern.toLowerCase()} as a primary concern.`,

        skin_type_analysis:
          `${skinType} skin requires a consistent skincare routine based on hydration, cleansing and suitable active ingredients.`,

        concern_analysis:
          `The assessment focuses on ${concerns.join(", ")}.`,

        sensitivity_analysis:
          sensitivity
            ? `Your reported sensitivity level is ${sensitivity}.`
            : "Sensitivity information was not provided."

      },

      priority:
        concerns.length > 0
          ? concerns[0]
          : "General Skin Health",

      risk_factors: [

        water && Number(water) < 6
          ? "Low water intake"
          : null,

        sleep && Number(sleep) < 7
          ? "Insufficient sleep"
          : null,

        exercise === "No"
          ? "Low physical activity"
          : null,

        sensitivity === "High"
          ? "High skin sensitivity"
          : null

      ].filter(Boolean),

      treatment_plan: {

        morning: [
          "Gentle cleanser",
          "Suitable moisturizer",
          "Broad-spectrum sunscreen"
        ],

        evening: [
          "Gentle cleanser",
          "Targeted skincare product",
          "Moisturizer"
        ]

      },

      seasonal_advice:
        season
          ? `During ${season.toLowerCase()}, maintain a skincare routine suitable for your skin type and concerns.`
          : "Maintain a consistent skincare routine throughout the year.",

      weekly_plan: [

        "Monday - Cleanse and moisturize",

        "Tuesday - Follow targeted treatment",

        "Wednesday - Hydrate skin",

        "Thursday - Continue targeted treatment",

        "Friday - Cleanse and moisturize",

        "Saturday - Skin hydration and care",

        "Sunday - Review routine and skin condition"

      ],

      adaptive_recommendation:
        `For ${skinType.toLowerCase()} skin with ${mainConcern.toLowerCase()}, follow a gentle and consistent routine and monitor your skin response.`,

      lifestyle_summary: {

        water:
          water
            ? `${water} glasses/day`
            : "Not provided",

        sleep:
          sleep
            ? `${sleep} hours/day`
            : "Not provided",

        exercise:
          exercise || "Not provided"

      },

      created_at:
        new Date().toISOString()

    };

    /* =========================================
       SAVE ASSESSMENT LOCALLY FIRST
    ========================================= */

    try {

      const history =
        JSON.parse(
          localStorage.getItem(
            "skinai_assessment_history"
          ) || "[]"
        );

      history.push(assessment);

      localStorage.setItem(
        "skinai_assessment_history",
        JSON.stringify(history)
      );

    } catch (error) {

      console.log(
        "Local assessment save error:",
        error
      );

    }

    /* =========================================
       TRY BACKEND ASSESSMENT SAVE
       IMPORTANT:
       THIS DOES NOT BREAK FRONTEND IF IT FAILS
    ========================================= */

    try {

      const response =
        await fetch(
          `${API}/assessment`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email:
                user.email || "",

              age:
                Number(age) || 0,

              skin_type:
                skinType,

              concerns:
                concerns,

              sensitivity:
                sensitivity,

              water:
                Number(water) || 0,

              sleep:
                Number(sleep) || 0,

              exercise:
                exercise,

              season:
                season,

              score:
                skinScore
            })
          }
        );

      const data =
        await response.json()
          .catch(() => ({}));

      if (response.ok) {

        const backendAssessmentId =
          data.assessment_id ??
          data.assessmentId ??
          data.id ??
          data.report_id ??
          null;

        assessment.id =
          backendAssessmentId;

      }

    } catch (error) {

      console.log(
        "Backend assessment unavailable. Using local assessment."
      );

    }

    /* =========================================
       SHOW RESULT
    ========================================= */

    setResult({
      ...assessment
    });

    setLoading(false);

  };
  /* =========================================
     SHARE REPORT
     FRONTEND / LOCAL STORAGE ONLY
     NO BACKEND SHARE API
  ========================================= */

  const shareReport = () => {

    if (!result) {
      setShareMessage(
        "Please generate the assessment first."
      );
      return;
    }

    if (!selectedDermatologist) {
      setShareMessage(
        "Please select a dermatologist."
      );
      return;
    }

    try {

      const sharedReport = {

        id: Date.now(),

        assessment_id:
          result.id || null,

        email:
          user.email || "",

        name:
          user.name ||
          user.full_name ||
          "User",

        dermatologist_name:
          selectedDermatologist,

        report:
          result,

        status:
          "Shared",

        shared_at:
          new Date().toISOString()

      };

      const existingReports =
        JSON.parse(
          localStorage.getItem(
            "skinai_shared_reports"
          ) || "[]"
        );

      existingReports.push(
        sharedReport
      );

      localStorage.setItem(
        "skinai_shared_reports",
        JSON.stringify(existingReports)
      );

      setShareMessage(
        `Report shared successfully with ${selectedDermatologist}.`
      );

    } catch (error) {

      console.error(
        "Share report error:",
        error
      );

      setShareMessage(
        "Unable to save shared report."
      );

    }

  };


  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (value) => {

    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  };


  /* =========================================
     SCORE COLOR
  ========================================= */

  const getScoreLabel = (score) => {

    if (score >= 80) {
      return "Good";
    }

    if (score >= 60) {
      return "Moderate";
    }

    return "Needs Attention";

  };


  /* =========================================
     COMMON STYLES
  ========================================= */

  const cardStyle = {

    background: "#ffffff",

    border:
      "1px solid #dcefe8",

    borderRadius: "14px",

    padding: "22px",

    marginBottom: "20px",

    boxShadow:
      "0 3px 12px rgba(35,111,90,0.06)"

  };

  const sectionTitleStyle = {

    color: "#236f5a",

    marginTop: 0,

    marginBottom: "15px"

  };

  const buttonStyle = {

    padding: "11px 18px",

    border: "none",

    borderRadius: "8px",

    background: "#236f5a",

    color: "#ffffff",

    fontWeight: "600",

    cursor: "pointer",

    marginRight: "10px",

    marginBottom: "10px"

  };


  /* =========================================
     RESULT PAGE
  ========================================= */

  if (result) {

    return (

      <div className="dashboard-page">

        {/* NAVBAR */}

        <nav className="dashboard-navbar">

          <div className="logo">
            ✦ SkinAI
          </div>

          <div className="dashboard-actions">

            <div className="dashboard-welcome">

              Welcome,{" "}

              {user.name ||
                user.full_name ||
                "User"}

            </div>

            <button
              className="logout-btn"
              type="button"
              onClick={() => {

                localStorage.removeItem(
                  "skinai_user"
                );

                localStorage.removeItem(
                  "user"
                );

                window.location.href =
                  "/";

              }}
            >
              Logout
            </button>

          </div>

        </nav>


        {/* MAIN CONTENT */}

        <main className="dashboard-content">

          <button
            type="button"
            onClick={() => {

              setResult(null);

              setShareMessage("");

            }}
            style={buttonStyle}
          >
            ← Back to Assessment
          </button>


          <p className="tagline">
            AI-POWERED SKINCARE
          </p>

          <h1>
            Personalized Skin Assessment
          </h1>

          <p className="dashboard-description">

            Your personalized AI skin assessment
            based on your skin profile,
            concerns and lifestyle.

          </p>


          {/* ================================
              ASSESSMENT SUMMARY
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Assessment Summary
            </h2>

            <p>
              <strong>Name:</strong>{" "}
              {result.name || "User"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {result.email || "—"}
            </p>

            <p>
              <strong>Age:</strong>{" "}
              {result.age || "—"}
            </p>

            <p>
              <strong>Assessment Date:</strong>{" "}
              {formatDate(
                result.created_at
              )}
            </p>

            <p>
              <strong>Assessment ID:</strong>{" "}
              {result.id || "Local Assessment"}
            </p>

          </div>


          {/* ================================
              SKIN HEALTH SCORE
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Skin Health Score
            </h2>

            <div
              style={{
                fontSize: "48px",
                fontWeight: "700",
                color: "#236f5a",
                marginBottom: "5px"
              }}
            >
              {result.score || 0}%
            </div>

            <p>
              {getScoreLabel(
                Number(result.score || 0)
              )}
            </p>

          </div>


          {/* ================================
              SCORE BREAKDOWN
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Score Breakdown
            </h2>

            <p>
              <strong>Skin Type:</strong>{" "}
              {result.skin_type || "—"}
            </p>

            <p>
              <strong>Skin Concerns:</strong>{" "}
              {result.concerns?.length
                ? result.concerns.join(", ")
                : "—"}
            </p>

            <p>
              <strong>Sensitivity:</strong>{" "}
              {result.sensitivity || "—"}
            </p>

            <p>
              <strong>Water Intake:</strong>{" "}
              {result.lifestyle?.water || 0}{" "}
              glasses/day
            </p>

            <p>
              <strong>Sleep:</strong>{" "}
              {result.lifestyle?.sleep || 0}{" "}
              hours/day
            </p>

            <p>
              <strong>Exercise:</strong>{" "}
              {result.lifestyle?.exercise ||
                "—"}
            </p>

          </div>


          {/* ================================
              AI SKIN ASSESSMENT
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              AI Skin Assessment
            </h2>

            <p>
              <strong>Summary:</strong>{" "}
              {result.skin_assessment?.summary ||
                "Assessment generated based on your profile."}
            </p>

            <p>
              <strong>Skin Type Analysis:</strong>{" "}
              {result.skin_assessment
                ?.skin_type_analysis ||
                "—"}
            </p>

            <p>
              <strong>Concern Analysis:</strong>{" "}
              {result.skin_assessment
                ?.concern_analysis ||
                "—"}
            </p>

            <p>
              <strong>Sensitivity Analysis:</strong>{" "}
              {result.skin_assessment
                ?.sensitivity_analysis ||
                "—"}
            </p>

          </div>


          {/* ================================
              SKIN CONCERNS
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Skin Concerns
            </h2>

            {result.concerns?.length ? (

              <ul>

                {result.concerns.map(
                  (concern, index) => (

                    <li key={index}>
                      {concern}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No specific concern selected.
              </p>

            )}

          </div>


          {/* ================================
              PRIORITY
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Concern Priority
            </h2>

            <p>

              <strong>
                Primary Concern:
              </strong>{" "}

              {result.priority ||
                "General Skin Health"}

            </p>

          </div>


          {/* ================================
              RISK FACTORS
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Risk & Contributing Factors
            </h2>

            {result.risk_factors?.length ? (

              <ul>

                {result.risk_factors.map(
                  (factor, index) => (

                    <li key={index}>
                      {factor}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No major lifestyle risk factors
                identified from the provided data.
              </p>

            )}

          </div>
          {/* ================================
              TREATMENT PLANNING
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Treatment Planning Module
            </h2>

            <h3>
              Recommended Approach
            </h3>

            <p>
              Follow a consistent skincare routine
              according to your skin type and
              identified concerns.
            </p>

            <h3>
              Morning Routine
            </h3>

            <ul>

              {result.treatment_plan?.morning?.map(
                (item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                )
              )}

            </ul>

            <h3>
              Evening Routine
            </h3>

            <ul>

              {result.treatment_plan?.evening?.map(
                (item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>


          {/* ================================
              SEASONAL RECOMMENDATION
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Seasonal Skincare Recommendation
            </h2>

            <p>
              {result.seasonal_advice ||
                "Maintain a consistent skincare routine suitable for your skin type."}
            </p>

            <p>
              <strong>Current Season:</strong>{" "}
              {result.season || "Not provided"}
            </p>

          </div>


          {/* ================================
              WEEKLY PLAN
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              7-Module Weekly Plan
            </h2>

            {result.weekly_plan?.length ? (

              <ol>

                {result.weekly_plan.map(
                  (item, index) => (

                    <li
                      key={index}
                      style={{
                        marginBottom: "8px"
                      }}
                    >
                      {item}
                    </li>

                  )
                )}

              </ol>

            ) : (

              <p>
                Weekly skincare plan will be
                generated based on your profile.
              </p>

            )}

          </div>


          {/* ================================
              ADAPTIVE RECOMMENDATION
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Adaptive Skincare Recommendation
            </h2>

            <p>
              {result.adaptive_recommendation ||
                "Follow a personalized routine and monitor your skin response regularly."}
            </p>

          </div>


          {/* ================================
              LIFESTYLE SUMMARY
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Lifestyle Summary
            </h2>

            <p>

              <strong>
                Water Intake:
              </strong>{" "}

              {result.lifestyle_summary?.water ||
                "Not provided"}

            </p>

            <p>

              <strong>
                Sleep:
              </strong>{" "}

              {result.lifestyle_summary?.sleep ||
                "Not provided"}

            </p>

            <p>

              <strong>
                Exercise:
              </strong>{" "}

              {result.lifestyle_summary?.exercise ||
                "Not provided"}

            </p>

          </div>


          {/* ================================
              SHARE REPORT
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Share Assessment Report
            </h2>

            <p>
              Select a dermatologist to share
              your assessment report.
            </p>

            <select
              value={selectedDermatologist}
              onChange={(event) =>
                setSelectedDermatologist(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginTop: "8px",
                marginBottom: "15px"
              }}
            >

              <option value="">
                Select Dermatologist
              </option>

              <option value="Dr. Priya Sharma">
                Dr. Priya Sharma
              </option>

              <option value="Dr. Rahul Patil">
                Dr. Rahul Patil
              </option>

              <option value="Dr. Sneha Deshmukh">
                Dr. Sneha Deshmukh
              </option>

            </select>


            <button
              type="button"
              onClick={shareReport}
              style={buttonStyle}
            >
              Share Report
            </button>


            {shareMessage && (

              <p
                style={{
                  marginTop: "12px",
                  fontWeight: "600",
                  color:
                    shareMessage.includes(
                      "successfully"
                    )
                      ? "#236f5a"
                      : "#d9534f"
                }}
              >
                {shareMessage}
              </p>

            )}

          </div>


          {/* ================================
              IMPORTANT NOTE
          ================================= */}

          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Important Note
            </h2>

            <p>
              SkinAI provides AI-based skincare
              guidance for informational purposes.
              For persistent, severe or changing
              skin concerns, consult a qualified
              dermatologist.
            </p>

          </div>


          {/* ================================
              RESULT ACTIONS
          ================================= */}

          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px"
            }}
          >

            <button
              type="button"
              onClick={() => {

                setResult(null);

                setShareMessage("");

                setSelectedDermatologist("");

              }}
              style={buttonStyle}
            >
              Reassess Skin
            </button>


            <button
              type="button"
              onClick={onBack}
              style={buttonStyle}
            >
              Back to Dashboard
            </button>

          </div>


        </main>


        {/* FOOTER */}

        <footer className="footer">

          <p>
            © 2026 SkinAI | AI Skin Intelligence
          </p>

        </footer>

      </div>

    );

  }


  /* =========================================
     PART 4 WILL CONTINUE HERE
  ========================================= */
  /* =========================================
     ASSESSMENT FORM
  ========================================= */

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <nav className="dashboard-navbar">

        <div className="logo">
          ✦ SkinAI
        </div>

        <div className="dashboard-actions">

          <div className="dashboard-welcome">
            Welcome,{" "}
            {user.name ||
              user.full_name ||
              "User"}
          </div>

          <button
            className="logout-btn"
            type="button"
            onClick={() => {

              localStorage.removeItem(
                "skinai_user"
              );

              localStorage.removeItem(
                "user"
              );

              window.location.href = "/";

            }}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* MAIN */}

      <main className="dashboard-content">

        <button
          type="button"
          onClick={onBack}
          style={{
            marginBottom: "20px"
          }}
        >
          ← Back to Dashboard
        </button>


        <p className="tagline">
          AI-POWERED SKINCARE
        </p>

        <h1>
          AI Skin Assessment
        </h1>

        <p className="dashboard-description">

          Enter your skin and lifestyle
          information to generate your
          personalized skincare assessment.

        </p>


        {/* =================================
            PERSONAL INFORMATION
        ================================= */}

        <div style={cardStyle}>

          <h2 style={sectionTitleStyle}>
            Personal Information
          </h2>

          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px"
            }}
          >
            Age
          </label>

          <input
            type="number"
            value={age}
            onChange={(event) =>
              setAge(event.target.value)
            }
            placeholder="Enter your age"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />

        </div>


        {/* =================================
            SKIN PROFILE
        ================================= */}

        <div style={cardStyle}>

          <h2 style={sectionTitleStyle}>
            Skin Profile
          </h2>

          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px"
            }}
          >
            Skin Type
          </label>

          <select
            value={skinType}
            onChange={(event) =>
              setSkinType(event.target.value)
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >

            <option value="">
              Select Skin Type
            </option>

            <option value="Oily">
              Oily
            </option>

            <option value="Dry">
              Dry
            </option>

            <option value="Combination">
              Combination
            </option>

            <option value="Normal">
              Normal
            </option>

            <option value="Sensitive">
              Sensitive
            </option>

          </select>

        </div>


        {/* =================================
            SKIN CONCERNS
        ================================= */}

        <div style={cardStyle}>

          <h2 style={sectionTitleStyle}>
            Skin Concerns
          </h2>

          {[
            "Acne",
            "Pigmentation",
            "Dark Spots",
            "Dryness",
            "Dullness",
            "Wrinkles"
          ].map((concern) => (

            <label
              key={concern}
              style={{
                display: "block",
                marginBottom: "12px",
                cursor: "pointer"
              }}
            >

              <input
                type="checkbox"
                checked={
                  concerns.includes(
                    concern
                  )
                }
                onChange={() =>
                  handleConcernChange(
                    concern
                  )
                }
                style={{
                  marginRight: "9px"
                }}
              />

              {concern}

            </label>

          ))}

        </div>


        {/* =================================
            SKIN SENSITIVITY
        ================================= */}

        <div style={cardStyle}>

          <h2 style={sectionTitleStyle}>
            Skin Sensitivity
          </h2>

          <select
            value={sensitivity}
            onChange={(event) =>
              setSensitivity(
                event.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >

            <option value="">
              Select Sensitivity
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

          </select>

        </div>


        {/* =================================
            LIFESTYLE TRACKING
        ================================= */}

        <div style={cardStyle}>

          <h2 style={sectionTitleStyle}>
            Lifestyle Tracking
          </h2>


          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px"
            }}
          >
            Water Intake
          </label>

          <input
            type="number"
            value={water}
            onChange={(event) =>
              setWater(event.target.value)
            }
            placeholder="Glasses per day"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "18px"
            }}
          />


          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px"
            }}
          >
            Sleep
          </label>

          <input
            type="number"
            value={sleep}
            onChange={(event) =>
              setSleep(event.target.value)
            }
            placeholder="Hours per day"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "18px"
            }}
          />


          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "8px"
            }}
          >
            Exercise
          </label>

          <select
            value={exercise}
            onChange={(event) =>
              setExercise(event.target.value)
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >

            <option value="">
              Select
            </option>

            <option value="Yes">
              Yes
            </option>

            <option value="No">
              No
            </option>

          </select>

        </div>


        {/* =================================
            CURRENT SEASON
        ================================= */}

        <div style={cardStyle}>

          <h2 style={sectionTitleStyle}>
            Current Season
          </h2>

          <select
            value={season}
            onChange={(event) =>
              setSeason(event.target.value)
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >

            <option value="">
              Select Season
            </option>

            <option value="Summer">
              Summer
            </option>

            <option value="Monsoon">
              Monsoon
            </option>

            <option value="Winter">
              Winter
            </option>

          </select>

        </div>


        {/* =================================
            GENERATE BUTTON
        ================================= */}

        <div
          style={{
            marginTop: "20px",
            marginBottom: "30px"
          }}
        >

          <button
            type="button"
            onClick={generateAssessment}
            disabled={loading}
            style={{
              ...buttonStyle,
              padding: "13px 24px",
              fontSize: "15px",
              opacity:
                loading ? 0.7 : 1
            }}
          >

            {loading
              ? "Generating Assessment..."
              : "Generate Skin Assessment"}

          </button>

        </div>

      </main>


      {/* =================================
          FOOTER
      ================================= */}

      <footer className="footer">

        <p>
          © 2026 SkinAI | AI Skin Intelligence
        </p>

      </footer>

    </div>
  );

}

export default Recommendations;