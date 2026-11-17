// Menü: Levelauswahl, Einstellungen, Klassen, Talente, Erfolge und Shop (Logik, nicht das Zeichnen).

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
  ["endlos", "tages", "klasse", "talente", "shopknopf", "erfolge", "optionen"].forEach((k, i) => liste.push({ art: "aktion", k, x: 470, y: 108 + i * 46, b: 290, h: 38 }));
  return liste;
}

function menueAktion(nr) {
  const p = menuePunkte()[nr];
  if (!p) return;
  if (p.art === "seite") { seiteWechseln(p.d); return; }
  if (p.art === "level") {
    if (p.i >= freigeschaltet) { klang.gesperrt(); return; }
    tode = 0; gesamtZeit = 0; klang.start();
    modus = "level";
    if (!einst.tutorial && p.i === 0) { tutSeite = 0; tutNachStart = true; phase = "tutorial"; return; } // Beim ersten Start: Tutorial
    startLevel(p.i);
    return;
  }
  klang.start();
  if (p.k === "endlos") { modus = "endlos"; tode = 0; gesamtZeit = 0; startLevel(0); }
  else if (p.k === "tages") { modus = "tages"; tode = 0; gesamtZeit = 0; startLevel(tagesLevel()); }
  else if (p.k === "shopknopf") { phase = "shop"; auswahl = 0; }
  else if (p.k === "erfolge") { phase = "erfolge"; auswahl = 0; }
  else if (p.k === "optionen") { phase = "optionen"; auswahl = 0; }
  else if (p.k === "klasse") { phase = "klasse"; auswahl = 0; }
  else if (p.k === "talente") { phase = "talente"; auswahl = 0; }
}

// Einstellungen: Lautstärken, Schwierigkeit, Farbenblind-Modus, Touch-Steuerung
function optPunkte() {
  return ["volSound", "volMusik", "schwer", "farbenblind", "sparmodus", "touch", "tutorial", "intro", "outro", "zurueck"].map((k, i) => ({ art: "opt", k, x: 180, y: 80 + i * 38, b: 440, h: 34 }));
}

function optAktion(nr, d) {
  const p = optPunkte()[nr];
  if (!p) return;
  if (p.k === "zurueck") { phase = "menue"; auswahl = 0; klang.start(); return; }
  if (p.k === "tutorial") { tutSeite = 0; tutNachStart = false; phase = "tutorial"; klang.start(); return; }
  if (p.k === "intro" || p.k === "outro") { szeneZeit = 0; phase = p.k; klang.start(); return; }
  if (p.k === "volSound" || p.k === "volMusik") einst[p.k] = Math.round(((einst[p.k] + 0.1 * d + 1.1) % 1.1) * 10) / 10; // 0 bis 100 Prozent
  else if (p.k === "schwer") einst.schwer = (einst.schwer + d + 3) % 3;
  else einst[p.k] = !einst[p.k];
  speichern();
  klang.start();
}

// Klassen: Einmalig kaufen, danach jederzeit wechseln
function klassePunkte() {
  return klassen.map((k, i) => ({ art: "klasse", k, x: 60 + (i % 2) * 340, y: 110 + Math.floor(i / 2) * 130, b: 320, h: 110 }));
}

function klasseAktion(nr) {
  const p = klassePunkte()[nr];
  if (!p) return;
  if (klassenBesitz.includes(p.k.id)) klasseAktiv = p.k.id;
  else if (muenzen >= p.k.preis) { muenzen -= p.k.preis; klassenBesitz.push(p.k.id); klasseAktiv = p.k.id; klang.kauf(); stats.kaeufe++; erfolgePruefen(); }
  else { klang.gesperrt(); return; }
  klang.start();
  speichern();
}

// Talente: Punkte gibt es für jedes erstmals geschaffte Level und doppelt für Bosse
function talentZeilen() {
  return talentListe.map((t, i) => ({ art: "talent", t, x: 100, y: 110 + i * 78, b: 600, h: 64 }));
}

function talentAktion(nr) {
  const p = talentZeilen()[nr];
  if (!p) return;
  const stufe = talente[p.t.id];
  if (stufe >= 3 || talentPunkte() < stufe + 1) { klang.gesperrt(); return; }
  talente[p.t.id]++;
  klang.kauf();
  speichern();
}

function tutorialWeiter() {
  if (tutSeite < tutSeiten.length - 1) { tutSeite++; klang.tick(); return; }
  einst.tutorial = true;
  speichern();
  if (tutNachStart) { tutNachStart = false; modus = "level"; startLevel(0); }
  else { phase = "menue"; auswahl = 0; }
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
  if (!p) return;
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
