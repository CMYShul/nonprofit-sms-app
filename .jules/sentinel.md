## 2025-05-14 - Information Leakage in Third-Party API Responses
**Vulnerability:** Raw error messages from the Twilio API were being returned directly to the client in the `/api/send-sms` endpoint.
**Learning:** Developers often pass through catch-block errors for debugging convenience, but third-party SDKs can include sensitive configuration details, account identifiers, or internal stack traces in their error objects.
**Prevention:** Always sanitize error responses from external services. Log the full error internally for observability, but return generic, safe messages to the client.
