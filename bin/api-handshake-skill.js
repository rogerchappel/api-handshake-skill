#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pkg from "../package.json" with { type: "json" };
import { createPlan, renderPlan, writeFixtures } from "../src/index.js";

async function main(argv) {
  if (argv.includes("--version") || argv.includes("-v")) {
    console.log(pkg.version);
    return;
  }

  const { command, positionals, flags } = parseArgs(argv);
  if (!command || flags.help) return printHelp();

  if (command === "plan") {
    const input = positionals[0];
    if (!input) throw new CliError("plan requires an input file or directory", 2);
    const rendered = renderPlan(await createPlan(input));
    if (flags.out) {
      await mkdir(path.dirname(path.resolve(flags.out)), { recursive: true });
      await writeFile(flags.out, rendered);
    } else {
      process.stdout.write(rendered);
    }
    return;
  }

  if (command === "fixtures") {
    const planPath = positionals[0];
    if (!planPath) throw new CliError("fixtures requires a plan path", 2);
    const outDir = flags.out ?? "fixtures";
    const files = await writeFixtures(planPath, outDir);
    process.stdout.write(files.map((file) => `wrote ${file}`).join("\n") + "\n");
    return;
  }

  throw new CliError(`Unknown command: ${command}`, 2);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const flags = {};
  const positionals = [];
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === "--help" || value === "-h") flags.help = true;
    else if (value === "--out") flags.out = requireValue(rest, index += 1, "--out");
    else if (value.startsWith("--")) throw new CliError(`Unknown option: ${value}`, 2);
    else positionals.push(value);
  }
  return { command, positionals, flags };
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new CliError(`${flag} requires a value`, 2);
  return value;
}

function printHelp() {
  process.stdout.write(`api-handshake-skill

Usage:
  api-handshake-skill plan <spec-file-or-dir> --out integration-plan.md
  api-handshake-skill fixtures <integration-plan.md> --out fixtures/

Commands:
  plan       Generate a local API integration handshake plan.
  fixtures   Generate mock request, response, webhook, and acceptance fixtures.

Options:
  --version  Show the package version.
`);
}

class CliError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

main(process.argv.slice(2)).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = error.code ?? 1;
});
