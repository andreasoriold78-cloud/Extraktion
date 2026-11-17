// Zeichnen: Alles, was auf dem Bildschirm zu sehen ist.

// Zeichnet die Figur in der Form des Skins
function figur(form, x, y, r, farbe, glanz, winkel) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(winkel);
  ctx.shadowColor = farbe;
  ctx.shadowBlur = glanz * glow;
  ctx.fillStyle = farbe;
  ctx.beginPath();
  if (form === "kreis") ctx.arc(0, 0, r, 0, Math.PI * 2);
  else if (form === "dreieck") { ctx.moveTo(r * 1.2, 0); ctx.lineTo(-r * 0.9, r * 0.9); ctx.lineTo(-r * 0.9, -r * 0.9); ctx.closePath(); }
  else if (form === "raute") { ctx.moveTo(r * 1.15, 0); ctx.lineTo(0, r * 1.15); ctx.lineTo(-r * 1.15, 0); ctx.lineTo(0, -r * 1.15); ctx.closePath(); }
  else if (form === "quadrat") ctx.rect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
  else { // Stern mit fünf Zacken
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 === 0 ? r * 1.25 : r * 0.55, w = i * Math.PI / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(w) * rr, Math.sin(w) * rr);
    }
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

function kreis(x, y, r, farbe, glanz) {
  ctx.shadowColor = farbe;
  ctx.shadowBlur = (glanz) * glow;
  ctx.fillStyle = farbe;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Hindernisse und Boss in der Spielwelt: Pads, Walzen, Boss, Kugeln
function zeichneWelt(zeit, cfg) {
  if (cfg.pads && pads.length) {
    ctx.strokeStyle = "#c58bff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#c58bff";
    ctx.shadowBlur = 14 * glow;
    ctx.setLineDash([5, 8]);
    ctx.beginPath(); ctx.moveTo(pads[0].x, pads[0].y); ctx.lineTo(pads[1].x, pads[1].y); ctx.stroke();
    ctx.setLineDash([]);
    pads.forEach((pd) => { ctx.beginPath(); ctx.arc(pd.x, pd.y, 24 + Math.sin(zeit * 4) * 2, 0, Math.PI * 2); ctx.stroke(); });
    ctx.shadowBlur = 0;
  }
  for (const w of walzen) {
    ctx.shadowColor = "#ff7a2e";
    ctx.shadowBlur = 12 * glow;
    ctx.fillStyle = "#ff7a2e";
    ctx.fillRect(w.x, w.y, w.b, w.h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#2a1208"; // Warnstreifen
    for (let x = w.x + 8; x < w.x + w.b; x += 22) ctx.fillRect(x, w.y, 8, w.h);
  }
  if (boss) {
    kreis(boss.x, boss.y, boss.radius + Math.sin(zeit * 4) * 2, "#ff4de0", 28);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#22061f";
    ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.radius * 0.62, 0, Math.PI * 2); ctx.fill();
    const a = Math.atan2(spieler.y - boss.y, spieler.x - boss.x);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(boss.x + Math.cos(a) * 9, boss.y + Math.sin(a) * 9, 8, 0, Math.PI * 2); ctx.fill(); // Das Auge folgt dir
    if (einst.farbenblind) { ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.radius + 6, 0, Math.PI * 2); ctx.stroke(); }
  }
  for (const ku of kugeln) kreis(ku.x, ku.y, 6, einst.farbenblind ? "#F0E442" : "#ff7a2e", 12);
  ctx.shadowBlur = 0;
}

// Zusätzliche Anzeigen: Boss-Leiste, Endlos-Zeit, Wind, Touch-Knöpfe
function zeichneExtras(cfg) {
  ctx.textAlign = "center";
  if (boss) {
    ctx.fillStyle = "#1c2936";
    ctx.fillRect(B / 2 - 150, 12, 300, 10);
    ctx.fillStyle = "#ff4de0";
    ctx.fillRect(B / 2 - 150, 12, 300 * Math.max(0, 1 - punkte / cfg.ziel), 10);
    ctx.fillStyle = "#e3e7ea";
    ctx.font = "13px sans-serif";
    ctx.fillText(cfg.name, B / 2, 38);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "#e3e7ea";
  ctx.font = "18px sans-serif";
  if (modus === "endlos") ctx.fillText("Zeit: " + Math.floor(zeitImLevel) + " s", 16, 90);
  if (cfg.wind || ev().wind) {
    ctx.save();
    ctx.translate(B - 70, 150);
    ctx.rotate(Math.atan2(windY, windX));
    ctx.strokeStyle = "#99bbdd";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(12, -8); ctx.moveTo(22, 0); ctx.lineTo(12, 8); ctx.stroke();
    ctx.restore();
    ctx.textAlign = "center";
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#99bbdd";
    ctx.fillText("Wind", B - 70, 180);
  }
  if (einst.touch) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#e3e7ea";
    ctx.fillStyle = "#e3e7ea";
    ctx.lineWidth = 3;
    const sx = stick.id !== null ? stick.x0 : 110, sy = stick.id !== null ? stick.y0 : H - 110;
    ctx.beginPath(); ctx.arc(sx, sy, 55, 0, Math.PI * 2); ctx.stroke();
    if (stick.id !== null) { ctx.beginPath(); ctx.arc(sx + analogX * 55, sy + analogY * 55, 22, 0, Math.PI * 2); ctx.fill(); }
    ctx.textAlign = "center";
    ctx.font = "bold 16px sans-serif";
    for (const b of tasteKnoepfe()) {
      if (b.k === "welle" && ws() < 1) continue;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillText(b.k === "dash" ? "Dash" : b.k === "welle" ? "Welle" : "II", b.x, b.y + 5);
    }
    ctx.globalAlpha = 1;
  }
}

// Pause und Erfolgs-Hinweis liegen über allem
function zeichneEnde() {
  if (pausiert) overlay("Pause", "P oder Tippen: weiter. Esc: Menü.");
  if (toast.zeit > 0) {
    ctx.globalAlpha = Math.min(1, toast.zeit);
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(B / 2 - 230, 48, 460, 32);
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(toast.text, B / 2, 69);
    ctx.globalAlpha = 1;
  }
}

function overlay(titel, zeile) {
  ctx.fillStyle = "rgba(6, 10, 14, 0.7)";
  ctx.fillRect(0, 0, B, H);
  ctx.fillStyle = "#e3e7ea";
  ctx.textAlign = "center";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText(titel, B / 2, H / 2 - 10);
  ctx.font = "20px sans-serif";
  ctx.fillText(zeile, B / 2, H / 2 + 30);
}

// Intro: Text blendet nacheinander ein, unten rennst du vor einem Gegner zur Zone.
const introText = [
  "Die Oberfläche ist verlassen.",
  "Draußen jagen Maschinen alles, was sich bewegt.",
  "Aber dort liegt Beute, die du zum Überleben brauchst.",
  "Sammle sie ein und erreiche die blaue Zone. Dort kommst du raus."
];

function einblenden(start) { return Math.max(0, Math.min(1, (szeneZeit - start) / 0.8)); }

function zeichneIntro(zeit) {
  ctx.fillStyle = "rgba(6, 10, 14, 0.6)";
  ctx.fillRect(0, 0, B, H);
  ctx.textAlign = "center";
  ctx.globalAlpha = einblenden(0.3);
  ctx.shadowColor = "#ffb02e";
  ctx.shadowBlur = (20) * glow;
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 52px sans-serif";
  ctx.fillText("EXTRAKTION", B / 2, 90);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#e3e7ea";
  ctx.font = "20px sans-serif";
  introText.forEach((z, i) => {
    ctx.globalAlpha = einblenden(1.5 + i * 2.2);
    ctx.fillText(z, B / 2, 170 + i * 40);
  });
  ctx.globalAlpha = 1;
  const f = Math.min(1, szeneZeit / 12);
  const px = 90 + f * 580;
  ctx.strokeStyle = "#3aa0ff";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#3aa0ff";
  ctx.shadowBlur = (16) * glow;
  ctx.beginPath(); ctx.arc(700, 410, 42, 0, Math.PI * 2); ctx.stroke();
  kreis(px, 410, 14, "#ffb02e", 18);
  kreis(px - 110 + f * 50, 410, 12, "#ff4d5e", 18);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#94a0aa";
  ctx.font = "16px sans-serif";
  ctx.globalAlpha = szeneZeit > 10 ? 0.6 + Math.sin(zeit * 4) * 0.4 : 0.5;
  ctx.fillText(szeneZeit > 10 ? "Leertaste: zum Menü" : "Leertaste: überspringen", B / 2, 475);
  ctx.globalAlpha = 1;
}

// Outro: Der Abspann läuft von unten nach oben durch, dazu Feuerwerk.
function zeichneOutro() {
  ctx.fillStyle = "rgba(6, 10, 14, 0.4)";
  ctx.fillRect(0, 0, B, H);
  const zeilen = ["Du bist raus!", ""];
  if (gesamtZeit > 0) zeilen.push("Zeit: " + Math.round(gesamtZeit) + " s", "Niederlagen: " + tode, "");
  zeilen.push("Idee und Spieltests: Andi", "Programmiert mit Claude", "", "Danke fürs Spielen");
  const ende = H + 20 + (zeilen.length - 1) * 38 - 420;  // So weit läuft der Text, dann bleibt er stehen
  const versatz = Math.min(szeneZeit * 45, ende);
  ctx.textAlign = "center";
  zeilen.forEach((z, i) => {
    ctx.fillStyle = i === 0 ? "#ffb02e" : "#e3e7ea";
    ctx.font = i === 0 ? "bold 44px sans-serif" : "22px sans-serif";
    ctx.fillText(z, B / 2, H + 20 + i * 38 - versatz);
  });
  ctx.fillStyle = "#94a0aa";
  ctx.font = "16px sans-serif";
  ctx.fillText(szeneZeit * 45 >= ende ? "Leertaste: zurück zum Menü" : "Leertaste: überspringen", B / 2, 475);
}

// Eine Zeile in Menü oder Shop: Text links, Wert rechts
function zeile(p, nr, text, rechts, farbeRechts, gesperrt) {
  ctx.fillStyle = gesperrt ? "rgba(255, 255, 255, 0.02)" : nr === auswahl ? "rgba(255, 176, 46, 0.18)" : "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(p.x, p.y, p.b, p.h);
  if (nr === auswahl) {
    ctx.strokeStyle = gesperrt ? "#3b444c" : "#ffb02e";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.b, p.h);
  }
  ctx.font = p.b < 250 ? "bold 15px sans-serif" : "bold 17px sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = gesperrt ? "#3b444c" : "#e3e7ea"; // Gesperrte Level sind ausgegraut
  ctx.fillText(text, p.x + 14, p.y + p.h / 2 + 6);
  ctx.textAlign = "right";
  ctx.fillStyle = farbeRechts;
  ctx.fillText(rechts, p.x + p.b - 14, p.y + p.h / 2 + 6);
}

function zeichneMenue(zeit) {
  ctx.fillStyle = "rgba(6, 10, 14, 0.6)";
  ctx.fillRect(0, 0, B, H);
  ctx.textAlign = "center";
  ctx.shadowColor = "#ffb02e";
  ctx.shadowBlur = (18 + Math.sin(zeit * 3) * 8) * glow;
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText("EXTRAKTION", B / 2, 58);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#94a0aa";
  ctx.font = "16px sans-serif";
  ctx.fillText("Level " + (seite * 10 + 1) + " bis " + Math.min(levels.length, seite * 10 + 10), 240, 96);
  ctx.fillText("Modi", 615, 98);
  ctx.font = "13px sans-serif";
  ctx.fillText("Event der Woche: " + eventAktiv.name + ". " + eventAktiv.info, B / 2, 72);
  const aktionen = {
    endlos: ["Endlosmodus", endlosBest ? "Best " + Math.floor(endlosBest) + " s" : ""],
    tages: ["Tageschallenge", tagesBest[tagKey] ? "heute " + tagesBest[tagKey].toFixed(1) + " s" : "neu"],
    shopknopf: ["Shop", Math.floor(muenzen) + " Münzen"],
    erfolge: ["Erfolge", Object.keys(erreicht).length + "/" + erfolgeListe.length],
    optionen: ["Einstellungen", ""],
    klasse: ["Klasse", klasseAktuell().name],
    talente: ["Talente", talentPunkte() + " frei"]
  };
  menuePunkte().forEach((p, nr) => {
    if (p.art === "seite") zeile(p, nr, p.d < 0 ? "<" : ">", "", "#fff", false);
    else if (p.art === "level") zeile(p, nr, "Level " + (p.i + 1) + ": " + levels[p.i].name, rekord[p.i] ? "Rekord " + rekord[p.i].toFixed(1) + " s" : "", "#3dffa0", p.i >= freigeschaltet);
    else zeile(p, nr, aktionen[p.k][0], aktionen[p.k][1], "#ffb02e", false);
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a0aa";
  ctx.font = "14px sans-serif";
  ctx.fillText("Ein Level wird frei, wenn du das davor geschafft hast. Q und E blättern durch die Level.", B / 2, 478);
  ctx.fillText("Pfeiltasten und Leertaste oder Maus. Im Spiel öffnet Esc dieses Menü.", B / 2, 496);
}

function zeichneOptionen() {
  ctx.fillStyle = "rgba(6, 10, 14, 0.85)";
  ctx.fillRect(0, 0, B, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText("EINSTELLUNGEN", B / 2, 50);
  const label = { volSound: "Soundeffekte", volMusik: "Musik", schwer: "Schwierigkeit", farbenblind: "Farbenblind-Modus", sparmodus: "Sparmodus (weniger Effekte)", touch: "Touch-Steuerung", tutorial: "Tutorial", intro: "Intro", outro: "Outro", zurueck: "Zurück" };
  optPunkte().forEach((p, nr) => {
    const wert = p.k === "volSound" || p.k === "volMusik" ? Math.round(einst[p.k] * 100) + " %"
      : p.k === "schwer" ? schwerTab[einst.schwer].name
      : p.k === "tutorial" || p.k === "intro" || p.k === "outro" ? "ansehen"
      : p.k === "zurueck" ? "Esc" : einst[p.k] ? "an" : "aus";
    zeile(p, nr, label[p.k], wert, p.k === "tutorial" || p.k === "intro" || p.k === "outro" ? "#ffb02e" : "#3dffa0", false);
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a0aa";
  ctx.font = "14px sans-serif";
  ctx.fillText("Links und Rechts ändern den Wert. Schwer gibt mehr Münzen. M schaltet alles stumm.", B / 2, 478);
}

function zeichneErfolge() {
  ctx.fillStyle = "rgba(6, 10, 14, 0.85)";
  ctx.fillRect(0, 0, B, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("ERFOLGE", B / 2, 58);
  erfolgePunkte().forEach((p, nr) => zeile(p, nr, p.e.name, erreicht[p.e.id] ? "erreicht" : "+" + p.e.lohn + " M", erreicht[p.e.id] ? "#3dffa0" : "#94a0aa", false));
  const sel = erfolgePunkte()[auswahl];
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a0aa";
  ctx.font = "15px sans-serif";
  ctx.fillText(sel ? sel.e.info : "", B / 2, 450);
  ctx.fillText("Esc: zurück", B / 2, 478);
}

function zeichneKlasse() {
  ctx.fillStyle = "rgba(6, 10, 14, 0.85)";
  ctx.fillRect(0, 0, B, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("KLASSE", B / 2, 52);
  ctx.fillStyle = "#e3e7ea";
  ctx.font = "18px sans-serif";
  ctx.fillText("Münzen: " + Math.floor(muenzen), B / 2, 80);
  klassePunkte().forEach((p, nr) => {
    const habe = klassenBesitz.includes(p.k.id), aktiv = klasseAktiv === p.k.id;
    ctx.fillStyle = nr === auswahl ? "rgba(255, 176, 46, 0.18)" : "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(p.x, p.y, p.b, p.h);
    if (nr === auswahl) { ctx.strokeStyle = "#ffb02e"; ctx.lineWidth = 2; ctx.strokeRect(p.x, p.y, p.b, p.h); }
    ctx.textAlign = "left";
    ctx.fillStyle = "#e3e7ea";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(p.k.name, p.x + 16, p.y + 32);
    ctx.fillStyle = "#94a0aa";
    ctx.font = "14px sans-serif";
    const worte = p.k.info.split(" "); let zl = "", y = p.y + 58;
    for (const w of worte) { if ((zl + w).length > 38) { ctx.fillText(zl, p.x + 16, y); zl = ""; y += 18; } zl += w + " "; }
    ctx.fillText(zl, p.x + 16, y);
    ctx.textAlign = "right";
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = aktiv ? "#ffb02e" : habe ? "#3dffa0" : muenzen >= p.k.preis ? "#3dffa0" : "#ff4d5e";
    ctx.fillText(aktiv ? "aktiv" : habe ? "wählen" : p.k.preis + " M", p.x + p.b - 16, p.y + 32);
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a0aa";
  ctx.font = "14px sans-serif";
  ctx.fillText("Esc: zurück", B / 2, 478);
}

function zeichneTalente() {
  ctx.fillStyle = "rgba(6, 10, 14, 0.85)";
  ctx.fillRect(0, 0, B, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("TALENTE", B / 2, 52);
  ctx.fillStyle = "#e3e7ea";
  ctx.font = "18px sans-serif";
  ctx.fillText("Freie Punkte: " + talentPunkte(), B / 2, 80);
  talentZeilen().forEach((p, nr) => {
    const stufe = talente[p.t.id];
    ctx.fillStyle = nr === auswahl ? "rgba(255, 176, 46, 0.18)" : "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(p.x, p.y, p.b, p.h);
    if (nr === auswahl) { ctx.strokeStyle = "#ffb02e"; ctx.lineWidth = 2; ctx.strokeRect(p.x, p.y, p.b, p.h); }
    ctx.textAlign = "left";
    ctx.fillStyle = "#e3e7ea";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(p.t.name, p.x + 16, p.y + 26);
    ctx.fillStyle = "#94a0aa";
    ctx.font = "14px sans-serif";
    ctx.fillText(p.t.info, p.x + 16, p.y + 48);
    for (let i = 0; i < 3; i++) { // Drei Stufen als Kreise
      ctx.fillStyle = i < stufe ? "#3dffa0" : "#2a343e";
      ctx.beginPath(); ctx.arc(p.x + p.b - 120 + i * 30, p.y + 24, 9, 0, Math.PI * 2); ctx.fill();
    }
    ctx.textAlign = "right";
    ctx.font = "14px sans-serif";
    ctx.fillStyle = stufe >= 3 ? "#5b6670" : talentPunkte() >= stufe + 1 ? "#3dffa0" : "#ff4d5e";
    ctx.fillText(stufe >= 3 ? "max" : "Kosten: " + (stufe + 1) + " P", p.x + p.b - 16, p.y + 50);
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a0aa";
  ctx.fillText("Esc: zurück", B / 2, 478);
}

function zeichneTutorial() {
  ctx.fillStyle = "rgba(6, 10, 14, 0.88)";
  ctx.fillRect(0, 0, B, H);
  const sz = tutSeiten[tutSeite];
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(sz[0], B / 2, 130);
  ctx.fillStyle = "#e3e7ea";
  ctx.font = "20px sans-serif";
  ctx.fillText(sz[1], B / 2, 210);
  ctx.fillText(sz[2], B / 2, 250);
  for (let i = 0; i < tutSeiten.length; i++) { // Seitenpunkte
    ctx.fillStyle = i === tutSeite ? "#ffb02e" : "#3b444c";
    ctx.beginPath(); ctx.arc(B / 2 - 45 + i * 30, 330, 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#94a0aa";
  ctx.font = "16px sans-serif";
  ctx.fillText(tutSeite < tutSeiten.length - 1 ? "Leertaste oder Tippen: weiter" : "Leertaste oder Tippen: los geht's", B / 2, 400);
}

function zeichneShop(zeit) {
  ctx.fillStyle = "rgba(6, 10, 14, 0.85)";
  ctx.fillRect(0, 0, B, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffb02e";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("SHOP", B / 2, 48);
  ctx.fillStyle = "#e3e7ea";
  ctx.font = "18px sans-serif";
  ctx.fillText("Münzen: " + Math.floor(muenzen), B / 2, 78);
  const preisFarbe = (preis) => muenzen >= preis ? "#3dffa0" : "#ff4d5e";
  shopPunkte().forEach((p, nr) => {
    if (p.art === "up") {
      const stufe = shop[p.u.id], max = p.u.preise.length;
      zeile(p, nr, p.u.name + " " + stufe + "/" + max, stufe >= max ? "max" : p.u.preise[stufe] + " M", stufe >= max ? "#5b6670" : preisFarbe(p.u.preise[stufe]), false);
    } else if (p.art === "skin") {
      const habe = skinsBesitz.includes(p.s.id);
      zeile(p, nr, p.s.name, p.s.id === skinAktiv ? "aktiv" : habe ? "wählen" : p.s.preis + " M", p.s.id === skinAktiv ? "#ffb02e" : habe ? "#3dffa0" : preisFarbe(p.s.preis), false);
    } else zeile(p, nr, "Zurück", "Esc", "#94a0aa", false);
  });
  // Vorschau des markierten Skins (oder des ausgerüsteten, wenn ein Upgrade markiert ist)
  const sel = shopPunkte()[auswahl];
  const sk = sel && sel.s ? sel.s : skinAktuell();
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(360, 392, 400, 70);
  const links = Math.cos(zeit * 2) < 0;
  figur(sk.form, 410 + 40 * Math.sin(zeit * 2), 427, 18, sk.farbe || spielerFarbe(zeit), 18, sk.form === "dreieck" ? (links ? Math.PI : 0) : skinWinkel(sk.form, zeit));
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";
  ctx.fillStyle = "#e3e7ea";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(sk.name, 490, 418);
  ctx.fillStyle = "#94a0aa";
  ctx.font = "13px sans-serif";
  ctx.fillText(sk.info, 490, 440);
  ctx.textAlign = "center";
  ctx.font = "15px sans-serif";
  ctx.fillText(sel && sel.u ? sel.u.info : sel && sel.s ? "Klicken zum Kaufen oder Ausrüsten." : "Zurück zum Menü.", B / 2, 486);
}

function draw(zeit) {
  const cfg = cfgAktuell();
  glow = einst.sparmodus ? 0 : skala; // Sparmodus: keine Leuchteffekte
  ctx.setTransform(canvas.width / B, 0, 0, canvas.height / H, 0, 0); // Ab hier rechnen wir in 800 x 500
  ctx.clearRect(0, 0, B, H);
  ctx.save();
  if (wackeln > 0) ctx.translate((Math.random() - 0.5) * 24 * wackeln, (Math.random() - 0.5) * 24 * wackeln);

  // Hintergrund mit Lichtkegel und Raster
  const th = themen[cfg.bg];
  const verlauf = ctx.createRadialGradient(B / 2, H / 2, 80, B / 2, H / 2, B * 0.7);
  verlauf.addColorStop(0, th.innen);
  verlauf.addColorStop(1, th.aussen);
  ctx.fillStyle = verlauf;
  ctx.fillRect(-30, -30, B + 60, H + 60);
  ctx.strokeStyle = th.raster;
  ctx.lineWidth = 1;
  for (let x = 0; x <= B; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(B, y); ctx.stroke(); }

  // Schwebeteilchen im Hintergrund
  ctx.fillStyle = th.punkt;
  for (const st of einst.sparmodus ? [] : sterne) {
    ctx.globalAlpha = 0.25 + 0.25 * Math.sin(zeit * 2 + st.x);
    ctx.fillRect(st.x, st.y, st.s, st.s);
  }
  ctx.globalAlpha = 1;

  // Extraktionszone mit leichtem Pulsieren
  if (cfg.extraktion) {
    const r = zone.radius * (1 + Math.sin(zeit * 4) * 0.04);
    ctx.shadowColor = "#3aa0ff";
    ctx.shadowBlur = (22) * glow;
    ctx.fillStyle = "rgba(58, 160, 255, 0.10)";
    ctx.beginPath(); ctx.arc(zone.x, zone.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3aa0ff";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -zeit * 20; // Der Rand dreht sich
    ctx.beginPath(); ctx.arc(zone.x, zone.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    if (extraktion > 0) {
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, r, -Math.PI / 2, -Math.PI / 2 + (extraktion / zone.dauer) * Math.PI * 2);
      ctx.stroke();
    }
  }

  // Beute pulsiert und blendet am Ende aus
  for (const b of beute) {
    ctx.globalAlpha = Math.min(1, b.leben / 3);
    kreis(b.x, b.y, b.radius + Math.sin(zeit * 5 + b.versatz) * 1.5, b.gold ? "#ffd700" : cfg.boss ? "#ff9bf5" : "#3dffa0", b.gold ? 24 : 16);
  }
  ctx.globalAlpha = 1;

  zeichneWelt(zeit, cfg);
  for (const kr of kraft) { // Powerups: Ring mit Buchstabe
    const f = kraftFarbe[kr.art];
    ctx.globalAlpha = Math.min(1, kr.leben / 2);
    ctx.shadowColor = f;
    ctx.shadowBlur = 18 * glow;
    ctx.strokeStyle = f;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(kr.x, kr.y, 14 + Math.sin(zeit * 6) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = f;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(kraftBuchstabe[kr.art], kr.x, kr.y + 5);
  }
  ctx.globalAlpha = 1;
  if (welleR > 0) { // Schockwelle
    ctx.globalAlpha = Math.max(0, 1 - welleR / (130 + ws() * 35));
    ctx.strokeStyle = "#8ff";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(welleX, welleY, welleR, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for (const m of minen) { // Warnkreis wächst, dann knallt es
    ctx.shadowColor = "#ff7a2e";
    ctx.shadowBlur = (14) * glow;
    ctx.strokeStyle = "#ff7a2e";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(zeit * 12));
    ctx.beginPath(); ctx.arc(m.x, m.y, 50, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255, 122, 46, 0.35)";
    ctx.beginPath(); ctx.arc(m.x, m.y, 50 * (m.t / 1.4), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const g of gegner) {
    if ((g.typ === "springer" && g.cd < 0.5 && g.dash <= 0) || (g.typ === "teleporter" && g.cd < 0.6)) { // Warnring vor dem Sprung
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.radius + 8 + Math.sin(zeit * 30) * 2, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = g.typ === "geist" ? 0.15 + 0.85 * Math.abs(Math.sin(zeit * 1.5 + g.x)) : 1; // Geister flackern
    const art = gegnerArten[g.typ];
    if (einst.farbenblind) figur(art.form, g.x, g.y, g.radius, art.cb, 14 + Math.sin(zeit * 6 + g.x) * 5, 0); // Farbenblind: andere Formen und Farben
    else kreis(g.x, g.y, g.radius, art.farbe, 14 + Math.sin(zeit * 6 + g.x) * 5); // Pulsierendes Leuchten
  }
  if (phase !== "verloren") {
    ctx.globalAlpha = 1;
    if (unverwundbar > 0 && Math.sin(zeit * 40) > 0) ctx.globalAlpha = 0.35; // Blinken nach einem Treffer
    const sk = skinAktuell();
    figur(sk.form, spieler.x, spieler.y, spieler.radius, spielerFarbe(zeit), dashZeit > 0 ? 30 : 18, skinWinkel(sk.form, zeit));
    if (schildAn) { // Schildring
      ctx.shadowColor = "#3aa0ff";
      ctx.shadowBlur = 14 * glow;
      ctx.strokeStyle = "#3aa0ff";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(spieler.x, spieler.y, spieler.radius + 7, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath(); ctx.arc(spieler.x - 5, spieler.y - 5, 4, 0, Math.PI * 2); ctx.fill();
  }

  ctx.shadowBlur = 0;
  for (const t of teilchen) {
    ctx.globalAlpha = Math.max(0, t.leben / t.start);
    ctx.fillStyle = t.farbe;
    ctx.fillRect(t.x - 1.5, t.y - 1.5, 3, 3);
  }
  ctx.globalAlpha = 1;
  if ((cfg.dunkel || ev().dunkel) && phase === "spielen") { // Nur ein Lichtkegel um dich herum
    const licht = ctx.createRadialGradient(spieler.x, spieler.y, 90, spieler.x, spieler.y, 270);
    licht.addColorStop(0, "rgba(3, 5, 9, 0)");
    licht.addColorStop(1, "rgba(3, 5, 9, 0.78)");
    ctx.shadowBlur = 0;
    ctx.fillStyle = licht;
    ctx.fillRect(-30, -30, B + 60, H + 60);
  }
  ctx.restore();

  if (phase === "menue") { zeichneMenue(zeit); return; }
  if (phase === "shop") { zeichneShop(zeit); return; }
  if (phase === "optionen") { zeichneOptionen(); return; }
  if (phase === "erfolge") { zeichneErfolge(); return; }
  if (phase === "klasse") { zeichneKlasse(); return; }
  if (phase === "talente") { zeichneTalente(); return; }
  if (phase === "tutorial") { zeichneTutorial(); return; }
  if (phase === "intro") { zeichneIntro(zeit); return; }
  if (phase === "outro") { zeichneOutro(); return; }

  // Anzeigen (wackeln nicht mit)
  ctx.fillStyle = "#e3e7ea";
  ctx.textAlign = "left";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(titel(cfg), 16, 30);
  ctx.font = "18px sans-serif";
  ctx.fillText("Punkte: " + punkte + (cfg.ziel === Infinity ? "" : " / " + cfg.ziel) + (cfg.extraktion ? "   Rucksack: " + rucksack : ""), 16, 56);
  ctx.fillStyle = "#1c2936";
  ctx.fillRect(16, 66, 200, 6);
  ctx.fillStyle = "#3dffa0";
  ctx.fillRect(16, 66, 200 * Math.min(1, punkte / cfg.ziel), 6);
  ctx.fillStyle = "#e3e7ea";
  ctx.textAlign = "right";
  ctx.fillText(dashPause > 0 ? "Dash: " + dashPause.toFixed(1) + " s" : "Dash bereit (Shift)", B - 16, 30);
  ctx.fillText("Münzen: " + Math.floor(muenzen), B - 16, 54);
  ctx.fillText("Leben: " + leben + (schildAn ? " + Schild" : ""), B - 16, 78);
  if (ws() > 0) ctx.fillText(welleCd > 0 ? "Welle: " + welleCd.toFixed(1) + " s" : "Welle bereit (E)", B - 16, 102);
  ctx.textAlign = "center";
  ctx.fillStyle = "#c58bff";
  if (effekte.zeit > 0) ctx.fillText("Zeitlupe " + effekte.zeit.toFixed(1) + " s", B / 2, H - 16);
  ctx.fillStyle = "#ffe14d";
  if (effekte.tempo > 0) ctx.fillText("Turbo " + effekte.tempo.toFixed(1) + " s", B / 2, H - 38);
  zeichneExtras(cfg);

  if (meldung > 0) {
    ctx.textAlign = "center";
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#3aa0ff";
    ctx.fillText("Gesichert!", B / 2, 60);
  }
  if (banner > 0 && phase === "spielen") {
    ctx.globalAlpha = Math.min(1, banner);
    const dy = banner > 2.5 ? (banner - 2.5) * 60 : 0; // Banner gleitet ein
    ctx.textAlign = "center";
    ctx.fillStyle = "#e3e7ea";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(titel(cfg), B / 2, H / 2 - 70 + dy);
    ctx.font = "18px sans-serif";
    ctx.fillText(cfg.hinweis, B / 2, H / 2 - 36 + dy);
    ctx.globalAlpha = 1;
  }
  if (phase === "geschafft") overlay("Level geschafft!", modus === "tages" ? "Tageschallenge: " + zeitImLevel.toFixed(1) + " s. C kopiert das Ergebnis. Leertaste: Menü" : "Zeit: " + zeitImLevel.toFixed(1) + " s" + (neuerRekord ? " (neuer Rekord!)" : ", Rekord: " + rekord[lvl].toFixed(1) + " s") + ". +" + Math.round(verdient) + " Münzen. Leertaste: weiter");
  if (phase === "verloren") overlay("Erwischt!", modus === "endlos" ? "Überlebt: " + zeitImLevel.toFixed(1) + " s (Bestzeit " + endlosBest.toFixed(1) + " s). Leertaste: nochmal" : "Im Rucksack verloren: " + rucksack + ". Leertaste: Level nochmal");
  zeichneEnde();
}
