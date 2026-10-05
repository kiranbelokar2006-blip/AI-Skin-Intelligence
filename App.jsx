import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./App.css";

function App() {
const [page, setPage] = useState("home");

if (page === "login") {
return (
<Login
onRegister={() => setPage("register")}
/>
);
}

if (page === "register") {
return (
<Register
onLogin={() => setPage("login")}
/>
);
}

const handleGetStarted = () => {
const features = document.getElementById("features");

if (features) {  
  features.scrollIntoView({  
    behavior: "smooth",  
  });  
}

};

return (
<div className="app">
<nav className="navbar">
<div className="logo">
✦ SkinAI
</div>

<div className="nav-links">  
      <a href="#home">Home</a>  
      <a href="#features">Features</a>  
      <a href="#about">About</a>  

      <button  
        className="login-btn"  
        onClick={() => setPage("login")}  
      >  
        Login  
      </button>  
    </div>  
  </nav>  

  <section id="home" className="hero">  
    <div className="hero-content">  
      <p className="tagline">  
        AI-POWERED SKINCARE  
      </p>  

      <h1>  
        Your Skin.  
        <br />  
        <span>Your Intelligence.</span>  
      </h1>  

      <p className="description">  
        Discover personalized skincare powered by AI. Build your skin  
        profile, track your lifestyle and get recommendations designed  
        specifically for you.  
      </p>  

      <div className="hero-buttons">  
        <button  
          className="primary-btn"  
          onClick={handleGetStarted}  
        >  
          Get Started  
        </button>  

        <a  
          href="#about"  
          className="secondary-btn"  
        >  
          Learn More  
        </a>  
      </div>  
    </div>  

    <div className="skin-card">  
      <div className="card-icon">  
        ✦  
      </div>  

      <h2>  
        Personalized Skincare  
      </h2>  

      <p>  
        Understand your skin and create a smarter skincare routine.  
      </p>  

      <div className="card-items">  
        <div>  
          <strong>01</strong>  
          <span>Skin Profile</span>  
        </div>  

        <div>  
          <strong>02</strong>  
          <span>Lifestyle Tracking</span>  
        </div>  

        <div>  
          <strong>03</strong>  
          <span>Smart Recommendations</span>  
        </div>  
      </div>  
    </div>  
  </section>  

  <section  
    id="features"  
    className="features"  
  >  
    <h2>  
      Everything Your Skin Needs  
    </h2>  

    <div className="feature-grid">  
      <div className="feature-card">  
        <div className="feature-number">  
          01  
        </div>  

        <h3>  
          Skin Profile  
        </h3>  

        <p>  
          Record your skin type, concerns, sensitivities and other  
          important information.  
        </p>  
      </div>  

      <div className="feature-card">  
        <div className="feature-number">  
          02  
        </div>  

        <h3>  
          Lifestyle Tracking  
        </h3>  

        <p>  
          Track hydration, sleep and lifestyle factors that may affect  
          your skin.  
        </p>  
      </div>  

      <div className="feature-card">  
        <div className="feature-number">  
          03  
        </div>  

        <h3>  
          Personalized Insights  
        </h3>  

        <p>  
          Get intelligent skincare insights based on your personal  
          profile and lifestyle.  
        </p>  
      </div>  
    </div>  
  </section>  

  <section  
    id="about"  
    className="about"  
  >  
    <p className="tagline">  
      ABOUT THE PROJECT  
    </p>  

    <h2>  
      AI Skin Intelligence & Personalized Skincare Planner  
    </h2>  

    <p>  
      Our platform aims to provide personalized skincare guidance by  
      combining skin profile information with lifestyle and wellness  
      factors.  
    </p>  
  </section>  

  <footer className="footer">  
    <p>  
      © 2026 SkinAI | AI Skin Intelligence  
    </p>  
  </footer>  
</div>

);
}

export default App;