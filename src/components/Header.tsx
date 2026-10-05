import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLock, FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { NAV_LINKS } from "../data/content";
import "./Header.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close the menu with the Escape key.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggleSubmenu = (label: string) =>
    setOpenSubmenu((current) => (current === label ? null : label));

  const closeAll = () => {
    setNavOpen(false);
    setOpenSubmenu(null);
  };

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container site-header__inner">
        <Link to="/#home" className="site-header__logo" aria-label="Dream Big Nation - Early Goal Setting" onClick={closeAll}>
          <span className="site-header__brand-name">DREAM BIG NATION</span>
          <span className="site-header__brand-tag">Early Goal Setting</span>
        </Link>

        <nav ref={navRef} className={`site-nav ${navOpen ? "is-open" : ""}`}>
          <ul>
            {NAV_LINKS.map((link) =>
              link.children ? (
                <li key={link.label} className="site-nav__item has-submenu">
                  <span className="site-nav__parent">
                    <a
                      href={link.href}
                      onClick={(event) => {
                        // The parent label only opens/closes its submenu; it has no page of its own.
                        event.preventDefault();
                        toggleSubmenu(link.label);
                      }}
                    >
                      {link.label}
                    </a>
                    <button
                      type="button"
                      className="site-nav__submenu-toggle"
                      aria-haspopup="true"
                      aria-expanded={openSubmenu === link.label}
                      aria-label={`Toggle ${link.label} submenu`}
                      onClick={() => toggleSubmenu(link.label)}
                    >
                      <FiChevronDown className={openSubmenu === link.label ? "is-open" : ""} />
                    </button>
                  </span>

                  {openSubmenu === link.label && (
                    <ul className="site-nav__submenu" role="menu">
                      {link.children.map((sub) => (
                        <li key={sub.label} role="none">
                          <Link role="menuitem" to={sub.to ?? sub.href ?? "/"} onClick={closeAll}>
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : link.to ? (
                <li key={link.label}>
                  <Link to={link.to} onClick={closeAll}>
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.label}>
                  <Link to={link.href} onClick={closeAll}>
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
          <Link
            className="btn site-nav__cta site-nav__cta--mobile"
            to="/register"
            onClick={closeAll}
          >
            Register Now
          </Link>

          <div className="site-nav__admin">
            <Link to="/admin" className="site-nav__admin-link" onClick={closeAll}>
              <FiLock size={13} />
              Admin Login
            </Link>
          </div>
        </nav>

        <div className="site-header__actions">
          <span className="site-header__divider" aria-hidden="true" />
          <Link to="/admin" className="site-header__admin-link">
            <FiLock size={13} />
            <span>Admin</span>
          </Link>
          <Link className="btn site-header__cta" to="/register">
            Register Now
          </Link>
        </div>

        <button
          className="site-header__toggle"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
