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
      Object.defineProperty(target, triggerName, {
        value: null,
        writable: true,
        configurable: false,
      });
    } catch {
      try {
        if (typeof target[triggerName] === "undefined") target[triggerName] = null;
      } catch {
        // no-op
      }
    }
  }

  // Extra lexical/global scope fallback for third-party scripts
  try {
    (0, eval)(`var ${triggerName} = null;`);
  } catch {
    // no-op
  }

  if (typeof window === "undefined") return;

  const getMessage = (value: unknown) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const maybeMessage = (value as { message?: unknown }).message;
      if (typeof maybeMessage === "string") return maybeMessage;
      const maybeReason = (value as { reason?: unknown }).reason;
      if (typeof maybeReason === "string") return maybeReason;
      if (maybeReason && typeof maybeReason === "object" && "message" in maybeReason) {
        const nested = (maybeReason as { message?: unknown }).message;
        if (typeof nested === "string") return nested;
      }
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

  const prevOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (isTriggerError(message) || isTriggerError(error)) return true;
    return typeof prevOnError === "function" ? prevOnError(message, source, lineno, colno, error) : false;
  };

  const prevOnUnhandled = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    if (suppress(event, event.reason)) return true;
    return typeof prevOnUnhandled === "function" ? prevOnUnhandled(event) : false;
  };
})();

createRoot(document.getElementById("root")!).render(<App />);
