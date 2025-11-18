# Cohera Architecture Design

**Date:** 2025-11-11
**Issue:** COH-10 - Write architecture overview: Frontend, Backend, Database
**Status:** Approved

## Overview

Cohera is a library of building blocks for community platforms, designed for communities of 20-200 people. The architecture enables developers to compose pre-built modules (Posts, Events, Profiles, etc.) while maintaining the flexibility to use each layer independently or customize them deeply.

## Design Principles

1. **Loosely coupled modules**: Each module bundles frontend, backend, and data layers but exposes clean APIs for independent use
2. **Independent layer usage**: Developers can use just the backend API, just the UI components, or the complete module
3. **Type safety**: End-to-end type safety via tRPC
4. **Monolithic deployment**: Optimized for simple deployment (SvelteKit app + Postgres) at community scale
5. **Federation ready**: Optional ActivityPub federation via core layer

## Technology Stack

- **Frontend Framework**: SvelteKit
- **UI Components**: Svelte
- **Backend**: tRPC routers
- **Database**: PostgreSQL (via Drizzle ORM)
- **Type Safety**: TypeScript + tRPC inference
- **Federation**: ActivityPub (optional)

## Package Structure

Each Cohera module is published as a single npm package (e.g., `@cohera/posts`) with structured exports:

```
@cohera/posts/
├── api       # tRPC routers and procedures (backend)
├── ui        # Svelte components (frontend)
├── db        # Drizzle schemas and migrations (data)
└── types     # Shared TypeScript types (used by all layers)
```

### Export Structure

```typescript
// Backend: Add to tRPC app router
import { postsRouter } from "@cohera/posts/api";

// Frontend: Render post UI
import { PostCard, PostList } from "@cohera/posts/ui";

// Database: Access schemas
import { posts } from "@cohera/posts/db";

// Types: Shared type definitions
import type { Post, NewPost } from "@cohera/posts/types";
```

### Benefits

- **Single package version**: Simpler dependency management per module
- **Tree-shakeable**: Vite only bundles imported code
- **Clear separation**: Each export path serves a distinct purpose
- **Independence**: Can use `/api` without `/ui`, or vice versa

## Backend Layer (API)

### Architecture

The `/api` export provides tRPC routers that handle business logic and data access:

```typescript
// Inside @cohera/posts/api
export const postsRouter = t.router({
  list: t.procedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      // Uses Drizzle to query Postgres
      return ctx.db
        .select()
        .from(posts)
        .limit(input.limit ?? 10);
    }),

  create: t.procedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Business logic + federation hooks
      const post = await ctx.db.insert(posts).values(input).returning();
      await ctx.federation?.announce(post); // Optional federation
      return post;
    }),
});
```

### Characteristics

- Each module provides its own tRPC router
- Routers compose into the main app's tRPC router
- Database access via Drizzle ORM (Postgres only)
- Context includes `db` (Drizzle instance) and optional `federation` service
- Federation integration points built into procedures

### Independence

- Developers can use only the `/api` router in a pure API backend
- Can skip Cohera's API entirely and build custom backend while using UI components
- Type definitions automatically inferred and available to frontend

## Frontend Layer (UI)

### Architecture

The `/ui` export provides Svelte components that work with tRPC clients:

```svelte
<!-- Inside @cohera/posts/ui/PostCard.svelte -->
<script lang="ts">
  import type { Post } from "@cohera/posts/types";

  export let post: Post;
  export let onDelete: ((id: string) => void) | undefined = undefined;
</script>

<article class="post-card">
  <h3>{post.title}</h3>
  <p>{post.content}</p>
  {#if onDelete}
    <button on:click={() => onDelete(post.id)}>Delete</button>
  {/if}
</article>

<style>
  .post-card {
    border: 1px solid var(--cohera-border-color, #ccc);
    padding: var(--cohera-spacing, 1rem);
  }
</style>
```

### Characteristics

- Components are presentation-focused (receive data as props)
- Don't directly call tRPC - parent page/component handles data fetching
- Type-safe props using shared types from `/types` export
- Styled with CSS variables for easy theming/customization
- Can be used with or without Cohera's backend (just pass the right data shape)

### Developer Usage

```svelte
<script lang="ts">
  import { PostCard } from "@cohera/posts/ui";
  import { trpc } from "$lib/trpc"; // Developer's tRPC client

  const posts = trpc.posts.list.query({ limit: 10 });
</script>

{#each $posts.data ?? [] as post}
  <PostCard {post} />
{/each}
```

## Database Layer (DB)

### Architecture

The `/db` export provides Drizzle schemas and migrations for Postgres:

```typescript
// Inside @cohera/posts/db/schema.ts
import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: uuid("author_id").notNull(),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 }).$onUpdate(
    () => new Date(),
  ),

  // Federation fields (optional, used if federation enabled)
  activityPubId: text("activitypub_id"),
  federated: boolean("federated").default(false),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### Characteristics

- Each module exports its own Drizzle table schemas
- Schemas include optional federation fields (used by `@cohera/federation` if enabled)
- Types inferred from schemas (exported via `/types`)
- Migrations bundled with each module
- Developer runs all module migrations together

### Developer Setup

```typescript
// In developer's SvelteKit app: src/lib/server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { posts } from "@cohera/posts/db";
import { events } from "@cohera/events/db";
import { profiles } from "@cohera/profiles/db";

export const db = drizzle(postgres(DATABASE_URL), {
  schema: { posts, events, profiles }, // Combine all module schemas
});
```

## Federation Layer

### Architecture

The `@cohera/federation` package provides a core ActivityPub implementation that modules opt into:

```typescript
// Inside @cohera/federation/core
export class FederationService {
  constructor(private config: FederationConfig) {}

  // Called by module routers when creating federated content
  async announce(activity: Activity): Promise<void> {
    if (!this.config.enabled) return;

    // Convert to ActivityPub format
    const apActivity = this.toActivityPub(activity);

    // Send to followers' inboxes
    await this.deliverToInboxes(apActivity);
  }

  // Handle incoming federated activities
  async handleInbox(activity: ActivityPubActivity): Promise<void> {
    // Validate, route to appropriate module handler
  }
}
```

### Characteristics

- Single `@cohera/federation` package used by all modules
- Modules register handlers for their activity types (Create Post, Create Event, etc.)
- Federation is optional - passes through `ctx.federation` in tRPC context
- When enabled, modules call `ctx.federation.announce()` after creating content
- Handles ActivityPub protocol details (signing, delivery, inbox processing)

### Module Integration

```typescript
// In @cohera/posts/api
create: t.procedure
  .input(z.object({ title: z.string(), content: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const post = await ctx.db.insert(posts).values(input).returning();

    // Federation hook - only runs if federation enabled
    await ctx.federation?.announce({
      type: "Create",
      object: { type: "Note", ...post },
    });

    return post;
  });
```

### Benefits

- Centralized ActivityPub logic (no duplication across modules)
- Optional at runtime (federation can be disabled without changing code)
- Modules stay decoupled from federation implementation details

## Integration & Deployment

### Developer Workflow

**1. Installation:**

```bash
npm install @cohera/posts @cohera/events @cohera/profiles @cohera/federation
```

**2. Backend setup (src/lib/server/trpc.ts):**

```typescript
import { initTRPC } from "@trpc/server";
import { drizzle } from "drizzle-orm/postgres-js";
import { posts } from "@cohera/posts/db";
import { events } from "@cohera/events/db";
import { postsRouter } from "@cohera/posts/api";
import { eventsRouter } from "@cohera/events/api";
import { FederationService } from "@cohera/federation";

// Setup database
const db = drizzle(postgres(DATABASE_URL), {
  schema: { posts, events },
});

// Optional: setup federation
const federation = new FederationService({
  enabled: true,
  domain: "community.example",
});

// Create tRPC context
const t = initTRPC
  .context<{
    db: typeof db;
    federation: FederationService;
  }>()
  .create();

// Compose routers
export const appRouter = t.router({
  posts: postsRouter,
  events: eventsRouter,
});
```

**3. Frontend usage (src/routes/+page.svelte):**

```svelte
<script lang="ts">
  import { PostCard } from "@cohera/posts/ui";
  import { EventCard } from "@cohera/events/ui";
  import { trpc } from "$lib/trpc";

  const posts = trpc.posts.list.query();
</script>

{#each $posts.data ?? [] as post}
  <PostCard {post} />
{/each}
```

**4. Deployment:**

- Single SvelteKit app with all modules bundled
- Database: Single Postgres instance with all module tables
- Runs on any SvelteKit-compatible platform (Vercel, Netlify, self-hosted)
- Optional: Enable federation by configuring `@cohera/federation`

### Benefits

- **Monolithic deployment**: Simple for 20-200 user communities
- **Modular code**: Only import what you need
- **Independent layers**: Can swap frontend, backend, or data
- **Type-safe end-to-end**: Via tRPC
- **Federation ready**: But optional

## Decision Log

### Why single package per module with exports?

**Alternatives considered:**

1. Monorepo with subpackages (@cohera/posts-api, @cohera/posts-ui, @cohera/posts-db)
2. Layered monorepo (@cohera/api, @cohera/ui, @cohera/db)

**Decision:** Single package with exports

**Rationale:**

- Simpler dependency management (one version per module)
- Tree-shakeable (Vite only bundles what's imported)
- Better developer experience (clear `/api`, `/ui`, `/db` paths)
- Still achieves layer independence through exports

### Why tRPC for type safety?

**Alternatives considered:**

1. Shared schema package (@cohera/schemas)
2. Per-layer schemas with OpenAPI contracts
3. Backend-defined with codegen

**Decision:** tRPC with end-to-end inference

**Rationale:**

- Zero-cost abstraction (types at compile time only)
- Automatic type inference (no codegen step)
- SvelteKit-native integration
- Excellent DX for monolithic deployment model

### Why Drizzle ORM?

**Alternatives considered:**

1. Repository interfaces (developer implements)
2. Storage adapters (multiple DB support)

**Decision:** Include Drizzle ORM, Postgres only

**Rationale:**

- Complete solution out of the box
- Type inference aligns with tRPC approach
- Postgres is sufficient for target scale (20-200 users)
- Can add adapters later if needed (YAGNI for now)

### Why monolithic deployment?

**Alternatives considered:**

1. Separate services (frontend static, backend API)
2. Support both patterns

**Decision:** Optimized for monolithic

**Rationale:**

- Matches target scale (20-200 users)
- Simpler operations for small organizations
- SvelteKit handles this pattern excellently
- Architecture doesn't prevent separation if needed later

### Why core federation layer?

**Alternatives considered:**

1. Per-module federation (each module handles own ActivityPub)
2. Backend-only concern (frontend unaware)

**Decision:** Core `@cohera/federation` package

**Rationale:**

- Avoids duplicating ActivityPub logic across modules
- Ensures consistent federation behavior
- Modules stay simple (just call `ctx.federation.announce()`)
- Optional at runtime (can disable without code changes)
