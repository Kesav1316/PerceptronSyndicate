import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ChemistryAlchemy from "./ChemistryAlchemy";
import CompIdentifier from "./CompIdentifier";
import ArduinoSimulator from "./ArduinoSimulator";
import ImgGetter from "./imggetter";
import ProjectIdeas from "./ProjectIdeas";
import PhysiCardBattle from "./PhysiCardBattle";
import "./App.css";

import logo from "./assets/logo.png";
import bgImage from "./assets/bg.jpeg";

function MainHome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    axios.get(`http://localhost:5000/user/${parsedUser.username}`)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("❌ Session expired, please log in again.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  if (loading) {
    return <h2 className="loading-text">🔄 Loading...</h2>;
  }

  // ✅ Calculate XP Progress for Leveling System
  const xpRequired = (user.level - 1) * 50 + 50; // XP required for next level
  const xpPercentage = (user.xp / xpRequired) * 100;

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay"></div>

      {/* ✅ Logout Button in the Top-Left */}
      <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>

      {/* ✅ XP Progress Bar in the Top-Right */}
      <div className="xp-container">
        <div className="xp-bar" style={{ width: `${xpPercentage}%` }}></div>
        <span className="xp-text">{user.xp} / {xpRequired} XP</span>
      </div>

      {/* Header */}
      <div className="hero">
        <img src={logo} alt="ENVISION.AI Logo" className="logo" />
        <h1 className="title">🌍 Welcome to ENVISION.AI</h1>
        <p className="subtitle">Your AI-powered lab for physics, chemistry, and technology simulations.</p>
      </div>

      {/* User Info (Level) */}
      <div className="user-info">
        <h3>👤 {user.username}</h3>
        <p>Level: {user.level}</p>
      </div>

      {/* Feature Grid */}
      <div className="feature-grid">
        <Link to="alchemy" className="feature-box">🧪 Chemistry Alchemy</Link>
        <Link to="comp-identifier" className="feature-box">🔍 CompIdentifier</Link>
        <Link to="arduino-simulator" className="feature-box">⚡ Arduino Simulator</Link>
        <Link to="imggetter" className="feature-box">📷 Image Getter</Link>
        <Link to="physi-card-battle" className="feature-box">🎮 Physi-Card Battle</Link>
        <Link to="project-ideas" className="feature-box">💡 Project Ideas</Link>
      </div>

      {/* Back to Home Button
      <div className="auth-links">
        <Link to="/" className="back-home-btn">🏠 Back to Main Home</Link>
      </div> */}
    </div>
  );
}

export default function MainApp() {
  return (
    <Routes>
      <Route path="/" element={<MainHome />} />
      <Route path="alchemy" element={<ChemistryAlchemy />} />
      <Route path="comp-identifier" element={<CompIdentifier />} />
      <Route path="arduino-simulator" element={<ArduinoSimulator />} />
      <Route path="imggetter" element={<ImgGetter />} />
      <Route path="physi-card-battle" element={<PhysiCardBattle />} />
      <Route path="project-ideas" element={<ProjectIdeas />} />
    </Routes>
  );
}
