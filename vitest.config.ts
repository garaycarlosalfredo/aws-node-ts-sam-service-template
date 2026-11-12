import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@domain": fromRoot("./src/domain"),
      "@application": fromRoot("./src/application"),
      "@adapters": fromRoot("./src/adapters"),
      "@infrastructure": fromRoot("./src/infrastructure"),
      "@tests": fromRoot("./tests"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    env: { TZ: "UTC", NODE_ENV: "test" },
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: ".coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/infrastructure/aws/lambda/**",
        "src/application/ports/**",
        "src/application/dto/**",
        "src/**/index.ts",
        "src/**/*.d.ts",
        "src/**/*.test.ts",
      ],
      thresholds: { lines: 90 },
    },
  },
});
