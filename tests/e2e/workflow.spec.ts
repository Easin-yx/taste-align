import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { unzipSync, strFromU8 } from "fflate";

test("complete compare → annotate → export → import → review flow", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "你更想触碰哪一种？" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "更喜欢 B · 透光的磨砂" }).click();
  await page.getByLabel("哪一点打动了你？").fill("透光有层次，文字要清楚");
  await page.getByRole("button", { name: "看下一个差别" }).click();
  await page.getByRole("button", { name: "都不是我想要的" }).click();
  await page.getByLabel("哪一点打动了你？").fill("想要薄荷绿，不是暖色");
  await page.getByRole("tab", { name: "动作" }).click();
  await page.getByRole("button", { name: "同时重播动作" }).click();
  await page.getByRole("button", { name: "更喜欢 B · 舒缓地浮起" }).click();
  await page.getByRole("tab", { name: "材质" }).click();
  await page.screenshot({
    path: `${process.env.CAPTURE_DOCS ? "docs/screenshots" : "test-results/screenshots"}/${info.project.name}-compare.png`,
    fullPage: true,
  });
  const sample = await page.locator(".comparison-option").nth(1).screenshot();
  await page.getByRole("button", { name: "标记参考", exact: false }).click();
  await page.getByLabel("上传参考文件").setInputFiles({
    name: "our-original-sample.png",
    mimeType: "image/png",
    buffer: sample,
  });
  const img = page.getByRole("img", { name: "our-original-sample.png" });
  await expect(img).toBeVisible();
  await img.click({ position: { x: 30, y: 60 } });
  await page.getByLabel("只针对哪个方面？").selectOption("material");
  await page.getByLabel("用你的话描述").fill("保留透光底层，边缘别发白");
  await page.getByRole("button", { name: "必须保留", exact: true }).click();
  await page.getByRole("button", { name: "保存标记", exact: true }).click();
  await expect(page.getByRole("button", { name: /保留 · 材质/ })).toBeVisible();
  await page.screenshot({
    path: `${process.env.CAPTURE_DOCS ? "docs/screenshots" : "test-results/screenshots"}/${info.project.name}-reference.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "整理成设计简报" }).click();
  await page.getByLabel("还有什么一定要说明？").fill("阅读时保持安静");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 AI 交接包" }).click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).toBeTruthy();
  const zip = unzipSync(readFileSync(path!));
  const brief = strFromU8(zip["DESIGN_BRIEF.md"]);
  expect(brief).toContain("保留透光底层，边缘别发白");
  expect(brief).toContain("两个示例都不合适");
  expect(brief).toContain("阅读时保持安静");
  expect(Object.keys(zip).filter((s) => s.startsWith("assets/"))).toHaveLength(
    1,
  );
  await page.screenshot({
    path: `${process.env.CAPTURE_DOCS ? "docs/screenshots" : "test-results/screenshots"}/${info.project.name}-brief.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "更喜欢 B · 透光的磨砂" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "核对新稿", exact: false }).click();
  await page.getByLabel("上传新稿文件").setInputFiles({
    name: "new-result.png",
    mimeType: "image/png",
    buffer: sample,
  });
  await expect(
    page.getByRole("heading", { name: "逐条核对", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "符合", exact: true }).first().click();
  await page
    .getByRole("button", { name: "需要改", exact: true })
    .nth(1)
    .click();
  await page.getByLabel("哪里还不对？").fill("动作还没有停稳");
  await page.screenshot({
    path: `${process.env.CAPTURE_DOCS ? "docs/screenshots" : "test-results/screenshots"}/${info.project.name}-review.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "看差别", exact: false }).click();
  await page.getByRole("button", { name: "更喜欢 A · 安静的实色" }).click();
  await page.getByRole("button", { name: "核对新稿", exact: false }).click();
  await expect(
    page.getByText("之前的确认已过期", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("导入项目备份").setInputFiles(path!);
  await expect(
    page.getByRole("heading", { name: /我的第一个项目 · 导入/ }),
  ).toBeVisible();
  await expect(
    page.getByText("阅读时保持安静", { exact: true }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard, empty states, corrupted import, mobile bounds, accessibility", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "你更想触碰哪一种？" }),
  ).toBeVisible();
  const originalName = await page.locator(".project-switcher").innerText();
  await page.getByLabel("导入项目备份").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":55}'),
  });
  await expect(page.getByRole("alert")).toContainText("原项目没有改变");
  expect(await page.locator(".project-switcher").innerText()).toBe(
    originalName,
  );
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 740 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.setViewportSize(
    info.project.name.includes("phone")
      ? { width: 390, height: 664 }
      : { width: 1440, height: 1000 },
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "使用帮助", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(
    page.getByRole("heading", { name: "Which would you rather touch?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /References/ }).click();
  await expect(
    page.getByRole("heading", { name: "Start with something you love" }),
  ).toBeVisible();
});

test("video note exports a captured frame and useful timestamp", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "标记参考", exact: false }).click();
  await page
    .getByLabel("上传参考文件")
    .setInputFiles("tests/fixtures/original-sample.mp4");
  const video = page.locator("video");
  await expect(video).toBeVisible();
  await video.evaluate(async (el) => {
    const v = el as HTMLVideoElement;
    v.currentTime = 0.7;
    await new Promise<void>((resolve) => {
      if (v.readyState >= 2 && !v.seeking) resolve();
      else v.addEventListener("seeked", () => resolve(), { once: true });
    });
  });
  await page.getByRole("button", { name: "标记当前时刻" }).click();
  await page.getByLabel("用你的话描述").fill("这个停顿要更舒缓");
  await page.getByLabel("只针对哪个方面？").selectOption("motion");
  await page.getByRole("button", { name: "保存标记" }).click();
  await page.getByRole("button", { name: "整理成设计简报" }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 AI 交接包" }).click();
  const zip = unzipSync(readFileSync((await (await event).path())!));
  expect(Object.keys(zip).filter((s) => s.endsWith("-frame.jpg"))).toHaveLength(
    1,
  );
  expect(strFromU8(zip["DESIGN_BRIEF.md"])).toContain("0.70s");
  expect(strFromU8(zip["DESIGN_BRIEF.md"])).toContain("该时刻截图");
});

test("long names round-trip and one corrupt record does not hide healthy projects", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".project-switcher").click();
  await page.getByRole("button", { name: "编辑当前项目" }).click();
  await page.getByLabel("项目名称", { exact: true }).fill("长".repeat(120));
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await page.getByRole("button", { name: "交给 AI", exact: false }).click();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 AI 交接包" }).click();
  const path = await (await event).path();
  await page.getByLabel("导入项目备份").setInputFiles(path!);
  await expect(page.getByRole("heading", { name: /导入/ })).toBeVisible();
  await page.reload();
  await expect(page.locator(".project-switcher")).toContainText("导入");
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("keyval-store");
        r.onsuccess = () => {
          const db = r.result;
          const t = db.transaction("keyval", "readwrite");
          t.objectStore("keyval").put(
            { version: 999 },
            "taste-align:project:corrupt-fixture",
          );
          t.oncomplete = () => {
            db.close();
            resolve();
          };
          t.onerror = reject;
        };
        r.onerror = reject;
      }),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("1 个本地项目无法读取");
  await expect(page.locator(".project-switcher")).toContainText("导入");
  await page.locator(".project-switcher").click();
  await expect(page.locator(".project-list>button")).toHaveCount(2);
});

test("a slow upload merges with edits made while the file is reading", async ({
  page,
}) => {
  await page.goto("/");
  const sample = await page.locator(".comparison-option").first().screenshot();
  await page.evaluate(() => {
    const original = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function (blob) {
      setTimeout(() => original.call(this, blob), 1800);
    };
  });
  await page.getByRole("button", { name: "标记参考", exact: false }).click();
  await page
    .getByLabel("上传参考文件")
    .setInputFiles({ name: "slow.png", mimeType: "image/png", buffer: sample });
  await page.getByRole("button", { name: "交给 AI", exact: false }).click();
  await page
    .getByLabel("还有什么一定要说明？")
    .fill("上传期间也必须保留的新要求");
  await expect(page.getByRole("status")).toContainText("已添加");
  await expect(page.getByLabel("还有什么一定要说明？")).toHaveValue(
    "上传期间也必须保留的新要求",
  );
  await page.getByRole("button", { name: "标记参考", exact: false }).click();
  await expect(page.getByRole("img", { name: "slow.png" })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "交给 AI", exact: false }).click();
  await expect(page.getByLabel("还有什么一定要说明？")).toHaveValue(
    "上传期间也必须保留的新要求",
  );
});
