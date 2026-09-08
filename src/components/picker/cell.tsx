import { Button } from "@sanity/ui";
import type { ComponentProps } from "react";

import { Drawing } from "@/components/drawing";
import { gridCellSize } from "@/config/grid";
import type { LibraryIcon } from "@/lib/library";

export type CellProps = Omit<ComponentProps<typeof Button>, "icon" | "selected" | "onSelect" | "onClick"> & {
  icon: LibraryIcon;
  selected: boolean;
  focusable: boolean;
  position: number;
  total: number;
  onSelect: (icon: LibraryIcon) => void;
};

export function Cell({ icon, selected, focusable, position, total, onSelect, ...props }: CellProps) {
  return (
    <Button
      type="button"
      role="option"
      aria-selected={selected}
      // Stated, because counting the mounted cells would report the window rather than the library.
      aria-posinset={position}
      aria-setsize={total}
      tabIndex={focusable ? 0 : -1}
      mode="bleed"
      selected={selected}
      padding={0}
      style={{ width: gridCellSize, height: gridCellSize }}
      icon={<Drawing node={icon.node} width="1.25em" height="1.25em" strokeWidth={1.5} />}
      aria-label={icon.label}
      data-icon={icon.name}
      onClick={() => {
        onSelect(icon);
      }}
      {...props}
    />
  );
}
