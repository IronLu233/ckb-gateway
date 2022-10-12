import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig([
  {
    input: "src/index.ts",
    plugins: [commonjs(), typescript()],
    output: {
      dir: "dist",
      format: "esm",
    },
    external: (id) => id.includes("@ckb-lumos"),
  },
]);
