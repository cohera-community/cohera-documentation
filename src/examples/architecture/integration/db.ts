import { drizzle } from "drizzle-orm/postgres-js";
import { posts } from "@cohera/posts/db";
import { events } from "@cohera/events/db";

import { COHERA_DATABASE_URL } from "$env/static/public";

const db = drizzle(postgres(COHERA_DATABASE_URL), {
  schema: { posts, events },
});
export default db;
