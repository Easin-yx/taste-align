import { it, expect } from "vitest";
import { createSaveQueue, type SaveStatus } from "../src/core/save-queue";
import { newProject } from "../src/core/model";
it("does not report all saved while later writes are pending", async () => {
  const gates: Array<() => void> = [];
  const states: SaveStatus[] = [];
  const q = createSaveQueue(
    () => new Promise<void>((r) => gates.push(r)),
    (s) => states.push(s),
  );
  q.enqueue(newProject());
  q.enqueue(newProject());
  await Promise.resolve();
  gates[0]();
  await new Promise((r) => setTimeout(r, 0));
  expect(states.at(-1)?.pending).toBe(1);
  gates[1]();
  await q.settled();
  expect(states.at(-1)).toEqual({ pending: 0, failed: [] });
});
it("success elsewhere cannot conceal a failed project, but its own retry can", async () => {
  const a = newProject(),
    b = newProject();
  let reject = true;
  const states: SaveStatus[] = [];
  const q = createSaveQueue(
    async (p) => {
      if (p.id === a.id && reject) throw new Error("disk");
    },
    (s) => states.push(s),
  );
  q.enqueue(a);
  q.enqueue(b);
  await q.settled();
  expect(states.at(-1)?.failed).toEqual([a.id]);
  reject = false;
  q.enqueue(a);
  await q.settled();
  expect(states.at(-1)?.failed).toEqual([]);
});
