import React, { useContext, useMemo, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import { UserContext } from "../context/UserContext";
import { useAuth } from "../login/AuthContext";
import { auth } from "../login/firebaseConfig";
import { signOut } from "firebase/auth";
import edikyLogo from "../assets/ediky_logo.svg";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user: userCtx, setUser } = useContext(UserContext);
  const { currentUser } = useAuth(); // live auth source of truth
  const account = currentUser || userCtx || null;

  const [scrolled, setScrolled] = useState(false);
  const raf = useRef(0);

  const isHome = location.pathname === "/";

  // Derive initials for fallback avatar
  const initials = useMemo(() => {
    const base =
      account?.displayName ||
      userCtx?.name ||
      account?.email?.split("@")[0] ||
      "U";
    return base
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [account, userCtx]);

  // Pick best avatar URL (Auth → providerData → branded logo)
  const avatarUrl = useMemo(() => {
    let url =
      account?.photoURL ||
      account?.providerData?.[0]?.photoURL || // Google/Firebase providers
      "";

    // Prefer a cleaner size for Google avatars (s96-c → s256-c)
    if (url.includes("googleusercontent.com")) {
      url = url.replace(/s\d+-c/, "s256-c");
    }
    return url;
  }, [account]);

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

  const closeMenu = () => {
    const nav = document.getElementById("nav");
    if (nav?.classList.contains("show")) nav.classList.remove("show");
  };

  const handleBack = () => navigate(-1);
  const goLogin = () => { closeMenu(); navigate("/login"); };
  const goProfile = () => { closeMenu(); navigate("/profile"); };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser?.(null);
      closeMenu();
      navigate("/");
    } catch (e) {
      console.error("Logout failed:", e?.message);
    }
  };

  return (
    <nav className={`app-navbar navbar navbar-expand-lg sticky-top ${scrolled ? "is-scrolled" : ""}`} data-scope="navbar">
      <div className="nav-container container">
        {/* Brand */}
        <Link className="brand d-flex align-items-center" to="/" onClick={closeMenu} aria-label="EdikyLabs Home">
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
              <NavLink to="/" className={({ isActive }) => `nav-link link ${isActive ? "active" : ""}`} onClick={closeMenu}>
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/about" className={({ isActive }) => `nav-link link ${isActive ? "active" : ""}`} onClick={closeMenu}>
                About
              </NavLink>
            </li>

            <li className="nav-item dropdown">
              <button className="nav-link link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Docs</button>
              <ul className="dropdown-menu nav-dropdown" onClick={closeMenu}>
                <li><NavLink to="/dsa-progress" className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}>DSA Progress</NavLink></li>
                <li><NavLink to="/tutorials/algorithms" className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}>Algorithms</NavLink></li>
                <li><NavLink to="/tutorials/machine-learning" className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}>Machine Learning</NavLink></li>
              </ul>
            </li>

            {/* GitHub */}
            <li className="nav-item d-flex align-items-center">
              <a className="btn nav-cta ghost d-none d-lg-inline-flex ms-lg-2" href="https://github.com/EdikyLab/ediky-website" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-github me-2" /> GitHub
              </a>
              <a className="icon-btn d-inline-flex d-lg-none ms-2" href="https://github.com/EdikyLab/ediky-website" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="fa-brands fa-github" />
              </a>
            </li>

            {/* Auth: login → avatar */}
            <li className="nav-item ms-lg-2">
              {!account ? (
                <>
                  <button className="btn nav-cta solid d-none d-lg-inline-flex" onClick={goLogin} title="Log in">
                    <i className="fa-solid fa-right-to-bracket me-2" /> Log in
                  </button>
                  <button className="icon-btn d-inline-flex d-lg-none ms-2" onClick={goLogin} aria-label="Log in">
                    <i className="fa-solid fa-right-to-bracket" />
                  </button>
                </>
              ) : (
                <div className="dropdown">
                  <button className="avatar-btn" data-bs-toggle="dropdown" aria-expanded="false" title={account.email || "Account"}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="avatar-letters">{initials}</span>
                    )}
                  </button>
                  <ul className="dropdown-menu nav-dropdown dropdown-menu-end">
                    <li><button className="dropdown-item" onClick={goProfile}>Profile</button></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Sign out</button></li>
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
