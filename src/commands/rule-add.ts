import { appendRule, readConfig, writeConfig } from "../core/config";
import { writeGeneratedFiles } from "../core/render";

export async function runRuleAddCommand(cwd: string, rule: string): Promise<void> {
  const config = await readConfig(cwd);
  const nextConfig = appendRule(config, rule);

  // 自定义规则是导入和人工维护的共同落点，更新后立即同步输出。
  await writeConfig(cwd, nextConfig);
  await writeGeneratedFiles(cwd, nextConfig);
}
