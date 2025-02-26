import React, { useState } from "react";
import fetchProjectIdeas from "./fetchprojectideas";
import { Link } from "react-router-dom";
import "./App.css";

function ProjectIdeas() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateIdeas = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic!");
      return;
    }

    setLoading(true);
    try {
      const newIdeas = await fetchProjectIdeas(topic);
      const filteredIdeas = newIdeas
        .map(idea => idea.replace(/\*/g, "").trim())
        .filter(idea => /[a-zA-Z]/.test(idea));

      setIdeas(filteredIdeas);
    } catch (error) {
      console.error("Error fetching project ideas:", error);
      setIdeas(["Error fetching project ideas. Try again later."]);
    }
    setLoading(false);
  };

  const toggleDescription = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // ✅ Function to get difficulty color
  const getDifficultyColor = (title) => {
    if (/beginner/i.test(title)) return { color: "#4CAF50" }; // Green
    if (/intermediate/i.test(title)) return { color: "#FFC107" }; // Yellow
    if (/advanced/i.test(title)) return { color: "#F44336" }; // Red
    if (/expert/i.test(title)) return { color: "#2196F3" }; // Blue ✅ Added Expert Level
    return { color: "#607D8B" }; // Default Gray
  };

  return (
    <div className="ideas-page">
      <h1>💡 AI-Powered Project Ideas</h1>
      <p>Enter a topic to generate project ideas:</p>

      <div className="input-container">
        <input 
          type="text" 
          className="styled-input"
          placeholder="Enter topic..." 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)}
        />
        <button className="generate-ideas-btn" onClick={handleGenerateIdeas} disabled={loading}>
          {loading ? "Generating..." : "Get Ideas"}
        </button>
      </div>

      {ideas.length > 0 && (
        <div className="ideas-container">
          <h2>📌 Project Ideas</h2>
          <div className="ideas-list">
            {ideas.map((idea, index) => {
              const [title, ...descriptionParts] = idea.split(":");
              const description = descriptionParts.join(":").trim();
              const { color } = getDifficultyColor(title);

              return (
                <div 
                  key={index} 
                  className="idea-card" 
                  onClick={() => toggleDescription(index)} 
                  style={{ borderLeft: `5px solid ${color}` }} // ✅ Color-coded border
                >
                  <h3 style={{ color }}>{title.trim()}</h3>
                  <p className={`idea-description ${expandedIndex === index ? "show" : ""}`}>
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Link to="/" className="back-btn">⬅ Back to Home</Link>
    </div>
  );
}

export default ProjectIdeas;
