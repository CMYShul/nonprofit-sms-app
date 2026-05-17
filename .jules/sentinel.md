## 2025-05-15 - [IDOR Protection via Ownership Enforcement]
**Vulnerability:** Insecure Direct Object Reference (IDOR) where authenticated users could access, modify, or delete contacts belonging to other users.
**Learning:** Enforcing ownership in Prisma requires careful use of `where` clauses. Specifically, `update` and `delete` methods only accept unique filters.
**Prevention:** Use `updateMany` and `deleteMany` with a combined `id` and `userId` filter to enforce ownership, then verify the operation by checking the `count` of affected records.
