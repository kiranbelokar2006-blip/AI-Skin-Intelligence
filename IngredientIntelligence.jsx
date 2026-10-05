import { useState } from "react";

const API = "http://127.0.0.1:8000";

function IngredientIntelligence({ onBack }) {
  const [ingredient, setIngredient] = useState("");
  const [skinType, setSkinType] = useState("");
  const [sensitivity, setSensitivity] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]);
  const [interaction, setInteraction] = useState(null);
  const [message, setMessage] = useState("");

  // Load ingredients
  const loadIngredients = async () => {
    try {
      setMessage("");

      const response = await fetch(
        `${API}/ingredients`
      );

      if (!response.ok) {
        throw new Error("Failed to load ingredients");
      }

      const data = await response.json();

      if (
        data &&
        data.success &&
        Array.isArray(data.ingredients)
      ) {
        setIngredients(data.ingredients);
      } else if (Array.isArray(data.ingredients)) {
        setIngredients(data.ingredients);
      } else if (Array.isArray(data)) {
        setIngredients(data);
      } else {
        setMessage("Unable to load ingredients.");
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to load ingredients."
      );
    }
  };

  // Analyze single ingredient
  const analyzeIngredient = async () => {
    if (!ingredient.trim()) {
      setMessage(
        "Please enter an ingredient."
      );
      return;
    }

    try {
      setMessage("");
      setAnalysis(null);

      const response = await fetch(
        `${API}/ingredient-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ingredient: ingredient.trim(),
            skin_type: skinType,
            sensitivity: sensitivity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Ingredient analysis response:",
        data
      );

      if (!data) {
        setMessage(
          "No analysis result received."
        );
        return;
      }

      if (data.success === false) {
        setMessage(
          data.message ||
            "Ingredient not found."
        );
        return;
      }

      // Support different possible backend formats
      const result =
        data.analysis ||
        data.result ||
        data.data ||
        data;

      if (
        result &&
        typeof result === "object"
      ) {
        setAnalysis(result);
      } else {
        setMessage(
          "Analysis result format is invalid."
        );
      }
    } catch (error) {
      console.error(
        "Ingredient analysis error:",
        error
      );

      setMessage(
        "Unable to analyze ingredient."
      );
    }
  };

  // Check interaction
  const checkInteraction = async () => {
    if (selected.length < 2) {
      setMessage(
        "Please select at least two ingredients."
      );
      return;
    }

    try {
      setMessage("");
      setInteraction(null);

      const response = await fetch(
        `${API}/ingredient-interaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ingredients: selected,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      setInteraction(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to check ingredient interaction."
      );
    }
  };

  // Select / unselect ingredient
  const toggleIngredient = (name) => {
    setSelected((previous) => {
      if (previous.includes(name)) {
        return previous.filter(
          (item) => item !== name
        );
      }

      return [...previous, name];
    });
  };

  // Safely convert backend values to arrays
  const getArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return [value];
    }

    return [];
  };

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="logo">
          ✦ SkinAI
        </div>

        <button
          className="logout-btn"
          onClick={onBack}
        >
          ← Back
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <p className="tagline">
          MILESTONE 3
        </p>

        <h1>
          Ingredient Intelligence
        </h1>

        <p className="dashboard-description">
          Analyze skincare ingredients, their
          purpose, benefits, skin suitability and
          possible irritation risks.
        </p>

        {/* Ingredient Analysis */}
        <div className="recommendation-box">
          <h2>
            🔬 Ingredient Analysis
          </h2>

          <p>
            Enter an ingredient to understand its
            purpose, benefits, suitability and
            warnings.
          </p>

          <input
            type="text"
            placeholder="Example: Salicylic Acid"
            value={ingredient}
            onChange={(e) =>
              setIngredient(e.target.value)
            }
          />

          <select
            value={skinType}
            onChange={(e) =>
              setSkinType(e.target.value)
            }
          >
            <option value="">
              Select Skin Type
            </option>

            <option value="normal">
              Normal
            </option>

            <option value="dry">
              Dry
            </option>

            <option value="oily">
              Oily
            </option>

            <option value="combination">
              Combination
            </option>

            <option value="sensitive">
              Sensitive
            </option>
          </select>

          <select
            value={sensitivity}
            onChange={(e) =>
              setSensitivity(e.target.value)
            }
          >
            <option value="">
              Select Sensitivity
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>

          <button
            type="button"
            onClick={analyzeIngredient}
          >
            Analyze Ingredient
          </button>

          {message && (
            <p
              style={{
                color: "#d9534f",
                fontWeight: "600",
                marginTop: "12px",
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* Analysis Result */}
        {analysis && (
          <div className="recommendation-box">
            <h2>
              {analysis.name ||
                ingredient}
            </h2>

            <p>
              <strong>Purpose:</strong>{" "}
              {analysis.purpose ||
                "Information not available."}
            </p>

            <p>
              <strong>
                Skin Suitability:
              </strong>{" "}
              {analysis.skinSuitable ===
              true
                ? "Suitable"
                : analysis.skinSuitable ===
                  false
                ? "Not a preferred match"
                : "See suitability details"}
            </p>

            {analysis.suitabilityMessage && (
              <p>
                {analysis.suitabilityMessage}
              </p>
            )}

            <h3>
              Benefits
            </h3>

            {getArray(
              analysis.benefits
            ).length > 0 ? (
              <ul>
                {getArray(
                  analysis.benefits
                ).map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                No benefit information
                available.
              </p>
            )}

            <h3>
              Pros
            </h3>

            {getArray(
              analysis.pros
            ).length > 0 ? (
              <ul>
                {getArray(
                  analysis.pros
                ).map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                No pros information
                available.
              </p>
            )}

            <h3>
              Cons
            </h3>

            {getArray(
              analysis.cons
            ).length > 0 ? (
              <ul>
                {getArray(
                  analysis.cons
                ).map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                No cons information
                available.
              </p>
            )}

            <h3>
              ⚠ Sensitivity Warning
            </h3>

            <p>
              {analysis.sensitivityWarning ||
                "No specific sensitivity warning available."}
            </p>

            <h3>
              ⚠ Allergy Warning
            </h3>

            <p>
              {analysis.allergyWarning ||
                "No specific allergy warning available."}
            </p>
          </div>
        )}

        {/* Ingredient Interaction */}
        <div className="recommendation-box">
          <h2>
            🔄 Ingredient Interaction
            Checker
          </h2>

          <p>
            Select two or more ingredients to
            check possible compatibility or
            irritation warnings.
          </p>

          <button
            type="button"
            onClick={loadIngredients}
          >
            Load Ingredients
          </button>

          {ingredients.length > 0 && (
            <div>
              {ingredients.map(
                (item, index) => {
                  const name =
                    item.name ||
                    item.ingredient ||
                    `Ingredient ${index + 1}`;

                  const id =
                    item.id || name;

                  return (
                    <label
                      key={id}
                      style={{
                        display: "block",
                        marginTop: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(
                          name
                        )}
                        onChange={() =>
                          toggleIngredient(
                            name
                          )
                        }
                      />

                      {" "}
                      {name}
                    </label>
                  );
                }
              )}

              <button
                type="button"
                onClick={checkInteraction}
                style={{
                  marginTop: "15px",
                }}
              >
                Check Interaction
              </button>
            </div>
          )}
        </div>

        {/* Interaction Result */}
        {interaction && (
          <div className="recommendation-box">
            <h2>
              Interaction Result
            </h2>

            <p>
              <strong>
                Ingredients Checked:
              </strong>{" "}
              {Array.isArray(
                interaction.ingredientsChecked
              )
                ? interaction.ingredientsChecked.join(
                    ", "
                  )
                : selected.join(", ")}
            </p>

            <h3>
              {interaction.compatible ===
              true
                ? "✓ No warning detected"
                : "⚠ Potential interaction detected"}
            </h3>

            <p>
              {interaction.message ||
                "No additional interaction details available."}
            </p>

            {Array.isArray(
              interaction.warnings
            ) &&
              interaction.warnings.map(
                (warning, index) => (
                  <div
                    key={index}
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    <strong>
                      {Array.isArray(
                        warning.ingredients
                      )
                        ? warning.ingredients.join(
                            " + "
                          )
                        : "Ingredient interaction"}
                    </strong>

                    <p>
                      {warning.warning ||
                        "Please review ingredient compatibility."}
                    </p>
                  </div>
                )
              )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          © 2026 SkinAI | AI Skin
          Intelligence
        </p>
      </footer>
    </div>
  );
}

export default IngredientIntelligence;