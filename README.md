# Extraktion

Ein Browserspiel mit 99 Leveln, Bossen, Shop, Erfolgen, Endlosmodus und Tageschallenge.
Es läuft ohne Installation: Einfach `index.html` im Browser öffnen oder per GitHub Pages veröffentlichen.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die Seite, lädt alle Dateien |
| `style.css` | Aussehen der Seite um das Spiel herum |
| `grundlage.js` | Zeichenfläche und feste Spielgröße |
| `daten.js` | Level, Gegnertypen, Hintergründe, Shop, Skins, Erfolge |
| `zustand.js` | Spielzustand, Speichern, Zufall, Hilfsfunktionen |
| `audio.js` | Soundeffekte und Synthwave-Musik |
| `spiel.js` | Spielregeln und die Update-Schleife |
| `menue.js` | Menü, Einstellungen, Erfolge, Shop (Logik) |
| `zeichnen.js` | Alles, was gezeichnet wird |
| `eingabe.js` | Tastatur, Maus, Touch, Gamepad |
| `main.js` | Fenstergröße, Spielschleife, Start |

Die Reihenfolge der Dateien in `index.html` ist wichtig: Spätere Dateien nutzen, was frühere definieren.

## Steuerung

WASD oder Pfeiltasten bewegen, Shift = Dash, E = Schockwelle, P = Pause, F = Vollbild, M = stumm, Esc = Menü.
Am Handy: links ziehen zum Steuern, Knöpfe rechts. Gamepad wird unterstützt.
