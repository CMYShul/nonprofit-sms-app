# Sentinel's Security Journal

This journal documents critical security learnings, vulnerability patterns, and prevention strategies identified within this codebase.

## 2025-05-15 - Standardizing Auth and Resource Protection
**Vulnerability:** Inconsistent session validation and lack of resource limits on SMS endpoints.
**Learning:** API routes were using `getServerSession()` without `authOptions`, which can lead to session resolution issues with custom providers in Next.js App Router. Additionally, sensitive operations lacked input validation and error sanitization.
**Prevention:** Always pass `authOptions` to `getServerSession` in App Router. Implement explicit limits on batch operations (e.g., recipient counts) and sanitize third-party API errors before returning them to the client.
**Context Note:** The `Contact` model currently lacks a `userId` field in the schema, meaning all contacts are currently shared. A future enhancement should add multi-tenancy support.
