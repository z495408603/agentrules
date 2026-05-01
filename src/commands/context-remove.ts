import { readConfig, removeContextFile, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runContextRemoveCommand(
  cwd: string,
  contextFile: string
): Promise<void> {
  const config = await readConfig(cwd);

  if (!config.contextFiles.includes(contextFile)) {
    throw new Error(`未找到上下文：${contextFile}`);
  }

  const nextConfig = removeContextFile(config, contextFile);

  // 删除上下文后立即重建输出，避免索引继续暴露已移除内容。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
