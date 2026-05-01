import { readConfig, removeTemplate, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";
import { getTemplate } from "../core/templates";

export async function runTemplateRemoveCommand(
  cwd: string,
  templateKey: string
): Promise<void> {
  const template = getTemplate(templateKey);

  if (!template) {
    throw new Error(`未知模板：${templateKey}`);
  }

  const config = await readConfig(cwd);

  if (!config.templates.includes(templateKey)) {
    throw new Error(`模板未启用：${templateKey}`);
  }

  const nextConfig = removeTemplate(config, templateKey);

  // 移除模板时仅移除模板引用；已写入配置的 stack/context/prompt 由用户显式维护。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
