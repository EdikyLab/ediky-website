import React, { useEffect, useRef, useState } from "react";
import "./CtaBand.css";

export default function CtaBand() {
  const sectionRef = useRef(null);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  const [inView, setInView] = useState(false);
  const [open, setOpen] = useState(false);

  // Reveal on scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Lock scroll + ESC + focus trap when open
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab") return;

      // focus trap
      const nodes = dialogRef.current?.querySelectorAll(
        'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section
      ref={sectionRef}
      className={`cta-band ${inView ? "is-visible" : ""}`}
      aria-labelledby="cta-title"
    >
      <div className="cta-container">
        <h3 id="cta-title" className="cta-title">
          Ready to edit faster?
        </h3>
        <p className="cta-sub">Download EdikyStudio and finish more in less time.</p>

        <button
          type="button"
          className="cta-btn cta-btn--primary cta-btn--pulse"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-controls="download-dialog"
          aria-expanded={open}
        >
          Get EdikyStudio
        </button>
      </div>

      {/* Modal */}
      <div className={`cta-pop ${open ? "open" : ""}`} aria-hidden={!open}>
        <div
          className="cta-pop__backdrop"
          onClick={() => setOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close download dialog"
        />
        <div
          id="download-dialog"
          className="cta-pop__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cta-pop-title"
          aria-describedby="cta-pop-desc"
          ref={dialogRef}
        >
          <button
            ref={closeBtnRef}
            className="cta-pop__close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>

          <h4 id="cta-pop-title" className="cta-pop__title">
            Choose your download
          </h4>
          <p id="cta-pop-desc" className="cta-pop__desc">
            Pick your platform and we’ll get you the right build.
          </p>

          <div className="cta-pop__actions">
            <a className="cta-btn cta-btn--primary" href="/download/mac">macOS (Apple Silicon)</a>
            <a className="cta-btn cta-btn--primary" href="/download/win">Windows</a>
            <a className="cta-btn cta-btn--ghost" href="/download">All downloads</a>
          </div>

          <p className="cta-pop__small">
            Need help? <a href="/docs/install">Installation guide</a>
          </p>
        </div>
      </div>
    </section>
  );
}
