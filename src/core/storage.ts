import { delMany, getMany, keys, setMany } from "idb-keyval";
import { schemeRuleId, validateProject, type Project } from "./model";

const prefix = "taste-align:project:";
const schemeKey = (id: string) => "taste-align:scheme:" + id;

export async function loadProjects(): Promise<{
  projects: Project[];
  invalid: string[];
}> {
  // Only base records are projects. A deletion by an older tab can leave an
  // orphaned sample, which must never recreate its deleted project.
  const baseKeys = (await keys()).filter(
    (k): k is string => typeof k === "string" && k.startsWith(prefix),
  );
  const rows = await Promise.all(
    baseKeys.map(async (key) => {
      const id = key.slice(prefix.length);
      const [base, sidecar] = await getMany([key, schemeKey(id)]);
      if (base === undefined) return {}; // Deleted since key enumeration.
      try {
        if (base.id !== id) throw new Error("Mismatched project ID");
        if (sidecar != null && typeof sidecar.createdAt !== "string")
          throw new Error("Invalid stored sample");
        if (sidecar == null || sidecar.createdAt !== base.createdAt) {
          return { project: validateProject(base) };
        }
        if (!sidecar.scheme) throw new Error("Missing stored sample");
        return {
          project: validateProject({
            ...base,
            scheme: sidecar.scheme,
            reviews:
              sidecar.review === undefined
                ? base.reviews
                : { ...base.reviews, [schemeRuleId]: sidecar.review },
          }),
        };
      } catch {
        return { invalid: key };
      }
    }),
  );
  return {
    projects: rows
      .flatMap((r) => (r.project ? [r.project] : []))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    invalid: rows.flatMap((r) => (r.invalid ? [r.invalid] : [])),
  };
}
export async function exportInvalid(baseKeys: string[]) {
  const rows = await Promise.all(
    baseKeys.map(async (key) => {
      const [data, sample] = await getMany([
        key,
        schemeKey(key.slice(prefix.length)),
      ]);
      return { key, data, sample: sample ?? undefined };
    }),
  );
  return JSON.stringify(rows, null, 2);
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
  const { scheme, reviews, ...base } = p;
  const { [schemeRuleId]: review, ...baseReviews } = reviews;
  const sidecar = scheme
    ? {
        createdAt: p.createdAt,
        scheme,
        review,
      }
    : null;
  // Clear a withdrawn confirmation in the same transaction as the base save.
  await setMany([
    [prefix + p.id, { ...base, reviews: baseReviews }],
    [schemeKey(p.id), sidecar],
  ]);
}
export async function removeProject(id: string) {
  await delMany([prefix + id, schemeKey(id)]);
}
