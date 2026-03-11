import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const mode = process.argv.includes("--dev") ? "--dev" : "--release";
const env = {
  ...process.env,
  PATH: ["/opt/homebrew/opt/rustup/bin", process.env.PATH]
    .filter(Boolean)
    .join(":"),
  RUSTUP_TOOLCHAIN: process.env.RUSTUP_TOOLCHAIN ?? "stable",
};
const targets = [
  ["vanity-evm", "evm"],
  ["vanity-solana", "solana"],
  ["vanity-bitcoin", "bitcoin"],
  ["vanity-ton", "ton"],
  ["vanity-substrate", "substrate"],
];

for (const [crateName, outputName] of targets) {
  const crateDir = resolve(root, "rust", crateName);
  const outDir = resolve(root, "src", "generated", "wasm", outputName);

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const result = spawnSync(
    "wasm-pack",
    [
      "build",
      crateDir,
      "--target",
      "web",
      mode,
      "--out-dir",
      outDir,
      "--out-name",
      "index",
    ],
    {
      cwd: root,
      env,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
