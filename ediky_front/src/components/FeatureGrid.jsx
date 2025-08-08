import React, { useEffect, useRef } from "react";
import "./FeatureGrid.css"; // <-- separate CSS

const FEATURES = [
  { title: "AI Assist", desc: "Auto-cut, silence removal, scene detect, and smart highlights." },
  { title: "Color & LUTs", desc: "Professional grading, LUT import, and tone mapping." },
  { title: "Keyframes", desc: "Animate anything—position, scale, opacity, and effects." },
  { title: "Audio Suite", desc: "Noise removal, loudness normalization, and EQ presets." },
  { title: "GPU Accel", desc: "Metal/Vulkan backends for real-time previews and fast exports." },
  { title: "Collab Ready", desc: "Project bundles, media relink, and conflict-safe autosave." },
];

export default function FeatureGrid() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = root.querySelectorAll(".fg__item");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 }
    );
    cards.forEach((c, i) => {
      c.style.setProperty("--i", i);
      io.observe(c);
    });
    return () => io.disconnect();
  }, []);

  return (
    <section className="fg" ref={ref} aria-labelledby="fg-title">
      <div className="fg__container">
        <header className="fg__head">
          <span className="fg__kicker">Features</span>
          <h2 id="fg-title" className="fg__title">Everything you need to edit fast</h2>
          <p className="fg__sub">Minimal UI. Powerful under the hood.</p>
        </header>

        <ol className="fg__grid">
          {FEATURES.map((f) => (
            <li className="fg__item" key={f.title} tabIndex={0}>
              <div className="fg__inset">
                <span className="fg__icon" aria-hidden="true" />
                <h3 className="fg__item-title">{f.title}</h3>
                <p className="fg__item-desc">{f.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
