import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

const COLORS = {
  primary: "#236f5a",
  secondary: "#3b9b7a",
  light: "#eef8f4",
  lighter: "#f7fbf9",
  text: "#334155",
  muted: "#64748b",
  border: "#dcefe8",
  danger: "#d9534f",
  white: "#ffffff",
};

function ProgressTracking({ onBack }) {
  const storedUser = JSON.parse(
    localStorage.getItem("skinai_user") || "{}"
  );

  const email = storedUser.email || "";

  const userName =
    storedUser.name ||
    storedUser.full_name ||
    "User";

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // Main tab
  const [activeTab, setActiveTab] =
    useState("routine");

  // Routine states
  const [morning, setMorning] =
    useState(false);

  const [evening, setEvening] =
    useState(false);

  const [routineRecords, setRoutineRecords] =
    useState([]);

  const [routineAdherence, setRoutineAdherence] =
    useState(0);

  const [routineDays, setRoutineDays] =
    useState(0);

  const [completeDays, setCompleteDays] =
    useState(0);

  // Progress states
  const [score, setScore] =
    useState("");

  const [concern, setConcern] =
    useState("");

  const [progressRecords, setProgressRecords] =
    useState([]);

  const [loadingRoutine, setLoadingRoutine] =
    useState(false);

  const [loadingProgress, setLoadingProgress] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // Styles
  const cardStyle = {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "20px",
    boxShadow:
      "0 3px 12px rgba(35,111,90,0.06)",
  };

  const titleStyle = {
    color: COLORS.primary,
    marginTop: 0,
    marginBottom: "18px",
    fontSize: "22px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
    color: COLORS.text,
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    color: COLORS.text,
    background: COLORS.white,
  };

  const primaryButton = {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: COLORS.primary,
    color: COLORS.white,
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  };

  const secondaryButton = {
    ...primaryButton,
    background: COLORS.white,
    color: COLORS.primary,
    border: `1px solid ${COLORS.primary}`,
  };

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const ProgressBar = ({ value }) => {
    const safeValue = Math.max(
      0,
      Math.min(100, Number(value || 0))
    );

    return (
      <div
        style={{
          width: "100%",
          height: "10px",
          background: "#e5eee9",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${safeValue}%`,
            height: "100%",
            background: COLORS.secondary,
            borderRadius: "20px",
          }}
        />
      </div>
    );
  };

  const calculateRoutine = (records) => {
    if (
      !Array.isArray(records) ||
      records.length === 0
    ) {
      setRoutineDays(0);
      setCompleteDays(0);
      setRoutineAdherence(0);
      return;
    }

    const complete = records.filter((item) => {
      const morningDone =
        Boolean(item.morning) ||
        Boolean(item.morning_completed);

      const eveningDone =
        Boolean(item.evening) ||
        Boolean(item.evening_completed);

      return morningDone && eveningDone;
    }).length;

    const total = records.length;

    const percentage =
      total > 0
        ? Math.round((complete / total) * 100)
        : 0;

    setRoutineDays(total);
    setCompleteDays(complete);
    setRoutineAdherence(percentage);
  };

  const loadRoutine = async () => {
    if (!email) return;

    let records = [];

    try {
      const response = await fetch(
        `${API}/routine-tracking/${encodeURIComponent(
          email
        )}`
      );

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          records = data;
        } else if (
          Array.isArray(data.routines)
        ) {
          records = data.routines;
        }
      }
    } catch (error) {
      console.log(
        "Routine API unavailable."
      );
    }

    if (records.length === 0) {
      const localRecords = JSON.parse(
        localStorage.getItem(
          `skinai_routine_${email}`
        ) || "[]"
      );

      if (Array.isArray(localRecords)) {
        records = localRecords;
      }
    }

    setRoutineRecords(records);
    calculateRoutine(records);

    const todayRecord = records.find(
      (item) => item.date === today
    );

    if (todayRecord) {
      setMorning(
        Boolean(
          todayRecord.morning ||
            todayRecord.morning_completed
        )
      );

      setEvening(
        Boolean(
          todayRecord.evening ||
            todayRecord.evening_completed
        )
      );
    }
  };

  const loadProgress = async () => {
    if (!email) return;

    let records = [];

    try {
      const response = await fetch(
        `${API}/progress-tracking/${encodeURIComponent(
          email
        )}`
      );

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          records = data;
        } else if (
          Array.isArray(data.progress)
        ) {
          records = data.progress;
        }
      }
    } catch (error) {
      console.log(
        "Progress API unavailable."
      );
    }

    if (records.length === 0) {
      const localRecords = JSON.parse(
        localStorage.getItem(
          `skinai_progress_${email}`
        ) || "[]"
      );

      if (Array.isArray(localRecords)) {
        records = localRecords;
      }
    }

    setProgressRecords(records);
  };

  useEffect(() => {
    loadRoutine();
    loadProgress();
  }, []);
  const saveRoutine = async () => {
    if (!email) {
      showMessage("User email not found.");
      return;
    }

    setLoadingRoutine(true);

    const routineData = {
      email,
      date: today,
      morning,
      evening,
    };

    let saved = false;

    try {
      const response = await fetch(
        `${API}/routine-tracking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(routineData),
        }
      );

      if (response.ok) {
        saved = true;
      }
    } catch (error) {
      console.log(
        "Routine API unavailable."
      );
    }

    // LocalStorage backup
    const storageKey =
      `skinai_routine_${email}`;

    const oldRecords = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    const existingIndex = oldRecords.findIndex(
      (item) => item.date === today
    );

    const newRecord = {
      email,
      date: today,
      morning,
      evening,
      morning_completed: morning,
      evening_completed: evening,
    };

    let updatedRecords = [...oldRecords];

    if (existingIndex >= 0) {
      updatedRecords[existingIndex] =
        newRecord;
    } else {
      updatedRecords.push(newRecord);
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedRecords)
    );

    setRoutineRecords(updatedRecords);
    calculateRoutine(updatedRecords);

    showMessage(
      saved
        ? "Routine saved successfully."
        : "Routine saved locally."
    );

    setLoadingRoutine(false);
  };

  const saveProgress = async () => {
    if (!email) {
      showMessage("User email not found.");
      return;
    }

    if (score === "") {
      showMessage(
        "Please enter your skin health score."
      );
      return;
    }

    const numericScore = Number(score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      showMessage(
        "Score must be between 0 and 100."
      );
      return;
    }

    setLoadingProgress(true);

    const progressData = {
      email,
      date: today,
      score: numericScore,
      concern,
      notes: "",
    };

    let saved = false;

    try {
      const response = await fetch(
        `${API}/progress-tracking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(progressData),
        }
      );

      if (response.ok) {
        saved = true;
      }
    } catch (error) {
      console.log(
        "Progress API unavailable."
      );
    }

    // LocalStorage backup
    const storageKey =
      `skinai_progress_${email}`;

    const oldRecords = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    const newRecord = {
      email,
      date: today,
      score: numericScore,
      concern,
      notes: "",
    };

    const filteredRecords =
      oldRecords.filter(
        (item) => item.date !== today
      );

    const updatedRecords = [
      ...filteredRecords,
      newRecord,
    ];

    localStorage.setItem(
      storageKey,
      JSON.stringify(updatedRecords)
    );

    setProgressRecords(updatedRecords);

    setScore("");
    setConcern("");

    showMessage(
      saved
        ? "Progress saved successfully."
        : "Progress saved locally."
    );

    setLoadingProgress(false);
  };

  const sortedProgress = [
    ...progressRecords,
  ].sort((a, b) => {
    return (
      new Date(a.date || 0) -
      new Date(b.date || 0)
    );
  });

  const latestRecord =
    sortedProgress.length > 0
      ? sortedProgress[
          sortedProgress.length - 1
        ]
      : null;

  const previousRecord =
    sortedProgress.length > 1
      ? sortedProgress[
          sortedProgress.length - 2
        ]
      : null;

  const currentScore = latestRecord
    ? Number(latestRecord.score || 0)
    : 0;

  const previousScore = previousRecord
    ? Number(previousRecord.score || 0)
    : 0;

  const scoreDifference =
    currentScore - previousScore;

  const monthData = {};

  sortedProgress.forEach((item) => {
    if (!item.date) return;

    const date = new Date(item.date);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const monthKey =
      date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });

    if (!monthData[monthKey]) {
      monthData[monthKey] = [];
    }

    monthData[monthKey].push(
      Number(item.score || 0)
    );
  });

  const monthEntries =
    Object.entries(monthData);

  const monthAverage = monthEntries.map(
    ([month, values]) => {
      const total = values.reduce(
        (sum, value) => sum + value,
        0
      );

      return {
        month,
        average: Math.round(
          total / values.length
        ),
      };
    }
  );

  const getStatus = (value) => {
    const numericValue = Number(value || 0);

    if (numericValue >= 80) {
      return "Excellent";
    }

    if (numericValue >= 60) {
      return "Good";
    }

    if (numericValue >= 40) {
      return "Needs Improvement";
    }

    return "Needs Attention";
  };

  const getTrend = () => {
    if (!previousRecord) {
      return "No previous record";
    }

    if (scoreDifference > 0) {
      return "Improving";
    }

    if (scoreDifference < 0) {
      return "Declining";
    }

    return "Stable";
  };return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.lighter,
        padding: "30px",
        boxSizing: "border-box",
        color: COLORS.text,
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: COLORS.primary,
                fontSize: "30px",
              }}
            >
              Progress Tracking
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: COLORS.muted,
              }}
            >
              Track your skincare routine and skin
              health progress.
            </p>
          </div>

          <button
            onClick={onBack}
            style={secondaryButton}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setActiveTab("routine")}
            style={{
              ...primaryButton,
              background:
                activeTab === "routine"
                  ? COLORS.primary
                  : COLORS.white,
              color:
                activeTab === "routine"
                  ? COLORS.white
                  : COLORS.primary,
            }}
          >
            Routine Tracking
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            style={{
              ...primaryButton,
              background:
                activeTab === "progress"
                  ? COLORS.primary
                  : COLORS.white,
              color:
                activeTab === "progress"
                  ? COLORS.white
                  : COLORS.primary,
            }}
          >
            Skin Health & Progress
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              background: COLORS.light,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.primary,
              padding: "12px 15px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "600",
            }}
          >
            {message}
          </div>
        )}

        {/* ROUTINE TAB */}
        {activeTab === "routine" && (
          <>
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Daily Routine Tracking
              </h2>

              <p
                style={{
                  color: COLORS.muted,
                  marginTop: 0,
                  marginBottom: "20px",
                }}
              >
                Track whether you completed your
                morning and evening skincare routine.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                }}
              >
                {/* MORNING */}
                <label
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "10px",
                    padding: "18px",
                    background: COLORS.lighter,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={morning}
                      onChange={(e) =>
                        setMorning(
                          e.target.checked
                        )
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                      }}
                    />

                    <strong>
                      Morning Routine
                    </strong>
                  </div>

                  <p
                    style={{
                      margin:
                        "10px 0 0 28px",
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Cleanser → Treatment →
                    Moisturizer → Sunscreen
                  </p>
                </label>

                {/* EVENING */}
                <label
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "10px",
                    padding: "18px",
                    background: COLORS.lighter,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={evening}
                      onChange={(e) =>
                        setEvening(
                          e.target.checked
                        )
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                      }}
                    />

                    <strong>
                      Evening Routine
                    </strong>
                  </div>

                  <p
                    style={{
                      margin:
                        "10px 0 0 28px",
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Cleanser → Treatment →
                    Moisturizer
                  </p>
                </label>
              </div>

              <button
                onClick={saveRoutine}
                disabled={loadingRoutine}
                style={{
                  ...primaryButton,
                  marginTop: "20px",
                  opacity:
                    loadingRoutine ? 0.7 : 1,
                }}
              >
                {loadingRoutine
                  ? "Saving..."
                  : "Save Today's Routine"}
              </button>
            </div>

            {/* ROUTINE ADHERENCE */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Routine Adherence
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: COLORS.light,
                    borderRadius: "10px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Overall Adherence
                  </div>

                  <div
                    style={{
                      color: COLORS.primary,
                      fontSize: "28px",
                      fontWeight: "700",
                      marginTop: "5px",
                    }}
                  >
                    {routineAdherence}%
                  </div>
                </div>

                <div
                  style={{
                    background: COLORS.light,
                    borderRadius: "10px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Days Tracked
                  </div>

                  <div
                    style={{
                      color: COLORS.primary,
                      fontSize: "28px",
                      fontWeight: "700",
                      marginTop: "5px",
                    }}
                  >
                    {routineDays}
                  </div>
                </div>

                <div
                  style={{
                    background: COLORS.light,
                    borderRadius: "10px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Complete Days
                  </div>

                  <div
                    style={{
                      color: COLORS.primary,
                      fontSize: "28px",
                      fontWeight: "700",
                      marginTop: "5px",
                    }}
                  >
                    {completeDays}
                  </div>
                </div>
              </div>

              <ProgressBar
                value={routineAdherence}
              />

              <p
                style={{
                  marginBottom: 0,
                  color: COLORS.muted,
                  fontSize: "14px",
                }}
              >
                Complete both morning and evening
                routines to count a day as complete.
              </p>
            </div>
          </>
        )}

        {/* SKIN HEALTH & PROGRESS TAB */}
        {activeTab === "progress" && (
          <>
            {/* RECORD PROGRESS */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Record Skin Progress
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Skin Health Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) =>
                      setScore(e.target.value)
                    }
                    placeholder="Enter score (0-100)"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Main Concern
                  </label>

                  <input
                    type="text"
                    value={concern}
                    onChange={(e) =>
                      setConcern(e.target.value)
                    }
                    placeholder="e.g. Acne, Dryness"
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                onClick={saveProgress}
                disabled={loadingProgress}
                style={{
                  ...primaryButton,
                  marginTop: "18px",
                  opacity:
                    loadingProgress ? 0.7 : 1,
                }}
              >
                {loadingProgress
                  ? "Saving..."
                  : "Save Skin Progress"}
              </button>
            </div>

            {/* SKIN HEALTH SUMMARY */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Skin Health Summary
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    background: COLORS.light,
                    padding: "18px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Current Score
                  </div>

                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: "700",
                      color: COLORS.primary,
                      marginTop: "5px",
                    }}
                  >
                    {currentScore}
                  </div>
                </div>

                <div
                  style={{
                    background: COLORS.light,
                    padding: "18px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Status
                  </div>

                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      color: COLORS.primary,
                      marginTop: "5px",
                    }}
                  >
                    {getStatus(currentScore)}
                  </div>
                </div>

                <div
                  style={{
                    background: COLORS.light,
                    padding: "18px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Trend
                  </div>

                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      color: COLORS.primary,
                      marginTop: "5px",
                    }}
                  >
                    {getTrend()}
                  </div>
                </div>

                <div
                  style={{
                    background: COLORS.light,
                    padding: "18px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: "14px",
                    }}
                  >
                    Change
                  </div>

                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      color:
                        scoreDifference > 0
                          ? COLORS.secondary
                          : scoreDifference < 0
                          ? COLORS.danger
                          : COLORS.primary,
                      marginTop: "5px",
                    }}
                  >
                    {previousRecord
                      ? `${
                          scoreDifference > 0
                            ? "+"
                            : ""
                        }${scoreDifference}`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* PROGRESS GRAPH */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Progress Graph
              </h2>

              {sortedProgress.length === 0 ? (
                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  No progress records yet. Add your
                  first skin health score above.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "12px",
                    height: "220px",
                    padding:
                      "20px 10px 5px",
                    borderBottom:
                      `1px solid ${COLORS.border}`,
                    overflowX: "auto",
                  }}
                >
                  {sortedProgress.map(
                    (item, index) => {
                      const value = Math.max(
                        0,
                        Math.min(
                          100,
                          Number(
                            item.score || 0
                          )
                        )
                      );

                      return (
                        <div
                          key={`${item.date}-${index}`}
                          style={{
                            minWidth: "55px",
                            height: "100%",
                            display: "flex",
                            flexDirection:
                              "column",
                            justifyContent:
                              "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color:
                                COLORS.primary,
                              marginBottom:
                                "5px",
                            }}
                          >
                            {value}
                          </div>

                          <div
                            style={{
                              width: "30px",
                              height:
                                `${Math.max(
                                  8,
                                  value * 1.6
                                )}px`,
                              background:
                                COLORS.secondary,
                              borderRadius:
                                "6px 6px 0 0",
                            }}
                          />

                          <div
                            style={{
                              fontSize: "10px",
                              color:
                                COLORS.muted,
                              marginTop: "6px",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatDate(
                              item.date
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
            {/* MONTH-WISE ANALYSIS */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Month-wise Analysis
              </h2>

              {monthAverage.length === 0 ? (
                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  Month-wise analysis will appear
                  after you record skin progress.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {monthAverage.map((item) => (
                    <div
                      key={item.month}
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "10px",
                        padding: "15px",
                        background: COLORS.lighter,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          marginBottom: "9px",
                        }}
                      >
                        <strong
                          style={{
                            color:
                              COLORS.text,
                          }}
                        >
                          {item.month}
                        </strong>

                        <strong
                          style={{
                            color:
                              COLORS.primary,
                          }}
                        >
                          {item.average}/100
                        </strong>
                      </div>

                      <ProgressBar
                        value={item.average}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BEFORE / CURRENT COMPARISON */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Before / Current Comparison
              </h2>

              {sortedProgress.length === 0 ? (
                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  Add progress records to see your
                  before and current comparison.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "10px",
                      background: COLORS.lighter,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      style={{
                        color: COLORS.muted,
                        fontSize: "14px",
                      }}
                    >
                      Before
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: COLORS.text,
                        marginTop: "5px",
                      }}
                    >
                      {Number(
                        sortedProgress[0].score || 0
                      )}
                    </div>

                    <div
                      style={{
                        color: COLORS.muted,
                        fontSize: "13px",
                        marginTop: "5px",
                      }}
                    >
                      {formatDate(
                        sortedProgress[0].date
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "10px",
                      background: COLORS.light,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      style={{
                        color: COLORS.muted,
                        fontSize: "14px",
                      }}
                    >
                      Current
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: COLORS.primary,
                        marginTop: "5px",
                      }}
                    >
                      {currentScore}
                    </div>

                    <div
                      style={{
                        color: COLORS.muted,
                        fontSize: "13px",
                        marginTop: "5px",
                      }}
                    >
                      {formatDate(
                        latestRecord?.date
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "10px",
                      background: COLORS.lighter,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      style={{
                        color: COLORS.muted,
                        fontSize: "14px",
                      }}
                    >
                      Overall Change
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color:
                          currentScore -
                            Number(
                              sortedProgress[0]
                                .score || 0
                            ) >=
                          0
                            ? COLORS.secondary
                            : COLORS.danger,
                        marginTop: "5px",
                      }}
                    >
                      {currentScore -
                        Number(
                          sortedProgress[0]
                            .score || 0
                        ) >=
                      0
                        ? "+"
                        : ""}
                      {currentScore -
                        Number(
                          sortedProgress[0]
                            .score || 0
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PROGRESS HISTORY */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                Progress History
              </h2>

              {sortedProgress.length === 0 ? (
                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  No progress history available.
                </p>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      minWidth: "600px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            borderBottom:
                              `1px solid ${COLORS.border}`,
                            color:
                              COLORS.primary,
                          }}
                        >
                          Date
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            borderBottom:
                              `1px solid ${COLORS.border}`,
                            color:
                              COLORS.primary,
                          }}
                        >
                          Score
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            borderBottom:
                              `1px solid ${COLORS.border}`,
                            color:
                              COLORS.primary,
                          }}
                        >
                          Concern
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: "12px",
                            borderBottom:
                              `1px solid ${COLORS.border}`,
                            color:
                              COLORS.primary,
                          }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...sortedProgress]
                        .reverse()
                        .map(
                          (item, index) => {
                            const itemScore =
                              Number(
                                item.score || 0
                              );

                            return (
                              <tr
                                key={`${item.date}-${index}`}
                              >
                                <td
                                  style={{
                                    padding:
                                      "12px",
                                    borderBottom:
                                      `1px solid ${COLORS.border}`,
                                  }}
                                >
                                  {formatDate(
                                    item.date
                                  )}
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "12px",
                                    borderBottom:
                                      `1px solid ${COLORS.border}`,
                                    fontWeight:
                                      "700",
                                    color:
                                      COLORS.primary,
                                  }}
                                >
                                  {itemScore}
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "12px",
                                    borderBottom:
                                      `1px solid ${COLORS.border}`,
                                  }}
                                >
                                  {item.concern ||
                                    "—"}
                                </td>

                                <td
                                  style={{
                                    padding:
                                      "12px",
                                    borderBottom:
                                      `1px solid ${COLORS.border}`,
                                  }}
                                >
                                  {getStatus(
                                    itemScore
                                  )}
                                </td>
                              </tr>
                            );
                          }
                        )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* AI PROGRESS ANALYSIS */}
            <div style={cardStyle}>
              <h2 style={titleStyle}>
                AI Progress Analysis
              </h2>

              {sortedProgress.length === 0 ? (
                <p
                  style={{
                    color: COLORS.muted,
                    margin: 0,
                  }}
                >
                  Record your skin progress to
                  generate a progress analysis.
                </p>
              ) : (
                <div
                  style={{
                    background: COLORS.light,
                    borderRadius: "10px",
                    padding: "18px",
                  }}
                >
                  <p
                    style={{
                      marginTop: 0,
                      lineHeight: "1.6",
                    }}
                  >
                    Your current skin health score
                    is{" "}
                    <strong>
                      {currentScore}/100
                    </strong>
                    .
                  </p>

                  <p
                    style={{
                      lineHeight: "1.6",
                    }}
                  >
                    Current status:{" "}
                    <strong>
                      {getStatus(
                        currentScore
                      )}
                    </strong>
                    .
                  </p>

                  <p
                    style={{
                      lineHeight: "1.6",
                    }}
                  >
                    Progress trend:{" "}
                    <strong>
                      {getTrend()}
                    </strong>
                    .
                  </p>

                  {previousRecord && (
                    <p
                      style={{
                        lineHeight: "1.6",
                        marginBottom: 0,
                      }}
                    >
                      Compared with your previous
                      record, your score has{" "}
                      <strong>
                        {scoreDifference > 0
                          ? `increased by ${scoreDifference} points`
                          : scoreDifference < 0
                          ? `decreased by ${Math.abs(
                              scoreDifference
                            )} points`
                          : "remained stable"}
                      </strong>
                      .
                    </p>
                  )}

                  {!previousRecord && (
                    <p
                      style={{
                        lineHeight: "1.6",
                        marginBottom: 0,
                      }}
                    >
                      Keep recording your skin
                      progress regularly to identify
                      changes over time.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            color: COLORS.muted,
            fontSize: "13px",
            padding: "10px 0 25px",
          }}
        >
          SkinAI • AI-Powered Skincare
          Intelligence
        </div>
      </div>
    </div>
  );
}

export default ProgressTracking;