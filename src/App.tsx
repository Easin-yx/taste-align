/* THESIS: A visual calibration bench that turns a person's choices into traceable AI requirements.
OWN-WORLD: Cool white surface, petrol controls, full-size material specimens, fine optical marks.
STORY: Compare one difference, point at a reference, hand off evidence, inspect the next design.
FIRST VIEWPORT: Small project header, four-step rail, two working specimens and one clear choice.
FORM: Operate; reference/calibration bench chosen under explicit user delegation, no approval round. */
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Columns2,
  FolderOpen,
  Globe2,
  Image,
  Menu,
  Plus,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
  ClipboardCheck,
  FileText,
  Circle,
} from "lucide-react";
import {
  dimensionCopy,
  dimensions,
  newProject,
  rulesFor,
  tr,
  uid,
  type Dimension,
  type Locale,
  type Project,
  type ProjectUpdate,
} from "./core/model";
import {
  loadProjects,
  removeProject,
  saveProject,
  exportInvalid,
} from "./core/storage";
import { createSaveQueue } from "./core/save-queue";
import { download } from "./core/media";
import { readArchive } from "./core/export";
import { Dialog } from "./components/Dialog";
import { Specimen, ReplayButton } from "./components/Specimen";
import { References } from "./components/References";
import { Handoff, Review } from "./components/Handoff";
type Step = "compare" | "references" | "brief" | "review";
const steps: Step[] = ["compare", "references", "brief", "review"];

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem("taste-align:locale") === "en" ? "en" : "zh";
    } catch {
      return "zh";
    }
  });
  const zh = locale === "zh";
  const [projects, setProjectsState] = useState<Project[]>([]);
  const projectsRef = useRef<Project[]>([]);
  function setProjects(value: Project[] | ((all: Project[]) => Project[])) {
    const next =
      typeof value === "function" ? value(projectsRef.current) : value;
    projectsRef.current = next;
    setProjectsState(next);
  }
  const [invalidKeys, setInvalidKeys] = useState<string[]>([]);
  const [activeId, setActiveId] = useState("");
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [step, setStep] = useState<Step>("compare");
  const [dimension, setDimension] = useState<Dimension>("material");
  const [replay, setReplay] = useState(0);
  const [dialog, setDialog] = useState<
    "projects" | "settings" | "help" | "delete" | null
  >(null);
  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const saveChain = useRef(Promise.resolve());
  const queue = useRef<ReturnType<typeof createSaveQueue> | null>(null);
  if (!queue.current)
    queue.current = createSaveQueue(saveProject, (status) => {
      setStorageError(status.failed.length > 0);
      setSaveState(
        status.failed.length ? "error" : status.pending ? "saving" : "saved",
      );
    });
  const p = projects.find((p) => p.id === activeId);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadProjects()
      .then(async (loaded) => {
        let list = loaded.projects;
        setInvalidKeys(loaded.invalid);
        if (!list.length) {
          const first = newProject(locale);
          list = [first];
          try {
            await saveProject(first);
          } catch {
            setStorageError(true);
            setSaveState("error");
          }
        }
        setProjects(list);
        let id = "";
        try {
          id = localStorage.getItem("taste-align:active") || "";
        } catch {
          /* optional preference */
        }
        setActiveId(list.some((p) => p.id === id) ? id : list[0].id);
        setReady(true);
      })
      .catch(() => {
        const first = newProject(locale);
        setProjects([first]);
        setActiveId(first.id);
        setStorageError(true);
        setSaveState("error");
        setReady(true);
      });
  }, []);
  useEffect(() => {
    document.documentElement.lang = zh ? "zh-CN" : "en";
    try {
      localStorage.setItem("taste-align:locale", locale);
    } catch {
      /* optional preference */
    }
  }, [locale]);
  useEffect(() => {
    if (activeId)
      try {
        localStorage.setItem("taste-align:active", activeId);
      } catch {
        /* optional preference */
      }
  }, [activeId]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.error ? 9000 : 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState !== "saved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);
  function notify(text: string, error = false) {
    setToast({ text, error });
  }
  function persist(next: Project) {
    saveChain.current = queue.current!.enqueue(next);
  }
  function update(next: ProjectUpdate) {
    const current = projectsRef.current.find((v) => v.id === activeId);
    if (!current) return;
    const changed = typeof next === "function" ? next(current) : next;
    const value = { ...changed, updatedAt: new Date().toISOString() };
    setProjects((all) => all.map((v) => (v.id === value.id ? value : v)));
    persist(value);
  }
  function goto(s: Step) {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const next = newProject(locale);
    if (newName.trim()) next.name = newName.trim();
    setProjects((all) => [next, ...all]);
    setActiveId(next.id);
    persist(next);
    setDialog(null);
    setNewName("");
    setDimension("material");
    goto("compare");
  }
  async function importFile(file?: File) {
    if (!file) return;
    setImporting(true);
    try {
      const imported = await readArchive(file);
      const copy = {
        ...imported,
        id: uid(),
        name: imported.name.slice(0, 108) + (zh ? " · 导入" : " · imported"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveChain.current;
      await saveProject(copy);
      setProjects((all) => [copy, ...all]);
      setActiveId(copy.id);
      setDialog(null);
      goto("brief");
      notify(
        zh
          ? "已导入为独立副本，原项目保持不变。"
          : "Imported as a copy. Existing projects are unchanged.",
      );
    } catch {
      notify(
        zh
          ? "导入失败：请使用本工具导出的完整 ZIP 或有效项目 JSON。原项目没有改变。"
          : "Import failed. Use a complete Taste Align ZIP or project JSON. Existing projects are unchanged.",
        true,
      );
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = "";
    }
  }
  async function deleteCurrent() {
    if (!p) return;
    try {
      await saveChain.current;
      await removeProject(p.id);
      queue.current?.forget(p.id);
      const rest = projects.filter((v) => v.id !== p.id);
      if (!rest.length) {
        const n = newProject(locale);
        await saveProject(n);
        rest.push(n);
      }
      setProjects(rest);
      setActiveId(rest[0].id);
      setDialog(null);
      goto("compare");
    } catch {
      notify(zh ? "删除失败，请重试。" : "Could not delete. Try again.", true);
    }
  }
  const nav = zh
    ? ["看差别", "标记参考", "交给 AI", "核对新稿"]
    : ["Compare", "References", "AI brief", "Review"];
  const icons = [Columns2, Image, FileText, ClipboardCheck];
  const selected = p?.choices[dimension];
  const def = dimensionCopy[dimension];
  if (!ready || !p)
    return (
      <div className="loading-screen">
        <div className="brand-symbol" />
        <p>{zh ? "打开你的工作台…" : "Opening your workspace…"}</p>
      </div>
    );
  return (
    <div className="app-shell">
      <a href="#workspace" className="skip-link">
        {zh ? "跳到工作区" : "Skip to workspace"}
      </a>
      <header className="app-header">
        <button
          className="brand"
          onClick={() => goto("compare")}
          aria-label={zh ? "同频首页" : "Taste Align home"}
        >
          <span className="brand-symbol" />
          <span>
            Taste Align <small>同频</small>
          </span>
        </button>
        <div className="header-divider" />
        <button
          className="project-switcher"
          onClick={() => setDialog("projects")}
        >
          <span>{p.name}</span>
          <ChevronDown size={14} />
        </button>
        <div className="header-actions">
          <span className={`save-status ${saveState}`}>
            <i />
            {zh
              ? { saved: "已保存在本机", saving: "保存中", error: "尚未保存" }[
                  saveState
                ]
              : {
                  saved: "Saved on this device",
                  saving: "Saving",
                  error: "Not saved",
                }[saveState]}
          </span>
          <button
            className="icon-button"
            onClick={() => setLocale(zh ? "en" : "zh")}
            aria-label={zh ? "Switch to English" : "切换中文"}
          >
            <Globe2 size={18} />
          </button>
          <button
            className="icon-button"
            onClick={() => setDialog("help")}
            aria-label={zh ? "使用帮助" : "Help"}
          >
            <CircleHelp size={18} />
          </button>
        </div>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <div className="side-intro">
            <span className="side-label">
              {zh ? "你的审美，有迹可循。" : "Your taste. Made tangible."}
            </span>
          </div>
          <nav aria-label={zh ? "对齐流程" : "Alignment workflow"}>
            {steps.map((s, i) => {
              const Icon = icons[i];
              return (
                <button
                  key={s}
                  className={step === s ? "active" : ""}
                  aria-current={step === s ? "step" : undefined}
                  onClick={() => goto(s)}
                >
                  <Icon size={19} />
                  <span>{nav[i]}</span>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                </button>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <button
              className="text-button"
              onClick={() => setDialog("settings")}
            >
              <Settings2 size={17} />
              {zh ? "项目设置" : "Project settings"}
            </button>
            <div className="local-note">
              <ShieldCheck size={16} />
              <span>
                {zh
                  ? "无需账号与 API\n数据只留在你的浏览器"
                  : "No account or API needed\nData stays in your browser"}
              </span>
            </div>
            <a
              href="https://github.com/Easin-yx/taste-align"
              target="_blank"
              rel="noreferrer"
            >
              {zh ? "开源 · v0.1" : "Open source · v0.1"}
              <ArrowRight size={13} />
            </a>
          </div>
        </aside>
        <main id="workspace" className={`workspace step-${step}`}>
          {invalidKeys.length > 0 && (
            <div className="storage-warning" role="alert">
              {zh
                ? `${invalidKeys.length} 个本地项目无法读取，原数据仍保留；其他项目可继续使用。`
                : `${invalidKeys.length} local project(s) could not be read. Original data is retained; other projects still work.`}
              <button
                onClick={async () => {
                  try {
                    download(
                      new Blob([await exportInvalid(invalidKeys)], {
                        type: "application/json",
                      }),
                      "taste-align-recovery.json",
                    );
                  } catch {
                    notify(
                      zh
                        ? "无法导出，请保留当前浏览器数据。"
                        : "Export unavailable. Keep this browser data.",
                      true,
                    );
                  }
                }}
              >
                {zh ? "导出待恢复数据" : "Export recovery data"}
              </button>
            </div>
          )}
          {storageError && (
            <div className="storage-warning" role="alert">
              <b>
                {zh ? "本机保存暂不可用。" : "Local saving is unavailable."}
              </b>{" "}
              {zh
                ? "当前改动仍在页面里，请到“交给 AI”下载备份后再退出。"
                : "Your changes remain in this page. Download a backup from AI brief before leaving."}
              <button
                onClick={() => {
                  const failed = queue.current?.failed() || [];
                  projectsRef.current
                    .filter((v) => failed.includes(v.id) || v.id === p.id)
                    .forEach(persist);
                }}
              >
                {zh ? "重试保存" : "Retry saving"}
              </button>
            </div>
          )}
          {step === "compare" && (
            <>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    01 /{" "}
                    {zh ? "不用懂术语，先看差别" : "SEE IT BEFORE YOU NAME IT"}
                  </span>
                  <h1>{tr(def.question, locale)}</h1>
                  <p>
                    {zh
                      ? "同样的内容，只改变一个方面。选更接近你想要的感觉。"
                      : "The same content. One difference. Choose what feels closer to your vision."}
                  </p>
                </div>
                <button
                  className="project-settings-link text-button"
                  onClick={() => setDialog("settings")}
                >
                  <SlidersHorizontal size={16} />
                  {zh ? "描述我的项目" : "Describe my project"}
                </button>
              </div>
              <div
                className="dimension-nav"
                role="tablist"
                aria-label={zh ? "对照维度" : "Comparison dimensions"}
              >
                {dimensions.map((d, i) => (
                  <button
                    role="tab"
                    aria-selected={dimension === d}
                    className={dimension === d ? "active" : ""}
                    key={d}
                    onClick={() => {
                      setDimension(d);
                      setReplay(0);
                    }}
                  >
                    <span
                      className={`dimension-number ${p.choices[d] ? "complete" : ""}`}
                    >
                      {p.choices[d] ? <Check size={13} /> : i + 1}
                    </span>
                    {tr(dimensionCopy[d].title, locale)}
                  </button>
                ))}
              </div>
              <div className="comparison-toolbar">
                <span>
                  {zh ? "你的判断没有标准答案" : "There is no correct answer"}
                  <span className="subtle-dot">·</span>
                  {zh ? "原创示例界面" : "Original sample UI"}
                </span>
                {dimension === "motion" && (
                  <ReplayButton
                    locale={locale}
                    onClick={() => setReplay((n) => n + 1)}
                  />
                )}
              </div>
              <div className="comparison-pair">
                {(["a", "b"] as const).map((v) => (
                  <section
                    className={`comparison-option ${selected?.value === v ? "chosen" : ""}`}
                    key={v}
                  >
                    <div className="option-label">
                      <span>{v.toUpperCase()}</span>
                      <span>{tr(def[v], locale)}</span>
                      {selected?.value === v && (
                        <span className="chosen-label">
                          <Check size={13} />
                          {zh ? "已选择" : "Selected"}
                        </span>
                      )}
                    </div>
                    <Specimen
                      key={dimension}
                      dimension={dimension}
                      variant={v}
                      project={p}
                      locale={locale}
                      replay={replay}
                    />
                    <button
                      className="choose-button"
                      aria-pressed={selected?.value === v}
                      onClick={() =>
                        update({
                          ...p,
                          choices: {
                            ...p.choices,
                            [dimension]: {
                              value: v,
                              reason: selected?.reason || "",
                            },
                          },
                        })
                      }
                    >
                      {selected?.value === v ? (
                        <Check size={17} />
                      ) : (
                        <Circle size={17} />
                      )}
                      {zh
                        ? `更喜欢 ${v.toUpperCase()} · ${tr(def[v], locale)}`
                        : `Prefer ${v.toUpperCase()} · ${tr(def[v], locale)}`}
                    </button>
                  </section>
                ))}
              </div>
              <div className="comparison-bottom">
                <button
                  className={`neither-button ${selected?.value === "neither" ? "selected" : ""}`}
                  aria-pressed={selected?.value === "neither"}
                  onClick={() =>
                    update({
                      ...p,
                      choices: {
                        ...p.choices,
                        [dimension]: {
                          value: "neither",
                          reason: selected?.reason || "",
                        },
                      },
                    })
                  }
                >
                  {zh ? "都不是我想要的" : "Neither feels right"}
                </button>
                <span>
                  {zh
                    ? "只代表当前项目，不是给你的审美贴标签。"
                    : "A preference for this project, not a label for your taste."}
                </span>
                {selected && (
                  <button
                    className="text-button"
                    onClick={() => {
                      const choices = { ...p.choices };
                      delete choices[dimension];
                      update({ ...p, choices });
                    }}
                  >
                    {zh ? "撤销选择" : "Clear choice"}
                  </button>
                )}
              </div>
              {selected && (
                <div className="choice-reason">
                  <label htmlFor="reason">
                    {zh ? "哪一点打动了你？" : "What made the difference?"}{" "}
                    <span>
                      {zh
                        ? "可选，用自己的话说"
                        : "Optional. In your own words."}
                    </span>
                  </label>
                  <input
                    id="reason"
                    value={selected.reason}
                    maxLength={2000}
                    placeholder={
                      zh
                        ? "例如：有层次，但不会抢走内容的注意力。"
                        : "For example: it has depth, without distracting from the content."
                    }
                    onChange={(e) =>
                      update({
                        ...p,
                        choices: {
                          ...p.choices,
                          [dimension]: { ...selected, reason: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              )}
              <div className="step-footer">
                <div className="choice-progress">
                  <span>{Object.keys(p.choices).length}</span> / 5{" "}
                  {zh ? "个方面已有想法" : "dimensions explored"}
                </div>
                <div>
                  <button
                    className="text-button"
                    onClick={() => {
                      if (dimensions.indexOf(dimension) < 4)
                        setDimension(
                          dimensions[dimensions.indexOf(dimension) + 1],
                        );
                      else goto("references");
                    }}
                  >
                    {zh ? "暂时跳过" : "Skip for now"}
                  </button>
                  <button
                    className="primary"
                    onClick={() => {
                      if (dimensions.indexOf(dimension) < 4) {
                        setDimension(
                          dimensions[dimensions.indexOf(dimension) + 1],
                        );
                        setReplay(0);
                      } else goto("references");
                    }}
                  >
                    {dimensions.indexOf(dimension) < 4
                      ? zh
                        ? "看下一个差别"
                        : "Next comparison"
                      : zh
                        ? "加入我的参考"
                        : "Add my references"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
          {step === "references" && (
            <References
              key={p.id}
              project={p}
              update={update}
              locale={locale}
              notify={notify}
              onNext={() => goto("brief")}
            />
          )}
          {step === "brief" && (
            <Handoff
              project={p}
              update={update}
              locale={locale}
              notify={notify}
              onReview={() => goto("review")}
            />
          )}
          {step === "review" && (
            <Review
              key={p.id}
              project={p}
              update={update}
              locale={locale}
              notify={notify}
            />
          )}
        </main>
      </div>
      <input
        ref={importRef}
        type="file"
        accept=".zip,.json"
        hidden
        onChange={(e) => void importFile(e.target.files?.[0])}
        aria-label={zh ? "导入项目备份" : "Import project backup"}
      />
      {toast && (
        <div
          className={`toast ${toast.error ? "error" : ""}`}
          role={toast.error ? "alert" : "status"}
        >
          {toast.error ? <CircleHelp size={17} /> : <Check size={17} />}
          <span>{toast.text}</span>
          <button
            aria-label={zh ? "关闭提示" : "Dismiss"}
            onClick={() => setToast(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {dialog === "projects" && (
        <Dialog
          title={zh ? "你的项目" : "Your projects"}
          close={() => setDialog(null)}
        >
          <div className="project-list">
            {projects.map((item) => (
              <button
                className={item.id === p.id ? "active" : ""}
                key={item.id}
                onClick={() => {
                  setActiveId(item.id);
                  setDialog(null);
                }}
              >
                <FolderOpen size={18} />
                <span>
                  {item.name}
                  <small>
                    {rulesFor(item, locale).length}{" "}
                    {zh ? "条要求" : "requirements"} · {item.references.length}{" "}
                    {zh ? "份参考" : "references"}
                  </small>
                </span>
                {item.id === p.id && <Check size={16} />}
              </button>
            ))}
          </div>
          <button className="text-button" onClick={() => setDialog("settings")}>
            <Settings2 size={16} />
            {zh ? "编辑当前项目" : "Edit current project"}
          </button>
          <form className="new-project" onSubmit={create}>
            <label>
              {zh ? "开启一个新项目" : "Start a new project"}
              <input
                value={newName}
                maxLength={120}
                placeholder={zh ? "项目名称" : "Project name"}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <button className="primary" type="submit">
              <Plus size={16} />
              {zh ? "创建" : "Create"}
            </button>
          </form>
          <button
            className="text-button"
            onClick={() => importRef.current?.click()}
            disabled={importing}
          >
            <ArrowDownToLine size={16} />
            {importing
              ? zh
                ? "导入中…"
                : "Importing…"
              : zh
                ? "导入已有交接包 / 备份"
                : "Import an existing bundle / backup"}
          </button>
        </Dialog>
      )}
      {dialog === "settings" && (
        <Dialog
          title={zh ? "这次，你在做什么？" : "What are you making?"}
          close={() => setDialog(null)}
        >
          <label>
            {zh ? "项目名称" : "Project name"}
            <input
              maxLength={120}
              value={p.name}
              onChange={(e) =>
                update({
                  ...p,
                  name: e.target.value || (zh ? "未命名项目" : "Untitled"),
                })
              }
            />
          </label>
          <label>
            {zh
              ? "希望它带给用户什么感觉？"
              : "What should it feel like to use?"}
            <textarea
              rows={4}
              maxLength={4000}
              value={p.goal}
              placeholder={
                zh
                  ? "例如：一个英语卡片应用。像把玩值得珍藏的卡片，轻盈、有仪式感，但阅读时安静。"
                  : "For example: a language app that feels like handling a treasured card collection. Light and tactile, but quiet while reading."
              }
              onChange={(e) => update({ ...p, goal: e.target.value })}
            />
          </label>
          <label>
            {zh ? "主要在哪里使用？" : "Where will people use it?"}
            <select
              value={p.platform}
              onChange={(e) =>
                update({
                  ...p,
                  platform: e.target.value as Project["platform"],
                })
              }
            >
              <option value="mobile">{zh ? "手机优先" : "Mobile-first"}</option>
              <option value="web">{zh ? "桌面网页" : "Desktop web"}</option>
              <option value="both">
                {zh ? "手机与桌面" : "Mobile and desktop"}
              </option>
            </select>
          </label>
          <div className="dialog-actions">
            <button
              className="text-button danger"
              onClick={() => setDialog("delete")}
            >
              <Trash2 size={15} />
              {zh ? "删除项目" : "Delete project"}
            </button>
            <button className="primary" onClick={() => setDialog(null)}>
              {zh ? "完成" : "Done"}
              <Check size={16} />
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "delete" && (
        <Dialog
          title={zh ? "删除这个项目？" : "Delete this project?"}
          close={() => setDialog(null)}
        >
          <p>
            {zh
              ? "本机的项目、参考与核对记录会被移除。建议先在“交给 AI”下载备份。"
              : "This project, its references, and reviews will be removed from this browser. Export a backup first if needed."}
          </p>
          <div className="dialog-actions">
            <button className="secondary" onClick={() => setDialog(null)}>
              {zh ? "取消" : "Cancel"}
            </button>
            <button
              className="primary destructive"
              onClick={() => void deleteCurrent()}
            >
              {zh ? "确认删除" : "Delete project"}
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "help" && (
        <Dialog
          title={zh ? "让 AI 理解你的“好看”" : "Make your taste tangible"}
          close={() => setDialog(null)}
        >
          <div className="help-content">
            <p>
              {zh
                ? "先看差别，再指出细节，最后把有依据的要求交给 AI。你不需要知道设计术语。"
                : "Compare, point out the details, then hand clear requirements to your AI. No design vocabulary needed."}
            </p>
            <ol>
              <li>
                {zh
                  ? "看差别：同内容只改一个方面；可以都不选。"
                  : "Compare: one difference at a time. Neither is a valid answer."}
              </li>
              <li>
                {zh
                  ? "标记参考：上传截图或短视频，说清借鉴、保留或避免什么。"
                  : "References: upload images or clips and specify what to borrow, keep, or avoid."}
              </li>
              <li>
                {zh
                  ? "交给 AI：下载含原图的交接包，或复制简报。"
                  : "AI brief: export a bundle with original assets, or copy the brief."}
              </li>
              <li>
                {zh
                  ? "核对新稿：逐条判断是否落实，再把反馈给 AI。"
                  : "Review: check each requirement against the result, then send feedback."}
              </li>
            </ol>
            <p>
              {zh
                ? "同频不调用模型，不自动识图，也不保证 AI 一次做对。它把模糊意见变成可追溯、可核对的设计输入。"
                : "Taste Align does not call a model or analyze images automatically. It makes your input explicit and reviewable; it does not guarantee a perfect first generation."}
            </p>
            <p className="help-privacy">
              {zh
                ? "文件仅保存在当前浏览器。清理浏览器或更换设备不会自动迁移；请定期导出备份。导出前确认参考图没有你不想分享的个人内容。"
                : "Files stay in this browser. Clearing browser data or changing devices does not migrate them. Export backups regularly and check references before sharing."}
            </p>
            <a
              href="https://github.com/Easin-yx/taste-align"
              target="_blank"
              rel="noreferrer"
            >
              GitHub · MIT License <ArrowRight size={14} />
            </a>
          </div>
        </Dialog>
      )}
    </div>
  );
}
