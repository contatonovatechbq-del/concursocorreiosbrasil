import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard for external/injected scripts that reference this global symbol
(() => {
  const triggerName = "__LOVA_FIX_TRIGGER__";
  const targets = [
    globalThis,
    typeof window !== "undefined" ? window : undefined,
    typeof self !== "undefined" ? self : undefined,
  ];

  for (const target of targets) {
    if (!target) continue;
    const scopedTarget = target as Record<string, unknown>;

    if (typeof scopedTarget[triggerName] === "undefined") {
      Object.defineProperty(scopedTarget, triggerName, {
        value: null,
        writable: true,
        configurable: true,
      });
    }
  }

  try {
    globalThis.Function?.(`var ${triggerName} = globalThis.${triggerName};`)();
  } catch {
    // no-op
  }

  if (typeof window === "undefined") return;

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
