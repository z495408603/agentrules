import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 只执行 TypeScript 测试文件，避免历史编译产物被重复扫描。
    include: ["test/**/*.test.ts"]
  }
});
