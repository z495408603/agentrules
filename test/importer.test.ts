import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDefaultConfig } from "../src/core/config";
import { importExistingRules } from "../src/core/importer";

const tempDirectories: string[] = [];

afterEach(async () => {
  for (const tempDirectory of tempDirectories.splice(0)) {
    await import("node:fs/promises").then(({ rm }) =>
      rm(tempDirectory, { recursive: true, force: true })
    );
  }
});

describe("importExistingRules", () => {
  it("会从现有规则文件提取项目信息、自定义规则和 Prompt", async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "agentrules-import-"));
    tempDirectories.push(tempDirectory);

    await mkdir(path.join(tempDirectory, ".github"), { recursive: true });
    await writeFile(
      path.join(tempDirectory, "AGENTS.md"),
      `# imported-project

Imported description.

## 项目上下文
- 配置文件：agentrules.config.json
- 技术栈：typescript、nodejs
- 建议优先阅读：README.md、docs/guide.md

## 团队规则
1. 规则一
2. 规则二

## Prompt 模板
### review
\`\`\`text
请审查这段代码
\`\`\`
`,
      "utf8"
    );
    await writeFile(path.join(tempDirectory, ".cursorrules"), "- Cursor 规则\n", "utf8");
    await writeFile(
      path.join(tempDirectory, ".github", "copilot-instructions.md"),
      `# Copilot Instructions

Project: imported-project

1. Copilot 规则
`,
      "utf8"
    );

    const importedConfig = await importExistingRules(tempDirectory, createDefaultConfig("demo"));

    expect(importedConfig.projectName).toBe("imported-project");
    expect(importedConfig.description).toBe("Imported description.");
    expect(importedConfig.targets).toEqual(expect.arrayContaining(["claude", "cursor", "copilot"]));
    expect(importedConfig.customRules).toEqual(
      expect.arrayContaining(["规则一", "规则二", "Cursor 规则", "Copilot 规则"])
    );
    expect(importedConfig.contextFiles).toEqual(
      expect.arrayContaining(["README.md", "docs/guide.md"])
    );
    expect(importedConfig.promptTemplates).toEqual(
      expect.arrayContaining([{ name: "review", content: "请审查这段代码" }])
    );
  });
});
