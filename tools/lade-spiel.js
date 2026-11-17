// Lädt das Spiel ohne Browser, damit Tests und der Balancing-Bot es steuern können.
// Alle Browser-Teile (Zeichenfläche, Audio, Speicher) sind durch Attrappen ersetzt.
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function ladeSpiel(pfad) {
  const noop = () => {};
  global.listeners = {}; global.frames = []; global.timers = [];
  const ctx = new Proxy({}, { get: (t, k) => k === "createRadialGradient" ? () => ({ addColorStop: noop }) : (k in t ? t[k] : noop), set: (t, k, v) => { t[k] = v; return true; } });
  const leinwand = { width: 800, height: 500, getContext: () => ctx, addEventListener: (n, f) => { listeners["c" + n] = f; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 500 }) };
  const p = () => ({ value: 0, setValueAtTime: noop, exponentialRampToValueAtTime: noop });
  global.window = { addEventListener: (n, f) => { listeners[n] = f; }, AudioContext: undefined };
  global.document = { getElementById: () => leinwand, addEventListener: noop, hidden: false };
  global.performance = { now: () => 0 };
  global.requestAnimationFrame = (f) => frames.push(f);
  global.setInterval = (f) => { timers.push(f); return 1; };
  global.localStorage = { getItem() { throw new Error("kein Speicher"); }, setItem() { throw new Error("kein Speicher"); } };

  const datei = fs.statSync(pfad).isDirectory() ? path.join(pfad, "index.html") : pfad;
  const html = fs.readFileSync(datei, "utf8");
  const skripte = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  if (skripte.length) { // Projekt mit mehreren Dateien
    for (const f of skripte) vm.runInThisContext(fs.readFileSync(path.join(path.dirname(datei), f), "utf8"), { filename: f });
  } else { // Einzeldatei mit eingebettetem Skript
    const a = html.indexOf("<script>") + 8, b = html.indexOf("</script>", a);
    vm.runInThisContext(html.slice(a, b), { filename: "spiel" });
  }
  return { fuehreAus: (code) => vm.runInThisContext(code) };
}
module.exports = { ladeSpiel };
