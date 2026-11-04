# Website Security Hardening & Production-Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all critical and high-severity security vulnerabilities, fix serverless persistence for versioning and rollbacks, eliminate stored XSS vectors, add HTTP security headers, and resolve all React hook violations and failing test cases in the Lotus Catalog codebase.

**Architecture:** 
1. **Authentication & Authorization:** Secure the admin perimeter with cryptographically signed sessions (HMAC-SHA256 via standard Web Crypto API) and enforce strict session validation guards on all Next.js Server Actions and the Next.js 16 proxy.
2. **Serverless Persistence:** Decouple versioning and rollback storage from local server disk writes by syncing frozen snapshots and history metadata directly to Supabase Storage.
3. **Defense in Depth & Client Reliability:** Sanitize JSON-LD structured data against script breakout XSS, enforce standard security headers (CSP, Clickjacking protection, nosniff, HSTS) in `next.config.ts`, and fix React 19 hook order violations and responsive CSS test assertions.

**Tech Stack:** Next.js 16.4.3 (Turbopack, App Router, React 19), Node.js Web Crypto API, Supabase Storage, Zod, Vitest.

**Spec:** Security Audit & Production-Readiness Review (dated 2026-11-04).

---

## Global Constraints

- **No New Heavy External Dependencies:** Use standard Web Crypto (`crypto.subtle` / `node:crypto`) for HMAC signing to avoid unvetted runtime dependencies.
- **Fail Closed:** If environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`) are missing or blank in production, fail closed with explicit errors instead of falling back to default demo credentials.
- **Backwards Compatibility:** Maintain seamless client-side experience for magazine reader, products catalog, and search.
- **Test Integrity:** All existing tests (58+ tests across 20 test files) plus newly added security tests must pass (`npm run test`).

---

## Review Focus

1. **Session Cookie Tampering:** An attacker modifies any byte of the `lotus_staff_session` cookie; the system must reject it with 401/redirect without throwing unhandled exceptions.
2. **Direct Server Action Invocations:** An unauthenticated anonymous POST request with `Next-Action` header targeting any admin action must be rejected with `{ success: false, error: 'Unauthorized' }`.
3. **Serverless Disk Write Failures (`EROFS`):** When deployed on Vercel where the local filesystem is read-only, publishing and rollbacks must succeed via Supabase Storage without relying on local filesystem state.
4. **Script Breakout in JSON-LD:** A product title containing `</script><script>alert(1)</script>` must be escaped to `\u003c/script\u003e` so browsers do not execute injected script tags.
5. **React Hook Order in Modals:** Rapidly opening, closing, or switching slots in `SlotPickerModal` must not cause "Rendered fewer hooks than expected" or trigger cascading effect loops.

---

## File Structure & Responsibilities

| File Path | Responsibility |
| :--- | :--- |
| `src/lib/auth/session.ts` | **(New)** Cryptographic HMAC-SHA256 signing, verification, and cookie serialization for staff sessions. |
| `src/features/admin/auth/actions.ts` | Login and logout server actions using signed session tokens and constant-time password comparison. |
| `src/proxy.ts` | Next.js 16 proxy middleware verifying cryptographic signatures on protected routes. |
| `src/features/admin/products/actions.ts` | Admin product mutations protected by `requireStaffSession()`. |
| `src/features/admin/composer/actions.ts` | Admin composer slot & page mutations protected by `requireStaffSession()`. |
| `src/features/admin/publish/actions.ts` | Admin release and rollback actions reading/writing snapshots directly from Supabase Storage. |
| `src/lib/seo.ts` | Centralized safe JSON-LD serialization (`safeJsonLd`) replacing raw `JSON.stringify`. |
| `src/app/(public)/products/[slug]/page.tsx` | Detail view using `safeJsonLd`. |
| `src/app/(public)/categories/[slug]/page.tsx` | Category view using `safeJsonLd`. |
| `src/app/(public)/search/page.tsx` | Search view using `safeJsonLd`. |
| `src/app/(public)/products/page.tsx` | Catalog view using `safeJsonLd`. |
| `src/app/layout.tsx` | Root layout using `safeJsonLd`. |
| `next.config.ts` | Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, `Referrer-Policy`). |
| `src/features/admin/composer/SlotPickerModal.tsx` | Unconditional hook order and immutable props handling. |
| `tests/unit/tokens.test.ts` | Updated assertion matching responsive mobile tokens in `magazine-tokens.css`. |
| `tests/unit/security-auth.test.ts` | **(New)** Unit tests for HMAC session signing, verification, and forgery rejection. |
| `tests/unit/security-actions.test.ts` | **(New)** Unit tests verifying unauthorized access rejection across all server actions. |
| `tests/unit/security-xss.test.ts` | **(New)** Unit tests verifying JSON-LD script breakout sanitization. |

---

## Implementation Tasks

### Task 1: Cryptographic HMAC Session Token Engine & Authentication Guard

**Files:**
- Create: `src/lib/auth/session.ts`
- Modify: `src/features/admin/auth/actions.ts:1-52`
- Modify: `src/proxy.ts:1-32`
- Modify: `src/app/admin/(protected)/layout.tsx:1-30`
- Test: `tests/unit/security-auth.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface StaffSession {
    email: string;
    role: 'staff';
    loggedAt: number;
  }
  export function signSession(payload: StaffSession, secret: string): Promise<string>;
  export function verifySession(token: string, secret: string): Promise<StaffSession | null>;
  export function getStaffSession(): Promise<StaffSession | null>;
  export function requireStaffSession(): Promise<StaffSession>;
  ```

- [ ] **Step 1: Write the failing unit tests for session signing and verification**

```typescript
// tests/unit/security-auth.test.ts
import { describe, it, expect } from 'vitest';
import { signSession, verifySession, StaffSession } from '@/lib/auth/session';

describe('Cryptographic Session Security', () => {
  const secret = 'super-secret-test-key-32-chars-long!!';
  const payload: StaffSession = { email: 'admin@lotus.eg', role: 'staff', loggedAt: 1700000000000 };

  it('signs and verifies a valid session token', async () => {
    const token = await signSession(payload, secret);
    expect(token).toContain('.');
    const verified = await verifySession(token, secret);
    expect(verified).toEqual(payload);
  });

  it('rejects a tampered payload or signature', async () => {
    const token = await signSession(payload, secret);
    const [body, sig] = token.split('.');
    const tamperedBody = Buffer.from(JSON.stringify({ email: 'hacker@evil.com', role: 'staff' })).toString('base64url');
    const tamperedToken = `${tamperedBody}.${sig}`;
    const result = await verifySession(tamperedToken, secret);
    expect(result).toBeNull();
  });

  it('rejects legacy raw plaintext JSON without signature', async () => {
    const rawJson = JSON.stringify(payload);
    const result = await verifySession(rawJson, secret);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/security-auth.test.ts`  
Expected: FAIL with module `@/lib/auth/session` not found.

- [ ] **Step 3: Implement `src/lib/auth/session.ts`**

Use Web Crypto API (`crypto.subtle`) to sign `{payloadBase64}.{hmacSignatureBase64}` with SHA-256. Provide `signSession`, `verifySession`, `getStaffSession`, and `requireStaffSession`. Use `process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD` (with length check >= 16 chars).

- [ ] **Step 4: Update `src/features/admin/auth/actions.ts`**

1. In `loginAction`:
   - Validate credentials using constant-time comparison or `crypto.timingSafeEqual`.
   - Disallow fallback if `ADMIN_EMAIL` or `ADMIN_PASSWORD` are unset in production.
   - Set signed cookie token via `await signSession({ email, role: 'staff', loggedAt: Date.now() })`.
2. Delegate `getStaffSession` to `src/lib/auth/session.ts`.

- [ ] **Step 5: Update `src/proxy.ts` and `AdminProtectedLayout`**

1. In `src/proxy.ts`: Extract cookie value, verify signature via `verifySession`. If invalid, redirect to `/admin/login`.
2. In `src/app/admin/(protected)/layout.tsx`: Call `await requireStaffSession()` to guarantee server-side layout safety.

- [ ] **Step 6: Run session tests to verify PASS**

Run: `npx vitest run tests/unit/security-auth.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/lib/auth/session.ts src/features/admin/auth/actions.ts src/proxy.ts src/app/admin/\(protected\)/layout.tsx tests/unit/security-auth.test.ts
git commit -m "security: implement cryptographic HMAC session authentication and proxy verification"
```

---

### Task 2: Protect Administrative Server Actions & Sanitize Cost Price

**Files:**
- Modify: `src/features/admin/products/actions.ts:1-266`
- Modify: `src/features/admin/composer/actions.ts:1-389`
- Modify: `src/features/admin/publish/actions.ts:1-155`
- Test: `tests/unit/security-actions.test.ts`

**Interfaces:**
- Consumes: `requireStaffSession` from `@/lib/auth/session`.
- Guarantees: Every exported mutation and admin query rejects unauthenticated callers.

- [ ] **Step 1: Write the failing authorization tests**

```typescript
// tests/unit/security-actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sessionModule from '@/lib/auth/session';
import { updateProductAction, getAdminProductsList } from '@/features/admin/products/actions';
import { assignProductToSlotAction } from '@/features/admin/composer/actions';
import { publishLiveIssueAction } from '@/features/admin/publish/actions';

describe('Server Action Authorization Guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects updateProductAction when no session exists', async () => {
    vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
    const result = await updateProductAction('prod-1', { name_ar: 'اختبار', sale_price: 100 });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
  });

  it('rejects getAdminProductsList when no session exists', async () => {
    vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
    await expect(getAdminProductsList()).rejects.toThrow(/غير مصرح|Unauthorized/i);
  });

  it('rejects assignProductToSlotAction when no session exists', async () => {
    vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
    const result = await assignProductToSlotAction(1, 1, 'prod-1');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
  });

  it('rejects publishLiveIssueAction when no session exists', async () => {
    vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
    const result = await publishLiveIssueAction('Release 2');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/غير مصرح|Unauthorized/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/security-actions.test.ts`  
Expected: FAIL because actions currently execute without checking sessions.

- [ ] **Step 3: Implement guards in `src/features/admin/products/actions.ts`**

Add `await requireStaffSession()` at the top of:
- `getAdminProductsList()`
- `updateProductAction()`

- [ ] **Step 4: Implement guards in `src/features/admin/composer/actions.ts`**

Add `await requireStaffSession()` at the top of:
- `assignProductToSlotAction()`
- `swapPageSlotsAction()`
- `updatePageSectionTitleAction()`

- [ ] **Step 5: Implement guards in `src/features/admin/publish/actions.ts`**

Add `await requireStaffSession()` at the top of:
- `getVersionHistoryAction()`
- `publishLiveIssueAction()`
- `rollbackToVersionAction()` (and validate that `Number.isInteger(targetVersion)` and `targetVersion > 0`).

- [ ] **Step 6: Run tests to verify PASS**

Run: `npx vitest run tests/unit/security-actions.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/features/admin/products/actions.ts src/features/admin/composer/actions.ts src/features/admin/publish/actions.ts tests/unit/security-actions.test.ts
git commit -m "security: enforce strict staff session authorization across all admin server actions"
```

---

### Task 3: Serverless Cloud Storage for Version History & Rollbacks

**Files:**
- Modify: `src/features/magazine/services/publishIssue.ts:50-168`
- Modify: `src/features/admin/publish/actions.ts:1-157`
- Test: `tests/unit/publish.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export async function saveVersionSnapshotToStorage(version: number, snapshot: IssueSnapshot): Promise<boolean>;
  export async function getVersionSnapshotFromStorage(version: number): Promise<IssueSnapshot | null>;
  export async function syncVersionHistoryToStorage(history: VersionHistoryRecord[]): Promise<boolean>;
  export async function getVersionHistoryFromStorage(): Promise<VersionHistoryRecord[]>;
  ```

- [ ] **Step 1: Write tests for cloud-based version snapshot & history storage**

Extend `tests/unit/publish.test.ts` to verify saving and fetching versions from storage without relying on local filesystem existence.

- [ ] **Step 2: Implement Storage helpers in `src/features/magazine/services/publishIssue.ts`**

1. Implement `saveVersionSnapshotToStorage(version, snapshot)`:
   PUT to `${supabaseUrl}/storage/v1/object/${bucket}/versions/version_${version}.json`.
2. Implement `getVersionSnapshotFromStorage(version)`:
   GET from `${supabaseUrl}/storage/v1/object/public/${bucket}/versions/version_${version}.json`.
3. Implement `syncVersionHistoryToStorage(history)` and `getVersionHistoryFromStorage()`.
4. Keep `safeWriteJsonFile` purely as local dev cache, never failing if `EROFS` occurs.

- [ ] **Step 3: Update `src/features/admin/publish/actions.ts`**

1. In `publishLiveIssueAction()`:
   Save snapshot to storage via `saveVersionSnapshotToStorage(nextVersion, currentIssue)`.
   Save updated history via `syncVersionHistoryToStorage(updatedHistory)`.
2. In `getVersionHistoryAction()`:
   Read from storage first; fallback to local file only in development.
3. In `rollbackToVersionAction()`:
   Retrieve snapshot using `getVersionSnapshotFromStorage(targetVersion)`.
   Sync restored snapshot to `syncLiveIssueToSupabase(targetSnapshot)`.

- [ ] **Step 4: Run tests to verify PASS**

Run: `npx vitest run tests/unit/publish.test.ts tests/unit/publish-action.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/features/magazine/services/publishIssue.ts src/features/admin/publish/actions.ts tests/unit/publish.test.ts
git commit -m "feat: persist magazine version history and snapshots directly to cloud storage for serverless compatibility"
```

---

### Task 4: Stored XSS Mitigation in Structured Data & Input Sanitization

**Files:**
- Modify: `src/lib/seo.ts:1-154`
- Modify: `src/app/(public)/products/[slug]/page.tsx:195-206`
- Modify: `src/app/(public)/categories/[slug]/page.tsx:55-65`
- Modify: `src/app/(public)/search/page.tsx:35-42`
- Modify: `src/app/(public)/products/page.tsx:55-65`
- Modify: `src/app/layout.tsx:120-132`
- Modify: `src/features/admin/products/schemas.ts:1-25`
- Test: `tests/unit/security-xss.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function safeJsonLd(data: unknown): string;
  ```

- [ ] **Step 1: Write the failing unit tests for XSS escaping**

```typescript
// tests/unit/security-xss.test.ts
import { describe, it, expect } from 'vitest';
import { safeJsonLd } from '@/lib/seo';

describe('JSON-LD XSS Prevention', () => {
  it('escapes closing script tags to prevent HTML parser breakout', () => {
    const maliciousPayload = {
      name: '</script><script>alert("XSS")</script>',
      description: 'Test <tag> & "quote"',
    };

    const serialized = safeJsonLd(maliciousPayload);
    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script\\u003e');
    expect(serialized).toContain('\\u003cscript\\u003e');
  });

  it('can be parsed back to identical JSON data in JS', () => {
    const data = { title: 'فخار قنا المميز </script>' };
    const serialized = safeJsonLd(data);
    const parsed = JSON.parse(serialized);
    expect(parsed.title).toBe('فخار قنا المميز </script>');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/security-xss.test.ts`  
Expected: FAIL (`safeJsonLd` is not exported from `@/lib/seo`).

- [ ] **Step 3: Implement `safeJsonLd` in `src/lib/seo.ts`**

```typescript
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}
```

- [ ] **Step 4: Update all 5 JSON-LD injection sites**

Replace `JSON.stringify(...)` inside `dangerouslySetInnerHTML={{ __html: ... }}` with `safeJsonLd(...)` in:
- `src/app/(public)/products/[slug]/page.tsx`
- `src/app/(public)/categories/[slug]/page.tsx`
- `src/app/(public)/search/page.tsx`
- `src/app/(public)/products/page.tsx`
- `src/app/layout.tsx`

- [ ] **Step 5: Add URL protocol validation in `src/features/admin/products/schemas.ts`**

Ensure `primary_image_url` must start with `/` or `https://` (preventing `javascript:` pseudoprotocols).

- [ ] **Step 6: Run tests to verify PASS**

Run: `npx vitest run tests/unit/security-xss.test.ts tests/unit/seo.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit Task 4**

```bash
git add src/lib/seo.ts src/app/\(public\)/products/\[slug\]/page.tsx src/app/\(public\)/categories/\[slug\]/page.tsx src/app/\(public\)/search/page.tsx src/app/\(public\)/products/page.tsx src/app/layout.tsx src/features/admin/products/schemas.ts tests/unit/security-xss.test.ts
git commit -m "security: sanitize JSON-LD against script breakout XSS and enforce image URL protocols"
```

---

### Task 5: HTTP Security Headers Configuration

**Files:**
- Modify: `next.config.ts:33-64`
- Test: `tests/unit/security-headers.test.ts`

- [ ] **Step 1: Write test to verify security headers in Next.js config**

```typescript
// tests/unit/security-headers.test.ts
import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

describe('HTTP Security Headers', () => {
  it('defines essential security headers for all routes', async () => {
    if (!nextConfig.headers) throw new Error('Headers function missing in next.config.ts');
    const headerConfigs = await nextConfig.headers();
    const globalConfig = headerConfigs.find((h: any) => h.source === '/:path*');
    expect(globalConfig).toBeDefined();

    const headersMap = new Map(globalConfig?.headers.map((h: any) => [h.key, h.value]));
    expect(headersMap.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(headersMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headersMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headersMap.get('Strict-Transport-Security')).toContain('max-age=');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/security-headers.test.ts`  
Expected: FAIL because `/:path*` security headers are missing.

- [ ] **Step 3: Update `next.config.ts`**

Add the global route `/:path*` entry in `headers()` returning:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

- [ ] **Step 4: Run test to verify PASS**

Run: `npx vitest run tests/unit/security-headers.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit Task 5**

```bash
git add next.config.ts tests/unit/security-headers.test.ts
git commit -m "security: configure standard HTTP security headers in next.config.ts"
```

---

### Task 6: React Hook Order Fix, Test Suite Alignment & Lint Resolution

**Files:**
- Modify: `src/features/admin/composer/SlotPickerModal.tsx:1-120`
- Modify: `tests/unit/tokens.test.ts:1-25`
- Test: Full Vitest suite (`npm run test`) and ESLint (`npm run lint`)

- [ ] **Step 1: Fix `SlotPickerModal.tsx` React Hook order**

Move `useState`, `useEffect`, and `useMemo` hooks above any `if (!isOpen) return null;` early returns. Do not mutate `currentSlotData` or `selectedProduct` directly; clone objects before updating.

- [ ] **Step 2: Update `tests/unit/tokens.test.ts` assertion**

Align assertion with responsive tokens in `src/styles/magazine-tokens.css`:
```typescript
expect(css).toContain('aspect-ratio: 595.5 / 980;');
expect(css).toContain('aspect-ratio: 595.5 / 842.25;');
```

- [ ] **Step 3: Run full Vitest suite to verify 100% passing**

Run: `npm run test`  
Expected: All 20+ test suites pass with 0 failures.

- [ ] **Step 4: Resolve remaining ESLint errors**

Run: `npm run lint`  
Ensure all critical React hook, unescaped entity, and TypeScript any errors are addressed or cleaned.

- [ ] **Step 5: Verify production build**

Run: `npm run build`  
Expected: Exit code 0, clean build output.

- [ ] **Step 6: Commit Task 6**

```bash
git add src/features/admin/composer/SlotPickerModal.tsx tests/unit/tokens.test.ts
git commit -m "fix(react): resolve conditional hook order in SlotPickerModal and align design token test assertions"
```

---

## Plan Self-Review Checklist

- **Spec Coverage:**
  - Finding 1 (Auth bypass) -> Task 1
  - Finding 2 (Unauthenticated server actions) -> Task 2
  - Finding 3 (Serverless EROFS persistence failure) -> Task 3
  - Finding 4 (Postgres & storage concurrency) -> Task 3
  - Finding 5 (Stored XSS) -> Task 4
  - Finding 6 (Security headers) -> Task 5
  - Finding 7 (React hook order & test failure) -> Task 6
  - Finding 8 (Credentials fallback) -> Task 1
- **Granularity & Testability:** Every step has an exact test name, exact file path, and checkable command output.
- **Dependencies & Tools:** Leverages standard Web Crypto and existing Vitest setup without introducing bloated libraries.
