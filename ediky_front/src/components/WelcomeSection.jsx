import React, { useState, useEffect } from "react";
import "./WelcomeSection.css";
import AsciiThreeText from "./AsciiThreeText";

export default function WelcomeSection() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  const fullText = "Welcome to EdikyLabs";
  const typingSpeed = 200;
  const deletingSpeed = 150;
  const pauseBeforeDelete = 1000;
  const pauseBeforeRetype = 500;

  useEffect(() => {
    const handleType = () => {
      if (!isDeleting) {
        if (index < fullText.length) {
          setText((prev) => prev + fullText[index]);
          setIndex((prev) => prev + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
        }
      } else {
        if (index > 0) {
          setText((prev) => prev.slice(0, -1));
          setIndex((prev) => prev - 1);
        } else {
          setTimeout(() => setIsDeleting(false), pauseBeforeRetype);
        }
      }
    };

    const timer = setTimeout(
      handleType,
      isDeleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timer);
  }, [text, isDeleting, index]);

  return (
    <div className="welcome-section">

      {/* ASCII headline */}
      <div className="ascii-title">
        <AsciiThreeText text="EdikyLabs" asciiFontSize={8} enableWaves={true} />
      </div>
      <h1 className="welcome-title">
        {text}
        <span className="blinking-cursor">|</span>
      </h1>

    </div>
  );
}
