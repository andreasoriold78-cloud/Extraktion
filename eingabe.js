// Eingabe: Tastatur, Maus, Touch und Gamepad.

const tasten = {};

function taste(e) {
  if (!e.synth) tasten[e.key.toLowerCase()] = true; // Gamepad-Eingaben bleiben nicht hängen
  if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
  tonStarten(); // Browser erlauben Ton erst nach einer Taste oder einem Klick
  const k = e.key.toLowerCase();
  if (k === "m" && !e.repeat) { einst.stumm = !einst.stumm; speichern(); }
  if (k === "e" && phase === "spielen" && !e.repeat) welleStarten();
  if (k === "p" && !e.repeat && phase === "spielen") pausiert = !pausiert;
  if (k === "c" && phase === "geschafft" && modus === "tages") ergebnisKopieren();
  if (k === "f" && !e.repeat) { // Vollbild ein und aus
    if (document.fullscreenElement) document.exitFullscreen();
    else if (rahmen.requestFullscreen) rahmen.requestFullscreen();
  }
  if (k === "escape" && phase !== "menue") { phase = "menue"; auswahl = 0; pausiert = false; }
  if (phase === "menue") {
    const n = menuePunkte().length;
    if (["arrowdown", "arrowup", "arrowright", "arrowleft", "w", "a", "s", "d"].includes(k)) klang.tick();
    if (k === "arrowdown" || k === "s") auswahl = (auswahl + 1) % n;
    if (k === "arrowup" || k === "w") auswahl = (auswahl + n - 1) % n;
    const cur = menuePunkte()[auswahl] || menuePunkte()[0];
    if (k === "q" || k === "pageup") seiteWechseln(-1);
    if (k === "e" || k === "pagedown") seiteWechseln(1);
    if ((k === "arrowright" || k === "d") && cur.x < 400) auswahl = menuePunkte().findIndex((p) => p.x > 400);
    if ((k === "arrowleft" || k === "a") && cur.x > 400) auswahl = 2;
    if ((k === " " || k === "enter") && !e.repeat) menueAktion(auswahl);
  } else if (phase === "optionen") {
    const dir = { arrowdown: [0, 1], s: [0, 1], arrowup: [0, -1], w: [0, -1], arrowright: [1, 0], d: [1, 0], arrowleft: [-1, 0], a: [-1, 0] }[k];
    if (dir && dir[0] === 0) { auswahl = nachbar(optPunkte(), auswahl, dir[0], dir[1]); klang.tick(); }
    else if (dir) optAktion(auswahl, dir[0]);
    if ((k === " " || k === "enter") && !e.repeat) optAktion(auswahl, 1);
  } else if (phase === "erfolge") {
    const dir = { arrowdown: [0, 1], s: [0, 1], arrowup: [0, -1], w: [0, -1], arrowright: [1, 0], d: [1, 0], arrowleft: [-1, 0], a: [-1, 0] }[k];
    if (dir) { auswahl = nachbar(erfolgePunkte(), auswahl, dir[0], dir[1]); klang.tick(); }
  } else if (phase === "shop") {
    const dir = { arrowdown: [0, 1], s: [0, 1], arrowup: [0, -1], w: [0, -1], arrowright: [1, 0], d: [1, 0], arrowleft: [-1, 0], a: [-1, 0] }[k];
    if (dir) { auswahl = nachbar(shopPunkte(), auswahl, dir[0], dir[1]); klang.tick(); }
    if ((k === " " || k === "enter") && !e.repeat) shopAktion(auswahl);
  } else if (k === " " && !e.repeat) {
    if (phase === "verloren") startLevel(lvl);
    else if (phase === "geschafft") weiterNachLevel();
    else if (phase === "intro" || phase === "outro") { phase = "menue"; auswahl = 0; }
  }
  if (e.key === "Shift" && !e.repeat && phase === "spielen" && dashPause <= 0) {
    dashZeit = 0.15;
    klang.dash();
    dashPause = 1.2;
  }
}
window.addEventListener("keydown", taste);
window.addEventListener("keyup", (e) => { tasten[e.key.toLowerCase()] = false; });

// Vollbild per Knopf (vor allem fürs Handy) und automatische Pause, wenn der Tab nicht sichtbar ist
function vollbildUmschalten() {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (rahmen.requestFullscreen) rahmen.requestFullscreen();
}
document.getElementById("vollbild").addEventListener("click", vollbildUmschalten);
document.addEventListener("visibilitychange", () => { if (document.hidden && phase === "spielen") pausiert = true; });

function weiterNachLevel() {
  if (modus === "level") startLevel(lvl + 1);
  else { phase = "menue"; auswahl = 0; }
}

function ergebnisKopieren() {
  const text = "Extraktion Tageschallenge " + tagKey + ": " + zeitImLevel.toFixed(1) + " s";
  try { navigator.clipboard.writeText(text).then(() => { toast = { text: "Ergebnis kopiert", zeit: 2.5 }; }, () => { toast = { text, zeit: 6 }; }); }
  catch (err) { toast = { text, zeit: 6 }; }
}

// Menüs per Maus oder Fingertipp
const MENUEPHASEN = ["menue", "shop", "optionen", "erfolge"];

function aktuelleListe() {
  return phase === "shop" ? shopPunkte() : phase === "optionen" ? optPunkte() : phase === "erfolge" ? erfolgePunkte() : menuePunkte();
}

function aktionAusfuehren(nr) {
  if (phase === "shop") shopAktion(nr);
  else if (phase === "optionen") optAktion(nr, 1);
  else if (phase === "menue") menueAktion(nr);
}

function logisch(t) { // Bildschirmposition in Spielkoordinaten (800 x 500) umrechnen
  const r = canvas.getBoundingClientRect();
  return { x: (t.clientX - r.left) * B / r.width, y: (t.clientY - r.top) * H / r.height };
}

function menueTreffer(e) {
  const q = logisch(e);
  return aktuelleListe().findIndex((p) => q.x >= p.x && q.x <= p.x + p.b && q.y >= p.y && q.y <= p.y + p.h);
}
canvas.addEventListener("mousemove", (e) => {
  if (!MENUEPHASEN.includes(phase)) return;
  const n = menueTreffer(e);
  if (n >= 0) auswahl = n;
});
canvas.addEventListener("click", (e) => {
  tonStarten();
  if (phase === "intro" || phase === "outro") { phase = "menue"; auswahl = 0; return; } // Klick überspringt
  if (phase === "verloren") { startLevel(lvl); return; }
  if (phase === "geschafft") { weiterNachLevel(); return; }
  if (!MENUEPHASEN.includes(phase)) return;
  const n = menueTreffer(e);
  if (n >= 0) { auswahl = n; aktionAusfuehren(n); }
});

// Touch: links ziehen steuert, rechts sind die Knöpfe
const stick = { id: null, x0: 0, y0: 0, x: 0, y: 0 };

const tasteKnoepfe = () => [
  { k: "dash", x: B - 75, y: H - 75, r: 40 },
  { k: "welle", x: B - 165, y: H - 60, r: 30 },
  { k: "pause", x: B / 2, y: 26, r: 20 }
];

function knopfAktion(k) {
  if (phase !== "spielen") return;
  if (k === "pause") pausiert = !pausiert;
  else if (pausiert) return;
  else if (k === "welle") welleStarten();
  else if (k === "dash" && dashPause <= 0) { dashZeit = 0.15; dashPause = 1.2; klang.dash(); }
}

function stickBerechnen() {
  const dx = stick.x - stick.x0, dy = stick.y - stick.y0, l = Math.hypot(dx, dy);
  analogX = l > 8 ? dx / l * Math.min(1, l / 55) : 0;
  analogY = l > 8 ? dy / l * Math.min(1, l / 55) : 0;
}

function touchBeginn(e) {
  if (!einst.touch) { einst.touch = true; speichern(); } // Ab dem ersten Fingertipp zeigen wir die Touch-Knöpfe
  tonStarten();
  if (phase !== "spielen") return; // Menüs laufen über den Klick
  e.preventDefault();
  for (const t of e.changedTouches) {
    const q = logisch(t);
    const knopf = tasteKnoepfe().find((b) => Math.hypot(q.x - b.x, q.y - b.y) < b.r + 10);
    if (knopf) { knopfAktion(knopf.k); continue; }
    if (pausiert) { pausiert = false; continue; }
    if (q.x < B * 0.55 && stick.id === null) { stick.id = t.identifier; stick.x0 = stick.x = q.x; stick.y0 = stick.y = q.y; }
  }
}

function touchBewegung(e) {
  if (stick.id === null) return;
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === stick.id) { const q = logisch(t); stick.x = q.x; stick.y = q.y; }
  stickBerechnen();
}

function touchEnde(e) {
  for (const t of e.changedTouches) if (t.identifier === stick.id) { stick.id = null; analogX = 0; analogY = 0; }
}
canvas.addEventListener("touchstart", touchBeginn, { passive: false });
canvas.addEventListener("touchmove", touchBewegung, { passive: false });
canvas.addEventListener("touchend", touchEnde);
canvas.addEventListener("touchcancel", touchEnde);

// Gamepad: Stick oder Steuerkreuz bewegt, A = Dash, X oder B = Schockwelle, Start = Pause
let padAlt = {};

function padPollen() {
  const liste = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = Array.from(liste || []).find((x) => x && x.connected);
  if (!gp) { padX = 0; padY = 0; return; }
  const knopf = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const neu = (i) => knopf(i) && !padAlt[i];
  let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  if (Math.hypot(ax, ay) < 0.2) { ax = 0; ay = 0; }
  if (knopf(14)) ax = -1;
  if (knopf(15)) ax = 1;
  if (knopf(12)) ay = -1;
  if (knopf(13)) ay = 1;
  padX = ax; padY = ay;
  const sende = (k) => taste({ key: k, repeat: false, synth: true, preventDefault() {} });
  if (phase === "spielen") {
    if (neu(0) || neu(5) || neu(7)) knopfAktion("dash");
    if (neu(1) || neu(2)) knopfAktion("welle");
    if (neu(9)) pausiert = !pausiert;
  } else {
    if (neu(12)) sende("arrowup");
    if (neu(13)) sende("arrowdown");
    if (neu(14)) sende("arrowleft");
    if (neu(15)) sende("arrowright");
    if (neu(0)) sende(" ");
    if (neu(1) || neu(9)) sende("escape");
  }
  for (let i = 0; i < 16; i++) padAlt[i] = knopf(i);
}
