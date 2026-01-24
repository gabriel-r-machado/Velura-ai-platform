# Architecture Decision Records (ADR)

## ADR-001: Next.js App Router over Vite + Express

**Date**: 2026-01-21  
**Status**: Accepted

### Context
The original architecture used Vite for the frontend and Express for the backend API, requiring two separate processes and manual CORS configuration.

### Decision
Migrate to Next.js 14+ with App Router for a unified full-stack framework.

### Consequences

**Positive:**
- Single deployment artifact (no CORS issues)
- Type safety between frontend and API routes
- Edge Runtime for faster API responses
- Automatic code splitting and optimization
- Built-in environment variable validation

**Negative:**
- Learning curve for team members unfamiliar with Next.js
- Vendor lock-in with Vercel ecosystem (mitigated by standalone output)

---

## ADR-002: Feature-Based Folder Structure

**Date**: 2026-01-21  
**Status**: Accepted

### Context
Original structure grouped files by type (components/, hooks/, utils/), making it hard to locate related code for a single feature.

### Decision
Organize code by domain feature (e.g., `features/code-generation/`).

### Consequences

**Positive:**
- Co-location of related code (hooks, services, components)
- Easier to understand feature boundaries
- Scalable for large teams (clear ownership)
- Simplifies code reviews (all changes in one folder)

**Negative:**
- Shared utilities still live in `/lib` (acceptable tradeoff)

---

## ADR-003: Zod for Runtime Validation

**Date**: 2026-01-21  
**Status**: Accepted

### Context
API endpoints lacked input validation, risking runtime errors from malformed requests.

### Decision
Use Zod for schema validation on all API routes and environment variables.

### Consequences

**Positive:**
- Type inference eliminates duplicate type definitions
- Human-readable error messages for clients
- Prevents invalid data from reaching business logic
- Compile-time safety with `@t3-oss/env-nextjs`

**Negative:**
- Slight performance overhead (negligible for API routes)

---

## ADR-004: Service Layer Pattern

**Date**: 2026-01-21  
**Status**: Accepted

### Context
Original code had `fetch` calls scattered inside React components, violating separation of concerns.

### Decision
Implement a Service Layer (`CodeGenerationService`) for all API interactions.

### Consequences

**Positive:**
- Testable in isolation (mock-free unit tests)
- Single source of truth for API endpoints
- Easy to add middleware (logging, retry logic)
- Components focus on presentation logic

**Negative:**
- Additional abstraction layer (acceptable for maintainability)

---

## ADR-005: Edge Runtime for AI API Routes

**Date**: 2026-01-21  
**Status**: Accepted

### Context
Traditional serverless functions have cold start latency (500ms+).

### Decision
Use Vercel Edge Runtime for the `/api/generate-code` route.

### Consequences

**Positive:**
- <50ms cold starts globally
- Automatic geographic distribution
- Lower compute costs

**Negative:**
- Node.js API limitations (no `fs`, `crypto` modules)
- Requires `server-only` package for sensitive operations

---

## ADR-006: Vitest over Jest

**Date**: 2026-01-21  
**Status**: Accepted

### Context
Jest requires complex configuration for ESM support in Next.js.

### Decision
Use Vitest for all unit and component tests.

### Consequences

**Positive:**
- Native ESM support (no Babel transforms)
- Faster test execution (Vite's dev server)
- Compatible with existing RTL tests

**Negative:**
- Smaller ecosystem than Jest (acceptable tradeoff)
