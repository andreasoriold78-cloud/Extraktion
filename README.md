# Extraktion

Ein Browserspiel mit 99 Leveln, Bossen, Shop, Klassen, Talenten, Erfolgen, Endlosmodus, Tageschallenge und Wochen-Events.
Es läuft ohne Installation: `index.html` im Browser öffnen oder per GitHub Pages veröffentlichen.
Auf dem Handy lässt es sich als App zum Startbildschirm hinzufügen und läuft dann auch offline.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html`, `style.css` | Die Seite und ihr Aussehen |
| `grundlage.js` | Zeichenfläche und feste Spielgröße |
| `daten.js` | Level, Gegner, Hintergründe, Shop, Skins, Klassen, Talente, Tutorial, Erfolge |
| `zustand.js` | Spielzustand, Speichern, Zufall, Events, Hilfsfunktionen |
| `audio.js` | Soundeffekte und Synthwave-Musik |
| `spiel.js` | Spielregeln und die Update-Schleife |
| `menue.js` | Menü, Einstellungen, Klassen, Talente, Erfolge, Shop (Logik) |
| `zeichnen.js` | Alles, was gezeichnet wird |
| `eingabe.js` | Tastatur, Maus, Touch, Gamepad |
| `main.js` | Fenstergröße, Spielschleife, Start |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Installierbare App und Offline-Modus |
| `tests/` | Automatische Tests (`npm test` oder `node --test`) |
| `tools/` | Balancing-Bot (`node tools/balance.js bericht .`) |

Die Reihenfolge der Skripte in `index.html` ist wichtig: Spätere Dateien nutzen, was frühere definieren.

## Steuerung

WASD oder Pfeiltasten bewegen, Shift = Dash, E = Schockwelle, P = Pause, F = Vollbild, M = stumm, Esc = Menü.
Am Handy: links ziehen zum Steuern, Knöpfe rechts. Gamepad wird unterstützt.

## Balancing

`tools/balance.js` spielt jedes Level mit einem Bot, der wie ein durchschnittlicher Spieler agiert, und nimmt dabei einen
typischen Shop-Fortschritt an. Die Werte in `feinjustierung` (in `daten.js`) stammen aus dieser Messung.
Der Bot ist kein Mensch: Wichtig ist, dass die Kurve gleichmäßig steigt, nicht die absolute Zahl.
Nach größeren Änderungen an Gegnern oder Leveln lohnt sich ein neuer Bericht.

## Updates für die App-Version

Ändere in `sw.js` die Zahl bei `VERSION` (zum Beispiel `v2`), wenn du Dateien änderst. Dann holen sich Handys die neue Fassung.
