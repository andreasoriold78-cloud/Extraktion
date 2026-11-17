// Tests: Starten mit "npm test" oder "node --test" (Node.js 18 oder neuer, keine Installation nötig).
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { ladeSpiel } = require("../tools/lade-spiel.js");

const spiel = ladeSpiel(path.join(__dirname, ".."));
const lies = (code) => JSON.parse(spiel.fuehreAus("JSON.stringify(" + code + ")"));

test("es gibt 99 Level", () => {
  assert.strictEqual(lies("levels.length"), 99);
});

test("jedes zehnte Level und das letzte sind Bosse, sonst gibt es keine", () => {
  const boss = lies("levels.map((l) => !!l.boss)");
  boss.forEach((ist, i) => assert.strictEqual(ist, i % 10 === 9 || i === 98, "Level " + (i + 1)));
});

test("alle Level haben sinnvolle Werte", () => {
  for (const l of lies("levels.map((l) => ({ t: l.tempo, a: l.abstand, g: l.maxGegner, z: l.ziel, n: l.typen.length, bg: l.bg }))")) {
    assert.ok(l.t > 0 && l.a > 0 && l.g >= 1 && l.z > 0 && l.n >= 1 && l.bg >= 0 && l.bg < 10);
  }
});

test("die Feinjustierung hält sich in vernünftigen Grenzen", () => {
  const f = lies("feinjustierung");
  assert.strictEqual(f.length, 99);
  assert.ok(f.every((x) => x >= 0.5 && x <= 1.7));
});

test("die Tageschallenge wählt nie einen Boss und bleibt im Bereich", () => {
  for (let tag = 20260101; tag <= 20261231; tag++) {
    const i = lies("tagesLevel(" + tag + ")");
    assert.ok(i >= 4 && i < 98 && i % 10 !== 9, "Tag " + tag + " ergibt Level " + i);
  }
});

test("Shop-Preise sind positiv und werden mit jeder Stufe nicht billiger", () => {
  for (const u of lies("upgrades")) {
    assert.ok(u.preise.every((p, i) => p > 0 && (i === 0 || p >= u.preise[i - 1])), u.id);
  }
});

test("Skins, Klassen, Talente und Erfolge haben eindeutige Namen", () => {
  for (const liste of ["skinListe", "klassen", "talentListe", "erfolgeListe"]) {
    const ids = lies(liste + ".map((x) => x.id)");
    assert.strictEqual(new Set(ids).size, ids.length, liste);
  }
});

test("jedes Level lässt sich starten und zwei Sekunden spielen", () => {
  for (let i = 0; i < 99; i++) {
    spiel.fuehreAus("modus = 'level'; startLevel(" + i + "); for (let k = 0; k < 120; k++) update(1 / 60);");
  }
});

test("Endlosmodus und Tageschallenge laufen", () => {
  spiel.fuehreAus("modus = 'endlos'; startLevel(0); for (let k = 0; k < 600; k++) update(1 / 60);");
  spiel.fuehreAus("modus = 'tages'; startLevel(tagesLevel()); for (let k = 0; k < 600; k++) update(1 / 60);");
});

test("der Bot schafft das erste Level fast immer", () => {
  spiel.fuehreAus(fs.readFileSync(path.join(__dirname, "../tools/bot-ki.js"), "utf8"));
  spiel.fuehreAus("botVorbereiten(3)");
  assert.ok(lies("botRate(0, 10, 240).rate") >= 0.8);
});
