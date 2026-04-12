import { defineConfig } from "tsdown";
import pkg from "../../package.json" with { type: "json" };

export default defineConfig({
  entry: "index.ts",
  outputOptions: {
    file: "../../dist/bin.mjs",
  },
  format: "esm",
  platform: "node",
  shims: true,
  dts: false,
  clean: false,
  deps: {
    neverBundle: ["cngpac"],
  },
  env: {
    VERSION: pkg.version,
  },
});
