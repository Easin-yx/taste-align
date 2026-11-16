import { beforeEach, expect, it, vi } from "vitest";
import {
  currentReview,
  newProject,
  reviewFingerprint,
  rulesFor,
  type Project,
} from "../src/core/model";
import {
  exportInvalid,
  loadProjects,
  removeProject,
  saveProject,
} from "../src/core/storage";

// Model the legacy client's single-key saves/deletes independently of the new API.
const db = vi.hoisted(() => new Map<string, unknown>());
vi.mock("idb-keyval", () => ({
  keys: async () => [...db.keys()],
  getMany: async (keys: string[]) =>
    keys.map((key) => structuredClone(db.get(key))),
  setMany: async (entries: [string, unknown][]) => {
    for (const [key, value] of structuredClone(entries)) db.set(key, value);
  },
  delMany: async (keys: string[]) => {
    for (const key of keys) db.delete(key);
  },
}));
beforeEach(() => db.clear());
const baseKey = (p: Project) => "taste-align:project:" + p.id;
const sampleKey = (p: Project) => "taste-align:scheme:" + p.id;

it("preserves confirmation and its manual review across an older tab's delayed whole-record save", async () => {
  const p = newProject();
  const legacy = structuredClone(p);
  p.scheme = { version: 1, direction: "studio", palette: "warm" };
  const rule = rulesFor(p, "zh")[0];
  p.reviews[rule.id] = {
    state: "change",
    comment: "Check heading size",
    fingerprint: reviewFingerprint(p, rule),
  };
  await saveProject(p);
  expect(db.get(baseKey(p))).not.toHaveProperty("scheme");
  expect(db.get(baseKey(p))).not.toHaveProperty(["reviews", rule.id]);
  db.set(baseKey(p), { ...legacy, name: "Old tab edit" });
  const { projects, invalid } = await loadProjects();
  expect(invalid).toEqual([]);
  expect(projects).toEqual([{ ...p, name: "Old tab edit" }]);
  expect(currentReview(projects[0], rulesFor(projects[0], "en")[0])).toEqual(
    p.reviews[rule.id],
  );
});

it("does not revive a withdrawn sample or apply a legacy deletion's orphan to a different project", async () => {
  const p = newProject();
  const legacy = structuredClone(p);
  p.scheme = { version: 1, direction: "editorial", palette: "original" };
  await saveProject(p);
  db.delete(baseKey(p));
  expect(await loadProjects()).toEqual({ projects: [], invalid: [] });
  const reused = { ...legacy, createdAt: "another creation" };
  db.set(baseKey(p), reused);
  expect((await loadProjects()).projects).toEqual([reused]);
  await saveProject({ ...reused, scheme: p.scheme });
  await saveProject(reused);
  db.set(baseKey(p), reused);
  expect((await loadProjects()).projects[0].scheme).toBeUndefined();
  await removeProject(p.id);
  expect(db.size).toBe(0);
});

it("keeps damaged evidence recoverable while loading other legacy projects", async () => {
  const p = newProject();
  const legacy = newProject();
  const broken = { createdAt: p.createdAt, scheme: { version: 7 } };
  db.set(baseKey(legacy), legacy);
  db.set(baseKey(p), p);
  db.set(sampleKey(p), broken);
  const { projects, invalid } = await loadProjects();
  expect(projects).toEqual([legacy]);
  expect(invalid).toEqual([baseKey(p)]);
  expect(JSON.parse(await exportInvalid(invalid))).toEqual([
    { key: baseKey(p), data: p, sample: broken },
  ]);
});
