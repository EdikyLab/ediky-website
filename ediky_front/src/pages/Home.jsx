import React from "react";
import WelcomeSection from "../components/WelcomeSection";

// Optional sections (comment out if you haven’t added them yet)
import FeatureGrid from "../components/FeatureGrid";
import ShowcaseStrip from "../components/ShowcaseStrip";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import CtaBand from "../components/CtaBand";

export default function Home() {
  return (
    <>
      <WelcomeSection />
      <FeatureGrid />
      <ShowcaseStrip />
      <HowItWorks />
      <Testimonials />
      <CtaBand />
    </>
  );
}
