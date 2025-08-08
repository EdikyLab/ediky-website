import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import Logo from "../assets/ediky_logo.svg";

export default function Footer() {
  useEffect(() => {
    const el = document.querySelector(".ft");
    if (!el) return;

    // Reveal when in view
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add("ft--in");
    }, { threshold: 0.15 });
    io.observe(el);

    // Show "to top" after scrolling
    const btn = el.querySelector(".ft__totop");
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      btn?.classList.toggle("is-show", y > 320);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <footer className="ft" role="contentinfo">
      <div className="ft__container">
        <div className="ft__brand">
          <img className="ft__logo" src={Logo} alt="EdikyStudio" />
          <p className="ft__tag">Minimal. Fast. Creator-first.</p>
        </div>

        <nav className="ft__nav" aria-label="Footer navigation">
          <div className="ft__col">
            <span className="ft__head">Product</span>
            <ul className="ft__list">
              <li><Link to="/download">Download</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div className="ft__col">
            <span className="ft__head">Company</span>
            <ul className="ft__list">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/changelog">Changelog</Link></li>
            </ul>
          </div>
          <div className="ft__col">
            <span className="ft__head">Resources</span>
            <ul className="ft__list">
              <li><Link to="/docs">Docs</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="ft__bar">
        <small>© {new Date().getFullYear()} EdikyStudio</small>
        <div className="ft__social">
          <a href="https://github.com/shyama7004" target="_blank" rel="noreferrer" aria-label="GitHub" className="ico">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path fill="currentColor" d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.76.08-.75.08-.75 1.22.09 1.86 1.27 1.86 1.27 1.08 1.85 2.83 1.32 3.52 1.01.11-.8.42-1.33.76-1.64-2.66-.3-5.46-1.33-5.46-5.91 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.59-2.8 5.61-5.48 5.9.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" /></svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="ico">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .6 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.3.6 9.3.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31.5 31.5 0 0 0 .6-5.8 31.5 31.5 0 0 0-.6-5.8ZM9.6 15.4V8.6L15.8 12l-6.2 3.4Z" /></svg>
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="ico">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path fill="currentColor" d="M18.9 2H21l-6.9 7.9L22 22h-6.8l-5.3-6.8L3.9 22H2l7.4-8.5L2 2h6.8l5 6.4L18.9 2Zm-1.2 18h1.9L8.4 4H6.5l11.2 16Z" /></svg>
          </a>
        </div>
      </div>

      <button
        className="ft__totop"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </footer>
  );
}
