// Menü: Levelauswahl, Einstellungen, Erfolge und Shop (Logik, nicht das Zeichnen).

// Menü: links die Level, rechts die Einstellungen.
const SEITEN = Math.ceil(levels.length / 10);

function seiteWechseln(d) { seite = (seite + d + SEITEN) % SEITEN; auswahl = 2; klang.tick(); }

function menuePunkte() {
  const liste = [
    { art: "seite", d: -1, x: 40, y: 78, b: 60, h: 24 },
    { art: "seite", d: 1, x: 380, y: 78, b: 60, h: 24 }
  ];
  for (let k = 0; k < 10; k++) {
    const i = seite * 10 + k;
    if (i < levels.length) liste.push({ art: "level", i, x: 40, y: 108 + k * 35, b: 400, h: 31 });
  }
  ["endlos", "tages", "shopknopf", "erfolge", "optionen", "intro", "outro"].forEach((k, i) => liste.push({ art: "aktion", k, x: 470, y: 108 + i * 46, b: 290, h: 38 }));
  return liste;
}

function menueAktion(nr) {
  const p = menuePunkte()[nr];
  if (p.art === "seite") { seiteWechseln(p.d); return; }
  if (p.art === "level") {
    if (p.i >= freigeschaltet) { klang.gesperrt(); return; }
    tode = 0; gesamtZeit = 0; klang.start();
    modus = "level";
    startLevel(p.i);
    return;
  }
  klang.start();
  if (p.k === "endlos") { modus = "endlos"; tode = 0; gesamtZeit = 0; startLevel(0); }
  else if (p.k === "tages") { modus = "tages"; tode = 0; gesamtZeit = 0; startLevel(tagesLevel()); }
  else if (p.k === "shopknopf") { phase = "shop"; auswahl = 0; }
  else if (p.k === "erfolge") { phase = "erfolge"; auswahl = 0; }
  else if (p.k === "optionen") { phase = "optionen"; auswahl = 0; }
  else { szeneZeit = 0; phase = p.k; } // Intro oder Outro ansehen
}

// Einstellungen: Lautstärken, Schwierigkeit, Farbenblind-Modus, Touch-Steuerung
function optPunkte() {
  return ["volSound", "volMusik", "schwer", "farbenblind", "touch", "zurueck"].map((k, i) => ({ art: "opt", k, x: 180, y: 110 + i * 52, b: 440, h: 42 }));
}

function optAktion(nr, d) {
  const p = optPunkte()[nr];
  if (p.k === "zurueck") { phase = "menue"; auswahl = 0; klang.start(); return; }
  if (p.k === "volSound" || p.k === "volMusik") einst[p.k] = Math.round(((einst[p.k] + 0.1 * d + 1.1) % 1.1) * 10) / 10; // 0 bis 100 Prozent
  else if (p.k === "schwer") einst.schwer = (einst.schwer + d + 3) % 3;
  else einst[p.k] = !einst[p.k];
  speichern();
  klang.start();
}

function erfolgePunkte() {
  return erfolgeListe.map((e, i) => ({ art: "erfolg", e, x: 40 + (i % 2) * 380, y: 100 + Math.floor(i / 2) * 44, b: 360, h: 38 }));
}

// Findet den nächsten Eintrag in einer Richtung (für die Pfeiltasten im Shop)
function nachbar(liste, i, dx, dy) {
  const a = liste[i];
  let best = -1, bd = 1e9;
  liste.forEach((p, j) => {
    if (j === i) return;
    const vx = (p.x + p.b / 2) - (a.x + a.b / 2), vy = (p.y + p.h / 2) - (a.y + a.h / 2);
    if (dx * vx + dy * vy <= 0) return;
    const d = Math.abs(dx * vx + dy * vy) + (dx ? Math.abs(vy) : Math.abs(vx)) * 3;
    if (d < bd) { bd = d; best = j; }
  });
  return best >= 0 ? best : i;
}

function shopPunkte() {
  const liste = [];
  upgrades.forEach((u, i) => liste.push({ art: "up", u, x: 40, y: 100 + i * 58, b: 300, h: 48 }));
  skinListe.forEach((sk, k) => liste.push({ art: "skin", s: sk, x: 360 + (k % 2) * 200, y: 100 + Math.floor(k / 2) * 44, b: 190, h: 38 }));
  liste.push({ art: "zurueck", x: 40, y: 400, b: 300, h: 38 });
  return liste;
}

function shopAktion(nr) {
  const p = shopPunkte()[nr];
  if (p.art === "zurueck") { phase = "menue"; auswahl = 0; klang.start(); return; }
  if (p.art === "up") {
    const stufe = shop[p.u.id];
    if (stufe >= p.u.preise.length || muenzen < p.u.preise[stufe]) { klang.gesperrt(); return; }
    muenzen -= p.u.preise[stufe];
    shop[p.u.id]++;
    klang.kauf(); stats.kaeufe++; erfolgePruefen();
  } else if (skinsBesitz.includes(p.s.id)) {
    skinAktiv = p.s.id;
    klang.start();
  } else if (muenzen >= p.s.preis) {
    muenzen -= p.s.preis;
    skinsBesitz.push(p.s.id);
    skinAktiv = p.s.id;
    klang.kauf(); stats.kaeufe++; erfolgePruefen();
  } else {
    klang.gesperrt();
    return;
  }
  speichern();
}
