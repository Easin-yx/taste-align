import { useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCheck,
  Copy,
  FileText,
  ImagePlus,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import {
  currentReview,
  dimensionCopy,
  dimensions,
  reviewFingerprint,
  rulesFor,
  tr,
  type Locale,
  type Project,
  type ProjectUpdate,
} from "../core/model";
import { makeArchive, makeBrief, makeReview } from "../core/export";
import { download, readAsset } from "../core/media";
import { AssetView } from "./References";

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const t = document.createElement("textarea");
  t.value = text;
  t.style.position = "fixed";
  t.style.opacity = "0";
  document.body.append(t);
  t.select();
  const ok = document.execCommand("copy");
  t.remove();
  if (!ok) throw new Error("clipboard");
}
export function Handoff({
  project: p,
  update,
  locale,
  notify,
  onReview,
}: {
  project: Project;
  update: (p: ProjectUpdate) => void;
  locale: Locale;
  notify: (s: string, e?: boolean) => void;
  onReview: () => void;
}) {
  const zh = locale === "zh";
  const rules = rulesFor(p, locale);
  const [busy, setBusy] = useState(false);
  async function exportZip() {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 30));
      const data = makeArchive(p, locale);
      download(
        new Blob([data as BlobPart], { type: "application/zip" }),
        `taste-align-${p.name.replace(/[^\p{L}\p{N}-]/gu, "-").slice(0, 40)}.zip`,
      );
      notify(
        zh
          ? "已导出。压缩包也可导回这里继续编辑。"
          : "Exported. You can import this bundle to keep editing.",
      );
    } catch {
      notify(
        zh
          ? "导出失败。请减少过大的视频后重试。"
          : "Export failed. Try removing a large video.",
        true,
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await copyText(makeBrief(p, locale));
      notify(
        zh
          ? "简报已复制；有图片时请同时提供参考包。"
          : "Brief copied. Include reference assets too.",
      );
    } catch {
      download(
        new Blob([makeBrief(p, locale)], { type: "text/markdown" }),
        "DESIGN_BRIEF.md",
      );
      notify(
        zh
          ? "无法访问剪贴板，已改为下载简报。"
          : "Clipboard unavailable. Downloaded the brief instead.",
      );
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            03 / {zh ? "带着证据交接" : "HAND OFF WITH EVIDENCE"}
          </span>
          <h1>
            {zh
              ? "现在，你们有了共同语言。"
              : "Now you have a shared language."}
          </h1>
          <p>
            {zh
              ? "下面只记录你表达过的偏好。未选择的部分，会诚实地留白。"
              : "Only your expressed choices are recorded. Unanswered questions stay open."}
          </p>
        </div>
      </div>
      <div className="handoff-layout">
        <section className="brief-paper">
          <div className="paper-top">
            <span>TASTE ALIGN / BRIEF</span>
            <span>v1</span>
          </div>
          <h2>{p.name}</h2>
          <p className="brief-goal">
            {p.goal ||
              (zh
                ? "尚未填写项目目标，可在项目菜单中补充。"
                : "No project goal yet. Add it from the project menu.")}
          </p>
          <div className="brief-divider" />
          {!rules.length && (
            <div className="no-rules">
              <FileText size={28} />
              <h3>
                {zh ? "还没有已确认的要求" : "No confirmed requirements yet"}
              </h3>
              <p>
                {zh
                  ? "选择一个对照，标记一张参考，或在下面写下你想要的感觉。"
                  : "Make a comparison, mark a reference, or describe what you want below."}
              </p>
            </div>
          )}
          {rules.map((r, i) => (
            <article className={`brief-rule ${r.kind}`} key={r.id}>
              <span className="rule-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="rule-kind">{r.title}</span>
                <p>{r.text}</p>
                {r.reason && <blockquote>{r.reason}</blockquote>}
                {r.assetId && (
                  <small>
                    <ImagePlus size={13} />
                    {p.references.find((a) => a.id === r.assetId)?.name}
                    {r.note?.time !== undefined
                      ? ` · ${r.note.time.toFixed(1)}s`
                      : ""}
                    {r.note?.x !== undefined
                      ? ` · ${Math.round(r.note.x * 100)}%, ${Math.round((r.note.y || 0) * 100)}%`
                      : ""}
                  </small>
                )}
              </div>
            </article>
          ))}
          <label className="directives-label">
            {zh ? "还有什么一定要说明？" : "Anything else to make explicit?"}
            <textarea
              rows={3}
              maxLength={10000}
              placeholder={
                zh
                  ? "例如：阅读页保持安静；收藏成功时，可以有一次特别的动效。\n每行一条，会一起交给 AI。"
                  : "For example: keep reading quiet; make saving feel special.\nOne requirement per line."
              }
              value={p.directives}
              onChange={(e) => update({ ...p, directives: e.target.value })}
            />
          </label>
          <details className="open-decisions">
            <summary>
              {zh ? "尚未决定的部分" : "Open decisions"}{" "}
              <span>
                {
                  dimensions.filter(
                    (d) => !p.choices[d] || p.choices[d]?.value === "neither",
                  ).length
                }
              </span>
            </summary>
            {dimensions
              .filter((d) => !p.choices[d] || p.choices[d]?.value === "neither")
              .map((d) => (
                <p key={d}>
                  <b>{tr(dimensionCopy[d].title, locale)}</b> —{" "}
                  {p.choices[d]?.value === "neither"
                    ? zh
                      ? "两个示例都不合适"
                      : "Neither example fits"
                    : zh
                      ? "尚未选择"
                      : "Not chosen"}
                  {p.choices[d]?.reason && `；${p.choices[d]?.reason}`}
                </p>
              ))}
            <p>
              {zh
                ? "有限的示例不能代表全部风格。偏好有冲突时，请 AI 指出具体冲突，不要默默覆盖。"
                : "Limited examples cannot define every style. Ask the AI to identify conflicts, not silently override them."}
            </p>
          </details>
        </section>
        <aside className="delivery-aside">
          <div className="bundle-illustration" aria-hidden="true">
            <div className="bundle-sheet back" />
            <div className="bundle-sheet front">
              <span>
                YOUR
                <br />
                TASTE.
              </span>
              <i />
              <i />
              <i />
              <div className="bundle-seal">
                <Check size={21} />
              </div>
            </div>
          </div>
          <h2>{zh ? "带走你的审美依据" : "Take your taste with you"}</h2>
          <p>
            {zh
              ? "简报、参考原图、标记位置和可编辑项目，一次打包。"
              : "The brief, original references, pin locations and editable project, in one bundle."}
          </p>
          <button
            className="primary"
            onClick={() => void exportZip()}
            disabled={busy}
          >
            <ArrowDownToLine size={17} />
            {busy
              ? zh
                ? "打包中…"
                : "Packing…"
              : zh
                ? "下载 AI 交接包"
                : "Download AI bundle"}
          </button>
          <button className="secondary" onClick={() => void copy()}>
            <Copy size={16} />
            {zh ? "只复制文字简报" : "Copy text brief"}
          </button>
          <div className="how-to">
            <b>{zh ? "怎么交给 AI？" : "How to use it"}</b>
            <ol>
              <li>
                {zh
                  ? "解压后放进正在开发的项目。"
                  : "Unzip into the project you are building."}
              </li>
              <li>
                {zh
                  ? "让 AI 读取 DESIGN_BRIEF.md 和参考资产。"
                  : "Ask the AI to read DESIGN_BRIEF.md and its reference assets."}
              </li>
              <li>
                {zh
                  ? "拿到新稿后，回来逐条核对。"
                  : "Return with the new design and review it."}
              </li>
            </ol>
            <p>
              {zh
                ? "网页聊天也可直接上传简报与图片。不要只传简报而遗漏图片。"
                : "For chat tools, attach the brief and images together."}
            </p>
          </div>
          <div className="privacy-line">
            <ShieldCheck size={17} />
            <span>
              {zh
                ? "资料留在本机。只有你主动交给 AI 时，才离开这里。"
                : "Your data stays on this device until you choose to share it."}
            </span>
          </div>
          <button className="text-button" onClick={onReview}>
            {zh ? "我已经拿到新稿" : "I have a new design"}
            <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </>
  );
}
export function Review({
  project: p,
  update,
  locale,
  notify,
}: {
  project: Project;
  update: (p: ProjectUpdate) => void;
  locale: Locale;
  notify: (s: string, e?: boolean) => void;
}) {
  const zh = locale === "zh";
  const input = useRef<HTMLInputElement>(null);
  const rules = rulesFor(p, locale);
  const [reference, setReference] = useState(p.references[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const ref = p.references.find((a) => a.id === reference) || p.references[0];
  const done = rules.filter((r) => currentReview(p, r)).length;
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const a = await readAsset(file);
      if (
        p.references.reduce((n, r) => n + r.data.length, a.data.length) >
        100_000_000
      )
        throw new Error("size");
      update((latest) => {
        if (
          latest.references.reduce((n, r) => n + r.data.length, a.data.length) +
            latest.notes.reduce((n, r) => n + (r.frame?.length || 0), 0) >
          100_000_000
        )
          throw new Error("size");
        return { ...latest, result: a };
      });
      notify(
        zh
          ? "新稿已添加，请重新逐条核对。"
          : "New design added. Review each requirement again.",
      );
    } catch {
      notify(
        zh
          ? "无法读取新稿，请选择30MB以内、浏览器可打开的图片或视频。"
          : "Use a playable image or video under 30MB.",
        true,
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  async function copy() {
    try {
      await copyText(makeReview(p, locale));
      notify(zh ? "核对结果已复制" : "Review copied");
    } catch {
      download(
        new Blob([makeReview(p, locale)], { type: "text/markdown" }),
        "REVIEW.md",
      );
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            04 / {zh ? "把理解落到新稿上" : "CLOSE THE LOOP"}
          </span>
          <h1>{zh ? "这次，真的对上了吗？" : "Did the new design get it?"}</h1>
          <p>
            {zh
              ? "对着参考逐条确认。这里不替你给审美打分。"
              : "Check it against your references. Your judgment, not an automated taste score."}
          </p>
        </div>
        <button
          className="primary"
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          <Upload size={17} />
          {busy
            ? zh
              ? "读取中…"
              : "Reading…"
            : p.result
              ? zh
                ? "换一版新稿"
                : "Replace result"
              : zh
                ? "上传 AI 做的新稿"
                : "Upload the new design"}
        </button>
      </div>
      <input
        hidden
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
        onChange={(e) => void upload(e.target.files?.[0])}
        aria-label={zh ? "上传新稿文件" : "Upload result file"}
      />
      {!p.result ? (
        <div className="reference-empty">
          <div className="review-empty-icon">
            <CheckCheck size={44} strokeWidth={1.3} />
          </div>
          <h2>
            {zh ? "让“改好了”有迹可查" : "Make “done” something you can check"}
          </h2>
          <p>
            {zh
              ? "上传一张新稿截图或短视频，和参考并排看。\n修改过要求或换过稿后，旧的确认不会算通过。"
              : "Upload a screenshot or clip to compare with your references.\nChanging requirements or the result invalidates old approvals."}
          </p>
          <button className="secondary" onClick={() => input.current?.click()}>
            <ImagePlus size={17} />
            {zh ? "选择新稿" : "Choose a result"}
          </button>
        </div>
      ) : (
        <>
          <div className="review-comparison">
            <div className="review-pane">
              <div className="pane-heading">
                <span>{zh ? "参考" : "Reference"}</span>
                {p.references.length > 0 && (
                  <select
                    aria-label={zh ? "选择核对参考" : "Choose reference"}
                    value={ref?.id}
                    onChange={(e) => setReference(e.target.value)}
                  >
                    {p.references.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {ref ? (
                <AssetView
                  asset={ref}
                  notes={p.notes.filter((n) => n.assetId === ref.id)}
                  onNote={(n) =>
                    document
                      .getElementById(`review-${n.id}`)
                      ?.scrollIntoView({
                        behavior: window.matchMedia(
                          "(prefers-reduced-motion: reduce)",
                        ).matches
                          ? "instant"
                          : "smooth",
                        block: "center",
                      })
                  }
                />
              ) : (
                <div className="no-reference">
                  {zh
                    ? "没有个人参考图，可依据下方已确认要求核对。"
                    : "No reference image. Review against the requirements below."}
                </div>
              )}
            </div>
            <div className="review-pane">
              <div className="pane-heading">
                <span>{zh ? "AI 新稿" : "New design"}</span>
                <small>{p.result.name}</small>
              </div>
              <AssetView asset={p.result} />
            </div>
          </div>
          <div className="review-list-heading">
            <div>
              <h2>{zh ? "逐条核对" : "Review each requirement"}</h2>
              <span>
                {zh
                  ? `已核对 ${done} / ${rules.length} 条`
                  : `${done} / ${rules.length} reviewed`}
              </span>
            </div>
            <button className="secondary" onClick={() => void copy()}>
              <Copy size={16} />
              {zh ? "复制核对结果" : "Copy review"}
            </button>
          </div>
          {!rules.length && (
            <p className="empty-note">
              {zh
                ? "还没有要求可核对。先回到“看差别”或“交给 AI”补充。"
                : "No requirements yet. Add some in Compare or Brief first."}
            </p>
          )}
          {rules.map((r) => {
            const v = currentReview(p, r);
            const stale = !!p.reviews[r.id] && !v;
            return (
              <div
                id={`review-${r.id}`}
                className={`review-row ${v?.state || ""}`}
                key={r.id}
              >
                <div>
                  <span className="rule-kind">
                    {r.title}
                    {stale &&
                      ` · ${zh ? "之前的确认已过期" : "Previous review is stale"}`}
                  </span>
                  <p>{r.text}</p>
                  {r.reason && (
                    <blockquote className="review-reason">
                      {r.reason}
                    </blockquote>
                  )}
                  {r.assetId && (
                    <button
                      className="text-button review-evidence"
                      onClick={() => {
                        setReference(r.assetId!);
                        document
                          .querySelector(".review-comparison")
                          ?.scrollIntoView({
                            behavior: window.matchMedia(
                              "(prefers-reduced-motion: reduce)",
                            ).matches
                              ? "instant"
                              : "smooth",
                            block: "start",
                          });
                      }}
                    >
                      {zh ? "查看对应参考" : "View this reference"} ·{" "}
                      {p.references.find((a) => a.id === r.assetId)?.name}
                      {r.note?.x !== undefined
                        ? ` · ${Math.round(r.note.x * 100)}%, ${Math.round((r.note.y || 0) * 100)}%`
                        : ""}
                      {r.note?.time !== undefined
                        ? ` · ${r.note.time.toFixed(1)}s`
                        : ""}
                      <ArrowRight size={13} />
                    </button>
                  )}
                  {v?.state === "change" && (
                    <label className="review-comment">
                      {zh ? "哪里还不对？" : "What still needs to change?"}
                      <input
                        maxLength={3000}
                        value={v.comment}
                        placeholder={
                          zh
                            ? "例如：还是太厚，边缘要更薄。"
                            : "For example: the edge still feels too heavy."
                        }
                        onChange={(e) =>
                          update({
                            ...p,
                            reviews: {
                              ...p.reviews,
                              [r.id]: { ...v, comment: e.target.value },
                            },
                          })
                        }
                      />
                    </label>
                  )}
                </div>
                <div className="review-actions">
                  <button
                    className={v?.state === "pass" ? "selected" : ""}
                    aria-pressed={v?.state === "pass"}
                    onClick={() =>
                      update({
                        ...p,
                        reviews: {
                          ...p.reviews,
                          [r.id]: {
                            state: "pass",
                            comment: "",
                            fingerprint: reviewFingerprint(p, r),
                          },
                        },
                      })
                    }
                  >
                    <Check size={16} />
                    {zh ? "符合" : "Matches"}
                  </button>
                  <button
                    className={v?.state === "change" ? "selected change" : ""}
                    aria-pressed={v?.state === "change"}
                    onClick={() =>
                      update({
                        ...p,
                        reviews: {
                          ...p.reviews,
                          [r.id]: {
                            state: "change",
                            comment: v?.comment || "",
                            fingerprint: reviewFingerprint(p, r),
                          },
                        },
                      })
                    }
                  >
                    <X size={16} />
                    {zh ? "需要改" : "Needs work"}
                  </button>
                  {v && (
                    <button
                      className="clear-review"
                      aria-label={
                        zh ? `撤销核对：${r.title}` : `Clear review: ${r.title}`
                      }
                      onClick={() => {
                        const reviews = { ...p.reviews };
                        delete reviews[r.id];
                        update({ ...p, reviews });
                      }}
                    >
                      ↶
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <p className="review-footnote">
            {zh
              ? "截图只能核对静态效果。动效要求请结合实际可操作页面或视频检查。"
              : "Screenshots only verify static appearance. Review motion in the real interactive page or a video."}
          </p>
        </>
      )}
    </>
  );
}
