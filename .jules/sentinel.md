## 2025-05-22 - [Harden SMS API & Authentication]
**Vulnerability:** The SMS API lacked input validation and leaked raw Twilio error messages. Additionally, multiple API routes used `getServerSession()` without `authOptions`, which could lead to inconsistent session handling.
**Learning:** Raw error messages from third-party APIs can leak sensitive system details. Input validation (rate limiting recipients and message length) is critical for preventing resource abuse and cost-related attacks.
**Prevention:** Always provide `authOptions` to `getServerSession` in Next.js projects. Sanitize all third-party API errors before returning them to the client.
