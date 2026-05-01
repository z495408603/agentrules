import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CONFIG_FILE } from "./config";
import { getTemplate } from "./templates";
import {
  AgentRulesConfig,
  GeneratedFile,
  ProjectSnapshot,
  PromptTemplate
} from "./types";

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function toPromptFileName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  const sections: string[] = [...config.customRules];

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

export function buildProjectSnapshot(config: AgentRulesConfig): ProjectSnapshot {
  return {
    ruleSections: buildRuleSections(config),
    promptTemplates: buildPromptTemplates(config),
    contextFiles: buildContextFiles(config)
  };
}

function renderSharedMarkdown(config: AgentRulesConfig): string {
  const snapshot = buildProjectSnapshot(config);

  return `# ${config.projectName}\n\n${config.description}\n\n## 项目上下文\n- 配置文件：${CONFIG_FILE}\n- 技术栈：${config.stack.join("、")}\n- 建议优先阅读：${snapshot.contextFiles.join("、")}\n- 共享资产目录：.agentrules/\n\n## 团队规则\n${snapshot.ruleSections
    .map((section, index) => `${index + 1}. ${section}`)
    .join("\n")}\n\n${renderPromptSection(snapshot.promptTemplates)}`;
}

function renderCursorRules(config: AgentRulesConfig): string {
  const snapshot = buildProjectSnapshot(config);

  return snapshot.ruleSections.map((section) => `- ${section}`).join("\n") + "\n";
}

function renderCopilotInstructions(config: AgentRulesConfig): string {
  const snapshot = buildProjectSnapshot(config);

  return `# Copilot Instructions\n\nProject: ${config.projectName}\n\n${snapshot.ruleSections
    .map((section, index) => `${index + 1}. ${section}`)
    .join("\n")}\n`;
}

function renderClaudeInstructions(config: AgentRulesConfig): string {
  return renderSharedMarkdown(config);
}

function renderManifest(config: AgentRulesConfig): string {
  const snapshot = buildProjectSnapshot(config);

  return `# AgentRules Manifest\n\n## Project\n- name: ${config.projectName}\n- description: ${config.description}\n- targets: ${config.targets.join(", ")}\n- stack: ${config.stack.join(", ")}\n\n## Templates\n${config.templates
    .map((template, index) => `${index + 1}. ${template}`)
    .join("\n")}\n\n## Context Files\n${snapshot.contextFiles
    .map((contextFile, index) => `${index + 1}. ${contextFile}`)
    .join("\n")}\n\n## Prompt Templates\n${snapshot.promptTemplates
    .map(
      (promptTemplate, index) =>
        `${index + 1}. ${promptTemplate.name} -> .agentrules/prompts/${toPromptFileName(promptTemplate.name)}.md`
    )
    .join("\n")}\n`;
}

function renderContextIndex(config: AgentRulesConfig): string {
  const snapshot = buildProjectSnapshot(config);

  if (snapshot.contextFiles.length === 0) {
    return "# Context Index\n\n- 暂无上下文文件。\n";
  }

  return `# Context Index\n\n${snapshot.contextFiles
    .map((contextFile, index) => `${index + 1}. ${contextFile}`)
    .join("\n")}\n`;
}

function renderPromptDocument(promptTemplate: PromptTemplate): string {
  return `# ${promptTemplate.name}\n\n\`\`\`text\n${promptTemplate.content}\n\`\`\`\n`;
}

export function buildGeneratedFiles(config: AgentRulesConfig): GeneratedFile[] {
  const sharedMarkdown = renderSharedMarkdown(config);
  const snapshot = buildProjectSnapshot(config);
  const files: GeneratedFile[] = [
    {
      path: "AGENTS.md",
      content: sharedMarkdown
    },
    {
      path: ".agentrules/manifest.md",
      content: renderManifest(config)
    },
    {
      path: ".agentrules/context.md",
      content: renderContextIndex(config)
    }
  ];

  // 目标文件按助手类型选择性输出，避免在未启用的生态中生成多余文件。
  if (config.targets.includes("claude")) {
    files.push({
      path: "CLAUDE.md",
      content: renderClaudeInstructions(config)
    });
  }

  if (config.targets.includes("cursor")) {
    files.push({
      path: ".cursorrules",
      content: renderCursorRules(config)
    });
  }

  if (config.targets.includes("copilot")) {
    files.push({
      path: ".github/copilot-instructions.md",
      content: renderCopilotInstructions(config)
    });
  }

  // 为每个 Prompt 模板生成独立文档，便于在不同工具里直接引用。
  for (const promptTemplate of snapshot.promptTemplates) {
    files.push({
      path: `.agentrules/prompts/${toPromptFileName(promptTemplate.name)}.md`,
      content: renderPromptDocument(promptTemplate)
    });
  }

  return files;
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
