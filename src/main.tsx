import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard for external/injected scripts that reference this global symbol
(() => {
  const globalRef = globalThis as Record<string, unknown>;
  if (typeof globalRef.__LOVA_FIX_TRIGGER__ === "undefined") {
    Object.defineProperty(globalRef, "__LOVA_FIX_TRIGGER__", {
      value: null,
      writable: true,
      configurable: true,
    });
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
