// Dieser Code läuft im Spiel (siehe balance.js). Der Bot spielt wie ein durchschnittlicher Mensch:
// Er sammelt Beute, sichert sie in der Zone, weicht Gefahren aus und nutzt Dash und Schockwelle.
const botKonfig = { reaktion: 3, dashAbstand: 56, fluchtRadius: 95, fluchtGewicht: 2.6 };

function botSchritt() {
  const cfg = cfgAktuell();
  let fx = 0, fy = 0, nah = 1e9, nahe = 0;
  const gefahr = (x, y, r, gew) => {
    const dx = spieler.x - x, dy = spieler.y - y, d = Math.hypot(dx, dy) || 1;
    nah = Math.min(nah, d);
    if (d < r) { const w = (1 - d / r) * gew; fx += dx / d * w; fy += dy / d * w; nahe++; }
  };
  for (const g of gegner) gefahr(g.x, g.y, botKonfig.fluchtRadius + g.radius + g.tempo * 0.45, 2.4); // Schnelle Gegner brauchen mehr Abstand
  for (const k of kugeln) gefahr(k.x, k.y, 75, 2.2);
  for (const m of minen) gefahr(m.x, m.y, 100, 3);
  if (boss) gefahr(boss.x, boss.y, 120 + boss.radius, 1.6);
  for (const w of walzen) {
    const dy = spieler.y - (w.y + w.h / 2);
    if (Math.abs(dy) < 50 && spieler.x > w.x - 80 && spieler.x < w.x + w.b + 80) fy += Math.sign(dy || 1) * 2;
  }
  if (spieler.x < 50) fx += 1;
  if (spieler.x > B - 50) fx -= 1;
  if (spieler.y < 50) fy += 1;
  if (spieler.y > H - 50) fy -= 1;
  if (nahe >= 2) { fx += (B / 2 - spieler.x) / B * 1.2; fy += (H / 2 - spieler.y) / H * 1.2; }
  let tx = spieler.x, ty = spieler.y;
  if (cfg.extraktion && rucksack > 0 && (rucksack >= 30 || beute.length === 0 || punkte + rucksack >= cfg.ziel)) { tx = zone.x; ty = zone.y; }
  else if (beute.length) {
    let best = null, bd = 1e9;
    for (const b of beute) {
      const d = Math.hypot(b.x - spieler.x, b.y - spieler.y) - (b.gold ? 60 : 0);
      if (d < bd && b.leben * 150 > d) { bd = d; best = b; } // Nur Beute, die man noch erreicht
    }
    if (best) { tx = best.x; ty = best.y; }
  } else if (cfg.extraktion) { tx = zone.x; ty = zone.y; }
  let gx = tx - spieler.x, gy = ty - spieler.y;
  const gl = Math.hypot(gx, gy) || 1;
  gx /= gl; gy /= gl;
  const vx = gx + fx * botKonfig.fluchtGewicht, vy = gy + fy * botKonfig.fluchtGewicht, vl = Math.hypot(vx, vy) || 1;
  analogX = vx / vl; analogY = vy / vl;
  if (dashPause <= 0 && (nah < botKonfig.dashAbstand || nahe >= 4)) knopfAktion("dash");
  if (ws() > 0 && welleCd <= 0 && nahe >= 3) welleStarten();
}

// Fortschrittsmodell: Wer weit gekommen ist, hat auch im Shop gekauft. So viel nehmen wir pro Level an.
function botBuild(i) {
  shop.leben = Math.min(3, Math.floor(i / 14));
  shop.schild = i >= 6 ? 1 : 0;
  shop.magnet = Math.min(3, Math.floor(i / 25));
  shop.schuhe = Math.min(5, Math.floor(i / 18));
  shop.welle = Math.min(4, Math.max(0, Math.floor((i - 20) / 14)));
  talente.haut = Math.min(3, Math.floor(i / 25));
  talente.dash = Math.min(3, Math.floor(i / 30));
  talente.sammler = Math.min(3, Math.floor(i / 33));
}

function botLauf(i, maxS) {
  botBuild(i);
  modus = "level"; startLevel(i); banner = 0;
  let t = 0;
  const dt = 1 / 60;
  while (phase === "spielen" && t < maxS) {
    if (Math.round(t * 60) % botKonfig.reaktion === 0) botSchritt();
    update(dt);
    t += dt;
  }
  analogX = 0; analogY = 0;
  return { ok: phase === "geschafft" || phase === "outro", zeit: zeitImLevel, treffer: lvlTreffer };
}

function botRate(i, n, maxS) {
  let ok = 0, zeit = 0;
  for (let k = 0; k < n; k++) { const r = botLauf(i, maxS); if (r.ok) { ok++; zeit += r.zeit; } }
  return { rate: ok / n, zeit: ok ? zeit / ok : 0 };
}

function botSetze(i, m) { // Feinjustierung eines Levels ändern
  const l = levels[i];
  l.m = m; l.tempo = l.tempo0 * m; l.abstand = l.abstand0 / m;
}

function botVorbereiten(seed) { // Neutrale Bedingungen: kein Event, keine Upgrades, kein Speichern
  for (const k of ["dunkel", "wind", "minen", "geist", "tempo", "muenzen"]) delete eventAktiv[k];
  speichern = function () {};
  einst.stumm = true; einst.schwer = 1;
  Math.random = mulberry32(seed || 12345);
}
