import { useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Expand } from "lucide-react";
import {
  directionIds,
  paletteIds,
  directionLabel,
  paletteLabel,
} from "../core/directions";
import type { Project, Locale } from "../core/model";
import "./direction-studio.css";
import { sampleImage } from "../core/sample-image";

type Scheme = NonNullable<Project["scheme"]>;
type Direction = Scheme["direction"];
type Palette = Scheme["palette"];

export function SampleView({
  direction,
  palette,
  locale,
}: {
  direction: Direction;
  palette: Palette;
  locale: Locale;
}) {
  return (
    <img
      className="scheme-print"
      src={sampleImage(direction, palette)}
      width={320}
      height={420}
      alt={
        directionLabel(direction, locale) +
        " · " +
        paletteLabel(palette, locale)
      }
    />
  );
}

export function DirectionStudio({
  project,
  locale,
  commit,
  handoff,
}: {
  project: Project;
  locale: Locale;
  commit: (scheme?: Scheme) => void;
  handoff: () => void;
}) {
  const zh = locale === "zh";
  const saved = project.scheme;
  const [stage, setStage] = useState<"board" | "palette" | "confirm">("board");
  const [direction, setDirection] = useState<Direction>(
    saved?.direction ?? directionIds[0],
  );
  const [palette, setPalette] = useState<Palette>(saved?.palette ?? "original");
  const heading = useRef<HTMLHeadingElement>(null);
  const initialStage = useRef(stage);
  useLayoutEffect(() => {
    if (initialStage.current !== stage) {
      initialStage.current = stage;
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "nearest" });
    }
  }, [stage]);
  function inspect(id: Direction) {
    setDirection(id);
    setPalette(saved?.direction === id ? saved.palette : "original");
    setStage("palette");
  }
  const title =
    stage === "board"
      ? zh
        ? "哪一页更接近你想要的感觉？"
        : "Which page feels closest?"
      : stage === "palette"
        ? zh
          ? "哪组颜色让你想留下这页？"
          : "Which palette would you keep?"
        : zh
          ? "把这一版交给 AI？"
          : "Hand this version to your AI?";
  return (
    <section className="direction-studio">
      <header className="section-heading">
        <div>
          <h1 ref={heading} tabIndex={-1}>
            {title}
          </h1>
          <p>
            {stage === "board"
              ? zh
                ? "同一个手机展览导览页，四种设计。点开看大图。"
                : "One mobile exhibition guide, four designs. Open one for a closer look."
              : stage === "palette"
                ? zh
                  ? "切换整页配色，留意图片、文字和按钮放在一起的感觉。"
                  : "Try each palette with the artwork, type and button together."
                : zh
                  ? "确认后，交接包会附上眼前的样稿和配色。动效和其他页面仍可自由设计。"
                  : "Your handoff will include this sample and its palette. Motion and other screens remain open."}
          </p>
        </div>
      </header>
      {stage === "board" ? (
        <>
          <div className="scheme-map">
            <div className="map-columns">
              <span>{zh ? "规整" : "Structured"}</span>
              <span>{zh ? "柔和" : "Soft"}</span>
            </div>
            {[0, 1].map((row) => (
              <div className="map-row" key={row}>
                <span className="map-row-name">
                  {row
                    ? zh
                      ? "细节丰富"
                      : "Rich detail"
                    : zh
                      ? "细节简练"
                      : "Spare detail"}
                </span>
                {directionIds.slice(row * 2, row * 2 + 2).map((id) => (
                  <div className="scheme-tile" key={id}>
                    <SampleView
                      direction={id}
                      palette="original"
                      locale={locale}
                    />
                    <div className="tile-caption">
                      <b>{directionLabel(id, locale)}</b>
                      <Expand size={14} />
                    </div>
                    <button
                      type="button"
                      aria-label={
                        (zh ? "查看方向 · " : "View direction · ") +
                        directionLabel(id, locale)
                      }
                      onClick={() => inspect(id)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="scheme-actions">
            {saved && (
              <>
                <span>
                  {zh ? "已确认" : "Confirmed"} ·{" "}
                  {directionLabel(saved.direction, locale)} /{" "}
                  {paletteLabel(saved.palette, locale)}
                </span>
                <button className="secondary" onClick={handoff}>
                  {zh ? "打开交接包" : "Open handoff"}
                  <ArrowRight size={16} />
                </button>
                <button
                  className="text-button"
                  onClick={() => commit(undefined)}
                >
                  {zh ? "撤销这个方向" : "Clear direction"}
                </button>
              </>
            )}
            {!saved && (
              <button className="text-button" onClick={handoff}>
                {zh ? "暂不选方向" : "Skip direction"}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="scheme-inspector">
          <div className="scheme-proof">
            <SampleView
              direction={direction}
              palette={palette}
              locale={locale}
            />
          </div>
          <div className="scheme-controls">
            <h2>{directionLabel(direction, locale)}</h2>
            {stage === "palette" ? (
              <div
                className="palette-options"
                role="group"
                aria-label={zh ? "整页配色" : "Page palettes"}
              >
                {paletteIds.map((id) => (
                  <button
                    key={id}
                    aria-pressed={palette === id}
                    onClick={() => setPalette(id)}
                  >
                    {paletteLabel(id, locale)}
                    {palette === id && <Check size={16} />}
                  </button>
                ))}
              </div>
            ) : (
              <p>
                {paletteLabel(palette, locale)} ·{" "}
                {zh ? "手机展览导览页" : "Mobile exhibition guide"}
              </p>
            )}
            <button
              className="primary"
              onClick={() => {
                if (stage === "palette") setStage("confirm");
                else {
                  commit({ version: 1, direction, palette });
                  handoff();
                }
              }}
            >
              {stage === "palette"
                ? zh
                  ? "用这组配色预览"
                  : "Preview this combination"
                : zh
                  ? "确认并查看交接包"
                  : "Confirm and open handoff"}
              <ArrowRight size={16} />
            </button>
            <button
              className="text-button"
              onClick={() =>
                setStage(stage === "confirm" ? "palette" : "board")
              }
            >
              <ArrowLeft size={15} />
              {stage === "confirm"
                ? zh
                  ? "返回配色"
                  : "Back to palettes"
                : zh
                  ? "比较其他方向"
                  : "Compare other directions"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
