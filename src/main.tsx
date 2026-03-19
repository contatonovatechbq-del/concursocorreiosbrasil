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
    (0, eval)("var __LOVA_FIX_TRIGGER__ = globalThis.__LOVA_FIX_TRIGGER__;");
  } catch {
    // no-op
  }

  const suppressTriggerError = (message: string) => {
    return message.includes("__LOVA_FIX_TRIGGER__ is not defined")
      || message.includes("Can't find variable: __LOVA_FIX_TRIGGER__");
  };

  const blockTriggerError = (event: Event, message: string) => {
    if (!suppressTriggerError(message)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  window.addEventListener("error", (event) => {
    const message = String(event.message || event.error?.message || "");
    blockTriggerError(event, message);
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = typeof reason === "string" ? reason : String(reason?.message || "");
    blockTriggerError(event, message);
  }, true);

  window.onerror = (message) => suppressTriggerError(String(message || ""));

  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    const message = typeof reason === "string" ? reason : String(reason?.message || "");
    if (suppressTriggerError(message)) {
      event.preventDefault();
      return true;
    }
    return false;
  };
})();

createRoot(document.getElementById("root")!).render(<App />);
