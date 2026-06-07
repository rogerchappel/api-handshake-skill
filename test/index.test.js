import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createPlan, renderPlan, writeFixtures } from "../src/index.js";

test("creates checklist plan from local source files", async () => {
  const plan = await createPlan("test/fixtures/specs", {
    generatedAt: "2026-06-08T00:00:00.000Z"
  });

  assert.equal(plan.sources.length, 3);
  assert.equal(plan.checks.find((check) => check.key === "auth").status, "covered");
  assert.equal(plan.checks.find((check) => check.key === "webhooks").status, "covered");
  assert.ok(plan.missing.includes("environments") === false);
});

test("renders plan with checklist and safety notes", async () => {
  const plan = await createPlan("test/fixtures/specs", {
    generatedAt: "2026-06-08T00:00:00.000Z"
  });
  const markdown = renderPlan(plan);

  assert.match(markdown, /# API Integration Handshake Plan/);
  assert.match(markdown, /Authentication model/);
  assert.match(markdown, /Do not use production credentials/);
});

test("writes mock fixtures from a plan", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "api-handshake-skill-"));
  try {
    const planPath = path.join(dir, "plan.md");
    const outDir = path.join(dir, "fixtures");
    const plan = renderPlan(await createPlan("test/fixtures/specs"));
    await import("node:fs/promises").then(({ writeFile }) => writeFile(planPath, plan));

    const files = await writeFixtures(planPath, outDir);
    assert.equal(files.length, 4);
    const request = JSON.parse(await readFile(path.join(outDir, "request.json"), "utf8"));
    assert.equal(request.method, "POST");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
