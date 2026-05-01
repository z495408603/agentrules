"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const config_1 = require("../src/core/config");
const render_1 = require("../src/core/render");
(0, vitest_1.describe)("buildGeneratedFiles", () => {
    (0, vitest_1.it)("会生成四个目标规则文件", () => {
        const config = (0, config_1.createDefaultConfig)("demo");
        const files = (0, render_1.buildGeneratedFiles)(config);
        (0, vitest_1.expect)(files.map((file) => file.path)).toEqual([
            "AGENTS.md",
            "CLAUDE.md",
            ".cursorrules",
            ".github/copilot-instructions.md"
        ]);
    });
    (0, vitest_1.it)("会把模板规则渲染到输出内容中", () => {
        const config = (0, config_1.createDefaultConfig)("demo");
        config.templates.push("nextjs");
        const files = (0, render_1.buildGeneratedFiles)(config);
        const agentsFile = files.find((file) => file.path === "AGENTS.md");
        (0, vitest_1.expect)(agentsFile?.content).toContain("优先使用 Server Components");
        (0, vitest_1.expect)(agentsFile?.content).toContain("next.config.js");
    });
});
//# sourceMappingURL=render.test.js.map