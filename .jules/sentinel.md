## 2025-05-22 - Inconsistent Session Validation in Route Handlers
**Vulnerability:** API routes were calling `getServerSession()` without passing `authOptions`. In Next.js Route Handlers, this can lead to inconsistent session validation or failure to recognize valid sessions if specific providers or callbacks in `authOptions` are required for authorization.
**Learning:** NextAuth requires `authOptions` to be explicitly passed to `getServerSession` in Route Handlers (unlike in Server Components where it can sometimes be omitted if using the default configuration). Additionally, importing `authOptions` from the route handler file (`[...nextauth]/route.js`) in Next.js 16 with Turbopack causes build failures; it must be imported from a shared library file like `src/lib/auth.js`.
**Prevention:** Always pass `authOptions` to `getServerSession` in API routes. Centralize `authOptions` in `src/lib/auth.js` and ensure all routes import it from there.

## 2025-05-22 - Awaiting Dynamic Route Parameters
**Vulnerability:** Accessing `params` properties directly in Next.js 15+ Route Handlers (e.g., `const { id } = params`) without awaiting them can lead to runtime errors as `params` is now a Promise.
**Learning:** Next.js 16 enforces the Promise-based `params` and `searchParams` in dynamic routes.
**Prevention:** Always await `params` before accessing its properties in Route Handlers: `const { id } = await params;`.
