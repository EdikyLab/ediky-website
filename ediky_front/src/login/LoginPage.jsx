import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { emailLogin, emailSignup, googleLogin } from "./AuthService";
import { UserContext } from "../context/UserContext";
import ShapeBlur from "./ShapeBlur";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    // trigger entrance animations and autofocus
    const t = setTimeout(() => setMounted(true), 20);
    emailRef.current?.focus();
    return () => clearTimeout(t);
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    // auto-hide after 3.5s
    setTimeout(() => setToast({ type: "", msg: "" }), 3500);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      const u = isLogin
        ? await emailLogin(email, password)
        : await emailSignup(email, password);

      setUser({
        uid: u.uid,
        name: u.displayName || u.email,
        email: u.email,
        progress: JSON.parse(localStorage.getItem("userProgress") || "{}"),
      });

      showToast("success", isLogin ? "Logged in successfully." : "Account created!");
      navigate("/");
    } catch (err) {
      showToast("error", err?.message || "Something went wrong.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const u = await googleLogin();
      setUser({
        uid: u.uid,
        name: u.displayName || u.email,
        email: u.email,
        progress: JSON.parse(localStorage.getItem("userProgress") || "{}"),
      });
      showToast("success", "Google login successful!");
      navigate("/");
    } catch (err) {
      showToast("error", err?.message || "Google login failed.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className={`login-container page-fade ${mounted ? "in" : ""}`}>
      <div className="login-content row justify-content-center g-4">
        {/* Left: headline + visual */}
        <div className="col-md-6 d-none d-md-flex flex-column align-items-center justify-content-center fade-up">
          <h2 className="welcome-text text-gradient text-center mb-3">
            Welcome to EdikyLabs
          </h2>
          <p className="welcome-sub text-center">
            Build. Learn. Ship faster—beautifully.
          </p>
          <img
            src="https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif"
            alt="Animation"
            className="login-animation"
            loading="lazy"
          />
        </div>

        {/* Right: form + blur */}
        <div className="col-md-5 col-sm-12 form-section">
          <ShapeBlur
            className="shape-background"
            variation={0}
            pixelRatioProp={typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1}
            shapeSize={1.2}
            roundness={0.8}
            borderSize={0.05}
            circleSize={0.5}
            circleEdge={1}
          />

          <div className={`login-card card-pop ${mounted ? "in" : ""}`} role="dialog" aria-modal="true">
            {/* Inline Toast */}
            {toast.msg && (
              <div className={`inline-toast ${toast.type}`}>
                <i className={`me-2 ${toast.type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"}`} />
                {toast.msg}
              </div>
            )}

            <h2 className="login-card-title">
              {isLogin ? "Login to EdikyLabs" : "Create your account"}
            </h2>
            <p className="muted mb-3">
              {isLogin ? "Welcome back! Please sign in." : "Join us in a few seconds."}
            </p>

            <form onSubmit={handleEmailSubmit} noValidate>
              <div className="field">
                <i className="fas fa-envelope field-icon" aria-hidden="true" />
                <input
                  ref={emailRef}
                  type="email"
                  className="login-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-label="Email"
                />
              </div>

              <div className="field">
                <i className="fas fa-lock field-icon" aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  aria-label="Password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="field-trailing"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>

              <button
                type="submit"
                className="login-btn login-btn-primary"
                disabled={loadingEmail || loadingGoogle}
              >
                {loadingEmail ? (
                  <span className="spinner" aria-hidden="true" />
                ) : (
                  <i className="fas fa-arrow-right-to-bracket me-2" aria-hidden="true" />
                )}
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </form>

            <div className="divider"><span>or</span></div>

            <button
              type="button"
              className="login-btn login-btn-google"
              onClick={handleGoogleLogin}
              disabled={loadingEmail || loadingGoogle}
            >
              {loadingGoogle ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <i className="fab fa-google me-2" aria-hidden="true" />
              )}
              {isLogin ? "Sign in with Google" : "Continue with Google"}
            </button>

            <p className="login-toggle-text">
              {isLogin ? "Don't have an account?" : "Already have one?"}
              <button
                className="login-toggle-link"
                onClick={() => setIsLogin((p) => !p)}
                type="button"
              >
                {isLogin ? " Create Account" : " Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
