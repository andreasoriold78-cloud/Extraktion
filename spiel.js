// Spiel: Die Spielregeln. Levelstart, Gegner, Beute, Boss, Treffer und die Update-Schleife.

function startLevel(i) {
  lvl = i;
  rngAktiv = modus === "tages";
  if (rngAktiv) rng = mulberry32(tagKey); // Tageschallenge: jeden Tag dieselbe Zufallsfolge
  phase = "spielen";
  gegner = []; beute = []; teilchen = [];
  punkte = 0; rucksack = 0; extraktion = 0;
  zeitBisGegner = 1; zeitBisBeute = 0; zeitImLevel = 0;
  banner = 3; meldung = 0; wackeln = 0; dashZeit = 0; dashPause = 0;
  spieler.x = B / 2; spieler.y = H / 2;
  zone.x = B - 90; zone.y = H - 90;
  minen = []; zeitBisMine = 3; inZone = false;
  leben = 1 + shop.leben; schildAn = shop.schild > 0; unverwundbar = 0; verdient = 0;
  welleCd = 0; welleR = 0; kraft = []; zeitBisKraft = 12; effekte = { zeit: 0, tempo: 0 };
  lvlTreffer = 0; lvlKrafte = 0; kugeln = []; windX = 0; windY = 0; windZeit = 0; padCd = 0; welleBoss = false;
  const cf = cfgAktuell();
  boss = cf.boss ? { x: B / 2, y: 70, radius: 36, tempo: 34 + cf.boss * 3, cd: 3, art: (cf.boss - 1) % 3, drehung: 0 } : null;
  pads = cf.pads ? [{ x: 110, y: H - 110 }, { x: B - 110, y: 110 }] : [];
  walzen = [];
  for (let k = 0; k < (cf.walzen || 0); k++) walzen.push({ x: (k * 330) % B, y: 100 + (k + 0.5) * (H - 200) / cf.walzen, b: 130, h: 16, v: (k % 2 ? -1 : 1) * (110 + k * 25) });
  klang.levelstart();
}

function neueZone() {
  // Zufälliger Ort, aber nicht direkt neben dir.
  do {
    zone.x = 90 + rnd() * (B - 180);
    zone.y = 90 + rnd() * (H - 180);
  } while (Math.hypot(zone.x - spieler.x, zone.y - spieler.y) < 250);
}

function neuerGegner() {
  const cfg = cfgAktuell();
  const seite = Math.floor(rnd() * 4);
  let x, y;
  if (seite === 0)      { x = rnd() * B; y = -30; }
  else if (seite === 1) { x = B + 30; y = rnd() * H; }
  else if (seite === 2) { x = rnd() * B; y = H + 30; }
  else                  { x = -30; y = rnd() * H; }
  const typ = cfg.typen[Math.floor(rnd() * cfg.typen.length)];
  const art = gegnerArten[typ];
  gegner.push({ x, y, typ, radius: art.radius, tempo: art.tempo * (0.85 + rnd() * 0.3) * cfg.tempo * sd().tempo, cd: 1.5 + rnd() * 1.5, dash: 0 });
}

function neueBeute() {
  const cfg = cfgAktuell();
  const gold = !cfg.boss && rnd() < 0.08; // Selten: goldene Beute, die schnell verschwindet
  beute.push({
    x: 40 + rnd() * (B - 80),
    y: 40 + rnd() * (H - 80),
    radius: gold ? 11 : 9,
    gold,
    leben: gold ? 4 : cfg.beuteLeben,
    versatz: Math.random() * 6 // Damit nicht alle im Gleichtakt pulsieren
  });
}

// Funken: kleine Teilchen, die in alle Richtungen fliegen und verblassen.
function funken(x, y, farbe, anzahl) {
  for (let i = 0; i < anzahl; i++) {
    const winkel = Math.random() * Math.PI * 2;
    const tempo = 60 + Math.random() * 200;
    const leben = 0.4 + Math.random() * 0.5;
    teilchen.push({ x, y, vx: Math.cos(winkel) * tempo, vy: Math.sin(winkel) * tempo, leben, start: leben, farbe });
  }
}

function skinAktuell() { return skinListe.find((x) => x.id === skinAktiv) || skinListe[0]; }

function spielerFarbe(zeit) {
  return skinAktuell().farbe || "hsl(" + Math.floor((zeit * 120) % 360) + ", 100%, 62%)"; // Regenbogen wechselt die Farbe
}

// Spur: Funken in den Farben des Skins (beim Dash mehr, bei manchen Skins auch beim Laufen)
const spurFarben = {
  feuer: ["#ff4d1a", "#ff9a1a", "#ffd21a"],
  eis:   ["#a0f0ff", "#ffffff", "#58c8ff"],
  pixel: ["#3dffa0", "#00ffcc", "#ffffff"]
};

function spurFunken(n) {
  const sk = skinAktuell();
  for (let i = 0; i < n; i++) {
    const pal = spurFarben[sk.spur];
    const farbe = sk.spur === "regenbogen" ? "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 62%)"
      : pal ? pal[Math.floor(Math.random() * pal.length)] : spielerFarbe(performance.now() / 1000);
    funken(spieler.x, spieler.y, farbe, 1);
  }
}

function skinWinkel(form, zeit) {
  if (form === "dreieck") return Math.atan2(richtung.y, richtung.x); // Zeigt in Laufrichtung
  if (form === "stern" || form === "quadrat") return zeit * 2;
  return 0;
}

// Kugeln und Boss
function schuss(x, y, winkel, tempo) { kugeln.push({ x, y, vx: Math.cos(winkel) * tempo, vy: Math.sin(winkel) * tempo }); }

function bossUpdate(dt, cfg) {
  const b = boss;
  const gx = spieler.x - b.x, gy = spieler.y - b.y, ab = Math.hypot(gx, gy) || 1;
  b.x += gx / ab * b.tempo * dt;
  b.y += gy / ab * b.tempo * dt;
  b.cd -= dt;
  const hp = 1 - punkte / cfg.ziel;
  if (b.cd <= 0) { // Jeder Boss hat eins von drei Angriffsmustern, in der zweiten Hälfte schneller
    b.cd = Math.max(1.2, 2.8 - cfg.boss * 0.12) * (hp < 0.5 ? 0.75 : 1);
    const n = 10 + cfg.boss, t = 130 + cfg.boss * 6;
    if (b.art === 0) for (let i = 0; i < n; i++) schuss(b.x, b.y, i / n * Math.PI * 2, t);                 // Ring
    else if (b.art === 1) { const w = Math.atan2(gy, gx); for (let i = -2; i <= 2; i++) schuss(b.x, b.y, w + i * 0.22, t + 50); } // Fächer
    else { b.drehung += 0.4; for (let i = 0; i < 8; i++) schuss(b.x, b.y, b.drehung + i * Math.PI / 4, t + 10); }   // Drehender Ring
    klang.bossSchuss();
  }
  if (ab < b.radius + spieler.radius && dashZeit <= 0 && unverwundbar <= 0 && phase === "spielen") getroffen();
}

function sichern(n) { // Gesicherte Beute zählt als Punkte und bringt Münzen
  punkte += n;
  const m = n / 10 * sd().muenzen;
  muenzen += m;
  verdient += m;
  stats.muenzenGesamt += m;
  speichern();
}

function getroffen() {
  lvlTreffer++;
  if (schildAn) { // Das Schild fängt den Treffer ab
    schildAn = false; unverwundbar = 1.5;
    klang.schild();
    funken(spieler.x, spieler.y, "#3aa0ff", 25);
    return;
  }
  leben--;
  if (leben <= 0) { sterben(); return; }
  unverwundbar = 1.5; wackeln = 0.25; // Kurz unverwundbar, damit nicht gleich der nächste trifft
  klang.treffer();
  funken(spieler.x, spieler.y, "#ff4d5e", 25);
}

function welleStarten() {
  if (shop.welle < 1 || welleCd > 0) return;
  welleCd = 14 - shop.welle * 2;
  welleX = spieler.x; welleY = spieler.y; welleR = 1;
  welleBoss = false;
  stats.wellen++;
  erfolgePruefen();
  klang.welle();
}

function sterben() {
  phase = "verloren";
  tode++;
  klang.tod();
  wackeln = 0.4;
  funken(spieler.x, spieler.y, "#ffb02e", 45);
  if (modus === "endlos" && zeitImLevel > endlosBest) endlosBest = zeitImLevel;
  erfolgePruefen();
  speichern();
}

function update(dt) {
  if (toast.zeit > 0) toast.zeit -= dt;
  if (pausiert) return;
  // Teilchen und Effekte laufen immer weiter, auch nach dem Aus.
  for (let i = teilchen.length - 1; i >= 0; i--) {
    const t = teilchen[i];
    t.leben -= dt;
    if (t.leben <= 0) { teilchen.splice(i, 1); continue; }
    t.x += t.vx * dt;
    t.y += t.vy * dt;
  }
  szeneZeit += dt;
  for (const st of sterne) { st.y -= st.v * dt; if (st.y < -2) { st.y = H + 2; st.x = Math.random() * B; } }
  if (wackeln > 0) wackeln -= dt;
  if (banner > 0) banner -= dt;
  if (meldung > 0) meldung -= dt;
  // Deko-Funken im Menü und Feuerwerk im Abspann.
  if ((phase === "menue" || phase === "intro") && Math.random() < 0.15) funken(Math.random() * B, Math.random() * H, "#3aa0ff", 1);
  if (phase === "outro" && Math.random() < 0.3) funken(Math.random() * B, Math.random() * H * 0.5, "#ffb02e", 8);
  if (phase !== "spielen") return;

  const cfg = cfgAktuell();
  zeitImLevel += dt;
  gesamtZeit += dt;
  if (unverwundbar > 0) unverwundbar -= dt;

  // Bewegung
  let dx = 0, dy = 0;
  if (tasten["a"] || tasten["arrowleft"])  dx -= 1;
  if (tasten["d"] || tasten["arrowright"]) dx += 1;
  if (tasten["w"] || tasten["arrowup"])    dy -= 1;
  if (tasten["s"] || tasten["arrowdown"])  dy += 1;
  if (Math.hypot(analogX + padX, analogY + padY) > 0.15) { dx = analogX + padX; dy = analogY + padY; } // Stick oder Gamepad
  const laenge = Math.hypot(dx, dy);
  if (laenge > 1) { dx /= laenge; dy /= laenge; }
  if (laenge > 0.1) { const l2 = Math.hypot(dx, dy); richtung = { x: dx / l2, y: dy / l2 }; }

  dashPause -= dt;
  let tempo = spieler.tempo * (1 + 0.04 * shop.schuhe) * (effekte.tempo > 0 ? 1.4 : 1);
  if (dashZeit > 0) {
    dashZeit -= dt;
    dx = richtung.x; dy = richtung.y;
    tempo *= 3;
    spurFunken(3); // Spur hinter dir
  }
  spieler.x = Math.max(spieler.radius, Math.min(B - spieler.radius, spieler.x + (dx * tempo + windX) * dt));
  spieler.y = Math.max(spieler.radius, Math.min(H - spieler.radius, spieler.y + (dy * tempo + windY) * dt));
  if (skinAktuell().funkel && laenge > 0 && Math.random() < 0.6) spurFunken(1); // Funkeln beim Laufen

  // Gegner
  zeitBisGegner -= dt;
  if (zeitBisGegner <= 0) {
    if (gegner.length < cfg.maxGegner) neuerGegner(); // Obergrenze pro Level
    zeitBisGegner = Math.max(0.8, cfg.abstand - zeitImLevel * 0.015) * sd().abstand;
  }
  for (const g of gegner) {
    const gx = spieler.x - g.x, gy = spieler.y - g.y;
    const abstand = Math.hypot(gx, gy) || 1;
    let tempo = g.tempo * (effekte.zeit > 0 ? 0.4 : 1); // Zeitlupe
    if (g.typ === "springer") { // Springer: ab und zu ein kurzer, schneller Satz
      g.cd -= dt;
      if (g.cd <= 0) { g.dash = 0.35; g.cd = 2.5; klang.sprung(); }
      if (g.dash > 0) { g.dash -= dt; tempo *= 4; }
    }
    if (g.typ === "schuetze") { // Hält Abstand und schießt auf dich
      if (abstand < 230) tempo *= -0.7;
      g.cd -= dt;
      if (g.cd <= 0 && abstand < 480) { g.cd = 2.8; schuss(g.x, g.y, Math.atan2(gy, gx), 150); klang.schuss(); }
    } else if (g.typ === "teleporter") { // Verschwindet kurz und taucht neben dir wieder auf
      g.cd -= dt;
      if (g.cd <= 0) {
        funken(g.x, g.y, "#c58bff", 10);
        const w = rnd() * Math.PI * 2;
        g.x = Math.max(20, Math.min(B - 20, spieler.x + Math.cos(w) * 170));
        g.y = Math.max(20, Math.min(H - 20, spieler.y + Math.sin(w) * 170));
        funken(g.x, g.y, "#c58bff", 10);
        g.cd = 3.6;
      }
    } else if (g.typ === "splitter") { // Zerfällt nach einigen Sekunden in zwei schnelle Gegner
      g.alter = (g.alter || 0) + dt;
      if (g.alter > 5) {
        g.tot = true;
        funken(g.x, g.y, "#7dff7d", 14);
        for (let s2 = 0; s2 < 2; s2++) gegner.push({ x: g.x, y: g.y, typ: "schnell", radius: 8, tempo: 150 * cfg.tempo, cd: 9, dash: 0 });
      }
    }
    g.x += (gx / abstand) * tempo * dt;
    g.y += (gy / abstand) * tempo * dt;
    if (abstand < g.radius + spieler.radius && dashZeit <= 0 && unverwundbar <= 0 && phase === "spielen") getroffen();
  }
  gegner = gegner.filter((g) => !g.tot);

  // Beute: erscheint, verschwindet nach einer Weile, wird eingesammelt.
  zeitBisBeute -= dt;
  if (zeitBisBeute <= 0 && beute.length < 3) { neueBeute(); zeitBisBeute = 1.4; }
  for (let i = beute.length - 1; i >= 0; i--) {
    const b = beute[i];
    b.leben -= dt;
    if (b.leben <= 0) { beute.splice(i, 1); continue; }
    const bx = spieler.x - b.x, by = spieler.y - b.y, bd = Math.hypot(bx, by) || 1;
    if (shop.magnet > 0 && bd < 70 + 45 * shop.magnet) { b.x += bx / bd * 240 * dt; b.y += by / bd * 240 * dt; } // Magnet

    if (Math.hypot(spieler.x - b.x, spieler.y - b.y) < b.radius + spieler.radius) {
      beute.splice(i, 1);
      funken(b.x, b.y, "#3dffa0", 14);
      klang.beute();
      const wert = b.gold ? 30 : 10; // Gold ist dreimal so viel wert
      if (b.gold) { stats.gold++; erfolgePruefen(); }
      if (cfg.extraktion) rucksack += wert; else sichern(wert); // Level 1: sofort gesichert
    }
  }

  // Wind, Teleporter-Pads, Walzen, Kugeln und Boss
  if (cfg.wind) {
    windZeit -= dt;
    if (windZeit <= 0) { const w = rnd() * Math.PI * 2; windX = Math.cos(w) * 55; windY = Math.sin(w) * 55; windZeit = 5 + rnd() * 3; }
  }
  if (cfg.pads) {
    padCd -= dt;
    pads.forEach((pd, i) => {
      if (padCd <= 0 && Math.hypot(spieler.x - pd.x, spieler.y - pd.y) < 26) {
        const z = pads[1 - i];
        funken(spieler.x, spieler.y, "#c58bff", 14);
        spieler.x = z.x; spieler.y = z.y;
        funken(z.x, z.y, "#c58bff", 14);
        padCd = 1.2;
        klang.tele();
      }
    });
  }
  for (const w of walzen) { // Wandernde Balken: Berührung zählt als Treffer
    w.x += w.v * dt;
    if (w.x > B + 10) w.x = -w.b - 10; else if (w.x < -w.b - 10) w.x = B + 10;
    const nx = Math.max(w.x, Math.min(spieler.x, w.x + w.b)), ny = Math.max(w.y, Math.min(spieler.y, w.y + w.h));
    if (Math.hypot(spieler.x - nx, spieler.y - ny) < spieler.radius && dashZeit <= 0 && unverwundbar <= 0 && phase === "spielen") getroffen();
  }
  for (let i = kugeln.length - 1; i >= 0; i--) {
    const ku = kugeln[i];
    ku.x += ku.vx * dt;
    ku.y += ku.vy * dt;
    if (ku.x < -20 || ku.x > B + 20 || ku.y < -20 || ku.y > H + 20) { kugeln.splice(i, 1); continue; }
    if (Math.hypot(spieler.x - ku.x, spieler.y - ku.y) < 6 + spieler.radius && dashZeit <= 0 && unverwundbar <= 0 && phase === "spielen") { kugeln.splice(i, 1); getroffen(); }
  }
  if (boss) bossUpdate(dt, cfg);

  // Powerups: erscheinen ab und zu, halten kurz und wirken sofort
  zeitBisKraft -= dt;
  if (zeitBisKraft <= 0 && kraft.length === 0) {
    kraft.push({ x: 60 + rnd() * (B - 120), y: 60 + rnd() * (H - 120), art: ["schild", "zeit", "tempo"][Math.floor(rnd() * 3)], leben: 10 });
    zeitBisKraft = 15 + rnd() * 10;
  }
  for (let i = kraft.length - 1; i >= 0; i--) {
    const kr = kraft[i];
    kr.leben -= dt;
    if (kr.leben <= 0) { kraft.splice(i, 1); continue; }
    if (Math.hypot(spieler.x - kr.x, spieler.y - kr.y) < 14 + spieler.radius) {
      kraft.splice(i, 1);
      klang.kraft();
      lvlKrafte++;
      stats.maxKrafte = Math.max(stats.maxKrafte, lvlKrafte);
      erfolgePruefen();
      funken(kr.x, kr.y, kraftFarbe[kr.art], 20);
      if (kr.art === "schild") schildAn = true;
      else if (kr.art === "zeit") effekte.zeit = 5;
      else effekte.tempo = 6;
    }
  }
  effekte.zeit -= dt;
  effekte.tempo -= dt;

  // Schockwelle: wächst vom Startpunkt nach außen und zerstört Gegner
  welleCd -= dt;
  if (welleR > 0) {
    welleR += 700 * dt;
    for (let i = gegner.length - 1; i >= 0; i--) {
      const g = gegner[i];
      if (Math.hypot(g.x - welleX, g.y - welleY) < welleR + g.radius) { funken(g.x, g.y, gegnerArten[g.typ].farbe, 12); gegner.splice(i, 1); }
    }
    for (let i = kugeln.length - 1; i >= 0; i--) if (Math.hypot(kugeln[i].x - welleX, kugeln[i].y - welleY) < welleR) kugeln.splice(i, 1); // Löscht Kugeln
    if (boss && !welleBoss && Math.hypot(boss.x - welleX, boss.y - welleY) < welleR + boss.radius) { welleBoss = true; sichern(10); funken(boss.x, boss.y, "#8ff", 20); } // Schadet dem Boss
    if (welleR > 130 + shop.welle * 35) welleR = 0;
  }

  // Minen: erst ein Warnkreis, dann die Explosion
  if (cfg.minen) {
    zeitBisMine -= dt;
    if (zeitBisMine <= 0) {
      minen.push({
        x: Math.max(60, Math.min(B - 60, spieler.x + (rnd() - 0.5) * 300)),
        y: Math.max(60, Math.min(H - 60, spieler.y + (rnd() - 0.5) * 300)),
        t: 0
      });
      zeitBisMine = cfg.minen;
      klang.warn();
    }
  }
  for (let i = minen.length - 1; i >= 0; i--) {
    const m = minen[i];
    m.t += dt;
    if (m.t < 1.4) continue;
    minen.splice(i, 1);
    funken(m.x, m.y, "#ff7a2e", 30);
    klang.knall();
    if (phase === "spielen" && dashZeit <= 0 && unverwundbar <= 0 && Math.hypot(spieler.x - m.x, spieler.y - m.y) < 50 + spieler.radius) getroffen();
  }

  // Extraktion (erst ab Level 2)
  if (cfg.extraktion) {
    if (Math.hypot(spieler.x - zone.x, spieler.y - zone.y) < zone.radius) {
      if (!inZone && rucksack > 0) klang.zone();
      inZone = true;
      if (rucksack > 0) extraktion += dt;
      if (extraktion >= zone.dauer) {
        sichern(rucksack);
        rucksack = 0; extraktion = 0; meldung = 1.2;
        funken(zone.x, zone.y, "#3aa0ff", 40);
        klang.extrahiert();
        if (cfg.wandert) neueZone();
      }
    } else {
      // Zone verlassen: Der Fortschritt sinkt nur langsam, du darfst kurz fliehen.
      extraktion = Math.max(0, extraktion - dt * 0.5);
      inZone = false;
    }
  }

  // Level geschafft?
  if (phase === "spielen" && punkte >= cfg.ziel) {
    const bonus = 3 + (modus === "tages" ? 10 : lvl);
    muenzen += bonus; verdient += bonus; stats.muenzenGesamt += bonus; // Bonus fürs Schaffen
    if (modus === "level") {
      neuerRekord = !rekord[lvl] || zeitImLevel < rekord[lvl];
      if (neuerRekord) rekord[lvl] = zeitImLevel;
      abgeschlossen(lvl);
      stats.levelGeschafft++;
      if (lvlTreffer === 0 && lvl >= 4) stats.sauber++;
      if (lvl === 98) stats.finale++;
      phase = (lvl === levels.length - 1 || lvl === 9) ? "outro" : "geschafft";
    } else {
      stats.tage++;
      tagesBest[tagKey] = Math.min(tagesBest[tagKey] || 1e9, zeitImLevel);
      phase = "geschafft";
    }
    if (cfg.boss && boss) { stats.bosse++; funken(boss.x, boss.y, "#ff4de0", 90); boss = null; kugeln = []; }
    szeneZeit = 0;
    funken(spieler.x, spieler.y, "#3dffa0", 60);
    if (phase === "outro") klang.sieg(); else klang.geschafft();
    erfolgePruefen();
    speichern();
  }
}
