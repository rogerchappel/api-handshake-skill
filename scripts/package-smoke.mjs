#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

const [packument] = JSON.parse(output);
const packedFiles = new Set(packument.files.map((file) => file.path));
const requiredFiles = new Set(["README.md", "LICENSE"]);

if (packageJson.main) {
  requiredFiles.add(packageJson.main.replace(/^\.\//, ""));
}

if (typeof packageJson.exports === "string") {
  requiredFiles.add(packageJson.exports.replace(/^\.\//, ""));
}

const binEntries =
  typeof packageJson.bin === "string"
    ? [packageJson.bin]
    : Object.values(packageJson.bin ?? {});

for (const binEntry of binEntries) {
  requiredFiles.add(binEntry.replace(/^\.\//, ""));
}

const missing = [...requiredFiles].filter((file) => !packedFiles.has(file));

if (missing.length > 0) {
  console.error(`${packageJson.name} package smoke failed; missing packed file(s):`);
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const tempDir = await mkdtemp(path.join(os.tmpdir(), `${packageJson.name}-package-smoke-`));

try {
  const packageDir = path.join(tempDir, "package");
  const consumerDir = path.join(tempDir, "consumer");
  await mkdir(packageDir);
  await mkdir(path.join(consumerDir, "specs"), { recursive: true });

  const [packedPackage] = JSON.parse(
    execFileSync("npm", ["pack", "--json", "--pack-destination", packageDir], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    }),
  );
  const tarballPath = path.join(packageDir, packedPackage.filename);

  await writeFile(
    path.join(consumerDir, "package.json"),
    `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
  );
  await writeFile(
    path.join(consumerDir, "specs", "api.md"),
    "POST /v1/example uses bearer auth and returns a JSON schema response.\n",
  );
  await writeFile(
    path.join(consumerDir, "consume.mjs"),
    `import { writeFile } from "node:fs/promises";
import { createPlan, renderPlan, writeFixtures } from "${packageJson.name}";

const plan = await createPlan("./specs", { generatedAt: "2026-01-01T00:00:00.000Z" });
const markdown = renderPlan(plan);
await writeFile("./integration-plan.md", markdown);
const fixtures = await writeFixtures("./integration-plan.md", "./fixtures");

if (!markdown.includes("API Integration Handshake Plan") || fixtures.length !== 4) {
  throw new Error("Documented library API returned unexpected results");
}
`,
  );

  execFileSync(
    "npm",
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarballPath],
    { cwd: consumerDir, stdio: "inherit" },
  );
  execFileSync(process.execPath, ["consume.mjs"], { cwd: consumerDir, stdio: "inherit" });
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log(
  `${packageJson.name} package smoke passed with ${packument.files.length} packed file(s) and a verified library import.`,
);
