import { describe, expect, it } from "vitest";
import {
  appendContextFile,
  appendRule,
  appendTemplate,
  appendPromptTemplate,
  createDefaultConfig,
  removeContextFile,
  removeRule,
  removePromptTemplate,
  removeTemplate,
  updateRule,
  updateProjectMeta,
  updatePromptTemplate
} from "../src/core/config";

describe("config helpers", () => {
  it("会按名称去重 Prompt 模板", () => {
    const config = createDefaultConfig("demo");
    const nextConfig = appendPromptTemplate(config, {
      name: "bugfix",
      content: "新的内容不应该产生重复项"
    });

    expect(nextConfig.promptTemplates.filter((item) => item.name === "bugfix")).toHaveLength(1);
  });

  it("会去重上下文文件", () => {
    const config = createDefaultConfig("demo");
    const nextConfig = appendContextFile(config, "README.md");

    expect(nextConfig.contextFiles.filter((item) => item === "README.md")).toHaveLength(1);
  });

  it("会移除模板引用", () => {
    const config = appendTemplate(createDefaultConfig("demo"), "testing");
    const nextConfig = removeTemplate(config, "testing");

    expect(nextConfig.templates).not.toContain("testing");
  });

  it("会更新自定义 Prompt 模板内容", () => {
    const config = createDefaultConfig("demo");
    const nextConfig = updatePromptTemplate(config, "bugfix", "新的修复模板");

    expect(nextConfig.promptTemplates.find((item) => item.name === "bugfix")?.content).toBe(
      "新的修复模板"
    );
  });

  it("会移除自定义 Prompt 模板", () => {
    const config = createDefaultConfig("demo");
    const nextConfig = removePromptTemplate(config, "bugfix");

    expect(nextConfig.promptTemplates).toHaveLength(0);
  });

  it("会移除上下文文件", () => {
    const config = createDefaultConfig("demo");
    const nextConfig = removeContextFile(config, "README.md");

    expect(nextConfig.contextFiles).not.toContain("README.md");
  });

  it("会更新项目名称和描述", () => {
    const config = createDefaultConfig("demo");
    const nextConfig = updateProjectMeta(config, {
      projectName: "agentrules-pro",
      description: "新的描述"
    });

    expect(nextConfig.projectName).toBe("agentrules-pro");
    expect(nextConfig.description).toBe("新的描述");
  });

  it("会追加和去重自定义规则", () => {
    const config = createDefaultConfig("demo");
    const nextConfig = appendRule(appendRule(config, "新增规则"), "新增规则");

    expect(nextConfig.customRules).toEqual(["新增规则"]);
  });

  it("会更新自定义规则", () => {
    const config = appendRule(createDefaultConfig("demo"), "旧规则");
    const nextConfig = updateRule(config, "旧规则", "新规则");

    expect(nextConfig.customRules).toContain("新规则");
    expect(nextConfig.customRules).not.toContain("旧规则");
  });

  it("会移除自定义规则", () => {
    const config = appendRule(createDefaultConfig("demo"), "旧规则");
    const nextConfig = removeRule(config, "旧规则");

    expect(nextConfig.customRules).toHaveLength(0);
  });
});
