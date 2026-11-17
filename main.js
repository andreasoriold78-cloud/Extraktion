// Main: Anpassung an die Fenstergröße, die Spielschleife und der Start.

// Passt die Zeichenfläche an die Größe auf dem Bildschirm an, damit das Bild scharf bleibt.
function anpassen() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, einst.sparmodus ? 1 : 1.5);
  const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
  if (!w || !h || (w === canvas.width && h === canvas.height)) return;
  canvas.width = w;
  canvas.height = h;
  skala = w / B;
}

let letzteZeit = performance.now();

function schleife(jetzt) {
  const dt = Math.min((jetzt - letzteZeit) / 1000, 0.05);
  letzteZeit = jetzt;
  if (phase === "spielen" && !pausiert && !einst.sparAuto) { // Läuft das Spiel zu langsam, schaltet es den Sparmodus selbst ein
    fpsSumme += dt; fpsAnzahl++;
    if (fpsAnzahl >= 300) {
      if (fpsSumme / fpsAnzahl > 1 / 35 && !einst.sparmodus) { einst.sparmodus = true; toast = { text: "Sparmodus eingeschaltet, das Spiel lief zu langsam", zeit: 5 }; }
      einst.sparAuto = true;
      speichern();
    }
  }
  anpassen();
  padPollen();
  update(dt);
  draw(jetzt / 1000);
  requestAnimationFrame(schleife);
}
laden();
startLevel(0);
phase = "intro"; // Das Spiel beginnt mit dem Intro
requestAnimationFrame(schleife);
// Offline-Fähigkeit: Der Service Worker speichert die Dateien (nur auf GitHub Pages oder lokal)
if ("serviceWorker" in navigator && (location.hostname.endsWith("github.io") || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
