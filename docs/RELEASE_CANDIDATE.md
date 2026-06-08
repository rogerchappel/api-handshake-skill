# Release Candidate Notes

## Classification

Ship.

## Included

- Local-first API integration planning CLI.
- Checklist coverage for auth, endpoints, schemas, webhooks, retries, rate limits, environments, and acceptance tests.
- Mock request, response, webhook, and acceptance fixture generation.
- Fixture-backed tests and smoke command.

## Verification

```bash
npm test
npm run check
npm run smoke
bash scripts/validate.sh
```

All commands passed locally on 2026-06-08.

## Known Limits

- V1 uses text-signal extraction instead of full OpenAPI validation.
- Generated fixtures are starter mocks and should be reviewed before connector tests use them.
- Live API calls are intentionally out of scope.
