import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard for external/injected scripts that reference this global symbol
(globalThis as { __LOVA_FIX_TRIGGER__?: unknown }).__LOVA_FIX_TRIGGER__ ??= null;

createRoot(document.getElementById("root")!).render(<App />);
