import { defineField, defineType } from "sanity";

import { Field } from "@/components/field";
import { Input } from "@/components/input";
import { SquareDashedIcon } from "@/icons/square-dashed";
import { createSanityIcon } from "@/lib/icons";
import { createIconPreview } from "@/lib/preview";
import { convertCase, isDefined } from "@/lib/utils";
import type { SanityIcon } from "@/types";
import { iconTypeName } from "@/types";

export const iconType = defineType({
  name: iconTypeName satisfies SanityIcon["_type"],
  type: "object",
  icon: createSanityIcon(SquareDashedIcon),
  description: "Icon chosen from the Lucide library.",
  components: { field: Field, input: Input },
  preview: {
    select: {
      name: "name",
      node: "node",
    },
    prepare(selection: { name?: string; node?: string }) {
      const { name, node } = selection;

      return {
        title: isDefined(name) ? convertCase(name, "sentence") : "No icon",
        media: createIconPreview({ _type: iconTypeName, name, node }),
      };
    },
  },
  fields: [
    defineField({
      name: "name" satisfies keyof SanityIcon,
      type: "string",
      description: "Name of the chosen icon in the library it was taken from.",
    }),
    defineField({
      name: "node" satisfies keyof SanityIcon,
      type: "text",
      description: "Shapes the icon is drawn from, written when the icon is chosen.",
    }),
  ],
});
