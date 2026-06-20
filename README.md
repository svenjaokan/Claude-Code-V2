# Claude Code Projects

Dieses Repository ist der Arbeitsbereich fuer neue Code- und Website-Projekte, die mit Claude Code (auch mobil ueber claude.ai/code) erstellt werden.

Jedes Projekt bekommt einen eigenen Unterordner.

---

## Instagram Carousel – „Heavenly Reminder" (Premium Pricing)

Ein 7-teiliges Instagram-Carousel (1080×1350, 4:5) im Stil der Design-Vorlage:
dunkle, editoriale Optik, elegante Serifen-Headlines mit *kursiven* Betonungen,
Sans-Serif-Fließtext mit **fetten** Akzenten, Kicker/Footer in gesperrten Versalien.

**Thema:** Niedrige Preise ziehen anstrengende Kunden an – Premium Pricing als Filter.
(Gleiches Thema wie die Vorlage, komplett neu formuliert.)

### Slides
1. Cover – „Deine *niedrigen* Preise ziehen die *falschen* Kunden an."
2. Billig fühlt sich sicher an.
3. Wer wenig zahlt, erwartet alles.
4. Discount zieht Drama an.
5. Premium ist ein Filter.
6. Dein Preis erzählt eine Geschichte.
7. CTA – „Erhöhe den Preis. *Verändere* die Kunden."

### Fotos
Alle Slides nutzen das hochgeladene B&W-Café-Foto (`assets/photos/photo3-bw.jpeg`),
4:5 hochkant zugeschnitten mit Fokus auf das Gesicht.
`photo1/2.jpeg` sind die ursprünglichen Design-Vorlagen.

### Neu rendern
```bash
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers   # falls nötig
node scripts/render.mjs
```
Ausgabe → `slides/slide-1.jpeg … slide-7.jpeg`.

- `scripts/slides.mjs` – Texte & Foto-Ausschnitte (hier Inhalte bearbeiten)
- `scripts/render.mjs` – Layout/CSS & Playwright-Renderer (1080×1350 JPEG)

Schriften: Cormorant Garamond (Display-Serif) + Inter (Sans), via Google Fonts.
