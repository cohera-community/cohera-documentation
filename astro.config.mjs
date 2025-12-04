// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://cohera-documentation.mrlordalfred-309.workers.dev",
  integrations: [
    starlight({
      title: "Cohera",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/cohera-community/cohera-documentation/",
        },
      ],
      sidebar: [
        {
          label: "Start Here",
          slug: "start-here",
        },
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],

  adapter: cloudflare({ imageService: "compile" }),
});
