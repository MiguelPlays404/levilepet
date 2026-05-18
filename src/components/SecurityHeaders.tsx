import { useEffect } from 'react';

/**
 * Component to handle basic runtime security measures.
 * IMPORTANT: This component avoids direct location manipulation that can cause 
 * SecurityErrors when the app is running within an iframe (like the Lovable preview).
 */
export function SecurityHeaders() {
  useEffect(() => {
    // Basic runtime protections
    
    // 1. Frame protection (Clickjacking)
    // We only perform this check if we're NOT in a known preview environment 
    // to avoid SecurityErrors while developing.
    const isDevelopmentPreview = 
      window.location.hostname.includes('lovableproject.com') || 
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1');

    if (!isDevelopmentPreview) {
      try {
        if (window.self !== window.top) {
          // If we're being framed and it's not a preview, we might want to alert or redirect,
          // but we do it safely to avoid cross-origin permission errors.
          console.warn("Security: Application is being framed in a non-preview environment.");
        }
      } catch (e) {
        // Cross-origin access to window.top can throw an error if the parent is a different origin.
        // This catch handles that case gracefully.
        console.error("Security: Cross-origin frame detected.");
      }
    }
  }, []);

  return null;
}

