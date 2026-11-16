// Main: Anpassung an die Fenstergröße, die Spielschleife und der Start.

// Passt die Zeichenfläche an die Größe auf dem Bildschirm an, damit das Bild scharf bleibt.
function anpassen() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
