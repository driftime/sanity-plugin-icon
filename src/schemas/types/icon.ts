import { defineField, defineType } from "sanity";

import { Field } from "@/components/field";
import { createInput } from "@/components/input";
import { SquareDashedIcon } from "@/icons/square-dashed";
import { createSanityIcon } from "@/lib/icons";
import { createIconPreview } from "@/lib/preview";
import { convertCase, isDefined } from "@/lib/utils";
import type { SanityIconName } from "@/plugin";
import type { SanityIcon } from "@/types";
import { iconTypeName } from "@/types";

/**
 * Creates the object type an icon is stored as, offering the icons it is given to every field that
 * does not name its own.
 *
 * @param icons - Icons every field offers, or nothing to offer them all.
 * @returns An object type definition for a stored icon.
 */
export function createIconType(icons?: SanityIconName[]) {
  return defineType({
    name: iconTypeName satisfies SanityIcon["_type"],
    type: "object",
    icon: createSanityIcon(SquareDashedIcon),
    description: "Icon chosen from the Lucide library.",
    components: { field: Field, input: createInput(icons) },
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
}
