# Webhooks

Webhook event `payment.updated` is sent to the callback URL.

Each event includes an `x-example-signature` header.

Acceptance criteria: connector stores remote id and handles duplicate events.
