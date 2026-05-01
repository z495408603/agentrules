import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CONFIG_FILE } from "./config";
import { getTemplate } from "./templates";
import { AgentRulesConfig, GeneratedFile, PromptTemplate } from "./types";

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function renderPromptSection(promptTemplates: PromptTemplate[]): string {
  if (promptTemplates.length === 0) {
    return "## Prompt 模板\n- 暂无模板，可在配置中补充。\n";
  }

  const blocks = promptTemplates.map((promptTemplate) => {
    return `### ${promptTemplate.name}\n\`\`\`text\n${promptTemplate.content}\n\`\`\``;
  });

  return `## Prompt 模板\n${blocks.join("\n\n")}\n`;
}

function buildRuleSections(config: AgentRulesConfig): string[] {
  const sections: string[] = [];

  for (const templateKey of config.templates) {
    const template = getTemplate(templateKey);

    if (template) {
      sections.push(...template.ruleSections);
    }
  }

  return unique(sections);
}

function buildPromptTemplates(config: AgentRulesConfig): PromptTemplate[] {
  const merged = [...config.promptTemplates];

  for (const templateKey of config.templates) {
    const template = getTemplate(templateKey);

    if (template?.promptTemplates) {
      merged.push(...template.promptTemplates);
    }
  }

  const seen = new Set<string>();

  // 使用模板名称去重，避免多个来源重复注入相同提示词。
  return merged.filter((promptTemplate) => {
    if (seen.has(promptTemplate.name)) {
      return false;
    }

    seen.add(promptTemplate.name);
    return true;
  });
}

function buildContextFiles(config: AgentRulesConfig): string[] {
  const merged = [...config.contextFiles];

  for (const templateKey of config.templates) {
    const template = getTemplate(templateKey);

    if (template?.contextFiles) {
      merged.push(...template.contextFiles);
    }
  }

  return unique(merged);
}

function renderSharedMarkdown(config: AgentRulesConfig): string {
  const ruleSections = buildRuleSections(config);
  const promptTemplates = buildPromptTemplates(config);
  const contextFiles = buildContextFiles(config);

  return `# ${config.projectName}\n\n${config.description}\n\n## 项目上下文\n- 配置文件：${CONFIG_FILE}\n- 技术栈：${config.stack.join("、")}\n- 建议优先阅读：${contextFiles.join("、")}\n\n## 团队规则\n${ruleSections
    .map((section, index) => `${index + 1}. ${section}`)
    .join("\n")}\n\n${renderPromptSection(promptTemplates)}`;
}

function renderCursorRules(config: AgentRulesConfig): string {
  const ruleSections = buildRuleSections(config);

  return ruleSections.map((section) => `- ${section}`).join("\n") + "\n";
}

function renderCopilotInstructions(config: AgentRulesConfig): string {
  const ruleSections = buildRuleSections(config);

  return `# Copilot Instructions\n\nProject: ${config.projectName}\n\n${ruleSections
    .map((section, index) => `${index + 1}. ${section}`)
    .join("\n")}\n`;
}

export function buildGeneratedFiles(config: AgentRulesConfig): GeneratedFile[] {
  const sharedMarkdown = renderSharedMarkdown(config);

  return [
    {
      path: "AGENTS.md",
      content: sharedMarkdown
    },
    {
      path: "CLAUDE.md",
      content: sharedMarkdown
    },
    {
      path: ".cursorrules",
      content: renderCursorRules(config)
    },
    {
      path: ".github/copilot-instructions.md",
      content: renderCopilotInstructions(config)
    }
  ];
}

export async function writeGeneratedFiles(
  cwd: string,
  config: AgentRulesConfig
): Promise<GeneratedFile[]> {
  const files = buildGeneratedFiles(config);

  for (const file of files) {
    const absolutePath = path.join(cwd, file.path);
    const directory = path.dirname(absolutePath);

    await mkdir(directory, { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");
  }

  return files;
}
