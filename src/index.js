import React from "react";
import ReactDOM from "react-dom/client";  // Import from "react-dom/client"
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import App from "./App";

// Create a root
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the app
root.render(
  <DndProvider backend={HTML5Backend}>
    <App />
  </DndProvider>
);

