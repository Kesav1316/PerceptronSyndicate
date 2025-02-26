import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import MainApp from "./MainApp"; // ✅ Import without Router
import "./App.css";
import logo from "./assets/logo.png";
import bgImage from "./assets/bg.jpeg";

function HomePage() {
  return (
    <div className="home-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay"></div>

      <div className="hero">
        <img src={logo} alt="ENVISION.AI Logo" className="logo" />
        <h1 className="title">🌍 Welcome to ENVISION.AI</h1>
        <p className="subtitle">An AI-powered lab for physics, chemistry, and technology simulations.</p>
      </div>

      <div className="auth-buttons">
        <Link to="/register" className="auth-btn">📝 Register</Link>
        <Link to="/login" className="auth-btn">🔑 Login</Link>
        <Link to="/main-app" className="auth-btn access-app">🚀 Access ENVISION.AI</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>  {/* ✅ Only one Router here */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main-app/*" element={<MainApp />} />  {/* ✅ Works correctly */}
      </Routes>
    </Router>
  );
}
