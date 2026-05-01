import { appendTemplate, readConfig, writeConfig } from "../core/config";
import { getTemplate } from "../core/templates";
import { writeGeneratedFiles } from "../core/render";

export async function runAddCommand(cwd: string, templateKey: string): Promise<void> {
  const template = getTemplate(templateKey);

  if (!template) {
    throw new Error(`未知模板：${templateKey}`);
  }

  let config = appendTemplate(await readConfig(cwd), template.key);

  for (const stackItem of template.stack) {
    if (!config.stack.includes(stackItem)) {
      config.stack.push(stackItem);
    }
  }

  if (template.contextFiles) {
    for (const contextFile of template.contextFiles) {
      if (!config.contextFiles.includes(contextFile)) {
        config.contextFiles.push(contextFile);
      }
    }
  }

  if (template.promptTemplates) {
    for (const promptTemplate of template.promptTemplates) {
      const exists = config.promptTemplates.some((item) => item.name === promptTemplate.name);

      if (!exists) {
        config.promptTemplates.push(promptTemplate);
      }
    }
  }

  // add 命令默认同步生成结果，确保配置与目标规则文件始终一致。
  await writeConfig(cwd, config);
  await writeGeneratedFiles(cwd, config);
}
