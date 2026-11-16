import type { DirectionId, PaletteId } from "./directions";
const images = import.meta.glob<string>("./samples/*.png", {
  eager: true,
  import: "default",
  query: "?inline",
});
export function sampleImage(
  direction: DirectionId,
  palette: PaletteId,
): string {
  return images[`./samples/${direction}-${palette}.png`];
}
