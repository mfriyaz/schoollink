// Simple in-memory protection against repeated wrong passwords.
//  - 5 wrong tries for the same username from the same place -> blocked 15 minutes
//  - 30 wrong tries from the same place (any username)       -> blocked 15 minutes
// A correct login clears that username's counter.
// Counters live in memory, so restarting the backend resets them (fine for now).

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_USER = 5;
const MAX_PER_IP = 30;

const hits = new Map(); // key -> { count, first }

function clientIp(req) {
    // Nginx appends the real address at the END of X-Forwarded-For;
    // anything before it can be faked by the caller, so take the last one.
    const xff = req.headers["x-forwarded-for"];
    if (xff) {
        const parts = String(xff).split(",").map((s) => s.trim()).filter(Boolean);
        if (parts.length) return parts[parts.length - 1];
    }
    return req.ip || req.socket?.remoteAddress || "unknown";
}

function keys(req, identifier) {
    const ip = clientIp(req);
    return {
        userKey: `u:${ip}:${String(identifier || "").trim().toLowerCase()}`,
        ipKey: `i:${ip}`,
    };
}

function live(key) {
    const e = hits.get(key);
    if (!e) return null;
    if (Date.now() - e.first > WINDOW_MS) {
        hits.delete(key);
        return null;
    }
    return e;
}

// Returns minutes to wait if blocked, otherwise 0.
function blockedMinutes(req, identifier) {
    const { userKey, ipKey } = keys(req, identifier);
    const u = live(userKey);
    const i = live(ipKey);
    let wait = 0;
    if (u && u.count >= MAX_PER_USER) wait = Math.max(wait, WINDOW_MS - (Date.now() - u.first));
    if (i && i.count >= MAX_PER_IP) wait = Math.max(wait, WINDOW_MS - (Date.now() - i.first));
    return wait ? Math.ceil(wait / 60000) : 0;
}

function recordFailure(req, identifier) {
    const { userKey, ipKey } = keys(req, identifier);
    for (const k of [userKey, ipKey]) {
        const e = live(k);
        if (e) e.count += 1;
        else hits.set(k, { count: 1, first: Date.now() });
    }
}

function recordSuccess(req, identifier) {
    hits.delete(keys(req, identifier).userKey);
}

// Tidy old entries so memory never grows.
setInterval(() => {
    for (const k of hits.keys()) live(k);
}, 10 * 60 * 1000).unref();

module.exports = { blockedMinutes, recordFailure, recordSuccess };
