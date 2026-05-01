import { readConfig, updatePromptTemplate, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runPromptUpdateCommand(
  cwd: string,
  name: string,
  content: string
): Promise<void> {
  const config = await readConfig(cwd);
  const exists = config.promptTemplates.some((promptTemplate) => promptTemplate.name === name);

  if (!exists) {
    throw new Error(`未找到自定义 Prompt 模板：${name}`);
  }

  const nextConfig = updatePromptTemplate(config, name, content);

  // 只允许更新配置中声明的自定义 Prompt，避免误改模板内置内容。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
