import React, { useContext, useMemo, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import { UserContext } from "../context/UserContext";
import { auth } from "../login/firebaseConfig";
import { signOut } from "firebase/auth";
import edikyLogo from "../assets/ediky_logo.svg";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(UserContext);

  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const raf = useRef(0);

  const isHome = location.pathname === "/";
  const initials = useMemo(() => {
    const n = user?.name || user?.displayName || "";
    return n.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        setScrolled(y > 8);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const handleBack = () => navigate(-1);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch (e) {
      console.error("Logout failed:", e.message);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("contact@edikylabs.dev");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  };

  return (
    <nav
      className={`app-navbar navbar navbar-expand-lg sticky-top ${scrolled ? "is-scrolled" : ""}`}
      data-scope="navbar"
    >
      <div className="nav-container container">
        {/* Brand */}
        <Link className="brand d-flex align-items-center" to="/" aria-label="EdikyLabs Home">
          <img src={edikyLogo} alt="EdikyLabs" className="brand-logo" />
          <span className="brand-name">EdikyLabs</span>
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler nav-toggle"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="toggler-line" />
          <span className="toggler-line" />
          <span className="toggler-line" />
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto align-items-lg-center nav-gap">
            {!isHome && (
              <li className="nav-item d-none d-lg-block">
                <button className="icon-btn back-btn" onClick={handleBack} title="Back" aria-label="Back">
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
              </li>
            )}

            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => `nav-link link ${isActive ? "active" : ""}`}>
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/about" className={({ isActive }) => `nav-link link ${isActive ? "active" : ""}`}>
                About
              </NavLink>
            </li>

            <li className="nav-item dropdown">
              <button className="nav-link link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                Docs
              </button>
              <ul className="dropdown-menu nav-dropdown">
                <li>
                  <NavLink to="/dsa-progress" className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}>
                    DSA Progress
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tutorials/algorithms" className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}>
                    Algorithms
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/tutorials/machine-learning" className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}>
                    Machine Learning
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Say Hello */}
            <li className="nav-item d-flex align-items-center ms-lg-2">
              <button
                type="button"
                className={`btn nav-cta solid d-none d-lg-inline-flex ${copied ? "copied" : ""}`}
                onClick={copyEmail}
                aria-live="polite"
                title={copied ? "Copied!" : "Copy email"}
              >
                <i className={`me-2 fa-solid ${copied ? "fa-check" : "fa-paper-plane"}`} />
                {copied ? "Copied!" : "Say Hello"}
              </button>
              <button
                type="button"
                className="icon-btn d-inline-flex d-lg-none ms-2"
                onClick={copyEmail}
                aria-label={copied ? "Email copied" : "Copy email"}
                title={copied ? "Copied!" : "Copy email"}
              >
                <i className={`fa-solid ${copied ? "fa-check" : "fa-paper-plane"}`} />
              </button>
            </li>

            {/* GitHub */}
            <li className="nav-item d-flex align-items-center">
              <a
                className="btn nav-cta ghost d-none d-lg-inline-flex ms-lg-2"
                href="https://github.com/EdikyLab/ediky-website"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-github me-2" /> GitHub
              </a>
              <a
                className="icon-btn d-inline-flex d-lg-none ms-2"
                href="https://github.com/EdikyLab/ediky-website"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <i className="fa-brands fa-github" />
              </a>
            </li>

            {/* Auth */}
            <li className="nav-item ms-lg-2">
              {user ? (
                <div className="d-flex align-items-center gap-2">
                  <div className="user-chip" title={user.name || user.displayName || "Account"}>
                    <span className="chip-initials">{initials || "U"}</span>
                    <span className="chip-name d-none d-xl-inline">{user.name || user.displayName || "User"}</span>
                  </div>
                  <button onClick={handleLogout} className="btn nav-cta danger">
                    <i className="fa-solid fa-right-from-bracket me-2" /> Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn nav-cta solid d-none d-lg-inline-flex" title="Login">
                    <i className="fa-solid fa-right-to-bracket me-2" /> Login
                  </Link>
                  <Link to="/login" className="icon-btn d-inline-flex d-lg-none ms-2" title="Login" aria-label="Login">
                    <i className="fa-solid fa-right-to-bracket" />
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
