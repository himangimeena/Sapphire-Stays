import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls the window to the top on every route change.
// Handles both the main window and any scrollable app shell.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant on route change avoids the "scroll down then snap up" flicker
    // that `behavior: 'smooth'` causes on iOS Safari during navigation.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window.HTMLElement.prototype ? 'instant' : 'auto' });

    // Fallback for browsers/edge cases where scrollTo doesn't fire before paint
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // Safari
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
