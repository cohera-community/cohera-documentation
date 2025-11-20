import { postsRouter } from "@cohera/posts/api";
import { eventsRouter } from "@cohera/events/api";

export const router = t.router({
  posts: postsRouter,
  events: eventsRouter,
});
