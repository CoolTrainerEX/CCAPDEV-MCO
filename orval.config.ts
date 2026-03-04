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
      schemas: "src/api/models",
      // mock: true,
      baseUrl: "/api",
      override: {
        operations: {
          readLabs: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: "page",
              options: {
                staleTime: 10000,
              },
            },
          },
          readReservationUser: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: "page",
              options: {
                staleTime: 10000,
              },
            },
          },
          readReservationLab: {
            query: {
              useInfinite: true,
              useInfiniteQueryParam: "page",
              options: {
                staleTime: 10000,
              },
            },
          },
        },
      },
    },
  },
  // Zod schema generation
  apiZod: {
    input: {
      target: "./openapi.yaml",
    },
    output: {
      mode: "tags-split",
      client: "zod",
      target: "src/api/endpoints",
      fileExtension: ".zod.ts",
    },
  },
});
