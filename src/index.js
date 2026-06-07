import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CHECKS = [
  ["auth", /\b(auth|oauth|api key|bearer|token|credential)\b/i, "Authentication model"],
  ["endpoints", /\b(GET|POST|PUT|PATCH|DELETE)\s+\/|\/v\d+\/|endpoint/i, "Endpoint inventory"],
  ["schemas", /\b(schema|json schema|properties|required|example response)\b/i, "Request and response schemas"],
  ["webhooks", /\b(webhook|event|callback|signature)\b/i, "Webhook events and signatures"],
  ["retries", /\b(retry|idempotency|timeout|backoff)\b/i, "Retry and idempotency policy"],
  ["rateLimits", /\b(rate limit|quota|429|throttle)\b/i, "Rate limits"],
  ["environments", /\b(sandbox|production|environment|base url)\b/i, "Environment map"],
  ["acceptance", /\b(acceptance|test plan|done when|success criteria)\b/i, "Acceptance checks"]
];

export async function createPlan(inputPath, options = {}) {
  const sources = await readSources(inputPath);
  const combined = sources.map((source) => source.contents).join("\n\n");
  const checks = CHECKS.map(([key, pattern, label]) => ({
    key,
    label,
    status: pattern.test(combined) ? "covered" : "missing",
    evidence: evidenceFor(pattern, sources)
  }));

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    inputPath: path.resolve(inputPath),
    sources: sources.map(({ filePath, contents }) => ({
      filePath,
      bytes: Buffer.byteLength(contents)
    })),
    checks,
    missing: checks.filter((check) => check.status === "missing").map((check) => check.key)
  };
}

export function renderPlan(plan) {
  const lines = [
    "# API Integration Handshake Plan",
    "",
    `Generated: ${plan.generatedAt}`,
    `Input: ${plan.inputPath}`,
    "",
    "## Source Files",
    ""
  ];

  for (const source of plan.sources) {
    lines.push(`- ${source.filePath} (${source.bytes} bytes)`);
  }

  lines.push("", "## Checklist", "");
  for (const check of plan.checks) {
    lines.push(`- [${check.status === "covered" ? "x" : " "}] ${check.label} (${check.key})`);
    if (check.evidence.length) {
      for (const item of check.evidence.slice(0, 2)) lines.push(`  - Evidence: ${item}`);
    }
  }

  lines.push("", "## Acceptance Test Plan", "");
  lines.push("- Confirm auth failure and success paths are documented.");
  lines.push("- Validate at least one request and response fixture per write endpoint.");
  lines.push("- Validate webhook signature and replay behavior when webhooks are in scope.");
  lines.push("- Confirm retry behavior for timeout, 429, and 5xx responses.");

  lines.push("", "## Safety Notes", "");
  lines.push("- Do not use production credentials in generated fixtures.");
  lines.push("- Treat missing checklist items as blockers before live integration work.");
  lines.push("- Make live API calls only after explicit approval.");

  return `${lines.join("\n").trim()}\n`;
}

export async function writeFixtures(planMarkdownPath, outDir) {
  const planText = await readFile(planMarkdownPath, "utf8");
  await mkdir(outDir, { recursive: true });
  const missing = [...planText.matchAll(/\[ \]\s+(.+?)\s+\((.+?)\)/g)].map((match) => match[2]);
  const fixtures = {
    "request.json": {
      method: "POST",
      path: "/v1/example",
      headers: { authorization: "Bearer ${API_TOKEN}", "content-type": "application/json" },
      body: { externalId: "example-123", dryRun: true }
    },
    "response.json": {
      status: 200,
      body: { id: "remote-123", status: "accepted" }
    },
    "webhook-event.json": {
      event: "example.updated",
      id: "evt_example",
      signatureHeader: "x-example-signature",
      body: { id: "remote-123", status: "accepted" }
    },
    "acceptance-checklist.json": {
      generatedFrom: path.resolve(planMarkdownPath),
      missing,
      checks: [
        "auth success and failure",
        "request schema validation",
        "response schema validation",
        "webhook signature verification",
        "retry and idempotency behavior"
      ]
    }
  };

  for (const [fileName, data] of Object.entries(fixtures)) {
    await writeFile(path.join(outDir, fileName), `${JSON.stringify(data, null, 2)}\n`);
  }

  return Object.keys(fixtures).map((fileName) => path.join(outDir, fileName));
}

async function readSources(inputPath) {
  const absolute = path.resolve(inputPath);
  const stats = await readdir(absolute, { withFileTypes: true }).catch(async (error) => {
    if (error.code !== "ENOTDIR") throw error;
    return null;
  });

  if (!stats) {
    return [{ filePath: absolute, contents: await readFile(absolute, "utf8") }];
  }

  const sources = [];
  for (const entry of stats) {
    if (!entry.isFile()) continue;
    if (!/\.(md|txt|json|ya?ml)$/i.test(entry.name)) continue;
    const filePath = path.join(absolute, entry.name);
    sources.push({ filePath, contents: await readFile(filePath, "utf8") });
  }
  sources.sort((left, right) => left.filePath.localeCompare(right.filePath));
  return sources;
}

function evidenceFor(pattern, sources) {
  const evidence = [];
  for (const source of sources) {
    const line = source.contents.split(/\r?\n/).find((candidate) => pattern.test(candidate));
    if (line) evidence.push(`${path.basename(source.filePath)}: ${line.trim().slice(0, 120)}`);
  }
  return evidence;
}
