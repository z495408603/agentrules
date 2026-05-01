import { readConfig } from "../core/config";
import { buildProjectSnapshot } from "../core/render";

export async function runStatusCommand(cwd: string): Promise<string> {
  const config = await readConfig(cwd);
  const snapshot = buildProjectSnapshot(config);

  return [
    `项目：${config.projectName}`,
    `描述：${config.description}`,
    `目标助手：${config.targets.join("、")}`,
    `模板：${config.templates.join("、")}`,
    `技术栈：${config.stack.join("、")}`,
    `上下文文件数量：${snapshot.contextFiles.length}`,
    `Prompt 模板数量：${snapshot.promptTemplates.length}`,
    `规则条目数量：${snapshot.ruleSections.length}`
  ].join("\n");
}
