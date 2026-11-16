import paperCourt from "./paper-court.webp?inline";
import type { Locale } from "./model";

// Row-major map order: vertical detail increases; horizontal structure softens.
export const directionIds = ["editorial", "gallery", "studio", "journal"] as const;
export const paletteIds = ["original", "warm", "cool"] as const;
export type DirectionId = (typeof directionIds)[number];
export type PaletteId = (typeof paletteIds)[number];

type Copy = Record<Locale, string>;
type Colors = [paper: string, ink: string, accent: string, onAccent: string, tint: string];

const directions: Record<DirectionId, {
  label: Copy;
  recipe: Copy;
  colors: Record<PaletteId, Colors>;
}> = {
  editorial: {
    label: { en: "Editorial", zh: "编辑版式" },
    recipe: {
      en: "Set the 48px serif title flush left above a square-cut plate. Use a fine masthead rule, one accent for the gallery label and a solid, straight-edged audio bar.",
      zh: "48px 衬线标题靠左，置于直角图版上方。页眉用细线收边，展厅名与下方直角音频条共用强调色。",
    },
    colors: {
      original: ["#faf8f1", "#232522", "#8f3829", "#ffffff", "#e6dfcc"],
      warm: ["#ffeed6", "#35241b", "#873810", "#fff6e5", "#e9cba6"],
      cool: ["#edf4fa", "#192b3d", "#294d82", "#f7fbff", "#cbddeb"],
    },
  },
  gallery: {
    label: { en: "Quiet gallery", zh: "静谧展厅" },
    recipe: {
      en: "Lead with the softly rounded plate. Center the stop label, 38px sans-serif title and wall text beneath it. Leave air around the compact pill-shaped audio control.",
      zh: "先展示圆角图版，下方依次居中排站点信息、38px 无衬线标题与展签说明。胶囊形音频控件两侧留白。",
    },
    colors: {
      original: ["#e9f0e7", "#223b31", "#2d5144", "#f7fcf5", "#d2e1d5"],
      warm: ["#f7e7dc", "#492d29", "#77453c", "#fff8f1", "#efcfc2"],
      cool: ["#e9eaf6", "#30324f", "#494875", "#fafaff", "#d7d8ed"],
    },
  },
  studio: {
    label: { en: "Studio index", zh: "工作室图录" },
    recipe: {
      en: "Use a dark field, a 43px heavy sans-serif title and monospaced labels. Align the plate and split index strip edge to edge. Repeat the high-contrast accent in the registration marks and square playback tile.",
      zh: "深色底配 43px 粗无衬线标题与等宽标签。图版和分栏索引上下对齐。制版标记与方形播放键共用高对比强调色。",
    },
    colors: {
      original: ["#1a2b31", "#eff4ec", "#d8e89b", "#17262a", "#30444a"],
      warm: ["#382421", "#fff2e4", "#ffba89", "#37201b", "#52362f"],
      cool: ["#20263c", "#edf1ff", "#accef8", "#1e273e", "#323b56"],
    },
  },
  journal: {
    label: { en: "Field journal", zh: "随展手记" },
    recipe: {
      en: "Use a tinted notebook edge and fine paper ruling. Mount the plate with two photo corners, then set the 40px italic serif title and caption like a field note. Finish with a circular play mark and dotted leaders.",
      zh: "页边用浅色书脊和细横线。用两个相角固定图版，下方以 40px 斜体衬线标题搭配手记式说明。底部以圆形播放标记和点线连接时长。",
    },
    colors: {
      original: ["#f7eeda", "#413528", "#725034", "#fff7e9", "#e2ceac"],
      warm: ["#fae8dd", "#4b302d", "#884739", "#fff6ec", "#e9c8b7"],
      cool: ["#e8f1ec", "#233e3c", "#376564", "#f4fcfa", "#c1d9cf"],
    },
  },
};

const paletteNames: Record<PaletteId, Copy> = {
  original: { en: "Original", zh: "原配色" },
  warm: { en: "Warm", zh: "暖调" },
  cool: { en: "Cool", zh: "冷调" },
};

export function directionLabel(id: DirectionId, locale: Locale): string {
  return directions[id].label[locale];
}

export function paletteLabel(id: PaletteId, locale: Locale): string {
  return paletteNames[id][locale];
}

export function recipeText(direction: DirectionId, palette: PaletteId, locale: Locale): string {
  const [paper, ink, accent, onAccent, tint] = directions[direction].colors[palette];
  const roles = locale === "zh"
    ? `底色 ${paper}，正文 ${ink}，强调色 ${accent}，强调色上的前景 ${onAccent}，辅助底色 ${tint}。`
    : `Use ${paper} for the page, ${ink} for type, ${accent} for emphasis, ${onAccent} for marks on that accent and ${tint} for the secondary surface.`;
  const format = locale === "zh"
    ? "画面为 320 × 420px，图版为 280 × 146px，保留原图取景。"
    : "Keep the 320 × 420px page and the original 280 × 146px plate framing.";
  return [directionLabel(direction, locale), paletteLabel(palette, locale)].join(" · ")
    + "\n" + [directions[direction].recipe[locale], roles, format].join(" ");
}

const commonCSS = `
* { box-sizing: border-box }
html, body { margin: 0; padding: 0 }
body {
  width: 320px; height: 420px; background: var(--paper); color: var(--ink);
  font-family: "Helvetica Neue", Arial, sans-serif;
  -webkit-text-size-adjust: 100%; text-size-adjust: 100%;
}
main {
  position: relative; isolation: isolate; width: 100%; height: 100%; padding: 13px 20px 16px;
  display: flex; flex-direction: column; justify-content: space-between;
}
header, .museum, .meta, .player { display: flex; align-items: center }
header { min-height: 25px; justify-content: space-between; font-size: 12px }
.museum { gap: 7px; font-size: 15px; font-weight: 650; letter-spacing: -.55px }
.mark { display: flex; gap: 2px; align-items: flex-end; height: 16px; transform: skewY(-12deg) }
.mark i { width: 4px; height: 100%; background: currentColor }
.mark i:nth-child(2) { height: 75% }
.mark i:nth-child(3) { height: 52% }
h1, p, figure { margin: 0 }
h1 { font-weight: 400 }
.meta { justify-content: space-between; font-size: 12px }
.plate, .plate img { width: 280px; height: 146px; display: block }
.plate { position: relative }
p { font-size: 15px; line-height: 1.37 }
.player { min-height: 44px; gap: 10px; font-size: 14px; font-weight: 600 }
.play { display: grid; place-items: center; flex-shrink: 0 }
.play::after { content: ""; border: 5px solid transparent; border-right: 0; border-left: 8px solid currentColor }
.time { margin-left: auto; font-size: 12px; font-variant-numeric: tabular-nums }
`;

const directionCSS: Record<DirectionId, string> = {
  editorial: `
header { padding-bottom: 8px; border-bottom: 1px solid var(--ink) }
.meta { font-size: 11px; font-weight: 650; letter-spacing: 1px; text-transform: uppercase }
.meta span:first-child { color: var(--accent) }
h1 { font: 48px/.99 Georgia, serif; letter-spacing: -2.8px; margin-top: 3px }
p { max-width: 270px }
.player { padding: 0 15px; color: var(--on); background: var(--accent) }
.time { padding-left: 12px; border-left: 1px solid currentColor }
`,
  gallery: `
header { color: var(--accent) }
.mark { padding: 2px; border-radius: 4px; background: var(--tint) }
.plate img { border-radius: 23px }
.details { text-align: center }
.meta { justify-content: center; gap: 8px; color: var(--accent) }
.meta span + span::before { content: "·"; margin-right: 8px }
h1 { margin-top: 5px; font-size: 38px; line-height: 1.08; letter-spacing: -1.9px }
p { text-align: center; padding: 0 5px }
.player { align-self: center; border-radius: 50px; padding: 0 18px; background: var(--accent); color: var(--on) }
.time { padding-left: 10px; border-left: 1px solid currentColor }
`,
  studio: `
main { background: linear-gradient(to right, transparent 19px, var(--tint) 19px 20px, transparent 20px 300px, var(--tint) 300px 301px, transparent 301px) }
header { border-bottom: 1px solid var(--accent); padding-bottom: 7px }
.guide, .meta, .time { font: 11px/1.3 "SFMono-Regular", Consolas, monospace; text-transform: uppercase; letter-spacing: .6px }
.mark, .guide { color: var(--accent) }
h1 { font-size: 43px; line-height: 1; font-weight: 750; letter-spacing: -2.5px; text-transform: uppercase }
.plate::before, .plate::after { content: ""; position: absolute; width: 10px; height: 10px; border: solid var(--accent) }
.plate::before { top: -4px; left: -4px; border-width: 1px 0 0 1px }
.plate::after { bottom: -4px; right: -4px; border-width: 0 1px 1px 0 }
.meta { align-items: stretch; background: var(--tint); border-bottom: 1px solid var(--accent) }
.meta span { padding: 7px 9px }
.meta span + span { border-left: 1px solid var(--paper) }
p { padding-right: 5px }
.player { padding-right: 12px; background: var(--tint); gap: 12px }
.play { width: 44px; height: 44px; background: var(--accent); color: var(--on) }
.time { color: var(--accent) }
`,
  journal: `
main { background: linear-gradient(to right, var(--tint) 0 6px, transparent 6px 8px, var(--tint) 8px 9px, transparent 9px) }
header { border-bottom: 3px double var(--accent); padding-bottom: 7px }
.museum { font: bold 17px/1 Georgia, serif }
.guide { font: italic 14px Georgia, serif }
.plate { box-shadow: 0 0 0 4px var(--on), 1px 3px 6px #34281f40 }
.plate::before, .plate::after { content: ""; position: absolute; width: 16px; height: 16px; background: var(--accent); clip-path: polygon(0 0, 100% 0, 0 100%) }
.plate::before { left: -4px; top: -4px }
.plate::after { right: -4px; bottom: -4px; transform: rotate(180deg) }
.meta { color: var(--accent); font: italic 14px/1.25 Georgia, serif }
.meta span:first-child { border-bottom: 1px dotted currentColor }
h1 { margin-top: 4px; font: italic 40px/1 Georgia, serif; letter-spacing: -1.8px }
p { font: 16px/21px Georgia, serif; background: repeating-linear-gradient(transparent 0 20px, var(--tint) 20px 21px) }
.player { border-top: 1px solid var(--accent); padding-top: 4px; font: bold 15px Georgia, serif }
.play { width: 32px; height: 32px; color: var(--on); background: var(--accent); border-radius: 50% }
.player::after { content: ""; order: 1; flex: 1; border-bottom: 2px dotted var(--tint) }
.time { order: 2; font: italic 14px Georgia, serif; color: var(--accent) }
`,
};

const header = `<header><span class="museum"><span class="mark" aria-hidden="true"><i></i><i></i><i></i></span>Form Museum</span><span class="guide">Exhibition guide</span></header>`;
const meta = '<div class="meta"><span>Gallery 02</span><span>Stop 03 / 08</span></div>';
const title = "<h1>Paper Court</h1>";
const details = `<div class="details">${meta}${title}</div>`;
const plate = `<figure class="plate"><img width="280" height="146" alt="A terracotta paper arcade with three arches, a sandstone stair and two taller portals behind it." src="${paperCourt}"></figure>`;
const description = "<p>Three paper arcades cast a changing pattern of light across the steps.</p>";
const player = '<footer class="player"><span class="play" aria-hidden="true"></span><span>Listen to guide</span><span class="time">04:12</span></footer>';

// The order here is also the reading order inside each standalone document.
const middle: Record<DirectionId, string> = {
  editorial: details + plate,
  gallery: plate + details,
  studio: title + '<div class="index">' + plate + meta + '</div>',
  journal: plate + details,
};

export function sampleHTML(direction: DirectionId, palette: PaletteId): string {
  const [paper, ink, accent, onAccent, tint] = directions[direction].colors[palette];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Paper Court · Form Museum</title>
<style>:root { --paper: ${paper}; --ink: ${ink}; --accent: ${accent}; --on: ${onAccent}; --tint: ${tint} }
${commonCSS}${directionCSS[direction]}</style></head>
<body><main>${header}${middle[direction]}${description}${player}</main></body></html>`;
}
