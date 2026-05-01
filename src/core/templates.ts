import { TemplateDefinition } from "./types";

// 模板注册表负责沉淀可复用的规则片段，后续可以继续拆分到独立文件或远程模板源。
export const templateRegistry: Record<string, TemplateDefinition> = {
  base: {
    key: "base",
    label: "Base",
    description: "通用 AI 编码协作规范",
    stack: [],
    ruleSections: [
      "始终先阅读现有实现与 README，再开始改动。",
      "优先做最小、可验证的改动；改动后补充必要测试。",
      "避免在未确认前提下引入破坏性命令、重命名或删除文件。",
      "回复中明确列出影响范围、验证方式和仍待确认的假设。"
    ],
    promptTemplates: [
      {
        name: "task-breakdown",
        content:
          "你是项目协作助手。先总结目标，再给出 3 到 5 个可执行步骤，最后标注风险点。"
      }
    ]
  },
  react: {
    key: "react",
    label: "React",
    description: "React 项目规则模板",
    stack: ["react"],
    ruleSections: [
      "优先保持组件职责单一，避免超大组件承载状态、请求和视图逻辑。",
      "先检查是否能通过 props、组合和局部状态解决问题，再考虑引入新的全局状态。",
      "为复杂交互补充组件测试，至少覆盖主路径与错误路径。"
    ],
    promptTemplates: [
      {
        name: "react-review",
        content:
          "请从组件边界、状态流向、可测试性和性能回归四个维度审查这段 React 代码。"
      }
    ],
    contextFiles: ["src/App.tsx"]
  },
  nextjs: {
    key: "nextjs",
    label: "Next.js",
    description: "Next.js 项目规则模板",
    stack: ["nextjs"],
    ruleSections: [
      "优先使用 Server Components；只有确有交互需求时才添加 use client。",
      "数据获取逻辑与页面结构分层，避免在页面文件内堆叠复杂请求拼装。",
      "涉及缓存、重验证和路由行为时，说明预期的 SSR、SSG 或 ISR 策略。"
    ],
    promptTemplates: [
      {
        name: "nextjs-architecture",
        content:
          "请给出这个 Next.js 功能的目录结构、数据获取方案以及缓存策略建议。"
      }
    ],
    contextFiles: ["app", "next.config.js"]
  },
  testing: {
    key: "testing",
    label: "Testing",
    description: "测试规范模板",
    stack: ["vitest", "testing-library"],
    ruleSections: [
      "每次功能改动至少补一条验证主行为的自动化测试。",
      "测试命名聚焦业务意图，而不是实现细节。",
      "优先断言对用户可见的行为结果，减少对内部实现的脆弱耦合。"
    ],
    promptTemplates: [
      {
        name: "test-plan",
        content:
          "根据本次改动列出最少但充分的测试清单，区分单元测试、集成测试和手工验证。"
      }
    ],
    contextFiles: ["test"]
  }
};

export function getTemplate(templateKey: string): TemplateDefinition | undefined {
  return templateRegistry[templateKey];
}

export function listTemplateKeys(): string[] {
  return Object.keys(templateRegistry);
}
