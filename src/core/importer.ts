import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createDefaultConfig, normalizeConfig } from "./config";
import { getTemplate } from "./templates";
import { AgentRulesConfig, AgentTarget, PromptTemplate } from "./types";

interface ImportedSnapshot {
  projectName?: string;
  description?: string;
  targets: AgentTarget[];
  customRules: string[];
  contextFiles: string[];
  promptTemplates: PromptTemplate[];
}

async function readIfExists(filePath: string): Promise<string | null> {
  if (!existsSync(filePath)) {
    return null;
  }

  return readFile(filePath, "utf8");
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function parseDelimitedLine(value: string): string[] {
  return value
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMarkdownPrompts(content: string): PromptTemplate[] {
  const promptTemplates: PromptTemplate[] = [];
  const promptPattern = /^###\s+(.+?)\r?\n```text\r?\n([\s\S]*?)\r?\n```/gm;

  for (const match of content.matchAll(promptPattern)) {
    const [, name, promptContent] = match;

    if (!name || !promptContent) {
      continue;
    }

    promptTemplates.push({
      name: name.trim(),
      content: promptContent.trim()
    });
  }

  return promptTemplates;
}

function parseNumberedRules(content: string): string[] {
  return [...content.matchAll(/^\d+\.\s+(.+)$/gm)].map((match) => match[1]!.trim());
}

function parseBulletRules(content: string): string[] {
  return [...content.matchAll(/^- (.+)$/gm)].map((match) => match[1]!.trim());
}

function parseAgentsMarkdown(content: string): ImportedSnapshot {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const descriptionMatch = content.match(/^#\s+.+\r?\n\r?\n(.+)$/m);
  const contextMatch = content.match(/^- 建议优先阅读：(.+)$/m);
  const snapshot: ImportedSnapshot = {
    targets: [],
    customRules: parseNumberedRules(content),
    contextFiles: contextMatch ? parseDelimitedLine(contextMatch[1]!) : [],
    promptTemplates: parseMarkdownPrompts(content)
  };

  if (titleMatch?.[1]) {
    snapshot.projectName = titleMatch[1].trim();
  }

  if (descriptionMatch?.[1]) {
    snapshot.description = descriptionMatch[1].trim();
  }

  return snapshot;
}

function parseCursorRules(content: string): ImportedSnapshot {
  return {
    targets: ["cursor"],
    customRules: parseBulletRules(content),
    contextFiles: [],
    promptTemplates: []
  };
}

function parseCopilotInstructions(content: string): ImportedSnapshot {
  const projectNameMatch = content.match(/^Project:\s+(.+)$/m);
  const snapshot: ImportedSnapshot = {
    targets: ["copilot"],
    customRules: parseNumberedRules(content),
    contextFiles: [],
    promptTemplates: []
  };

  if (projectNameMatch?.[1]) {
    snapshot.projectName = projectNameMatch[1].trim();
  }

  return snapshot;
}

function mergePromptTemplates(
  basePromptTemplates: PromptTemplate[],
  nextPromptTemplates: PromptTemplate[]
): PromptTemplate[] {
  const seen = new Set(basePromptTemplates.map((promptTemplate) => promptTemplate.name));
  const merged = [...basePromptTemplates];

  for (const promptTemplate of nextPromptTemplates) {
    if (seen.has(promptTemplate.name)) {
      continue;
    }

    seen.add(promptTemplate.name);
    merged.push(promptTemplate);
  }

  return merged;
}

function mergeImportedSnapshot(
  current: ImportedSnapshot,
  next: ImportedSnapshot
): ImportedSnapshot {
  const snapshot: ImportedSnapshot = {
    targets: unique([...current.targets, ...next.targets]),
    customRules: unique([...current.customRules, ...next.customRules]),
    contextFiles: unique([...current.contextFiles, ...next.contextFiles]),
    promptTemplates: mergePromptTemplates(current.promptTemplates, next.promptTemplates)
  };

  const projectName = current.projectName ?? next.projectName;

  if (projectName) {
    snapshot.projectName = projectName;
  }

  const description = current.description ?? next.description;

  if (description) {
    snapshot.description = description;
  }

  return snapshot;
}

function filterImportedSnapshotByTemplates(
  importedSnapshot: ImportedSnapshot,
  templateKeys: string[]
): ImportedSnapshot {
  const templateRules = new Set<string>();
  const templateContexts = new Set<string>();
  const templatePromptNames = new Set<string>();

  for (const templateKey of templateKeys) {
    const template = getTemplate(templateKey);

    if (!template) {
      continue;
    }

    for (const ruleSection of template.ruleSections) {
      templateRules.add(ruleSection);
    }

    for (const contextFile of template.contextFiles ?? []) {
      templateContexts.add(contextFile);
    }

    for (const promptTemplate of template.promptTemplates ?? []) {
      templatePromptNames.add(promptTemplate.name);
    }
  }

  // 已由模板表达的内容不再回灌为 customRules，避免 import 破坏配置整洁度。
  return {
    ...importedSnapshot,
    customRules: importedSnapshot.customRules.filter((rule) => !templateRules.has(rule)),
    contextFiles: importedSnapshot.contextFiles.filter((contextFile) => !templateContexts.has(contextFile)),
    promptTemplates: importedSnapshot.promptTemplates.filter(
      (promptTemplate) => !templatePromptNames.has(promptTemplate.name)
    )
  };
}

export async function importExistingRules(
  cwd: string,
  currentConfig?: AgentRulesConfig
): Promise<AgentRulesConfig> {
  const agentsPath = path.join(cwd, "AGENTS.md");
  const claudePath = path.join(cwd, "CLAUDE.md");
  const cursorPath = path.join(cwd, ".cursorrules");
  const copilotPath = path.join(cwd, ".github", "copilot-instructions.md");

  const [agentsContent, claudeContent, cursorContent, copilotContent] = await Promise.all([
    readIfExists(agentsPath),
    readIfExists(claudePath),
    readIfExists(cursorPath),
    readIfExists(copilotPath)
  ]);

  let importedSnapshot: ImportedSnapshot = {
    targets: [],
    customRules: [],
    contextFiles: [],
    promptTemplates: []
  };

  // 按文件类型分别提取结构化信息，再合并为统一配置快照。
  if (agentsContent) {
    importedSnapshot = mergeImportedSnapshot(importedSnapshot, parseAgentsMarkdown(agentsContent));
  }

  if (claudeContent) {
    importedSnapshot = mergeImportedSnapshot(importedSnapshot, {
      ...parseAgentsMarkdown(claudeContent),
      targets: ["claude"]
    });
  }

  if (cursorContent) {
    importedSnapshot = mergeImportedSnapshot(importedSnapshot, parseCursorRules(cursorContent));
  }

  if (copilotContent) {
    importedSnapshot = mergeImportedSnapshot(importedSnapshot, parseCopilotInstructions(copilotContent));
  }

  if (importedSnapshot.targets.length === 0) {
    throw new Error("未找到可导入的规则文件。");
  }

  const baseConfig =
    currentConfig ??
    createDefaultConfig(importedSnapshot.projectName ?? path.basename(cwd));
  const filteredImportedSnapshot = filterImportedSnapshotByTemplates(
    importedSnapshot,
    baseConfig.templates
  );

  return normalizeConfig({
    ...baseConfig,
    projectName: filteredImportedSnapshot.projectName ?? baseConfig.projectName,
    description: filteredImportedSnapshot.description ?? baseConfig.description,
    targets: unique([...baseConfig.targets, ...filteredImportedSnapshot.targets]),
    customRules: unique([...baseConfig.customRules, ...filteredImportedSnapshot.customRules]),
    contextFiles: unique([...baseConfig.contextFiles, ...filteredImportedSnapshot.contextFiles]),
    promptTemplates: mergePromptTemplates(
      baseConfig.promptTemplates,
      filteredImportedSnapshot.promptTemplates
    )
  });
}
