import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Reset any pinch-zoom by ensuring viewport scale is 1
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      );
      // Re-allow zoom after reset
      requestAnimationFrame(() => {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1"
        );
      });
    }
  }, [pathname]);

  return null;
}
