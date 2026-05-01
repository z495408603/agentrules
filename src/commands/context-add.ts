import { appendContextFile, readConfig, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runContextAddCommand(
  cwd: string,
  contextFile: string
): Promise<void> {
  const config = await readConfig(cwd);
  const nextConfig = appendContextFile(config, contextFile);

  // 上下文文件注册后立即同步生成索引，保证团队看到的是最新上下文集合。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
