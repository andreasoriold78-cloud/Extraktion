// Audio: Soundeffekte und die Synthwave-Musik, alles direkt im Browser erzeugt.

let klangBus = null, musikBus = null, rauschen = null; let audio = null;               // Wird bei der ersten Taste oder dem ersten Klick angelegt

// Töne werden direkt im Browser erzeugt, du brauchst keine Audiodateien.
function note(t0, freq, dauer, typ, laut, bis) {
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = typ;
  o.frequency.setValueAtTime(freq, t0);
  if (bis) o.frequency.exponentialRampToValueAtTime(bis, t0 + dauer); // Tonhöhe gleitet
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(laut, t0 + 0.012); // Weicher Einsatz, kein Knacken
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);            // Ton klingt aus
  o.connect(g);
  g.connect(klangBus);
  o.start(t0);
  o.stop(t0 + dauer);
}

function piep(freq, dauer, typ, laut, bis, verzoegerung) {
  if (!audio || vS() <= 0) return;
  note(audio.currentTime + (verzoegerung || 0), freq, dauer, typ, laut * vS(), bis);
}

const klang = {
  start:      () => piep(330, 0.12, "square", 0.06, 660),
  gesperrt:   () => piep(120, 0.15, "square", 0.06, 90),
  tick:       () => piep(520, 0.04, "square", 0.04, 520),
  kauf:       () => [660, 880, 1320].forEach((f, i) => piep(f, 0.12, "triangle", 0.1, f, i * 0.08)),
  treffer:    () => piep(260, 0.25, "sawtooth", 0.1, 90),
  tele:       () => piep(300, 0.2, "sine", 0.1, 1200),
  schuss:     () => piep(900, 0.08, "square", 0.03, 400),
  bossSchuss: () => piep(120, 0.3, "sawtooth", 0.1, 60),
  erfolg:     () => [659, 784, 988, 1319].forEach((f, i) => piep(f, 0.15, "triangle", 0.1, f, i * 0.09)),
  schild:     () => piep(1100, 0.2, "sine", 0.1, 500),
  welle:      () => piep(180, 0.5, "sawtooth", 0.1, 900),
  kraft:      () => [784, 988, 1175].forEach((f, i) => piep(f, 0.1, "square", 0.05, f, i * 0.07)),
  zone:       () => piep(500, 0.1, "sine", 0.1, 750),
  warn:       () => piep(900, 0.08, "square", 0.04, 900),
  knall:      () => { piep(120, 0.35, "sawtooth", 0.14, 35); piep(800, 0.1, "square", 0.05, 200); },
  sprung:     () => piep(700, 0.1, "sawtooth", 0.03, 250),
  levelstart: () => [392, 523].forEach((f, i) => piep(f, 0.14, "triangle", 0.1, f, i * 0.12)),
  sieg:       () => [523, 659, 784, 1047, 1319].forEach((f, i) => piep(f, 0.25, "square", 0.07, f, i * 0.13)),
  beute:      () => piep(660, 0.12, "triangle", 0.12, 990),
  dash:       () => piep(300, 0.15, "sawtooth", 0.05, 900),
  tod:        () => piep(220, 0.6, "sawtooth", 0.12, 40),
  extrahiert: () => [440, 660, 880].forEach((f, i) => piep(f, 0.2, "triangle", 0.12, f, i * 0.12)),
  geschafft:  () => [523, 659, 784, 1047].forEach((f, i) => piep(f, 0.2, "square", 0.07, f, i * 0.12))
};

// Musik im Stil der 80er: Jedes Stück ist nur Daten (Tempo, Akkorde, Muster).
// prog = Akkordfolge als [Grundton als MIDI-Zahl, "m" = Moll oder "M" = Dur]. Pro Takt ein Akkord.
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

const arpA = [0, 1, 2, 1, 2, 1, 0, 1], arpB = [0, 2, 1, 2, 0, 2, 1, 2];

const tracks = [ // Ein Stück pro Hintergrund, also pro Level der ersten Runde
  { bpm: 100, prog: [[45, "m"], [41, "M"], [48, "M"], [43, "M"]], arp: arpA, bass: "puls", drums: 1, saw: 1800 },
  { bpm: 104, prog: [[40, "m"], [48, "M"], [43, "M"], [38, "M"]], arp: arpB, bass: "puls", drums: 1, saw: 2000 },
  { bpm: 108, prog: [[50, "m"], [46, "M"], [41, "M"], [48, "M"]], arp: arpA, bass: "puls", drums: 1, saw: 1900 },
  { bpm: 110, prog: [[47, "m"], [43, "M"], [38, "M"], [45, "M"]], arp: arpB, bass: "puls", drums: 2, saw: 2100 },
  { bpm: 112, prog: [[43, "m"], [39, "M"], [46, "M"], [41, "M"]], arp: arpA, bass: "puls", drums: 2, saw: 2000 },
  { bpm: 116, prog: [[45, "m"], [45, "m"], [41, "M"], [43, "M"]], arp: arpB, bass: "puls", drums: 2, saw: 2300 },
  { bpm: 96,  prog: [[41, "m"], [44, "M"], [39, "M"], [46, "m"]], arp: arpB, bass: "oktave", drums: 0, saw: 1300 }, // Dunkelheit: ruhig, ohne Schlagzeug
  { bpm: 120, prog: [[40, "m"], [40, "m"], [43, "M"], [38, "M"]], arp: arpA, bass: "puls", drums: 2, saw: 2400 },
  { bpm: 124, prog: [[45, "m"], [43, "M"], [41, "M"], [40, "M"]], arp: arpB, bass: "puls", drums: 2, saw: 2500 },
  { bpm: 128, prog: [[45, "m"], [41, "M"], [43, "M"], [40, "M"]], arp: arpA, bass: "puls", drums: 2, saw: 2800 }
];

const trackMenue = { bpm: 88, prog: [[45, "m"], [41, "M"], [36, "M"], [43, "M"]], arp: arpB, bass: "oktave", drums: 0, saw: 1400 };

const trackIntro = { bpm: 72, prog: [[40, "m"], [36, "M"], [43, "M"], [38, "M"]], arp: arpA, bass: "oktave", drums: 0, saw: 1000 };

const trackOutro = { bpm: 112, prog: [[48, "M"], [43, "M"], [45, "m"], [41, "M"]], arp: arpA, bass: "puls", drums: 1, saw: 2400 };

let musikSchritt = 0, musikZeit = 0, musikTimer = null, musikKey = "";

// Ein Synth-Ton: zwei leicht verstimmte Oszillatoren durch einen Tiefpass, das ergibt den breiten 80er-Klang.
function synth(t, freq, dauer, typ, laut, filter, verstimmt, anschlag) {
  const f = audio.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = filter;
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(laut, t + (anschlag || 0.015));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  f.connect(g);
  g.connect(musikBus);
  [-verstimmt, verstimmt].forEach((cent) => {
    const o = audio.createOscillator();
    o.type = typ;
    o.frequency.value = freq;
    o.detune.value = cent;
    o.connect(f);
    o.start(t);
    o.stop(t + dauer + 0.02);
  });
}

function trommel(t, art) {
  if (art === "kick") { // Sinus, dessen Tonhöhe schnell fällt
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g); g.connect(musikBus);
    o.start(t); o.stop(t + 0.25);
    return;
  }
  const r = audio.createBufferSource(); // Snare und Hi-Hat sind gefiltertes Rauschen
  r.buffer = rauschen;
  const f = audio.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = art === "snare" ? 1200 : 7000;
  const g = audio.createGain();
  const dauer = art === "snare" ? 0.16 : 0.05;
  g.gain.setValueAtTime(art === "snare" ? 0.35 : 0.12, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  r.connect(f); f.connect(g); g.connect(musikBus);
  r.start(t); r.stop(t + dauer);
}

// Ein Achtel des Stücks: acht davon ergeben einen Takt.
function musikTakt(t, schritt, d, a) {
  const tr = a.tr;
  const takt = Math.floor(schritt / 8) % tr.prog.length, pos = schritt % 8;
  const wurzel = tr.prog[takt][0] + a.shift;
  const iv = tr.prog[takt][1] === "m" ? [0, 3, 7] : [0, 4, 7];
  if (pos === 0) iv.forEach((x) => synth(t, hz(wurzel + 12 + x), d * 8, "sawtooth", 0.05, 800, 8, 0.4)); // Klangteppich
  if (tr.bass === "puls") synth(t, hz(wurzel + (pos === 3 || pos === 7 ? 12 : 0)), d * 0.9, "sawtooth", 0.16, 520, 0);
  else if (pos % 4 === 0) synth(t, hz(wurzel), d * 3.6, "sine", 0.3, 400, 0);
  synth(t, hz(wurzel + 24 + iv[tr.arp[pos]] + (pos >= 4 ? 12 : 0)), d * 0.95, "sawtooth", 0.05, tr.saw, 7);
  if (tr.drums) {
    if (tr.drums === 1 ? pos % 4 === 0 : pos % 2 === 0) trommel(t, "kick");
    if (tr.drums === 2 && (pos === 2 || pos === 6)) trommel(t, "snare");
    if (tr.drums === 2 || pos % 2 === 1) trommel(t, "hat");
  }
}

// Welches Stück läuft gerade? Menü, Intro und Outro haben eigene, jedes Level seins.
function aktuellerTrack() {
  if (phase === "menue" || phase === "shop") return { key: "menue", tr: trackMenue, bpm: trackMenue.bpm, shift: 0 };
  if (phase === "intro") return { key: "intro", tr: trackIntro, bpm: trackIntro.bpm, shift: 0 };
  if (phase === "outro") return { key: "outro", tr: trackOutro, bpm: trackOutro.bpm, shift: 0 };
  const nr = cfgAktuell().bg % tracks.length;
  // Spätere Runden klingen einen Halbton höher und etwas schneller
  return { key: "L" + nr, tr: tracks[nr], bpm: tracks[nr].bpm + Math.min(16, Math.floor(lvl / 6)), shift: Math.floor(lvl / 10) % 6 };
}

function musikStart() {
  if (musikTimer || !audio) return;
  musikZeit = audio.currentTime + 0.1;
  musikTimer = setInterval(() => {
    if (musikZeit < audio.currentTime - 0.5) musikZeit = audio.currentTime; // Nach einer Pause neu einsteigen
    const a = aktuellerTrack();
    musikBus.gain.value = 0.55 * vM(); // Musiklautstärke
    if (a.key !== musikKey) { // Neues Stück: vorne anfangen
      musikKey = a.key;
      musikSchritt = 0;
      if (musikZeit < audio.currentTime) musikZeit = audio.currentTime + 0.05;
    }
    // Plant die nächsten Töne im Voraus, damit nichts ruckelt.
    while (musikZeit < audio.currentTime + 0.5) {
      const d = 60 / a.bpm / 2;
      if (vM() > 0) musikTakt(musikZeit, musikSchritt, d, a);
      musikZeit += d;
      musikSchritt++;
    }
  }, 80);
}

function tonStarten() {
  if (!audio) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    // Kette: Töne -> Filter -> Kompressor (verhindert Übersteuern) -> Lautstärke -> Lautsprecher
    klangBus = audio.createBiquadFilter();
    klangBus.type = "lowpass";
    klangBus.frequency.value = 5000;
    const komp = audio.createDynamicsCompressor();
    komp.threshold.value = -18; komp.ratio.value = 6; komp.attack.value = 0.003; komp.release.value = 0.2;
    const master = audio.createGain();
    master.gain.value = 0.7;
    klangBus.connect(komp); komp.connect(master); master.connect(audio.destination);
    // Musik: eigener Bus mit Echo, das typische Synthwave-Gefühl
    musikBus = audio.createGain();
    musikBus.gain.value = 0.55;
    musikBus.connect(klangBus);
    const echo = audio.createDelay(1);
    echo.delayTime.value = 0.375;
    const rueck = audio.createGain(); rueck.gain.value = 0.3;
    const echoPegel = audio.createGain(); echoPegel.gain.value = 0.35;
    musikBus.connect(echo); echo.connect(rueck); rueck.connect(echo); echo.connect(echoPegel); echoPegel.connect(klangBus);
    // Rauschen für Schlagzeug (Snare und Hi-Hat)
    rauschen = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.5), audio.sampleRate);
    const daten = rauschen.getChannelData(0);
    for (let i = 0; i < daten.length; i++) daten[i] = Math.random() * 2 - 1;
  }
  if (audio.state === "suspended") audio.resume();
  musikStart();
}
