import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const NavigationProgress = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<number[]>([]);
  const firstRef = useRef(true);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }

    clearTimers();
    setVisible(true);
    setProgress(16);

    const tick = (delay: number, value: number) => {
      const id = window.setTimeout(() => setProgress(value), delay);
      timersRef.current.push(id);
    };

    tick(80, 42);
    tick(180, 68);
    tick(300, 88);
    tick(430, 100);
    const end = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 620);
    timersRef.current.push(end);

    return clearTimers;
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[10000] h-1 rounded-r-full"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        background: "linear-gradient(90deg, hsl(var(--primary)), #fff09d)",
        boxShadow: "0 0 18px rgb(245 192 0 / 0.55)",
        transition: "width 180ms ease, opacity 220ms ease",
        pointerEvents: "none",
      }}
    />
  );
};
