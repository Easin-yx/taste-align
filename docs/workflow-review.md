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

## PLAN-01: Visual-flow development plan review — 2026-11-06

Scope: planning documents only; no runtime changes, deployment or card-learning project work. Independent read-only reviewer: Noether. The main agent verified two findings and updated AESTHETIC-MAP section 10.7:

- Existing saveProject in src/core/storage.ts writes directly by project ID. Future migration must protect against old open tabs overwriting newer evidence. Cross-version record isolation, delayed saves, deletion, parallel edits and rollback are now required P2/P6 checks. Code inspection confirmed the risk; no runtime reproduction or fix was performed.
- Early human calibration and P7 previously overlapped without clear reuse rules. Version-matched evidence can now be reused; changed questions require targeted rechecks. The main agent organizes validation; unavailable people/devices remain explicit pending work and cannot be replaced by agent opinions. Engineering trial releases can proceed with these limits disclosed.

Local links, table structure and patch whitespace were checked. Existing collaboration rules already cover scope and responsibility; no new approval gates added. Plan changes are recorded, their runtime effectiveness is still unverified.

## QUESTIONS-01：研究支持的题目定义交付 — 2026-11-06

用户本轮要求“先进行题目定义”，并要求基于已有研究继续深化。本轮仅同频文档：增加逐题规范，旧骨架表改为指向规范，产品/设计/研究/状态补齐相关入口与边界。未制作样本、改业务代码或发布。

独立只读审查员 Huygens 检查研究结论与产品假设、跨题依赖、整体确认、预算和零自由文字路径，未发现阻塞本轮文档交付的实质缺口。主执行者核对可访问的原始研究/官方规范描述、链接、表格、题号和补丁格式；没有论文实验复现或真人校准。

本轮保留 VISUAL-01 的要求：用户不承担解释局部喜好的负担；基准不写成偏好，复核仍用视觉选择。新增题目目前只有定义，不以审查通过声称题目有效，后续按 P1 校准。未发现需要追加 AGENTS 规则的流程问题。

## COHERENCE-01：搭配质量由产品负责，不能拆成用户必答题 — 2026-11-06

- 证据：用户指出，分别选择强调色、页面用色等可能组合成自己也不喜欢的结果；可用性与协调规律应由产品保护，随后明确要求调整题目方案。旧 `830c4b7` 的默认方案以 Q01–Q06 属性题和后置组合为主，存在将搭配责任交还非设计用户的风险。此前 QUESTIONS-01 的文档一致性审查没有证明这条产品路径适合用户。
- 修订：视觉题升级为文档 v0.2，先选完整方向，再在完整页面内比较协调变体；逐参数规则仅作内部制作与校准。允许联动，但一次整套认可不能被拆成每个属性的独立偏好。所有阶段同步修改，P1 改为完整方向与整页配色切片，不再以材质参数网格为首个入口。
- 边界：专业质量判断仍需验证，不等于唯一正确审美；保留不同精良方向、拒绝与未知。二维探索仍保留，缺乏自然顺序时不用虚假的连续数轴。旧运行版本和历史证据保持原义；本轮只改文档。
- 后续验收：既检查候选协调，也检查作者口味过窄、非设计用户能否理解、换内容后是否仍成立，以及接手 AI 是否错误拆解整体偏好。实际状态继续只在 STATUS 维护，不新增审批步骤或重复协作规则。

独立只读审查员 Laplace 发现专题第 10 节仍将后续开发写成“本轮目标”，可能混淆本次文档任务与实现范围；主执行者已明确改为后续实施阶段，并保留原开发计划。其余未报告实质文档缺口。本地链接、表格和补丁格式检查通过；这不代表候选已制作、审美有效性已验证或线上已更新。
