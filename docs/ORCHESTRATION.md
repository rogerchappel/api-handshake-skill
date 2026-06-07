# Orchestration

## Agent Flow

1. Gather local API notes, OpenAPI snippets, schema files, webhook docs, and acceptance criteria.
2. Run `api-handshake-skill plan specs/ --out integration-plan.md`.
3. Review missing sections and approval notes.
4. Run `api-handshake-skill fixtures integration-plan.md --out fixtures/`.
5. Use the fixtures as the starting point for connector tests.

## Inputs

- Local Markdown, text, JSON, YAML, or OpenAPI-like files.
- No credentials are required.

## Outputs

- Markdown integration plan.
- Mock JSON request, response, webhook event, and acceptance checklist fixtures.

## Side Effects

- Writes only explicit output paths.
- Does not call live APIs.
- Does not register webhooks, rotate keys, or send data externally.

## Verification

Run:

```bash
npm test
npm run check
npm run smoke
```
