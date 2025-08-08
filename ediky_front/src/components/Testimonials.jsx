import React, { useEffect, useRef } from "react";
import "./Testimonials.css";

const QUOTES = [
  { q: "The timeline feels ridiculously smooth—even with heavy grades.", a: "Arjun P., Filmmaker" },
  { q: "AI cuts saved hours on a 90-min podcast. Export was blazing fast.", a: "Mira K., Creator" },
];

export default function Testimonials() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll(".tms__item");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach((el, i) => {
      el.style.setProperty("--i", i);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <section className="tms" ref={ref} aria-labelledby="tms-title">
      <div className="tms__container">
        <header className="tms__head">
          <span className="tms__kicker">Loved by creators</span>
          <h2 id="tms-title" className="tms__title">Real teams. Real results.</h2>
        </header>

        <ul className="tms__grid">
          {QUOTES.map((t, i) => (
            <li className="tms__item" key={i} tabIndex={0}>
              <figure className="tms__card">
                <blockquote className="tms__quote">
                  <p>{t.q}</p>
                </blockquote>
                <figcaption className="tms__by">— {t.a}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
