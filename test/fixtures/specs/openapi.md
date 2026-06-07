# Example Payments API

Base URL: https://sandbox.example.test/v1

Authentication uses a bearer token in the Authorization header.

POST /v1/payments creates a payment.

Request schema requires `externalId`, `amount`, and `currency`.

Example response includes `id`, `status`, and `createdAt`.

Rate limit: 60 requests per minute. A 429 response should use exponential backoff.

Retry timeout and 5xx responses with idempotency keys.
