import { useRef, useState } from "react";
import {
  Plus,
  Upload,
  Trash2,
  MapPin,
  Check,
  X,
  ImagePlus,
  Film,
  ArrowUpRight,
} from "lucide-react";
import {
  aspects,
  uid,
  type Asset,
  type Aspect,
  type Intent,
  type Locale,
  type Note,
  type Project,
  type ProjectUpdate,
} from "../core/model";
import { Dialog } from "./Dialog";
import { readAsset } from "../core/media";

export function AssetView({
  asset,
  onPoint,
  notes = [],
  selectedId,
  onNote,
  videoRef,
}: {
  asset: Asset;
  onPoint?: (x: number, y: number) => void;
  notes?: Note[];
  selectedId?: string;
  onNote?: (n: Note) => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const video = asset.type.startsWith("video");
  return (
    <div className={`asset-view ${onPoint && !video ? "can-pin" : ""}`}>
      {video ? (
        <video
          ref={videoRef}
          src={asset.data}
          controls
          playsInline
          preload="metadata"
          aria-label={asset.name}
        />
      ) : (
        <img
          src={asset.data}
          alt={asset.name}
          draggable={false}
          onClick={(e) => {
            if (!onPoint) return;
            const r = e.currentTarget.getBoundingClientRect();
            onPoint(
              (e.clientX - r.left) / r.width,
              (e.clientY - r.top) / r.height,
            );
          }}
        />
      )}
      {!video &&
        notes
          .filter((n) => n.x !== undefined)
          .map((n, i) => (
            <button
              key={n.id}
              className={`pin ${n.intent} ${selectedId === n.id ? "selected" : ""}`}
              style={{
                left: `${(n.x || 0) * 100}%`,
                top: `${(n.y || 0) * 100}%`,
              }}
              aria-label={`${i + 1}: ${n.text}`}
              onClick={() => onNote?.(n)}
            >
              {i + 1}
            </button>
          ))}
    </div>
  );
}
export function References({
  project: p,
  update,
  locale,
  notify,
  onNext,
}: {
  project: Project;
  update: (p: ProjectUpdate) => void;
  locale: Locale;
  notify: (s: string, error?: boolean) => void;
  onNext: () => void;
}) {
  const zh = locale === "zh";
  const [selected, setSelected] = useState(p.references[0]?.id || "");
  const [draft, setDraft] = useState<Partial<Note> | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<Asset | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const asset = p.references.find((a) => a.id === selected) || p.references[0];
  const labels: Record<Aspect, string> = zh
    ? {
        overall: "整体感受",
        color: "配色",
        material: "材质",
        layout: "布局与留白",
        type: "文字排版",
        motion: "动效节奏",
      }
    : {
        overall: "Overall",
        color: "Color",
        material: "Material",
        layout: "Layout & space",
        type: "Typography",
        motion: "Motion",
      };
  async function upload(file?: File) {
    if (!file) return;
    if (p.references.length >= 12) {
      notify(
        zh
          ? "每个项目最多12份参考。先移除不需要的参考。"
          : "Up to 12 references per project. Remove one first.",
        true,
      );
      return;
    }
    setBusy(true);
    try {
      const a = await readAsset(file);
      if (
        p.references.reduce(
          (n, r) => n + r.data.length,
          a.data.length + (p.result?.data.length || 0),
        ) > 100_000_000
      )
        throw new Error("size");
      update((latest) => {
        const next = { ...latest, references: [...latest.references, a] };
        if (
          next.references.length > 12 ||
          next.references.reduce(
            (n, r) => n + r.data.length,
            next.result?.data.length || 0,
          ) +
            next.notes.reduce((n, r) => n + (r.frame?.length || 0), 0) >
            100_000_000
        )
          throw new Error("size");
        return next;
      });
      setSelected(a.id);
      notify(
        zh
          ? "已添加，点图片留下你的意见"
          : "Added. Tap the image to leave a note.",
      );
    } catch (e) {
      notify(
        zh
          ? "无法读取。请选择30MB以内的 PNG、JPG、WebP、MP4 或 WebM；视频须能在当前浏览器播放。"
          : "Use a playable PNG, JPG, WebP, MP4 or WebM under 30MB.",
        true,
      );
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  function startNote(x?: number, y?: number) {
    if (!asset) return;
    if (p.notes.length >= 120) {
      notify(
        zh
          ? "这个项目已有120条标记，请编辑已有标记或新建项目。"
          : "This project has 120 notes. Edit one or start another project.",
        true,
      );
      return;
    }
    let frame: string | undefined;
    if (videoRef.current) {
      const video = videoRef.current;
      video.pause();
      try {
        if (video.readyState < 2) throw new Error("not-ready");
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1280 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frame = canvas.toDataURL("image/jpeg", 0.85);
      } catch {
        notify(
          zh
            ? "请先播放或拖动到目标画面，再标记；这样交接包才能带上截图。"
            : "Play or seek to a visible frame before adding a note.",
          true,
        );
        return;
      }
    }
    setDraft({
      assetId: asset.id,
      intent: "like",
      aspect: "overall",
      text: "",
      x,
      y,
      time: asset.type.startsWith("video")
        ? videoRef.current?.currentTime || 0
        : undefined,
      frame,
    });
  }
  function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!draft?.text?.trim()) return;
    const n = {
      ...draft,
      id: draft.id || uid(),
      text: draft.text.trim(),
    } as Note;
    if (
      p.references.reduce(
        (sum, a) => sum + a.data.length,
        p.result?.data.length || 0,
      ) +
        p.notes
          .filter((v) => v.id !== n.id)
          .reduce(
            (sum, a) => sum + (a.frame?.length || 0),
            n.frame?.length || 0,
          ) >
      100_000_000
    ) {
      notify(
        zh
          ? "项目已接近容量上限，请先移除不需要的素材。"
          : "Project limit reached. Remove unneeded media first.",
        true,
      );
      return;
    }
    update({
      ...p,
      notes: draft.id
        ? p.notes.map((v) => (v.id === draft.id ? n : v))
        : [...p.notes, n],
    });
    setDraft(null);
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            02 / {zh ? "让感觉有据可循" : "MAKE IT SPECIFIC"}
          </span>
          <h1>
            {zh ? "喜欢哪里，指给 AI 看。" : "Show exactly what you mean."}
          </h1>
          <p>
            {zh
              ? "你可以喜欢它的留白，却不喜欢它的颜色。只借鉴你标出的部分。"
              : "Love the spacing, not the colors? Borrow only what you point out."}
          </p>
        </div>
        <button
          className="primary"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
        >
          <Plus size={17} />
          {busy
            ? zh
              ? "读取中…"
              : "Reading…"
            : zh
              ? "添加参考"
              : "Add reference"}
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
        hidden
        onChange={(e) => void upload(e.target.files?.[0])}
        aria-label={zh ? "上传参考文件" : "Upload reference"}
      />
      {!asset ? (
        <div
          className="reference-empty"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void upload(e.dataTransfer.files[0]);
          }}
        >
          <div className="empty-art" aria-hidden="true">
            <div className="empty-sheet one">
              <span />
              <span />
              <span />
            </div>
            <div className="empty-sheet two">
              <MapPin size={30} />
              <i />
            </div>
          </div>
          <h2>
            {zh ? "从一张让你心动的截图开始" : "Start with something you love"}
          </h2>
          <p>
            {zh
              ? "产品截图、配色参考，或一段喜欢的动效。"
              : "A product screenshot, a palette, or a motion clip."}
            <br />
            {zh
              ? "也可以上传不喜欢的设计，明确告诉 AI 避开什么。"
              : "You can also add a design you want to avoid."}
          </p>
          <button
            className="secondary"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            <Upload size={17} />
            {zh ? "从设备选择" : "Choose from device"}
          </button>
          <small>
            {zh
              ? "PNG / JPG / WebP / MP4 / WebM · 每份≤30MB · 仅保存在本机"
              : "PNG / JPG / WebP / MP4 / WebM · ≤30MB each · Local only"}
          </small>
          <button className="text-button" onClick={onNext}>
            {zh ? "暂时没有参考，先看简报" : "No references yet? See the brief"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      ) : (
        <>
          <div className="reference-tabs">
            {p.references.map((a, i) => (
              <button
                key={a.id}
                className={a.id === asset.id ? "active" : ""}
                onClick={() => setSelected(a.id)}
              >
                {a.type.startsWith("video") ? (
                  <Film size={16} />
                ) : (
                  <ImagePlus size={16} />
                )}
                <span>
                  {i + 1}. {a.name}
                </span>
              </button>
            ))}
          </div>
          <div className="reference-workspace">
            <div className="reference-stage">
              <div className="stage-tools">
                <span>
                  <MapPin size={15} />
                  {zh
                    ? asset.type.startsWith("video")
                      ? "停在喜欢的瞬间，再添加标记"
                      : "点击图中任意位置，留下一个标记"
                    : asset.type.startsWith("video")
                      ? "Pause at a moment, then add a note"
                      : "Tap anywhere on the image to pin a note"}
                </span>
                <button
                  className="icon-button"
                  onClick={() => setRemoving(asset)}
                  aria-label={zh ? "删除这份参考" : "Remove reference"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <AssetView
                key={asset.id}
                asset={asset}
                notes={p.notes.filter((n) => n.assetId === asset.id)}
                onPoint={startNote}
                onNote={setDraft}
                videoRef={videoRef}
              />
              <button
                className="secondary whole-note"
                onClick={() => startNote()}
              >
                <Plus size={16} />
                {zh
                  ? asset.type.startsWith("video")
                    ? "标记当前时刻"
                    : "对整张图说一句"
                  : asset.type.startsWith("video")
                    ? "Note this moment"
                    : "Note the whole image"}
              </button>
              <label className="source-input">
                {zh ? "参考来源（可选）" : "Reference source (optional)"}
                <input
                  value={asset.source}
                  placeholder={
                    zh
                      ? "作品名或网址，方便以后找回"
                      : "A title or URL to find it again"
                  }
                  maxLength={2000}
                  onChange={(e) =>
                    update({
                      ...p,
                      references: p.references.map((a) =>
                        a.id === asset.id
                          ? { ...a, source: e.target.value }
                          : a,
                      ),
                    })
                  }
                />
              </label>
            </div>
            <aside className="reference-notes">
              <div className="aside-title">
                <h2>{zh ? "你的标记" : "Your notes"}</h2>
                <span>
                  {p.notes.filter((n) => n.assetId === asset.id).length}
                </span>
              </div>
              {!p.notes.some((n) => n.assetId === asset.id) && (
                <p className="empty-note">
                  {zh
                    ? "例如：“我喜欢这个半透明的底，但文字要再清楚一点。”不需要设计术语。"
                    : "For example: “I like this translucent surface, but the text needs to be clearer.” No design jargon needed."}
                </p>
              )}
              {p.notes
                .filter((n) => n.assetId === asset.id)
                .map((n, i) => (
                  <button
                    className={`note-item ${n.intent}`}
                    key={n.id}
                    onClick={() => setDraft(n)}
                  >
                    <span className="note-type">
                      {n.intent === "avoid" ? (
                        <X size={14} />
                      ) : n.intent === "keep" ? (
                        <Check size={14} />
                      ) : (
                        <MapPin size={14} />
                      )}
                      {zh
                        ? { like: "借鉴", avoid: "避免", keep: "保留" }[
                            n.intent
                          ]
                        : n.intent}{" "}
                      · {labels[n.aspect]}
                      {n.time !== undefined ? ` · ${n.time.toFixed(1)}s` : ""}
                    </span>
                    <p>{n.text}</p>
                    <small>
                      {n.x === undefined
                        ? zh
                          ? "整张参考"
                          : "Whole reference"
                        : zh
                          ? `位置标记 ${i + 1}`
                          : `Pin ${i + 1}`}
                    </small>
                  </button>
                ))}
            </aside>
          </div>
          <div className="step-footer">
            <span>
              {zh
                ? "参考不必多，指出一两个关键细节就有帮助。"
                : "A few precise observations are more useful than a large moodboard."}
            </span>
            <button className="primary" onClick={onNext}>
              {zh ? "整理成设计简报" : "Build the brief"}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </>
      )}
      {draft && (
        <Dialog
          title={zh ? "这一处，让你想到了什么？" : "What matters here?"}
          close={() => setDraft(null)}
        >
          <form onSubmit={saveNote}>
            <div className="intent-options">
              {(["like", "keep", "avoid"] as Intent[]).map((v) => (
                <button
                  type="button"
                  className={draft.intent === v ? "selected" : ""}
                  aria-pressed={draft.intent === v}
                  onClick={() => setDraft({ ...draft, intent: v })}
                  key={v}
                >
                  {zh
                    ? { like: "想借鉴", keep: "必须保留", avoid: "想避免" }[v]
                    : {
                        like: "Take inspiration",
                        keep: "Must keep",
                        avoid: "Avoid",
                      }[v]}
                </button>
              ))}
            </div>
            <label>
              {zh ? "只针对哪个方面？" : "Which aspect?"}
              <select
                value={draft.aspect}
                onChange={(e) =>
                  setDraft({ ...draft, aspect: e.target.value as Aspect })
                }
              >
                {aspects.map((a) => (
                  <option value={a} key={a}>
                    {labels[a]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {zh ? "用你的话描述" : "In your own words"}
              <textarea
                autoFocus
                required
                maxLength={3000}
                rows={4}
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                placeholder={
                  zh
                    ? "例如：喜欢柔和的光线，但不要发光的文字。"
                    : "For example: soft lighting, but no glowing text."
                }
              />
            </label>
            <div className="dialog-actions">
              {draft.id && (
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() => {
                    update({
                      ...p,
                      notes: p.notes.filter((n) => n.id !== draft.id),
                    });
                    setDraft(null);
                  }}
                >
                  {zh ? "删除标记" : "Delete note"}
                </button>
              )}
              <button
                type="submit"
                className="primary"
                disabled={!draft.text?.trim()}
              >
                {zh ? "保存标记" : "Save note"}
                <Check size={16} />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {removing && (
        <Dialog
          title={zh ? "移除这份参考？" : "Remove this reference?"}
          close={() => setRemoving(null)}
        >
          <p>
            {zh
              ? "这张参考和它的标记会从当前项目移除。设备中的原文件不会改变。"
              : "This reference and its notes will be removed from the project. Your original file is untouched."}
          </p>
          <div className="dialog-actions">
            <button className="secondary" onClick={() => setRemoving(null)}>
              {zh ? "取消" : "Cancel"}
            </button>
            <button
              className="primary destructive"
              onClick={() => {
                update({
                  ...p,
                  references: p.references.filter((a) => a.id !== removing.id),
                  notes: p.notes.filter((n) => n.assetId !== removing.id),
                });
                setRemoving(null);
              }}
            >
              {zh ? "移除参考" : "Remove"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
