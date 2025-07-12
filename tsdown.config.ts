import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  external: ["@nuxt/kit", "@rspack/core", "webpack"],
});
