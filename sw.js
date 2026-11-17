// Service Worker: speichert das Spiel, damit es offline läuft und als App installierbar ist.
// Wenn du Dateien änderst, erhöhe VERSION, damit Handys die neue Fassung holen.
const VERSION = "v1";
const DATEIEN = ["./", "index.html", "style.css", "grundlage.js", "daten.js", "zustand.js", "audio.js", "spiel.js", "menue.js", "zeichnen.js", "eingabe.js", "main.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(DATEIEN)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((namen) => Promise.all(namen.filter((n) => n !== VERSION).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});
// Erst das Netz (damit Updates ankommen), ohne Netz der Zwischenspeicher
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((antwort) => { const kopie = antwort.clone(); caches.open(VERSION).then((c) => c.put(e.request, kopie)); return antwort; })
      .catch(() => caches.match(e.request))
  );
});
