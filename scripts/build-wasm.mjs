import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
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
const generatedArtifacts = [
  "index.js",
  "index.d.ts",
  "index_bg.wasm",
  "index_bg.wasm.d.ts",
  "package.json",
];

function hasCommand(command) {
  const result = spawnSync(command, ["--version"], {
    cwd: root,
    env,
    stdio: "ignore",
  });

  return result.status === 0;
}

function hasGeneratedArtifacts(outputName) {
  const outDir = resolve(root, "src", "generated", "wasm", outputName);

  return generatedArtifacts.every((fileName) =>
    existsSync(resolve(outDir, fileName)),
  );
}

function printFallbackUsage(outputName) {
  process.stdout.write(
    `[wasm] ${outputName}: using committed generated artifacts because wasm-pack is unavailable.\n`,
  );
}

const canBuildWasm = hasCommand("wasm-pack");

for (const [crateName, outputName] of targets) {
  const outDir = resolve(root, "src", "generated", "wasm", outputName);

  if (!canBuildWasm) {
    if (!hasGeneratedArtifacts(outputName)) {
      process.stderr.write(
        `[wasm] ${outputName}: missing generated artifacts and wasm-pack is unavailable.\n`,
      );
      process.stderr.write(
        "[wasm] Run `bun run wasm:build` in a Rust-enabled environment and commit `src/generated/wasm`.\n",
      );
      process.exit(1);
    }

    printFallbackUsage(outputName);
    continue;
  }

  const crateDir = resolve(root, "rust", crateName);

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

  rmSync(resolve(outDir, ".gitignore"), { force: true });
}
