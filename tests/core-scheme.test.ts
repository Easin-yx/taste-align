import { describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import {
  directionIds,
  paletteIds,
  recipeText,
  sampleHTML,
} from "../src/core/directions";
import { sampleImage } from "../src/core/sample-image";
import {
  makeArchive,
  makeBrief,
  makeReview,
  readArchive,
} from "../src/core/export";
import {
  currentReview,
  newProject,
  reviewFingerprint,
  rulesFor,
  validateProject,
  type Project,
} from "../src/core/model";

function confirmed(): Project {
  return {
    ...newProject("en"),
    platform: "web",
    scheme: { version: 1, direction: "journal", palette: "cool" },
  };
}

describe("confirmed whole sample", () => {
  it.each([
    { version: 2, direction: "gallery", palette: "original" },
    { version: 1, direction: "museum", palette: "warm" },
    { version: 1, direction: "studio", palette: "sepia" },
    { version: 1, direction: "editorial" },
    null,
  ])(
    "rejects unsupported or incomplete confirmation %j on import",
    async (scheme) => {
      const json = JSON.stringify({ ...newProject(), scheme });
      await expect(
        readArchive(new File([json], "project.json")),
      ).rejects.toThrow();
    },
  );

  it("exports only the selected evidence and round-trips every supported pairing", async () => {
    for (const direction of directionIds) {
      for (const palette of paletteIds) {
        const p = confirmed();
        p.scheme = { version: 1, direction, palette };
        const archive = makeArchive(p, "en");
        const files = unzipSync(archive);
        expect(strFromU8(files["preview.html"])).toBe(
          sampleHTML(direction, palette),
        );
        const png = sampleImage(direction, palette);
        expect(png).toMatch(/^data:image\/png;base64,/);
        expect(files["preview.png"]).toEqual(
          Uint8Array.from(atob(png.split(",")[1]), (c) => c.charCodeAt(0)),
        );
        expect([...files["preview.png"].slice(0, 8)]).toEqual([
          137, 80, 78, 71, 13, 10, 26, 10,
        ]);
        expect(strFromU8(files["RECIPE.md"])).toBe(
          recipeText(direction, palette, "en"),
        );
        for (const doc of ["START_HERE.md", "DESIGN_BRIEF.md", "REVIEW.md"]) {
          for (const name of ["preview.html", "preview.png", "RECIPE.md"])
            expect(strFromU8(files[doc])).toContain(`(${name})`);
        }
        expect(await readArchive(new File([archive], "sample.zip"))).toEqual(p);
      }
    }
  });

  it("keeps legacy projects and unconfirmed defaults free of sample evidence", async () => {
    const legacy = newProject();
    legacy.choices.color = { value: "b", reason: "warm tone" };
    const p = validateProject(legacy);
    expect(p.scheme).toBeUndefined();
    const files = unzipSync(makeArchive(p, "en"));
    for (const path of ["preview.html", "preview.png", "RECIPE.md"]) {
      expect(files[path]).toBeUndefined();
      expect(strFromU8(files["START_HERE.md"])).not.toContain(path);
      expect(makeBrief(p, "en")).not.toContain(path);
    }
    expect(makeBrief(p, "en")).toContain("direction is undecided");
    expect(
      await readArchive(new File([files["project.json"]], "legacy.json")),
    ).toEqual(legacy);
  });

  it("limits confirmation to the mobile guide and lists only unresolved individual dimensions", () => {
    const p = confirmed();
    p.choices.color = { value: "a", reason: "teal" };
    p.choices.shape = { value: "neither", reason: "too round" };
    const brief = makeBrief(p, "en");
    expect(brief).toContain("Desktop web");
    expect(brief).toContain("mobile exhibition guide");
    const open = brief.split("## Still open")[1].split("##")[0];
    expect(open).toContain("Motion");
    expect(open).toContain("Shape: Neither");
    expect(open).not.toContain("- Color:");
    expect(rulesFor(p, "en")).toHaveLength(3);
    expect(makeReview(p, "en")).toContain("mobile exhibition guide");
    expect(makeBrief(p, "zh")).toContain("手机展览导览");
  });

  it("invalidates just the affected review on reselection, across languages", async () => {
    const p = confirmed();
    p.directives = "Keep the title.";
    p.result = {
      id: "result",
      name: "result.png",
      type: "image/png",
      data: "data:image/png;base64,AA==",
      width: 1,
      height: 1,
      source: "",
    };
    const [sample, direct] = rulesFor(p, "zh");
    expect(makeReview(p, "zh")).toContain("未核对");
    for (const rule of [sample, direct])
      p.reviews[rule.id] = {
        state: "pass",
        comment: "checked",
        fingerprint: reviewFingerprint(p, rule),
      };
    const imported = await readArchive(
      new File([makeArchive(p, "zh")], "sample.zip"),
    );
    expect(imported).toEqual(p);
    expect(currentReview(imported, rulesFor(imported, "en")[0])?.state).toBe(
      "pass",
    );
    for (const scheme of [
      { ...p.scheme!, direction: "gallery" as const },
      { ...p.scheme!, palette: "warm" as const },
    ]) {
      const changed = { ...p, scheme };
      expect(
        currentReview(changed, rulesFor(changed, "en")[0]),
      ).toBeUndefined();
      expect(currentReview(changed, direct)?.state).toBe("pass");
      expect(makeReview(changed, "en")).toContain("Not reviewed");
    }
  });
});
