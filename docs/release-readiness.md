# Release Readiness

Use this checklist before publishing, tagging, or asking reviewers to trust the package surface.

## Package Surface

- Package: `api-handshake-skill`
- Repository: `https://github.com/rogerchappel/api-handshake-skill`
- Pack contents are constrained by the `files` allowlist in `package.json`.

## CLI Surface

- `api-handshake-skill` -> `./bin/api-handshake-skill.js`

## Verification Commands

- `npm run check`: `node --check src/index.js && node --check bin/api-handshake-skill.js`
- `npm run test`: `node --test`
- `npm run build`: `npm run check`
- `npm run smoke`: `rm -rf tmp && node bin/api-handshake-skill.js plan test/fixtures/specs --out tmp/integration-plan.md && node bin/api-handshake-skill.js fixtures tmp/integration-plan.md --out tmp/fixtures && test -s tmp/fixtures/request.json && test -s tmp/fixtures/response.json`
- `npm run package:smoke`: `npm pack --dry-run`
- `npm run release:check`: `npm run check && npm test && npm run smoke && npm run package:smoke`

Run `npm run release:check` before opening a release PR. Record any skipped command and the reason in the PR body.

## Reviewer Notes

- Compare README examples with the current CLI bins or module exports.
- Inspect `npm pack --dry-run` output for generated logs, caches, or private fixtures.
- Confirm CI exercises the same release check path used locally.
