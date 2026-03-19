import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard for external/injected scripts that reference this global symbol
(() => {
  const globalRef = globalThis as Record<string, unknown>;

  if (!Object.prototype.hasOwnProperty.call(globalRef, "__LOVA_FIX_TRIGGER__")) {
    Object.defineProperty(globalRef, "__LOVA_FIX_TRIGGER__", {
      value: null,
      writable: true,
      configurable: true,
    });
    return;
  }

  if (globalRef.__LOVA_FIX_TRIGGER__ === undefined) {
    globalRef.__LOVA_FIX_TRIGGER__ = null;
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
