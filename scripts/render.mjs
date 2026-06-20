// Renders each slide to a 1080x1350 (Instagram 4:5) JPEG using Playwright.
import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slides, COVER, TEXT, CTA } from "./slides.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const W = 1080;
const H = 1350;

const photoBuf = await readFile(join(ROOT, "assets/photos/photo3-bw.jpeg"));
const photoData = `data:image/jpeg;base64,${photoBuf.toString("base64")}`;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Inter:wght@400;500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; }
  .slide {
    position: relative; width: ${W}px; height: ${H}px; overflow: hidden;
    color: #fff; -webkit-font-smoothing: antialiased;
  }
  .photo {
    position: absolute; inset: 0;
    background-repeat: no-repeat;
    filter: grayscale(100%) contrast(1.02) brightness(0.92);
  }
  /* dark wash + bottom gradient for legibility */
  .overlay {
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg,
        rgba(8,8,8,0.28) 0%,
        rgba(8,8,8,0.00) 20%,
        rgba(8,8,8,0.00) 42%,
        rgba(8,8,8,0.30) 60%,
        rgba(7,7,7,0.66) 76%,
        rgba(5,5,5,0.92) 100%);
  }
  .content {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    padding: 96px 86px 0; z-index: 2;
  }
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
    font-size: 31px; line-height: 1.5; text-align: center;
    color: #f3f1ee; max-width: 840px; margin: 0 auto;
  }
  .body strong { font-weight: 700; color: #ffffff; }
  .footer {
    position: absolute; left: 0; right: 0; bottom: 64px; z-index: 2;
    font-family: 'Inter', sans-serif; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.30em;
    font-size: 22px; opacity: 0.88; text-align: center;
  }

  /* COVER + CTA: bottom-anchored big headline */
  .slide.cover .content, .slide.cta .content { justify-content: flex-end; padding-bottom: 188px; }
  .slide.cover h1, .slide.cta h1 { font-size: 104px; line-height: 0.98; margin-top: 26px; }

  /* TEXT: headline mid-lower, body beneath */
  .slide.text .content { justify-content: flex-end; padding-bottom: 118px; }
  .slide.text h1 { font-size: 84px; line-height: 1.0; margin-bottom: 34px; }
`;

function slideHTML(s) {
  const bgSize = s.zoom && s.zoom !== 1 ? `${Math.round(s.zoom * 100)}%` : "cover";
  const photoStyle = `background-image:url('${photoData}');background-position:${s.bgPos};background-size:${bgSize};`;
  let inner = "";
  if (s.type === COVER || s.type === CTA) {
    inner = `
      <div class="content">
        ${s.kicker ? `<div class="kicker">${s.kicker}</div>` : ""}
        <h1>${s.headline}</h1>
      </div>
      ${s.footer ? `<div class="footer">${s.footer}</div>` : ""}`;
  } else {
    inner = `
      <div class="content">
        <h1>${s.headline}</h1>
        <div class="body">${s.body}</div>
      </div>`;
  }
  return `
    <div class="slide ${s.type}">
      <div class="photo" style="${photoStyle}"></div>
      <div class="overlay"></div>
      ${inner}
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
  await page.waitForTimeout(150);
  const el = await page.$(".slide");
  const out = join(ROOT, "slides", `slide-${i + 1}.jpeg`);
  await el.screenshot({ path: out, type: "jpeg", quality: 92 });
  console.log("rendered", out);
}

await browser.close();
console.log("done:", slides.length, "slides");
