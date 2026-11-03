import { useEffect, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import type { Dimension, Locale, Project } from "../core/model";

export function Specimen({
  dimension,
  variant,
  project,
  locale,
  replay,
}: {
  dimension: Dimension;
  variant: "a" | "b";
  project: Project;
  locale: Locale;
  replay: number;
}) {
  const [lifted, setLifted] = useState(false);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if (!replay) return;
    setManual(true);
    setLifted(true);
    const timer = setTimeout(() => setLifted(false), 1000);
    return () => clearTimeout(timer);
  }, [replay]);
  const value = (d: Dimension) =>
    d === dimension ? variant : project.choices[d]?.value === "b" ? "b" : "a";
  const zh = locale === "zh";
  return (
    <div
      className={`specimen material-${value("material")} color-${value("color")} space-${value("space")} shape-${value("shape")} motion-${value("motion")} ${lifted ? "is-lifted" : ""} ${manual ? "manual-motion" : ""}`}
    >
      <div className="specimen-horizon" />
      <div className="sample-card">
        <div className="sample-art" aria-hidden="true">
          <div className="sample-orbit orbit-one" />
          <div className="sample-orbit orbit-two" />
          <div className="sample-sphere" />
          <span className="sample-art-caption">a little space</span>
        </div>
        <div className="sample-copy">
          <span className="sample-kicker">STILL / 片刻</span>
          <h3>
            {zh ? (
              <>
                给今天，
                <br />
                留一点空白。
              </>
            ) : (
              <>
                A moment.
                <br />
                Just for you.
              </>
            )}
          </h3>
          <p>
            {zh
              ? "把忙碌放下，让思绪慢慢落定。"
              : "Let the day settle. Find a little room."}
          </p>
          <button
            className="sample-button"
            onClick={() => {
              setManual(true);
              setLifted(!lifted);
            }}
            aria-label={
              zh
                ? `${variant.toUpperCase()}方案：${lifted ? "放回" : "拿起"}卡片`
                : `${variant.toUpperCase()}: ${lifted ? "Put down" : "Lift"} the card`
            }
          >
            {zh
              ? lifted
                ? "轻轻放回"
                : "拿起试试"
              : lifted
                ? "Put it down"
                : "Pick it up"}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
      <span className="sample-label">
        {zh ? "可操作的原创示例" : "Original interactive sample"}
      </span>
    </div>
  );
}
export function ReplayButton({
  onClick,
  locale,
}: {
  onClick: () => void;
  locale: Locale;
}) {
  return (
    <button className="text-button" onClick={onClick}>
      <RotateCcw size={15} />
      {locale === "zh" ? "同时重播动作" : "Replay both"}
    </button>
  );
}
