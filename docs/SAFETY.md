# Safety

`api-handshake-skill` is designed for planning and fixture generation before any live integration work.

## Boundaries

- No live API calls.
- No credential validation.
- No webhook registration.
- No external writes.

## Recommended Review

- Replace any real tokens with placeholders before running the CLI.
- Review generated fixtures for private identifiers.
- Treat missing checklist items as blockers for connector implementation.
