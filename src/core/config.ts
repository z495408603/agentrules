import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { AgentRulesConfig } from "./types";

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
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
