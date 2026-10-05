import React, { useState } from "react";

function SkinProfile({ onBack = () => {} }) {
  const [age, setAge] = useState("");
  const [skinType, setSkinType] = useState("");
  const [concern, setConcern] = useState("");
  const [sensitivity, setSensitivity] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    if (!age || !skinType || !concern || !sensitivity) {
      alert("Please fill all fields.");
      return;
    }

    const savedUser = localStorage.getItem("skinai_user");

    if (!savedUser) {
      alert("Please login first.");
      return;
    }

    const user = JSON.parse(savedUser);

    const profile = {
      age: Number(age),
      skinType: skinType,
      concern: concern,
      sensitivity: sensitivity,
    };

    // Save profile for Skin Assessment
    localStorage.setItem(
      "skinai_profile",
      JSON.stringify(profile)
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/skin-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            age: Number(age),
            skin_type: skinType,
            concern: concern,
            sensitivity: sensitivity,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Skin profile saved successfully!");
      } else {
        alert(
          data.message || "Skin profile saved locally."
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Skin profile saved locally. Backend connection is unavailable."
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
          SKIN PROFILE
        </p>

        <h1>
          Skin Profile
        </h1>

        <p>
          Enter your skin information to generate personalized
          skin health insights.
        </p>

        <form onSubmit={handleSave}>

          <label>
            Age
          </label>

          <input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="1"
            max="100"
            required
          />

          <label>
            Skin Type
          </label>

          <select
            value={skinType}
            onChange={(e) => setSkinType(e.target.value)}
            required
          >
            <option value="">
              Select skin type
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
          </select>

          <label>
            Main Skin Concern
          </label>

          <select
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            required
          >
            <option value="">
              Select main concern
            </option>

            <option value="Acne">
              Acne
            </option>

            <option value="Pigmentation">
              Pigmentation
            </option>

            <option value="Dark Spots">
              Dark Spots
            </option>

            <option value="Dryness">
              Dryness
            </option>

            <option value="Dullness">
              Dullness
            </option>

            <option value="Wrinkles">
              Wrinkles
            </option>

            <option value="None">
              None
            </option>
          </select>

          <label>
            Skin Sensitivity
          </label>

          <select
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value)}
            required
          >
            <option value="">
              Select sensitivity
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

          <button type="submit">
            Save Skin Profile
          </button>

        </form>

      </div>
    </div>
  );
}

export default SkinProfile;