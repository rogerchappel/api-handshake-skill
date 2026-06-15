# api-handshake-skill

Plan API integration handshakes before writing connector code. The CLI reads local specs and notes, generates a Markdown plan with coverage gaps, then creates starter fixtures for contract and acceptance tests.

## Quickstart

```bash
npm install
npm run smoke
node bin/api-handshake-skill.js plan examples/specs --out tmp/integration-plan.md
node bin/api-handshake-skill.js fixtures tmp/integration-plan.md --out tmp/fixtures
```

## Commands

```bash
api-handshake-skill plan specs/ --out integration-plan.md
api-handshake-skill fixtures integration-plan.md --out fixtures/
```

## What The Plan Checks

- Authentication model.
- Endpoint inventory.
- Request and response schemas.
- Webhook events and signatures.
- Retry and idempotency policy.
- Rate limits.
- Sandbox and production environment map.
- Acceptance checks.

## Library API

```js
import { createPlan, renderPlan, writeFixtures } from "api-handshake-skill";

const plan = await createPlan("./specs");
console.log(renderPlan(plan));
await writeFixtures("./integration-plan.md", "./fixtures");
```

## Safety Notes

This project is offline by default. It does not call APIs, validate credentials, register webhooks, or send generated fixtures externally. Keep production credentials out of specs and generated examples.

## Limitations

- V1 detects signals in local text and spec files; it is not a full OpenAPI validator.
- Fixtures are starter mocks, not a substitute for provider-approved contract tests.
- Missing checklist items should be treated as integration planning gaps.

## Verification

```bash
npm test
npm run check
npm run smoke
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
