import React, { useEffect, useRef } from "react";
import { FaUserAstronaut, FaGamepad, FaGithub } from "react-icons/fa";
import { GiCrystalBars, GiRocket, GiDiamondTrophy } from "react-icons/gi";
import "./AboutSection.css";

const developers = [
  {
    Icon: FaUserAstronaut,
    name: "Shyama7004",
    role: "C++ / Python / Rust Developer & DevOps",
    bio:
      "GSoC 2025 contributor with OpenCV. Exploring C++, Python, and Rust. Into DevOps and building clean, meaningful solutions. Also a badminton player and music lover from NIT Rourkela.",
    github: "https://github.com/shyama7004",
  },
  {
    Icon: FaGamepad,
    name: "Ayushi2234",
    role: "Web & ML Developer",
    bio:
      "Web and ML developer from NIT Jamshedpur. Google Cloud Certified (CGPA 9.13). Builds smart, engaging solutions. Gamer at heart—Valorant, Minecraft, God of War.",
    github: "https://github.com/Ayushi2234",
  },
];

const plans = [
  {
    Icon: GiCrystalBars,
    tier: "Starter",
    price: "Free",
    popular: false,
    features: ["Basic UI Components", "Community Support", "1 Project"],
    cta: "Get Started",
  },
  {
    Icon: GiRocket,
    tier: "Pro",
    price: "$29/mo",
    popular: true,
    features: ["Advanced Analytics", "Priority Email Support", "Up to 5 Projects"],
    cta: "Upgrade Now",
  },
  {
    Icon: GiDiamondTrophy,
    tier: "Enterprise",
    price: "Contact Us",
    popular: false,
    features: ["Custom Integrations", "Dedicated SLA", "Unlimited Projects"],
    cta: "Contact Sales",
  },
];

export default function AboutSection() {
  const rafRef = useRef(0);

  // Scroll reveal
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el, i) => {
      el.style.setProperty("--stagger", `${i * 60}ms`);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Subtle pointer-driven tilt for cards (GPU-friendly)
  const handleTilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * 10; // rotateY
    const rx = (0.5 - py) * 8;  // rotateX
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.setProperty("--tiltX", `${rx}deg`);
      el.style.setProperty("--tiltY", `${ry}deg`);
    });
  };
  const resetTilt = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--tiltX", "0deg");
    el.style.setProperty("--tiltY", "0deg");
  };

  return (
    <section className="about-section" aria-labelledby="about-title">
      {/* ambient blobs */}
      <div className="about-blob a" aria-hidden="true" />
      <div className="about-blob b" aria-hidden="true" />

      <div className="container">
        {/* Developers */}
        <h2 id="about-title" className="section-title gradient-text shimmer">
          Meet the Developers
        </h2>
        <div className="dev-grid">
          {developers.map(({ Icon, name, role, bio, github }, i) => (
            <article
              key={name}
              className="dev-card reveal tilt"
              style={{ animationDelay: `${0.12 + i * 0.06}s` }}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              <div className="dev-icon-wrap floaty" style={{ "--float-delay": `${i * 0.2}s` }}>
                <span className="ring" />
                <Icon className="dev-icon" aria-hidden="true" />
              </div>
              <h3 className="dev-name">{name}</h3>
              <p className="dev-role">{role}</p>
              <p className="dev-bio">{bio}</p>

              <div className="dev-actions">
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} GitHub`}
                  className="btn btn-ghost magnetic"
                >
                  <FaGithub className="me-2" aria-hidden="true" /> GitHub
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Plans */}
        <h2 className="section-title gradient-text shimmer">Our Plans</h2>
        <div className="plan-grid">
          {plans.map(({ Icon, tier, price, features, cta, popular }, i) => (
            <article
              key={tier}
              className={`plan-card reveal tilt ${popular ? "popular" : ""}`}
              style={{ animationDelay: `${0.12 + i * 0.06}s` }}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
              aria-label={`${tier} plan`}
            >
              {popular && <div className="badge-popular" aria-hidden="true">Most Popular</div>}

              <div className="plan-icon-wrap floaty" style={{ "--float-delay": `${i * 0.25}s` }}>
                <span className="ring" />
                <Icon className="plan-icon" aria-hidden="true" />
              </div>

              <h3 className="plan-tier">{tier}</h3>
              <p className="plan-price">{price}</p>

              <ul className="plan-features">
                {features.map((f, j) => (
                  <li
                    key={f}
                    className="feature-item"
                    style={{ "--i": j }}
                  >
                    <span className="check" aria-hidden="true">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button type="button" className={`btn ${popular ? "btn-primary" : "btn-ghost"} magnetic`}>
                {cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
