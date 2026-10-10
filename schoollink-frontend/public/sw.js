/* SchoolLink service worker.
 * Deliberately minimal: it makes the app installable and shows a
 * friendly offline page. It never caches API calls or JS/CSS, so
 * users always get the latest deployed version. */

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SchoolLink - offline</title>
<style>body{font-family:system-ui,sans-serif;background:#F8FAFC;color:#0F172A;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center;padding:24px}
h1{font-size:1.3rem;margin:0 0 8px}p{color:#64748B;margin:0 0 20px}
button{background:#2563EB;color:#fff;border:0;border-radius:10px;padding:12px 24px;font-size:1rem}</style></head>
<body><div><h1>You are offline</h1><p>Please check your internet connection and try again.</p>
<button onclick="location.reload()">Try again</button></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {

    const req = event.request;

    // Only handle page navigations; everything else goes straight to network
    if (req.mode !== "navigate") return;

    event.respondWith(
        fetch(req).catch(() =>
            new Response(OFFLINE_HTML, {
                headers: { "Content-Type": "text/html; charset=utf-8" }
            })
        )
    );

});
