## 2025-05-15 - [Authentication Bypass in API Routes]
**Vulnerability:** NextAuth `getServerSession()` called without `authOptions` in the App Router.
**Learning:** In Next.js App Router, `getServerSession()` requires `authOptions` to correctly identify the user session. When omitted, it may return `null` even for authenticated users, or fail to validate the session against the configured secret and providers, leading to unpredictable authentication behavior.
**Prevention:** Always pass `authOptions` (imported from a central library file) to `getServerSession(authOptions)` in all API route handlers.

## 2025-05-15 - [Next.js 16 Params as Promises]
**Vulnerability:** Accessing `params.id` directly in Route Handlers.
**Learning:** In Next.js 16, `params` in Route Handlers is a Promise. Accessing properties directly results in `undefined`.
**Prevention:** Always await `params` before accessing its properties: `const { id } = await params;`.
