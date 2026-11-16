import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";

test("visual choice survives reload and reproduces the exact confirmed sample in a portable handoff", async ({
  page,
}) => {
  await page.goto("./");
  const directions = page.getByRole("button", { name: /^查看方向 · / });
  await expect(directions).toHaveCount(4);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 740 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await directions.nth(3).click();
  await page
    .getByRole("group", { name: "整页配色" })
    .getByRole("button")
    .nth(2)
    .click();
  await page.getByRole("button", { name: "用这组配色预览" }).click();
  const preview = await page.locator(".scheme-proof img").getAttribute("src");
  await page.getByRole("button", { name: "确认并查看交接包" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 AI 交接包" }).click();
  const files = unzipSync(readFileSync((await (await download).path())!));
  expect(
    "data:image/png;base64," +
      Buffer.from(files["preview.png"]).toString("base64"),
  ).toBe(preview);
  expect(strFromU8(files["preview.html"])).toContain("Paper Court");
  expect(files["RECIPE.md"].length).toBeGreaterThan(10);
  await page.reload();
  await page.getByRole("button", { name: "打开交接包" }).click();
  await expect(page.locator(".handoff-sample img")).toHaveAttribute(
    "src",
    preview!,
  );
  await page.getByRole("button", { name: /看差别/ }).click();
  await page.getByRole("button", { name: "撤销这个方向" }).click();
  await expect(page.getByRole("button", { name: "暂不选方向" })).toBeVisible();
});

test("preview and skip do not become design requirements", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: /^查看方向 · / })
    .first()
    .click();
  await page.getByRole("button", { name: "比较其他方向" }).click();
  await page.getByRole("button", { name: "暂不选方向" }).click();
  await expect(
    page.getByRole("heading", { name: "还没有已确认的要求" }),
  ).toBeVisible();
});
