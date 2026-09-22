import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLock, FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { LOGO_URL, NAV_LINKS } from "../data/content";
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

  const closeAll = () => {
    setNavOpen(false);
    setOpenSubmenu(null);
  };

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container site-header__inner">
        <a href="/#home" className="site-header__logo">
          <img src={LOGO_URL} alt="DREAM BIG NATION" />
        </a>

        <nav ref={navRef} className={`site-nav ${navOpen ? "is-open" : ""}`}>
          <ul>
            {NAV_LINKS.map((link) =>
              link.children ? (
                <li key={link.label} className="site-nav__item has-submenu">
                  <span className="site-nav__parent">
                    <a href={link.href} onClick={closeAll}>
                      {link.label}
                    </a>
                    <button
                      type="button"
                      className="site-nav__submenu-toggle"
                      aria-haspopup="true"
                      aria-expanded={openSubmenu === link.label}
                      aria-label={`Toggle ${link.label} submenu`}
                      onClick={() =>
                        setOpenSubmenu((current) => (current === link.label ? null : link.label))
                      }
                    >
                      <FiChevronDown className={openSubmenu === link.label ? "is-open" : ""} />
                    </button>
                  </span>

                  {openSubmenu === link.label && (
                    <ul className="site-nav__submenu" role="menu">
                      {link.children.map((sub) => (
                        <li key={sub.label} role="none">
                          {sub.to ? (
                            <Link role="menuitem" to={sub.to} onClick={closeAll}>
                              {sub.label}
                            </Link>
                          ) : (
                            <a role="menuitem" href={sub.href} onClick={closeAll}>
                              {sub.label}
                            </a>
                          )}
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
                  <a href={link.href} onClick={closeAll}>
                    {link.label}
                  </a>
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
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
