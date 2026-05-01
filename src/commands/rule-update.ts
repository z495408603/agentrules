import { readConfig, updateRule, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runRuleUpdateCommand(
  cwd: string,
  previousRule: string,
  nextRule: string
): Promise<void> {
  const config = await readConfig(cwd);

  if (!config.customRules.includes(previousRule)) {
    throw new Error("未找到要更新的自定义规则。");
  }

  const nextConfig = updateRule(config, previousRule, nextRule);

  // 更新规则文案后同步重渲染，避免配置与导出文件产生漂移。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
