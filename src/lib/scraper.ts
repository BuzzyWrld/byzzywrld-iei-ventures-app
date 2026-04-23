/**
 * URL scraper for existing-brand intake mode.
 *
 * Given a URL, loads the page in Chromium and extracts:
 *  - hero copy (first H1 + subtitle)
 *  - dominant colors (from computed styles of key elements)
 *  - font families in use
 *  - meta description + title
 *
 * Used by /api/brands/scrape (Day 6 UI to follow) and by the existing-brand
 * intake flow to pre-fill the questionnaire.
 */
import { chromium } from "playwright";

export type ScrapeResult = {
  url: string;
  title: string;
  description: string;
  hero: { h1: string; subtitle: string };
  colors: string[];
  fonts: string[];
};

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    const result = await page.evaluate(() => {
      const text = (el: Element | null) => (el?.textContent ?? "").trim().slice(0, 300);

      const h1 = document.querySelector("h1");
      let subtitleEl: Element | null = null;
      if (h1) {
        let sib = h1.nextElementSibling;
        while (sib && !subtitleEl) {
          if (/^(P|H2|H3|DIV)$/.test(sib.tagName) && (sib.textContent ?? "").trim().length > 10) {
            subtitleEl = sib;
          }
          sib = sib.nextElementSibling;
        }
      }

      const freq = new Map<string, number>();
      const bump = (k: string) => freq.set(k, (freq.get(k) ?? 0) + 1);
      const parseColor = (c: string): string | null => {
        if (!c) return null;
        const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return null;
        const a = m[4] ? Number(m[4]) : 1;
        if (a < 0.2) return null;
        const [r, g, b] = [m[1], m[2], m[3]].map(Number);
        if (r > 245 && g > 245 && b > 245) return null; // skip white-ish
        if (r < 10 && g < 10 && b < 10) return null; // skip pure black
        const hex =
          "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
        return hex;
      };

      const fonts = new Set<string>();
      const els = document.querySelectorAll("body, body *");
      let sampled = 0;
      for (const el of Array.from(els).slice(0, 500)) {
        const s = window.getComputedStyle(el);
        const bg = parseColor(s.backgroundColor);
        const fg = parseColor(s.color);
        if (bg) bump(bg);
        if (fg) bump(fg);
        const ff = s.fontFamily?.split(",")[0]?.replace(/['"]/g, "").trim();
        if (ff) fonts.add(ff);
        sampled++;
        if (sampled > 200 && freq.size > 10) break;
      }

      const colors = Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([c]) => c);

      return {
        title: document.title,
        description:
          document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
        hero: { h1: text(h1), subtitle: text(subtitleEl) },
        colors,
        fonts: Array.from(fonts).slice(0, 5),
      };
    });

    return { url, ...result };
  } finally {
    await browser.close();
  }
}
