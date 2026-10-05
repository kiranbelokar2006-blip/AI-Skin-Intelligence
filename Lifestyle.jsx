import { useState } from "react";

function Lifestyle({ onBack }) {
  const [water, setWater] = useState("");
  const [sleep, setSleep] = useState("");
  const [exercise, setExercise] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    if (!water || !sleep || !exercise) {
      alert("Please fill all fields.");
      return;
    }

    const savedUser = localStorage.getItem("skinai_user");

    if (!savedUser) {
      alert("Please login first.");
      return;
    }

    const user = JSON.parse(savedUser);

    const lifestyleData = {
      water: Number(water),
      sleep: Number(sleep),
      exercise: exercise,
    };

    // Save locally for Skin Assessment
    localStorage.setItem(
      "skinai_lifestyle",
      JSON.stringify(lifestyleData)
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/lifestyle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            water: Number(water),
            sleep: Number(sleep),
            exercise: exercise,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Lifestyle Data Saved Successfully!");
      } else {
        alert(data.message || "Lifestyle data saved locally.");
      }
    } catch (error) {
      console.error(error);

      alert(
        "Lifestyle data saved locally. Backend connection is unavailable."
      );
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        <button
          type="button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <p className="tagline">
          LIFESTYLE TRACKING
        </p>

        <h1>
          Track Your Lifestyle
        </h1>

        <p>
          Track your daily habits to understand how they may affect
          your skin.
        </p>

        <form onSubmit={handleSave}>

          <label>
            Daily Water Intake (Glasses)
          </label>

          <input
            type="number"
            placeholder="Example: 8"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            min="1"
            max="30"
            required
          />

          <label>
            Daily Sleep (Hours)
          </label>

          <input
            type="number"
            placeholder="Example: 7"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            min="1"
            max="24"
            required
          />

          <label>
            Exercise
          </label>

          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            required
          >
            <option value="">
              Select exercise level
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Moderate">
              Moderate
            </option>

            <option value="High">
              High
            </option>
          </select>

          <button type="submit">
            Save Lifestyle Data
          </button>

        </form>

      </div>
    </div>
  );
}

export default Lifestyle;