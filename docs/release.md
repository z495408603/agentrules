# 发布策略

## 目标

`agentrules` 当前适合采用语义化版本，但在 `0.x` 阶段保持保守节奏：

- `0.2.x`：兼容现有命令和配置结构的修复与增强。
- `0.3.x`：新增命令或导入能力，但不主动破坏已有配置。
- `1.0.0`：配置结构、模板机制和导入导出流程基本稳定后再进入。

## 发布前检查

1. 运行 `npm run release:check`。
2. 确认 `README.md` 中命令示例与当前 CLI 一致。
3. 确认 `examples/template-pack` 中示例配置可读且不过时。
4. 如果修改了配置结构，补一条迁移说明。

## 版本建议

- 修复 bug 或小幅增强：`npm run version:patch`
- 新增命令或模板能力：`npm run version:minor`
- 有破坏性调整：`npm run version:major`

## npm 发布建议

1. 先在本地执行 `npm pack` 检查实际打包内容。
2. 确认 `files` 白名单只包含 `dist`、文档和示例模板包。
3. 再执行 `npm publish --access public`。
