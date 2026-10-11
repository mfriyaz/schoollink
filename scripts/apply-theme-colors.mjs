// One-time colour migration for the new SchoolLink theme.
// Run from the repo root:  node scripts/apply-theme-colors.mjs
// Safe to run twice (it only swaps the old blue palette for the new indigo one).
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "schoollink-frontend/src";

const MAP = {
    "#2563EB": "#4F46E5", "#1D4ED8": "#4338CA", "#1E40AF": "#3730A3", "#3B82F6": "#6366F1",
    "#60A5FA": "#818CF8", "#93C5FD": "#A5B4FC", "#BFDBFE": "#C7D2FE", "#DBEAFE": "#E0E7FF",
    "#EFF6FF": "#EEF2FF", "#1E3A8A": "#312E81", "#3B5A9A": "#5B5BA8", "#0F172A": "#1E1B4B",
    "rgba(37,99,235": "rgba(79,70,229"
};

const re = new RegExp(Object.keys(MAP).map((k) => k.replace(/[()]/g, "\\$&")).join("|"), "gi");

let files = 0, hits = 0;

function walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) { walk(p); continue; }
        if (![".jsx", ".js", ".css"].includes(extname(p))) continue;
        const before = readFileSync(p, "utf8");
        const after = before.replace(re, (m) => { hits++; return MAP[m.toUpperCase()] ?? MAP[m] ?? m; });
        if (after !== before) { writeFileSync(p, after); files++; }
    }
}

walk(ROOT);
console.log(`Updated ${hits} colours in ${files} files.`);
