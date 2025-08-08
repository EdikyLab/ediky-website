// src/App.js
import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProvider } from "./components/userDetails/UserContext";

// Lazy routes
const Home = lazy(() => import("./pages/Home"));
const AboutSection = lazy(() => import("./components/AboutSection"));
const Login = lazy(() => import("./login/LoginPage"));

// Shared styles for stub pages
const pageStyle = {
  padding: "72px 20px",
  maxWidth: 960,
  margin: "0 auto",
  color: "#e9eefc",
};

// Scroll restore (imports are at the top now ✅)
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// Layout wrapper so Navbar/Footer don’t remount
function AppLayout() {
  return (
    <>
      <Navbar />
      <main id="route" style={{ minHeight: "70vh" }}>
        <ScrollToTop />
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Simple loader while chunks load
const Fallback = (
  <div style={{ padding: "5rem 1rem", textAlign: "center", color: "#cfd7ff" }}>
    <div
      style={{
        width: 48,
        height: 48,
        margin: "0 auto 12px",
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,.2)",
        borderTopColor: "rgba(255,255,255,.7)",
        animation: "spin 0.9s linear infinite",
      }}
    />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    Loading…
  </div>
);

// Temporary stubs for CTA targets
const Download = () => (
  <div style={pageStyle}>
    <h1>Download</h1>
    <p>macOS · Windows · Linux builds</p>
  </div>
);
const Demo = () => (
  <div style={pageStyle}>
    <h1>Demo</h1>
    <p>Product walkthrough & short clips</p>
  </div>
);
const Changelog = () => (
  <div style={pageStyle}>
    <h1>Changelog</h1>
    <p>Latest improvements and fixes</p>
  </div>
);
const NotFound = () => (
  <div style={pageStyle}>
    <h1>404</h1>
    <p>That page doesn’t exist.</p>
  </div>
);

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Suspense fallback={Fallback}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<AboutSection />} />
              <Route path="login" element={<Login />} />
              <Route path="download" element={<Download />} />
              <Route path="demo" element={<Demo />} />
              <Route path="changelog" element={<Changelog />} />
              <Route path="404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </UserProvider>
  );
}
