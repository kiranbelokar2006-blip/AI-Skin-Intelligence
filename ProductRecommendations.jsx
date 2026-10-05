import { useState } from "react";

const API = "http://127.0.0.1:8000";

function ProductRecommendations({ onBack }) {
  const [skinType, setSkinType] = useState("");
  const [concern, setConcern] = useState("");
  const [budget, setBudget] = useState("");

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [alternatives, setAlternatives] = useState({});
  const [message, setMessage] = useState("");

  const user = JSON.parse(
    localStorage.getItem("skinai_user") || "{}"
  );

  const getRecommendations = async () => {
    if (!skinType || !concern) {
      setMessage("Please select skin type and concern.");
      return;
    }

    if (!user.email) {
      setMessage("User email not found. Please login again.");
      return;
    }

    setMessage("");
    setProducts([]);
    setSelectedProducts([]);
    setComparison(null);
    setAlternatives({});

    try {
      const response = await fetch(
        `${API}/product-recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            skin_type: skinType,
            concern: concern,
            budget: budget ? Number(budget) : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Unable to get recommendations.";

        if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((item) => item.msg || "Invalid request")
            .join(", ");
        } else if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        }

        setMessage(errorMessage);
        return;
      }

      if (data.success === false) {
        setMessage(
          data.message || "Unable to get recommendations."
        );
        return;
      }

      const result =
        data.recommendations ||
        data.products ||
        [];

      if (!Array.isArray(result)) {
        setMessage(
          "Invalid product data received from backend."
        );
        return;
      }

      if (result.length === 0) {
        setMessage(
          "No suitable products found for the selected profile and budget."
        );
        return;
      }

      setProducts(result);
    } catch (error) {
      console.error(error);

      setMessage(
        "Backend connection failed. Please make sure the backend is running."
      );
    }
  };

  const toggleProduct = (product) => {
    setSelectedProducts((previous) => {
      const exists = previous.some(
        (item) => item.id === product.id
      );

      if (exists) {
        setMessage("");

        return previous.filter(
          (item) => item.id !== product.id
        );
      }

      if (previous.length >= 2) {
        setMessage(
          "You can compare only two products."
        );
        return previous;
      }

      setMessage("");

      return [...previous, product];
    });
  };

  const compareProducts = async () => {
    if (selectedProducts.length !== 2) {
      setMessage(
        "Please select exactly two products before comparison."
      );
      return;
    }

    const productIds = selectedProducts
      .map((product) => Number(product.id))
      .filter((id) => !Number.isNaN(id));

    if (productIds.length !== 2) {
      setMessage(
        "Selected products have invalid product IDs."
      );
      return;
    }

    try {
      setMessage("");
      setComparison(null);

      const response = await fetch(
        `${API}/product-compare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_ids: productIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Unable to compare products.";

        if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((item) => item.msg || "Invalid request")
            .join(", ");
        } else if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        }

        setMessage(errorMessage);
        return;
      }

      if (data.success === false) {
        setMessage(
          data.message || "Unable to compare products."
        );
        return;
      }

      if (
        !data.products ||
        !Array.isArray(data.products)
      ) {
        setMessage(
          "No comparison data received from backend."
        );
        return;
      }

      setComparison(data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to compare products. Please make sure the backend is running."
      );
    }
  };

  const getAlternatives = async (productId) => {
    try {
      setMessage("");

      const response = await fetch(
        `${API}/product-alternatives/${productId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to load alternatives."
        );
        return;
      }

      setAlternatives((previous) => ({
        ...previous,
        [productId]: data.alternatives || [],
      }));
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to load alternatives."
      );
    }
  };

  return (
    <div className="dashboard-page">

      <nav className="dashboard-navbar">

        <div className="logo">
          ✦ SkinAI
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={onBack}
        >
          ← Back
        </button>

      </nav>

      <main className="dashboard-content">

        <p className="tagline">
          MILESTONE 3
        </p>

        <h1>
          Product Recommendation Engine
        </h1>

        <p className="dashboard-description">
          Get personalized skincare products based on
          your skin type, concern and budget.
        </p>

        <div className="recommendation-box">

          <h2>
            🛍️ Personalized Product Recommendation
          </h2>

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
            value={concern}
            onChange={(e) =>
              setConcern(e.target.value)
            }
          >
            <option value="">
              Select Skin Concern
            </option>

            <option value="acne">
              Acne
            </option>

            <option value="pigmentation">
              Pigmentation
            </option>

            <option value="dark spots">
              Dark Spots
            </option>

            <option value="dryness">
              Dryness
            </option>

            <option value="oiliness">
              Oiliness
            </option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Maximum Budget (₹)"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value)
            }
          />

          <button
            type="button"
            onClick={getRecommendations}
          >
            Get Recommendations
          </button>

          {message && (
            <p style={{ marginTop: "15px" }}>
              {message}
            </p>
          )}

        </div>

        {products.length > 0 && (

          <div className="recommendation-box">

            <h2>
              Recommended Products
            </h2>

            <p>
              Products are scored according to your
              selected skin profile, concern and budget.
            </p>

            {products.map((product, index) => {

              const score =
                product.suitabilityScore ??
                product.suitability_score ??
                product.score ??
                0;

              const skinTypes =
                product.skinTypes ??
                product.skin_types ??
                [];

              const concerns =
                product.concerns ??
                [];

              const ingredients =
                product.ingredients ??
                [];

              return (
                <div
                  className="dashboard-card"
                  key={product.id || index}
                  style={{
                    marginTop: "15px",
                  }}
                >

                  <span>
                    Product {index + 1}
                  </span>

                  <h2>
                    {product.name}
                  </h2>

                  <p>
                    <strong>Brand:</strong>{" "}
                    {product.brand}
                  </p>

                  <p>
                    <strong>Category:</strong>{" "}
                    {product.category}
                  </p>

                  <p>
                    <strong>Price:</strong>{" "}
                    ₹{product.price}
                  </p>

                  <p>
                    <strong>
                      Suitability Score:
                    </strong>{" "}
                    {score}%
                  </p>

                  {product.description && (
                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {product.description}
                    </p>
                  )}

                  {skinTypes.length > 0 && (
                    <p>
                      <strong>
                        Suitable Skin Types:
                      </strong>{" "}
                      {Array.isArray(skinTypes)
                        ? skinTypes.join(", ")
                        : skinTypes}
                    </p>
                  )}

                  {concerns.length > 0 && (
                    <p>
                      <strong>
                        Target Concerns:
                      </strong>{" "}
                      {Array.isArray(concerns)
                        ? concerns.join(", ")
                        : concerns}
                    </p>
                  )}

                  {ingredients.length > 0 && (
                    <p>
                      <strong>
                        Key Ingredients:
                      </strong>{" "}
                      {Array.isArray(ingredients)
                        ? ingredients.join(", ")
                        : ingredients}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      toggleProduct(product)
                    }
                  >
                    {selectedProducts.some(
                      (item) =>
                        item.id === product.id
                    )
                      ? "✓ Selected for Comparison"
                      : "Compare Product"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      getAlternatives(product.id)
                    }
                    style={{
                      marginLeft: "10px",
                    }}
                  >
                    Find Alternatives
                  </button>

                  {alternatives[product.id] &&
                    alternatives[product.id].length > 0 && (

                      <div
                        style={{
                          marginTop: "15px",
                        }}
                      >

                        <h3>
                          💰 Alternative Products
                        </h3>

                        {alternatives[
                          product.id
                        ].map(
                          (alternative, altIndex) => (

                            <div
                              key={
                                alternative.id ||
                                altIndex
                              }
                              className="dashboard-card"
                              style={{
                                marginTop: "10px",
                              }}
                            >

                              <strong>
                                {alternative.name}
                              </strong>

                              <p>
                                Price: ₹
                                {alternative.price}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleProduct(
                                    alternative
                                  )
                                }
                              >
                                {selectedProducts.some(
                                  (item) =>
                                    item.id ===
                                    alternative.id
                                )
                                  ? "✓ Selected for Comparison"
                                  : "Compare Alternative"}
                              </button>

                            </div>

                          )
                        )}

                      </div>
                    )}

                </div>
              );
            })}

            <button
              type="button"
              onClick={compareProducts}
              style={{
                marginTop: "20px",
              }}
            >
              Compare Selected Products
            </button>

            <p>
              Selected:{" "}
              {selectedProducts.length}/2
            </p>

          </div>
        )}

        {comparison && (

          <div className="recommendation-box">

            <h2>
              ⚖️ Product Comparison
            </h2>

            <p>
              Comparison of your two selected products.
            </p>

            {comparison.products &&
              comparison.products.map(
                (product, index) => (

                  <div
                    className="dashboard-card"
                    key={product.id || index}
                    style={{
                      marginTop: "15px",
                    }}
                  >

                    <h2>
                      {product.name}
                    </h2>

                    <p>
                      <strong>
                        Brand:
                      </strong>{" "}
                      {product.brand ||
                        "SkinAI Essentials"}
                    </p>

                    <p>
                      <strong>
                        Category:
                      </strong>{" "}
                      {product.category ||
                        "Skincare"}
                    </p>

                    <p>
                      <strong>
                        Price:
                      </strong>{" "}
                      ₹{product.price}
                    </p>

                    <p>
                      <strong>
                        Suitability Score:
                      </strong>{" "}
                      {product.suitabilityScore ??
                        product.suitability_score ??
                        product.score ??
                        "N/A"}
                      %
                    </p>

                    {product.ingredients &&
                      product.ingredients.length > 0 && (
                        <p>
                          <strong>
                            Key Ingredients:
                          </strong>{" "}
                          {Array.isArray(
                            product.ingredients
                          )
                            ? product.ingredients.join(
                                ", "
                              )
                            : product.ingredients}
                        </p>
                      )}

                  </div>
                )
              )}

            {comparison.message && (
              <p>
                {comparison.message}
              </p>
            )}

          </div>
        )}

      </main>

      <footer className="footer">

        <p>
          © 2026 SkinAI | AI Skin Intelligence
        </p>

      </footer>

    </div>
  );
}

export default ProductRecommendations;