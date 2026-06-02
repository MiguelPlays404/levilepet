import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }

    const el = wrapperRef.current;
    if (!el) return;

    el.style.pointerEvents = "none";
    el.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 320,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      }
    );

    const timer = window.setTimeout(() => {
      el.style.pointerEvents = "";
    }, 330);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return <div ref={wrapperRef}>{children}</div>;
};
