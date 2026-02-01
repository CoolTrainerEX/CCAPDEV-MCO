import { defineConfig } from "orval";

export default defineConfig({
  // HTTP client generation
  api: {
    input: {
      target: "./openapi.yaml",
    },
    output: {
      mode: "tags-split",
      client: "react-query",
      target: "src/api/endpoints",
      schemas: { path: "src/api/models", type: "zod" },
      mock: true,
      baseUrl: "/api",
      override: {
        fetch: {
          runtimeValidation: true,
        },
      },
    },
  },
});
