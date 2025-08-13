// src/pages/docStore.js
import {
    doc,
    setDoc,
    onSnapshot,
    arrayUnion,
    serverTimestamp,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../login/firebaseConfig";

function ref(uid, docId) {
    return doc(db, "users", uid, "docs", docId);
}

// Live subscribe; ensure the doc exists the first time
export function listenAnnotations(uid, docId, cb) {
    const r = ref(uid, docId);
    return onSnapshot(r, async (snap) => {
        if (!snap.exists()) {
            await setDoc(
                r,
                { highlights: [], underlines: [], notes: [], createdAt: serverTimestamp() },
                { merge: true }
            );
            cb({ highlights: [], underlines: [], notes: [] });
            return;
        }
        const d = snap.data() || {};
        const withIds = (arr, type) =>
            (arr || []).map((x, i) => ({ id: x.id || `${type}_${i}`, ...x }));
        cb({
            highlights: withIds(d.highlights, "h"),
            underlines: withIds(d.underlines, "u"),
            notes: withIds(d.notes, "n"),
        });
    });
}

// Create/merge using arrayUnion; returns { id }
// NOTE: serverTimestamp() is written to a top-level field (lastWriteAt),
// not inside the arrayUnion payload (that would throw).
export async function addAnnotation(uid, docId, item) {
    const r = ref(uid, docId);
    const id =
        (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2));

    const base = { id, createdAt: Date.now() };

    if (item.type === "highlight") {
        const entry = {
            ...base,
            type: "highlight",
            text: item.text,
            color: item.color || "#fff59d",
            opacity: typeof item.opacity === "number" ? item.opacity : 1,
        };
        await setDoc(
            r,
            { lastWriteAt: serverTimestamp(), highlights: arrayUnion(entry) },
            { merge: true }
        );
    } else if (item.type === "underline") {
        const entry = {
            ...base,
            type: "underline",
            text: item.text,
            color: item.color || "#4f80ff",
            thickness: Number.isFinite(item.thickness) ? item.thickness : 2,
        };
        await setDoc(
            r,
            { lastWriteAt: serverTimestamp(), underlines: arrayUnion(entry) },
            { merge: true }
        );
    } else if (item.type === "note") {
        const entry = {
            ...base,
            type: "note",
            text: item.text,
            note: item.note,
            anchor: item.anchor || null,
        };
        await setDoc(
            r,
            { lastWriteAt: serverTimestamp(), notes: arrayUnion(entry) },
            { merge: true }
        );
    } else {
        throw new Error("Unknown annotation type");
    }

    return { id };
}

// Remove an annotation by id (filter arrays and write back)
export async function removeAnnotation(uid, docId, annId) {
    const r = ref(uid, docId);
    const snap = await getDoc(r);
    if (!snap.exists()) return;
    const d = snap.data() || {};
    const filt = (arr) => (arr || []).filter((x) => x.id !== annId);
    await updateDoc(r, {
        lastWriteAt: serverTimestamp(),
        highlights: filt(d.highlights),
        underlines: filt(d.underlines),
        notes: filt(d.notes),
    });
}
