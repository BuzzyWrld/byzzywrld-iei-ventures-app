#!/usr/bin/env node
/**
 * Quick MD → PDF converter for the IEI Brand System docs.
 * Inline markdown parsing (no extra deps) + Playwright for PDF rendering.
 *
 * Usage:
 *   node scripts/md-to-pdf.mjs <input.md> [output.pdf]
 */

import fs from "node:fs/promises";
import path from "node:path";

// --- Minimal markdown → HTML (handles what the IEI docs use) ---
function mdToHtml(md) {
  let html = md;
  // Escape HTML entities first
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Code blocks ```...```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code>${esc(code)}</code></pre>`);
  // Inline code `...`
  html = html.replace(/`([^`\n]+)`/g, (_, c) => `<code>${esc(c)}</code>`);
  // Tables (GFM-style)
  html = html.replace(/((?:^\|.+\|\n)+)/gm, (block) => {
    const rows = block.trim().split("\n").map((r) => r.trim());
    if (rows.length < 2) return block;
    // Detect alignment row (contains only --- and pipes)
    const isAlign = rows[1] && /^\|[\s:\-|]+\|$/.test(rows[1]);
    if (!isAlign) return block;
    const headerCells = rows[0].slice(1, -1).split("|").map((c) => c.trim());
    const bodyRows = rows.slice(2).map((r) => r.slice(1, -1).split("|").map((c) => c.trim()));
    const thead = `<thead><tr>${headerCells.map((c) => `<th>${c}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${bodyRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<table>${thead}${tbody}</table>\n`;
  });
  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  // Horizontal rule
  html = html.replace(/^---+\s*$/gm, "<hr>");
  // Blockquotes
  html = html.replace(/^>\s?(.+)$/gm, "<blockquote>$1</blockquote>");
  // Bold + italic
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Unordered lists
  html = html.replace(/((?:^[-*]\s+.+\n?)+)/gm, (block) => {
    const items = block.trim().split("\n").map((l) => l.replace(/^[-*]\s+/, "").trim());
    return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>\n`;
  });
  // Ordered lists
  html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (block) => {
    const items = block.trim().split("\n").map((l) => l.replace(/^\d+\.\s+/, "").trim());
    return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>\n`;
  });
  // Paragraphs — wrap any remaining non-tag lines
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h\d|ul|ol|pre|table|blockquote|hr|p)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n\n");
  return html;
}

// --- Print-ready CSS ---
const CSS = `
@page { size: Letter; margin: 0.6in 0.7in; }
* { box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #1a1a1a;
  max-width: 100%;
  margin: 0;
  padding: 0;
}
h1 { font-size: 24pt; margin: 0 0 12pt; color: #0a0a0a; border-bottom: 2px solid #0a0a0a; padding-bottom: 6pt; page-break-after: avoid; }
h2 { font-size: 16pt; margin: 18pt 0 8pt; color: #0a0a0a; page-break-after: avoid; }
h3 { font-size: 13pt; margin: 14pt 0 6pt; color: #2a2a2a; page-break-after: avoid; }
h4 { font-size: 11pt; margin: 10pt 0 4pt; color: #444; text-transform: uppercase; letter-spacing: 0.05em; page-break-after: avoid; }
p { margin: 0 0 8pt; }
ul, ol { margin: 0 0 10pt; padding-left: 22pt; }
li { margin-bottom: 3pt; }
strong { color: #0a0a0a; }
em { color: #333; }
code {
  font-family: "SF Mono", Monaco, "Cascadia Code", Consolas, monospace;
  font-size: 9.5pt;
  background: #f4f4f4;
  padding: 1pt 4pt;
  border-radius: 3px;
  color: #b03060;
}
pre {
  background: #f8f8f8;
  border-left: 3px solid #888;
  padding: 8pt 12pt;
  margin: 8pt 0;
  overflow-x: auto;
  page-break-inside: avoid;
}
pre code { background: none; padding: 0; color: #222; }
blockquote {
  border-left: 3px solid #c0c0c0;
  padding-left: 12pt;
  color: #555;
  font-style: italic;
  margin: 10pt 0;
}
hr { border: none; border-top: 1px solid #ddd; margin: 14pt 0; }
a { color: #2a5fc7; text-decoration: none; }
table {
  border-collapse: collapse;
  width: 100%;
  margin: 10pt 0;
  font-size: 10pt;
  page-break-inside: avoid;
}
th, td {
  border: 1px solid #ccc;
  padding: 5pt 8pt;
  text-align: left;
  vertical-align: top;
}
th { background: #f0f0f0; font-weight: 600; color: #0a0a0a; }
tr:nth-child(even) td { background: #fafafa; }
.footer { font-size: 8pt; color: #888; text-align: center; margin-top: 24pt; border-top: 1px solid #eee; padding-top: 6pt; }
`;

function wrap(html, title) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>
${html}
<div class="footer">IEI Ventures · Brand Blueprint · ${new Date().toISOString().slice(0, 10)}</div>
</body>
</html>`;
}

// --- Main ---
const inPath = process.argv[2];
const outPath = process.argv[3] || inPath.replace(/\.md$/i, ".pdf");
if (!inPath) {
  console.error("usage: node scripts/md-to-pdf.mjs <input.md> [output.pdf]");
  process.exit(1);
}

const md = await fs.readFile(inPath, "utf8");
const title = path.basename(inPath, ".md");
const html = wrap(mdToHtml(md), title);

// Write HTML for debugging
const htmlPath = outPath.replace(/\.pdf$/i, ".html");
await fs.writeFile(htmlPath, html, "utf8");
console.log(`wrote HTML: ${htmlPath}`);

// Render via Playwright
const { chromium } = await import("playwright");
const browser = await chromium.launch({ args: ["--font-render-hinting=none"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({
  path: outPath,
  format: "Letter",
  printBackground: true,
  margin: { top: "0.6in", bottom: "0.6in", left: "0.7in", right: "0.7in" },
});
await browser.close();
console.log(`wrote PDF: ${outPath}`);
