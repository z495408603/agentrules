import { appendPromptTemplate, readConfig, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runPromptAddCommand(
  cwd: string,
  name: string,
  content: string
): Promise<void> {
  const config = await readConfig(cwd);
  const nextConfig = appendPromptTemplate(config, { name, content });

  // Prompt 模板更新后同步写回独立文档，便于在不同助手之间复用和引用。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
