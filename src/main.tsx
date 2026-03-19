import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard for external/injected scripts that reference this global symbol
(() => {
  const globalRef = globalThis as Record<string, unknown>;

  try {
    if (typeof globalRef.__LOVA_FIX_TRIGGER__ === "undefined") {
      globalRef.__LOVA_FIX_TRIGGER__ = null;
    }
  } catch {
    // no-op
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
