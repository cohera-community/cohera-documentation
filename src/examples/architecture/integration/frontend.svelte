<script lang="ts">
  import { PostCard } from "@cohera/posts/ui";
  import { EventCard } from "@cohera/events/ui";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<section>
  <h2>Recent Posts</h2>
  {#each $data.posts as post (post.id)}
    <PostCard {post} />
  {/each}
</section>

<section>
  <h2>Upcoming Events</h2>
  {#each $data.events as event (event.id)}
    <EventCard {event} />
  {/each}
</section>
