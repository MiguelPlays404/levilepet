import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Slightly faster wheel scrolling (desktop only, respects modifier keys)
if (typeof window !== "undefined") {
  const SPEED = 1.25;
  window.addEventListener(
    "wheel",
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.deltaMode !== 0) return; // only handle pixel deltas
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"], select')) return;
      e.preventDefault();
      window.scrollBy({ top: e.deltaY * SPEED, left: e.deltaX * SPEED, behavior: "auto" });
    },
    { passive: false }
  );
}

createRoot(document.getElementById("root")!).render(<App />);
