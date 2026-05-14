# Sentinel's Journal

## 2025-05-15 - [Authentication Bypass via Missing Config]
**Vulnerability:** API routes were calling `getServerSession()` without providing `authOptions`, leading to potentially failed session validation in Next.js Route Handlers.
**Learning:** In Next.js App Router, `getServerSession` requires the same configuration object used in the Auth route to correctly identify the session and JWT.
**Prevention:** Always import `authOptions` and pass it to `getServerSession` in all Route Handlers.

## 2025-05-15 - [Information Leakage and Resource Exhaustion in SMS API]
**Vulnerability:** The SMS sending endpoint was returning raw Twilio error messages and lacked limits on the number of recipients and message length.
**Learning:** Exposing third-party API errors can leak infrastructure details. Lack of limits can lead to DoS or unexpected costs.
**Prevention:** Sanitize external API errors and enforce strict input length/count validation (e.g., 50 recipients, 1000 characters).
