import { useEffect } from "react";

export function SecurityHeaders() {
  useEffect(() => {
    const isPreview =
      window.location.hostname.includes("lovableproject.com") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("127.0.0.1");

    if (isPreview) return;

    try {
      if (window.self !== window.top) {
        console.warn("Security: app embedded in a frame.");
      }
    } catch {
      console.warn("Security: cross-origin frame detected.");
    }
  }, []);

  return null;
}
