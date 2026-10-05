import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to the section named in the URL (#id) after every navigation, and to the top for plain pages. */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    // Retry briefly so the target exists when arriving from another page.
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      tries += 1;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.clearInterval(timer);
      } else if (tries > 20) {
        window.clearInterval(timer);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);

  return null;
}
