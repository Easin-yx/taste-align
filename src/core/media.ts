import { uid, type Asset } from "./model";
const accepted = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/webm",
];
export async function readAsset(file: File): Promise<Asset> {
  if (!accepted.includes(file.type)) throw new Error("format");
  if (file.size > 30 * 1024 * 1024 || file.size === 0) throw new Error("size");
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const video = file.type.startsWith("video");
  const el = document.createElement(
    video ? "video" : "img",
  ) as HTMLVideoElement & HTMLImageElement;
  const size = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("decode")), 12000);
      const done = () => {
        clearTimeout(timer);
        const width = video ? el.videoWidth : el.naturalWidth;
        const height = video ? el.videoHeight : el.naturalHeight;
        width && height
          ? resolve({ width, height })
          : reject(new Error("decode"));
      };
      el.onerror = () => {
        clearTimeout(timer);
        reject(new Error("decode"));
      };
      if (video) {
        el.preload = "metadata";
        el.onloadedmetadata = done;
      } else el.onload = done;
      el.src = data;
    },
  );
  el.removeAttribute("src");
  return {
    id: uid(),
    name: file.name,
    type: file.type as Asset["type"],
    data,
    ...size,
    source: "",
  };
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
