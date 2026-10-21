// Keeps uploaded photos, PDFs and voice notes private.
//
// The database keeps the plain file address. Whenever the server SENDS an
// address to a logged-in user, this swaps it for a temporary link (valid for
// 1 hour). Whenever the app SENDS an address back (for example when a post is
// edited), the temporary part is removed again, so only the plain address is
// ever stored. The S3 bucket itself can then be fully locked.
//
// Switch off (instant rollback, no code change): set PRIVATE_FILES=off in .env.

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

const enabled = Boolean(BUCKET && REGION && process.env.PRIVATE_FILES !== "off");

const LINK_SECONDS = 60 * 60;           // how long a temporary link works
const REUSE_MS = 30 * 60 * 1000;        // reuse the same link for 30 minutes

const s3 = enabled ? new S3Client({ region: REGION }) : null;

const HOST = enabled ? `${BUCKET}.s3.${REGION}.amazonaws.com` : "";
const HOST_RE = HOST.replace(/[.\-]/g, "\\$&");

// https://bucket.s3.region.amazonaws.com/<file>  (+ an old temporary part, if any)
const URL_RE = enabled
    ? new RegExp(`https://${HOST_RE}/([A-Za-z0-9._~%\\-]+)(?:\\?[^\\s"\\\\]*)?`, "g")
    : null;

const cache = new Map(); // file -> { url, at }

async function linkFor(key) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < REUSE_MS) return hit.url;
    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: key }),
        { expiresIn: LINK_SECONDS }
    );
    if (cache.size > 5000) cache.clear();
    cache.set(key, { url, at: Date.now() });
    return url;
}

async function signText(text) {
    const keys = new Set();
    for (const m of text.matchAll(URL_RE)) keys.add(m[1]);
    if (!keys.size) return text;
    const links = new Map();
    await Promise.all([...keys].map(async (k) => links.set(k, await linkFor(k))));
    return text.replace(URL_RE, (all, key) => links.get(key) || all);
}

/** Outgoing: replace plain file addresses with temporary links. */
function signResponses(req, res, next) {
    if (!enabled) return next();
    const original = res.json.bind(res);
    res.json = (body) => {
        let text;
        try {
            text = JSON.stringify(body);
        } catch {
            return original(body);
        }
        if (typeof text !== "string" || !text.includes(HOST)) return original(body);
        signText(text)
            .then((out) => {
                res.set("Content-Type", "application/json; charset=utf-8");
                res.send(out);
            })
            .catch((err) => {
                console.error("private files: could not sign links:", err.message);
                original(body);
            });
        return res;
    };
    return next();
}

function strip(value, depth) {
    if (typeof value === "string") {
        return value.includes(HOST) ? value.replace(URL_RE, (all, key) => `https://${HOST}/${key}`) : value;
    }
    if (depth > 8 || value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map((v) => strip(v, depth + 1));
    const out = {};
    for (const k of Object.keys(value)) out[k] = strip(value[k], depth + 1);
    return out;
}

/** Incoming: remove the temporary part so only the plain address is saved. */
function unsignRequests(req, res, next) {
    if (enabled && req.body && typeof req.body === "object") {
        req.body = strip(req.body, 0);
    }
    next();
}

module.exports = { signResponses, unsignRequests, enabled };
