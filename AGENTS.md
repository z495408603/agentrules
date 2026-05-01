# agentrules

One config to rule all AI coding assistants.

## 项目上下文
- 配置文件：agentrules.config.json
- 技术栈：typescript、nodejs、vitest、testing-library
- 建议优先阅读：README.md、package.json、test、src
- 共享资产目录：.agentrules/

## 团队规则
1. 始终先阅读现有实现与 README，再开始改动。
2. 优先做最小、可验证的改动；改动后补充必要测试。
3. 避免在未确认前提下引入破坏性命令、重命名或删除文件。
4. 回复中明确列出影响范围、验证方式和仍待确认的假设。
5. 每次功能改动至少补一条验证主行为的自动化测试。
6. 测试命名聚焦业务意图，而不是实现细节。
7. 优先断言对用户可见的行为结果，减少对内部实现的脆弱耦合。

## Prompt 模板
### bugfix
```text
请先定位根因，再给出最小修复方案、风险点和验证步骤。
```

### test-plan
```text
根据本次改动列出最少但充分的测试清单，区分单元测试、集成测试和手工验证。
```

### product-roadmap
```text
请围绕用户场景、核心命令、配置结构、可扩展性和开源落地路径，输出这个功能的最小可行设计。
```

### task-breakdown
```text
你是项目协作助手。先总结目标，再给出 3 到 5 个可执行步骤，最后标注风险点。
```
