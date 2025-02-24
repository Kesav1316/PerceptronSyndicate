import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ChemistryAlchemy from "./ChemistryAlchemy";
import CompIdentifier from "./CompIdentifier";
import ArduinoSimulator from "./ArduinoSimulator";
import ImgGetter from "./imggetter";
import "./App.css";

import logo from "./assests/logo.png";  // ✅ Add your logo
import bgImage from "./assests/bg.jpeg"; // ✅ Background image

function Home() {
  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay"></div>
      
      {/* Logo and Title */}
      <div className="hero">
        <img src={logo} alt="ENVIR.AI Logo" className="logo" />
        <h1 className="title">Welcome to <span className="highlight">ENVIR.AI</span> 🔬</h1>
        <p className="subtitle">Your AI-powered lab for chemistry, electronics, and simulations.</p>
      </div>

      {/* Feature Buttons */}
      <div className="feature-buttons">
        <Link to="/alchemy" className="feature-link">
          <span>🧪 Chemistry Alchemy</span>
        </Link>
        <Link to="/comp-identifier" className="feature-link">
          <span>🔍 CompIdentifier</span>
        </Link>
        <Link to="/arduino-simulator" className="feature-link">
          <span>⚡ Arduino Simulator</span>
        </Link>
        <Link to="/imggetter" className="feature-link">
          <span>📷 Image Getter</span>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alchemy" element={<ChemistryAlchemy />} />
        <Route path="/comp-identifier" element={<CompIdentifier />} />
        <Route path="/arduino-simulator" element={<ArduinoSimulator />} />
        <Route path="/imggetter" element={<ImgGetter />} />
      </Routes>
    </Router>
  );
}

export default App;
