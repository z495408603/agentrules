# agentrules

One config to rule all AI coding assistants.

`agentrules` 是一个用于管理 AI 编程助手项目规则、Prompt 模板、上下文文件和团队规范的开源 CLI。

## MVP 命令

```bash
agentrules init
agentrules add nextjs
agentrules add react
agentrules add testing
agentrules generate
```

## 当前能力

1. 使用 `agentrules.config.json` 作为单一配置源。
2. 根据配置生成 `AGENTS.md`、`CLAUDE.md`、`.cursorrules`、`.github/copilot-instructions.md`。
3. 支持 `base`、`react`、`nextjs`、`testing` 四个模板。
4. 合并规则片段、Prompt 模板和建议上下文文件。

## 开发

```bash
npm install
npm run dev -- init
npm test
```
