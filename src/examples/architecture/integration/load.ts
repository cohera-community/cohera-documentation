import { trpc } from "$lib/trpc/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (event) => {
  const client = trpc(event);
  return {
    posts: await client.posts.list.query(),
    events: await client.events.list.query(),
  };
};
