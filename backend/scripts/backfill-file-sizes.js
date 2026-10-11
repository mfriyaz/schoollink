/**
 * One-time (safe to re-run) backfill of file sizes per school.
 *
 * Finds every file link stored in the database (homework photos,
 * voice notes, attachments, submissions, greetings, announcement
 * images, school logos), looks up the real size in S3 (or on the
 * server disk), and records it in uploaded_files.
 *
 * Run on the server:
 *   docker exec schoollink-backend node scripts/backfill-file-sizes.js
 *
 * Needs read access to the bucket's file list (s3:ListBucket).
 * Files that are already tracked are skipped.
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const pool = require("../src/config/database");
const { kindOf } = require("../src/services/fileUsage.service");

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

const URL_QUERIES = [
    // announcements: school_id on the row
    `SELECT a.school_id, unnest(a.image_urls) AS url FROM announcements a WHERE a.image_urls IS NOT NULL`,
    // homework: school via teacher_subjects
    `SELECT ts.school_id, unnest(h.image_urls) AS url FROM homework h JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id WHERE h.image_urls IS NOT NULL`,
    `SELECT ts.school_id, h.attachment_url AS url FROM homework h JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id WHERE h.attachment_url IS NOT NULL`,
    `SELECT ts.school_id, h.voice_note_url AS url FROM homework h JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id WHERE h.voice_note_url IS NOT NULL`,
    // submissions: school via the student
    `SELECT st.school_id, unnest(hs.photo_urls) AS url FROM homework_submissions hs JOIN students st ON st.id = hs.student_id WHERE hs.photo_urls IS NOT NULL`,
    `SELECT st.school_id, hs.voice_url AS url FROM homework_submissions hs JOIN students st ON st.id = hs.student_id WHERE hs.voice_url IS NOT NULL`,
    // morning greetings: school via the student
    `SELECT st.school_id, mg.voice_url AS url FROM morning_greetings mg JOIN students st ON st.id = mg.student_id WHERE mg.voice_url IS NOT NULL`,
    // school logos
    `SELECT s.id AS school_id, s.logo_url AS url FROM schools s WHERE s.logo_url IS NOT NULL`
];

function keyOf(url) {

    try {

        const clean = String(url).split("?")[0];

        return decodeURIComponent(clean.substring(clean.lastIndexOf("/") + 1));

    } catch {

        return null;

    }

}

async function loadS3Sizes() {

    const client = new S3Client({ region: REGION });

    const sizes = new Map();

    let token;

    do {

        const res = await client.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            ContinuationToken: token
        }));

        for (const o of res.Contents || []) {

            sizes.set(o.Key.substring(o.Key.lastIndexOf("/") + 1), { bytes: Number(o.Size), at: o.LastModified });

        }

        token = res.IsTruncated ? res.NextContinuationToken : undefined;

    } while (token);

    return sizes;

}

function localSize(key) {

    try {

        const stat = fs.statSync(path.join(__dirname, "..", "uploads", key));

        return { bytes: stat.size, at: stat.mtime };

    } catch {

        return null;

    }

}

async function main() {

    const useS3 = Boolean(BUCKET && REGION);

    console.log(useS3 ? `Reading file sizes from S3 bucket ${BUCKET} ...` : "Reading file sizes from the local uploads folder ...");

    const s3Sizes = useS3 ? await loadS3Sizes() : null;

    if (useS3) console.log(`Found ${s3Sizes.size} files in the bucket.`);

    // url -> { school_id }
    const found = new Map();

    for (const q of URL_QUERIES) {

        const rows = (await pool.query(q)).rows;

        for (const r of rows) {

            if (r.url && !found.has(r.url)) found.set(r.url, r.school_id);

        }

    }

    console.log(`Found ${found.size} file links in the database.`);

    let added = 0, missing = 0, already = 0;

    for (const [url, schoolId] of found) {

        const key = keyOf(url);

        const info = key ? (useS3 ? s3Sizes.get(key) : localSize(key)) : null;

        if (!info) { missing++; continue; }

        const result = await pool.query(
            `
            INSERT INTO uploaded_files (school_id, url, filename, kind, bytes, source, created_at)
            VALUES ($1, $2, $3, $4, $5, 'backfill', $6)
            ON CONFLICT (url) DO NOTHING
            `,
            [schoolId, url, key, kindOf(null, key), info.bytes, info.at || new Date()]
        );

        if (result.rowCount) added++; else already++;

    }

    console.log(`Added ${added}, already tracked ${already}, not found in storage ${missing}.`);

    const summary = await pool.query(`
        SELECT s.school_name, COUNT(f.*)::int AS files,
               ROUND(COALESCE(SUM(f.bytes), 0) / 1048576.0, 1) AS mb
        FROM schools s LEFT JOIN uploaded_files f ON f.school_id = s.id
        GROUP BY s.id ORDER BY 3 DESC
    `);

    console.table(summary.rows);

    await pool.end();

}

main().catch((err) => {

    console.error("Backfill failed:", err.message);

    if (/AccessDenied|not authorized/i.test(err.message)) {

        console.error("The server's AWS role needs the s3:ListBucket permission on the bucket.");

    }

    process.exit(1);

});
