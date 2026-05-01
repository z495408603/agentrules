import { readConfig, removePromptTemplate, writeConfig } from "../core/config";
import { buildProjectSnapshot, writeGeneratedFiles } from "../core/render";

export async function runPromptRemoveCommand(cwd: string, name: string): Promise<void> {
  const config = await readConfig(cwd);
  const snapshot = buildProjectSnapshot(config);
  const exists = snapshot.promptTemplates.some((promptTemplate) => promptTemplate.name === name);

  if (!exists) {
    throw new Error(`未找到 Prompt 模板：${name}`);
  }

  const nextConfig = removePromptTemplate(config, name);

  // 删除 Prompt 后需要同步索引和规则文件，确保各助手看到的模板集合一致。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
