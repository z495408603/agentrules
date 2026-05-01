import { existsSync } from "node:fs";
import path from "node:path";
import { CONFIG_FILE, readConfig, writeConfig } from "../core/config";
import { importExistingRules } from "../core/importer";
import { writeGeneratedFiles } from "../core/render";

export async function runImportCommand(cwd: string): Promise<void> {
  const currentConfig = existsSync(path.join(cwd, CONFIG_FILE)) ? await readConfig(cwd) : undefined;
  const nextConfig = await importExistingRules(cwd, currentConfig);

  // import 会把现有规则文件反向归档进配置，然后重新标准化输出。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
