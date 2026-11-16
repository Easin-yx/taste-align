// Run against the local Vite dev server when the authored specimens change.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch();
try {
  const modulePage = await browser.newPage();
  await modulePage.goto(process.env.TEST_BASE_URL || "http://127.0.0.1:5193");
  const samples = await modulePage.evaluate(async () => {
    const { directionIds, paletteIds, sampleHTML } =
      await import("/src/core/directions.ts");
    return directionIds.flatMap((direction) =>
      paletteIds.map((palette) => ({
        direction,
        palette,
        html: sampleHTML(direction, palette),
      })),
    );
  });
  const page = await browser.newPage({ viewport: { width: 320, height: 420 } });
  await mkdir("src/core/samples", { recursive: true });
  for (const { direction, palette, html } of samples) {
    await page.setContent(html);
    await page.evaluate(() =>
      Promise.all(Array.from(document.images, (img) => img.decode())),
    );
    await page.screenshot({
      path: `src/core/samples/${direction}-${palette}.png`,
    });
  }
} finally {
  await browser.close();
}
