import type { Project } from "./model";
export type SaveStatus = { pending: number; failed: string[] };
/** A success in one project cannot mask failures or pending versions elsewhere. */
export function createSaveQueue(
  write: (p: Project) => Promise<void>,
  onStatus: (s: SaveStatus) => void,
) {
  let chain = Promise.resolve();
  let pending = 0;
  const failed = new Set<string>();
  const report = () => onStatus({ pending, failed: [...failed] });
  return {
    enqueue(p: Project) {
      pending++;
      report();
      chain = chain.then(async () => {
        try {
          await write(p);
          failed.delete(p.id);
        } catch {
          failed.add(p.id);
        } finally {
          pending--;
          report();
        }
      });
      return chain;
    },
    settled: () => chain,
    failed: () => [...failed],
    forget(id: string) {
      failed.delete(id);
      report();
    },
  };
}
