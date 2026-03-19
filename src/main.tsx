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

  const suppressTriggerError = (message: string) => {
    return message.includes("__LOVA_FIX_TRIGGER__ is not defined");
  };

  window.addEventListener("error", (event) => {
    const message = String(event.message || event.error?.message || "");
    if (suppressTriggerError(message)) {
      event.preventDefault();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = typeof reason === "string" ? reason : String(reason?.message || "");
    if (suppressTriggerError(message)) {
      event.preventDefault();
    }
  }, true);
})();

createRoot(document.getElementById("root")!).render(<App />);
