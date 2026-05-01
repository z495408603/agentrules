import { existsSync } from "node:fs";
import path from "node:path";
import { CONFIG_FILE, createDefaultConfig, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runInitCommand(cwd: string, projectName?: string): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);

  if (existsSync(configPath)) {
    throw new Error(`${CONFIG_FILE} 已存在，请直接使用 generate 或 add 命令。`);
  }

  const config = createDefaultConfig(projectName ?? path.basename(cwd));

  await writeConfig(cwd, config);
  await writeGeneratedFiles(cwd, config);
}
