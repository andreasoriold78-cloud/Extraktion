// Zustand: Alles, was sich während des Spiels ändert, dazu Speichern, Laden, Zufall, Events und Hilfsfunktionen.

const spieler = { x: B / 2, y: H / 2, radius: 16, tempo: 340 };

const zone = { x: 0, y: 0, radius: 65, dauer: 1.2 }; // dauer = Sekunden zum Extrahieren

// Zustand des Spiels
let lvl = 0;              // Index des aktuellen Levels

let tode = 0, gesamtZeit = 0;   // Für den Abspann

const einst = { volSound: 0.8, volMusik: 0.8, stumm: false, schwer: 1, farbenblind: false, touch: false, sparmodus: false, sparAuto: false, tutorial: false }; // Einstellungen

let freigeschaltet = 1;         // Wie viele Level schon spielbar sind

let auswahl = 0;                // Markierter Menüpunkt

let szeneZeit = 0;              // Sekunden seit Beginn von Intro oder Outro

let rekord = [], neuerRekord = false;  // Beste Zeit pro Level

let minen = [], zeitBisMine = 3, inZone = false;

let muenzen = 0, verdient = 0;           // Münzen insgesamt und in diesem Level

let leben = 1, unverwundbar = 0, schildAn = false;

let welleCd = 0, welleR = 0, welleX = 0, welleY = 0;

let kraft = [], zeitBisKraft = 12, effekte = { zeit: 0, tempo: 0 };

let seite = 0;                           // Welche zehn Level das Menü zeigt

const shop = { leben: 0, schild: 0, magnet: 0, schuhe: 0, welle: 0 }; // Stufen der Upgrades

let skinsBesitz = ["standard"], skinAktiv = "standard";

const kraftFarbe = { schild: "#3aa0ff", zeit: "#c58bff", tempo: "#ffe14d" };

const kraftBuchstabe = { schild: "S", zeit: "Z", tempo: "T" };

let modus = "level";                     // level | endlos | tages

let pausiert = false, toast = { text: "", zeit: 0 };

let kugeln = [], boss = null, pads = [], padCd = 0, walzen = [], windX = 0, windY = 0, windZeit = 0, welleBoss = false;

let lvlTreffer = 0, lvlKrafte = 0;

let analogX = 0, analogY = 0, padX = 0, padY = 0; // Touch-Stick und Gamepad

let endlosBest = 0, tagesBest = {}, erreicht = {};

let klassenBesitz = ["standard"], klasseAktiv = "standard";

const talente = { wirt: 0, haut: 0, dash: 0, sammler: 0 };

let tutSeite = 0, tutNachStart = false, glow = 1, fpsSumme = 0, fpsAnzahl = 0;

const stats = { levelGeschafft: 0, sauber: 0, maxKrafte: 0, gold: 0, bosse: 0, wellen: 0, kaeufe: 0, muenzenGesamt: 0, tage: 0, finale: 0 };

const sterne = Array.from({ length: 40 }, () => ({ x: Math.random() * B, y: Math.random() * H, s: 0.6 + Math.random() * 1.6, v: 6 + Math.random() * 14 }));

let phase = "menue";    // menue | intro | spielen | geschafft | verloren | gewonnen

let gegner = [], beute = [], teilchen = [];

let punkte = 0, rucksack = 0, extraktion = 0;

let zeitBisGegner = 0, zeitBisBeute = 0, zeitImLevel = 0;

let banner = 0, meldung = 0, wackeln = 0, dashZeit = 0, dashPause = 0;

let richtung = { x: 1, y: 0 };

// Speichern: Einstellungen und freigeschaltete Level bleiben im Browser erhalten.
function laden() {
  try {
    const gespeichert = JSON.parse(localStorage.getItem("extraktion") || "{}");
    if (gespeichert.einst) Object.assign(einst, gespeichert.einst);
    if (gespeichert.frei) freigeschaltet = Math.max(1, Math.min(levels.length, gespeichert.frei));
    if (Array.isArray(gespeichert.rekord)) rekord = gespeichert.rekord;
    if (typeof gespeichert.muenzen === "number") muenzen = gespeichert.muenzen;
    if (gespeichert.shop) Object.assign(shop, gespeichert.shop);
    if (Array.isArray(gespeichert.skins)) skinsBesitz = gespeichert.skins;
    if (gespeichert.skin) skinAktiv = gespeichert.skin;
    if (gespeichert.stats) Object.assign(stats, gespeichert.stats);
    if (gespeichert.erreicht) erreicht = gespeichert.erreicht;
    if (typeof gespeichert.endlosBest === "number") endlosBest = gespeichert.endlosBest;
    if (gespeichert.tagesBest) tagesBest = gespeichert.tagesBest;
    if (Array.isArray(gespeichert.klassen)) klassenBesitz = gespeichert.klassen;
    if (gespeichert.klasse) klasseAktiv = gespeichert.klasse;
    if (gespeichert.talente) Object.assign(talente, gespeichert.talente);
    seite = Math.floor((freigeschaltet - 1) / 10);
  } catch (e) { /* Ohne Speicher läuft das Spiel trotzdem. */ }
}

function speichern() {
  try { localStorage.setItem("extraktion", JSON.stringify({ einst, frei: freigeschaltet, rekord, muenzen, shop, skins: skinsBesitz, skin: skinAktiv, stats, erreicht, endlosBest, tagesBest, klassen: klassenBesitz, klasse: klasseAktiv, talente })); } catch (e) {}
}

function abgeschlossen(i) {
  freigeschaltet = Math.max(freigeschaltet, Math.min(levels.length, i + 2)); // Nächstes Level frei
  seite = Math.floor((freigeschaltet - 1) / 10);
  speichern();
}

// Lautstärken (M schaltet alles stumm)
const vS = () => einst.stumm ? 0 : einst.volSound;

const vM = () => einst.stumm ? 0 : einst.volMusik;

const sd = () => schwerTab[einst.schwer];

// Tageschallenge: Das Datum bestimmt Level und Zufallsfolge, so spielt jeder am selben Tag dasselbe.
const heute = new Date();

const tagKey = heute.getFullYear() * 10000 + (heute.getMonth() + 1) * 100 + heute.getDate();

function tagesLevel(k = tagKey) { let i = 4 + (k % 80); if (i % 10 === 9) i++; return i; } // Nie ein Boss

function mulberry32(a) { // Kleiner Zufallsgenerator, der bei gleichem Startwert immer dieselbe Folge liefert
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let rng = mulberry32(1), rngAktiv = false;

const rnd = () => rngAktiv ? rng() : Math.random();

// Event der Woche: wechselt jeden Montag und gilt in den normalen Leveln
const events = [
  { name: "Dunkle Woche",     info: "Alle Level sind dunkel.", dunkel: true },
  { name: "Münzregen",        info: "Doppelt so viele Münzen.", muenzen: 2 },
  { name: "Sturmwoche",       info: "In jedem Level weht Wind.", wind: true },
  { name: "Sperrfeuer-Woche", info: "Überall explodieren Minen.", minen: 5 },
  { name: "Geisterwoche",     info: "Geister tauchen in jedem Level auf.", geist: true },
  { name: "Turbo-Woche",      info: "Gegner 15 % schneller, dafür 50 % mehr Münzen.", tempo: 1.15, muenzen: 1.5 }
];

const wochenNr = Math.floor((Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate()) / 86400000 + 3) / 7);

const eventAktiv = events[wochenNr % events.length];

const ev = () => modus === "level" ? eventAktiv : {};

const klasseAktuell = () => klassen.find((k) => k.id === klasseAktiv) || klassen[0];

const ws = () => Math.max(shop.welle, klasseAktuell().welle || 0);  // Stufe der Schockwelle

const mg = () => shop.magnet + (klasseAktuell().magnet || 0);       // Stufe des Magneten

const dashWarte = () => 1.2 * klasseAktuell().dash * (1 - 0.08 * talente.dash);

const talentAusgegeben = () => talentListe.reduce((summe, t) => summe + talente[t.id] * (talente[t.id] + 1) / 2, 0);

const talentPunkte = () => (freigeschaltet - 1) + stats.bosse * 2 - talentAusgegeben();

function cfgAktuell() { return modus === "endlos" ? endlosLevel : levels[lvl]; }

function titel(cfg) {
  if (modus === "endlos") return "Endlosmodus";
  return (modus === "tages" ? "Tageschallenge: " : "Level " + (lvl + 1) + ": ") + cfg.name;
}

function erfolgePruefen() {
  for (const e of erfolgeListe) {
    if (erreicht[e.id] || !e.ok()) continue;
    erreicht[e.id] = true;
    muenzen += e.lohn;
    stats.muenzenGesamt += e.lohn;
    toast = { text: "Erfolg: " + e.name + " (+" + e.lohn + " Münzen)", zeit: 4 };
    klang.erfolg();
    speichern();
  }
}
