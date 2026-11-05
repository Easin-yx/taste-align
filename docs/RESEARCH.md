# Why this exists

Research date: 2026-11-04. Scope: first-party descriptions, not an exhaustive market survey.

- [Agentation](https://github.com/benjitaylor/agentation) turns annotations on an implemented interface into selectors and coding-agent context. Its README lists desktop browsers and PolyForm Shield licensing. We do not bundle or copy its code.
- [MarkupKit](https://github.com/dragoon0x/markupkit/) offers freehand feedback on live pages and structured agent context.
- [Built-in browser annotations](https://learn.chatgpt.com/docs/browser) are already useful for pinning a problem to an existing element.
- [Figma prototype comments](https://help.figma.com/hc/en-us/articles/360039824594-Comment-on-prototypes) make feedback contextual to a design.

Taste Align's deliberately narrower job is earlier: when a person can recognize what they like but cannot articulate it, show controlled comparisons, record scoped positive/negative evidence, preserve undecided dimensions, and produce a portable brief with assets. Then carry the same requirements into a manual result review.

The distinction is a product hypothesis, not a claim that no other tool does this. Five comparisons are vocabulary aids, not a psychometric assessment or a universal style taxonomy. The examples intentionally expose a limited set of directions; “neither” and user references are first-class.

## Validation boundary

Automated validation checks whether user intent is captured, preserved, exported, restored and kept consistent across revisions. It cannot establish that the product saves time or improves aesthetic satisfaction for real users. Those outcomes need observation of people using it on a real project.

Suggested next evaluation: give one person a short UI task; compare their original brief with the exported one; ask a second designer/AI to implement each blind; assess whether the intended differences survive and count clarification turns. Do not invent a success percentage.

## 二维探索方向的补充依据 — 2026-11-05

本轮只补充与新方向直接相关的两类来源，不把最初的邻近工具清单当成完整竞品调查。

- [Design Taste Lab](https://github.com/vb-tyagi/design-taste-lab) 已提出用问卷、视觉探针、滑动比较、参考拆解等方式提取偏好，再形成可交给 AI 的设计说明。我们可借鉴多种证据共同确认方向；“用户与 AI 对齐审美”不是空白领域。其 README 的完整运行流程需要模型 API，演示模式使用样例；我们拟验证的是无需实时生成、以预设二维样本为入口的较小闭环。不能仅凭功能描述认定双方谁更有效。
- [AI-Assisted Design Concept Exploration Through Character Space Construction](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.819237/full) 讨论通过两组对立形容词构造四象限，帮助探索和表达设计概念。我们借鉴用对比澄清感觉的方法；论文不证明任意词都能成为可靠坐标，也不证明我们的样本库具有测量准确度。

当前假设是：让非设计专业用户只通过可见样本选择，系统依据题目定义记录比较特征、范围与证据，可能比只问抽象词更容易对齐；原话仅在用户自愿提供时附带。2026-11-06 已按用户纠正取消主流程中的局部解释步骤。仍须与直接描述和现有 A/B 方法比较；如果地图没有帮助，就不扩大素材制作。产品决策见 [产品中心](../PRODUCT.md)，具体实验见 [二维审美地图](AESTHETIC-MAP.md)。

## 视觉题与设计要素的研究核对 — 2026-11-06

范围：作者项目页、研究团队资料、论文摘要及官方指南。没有复现论文实验，也没有验证同频的题目。只借鉴方法，不复制论文样本、问卷全文或第三方资产。

| 来源 | 直接支持的观察 | 对本产品的启发与限制 |
| --- | --- | --- |
| [Sequential Gallery，Koyama 等，SIGGRAPH 2020](https://koyama.xyz/project/sequential_gallery/)；[论文摘要](https://arxiv.org/abs/2005.04107) | 把预先定义的多参数设计空间拆成连续二维搜索任务，用网格选择收集偏好；有合成函数实验及照片增强场景的初步用户研究 | 与“持续选二维效果”直接相关。它已有参数空间，轴可为算法选择的参数组合，不等于具有人类可解释词的固定题库，也没证明能概括整个 App 审美 |
| [Sequential Gallery 作者代码](https://github.com/yuki-koyama/sequential-gallery) | MIT 项目含算法库、桌面界面和 Python 绑定 | 可进一步评估算法复用；不是可直接插入当前网页的完整题库。本轮未安装、运行或集成 |
| [VisAWI 作者说明与论文索引，Moshagen / Thielsch](https://meinald.de/forschung/visawi/) | 从用户评价的角度组织网站视觉美感，涉及简洁性、多样性、色彩性和制作精良程度 | 提供审视设计的维度；它评估已有网站，不是反推个人理想设计的现成试题。“精良程度”应作为所有样本的品质要求，不做“粗糙—精美”偏好轴 |
| [LabintheWild：Reinecke 等 CHI 2013 / 2014 研究资料](https://www1.labinthewild.org/data/index.php) | 研究用图像统计特征估计感知复杂度与色彩丰富程度，并考察不同用户的视觉偏好 | 应区分“感知到什么”和“喜欢什么”；群体规律不能替代个人答案，更不要求收集人口信息推断个人审美。研究以网页截图/第一印象为主，不覆盖全部交互体验 |
| [Apple HIG：Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | 动效应服务于状态和操作反馈，符合手势预期，并允许取消、尊重使用者需要 | 动效题用同任务可播放/可操作样本；好看不等于长动画，每次操作都等动画结束不能作为某种“慢风格” |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 提供可测试的可访问性要求，包括对比度、键盘操作、拖动替代和部分动态效果约束 | 样本的基本可读性和可操作性是底线，不交由偏好题投票决定；符合标准也不证明用户喜欢 |

### 本轮结论：可行性与尚未成立的部分

**有依据的可行路径**：先定义有限且可还原的设计变量，让用户比较视觉结果，逐步收集偏好。研究支持继续试验这种方式；现阶段可用预设样本与规则分支，不必实时 AI 生图。

**仍是产品假设**：由一组容易理解的二维题覆盖当前用途的主要审美特征，得到能指导 AI 的设计要求。没有找到可直接照用、经过验证、对所有产品都成立的完整题库。论文量表、设计系统分类和偏好推断算法承担不同工作，不能简单合并成“科学审美测验”。

需要验证的推断链为：可控参数的变化 → 用户确实看见预期差别 → 选择反映当前用途的偏好 → 多题组合与新内容中仍成立 → 接手者据此做出的结果更接近。每个箭头都可能失效；不能仅用题目完成率当作有效性证据。

候选参数与题目见专题第 2 节。颜色、轮廓、空间、字体/图形、材质、动效、操作反馈只是当前工作清单；不是互相完全独立的维度，也不是对艺术品感的完备量化。
