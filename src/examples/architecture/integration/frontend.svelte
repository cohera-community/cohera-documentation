<script lang="ts">
  import { PostCard } from "@cohera/posts/ui";
  import { EventCard } from "@cohera/events/ui";
  import { trpc } from "$lib/trpc";

  const posts = trpc.posts.list.query();
  const events = trpc.events.list.query();
</script>

<section>
  <h2>Recent Posts</h2>
  {#each $posts.data ?? [] as post}
    <PostCard {post} />
  {/each}
</section>

<section>
  <h2>Upcoming Events</h2>
  {#each $events.data ?? [] as event}
    <EventCard {event} />
  {/each}
</section>
