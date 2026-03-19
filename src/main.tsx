import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard for external/injected scripts that reference this global symbol
(() => {
  const triggerName = "__LOVA_FIX_TRIGGER__";
  const targets = [
    globalThis as unknown as Record<string, unknown>,
    typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : undefined,
    typeof self !== "undefined" ? (self as unknown as Record<string, unknown>) : undefined,
  ];

  for (const target of targets) {
    if (!target) continue;
    try {
      if (typeof target[triggerName] === "undefined") target[triggerName] = null;
    } catch {
      // no-op
    }
  }

  try {
    globalThis.Function?.(`var ${triggerName} = null;`)();
  } catch {
    // no-op
  }

  try {
    (0, eval)(`var ${triggerName} = null;`);
  } catch {
    // no-op
  }

  if (typeof window === "undefined") return;

  const getMessage = (value: unknown) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "message" in value) {
      const maybeMessage = (value as { message?: unknown }).message;
      return typeof maybeMessage === "string" ? maybeMessage : String(maybeMessage ?? "");
    }
    return String(value ?? "");
  };

  const isTriggerError = (value: unknown) => {
    const message = getMessage(value);
    return message.includes(triggerName)
      && (message.includes("not defined") || message.includes("Can't find variable"));
  };

  const suppress = (event: Event, value: unknown) => {
    if (!isTriggerError(value)) return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  };

  window.addEventListener("error", (event) => {
    suppress(event, event.message || event.error);
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    suppress(event, event.reason);
  }, true);

  window.onerror = (message) => isTriggerError(message);
  window.onunhandledrejection = (event) => suppress(event, event.reason);
})();

createRoot(document.getElementById("root")!).render(<App />);
