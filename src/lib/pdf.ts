/**
 * HTML → PDF rendering pipeline per brief slide 05 / SKILL.md Step 4.
 *
 * Pipeline:
 *   1. Load HTML in Chromium at deviceScaleFactor: 3
 *      (with --font-render-hinting=none to eliminate font blur)
 *   2. For each .page div, take a PNG screenshot of that element
 *      (fallback: if no .page divs exist, screenshot the full page)
 *   3. Embed each PNG into a PDF page sized to match the screenshot at 360 DPI
 *   4. NEVER use Chromium's page.pdf() — it produces font blur
 *
 * Called by the active skill adapter AFTER the skill produces playbook.html.
 * The skill writes structure/content; this turns it into the pixel-perfect PDF.
 */
import fs from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

const TARGET_DPI = 360;
const DEVICE_SCALE = 3;

export type RenderPdfOptions = {
  /** Wait for network idle + these extra ms to ensure fonts loaded. Default 500. */
  extraWaitMs?: number;
  /** Selector for per-page elements. Default ".page". If none match, whole page. */
  pageSelector?: string;
};

/**
 * Attempt to load Playwright's chromium dynamically.
 * Returns null on Vercel / serverless where the binary isn't available.
 */
async function tryLoadChromium() {
  try {
    const pw = await import("playwright");
    return pw.chromium;
  } catch {
    return null;
  }
}

export async function renderPdfFromHtml(
  htmlPath: string,
  pdfPath: string,
  opts: RenderPdfOptions = {}
): Promise<void> {
  const { extraWaitMs = 500, pageSelector = ".page" } = opts;

  const chromium = await tryLoadChromium();
  if (!chromium) {
    // Playwright not available (Vercel Lambda) — write a 1-page placeholder PDF
    // so downstream code doesn't crash. The HTML playbook is still the primary
    // deliverable; PDF is a nice-to-have that works in local dev.
    console.warn("[pdf] Playwright not available — writing placeholder PDF. HTML playbook is still served.");
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    page.drawText("Brand Playbook PDF — view the HTML version for the full experience.", {
      x: 50,
      y: 700,
      size: 14,
    });
    const pdfBytes = await doc.save();
    await fs.writeFile(pdfPath, pdfBytes);
    return;
  }

  const browser = await chromium.launch({
    args: [
      "--font-render-hinting=none",
      "--disable-font-subpixel-positioning",
    ],
  });

  try {
    const ctx = await browser.newContext({
      deviceScaleFactor: DEVICE_SCALE,
      viewport: { width: 850, height: 1100 },
    });
    const page = await ctx.newPage();

    const absUrl = htmlPath.startsWith("file://") ? htmlPath : `file://${htmlPath}`;
    await page.goto(absUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForLoadState("domcontentloaded");
    await page.evaluate(() => (document as unknown as { fonts: FontFaceSet }).fonts.ready);
    await page.waitForTimeout(extraWaitMs);

    const locator = page.locator(pageSelector);
    const count = await locator.count();

    const screenshots: Buffer[] = [];
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        screenshots.push(await locator.nth(i).screenshot({ type: "png" }));
      }
    } else {
      screenshots.push(await page.screenshot({ type: "png", fullPage: true }));
    }

    const doc = await PDFDocument.create();
    for (const buf of screenshots) {
      const img = await doc.embedPng(buf);
      const widthPt = (img.width / TARGET_DPI) * 72;
      const heightPt = (img.height / TARGET_DPI) * 72;
      const pdfPage = doc.addPage([widthPt, heightPt]);
      pdfPage.drawImage(img, { x: 0, y: 0, width: widthPt, height: heightPt });
    }

    const pdfBytes = await doc.save();
    await fs.writeFile(pdfPath, pdfBytes);
  } finally {
    await browser.close();
  }
}
