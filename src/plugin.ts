import { definePlugin } from "sanity";

import { iconType } from "@/schemas/types/icon";

/**
 * Creates the icon field type for Sanity Studio, offering the Lucide library through a searchable
 * picker and storing the chosen drawing ready to render.
 *
 * @returns Sanity plugin definition.
 * @public
 */
export const iconPlugin = definePlugin({
  name: "@driftime/sanity-plugin-icon",
  schema: {
    types: [iconType],
  },
});
