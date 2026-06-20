// Slide content + per-slide photo framing for the Instagram carousel.
// Theme (reworded): low prices attract draining clients → premium pricing.
// Emphasis: wrap words in *italics* with _word_  and **bold** with *word* helpers below.

export const COVER = "cover";
export const TEXT = "text";
export const CTA = "cta";

// `bgPos` = CSS background-position; `zoom` = background-size scale (1 = cover).
export const slides = [
  {
    type: COVER,
    bgPos: "66% 28%",
    zoom: 1.0,
    kicker: "HEAVENLY REMINDER",
    // <em> = italic emphasis
    headline: "Deine <em>niedrigen</em> Preise ziehen die <em>falschen</em> Kunden an.",
    footer: "RULE NO ONE",
  },
  {
    type: TEXT,
    bgPos: "58% 22%",
    zoom: 1.08,
    headline: "Billig fühlt sich<br>sicher an.",
    body: "Du glaubst, ein kleiner Preis macht das Ja leichter. In Wahrheit lädst du genau die Menschen ein, <strong>die am lautesten fordern und am wenigsten vertrauen.</strong>",
  },
  {
    type: TEXT,
    bgPos: "72% 30%",
    zoom: 1.04,
    headline: "Wer wenig zahlt,<br>erwartet alles.",
    body: "Ein niedriger Preis senkt nicht die Erwartung – er steigert sie. Plötzlich diskutierst du jede Stunde <strong>und rechtfertigst jeden einzelnen Schritt.</strong>",
  },
  {
    type: TEXT,
    bgPos: "62% 18%",
    zoom: 1.12,
    headline: "Discount zieht<br>Drama an.",
    body: "Schnäppchenjäger kaufen nicht deine Arbeit, sie kaufen den Rabatt. Beim ersten Hindernis sind sie weg – <strong>und lassen dich mit dem Aufwand zurück.</strong>",
  },
  {
    type: TEXT,
    bgPos: "55% 26%",
    zoom: 1.06,
    headline: "Premium ist<br>ein Filter.",
    body: "Ein höherer Preis schreckt nicht ab, er sortiert. Er zieht Menschen an, <strong>die mitarbeiten, Verantwortung übernehmen und deinen Wert sehen.</strong>",
  },
  {
    type: TEXT,
    bgPos: "68% 34%",
    zoom: 1.0,
    headline: "Dein Preis erzählt<br>eine Geschichte.",
    body: "Er sagt, wie sicher du in deinem eigenen Wert bist. Erhöhe ihn nicht für mehr Umsatz – <strong>sondern für die Kunden, für die du gemacht bist.</strong>",
  },
  {
    type: CTA,
    bgPos: "63% 24%",
    zoom: 1.1,
    kicker: "HEAVENLY REMINDER",
    headline: "Erhöhe den Preis.<br><em>Verändere</em> die Kunden.",
    footer: "SPEICHERN & FOLGEN",
  },
];
