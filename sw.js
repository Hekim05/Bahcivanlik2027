/* Çevrimdışı önbellek – uygulama dosyaları önce ağdan, yoksa önbellekten */
const CACHE = "bhc27-v12";
const SHELL = ["./", "index.html", "style.css", "app.js", "data.js", "export.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png"];
const LAZY = ["vendor/docx.umd.js", "vendor/pdfmake.min.js", "vendor/vfs_fonts.js", "vendor/xlsx.mini.min.js", "vendor/xlsx.full.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).then(() => c.addAll(LAZY).catch(() => {}))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Firebase gerçek zamanlı bağlantısına karışma
  if (url.hostname.includes("firebasedatabase.app") || url.hostname.includes("googleapis.com")) return;
  const isVendor = url.pathname.includes("/vendor/") || url.hostname === "www.gstatic.com";
  if (isVendor) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match("index.html"))));
});
