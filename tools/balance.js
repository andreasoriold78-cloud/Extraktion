// Balancing-Bot: spielt jedes Level automatisch und zeigt, wie schwer es ist.
//
//   node tools/balance.js bericht <Spiel>                    Erfolgsquote pro Level
//   node tools/balance.js kalibrieren <Spiel> <Start> <Schritt> <Ausgabe.json>
//
// <Spiel> ist der Ordner mit index.html oder eine einzelne HTML-Datei.
// Der Bot ist kein Mensch: Wichtig ist die Form der Kurve (gleichmäßig steigend), nicht die absolute Zahl.
const fs = require("fs");
const { ladeSpiel } = require("./lade-spiel.js");

const [, , modus, pfad, start = "0", schritt = "1", ausgabe] = process.argv;
const spiel = ladeSpiel(pfad);
spiel.fuehreAus(fs.readFileSync(__dirname + "/bot-ki.js", "utf8"));
spiel.fuehreAus("botVorbereiten(" + (Number(start) * 17 + 5) + ")");
const anzahl = spiel.fuehreAus("levels.length");
const istBoss = (i) => spiel.fuehreAus("!!levels[" + i + "].boss");
const rate = (i, n) => spiel.fuehreAus("botRate(" + i + ", " + n + ", 240)");

// Gewünschte Erfolgsquote des Bots (mit dem angenommenen Shop-Fortschritt): sinkt langsam von 80 % auf 55 %.
// Bosse sind 10 Punkte schwerer. Menschen spielen besser als der Bot, die Level sind für sie also etwas leichter.
const ziel = (i) => 0.8 - 0.25 * (i / (anzahl - 1)) - (istBoss(i) ? 0.1 : 0);

if (modus === "bericht") {
  for (let i = Number(start); i < anzahl; i += Number(schritt)) {
    const r = rate(i, 30);
    console.log("Level " + String(i + 1).padStart(2), "Erfolg " + String(Math.round(r.rate * 100)).padStart(3) + " %", "Ziel " + Math.round(ziel(i) * 100) + " %", "Zeit " + r.zeit.toFixed(0) + " s", "m=" + spiel.fuehreAus("levels[" + i + "].m").toFixed(2));
  }
} else if (modus === "kalibrieren") {
  const ergebnis = {};
  for (let i = Number(start); i < anzahl; i += Number(schritt)) {
    let lo = 0.55, hi = 1.6; // Je höher m, desto schwerer das Level
    for (let it = 0; it < 7; it++) {
      const m = (lo + hi) / 2;
      spiel.fuehreAus("botSetze(" + i + ", " + m + ")");
      if (rate(i, 24).rate > ziel(i)) lo = m; else hi = m; // Zu leicht: schwerer machen
    }
    ergebnis[i] = Math.round((lo + hi) / 2 * 100) / 100;
  }
  fs.writeFileSync(ausgabe, JSON.stringify(ergebnis));
}
