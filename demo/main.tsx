import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Create root and render demo App
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
