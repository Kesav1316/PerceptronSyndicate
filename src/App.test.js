import React from "react";
import ChemistryAlchemy from "./ChemistryAlchemy";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="app-container">
                <ChemistryAlchemy />
            </div>
        </DndProvider>
    );
}

export default App;
