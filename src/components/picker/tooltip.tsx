import { Stack, Text } from "@sanity/ui";
import { Popover } from "@sanity/ui/popover";
import type { ComponentProps } from "react";

import type { LibraryIcon } from "@/lib/library";
import { isDefined } from "@/lib/utils";

/** The icon a tooltip is describing, paired with the cell it points at. */
export interface HoveredIcon {
  /** Icon the cell holds. */
  icon: LibraryIcon;
  /** Cell the tooltip anchors itself to. */
  element: HTMLElement;
}

export type TooltipProps = Omit<ComponentProps<typeof Popover>, "open" | "referenceElement" | "content"> & {
  hovered: HoveredIcon | undefined;
};

export function Tooltip({ hovered, ...props }: TooltipProps) {
  return (
    <Popover
      open={isDefined(hovered)}
      referenceElement={hovered?.element ?? null}
      placement="top"
      portal
      padding={3}
      // Unstable API, and the only lever for the gap. Top only, since the tooltip sits above.
      __unstable_margins={[-4, 0, 0, 0]}
      // Portalled out of the grid, so a cursor touching it would dismiss the icon it moved onto.
      style={{ pointerEvents: "none" }}
      content={
        isDefined(hovered) && (
          <Stack gap={3} style={{ maxWidth: "16rem" }}>
            <Text size={1} weight="medium">
              {hovered.icon.label}
            </Text>
            {isDefined(hovered.icon.tags) && (
              <Text size={1} muted>
                {hovered.icon.tags}
              </Text>
            )}
          </Stack>
        )
      }
      {...props}
    />
  );
}
