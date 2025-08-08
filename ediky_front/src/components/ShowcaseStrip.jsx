import React, { useEffect, useRef, useState } from "react";
import "./ShowcaseStrip.css";
import previewVid from "../assets/video_editor_P.mp4";

export default function ShowcaseStrip() {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [inView, setInView] = useState(false);
  const [entered, setEntered] = useState(false);
  const [progress, setProgress] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [speed, setSpeed] = useState(1);

  // Page-enter pop-in
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  // NEW: whole-page hover “pop” (adds/removes a class on <body>)
  useEffect(() => {
    document.body.classList.add("pop-anim");
    const enter = () => document.body.classList.add("pop-hover");
    const leave = () => document.body.classList.remove("pop-hover");
    document.documentElement.addEventListener("mouseenter", enter);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      document.documentElement.removeEventListener("mouseenter", enter);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.body.classList.remove("pop-hover");
      document.body.classList.remove("pop-anim");
    };
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
        if (entry.isIntersecting) {
          v.play().catch(() => { });
          setIsPlaying(!v.paused);
        } else {
          v.pause();
          setIsPlaying(false);
        }
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
      if (document.hidden) {
        v.pause();
        setIsPlaying(false);
      } else if (inView) {
        v.play().catch(() => { });
        setIsPlaying(!v.paused);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [inView]);

  const handleLoaded = () => {
    setLoaded(true);
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  };

  const handleTime = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  // Subtle tilt
  const onPointerMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * 3;
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

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => { });
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25];
    const idx = (speeds.indexOf(speed) + 1) % speeds.length;
    const next = speeds[idx];
    setSpeed(next);
    const v = videoRef.current;
    if (v) v.playbackRate = next;
  };

  return (
    <section className={`section showcase-strip ${entered ? "has-entered" : ""}`} aria-labelledby="showcase-title">
      <div className="container showcase-grid" ref={wrapRef}>
        {/* LEFT: media window */}
        <div
          ref={cardRef}
          className={`window soft ${inView ? "is-visible" : ""}`}
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
              autoPlay
              loop
              muted={muted}
              playsInline
              preload="metadata"
              poster="/media/timeline_showcase_poster.jpg"
              onLoadedData={handleLoaded}
              onCanPlayThrough={handleLoaded}
              onTimeUpdate={handleTime}
              onError={() => setFallback(true)}
              onClick={togglePlay}
            >
              <source src={previewVid} />
            </video>
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

          {/* Minimal controls */}
          <div className="controls" aria-hidden={!loaded}>
            <button className="ctrl" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24"><rect x="5" y="4" width="5" height="16" rx="1.5" /><rect x="14" y="4" width="5" height="16" rx="1.5" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button className="ctrl" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? (
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 10v4h4l5 5V5l-5 5H4z" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 10v4h4l5 5V5l-5 5H4z" /><path d="M19 5l-3 3" /><path d="M16 16l3 3" /></svg>
              )}
            </button>
            <button className="ctrl speed" onClick={cycleSpeed} aria-label={`Speed ${speed}x`}>
              {speed.toFixed(2).replace(/\.00$/, "")}x
            </button>
          </div>
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
