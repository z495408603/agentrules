import { describe, expect, it } from "vitest";
import { createDefaultConfig } from "../src/core/config";
import { buildGeneratedFiles } from "../src/core/render";

describe("buildGeneratedFiles", () => {
  it("会生成共享资产与目标规则文件", () => {
    const config = createDefaultConfig("demo");
    const files = buildGeneratedFiles(config);

    expect(files.map((file) => file.path)).toEqual([
      "AGENTS.md",
      ".agentrules/manifest.md",
      ".agentrules/context.md",
      "CLAUDE.md",
      ".cursorrules",
      ".github/copilot-instructions.md",
      ".agentrules/prompts/bugfix.md",
      ".agentrules/prompts/task-breakdown.md"
    ]);
  });

  it("会把模板规则渲染到输出内容中", () => {
    const config = createDefaultConfig("demo");
    config.templates.push("nextjs");

    const files = buildGeneratedFiles(config);
    const agentsFile = files.find((file) => file.path === "AGENTS.md");

    expect(agentsFile?.content).toContain("优先使用 Server Components");
    expect(agentsFile?.content).toContain("next.config.js");
  });

  it("会根据 targets 过滤目标规则文件", () => {
    const config = createDefaultConfig("demo");
    config.targets = ["cursor"];

    const files = buildGeneratedFiles(config);

    expect(files.some((file) => file.path === "CLAUDE.md")).toBe(false);
    expect(files.some((file) => file.path === ".github/copilot-instructions.md")).toBe(false);
    expect(files.some((file) => file.path === ".cursorrules")).toBe(true);
  });
});
