import React, { Suspense, lazy, useEffect, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./login/AuthContext";
import PrivateRoute from "./login/PrivateRoute";
import AuthDebugGate from "./login/AuthDebugGate";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProvider, UserContext } from "./components/userDetails/UserContext";
import PrivateHeaderGuard from "./login/PrivateHeaderGuard";
import Login from "./login/LoginPage";
import Profile from "./pages/Profile";

// NEW: Docs
const DocsPage = lazy(() => import("./pages/DocsPage"));

const Home = lazy(() => import("./pages/Home"));
const AboutSection = lazy(() => import("./components/AboutSection"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pathname]);
  return null;
}

function AuthBridge() {
  const { currentUser, loading } = useAuth();
  const { setUser } = useContext(UserContext);
  useEffect(() => {
    if (loading) return;
    setUser(
      currentUser
        ? {
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email,
          email: currentUser.email,
          progress: JSON.parse(localStorage.getItem("userProgress") || "{}"),
        }
        : null
    );
  }, [currentUser, loading, setUser]);
  return null;
}

const Fallback = (
  <div style={{ padding: "5rem 1rem", textAlign: "center", color: "#cfd7ff" }}>
    <div
      style={{
        width: 48, height: 48, margin: "0 auto 12px", borderRadius: "50%",
        border: "3px solid rgba(255,255,255,.2)", borderTopColor: "rgba(255,255,255,.7)",
        animation: "spin .9s linear infinite",
      }}
    />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    Loading…
  </div>
);

function AppLayout() {
  return (
    <>
      <PrivateHeaderGuard><Navbar /></PrivateHeaderGuard>
      <main id="route" style={{ minHeight: "70vh" }}>
        <ScrollToTop />
        <AuthBridge />
        <Outlet />
      </main>
      <PrivateHeaderGuard><Footer /></PrivateHeaderGuard>
    </>
  );
}

const NotFound = () => (
  <div style={{ padding: "72px 20px", maxWidth: 960, margin: "0 auto", color: "#e9eefc" }}>
    <h1>404</h1><p>That page doesn’t exist.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AuthDebugGate>
          <Router>
            <Suspense fallback={Fallback}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<AboutSection />} />
                  <Route path="login" element={<Login />} />

                  {/* NEW: Docs workspace (public read; saving requires login) */}
                  <Route path="docs/*" element={<DocsPage />} />

                  {/* Protected: Profile */}
                  <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                  <Route path="404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </AuthDebugGate>
      </UserProvider>
    </AuthProvider>
  );
}
