# Delivery review · v0.1

2026-11-04. Independent read-only reviewer: Herschel. Scope: this new project, the user's goal, requirement provenance, local data safety, import/export and result review. No card-learning code, data, credentials, or release touched.

| Finding                                                                                                                       | Correction                                                                                                                    | Evidence                                                             |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Imported long names and 121st notes could create records the app could not reopen                                             | Bound import name, cap notes, validate metadata before writes, isolate unreadable records and offer their raw recovery export | Browser test: 120-character export/import + corrupt record isolation |
| Slow media upload could restore an old project snapshot over new edits                                                        | Merge upload into the latest project by stable project identity                                                               | Browser test: delayed FileReader while editing directives            |
| Earlier save completion could report success while newer saves remained pending; another project's success could hide failure | Save queue tracks pending operations and failed project identities                                                            | Two queue unit tests                                                 |
| Review handoff lost avoid/keep intent, reasons and asset positions                                                            | Preserve rule title, stable ID, original reason, file and position/time in UI and revision export                             | Core provenance test + complete workflow                             |
| “Neither” rejected samples vanished from acceptance checks                                                                    | Preserve explicit rejection as a reviewable constraint; alternative stays open                                                | Core unknown/rejection test                                          |

Additional main-agent corrections: hidden upload inputs overrode native hidden display; low-contrast supporting copy; mobile access to project settings; video-frame payloads excluded from review fingerprints; phone brief shown before export controls. All synthetic test assets are project-authored.

Review is not a claim of user satisfaction or physical iPhone testing. Final verification and release identity are maintained only in STATUS.md.

Independent recheck: Herschel reran all 16 core tests and the five original minimal reproductions. All five blockers resolved within the reviewed scope. Main-agent browser acceptance additionally passed all ten cases in Chromium and phone WebKit, against both development and production builds.

Public-site acceptance: the same ten browser workflows passed at https://easin-yx.github.io/taste-align/ after release, including image/video export and restore. No user data was used; each test ran in an isolated browser context.

## 产品中心与二维地图方案审查 — 2026-11-05

范围：用户要求把二维审美探索方向细化到可持续维护的产品文档。本轮只更新同频文档，不开发或部署，不处理卡记工作区的其他改动。独立只读审查员：Jason；主执行者负责修订与文档检查。本次不是运行时、真机或审美效果验收。

| 问题 | 证据与用户影响 | 处理与状态 |
| --- | --- | --- |
| 样本确认与范围确认混在一起 | 审查时 `DESIGN.md` 禁止范围未定的已确认偏好，而 `docs/AESTHETIC-MAP.md` 允许暂不填用途后确认；开发可能阻止保存，也可能把局部喜好直接用于全项目 | 两份文档统一为两个独立状态；允许保存/导出用途待定的样本，但不产生全项目执行要求。已修正文档并交叉核对；需后续验证产品行为 |
| 移出画布可能丢失待确认候选 | 审查时专题写“离开时恢复已有选择”，同时要求独立确认按钮；移向按钮可能先清空候选 | 专题与设计规则明确移出地图、拖动松手仍保留候选，确认或明确取消才处理；已修正文档并交叉核对，需后续用鼠标/触屏实测 |

检查结果：产品中心、专题与状态的职责已写明；候选轴和九个样本起点标为执行建议，既有演示不写成已上线功能。现有项目协作规则已覆盖文档入口和交付审查，本轮不另加审批或重复规则。实际进度继续仅在 [STATUS.md](STATUS.md) 维护。

## VISUAL-01：视觉题不应转交设计分析负担 — 2026-11-06

- 原始证据：用户本轮指出“用户只需要在我们设定好的这个坐标图上进行选择”“如果再进行多余表达，那可能就是我们的问题和答案设置得不够好”。前版 `19ffc33` 的 `docs/AESTHETIC-MAP.md` 第 4 节把“限定含义”和“可选补充”列在主流程中，且要求用户说明只喜欢哪部分。
- 观察与影响：即使标为简短/可选，核心方案仍依赖用户拆解视觉原因，与用户希望题目本身能确定含义的目标错位。推断原因：执行者先用通用参考标注机制解决歧义，没有优先设计可区分原因的题目；不是用户缺少表达能力。
- 已修订：产品中心、专题、设计规则和当前状态统一为视觉选择主流程；题目限定比较属性和上下文，必要时用视觉复核，原话/参考为自愿扩展。研究记录区分评价量表、参数空间和偏好选择；有限题数与题库仍属待验证建议。上次关于范围的审查仍要求数据保留范围，但不再要求用户逐题补范围。
- 状态：已落实到文档，产品行为与有效性待验证。后续检查应覆盖零自由文字完整任务、未用于出题的新内容复核，以及真实 AI 交接，而不只检查控件可点。本轮未改业务代码、未部署、未做真机验收。
- 独立只读审查：Carson 发现旧形态题的固定布局/字号约束被用于整个题库，会锁死空间与字体题要比较的变量；主执行者已改为逐题确定变化项，其余固定。已检查文档本地链接、表格与补丁格式；未把审查结果当作题目有效性或论文复现证据。
