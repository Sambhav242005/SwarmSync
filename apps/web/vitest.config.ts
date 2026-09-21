import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["lib/sim/**/*.test.ts", "app/api/**/*.test.ts"] } });
