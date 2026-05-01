import { readConfig, updateProjectMeta, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runProjectUpdateCommand(
  cwd: string,
  projectMeta: { name?: string; description?: string }
): Promise<void> {
  const config = await readConfig(cwd);

  if (!projectMeta.name && !projectMeta.description) {
    throw new Error("请至少提供 --name 或 --description。");
  }

  const nextProjectMeta: { projectName?: string; description?: string } = {};

  if (projectMeta.name) {
    nextProjectMeta.projectName = projectMeta.name;
  }

  if (projectMeta.description) {
    nextProjectMeta.description = projectMeta.description;
  }

  const nextConfig = updateProjectMeta(config, nextProjectMeta);

  // 项目元信息会出现在多个生成文件中，因此统一走全量同步。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
