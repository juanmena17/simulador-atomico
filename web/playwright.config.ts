import { defineConfig } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3600";

export default defineConfig({
  testDir: "./test",
  ...(process.env.E2E_BASE_URL ? {} : {
    webServer: {
      command: "npm run build && npm run start -- -p 3600",
      url: "http://localhost:3600",
      reuseExistingServer: true,
      timeout: 300000,
    },
  }),
  reporter: [["html"], ["list"]],
  use: {
    baseURL,
    channel: "msedge",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1920, height: 1080 },
  },
});
