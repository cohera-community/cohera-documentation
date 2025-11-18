# Posts Module Documentation Enhancements

**Date:** 2025-11-10
**Status:** Approved
**Author:** Bot & Jonas

## Overview

Enhance the Posts module documentation to include visual examples, routing information, user mentions, and configurable emoji reactions. These additions will help users understand the complete feature set and see what they're building.

## Goals

1. Show visual examples of posts and comments through live UI components
2. Document how routes are generated for posts
3. Explain user mention functionality with `@username` syntax
4. Document configurable emoji reactions per category

## Design Decisions

### 1. Documentation Structure

**Approach:** Integrated approach - weave new content into existing sections rather than creating separate sections.

**Rationale:**

- Maintains natural reading flow
- Information appears where users need it
- Avoids documentation becoming too segmented

**Implementation:**

- Quick Start section: Add routing info and basic visual example
- Configuration section: Add reactions config and mention capability docs
- Examples section: Enhance with reactions and visual components

### 2. Reactions Configuration

**Design:**

```js
categories: [
  {
    id: "category-id",
    name: "Category Name",
    reactions: ["👍", "❤️", "🎉", "👀"],  // Optional array of emoji
    fields: [...]
  }
]
```

**Key points:**

- Per-category configuration (different categories can have different reactions)
- Simple emoji string array
- Optional - omit or use empty array to disable
- Reactions count toward "popular" and "trending" sort algorithms (mentioned briefly)

**Common defaults to show:**

- General purpose: `["👍", "❤️", "😄", "🎉", "🚀", "👀"]`
- Context-specific examples in each use case (music: 🔥🎵💯, photos: ❤️📸✨)

### 3. User Mentions

**Design:**

- Available in `longText` and `richText` field types only
- No configuration needed - automatic feature
- Syntax: `@username` triggers autocomplete
- Stored as plain text in content
- Automatically linked and styled when rendered
- Triggers notifications to mentioned users

**Documentation placement:**

- Add note to Field Types section under `longText` and `richText`
- Show in visual component examples
- No separate configuration section needed

### 4. Routing

**Design:**

- Flat post routes: `/posts/{id}`
- Auto-generated IDs
- Convention-based, no configuration needed

**Documentation:**

- Brief subsection "Accessing posts" in Quick Start
- Pattern only - don't detail ID format or customization
- Keep it simple: "Posts are automatically accessible at `/posts/{id}`"

### 5. Visual Components

**Component architecture:**
Three separate, composable Astro components:

1. **Post.astro**
   - Author name and timestamp
   - Post content with rendered @mentions
   - Reaction buttons and counts
   - Comment count indicator
   - Accepts props: content, author, reactions, timestamp

2. **Comment.astro**
   - Author and timestamp
   - Comment text with rendered @mentions
   - Nesting level indicator
   - Optional reactions
   - Accepts props: content, author, depth, reactions

3. **ReactionPicker.astro**
   - Emoji buttons from category config
   - Count for each reaction type
   - Highlight state for user's reaction
   - Accepts props: reactions (emoji array), counts

**File location:** `src/components/`

**Usage in documentation:**

- Import Astro components at top of `posts.mdx`
- Place examples immediately after relevant config blocks
- Compose components to show different scenarios
- Example: `<Post reactions={["🔥","🎵","💯"]} content="Check out this track! @alice" />`

## Documentation Changes

### Quick Start Section

**Add after "Creating your first post":**

#### Accessing posts

Brief explanation of `/posts/{id}` routing pattern.

**Add visual example:**
Import and show basic `<Post />` component demonstrating a simple post.

### Configuration Reference Section

**Add to Category object documentation:**

- `reactions` (array, optional) - Array of emoji strings for reaction buttons

**Update Field Types:**

- Add note to `longText`: "Supports @mentions for referencing users"
- Add note to `richText`: "Supports @mentions for referencing users"

### Examples Section

**Enhance all examples:**

- Add `reactions` array to each category configuration
- Context-appropriate emoji sets for each use case
- Add visual component after each config block showing the rendered result

**Example enhancement:**

```js
// Music sharing config
{
  id: "music",
  reactions: ["🔥", "🎵", "💯", "❤️"],
  fields: [...]
}
```

Followed by:

```mdx
<Post
  author="musiclover42"
  content="Currently listening to this amazing track! @alice you'll love this"
  reactions={["🔥", "🎵", "💯", "❤️"]}
/>
```

## Component Props API

### Post Component

```typescript
---
interface Props {
  author: string;
  content: string;
  reactions: string[];
  timestamp?: string;
  commentCount?: number;
}

const { author, content, reactions, timestamp, commentCount } = Astro.props;
---
```

### Comment Component

```typescript
---
interface Props {
  author: string;
  content: string;
  depth: number;
  reactions?: string[];
  timestamp?: string;
}

const { author, content, depth, reactions, timestamp } = Astro.props;
---
```

### ReactionPicker Component

```typescript
---
interface Props {
  reactions: string[];
  counts?: Record<string, number>;
  userReaction?: string;
}

const { reactions, counts, userReaction } = Astro.props;
---
```

## Implementation Notes

1. Components should be styled to look like actual Cohera UI (simple, clean design)
2. @mentions should render as styled links (e.g., blue text, hover effect)
3. Reactions should show emoji + count, highlight user's selection
4. Keep components simple - focus on documentation clarity, not full functionality
5. All examples should be copy-pasteable working configurations

## Success Criteria

- [ ] Users can see what posts and comments look like before building
- [ ] Reactions configuration is clear and easy to copy
- [ ] User mention capability is documented for relevant field types
- [ ] Route pattern is documented simply
- [ ] Visual examples appear inline with relevant configuration
- [ ] All existing examples updated to include reactions
