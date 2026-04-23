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
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const TARGET_DPI = 360;
const DEVICE_SCALE = 3;
const CSS_DPI = 96; // Chromium's CSS → px baseline

export type RenderPdfOptions = {
  /** Wait for network idle + these extra ms to ensure fonts loaded. Default 500. */
  extraWaitMs?: number;
  /** Selector for per-page elements. Default ".page". If none match, whole page. */
  pageSelector?: string;
};

export async function renderPdfFromHtml(
  htmlPath: string,
  pdfPath: string,
  opts: RenderPdfOptions = {}
): Promise<void> {
  const { extraWaitMs = 500, pageSelector = ".page" } = opts;

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
    // Ensure web fonts are done loading before screenshotting.
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
      // PDF page dimensions in points. PNG is deviceScale×CSS px. Real inches
      // = css_px / CSS_DPI. Want the printable page sized for TARGET_DPI:
      //   widthPt = (pngPx / TARGET_DPI) * 72
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
