import React, { useEffect, useRef } from "react";
import "./HowItWorks.css";

const STEPS = [
  { n: "01", t: "Import", d: "Drop media, optional proxies, instant indexing." },
  { n: "02", t: "Edit", d: "Trim, ripple, slip—magnetized timeline feel." },
  { n: "03", t: "Enhance", d: "Color grade, AI effects, captions in one pass." },
  { n: "04", t: "Export", d: "H.264/HEVC/ProRes with hardware acceleration." },
];

export default function HowItWorks() {
  const ref = useRef(null);

  useEffect(() => {
    const cards = ref.current?.querySelectorAll(".hiw-item");
    if (!cards?.length) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => e.isIntersecting && e.target.classList.add("in"));
    }, { threshold: 0.15 });
    cards.forEach((c, i) => { c.style.setProperty("--i", i); io.observe(c); });
    return () => io.disconnect();
  }, []);

  return (
    <section className="hiw-wrap" aria-labelledby="hiw-title">
      <div className="hiw-container" ref={ref}>
        <header className="hiw-head">
          <span className="hiw-kicker">How it works</span>
          <h2 id="hiw-title" className="hiw-title">
            From import to <span className="hiw-accent">export</span>—without friction
          </h2>
        </header>

        <ol className="hiw-grid">
          {STEPS.map((s) => (
            <li className="hiw-item" key={s.n} tabIndex={0} aria-label={`${s.n} ${s.t}`}>
              <span className="hiw-chip" aria-hidden="true">{s.n}</span>
              <h3 className="hiw-item-title">{s.t}</h3>
              <p className="hiw-item-desc">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
