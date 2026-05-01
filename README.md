# agentrules

One config to rule all AI coding assistants.

`agentrules` 是一个开源 CLI，用来统一管理 AI 编程助手的项目规则、Prompt 模板、上下文文件和团队协作规范。

适用场景：
- 同一个项目要同时服务 `AGENTS.md`、`CLAUDE.md`、`.cursorrules`、Copilot Instructions。
- 团队不想把 Prompt、上下文和规范散落在多个 markdown 文件里。
- 希望把“导入现有规则文件 -> 收敛成配置 -> 再标准化导出”变成一个稳定流程。

## 为什么值得做

- 单一配置源：核心配置集中在 `agentrules.config.json`。
- 多助手同步：一次维护，统一生成多个助手文件。
- Prompt 资产化：每个 Prompt 会输出到 `.agentrules/prompts/*.md`。
- 上下文可索引：项目上下文集中输出到 `.agentrules/context.md`。
- 可回收现有资产：支持从已有规则文件反向导入。

## 快速开始

```bash
npm install
npm run dev -- init --name agentrules
npm run dev -- template add nextjs
npm run dev -- prompt add pr-review "请从风险、边界条件、测试缺口三个角度审查改动"
npm run dev -- context add docs/architecture.md
npm run dev -- sync
```

## 核心命令

```bash
agentrules init --name my-project
agentrules templates
agentrules template add testing
agentrules template remove testing
agentrules prompt add bugfix "请先定位根因，再给出最小修复方案"
agentrules prompt update bugfix "请先定位根因，再说明风险与验证"
agentrules prompt remove bugfix
agentrules context add src
agentrules context remove src
agentrules rule add "提交前必须列出回归风险"
agentrules rule update "提交前必须列出回归风险" "提交前必须列出回归风险与验证步骤"
agentrules rule remove "提交前必须列出回归风险与验证步骤"
agentrules project update --name agentrules --description "Manage AI coding rules in one place."
agentrules import
agentrules status
agentrules sync
```

## 工作流

1. `init`：初始化单一配置源。
2. `template add`：引入技术栈模板。
3. `prompt/context/rule`：补充项目自定义资产。
4. `sync`：统一生成目标规则文件和 `.agentrules/` 资产目录。
5. `import`：把已有规则文件反向导入，再回到统一配置管理。

## 输出内容

默认会生成：
- `AGENTS.md`
- `CLAUDE.md`
- `.cursorrules`
- `.github/copilot-instructions.md`
- `.agentrules/manifest.md`
- `.agentrules/context.md`
- `.agentrules/prompts/*.md`

## 示例模板包

仓库内置了一个示例模板包目录 [examples/template-pack](./examples/template-pack/README.md)，包含 3 个可直接参考的配置：
- `nextjs-team/agentrules.config.json`
- `react-library/agentrules.config.json`
- `node-service/agentrules.config.json`

这些示例适合后续演化为真正可发布的 preset/template 包。

## 版本与发布

- 当前版本策略文档见 [docs/release.md](./docs/release.md)。
- 包发布前执行 `npm run release:check`。
- 版本提升命令：
  - `npm run version:patch`
  - `npm run version:minor`
  - `npm run version:major`

## 开发

```bash
npm install
npm run dev -- status
npm test
npm run build
```
