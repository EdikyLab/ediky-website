import React, { useEffect, useRef, useState } from "react";
import "./ShowcaseStrip.css";

export default function ShowcaseStrip() {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [inView, setInView] = useState(false);
  const [entered, setEntered] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100

  // Page-enter pop-in
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Reveal + auto pause when offscreen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause when tab hidden
  useEffect(() => {
    const handler = () => {
      const v = videoRef.current;
      if (!v) return;
      if (document.hidden) v.pause();
      else if (inView) v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [inView]);

  const handleTime = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  // (Very) subtle tilt
  const onPointerMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * 3; // max 3deg
    const ry = (0.5 - px) * 3;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  };
  const onPointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <section className={`section showcase-strip ${entered ? "has-entered" : ""}`} aria-labelledby="showcase-title">
      <div className="container showcase-grid" ref={wrapRef}>
        {/* LEFT: media window */}
        <div
          ref={cardRef}
          className={`window ${inView ? "is-visible" : ""}`}
          role="figure"
          aria-label="EdikyStudio timeline preview"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>

          {!fallback ? (
            <video
              ref={videoRef}
              className={`window-media ${loaded ? "is-ready" : ""}`}
              src="/media/timeline_showcase.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onCanPlayThrough={() => setLoaded(true)}
              onTimeUpdate={handleTime}
              onError={() => setFallback(true)}
            />
          ) : (
            <img
              src="/media/timeline_showcase_poster.jpg"
              alt="Timeline preview"
              className="window-media is-ready"
              loading="lazy"
            />
          )}

          {!loaded && <div className="window-skeleton" aria-hidden="true" />}
          <div className="video-progress" style={{ width: `${progress}%` }} />
        </div>

        {/* RIGHT: minimal copy */}
        <aside className={`showcase-copy ${inView ? "is-visible" : ""}`}>
          <p className="eyebrow">Showcase</p>
          <h2 id="showcase-title" className="copy-title">Smooth, color-accurate playback</h2>
          <p className="copy-sub">
            GPU-accelerated timeline that stays responsive—even with grades. 10-bit end-to-end.
          </p>

          <ul className="point-list">
            <li><span className="dot" /> Real-time 4K</li>
            <li><span className="dot" /> 10-bit pipeline</li>
            <li><span className="dot" /> One-click export</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
