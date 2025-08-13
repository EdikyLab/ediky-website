import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { loginWithEmail, signupWithEmail, loginWithGoogle } from "./AuthService";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import edikyLogo from "../assets/ediky_logo.svg";
import "./LoginPage.css";

const HERO =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop";

export default function LoginPage() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  // DEFAULT = home (no forced dashboard)
  const next = new URLSearchParams(search).get("next") || "/";

  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const finish = () => navigate(next, { replace: true });

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      if (mode === "login") await loginWithEmail(email, password, remember);
      else await signupWithEmail(email, password, remember);
      finish();
    } catch (e) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true); setErr("");
    try { await loginWithGoogle(remember); finish(); }
    catch (e) { setErr(e?.message || "Google login failed."); }
    finally { setBusy(false); }
  };

  const signedIn = !loading && !!currentUser;
  const who = currentUser?.displayName || currentUser?.email;

  return (
    <div className={`amu-auth-screen ${mounted ? "is-mounted" : ""}`}>
      <div className={`amu-card-wrap pop-in ${mounted ? "is-active" : ""}`}>
        {/* LEFT */}
        <div className="amu-media fade-in">
          <div className="amu-media-header">
            <img src={edikyLogo} alt="" />
            <span>AMU</span>
            <Link to="/" className="amu-back-pill">Back to website</Link>
          </div>

          <div className="amu-media-image kenburns" style={{ backgroundImage: `url(${HERO})` }}>
            <div className="amu-media-gradient" />
            <div className="amu-media-caption slide-up">
              <h4>Capturing Moments,<br />Creating Memories</h4>
              <div className="amu-dots" aria-hidden>
                <span className="dot active" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="amu-form fade-in">
          <div className="amu-form-head">
            <h1>{mode === "signup" ? "Create an account" : "Welcome back"}</h1>
            <p className="amu-small">
              {mode === "signup" ? (
                <>Already have an account? <button className="amu-inline-link" onClick={() => setMode("login")}>Log in</button></>
              ) : (
                <>Don’t have an account? <button className="amu-inline-link" onClick={() => setMode("signup")}>Sign up</button></>
              )}
            </p>
          </div>

          {signedIn ? (
            <div className="amu-signedin">
              <div className="amu-note">You’re already signed in</div>
              <div className="amu-user">{who}</div>
              <div className="amu-btn-row">
                <Link to={next} className="amu-btn amu-btn-primary hover-lift">Continue</Link>
                <button className="amu-btn amu-btn-ghost" onClick={() => signOut(auth)}>Sign out</button>
              </div>
            </div>
          ) : (
            <>
              {err && <div className="amu-error" role="alert">{err}</div>}
              <form className="amu-fields" onSubmit={onSubmitEmail} noValidate>
                <label className="amu-field">
                  <span className="amu-label">Email</span>
                  <input className="amu-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
                </label>

                <label className="amu-field">
                  <span className="amu-label">Enter your password</span>
                  <div className="amu-passwrap">
                    <input className="amu-input" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="••••••••" required />
                    <button type="button" className="amu-peek" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"}>
                      <i className={`fa-regular ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </label>

                <label className="amu-check">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>I agree to the <a href="/terms">Terms & Conditions</a></span>
                </label>

                <button type="submit" disabled={busy} aria-busy={busy} className="amu-btn amu-btn-primary amu-btn-block hover-lift sheen">
                  {busy ? "Please wait…" : (mode === "signup" ? "Create account" : "Sign in")}
                </button>
              </form>

              <div className="amu-or">Or continue with</div>
              <div className="amu-providers">
                <button className="amu-btn amu-btn-outline hover-lift" onClick={onGoogle} disabled={busy}>
                  <i className="fab fa-google" /> Google
                </button>
                <button className="amu-btn amu-btn-outline" disabled title="Coming soon">
                  <i className="fab fa-apple" /> Apple
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
