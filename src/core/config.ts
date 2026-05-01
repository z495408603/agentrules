import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { AgentRulesConfig, PromptTemplate } from "./types";

export const CONFIG_FILE = "agentrules.config.json";

const promptTemplateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1)
});

const configSchema = z.object({
  projectName: z.string().min(1),
  description: z.string().min(1),
  stack: z.array(z.string()).default([]),
  targets: z.array(z.enum(["claude", "cursor", "copilot"])).default([]),
  templates: z.array(z.string()).default([]),
  customRules: z.array(z.string()).default([]),
  contextFiles: z.array(z.string()).default([]),
  promptTemplates: z.array(promptTemplateSchema).default([])
});

export function createDefaultConfig(projectName: string): AgentRulesConfig {
  return {
    projectName,
    description: "One config to rule all AI coding assistants.",
    stack: ["typescript", "nodejs"],
    targets: ["claude", "cursor", "copilot"],
    templates: ["base"],
    customRules: [],
    contextFiles: ["README.md", "package.json"],
    promptTemplates: [
      {
        name: "bugfix",
        content:
          "请先定位根因，再给出最小修复方案、风险点和验证步骤。"
      }
    ]
  };
}

export async function readConfig(cwd: string): Promise<AgentRulesConfig> {
  const configPath = path.join(cwd, CONFIG_FILE);
  const content = await readFile(configPath, "utf8");

  return configSchema.parse(JSON.parse(content));
}

export async function writeConfig(cwd: string, config: AgentRulesConfig): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);

  // 统一格式化输出，保证配置文件适合团队评审与版本管理。
  await writeFile(configPath, `${JSON.stringify(normalizeConfig(config), null, 2)}\n`, "utf8");
}

export function normalizeConfig(config: AgentRulesConfig): AgentRulesConfig {
  return {
    ...config,
    stack: unique(config.stack),
    targets: unique(config.targets),
    templates: unique(config.templates),
    customRules: unique(config.customRules),
    contextFiles: unique(config.contextFiles),
    promptTemplates: uniquePromptTemplates(config.promptTemplates)
  };
}

export function appendPromptTemplate(
  config: AgentRulesConfig,
  promptTemplate: PromptTemplate
): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    promptTemplates: [...config.promptTemplates, promptTemplate]
  });
}

export function appendContextFile(
  config: AgentRulesConfig,
  contextFile: string
): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    contextFiles: [...config.contextFiles, contextFile]
  });
}

export function appendTemplate(config: AgentRulesConfig, templateKey: string): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    templates: [...config.templates, templateKey]
  });
}

export function removeTemplate(config: AgentRulesConfig, templateKey: string): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    templates: config.templates.filter((item) => item !== templateKey)
  });
}

export function updatePromptTemplate(
  config: AgentRulesConfig,
  name: string,
  content: string
): AgentRulesConfig {
  const nextPromptTemplates = config.promptTemplates.map((promptTemplate) => {
    if (promptTemplate.name !== name) {
      return promptTemplate;
    }

    // 仅替换目标模板内容，保证其它模板顺序和结构保持稳定。
    return {
      ...promptTemplate,
      content
    };
  });

  return normalizeConfig({
    ...config,
    promptTemplates: nextPromptTemplates
  });
}

export function removePromptTemplate(
  config: AgentRulesConfig,
  name: string
): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    promptTemplates: config.promptTemplates.filter((promptTemplate) => promptTemplate.name !== name)
  });
}

export function removeContextFile(
  config: AgentRulesConfig,
  contextFile: string
): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    contextFiles: config.contextFiles.filter((item) => item !== contextFile)
  });
}

export function updateProjectMeta(
  config: AgentRulesConfig,
  projectMeta: { projectName?: string; description?: string }
): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    projectName: projectMeta.projectName ?? config.projectName,
    description: projectMeta.description ?? config.description
  });
}

export function appendRule(config: AgentRulesConfig, rule: string): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    customRules: [...config.customRules, rule]
  });
}

export function updateRule(
  config: AgentRulesConfig,
  previousRule: string,
  nextRule: string
): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    customRules: config.customRules.map((rule) => {
      return rule === previousRule ? nextRule : rule;
    })
  });
}

export function removeRule(config: AgentRulesConfig, rule: string): AgentRulesConfig {
  return normalizeConfig({
    ...config,
    customRules: config.customRules.filter((item) => item !== rule)
  });
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function uniquePromptTemplates(promptTemplates: PromptTemplate[]): PromptTemplate[] {
  const seen = new Set<string>();

  // Prompt 模板以名称作为唯一键，便于命令行增量维护。
  return promptTemplates.filter((promptTemplate) => {
    if (seen.has(promptTemplate.name)) {
      return false;
    }

    seen.add(promptTemplate.name);
    return true;
  });
}
