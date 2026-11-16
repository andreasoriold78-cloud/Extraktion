// Grundlage: Zeichenfläche und feste Spielgröße (800 x 500).

const canvas = document.getElementById("spiel");

const ctx = canvas.getContext("2d");

const B = 800, H = 500; // Feste Spielgröße; die Anzeige wird darauf umgerechnet

const rahmen = document.getElementById("rahmen");

let skala = 1;          // Wie stark das Bild gerade vergrößert ist
