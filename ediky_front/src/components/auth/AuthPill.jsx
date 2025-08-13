import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../login/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../login/firebaseConfig";
import edikyLogo from "../../assets/ediky_logo.svg";
import "./auth-pill.css";

function initialsFrom(s = "") {
  const x = s.trim();
  if (!x) return "U";
  if (x.includes("@")) return x[0].toUpperCase();
  return x.split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}
function gradFrom(seed = "u") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  const hue = Math.abs(h) % 360;
  return `linear-gradient(135deg, hsl(${hue} 65% 55%) 0%, hsl(${(hue + 40) % 360} 65% 50%) 100%)`;
}

export default function AuthPill() {
  const { currentUser, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  // close on outside click
  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);

  // ✅ compute values unconditionally so hooks order never changes
  const display = useMemo(
    () => (currentUser?.displayName || currentUser?.email || ""),
    [currentUser]
  );
  const initials = useMemo(() => initialsFrom(display), [display]);
  const bg = useMemo(() => gradFrom(display), [display]);

  // render branches (no hooks below this point)
  if (loading) {
    return (
      <div className="authpill shimmer" aria-label="Loading">
        <span className="s-block" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Link to="/login" className="authpill" aria-label="Login">
        <img className="glyph" src={edikyLogo} alt="" />
        <span className="label">Login</span>
      </Link>
    );
  }

  return (
    <div className="authpill-wrap" ref={wrapRef}>
      <button
        type="button"
        className="authpill is-user"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={display}
      >
        {currentUser.photoURL ? (
          <img className="avatar" src={currentUser.photoURL} alt="" />
        ) : (
          <span className="avatar" style={{ background: bg }}>{initials}</span>
        )}
        <span className="caret" aria-hidden>▾</span>
      </button>

      {open && (
        <div className="authmenu" role="menu">
          <div className="m-head">
            <div className="avatar sm" style={{ background: bg }}>
              {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" /> : initials}
            </div>
            <div className="meta">
              <div className="name" title={display}>{display}</div>
              <div className="email" title={currentUser.email}>{currentUser.email}</div>
            </div>
          </div>
          <Link to="/account" className="m-item" role="menuitem" onClick={() => setOpen(false)}>
            <i className="fa-regular fa-user" /> Account
          </Link>
          <Link to="/dashboard" className="m-item" role="menuitem" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-gauge" /> Dashboard
          </Link>
          <div className="m-sep" />
          <button
            className="m-item danger"
            role="menuitem"
            onClick={async () => { setOpen(false); await signOut(auth); navigate("/login"); }}
          >
            <i className="fa-solid fa-right-from-bracket" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
