// One-time colour migration: turns the fixed blue/indigo colours used in the
// pages into theme variables, so the School Admin's theme choice (Settings ->
// Appearance) recolours every screen.
//
// Run from the repo root:   node scripts/apply-theme-colors.mjs
// Safe to run more than once.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "schoollink-frontend/src";

// old blue / indigo shades -> theme variable
const MAP = {
    "#2563EB": "primary", "#4F46E5": "primary",
    "#1D4ED8": "primary-dark", "#4338CA": "primary-dark", "#1E40AF": "primary-dark", "#3730A3": "primary-dark",
    "#3B82F6": "primary-light", "#6366F1": "primary-light", "#60A5FA": "primary-light", "#818CF8": "primary-light",
    "#93C5FD": "primary-light", "#A5B4FC": "primary-light",
    "#BFDBFE": "soft2", "#C7D2FE": "soft2",
    "#DBEAFE": "soft", "#E0E7FF": "soft", "#EFF6FF": "soft", "#EEF2FF": "soft",
    "#1E3A8A": "ink", "#312E81": "ink", "#1E1B4B": "ink", "#0F172A": "ink", "#3B5A9A": "primary-dark", "#5B5BA8": "primary-dark"
};

const hexRe = new RegExp("#(" + Object.keys(MAP).map((k) => k.slice(1)).join("|") + ")([0-9A-Fa-f]{2})?(?![0-9A-Fa-f])", "gi");

// rgba(37,99,235,.2) / rgba(79,70,229,.2)
const rgbaRe = /rgba\(\s*(?:37\s*,\s*99\s*,\s*235|79\s*,\s*70\s*,\s*229)\s*,\s*([\d.]+)\s*\)/gi;

// Files that define the themes themselves are left alone
const SKIP = ["theme/themes.js", "theme/theme.js", "layouts/Sidebar.jsx", "components/Layout/Sidebar.jsx", "layouts/BottomNav.jsx"];

let files = 0, hits = 0;

function walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) { walk(p); continue; }
        if (![".jsx", ".js"].includes(extname(p))) continue;
        if (SKIP.some((s) => p.replace(/\\/g, "/").endsWith(s))) continue;
        const before = readFileSync(p, "utf8");
        const after = before
            .replace(hexRe, (m, hex, alpha) => {
                hits++;
                const v = MAP["#" + hex.toUpperCase()];
                if (!alpha) return `var(--sl-${v})`;
                const pct = Math.round((parseInt(alpha, 16) / 255) * 100);
                return `color-mix(in srgb, var(--sl-${v}) ${pct}%, transparent)`;
            })
            // flat two-colour gradients become primary -> darker primary
            .replace(/var\(--sl-primary\)\s*,\s*var\(--sl-primary\)/g, "var(--sl-primary),var(--sl-primary-dark)")
            .replace(rgbaRe, (m, a) => {
                hits++;
                const pct = Math.round(parseFloat(a.startsWith(".") ? "0" + a : a) * 100);
                return `color-mix(in srgb, var(--sl-primary) ${pct}%, transparent)`;
            });
        if (after !== before) { writeFileSync(p, after); files++; }
    }
}

walk(ROOT);
console.log(`Updated ${hits} colours in ${files} files.`);
