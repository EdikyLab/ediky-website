import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../login/AuthContext";
import { auth, db, storage } from "../login/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import edikyLogo from "../assets/ediky_logo.svg";
import "./Profile.css";

const asArray = (s) =>
  (s || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export default function Profile() {
  const { currentUser, refreshUser } = useAuth();
  const uid = currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // basic
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("Creator");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");

  // developer
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [languages, setLanguages] = useState("");   // comma-sep
  const [frameworks, setFrameworks] = useState(""); // comma-sep
  const [tools, setTools] = useState("");           // comma-sep
  const [openToCollab, setOpenToCollab] = useState(true);
  const [availability, setAvailability] = useState(""); // hrs/week
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!uid) return;
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (active && snap.exists()) {
          const d = snap.data();
          setHandle(d.handle || "");
          setBio(d.bio || "");
          setRole(d.role || "Creator");
          setWebsite(d.website || "");
          setLocation(d.location || "");
          setPhotoURL(d.photoURL || currentUser?.photoURL || "");
          setDisplayName(d.displayName || currentUser?.displayName || currentUser?.email?.split("@")[0] || "");

          // dev block (supports both nested `dev` and flat)
          const dev = d.dev || {};
          setGithub(dev.github || d.github || "");
          setLinkedin(dev.linkedin || d.linkedin || "");
          setTwitter(dev.twitter || d.twitter || "");
          setPortfolio(dev.portfolio || d.portfolio || "");
          setCompany(dev.company || "");
          setTitle(dev.title || "");
          setYearsExp(String(dev.yearsExp ?? ""));
          setLanguages((dev.languages || []).join(", "));
          setFrameworks((dev.frameworks || []).join(", "));
          setTools((dev.tools || []).join(", "));
          setOpenToCollab(Boolean(dev.openToCollab ?? true));
          setAvailability(String(dev.availability ?? ""));
          // Avoids ESLint missing-deps warning by not closing over `timezone`
          const tz = (dev.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone) || "";
          setTimezone(tz);
        } else if (active) {
          setDisplayName(currentUser?.displayName || currentUser?.email?.split("@")[0] || "");
          setPhotoURL(currentUser?.photoURL || "");
        }
      } catch (e) {
        if (active) setErr(e?.message || "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [uid, currentUser]);

  const onUploadAvatar = async (file) => {
    if (!file || !uid) return;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const avRef = ref(storage, `avatars/${uid}.${ext}`);
    await uploadBytes(avRef, file);
    const url = await getDownloadURL(avRef);
    setPhotoURL(url); // instant preview
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true); setErr(""); setOk("");
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName?.trim() || null,
        photoURL: photoURL?.trim() || null,
      });

      const dev = {
        github: github?.trim() || null,
        linkedin: linkedin?.trim() || null,
        twitter: twitter?.trim() || null,
        portfolio: portfolio?.trim() || null,
        company: company?.trim() || null,
        title: title?.trim() || null,
        yearsExp: yearsExp ? Number(yearsExp) : null,
        languages: asArray(languages),
        frameworks: asArray(frameworks),
        tools: asArray(tools),
        openToCollab,
        availability: availability ? Number(availability) : null,
        timezone: timezone || null,
      };

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          email: currentUser.email,
          displayName: displayName?.trim() || null,
          handle: handle?.trim() || null,
          bio: bio?.trim() || null,
          role,
          website: website?.trim() || null,
          location: location?.trim() || null,
          photoURL: photoURL?.trim() || null,
          dev,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await refreshUser(); // so Navbar updates
      setOk("Saved");
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setOk(""), 2200);
    }
  };

  const avatarSrc = useMemo(() => (photoURL || edikyLogo), [photoURL]);

  if (loading) {
    return (
      <section className="prof-wrap">
        <div className="prof-card skeleton" />
      </section>
    );
  }

  return (
    <section className="prof-wrap">
      <form className="prof-card" onSubmit={onSave}>
        <header className="prof-head">
          <div className="title">
            <h1>Profile</h1>
            <p className="muted">Update your public and developer details.</p>
          </div>
          <div className="status" aria-live="polite">
            {err && <span className="badge bad">{err}</span>}
            {ok && <span className="badge good">{ok}</span>}
            <button className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </header>

        {/* BASIC */}
        <section className="group">
          <h3 className="group-title">Public</h3>
          <div className="row">
            <div className="avatar">
              <img src={avatarSrc} alt="Profile avatar" />
              <label className="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onUploadAvatar(e.target.files?.[0])}
                />
                Change photo
              </label>
            </div>

            <div className="grid">
              <label className="field">
                <span className="label">Display name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </label>

              <label className="field">
                <span className="label">Username (handle)</span>
                <div className="prefix">
                  <span>@</span>
                  <input
                    value={handle}
                    onChange={(e) =>
                      setHandle(
                        e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase()
                      )
                    }
                    placeholder="username"
                    inputMode="text"
                    pattern="[a-z0-9_]+"
                    title="Lowercase letters, numbers, and underscore only"
                  />
                </div>
              </label>

              <label className="field wide">
                <span className="label">Bio</span>
                <input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short one-liner (e.g., Editor & Colorist)"
                />
              </label>

              <label className="field">
                <span className="label">Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>Creator</option>
                  <option>Editor</option>
                  <option>Colorist</option>
                  <option>VFX</option>
                  <option>Sound</option>
                  <option>Developer</option>
                </select>
              </label>

              <label className="field">
                <span className="label">Website</span>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://…"
                />
              </label>

              <label className="field">
                <span className="label">Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
              </label>
            </div>
          </div>
        </section>

        {/* DEVELOPER */}
        <section className="group">
          <h3 className="group-title">Developer</h3>
          <div className="grid grid-3">
            <label className="field">
              <span className="label">GitHub</span>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/you"
              />
            </label>
            <label className="field">
              <span className="label">LinkedIn</span>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/…"
              />
            </label>
            <label className="field">
              <span className="label">X/Twitter</span>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/…"
              />
            </label>

            <label className="field wide">
              <span className="label">Portfolio</span>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://portfolio…"
              />
            </label>

            <label className="field">
              <span className="label">Company</span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="(optional)"
              />
            </label>
            <label className="field">
              <span className="label">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Computer Vision Engineer"
              />
            </label>
            <label className="field">
              <span className="label">Years of experience</span>
              <input
                type="number"
                min="0"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
                placeholder="0"
              />
            </label>

            <label className="field wide">
              <span className="label">Languages (comma-separated)</span>
              <input
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="C++, Python, Rust"
              />
              <ChipPreview value={languages} />
            </label>

            <label className="field wide">
              <span className="label">Frameworks (comma-separated)</span>
              <input
                value={frameworks}
                onChange={(e) => setFrameworks(e.target.value)}
                placeholder="OpenCV, PyTorch, React"
              />
              <ChipPreview value={frameworks} />
            </label>

            <label className="field wide">
              <span className="label">Tools (comma-separated)</span>
              <input
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="Docker, CUDA, FFmpeg"
              />
              <ChipPreview value={tools} />
            </label>

            <label className="field">
              <span className="label">Availability (hrs/week)</span>
              <input
                type="number"
                min="0"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="10"
              />
            </label>
            <label className="field">
              <span className="label">Timezone</span>
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
              />
            </label>

            <label className="field field--switch">
              <span className="label">Open to collaboration</span>
              <label className="switch" aria-label="Open to collaboration">
                <input
                  type="checkbox"
                  checked={openToCollab}
                  onChange={(e) => setOpenToCollab(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </label>
          </div>
        </section>
      </form>
    </section>
  );
}

function ChipPreview({ value }) {
  const items = asArray(value);
  if (!items.length) return null;
  return (
    <div className="chips">
      {items.map((t, i) => (
        <span key={i} className="chip">{t}</span>
      ))}
    </div>
  );
}
