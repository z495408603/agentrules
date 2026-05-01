#!/usr/bin/env node

import { Command } from "commander";
import process from "node:process";
import { runAddCommand } from "./commands/add";
import { runContextAddCommand } from "./commands/context-add";
import { runContextRemoveCommand } from "./commands/context-remove";
import { runGenerateCommand } from "./commands/generate";
import { runImportCommand } from "./commands/import";
import { runInitCommand } from "./commands/init";
import { runPromptAddCommand } from "./commands/prompt-add";
import { runPromptRemoveCommand } from "./commands/prompt-remove";
import { runPromptUpdateCommand } from "./commands/prompt-update";
import { runProjectUpdateCommand } from "./commands/project-update";
import { runRuleAddCommand } from "./commands/rule-add";
import { runRuleRemoveCommand } from "./commands/rule-remove";
import { runRuleUpdateCommand } from "./commands/rule-update";
import { runStatusCommand } from "./commands/status";
import { runTemplateRemoveCommand } from "./commands/template-remove";
import { readConfig } from "./core/config";
import { buildProjectSnapshot } from "./core/render";
import { listTemplateKeys, templateRegistry } from "./core/templates";

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

  const templateCommand = program.command("template").description("管理规则模板");

  templateCommand
    .command("add")
    .description("添加模板")
    .argument("<template>", "模板名称")
    .action(async (template: string) => {
      await runAddCommand(process.cwd(), template);
      console.log(`已添加模板 ${template}，并同步生成规则文件。`);
    });

  templateCommand
    .command("remove")
    .description("移除模板引用")
    .argument("<template>", "模板名称")
    .action(async (template: string) => {
      await runTemplateRemoveCommand(process.cwd(), template);
      console.log(`已移除模板 ${template}，并同步生成规则文件。`);
    });

  templateCommand
    .command("list")
    .description("列出当前项目启用的模板")
    .action(async () => {
      const config = await readConfig(process.cwd());
      const lines = config.templates.map((template, index) => `${index + 1}. ${template}`);

      console.log(lines.length > 0 ? lines.join("\n") : "当前没有启用模板。");
    });

  program
    .command("generate")
    .description("根据配置重新生成规则文件")
    .action(async () => {
      await runGenerateCommand(process.cwd());
      console.log("已重新生成规则文件。");
    });

  program
    .command("import")
    .description("导入现有 AGENTS.md、CLAUDE.md、.cursorrules、Copilot 指令文件")
    .action(async () => {
      await runImportCommand(process.cwd());
      console.log("已导入现有规则文件，并同步生成标准化输出。");
    });

  program
    .command("sync")
    .description("generate 的别名，用于同步配置到目标规则文件")
    .action(async () => {
      await runGenerateCommand(process.cwd());
      console.log("已同步配置到目标规则文件。");
    });

  program
    .command("templates")
    .description("列出内置模板")
    .action(() => {
      const lines = listTemplateKeys().flatMap((templateKey) => {
        const template = templateRegistry[templateKey];

        if (!template) {
          return [];
        }

        return `- ${template.key}: ${template.description}`;
      });

      console.log(lines.join("\n"));
    });

  program
    .command("status")
    .description("查看当前配置概览")
    .action(async () => {
      const output = await runStatusCommand(process.cwd());
      console.log(output);
    });

  const promptCommand = program.command("prompt").description("管理 Prompt 模板");

  promptCommand
    .command("add")
    .description("添加自定义 Prompt 模板")
    .argument("<name>", "模板名称")
    .argument("<content>", "模板内容")
    .action(async (name: string, content: string) => {
      await runPromptAddCommand(process.cwd(), name, content);
      console.log(`已添加 Prompt 模板 ${name}，并同步生成规则文件。`);
    });

  promptCommand
    .command("update")
    .description("更新自定义 Prompt 模板")
    .argument("<name>", "模板名称")
    .argument("<content>", "模板内容")
    .action(async (name: string, content: string) => {
      await runPromptUpdateCommand(process.cwd(), name, content);
      console.log(`已更新 Prompt 模板 ${name}，并同步生成规则文件。`);
    });

  promptCommand
    .command("remove")
    .description("移除 Prompt 模板")
    .argument("<name>", "模板名称")
    .action(async (name: string) => {
      await runPromptRemoveCommand(process.cwd(), name);
      console.log(`已移除 Prompt 模板 ${name}，并同步生成规则文件。`);
    });

  promptCommand
    .command("list")
    .description("列出当前项目内所有 Prompt 模板")
    .action(async () => {
      const config = await readConfig(process.cwd());
      const snapshot = buildProjectSnapshot(config);
      const lines = snapshot.promptTemplates.map(
        (promptTemplate, index) => `${index + 1}. ${promptTemplate.name}`
      );

      console.log(lines.length > 0 ? lines.join("\n") : "当前没有 Prompt 模板。");
    });

  const contextCommand = program.command("context").description("管理项目上下文文件");

  contextCommand
    .command("add")
    .description("注册一个上下文文件或目录")
    .argument("<path>", "上下文文件路径")
    .action(async (contextPath: string) => {
      await runContextAddCommand(process.cwd(), contextPath);
      console.log(`已添加上下文 ${contextPath}，并同步生成规则文件。`);
    });

  contextCommand
    .command("remove")
    .description("移除一个上下文文件或目录")
    .argument("<path>", "上下文文件路径")
    .action(async (contextPath: string) => {
      await runContextRemoveCommand(process.cwd(), contextPath);
      console.log(`已移除上下文 ${contextPath}，并同步生成规则文件。`);
    });

  contextCommand
    .command("list")
    .description("列出当前项目上下文文件")
    .action(async () => {
      const config = await readConfig(process.cwd());
      const snapshot = buildProjectSnapshot(config);
      const lines = snapshot.contextFiles.map(
        (contextFile, index) => `${index + 1}. ${contextFile}`
      );

      console.log(lines.length > 0 ? lines.join("\n") : "当前没有注册上下文文件。");
    });

  const projectCommand = program.command("project").description("管理项目元信息");

  projectCommand
    .command("update")
    .description("更新项目名称或描述")
    .option("-n, --name <projectName>", "项目名称")
    .option("-d, --description <description>", "项目描述")
    .action(async (options: { name?: string; description?: string }) => {
      await runProjectUpdateCommand(process.cwd(), options);
      console.log("已更新项目元信息，并同步生成规则文件。");
    });

  const ruleCommand = program.command("rule").description("管理自定义规则条目");

  ruleCommand
    .command("add")
    .description("添加一条自定义规则")
    .argument("<rule>", "规则内容")
    .action(async (rule: string) => {
      await runRuleAddCommand(process.cwd(), rule);
      console.log("已添加自定义规则，并同步生成规则文件。");
    });

  ruleCommand
    .command("update")
    .description("更新一条自定义规则")
    .argument("<previousRule>", "原规则内容")
    .argument("<nextRule>", "新规则内容")
    .action(async (previousRule: string, nextRule: string) => {
      await runRuleUpdateCommand(process.cwd(), previousRule, nextRule);
      console.log("已更新自定义规则，并同步生成规则文件。");
    });

  ruleCommand
    .command("remove")
    .description("移除一条自定义规则")
    .argument("<rule>", "规则内容")
    .action(async (rule: string) => {
      await runRuleRemoveCommand(process.cwd(), rule);
      console.log("已移除自定义规则，并同步生成规则文件。");
    });

  ruleCommand
    .command("list")
    .description("列出当前自定义规则")
    .action(async () => {
      const config = await readConfig(process.cwd());
      const lines = config.customRules.map((rule, index) => `${index + 1}. ${rule}`);

      console.log(lines.length > 0 ? lines.join("\n") : "当前没有自定义规则。");
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
