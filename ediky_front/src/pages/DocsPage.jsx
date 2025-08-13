import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useContext,             // NEW
} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Docs.css";
import { useAuth } from "../login/AuthContext";
import { addAnnotation, listenAnnotations, removeAnnotation } from "./docStore";

import {
    ArrowLeft,
    Sun,
    Moon,
    Volume2,
    Square,
    Undo2,
    Redo2,
    PanelLeftOpen,
    PanelRightOpen,
    PanelRightClose,
    Highlighter,
    Underline as UnderlineIcon,
    StickyNote,
    Trash2,
    X,
    Pencil,
    Plus,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Pin,
    PinOff,
    Maximize2,
    Minimize2,
} from "lucide-react";

/* ------------------------ small helpers ------------------------ */
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const docIdFromPath = (path) =>
    path.replace(/^\/+/u, "").replace(/\W+/gu, "_").toLowerCase();
const hexToRgba = (hex, a = 1) => {
    const h = hex.replace("#", "");
    const big = parseInt(
        h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
        16
    );
    const r = (big >> 16) & 255,
        g = (big >> 8) & 255,
        b = big & 255;
    return `rgba(${r},${g},${b},${a})`;
};
function splitAndWrap(str, target, makeWrap) {
    if (!str || !target) return [str];
    const re = new RegExp(`(${escapeRe(target)})`, "g");
    const parts = str.split(re);
    const out = [];
    for (let i = 0; i < parts.length; i++)
        out.push(i % 2 ? makeWrap(parts[i], i) : parts[i]);
    return out;
}
function flattenText(node) {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(flattenText).join("");
    if (React.isValidElement(node)) return flattenText(node.props?.children);
    return "";
}

/* tiny util to parse language + meta after ```lang meta... */
const parseFenceInfo = (className, node) => {
    const lang = (className || "").match(/language-([\w+#]+)/)?.[1] || "text";
    const rawMeta = node?.data?.meta || "";
    const meta = {};
    if (rawMeta) {
        [...rawMeta.matchAll(/(\w+)=("([^"]+)"|([^\s]+))/g)].forEach((m) => {
            meta[m[1]] = m[3] ?? m[4];
        });
    }
    return { lang, meta };
};

/* Minimal, single-box code block with Copy (for normal flow, NOT inside tables) */
function CodeBlock({ code, langInit = "text", title }) {
    const text = String(code || "");
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch { }
    };
    return (
        <div className="dz-codebox" role="group" aria-label="Code snippet">
            <div className="dz-codebox-head">
                <span className="dz-pill">
                    {(title || "").trim() || langInit.toUpperCase()}
                </span>
                <button className="dz-btn-ghost dz-small" onClick={onCopy} title="Copy">
                    Copy
                </button>
            </div>
            <pre className={`dz-pre dz-pre-${langInit}`} tabIndex={0}>
                <code>{text}</code>
            </pre>
        </div>
    );
}

/* decorate with highlights/underlines */
function deepDecorate(node, decorators, onAnnClick) {
    if (typeof node === "string") {
        let acc = [node];
        decorators.forEach(
            ({ type, text, id, color, opacity, thickness, style }) => {
                const wrap = (matched, i) => {
                    if (type === "highlight") {
                        const bg = color
                            ? hexToRgba(color, opacity ?? 1)
                            : "rgba(255, 244, 194, 1)";
                        return (
                            <mark
                                className="dz-hl"
                                data-ann={id}
                                key={`${id}-${i}`}
                                style={{ backgroundColor: bg }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAnnClick?.(id, type, e);
                                }}
                            >
                                {matched}
                            </mark>
                        );
                    }
                    return (
                        <span
                            className="dz-ul"
                            data-ann={id}
                            key={`${id}-${i}`}
                            style={{
                                textDecoration: "underline",
                                textDecorationColor: color || "#6aa2ff",
                                textDecorationThickness: `${thickness ?? 2}px`,
                                textDecorationStyle: style || "solid",
                                textUnderlineOffset: 3,
                                cursor: "pointer",
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAnnClick?.(id, type, e);
                            }}
                        >
                            {matched}
                        </span>
                    );
                };
                acc = acc.flatMap((chunk) =>
                    typeof chunk === "string" ? splitAndWrap(chunk, text, wrap) : [chunk]
                );
            }
        );
        return acc;
    }
    if (Array.isArray(node))
        return node.map((n, i) => (
            <React.Fragment key={i}>
                {deepDecorate(n, decorators, onAnnClick)}
            </React.Fragment>
        ));
    if (React.isValidElement(node) && node.props?.children != null) {
        return React.cloneElement(node, {
            children: React.Children.map(node.props.children, (c) =>
                deepDecorate(c, decorators, onAnnClick)
            ),
        });
    }
    return node;
}

/* front matter */
function extractFrontMatter(text) {
    const m = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!m) return { body: text, props: {} };
    const props = {};
    m[1].split("\n").forEach((line) => {
        const idx = line.indexOf(":");
        if (idx > -1)
            props[line.slice(0, idx).trim().toLowerCase()] = line
                .slice(idx + 1)
                .trim();
    });
    return { body: text.slice(m[0].length), props };
}

/* icon button */
const IconButton = ({ icon: Icon, label, className = "", ...props }) => (
    <button
        className={`dz-btn-icon ${className}`}
        aria-label={label}
        title={label}
        {...props}
    >
        <Icon size={18} strokeWidth={1.75} />
        <span className="dz-sr-only">{label}</span>
    </button>
);

/* ===== TABLE CONTEXT so code blocks inside tables render COMPACT ===== */
const TableCtx = React.createContext(false);

export default function DocsPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const file = params.get("file") || "intro.md";
    const fileUrl = `/docs/${file}`;
    const docId = useMemo(() => docIdFromPath(fileUrl), [fileUrl]);
    const uid = currentUser?.uid || null;

    const [manifest, setManifest] = useState([]);
    const [md, setMd] = useState("# Loading…");
    const [meta, setMeta] = useState({});
    const [ann, setAnn] = useState({ highlights: [], underlines: [], notes: [] });

    const [theme, setTheme] = useState(
        () => localStorage.getItem("dzTheme") || "light"
    );
    const [railOpen, setRailOpen] = useState(false);

    /** tool dock state */
    const [dockOpen, setDockOpen] = useState(
        () => localStorage.getItem("dzDockOpen") !== "0"
    );
    const [dockPinned, setDockPinned] = useState(
        () => localStorage.getItem("dzDockPinned") === "1"
    );
    const dockHideTimer = useRef(null);

    /** properties drawer + collapse */
    const [propsDrawerOpen, setPropsDrawerOpen] = useState(false);
    const [propsCollapsed, setPropsCollapsed] = useState(
        () => localStorage.getItem("dzPropsCollapsed") === "1"
    );

    /** focus mode: only docs visible */
    const [focusMode, setFocusMode] = useState(
        () => localStorage.getItem("dzFocus") === "1"
    );

    const [hlColor, setHlColor] = useState("#fff59d");
    const [hlOpacity, setHlOpacity] = useState(0.8);
    const [ulColor, setUlColor] = useState("#4f80ff");
    const [ulThickness, setUlThickness] = useState(2);
    const [ulStyle, setUlStyle] = useState("solid");
    const [commentMode, setCommentMode] = useState(false);
    const [editProps, setEditProps] = useState(false);
    const [propDraft, setPropDraft] = useState(null);
    const [activeAnn, setActiveAnn] = useState(null);
    const [selectionBar, setSelectionBar] = useState(null);
    const [selectionText, setSelectionText] = useState("");
    const [history, setHistory] = useState([]);
    const [future, setFuture] = useState([]);

    const articleRef = useRef(null);
    const selectBarRef = useRef(null);
    const railHideTimer = useRef(null);

    /* theme */
    useEffect(() => {
        document.documentElement.setAttribute("data-dz-theme", theme);
        localStorage.setItem("dzTheme", theme);
    }, [theme]);

    /* persistence */
    useEffect(() => {
        localStorage.setItem("dzDockOpen", dockOpen ? "1" : "0");
    }, [dockOpen]);
    useEffect(() => {
        localStorage.setItem("dzDockPinned", dockPinned ? "1" : "0");
    }, [dockPinned]);
    useEffect(() => {
        localStorage.setItem("dzPropsCollapsed", propsCollapsed ? "1" : "0");
    }, [propsCollapsed]);
    useEffect(() => {
        localStorage.setItem("dzFocus", focusMode ? "1" : "0");
    }, [focusMode]);

    /* manifest */
    useEffect(() => {
        fetch("/docs/manifest.json")
            .then((r) => (r.ok ? r.json() : []))
            .then(setManifest)
            .catch(() => setManifest([{ title: "Introduction", file: "intro.md" }]));
    }, []);

    /* load md + front matter */
    useEffect(() => {
        let alive = true;
        fetch(fileUrl)
            .then((r) => r.text())
            .then((text) => {
                if (!alive) return;
                const { body, props } = extractFrontMatter(text);
                const saved = localStorage.getItem(`dzDocMeta-${docId}`);
                const savedProps = saved ? JSON.parse(saved) : {};
                setMeta({ ...(props || {}), ...(savedProps || {}) });
                setMd(body || text);
            })
            .catch(() => {
                setMeta({});
                setMd(`# Not found\nCould not load \`${file}\`.`);
            });
        return () => {
            alive = false;
        };
    }, [fileUrl, file, docId]);

    /* firestore annotations */
    useEffect(() => {
        if (!uid) return;
        const unsub = listenAnnotations(uid, docId, (data) => setAnn(data));
        return () => unsub && unsub();
    }, [uid, docId]);

    /* decorators */
    const decorators = useMemo(() => {
        const hs = (ann.highlights || []).map((h) => ({
            type: "highlight",
            text: h.text,
            id: h.id,
            color: h.color,
            opacity: h.opacity,
        }));
        const us = (ann.underlines || []).map((u) => ({
            type: "underline",
            text: u.text,
            id: u.id,
            color: u.color,
            thickness: u.thickness,
            style: u.style,
        }));
        return [...hs, ...us];
    }, [ann]);

    /* selection popup positioning */
    const onMouseUp = useCallback(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim() || "";
        if (!text) {
            setSelectionBar(null);
            setSelectionText("");
            return;
        }
        const r = sel.getRangeAt(0).getBoundingClientRect();
        const x = clamp(r.left + r.width / 2, 20, window.innerWidth - 20);
        const y = clamp(
            r.top - 8 + window.scrollY,
            20,
            window.innerHeight + window.scrollY - 20
        );
        setSelectionBar({ x, y });
        setSelectionText(text);
    }, []);

    const mustLogin = () => alert("Sign in to save highlights and notes.");
    const pushHistory = (e) => {
        setHistory((h) => [...h, e]);
        setFuture([]);
    };

    const onAdd = async (kind, text, extra = {}) => {
        if (!uid) return mustLogin();
        const res = await addAnnotation(uid, docId, { type: kind, text, ...extra });
        pushHistory({ type: kind, text, id: res?.id, extra });
    };
    const onUndo = async () => {
        const last = history[history.length - 1];
        if (!last) return;
        const pool =
            last.type === "note"
                ? ann.notes
                : last.type === "highlight"
                    ? ann.highlights
                    : ann.underlines;
        const target = [...(pool || [])]
            .reverse()
            .find((a) => a.id === last.id || a.text === last.text);
        if (target?.id && uid) await removeAnnotation(uid, docId, target.id);
        setHistory((h) => h.slice(0, -1));
        setFuture((f) => [last, ...f]);
    };
    const onRedo = async () => {
        const next = future[0];
        if (!next) return;
        await onAdd(next.type, next.text, next.extra || {});
        setFuture((f) => f.slice(1));
    };

    const onHighlight = () => {
        if (!selectionText) return;
        onAdd("highlight", selectionText, { color: hlColor, opacity: hlOpacity });
        setSelectionBar(null);
        window.getSelection().removeAllRanges();
    };
    const onUnderline = () => {
        if (!selectionText) return;
        onAdd("underline", selectionText, {
            color: ulColor,
            thickness: ulThickness,
            style: ulStyle,
        });
        setSelectionBar(null);
        window.getSelection().removeAllRanges();
    };
    const onNoteFromSelection = async () => {
        if (!selectionText) return;
        const note = prompt("Add note for selection:", "");
        if (note && note.trim())
            await onAdd("note", selectionText, { note: note.trim() });
        setSelectionBar(null);
        window.getSelection().removeAllRanges();
    };
    const onNoteForParagraph = async (paraIdx, paraText) => {
        const note = prompt("Add note:", "");
        if (note && note.trim())
            await onAdd("note", paraText.slice(0, 200), {
                note: note.trim(),
                anchor: { kind: "paragraph", index: paraIdx },
            });
    };

    /* TTS */
    const speak = (txt) => {
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(txt);
            u.rate = 1.0;
            window.speechSynthesis.speak(u);
        } catch { }
    };
    const onSpeakSelection = () => selectionText && speak(selectionText);
    const onSpeakAll = () => speak(articleRef.current?.innerText || "");
    const onStopSpeak = () => window.speechSynthesis?.cancel();

    /* click outside to hide selection bar */
    useEffect(() => {
        const onDocClick = (e) => {
            if (!selectBarRef.current) return;
            if (!selectBarRef.current.contains(e.target)) {
                const sel = window.getSelection();
                if (!sel || sel.toString() === "") setSelectionBar(null);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    /* left rail peek */
    const startRailTimer = useCallback(() => {
        clearTimeout(railHideTimer.current);
        railHideTimer.current = setTimeout(() => setRailOpen(false), 1200);
    }, []);
    const cancelRailTimer = useCallback(() => {
        clearTimeout(railHideTimer.current);
    }, []);
    useEffect(() => {
        const onMove = (e) => {
            if (e.clientX <= 10) setRailOpen(true);
        };
        const onKey = (e) => {
            if (e.key === "`") setRailOpen((v) => !v);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    /* annotation menu */
    const onAnnClick = (id, type, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 8 + window.scrollY;
        setActiveAnn({ id, type, x, y });
        event.stopPropagation();
    };
    const onDeleteAnn = async () => {
        if (!activeAnn || !uid) return;
        await removeAnnotation(uid, docId, activeAnn.id);
        setActiveAnn(null);
    };

    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

    /* edit props */
    const startEditProps = () => {
        setPropDraft({
            status: meta.status || "In Progress",
            due: meta.due || meta.duedate || "",
            priority: meta.priority || "Low",
            assignee: meta.assignee || meta.owner || "",
            tags: (meta.tags || "")
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            docNote: meta.docnote || meta.note || "",
            links: (meta.links || "")
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean),
            custom: meta.custom || "",
        });
        setEditProps(true);
    };
    const cancelEditProps = () => {
        setEditProps(false);
        setPropDraft(null);
    };
    const saveProps = () => {
        if (!propDraft) return;
        const newMeta = {
            ...meta,
            status: propDraft.status,
            due: propDraft.due,
            priority: propDraft.priority,
            assignee: propDraft.assignee,
            tags: propDraft.tags.join(", "),
            docnote: propDraft.docNote,
            links: propDraft.links.join(", "),
            custom: propDraft.custom,
        };
        setMeta(newMeta);
        localStorage.setItem(`dzDocMeta-${docId}`, JSON.stringify(newMeta));
        setEditProps(false);
        setPropDraft(null);
    };

    const currentInManifest = manifest.find((m) => m.file === file);
    const title = (
        meta.title ||
        currentInManifest?.title ||
        (file.endsWith(".md")
            ? file.replace(/\.md$/i, "").replace(/[-_]/g, " ")
            : "Document")
    ).trim();

    /* ---------- Markdown component overrides (compact code inside tables) ---------- */
    let paraCounter = 0;
    const mdComponents = useMemo(() => {
        const P = (props) => {
            const idx = useMemo(() => paraCounter++, []);
            const txt = flattenText(props.children);
            return (
                <div className="dz-para-wrap" data-para={idx}>
                    {commentMode && (
                        <button
                            className="dz-para-note-btn"
                            title="Add note"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onNoteForParagraph(idx, txt);
                            }}
                        >
                            <Plus size={14} />
                        </button>
                    )}
                    <p {...props}>{deepDecorate(props.children, decorators, onAnnClick)}</p>
                </div>
            );
        };

        const wrap = (Tag) => (props) => (
            <Tag {...props}>{deepDecorate(props.children, decorators, onAnnClick)}</Tag>
        );

        // Code renderer: compact <pre> when inside a table, full CodeBlock otherwise
        const Code = ({ inline, className, children, node, ...rest }) => {
            const inTable = useContext(TableCtx);
            if (inline) {
                return (
                    <code className="dz-inline-code" {...rest}>
                        {children}
                    </code>
                );
            }
            const raw = String(children || "");
            const { lang, meta } = parseFenceInfo(className, node);
            const title = meta.title || meta.name || "";
            return inTable ? (
                <pre className={`dz-pre dz-pre-compact dz-pre-${lang}`} tabIndex={0}>
                    <code>{raw}</code>
                </pre>
            ) : (
                <CodeBlock code={raw} langInit={lang} title={title} />
            );
        };

        // Tables: provide context so children know they're inside a table
        const Table = ({ children }) => (
            <div className="dz-table-wrap">
                <TableCtx.Provider value={true}>
                    <table className="dz-table">{children}</table>
                </TableCtx.Provider>
            </div>
        );
        const TH = (props) => (
            <th {...props}>
                {deepDecorate(props.children, decorators, onAnnClick)}
            </th>
        );
        const TD = (props) => (
            <td {...props}>
                {deepDecorate(props.children, decorators, onAnnClick)}
            </td>
        );

        return {
            p: P,
            li: wrap("li"),
            span: wrap("span"),
            strong: wrap("strong"),
            em: wrap("em"),
            h1: wrap("h1"),
            h2: wrap("h2"),
            h3: wrap("h3"),
            h4: wrap("h4"),
            h5: wrap("h5"),
            h6: wrap("h6"),
            blockquote: wrap("blockquote"),
            // tables
            table: Table,
            thead: (props) => <thead {...props} />,
            tbody: (props) => <tbody {...props} />,
            tr: (props) => <tr {...props} />,
            th: TH,
            td: TD,
            // code
            code: Code,
            pre: ({ children }) => <>{children}</>, // handled in Code
            a: ({ href, children, ...rest }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                    {deepDecorate(children, decorators, onAnnClick)}
                </a>
            ),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decorators, commentMode]);

    /* -------- tool dock: open on 'm' only -------- */
    const autoHideMs = 1600;
    const openDock = useCallback(() => setDockOpen(true), []);
    const scheduleHideDock = useCallback(() => {
        if (dockPinned) return;
        clearTimeout(dockHideTimer.current);
        dockHideTimer.current = setTimeout(() => setDockOpen(false), autoHideMs);
    }, [dockPinned]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key.toLowerCase() === "m" && !focusMode) {
                openDock();
                scheduleHideDock();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [openDock, scheduleHideDock, focusMode]);

    /* render */
    return (
        <div
            className={`dz-frame ${railOpen ? "dz-rail-open" : "dz-rail-collapsed"}`}
        >
            <div
                className="dz-left-peek"
                aria-hidden
                onMouseEnter={() => setRailOpen(true)}
            />

            {/* Left rail */}
            <aside
                className={`dz-rail dz-left ${railOpen ? "dz-open" : "dz-closed"}`}
                onMouseEnter={cancelRailTimer}
                onMouseLeave={startRailTimer}
            >
                <div className="dz-brand-row">
                    <div className="dz-brand-dot" />
                    <div className="dz-brand-name">Workspace</div>
                    <button
                        className="dz-rail-hide"
                        title="Hide (Esc)"
                        onClick={() => setRailOpen(false)}
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>

                <div className="dz-rail-search-wrap">
                    <input
                        className="dz-rail-search"
                        placeholder="Search…"
                        onChange={() => { }}
                    />
                </div>

                <nav className="dz-rail-links">
                    {manifest.map((m) => (
                        <button
                            key={m.file}
                            className={`dz-rail-link ${m.file === file ? "dz-active" : ""}`}
                            onClick={() => {
                                navigate(`/docs?file=${encodeURIComponent(m.file)}`);
                                setRailOpen(false);
                            }}
                            title={m.title}
                        >
                            <span className="dz-dot" />
                            <span className="dz-label">{m.title}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main (full-bleed) */}
            <section className="dz-main" onMouseUp={onMouseUp}>
                <header className="dz-header">
                    <div className="dz-crumbs">
                        <button
                            className="dz-crumb-back"
                            onClick={() => window.history.back()}
                            aria-label="Back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <span className="dz-crumb">Actions</span>
                        <span className="dz-crumb dz-sep">›</span>
                        <span className="dz-crumb dz-current">{title}</span>
                    </div>

                    <div className="dz-actions">
                        <button
                            className="dz-btn-ghost"
                            onClick={toggleTheme}
                            title="Toggle light/dark"
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* Properties drawer button */}
                        <IconButton
                            icon={PanelRightOpen}
                            label="Open properties"
                            onClick={() => setPropsDrawerOpen(true)}
                        />

                        {/* Focus mode toggle */}
                        {!focusMode ? (
                            <IconButton
                                icon={Maximize2}
                                label="Focus mode"
                                onClick={() => setFocusMode(true)}
                            />
                        ) : (
                            <IconButton
                                icon={Minimize2}
                                label="Exit focus"
                                onClick={() => setFocusMode(false)}
                            />
                        )}

                        {!uid && <span className="dz-badge">Sign in to save</span>}
                        <IconButton icon={Volume2} label="Read aloud" onClick={onSpeakAll} />
                        <IconButton icon={Square} label="Stop reading" onClick={onStopSpeak} />
                        <IconButton
                            className="dz-only-collapsed"
                            icon={PanelLeftOpen}
                            label="Show workspace"
                            onClick={() => setRailOpen(true)}
                        />
                    </div>
                </header>

                {/* Tools dock — opens on 'm' only */}
                {!focusMode && (
                    <div
                        className={`dz-tool-dock ${dockOpen ? "" : "dz-collapsed"} ${dockPinned ? "dz-pinned" : ""
                            }`}
                        onMouseEnter={() => {
                            clearTimeout(dockHideTimer.current);
                        }}
                        onMouseLeave={scheduleHideDock}
                    >
                        <div className="dz-tool-left">
                            <IconButton icon={Undo2} label="Undo" onClick={onUndo} />
                            <IconButton icon={Redo2} label="Redo" onClick={onRedo} />

                            <div className="dz-tool-sep" />

                            <div className="dz-tool-group">
                                <label>Highlight</label>
                                <input
                                    type="color"
                                    value={hlColor}
                                    onChange={(e) => setHlColor(e.target.value)}
                                    title="Highlight colour"
                                />
                                <input
                                    type="range"
                                    min="0.2"
                                    max="1"
                                    step="0.05"
                                    value={hlOpacity}
                                    onChange={(e) => setHlOpacity(parseFloat(e.target.value))}
                                    title="Highlight opacity"
                                />
                                <span className="dz-tool-val">
                                    {Math.round(hlOpacity * 100)}%
                                </span>
                            </div>

                            <div className="dz-tool-group">
                                <label>Underline</label>
                                <input
                                    type="color"
                                    value={ulColor}
                                    onChange={(e) => setUlColor(e.target.value)}
                                    title="Underline colour"
                                />
                                <input
                                    type="range"
                                    min="1"
                                    max="6"
                                    step="1"
                                    value={ulThickness}
                                    onChange={(e) =>
                                        setUlThickness(parseInt(e.target.value, 10))
                                    }
                                    title="Underline thickness"
                                />
                                <span className="dz-tool-val">{ulThickness}px</span>
                                <select
                                    className="dz-select-style"
                                    value={ulStyle}
                                    onChange={(e) => setUlStyle(e.target.value)}
                                    title="Underline style"
                                >
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="dotted">Dotted</option>
                                    <option value="double">Double</option>
                                </select>
                            </div>

                            <div className="dz-tool-sep" />

                            <button
                                className={`dz-btn-soft ${commentMode ? "dz-on" : ""}`}
                                onClick={() => setCommentMode((v) => !v)}
                                title="Toggle comment mode"
                            >
                                <StickyNote size={18} style={{ marginRight: 6 }} />
                                <span>{commentMode ? "Comments: On" : "Comments: Off"}</span>
                            </button>
                        </div>

                        <div className="dz-tool-right">
                            <IconButton
                                icon={dockPinned ? Pin : PinOff}
                                label={dockPinned ? "Unpin menu" : "Pin menu"}
                                onClick={() => setDockPinned((p) => !p)}
                            />
                            <button
                                className="dz-dock-toggle"
                                title={dockOpen ? "Collapse tools" : "Expand tools"}
                                onClick={() => setDockOpen((o) => !o)}
                            >
                                {dockOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="dz-doc-wrap">
                    <h1 className="dz-title">{title}</h1>
                    <div className="dz-sub">Updated {new Date().toLocaleString()}</div>

                    <article ref={articleRef} className="dz-article">
                        {/* Selection mini bar */}
                        {selectionBar && (
                            <div
                                ref={selectBarRef}
                                className="dz-selection-bar"
                                style={{ left: selectionBar.x, top: selectionBar.y }}
                            >
                                <IconButton
                                    icon={Highlighter}
                                    label="Highlight"
                                    onClick={onHighlight}
                                />
                                <IconButton
                                    icon={UnderlineIcon}
                                    label="Underline"
                                    onClick={onUnderline}
                                />
                                <IconButton
                                    icon={StickyNote}
                                    label="Add note"
                                    onClick={onNoteFromSelection}
                                />
                                <IconButton
                                    icon={Volume2}
                                    label="Read selection"
                                    onClick={onSpeakSelection}
                                />
                            </div>
                        )}

                        {/* Annotation context menu */}
                        {activeAnn && (
                            <div
                                className="dz-ann-menu"
                                style={{ left: activeAnn.x, top: activeAnn.y }}
                            >
                                <button
                                    className="dz-btn-soft"
                                    onClick={onDeleteAnn}
                                    title="Delete annotation"
                                >
                                    <Trash2 size={16} style={{ marginRight: 6 }} /> Delete
                                </button>
                                <button
                                    className="dz-btn-soft"
                                    onClick={() => setActiveAnn(null)}
                                    title="Close menu"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="dz-md-host">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={mdComponents}
                            >
                                {md}
                            </ReactMarkdown>
                        </div>
                    </article>

                    {/* Activity */}
                    <section className="dz-activity">
                        <h3>Activity</h3>
                        {ann.notes.length === 0 &&
                            ann.highlights.length === 0 &&
                            ann.underlines.length === 0 ? (
                            <div className="dz-muted">
                                No activity yet. Select text or use Comment mode.
                            </div>
                        ) : null}
                        {ann.notes.map((n) => (
                            <div key={n.id} className="dz-act-row">
                                <div className="dz-act-dot dz-note" />
                                <div className="dz-act-body">
                                    <div className="dz-act-title">{n.note}</div>
                                    <div className="dz-act-sub">
                                        “{n.text}” •{" "}
                                        {new Date(n.createdAt || Date.now()).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </section>

            {/* PROPERTIES DRAWER */}
            {propsDrawerOpen && (
                <>
                    <div
                        className="dz-props-overlay"
                        onClick={() => setPropsDrawerOpen(false)}
                    />
                    <aside className="dz-props-panel" role="dialog" aria-label="Properties">
                        <div className="dz-props-head sticky">
                            <div>Properties</div>
                            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                                <button
                                    className="dz-btn-ghost dz-small"
                                    onClick={() => setPropsCollapsed((v) => !v)}
                                    aria-expanded={!propsCollapsed}
                                    title={propsCollapsed ? "Expand" : "Collapse"}
                                >
                                    {propsCollapsed ? (
                                        <ChevronDown size={14} />
                                    ) : (
                                        <ChevronUp size={14} />
                                    )}
                                </button>
                                {!editProps && !propsCollapsed && (
                                    <button
                                        className="dz-btn-ghost dz-small"
                                        onClick={startEditProps}
                                        title="Edit"
                                    >
                                        <Pencil size={14} style={{ marginRight: 6 }} /> Edit
                                    </button>
                                )}
                                <IconButton
                                    icon={PanelRightClose}
                                    label="Close properties"
                                    onClick={() => setPropsDrawerOpen(false)}
                                />
                            </div>
                        </div>

                        {!propsCollapsed &&
                            (!editProps ? (
                                <>
                                    <div className="dz-prop-row">
                                        <div className="dz-prop-label">Status</div>
                                        <div
                                            className={`dz-prop-badge dz-status ${(
                                                meta.status || "In Progress"
                                            )
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                        >
                                            {meta.status || "In Progress"}
                                        </div>
                                    </div>
                                    {meta.due && (
                                        <div className="dz-prop-row">
                                            <div className="dz-prop-label">Due Date</div>
                                            <div className="dz-prop-value">{meta.due}</div>
                                        </div>
                                    )}
                                    <div className="dz-prop-row">
                                        <div className="dz-prop-label">Priority</div>
                                        <div
                                            className={`dz-prop-badge dz-priority ${(
                                                meta.priority || "Low"
                                            ).toLowerCase()}`}
                                        >
                                            {meta.priority || "Low"}
                                        </div>
                                    </div>
                                    <div className="dz-prop-row">
                                        <div className="dz-prop-label">Assigned to</div>
                                        <div className="dz-prop-avatar">
                                            <span className="dz-avatar-dot" />
                                            <span>{meta.assignee || meta.owner || "—"}</span>
                                        </div>
                                    </div>
                                    <div className="dz-prop-row">
                                        <div className="dz-prop-label">Tags</div>
                                        <div className="dz-prop-tags">
                                            {((meta.tags || "Audit, Document")
                                                .split(",")
                                                .map((t) => t.trim())
                                                .filter(Boolean)
                                            ).map((t, i) => (
                                                <span className="dz-chip" key={`${t}-${i}`}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {meta.docnote && (
                                        <div className="dz-prop-row">
                                            <div className="dz-prop-label">Doc Note</div>
                                            <div className="dz-prop-value">{meta.docnote}</div>
                                        </div>
                                    )}
                                    {meta.links && (
                                        <div className="dz-prop-row">
                                            <div className="dz-prop-label">Links</div>
                                            <div className="dz-prop-value dz-links">
                                                {meta.links
                                                    .split(",")
                                                    .map((l) => l.trim())
                                                    .filter(Boolean)
                                                    .map((l, i) => (
                                                        <a
                                                            key={`${l}-${i}`}
                                                            href={l}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {l}
                                                            {i < meta.links.split(",").length - 1 && ", "}
                                                        </a>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    {meta.custom &&
                                        meta.custom
                                            .split("\n")
                                            .filter((l) => l.includes(":"))
                                            .map((l, i) => {
                                                const [k, v] = l.split(/:(.*)/).map((s) => s.trim());
                                                return (
                                                    <div className="dz-prop-row" key={`${k}-${i}`}>
                                                        <div className="dz-prop-label">{k}</div>
                                                        <div className="dz-prop-value">{v}</div>
                                                    </div>
                                                );
                                            })}
                                </>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        saveProps();
                                    }}
                                >
                                    <div className="dz-form-row">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            value={propDraft.status}
                                            onChange={(e) =>
                                                setPropDraft({ ...propDraft, status: e.target.value })
                                            }
                                        >
                                            <option>In Progress</option>
                                            <option>Completed</option>
                                            <option>Draft</option>
                                            <option>Review</option>
                                        </select>
                                    </div>
                                    <div className="dz-form-row">
                                        <label htmlFor="due">Due date</label>
                                        <input
                                            id="due"
                                            type="date"
                                            value={propDraft.due}
                                            onChange={(e) =>
                                                setPropDraft({ ...propDraft, due: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="dz-form-row">
                                        <label htmlFor="priority">Priority</label>
                                        <select
                                            id="priority"
                                            value={propDraft.priority}
                                            onChange={(e) =>
                                                setPropDraft({
                                                    ...propDraft,
                                                    priority: e.target.value,
                                                })
                                            }
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                    <div className="dz-form-row">
                                        <label htmlFor="assignee">Assign to</label>
                                        <input
                                            id="assignee"
                                            type="text"
                                            value={propDraft.assignee}
                                            onChange={(e) =>
                                                setPropDraft({
                                                    ...propDraft,
                                                    assignee: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="dz-form-row">
                                        <label htmlFor="tags">Tags</label>
                                        <input
                                            id="tags"
                                            type="text"
                                            value={propDraft.tags.join(", ")}
                                            onChange={(e) =>
                                                setPropDraft({
                                                    ...propDraft,
                                                    tags: e.target.value
                                                        .split(",")
                                                        .map((t) => t.trim())
                                                        .filter(Boolean),
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="dz-form-row">
                                        <label htmlFor="docnote">Doc note</label>
                                        <textarea
                                            id="docnote"
                                            value={propDraft.docNote}
                                            onChange={(e) =>
                                                setPropDraft({ ...propDraft, docNote: e.target.value })
                                            }
                                            rows={3}
                                            placeholder="Add a persistent note for this document"
                                        />
                                    </div>
                                    <div className="dz-form-row">
                                        <label htmlFor="links">Links</label>
                                        <input
                                            id="links"
                                            type="text"
                                            value={propDraft.links.join(", ")}
                                            onChange={(e) =>
                                                setPropDraft({
                                                    ...propDraft,
                                                    links: e.target.value
                                                        .split(",")
                                                        .map((l) => l.trim())
                                                        .filter(Boolean),
                                                })
                                            }
                                            placeholder="Comma-separated URLs"
                                        />
                                    </div>
                                    <div className="dz-form-row">
                                        <label htmlFor="custom">Custom fields</label>
                                        <textarea
                                            id="custom"
                                            value={propDraft.custom}
                                            onChange={(e) =>
                                                setPropDraft({ ...propDraft, custom: e.target.value })
                                            }
                                            rows={4}
                                            placeholder="Add custom fields: key: value on each line"
                                        />
                                    </div>
                                    <div className="dz-form-actions">
                                        <button type="submit" className="dz-btn">
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="dz-btn-ghost"
                                            onClick={cancelEditProps}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ))}

                        {/* Notes */}
                        <div className="dz-props-head" style={{ marginTop: 12 }}>
                            Notes
                        </div>
                        {ann.notes.length === 0 && (
                            <div className="dz-muted">No notes yet.</div>
                        )}
                        {ann.notes.map((n) => (
                            <div className="dz-note" key={n.id}>
                                <div className="dz-note-text">{n.note}</div>
                                <div className="dz-note-ctx">“{n.text}”</div>
                                <div className="dz-note-meta">
                                    {new Date(n.createdAt || Date.now()).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </aside>
                </>
            )}

            {/* Floating opener (when drawer is closed) */}
            {!propsDrawerOpen && (
                <button
                    className="dz-props-fab"
                    onClick={() => setPropsDrawerOpen(true)}
                    title="Open properties"
                >
                    <PanelRightOpen size={18} />
                    <span>Properties</span>
                </button>
            )}
        </div>
    );
}
