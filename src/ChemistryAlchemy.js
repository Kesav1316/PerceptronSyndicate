import React, { useState } from "react";
import reactionsData from "./reactions.json";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";

const elements = Object.keys(reactionsData.elements);
const reactions = reactionsData.reactions;

// Draggable Element Component
const DraggableElement = ({ element }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "element",
        item: { element },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div ref={drag} className={`draggable-element ${isDragging ? "dragging" : ""}`}>
            {element}
        </div>
    );
};

function ChemistryAlchemy() {
    const [selectedElements, setSelectedElements] = useState([]);
    const [result, setResult] = useState("");
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ attempts: 0, successes: 0 });

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "element",
        drop: (item) => handleSelect(item.element),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const handleSelect = (element) => {
        setSelectedElements((prev) => [...prev, element]);
    };

    const handleCombine = () => {
        if (selectedElements.length === 0) return;
        let key = selectedElements.map(e => reactionsData.elements[e]).sort().join("+");
        const reactionResult = reactions[key] || "❌ No reaction";

        setResult(reactionResult);
        setStats((prev) => ({
            attempts: prev.attempts + 1,
            successes: reactionResult !== "❌ No reaction" ? prev.successes + 1 : prev.successes,
        }));

        if (reactionResult !== "❌ No reaction") {
            setHistory((prev) => [...prev, { elements: selectedElements, result: reactionResult }]);
        }
    };

    const handleClear = () => {
        setSelectedElements([]);
        setResult("");
    };

    const handleBackspace = () => {
        setSelectedElements((prev) => prev.slice(0, -1));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="alchemy-container">
                <h1 className="title">🔬 Chemistry Alchemy Game ⚡</h1>

                {/* Sidebar for History (Hoverable) */}
                <div className="sidebar-container">
                    <div className="sidebar">
                        <h2>📜 Reaction History</h2>
                        {history.length === 0 ? <p>No reactions yet.</p> : (
                            <ul>
                                {history.map((entry, index) => (
                                    <li key={index}>{entry.elements.join(" + ")} → {entry.result}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Element Selection */}
                <div className="elements-container">
                    {elements.map(element => (
                        <DraggableElement key={element} element={element} />
                    ))}
                </div>

                {/* Drop Zone */}
                <div ref={drop} className={`drop-zone ${isOver ? "hover" : ""}`}>
                    <h2 className="drop-title">Drop Elements Here:</h2>
                    <h3 className="selected-elements">{selectedElements.join(" + ")}</h3>
                </div>

                {/* Buttons */}
                <div className="buttons-container">
                    <button className="action-button combine" onClick={handleCombine}>⚗️ Combine</button>
                    <button className="action-button clear" onClick={handleClear}>🗑️ Clear</button>
                    <button className="action-button backspace" onClick={handleBackspace}>🔙 Backspace</button>
                </div>

                {/* Stats Dashboard */}
                <div className="stats-dashboard">
                    <h2>📊 Stats Dashboard</h2>
                    <div className="stat-card attempts">
                        <span>Total Attempts</span>
                        <span>{stats.attempts}</span>
                    </div>
                    <div className="stat-card successes">
                        <span>Successful Reactions</span>
                        <span>{stats.successes}</span>
                    </div>
                    <div className="stat-card progress">
                        <span>Success Rate</span>
                        <span>{stats.attempts > 0 ? ((stats.successes / stats.attempts) * 100).toFixed(1) + "%" : "0%"}</span>
                    </div>
                    <div className="progress-bar" style={{ width: stats.attempts > 0 ? `${(stats.successes / stats.attempts) * 100}%` : "0%" }}></div>
                </div>

                {/* Result */}
                {result && (
                    <h2 className={`result ${result !== "❌ No reaction" ? "success" : "failure"}`}>Result: {result}</h2>
                )}
            </div>
        </DndProvider>
    );
}

export default ChemistryAlchemy;
