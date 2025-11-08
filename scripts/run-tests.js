import { build } from "esbuild";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const tempDir = mkdtempSync(join(tmpdir(), "nextmind-tests-"));
const outfile = join(tempDir, "bundle.mjs");

try {
  await build({
    entryPoints: ["src/__tests__/login.test.ts"],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    sourcemap: "inline",
    target: "es2022",
    external: ["react"],
  });

  const module = await import(`file://${outfile}?${Date.now()}`);
  if (typeof module.runTests !== "function") {
    throw new Error("runTests function not found in test bundle");
  }

  await module.runTests();
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
