import { get, set, del, keys } from "idb-keyval";
import { validateProject, type Project } from "./model";
const prefix = "taste-align:project:";
export async function loadProjects(): Promise<{
  projects: Project[];
  invalid: string[];
}> {
  const ids = (await keys()).filter(
    (k) => typeof k === "string" && k.startsWith(prefix),
  );
  const rows = await Promise.all(
    ids.map(async (k) => {
      try {
        return { project: validateProject(await get(k)), key: String(k) };
      } catch {
        return { key: String(k) };
      }
    }),
  );
  return {
    projects: rows
      .flatMap((r) => (r.project ? [r.project] : []))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    invalid: rows.filter((r) => !r.project).map((r) => r.key),
  };
}
export async function exportInvalid(keys: string[]) {
  return JSON.stringify(
    await Promise.all(keys.map(async (key) => ({ key, data: await get(key) }))),
    null,
    2,
  );
}
export async function saveProject(p: Project) {
  // Check metadata and limits without rescanning megabytes of unchanged media per keystroke.
  const miniature = (a: Project["references"][number]) => ({
    ...a,
    data: `data:${a.type};base64,AA==`,
  });
  validateProject({
    ...p,
    references: p.references.map(miniature),
    result: p.result ? miniature(p.result) : undefined,
    notes: p.notes.map((n) => ({
      ...n,
      frame: n.frame ? "data:image/jpeg;base64,AA==" : undefined,
    })),
  });
  const size =
    p.references.reduce(
      (n, a) => n + a.data.length,
      p.result?.data.length || 0,
    ) + p.notes.reduce((n, a) => n + (a.frame?.length || 0), 0);
  if (size > 100_000_000) throw new Error("Project exceeds size limit");
  await set(prefix + p.id, p);
}
export async function removeProject(id: string) {
  await del(prefix + id);
}
