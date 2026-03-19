import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard for external/injected scripts that reference this global symbol
(() => {
  const triggerName = "__LOVA_FIX_TRIGGER__";
  const globalRef = globalThis as Record<string, unknown>;

  if (typeof globalRef[triggerName] === "undefined") {
    Object.defineProperty(globalRef, triggerName, {
      value: null,
      writable: true,
      configurable: true,
    });
  }

  if (typeof window !== "undefined") {
    const windowRef = window as unknown as Record<string, unknown>;
    if (typeof windowRef[triggerName] === "undefined") {
      windowRef[triggerName] = globalRef[triggerName];
    }
  }

  if (typeof self !== "undefined") {
    const selfRef = self as unknown as Record<string, unknown>;
    if (typeof selfRef[triggerName] === "undefined") {
      selfRef[triggerName] = globalRef[triggerName];
    }
  }

  try {
    Function("var __LOVA_FIX_TRIGGER__ = globalThis.__LOVA_FIX_TRIGGER__;")();
  } catch {
    // no-op
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
