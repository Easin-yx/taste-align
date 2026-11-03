import { z } from "zod";

export type Locale = "zh" | "en";
export type Dimension = "material" | "color" | "space" | "shape" | "motion";
export type Intent = "like" | "avoid" | "keep";
export type Aspect =
  "overall" | "color" | "material" | "layout" | "type" | "motion";
export const dimensions: Dimension[] = [
  "material",
  "color",
  "space",
  "shape",
  "motion",
];
export const aspects: Aspect[] = [
  "overall",
  "color",
  "material",
  "layout",
  "type",
  "motion",
];
export const uid = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id-${Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("")}`;
const finite = z.number().finite();
const assetSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
    name: z.string().max(300),
    type: z.enum([
      "image/png",
      "image/jpeg",
      "image/webp",
      "video/mp4",
      "video/webm",
    ]),
    data: z.string().max(44_000_000),
    width: finite.min(1).max(30000),
    height: finite.min(1).max(30000),
    source: z.string().max(2000).default(""),
  })
  .superRefine((a, ctx) => {
    if (
      !a.data.startsWith(`data:${a.type};base64,`) ||
      !/^[A-Za-z0-9+/]*={0,2}$/.test(a.data.split(",")[1] ?? "!")
    )
      ctx.addIssue({ code: "custom", message: "Invalid asset data" });
  });
export type Asset = z.infer<typeof assetSchema>;
const choiceSchema = z.object({
  value: z.enum(["a", "b", "neither"]),
  reason: z.string().max(2000),
});
const noteSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  assetId: z.string().max(100),
  intent: z.enum(["like", "avoid", "keep"]),
  aspect: z.enum(aspects),
  text: z.string().min(1).max(3000),
  x: finite.min(0).max(1).optional(),
  y: finite.min(0).max(1).optional(),
  time: finite.min(0).optional(),
  frame: z
    .string()
    .max(6_000_000)
    .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/)
    .optional(),
});
export type Note = z.infer<typeof noteSchema>;
export const projectSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(120),
  goal: z.string().max(4000),
  platform: z.enum(["mobile", "web", "both"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  choices: z.object({
    material: choiceSchema.optional(),
    color: choiceSchema.optional(),
    space: choiceSchema.optional(),
    shape: choiceSchema.optional(),
    motion: choiceSchema.optional(),
  }),
  references: z.array(assetSchema).max(12),
  notes: z.array(noteSchema).max(120),
  directives: z.string().max(10000),
  result: assetSchema.optional(),
  reviews: z.record(
    z.string(),
    z.object({
      state: z.enum(["pass", "change"]),
      comment: z.string().max(3000),
      fingerprint: z.string().max(50000),
    }),
  ),
});
export type Project = z.infer<typeof projectSchema>;
export type ProjectUpdate = Project | ((current: Project) => Project);
export function newProject(locale: Locale = "zh"): Project {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: uid(),
    name: locale === "zh" ? "我的第一个项目" : "My first project",
    goal: "",
    platform: "mobile",
    createdAt: now,
    updatedAt: now,
    choices: {},
    references: [],
    notes: [],
    directives: "",
    reviews: {},
  };
}
export const dimensionCopy: Record<
  Dimension,
  {
    title: [string, string];
    question: [string, string];
    a: [string, string];
    b: [string, string];
    ruleA: [string, string];
    ruleB: [string, string];
  }
> = {
  material: {
    title: ["材质", "Material"],
    question: ["你更想触碰哪一种？", "Which would you rather touch?"],
    a: ["安静的实色", "Quiet & solid"],
    b: ["透光的磨砂", "Frosted & translucent"],
    ruleA: [
      "内容面使用清晰实色，少用透明叠层，让层次来自间距与轻投影。",
      "Use opaque surfaces. Create depth through spacing and restrained shadows, with little transparency.",
    ],
    ruleB: [
      "关键内容面使用克制的磨砂透光感；背景可隐约透出，文字始终清晰。",
      "Use restrained frosted surfaces on key content. Let the background show softly while keeping text legible.",
    ],
  },
  color: {
    title: ["色温", "Color"],
    question: [
      "哪一种气氛更接近你的产品？",
      "Which atmosphere fits your product?",
    ],
    a: ["清凉的青绿", "Cool teal"],
    b: ["温暖的陶杏", "Warm apricot"],
    ruleA: [
      "倾向冷青绿色点缀与偏冷的中性底色，避免整页高饱和色铺满。",
      "Prefer cool teal accents and cool neutrals; avoid saturating the whole page.",
    ],
    ruleB: [
      "倾向温暖陶杏色点缀与暖中性底色，保持文字对比。",
      "Prefer warm apricot accents and warm neutrals, retaining strong text contrast.",
    ],
  },
  space: {
    title: ["疏密", "Density"],
    question: ["你喜欢怎样的呼吸空间？", "How much room should it breathe?"],
    a: ["舒展地阅读", "Room to breathe"],
    b: ["紧凑地浏览", "More at a glance"],
    ruleA: [
      "内容组之间留出明显呼吸空间，一屏聚焦少量信息；不靠放大所有字体实现。",
      "Allow generous space between content groups. Focus each view without enlarging all text.",
    ],
    ruleB: [
      "以紧凑但清晰的间距呈现更多信息；保留正文可读性和至少44px触控区域。",
      "Show more information with tighter spacing; preserve legibility and at least 44px touch targets.",
    ],
  },
  shape: {
    title: ["轮廓", "Shape"],
    question: ["哪一种轮廓更合你的心意？", "Which silhouette feels right?"],
    a: ["利落而克制", "Crisp & precise"],
    b: ["圆润而亲和", "Soft & rounded"],
    ruleA: [
      "采用克制的小圆角和清晰边缘；避免所有控件都胶囊化。",
      "Use restrained small radii and precise edges; avoid turning every control into a pill.",
    ],
    ruleB: [
      "主要容器采用更柔和的圆角，控件延续同一曲率语言；避免圆角层层嵌套。",
      "Use softer radii on primary surfaces, with consistent curvature; avoid nesting excessive rounded boxes.",
    ],
  },
  motion: {
    title: ["动作", "Motion"],
    question: ["试着拿起它，哪种手感更对？", "Pick it up. Which feels right?"],
    a: ["轻快地响应", "Quick & direct"],
    b: ["舒缓地浮起", "Soft & floating"],
    ruleA: [
      "操作反馈短而明确，示例为180ms减速位移；不加入夸张弹跳或拖延操作。",
      "Keep feedback short and direct. The sample uses a 180ms ease-out move, without exaggerated bounce or blocking.",
    ],
    ruleB: [
      "卡片拿起与归位有连续的空间变化，示例为580ms柔和减速；输入和按钮反馈仍即时。",
      "Use continuous spatial lift and settle, as in the 580ms soft ease-out sample; keep typing and button feedback immediate.",
    ],
  },
};
export function tr(pair: [string, string], locale: Locale) {
  return pair[locale === "zh" ? 0 : 1];
}
export type Rule = {
  id: string;
  title: string;
  text: string;
  reason: string;
  kind: "choice" | Intent | "direct";
  assetId?: string;
  note?: Note;
  dimension?: Dimension;
};
export function rulesFor(p: Project, locale: Locale): Rule[] {
  const rules: Rule[] = dimensions.flatMap((d) => {
    const c = p.choices[d];
    if (!c) return [];
    const def = dimensionCopy[d];
    return [
      {
        id: `choice-${d}`,
        title: tr(def.title, locale),
        text:
          c.value === "neither"
            ? locale === "zh"
              ? `避免直接采用这组${tr(def.title, locale)}示例的 A 或 B，替代方案仍待确认。`
              : `Do not use either ${tr(def.title, locale).toLowerCase()} sample as-is. The alternative remains open.`
            : tr(c.value === "a" ? def.ruleA : def.ruleB, locale),
        reason: c.reason,
        kind: c.value === "neither" ? ("avoid" as const) : ("choice" as const),
        dimension: d,
      },
    ];
  });
  for (const n of p.notes)
    if (p.references.some((a) => a.id === n.assetId))
      rules.push({
        id: n.id,
        title: {
          like: locale === "zh" ? "参考这一点" : "Take inspiration",
          keep: locale === "zh" ? "必须保留" : "Must preserve",
          avoid: locale === "zh" ? "避免这一点" : "Avoid this",
        }[n.intent],
        text: n.text,
        reason: "",
        kind: n.intent,
        assetId: n.assetId,
        note: n,
      });
  p.directives
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((text, i) =>
      rules.push({
        id: `direct-${i}-${hash(text)}`,
        title: locale === "zh" ? "补充要求" : "Direct requirement",
        text,
        reason: "",
        kind: "direct",
      }),
    );
  return rules;
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
export function reviewFingerprint(p: Project, rule: Rule) {
  const note = rule.note
    ? {
        id: rule.note.id,
        assetId: rule.note.assetId,
        intent: rule.note.intent,
        aspect: rule.note.aspect,
        text: rule.note.text,
        x: rule.note.x,
        y: rule.note.y,
        time: rule.note.time,
      }
    : undefined;
  return JSON.stringify([
    p.result?.id,
    p.goal,
    p.platform,
    rule.id,
    rule.dimension ? p.choices[rule.dimension] : note || rule.text,
  ]);
}
export function currentReview(p: Project, r: Rule) {
  const v = p.reviews[r.id];
  return v?.fingerprint === reviewFingerprint(p, r) ? v : undefined;
}
export function validateProject(data: unknown): Project {
  const p = projectSchema.parse(data);
  const ids = p.references.map((a) => a.id);
  if (
    new Set(ids).size !== ids.length ||
    new Set(p.notes.map((n) => n.id)).size !== p.notes.length
  )
    throw new Error("Duplicate IDs");
  if (p.notes.some((n) => !ids.includes(n.assetId)))
    throw new Error("Missing reference");
  if (p.result && ids.includes(p.result.id))
    throw new Error("Result and reference IDs must differ");
  if (
    p.notes.some(
      (n) => n.id.startsWith("choice-") || n.id.startsWith("direct-"),
    )
  )
    throw new Error("Reserved rule ID");
  if (
    p.references.reduce(
      (n, a) => n + a.data.length,
      p.result?.data.length || 0,
    ) +
      p.notes.reduce((n, a) => n + (a.frame?.length || 0), 0) >
    100_000_000
  )
    throw new Error("Project exceeds 75 MB");
  return p;
}
