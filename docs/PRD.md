# PRD: api-handshake-skill

## Status

Release candidate.

## Problem

API integrations often fail because auth, endpoints, webhooks, schemas, retries, environments, and acceptance checks are left implicit. Agents need a local planning skill that turns source notes and specs into a concrete integration handshake before code is written.

## Users

- Agents preparing connector work.
- Developers scoping third-party API integrations.
- Reviewers checking whether an integration plan is testable.

## V1 Scope

- Ingest local OpenAPI, JSON, Markdown, and text notes.
- Generate a Markdown integration plan.
- Highlight auth, endpoint, webhook, schema, retry, rate-limit, and acceptance-test gaps.
- Generate mock request, response, webhook, and acceptance fixtures from a plan.

## Non-Goals

- Live API calls by default.
- Secret storage.
- Webhook registration or external writes.
- Full OpenAPI validation.

## Success Criteria

- CLI works offline against fixtures.
- Tests cover signal extraction, gap detection, and fixture generation.
- Docs make side-effect boundaries and approval requirements explicit.
