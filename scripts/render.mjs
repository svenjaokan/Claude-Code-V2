// Renders each slide to a 1080x1350 (Instagram 4:5) JPEG using Playwright.
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slides, COVER } from "./slides.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const W = 1080;
const H = 1350;
const TOP_PAD = 96;

const photoBuf = await readFile(join(ROOT, "assets/photos/photo3-bw.jpeg"));
const photoData = `data:image/jpeg;base64,${photoBuf.toString("base64")}`;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Inter:wght@400;500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; }
  .slide {
    position: relative; width: ${W}px; height: ${H}px; overflow: hidden;
    color: #fff; -webkit-font-smoothing: antialiased; --scale: 1;
  }
  .photo {
    position: absolute; inset: 0;
    background-repeat: no-repeat;
    filter: grayscale(100%) contrast(1.02) brightness(0.92);
  }
  .overlay {
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg,
        rgba(8,8,8,0.28) 0%,
        rgba(8,8,8,0.00) 20%,
        rgba(8,8,8,0.00) 40%,
        rgba(8,8,8,0.32) 58%,
        rgba(7,7,7,0.68) 76%,
        rgba(5,5,5,0.93) 100%);
  }
  .content {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    justify-content: flex-end; padding: ${TOP_PAD}px 86px 0; z-index: 2;
  }
  .slide.cover .content { padding-bottom: 180px; }
  .slide.text  .content { padding-bottom: 118px; }
  .fit { width: 100%; }
  .kicker {
    font-family: 'Inter', sans-serif; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.28em;
    font-size: 23px; opacity: 0.92; text-align: center;
  }
  h1 {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    color: #fff; text-align: center; letter-spacing: 0.005em;
  }
  h1 em { font-style: italic; font-weight: 500; }
  .body {
    font-family: 'Inter', sans-serif; font-weight: 400;
    line-height: 1.5; text-align: center;
    color: #f3f1ee; max-width: 860px; margin: 0 auto;
  }
  .body strong { font-weight: 700; color: #ffffff; }
  .footer {
    position: absolute; left: 0; right: 0; bottom: 64px; z-index: 2;
    font-family: 'Inter', sans-serif; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.30em;
    font-size: 22px; opacity: 0.88; text-align: center;
  }

  /* COVER: bottom-anchored big headline */
  .slide.cover h1 { font-size: calc(104px * var(--scale)); line-height: 1.0; margin-top: 26px; }

  /* TEXT: serif headline + sans body */
  .slide.text h1 { font-size: calc(74px * var(--scale)); line-height: 1.02; margin-bottom: 30px; }
  .slide.text .body { font-size: calc(31px * var(--scale)); }
`;

// bottom padding (px) below the text block, per slide type
const BOT_PAD = { cover: 180, text: 118 };

function slideHTML(s) {
  const bgSize = s.zoom && s.zoom !== 1 ? `${Math.round(s.zoom * 100)}%` : "cover";
  const photoStyle = `background-image:url('${photoData}');background-position:${s.bgPos};background-size:${bgSize};`;
  let fit = "";
  if (s.type === COVER) {
    fit = `${s.kicker ? `<div class="kicker">${s.kicker}</div>` : ""}<h1>${s.headline}</h1>`;
  } else {
    fit = `<h1>${s.headline}</h1>${s.body ? `<div class="body">${s.body}</div>` : ""}`;
  }
  return `
    <div class="slide ${s.type}">
      <div class="photo" style="${photoStyle}"></div>
      <div class="overlay"></div>
      <div class="content"><div class="fit">${fit}</div></div>
      ${s.footer ? `<div class="footer">${s.footer}</div>` : ""}
    </div>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await mkdir(join(ROOT, "slides"), { recursive: true });

for (let i = 0; i < slides.length; i++) {
  const s = slides[i];
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${slideHTML(s)}</body></html>`;
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  // Auto-fit: shrink font scale until the text block fits the available height.
  const botPad = BOT_PAD[s.type] ?? 120;
  await page.evaluate(({ topPad, botPad }) => {
    const slide = document.querySelector(".slide");
    const fit = document.querySelector(".fit");
    const maxH = slide.clientHeight - topPad - botPad;
    let scale = 1;
    for (let n = 0; n < 30 && fit.offsetHeight > maxH && scale > 0.5; n++) {
      scale -= 0.03;
      slide.style.setProperty("--scale", scale.toFixed(3));
    }
  }, { topPad: TOP_PAD, botPad });

  await page.waitForTimeout(120);
  const el = await page.$(".slide");
  const out = join(ROOT, "slides", `slide-${i + 1}.jpeg`);
  await el.screenshot({ path: out, type: "jpeg", quality: 92 });
  console.log("rendered", out);
}

await browser.close();
console.log("done:", slides.length, "slides");
