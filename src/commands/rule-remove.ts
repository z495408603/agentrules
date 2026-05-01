import { readConfig, removeRule, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runRuleRemoveCommand(cwd: string, rule: string): Promise<void> {
  const config = await readConfig(cwd);

  if (!config.customRules.includes(rule)) {
    throw new Error("未找到自定义规则。");
  }

  const nextConfig = removeRule(config, rule);

  // 移除自定义规则后重新生成，确保不同助手文件里的规则保持对齐。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
