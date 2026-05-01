#!/usr/bin/env node

import { Command } from "commander";
import process from "node:process";
import { runAddCommand } from "./commands/add";
import { runGenerateCommand } from "./commands/generate";
import { runInitCommand } from "./commands/init";
import { listTemplateKeys } from "./core/templates";

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("agentrules")
    .description("Manage AI coding assistant rules, prompts, and context files in one place.")
    .version("0.1.0");

  program
    .command("init")
    .description("初始化 agentrules 配置并生成规则文件")
    .option("-n, --name <projectName>", "指定项目名称")
    .action(async (options: { name?: string }) => {
      await runInitCommand(process.cwd(), options.name);
      console.log("已初始化 agentrules 配置，并生成规则文件。");
    });

  program
    .command("add")
    .description(`添加模板。可选值：${listTemplateKeys().join(", ")}`)
    .argument("<template>", "模板名称")
    .action(async (template: string) => {
      await runAddCommand(process.cwd(), template);
      console.log(`已添加模板 ${template}，并同步生成规则文件。`);
    });

  program
    .command("generate")
    .description("根据配置重新生成规则文件")
    .action(async () => {
      await runGenerateCommand(process.cwd());
      console.log("已重新生成规则文件。");
    });

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    console.error(`agentrules 执行失败：${message}`);
    process.exitCode = 1;
  }
}

void main();
