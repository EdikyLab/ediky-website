import React, { useEffect, useRef, useState } from "react";
import "./WelcomeSection.css";
import { useNavigate } from "react-router-dom";

export default function WelcomeSection() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const softNav = (to) => (e) => {
    e.preventDefault();
    const go = () => navigate(to);
    if (document.startViewTransition) document.startViewTransition(go);
    else go();
  };

  // preview progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress(v.duration ? v.currentTime / v.duration : 0);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onTime);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onTime);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const hoverScrub = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const t = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    v.currentTime = t * v.duration;
  };

  const keyControls = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      togglePlay();
    }
  };

  return (
    <section className="hero">
      <div className="hero-grid-bg" aria-hidden />
      <div className="hero-wrap">
        <div className="hero-left fade-in">
          <span className="eyebrow">AI-powered video editor</span>
          <h1 className="title">Welcome to EdikyStudio</h1>
          <p className="subtitle">
            Modern, minimalist, creator-first. Smart edits, fast timeline, GPU acceleration, and export that just works.
          </p>

          <div className="cta-row">
            <a href="/download" onClick={softNav("/download")} className="btn btn-primary">
              Download
            </a>
            <a href="/demo" onClick={softNav("/demo")} className="btn btn-ghost">
              Watch Demo
            </a>
          </div>

          <ul className="hero-stats">
            <li><strong>4K</strong> playback</li>
            <li><strong>10-bit</strong> color</li>
            <li><strong>GPU</strong> accelerated</li>
          </ul>
        </div>

        <div className="hero-right fade-in-delayed">
          <div
            className="preview"
            onMouseMove={hoverScrub}
            onClick={togglePlay}
            onKeyDown={keyControls}
            role="button"
            tabIndex={0}
            aria-label="Hero preview. Click or press Space to play/pause."
          >
            <video
              ref={videoRef}
              className="preview-media"
              src="/media/hero.mp4"
              autoPlay
              playsInline
              muted
              loop
              aria-label="EdikyStudio preview"
            />
            <button
              type="button"
              className={`preview-ctrl ${playing ? "is-playing" : "is-paused"}`}
              aria-pressed={playing}
              aria-label={playing ? "Pause preview" : "Play preview"}
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            />
            <div className="preview-progress" style={{ "--p": progress }} />
            <div className="preview-hint">Hover to scrub · Space to pause</div>
          </div>
        </div>
      </div>
    </section>
  );
}
