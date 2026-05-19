# Sentinel's Security Journal

This journal documents critical security learnings, vulnerability patterns, and prevention strategies identified within this codebase.

## 2025-05-15 - Standardizing Auth and Resource Protection
**Vulnerability:** Inconsistent session validation and lack of resource limits on SMS endpoints.
**Learning:** API routes were using `getServerSession()` without `authOptions`, which can lead to session resolution issues with custom providers in Next.js App Router. Additionally, sensitive operations lacked input validation and error sanitization.
**Prevention:** Always pass `authOptions` to `getServerSession` in App Router. Implement explicit limits on batch operations (e.g., recipient counts) and sanitize third-party API errors before returning them to the client.
**Context Note:** The `Contact` model currently lacks a `userId` field in the schema, meaning all contacts are currently shared. A future enhancement should add multi-tenancy support.

## 2025-05-15 - Log Injection and PII Leakage
**Vulnerability:** Logging user-provided data (phone numbers) in error messages.
**Learning:** Including unsanitized user input in logs can lead to log injection attacks and leaks PII (Personally Identifiable Information) into system logs, which may have different retention and access policies.
**Prevention:** Avoid logging sensitive user data or unvalidated input. Use generic descriptors in logs for error context and keep detailed PII out of application logs.
