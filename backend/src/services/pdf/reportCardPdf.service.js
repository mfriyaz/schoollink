const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Report card PDF (A4, print friendly).
 *
 * reportData: {
 *   school: { school_name, address, city, state, country, postal_code, phone, email, website, logo_url, theme, timezone },
 *   academic_year, student: { name, admission_no, class, section }, exam,
 *   subjects: [{ subject_name, max_marks, pass_marks, marks_obtained, percentage, grade_name, result }],
 *   summary: { total_marks, maximum_marks, percentage }, grades: [{ grade_name, minimum_percentage, maximum_percentage }],
 *   remarks
 * }
 */

// Header colour follows the school's chosen theme
const THEMES = {
    sunshine: { band: "#FFC400", on: "#111827" },
    sky: { band: "#38BDF8", on: "#0F172A" },
    maroon: { band: "#6D0F2B", on: "#FFFFFF" }
};

const INK = "#111827";
const MUTED = "#6B7280";
const LINE = "#D1D5DB";
const ZEBRA = "#F9FAFB";
const GREEN = "#15803D";
const RED = "#B91C1C";

const MARGIN = 40;
const PAGE_BOTTOM = 790;

// Remarks in these scripts need a font that contains them
const SCRIPT_FONTS = [
    { re: /[஀-௿]/, name: "tamil" },
    { re: /[ऀ-ॿ]/, name: "devanagari" },
    { re: /[ഀ-ൿ]/, name: "malayalam" },
    { re: /[ఀ-౿]/, name: "telugu" },
    { re: /[ಀ-೿]/, name: "kannada" },
    { re: /[ঀ-৿]/, name: "bengali" }
];

const FONT_DIR = path.join(__dirname, "..", "..", "assets", "fonts");

function textFont(doc, text) {

    for (const s of SCRIPT_FONTS) {

        if (s.re.test(text)) {

            const file = path.join(FONT_DIR, `NotoSans-${s.name}.woff`);

            if (fs.existsSync(file)) {

                try {
                    doc.registerFont(`ns-${s.name}`, file);
                    return `ns-${s.name}`;
                } catch (e) {
                    return "Helvetica";
                }

            }

        }

    }

    return "Helvetica";

}

// Draws text that may mix a script font (Tamil, Hindi...) with Latin letters and
// punctuation, which the script fonts do not contain.
function drawMixed(doc, text, x, y, width, scriptFont, size) {

    const runs = text.match(/[\u0000-\u024F\u2000-\u206F]+|[^\u0000-\u024F\u2000-\u206F]+/g) || [text];

    runs.forEach((run, i) => {

        const font = /^[\u0000-\u024F\u2000-\u206F]/.test(run) ? "Helvetica" : scriptFont;
        const last = i === runs.length - 1;

        doc.font(font).fontSize(size);

        if (i === 0) {
            doc.text(run, x, y, { width, lineGap: 2, continued: !last });
        } else {
            doc.text(run, { width, lineGap: 2, continued: !last });
        }

    });

}

// Best effort: a school logo is nice to have, never required
async function loadLogo(url) {

    if (!url) return null;

    try {

        if (/^https?:\/\//i.test(url)) {

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);

            try {
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) return null;
                const buf = Buffer.from(await res.arrayBuffer());
                return buf.length < 2 * 1024 * 1024 ? buf : null;
            } finally {
                clearTimeout(timer);
            }

        }

        const local = path.join(process.cwd(), url.replace(/^\/+/, ""));

        if (fs.existsSync(local)) return fs.readFileSync(local);

    } catch (e) { /* ignore */ }

    return null;

}

function fmtDate(tz) {

    try {
        return new Date().toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric", timeZone: tz || "Asia/Singapore"
        });
    } catch (e) {
        return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }

}

function overallGrade(grades, pct) {

    const g = (grades || []).find(
        (x) => pct >= Number(x.minimum_percentage) && pct <= Number(x.maximum_percentage)
    );

    return g ? g.grade_name : "-";

}

async function generateReportCard(reportData, res) {

    const school = reportData.school || { school_name: reportData.school_name };
    const theme = THEMES[school.theme] || THEMES.sunshine;
    const W = 595.28 - MARGIN * 2;

    const logo = await loadLogo(school.logo_url);

    const doc = new PDFDocument({ size: "A4", margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: 10 }, info: { Title: "Student Progress Report" } });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report-card.pdf");

    doc.pipe(res);

    // ---------- Header band ----------
    doc.rect(0, 0, 595.28, 96).fill(theme.band);

    let textX = MARGIN;

    if (logo) {
        try {
            doc.image(logo, MARGIN, 18, { fit: [60, 60], align: "center", valign: "center" });
            textX = MARGIN + 74;
        } catch (e) { /* unsupported image type: skip */ }
    }

    doc.fillColor(theme.on).font("Helvetica-Bold").fontSize(20)
        .text(school.school_name || "School", textX, 24, { width: 595.28 - textX - MARGIN, lineBreak: false, ellipsis: true });

    const addr = [school.address, school.city, school.state, school.postal_code].filter(Boolean).join(", ");
    const contact = [school.phone && `Tel: ${school.phone}`, school.email, school.website].filter(Boolean).join("   |   ");

    doc.font("Helvetica").fontSize(9);
    if (addr) doc.text(addr, textX, 52, { width: 595.28 - textX - MARGIN, lineBreak: false, ellipsis: true });
    if (contact) doc.text(contact, textX, 66, { width: 595.28 - textX - MARGIN, lineBreak: false, ellipsis: true });

    // ---------- Title ----------
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(15)
        .text("STUDENT PROGRESS REPORT", MARGIN, 112, { width: W, align: "center", characterSpacing: 1.5 });

    const sub = [reportData.exam, reportData.academic_year && `Academic Year ${reportData.academic_year}`].filter(Boolean).join("   |   ");

    doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(sub, MARGIN, 133, { width: W, align: "center" });

    // ---------- Student details ----------
    let y = 158;
    const boxH = 62;

    doc.roundedRect(MARGIN, y, W, boxH, 6).lineWidth(0.8).strokeColor(LINE).stroke();

    const half = W / 2;

    const cell = (label, value, x, cy) => {
        doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(label.toUpperCase(), x, cy, { width: half - 24, lineBreak: false });
        doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text(String(value || "-"), x, cy + 11, { width: half - 24, lineBreak: false, ellipsis: true });
    };

    const st = reportData.student;

    cell("Student Name", st.name, MARGIN + 14, y + 10);
    cell("Class / Section", `${st.class || "-"} - ${st.section || "-"}`, MARGIN + half + 6, y + 10);
    cell("Admission No", st.admission_no, MARGIN + 14, y + 36);
    cell("Date Issued", fmtDate(school.timezone), MARGIN + half + 6, y + 36);

    y += boxH + 18;

    // ---------- Marks table ----------
    const cols = [
        { key: "subject", label: "Subject", w: 155, align: "left" },
        { key: "max", label: "Max", w: 55, align: "center" },
        { key: "pass", label: "Pass", w: 55, align: "center" },
        { key: "got", label: "Obtained", w: 70, align: "center" },
        { key: "pct", label: "%", w: 55, align: "center" },
        { key: "grade", label: "Grade", w: 55, align: "center" },
        { key: "result", label: "Result", w: 70, align: "center" }
    ];

    const ROW = 24;

    const drawHeader = () => {
        doc.rect(MARGIN, y, W, ROW).fill(theme.band);
        let x = MARGIN;
        doc.fillColor(theme.on).font("Helvetica-Bold").fontSize(9.5);
        cols.forEach((c) => {
            doc.text(c.label, x + 8, y + 7.5, { width: c.w - 16, align: c.align, lineBreak: false });
            x += c.w;
        });
        y += ROW;
    };

    drawHeader();

    reportData.subjects.forEach((s, i) => {

        if (y + ROW > PAGE_BOTTOM - 40) {
            doc.addPage();
            y = MARGIN;
            drawHeader();
        }

        if (i % 2 === 1) doc.rect(MARGIN, y, W, ROW).fill(ZEBRA);

        const pass = String(s.result).toLowerCase() === "pass";

        const vals = {
            subject: s.subject_name,
            max: Number(s.max_marks),
            pass: s.pass_marks === undefined || s.pass_marks === null ? "-" : Number(s.pass_marks),
            got: Number(s.marks_obtained),
            pct: `${Number(s.percentage)}%`,
            grade: s.grade_name || "-",
            result: s.result
        };

        let x = MARGIN;

        cols.forEach((c) => {
            const isResult = c.key === "result";
            doc.fillColor(isResult ? (pass ? GREEN : RED) : INK)
                .font(isResult || c.key === "subject" || c.key === "grade" ? "Helvetica-Bold" : "Helvetica")
                .fontSize(10)
                .text(String(vals[c.key]), x + 8, y + 7, { width: c.w - 16, align: c.align, lineBreak: false, ellipsis: true });
            x += c.w;
        });

        doc.moveTo(MARGIN, y + ROW).lineTo(MARGIN + W, y + ROW).lineWidth(0.5).strokeColor(LINE).stroke();

        y += ROW;

    });

    y += 16;

    // ---------- Summary tiles ----------
    if (y + 60 > PAGE_BOTTOM - 40) { doc.addPage(); y = MARGIN; }

    const pct = Number(reportData.summary.percentage);
    const allPass = reportData.subjects.every((s) => String(s.result).toLowerCase() === "pass");

    const tiles = [
        { label: "Total Marks", value: `${reportData.summary.total_marks} / ${reportData.summary.maximum_marks}`, color: INK },
        { label: "Percentage", value: `${pct}%`, color: INK },
        { label: "Overall Grade", value: overallGrade(reportData.grades, pct), color: INK },
        { label: "Final Result", value: allPass ? "PASS" : "FAIL", color: allPass ? GREEN : RED }
    ];

    const gap = 8;
    const tw = (W - gap * (tiles.length - 1)) / tiles.length;

    tiles.forEach((t, i) => {
        const tx = MARGIN + i * (tw + gap);
        doc.roundedRect(tx, y, tw, 52, 6).lineWidth(0.8).strokeColor(LINE).stroke();
        doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(t.label.toUpperCase(), tx, y + 9, { width: tw, align: "center", lineBreak: false });
        doc.fillColor(t.color).font("Helvetica-Bold").fontSize(t.value.length > 9 ? 11 : 15).text(t.value, tx, y + 25, { width: tw, align: "center", lineBreak: false });
    });

    y += 52 + 14;

    // ---------- Grading scale ----------
    if (reportData.grades && reportData.grades.length) {

        const scale = reportData.grades
            .map((g) => `${g.grade_name}: ${Number(g.minimum_percentage)}-${Number(g.maximum_percentage)}%`)
            .join("    ");

        doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(8).text("GRADING SCALE", MARGIN, y, { lineBreak: false });
        doc.font("Helvetica").fontSize(8.5).text(scale, MARGIN, y + 11, { width: W });

        y = doc.y + 12;

    }

    // ---------- Remarks ----------
    const remarks = (reportData.remarks || "").trim();
    const remarkFont = remarks ? textFont(doc, remarks) : "Helvetica";

    doc.font(remarkFont).fontSize(10.5);

    const remarksH = remarks
        ? Math.max(54, doc.heightOfString(remarks, { width: W - 28 }) + 38)
        : 66;

    if (y + remarksH + 120 > PAGE_BOTTOM) { doc.addPage(); y = MARGIN; }

    doc.roundedRect(MARGIN, y, W, remarksH, 6).lineWidth(0.8).strokeColor(LINE).stroke();

    doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(8).text("CLASS TEACHER'S REMARKS", MARGIN + 14, y + 10, { lineBreak: false });

    if (remarks) {
        doc.fillColor(INK);

        if (remarkFont === "Helvetica") {
            doc.font("Helvetica").fontSize(10.5).text(remarks, MARGIN + 14, y + 26, { width: W - 28, lineGap: 2 });
        } else {
            drawMixed(doc, remarks, MARGIN + 14, y + 26, W - 28, remarkFont, 10.5);
        }
    }

    y += remarksH + 8;

    // ---------- Signatures ----------
    const sigY = Math.max(y + 46, 700);

    const finalY = sigY > PAGE_BOTTOM - 30 ? (doc.addPage(), MARGIN + 60) : sigY;

    const sw = (W - 40) / 3;

    ["Class Teacher", "Parent / Guardian", "Principal"].forEach((label, i) => {
        const sx = MARGIN + i * (sw + 20);
        doc.moveTo(sx, finalY).lineTo(sx + sw, finalY).lineWidth(0.8).strokeColor(INK).stroke();
        doc.fillColor(INK).font("Helvetica").fontSize(9.5).text(label, sx, finalY + 5, { width: sw, align: "center", lineBreak: false });
    });

    // ---------- Footer ----------
    doc.moveTo(MARGIN, 806).lineTo(MARGIN + W, 806).lineWidth(0.5).strokeColor(LINE).stroke();
    doc.fillColor(MUTED).font("Helvetica").fontSize(7.5)
        .text(`Computer generated report card  |  ${school.school_name || ""}  |  Generated on ${fmtDate(school.timezone)}`, MARGIN, 812, { width: W, align: "center", lineBreak: false });

    doc.end();

}

module.exports = {
    generateReportCard
};
