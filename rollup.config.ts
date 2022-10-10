import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig([
  {
    input: "src/main.ts",
    plugins: [commonjs(), typescript()],
    output: {
      dir: "dist",
      format: "umd",
      name: "ckbGateway",
    },
    external: (id) => id.includes("@ckb-lumos"),
  },
  {
    input: "src/client.ts",
    plugins: [typescript()],
    output: [
      {
        dir: "dist",
        format: "esm",
      },
      //   {
      //     dir: "dist/cjs",
      //     format: "cjs",
      //   },
    ],
    external: (id) => id.includes("@ckb-lumos"),
  },
]);
