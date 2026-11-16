// Daten: Level, Gegnertypen, Hintergründe, Shop-Upgrades, Skins und Erfolge.
// Hier änderst du Zahlen und Texte, ohne die Spielregeln anzufassen.

// Level als Daten: Ein neues Level ist einfach ein neuer Eintrag in dieser Liste.
// Level als Daten. Die Zahlen, die langsam schwieriger werden, berechnet grund(i) selbst.
// Alles andere (Gegnertypen, Zone, Minen, Dunkelheit, Hintergrund) steht pro Level in der Liste.
const grund = (i) => i < 10 ? ({
  ziel: 50 + i * 10, abstand: 2.8 - i * 0.1, tempo: 0.7 + i * 0.04,
  maxGegner: 5 + Math.round(i * 0.7), beuteLeben: Math.round(12 - i * 0.3)
}) : ({ // Ab Level 11 steigt alles nur noch ganz langsam und hat eine Obergrenze
  ziel: Math.min(260, 140 + (i - 9) * 2), abstand: Math.max(1.0, 1.9 - (i - 9) * 0.01),
  tempo: Math.min(1.5, 1.06 + (i - 9) * 0.005), maxGegner: Math.min(16, 11 + Math.floor((i - 9) / 10)),
  beuteLeben: Math.max(7, 9 - Math.floor((i - 9) / 25))
});

const levelListe = [
  { name: "Aufwärmen",       typen: ["normal"], extraktion: false, bg: 0, hinweis: "Sammle 5 Beutestücke und weiche den Gegnern aus." },
  { name: "Die Zone",        typen: ["normal"], extraktion: true,  bg: 1, hinweis: "Neu: Bring die Beute in der blauen Zone in Sicherheit." },
  { name: "Dicke Brocken",   typen: ["normal", "dick"], extraktion: true, bg: 2, hinweis: "Neu: Große lila Brocken. Sie sind langsam, aber nehmen Platz weg." },
  { name: "Wandernde Zone",  typen: ["normal", "dick"], extraktion: true, wandert: true, bg: 3, hinweis: "Neu: Die Zone wandert nach jeder Extraktion." },
  { name: "Springer",        typen: ["normal", "dick", "springer"], extraktion: true, wandert: true, bg: 4, hinweis: "Neu: Weiße Springer machen kurze, schnelle Sätze. Achte auf den Ring." },
  { name: "Schnelle Jäger", typen: ["normal", "schnell", "springer", "schuetze"], extraktion: true, wandert: true, bg: 5, hinweis: "Neu: Pinke Jäger und orange Schützen, die auf dich feuern." },
  { name: "Dunkelheit",      typen: ["normal", "dick", "schnell"], extraktion: true, wandert: true, dunkel: true, bg: 6, hinweis: "Neu: Du siehst nur noch in deiner Umgebung." },
  { name: "Sperrfeuer", typen: ["normal", "springer", "splitter"], extraktion: true, wandert: true, minen: 4.2, bg: 7, hinweis: "Neu: Minen explodieren nach kurzer Zeit. Grüne Splitter zerfallen." },
  { name: "Chaos", typen: ["normal", "dick", "schnell", "springer", "teleporter"], extraktion: true, wandert: true, minen: 5, bg: 8, hinweis: "Neu: Lila Teleporter. Dazu alles zusammen, behalte den Überblick." },
  { name: "Finale",          typen: ["normal", "dick", "schnell", "springer"], extraktion: true, wandert: true, minen: 4.5, bg: 9, hinweis: "Das Finale: Komm lebend raus." }
];

// 99 Level: Die zehn handgemachten wiederholen sich als "Runden", jede Runde etwas schwerer.
// Ab Runde 3 kommen Geister dazu, Level 99 ist das große Finale.
const bossNamen = ["Wächter", "Schwarm", "Spiral", "Jäger", "Wirbel", "Koloss", "Phantom", "Titan", "Overlord"];

const levels = [];
for (let i = 0; i < 99; i++) {
  const basis = levelListe[i % 10];
  const runde = Math.floor(i / 10);
  const l = Object.assign({}, basis);
  if (i >= 10) {
    l.name = basis.name + " " + (runde + 1);
    l.hinweis = "Runde " + (runde + 1) + ": " + basis.hinweis.replace("Neu: ", "");
    l.extraktion = true;
    if (runde >= 2 && l.typen.length >= 3) l.typen = l.typen.concat("geist");
  }
  if (i === 98) Object.assign(l, { name: "Das große Finale", typen: ["normal", "dick", "schnell", "springer", "geist"], minen: 3.5, wandert: true, hinweis: "Das letzte Level. Zeig, was du kannst." });
  // Ab Runde 2 bringen manche Level eine neue Mechanik: Teleporter-Pads, Wind oder Walzen
  if (i >= 10) {
    if (i % 10 === 2) l.pads = true;
    if (i % 10 === 3) l.wind = true;
    if (i % 10 === 4) l.walzen = 2 + Math.floor(runde / 3);
  }
  const c = Object.assign(grund(i), l);
  if (i % 10 === 9 || i === 98) { // Bosslevel: Sammle Energiekerne, um den Boss zu schwächen
    const nr = i === 98 ? 9 : Math.floor(i / 10) + 1;
    Object.assign(c, { boss: nr, name: i === 98 ? "Das große Finale" : "Boss: " + bossNamen[nr - 1], extraktion: false, wandert: false, minen: 0, dunkel: false, pads: false, wind: false, walzen: 0, maxGegner: 4, abstand: 3.2, ziel: 100 + nr * 10 });
    c.hinweis = "Sammle die Energiekerne, um den Boss zu schwächen!";
  }
  levels.push(c);
}

// Hintergründe pro Level: Farbverlauf innen und außen, Rasterfarbe, Farbe der Schwebeteilchen
const themen = [
  { innen: "#17222d", aussen: "#090e13", raster: "#1c2936", punkt: "#5a7a96" },
  { innen: "#12262a", aussen: "#07100f", raster: "#1a3a3a", punkt: "#4fa6a0" },
  { innen: "#241a33", aussen: "#0d0914", raster: "#2e2444", punkt: "#9b7fd0" },
  { innen: "#2a2118", aussen: "#110c07", raster: "#3b2e20", punkt: "#c9a06a" },
  { innen: "#16281c", aussen: "#08110b", raster: "#1f3a28", punkt: "#6fbf84" },
  { innen: "#2e1a1d", aussen: "#12080a", raster: "#43262b", punkt: "#d07a82" },
  { innen: "#0d1220", aussen: "#04060b", raster: "#16203a", punkt: "#6a82c0" },
  { innen: "#242628", aussen: "#0c0d0e", raster: "#34383b", punkt: "#9aa0a6" },
  { innen: "#2a1630", aussen: "#0f0714", raster: "#3f2248", punkt: "#d070c8" },
  { innen: "#2c2614", aussen: "#110e05", raster: "#40371c", punkt: "#d8c46a" }
];

// Gegnertypen: Größe, Tempo und Farbe. Ein neuer Typ ist nur ein neuer Eintrag.
const gegnerArten = {
  normal:     { radius: 13, tempo: 110, farbe: "#ff4d5e", form: "kreis",   cb: "#E69F00" },
  schnell:    { radius: 9,  tempo: 190, farbe: "#ff4de0", form: "dreieck", cb: "#F0E442" },
  dick:       { radius: 22, tempo: 62,  farbe: "#a86bff", form: "quadrat", cb: "#56B4E9" },
  springer:   { radius: 11, tempo: 75,  farbe: "#ffffff", form: "raute",   cb: "#FFFFFF" },
  geist:      { radius: 12, tempo: 95,  farbe: "#7ffff0", form: "stern",   cb: "#CC79A7" },
  schuetze:   { radius: 12, tempo: 55,  farbe: "#ffa94d", form: "raute",   cb: "#E69F00" },
  teleporter: { radius: 11, tempo: 80,  farbe: "#c58bff", form: "stern",   cb: "#56B4E9" },
  splitter:   { radius: 16, tempo: 70,  farbe: "#7dff7d", form: "quadrat", cb: "#F0E442" }
};

// Shop: Upgrades und Skins werden mit Münzen bezahlt, die du durch gesicherte Beute verdienst.
const upgrades = [
  { id: "leben",   name: "Extra-Leben",     preise: [40, 90, 160],           info: "Pro Stufe ein Treffer mehr pro Level." },
  { id: "schild",  name: "Startschild",     preise: [60],                    info: "Du startest jedes Level mit einem Schild, das einen Treffer abfängt." },
  { id: "magnet",  name: "Beute-Magnet",    preise: [50, 90, 140],           info: "Beute in der Nähe fliegt zu dir. Pro Stufe mehr Reichweite." },
  { id: "schuhe",  name: "Schnelle Schuhe", preise: [40, 70, 110, 160, 220], info: "Pro Stufe 4 Prozent mehr Tempo." },
  { id: "welle",   name: "Schockwelle (E)", preise: [120, 150, 190, 240],    info: "Zerstört Gegner im Umkreis. Weitere Stufen: größere Reichweite und kürzere Wartezeit." }
];

// Skins: Farbe, Form (kreis, dreieck, raute, quadrat, stern), Spur beim Dash und optional Funkeln beim Laufen.
const skinListe = [
  { id: "standard",   name: "Standard",   farbe: "#ffb02e", preis: 0,   form: "kreis",   spur: "standard", funkel: false, info: "Der Klassiker." },
  { id: "cyan",       name: "Cyan",       farbe: "#3de8ff", preis: 40,  form: "kreis",   spur: "standard", funkel: false, info: "Nur die Farbe ändert sich." },
  { id: "pink",       name: "Pink",       farbe: "#ff6ad5", preis: 40,  form: "kreis",   spur: "standard", funkel: false, info: "Nur die Farbe ändert sich." },
  { id: "gruen",      name: "Neon-Grün",  farbe: "#6dff6a", preis: 40,  form: "kreis",   spur: "standard", funkel: false, info: "Nur die Farbe ändert sich." },
  { id: "geist",      name: "Geist",      farbe: "#e8f0ff", preis: 40,  form: "kreis",   spur: "standard", funkel: false, info: "Nur die Farbe ändert sich." },
  { id: "gold",       name: "Gold",       farbe: "#ffd700", preis: 40,  form: "kreis",   spur: "standard", funkel: false, info: "Nur die Farbe ändert sich." },
  { id: "regenbogen", name: "Regenbogen", farbe: null,      preis: 120, form: "kreis",   spur: "regenbogen", funkel: false, info: "Farbwechsel und bunte Dash-Spur." },
  { id: "pfeil",      name: "Pfeil",      farbe: "#6ee7ff", preis: 80,  form: "dreieck", spur: "standard", funkel: false, info: "Dreieck, das in Laufrichtung zeigt." },
  { id: "stern",      name: "Stern",      farbe: "#ffe14d", preis: 100, form: "stern",   spur: "standard", funkel: true,  info: "Drehender Stern, funkelt beim Laufen." },
  { id: "feuer",      name: "Feuer",      farbe: "#ff7a2e", preis: 100, form: "kreis",   spur: "feuer",    funkel: true,  info: "Feurige Spur beim Laufen und Dash." },
  { id: "eis",        name: "Eis",        farbe: "#8fe8ff", preis: 100, form: "raute",   spur: "eis",      funkel: true,  info: "Eiskristall mit glitzernder Spur." },
  { id: "cyber",      name: "Cyber",      farbe: "#3dffa0", preis: 140, form: "quadrat", spur: "pixel",    funkel: true,  info: "Drehendes Quadrat mit Pixel-Spur." }
];

const schwerTab = [
  { name: "Leicht", tempo: 0.8, abstand: 1.25, muenzen: 0.8 },
  { name: "Normal", tempo: 1, abstand: 1, muenzen: 1 },
  { name: "Schwer", tempo: 1.2, abstand: 0.8, muenzen: 1.25 }
];

// Endlosmodus: Ein Level ohne Ende, das mit der Zeit schwerer wird. Die Werte rechnen sich selbst aus.
const endlosArten = ["normal", "dick", "schnell", "springer", "schuetze", "teleporter", "splitter", "geist"];

const endlosLevel = {
  name: "Endlos", extraktion: true, wandert: true, ziel: Infinity, dunkel: false, boss: 0, beuteLeben: 9, schnell: 0,
  hinweis: "Überlebe so lange du kannst. Es wird langsam immer schwerer.",
  get typen() { return endlosArten.slice(0, Math.min(endlosArten.length, 1 + Math.floor(zeitImLevel / 35))); },
  get tempo() { return Math.min(1.7, 0.8 + zeitImLevel / 200); },
  get abstand() { return Math.max(0.9, 2.6 - zeitImLevel / 100); },
  get maxGegner() { return Math.min(16, 5 + Math.floor(zeitImLevel / 20)); },
  get minen() { return zeitImLevel > 90 ? 5 : 0; },
  get bg() { return Math.floor(zeitImLevel / 60) % 10; }
};

// Erfolge: Jeder hat eine Bedingung und eine Belohnung in Münzen
const erfolgeListe = [
  { id: "start",  name: "Erster Schritt",  info: "Schaffe Level 1.", lohn: 10, ok: () => stats.levelGeschafft >= 1 },
  { id: "sauber", name: "Unberührbar",     info: "Schaffe ein Level ab Level 5 ohne einen Treffer.", lohn: 30, ok: () => stats.sauber >= 1 },
  { id: "kraft",  name: "Powerup-Sammler", info: "Sammle 3 Powerups in einem Level.", lohn: 20, ok: () => stats.maxKrafte >= 3 },
  { id: "gold",   name: "Goldrausch",      info: "Sammle 5 goldene Beutestücke.", lohn: 25, ok: () => stats.gold >= 5 },
  { id: "boss1",  name: "Bossjäger",       info: "Besiege den ersten Boss (Level 10).", lohn: 40, ok: () => stats.bosse >= 1 },
  { id: "boss5",  name: "Bossserie",       info: "Besiege 5 Bosse.", lohn: 80, ok: () => stats.bosse >= 5 },
  { id: "l50",    name: "Halbzeit",        info: "Schaffe Level 50.", lohn: 100, ok: () => freigeschaltet >= 51 },
  { id: "welle",  name: "Schockwellenfan", info: "Benutze die Schockwelle 20 Mal.", lohn: 30, ok: () => stats.wellen >= 20 },
  { id: "shop",   name: "Shopaholic",      info: "Kaufe 10 Dinge im Shop.", lohn: 30, ok: () => stats.kaeufe >= 10 },
  { id: "reich",  name: "Reich",           info: "Verdiene insgesamt 500 Münzen.", lohn: 50, ok: () => stats.muenzenGesamt >= 500 },
  { id: "endlos", name: "Durchhalter",     info: "Überlebe 3 Minuten im Endlosmodus.", lohn: 60, ok: () => endlosBest >= 180 },
  { id: "tag",    name: "Tagesheld",       info: "Schaffe eine Tageschallenge.", lohn: 40, ok: () => stats.tage >= 1 },
  { id: "finale", name: "Meister",         info: "Schaffe Level 99.", lohn: 200, ok: () => stats.finale >= 1 }
];
