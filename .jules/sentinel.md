## 2025-05-22 - [NextAuth Session Inconsistency & Build Failures]
**Vulnerability:** Inconsistent session validation and Turbopack build failures due to improper `authOptions` handling.
**Learning:** Calling `getServerSession()` without `authOptions` in NextAuth v4 can lead to failures in resolving sessions correctly. Furthermore, importing `authOptions` from the route handler file (`@/app/api/auth/[...nextauth]/route`) causes Turbopack build failures in Next.js 16 ("Export authOptions doesn't exist").
**Prevention:** Always define `authOptions` in a separate library file (e.g., `@/lib/auth`) and import it from there for both the route handler and any `getServerSession(authOptions)` calls.

## 2025-05-22 - [Next.js 16 Route Handler Params Awaiting]
**Vulnerability:** Application crashes or undefined behavior when accessing dynamic route parameters.
**Learning:** In Next.js 16, the `params` object in Route Handlers and Pages is a Promise and must be awaited before accessing its properties (e.g., `const { id } = await params;`).
**Prevention:** Always `await params` in dynamic routes to ensure compatibility with Next.js 16+ asynchronous APIs.
